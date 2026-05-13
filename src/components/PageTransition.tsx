import { motion } from "framer-motion";
import { ReactNode } from "react";

// iOS-style app open/close spring transition
const iosSpring = {
  type: "spring" as const,
  stiffness: 380,
  damping: 34,
  mass: 0.9,
};

const variants = {
  // App opening: zoom up from slightly smaller, fade in
  initial: {
    opacity: 0,
    scale: 0.91,
  },
  // Fully open
  animate: {
    opacity: 1,
    scale: 1,
    transition: iosSpring,
  },
  // App closing: shrink slightly + fade out (fast)
  exit: {
    opacity: 0,
    scale: 1.04,
    transition: {
      duration: 0.18,
      ease: [0.36, 0, 0.66, -0.56],
    },
  },
};

interface PageTransitionProps {
  children: ReactNode;
  /** Pass location.key so AnimatePresence can detect route changes */
  locationKey: string;
}

export default function PageTransition({ children, locationKey }: PageTransitionProps) {
  return (
    <motion.div
      key={locationKey}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        // GPU-accelerate the transform for 120Hz smoothness
        willChange: "transform, opacity",
        backfaceVisibility: "hidden",
      }}
    >
      {children}
    </motion.div>
  );
}
