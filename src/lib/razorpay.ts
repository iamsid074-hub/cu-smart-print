/**
 * Razorpay integration helper — client-side checkout
 * Loads the Razorpay script dynamically and opens the checkout window.
 */

declare global {
    interface Window {
        Razorpay: any;
    }
}

export interface RazorpayPaymentResult {
    razorpay_payment_id: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
}

export interface RazorpayOptions {
    amount: number;          // in ₹ (will be converted to paise)
    orderId?: string;        // optional Razorpay order ID
    name?: string;
    email?: string;
    phone?: string;
    description?: string;
}

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || "";

/** Loads the Razorpay script if not already loaded */
function loadRazorpayScript(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (window.Razorpay) { resolve(); return; }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
        document.body.appendChild(script);
    });
}

/** Opens Razorpay checkout and returns payment result */
export async function openRazorpayCheckout(opts: RazorpayOptions): Promise<RazorpayPaymentResult> {
    if (!RAZORPAY_KEY) {
        throw new Error("Razorpay key not configured. Add VITE_RAZORPAY_KEY_ID to .env.local");
    }

    await loadRazorpayScript();

    return new Promise((resolve, reject) => {
        const options = {
            key: RAZORPAY_KEY,
            amount: Math.round(opts.amount * 100), // paise
            currency: "INR",
            name: "CU BAZZAR",
            description: opts.description || "Order Payment",
            order_id: opts.orderId || undefined,
            prefill: {
                name: opts.name || "",
                email: opts.email || "",
                contact: opts.phone || "",
            },
            theme: {
                color: "#FF6B6B",
                backdrop_color: "rgba(10,5,5,0.85)",
            },
            modal: {
                ondismiss: () => reject(new Error("Payment cancelled")),
                confirm_close: true,
            },
            handler: (response: RazorpayPaymentResult) => {
                resolve(response);
            },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", (response: any) => {
            reject(new Error(response.error?.description || "Payment failed"));
        });
        rzp.open();
    });
}
