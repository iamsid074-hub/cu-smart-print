const fs = require('fs');
const path = require('path');

const MAPPINGS = [
  { reg: /â‚¹/g, rep: '\u20B9' }, // Rupee ₹
  { reg: /ÂŒ¦/g, rep: '\u2726' }, // Member Star ✦ (from screenshot)
  { reg: /âœ¦/g, rep: '\u2726' }, // Member Star ✦ (variation)
  { reg: /âœ…/g, rep: '\u2705' }, // Check ✅
  { reg: /âœ¨/g, rep: '\u2728' }, // Sparkle ✨
  { reg: /âœ•/g, rep: '\u2715' }, // Cross ✕
  { reg: /â™¥/g, rep: '\u2665' }, // Heart ♥
  { reg: /â†/g,  rep: '\u2190' }, // Left arrow ←
  { reg: /â—/g,  rep: '\u25CF' }, // Circle ●
  { reg: /Â·/g,  rep: '\u00B7' }, // Dot ·
  { reg: /Ã—/g,  rep: '\u00D7' }, // Times ×
  { reg: /â€¦/g,  rep: '\u2026' }, // Ellipsis …
  { reg: /âš ï¸/g, rep: '\u26A0\uFE0F' }, // Alert ⚠️
  { reg: /â”€/g, rep: '\u2500' }, // Line ─
  { reg: /â”“/g, rep: '\u2501' }, // Bold line ━
  { reg: /ðŸŽ‰/g, rep: '\uD83C\uDF89' }, // 🎉
  { reg: /ðŸ •/g, rep: '\uD83C\uDF55' }, // 🍕
  { reg: /ðŸ¤–/g, rep: '\uD83E\uDD16' }, // 🤖
  { reg: /Ã°Å¸â€œÅ¾/g, rep: '\uD83D\uDCDE' }, // 📞
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
        console.log('Repaired:', fullPath);
      }
    }
  }
}

try {
  processDir('./src');
  console.log('--- COMPLETED ABSOLUTE ENCODING REPAIR ---');
} catch (e) {
  console.error('Error:', e);
}
