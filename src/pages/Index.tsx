import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, ShoppingBag, Star, TrendingUp } from "lucide-react";

const floatingStats = [
  { label: "Active Students", value: "12K+", icon: Star },
  { label: "Items Listed", value: "48K+", icon: ShoppingBag },
  { label: "Deals Done", value: "6K+", icon: TrendingUp },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Background */}
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2000&auto=format&fit=crop" alt="hero" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/60 to-background" />
          <div className="absolute inset-0 bg-grid opacity-30" />
        </div>

        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-neon-orange/10 blur-[120px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-neon-cyan/10 blur-[120px] animate-float" style={{ animationDelay: "2s" }} />

        {/* Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 pt-20">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-neon-orange/30 mb-8"
          >
            <span className="neon-dot text-sm font-medium text-foreground">Now live at your campus</span>
            <Zap className="w-4 h-4 text-neon-orange" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }}
            className="text-5xl sm:text-7xl font-bold leading-tight mb-6"
          >
            The Campus
            <br />
            <span className="text-neon-aurora animate-aurora">Marketplace</span>
            <br />
            <span className="text-foreground/80">You Deserved</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Buy, sell & trade with fellow students. From textbooks to gadgets, fashion to furniture — all in one vibrant marketplace.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link to="/home">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-fire text-white font-bold text-lg shadow-neon-fire btn-ripple transition-all duration-300"
              >
                <ShoppingBag className="w-5 h-5" />
                Start Shopping
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </motion.button>
            </Link>
            <Link to="/list">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-8 py-4 rounded-2xl glass border border-white/10 text-foreground font-semibold text-lg hover:border-neon-cyan/40 transition-all duration-300"
              >
                <Zap className="w-5 h-5 text-neon-cyan" />
                List an Item
              </motion.button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="grid grid-cols-3 gap-4 max-w-lg mx-auto"
          >
            {floatingStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + i * 0.1, ease: [0.34, 1.56, 0.64, 1] }}
                className="glass rounded-xl p-4 text-center"
              >
                <stat.icon className="w-5 h-5 text-neon-orange mx-auto mb-1" />
                <div className="font-bold text-xl text-neon-fire">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground"
        >
          <span className="text-xs font-mono">scroll</span>
          <div className="w-0.5 h-8 bg-gradient-fire rounded-full animate-pulse" />
        </motion.div>
      </section>

      {/* Features strip */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              {
                title: "Zero Commission",
                desc: "Keep 100% of what you earn. No hidden fees, ever.",
                gradient: "from-neon-orange to-neon-pink",
                glow: "shadow-neon-fire",
              },
              {
                title: "Instant Messaging",
                desc: "Chat directly with buyers and sellers in real-time.",
                gradient: "from-neon-cyan to-neon-blue",
                glow: "shadow-neon-ocean",
              },
              {
                title: "Live Tracking",
                desc: "Track your deliveries step-by-step within campus.",
                gradient: "from-neon-pink to-neon-blue",
                glow: "",
              },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, ease: [0.34, 1.56, 0.64, 1] }}
                whileHover={{ y: -6 }}
                className={`glass rounded-2xl p-6 border border-white/5 ${f.glow} transition-all duration-300`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} mb-4 flex items-center justify-center text-white font-bold text-xl`}>
                  {["₹", "💬", "🚀"][i]}
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
