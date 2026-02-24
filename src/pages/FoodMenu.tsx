import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Pizza, Coffee, Apple, ShoppingBag, Clock, Loader2, Plus, BadgeCheck } from "lucide-react";
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
    { id: "snacks", name: "Snacks", icon: Pizza, color: "from-orange-500 to-red-500" },
    { id: "biscuits", name: "Biscuits", icon: Coffee, color: "from-yellow-400 to-orange-500" },
    { id: "drinks", name: "Drinks", icon: Apple, color: "from-red-400 to-pink-500" },
];

const foodItems = [
    { id: "f1", title: "Lays Classic Salted", price: 20, category: "snacks", image: "https://images.unsplash.com/photo-1566478989037-e624b0e253bf?q=80&w=400&h=400&fit=crop" },
    { id: "f2", title: "Kurkure Masala Munch", price: 20, category: "snacks", image: "https://images.unsplash.com/photo-1621531093122-ce5187e59bbf?q=80&w=400&h=400&fit=crop" },
    { id: "f3", title: "Doritos Nacho Cheese", price: 50, category: "snacks", image: "https://images.unsplash.com/photo-1599813531584-60be0fcbd1fb?q=80&w=400&h=400&fit=crop" },
    { id: "f4", title: "Oreo Original", price: 35, category: "biscuits", image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=400&h=400&fit=crop" },
    { id: "f5", title: "Good Day Cashew", price: 30, category: "biscuits", image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=400&h=400&fit=crop" },
    { id: "f6", title: "Coca Cola 250ml", price: 40, category: "drinks", image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=400&h=400&fit=crop" },
    { id: "f7", title: "Red Bull Energy", price: 125, category: "drinks", image: "https://images.unsplash.com/photo-1582260667086-a2468be1bd10?q=80&w=400&h=400&fit=crop" },
    { id: "f8", title: "Maggi 2-Minute Noodles", price: 25, category: "snacks", image: "https://images.unsplash.com/photo-1612929633738-8fe01f37e460?q=80&w=400&h=400&fit=crop" },
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

        // Simulate network delay
        setTimeout(() => {
            const orderDetails = {
                id: `FOOD-${Math.floor(1000 + Math.random() * 9000)}`,
                product: {
                    id: selectedFood.id,
                    title: selectedFood.title,
                    price: selectedFood.price,
                    image_url: selectedFood.image, // FIX: was selectedFood.image_url, correct key is .image
                    seller_name: "CU Food Delivery 🛵",
                },
                pricing: {
                    basePrice: selectedFood.price,
                    deliveryFee: 0,
                    total: selectedFood.price, // Free delivery
                },
                shipping: {
                    location,
                    phone,
                    method: "Cash on Delivery",
                },
                placedAt: new Date().toISOString(),
                status: "placed"
            };

            // Save to local storage to simulate backend for Tracking page
            localStorage.setItem("active_order", JSON.stringify(orderDetails));

            toast({ title: "Snack Ordered! 🍟", description: "Hold tight, it's coming fast!" });

            setIsSubmitting(false);
            setIsBuyModalOpen(false);

            // Navigate to tracking page
            navigate('/tracking');
        }, 1200);
    };

    return (
        <div className="min-h-screen bg-[#0A0505] pt-24 pb-16 px-4 overflow-hidden relative">

            {/* Warm Ambient Glows */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 font-semibold text-sm mb-4 backdrop-blur-md">
                        <Pizza className="w-4 h-4" /> CU Food Menu
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
                        Late night cravings?<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-yellow-500 drop-shadow-[0_0_20px_rgba(249,115,22,0.4)]">
                            Delivered fast 🚀
                        </span>
                    </h1>
                    <p className="text-muted-foreground max-w-lg mx-auto text-lg">
                        Get snacks, drinks, and instant food delivered straight to your hostel room with ZERO delivery fees.
                    </p>
                </motion.div>

                {/* Categories — FIX: moved inside max-w-6xl container, fixed button children indentation */}
                <div className="flex justify-center gap-4 mb-12 overflow-x-auto pb-4 scrollbar-hide">
                    {foodCategories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all duration-300 flex-shrink-0 ${activeCategory === cat.id
                                ? `bg-gradient-to-r ${cat.color} text-white shadow-[0_0_20px_rgba(249,115,22,0.4)] scale-105`
                                : 'bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            <cat.icon className="w-5 h-5" />
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Grid — FIX: moved inside max-w-6xl container */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {filteredFoods.map((item, i) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="group relative glass rounded-3xl overflow-hidden border border-white/5 hover:border-orange-500/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(249,115,22,0.15)] flex flex-col"
                        >
                            {/* Fast Delivery Badge */}
                            <div className="absolute top-3 left-3 z-10 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1.5 text-[10px] font-bold text-white shadow-sm">
                                <Clock className="w-3 h-3 text-orange-400" /> ~10 mins
                            </div>

                            {/* Image */}
                            <div className="relative h-40 md:h-48 overflow-hidden bg-white/5 p-4 flex items-center justify-center">
                                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10 opacity-60" />
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-[80%] h-[80%] object-cover rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 drop-shadow-2xl z-0"
                                />
                            </div>

                            {/* Content */}
                            <div className="p-4 flex flex-col flex-1 relative z-20 -mt-6">
                                <h3 className="font-bold text-lg mb-1 line-clamp-1">{item.title}</h3>
                                <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 mb-4 tracking-tight">
                                    ₹{item.price}
                                </p>

                                <button
                                    onClick={() => handleOpenCheckout(item)}
                                    className="mt-auto w-full py-3 rounded-xl bg-white/5 hover:bg-gradient-to-r hover:from-orange-500 hover:to-red-500 group-hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] border border-white/10 hover:border-transparent text-white font-bold transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-5 h-5" /> Add to Box
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Checkout Modal */}
                <Dialog open={isBuyModalOpen} onOpenChange={setIsBuyModalOpen}>
                    <DialogContent className="sm:max-w-md glass-heavy border border-orange-500/20 bg-[#120805]/95 backdrop-blur-2xl">
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
                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-black/40 hidden sm:block">
                                        <img src={selectedFood.image} alt={selectedFood.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
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