// â”€â”€â”€ Campus Essentials â€” Static Product Config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// These products are admin-controlled and not user-uploaded.
// When ordered, seller_id is set to ADMIN_SELLER_ID so orders appear in the Admin panel.

// âš ï¸ IMPORTANT: Replace this with your actual Supabase admin user UUID
// Find it in: Supabase Dashboard â†’ Authentication â†’ Users â†’ copy your admin UUID
export const ADMIN_SELLER_ID = "7450c873-f51d-469e-a33d-c44ca80beb0c"; // â† REPLACE THIS

export interface CampusEssentialItem {
  id: string;
  title: string;
  price: number;
  image: string;
  category: string;
  badge?: string;
}

export const campusEssentials: CampusEssentialItem[] = [
  // â”€â”€â”€ Oral Care â”€â”€â”€
  {
    id: "ce-toothbrush-electric",
    title: "Oral-B Electric Toothbrush",
    price: 899,
    image:
      "https://images.unsplash.com/photo-1590150995963-dd821cb8cd83?q=80&w=400&auto=format&fit=crop",
    category: "oral care",
    badge: "Bestseller",
  },
  {
    id: "ce-toothpaste",
    title: "Colgate Total Toothpaste (150g)",
    price: 95,
    image:
      "https://images.unsplash.com/photo-1559132278-caee042b322e?q=80&w=400&auto=format&fit=crop",
    category: "oral care",
  },
  {
    id: "ce-mouthwash",
    title: "Listerine Mouthwash (250ml)",
    price: 150,
    image:
      "https://images.unsplash.com/photo-1457131760772-7017c6180f05?q=80&w=400&auto=format&fit=crop",
    category: "oral care",
  },

  // â”€â”€â”€ Bath & Skin Care â”€â”€â”€
  {
    id: "ce-bodywash",
    title: "Dove Deep Moisture Body Wash",
    price: 299,
    image:
      "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?q=80&w=400&auto=format&fit=crop",
    category: "bath & body",
    badge: "Essential",
  },
  {
    id: "ce-loofah",
    title: "Exfoliating Bath Loofah",
    price: 65,
    image:
      "https://images.unsplash.com/photo-1588667794344-96fe7d42cfb2?q=80&w=400&auto=format&fit=crop",
    category: "bath & body",
  },
  {
    id: "ce-facewash",
    title: "Himalaya Neem Face Wash",
    price: 140,
    image:
      "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=400&auto=format&fit=crop",
    category: "skin care",
  },
  {
    id: "ce-sunscreen",
    title: "Minimalist SPF 50 Sunscreen",
    price: 395,
    image:
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?q=80&w=400&auto=format&fit=crop",
    category: "skin care",
  },

  // â”€â”€â”€ Hair Care & Grooming â”€â”€â”€
  {
    id: "ce-shampoo",
    title: "Head & Shoulders Shampoo (340ml)",
    price: 245,
    image:
      "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?q=80&w=400&auto=format&fit=crop",
    category: "hair care",
  },
  {
    id: "ce-razor",
    title: "Gillette Mach3 Razor",
    price: 299,
    image:
      "https://images.unsplash.com/photo-1589363460779-e59fbba1dc92?q=80&w=400&auto=format&fit=crop",
    category: "grooming",
  },
  {
    id: "ce-trimmer",
    title: "Philips Grooming Trimmer",
    price: 1199,
    image:
      "https://images.unsplash.com/photo-1583095066606-258055628ed4?q=80&w=400&auto=format&fit=crop",
    category: "grooming",
    badge: "Premium",
  },

  // â”€â”€â”€ Hygiene & Freshness â”€â”€â”€
  {
    id: "ce-deodorant",
    title: "Nivea Fresh Active Deodorant",
    price: 199,
    image:
      "https://images.unsplash.com/photo-1599305090598-fe179d501227?q=80&w=400&auto=format&fit=crop",
    category: "freshness",
    badge: "Popular",
  },
  {
    id: "ce-sanitizer",
    title: "Dettol Hand Sanitizer (200ml)",
    price: 99,
    image:
      "https://images.unsplash.com/photo-1584467735815-f778f274e296?q=80&w=400&auto=format&fit=crop",
    category: "hygiene",
  },
  {
    id: "ce-wipes",
    title: "Wet Wipes (Pack of 80)",
    price: 120,
    image:
      "https://images.unsplash.com/photo-1616422285623-1d4ac7d0d0ff?q=80&w=400&auto=format&fit=crop",
    category: "hygiene",
  },
  {
    id: "ce-detergent",
    title: "Surf Excel Liquid Detergent (1L)",
    price: 210,
    image:
      "https://images.unsplash.com/photo-1610557889373-c8270c1dd3bd?q=80&w=400&auto=format&fit=crop",
    category: "clothing care",
  },
];
