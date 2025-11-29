#!/usr/bin/env node

/**
 * Node.js test script for polyfills
 * Run with: node test-polyfills.js
 */

// Clear native implementations to test polyfills
var nativePromise = global.Promise;
var nativeObjectAssign = Object.assign;
var nativeArrayFind = Array.prototype.find;
var nativeArrayFindIndex = Array.prototype.findIndex;
var nativeArrayIncludes = Array.prototype.includes;
var nativeArrayFrom = Array.from;
var nativeStringStartsWith = String.prototype.startsWith;
var nativeStringEndsWith = String.prototype.endsWith;
var nativeStringIncludes = String.prototype.includes;

// Remove native implementations
delete global.Promise;
delete Object.assign;
delete Array.prototype.find;
delete Array.prototype.findIndex;
delete Array.prototype.includes;
delete Array.from;
delete String.prototype.startsWith;
delete String.prototype.endsWith;
delete String.prototype.includes;

// Load polyfills
require('./src/utils/polyfills.js');

var passed = 0;
var failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log('✓', name);
    passed++;
  } catch (e) {
    console.error('✗', name);
    console.error('  Error:', e.message);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

console.log('Testing polyfills...\n');

// Promise tests
test('Promise exists', function() {
  assert(typeof Promise !== 'undefined', 'Promise should exist');
});

test('Promise.resolve', function(done) {
  var resolved = false;
  Promise.resolve(42).then(function(value) {
    assert(value === 42, 'Should resolve with correct value');
    resolved = true;
  });
  // Give it a tick to resolve
  setTimeout(function() {
    assert(resolved, 'Promise should have resolved');
  }, 10);
});

test('Promise.reject', function() {
  var rejected = false;
  Promise.reject('error').catch(function(reason) {
    assert(reason === 'error', 'Should reject with correct reason');
    rejected = true;
  });
});

test('Promise.all', function() {
  var completed = false;
  Promise.all([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)])
    .then(function(values) {
      assert(values.length === 3, 'Should have 3 values');
      assert(values[0] === 1 && values[1] === 2 && values[2] === 3, 'Values should match');
      completed = true;
    });
});

// Object.assign tests
test('Object.assign exists', function() {
  assert(typeof Object.assign === 'function', 'Object.assign should exist');
});

test('Object.assign - basic', function() {
  var result = Object.assign({}, { a: 1 }, { b: 2 });
  assert(result.a === 1 && result.b === 2, 'Should merge objects');
});

test('Object.assign - overwrite', function() {
  var result = Object.assign({}, { a: 1 }, { a: 2 });
  assert(result.a === 2, 'Should overwrite properties');
});

// Array.prototype.find tests
test('Array.prototype.find exists', function() {
  assert(typeof Array.prototype.find === 'function', 'find should exist');
});

test('Array.prototype.find - found', function() {
  var arr = [1, 2, 3, 4, 5];
  var result = arr.find(function(x) { return x > 3; });
  assert(result === 4, 'Should find correct element');
});

test('Array.prototype.find - not found', function() {
  var arr = [1, 2, 3];
  var result = arr.find(function(x) { return x > 10; });
  assert(result === undefined, 'Should return undefined when not found');
});

// Array.prototype.findIndex tests
test('Array.prototype.findIndex exists', function() {
  assert(typeof Array.prototype.findIndex === 'function', 'findIndex should exist');
});

test('Array.prototype.findIndex - found', function() {
  var arr = [1, 2, 3, 4, 5];
  var result = arr.findIndex(function(x) { return x > 3; });
  assert(result === 3, 'Should find correct index');
});

test('Array.prototype.findIndex - not found', function() {
  var arr = [1, 2, 3];
  var result = arr.findIndex(function(x) { return x > 10; });
  assert(result === -1, 'Should return -1 when not found');
});

// Array.prototype.includes tests
test('Array.prototype.includes exists', function() {
  assert(typeof Array.prototype.includes === 'function', 'includes should exist');
});

test('Array.prototype.includes - found', function() {
  var arr = [1, 2, 3];
  assert(arr.includes(2), 'Should find element');
});

test('Array.prototype.includes - not found', function() {
  var arr = [1, 2, 3];
  assert(!arr.includes(4), 'Should not find element');
});

// Array.from tests
test('Array.from exists', function() {
  assert(typeof Array.from === 'function', 'Array.from should exist');
});

test('Array.from - array-like', function() {
  var arrayLike = { 0: 'a', 1: 'b', 2: 'c', length: 3 };
  var result = Array.from(arrayLike);
  assert(result.length === 3, 'Should have correct length');
  assert(result[0] === 'a' && result[1] === 'b' && result[2] === 'c', 'Should have correct values');
});

// String.prototype.startsWith tests
test('String.prototype.startsWith exists', function() {
  assert(typeof String.prototype.startsWith === 'function', 'startsWith should exist');
});

test('String.prototype.startsWith - true', function() {
  assert('hello world'.startsWith('hello'), 'Should start with hello');
});

test('String.prototype.startsWith - false', function() {
  assert(!'hello world'.startsWith('world'), 'Should not start with world');
});

// String.prototype.endsWith tests
test('String.prototype.endsWith exists', function() {
  assert(typeof String.prototype.endsWith === 'function', 'endsWith should exist');
});

test('String.prototype.endsWith - true', function() {
  assert('hello world'.endsWith('world'), 'Should end with world');
});

test('String.prototype.endsWith - false', function() {
  assert(!'hello world'.endsWith('hello'), 'Should not end with hello');
});

// String.prototype.includes tests
test('String.prototype.includes exists', function() {
  assert(typeof String.prototype.includes === 'function', 'includes should exist');
});

test('String.prototype.includes - found', function() {
  assert('hello world'.includes('lo wo'), 'Should include substring');
});

test('String.prototype.includes - not found', function() {
  assert(!'hello world'.includes('xyz'), 'Should not include substring');
});

// Summary
setTimeout(function() {
  console.log('\n' + passed + '/' + (passed + failed) + ' tests passed');
  if (failed > 0) {
    console.error(failed + ' tests failed');
    process.exit(1);
  } else {
    console.log('All tests passed!');
    process.exit(0);
  }
}, 100);
