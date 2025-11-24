# CacheManager

A comprehensive cache management system with TTL (Time To Live) support, LRU (Least Recently Used) eviction, and pattern-based invalidation.

## Features

- **TTL Support**: Automatic expiration of cache entries after a specified time
- **LRU Eviction**: Automatically removes least recently used entries when approaching storage limits
- **Cache Key Generation**: Utilities for generating consistent cache keys
- **Pattern Matching**: Clear cache entries using wildcard patterns
- **Namespace Invalidation**: Invalidate all entries in a specific namespace
- **Automatic Pruning**: Remove expired entries automatically
- **Access Tracking**: Track access count and last access time for each entry
- **Statistics**: Get detailed cache statistics

## Usage

### Basic Usage

```javascript
// Create a CacheManager instance
var storage = new StorageManager();
var cache = new CacheManager(storage);

// Generate a cache key
var key = cache.generateKey('timeline', 'user123');

// Set a value with TTL (5 minutes)
cache.set(key, { posts: [...] }, 5 * 60 * 1000);

// Get a value
var data = cache.get(key);

// Check if a key exists
if (cache.has(key)) {
  // Key exists and is not expired
}

// Remove a specific entry
cache.remove(key);
```

### Advanced Usage

```javascript
// Custom configuration
var cache = new CacheManager(storage, {
  defaultTTL: 10 * 60 * 1000,  // 10 minutes default
  maxStorageSize: 4 * 1024 * 1024,  // 4MB max
  pruneThreshold: 0.8  // Prune at 80% capacity
});

// Clear entries matching a pattern
cache.clear('cache_timeline:*');  // Clear all timeline entries

// Invalidate by namespace
cache.invalidate('timeline');  // Remove all timeline entries

// Prune expired entries
var pruned = cache.prune();
console.log('Pruned ' + pruned + ' expired entries');

// Get cache statistics
var stats = cache.getStats();
console.log('Total entries:', stats.totalEntries);
console.log('Valid entries:', stats.validEntries);
console.log('Expired entries:', stats.expiredEntries);
console.log('Storage usage:', stats.utilizationPercent + '%');
```

## API Reference

### Constructor

```javascript
new CacheManager(storage, options)
```

**Parameters:**
- `storage` (StorageManager): Storage manager instance
- `options` (Object, optional):
  - `defaultTTL` (number): Default TTL in milliseconds (default: 5 minutes)
  - `maxStorageSize` (number): Maximum storage size in bytes (default: 4MB)
  - `pruneThreshold` (number): Threshold for automatic pruning (default: 0.8)

### Methods

#### generateKey(namespace, identifier)

Generate a cache key from namespace and identifier.

**Parameters:**
- `namespace` (string): Cache namespace (e.g., 'timeline', 'profile')
- `identifier` (string|Object): Unique identifier

**Returns:** (string) Generated cache key

#### set(key, data, ttl)

Store data in cache with TTL.

**Parameters:**
- `key` (string): Cache key
- `data` (any): Data to cache
- `ttl` (number, optional): Time to live in milliseconds

**Returns:** (boolean) Success status

#### get(key)

Retrieve data from cache.

**Parameters:**
- `key` (string): Cache key

**Returns:** (any) Cached data or null if not found/expired

#### has(key)

Check if a valid cache entry exists.

**Parameters:**
- `key` (string): Cache key

**Returns:** (boolean) True if valid entry exists

#### remove(key)

Remove a cache entry.

**Parameters:**
- `key` (string): Cache key

**Returns:** (boolean) Success status

#### clear(pattern)

Clear cache entries matching a pattern.

**Parameters:**
- `pattern` (string, optional): Pattern with wildcards (*). If omitted, clears all cache entries.

**Returns:** (number) Number of entries cleared

**Examples:**
```javascript
cache.clear('cache_timeline:*');  // Clear all timeline entries
cache.clear('cache_*:user123');   // Clear all entries for user123
cache.clear();                     // Clear all cache entries
```

#### invalidate(namespace)

Invalidate all entries in a namespace.

**Parameters:**
- `namespace` (string): Cache namespace

**Returns:** (number) Number of entries invalidated

#### prune()

Remove all expired cache entries.

**Returns:** (number) Number of entries pruned

#### getStats()

Get cache statistics.

**Returns:** (Object) Statistics object with:
- `totalEntries` (number): Total cache entries
- `validEntries` (number): Valid (non-expired) entries
- `expiredEntries` (number): Expired entries
- `totalSize` (number): Total storage size in bytes
- `utilizationPercent` (number): Storage utilization percentage
- `oldestEntry` (string): Key of oldest entry
- `newestEntry` (string): Key of newest entry

## Cache Entry Structure

Each cache entry is stored with the following metadata:

```javascript
{
  data: <cached data>,
  expiresAt: <timestamp>,
  createdAt: <timestamp>,
  accessedAt: <timestamp>,
  accessCount: <number>
}
```

## LRU Eviction

When storage usage exceeds the `pruneThreshold`:

1. Expired entries are removed first
2. If still over threshold, LRU eviction is triggered
3. Entries are sorted by access count (ascending) and access time (oldest first)
4. The oldest 25% of entries are evicted

## Pattern Matching

The `clear()` method supports wildcard patterns:

- `*` matches any characters
- Patterns are converted to regular expressions
- Special regex characters are escaped

**Examples:**
- `cache_timeline:*` - Matches all timeline entries
- `cache_*:user123` - Matches all entries for user123
- `cache_profile:*` - Matches all profile entries

## Performance Considerations

- Cache keys are prefixed with `cache_` to distinguish from other storage
- Metadata is stored separately for efficient LRU tracking
- Access count and time are updated on each `get()` operation
- Automatic pruning prevents storage overflow
- LRU eviction ensures most valuable data is retained

## Compatibility

- ES5 compatible (works with Gecko 48)
- No external dependencies
- Uses LocalStorage via StorageManager
- Handles storage quota exceeded errors gracefully

## Testing

Run tests in Node.js:
```bash
node test-cache-simple.js
```

Run tests in browser:
```
Open test-cache-manager.html in a browser
```

## Requirements Addressed

This implementation addresses the following requirements:

- **6.2**: Cache management for offline viewing
- **6.4**: Automatic retry and cache integration
- **7.5**: Memory management with cache size limits and pruning
