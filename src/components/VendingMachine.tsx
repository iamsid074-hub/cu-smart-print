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
      { id: "vending-lays-blue", name: "Lay's Blue", price: 25, image: "/grocery/lays-blue.webp" },
      { id: "vending-kurkure", name: "Kurkure", price: 25, image: "/grocery/kurkure.webp" },
      { id: "vending-lays-orange", name: "Lay's Orange", price: 25, image: "/grocery/lays-blue.webp" }, // Replaced with orange if diff image exists, using blue for now
      { id: "vending-kurkure-alt", name: "Kurkure", price: 25, image: "/grocery/kurkure.webp" }
    ]
  },
  {
    title: "Maggi",
    items: [
      { id: "vending-maggi-1", name: "Maggi", price: 10, image: "/grocery/maggi.webp" },
      { id: "vending-maggi-2", name: "Maggi", price: 10, image: "/grocery/maggi.webp" },
      { id: "vending-maggi-3", name: "Maggi", price: 10, image: "/grocery/maggi.webp" },
      { id: "vending-maggi-4", name: "Maggi", price: 10, image: "/grocery/maggi.webp" }
    ]
  },
  {
    title: "Bakery",
    items: [
      { id: "vending-donut-1", name: "Donut", price: 20, image: "/grocery/donut.webp" },
      { id: "vending-donut-2", name: "Donut", price: 20, image: "/grocery/donut.webp" },
      { id: "vending-donut-3", name: "Donut", price: 20, image: "/grocery/donut.webp" },
      { id: "vending-donut-4", name: "Donut", price: 20, image: "/grocery/donut.webp" }
    ]
  },
  {
    title: "Large Bottles",
    items: [
      { id: "vending-coke-750-1", name: "Coke 750ml", price: 40, image: "/grocery/coke-750.webp" },
      { id: "vending-sprite-750-1", name: "Sprite 750ml", price: 40, image: "/grocery/sprite-750.webp" },
      { id: "vending-coke-750-2", name: "Coke 750ml", price: 40, image: "/grocery/coke-750.webp" },
      { id: "vending-sprite-750-2", name: "Sprite 750ml", price: 40, image: "/grocery/sprite-750.webp" }
    ]
  }
];

export default function VendingMachine() {
  const { items, addItem, removeItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [animatingItem, setAnimatingItem] = useState<VendingItem | null>(null);
  const [isVending, setIsVending] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [vendedItemEffect, setVendedItemEffect] = useState<VendingItem | null>(null);
  
  // Animation state for "Added to Cart" feedback
  const [addedPopup, setAddedPopup] = useState<{ x: number, y: number, name: string } | null>(null);

  // Form State
  const [hostel, setHostel] = useState<"NC" | "Zakir">("NC");
  const [floor, setFloor] = useState<number>(1);
  const [room, setRoom] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUpiModal, setShowUpiModal] = useState(false);

  // Filter cart for vending specific items
  const vendingCartItems = items.filter(i => i.category === "Vending Machine");

  const calculateDeliveryCharge = (f: number) => {
    if (f <= 3) return 8;
    if (f <= 6) return 11;
    if (f <= 9) return 14;
    return 16;
  };

  const deliveryCharge = calculateDeliveryCharge(floor);
  const vendingSubtotal = vendingCartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalAmount = vendingSubtotal > 0 ? vendingSubtotal + deliveryCharge : 0;

  const handleSelectItem = (item: VendingItem, e: React.MouseEvent) => {
    if (isVending) return;
    
    // Add to Global Cart
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

    setAnimatingItem(item);
    setIsVending(true);

    // Vending Animation
    setTimeout(() => {
      setVendedItemEffect(item);
      setIsVending(false);
      // Wait for drop animation to settle
      setTimeout(() => {
        setVendedItemEffect(null);
        setAnimatingItem(null);
      }, 2000);
    }, 1500);
  };

  const finalizeVendingOrder = async (utrNumber: string) => {
    if (!user || vendingCartItems.length === 0) return;
    setIsSubmitting(true);
    try {
      const itemsSummary = vendingCartItems.map(i => `${i.quantity}x ${i.title} [IMG:${i.image}] (₹${i.price})`).join("\n");
      const { error } = await supabase.from("orders").insert({
        product_id: null,
        buyer_id: user.id,
        seller_id: "7450c873-f51d-469e-a33d-c44ca80beb0c", // Admin Seller
        base_price: vendingSubtotal,
        commission: 0,
        delivery_charge: deliveryCharge,
        total_price: totalAmount,
        delivery_location: `${hostel} Hostel - Floor ${floor}`,
        delivery_room: `[VENDING MACHINE: Room ${room}]\n${itemsSummary}`,
        buyer_phone: phone,
        status: 'pending',
        razorpay_payment_id: utrNumber,
        seller_notified_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast({ title: "Order Successful! 🎉", description: "Your items are on the way to your floor." });
      vendingCartItems.forEach(item => removeItem(item.id)); // Clear vending items from cart
      setShowUpiModal(false);
      setShowCheckout(false);
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
          <p className="text-slate-500 font-medium max-w-md">Real snacks, 4-row layout. Fast delivery calculated by floor.</p>
        </div>

        {/* ─── Vending Machine UI ─── */}
        <div className="relative mx-auto w-full max-w-[420px]">
          {/* Main Body */}
          <div className="relative rounded-[40px] bg-[#1a1c2c] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.5),inset_0_2px_10px_rgba(255,255,255,0.1)] border-t-[6px] border-x-[6px] border-slate-800 overflow-hidden">
            {/* LED Glows */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-purple-500 opacity-50 blur-sm" />
            
            {/* Glass Panel */}
            <div className="relative rounded-3xl bg-slate-900/40 p-4 border border-white/5 backdrop-blur-sm min-h-[500px] flex flex-col justify-between overflow-hidden">
              {/* Glass Reflection Overlay */}
              <div className="absolute inset-0 pointer-events-none rounded-3xl z-40 overflow-hidden">
                <div className="absolute top-[-50%] left-[-20%] w-[150%] h-[200%] bg-gradient-to-tr from-transparent via-white/10 to-transparent rotate-[25deg] shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]" />
                <div className="absolute top-[-20%] left-[30%] w-[50%] h-[150%] bg-gradient-to-tr from-transparent via-white/5 to-transparent rotate-[25deg]" />
              </div>

              {/* Shelves Container */}
              <div className="space-y-4">
                {ROWS.map((row, ri) => (
                  <div key={ri} className="relative">
                    {/* Shelf Content */}
                    <div className="grid grid-cols-4 gap-2 pb-6 px-1 relative z-10">
                      {row.items.map((item, ii) => (
                        <div key={ii} className="relative group flex flex-col items-center justify-end h-28 sm:h-36">
                          
                          {/* Item Slot with Depth (Stacking) */}
                          <div className="relative w-full h-full flex items-center justify-center">
                            {/* Back Section of Coil (Behind Items) */}
                            <div className="absolute bottom-[-5px] w-[110%] h-10 pointer-events-none z-0 translate-y-2 opacity-40">
                              <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full">
                                <path d="M 10,25 C 10,5 30,5 30,25 M 25,25 C 25,5 45,5 45,25 M 40,25 C 40,5 60,5 60,25 M 55,25 C 55,5 75,5 75,25 M 70,25 C 70,5 90,5 90,25 M 85,25 C 85,5 105,5 105,25" fill="none" stroke="#0f172a" strokeWidth="4" />
                              </svg>
                            </div>

                            {/* Static Background Stacks */}
                            {[4, 3, 2, 1].map((depth) => (
                              <div 
                                key={depth}
                                className="absolute pointer-events-none"
                                style={{ 
                                  transform: `translateZ(-${depth * 25}px) translateY(-${depth * 3}px) scale(${1 - depth * 0.06})`,
                                  opacity: 1 - depth * 0.15,
                                  filter: `brightness(${1 - depth * 0.15}) drop-shadow(0 4px 6px rgba(0,0,0,0.6))`
                                }}
                              >
                                <img 
                                  src={item.image} 
                                  alt="" 
                                  className="w-10 h-14 sm:w-16 sm:h-20 object-contain" 
                                />
                              </div>
                            ))}

                            {/* Front (Interactive) Item */}
                            <motion.div
                              animate={isVending && animatingItem?.id === item.id ? { 
                                y: [0, 20, 500], 
                                opacity: [1, 1, 0],
                                scale: [1, 1.05, 0.9],
                                rotate: [0, 2, 15]
                              } : {}}
                              onClick={(e) => handleSelectItem(item, e)}
                              transition={isVending && animatingItem?.id === item.id ? { 
                                y: { type: "spring", stiffness: 100, damping: 20, bounce: 0.1, duration: 1.5 },
                                opacity: { duration: 1.5 },
                                scale: { duration: 0.2 }
                              } : { duration: 1.5, ease: "easeIn" }}
                              className="relative cursor-pointer z-10"
                            >
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                className={`w-10 h-14 sm:w-16 sm:h-20 object-contain drop-shadow-[0_8px_15px_rgba(0,0,0,0.4)] filter transition-all duration-300 ${isVending && animatingItem?.id === item.id ? 'brightness-125 contrast-125' : 'group-hover:scale-105 active:scale-95 group-hover:brightness-110'}`} 
                              />
                              {/* Reflection on item */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none rounded-lg" />
                            </motion.div>

                            {/* Front Section of Spring/Coil (In Front of Items) */}
                            <div className="absolute bottom-[-5px] w-[110%] h-10 pointer-events-none z-20 translate-y-2">
                               <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
                                  <defs>
                                    <linearGradient id="metal-coil" x1="0%" y1="0%" x2="0%" y2="100%">
                                      <stop offset="0%" stopColor="#f8fafc" />
                                      <stop offset="40%" stopColor="#94a3b8" />
                                      <stop offset="70%" stopColor="#475569" />
                                      <stop offset="100%" stopColor="#0f172a" />
                                    </linearGradient>
                                  </defs>
                                  <path d="M 0,25 C 10,45 30,45 30,25 M 25,25 C 25,45 45,45 45,25 M 40,25 C 40,45 60,45 60,25 M 55,25 C 55,45 75,45 75,25 M 70,25 C 70,45 90,45 90,25 M 85,25 C 85,45 105,45 105,25" fill="none" stroke="url(#metal-coil)" strokeWidth="3" strokeLinecap="round" />
                               </svg>
                            </div>
                          </div>
                          
                          {/* Selection / Label Container */}
                          <div className="mt-2 flex flex-col items-center gap-0.5 pointer-events-none">
                            <span className="text-[7px] sm:text-[9px] font-black text-white/90 bg-slate-950/60 px-1.5 py-0.5 rounded shadow-sm backdrop-blur-[2px] border border-white/10 truncate max-w-[55px] sm:max-w-none">
                                {item.name}
                            </span>
                            <span className="text-[7px] sm:text-[8px] font-black text-emerald-400">
                                ₹{item.price}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Metal Rack Line (Polished) */}
                    <div className="absolute bottom-6 left-0 right-0 h-2 bg-gradient-to-b from-slate-500 via-slate-600 to-slate-800 rounded-full z-0 opacity-60 shadow-[0_4px_8px_rgba(0,0,0,0.6)]" />
                  </div>
                ))}
              </div>

              {/* Bottom Dispenser Bin */}
              <div className="mt-4 border-t-[5px] border-slate-800 pt-6 pb-4 relative">
                <div className="h-24 sm:h-32 bg-slate-950 rounded-2xl flex items-center justify-center relative overflow-hidden shadow-[inset_0_4px_20px_rgba(0,0,0,0.9)] cursor-pointer group/bin" onClick={() => vendingCartItems.length > 0 && setShowCheckout(true)}>
                  <div className="absolute inset-0 bg-gradient-to-b from-black/90 to-transparent opacity-80" />
                  
                  {/* Dropped Product Visual */}
                  <AnimatePresence>
                    {vendedItemEffect && (
                      <motion.div
                        initial={{ y: -150, opacity: 0, scale: 0.6, rotate: -10 }}
                        animate={{ y: 10, opacity: 1, scale: 1, rotate: 2 }}
                        transition={{ type: "spring", stiffness: 150, damping: 12, bounce: 0.05 }}
                        exit={{ opacity: 0 }}
                        className="relative z-10 flex flex-col items-center"
                      >
                        <img src={vendedItemEffect.image} className="w-16 h-16 object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]" alt="Dropped" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Checkout Prompt */}
                  {vendingCartItems.length > 0 && !isVending && !vendedItemEffect && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative z-20 flex flex-col items-center gap-2"
                    >
                        <ShoppingBag className="w-8 h-8 text-emerald-400 animate-bounce" />
                        <div className="px-4 py-1.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest shadow-2xl border border-white/20">
                            Check Out {vendingCartItems.length} Item{vendingCartItems.length > 1 ? 's' : ''}
                        </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* Added to Cart Popup */}
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
                             <CheckCircle className="w-3 h-3" /> Added {addedPopup.name}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
          </div>

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
                className="relative bg-white w-full max-w-[420px] rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100"
              >
                {/* Header Section (Shrunk) */}
                <div className="bg-[#1a1c2c] p-6 pb-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
                    <ShoppingBag className="w-20 h-20 text-white" />
                  </div>
                  <button 
                    onClick={() => setShowCheckout(false)}
                    className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all z-50"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="relative z-10">
                    <p className="text-emerald-400 text-[9px] font-black uppercase tracking-widest mb-1 flex items-center gap-1.5">
                      <CheckCircle className="w-3 h-3" /> Vending Cart
                    </p>
                    <h3 className="text-xl font-black text-white leading-tight">Checkout Items</h3>
                    <p className="text-white/40 font-bold text-[10px] mt-1 italic">Vending Machine Order</p>
                  </div>
                </div>

                {/* Body Section */}
                <div className="p-6 -mt-6 bg-white rounded-t-[2.5rem] relative z-20 space-y-5">
                  
                  {/* Scrollable Item List */}
                  <div className="max-h-[180px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {vendingCartItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100 group">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-sm">
                              <img src={item.image} className="w-full h-full object-contain" alt="" />
                           </div>
                           <div>
                              <p className="text-[11px] font-black text-slate-900 leading-none">{item.title}</p>
                              <p className="text-[10px] text-brand font-bold mt-1">₹{item.price} × {item.quantity}</p>
                           </div>
                        </div>
                        <button 
                            onClick={() => removeItem(item.id)}
                            className="w-7 h-7 rounded-lg bg-slate-200/50 flex items-center justify-center text-slate-400 hover:bg-rose-100 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {vendingCartItems.length === 0 && (
                        <div className="text-center py-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                             <p className="text-xs text-slate-400 font-bold italic">Cart is empty</p>
                        </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {/* Hostel Selection */}
                    <div className="grid grid-cols-2 gap-2">
                      {(['NC', 'Zakir'] as const).map(h => (
                        <button key={h} onClick={() => setHostel(h)} className={`h-12 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${hostel === h ? 'border-brand bg-brand/5' : 'border-slate-100 bg-slate-50 opacity-60 hover:opacity-100'}`}>
                          <span className={`text-[8px] font-black uppercase tracking-tighter ${hostel === h ? 'text-brand' : 'text-slate-400'}`}>Hostel</span>
                          <span className={`text-sm font-black ${hostel === h ? 'text-slate-900' : 'text-slate-500'}`}>{h}</span>
                        </button>
                      ))}
                    </div>

                    {/* Floor Selector */}
                    <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100 items-center justify-between">
                        <button onClick={() => setFloor(Math.max(1, floor - 1))} className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-brand transition-all shadow-sm"><ArrowRight className="w-3.5 h-3.5 rotate-180" /></button>
                        <div className="text-center flex flex-col scale-90">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Floor</span>
                            <span className="text-xl font-black text-slate-900">{floor}</span>
                        </div>
                        <button onClick={() => setFloor(Math.min(hostel === 'NC' ? 9 : 11, floor + 1))} className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-brand transition-all shadow-sm"><ArrowRight className="w-3.5 h-3.5" /></button>
                    </div>

                    {/* Room & Phone Input */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-1 flex justify-between">
                                Room No.
                                {room && !room.startsWith(floor.toString()) && <span className="text-rose-500 lowercase font-bold">Starts with {floor}</span>}
                            </label>
                            <input value={room} onChange={e => setRoom(e.target.value.replace(/\D/g, ""))} placeholder={`Ex: ${floor}01`} className={`w-full h-11 bg-slate-50 rounded-xl px-3 border transition-all text-xs font-bold ${room && !room.startsWith(floor.toString()) ? 'border-rose-500 bg-rose-50' : 'border-slate-100 focus:border-brand'}`} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-1 text-center block">Phone</label>
                            <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="Your Number" className="w-full h-11 bg-slate-50 rounded-xl px-3 border border-slate-100 focus:border-brand transition-all text-xs font-bold" />
                        </div>
                    </div>
                  </div>

                  {/* Price Summary (More Compact) */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-500 font-bold">Subtotal ({vendingCartItems.length})</span>
                      <span className="text-slate-900 font-black">₹{vendingSubtotal}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-500 font-bold">Floor Delivery</span>
                      <span className="text-emerald-600 font-black">+ ₹{deliveryCharge}</span>
                    </div>
                    <div className="pt-1.5 mt-1 border-t border-slate-200 flex justify-between items-center">
                      <span className="text-xs font-black text-slate-600">Total</span>
                      <span className="text-lg font-black text-brand">₹{totalAmount}</span>
                    </div>
                  </div>

                  <button
                    disabled={vendingCartItems.length === 0 || !room || !room.startsWith(floor.toString()) || phone.length !== 10 || isSubmitting}
                    onClick={() => { if (!user) navigate('/login'); else setShowUpiModal(true); }}
                    className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black text-[15px] shadow-xl transition-all hover:bg-black active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 group"
                  >
                    {vendingCartItems.length === 0 ? 'Add items first' : !room ? 'Enter Room No.' : !room.startsWith(floor.toString()) ? `Need Room ${floor}xx` : phone.length !== 10 ? 'Enter Phone' : `Pay ₹${totalAmount}`}
                    <Zap className="w-4 h-4 text-emerald-400" />
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

// Simple Shadow UI Dialog shim
function Dialog({ children, open, onOpenChange }: { children: React.ReactNode, open: boolean, onOpenChange: (val: boolean) => void }) {
  if (!open) return null;
  return <>{children}</>;
}
