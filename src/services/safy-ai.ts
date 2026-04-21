import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `You are SAFY, a friendly AI assistant for CU Bazzar at Chandigarh University. Keep answers short (1-2 sentences). Help students with food, cart, and navigation.`;

export async function getSafyAIResponse(userMessage: string): Promise<string> {
  // Use the most direct way to get the key
  const apiKey = "AIzaSyCapO-hpehSYAE1HeibFOYVTditbMLKTDY";
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Attempt 1: Using the ultra-modern 1.5 Flash Latest alias (often bypasses 404s)
    let model;
    try {
      model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    } catch {
      model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });
    }

    const combinedPrompt = `${SYSTEM_PROMPT}\n\nUser Question: ${userMessage}`;
    
    const result = await model.generateContent(combinedPrompt);
    const response = await result.response;
    const text = response.text().trim();
    
    if (!text) throw new Error("Empty AI response");
    return text;
  } catch (error: any) {
    console.error("[SAFY AI Error]:", error);
    const msg = error?.message?.toLowerCase() || "unknown";
    
    // Attempt 2: Fallback to the Experimental 2.0 (Often free and pre-enabled)
    if (msg.includes("404") || msg.includes("not found")) {
       try {
         const genAI = new GoogleGenerativeAI(apiKey);
         const fallbackModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
         const result = await fallbackModel.generateContent(`${SYSTEM_PROMPT}\n\nUser: ${userMessage}`);
         const response = await result.response;
         return response.text().trim();
       } catch (err: any) {
          // Attempt 3: Fallback to Gemini Pro
          try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const fallbackModel = genAI.getGenerativeModel({ model: "models/gemini-pro" });
            const result = await fallbackModel.generateContent(`${SYSTEM_PROMPT}\n\nUser: ${userMessage}`);
            const response = await result.response;
            return response.text().trim();
          } catch (lastErr) {
             // FINAL FALLBACK: Local Intelligent Simulation for Food
             if (userMessage.length < 50) {
               return `I'm SAFY, your university assistant. I'm having a small connection issue with my main brain, but I can still help you with food, orders, and navigation! Just tell me what you want to eat.`;
             }
             return "I'm having a connection flicker. Can you try saying that one more time?";
          }
       }
    }
    
    if (msg.includes("api key")) return "The API key seems incorrect. Please check your key in Google AI Studio.";
    if (msg.includes("safety")) return "I can't talk about that. Ask me something else!";
    if (msg.includes("quota") || msg.includes("limit")) return "My AI brain is resting for a moment (Quota Limit). Try in a minute!";
    
    return "I'm having a connection flicker. Trace: " + (msg.substring(0, 50));
  }
}
