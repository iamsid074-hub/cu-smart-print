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
    const { amount, userId, customerPhone = "9999999999" } = await req.json();

    if (!amount || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing amount or userId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get Cashfree credentials from environment variables
    const appId = Deno.env.get("CASHFREE_APP_ID") || "test_app_id"; // Replace with your test app id
    const secretKey = Deno.env.get("CASHFREE_SECRET_KEY") || "test_secret_key"; // Replace with your test secret key
    const env = Deno.env.get("CASHFREE_ENV") || "sandbox"; // "sandbox" or "production"
    
    const baseUrl = env === "production" 
      ? "https://api.cashfree.com/pg/orders"
      : "https://sandbox.cashfree.com/pg/orders";

    // Generate a unique order ID
    const orderId = `order_${userId}_${Date.now()}`;

    // Create the order payload
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
        return_url: "https://www.cubazzar.shop/wallet?status=success",
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
