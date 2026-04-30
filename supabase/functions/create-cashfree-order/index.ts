import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { amount, userId, customerPhone = "9999999999", bazzarOrderId, returnUrl } = await req.json();

    if (!amount || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing amount or userId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const appId = Deno.env.get("CASHFREE_APP_ID") ?? "";
    const secretKey = Deno.env.get("CASHFREE_SECRET_KEY") ?? "";
    const env = Deno.env.get("CASHFREE_ENV") || "sandbox";
    
    const baseUrl = env === "production" 
      ? "https://api.cashfree.com/pg/orders"
      : "https://sandbox.cashfree.com/pg/orders";

    // Encode order type in the Cashfree order ID for webhook routing
    const orderId = bazzarOrderId
      ? `bazzar_cart_${bazzarOrderId}`
      : `bazzar_wallet_${userId}_${Date.now()}`;

    const defaultReturnUrl = bazzarOrderId
      ? "https://www.cubazzar.shop/tracking?payment=success"
      : "https://www.cubazzar.shop/wallet?status=success";

    const orderPayload = {
      order_id: orderId,
      order_amount: parseFloat(amount),
      order_currency: "INR",
      customer_details: {
        customer_id: userId,
        customer_phone: customerPhone,
        customer_name: "CU BAZZAR User"
      },
      order_meta: {
        return_url: returnUrl || defaultReturnUrl,
      }
    };

    console.log("Creating Cashfree order:", orderPayload);

    // Make the API call to Cashfree
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": appId,
        "x-client-secret": secretKey,
        "x-api-version": "2023-08-01",
      },
      body: JSON.stringify(orderPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Cashfree API Error:", data);
      throw new Error(data.message || "Failed to create Cashfree order");
    }

    // Return the payment session id to the frontend
    return new Response(
      JSON.stringify({ 
        payment_session_id: data.payment_session_id, 
        order_id: data.order_id 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error creating order:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
