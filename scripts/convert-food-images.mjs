import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const inputDir = 'C:\\Users\\A\\.gemini\\antigravity\\brain\\8d32e726-addf-4cf6-9f30-c03a576fdb97';
const outputDir = 'c:\\Users\\A\\OneDrive\\Desktop\\BAZZAR\\public\\banners';

const fileMap = [
  { src: 'pizza_margherita_123456789_1775339511212.png', dest: 'pizza_margherita.webp' },
  { src: 'pizza_onion_corn_1775339511213_1775339607520.png', dest: 'pizza_onion_corn.webp' },
  { src: 'burger_aloo_tikki_1775339511214_1775339632493.png', dest: 'burger_aloo_tikki.webp' },
  { src: 'burger_chicken_crispy_1775339511215_1775339654264.png', dest: 'burger_chicken_crispy.webp' },
  { src: 'biryani_chicken_1775339511216_1775339675325.png', dest: 'biryani_chicken.webp' },
  { src: 'pasta_white_sauce_1775339511217_1775339694178.png', dest: 'pasta_white_sauce.webp' },
  { src: 'pizza_paneer_tikka_1775339511220_1775339716063.png', dest: 'pizza_paneer_tikka.webp' },
];

async function convert() {
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  for (const item of fileMap) {
    const inputPath = path.join(inputDir, item.src);
    const outputPath = path.join(outputDir, item.dest);

    if (fs.existsSync(inputPath)) {
      await sharp(inputPath)
        .webp({ quality: 80 })
        .toFile(outputPath);
      console.log(`Converted ${item.src} to ${item.dest}`);
    } else {
      console.warn(`File not found: ${inputPath}`);
    }
  }
}

convert().catch(console.error);
