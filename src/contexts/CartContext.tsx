import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from "react";

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
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>(() => {
        try {
            const saved = localStorage.getItem("food_cart");
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });
    const [lastAction, setLastAction] = useState<CartAction | null>(null);

    useEffect(() => {
        localStorage.setItem("food_cart", JSON.stringify(items));
    }, [items]);

    const addItem = (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
        setItems(prev => {
            const existing = prev.find(i => i.id === item.id);
            const qtyToAdd = item.quantity || 1;
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + qtyToAdd } : i);
            }
            return [...prev, { ...item, quantity: qtyToAdd }];
        });
        setLastAction({ type: "add", itemTitle: item.title, itemPrice: item.price, timestamp: Date.now() });
    };

    const removeItem = (id: string) => {
        const found = items.find(i => i.id === id);
        setItems(prev => prev.filter(i => i.id !== id));
        setLastAction({ type: "remove", itemTitle: found?.title, timestamp: Date.now() });
    };

    const updateQuantity = (id: string, qty: number) => {
        if (qty <= 0) { removeItem(id); return; }
        setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
    };

    const clearCart = () => {
        setItems([]);
        setLastAction({ type: "clear", timestamp: Date.now() });
    };

    const totalItems = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
    const totalPrice = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);

    const contextValue = useMemo(() => ({
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        lastAction
    }), [items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice, lastAction]);

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within CartProvider");
    return ctx;
}
