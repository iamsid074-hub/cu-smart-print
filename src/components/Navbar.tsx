import { useState } from "react";
import TopDynamicIsland from "./TopDynamicIsland";
import SellModal from "./SellModal";

export default function Navbar() {
  const [sellOpen, setSellOpen] = useState(false);

  return (
    <>
      <TopDynamicIsland onSell={() => setSellOpen(true)} />
      <SellModal isOpen={sellOpen} onClose={() => setSellOpen(false)} />
    </>
  );
}
