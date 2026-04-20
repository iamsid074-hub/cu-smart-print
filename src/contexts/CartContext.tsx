import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
  useCallback,
} from "react";

export interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  category?: string;
  notes?: string;
  isCustom?: boolean;
}

export interface CartAction {
  type: "add" | "remove" | "clear";
  itemTitle?: string;
  itemPrice?: number;
  timestamp: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  lastAction: CartAction | null;
  rapidAddDetected: boolean;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("food_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [lastAction, setLastAction] = useState<CartAction | null>(null);
  const [additionHistory, setAdditionHistory] = useState<number[]>([]);
  const [rapidAddDetected, setRapidAddDetected] = useState(false);

  useEffect(() => {
    localStorage.setItem("food_cart", JSON.stringify(items));
  }, [items]);

  // Check for spam adding (e.g., > 8 items in 12 seconds)
  useEffect(() => {
    const now = Date.now();
    const recentAdds = additionHistory.filter((ts) => now - ts < 12000);
    if (recentAdds.length >= 8) {
      setRapidAddDetected(true);
    } else if (recentAdds.length === 0) {
      setRapidAddDetected(false);
    }
  }, [additionHistory]);

  const addItem = useCallback((
    itemData: Omit<CartItem, "quantity" | "title"> & { title?: string; name?: string; quantity?: number }
  ) => {
    const now = Date.now();
    // Support both 'title' and 'name' for item identity
    const title = itemData.title || itemData.name || "Unnamed Item";
    const item: Omit<CartItem, "quantity"> = {
      ...itemData,
      title: title
    };

    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      const qtyToAdd = itemData.quantity || 1;
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + qtyToAdd } : i
        );
      }
      return [...prev, { ...item, quantity: qtyToAdd } as CartItem];
    });
    setLastAction({
      type: "add",
      itemTitle: title,
      itemPrice: item.price,
      timestamp: now,
    });
    setAdditionHistory((prev) => [...prev.slice(-15), now]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const found = prev.find((i) => i.id === id);
      if (found) {
        // Set last action outside the updater if needed, or skip if not used.
        // For now, keeping it but ensuring it's not breaking the update flow.
        setTimeout(() => {
          setLastAction({
            type: "remove",
            itemTitle: found.title,
            timestamp: Date.now(),
          });
        }, 0);
      }
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const updateQuantity = useCallback((id: string, qty: number) => {
    if (qty <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i))
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
    setLastAction({ type: "clear", timestamp: Date.now() });
  }, []);

  const totalItems = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );
  const totalPrice = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );

  const contextValue = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
      lastAction,
      rapidAddDetected,
    }),
    [
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
      lastAction,
      rapidAddDetected,
    ]
  );

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
