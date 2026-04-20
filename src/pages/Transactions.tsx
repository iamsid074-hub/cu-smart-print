import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { ReceiptText, ArrowLeft, Loader2, IndianRupee } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Transactions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTransactions() {
      if (!user) return;
      
      // Fetch only successfully delivered/completed orders for the buyer
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          total_price,
          status,
          created_at,
          products ( title, image_url )
        `)
        .eq("buyer_id", user.id)
        .in("status", ["delivered", "completed"])
        .order("created_at", { ascending: false });

      if (!error && data) {
        setTransactions(data);
      }
      setLoading(false);
    }
    
    fetchTransactions();
  }, [user]);

  // Calculate exactly total spent from displayed transactions
  const totalSpent = transactions.reduce((sum, t) => sum + (Number(t.total_price) || 0), 0);

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-white pb-20">
      {/* HEADER - Adjusted for Dynamic Island clearance */}
      <div className="sticky top-0 z-40 bg-[#0d0d0f]/80 backdrop-blur-xl border-b border-white/5 px-4 pt-16 pb-4 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-white/5 transition-all text-white active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[20px] font-black tracking-tight">Transactions</h1>
      </div>

      <div className="px-4 py-8 max-w-2xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          </div>
        ) : (
          <>
            {/* SPENDING OVERVIEW */}
            <div className="bg-[#1c1c1e] rounded-[2rem] p-6 border border-white/5 mb-8 flex items-center justify-between shadow-xl">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-gray-500 mb-1">Total Spent</p>
                <div className="flex items-center gap-1 text-white">
                  <IndianRupee className="w-6 h-6 text-emerald-400" />
                  <span className="text-[32px] font-black tracking-tight leading-none">{totalSpent.toFixed(2)}</span>
                </div>
                <p className="text-[12px] font-bold text-emerald-400/80 mt-2 tracking-wide">
                  Calculated from successful deliveries only.
                </p>
              </div>
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <ReceiptText className="w-8 h-8 text-emerald-400" />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-[15px] font-black tracking-tight px-2 text-white">Transaction History</h2>
              
              {transactions.length === 0 ? (
                <div className="py-12 bg-[#1c1c1e] border border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center opacity-80">
                  <ReceiptText className="w-10 h-10 text-gray-600 mb-3" />
                  <p className="text-gray-400 font-bold text-[14px]">No successful transactions yet.</p>
                </div>
              ) : (
                transactions.map((tx, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={tx.id} 
                    className="bg-[#1c1c1e] p-4 rounded-3xl border border-white/5 flex items-center gap-4"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-black overflow-hidden flex-shrink-0">
                      <img 
                        src={tx.products?.image_url || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=100"} 
                        alt="product" 
                        className="w-full h-full object-cover opacity-80 grayscale-[20%]"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-bold text-white truncate tracking-tight">{tx.products?.title || "Item"}</p>
                      <p className="text-[12px] font-bold text-gray-500 tracking-wide mt-0.5">
                        {new Date(tx.created_at).toLocaleDateString(undefined, {
                          year: 'numeric', month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[17px] font-black text-white tracking-tight">-₹{Number(tx.total_price).toFixed(2)}</span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full mt-1 bg-emerald-500/10 text-emerald-400 uppercase tracking-widest">
                        Delivered
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
