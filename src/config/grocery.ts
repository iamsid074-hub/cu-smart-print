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
        image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=400&auto=format&fit=crop",
        category: "Milk & Dairy",
        badge: "Daily Essential"
    },
    {
        id: "gr-milk-2",
        title: "Amul Gold Milk 500 ml",
        price: 33,
        image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=400&auto=format&fit=crop",
        category: "Milk & Dairy"
    },
    {
        id: "gr-milk-3",
        title: "Amul Diamond Milk (500ml)",
        price: 33,
        image: "https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?q=80&w=400&auto=format&fit=crop",
        category: "Milk & Dairy"
    },
    {
        id: "gr-milk-4",
        title: "Amul Butter 100 gm",
        price: 58,
        image: "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?q=80&w=400&auto=format&fit=crop",
        category: "Milk & Dairy"
    },
    {
        id: "gr-milk-5",
        title: "Amul Cheese Slices - Rich In Protein, Wholesome, No Added Sugar, 100 g (5 Slices)",
        price: 75,
        image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=400&auto=format&fit=crop",
        category: "Milk & Dairy"
    },

    // ─── CATEGORY 2: SOFT DRINKS ───
    {
        id: "gr-drink-1",
        title: "Coca Cola (Small)",
        price: 20,
        image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=400&auto=format&fit=crop",
        category: "Soft Drinks"
    },
    {
        id: "gr-drink-2",
        title: "Coca Cola (Medium)",
        price: 40,
        image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=400&auto=format&fit=crop",
        category: "Soft Drinks"
    },
    {
        id: "gr-drink-3",
        title: "Sprite (Small)",
        price: 20,
        image: "https://images.unsplash.com/photo-1625772299849-22a00c619b02?q=80&w=400&auto=format&fit=crop",
        category: "Soft Drinks"
    },
    {
        id: "gr-drink-4",
        title: "Sprite (Medium)",
        price: 40,
        image: "https://images.unsplash.com/photo-1625772299849-22a00c619b02?q=80&w=400&auto=format&fit=crop",
        category: "Soft Drinks"
    },
    {
        id: "gr-drink-5",
        title: "Fanta (Small)",
        price: 20,
        image: "https://images.unsplash.com/photo-1624517452488-04869289c4ca?q=80&w=400&auto=format&fit=crop",
        category: "Soft Drinks"
    },
    {
        id: "gr-drink-6",
        title: "Fanta (Medium)",
        price: 40,
        image: "https://images.unsplash.com/photo-1624517452488-04869289c4ca?q=80&w=400&auto=format&fit=crop",
        category: "Soft Drinks"
    },
    {
        id: "gr-drink-7",
        title: "Mountain Dew (Small)",
        price: 20,
        image: "https://images.unsplash.com/photo-1622597467836-f308ce4509cc?q=80&w=400&auto=format&fit=crop",
        category: "Soft Drinks"
    },
    {
        id: "gr-drink-8",
        title: "Mountain Dew (Medium)",
        price: 40,
        image: "https://images.unsplash.com/photo-1622597467836-f308ce4509cc?q=80&w=400&auto=format&fit=crop",
        category: "Soft Drinks"
    },
    {
        id: "gr-drink-9",
        title: "Red Bull Energy Drink",
        price: 125,
        image: "https://images.unsplash.com/photo-1595180630018-b22306236b2f?q=80&w=400&auto=format&fit=crop",
        category: "Soft Drinks",
        badge: "Bestseller"
    },
    {
        id: "gr-drink-10",
        title: "Monster Energy Drink",
        price: 110,
        image: "https://images.unsplash.com/photo-1624517452488-04869289c4ca?q=80&w=400&auto=format&fit=crop",
        category: "Soft Drinks"
    },
    {
        id: "gr-drink-11",
        title: "Frooti / Maaza",
        price: 20,
        image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=400&auto=format&fit=crop",
        category: "Soft Drinks",
        variants: "Mango"
    },

    // ─── CATEGORY 3: FRESH FRUITS ───
    {
        id: "gr-fruit-1",
        title: "Fresh Pineapple",
        price: 80,
        image: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?q=80&w=400&auto=format&fit=crop",
        category: "Fresh Fruits"
    },
    {
        id: "gr-fruit-2",
        title: "Apples (1kg)",
        price: 200,
        image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6faa6?q=80&w=400&auto=format&fit=crop",
        category: "Fresh Fruits"
    },
    {
        id: "gr-fruit-3",
        title: "Oranges (1kg)",
        price: 80,
        image: "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?q=80&w=400&auto=format&fit=crop",
        category: "Fresh Fruits"
    },
    {
        id: "gr-fruit-4",
        title: "Guava (1kg)",
        price: 160,
        image: "https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?q=80&w=400&auto=format&fit=crop",
        category: "Fresh Fruits"
    },

    // ─── CATEGORY 4: PACKET FOODS ───
    {
        id: "gr-pack-1",
        title: "Maggi Noodles (Small)",
        price: 14,
        image: "https://images.unsplash.com/photo-1612929633738-8fe01f72813c?q=80&w=400&auto=format&fit=crop",
        category: "Packet Foods"
    },
    {
        id: "gr-pack-2",
        title: "Maggi Noodles (Pack of 4)",
        price: 55,
        image: "https://images.unsplash.com/photo-1612929633738-8fe01f72813c?q=80&w=400&auto=format&fit=crop",
        category: "Packet Foods",
        badge: "Popular"
    },
    {
        id: "gr-pack-3",
        title: "Quaker / Saffola Oats (500g)",
        price: 125,
        image: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?q=80&w=400&auto=format&fit=crop",
        category: "Packet Foods"
    },
    {
        id: "gr-pack-4",
        title: "Lays Chips",
        price: 20,
        image: "https://images.unsplash.com/photo-1566478989037-e624b0e224e7?q=80&w=400&auto=format&fit=crop",
        category: "Packet Foods",
        variants: "Blue / Green / Yellow"
    },
    {
        id: "gr-pack-5",
        title: "Kurkure",
        price: 20,
        image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?q=80&w=400&auto=format&fit=crop",
        category: "Packet Foods"
    },
    {
        id: "gr-pack-6",
        title: "Parle-G / Good Day Biscuits",
        price: 30,
        image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=400&auto=format&fit=crop",
        category: "Packet Foods"
    },
    {
        id: "gr-pack-7",
        title: "Oreo Biscuits",
        price: 35,
        image: "https://images.unsplash.com/photo-1558024920-b41e1887dc32?q=80&w=400&auto=format&fit=crop",
        category: "Packet Foods"
    },
    {
        id: "gr-pack-8",
        title: "Amul Ice Cream Cup",
        price: 40,
        image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=400&auto=format&fit=crop",
        category: "Packet Foods",
        variants: "Vanilla / Choco"
    },

    // ─── CATEGORY 5: PERSONAL CARE (15 items) ───
    {
        id: "gr-care-1",
        title: "Colgate Toothpaste (200g)",
        price: 100,
        image: "https://images.unsplash.com/photo-1559815049-74d2847ff847?q=80&w=400&auto=format&fit=crop",
        category: "Personal Care"
    },
    {
        id: "gr-care-2",
        title: "Toothbrush (Soft/Medium)",
        price: 40,
        image: "https://images.unsplash.com/photo-1559815049-74d2847ff847?q=80&w=400&auto=format&fit=crop",
        category: "Personal Care"
    },
    {
        id: "gr-care-3",
        title: "Bathing Soap (125g)",
        price: 50,
        image: "https://images.unsplash.com/photo-1600857062241-98e5dba7f214?q=80&w=400&auto=format&fit=crop",
        category: "Personal Care",
        variants: "Lux / Dettol"
    },
    {
        id: "gr-care-4",
        title: "Shampoo Sachets (Pack of 6)",
        price: 40,
        image: "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?q=80&w=400&auto=format&fit=crop",
        category: "Personal Care"
    },
    {
        id: "gr-care-5",
        title: "Shampoo Bottle (200ml)",
        price: 175,
        image: "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?q=80&w=400&auto=format&fit=crop",
        category: "Personal Care"
    },
    {
        id: "gr-care-6",
        title: "Handwash Liquid (200ml)",
        price: 80,
        image: "https://images.unsplash.com/photo-1584483766114-2cea6facdf57?q=80&w=400&auto=format&fit=crop",
        category: "Personal Care"
    },
    {
        id: "gr-care-7",
        title: "Hand Sanitizer (100ml)",
        price: 60,
        image: "https://images.unsplash.com/photo-1584483766114-2cea6facdf57?q=80&w=400&auto=format&fit=crop",
        category: "Personal Care"
    },
    {
        id: "gr-care-8",
        title: "Face Wash (100g)",
        price: 150,
        image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=400&auto=format&fit=crop",
        category: "Personal Care",
        variants: "Himalaya / Garnier"
    },
    {
        id: "gr-care-9",
        title: "Deodorant Spray (150ml)",
        price: 215,
        image: "https://images.unsplash.com/photo-1595532542520-222a7620eead?q=80&w=400&auto=format&fit=crop",
        category: "Personal Care",
        variants: "Fogg / AXE"
    },
    {
        id: "gr-care-10",
        title: "Shaving Cream (70g)",
        price: 75,
        image: "https://images.unsplash.com/photo-1512777283995-2ac7912ab8ba?q=80&w=400&auto=format&fit=crop",
        category: "Personal Care"
    },
    {
        id: "gr-care-11",
        title: "Gillette Razor (Pack of 2)",
        price: 60,
        image: "https://images.unsplash.com/photo-1512777283995-2ac7912ab8ba?q=80&w=400&auto=format&fit=crop",
        category: "Personal Care"
    },
    {
        id: "gr-care-12",
        title: "Hair Oil (200ml)",
        price: 125,
        image: "https://images.unsplash.com/photo-1608248593361-bd8044de8eb4?q=80&w=400&auto=format&fit=crop",
        category: "Personal Care",
        variants: "Parachute / Bajaj"
    },
    {
        id: "gr-care-13",
        title: "Moisturizer Box (100ml)",
        price: 160,
        image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=400&auto=format&fit=crop",
        category: "Personal Care"
    },
    {
        id: "gr-care-14",
        title: "Sunscreen (50ml)",
        price: 325,
        image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=400&auto=format&fit=crop",
        category: "Personal Care"
    },
    {
        id: "gr-care-15",
        title: "Body Lotion (200ml)",
        price: 200,
        image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=400&auto=format&fit=crop",
        category: "Personal Care"
    },

    // ─── CATEGORY 6: HOUSEHOLD ESSENTIALS (10 items) ───
    {
        id: "gr-house-1",
        title: "Surf Excel Detergent (500g)",
        price: 110,
        image: "https://images.unsplash.com/photo-1584820927498-cafe4c120056?q=80&w=400&auto=format&fit=crop",
        category: "Household Essentials"
    },
    {
        id: "gr-house-2",
        title: "Detergent Bar (250g)",
        price: 35,
        image: "https://images.unsplash.com/photo-1600857062241-98e5dba7f214?q=80&w=400&auto=format&fit=crop",
        category: "Household Essentials"
    },
    {
        id: "gr-house-3",
        title: "Fabric Conditioner (200ml)",
        price: 100,
        image: "https://images.unsplash.com/photo-1584820927498-cafe4c120056?q=80&w=400&auto=format&fit=crop",
        category: "Household Essentials",
        variants: "Comfort"
    },
    {
        id: "gr-house-4",
        title: "Tissue Paper (Pack of 100)",
        price: 40,
        image: "https://images.unsplash.com/photo-1584483765101-7fa1c7ad1f1e?q=80&w=400&auto=format&fit=crop",
        category: "Household Essentials"
    },
    {
        id: "gr-house-5",
        title: "Toilet Paper Roll",
        price: 50,
        image: "https://images.unsplash.com/photo-1584483765101-7fa1c7ad1f1e?q=80&w=400&auto=format&fit=crop",
        category: "Household Essentials"
    },
    {
        id: "gr-house-6",
        title: "Dishwash Liquid (200ml)",
        price: 75,
        image: "https://images.unsplash.com/photo-1584820927498-cafe4c120056?q=80&w=400&auto=format&fit=crop",
        category: "Household Essentials",
        variants: "Vim / Pril"
    },
    {
        id: "gr-house-7",
        title: "Room Freshener Spray (200ml)",
        price: 150,
        image: "https://images.unsplash.com/photo-1595532542520-222a7620eead?q=80&w=400&auto=format&fit=crop",
        category: "Household Essentials"
    },
    {
        id: "gr-house-8",
        title: "Mosquito Repellent Refill",
        price: 100,
        image: "https://images.unsplash.com/photo-1584820927498-cafe4c120056?q=80&w=400&auto=format&fit=crop",
        category: "Household Essentials",
        variants: "Good Knight / All Out"
    },
    {
        id: "gr-house-9",
        title: "Floor Cleaner (500ml)",
        price: 110,
        image: "https://images.unsplash.com/photo-1584820927498-cafe4c120056?q=80&w=400&auto=format&fit=crop",
        category: "Household Essentials",
        variants: "Lizol / Harpic"
    },
    {
        id: "gr-house-10",
        title: "Garbage Bags (Roll of 30)",
        price: 100,
        image: "https://images.unsplash.com/photo-1629837943542-a27dd252b412?q=80&w=400&auto=format&fit=crop",
        category: "Household Essentials"
    }
];
