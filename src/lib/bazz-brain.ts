import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { shops } from "@/config/shopMenus";
import { getPremiumImage } from "@/data/foodData";

// ─── Shop Directory ───────────────────────────────────────────────────────────
export const SHOP_DIRECTORY = [
  { id: "chatori-chai-kulcha",  name: "Chatori Chaat & Kulcha Corner", aliases: ["chatori", "chaat", "kulcha", "chaat corner"] },
  { id: "insta-food",           name: "Insta Food",                     aliases: ["insta", "insta food"] },
  { id: "parantha-house",       name: "Parantha House",                  aliases: ["parantha", "paratha house", "paratha"] },
  { id: "punjabi-rasoi",        name: "Punjabi Rasoi",                   aliases: ["punjabi", "rasoi", "punjabi rasoi"] },
  { id: "catch-up-cafe",        name: "Catch Up Cafe",                   aliases: ["catch up", "cafe", "catch"] },
  { id: "flavour-factory",      name: "Flavour Factory",                 aliases: ["flavour", "factory", "flavor factory", "flavor"] },
  { id: "vasano-fast-food",     name: "Vasano Fast Food",                aliases: ["vasano", "fast food"] },
  { id: "rock-in-roll",         name: "Rock In Roll",                    aliases: ["rock", "rock in roll", "roll"] },
  { id: "food-castle",          name: "Food Castle",                     aliases: ["food castle", "castle"] },
  { id: "eat-and-smile",        name: "Eat & Smile",                     aliases: ["eat and smile", "smile", "eat smile"] },
  { id: "zaika",                name: "Zaika",                           aliases: ["zaika"] },
  { id: "bakerz-hub",          name: "Bakerz Hub",                      aliases: ["bakerz", "baker", "bakery", "hub"] },
  { id: "food-junction",        name: "Food Junction",                   aliases: ["food junction", "junction"] },
  { id: "king-cafe",            name: "King Cafe",                       aliases: ["king", "king cafe"] },
  { id: "handi-biryani",        name: "Handi Biryani",                  aliases: ["handi", "biryani", "handi biryani"] },
  { id: "barkat-food",          name: "Barkat Food",                     aliases: ["barkat", "barkat food"] },
];

// ─── Route Directory ──────────────────────────────────────────────────────────
const ROUTE_COMMANDS: { keywords: string[]; route: string; label: string }[] = [
  { keywords: ["home", "go home", "main page"],                           route: "/home",         label: "Home" },
  { keywords: ["wallet", "balance", "money", "pay"],                      route: "/wallet",       label: "Wallet" },
  { keywords: ["settings", "setting"],                                    route: "/settings",     label: "Settings" },
  { keywords: ["grocery", "groceries", "store"],                          route: "/grocery",      label: "Grocery" },
  { keywords: ["cart", "my cart", "basket"],                              route: "/grocery",      label: "Cart" },
  { keywords: ["search", "find", "look for"],                             route: "/search",       label: "Search" },
  { keywords: ["profile", "my profile", "account"],                       route: "/profile",      label: "Profile" },
  { keywords: ["tracking", "track", "order status", "where is my order"], route: "/tracking",     label: "Order Tracking" },
  { keywords: ["about", "about us"],                                      route: "/about-us",     label: "About Us" },
  { keywords: ["help", "support", "faq"],                                 route: "/help",         label: "Help Center" },
  { keywords: ["transactions", "history", "past orders"],                 route: "/transactions", label: "Transactions" },
];

export type AssistantAction =
  | { type: "navigate"; route: string; message: string }
  | { type: "open_shop"; shopId: string; message: string }
  | { type: "cart_info"; message: string }
  | { type: "search"; query: string; message: string }
  | { type: "add_to_cart"; item: { id: string; title: string; price: number; image: string; category: string }; message: string }
  | { type: "remove_from_cart"; itemId: string; itemName: string; message: string }
  | { type: "clear_cart"; message: string }
  | { type: "speak"; message: string };

function getGreetingResponse(): string {
  const hour = new Date().getHours();
  let timeStr = "day";
  if (hour < 12) timeStr = "morning";
  else if (hour < 17) timeStr = "afternoon";
  else if (hour < 21) timeStr = "evening";
  else timeStr = "night";

  const responses = [
    `Good ${timeStr}! I'm SAFY. How can I help you eat today?`,
    `Hey there! Hope your ${timeStr} is going great. What can I get for you?`,
    `Hello! Any delicious plans for this ${timeStr}? I'm here to help.`,
    `Namaste! Good ${timeStr}. Tell me what you're craving!`,
    `Hii! SAFY here. Wishing you a wonderful ${timeStr}. Need help with an order?`
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

export function interpretCommand(
  transcript: string,
  cartItems: ReturnType<typeof useCart>["items"],
  currentShopId?: string | null
): AssistantAction | null {
  const fullT = transcript.toLowerCase().trim();
  
  // ── Step 0: Handle Pure Greetings ──────────────────────────────────────────
  const greetingWords = ["hi", "hii", "hello", "hey", "namaste", "aur batao", "good morning", "good evening", "good afternoon", "good night", "morning", "evening", "afternoon", "kaise ho", "kya haal", "kaise hai", "whats up", "wassup"];
  
  // Check if the entire transcript is just a greeting
  if (greetingWords.some(g => fullT === g || fullT === `hey ${g}` || fullT === `hi ${g}`)) {
    return { type: "speak", message: getGreetingResponse() };
  }

  // ── Step 1: Strip Greetings to get the Core Command ────────────────────────
  // This allows "Hi SAFY, add pasta" to become just "add pasta"
  let t = fullT;
  const greetingRegex = new RegExp(`^(${greetingWords.join("|")}|safy|bazz|please|can you|o|oi|sun| सुनो| सुन )\\s*`, "i");
  t = t.replace(greetingRegex, "").trim();

  // ── Context-Aware Cart Add (when user is on a shop page) ──────────────────
  const orderTriggerWords = [
    "add", "order", "want", "get", "buy", "give", "bring", "manga", "lao", "dedo",
    "kardo", "karo", "kar", "lekar", "lena", "lelo", "dena", "dijiye", "chahiye",
    "chahta", "chahti", "mangta", "milega", "mujhe", "bhukh", "hungry"
  ];
  const isOrderIntent = orderTriggerWords.some(trig => t.includes(trig));

  if (isOrderIntent && currentShopId) {
    const currentShop = shops.find(s => s.id === currentShopId);
    if (currentShop) {
      // Strip fillers to find the item
      const query = t
        .replace(/add|order|want|to|cart|please|can|you|me|kardo|karo|kar|lekar|lao|lena|lelo|dedo|dena|dijiye|chahiye|chahta|chahti|mangta|manga|milega|mujhe|dikhao|give|bring|buy|get|hungry|bhukh|aur|ek|bhi|main|mai|from|here/g, "")
        .replace(/\s+/g, " ")
        .trim();
      
      if (query.length > 1) {
        let bestMatch: any = null;
        let bestScore = 0;

        for (const category of currentShop.categories) {
          for (const item of category.items) {
            const itemName = item.name.toLowerCase();
            const queryWords = query.split(" ").filter(w => w.length > 2);
            let score = 0;

            if (itemName.includes(query)) score += 10;
            for (const word of queryWords) {
              if (itemName.includes(word)) score += 3;
            }

            if (score > bestScore) {
              bestScore = score;
              bestMatch = { ...item, category: category.category };
            }
          }
        }

        if (bestMatch && bestScore >= 3) {
          return {
            type: "add_to_cart",
            item: {
              id: `${currentShopId}-${bestMatch.name}`,
              title: bestMatch.name,
              price: bestMatch.price,
              image: getPremiumImage(bestMatch.name, bestMatch.category),
              category: bestMatch.category,
            },
            message: `Adding ${bestMatch.name} to your cart! Anything else from ${currentShop.name}?`
          };
        }
        
        // Final fuzzy catch: if we caught a food word but no specific item match in THIS shop
        return { type: "search", query, message: `I couldn't find "${query}" in this shop, searching across all of CU Bazzar for you!` };
      }
    }
  }

  // ── Cart actions ────────────────────────────────────────────────────────────
  const isRemoveIntent = t.includes("remove") || t.includes("delete") || t.includes("hatao") || t.includes("nikalo") || t.includes("cancel");
  const isClearIntent = isRemoveIntent && (t.includes("all") || t.includes("everything") || t.includes("cart") || t.includes("sab"));

  if (isClearIntent) {
    if (cartItems.length === 0) return { type: "speak", message: "Your cart is already empty!" };
    return { type: "clear_cart", message: "Done! I've cleared your entire cart." };
  }

  if (isRemoveIntent && cartItems.length > 0) {
    const query = t.replace(/remove|delete|hatao|nikalo|cancel|please|from|cart|my/g, "").trim();
    if (query.length > 1) {
      let bestMatch: typeof cartItems[0] | null = null;
      let bestScore = 0;
      for (const item of cartItems) {
        const title = item.title.toLowerCase();
        if (title.includes(query)) { bestMatch = item; break; }
      }
      if (bestMatch) {
        return { type: "remove_from_cart", itemId: bestMatch.id, itemName: bestMatch.title, message: `Removed ${bestMatch.title} from your cart.` };
      }
    }
  }

  if (t.includes("cart") || t.includes("order") || t.includes("bill") || t.includes("mangaya")) {
    if (cartItems.length === 0) return { type: "cart_info", message: "Your cart is empty. Want to see some trending food?" };
    const total = cartItems.reduce((acc, i) => acc + i.price * (i.quantity || 1), 0);
    return { type: "cart_info", message: `You have ${cartItems.length} items totaling ₹${total}. Shall I go to the checkout?` };
  }

  // ── Navigation ──────────────────────────────────────────────────────────────
  for (const shop of SHOP_DIRECTORY) {
    if ([shop.name.toLowerCase(), ...shop.aliases].some(a => t.includes(a))) {
      return { type: "open_shop", shopId: shop.id, message: `Opening ${shop.name}!` };
    }
  }

  for (const cmd of ROUTE_COMMANDS) {
    if (cmd.keywords.some(k => t.includes(k))) {
      return { type: "navigate", route: cmd.route, message: `Opening your ${cmd.label}!` };
    }
  }

  // ── Smart Food Detection ───────────────────────────────────────────────────
  const FOOD_KEYWORDS = ["sandwich", "burger", "pizza", "chai", "tea", "coffee", "maggi", "pasta", "biryani", "momos", "roll", "paratha", "thali", "rice", "noodle", "chinese", "khana", "paneer", "chicken", "cold drink"];
  const HUNGER_KEYWORDS = ["bhukh", "hungry", "khana hai", "kuch mangao", "kuch khana", "order food"];
  
  if (FOOD_KEYWORDS.some(f => t.includes(f)) || HUNGER_KEYWORDS.some(h => t.includes(h))) {
    const query = t.replace(/add|order|want|get|to|cart|search|find|dikhao|manga|bhukh|khana|lagi|hai|de|do/g, "").trim();
    return { type: "search", query: query || "food", message: `I've got you covered! Searching for the best ${query || "food"} for you right now.` };
  }

  // ── Hand over to AI or Search phase if nothing matches ────────────────────
  return null;
}
