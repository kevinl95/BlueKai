# Compatibility Layer for Gecko 48

This directory contains polyfills and compatibility utilities for running BlueKai on KaiOS 2.5 devices with Gecko 48 (Firefox 48).

## Files

### polyfills.js
Core JavaScript polyfills for features not available in Gecko 48:

- **Promise**: Full Promise/A+ implementation with `resolve`, `reject`, `all`, `then`, and `catch`
- **Object.assign**: Merge objects
- **Array methods**: `find`, `findIndex`, `includes`, `from`
- **String methods**: `startsWith`, `endsWith`, `includes`

**Usage**: Automatically imported at app startup via `src/index.js`. No manual import needed.

### http.js
XMLHttpRequest wrapper that provides a Promise-based HTTP client (Fetch API alternative).

**Usage**:
```javascript
import http from './utils/http';

// GET request
http.get('https://api.example.com/data')
  .then(function(response) {
    console.log(response.data);
  })
  .catch(function(error) {
    console.error('Request failed:', error);
  });

// POST request
http.post('https://api.example.com/data', { name: 'John' })
  .then(function(response) {
    console.log('Created:', response.data);
  });

// Custom request
http.request({
  url: 'https://api.example.com/data',
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer token123'
  },
  body: { name: 'Jane' },
  timeout: 5000
});
```

**Response format**:
```javascript
{
  status: 200,
  statusText: 'OK',
  headers: { 'content-type': 'application/json' },
  data: { ... } // Parsed JSON or raw text
}
```

### es6-helpers.js
Utility functions that provide alternatives to ES6 features not available in ES5.

**Usage**:
```javascript
import helpers from './utils/es6-helpers';

// Template strings alternative
var msg = helpers.template('Hello {name}!', { name: 'World' });
// Result: "Hello World!"

// String formatting
var msg = helpers.format('Hello %s, you have %d messages', 'John', 5);
// Result: "Hello John, you have 5 messages"

// Object destructuring alternative
var user = { name: 'John', age: 30, email: 'john@example.com' };
var profile = helpers.pick(user, ['name', 'age']);
// Result: { name: 'John', age: 30 }

// Omit properties
var public = helpers.omit(user, ['email']);
// Result: { name: 'John', age: 30 }

// Default parameters alternative
var value = helpers.defaults(userInput, 'default value');

// Object spread alternative
var merged = helpers.extend({}, obj1, obj2, obj3);

// Array spread alternative
var combined = helpers.concat(arr1, arr2, arr3);

// Deep clone
var copy = helpers.clone(originalObject);
```

### compatibility-tests.js
Test suite to verify polyfills and helpers work correctly.

**Usage**:
```javascript
import tests from './utils/compatibility-tests';
import http from './utils/http';
import helpers from './utils/es6-helpers';

// Run all polyfill tests
tests.runCompatibilityTests();

// Test HTTP client
tests.testHTTPClient(http);

// Test ES6 helpers
tests.testES6Helpers(helpers);
```

## Testing

### Browser Testing
Open `test-compatibility.html` in a browser to run basic compatibility tests:

```bash
# Serve the file locally
python -m SimpleHTTPServer 8000
# or
python3 -m http.server 8000

# Then open http://localhost:8000/test-compatibility.html
```

### Device Testing
To test on actual KaiOS device:

1. Build the project: `npm run build`
2. Deploy to device or simulator
3. Check console for any polyfill-related errors

## Browser Support

These polyfills target:
- **Gecko 48** (Firefox 48) - KaiOS 2.5
- **ES5** compatibility
- No modern browser APIs (Fetch, async/await, etc.)

## Performance Considerations

- Polyfills add ~5KB to bundle size (gzipped)
- Promise implementation is lightweight but not as optimized as native
- XMLHttpRequest is synchronous in error handling but asynchronous for requests
- All helpers are tree-shakeable if using ES6 imports

## Known Limitations

1. **Promise**: Does not support `Promise.race()` or `Promise.allSettled()`
2. **HTTP client**: No streaming support, no request cancellation
3. **ES6 helpers**: Template function doesn't support complex expressions
4. **No async/await**: Use Promises with `.then()` and `.catch()`

## Adding New Polyfills

If you need additional polyfills:

1. Add to `polyfills.js` with feature detection
2. Add tests to `compatibility-tests.js`
3. Update this README
4. Test on actual KaiOS device

## References

- [Gecko 48 compatibility table](https://kangax.github.io/compat-table/es6/)
- [KaiOS Developer Portal](https://developer.kaiostech.com/)
- [MDN Polyfills](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects)
