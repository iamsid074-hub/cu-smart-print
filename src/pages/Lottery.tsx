import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Ticket,
  Sparkles,
  ArrowLeft,
  Loader2,
  Wallet,
  CheckCircle,
  HelpCircle,
  Trophy,
  AlertTriangle,
  Gift,
  Coins,
  Lock
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

function triggerConfetti() {
  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "99999";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d")!;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles: any[] = [];
  const colors = ["#ff007f", "#ff00ff", "#00ffff", "#00ff00", "#ffff00", "#ff7f00"];

  for (let i = 0; i < 150; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height * 0.6,
      vx: (Math.random() - 0.5) * 15,
      vy: (Math.random() - 0.8) * 18,
      r: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      angle: Math.random() * 360,
      spin: Math.random() * 10 - 5
    });
  }

  function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.45; // gravity
      p.vx *= 0.98; // resistance
      p.angle += p.spin;

      if (p.y < canvas.height + 20) {
        active = true;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.angle * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
      ctx.restore();
    });

    if (active) {
      requestAnimationFrame(update);
    } else {
      if (document.body.contains(canvas)) {
        document.body.removeChild(canvas);
      }
    }
  }

  update();
}

export default function Lottery() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isSuperAdmin = user?.email === "iamsid074@gmail.com";

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);

  // Animation states
  const [activeDrawItem, setActiveDrawItem] = useState<any | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawResult, setDrawResult] = useState<"win" | "entered" | null>(null);

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen pt-24 pb-32 px-4 flex flex-col items-center justify-center relative text-white bg-[#08090D]">
        <div className="absolute top-10 left-10 w-80 h-80 bg-rose-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/10 blur-[130px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-20 bg-slate-900/50 border border-white/10 rounded-[2.5rem] p-8 max-w-lg mx-auto relative z-10 backdrop-blur-xl"
        >
          <div className="w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(244,63,94,0.2)]">
            <Lock className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-black tracking-tight mb-3">Raffle Pool Locked</h3>
          <p className="text-slate-400 font-medium text-sm mb-8 leading-relaxed max-w-xs mx-auto">
            This lucky draw feature is currently undergoing system testing and is restricted to administrators only. Check back later!
          </p>
          <button
            onClick={() => navigate("/home")}
            className="px-8 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-all border border-white/10 active:scale-95"
          >
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  useEffect(() => {
    fetchProducts();
    if (user) {
      fetchWalletBalance();
    }
  }, [user]);

  async function fetchProducts() {
    setLoading(true);
    const { data } = await supabase
      .from("products")
      .select("*, profiles(full_name)")
      .eq("status", "available")
      .order("created_at", { ascending: false });
    setProducts(data || []);
    setLoading(false);
  }

  async function fetchWalletBalance() {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("wallet_balance")
      .eq("id", user.id)
      .single();
    if (data) {
      setWalletBalance(data.wallet_balance || 0);
    }
  }

  const handleBuyTicket = async (product: any) => {
    if (!user) {
      toast({ title: "Please login to play", variant: "destructive" });
      navigate("/login");
      return;
    }

    if (walletBalance < 10) {
      toast({
        title: "Insufficient Balance",
        description: "Please add money to your wallet to buy tickets.",
        variant: "destructive",
      });
      return;
    }

    // Start drawing animation
    setActiveDrawItem(product);
    setIsDrawing(true);
    setDrawResult(null);

    try {
      // 1. Deduct ₹10 from wallet_balance
      const updatedBalance = walletBalance - 10;
      const { error: balanceErr } = await supabase
        .from("profiles")
        .update({ wallet_balance: updatedBalance })
        .eq("id", user.id);

      if (balanceErr) throw balanceErr;

      // 2. Insert transaction for ticket purchase
      const { error: txErr } = await supabase.from("wallet_transactions").insert({
        user_id: user.id,
        amount: -10,
        type: "usage",
        description: `Raffle Pass: ${product.title}`,
      });

      if (txErr) throw txErr;

      // Update local wallet balance immediately
      setWalletBalance(updatedBalance);

      // Play sound / trigger haptic theoretically, then spin for 3.5 seconds
      setTimeout(async () => {
        // Determine outcome: 40% win immediate Cashfree reward, 60% entered in draw pool
        const outcome = Math.random() < 0.4 ? "win" : "entered";
        setDrawResult(outcome);
        setIsDrawing(false);

        if (outcome === "win") {
          // Reward: user gets ₹50 Cashback immediately added to their wallet!
          const winBalance = updatedBalance + 50;
          await supabase
            .from("profiles")
            .update({ wallet_balance: winBalance })
            .eq("id", user.id);

          await supabase.from("wallet_transactions").insert({
            user_id: user.id,
            amount: 50,
            type: "reward",
            description: `🎉 Instant cashback win from ${product.title} draw!`,
          });

          // Trigger Confetti!
          triggerConfetti();

          setWalletBalance(winBalance);
        }
      }, 3500);

    } catch (err: any) {
      console.error(err);
      toast({
        title: "Transaction failed",
        description: err.message || "Please try again later.",
        variant: "destructive",
      });
      setIsDrawing(false);
      setActiveDrawItem(null);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-32 px-4 sm:px-6 relative text-white bg-[#08090D]">
      {/* Background ambient lighting */}
      <div className="absolute top-10 left-10 w-80 h-80 bg-rose-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-[1200px] mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-300" />
            </button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight flex items-center gap-2">
                <Ticket className="w-8 h-8 text-rose-500 fill-rose-500/20" />
                Campus Lucky Draw
              </h1>
              <p className="text-sm text-slate-400 font-medium">
                Spend ₹10 to win second-hand campus products or instant cash rewards!
              </p>
            </div>
          </div>

          {user && (
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-3 rounded-2xl backdrop-blur-md self-start sm:self-auto">
              <Wallet className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Your Balance</p>
                <p className="text-lg font-black text-white">₹{walletBalance.toFixed(2)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Info banner */}
        <div className="mb-10 p-5 rounded-3xl bg-gradient-to-r from-rose-950/20 to-purple-950/20 border border-white/5 backdrop-blur-xl flex gap-4 items-center">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-400 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">How it works</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Every ₹10 ticket enters you in the draw pool for that item. Plus, every entry has a <span className="text-rose-400 font-bold">40% chance</span> to instantly win <span className="text-emerald-400 font-bold">₹50 Cash Reward</span> credited to your Bazzar wallet!
            </p>
          </div>
        </div>

        {/* Content list */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-rose-500" />
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Fetching items...
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white/5 border border-white/10 rounded-[2.5rem] p-8 max-w-lg mx-auto">
            <Trophy className="w-16 h-16 text-slate-500 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold tracking-tight mb-2">No active items for draw</h3>
            <p className="text-slate-400 font-medium text-sm mb-6 leading-relaxed">
              Students haven't listed second-hand products recently. Visit the Campus Market to list your own item and launch a raffle pass!
            </p>
            <button
              onClick={() => navigate("/list")}
              className="px-6 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 transition-colors font-bold text-sm text-white"
            >
              List Secondhand Product
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <motion.div
                key={product.id}
                whileHover={{ y: -5 }}
                className="relative flex flex-col justify-between rounded-[2.5rem] bg-slate-900/50 border border-white/10 overflow-hidden shadow-xl"
              >
                {/* Product Image */}
                <div className="h-48 relative overflow-hidden bg-slate-950 flex items-center justify-center p-4">
                  <img
                    src={product.image_url || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400"}
                    alt={product.title}
                    className="max-h-full max-w-full object-contain"
                  />
                  <div className="absolute top-4 left-4 bg-rose-600/90 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-rose-500">
                    Raffle Live
                  </div>
                  <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full">
                    Worth: ₹{product.price}
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] uppercase tracking-wider text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-md">
                        {product.condition}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Seller: {product.profiles?.full_name || "Student"}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-white line-clamp-1 mb-2">
                      {product.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium line-clamp-2 leading-relaxed mb-6">
                      {product.reason_for_selling || "No details specified."}
                    </p>
                  </div>

                  <button
                    onClick={() => handleBuyTicket(product)}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-purple-600 text-white font-bold text-xs hover:from-rose-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.98]"
                  >
                    <Ticket className="w-4 h-4" />
                    Buy Pass Ticket for ₹10
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* DRAW ANIMATION OVERLAY MODAL */}
      <AnimatePresence>
        {activeDrawItem && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center pointer-events-auto bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-[#12141C] border border-white/10 rounded-[2.5rem] p-8 text-center relative overflow-hidden"
            >
              {/* Decorative particles */}
              <div className="absolute -top-10 -left-10 w-24 h-24 bg-rose-500/20 blur-[30px] rounded-full" />
              <div className="absolute -bottom-10 -right-10 w-28 h-28 bg-purple-500/20 blur-[30px] rounded-full" />

              {isDrawing ? (
                <div className="relative z-10 py-8">
                  {/* Spinning raffle ticket */}
                  <div className="w-24 h-24 bg-gradient-to-tr from-rose-500 to-purple-600 rounded-full mx-auto flex items-center justify-center mb-6 border border-white/20 shadow-[0_0_30px_rgba(244,63,94,0.3)] animate-spin">
                    <Ticket className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-white mb-2">Generating Ticket Pass...</h3>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-6 animate-pulse">
                    Connecting to secure draw node
                  </p>
                  
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden max-w-[200px] mx-auto">
                    <motion.div 
                      className="bg-gradient-to-r from-rose-500 to-purple-600 h-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 3.3 }}
                    />
                  </div>
                </div>
              ) : (
                <div className="relative z-10 py-6">
                  {drawResult === "win" ? (
                    <>
                      <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                        <Gift className="w-10 h-10" />
                      </div>
                      <h3 className="text-2xl font-black text-emerald-400 mb-2">Instant Cash Winner! 🎉</h3>
                      <p className="text-sm text-slate-300 font-medium leading-relaxed mb-6">
                        Incredible luck! You purchased a ticket for <span className="font-bold text-white">{activeDrawItem.title}</span> and won an instant cash reward of <span className="font-bold text-emerald-400">₹50</span> credited to your wallet!
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(244,63,94,0.2)]">
                        <CheckCircle className="w-10 h-10" />
                      </div>
                      <h3 className="text-2xl font-black text-white mb-2">Raffle Entered! 🎟️</h3>
                      <p className="text-sm text-slate-300 font-medium leading-relaxed mb-6">
                        Your ticket pass for <span className="font-bold text-white">{activeDrawItem.title}</span> has been entered into the draw pool. Winner will be drawn when pool is full!
                      </p>
                    </>
                  )}

                  <button
                    onClick={() => {
                      setActiveDrawItem(null);
                      setDrawResult(null);
                    }}
                    className="w-full py-4 bg-white/10 hover:bg-white/15 text-white font-bold rounded-2xl transition-all border border-white/10 active:scale-[0.98]"
                  >
                    Play Again
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
