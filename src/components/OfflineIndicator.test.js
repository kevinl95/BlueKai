/**
 * Tests for OfflineIndicator Component
 */

var h = require('preact').h;
var render = require('preact').render;
var OfflineIndicator = require('./OfflineIndicator');

function testOfflineIndicator() {
  console.log('Testing OfflineIndicator Component...');
  
  var tests = {
    passed: 0,
    failed: 0
  };

  function assert(condition, message) {
    if (condition) {
      tests.passed++;
      console.log('✓ ' + message);
    } else {
      tests.failed++;
      console.error('✗ ' + message);
    }
  }

  // Create test container
  var container = document.createElement('div');
  document.body.appendChild(container);

  // Test 1: Should not render when online
  render(
    h(OfflineIndicator, { isOnline: true }),
    container
  );

  assert(
    container.querySelector('.offline-indicator') === null,
    'does not render when online'
  );

  // Test 2: Should render when offline
  render(
    h(OfflineIndicator, { isOnline: false }),
    container
  );

  var indicator = container.querySelector('.offline-indicator');
  assert(
    indicator !== null,
    'renders when offline'
  );

  assert(
    indicator.textContent.indexOf('Offline') !== -1,
    'displays offline text'
  );

  assert(
    container.querySelector('.offline-indicator__icon') !== null,
    'displays warning icon'
  );

  // Cleanup
  document.body.removeChild(container);

  console.log('\nOfflineIndicator Tests: ' + tests.passed + ' passed, ' + tests.failed + ' failed');
  return tests.failed === 0;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = testOfflineIndicator;
}

if (typeof window !== 'undefined') {
  window.testOfflineIndicator = testOfflineIndicator;
}
