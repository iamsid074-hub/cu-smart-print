import { motion } from "framer-motion";
import DynamicIsland from "./DynamicIsland";
import { useState, useCallback } from "react";

export default function Navbar() {
  const [islandExpanded, setIslandExpanded] = useState(false);
  const handleIslandExpand = useCallback((expanded: boolean) => setIslandExpanded(expanded), []);

  return (
    <motion.nav
      initial={{ y: -80, x: "-50%", opacity: 0 }}
      animate={{ y: 0, x: "-50%", opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      className="fixed top-4 sm:top-6 left-1/2 z-50 flex items-center justify-center"
    >
      <DynamicIsland onExpandChange={handleIslandExpand} />
    </motion.nav>
  );
}
