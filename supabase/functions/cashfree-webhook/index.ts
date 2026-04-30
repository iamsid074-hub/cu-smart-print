import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

// Use native Web Crypto API for HMAC — no external imports needed
async function verifySignature(
  secretKey: string,
  timestamp: string,
  rawBody: string,
  signature: string
): Promise<boolean> {
  const dataToSign = timestamp + rawBody;
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secretKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(dataToSign)
  );

  // Convert to Base64
  const computed = btoa(
    String.fromCharCode(...new Uint8Array(signatureBuffer))
  );

  return computed === signature;
}

serve(async (req) => {
  try {
    const rawBody = await req.text();
    const headers = req.headers;

    const timestamp = headers.get("x-webhook-timestamp");
    const signature = headers.get("x-webhook-signature");

    if (!timestamp || !signature) {
      return new Response("Missing signature headers", { status: 400 });
    }

    const secretKey = Deno.env.get("CASHFREE_SECRET_KEY") ?? "";

    // Verify signature using native Web Crypto
    const isValid = await verifySignature(secretKey, timestamp, rawBody, signature);

    if (!isValid) {
      console.error("Signature verification failed");
      return new Response("Invalid signature", { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    console.log("Webhook payload verified:", payload);

    // Only process successful payments
    if (payload.type === "PAYMENT_SUCCESS_WEBHOOK") {
      const orderData = payload.data.order;
      const amount = orderData.order_amount;
      const customerId = payload.data.customer_details.customer_id;

      // Initialize Supabase Admin Client to bypass RLS
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      // 1. Fetch current balance
      const { data: profile, error: fetchError } = await supabaseAdmin
        .from("profiles")
        .select("wallet_balance")
        .eq("id", customerId)
        .single();

      if (fetchError) throw fetchError;

      const newBalance = (profile.wallet_balance || 0) + amount;

      // 2. Update balance
      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({ wallet_balance: newBalance })
        .eq("id", customerId);

      if (updateError) throw updateError;

      // 3. Record transaction
      await supabaseAdmin.from("wallet_transactions").insert({
        user_id: customerId,
        amount: amount,
        type: "deposit",
        description: `Added via Cashfree (Order: ${orderData.order_id})`,
      });

      console.log(`Successfully added ₹${amount} to user ${customerId}`);
    }

    return new Response("Webhook processed successfully", { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response(`Error processing webhook: ${error.message}`, {
      status: 500,
    });
  }
});
