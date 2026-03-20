// ─── Campus Food Shop Menus ────────────────────────────────────────────────────
// Transcribed from real shop menus on campus.

export interface MenuItem {
    name: string;
    price: number; // lowest price if range
}

export interface MenuCategory {
    category: string;
    items: MenuItem[];
}

export interface Shop {
    id: string;
    name: string;
    tag: string; // short description
    veg: boolean; // pure-veg flag
    categories: MenuCategory[];
}

export const shops: Shop[] = [
    // ═══════════════════════════════════════════════════════════════════════════════
    // 0. CHATORI CHAI & KULCHA CORNER  ⭐ FEATURED LIVE SALE SHOP
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        id: "chatori-chai-kulcha",
        name: "Chatori Chaat & Kulcha Corner",
        tag: "Chaat \u2022 Kulcha \u2022 Snacks \u2022 Only \u20B916 Delivery",
        veg: false,
        categories: [
            {
                category: "Indian Masala Paranthas",
                items: [
                    { name: "Aloo Parantha", price: 25 },
                    { name: "Pyazz Parantha", price: 30 },
                    { name: "Aloo Pyazz Parantha", price: 35 },
                    { name: "Gobhi Parantha", price: 35 },
                    { name: "Paneer Parantha", price: 45 },
                    { name: "2 Aloo Parantha + Dahi", price: 70 },
                ],
            },
            {
                category: "Chowmien Delight",
                items: [
                    { name: "Veg Chowmien", price: 60 },
                    { name: "Chilli Garlic Chowmien", price: 70 },
                    { name: "Singapuri Noodles", price: 80 },
                    { name: "Paneer Noodles", price: 80 },
                    { name: "Schezwan Noodles", price: 80 },
                    { name: "Paneer + Schezwan Hakka Noodles", price: 90 },
                    { name: "Chicken Noodles", price: 90 },
                ],
            },
            {
                category: "Rolls",
                items: [
                    { name: "Noodles Roll", price: 40 },
                    { name: "Egg Rolls", price: 30 },
                    { name: "Aloo Rolls", price: 40 },
                    { name: "Veg Rolls", price: 50 },
                    { name: "Paneer Rolls", price: 60 },
                    { name: "KFC Paneer Rolls", price: 70 },
                    { name: "Chicken Rolls", price: 80 },
                    { name: "Kathi Rolls", price: 90 },
                    { name: "Spl. KFC Chicken Rolls", price: 100 },
                ],
            },
            {
                category: "Wraps Swaps",
                items: [
                    { name: "Egg Wrap", price: 50 },
                    { name: "Aloo Wrap", price: 40 },
                    { name: "Chicken Wrap", price: 80 },
                    { name: "Veg Wrap", price: 50 },
                    { name: "Paneer Wrap", price: 60 },
                    { name: "Soya Chunks Wrap", price: 90 },
                ],
            },
            {
                category: "Italian",
                items: [
                    { name: "White Sauce Pasta", price: 80 },
                    { name: "Red Sauce Pasta", price: 80 },
                    { name: "Makhni Pasta", price: 90 },
                    { name: "Schezwan Pasta", price: 90 },
                    { name: "Mix Sauce Pasta", price: 110 },
                    { name: "Chicken Pasta", price: 110 },
                ],
            },
            {
                category: "Soup",
                items: [
                    { name: "Veg Soup", price: 40 },
                    { name: "Tomato Soup", price: 40 },
                    { name: "Chicken Soup", price: 50 },
                ],
            },
            {
                category: "Pahado Wali Maggi",
                items: [
                    { name: "Simple Maggi", price: 30 },
                    { name: "Masala Maggi", price: 35 },
                    { name: "Veggie Maggi", price: 40 },
                    { name: "Chilly Maggi", price: 50 },
                    { name: "Paneer Maggi", price: 50 },
                ],
            },
            {
                category: "Snacks",
                items: [
                    { name: "Spring Rolls", price: 60 },
                    { name: "Veg Bullets", price: 60 },
                    { name: "Manchurian Dry", price: 70 },
                    { name: "Honey Chilli Potato", price: 80 },
                    { name: "Honey Chilli Cauliflower", price: 80 },
                    { name: "Manchurian Gravy", price: 90 },
                    { name: "Gobhi Manchurian", price: 90 },
                    { name: "Chicken Lollipop", price: 110 },
                    { name: "Chilli Paneer", price: 120 },
                    { name: "Chicken Chilli", price: 160 },
                ],
            },
            {
                category: "Burger",
                items: [
                    { name: "Aloo Tikki Burger", price: 40 },
                    { name: "Noodles Burger", price: 50 },
                    { name: "Cheese Burger", price: 60 },
                    { name: "Double Tikki Burger", price: 60 },
                    { name: "Veg Cheese Burger", price: 70 },
                    { name: "Paneer Tikki Burger", price: 70 },
                    { name: "Chicken Burger", price: 80 },
                    { name: "Spl. Makhni Burger", price: 80 },
                    { name: "Mexican Burger", price: 90 },
                ],
            },
            {
                category: "Bombay Bites",
                items: [
                    { name: "Mumbai Asala Vada Pav", price: 35 },
                    { name: "Onion Vada Pav", price: 35 },
                    { name: "Schezwan Vada Pav", price: 40 },
                    { name: "Cheese Vada Pav", price: 50 },
                    { name: "Samosa", price: 15 },
                    { name: "Samosa With Channa", price: 35 },
                    { name: "Kachori With Sabzi", price: 30 },
                    { name: "Chole Bhature", price: 70 },
                    { name: "Pav Bhaji", price: 80 },
                ],
            },
            {
                category: "Chaat",
                items: [
                    { name: "Pani Puri (6 Pc)", price: 30 },
                    { name: "Stuffed Golgappe (5pc)", price: 40 },
                    { name: "Bhel Puri", price: 40 },
                    { name: "Aloo Tikki", price: 50 },
                    { name: "Papri Chaat", price: 50 },
                    { name: "Papri Bhalla Chaat", price: 60 },
                    { name: "Dahi Bhalla Chaat", price: 60 },
                ],
            },
            {
                category: "Frites Frenzy",
                items: [
                    { name: "Salted Fries", price: 50 },
                    { name: "Indian Masala Fries", price: 60 },
                    { name: "Peri Peri Fries", price: 70 },
                    { name: "Cheesy Fries", price: 70 },
                    { name: "Makhni Fries", price: 80 },
                    { name: "Honey Chilli Fries", price: 80 },
                    { name: "Mexican Fries", price: 80 },
                ],
            },
            {
                category: "Zenwich Zone (Sandwich)",
                items: [
                    { name: "Aloo Sandwich", price: 50 },
                    { name: "Veg Sandwich", price: 50 },
                    { name: "Corn Sandwich", price: 50 },
                    { name: "Veg Grilled Sandwich", price: 60 },
                    { name: "Spicy Makhni Twist", price: 70 },
                    { name: "Paneer Grilled Sandwich", price: 70 },
                    { name: "Jumbo Grilled Sandwich", price: 90 },
                    { name: "Chicken Sandwich", price: 100 },
                ],
            },
            {
                category: "Crispy Kulcha",
                items: [
                    { name: "Desi Punjabi Kulcha", price: 30 },
                    { name: "Chana Aloo Kulcha", price: 30 },
                    { name: "Nutri Keema Kulcha", price: 40 },
                    { name: "Cheese Kulcha", price: 60 },
                    { name: "Paneer Kulcha", price: 60 },
                    { name: "Egg Kulcha", price: 60 },
                    { name: "Egg Kulcha With Cheese", price: 70 },
                    { name: "Chicken Keema Kulcha", price: 100 },
                ],
            },
            {
                category: "Steamed Sensation (Momos & Corn)",
                items: [
                    { name: "Sweet Corn Salted", price: 40 },
                    { name: "Masala Sweet Corn", price: 50 },
                    { name: "Cheesy Sweet Corn", price: 60 },
                    { name: "Veg Momos", price: 60 },
                    { name: "Fried Momos", price: 60 },
                    { name: "Kurkure Momos", price: 80 },
                    { name: "Afghani Momos", price: 80 },
                    { name: "Chicken Momos", price: 90 },
                    { name: "Fried Chicken Momos", price: 100 },
                ],
            },
            {
                category: "Rice Mania",
                items: [
                    { name: "Veg Fried Rice", price: 60 },
                    { name: "Paneer Fried Rice", price: 80 },
                    { name: "Mattar Rice Pulao", price: 80 },
                    { name: "Veg Pulao", price: 80 },
                    { name: "Egg Fried Rice", price: 110 },
                    { name: "Veg Biryani", price: 110 },
                    { name: "Chicken Fried Rice", price: 130 },
                    { name: "Chicken Biryani", price: 150 },
                ],
            },
            {
                category: "Rice Combo",
                items: [
                    { name: "Rajma Chawal", price: 55 },
                    { name: "Chole Chawal", price: 55 },
                    { name: "Kadhi Chawal", price: 55 },
                    { name: "Dal Chawal", price: 60 },
                    { name: "Paneer Chawal", price: 80 },
                ],
            },
            {
                category: "Indian Combo",
                items: [
                    { name: "2 Butter Roti+Rajmaa", price: 70 },
                    { name: "2 Butter Roti+Chole", price: 70 },
                    { name: "2 Butter Roti+Dal Makhni", price: 80 },
                    { name: "2 Butter Roti+Paneer Gravy", price: 90 },
                    { name: "Veg Thali", price: 90 },
                    { name: "Paneer Thali", price: 110 },
                ],
            },
            {
                category: "Stufy Saver Combos",
                items: [
                    { name: "Sandwich + Coke + Burger", price: 100 },
                    { name: "2 Burger + Coke + Fries", price: 120 },
                    { name: "2 Plate Vada Pav + Coke", price: 130 },
                    { name: "Fried Rice + Manchuria + Coke", price: 155 },
                ],
            },
            {
                category: "Beverages",
                items: [
                    { name: "Tea", price: 15 },
                    { name: "Coffee", price: 30 },
                    { name: "Milk/Bournvita", price: 30 },
                    { name: "Cappuccino", price: 35 },
                    { name: "Nimbu Pani", price: 35 },
                    { name: "Masala Lime Soda", price: 40 },
                    { name: "Mojito", price: 40 },
                    { name: "Cold Coffee", price: 70 },
                    { name: "Chocolate Shake", price: 70 },
                    { name: "Strawberry Shake", price: 70 },
                    { name: "Butterscotch Shake", price: 70 },
                    { name: "Banana Shake", price: 60 },
                    { name: "Oreo Shake", price: 80 },
                    { name: "Kitkat Shake", price: 80 },
                    { name: "Vanilla Shake", price: 80 },
                    { name: "Mango Shake", price: 80 },
                    { name: "Hazelnut Coffee", price: 80 },
                    { name: "Caramel Coffee", price: 80 },
                ],
            },
            {
                category: "Omelette & Patties",
                items: [
                    { name: "Boiled Egg", price: 15 },
                    { name: "Omelette", price: 35 },
                    { name: "2 Egg Bhurji", price: 35 },
                    { name: "Bread Omelette", price: 45 },
                    { name: "Bread Omelette With Cheese", price: 55 },
                    { name: "Bread Pakora", price: 20 },
                    { name: "Veg Patties", price: 20 },
                    { name: "Veg Patties with Cheese", price: 30 },
                    { name: "Paneer Patties", price: 30 },
                    { name: "Chicken Patties", price: 50 },
                    { name: "Brownie", price: 50 },
                    { name: "Brownie with Ice Cream", price: 60 },
                    { name: "Sizzling Brownie", price: 80 },
                ],
            },
        ],
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // 1. INSTA FOOD
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        id: "insta-food",
        name: "Insta Food",
        tag: "Multi-cuisine • Juice • Shakes",
        veg: false,
        categories: [
            {
                category: "Juice",
                items: [
                    { name: "Mix Juice", price: 70 },
                    { name: "Pineapple Juice", price: 70 },
                    { name: "Mausambi Juice", price: 70 },
                    { name: "Orange Juice", price: 70 },
                    { name: "Beetroot Juice", price: 60 },
                    { name: "Watermelon Juice", price: 60 },
                    { name: "Carrot Juice", price: 70 },
                ],
            },
            {
                category: "Lassi",
                items: [
                    { name: "Sweet Lassi", price: 50 },
                    { name: "Mango Lassi", price: 50 },
                    { name: "Strawberry Lassi", price: 60 },
                    { name: "Namkeen Lassi", price: 50 },
                    { name: "Chocolate Lassi", price: 60 },
                    { name: "Rose Lassi", price: 50 },
                ],
            },
            {
                category: "Shakes",
                items: [
                    { name: "Banana Shake", price: 50 },
                    { name: "Papaya Shake", price: 50 },
                    { name: "Mango Shake", price: 60 },
                    { name: "Chiku Shake", price: 60 },
                    { name: "Oreo Shake", price: 60 },
                    { name: "Butterscotch Shake", price: 60 },
                    { name: "Kit Kat Shake", price: 60 },
                    { name: "Black Current Shake", price: 60 },
                    { name: "Kiwi Shake", price: 60 },
                    { name: "Vanilla Shake", price: 50 },
                    { name: "Caramel Shake", price: 50 },
                    { name: "Guava Shake", price: 50 },
                    { name: "Blue Berry Shake", price: 60 },
                    { name: "Bourbon Shake", price: 60 },
                    { name: "Strawberry Shake", price: 60 },
                    { name: "Chocolate Shake", price: 60 },
                    { name: "Nutella Shake", price: 90 },
                    { name: "Peanut Butter Shake", price: 80 },
                    { name: "Grapes Shake", price: 60 },
                    { name: "Pineapple Shake", price: 60 },
                    { name: "Munch Shake", price: 70 },
                    { name: "Oreo Caramel Shake", price: 80 },
                    { name: "Apple Shake", price: 50 },
                    { name: "Cold Coffee", price: 50 },
                ],
            },
            {
                category: "Maggi",
                items: [
                    { name: "Masala Maggi", price: 30 },
                    { name: "Veg Maggi", price: 40 },
                    { name: "Paneer Maggi", price: 50 },
                    { name: "Cheese Maggi", price: 50 },
                    { name: "Egg Maggi", price: 50 },
                    { name: "Chicken Maggi", price: 60 },
                ],
            },
            {
                category: "Mojito",
                items: [
                    { name: "Green Apple Mojito", price: 50 },
                    { name: "Blue Curacao Mojito", price: 50 },
                    { name: "Watermelon Mojito", price: 50 },
                    { name: "Kala Khatta Mojito", price: 50 },
                    { name: "Virgin Mojito", price: 50 },
                    { name: "Mint Mojito", price: 50 },
                    { name: "Jeera Shikanji", price: 30 },
                    { name: "Nimbu Pani", price: 30 },
                    { name: "Fresh Lime Soda", price: 40 },
                ],
            },
            {
                category: "Burger",
                items: [
                    { name: "Aloo Tikki Burger", price: 40 },
                    { name: "Veg Burger", price: 50 },
                    { name: "Veg Cheese Burger", price: 60 },
                    { name: "Paneer Tikka Burger", price: 60 },
                    { name: "Noodles Burger", price: 50 },
                    { name: "Chicken Burger", price: 70 },
                    { name: "Chicken Cheese Burger", price: 80 },
                    { name: "Egg Burger", price: 50 },
                    { name: "Egg Cheese Burger", price: 50 },
                ],
            },
            {
                category: "Sandwich",
                items: [
                    { name: "Veg Sandwich", price: 40 },
                    { name: "Veg Grilled Sandwich", price: 50 },
                    { name: "Veg Cheese Sandwich", price: 50 },
                    { name: "Aloo Sandwich", price: 50 },
                    { name: "Aloo Cheese Sandwich", price: 60 },
                    { name: "Mojrela Sandwich", price: 60 },
                    { name: "Corn Sandwich", price: 60 },
                    { name: "Chicken Sandwich", price: 75 },
                    { name: "Egg Sandwich", price: 50 },
                    { name: "Paneer Sandwich", price: 60 },
                    { name: "Egg Cheese Sandwich", price: 70 },
                    { name: "Paneer Tikka Sandwich", price: 70 },
                ],
            },
            {
                category: "Pasta",
                items: [
                    { name: "White Sauce Pasta", price: 70 },
                    { name: "Makhani Pasta", price: 70 },
                    { name: "Red Sauce Pasta", price: 70 },
                    { name: "Mix Sauce Pasta", price: 90 },
                    { name: "Chicken Pasta", price: 100 },
                ],
            },
            {
                category: "Wrap",
                items: [
                    { name: "Aloo Tikki Wrap", price: 50 },
                    { name: "Veg Wrap", price: 60 },
                    { name: "Paneer Wrap", price: 70 },
                    { name: "Chicken Wrap", price: 80 },
                ],
            },
            {
                category: "Momos",
                items: [
                    { name: "Steam Momos", price: 50 },
                    { name: "Veg Fried Momos", price: 60 },
                    { name: "Kukure Momos", price: 70 },
                ],
            },
            {
                category: "Noodles",
                items: [
                    { name: "Veg Noodles", price: 60 },
                    { name: "Paneer Noodles", price: 70 },
                    { name: "Egg Noodles", price: 70 },
                    { name: "Chilly Garlic Noodles", price: 70 },
                    { name: "Schezwan Noodles", price: 70 },
                    { name: "Chicken Noodles", price: 80 },
                    { name: "Hakka Noodles", price: 60 },
                    { name: "Mushroom Noodles", price: 70 },
                    { name: "Soya Noodles", price: 60 },
                    { name: "Singapuri Noodles", price: 70 },
                ],
            },
            {
                category: "Fries",
                items: [
                    { name: "Salty Fries", price: 60 },
                    { name: "Masala Fries", price: 70 },
                    { name: "Peri Peri Fries", price: 80 },
                    { name: "Cheesy Fries", price: 80 },
                    { name: "Chilly Potato", price: 80 },
                    { name: "Honey Chilli Potato", price: 80 },
                    { name: "Potato Twister", price: 40 },
                    { name: "Peri Peri Twister", price: 50 },
                    { name: "Cheese Twister", price: 50 },
                ],
            },
            {
                category: "Roll",
                items: [
                    { name: "Spring Roll", price: 60 },
                    { name: "Single Egg Roll", price: 40 },
                    { name: "Double Egg Roll", price: 60 },
                    { name: "Veg Roll", price: 50 },
                    { name: "Paneer Roll", price: 60 },
                    { name: "Chicken Roll", price: 70 },
                    { name: "Noodles Roll", price: 60 },
                    { name: "Cheese Noodles", price: 70 },
                    { name: "Soya Chaap Roll", price: 60 },
                    { name: "Egg Chicken Roll", price: 80 },
                    { name: "Egg Paneer Roll", price: 70 },
                    { name: "Double Egg Double Chicken", price: 130 },
                    { name: "Double Egg Double Paneer", price: 100 },
                    { name: "Chicken Cheese Roll", price: 90 },
                    { name: "Paneer Kathi Roll", price: 90 },
                ],
            },
            {
                category: "Meals",
                items: [
                    { name: "Rajma Rice", price: 60 },
                    { name: "Fried Rice", price: 60 },
                    { name: "Chilly Garlic Rice", price: 70 },
                    { name: "Paneer Fried Rice", price: 80 },
                    { name: "Chicken Rice", price: 80 },
                    { name: "Egg Rice", price: 70 },
                    { name: "Chicken Seekh Kabab", price: 60 },
                    { name: "Chicken Lollypop", price: 110 },
                    { name: "Mutton Seekh Kabab", price: 80 },
                    { name: "Veg Bullet", price: 60 },
                    { name: "Chicken Bullet", price: 80 },
                    { name: "Veg Manchurian Rice", price: 70 },
                    { name: "Chicken Manchurian", price: 90 },
                ],
            },
            {
                category: "Patties",
                items: [
                    { name: "Aloo Patties", price: 20 },
                    { name: "Aloo Vada Cheese", price: 50 },
                    { name: "Paneer Patties", price: 25 },
                    { name: "Pasta Patties", price: 25 },
                    { name: "Veg Cheese Patties", price: 30 },
                    { name: "Egg Patties", price: 25 },
                    { name: "Egg Cheese Patties", price: 30 },
                    { name: "Chicken Patties", price: 30 },
                ],
            },
            {
                category: "Tea & Coffee",
                items: [
                    { name: "Tea", price: 15 },
                    { name: "Special Tea", price: 20 },
                    { name: "Lemon Tea", price: 20 },
                    { name: "Hot Coffee", price: 25 },
                    { name: "Black Coffee", price: 25 },
                    { name: "Hot Chocolate", price: 30 },
                    { name: "Hot Milk", price: 30 },
                    { name: "Bourn Vita", price: 35 },
                ],
            },
            {
                category: "Omelette",
                items: [
                    { name: "Single Bread Omelette", price: 30 },
                    { name: "Double Bread Omelette", price: 40 },
                    { name: "4 Egg Bhurji", price: 60 },
                    { name: "Half Fry", price: 20 },
                    { name: "Paneer Bhurji", price: 80 },
                    { name: "2 Boiled Egg", price: 25 },
                ],
            },
            {
                category: "Salad",
                items: [
                    { name: "Fruit Chaat", price: 70 },
                    { name: "Banana Chaat", price: 70 },
                    { name: "Papaya Chaat", price: 80 },
                    { name: "Pineapple Chaat", price: 100 },
                    { name: "Green Salad", price: 50 },
                    { name: "Mix Vegetable Salad", price: 80 },
                ],
            },
            {
                category: "Soup",
                items: [
                    { name: "Veg Soup", price: 30 },
                    { name: "Tomato Soup", price: 30 },
                    { name: "Egg Soup", price: 40 },
                    { name: "Chicken Soup", price: 50 },
                ],
            },
            {
                category: "Corns",
                items: [
                    { name: "Masala Sweet Corn", price: 40 },
                    { name: "Chilli Garlic Corn", price: 50 },
                ],
            },
        ],
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // 2. PARANTHA HOUSE
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        id: "parantha-house",
        name: "Parantha House",
        tag: "Paranthas • Snacks • Rolls",
        veg: false,
        categories: [
            {
                category: "Parantha's",
                items: [
                    { name: "Aloo Parantha (2 Pcs)", price: 40 },
                    { name: "Paneer Parantha (2 Pcs)", price: 50 },
                    { name: "Gobhi Parantha (2 Pcs)", price: 50 },
                    { name: "Multi Parantha (2 Pcs)", price: 40 },
                    { name: "Chilli Cheese Parantha (2 Pcs)", price: 50 },
                    { name: "Methi Parantha (2 Pcs)", price: 50 },
                    { name: "Mix Veg Parantha (2 Pcs)", price: 50 },
                    { name: "Plain Parantha (2 Pcs)", price: 30 },
                    { name: "Ajwain Parantha (2 Pcs)", price: 40 },
                    { name: "Double Egg Parantha (2 Pcs)", price: 60 },
                    { name: "Mughlai Parantha (2 Pcs)", price: 60 },
                    { name: "Sugar Parantha (2 Pcs)", price: 40 },
                    { name: "Masala Parantha (2 Pcs)", price: 50 },
                    { name: "Chicken Parantha (1 Pc)", price: 50 },
                    { name: "Egg Parantha (2 Pcs)", price: 40 },
                    { name: "Jeerra Parantha (2 Pcs)", price: 50 },
                    { name: "Malabar Parantha (2 Pcs)", price: 50 },
                    { name: "Dry Fruit Parantha (1 Pc)", price: 80 },
                ],
            },
            {
                category: "Snacks",
                items: [
                    { name: "Egg Chaat", price: 30 },
                    { name: "Egg Burji", price: 25 },
                    { name: "Half Fry (2 Eggs)", price: 25 },
                    { name: "Crispy Egg (1 Pc)", price: 15 },
                    { name: "Egg Omelette (3 Pcs)", price: 35 },
                    { name: "Egg Sandwich", price: 45 },
                    { name: "Egg Cheese Sandwich", price: 55 },
                    { name: "Veg Sandwich", price: 40 },
                    { name: "Veg Cheese Sandwich", price: 50 },
                    { name: "Paneer Sandwich", price: 70 },
                    { name: "Tummy Yummy Chili Eggs", price: 40 },
                    { name: "Egg Onion Fry", price: 30 },
                    { name: "Egg Capsicum Fry", price: 30 },
                    { name: "Egg Crispy Fry (2 Pcs)", price: 30 },
                    { name: "Boiled Egg (2 Pcs)", price: 20 },
                    { name: "Egg Noodles", price: 40 },
                    { name: "Veg Noodles", price: 40 },
                    { name: "Paneer Noodles", price: 60 },
                    { name: "Garlic Noodles", price: 50 },
                    { name: "Egg Manchurian", price: 50 },
                    { name: "Veg Manchurian", price: 50 },
                    { name: "Veg Pasta", price: 60 },
                    { name: "Chicken Pasta", price: 90 },
                    { name: "Egg Kulcha", price: 50 },
                    { name: "Veg Kulcha", price: 50 },
                    { name: "Chicken Kulcha", price: 70 },
                    { name: "Egg Patties", price: 30 },
                    { name: "Aloo Patties", price: 20 },
                    { name: "Paneer Patties", price: 20 },
                    { name: "Chilli Cheese Patties", price: 25 },
                    { name: "Corn Patties", price: 25 },
                    { name: "Chicken Patties", price: 40 },
                ],
            },
            {
                category: "Burger",
                items: [
                    { name: "Egg Cheese Burger", price: 40 },
                    { name: "Chicken Cheese Burger", price: 40 },
                    { name: "Veg Cheese Burger", price: 30 },
                    { name: "Handi Omelette", price: 50 },
                ],
            },
            {
                category: "Soup",
                items: [
                    { name: "Veg Soup", price: 20 },
                    { name: "Chicken Soup", price: 30 },
                    { name: "Egg Soup", price: 20 },
                ],
            },
            {
                category: "Continental Food",
                items: [
                    { name: "Veg Hot Dog", price: 30 },
                    { name: "Egg Hot Dog", price: 40 },
                    { name: "Chicken Hot Dog", price: 50 },
                    { name: "Chicken Noodles", price: 80 },
                    { name: "Chicken Rice", price: 80 },
                    { name: "Plain Maggie", price: 20 },
                    { name: "Veg Maggie", price: 30 },
                    { name: "Paneer Maggie", price: 40 },
                    { name: "Chicken Maggie", price: 50 },
                    { name: "French Fries", price: 50 },
                    { name: "Masala Fries", price: 60 },
                    { name: "Peri Peri Fries", price: 70 },
                    { name: "Veg Spring Roll", price: 50 },
                    { name: "Veg Momos", price: 40 },
                    { name: "Veg Nuggets", price: 40 },
                    { name: "Fried Momos", price: 60 },
                    { name: "Chicken Momos", price: 70 },
                    { name: "Chicken Fried Momos", price: 80 },
                    { name: "Tandoori Momos", price: 100 },
                    { name: "Paneer Burji", price: 70 },
                    { name: "Chilli Paneer", price: 110 },
                    { name: "Chilli Mushroom", price: 100 },
                    { name: "Crispy Corn", price: 70 },
                ],
            },
            {
                category: "Roll",
                items: [
                    { name: "Double Egg Roll", price: 40 },
                    { name: "Double Egg Noodles Roll", price: 80 },
                    { name: "Chicken Egg Roll", price: 70 },
                    { name: "Chicken Double Egg Roll", price: 90 },
                    { name: "Chicken Kabab Roll", price: 90 },
                    { name: "Chicken Noodles Roll", price: 90 },
                    { name: "Chaap Roll", price: 60 },
                    { name: "Veg Roll", price: 50 },
                    { name: "Paneer Roll", price: 70 },
                ],
            },
            {
                category: "The Curry House",
                items: [
                    { name: "Egg Masala (2 Pcs)", price: 60 },
                    { name: "Egg Korma (2 Pcs)", price: 50 },
                    { name: "Egg Curry (2 Pcs)", price: 60 },
                    { name: "Egg Paneer Burji", price: 60 },
                    { name: "Punjabi Egg Curry", price: 60 },
                    { name: "Egg Butter Masala", price: 70 },
                ],
            },
            {
                category: "Chai Ki Chuski",
                items: [
                    { name: "Masala Chai", price: 15 },
                    { name: "Tandoori Chai", price: 25 },
                    { name: "Rajwari Chai", price: 20 },
                    { name: "Ice Tea", price: 25 },
                    { name: "Green Tea", price: 15 },
                ],
            },
            {
                category: "Drinks & Shakes",
                items: [
                    { name: "Hot Coffee", price: 30 },
                    { name: "Cold Coffee", price: 30 },
                    { name: "Lime Soda", price: 20 },
                    { name: "Nimbu Pani", price: 15 },
                    { name: "Jaljeera", price: 10 },
                    { name: "Mango Shake", price: 40 },
                    { name: "Banana Shake", price: 40 },
                    { name: "Oreo Shake", price: 40 },
                ],
            },
        ],
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // 3. PUNJABI RASOI (100% Vegetarian)
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        id: "punjabi-rasoi",
        name: "Punjabi Rasoi",
        tag: "100% Veg • North Indian • Pizza",
        veg: true,
        categories: [
            {
                category: "Burger",
                items: [
                    { name: "Veg Burger", price: 50 },
                    { name: "Delight Burger", price: 60 },
                    { name: "Spicy Paneer Burger", price: 70 },
                    { name: "Noodle Burger", price: 60 },
                    { name: "Cheese Burger", price: 60 },
                    { name: "Special Burger", price: 70 },
                ],
            },
            {
                category: "Sandwich",
                items: [
                    { name: "Veg Sandwich", price: 60 },
                    { name: "Spicy Grilled", price: 60 },
                    { name: "Mushroom Grilled", price: 70 },
                    { name: "Special Paneer Bust", price: 80 },
                    { name: "Cheese Bust", price: 70 },
                ],
            },
            {
                category: "Cake & Pastry",
                items: [
                    { name: "Half Kg Cake", price: 300 },
                    { name: "Brownie", price: 60 },
                    { name: "Choco Lava", price: 50 },
                    { name: "Truffle Pastry", price: 50 },
                    { name: "Pudding Cup", price: 50 },
                ],
            },
            {
                category: "Wraps",
                items: [
                    { name: "Veg Wrap", price: 70 },
                    { name: "Cheese Wrap", price: 80 },
                    { name: "Paneer Wrap", price: 80 },
                ],
            },
            {
                category: "Noodles",
                items: [
                    { name: "Veg Noodles", price: 70 },
                    { name: "Chilli Garlic Noodles", price: 90 },
                    { name: "Singapuri Noodles", price: 90 },
                    { name: "Hakka Noodles", price: 90 },
                    { name: "Paneer Noodles", price: 90 },
                ],
            },
            {
                category: "Rolls",
                items: [
                    { name: "Noodles Kathi", price: 45 },
                    { name: "Soya Kathi", price: 50 },
                    { name: "Paneer Kathi", price: 80 },
                ],
            },
            {
                category: "Maggie",
                items: [
                    { name: "Veg Maggie", price: 60 },
                    { name: "Cheese Maggie", price: 70 },
                ],
            },
            {
                category: "Snacks",
                items: [
                    { name: "Veg Bullets", price: 60 },
                    { name: "Spring Rolls", price: 70 },
                    { name: "Veg Manchurian", price: 100 },
                    { name: "Chilli Paneer", price: 180 },
                ],
            },
            {
                category: "Momos",
                items: [
                    { name: "Veg Steam Momos", price: 50 },
                    { name: "Veg Fried Momos", price: 60 },
                ],
            },
            {
                category: "Kulcha & Samosa",
                items: [
                    { name: "Chana Kulcha", price: 60 },
                    { name: "Paneer Kulcha", price: 70 },
                    { name: "Amritsari Kulcha (1 Pc)", price: 60 },
                    { name: "Amritsari Kulcha (2 Pcs)", price: 110 },
                    { name: "Chana Samosa (Single)", price: 40 },
                    { name: "Chana Samosa (Double)", price: 60 },
                    { name: "Soya Chaap Kulcha", price: 80 },
                    { name: "Samosa", price: 15 },
                ],
            },
            {
                category: "Patties",
                items: [
                    { name: "Aloo Patty", price: 20 },
                    { name: "Cheese Patty", price: 30 },
                    { name: "Paneer Patty", price: 25 },
                ],
            },
            {
                category: "Shakes",
                items: [
                    { name: "Kit Kat Shake", price: 60 },
                    { name: "Oreo Shake", price: 60 },
                    { name: "Vanilla Shake", price: 50 },
                    { name: "Chocolate Shake", price: 50 },
                    { name: "Black Current Shake", price: 50 },
                    { name: "Butterscotch Shake", price: 50 },
                    { name: "Banana Shake", price: 50 },
                    { name: "Mango Shake", price: 50 },
                    { name: "Kiwi Shake", price: 60 },
                    { name: "Cold Coffee", price: 60 },
                ],
            },
            {
                category: "Pizza",
                items: [
                    { name: "Onion & Corn Pizza", price: 110 },
                    { name: "Onion & Capsicum Pizza", price: 120 },
                    { name: "Paneer & Onion Pizza", price: 150 },
                    { name: "Paneer & Capsicum Pizza", price: 150 },
                    { name: "Margarita Pizza", price: 150 },
                    { name: "Cheese & Corn Pizza", price: 140 },
                    { name: "Mix Veg Pizza", price: 170 },
                ],
            },
            {
                category: "Indian Main Course",
                items: [
                    { name: "Dal Makhni (Half)", price: 100 },
                    { name: "Dal Makhni (Full)", price: 150 },
                    { name: "Rajma", price: 100 },
                    { name: "Shahi Paneer (Half)", price: 150 },
                    { name: "Shahi Paneer (Full)", price: 200 },
                    { name: "Paneer Bhurji", price: 150 },
                    { name: "Rara Paneer", price: 150 },
                    { name: "Kadai Paneer", price: 200 },
                    { name: "Paneer Butter Masala", price: 200 },
                    { name: "Gravy Chaap", price: 120 },
                ],
            },
            {
                category: "Rice",
                items: [
                    { name: "Rajma Rice", price: 50 },
                    { name: "Chana Rice", price: 80 },
                    { name: "Kadi Rice", price: 60 },
                    { name: "Dal Makhani Rice", price: 80 },
                    { name: "Veg Fried Rice", price: 60 },
                    { name: "Paneer Fried Rice", price: 80 },
                    { name: "Paneer Gravy Rice", price: 100 },
                    { name: "Veg Biryani", price: 80 },
                    { name: "Zeera Rice", price: 50 },
                ],
            },
            {
                category: "Pasta",
                items: [
                    { name: "Red Sauce Pasta", price: 80 },
                    { name: "White Sauce Pasta", price: 80 },
                    { name: "Makhni Pasta", price: 80 },
                    { name: "Peri Peri Pasta", price: 80 },
                    { name: "Mix Sauce Pasta", price: 90 },
                ],
            },
            {
                category: "Lassi",
                items: [
                    { name: "Sweet Lassi", price: 50 },
                    { name: "Namkeen Lassi", price: 50 },
                ],
            },
            {
                category: "Coolers & Mojitos",
                items: [
                    { name: "Nimbu Pani", price: 30 },
                    { name: "Fresh Lime Soda", price: 40 },
                    { name: "Fresh Lime Masala Soda", price: 50 },
                    { name: "Virgin Mojito", price: 50 },
                    { name: "Blue Mojito", price: 60 },
                    { name: "Green Apple Mojito", price: 60 },
                    { name: "Kala Khatta Mojito", price: 60 },
                ],
            },
            {
                category: "Tea & Coffee",
                items: [
                    { name: "Ginger Tea", price: 15 },
                    { name: "Special Tea", price: 20 },
                    { name: "Hot Coffee", price: 25 },
                ],
            },
            {
                category: "Fries",
                items: [
                    { name: "Simple Fries", price: 70 },
                    { name: "Masala Fries", price: 80 },
                    { name: "Cheese Fries", price: 110 },
                    { name: "Peri Peri Fries", price: 90 },
                ],
            },
            {
                category: "Roti",
                items: [
                    { name: "Tawa Roti", price: 10 },
                    { name: "Tandoori Roti", price: 15 },
                    { name: "Laccha Paratha", price: 35 },
                    { name: "Butter Naan", price: 30 },
                ],
            },
            {
                category: "Stuffed Naan",
                items: [
                    { name: "Aloo Naan", price: 40 },
                    { name: "Gobhi Naan", price: 45 },
                    { name: "Paneer Naan", price: 50 },
                ],
            },
            {
                category: "Tandoori Paratha",
                items: [
                    { name: "Aloo Paratha", price: 40 },
                    { name: "Gobhi Paratha", price: 45 },
                    { name: "Paneer Paratha", price: 50 },
                ],
            },
            {
                category: "Choley Bhature",
                items: [
                    { name: "Choley Bhature", price: 80 },
                    { name: "Extra Bhature", price: 15 },
                    { name: "Aloo Puri", price: 80 },
                    { name: "Extra Puri", price: 25 },
                ],
            },
            {
                category: "Combo",
                items: [
                    { name: "Dal Makhni + 2 Butter Naan", price: 100 },
                    { name: "Shahi Paneer + 2 Butter Naan", price: 130 },
                    { name: "Kadai Paneer + 2 Butter Naan", price: 130 },
                    { name: "Gravy Chaap + 2 Butter Naan", price: 130 },
                    { name: "Paneer Butter Masala + 2 Naan", price: 130 },
                    { name: "Rara Combo + 2 Butter Naan", price: 130 },
                ],
            },
        ],
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // 4. CATCH UP CAFE
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        id: "catch-up-cafe",
        name: "Catch Up Cafe",
        tag: "Cafe • Non-Veg • Dessert",
        veg: false,
        categories: [
            {
                category: "Noodles",
                items: [
                    { name: "Veg Noodles", price: 60 },
                    { name: "Chilly Garlic Noodles", price: 70 },
                    { name: "Schezwan Noodles", price: 70 },
                    { name: "Soya Noodles", price: 70 },
                    { name: "Hakka Noodles", price: 80 },
                    { name: "Paneer Noodles", price: 90 },
                ],
            },
            {
                category: "Burger",
                items: [
                    { name: "Aloo Tikki Burger", price: 40 },
                    { name: "Veg Burger", price: 50 },
                    { name: "Veg Cheese Burger", price: 60 },
                    { name: "Paneer Burger", price: 80 },
                    { name: "Makhani Burger", price: 70 },
                    { name: "Double Decker Burger", price: 100 },
                ],
            },
            {
                category: "Sandwich",
                items: [
                    { name: "Veg Sandwich", price: 30 },
                    { name: "Corn Sandwich", price: 45 },
                    { name: "Paneer Sandwich", price: 65 },
                    { name: "Veg Grill Sandwich", price: 50 },
                    { name: "Mozzarella Grill Sandwich", price: 70 },
                    { name: "Mexican Nachos Sandwich", price: 90 },
                ],
            },
            {
                category: "Pasta",
                items: [
                    { name: "White Sauce Pasta", price: 90 },
                    { name: "Makhani Pasta", price: 90 },
                    { name: "Red Sauce Pasta", price: 90 },
                    { name: "Spicy Lava Pasta", price: 90 },
                    { name: "Mix Sauce Pasta", price: 110 },
                ],
            },
            {
                category: "Wrap",
                items: [
                    { name: "Aloo Tikki Wrap", price: 50 },
                    { name: "Veg Wrap", price: 60 },
                    { name: "Soya Wrap", price: 70 },
                    { name: "Paneer Wrap", price: 80 },
                ],
            },
            {
                category: "Momos",
                items: [
                    { name: "Steam Momos", price: 60 },
                    { name: "Fried Momos", price: 70 },
                    { name: "Afghani Momos", price: 80 },
                    { name: "Gravy Momos", price: 80 },
                    { name: "Kurkure Momos", price: 80 },
                    { name: "Cheesy Momos", price: 90 },
                    { name: "Makhani Momos", price: 100 },
                ],
            },
            {
                category: "Snacks",
                items: [
                    { name: "Spring Roll", price: 60 },
                    { name: "Veg Nuggets", price: 70 },
                    { name: "Kurkure Spring Roll", price: 80 },
                    { name: "Veggies Sticks", price: 80 },
                    { name: "Cheese Corn Roll", price: 100 },
                ],
            },
            {
                category: "Fries",
                items: [
                    { name: "Salted Fries", price: 70 },
                    { name: "Peri Peri Fries", price: 80 },
                    { name: "Cheesy Fries", price: 100 },
                ],
            },
            {
                category: "Corns",
                items: [
                    { name: "Masala Sweet Corn", price: 40 },
                    { name: "Chilly Garlic Corn", price: 50 },
                    { name: "Korean Cream Cheese Corn", price: 90 },
                ],
            },
            {
                category: "Maggi",
                items: [
                    { name: "Regular Maggi", price: 35 },
                    { name: "Veg Maggi", price: 45 },
                    { name: "Spicy Maggi", price: 40 },
                    { name: "Tandoori Maggi", price: 60 },
                    { name: "Cheese Maggi", price: 60 },
                    { name: "Schezwan Maggi", price: 60 },
                ],
            },
            {
                category: "Mocktails",
                items: [
                    { name: "Green Apple", price: 60 },
                    { name: "Watermelon", price: 60 },
                    { name: "Blue Curacao", price: 60 },
                    { name: "Mint Mojito", price: 60 },
                    { name: "Fresh Lime Soda", price: 40 },
                    { name: "Blueberry", price: 70 },
                    { name: "Ice Tea", price: 35 },
                ],
            },
            {
                category: "Lassi",
                items: [
                    { name: "Regular Lassi", price: 50 },
                    { name: "Mango Lassi", price: 60 },
                    { name: "Rose Lassi", price: 60 },
                ],
            },
            {
                category: "Shakes",
                items: [
                    { name: "Cold Coffee (Frappe)", price: 60 },
                    { name: "Chocolate Shake", price: 70 },
                    { name: "Pineapple Shake", price: 60 },
                    { name: "Strawberry Shake", price: 60 },
                    { name: "Blue Berry Shake", price: 70 },
                    { name: "Black Current Shake", price: 70 },
                    { name: "Vanilla Shake", price: 60 },
                    { name: "Banana Shake", price: 60 },
                    { name: "Mango Shake", price: 60 },
                    { name: "Butterscotch Shake", price: 70 },
                    { name: "Kit Kat Shake", price: 70 },
                    { name: "Oreo Shake", price: 70 },
                    { name: "Choco Pie Shake", price: 70 },
                    { name: "Brownie Shake", price: 80 },
                    { name: "Oreo Caramel Shake", price: 80 },
                    { name: "Munch Shake", price: 80 },
                    { name: "Cadbury Chocolate Shake", price: 80 },
                ],
            },
            {
                category: "Hot Drinks",
                items: [
                    { name: "Regular Tea", price: 15 },
                    { name: "Special Tea", price: 20 },
                    { name: "Black Coffee", price: 20 },
                    { name: "Milk Coffee", price: 25 },
                    { name: "Cappuccino", price: 30 },
                    { name: "Latte", price: 25 },
                    { name: "Hot Chocolate", price: 30 },
                ],
            },
            {
                category: "Dessert",
                items: [
                    { name: "Brownie", price: 60 },
                    { name: "Brownie with Ice Cream", price: 70 },
                ],
            },
            {
                category: "Meals",
                items: [
                    { name: "Rajma Rice", price: 50 },
                    { name: "Fried Rice", price: 70 },
                    { name: "Chilli Garlic Rice", price: 80 },
                    { name: "Hakka Rice", price: 80 },
                    { name: "Soya Rice", price: 80 },
                    { name: "Paneer Fried Rice", price: 90 },
                ],
            },
            {
                category: "Non Veg",
                items: [
                    { name: "Chicken Wrap", price: 60 },
                    { name: "Chicken Burger", price: 70 },
                    { name: "Chicken Cheese Burger", price: 80 },
                    { name: "Egg Noodles", price: 80 },
                    { name: "Egg Rice", price: 80 },
                    { name: "Chicken Maggie", price: 80 },
                    { name: "Chicken Sandwich", price: 90 },
                    { name: "Crispy Chicken Burger", price: 90 },
                    { name: "Crispy Chicken Wrap", price: 90 },
                    { name: "Chicken Seekh Kabab", price: 90 },
                    { name: "Chicken Noodles", price: 90 },
                    { name: "Chicken Rice", price: 90 },
                    { name: "Crispy Chicken Sandwich", price: 100 },
                    { name: "Chicken Nuggets", price: 110 },
                    { name: "Chicken Lollipop", price: 120 },
                    { name: "Chicken Pasta", price: 130 },
                    { name: "Chicken Strips (KFC)", price: 200 },
                ],
            },
        ],
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // 5. AMBEY FOOD & CATERING
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        id: "flavour-factory",
        name: "Flavour Factory",
        tag: "Sandwiches • Pasta • Shakes • Healthy Meals",
        veg: false,
        categories: [
            {
                category: "Sandwich",
                items: [
                    { name: "Grilled Cheese Sandwich", price: 70 },
                    { name: "Aloo Tikki Sandwich", price: 90 },
                    { name: "Pasta Sandwich", price: 90 },
                    { name: "Paneer & Corn Sandwich", price: 90 },
                    { name: "Loaded Afghani Sandwich", price: 130 },
                    { name: "Baked Pizza Sandwich", price: 150 },
                ],
            },
            {
                category: "Pasta",
                items: [
                    { name: "Spicy Pasta", price: 120 },
                    { name: "Paneer Pasta", price: 120 },
                    { name: "Red Sauce Pasta", price: 110 },
                    { name: "White Sauce Pasta", price: 110 },
                    { name: "Mixed Sauce Pasta", price: 110 },
                    { name: "Cheesy Pasta", price: 120 },
                    { name: "Nachos Cheesy Pasta", price: 140 },
                ],
            },
            {
                category: "Patties",
                items: [
                    { name: "Veggie Patty", price: 40 },
                    { name: "Cheese Patty", price: 50 },
                    { name: "Cheesy Paneer Patty", price: 50 },
                    { name: "Grilled Aloo Patty", price: 30 },
                ],
            },
            {
                category: "Fries",
                items: [
                    { name: "Salted French Fries", price: 80 },
                    { name: "Peri-Peri Fries", price: 100 },
                    { name: "Saucy Fries", price: 130 },
                    { name: "Cheesy Fries", price: 130 },
                    { name: "Cheesy Nachos Fries", price: 140 },
                    { name: "Honey Chilli Fries", price: 150 },
                ],
            },
            {
                category: "Garlic Bread",
                items: [
                    { name: "Round Cheese Garlic Bread", price: 90 },
                    { name: "Stuffed Cheese Garlic Bread", price: 100 },
                ],
            },
            {
                category: "Multigrain Wraps",
                items: [
                    { name: "Veggie Wrap", price: 90 },
                    { name: "Paneer Wrap", price: 120 },
                    { name: "MC. Tikki Wrap", price: 100 },
                    { name: "Chicken Wrap", price: 130 },
                ],
            },
            {
                category: "Quickies",
                items: [
                    { name: "Simple Omelette", price: 50 },
                    { name: "Bread Omelette", price: 60 },
                    { name: "Veg Fried Rice (Half)", price: 80 },
                    { name: "Veg Fried Rice (Full)", price: 120 },
                    { name: "Paneer Fried Rice (Half)", price: 100 },
                    { name: "Paneer Fried Rice (Full)", price: 140 },
                    { name: "Fruit Salad", price: 120 },
                    { name: "Protien Scoop", price: 120 },
                    { name: "Kachori 2 Pieces", price: 110 },
                ],
            },
            {
                category: "Parantha's",
                items: [
                    { name: "Aloo Parantha", price: 50 },
                    { name: "Gobhi Parantha", price: 60 },
                    { name: "Paneer Mix Parantha", price: 80 },
                ],
            },
            {
                category: "Refreshing Drinks",
                items: [
                    { name: "Hot Chocolate", price: 70 },
                    { name: "Fresh Lemon Soda", price: 50 },
                    { name: "Hot Choco Coffee", price: 40 },
                    { name: "Milk Roohafza", price: 60 },
                    { name: "Hazelnut Cold Coffee", price: 80 },
                    { name: "Meethi Lassi", price: 60 },
                    { name: "Namkeen Lassi", price: 60 },
                    { name: "Cold Coffee", price: 70 },
                    { name: "Cold Coffee with Ice Cream", price: 80 },
                    { name: "Masala Lemon Soda", price: 60 },
                ],
            },
            {
                category: "Natural Juices",
                items: [
                    { name: "Carrot+Beetroot Juice", price: 60 },
                    { name: "Mausami Juice (R)", price: 70 },
                    { name: "Mausami Juice (L)", price: 100 },
                    { name: "Orange Juice (R)", price: 70 },
                    { name: "Orange Juice (L)", price: 100 },
                    { name: "Mixed Juice (R)", price: 70 },
                    { name: "Mixed Juice (L)", price: 100 },
                    { name: "Pineapple Juice (R)", price: 100 },
                    { name: "Mausami+Anar Juice (R)", price: 100 },
                    { name: "Mausami+Anar Juice (L)", price: 150 },
                ],
            },
            {
                category: "Burgers",
                items: [
                    { name: "Crispy Veggie Burger", price: 60 },
                    { name: "Paneer Burger", price: 80 },
                    { name: "Chicken Burger", price: 80 },
                    { name: "Cheesy Paneer Burger", price: 90 },
                    { name: "Smoked Chicken Burger", price: 100 },
                    { name: "Cheesy Veggy Burger", price: 70 },
                ],
            },
            {
                category: "Momos",
                items: [
                    { name: "Veg Steamed Momos", price: 70 },
                    { name: "Paneer Steamed Momos", price: 90 },
                    { name: "Veg Fried Momos", price: 80 },
                    { name: "Paneer Fried Momos", price: 100 },
                    { name: "Veg Kurkure Momos", price: 90 },
                    { name: "Paneer Kurkure Momos", price: 110 },
                    { name: "Chicken Steamed Momos", price: 100 },
                    { name: "Chicken Fried Momos", price: 110 },
                    { name: "Chicken Kurkure Momos", price: 120 },
                ],
            },
            {
                category: "Healthy Meals",
                items: [
                    { name: "Sprout Salad", price: 100 },
                    { name: "Paneer Diet", price: 100 },
                    { name: "Paneer and Veggies Diet", price: 100 },
                    { name: "Chicken Breast Meal", price: 140 },
                    { name: "Healthy Veggies Meal", price: 180 },
                ],
            },
            {
                category: "Chatpate Snacks",
                items: [
                    { name: "Cheese & Corn Shots", price: 110 },
                    { name: "Veg Bullets", price: 99 },
                    { name: "Spring Rolls", price: 129 },
                    { name: "Chicken Nuggets", price: 149 },
                    { name: "Paneer Nuggets", price: 149 },
                ],
            },
            {
                category: "Milkshakes",
                items: [
                    { name: "Butterscotch Milkshake", price: 80 },
                    { name: "Vanilla Milkshake", price: 80 },
                    { name: "Chocolate Milkshake", price: 80 },
                    { name: "Kesar Badam Milkshake", price: 80 },
                    { name: "Strawberry Milkshake", price: 80 },
                    { name: "Kit-Kat Milkshake", price: 80 },
                    { name: "Bubble Gum Milkshake", price: 80 },
                    { name: "Black Currant Milkshake", price: 80 },
                    { name: "Oreo Milkshake", price: 80 },
                    { name: "Blueberry Milkshake", price: 80 },
                    { name: "Nutella Milkshake", price: 100 },
                ],
            },
            {
                category: "Fruit Shakes",
                items: [
                    { name: "Banana Shake", price: 50 },
                    { name: "Papaya Shake", price: 60 },
                    { name: "Mango Shake", price: 80 },
                    { name: "Pineapple Shake", price: 80 },
                    { name: "Natural Kiwi Shake", price: 100 },
                    { name: "Choco Protein Shake", price: 100 },
                    { name: "Dry Fruit Shake", price: 120 },
                    { name: "Mix Fruit Shake", price: 80 },
                ],
            },
            {
                category: "Crusher / Mocktails",
                items: [
                    { name: "Mint Mojito", price: 70 },
                    { name: "Iced Blue Crusher", price: 70 },
                    { name: "Orange Crusher", price: 70 },
                    { name: "Black Currant", price: 70 },
                    { name: "Watermelon", price: 70 },
                    { name: "Berry Blast", price: 80 },
                    { name: "Hangover Killer", price: 90 },
                ],
            },
            {
                category: "Birthday Cakes (On Order)",
                items: [
                    { name: "Half KG Cake", price: 300 },
                    { name: "One KG Cake", price: 500 },
                ],
            },
        ],
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // 6. VASANO FAST FOOD (100% Pure Vegetarian)
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        id: "vasano-fast-food",
        name: "Vasano Fast Food",
        tag: "100% Veg • Pizza • Indian • Bakery",
        veg: true,
        categories: [
            {
                category: "Roll",
                items: [
                    { name: "Veg Roll", price: 40 },
                    { name: "Paneer Roll", price: 50 },
                    { name: "Noodle Roll", price: 40 },
                    { name: "Chaap Roll", price: 50 },
                    { name: "Cheese Roll", price: 50 },
                ],
            },
            {
                category: "Chinese",
                items: [
                    { name: "Veg Noodle", price: 70 },
                    { name: "Hakka Noodle", price: 80 },
                    { name: "Chilli Garlic Noodle", price: 80 },
                    { name: "Chaap Noodle", price: 80 },
                    { name: "Schezwan Noodle", price: 80 },
                    { name: "Singapur Noodle", price: 90 },
                    { name: "Paneer Noodle", price: 100 },
                ],
            },
            {
                category: "Pasta",
                items: [
                    { name: "Veg Pasta", price: 70 },
                    { name: "Red Pasta", price: 80 },
                    { name: "White Pasta", price: 90 },
                    { name: "Mix Sauce Pasta", price: 100 },
                ],
            },
            {
                category: "Pattie & Burger",
                items: [
                    { name: "Aloo Patty", price: 20 },
                    { name: "Cheese Patty", price: 25 },
                    { name: "Cheese Corn Patty", price: 30 },
                    { name: "Aloo Tikki Burger", price: 30 },
                    { name: "Aloo Tikki Veg Burger", price: 40 },
                    { name: "Cheese Burger", price: 50 },
                    { name: "Cheese Corn Burger", price: 60 },
                ],
            },
            {
                category: "Combo's",
                items: [
                    { name: "Noodles Manchurian", price: 100 },
                    { name: "Fried Rice Manchurian", price: 100 },
                    { name: "Noodles Fried Rice", price: 100 },
                    { name: "Cheese Chilli Fried Rice", price: 100 },
                ],
            },
            {
                category: "Rice",
                items: [
                    { name: "Rajma Rice", price: 60 },
                    { name: "Curry Rice", price: 60 },
                    { name: "Channa Rice", price: 60 },
                    { name: "Dal Makhani Rice", price: 80 },
                    { name: "Veg Fried Rice", price: 80 },
                    { name: "Paneer Rice", price: 90 },
                    { name: "Veg Biryani", price: 100 },
                    { name: "Cheese Biryani", price: 100 },
                    { name: "Jeera Rice", price: 60 },
                ],
            },
            {
                category: "Fries",
                items: [
                    { name: "Salted Fries", price: 60 },
                    { name: "Masala Fries", price: 70 },
                    { name: "Cheese Fries", price: 90 },
                    { name: "Peri Peri Fries", price: 90 },
                    { name: "Tandoori Fries", price: 90 },
                ],
            },
            {
                category: "Sandwich",
                items: [
                    { name: "Veg Grilled Sandwich", price: 60 },
                    { name: "Paneer Tikka Sandwich", price: 80 },
                    { name: "Cheese Corn Sandwich", price: 80 },
                    { name: "Pasta Sandwich", price: 70 },
                ],
            },
            {
                category: "Tea",
                items: [
                    { name: "Milk Tea", price: 10 },
                    { name: "Ginger Tea", price: 15 },
                    { name: "Green Tea", price: 25 },
                    { name: "Hot Coffee", price: 20 },
                ],
            },
            {
                category: "Maggi",
                items: [
                    { name: "Plain Maggi", price: 30 },
                    { name: "Veg Maggi", price: 35 },
                    { name: "Masala Maggi", price: 35 },
                    { name: "Tadka Maggi", price: 40 },
                    { name: "Paneer Maggi", price: 40 },
                ],
            },
            {
                category: "Snacks",
                items: [
                    { name: "Veg Manchurian", price: 100 },
                    { name: "Cheese Chilli", price: 130 },
                    { name: "Chilli Mushroom", price: 150 },
                    { name: "Honey Chilli Cauliflower", price: 100 },
                    { name: "Honey Chilli Potato", price: 100 },
                    { name: "Veg Bullet", price: 80 },
                    { name: "Veg Spring Roll", price: 60 },
                    { name: "Veg Momos", price: 50 },
                    { name: "Fried Momos", price: 60 },
                ],
            },
            {
                category: "Chaap",
                items: [
                    { name: "Soya Chaap Fried", price: 70 },
                    { name: "Chilli Chaap", price: 100 },
                ],
            },
            {
                category: "Pizza",
                items: [
                    { name: "Cheese Pizza", price: 100 },
                    { name: "Onion Pizza", price: 100 },
                    { name: "Paneer Tikka Pizza", price: 120 },
                    { name: "Paneer Makhani Pizza", price: 130 },
                ],
            },
            {
                category: "Shake",
                items: [
                    { name: "Banana Shake", price: 50 },
                    { name: "Papita Shake", price: 50 },
                    { name: "Mango Shake", price: 60 },
                    { name: "Kit Kat / Oreo Shake", price: 50 },
                    { name: "Vanilla Shake", price: 50 },
                    { name: "Butterscotch Shake", price: 50 },
                    { name: "Black Current Shake", price: 50 },
                    { name: "Strawberry Shake", price: 50 },
                    { name: "Cold Coffee", price: 50 },
                ],
            },
            {
                category: "Drinks",
                items: [
                    { name: "Nimbu Pani", price: 30 },
                    { name: "Lemon Soda", price: 40 },
                ],
            },
            {
                category: "Indian Main Course",
                items: [
                    { name: "Kadhai Paneer (Half)", price: 140 },
                    { name: "Kadhai Paneer (Full)", price: 190 },
                    { name: "Shahi Paneer (Half)", price: 130 },
                    { name: "Shahi Paneer (Full)", price: 180 },
                    { name: "Cheese Tomato (Half)", price: 140 },
                    { name: "Cheese Tomato (Full)", price: 190 },
                    { name: "Paneer 2 Pyaza (Half)", price: 140 },
                    { name: "Paneer 2 Pyaza (Full)", price: 190 },
                    { name: "Paneer Bhurji (Half)", price: 150 },
                    { name: "Paneer Bhurji (Full)", price: 200 },
                    { name: "Paneer Butter Masala (Half)", price: 140 },
                    { name: "Paneer Butter Masala (Full)", price: 190 },
                    { name: "Masala Chaap (Half)", price: 140 },
                    { name: "Masala Chaap (Full)", price: 200 },
                    { name: "Malai Chaap", price: 130 },
                    { name: "Dal Makhani", price: 130 },
                ],
            },
            {
                category: "Naan",
                items: [
                    { name: "Amrit Sri Naan", price: 30 },
                    { name: "Laccha Parantha", price: 90 },
                    { name: "Butter Naan", price: 20 },
                    { name: "Tandoori Roti", price: 15 },
                    { name: "Tawa Roti", price: 10 },
                ],
            },
            {
                category: "Kulcha",
                items: [
                    { name: "Chaamp Kulcha", price: 80 },
                    { name: "Channa Kulcha", price: 60 },
                    { name: "Channa Samosa", price: 40 },
                    { name: "Samosa", price: 15 },
                ],
            },
            {
                category: "Bakery Items",
                items: [
                    { name: "Chocolate Cake (slice)", price: 50 },
                    { name: "Butterscotch Cake (slice)", price: 50 },
                    { name: "Vanilla Cake (slice)", price: 50 },
                    { name: "Pineapple Cake (slice)", price: 50 },
                    { name: "Black Forest Cake (slice)", price: 60 },
                    { name: "Red Velvet Cake (slice)", price: 60 },
                    { name: "Choco Lava Cake", price: 50 },
                    { name: "Walnut Brownie Cake", price: 60 },
                ],
            },
        ],
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // 7. CHATORI CHAAT & KULCHA CORNER
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        id: "chatori-chaat",
        name: "Chatori Chaat & Kulcha Corner",
        tag: "Chaat • Street Food • Kulcha • Combos",
        veg: false,
        categories: [
            {
                category: "Paranthas",
                items: [
                    { name: "Aloo Parantha", price: 25 },
                    { name: "Pyazz Parantha", price: 30 },
                    { name: "Aloo Pyazz Parantha", price: 35 },
                    { name: "Gobhi Parantha", price: 35 },
                    { name: "Paneer Parantha", price: 45 },
                    { name: "2 Aloo Parantha + Dahi", price: 70 },
                ],
            },
            {
                category: "Chowmien Delight",
                items: [
                    { name: "Veg Chowmien", price: 60 },
                    { name: "Chilli Garlic Chowmien", price: 70 },
                    { name: "Singapuri Noodles", price: 80 },
                    { name: "Paneer Noodles", price: 80 },
                    { name: "Schezwan Noodles", price: 80 },
                    { name: "Paneer + Schezwan", price: 80 },
                    { name: "Hakka Noodles", price: 80 },
                    { name: "Chicken Noodles", price: 90 },
                ],
            },
            {
                category: "Rolls",
                items: [
                    { name: "Noodles Roll", price: 40 },
                    { name: "Egg Rolls", price: 30 },
                    { name: "Aloo Rolls", price: 40 },
                    { name: "Veg Rolls", price: 50 },
                    { name: "Paneer Rolls", price: 60 },
                    { name: "KFC Paneer Rolls", price: 70 },
                    { name: "Chicken Rolls", price: 80 },
                    { name: "Kathi Rolls", price: 90 },
                    { name: "Spl KFC Chicken Rolls", price: 100 },
                ],
            },
            {
                category: "Wraps",
                items: [
                    { name: "Egg Wrap", price: 50 },
                    { name: "Aloo Wrap", price: 40 },
                    { name: "Chicken Wrap", price: 80 },
                    { name: "Veg Wrap", price: 50 },
                    { name: "Paneer Wrap", price: 60 },
                ],
            },
            {
                category: "Italian",
                items: [
                    { name: "White Sauce Pasta", price: 80 },
                    { name: "Red Sauce Pasta", price: 80 },
                    { name: "Makhni Pasta", price: 90 },
                    { name: "Schezwan Pasta", price: 90 },
                    { name: "Mix Sauce Pasta", price: 100 },
                    { name: "Chicken Pasta", price: 110 },
                ],
            },
            {
                category: "Soup",
                items: [
                    { name: "Veg Soup", price: 40 },
                    { name: "Tomato Soup", price: 40 },
                    { name: "Chicken Soup", price: 50 },
                ],
            },
            {
                category: "Maggi",
                items: [
                    { name: "Simple Maggi", price: 30 },
                    { name: "Masala Maggi", price: 35 },
                    { name: "Veggie Maggi", price: 40 },
                    { name: "Chilly Maggi", price: 40 },
                    { name: "Paneer Maggi", price: 50 },
                ],
            },
            {
                category: "Snacks",
                items: [
                    { name: "Spring Rolls", price: 60 },
                    { name: "Veg Bullets", price: 60 },
                    { name: "Manchurian Dry", price: 70 },
                    { name: "Honey Chilli Potato", price: 80 },
                    { name: "Honey Chilli Cauliflower", price: 80 },
                    { name: "Manchurian Gravy", price: 80 },
                    { name: "Gobhi Manchurian", price: 90 },
                    { name: "Chicken Lollipop", price: 110 },
                    { name: "Chilli Paneer", price: 120 },
                    { name: "Chicken Chilli", price: 160 },
                ],
            },
            {
                category: "Burger",
                items: [
                    { name: "Aloo Tikki Burger", price: 40 },
                    { name: "Noodles Burger", price: 50 },
                    { name: "Cheese Burger", price: 50 },
                    { name: "Double Tikki Burger", price: 60 },
                    { name: "Veg Cheese Burger", price: 70 },
                    { name: "Paneer Tikki Burger", price: 70 },
                    { name: "Chicken Burger", price: 80 },
                    { name: "Spl. Makhni Burger", price: 90 },
                    { name: "Mexican Burger", price: 100 },
                ],
            },
            {
                category: "Bombay Bites",
                items: [
                    { name: "Onion Vada Pav", price: 35 },
                    { name: "Schezwan Vada Pav", price: 40 },
                    { name: "Cheese Vada Pav", price: 40 },
                    { name: "Samosa", price: 15 },
                    { name: "Samosa With Channa", price: 35 },
                    { name: "Kachori With Sabzi", price: 30 },
                    { name: "Chole Bhature", price: 60 },
                    { name: "Pav Bhaji", price: 60 },
                ],
            },
            {
                category: "Chaat",
                items: [
                    { name: "Pani Puri (6 Pc)", price: 40 },
                    { name: "Stuffed Golgappe (5 Pc)", price: 50 },
                    { name: "Bhel Puri", price: 60 },
                    { name: "Aloo Tikki", price: 50 },
                    { name: "Papri Chaat", price: 50 },
                    { name: "Papri Bhalla Chaat", price: 60 },
                    { name: "Dahi Bhalla Chaat", price: 60 },
                ],
            },
            {
                category: "Frites Frenzy",
                items: [
                    { name: "Salted Fries", price: 50 },
                    { name: "Indian Masala Fries", price: 60 },
                    { name: "Peri Peri Fries", price: 70 },
                    { name: "Cheesy Fries", price: 70 },
                    { name: "Makhni Fries", price: 70 },
                    { name: "Honey Chilli Fries", price: 80 },
                    { name: "Mexican Fries", price: 80 },
                ],
            },
            {
                category: "Zenwich Zone",
                items: [
                    { name: "Aloo Sandwich", price: 40 },
                    { name: "Veg Sandwich", price: 50 },
                    { name: "Corn Sandwich", price: 50 },
                    { name: "Veg Grilled Sandwich", price: 60 },
                    { name: "Spicy Makhni Twist", price: 70 },
                    { name: "Paneer Grilled", price: 80 },
                    { name: "Jumbo Grilled Sandwich", price: 90 },
                    { name: "Chicken Sandwich", price: 80 },
                ],
            },
            {
                category: "Crispy Kulcha",
                items: [
                    { name: "Desi Punjabi Kulcha", price: 40 },
                    { name: "Chana Aloo Kulcha", price: 40 },
                    { name: "Nutri Kemma Kulcha", price: 40 },
                    { name: "Cheese Kulcha", price: 60 },
                    { name: "Paneer Kulcha", price: 60 },
                    { name: "Egg Kulcha", price: 50 },
                    { name: "Egg Kulcha With Cheese", price: 70 },
                    { name: "Chicken Keema Kulcha", price: 100 },
                ],
            },
            {
                category: "Steamed Sensation",
                items: [
                    { name: "Sweet Corn Salted", price: 40 },
                    { name: "Masala Sweet Corn", price: 50 },
                    { name: "Cheesy Sweet Corn", price: 60 },
                    { name: "Veg Momos", price: 70 },
                    { name: "Fried Momos", price: 80 },
                    { name: "Kurkure Momos", price: 80 },
                    { name: "Afghani Momos", price: 90 },
                    { name: "Chicken Momos", price: 80 },
                    { name: "Fried Chicken Momos", price: 90 },
                ],
            },
            {
                category: "Rice Mama",
                items: [
                    { name: "Veg Fried Rice", price: 60 },
                    { name: "Paneer Fried Rice", price: 80 },
                    { name: "Mattar Rice Pulao", price: 60 },
                    { name: "Veg Pulao", price: 60 },
                    { name: "Egg Fried Rice", price: 80 },
                    { name: "Veg Biryani", price: 100 },
                    { name: "Chicken Fried Rice", price: 110 },
                    { name: "Chicken Biryani", price: 150 },
                ],
            },
            {
                category: "Rajma Combo",
                items: [
                    { name: "Rajma Chawal", price: 55 },
                    { name: "Cholle Chawal", price: 55 },
                    { name: "Kadhi Chawal", price: 55 },
                    { name: "Dal Chawal", price: 60 },
                    { name: "Paneer Chawal", price: 80 },
                ],
            },
            {
                category: "Indian Combo",
                items: [
                    { name: "2 Butter Roti + Rajma", price: 70 },
                    { name: "2 Butter Roti + Cholle", price: 70 },
                    { name: "2 Butter Roti + Dal Makhni", price: 70 },
                    { name: "2 Butter Roti + Paneer Gravy", price: 90 },
                    { name: "Veg Thali", price: 110 },
                    { name: "Paneer Thali", price: 110 },
                ],
            },
            {
                category: "Stunt Saver Combos",
                items: [
                    { name: "Sandwich + Coke + Burger", price: 100 },
                    { name: "2 Burger + Coke + Fries", price: 120 },
                    { name: "2 Plate Vada Pav + Coke", price: 130 },
                    { name: "Fried Rice + Manchurian + Coke", price: 155 },
                ],
            },
            {
                category: "Beverages",
                items: [
                    { name: "Tea", price: 10 },
                    { name: "Coffee", price: 25 },
                    { name: "Cappuccino", price: 30 },
                    { name: "Nimbu Pani", price: 20 },
                    { name: "Masala Lime Soda", price: 40 },
                    { name: "Mojito", price: 40 },
                    { name: "Cold Coffee", price: 50 },
                    { name: "Chocolate Shake", price: 50 },
                    { name: "Strawberry Shake", price: 50 },
                    { name: "Butterscotch Shake", price: 50 },
                    { name: "Banana Shake", price: 50 },
                    { name: "Oreo Shake", price: 50 },
                    { name: "Kit Kat Shake", price: 60 },
                    { name: "Vanilla Shake", price: 60 },
                    { name: "Mango Shake", price: 60 },
                    { name: "Hazelnut Coffee", price: 60 },
                    { name: "Caramel Coffee", price: 60 },
                ],
            },
            {
                category: "Omelette",
                items: [
                    { name: "Boiled Egg", price: 15 },
                    { name: "Omelette", price: 20 },
                    { name: "2 Egg Bhurji", price: 30 },
                    { name: "Bread Omelette", price: 30 },
                    { name: "Bread Omelette With Cheese", price: 40 },
                ],
            },
            {
                category: "Patties",
                items: [
                    { name: "Bread Pakora", price: 20 },
                    { name: "Veg Patties", price: 20 },
                    { name: "Paneer Patties", price: 25 },
                    { name: "Chicken Patties", price: 30 },
                    { name: "Brownie", price: 60 },
                    { name: "Brownie with Ice Cream", price: 80 },
                ],
            },
        ],
    },

    // ═══════════════════════════════════════════════════════════════════════════════
    // DIRECTORY-ONLY SHOPS (menu coming soon)
    // ═══════════════════════════════════════════════════════════════════════════════
    {
        id: "rock-in-roll",
        name: "Rock in Roll (NC-3)",
        tag: "📞 9888391974 • Rolls • Noodles • Rice",
        veg: false,
        categories: [
            {
                category: "Egg Roll", items: [
                    { name: "Egg Roll", price: 30 }, { name: "Double Egg Roll", price: 50 }, { name: "Egg Paneer Roll", price: 60 },
                    { name: "Double Egg Paneer Roll", price: 70 }, { name: "Egg Noodles Roll", price: 60 }, { name: "Egg Veg Roll", price: 70 },
                    { name: "Egg Veg Paneer Roll", price: 70 }, { name: "Double Egg Veg Roll", price: 70 }, { name: "Double Egg Veg Paneer Roll", price: 90 },
                ]
            },
            {
                category: "Veg Roll", items: [
                    { name: "Veg Roll", price: 40 }, { name: "Paneer Roll", price: 50 }, { name: "Veg Paneer Roll", price: 60 },
                    { name: "Soya Chaap Roll", price: 60 }, { name: "Veg Noodles Roll", price: 60 }, { name: "Paneer Noodles Roll", price: 70 },
                    { name: "Double Paneer Roll", price: 80 },
                ]
            },
            {
                category: "Chicken Roll", items: [
                    { name: "Chicken Roll", price: 80 }, { name: "Chicken Paneer Roll", price: 90 }, { name: "Egg Chicken Roll", price: 90 },
                    { name: "Double Egg Chicken Roll", price: 100 }, { name: "Egg Chicken Paneer Roll", price: 100 },
                    { name: "Chicken Noodles Roll", price: 100 }, { name: "Double Egg Chicken Paneer Roll", price: 110 },
                    { name: "Double Chicken Roll", price: 120 }, { name: "Double Chicken Paneer Roll", price: 130 },
                    { name: "Double Egg Double Chicken Paneer Roll", price: 140 },
                ]
            },
            {
                category: "Noodles", items: [
                    { name: "Veg Noodles", price: 80 }, { name: "Egg Noodles", price: 90 }, { name: "Soya Chaap Noodles", price: 100 },
                    { name: "Paneer Noodles", price: 110 }, { name: "Chicken Noodles", price: 110 },
                ]
            },
            {
                category: "Rice", items: [
                    { name: "Veg Fried Rice", price: 80 }, { name: "Egg Fried Rice", price: 90 }, { name: "Soya Chaap Fried Rice", price: 100 },
                    { name: "Chicken Fried Rice", price: 110 }, { name: "Paneer Fried Rice", price: 110 },
                ]
            },
            {
                category: "Soups", items: [
                    { name: "Veg Soup", price: 40 }, { name: "Chicken Soup", price: 70 },
                ]
            },
        ],
    },
    {
        id: "food-castle",
        name: "Food Castle (NC-5)",
        tag: "📞 9988619177 • Pizza • Bakery • Sandwiches",
        veg: false,
        categories: [
            {
                category: "Hot Beverages", items: [
                    { name: "Tea", price: 10 }, { name: "Milk Tea", price: 20 }, { name: "Espresso Coffee", price: 25 },
                    { name: "Hot Badam Milk", price: 40 },
                ]
            },
            {
                category: "Snacks & Breakfast", items: [
                    { name: "Samosa", price: 15 }, { name: "Samosa Chaat", price: 50 }, { name: "Rajma Rice", price: 50 },
                    { name: "Chana Rice", price: 50 }, { name: "Bread Omelette", price: 50 },
                ]
            },
            {
                category: "Kathi Roll", items: [
                    { name: "Veg Roll", price: 50 }, { name: "Paneer Roll", price: 70 }, { name: "Egg Roll", price: 50 },
                    { name: "Soya Chaap Roll", price: 70 }, { name: "Chilly Paneer Roll", price: 70 },
                    { name: "Pasta Roll", price: 70 }, { name: "Egg Noodles Roll", price: 70 },
                    { name: "Egg Paneer Roll", price: 90 }, { name: "Egg Cheese Roll", price: 90 },
                ]
            },
            {
                category: "Mojito", items: [
                    { name: "Kala Khatta", price: 60 }, { name: "Mango Tango", price: 60 }, { name: "Green Apple", price: 60 },
                    { name: "Icey Blue", price: 60 }, { name: "Peach Mojito", price: 60 }, { name: "Virgin Mojito", price: 60 },
                    { name: "Cold Coffee", price: 60 },
                ]
            },
            {
                category: "Light Drinks", items: [
                    { name: "Lime Water", price: 30 }, { name: "Lime Soda", price: 40 }, { name: "Watermelon", price: 50 },
                    { name: "Jal Jeera", price: 50 }, { name: "Strawberry Soda", price: 60 }, { name: "Blue Italian Soda", price: 60 },
                ]
            },
            {
                category: "Fruit Shakes", items: [
                    { name: "Banana Shake", price: 50 }, { name: "Papaya Shake", price: 60 },
                    { name: "Mango Shake", price: 60 }, { name: "Chiku Shake", price: 60 },
                ]
            },
            {
                category: "Spl. Milk Shakes", items: [
                    { name: "Vanilla Shake", price: 60 }, { name: "Chocolate Shake", price: 60 },
                    { name: "Butterscotch Shake", price: 60 }, { name: "Black Current Shake", price: 60 },
                    { name: "Cold Coffee", price: 60 },
                ]
            },
            {
                category: "Smoothies", items: [
                    { name: "Strawberry Smoothie", price: 60 }, { name: "Blue Raspberry Smoothie", price: 60 },
                    { name: "Mango Smoothie", price: 60 }, { name: "Pineapple Smoothie", price: 60 },
                ]
            },
            {
                category: "Lassi", items: [
                    { name: "Punjabi Sweet Lassi", price: 50 }, { name: "Salty Lassi", price: 50 },
                ]
            },
            {
                category: "Loaded Drinks", items: [
                    { name: "Oreo Chocolate", price: 60 }, { name: "Kit Kat Blast", price: 60 },
                    { name: "Snicker Blast", price: 60 }, { name: "Badam Milk", price: 60 },
                    { name: "Badam Thandai", price: 60 }, { name: "Caramel Chocolate", price: 60 },
                ]
            },
            {
                category: "Noodles", items: [
                    { name: "Veg Noodles", price: 70 }, { name: "Chilly Garlic Noodles", price: 80 },
                    { name: "Cheese Noodles", price: 90 }, { name: "Egg Noodles", price: 90 },
                    { name: "Mushroom Noodles", price: 90 }, { name: "Butter Noodles", price: 90 },
                    { name: "Hakka Noodles", price: 100 },
                ]
            },
            {
                category: "Rice", items: [
                    { name: "Veg Fried Rice", price: 70 }, { name: "Cheese Fried Rice", price: 90 },
                    { name: "Egg Rice", price: 90 }, { name: "Mushroom Rice", price: 90 },
                ]
            },
            {
                category: "Chinese Snacks", items: [
                    { name: "Veg Spring Roll", price: 60 }, { name: "Veg Maggi", price: 50 },
                    { name: "Veg Manchurian", price: 70 }, { name: "Veg Momos", price: 60 },
                    { name: "Chilli Potato", price: 70 }, { name: "Honey Chilly Potato", price: 90 },
                    { name: "Honey Chilly Cauliflower", price: 90 }, { name: "Kurkure Momos", price: 90 },
                    { name: "Chilly Momos", price: 90 }, { name: "Pav Bhaji", price: 70 },
                    { name: "Cheese Finger", price: 100 }, { name: "Cheese Chilly", price: 100 },
                    { name: "Mushroom Chilly", price: 100 }, { name: "Cheese Manchurian", price: 100 },
                ]
            },
            {
                category: "Grilled Patty & Fried", items: [
                    { name: "Aloo Patty", price: 20 }, { name: "Cheese Patty", price: 30 },
                    { name: "Paneer Corma Patty", price: 40 }, { name: "Cheese Corn Patty", price: 40 },
                    { name: "Pasta Patty", price: 40 }, { name: "Golden Fries", price: 60 },
                    { name: "Masala Fries", price: 70 }, { name: "Cheese Finger", price: 100 },
                ]
            },
            {
                category: "Burger", items: [
                    { name: "Aloo Tikki Burger", price: 40 }, { name: "Veg Cheese Burger", price: 50 },
                    { name: "Spicy Paneer Burger", price: 60 }, { name: "Mexican Burger", price: 70 },
                    { name: "MHC King Burger", price: 70 },
                ]
            },
            {
                category: "Grilled Sandwich", items: [
                    { name: "Veg Sandwich", price: 70 }, { name: "Cheese Bust Sandwich", price: 80 },
                    { name: "Butter Sandwich", price: 80 }, { name: "Mushroom Corn Sandwich", price: 80 },
                    { name: "Potato Tikka Sandwich", price: 80 }, { name: "Paneer Tikka Sandwich", price: 80 },
                    { name: "Pasta Sandwich", price: 80 }, { name: "Paneer Corma Sandwich", price: 80 },
                    { name: "Cheese Corn Sandwich", price: 80 },
                ]
            },
            {
                category: "Garlic Bread", items: [
                    { name: "Plain Cheese", price: 100 }, { name: "Corn Cheese", price: 120 },
                    { name: "Vegetarian", price: 90 }, { name: "Mexican Garlic Bread", price: 120 },
                ]
            },
            {
                category: "Pasta", items: [
                    { name: "Tomato Penne", price: 90 }, { name: "Creamy White Sauce Pasta", price: 100 },
                    { name: "Mushroom Corn Pasta", price: 110 }, { name: "Makhani Pasta", price: 110 },
                    { name: "Mix Pasta", price: 110 },
                ]
            },
            {
                category: "Pizza", items: [
                    { name: "Cheese Pizza", price: 100 }, { name: "Paneer Makhani Pizza", price: 140 },
                    { name: "Farm House Pizza", price: 130 }, { name: "Cheese Corn Pizza", price: 130 },
                    { name: "Veggie Penta Pizza", price: 130 }, { name: "Mexican Wave Pizza", price: 140 },
                    { name: "Special Pizza", price: 150 },
                ]
            },
            {
                category: "Bakery Items", items: [
                    { name: "Bakery Biscuit", price: 50 }, { name: "Cake (Half Kg)", price: 300 },
                    { name: "Swiss Roll", price: 40 }, { name: "Pastry", price: 40 },
                    { name: "Pudding", price: 40 }, { name: "Brownie", price: 40 },
                    { name: "Brownie with Hot Chocolate", price: 50 },
                ]
            },
            {
                category: "Dessert", items: [
                    { name: "Pastry", price: 40 }, { name: "Brownie", price: 40 },
                    { name: "Brownie with Hot Chocolate", price: 50 },
                ]
            },
            {
                category: "American Corn", items: [
                    { name: "Small Corn", price: 50 }, { name: "Large Corn", price: 60 },
                ]
            },
            {
                category: "Chinese Snacks Combo", items: [
                    { name: "Noodle + Manchurian", price: 100 }, { name: "Rice + Manchurian", price: 100 },
                    { name: "Noodle + Cheese Chilly", price: 120 }, { name: "Rice + Cheese Chilly", price: 120 },
                ]
            },
            {
                category: "Extra Healthy", items: [
                    { name: "Brown Sandwich", price: 80 }, { name: "Fruit Salad", price: 60 },
                    { name: "Pasta Salad", price: 100 },
                ]
            },
        ],
    },
    {
        id: "eat-and-smile",
        name: "Eat and Smile (NC-6)",
        tag: "📞 7988511867 • Breakfast • Chinese • Rolls",
        veg: false,
        categories: [
            {
                category: "Breakfast", items: [
                    { name: "Aloo Prantha", price: 70 }, { name: "Mix Prantha", price: 80 },
                    { name: "Paneer Prantha", price: 90 }, { name: "Bread Omelette", price: 50 },
                    { name: "Maggi", price: 40 }, { name: "Veg Maggi", price: 50 },
                ]
            },
            {
                category: "Patties", items: [
                    { name: "Aloo Pattie", price: 20 }, { name: "Cheese Pattie", price: 25 },
                    { name: "Cheese Corn Pattie", price: 30 }, { name: "Korma Pattie", price: 40 },
                ]
            },
            {
                category: "Rice", items: [
                    { name: "Veg Fried Rice", price: 70 }, { name: "Paneer Rice", price: 90 },
                    { name: "Egg Fried Rice", price: 90 }, { name: "Mushroom Fried Rice", price: 90 },
                    { name: "Chicken Fried Rice", price: 110 },
                ]
            },
            {
                category: "Pasta", items: [
                    { name: "Red Sauce Pasta", price: 90 }, { name: "White Sauce Pasta", price: 100 },
                    { name: "Mix Sauce Pasta", price: 100 }, { name: "Chicken Pasta", price: 130 },
                ]
            },
            {
                category: "Noodles", items: [
                    { name: "Veg Noodles", price: 70 }, { name: "Chilli Garlic Noodles", price: 80 },
                    { name: "Hakka Noodles", price: 90 }, { name: "Paneer Noodles", price: 90 },
                    { name: "Egg Noodles", price: 90 }, { name: "Chicken Noodles", price: 100 },
                ]
            },
            {
                category: "Burger", items: [
                    { name: "Aloo Tikki Burger", price: 40 }, { name: "Cheese Burger", price: 50 },
                    { name: "Paneer Burger", price: 60 }, { name: "Chicken Burger", price: 60 },
                    { name: "King Burger", price: 80 }, { name: "Mexican Burger", price: 80 },
                ]
            },
            {
                category: "Sandwich", items: [
                    { name: "Veg Grilled Sandwich", price: 70 }, { name: "Aloo Tikka Sandwich", price: 80 },
                    { name: "Cheese Corn Sandwich", price: 80 }, { name: "Paneer Tikka Sandwich", price: 80 },
                    { name: "Mexican Sandwich", price: 90 }, { name: "Paneer Korma Sandwich", price: 90 },
                    { name: "Chicken Sandwich", price: 100 },
                ]
            },
            {
                category: "Roll", items: [
                    { name: "Spring Roll", price: 60 }, { name: "Veg Roll", price: 50 },
                    { name: "Egg Roll", price: 60 }, { name: "Paneer Roll", price: 70 },
                    { name: "Soya Chaap Roll", price: 70 }, { name: "Cheese Corn Roll", price: 70 },
                    { name: "Chicken Roll", price: 100 }, { name: "Cheese Finger", price: 100 },
                ]
            },
            {
                category: "Chinese", items: [
                    { name: "Veg Manchurian", price: 80 }, { name: "Steam Momos", price: 60 },
                    { name: "Fried Momos", price: 70 }, { name: "Chilly Chicken", price: 200 },
                    { name: "Chilly Paneer", price: 150 }, { name: "Mushroom Chilli", price: 100 },
                ]
            },
            {
                category: "Fries", items: [
                    { name: "Golden Fries", price: 70 }, { name: "Chilli Potato", price: 90 },
                    { name: "Honey Chilli", price: 90 },
                ]
            },
            {
                category: "Beverages", items: [
                    { name: "Chai", price: 15 }, { name: "Hot Coffee", price: 25 },
                    { name: "Sweet Lassi", price: 40 }, { name: "Mango Lassi", price: 60 },
                    { name: "Cold Coffee", price: 60 }, { name: "Banana Shake", price: 50 },
                    { name: "Butterscotch Shake", price: 60 }, { name: "Kesar Pista Shake", price: 60 },
                    { name: "Vanilla Shake", price: 60 }, { name: "Strawberry Shake", price: 60 },
                    { name: "Black Current Shake", price: 60 }, { name: "Chocolate Shake", price: 60 },
                    { name: "Oreo Shake", price: 60 },
                ]
            },
            {
                category: "Mojitos", items: [
                    { name: "Nimbu Panni", price: 30 }, { name: "Lime Soda", price: 40 },
                    { name: "Kala Khata", price: 50 }, { name: "Virgin Mojito", price: 50 },
                    { name: "Green Apple", price: 50 }, { name: "Ice Blue", price: 50 },
                ]
            },
            {
                category: "Special Items", items: [
                    { name: "Pav Bhaji", price: 70 }, { name: "Chole Bhature", price: 60 },
                    { name: "Chole Bhature with Lassi", price: 90 },
                ]
            },
            {
                category: "Spl. Gym Diet", items: [
                    { name: "Boil Chicken (250g)", price: 130 }, { name: "Grill Chicken", price: 140 },
                    { name: "Stuffed Grill Chicken", price: 160 }, { name: "Special Meal", price: 180 },
                ]
            },
        ],
    },
    {
        id: "zaika",
        name: "Zaika (NC-4)",
        tag: "📞 8360292356 • Indian • Thali • Biryani",
        veg: false,
        categories: [
            {
                category: "Veg Thali", items: [
                    { name: "Rajma Thali", price: 80 }, { name: "Chole Thali", price: 80 },
                    { name: "Dal Makhni Thali", price: 90 }, { name: "Spl. Veg Thali", price: 110 },
                    { name: "Kadahi Paneer Thali", price: 140 }, { name: "Paneer Butter Masala Thali", price: 140 },
                ]
            },
            {
                category: "Veg Main Course", items: [
                    { name: "Dal Makhni (Half)", price: 90 }, { name: "Dal Makhni (Full)", price: 160 },
                    { name: "Mix Veg (Half)", price: 100 }, { name: "Mix Veg (Full)", price: 170 },
                    { name: "Channa Masala (Half)", price: 90 }, { name: "Channa Masala (Full)", price: 160 },
                    { name: "Rajma (Half)", price: 80 }, { name: "Rajma (Full)", price: 150 },
                    { name: "Cholle White (Half)", price: 80 }, { name: "Cholle White (Full)", price: 150 },
                    { name: "Kadahi Paneer (Half)", price: 150 }, { name: "Kadahi Paneer (Full)", price: 240 },
                    { name: "Shahi Paneer (Half)", price: 150 }, { name: "Shahi Paneer (Full)", price: 240 },
                    { name: "Paneer Butter Masala (Half)", price: 150 }, { name: "Paneer Butter Masala (Full)", price: 240 },
                    { name: "Paneer Do Pyaza (Half)", price: 150 }, { name: "Paneer Do Pyaza (Full)", price: 240 },
                    { name: "Soya Butter Masala (Half)", price: 150 }, { name: "Soya Butter Masala (Full)", price: 240 },
                    { name: "Kadahi Soya (Half)", price: 150 }, { name: "Kadahi Soya (Full)", price: 240 },
                ]
            },
            {
                category: "Combos (Veg)", items: [
                    { name: "Rajmah + Rice", price: 60 }, { name: "Cholle + Rice", price: 60 },
                    { name: "Dal Makhni + Rice", price: 80 }, { name: "Paneer + Rice", price: 80 },
                ]
            },
            {
                category: "Parantha", items: [
                    { name: "Aloo Parantha", price: 50 }, { name: "Paneer Parantha", price: 70 },
                ]
            },
            {
                category: "Veg Snacks", items: [
                    { name: "Paneer Tikka", price: 220 }, { name: "Paneer Malai Tikka", price: 240 },
                    { name: "Soya Malai Chaap", price: 200 }, { name: "Soya Achari Tikka", price: 200 },
                ]
            },
            {
                category: "Non-Veg Thali", items: [
                    { name: "Kadhai Chicken Thali", price: 160 }, { name: "Butter Chicken Thali", price: 160 },
                    { name: "Tawa Chicken Thali", price: 160 }, { name: "Masala Chicken Thali", price: 160 },
                ]
            },
            {
                category: "Non-Veg Main Course", items: [
                    { name: "Butter Chicken (Half)", price: 250 }, { name: "Butter Chicken (Full)", price: 430 },
                    { name: "Kadhai Chicken (Half)", price: 250 }, { name: "Kadhai Chicken (Full)", price: 430 },
                    { name: "Masala Chicken (Half)", price: 250 }, { name: "Masala Chicken (Full)", price: 430 },
                    { name: "Tawa Chicken (Half)", price: 250 }, { name: "Tawa Chicken (Full)", price: 430 },
                    { name: "Chicken Do Pyaza", price: 250 },
                    { name: "Chicken Curry (Home Style) (Half)", price: 240 }, { name: "Chicken Curry (Full)", price: 420 },
                    { name: "Rara Chicken (Half)", price: 280 }, { name: "Rara Chicken (Full)", price: 450 },
                ]
            },
            {
                category: "Combos (Non-Veg)", items: [
                    { name: "Chicken Curry + Rice", price: 160 }, { name: "Butter Chicken + Rice", price: 160 },
                ]
            },
            {
                category: "Non-Veg Snacks", items: [
                    { name: "Tandoori Chicken (Half)", price: 250 }, { name: "Tandoori Chicken (Full)", price: 420 },
                    { name: "Afghani Chicken (Half)", price: 270 }, { name: "Afghani Chicken (Full)", price: 450 },
                ]
            },
            {
                category: "Biryani", items: [
                    { name: "Veg Biryani", price: 130 }, { name: "Chicken Biryani", price: 160 },
                ]
            },
            {
                category: "Breads / Kulcha", items: [
                    { name: "Tandoori Roti", price: 10 }, { name: "Butter Naan", price: 20 },
                    { name: "Garlic Naan", price: 30 }, { name: "Lacha Prantha", price: 30 },
                    { name: "Amritshari Kulcha (Aloo/Pyaza)", price: 80 },
                    { name: "Amritshari Kulcha (Paneer)", price: 110 },
                    { name: "Cheese Naan With Gravy", price: 110 },
                ]
            },
        ],
    },
    {
        id: "bakerz-hub",
        name: "Bakerz Hub (NC-2)",
        tag: "📞 8947000006 • Pizza • Cafe • Bakery",
        veg: false,
        categories: [
            {
                category: "Baker'z Hub Meals", items: [
                    { name: "Veg Burger + Fries + Coke", price: 110 }, { name: "Chicken Burger + Fries + Coke", price: 130 },
                    { name: "Chicken Biryani (Half)", price: 120 }, { name: "Chicken Biryani (Full)", price: 230 },
                ]
            },
            {
                category: "Mojito", items: [
                    { name: "Masala Coke", price: 59 }, { name: "Mousami Soda", price: 59 },
                    { name: "Lemon Mint", price: 69 }, { name: "Virgin Mojito", price: 69 },
                    { name: "Green Apple", price: 89 }, { name: "Icey Blue", price: 69 },
                    { name: "Lemon Iced Tea", price: 69 },
                ]
            },
            {
                category: "Shakes", items: [
                    { name: "Banana Shake", price: 59 }, { name: "Chocolate Shake", price: 69 },
                    { name: "Chocolate Oreo Shake", price: 79 }, { name: "Strawberry Shake", price: 69 },
                ]
            },
            {
                category: "Cold Coffee", items: [
                    { name: "Classic Cold Coffee", price: 69 }, { name: "Irish Cold Coffee", price: 89 },
                    { name: "Hazelnut Cold Coffee", price: 89 }, { name: "Tiramisu Cold Coffee", price: 99 },
                ]
            },
            {
                category: "Burger", items: [
                    { name: "Veggie Burger", price: 50 }, { name: "Punjabi Masala Burger", price: 60 },
                    { name: "Mexican Cheese Burger", price: 90 }, { name: "Crispy Chaap Burger", price: 80 },
                    { name: "Chicken Burger", price: 80 }, { name: "Hot & Crispy Chicken Burger", price: 130 },
                ]
            },
            {
                category: "Sandwich", items: [
                    { name: "Veg Grilled S/D", price: 80 }, { name: "Corn Grilled S/D", price: 90 },
                    { name: "Paneer Korma S/D", price: 100 }, { name: "Paneer & Corn S/D", price: 110 },
                    { name: "Top Loaded Pizza S/D", price: 140 }, { name: "Chicken Korma S/D", price: 130 },
                    { name: "Chicken Makhani S/D", price: 130 }, { name: "Top Loaded Chicken Pizza S/D", price: 160 },
                ]
            },
            {
                category: "Patty", items: [
                    { name: "Aloo Patty", price: 25 }, { name: "Cheese & Corn Patty", price: 40 },
                    { name: "Pizza Patty", price: 50 }, { name: "Paneer Achari Patty", price: 60 },
                    { name: "Chicken Patty", price: 70 },
                ]
            },
            {
                category: "Momos", items: [
                    { name: "Veg Momos (Steam)", price: 75 }, { name: "Veg Momos (Fried)", price: 85 },
                    { name: "Veg Momos (Kurkure)", price: 95 }, { name: "Veg Momos (Achari)", price: 115 },
                    { name: "Corn Momos (Steam)", price: 85 }, { name: "Corn Momos (Fried)", price: 95 },
                    { name: "Corn Momos (Kurkure)", price: 105 }, { name: "Corn Momos (Achari)", price: 125 },
                    { name: "Paneer Momos (Steam)", price: 85 }, { name: "Paneer Momos (Fried)", price: 95 },
                    { name: "Paneer Momos (Kurkure)", price: 115 }, { name: "Paneer Momos (Achari)", price: 125 },
                    { name: "Chicken Momos (Steam)", price: 95 }, { name: "Chicken Momos (Fried)", price: 115 },
                    { name: "Chicken Momos (Kurkure)", price: 115 }, { name: "Chicken Momos (Achari)", price: 135 },
                ]
            },
            {
                category: "Noodles", items: [
                    { name: "Veg Noodle", price: 80 }, { name: "Paneer Noodle", price: 120 },
                    { name: "Hakka Noodle", price: 130 }, { name: "Egg Noodle", price: 120 },
                    { name: "Chicken Noodle", price: 120 },
                ]
            },
            {
                category: "Fried Rice", items: [
                    { name: "Veg Fried Rice", price: 80 }, { name: "Paneer Fried Rice", price: 120 },
                    { name: "Egg Fried Rice", price: 110 }, { name: "Chicken Fried Rice", price: 120 },
                ]
            },
            {
                category: "Chinese Snacks", items: [
                    { name: "Spring Roll", price: 80 }, { name: "Chilly Paneer (6pc)", price: 130 },
                    { name: "Chilly Potato", price: 100 }, { name: "Honey Chilly Potato", price: 110 },
                    { name: "Crispy Fried Chaap", price: 140 }, { name: "Chilly Chicken", price: 210 },
                    { name: "Fried Chicken (Boneless 8pc)", price: 230 },
                ]
            },
            {
                category: "Pizza (Veg)", items: [
                    { name: "Cheese & Corn Pizza", price: 110 }, { name: "Garden Fresh Pizza", price: 140 },
                    { name: "Paneer Onion Pizza", price: 160 }, { name: "Mexican Wave Pizza", price: 160 },
                    { name: "Farm House Pizza", price: 170 }, { name: "Cheese Tandoori Pizza", price: 170 },
                    { name: "Baker'z Hub Spl. Pizza", price: 210 },
                ]
            },
            {
                category: "Pizza (Non-Veg)", items: [
                    { name: "Chicken Tikka Pizza", price: 200 }, { name: "Chicken Golden Delight", price: 210 },
                    { name: "Smoked Chicken Pizza", price: 230 }, { name: "Baker'z Hub Chicken Spl. Pizza", price: 270 },
                ]
            },
            {
                category: "Wrap", items: [
                    { name: "Crispy Veg Wrap", price: 80 }, { name: "Veg Zinger (Chaap) Wrap", price: 90 },
                    { name: "Mexican Wrap", price: 100 }, { name: "Chicken Wrap", price: 110 },
                    { name: "Chicken Hot & Crispy Wrap", price: 160 },
                ]
            },
            {
                category: "American Fries", items: [
                    { name: "Golden Fries", price: 80 }, { name: "Masala Fries", price: 90 },
                    { name: "Cheezy Fries", price: 100 }, { name: "Peri Peri Fries", price: 110 },
                    { name: "Loaded Chicken Crispy Fries", price: 180 },
                ]
            },
            {
                category: "Pasta", items: [
                    { name: "White / Red Sauce Pasta (Veg)", price: 100 }, { name: "White / Red Sauce Pasta (Non-Veg)", price: 160 },
                    { name: "Mix Sauce Pasta (Veg)", price: 110 }, { name: "Mix Sauce Pasta (Non-Veg)", price: 170 },
                    { name: "Tandoori Pasta (Veg)", price: 120 }, { name: "Tandoori Pasta (Non-Veg)", price: 180 },
                    { name: "Achari Pasta (Veg)", price: 130 }, { name: "Achari Pasta (Non-Veg)", price: 190 },
                ]
            },
            {
                category: "Cake & Pastry", items: [
                    { name: "Cake & Pastry (Half Kg)", price: 350 },
                ]
            },
        ],
    },
    {
        id: "food-junction",
        name: "Food Junction (Zakir A)",
        tag: "Multi-cuisine • Main Course • Thali",
        veg: false,
        categories: [
            {
                category: "Breakfast", items: [
                    { name: "Aloo Prantha Tava Wala", price: 90 }, { name: "Mix Prantha", price: 90 },
                    { name: "Paneer Prantha", price: 100 }, { name: "Aloo Prantha Tandoor Wala", price: 100 },
                    { name: "Mix Prantha Tandoor Wala", price: 100 }, { name: "Paneer Prantha Tandoor Wala", price: 110 },
                    { name: "Maggi", price: 40 }, { name: "Veg Maggi", price: 50 },
                ]
            },
            {
                category: "Patties / Samosa", items: [
                    { name: "Samosa", price: 15 }, { name: "Single Chana Samosa", price: 40 },
                    { name: "Double Chana Samosa", price: 60 }, { name: "Chole Bhature", price: 70 },
                    { name: "Aloo Pattie", price: 20 }, { name: "Cheese Pattie", price: 30 },
                    { name: "Cheese Corn Pattie", price: 30 }, { name: "Korma Pattie", price: 40 },
                ]
            },
            {
                category: "Rice", items: [
                    { name: "Veg Fried Rice", price: 80 }, { name: "Paneer Rice", price: 90 },
                    { name: "Chana Rice", price: 60 }, { name: "Rajma Rice", price: 60 },
                    { name: "Mushroom Fried Rice", price: 90 },
                ]
            },
            {
                category: "Pasta", items: [
                    { name: "Red Sauce Pasta", price: 100 }, { name: "White Sauce Pasta", price: 100 },
                    { name: "Mix Sauce Pasta", price: 100 },
                ]
            },
            {
                category: "Noodles", items: [
                    { name: "Veg Noodles", price: 80 }, { name: "Chilli Garlic Noodles", price: 90 },
                    { name: "Hakka Noodles", price: 100 }, { name: "Paneer Noodles", price: 100 },
                ]
            },
            {
                category: "Main Course", items: [
                    { name: "Shahi Paneer (Half)", price: 140 }, { name: "Shahi Paneer (Full)", price: 200 },
                    { name: "Kadhai Paneer (Half)", price: 140 }, { name: "Kadhai Paneer (Full)", price: 200 },
                    { name: "Paneer Butter Masala (Half)", price: 140 }, { name: "Paneer Butter Masala (Full)", price: 200 },
                    { name: "Paneer Bhurji (Half)", price: 150 }, { name: "Paneer Bhurji (Full)", price: 200 },
                    { name: "Paneer Do Payja (Half)", price: 150 }, { name: "Paneer Do Payja (Full)", price: 200 },
                    { name: "Rahra Paneer (Half)", price: 150 }, { name: "Rahra Paneer (Full)", price: 200 },
                    { name: "Masala Chaap Gravy (Half)", price: 150 }, { name: "Masala Chaap Gravy (Full)", price: 200 },
                    { name: "Malai Chaap Gravy (Half)", price: 150 }, { name: "Malai Chaap Gravy (Full)", price: 200 },
                    { name: "Dal Makhani", price: 120 }, { name: "Channa Masala", price: 150 },
                ]
            },
            {
                category: "Roti / Naan", items: [
                    { name: "Tandoori Roti", price: 10 }, { name: "Butter Naan", price: 20 },
                    { name: "Missi Roti", price: 25 }, { name: "Lacha Parntha", price: 20 },
                    { name: "Amirtsari Naan Chole", price: 100 },
                ]
            },
            {
                category: "Roll", items: [
                    { name: "Spring Roll", price: 60 }, { name: "Veg Roll", price: 50 },
                    { name: "Paneer Roll", price: 80 }, { name: "Soya Chaap Roll", price: 80 },
                    { name: "Cheese Corn Roll", price: 80 }, { name: "Cheese Finger", price: 100 },
                    { name: "Kathi Roll", price: 60 },
                ]
            },
            {
                category: "Chinese", items: [
                    { name: "Veg Manchurian", price: 100 }, { name: "Steam Momos", price: 60 },
                    { name: "Fried Momos", price: 70 }, { name: "Chilly Paneer", price: 120 },
                    { name: "Mushroom Chilli", price: 100 },
                ]
            },
            {
                category: "Burger", items: [
                    { name: "Aloo Tikki Burger", price: 50 }, { name: "Cheese Burger", price: 60 },
                    { name: "Paneer Burger", price: 60 }, { name: "King Burger", price: 80 },
                    { name: "Mexican Burger", price: 80 },
                ]
            },
            {
                category: "Sandwich", items: [
                    { name: "Veg Grilled Sandwich", price: 70 }, { name: "Aloo Tikka Sandwich", price: 80 },
                    { name: "Cheese Corn Sandwich", price: 80 }, { name: "Paneer Tikka Sandwich", price: 80 },
                    { name: "Mexican Sandwich", price: 90 }, { name: "Paneer Korma Sandwich", price: 90 },
                ]
            },
            {
                category: "Fries", items: [
                    { name: "Golden Fries", price: 70 }, { name: "Chilli Potato", price: 90 },
                    { name: "Honey Chilli", price: 90 },
                ]
            },
            {
                category: "Beverages", items: [
                    { name: "Chai", price: 15 }, { name: "Kuladh Chai", price: 20 },
                    { name: "Hot Coffee", price: 30 }, { name: "Sweet Lassi", price: 40 },
                    { name: "Mango Lassi", price: 60 }, { name: "Cold Coffee", price: 60 },
                    { name: "Banana Shake", price: 50 }, { name: "Butterscotch Shake", price: 60 },
                    { name: "Kesar Pista Shake", price: 60 }, { name: "Vanilla Shake", price: 60 },
                    { name: "Strawberry Shake", price: 60 }, { name: "Black Current Shake", price: 60 },
                    { name: "Chocolate Shake", price: 60 }, { name: "Oreo Shake", price: 60 },
                ]
            },
            {
                category: "Mojitos", items: [
                    { name: "Nimbu Panni", price: 30 }, { name: "Lime Soda", price: 40 },
                    { name: "Kala Khata", price: 60 }, { name: "Virgin Mojito", price: 60 },
                    { name: "Green Apple", price: 60 }, { name: "Ice Blue", price: 60 },
                ]
            },
            {
                category: "Indian Thali", items: [
                    { name: "Veg Thali", price: 100 }, { name: "Deluxe Thali", price: 110 },
                ]
            },
            {
                category: "Combo", items: [
                    { name: "Kadhai Paneer + 2 Butter Naan", price: 150 },
                    { name: "Soya Chaap Gravy + 2 Butter Naan", price: 150 },
                    { name: "Shahi Paneer + 2 Butter Naan", price: 150 },
                    { name: "Butter Masala + 2 Butter Naan", price: 150 },
                ]
            },
        ],
    },
    {
        id: "king-cafe",
        name: "King Cafe (Zakir B)",
        tag: "📞 8877263548 • Full Menu • Tandoori • Main Course",
        veg: false,
        categories: [
            {
                category: "Breakfast", items: [
                    { name: "Chole Bhature", price: 70 }, { name: "Aloo Parantha", price: 80 },
                    { name: "Paneer Parantha", price: 90 }, { name: "Mix Parantha", price: 90 },
                    { name: "Amritsari Kulcha", price: 110 }, { name: "Bread Omelette", price: 50 },
                    { name: "Omelette", price: 30 }, { name: "Samosa", price: 15 }, { name: "Chana Samosa", price: 60 },
                ]
            },
            {
                category: "Beverages / Shakes", items: [
                    { name: "Karak Chai", price: 20 }, { name: "Hot Coffee", price: 60 },
                    { name: "Cold Coffee", price: 60 }, { name: "Mango Shake", price: 60 },
                    { name: "Banana Shake", price: 50 }, { name: "Butterscotch Shake", price: 60 },
                    { name: "Strawberry Shake", price: 60 }, { name: "Oreo Shake", price: 60 },
                    { name: "Kit Kat Shake", price: 60 }, { name: "Chocolate Shake", price: 60 },
                ]
            },
            {
                category: "Combo / Thali", items: [
                    { name: "Veg Burger + Fries + Coke", price: 130 }, { name: "Paneer Thali", price: 130 },
                    { name: "Chicken Thali", price: 160 }, { name: "Chaap Thali", price: 140 },
                    { name: "Veg Thali", price: 90 }, { name: "Spl. Paneer Thali", price: 140 },
                ]
            },
            {
                category: "Kathi Roll", items: [
                    { name: "Spring Roll", price: 60 }, { name: "Veg Roll", price: 50 },
                    { name: "Egg Roll", price: 60 }, { name: "Paneer Roll", price: 80 },
                    { name: "Chicken Roll", price: 100 },
                ]
            },
            {
                category: "Mojito's", items: [
                    { name: "Lime Soda", price: 40 }, { name: "Lime Water", price: 30 },
                    { name: "Ice Blue", price: 60 }, { name: "Green Apple", price: 60 },
                    { name: "Watermelon", price: 60 }, { name: "Virgin Mojito", price: 60 },
                    { name: "Kala Khatta", price: 60 }, { name: "Ice Tea", price: 60 },
                ]
            },
            {
                category: "Fries", items: [
                    { name: "Golden Fries", price: 70 }, { name: "Masala Fries", price: 80 },
                    { name: "Peri Peri Fries", price: 90 }, { name: "Mexican Fries", price: 100 },
                    { name: "Chilli Potato", price: 90 }, { name: "Honey Chilli Potato", price: 100 },
                ]
            },
            {
                category: "Sandwich", items: [
                    { name: "Veg Sandwich", price: 70 }, { name: "Paneer Tikki Sandwich", price: 90 },
                    { name: "Aloo Tikki Sandwich", price: 80 }, { name: "Cheese Sandwich", price: 80 },
                    { name: "Paneer Korma Sandwich", price: 90 }, { name: "Chicken Sandwich", price: 100 },
                ]
            },
            {
                category: "Burger", items: [
                    { name: "Aloo Tikki Burger", price: 50 }, { name: "Cheese Burger", price: 60 },
                    { name: "Paneer Burger", price: 80 }, { name: "Mexican Burger", price: 100 },
                    { name: "King Burger", price: 100 }, { name: "Chicken Burger", price: 80 },
                    { name: "Chicken Cheese Burger", price: 90 },
                ]
            },
            {
                category: "Bread / Naan", items: [
                    { name: "Tawa Roti", price: 10 }, { name: "Tandoori Roti", price: 12 },
                    { name: "Butter Naan", price: 25 }, { name: "Garlic Naan", price: 35 },
                    { name: "Laccha Parantha", price: 45 }, { name: "Stuff Naan", price: 25 },
                    { name: "Missi Roti", price: 25 },
                ]
            },
            {
                category: "Rice", items: [
                    { name: "Veg Fried Rice", price: 80 }, { name: "Chole Rice", price: 50 },
                    { name: "Paneer Fried Rice", price: 100 }, { name: "Chicken Fried Rice", price: 110 },
                    { name: "Egg Fried Rice", price: 90 }, { name: "Paneer Rice", price: 100 },
                    { name: "Chicken Rice", price: 130 },
                ]
            },
            {
                category: "Veg Main Course", items: [
                    { name: "Kali Mirch Paneer (Half)", price: 160 }, { name: "Kali Mirch Paneer (Full)", price: 250 },
                    { name: "Paneer Changezi (Half)", price: 160 }, { name: "Paneer Changezi (Full)", price: 260 },
                    { name: "Shahi Paneer (Half)", price: 150 }, { name: "Shahi Paneer (Full)", price: 240 },
                    { name: "Kadhai Paneer (Half)", price: 150 }, { name: "Kadhai Paneer (Full)", price: 240 },
                    { name: "Paneer Butter Masala (Half)", price: 150 }, { name: "Paneer Butter Masala (Full)", price: 240 },
                    { name: "Paneer Lababdar (Half)", price: 150 }, { name: "Paneer Lababdar (Full)", price: 240 },
                    { name: "Gravy Chaap (Half)", price: 150 }, { name: "Gravy Chaap (Full)", price: 200 },
                    { name: "Chana Masala (Half)", price: 110 }, { name: "Chana Masala (Full)", price: 150 },
                ]
            },
            {
                category: "Non-Veg Main Course", items: [
                    { name: "Handi Chicken (Half)", price: 260 }, { name: "Handi Chicken (Full)", price: 440 },
                    { name: "Chicken Changezi (Half)", price: 270 }, { name: "Chicken Changezi (Full)", price: 450 },
                    { name: "Chicken Kali Mirch (Half)", price: 250 }, { name: "Chicken Kali Mirch (Full)", price: 410 },
                    { name: "Tawa Chicken Spl. (Half)", price: 260 }, { name: "Tawa Chicken Spl. (Full)", price: 440 },
                    { name: "Kadhai Chicken (Half)", price: 240 }, { name: "Kadhai Chicken (Full)", price: 410 },
                    { name: "Rara Chicken (Half)", price: 260 }, { name: "Rara Chicken (Full)", price: 430 },
                    { name: "Chicken Butter Masala (Half)", price: 250 }, { name: "Chicken Butter Masala (Full)", price: 430 },
                    { name: "Butter Chicken (Half)", price: 240 }, { name: "Butter Chicken (Full)", price: 410 },
                ]
            },
            {
                category: "Pasta", items: [
                    { name: "White Sauce Pasta", price: 100 }, { name: "Red Sauce Pasta", price: 100 },
                    { name: "Mix Sauce Pasta", price: 100 }, { name: "Tandoori Sauce Pasta", price: 110 },
                ]
            },
            {
                category: "Noodles", items: [
                    { name: "Veg Noodles", price: 80 }, { name: "Paneer Noodles", price: 100 },
                    { name: "Chilli Garlic Noodles", price: 90 }, { name: "Hakka Noodles", price: 110 },
                    { name: "Chicken Noodle", price: 120 }, { name: "Chilli Garlic Chicken Noodle", price: 120 },
                    { name: "Chicken Hakka Noodles", price: 120 },
                ]
            },
            {
                category: "Tandoori Snacks", items: [
                    { name: "Paneer Tikka", price: 220 }, { name: "Tandoori Chaap", price: 150 },
                    { name: "Paneer Malai Tikka", price: 240 }, { name: "Chicken Tikka", price: 250 },
                    { name: "Malai Chicken", price: 270 }, { name: "Tandoori Chicken", price: 250 },
                ]
            },
            {
                category: "Snacks", items: [
                    { name: "Chicken Chilli (Half)", price: 200 }, { name: "Chicken Chilli (Full)", price: 330 },
                    { name: "Chicken Manchurian (Half)", price: 200 }, { name: "Chicken Manchurian (Full)", price: 350 },
                    { name: "Chicken Lollipop (Half)", price: 200 }, { name: "Chicken Lollipop (Full)", price: 350 },
                    { name: "Chilli Paneer (Half)", price: 150 }, { name: "Chilli Paneer (Full)", price: 220 },
                    { name: "Veg Manchurian (Half)", price: 90 }, { name: "Veg Manchurian (Full)", price: 150 },
                ]
            },
            {
                category: "Dessert", items: [
                    { name: "Kheer", price: 40 }, { name: "Gulab Jamun", price: 50 },
                    { name: "Brownie with Ice Cream", price: 60 },
                ]
            },
        ],
    },
    {
        id: "handi-biryani",
        name: "Handi Biryani (Zakir D)",
        tag: "Biryani • Indian Main Course • Chinese",
        veg: false,
        categories: [
            {
                category: "Hyd. Dum Biryani (Veg)", items: [
                    { name: "Subz Biryani (Half)", price: 195 }, { name: "Subz Biryani (Full)", price: 289 },
                    { name: "Paneer Tikka Biryani (Half)", price: 210 }, { name: "Paneer Tikka Biryani (Full)", price: 305 },
                ]
            },
            {
                category: "Hyd. Dum Biryani (Non-Veg)", items: [
                    { name: "Chicken Biryani (Half)", price: 220 }, { name: "Chicken Biryani (Full)", price: 315 },
                    { name: "Boneless Chicken Biryani (Half)", price: 238 }, { name: "Boneless Chicken Biryani (Full)", price: 325 },
                    { name: "Chicken Tikka Biryani (Half)", price: 245 }, { name: "Chicken Tikka Biryani (Full)", price: 330 },
                ]
            },
            {
                category: "Non-Veg Chinese", items: [
                    { name: "Chicken Noodles", price: 120 }, { name: "Egg Noodles", price: 100 },
                    { name: "Chicken Fried Rice", price: 120 }, { name: "Egg Fried Rice", price: 110 },
                    { name: "Schezwan Chicken Fried Rice", price: 120 },
                    { name: "Chilli Chicken Boneless", price: 180 },
                ]
            },
            {
                category: "Veg Chinese", items: [
                    { name: "Veg Noodles", price: 80 }, { name: "Chilli Garlic Noodles", price: 90 },
                    { name: "Hakka Noodles", price: 90 }, { name: "Cheese Noodles", price: 100 },
                    { name: "Veg Fried Rice", price: 100 }, { name: "Chilli Garlic Fried Rice", price: 90 },
                    { name: "Schezwan Fries Rice", price: 100 },
                    { name: "Chilli Paneer", price: 150 }, { name: "Veg Manchurian", price: 100 },
                    { name: "Honey Chilli Potato", price: 90 }, { name: "Honey Chilli Cauliflower", price: 100 },
                    { name: "Spring Roll", price: 60 },
                ]
            },
            {
                category: "Burger & Patties", items: [
                    { name: "Aloo Tikki Burger", price: 50 }, { name: "Aloo Tikki Cheese Burger", price: 60 },
                    { name: "Chicken Burger", price: 70 }, { name: "Chicken Cheese Burger", price: 80 },
                    { name: "Cheese Corn Sandwich", price: 80 }, { name: "Paneer Tikka Sandwich", price: 90 },
                    { name: "Aloo Patty", price: 25 }, { name: "Cheese Corn Patty", price: 35 },
                    { name: "French Fries", price: 70 }, { name: "Masala Fries", price: 80 },
                ]
            },
            {
                category: "Main Course (Veg)", items: [
                    { name: "Dal Makhani (Half)", price: 100 }, { name: "Dal Makhani (Full)", price: 150 },
                    { name: "Kadhai Paneer (Half)", price: 140 }, { name: "Kadhai Paneer (Full)", price: 210 },
                    { name: "Shahi Paneer (Half)", price: 140 }, { name: "Shahi Paneer (Full)", price: 210 },
                    { name: "Paneer 2 Pyaza (Half)", price: 140 }, { name: "Paneer 2 Pyaza (Full)", price: 210 },
                    { name: "Paneer Butter Masala (Half)", price: 140 }, { name: "Paneer Butter Masala (Full)", price: 210 },
                    { name: "Channa Masala (Half)", price: 90 }, { name: "Channa Masala (Full)", price: 150 },
                    { name: "Soya Chaap Masala", price: 170 },
                ]
            },
            {
                category: "Main Course (Non-Veg)", items: [
                    { name: "Butter Chicken (Half)", price: 230 }, { name: "Butter Chicken (Full)", price: 390 },
                    { name: "Kadhai Chicken (Half)", price: 230 }, { name: "Kadhai Chicken (Full)", price: 390 },
                    { name: "Chicken Lababdar (Half)", price: 230 }, { name: "Chicken Lababdar (Full)", price: 390 },
                    { name: "Rara Chicken (Half)", price: 250 }, { name: "Rara Chicken (Full)", price: 400 },
                ]
            },
            {
                category: "Rice Combo", items: [
                    { name: "Channa Rice (Half)", price: 50 }, { name: "Channa Rice (Full)", price: 70 },
                    { name: "Rajma Rice (Half)", price: 50 }, { name: "Rajma Rice (Full)", price: 70 },
                    { name: "Paneer Rice (Half)", price: 80 }, { name: "Paneer Rice (Full)", price: 100 },
                ]
            },
            {
                category: "Veg Combo", items: [
                    { name: "Dal Makhani + 2 Butter Naan", price: 110 },
                    { name: "Kadhai Paneer + 2 Butter Naan", price: 140 },
                    { name: "Shahi Paneer + 2 Butter Naan", price: 140 },
                    { name: "Channa Masala + 2 Butter Naan", price: 140 },
                    { name: "Cheese Naan With Gravy", price: 100 },
                ]
            },
            {
                category: "Non-Veg Combo", items: [
                    { name: "Butter Chicken + 2 Butter Naan", price: 170 },
                    { name: "Kadhai Chicken + 2 Butter Naan", price: 170 },
                    { name: "Masala Chicken + 2 Butter Naan", price: 170 },
                ]
            },
            {
                category: "Paratha", items: [
                    { name: "Aloo Paratha + Channa", price: 60 }, { name: "Mix Paratha + Channa", price: 80 },
                    { name: "Paneer Paratha + Channa", price: 90 },
                ]
            },
            {
                category: "Bread", items: [
                    { name: "Tandoori Roti", price: 12 }, { name: "Butter Naan", price: 25 },
                    { name: "Lacha Paratha", price: 35 },
                ]
            },
        ],
    },
    {
        id: "barkat-food",
        name: "Barkat Food (Zakir C)",
        tag: "📞 7056853177 • Main Course • Biryani • Chinese",
        veg: false,
        categories: [
            {
                category: "Breakfast", items: [
                    { name: "Aloo Parantha (2 Pcs)", price: 70 }, { name: "Mix Parantha (2 Pcs)", price: 80 },
                    { name: "Paneer Parantha (2 Pcs)", price: 90 }, { name: "Chole Bhature", price: 70 },
                    { name: "Samosa", price: 15 }, { name: "Samosa With Chole", price: 50 },
                    { name: "Bread Omelette", price: 50 },
                ]
            },
            {
                category: "Patty", items: [
                    { name: "Aloo Patty", price: 20 }, { name: "Cheese Patty", price: 25 },
                    { name: "Cheese Corn", price: 30 }, { name: "Paneer Korma", price: 40 },
                    { name: "Tandoori Patty", price: 50 },
                ]
            },
            {
                category: "Burger", items: [
                    { name: "Aloo Tikki Burger", price: 50 }, { name: "Cheese Burger", price: 60 },
                    { name: "Paneer Burger", price: 70 }, { name: "Chicken Burger", price: 70 },
                    { name: "Mexican Burger", price: 80 }, { name: "Egg Burger", price: 70 },
                ]
            },
            {
                category: "Pasta", items: [
                    { name: "Red Sauce Pasta", price: 100 }, { name: "White Sauce Pasta", price: 100 },
                    { name: "Mix Sauce Pasta", price: 100 }, { name: "Makhani Pasta", price: 110 },
                    { name: "Chicken Pasta", price: 150 },
                ]
            },
            {
                category: "Noodles", items: [
                    { name: "Veg Noodles", price: 80 }, { name: "Chilli Garlic Noodles", price: 90 },
                    { name: "Hakka Noodles", price: 100 }, { name: "Paneer Noodles", price: 100 },
                    { name: "Egg Noodles", price: 100 }, { name: "Chicken Noodles", price: 100 },
                    { name: "Singapuri Noodles", price: 90 }, { name: "Manchurian Noodles", price: 120 },
                ]
            },
            {
                category: "Fried Rice", items: [
                    { name: "Veg Fried Rice", price: 80 }, { name: "Garlic Fried Rice", price: 90 },
                    { name: "Egg Fried Rice", price: 90 }, { name: "Paneer Fried Rice", price: 100 },
                    { name: "Chicken Fried Rice", price: 110 },
                ]
            },
            {
                category: "Roll", items: [
                    { name: "Veg Roll", price: 50 }, { name: "Double Egg Roll", price: 60 },
                    { name: "Cheese Corn Roll", price: 70 }, { name: "Soya Chaap Roll", price: 70 },
                    { name: "Cheese Corn Roll", price: 90 }, { name: "Paneer Roll", price: 80 },
                    { name: "Chicken Roll", price: 100 },
                ]
            },
            {
                category: "Fries", items: [
                    { name: "Golden Fries", price: 70 }, { name: "Masala Fries", price: 80 },
                    { name: "Peri Peri Fries", price: 80 }, { name: "Mexican Fries", price: 100 },
                    { name: "Cheese Fries", price: 100 }, { name: "Chilli Potato", price: 90 },
                    { name: "Honey Chilli Potato", price: 100 },
                ]
            },
            {
                category: "Chinese", items: [
                    { name: "Veg Momos", price: 70 }, { name: "Kurkure Momos", price: 90 },
                    { name: "Chilli Momos", price: 120 }, { name: "Spring Roll", price: 60 },
                    { name: "Veg Manchurian (Half)", price: 90 }, { name: "Veg Manchurian (Full)", price: 150 },
                    { name: "Chilli Paneer (Half)", price: 150 }, { name: "Chilli Paneer (Full)", price: 220 },
                    { name: "Chilli Chicken (Half)", price: 180 }, { name: "Chilli Chicken (Full)", price: 320 },
                    { name: "Fried Chicken (Half)", price: 150 }, { name: "Fried Chicken (Full)", price: 250 },
                ]
            },
            {
                category: "Roti & Naan", items: [
                    { name: "Tawa Roti", price: 8 }, { name: "Tandoori Roti", price: 12 },
                    { name: "Naan", price: 25 }, { name: "Laccha Parantha", price: 35 },
                ]
            },
            {
                category: "Thali & Combo", items: [
                    { name: "Paneer Thali", price: 130 }, { name: "Chicken Thali", price: 160 },
                    { name: "Cheese Naan With Gravy", price: 100 }, { name: "Chur Chur Naan", price: 150 },
                    { name: "Amritsari Naan", price: 110 },
                ]
            },
            {
                category: "Beverage", items: [
                    { name: "Tea", price: 15 }, { name: "Coffee", price: 30 },
                    { name: "Banana Shake", price: 50 }, { name: "Cold Coffee", price: 60 },
                    { name: "Mango Shake", price: 60 }, { name: "Strawberry Shake", price: 60 },
                    { name: "Black Current Shake", price: 60 }, { name: "Vanilla Shake", price: 60 },
                    { name: "Butterscotch Shake", price: 60 }, { name: "Chocolate Shake", price: 60 },
                    { name: "Oreo Shake", price: 60 }, { name: "Lassi", price: 50 },
                ]
            },
            {
                category: "Sandwich", items: [
                    { name: "Veg Grilled Sandwich", price: 70 }, { name: "Cheese Sandwich", price: 80 },
                    { name: "Aloo Tikka Sandwich", price: 80 }, { name: "Paneer Tikka Sandwich", price: 90 },
                    { name: "Chicken Sandwich", price: 100 }, { name: "BBQ Chicken Sandwich", price: 120 },
                ]
            },
            {
                category: "Spl. Gym Diet", items: [
                    { name: "Boil Chicken", price: 140 }, { name: "Grill Chicken", price: 160 },
                    { name: "Chicken Salad", price: 180 }, { name: "Grilled Fish", price: 160 },
                ]
            },
            {
                category: "Indian Main Course", items: [
                    { name: "Dal Makhni (Half)", price: 100 }, { name: "Dal Makhni (Full)", price: 150 },
                    { name: "Channa Masala (Half)", price: 110 }, { name: "Channa Masala (Full)", price: 150 },
                    { name: "Shahi Paneer (Half)", price: 130 }, { name: "Shahi Paneer (Full)", price: 210 },
                    { name: "Kadhai Paneer (Half)", price: 140 }, { name: "Kadhai Paneer (Full)", price: 210 },
                    { name: "Paneer Do Pyaza (Half)", price: 140 }, { name: "Paneer Do Pyaza (Full)", price: 210 },
                    { name: "Butter Chicken (Half)", price: 230 }, { name: "Butter Chicken (Full)", price: 390 },
                    { name: "Kadhai Chicken (Half)", price: 230 }, { name: "Kadhai Chicken (Full)", price: 390 },
                    { name: "Chicken Lababdar (Half)", price: 230 }, { name: "Chicken Lababdar (Full)", price: 390 },
                ]
            },
            {
                category: "Rice & Biryani", items: [
                    { name: "Chole Rice", price: 50 }, { name: "Paneer Rice", price: 80 },
                    { name: "Veg Biryani", price: 100 }, { name: "Chicken Biryani", price: 150 },
                ]
            },
            {
                category: "Dessert", items: [
                    { name: "Kheer", price: 40 }, { name: "Gulab Jamun", price: 50 },
                    { name: "Cake & Pastries (1 Cup)", price: 50 }, { name: "Brownie with Ice Cream", price: 60 },
                ]
            },
            {
                category: "Mojito's", items: [
                    { name: "Lime Soda", price: 40 }, { name: "Lime Water", price: 30 },
                    { name: "Ice Blue", price: 60 }, { name: "Green Apple", price: 60 },
                    { name: "Water Melon", price: 60 }, { name: "Virgin Mojito", price: 60 },
                    { name: "Kala Khatta", price: 60 },
                ]
            },
        ],
    },
];
