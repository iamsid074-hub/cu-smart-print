import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { interpretCommand } from "@/lib/bazz-brain";

export type SafyState =
  | "idle"
  | "listening"
  | "processing"
  | "speaking"
  | "error";

interface UseVoiceAssistantReturn {
  state: SafyState;
  transcript: string;
  response: string;
  isSupported: boolean;
  errorMsg: string;
  activate: () => void;
  dismiss: () => void;
}

export function useVoiceAssistant(): UseVoiceAssistantReturn {
  const navigate = useNavigate();
  const { items } = useCart();

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

  // ── Process command transcript ─────────────────────────────────────────────
  const processCommand = useCallback(
    (text: string) => {
      setState("processing");
      setTranscript(text);

      const action = interpretCommand(text, items);

      setTimeout(() => {
        switch (action.type) {
          case "navigate":
            speak(action.message, () => navigate(action.route));
            break;
          case "open_shop":
            speak(action.message, () => navigate(`/shop/${action.shopId}`));
            break;
          default:
            speak(action.message);
        }
      }, 300);
    },
    [items, navigate, speak]
  );

  // ── Activate: start ONE listening session ──────────────────────────────────
  const activate = useCallback(() => {
    if (!isSupported) return;

    // Small debounce/delay to prevent double-execution triggering an instant abort/kill
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    
    debounceTimerRef.current = setTimeout(() => {
      // Kill any existing speech
      synthRef.current.cancel();

      // Null out ref BEFORE aborting so old onerror is ignored
      const old = recognitionRef.current;
      recognitionRef.current = null;
      try { old?.abort(); } catch {}

      const SpeechRecognitionAPI =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (!SpeechRecognitionAPI) {
        setErrorMsg("Voice system not available.");
        setState("error");
        setTimeout(() => setState("idle"), 3000);
        return;
      }

      const recognition: SpeechRecognition = new SpeechRecognitionAPI();
      recognitionRef.current = recognition;

      let hasProcessed = false;
      let hasErrored = false;

      // Configuration for stability on Android WebView
      recognition.lang = "en-IN";
      recognition.interimResults = true; // Stay open and show feedback
      recognition.maxAlternatives = 1;
      recognition.continuous = true; // Critical: keeps mic open on Android

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
        console.warn("[SAFY] Error:", event.error);
        
        switch (event.error) {
          case "no-speech":
            // Usually happens if noise floor is high or user takes too long
            // Don't kill it instantly, just show a message
            setErrorMsg("Click to try again if I stopped.");
            setState("error");
            setTimeout(() => { if (state === "error") setState("idle"); }, 3000);
            break;
          case "not-allowed":
          case "service-not-allowed":
            setErrorMsg("Mic permission denied. Check phone settings.");
            setState("error");
            break;
          case "network":
            setErrorMsg("Network error. Checking connection...");
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
        // If it ends abruptly without result/error, go idle
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
    }, 150); // 150ms debounce
  }, [isSupported, processCommand, speak, state]);

  // ── Dismiss everything ────────────────────────────────────────────────────
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

  // ── Cleanup on unmount ────────────────────────────────────────────────────
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

  return { state, transcript, response, errorMsg, isSupported, activate, dismiss };
}
