import { shops, type MenuItem } from "@/config/shopMenus";

/**
 * Normalizes a string by converting to lowercase and removing special characters.
 */
const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();

/**
 * Simple Levenshtein distance algorithm for fuzzy matching.
 */
function getLevenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          )
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Get suggestions for food items based on user input.
 */
export function getFoodSuggestions(input: string): { name: string; price: number; shop: string }[] {
  if (!input.trim()) return [];

  const search = normalize(input);
  const allItems: { name: string; price: number; shop: string }[] = [];

  shops.forEach((shop) => {
    shop.categories.forEach((cat) => {
      cat.items.forEach((item) => {
        allItems.push({ name: item.name, price: item.price, shop: shop.name });
      });
    });
  });

  // Filter and sort by relevance
  return allItems
    .map((item) => {
      const itemName = normalize(item.name);
      let score = 0;

      if (itemName === search) score = 100;
      else if (itemName.startsWith(search)) score = 80;
      else if (itemName.includes(search)) score = 60;
      else {
        const distance = getLevenshteinDistance(search, itemName);
        const maxLength = Math.max(search.length, itemName.length);
        const similarity = 1 - distance / maxLength;
        if (similarity > 0.6) score = Math.floor(similarity * 50);
      }

      return { ...item, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

/**
 * Estimate price for a given custom item description.
 */
export function estimatePrice(input: string): number {
  const suggestions = getFoodSuggestions(input);
  if (suggestions.length > 0) {
    // Return average of top 3 suggestions or just the first one
    return suggestions[0].price;
  }
  
  // Default fallback prices based on keywords
  const normalized = normalize(input);
  if (normalized.includes("burger")) return 60;
  if (normalized.includes("pizza")) return 150;
  if (normalized.includes("maggi")) return 40;
  if (normalized.includes("coffee")) return 50;
  if (normalized.includes("sandwich")) return 50;
  if (normalized.includes("momos")) return 60;
  if (normalized.includes("pasta")) return 80;
  if (normalized.includes("roll")) return 70;
  if (normalized.includes("fried rice")) return 80;
  
  return 80; // Generic fallback
}

export const QUICK_TAGS = ["Maggi", "Burger", "Sandwich", "Cold Coffee", "Momos", "Fries", "Pasta", "Roll"];

export const POPULAR_FOODS = [
  { name: "Masala Maggi", price: 30, shop: "Insta Food" },
  { name: "Veg Burger", price: 50, shop: "Punjabi Rasoi" },
  { name: "Cold Coffee", price: 50, shop: "Insta Food" },
  { name: "Chicken Overloaded Pizza", price: 180, shop: "Parantha House" }
];
