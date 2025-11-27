/**
 * PostActionMenu Component Tests
 * Tests for post action menu with D-pad navigation
 */

var h = require('preact').h;
var render = require('preact').render;
var PostActionMenu = require('./PostActionMenu');

/**
 * Test suite for PostActionMenu component
 */
function runPostActionMenuTests() {
  console.log('Running PostActionMenu tests...');
  
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
      console.error('  ' + error.message);
    }
  }
  
  function assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }
  
  // Test 1: Component renders with actions
  test('renders action menu with like, repost, reply options', function() {
    var container = document.createElement('div');
    var mockPost = {
      uri: 'at://test/post/123',
      cid: 'cid123',
      viewer: {}
    };
    
    render(h(PostActionMenu, { post: mockPost }), container);
    
    var menu = container.querySelector('.post-action-menu');
    assert(menu !== null, 'Menu should render');
    
    var items = container.querySelectorAll('.post-action-menu__item');
    assert(items.length === 3, 'Should have 3 action items');
    
    var labels = Array.prototype.map.call(items, function(item) {
      return item.textContent.trim();
    });
    
    assert(labels[0].indexOf('Like') !== -1, 'First action should be Like');
    assert(labels[1].indexOf('Repost') !== -1, 'Second action should be Repost');
    assert(labels[2].indexOf('Reply') !== -1, 'Third action should be Reply');
  });
  
  // Test 2: Shows unlike when post is liked
  test('shows unlike option when post is already liked', function() {
    var container = document.createElement('div');
    var mockPost = {
      uri: 'at://test/post/123',
      cid: 'cid123',
      viewer: {
        like: 'at://test/like/456'
      }
    };
    
    render(h(PostActionMenu, { post: mockPost }), container);
    
    var items = container.querySelectorAll('.post-action-menu__item');
    var firstLabel = items[0].textContent.trim();
    
    assert(firstLabel.indexOf('Unlike') !== -1, 'Should show Unlike when liked');
  });
  
  // Test 3: Shows undo repost when post is reposted
  test('shows undo repost option when post is already reposted', function() {
    var container = document.createElement('div');
    var mockPost = {
      uri: 'at://test/post/123',
      cid: 'cid123',
      viewer: {
        repost: 'at://test/repost/789'
      }
    };
    
    render(h(PostActionMenu, { post: mockPost }), container);
    
    var items = container.querySelectorAll('.post-action-menu__item');
    var secondLabel = items[1].textContent.trim();
    
    assert(secondLabel.indexOf('Undo') !== -1, 'Should show Undo Repost when reposted');
  });
  
  // Test 4: First item is selected by default
  test('first action item is selected by default', function() {
    var container = document.createElement('div');
    var mockPost = {
      uri: 'at://test/post/123',
      cid: 'cid123',
      viewer: {}
    };
    
    render(h(PostActionMenu, { post: mockPost }), container);
    
    var selectedItem = container.querySelector('.post-action-menu__item--selected');
    assert(selectedItem !== null, 'Should have a selected item');
    
    var items = container.querySelectorAll('.post-action-menu__item');
    assert(items[0] === selectedItem, 'First item should be selected');
  });
  
  // Test 5: D-pad navigation moves selection
  test('arrow down moves selection to next item', function() {
    var container = document.createElement('div');
    document.body.appendChild(container);
    
    var mockPost = {
      uri: 'at://test/post/123',
      cid: 'cid123',
      viewer: {}
    };
    
    var instance;
    var component = h(PostActionMenu, {
      post: mockPost,
      ref: function(ref) { instance = ref; }
    });
    
    render(component, container);
    
    // Simulate arrow down
    var event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    document.dispatchEvent(event);
    
    // Wait for state update
    setTimeout(function() {
      var items = container.querySelectorAll('.post-action-menu__item');
      var selectedItem = container.querySelector('.post-action-menu__item--selected');
      
      assert(items[1] === selectedItem, 'Second item should be selected after arrow down');
      
      document.body.removeChild(container);
    }, 50);
  });
  
  // Test 6: Circular navigation wraps around
  test('arrow up from first item wraps to last item', function() {
    var container = document.createElement('div');
    document.body.appendChild(container);
    
    var mockPost = {
      uri: 'at://test/post/123',
      cid: 'cid123',
      viewer: {}
    };
    
    render(h(PostActionMenu, { post: mockPost }), container);
    
    // Simulate arrow up from first item
    var event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
    document.dispatchEvent(event);
    
    setTimeout(function() {
      var items = container.querySelectorAll('.post-action-menu__item');
      var selectedItem = container.querySelector('.post-action-menu__item--selected');
      
      assert(items[items.length - 1] === selectedItem, 'Last item should be selected after arrow up from first');
      
      document.body.removeChild(container);
    }, 50);
  });
  
  // Test 7: Enter key triggers action
  test('enter key calls onAction callback', function() {
    var container = document.createElement('div');
    document.body.appendChild(container);
    
    var actionCalled = false;
    var actionId = null;
    
    var mockPost = {
      uri: 'at://test/post/123',
      cid: 'cid123',
      viewer: {}
    };
    
    render(h(PostActionMenu, {
      post: mockPost,
      onAction: function(id) {
        actionCalled = true;
        actionId = id;
        return Promise.resolve();
      }
    }), container);
    
    // Simulate enter key
    var event = new KeyboardEvent('keydown', { key: 'Enter' });
    document.dispatchEvent(event);
    
    setTimeout(function() {
      assert(actionCalled, 'onAction should be called');
      assert(actionId === 'like', 'Should call like action (first item)');
      
      document.body.removeChild(container);
    }, 50);
  });
  
  // Test 8: Shows loading state during action
  test('shows loading indicator during action execution', function() {
    var container = document.createElement('div');
    document.body.appendChild(container);
    
    var mockPost = {
      uri: 'at://test/post/123',
      cid: 'cid123',
      viewer: {}
    };
    
    var resolveAction;
    var actionPromise = new Promise(function(resolve) {
      resolveAction = resolve;
    });
    
    render(h(PostActionMenu, {
      post: mockPost,
      onAction: function() {
        return actionPromise;
      }
    }), container);
    
    // Trigger action
    var event = new KeyboardEvent('keydown', { key: 'Enter' });
    document.dispatchEvent(event);
    
    setTimeout(function() {
      var loading = container.querySelector('.post-action-menu__loading');
      assert(loading !== null, 'Should show loading indicator');
      
      // Resolve action
      resolveAction();
      
      setTimeout(function() {
        document.body.removeChild(container);
      }, 100);
    }, 50);
  });
  
  // Test 9: Shows error feedback on failure
  test('shows error feedback when action fails', function() {
    var container = document.createElement('div');
    document.body.appendChild(container);
    
    var mockPost = {
      uri: 'at://test/post/123',
      cid: 'cid123',
      viewer: {}
    };
    
    render(h(PostActionMenu, {
      post: mockPost,
      onAction: function() {
        return Promise.reject(new Error('Network error'));
      }
    }), container);
    
    // Trigger action
    var event = new KeyboardEvent('keydown', { key: 'Enter' });
    document.dispatchEvent(event);
    
    setTimeout(function() {
      var feedback = container.querySelector('.post-action-menu__feedback--error');
      assert(feedback !== null, 'Should show error feedback');
      assert(feedback.textContent.indexOf('error') !== -1, 'Should contain error message');
      
      document.body.removeChild(container);
    }, 100);
  });
  
  // Test 10: Back key closes menu
  test('backspace key calls onClose callback', function() {
    var container = document.createElement('div');
    document.body.appendChild(container);
    
    var closeCalled = false;
    
    var mockPost = {
      uri: 'at://test/post/123',
      cid: 'cid123',
      viewer: {}
    };
    
    render(h(PostActionMenu, {
      post: mockPost,
      onClose: function() {
        closeCalled = true;
      }
    }), container);
    
    // Simulate backspace key
    var event = new KeyboardEvent('keydown', { key: 'Backspace' });
    document.dispatchEvent(event);
    
    setTimeout(function() {
      assert(closeCalled, 'onClose should be called');
      
      document.body.removeChild(container);
    }, 50);
  });
  
  // Test: Load images action appears in data saver mode
  test('Load images action appears in data saver mode', function() {
    var container = document.createElement('div');
    document.body.appendChild(container);
    
    var component = h(PostActionMenu, {
      post: mockPost,
      dataSaverMode: true,
      imagesLoaded: false
    });
    
    var instance = render(component, container);
    
    var actions = instance.getActions();
    var loadImagesAction = actions.find(function(a) { return a.id === 'load-images'; });
    
    assert(loadImagesAction !== undefined, 'Load images action should be present');
    assert(loadImagesAction.label === 'Load Images', 'Should have correct label');
    
    document.body.removeChild(container);
  });
  
  // Test: Load images action does not appear when images already loaded
  test('Load images action hidden when images already loaded', function() {
    var container = document.createElement('div');
    document.body.appendChild(container);
    
    var component = h(PostActionMenu, {
      post: mockPost,
      dataSaverMode: true,
      imagesLoaded: true
    });
    
    var instance = render(component, container);
    
    var actions = instance.getActions();
    var loadImagesAction = actions.find(function(a) { return a.id === 'load-images'; });
    
    assert(loadImagesAction === undefined, 'Load images action should not be present when already loaded');
    
    document.body.removeChild(container);
  });
  
  // Test: Load images action does not appear when data saver is off
  test('Load images action hidden when data saver is off', function() {
    var container = document.createElement('div');
    document.body.appendChild(container);
    
    var component = h(PostActionMenu, {
      post: mockPost,
      dataSaverMode: false,
      imagesLoaded: false
    });
    
    var instance = render(component, container);
    
    var actions = instance.getActions();
    var loadImagesAction = actions.find(function(a) { return a.id === 'load-images'; });
    
    assert(loadImagesAction === undefined, 'Load images action should not be present when data saver is off');
    
    document.body.removeChild(container);
  });
  
  // Print results
  console.log('\n--- PostActionMenu Test Results ---');
  console.log('Total: ' + results.total);
  console.log('Passed: ' + results.passed);
  console.log('Failed: ' + results.failed);
  console.log('Success Rate: ' + Math.round((results.passed / results.total) * 100) + '%');
  
  return results;
}

// Export for use in test runner
if (typeof module !== 'undefined' && module.exports) {
  module.exports = runPostActionMenuTests;
}

// Auto-run if loaded directly
if (typeof window !== 'undefined' && !window.TEST_MODE) {
  document.addEventListener('DOMContentLoaded', function() {
    runPostActionMenuTests();
  });
}
