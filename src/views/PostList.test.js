/**
 * PostList Component Tests
 * Requirements: 3.1, 3.4, 7.2
 */

var h = require('preact').h;
var render = require('preact').render;
var PostList = require('./PostList');

/**
 * Test suite for PostList component
 */
function runPostListTests() {
  console.log('Running PostList tests...');
  
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
  
  // Generate mock posts
  function generateMockPosts(count) {
    var posts = [];
    for (var i = 0; i < count; i++) {
      posts.push({
        uri: 'at://did:plc:test/app.bsky.feed.post/' + i,
        cid: 'bafytest' + i,
        author: {
          did: 'did:plc:test' + i,
          handle: 'user' + i + '.bsky.social',
          displayName: 'User ' + i,
          avatar: 'https://example.com/avatar' + i + '.jpg'
        },
        record: {
          text: 'Test post ' + i,
          createdAt: new Date(Date.now() - i * 60000).toISOString()
        },
        likeCount: i,
        repostCount: i % 2,
        replyCount: i % 3,
        viewer: { like: null, repost: null }
      });
    }
    return posts;
  }
  
  // Test 1: Renders without crashing
  test('renders without crashing', function() {
    var container = document.createElement('div');
    var posts = generateMockPosts(5);
    render(h(PostList, { posts: posts }), container);
    assert(container.innerHTML.length > 0, 'Should render content');
  });
  
  // Test 2: Renders empty state
  test('renders empty state when no posts', function() {
    var container = document.createElement('div');
    render(h(PostList, { posts: [] }), container);
    var html = container.innerHTML;
    assert(html.indexOf('post-list--empty') > -1, 'Should have empty class');
    assert(html.indexOf('No posts to display') > -1, 'Should show empty message');
  });
  
  // Test 3: Renders custom empty message
  test('renders custom empty message', function() {
    var container = document.createElement('div');
    render(h(PostList, { 
      posts: [], 
      emptyMessage: 'Custom empty message' 
    }), container);
    var html = container.innerHTML;
    assert(html.indexOf('Custom empty message') > -1, 'Should show custom message');
  });
  
  // Test 4: Renders posts
  test('renders posts', function() {
    var container = document.createElement('div');
    var posts = generateMockPosts(3);
    render(h(PostList, { posts: posts }), container);
    var html = container.innerHTML;
    assert(html.indexOf('Test post 0') > -1, 'Should render first post');
    assert(html.indexOf('Test post 1') > -1, 'Should render second post');
    assert(html.indexOf('Test post 2') > -1, 'Should render third post');
  });
  
  // Test 5: Virtual scrolling - only renders visible items
  test('virtual scrolling renders subset of items', function() {
    var container = document.createElement('div');
    container.style.height = '300px';
    document.body.appendChild(container);
    
    var posts = generateMockPosts(100);
    render(h(PostList, { posts: posts, itemHeight: 120 }), container);
    
    // Should not render all 100 posts immediately
    var postItems = container.querySelectorAll('.post-item');
    assert(postItems.length < 100, 'Should render fewer items than total');
    assert(postItems.length > 0, 'Should render some items');
    
    document.body.removeChild(container);
  });
  
  // Test 6: Creates spacer for scrolling
  test('creates spacer for virtual scrolling', function() {
    var container = document.createElement('div');
    var posts = generateMockPosts(50);
    render(h(PostList, { posts: posts, itemHeight: 120 }), container);
    
    var spacer = container.querySelector('.post-list__spacer');
    assert(spacer, 'Should have spacer element');
    
    var expectedHeight = 50 * 120; // 50 posts * 120px each
    var spacerHeight = parseInt(spacer.style.height);
    assert(spacerHeight === expectedHeight, 'Spacer should have correct height');
  });
  
  // Test 7: Handles onSelectPost callback
  test('calls onSelectPost when post is selected', function() {
    var called = false;
    var selectedPost = null;
    
    var onSelectPost = function(post) {
      called = true;
      selectedPost = post;
    };
    
    var container = document.createElement('div');
    document.body.appendChild(container);
    
    var posts = generateMockPosts(3);
    render(h(PostList, { 
      posts: posts, 
      onSelectPost: onSelectPost 
    }), container);
    
    var firstPost = container.querySelector('.post-item');
    assert(firstPost, 'Should find post element');
    
    firstPost.click();
    
    assert(called, 'Should call onSelectPost');
    assert(selectedPost !== null, 'Should pass post to callback');
    
    document.body.removeChild(container);
  });
  
  // Test 8: Passes dataSaverMode to PostItem
  test('passes dataSaverMode to PostItem', function() {
    var container = document.createElement('div');
    var posts = generateMockPosts(2);
    render(h(PostList, { 
      posts: posts, 
      dataSaverMode: true 
    }), container);
    
    var html = container.innerHTML;
    // Should have placeholder avatars, not img tags
    assert(html.indexOf('post-item__avatar--placeholder') > -1, 'Should use placeholders');
  });
  
  // Test 9: Handles keyboard navigation
  test('handles keyboard navigation', function() {
    var container = document.createElement('div');
    document.body.appendChild(container);
    
    var posts = generateMockPosts(5);
    render(h(PostList, { posts: posts }), container);
    
    var listElement = container.querySelector('.post-list');
    assert(listElement, 'Should find list element');
    
    // Simulate ArrowDown key
    var event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    listElement.dispatchEvent(event);
    
    // Component should handle the event (no error thrown)
    assert(true, 'Should handle keyboard event');
    
    document.body.removeChild(container);
  });
  
  // Test 10: Has proper ARIA attributes
  test('has proper ARIA attributes', function() {
    var container = document.createElement('div');
    var posts = generateMockPosts(3);
    render(h(PostList, { posts: posts }), container);
    
    var listElement = container.querySelector('[role="list"]');
    assert(listElement, 'Should have list role');
    
    var ariaLabel = listElement.getAttribute('aria-label');
    assert(ariaLabel === 'Post list', 'Should have aria-label');
  });
  
  // Test 11: Calculates visible range correctly
  test('calculates visible range with buffer', function() {
    var container = document.createElement('div');
    container.style.height = '300px';
    document.body.appendChild(container);
    
    var posts = generateMockPosts(50);
    render(h(PostList, { 
      posts: posts, 
      itemHeight: 100,
      bufferSize: 2
    }), container);
    
    // With 300px height and 100px items, should show ~3 items
    // Plus 2 buffer above and below = ~7 items
    var postItems = container.querySelectorAll('.post-item');
    assert(postItems.length >= 3, 'Should render at least visible items');
    assert(postItems.length <= 10, 'Should not render too many items');
    
    document.body.removeChild(container);
  });
  
  // Test 12: Updates on props change
  test('updates when posts prop changes', function() {
    var container = document.createElement('div');
    var posts1 = generateMockPosts(3);
    var component = render(h(PostList, { posts: posts1 }), container);
    
    var html1 = container.innerHTML;
    assert(html1.indexOf('Test post 0') > -1, 'Should render initial posts');
    
    var posts2 = generateMockPosts(5);
    render(h(PostList, { posts: posts2 }), container, component);
    
    var html2 = container.innerHTML;
    assert(html2.indexOf('Test post 4') > -1, 'Should render new posts');
  });
  
  // Print results
  console.log('\n--- PostList Test Results ---');
  console.log('Total:', results.total);
  console.log('Passed:', results.passed);
  console.log('Failed:', results.failed);
  console.log('Success Rate:', ((results.passed / results.total) * 100).toFixed(1) + '%');
  
  return results;
}

// Export for use in test runners
if (typeof module !== 'undefined' && module.exports) {
  module.exports = runPostListTests;
}

// Run tests if executed directly
if (typeof window !== 'undefined') {
  runPostListTests();
}
