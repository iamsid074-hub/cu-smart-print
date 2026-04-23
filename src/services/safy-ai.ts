import { GoogleGenerativeAI } from "@google/generative-ai";

export interface SafyAIAction {
  action: "speak" | "search" | "navigate";
  data?: string;
  reply: string;
  autoListen?: boolean; // Should SAFY start listening again after speaking?
}

const SYSTEM_PROMPT = `You are SAFY, the intelligent voice agent for CU Bazzar at Chandigarh University.
You help students with food, orders, and navigation. 
Speak in a friendly Hinglish (Hindi + English mix) tone.

RULES:
1. ALWAYS respond in valid JSON.
2. Action Schema: {"action": "speak"|"search"|"navigate", "data": "query/route", "reply": "spoken text", "autoListen": boolean}
3. If user is vague (e.g., "bhukh lagi hai", "kuch thanda"): 
   - Set action="speak".
   - Set autoListen=true.
   - Reply with a question to narrow down (e.g. "Bilkul! Kya aap cold drink pasand karenge ya something else?").
4. If intent is clear (e.g., "search pizza"): action="search", data="pizza", autoListen=false.
5. For navigation: action="navigate", data="wallet"|"settings"|"profile", autoListen=false.

STYLE: Be helpful, fast, and conversational. Use Hindi words like 'zaroor', 'theek hai', 'shukriya'.`;

const API_KEY = "AIzaSyCapO-hpehSYAE1HeibFOYVTditbMLKTDY";
const genAI = new GoogleGenerativeAI(API_KEY);

const responseCache = new Map<string, { data: SafyAIAction; ts: number }>();

function getCached(key: string): SafyAIAction | null {
  const entry = responseCache.get(key);
  if (entry && Date.now() - entry.ts < 10 * 60_000) return entry.data;
  return null;
}

let cachedModel: any = null;
const MODEL_PRIORITY = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];

async function getWorkingModel() {
  if (cachedModel) return cachedModel;
  for (const modelName of MODEL_PRIORITY) {
    try {
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: { responseMimeType: "application/json" }
      });
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: "Return JSON: {\"status\":\"ok\"}" }] }]
      });
      JSON.parse(result.response.text());
      cachedModel = model;
      return model;
    } catch (e) {
      console.error(`Model ${modelName} init failed:`, e);
      continue;
    }
  }
  throw new Error("All models failed");
}

export async function getSafyAIResponse(userMessage: string): Promise<SafyAIAction> {
  const cacheKey = userMessage.trim().toLowerCase();
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const model = await getWorkingModel();
    const prompt = `${SYSTEM_PROMPT}\n\nUser Question: "${userMessage}"\nJSON Action:`;

    const result = await Promise.race([
      model.generateContent(prompt),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Timeout")), 10000))
    ]);

    const text = result.response.text().trim();
    const parsed: SafyAIAction = JSON.parse(text);
    
    if (!parsed.action || !parsed.reply) throw new Error("Missing keys");

    responseCache.set(cacheKey, { data: parsed, ts: Date.now() });
    return parsed;

  } catch (error: any) {
    console.error("[SAFY AI Error]:", error);
    return {
      action: "speak",
      reply: "Main thoda connection error face kar rahi hoon. Kya aap dobara bol sakte hain?",
      autoListen: true
    };
  }
}
