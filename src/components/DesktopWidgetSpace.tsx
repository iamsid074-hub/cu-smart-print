import { motion } from "framer-motion";
import { Wallet, ShoppingBag, ArrowUpRight } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

export default function DesktopWidgetSpace() {
  const { totalPrice, items } = useCart();

  return (
    <div className="fixed right-8 top-24 z-[40] flex flex-col gap-6 w-72">

    <div className="fixed right-8 top-24 z-[40] flex flex-col gap-6 w-72">
    </div>

    </div>
  );
}
