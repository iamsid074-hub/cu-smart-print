import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag, Zap, Wallet, Settings, ArrowLeft } from "lucide-react";

// Import the existing pages
import Grocery from "./Grocery";
import QuickStore from "./QuickStore";
import WalletPage from "./Wallet";
import SettingsPage from "./Settings";

const SECTIONS = [
  { id: "grocery", label: "Grocery", icon: ShoppingBag, component: Grocery },
  { id: "blinkit", label: "Blinkit", icon: Zap, component: QuickStore },
  { id: "wallet", label: "Wallet", icon: Wallet, component: WalletPage },
  { id: "settings", label: "Settings", icon: Settings, component: SettingsPage },
];

export default function Sections() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("grocery");

  // Allow setting initial section via URL hash, e.g., /sections#wallet
  useEffect(() => {
    const hash = location.hash.replace("#", "");
    if (SECTIONS.find(s => s.id === hash)) {
      setActiveSection(hash);
    }
  }, [location.hash]);

  const ActiveComponent = SECTIONS.find(s => s.id === activeSection)?.component || Grocery;

  return (
    <div className="min-h-screen bg-[#0d0d0f] flex items-start">
      {/* ── Left Vertical Stripe (Sidebar) ── */}
      <div className="sticky top-0 h-screen flex-shrink-0 w-[60px] bg-[#0a0a0b] z-[70] shadow-[10px_0_30px_rgba(0,0,0,0.8)] flex flex-col items-center py-5 gap-4 overflow-y-auto hide-scrollbar rounded-r-[1.2rem] md:rounded-none">
        
        {/* BACK TO HOME */}
        <button
          onClick={() => navigate('/home')}
          className="relative flex flex-col items-center gap-1.5 w-full group mb-2"
        >
          <div className="relative w-full flex justify-center">
            <div className="w-9 h-9 rounded-full flex flex-col items-center justify-center transition-all duration-300 bg-white/5 text-gray-400 hover:bg-white/20 hover:text-white">
              <ArrowLeft size={15} strokeWidth={2.5} />
            </div>
          </div>
          <span className="text-[8px] font-bold tracking-tight uppercase text-gray-500 group-hover:text-gray-400">
            Back
          </span>
        </button>

        {SECTIONS.map((section) => {
          const isActive = activeSection === section.id;
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => {
                setActiveSection(section.id);
                navigate(`/sections#${section.id}`, { replace: true });
              }}
              className="relative flex flex-col items-center gap-1.5 w-full group"
            >
              <div className="relative w-full flex justify-center">
                {isActive && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute right-0 top-1.5 w-1 h-7 bg-purple-500 rounded-l-full shadow-[-2px_0_8px_rgba(168,85,247,0.5)]"
                  />
                )}
                <div 
                  className={`w-10 h-10 rounded-full flex flex-col items-center justify-center transition-all duration-300 ${
                    isActive 
                      ? "bg-white/10 text-white shadow-inner scale-110" 
                      : "bg-transparent text-gray-500 hover:bg-white/5 hover:text-gray-300"
                  }`}
                >
                  <Icon size={isActive ? 17 : 16} strokeWidth={isActive ? 2.5 : 2} />
                </div>
              </div>
              <span 
                className={`text-[7px] font-bold tracking-tight uppercase ${
                  isActive ? "text-purple-400" : "text-gray-500"
                }`}
              >
                {section.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Right Content Area ── */}
      <div className="flex-1 min-w-0 relative overflow-x-hidden min-h-screen bg-black" style={{ marginLeft: 0 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full min-h-screen"
          >
            <ActiveComponent />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
