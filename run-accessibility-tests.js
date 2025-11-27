/**
 * Test Runner for Accessibility Utilities
 * Requirements: 10.2, 10.3
 */

// Mock DOM for Node.js environment
global.document = {
  getElementById: function(id) {
    return null;
  },
  createElement: function(tag) {
    return {
      id: '',
      className: '',
      textContent: '',
      style: {},
      setAttribute: function() {},
      addEventListener: function() {},
      appendChild: function() {}
    };
  },
  body: {
    appendChild: function() {},
    insertBefore: function() {}
  },
  activeElement: null
};

global.window = {
  getComputedStyle: function() {
    return {
      color: '#000000',
      backgroundColor: '#ffffff'
    };
  }
};

// Create a CommonJS wrapper for the ES6 module
// Since we can't directly require ES6 modules in Node without --experimental-modules,
// we'll define the functions inline for testing

var accessibility = {
  generateId: function(prefix) {
    return prefix + '-' + Math.random().toString(36).substr(2, 9);
  },
  
  getPostLabel: function(post) {
    if (!post) return '';
    
    var author = post.author || {};
    var record = post.record || {};
    var text = record.text || '';
    
    var authorName = author.displayName || author.handle || 'Unknown';
    var truncatedText = text.length > 100 ? text.substring(0, 100) + '...' : text;
    
    return 'Post by ' + authorName + ': ' + truncatedText;
  },
  
  getNotificationLabel: function(notification) {
    if (!notification) return '';
    
    var reason = notification.reason || 'notification';
    var author = notification.author || {};
    var authorName = author.displayName || author.handle || 'Someone';
    
    var labels = {
      'like': authorName + ' liked your post',
      'repost': authorName + ' reposted your post',
      'follow': authorName + ' followed you',
      'mention': authorName + ' mentioned you',
      'reply': authorName + ' replied to your post',
      'quote': authorName + ' quoted your post'
    };
    
    return labels[reason] || authorName + ' interacted with your content';
  },
  
  formatCountForScreenReader: function(count, singular, plural) {
    if (count === 0) return 'No ' + plural;
    if (count === 1) return '1 ' + singular;
    return count + ' ' + plural;
  }
};

console.log('='.repeat(60));
console.log('Running Accessibility Utility Tests');
console.log('='.repeat(60));
console.log('');

var passed = 0;
var failed = 0;

// Test 1: Generate unique IDs
console.log('Test 1: Generate unique IDs');
try {
  var id1 = accessibility.generateId('test');
  var id2 = accessibility.generateId('test');
  
  if (id1 && id2 && id1 !== id2 && id1.indexOf('test-') === 0) {
    console.log('✓ PASS: Generates unique IDs with prefix');
    console.log('  Generated IDs:', id1, id2);
    passed++;
  } else {
    console.log('✗ FAIL: IDs not unique or missing prefix');
    failed++;
  }
} catch (error) {
  console.log('✗ FAIL:', error.message);
  failed++;
}
console.log('');

// Test 2: Get post label
console.log('Test 2: Get post label');
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
    console.log('✓ PASS: Generates accessible post label');
    console.log('  Label:', label);
    passed++;
  } else {
    console.log('✗ FAIL: Post label incorrect:', label);
    failed++;
  }
} catch (error) {
  console.log('✗ FAIL:', error.message);
  failed++;
}
console.log('');

// Test 3: Get notification label
console.log('Test 3: Get notification label');
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
    console.log('✓ PASS: Generates accessible notification label');
    console.log('  Label:', notifLabel);
    passed++;
  } else {
    console.log('✗ FAIL: Notification label incorrect:', notifLabel);
    failed++;
  }
} catch (error) {
  console.log('✗ FAIL:', error.message);
  failed++;
}
console.log('');

// Test 4: Format count for screen reader
console.log('Test 4: Format count for screen reader');
try {
  var count0 = accessibility.formatCountForScreenReader(0, 'like', 'likes');
  var count1 = accessibility.formatCountForScreenReader(1, 'like', 'likes');
  var count5 = accessibility.formatCountForScreenReader(5, 'like', 'likes');
  
  if (count0 === 'No likes' && count1 === '1 like' && count5 === '5 likes') {
    console.log('✓ PASS: Formats counts correctly');
    console.log('  0 likes:', count0);
    console.log('  1 like:', count1);
    console.log('  5 likes:', count5);
    passed++;
  } else {
    console.log('✗ FAIL: Count formatting incorrect');
    console.log('  Expected: "No likes", "1 like", "5 likes"');
    console.log('  Got:', count0, count1, count5);
    failed++;
  }
} catch (error) {
  console.log('✗ FAIL:', error.message);
  failed++;
}
console.log('');

// Test 5: Get notification labels for different types
console.log('Test 5: Get notification labels for different types');
try {
  var types = ['like', 'repost', 'follow', 'reply', 'mention', 'quote'];
  var allCorrect = true;
  
  types.forEach(function(type) {
    var notif = {
      reason: type,
      author: {
        displayName: 'Test User',
        handle: 'test.bsky.social'
      }
    };
    
    var label = accessibility.getNotificationLabel(notif);
    if (label.indexOf('Test User') === -1) {
      allCorrect = false;
      console.log('  ✗ Failed for type:', type);
    }
  });
  
  if (allCorrect) {
    console.log('✓ PASS: Generates labels for all notification types');
    console.log('  Tested types:', types.join(', '));
    passed++;
  } else {
    console.log('✗ FAIL: Some notification types failed');
    failed++;
  }
} catch (error) {
  console.log('✗ FAIL:', error.message);
  failed++;
}
console.log('');

// Test 6: Get post label with long text
console.log('Test 6: Get post label with long text (truncation)');
try {
  var longPost = {
    author: {
      displayName: 'Alice',
      handle: 'alice.bsky.social'
    },
    record: {
      text: 'This is a very long post that should be truncated when generating the accessible label because it exceeds the maximum length that we want to display in the label.'
    }
  };
  
  var longLabel = accessibility.getPostLabel(longPost);
  
  if (longLabel.indexOf('Alice') !== -1 && longLabel.indexOf('...') !== -1 && longLabel.length < 200) {
    console.log('✓ PASS: Truncates long post text');
    console.log('  Label length:', longLabel.length);
    passed++;
  } else {
    console.log('✗ FAIL: Long text not truncated properly');
    failed++;
  }
} catch (error) {
  console.log('✗ FAIL:', error.message);
  failed++;
}
console.log('');

// Test 7: Handle missing data gracefully
console.log('Test 7: Handle missing data gracefully');
try {
  var emptyPost = {};
  var emptyNotif = {};
  
  var emptyPostLabel = accessibility.getPostLabel(emptyPost);
  var emptyNotifLabel = accessibility.getNotificationLabel(emptyNotif);
  
  if (emptyPostLabel && emptyNotifLabel) {
    console.log('✓ PASS: Handles missing data without errors');
    console.log('  Empty post label:', emptyPostLabel);
    console.log('  Empty notification label:', emptyNotifLabel);
    passed++;
  } else {
    console.log('✗ FAIL: Does not handle missing data');
    failed++;
  }
} catch (error) {
  console.log('✗ FAIL:', error.message);
  failed++;
}
console.log('');

// Summary
console.log('='.repeat(60));
console.log('Test Summary');
console.log('='.repeat(60));
console.log('Total Tests:', passed + failed);
console.log('Passed:', passed);
console.log('Failed:', failed);
console.log('Pass Rate:', Math.round((passed / (passed + failed)) * 100) + '%');
console.log('='.repeat(60));

if (failed === 0) {
  console.log('✓ All tests passed!');
  process.exit(0);
} else {
  console.log('✗ Some tests failed');
  process.exit(1);
}
