import { Suspense, lazy } from "react";
import DesktopWindow from "./DesktopWindow";

const VendingMachine = lazy(() => import("./VendingMachine"));

interface DesktopWindowVendingProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  isMaximized?: boolean;
  onFocus?: () => void;
  zIndex?: number;
}

export default function DesktopWindowVending({ onClose, onMinimize, onMaximize, isMinimized, isMaximized, onFocus, zIndex }: DesktopWindowVendingProps) {
  return (
    <DesktopWindow 
      title="Smart Vending" 
      onClose={onClose} 
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      isMinimized={isMinimized}
      isMaximized={isMaximized}
      onFocus={onFocus}
      zIndex={zIndex}
      size="md"
    >
      <Suspense fallback={
        <div className="flex items-center justify-center h-full">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <VendingMachine isCompact={true} />
      </Suspense>
    </DesktopWindow>
  );
}
