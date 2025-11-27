/**
 * Settings Utilities Tests
 * Tests for settings management functions
 * Compatible with Gecko 48 (ES5 transpiled)
 */

var settingsUtils = require('./settings');

/**
 * Test suite for settings utilities
 */
function runSettingsTests() {
  var results = {
    passed: 0,
    failed: 0,
    tests: []
  };
  
  function assert(condition, message) {
    if (condition) {
      results.passed++;
      results.tests.push({ name: message, passed: true });
    } else {
      results.failed++;
      results.tests.push({ name: message, passed: false });
      console.error('FAILED:', message);
    }
  }
  
  console.log('Running Settings Utilities Tests...');
  
  // Test: getSettings returns default settings when no state provided
  var defaultSettings = settingsUtils.getSettings();
  assert(
    defaultSettings.dataSaverMode === false &&
    defaultSettings.autoLoadImages === true &&
    defaultSettings.language === 'en',
    'getSettings returns default settings when no state provided'
  );
  
  // Test: getSettings returns settings from state
  var mockState = {
    settings: {
      dataSaverMode: true,
      autoLoadImages: false,
      language: 'es'
    }
  };
  var stateSettings = settingsUtils.getSettings(mockState);
  assert(
    stateSettings.dataSaverMode === true &&
    stateSettings.autoLoadImages === false &&
    stateSettings.language === 'es',
    'getSettings returns settings from state'
  );
  
  // Test: isDataSaverEnabled returns correct value
  assert(
    settingsUtils.isDataSaverEnabled({ dataSaverMode: true }) === true,
    'isDataSaverEnabled returns true when enabled'
  );
  
  assert(
    settingsUtils.isDataSaverEnabled({ dataSaverMode: false }) === false,
    'isDataSaverEnabled returns false when disabled'
  );
  
  // Test: shouldAutoLoadImages returns correct value
  assert(
    settingsUtils.shouldAutoLoadImages({ autoLoadImages: true, dataSaverMode: false }) === true,
    'shouldAutoLoadImages returns true when enabled and data saver off'
  );
  
  assert(
    settingsUtils.shouldAutoLoadImages({ autoLoadImages: true, dataSaverMode: true }) === false,
    'shouldAutoLoadImages returns false when data saver is on'
  );
  
  assert(
    settingsUtils.shouldAutoLoadImages({ autoLoadImages: false, dataSaverMode: false }) === false,
    'shouldAutoLoadImages returns false when disabled'
  );
  
  // Test: getLanguage returns correct language
  assert(
    settingsUtils.getLanguage({ language: 'fr' }) === 'fr',
    'getLanguage returns correct language from settings'
  );
  
  assert(
    settingsUtils.getLanguage({}) === 'en',
    'getLanguage returns default language when not set'
  );
  
  // Test: createSettingsUpdate creates update object
  var update = settingsUtils.createSettingsUpdate({ dataSaverMode: true });
  assert(
    update.dataSaverMode === true,
    'createSettingsUpdate creates update object'
  );
  
  // Test: toggleDataSaverMode toggles correctly
  var currentSettings = { dataSaverMode: false, autoLoadImages: true };
  var toggled = settingsUtils.toggleDataSaverMode(currentSettings);
  assert(
    toggled.dataSaverMode === true && toggled.autoLoadImages === false,
    'toggleDataSaverMode enables data saver and disables auto load images'
  );
  
  var toggledBack = settingsUtils.toggleDataSaverMode(toggled);
  assert(
    toggledBack.dataSaverMode === false && toggledBack.autoLoadImages === true,
    'toggleDataSaverMode disables data saver and enables auto load images'
  );
  
  // Test: toggleDataSaverMode doesn't mutate original
  var original = { dataSaverMode: false, autoLoadImages: true, language: 'en' };
  var modified = settingsUtils.toggleDataSaverMode(original);
  assert(
    original.dataSaverMode === false && original.autoLoadImages === true,
    'toggleDataSaverMode does not mutate original settings'
  );
  
  assert(
    modified.language === 'en',
    'toggleDataSaverMode preserves other settings'
  );
  
  // Print results
  console.log('\n=== Settings Utilities Test Results ===');
  console.log('Passed:', results.passed);
  console.log('Failed:', results.failed);
  console.log('Total:', results.passed + results.failed);
  
  results.tests.forEach(function(test) {
    console.log(test.passed ? '✓' : '✗', test.name);
  });
  
  return results;
}

// Export test runner
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runSettingsTests: runSettingsTests
  };
}

// Run tests if executed directly
if (typeof window !== 'undefined') {
  window.runSettingsTests = runSettingsTests;
}
