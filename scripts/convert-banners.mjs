import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const directory = 'public/banners';

async function convertToWebp() {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const filePath = path.join(directory, file);
    const ext = path.extname(file).toLowerCase();
    
    if (ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
      const fileName = path.basename(file, ext);
      const outputName = `${fileName}.webp`;
      const outputPath = path.join(directory, outputName);
      
      console.log(`Converting ${file} to ${outputName}...`);
      
      try {
        await sharp(filePath)
          .webp({ quality: 80 })
          .toFile(outputPath);
        console.log(`Successfully converted ${file}`);
        
        // Optionally delete the original after verification
        // fs.unlinkSync(filePath);
      } catch (err) {
        console.error(`Error converting ${file}:`, err);
      }
    }
  }
}

convertToWebp();
