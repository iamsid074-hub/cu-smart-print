import { ADMIN_SELLER_ID } from "./campusEssentials";

export interface GroceryItem {
    id: string;
    title: string;
    price: number;
    image: string;
    category: "Dairy & Breakfast" | "Beverages" | "Instant Foods" | "Snacks" | "Personal Care" | "Household Essentials" | "Extras";
    badge?: string;
    variants?: string;
}

export const groceryItems: GroceryItem[] = [
    // ─── CATEGORY 1: DAIRY & BREAKFAST (15 items) ───
    {
        id: "gr-dairy-1",
        title: "Milk (500ml)",
        price: 30,
        image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=400&auto=format&fit=crop",
        category: "Dairy & Breakfast",
        variants: "Amul / Mother Dairy (Subject to availability)",
        badge: "Daily Essential"
    },
    {
        id: "gr-dairy-2",
        title: "Bread Loaf (400g)",
        price: 45,
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=400&auto=format&fit=crop",
        category: "Dairy & Breakfast",
        variants: "White / Brown"
    },
    {
        id: "gr-dairy-3",
        title: "Butter (100g)",
        price: 60,
        image: "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?q=80&w=400&auto=format&fit=crop",
        category: "Dairy & Breakfast",
        variants: "Amul / Britannia (Salted)"
    },
    {
        id: "gr-dairy-4",
        title: "Eggs (Pack of 6)",
        price: 45,
        image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?q=80&w=400&auto=format&fit=crop",
        category: "Dairy & Breakfast"
    },
    {
        id: "gr-dairy-5",
        title: "Cheese Slices (10 pcs)",
        price: 90,
        image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=400&auto=format&fit=crop",
        category: "Dairy & Breakfast"
    },
    {
        id: "gr-dairy-6",
        title: "Paneer (200g)",
        price: 90,
        image: "https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?q=80&w=400&auto=format&fit=crop",
        category: "Dairy & Breakfast"
    },
    {
        id: "gr-dairy-7",
        title: "Curd / Yogurt (400g)",
        price: 35,
        image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=400&auto=format&fit=crop",
        category: "Dairy & Breakfast"
    },
    {
        id: "gr-dairy-8",
        title: "Mayonnaise (250g)",
        price: 120,
        image: "https://images.unsplash.com/photo-1585848790074-ce7ab5ebfac7?q=80&w=400&auto=format&fit=crop",
        category: "Dairy & Breakfast",
        variants: "Eggless"
    },
    {
        id: "gr-dairy-9",
        title: "Peanut Butter (340g)",
        price: 200,
        image: "https://images.unsplash.com/photo-1583096114844-06ce5a5f2ec3?q=80&w=400&auto=format&fit=crop",
        category: "Dairy & Breakfast",
        variants: "Crunchy / Creamy"
    },
    {
        id: "gr-dairy-10",
        title: "Mixed Fruit Jam (200g)",
        price: 70,
        image: "https://images.unsplash.com/photo-1599380678280-9ea3c0a525ac?q=80&w=400&auto=format&fit=crop",
        category: "Dairy & Breakfast"
    },
    {
        id: "gr-dairy-11",
        title: "Cornflakes (250g)",
        price: 100,
        image: "https://images.unsplash.com/photo-1596541539207-6c3bddf2d242?q=80&w=400&auto=format&fit=crop",
        category: "Dairy & Breakfast",
        variants: "Kellogg's / Bagrry's"
    },
    {
        id: "gr-dairy-12",
        title: "Oats (500g)",
        price: 125,
        image: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?q=80&w=400&auto=format&fit=crop",
        category: "Dairy & Breakfast",
        variants: "Saffola / Quaker"
    },
    {
        id: "gr-dairy-13",
        title: "Muesli (500g)",
        price: 240,
        image: "https://images.unsplash.com/photo-1554316654-20a221f7362a?q=80&w=400&auto=format&fit=crop",
        category: "Dairy & Breakfast"
    },
    {
        id: "gr-dairy-14",
        title: "Honey (250g)",
        price: 175,
        image: "https://images.unsplash.com/photo-1587049352851-8d4e89134780?q=80&w=400&auto=format&fit=crop",
        category: "Dairy & Breakfast"
    },
    {
        id: "gr-dairy-15",
        title: "Chocolate Spread (350g)",
        price: 380,
        image: "https://images.unsplash.com/photo-1549495115-321159b36cc9?q=80&w=400&auto=format&fit=crop",
        category: "Dairy & Breakfast",
        variants: "Nutella"
    },

    // ─── CATEGORY 2: BEVERAGES (15 items) ───
    {
        id: "gr-bev-1",
        title: "Tea Powder (250g)",
        price: 115,
        image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=400&auto=format&fit=crop",
        category: "Beverages",
        variants: "Tata Tea / Red Label"
    },
    {
        id: "gr-bev-2",
        title: "Coffee Powder (50g)",
        price: 220,
        image: "https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=400&auto=format&fit=crop",
        category: "Beverages",
        variants: "Nescafe Classic"
    },
    {
        id: "gr-bev-3",
        title: "Green Tea (25 bags)",
        price: 170,
        image: "https://images.unsplash.com/photo-1627435601361-b8474dc7ea7a?q=80&w=400&auto=format&fit=crop",
        category: "Beverages"
    },
    {
        id: "gr-bev-4",
        title: "Coffee Sachets (Pack of 10)",
        price: 115,
        image: "https://images.unsplash.com/photo-1620061555546-5fd78ce3f1e9?q=80&w=400&auto=format&fit=crop",
        category: "Beverages"
    },
    {
        id: "gr-bev-5",
        title: "Health Drink Powder (500g)",
        price: 280,
        image: "https://images.unsplash.com/photo-1556881286-fc6915169721?q=80&w=400&auto=format&fit=crop",
        category: "Beverages",
        variants: "Bournvita / Horlicks"
    },
    {
        id: "gr-bev-6",
        title: "Fruit Juice (1L)",
        price: 100,
        image: "https://images.unsplash.com/photo-1622597467836-f308ce4509cc?q=80&w=400&auto=format&fit=crop",
        category: "Beverages",
        variants: "Real / Tropicana"
    },
    {
        id: "gr-bev-7",
        title: "Soft Drink Bottle (600ml)",
        price: 45,
        image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=400&auto=format&fit=crop",
        category: "Beverages",
        variants: "Coke / Pepsi / Sprite"
    },
    {
        id: "gr-bev-8",
        title: "Energy Drink Can (250ml)",
        price: 115,
        image: "https://images.unsplash.com/photo-1525999147711-8453965bacc1?q=80&w=400&auto=format&fit=crop",
        category: "Beverages",
        variants: "Red Bull / Sting"
    },
    {
        id: "gr-bev-9",
        title: "Flavoured Milk (200ml)",
        price: 25,
        image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=400&auto=format&fit=crop",
        category: "Beverages",
        variants: "Amul Kool"
    },
    {
        id: "gr-bev-10",
        title: "Mineral Water (1L)",
        price: 20,
        image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?q=80&w=400&auto=format&fit=crop",
        category: "Beverages"
    },
    {
        id: "gr-bev-11",
        title: "Sports Drink (500ml)",
        price: 85,
        image: "https://images.unsplash.com/photo-1525999147711-8453965bacc1?q=80&w=400&auto=format&fit=crop",
        category: "Beverages",
        variants: "Gatorade"
    },
    {
        id: "gr-bev-12",
        title: "Coconut Water Pack (200ml)",
        price: 35,
        image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?q=80&w=400&auto=format&fit=crop",
        category: "Beverages"
    },
    {
        id: "gr-bev-13",
        title: "Iced Tea (500ml)",
        price: 55,
        image: "https://images.unsplash.com/photo-1556881286-fc6915169721?q=80&w=400&auto=format&fit=crop",
        category: "Beverages",
        variants: "Lipton Peach / Lemon"
    },
    {
        id: "gr-bev-14",
        title: "Instant Drink Powder (500g)",
        price: 135,
        image: "https://images.unsplash.com/photo-1622597467836-f308ce4509cc?q=80&w=400&auto=format&fit=crop",
        category: "Beverages",
        variants: "Tang / Rasna"
    },
    {
        id: "gr-bev-15",
        title: "Milkshake Powder (200g)",
        price: 120,
        image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=400&auto=format&fit=crop",
        category: "Beverages"
    },

    // ─── CATEGORY 3: INSTANT FOODS (12 items) ───
    {
        id: "gr-inst-1",
        title: "Maggi Noodles (Pack of 4)",
        price: 55,
        image: "https://images.unsplash.com/photo-1612929633738-8fe01f72813c?q=80&w=400&auto=format&fit=crop",
        category: "Instant Foods",
        badge: "Bestseller"
    },
    {
        id: "gr-inst-2",
        title: "Yippee / Top Ramen (Single)",
        price: 14,
        image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=400&auto=format&fit=crop",
        category: "Instant Foods"
    },
    {
        id: "gr-inst-3",
        title: "Cup Noodles",
        price: 35,
        image: "https://images.unsplash.com/photo-1595180630018-b22306236b2f?q=80&w=400&auto=format&fit=crop",
        category: "Instant Foods"
    },
    {
        id: "gr-inst-4",
        title: "Instant Pasta",
        price: 40,
        image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?q=80&w=400&auto=format&fit=crop",
        category: "Instant Foods",
        variants: "Maggi Pazzta"
    },
    {
        id: "gr-inst-5",
        title: "Ready-to-Eat Meal Pack",
        price: 55,
        image: "https://images.unsplash.com/photo-1606850780554-b55ea4dd8b70?q=80&w=400&auto=format&fit=crop",
        category: "Instant Foods",
        variants: "MTR / Haldiram's"
    },
    {
        id: "gr-inst-6",
        title: "Instant Idli/Dosa Mix (500g)",
        price: 100,
        image: "https://images.unsplash.com/photo-1630383249896-424e48b4e724?q=80&w=400&auto=format&fit=crop",
        category: "Instant Foods"
    },
    {
        id: "gr-inst-7",
        title: "Microwave Popcorn (3 Pack)",
        price: 115,
        image: "https://images.unsplash.com/photo-1578849278619-e73505e9610f?q=80&w=400&auto=format&fit=crop",
        category: "Instant Foods",
        variants: "Act II"
    },
    {
        id: "gr-inst-8",
        title: "Instant Soup Packet",
        price: 20,
        image: "https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=400&auto=format&fit=crop",
        category: "Instant Foods",
        variants: "Knorr"
    },
    {
        id: "gr-inst-9",
        title: "Flavored Instant Oats (6 Pack)",
        price: 175,
        image: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?q=80&w=400&auto=format&fit=crop",
        category: "Instant Foods"
    },
    {
        id: "gr-inst-10",
        title: "Sandwich Spread (200g)",
        price: 90,
        image: "https://images.unsplash.com/photo-1585848790074-ce7ab5ebfac7?q=80&w=400&auto=format&fit=crop",
        category: "Instant Foods",
        variants: "Veeba Mint / Tandoori"
    },
    {
        id: "gr-inst-11",
        title: "Ready-to-Fry Papad (10 Pack)",
        price: 40,
        image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=400&auto=format&fit=crop",
        category: "Instant Foods"
    },
    {
        id: "gr-inst-12",
        title: "Ching's Instant Soup",
        price: 25,
        image: "https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=400&auto=format&fit=crop",
        category: "Instant Foods"
    },

    // ─── CATEGORY 4: SNACKS (18 items) ───
    {
        id: "gr-snack-1",
        title: "Lays Chips (52g)",
        price: 20,
        image: "https://images.unsplash.com/photo-1566478989037-e624b0e224e7?q=80&w=400&auto=format&fit=crop",
        category: "Snacks",
        variants: "Classic / Masala / Cream & Onion"
    },
    {
        id: "gr-snack-2",
        title: "Kurkure (78g)",
        price: 20,
        image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?q=80&w=400&auto=format&fit=crop",
        category: "Snacks"
    },
    {
        id: "gr-snack-3",
        title: "Bingo Chips (52g)",
        price: 15,
        image: "https://images.unsplash.com/photo-1566478989037-e624b0e224e7?q=80&w=400&auto=format&fit=crop",
        category: "Snacks"
    },
    {
        id: "gr-snack-4",
        title: "Parle-G Biscuits (250g)",
        price: 30,
        image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=400&auto=format&fit=crop",
        category: "Snacks"
    },
    {
        id: "gr-snack-5",
        title: "Good Day Cookies (200g)",
        price: 40,
        image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=400&auto=format&fit=crop",
        category: "Snacks"
    },
    {
        id: "gr-snack-6",
        title: "Dark Fantasy Cookies (75g)",
        price: 35,
        image: "https://images.unsplash.com/photo-1618923850107-d1a234d7a73a?q=80&w=400&auto=format&fit=crop",
        category: "Snacks",
        badge: "Popular"
    },
    {
        id: "gr-snack-7",
        title: "Oreo Biscuits (120g)",
        price: 35,
        image: "https://images.unsplash.com/photo-1558024920-b41e1887dc32?q=80&w=400&auto=format&fit=crop",
        category: "Snacks"
    },
    {
        id: "gr-snack-8",
        title: "Hide & Seek Cookies (100g)",
        price: 30,
        image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=400&auto=format&fit=crop",
        category: "Snacks"
    },
    {
        id: "gr-snack-9",
        title: "Monaco Biscuits (200g)",
        price: 35,
        image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=400&auto=format&fit=crop",
        category: "Snacks"
    },
    {
        id: "gr-snack-10",
        title: "Sunfeast Marie Light (250g)",
        price: 40,
        image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=400&auto=format&fit=crop",
        category: "Snacks"
    },
    {
        id: "gr-snack-11",
        title: "Dairy Milk Chocolate (38g)",
        price: 45,
        image: "https://images.unsplash.com/photo-1548842145-6a5fc1a62d09?q=80&w=400&auto=format&fit=crop",
        category: "Snacks"
    },
    {
        id: "gr-snack-12",
        title: "KitKat Bar (37g)",
        price: 45,
        image: "https://images.unsplash.com/photo-1621503125745-728bce8cde27?q=80&w=400&auto=format&fit=crop",
        category: "Snacks"
    },
    {
        id: "gr-snack-13",
        title: "Perk / Munch (28g)",
        price: 25,
        image: "https://images.unsplash.com/photo-1614561266012-eaf09df4433d?q=80&w=400&auto=format&fit=crop",
        category: "Snacks"
    },
    {
        id: "gr-snack-14",
        title: "Namkeen Mix / Bhujia (200g)",
        price: 70,
        image: "https://images.unsplash.com/photo-1589131665476-cda1b392b95b?q=80&w=400&auto=format&fit=crop",
        category: "Snacks",
        variants: "Haldiram's"
    },
    {
        id: "gr-snack-15",
        title: "Ready-to-Eat Popcorn (60g)",
        price: 50,
        image: "https://images.unsplash.com/photo-1572889614486-9a57ba8d6978?q=80&w=400&auto=format&fit=crop",
        category: "Snacks"
    },
    {
        id: "gr-snack-16",
        title: "Yoga Bar / Energy Bar (38g)",
        price: 45,
        image: "https://images.unsplash.com/photo-1622219808307-e435965a39cb?q=80&w=400&auto=format&fit=crop",
        category: "Snacks"
    },
    {
        id: "gr-snack-17",
        title: "Protein Bar (60g)",
        price: 100,
        image: "https://images.unsplash.com/photo-1622219808298-b8054063c8ef?q=80&w=400&auto=format&fit=crop",
        category: "Snacks"
    },
    {
        id: "gr-snack-18",
        title: "Choco Pie (Pack of 6)",
        price: 70,
        image: "https://images.unsplash.com/photo-1588612194646-6081e7d4dcf8?q=80&w=400&auto=format&fit=crop",
        category: "Snacks"
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
    },

    // ─── CATEGORY 7: EXTRAS (10 items) ───
    {
        id: "gr-extra-1",
        title: "Whisper Sanitary Pads (20 pcs)",
        price: 175,
        image: "https://images.unsplash.com/photo-1584483765101-7fa1c7ad1f1e?q=80&w=400&auto=format&fit=crop",
        category: "Extras"
    },
    {
        id: "gr-extra-2",
        title: "Condoms (Pack of 3)",
        price: 115,
        image: "https://images.unsplash.com/photo-1584483765101-7fa1c7ad1f1e?q=80&w=400&auto=format&fit=crop",
        category: "Extras",
        variants: "Discreet Packaging"
    },
    {
        id: "gr-extra-3",
        title: "Pain Relief Spray (35g)",
        price: 150,
        image: "https://images.unsplash.com/photo-1595532542520-222a7620eead?q=80&w=400&auto=format&fit=crop",
        category: "Extras",
        variants: "Moov / Volini"
    },
    {
        id: "gr-extra-4",
        title: "Band-Aid (Pack of 10)",
        price: 40,
        image: "https://images.unsplash.com/photo-1584483765101-7fa1c7ad1f1e?q=80&w=400&auto=format&fit=crop",
        category: "Extras"
    },
    {
        id: "gr-extra-5",
        title: "Vicks VapoRub (25ml)",
        price: 90,
        image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=400&auto=format&fit=crop",
        category: "Extras"
    },
    {
        id: "gr-extra-6",
        title: "Cough Lozenges (Pack of 8)",
        price: 75,
        image: "https://images.unsplash.com/photo-1584483765101-7fa1c7ad1f1e?q=80&w=400&auto=format&fit=crop",
        category: "Extras",
        variants: "Strepsils / Vicks"
    },
    {
        id: "gr-extra-7",
        title: "Multivitamin Tablets",
        price: 300,
        image: "https://images.unsplash.com/photo-1584308666744-24d5e1f0e4b8?q=80&w=400&auto=format&fit=crop",
        category: "Extras",
        variants: "Revital / Supradyn"
    },
    {
        id: "gr-extra-8",
        title: "Protein Powder Jar (500g)",
        price: 1150,
        image: "https://images.unsplash.com/photo-1579722820308-d74e5088dcc9?q=80&w=400&auto=format&fit=crop",
        category: "Extras",
        variants: "MuscleBlaze"
    }
];
