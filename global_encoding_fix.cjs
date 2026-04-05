const fs = require('fs');
const path = require('path');

const MAPPINGS = [
  // Patterns to replace with clear Unicode escaping or clean strings
  { reg: /â‚¹/g, rep: '\u20B9' }, // Rupee symbol ₹
  { reg: /â,¹/g, rep: '\u20B9' }, // Variation of corrupted Rupee
  { reg: /Ã°Å¸â€œÅ¾/g, rep: '\uD83D\uDCDE' }, // Telephone 📞
  { reg: /ðŸŽ‰/g, rep: '\uD83C\uDF89' }, // Celebration 🎉
  { reg: /ðŸ •/g, rep: '\uD83C\uDF55' }, // Pizza 🍕
  { reg: /ðŸ¤–/g, rep: '\uD83E\uDD16' }, // Robot 🤖
  { reg: /ðŸ“¦/g, rep: '\uD83D\uDCE6' }, // Package 📦
  { reg: /ðŸŸ¡/g, rep: '\uD83D\uDFE1' }, // Yellow Circle 🟡
  { reg: /ðŸ’³/g, rep: '\uD83D\uDCB3' }, // Credit Card 💳
  { reg: /ðŸ’µ/g, rep: '\uD83D\uDCB5' }, // Banknote 💵
  { reg: /âœ“/g, rep: '\u2713' }, // Checkmark ✓
  { reg: /âœ•/g, rep: '\u2715' }, // X Cross ✕
  { reg: /âš ï¸/g, rep: '\u26A0\uFE0F' }, // Warning ⚠️
  { reg: /Ã—/g, rep: '\u00D7' }, // Multiply ×
  { reg: /Â·/g, rep: '\u00B7' }, // Middle dot ·
  { reg: /â€”/g, rep: '\u2014' }, // Em dash —
  { reg: /â€“/g, rep: '\u2013' }, // En dash –
  { reg: /â€¢/g, rep: '\u2022' }, // Bullet •
];

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file === 'node_modules' || file === '.git' || file === 'dist') continue;
      processDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const original = content;
      
      for (const m of MAPPINGS) {
        content = content.replace(m.reg, m.rep);
      }
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Fixed Encodings in:', fullPath);
      }
    }
  }
}

try {
  processDir('./src');
  console.log('--- COMPLETED GLOBAL ENCODING REPAIR ---');
} catch (e) {
  console.error('Error during global repair:', e);
}
