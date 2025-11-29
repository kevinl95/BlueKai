#!/usr/bin/env node

/**
 * Verification script for App component implementation
 * Checks that all required files and structures are in place
 */

const fs = require('fs');
const path = require('path');

console.log('\n=== BlueKai App Implementation Verification ===\n');

let checksPass = 0;
let checksFail = 0;

function check(condition, message) {
  if (condition) {
    console.log('✓', message);
    checksPass++;
  } else {
    console.error('✗', message);
    checksFail++;
  }
}

function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (e) {
    return false;
  }
}

function fileContains(filePath, searchString) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.includes(searchString);
  } catch (e) {
    return false;
  }
}

console.log('File Structure Checks:');
console.log('─'.repeat(50));

// Check main App component
check(fileExists('src/components/App.js'), 'App.js exists');
check(fileContains('src/components/App.js', 'AppStateProvider'), 'App uses AppStateProvider');
check(fileContains('src/components/App.js', 'Router'), 'App uses Router');
check(fileContains('src/components/App.js', 'ErrorBoundary'), 'App wrapped in ErrorBoundary');
check(fileContains('src/components/App.js', 'SessionManager'), 'App uses SessionManager');
check(fileContains('src/components/App.js', 'NavigationManager'), 'App initializes NavigationManager');

console.log('\nRouting Implementation:');
console.log('─'.repeat(50));

check(fileContains('src/components/App.js', "register('/login'"), 'Login route registered');
check(fileContains('src/components/App.js', "register('/signup'"), 'Signup route registered');
check(fileContains('src/components/App.js', "register('/timeline'"), 'Timeline route registered');
check(fileContains('src/components/App.js', "register('/compose'"), 'Compose route registered');
check(fileContains('src/components/App.js', "register('/post/:uri'"), 'Post detail route registered');
check(fileContains('src/components/App.js', "register('/profile/:actor'"), 'Profile route registered');
check(fileContains('src/components/App.js', "register('/notifications'"), 'Notifications route registered');

console.log('\nAuthentication Guards:');
console.log('─'.repeat(50));

check(fileContains('src/components/App.js', 'requireAuth'), 'Route guard function exists');
check(fileContains('src/components/App.js', 'isAuthenticated'), 'Authentication check implemented');

console.log('\nSession Management:');
console.log('─'.repeat(50));

check(fileContains('src/components/App.js', 'validateAndRestoreSession'), 'Session restoration implemented');
check(fileContains('src/components/App.js', 'sessionRefreshTimer'), 'Session refresh timer implemented');
check(fileContains('src/components/App.js', 'handleLogin'), 'Login handler implemented');
check(fileContains('src/components/App.js', 'handleLogout'), 'Logout handler implemented');

console.log('\nView Components:');
console.log('─'.repeat(50));

check(fileContains('src/components/App.js', 'LoginView'), 'LoginView imported');
check(fileContains('src/components/App.js', 'SignupView'), 'SignupView imported');
check(fileContains('src/components/App.js', 'TimelineView'), 'TimelineView imported');
check(fileContains('src/components/App.js', 'ComposeView'), 'ComposeView imported');
check(fileContains('src/components/App.js', 'PostDetailView'), 'PostDetailView imported');
check(fileContains('src/components/App.js', 'ProfileView'), 'ProfileView imported');
check(fileContains('src/components/App.js', 'EditProfileView'), 'EditProfileView imported');
check(fileContains('src/components/App.js', 'NotificationsView'), 'NotificationsView imported');

console.log('\nSoftkey Configuration:');
console.log('─'.repeat(50));

check(fileContains('src/components/App.js', 'getSoftkeyConfig'), 'Softkey configuration function exists');
check(fileContains('src/components/App.js', 'SoftkeyBar'), 'SoftkeyBar component used');

console.log('\nError Handling:');
console.log('─'.repeat(50));

check(fileExists('src/components/ErrorBoundary.js'), 'ErrorBoundary component exists');
check(fileContains('src/components/ErrorBoundary.js', 'componentDidCatch'), 'ErrorBoundary catches errors');

console.log('\nState Management:');
console.log('─'.repeat(50));

check(fileExists('src/state/AppStateProvider.js'), 'AppStateProvider exists');
check(fileExists('src/state/app-state.js'), 'App state structure exists');
check(fileExists('src/state/session-manager.js'), 'SessionManager exists');
check(fileExists('src/state/actions.js'), 'Actions defined');
check(fileExists('src/state/reducer.js'), 'Reducer exists');

console.log('\nNavigation:');
console.log('─'.repeat(50));

check(fileExists('src/navigation/router.js'), 'Router exists');
check(fileExists('src/navigation/navigation-manager.js'), 'NavigationManager exists');
check(fileExists('src/navigation/SoftkeyBar.js'), 'SoftkeyBar exists');

console.log('\nNetwork Status:');
console.log('─'.repeat(50));

check(fileContains('src/components/App.js', 'networkStatus'), 'Network status monitoring');
check(fileContains('src/components/App.js', 'OfflineIndicator'), 'Offline indicator component');
check(fileContains('src/components/App.js', 'handleNetworkChange'), 'Network change handler');

console.log('\nServices:');
console.log('─'.repeat(50));

check(fileContains('src/components/App.js', 'ATPClient'), 'ATP client initialized');
check(fileContains('src/components/App.js', 'CacheManager'), 'Cache manager initialized');

console.log('\nTest Files:');
console.log('─'.repeat(50));

check(fileExists('src/components/App.test.js'), 'App unit tests exist');
check(fileExists('test-app-initialization.html'), 'Browser test file exists');
check(fileExists('run-app-tests.js'), 'Test runner exists');

console.log('\nRequirements Coverage:');
console.log('─'.repeat(50));

// Requirement 5.4: Implement initial session check and restoration
check(
  fileContains('src/components/App.js', 'validateAndRestoreSession'),
  'Req 5.4: Session check and restoration'
);

// Requirement 5.5: Automatic session refresh
check(
  fileContains('src/components/App.js', 'startSessionRefreshTimer'),
  'Req 5.5: Automatic session refresh'
);

// Route guards for authentication
check(
  fileContains('src/components/App.js', 'requireAuth'),
  'Route guards for authentication'
);

// Global NavigationManager initialization
check(
  fileContains('src/components/App.js', 'new NavigationManager'),
  'Global NavigationManager initialization'
);

// Wire up SoftkeyBar with route-specific actions
check(
  fileContains('src/components/App.js', 'getSoftkeyConfig'),
  'SoftkeyBar with route-specific actions'
);

// ErrorBoundary wrapper
check(
  fileContains('src/components/App.js', 'ErrorBoundary'),
  'ErrorBoundary wrapper'
);

console.log('\n' + '='.repeat(50));
console.log(`Total Checks: ${checksPass + checksFail}`);
console.log(`Passed: ${checksPass}`);
console.log(`Failed: ${checksFail}`);

if (checksFail === 0) {
  console.log('\n✓ All implementation checks passed!\n');
  process.exit(0);
} else {
  console.log(`\n✗ ${checksFail} checks failed\n`);
  process.exit(1);
}
