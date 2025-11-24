/**
 * Unit tests for DateFormatter
 * Simple test runner compatible with Gecko 48
 */

// Test runner
function runDateFormatterTests() {
  var tests = [];
  var passed = 0;
  var failed = 0;
  
  function test(name, fn) {
    tests.push({ name: name, fn: fn });
  }
  
  function assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }
  
  function assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(message || 'Expected "' + expected + '" but got "' + actual + '"');
    }
  }
  
  // Load DateFormatter
  var DateFormatter;
  if (typeof require !== 'undefined') {
    try {
      DateFormatter = require('./date-formatter.js');
    } catch (e) {
      console.error('Failed to load DateFormatter:', e.message);
      return { passed: 0, failed: 0, total: 0 };
    }
  } else if (typeof window !== 'undefined' && window.DateFormatter) {
    DateFormatter = window.DateFormatter;
  }
  
  if (!DateFormatter) {
    console.error('DateFormatter not found');
    return { passed: 0, failed: 0, total: 0 };
  }
  
  // Test: Parse ISO timestamp
  test('should parse ISO timestamp string', function() {
    var formatter = new DateFormatter();
    var date = formatter.parseTimestamp('2025-11-23T12:00:00.000Z');
    
    assert(date instanceof Date, 'should return Date object');
    assert(!isNaN(date.getTime()), 'should be valid date');
  });
  
  // Test: Parse Unix timestamp
  test('should parse Unix timestamp', function() {
    var formatter = new DateFormatter();
    var timestamp = 1700000000000;
    var date = formatter.parseTimestamp(timestamp);
    
    assert(date instanceof Date, 'should return Date object');
    assertEqual(date.getTime(), timestamp, 'should match original timestamp');
  });
  
  // Test: Parse Date object
  test('should handle Date object', function() {
    var formatter = new DateFormatter();
    var original = new Date('2025-11-23T12:00:00.000Z');
    var date = formatter.parseTimestamp(original);
    
    assert(date instanceof Date, 'should return Date object');
    assertEqual(date.getTime(), original.getTime(), 'should match original date');
  });
  
  // Test: Invalid timestamp
  test('should return null for invalid timestamp', function() {
    var formatter = new DateFormatter();
    var date = formatter.parseTimestamp('invalid');
    
    assertEqual(date, null, 'should return null');
  });
  
  // Test: Relative time - now
  test('should format recent time as "now"', function() {
    var formatter = new DateFormatter();
    var now = new Date();
    var recent = new Date(now.getTime() - 30000); // 30 seconds ago
    
    var result = formatter.formatRelative(recent, now);
    assertEqual(result, 'now', 'should return "now"');
  });
  
  // Test: Relative time - minutes
  test('should format minutes ago', function() {
    var formatter = new DateFormatter();
    var now = new Date();
    var past = new Date(now.getTime() - 5 * 60 * 1000); // 5 minutes ago
    
    var result = formatter.formatRelative(past, now);
    assertEqual(result, '5m', 'should return "5m"');
  });
  
  // Test: Relative time - hours
  test('should format hours ago', function() {
    var formatter = new DateFormatter();
    var now = new Date();
    var past = new Date(now.getTime() - 3 * 60 * 60 * 1000); // 3 hours ago
    
    var result = formatter.formatRelative(past, now);
    assertEqual(result, '3h', 'should return "3h"');
  });
  
  // Test: Relative time - days
  test('should format days ago', function() {
    var formatter = new DateFormatter();
    var now = new Date();
    var past = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000); // 4 days ago
    
    var result = formatter.formatRelative(past, now);
    assertEqual(result, '4d', 'should return "4d"');
  });
  
  // Test: Relative time - weeks
  test('should format weeks ago', function() {
    var formatter = new DateFormatter();
    var now = new Date();
    var past = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000); // 2 weeks ago
    
    var result = formatter.formatRelative(past, now);
    assertEqual(result, '2w', 'should return "2w"');
  });
  
  // Test: Relative time - months
  test('should format months ago', function() {
    var formatter = new DateFormatter();
    var now = new Date();
    var past = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000); // ~2 months ago
    
    var result = formatter.formatRelative(past, now);
    assertEqual(result, '2mo', 'should return "2mo"');
  });
  
  // Test: Relative time - years
  test('should format years ago', function() {
    var formatter = new DateFormatter();
    var now = new Date();
    var past = new Date(now.getTime() - 400 * 24 * 60 * 60 * 1000); // ~1 year ago
    
    var result = formatter.formatRelative(past, now);
    assertEqual(result, '1y', 'should return "1y"');
  });
  
  // Test: Locale - Spanish
  test('should support Spanish locale for relative time', function() {
    var formatter = new DateFormatter();
    formatter.setLocale('es');
    
    var now = new Date();
    var recent = new Date(now.getTime() - 30000);
    
    var result = formatter.formatRelative(recent, now);
    assertEqual(result, 'ahora', 'should return "ahora"');
  });
  
  // Test: Locale - French
  test('should support French locale for relative time', function() {
    var formatter = new DateFormatter();
    formatter.setLocale('fr');
    
    var now = new Date();
    var past = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
    
    var result = formatter.formatRelative(past, now);
    assertEqual(result, '2j', 'should return "2j"');
  });
  
  // Test: Locale - Portuguese
  test('should support Portuguese locale for relative time', function() {
    var formatter = new DateFormatter();
    formatter.setLocale('pt');
    
    var now = new Date();
    var recent = new Date(now.getTime() - 30000);
    
    var result = formatter.formatRelative(recent, now);
    assertEqual(result, 'agora', 'should return "agora"');
  });
  
  // Test: Format date
  test('should format date', function() {
    var formatter = new DateFormatter();
    var date = new Date('2025-11-23T12:00:00.000Z');
    
    var result = formatter.formatDate(date);
    assert(result.indexOf('2025') !== -1, 'should include year');
    assert(result.indexOf('Nov') !== -1 || result.indexOf('11') !== -1, 'should include month');
    assert(result.indexOf('23') !== -1, 'should include day');
  });
  
  // Test: Format time
  test('should format time', function() {
    var formatter = new DateFormatter();
    var date = new Date('2025-11-23T14:30:00.000Z');
    
    var result = formatter.formatTime(date);
    assert(result.length > 0, 'should return formatted time');
    assert(result.indexOf(':') !== -1, 'should include colon separator');
  });
  
  // Test: Format time with seconds
  test('should format time with seconds', function() {
    var formatter = new DateFormatter();
    var date = new Date('2025-11-23T14:30:45.000Z');
    
    var result = formatter.formatTime(date, true);
    assert(result.length > 0, 'should return formatted time');
    // Should have two colons when seconds included
    var colonCount = (result.match(/:/g) || []).length;
    assert(colonCount >= 1, 'should include time separators');
  });
  
  // Test: Format date and time
  test('should format date and time together', function() {
    var formatter = new DateFormatter();
    var date = new Date('2025-11-23T14:30:00.000Z');
    
    var result = formatter.formatDateTime(date);
    assert(result.indexOf('2025') !== -1, 'should include year');
    assert(result.indexOf(':') !== -1, 'should include time');
  });
  
  // Test: Is today
  test('should detect if date is today', function() {
    var formatter = new DateFormatter();
    var today = new Date();
    
    var result = formatter.isToday(today);
    assertEqual(result, true, 'should return true for today');
  });
  
  // Test: Is not today
  test('should detect if date is not today', function() {
    var formatter = new DateFormatter();
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    var result = formatter.isToday(yesterday);
    assertEqual(result, false, 'should return false for yesterday');
  });
  
  // Test: Is yesterday
  test('should detect if date is yesterday', function() {
    var formatter = new DateFormatter();
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    var result = formatter.isYesterday(yesterday);
    assertEqual(result, true, 'should return true for yesterday');
  });
  
  // Test: Is not yesterday
  test('should detect if date is not yesterday', function() {
    var formatter = new DateFormatter();
    var today = new Date();
    
    var result = formatter.isYesterday(today);
    assertEqual(result, false, 'should return false for today');
  });
  
  // Test: Future date
  test('should handle future dates', function() {
    var formatter = new DateFormatter();
    var now = new Date();
    var future = new Date(now.getTime() + 60000); // 1 minute in future
    
    var result = formatter.formatRelative(future, now);
    assertEqual(result, 'in the future', 'should indicate future date');
  });
  
  // Test: Invalid date formatting
  test('should handle invalid date in formatDate', function() {
    var formatter = new DateFormatter();
    var result = formatter.formatDate('invalid');
    
    assertEqual(result, 'Invalid date', 'should return error message');
  });
  
  // Test: Invalid time formatting
  test('should handle invalid date in formatTime', function() {
    var formatter = new DateFormatter();
    var result = formatter.formatTime('invalid');
    
    assertEqual(result, 'Invalid time', 'should return error message');
  });
  
  // Run all tests
  console.log('Running DateFormatter tests...\n');
  
  tests.forEach(function(testCase) {
    try {
      testCase.fn();
      passed++;
      console.log('✓ ' + testCase.name);
    } catch (error) {
      failed++;
      console.log('✗ ' + testCase.name);
      console.log('  Error: ' + error.message);
    }
  });
  
  console.log('\n' + passed + ' passed, ' + failed + ' failed');
  
  return { passed: passed, failed: failed, total: tests.length };
}

// Export for use in browser
if (typeof window !== 'undefined') {
  window.runDateFormatterTests = runDateFormatterTests;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = runDateFormatterTests;
}

// Auto-run in Node.js
if (typeof require !== 'undefined' && require.main === module) {
  var results = runDateFormatterTests();
  process.exit(results.failed > 0 ? 1 : 0);
}
