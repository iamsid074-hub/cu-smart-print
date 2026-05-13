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
  const isSections = location.pathname.startsWith("/sections");

  return (
    <>
      {/* Dynamic Island — always visible, always on top (mobile only) */}
      <div className="relative z-[90000] md:hidden">
        <TopDynamicIsland onSell={() => setSellOpen(true)} />
      </div>


      <SellModal isOpen={sellOpen} onClose={() => setSellOpen(false)} />
    </>
  );
}
