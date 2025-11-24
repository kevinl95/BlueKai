/**
 * CacheManager - Cache management with TTL and LRU eviction
 * Compatible with Gecko 48 (ES5)
 * 
 * Features:
 * - TTL (Time To Live) support for cache entries
 * - LRU (Least Recently Used) eviction when approaching storage limits
 * - Cache key generation utilities
 * - Automatic pruning of expired entries
 * - Pattern-based cache invalidation
 */

/**
 * @class CacheManager
 * @description Manages cached data with TTL and LRU eviction
 * @param {Object} storage - StorageManager instance
 * @param {Object} options - Configuration options
 */
function CacheManager(storage, options) {
  this.storage = storage;
  this.options = options || {};
  
  // Default TTL values (in milliseconds)
  this.defaultTTL = this.options.defaultTTL || 5 * 60 * 1000; // 5 minutes
  this.maxStorageSize = this.options.maxStorageSize || 4 * 1024 * 1024; // 4MB (leaving 1MB buffer)
  this.pruneThreshold = this.options.pruneThreshold || 0.8; // Prune at 80% capacity
  
  // Cache key prefix
  this.cachePrefix = 'cache_';
  this.metaPrefix = 'cache_meta_';
}

/**
 * Generate a cache key from components
 * @param {string} namespace - Cache namespace (e.g., 'timeline', 'profile')
 * @param {string|Object} identifier - Unique identifier or object to hash
 * @returns {string} Generated cache key
 */
CacheManager.prototype.generateKey = function(namespace, identifier) {
  var key = namespace + ':';
  
  if (typeof identifier === 'string') {
    key += identifier;
  } else if (typeof identifier === 'object') {
    // Simple object serialization for cache key
    key += JSON.stringify(identifier);
  } else {
    key += String(identifier);
  }
  
  return this.cachePrefix + key;
};

/**
 * Set a value in cache with TTL
 * @param {string} key - Cache key
 * @param {*} data - Data to cache
 * @param {number} ttl - Time to live in milliseconds (optional)
 * @returns {boolean} Success status
 */
CacheManager.prototype.set = function(key, data, ttl) {
  try {
    var now = Date.now();
    var expiresAt = now + (ttl || this.defaultTTL);
    
    // Check if we need to prune before adding
    this._checkAndPrune();
    
    // Store the data
    var cacheEntry = {
      data: data,
      expiresAt: expiresAt,
      createdAt: now,
      accessedAt: now,
      accessCount: 0
    };
    
    var success = this.storage.set(key, cacheEntry);
    
    if (success) {
      // Update metadata for LRU tracking
      this._updateMetadata(key, now);
    }
    
    return success;
  } catch (error) {
    console.error('CacheManager.set error:', error);
    return false;
  }
};

/**
 * Get a value from cache
 * @param {string} key - Cache key
 * @returns {*} Cached data or null if not found/expired
 */
CacheManager.prototype.get = function(key) {
  try {
    var cacheEntry = this.storage.get(key);
    
    if (!cacheEntry) {
      return null;
    }
    
    var now = Date.now();
    
    // Check if expired
    if (cacheEntry.expiresAt && cacheEntry.expiresAt < now) {
      // Remove expired entry
      this.remove(key);
      return null;
    }
    
    // Update access metadata for LRU
    cacheEntry.accessedAt = now;
    cacheEntry.accessCount = (cacheEntry.accessCount || 0) + 1;
    this.storage.set(key, cacheEntry);
    this._updateMetadata(key, now);
    
    return cacheEntry.data;
  } catch (error) {
    console.error('CacheManager.get error:', error);
    return null;
  }
};

/**
 * Check if a cache entry exists and is valid
 * @param {string} key - Cache key
 * @returns {boolean} True if valid cache entry exists
 */
CacheManager.prototype.has = function(key) {
  try {
    var cacheEntry = this.storage.get(key);
    
    if (!cacheEntry) {
      return false;
    }
    
    var now = Date.now();
    
    // Check if expired
    if (cacheEntry.expiresAt && cacheEntry.expiresAt < now) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('CacheManager.has error:', error);
    return false;
  }
};

/**
 * Remove a cache entry
 * @param {string} key - Cache key
 * @returns {boolean} Success status
 */
CacheManager.prototype.remove = function(key) {
  try {
    this.storage.remove(key);
    this._removeMetadata(key);
    return true;
  } catch (error) {
    console.error('CacheManager.remove error:', error);
    return false;
  }
};

/**
 * Clear cache entries matching a pattern
 * @param {string} pattern - Pattern to match (supports wildcards with *)
 * @returns {number} Number of entries cleared
 */
CacheManager.prototype.clear = function(pattern) {
  try {
    var keys = this.storage.keys();
    var cleared = 0;
    var regex = this._patternToRegex(pattern);
    
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      
      // Only process cache keys
      if (key.indexOf(this.cachePrefix) !== 0) {
        continue;
      }
      
      // Check if key matches pattern
      if (!pattern || regex.test(key)) {
        this.remove(key);
        cleared++;
      }
    }
    
    return cleared;
  } catch (error) {
    console.error('CacheManager.clear error:', error);
    return 0;
  }
};

/**
 * Invalidate cache entries by namespace
 * @param {string} namespace - Cache namespace to invalidate
 * @returns {number} Number of entries invalidated
 */
CacheManager.prototype.invalidate = function(namespace) {
  var pattern = this.cachePrefix + namespace + ':*';
  return this.clear(pattern);
};

/**
 * Prune expired cache entries
 * @returns {number} Number of entries pruned
 */
CacheManager.prototype.prune = function() {
  try {
    var keys = this.storage.keys();
    var now = Date.now();
    var pruned = 0;
    
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      
      // Only process cache keys
      if (key.indexOf(this.cachePrefix) !== 0) {
        continue;
      }
      
      var cacheEntry = this.storage.get(key);
      
      if (cacheEntry && cacheEntry.expiresAt && cacheEntry.expiresAt < now) {
        this.remove(key);
        pruned++;
      }
    }
    
    return pruned;
  } catch (error) {
    console.error('CacheManager.prune error:', error);
    return 0;
  }
};

/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
CacheManager.prototype.getStats = function() {
  try {
    var keys = this.storage.keys();
    var stats = {
      totalEntries: 0,
      expiredEntries: 0,
      validEntries: 0,
      totalSize: 0,
      oldestEntry: null,
      newestEntry: null
    };
    
    var now = Date.now();
    var oldestTime = Infinity;
    var newestTime = 0;
    
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      
      // Only process cache keys
      if (key.indexOf(this.cachePrefix) !== 0) {
        continue;
      }
      
      stats.totalEntries++;
      
      var cacheEntry = this.storage.get(key);
      
      if (cacheEntry) {
        // Check if expired
        if (cacheEntry.expiresAt && cacheEntry.expiresAt < now) {
          stats.expiredEntries++;
        } else {
          stats.validEntries++;
        }
        
        // Track oldest and newest
        if (cacheEntry.createdAt < oldestTime) {
          oldestTime = cacheEntry.createdAt;
          stats.oldestEntry = key;
        }
        if (cacheEntry.createdAt > newestTime) {
          newestTime = cacheEntry.createdAt;
          stats.newestEntry = key;
        }
      }
    }
    
    stats.totalSize = this.storage.getSize();
    stats.utilizationPercent = (stats.totalSize / this.maxStorageSize) * 100;
    
    return stats;
  } catch (error) {
    console.error('CacheManager.getStats error:', error);
    return null;
  }
};

/**
 * Check storage usage and prune if necessary
 * @private
 */
CacheManager.prototype._checkAndPrune = function() {
  try {
    var currentSize = this.storage.getSize();
    var threshold = this.maxStorageSize * this.pruneThreshold;
    
    if (currentSize >= threshold) {
      console.warn('Cache approaching storage limit, pruning...');
      
      // First, remove expired entries
      var prunedExpired = this.prune();
      
      // If still over threshold, use LRU eviction
      currentSize = this.storage.getSize();
      if (currentSize >= threshold) {
        var evicted = this._evictLRU();
        console.log('Pruned ' + prunedExpired + ' expired, evicted ' + evicted + ' LRU entries');
      } else {
        console.log('Pruned ' + prunedExpired + ' expired entries');
      }
    }
  } catch (error) {
    console.error('CacheManager._checkAndPrune error:', error);
  }
};

/**
 * Evict least recently used cache entries
 * @private
 * @returns {number} Number of entries evicted
 */
CacheManager.prototype._evictLRU = function() {
  try {
    var keys = this.storage.keys();
    var cacheEntries = [];
    
    // Collect all cache entries with their access times
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      
      // Only process cache keys
      if (key.indexOf(this.cachePrefix) !== 0) {
        continue;
      }
      
      var cacheEntry = this.storage.get(key);
      if (cacheEntry) {
        cacheEntries.push({
          key: key,
          accessedAt: cacheEntry.accessedAt || cacheEntry.createdAt || 0,
          accessCount: cacheEntry.accessCount || 0
        });
      }
    }
    
    // Sort by access time (oldest first) and access count (least accessed first)
    cacheEntries.sort(function(a, b) {
      // Prioritize by access count first (lower is worse)
      if (a.accessCount !== b.accessCount) {
        return a.accessCount - b.accessCount;
      }
      // Then by access time (older is worse)
      return a.accessedAt - b.accessedAt;
    });
    
    // Evict oldest 25% of entries
    var evictCount = Math.ceil(cacheEntries.length * 0.25);
    var evicted = 0;
    
    for (var j = 0; j < evictCount && j < cacheEntries.length; j++) {
      this.remove(cacheEntries[j].key);
      evicted++;
    }
    
    return evicted;
  } catch (error) {
    console.error('CacheManager._evictLRU error:', error);
    return 0;
  }
};

/**
 * Update metadata for LRU tracking
 * @private
 * @param {string} key - Cache key
 * @param {number} timestamp - Access timestamp
 */
CacheManager.prototype._updateMetadata = function(key, timestamp) {
  try {
    var metaKey = this.metaPrefix + key;
    this.storage.set(metaKey, {
      lastAccess: timestamp,
      key: key
    });
  } catch (error) {
    // Metadata is optional, don't fail if it can't be stored
    console.warn('CacheManager._updateMetadata error:', error);
  }
};

/**
 * Remove metadata for a cache key
 * @private
 * @param {string} key - Cache key
 */
CacheManager.prototype._removeMetadata = function(key) {
  try {
    var metaKey = this.metaPrefix + key;
    this.storage.remove(metaKey);
  } catch (error) {
    // Metadata is optional, don't fail if it can't be removed
    console.warn('CacheManager._removeMetadata error:', error);
  }
};

/**
 * Convert a pattern with wildcards to a regex
 * @private
 * @param {string} pattern - Pattern with * wildcards
 * @returns {RegExp} Regular expression
 */
CacheManager.prototype._patternToRegex = function(pattern) {
  if (!pattern) {
    return /.*/;
  }
  
  // Escape special regex characters except *
  var escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
  
  // Convert * to .*
  var regexStr = escaped.replace(/\*/g, '.*');
  
  return new RegExp('^' + regexStr + '$');
};

// Export for use in other modules
export default CacheManager;
