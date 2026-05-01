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
      ? `https://api.cashfree.com`
      : `https://sandbox.cashfree.com`;

    const cfHeaders = {
      "x-client-id": appId,
      "x-client-secret": secretKey,
      "x-api-version": "2023-08-01",
    };

    // Initialize Supabase Admin Client early
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // ── Idempotency check: don't credit the same payment twice ──
    const { data: existingTx } = await supabaseAdmin
      .from("wallet_transactions")
      .select("id")
      .eq("user_id", userId)
      .like("description", `%${orderId}%`)
      .maybeSingle();

    if (existingTx) {
      console.log("Payment already processed:", orderId);
      return new Response(
        JSON.stringify({ success: true, alreadyProcessed: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Step 1: Fetch the ORDER details to get the amount ──
    const orderRes = await fetch(`${baseUrl}/pg/orders/${orderId}`, {
      method: "GET",
      headers: cfHeaders,
    });
    const orderData = await orderRes.json();
    console.log("Cashfree order data:", JSON.stringify(orderData));

    if (!orderRes.ok) {
      throw new Error(`Failed to fetch order from Cashfree: ${orderData.message}`);
    }

    const orderStatus = orderData.order_status;
    const orderAmount = parseFloat(orderData.order_amount);

    // ── Step 2: Fetch payments list to confirm payment_status ──
    const paymentsRes = await fetch(`${baseUrl}/pg/orders/${orderId}/payments`, {
      method: "GET",
      headers: cfHeaders,
    });
    const payments = await paymentsRes.json();
    console.log("Cashfree payments:", JSON.stringify(payments));

    const successPayment = Array.isArray(payments)
      ? payments.find((p: any) => p.payment_status === "SUCCESS")
      : null;

    // Accept if order is PAID or at least one payment succeeded
    const isPaid = orderStatus === "PAID" || successPayment !== null;

    if (!isPaid) {
      return new Response(
        JSON.stringify({
          success: false,
          message: `Order status: ${orderStatus}. No successful payment found.`
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use payment_amount from the payment object, fallback to order_amount
    const amount = parseFloat(successPayment?.payment_amount ?? orderAmount);

    if (!amount || amount <= 0) {
      throw new Error(`Invalid payment amount: ${amount}`);
    }

    // ── Step 3: Fetch current wallet balance ──
    const { data: profile, error: fetchError } = await supabaseAdmin
      .from("profiles")
      .select("wallet_balance")
      .eq("id", userId)
      .single();

    if (fetchError) throw fetchError;

    const newBalance = (profile.wallet_balance || 0) + amount;

    // ── Step 4: Update wallet balance ──
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ wallet_balance: newBalance })
      .eq("id", userId);

    if (updateError) throw updateError;

    // ── Step 5: Record the transaction ──
    await supabaseAdmin.from("wallet_transactions").insert({
      user_id: userId,
      amount: amount,
      type: "deposit",
      description: `Added via Cashfree (Order: ${orderId})`,
    });

    console.log(`✅ Successfully added ₹${amount} to user ${userId}. New balance: ₹${newBalance}`);

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
