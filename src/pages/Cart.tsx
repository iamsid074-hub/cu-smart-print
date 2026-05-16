import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
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
  ChevronLeft,
  Heart,
  ShieldCheck,
  Sparkles,
  RefreshCcw,
  Lock,
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
import UpiPaymentModal from "@/components/UpiPaymentModal";

const SwipeToCheckout: React.FC<{ onComplete: () => void; disabled: boolean }> = ({ onComplete, disabled }) => {
  const x = useMotionValue(0);
  const opacity = useTransform(x, [0, 100], [1, 0]);
  const textX = useTransform(x, [0, 100], [0, 20]);
  
  const successOpacity = useTransform(x, [80, 160], [0, 1]);
  const successX = useTransform(x, [80, 160], [-10, 0]);
  
  const handleDragEnd = () => {
    if (x.get() > 140) {
      animate(x, 180, { type: "spring", stiffness: 400, damping: 30 });
      setTimeout(onComplete, 200);
      setTimeout(() => animate(x, 0), 500);
    } else {
      animate(x, 0, { type: "spring", stiffness: 300, damping: 25 });
    }
  };

  return (
    <div className={`relative w-full h-[60px] max-w-[240px] bg-slate-100 rounded-full overflow-hidden flex items-center p-1.5 transition-opacity ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <motion.div 
        style={{ opacity: successOpacity, x: successX }}
        className="absolute inset-y-0 left-6 flex items-center pointer-events-none"
      >
        <span className="text-[14px] font-bold text-[#D99C4B] uppercase tracking-tight">Thank You!</span>
      </motion.div>

      <motion.div 
        style={{ opacity, x: textX }}
        className="absolute inset-0 flex items-center justify-center pl-10 pointer-events-none"
      >
        <span className="text-[14px] font-bold text-slate-400 uppercase tracking-tight">Swipe to Checkout</span>
      </motion.div>
      
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 180 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className="w-[50px] h-[50px] bg-gradient-to-r from-[#D99C4B] to-[#c78b3a] rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg z-10"
      >
        <Lock className="w-5 h-5 text-white" />
      </motion.div>
      
      <motion.div style={{ opacity }} className="absolute right-6 pointer-events-none">
        <ChevronLeft className="w-4 h-4 text-slate-300 rotate-180 animate-pulse" />
      </motion.div>
    </div>
  );
};

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
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

  // Auto-open checkout if returning from location setup
  useEffect(() => {
    if (searchParams.get('returnTo') === 'checkout' && locationLoaded && locationData?.hostel && locationData?.room && locationData?.phone) {
      setShowCheckout(true);
    }
  }, [searchParams, locationLoaded, locationData]);

  const [savedAddresses] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem("bazzar_user_addresses") || "[]"); } catch { return []; }
  });
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  
  const selectedSavedAddress = savedAddresses.find(a => a.id === selectedAddressId);

  // Derive hostel/room/phone from location data or selected address
  const hostel = selectedSavedAddress ? selectedSavedAddress.text : (locationData?.hostel || profile?.hostel_block || '');
  const room = selectedSavedAddress ? "" : (locationData?.room || profile?.room_number || '');
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

  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [loadingOrder, setLoadingOrder] = useState(true);

  const [walletBalance, setWalletBalance] = useState(0);
  const [winningsBalance, setWinningsBalance] = useState(0);
  const [profileName, setProfileName] = useState("");
  const [dailyWalletUsed, setDailyWalletUsed] = useState(0);
  const [useWalletBalance, setUseWalletBalance] = useState(false);
  const [totalOrdersTracker, setTotalOrdersTracker] = useState(0);

  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : true);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!user) {
      setLoadingOrder(false);
      return;
    }

    setLoadingOrder(false);

    const fetchWallet = async () => {
      const { data: profileList } = await supabase
        .from("profiles")
        .select("wallet_balance, winnings_balance, total_orders, hostel_block, full_name")
        .eq("id", user.id);
        
      const data = profileList?.[0];
      if (data) {
        setWalletBalance(data.wallet_balance || 0);
        setWinningsBalance(data.winnings_balance || 0);
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

  const isCartFreeShipping = totalPrice >= 200;
  const isDeliveryFree = hasFreeDelivery || isCartFreeShipping;

  const [showCelebration, setShowCelebration] = useState(false);
  const prevFreeShipping = useRef(false);
  useEffect(() => {
    if (isCartFreeShipping && !prevFreeShipping.current) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 1200);
    }
    prevFreeShipping.current = isCartFreeShipping;
  }, [isCartFreeShipping]);

  const deliveryFee = useMemo(() => (items.length === 0 ? 0 : isDeliveryFree
    ? 0
    : paymentMethod === "cod"
    ? 49
    : baseDelivery), [items.length, isDeliveryFree, paymentMethod, baseDelivery]);

  const displayedDeliveryFee = useMemo(() => (items.length === 0 ? 0 :
    paymentMethod === "cod"
      ? 49
      : hasQuickItem
      ? 50
      : hasFoodShopItem
      ? standardDeliveryFee
      : calculateVendingDelivery(floor)), [items.length, paymentMethod, hasQuickItem, hasFoodShopItem, floor]);

  const maxWalletUsagePerDay = 50;
  const availableToday = Math.max(0, maxWalletUsagePerDay - dailyWalletUsed);
  const usableWalletBalance = useMemo(() => (isFoodOrder
    ? Math.min(walletBalance, availableToday)
    : 0), [isFoodOrder, walletBalance, availableToday]);

  // Wallet Logic
  const { walletDiscount, orderTotal } = useMemo(() => {
    let rawT = items.length > 0 ? totalPrice + deliveryFee + 4.71 : 0;
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

  const createOrder = async (paymentId?: string, skipNavigate = false): Promise<string | undefined> => {
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
    const { data: profileList } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user!.id);
    const existingProfile = profileList?.[0];

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
      payment_method: paymentMethod === "online" ? "online" : (paymentMethod === "virtual_card" ? "virtual_card" : "cod"),
      payment_status: paymentMethod === "cod" ? "pending" : "paid",
      razorpay_payment_id: null,
      is_quick: hasQuickItem,
      seller_notified_at: new Date().toISOString(),
    }).select("id");

    if (error) {
      console.error("Supabase Insert Error:", error);
      alert(`DB Insert Error: ${error.message} (${error.code})`);
      throw error;
    }

    // Apply Free Delivery limit deduction
    if (hasFreeDelivery) {
      await incrementUsage();
    }

    // Wallet Deduction (partial)
    if (useWalletBalance && walletDiscount > 0) {
      const { error: rpcError } = await supabase.rpc('pay_from_wallet', {
        amount: walletDiscount,
        order_description: "Used balance for order"
      });
      if (rpcError) throw new Error("Wallet deduction failed: " + rpcError.message);
    }

    // Virtual Card Wallet Deduction (full payment)
    if (paymentMethod === "virtual_card") {
      const { error: rpcError } = await supabase.rpc('pay_from_wallet', {
        amount: orderTotal,
        order_description: "Paid with Virtual Card"
      });
      if (rpcError) throw new Error("Virtual Card payment failed: " + rpcError.message);
    }

    // Save location for future auto-fill
    saveLocation({ hostel, room, phone: phoneClean });

    const insertedId = data?.[0]?.id as string | undefined;

    if (!skipNavigate) {
      clearCart();
      setShowCheckout(false);
      navigate("/tracking");
    }

    return insertedId;
  };

  const handleUpiPaymentVerify = async (paymentId: string) => {
    setSubmitting(true);
    try {
      await createOrder(paymentId, false);
    } catch (error: any) {
      console.error("Order creation failed after UPI payment:", error);
      throw new Error("Failed to create order. " + error.message);
    } finally {
      setSubmitting(false);
    }
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
      // Launch Cashfree payment gateway
      await handleCashfreeCartCheckout();
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

  if (!isMobile) {
    return (
      <div className="min-h-screen bg-transparent text-slate-900 pb-32 md:pb-12 px-4 sm:px-6 font-sans relative">
        <div className="h-28 md:h-48" /> {/* Safe area for Dynamic Island */}
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
                  onClick={handleDisclaimerAccepted}
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
        
        <div className="max-w-xl md:max-w-7xl mx-auto relative md:bg-white/40 md:backdrop-blur-3xl md:border-[1.5px] md:border-white/60 md:shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_20px_60px_-15px_rgba(0,0,0,0.5)] md:rounded-[2.5rem] md:p-8 mt-12 md:mt-32">
          {/* Reflection Highlight */}
          <div className="hidden md:block absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none rounded-t-[2.5rem]" />
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex items-center justify-between relative mt-2 md:mt-0 z-10"
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

          {items.length === 0 ? (
            <div className="md:max-w-xl md:mx-auto">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-3xl p-12 text-center bg-white md:bg-white/60 md:backdrop-blur-2xl md:border md:border-white/50 shadow-[0_2px_10px_rgba(0,0,0,0.03)] md:shadow-lg mt-8 relative z-10"
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
              <div className="fixed bottom-0 left-0 right-0 z-40 pb-10 pt-6 px-5 flex justify-center md:static md:p-0 md:pt-8 md:bg-transparent" style={{ background: typeof window !== 'undefined' && window.innerWidth < 768 ? 'linear-gradient(to top, #FAFAFA 80%, transparent)' : 'transparent' }}>
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
            </div>
          ) : (
            <div className="flex flex-col md:grid md:grid-cols-12 md:gap-8 relative z-10">
              {/* Left Column */}
              <div className="md:col-span-7 lg:col-span-8 flex flex-col">
              {/* Cart Items */}
              <div className="bg-white md:bg-white/60 md:backdrop-blur-2xl md:border md:border-white/50 rounded-3xl p-6 px-4 sm:px-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] md:shadow-lg mb-6 z-10 relative">
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
                          <div className="w-[52px] h-[52px] md:w-48 md:h-48 md:rounded-3xl rounded-2xl bg-slate-50 overflow-hidden shrink-0 border border-slate-100 md:border-white/60 md:shadow-inner relative">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                            {item.category === 'Vending Machine' && (
                              <div className="absolute -top-1 -right-1 md:top-3 md:right-3 w-3 h-3 md:w-5 md:h-5 bg-blue-500 rounded-full border-2 border-white shadow-sm"></div>
                            )}
                          </div>
                          
                          <div className="flex-1 pt-0.5 md:flex md:flex-col md:justify-start md:pt-2">
                            <h4 className="text-[15px] md:text-2xl font-black text-slate-900 leading-tight pr-2 tracking-tight">
                              {item.category === "shops" 
                                ? item.title.replace(/\s*\(.*?\)$/, '') 
                                : (item.title || (item as any).name || "Unnamed Item")}
                            </h4>
                            
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 md:bg-white/60 text-slate-500 rounded-md text-[10px] md:text-[11px] font-bold uppercase tracking-wider">
                                 <Truck className="w-3 h-3" /> {item.category === "shops" ? (item.title.match(/\((.*?)\)$/)?.[1] || "Food Store") : (item.category || "General Store")}
                              </span>
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 md:bg-blue-100/50 text-blue-600 rounded-md text-[10px] md:text-[11px] font-bold uppercase tracking-wider">
                                 <Package className="w-3 h-3" /> Qty: {item.quantity}
                              </span>
                            </div>
                            
                            {item.notes && (
                              <p className="text-[12px] md:text-sm text-slate-500 mt-2 leading-relaxed line-clamp-3 pr-4 font-medium italic">
                                "{item.notes}"
                              </p>
                            )}

                            <div className="hidden md:block mt-4 pt-4 border-t border-slate-100/50">
                              <div className="flex items-center gap-1.5 text-[12px] text-slate-500 font-medium">
                                <MapPin className="w-3.5 h-3.5" /> Delivering to <strong className="text-slate-700">{hostel || "Select Location"} {room ? `- ${room}` : ''}</strong>
                              </div>
                              <div className="flex items-center gap-1.5 text-[12px] text-slate-500 font-medium mt-1">
                                <Truck className="w-3.5 h-3.5" /> Estimated Delivery: <strong className="text-slate-700">{hasQuickItem ? "10-15 mins" : "20-30 mins"}</strong>
                              </div>
                            </div>
                            
                            {/* Clean minimal controls */}
                            <div className="flex items-center gap-4 mt-auto pt-4">
                              <div className="flex items-center gap-3 bg-slate-50 md:bg-white/40 p-1 rounded-full border border-slate-100 md:border-white/40">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="w-[28px] h-[28px] md:w-9 md:h-9 rounded-full bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center justify-center transition-colors shadow-sm"
                                >
                                  <Minus className="w-[14px] h-[14px] md:w-4 md:h-4" strokeWidth={3} />
                                </button>
                                <span className="text-[14px] md:text-lg font-black w-3 md:w-6 text-center text-slate-900">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="w-[28px] h-[28px] md:w-9 md:h-9 rounded-full bg-[#10B981] text-white hover:bg-emerald-600 flex items-center justify-center transition-colors shadow-md shadow-emerald-500/20"
                                >
                                  <Plus className="w-[14px] h-[14px] md:w-4 md:h-4" strokeWidth={3} />
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="text-right flex flex-col justify-between items-end py-0.5 md:py-2">
                             <p className="text-[15px] md:text-xl font-bold text-slate-900">
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
              </div>

              {/* Right Column (Sticky) */}
              <div className="md:col-span-5 lg:col-span-4 flex flex-col md:sticky md:top-8 md:self-start">
                {/* Payment Summary */}
                <div className="bg-white md:bg-white/60 md:backdrop-blur-2xl md:border md:border-white/50 rounded-3xl p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] md:shadow-lg mb-6 relative z-10">
                <h3 className="text-[17px] font-bold text-slate-900 mb-5">Payment Summary</h3>
                
                <div className="space-y-3.5 mb-5">
                  <div className="flex justify-between items-center text-[13.5px]">
                    <span className="text-slate-400 font-normal">MRP</span>
                    <span className="text-slate-900 font-semibold">₹{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[13.5px]">
                    <span className="text-slate-400 font-normal">Handling Fee</span>
                    <span className="text-slate-900 font-semibold">₹4.71</span>
                  </div>
                  <div className="flex justify-between items-center text-[13.5px]">
                    <span className="text-slate-400 font-normal">Delivery Fee</span>
                    <div className="flex items-center gap-2">
                      {isDeliveryFree && displayedDeliveryFee > 0 && (
                        <span className="text-slate-300 line-through text-[12px]">₹{displayedDeliveryFee.toFixed(2)}</span>
                      )}
                      <span className={isDeliveryFree ? "text-emerald-500 font-semibold" : "text-slate-900 font-semibold"}>
                        {isDeliveryFree ? "FREE" : `₹${displayedDeliveryFee.toFixed(2)}`}
                      </span>
                    </div>
                  </div>

                  {paymentMethod !== 'cod' && paymentMethod !== 'virtual_card' && !hasFreeDelivery && hasFlavourCombo && (
                    <div className="flex justify-between items-center text-[13.5px]">
                      <span className="text-violet-400 font-normal">Flavour Factory Promo</span>
                      <span className="font-semibold text-violet-500">-₹7.00</span>
                    </div>
                  )}
                </div>

                {/* Seamless Wallet Integration directly above total is removed */}

                <div className="border-t border-slate-100 pt-5 mt-2 flex justify-between items-center">
                  <span className="font-semibold text-slate-900 text-lg">Total</span>
                  <span className="text-[24px] font-bold text-slate-900 tracking-tight">
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
                  className="bg-white md:bg-white/60 md:backdrop-blur-2xl md:border md:border-white/50 rounded-3xl p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] md:shadow-lg space-y-6 mb-8 relative z-10"
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
                        winningsBalance={winningsBalance}
                        userName={profileName || "CU USER"}
                        onSuccess={handleVirtualCardSuccess}
                        onCancel={() => {}}
                      />
                    </div>
                  ) : (
                     <div className="pt-2">
                       <button
                         onClick={paymentMethod === 'online' ? () => setShowUpiModal(true) : handleCheckout}
                         disabled={submitting || !isFormValid}
                         className={`w-full h-[60px] rounded-[18px] font-bold text-[16px] flex items-center justify-center gap-2 transition-all shadow-md ${
                           isFormValid ? 'bg-[#10B981] text-white hover:bg-[#059669]' : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                         }`}
                       >
                         {submitting ? (
                           <Loader2 className="w-6 h-6 animate-spin" />
                         ) : (
                           paymentMethod === 'online' ? `Pay ₹${orderTotal.toFixed(2)} via UPI` : `Confirm & Pay ₹${orderTotal.toFixed(2)}`
                         )}
                       </button>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="mt-4 md:mt-0 flex flex-col gap-3 relative z-10">
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/home')}
                        className="w-full h-[60px] rounded-[18px] font-bold text-slate-900 text-[16px] flex items-center justify-center gap-2 bg-white/80 hover:bg-white backdrop-blur-md border border-white/20 shadow-lg shadow-black/5 transition-all"
                      >
                        <ArrowLeft className="w-5 h-5 opacity-60" /> Back to Home
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={handleProceedToCheckout}
                        className="w-full h-[60px] rounded-[18px] font-black text-white text-[17px] flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-[0_10px_25px_-5px_rgba(37,99,235,0.4)] transition-all"
                      >
                        <ShoppingBag className="w-5 h-5" /> Proceed to Checkout
                      </motion.button>
                </div>
              )}
              </div>
            </div>
          )}
        </div>

        <UpiPaymentModal
          isOpen={showUpiModal}
          onClose={() => setShowUpiModal(false)}
          amount={orderTotal}
          orderIdText="Cart Order"
          onPaymentVerify={handleUpiPaymentVerify}
        />
      </div>
    );
  }

  // Mobile Layout exactly matching iOS-style reference
  return (
    <div className="min-h-screen bg-[#F9F9F9] text-slate-900 pb-40 px-4 font-sans relative">
      <div className="h-12" /> {/* Top safe area spacing */}

      {/* Modals for Mobile */}
      <RiskAlert
        isOpen={showRiskAlert}
        onClose={() => setShowRiskAlert(false)}
        onConfirm={handleRiskConfirmed}
        level={riskEval?.level || "low"}
        reason={riskEval?.reason || ""}
        isBlocked={riskEval?.isBlocked || false}
      />
      {showDisclaimer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.4)" }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden mx-2">
             <div className="bg-amber-50 px-5 pt-5 pb-4 flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                 <AlertTriangle className="w-5 h-5 text-amber-600" />
               </div>
               <div>
                 <h2 className="text-slate-900 font-bold text-[16px] leading-tight">Safety &amp; Responsibility</h2>
               </div>
             </div>
             <div className="px-5 py-4 max-h-[30vh] overflow-y-auto space-y-3 text-[13px] text-slate-600 leading-relaxed font-medium">
               <p>By placing this order, you acknowledge that food items may contain <strong className="text-slate-900">allergens or ingredients</strong> that could cause health reactions.</p>
             </div>
             <div className="px-5 pb-5 pt-2 border-t border-slate-100">
               <label className="flex items-center gap-3 cursor-pointer mb-4 mt-2 group">
                 <div onClick={() => setDisclaimerAccepted((p) => !p)} className={`w-5 h-5 rounded flex items-center justify-center transition-all ${disclaimerAccepted ? 'bg-emerald-500' : 'bg-slate-100 border border-slate-300'}`}>
                   {disclaimerAccepted && <CheckCircle className="w-4 h-4 text-white" />}
                 </div>
                 <span className="text-[13px] text-slate-700 font-semibold">I have read and agree to the above terms.</span>
               </label>
               <button disabled={!disclaimerAccepted} onClick={handleDisclaimerAccepted} className={`w-full py-3.5 rounded-2xl font-bold text-[14px] transition-all ${disclaimerAccepted ? 'bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>Accept & Proceed</button>
             </div>
          </motion.div>
        </div>
      )}
      <AnimatePresence>
        {showLocationPrompt && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.45)' }}>
            <motion.div initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.93 }} className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden mx-2">
              <div className="bg-gradient-to-br from-violet-50 to-purple-50 px-6 pt-7 pb-5 text-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4"><Navigation className="w-6 h-6 text-white" /></div>
                <h2 className="text-slate-900 font-black text-[18px] leading-tight mb-1">Add Delivery Location</h2>
                <p className="text-slate-500 text-[13px] font-medium leading-snug">Set your hostel, room & phone to place an order</p>
              </div>
              <div className="px-6 pb-6 pt-5 space-y-3">
                <button onClick={() => { setShowLocationPrompt(false); navigate('/home?openLocation=true&returnTo=cart'); }} className="w-full py-3.5 rounded-2xl font-bold text-[15px] bg-gradient-to-r from-violet-600 to-purple-600 text-white flex items-center justify-center gap-2"><MapPin className="w-4.5 h-4.5" /> Set Location</button>
                <button onClick={() => setShowLocationPrompt(false)} className="w-full py-3 rounded-2xl font-bold text-[14px] text-slate-500 hover:bg-slate-50 transition-colors">Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <UpiPaymentModal isOpen={showUpiModal} onClose={() => setShowUpiModal(false)} amount={orderTotal} orderIdText="Cart Order" onPaymentVerify={handleUpiPaymentVerify} />

      {/* Header */}
      <div className="mt-6 mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[34px] font-black text-slate-900 tracking-tight leading-tight">{showCheckout ? "Checkout" : "Your Cart"}</h1>
          <div className="flex items-center gap-1.5 mt-1 opacity-70">
            <ShieldCheck className="w-4 h-4 text-[#D99C4B]" />
            <span className="text-[13px] font-medium text-slate-600">Secure • Fast • Easy Payments</span>
          </div>
        </div>
        <button onClick={() => navigate('/home')} className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 active:scale-95 transition-transform shrink-0 mt-1">
          <ChevronLeft className="w-6 h-6 text-slate-700 translate-x-[-1px]" />
        </button>
      </div>

      {showCheckout ? (
        /* Checkout UI replacing cart when "Proceed" is tapped */
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 mb-8">
           <h3 className="font-bold text-slate-900 text-[18px] mb-4">Checkout Details</h3>
           <div className="bg-[#F9F9F9] rounded-2xl p-4 flex items-center justify-between border border-slate-100 mb-6">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                    <MapPin className="w-5 h-5 text-slate-700" />
                 </div>
                 <div>
                    <p className="text-[14px] font-bold text-slate-900">Delivering to {hostel} {room ? `- ${room}` : ''}</p>
                    <p className="text-[12px] text-slate-500 font-medium mt-0.5">{phone}</p>
                 </div>
              </div>
              <button onClick={() => navigate('/home?openLocation=true&returnTo=cart')} className="text-[#D99C4B] text-[13px] font-bold px-3 py-1.5 bg-[#fcf8f2] rounded-full active:scale-95 transition-transform">Change</button>
           </div>
           
           {savedAddresses.length > 0 && (
             <div className="mb-6 -mx-5 px-5">
               <h3 className="font-bold text-slate-900 text-[14px] mb-3">Saved Addresses</h3>
               <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x">
                 <button 
                   onClick={() => setSelectedAddressId(null)}
                   className={`shrink-0 w-[200px] p-4 rounded-2xl border text-left snap-start transition-all ${!selectedAddressId ? 'border-[#D99C4B] bg-[#fcf8f2] shadow-sm' : 'border-slate-100 bg-white'}`}
                 >
                   <div className="flex items-center gap-2 mb-2">
                     <MapPin className={`w-4 h-4 ${!selectedAddressId ? 'text-[#D99C4B]' : 'text-slate-400'}`} />
                     <span className={`text-[13px] font-bold ${!selectedAddressId ? 'text-[#D99C4B]' : 'text-slate-900'}`}>Current</span>
                   </div>
                   <p className="text-[13px] text-slate-600 font-medium line-clamp-2">{locationData?.hostel || profile?.hostel_block || 'Default'}</p>
                 </button>
                 {savedAddresses.map(addr => (
                   <button 
                     key={addr.id}
                     onClick={() => setSelectedAddressId(addr.id)}
                     className={`shrink-0 w-[200px] p-4 rounded-2xl border text-left snap-start transition-all ${selectedAddressId === addr.id ? 'border-[#D99C4B] bg-[#fcf8f2] shadow-sm' : 'border-slate-100 bg-white'}`}
                   >
                     <div className="flex items-center gap-2 mb-2">
                       <MapPin className={`w-4 h-4 ${selectedAddressId === addr.id ? 'text-[#D99C4B]' : 'text-slate-400'}`} />
                       <span className={`text-[13px] font-bold ${selectedAddressId === addr.id ? 'text-[#D99C4B]' : 'text-slate-900'}`}>Saved</span>
                     </div>
                     <p className="text-[13px] text-slate-600 font-medium line-clamp-2">{addr.text}</p>
                   </button>
                 ))}
               </div>
             </div>
           )}
           
           <div className="pt-4 border-t border-slate-100">
             <h3 className="font-bold text-slate-900 text-[16px] mb-4">Payment Method</h3>
             <PaymentSelector selected={paymentMethod} onChange={setPaymentMethod} totalAmount={orderTotal} disabled={submitting} />
           </div>

           {paymentMethod === "virtual_card" ? (
             <div className="pt-6">
               <VirtualCardSwipePayment amount={orderTotal} balance={walletBalance} winningsBalance={winningsBalance} userName={profileName || "CU USER"} onSuccess={handleVirtualCardSuccess} onCancel={() => {}} />
             </div>
           ) : (
             <div className="pt-6">
                <button onClick={paymentMethod === 'online' ? () => setShowUpiModal(true) : handleCheckout} disabled={submitting || !isFormValid} className={`w-full h-[56px] rounded-2xl font-bold text-[16px] flex items-center justify-center gap-2 transition-all shadow-md ${isFormValid ? 'bg-gradient-to-r from-[#D99C4B] to-[#c78b3a] text-white shadow-[#D99C4B]/30' : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'}`}>
                  {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : paymentMethod === 'online' ? `Pay ₹${orderTotal.toFixed(2)} via UPI` : `Confirm & Pay ₹${orderTotal.toFixed(2)}`}
                </button>
             </div>
           )}
           <button onClick={() => setShowCheckout(false)} className="w-full mt-4 py-3 text-[14px] font-bold text-slate-500 active:text-slate-700">Cancel Checkout</button>
        </motion.div>
      ) : (
        <>
          {/* Progress Widget */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-3 relative overflow-hidden">
            {/* ── Confetti Burst Animation ── */}
            <AnimatePresence>
              {showCelebration && (
                <motion.div
                  key="confetti-burst"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 z-20 rounded-2xl pointer-events-none overflow-hidden"
                >
                  {Array.from({ length: 32 }).map((_, i) => {
                    const colors = ["#FF4D94","#FFD700","#00C6FB","#A78BFA","#34D399","#F97316","#F43F5E","#06B6D4","#FBBF24","#8B5CF6"];
                    const color = colors[i % colors.length];
                    const angle = (i / 32) * 360;
                    const rad = (angle * Math.PI) / 180;
                    const speed = 55 + (i % 5) * 18;
                    const tx = Math.cos(rad) * speed;
                    const ty = Math.sin(rad) * speed - 20;
                    const isCircle = i % 3 === 0;
                    const size = 5 + (i % 4) * 3;
                    const initialRotate = (i * 47) % 360;
                    return (
                      <motion.div
                        key={i}
                        initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: initialRotate }}
                        animate={{
                          x: tx,
                          y: ty,
                          opacity: [1, 1, 0.7, 0],
                          scale: [1, 1.1, 0.8, 0.5],
                          rotate: initialRotate + (i % 2 === 0 ? 180 : -180),
                        }}
                        transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1], delay: i * 0.012 }}
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          width: isCircle ? size : size * 0.6,
                          height: isCircle ? size : size * 1.8,
                          marginLeft: -(isCircle ? size : size * 0.6) / 2,
                          marginTop: -size / 2,
                          backgroundColor: color,
                          borderRadius: isCircle ? "50%" : "2px",
                        }}
                      />
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#fcf8f2] flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-[#D99C4B]" />
                </div>
                <div className="text-[13px] leading-[1.3]">
                  {isCartFreeShipping ? (
                    <span>You unlocked <strong className="text-[#D99C4B] font-bold">free shipping!</strong></span>
                  ) : hasFreeDelivery ? (
                    <span>You have <strong className="text-slate-900 font-bold">{remainingDeliveries}</strong> free deliveries left!</span>
                  ) : (
                    <span>You are <strong className="text-slate-900 font-bold">₹{Math.max(0, 200 - totalPrice).toFixed(2)}</strong> away from<br/><strong className="text-[#D99C4B] font-bold">free shipping!</strong></span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-center justify-center bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                <Truck className="w-4 h-4 text-[#D99C4B]" />
                <span className="text-[10px] font-bold text-slate-600 mt-0.5 uppercase tracking-wide">Free</span>
              </div>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
               <div className="h-full bg-[#D99C4B] rounded-full transition-all duration-500" style={{ width: isCartFreeShipping ? '100%' : `${Math.min(100, (totalPrice / 200) * 100)}%` }} />
            </div>
          </div>

          {/* Items List */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="text-[16px] font-bold text-slate-900">{totalItems} Items</h2>
              {items.length > 0 && <button onClick={clearCart} className="text-[14px] font-bold text-[#D99C4B]">Clear</button>}
            </div>

            {items.length === 0 ? (
               <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 shadow-sm">
                 <ShoppingBag className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                 <p className="font-semibold text-slate-400">Your cart is empty</p>
               </div>
            ) : (
              <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 divide-y divide-slate-100 overflow-hidden">
                {items.map(item => (
                  <div key={item.id} className="p-4 flex gap-4 relative">
                    <div className="w-[88px] h-[88px] bg-[#F5F5F7] rounded-[20px] flex items-center justify-center shrink-0 overflow-hidden">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div className="flex justify-between items-start pr-1">
                        <div>
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{item.category === "shops" ? (item.title.match(/\((.*?)\)$/)?.[1] || "Store") : item.category}</p>
                          <h3 className="text-[15px] font-bold text-slate-900 leading-snug mt-0.5 line-clamp-2 pr-4">{item.title.replace(/\s*\(.*?\)$/, '')}</h3>
                          <p className="text-[12px] font-medium text-slate-400 mt-1">{item.notes || 'Standard Variant'}</p>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-red-500 active:scale-95 transition-transform absolute top-4 right-2">
                          <Trash2 className="w-[18px] h-[18px]" strokeWidth={2.5}/>
                        </button>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[16px] font-bold text-slate-900">₹{(item.price * item.quantity).toFixed(2)}</span>
                        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-full px-2 py-1 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center text-slate-400 active:text-slate-900 bg-slate-50 rounded-full active:bg-slate-100 transition-colors"><Minus className="w-3.5 h-3.5" strokeWidth={3} /></button>
                          <span className="text-[14px] font-bold text-slate-900 w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center text-slate-400 active:text-slate-900 bg-slate-50 rounded-full active:bg-slate-100 transition-colors"><Plus className="w-3.5 h-3.5" strokeWidth={3} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Trust Badges — only when cart has items */}
          {items.length > 0 && (
          <div className="mt-6 flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex gap-2.5 items-center">
              <ShieldCheck className="w-[22px] h-[22px] text-[#D99C4B] shrink-0" strokeWidth={1.5} />
              <div className="flex flex-col leading-tight">
                <span className="text-[11px] font-bold text-slate-900">Secure Checkout</span>
                <span className="text-[9px] font-medium text-slate-500 mt-0.5">Your data is safe</span>
              </div>
            </div>

            <div className="flex gap-2.5 items-center">
              <Clock className="w-[22px] h-[22px] text-[#D99C4B] shrink-0" strokeWidth={1.5} />
              <div className="flex flex-col leading-tight">
                <span className="text-[11px] font-bold text-slate-900">Fast Delivery</span>
                <span className="text-[9px] font-medium text-slate-500 mt-0.5">Campus wide</span>
              </div>
            </div>
          </div>
          )}

          {/* Mobile Payment Summary — only when cart has items */}
          {items.length > 0 && (
          <div className="mt-4 bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-6 md:hidden">
             <div className="flex justify-between items-center mb-2.5">
               <span className="text-slate-400 font-normal text-[13px]">MRP</span>
               <span className="text-slate-900 font-semibold text-[13px]">₹{totalPrice.toFixed(2)}</span>
             </div>
             <div className="flex justify-between items-center mb-2.5">
               <span className="text-slate-400 font-normal text-[13px]">Handling Fee</span>
               <span className="text-slate-900 font-semibold text-[13px]">₹4.71</span>
             </div>
             <div className="flex justify-between items-center mb-2.5">
                <span className="text-slate-400 font-normal text-[13px]">Delivery Fee</span>
                <div className="flex items-center gap-2">
                  {isDeliveryFree && displayedDeliveryFee > 0 && (
                    <span className="text-slate-300 line-through text-[11px]">₹{displayedDeliveryFee.toFixed(2)}</span>
                  )}
                  <span className={isDeliveryFree ? "text-emerald-500 font-semibold text-[13px]" : "text-slate-900 font-semibold text-[13px]"}>
                    {isDeliveryFree ? "FREE" : `₹${displayedDeliveryFee.toFixed(2)}`}
                  </span>
                </div>
             </div>
             <div className="border-t border-slate-100 pt-3 mt-1 flex justify-between items-center">
               <span className="font-semibold text-slate-900 text-[14px]">Total to Pay</span>
               <span className="text-[19px] font-bold text-slate-900 tracking-tight">₹{orderTotal.toFixed(2)}</span>
             </div>
          </div>
          )}


        </>
      )}

      {/* Sticky Bottom Bar (Only visible when not checking out AND cart has items) */}
      {!showCheckout && items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 p-5 pb-8 z-50 flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.03)] gap-5">
          <div className="flex flex-col justify-center shrink-0">
            <span className="text-[13px] font-medium text-slate-500">Total ({totalItems} items)</span>
            <span className="text-[26px] font-black text-slate-900 leading-none mt-1">₹{orderTotal.toFixed(2)}</span>
          </div>
          
          <SwipeToCheckout onComplete={handleProceedToCheckout} disabled={items.length === 0} />
        </div>
      )}
    </div>
  );
};
