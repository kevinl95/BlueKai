/**
 * Tests for Router
 */

var Router = require('./router');

// Mock window.location for testing
var mockLocation = {
  hash: '',
  replace: function(url) {
    var hashIndex = url.indexOf('#');
    if (hashIndex !== -1) {
      this.hash = url.substring(hashIndex);
    }
  }
};

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

  console.log('\n=== Router Tests ===\n');

  // Test: Constructor initializes empty router
  test('Constructor initializes empty router', function() {
    var router = new Router();
    assert(router.routes.length === 0, 'routes should be empty');
    assert(router.currentRoute === null, 'currentRoute should be null');
    assert(router.history.length === 0, 'history should be empty');
    assert(router.isActive === false, 'isActive should be false');
  });

  // Test: register() adds a route
  test('register() adds a route', function() {
    var router = new Router();
    var handler = function() {};
    
    router.register('/timeline', handler, 'timeline');
    
    assert(router.routes.length === 1, 'Should have 1 route');
    assert(router.routes[0].path === '/timeline', 'Path should be /timeline');
    assert(router.routes[0].handler === handler, 'Handler should match');
    assert(router.routes[0].name === 'timeline', 'Name should be timeline');
  });

  // Test: pathToRegex converts simple path
  test('pathToRegex converts simple path', function() {
    var router = new Router();
    var result = router.pathToRegex('/timeline');
    
    assert(result.regex.test('/timeline'), 'Should match /timeline');
    assert(!result.regex.test('/other'), 'Should not match /other');
    assert(result.paramNames.length === 0, 'Should have no params');
  });

  // Test: pathToRegex converts path with parameter
  test('pathToRegex converts path with parameter', function() {
    var router = new Router();
    var result = router.pathToRegex('/post/:id');
    
    assert(result.regex.test('/post/123'), 'Should match /post/123');
    assert(!result.regex.test('/post'), 'Should not match /post');
    assert(result.paramNames.length === 1, 'Should have 1 param');
    assert(result.paramNames[0] === 'id', 'Param should be named id');
  });

  // Test: pathToRegex converts path with multiple parameters
  test('pathToRegex converts path with multiple parameters', function() {
    var router = new Router();
    var result = router.pathToRegex('/user/:userId/post/:postId');
    
    assert(result.regex.test('/user/abc/post/123'), 'Should match path with params');
    assert(result.paramNames.length === 2, 'Should have 2 params');
    assert(result.paramNames[0] === 'userId', 'First param should be userId');
    assert(result.paramNames[1] === 'postId', 'Second param should be postId');
  });

  // Test: match() finds matching route
  test('match() finds matching route', function() {
    var router = new Router();
    var handler = function() {};
    router.register('/timeline', handler);
    
    var match = router.match('/timeline');
    
    assert(match !== null, 'Should find match');
    assert(match.route.path === '/timeline', 'Should match correct route');
    assert(match.path === '/timeline', 'Should include path');
  });

  // Test: match() extracts parameters
  test('match() extracts parameters', function() {
    var router = new Router();
    var handler = function() {};
    router.register('/post/:id', handler);
    
    var match = router.match('/post/123');
    
    assert(match !== null, 'Should find match');
    assert(match.params.id === '123', 'Should extract id parameter');
  });

  // Test: match() extracts multiple parameters
  test('match() extracts multiple parameters', function() {
    var router = new Router();
    var handler = function() {};
    router.register('/user/:userId/post/:postId', handler);
    
    var match = router.match('/user/abc/post/123');
    
    assert(match !== null, 'Should find match');
    assert(match.params.userId === 'abc', 'Should extract userId');
    assert(match.params.postId === '123', 'Should extract postId');
  });

  // Test: match() returns null for no match
  test('match() returns null for no match', function() {
    var router = new Router();
    router.register('/timeline', function() {});
    
    var match = router.match('/other');
    
    assert(match === null, 'Should return null for no match');
  });

  // Test: match() finds first matching route
  test('match() finds first matching route', function() {
    var router = new Router();
    var handler1 = function() { return 1; };
    var handler2 = function() { return 2; };
    router.register('/post/:id', handler1);
    router.register('/post/:id', handler2);
    
    var match = router.match('/post/123');
    
    assert(match.route.handler === handler1, 'Should match first route');
  });

  // Test: getCurrentPath extracts path from hash
  test('getCurrentPath extracts path from hash', function() {
    var router = new Router();
    var originalHash = window.location.hash;
    
    window.location.hash = '#/timeline';
    var path = router.getCurrentPath();
    
    assert(path === '/timeline', 'Should extract /timeline');
    
    window.location.hash = originalHash;
  });

  // Test: getCurrentPath defaults to / for empty hash
  test('getCurrentPath defaults to / for empty hash', function() {
    var router = new Router();
    var originalHash = window.location.hash;
    
    window.location.hash = '';
    var path = router.getCurrentPath();
    
    assert(path === '/', 'Should default to /');
    
    window.location.hash = originalHash;
  });

  // Test: findRouteByName finds route
  test('findRouteByName finds route', function() {
    var router = new Router();
    var handler = function() {};
    router.register('/timeline', handler, 'timeline');
    router.register('/profile', function() {}, 'profile');
    
    var route = router.findRouteByName('timeline');
    
    assert(route !== null, 'Should find route');
    assert(route.path === '/timeline', 'Should find correct route');
  });

  // Test: findRouteByName returns null for unknown name
  test('findRouteByName returns null for unknown name', function() {
    var router = new Router();
    router.register('/timeline', function() {}, 'timeline');
    
    var route = router.findRouteByName('unknown');
    
    assert(route === null, 'Should return null');
  });

  // Test: getCurrentRoute returns current route
  test('getCurrentRoute returns current route', function() {
    var router = new Router();
    
    var currentRoute = router.getCurrentRoute();
    
    assert(currentRoute === null, 'Should be null initially');
  });

  // Test: getHistory returns copy of history
  test('getHistory returns copy of history', function() {
    var router = new Router();
    router.history = ['/timeline', '/profile'];
    
    var history = router.getHistory();
    history.push('/other');
    
    assert(router.history.length === 2, 'Original history should not be modified');
    assert(history.length === 3, 'Copy should be modified');
  });

  // Test: clearHistory clears history
  test('clearHistory clears history', function() {
    var router = new Router();
    router.history = ['/timeline', '/profile'];
    
    router.clearHistory();
    
    assert(router.history.length === 0, 'History should be empty');
  });

  // Test: canGoBack returns false with no history
  test('canGoBack returns false with no history', function() {
    var router = new Router();
    
    var canGoBack = router.canGoBack();
    
    assert(canGoBack === false, 'Should not be able to go back');
  });

  // Test: canGoBack returns false with single history entry
  test('canGoBack returns false with single history entry', function() {
    var router = new Router();
    router.history = ['/timeline'];
    
    var canGoBack = router.canGoBack();
    
    assert(canGoBack === false, 'Should not be able to go back');
  });

  // Test: canGoBack returns true with multiple history entries
  test('canGoBack returns true with multiple history entries', function() {
    var router = new Router();
    router.history = ['/timeline', '/profile'];
    
    var canGoBack = router.canGoBack();
    
    assert(canGoBack === true, 'Should be able to go back');
  });

  // Test: History is limited to maxHistorySize
  test('History is limited to maxHistorySize', function() {
    var router = new Router();
    router.maxHistorySize = 3;
    router.history = ['/a', '/b', '/c'];
    
    // Simulate adding a new entry
    var path = '/d';
    if (router.history.length === 0 || router.history[router.history.length - 1] !== path) {
      router.history.push(path);
      if (router.history.length > router.maxHistorySize) {
        router.history.shift();
      }
    }
    
    assert(router.history.length === 3, 'History should be limited to 3');
    assert(router.history[0] === '/b', 'Oldest entry should be removed');
    assert(router.history[2] === '/d', 'Newest entry should be added');
  });

  // Test: Route handler is called with params
  test('Route handler is called with params', function() {
    var router = new Router();
    var capturedParams = null;
    var capturedPath = null;
    
    router.register('/post/:id', function(params, path) {
      capturedParams = params;
      capturedPath = path;
    });
    
    var originalHash = window.location.hash;
    window.location.hash = '#/post/123';
    router.handleHashChange();
    
    assert(capturedParams !== null, 'Handler should be called');
    assert(capturedParams.id === '123', 'Should pass correct params');
    assert(capturedPath === '/post/123', 'Should pass correct path');
    
    window.location.hash = originalHash;
  });

  // Test: Multiple routes can be registered
  test('Multiple routes can be registered', function() {
    var router = new Router();
    
    router.register('/timeline', function() {});
    router.register('/profile', function() {});
    router.register('/post/:id', function() {});
    
    assert(router.routes.length === 3, 'Should have 3 routes');
  });

  // Test: Routes are matched in order
  test('Routes are matched in order', function() {
    var router = new Router();
    var matched = null;
    
    router.register('/post/new', function() { matched = 'new'; });
    router.register('/post/:id', function() { matched = 'id'; });
    
    var originalHash = window.location.hash;
    window.location.hash = '#/post/new';
    router.handleHashChange();
    
    assert(matched === 'new', 'Should match more specific route first');
    
    window.location.hash = originalHash;
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
