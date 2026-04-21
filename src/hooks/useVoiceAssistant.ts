import { useVoiceAssistantContext } from "@/contexts/VoiceAssistantContext";

/**
 * Global Voice Assistant Hook
 * 
 * Provides synchronized access to the SAFY voice assistant state and controls.
 * This hook now consumes a global context to ensure all UI components 
 * (Activation button, Dynamic Island, etc.) stay perfectly in sync.
 */
export const useVoiceAssistant = () => useVoiceAssistantContext();

// Export the type specifically for components that need to type the state
export type { SafyState } from "@/contexts/VoiceAssistantContext";
