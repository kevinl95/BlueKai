/**
 * MainMenu Component Tests
 * Tests for main application menu with D-pad navigation
 * Requirements: 1.1, 1.2, 1.3, 1.5, 1.6, 1.7, 1.8
 */

var h = require('preact').h;
var render = require('preact').render;
var MainMenu = require('./MainMenu');

/**
 * Test suite for MainMenu component
 */
function runMainMenuTests() {
  console.log('Running MainMenu tests...');
  
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
  
  // Mock current user
  var mockUser = {
    handle: 'testuser.bsky.social',
    did: 'did:plc:test123'
  };
  
  // Test 1: Component renders with menu items
  test('renders menu with Profile, Notifications, Settings, Logout options', function() {
    var container = document.createElement('div');
    
    render(h(MainMenu, {
      currentUser: mockUser,
      onClose: function() {},
      onNavigateToProfile: function() {},
      onNavigateToNotifications: function() {},
      onNavigateToSettings: function() {},
      onLogout: function() {}
    }), container);
    
    var menu = container.querySelector('.main-menu');
    assert(menu !== null, 'Menu should render');
    
    var items = container.querySelectorAll('.main-menu__item');
    assert(items.length === 4, 'Should have 4 menu items');
  });
  
  // Test 2: Menu has correct ARIA attributes
  test('menu has correct role and aria-label attributes', function() {
    var container = document.createElement('div');
    
    render(h(MainMenu, {
      currentUser: mockUser,
      onClose: function() {},
      onNavigateToProfile: function() {},
      onNavigateToNotifications: function() {},
      onNavigateToSettings: function() {},
      onLogout: function() {}
    }), container);
    
    var menu = container.querySelector('.main-menu');
    assert(menu.getAttribute('role') === 'menu', 'Menu should have role="menu"');
    assert(menu.getAttribute('aria-label') !== null, 'Menu should have aria-label');
  });
  
  // Test 3: Menu items have correct ARIA attributes
  test('menu items have role="menuitem" and aria-selected attributes', function() {
    var container = document.createElement('div');
    
    render(h(MainMenu, {
      currentUser: mockUser,
      onClose: function() {},
      onNavigateToProfile: function() {},
      onNavigateToNotifications: function() {},
      onNavigateToSettings: function() {},
      onLogout: function() {}
    }), container);
    
    var items = container.querySelectorAll('.main-menu__item');
    
    items.forEach(function(item) {
      assert(item.getAttribute('role') === 'menuitem', 'Item should have role="menuitem"');
      assert(item.getAttribute('aria-selected') !== null, 'Item should have aria-selected');
    });
  });
  
  // Test 4: First item is focused by default
  test('first menu item is focused by default', function() {
    var container = document.createElement('div');
    
    render(h(MainMenu, {
      currentUser: mockUser,
      onClose: function() {},
      onNavigateToProfile: function() {},
      onNavigateToNotifications: function() {},
      onNavigateToSettings: function() {},
      onLogout: function() {}
    }), container);
    
    var focusedItem = container.querySelector('.main-menu__item--focused');
    assert(focusedItem !== null, 'Should have a focused item');
    
    var items = container.querySelectorAll('.main-menu__item');
    assert(items[0] === focusedItem, 'First item should be focused');
    assert(focusedItem.getAttribute('aria-selected') === 'true', 'Focused item should have aria-selected="true"');
  });
  
  // Test 5: Arrow down moves focus to next item
  test('arrow down moves focus to next item', function() {
    var container = document.createElement('div');
    document.body.appendChild(container);
    
    render(h(MainMenu, {
      currentUser: mockUser,
      onClose: function() {},
      onNavigateToProfile: function() {},
      onNavigateToNotifications: function() {},
      onNavigateToSettings: function() {},
      onLogout: function() {}
    }), container);
    
    // Simulate arrow down
    var event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    document.dispatchEvent(event);
    
    setTimeout(function() {
      var items = container.querySelectorAll('.main-menu__item');
      var focusedItem = container.querySelector('.main-menu__item--focused');
      
      assert(items[1] === focusedItem, 'Second item should be focused after arrow down');
      
      document.body.removeChild(container);
    }, 50);
  });
  
  // Test 6: Arrow up moves focus to previous item
  test('arrow up moves focus to previous item', function() {
    var container = document.createElement('div');
    document.body.appendChild(container);
    
    render(h(MainMenu, {
      currentUser: mockUser,
      onClose: function() {},
      onNavigateToProfile: function() {},
      onNavigateToNotifications: function() {},
      onNavigateToSettings: function() {},
      onLogout: function() {}
    }), container);
    
    // Move down first
    var downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    document.dispatchEvent(downEvent);
    
    setTimeout(function() {
      // Then move up
      var upEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      document.dispatchEvent(upEvent);
      
      setTimeout(function() {
        var items = container.querySelectorAll('.main-menu__item');
        var focusedItem = container.querySelector('.main-menu__item--focused');
        
        assert(items[0] === focusedItem, 'First item should be focused after arrow up');
        
        document.body.removeChild(container);
      }, 50);
    }, 50);
  });
  
  // Test 7: Focus wraps from last to first item
  test('arrow down from last item wraps to first item', function() {
    var container = document.createElement('div');
    document.body.appendChild(container);
    
    render(h(MainMenu, {
      currentUser: mockUser,
      onClose: function() {},
      onNavigateToProfile: function() {},
      onNavigateToNotifications: function() {},
      onNavigateToSettings: function() {},
      onLogout: function() {}
    }), container);
    
    // Move to last item (need 3 arrow downs now since we have 4 items)
    var event1 = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    document.dispatchEvent(event1);
    
    setTimeout(function() {
      var event2 = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      document.dispatchEvent(event2);
      
      setTimeout(function() {
        var event3 = new KeyboardEvent('keydown', { key: 'ArrowDown' });
        document.dispatchEvent(event3);
        
        setTimeout(function() {
          // Now at last item, move down again
          var event4 = new KeyboardEvent('keydown', { key: 'ArrowDown' });
          document.dispatchEvent(event4);
          
          setTimeout(function() {
            var items = container.querySelectorAll('.main-menu__item');
            var focusedItem = container.querySelector('.main-menu__item--focused');
            
            assert(items[0] === focusedItem, 'Should wrap to first item');
            
            document.body.removeChild(container);
          }, 50);
        }, 50);
      }, 50);
    }, 50);
  });
  
  // Test 8: Focus wraps from first to last item
  test('arrow up from first item wraps to last item', function() {
    var container = document.createElement('div');
    document.body.appendChild(container);
    
    render(h(MainMenu, {
      currentUser: mockUser,
      onClose: function() {},
      onNavigateToProfile: function() {},
      onNavigateToNotifications: function() {},
      onNavigateToSettings: function() {},
      onLogout: function() {}
    }), container);
    
    // Simulate arrow up from first item
    var event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
    document.dispatchEvent(event);
    
    setTimeout(function() {
      var items = container.querySelectorAll('.main-menu__item');
      var focusedItem = container.querySelector('.main-menu__item--focused');
      
      assert(items[items.length - 1] === focusedItem, 'Should wrap to last item');
      
      document.body.removeChild(container);
    }, 50);
  });
  
  // Test 9: Enter key on Profile calls onNavigateToProfile
  test('enter key on Profile item calls onNavigateToProfile callback', function() {
    var container = document.createElement('div');
    document.body.appendChild(container);
    
    var profileCalled = false;
    
    render(h(MainMenu, {
      currentUser: mockUser,
      onClose: function() {},
      onNavigateToProfile: function() {
        profileCalled = true;
      },
      onNavigateToNotifications: function() {},
      onNavigateToSettings: function() {},
      onLogout: function() {}
    }), container);
    
    // First item (Profile) is selected by default
    var event = new KeyboardEvent('keydown', { key: 'Enter' });
    document.dispatchEvent(event);
    
    setTimeout(function() {
      assert(profileCalled, 'onNavigateToProfile should be called');
      
      document.body.removeChild(container);
    }, 50);
  });
  
  // Test 10: Enter key on Settings calls onNavigateToSettings
  test('enter key on Settings item calls onNavigateToSettings callback', function() {
    var container = document.createElement('div');
    document.body.appendChild(container);
    
    var settingsCalled = false;
    
    render(h(MainMenu, {
      currentUser: mockUser,
      onClose: function() {},
      onNavigateToProfile: function() {},
      onNavigateToNotifications: function() {},
      onNavigateToSettings: function() {
        settingsCalled = true;
      },
      onLogout: function() {}
    }), container);
    
    // Move to Settings (third item now, after notifications)
    var downEvent1 = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    document.dispatchEvent(downEvent1);
    
    setTimeout(function() {
      var downEvent2 = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      document.dispatchEvent(downEvent2);
      
      setTimeout(function() {
        var enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        document.dispatchEvent(enterEvent);
        
        setTimeout(function() {
          assert(settingsCalled, 'onNavigateToSettings should be called');
          
          document.body.removeChild(container);
        }, 50);
      }, 50);
    }, 50);
  });
  
  // Test 11: Enter key on Logout shows logout confirmation dialog
  test('enter key on Logout item shows logout confirmation dialog', function() {
    var container = document.createElement('div');
    document.body.appendChild(container);
    
    render(h(MainMenu, {
      currentUser: mockUser,
      onClose: function() {},
      onNavigateToProfile: function() {},
      onNavigateToNotifications: function() {},
      onNavigateToSettings: function() {},
      onLogout: function() {}
    }), container);
    
    // Move to Logout (fourth item now)
    var down1 = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    document.dispatchEvent(down1);
    
    setTimeout(function() {
      var down2 = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      document.dispatchEvent(down2);
      
      setTimeout(function() {
        var down3 = new KeyboardEvent('keydown', { key: 'ArrowDown' });
        document.dispatchEvent(down3);
        
        setTimeout(function() {
          var enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
          document.dispatchEvent(enterEvent);
          
          setTimeout(function() {
            var confirmation = container.querySelector('.logout-confirmation__backdrop');
            assert(confirmation !== null, 'Logout confirmation should be displayed');
            
            document.body.removeChild(container);
          }, 50);
        }, 50);
      }, 50);
    }, 50);
  });
  
  // Test 12: Backspace key calls onClose
  test('backspace key calls onClose callback', function() {
    var container = document.createElement('div');
    document.body.appendChild(container);
    
    var closeCalled = false;
    
    render(h(MainMenu, {
      currentUser: mockUser,
      onClose: function() {
        closeCalled = true;
      },
      onNavigateToProfile: function() {},
      onNavigateToNotifications: function() {},
      onNavigateToSettings: function() {},
      onLogout: function() {}
    }), container);
    
    var event = new KeyboardEvent('keydown', { key: 'Backspace' });
    document.dispatchEvent(event);
    
    setTimeout(function() {
      assert(closeCalled, 'onClose should be called');
      
      document.body.removeChild(container);
    }, 50);
  });
  
  // Test 13: Escape key calls onClose
  test('escape key calls onClose callback', function() {
    var container = document.createElement('div');
    document.body.appendChild(container);
    
    var closeCalled = false;
    
    render(h(MainMenu, {
      currentUser: mockUser,
      onClose: function() {
        closeCalled = true;
      },
      onNavigateToProfile: function() {},
      onNavigateToNotifications: function() {},
      onNavigateToSettings: function() {},
      onLogout: function() {}
    }), container);
    
    var event = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(event);
    
    setTimeout(function() {
      assert(closeCalled, 'onClose should be called');
      
      document.body.removeChild(container);
    }, 50);
  });
  
  // Test 14: Menu displays with overlay
  test('menu renders with semi-transparent overlay', function() {
    var container = document.createElement('div');
    
    render(h(MainMenu, {
      currentUser: mockUser,
      onClose: function() {},
      onNavigateToProfile: function() {},
      onNavigateToNotifications: function() {},
      onNavigateToSettings: function() {},
      onLogout: function() {}
    }), container);
    
    var overlay = container.querySelector('.main-menu-overlay');
    assert(overlay !== null, 'Overlay should be present');
  });
  
  // Test 15: Clicking overlay background calls onClose
  test('clicking overlay background calls onClose', function() {
    var container = document.createElement('div');
    document.body.appendChild(container);
    
    var closeCalled = false;
    
    render(h(MainMenu, {
      currentUser: mockUser,
      onClose: function() {
        closeCalled = true;
      },
      onNavigateToProfile: function() {},
      onNavigateToNotifications: function() {},
      onNavigateToSettings: function() {},
      onLogout: function() {}
    }), container);
    
    var overlay = container.querySelector('.main-menu-overlay');
    var clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true
    });
    
    // Set target to overlay itself
    Object.defineProperty(clickEvent, 'target', {
      value: overlay,
      enumerable: true
    });
    
    overlay.dispatchEvent(clickEvent);
    
    setTimeout(function() {
      assert(closeCalled, 'onClose should be called when clicking overlay');
      
      document.body.removeChild(container);
    }, 50);
  });
  
  // Print results
  console.log('\n--- MainMenu Test Results ---');
  console.log('Total: ' + results.total);
  console.log('Passed: ' + results.passed);
  console.log('Failed: ' + results.failed);
  console.log('Success Rate: ' + Math.round((results.passed / results.total) * 100) + '%');
  
  return results;
}

// Export for use in test runner
if (typeof module !== 'undefined' && module.exports) {
  module.exports = runMainMenuTests;
}

// Auto-run if loaded directly
if (typeof window !== 'undefined' && !window.TEST_MODE) {
  document.addEventListener('DOMContentLoaded', function() {
    runMainMenuTests();
  });
}
