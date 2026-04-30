import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag, Zap, Wallet, Settings, ArrowLeft, ChevronRight, ChevronLeft } from "lucide-react";
import { useSound } from "@/hooks/useSound";

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

const SIDEBAR_W = 64; // px — collapsed strip width

export default function Sections() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("grocery");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { play } = useSound();

  // Allow setting initial section via URL hash, e.g., /sections#wallet
  useEffect(() => {
    const hash = location.hash.replace("#", "");
    if (SECTIONS.find(s => s.id === hash)) {
      setActiveSection(hash);
    }
  }, [location.hash]);

  // Close sidebar automatically when a section is selected
  const handleSelectSection = (id: string) => {
    if (activeSection !== id) play('swipe');
    setActiveSection(id);
    navigate(`/sections#${id}`, { replace: true });
    setSidebarOpen(false); // collapse after selection
  };

  const ActiveComponent = SECTIONS.find(s => s.id === activeSection)?.component || Grocery;

  return (
    <div className="relative min-h-screen bg-[#0d0d0f] flex overflow-hidden">

      {/* ── Backdrop (mobile only) ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[65] bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Left Sidebar ── */}
      <motion.div
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -SIDEBAR_W }}
        transition={{ type: "spring", stiffness: 400, damping: 40 }}
        className="fixed left-0 top-0 bottom-0 z-[70] shadow-[10px_0_30px_rgba(0,0,0,0.8)]"
        style={{ width: SIDEBAR_W, willChange: "transform" }}
      >
        <div
          className="h-full w-full bg-[#0a0a0b] flex flex-col items-center py-5 gap-4 overflow-y-auto hide-scrollbar rounded-r-[1.2rem]"
        >
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
                onClick={() => handleSelectSection(section.id)}
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
      </motion.div>

      {/* ── Toggle Arrow Tab ── */}
      <motion.button
        onClick={() => { play('swipe'); setSidebarOpen(prev => !prev); }}
        animate={{ x: sidebarOpen ? SIDEBAR_W : 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 40 }}
        className="fixed top-24 left-0 z-[75] flex items-center justify-center"
        style={{
          width: 20,
          height: 52,
          background: "linear-gradient(135deg, #1a1a2e, #2a1a4a)",
          borderRadius: "0 10px 10px 0",
          boxShadow: "4px 0 16px rgba(0,0,0,0.5), inset -1px 0 0 rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderLeft: "none",
          willChange: "transform"
        }}
        aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
      >
        <motion.div
          animate={{ rotate: sidebarOpen ? 180 : 0 }}
          transition={{ duration: 0.25 }}
        >
          <ChevronRight size={12} className="text-purple-400" strokeWidth={3} />
        </motion.div>
      </motion.button>

      {/* ── Full-Screen Content Area ── */}
      <div className="flex-1 w-full min-h-screen bg-black">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.28 }}
            className="w-full min-h-screen"
          >
            <ActiveComponent />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
