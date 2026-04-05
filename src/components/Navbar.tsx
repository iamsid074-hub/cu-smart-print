import { useState } from "react";
import TopDynamicIsland from "./TopDynamicIsland";
import SellModal from "./SellModal";
import UserLocationCard from "./UserLocationCard";

export default function Navbar() {
  const [sellOpen, setSellOpen] = useState(false);

  return (
    <>
      <TopDynamicIsland onSell={() => setSellOpen(true)} />
      <UserLocationCard />
      <SellModal isOpen={sellOpen} onClose={() => setSellOpen(false)} />
    </>
  );
}
