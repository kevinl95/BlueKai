/**
 * StorageManager - Wrapper for LocalStorage with error handling and serialization
 * Compatible with Gecko 48 (ES5)
 */

/**
 * @class StorageManager
 * @description Manages localStorage operations with automatic serialization and error handling
 */
function StorageManager() {
  this.storage = window.localStorage;
  this.prefix = 'bluekai_';
}

/**
 * Get a value from storage
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {*} Parsed value or defaultValue
 */
StorageManager.prototype.get = function(key, defaultValue) {
  try {
    var prefixedKey = this.prefix + key;
    var item = this.storage.getItem(prefixedKey);
    
    if (item === null) {
      return defaultValue !== undefined ? defaultValue : null;
    }
    
    // Try to parse as JSON
    try {
      return JSON.parse(item);
    } catch (parseError) {
      // If parsing fails, return as string
      return item;
    }
  } catch (error) {
    console.error('StorageManager.get error:', error);
    return defaultValue !== undefined ? defaultValue : null;
  }
};

/**
 * Set a value in storage
 * @param {string} key - Storage key
 * @param {*} value - Value to store (will be JSON stringified)
 * @returns {boolean} Success status
 */
StorageManager.prototype.set = function(key, value) {
  try {
    var prefixedKey = this.prefix + key;
    var serialized = JSON.stringify(value);
    this.storage.setItem(prefixedKey, serialized);
    return true;
  } catch (error) {
    // Handle quota exceeded error
    if (error.name === 'QuotaExceededError' || 
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      console.error('Storage quota exceeded');
      this._handleQuotaExceeded();
      
      // Try again after cleanup
      try {
        var prefixedKey = this.prefix + key;
        var serialized = JSON.stringify(value);
        this.storage.setItem(prefixedKey, serialized);
        return true;
      } catch (retryError) {
        console.error('StorageManager.set retry failed:', retryError);
        return false;
      }
    }
    
    console.error('StorageManager.set error:', error);
    return false;
  }
};

/**
 * Remove a value from storage
 * @param {string} key - Storage key
 * @returns {boolean} Success status
 */
StorageManager.prototype.remove = function(key) {
  try {
    var prefixedKey = this.prefix + key;
    this.storage.removeItem(prefixedKey);
    return true;
  } catch (error) {
    console.error('StorageManager.remove error:', error);
    return false;
  }
};

/**
 * Clear all storage with the prefix
 * @returns {boolean} Success status
 */
StorageManager.prototype.clear = function() {
  try {
    var keysToRemove = [];
    
    // Collect all keys with our prefix
    for (var i = 0; i < this.storage.length; i++) {
      var key = this.storage.key(i);
      if (key && key.indexOf(this.prefix) === 0) {
        keysToRemove.push(key);
      }
    }
    
    // Remove collected keys
    for (var j = 0; j < keysToRemove.length; j++) {
      this.storage.removeItem(keysToRemove[j]);
    }
    
    return true;
  } catch (error) {
    console.error('StorageManager.clear error:', error);
    return false;
  }
};

/**
 * Handle quota exceeded by clearing old cache entries
 * @private
 */
StorageManager.prototype._handleQuotaExceeded = function() {
  console.warn('Attempting to free storage space...');
  
  // Remove cache entries (they can be refetched)
  var cacheKeys = [];
  for (var i = 0; i < this.storage.length; i++) {
    var key = this.storage.key(i);
    if (key && key.indexOf(this.prefix + 'cache_') === 0) {
      cacheKeys.push(key);
    }
  }
  
  // Remove oldest cache entries first (simple approach: remove all cache)
  for (var j = 0; j < cacheKeys.length; j++) {
    try {
      this.storage.removeItem(cacheKeys[j]);
    } catch (e) {
      // Continue even if removal fails
    }
  }
  
  console.log('Cleared ' + cacheKeys.length + ' cache entries');
};

/**
 * Get all keys with the prefix
 * @returns {Array<string>} Array of keys (without prefix)
 */
StorageManager.prototype.keys = function() {
  try {
    var keys = [];
    var prefixLength = this.prefix.length;
    
    for (var i = 0; i < this.storage.length; i++) {
      var key = this.storage.key(i);
      if (key && key.indexOf(this.prefix) === 0) {
        keys.push(key.substring(prefixLength));
      }
    }
    
    return keys;
  } catch (error) {
    console.error('StorageManager.keys error:', error);
    return [];
  }
};

/**
 * Check if a key exists
 * @param {string} key - Storage key
 * @returns {boolean} True if key exists
 */
StorageManager.prototype.has = function(key) {
  try {
    var prefixedKey = this.prefix + key;
    return this.storage.getItem(prefixedKey) !== null;
  } catch (error) {
    console.error('StorageManager.has error:', error);
    return false;
  }
};

/**
 * Get storage size estimate in bytes
 * @returns {number} Approximate size in bytes
 */
StorageManager.prototype.getSize = function() {
  try {
    var size = 0;
    
    for (var i = 0; i < this.storage.length; i++) {
      var key = this.storage.key(i);
      if (key && key.indexOf(this.prefix) === 0) {
        var value = this.storage.getItem(key);
        // Rough estimate: 2 bytes per character (UTF-16)
        size += (key.length + (value ? value.length : 0)) * 2;
      }
    }
    
    return size;
  } catch (error) {
    console.error('StorageManager.getSize error:', error);
    return 0;
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageManager;
}
