import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Pizza, Coffee, Apple, ShoppingBag, Clock, Loader2, Plus, BadgeCheck, Cookie, Soup } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const foodCategories = [
    { id: "snacks", name: "Snacks", emoji: "🍕", icon: Pizza, color: "from-orange-500 to-red-500" },
    { id: "chocolates", name: "Chocolates", emoji: "🍫", icon: Cookie, color: "from-amber-600 to-yellow-700" },
    { id: "beverages", name: "Beverages", emoji: "🥤", icon: Apple, color: "from-red-400 to-pink-500" },
    { id: "biscuits", name: "Biscuits", emoji: "🍪", icon: Coffee, color: "from-yellow-400 to-orange-500" },
    { id: "instant", name: "Instant Food", emoji: "🍜", icon: Soup, color: "from-green-400 to-emerald-600" },
];

const foodItems = [
    // ── Snacks ─────────────────────
    { id: "s1", title: "Lays Classic Salted", price: 20, category: "snacks", image: "https://images.unsplash.com/photo-1566478989037-e624b0e253bf?q=80&w=400&h=400&fit=crop" },
    { id: "s2", title: "Kurkure Masala Munch", price: 20, category: "snacks", image: "https://images.unsplash.com/photo-1621531093122-ce5187e59bbf?q=80&w=400&h=400&fit=crop" },
    { id: "s3", title: "Doritos Nacho Cheese", price: 50, category: "snacks", image: "https://images.unsplash.com/photo-1599813531584-60be0fcbd1fb?q=80&w=400&h=400&fit=crop" },
    { id: "s4", title: "Bingo Mad Angles", price: 20, category: "snacks", image: "https://images.unsplash.com/photo-1600952841320-db92ec4047ca?q=80&w=400&h=400&fit=crop" },
    { id: "s5", title: "Pringles Original", price: 99, category: "snacks", image: "https://images.unsplash.com/photo-1568702846914-96b305d2ead1?q=80&w=400&h=400&fit=crop" },
    { id: "s6", title: "Uncle Chipps Spicy Treat", price: 20, category: "snacks", image: "https://images.unsplash.com/photo-1613919113640-25732ec5e61f?q=80&w=400&h=400&fit=crop" },
    // ── Chocolates ─────────────────
    { id: "c1", title: "Dairy Milk Silk", price: 80, category: "chocolates", image: "https://images.unsplash.com/photo-1575377427642-087cf684f29d?q=80&w=400&h=400&fit=crop" },
    { id: "c2", title: "5 Star 3D", price: 20, category: "chocolates", image: "https://images.unsplash.com/photo-1587132137056-bfbf0166836e?q=80&w=400&h=400&fit=crop" },
    { id: "c3", title: "KitKat 4 Finger", price: 40, category: "chocolates", image: "https://images.unsplash.com/photo-1582176604856-e824b4736522?q=80&w=400&h=400&fit=crop" },
    { id: "c4", title: "Perk Wafer", price: 10, category: "chocolates", image: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?q=80&w=400&h=400&fit=crop" },
    { id: "c5", title: "Munch Crunch", price: 10, category: "chocolates", image: "https://images.unsplash.com/photo-1587132137056-bfbf0166836e?q=80&w=400&h=400&fit=crop" },
    { id: "c6", title: "Gems Tube", price: 20, category: "chocolates", image: "https://images.unsplash.com/photo-1581798459219-318e76ababfb?q=80&w=400&h=400&fit=crop" },
    // ── Beverages ──────────────────
    { id: "b1", title: "Coca Cola 250ml", price: 20, category: "beverages", image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=400&h=400&fit=crop" },
    { id: "b2", title: "Pepsi 250ml", price: 20, category: "beverages", image: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?q=80&w=400&h=400&fit=crop" },
    { id: "b3", title: "Sprite 250ml", price: 20, category: "beverages", image: "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?q=80&w=400&h=400&fit=crop" },
    { id: "b4", title: "Sting Energy 250ml", price: 20, category: "beverages", image: "https://images.unsplash.com/photo-1582260667086-a2468be1bd10?q=80&w=400&h=400&fit=crop" },
    { id: "b5", title: "Hot Coffee ☕", price: 15, category: "beverages", image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=400&h=400&fit=crop" },
    { id: "b6", title: "Cutting Chai 🍵", price: 10, category: "beverages", image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?q=80&w=400&h=400&fit=crop" },
    // ── Biscuits ────────────────────
    { id: "bi1", title: "Oreo Original", price: 30, category: "biscuits", image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=400&h=400&fit=crop" },
    { id: "bi2", title: "Good Day Cashew", price: 30, category: "biscuits", image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=400&h=400&fit=crop" },
    { id: "bi3", title: "Bourbon Cream", price: 25, category: "biscuits", image: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?q=80&w=400&h=400&fit=crop" },
    { id: "bi4", title: "Monaco Salted", price: 20, category: "biscuits", image: "https://images.unsplash.com/photo-1486427944344-5a2276cd7529?q=80&w=400&h=400&fit=crop" },
    { id: "bi5", title: "Parle-G Gold", price: 10, category: "biscuits", image: "https://images.unsplash.com/photo-1597733336794-12d05021d510?q=80&w=400&h=400&fit=crop" },
    { id: "bi6", title: "Hide & Seek Choco", price: 35, category: "biscuits", image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=400&h=400&fit=crop" },
    // ── Instant Food ────────────────
    { id: "i1", title: "Maggi 2-Min Noodles", price: 14, category: "instant", image: "https://images.unsplash.com/photo-1612929633738-8fe01f37e460?q=80&w=400&h=400&fit=crop" },
    { id: "i2", title: "Cup Noodles Masala", price: 45, category: "instant", image: "https://images.unsplash.com/photo-1569058242567-93de6f36f8eb?q=80&w=400&h=400&fit=crop" },
    { id: "i3", title: "Yippee Noodles", price: 14, category: "instant", image: "https://images.unsplash.com/photo-1635321593217-40050ad13c74?q=80&w=400&h=400&fit=crop" },
    { id: "i4", title: "Instant Pasta Cheese", price: 40, category: "instant", image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?q=80&w=400&h=400&fit=crop" },
    { id: "i5", title: "Instant Poha Mix", price: 30, category: "instant", image: "https://images.unsplash.com/photo-1645696301019-35adcc0b244a?q=80&w=400&h=400&fit=crop" },
    { id: "i6", title: "Knorr Soupy Noodles", price: 15, category: "instant", image: "https://images.unsplash.com/photo-1612929633738-8fe01f37e460?q=80&w=400&h=400&fit=crop" },
];

export default function FoodMenu() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [activeCategory, setActiveCategory] = useState("snacks");
    const [selectedFood, setSelectedFood] = useState<any>(null);
    const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);

    // Form State
    const [location, setLocation] = useState("");
    const [phone, setPhone] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const filteredFoods = foodItems.filter(item => item.category === activeCategory);
    const activeCat = foodCategories.find(c => c.id === activeCategory);

    const handleOpenCheckout = (food: any) => {
        if (!user) {
            navigate('/login');
            return;
        }
        setSelectedFood(food);
        setIsBuyModalOpen(true);
    };

    const handleBuyNow = (e: React.FormEvent) => {
        e.preventDefault();

        if (!location.trim() || !phone.trim()) {
            toast({ title: "Details missing", description: "Please enter delivery location and phone number.", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);

        setTimeout(() => {
            const orderDetails = {
                id: `FOOD-${Math.floor(1000 + Math.random() * 9000)}`,
                product: {
                    id: selectedFood.id,
                    title: selectedFood.title,
                    price: selectedFood.price,
                    image_url: selectedFood.image,
                    seller_name: "CU Food Delivery 🛵",
                },
                pricing: {
                    basePrice: selectedFood.price,
                    deliveryFee: 0,
                    total: selectedFood.price,
                },
                shipping: {
                    location,
                    phone,
                    method: "Cash on Delivery",
                },
                placedAt: new Date().toISOString(),
                status: "placed"
            };

            localStorage.setItem("active_order", JSON.stringify(orderDetails));
            toast({ title: "Snack Ordered! 🍟", description: "Hold tight, it's coming fast!" });
            setIsSubmitting(false);
            setIsBuyModalOpen(false);
            navigate('/tracking');
        }, 1200);
    };

    return (
        <div className="min-h-screen bg-[#0A0505] pt-24 pb-16 px-4 sm:px-6 overflow-x-hidden relative">

            {/* Warm Ambient Glows */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8 md:mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 font-semibold text-sm mb-4 backdrop-blur-md">
                        <Pizza className="w-4 h-4" /> CU Food Menu
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-6xl font-black mb-3 md:mb-4 tracking-tight leading-tight">
                        Late night cravings?<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-yellow-500 drop-shadow-[0_0_20px_rgba(249,115,22,0.4)]">
                            Delivered fast 🚀
                        </span>
                    </h1>
                    <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base md:text-lg px-2">
                        Get snacks, drinks, chocolates and instant food delivered straight to your hostel room with ZERO delivery fees.
                    </p>
                </motion.div>

                {/* Categories */}
                <div className="flex gap-2 sm:gap-3 mb-8 md:mb-12 overflow-x-auto pb-3 scrollbar-hide px-1 -mx-1" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {foodCategories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex items-center gap-1.5 sm:gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full font-bold transition-all duration-300 flex-shrink-0 min-h-[40px] text-xs sm:text-sm whitespace-nowrap ${activeCategory === cat.id
                                ? `bg-gradient-to-r ${cat.color} text-white shadow-[0_0_20px_rgba(249,115,22,0.4)] scale-105`
                                : 'bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            <span className="text-base">{cat.emoji}</span>
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Category Count */}
                <div className="flex items-center justify-between mb-4 px-1">
                    <p className="text-sm text-muted-foreground">
                        Showing <span className="text-white font-bold">{filteredFoods.length}</span> items in <span className={`font-bold text-transparent bg-clip-text bg-gradient-to-r ${activeCat?.color}`}>{activeCat?.name}</span>
                    </p>
                    <span className="px-2.5 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold flex items-center gap-1">
                        <BadgeCheck className="w-3 h-3" /> Free Delivery
                    </span>
                </div>

                {/* Grid */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeCategory}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25 }}
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5"
                    >
                        {filteredFoods.map((item, i) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="group relative glass rounded-2xl sm:rounded-3xl overflow-hidden border border-white/5 hover:border-orange-500/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(249,115,22,0.15)] hover:-translate-y-1 flex flex-col"
                            >
                                {/* Fast Delivery Badge */}
                                <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-20 px-2 py-0.5 sm:py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-white">
                                    <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-orange-400" /> ~10 min
                                </div>

                                {/* Image — proper sizing with object-contain for full visibility */}
                                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-white/[0.03] to-white/[0.01]">
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0505] to-transparent z-10 opacity-50" />
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        loading="lazy"
                                        className="w-full h-full object-cover p-3 sm:p-4 rounded-2xl group-hover:scale-105 transition-transform duration-500 z-0"
                                    />
                                </div>

                                {/* Content */}
                                <div className="p-3 sm:p-4 flex flex-col flex-1 relative z-20">
                                    <h3 className="font-bold text-xs sm:text-sm md:text-base mb-1 line-clamp-2 leading-snug">{item.title}</h3>
                                    <p className="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 mb-2 sm:mb-3">
                                        ₹{item.price}
                                    </p>

                                    <button
                                        onClick={() => handleOpenCheckout(item)}
                                        className="mt-auto w-full min-h-[40px] sm:min-h-[44px] py-2 sm:py-2.5 rounded-xl bg-white/5 hover:bg-gradient-to-r hover:from-orange-500 hover:to-red-500 group-hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] border border-white/10 hover:border-transparent text-white font-bold transition-all duration-300 flex items-center justify-center gap-1.5 text-xs sm:text-sm"
                                    >
                                        <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                                        <span>Add to Box</span>
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>

                {/* Checkout Modal */}
                <Dialog open={isBuyModalOpen} onOpenChange={setIsBuyModalOpen}>
                    <DialogContent className="sm:max-w-md glass-heavy border border-orange-500/20 bg-[#120805]/95 backdrop-blur-2xl mx-4">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black text-orange-50">Fast Checkout</DialogTitle>
                            <DialogDescription className="text-orange-200/60">
                                Get your snacks delivered instantly.
                            </DialogDescription>
                        </DialogHeader>

                        {selectedFood && (
                            <div className="mt-4 flex flex-col gap-5">
                                {/* Product Summary */}
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-orange-500/5 border border-orange-500/10">
                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-black/40 flex-shrink-0">
                                        <img src={selectedFood.image} alt={selectedFood.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold line-clamp-1 text-orange-50">{selectedFood.title}</p>
                                        <div className="flex items-center justify-between mt-1">
                                            <p className="text-sm text-orange-200/60">Base Price</p>
                                            <p className="font-semibold text-orange-100">₹{selectedFood.price}</p>
                                        </div>
                                        <div className="flex items-center justify-between mt-1">
                                            <div className="flex items-center gap-1 text-sm text-green-400">
                                                <BadgeCheck className="w-3 h-3" /> Delivery
                                            </div>
                                            <p className="font-bold text-green-400">FREE</p>
                                        </div>
                                        <div className="w-full h-[1px] bg-orange-500/20 my-2" />
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-bold text-orange-200">Total</p>
                                            <p className="font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 text-xl">₹{selectedFood.price}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Checkout Form */}
                                <form onSubmit={handleBuyNow} className="flex flex-col gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-orange-200/60 uppercase mb-1 block">Delivery Location (Hostel/Room)</label>
                                        <input
                                            type="text"
                                            required
                                            value={location}
                                            onChange={e => setLocation(e.target.value)}
                                            className="w-full bg-black/40 border border-orange-500/20 rounded-xl px-4 py-3 text-sm text-orange-50 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-orange-200/20"
                                            placeholder="e.g. Zakir A, Room 402"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-orange-200/60 uppercase mb-1 block">Contact Number</label>
                                        <input
                                            type="tel"
                                            required
                                            value={phone}
                                            onChange={e => setPhone(e.target.value)}
                                            className="w-full bg-black/40 border border-orange-500/20 rounded-xl px-4 py-3 text-sm text-orange-50 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-orange-200/20"
                                            placeholder="e.g. 9876543210"
                                        />
                                    </div>

                                    <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-center flex items-center justify-center gap-2">
                                        <ShoppingBag className="w-4 h-4 text-orange-400" />
                                        <p className="text-sm font-semibold text-orange-300">
                                            Pay Cash on Delivery
                                        </p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full py-4 mt-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-black uppercase tracking-wide shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center"
                                    >
                                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : `Order Now (₹${selectedFood.price})`}
                                    </button>
                                </form>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

            </div>
        </div>
    );
}