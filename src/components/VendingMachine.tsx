import React, { useState, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, X, CheckCircle, ArrowRight, Zap } from "lucide-react";
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
      {
        id: "vending-lays-blue",
        name: "Lay's Blue",
        price: 25,
        image: "/grocery/lays-blue.webp",
      },
      {
        id: "vending-kurkure",
        name: "Kurkure",
        price: 25,
        image: "/grocery/kurkure.webp",
      },
      {
        id: "vending-lays-orange",
        name: "Lay's Orange",
        price: 25,
        image: "/grocery/lays-blue.webp",
      },
      {
        id: "vending-kurkure-alt",
        name: "Kurkure",
        price: 25,
        image: "/grocery/kurkure.webp",
      },
    ],
  },
  {
    title: "Maggi",
    items: [
      {
        id: "vending-maggi-1",
        name: "Maggi",
        price: 10,
        image: "/grocery/maggi.webp",
      },
      {
        id: "vending-maggi-2",
        name: "Maggi",
        price: 10,
        image: "/grocery/maggi.webp",
      },
      {
        id: "vending-maggi-3",
        name: "Maggi",
        price: 10,
        image: "/grocery/maggi.webp",
      },
      {
        id: "vending-maggi-4",
        name: "Maggi",
        price: 10,
        image: "/grocery/maggi.webp",
      },
    ],
  },
  {
    title: "Bakery",
    items: [
      {
        id: "vending-donut-1",
        name: "Donut",
        price: 20,
        image: "/grocery/donut.webp",
      },
      {
        id: "vending-donut-2",
        name: "Donut",
        price: 20,
        image: "/grocery/donut.webp",
      },
      {
        id: "vending-donut-3",
        name: "Donut",
        price: 20,
        image: "/grocery/donut.webp",
      },
      {
        id: "vending-donut-4",
        name: "Donut",
        price: 20,
        image: "/grocery/donut.webp",
      },
    ],
  },
  {
    title: "Large Bottles",
    items: [
      {
        id: "vending-coke-750-1",
        name: "Coke 750ml",
        price: 40,
        image: "/grocery/coke-750.webp",
      },
      {
        id: "vending-sprite-750-1",
        name: "Sprite 750ml",
        price: 40,
        image: "/grocery/sprite-750.webp",
      },
      {
        id: "vending-coke-750-2",
        name: "Coke 750ml",
        price: 40,
        image: "/grocery/coke-750.webp",
      },
      {
        id: "vending-sprite-750-2",
        name: "Sprite 750ml",
        price: 40,
        image: "/grocery/sprite-750.webp",
      },
    ],
  },
];

const MemoizedVendingCard = memo(
  ({
    item,
    isAnimating,
    isVending,
    onSelect,
  }: {
    item: VendingItem;
    isAnimating: boolean;
    isVending: boolean;
    onSelect: (item: VendingItem, e: React.MouseEvent) => void;
  }) => {
    return (
      <div className="relative group flex flex-col items-center justify-end h-24 sm:h-36">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Simple top coil line â€” replaces heavy SVG per card */}
          <div
            className="absolute bottom-[-2px] w-[90%] h-[3px] rounded-full pointer-events-none z-0 opacity-30"
            style={{
              background:
                "linear-gradient(to right, #334155, #94a3b8, #334155)",
            }}
          />

          {/* Single depth shadow behind the product â€” replaces 4 stacked images */}
          <div
            className="absolute pointer-events-none"
            style={{
              transform: "translate3d(0, -6px, 0) scale(0.88)",
              opacity: 0.3,
            }}
          >
            <img
              src={item.image}
              alt=""
              loading="lazy"
              decoding="async"
              className="w-10 h-14 sm:w-16 sm:h-20 object-contain"
              style={{ filter: "brightness(0.5)" }}
            />
          </div>

          <motion.div
            animate={
              isAnimating
                ? {
                    y: [0, 20, 500],
                    opacity: [1, 1, 0],
                    scale: [1, 1.05, 0.9],
                    rotate: [0, 2, 15],
                  }
                : {}
            }
            onClick={(e) => onSelect(item, e)}
            transition={
              isAnimating
                ? {
                    y: {
                      type: "spring",
                      stiffness: 100,
                      damping: 20,
                      bounce: 0.1,
                      duration: 1.5,
                    },
                    opacity: { duration: 1.5 },
                    scale: { duration: 0.2 },
                  }
                : { duration: 1.5, ease: "easeIn" }
            }
            className={`relative cursor-pointer z-10 will-change-transform ${
              !isVending && "group-hover:scale-105 active:scale-95"
            }`}
            style={{ transform: "translateZ(0)" }}
          >
            <img
              src={item.image}
              alt={item.name}
              loading="lazy"
              decoding="async"
              className={`w-10 h-14 sm:w-16 sm:h-20 object-contain transition-all duration-300 ${
                isAnimating
                  ? "brightness-125 contrast-125"
                  : "group-hover:brightness-110"
              }`}
              style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none rounded-lg" />
          </motion.div>

          {/* Simple bottom coil line */}
          <div
            className="absolute bottom-[-2px] w-[90%] h-[3px] rounded-full pointer-events-none z-20 opacity-50"
            style={{
              background:
                "linear-gradient(to right, #64748b, #e2e8f0, #94a3b8, #e2e8f0, #64748b)",
            }}
          />
        </div>

        <div className="mt-2 flex flex-col items-center gap-0.5 pointer-events-none">
          <span className="text-[7px] sm:text-[9px] font-black text-white/90 bg-slate-950/60 px-1.5 py-0.5 rounded shadow-sm border border-white/10 truncate max-w-[55px] sm:max-w-none">
            {item.name}
          </span>
          <span className="text-[7px] sm:text-[8px] font-black text-emerald-400">
            â‚¹{item.price}
          </span>
        </div>
      </div>
    );
  },
  // Custom deep comparison to skip layout re-calculations
  (prev, next) => {
    return (
      prev.isAnimating === next.isAnimating &&
      prev.isVending === next.isVending &&
      prev.item.id === next.item.id
    );
  }
);

export default function VendingMachine() {
  const { items, addItem, removeItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [animatingItem, setAnimatingItem] = useState<VendingItem | null>(null);
  const [isVending, setIsVending] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [vendedItemEffect, setVendedItemEffect] = useState<VendingItem | null>(
    null
  );

  const [addedPopup, setAddedPopup] = useState<{
    x: number;
    y: number;
    name: string;
  } | null>(null);

  const [hostel, setHostel] = useState<"NC" | "Zakir">("NC");
  const [floor, setFloor] = useState<number>(1);
  const [room, setRoom] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUpiModal, setShowUpiModal] = useState(false);

  // Removed inventory polling â€” was causing full re-renders every 5 seconds

  const vendingCartItems = items.filter(
    (i) => i.category === "Vending Machine"
  );

  const calculateDeliveryCharge = (f: number) => {
    if (f <= 3) return 8;
    if (f <= 6) return 11;
    if (f <= 9) return 14;
    return 16;
  };

  const deliveryCharge = calculateDeliveryCharge(floor);
  const vendingSubtotal = vendingCartItems.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );
  const totalAmount =
    vendingSubtotal > 0 ? vendingSubtotal + deliveryCharge : 0;

  // Fully isolated callback prevents breaking React.memo boundaries
  const handleSelectItem = useCallback(
    (item: VendingItem, e: React.MouseEvent) => {
      if (isVending) return;

      addItem({
        id: item.id,
        title: item.name,
        price: item.price,
        image: item.image,
        category: "Vending Machine",
      });

      setAddedPopup({ x: e.clientX, y: e.clientY, name: item.name });
      setTimeout(() => setAddedPopup(null), 1000);

      setAnimatingItem(item);
      setIsVending(true);

      setTimeout(() => {
        setVendedItemEffect(item);
        setIsVending(false);
        setTimeout(() => {
          setVendedItemEffect(null);
          setAnimatingItem(null);
        }, 2000);
      }, 1500);
    },
    [addItem, isVending]
  );

  const finalizeVendingOrder = async (utrNumber: string) => {
    if (!user || vendingCartItems.length === 0) return;
    setIsSubmitting(true);
    try {
      // Ensure Profile Exists (Auto-fix for missing profiles / Foreign Key error 23503)
      await supabase.from("profiles").upsert(
        {
          id: user.id,
          full_name:
            user?.user_metadata?.full_name ||
            user?.email?.split("@")[0] ||
            "Student",
          phone_number: phone,
          hostel_block: hostel,
        },
        { onConflict: "id" }
      );

      const itemsSummary = vendingCartItems
        .map(
          (i) => `${i.quantity}x ${i.title} [IMG:${i.image}] (â‚¹${i.price})`
        )
        .join("\n");
      const { data, error } = await supabase.from("orders").insert({
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
        status: "pending",
        payment_method: "cashfree",
        payment_status: "paid",
        razorpay_payment_id: utrNumber,
        seller_notified_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast({
        title: "Order Successful! ðŸŽ‰",
        description: "Your items are on the way to your floor.",
      });
      vendingCartItems.forEach((item) => removeItem(item.id));
      setShowUpiModal(false);
      setShowCheckout(false);

      // Redirect to the tracking page (automatically fetches latest order)
      navigate(`/tracking`);
    } catch (err: any) {
      toast({
        title: "Order failed",
        description: err.message || "Please try again.",
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-12 px-4 relative overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center mb-10 text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2">
            Hostel Smart Vending Machine
          </h2>
        </div>

        <div className="relative mx-auto w-full max-w-[420px]">
          <div className="relative rounded-[28px] sm:rounded-[40px] bg-[#1a1c2c] p-4 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.4),inset_0_2px_10px_rgba(255,255,255,0.1)] border-t-4 sm:border-t-[6px] border-x-4 sm:border-x-[6px] border-slate-800 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-purple-500 opacity-50 blur-sm" />

            <div className="relative rounded-2xl sm:rounded-3xl bg-slate-900/40 p-3 sm:p-4 border border-white/5 flex flex-col justify-between overflow-hidden">
              {/* Simple glass highlight â€” no blur */}
              <div className="absolute inset-0 pointer-events-none rounded-3xl z-40 overflow-hidden">
                <div className="absolute top-[-50%] left-[-20%] w-[150%] h-[200%] bg-gradient-to-tr from-transparent via-white/[0.07] to-transparent rotate-[25deg]" />
              </div>

              <div className="space-y-4">
                {ROWS.map((row, ri) => (
                  <div key={ri} className="relative">
                    <div className="grid grid-cols-4 gap-1 sm:gap-2 pb-4 sm:pb-6 px-1 relative z-10">
                      {row.items.map((item, ii) => (
                        <MemoizedVendingCard
                          key={`${ri}-${ii}-${item.id}`}
                          item={item}
                          isAnimating={animatingItem?.id === item.id}
                          isVending={isVending}
                          onSelect={handleSelectItem}
                        />
                      ))}
                    </div>
                    {/* Metal Rack Line */}
                    <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 h-1.5 sm:h-2 bg-gradient-to-b from-slate-500 via-slate-600 to-slate-800 rounded-full z-0 opacity-60" />
                  </div>
                ))}
              </div>

              {/* Bottom Dispenser Bin */}
              <div className="mt-4 border-t-[5px] border-slate-800 pt-6 pb-4 relative">
                <div
                  className="h-20 sm:h-32 bg-slate-950 rounded-xl sm:rounded-2xl flex items-center justify-center relative overflow-hidden shadow-[inset_0_4px_12px_rgba(0,0,0,0.8)] cursor-pointer group/bin"
                  onClick={() =>
                    vendingCartItems.length > 0 && setShowCheckout(true)
                  }
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-black/90 to-transparent opacity-80" />

                  <AnimatePresence>
                    {vendedItemEffect && (
                      <motion.div
                        initial={{
                          y: -150,
                          opacity: 0,
                          scale: 0.6,
                          rotate: -10,
                        }}
                        animate={{ y: 10, opacity: 1, scale: 1, rotate: 2 }}
                        transition={{
                          type: "spring",
                          stiffness: 150,
                          damping: 12,
                          bounce: 0.05,
                        }}
                        exit={{ opacity: 0 }}
                        className="relative z-10 flex flex-col items-center will-change-transform"
                      >
                        <img
                          src={vendedItemEffect.image}
                          loading="lazy"
                          decoding="async"
                          className="w-16 h-16 object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]"
                          alt="Dropped"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {vendingCartItems.length > 0 &&
                    !isVending &&
                    !vendedItemEffect && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative z-20 flex flex-col items-center gap-2 will-change-transform"
                      >
                        <ShoppingBag className="w-8 h-8 text-emerald-400 animate-bounce" />
                        <div className="px-4 py-1.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest shadow-2xl border border-white/20">
                          Check Out {vendingCartItems.length} Item
                          {vendingCartItems.length > 1 ? "s" : ""}
                        </div>
                      </motion.div>
                    )}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {addedPopup && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: -60 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="fixed z-[99999] pointer-events-none px-4 py-2 rounded-2xl bg-slate-900 border border-emerald-500/30 text-emerald-400 font-black text-xs shadow-2xl backdrop-blur-md will-change-transform"
                  style={{
                    left: addedPopup.x - 40,
                    top: addedPopup.y,
                    transform: "translateZ(0)",
                  }}
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

      <Dialog
        open={showCheckout}
        onOpenChange={() => {
          if (!isSubmitting) setShowCheckout(false);
        }}
      >
        <AnimatePresence>
          {showCheckout && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6"
            >
              <div
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                onClick={() => {
                  if (!isSubmitting) setShowCheckout(false);
                }}
              />

              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative bg-white w-full max-w-[420px] rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100 will-change-transform"
                style={{ transform: "translateZ(0)" }}
              >
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
                    <h3 className="text-xl font-black text-white leading-tight">
                      Checkout Items
                    </h3>
                    <p className="text-white/40 font-bold text-[10px] mt-1 italic">
                      Vending Machine Order
                    </p>
                  </div>
                </div>

                <div className="p-6 -mt-6 bg-white rounded-t-[2.5rem] relative z-20 space-y-5">
                  {/* CSS Virtual Scroll applied implicitly via custom-scrollbar class natively rendered block */}
                  <div
                    className="max-h-[180px] overflow-y-auto space-y-2 pr-2 custom-scrollbar"
                    style={{ contain: "paint" }}
                  >
                    {vendingCartItems.map((item, idxx) => (
                      <div
                        key={`${item.id}-${idxx}`}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-sm">
                            <img
                              src={item.image}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-contain"
                              alt=""
                            />
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-slate-900 leading-none">
                              {item.title}
                            </p>
                            <p className="text-[10px] text-brand font-bold mt-1">
                              â‚¹{item.price} Ã— {item.quantity}
                            </p>
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
                        <p className="text-xs text-slate-400 font-bold italic">
                          Cart is empty
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      {(["NC", "Zakir"] as const).map((h) => (
                        <button
                          key={h}
                          onClick={() => setHostel(h)}
                          className={`h-12 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                            hostel === h
                              ? "border-brand bg-brand/5"
                              : "border-slate-100 bg-slate-50 opacity-60 hover:opacity-100"
                          }`}
                        >
                          <span
                            className={`text-[8px] font-black uppercase tracking-tighter ${
                              hostel === h ? "text-brand" : "text-slate-400"
                            }`}
                          >
                            Hostel
                          </span>
                          <span
                            className={`text-sm font-black ${
                              hostel === h ? "text-slate-900" : "text-slate-500"
                            }`}
                          >
                            {h}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100 items-center justify-between">
                      <button
                        onClick={() => setFloor(Math.max(1, floor - 1))}
                        className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-brand transition-all shadow-sm"
                      >
                        <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                      </button>
                      <div className="text-center flex flex-col scale-90">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">
                          Floor
                        </span>
                        <span className="text-xl font-black text-slate-900">
                          {floor}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          setFloor(
                            Math.min(hostel === "NC" ? 9 : 11, floor + 1)
                          )
                        }
                        className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-brand transition-all shadow-sm"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-1 flex justify-between">
                          Room No.
                          {room && !room.startsWith(floor.toString()) && (
                            <span className="text-rose-500 lowercase font-bold">
                              Starts with {floor}
                            </span>
                          )}
                        </label>
                        <input
                          value={room}
                          onChange={(e) =>
                            setRoom(e.target.value.replace(/\D/g, ""))
                          }
                          placeholder={`Ex: ${floor}01`}
                          className={`w-full h-11 bg-slate-50 rounded-xl px-3 border transition-all text-xs font-bold ${
                            room && !room.startsWith(floor.toString())
                              ? "border-rose-500 bg-rose-50"
                              : "border-slate-100 focus:border-brand"
                          }`}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest pl-1 text-center block">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) =>
                            setPhone(
                              e.target.value.replace(/\D/g, "").slice(0, 10)
                            )
                          }
                          placeholder="Your Number"
                          className="w-full h-11 bg-slate-50 rounded-xl px-3 border border-slate-100 focus:border-brand transition-all text-xs font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-500 font-bold">
                        Subtotal ({vendingCartItems.length})
                      </span>
                      <span className="text-slate-900 font-black">
                        â‚¹{vendingSubtotal}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-500 font-bold">
                        Floor Delivery
                      </span>
                      <span className="text-emerald-600 font-black">
                        + â‚¹{deliveryCharge}
                      </span>
                    </div>
                    <div className="pt-1.5 mt-1 border-t border-slate-200 flex justify-between items-center">
                      <span className="text-xs font-black text-slate-600">
                        Total
                      </span>
                      <span className="text-lg font-black text-brand">
                        â‚¹{totalAmount}
                      </span>
                    </div>
                  </div>

                  <button
                    disabled={
                      vendingCartItems.length === 0 ||
                      !room ||
                      !room.startsWith(floor.toString()) ||
                      phone.length !== 10 ||
                      isSubmitting
                    }
                    onClick={() => {
                      if (!user) navigate("/login");
                      else setShowUpiModal(true);
                    }}
                    className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black text-[15px] shadow-xl transition-all hover:bg-black active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 group will-change-transform"
                    style={{ transform: "translateZ(0)" }}
                  >
                    {vendingCartItems.length === 0
                      ? "Add items first"
                      : !room
                      ? "Enter Room No."
                      : !room.startsWith(floor.toString())
                      ? `Need Room ${floor}xx`
                      : phone.length !== 10
                      ? "Enter Phone"
                      : `Pay â‚¹${totalAmount}`}
                    <Zap className="w-4 h-4 text-emerald-400" />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Dialog>

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

function Dialog({
  children,
  open,
  onOpenChange,
}: {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (val: boolean) => void;
}) {
  if (!open) return null;
  return <>{children}</>;
}
