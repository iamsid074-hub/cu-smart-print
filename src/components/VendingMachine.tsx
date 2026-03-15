import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, X, CheckCircle, MapPin, Phone, Zap, ArrowRight, Loader2, Info } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import UpiPaymentModal from "./UpiPaymentModal";

interface VendingItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity?: string;
}

const ROWS: { title: string; items: VendingItem[] }[] = [
  {
    title: "Chips Section",
    items: [
      { id: "v-lays-blue", name: "Lay's Magic Masala", price: 25, image: "/grocery/lays-blue.png" },
      { id: "v-kurkure", name: "Kurkure Masala", price: 25, image: "/grocery/kurkure.png" },
      { id: "v-lays-blue-2", name: "Lay's Magic Masala", price: 25, image: "/grocery/lays-blue.png" },
      { id: "v-kurkure-2", name: "Kurkure Masala", price: 25, image: "/grocery/kurkure.png" }
    ]
  },
  {
    title: "Maggi Section",
    items: [
      { id: "v-maggi-1", name: "Maggi Noodles", price: 10, image: "/grocery/maggi.png", quantity: "Single Pack" },
      { id: "v-maggi-2", name: "Maggi Noodles", price: 10, image: "/grocery/maggi.png" },
      { id: "v-maggi-3", name: "Maggi Noodles", price: 10, image: "/grocery/maggi.png" }
    ]
  },
  {
    title: "Donut Section",
    items: [
      { id: "v-donut-1", name: "Ziggy Donut", price: 20, image: "/grocery/donut.png" },
      { id: "v-donut-2", name: "Ziggy Donut", price: 20, image: "/grocery/donut.png" },
      { id: "v-donut-3", name: "Ziggy Donut", price: 20, image: "/grocery/donut.png" }
    ]
  },
  {
    title: "Soft Drink Cans",
    items: [
      { id: "v-coke-can", name: "Coke Can", price: 35, image: "/grocery/coca-cola.png" },
      { id: "v-sprite-can", name: "Sprite Can", price: 35, image: "/grocery/sprite.png" },
      { id: "v-thumsup-can", name: "Thums Up Can", price: 35, image: "/grocery/thums-up.png" }
    ]
  },
  {
    title: "Bottle Drinks",
    items: [
      { id: "v-coke-750", name: "Coca-Cola", price: 40, image: "/grocery/coke-750.png", quantity: "750ml" },
      { id: "v-sprite-750", name: "Sprite", price: 40, image: "/grocery/sprite-750.png", quantity: "750ml" }
    ]
  }
];

export default function VendingMachine() {
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedItem, setSelectedItem] = useState<VendingItem | null>(null);
  const [isVending, setIsVending] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [vendedItem, setVendedItem] = useState<VendingItem | null>(null);

  // Form State
  const [hostel, setHostel] = useState<"NC" | "Zakir">("NC");
  const [floor, setFloor] = useState<number>(1);
  const [room, setRoom] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUpiModal, setShowUpiModal] = useState(false);

  const calculateDeliveryCharge = (f: number) => {
    if (f <= 3) return 8;
    if (f <= 6) return 11;
    if (f <= 9) return 14;
    return 16;
  };

  const deliveryCharge = calculateDeliveryCharge(floor);
  const totalAmount = (selectedItem?.price || 0) + deliveryCharge;

  const handleSelectItem = (item: VendingItem) => {
    if (isVending) return;
    setSelectedItem(item);
    setIsVending(true);

    // Vending Animation logic handled by Framer Motion and state
    setTimeout(() => {
      setVendedItem(item);
      setIsVending(false);
      // Wait for drop animation to finish before showing checkout
      setTimeout(() => setShowCheckout(true), 800);
    }, 1500);
  };

  const finalizeVendingOrder = async (utrNumber: string) => {
    if (!user || !selectedItem) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("orders").insert({
        product_id: null,
        buyer_id: user.id,
        seller_id: "7450c873-f51d-469e-a33d-c44ca80beb0c", // Admin Seller
        base_price: selectedItem.price,
        commission: 0,
        delivery_charge: deliveryCharge,
        total_price: totalAmount,
        delivery_location: `${hostel} Hostel - Floor ${floor}`,
        delivery_room: `[VENDING MACHINE: Room ${room}]\n${selectedItem.name}`,
        buyer_phone: phone,
        status: 'pending',
        razorpay_payment_id: utrNumber,
        seller_notified_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast({ title: "Order Successful! 🎉", description: "Your snack is on the way to your floor." });
      setShowUpiModal(false);
      setShowCheckout(false);
      setSelectedItem(null);
      setVendedItem(null);
      navigate('/tracking');
    } catch (err: any) {
      toast({ title: "Order failed", description: err.message || "Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-12 px-4 relative overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center mb-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-4 shadow-xl"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Inventory
          </motion.div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2">Hostel Smart Vending Machine</h2>
          <p className="text-slate-500 font-medium max-w-md">Real snacks, real fast. Delivery charges calculated automatically based on your floor.</p>
        </div>

        {/* ─── Vending Machine UI ─── */}
        <div className="relative mx-auto w-full max-w-[500px]">
          {/* Main Body */}
          <div className="relative rounded-[40px] bg-[#1a1c2c] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.5),inset_0_2px_10px_rgba(255,255,255,0.1)] border-t-[6px] border-x-[6px] border-slate-800 overflow-hidden">
            {/* LED Glows */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-purple-500 opacity-50 blur-sm" />
            
            {/* Glass Panel */}
            <div className="relative rounded-3xl bg-slate-900/40 p-4 border border-white/5 backdrop-blur-sm min-h-[600px] flex flex-col justify-between">
              {/* Shelves Container */}
              <div className="space-y-4">
                {ROWS.map((row, ri) => (
                  <div key={ri} className="relative">
                    {/* Shelf */}
                    <div className="flex justify-around items-end gap-2 pb-2 px-2 relative z-10">
                      {row.items.map((item, ii) => (
                        <div key={ii} className="relative group flex flex-col items-center">
                          {/* Item Sprite */}
                          <motion.div
                            animate={isVending && selectedItem?.id === item.id ? { 
                              y: [0, 20, 400], 
                              opacity: [1, 1, 0],
                              scale: [1, 1.1, 0.8],
                              rotate: [0, 5, 20]
                            } : {}}
                            transition={{ duration: 1.5, ease: "easeIn" }}
                            className="relative"
                          >
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className={`w-12 h-16 sm:w-16 sm:h-20 object-contain drop-shadow-lg filter transition-all duration-300 ${isVending && selectedItem?.id === item.id ? 'brightness-110 contrast-125' : 'group-hover:brightness-110'}`} 
                            />
                            {/* Reflection on item */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none rounded-lg" />
                          </motion.div>
                          
                          {/* Selection Tag */}
                          <button
                            onClick={() => handleSelectItem(item)}
                            disabled={isVending}
                            className="mt-2 px-2 py-1 rounded bg-slate-800 border border-white/10 text-[9px] font-black text-white hover:bg-emerald-500 transition-colors shadow-lg active:scale-95 disabled:opacity-50"
                          >
                            {ri + 1}
                            {ii + 1}
                          </button>
                        </div>
                      ))}
                    </div>
                    {/* Metal Rack Line */}
                    <div className="absolute bottom-6 left-0 right-0 h-1.5 bg-gradient-to-b from-slate-400 to-slate-600 rounded-full z-0 opacity-40" />
                  </div>
                ))}
              </div>

              {/* Bottom Dispenser Bin */}
              <div className="mt-8 border-t-4 border-slate-800 pt-8 pb-4 relative">
                <div className="h-24 sm:h-32 bg-slate-950 rounded-2xl flex items-center justify-center relative overflow-hidden shadow-inner">
                  <div className="absolute inset-0 bg-gradient-to-b from-black to-transparent opacity-60" />
                  
                  {/* Dropped Product Visual */}
                  <AnimatePresence>
                    {vendedItem && (
                      <motion.div
                        initial={{ y: -100, opacity: 0, scale: 0.5 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative z-10 flex flex-col items-center"
                      >
                        <img src={vendedItem.image} className="w-16 h-16 object-contain drop-shadow-2xl" alt="Dropped" />
                        <div className="absolute -bottom-2 px-4 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-tighter shadow-lg">Grab it!</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Right Control Bar (Keypad, Coins) */}
            <div className="absolute top-1/2 right-4 -translate-y-1/2 flex flex-col gap-4 items-center">
              {/* Display Screen */}
              <div className="w-16 h-10 bg-slate-900 border border-emerald-500/30 rounded flex items-center justify-center p-1 overflow-hidden shadow-[inset_0_0_10px_rgba(16,209,110,0.2)]">
                <span className="text-emerald-400 font-mono text-[10px] sm:text-xs tracking-tighter animate-pulse">
                  {selectedItem ? 'VENDING...' : 'READY'}
                </span>
              </div>
              
              {/* Keypad Grid */}
              <div className="grid grid-cols-2 gap-1 bg-slate-800 p-1 rounded-lg">
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <div key={n} className="w-4 h-4 rounded-sm bg-slate-700 flex items-center justify-center text-[8px] text-white/50">{n}</div>
                ))}
              </div>

              {/* Coin Slot */}
              <div className="w-1 h-8 bg-slate-900 rounded-full border border-white/5 shadow-inner" />
            </div>
          </div>

          {/* Vending Machine Footer/Legs */}
          <div className="flex justify-between px-12 -mt-4">
            <div className="w-12 h-6 bg-slate-900 rounded-b-xl" />
            <div className="w-12 h-6 bg-slate-900 rounded-b-xl" />
          </div>
        </div>
      </div>

      {/* ─── Vending Checkout Modal ─── */}
      <Dialog open={showCheckout} onOpenChange={() => { if (!isSubmitting) setShowCheckout(false); }}>
        <AnimatePresence>
          {showCheckout && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6"
            >
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => { if (!isSubmitting) setShowCheckout(false); }} />
              
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative bg-white w-full max-w-[480px] rounded-[3rem] overflow-hidden shadow-2xl border border-slate-100"
              >
                {/* Header Section */}
                <div className="bg-[#1a1c2c] p-8 pb-12 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                    <ShoppingBag className="w-32 h-32 text-white" />
                  </div>
                  <button 
                    onClick={() => setShowCheckout(false)}
                    className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="relative z-10 flex items-center gap-6">
                    <div className="w-24 h-24 rounded-3xl bg-white/10 p-4 border border-white/20 flex items-center justify-center shadow-2xl">
                      <img src={selectedItem?.image} alt="Product" className="w-full h-full object-contain filter brightness-110 drop-shadow-xl" />
                    </div>
                    <div>
                      <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-1 items-center flex gap-1.5">
                        <CheckCircle className="w-3 h-3" /> Vended Successfully
                      </p>
                      <h3 className="text-2xl font-black text-white leading-tight">{selectedItem?.name}</h3>
                      <p className="text-white/60 font-medium text-sm">₹{selectedItem?.price}</p>
                    </div>
                  </div>
                </div>

                {/* Body / Selection Section */}
                <div className="p-8 -mt-8 bg-white rounded-t-[3rem] relative z-20 space-y-6">
                  <div className="space-y-4">
                    {/* Hostel Selection */}
                    <div className="grid grid-cols-2 gap-3">
                      {(['NC', 'Zakir'] as const).map(h => (
                        <button
                          key={h}
                          onClick={() => setHostel(h)}
                          className={`h-16 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${hostel === h ? 'border-brand bg-brand/5' : 'border-slate-100 bg-slate-50 opacity-60 hover:opacity-100'}`}
                        >
                          <span className={`text-[10px] font-black uppercase tracking-tighter ${hostel === h ? 'text-brand' : 'text-slate-400'}`}>Hostel</span>
                          <span className={`text-lg font-black ${hostel === h ? 'text-slate-900' : 'text-slate-500'}`}>{h}</span>
                        </button>
                      ))}
                    </div>

                    {/* Floor Selector */}
                    <div className="space-y-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <MapPin className="w-3 h-3" /> Select Floor (NC: 9 | Zakir: 11)
                      </p>
                      <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100 items-center justify-between">
                        <button 
                          onClick={() => setFloor(Math.max(1, floor - 1))}
                          className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-brand transition-all shadow-sm active:scale-95"
                        >
                          <ArrowRight className="w-4 h-4 rotate-180" />
                        </button>
                        <div className="text-center flex flex-col">
                          <span className="text-sm font-black text-slate-400 uppercase tracking-tighter leading-none">Floor</span>
                          <span className="text-2xl font-black text-slate-900">{floor}</span>
                        </div>
                        <button 
                          onClick={() => setFloor(Math.min(hostel === 'NC' ? 9 : 11, floor + 1))}
                          className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-brand transition-all shadow-sm active:scale-95"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Room & Phone Input */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Room No.</label>
                        <input 
                          value={room}
                          onChange={e => setRoom(e.target.value)}
                          placeholder="Ex: 504"
                          className="w-full h-14 bg-slate-50 rounded-2xl px-4 border border-slate-100 focus:border-brand focus:bg-white transition-all text-sm font-bold placeholder:font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Phone</label>
                        <input 
                          type="tel"
                          value={phone}
                          onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                          placeholder="Your Number"
                          className="w-full h-14 bg-slate-50 rounded-2xl px-4 border border-slate-100 focus:border-brand focus:bg-white transition-all text-sm font-bold placeholder:font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Summary & Price */}
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-bold">Product Price</span>
                      <span className="text-slate-900 font-black">₹{selectedItem?.price}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-bold flex items-center gap-1.5">Floor {floor} Delivery Charge <Info className="w-3 h-3 opacity-50" /></span>
                      <span className="text-emerald-600 font-black">₹{deliveryCharge}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                      <span className="text-sm font-black text-slate-600">Total Amount</span>
                      <span className="text-2xl font-black text-brand">₹{totalAmount}</span>
                    </div>
                  </div>

                  {/* Purchase Button */}
                  <button
                    disabled={!room || phone.length !== 10 || isSubmitting}
                    onClick={() => { if (!user) navigate('/login'); else setShowUpiModal(true); }}
                    className="w-full h-16 rounded-3xl bg-slate-900 text-white font-black text-base shadow-2xl transition-all hover:bg-black active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 group"
                  >
                    {!room || phone.length !== 10 ? 'Fill Details to Proceed' : `Pay ₹${totalAmount} via Scanner`}
                    <Zap className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Dialog>

      {/* UPI Payment Gateway */}
      <UpiPaymentModal
        isOpen={showUpiModal}
        onClose={() => setShowUpiModal(false)}
        amount={totalAmount}
        orderIdText={`VEND_${Date.now().toString().slice(-6)}`}
        customerId={user?.id || "guest"}
        customerPhone={phone}
        onPaymentVerify={finalizeVendingOrder}
      />
    </section>
  );
}

// Simple Shadow UI Dialog shim for compatibility if not using shadcn Registry
function Dialog({ children, open, onOpenChange }: { children: React.ReactNode, open: boolean, onOpenChange: (val: boolean) => void }) {
  if (!open) return null;
  return <>{children}</>;
}
