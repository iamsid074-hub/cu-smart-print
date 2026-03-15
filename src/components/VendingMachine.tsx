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
    title: "Chips",
    items: [
      { id: "grocery-lays-blue", name: "Lay's Blue", price: 25, image: "/grocery/lays-blue.png" },
      { id: "grocery-kurkure", name: "Kurkure", price: 25, image: "/grocery/kurkure.png" },
      { id: "grocery-lays-blue-alt", name: "Lay's Blue", price: 25, image: "/grocery/lays-blue.png" },
      { id: "grocery-kurkure-alt", name: "Kurkure", price: 25, image: "/grocery/kurkure.png" },
      { id: "grocery-lays-blue-3", name: "Lay's Blue", price: 25, image: "/grocery/lays-blue.png" }
    ]
  },
  {
    title: "Maggi",
    items: [
      { id: "grocery-maggi-1", name: "Maggi", price: 10, image: "/grocery/maggi.png" },
      { id: "grocery-maggi-2", name: "Maggi", price: 10, image: "/grocery/maggi.png" },
      { id: "grocery-maggi-3", name: "Maggi", price: 10, image: "/grocery/maggi.png" },
      { id: "grocery-maggi-4", name: "Maggi", price: 10, image: "/grocery/maggi.png" },
      { id: "grocery-maggi-5", name: "Maggi", price: 10, image: "/grocery/maggi.png" }
    ]
  },
  {
    title: "Bakery",
    items: [
      { id: "grocery-donut-1", name: "Donut", price: 20, image: "/grocery/donut.png" },
      { id: "grocery-donut-2", name: "Donut", price: 20, image: "/grocery/donut.png" },
      { id: "grocery-donut-3", name: "Donut", price: 20, image: "/grocery/donut.png" },
      { id: "grocery-donut-4", name: "Donut", price: 20, image: "/grocery/donut.png" },
      { id: "grocery-donut-5", name: "Donut", price: 20, image: "/grocery/donut.png" }
    ]
  },
  {
    title: "Drink Cans",
    items: [
      { id: "grocery-coke-can-1", name: "Coke Can", price: 20, image: "/grocery/coca-cola.png" },
      { id: "grocery-sprite-can-1", name: "Sprite Can", price: 20, image: "/grocery/sprite.png" },
      { id: "grocery-fanta-can-1", name: "Fanta Can", price: 20, image: "/grocery/fanta.png" },
      { id: "grocery-dew-can-1", name: "Dew Can", price: 20, image: "/grocery/mountain-dew.png" },
      { id: "grocery-coke-can-2", name: "Coke Can", price: 20, image: "/grocery/coca-cola.png" }
    ]
  },
  {
    title: "Large Bottles",
    items: [
      { id: "grocery-coke-750-1", name: "Coke 750ml", price: 40, image: "/grocery/coke-750.png" },
      { id: "grocery-sprite-750-1", name: "Sprite 750ml", price: 40, image: "/grocery/sprite-750.png" },
      { id: "grocery-coke-750-2", name: "Coke 750ml", price: 40, image: "/grocery/coke-750.png" },
      { id: "grocery-sprite-750-2", name: "Sprite 750ml", price: 40, image: "/grocery/sprite-750.png" },
      { id: "grocery-coke-750-3", name: "Coke 750ml", price: 40, image: "/grocery/coke-750.png" }
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
  
  // Animation state for "Added to Cart" feedback
  const [addedPopup, setAddedPopup] = useState<{ x: number, y: number, name: string } | null>(null);

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
  const totalAmount = (vendedItem?.price || 0) + deliveryCharge;

  const handleSelectItem = (item: VendingItem, e: React.MouseEvent) => {
    if (isVending) return;
    
    // Instant Add to Cart logic
    addItem({
        id: item.id,
        title: item.name,
        price: item.price,
        image: item.image,
        category: "Vending Machine"
    });

    // Show visual confirmation at click location
    setAddedPopup({ x: e.clientX, y: e.clientY, name: item.name });
    setTimeout(() => setAddedPopup(null), 1000);

    setSelectedItem(item);
    setIsVending(true);

    // Vending Animation logic handled by Framer Motion and state
    setTimeout(() => {
      setVendedItem(item);
      setIsVending(false);
      // Wait for drop animation to finish before showing checkout
      setTimeout(() => setShowCheckout(true), 1200);
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
            <div className="relative rounded-3xl bg-slate-900/40 p-4 border border-white/5 backdrop-blur-sm min-h-[650px] flex flex-col justify-between overflow-hidden">
              {/* Shelves Container */}
              <div className="space-y-6">
                {ROWS.map((row, ri) => (
                  <div key={ri} className="relative">
                    {/* Shelf Content */}
                    <div className="grid grid-cols-5 gap-2 pb-6 px-1 relative z-10">
                      {row.items.map((item, ii) => (
                        <div key={ii} className="relative group flex flex-col items-center justify-end h-28 sm:h-36">
                          {/* Item Sprite */}
                          <motion.div
                            animate={isVending && selectedItem?.id === item.id ? { 
                              y: [0, 20, 450], 
                              opacity: [1, 1, 0],
                              scale: [1, 1.1, 0.8],
                              rotate: [0, 5, 25]
                            } : {}}
                            onClick={(e) => handleSelectItem(item, e)}
                            transition={{ duration: 1.5, ease: "easeIn" }}
                            className="relative cursor-pointer"
                          >
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className={`w-10 h-14 sm:w-16 sm:h-20 object-contain drop-shadow-[0_8px_15px_rgba(0,0,0,0.4)] filter transition-all duration-300 ${isVending && selectedItem?.id === item.id ? 'brightness-125 contrast-125' : 'group-hover:scale-110 active:scale-95 group-hover:brightness-110'}`} 
                            />
                            {/* Reflection on item */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none rounded-lg" />
                          </motion.div>
                          
                          {/* Selection / Label Container */}
                          <div className="mt-2 flex flex-col items-center gap-0.5 pointer-events-none">
                            <span className="text-[7px] sm:text-[9px] font-black text-white/90 bg-slate-950/60 px-1.5 py-0.5 rounded shadow-sm backdrop-blur-[2px] border border-white/5 truncate max-w-[50px] sm:max-w-none">
                                {item.name}
                            </span>
                            <span className="text-[7px] sm:text-[8px] font-black text-emerald-400">
                                ₹{item.price}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Metal Rack Line */}
                    <div className="absolute bottom-6 left-0 right-0 h-1.5 bg-gradient-to-b from-slate-400 via-slate-500 to-slate-700 rounded-full z-0 opacity-40 shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
                  </div>
                ))}
              </div>

              {/* Bottom Dispenser Bin */}
              <div className="mt-4 border-t-4 border-slate-800 pt-6 pb-4 relative">
                <div className="h-24 sm:h-32 bg-slate-950 rounded-2xl flex items-center justify-center relative overflow-hidden shadow-[inset_0_2px_15px_rgba(0,0,0,0.8)]">
                  <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-transparent opacity-60" />
                  
                  {/* Dropped Product Visual */}
                  <AnimatePresence>
                    {vendedItem && (
                      <motion.div
                        initial={{ y: -100, opacity: 0, scale: 0.5 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative z-10 flex flex-col items-center"
                      >
                        <img src={vendedItem.image} className="w-16 h-16 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]" alt="Dropped" />
                        <div className="absolute -bottom-2 px-4 py-1 rounded-full bg-emerald-500 text-white text-[9px] font-black uppercase tracking-tighter shadow-xl border border-white/20">Grab it!</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Added to Cart Popup (Portal-like) */}
            <AnimatePresence>
                {addedPopup && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: -60 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="fixed z-[99999] pointer-events-none px-4 py-2 rounded-2xl bg-slate-900 border border-emerald-500/30 text-emerald-400 font-black text-xs shadow-2xl backdrop-blur-md"
                        style={{ left: addedPopup.x - 40, top: addedPopup.y }}
                    >
                        <div className="flex items-center gap-2">
                             <CheckCircle className="w-3 h-3" />
                             Added!
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
          </div>

          {/* Vending Machine Footer/Legs */}
          <div className="flex justify-between px-12 -mt-4 relative z-0">
            <div className="w-14 h-8 bg-slate-900 rounded-b-2xl shadow-xl" />
            <div className="w-14 h-8 bg-slate-900 rounded-b-2xl shadow-xl" />
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
