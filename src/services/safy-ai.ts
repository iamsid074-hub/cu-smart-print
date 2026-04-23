import { GoogleGenerativeAI } from "@google/generative-ai";

export interface SafyAIAction {
  action: "speak" | "search" | "navigate";
  data?: string;
  reply: string;
  autoListen?: boolean;
}

const SYSTEM_PROMPT = `You are SAFY, the intelligent AI for CU Bazzar at Chandigarh University. 
Your tone is friendly Hinglish (Hindi + English). You help students find food and combos.

CAMPUS DATA (Top Combos to suggest):
- "Vadapav & Tea" from Chatori (₹55)
- "Masala Maggi & Cold Coffee" from Insta Food (₹115)
- "Chole Bhature & Lassi" from Chatori/Insta (₹120)
- "Veg Burger & Mix Juice" from Insta Food (₹120)
- "Paneer Paratha & Curd" from Parantha House (₹75)

RULES:
1. ALWAYS respond in valid JSON: {"action": "speak"|"search"|"navigate", "data": "query", "reply": "spoken text", "autoListen": boolean}
2. If user asks "kuch recommend karo" or "suggest food":
   - Use action="speak".
   - Suggest one of the combos above in a tempting way.
   - Set autoListen=true to ask if they want to see it.
3. If intent is clear (e.g., "biryani dikhao"): action="search", data="biryani".
4. If you don't understand: action="speak", reply="Sorry, aap kya khana chahenge? Main suggest karoon?", autoListen=true.

IMPORTANT: Use model-safe strings. Always return JSON.`;

const API_KEY = "AIzaSyCapO-hpehSYAE1HeibFOYVTditbMLKTDY";
const genAI = new GoogleGenerativeAI(API_KEY);

// FIXED MODEL NAMES for SDK (using 'models/' prefix to avoid 404)
const MODEL_PRIORITY = [
  "models/gemini-1.5-flash-latest",
  "models/gemini-1.5-flash",
  "models/gemini-1.5-pro",
  "models/gemini-pro"
];

const responseCache = new Map<string, { data: SafyAIAction; ts: number }>();

async function getWorkingModel() {
  for (const modelName of MODEL_PRIORITY) {
    try {
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: { responseMimeType: "application/json" }
      });
      // Verification test that works with JSON mode
      const result = await model.generateContent("Return JSON: {\"status\":\"ok\"}");
      JSON.parse(result.response.text());
      return model;
    } catch (e) {
      console.error(`Init error with ${modelName}:`, e);
      continue;
    }
  }
  throw new Error("No available models");
}

let activeModel: any = null;

export async function getSafyAIResponse(userMessage: string): Promise<SafyAIAction> {
  const cacheKey = userMessage.trim().toLowerCase();
  if (responseCache.has(cacheKey)) {
    const entry = responseCache.get(cacheKey)!;
    if (Date.now() - entry.ts < 10 * 60_000) return entry.data;
  }

  try {
    if (!activeModel) activeModel = await getWorkingModel();
    
    const prompt = `${SYSTEM_PROMPT}\n\nUser: "${userMessage}"\nResponse:`;

    const result = await Promise.race([
      activeModel.generateContent(prompt),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Timeout")), 10000))
    ]);

    const text = result.response.text().trim();
    const parsed: SafyAIAction = JSON.parse(text);
    
    responseCache.set(cacheKey, { data: parsed, ts: Date.now() });
    return parsed;

  } catch (error: any) {
    console.error("[SAFY AI RECOVERY]:", error);
    activeModel = null; // Reset on error to try fallback models next time
    return {
      action: "speak",
      reply: "Sorry, connection mein thodi dikat hai. Search karke dikhau?",
      autoListen: true
    };
  }
}
