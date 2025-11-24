/**
 * Tests for SoftkeyBar component
 */

var h = require('preact').h;
var render = require('preact').render;
var SoftkeyBar = require('./SoftkeyBar');

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

  // Helper to render component and get container
  function renderComponent(component) {
    var container = document.createElement('div');
    render(component, container);
    return container;
  }

  console.log('\n=== SoftkeyBar Tests ===\n');

  // Test: Renders with empty props
  test('Renders with empty props', function() {
    var container = renderComponent(h(SoftkeyBar, {}));
    var softkeyBar = container.querySelector('.softkey-bar');
    
    assert(softkeyBar !== null, 'Should render softkey-bar element');
  });

  // Test: Renders three softkey sections
  test('Renders three softkey sections', function() {
    var container = renderComponent(h(SoftkeyBar, {}));
    var left = container.querySelector('.softkey-left');
    var center = container.querySelector('.softkey-center');
    var right = container.querySelector('.softkey-right');
    
    assert(left !== null, 'Should render left softkey');
    assert(center !== null, 'Should render center softkey');
    assert(right !== null, 'Should render right softkey');
  });

  // Test: Displays left softkey label
  test('Displays left softkey label', function() {
    var container = renderComponent(h(SoftkeyBar, {
      left: { label: 'Back', action: function() {} }
    }));
    var left = container.querySelector('.softkey-left');
    
    assert(left.textContent === 'Back', 'Should display "Back"');
  });

  // Test: Displays center softkey label
  test('Displays center softkey label', function() {
    var container = renderComponent(h(SoftkeyBar, {
      center: { label: 'Select', action: function() {} }
    }));
    var center = container.querySelector('.softkey-center');
    
    assert(center.textContent === 'Select', 'Should display "Select"');
  });

  // Test: Displays right softkey label
  test('Displays right softkey label', function() {
    var container = renderComponent(h(SoftkeyBar, {
      right: { label: 'Options', action: function() {} }
    }));
    var right = container.querySelector('.softkey-right');
    
    assert(right.textContent === 'Options', 'Should display "Options"');
  });

  // Test: Displays all three softkey labels
  test('Displays all three softkey labels', function() {
    var container = renderComponent(h(SoftkeyBar, {
      left: { label: 'Back', action: function() {} },
      center: { label: 'Select', action: function() {} },
      right: { label: 'Menu', action: function() {} }
    }));
    var left = container.querySelector('.softkey-left');
    var center = container.querySelector('.softkey-center');
    var right = container.querySelector('.softkey-right');
    
    assert(left.textContent === 'Back', 'Left should display "Back"');
    assert(center.textContent === 'Select', 'Center should display "Select"');
    assert(right.textContent === 'Menu', 'Right should display "Menu"');
  });

  // Test: Handles missing left softkey
  test('Handles missing left softkey', function() {
    var container = renderComponent(h(SoftkeyBar, {
      center: { label: 'Select', action: function() {} },
      right: { label: 'Menu', action: function() {} }
    }));
    var left = container.querySelector('.softkey-left');
    
    assert(left.textContent === '', 'Left should be empty');
  });

  // Test: Handles missing center softkey
  test('Handles missing center softkey', function() {
    var container = renderComponent(h(SoftkeyBar, {
      left: { label: 'Back', action: function() {} },
      right: { label: 'Menu', action: function() {} }
    }));
    var center = container.querySelector('.softkey-center');
    
    assert(center.textContent === '', 'Center should be empty');
  });

  // Test: Handles missing right softkey
  test('Handles missing right softkey', function() {
    var container = renderComponent(h(SoftkeyBar, {
      left: { label: 'Back', action: function() {} },
      center: { label: 'Select', action: function() {} }
    }));
    var right = container.querySelector('.softkey-right');
    
    assert(right.textContent === '', 'Right should be empty');
  });

  // Test: Updates when props change
  test('Updates when props change', function() {
    var container = document.createElement('div');
    
    // Initial render
    render(h(SoftkeyBar, {
      left: { label: 'Back', action: function() {} }
    }), container);
    
    var left = container.querySelector('.softkey-left');
    assert(left.textContent === 'Back', 'Should initially display "Back"');
    
    // Update render
    render(h(SoftkeyBar, {
      left: { label: 'Cancel', action: function() {} }
    }), container);
    
    left = container.querySelector('.softkey-left');
    assert(left.textContent === 'Cancel', 'Should update to "Cancel"');
  });

  // Test: Handles label-only configuration
  test('Handles label-only configuration', function() {
    var container = renderComponent(h(SoftkeyBar, {
      left: { label: 'Back' },
      center: { label: 'Select' },
      right: { label: 'Menu' }
    }));
    var left = container.querySelector('.softkey-left');
    var center = container.querySelector('.softkey-center');
    var right = container.querySelector('.softkey-right');
    
    assert(left.textContent === 'Back', 'Left should display "Back"');
    assert(center.textContent === 'Select', 'Center should display "Select"');
    assert(right.textContent === 'Menu', 'Right should display "Menu"');
  });

  // Test: Handles empty label
  test('Handles empty label', function() {
    var container = renderComponent(h(SoftkeyBar, {
      left: { label: '', action: function() {} }
    }));
    var left = container.querySelector('.softkey-left');
    
    assert(left.textContent === '', 'Should handle empty label');
  });

  // Test: Renders with long labels
  test('Renders with long labels', function() {
    var container = renderComponent(h(SoftkeyBar, {
      left: { label: 'Very Long Label That Should Truncate', action: function() {} },
      center: { label: 'Another Long Label', action: function() {} },
      right: { label: 'Yet Another Long Label', action: function() {} }
    }));
    var softkeyBar = container.querySelector('.softkey-bar');
    
    assert(softkeyBar !== null, 'Should render with long labels');
  });

  // Test: Component structure is correct
  test('Component structure is correct', function() {
    var container = renderComponent(h(SoftkeyBar, {
      left: { label: 'Back' },
      center: { label: 'Select' },
      right: { label: 'Menu' }
    }));
    
    var softkeyBar = container.querySelector('.softkey-bar');
    var children = softkeyBar.children;
    
    assert(children.length === 3, 'Should have 3 children');
    assert(children[0].className === 'softkey-left', 'First child should be softkey-left');
    assert(children[1].className === 'softkey-center', 'Second child should be softkey-center');
    assert(children[2].className === 'softkey-right', 'Third child should be softkey-right');
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
