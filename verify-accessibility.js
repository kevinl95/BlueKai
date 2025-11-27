#!/usr/bin/env node

/**
 * Simple verification script for accessibility implementation
 */

var fs = require('fs');
var path = require('path');

console.log('='.repeat(60));
console.log('Accessibility Implementation Verification');
console.log('='.repeat(60));
console.log('');

var checks = {
  passed: 0,
  failed: 0
};

function check(name, condition, message) {
  if (condition) {
    console.log('✓', name);
    checks.passed++;
  } else {
    console.log('✗', name, '-', message);
    checks.failed++;
  }
}

// Check if files exist
check(
  'Accessibility utility exists',
  fs.existsSync('src/utils/accessibility.js'),
  'File not found'
);

check(
  'Accessibility tests exist',
  fs.existsSync('src/utils/accessibility.test.js'),
  'File not found'
);

check(
  'Accessibility CSS exists',
  fs.existsSync('src/styles/accessibility.css'),
  'File not found'
);

check(
  'Accessibility docs exist',
  fs.existsSync('docs/ACCESSIBILITY.md'),
  'File not found'
);

check(
  'Accessibility audit exists',
  fs.existsSync('docs/ACCESSIBILITY-AUDIT.md'),
  'File not found'
);

check(
  'Test HTML exists',
  fs.existsSync('test-accessibility.html'),
  'File not found'
);

// Check file contents
if (fs.existsSync('src/utils/accessibility.js')) {
  var accessibilityContent = fs.readFileSync('src/utils/accessibility.js', 'utf8');
  
  check(
    'Has generateId function',
    accessibilityContent.indexOf('function generateId') !== -1,
    'Function not found'
  );
  
  check(
    'Has announceToScreenReader function',
    accessibilityContent.indexOf('function announceToScreenReader') !== -1,
    'Function not found'
  );
  
  check(
    'Has getPostLabel function',
    accessibilityContent.indexOf('function getPostLabel') !== -1,
    'Function not found'
  );
  
  check(
    'Has getNotificationLabel function',
    accessibilityContent.indexOf('function getNotificationLabel') !== -1,
    'Function not found'
  );
  
  check(
    'Uses ES6 exports',
    accessibilityContent.indexOf('export {') !== -1,
    'Not using ES6 export syntax'
  );
}

// Check CSS contents
if (fs.existsSync('src/styles/accessibility.css')) {
  var cssContent = fs.readFileSync('src/styles/accessibility.css', 'utf8');
  
  check(
    'Has skip link styles',
    cssContent.indexOf('.skip-link') !== -1,
    'Skip link styles not found'
  );
  
  check(
    'Has focus indicator styles',
    cssContent.indexOf('*:focus') !== -1,
    'Focus styles not found'
  );
  
  check(
    'Has sr-only class',
    cssContent.indexOf('.sr-only') !== -1,
    'Screen reader only class not found'
  );
  
  check(
    'Has ARIA live region styles',
    cssContent.indexOf('[aria-live]') !== -1,
    'ARIA live region styles not found'
  );
}

// Check App.js integration
if (fs.existsSync('src/components/App.js')) {
  var appContent = fs.readFileSync('src/components/App.js', 'utf8');
  
  check(
    'App imports accessibility',
    appContent.indexOf('accessibility') !== -1,
    'Accessibility not imported'
  );
  
  check(
    'App initializes live regions',
    appContent.indexOf('initializeLiveRegions') !== -1,
    'Live regions not initialized'
  );
  
  check(
    'App adds skip links',
    appContent.indexOf('addSkipLinks') !== -1,
    'Skip links not added'
  );
}

// Check component updates
var componentsToCheck = [
  { file: 'src/views/PostItem.js', element: 'article', label: 'PostItem uses semantic HTML' },
  { file: 'src/views/TimelineView.js', element: 'main', label: 'TimelineView uses main element' },
  { file: 'src/views/LoginView.js', element: 'main', label: 'LoginView uses main element' },
  { file: 'src/navigation/SoftkeyBar.js', element: 'nav', label: 'SoftkeyBar uses nav element' }
];

componentsToCheck.forEach(function(component) {
  if (fs.existsSync(component.file)) {
    var content = fs.readFileSync(component.file, 'utf8');
    check(
      component.label,
      content.indexOf("'" + component.element + "'") !== -1 || 
      content.indexOf('"' + component.element + '"') !== -1,
      'Semantic element not found'
    );
  }
});

console.log('');
console.log('='.repeat(60));
console.log('Results:');
console.log('  Passed:', checks.passed);
console.log('  Failed:', checks.failed);
console.log('  Total:', checks.passed + checks.failed);
console.log('='.repeat(60));

if (checks.failed === 0) {
  console.log('✓ All checks passed!');
  process.exit(0);
} else {
  console.log('✗ Some checks failed');
  process.exit(1);
}
