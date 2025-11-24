/**
 * Example usage of CacheManager
 * Demonstrates common caching patterns for BlueKai
 */

// In a real application, these would be imported
// var StorageManager = require('./storage.js');
// var CacheManager = require('./cache-manager.js');

/**
 * Example 1: Caching timeline data
 */
function exampleTimelineCache() {
  var storage = new StorageManager();
  var cache = new CacheManager(storage, {
    defaultTTL: 5 * 60 * 1000  // 5 minutes for timeline
  });
  
  // Generate cache key for user's timeline
  var timelineKey = cache.generateKey('timeline', 'home');
  
  // Check if cached data exists
  var cachedTimeline = cache.get(timelineKey);
  
  if (cachedTimeline) {
    console.log('Using cached timeline data');
    return Promise.resolve(cachedTimeline);
  }
  
  // Fetch from API if not cached
  console.log('Fetching fresh timeline data');
  return fetchTimelineFromAPI().then(function(data) {
    // Cache the response
    cache.set(timelineKey, data);
    return data;
  });
}

/**
 * Example 2: Caching user profiles
 */
function exampleProfileCache(userDid) {
  var storage = new StorageManager();
  var cache = new CacheManager(storage, {
    defaultTTL: 15 * 60 * 1000  // 15 minutes for profiles
  });
  
  // Generate cache key for specific user
  var profileKey = cache.generateKey('profile', userDid);
  
  // Try to get from cache
  var cachedProfile = cache.get(profileKey);
  
  if (cachedProfile) {
    console.log('Using cached profile for', userDid);
    return Promise.resolve(cachedProfile);
  }
  
  // Fetch from API
  return fetchProfileFromAPI(userDid).then(function(profile) {
    cache.set(profileKey, profile);
    return profile;
  });
}

/**
 * Example 3: Invalidating cache on user action
 */
function exampleInvalidateOnPost() {
  var storage = new StorageManager();
  var cache = new CacheManager(storage);
  
  // User creates a new post
  return createPost({ text: 'Hello, BlueSky!' }).then(function(post) {
    // Invalidate timeline cache so fresh data is fetched
    cache.invalidate('timeline');
    console.log('Timeline cache invalidated after posting');
    return post;
  });
}

/**
 * Example 4: Periodic cache maintenance
 */
function exampleCacheMaintenance() {
  var storage = new StorageManager();
  var cache = new CacheManager(storage);
  
  // Run maintenance every 5 minutes
  setInterval(function() {
    var pruned = cache.prune();
    
    if (pruned > 0) {
      console.log('Cache maintenance: pruned', pruned, 'expired entries');
    }
    
    // Check storage usage
    var stats = cache.getStats();
    console.log('Cache stats:', {
      entries: stats.validEntries,
      usage: stats.utilizationPercent.toFixed(1) + '%'
    });
  }, 5 * 60 * 1000);
}

/**
 * Example 5: Caching with cursor pagination
 */
function examplePaginationCache(cursor) {
  var storage = new StorageManager();
  var cache = new CacheManager(storage);
  
  // Generate key that includes cursor
  var pageKey = cache.generateKey('timeline', { cursor: cursor || 'initial' });
  
  var cachedPage = cache.get(pageKey);
  
  if (cachedPage) {
    console.log('Using cached page');
    return Promise.resolve(cachedPage);
  }
  
  return fetchTimelinePage(cursor).then(function(page) {
    // Cache this page for 3 minutes
    cache.set(pageKey, page, 3 * 60 * 1000);
    return page;
  });
}

/**
 * Example 6: Clearing cache on logout
 */
function exampleLogout() {
  var storage = new StorageManager();
  var cache = new CacheManager(storage);
  
  // Clear all cache entries
  var cleared = cache.clear();
  console.log('Cleared', cleared, 'cache entries on logout');
  
  // Also clear session data
  storage.remove('session');
  storage.remove('user');
}

/**
 * Example 7: Selective cache clearing
 */
function exampleSelectiveClear(userId) {
  var storage = new StorageManager();
  var cache = new CacheManager(storage);
  
  // Clear only entries related to a specific user
  var pattern = 'cache_*:' + userId;
  var cleared = cache.clear(pattern);
  
  console.log('Cleared', cleared, 'entries for user', userId);
}

/**
 * Example 8: Cache statistics monitoring
 */
function exampleMonitoring() {
  var storage = new StorageManager();
  var cache = new CacheManager(storage);
  
  var stats = cache.getStats();
  
  console.log('Cache Statistics:');
  console.log('- Total entries:', stats.totalEntries);
  console.log('- Valid entries:', stats.validEntries);
  console.log('- Expired entries:', stats.expiredEntries);
  console.log('- Storage size:', (stats.totalSize / 1024).toFixed(2), 'KB');
  console.log('- Utilization:', stats.utilizationPercent.toFixed(1) + '%');
  
  // Alert if cache is getting full
  if (stats.utilizationPercent > 80) {
    console.warn('Cache is over 80% full, consider clearing old entries');
  }
}

/**
 * Example 9: Optimistic caching for offline support
 */
function exampleOfflineCache() {
  var storage = new StorageManager();
  var cache = new CacheManager(storage, {
    defaultTTL: 24 * 60 * 60 * 1000  // 24 hours for offline data
  });
  
  function getTimeline() {
    var key = cache.generateKey('timeline', 'home');
    var cached = cache.get(key);
    
    // Always return cached data immediately if available
    if (cached) {
      console.log('Showing cached timeline (may be stale)');
      
      // Try to fetch fresh data in background
      fetchTimelineFromAPI()
        .then(function(fresh) {
          cache.set(key, fresh);
          console.log('Updated cache with fresh data');
        })
        .catch(function(error) {
          console.log('Failed to fetch fresh data, using cache');
        });
      
      return Promise.resolve(cached);
    }
    
    // No cache, must fetch
    return fetchTimelineFromAPI().then(function(data) {
      cache.set(key, data);
      return data;
    });
  }
  
  return getTimeline();
}

/**
 * Example 10: Cache warming on app start
 */
function exampleCacheWarming() {
  var storage = new StorageManager();
  var cache = new CacheManager(storage);
  
  // On app initialization, pre-fetch and cache common data
  function warmCache() {
    console.log('Warming cache...');
    
    var promises = [
      // Fetch and cache timeline
      fetchTimelineFromAPI().then(function(timeline) {
        cache.set(cache.generateKey('timeline', 'home'), timeline);
      }),
      
      // Fetch and cache user profile
      fetchProfileFromAPI('current-user').then(function(profile) {
        cache.set(cache.generateKey('profile', 'current-user'), profile);
      }),
      
      // Fetch and cache notifications
      fetchNotificationsFromAPI().then(function(notifications) {
        cache.set(cache.generateKey('notifications', 'list'), notifications);
      })
    ];
    
    return Promise.all(promises).then(function() {
      console.log('Cache warmed successfully');
    });
  }
  
  return warmCache();
}

// Mock API functions (would be real API calls in production)
function fetchTimelineFromAPI() {
  return Promise.resolve({ posts: [] });
}

function fetchTimelinePage(cursor) {
  return Promise.resolve({ posts: [], cursor: 'next' });
}

function fetchProfileFromAPI(did) {
  return Promise.resolve({ did: did, handle: 'user.bsky.social' });
}

function fetchNotificationsFromAPI() {
  return Promise.resolve({ notifications: [] });
}

function createPost(data) {
  return Promise.resolve({ uri: 'at://...', cid: 'bafyxxx' });
}

// Export examples
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    exampleTimelineCache: exampleTimelineCache,
    exampleProfileCache: exampleProfileCache,
    exampleInvalidateOnPost: exampleInvalidateOnPost,
    exampleCacheMaintenance: exampleCacheMaintenance,
    examplePaginationCache: examplePaginationCache,
    exampleLogout: exampleLogout,
    exampleSelectiveClear: exampleSelectiveClear,
    exampleMonitoring: exampleMonitoring,
    exampleOfflineCache: exampleOfflineCache,
    exampleCacheWarming: exampleCacheWarming
  };
}
