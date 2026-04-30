import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

  const computed = btoa(
    String.fromCharCode(...new Uint8Array(signatureBuffer))
  );

  return computed === signature;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const rawBody = await req.text();
    const headers = req.headers;

    const timestamp = headers.get("x-webhook-timestamp");
    const signature = headers.get("x-webhook-signature");

    if (!timestamp || !signature) {
      return new Response("Missing signature headers", { status: 400 });
    }

    const secretKey = Deno.env.get("CASHFREE_SECRET_KEY") ?? "";
    const isValid = await verifySignature(secretKey, timestamp, rawBody, signature);

    if (!isValid) {
      console.error("Signature verification failed");
      return new Response("Invalid signature", { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    console.log("Webhook payload verified:", payload.type, payload.data?.order?.order_id);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    if (payload.type === "PAYMENT_SUCCESS_WEBHOOK") {
      const orderData = payload.data.order;
      const amount = orderData.order_amount;
      const cashfreeOrderId = orderData.order_id;
      const customerId = payload.data.customer_details.customer_id;
      const cfPaymentId = payload.data.payment?.cf_payment_id ?? null;

      let pushTitle = "💰 New Order!";
      let pushBody = `₹${amount} received`;
      let pushUrl = "/admin";

      if (cashfreeOrderId.startsWith("bazzar_cart_")) {
        // ── Cart order payment ───────────────────────────────────────────────
        const dbOrderId = cashfreeOrderId.replace("bazzar_cart_", "");
        console.log(`Cart order payment: updating order ${dbOrderId}`);

        const { error: updateError } = await supabaseAdmin
          .from("orders")
          .update({
            payment_status: "paid",
            status: "seller_accepted",
            razorpay_payment_id: cfPaymentId,
          })
          .eq("id", dbOrderId);

        if (updateError) {
          console.error("Failed to update cart order:", updateError);
          throw updateError;
        }

        // Fetch order details for notification
        const { data: orderRow } = await supabaseAdmin
          .from("orders")
          .select("total_price, delivery_room, delivery_location")
          .eq("id", dbOrderId)
          .single();

        const roomMatch = orderRow?.delivery_room?.match(/\[ROOM:([^\]]+)\]/);
        const room = roomMatch?.[1] ?? "Unknown";

        pushTitle = "🛒 New Order Received!";
        pushBody = `₹${amount} • Room: ${room}`;
        pushUrl = "/admin";

        console.log(`Cart order ${dbOrderId} marked as paid`);

      } else {
        // ── Wallet top-up (existing logic) ──────────────────────────────────
        const { data: profile, error: fetchError } = await supabaseAdmin
          .from("profiles")
          .select("wallet_balance")
          .eq("id", customerId)
          .single();

        if (fetchError) throw fetchError;

        const newBalance = (profile.wallet_balance || 0) + amount;

        const { error: updateError } = await supabaseAdmin
          .from("profiles")
          .update({ wallet_balance: newBalance })
          .eq("id", customerId);

        if (updateError) throw updateError;

        await supabaseAdmin.from("wallet_transactions").insert({
          user_id: customerId,
          amount: amount,
          type: "deposit",
          description: `Added via Cashfree (Order: ${cashfreeOrderId})`,
        });

        pushTitle = "💳 Wallet Top-Up";
        pushBody = `₹${amount} added to user wallet`;
        pushUrl = "/admin";

        console.log(`Wallet: added ₹${amount} to user ${customerId}`);
      }

      // ── Send push notification to admin (for ALL payment types) ───────────
      try {
        const pushRes = await fetch(
          `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-push-notification`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            },
            body: JSON.stringify({
              title: pushTitle,
              body: pushBody,
              url: pushUrl,
              tag: `payment-${cashfreeOrderId}`,
            }),
          }
        );
        const pushResult = await pushRes.json();
        console.log("Push result:", pushResult);
      } catch (pushErr) {
        // Don't fail the webhook if push fails
        console.error("Push notification failed (non-fatal):", pushErr);
      }
    }

    return new Response("Webhook processed successfully", { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response(`Error processing webhook: ${error.message}`, {
      status: 500,
    });
  }
});
