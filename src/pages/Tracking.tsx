import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package, Truck, Home, CheckCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export default function Tracking() {
  const [order, setOrder] = useState<any>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    // Read from local storage
    const savedOrder = localStorage.getItem("active_order");
    if (savedOrder) {
      setOrder(JSON.parse(savedOrder));
    }

    // Force re-render every minute to update estimated times and status
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Calculate simulated status based on time elapsed since placed At
  const getSimulatedStatus = () => {
    if (!order) return { step: 0, timeRemaining: 0 };

    const placedTime = new Date(order.placedAt).getTime();
    const elapsedMinutes = (now - placedTime) / (1000 * 60);

    // Simulation Rules:
    // 0-1 mins: Order Placed
    // 1-3 mins: Seller Accepted (Packing)
    // 3-10 mins: Out for Delivery
    // > 10 mins: Delivered

    let currentStep = 0;
    let timeRemaining = 45; // default 45 mins

    if (elapsedMinutes >= 10) {
      currentStep = 3; // Delivered
      timeRemaining = 0;
    } else if (elapsedMinutes >= 3) {
      currentStep = 2; // Out for Delivery
      timeRemaining = Math.max(1, 10 - Math.floor(elapsedMinutes));
    } else if (elapsedMinutes >= 1) {
      currentStep = 1; // Accepted
      timeRemaining = Math.max(1, 15 - Math.floor(elapsedMinutes));
    } else {
      currentStep = 0; // Placed
      timeRemaining = 45; // Initial estimate
    }

    return { currentStep, timeRemaining, elapsedMinutes };
  };

  const { currentStep, timeRemaining, elapsedMinutes } = getSimulatedStatus();

  // Dynamic Content Generation based on current step
  const getSteps = () => {
    if (!order) return [];
    const placedDate = new Date(order.placedAt);

    // Helper to format time relative to placedAt
    const timeAtOffset = (mins: number) => {
      if (elapsedMinutes < mins) return "Pending";
      const t = new Date(placedDate.getTime() + mins * 60000);
      return t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    return [
      {
        id: 1,
        label: "Order Placed",
        desc: "We have received your order.",
        time: timeAtOffset(0),
        icon: Package,
        done: currentStep >= 0,
        active: currentStep === 0,
      },
      {
        id: 2,
        label: "Seller Accepted",
        desc: `${order.product.seller_name} is preparing your item.`,
        time: timeAtOffset(1),
        icon: CheckCircle,
        done: currentStep > 1,
        active: currentStep === 1,
      },
      {
        id: 3,
        label: "Out for Delivery",
        desc: "Item is on its way to your location.",
        time: timeAtOffset(3),
        icon: Truck,
        done: currentStep > 2,
        active: currentStep === 2,
      },
      {
        id: 4,
        label: "Delivered",
        desc: `Delivered to ${order.shipping.location}.`,
        time: timeAtOffset(10),
        icon: Home,
        done: currentStep === 3,
        active: false,
      },
    ];
  };

  const steps = getSteps();

  const getActivity = () => {
    if (!order) return [];

    const logs = [];
    const placedDate = new Date(order.placedAt);
    const timeAtOffset = (mins: number) => {
      const t = new Date(placedDate.getTime() + mins * 60000);
      return t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    if (currentStep >= 3) logs.unshift({ text: "Delivery successful. Enjoy your purchase!", time: timeAtOffset(10) });
    if (currentStep >= 2) logs.unshift({ text: "Student is on the way to your hostel.", time: timeAtOffset(3) });
    if (currentStep >= 1) logs.unshift({ text: `${order.product.seller_name} packed your item securely.`, time: timeAtOffset(1) });
    if (currentStep >= 0) logs.unshift({ text: "Order placed successfully. Waiting for seller confirmation.", time: timeAtOffset(0) });

    return logs;
  };

  const activity = getActivity();

  // Progress Bar Height Calculation
  const progressHeight = currentStep === 0 ? "10%" : currentStep === 1 ? "40%" : currentStep === 2 ? "70%" : "100%";
  const currentStatusLabel = steps[currentStep]?.label || "Processing...";

  const handleClearOrder = () => {
    localStorage.removeItem("active_order");
    setOrder(null);
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm font-mono mb-1">DELIVERY TRACKING</p>
            <h1 className="text-3xl font-bold">
              Track Your <span className="text-neon-cyan">Order</span>
            </h1>
          </div>
          {order && (
            <button onClick={handleClearOrder} className="text-xs text-muted-foreground hover:text-white transition-colors underline">
              Clear Demo Order
            </button>
          )}
        </motion.div>

        {!order ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-3xl p-12 text-center border border-white/5 flex flex-col items-center justify-center min-h-[400px]"
          >
            <Package className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
            <h2 className="text-xl font-bold mb-2">No active orders</h2>
            <p className="text-muted-foreground max-w-sm mb-6">
              Your tracking information will appear here once you place an order.
            </p>
            <Link to="/home" className="premium-glass-button px-6 py-3 font-bold text-white rounded-xl">
              Browse Marketplace
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Top Estimate Banner */}
            {currentStep < 3 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="w-full bg-gradient-to-r from-neon-blue/20 to-neon-cyan/20 border border-neon-cyan/30 rounded-2xl p-4 mb-6 flex justify-between items-center shadow-[0_0_20px_rgba(0,255,255,0.1)]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-neon-cyan/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-neon-cyan animate-pulse" />
                  </div>
                  <div>
                    <p className="text-xs text-neon-cyan font-bold uppercase tracking-wider">Estimated Delivery</p>
                    <p className="text-white font-black text-xl">{timeRemaining} Minutes</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Order card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-3xl p-6 mb-6 border border-white/5"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-black/40 overflow-hidden border border-white/10">
                    <img src={order.product.image_url || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=100'} alt="product" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-mono mb-1">ORDER #{order.id}</p>
                    <p className="font-semibold line-clamp-1">{order.product.title}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-neon-fire font-bold text-xl">₹{order.pricing.total.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">COD via {order.product.seller_name}</p>
                </div>
              </div>

              {/* Status badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neon-orange/15 border border-neon-orange/30">
                {currentStep < 3 && <span className="w-2 h-2 rounded-full bg-neon-orange animate-pulse" />}
                <span className="text-xs font-semibold text-neon-orange">{currentStatusLabel}</span>
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
                {/* Vertical line background */}
                <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-secondary" />
                {/* Vertical line active progress */}
                <motion.div
                  className="absolute left-5 top-5 w-0.5 bg-gradient-fire shadow-[0_0_10px_rgba(255,100,0,0.8)]"
                  initial={{ height: 0 }}
                  animate={{ height: progressHeight }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
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
                          <p className={`font-semibold text-sm transition-colors duration-300 ${step.active ? "text-neon-cyan" : step.done ? "text-foreground" : "text-muted-foreground"}`}>
                            {step.label}
                            {step.active && <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-neon-cyan/20 border border-neon-cyan/40 text-neon-cyan font-bold tracking-widest uppercase">Now</span>}
                          </p>
                          <span className={`text-xs flex items-center gap-1 font-mono ${step.done || step.active ? 'text-white/70' : 'text-muted-foreground/30'}`}>
                            <Clock className="w-3 h-3" /> {step.time}
                          </span>
                        </div>
                        <p className={`text-xs mt-0.5 transition-colors duration-300 ${step.done || step.active ? 'text-muted-foreground' : 'text-muted-foreground/40'}`}>
                          {step.desc}
                        </p>
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
              <div className="space-y-4">
                {activity.map((item: any, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.08 }}
                    className="flex items-start gap-4"
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-neon-orange mt-1 flex-shrink-0 shadow-[0_0_8px_rgba(255,100,0,0.8)]" />
                    <div className="flex-1 border-b border-white/5 pb-3">
                      <p className="text-sm text-foreground/90 leading-relaxed">{item.text}</p>
                      <p className="text-xs text-neon-cyan font-mono mt-1 opacity-80">{item.time}</p>
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
