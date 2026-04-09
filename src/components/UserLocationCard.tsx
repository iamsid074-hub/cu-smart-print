import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, ChevronDown, User } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useMembership } from "@/hooks/useMembership";
import EditLocationModal from "./EditLocationModal";
import MembershipPlansModal from "./MembershipPlansModal";

export default function UserLocationCard() {
  const { data, isLoaded } = useUserLocation();
  const { isActive, plan } = useMembership();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPlansOpen, setIsPlansOpen] = useState(false);
  const location = useLocation();

  if (!isLoaded || location.pathname !== "/home") return null;

  const hasLocation = data && (data.hostel || data.phone);

  return (
    <>
      <div className="absolute top-[4.5rem] sm:top-[6rem] left-0 right-0 z-[99] pointer-events-none flex justify-center">
        <div className="w-full max-w-[1200px] px-4 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative w-full rounded-2xl overflow-hidden pointer-events-auto"
            style={{
              background:
                "linear-gradient(135deg, #7c3aed 0%, #a855f7 30%, #6d28d9 60%, #8b5cf6 100%)",
              boxShadow:
                "0 8px 32px rgba(124, 58, 237, 0.35), 0 2px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.15)",
            }}
          >
            {/* Animated glow orbs */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              <motion.div
                animate={{ x: [0, 30, 0], y: [0, -10, 0], scale: [1, 1.2, 1] }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -top-4 -left-4 w-24 h-24 bg-purple-400/30 rounded-full blur-2xl"
              />
              <motion.div
                animate={{ x: [0, -20, 0], y: [0, 15, 0], scale: [1, 1.3, 1] }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
                className="absolute -bottom-6 -right-6 w-32 h-32 bg-fuchsia-400/20 rounded-full blur-2xl"
              />
              <motion.div
                animate={{ x: [0, 15, 0], opacity: [0.2, 0.4, 0.2] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 2,
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white/10 rounded-full blur-xl"
              />
              {/* Subtle grid pattern overlay */}
              <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, white 1px, transparent 1px)",
                  backgroundSize: "16px 16px",
                }}
              />
            </div>

            {/* Content */}
            <div className="relative z-10 flex justify-between items-center px-4 py-1.5">
              <div className="flex flex-col items-start gap-0.5">
                <p className="text-[9px] font-bold text-purple-200/80 uppercase tracking-[0.15em] leading-none pl-[2px]">
                  Your location
                </p>
                <button
                  onClick={() => setIsEditOpen(true)}
                  className="flex items-center gap-1.5 text-white transition-opacity hover:opacity-90 group max-w-[160px] sm:max-w-[220px]"
                >
                  <div className="bg-white/20 backdrop-blur-sm p-1 rounded-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                    <MapPin
                      className="w-3.5 h-3.5 text-white shrink-0"
                      strokeWidth={3}
                    />
                  </div>
                  <span className="text-[13px] sm:text-[15px] font-black tracking-tight truncate leading-snug drop-shadow-sm">
                    {hasLocation
                      ? `${data.room}, ${data.hostel}`
                      : "Add Location"}
                  </span>
                  <ChevronDown
                    className="w-3.5 h-3.5 text-purple-200 group-hover:text-white transition-colors shrink-0"
                    strokeWidth={3}
                  />
                </button>
              </div>

              <div className="flex items-center gap-2.5">
                {isActive && (
                  <motion.button
                    onClick={() => setIsPlansOpen(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-400 text-purple-900 px-2.5 py-1 rounded-full shadow-[0_4px_16px_rgba(251,191,36,0.3),inset_0_1px_0_rgba(255,255,255,0.4)] border border-amber-300/40"
                  >
                    ✦ MEMBER
                  </motion.button>
                )}
                <Link
                  to="/profile"
                  className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm border border-white/25 shadow-[0_4px_12px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.2)] flex items-center justify-center text-white hover:bg-white/30 hover:scale-105 transition-all"
                >
                  <User className="w-3.5 h-3.5" strokeWidth={2.5} />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <EditLocationModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
      />
      <MembershipPlansModal
        isOpen={isPlansOpen}
        onClose={() => setIsPlansOpen(false)}
      />
    </>
  );
}
