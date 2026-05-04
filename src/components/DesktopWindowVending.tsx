import { Suspense, lazy } from "react";
import DesktopWindow from "./DesktopWindow";

const VendingMachine = lazy(() => import("./VendingMachine"));

export default function DesktopWindowVending({ onClose }: { onClose: () => void }) {
  return (
    <DesktopWindow title="Smart Vending" onClose={onClose} size="md">
      <Suspense fallback={
        <div className="flex items-center justify-center h-full">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <VendingMachine />
      </Suspense>
    </DesktopWindow>
  );
}
