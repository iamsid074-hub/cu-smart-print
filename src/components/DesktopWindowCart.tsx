import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, Minus, Plus, Trash2, ArrowLeft, Loader2,
  MapPin, Package, CheckCircle, Truck, Zap, AlertTriangle, Wallet,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
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
import UpiPaymentModal from "@/components/UpiPaymentModal";
import DesktopWindow from "./DesktopWindow";

interface Props {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  isMaximized?: boolean;
  onFocus?: () => void;
  zIndex?: number;
}

export default function DesktopWindowCart({ onClose, onMinimize, onMaximize, isMinimized, isMaximized, onFocus, zIndex }: Props) {
  const { items, removeItem, updateQuantity, clearCart, totalPrice, rapidAddDetected } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: locationData, saveLocation } = useUserLocation();
  const { hasFreeDelivery, incrementUsage } = useMembership();

  const [showCheckout, setShowCheckout] = useState(false);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod" | "virtual_card">("online");
  const [submitting, setSubmitting] = useState(false);
  const [riskEval, setRiskEval] = useState<RiskEvaluation | null>(null);
  const [showRiskAlert, setShowRiskAlert] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [winningsBalance, setWinningsBalance] = useState(0);
  const [profileName, setProfileName] = useState("");
  const [dailyWalletUsed, setDailyWalletUsed] = useState(0);
  const [useWalletBalance] = useState(false);
  const [totalOrdersTracker, setTotalOrdersTracker] = useState(0);

  const hostel = locationData?.hostel || profile?.hostel_block || "";
  const room = locationData?.room || profile?.room_number || "";
  const phone = locationData?.phone || profile?.phone_number || "";

  const derivedFloor = useMemo(() => {
    if (room && room.length > 0) {
      const d = parseInt(room[0]);
      if (!isNaN(d) && d > 0) return d;
    }
    return 1;
  }, [room]);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data: list } = await supabase.from("profiles")
        .select("wallet_balance, winnings_balance, total_orders, full_name")
        .eq("id", user.id);
      const d = list?.[0];
      if (d) {
        setWalletBalance(d.wallet_balance || 0);
        setWinningsBalance(d.winnings_balance || 0);
        setTotalOrdersTracker(d.total_orders || 0);
        setProfileName(d.full_name || user?.user_metadata?.full_name || "CU USER");
      }
      const start = new Date(); start.setHours(0, 0, 0, 0);
      const { data: tx } = await supabase.from("wallet_transactions")
        .select("amount").eq("user_id", user.id).eq("type", "usage").gte("created_at", start.toISOString());
      if (tx) setDailyWalletUsed(tx.reduce((a, t) => a + Math.abs(t.amount || 0), 0));
    };
    fetch();
  }, [user]);

  const hasVending = useMemo(() => items.some(i => i.category === "Vending Machine"), [items]);
  const hasFoodShopItem = useMemo(() => items.some(i => i.category !== "Vending Machine" && i.category?.toLowerCase() !== "grocery"), [items]);
  const hasQuickItem = useMemo(() => items.some(i => (i as any).id?.startsWith("grocery-") || (i as any).is_quick), [items]);
  const hasFlavourCombo = useMemo(() => items.some(i => i.id === "flavour-factory-combo"), [items]);
  const isFoodOrder = useMemo(() => !items.some(i => i.category === "Vending Machine" || i.category?.toLowerCase() === "grocery"), [items]);

  const calcVending = (f: number) => f <= 3 ? 15 : f <= 6 ? 22 : f <= 9 ? 30 : 35;
  const baseDelivery = useMemo(() => hasQuickItem ? 29 : hasFoodShopItem ? 30 : calcVending(derivedFloor), [hasQuickItem, hasFoodShopItem, derivedFloor]);
  const deliveryFee = useMemo(() => hasFreeDelivery ? 0 : paymentMethod === "cod" ? 49 : baseDelivery, [hasFreeDelivery, paymentMethod, baseDelivery]);
  const displayedDelivery = useMemo(() => paymentMethod === "cod" ? 49 : hasQuickItem ? 29 : hasFoodShopItem ? 30 : calcVending(derivedFloor), [paymentMethod, hasQuickItem, hasFoodShopItem, derivedFloor]);

  const maxWalletPerDay = 50;
  const availableToday = Math.max(0, maxWalletPerDay - dailyWalletUsed);
  const usableWallet = useMemo(() => isFoodOrder ? Math.min(walletBalance, availableToday) : 0, [isFoodOrder, walletBalance, availableToday]);
  const { walletDiscount, orderTotal } = useMemo(() => {
    const raw = totalPrice + deliveryFee;
    if (useWalletBalance && usableWallet > 0) {
      const wd = Math.min(usableWallet, raw);
      return { walletDiscount: wd, orderTotal: raw - wd };
    }
    return { walletDiscount: 0, orderTotal: raw };
  }, [totalPrice, deliveryFee, useWalletBalance, usableWallet]);

  const phoneClean = phone.replace(/\D/g, "");
  const hasLocation = hostel.trim() !== "" && room.trim() !== "" && phoneClean.length === 10;
  const isFormValid = hasLocation && (hasVending ? room.startsWith(derivedFloor.toString()) : true);

  const createOrder = async (paymentId?: string) => {
    const itemsSummary = items.map(i => `${i.quantity}x ${i.title || (i as any).name} [IMG:${i.image}] (${i.category}) (₹${i.price})`).join("\n");
    const fullItems = `${itemsSummary}\n\n[SAFETY:Accepted @ ${new Date().toISOString()}]`;

    const { data: pl } = await supabase.from("profiles").select("full_name").eq("id", user!.id);
    await supabase.from("profiles").upsert({
      id: user!.id,
      full_name: pl?.[0]?.full_name || user?.user_metadata?.full_name || "Student",
      phone_number: phoneClean, hostel_block: hostel,
    }, { onConflict: "id" });

    const { data, error } = await supabase.from("orders").insert({
      product_id: null, buyer_id: user!.id,
      seller_id: "7450c873-f51d-469e-a33d-c44ca80beb0c",
      base_price: totalPrice, commission: 0, delivery_charge: deliveryFee,
      total_price: orderTotal,
      delivery_location: `${hostel} - Floor ${derivedFloor}`,
      delivery_room: `[ROOM:${room}] | [ITEMS:${fullItems}]`,
      buyer_phone: phoneClean, status: "pending",
      payment_method: paymentMethod === "online" ? "online" : paymentMethod === "virtual_card" ? "virtual_card" : "cod",
      payment_status: paymentMethod === "cod" ? "pending" : "paid",
      razorpay_payment_id: null, is_quick: hasQuickItem,
      seller_notified_at: new Date().toISOString(),
    }).select("id");

    if (error) { alert(`DB Error: ${error.message}`); throw error; }
    if (hasFreeDelivery) await incrementUsage();
    if (paymentMethod === "virtual_card") {
      const { error: rpc } = await supabase.rpc("pay_from_wallet", { amount: orderTotal, order_description: "Paid with Virtual Card" });
      if (rpc) throw new Error("Virtual Card payment failed: " + rpc.message);
    }
    saveLocation({ hostel, room, phone: phoneClean });
    clearCart();
    setShowCheckout(false);
    navigate("/tracking");
  };

  const handleCheckout = async () => {
    if (!user) { navigate("/login"); return; }
    if (!isFormValid) return;
    const evaluation = evaluateOrderRisk(orderTotal, totalOrdersTracker, user?.user_metadata?.full_name || "Student");
    if (rapidAddDetected) {
      setRiskEval({ isBlocked: true, requiresConfirmation: false, level: "high", reason: "Rapid additions detected." });
      setShowRiskAlert(true); return;
    }
    if (evaluation.isBlocked || evaluation.requiresConfirmation) {
      setRiskEval(evaluation); setShowRiskAlert(true); return;
    }
    setDisclaimerAccepted(false); setShowDisclaimer(true);
  };

  const handleDisclaimerAccepted = async () => {
    setShowDisclaimer(false);
    if (paymentMethod === "online" && orderTotal > 0) {
      setShowUpiModal(true);
    } else if (paymentMethod !== "virtual_card") {
      try { setSubmitting(true); await createOrder(); toast({ title: "Order placed! 🎉" }); }
      catch (e: any) { toast({ title: "Order failed", description: e.message, variant: "destructive" }); }
      finally { setSubmitting(false); }
    }
  };

  return (
    <DesktopWindow
      title="Cart & Checkout"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      isMinimized={isMinimized}
      isMaximized={isMaximized}
      onFocus={onFocus}
      zIndex={zIndex}
      size="xl"
    >
      <RiskAlert
        isOpen={showRiskAlert}
        onClose={() => setShowRiskAlert(false)}
        onConfirm={() => { setShowRiskAlert(false); setDisclaimerAccepted(false); setShowDisclaimer(true); }}
        level={riskEval?.level || "low"}
        reason={riskEval?.reason || ""}
        isBlocked={riskEval?.isBlocked || false}
      />

      {/* Disclaimer Modal */}
      <AnimatePresence>
        {showDisclaimer && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm rounded-xl">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden mx-4">
              <div className="bg-amber-50 px-5 pt-5 pb-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-slate-900 font-bold text-[16px]">Safety & Responsibility</h2>
                  <p className="text-slate-500 text-[12px] mt-0.5">Please review before placing order</p>
                </div>
              </div>
              <div className="px-5 py-4 text-[13px] text-slate-600 leading-relaxed">
                <p>By placing this order you acknowledge food items may contain <strong>allergens</strong>. CU Bazzar is not liable for allergic reactions.</p>
              </div>
              <div className="px-5 pb-5 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-3 cursor-pointer mb-4 mt-2">
                  <div onClick={() => setDisclaimerAccepted(p => !p)} className={`w-5 h-5 rounded flex items-center justify-center transition-all ${disclaimerAccepted ? "bg-emerald-500" : "bg-slate-100 border border-slate-300"}`}>
                    {disclaimerAccepted && <CheckCircle className="w-4 h-4 text-white" />}
                  </div>
                  <span className="text-[13px] text-slate-700 font-semibold">I agree to the above terms.</span>
                </label>
                <button disabled={!disclaimerAccepted} onClick={handleDisclaimerAccepted}
                  className={`w-full py-3.5 rounded-2xl font-bold text-[14px] transition-all ${disclaimerAccepted ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}>
                  Accept & Proceed
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="p-5 h-full overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 py-20">
            <ShoppingCart className="w-16 h-16 text-slate-200" />
            <h2 className="text-lg font-bold text-slate-800">Your cart is empty</h2>
            <p className="text-slate-400 text-sm">Add items from Shops, Vending, or Combos</p>
          </div>
        ) : (
          <div className="flex gap-6 h-full">
            {/* Left: Items */}
            <div className="flex-1 space-y-3 overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-bold text-slate-800">Order Items</h2>
                {hasQuickItem && (
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase border border-orange-100">
                    <Zap className="w-3 h-3 fill-orange-600" /> Quick
                  </span>
                )}
                <button onClick={clearCart} className="text-[10px] uppercase tracking-wider text-red-500 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full hover:bg-red-500/20 transition-all font-black">Clear All</button>
              </div>

              {items.map(item => (
                <div key={item.id} className="flex gap-3 p-3 bg-white/60 rounded-2xl border border-black/5">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">{item.title || (item as any).name}</p>
                    <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                      <Truck className="w-3 h-3" /> {item.category}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-2 bg-slate-50 rounded-full p-0.5 border border-slate-100">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 rounded-full bg-white text-slate-600 flex items-center justify-center shadow-sm">
                          <Minus className="w-3 h-3" strokeWidth={3} />
                        </button>
                        <span className="text-sm font-black w-4 text-center text-slate-900">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                          <Plus className="w-3 h-3" strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between py-0.5">
                    <p className="text-sm font-bold text-slate-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                    <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Summary + Checkout */}
            <div className="w-64 shrink-0 flex flex-col gap-4">
              {/* Price Summary */}
              <div className="bg-white/60 rounded-2xl border border-black/5 p-4 space-y-3">
                <h3 className="font-bold text-slate-800 text-sm">Payment Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600"><span>Subtotal</span><span className="font-bold text-slate-900">₹{totalPrice.toFixed(2)}</span></div>
                  <div className="flex justify-between text-slate-600"><span>Delivery</span><span className="font-bold text-slate-900">₹{displayedDelivery.toFixed(2)}</span></div>
                  {hasFreeDelivery && (
                    <div className="flex justify-between text-emerald-500 text-xs"><span>CB Membership</span><span className="font-bold">-₹{displayedDelivery.toFixed(2)}</span></div>
                  )}
                  {hasFlavourCombo && paymentMethod !== "cod" && (
                    <div className="flex justify-between text-violet-500 text-xs"><span>FF Promo</span><span className="font-bold">-₹7.00</span></div>
                  )}
                  <div className="border-t border-slate-100 pt-2 flex justify-between items-center">
                    <span className="font-bold text-slate-900">Total</span>
                    <span className="text-xl font-black text-slate-900">₹{orderTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Location Badge */}
              {hasLocation && (
                <div className="bg-emerald-50 rounded-xl px-3 py-2 flex items-center gap-2 border border-emerald-100">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-emerald-800 truncate">{hostel} – {room}</p>
                    <p className="text-[10px] text-emerald-600">{phoneClean}</p>
                  </div>
                </div>
              )}

              {/* Checkout Flow */}
              {!showCheckout ? (
                <div className="flex flex-col gap-2 mt-auto">
                  {!hasLocation && (
                    <p className="text-xs text-red-500 font-semibold flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Set location in Settings first
                    </p>
                  )}
                  <button
                    onClick={() => { if (!user) { navigate("/login"); return; } if (!hasLocation) { setShowLocationPrompt(true); return; } setShowCheckout(true); }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Package className="w-4 h-4" /> Proceed to Checkout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3 mt-auto">
                  <PaymentSelector selected={paymentMethod} onChange={setPaymentMethod} totalAmount={orderTotal} disabled={submitting} />

                  {paymentMethod === "virtual_card" ? (
                    <VirtualCardSwipePayment
                      amount={orderTotal}
                      balance={walletBalance}
                      winningsBalance={winningsBalance}
                      userName={profileName || "CU USER"}
                      onSuccess={async () => {
                        try { setSubmitting(true); await createOrder(); toast({ title: "Payment successful! 🎉" }); }
                        catch (e: any) { toast({ title: "Failed", description: e.message, variant: "destructive" }); }
                        finally { setSubmitting(false); }
                      }}
                      onCancel={() => {}}
                    />
                  ) : (
                    <button
                      onClick={paymentMethod === "online" ? () => setShowUpiModal(true) : handleCheckout}
                      disabled={submitting || !isFormValid}
                      className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${isFormValid ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-md" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
                    >
                      {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : paymentMethod === "online" ? `Pay ₹${orderTotal.toFixed(2)} via UPI` : `Confirm ₹${orderTotal.toFixed(2)}`}
                    </button>
                  )}

                  <button onClick={() => setShowCheckout(false)} className="text-xs text-slate-400 hover:text-slate-600 transition-colors text-center">
                    <ArrowLeft className="w-3 h-3 inline mr-1" /> Back to cart
                  </button>
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
        onPaymentVerify={async (id) => {
          setSubmitting(true);
          try { await createOrder(id); }
          catch (e: any) { throw new Error("Failed to create order. " + e.message); }
          finally { setSubmitting(false); }
        }}
      />
    </DesktopWindow>
  );
}
