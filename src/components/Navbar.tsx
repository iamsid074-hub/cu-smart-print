import { useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import TopDynamicIsland from "./TopDynamicIsland";
import SellModal from "./SellModal";
import UserLocationCard from "./UserLocationCard";

export default function Navbar() {
  const [sellOpen, setSellOpen] = useState(false);

  const location = useLocation();
  const isCart = location.pathname === "/cart";

  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: isCart ? -120 : 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
    >
      <TopDynamicIsland onSell={() => setSellOpen(true)} />
      <UserLocationCard />
      <SellModal isOpen={sellOpen} onClose={() => setSellOpen(false)} />
    </motion.div>
  );
}
