import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Banknote, Smartphone, ChevronRight } from "lucide-react";

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

            {/* Online Payment */}
            <button
                type="button"
                disabled={disabled}
                onClick={() => onChange("online")}
                className="w-full rounded-xl p-3.5 flex items-center gap-3 transition-all text-left disabled:opacity-50"
                style={{
                    background: selected === "online" ? 'rgba(77,184,172,0.08)' : 'rgba(255,255,255,0.03)',
                    border: selected === "online" ? '1.5px solid rgba(77,184,172,0.3)' : '1px solid rgba(255,255,255,0.06)',
                    boxShadow: selected === "online" ? '0 0 20px rgba(77,184,172,0.08), inset 0 1px 0 rgba(255,255,255,0.05)' : 'none',
                    backdropFilter: 'blur(12px)',
                }}
            >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{
                    background: selected === "online" ? 'rgba(77,184,172,0.15)' : 'rgba(255,255,255,0.05)',
                }}>
                    <Smartphone className="w-4 h-4" style={{ color: selected === "online" ? '#4DB8AC' : '#8F8175' }} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: selected === "online" ? '#E8DED4' : '#8F8175' }}>Pay via UPI</p>
                    <p className="text-[10px]" style={{ color: '#6B5F54' }}>GPay · PhonePe · Paytm</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${selected === "online" ? "border-[#4DB8AC]" : "border-white/15"}`}>
                        {selected === "online" && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#4DB8AC' }} />}
                    </div>
                </div>
            </button>

            {/* Cash on Delivery */}
            <button
                type="button"
                disabled={disabled}
                onClick={() => onChange("cod")}
                className="w-full rounded-xl p-3.5 flex items-center gap-3 transition-all text-left disabled:opacity-50"
                style={{
                    background: selected === "cod" ? 'rgba(240,192,64,0.06)' : 'rgba(255,255,255,0.03)',
                    border: selected === "cod" ? '1.5px solid rgba(240,192,64,0.25)' : '1px solid rgba(255,255,255,0.06)',
                    boxShadow: selected === "cod" ? '0 0 20px rgba(240,192,64,0.06), inset 0 1px 0 rgba(255,255,255,0.05)' : 'none',
                    backdropFilter: 'blur(12px)',
                }}
            >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{
                    background: selected === "cod" ? 'rgba(240,192,64,0.15)' : 'rgba(255,255,255,0.05)',
                }}>
                    <Banknote className="w-4 h-4" style={{ color: selected === "cod" ? '#F0C040' : '#8F8175' }} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: selected === "cod" ? '#E8DED4' : '#8F8175' }}>Cash on Delivery</p>
                    <p className="text-[10px]" style={{ color: '#6B5F54' }}>Pay ₹{totalAmount} when delivered</p>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${selected === "cod" ? "border-[#F0C040]" : "border-white/15"}`}>
                    {selected === "cod" && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#F0C040' }} />}
                </div>
            </button>
        </div>
    );
}
