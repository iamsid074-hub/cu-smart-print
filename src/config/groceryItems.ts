export interface GroceryItem {
    id: string;
    name: string;
    quantity: string;
    price: number;
    image: string;
    category: string;
    isFresh?: boolean;
}

export const groceryItems: GroceryItem[] = [
    {
        id: "grocery-amul-taaza",
        name: "Amul Taaza (Toned Milk)",
        quantity: "500ml",
        price: 27,
        image: "/grocery/amul-taaza.png",
        category: "Milk",
        isFresh: true
    },
    {
        id: "grocery-amul-gold",
        name: "Amul Gold (Full Cream Milk)",
        quantity: "500ml",
        price: 33,
        image: "/grocery/amul-gold.png",
        category: "Milk",
        isFresh: true
    },
    {
        id: "grocery-amul-shakti",
        name: "Amul Shakti (Standardized Milk)",
        quantity: "500ml",
        price: 30,
        image: "/grocery/amul-shakti.png",
        category: "Milk",
        isFresh: true
    },
    {
        id: "grocery-bread-white",
        name: "White Sandwich Bread",
        quantity: "400g",
        price: 45,
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=400&auto=format&fit=crop",
        category: "Bakery"
    },
    {
        id: "grocery-eggs",
        name: "Farm Fresh Eggs (6 pcs)",
        quantity: "6 Units",
        price: 60,
        image: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?q=80&w=400&auto=format&fit=crop",
        category: "Dairy & Eggs"
    },
    {
        id: "grocery-butter-amul",
        name: "Amul Butter",
        quantity: "100g",
        price: 56,
        image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?q=80&w=400&auto=format&fit=crop",
        category: "Dairy & Eggs"
    },
    {
        id: "grocery-coke",
        name: "Coca-Cola",
        quantity: "300ml",
        price: 20,
        image: "/grocery/coca-cola.png",
        category: "Cold Drinks"
    },
    {
        id: "grocery-sprite",
        name: "Sprite",
        quantity: "300ml",
        price: 20,
        image: "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?q=80&w=400&auto=format&fit=crop",
        category: "Cold Drinks"
    },
    {
        id: "grocery-fanta",
        name: "Fanta",
        quantity: "300ml",
        price: 20,
        image: "/grocery/fanta.png",
        category: "Cold Drinks"
    },
    {
        id: "grocery-mountain-dew",
        name: "Mountain Dew",
        quantity: "300ml",
        price: 20,
        image: "/grocery/mountain-dew.png",
        category: "Cold Drinks"
    }
];
