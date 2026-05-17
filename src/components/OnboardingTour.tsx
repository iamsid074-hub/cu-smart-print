import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, ChevronLeft, X, EyeOff, Sparkles, 
  Gamepad2, ImageIcon, Grid, Compass 
} from "lucide-react";

// Glassmorphic panel styling
const GLASS_TOOLTIP = {
  background: "linear-gradient(135deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)",
  backdropFilter: "blur(24px) saturate(1.8)",
  WebkitBackdropFilter: "blur(24px) saturate(1.8)",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  boxShadow: "0 20px 50px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.15)",
};

interface StepDef {
  title: string;
  description: string;
  selector: string | null;
  rx: number;
  icon: React.ComponentType<any>;
  iconBg: string;
}

const STEPS: StepDef[] = [
  {
    title: "Control Center Swipe",
    description: "Drag down from the top-left Time side to instantly open the settings, profile, wallet, and quick navigation actions panel.",
    selector: "#tour-time-trigger",
    rx: 12,
    icon: Compass,
    iconBg: "#3b82f6",
  },
  {
    title: "Wallpaper Swapper",
    description: "Tap the Wallpaper app to quickly browse, customize, and switch between gorgeous premium themes matching your style.",
    selector: ".tour-app-wallpaper",
    rx: 16,
    icon: ImageIcon,
    iconBg: "#8b5cf6",
  },
  {
    title: "Games Arcade",
    description: "Click the Mini Games app to open high-fidelity interactive games and participate in challenges right from your dashboard.",
    selector: ".tour-app-games",
    rx: 16,
    icon: Gamepad2,
    iconBg: "#ec4899",
  },
  {
    title: "Smart App Library",
    description: "Swipe all the way to the right side of the screen to open the smart App Library folder grid, separating all your apps by categories.",
    selector: null,
    rx: 0,
    icon: Grid,
    iconBg: "#10b981",
  }
];

interface OnboardingTourProps {
  onClose: () => void;
}

export default function OnboardingTour({ onClose }: OnboardingTourProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [spotlight, setSpotlight] = useState<{ x: number; y: number; w: number; h: number; rx: number } | null>(null);

  // Function to dynamically locate element coordinates and update spotlight position
  const updateSpotlight = useCallback(() => {
    const currentStep = STEPS[stepIndex];
    if (!currentStep || !currentStep.selector) {
      setSpotlight(null);
      return;
    }
    const el = document.querySelector(currentStep.selector);
    if (el) {
      const rect = el.getBoundingClientRect();
      // Add extra padding around target for breathing room
      const padding = 6;
      setSpotlight({
        x: rect.left - padding,
        y: rect.top - padding,
        w: rect.width + padding * 2,
        h: rect.height + padding * 2,
        rx: currentStep.rx,
      });
    } else {
      setSpotlight(null);
    }
  }, [stepIndex]);

  // Recalculate on step change or window resize
  useEffect(() => {
    updateSpotlight();
    window.addEventListener("resize", updateSpotlight);
    return () => window.removeEventListener("resize", updateSpotlight);
  }, [updateSpotlight]);

  const handleNext = () => {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
  };

  const handleFinish = () => {
    if (dontShowAgain) {
      localStorage.setItem("bazzar_onboarding_completed", "true");
    }
    onClose();
  };

  const handleSkip = () => {
    if (dontShowAgain) {
      localStorage.setItem("bazzar_onboarding_completed", "true");
    }
    onClose();
  };

  const currentStep = STEPS[stepIndex];
  const StepIcon = currentStep.icon;

  // Determine card placement based on target y position to prevent overlaps
  const isSpotlightOnTop = spotlight ? spotlight.y < window.innerHeight / 2 : true;

  return (
    <div className="fixed inset-0 z-[100000] overflow-hidden select-none pointer-events-none">
      {/* ── Spotlight SVG Mask Overlay ── */}
      <svg className="absolute inset-0 w-full h-full pointer-events-auto">
        <defs>
          <mask id="tour-spotlight-mask">
            {/* White covers the screen, making the overlay fully opaque (dark) */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Black cuts out the spotlight area, making it transparent */}
            {spotlight && (
              <rect
                x={spotlight.x}
                y={spotlight.y}
                width={spotlight.w}
                height={spotlight.h}
                rx={spotlight.rx}
                ry={spotlight.rx}
                fill="black"
              />
            )}
          </mask>
        </defs>
        {/* Semi-transparent backdrop with mask cutout */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.65)"
          mask="url(#tour-spotlight-mask)"
        />
      </svg>

      {/* ── Tour Tooltip Card Layer ── */}
      <div className="absolute inset-x-0 inset-y-0 flex flex-col justify-end p-5 md:items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={stepIndex}
            initial={{ opacity: 0, y: isSpotlightOnTop ? 20 : -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="w-full max-w-sm rounded-[32px] p-6 pointer-events-auto flex flex-col gap-5 border border-white/10"
            style={{
              ...GLASS_TOOLTIP,
              alignSelf: isSpotlightOnTop ? "flex-end" : "flex-start",
              marginTop: isSpotlightOnTop ? "0px" : "calc(env(safe-area-inset-top, 24px) + 50px)",
              marginBottom: isSpotlightOnTop ? "calc(env(safe-area-inset-bottom, 24px) + 16px)" : "0px",
            }}
          >
            {/* Top row: step count and skip */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold tracking-widest text-white/40 uppercase">
                Step {stepIndex + 1} of {STEPS.length}
              </span>
              <button
                onClick={handleSkip}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-white/50 hover:text-white hover:bg-white/10 active:scale-95 transition-all text-xs font-bold"
              >
                <X className="w-3.5 h-3.5" />
                Skip
              </button>
            </div>

            {/* Icon & Title */}
            <div className="flex gap-4 items-center">
              <div
                className="w-12 h-12 rounded-[18px] flex items-center justify-center shadow-lg border border-white/10 shrink-0"
                style={{ background: currentStep.iconBg }}
              >
                <StepIcon className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-extrabold text-lg tracking-tight flex items-center gap-1.5 leading-tight">
                  {currentStep.title}
                  {stepIndex === 0 && <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400/20" />}
                </span>
                <span className="text-white/40 text-xs font-semibold uppercase tracking-wider mt-0.5">Quick Guide</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-white/70 text-[13.5px] leading-relaxed font-medium">
              {currentStep.description}
            </p>

            {/* Swipe gesture helper animation (only for final step) */}
            {stepIndex === 3 && (
              <div className="w-full h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center gap-3 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-transparent opacity-30 animate-pulse" />
                {/* Visual gesture line */}
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500/40 animate-ping" />
                  <span className="text-white/60 text-xs font-extrabold uppercase tracking-widest animate-bounce">
                    Swipe Right 👉
                  </span>
                </div>
              </div>
            )}

            {/* Step progress dots */}
            <div className="flex gap-1.5 justify-center py-1">
              {STEPS.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === stepIndex ? "w-6 bg-white" : "w-1.5 bg-white/20"
                  }`}
                />
              ))}
            </div>

            {/* Bottom action controls */}
            <div className="flex flex-col gap-4 pt-1 border-t border-white/5">
              {/* Don't show again option */}
              <label className="flex items-center gap-2.5 cursor-pointer text-white/50 hover:text-white transition-colors group">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-transparent text-emerald-500 focus:ring-0 cursor-pointer"
                />
                <span className="text-[12px] font-bold tracking-tight select-none">
                  Don't show this onboarding guide again
                </span>
              </label>

              {/* Back / Next buttons */}
              <div className="flex gap-3 justify-between items-center w-full">
                <button
                  onClick={handleBack}
                  disabled={stepIndex === 0}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl border border-white/10 active:scale-95 transition-all text-xs font-black uppercase tracking-wider ${
                    stepIndex === 0
                      ? "opacity-30 pointer-events-none text-white/30 bg-transparent"
                      : "bg-white/5 hover:bg-white/10 text-white"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
                  Back
                </button>

                <button
                  onClick={handleNext}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-white text-slate-900 hover:bg-white/90 active:scale-95 transition-all text-xs font-black uppercase tracking-wider shadow-[0_4px_16px_rgba(255,255,255,0.2)]"
                >
                  {stepIndex === STEPS.length - 1 ? "Finish" : "Next"}
                  <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
