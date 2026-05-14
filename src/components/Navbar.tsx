import { useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import TopDynamicIsland from "./TopDynamicIsland";
import MobileStatusBar from "./MobileStatusBar";
import SellModal from "./SellModal";
import UserLocationCard from "./UserLocationCard";

export default function Navbar() {
  const [sellOpen, setSellOpen] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname.replace(/\/$/, "") || "/";
  const hidePaths = ["/", "/login", "/reset-password"];
  const shouldHide = hidePaths.includes(currentPath);

  return (
    <>
      {/* Dynamic Island — always visible, always on top (mobile only) */}
      {!shouldHide && (
        <div className="relative z-[90000] md:hidden">
          <MobileStatusBar />
          <TopDynamicIsland onSell={() => setSellOpen(true)} />
        </div>
      )}


      <SellModal isOpen={sellOpen} onClose={() => setSellOpen(false)} />
    </>
  );
}
