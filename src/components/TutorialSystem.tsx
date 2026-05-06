import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, ChevronRight, Info, Layout, ShoppingCart, MousePointer2 } from "lucide-react";
import { toast } from "sonner";

interface TutorialStep {
  title: string;
  description: string;
  icon: any;
  highlightId: string;
  position: "top" | "bottom" | "center";
}

const tutorialSteps: TutorialStep[] = [
  {
    title: "Control Center",
    description: "Click the Top Menu bar or press 'C' to open the Control Center. Here you can toggle Dark Mode, Wi-Fi, and more.",
    icon: Layout,
    highlightId: "desktop-menu-bar",
    position: "top"
  },
  {
    title: "Dynamic Island",
    description: "The Dynamic Island at the top shows live notifications, orders, and system status in real-time.",
    icon: Info,
    highlightId: "dynamic-island-pill",
    position: "top"
  },
  {
    title: "Making an Order",
    description: "Open the 'Shops' app from the Dock, select a store, and add items to your cart to place an order.",
    icon: ShoppingCart,
    highlightId: "dock-app-Shops",
    position: "bottom"
  },
  {
    title: "The Dockbar",
    description: "Use the Dockbar at the bottom to quickly switch between your favorite apps and windows.",
    icon: MousePointer2,
    highlightId: "desktop-dock",
    position: "bottom"
  }
];

export default function TutorialSystem() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isEnabled, setIsEnabled] = useState(true);
  const [spotlightCoords, setSpotlightCoords] = useState({ x: 0, y: 0, width: 0, height: 0, padding: 8 });

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
      // Listen for the boot animation to finish before showing tutorial
      const onBootComplete = () => {
        setTimeout(() => setShowPrompt(true), 600);
      };
      window.addEventListener("eos-boot-complete", onBootComplete);

      // Fallback: if boot animation was already played (page revisit), show after delay
      const alreadyBooted = sessionStorage.getItem("eos_booted");
      let fallbackTimer: ReturnType<typeof setTimeout> | null = null;
      if (alreadyBooted) {
        fallbackTimer = setTimeout(() => setShowPrompt(true), 2500);
      }

      return () => {
        window.removeEventListener("eos-boot-complete", onBootComplete);
        if (fallbackTimer) clearTimeout(fallbackTimer);
      };
    }
  }, []);

  // Update spotlight coordinates whenever step changes
  useEffect(() => {
    if (isPlaying) {
      const step = tutorialSteps[currentStep];
      const el = document.getElementById(step.highlightId);
      if (el) {
        const rect = el.getBoundingClientRect();
        setSpotlightCoords({
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height,
          padding: step.highlightId.includes('dock') ? 12 : 8
        });
      } else {
        // Fallback to center if element not found
        setSpotlightCoords({ x: window.innerWidth / 2, y: window.innerHeight / 2, width: 0, height: 0, padding: 0 });
      }
    }
  }, [isPlaying, currentStep]);

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
                    Let's take a quick 1-minute tour to see how to use the site.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  <button onClick={handleStart} className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 active:scale-95">
                    Start Tour
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="flex gap-3">
                    <button onClick={handleSkip} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-all active:scale-95">Skip</button>
                    <button onClick={handleDisable} className="flex-1 py-3 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-100 transition-all active:scale-95 text-xs">Don't show again</button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isPlaying && (
          <div className="fixed inset-0 z-[10000]">
            {/* Spotlight Mask */}
            <svg className="w-full h-full pointer-events-none absolute inset-0">
              <defs>
                <mask id="spotlight-mask">
                  <rect width="100%" height="100%" fill="white" />
                  <motion.rect 
                    animate={{ 
                      x: spotlightCoords.x - spotlightCoords.padding,
                      y: spotlightCoords.y - spotlightCoords.padding,
                      width: spotlightCoords.width + spotlightCoords.padding * 2,
                      height: spotlightCoords.height + spotlightCoords.padding * 2,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    rx="16" 
                    fill="black" 
                  />
                </mask>
              </defs>
              <rect width="100%" height="100%" fill="rgba(0,0,0,0.7)" mask="url(#spotlight-mask)" className="backdrop-blur-[2px]" />
            </svg>

            <motion.div
              key={currentStep}
              initial={{ opacity: 0, scale: 0.95, x: "-50%" }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                x: "-50%",
                top: tutorialSteps[currentStep].position === "top" ? (spotlightCoords.y + spotlightCoords.height + 40) : "auto",
                bottom: tutorialSteps[currentStep].position === "bottom" ? (window.innerHeight - spotlightCoords.y + 40) : "auto",
                left: "50%"
              }}
              exit={{ opacity: 0, scale: 0.95, x: "-50%" }}
              className="fixed w-[90%] max-w-lg bg-white/95 backdrop-blur-xl rounded-[28px] border border-white/20 shadow-2xl p-8 pointer-events-auto"
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
                    <button onClick={handleNext} className="px-8 py-3 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-600/20">
                      {currentStep === tutorialSteps.length - 1 ? "Finish" : "Next"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Arrow Indicator pointing UP or DOWN */}
              <motion.div
                animate={{ y: tutorialSteps[currentStep].position === "top" ? [-10, 0, -10] : [10, 0, 10] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className={`absolute left-1/2 -translate-x-1/2 ${tutorialSteps[currentStep].position === "top" ? '-top-3' : '-bottom-3'}`}
              >
                <div className={`w-6 h-6 bg-white rotate-45 border-black/5 shadow-sm ${tutorialSteps[currentStep].position === "top" ? 'border-l border-t' : 'border-r border-b'}`} />
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
