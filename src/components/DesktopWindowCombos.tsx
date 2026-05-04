import { Suspense, lazy } from "react";
import DesktopWindow from "./DesktopWindow";

const CombosSection = lazy(() => import("./CombosSection"));

export default function DesktopWindowCombos({ onClose }: { onClose: () => void }) {
  return (
    <DesktopWindow title="Curated Combos" onClose={onClose} size="md">
      <div className="p-6 bg-gradient-to-b from-purple-50/50 to-transparent min-h-full">
        <Suspense fallback={
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <CombosSection />
        </Suspense>
      </div>
    </DesktopWindow>
  );
}
