const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const original = content;
      
      content = content.replace(/â‚¹/g, '₹');
      content = content.replace(/â,¹/g, '₹');
      content = content.replace(/Ã°Å¸â€œÅ¾/g, '📞');
      content = content.replace(/Ã—/g, '×');
      content = content.replace(/Â·/g, '·');
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Fixed:', fullPath);
      }
    }
  }
}

try {
  processDir('./src');
  console.log('Finished fixing all encodings.');
} catch (e) {
  console.error('Error:', e);
}
