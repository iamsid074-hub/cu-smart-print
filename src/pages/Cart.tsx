import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Loader2,
  MapPin,
  Navigation,
  Phone,
  Clock,
  ShoppingBag,
  CheckCircle,
  Truck,
  Package,
  PackageCheck,
  Zap,
  MessageSquare,
  AlertTriangle,
  Wallet,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import PaymentSelector from "@/components/PaymentSelector";
import RiskAlert, { RiskEvaluation } from "@/components/RiskAlert";
import { evaluateOrderRisk } from "@/lib/risk";
import { VirtualCardSwipePayment } from "@/components/VirtualCardSwipePayment";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useMembership } from "@/hooks/useMembership";
import MembershipUpsell from "@/components/MembershipUpsell";
import { load } from "@cashfreepayments/cashfree-js";

export default function Cart() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    rapidAddDetected,
  } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const {
    data: locationData,
    saveLocation,
    isLoaded: locationLoaded,
  } = useUserLocation();
  const { hasFreeDelivery, remainingDeliveries, incrementUsage, plan } =
    useMembership();

  const [showCheckout, setShowCheckout] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

  // Auto-open checkout if returning from location setup
  useEffect(() => {
    if (searchParams.get('returnTo') === 'checkout' && locationLoaded && locationData?.hostel && locationData?.room && locationData?.phone) {
      setShowCheckout(true);
    }
  }, [searchParams, locationLoaded, locationData]);

  // Derive hostel/room/phone from location data
  const hostel = locationData?.hostel || profile?.hostel_block || '';
  const room = locationData?.room || profile?.room_number || '';
  const phone = locationData?.phone || profile?.phone_number || '';



  // Sync floor whenever room changes
  const derivedFloor = useMemo(() => {
    if (room && room.length > 0) {
      const firstDigit = parseInt(room[0]);
      if (!isNaN(firstDigit) && firstDigit > 0) {
        return firstDigit;
      }
    }
    return 1;
  }, [room]);

  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod" | "virtual_card">(
    "online"
  );
  const floor = derivedFloor;
  const [submitting, setSubmitting] = useState(false);

  // Risk Detection State
  const [riskEval, setRiskEval] = useState<RiskEvaluation | null>(null);
  const [showRiskAlert, setShowRiskAlert] = useState(false);



  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  // ── Cashfree Payment State ──
  const [cashfree, setCashfree] = useState<any>(null);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    const initCashfree = async () => {
      try {
        const cf = await load({ mode: "production" });
        setCashfree(cf);
      } catch (err) {
        console.error("Failed to load Cashfree SDK:", err);
      }
    };
    initCashfree();
  }, []);

  // ── Handle return from Cashfree ──
  useEffect(() => {
    if (!user) return;
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    const pendingOrderId = localStorage.getItem(`pending_cart_order_${user.id}`);

    if (status === "success" && pendingOrderId) {
      localStorage.removeItem(`pending_cart_order_${user.id}`);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      const finalizePaidOrder = async () => {
        try {
          setSubmitting(true);
          // Verify payment first
          const { data, error } = await supabase.functions.invoke("verify-payment", {
            body: { orderId: pendingOrderId, userId: user.id },
          });

          if (error || !data?.success) {
            throw new Error("Payment verification failed. If money was deducted, contact support.");
          }

          // Create the actual order in our system
          await createOrder();
          toast({
            title: "Payment successful! 🎉",
            description: "Your order has been placed successfully.",
          });
          navigate('/tracking');
        } catch (err: any) {
          toast({
            title: "Verification failed",
            description: err.message,
            variant: "destructive",
          });
        } finally {
          setSubmitting(false);
        }
      };
      
      finalizePaidOrder();
    }
  }, [user, navigate]);

  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [loadingOrder, setLoadingOrder] = useState(true);

  const [walletBalance, setWalletBalance] = useState(0);
  const [profileName, setProfileName] = useState("");
  const [dailyWalletUsed, setDailyWalletUsed] = useState(0);
  const [useWalletBalance, setUseWalletBalance] = useState(false);
  const [totalOrdersTracker, setTotalOrdersTracker] = useState(0);

  useEffect(() => {
    if (!user) {
      setLoadingOrder(false);
      return;
    }

    const fetchActiveOrder = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, status, products(title)")
        .eq("buyer_id", user.id)
        .in("status", [
          "pending",
          "seller_accepted",
          "confirmed",
          "picked",
          "delivering",
        ])
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        setActiveOrder(data);
      } else {
        setActiveOrder(null);
      }
      setLoadingOrder(false);
    };

    const fetchWallet = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("wallet_balance, total_orders, hostel_block, full_name")
        .eq("id", user.id)
        .single();
      if (data) {
        setWalletBalance(data.wallet_balance || 0);
        setTotalOrdersTracker(data.total_orders || 0);
        setProfileName(data.full_name || user?.user_metadata?.full_name || "CU USER");
      }

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const { data: txData } = await supabase
        .from("wallet_transactions")
        .select("amount")
        .eq("user_id", user.id)
        .eq("type", "usage")
        .gte("created_at", startOfDay.toISOString());

      if (txData) {
        const used = txData.reduce(
          (acc, tx) => acc + Math.abs(tx.amount || 0),
          0
        );
        setDailyWalletUsed(used);
      }
    };

    fetchActiveOrder();
    fetchWallet();

    const subscription = supabase
      .channel("cart_active_orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          fetchActiveOrder();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  const hasVending = useMemo(() => items.some((item) => item.category === "Vending Machine"), [items]);
  const isFoodOrder = useMemo(() => !items.some(
    (item) =>
      item.category === "Vending Machine" ||
      item.category?.toLowerCase() === "grocery"
  ), [items]);

  const calculateVendingDelivery = (f: number) => {
    if (f <= 3) return 15;
    if (f <= 6) return 22;
    if (f <= 9) return 30;
    return 35;
  };

  const originalDeliveryFee = 37;
  const standardDeliveryFee = 30;

  // A "Food Shop" item is any item that is NOT from the Vending Machine or Grocery
  const hasFoodShopItem = useMemo(() => items.some(
    (item) =>
      item.category !== "Vending Machine" &&
      item.category?.toLowerCase() !== "grocery"
  ), [items]);

  const hasQuickItem = useMemo(() => items.some(
    (item) => (item as any).id?.startsWith("grocery-") || (item as any).is_quick
  ), [items]);

  const hasFlavourCombo = useMemo(() => items.some(
    (item) => item.id === "flavour-factory-combo"
  ), [items]);

  // Logic: If there's a quick item, flat rate 50.
  // If there's a food shop item, use standard flat rate.
  // Only if it's EXCLUSIVELY Vending, use the tiered vending fee.
  const baseDelivery = useMemo(() => {
    if (hasQuickItem) {
      return 50;
    }
    if (hasFoodShopItem) {
      return standardDeliveryFee;
    }
    return calculateVendingDelivery(floor);
  }, [hasQuickItem, hasFoodShopItem, floor]);

  const deliveryFee = useMemo(() => (hasFreeDelivery
    ? 0
    : paymentMethod === "cod"
    ? 49
    : baseDelivery), [hasFreeDelivery, paymentMethod, baseDelivery]);

  const displayedDeliveryFee = useMemo(() => (
    paymentMethod === "cod"
      ? 49
      : hasQuickItem
      ? 50
      : hasFoodShopItem
      ? standardDeliveryFee
      : calculateVendingDelivery(floor)), [paymentMethod, hasQuickItem, hasFoodShopItem, floor]);

  const maxWalletUsagePerDay = 50;
  const availableToday = Math.max(0, maxWalletUsagePerDay - dailyWalletUsed);
  const usableWalletBalance = useMemo(() => (isFoodOrder
    ? Math.min(walletBalance, availableToday)
    : 0), [isFoodOrder, walletBalance, availableToday]);

  // Wallet Logic
  const { walletDiscount, orderTotal } = useMemo(() => {
    let rawT = totalPrice + deliveryFee;
    let wd = 0;
    let ot = rawT;

    if (useWalletBalance && usableWalletBalance > 0) {
      if (usableWalletBalance >= rawT) {
        wd = rawT;
        ot = 0;
      } else {
        wd = usableWalletBalance;
        ot = rawT - usableWalletBalance;
      }
    }
    return { walletDiscount: wd, orderTotal: ot };
  }, [totalPrice, deliveryFee, useWalletBalance, usableWalletBalance]);

  const phoneClean = phone.replace(/\D/g, "");
  const isPhoneValid = phoneClean.length === 10;

  const isRoomCorrect = room.startsWith(floor.toString());
  const hasLocation = hostel.trim() !== '' && room.trim() !== '' && isPhoneValid;
  const isFormValid =
    hasLocation &&
    (hasVending ? isRoomCorrect : true);

  const createOrder = async (paymentId?: string) => {
    const itemsSummary = items
      .map(
        (i) =>
          `${i.quantity}x ${i.title || (i as any).name || "Unnamed Item"} [IMG:${i.image}] (${i.category}) (₹${i.price})`
      )
      .join("\n");

    // Include safety disclaimer in the items block so it doesn't break the [ITEMS:...] | [ROOM:...] parsing regex
    const fullItemsString = `${itemsSummary}\n\n[SAFETY:Disclaimer Accepted @ ${new Date().toISOString()}]`;

    // 1. Ensure Profile Exists (Auto-fix for missing profiles / Foreign Key error 23503)
    // IMPORTANT: Only update phone_number and hostel_block — NEVER overwrite full_name
    // because the user may have manually set their name in Profile settings.
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user!.id)
      .maybeSingle();

    await supabase.from("profiles").upsert(
      {
        id: user!.id,
        // Only fall back to Google name if profile has no name at all
        full_name: existingProfile?.full_name ||
          user?.user_metadata?.full_name ||
          user?.email?.split("@")[0] ||
          "Student",
        phone_number: phoneClean,
        hostel_block: hostel,
      },
      { onConflict: "id" }
    );

    const { data, error } = await supabase.from("orders").insert({
      product_id: null,
      buyer_id: user!.id,
      seller_id: "7450c873-f51d-469e-a33d-c44ca80beb0c",
      base_price: totalPrice,
      commission: 0,
      delivery_charge: deliveryFee,
      total_price: orderTotal,
      delivery_location: `${hostel} - Floor ${floor}`,
      delivery_room: `[ROOM:${room}] | [ITEMS:${fullItemsString}]`,
      buyer_phone: phoneClean,
      status: "pending",
      payment_method: paymentMethod === "online" ? "cashfree" : paymentMethod === "virtual_card" ? "virtual_card" : "cod",
      payment_status: (paymentMethod === "online" || paymentMethod === "virtual_card") ? "paid" : "pending",
      razorpay_payment_id: paymentId || null,
      is_quick: hasQuickItem,
      seller_notified_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Supabase Insert Error:", error);
      throw error;
    }

    // Apply Free Delivery limit deduction
    if (hasFreeDelivery) {
      await incrementUsage();
    }

    // Wallet Deduction
    if (useWalletBalance && walletDiscount > 0) {
      const newBalance = walletBalance - walletDiscount;
      await supabase
        .from("profiles")
        .update({ wallet_balance: newBalance })
        .eq("id", user!.id);
      await supabase.from("wallet_transactions").insert({
        user_id: user!.id,
        amount: -walletDiscount,
        type: "usage",
        description: "Used balance for order",
      });
    }

    // Virtual Card Wallet Deduction
    if (paymentMethod === "virtual_card") {
      const newBalance = walletBalance - orderTotal;
      await supabase
        .from("profiles")
        .update({ wallet_balance: newBalance })
        .eq("id", user!.id);
      await supabase.from("wallet_transactions").insert({
        user_id: user!.id,
        amount: -orderTotal,
        type: "usage",
        description: "Paid with Virtual Card",
      });
    }

    // Save location for future auto-fill
    saveLocation({ hostel, room, phone: phoneClean });

    // Clean up UI and state
    clearCart();
    setShowCheckout(false);
    setShowUpiModal(false);

    // Redirect to tracking
    navigate(`/tracking`);
  };

  const handleProceedToCheckout = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!hasLocation) {
      setShowLocationPrompt(true);
      return;
    }
    setShowCheckout(true);
  };

  const handleCheckout = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!isFormValid) return;

    // 1. Evaluate Smart Risk
    const evaluation = evaluateOrderRisk(
      orderTotal,
      totalOrdersTracker,
      user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Student"
    );

    // 2. High Priority Block: Rapid Adding (Spam)
    if (rapidAddDetected) {
      setRiskEval({
        isBlocked: true,
        requiresConfirmation: false,
        level: "high",
        reason:
          "Suspicious activity detected (rapid item additions). Checkout is temporarily limited to prevent automated spam. Please wait a few moments.",
      });
      setShowRiskAlert(true);
      return;
    }

    // 3. Handle Risk Evaluation Results
    if (evaluation.isBlocked || evaluation.requiresConfirmation) {
      setRiskEval(evaluation);
      setShowRiskAlert(true);
      return;
    }

    // 4. Safe Flow: Show disclaimer
    setDisclaimerAccepted(false);
    setShowDisclaimer(true);
  };

  const handleRiskConfirmed = () => {
    setShowRiskAlert(false);
    setRiskEval(null);
    // Proceed to disclaimer after confirming risk
    setDisclaimerAccepted(false);
    setShowDisclaimer(true);
  };

  const handleDisclaimerAccepted = async () => {
    setShowDisclaimer(false);
    if (paymentMethod === "online" && orderTotal > 0) {
      if (!user) return;
      setIsPaying(true);
      try {
        const { data, error } = await supabase.functions.invoke('create-cashfree-order', {
          body: { 
            amount: orderTotal.toString(), 
            userId: user.id,
            customerPhone: phone || "9999999999",
            customerName: user.user_metadata?.full_name || "CU User",
            returnUrl: `${window.location.origin}/cart?status=success`
          },
        });

        if (error) throw error;

        if (data.order_id) {
          localStorage.setItem(`pending_cart_order_${user.id}`, data.order_id);
        }

        if (cashfree && data.order_token) {
          cashfree.checkout({
            paymentSessionId: data.order_token,
            redirectTarget: "_self",
          });
        }
      } catch (err: any) {
        toast({
          title: "Payment error",
          description: err.message || "Failed to initiate payment.",
          variant: "destructive"
        });
      } finally {
        setIsPaying(false);
      }
    } else if (paymentMethod === "virtual_card") {
      // Virtual Card handles its own success in onSuccess callback
      // We do nothing here, the swipe UI is active
    } else {
      // Cash on Gate Flow
      try {
        setSubmitting(true);
        await createOrder();
        toast({
          title: "Order placed! 🎉",
          description: "First money, then order. Collect at gate.",
        });
      } catch (err: any) {
        toast({
          title: "Order failed",
          description: err.message || "Please try again.",
          variant: "destructive",
        });
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleVirtualCardSuccess = async () => {
    try {
      setSubmitting(true);
      await createOrder();
      toast({
        title: "Payment successful! 🎉",
        description: "Paid using Virtual Card.",
      });
    } catch (err: any) {
      toast({
        title: "Order failed",
        description: err.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

    return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 pb-32 px-4 sm:px-6 font-sans">
      <div className="h-28" /> {/* Safe area for Dynamic Island */}
      {/* Risk Detection Alert */}
      <RiskAlert
        isOpen={showRiskAlert}
        onClose={() => setShowRiskAlert(false)}
        onConfirm={handleRiskConfirmed}
        level={riskEval?.level || "low"}
        reason={riskEval?.reason || ""}
        isBlocked={riskEval?.isBlocked || false}
      />

      {/* Food Safety Disclaimer Modal */}
      {showDisclaimer && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.4)" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden mx-2"
          >
            {/* Header */}
            <div className="bg-amber-50 px-5 pt-5 pb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-slate-900 font-bold text-[16px] leading-tight">
                  Safety &amp; Responsibility
                </h2>
                <p className="text-slate-500 text-[12px] mt-0.5 font-medium">
                  Please review before placing your order
                </p>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="px-5 py-4 max-h-[30vh] overflow-y-auto space-y-3 text-[13px] text-slate-600 leading-relaxed font-medium">
              <p>
                By placing this order, you acknowledge that food items may
                contain <strong className="text-slate-900">allergens or ingredients</strong> that could cause health reactions.
              </p>
              <p>
                While we strive to maintain quality standard, <strong className="text-slate-900">CU Bazzar and its partners</strong> are not liable for individual allergic reactions or unforeseen health issues arising from consumption.
              </p>
            </div>

            {/* Checkbox + CTA */}
            <div className="px-5 pb-5 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-3 cursor-pointer mb-4 mt-2 group">
                <div
                  onClick={() => setDisclaimerAccepted((p) => !p)}
                  className={`w-5 h-5 rounded overflow-hidden flex items-center justify-center shrink-0 transition-all ${
                    disclaimerAccepted
                      ? 'bg-emerald-500'
                      : 'bg-slate-100 border border-slate-300'
                  }`}
                >
                  {disclaimerAccepted && (
                    <CheckCircle className="w-4 h-4 text-white" />
                  )}
                </div>
                <span className="text-[13px] text-slate-700 font-semibold leading-snug">
                  I have read and agree to the above terms.
                </span>
              </label>
              <button
                disabled={!disclaimerAccepted}
                onClick={() => {
                  setShowDisclaimer(false);
                  setSubmitting(true);
                  setTimeout(() => {
                    setShowCheckout(false);
                    setTimeout(() => setShowUpiModal(true), 150);
                    setSubmitting(false);
                  }, 100);
                }}
                className={`w-full py-3.5 rounded-2xl font-bold text-[14px] transition-all ${
                  disclaimerAccepted
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                Accept & Proceed
              </button>
            </div>
          </motion.div>
        </div>
      )}
      
      <div className="max-w-xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between relative mt-2"
        >
          <div className="w-6" /> {/* Spacer */}
          <h1 className="text-[19px] font-bold text-slate-900 absolute left-1/2 -translate-x-1/2 w-full text-center pointer-events-none">
            Secure Checkout
          </h1>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-[13px] font-bold transition-colors bg-white hover:bg-slate-50 px-4 py-2 rounded-full border border-slate-200 text-slate-600 relative z-10 hidden sm:block"
            >
              Clear All
            </button>
          )}
        </motion.div>

        {/* Active Order Banner */}
        {!loadingOrder && user && activeOrder && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)] mb-6 flex flex-col group relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-3xl font-bold text-[#8B5CF6]">
                 #ORD {activeOrder?.id?.toString().replace(/[^0-9]/g, '').slice(-4) || '9241'}
              </h2>
              <span className="px-3 py-1.5 bg-[#FFF7ED] text-[#EA580C] text-[11px] font-bold rounded-md capitalize">
                 {activeOrder?.status?.replace('_', ' ') || 'Pending'}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-500 mb-0.5">Estimated Arrival</p>
            <p className="text-base font-bold text-slate-900 mb-5">
               {activeOrder?.status === 'pending' ? 'Payment Pending' : 'Preparing Order'}
            </p>
            <Link
              to={`/tracking?order=${activeOrder?.id}`}
              className="w-full bg-[#FAFAFA] hover:bg-slate-100 text-slate-800 py-3 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 text-sm border border-slate-100"
            >
              Track Order <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
          </motion.div>
        )}

        {items.length === 0 ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-3xl p-12 text-center bg-white shadow-[0_2px_10px_rgba(0,0,0,0.03)] mt-8"
            >
              <ShoppingCart className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-slate-900 mb-2">
                Your cart is empty
              </h2>
              <p className="text-slate-500 text-[15px]">
                Looks like you haven't added anything yet.
              </p>
            </motion.div>

            {/* Apple-style fixed bottom action */}
            <div className="fixed bottom-0 left-0 right-0 z-40 pb-10 pt-6 px-5 flex justify-center" style={{ background: 'linear-gradient(to top, #FAFAFA 80%, transparent)' }}>
              <motion.button
                onClick={() => navigate('/home')}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
                whileTap={{ scale: 0.97 }}
                className="w-full max-w-[360px] h-[56px] rounded-2xl bg-[#1C1C1E] flex items-center justify-center gap-2"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <ArrowLeft className="w-5 h-5 text-white/60" strokeWidth={2} />
                <span className="text-[17px] font-semibold text-white tracking-[-0.02em]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", system-ui, sans-serif' }}>
                  Back to Home
                </span>
              </motion.button>
            </div>
          </>
        ) : (
          <>
            {/* Cart Items */}
            <div className="bg-white rounded-3xl p-6 px-4 sm:px-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] mb-6 z-10 relative">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[17px] font-bold text-slate-900">Order Items</h3>
                {hasQuickItem && (
                   <span className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[11px] font-black uppercase tracking-tighter border border-orange-100">
                     <Zap className="w-3.5 h-3.5 fill-orange-600" /> Quick Delivery
                   </span>
                )}
              </div>
              
              <div className="space-y-6">
                <AnimatePresence>
                  {items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`flex gap-4 ${index !== items.length - 1 ? 'pb-6 border-b border-slate-50' : ''}`}
                      >
                        <div className="w-[52px] h-[52px] rounded-2xl bg-slate-50 overflow-hidden shrink-0 border border-slate-100 p-1 relative">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover rounded-xl"
                          />
                          {item.category === 'Vending Machine' && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        
                        <div className="flex-1 pt-0.5">
                          <h4 className="text-[15px] font-bold text-slate-900 leading-snug pr-2">
                            {item.title || (item as any).name || "Unnamed Item"}
                          </h4>
                          
                          {item.notes ? (
                            <p className="text-[12px] text-slate-500 mt-1 leading-snug line-clamp-2 pr-4 font-medium">
                              {item.notes}
                            </p>
                          ) : (
                            <p className="text-[12px] text-slate-400 mt-0.5 font-medium">
                              {item.category}
                            </p>
                          )}
                          
                          {/* Clean minimal controls */}
                          <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-[28px] h-[28px] rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 flex items-center justify-center transition-colors"
                              >
                                <Minus className="w-[14px] h-[14px]" strokeWidth={3} />
                              </button>
                              <span className="text-[14px] font-bold w-3 text-center text-slate-900">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-[28px] h-[28px] rounded-full bg-[#10B981] text-white hover:bg-emerald-600 flex items-center justify-center transition-colors shadow-sm shadow-emerald-500/20"
                              >
                                <Plus className="w-[14px] h-[14px]" strokeWidth={3} />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="text-right flex flex-col justify-between items-end py-0.5">
                           <p className="text-[15px] font-bold text-slate-900">
                             ₹{(item.price * item.quantity).toFixed(2)}
                           </p>
                           <button
                             onClick={() => removeItem(item.id)}
                             className="text-slate-300 hover:text-red-500 p-1 transition-colors"
                           >
                             <Trash2 className="w-[18px] h-[18px]" strokeWidth={2.5}/>
                           </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
              </div>
            </div>



            {/* Payment Summary */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] mb-6">
              <h3 className="text-[17px] font-bold text-slate-900 mb-5">Payment Summary</h3>
              
              <div className="space-y-3.5 mb-5">
                <div className="flex justify-between items-center text-[14.5px]">
                  <span className="text-slate-500 font-medium">Subtotal</span>
                  <span className="text-slate-900 font-bold">₹{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-[14.5px]">
                  <span className="text-slate-500 font-medium">Delivery Fee</span>
                  <span className="text-slate-900 font-bold">₹{displayedDeliveryFee.toFixed(2)}</span>
                </div>

                {hasFreeDelivery && (
                  <div className="flex justify-between items-center text-[14.5px]">
                    <span className="text-emerald-500 font-medium">
                      CB Membership
                    </span>
                    <span className="font-bold text-emerald-500">-₹{displayedDeliveryFee.toFixed(2)}</span>
                  </div>
                )}

                {paymentMethod !== 'cod' && paymentMethod !== 'virtual_card' && !hasFreeDelivery && hasFlavourCombo && (
                  <div className="flex justify-between items-center text-[14.5px]">
                    <span className="text-violet-500 font-medium">Flavour Factory Promo</span>
                    <span className="font-bold text-violet-500">-₹7.00</span>
                  </div>
                )}
              </div>

              {/* Seamless Wallet Integration directly above total is removed */}

              <div className="border-t border-slate-100 pt-5 mt-2 flex justify-between items-center">
                <span className="font-bold text-slate-900 text-lg">Total</span>
                <span className="text-[26px] font-black text-slate-900 tracking-tight">
                   ₹{orderTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Location Missing Prompt Modal */}
            <AnimatePresence>
              {showLocationPrompt && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.45)' }}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.93, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.93, y: 16 }}
                    className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden mx-2"
                  >
                    {/* Header */}
                    <div className="bg-gradient-to-br from-violet-50 to-purple-50 px-6 pt-7 pb-5 text-center">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/25">
                        <Navigation className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-slate-900 font-black text-[18px] leading-tight mb-1">
                        Add Delivery Location
                      </h2>
                      <p className="text-slate-500 text-[13px] font-medium leading-snug">
                        Set your hostel, room & phone to place an order
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="px-6 pb-6 pt-5 space-y-3">
                      <button
                        onClick={() => {
                          setShowLocationPrompt(false);
                          navigate('/home?openLocation=true&returnTo=cart');
                        }}
                        className="w-full py-3.5 rounded-2xl font-bold text-[15px] bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700 active:scale-[0.98] transition-all shadow-md shadow-violet-500/20 flex items-center justify-center gap-2"
                      >
                        <MapPin className="w-4.5 h-4.5" />
                        Set Location
                      </button>
                      <button
                        onClick={() => setShowLocationPrompt(false)}
                        className="w-full py-3 rounded-2xl font-bold text-[14px] text-slate-500 hover:bg-slate-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Delivery Setup Action Block */}
            {showCheckout ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-6 mb-8"
              >
                {/* Location Summary Card */}
                <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between border border-slate-100 mb-6 mt-4">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                         <MapPin className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                         <p className="text-[14px] font-bold text-slate-900">Delivering to {hostel} - {room}</p>
                         <p className="text-[12px] text-slate-500 font-medium">{phone}</p>
                      </div>
                   </div>
                   <button onClick={() => navigate('/home?openLocation=true&returnTo=cart')} className="text-emerald-600 text-[13px] font-bold px-3 py-1.5 bg-emerald-50 rounded-full hover:bg-emerald-100 transition-colors">
                      Change
                   </button>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <h3 className="font-bold text-slate-900 text-[17px] mb-4">Payment Method</h3>
                  <PaymentSelector
                    selected={paymentMethod}
                    onChange={setPaymentMethod}
                    totalAmount={orderTotal}
                    disabled={submitting}
                  />
                </div>

                {paymentMethod === "virtual_card" ? (
                  <div className="pt-2">
                    <VirtualCardSwipePayment 
                      amount={orderTotal} 
                      balance={walletBalance} 
                      userName={profileName || "CU USER"}
                      onSuccess={handleVirtualCardSuccess}
                      onCancel={() => {}}
                    />
                  </div>
                ) : (
                  <div className="pt-2">
                     <button
                       onClick={handleCheckout}
                       disabled={submitting || !isFormValid}
                       className={`w-full h-[60px] rounded-[18px] font-bold text-[16px] flex items-center justify-center gap-2 transition-all shadow-md ${
                         isFormValid ? 'bg-[#10B981] text-white hover:bg-[#059669]' : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                       }`}
                     >
                       {submitting ? (
                         <Loader2 className="w-6 h-6 animate-spin" />
                       ) : (
                         `Confirm & Pay ₹${orderTotal.toFixed(2)}`
                       )}
                     </button>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-t border-slate-100 p-4 pb-8 flex justify-center">
                  <div className="max-w-xl w-full flex flex-col gap-3">
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/home')}
                      className="w-full h-[60px] rounded-[18px] font-bold text-white text-[16px] flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 shadow-[0_4px_14px_rgba(0,0,0,0.15)] transition-all"
                    >
                      <ArrowLeft className="w-5 h-5" /> Back to Home
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleProceedToCheckout}
                      className="w-full h-[60px] rounded-[18px] font-bold text-white text-[16px] flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 shadow-[0_4px_14px_rgba(0,0,0,0.15)] transition-all"
                    >
                      <ShoppingBag className="w-5 h-5" /> Proceed to Checkout
                    </motion.button>
                  </div>
              </div>
            )}
          </>
        )}
      </div>


    </div>
  );
};
