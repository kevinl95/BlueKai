/**
 * PostItem Component Tests
 * Requirements: 4.3, 4.6, 10.3
 */

var h = require('preact').h;
var render = require('preact').render;
var PostItem = require('./PostItem');

/**
 * Test suite for PostItem component
 */
function runPostItemTests() {
  console.log('Running PostItem tests...');
  
  var results = {
    passed: 0,
    failed: 0,
    total: 0
  };
  
  function test(name, fn) {
    results.total++;
    try {
      fn();
      results.passed++;
      console.log('✓ ' + name);
    } catch (error) {
      results.failed++;
      console.error('✗ ' + name);
      console.error('  Error:', error.message);
    }
  }
  
  function assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }
  
  // Mock post data
  var mockPost = {
    uri: 'at://did:plc:test/app.bsky.feed.post/123',
    cid: 'bafytest',
    author: {
      did: 'did:plc:test',
      handle: 'testuser.bsky.social',
      displayName: 'Test User',
      avatar: 'https://example.com/avatar.jpg'
    },
    record: {
      text: 'This is a test post with a link https://example.com',
      createdAt: new Date().toISOString()
    },
    likeCount: 5,
    repostCount: 2,
    replyCount: 3,
    viewer: {
      like: null,
      repost: null
    }
  };
  
  var mockPostLiked = Object.assign({}, mockPost, {
    viewer: {
      like: 'at://did:plc:test/app.bsky.feed.like/456',
      repost: null
    }
  });
  
  // Test 1: Renders without crashing
  test('renders without crashing', function() {
    var container = document.createElement('div');
    render(h(PostItem, { post: mockPost }), container);
    assert(container.innerHTML.length > 0, 'Should render content');
  });
  
  // Test 2: Displays author information
  test('displays author information', function() {
    var container = document.createElement('div');
    render(h(PostItem, { post: mockPost }), container);
    var html = container.innerHTML;
    assert(html.indexOf('Test User') > -1, 'Should display author name');
    assert(html.indexOf('@testuser.bsky.social') > -1, 'Should display handle');
  });
  
  // Test 3: Displays post content
  test('displays post content', function() {
    var container = document.createElement('div');
    render(h(PostItem, { post: mockPost }), container);
    var html = container.innerHTML;
    assert(html.indexOf('This is a test post') > -1, 'Should display post text');
  });
  
  // Test 4: Linkifies URLs
  test('linkifies URLs in post text', function() {
    var container = document.createElement('div');
    render(h(PostItem, { post: mockPost }), container);
    var html = container.innerHTML;
    assert(html.indexOf('<a href="https://example.com"') > -1, 'Should linkify URLs');
  });
  
  // Test 5: Displays engagement counts
  test('displays engagement counts', function() {
    var container = document.createElement('div');
    render(h(PostItem, { post: mockPost }), container);
    var html = container.innerHTML;
    assert(html.indexOf('5') > -1, 'Should display like count');
    assert(html.indexOf('2') > -1, 'Should display repost count');
    assert(html.indexOf('3') > -1, 'Should display reply count');
  });
  
  // Test 6: Shows active state for liked posts
  test('shows active state for liked posts', function() {
    var container = document.createElement('div');
    render(h(PostItem, { post: mockPostLiked }), container);
    var html = container.innerHTML;
    assert(html.indexOf('post-item__metric--active') > -1, 'Should show active state');
  });
  
  // Test 7: Applies focused class when focused
  test('applies focused class when focused', function() {
    var container = document.createElement('div');
    render(h(PostItem, { post: mockPost, focused: true }), container);
    var html = container.innerHTML;
    assert(html.indexOf('post-item--focused') > -1, 'Should have focused class');
  });
  
  // Test 8: Shows avatar placeholder in data saver mode
  test('shows avatar placeholder in data saver mode', function() {
    var container = document.createElement('div');
    render(h(PostItem, { post: mockPost, dataSaverMode: true }), container);
    var html = container.innerHTML;
    assert(html.indexOf('post-item__avatar--placeholder') > -1, 'Should show placeholder');
    assert(html.indexOf('<img') === -1, 'Should not render img tag');
  });
  
  // Test 9: Shows avatar image when not in data saver mode
  test('shows avatar image when not in data saver mode', function() {
    var container = document.createElement('div');
    render(h(PostItem, { post: mockPost, dataSaverMode: false }), container);
    var html = container.innerHTML;
    assert(html.indexOf('<img') > -1, 'Should render img tag');
    assert(html.indexOf(mockPost.author.avatar) > -1, 'Should use avatar URL');
  });
  
  // Test 10: Calls onSelect when clicked
  test('calls onSelect when clicked', function() {
    var called = false;
    var selectedPost = null;
    
    var onSelect = function(post) {
      called = true;
      selectedPost = post;
    };
    
    var container = document.createElement('div');
    document.body.appendChild(container);
    
    render(h(PostItem, { post: mockPost, onSelect: onSelect }), container);
    
    var postElement = container.querySelector('.post-item');
    assert(postElement, 'Should find post element');
    
    postElement.click();
    
    assert(called, 'Should call onSelect');
    assert(selectedPost === mockPost, 'Should pass post to onSelect');
    
    document.body.removeChild(container);
  });
  
  // Test 11: Handles missing author gracefully
  test('handles missing author gracefully', function() {
    var postNoAuthor = Object.assign({}, mockPost, {
      author: {}
    });
    
    var container = document.createElement('div');
    render(h(PostItem, { post: postNoAuthor }), container);
    assert(container.innerHTML.length > 0, 'Should render without crashing');
  });
  
  // Test 12: Handles zero engagement counts
  test('handles zero engagement counts', function() {
    var postNoEngagement = Object.assign({}, mockPost, {
      likeCount: 0,
      repostCount: 0,
      replyCount: 0
    });
    
    var container = document.createElement('div');
    render(h(PostItem, { post: postNoEngagement }), container);
    var html = container.innerHTML;
    // Should still render metrics section but without numbers
    assert(html.indexOf('post-item__engagement') > -1, 'Should render engagement section');
  });
  
  // Print results
  console.log('\n--- PostItem Test Results ---');
  console.log('Total:', results.total);
  console.log('Passed:', results.passed);
  console.log('Failed:', results.failed);
  console.log('Success Rate:', ((results.passed / results.total) * 100).toFixed(1) + '%');
  
  return results;
}

// Export for use in test runners
if (typeof module !== 'undefined' && module.exports) {
  module.exports = runPostItemTests;
}

// Run tests if executed directly
if (typeof window !== 'undefined') {
  runPostItemTests();
}
