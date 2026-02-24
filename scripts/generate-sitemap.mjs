// scripts/generate-sitemap.mjs
// Run automatically before build via package.json "prebuild" script.

import { writeFileSync } from "fs";

const BASE_URL = "https://cubazzar.shop";
const TODAY = new Date().toISOString().split("T")[0];

// ── Static SEO-indexable routes ─────────────────────────────────────────────
// NOTE: Protected routes (home, chat, profile etc.) are excluded — they require
// login so crawlers can't access them anyway.
const staticRoutes = [
    { url: "/", changefreq: "weekly", priority: "1.0" },
    { url: "/login", changefreq: "monthly", priority: "0.6" },
    { url: "/browse", changefreq: "daily", priority: "0.9" },
    { url: "/food", changefreq: "weekly", priority: "0.8" },
];

// ── Dynamic product routes (optional — requires SUPABASE env vars at build time)
// Uncomment this block if you want to include /product/:id URLs.
// You will need VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY set in your
// Vercel environment variables (they are already there from your app setup).
//
// import { createClient } from "@supabase/supabase-js";
// const supabase = createClient(
//   process.env.VITE_SUPABASE_URL,
//   process.env.VITE_SUPABASE_ANON_KEY
// );
// const { data: products } = await supabase.from("products").select("id");
// const dynamicRoutes = (products ?? []).map((p) => ({
//   url: `/product/${p.id}`,
//   changefreq: "weekly",
//   priority: "0.7",
// }));

const dynamicRoutes = []; // replace with line above when ready

const allRoutes = [...staticRoutes, ...dynamicRoutes];

// ── Build XML ────────────────────────────────────────────────────────────────
const urlEntries = allRoutes
    .map(
        ({ url, changefreq, priority }) => `
  <url>
    <loc>${BASE_URL}${url}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
    )
    .join("");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
    http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urlEntries}
</urlset>`;

writeFileSync("public/sitemap.xml", xml.trim());
console.log(`✅ sitemap.xml generated with ${allRoutes.length} URLs`);
