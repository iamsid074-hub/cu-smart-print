import { motion } from "framer-motion";
import { useState } from "react";
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

    return (
        <section className="mb-14 py-8 relative w-full overflow-hidden flex flex-col items-center">
            {/* Background ambient lighting */}
            <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-cyan-50/40 to-transparent pointer-events-none rounded-[3rem]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-cyan-200/20 blur-[80px] rounded-full pointer-events-none" />

            {/* Orbit Container */}
            <div className="relative w-full max-w-4xl mx-auto flex items-center justify-center h-[340px] sm:h-[550px] mt-4 sm:mt-10 mb-4 sm:mb-10">
                
                {/* Central Hub */}
                <motion.div 
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 sm:w-44 sm:h-44 rounded-full bg-white shadow-[0_8px_32px_rgba(6,182,212,0.15)] ring-4 ring-white border-[6px] border-cyan-50 flex flex-col items-center justify-center z-20"
                >
                     <span className="text-3xl sm:text-5xl drop-shadow-md mb-1 sm:mb-2 text-cyan-500">🧊</span>
                     <h2 className="text-xs sm:text-lg font-black text-slate-800 tracking-tight leading-tight text-center px-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Cold Drinks</h2>
                </motion.div>

                {drinks.map((item, idx) => {
                    const angle = (idx * (360 / drinks.length)) - 90;
                    const rMobile = 135;
                    const rDesktop = 220;
                    
                    const xMobile = Math.cos(angle * Math.PI / 180) * rMobile;
                    const yMobile = Math.sin(angle * Math.PI / 180) * rMobile;

                    const xDesktop = Math.cos(angle * Math.PI / 180) * rDesktop;
                    const yDesktop = Math.sin(angle * Math.PI / 180) * rDesktop;

                    return (
                        <div key={item.id}>
                            <style>{`
                                .orbit-item-${idx} {
                                    transform: translate(calc(-50% + ${xMobile}px), calc(-50% + ${yMobile}px));
                                }
                                @media (min-width: 640px) {
                                    .orbit-item-${idx} {
                                        transform: translate(calc(-50% + ${xDesktop}px), calc(-50% + ${yDesktop}px));
                                    }
                                }
                            `}</style>
                            
                            <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1, type: 'spring', stiffness: 100 }}
                                className={`absolute top-1/2 left-1/2 z-10 orbit-item-${idx}`}
                            >
                                <div 
                                    onClick={() => setActiveIndex(idx)}
                                    className={`group relative w-[72px] sm:w-[96px] bg-white/95 backdrop-blur-xl rounded-[1.25rem] sm:rounded-2xl p-2 pb-2.5 sm:p-2 sm:pb-3 flex flex-col items-center cursor-pointer transition-all duration-300 shadow-[0_4px_15px_rgba(0,0,0,0.04)] border border-white/50
                                        ${activeIndex === idx 
                                            ? 'ring-2 ring-cyan-400 scale-[1.15] shadow-[0_10px_25px_rgba(6,182,212,0.3)] z-30' 
                                            : 'hover:scale-105 hover:shadow-[0_8px_20px_rgba(6,182,212,0.15)] hover:z-30'}
                                    `}
                                >
                                    {/* Image bursting out (Modern cut-out effect) */}
                                    <div className="absolute -top-10 sm:-top-14 left-1/2 -translate-x-1/2 w-[52px] h-[72px] sm:w-[76px] sm:h-[104px] drop-shadow-xl overflow-visible transition-transform duration-300 group-hover:-translate-y-1.5 group-hover:drop-shadow-2xl">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                    </div>
                                    
                                    <div className="mt-7 sm:mt-11 flex flex-col items-center w-full">
                                        <h3 className="text-[9px] sm:text-[11px] font-bold text-slate-800 text-center leading-[1.1] line-clamp-2 min-h-[1.4rem] tracking-tight">{item.name}</h3>
                                        <div className="flex items-center justify-between w-full mt-1.5 sm:mt-2">
                                            <span className="text-[10px] sm:text-[11px] font-black text-slate-900 border border-slate-100 bg-slate-50 px-1 py-0.5 rounded shadow-sm leading-none">₹{item.price}</span>
                                            <button 
                                                onClick={(e) => handleAddToCart(item, e)} 
                                                className="w-4 h-4 sm:w-6 sm:h-6 bg-cyan-500 rounded-full flex items-center justify-center text-white hover:bg-cyan-600 active:scale-95 shadow-md shadow-cyan-500/30 transition-transform"
                                            >
                                                <Plus className="w-3 h-3 sm:w-4 sm:h-4 stroke-[3]" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
