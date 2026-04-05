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
            <p className="text-xs font-bold uppercase tracking-wider mb-2 text-slate-500 relative flex items-center gap-2">
                <span className="bg-slate-200 h-px flex-1"></span>
                Payment Method
                <span className="bg-slate-200 h-px flex-1"></span>
            </p>

            {/* Online Payment (UPI) */}
            <button
                type="button"
                disabled={disabled}
                onClick={() => onChange("online")}
                className={`w-full rounded-2xl p-4 flex items-center gap-3 transition-all border ${selected === "online" ? 'bg-brand-50 border-brand-muted shadow-sm' : 'bg-white border-slate-200 hover:border-brand-50 hover:bg-slate-50'}`}
                style={{
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.5 : 1,
                }}
            >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${selected === "online" ? 'bg-brand-50' : 'bg-slate-100'}`}>
                    <Smartphone className={`w-4 h-4 ${selected === "online" ? 'text-brand' : 'text-slate-500'}`} />
                </div>
                <div className="flex-1 min-w-0 text-left">
                    <p className={`text-sm font-bold ${selected === "online" ? 'text-brand' : 'text-slate-900'}`}>Pay via UPI</p>
                    <p className={`text-[11px] font-medium mt-0.5 ${selected === "online" ? 'text-brand' : 'text-slate-500'}`}>GPay Â· PhonePe Â· Paytm</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected === "online" ? 'border-brand bg-white' : 'border-slate-300'}`}>
                        {selected === "online" && <div className="w-2.5 h-2.5 rounded-full bg-brand" />}
                    </div>
                </div>
            </button>

            {/* Cash on Gate */}
            <button
                type="button"
                disabled={disabled}
                onClick={() => onChange("cod")}
                className={`w-full rounded-2xl p-4 flex items-center gap-3 transition-all border ${selected === "cod" ? 'bg-orange-50 border-orange-200 shadow-sm' : 'bg-white border-slate-200 hover:border-orange-100 hover:bg-slate-50'}`}
                style={{
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.5 : 1,
                }}
            >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${selected === "cod" ? 'bg-orange-100' : 'bg-slate-100'}`}>
                    <Banknote className={`w-4 h-4 ${selected === "cod" ? 'text-orange-500' : 'text-slate-500'}`} />
                </div>
                <div className="flex-1 min-w-0 text-left">
                    <p className={`text-sm font-bold ${selected === "cod" ? 'text-orange-600' : 'text-slate-900'}`}>Cash on Gate</p>
                    <p className={`text-[11px] font-bold mt-0.5 ${selected === "cod" ? 'text-orange-500' : 'text-slate-500'}`}>First money, then order</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected === "cod" ? 'border-orange-500 bg-white' : 'border-slate-300'}`}>
                        {selected === "cod" && <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />}
                    </div>
                </div>
            </button>
        </div>
    );
}
