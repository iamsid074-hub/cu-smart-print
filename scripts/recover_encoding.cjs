const fs = require('fs');
const path = require('path');

const patterns = [
  { from: /Ã¢â‚¬Â¢/g, to: '•' },
  { from: /Ã¢â€šÂ¹/g, to: '₹' },
  { from: /Ã¢â‚¬â€/g, to: '—' },
  { from: /Ã¢â‚¬â„¢/g, to: "'" },
  { from: /Ã¢â‚¬â€œ/g, to: '–' },
  { from: /Ã¢â‚¬â„¢/g, to: "'" }
];

function walk(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== '.gemini' && file !== 'dist') {
        walk(filePath);
      }
    } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.js') || filePath.endsWith('.json')) {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      patterns.forEach(p => {
        if (p.from.test(content)) {
          content = content.replace(p.from, p.to);
          modified = true;
        }
      });

      if (modified) {
        console.log(`Fixed: ${filePath}`);
        // Write as UTF-8 without BOM (standard in Node.js)
        fs.writeFileSync(filePath, content, 'utf8');
      }
    }
  });
}

const targetDir = path.join(__dirname, '..', 'src');
console.log(`Starting global encoding recovery in ${targetDir}...`);
walk(targetDir);
console.log('Recovery complete!');
