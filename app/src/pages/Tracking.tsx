import { motion } from "framer-motion";
import { Package, Truck, Home, CheckCircle, MapPin, Clock, Star } from "lucide-react";

const steps: any[] = [];
const activity: any[] = [];

export default function Tracking() {
  return (
    <div className="min-h-screen bg-background pt-20 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-muted-foreground text-sm font-mono mb-1">DELIVERY TRACKING</p>
          <h1 className="text-3xl font-bold">
            Track Your <span className="text-neon-cyan">Order</span>
          </h1>
        </motion.div>

        {steps.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-3xl p-12 text-center border border-white/5 flex flex-col items-center justify-center min-h-[400px]"
          >
            <Package className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
            <h2 className="text-xl font-bold mb-2">No active orders</h2>
            <p className="text-muted-foreground max-w-sm">
              Your tracking information will appear here once you place an order.
            </p>
          </motion.div>
        ) : (
          <>
            {/* Order card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-3xl p-6 mb-6 border border-white/5"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-muted-foreground font-mono mb-1">ORDER #CUB-20248</p>
                  <p className="font-semibold">Sony WH-1000XM5 Headphones</p>
                </div>
                <div className="text-right">
                  <p className="text-neon-fire font-bold text-xl">₹14,500</p>
                  <p className="text-xs text-muted-foreground">from Priya M.</p>
                </div>
              </div>

              {/* Status badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neon-orange/15 border border-neon-orange/30">
                <span className="w-2 h-2 rounded-full bg-neon-orange animate-pulse" />
                <span className="text-xs font-semibold text-neon-orange">Out for Delivery</span>
              </div>
            </motion.div>

            {/* Progress track */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-3xl p-6 mb-6 border border-white/5"
            >
              <h2 className="font-bold text-lg mb-6">Delivery Progress</h2>
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-secondary" />
                <motion.div
                  className="absolute left-5 top-5 w-0.5 bg-gradient-fire"
                  initial={{ height: 0 }}
                  animate={{ height: "62%" }}
                  transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
                />

                <div className="space-y-6">
                  {steps.map((step: any, i) => (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="flex items-start gap-4 relative"
                    >
                      {/* Icon circle */}
                      <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${step.done
                          ? "bg-gradient-fire shadow-neon-fire"
                          : step.active
                            ? "bg-gradient-ocean shadow-neon-ocean animate-glow-pulse"
                            : "bg-secondary border border-white/10"
                        }`}>
                        {step.done ? (
                          <CheckCircle className="w-5 h-5 text-white" />
                        ) : (
                          <step.icon className={`w-5 h-5 ${step.active ? "text-white" : "text-muted-foreground"}`} />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-2">
                        <div className="flex items-center justify-between">
                          <p className={`font-semibold text-sm ${step.active ? "text-neon-cyan" : step.done ? "text-foreground" : "text-muted-foreground"}`}>
                            {step.label}
                            {step.active && <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-neon-cyan/15 border border-neon-cyan/30 text-neon-cyan">CURRENT</span>}
                          </p>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {step.time}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Activity log */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass rounded-3xl p-6 border border-white/5"
            >
              <h2 className="font-bold text-lg mb-4">Activity Log</h2>
              <div className="space-y-3">
                {activity.map((item: any, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.08 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-2 h-2 rounded-full bg-neon-orange mt-1.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{item.text}</p>
                      <p className="text-xs text-muted-foreground font-mono">{item.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
