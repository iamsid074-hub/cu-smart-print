import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Headset,
  ChevronDown,
  Mail,
  Phone,
  MessageCircle,
  HelpCircle,
  Truck,
  CreditCard,
  Users,
  ArrowLeft,
  AlertTriangle
} from "lucide-react";

const fontH: React.CSSProperties = {
  fontFamily: "'Space Grotesk', sans-serif",
};

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
        a: "Delivery is charged at a dynamically calculated rate typically around ₹29-₹40 per order inside campus based on conditions.",
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
        a: "We accept Cash on Delivery (COD) and secure UPI payments handled at the time of delivery.",
      },
      {
        q: "Is my payment secure?",
        a: "Yes. All payments are processed upon verified delivery completion.",
      },
      {
        q: "Can I get a refund?",
        a: "Yes. If your order has an issue upon delivery inspection, you may reject it. For prepayments, refunds are processed by admin review.",
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
        a: "We have a strict zero-tolerance policy. The following are strictly prohibited: drugs, alcohol, tobacco, weapons, counterfeit goods, stolen property, and prescription medicines.",
      },
      {
        q: "How do you ensure product safety?",
        a: "All listed products are reviewed. The platform admins verify sellers and products to ensure campus compliance.",
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
        a: "Go to your Profile and create a new listing with photos, description, and price. Once approved, your product goes live for all CU students.",
      },
      {
        q: "What can I sell?",
        a: "You can sell textbooks, electronics, stationery, hostel essentials, fashion items, and other student-relevant products.",
      },
    ],
  },
];

export default function HelpCenter() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState(0);

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-white pb-20 overflow-x-hidden relative">
      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-[#0d0d0f]/80 backdrop-blur-xl border-b border-white/5 px-4 h-16 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-white/5 transition-all text-white active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[20px] font-black tracking-tight">Support</h1>
      </div>

      <div className="max-w-4xl mx-auto relative z-10 px-4 sm:px-6 pt-8">
        {/* Header content */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10 sm:mb-14"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 backdrop-blur-md"
            style={{
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.2)",
            }}
          >
            <Headset className="w-4 h-4 text-emerald-400" />
            <span className="text-[12px] font-black tracking-widest uppercase text-emerald-400">
              Help Center
            </span>
          </div>
          <h1
            className="text-[32px] sm:text-4xl md:text-5xl font-black mb-3 tracking-tight leading-none text-white"
            style={fontH}
          >
            How can we{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400">
              help you?
            </span>
          </h1>
          <p className="text-gray-400 max-w-md mx-auto text-[14px] font-medium leading-relaxed">
            Find answers, get dedicated support, and learn about our established safety policies.
          </p>
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
              bg: "rgba(37,211,102,0.1)",
              border: "rgba(37,211,102,0.2)",
            },
            {
              icon: Phone,
              title: "Call Us",
              desc: "Available 8AM - 12AM",
              action: "9466166750",
              href: "tel:+919466166750",
              color: "#3B82F6",
              bg: "rgba(59,130,246,0.1)",
              border: "rgba(59,130,246,0.2)",
            },
            {
              icon: Mail,
              title: "Email",
              desc: "Response within 24h",
              action: "iamsid074@gmail.com",
              href: "mailto:iamsid074@gmail.com",
              color: "#A78BFA",
              bg: "rgba(167,139,250,0.1)",
              border: "rgba(167,139,250,0.2)",
            },
          ].map((item, i) => (
            <a
              key={item.title}
              href={item.href}
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="rounded-2xl sm:rounded-[2rem] p-4 sm:p-5 flex items-center gap-4 transition-all duration-200 active:scale-95 bg-[#1c1c1e] border border-white/5 group relative overflow-hidden hover:border-white/10"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: item.bg,
                  border: `1px solid ${item.border}`,
                }}
              >
                <item.icon className="w-6 h-6" style={{ color: item.color }} />
              </div>
              <div className="min-w-0">
                <p className="text-[15px] font-black text-white tracking-tight">
                  {item.title}
                </p>
                <p className="text-[12px] font-medium text-gray-500 truncate">
                  {item.desc}
                </p>
                <p
                  className="text-[12px] font-black mt-0.5"
                  style={{ color: item.color }}
                >
                  {item.action}
                </p>
              </div>
            </a>
          ))}
        </motion.div>

        {/* ─── FAQ Section ─── */}
        <div className="mb-10">
          <h2
            className="text-[18px] sm:text-xl font-black mb-5 text-white tracking-tight"
            style={fontH}
          >
            <HelpCircle
              className="w-5 h-5 inline-block mr-2 text-emerald-500"
              style={{ verticalAlign: "-2px" }}
            />
            Extended Support Topics
          </h2>

          {/* Section Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
            {faqSections.map((section, i) => (
              <button
                key={section.title}
                onClick={() => setActiveSection(i)}
                className={`flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl text-[13px] font-black tracking-tight flex-shrink-0 transition-all whitespace-nowrap ${
                  activeSection === i
                    ? "text-white"
                    : "text-gray-500 hover:text-white bg-[#1c1c1e] border border-white/5"
                }`}
                style={
                  activeSection === i
                    ? {
                        background: section.color,
                        border: `1px solid ${section.color}`,
                        boxShadow: `0 4px 20px ${section.color}30`
                      }
                    : {}
                }
              >
                <section.icon
                  className={`w-4 h-4 ${activeSection === i ? 'text-black' : ''}`}
                  style={{
                    color: activeSection !== i ? section.color : 'inherit',
                  }}
                />
                <span className={activeSection === i ? 'text-black' : ''}>{section.title}</span>
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
              className="space-y-3"
            >
              {faqSections[activeSection].faqs.map((faq, i) => {
                const faqId = `${activeSection}-${i}`;
                const isOpen = openFaq === faqId;
                return (
                  <div
                    key={faqId}
                    className={`rounded-3xl overflow-hidden transition-all bg-[#1c1c1e] border border-white/5`}
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : faqId)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left active:bg-white/5"
                    >
                      <span className="text-[14px] font-bold pr-4 text-white">
                        {faq.q}
                      </span>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      </motion.div>
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 pt-2 border-t border-white/5 mx-2">
                             <p className="text-[13px] leading-relaxed text-gray-400 font-medium">
                               {faq.a}
                             </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
