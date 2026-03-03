import { Smartphone, Lock } from "lucide-react";

interface PaymentSelectorProps {
    selected: "online" | "cod";
    onChange: (method: "online" | "cod") => void;
    totalAmount: number;
    disabled?: boolean;
}

// COD is temporarily disabled — only online payment (UPI) is supported.
export default function PaymentSelector({ totalAmount, disabled }: PaymentSelectorProps) {
    return (
        <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#8F8175' }}>Payment Method</p>

            {/* Online Payment — only option */}
            <div
                className="w-full rounded-xl p-3.5 flex items-center gap-3"
                style={{
                    background: 'rgba(77,184,172,0.08)',
                    border: '1.5px solid rgba(77,184,172,0.3)',
                    boxShadow: '0 0 20px rgba(77,184,172,0.08), inset 0 1px 0 rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(12px)',
                }}
            >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(77,184,172,0.15)' }}>
                    <Smartphone className="w-4 h-4" style={{ color: '#4DB8AC' }} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: '#E8DED4' }}>Pay via UPI</p>
                    <p className="text-[10px]" style={{ color: '#6B5F54' }}>GPay · PhonePe · Paytm · ₹{totalAmount}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    <div className="w-4 h-4 rounded-full border-2 border-[#4DB8AC] flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#4DB8AC' }} />
                    </div>
                </div>
            </div>

            {/* COD — disabled notice */}
            <div
                className="w-full rounded-xl p-3 flex items-center gap-2.5 opacity-50 cursor-not-allowed"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}
            >
                <Lock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#6B5F54' }} />
                <p className="text-xs" style={{ color: '#6B5F54' }}>
                    Cash on Delivery temporarily unavailable
                </p>
            </div>
        </div>
    );
}
