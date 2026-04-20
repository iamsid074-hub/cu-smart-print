import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { interpretCommand } from "@/lib/bazz-brain";

export type SafyState =
  | "idle"         // background — not visible
  | "waking"       // heard wake word, expanding island
  | "listening"    // actively recording command
  | "processing"   // interpreting
  | "speaking"     // reading response aloud
  | "error";

interface UseVoiceAssistantReturn {
  state: SafyState;
  transcript: string;
  response: string;
  isSupported: boolean;
  dismiss: () => void;
}

export function useVoiceAssistant(): UseVoiceAssistantReturn {
  const navigate = useNavigate();
  const { items } = useCart();

  const [state, setState] = useState<SafyState>("idle");
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");

  const wakeRecognitionRef = useRef<SpeechRecognition | null>(null);
  const commandRecognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef(window.speechSynthesis);
  const isListeningRef = useRef(false);
  const isActiveRef = useRef(false);

  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const SpeechRecognitionAPI = isSupported
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null;

  // ── TTS helper ────────────────────────────────────────────────────────────
  const speak = useCallback((text: string, onDone?: () => void) => {
    setState("speaking");
    setResponse(text);
    const synth = synthRef.current;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = synth.getVoices();
    const preferred = voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        (v.name.includes("Google") || v.name.includes("Samantha") || v.name.includes("Natural"))
    );
    if (preferred) utterance.voice = preferred;
    utterance.rate = 1.0;
    utterance.pitch = 1.08;
    utterance.volume = 1.0;

    utterance.onend = () => {
      onDone?.();
      // After speaking, go back to idle and restart wake listening
      setState("idle");
      setTranscript("");
      setResponse("");
      isActiveRef.current = false;
      setTimeout(() => startWakeListener(), 400);
    };
    utterance.onerror = () => {
      setState("idle");
      isActiveRef.current = false;
      setTimeout(() => startWakeListener(), 400);
    };

    synth.speak(utterance);
  }, []);

  // ── Process a confirmed command transcript ─────────────────────────────────
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
            break;
        }
      }, 350);
    },
    [items, navigate, speak]
  );

  // ── Command listener (after wake) ──────────────────────────────────────────
  const startCommandListener = useCallback(() => {
    if (!SpeechRecognitionAPI) return;

    // Kill old instance
    commandRecognitionRef.current?.abort();

    const recognition: SpeechRecognition = new SpeechRecognitionAPI();
    commandRecognitionRef.current = recognition;

    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => setState("listening");

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const heard = event.results[0]?.[0]?.transcript ?? "";
      if (heard.trim()) processCommand(heard);
    };

    recognition.onerror = () => {
      speak("I didn't catch that. Just say SAFY again when you need me!");
    };

    recognition.onend = () => {
      if (state === "listening") {
        speak("I didn't catch that. Just say SAFY again when you need me!");
      }
    };

    recognition.start();
  }, [SpeechRecognitionAPI, processCommand, speak, state]);

  // ── Wake word listener (always running in background) ─────────────────────
  const startWakeListener = useCallback(() => {
    if (!SpeechRecognitionAPI || isListeningRef.current) return;

    wakeRecognitionRef.current?.abort();
    wakeRecognitionRef.current = null;

    const recognition: SpeechRecognition = new SpeechRecognitionAPI();
    wakeRecognitionRef.current = recognition;

    recognition.lang = "en-IN";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = true; // keep listening until wake word

    isListeningRef.current = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      if (isActiveRef.current) return; // already awake, ignore

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript.toLowerCase().trim();
        // Wake word detection — "safy" or "hi safy" or "hey safy"
        if (
          text.includes("safy") ||
          text.includes("safi") ||
          text.includes("safety") || // common misrecognition
          text.includes("sophie") ||  // another misrecognition edge case
          text.includes("safe")
        ) {
          isActiveRef.current = true;
          recognition.stop();
          isListeningRef.current = false;

          // Trigger wake sequence
          setState("waking");
          synthRef.current.cancel();

          setTimeout(() => {
            startCommandListener();
          }, 600); // small delay for the island animation to expand
          break;
        }
      }
    };

    recognition.onend = () => {
      isListeningRef.current = false;
      // Restart wake listener automatically unless we are actively processing
      if (!isActiveRef.current) {
        setTimeout(() => startWakeListener(), 300);
      }
    };

    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      isListeningRef.current = false;
      if (e.error !== "aborted" && !isActiveRef.current) {
        setTimeout(() => startWakeListener(), 1000);
      }
    };

    try {
      recognition.start();
    } catch {
      isListeningRef.current = false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [SpeechRecognitionAPI]);

  // ── Dismiss ────────────────────────────────────────────────────────────────
  const dismiss = useCallback(() => {
    commandRecognitionRef.current?.abort();
    synthRef.current.cancel();
    setState("idle");
    setTranscript("");
    setResponse("");
    isActiveRef.current = false;
    setTimeout(() => startWakeListener(), 400);
  }, [startWakeListener]);

  // ── Boot: start wake listener when component mounts ───────────────────────
  useEffect(() => {
    if (!isSupported) return;
    // Short delay to avoid fighting with other audio contexts on page load
    const t = setTimeout(() => startWakeListener(), 1500);
    return () => {
      clearTimeout(t);
      wakeRecognitionRef.current?.abort();
      commandRecognitionRef.current?.abort();
      synthRef.current.cancel();
      isListeningRef.current = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { state, transcript, response, isSupported, dismiss };
}
