#!/usr/bin/env node

/**
 * Simple polyfill verification script
 */

console.log('Checking polyfill implementations...\n');

var tests = {
  passed: 0,
  failed: 0
};

function check(name, condition) {
  if (condition) {
    console.log('✓', name);
    tests.passed++;
  } else {
    console.error('✗', name);
    tests.failed++;
  }
}

// Check if polyfills would be needed
console.log('Native support check:');
check('Promise', typeof Promise !== 'undefined');
check('Object.assign', typeof Object.assign === 'function');
check('Array.prototype.find', typeof Array.prototype.find === 'function');
check('Array.prototype.findIndex', typeof Array.prototype.findIndex === 'function');
check('Array.prototype.includes', typeof Array.prototype.includes === 'function');
check('Array.from', typeof Array.from === 'function');
check('String.prototype.startsWith', typeof String.prototype.startsWith === 'function');
check('String.prototype.endsWith', typeof String.prototype.endsWith === 'function');
check('String.prototype.includes', typeof String.prototype.includes === 'function');

console.log('\nFunctional tests:');

// Test Promise
try {
  Promise.resolve(42).then(function(val) {
    check('Promise.resolve works', val === 42);
  });
  tests.passed++;
} catch (e) {
  console.error('✗ Promise.resolve failed:', e.message);
  tests.failed++;
}

// Test Object.assign
try {
  var obj = Object.assign({}, { a: 1 }, { b: 2 });
  check('Object.assign works', obj.a === 1 && obj.b === 2);
} catch (e) {
  console.error('✗ Object.assign failed:', e.message);
  tests.failed++;
}

// Test Array.find
try {
  var arr = [1, 2, 3, 4, 5];
  var found = arr.find(function(x) { return x > 3; });
  check('Array.find works', found === 4);
} catch (e) {
  console.error('✗ Array.find failed:', e.message);
  tests.failed++;
}

// Test Array.findIndex
try {
  var arr = [1, 2, 3, 4, 5];
  var idx = arr.findIndex(function(x) { return x > 3; });
  check('Array.findIndex works', idx === 3);
} catch (e) {
  console.error('✗ Array.findIndex failed:', e.message);
  tests.failed++;
}

// Test Array.includes
try {
  var arr = [1, 2, 3];
  check('Array.includes works', arr.includes(2) && !arr.includes(4));
} catch (e) {
  console.error('✗ Array.includes failed:', e.message);
  tests.failed++;
}

// Test Array.from
try {
  var arrayLike = { 0: 'a', 1: 'b', length: 2 };
  var arr = Array.from(arrayLike);
  check('Array.from works', arr.length === 2 && arr[0] === 'a');
} catch (e) {
  console.error('✗ Array.from failed:', e.message);
  tests.failed++;
}

// Test String.startsWith
try {
  check('String.startsWith works', 'hello'.startsWith('hel') && !'hello'.startsWith('lo'));
} catch (e) {
  console.error('✗ String.startsWith failed:', e.message);
  tests.failed++;
}

// Test String.endsWith
try {
  check('String.endsWith works', 'hello'.endsWith('lo') && !'hello'.endsWith('he'));
} catch (e) {
  console.error('✗ String.endsWith failed:', e.message);
  tests.failed++;
}

// Test String.includes
try {
  check('String.includes works', 'hello'.includes('ell') && !'hello'.includes('xyz'));
} catch (e) {
  console.error('✗ String.includes failed:', e.message);
  tests.failed++;
}

setTimeout(function() {
  console.log('\n' + tests.passed + ' checks passed');
  if (tests.failed > 0) {
    console.error(tests.failed + ' checks failed');
  }
  console.log('\nNote: Modern Node.js has native support for these features.');
  console.log('Polyfills will be used in Gecko 48 where these are missing.');
}, 100);
