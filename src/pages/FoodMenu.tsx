import React, { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  BadgeCheck,
  Sparkles,
  ShoppingBag,
  MessageSquare,
  Search,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import UpiPaymentModal from "@/components/UpiPaymentModal";
import { shops } from "@/config/shopMenus";
import { getFoodSuggestions, estimatePrice } from "@/utils/foodUtils";
// import ComboHighlightSection from "@/components/ComboHighlightSection";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShopCard } from "@/components/FoodMenu/ShopCard";
import { CustomOrderForm } from "@/components/FoodMenu/CustomOrderForm";

// Add SpeechRecognition type for TS
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export default function FoodMenu() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addItem } = useCart();
  const isTargetedUser = [
    "vedhantofficial@gmail.com",
    "iamsid074@gmail.com",
  ].includes(user?.email || "");

  const [activeTab, setActiveTab] = useState<"shops" | "custom">("shops");
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [expandedShop, setExpandedShop] = useState<string | null>(null);
  const [expandedMenuCat, setExpandedMenuCat] = useState<string | null>(null);
  const [shopSearch, setShopSearch] = useState("");

  // Form State for direct buy (backward compatibility)
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");

  // Custom Order State
  const [isListening, setIsListening] = useState(false);
  const [previewOrder, setPreviewOrder] = useState<any>(null);
  const [customItemList, setCustomItemList] = useState<any[]>([]);

  // Memoized Handlers
  const handleAddCustomToList = useCallback(
    (item: any) => {
      setCustomItemList((prev) => [...prev, item]);
      toast({
        title: "Added to List",
        description: `${item.quantity}x ${item.name}`,
      });
    },
    [toast]
  );

  const handleRemoveFromList = useCallback((id: string) => {
    setCustomItemList((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const sortedShops = [...shops].sort((a, b) => {
    if (a.id === "flavour-factory") return -1;
    if (b.id === "flavour-factory") return 1;
    return 0;
  });

  const handleUpdateActiveShop = useCallback((id: string | null) => {
    setExpandedShop(id);
    setExpandedMenuCat(null);
  }, []);

  const handleUpdateMenuCat = useCallback((cat: string | null) => {
    setExpandedMenuCat(cat);
  }, []);

  const handleAddToCartItem = useCallback(
    (item: any) => {
      addItem(item);
      toast({ title: "Added to Cart", description: item.title });
    },
    [addItem, toast]
  );

  const handlePreviewCustom = useCallback((items: any[]) => {
    setPreviewOrder({ items });
  }, []);

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({
        title: "Not Supported",
        description: "Voice input is not supported in this browser.",
        variant: "destructive",
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-IN";
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      // This would normally set input, but we've moved that to CustomOrderForm.
      // For now, we'll just toast the transcript since CustomOrderForm handles its own voice state.
      toast({ title: "Voice Detected", description: transcript });
    };
    recognition.start();
  };

  // UPI Payment Snapshot
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [upiSnapshot, setUpiSnapshot] = useState<any>(null);

  const finalizeOrder = async (utrNumber: string) => {
    if (!user || !upiSnapshot) return;
    try {
      // Ensure Profile Exists (Auto-fix for missing profiles / Foreign Key error 23503)
      await supabase.from("profiles").upsert(
        {
          id: user.id,
          full_name:
            user?.user_metadata?.full_name ||
            user?.email?.split("@")[0] ||
            "Student",
          phone_number: upiSnapshot.phone,
          hostel_block: upiSnapshot.location?.split(" - ")[0] || "Hostel",
        },
        { onConflict: "id" }
      );

      const { data, error } = await supabase.from("orders").insert({
        product_id: null,
        buyer_id: user.id,
        seller_id: "7450c873-f51d-469e-a33d-c44ca80beb0c",
        base_price: upiSnapshot.price,
        commission: 0,
        delivery_charge: 20,
        total_price: upiSnapshot.price + 20,
        delivery_location: upiSnapshot.location,
        delivery_room:
          upiSnapshot.type === "snack"
            ? `[FOOD] ${upiSnapshot.title}`
            : upiSnapshot.customNotes,
        buyer_phone: upiSnapshot.phone,
        status: "pending",
        payment_method: "cashfree",
        payment_status: "paid",
        razorpay_payment_id: utrNumber,
        seller_notified_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast({
        title: "Order placed! 🎉",
        description: "Payment verified. Admin will process your order shortly.",
      });
      setShowUpiModal(false);
      setUpiSnapshot(null);

      // Redirect to the tracking page (automatically fetches latest order)
      navigate(`/tracking`);
    } catch (err: any) {
      toast({
        title: "Order failed",
        description: err.message || "Please try again.",
        variant: "destructive",
      });
      throw err;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] pb-28 overflow-x-hidden font-sans text-[#1D1D1F]">
      <div className="max-w-xl mx-auto relative z-10">

        {/* ── Sticky Header ── */}
        <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-black/5 pt-24 pb-4 px-4">
          {/* Tab row */}
          <div className="flex gap-2 mb-4">
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setActiveTab("shops")}
              className={`flex-1 py-3 rounded-2xl text-[13px] font-bold transition-all ${
                activeTab === "shops"
                  ? "bg-[#1D1D1F] text-white shadow-md"
                  : "bg-[#F2F2F7] text-[#8E8E93]"
              }`}
            >
              Hostel Shops
            </button>
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setActiveTab("custom")}
              className={`flex-1 py-3 rounded-2xl text-[13px] font-bold transition-all ${
                activeTab === "custom"
                  ? "bg-[#1D1D1F] text-white shadow-md"
                  : "bg-[#F2F2F7] text-[#8E8E93]"
              }`}
            >
              Custom Order
            </button>
          </div>

          {/* Search (only on shops tab) */}
          {activeTab === "shops" && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E93]" />
              <input
                type="text"
                value={shopSearch}
                onChange={(e) => setShopSearch(e.target.value)}
                placeholder="Search any dish or shop…"
                className="w-full pl-9 pr-9 py-2.5 rounded-2xl bg-[#F2F2F7] text-[13px] font-medium text-[#1D1D1F] placeholder:text-[#8E8E93] focus:outline-none"
              />
              {shopSearch && (
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setShopSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-[#8E8E93]" />
                </button>
              )}
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "shops" ? (
            <motion.div
              key="shops-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="px-4 pt-4 pb-2 flex flex-col gap-4"
            >
              {/* Shop count */}
              <p className="text-[12px] text-[#8E8E93] flex items-center gap-1.5 font-semibold px-1">
                <BadgeCheck className="w-3.5 h-3.5 text-[#34C759]" />
                <span className="text-[#1D1D1F] font-bold">{shops.length}</span>{" "}
                verified campus shops
              </p>

              {sortedShops.map((shop) => (
                <div key={shop.id} id={`${shop.id}-card`}>
                  <ShopCard
                    shop={shop}
                    isExpanded={expandedShop === shop.id}
                    onToggle={handleUpdateActiveShop}
                    expandedMenuCat={expandedMenuCat}
                    onToggleCategory={handleUpdateMenuCat}
                    onAddItem={handleAddToCartItem}
                  />
                </div>
              ))}
            </motion.div>
          ) : (
            <CustomOrderForm
              onAddToList={handleAddCustomToList}
              customItemList={customItemList}
              onRemoveFromList={handleRemoveFromList}
              onPreview={handlePreviewCustom}
              estimatePrice={estimatePrice}
              suggestions={getFoodSuggestions("")}
              isListening={isListening}
              onStartListening={startListening}
            />
          )}
        </AnimatePresence>

        <Dialog
          open={!!previewOrder}
          onOpenChange={() => setPreviewOrder(null)}
        >
          <DialogContent className="rounded-[2.5rem] sm:rounded-[3rem] max-w-[90vw] sm:max-w-md p-6 sm:p-8 bg-white/70 backdrop-blur-3xl border border-white/60 shadow-2xl">
            <DialogHeader className="space-y-3 mb-6">
              <div className="w-16 h-16 rounded-[2rem] bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center mx-auto shadow-inner">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <DialogTitle className="text-2xl font-black text-center text-[#1D1D1F] tracking-tight">
                Order Preview
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="max-h-[350px] overflow-y-auto scrollbar-hide space-y-3 px-1">
                {previewOrder?.items.map((item: any) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-[2rem] ios-glass border border-white/60"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] sm:text-base font-bold text-[#1D1D1F] truncate">
                          {item.name}
                        </p>
                        <p className="text-[13px] font-bold text-[#007AFF]">
                          {"₹"}
                          {item.price} x {item.quantity}
                        </p>
                      </div>
                    </div>
                    {item.notes && (
                      <div className="mt-2 pt-2 border-t border-[#8E8E93]/20">
                        <p className="text-[11px] text-[#8E8E93] italic flex items-center gap-1.5 font-medium">
                          <MessageSquare className="w-3 h-3" /> {item.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  previewOrder?.items.forEach((item: any) => {
                    addItem({
                      id: item.id,
                      title: item.name,
                      price: item.price,
                      image: "",
                      category: "custom",
                      quantity: item.quantity,
                      notes: item.notes,
                      isCustom: true,
                    });
                  });
                  toast({
                    title: "Added to Cart",
                    description: `${previewOrder?.items.length} items added.`,
                  });
                  setCustomItemList([]);
                  setPreviewOrder(null);
                }}
                className="w-full h-14 rounded-full ios-action-button flex items-center justify-center font-bold text-[15px]"
              >
                Confirm & Add to Cart
              </button>
            </div>
          </DialogContent>
        </Dialog>

        <UpiPaymentModal
          isOpen={showUpiModal}
          onClose={() => {
            setShowUpiModal(false);
            setUpiSnapshot(null);
          }}
          amount={(upiSnapshot?.price || 0) + 20}
          orderIdText={`FOOD_${upiSnapshot?.foodId || "X"}`}
          customerId={user?.id || "guest"}
          customerPhone={upiSnapshot?.phone || phone || "9999999999"}
          onPaymentVerify={async (utr) => {
            await finalizeOrder(utr);
          }}
        />
      </div>
    </div>
  );
}
