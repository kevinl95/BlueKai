#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');

console.log('📊 Bundle Size Report');
console.log('='.repeat(50));
console.log('');

// Find all JS files
const files = fs.readdirSync(distDir).filter(f => f.endsWith('.js'));
const gzFiles = fs.readdirSync(distDir).filter(f => f.endsWith('.js.gz'));

let totalSize = 0;
let totalGzSize = 0;

console.log('JavaScript Bundles:');
console.log('-'.repeat(50));

files.forEach(file => {
  const filePath = path.join(distDir, file);
  const stats = fs.statSync(filePath);
  const sizeKB = (stats.size / 1024).toFixed(2);
  totalSize += stats.size;
  console.log(`  ${file}: ${sizeKB} KB`);
});

console.log('');
console.log('Gzipped Bundles:');
console.log('-'.repeat(50));

gzFiles.forEach(file => {
  const filePath = path.join(distDir, file);
  const stats = fs.statSync(filePath);
  const sizeKB = (stats.size / 1024).toFixed(2);
  totalGzSize += stats.size;
  console.log(`  ${file}: ${sizeKB} KB`);
});

console.log('');
console.log('='.repeat(50));
console.log(`Total JS Size: ${(totalSize / 1024).toFixed(2)} KB`);
console.log(`Total Gzipped Size: ${(totalGzSize / 1024).toFixed(2)} KB`);
console.log('');

// Check against target
const targetKB = 200;
if (totalGzSize / 1024 > targetKB) {
  console.log(`⚠️  WARNING: Gzipped bundle exceeds ${targetKB}KB target!`);
  console.log(`   Current: ${(totalGzSize / 1024).toFixed(2)} KB`);
  console.log(`   Over by: ${((totalGzSize / 1024) - targetKB).toFixed(2)} KB`);
} else {
  console.log(`✅ Bundle size is within ${targetKB}KB target`);
  console.log(`   Remaining: ${(targetKB - (totalGzSize / 1024)).toFixed(2)} KB`);
}

console.log('');
