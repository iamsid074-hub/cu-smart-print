import { Suspense, lazy } from "react";
import DesktopWindow from "./DesktopWindow";

const CombosSection = lazy(() => import("./CombosSection"));

interface DesktopWindowCombosProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  isMaximized?: boolean;
  onFocus?: () => void;
  zIndex?: number;
}

export default function DesktopWindowCombos({ onClose, onMinimize, onMaximize, isMinimized, isMaximized, onFocus, zIndex }: DesktopWindowCombosProps) {
  return (
    <DesktopWindow 
      title="Curated Combos" 
      onClose={onClose} 
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      isMinimized={isMinimized}
      isMaximized={isMaximized}
      onFocus={onFocus}
      zIndex={zIndex}
      size="lg"
    >
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
