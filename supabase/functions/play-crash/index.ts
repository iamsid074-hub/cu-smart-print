import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Convert buffer to hex string
function buf2hex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)].map(x => x.toString(16).padStart(2, '0')).join('');
}

// Web Crypto API for HMAC SHA-256
async function generateCrashPoint(serverSeed: string, clientSeed: string, nonce: number): Promise<number> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(serverSeed),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(`${clientSeed}-${nonce}`)
  );
  
  const hash = buf2hex(signature);
  
  // 4% House Edge: If the hash is divisible by 25 (4% probability), instant crash at 1.00x
  if (parseInt(hash.substring(0, 8), 16) % 25 === 0) {
    return 1.00;
  }

  // Otherwise, calculate crash point
  const h = parseInt(hash.substring(0, 13), 16);
  const e = Math.pow(2, 52);
  const result = Math.floor((100 * e - h) / (e - h)) / 100;
  
  return Math.max(1.00, result);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { action, betAmount, cashoutMultiplier, serverSeed, clientSeed, nonce } = await req.json();

    // Init Supabase Admin
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get user from Auth header
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) throw new Error("Unauthorized");

    // Fetch user profile
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("wallet_balance")
      .eq("id", user.id)
      .single();

    if (!profile) throw new Error("Profile not found");

    if (action === "bet") {
      if (profile.wallet_balance < betAmount) {
        throw new Error("Insufficient funds");
      }

      // Deduct bet
      const newBalance = profile.wallet_balance - betAmount;
      await supabaseClient.from("profiles").update({ wallet_balance: newBalance }).eq("id", user.id);

      // Generate actual crash point secretly
      const actualCrashPoint = await generateCrashPoint(serverSeed, clientSeed, nonce);
      
      // Determine if they won
      const isWin = cashoutMultiplier <= actualCrashPoint;
      const payout = isWin ? betAmount * cashoutMultiplier : 0;

      // If they won, credit the payout
      if (isWin) {
        await supabaseClient.from("profiles").update({ wallet_balance: newBalance + payout }).eq("id", user.id);
        
        // Log transaction
        await supabaseClient.from("wallet_transactions").insert({
          user_id: user.id,
          amount: payout - betAmount,
          type: "deposit",
          description: `Crash Game Win (x${cashoutMultiplier})`
        });
      } else {
        // Log loss
        await supabaseClient.from("wallet_transactions").insert({
          user_id: user.id,
          amount: -betAmount,
          type: "usage",
          description: `Crash Game Loss`
        });
      }

      // Insert game bet record
      await supabaseClient.from("game_bets").insert({
        user_id: user.id,
        game: "crash",
        bet_amount: betAmount,
        payout: payout,
        multiplier: isWin ? cashoutMultiplier : 0,
        is_win: isWin,
        server_seed: serverSeed,
        client_seed: clientSeed
      });

      return new Response(
        JSON.stringify({
          success: true,
          actualCrashPoint,
          isWin,
          payout,
          newBalance: isWin ? newBalance + payout : newBalance
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response("Invalid action", { status: 400, headers: corsHeaders });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
