import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Tag,
  DollarSign,
  MapPin,
  CheckCircle,
  ChevronRight,
  Image as ImageIcon,
  Package,
  Loader2,
  Phone,
  AlertCircle,
  X,
} from "lucide-react";
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

const categories = [
  "Electronics",
  "Books",
  "Fashion",
  "Sports",
  "Furniture",
  "Kitchen",
  "Other",
];
const conditions = ["New", "Like New", "Good", "Fair"];

interface SellModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SellModal({ isOpen, onClose }: SellModalProps) {
  const { user, profile } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    condition: "",
    description: "",
    price: "",
    originalPrice: "",
    negotiable: false,
    location: "",
    meetup: "",
    sellerPhone: "",
    sellerHostel: "",
    sellerRoom: "",
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
      setFormData((prev) => ({
        ...prev,
        sellerPhone: prev.sellerPhone || profile.phone_number || "",
        sellerHostel: prev.sellerHostel || profile.hostel_block || "",
      }));
    }
  }, [profile]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setFormData({
        title: "",
        category: "",
        condition: "",
        description: "",
        price: "",
        originalPrice: "",
        negotiable: false,
        location: "",
        meetup: "",
        sellerPhone: profile?.phone_number || "",
        sellerHostel: profile?.hostel_block || "",
        sellerRoom: "",
      });
      setImageFile(null);
      setImagePreview(null);
      setImageError(null);
      setErrors({});
    }
  }, [isOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleNext = async () => {
    if (step === 4) {
      if (!user) {
        toast.error("You must be logged in to publish an item.");
        return;
      }
      if (
        !formData.title ||
        !formData.category ||
        !formData.condition ||
        !formData.price
      ) {
        toast.error("Please fill in all required fields.");
        return;
      }
      if (Number(formData.price) < 1) {
        toast.error("Price must be at least â‚¹1.");
        return;
      }

      const newErrors: Record<string, string> = {};
      if (
        !formData.sellerPhone.trim() ||
        formData.sellerPhone.replace(/\D/g, "").length < 10
      )
        newErrors.sellerPhone = "Valid phone number is required (10+ digits)";
      if (!formData.sellerHostel.trim())
        newErrors.sellerHostel = "Hostel / Block is required";
      if (!formData.sellerRoom.trim())
        newErrors.sellerRoom = "Room number is required";
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
          const compressedBlob = await compressImage(imageFile, 1200, 0.82);
          const fileExt =
            imageFile.name.split(".").pop()?.toLowerCase() || "jpg";
          const fileName = `${Date.now()}_${Math.random()
            .toString(36)
            .slice(2)}.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from("product-images")
            .upload(fileName, compressedBlob, { contentType: imageFile.type });
          if (uploadError) throw uploadError;
          const { data } = supabase.storage
            .from("product-images")
            .getPublicUrl(fileName);
          imageUrl = data.publicUrl;
        }

        const { error } = await supabase.from("products").insert({
          seller_id: user.id,
          title: formData.title,
          category: formData.category,
          condition: formData.condition,
          reason_for_selling: formData.description.trim() || "Not specified",
          price: Number(formData.price),
          original_price: formData.originalPrice
            ? Number(formData.originalPrice)
            : null,
          image_url: imageUrl,
          status: "available",
          is_trending: false,
        });
        if (error) throw error;

        const profileUpdate = {
          id: user.id,
          phone_number: formData.sellerPhone,
          hostel_block: formData.sellerHostel.trim()
            ? `${formData.sellerHostel.trim()}, Room ${formData.sellerRoom.trim()}`
            : null,
        };
        await supabase
          .from("profiles")
          .upsert(profileUpdate, { onConflict: "id" });

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

  // â”€â”€ Image helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const MAX_SIZE_MB = 5;

  function handleImageSelect(file: File) {
    setImageError(null);
    if (!ALLOWED_TYPES.includes(file.type)) {
      setImageError("Only JPG, PNG, WEBP, or GIF images are allowed.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setImageError(
        `Image must be under ${MAX_SIZE_MB}MB. Yours is ${(
          file.size /
          (1024 * 1024)
        ).toFixed(1)}MB.`
      );
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
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function compressImage(
    file: File,
    maxDim: number,
    quality: number
  ): Promise<Blob> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height / width) * maxDim);
            width = maxDim;
          } else {
            width = Math.round((width / height) * maxDim);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => resolve(blob || file),
          file.type === "image/png" ? "image/png" : "image/jpeg",
          quality
        );
      };
      img.src = URL.createObjectURL(file);
    });
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* â”€â”€ Backdrop â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <motion.div
            key="sell-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={step < 5 ? onClose : undefined}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 200,
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
            }}
          />

          {/* â”€â”€ Sheet â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <motion.div
            key="sell-sheet"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 340,
              damping: 32,
              mass: 1.1,
            }}
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 201,
              maxHeight: "92vh",
              borderRadius: "28px 28px 0 0",
              background: "#fff",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
            }}
          >
            {/* Handle bar */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                paddingTop: 12,
                paddingBottom: 4,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 999,
                  background: "#e2e8f0",
                }}
              />
            </div>

            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 20px 14px",
                flexShrink: 0,
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#0f172a",
                    margin: 0,
                  }}
                >
                  ðŸ“¦ Sell / List Item
                </p>
                <p
                  style={{
                    fontSize: 12,
                    color: "#94a3b8",
                    margin: 0,
                    marginTop: 2,
                  }}
                >
                  Step {step} of {steps.length} Â· {steps[step - 1].label}
                </p>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  border: "none",
                  background: "#f1f5f9",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <X style={{ width: 16, height: 16, color: "#64748b" }} />
              </button>
            </div>

            {/* Progress bar */}
            <div style={{ padding: "10px 20px 0", flexShrink: 0 }}>
              {/* Step dots */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                {steps.map((s, i) => (
                  <div
                    key={s.id}
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <div
                      onClick={() => s.id < step && setStep(s.id)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: s.id < step ? "pointer" : "default",
                        background:
                          step > s.id
                            ? "#231942"
                            : step === s.id
                            ? "#231942"
                            : "#f1f5f9",
                        color: step >= s.id ? "#fff" : "#94a3b8",
                        transform: step === s.id ? "scale(1.12)" : "scale(1)",
                        transition: "all 0.2s",
                        boxShadow:
                          step === s.id
                            ? "0 4px 12px rgba(35,25,66,0.3)"
                            : "none",
                      }}
                    >
                      {step > s.id ? (
                        <CheckCircle style={{ width: 13, height: 13 }} />
                      ) : (
                        <s.icon style={{ width: 13, height: 13 }} />
                      )}
                    </div>
                    {i < steps.length - 1 && (
                      <div
                        style={{
                          width: 24,
                          height: 2,
                          borderRadius: 1,
                          overflow: "hidden",
                          background: "#f1f5f9",
                        }}
                      >
                        <motion.div
                          style={{
                            height: "100%",
                            background: "#231942",
                            borderRadius: 1,
                          }}
                          initial={{ width: "0%" }}
                          animate={{ width: step > s.id ? "100%" : "0%" }}
                          transition={{ duration: 0.35 }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {/* Bar */}
              <div
                style={{
                  height: 3,
                  background: "#f1f5f9",
                  borderRadius: 999,
                  overflow: "hidden",
                }}
              >
                <motion.div
                  style={{
                    height: "100%",
                    background: "linear-gradient(90deg, #231942, #5e4b8b)",
                    borderRadius: 999,
                  }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                />
              </div>
            </div>

            {/* Scrollable content */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 0" }}>
              <AnimatePresence mode="wait">
                {/* â”€â”€ Step 1: Details â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.25 }}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    <h2
                      style={{
                        fontSize: 20,
                        fontWeight: 800,
                        color: "#0f172a",
                        margin: 0,
                      }}
                    >
                      Item Details
                    </h2>

                    <div>
                      <label
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#475569",
                          display: "block",
                          marginBottom: 6,
                        }}
                      >
                        Title *
                      </label>
                      <input
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        placeholder="e.g. MacBook Air M2 â€“ 8GB/256GB"
                        style={{
                          width: "100%",
                          background: "#f8fafc",
                          borderRadius: 14,
                          padding: "12px 16px",
                          fontSize: 14,
                          color: "#0f172a",
                          border: "1.5px solid #e2e8f0",
                          outline: "none",
                          fontFamily: "inherit",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#475569",
                          display: "block",
                          marginBottom: 6,
                        }}
                      >
                        Category *
                      </label>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(4, 1fr)",
                          gap: 8,
                        }}
                      >
                        {categories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() =>
                              setFormData({ ...formData, category: cat })
                            }
                            style={{
                              padding: "8px 4px",
                              borderRadius: 12,
                              fontSize: 12,
                              fontWeight: 700,
                              border:
                                formData.category === cat
                                  ? "1.5px solid #231942"
                                  : "1.5px solid #e2e8f0",
                              background:
                                formData.category === cat ? "#231942" : "#fff",
                              color:
                                formData.category === cat ? "#fff" : "#64748b",
                              cursor: "pointer",
                              transition: "all 0.18s",
                            }}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#475569",
                          display: "block",
                          marginBottom: 6,
                        }}
                      >
                        Condition *
                      </label>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(2, 1fr)",
                          gap: 8,
                        }}
                      >
                        {conditions.map((cond) => (
                          <button
                            key={cond}
                            onClick={() =>
                              setFormData({ ...formData, condition: cond })
                            }
                            style={{
                              padding: "10px 8px",
                              borderRadius: 12,
                              fontSize: 13,
                              fontWeight: 700,
                              border:
                                formData.condition === cond
                                  ? "1.5px solid #10b981"
                                  : "1.5px solid #e2e8f0",
                              background:
                                formData.condition === cond
                                  ? "#10b981"
                                  : "#fff",
                              color:
                                formData.condition === cond
                                  ? "#fff"
                                  : "#64748b",
                              cursor: "pointer",
                              transition: "all 0.18s",
                            }}
                          >
                            {cond}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#475569",
                          display: "block",
                          marginBottom: 6,
                        }}
                      >
                        Description
                      </label>
                      <textarea
                        rows={3}
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        placeholder="Describe your item â€” condition, specs, any defects..."
                        style={{
                          width: "100%",
                          background: "#f8fafc",
                          borderRadius: 14,
                          padding: "12px 16px",
                          fontSize: 14,
                          color: "#0f172a",
                          border: "1.5px solid #e2e8f0",
                          outline: "none",
                          fontFamily: "inherit",
                          resize: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </motion.div>
                )}

                {/* â”€â”€ Step 2: Photos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.25 }}
                  >
                    <h2
                      style={{
                        fontSize: 20,
                        fontWeight: 800,
                        color: "#0f172a",
                        margin: "0 0 6px",
                      }}
                    >
                      Add a Photo
                    </h2>
                    <p
                      style={{
                        fontSize: 13,
                        color: "#94a3b8",
                        margin: "0 0 16px",
                      }}
                    >
                      Pick the right photo for{" "}
                      <strong style={{ color: "#231942" }}>
                        {formData.title || "your item"}
                      </strong>
                    </p>

                    {imagePreview && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                          marginBottom: 16,
                          position: "relative",
                          borderRadius: 18,
                          overflow: "hidden",
                          height: 200,
                          border: "1.5px solid #e2e8f0",
                        }}
                      >
                        <img
                          src={imagePreview}
                          alt="Preview"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background:
                              "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)",
                          }}
                        />
                        <button
                          onClick={removeImage}
                          style={{
                            position: "absolute",
                            bottom: 10,
                            right: 10,
                            background: "rgba(239,68,68,0.9)",
                            color: "#fff",
                            border: "none",
                            borderRadius: 20,
                            padding: "5px 12px",
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          âœ• Remove
                        </button>
                        <div
                          style={{
                            position: "absolute",
                            top: 10,
                            left: 10,
                            background: "rgba(16,185,129,0.9)",
                            color: "#fff",
                            borderRadius: 20,
                            padding: "4px 10px",
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          âœ“ Preview
                        </div>
                      </motion.div>
                    )}

                    {imageError && (
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          background: "#fff1f2",
                          borderRadius: 12,
                          padding: 12,
                          marginBottom: 12,
                          border: "1px solid #fecdd3",
                        }}
                      >
                        <AlertCircle
                          style={{
                            width: 16,
                            height: 16,
                            color: "#ef4444",
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontSize: 13,
                            color: "#dc2626",
                            fontWeight: 500,
                          }}
                        >
                          {imageError}
                        </span>
                      </div>
                    )}

                    {!imagePreview && (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragOver(true);
                        }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragOver(false);
                          if (e.dataTransfer.files?.[0])
                            handleImageSelect(e.dataTransfer.files[0]);
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          border: `2px dashed ${
                            dragOver ? "#231942" : "#e2e8f0"
                          }`,
                          borderRadius: 18,
                          padding: "40px 16px",
                          textAlign: "center",
                          cursor: "pointer",
                          background: dragOver ? "#f5f3ff" : "#f8fafc",
                          transition: "all 0.2s",
                        }}
                      >
                        <Upload
                          style={{
                            width: 36,
                            height: 36,
                            margin: "0 auto 12px",
                            color: dragOver ? "#231942" : "#94a3b8",
                          }}
                        />
                        <p
                          style={{
                            fontWeight: 700,
                            color: "#374151",
                            margin: "0 0 4px",
                          }}
                        >
                          Drop photo here
                        </p>
                        <p
                          style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}
                        >
                          JPG Â· PNG Â· WEBP Â· Max 5 MB
                        </p>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          style={{ display: "none" }}
                          ref={fileInputRef}
                          onChange={(e) => {
                            if (e.target.files?.[0])
                              handleImageSelect(e.target.files[0]);
                          }}
                        />
                      </div>
                    )}

                    <p
                      style={{
                        fontSize: 11,
                        color: "#94a3b8",
                        marginTop: 10,
                        textAlign: "center",
                      }}
                    >
                      ðŸ’¡ Check the preview above to confirm it's the right
                      photo.
                    </p>
                  </motion.div>
                )}

                {/* â”€â”€ Step 3: Pricing â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.25 }}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    <h2
                      style={{
                        fontSize: 20,
                        fontWeight: 800,
                        color: "#0f172a",
                        margin: 0,
                      }}
                    >
                      Set Your Price
                    </h2>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 12,
                      }}
                    >
                      <div>
                        <label
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#475569",
                            display: "block",
                            marginBottom: 6,
                          }}
                        >
                          Your Price (â‚¹) *
                        </label>
                        <div style={{ position: "relative" }}>
                          <span
                            style={{
                              position: "absolute",
                              left: 14,
                              top: "50%",
                              transform: "translateY(-50%)",
                              fontWeight: 800,
                              color: "#231942",
                              fontSize: 16,
                            }}
                          >
                            â‚¹
                          </span>
                          <input
                            type="number"
                            value={formData.price}
                            min="1"
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                price: e.target.value,
                              })
                            }
                            placeholder="0"
                            style={{
                              width: "100%",
                              background: "#f8fafc",
                              borderRadius: 14,
                              padding: "13px 14px 13px 30px",
                              fontSize: 15,
                              fontWeight: 700,
                              color: "#0f172a",
                              border: "1.5px solid #e2e8f0",
                              outline: "none",
                              fontFamily: "inherit",
                              boxSizing: "border-box",
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <label
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#475569",
                            display: "block",
                            marginBottom: 6,
                          }}
                        >
                          Original Price (â‚¹)
                        </label>
                        <div style={{ position: "relative" }}>
                          <span
                            style={{
                              position: "absolute",
                              left: 14,
                              top: "50%",
                              transform: "translateY(-50%)",
                              fontWeight: 700,
                              color: "#94a3b8",
                              fontSize: 16,
                            }}
                          >
                            â‚¹
                          </span>
                          <input
                            type="number"
                            value={formData.originalPrice}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                originalPrice: e.target.value,
                              })
                            }
                            placeholder="0"
                            style={{
                              width: "100%",
                              background: "#f8fafc",
                              borderRadius: 14,
                              padding: "13px 14px 13px 30px",
                              fontSize: 15,
                              fontWeight: 700,
                              color: "#0f172a",
                              border: "1.5px solid #e2e8f0",
                              outline: "none",
                              fontFamily: "inherit",
                              boxSizing: "border-box",
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {formData.price &&
                      formData.originalPrice &&
                      Number(formData.originalPrice) >
                        Number(formData.price) && (
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          style={{
                            background: "#f0fdf4",
                            borderRadius: 14,
                            padding: 14,
                            border: "1.5px solid #bbf7d0",
                          }}
                        >
                          <p
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: "#166534",
                              margin: "0 0 4px",
                            }}
                          >
                            Discount preview:
                          </p>
                          <p
                            style={{
                              fontSize: 26,
                              fontWeight: 900,
                              color: "#16a34a",
                              margin: 0,
                            }}
                          >
                            {Math.round(
                              (1 -
                                Number(formData.price) /
                                  Number(formData.originalPrice)) *
                                100
                            )}
                            % OFF
                          </p>
                          <p
                            style={{
                              fontSize: 12,
                              color: "#15803d",
                              margin: "4px 0 0",
                            }}
                          >
                            Buyers save â‚¹
                            {(
                              Number(formData.originalPrice) -
                              Number(formData.price)
                            ).toLocaleString()}
                          </p>
                        </motion.div>
                      )}

                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        cursor: "pointer",
                      }}
                    >
                      <div
                        onClick={() =>
                          setFormData({
                            ...formData,
                            negotiable: !formData.negotiable,
                          })
                        }
                        style={{
                          width: 44,
                          height: 24,
                          borderRadius: 999,
                          transition: "all 0.25s",
                          flexShrink: 0,
                          background: formData.negotiable
                            ? "#231942"
                            : "#e2e8f0",
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            background: "#fff",
                            position: "absolute",
                            top: 3,
                            transition: "all 0.25s",
                            left: formData.negotiable ? "calc(100% - 21px)" : 3,
                            boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "#374151",
                        }}
                      >
                        Price is negotiable
                      </span>
                    </label>
                  </motion.div>
                )}

                {/* â”€â”€ Step 4: Location / Seller Details â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                {step === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.25 }}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 14,
                    }}
                  >
                    <h2
                      style={{
                        fontSize: 20,
                        fontWeight: 800,
                        color: "#0f172a",
                        margin: 0,
                      }}
                    >
                      Your Details & Pickup
                    </h2>

                    {/* Phone */}
                    <div>
                      <label
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#475569",
                          display: "block",
                          marginBottom: 6,
                        }}
                      >
                        Your Phone Number *
                      </label>
                      <div style={{ position: "relative" }}>
                        <Phone
                          style={{
                            position: "absolute",
                            left: 14,
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: 16,
                            height: 16,
                            color: "#94a3b8",
                          }}
                        />
                        <input
                          value={formData.sellerPhone}
                          type="tel"
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              sellerPhone: e.target.value,
                            });
                            setErrors((p) => ({ ...p, sellerPhone: "" }));
                          }}
                          placeholder="9876543210"
                          style={{
                            width: "100%",
                            background: "#f8fafc",
                            borderRadius: 14,
                            padding: "13px 14px 13px 40px",
                            fontSize: 14,
                            fontWeight: 600,
                            color: "#0f172a",
                            border: `1.5px solid ${
                              errors.sellerPhone ? "#ef4444" : "#e2e8f0"
                            }`,
                            outline: "none",
                            fontFamily: "inherit",
                            boxSizing: "border-box",
                          }}
                        />
                      </div>
                      {errors.sellerPhone && (
                        <p
                          style={{
                            fontSize: 12,
                            color: "#ef4444",
                            margin: "5px 0 0",
                            fontWeight: 600,
                          }}
                        >
                          {errors.sellerPhone}
                        </p>
                      )}
                    </div>

                    {/* Hostel */}
                    <div>
                      <label
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#475569",
                          display: "block",
                          marginBottom: 6,
                        }}
                      >
                        Your Hostel / Block *
                      </label>
                      <input
                        value={formData.sellerHostel}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            sellerHostel: e.target.value,
                          });
                          setErrors((p) => ({ ...p, sellerHostel: "" }));
                        }}
                        placeholder="e.g. Zakir Hussain Block A"
                        style={{
                          width: "100%",
                          background: "#f8fafc",
                          borderRadius: 14,
                          padding: "13px 16px",
                          fontSize: 14,
                          fontWeight: 600,
                          color: "#0f172a",
                          border: `1.5px solid ${
                            errors.sellerHostel ? "#ef4444" : "#e2e8f0"
                          }`,
                          outline: "none",
                          fontFamily: "inherit",
                          boxSizing: "border-box",
                        }}
                      />
                      {errors.sellerHostel && (
                        <p
                          style={{
                            fontSize: 12,
                            color: "#ef4444",
                            margin: "5px 0 0",
                            fontWeight: 600,
                          }}
                        >
                          {errors.sellerHostel}
                        </p>
                      )}
                    </div>

                    {/* Room */}
                    <div>
                      <label
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#475569",
                          display: "block",
                          marginBottom: 6,
                        }}
                      >
                        Your Room Number *
                      </label>
                      <input
                        value={formData.sellerRoom}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            sellerRoom: e.target.value,
                          });
                          setErrors((p) => ({ ...p, sellerRoom: "" }));
                        }}
                        placeholder="e.g. 402"
                        style={{
                          width: "100%",
                          background: "#f8fafc",
                          borderRadius: 14,
                          padding: "13px 16px",
                          fontSize: 14,
                          fontWeight: 600,
                          color: "#0f172a",
                          border: `1.5px solid ${
                            errors.sellerRoom ? "#ef4444" : "#e2e8f0"
                          }`,
                          outline: "none",
                          fontFamily: "inherit",
                          boxSizing: "border-box",
                        }}
                      />
                      {errors.sellerRoom && (
                        <p
                          style={{
                            fontSize: 12,
                            color: "#ef4444",
                            margin: "5px 0 0",
                            fontWeight: 600,
                          }}
                        >
                          {errors.sellerRoom}
                        </p>
                      )}
                    </div>

                    {/* Meetup */}
                    <div>
                      <label
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#475569",
                          display: "block",
                          marginBottom: 8,
                        }}
                      >
                        Preferred Meetup Spot
                      </label>
                      <div
                        style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
                      >
                        {[
                          "Main Gate",
                          "Library",
                          "Canteen",
                          "C-Block Lobby",
                          "Sports Complex",
                        ].map((spot) => (
                          <button
                            key={spot}
                            onClick={() =>
                              setFormData({ ...formData, meetup: spot })
                            }
                            style={{
                              padding: "8px 14px",
                              borderRadius: 20,
                              fontSize: 12,
                              fontWeight: 700,
                              border:
                                formData.meetup === spot
                                  ? "1.5px solid #231942"
                                  : "1.5px solid #e2e8f0",
                              background:
                                formData.meetup === spot ? "#231942" : "#fff",
                              color:
                                formData.meetup === spot ? "#fff" : "#64748b",
                              cursor: "pointer",
                              transition: "all 0.18s",
                            }}
                          >
                            ðŸ“ {spot}
                          </button>
                        ))}
                      </div>
                    </div>

                    {(!formData.sellerPhone ||
                      !formData.sellerHostel ||
                      !formData.sellerRoom) && (
                      <div
                        style={{
                          background: "#fffbeb",
                          borderRadius: 12,
                          padding: 12,
                          border: "1.5px solid #fde68a",
                        }}
                      >
                        <p
                          style={{
                            fontSize: 13,
                            color: "#92400e",
                            fontWeight: 700,
                            margin: 0,
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <AlertCircle
                            style={{ width: 15, height: 15, flexShrink: 0 }}
                          />{" "}
                          All seller details are required to publish
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* â”€â”€ Step 5: Success â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
                {step === 5 && (
                  <motion.div
                    key="step5"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                    style={{ textAlign: "center", paddingBottom: 16 }}
                  >
                    <motion.div
                      animate={{
                        rotate: [0, 12, -12, 0],
                        scale: [1, 1.15, 1.15, 1],
                      }}
                      transition={{ duration: 0.65 }}
                      style={{ fontSize: 64, marginBottom: 16 }}
                    >
                      ðŸŽ‰
                    </motion.div>

                    <h2
                      style={{
                        fontSize: 24,
                        fontWeight: 900,
                        color: "#0f172a",
                        margin: "0 0 8px",
                      }}
                    >
                      Listing Live!
                    </h2>

                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#10b981",
                        background: "#f0fdf4",
                        border: "1.5px solid #a7f3d0",
                        borderRadius: 14,
                        padding: "10px 16px",
                        margin: "0 auto 20px",
                        maxWidth: 320,
                      }}
                    >
                      âœ… Your item has been listed successfully on CU Bazzar.
                    </p>

                    <div
                      style={{
                        background: "#f8fafc",
                        border: "1.5px solid #e2e8f0",
                        borderRadius: 18,
                        padding: 16,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 14,
                        marginBottom: 24,
                        textAlign: "left",
                      }}
                    >
                      <div
                        style={{
                          width: 52,
                          height: 52,
                          background: "#dcfce7",
                          borderRadius: 14,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "1.5px solid #bbf7d0",
                          flexShrink: 0,
                        }}
                      >
                        <Package
                          style={{ width: 26, height: 26, color: "#16a34a" }}
                        />
                      </div>
                      <div>
                        <p
                          style={{
                            fontWeight: 800,
                            color: "#0f172a",
                            fontSize: 15,
                            margin: "0 0 2px",
                          }}
                        >
                          {formData.title || "Your Item"}
                        </p>
                        <p
                          style={{
                            fontWeight: 900,
                            color: "#16a34a",
                            fontSize: 18,
                            margin: 0,
                          }}
                        >
                          â‚¹{formData.price || "0"}
                        </p>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: 12,
                        justifyContent: "center",
                      }}
                    >
                      <button
                        onClick={onClose}
                        style={{
                          padding: "12px 24px",
                          borderRadius: 24,
                          fontSize: 14,
                          fontWeight: 700,
                          border: "1.5px solid #e2e8f0",
                          background: "#fff",
                          color: "#374151",
                          cursor: "pointer",
                        }}
                      >
                        Back to Browsing
                      </button>
                      <button
                        onClick={() => {
                          onClose();
                          window.location.href = "/profile";
                        }}
                        style={{
                          padding: "12px 24px",
                          borderRadius: 24,
                          fontSize: 14,
                          fontWeight: 700,
                          border: "none",
                          background: "#231942",
                          color: "#fff",
                          cursor: "pointer",
                          boxShadow: "0 4px 16px rgba(35,25,66,0.3)",
                        }}
                      >
                        My Listings
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* â”€â”€ Navigation footer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            {step < 5 && (
              <div
                style={{
                  padding: "14px 20px 24px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderTop: "1px solid #f1f5f9",
                  flexShrink: 0,
                  background: "#fff",
                }}
              >
                <button
                  onClick={back}
                  disabled={step === 1}
                  style={{
                    padding: "12px 22px",
                    borderRadius: 24,
                    fontSize: 14,
                    fontWeight: 700,
                    border: "1.5px solid #e2e8f0",
                    background: "#f8fafc",
                    color: "#64748b",
                    cursor: step === 1 ? "not-allowed" : "pointer",
                    opacity: step === 1 ? 0.4 : 1,
                  }}
                >
                  Back
                </button>

                <button
                  onClick={handleNext}
                  disabled={
                    loading ||
                    (step === 4 &&
                      (!formData.sellerPhone.trim() ||
                        !formData.sellerHostel.trim() ||
                        !formData.sellerRoom.trim()))
                  }
                  style={{
                    padding: "12px 28px",
                    borderRadius: 24,
                    fontSize: 14,
                    fontWeight: 800,
                    border: "none",
                    background: "linear-gradient(135deg, #231942, #5e4b8b)",
                    color: "#fff",
                    cursor: "pointer",
                    boxShadow: "0 4px 16px rgba(35,25,66,0.3)",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    opacity:
                      loading ||
                      (step === 4 &&
                        (!formData.sellerPhone.trim() ||
                          !formData.sellerHostel.trim() ||
                          !formData.sellerRoom.trim()))
                        ? 0.5
                        : 1,
                  }}
                >
                  {loading ? (
                    <Loader2
                      style={{
                        width: 18,
                        height: 18,
                        animation: "spin 1s linear infinite",
                      }}
                    />
                  ) : (
                    <>
                      {step === 4 ? "Publish" : "Continue"}
                      <ChevronRight style={{ width: 16, height: 16 }} />
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
