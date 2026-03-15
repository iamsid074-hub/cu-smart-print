import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ShieldCheck, Ban, Package, Headset, ChevronDown, Mail, Phone, MessageCircle, Clock, AlertTriangle, HelpCircle, ShoppingCart, Truck, CreditCard, Users, ExternalLink } from "lucide-react";

const fontH: React.CSSProperties = { fontFamily: "'Space Grotesk', sans-serif" };

/* ─── FAQ Data ─── */
const faqSections = [
    {
        title: "Ordering & Delivery",
        icon: Truck,
        color: "#10B981",
        faqs: [
            {
                q: "Who delivers my order?",
                a: "The platform owner personally handles every single delivery. There are no third-party delivery partners - your order is in safe, accountable hands from start to finish.",
            },
            {
                q: "How long does delivery take?",
                a: "Most orders within the Chandigarh University campus are delivered within 10-30 minutes, depending on location and current demand. Campus essentials and food orders are prioritized.",
            },
            {
                q: "What areas do you deliver to?",
                a: "We deliver to all hostel blocks, academic buildings, and common areas within the Chandigarh University campus. Just provide your block and room number.",
            },
            {
                q: "What is the delivery charge?",
                a: "Delivery is charged at a flat ₹20 per order. Promo codes occasionally reduce this fee.",
            },
        ],
    },
    {
        title: "Payments",
        icon: CreditCard,
        color: "#3B82F6",
        faqs: [
            {
                q: "What payment methods are accepted?",
                a: "We currently accept UPI payments (PhonePe, Google Pay, Paytm, etc.). This ensures secure, instant, and traceable transactions for both buyers and sellers.",
            },
            {
                q: "Is my payment secure?",
                a: "Yes. All payments are processed through verified UPI channels. We never store your bank details or UPI credentials on our servers.",
            },
            {
                q: "Can I get a refund?",
                a: "Yes. If your order has an issue (wrong item, quality problem, etc.), contact us immediately through WhatsApp or the help center. Refunds are processed within 24 hours.",
            },
        ],
    },
    {
        title: "Safety & Trust",
        icon: ShieldCheck,
        color: "#F43F5E",
        faqs: [
            {
                q: "What items are NOT allowed on CU Bazzar?",
                a: "We have a strict zero-tolerance policy. The following are strictly prohibited: drugs and narcotics, alcohol and tobacco, weapons of any kind, counterfeit/pirated goods, stolen property, prescription medicines, any item that violates university regulations or Indian law. Violations result in immediate account ban and reporting to university authorities.",
            },
            {
                q: "How do you ensure product safety?",
                a: "All listed products are reviewed. The platform owner personally verifies sellers and products. Any suspicious listings are immediately removed and investigated.",
            },
            {
                q: "Is my personal information safe?",
                a: "We follow strict data privacy practices. Your phone number, delivery location, and order history are only used for order fulfillment and are never shared with third parties or other students.",
            },
            {
                q: "What if I receive a wrong or damaged item?",
                a: "Contact us immediately via WhatsApp. Since the owner handles all deliveries personally, issues are resolved on the spot or within hours. Full refund or replacement guaranteed.",
            },
        ],
    },
    {
        title: "Selling on CU Bazzar",
        icon: Users,
        color: "#A78BFA",
        faqs: [
            {
                q: "How do I start selling?",
                a: "Click 'Start Selling' from the navigation menu. Create your listing with photos, description, and price. Once approved, your product goes live for all CU students to browse.",
            },
            {
                q: "Is there a selling fee?",
                a: "A small platform commission is deducted from each sale to maintain the platform and cover delivery costs. The exact percentage is shown before you list.",
            },
            {
                q: "What can I sell?",
                a: "You can sell textbooks, electronics, stationery, hostel essentials, fashion items, sports gear, and other student-relevant products. All items must be legal, in acceptable condition, and comply with university policies.",
            },
        ],
    },
];

export default function HelpCenter() {
    const [openFaq, setOpenFaq] = useState<string | null>(null);
    const [activeSection, setActiveSection] = useState(0);

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-32 px-4 sm:px-6 overflow-x-hidden relative">
            {/* Ambient Glows */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10 sm:mb-14"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 backdrop-blur-md" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                        <Headset className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-semibold text-emerald-400">Help Center</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 tracking-tight leading-tight" style={fontH}>
                        How can we{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400">
                            help you?
                        </span>
                    </h1>
                    <p className="text-slate-500 max-w-md mx-auto text-sm sm:text-base">
                        Find answers, get support, and learn about our safety policies.
                    </p>
                </motion.div>

                {/* ─── Safety Commitment Banner ─── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-10 rounded-3xl p-5 sm:p-7 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
                >
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-emerald-50 border border-emerald-100">
                            <Shield className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div>
                            <h2 className="text-base sm:text-lg font-bold mb-1.5 text-slate-900">Our Safety Commitment</h2>
                            <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
                                CU Bazzar is run by a <strong className="text-emerald-600">real person with real accountability</strong>. Every delivery is handled personally by the platform owner \u2014 no anonymous drivers, no middlemen.
                                We maintain a <strong className="text-rose-600">strict zero-tolerance policy</strong> against drugs, alcohol, weapons, and any prohibited items. Violations are reported to Chandigarh University authorities immediately.
                                Your safety and trust are our foundation.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* ─── Contact Cards ─── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10"
                >
                    {[
                        {
                            icon: MessageCircle,
                            title: "WhatsApp Support",
                            desc: "Instant response",
                            action: "Chat Now",
                            href: "https://wa.me/919466166750?text=Hi%2C%20I%20need%20help%20with%20CU%20Bazzar",
                            color: "#25D366",
                            bg: "rgba(37,211,102,0.08)",
                            border: "rgba(37,211,102,0.15)",
                        },
                        {
                            icon: Phone,
                            title: "Call Us",
                            desc: "Available 8AM - 12AM",
                            action: "9466166750",
                            href: "tel:+919466166750",
                            color: "#3B82F6",
                            bg: "rgba(59,130,246,0.08)",
                            border: "rgba(59,130,246,0.15)",
                        },
                        {
                            icon: Mail,
                            title: "Email",
                            desc: "Response within 24h",
                            action: "iamsid074@gmail.com",
                            href: "mailto:iamsid074@gmail.com",
                            color: "#A78BFA",
                            bg: "rgba(167,139,250,0.08)",
                            border: "rgba(167,139,250,0.15)",
                        },
                    ].map((item, i) => (
                        <a
                            key={item.title}
                            href={item.href}
                            target={item.href.startsWith("http") ? "_blank" : undefined}
                            rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                            className="rounded-xl sm:rounded-2xl p-4 sm:p-5 flex items-center gap-3 transition-all duration-200 hover:-translate-y-0.5 bg-white shadow-sm border border-slate-200 group"
                        >
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: item.bg, border: `1px solid ${item.border}` }}>
                                <item.icon className="w-5 h-5" style={{ color: item.color }} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs sm:text-sm font-bold text-slate-900">{item.title}</p>
                                <p className="text-[10px] sm:text-xs text-slate-500">{item.desc}</p>
                                <p className="text-[10px] sm:text-xs font-semibold mt-0.5 group-hover:underline" style={{ color: item.color }}>{item.action}</p>
                            </div>
                        </a>
                    ))}
                </motion.div>

                {/* ─── FAQ Section ─── */}
                <div className="mb-10">
                    <h2 className="text-lg sm:text-xl font-bold mb-5 text-slate-900" style={fontH}>
                        <HelpCircle className="w-5 h-5 inline-block mr-2 text-emerald-500" style={{ verticalAlign: '-2px' }} />
                        Frequently Asked Questions
                    </h2>

                    {/* Section Tabs */}
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                        {faqSections.map((section, i) => (
                            <button
                                key={section.title}
                                onClick={() => setActiveSection(i)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold flex-shrink-0 transition-all whitespace-nowrap ${activeSection === i
                                    ? "text-white"
                                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                                    }`}
                                style={activeSection === i ? { background: `rgba(${section.color === '#10B981' ? '16,185,129' : section.color === '#3B82F6' ? '59,130,246' : section.color === '#F43F5E' ? '244,63,94' : '167,139,250'},0.15)`, border: `1px solid ${section.color}33` } : { border: '1px solid rgba(0,0,0,0.06)' }}
                            >
                                <section.icon className="w-3.5 h-3.5" style={{ color: activeSection === i ? section.color : undefined }} />
                                {section.title}
                            </button>
                        ))}
                    </div>

                    {/* FAQ Cards */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeSection}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-2"
                        >
                            {faqSections[activeSection].faqs.map((faq, i) => {
                                const faqId = `${activeSection}-${i}`;
                                const isOpen = openFaq === faqId;
                                return (
                                    <div
                                        key={faqId}
                                        className={`rounded-2xl overflow-hidden transition-all bg-white shadow-[0_2px_10px_rgba(0,0,0,0.03)] ${isOpen ? 'ring-1 ring-slate-200' : ''}`}
                                    >
                                        <button
                                            onClick={() => setOpenFaq(isOpen ? null : faqId)}
                                            className="w-full flex items-center justify-between px-4 py-3.5 sm:px-5 sm:py-4 text-left hover:bg-slate-50"
                                        >
                                            <span className="text-xs sm:text-sm font-semibold pr-4 text-slate-900">{faq.q}</span>
                                            <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                                                <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                            </motion.div>
                                        </button>
                                        <AnimatePresence>
                                            {isOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.25 }}
                                                    className="overflow-hidden bg-slate-50"
                                                >
                                                    <p className="px-4 pb-4 sm:px-5 sm:pb-5 pt-2 text-xs sm:text-sm leading-relaxed text-slate-600">
                                                        {faq.a}
                                                    </p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* ─── Prohibited Items Notice ─── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="rounded-3xl p-5 sm:p-7 mb-10 bg-rose-50"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-5 h-5 text-rose-500" />
                        <h3 className="text-sm sm:text-base font-bold text-rose-700">Prohibited Items \u2014 Zero Tolerance</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                            "🚫 Drugs & Narcotics",
                            "🚫 Alcohol & Tobacco",
                            "🚫 Weapons of any kind",
                            "🚫 Counterfeit/Pirated goods",
                            "🚫 Stolen property",
                            "🚫 Prescription medicines",
                            "🚫 Hazardous materials",
                            "🚫 University-prohibited items",
                            "🚫 Exam cheating material",
                        ].map(item => (
                            <div key={item} className="px-3 py-2 rounded-lg text-[11px] sm:text-xs font-medium bg-white border border-rose-100 text-rose-600 shadow-sm">
                                {item}
                            </div>
                        ))}
                    </div>
                    <p className="mt-4 text-[10px] sm:text-xs leading-relaxed text-rose-600/80">
                        Listing or attempting to trade any prohibited item will result in <strong className="text-rose-700">immediate permanent ban</strong> from the platform and reporting to Chandigarh University administration and law enforcement as applicable.
                    </p>
                </motion.div>

                {/* ─── Still need help? ─── */}
                <div className="text-center py-8">
                    <p className="text-sm mb-3 text-slate-500">Still need help?</p>
                    <a
                        href="https://wa.me/919466166750?text=Hi%2C%20I%20need%20help%20with%20CU%20Bazzar"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95"
                        style={{ background: '#25D366', boxShadow: '0 4px 16px rgba(37,211,102,0.25)' }}
                    >
                        <MessageCircle className="w-4 h-4" />
                        Chat on WhatsApp
                    </a>
                </div>
            </div>
        </div>
    );
}
