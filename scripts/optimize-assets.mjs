import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const publicDir = './public';
const filesToConvert = [
  'desktop-wallpaper-red-new.png',
  'eos-v3-wallpaper-desktop.png',
  'mobile-wallpaper-red-new.png',
  'eos-v3-wallpaper-mobile.png',
  'dock-home.png',
  'dock-shops.png',
  'dock-combos.png',
  'dock-games.png',
  'dock-cart.png',
  'dock-profile.png',
  'dock-settings.png',
  'dock-settings-v2.png'
];

async function optimize() {
  console.log('🚀 Starting asset optimization...');
  
  for (const file of filesToConvert) {
    const inputPath = path.join(publicDir, file);
    if (!fs.existsSync(inputPath)) {
      console.warn(`⚠️  File not found: ${file}`);
      continue;
    }

    const baseName = file.split('.')[0];
    
    // Convert to WebP
    const webpPath = path.join(publicDir, `${baseName}.webp`);
    await sharp(inputPath)
      .webp({ quality: 80 })
      .toFile(webpPath);
    console.log(`✅ Converted ${file} to WebP`);

    // Convert to AVIF (Best compression)
    const avifPath = path.join(publicDir, `${baseName}.avif`);
    await sharp(inputPath)
      .avif({ quality: 60 }) // AVIF is very efficient even at lower quality
      .toFile(avifPath);
    console.log(`✅ Converted ${file} to AVIF`);
  }

  console.log('✨ Optimization complete!');
}

optimize().catch(err => {
  console.error('❌ Optimization failed:', err);
  process.exit(1);
});
