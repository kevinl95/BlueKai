/**
 * Tests for NavigationManager
 */

var NavigationManager = require('./navigation-manager');

// Test utilities
function createMockElement(id) {
  var element = document.createElement('div');
  element.id = id;
  element.classList = {
    add: function(className) {
      this._classes = this._classes || [];
      if (this._classes.indexOf(className) === -1) {
        this._classes.push(className);
      }
    },
    remove: function(className) {
      this._classes = this._classes || [];
      var index = this._classes.indexOf(className);
      if (index > -1) {
        this._classes.splice(index, 1);
      }
    },
    contains: function(className) {
      this._classes = this._classes || [];
      return this._classes.indexOf(className) > -1;
    },
    _classes: []
  };
  element.scrollIntoView = function() {};
  return element;
}

function createKeyEvent(key) {
  return {
    key: key,
    preventDefault: function() { this.defaultPrevented = true; },
    stopPropagation: function() { this.propagationStopped = true; },
    defaultPrevented: false,
    propagationStopped: false
  };
}

// Test Suite
function runTests() {
  var results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  function test(name, fn) {
    try {
      fn();
      results.passed++;
      results.tests.push({ name: name, status: 'PASS' });
      console.log('✓ ' + name);
    } catch (error) {
      results.failed++;
      results.tests.push({ name: name, status: 'FAIL', error: error.message });
      console.error('✗ ' + name);
      console.error('  Error: ' + error.message);
    }
  }

  function assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  function assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(message || 'Expected ' + expected + ' but got ' + actual);
    }
  }

  console.log('\n=== NavigationManager Tests ===\n');

  // Test: Constructor initializes with default options
  test('Constructor initializes with default options', function() {
    var nav = new NavigationManager();
    assert(nav.options.circular === true, 'circular should default to true');
    assert(nav.options.focusClass === 'focused', 'focusClass should default to "focused"');
    assert(nav.focusableElements.length === 0, 'focusableElements should be empty');
    assert(nav.currentIndex === -1, 'currentIndex should be -1');
    assert(nav.isActive === false, 'isActive should be false');
  });

  // Test: Constructor accepts custom options
  test('Constructor accepts custom options', function() {
    var onSelect = function() {};
    var nav = new NavigationManager({
      onSelect: onSelect,
      circular: false,
      focusClass: 'custom-focus'
    });
    assert(nav.options.onSelect === onSelect, 'onSelect should be set');
    assert(nav.options.circular === false, 'circular should be false');
    assert(nav.options.focusClass === 'custom-focus', 'focusClass should be custom-focus');
  });

  // Test: init() activates navigation manager
  test('init() activates navigation manager', function() {
    var nav = new NavigationManager();
    nav.init();
    assert(nav.isActive === true, 'isActive should be true after init');
    nav.destroy();
  });

  // Test: destroy() deactivates navigation manager
  test('destroy() deactivates navigation manager', function() {
    var nav = new NavigationManager();
    nav.init();
    nav.destroy();
    assert(nav.isActive === false, 'isActive should be false after destroy');
    assert(nav.currentIndex === -1, 'currentIndex should be reset');
    assert(nav.focusableElements.length === 0, 'focusableElements should be cleared');
  });

  // Test: updateFocusableElements sets elements and focuses first
  test('updateFocusableElements sets elements and focuses first', function() {
    var nav = new NavigationManager();
    var elements = [createMockElement('el1'), createMockElement('el2'), createMockElement('el3')];
    
    nav.updateFocusableElements(elements);
    
    assert(nav.focusableElements.length === 3, 'Should have 3 focusable elements');
    assert(nav.currentIndex === 0, 'Should focus first element');
    assert(elements[0].classList.contains('focused'), 'First element should have focus class');
  });

  // Test: moveFocus moves forward
  test('moveFocus moves forward', function() {
    var nav = new NavigationManager();
    var elements = [createMockElement('el1'), createMockElement('el2'), createMockElement('el3')];
    nav.updateFocusableElements(elements);
    
    nav.moveFocus(1);
    
    assert(nav.currentIndex === 1, 'Should move to index 1');
    assert(!elements[0].classList.contains('focused'), 'First element should lose focus');
    assert(elements[1].classList.contains('focused'), 'Second element should have focus');
  });

  // Test: moveFocus moves backward
  test('moveFocus moves backward', function() {
    var nav = new NavigationManager();
    var elements = [createMockElement('el1'), createMockElement('el2'), createMockElement('el3')];
    nav.updateFocusableElements(elements);
    nav.setFocusIndex(1);
    
    nav.moveFocus(-1);
    
    assert(nav.currentIndex === 0, 'Should move to index 0');
    assert(elements[0].classList.contains('focused'), 'First element should have focus');
    assert(!elements[1].classList.contains('focused'), 'Second element should lose focus');
  });

  // Test: Circular navigation wraps forward
  test('Circular navigation wraps forward', function() {
    var nav = new NavigationManager({ circular: true });
    var elements = [createMockElement('el1'), createMockElement('el2'), createMockElement('el3')];
    nav.updateFocusableElements(elements);
    nav.setFocusIndex(2);
    
    nav.moveFocus(1);
    
    assert(nav.currentIndex === 0, 'Should wrap to index 0');
    assert(elements[0].classList.contains('focused'), 'First element should have focus');
  });

  // Test: Circular navigation wraps backward
  test('Circular navigation wraps backward', function() {
    var nav = new NavigationManager({ circular: true });
    var elements = [createMockElement('el1'), createMockElement('el2'), createMockElement('el3')];
    nav.updateFocusableElements(elements);
    
    nav.moveFocus(-1);
    
    assert(nav.currentIndex === 2, 'Should wrap to index 2');
    assert(elements[2].classList.contains('focused'), 'Last element should have focus');
  });

  // Test: Non-circular navigation clamps at start
  test('Non-circular navigation clamps at start', function() {
    var nav = new NavigationManager({ circular: false });
    var elements = [createMockElement('el1'), createMockElement('el2'), createMockElement('el3')];
    nav.updateFocusableElements(elements);
    
    nav.moveFocus(-1);
    
    assert(nav.currentIndex === 0, 'Should stay at index 0');
    assert(elements[0].classList.contains('focused'), 'First element should have focus');
  });

  // Test: Non-circular navigation clamps at end
  test('Non-circular navigation clamps at end', function() {
    var nav = new NavigationManager({ circular: false });
    var elements = [createMockElement('el1'), createMockElement('el2'), createMockElement('el3')];
    nav.updateFocusableElements(elements);
    nav.setFocusIndex(2);
    
    nav.moveFocus(1);
    
    assert(nav.currentIndex === 2, 'Should stay at index 2');
    assert(elements[2].classList.contains('focused'), 'Last element should have focus');
  });

  // Test: handleKeyDown processes ArrowDown
  test('handleKeyDown processes ArrowDown', function() {
    var nav = new NavigationManager();
    var elements = [createMockElement('el1'), createMockElement('el2')];
    nav.updateFocusableElements(elements);
    nav.init();
    
    var event = createKeyEvent('ArrowDown');
    nav.handleKeyDown(event);
    
    assert(nav.currentIndex === 1, 'Should move to index 1');
    assert(event.defaultPrevented, 'Event should be prevented');
    nav.destroy();
  });

  // Test: handleKeyDown processes ArrowUp
  test('handleKeyDown processes ArrowUp', function() {
    var nav = new NavigationManager();
    var elements = [createMockElement('el1'), createMockElement('el2')];
    nav.updateFocusableElements(elements);
    nav.setFocusIndex(1);
    nav.init();
    
    var event = createKeyEvent('ArrowUp');
    nav.handleKeyDown(event);
    
    assert(nav.currentIndex === 0, 'Should move to index 0');
    assert(event.defaultPrevented, 'Event should be prevented');
    nav.destroy();
  });

  // Test: handleKeyDown calls onSelect for Enter key
  test('handleKeyDown calls onSelect for Enter key', function() {
    var selectedElement = null;
    var selectedIndex = -1;
    var nav = new NavigationManager({
      onSelect: function(element, index) {
        selectedElement = element;
        selectedIndex = index;
      }
    });
    var elements = [createMockElement('el1'), createMockElement('el2')];
    nav.updateFocusableElements(elements);
    nav.init();
    
    var event = createKeyEvent('Enter');
    nav.handleKeyDown(event);
    
    assert(selectedElement === elements[0], 'Should pass correct element');
    assert(selectedIndex === 0, 'Should pass correct index');
    assert(event.defaultPrevented, 'Event should be prevented');
    nav.destroy();
  });

  // Test: handleKeyDown calls onSoftLeft for SoftLeft key
  test('handleKeyDown calls onSoftLeft for SoftLeft key', function() {
    var softLeftCalled = false;
    var nav = new NavigationManager({
      onSoftLeft: function() {
        softLeftCalled = true;
      }
    });
    nav.init();
    
    var event = createKeyEvent('SoftLeft');
    nav.handleKeyDown(event);
    
    assert(softLeftCalled, 'onSoftLeft should be called');
    assert(event.defaultPrevented, 'Event should be prevented');
    nav.destroy();
  });

  // Test: handleKeyDown calls onSoftRight for SoftRight key
  test('handleKeyDown calls onSoftRight for SoftRight key', function() {
    var softRightCalled = false;
    var nav = new NavigationManager({
      onSoftRight: function() {
        softRightCalled = true;
      }
    });
    nav.init();
    
    var event = createKeyEvent('SoftRight');
    nav.handleKeyDown(event);
    
    assert(softRightCalled, 'onSoftRight should be called');
    assert(event.defaultPrevented, 'Event should be prevented');
    nav.destroy();
  });

  // Test: handleKeyDown supports F1 as SoftLeft
  test('handleKeyDown supports F1 as SoftLeft', function() {
    var softLeftCalled = false;
    var nav = new NavigationManager({
      onSoftLeft: function() {
        softLeftCalled = true;
      }
    });
    nav.init();
    
    var event = createKeyEvent('F1');
    nav.handleKeyDown(event);
    
    assert(softLeftCalled, 'onSoftLeft should be called for F1');
    nav.destroy();
  });

  // Test: handleKeyDown supports F2 as SoftRight
  test('handleKeyDown supports F2 as SoftRight', function() {
    var softRightCalled = false;
    var nav = new NavigationManager({
      onSoftRight: function() {
        softRightCalled = true;
      }
    });
    nav.init();
    
    var event = createKeyEvent('F2');
    nav.handleKeyDown(event);
    
    assert(softRightCalled, 'onSoftRight should be called for F2');
    nav.destroy();
  });

  // Test: getFocusedElement returns current element
  test('getFocusedElement returns current element', function() {
    var nav = new NavigationManager();
    var elements = [createMockElement('el1'), createMockElement('el2')];
    nav.updateFocusableElements(elements);
    
    var focused = nav.getFocusedElement();
    
    assert(focused === elements[0], 'Should return first element');
  });

  // Test: getFocusedIndex returns current index
  test('getFocusedIndex returns current index', function() {
    var nav = new NavigationManager();
    var elements = [createMockElement('el1'), createMockElement('el2')];
    nav.updateFocusableElements(elements);
    
    var index = nav.getFocusedIndex();
    
    assert(index === 0, 'Should return 0');
  });

  // Test: setFocusIndex changes focus
  test('setFocusIndex changes focus', function() {
    var nav = new NavigationManager();
    var elements = [createMockElement('el1'), createMockElement('el2'), createMockElement('el3')];
    nav.updateFocusableElements(elements);
    
    nav.setFocusIndex(2);
    
    assert(nav.currentIndex === 2, 'Should be at index 2');
    assert(!elements[0].classList.contains('focused'), 'First element should not have focus');
    assert(elements[2].classList.contains('focused'), 'Third element should have focus');
  });

  // Test: setFocusIndex ignores invalid index
  test('setFocusIndex ignores invalid index', function() {
    var nav = new NavigationManager();
    var elements = [createMockElement('el1'), createMockElement('el2')];
    nav.updateFocusableElements(elements);
    
    nav.setFocusIndex(5);
    
    assert(nav.currentIndex === 0, 'Should stay at index 0');
  });

  // Test: updateSoftkeys updates callbacks
  test('updateSoftkeys updates callbacks', function() {
    var leftCalled = false;
    var rightCalled = false;
    var nav = new NavigationManager();
    
    nav.updateSoftkeys({
      onSoftLeft: function() { leftCalled = true; },
      onSoftRight: function() { rightCalled = true; }
    });
    
    nav.handleSoftLeft();
    nav.handleSoftRight();
    
    assert(leftCalled, 'New onSoftLeft should be called');
    assert(rightCalled, 'New onSoftRight should be called');
  });

  // Test: Does not handle keys when not active
  test('Does not handle keys when not active', function() {
    var selectCalled = false;
    var nav = new NavigationManager({
      onSelect: function() { selectCalled = true; }
    });
    var elements = [createMockElement('el1')];
    nav.updateFocusableElements(elements);
    
    var event = createKeyEvent('Enter');
    nav.handleKeyDown(event);
    
    assert(!selectCalled, 'onSelect should not be called when not active');
    assert(!event.defaultPrevented, 'Event should not be prevented');
  });

  // Test: Custom focus class is applied
  test('Custom focus class is applied', function() {
    var nav = new NavigationManager({ focusClass: 'my-focus' });
    var elements = [createMockElement('el1')];
    nav.updateFocusableElements(elements);
    
    assert(elements[0].classList.contains('my-focus'), 'Custom focus class should be applied');
    assert(!elements[0].classList.contains('focused'), 'Default focus class should not be applied');
  });

  // Summary
  console.log('\n=== Test Summary ===');
  console.log('Passed: ' + results.passed);
  console.log('Failed: ' + results.failed);
  console.log('Total: ' + (results.passed + results.failed));
  
  return results;
}

// Run tests if in Node environment
if (typeof module !== 'undefined' && module.exports) {
  if (require.main === module) {
    runTests();
  }
  module.exports = { runTests: runTests };
}
