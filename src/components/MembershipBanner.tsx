import { useState } from "react";
import { Sparkles, ArrowRight, Zap, Crown } from "lucide-react";
import { useMembership } from "@/hooks/useMembership";
import MembershipPlansModal from "./MembershipPlansModal";

export default function MembershipBanner() {
  const { isLoaded, isActive, plan } = useMembership();
  const [isPlansOpen, setIsPlansOpen] = useState(false);

  if (!isLoaded || isActive) return null; // Don't show upsell banner if they already have an active plan

  return (
    <>
      <div className="mx-4 lg:mx-8 mt-2 mb-6">
        <div
          onClick={() => setIsPlansOpen(true)}
          className="relative w-full rounded-3xl overflow-hidden p-[1px] cursor-pointer group transform transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-purple-900/5"
        >
          {/* Premium sleek border */}
          <div className="absolute inset-0 bg-[#3A3A3C] rounded-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative w-full h-full bg-[#0F1115] rounded-3xl p-5 sm:p-6 overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="relative z-10 flex flex-col">
              <div className="flex items-center gap-2 mb-1.5">
                <Crown className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  CB Membership
                </h3>
              </div>
              <p className="text-sm sm:text-[15px] font-medium text-slate-400 tracking-wide">
                Get up to{" "}
                <span className="text-white font-bold">25 FREE deliveries</span>{" "}
                every week.
              </p>

              <div className="flex gap-2 mt-4 sm:hidden">
                <span className="text-xs font-bold bg-white/10 text-white px-3 py-1.5 rounded-full backdrop-blur-md">
                  Starts at ₹49/wk
                </span>
              </div>
            </div>

            <div className="relative z-10 flex items-center gap-4 w-full sm:w-auto mt-2 sm:mt-0">
              <div className="hidden sm:flex items-center">
                <span className="text-sm font-bold text-[#8E8E93] mr-4">
                  Plans from ₹49/wk
                </span>
              </div>
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-black font-black text-sm px-6 py-3.5 rounded-xl transition-colors hover:bg-slate-200">
                Explore Plans
                <ArrowRight className="w-4 h-4" strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <MembershipPlansModal
        isOpen={isPlansOpen}
        onClose={() => setIsPlansOpen(false)}
      />
    </>
  );
}
