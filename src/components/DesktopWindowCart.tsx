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
import { useNavigate, useSearchParams } from "react-router-dom";
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
import DesktopWindow from "./DesktopWindow";

interface DesktopWindowCartProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  isMinimized?: boolean;
  isMaximized?: boolean;
}

export default function DesktopWindowCart({ onClose, onMinimize, onMaximize, isMinimized, isMaximized }: DesktopWindowCartProps) {
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

  const [walletBalance, setWalletBalance] = useState(0);
  const [winningsBalance, setWinningsBalance] = useState(0);
  const [profileName, setProfileName] = useState("");
  const [dailyWalletUsed, setDailyWalletUsed] = useState(0);
  const [useWalletBalance, setUseWalletBalance] = useState(false);
  const [totalOrdersTracker, setTotalOrdersTracker] = useState(0);

  useEffect(() => {
    if (!user) return;

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
  }, [user]);

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

  const standardDeliveryFee = 30;

  const hasFoodShopItem = useMemo(() => items.some(
    (item) =>
      item.category !== "Vending Machine" &&
      item.category?.toLowerCase() !== "grocery"
  ), [items]);

  const hasQuickItem = useMemo(() => items.some(
    (item) => (item as any).id?.startsWith("grocery-") || (item as any).is_quick
  ), [items]);

  const baseDelivery = useMemo(() => {
    if (hasQuickItem) return 50;
    if (hasFoodShopItem) return standardDeliveryFee;
    return calculateVendingDelivery(floor);
  }, [hasQuickItem, hasFoodShopItem, floor]);

  const deliveryFee = useMemo(() => (hasFreeDelivery ? 0 : paymentMethod === "cod" ? 49 : baseDelivery), [hasFreeDelivery, paymentMethod, baseDelivery]);

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
  const usableWalletBalance = useMemo(() => (isFoodOrder ? Math.min(walletBalance, availableToday) : 0), [isFoodOrder, walletBalance, availableToday]);

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
  const hasLocation = hostel.trim() !== '' && room.trim() !== '' && isPhoneValid;
  const isFormValid = hasLocation;

  const createOrder = async (paymentId?: string, skipNavigate = false) => {
    const itemsSummary = items
      .map((i) => `${i.quantity}x ${i.title || (i as any).name || "Unnamed Item"} [IMG:${i.image}] (${i.category}) (₹${i.price})`)
      .join("\n");

    const fullItemsString = `${itemsSummary}\n\n[SAFETY:Disclaimer Accepted @ ${new Date().toISOString()}]`;

    const { data: profileList } = await supabase.from("profiles").select("full_name").eq("id", user!.id);
    const existingProfile = profileList?.[0];

    await supabase.from("profiles").upsert({
      id: user!.id,
      full_name: existingProfile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Student",
      phone_number: phoneClean,
      hostel_block: hostel,
    }, { onConflict: "id" });

    const { data, error } = await supabase.from("orders").insert({
      product_id: null,
      buyer_id: user!.id,
      seller_id: "7450c873-f51d-469e-a33d-c44ca80beb0c",
      base_price: totalPrice,
      delivery_charge: deliveryFee,
      total_price: orderTotal,
      delivery_location: `${hostel} - Floor ${floor}`,
      delivery_room: `[ROOM:${room}] | [ITEMS:${fullItemsString}]`,
      buyer_phone: phoneClean,
      status: "pending",
      payment_method: paymentMethod === "online" ? "online" : (paymentMethod === "virtual_card" ? "virtual_card" : "cod"),
      payment_status: paymentMethod === "cod" ? "pending" : "paid",
      is_quick: hasQuickItem,
      seller_notified_at: new Date().toISOString(),
    }).select("id");

    if (error) throw error;

    if (hasFreeDelivery) await incrementUsage();

    if (useWalletBalance && walletDiscount > 0) {
      const { error: rpcError } = await supabase.rpc('pay_from_wallet', { amount: walletDiscount, order_description: "Used balance for order" });
      if (rpcError) throw rpcError;
    }

    if (paymentMethod === "virtual_card") {
      const { error: rpcError } = await supabase.rpc('pay_from_wallet', { amount: orderTotal, order_description: "Paid with Virtual Card" });
      if (rpcError) throw rpcError;
    }

    saveLocation({ hostel, room, phone: phoneClean });
    
    if (!skipNavigate) {
      clearCart();
      setShowCheckout(false);
      onClose();
      navigate("/tracking");
    }
  };

  const handleUpiPaymentVerify = async (paymentId: string) => {
    setSubmitting(true);
    try {
      await createOrder(paymentId, false);
    } catch (error: any) {
      toast({ title: "Order failed", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckout = async () => {
    if (!user) { onClose(); navigate("/login"); return; }
    if (!isFormValid) return;

    const evaluation = evaluateOrderRisk(orderTotal, totalOrdersTracker, profileName);
    if (rapidAddDetected) {
      setRiskEval({ isBlocked: true, requiresConfirmation: false, level: "high", reason: "Suspicious activity detected (rapid item additions)." });
      setShowRiskAlert(true);
      return;
    }
    if (evaluation.isBlocked || evaluation.requiresConfirmation) {
      setRiskEval(evaluation);
      setShowRiskAlert(true);
      return;
    }
    setShowDisclaimer(true);
  };

  const handleDisclaimerAccepted = async () => {
    setShowDisclaimer(false);
    if (paymentMethod === "online" && orderTotal > 0) {
      setShowUpiModal(true);
    } else if (paymentMethod === "virtual_card") {
      // Handled by swipe component
    } else {
      try {
        setSubmitting(true);
        await createOrder();
        toast({ title: "Order placed! 🎉", description: "First money, then order. Collect at gate." });
      } catch (err: any) {
        toast({ title: "Order failed", description: err.message, variant: "destructive" });
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleVirtualCardSuccess = async () => {
    try {
      setSubmitting(true);
      await createOrder();
      toast({ title: "Payment successful! 🎉", description: "Paid using Virtual Card." });
    } catch (err: any) {
      toast({ title: "Order failed", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DesktopWindow
      title="Secure Checkout"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      isMinimized={isMinimized}
      isMaximized={isMaximized}
      size="xl"
    >
      <div className="p-8">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ShoppingCart className="w-16 h-16 text-slate-200 mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
            <p className="text-slate-500 mb-8">Looks like you haven't added anything yet.</p>
            <button onClick={onClose} className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold">Close Window</button>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-7 space-y-6">
              <div className="bg-white/40 backdrop-blur-xl border border-white/50 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold">Order Items ({items.length})</h3>
                  <button onClick={clearCart} className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1 rounded-full border border-red-100 transition-colors">Clear All</button>
                </div>
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 rounded-2xl bg-white/50 border border-white/50">
                      <img src={item.image} className="w-20 h-20 rounded-xl object-cover border border-white/50 shadow-sm" alt={item.title} />
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900">{item.title}</h4>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">{item.category}</p>
                        <div className="flex items-center gap-3 mt-3">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100"><Minus size={14} /></button>
                          <span className="font-bold w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm"><Plus size={14} /></button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₹{(item.price * item.quantity).toFixed(2)}</p>
                        <button onClick={() => removeItem(item.id)} className="mt-4 p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-span-5 space-y-6">
              <div className="bg-white/40 backdrop-blur-xl border border-white/50 rounded-3xl p-7 shadow-sm sticky top-0">
                <h3 className="text-lg font-bold mb-6">Payment Summary</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Subtotal</span><span className="font-bold">₹{totalPrice.toFixed(2)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-500">Delivery Fee</span><span className="font-bold">₹{displayedDeliveryFee.toFixed(2)}</span></div>
                  {hasFreeDelivery && <div className="flex justify-between text-sm"><span className="text-emerald-500 font-bold">CB Membership</span><span className="text-emerald-500 font-bold">-₹{displayedDeliveryFee.toFixed(2)}</span></div>}
                  <div className="border-t border-slate-200/50 pt-4 flex justify-between items-center"><span className="font-bold text-lg">Total</span><span className="text-2xl font-black">₹{orderTotal.toFixed(2)}</span></div>
                </div>

                {!showCheckout ? (
                  <button onClick={() => { if (!hasLocation) setShowLocationPrompt(true); else setShowCheckout(true); }} className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-lg shadow-lg hover:shadow-blue-500/30 transition-all active:scale-[0.98]">Proceed to Checkout</button>
                ) : (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <MapPin className="text-emerald-600" size={20} />
                        <div><p className="text-xs font-bold text-emerald-900">{hostel} - {room}</p><p className="text-[10px] text-emerald-600">{phone}</p></div>
                      </div>
                      <button onClick={() => { setShowCheckout(false); setShowLocationPrompt(true); }} className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-tighter">Edit</button>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-bold mb-3">Select Payment</h4>
                      <PaymentSelector selected={paymentMethod} onChange={setPaymentMethod} totalAmount={orderTotal} disabled={submitting} />
                    </div>

                    {paymentMethod === "virtual_card" ? (
                      <VirtualCardSwipePayment amount={orderTotal} balance={walletBalance} winningsBalance={winningsBalance} userName={profileName} onSuccess={handleVirtualCardSuccess} onCancel={() => {}} />
                    ) : (
                      <button onClick={handleCheckout} disabled={submitting} className="w-full h-14 bg-emerald-500 text-white rounded-2xl font-black text-lg shadow-lg hover:shadow-emerald-500/30 transition-all active:scale-[0.98]">
                        {submitting ? <Loader2 className="animate-spin mx-auto" /> : paymentMethod === 'online' ? `Pay ₹${orderTotal.toFixed(2)} via UPI` : "Place Order"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <RiskAlert isOpen={showRiskAlert} onClose={() => setShowRiskAlert(false)} onConfirm={() => { setShowRiskAlert(false); setShowDisclaimer(true); }} level={riskEval?.level || "low"} reason={riskEval?.reason || ""} isBlocked={riskEval?.isBlocked || false} />

      {showDisclaimer && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center"><AlertTriangle className="text-amber-600" /></div>
              <div><h2 className="font-bold text-lg">Safety First</h2><p className="text-xs text-slate-500">Please agree to proceed</p></div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mb-6 font-medium">By placing this order, you acknowledge that food items may contain allergens. CU Bazzar is not liable for individual health reactions.</p>
            <label className="flex items-center gap-3 cursor-pointer mb-8 group">
              <input type="checkbox" checked={disclaimerAccepted} onChange={(e) => setDisclaimerAccepted(e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500" />
              <span className="text-sm font-bold text-slate-700">I agree to the terms</span>
            </label>
            <button disabled={!disclaimerAccepted} onClick={handleDisclaimerAccepted} className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed">Accept & Checkout</button>
          </motion.div>
        </div>
      )}

      {showLocationPrompt && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-6"><Navigation className="text-violet-600" /></div>
            <h2 className="font-black text-xl mb-2">Set Delivery Location</h2>
            <p className="text-sm text-slate-500 mb-8 font-medium">Please set your hostel details in your profile first to continue checkout.</p>
            <div className="space-y-3">
              <button onClick={() => { setShowLocationPrompt(false); navigate('/home?openLocation=true&returnTo=cart'); }} className="w-full py-4 bg-violet-600 text-white rounded-2xl font-bold">Go to Profile Settings</button>
              <button onClick={() => setShowLocationPrompt(false)} className="w-full py-3 text-slate-400 font-bold">Cancel</button>
            </div>
          </motion.div>
        </div>
      )}

      <UpiPaymentModal isOpen={showUpiModal} onClose={() => setShowUpiModal(false)} amount={orderTotal} orderIdText="Cart Order" onPaymentVerify={handleUpiPaymentVerify} />
    </DesktopWindow>
  );
}
