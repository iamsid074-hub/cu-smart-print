import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, ShieldAlert, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AddProductPage() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    // Form State
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');

    const [originalPrice, setOriginalPrice] = useState('');
    const [age, setAge] = useState('');
    const [condition, setCondition] = useState('');
    const [reason, setReason] = useState('');

    const handlePublish = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);

        // Convert strings to appropriate types
        const productPrice = parseFloat(price);
        const prodOriginalPrice = originalPrice ? parseFloat(originalPrice) : null;

        const { error } = await supabase
            .from('products')
            .insert({
                seller_id: user.id,
                title,
                price: productPrice,
                category,
                condition,
                reason_for_selling: reason,
                original_price: prodOriginalPrice,
                age,
                status: 'available'
            });

        setLoading(false);

        if (error) {
            alert('Error publishing item: ' + error.message);
            return;
        }

        setStep(3); // Success step
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-6 max-w-3xl mx-auto">
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-black tracking-tight mb-2">Sell an Item</h1>
                <p className="text-foreground/60 text-lg">Turn your unused university gear into cash safely.</p>
            </div>

            <div className="glass-card p-8 relative overflow-hidden">
                {step === 1 && (
                    <motion.form
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                        onSubmit={(e) => { e.preventDefault(); setStep(2); }}
                    >
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
                                <span className="bg-primary text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-sm">1</span>
                                Basic Details
                            </h3>

                            <div>
                                <label className="block text-sm font-bold mb-2">Item Title</label>
                                <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Scientific Calculator" className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold mb-2">Selling Price (Rs)</label>
                                    <input required min="0" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="₹" className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2">Category</label>
                                    <select required value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none">
                                        <option value="">Select...</option>
                                        <option value="books">Books & Notes</option>
                                        <option value="electronics">Electronics</option>
                                        <option value="hostel">Hostel Essentials</option>
                                    </select>
                                </div>
                            </div>

                            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:bg-foreground/5 cursor-pointer transition-colors mt-6">
                                <Upload className="mx-auto mb-2 text-foreground/40" size={32} />
                                <p className="font-bold">Upload Photos</p>
                                <p className="text-sm text-foreground/50">Image upload coming soon</p>
                            </div>
                        </div>

                        <button type="submit" className="w-full py-4 rounded-xl bg-foreground text-background font-bold text-lg hover:bg-primary transition-colors">
                            Next Step: Safety Info
                        </button>
                    </motion.form>
                )}

                {step === 2 && (
                    <motion.form
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6 relative"
                        onSubmit={handlePublish}
                    >
                        <div className="absolute top-0 right-0 p-3 bg-accent/10 text-accent rounded-xl text-sm font-bold flex flex-col items-center">
                            <ShieldAlert size={20} className="mb-1" /> Anti-Scam Verification
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
                                <span className="bg-primary text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-sm">2</span>
                                Verification Details
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold mb-2">Original Price Paid (Rs)</label>
                                    <input required type="number" min="0" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} placeholder="₹" className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2">Age of Item</label>
                                    <input required type="text" value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 6 months" className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-2">Condition</label>
                                <select required value={condition} onChange={(e) => setCondition(e.target.value)} className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none">
                                    <option value="">Select Condition...</option>
                                    <option value="new">Like New (Mint)</option>
                                    <option value="good">Good (Minor wear)</option>
                                    <option value="fair">Fair (Noticeable wear)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-2">Reason for selling?</label>
                                <textarea required rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Honest reason helps build trust..." className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"></textarea>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button type="button" onClick={() => setStep(1)} className="px-6 py-4 rounded-xl font-bold text-lg hover:bg-foreground/10 transition-colors">
                                Back
                            </button>
                            <button type="submit" disabled={loading} className="flex-1 py-4 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold text-lg shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center">
                                {loading ? <Loader2 className="animate-spin" /> : 'Publish Listing'}
                            </button>
                        </div>
                    </motion.form>
                )}

                {step === 3 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-12"
                    >
                        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white animate-bounce">
                            <CheckCircle2 size={40} />
                        </div>
                        <h2 className="text-3xl font-black mb-4">Item Listed Successfully!</h2>
                        <p className="text-foreground/60 mb-8 max-w-md mx-auto">
                            Your item is now live on the campus market. Buyers will contact you via the secure in-app chat.
                        </p>
                        <button onClick={() => navigate('/home')} className="px-8 py-3 rounded-xl bg-foreground text-background font-bold hover:scale-105 transition-transform">
                            Return to Market
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
