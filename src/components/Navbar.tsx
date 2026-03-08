import { motion } from "framer-motion";
import DynamicIsland from "./DynamicIsland";
import { useState, useCallback } from "react";

export default function Navbar() {
  const [islandExpanded, setIslandExpanded] = useState(false);
  const handleIslandExpand = useCallback((expanded: boolean) => setIslandExpanded(expanded), []);

  return null;
}
