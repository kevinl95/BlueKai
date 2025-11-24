# Core Utilities Documentation

This document describes the core utility modules implemented for BlueKai.

## Overview

Four utility modules have been implemented to support the BlueKai application:

1. **StorageManager** - LocalStorage wrapper with error handling
2. **DateFormatter** - Date and time formatting utilities
3. **TextProcessor** - Text processing and manipulation utilities
4. **CacheManager** - Cache management with TTL and LRU eviction

All utilities are ES5-compatible and work with Gecko 48 (Firefox 48).

## StorageManager

**File:** `src/utils/storage.js`

A wrapper around LocalStorage that provides automatic serialization, error handling, and quota management.

### Features

- Automatic JSON serialization/deserialization
- Quota exceeded error handling with automatic cache cleanup
- Key prefixing to avoid conflicts
- Support for complex objects, arrays, and primitives
- Size estimation

### Usage

```javascript
var storage = new StorageManager();

// Set values
storage.set('user', { name: 'John', age: 30 });
storage.set('settings', { theme: 'dark' });

// Get values
var user = storage.get('user');
var theme = storage.get('settings.theme', 'light'); // with default

// Check existence
if (storage.has('user')) {
  // ...
}

// Remove values
storage.remove('user');

// Clear all prefixed keys
storage.clear();

// Get all keys
var keys = storage.keys();

// Get storage size estimate
var sizeInBytes = storage.getSize();
```

### Methods

- `get(key, defaultValue)` - Retrieve a value
- `set(key, value)` - Store a value
- `remove(key)` - Remove a value
- `clear()` - Clear all prefixed values
- `has(key)` - Check if key exists
- `keys()` - Get all keys
- `getSize()` - Get approximate storage size in bytes

### Error Handling

When storage quota is exceeded, the StorageManager automatically:
1. Clears cache entries (keys starting with `cache_`)
2. Retries the operation
3. Returns false if still unable to store

## DateFormatter

**File:** `src/utils/date-formatter.js`

Provides date and time formatting utilities with locale support and relative time formatting.

### Features

- Relative time formatting (e.g., "2h ago", "3d ago")
- Locale-aware date/time formatting
- Multiple format options (short, medium, long, full)
- Timestamp parsing from multiple formats
- Helper methods (isToday, isYesterday)
- Multi-language support (en, es, fr, pt)

### Usage

```javascript
var formatter = new DateFormatter();

// Set locale (optional)
formatter.setLocale('es');

// Parse timestamps
var date = formatter.parseTimestamp('2025-11-23T12:00:00.000Z');
var date2 = formatter.parseTimestamp(1700000000000);

// Relative time formatting
var relative = formatter.formatRelative('2025-11-23T10:00:00.000Z');
// Returns: "2h" (if current time is 12:00)

// Date formatting
var dateStr = formatter.formatDate(date, 'medium');
// Returns: "Nov 23, 2025"

// Time formatting
var timeStr = formatter.formatTime(date);
// Returns: "12:00 PM"

var timeWithSeconds = formatter.formatTime(date, true);
// Returns: "12:00:00 PM"

// Combined date and time
var dateTime = formatter.formatDateTime(date);
// Returns: "Nov 23, 2025 12:00 PM"

// Helper methods
if (formatter.isToday(date)) {
  // ...
}

if (formatter.isYesterday(date)) {
  // ...
}
```

### Relative Time Units

- `now` - Less than 1 minute
- `Xm` - Minutes (1-59)
- `Xh` - Hours (1-23)
- `Xd` - Days (1-6)
- `Xw` - Weeks (1-3)
- `Xmo` - Months (1-11)
- `Xy` - Years (1+)

### Supported Locales

- `en` - English (default)
- `es` - Spanish
- `fr` - French
- `pt` - Portuguese

### Methods

- `setLocale(locale)` - Set formatting locale
- `parseTimestamp(timestamp)` - Parse various timestamp formats
- `formatRelative(timestamp, now?)` - Format as relative time
- `formatDate(timestamp, format?)` - Format date
- `formatTime(timestamp, includeSeconds?)` - Format time
- `formatDateTime(timestamp, format?)` - Format date and time
- `isToday(timestamp)` - Check if date is today
- `isYesterday(timestamp)` - Check if date is yesterday

## TextProcessor

**File:** `src/utils/text-processor.js`

Provides text processing utilities for posts and content, including URL detection, mention parsing, and text manipulation.

### Features

- Text truncation with word boundary awareness
- URL detection and linkification
- Mention (@handle) detection
- Hashtag detection
- Unicode-aware character counting
- Text validation
- HTML escaping and stripping
- Search term highlighting
- Whitespace normalization

### Usage

```javascript
var processor = new TextProcessor();

// Truncate text
var short = processor.truncate('This is a long text...', 20);
// Returns: "This is a long..."

// Detect URLs
var urls = processor.detectUrls('Check http://example.com');
// Returns: [{ url: 'http://example.com', start: 6, end: 25 }]

// Linkify URLs
var html = processor.linkify('Visit http://example.com');
// Returns: 'Visit <a href="http://example.com" target="_blank">...</a>'

// Detect mentions
var mentions = processor.detectMentions('Hello @user.bsky.social');
// Returns: [{ handle: 'user.bsky.social', fullMatch: '@user.bsky.social', ... }]

// Detect hashtags
var hashtags = processor.detectHashtags('This is #awesome');
// Returns: [{ tag: 'awesome', fullMatch: '#awesome', ... }]

// Count characters (Unicode-aware)
var count = processor.countCharacters('Hello 👋 World');
// Returns: 13 (counts emoji as 1 character)

// Validate length
var validation = processor.validateLength('Short text', 300);
// Returns: { valid: true, length: 10, remaining: 290, exceeded: 0 }

// Process for display (linkify everything)
var processed = processor.processForDisplay(
  'Check http://example.com @user #hashtag',
  { linkifyUrls: true, linkifyMentions: true, linkifyHashtags: true }
);

// Strip HTML
var plain = processor.stripHtml('<p>Hello <strong>World</strong></p>');
// Returns: "Hello World"

// Split into words
var words = processor.splitWords('Hello world from tests');
// Returns: ['Hello', 'world', 'from', 'tests']

// Count words
var wordCount = processor.countWords('This is a test');
// Returns: 4

// Highlight search terms
var highlighted = processor.highlight('Hello world', 'world', 'highlight');
// Returns: 'Hello <mark class="highlight">world</mark>'

// Check if whitespace only
var isBlank = processor.isWhitespace('   ');
// Returns: true

// Normalize whitespace
var normalized = processor.normalizeWhitespace('  Hello    world  ');
// Returns: "Hello world"
```

### Methods

- `truncate(text, maxLength, ellipsis?)` - Truncate text with ellipsis
- `detectUrls(text)` - Find all URLs in text
- `linkify(text, className?)` - Convert URLs to HTML links
- `detectMentions(text)` - Find all @mentions
- `detectHashtags(text)` - Find all #hashtags
- `countCharacters(text)` - Count characters (Unicode-aware)
- `validateLength(text, maxLength)` - Validate text length
- `processForDisplay(text, options?)` - Process text with all features
- `stripHtml(html)` - Remove HTML tags
- `splitWords(text)` - Split into word array
- `countWords(text)` - Count words
- `highlight(text, searchTerm, className?)` - Highlight search terms
- `isWhitespace(text)` - Check if only whitespace
- `normalizeWhitespace(text)` - Collapse and trim whitespace

## CacheManager

**File:** `src/utils/cache-manager.js`

A comprehensive cache management system with TTL (Time To Live) support, LRU (Least Recently Used) eviction, and pattern-based invalidation.

### Features

- TTL support for automatic expiration
- LRU eviction when approaching storage limits
- Cache key generation utilities
- Pattern-based cache clearing
- Namespace invalidation
- Automatic pruning of expired entries
- Access tracking (count and timestamp)
- Detailed cache statistics

### Usage

```javascript
var storage = new StorageManager();
var cache = new CacheManager(storage, {
  defaultTTL: 5 * 60 * 1000,  // 5 minutes
  maxStorageSize: 4 * 1024 * 1024,  // 4MB
  pruneThreshold: 0.8  // Prune at 80% capacity
});

// Generate cache key
var key = cache.generateKey('timeline', 'user123');

// Set with TTL
cache.set(key, { posts: [...] }, 5 * 60 * 1000);

// Get cached data
var data = cache.get(key);

// Check if exists
if (cache.has(key)) {
  // Valid cache entry exists
}

// Remove entry
cache.remove(key);

// Clear by pattern
cache.clear('cache_timeline:*');

// Invalidate namespace
cache.invalidate('timeline');

// Prune expired entries
var pruned = cache.prune();

// Get statistics
var stats = cache.getStats();
console.log('Cache usage:', stats.utilizationPercent + '%');
```

### Methods

- `generateKey(namespace, identifier)` - Generate cache key
- `set(key, data, ttl?)` - Store data with TTL
- `get(key)` - Retrieve cached data
- `has(key)` - Check if valid entry exists
- `remove(key)` - Remove entry
- `clear(pattern?)` - Clear entries matching pattern
- `invalidate(namespace)` - Invalidate namespace
- `prune()` - Remove expired entries
- `getStats()` - Get cache statistics

### Cache Entry Structure

Each entry includes metadata:
- `data` - Cached data
- `expiresAt` - Expiration timestamp
- `createdAt` - Creation timestamp
- `accessedAt` - Last access timestamp
- `accessCount` - Number of accesses

### LRU Eviction

When storage exceeds threshold:
1. Expired entries are removed first
2. If still over threshold, LRU eviction triggers
3. Entries sorted by access count and time
4. Oldest 25% of entries are evicted

See `src/utils/README-CACHE.md` for detailed documentation and `src/utils/cache-example.js` for usage examples.

## Testing

All utilities include comprehensive unit tests.

### Running Tests

Open the following HTML files in a browser to run tests:

- `test-storage.html` - StorageManager tests
- `test-date-formatter.html` - DateFormatter tests
- `test-text-processor.html` - TextProcessor tests
- `test-cache-manager.html` - CacheManager tests
- `test-utils.html` - All tests combined

Or run in Node.js:
```bash
node test-cache-simple.js
```

### Test Coverage

Each utility has extensive test coverage including:
- Basic functionality tests
- Edge case handling
- Error handling
- Unicode/emoji support
- Null/undefined handling
- Multiple locale support (DateFormatter)

## Browser Compatibility

All utilities are compatible with:
- Gecko 48 (Firefox 48)
- KaiOS 2.5
- ES5 JavaScript

No ES6+ features are used. All code uses:
- `function` declarations (no arrow functions)
- `var` (no `let`/`const`)
- `prototype` methods (no class syntax)
- Traditional loops (no `for...of`)
- Manual string concatenation (no template literals)

## Requirements Mapping

These utilities fulfill the following requirements:

### StorageManager
- **Requirement 5.3**: Securely store session token locally
- **Requirement 5.4**: Automatically restore previous session
- **Requirement 6.2**: Display previously loaded content from cache

### DateFormatter
- **Requirement 10.5**: Format timestamps according to local conventions

### TextProcessor
- **Requirement 4.5**: Create new posts up to 300 characters
- **Requirement 8.2**: Display character counter showing remaining characters

### CacheManager
- **Requirement 6.2**: Display previously loaded content from cache
- **Requirement 6.4**: Automatically retry failed requests with cache integration
- **Requirement 7.5**: Clear old cached content when memory usage exceeds thresholds

## Next Steps

These utilities will be used by:
- API client (StorageManager for tokens and cache)
- Timeline components (DateFormatter for post timestamps)
- Compose view (TextProcessor for character counting and validation)
- Post display (TextProcessor for linkification)
