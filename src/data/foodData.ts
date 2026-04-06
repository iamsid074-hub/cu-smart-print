import { shops } from "@/config/shopMenus";

export const comboItems = [
  {
    id: "combo-1",
    name: "Pasta & Burger Feast",
    shop: "Multi-Shop Special",
    rating: 4.8,
    description: "White Sauce Pasta + Veg Burger + 2 Mountain Dew",
    price: 199,
    image: "/banners/combo_1.webp",
  },
  {
    id: "combo-2",
    name: "Vada Pav Delight",
    shop: "Bombay Bites Special",
    rating: 4.7,
    description: "2 Mumbai Vada Pav + Mountain Dew",
    price: 110,
    image: "/banners/combo_2.webp",
  },
  {
    id: "combo-3",
    name: "Street Style Snack",
    shop: "Chatori Chaat Special",
    rating: 4.9,
    description: "Pani Puri (6 Pieces)",
    price: 90,
    image: "/banners/combo_3.webp",
  },
];

export const PREMIUM_ASSETS: Record<string, string> = {
  margherita: "/food_premium/margherita_pizza_premium_1775370523745.png",
  farmhouse:
    "/food_premium/farmhouse_pizza_premium_1775370523746_1775370547170.png",
  "peppy paneer":
    "/food_premium/peppy_paneer_pizza_premium_1775370523749_1775370716628.png",
  pizza:
    "/food_premium/farmhouse_pizza_premium_1775370523746_1775370547170.png",
  burger:
    "/food_premium/aloo_tikki_burger_premium_1775370523748_1775370605814.png",
  noodles:
    "/food_premium/veg_hakka_noodles_premium_1775370523750_1775370740442.png",
  pasta:
    "/food_premium/white_sauce_pasta_premium_1775370523752_1775370810885.png",
  "vada pav":
    "/food_premium/mumbai_vada_pav_premium_1775370523753_1775370832865.png",
  "chole bhature":
    "/food_premium/chole_bhature_premium_1775370523754_1775370853979.png",
  "paneer butter":
    "/food_premium/paneer_butter_masala_premium_1775370523755_1775370876646.png",
  "dal makhani":
    "/food_premium/dal_makhani_premium_1775370523756_1775370900599.png",
  "pav bhaji":
    "/food_premium/pav_bhaji_premium_1775370523759_1775370968391.png",
  shake: "/food_premium/oreo_shake_premium_1775370523760_1775370986248.png",
  brownie:
    "/food_premium/chocolate_brownie_premium_1775370523761_1775371010375.png",
  biryani:
    "/food_premium/veg_dum_biryani_premium_1775370523747_1775370582150.png",
  "chilli paneer":
    "/food_premium/chilli_paneer_dry_premium_1775370523751_1775370790498.png",
  "red sauce pasta": "/banners/red_sauce_pasta.webp",
  "white sauce pasta":
    "/food_premium/white_sauce_pasta_premium_1775370523752_1775370810885.png",
  "mixed sauce pasta": "/banners/mixed_sauce_pasta.webp",
};

export const getPremiumImage = (name: string, category: string) => {
  const lowercaseName = name.toLowerCase();
  for (const [key, value] of Object.entries(PREMIUM_ASSETS)) {
    if (lowercaseName.includes(key)) return value;
  }

  if (category === "pizza") return PREMIUM_ASSETS["pizza"];
  if (category === "burgers") return PREMIUM_ASSETS["burger"];
  if (category === "biryani") return PREMIUM_ASSETS["biryani"];
  if (category === "pasta") return PREMIUM_ASSETS["pasta"];

  return PREMIUM_ASSETS["chole bhature"];
};

// Module-level cache: computed once, reused forever
let _cachedAllFoodItems: ReturnType<typeof _buildAllFoodItems> | null = null;

function _buildAllFoodItems() {
  let items: any[] = [];

  // Add shop items
  shops.forEach((shop) => {
    shop.categories.forEach((cat) => {
      cat.items.forEach((item) => {
        items.push({
          ...item,
          id: `all-${shop.id}-${item.name}`,
          shopName: shop.name,
          rating: (4.1 + Math.random() * 0.8).toFixed(1),
          image: getPremiumImage(item.name, "all"),
          category: cat.category,
        });
      });
    });
  });

  // Add combos
  comboItems.forEach((combo) => {
    items.push({
      ...combo,
      category: "combos",
      shopName: combo.shop,
    });
  });

  return items;
}

// Generate a flat list of all menu items from all shops (plus combos)
export const getAllFoodItems = () => {
  if (!_cachedAllFoodItems) {
    _cachedAllFoodItems = _buildAllFoodItems();
  }
  return _cachedAllFoodItems;
};
