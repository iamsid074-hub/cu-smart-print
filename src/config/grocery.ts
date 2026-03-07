import { ADMIN_SELLER_ID } from "./campusEssentials";

export interface GroceryItem {
    id: string;
    title: string;
    price: number;
    image: string;
    category: "Milk & Dairy" | "Soft Drinks" | "Fresh Fruits" | "Packet Foods" | "Personal Care" | "Household Essentials";
    badge?: string;
    variants?: string;
}

export const groceryItems: GroceryItem[] = [
    // ─── CATEGORY 1: MILK & DAIRY ───
    {
        id: "gr-milk-1",
        title: "Amul Taaza Milk (500ml)",
        price: 26,
        image: "/images/groceries/amul-taaza-milk.jpg",
        category: "Milk & Dairy",
        badge: "Daily Essential"
    },
    {
        id: "gr-milk-2",
        title: "Amul Gold Milk 500 ml",
        price: 33,
        image: "/images/groceries/amul-gold-milk.jpg",
        category: "Milk & Dairy"
    },
    {
        id: "gr-milk-4",
        title: "Amul Butter 100 gm",
        price: 58,
        image: "/images/groceries/amul-butter.jpg",
        category: "Milk & Dairy"
    },
    {
        id: "gr-milk-5",
        title: "Amul Cheese Slices - Rich In Protein, Wholesome, No Added Sugar, 100 g (5 Slices)",
        price: 75,
        image: "/images/groceries/amul-cheese-slices.jpg",
        category: "Milk & Dairy"
    }
];
