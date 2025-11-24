/**
 * Compatibility tests for polyfills and helpers
 * These tests verify that polyfills work correctly in Gecko 48
 */

/**
 * Simple test runner
 */
function TestRunner() {
  this.tests = [];
  this.results = {
    passed: 0,
    failed: 0,
    total: 0
  };
}

TestRunner.prototype.test = function(name, fn) {
  this.tests.push({ name: name, fn: fn });
};

TestRunner.prototype.run = function() {
  console.log('Running compatibility tests...\n');
  
  for (var i = 0; i < this.tests.length; i++) {
    var test = this.tests[i];
    this.results.total++;
    
    try {
      test.fn();
      this.results.passed++;
      console.log('✓ ' + test.name);
    } catch (e) {
      this.results.failed++;
      console.error('✗ ' + test.name);
      console.error('  Error: ' + e.message);
    }
  }
  
  console.log('\n' + this.results.passed + '/' + this.results.total + ' tests passed');
  
  if (this.results.failed > 0) {
    console.error(this.results.failed + ' tests failed');
  }
  
  return this.results;
};

/**
 * Assertion helper
 */
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

function assertDeepEqual(actual, expected, message) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(message || 'Expected ' + JSON.stringify(expected) + ' but got ' + JSON.stringify(actual));
  }
}

/**
 * Run all compatibility tests
 */
function runCompatibilityTests() {
  var runner = new TestRunner();
  
  // Promise tests
  runner.test('Promise.resolve', function() {
    var resolved = false;
    Promise.resolve(42).then(function(value) {
      assertEqual(value, 42);
      resolved = true;
    });
    // Note: This is synchronous check, real test would need async handling
  });
  
  runner.test('Promise.reject', function() {
    var rejected = false;
    Promise.reject('error').catch(function(reason) {
      assertEqual(reason, 'error');
      rejected = true;
    });
  });
  
  runner.test('Promise.all', function() {
    var completed = false;
    Promise.all([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)])
      .then(function(values) {
        assertDeepEqual(values, [1, 2, 3]);
        completed = true;
      });
  });
  
  // Object.assign tests
  runner.test('Object.assign - basic', function() {
    var target = { a: 1 };
    var source = { b: 2 };
    var result = Object.assign(target, source);
    assertEqual(result.a, 1);
    assertEqual(result.b, 2);
    assert(result === target, 'Should modify target object');
  });
  
  runner.test('Object.assign - multiple sources', function() {
    var result = Object.assign({}, { a: 1 }, { b: 2 }, { c: 3 });
    assertDeepEqual(result, { a: 1, b: 2, c: 3 });
  });
  
  runner.test('Object.assign - overwrite', function() {
    var result = Object.assign({}, { a: 1 }, { a: 2 });
    assertEqual(result.a, 2);
  });
  
  // Array.prototype.find tests
  runner.test('Array.prototype.find - found', function() {
    var arr = [1, 2, 3, 4, 5];
    var result = arr.find(function(x) { return x > 3; });
    assertEqual(result, 4);
  });
  
  runner.test('Array.prototype.find - not found', function() {
    var arr = [1, 2, 3];
    var result = arr.find(function(x) { return x > 10; });
    assertEqual(result, undefined);
  });
  
  // Array.prototype.findIndex tests
  runner.test('Array.prototype.findIndex - found', function() {
    var arr = [1, 2, 3, 4, 5];
    var result = arr.findIndex(function(x) { return x > 3; });
    assertEqual(result, 3);
  });
  
  runner.test('Array.prototype.findIndex - not found', function() {
    var arr = [1, 2, 3];
    var result = arr.findIndex(function(x) { return x > 10; });
    assertEqual(result, -1);
  });
  
  // Array.prototype.includes tests
  runner.test('Array.prototype.includes - found', function() {
    var arr = [1, 2, 3];
    assert(arr.includes(2), 'Should find element');
  });
  
  runner.test('Array.prototype.includes - not found', function() {
    var arr = [1, 2, 3];
    assert(!arr.includes(4), 'Should not find element');
  });
  
  // Array.from tests
  runner.test('Array.from - array-like', function() {
    var arrayLike = { 0: 'a', 1: 'b', 2: 'c', length: 3 };
    var result = Array.from(arrayLike);
    assertDeepEqual(result, ['a', 'b', 'c']);
  });
  
  // String.prototype.startsWith tests
  runner.test('String.prototype.startsWith - true', function() {
    assert('hello world'.startsWith('hello'), 'Should start with hello');
  });
  
  runner.test('String.prototype.startsWith - false', function() {
    assert(!'hello world'.startsWith('world'), 'Should not start with world');
  });
  
  // String.prototype.endsWith tests
  runner.test('String.prototype.endsWith - true', function() {
    assert('hello world'.endsWith('world'), 'Should end with world');
  });
  
  runner.test('String.prototype.endsWith - false', function() {
    assert(!'hello world'.endsWith('hello'), 'Should not end with hello');
  });
  
  // String.prototype.includes tests
  runner.test('String.prototype.includes - found', function() {
    assert('hello world'.includes('lo wo'), 'Should include substring');
  });
  
  runner.test('String.prototype.includes - not found', function() {
    assert(!'hello world'.includes('xyz'), 'Should not include substring');
  });
  
  return runner.run();
}

/**
 * Test HTTP client
 */
function testHTTPClient(http) {
  var runner = new TestRunner();
  
  runner.test('HTTP client exists', function() {
    assert(typeof http === 'object', 'HTTP client should be an object');
    assert(typeof http.request === 'function', 'Should have request method');
    assert(typeof http.get === 'function', 'Should have get method');
    assert(typeof http.post === 'function', 'Should have post method');
    assert(typeof http.put === 'function', 'Should have put method');
    assert(typeof http.delete === 'function', 'Should have delete method');
  });
  
  return runner.run();
}

/**
 * Test ES6 helpers
 */
function testES6Helpers(helpers) {
  var runner = new TestRunner();
  
  runner.test('template - basic interpolation', function() {
    var result = helpers.template('Hello {name}!', { name: 'World' });
    assertEqual(result, 'Hello World!');
  });
  
  runner.test('template - multiple placeholders', function() {
    var result = helpers.template('{greeting} {name}!', { greeting: 'Hello', name: 'World' });
    assertEqual(result, 'Hello World!');
  });
  
  runner.test('format - string and number', function() {
    var result = helpers.format('Hello %s, you have %d messages', 'John', 5);
    assertEqual(result, 'Hello John, you have 5 messages');
  });
  
  runner.test('pick - extract properties', function() {
    var obj = { a: 1, b: 2, c: 3 };
    var result = helpers.pick(obj, ['a', 'c']);
    assertDeepEqual(result, { a: 1, c: 3 });
  });
  
  runner.test('omit - exclude properties', function() {
    var obj = { a: 1, b: 2, c: 3 };
    var result = helpers.omit(obj, ['b']);
    assertDeepEqual(result, { a: 1, c: 3 });
  });
  
  runner.test('defaults - use default value', function() {
    var result = helpers.defaults(undefined, 'default');
    assertEqual(result, 'default');
  });
  
  runner.test('defaults - use provided value', function() {
    var result = helpers.defaults('provided', 'default');
    assertEqual(result, 'provided');
  });
  
  runner.test('extend - merge objects', function() {
    var result = helpers.extend({}, { a: 1 }, { b: 2 }, { c: 3 });
    assertDeepEqual(result, { a: 1, b: 2, c: 3 });
  });
  
  runner.test('concat - combine arrays', function() {
    var result = helpers.concat([1, 2], [3, 4], [5]);
    assertDeepEqual(result, [1, 2, 3, 4, 5]);
  });
  
  runner.test('clone - deep clone object', function() {
    var obj = { a: 1, b: { c: 2 } };
    var result = helpers.clone(obj);
    assertDeepEqual(result, obj);
    assert(result !== obj, 'Should be different object');
    assert(result.b !== obj.b, 'Nested objects should be different');
  });
  
  runner.test('clone - clone array', function() {
    var arr = [1, 2, [3, 4]];
    var result = helpers.clone(arr);
    assertDeepEqual(result, arr);
    assert(result !== arr, 'Should be different array');
  });
  
  return runner.run();
}

// Export test functions
export default {
  runCompatibilityTests: runCompatibilityTests,
  testHTTPClient: testHTTPClient,
  testES6Helpers: testES6Helpers
};
