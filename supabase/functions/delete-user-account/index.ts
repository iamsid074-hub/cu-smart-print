import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization")!;
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const supabaseClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    // 1. Get the user from the JWT
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      console.error("[DELETE_ACCOUNT] User verification failed:", authError);
      // If we can't find the user, it might be they are already deleted.
      // But we need a valid JWT to verify the request.
      return new Response(JSON.stringify({ error: "Authentication failed. Please log in again." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const userId = user.id;
    console.log(`[DELETE_ACCOUNT] Comprehensive wipe for: ${userId}`);

    // 2. Perform deletions in a specific order to minimize constraint issues
    const tables = [
      { name: "messages", col: ["sender_id", "receiver_id"] },
      { name: "wallet_transactions", col: ["user_id"] },
      { name: "products", col: ["seller_id"] },
      { name: "orders", col: ["buyer_id", "seller_id"] },
      { name: "push_subscriptions", col: ["user_id"] },
      { name: "profiles", col: ["id"] },
    ];

    for (const table of tables) {
      try {
        if (table.col.length === 1) {
          await supabaseAdmin.from(table.name).delete().eq(table.col[0], userId);
        } else {
          const filter = table.col.map(c => `${c}.eq.${userId}`).join(",");
          await supabaseAdmin.from(table.name).delete().or(filter);
        }
        console.log(`[DELETE_ACCOUNT] Cleaned table: ${table.name}`);
      } catch (e: any) {
        console.warn(`[DELETE_ACCOUNT] Failed cleaning ${table.name}:`, e.message);
      }
    }

    // 3. Final deletion from auth.users
    console.log(`[DELETE_ACCOUNT] Deleting from auth.users...`);
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      // Check if user is already gone
      if (deleteError.message.includes("not found")) {
        console.log(`[DELETE_ACCOUNT] User already deleted from auth.`);
      } else {
        console.error("[DELETE_ACCOUNT] Final deletion error:", deleteError.message);
        throw deleteError;
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("[DELETE_ACCOUNT] Fatal error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
