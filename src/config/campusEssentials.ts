// ─── Campus Essentials — Static Product Config ─────────────────────────────────
// These products are admin-controlled and not user-uploaded.
// When ordered, seller_id is set to ADMIN_SELLER_ID so orders appear in the Admin panel.

// ⚠️ IMPORTANT: Replace this with your actual Supabase admin user UUID
// Find it in: Supabase Dashboard → Authentication → Users → copy your admin UUID
export const ADMIN_SELLER_ID = "7450c873-f51d-469e-a33d-c44ca80beb0c"; // ← REPLACE THIS

export interface CampusEssentialItem {
    id: string;
    title: string;
    price: number;
    image: string;
    category: "practical" | "notebook" | "stationery";
    badge?: string;
}

export const campusEssentials: CampusEssentialItem[] = [
    // ─── Practical Items ───
    {
        id: "ce-practical-file",
        title: "Practical File (100 pages)",
        price: 60,
        image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=400&auto=format&fit=crop",
        category: "practical",
        badge: "Popular",
    },

    // ─── Notebooks ───
    {
        id: "ce-notebook-50",
        title: "Notebook (Register)",
        price: 50,
        image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?q=80&w=400&auto=format&fit=crop",
        category: "notebook",
    },
    {
        id: "ce-notebook-70",
        title: "Notebook (Long)",
        price: 70,
        image: "https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=400&auto=format&fit=crop",
        category: "notebook",
    },
    {
        id: "ce-notebook-100",
        title: "Ruled Notebook A4",
        price: 100,
        image: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=400&auto=format&fit=crop",
        category: "notebook",
    },
    {
        id: "ce-spiral-120",
        title: "Spiral Notebook A4",
        price: 120,
        image: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=400&auto=format&fit=crop",
        category: "notebook",
        badge: "Best Seller",
    },

    // ─── Stationery ───
    {
        id: "ce-pen-10",
        title: "Ball Pen (Blue)",
        price: 10,
        image: "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?q=80&w=400&auto=format&fit=crop",
        category: "stationery",
    },
    {
        id: "ce-pen-20",
        title: "Gel Pen (Black)",
        price: 20,
        image: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?q=80&w=400&auto=format&fit=crop",
        category: "stationery",
    },
    {
        id: "ce-calculator",
        title: "Scientific Calculator",
        price: 350,
        image: "https://images.unsplash.com/photo-1564466809058-bf4114d55352?q=80&w=400&auto=format&fit=crop",
        category: "stationery",
        badge: "Essential",
    },
];
