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
        price: 50,
        // CU practical notebook (user-provided image)
        image: "/practical-file.jpg",
        category: "practical",
        badge: "Popular",
    },

    // ─── Notebooks ───
    {
        id: "ce-notebook-50",
        title: "Notebook (Register)",
        price: 50,
        // open notebook on desk
        image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?q=80&w=400&auto=format&fit=crop",
        category: "notebook",
    },
    {
        id: "ce-notebook-70",
        title: "Notebook (Long)",
        price: 70,
        // classmate notebook (user-provided image)
        image: "/notebook-70.png",
        category: "notebook",
    },
    {
        id: "ce-notebook-100",
        title: "Ruled Notebook A4",
        price: 100,
        // classmate flamingo notebook (user-provided image)
        image: "/notebook-100.png",
        category: "notebook",
    },
    {
        id: "ce-spiral-120",
        title: "Spiral Notebook A4",
        price: 120,
        // unigo spiral notebook (user-provided image)
        image: "/spiral-notebook.png",
        category: "notebook",
        badge: "Best Seller",
    },

    // ─── Stationery ───
    {
        id: "ce-pen-10",
        title: "Ball Pen (Blue)",
        price: 10,
        // ballpoint pens close-up
        image: "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?q=80&w=400&auto=format&fit=crop",
        category: "stationery",
    },
    {
        id: "ce-pen-20",
        title: "Gel Pen (Black)",
        price: 20,
        // hauser XO gel pen (user-provided image)
        image: "/gel-pen-black.png",
        category: "stationery",
    },
    {
        id: "ce-calculator",
        title: "Scientific Calculator",
        price: 350,
        // scientific calculator (user-provided image)
        image: "/calculator.png",
        category: "stationery",
        badge: "Essential",
    },
];
