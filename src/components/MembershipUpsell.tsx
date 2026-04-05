import { useState } from "react";
import { Crown, Zap, ArrowRight, ShieldCheck } from "lucide-react";
import { useMembership } from "@/hooks/useMembership";
import MembershipPlansModal from "./MembershipPlansModal";

interface MembershipUpsellProps {
  currentDeliveryFee: number;
}

export default function MembershipUpsell({
  currentDeliveryFee,
}: MembershipUpsellProps) {
  const { isLoaded, isActive } = useMembership();
  const [isPlansOpen, setIsPlansOpen] = useState(false);

  // If still loading or already active, don't show upsell
  if (!isLoaded || isActive) return null;

  // Don't strongly upsell if they already selected Cash on Gate (delivery fee is 51 due to COD).
  // Actually, maybe it's still worth upselling but we can just say "Save on future orders".
  // For now, if fee > 0, we can always show the upsell pointing out FREE delivery.

  return (
    <div className="mb-4">
      <div
        onClick={() => setIsPlansOpen(true)}
        className="w-full relative overflow-hidden rounded-2xl p-[1px] cursor-pointer group hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-sm"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-indigo-500 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

        <div className="relative w-full h-full bg-slate-900 rounded-2xl p-4 flex items-center justify-between gap-3 overflow-hidden">
          {/* Background glow */}
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-purple-500/30 blur-[30px] rounded-full" />
          <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-indigo-500/20 blur-[30px] rounded-full" />

          <div className="relative z-10 flex-1">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Crown className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-200">
                Get FREE Delivery
              </h4>
            </div>
            <p className="text-xs text-slate-400 font-medium leading-tight">
              Subscribe to{" "}
              <span className="text-white font-bold">CB PRIME</span> and save
              â‚¹{currentDeliveryFee > 0 ? currentDeliveryFee : 29} right now,
              plus free deliveries all week!
            </p>
          </div>

          <div className="relative z-10 bg-white/10 p-2.5 rounded-xl border border-white/10 flex items-center justify-center flex-shrink-0 backdrop-blur-md">
            <ArrowRight className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>

      <MembershipPlansModal
        isOpen={isPlansOpen}
        onClose={() => setIsPlansOpen(false)}
      />
    </div>
  );
}
