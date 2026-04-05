import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  CheckCircle2,
  Flame,
  Store,
  ShoppingCart,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const pastaItems = [
  {
    id: "flavour-factory-Pasta-red",
    name: "Red Sauce Pasta",
    desc: "Classic Italian penne in rich, tangy tomato sauce with herbs and fresh basil.",
    price: 99,
    image: "/banners/red_sauce_pasta.png",
    accent: "#DC2626",
    badge: "Bestseller",
  },
  {
    id: "flavour-factory-Pasta-white",
    name: "White Sauce Pasta",
    desc: "Creamy Alfredo-style pasta with a velvety smooth cheese and herb sauce.",
    price: 99,
    image: "/banners/white_sauce_pasta.png",
    accent: "#D97706",
    badge: "Popular",
  },
  {
    id: "flavour-factory-Pasta-mixed",
    name: "Mixed Sauce Pasta",
    desc: "The best of both worlds — a delicious blend of red and white sauces.",
    price: 99,
    image: "/banners/mixed_sauce_pasta.png",
    accent: "#EA580C",
    badge: "New",
  },
];

export default function PastaOfferPage() {
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const handleAdd = (item: (typeof pastaItems)[0]) => {
    if (!user) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }
    addItem({
      id: item.id,
      title: `${item.name} (Flavour Factory)`,
      price: item.price,
      image: item.image,
      category: "shops",
    });
    toast.success(`${item.name} added to cart!`, {
      description: "Go to cart to place your order",
      action: { label: "View Cart", onClick: () => navigate("/cart") },
    });
    setAddedIds((prev) => new Set(prev).add(item.id));
    setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }, 2000);
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background:
          "linear-gradient(170deg, #0d0503 0%, #1a0c06 25%, #231108 50%, #1a0a04 100%)",
      }}
    >
      {/* Background Grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Warm ambient glows */}
      <div
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(255,120,30,0.12) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute top-1/3 right-0 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(255,60,30,0.08) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-72 h-72 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(255,180,50,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 pt-[5.5rem] pb-32 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          {/* Back Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Link
              to="/food"
              className="inline-flex items-center gap-2 text-orange-300/60 hover:text-orange-300 transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Food Menu
            </Link>
          </motion.div>

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10 sm:mb-14"
          >
            {/* Brand Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-5"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-400/20 bg-orange-500/5 backdrop-blur-sm">
                <Store className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-xs font-bold text-orange-300/80 uppercase tracking-wider">
                  Flavour Factory
                </span>
              </div>
            </motion.div>

            {/* Headline */}
            <h1
              className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight mb-3 sm:mb-4"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #FFD700, #FF8C00, #FFB347, #FFD700)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Pasta @ {"₹"}99
            </h1>
            <p className="text-sm sm:text-base text-orange-200/50 font-medium max-w-md mx-auto leading-relaxed">
              Indulge in our signature pasta collection. Handcrafted with love,
              served with passion.
            </p>

            {/* Decorative line */}
            <div
              className="w-20 h-px mx-auto mt-5 rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,140,0,0.5), transparent)",
              }}
            />
          </motion.div>

          {/* Pasta Images Fan */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex items-center justify-center gap-[-0.5rem] mb-10 sm:mb-14"
          >
            {pastaItems.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, rotate: 0 }}
                animate={{ opacity: 1, rotate: i === 0 ? -8 : i === 2 ? 8 : 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                whileHover={{ scale: 1.08, rotate: 0, zIndex: 10 }}
                className="w-24 h-24 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-2xl sm:rounded-3xl overflow-hidden border-2 shadow-2xl shadow-black/50 -mx-2 sm:-mx-3 cursor-pointer transition-all"
                style={{
                  borderColor: `${item.accent}40`,
                  zIndex: i === 1 ? 5 : 2,
                }}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Section Title */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-3 mb-6"
          >
            <Flame className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg sm:text-xl font-black text-white">
              Choose Your Flavour
            </h2>
          </motion.div>

          {/* Pasta Cards */}
          <div className="space-y-4 sm:space-y-5">
            {pastaItems.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.12, duration: 0.5 }}
                whileHover={{ y: -4 }}
                className="rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm group hover:border-white/[0.15] transition-all duration-500"
              >
                <div className="flex flex-col sm:flex-row items-stretch">
                  {/* Image */}
                  <div className="relative w-full sm:w-48 h-48 sm:h-auto overflow-hidden flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-[#1a0c06]/80 via-transparent to-transparent" />

                    {/* Badge */}
                    <div className="absolute top-3 left-3">
                      <span
                        className="px-2.5 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-wider"
                        style={{ background: `${item.accent}cc` }}
                      >
                        {item.badge}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-white mb-1.5">
                        {item.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-white/40 leading-relaxed mb-4">
                        {item.desc}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-baseline gap-1.5">
                        <span
                          className="text-2xl sm:text-3xl font-black"
                          style={{ color: item.accent }}
                        >
                          {"₹"}99
                        </span>
                        <span className="text-sm text-white/25 line-through font-bold">
                          {"₹"}110
                        </span>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.93 }}
                        onClick={() => handleAdd(item)}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-black transition-all"
                        style={{
                          background: addedIds.has(item.id)
                            ? "rgba(34,197,94,0.15)"
                            : `linear-gradient(135deg, ${item.accent}, ${item.accent}cc)`,
                          color: addedIds.has(item.id) ? "#22C55E" : "#fff",
                          boxShadow: addedIds.has(item.id)
                            ? "none"
                            : `0 4px 15px ${item.accent}40`,
                        }}
                      >
                        {addedIds.has(item.id) ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" /> Added!
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" /> Add to Cart
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-10 text-center"
          >
            <Link
              to="/cart"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-black text-white shadow-xl hover:scale-105 active:scale-95 transition-all"
              style={{
                background: "linear-gradient(135deg, #FF6B00, #FF4500)",
                boxShadow: "0 4px 25px rgba(255,69,0,0.35)",
              }}
            >
              <ShoppingCart className="w-4 h-4" /> Go to Cart
            </Link>
            <p className="text-[10px] text-orange-300/30 mt-3 font-medium">
              Free delivery on orders above {"₹"}200 {"•"} Delivery in 25-35
              mins
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
