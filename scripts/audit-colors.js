#!/usr/bin/env node
/**
 * Color Audit Script
 * Scans src directory for raw hex color codes
 * Fails if any are found outside of theme.ts
 */

const fs = require('fs');
const path = require('path');

const ALLOWED_FILES = ['src/theme.ts'];
const HEX_REGEX = /#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}(?![0-9A-Fa-f])/g;

function scanDirectory(dir, results = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        scanDirectory(filePath, results);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
      const relativePath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
      
      // Skip allowed files
      if (ALLOWED_FILES.includes(relativePath)) {
        continue;
      }
      
      const content = fs.readFileSync(filePath, 'utf-8');
      const matches = content.match(HEX_REGEX);
      
      if (matches) {
        const lines = content.split('\n');
        const violations = [];
        
        lines.forEach((line, index) => {
          const lineMatches = line.match(HEX_REGEX);
          if (lineMatches) {
            violations.push({
              line: index + 1,
              content: line.trim(),
              colors: lineMatches
            });
          }
        });
        
        if (violations.length > 0) {
          results.push({
            file: relativePath,
            violations
          });
        }
      }
    }
  }
  
  return results;
}

console.log('🎨 Running color audit...\n');

const results = scanDirectory('src');

if (results.length === 0) {
  console.log('✅ No raw hex colors found! All colors are using theme tokens.\n');
  process.exit(0);
} else {
  console.log(`❌ Found raw hex colors in ${results.length} file(s):\n`);
  
  results.forEach(({ file, violations }) => {
    console.log(`📄 ${file}`);
    violations.forEach(({ line, content, colors }) => {
      console.log(`   Line ${line}: ${colors.join(', ')}`);
      console.log(`   ${content}\n`);
    });
  });
  
  console.log('Please replace these with theme tokens from src/theme.ts\n');
  process.exit(1);
}

