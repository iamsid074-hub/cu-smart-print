import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

// Deno-compatible VAPID web-push implementation
// Uses Web Crypto API for JWT signing (no external deps)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── Base64URL helpers ────────────────────────────────────────────────────────
function base64UrlEncode(data: ArrayBuffer | string): string {
  let bytes: Uint8Array;
  if (typeof data === "string") {
    bytes = new TextEncoder().encode(data);
  } else {
    bytes = new Uint8Array(data);
  }
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function base64UrlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");
  const binary = atob(padded);
  return new Uint8Array([...binary].map((c) => c.charCodeAt(0)));
}

// ── VAPID JWT creation ───────────────────────────────────────────────────────
async function createVapidJwt(
  audience: string,
  subject: string,
  privateKeyB64: string
): Promise<string> {
  const header = base64UrlEncode(JSON.stringify({ typ: "JWT", alg: "ES256" }));
  const payload = base64UrlEncode(
    JSON.stringify({
      aud: audience,
      exp: Math.floor(Date.now() / 1000) + 12 * 3600,
      sub: subject,
    })
  );

  const signingInput = `${header}.${payload}`;

  // Import the raw P-256 private key
  const rawPrivateKey = base64UrlDecode(privateKeyB64);

  // Build PKCS8 wrapper for P-256 (sequence of OIDs + the raw key)
  const pkcs8Header = new Uint8Array([
    0x30, 0x41, 0x02, 0x01, 0x00, 0x30, 0x13, 0x06, 0x07, 0x2a, 0x86, 0x48,
    0xce, 0x3d, 0x02, 0x01, 0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x03,
    0x01, 0x07, 0x04, 0x27, 0x30, 0x25, 0x02, 0x01, 0x01, 0x04, 0x20,
  ]);
  const pkcs8 = new Uint8Array(pkcs8Header.length + rawPrivateKey.length);
  pkcs8.set(pkcs8Header);
  pkcs8.set(rawPrivateKey, pkcs8Header.length);

  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    pkcs8,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    privateKey,
    new TextEncoder().encode(signingInput)
  );

  return `${signingInput}.${base64UrlEncode(signature)}`;
}

// ── Encrypt payload for Web Push (AES-128-GCM) ─────────────────────────────
async function encryptPayload(
  payload: string,
  p256dhKey: string,
  authSecret: string
): Promise<{ ciphertext: ArrayBuffer; salt: Uint8Array; serverPublicKey: Uint8Array }> {
  const clientPublicKey = base64UrlDecode(p256dhKey);
  const clientAuthSecret = base64UrlDecode(authSecret);
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // Generate server EC key pair
  const serverKeyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"]
  );

  const serverPublicKeyRaw = new Uint8Array(
    await crypto.subtle.exportKey("raw", serverKeyPair.publicKey)
  );

  const clientKey = await crypto.subtle.importKey(
    "raw",
    clientPublicKey,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  );

  const sharedSecret = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: "ECDH", public: clientKey },
      serverKeyPair.privateKey,
      256
    )
  );

  // HKDF for auth secret
  const authInfo = new TextEncoder().encode("Content-Encoding: auth\0");
  const prk = await crypto.subtle.importKey("raw", sharedSecret, { name: "HKDF" }, false, ["deriveBits"]);

  const ikm = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: "HKDF", hash: "SHA-256", salt: clientAuthSecret, info: authInfo },
      prk,
      256
    )
  );

  // Key and nonce from salt
  const context = new Uint8Array([
    ...new TextEncoder().encode("P-256\0"),
    0, 65,
    ...clientPublicKey,
    0, 65,
    ...serverPublicKeyRaw,
  ]);

  const keyInfo = new Uint8Array([...new TextEncoder().encode("Content-Encoding: aesgcm\0"), ...context]);
  const nonceInfo = new Uint8Array([...new TextEncoder().encode("Content-Encoding: nonce\0"), ...context]);

  const baseKey = await crypto.subtle.importKey("raw", ikm, { name: "HKDF" }, false, ["deriveBits"]);

  const keyBits = await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt, info: keyInfo }, baseKey, 128);
  const nonceBits = await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt, info: nonceInfo }, baseKey, 96);

  const encryptionKey = await crypto.subtle.importKey("raw", keyBits, { name: "AES-GCM" }, false, ["encrypt"]);

  const data = new TextEncoder().encode(payload);
  const paddedData = new Uint8Array(data.length + 2);
  paddedData[0] = 0;
  paddedData[1] = 0;
  paddedData.set(data, 2);

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonceBits },
    encryptionKey,
    paddedData
  );

  return { ciphertext, salt, serverPublicKey: serverPublicKeyRaw };
}

// ── Main push sender ─────────────────────────────────────────────────────────
async function sendWebPush(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payloadStr: string,
  vapidPublicKey: string,
  vapidPrivateKey: string,
  vapidMailto: string
): Promise<Response> {
  const url = new URL(subscription.endpoint);
  const audience = `${url.protocol}//${url.host}`;

  const jwt = await createVapidJwt(audience, vapidMailto, vapidPrivateKey);
  const vapidAuthHeader = `vapid t=${jwt},k=${vapidPublicKey}`;

  const { ciphertext, salt, serverPublicKey } = await encryptPayload(
    payloadStr,
    subscription.p256dh,
    subscription.auth
  );

  const body = new Uint8Array(ciphertext);

  return fetch(subscription.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "aesgcm",
      Encryption: `salt=${base64UrlEncode(salt.buffer)}`,
      "Crypto-Key": `dh=${base64UrlEncode(serverPublicKey.buffer)};${vapidAuthHeader.split(",").find(p => p.startsWith("k="))}`,
      Authorization: `vapid t=${jwt},k=${vapidPublicKey}`,
      TTL: "86400",
    },
    body,
  });
}

// ── Serve ────────────────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { title, body, url = "/admin", tag } = await req.json();

    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
    const vapidMailto = Deno.env.get("VAPID_MAILTO") ?? "mailto:iamsid074@gmail.com";

    if (!vapidPublicKey || !vapidPrivateKey) {
      throw new Error("VAPID keys not configured");
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: subscriptions, error } = await supabaseAdmin
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth");

    if (error) throw error;

    if (!subscriptions || subscriptions.length === 0) {
      console.log("No push subscriptions found");
      return new Response(
        JSON.stringify({ sent: 0, message: "No subscriptions" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload = JSON.stringify({ title, body, url, tag });

    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        sendWebPush(sub, payload, vapidPublicKey, vapidPrivateKey, vapidMailto)
      )
    );

    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    console.log(`Push notifications: ${succeeded} sent, ${failed} failed`);

    return new Response(
      JSON.stringify({ sent: succeeded, failed }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Push notification error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
