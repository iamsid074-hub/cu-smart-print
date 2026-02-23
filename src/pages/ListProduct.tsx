import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Tag, DollarSign, MapPin, CheckCircle, ChevronRight, Image as ImageIcon, Package, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const steps = [
  { id: 1, label: "Details", icon: Tag },
  { id: 2, label: "Photos", icon: ImageIcon },
  { id: 3, label: "Pricing", icon: DollarSign },
  { id: 4, label: "Location", icon: MapPin },
  { id: 5, label: "Done", icon: CheckCircle },
];

const categories = ["Electronics", "Books", "Fashion", "Sports", "Furniture", "Kitchen", "Other"];
const conditions = ["New", "Like New", "Good", "Fair"];

export default function ListProduct() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "", category: "", condition: "", description: "",
    price: "", originalPrice: "", negotiable: false,
    location: "", meetup: "",
  });
  const [dragOver, setDragOver] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNext = async () => {
    if (step === 4) {
      if (!user) {
        toast.error("You must be logged in to publish an item.");
        return;
      }

      if (!formData.title || !formData.category || !formData.condition || !formData.price || !formData.location) {
        toast.error("Please fill in all required fields.");
        return;
      }

      setLoading(true);
      try {
        let imageUrl = null;
        if (imageFile) {
          const fileExt = imageFile.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const { error: uploadError } = await supabase.storage.from("product-images").upload(fileName, imageFile);
          if (uploadError) throw uploadError;
          const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
          imageUrl = data.publicUrl;
        }

        const { error } = await supabase.from("products").insert({
          seller_id: user.id,
          title: formData.title,
          category: formData.category,
          condition: formData.condition,
          reason_for_selling: formData.description,
          price: Number(formData.price),
          original_price: formData.originalPrice ? Number(formData.originalPrice) : null,
          image_url: imageUrl,
          status: "available",
          is_trending: false,
        });

        if (error) throw error;
        setStep(5);
        toast.success("Item published successfully!");
      } catch (err: any) {
        console.error("Failed to publish:", err);
        toast.error(err.message || "Failed to publish item.");
      } finally {
        setLoading(false);
      }
    } else {
      setStep((s) => Math.min(s + 1, 5));
    }
  };

  const back = () => setStep((s) => Math.max(s - 1, 1));
  const progress = ((step - 1) / (steps.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-background pt-20 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-muted-foreground text-sm font-mono mb-1">LIST YOUR ITEM</p>
          <h1 className="text-3xl font-bold">
            <span className="text-neon-fire">Sell</span> Something
          </h1>
        </motion.div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 cursor-pointer ${step > s.id ? "bg-gradient-fire text-white shadow-neon-fire"
                    : step === s.id ? "bg-gradient-fire text-white shadow-neon-fire animate-glow-pulse"
                      : "glass text-muted-foreground border border-white/10"
                    }`}
                  onClick={() => s.id < step && setStep(s.id)}
                >
                  {step > s.id ? <CheckCircle className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                </motion.div>
                {i < steps.length - 1 && (
                  <div className="hidden sm:block w-12 h-0.5 bg-secondary overflow-hidden rounded-full">
                    <motion.div
                      className="h-full bg-gradient-fire rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: step > s.id ? "100%" : "0%" }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="h-1 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-fire rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2 font-mono">Step {step} of {steps.length} · {steps[step - 1].label}</p>
        </div>

        {/* Form card */}
        <div className="glass rounded-3xl p-6 sm:p-8 border border-white/5">
          <AnimatePresence mode="wait">
            {/* Step 1: Details */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <h2 className="font-bold text-xl mb-6">Item Details</h2>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Title *</label>
                  <input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. MacBook Air M2 – 8GB/256GB"
                    className="w-full glass rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none border border-white/10 focus:border-neon-orange/50 transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Category *</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setFormData({ ...formData, category: cat })}
                        className={`px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${formData.category === cat
                          ? "bg-gradient-fire text-white shadow-neon-fire"
                          : "glass border border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20"
                          }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Condition *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {conditions.map((cond) => (
                      <button
                        key={cond}
                        onClick={() => setFormData({ ...formData, condition: cond })}
                        className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${formData.condition === cond
                          ? "bg-gradient-ocean text-white shadow-neon-ocean"
                          : "glass border border-white/10 text-muted-foreground hover:border-white/20"
                          }`}
                      >
                        {cond}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your item — condition, specs, any defects..."
                    className="w-full glass rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none border border-white/10 focus:border-neon-orange/50 transition-all resize-none"
                  />
                </div>
              </motion.div>
            )}

            {/* Step 2: Photos */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                <h2 className="font-bold text-xl mb-6">Add Photos</h2>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      setImageFile(e.dataTransfer.files[0]);
                    }
                  }}
                  className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${dragOver ? "border-neon-orange/60 bg-neon-orange/5" : "border-white/15 hover:border-white/25"
                    }`}
                >
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  {imageFile ? (
                    <div className="mb-4">
                      <p className="font-semibold text-neon-cyan">{imageFile.name}</p>
                      <button onClick={() => setImageFile(null)} className="text-xs text-neon-fire mt-2">Remove</button>
                    </div>
                  ) : (
                    <>
                      <p className="font-semibold text-foreground mb-2">Drop photos here</p>
                      <p className="text-sm text-muted-foreground mb-4">or click to browse · Max 8 photos</p>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={(e) => { if (e.target.files && e.target.files[0]) setImageFile(e.target.files[0]) }}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="premium-glass-button px-6 py-2.5 text-white text-sm font-semibold shadow-neon-fire"
                  >
                    {imageFile ? "Change File" : "Choose Files"}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-4 text-center">
                  💡 Good photos = 3× more views. Use natural light!
                </p>
              </motion.div>
            )}

            {/* Step 3: Pricing */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }} className="space-y-5">
                <h2 className="font-bold text-xl mb-6">Set Your Price</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Your Price (₹) *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neon-orange font-bold">₹</span>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="0"
                        className="w-full glass rounded-xl pl-8 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none border border-white/10 focus:border-neon-orange/50 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Original Price (₹)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                      <input
                        type="number"
                        value={formData.originalPrice}
                        onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                        placeholder="0"
                        className="w-full glass rounded-xl pl-8 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none border border-white/10 focus:border-neon-orange/50 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Discount preview */}
                {formData.price && formData.originalPrice && Number(formData.originalPrice) > Number(formData.price) && (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass rounded-xl p-4 border-neon-fire">
                    <p className="text-sm text-muted-foreground">Discount preview:</p>
                    <p className="text-2xl font-bold text-neon-fire">
                      {Math.round((1 - Number(formData.price) / Number(formData.originalPrice)) * 100)}% OFF
                    </p>
                    <p className="text-xs text-muted-foreground">Buyers save ₹{(Number(formData.originalPrice) - Number(formData.price)).toLocaleString()}</p>
                  </motion.div>
                )}

                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setFormData({ ...formData, negotiable: !formData.negotiable })}
                    className={`w-12 h-6 rounded-full transition-all duration-300 ${formData.negotiable ? "bg-gradient-fire" : "bg-secondary"}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white shadow transition-all duration-300 mt-0.5 ${formData.negotiable ? "ml-6.5" : "ml-0.5"}`} style={{ marginLeft: formData.negotiable ? "calc(100% - 1.375rem)" : "2px" }} />
                  </div>
                  <span className="text-sm font-medium text-foreground">Price is negotiable</span>
                </label>
              </motion.div>
            )}

            {/* Step 4: Location */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }} className="space-y-5">
                <h2 className="font-bold text-xl mb-6">Pickup Location</h2>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Campus Location *</label>
                  <input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Hostel Block C, Room 214"
                    className="w-full glass rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none border border-white/10 focus:border-neon-orange/50 transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Preferred Meetup Spot</label>
                  {["Main Gate", "Library", "Canteen", "C-Block Lobby", "Sports Complex"].map((spot) => (
                    <button
                      key={spot}
                      onClick={() => setFormData({ ...formData, meetup: spot })}
                      className={`mr-2 mb-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${formData.meetup === spot
                        ? "bg-gradient-ocean text-white shadow-neon-ocean"
                        : "glass border border-white/10 text-muted-foreground hover:border-white/20"
                        }`}
                    >
                      📍 {spot}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 5: Done */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ease: [0.34, 1.56, 0.64, 1] }}
                className="text-center py-8"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1.1, 1] }}
                  transition={{ duration: 0.6 }}
                  className="text-6xl mb-6"
                >
                  🎉
                </motion.div>
                <h2 className="font-bold text-2xl mb-3 text-neon-fire">Listing Live!</h2>
                <p className="text-muted-foreground mb-6">Your item is now visible to students on campus.</p>
                <div className="glass rounded-2xl p-4 mb-6 text-left">
                  <div className="flex items-center gap-3">
                    <Package className="w-8 h-8 text-neon-cyan" />
                    <div>
                      <p className="font-semibold">{formData.title || "Your Item"}</p>
                      <p className="text-neon-fire font-bold">₹{formData.price || "0"}</p>
                    </div>
                  </div>
                </div>
                <button onClick={() => window.location.href = '/profile'} className="premium-glass-button px-6 py-3 text-white font-bold shadow-neon-fire w-full">
                  Keep Selling
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          {step < 5 && (
            <div className="flex justify-between mt-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={back}
                disabled={step === 1}
                className="px-5 py-2.5 rounded-xl glass border border-white/10 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all"
              >
                Back
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                disabled={loading}
                className="premium-glass-button flex items-center gap-2 px-6 py-2.5 text-white text-sm font-bold shadow-neon-fire disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : step === 4 ? "Publish" : "Continue"} {!loading && <ChevronRight className="w-4 h-4" />}
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
