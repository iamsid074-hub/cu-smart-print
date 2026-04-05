/**
 * Smart Risk Detection Utility
 * Identifies high-risk orders based on:
 * 1. Order amount vs User history (New user + > ₹500)
 * 2. Abusive or random naming patterns
 * 3. Rapid item addition (Spam behavior)
 */

export interface RiskEvaluation {
  isBlocked: boolean;
  requiresConfirmation: boolean;
  reason?: string;
  level: "low" | "medium" | "high";
}

// Starter list of common abusive words and random string patterns
const BLACKLISTED_KEYWORDS = [
  "abuse",
  "fraud",
  "spam",
  "test",
  "fake",
  "admin",
  "system",
  // Adding common local variations (Hindi/Slang) based on typical bot/abusive patterns
  "teri",
  "chut",
  "madar",
  "bhen",
  "bc",
  "mc",
  "lola",
  "gand",
  "pussy",
  "dick",
  "sex",
  "bazzar",
  "cu",
  "smart",
  "print",
];

/**
 * Checks if a string contains abusive or blacklisted keywords
 */
export const containsAbuse = (text: string): boolean => {
  if (!text) return false;
  const normalized = text.toLowerCase().replace(/[^a-z0-9]/g, "");
  return BLACKLISTED_KEYWORDS.some((word) => normalized.includes(word));
};

/**
 * Evaluates the risk of a specific order
 */
export const evaluateOrderRisk = (
  totalPrice: number,
  totalOrders: number,
  userName: string
): RiskEvaluation => {
  // 1. Critical High Risk: Abusive Username
  if (containsAbuse(userName)) {
    return {
      isBlocked: true,
      requiresConfirmation: false,
      reason:
        "Account or username contains restricted keywords. Please update your profile.",
      level: "high",
    };
  }

  // 2. Medium Risk: High value order from a brand new user
  // Threshold: ₹500 for users with 0 previous orders
  if (totalOrders === 0 && totalPrice > 500) {
    return {
      isBlocked: false,
      requiresConfirmation: true,
      reason:
        "High-value first order detected. Please confirm you want to proceed with this order.",
      level: "medium",
    };
  }

  // 3. Low Risk: Large order amount even for existing users (Soft confirmation)
  if (totalPrice > 2500) {
    return {
      isBlocked: false,
      requiresConfirmation: true,
      reason:
        "This is a large order. A quick confirmation helps us prepare your items faster.",
      level: "low",
    };
  }

  // Default: Safe
  return {
    isBlocked: false,
    requiresConfirmation: false,
    level: "low",
  };
};
