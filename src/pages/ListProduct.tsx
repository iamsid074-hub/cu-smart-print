import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Tag, DollarSign, MapPin, CheckCircle, ChevronRight, Image as ImageIcon, Package, Loader2, Phone, AlertCircle } from "lucide-react";
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
  const { user, profile } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "", category: "", condition: "", description: "",
    price: "", originalPrice: "", negotiable: false,
    location: "", meetup: "",
    sellerPhone: "", sellerHostel: "", sellerRoom: "",
  });
  const [dragOver, setDragOver] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-fill seller details from profile
  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        sellerPhone: prev.sellerPhone || profile.phone_number || "",
        sellerHostel: prev.sellerHostel || profile.hostel_block || "",
      }));
    }
  }, [profile]);

  const handleNext = async () => {
    if (step === 4) {
      if (!user) {
        toast.error("You must be logged in to publish an item.");
        return;
      }

      if (!formData.title || !formData.category || !formData.condition || !formData.price) {
        toast.error("Please fill in all required fields.");
        return;
      }

      if (Number(formData.price) < 1) {
        toast.error("Price must be at least ₹1.");
        return;
      }

      // Validate seller info
      const newErrors: Record<string, string> = {};
      if (!formData.sellerPhone.trim() || formData.sellerPhone.replace(/\D/g, "").length < 10) {
        newErrors.sellerPhone = "Valid phone number is required (10+ digits)";
      }
      if (!formData.sellerHostel.trim()) {
        newErrors.sellerHostel = "Hostel / Block is required";
      }
      if (!formData.sellerRoom.trim()) {
        newErrors.sellerRoom = "Room number is required";
      }
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        toast.error("Please fill all required seller details");
        return;
      }
      setErrors({});

      setLoading(true);
      try {
        let imageUrl = null;
        if (imageFile) {
          // Compress image before uploading
          let compressedBlob: Blob;
          try {
            compressedBlob = await compressImage(imageFile, 1200, 0.82);
          } catch (compressErr: any) {
            console.error("[ListProduct] Image compress error:", compressErr);
            alert("Image compression failed: " + (compressErr?.message || "Unknown error"));
            setLoading(false);
            return;
          }
          const fileExt = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
          const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
          const { error: uploadError } = await supabase.storage.from("product-images").upload(fileName, compressedBlob, { contentType: imageFile.type });
          if (uploadError) {
            console.error("[ListProduct] Image upload error:", uploadError);
            alert("Image upload failed: " + uploadError.message);
            setLoading(false);
            return;
          }
          const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
          imageUrl = data.publicUrl;
        }

        // Ensure profile exists FIRST (products.seller_id references profiles.id)
        const profileUpdate = {
          id: user.id,
          phone_number: formData.sellerPhone,
          hostel_block: formData.sellerHostel.trim()
            ? `${formData.sellerHostel.trim()}, Room ${formData.sellerRoom.trim()}`
            : null,
        };
        const { error: profileError } = await supabase.from("profiles").upsert(profileUpdate, { onConflict: "id" });
        if (profileError) {
          console.error("[ListProduct] Profile upsert error:", profileError);
          alert("Profile save failed: " + profileError.message);
          setLoading(false);
          return;
        }

        const { data: insertedData, error } = await supabase.from("products").insert({
          seller_id: user.id,
          title: formData.title,
          category: formData.category,
          condition: formData.condition,
          reason_for_selling: formData.description.trim() || "Not specified",
          price: Number(formData.price),
          original_price: formData.originalPrice ? Number(formData.originalPrice) : null,
          image_url: imageUrl,
          status: "available",
          is_trending: false,
        }).select();

        if (error) {
          console.error("[ListProduct] Insert error:", error);
          alert("Product insert failed: " + (error.message || JSON.stringify(error)));
          setLoading(false);
          return;
        }

        if (!insertedData || insertedData.length === 0) {
          console.error("[ListProduct] Insert returned no data — likely blocked by RLS policy");
          alert("Permission denied — RLS blocked. Your account may not have permission to list items.");
          setLoading(false);
          return;
        }

        setStep(5);
        toast.success("Item published successfully!");
      } catch (err: any) {
        console.error("[ListProduct] Unexpected error:", err);
        alert("Publish failed: " + (err?.message || JSON.stringify(err)));
      } finally {
        setLoading(false);
      }
    } else {
      setStep((s) => Math.min(s + 1, 5));
    }
  };

  const back = () => setStep((s) => Math.max(s - 1, 1));
  const progress = ((step - 1) / (steps.length - 1)) * 100;

  // ── Helpers ────────────────────────────────────────────────────────────────
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const MAX_SIZE_MB = 5;

  function handleImageSelect(file: File) {
    setImageError(null);
    if (!ALLOWED_TYPES.includes(file.type)) {
      setImageError('Only JPG, PNG, WEBP, or GIF images are allowed.');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setImageError(`Image must be under ${MAX_SIZE_MB}MB. Yours is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`);
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
    setImageError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function compressImage(file: File, maxDim: number, quality: number): Promise<Blob> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) { height = Math.round((height / width) * maxDim); width = maxDim; }
          else { width = Math.round((width / height) * maxDim); height = maxDim; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => resolve(blob || file), file.type === 'image/png' ? 'image/png' : 'image/jpeg', quality);
      };
      img.src = URL.createObjectURL(file);
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-32 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header removed for Dynamic Island */}

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 cursor-pointer ${step > s.id ? "bg-brand text-white shadow-[0_4px_16px_rgba(35,25,66,0.3)]"
                    : step === s.id ? "bg-brand text-white shadow-[0_4px_16px_rgba(35,25,66,0.3)] scale-110"
                      : "bg-slate-100 text-slate-400 border border-slate-200"
                    }`}
                  onClick={() => s.id < step && setStep(s.id)}
                >
                  {step > s.id ? <CheckCircle className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                </motion.div>
                {i < steps.length - 1 && (
                  <div className="hidden sm:block w-12 h-1 bg-slate-100 overflow-hidden rounded-full">
                    <motion.div
                      className="h-full bg-brand rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: step > s.id ? "100%" : "0%" }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-brand rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-3 font-semibold text-center sm:text-left">Step {step} of {steps.length} · {steps[step - 1].label}</p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-3xl sm:rounded-[2rem] p-6 sm:p-10 border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
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
                <h2 className="font-extrabold text-2xl mb-6 text-slate-900">Item Details</h2>
                <div>
                  <label className="text-sm font-bold text-slate-600 mb-2 block">Title *</label>
                  <input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. MacBook Air M2 – 8GB/256GB"
                    className="w-full bg-slate-50 rounded-2xl px-5 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none border border-slate-200 focus:border-brand-accent focus:ring-4 focus:ring-brand-50 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-600 mb-2 block">Category *</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setFormData({ ...formData, category: cat })}
                        className={`px-3 py-2.5 rounded-2xl text-[13px] font-bold transition-all duration-200 ${formData.category === cat
                          ? "bg-brand text-white shadow-md border border-brand"
                          : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-600 mb-2 block">Condition *</label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {conditions.map((cond) => (
                      <button
                        key={cond}
                        onClick={() => setFormData({ ...formData, condition: cond })}
                        className={`px-4 py-3 rounded-2xl text-[13px] font-bold transition-all ${formData.condition === cond
                          ? "bg-emerald-500 text-white shadow-md border border-emerald-500"
                          : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                      >
                        {cond}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-600 mb-2 block">Description</label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your item — condition, specs, any defects..."
                    className="w-full bg-slate-50 rounded-2xl px-5 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none border border-slate-200 focus:border-brand-accent focus:ring-4 focus:ring-brand-50 transition-all font-medium resize-none"
                  />
                </div>
              </motion.div>
            )}

            {/* Step 2: Photos */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
                <h2 className="font-extrabold text-2xl mb-2 text-slate-900">Add a Photo</h2>
                <p className="text-sm text-slate-500 mb-6">Pick the correct image for <span className="text-brand font-bold">{formData.title || 'your item'}</span></p>

                {/* Live preview */}
                {imagePreview && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-6 relative rounded-3xl overflow-hidden border border-slate-200 shadow-sm" style={{ height: 240 }}>
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                      <span className="text-sm font-medium text-white truncate max-w-[70%]">{imageFile?.name}</span>
                      <button
                        onClick={removeImage}
                        className="text-xs font-bold text-rose-100 bg-rose-500/80 hover:bg-rose-500 px-3 py-1.5 rounded-full backdrop-blur-md transition-colors shadow-sm"
                      >
                        ✕ Remove
                      </button>
                    </div>
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/90 backdrop-blur-md text-white shadow-sm">
                      ✓ Preview
                    </div>
                  </motion.div>
                )}

                {/* Error message */}
                {imageError && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-5 flex items-start gap-2 bg-rose-50 rounded-2xl p-4 border border-rose-100">
                    <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                    <p className="text-sm text-rose-600 font-medium">{imageError}</p>
                  </motion.div>
                )}

                {/* Drop zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleImageSelect(e.dataTransfer.files[0]);
                    }
                  }}
                  className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-300 cursor-pointer ${dragOver ? 'border-brand-light bg-brand-50' : imagePreview ? 'border-transparent hidden' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className={`w-12 h-12 mx-auto mb-4 transition-colors ${dragOver ? 'text-brand-accent' : 'text-slate-400'}`} />
                  <p className="font-bold text-slate-700 mb-1.5 text-lg">Drop photo here to upload</p>
                  <p className="text-sm text-slate-500">JPG · PNG · WEBP &nbsp;·&nbsp; Max 5 MB</p>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={(e) => { if (e.target.files && e.target.files[0]) handleImageSelect(e.target.files[0]); }}
                  />
                </div>

                <p className="text-xs text-slate-500 mt-3 text-center">
                  💡 Check the preview above to confirm it's the correct photo before continuing.
                </p>
              </motion.div>
            )}

            {/* Step 3: Pricing */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }} className="space-y-6">
                <h2 className="font-extrabold text-2xl mb-6 text-slate-900">Set Your Price</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-bold text-slate-600 mb-2 block">Your Price (₹) *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand font-extrabold text-lg">₹</span>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="0"
                        className="w-full bg-slate-50 rounded-2xl pl-10 pr-5 py-4 text-base font-bold text-slate-900 placeholder:text-slate-400 outline-none border border-slate-200 focus:border-brand-accent focus:ring-4 focus:ring-brand-50 transition-all"
                        min="1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-600 mb-2 block">Original Price (₹)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">₹</span>
                      <input
                        type="number"
                        value={formData.originalPrice}
                        onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                        placeholder="0"
                        className="w-full bg-slate-50 rounded-2xl pl-10 pr-5 py-4 text-base font-bold text-slate-900 placeholder:text-slate-400 outline-none border border-slate-200 focus:border-brand-accent focus:ring-4 focus:ring-brand-50 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Discount preview */}
                {formData.price && formData.originalPrice && Number(formData.originalPrice) > Number(formData.price) && (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
                    <p className="text-sm font-bold text-emerald-800">Discount preview:</p>
                    <p className="text-3xl font-black text-emerald-600 mt-1 mb-1">
                      {Math.round((1 - Number(formData.price) / Number(formData.originalPrice)) * 100)}% OFF
                    </p>
                    <p className="text-sm font-medium text-emerald-700">Buyers save ₹{(Number(formData.originalPrice) - Number(formData.price)).toLocaleString()}</p>
                  </motion.div>
                )}

                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setFormData({ ...formData, negotiable: !formData.negotiable })}
                    className={`w-12 h-6 rounded-full transition-all duration-300 ${formData.negotiable ? "bg-gradient-fire" : "bg-secondary"}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white shadow transition-all duration-300 mt-0.5 ${formData.negotiable ? "ml-6.5" : "ml-0.5"}`} style={{ marginLeft: formData.negotiable ? "calc(100% - 1.375rem)" : "2px" }} />
                  </div>
                  <span className="text-sm font-medium text-slate-900">Price is negotiable</span>
                </label>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }} className="space-y-5">
                <h2 className="font-bold text-xl mb-6">Your Details & Pickup</h2>

                {/* Seller Phone */}
                <div>
                  <label className="text-sm font-bold text-slate-600 mb-2 block">Your Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      value={formData.sellerPhone}
                      onChange={(e) => { setFormData({ ...formData, sellerPhone: e.target.value }); setErrors(prev => ({ ...prev, sellerPhone: "" })); }}
                      placeholder="e.g. 9876543210"
                      type="tel"
                      className={`w-full bg-slate-50 rounded-2xl pl-11 pr-5 py-4 text-base font-bold text-slate-900 placeholder:text-slate-400 outline-none border transition-all ${errors.sellerPhone ? "border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-50" : "border-slate-200 focus:border-brand-accent focus:ring-4 focus:ring-brand-50"}`}
                    />
                  </div>
                  {errors.sellerPhone && <p className="text-xs text-rose-500 mt-2 font-bold flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.sellerPhone}</p>}
                </div>

                {/* Seller Hostel */}
                <div>
                  <label className="text-sm font-bold text-slate-600 mb-2 block">Your Hostel / Block *</label>
                  <input
                    value={formData.sellerHostel}
                    onChange={(e) => { setFormData({ ...formData, sellerHostel: e.target.value }); setErrors(prev => ({ ...prev, sellerHostel: "" })); }}
                    placeholder="e.g. Zakir Hussain Block A"
                    className={`w-full bg-slate-50 rounded-2xl px-5 py-4 text-base font-bold text-slate-900 placeholder:text-slate-400 outline-none border transition-all ${errors.sellerHostel ? "border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-50" : "border-slate-200 focus:border-brand-accent focus:ring-4 focus:ring-brand-50"}`}
                  />
                  {errors.sellerHostel && <p className="text-xs text-rose-500 mt-2 font-bold flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.sellerHostel}</p>}
                </div>

                {/* Seller Room */}
                <div>
                  <label className="text-sm font-bold text-slate-600 mb-2 block">Your Room Number *</label>
                  <input
                    value={formData.sellerRoom}
                    onChange={(e) => { setFormData({ ...formData, sellerRoom: e.target.value }); setErrors(prev => ({ ...prev, sellerRoom: "" })); }}
                    placeholder="e.g. 402"
                    className={`w-full bg-slate-50 rounded-2xl px-5 py-4 text-base font-bold text-slate-900 placeholder:text-slate-400 outline-none border transition-all ${errors.sellerRoom ? "border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-50" : "border-slate-200 focus:border-brand-accent focus:ring-4 focus:ring-brand-50"}`}
                  />
                  {errors.sellerRoom && <p className="text-xs text-rose-500 mt-2 font-bold flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.sellerRoom}</p>}
                </div>



                {/* Validation hint */}
                {(!formData.sellerPhone || !formData.sellerHostel || !formData.sellerRoom) && (
                  <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
                    <p className="text-sm font-bold text-amber-600 flex items-center gap-1.5"><AlertCircle className="w-4 h-4" /> All seller details are required to publish</p>
                  </div>
                )}
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
                <h2 className="font-black text-3xl mb-3 text-slate-900">Listing Live!</h2>
                <p className="text-slate-500 font-medium mb-6">Your item is now visible to students on campus.</p>
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 mb-8 text-left shadow-sm inline-block">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center border border-emerald-200">
                      <Package className="w-7 h-7 text-emerald-600" />
                    </div>
                    <div className="pr-4">
                      <p className="font-bold text-slate-900 text-lg line-clamp-1">{formData.title || "Your Item"}</p>
                      <p className="text-emerald-600 font-black text-xl">₹{formData.price || "0"}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <button onClick={() => window.location.href = '/profile'} className="px-8 py-4 bg-brand hover:bg-brand text-white font-bold rounded-full shadow-md transition-all">
                    Keep Selling
                  </button>
                </div>
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
                className="px-6 py-3.5 rounded-3xl bg-slate-100 border border-slate-200 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 disabled:opacity-30 transition-all"
              >
                Back
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                disabled={loading || (step === 4 && (!formData.sellerPhone.trim() || !formData.sellerHostel.trim() || !formData.sellerRoom.trim()))}
                className="px-8 py-3.5 rounded-full bg-brand hover:bg-brand text-white text-sm font-bold shadow-[0_4px_16px_rgba(35,25,66,0.3)] disabled:opacity-50 flex items-center gap-2 transition-all"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : step === 4 ? "Publish" : "Continue"} {!loading && <ChevronRight className="w-4 h-4 ml-1" />}
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
