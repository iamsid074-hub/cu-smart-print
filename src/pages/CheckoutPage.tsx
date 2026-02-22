import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Truck, Receipt, CheckCircle, Calculator } from 'lucide-react';

export default function CheckoutPage() {
    const [step, setStep] = useState(1);
    const itemPrice = 800; // Rs
    const commissionPercent = 2; // 2%
    const commission = (itemPrice * commissionPercent) / 100;

    // Dynamic Pricing Logic as per requirements
    const isFreeDelivery = itemPrice >= 1000;
    const standardDeliveryFee = 40;
    const deliveryCharge = isFreeDelivery ? 0 : standardDeliveryFee;
    const total = itemPrice + commission + deliveryCharge;

    const handleCheckout = () => {
        setStep(2);
        // Simulate live tracking update after 3 seconds
        setTimeout(() => {
            setStep(3);
        }, 4000);
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-6 max-w-5xl mx-auto">

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8"
                    >
                        {/* Delivery Details */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Truck size={28} className="text-secondary" />
                                <h2 className="text-3xl font-black tracking-tight">Delivery Info</h2>
                            </div>

                            <div className="glass-card p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-bold mb-2">Select University Location</label>
                                    <select className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none font-medium">
                                        <option>Block A (Hostel)</option>
                                        <option>Block B (Hostel)</option>
                                        <option>Block C (Hostel)</option>
                                        <option>Main Gate / Library</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2">Room Number / Spot Details</label>
                                    <input type="text" placeholder="e.g. Room 402, 3rd Floor" className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium" />
                                </div>
                                <div className="p-4 bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 rounded-xl text-sm font-bold flex items-start gap-2 border border-yellow-500/20">
                                    <span className="text-lg">💰</span> Payment is exclusively Cash On Delivery (COD) for ultimate safety.
                                </div>
                            </div>
                        </div>

                        {/* Price Math Engine */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Calculator size={28} className="text-accent" />
                                <h2 className="text-3xl font-black tracking-tight">Order Summary</h2>
                            </div>

                            <div className="glass-card p-6">
                                <div className="flex items-center gap-4 border-b border-border pb-6 mb-6">
                                    <img src="https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=200&q=80" alt="Item" className="w-16 h-16 rounded-lg object-cover" />
                                    <div>
                                        <h3 className="font-bold text-lg">Scientific Calculator Casio fx-991EX</h3>
                                        <p className="text-sm text-foreground/60">Condition: Like New</p>
                                    </div>
                                </div>

                                <div className="space-y-3 font-medium text-foreground/80 border-b border-border pb-6 mb-6 text-lg">
                                    <div className="flex justify-between">
                                        <span>Item Base Price</span>
                                        <span className="font-bold">₹{itemPrice}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="flex items-center gap-1.5 text-foreground/60"><Receipt size={14} /> Platform Commission (2%)</span>
                                        <span className="font-bold">₹{commission}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="flex items-center gap-1.5 text-foreground/60"><Truck size={14} /> Delivery Charge</span>
                                        <span className="font-bold flex items-center gap-2">
                                            {isFreeDelivery ? (
                                                <span className="text-green-500 uppercase tracking-widest text-xs">FREE</span>
                                            ) : (
                                                <>
                                                    <span>₹{deliveryCharge}</span>
                                                    <span className="text-xs text-primary font-medium">(Add ₹{1000 - itemPrice} more to get Free Delivery!)</span>
                                                </>
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center text-2xl font-black mb-6">
                                    <span>Grand Total</span>
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                                        ₹{total}
                                    </span>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-black text-lg shadow-[0_10px_30px_rgba(244,63,94,0.3)] hover:scale-[1.02] transition-transform flex justify-center items-center gap-2"
                                >
                                    <CheckCircle size={20} /> Place COD Order
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-20"
                    >
                        <div className="w-24 h-24 mx-auto rounded-full border-4 border-t-primary border-r-primary border-b-accent border-l-transparent animate-spin mb-8" />
                        <h2 className="text-3xl font-black mb-4 animate-pulse">Confirming Campus Delivery...</h2>
                        <p className="text-lg text-foreground/60">Contacting delivery partner at your block.</p>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-12 max-w-2xl mx-auto"
                    >
                        <div className="w-24 h-24 bg-gradient-to-tr from-green-400 to-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-white shadow-2xl rotate-3">
                            <Package size={48} />
                        </div>
                        <h2 className="text-4xl font-black mb-6">Order Placed Successfully!</h2>

                        <div className="glass-card p-8 text-left relative overflow-hidden group hover:border-primary/50 transition-colors">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-[100px] -z-10" />
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-xl flex items-center gap-2">
                                    <Truck className="text-primary" /> Live Tracking Info
                                </h3>
                                <span className="px-3 py-1 bg-green-500/10 text-green-500 font-bold rounded-full text-sm">
                                    On the way
                                </span>
                            </div>

                            <div className="relative pl-6 border-l-2 border-primary border-dashed space-y-6">
                                <div className="relative">
                                    <div className="absolute -left-[1.67rem] top-1 w-3 h-3 rounded-full bg-primary" />
                                    <p className="font-bold">Seller Confirmed</p>
                                    <p className="text-sm text-foreground/50">1 min ago</p>
                                </div>
                                <div className="relative">
                                    <div className="absolute -left-[1.67rem] top-1 w-3 h-3 rounded-full bg-primary animate-ping" />
                                    <p className="font-bold text-primary">Runner Picking Up Item</p>
                                    <p className="text-sm text-foreground/50">Estimated time remaining: <span className="text-white font-bold bg-foreground px-2 py-0.5 rounded">15 Mins</span></p>
                                </div>
                                <div className="relative opacity-30">
                                    <div className="absolute -left-[1.67rem] top-1 w-3 h-3 rounded-full border-2 border-foreground bg-background" />
                                    <p className="font-bold">Delivery at Block A</p>
                                    <p className="text-sm text-foreground/50">Pending</p>
                                </div>
                            </div>
                        </div>

                        <button onClick={() => window.location.href = '/home'} className="mt-8 px-8 py-3 rounded-xl bg-foreground text-background font-bold text-lg hover:bg-primary transition-colors">
                            Back to Home
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
