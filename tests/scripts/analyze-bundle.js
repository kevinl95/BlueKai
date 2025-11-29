#!/usr/bin/env node
/**
 * Bundle Size Analysis Script
 * Requirements: 2.1, 2.2
 * Analyzes production bundle size and reports if it meets requirements
 */

const fs = require('fs');
const path = require('path');
const { gzipSync } = require('zlib');

const BUNDLE_SIZE_LIMIT = 200 * 1024; // 200KB in bytes
const distPath = path.join(__dirname, 'dist');

function getFileSize(filePath) {
  const stats = fs.statSync(filePath);
  return stats.size;
}

function getGzipSize(filePath) {
  const content = fs.readFileSync(filePath);
  const gzipped = gzipSync(content, { level: 9 });
  return gzipped.length;
}

function formatBytes(bytes) {
  return (bytes / 1024).toFixed(2) + ' KB';
}

function analyzeBundles() {
  console.log('\n=== Bundle Size Analysis ===\n');
  
  if (!fs.existsSync(distPath)) {
    console.error('Error: dist directory not found. Run "npm run build" first.');
    process.exit(1);
  }
  
  const files = fs.readdirSync(distPath);
  const jsFiles = files.filter(f => f.endsWith('.js'));
  
  if (jsFiles.length === 0) {
    console.error('Error: No JavaScript bundles found in dist directory.');
    process.exit(1);
  }
  
  let totalSize = 0;
  let totalGzipSize = 0;
  const fileDetails = [];
  
  jsFiles.forEach(file => {
    const filePath = path.join(distPath, file);
    const size = getFileSize(filePath);
    const gzipSize = getGzipSize(filePath);
    
    totalSize += size;
    totalGzipSize += gzipSize;
    
    fileDetails.push({
      name: file,
      size: size,
      gzipSize: gzipSize
    });
  });
  
  // Sort by gzip size descending
  fileDetails.sort((a, b) => b.gzipSize - a.gzipSize);
  
  console.log('JavaScript Bundles:');
  console.log('-------------------');
  fileDetails.forEach(file => {
    console.log(`${file.name}:`);
    console.log(`  Raw:    ${formatBytes(file.size)}`);
    console.log(`  Gzipped: ${formatBytes(file.gzipSize)}`);
  });
  
  console.log('\nTotal:');
  console.log('------');
  console.log(`Raw:    ${formatBytes(totalSize)}`);
  console.log(`Gzipped: ${formatBytes(totalGzipSize)}`);
  
  const limitFormatted = formatBytes(BUNDLE_SIZE_LIMIT);
  console.log(`\nTarget:  ${limitFormatted} (gzipped)`);
  
  if (totalGzipSize <= BUNDLE_SIZE_LIMIT) {
    const savings = BUNDLE_SIZE_LIMIT - totalGzipSize;
    const percentage = ((totalGzipSize / BUNDLE_SIZE_LIMIT) * 100).toFixed(1);
    console.log(`\n✓ PASS: Bundle size is within limit (${percentage}% of target)`);
    console.log(`  Remaining budget: ${formatBytes(savings)}`);
    return true;
  } else {
    const overage = totalGzipSize - BUNDLE_SIZE_LIMIT;
    const percentage = ((totalGzipSize / BUNDLE_SIZE_LIMIT) * 100).toFixed(1);
    console.log(`\n✗ FAIL: Bundle size exceeds limit (${percentage}% of target)`);
    console.log(`  Over budget by: ${formatBytes(overage)}`);
    return false;
  }
}

const passed = analyzeBundles();
console.log('\n');
process.exit(passed ? 0 : 1);
