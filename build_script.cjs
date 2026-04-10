const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.sql') && f !== 'fix_rls_performance_advisors.sql' && f !== 'supabase_schema.sql');
files.unshift('supabase_schema.sql');

let finalSql = '-- SUPABASE PERFORMANCE ADVISOR RLS FIXES\n-- Copy and paste this directly into your Supabase SQL Editor\n\n';

const policies = new Map();

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  
  // Regex to match multi-line CREATE POLICY ... ON ... ;
  let policyRegex = /CREATE\s+POLICY\s+(["'\w\s\-.]+)\s+ON\s+([\w.]+)[^;]+;/gi;
  let matches = [...content.matchAll(policyRegex)];
  
  for (let match of matches) {
      let name = match[1].trim();
      let table = match[2].trim();
      let fullStatement = match[0].trim();
      policies.set(name + '|||' + table, { name, table, fullStatement });
  }
}

// Generate Drop & Re-create
for (const [key, pol] of policies.entries()) {
  finalSql += 'DROP POLICY IF EXISTS ' + pol.name + ' ON ' + pol.table + ';\n';
  finalSql += pol.fullStatement.trim() + '\n\n';
}

fs.writeFileSync('fix_rls_performance_advisors.sql', finalSql, 'utf8');
console.log('Script built successfully.');
