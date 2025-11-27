/**
 * Tests for Accessibility Utilities
 * Requirements: 10.2, 10.3
 */

import * as accessibility from './accessibility.js';

/**
 * Test suite for accessibility utilities
 */
function runAccessibilityTests() {
  console.log('Running Accessibility Utility Tests...\n');
  
  var passed = 0;
  var failed = 0;
  
  // Test 1: Generate unique IDs
  console.log('Test 1: Generate unique IDs');
  try {
    var id1 = accessibility.generateId('test');
    var id2 = accessibility.generateId('test');
    
    if (id1 && id2 && id1 !== id2 && id1.indexOf('test-') === 0) {
      console.log('✓ PASS: Generates unique IDs with prefix\n');
      passed++;
    } else {
      console.log('✗ FAIL: IDs not unique or missing prefix\n');
      failed++;
    }
  } catch (error) {
    console.log('✗ FAIL: ' + error.message + '\n');
    failed++;
  }
  
  // Test 2: Announce to screen reader
  console.log('Test 2: Announce to screen reader');
  try {
    accessibility.announceToScreenReader('Test message', 'polite');
    
    var liveRegion = document.getElementById('aria-live-region-polite');
    
    setTimeout(function() {
      if (liveRegion && liveRegion.textContent === 'Test message') {
        console.log('✓ PASS: Creates live region and announces message\n');
        passed++;
      } else {
        console.log('✗ FAIL: Live region not created or message not set\n');
        failed++;
      }
    }, 200);
  } catch (error) {
    console.log('✗ FAIL: ' + error.message + '\n');
    failed++;
  }
  
  // Test 3: Get post label
  console.log('Test 3: Get post label');
  try {
    var post = {
      author: {
        displayName: 'John Doe',
        handle: 'john.bsky.social'
      },
      record: {
        text: 'This is a test post'
      }
    };
    
    var label = accessibility.getPostLabel(post);
    
    if (label.indexOf('John Doe') !== -1 && label.indexOf('This is a test post') !== -1) {
      console.log('✓ PASS: Generates accessible post label\n');
      passed++;
    } else {
      console.log('✗ FAIL: Post label incorrect: ' + label + '\n');
      failed++;
    }
  } catch (error) {
    console.log('✗ FAIL: ' + error.message + '\n');
    failed++;
  }
  
  // Test 4: Get notification label
  console.log('Test 4: Get notification label');
  try {
    var notification = {
      reason: 'like',
      author: {
        displayName: 'Jane Smith',
        handle: 'jane.bsky.social'
      }
    };
    
    var notifLabel = accessibility.getNotificationLabel(notification);
    
    if (notifLabel.indexOf('Jane Smith') !== -1 && notifLabel.indexOf('liked') !== -1) {
      console.log('✓ PASS: Generates accessible notification label\n');
      passed++;
    } else {
      console.log('✗ FAIL: Notification label incorrect: ' + notifLabel + '\n');
      failed++;
    }
  } catch (error) {
    console.log('✗ FAIL: ' + error.message + '\n');
    failed++;
  }
  
  // Test 5: Format count for screen reader
  console.log('Test 5: Format count for screen reader');
  try {
    var count0 = accessibility.formatCountForScreenReader(0, 'like', 'likes');
    var count1 = accessibility.formatCountForScreenReader(1, 'like', 'likes');
    var count5 = accessibility.formatCountForScreenReader(5, 'like', 'likes');
    
    if (count0 === 'No likes' && count1 === '1 like' && count5 === '5 likes') {
      console.log('✓ PASS: Formats counts correctly\n');
      passed++;
    } else {
      console.log('✗ FAIL: Count formatting incorrect\n');
      failed++;
    }
  } catch (error) {
    console.log('✗ FAIL: ' + error.message + '\n');
    failed++;
  }
  
  // Test 6: Initialize live regions
  console.log('Test 6: Initialize live regions');
  try {
    accessibility.initializeLiveRegions();
    
    var politeRegion = document.getElementById('aria-live-region-polite');
    var assertiveRegion = document.getElementById('aria-live-region-assertive');
    
    if (politeRegion && assertiveRegion) {
      console.log('✓ PASS: Initializes both live regions\n');
      passed++;
    } else {
      console.log('✗ FAIL: Live regions not initialized\n');
      failed++;
    }
  } catch (error) {
    console.log('✗ FAIL: ' + error.message + '\n');
    failed++;
  }
  
  // Test 7: Add skip links
  console.log('Test 7: Add skip links');
  try {
    accessibility.addSkipLinks([
      { targetId: 'main-content', label: 'Skip to main content' },
      { targetId: 'navigation', label: 'Skip to navigation' }
    ]);
    
    var skipLinksContainer = document.getElementById('skip-links');
    
    if (skipLinksContainer && skipLinksContainer.children.length === 2) {
      console.log('✓ PASS: Adds skip links\n');
      passed++;
    } else {
      console.log('✗ FAIL: Skip links not added correctly\n');
      failed++;
    }
  } catch (error) {
    console.log('✗ FAIL: ' + error.message + '\n');
    failed++;
  }
  
  // Summary
  setTimeout(function() {
    console.log('='.repeat(50));
    console.log('Accessibility Utility Tests Complete');
    console.log('Passed: ' + passed);
    console.log('Failed: ' + failed);
    console.log('='.repeat(50));
  }, 300);
}

// Export test runner
export { runAccessibilityTests };
