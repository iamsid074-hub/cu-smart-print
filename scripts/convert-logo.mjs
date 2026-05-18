import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const publicDir = 'public';
const inputPath = path.join(publicDir, 'electronics.png');
const outputWebpPath = path.join(publicDir, 'electronics.webp');
const logoWebpPath = path.join(publicDir, 'logo.webp');
const backupLogoPath = path.join(publicDir, 'logo_backup.webp');

async function run() {
  try {
    if (!fs.existsSync(inputPath)) {
      console.error(`❌ Input file ${inputPath} does not exist.`);
      process.exit(1);
    }

    console.log(`⏳ Converting ${inputPath} to WebP format...`);
    
    // Convert to electronics.webp
    await sharp(inputPath)
      .resize(512, 512, { fit: 'inside' }) // resize to standard logo dimensions while maintaining aspect ratio
      .webp({ quality: 90 })
      .toFile(outputWebpPath);

    console.log(`✅ Converted to ${outputWebpPath}`);

    // Backup current logo.webp if it exists and hasn't been backed up yet
    if (fs.existsSync(logoWebpPath) && !fs.existsSync(backupLogoPath)) {
      fs.copyFileSync(logoWebpPath, backupLogoPath);
      console.log(`💾 Backed up original logo.webp to ${backupLogoPath}`);
    }

    // Replace logo.webp with the newly converted logo
    fs.copyFileSync(outputWebpPath, logoWebpPath);
    console.log(`🎉 Overwrote logo.webp with the optimized WebP electronics logo!`);

  } catch (err) {
    console.error('❌ Error during conversion:', err);
    process.exit(1);
  }
}

run();
