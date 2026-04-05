// Cashfree helpers — create order + verify payment + load SDK

const API_BASE = ""; // same origin (Vercel serverless)

// â”€â”€â”€ Create Cashfree Order â”€â”€â”€
export async function createCashfreeOrder(params: {
  amount: number;
  customer_id: string;
  customer_phone: string;
  customer_name?: string;
  customer_email?: string;
  order_note?: string;
}): Promise<{
  payment_session_id: string;
  cf_order_id: string;
  order_id: string;
}> {
  const res = await fetch(`${API_BASE}/api/cashfree-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create payment order");
  return data;
}

// â”€â”€â”€ Verify Payment â”€â”€â”€
export async function verifyCashfreePayment(orderId: string): Promise<{
  verified: boolean;
  order_status: string;
  order_id: string;
  cf_order_id: string;
  order_amount: number;
}> {
  const res = await fetch(
    `${API_BASE}/api/cashfree-verify?order_id=${encodeURIComponent(orderId)}`
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to verify payment");
  return data;
}

// â”€â”€â”€ Load Cashfree JS SDK â”€â”€â”€
let sdkPromise: Promise<any> | null = null;

export function loadCashfreeSDK(): Promise<any> {
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    // Check if already loaded
    if ((window as any).Cashfree) {
      const env = import.meta.env.VITE_CASHFREE_ENV || "sandbox";
      resolve(
        (window as any).Cashfree({
          mode: env === "production" ? "production" : "sandbox",
        })
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.async = true;
    script.onload = () => {
      const env = import.meta.env.VITE_CASHFREE_ENV || "sandbox";
      const cashfree = (window as any).Cashfree({
        mode: env === "production" ? "production" : "sandbox",
      });
      resolve(cashfree);
    };
    script.onerror = () => {
      sdkPromise = null;
      reject(new Error("Failed to load Cashfree SDK"));
    };
    document.head.appendChild(script);
  });

  return sdkPromise;
}
