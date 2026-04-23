import { GoogleGenerativeAI } from "@google/generative-ai";

export interface SafyAIAction {
  action: "speak" | "search" | "navigate";
  data?: string;
  reply: string;
}

const SYSTEM_PROMPT = `You are SAFY, the intelligent voice agent for CU Bazzar at Chandigarh University.
Your mission is to help students with food, orders, and navigation using a friendly, Hinglish (mixed Hindi/English) personality.

You MUST respond in valid JSON format only according to this schema:
{
  "action": "speak" | "search" | "navigate",
  "data": "search query or route name",
  "reply": "friendly Hinglish response to be spoken"
}

- For general talk or questions: action="speak", reply="your response".
- If user wants food but isn't specific: action="search", data="vague food category", reply="Let me search for that!".
- If user wants to see their wallet/settings/profile: action="navigate", data="wallet/settings/profile", reply="Opening your wallet now!".
- If you don't understand or need more info: action="speak", reply="Aapne kya kaha? Kya main aapke liye kuch order karun ya shop dikhau?".

REPLY STYLE: "Theek hai, main aapke liye search kar rahi hoon!" or "Bilkul, wallet page khul raha hai." Keep it short.`;

// ── Singleton SDK instance ───────────────────────────────────────────────────
const API_KEY = "AIzaSyCapO-hpehSYAE1HeibFOYVTditbMLKTDY";
const genAI = new GoogleGenerativeAI(API_KEY);

// ── LRU Response Cache (Parsed Objects) ──────────────────────────────────────
const CACHE_MAX = 50;
const responseCache = new Map<string, { data: SafyAIAction; ts: number }>();

function getCached(key: string): SafyAIAction | null {
  const entry = responseCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > 10 * 60_000) {
    responseCache.delete(key);
    return null;
  }
  responseCache.delete(key);
  responseCache.set(key, entry);
  return entry.data;
}

function setCache(key: string, data: SafyAIAction) {
  if (responseCache.size >= CACHE_MAX) {
    const firstKey = responseCache.keys().next().value;
    if (firstKey) responseCache.delete(firstKey);
  }
  responseCache.set(key, { data, ts: Date.now() });
}

// ── Model selection ──────────────────────────────────────────────────────────
let cachedModel: any = null;
const MODEL_PRIORITY = ["gemini-1.5-flash-latest", "gemini-1.5-flash"];

async function getWorkingModel() {
  if (cachedModel) return cachedModel;
  
  for (const modelName of MODEL_PRIORITY) {
    try {
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: {
          responseMimeType: "application/json"
        }
      });
      // Verification test
      await model.generateContent("hi");
      cachedModel = model;
      return model;
    } catch (e) {
      console.warn(`Model ${modelName} failed, trying next...`);
      continue;
    }
  }
  throw new Error("No working model found");
}

/**
 * Main API function returning structured AI commands
 */
export async function getSafyAIResponse(userMessage: string): Promise<SafyAIAction> {
  const cacheKey = userMessage.trim().toLowerCase();
  
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const model = await getWorkingModel();
    const combinedPrompt = `${SYSTEM_PROMPT}\n\nUser Question: ${userMessage}`;

    const resultPromise = model.generateContent(combinedPrompt);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), 8000)
    );

    const result = await Promise.race([resultPromise, timeoutPromise]);
    const response = await (result as any).response;
    const text = response.text().trim();
    
    if (!text) throw new Error("Empty AI response");

    try {
      const parsed: SafyAIAction = JSON.parse(text);
      setCache(cacheKey, parsed);
      return parsed;
    } catch (parseErr) {
      console.error("AI JSON Parse Error:", text);
      return { action: "speak", reply: "I'm having trouble thinking clearly. Try again?" };
    }

  } catch (error: any) {
    console.error("[SAFY AI Agent Error]:", error);
    
    const fallback: SafyAIAction = {
      action: "speak",
      reply: "Main thoda connection error face kar rahi hoon. Kya aap dobara bol sakte hain?"
    };

    return fallback;
  }
}
