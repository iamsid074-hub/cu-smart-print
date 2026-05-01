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
    
    // Admin client to perform deletions (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Regular client to verify the user
    const supabaseClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get the user from the JWT to verify they are deleting themselves
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      throw new Error("Unauthorized: Could not verify user identity.");
    }

    const userId = user.id;
    console.log(`[DELETE_ACCOUNT] Initiating comprehensive deletion for user: ${userId}`);

    // ── STEP 1: Delete all dependent data in correct order ──

    // 1. Delete messages (Sent and Received)
    console.log(`[DELETE_ACCOUNT] Clearing messages...`);
    await supabaseAdmin.from("messages").delete().or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

    // 2. Delete wallet_transactions
    console.log(`[DELETE_ACCOUNT] Clearing wallet_transactions...`);
    await supabaseAdmin.from("wallet_transactions").delete().eq("user_id", userId);

    // 3. Delete products (Listings)
    console.log(`[DELETE_ACCOUNT] Clearing products...`);
    await supabaseAdmin.from("products").delete().eq("seller_id", userId);

    // 4. Delete orders (Buyer and Seller roles)
    console.log(`[DELETE_ACCOUNT] Clearing orders...`);
    await supabaseAdmin.from("orders").delete().or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);

    // 5. Delete push_subscriptions
    console.log(`[DELETE_ACCOUNT] Clearing push_subscriptions...`);
    await supabaseAdmin.from("push_subscriptions").delete().eq("user_id", userId);

    // 6. Delete admin_notifications if applicable
    console.log(`[DELETE_ACCOUNT] Clearing admin_notifications...`);
    // Note: If payload contains the ID, this might be tricky, but usually it's just strings.
    // For now, we skip or do a simple check if possible.

    // 7. Finally delete the Profile
    console.log(`[DELETE_ACCOUNT] Clearing profile...`);
    await supabaseAdmin.from("profiles").delete().eq("id", userId);

    // ── STEP 2: Delete from auth.users ──
    console.log(`[DELETE_ACCOUNT] Deleting from auth.users...`);
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authDeleteError) {
      console.error("[DELETE_ACCOUNT] Auth deletion error:", authDeleteError);
      throw new Error(`Auth deletion failed: ${authDeleteError.message}`);
    }

    console.log(`[DELETE_ACCOUNT] Successfully deleted account for ${userId}`);

    return new Response(JSON.stringify({ success: true, message: "Account deleted successfully." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("[DELETE_ACCOUNT] Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
