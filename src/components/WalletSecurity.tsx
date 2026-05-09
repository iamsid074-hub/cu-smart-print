import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import { Lock, ShieldCheck, AlertCircle, ScanFace, Check, ArrowRight, KeyRound, Loader2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type SecurityMode = "initializing" | "setup_intro" | "pin_setup" | "pin_confirm" | "face_setup" | "verify_face" | "verify_pin" | "unlocked";

interface WalletSecurityProps {
  onUnlock: () => void;
  onClose?: () => void;
}

export default function WalletSecurity({ onUnlock, onClose }: WalletSecurityProps) {
  const { user } = useAuth();
  const [mode, setMode] = useState<SecurityMode>("initializing");
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  
  // Security Data State
  const [hasPin, setHasPin] = useState(false);
  const [hasFace, setHasFace] = useState(false);
  const [storedEmbedding, setStoredEmbedding] = useState<Float32Array | null>(null);
  
  // Pin State
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinError, setPinError] = useState(false);
  
  // Face State
  const webcamRef = useRef<Webcam>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [faceProgress, setFaceProgress] = useState(0);
  const [faceStatus, setFaceStatus] = useState("Position your face in the circle");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showRetry, setShowRetry] = useState(false);
  const noFaceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Camera Selection State
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");


  // Get available cameras
  useEffect(() => {
    const getDevices = async () => {
      try {
        const mediaDevices = await navigator.mediaDevices.enumerateDevices();
        
        // Keywords common to virtual cameras we want to ignore
        const virtualKeywords = ["virtual", "obs", "snap", "camo", "epoccam", "droidcam", "xsplit", "vtube", "manycam", "smart connect", "iriun"];
        
        // Filter for video inputs and exclude virtual cameras
        const realCameras = mediaDevices.filter((device) => {
           if (device.kind !== "videoinput") return false;
           const label = device.label.toLowerCase();
           return !virtualKeywords.some(keyword => label.includes(keyword));
        });

        // Fallback to all video inputs if our filter accidentally removed everything
        const allVideoInputs = mediaDevices.filter(d => d.kind === "videoinput");
        const finalDevices = realCameras.length > 0 ? realCameras : allVideoInputs;

        setDevices(finalDevices);
        if (finalDevices.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(finalDevices[0].deviceId);
        }
      } catch (err) {
        console.error("Error enumerating devices:", err);
      }
    };
    getDevices();
  }, [selectedDeviceId]);

  // Initialize and load data
  useEffect(() => {
    const init = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models')
        ]);
        setIsLoadingModels(false);
        
        if (user) {
          const { data, error } = await supabase
            .from("profiles")
            .select("wallet_pin, biometric_enabled, face_embedding")
            .eq("id", user.id)
            .single();
            
          if (!error && data) {
            setHasPin(!!data.wallet_pin);
            setHasFace(!!data.biometric_enabled && !!data.face_embedding);
            if (data.face_embedding) {
              setStoredEmbedding(new Float32Array(data.face_embedding));
            }
            
            if (data.wallet_pin && data.biometric_enabled) {
              setMode("verify_face");
            } else if (data.wallet_pin && !data.biometric_enabled) {
              // User has a PIN but never finished Face Setup. Force them to finish.
              setMode("face_setup");
            } else {
              setMode("setup_intro");
            }
          } else {
             setMode("setup_intro"); // Fallback
          }
        } else {
           setMode("setup_intro"); // Not logged in fallback
        }
      } catch (err) {
        console.error("Failed to initialize:", err);
        setIsLoadingModels(false);
        setMode("setup_intro"); // Fallback
      }
    };
    init();
  }, [user]);

  // Face Detection Logic
  const detectFace = useCallback(async () => {
    if (!webcamRef.current || !webcamRef.current.video) return;
    
    const video = webcamRef.current.video;
    
    // Guard against uninitialized dimensions which cause canvas errors
    if (video.readyState !== 4 || video.videoWidth === 0 || video.videoHeight === 0) {
      return; // Not ready yet
    }

    try {
      const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.2, inputSize: 224 }))
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        // Face found — cancel the no-face timer
        if (noFaceTimer.current) {
          clearTimeout(noFaceTimer.current);
          noFaceTimer.current = null;
        }
        setShowRetry(false);
        window.dispatchEvent(new CustomEvent("face_id_face_found"));

        if (mode === "face_setup") {
          setFaceStatus("Hold still, capturing biometric data...");
          setFaceProgress((prev) => {
            const next = prev + 10;
            if (next >= 100) {
              saveFaceData(detection.descriptor);
              return 100;
            }
            return next;
          });
        } else if (mode === "verify_face" && storedEmbedding) {
          const distance = faceapi.euclideanDistance(detection.descriptor, storedEmbedding);
          if (distance < 0.45) {
            setFaceStatus("Identity Verified");
            setMode("unlocked");
            onUnlock();
            window.dispatchEvent(new Event("wallet_unlock_success"));
          } else {
            setFaceStatus("Face not recognized");
            setFailedAttempts(p => {
               const newFails = p + 1;
               if (newFails >= 15) {
                  setMode("verify_pin");
               }
               return newFails;
            });
          }
        }
      } else {
        // Don't set a visible status immediately — let the 5s timer handle it
        setFaceStatus("No face detected");
        // Start 5s timer — show retry in card + fire event for the stripe
        if (!noFaceTimer.current) {
          noFaceTimer.current = setTimeout(() => {
            setShowRetry(true);
            window.dispatchEvent(new CustomEvent("face_id_no_face"));
            noFaceTimer.current = null;
          }, 5000);
        }
      }
    } catch (err) {
      console.error("Face detection error:", err);
    }
  }, [mode, storedEmbedding, onUnlock]);

  // Detection Loop Manager
  useEffect(() => {
    let active = true;
    
    const runLoop = async () => {
      if (!active) return;
      if (mode === "face_setup" || mode === "verify_face") {
         if (!isLoadingModels) {
           await detectFace();
         }
         // Only continue loop if still in face mode and setup isn't at 100%
         if (active && faceProgress < 100) {
           setTimeout(runLoop, 150);
         }
      }
    };

    if (mode === "face_setup" || mode === "verify_face") {
      runLoop();
    }

    return () => { active = false; };
  }, [mode, isLoadingModels, detectFace, faceProgress]);

  const saveFaceData = async (descriptor: Float32Array) => {
    setFaceStatus("Encrypting and saving...");
    if (!user) return;
    
    const descriptorArray = Array.from(descriptor);
    await supabase.from("profiles").update({
      biometric_enabled: true,
      face_embedding: descriptorArray
    }).eq("id", user.id);
    
    toast.success("Face ID Setup Complete");
    window.dispatchEvent(new Event("wallet_lock_setup"));
    setTimeout(() => {
       setMode("unlocked");
       onUnlock();
    }, 1000);
  };

  const handlePinSubmit = async (enteredPin: string) => {
    if (!user) return;
    
    if (mode === "pin_setup") {
      setPin(enteredPin);
      setMode("pin_confirm");
    } else if (mode === "pin_confirm") {
      if (enteredPin === pin) {
        await supabase.from("profiles").update({ wallet_pin: pin }).eq("id", user.id);
        setMode("face_setup");
      } else {
        setPinError(true);
        setTimeout(() => setPinError(false), 500);
        setMode("pin_setup");
      }
    } else if (mode === "verify_pin") {
       const { data } = await supabase.from("profiles").select("wallet_pin").eq("id", user.id).single();
       if (data && data.wallet_pin === enteredPin) {
          setMode("unlocked");
          onUnlock();
          window.dispatchEvent(new Event("wallet_unlock_success"));
       } else {
          setPinError(true);
          setTimeout(() => setPinError(false), 500);
       }
    }
  };

  const renderPinPad = () => {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full p-8 text-white">
        {onClose && (
           <button onClick={onClose} className="absolute top-12 right-6 p-2 rounded-full hover:bg-white/10 transition-colors">
              <X className="w-6 h-6 text-white/60" />
           </button>
        )}
        <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
           <KeyRound className="w-8 h-8 text-blue-400" />
        </div>
        <h2 className="text-2xl font-black mb-2">
          {mode === "pin_setup" ? "Set Wallet PIN" : mode === "pin_confirm" ? "Confirm PIN" : "Enter PIN"}
        </h2>
        <p className="text-white/60 text-sm mb-8 text-center max-w-[250px]">
          {mode === "pin_setup" ? "Create a 4-digit PIN to secure your funds" : "Used as a fallback if Face ID fails"}
        </p>

        <PinEntry onSubmit={handlePinSubmit} error={pinError} />
        
        {mode === "verify_pin" && hasFace && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => setMode("verify_face")}
            className="mt-8 px-6 py-3 rounded-2xl bg-white/8 hover:bg-white/15 border border-white/10 text-[13px] font-semibold text-white/70 hover:text-white transition-all flex items-center gap-2 backdrop-blur-sm"
          >
            <ScanFace className="w-4 h-4" /> Retry Face ID
          </motion.button>
        )}
      </div>
    );
  };

  // Dispatch events for global notch
  useEffect(() => {
    if (mode === "verify_face" || mode === "face_setup") {
      window.dispatchEvent(new CustomEvent("face_id_scan_start"));
    } else {
      window.dispatchEvent(new CustomEvent("face_id_scan_end"));
    }
    return () => {
      window.dispatchEvent(new CustomEvent("face_id_scan_end"));
    };
  }, [mode]);

  const renderFaceScan = () => {
    const isSuccess = faceStatus === "Success" || faceProgress === 100;
    const userName = user?.user_metadata?.full_name?.split(' ')[0] || "Daniela";

    return (
      <div className="flex flex-col items-center justify-center w-full h-full relative">
        {onClose && !isSuccess && (
           <button onClick={onClose} className="absolute top-12 right-6 p-2 rounded-full hover:bg-white/10 transition-colors z-[1000]">
              <X className="w-6 h-6 text-white/60" />
           </button>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#050505] border border-white/10 rounded-[32px] p-8 flex flex-col items-center shadow-2xl relative overflow-hidden"
          style={{ width: '360px', height: '460px' }}
        >
          {isSuccess ? (
             <motion.div 
               key="success"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="w-full h-full flex flex-col items-center justify-center"
             >
               <span className="text-white/90 font-bold text-lg tracking-tight">
                  Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400">{userName}</span>
               </span>
             </motion.div>
          ) : (
             <motion.div 
               key="scanning"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="w-full h-full flex flex-col items-center"
             >
                <h2 className="text-[20px] font-bold text-white mb-1">
                   {mode === "face_setup" ? "Face ID Setup" : "Face ID Verification"}
                </h2>
                <p className="text-white/50 text-[13px] font-medium mb-10">Position your face in the circle</p>

                <div className="relative w-48 h-48 mb-8">
                   <div className="w-full h-full rounded-full overflow-hidden bg-[#0a0a0a] border border-white/10 shadow-[0_0_50px_rgba(255,255,255,0.05)] relative z-10 flex items-center justify-center">
                     {!cameraError ? (
                       <Webcam
                         ref={webcamRef}
                         audio={false}
                         screenshotFormat="image/jpeg"
                         width={300}
                         height={300}
                         videoConstraints={{ 
                           deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
                           facingMode: "user",
                           width: { ideal: 300 },
                           height: { ideal: 300 }
                         }}
                         className="w-full h-full object-cover scale-[1.35] transform"
                         onUserMediaError={(err) => {
                           console.error("Webcam Error:", err);
                           setCameraError("Camera access denied.");
                           setFaceStatus("Camera Error");
                         }}
                       />
                     ) : (
                       <div className="w-full h-full flex flex-col items-center justify-center text-white/20">
                         <ScanFace className="w-16 h-16 mb-2 relative z-10" />
                         <div className="absolute w-full h-[2px] bg-white/20 rotate-45 shadow-[0_0_10px_rgba(0,0,0,0.5)]"></div>
                       </div>
                     )}
                   </div>
                </div>

                 {/* Status text — hidden when "No face detected" so stripe handles it */}
                 {faceStatus !== "No face detected" && (
                   <div className={`text-[13px] font-medium mb-auto transition-colors duration-500 ${
                     faceStatus === "Face not recognized" ? "text-red-400" : "text-white/60"
                   }`}>{faceStatus}</div>
                 )}
                 {faceStatus === "No face detected" && !showRetry && (
                   <div className="mb-auto" />
                 )}

                 {/* Try Again — shown after 5s of no face */}
                 {showRetry && (
                   <motion.button
                     initial={{ opacity: 0, scale: 0.9 }}
                     animate={{ opacity: 1, scale: 1 }}
                     className="mb-auto mt-2 px-5 py-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-[12px] font-bold text-red-400 hover:text-red-300 transition-all flex items-center gap-2"
                     onClick={() => {
                       if (noFaceTimer.current) clearTimeout(noFaceTimer.current);
                       noFaceTimer.current = null;
                       setShowRetry(false);
                       setFaceStatus("Position your face in the circle");
                       window.dispatchEvent(new CustomEvent("face_id_face_found"));
                     }}
                   >
                     <ScanFace className="w-3.5 h-3.5" /> Try Again
                   </motion.button>
                 )}
             </motion.div>
          )}
        </motion.div>

        {/* Buttons below the card */}
        {mode === "verify_face" && !isSuccess && (
          <div className="mt-6 flex flex-col items-center gap-3">
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={() => setMode("verify_pin")}
              className="px-6 py-3 rounded-2xl bg-white/8 hover:bg-white/15 border border-white/10 text-[13px] font-semibold text-white/70 hover:text-white transition-all flex items-center gap-2 backdrop-blur-sm"
            >
              <KeyRound className="w-4 h-4" />
              Use PIN instead
            </motion.button>
          </div>
        )}
      </div>
    );
  };

  const renderSetupIntro = () => (
    <div className="flex flex-col items-center justify-center w-full h-full p-8 text-white relative">
      {onClose && (
         <button onClick={onClose} className="absolute top-12 right-6 p-2 rounded-full hover:bg-white/10 transition-colors z-50">
            <X className="w-6 h-6 text-white/60" />
         </button>
      )}
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(168,85,247,0.4)]">
         <ShieldCheck className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-3xl font-black mb-4 text-center">Secure Your Wallet</h2>
      <p className="text-white/70 text-center mb-8 max-w-sm leading-relaxed">
        Set up a PIN and Face ID to protect your funds and enable quick, secure payments.
      </p>
      <button 
        onClick={() => setMode("pin_setup")}
        className="bg-white text-black px-8 py-4 rounded-2xl font-black text-lg flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl"
      >
        Get Started <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );

  if (mode === "initializing" || isLoadingModels) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full">
        <Loader2 className="w-8 h-8 text-white/50 animate-spin mb-4" />
        <p className="text-white/50 text-sm font-bold animate-pulse">Initializing Security Core...</p>
      </div>
    );
  }

  if (mode === "unlocked") return null;

  return (
    <div className={`absolute inset-0 z-[9999] rounded-[inherit] overflow-hidden flex items-center justify-center transition-colors duration-700 ${
      (mode === "verify_face" || mode === "face_setup") ? "bg-black/40 backdrop-blur-md" : "bg-black/80 backdrop-blur-2xl"
    }`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="w-full h-full flex items-center justify-center"
        >
          {mode === "setup_intro" && renderSetupIntro()}
          {(mode === "pin_setup" || mode === "pin_confirm" || mode === "verify_pin") && renderPinPad()}
          {(mode === "face_setup" || mode === "verify_face") && renderFaceScan()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Helper Component for PIN Entry
function PinEntry({ onSubmit, error }: { onSubmit: (pin: string) => void; error: boolean }) {
  const [pin, setPin] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handleGlobalClick = () => inputRef.current?.focus();
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
    setPin(val);
    if (val.length === 4) {
      setTimeout(() => {
        onSubmit(val);
        setPin("");
      }, 300);
    }
  };

  const handleNumClick = (num: number) => {
    setPin(prev => {
      if (prev.length < 4) {
        const newPin = prev + num;
        if (newPin.length === 4) {
          setTimeout(() => {
            onSubmit(newPin);
            setPin("");
          }, 300);
        }
        return newPin;
      }
      return prev;
    });
    inputRef.current?.focus();
  };
  
  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col items-center relative">
      <input
        ref={inputRef}
        type="tel"
        value={pin}
        onChange={handleChange}
        className="absolute opacity-0 w-0 h-0"
        autoFocus
        autoComplete="off"
      />
      {/* PIN Dots */}
      <motion.div 
        className="flex gap-4 mb-10"
        animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        {[0, 1, 2, 3].map(i => (
          <div 
            key={i} 
            className={`w-4 h-4 rounded-full transition-all duration-300 ${
              error ? "bg-red-500 shadow-[0_0_10px_red]" : 
              i < pin.length ? "bg-white shadow-[0_0_15px_white]" : "bg-white/20"
            }`}
          />
        ))}
      </motion.div>
      
      {/* Numpad */}
      <div className="grid grid-cols-3 gap-4 max-w-[280px]">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button 
            key={num} 
            onClick={() => handleNumClick(num)}
            className="w-16 h-16 rounded-full bg-white/5 hover:bg-white/15 active:bg-white/30 text-white text-2xl font-black transition-colors"
          >
            {num}
          </button>
        ))}
        <div className="w-16 h-16" />
        <button 
          onClick={() => handleNumClick(0)}
          className="w-16 h-16 rounded-full bg-white/5 hover:bg-white/15 active:bg-white/30 text-white text-2xl font-black transition-colors"
        >
          0
        </button>
        <button 
          onClick={handleBackspace}
          className="w-16 h-16 rounded-full flex items-center justify-center hover:bg-white/10 active:bg-white/20 text-white/70 transition-colors"
        >
          <X className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
}
