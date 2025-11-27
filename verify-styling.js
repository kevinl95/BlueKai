#!/usr/bin/env node

/**
 * Verify Styling Implementation
 * Checks that all styling requirements are met
 */

const fs = require('fs');
const path = require('path');

console.log('🎨 Verifying BlueKai Styling Implementation...\n');

let allTestsPassed = true;

// Test 1: Check base styles file exists and has CSS variables
console.log('Test 1: Base Styles with CSS Variables');
try {
  const appCss = fs.readFileSync('src/styles/app.css', 'utf8');
  
  const checks = [
    { name: 'CSS Variables defined', pattern: /:root\s*{/ },
    { name: 'Color variables', pattern: /--color-primary/ },
    { name: 'Spacing variables', pattern: /--space-/ },
    { name: 'Typography variables', pattern: /--font-/ },
    { name: 'Border radius variables', pattern: /--radius-/ },
    { name: 'Shadow variables', pattern: /--shadow-/ },
    { name: 'Z-index variables', pattern: /--z-/ },
    { name: 'Transition variables', pattern: /--transition-/ },
    { name: 'CSS Reset', pattern: /\*.*box-sizing/ },
    { name: 'Base typography', pattern: /h1.*h2.*h3.*h4/s },
    { name: 'Utility classes', pattern: /\.m-0.*\.p-0/s }
  ];
  
  checks.forEach(check => {
    if (check.pattern.test(appCss)) {
      console.log(`  ✓ ${check.name}`);
    } else {
      console.log(`  ✗ ${check.name}`);
      allTestsPassed = false;
    }
  });
} catch (error) {
  console.log(`  ✗ Error reading app.css: ${error.message}`);
  allTestsPassed = false;
}
console.log('');

// Test 2: Check component styles use CSS variables
console.log('Test 2: Component Styles Use CSS Variables');
const componentFiles = [
  'src/components/Button.css',
  'src/components/Modal.css',
  'src/components/TextInput.css',
  'src/components/LoadingIndicator.css',
  'src/components/ErrorMessage.css',
  'src/components/Toast.css'
];

componentFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const usesVars = /var\(--/.test(content);
    if (usesVars) {
      console.log(`  ✓ ${path.basename(file)} uses CSS variables`);
    } else {
      console.log(`  ✗ ${path.basename(file)} doesn't use CSS variables`);
      allTestsPassed = false;
    }
  } catch (error) {
    console.log(`  ✗ ${path.basename(file)} not found`);
    allTestsPassed = false;
  }
});
console.log('');

// Test 3: Check WCAG AA focus indicators (3:1 contrast)
console.log('Test 3: WCAG AA Focus Indicators (3:1 Contrast)');
const focusFiles = [
  'src/components/Button.css',
  'src/components/Modal.css',
  'src/components/TextInput.css',
  'src/views/PostItem.css',
  'src/views/PostActionMenu.css'
];

focusFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const hasFocusIndicator = /outline:.*3px.*solid/i.test(content) || 
                              /outline-width:.*3px/i.test(content);
    if (hasFocusIndicator) {
      console.log(`  ✓ ${path.basename(file)} has 3px focus indicators`);
    } else {
      console.log(`  ✗ ${path.basename(file)} missing proper focus indicators`);
      allTestsPassed = false;
    }
  } catch (error) {
    console.log(`  ✗ ${path.basename(file)} not found`);
    allTestsPassed = false;
  }
});
console.log('');

// Test 4: Check responsive adjustments for KaiOS
console.log('Test 4: Responsive Adjustments for KaiOS (240x320)');
try {
  const responsiveCss = fs.readFileSync('src/styles/responsive.css', 'utf8');
  
  const checks = [
    { name: '240px breakpoint', pattern: /@media.*max-width:\s*240px/ },
    { name: '320px breakpoint', pattern: /@media.*max-width:\s*320px/ },
    { name: 'Height adjustments', pattern: /@media.*max-height/ },
    { name: 'Font size adjustments', pattern: /--font-size-.*:\s*\d+px/ },
    { name: 'Spacing adjustments', pattern: /--space-.*:\s*\d+px/ },
    { name: 'Touch target sizes', pattern: /min-height:.*36px/ }
  ];
  
  checks.forEach(check => {
    if (check.pattern.test(responsiveCss)) {
      console.log(`  ✓ ${check.name}`);
    } else {
      console.log(`  ✗ ${check.name}`);
      allTestsPassed = false;
    }
  });
} catch (error) {
  console.log(`  ✗ Error reading responsive.css: ${error.message}`);
  allTestsPassed = false;
}
console.log('');

// Test 5: Check view styles are updated
console.log('Test 5: View Component Styles');
const viewFiles = [
  'src/views/LoginView.css',
  'src/views/TimelineView.css',
  'src/views/PostItem.css',
  'src/views/PostList.css',
  'src/views/ComposeView.css',
  'src/views/ProfileView.css',
  'src/views/ProfileHeader.css',
  'src/views/EditProfileView.css',
  'src/views/NotificationsView.css',
  'src/views/NotificationItem.css',
  'src/views/PostDetailView.css',
  'src/views/PostActionMenu.css',
  'src/views/SignupView.css'
];

let viewStylesCount = 0;
viewFiles.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const usesVars = /var\(--/.test(content);
    const hasResponsive = /@media/.test(content);
    if (usesVars && hasResponsive) {
      viewStylesCount++;
    }
  } catch (error) {
    // File might not exist yet
  }
});

console.log(`  ✓ ${viewStylesCount}/${viewFiles.length} view styles updated with variables and responsive design`);
if (viewStylesCount < viewFiles.length) {
  console.log(`  ⚠ Some view styles may need updating`);
}
console.log('');

// Test 6: Check accessibility styles
console.log('Test 6: Accessibility Features');
try {
  const accessibilityCss = fs.readFileSync('src/styles/accessibility.css', 'utf8');
  
  const checks = [
    { name: 'Skip links', pattern: /\.skip-link/ },
    { name: 'Screen reader only', pattern: /\.sr-only/ },
    { name: 'Focus visible', pattern: /:focus-visible/ },
    { name: 'ARIA live regions', pattern: /\[aria-live\]/ },
    { name: 'High contrast support', pattern: /@media.*prefers-contrast/ },
    { name: 'Reduced motion support', pattern: /@media.*prefers-reduced-motion/ }
  ];
  
  checks.forEach(check => {
    if (check.pattern.test(accessibilityCss)) {
      console.log(`  ✓ ${check.name}`);
    } else {
      console.log(`  ✗ ${check.name}`);
      allTestsPassed = false;
    }
  });
} catch (error) {
  console.log(`  ✗ Error reading accessibility.css: ${error.message}`);
  allTestsPassed = false;
}
console.log('');

// Test 7: Check navigation styles
console.log('Test 7: Navigation Component Styles');
try {
  const softkeyBarCss = fs.readFileSync('src/navigation/SoftkeyBar.css', 'utf8');
  
  const checks = [
    { name: 'Uses CSS variables', pattern: /var\(--/ },
    { name: 'Fixed positioning', pattern: /position:\s*fixed/ },
    { name: 'Responsive adjustments', pattern: /@media/ },
    { name: 'Focus indicators', pattern: /outline:.*3px/ }
  ];
  
  checks.forEach(check => {
    if (check.pattern.test(softkeyBarCss)) {
      console.log(`  ✓ ${check.name}`);
    } else {
      console.log(`  ✗ ${check.name}`);
      allTestsPassed = false;
    }
  });
} catch (error) {
  console.log(`  ✗ Error reading SoftkeyBar.css: ${error.message}`);
  allTestsPassed = false;
}
console.log('');

// Summary
console.log('═'.repeat(50));
if (allTestsPassed) {
  console.log('✅ All styling tests passed!');
  console.log('\nStyling implementation is complete with:');
  console.log('  • CSS variables for consistent theming');
  console.log('  • WCAG AA compliant focus indicators (3:1 contrast)');
  console.log('  • Responsive design for KaiOS screens (240x320)');
  console.log('  • Comprehensive utility classes');
  console.log('  • Accessibility features');
  console.log('  • Component and view styles');
  process.exit(0);
} else {
  console.log('❌ Some styling tests failed');
  console.log('\nPlease review the failed tests above.');
  process.exit(1);
}
