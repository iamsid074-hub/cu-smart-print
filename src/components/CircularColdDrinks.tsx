import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { groceryItems } from "@/config/groceryItems";

export default function CircularColdDrinks() {
    const { addItem } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [radius, setRadius] = useState(150);

    // Dynamically set radius based on container width so items never overlap
    useEffect(() => {
        const update = () => {
            if (containerRef.current) {
                const w = containerRef.current.offsetWidth;
                setRadius(Math.min(w * 0.36, 230));
            }
        };
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

    const drinks = groceryItems.filter(i => i.category === 'Cold Drinks').slice(0, 8);

    const handleAddToCart = (item: any, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user) {
            toast.error("Please login to add items to cart");
            navigate("/login");
            return;
        }
        addItem({
            id: item.id,
            title: item.name,
            price: item.price,
            image: item.image,
            category: item.category,
        });
        toast.success(`${item.name} added to cart!`);
    };

    const orbitSize = radius * 2 + 120; // total height/width of orbit area

    return (
        <section className="mb-14 py-6 relative w-full overflow-hidden flex flex-col items-center">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-200/15 blur-[90px] rounded-full pointer-events-none" />

            {/* Orbit Container â€“ uses measured radius for reliable positioning */}
            <div
                ref={containerRef}
                className="relative w-full max-w-3xl mx-auto"
                style={{ height: orbitSize }}
            >
                {/* Central Hub */}
                <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-white shadow-[0_8px_32px_rgba(6,182,212,0.2)] ring-4 ring-cyan-100 flex items-center justify-center z-20"
                >
                    <h2 className="text-base sm:text-xl font-black text-slate-800 tracking-tight text-center leading-tight px-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                        Cold<br />Drinks
                    </h2>
                </motion.div>

                {/* Orbit Ring (decorative) */}
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-cyan-200/60 pointer-events-none"
                    style={{ width: radius * 2, height: radius * 2 }}
                />

                {drinks.map((item, idx) => {
                    const angle = (idx * (360 / drinks.length) - 90) * (Math.PI / 180);
                    const x = Math.cos(angle) * radius; // offset from center
                    const y = Math.sin(angle) * radius;

                    return (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.08, type: 'spring', stiffness: 120 }}
                            // Position using absolute + translate so center (50%,50%) is exact origin
                            style={{
                                position: 'absolute',
                                left: '50%',
                                top: '50%',
                                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                                zIndex: activeIndex === idx ? 30 : 10,
                            }}
                        >
                            <div
                                onClick={() => setActiveIndex(idx === activeIndex ? null : idx)}
                                className={`group relative w-[70px] sm:w-[88px] bg-white/95 backdrop-blur-xl rounded-2xl p-2 pb-2.5 flex flex-col items-center cursor-pointer transition-all duration-200 shadow-[0_4px_14px_rgba(0,0,0,0.06)] border border-slate-100
                                    ${activeIndex === idx
                                        ? 'ring-2 ring-cyan-400 scale-110 shadow-[0_8px_24px_rgba(6,182,212,0.28)]'
                                        : 'hover:scale-105 hover:shadow-[0_6px_18px_rgba(6,182,212,0.18)]'
                                    }
                                `}
                            >
                                {/* Floating bottle image overflowing top */}
                                <div className="absolute -top-9 sm:-top-12 left-1/2 -translate-x-1/2 w-[48px] h-[64px] sm:w-[64px] sm:h-[84px] drop-shadow-xl transition-transform duration-200 group-hover:-translate-y-1">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" loading="lazy" decoding="async" />
                                </div>

                                <div className="mt-7 sm:mt-10 flex flex-col items-center w-full gap-1.5">
                                    <h3 className="text-[8px] sm:text-[10px] font-bold text-slate-800 text-center leading-[1.2] line-clamp-2 tracking-tight w-full">{item.name}</h3>
                                    <div className="flex items-center justify-between w-full">
                                        <span className="text-[9px] sm:text-[10px] font-black text-slate-900 bg-slate-50 border border-slate-100 px-1 py-0.5 rounded leading-none">â‚¹{item.price}</span>
                                        <button
                                            onClick={(e) => handleAddToCart(item, e)}
                                            className="w-4 h-4 sm:w-5 sm:h-5 bg-cyan-500 rounded-full flex items-center justify-center text-white hover:bg-cyan-600 active:scale-90 shadow-sm shadow-cyan-300 transition-all"
                                        >
                                            <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
}
