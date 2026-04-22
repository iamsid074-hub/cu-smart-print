import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `You are SAFY, a friendly AI assistant for CU Bazzar at Chandigarh University. Keep answers short (1-2 sentences). Help students with food, cart, and navigation.`;

// ── Singleton SDK instance (reused across all calls) ──────────────────────────
const API_KEY = "AIzaSyCapO-hpehSYAE1HeibFOYVTditbMLKTDY";
const genAI = new GoogleGenerativeAI(API_KEY);

// ── LRU Response Cache ────────────────────────────────────────────────────────
const CACHE_MAX = 50;
const responseCache = new Map<string, { text: string; ts: number }>();

function getCached(key: string): string | null {
  const entry = responseCache.get(key);
  if (!entry) return null;
  // Expire after 10 minutes
  if (Date.now() - entry.ts > 10 * 60_000) {
    responseCache.delete(key);
    return null;
  }
  // LRU: move to end
  responseCache.delete(key);
  responseCache.set(key, entry);
  return entry.text;
}

function setCache(key: string, text: string) {
  if (responseCache.size >= CACHE_MAX) {
    // Delete oldest entry
    const firstKey = responseCache.keys().next().value;
    if (firstKey) responseCache.delete(firstKey);
  }
  responseCache.set(key, { text, ts: Date.now() });
}

// ── Model selection (try once, cache the working model) ───────────────────────
let cachedModel: ReturnType<typeof genAI.getGenerativeModel> | null = null;
const MODEL_PRIORITY = ["gemini-1.5-flash-latest", "models/gemini-1.5-flash", "gemini-2.0-flash-exp", "models/gemini-pro"];

async function getWorkingModel() {
  if (cachedModel) return cachedModel;
  
  for (const modelName of MODEL_PRIORITY) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      // Test with a tiny prompt
      await model.generateContent("hi");
      cachedModel = model;
      return model;
    } catch {
      continue;
    }
  }
  throw new Error("No working model found");
}

// ── Main API function with timeout + cache ────────────────────────────────────
export async function getSafyAIResponse(userMessage: string): Promise<string> {
  const cacheKey = userMessage.trim().toLowerCase();
  
  // 1. Check cache first (instant response)
  const cached = getCached(cacheKey);
  if (cached) return cached;

  // 2. Call Gemini with timeout protection
  try {
    const model = await getWorkingModel();
    const combinedPrompt = `${SYSTEM_PROMPT}\n\nUser Question: ${userMessage}`;

    const resultPromise = model.generateContent(combinedPrompt);
    
    // 8-second timeout
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), 8000)
    );

    const result = await Promise.race([resultPromise, timeoutPromise]);
    const response = await result.response;
    const text = response.text().trim();
    
    if (!text) throw new Error("Empty AI response");

    // Cache for future use
    setCache(cacheKey, text);
    return text;
  } catch (error: any) {
    console.error("[SAFY AI Error]:", error);
    const msg = error?.message?.toLowerCase() || "unknown";
    
    // Reset cached model on 404 (model may have been deprecated)
    if (msg.includes("404") || msg.includes("not found")) {
      cachedModel = null;
      // Try once more with fallback
      try {
        const model = await getWorkingModel();
        const result = await model.generateContent(`${SYSTEM_PROMPT}\n\nUser: ${userMessage}`);
        const response = await result.response;
        const text = response.text().trim();
        if (text) {
          setCache(cacheKey, text);
          return text;
        }
      } catch {
        // Fall through to local responses
      }
    }

    if (msg.includes("api key")) return "The API key seems incorrect. Please check your key in Google AI Studio.";
    if (msg.includes("safety")) return "I can't talk about that. Ask me something else!";
    if (msg.includes("quota") || msg.includes("limit")) return "My AI brain is resting for a moment (Quota Limit). Try in a minute!";
    if (msg.includes("timeout")) return "I'm thinking too hard! Can you ask that again in a simpler way?";
    
    if (userMessage.length < 50) {
      return `I'm SAFY, your university assistant. I'm having a small connection issue with my main brain, but I can still help you with food, orders, and navigation! Just tell me what you want to eat.`;
    }
    return "I'm having a connection flicker. Can you try saying that one more time?";
  }
}
