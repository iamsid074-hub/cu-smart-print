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
        id: "grocery-coke",
        name: "Coca-Cola",
        quantity: "400ml",
        price: 20,
        image: "/grocery/coca-cola.png",
        category: "Cold Drinks"
    },
    {
        id: "grocery-sprite",
        name: "Sprite",
        quantity: "400ml",
        price: 20,
        image: "/grocery/sprite.png",
        category: "Cold Drinks"
    },
    {
        id: "grocery-fanta",
        name: "Fanta",
        quantity: "400ml",
        price: 20,
        image: "/grocery/fanta.png",
        category: "Cold Drinks"
    },
    {
        id: "grocery-mountain-dew",
        name: "Mountain Dew",
        quantity: "400ml",
        price: 20,
        image: "/grocery/mountain-dew.png",
        category: "Cold Drinks"
    },
    {
        id: "grocery-maggi-single",
        name: "Maggi Instant Noodles",
        quantity: "Single Pack",
        price: 10,
        image: "/grocery/maggi.png",
        category: "Instant Food"
    },
    {
        id: "grocery-lays-blue",
        name: "Lay's India's Magic Masala",
        quantity: "Standard Pack",
        price: 25,
        image: "/grocery/lays-blue.png",
        category: "Snacks"
    },
    {
        id: "grocery-kurkure",
        name: "Kurkure Masala Munch",
        quantity: "Standard Pack",
        price: 25,
        image: "/grocery/kurkure.png",
        category: "Snacks"
    },
    {
        id: "grocery-donut",
        name: "Fresh Chocolate Donut",
        quantity: "1 Piece",
        price: 20,
        image: "/grocery/donut.png",
        category: "Bakery Snack"
    }
];
