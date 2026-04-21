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

export function interpretCommand(
  transcript: string,
  cartItems: ReturnType<typeof useCart>["items"],
  currentShopId?: string | null
): AssistantAction {
  const t = transcript.toLowerCase().trim();

  // ── Context-Aware Cart Add (when user is on a shop page) ──────────────────
  const orderTriggerWords = ["add", "order", "want", "get", "lekar", "kardo", "buy", "dedo", "chahiye", "lelo"];
  const isOrderIntent = orderTriggerWords.some(trig => t.includes(trig));

  if (isOrderIntent && currentShopId) {
    // Find the current shop
    const currentShop = shops.find(s => s.id === currentShopId);
    if (currentShop) {
      // Extract the food query (remove trigger words)
      const query = t.replace(/add|order|want|to|cart|please|can|you|me|kardo|lekar|ao|dedo|chahiye|lelo|get|buy|mujhe/g, "").trim();
      
      if (query.length > 1) {
        // Fuzzy search through this shop's menu
        let bestMatch: any = null;
        let bestScore = 0;

        for (const category of currentShop.categories) {
          for (const item of category.items) {
            const itemName = item.name.toLowerCase();
            const queryWords = query.split(" ").filter(w => w.length > 2);
            let score = 0;

            // Exact match scores highest
            if (itemName.includes(query)) score += 10;
            // Word-by-word matching
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
            message: `Adding ${bestMatch.name} for ₹${bestMatch.price} to your cart! Great choice!`
          };
        }
        // Item not found in THIS shop, search globally
        return {
          type: "search",
          query,
          message: `I couldn't find "${query}" in this shop, so I'm searching everywhere for you!`
        };
      }
    }
  }

  // ── Cart query & remove actions ───────────────────────────────────────────────
  const isRemoveIntent = t.includes("remove") || t.includes("delete") || t.includes("hatao") || t.includes("nikalo") || t.includes("cancel");
  const isClearIntent = isRemoveIntent && (t.includes("all") || t.includes("everything") || t.includes("cart") || t.includes("sab"));

  // Clear entire cart
  if (isClearIntent && !t.includes("check") && !t.includes("show")) {
    if (cartItems.length === 0) {
      return { type: "speak", message: "Your cart is already empty!" };
    }
    return { type: "clear_cart", message: `Done! I've cleared all ${cartItems.length} item${cartItems.length > 1 ? "s" : ""} from your cart.` };
  }

  // Remove specific item by name
  if (isRemoveIntent && cartItems.length > 0) {
    const query = t.replace(/remove|delete|hatao|nikalo|cancel|please|from|cart|my/g, "").trim();
    if (query.length > 1) {
      // Fuzzy match cart items
      let bestMatch: typeof cartItems[0] | null = null;
      let bestScore = 0;
      for (const item of cartItems) {
        const itemTitle = (item.title || "").toLowerCase();
        const words = query.split(" ").filter(w => w.length > 2);
        let score = 0;
        if (itemTitle.includes(query)) score += 10;
        for (const word of words) {
          if (itemTitle.includes(word)) score += 3;
        }
        if (score > bestScore) { bestScore = score; bestMatch = item; }
      }
      if (bestMatch && bestScore >= 3) {
        return { type: "remove_from_cart", itemId: bestMatch.id, itemName: bestMatch.title, message: `Removed ${bestMatch.title} from your cart!` };
      }
      return { type: "speak", message: `I couldn't find "${query}" in your cart. Try saying the full item name!` };
    }
  }

  // Show cart contents
  if (t.includes("cart") || t.includes("what have i ordered") || t.includes("my order")) {
    if (cartItems.length === 0) {
      return { type: "cart_info", message: "Your cart is empty right now. Want me to open a shop so you can add something?" };
    }
    const itemList = cartItems.map(i => `${i.title} for ₹${i.price}`).join(", ");
    const total = cartItems.reduce((acc, i) => acc + i.price * (i.quantity || 1), 0);
    return {
      type: "cart_info",
      message: `You have ${cartItems.length} item${cartItems.length > 1 ? "s" : ""} in your cart: ${itemList}. Total is ₹${total}.`
    };
  }

  // ── Shop navigation ─────────────────────────────────────────────────────────
  for (const shop of SHOP_DIRECTORY) {
    const allMatchers = [shop.name.toLowerCase(), ...shop.aliases];
    if (allMatchers.some(alias => t.includes(alias))) {
      return {
        type: "open_shop",
        shopId: shop.id,
        message: `Opening ${shop.name} for you!`
      };
    }
  }

  // ── Route navigation ────────────────────────────────────────────────────────
  for (const cmd of ROUTE_COMMANDS) {
    if (cmd.keywords.some(keyword => t.includes(keyword))) {
      return {
        type: "navigate",
        route: cmd.route,
        message: `Navigating to ${cmd.label}.`
      };
    }
  }

  // ── What can you do? ────────────────────────────────────────────────────────
  if (t.includes("help") || t.includes("what can you do") || t.includes("commands")) {
    return {
      type: "speak",
      message: "I'm SAFY, your CU Bazzar assistant! I can open any shop for you, check your cart, navigate to wallet, grocery, settings, tracking, and more. Just tell me what you need!"
    };
  }

  // ── Greeting ────────────────────────────────────────────────────────────────
  if (t.includes("hello") || t.includes("hi") || t.includes("hey") || t.includes("safy") || t.includes("bazz")) {
    return {
      type: "speak",
      message: "Hey! I'm SAFY, your personal CU Bazzar assistant. What can I get for you today?"
    };
  }

  // ── Food/Search Detection (Instant Local Intelligence) ─────────────────────
  const FOOD_KEYWORDS = [
    "sandwich", "chese", "cheese", "burger", "pizza", "chai", "tea", "coffee", 
    "maggi", "maggie", "pasta", "biryani", "coke", "pepsi", "drink", "food", 
    "momos", "roll", "paratha", "thali", "rice", "noodle", "chinese"
  ];
  
  const orderTriggers = ["add", "order", "want", "get", "lekar", "kardo", "buy", "bhukh", "hungry"];
  
  if (FOOD_KEYWORDS.some(f => t.includes(f)) || orderTriggers.some(trig => t.includes(trig))) {
     // Robustly clean the query to get just the food item
     let query = t.replace(/add|order|want|to|cart|please|can|you|me|kardo|lekar|ao|search|find|dikhao/g, "").trim();
     
     if (query.length > 1) {
       return {
         type: "search",
         query: query,
         message: `I've found some delicious ${query} options for you! Opening the search results now.`
       };
     }
  }

  // ── Fallback ────────────────────────────────────────────────────────────────
  return {
    type: "speak",
    message: `I heard you say "${transcript}", but I'm not sure what to do with that yet. Try saying something like "Open Flavour Factory" or "Go to my wallet".`
  };
}
