import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";

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
  | { type: "speak"; message: string };

export function interpretCommand(
  transcript: string,
  cartItems: ReturnType<typeof useCart>["items"]
): AssistantAction {
  const t = transcript.toLowerCase().trim();

  // ── Cart query ─────────────────────────────────────────────────────────────
  if (t.includes("cart") || t.includes("what have i ordered") || t.includes("my order")) {
    if (cartItems.length === 0) {
      return { type: "cart_info", message: "Your cart is empty right now. Want me to open a shop so you can add something?" };
    }
    const itemList = cartItems.map(i => `${i.name} for ₹${i.price}`).join(", ");
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

  // ── Fallback ────────────────────────────────────────────────────────────────
  return {
    type: "speak",
    message: `I heard you say "${transcript}", but I'm not sure what to do with that yet. Try saying something like "Open Flavour Factory" or "Go to my wallet".`
  };
}
