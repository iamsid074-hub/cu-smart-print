import React, { createContext, useContext, useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { interpretCommand } from "@/lib/bazz-brain";
import { getSafyAIResponse } from "@/services/safy-ai";

export type SafyState =
  | "idle"
  | "listening"
  | "processing"
  | "speaking"
  | "error";

interface VoiceAssistantContextType {
  state: SafyState;
  transcript: string;
  response: string;
  isSupported: boolean;
  errorMsg: string;
  activate: () => void;
  dismiss: () => void;
}

const VoiceAssistantContext = createContext<VoiceAssistantContextType | undefined>(undefined);

export function VoiceAssistantProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, addItem, removeItem, clearCart } = useCart();

  // Detect if user is on a shop page — e.g. /shop/flavour-factory
  const currentShopId = location.pathname.startsWith("/shop/")
    ? location.pathname.split("/shop/")[1]?.split("/")[0] || null
    : null;

  const [state, setState] = useState<SafyState>("idle");
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef(window.speechSynthesis);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  // ── TTS ────────────────────────────────────────────────────────────────────
  const speak = useCallback((text: string, onDone?: () => void) => {
    setState("speaking");
    setResponse(text);

    const synth = synthRef.current;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    const loadAndSpeak = () => {
      const voices = synth.getVoices();
      const preferred = voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.includes("Google") ||
            v.name.includes("Samantha") ||
            v.name.includes("Natural") ||
            v.name.includes("Female"))
      );
      if (preferred) utterance.voice = preferred;
      utterance.rate = 1.05;
      utterance.pitch = 1.1;
      utterance.volume = 1.0;

      utterance.onend = () => {
        setState("idle");
        setTranscript("");
        setResponse("");
        onDone?.();
      };
      utterance.onerror = () => {
        setState("idle");
        setTranscript("");
        setResponse("");
      };
      synth.speak(utterance);
    };

    if (synth.getVoices().length > 0) {
      loadAndSpeak();
    } else {
      synth.onvoiceschanged = loadAndSpeak;
    }
  }, []);

  // ── Process command transcript (Hybrid Rule-based + Smart Fallback) ─────
  const processCommand = useCallback(
    async (text: string) => {
      setState("processing");
      setTranscript(text);

      // 1. Try local rule-based matching first
      const action = interpretCommand(text, items, currentShopId);

      // 2. Handle all local actions immediately
      if (action) {
        if (
          action.type === "navigate" || action.type === "open_shop" ||
          action.type === "cart_info" || action.type === "search" ||
          action.type === "speak" || action.type === "add_to_cart" ||
          action.type === "remove_from_cart" || action.type === "clear_cart"
        ) {
          setTimeout(() => {
            switch (action.type) {
              case "navigate":
                speak(action.message, () => navigate(action.route));
                break;
              case "open_shop":
                speak(action.message, () => navigate(`/shop/${action.shopId}`));
                break;
              case "search":
                speak(action.message, () => navigate(`/search?q=${encodeURIComponent(action.query)}`));
                break;
              case "add_to_cart":
                addItem(action.item);
                speak(action.message);
                break;
              case "remove_from_cart":
                removeItem(action.itemId);
                speak(action.message);
                break;
              case "clear_cart":
                clearCart();
                speak(action.message);
                break;
              case "cart_info":
              case "speak":
                speak(action.message);
                break;
            }
          }, 300);
          return;
        }
      }

      // 3. Try Gemini AI JSON Agent for intelligent interaction
      if (text.trim().length > 2) {
        try {
          const ai = await getSafyAIResponse(text);
          
          // Define what to do after speaking (e.g. keep listening if AI requested it)
          const onDone = ai.autoListen ? () => activate() : undefined;

          if (ai.action === "search") {
            speak(ai.reply, () => {
              navigate(`/search?q=${encodeURIComponent(ai.data || text)}`);
              if (ai.autoListen) activate();
            });
          } else if (ai.action === "navigate") {
            const routeMap: Record<string, string> = {
              wallet: "/wallet", settings: "/settings", profile: "/profile", 
              grocery: "/grocery", cart: "/grocery", home: "/home", 
              tracking: "/tracking", help: "/help"
            };
            const target = routeMap[ai.data?.toLowerCase() || ""] || "/home";
            speak(ai.reply, () => {
              navigate(target);
              if (ai.autoListen) activate();
            });
          } else {
            // "speak" action or fallback - keep the loop alive if AI wants to ask a question
            speak(ai.reply, onDone);
          }
          return;
        } catch (error) {
          console.error("Agent failed:", error);
        }
      }

      // Ultimate Fallback - keep listening to prevent dead ends
      speak("Pardon? Main thoda confuse ho rahi hoon, can you say that again?", () => activate());
    },
    // ⚠️ Include ALL used values to prevent stale closure on mobile
    [items, navigate, speak, currentShopId, addItem, removeItem, clearCart]
  );

  // ── Activate ──────────────────────────────────────────────────────────────
  const activate = useCallback(() => {
    if (!isSupported) return;

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    
    debounceTimerRef.current = setTimeout(async () => {
      synthRef.current.cancel();

      const old = recognitionRef.current;
      recognitionRef.current = null;
      try { old?.abort(); } catch {}

      const SpeechRecognitionAPI =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (!SpeechRecognitionAPI) {
        setErrorMsg("Voice not supported on this browser.");
        setState("error");
        setTimeout(() => setState("idle"), 3000);
        return;
      }

      // ── Step 1: Explicitly request mic permission on mobile ──────────────
      // This shows the native Android/iOS permission dialog correctly.
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Permission granted — release the stream immediately, SpeechRecognition handles its own stream
        stream.getTracks().forEach(t => t.stop());
      } catch (permError: any) {
        // User denied or permission unavailable
        setErrorMsg("Enable mic in browser settings to use SAFY.");
        setState("error");
        setTimeout(() => setState("idle"), 4000);
        return;
      }

      // ── Step 2: Now safe to start SpeechRecognition ──────────────────────
      const recognition: SpeechRecognition = new SpeechRecognitionAPI();
      recognitionRef.current = recognition;

      let hasProcessed = false;
      let hasErrored = false;

      recognition.lang = "en-IN";
      recognition.interimResults = true;
      recognition.maxAlternatives = 3; // More alternatives = better accuracy on mobile
      recognition.continuous = false;  // FIXED: continuous=true breaks Android Chrome

      recognition.onstart = () => {
        setState("listening");
        setTranscript("");
        setResponse("");
        setErrorMsg("");
        try { navigator.vibrate?.(40); } catch {}
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const resultIndex = event.resultIndex;
        const result = event.results[resultIndex];
        const text = result[0].transcript;
        
        setTranscript(text.trim());

        if (result.isFinal) {
          if (hasProcessed) return;
          hasProcessed = true;
          recognition.stop(); 
          processCommand(text.trim());
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (recognitionRef.current !== recognition) return;
        hasErrored = true;
        
        switch (event.error) {
          case "no-speech":
            setErrorMsg("Didn't catch that. Tap to try again!");
            setState("error");
            setTimeout(() => { setState(prev => prev === "error" ? "idle" : prev); }, 3000);
            break;
          case "not-allowed":
          case "service-not-allowed":
            setErrorMsg("Enable mic in browser settings.");
            setState("error");
            setTimeout(() => setState("idle"), 4000);
            break;
          case "network":
            setErrorMsg("Network error. Check your connection.");
            setState("error");
            setTimeout(() => setState("idle"), 3000);
            break;
          case "aborted":
            setState("idle");
            break;
          default:
            setState("idle");
            break;
        }
      };

      recognition.onend = () => {
        if (hasProcessed || hasErrored) return;
        setState((prev) => (prev === "listening" ? "idle" : prev));
        if (recognitionRef.current === recognition) {
          recognitionRef.current = null;
        }
      };

      try {
        recognition.start();
      } catch (e: any) {
        console.error("[SAFY] Init failed:", e);
        setState("idle");
      }
    }, 150);
  }, [isSupported, processCommand, speak]);

  const dismiss = useCallback(() => {
    const r = recognitionRef.current;
    recognitionRef.current = null;
    try { r?.abort(); } catch {}
    synthRef.current.cancel();
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    setState("idle");
    setTranscript("");
    setResponse("");
    setErrorMsg("");
  }, []);

  useEffect(
    () => () => {
      const r = recognitionRef.current;
      recognitionRef.current = null;
      try { r?.abort(); } catch {}
      synthRef.current.cancel();
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    },
    []
  );

  const contextValue = useMemo(() => ({
    state, transcript, response, errorMsg, isSupported, activate, dismiss
  }), [state, transcript, response, errorMsg, isSupported, activate, dismiss]);

  return (
    <VoiceAssistantContext.Provider value={contextValue}>
      {children}
    </VoiceAssistantContext.Provider>
  );
}

export function useVoiceAssistantContext() {
  const context = useContext(VoiceAssistantContext);
  if (context === undefined) {
    throw new Error("useVoiceAssistantContext must be used within a VoiceAssistantProvider");
  }
  return context;
}
