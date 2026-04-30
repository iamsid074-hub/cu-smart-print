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

// Fisher-Yates shuffle using provably fair seed
async function generateMinesGrid(serverSeed: string, clientSeed: string, nonce: number, numMines: number): Promise<boolean[]> {
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
  
  // Create an array of 25 items, with `numMines` true values
  let grid = Array(25).fill(false);
  for (let i = 0; i < numMines; i++) {
    grid[i] = true;
  }
  
  // Seeded shuffle
  let seedNum = parseInt(hash.substring(0, 16), 16);
  for (let i = grid.length - 1; i > 0; i--) {
    // Generate pseudorandom number from seed
    seedNum = (seedNum * 1103515245 + 12345) % 2147483648;
    const j = seedNum % (i + 1);
    [grid[i], grid[j]] = [grid[j], grid[i]];
  }
  
  return grid;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { action, betAmount, numMines, tilesToReveal, serverSeed, clientSeed, nonce } = await req.json();

    // Init Supabase Admin
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) throw new Error("Unauthorized");

    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("wallet_balance")
      .eq("id", user.id)
      .single();

    if (!profile) throw new Error("Profile not found");

    if (action === "play") {
      if (profile.wallet_balance < betAmount) {
        throw new Error("Insufficient funds");
      }

      // Deduct bet immediately
      const newBalance = profile.wallet_balance - betAmount;
      await supabaseClient.from("profiles").update({ wallet_balance: newBalance }).eq("id", user.id);

      // Generate actual grid secretly
      const grid = await generateMinesGrid(serverSeed, clientSeed, nonce, numMines);
      
      // Check if any revealed tile is a mine
      let isWin = true;
      let hitMineIndex = -1;
      
      for (const tileIndex of tilesToReveal) {
        if (grid[tileIndex]) {
          isWin = false;
          hitMineIndex = tileIndex;
          break;
        }
      }

      // Calculate multiplier (simplified calculation with house edge)
      // Standard combination math for Mines payout
      // Payout = (25 nCr count) / (25-mines nCr count) * (1 - 0.04 house edge)
      const factorial = (n: number): number => n <= 1 ? 1 : n * factorial(n - 1);
      const combinations = (n: number, r: number) => factorial(n) / (factorial(r) * factorial(n - r));
      
      let multiplier = 0;
      let payout = 0;
      
      if (isWin && tilesToReveal.length > 0) {
        const totalWays = combinations(25, tilesToReveal.length);
        const winningWays = combinations(25 - numMines, tilesToReveal.length);
        multiplier = (totalWays / winningWays) * 0.96; // 4% edge
        payout = betAmount * multiplier;
      }

      // If they won, credit the payout
      if (isWin && payout > 0) {
        await supabaseClient.from("profiles").update({ wallet_balance: newBalance + payout }).eq("id", user.id);
        
        await supabaseClient.from("wallet_transactions").insert({
          user_id: user.id,
          amount: payout - betAmount,
          type: "deposit",
          description: `Mines Win (x${multiplier.toFixed(2)})`
        });
      } else if (!isWin) {
        await supabaseClient.from("wallet_transactions").insert({
          user_id: user.id,
          amount: -betAmount,
          type: "usage",
          description: `Mines Loss`
        });
      }

      // Insert game bet record
      await supabaseClient.from("game_bets").insert({
        user_id: user.id,
        game: "mines",
        bet_amount: betAmount,
        payout: payout,
        multiplier: isWin ? multiplier : 0,
        is_win: isWin,
        server_seed: serverSeed,
        client_seed: clientSeed
      });

      return new Response(
        JSON.stringify({
          success: true,
          grid,
          isWin,
          multiplier,
          payout,
          hitMineIndex,
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
