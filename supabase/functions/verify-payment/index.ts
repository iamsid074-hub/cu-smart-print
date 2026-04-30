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
    const { orderId, userId } = await req.json();

    if (!orderId || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing orderId or userId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const appId = Deno.env.get("CASHFREE_APP_ID") ?? "";
    const secretKey = Deno.env.get("CASHFREE_SECRET_KEY") ?? "";
    const env = Deno.env.get("CASHFREE_ENV") || "sandbox";

    const baseUrl = env === "production"
      ? `https://api.cashfree.com/pg/orders/${orderId}/payments`
      : `https://sandbox.cashfree.com/pg/orders/${orderId}/payments`;

    // Query Cashfree for payment status
    const response = await fetch(baseUrl, {
      method: "GET",
      headers: {
        "x-client-id": appId,
        "x-client-secret": secretKey,
        "x-api-version": "2023-08-01",
      },
    });

    const payments = await response.json();
    console.log("Cashfree payment status response:", payments);

    if (!response.ok) {
      throw new Error("Failed to fetch payment status from Cashfree");
    }

    // Find a successful payment
    const successPayment = Array.isArray(payments)
      ? payments.find((p: any) => p.payment_status === "SUCCESS")
      : null;

    if (!successPayment) {
      return new Response(
        JSON.stringify({ success: false, message: "No successful payment found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const amount = successPayment.order_amount ?? successPayment.payment_amount;

    // Initialize Supabase Admin Client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check if we already processed this payment (idempotency check)
    const { data: existingTx } = await supabaseAdmin
      .from("wallet_transactions")
      .select("id")
      .eq("user_id", userId)
      .like("description", `%${orderId}%`)
      .maybeSingle();

    if (existingTx) {
      console.log("Payment already processed:", orderId);
      return new Response(
        JSON.stringify({ success: true, alreadyProcessed: true, amount }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch current balance
    const { data: profile, error: fetchError } = await supabaseAdmin
      .from("profiles")
      .select("wallet_balance")
      .eq("id", userId)
      .single();

    if (fetchError) throw fetchError;

    const newBalance = (profile.wallet_balance || 0) + amount;

    // Update wallet balance
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ wallet_balance: newBalance })
      .eq("id", userId);

    if (updateError) throw updateError;

    // Record transaction
    await supabaseAdmin.from("wallet_transactions").insert({
      user_id: userId,
      amount: amount,
      type: "deposit",
      description: `Added via Cashfree (Order: ${orderId})`,
    });

    console.log(`Successfully added ₹${amount} to user ${userId}`);

    return new Response(
      JSON.stringify({ success: true, amount, newBalance }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Verify payment error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
