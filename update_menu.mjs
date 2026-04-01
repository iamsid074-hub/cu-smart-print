import fs from 'fs';
const file = 'c:/Users/A/OneDrive/Desktop/BAZZAR/src/config/shopMenus.ts';
let content = fs.readFileSync(file, 'utf8');

const newCategoriesUnquoted = \        categories: [
            {
                category: "Bombay Bites",
                items: [
                    { name: "Mumbai Aloo Vadapav", price: 40 },
                    { name: "Onion Vadapav", price: 36 },
                    { name: "Schezwan Vadapav", price: 40 },
                    { name: "Cheese Vada Pav", price: 40 },
                    { name: "Samosa", price: 16 },
                    { name: "Samosa with Chana", price: 36 },
                    { name: "Kachori with Sabji", price: 30 },
                    { name: "Chole Bhature", price: 70 },
                    { name: "Pav Bhaji", price: 100 }
                ]
            },
            {
                category: "Chaat",
                items: [
                    { name: "Pani Puri (6pc)", price: 40 },
                    { name: "Stuffed Pani Puri (5pc)", price: 60 },
                    { name: "Bhelpuri", price: 60 },
                    { name: "Aloo Tikki", price: 70 },
                    { name: "Bhalla Papdi Chaat", price: 70 },
                    { name: "Dahi Bhalla", price: 70 },
                    { name: "Protein Chaat", price: 80 }
                ]
            },
            {
                category: "Chowmien",
                items: [
                    { name: "Veg Noodles", price: 60 },
                    { name: "Chilli Garlic Noodles", price: 70 },
                    { name: "Singapore Noodles", price: 90 },
                    { name: "Paneer Noodles", price: 90 },
                    { name: "Schezwan Noodles", price: 90 },
                    { name: "Hakka Noodles", price: 90 },
                    { name: "Chicken Noodles", price: 100 }
                ]
            },
            {
                category: "Burgers",
                items: [
                    { name: "Aloo Tikki Burger", price: 50 },
                    { name: "Veg Burger", price: 50 },
                    { name: "Noodle Tikki Burger", price: 60 },
                    { name: "Cheese Burger", price: 60 },
                    { name: "Cheese Slice Veg Burger", price: 70 },
                    { name: "Double Tikki Burger", price: 70 },
                    { name: "Paneer Tikki Burger", price: 80 },
                    { name: "Special Makni Burger", price: 100 },
                    { name: "Chicken Burger", price: 80 },
                    { name: "Chicken Burger with Cheese", price: 90 }
                ]
            },
            {
                category: "Snacks",
                items: [
                    { name: "Spring Rolls", price: 60 },
                    { name: "Veg Bullet", price: 60 },
                    { name: "Manchurian Dry", price: 100 },
                    { name: "Honey Chilli Potato", price: 110 },
                    { name: "Manchurian Gravy", price: 100 },
                    { name: "Chilli Paneer", price: 160 }
                ]
            },
            {
                category: "Steamed Sensation",
                items: [
                    { name: "Sweet Corn Salted", price: 50 },
                    { name: "Masala Sweet Corn", price: 60 },
                    { name: "Cheesy Sweet Corn", price: 70 },
                    { name: "Veg Momos", price: 60 },
                    { name: "Fried Momos", price: 70 },
                    { name: "Kurkure Momos", price: 80 },
                    { name: "Afghani Momos", price: 90 }
                ]
            },
            {
                category: "Rice Combo",
                items: [
                    { name: "Rajma Chawal", price: 80 },
                    { name: "Cholle Chawal", price: 80 },
                    { name: "Kadhi Chawal", price: 80 },
                    { name: "Dal Chawal", price: 80 },
                    { name: "Paneer Chawal", price: 100 }
                ]
            },
            {
                category: "Fries",
                items: [
                    { name: "Salted Fries", price: 70 },
                    { name: "Peri Peri Fries", price: 80 },
                    { name: "Cheesy Fries", price: 90 },
                    { name: "Makni Fries", price: 100 },
                    { name: "Honey Chilli Fries", price: 110 },
                    { name: "Mexican Fries", price: 110 }
                ]
            },
            {
                category: "Beverages",
                items: [
                    { name: "Tea", price: 15 },
                    { name: "Coffee", price: 30 },
                    { name: "Milk / Bournvita", price: 35 },
                    { name: "Cappuccino", price: 35 },
                    { name: "Nimbu Pani", price: 35 },
                    { name: "Masala Lime Soda", price: 45 },
                    { name: "Cold Coffee", price: 60 }
                ]
            },
            {
                category: "Shakes",
                items: [
                    { name: "Banana Shake", price: 60 },
                    { name: "Mango Shake", price: 60 },
                    { name: "Vanilla Shake", price: 60 },
                    { name: "Chocolate Shake", price: 60 },
                    { name: "Strawberry Shake", price: 60 },
                    { name: "Butterscotch Shake", price: 60 },
                    { name: "Oreo Shake", price: 80 },
                    { name: "KitKat Shake", price: 80 },
                    { name: "Hazelnut Coffee", price: 70 }
                ]
            },
            {
                category: "Omelette",
                items: [
                    { name: "Boiled Egg", price: 15 },
                    { name: "Omelette", price: 40 },
                    { name: "2 Egg Bhurji", price: 45 },
                    { name: "Bread Omelette", price: 60 },
                    { name: "Omelette with Veggies", price: 55 },
                    { name: "Bread Omelette with Cheese", price: 70 }
                ]
            },
            {
                category: "Patties",
                items: [
                    { name: "Veg Patty", price: 20 },
                    { name: "Veg Patty with Cheese", price: 30 },
                    { name: "Veg Cheese Corn Patty", price: 40 },
                    { name: "Paneer Patty", price: 40 },
                    { name: "Chicken Patty", price: 60 }
                ]
            },
            {
                category: "Parantha",
                items: [
                    { name: "Aloo Parantha", price: 30 },
                    { name: "Pyaz Parantha", price: 30 },
                    { name: "Aloo Pyaz Parantha", price: 35 },
                    { name: "Gobhi Parantha", price: 45 },
                    { name: "Paneer Parantha", price: 50 }
                ]
            },
            {
                category: "Maggi",
                items: [
                    { name: "Simple Maggi", price: 55 },
                    { name: "Masala Maggi", price: 60 },
                    { name: "Veg Maggi", price: 65 },
                    { name: "Chilly Maggi", price: 70 },
                    { name: "Paneer Maggi", price: 75 }
                ]
            },
            {
                category: "Rolls",
                items: [
                    { name: "Noodle Roll", price: 50 },
                    { name: "Egg Roll", price: 50 },
                    { name: "Aloo Roll", price: 50 },
                    { name: "Veg Roll", price: 60 },
                    { name: "Paneer Roll", price: 80 },
                    { name: "Chicken Roll", price: 90 }
                ]
            },
            {
                category: "Sandwich",
                items: [
                    { name: "Aloo Sandwich", price: 50 },
                    { name: "Corn Sandwich", price: 60 },
                    { name: "Veg Grilled Sandwich", price: 70 },
                    { name: "Paneer Grilled Sandwich", price: 80 },
                    { name: "Jambo Sandwich", price: 100 },
                    { name: "Chicken Sandwich", price: 100 }
                ]
            },
            {
                category: "Rice & Wraps",
                items: [
                    { name: "Veg Fried Rice", price: 70 },
                    { name: "Paneer Fried Rice", price: 90 },
                    { name: "Egg Fried Rice", price: 80 },
                    { name: "Chicken Fried Rice", price: 120 },
                    { name: "Chicken Biryani", price: 160 },
                    { name: "Chicken Gravy with Rice", price: 130 },
                    { name: "Egg Wrap", price: 50 },
                    { name: "Aloo Tikki Wrap", price: 60 },
                    { name: "Veg Wrap", price: 70 },
                    { name: "Paneer Wrap", price: 90 },
                    { name: "Chicken Wrap", price: 100 }
                ]
            },
            {
                category: "Pasta",
                items: [
                    { name: "Red Sauce Pasta", price: 90 },
                    { name: "White Sauce Pasta", price: 90 },
                    { name: "Makhni Sauce Pasta", price: 110 },
                    { name: "Schezwan Sauce Pasta", price: 100 },
                    { name: "Mix Sauce Pasta", price: 110 },
                    { name: "Chicken Pasta", price: 130 }
                ]
            },
            {
                category: "Desserts",
                items: [
                    { name: "Brownie", price: 50 },
                    { name: "Brownie with Ice Cream", price: 70 },
                    { name: "Sizzling Brownie", price: 80 }
                ]
            },
            {
                category: "Chicken Items",
                items: [
                    { name: "Chicken Kulcha", price: 100 }
                ]
            }
        ]\;

let lines = content.split('\\n');
let newLines = [];
let insideChatori1 = false;
let insideChatori2 = false;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('id: "chatori-chai-kulcha"')) {
        insideChatori1 = true;
    }
    if (lines[i].includes('id: "chatori-chaat"')) {
        insideChatori2 = true;
    }
    
    if (insideChatori1 && lines[i].includes('categories: [')) {
        newLines.push(newCategoriesUnquoted);
        let braceLevel = 0;
        let started = false;
        let j = i;
        while (j < lines.length) {
            if (lines[j].includes('[')) braceLevel += lines[j].split('[').length - 1;
            if (lines[j].includes(']')) braceLevel -= lines[j].split(']').length - 1;
            started = true;
            if (started && braceLevel === 0) {
                i = j;
                insideChatori1 = false;
                break;
            }
            j++;
        }
        continue;
    }

    if (insideChatori2 && lines[i].includes('categories: [')) {
        newLines.push(newCategoriesUnquoted);
        let braceLevel = 0;
        let started = false;
        let j = i;
        while (j < lines.length) {
            if (lines[j].includes('[')) braceLevel += lines[j].split('[').length - 1;
            if (lines[j].includes(']')) braceLevel -= lines[j].split(']').length - 1;
            started = true;
            if (started && braceLevel === 0) {
                i = j;
                insideChatori2 = false;
                break;
            }
            j++;
        }
        continue;
    }
    
    newLines.push(lines[i]);
}

fs.writeFileSync(file, newLines.join('\\n'), 'utf8');
console.log('SUCCESSFULLY UPDATED SHOPMENUS.TS');
