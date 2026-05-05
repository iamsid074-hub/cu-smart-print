import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, ChevronRight, Info, Layout, ShoppingCart, MousePointer2 } from "lucide-react";
import { toast } from "sonner";

interface TutorialStep {
  title: string;
  description: string;
  icon: any;
  targetId: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: "Control Center",
    description: "Click the Top Menu bar or press 'C' to open the Control Center. Here you can toggle Dark Mode, Wi-Fi, and more.",
    icon: Layout,
    targetId: "desktop-menu-bar"
  },
  {
    title: "Dynamic Island",
    description: "The Dynamic Island at the top shows live notifications, orders, and system status in real-time.",
    icon: Info,
    targetId: "dynamic-island-pill"
  },
  {
    title: "Making an Order",
    description: "Open the 'Shops' app from the Dock, select a store, and add items to your cart to place an order.",
    icon: ShoppingCart,
    targetId: "dock-app-Shops"
  },
  {
    title: "The Dockbar",
    description: "Use the Dockbar at the bottom to quickly switch between your favorite apps and windows.",
    icon: MousePointer2,
    targetId: "desktop-dock"
  }
];

export default function TutorialSystem() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isEnabled, setIsEnabled] = useState(true);
  const [cardPos, setCardPos] = useState({ top: 0, left: 0, arrow: 'top' });
  const [spotlight, setSpotlight] = useState({ top: 0, left: 0, width: 0, height: 0 });

  useEffect(() => {
    const handleReset = () => {
      setIsEnabled(true);
      handleStart();
    };
    window.addEventListener("reset-tutorial", handleReset);
    return () => window.removeEventListener("reset-tutorial", handleReset);
  }, []);

  useEffect(() => {
    const hasSeen = localStorage.getItem("tutorial_completed");
    const disabled = localStorage.getItem("tutorial_disabled") === "true";
    setIsEnabled(!disabled);

    if (!hasSeen && !disabled) {
      const timer = setTimeout(() => setShowPrompt(true), 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (isPlaying) {
      updatePosition();
      // Use a small timeout to ensure target IDs are rendered
      const timer = setTimeout(updatePosition, 100);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('resize', updatePosition);
        clearTimeout(timer);
      };
    }
  }, [isPlaying, currentStep]);

  const updatePosition = () => {
    const target = document.getElementById(tutorialSteps[currentStep].targetId);
    if (!target) {
      setCardPos({ top: window.innerHeight / 2 - 100, left: window.innerWidth / 2 - 160, arrow: 'none' });
      setSpotlight({ top: 0, left: 0, width: 0, height: 0 });
      return;
    }

    const rect = target.getBoundingClientRect();
    const margin = 20;
    let top = 0;
    let left = rect.left + rect.width / 2 - 160; 
    let arrow = 'top';

    setSpotlight({
      top: rect.top - 5,
      left: rect.left - 5,
      width: rect.width + 10,
      height: rect.height + 10
    });

    if (rect.top > window.innerHeight / 2) {
      top = rect.top - 200 - margin;
      arrow = 'bottom';
    } else {
      top = rect.bottom + margin;
      arrow = 'top';
    }

    left = Math.max(20, Math.min(window.innerWidth - 340, left));
    setCardPos({ top, left, arrow });
  };

  const handleStart = () => {
    setShowPrompt(false);
    setIsPlaying(true);
    setCurrentStep(0);
    localStorage.setItem("tutorial_disabled", "false");
    setIsEnabled(true);
  };

  const handleSkip = () => {
    setShowPrompt(false);
    localStorage.setItem("tutorial_completed", "true");
    toast.info("Tutorial skipped.");
  };

  const handleDisable = () => {
    setShowPrompt(false);
    localStorage.setItem("tutorial_disabled", "true");
    localStorage.setItem("tutorial_completed", "true");
    setIsEnabled(false);
    toast.success("Tutorials turned off.");
  };

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    setIsPlaying(false);
    localStorage.setItem("tutorial_completed", "true");
    toast.success("Tutorial complete!");
  };

  if (!isEnabled && !isPlaying) return null;

  return (
    <>
      <AnimatePresence>
        {showPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-md bg-white rounded-[32px] overflow-hidden shadow-2xl border border-white/20"
            >
              <div className="p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-blue-500 rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Play className="w-10 h-10 text-white fill-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight">Welcome to EOS v3</h2>
                  <p className="text-gray-500 mt-2 font-medium leading-relaxed">
                    New here? Let's take a quick 1-minute tour to help you get the most out of our premium desktop experience.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  <button onClick={handleStart} className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 active:scale-95">
                    Play Tutorial <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="flex gap-3">
                    <button onClick={handleSkip} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-all">Skip</button>
                    <button onClick={handleDisable} className="flex-1 py-3 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-100 transition-all text-xs">Never Show Again</button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] pointer-events-none"
          >
            {/* Spotlight Overlay */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <mask id="spotlight-mask">
                  <rect width="100%" height="100%" fill="white" />
                  <rect
                    x={spotlight.left}
                    y={spotlight.top}
                    width={spotlight.width}
                    height={spotlight.height}
                    rx="12"
                    fill="black"
                  />
                </mask>
              </defs>
              <rect width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask="url(#spotlight-mask)" className="backdrop-blur-[2px]" />
            </svg>

            <motion.div
              key={currentStep}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute w-80 bg-white/95 backdrop-blur-xl rounded-[28px] border border-white/20 shadow-2xl p-6 pointer-events-auto"
              style={{ top: cardPos.top, left: cardPos.left }}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center shadow-lg">
                    {(() => {
                      const Icon = tutorialSteps[currentStep].icon;
                      return <Icon className="w-5 h-5 text-white" />;
                    })()}
                  </div>
                  <button onClick={() => setIsPlaying(false)} className="p-1 hover:bg-gray-100 rounded-full text-gray-400">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                    Step {currentStep + 1} of {tutorialSteps.length}
                  </span>
                  <h3 className="text-xl font-black text-gray-900 mt-1">{tutorialSteps[currentStep].title}</h3>
                  <p className="text-gray-500 mt-2 text-sm font-medium leading-relaxed">
                    {tutorialSteps[currentStep].description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="flex gap-1.5">
                    {tutorialSteps.map((_, i) => (
                      <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-4 bg-blue-600' : 'bg-gray-200'}`} />
                    ))}
                  </div>
                  <button
                    onClick={handleNext}
                    className="px-6 py-2 bg-blue-600 text-white font-black rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-600/20 text-sm"
                  >
                    {currentStep === tutorialSteps.length - 1 ? "Finish" : "Next"}
                  </button>
                </div>
              </div>

              {cardPos.arrow !== 'none' && (
                <div 
                  className={`absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-black/5 ${cardPos.arrow === 'top' ? '-top-2 border-l border-t' : '-bottom-2 border-r border-b'}`}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
