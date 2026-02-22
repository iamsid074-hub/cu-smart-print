import { motion } from 'framer-motion';
import { HelpCircle, MessagesSquare, ShieldHalf, Target } from 'lucide-react';

export default function HelpPage() {
    const faqs = [
        { q: "How does Free Delivery work?", a: "Orders totaling ₹1000 or more qualify for FREE delivery straight to your selected hostel block." },
        { q: "Is my personal phone number shared?", a: "No! All communication happens through our secure in-app chat. We protect your privacy." },
        { q: "What is the platform commission?", a: "We charge a very low flat 2% commission to cover basic maintenance and server costs, much lower than standard marketplaces." },
        { q: "How do I return an item?", a: "Because items are sold between students, returns must be negotiated directly with the seller before handoff." },
    ];

    return (
        <div className="min-h-screen pt-24 pb-12 px-6 max-w-4xl mx-auto">
            <div className="text-center mb-16">
                <h1 className="text-5xl font-black tracking-tight mb-4 flex items-center justify-center gap-3">
                    <HelpCircle className="text-primary" size={48} />
                    Help Center
                </h1>
                <p className="text-xl text-foreground/60">Everything you need to know about trading securely on campus.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                <div className="glass-card p-6 text-center">
                    <ShieldHalf className="mx-auto mb-4 text-accent" size={32} />
                    <h3 className="font-bold text-lg mb-2">Safety First</h3>
                    <p className="text-sm text-foreground/60">Strictly university email verification ensures a closed, safe environment.</p>
                </div>
                <div className="glass-card p-6 text-center">
                    <Target className="mx-auto mb-4 text-primary" size={32} />
                    <h3 className="font-bold text-lg mb-2">Right directly to you</h3>
                    <p className="text-sm text-foreground/60">Our delivery partners know the campus. Select your exact hostel or block.</p>
                </div>
                <div className="glass-card p-6 text-center">
                    <MessagesSquare className="mx-auto mb-4 text-blue-500" size={32} />
                    <h3 className="font-bold text-lg mb-2">Private Chat</h3>
                    <p className="text-sm text-foreground/60">Negotiate and set meeting spots without revealing your WhatsApp.</p>
                </div>
            </div>

            <h2 className="text-3xl font-black mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
                {faqs.map((faq, idx) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={idx}
                        className="glass-card p-6 cursor-pointer hover:bg-foreground/5 transition-colors"
                    >
                        <h4 className="font-bold text-lg mb-2">{faq.q}</h4>
                        <p className="text-foreground/70">{faq.a}</p>
                    </motion.div>
                ))}
            </div>

            <div className="mt-16 text-center glass-card p-8 bg-gradient-to-r from-primary/10 to-accent/10">
                <h3 className="text-2xl font-bold mb-4">Still need help?</h3>
                <button className="px-8 py-3 rounded-full bg-foreground text-background font-bold hover:scale-105 transition-transform">
                    Contact Support
                </button>
            </div>
        </div>
    );
}
