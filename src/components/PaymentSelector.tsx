import { Smartphone, Banknote } from "lucide-react";

interface PaymentSelectorProps {
    selected: "online" | "cod";
    onChange: (method: "online" | "cod") => void;
    totalAmount: number;
    disabled?: boolean;
}

export default function PaymentSelector({ selected, onChange, totalAmount, disabled }: PaymentSelectorProps) {
    return (
        <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#8F8175' }}>Payment Method</p>

            {/* Online Payment (UPI) */}
            <button
                type="button"
                disabled={disabled}
                onClick={() => onChange("online")}
                className="w-full rounded-xl p-3.5 flex items-center gap-3 transition-all"
                style={{
                    background: selected === "online" ? 'rgba(77,184,172,0.08)' : 'rgba(255,255,255,0.02)',
                    border: selected === "online" ? '1.5px solid rgba(77,184,172,0.3)' : '1.5px solid rgba(255,255,255,0.08)',
                    boxShadow: selected === "online" ? '0 0 20px rgba(77,184,172,0.08), inset 0 1px 0 rgba(255,255,255,0.05)' : 'none',
                    backdropFilter: 'blur(12px)',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.5 : 1,
                }}
            >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: selected === "online" ? 'rgba(77,184,172,0.15)' : 'rgba(255,255,255,0.05)' }}>
                    <Smartphone className="w-4 h-4" style={{ color: selected === "online" ? '#4DB8AC' : '#8F8175' }} />
                </div>
                <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-bold" style={{ color: '#E8DED4' }}>Pay via UPI</p>
                    <p className="text-[10px]" style={{ color: '#6B5F54' }}>GPay · PhonePe · Paytm · ₹{totalAmount}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center" style={{ borderColor: selected === "online" ? '#4DB8AC' : '#6B5F54' }}>
                        {selected === "online" && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#4DB8AC' }} />}
                    </div>
                </div>
            </button>

            {/* Cash on Delivery */}
            <button
                type="button"
                disabled={disabled}
                onClick={() => onChange("cod")}
                className="w-full rounded-xl p-3.5 flex items-center gap-3 transition-all"
                style={{
                    background: selected === "cod" ? 'rgba(255,183,77,0.08)' : 'rgba(255,255,255,0.02)',
                    border: selected === "cod" ? '1.5px solid rgba(255,183,77,0.3)' : '1.5px solid rgba(255,255,255,0.08)',
                    boxShadow: selected === "cod" ? '0 0 20px rgba(255,183,77,0.08), inset 0 1px 0 rgba(255,255,255,0.05)' : 'none',
                    backdropFilter: 'blur(12px)',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.5 : 1,
                }}
            >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: selected === "cod" ? 'rgba(255,183,77,0.15)' : 'rgba(255,255,255,0.05)' }}>
                    <Banknote className="w-4 h-4" style={{ color: selected === "cod" ? '#FFB74D' : '#8F8175' }} />
                </div>
                <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-bold" style={{ color: '#E8DED4' }}>Cash on Delivery</p>
                    <p className="text-[10px]" style={{ color: '#6B5F54' }}>Pay when you receive · ₹{totalAmount}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center" style={{ borderColor: selected === "cod" ? '#FFB74D' : '#6B5F54' }}>
                        {selected === "cod" && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#FFB74D' }} />}
                    </div>
                </div>
            </button>
        </div>
    );
}
