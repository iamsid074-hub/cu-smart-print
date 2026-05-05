import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, SkipForward, X, ChevronRight, Info, Layout, ShoppingCart, MousePointer2 } from "lucide-react";
import { toast } from "sonner";

interface TutorialStep {
  title: string;
  description: string;
  icon: any;
  highlightId?: string; // ID of the element to highlight
}

const tutorialSteps: TutorialStep[] = [
  {
    title: "Control Center",
    description: "Click the Top Menu bar or press 'C' to open the Control Center. Here you can toggle Dark Mode, Wi-Fi, and more.",
    icon: Layout,
    highlightId: "desktop-menu-bar"
  },
  {
    title: "Dynamic Island",
    description: "The Dynamic Island at the top shows live notifications, orders, and system status in real-time.",
    icon: Info,
    highlightId: "dynamic-island-pill"
  },
  {
    title: "Making an Order",
    description: "Open the 'Shops' app from the Dock, select a store, and add items to your cart to place an order.",
    icon: ShoppingCart,
    highlightId: "dock-app-Shops"
  },
  {
    title: "The Dockbar",
    description: "Use the Dockbar at the bottom to quickly switch between your favorite apps and windows.",
    icon: MousePointer2,
    highlightId: "desktop-dock"
  }
];

export default function TutorialSystem() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isEnabled, setIsEnabled] = useState(true);

  // Use a custom event to listen for "re-run tutorial" from settings
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
      // Small delay after boot
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, []);

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
    toast.info("Tutorial skipped. You can enable it again in Settings.");
  };

  const handleDisable = () => {
    setShowPrompt(false);
    localStorage.setItem("tutorial_disabled", "true");
    localStorage.setItem("tutorial_completed", "true");
    setIsEnabled(false);
    toast.success("Tutorials turned off permanently.");
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
    toast.success("Tutorial complete! Enjoy EOS v3.");
  };

  if (!isEnabled && !isPlaying) return null;

  return (
    <>
      {/* Initial Prompt Overlay */}
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
                  <button
                    onClick={handleStart}
                    className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    Play Tutorial
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="flex gap-3">
                    <button
                      onClick={handleSkip}
                      className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-all active:scale-95"
                    >
                      Skip
                    </button>
                    <button
                      onClick={handleDisable}
                      className="flex-1 py-3 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-100 transition-all active:scale-95 text-xs"
                    >
                      Never Show Again
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tutorial Steps Overlay */}
      <AnimatePresence>
        {isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] pointer-events-none"
          >
            {/* Spotlight Mask (simplified) */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute bottom-32 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-white/95 backdrop-blur-xl rounded-[28px] border border-white/20 shadow-2xl p-8 pointer-events-auto"
            >
              <div className="flex gap-6 items-start">
                <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
                  {(() => {
                    const Icon = tutorialSteps[currentStep].icon;
                    return <Icon className="w-8 h-8 text-white" />;
                  })()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                      Step {currentStep + 1} of {tutorialSteps.length}
                    </span>
                    <button onClick={() => setIsPlaying(false)} className="p-1 hover:bg-gray-100 rounded-full text-gray-400">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mt-1">{tutorialSteps[currentStep].title}</h3>
                  <p className="text-gray-500 mt-2 font-medium leading-relaxed">
                    {tutorialSteps[currentStep].description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-8">
                    <div className="flex gap-1.5">
                      {tutorialSteps.map((_, i) => (
                        <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentStep ? 'w-6 bg-blue-600' : 'bg-gray-200'}`} />
                      ))}
                    </div>
                    <button
                      onClick={handleNext}
                      className="px-8 py-3 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-600/20"
                    >
                      {currentStep === tutorialSteps.length - 1 ? "Finish" : "Next"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Arrow Indicator (Pointing to potential highlight) */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute -top-12 left-1/2 -translate-x-1/2"
              >
                <div className="w-4 h-4 bg-white rotate-45 border-l border-t border-black/5" />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
