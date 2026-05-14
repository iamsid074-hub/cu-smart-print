import { motion } from "framer-motion";
import { ReactNode } from "react";
import { pageVariants } from "@/lib/motion";

interface PageTransitionProps {
  children: ReactNode;
  /** Pass location.key so AnimatePresence can detect route changes */
  locationKey: string;
}

export default function PageTransition({ children, locationKey }: PageTransitionProps) {
  return (
    <motion.div
      key={locationKey}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        overflowY: "auto",
        overflowX: "hidden",
        WebkitOverflowScrolling: "touch",
        backfaceVisibility: "hidden",
        // willChange is managed by framer-motion automatically during animation
      }}
    >
      {children}
    </motion.div>
  );
}
