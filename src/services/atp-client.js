/**
 * AT Protocol (ATP) API Client for BlueSky
 * Implements authentication and session management
 */

import HttpClient from './http-client.js';
import StorageManager from '../utils/storage.js';

var TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // Refresh 5 minutes before expiry

/**
 * ATP API Client
 * @param {Object} config - Configuration options
 */
function ATPClient(config) {
  this.config = Object.assign({
    baseURL: 'https://bsky.social',
    timeout: 30000
  }, config || {});
  
  this.httpClient = new HttpClient({
    baseURL: this.config.baseURL,
    timeout: this.config.timeout
  });
  
  this.storage = new StorageManager('bluekai');
  this.session = null;
  this.refreshPromise = null;
  
  // Add request interceptor to add auth header
  var self = this;
  this.httpClient.addRequestInterceptor(function(config) {
    return self.addAuthHeader(config);
  });
  
  // Add response interceptor to handle auth errors
  this.httpClient.addResponseInterceptor(
    function(response) {
      return response;
    },
    function(error) {
      return self.handleAuthError(error);
    }
  );
  
  // Try to restore session from storage
  this.restoreSession();
}

/**
 * Create a new account (signup)
 * @param {Object} options - Account creation options
 * @param {string} options.email - User email address
 * @param {string} options.handle - Desired handle (without domain)
 * @param {string} options.password - Account password
 * @param {string} options.inviteCode - Invite code (optional)
 * @returns {Promise} Promise that resolves with session data
 */
ATPClient.prototype.createAccount = function(options) {
  var self = this;
  
  if (!options.email || !options.handle || !options.password) {
    return Promise.reject(new Error('Email, handle, and password are required'));
  }
  
  // Validate email format
  if (!this.isValidEmail(options.email)) {
    return Promise.reject(new Error('Invalid email address'));
  }
  
  // Validate handle format
  if (!this.isValidHandle(options.handle)) {
    return Promise.reject(new Error('Invalid handle format'));
  }
  
  var requestData = {
    email: options.email,
    handle: options.handle,
    password: options.password
  };
  
  // Add invite code if provided
  if (options.inviteCode) {
    requestData.inviteCode = options.inviteCode;
  }
  
  return this.httpClient.post('/xrpc/com.atproto.server.createAccount', requestData)
    .then(function(response) {
      var sessionData = response.data;
      
      // Store session
      self.session = {
        accessJwt: sessionData.accessJwt,
        refreshJwt: sessionData.refreshJwt,
        handle: sessionData.handle,
        did: sessionData.did,
        email: options.email,
        expiresAt: self.calculateTokenExpiry(sessionData.accessJwt)
      };
      
      // Persist to storage
      self.storage.set('session', self.session);
      
      return self.session;
    })
    .catch(function(error) {
      // Map common signup errors to user-friendly messages
      if (error.data && error.data.error) {
        var errorType = error.data.error;
        
        if (errorType === 'InvalidHandle' || errorType.indexOf('handle') !== -1) {
          throw new Error('Handle is already taken or invalid');
        }
        if (errorType === 'InvalidEmail' || errorType.indexOf('email') !== -1) {
          throw new Error('Email is invalid or already in use');
        }
        if (errorType === 'InvalidInviteCode' || errorType.indexOf('invite') !== -1) {
          throw new Error('Invalid invite code');
        }
      }
      
      throw error;
    });
};

/**
 * Check if handle is available
 * @param {string} handle - Handle to check
 * @returns {Promise} Promise that resolves with availability status
 */
ATPClient.prototype.checkHandleAvailability = function(handle) {
  if (!handle || !this.isValidHandle(handle)) {
    return Promise.reject(new Error('Invalid handle format'));
  }
  
  // Try to get profile for this handle
  // If it doesn't exist, handle is available
  return this.httpClient.get('/xrpc/app.bsky.actor.getProfile?actor=' + encodeURIComponent(handle))
    .then(function() {
      // Profile exists, handle is taken
      return { available: false };
    })
    .catch(function(error) {
      // If 404, handle is available
      if (error.status === 404) {
        return { available: true };
      }
      // Other errors, can't determine availability
      throw error;
    });
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
ATPClient.prototype.isValidEmail = function(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  // Simple email validation regex
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate handle format
 * @param {string} handle - Handle to validate
 * @returns {boolean} True if valid
 */
ATPClient.prototype.isValidHandle = function(handle) {
  if (!handle || typeof handle !== 'string') {
    return false;
  }
  
  // Handle should be alphanumeric with dots and hyphens
  // Can include domain (user.bsky.social) or just username (user)
  var handleRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*$/;
  return handleRegex.test(handle) && handle.length >= 3 && handle.length <= 253;
};

/**
 * Login with identifier and password
 * @param {string} identifier - User handle or email
 * @param {string} password - App password
 * @returns {Promise} Promise that resolves with session data
 */
ATPClient.prototype.login = function(identifier, password) {
  var self = this;
  
  return this.httpClient.post('/xrpc/com.atproto.server.createSession', {
    identifier: identifier,
    password: password
  })
  .then(function(response) {
    var sessionData = response.data;
    
    // Store session
    self.session = {
      accessJwt: sessionData.accessJwt,
      refreshJwt: sessionData.refreshJwt,
      handle: sessionData.handle,
      did: sessionData.did,
      email: sessionData.email,
      expiresAt: self.calculateTokenExpiry(sessionData.accessJwt)
    };
    
    // Persist to storage
    self.storage.set('session', self.session);
    
    return self.session;
  });
};

/**
 * Refresh the current session
 * @returns {Promise} Promise that resolves with new session data
 */
ATPClient.prototype.refreshSession = function() {
  var self = this;
  
  // If already refreshing, return existing promise
  if (this.refreshPromise) {
    return this.refreshPromise;
  }
  
  if (!this.session || !this.session.refreshJwt) {
    return Promise.reject(new Error('No session to refresh'));
  }
  
  this.refreshPromise = this.httpClient.post('/xrpc/com.atproto.server.refreshSession', null, {
    headers: {
      'Authorization': 'Bearer ' + this.session.refreshJwt
    }
  })
  .then(function(response) {
    var sessionData = response.data;
    
    // Update session
    self.session.accessJwt = sessionData.accessJwt;
    self.session.refreshJwt = sessionData.refreshJwt;
    self.session.expiresAt = self.calculateTokenExpiry(sessionData.accessJwt);
    
    // Persist to storage
    self.storage.set('session', self.session);
    
    self.refreshPromise = null;
    return self.session;
  })
  .catch(function(error) {
    self.refreshPromise = null;
    throw error;
  });
  
  return this.refreshPromise;
};

/**
 * Logout and clear session
 * @returns {Promise} Promise that resolves when logged out
 */
ATPClient.prototype.logout = function() {
  // Clear session from memory and storage
  this.session = null;
  this.storage.remove('session');
  
  return Promise.resolve();
};

/**
 * Get current session
 * @returns {Object|null} Current session or null
 */
ATPClient.prototype.getSession = function() {
  return this.session;
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated
 */
ATPClient.prototype.isAuthenticated = function() {
  return this.session !== null && this.session.accessJwt !== null;
};

/**
 * Restore session from storage
 */
ATPClient.prototype.restoreSession = function() {
  var storedSession = this.storage.get('session');
  
  if (storedSession && storedSession.accessJwt) {
    // Check if session is still valid
    if (storedSession.expiresAt && storedSession.expiresAt > Date.now()) {
      this.session = storedSession;
    } else {
      // Session expired, clear it
      this.storage.remove('session');
    }
  }
};

/**
 * Calculate token expiry time from JWT
 * @param {string} jwt - JWT token
 * @returns {number} Expiry timestamp in milliseconds
 */
ATPClient.prototype.calculateTokenExpiry = function(jwt) {
  try {
    // JWT format: header.payload.signature
    var parts = jwt.split('.');
    if (parts.length !== 3) {
      return Date.now() + (60 * 60 * 1000); // Default to 1 hour
    }
    
    // Decode payload (base64url)
    var payload = parts[1];
    // Replace URL-safe characters
    payload = payload.replace(/-/g, '+').replace(/_/g, '/');
    // Pad if necessary
    while (payload.length % 4) {
      payload += '=';
    }
    
    var decoded = JSON.parse(atob(payload));
    
    if (decoded.exp) {
      return decoded.exp * 1000; // Convert to milliseconds
    }
  } catch (e) {
    // If parsing fails, default to 1 hour
  }
  
  return Date.now() + (60 * 60 * 1000);
};

/**
 * Check if token needs refresh
 * @returns {boolean} True if token should be refreshed
 */
ATPClient.prototype.shouldRefreshToken = function() {
  if (!this.session || !this.session.expiresAt) {
    return false;
  }
  
  var timeUntilExpiry = this.session.expiresAt - Date.now();
  return timeUntilExpiry < TOKEN_REFRESH_THRESHOLD;
};

/**
 * Add authorization header to request
 * @param {Object} config - Request config
 * @returns {Promise} Promise that resolves with modified config
 */
ATPClient.prototype.addAuthHeader = function(config) {
  var self = this;
  
  // Skip auth for login and refresh endpoints
  if (config.url && (
    config.url.indexOf('createSession') !== -1 ||
    config.url.indexOf('refreshSession') !== -1
  )) {
    return Promise.resolve(config);
  }
  
  // Check if we need to refresh token
  if (this.shouldRefreshToken()) {
    return this.refreshSession()
      .then(function() {
        return self.addAuthHeaderToConfig(config);
      })
      .catch(function() {
        // If refresh fails, try with current token
        return self.addAuthHeaderToConfig(config);
      });
  }
  
  return Promise.resolve(this.addAuthHeaderToConfig(config));
};

/**
 * Add auth header to config object
 * @param {Object} config - Request config
 * @returns {Object} Modified config
 */
ATPClient.prototype.addAuthHeaderToConfig = function(config) {
  if (this.session && this.session.accessJwt) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = 'Bearer ' + this.session.accessJwt;
  }
  
  return config;
};

/**
 * Handle authentication errors
 * @param {Object} error - Error response
 * @returns {Promise} Rejected promise
 */
ATPClient.prototype.handleAuthError = function(error) {
  // If 401 and we have a refresh token, try to refresh
  if (error.status === 401 && this.session && this.session.refreshJwt) {
    var self = this;
    
    return this.refreshSession()
      .then(function() {
        // Session refreshed, but still reject original request
        // The caller should retry
        throw error;
      })
      .catch(function() {
        // Refresh failed, clear session
        self.logout();
        throw error;
      });
  }
  
  return Promise.reject(error);
};

/**
 * Get timeline feed
 * @param {Object} options - Query options
 * @param {string} options.algorithm - Feed algorithm (optional)
 * @param {number} options.limit - Number of posts to fetch (default: 50)
 * @param {string} options.cursor - Pagination cursor (optional)
 * @returns {Promise} Promise that resolves with timeline data
 */
ATPClient.prototype.getTimeline = function(options) {
  var params = Object.assign({
    algorithm: 'reverse-chronological',
    limit: 50
  }, options || {});
  
  var queryString = this.buildQueryString(params);
  
  return this.httpClient.get('/xrpc/app.bsky.feed.getTimeline' + queryString)
    .then(function(response) {
      return {
        feed: response.data.feed || [],
        cursor: response.data.cursor || null
      };
    });
};

/**
 * Get a single post
 * @param {string} uri - Post URI
 * @returns {Promise} Promise that resolves with post data
 */
ATPClient.prototype.getPost = function(uri) {
  var queryString = this.buildQueryString({ 
    uri: uri,
    depth: 6  // Load up to 6 levels of replies
  });
  
  return this.httpClient.get('/xrpc/app.bsky.feed.getPostThread' + queryString)
    .then(function(response) {
      return response.data.thread;
    });
};

/**
 * Create a new post
 * @param {Object} options - Post options
 * @param {string} options.text - Post text content
 * @param {Object} options.reply - Reply reference (optional)
 * @param {Object} options.embed - Embed data (optional)
 * @returns {Promise} Promise that resolves with created post data
 */
ATPClient.prototype.createPost = function(options) {
  var self = this;
  
  if (!options.text) {
    return Promise.reject(new Error('Post text is required'));
  }
  
  var record = {
    text: options.text,
    createdAt: new Date().toISOString(),
    $type: 'app.bsky.feed.post'
  };
  
  // Add reply reference if provided
  if (options.reply) {
    record.reply = options.reply;
  }
  
  // Add embed if provided
  if (options.embed) {
    record.embed = options.embed;
  }
  
  return this.httpClient.post('/xrpc/com.atproto.repo.createRecord', {
    repo: this.session.did,
    collection: 'app.bsky.feed.post',
    record: record
  })
  .then(function(response) {
    return response.data;
  });
};

/**
 * Like a post
 * @param {string} uri - Post URI
 * @param {string} cid - Post CID
 * @returns {Promise} Promise that resolves with like record
 */
ATPClient.prototype.likePost = function(uri, cid) {
  var record = {
    subject: {
      uri: uri,
      cid: cid
    },
    createdAt: new Date().toISOString(),
    $type: 'app.bsky.feed.like'
  };
  
  return this.httpClient.post('/xrpc/com.atproto.repo.createRecord', {
    repo: this.session.did,
    collection: 'app.bsky.feed.like',
    record: record
  })
  .then(function(response) {
    return response.data;
  });
};

/**
 * Unlike a post
 * @param {string} likeUri - Like record URI
 * @returns {Promise} Promise that resolves when unliked
 */
ATPClient.prototype.unlikePost = function(likeUri) {
  // Parse the like URI to get rkey
  var parts = likeUri.split('/');
  var rkey = parts[parts.length - 1];
  
  return this.httpClient.post('/xrpc/com.atproto.repo.deleteRecord', {
    repo: this.session.did,
    collection: 'app.bsky.feed.like',
    rkey: rkey
  })
  .then(function(response) {
    return response.data;
  });
};

/**
 * Repost a post
 * @param {string} uri - Post URI
 * @param {string} cid - Post CID
 * @returns {Promise} Promise that resolves with repost record
 */
ATPClient.prototype.repost = function(uri, cid) {
  var record = {
    subject: {
      uri: uri,
      cid: cid
    },
    createdAt: new Date().toISOString(),
    $type: 'app.bsky.feed.repost'
  };
  
  return this.httpClient.post('/xrpc/com.atproto.repo.createRecord', {
    repo: this.session.did,
    collection: 'app.bsky.feed.repost',
    record: record
  })
  .then(function(response) {
    return response.data;
  });
};

/**
 * Unrepost a post
 * @param {string} repostUri - Repost record URI
 * @returns {Promise} Promise that resolves when unreposted
 */
ATPClient.prototype.unrepost = function(repostUri) {
  // Parse the repost URI to get rkey
  var parts = repostUri.split('/');
  var rkey = parts[parts.length - 1];
  
  return this.httpClient.post('/xrpc/com.atproto.repo.deleteRecord', {
    repo: this.session.did,
    collection: 'app.bsky.feed.repost',
    rkey: rkey
  })
  .then(function(response) {
    return response.data;
  });
};

/**
 * Get user profile
 * @param {string} actor - User handle or DID
 * @returns {Promise} Promise that resolves with profile data
 */
ATPClient.prototype.getProfile = function(actor) {
  var queryString = this.buildQueryString({ actor: actor });
  
  return this.httpClient.get('/xrpc/app.bsky.actor.getProfile' + queryString)
    .then(function(response) {
      return response.data;
    });
};

/**
 * Update user profile
 * @param {Object} updates - Profile updates
 * @param {string} updates.displayName - Display name (optional)
 * @param {string} updates.description - Bio/description (optional)
 * @returns {Promise} Promise that resolves with updated profile
 */
ATPClient.prototype.updateProfile = function(updates) {
  var self = this;
  
  // First, get current profile to merge updates
  return this.getProfile(this.session.did)
    .then(function(currentProfile) {
      // Build updated record
      var record = {
        $type: 'app.bsky.actor.profile',
        displayName: updates.displayName !== undefined ? updates.displayName : currentProfile.displayName,
        description: updates.description !== undefined ? updates.description : currentProfile.description
      };
      
      // Preserve avatar and banner if they exist
      if (currentProfile.avatar) {
        record.avatar = currentProfile.avatar;
      }
      if (currentProfile.banner) {
        record.banner = currentProfile.banner;
      }
      
      // Update the profile record
      return self.httpClient.post('/xrpc/com.atproto.repo.putRecord', {
        repo: self.session.did,
        collection: 'app.bsky.actor.profile',
        rkey: 'self',
        record: record
      });
    })
    .then(function(response) {
      return response.data;
    });
};

/**
 * Follow a user
 * @param {string} subject - User DID to follow
 * @returns {Promise} Promise that resolves with follow record
 */
ATPClient.prototype.follow = function(subject) {
  var record = {
    subject: subject,
    createdAt: new Date().toISOString(),
    $type: 'app.bsky.graph.follow'
  };
  
  return this.httpClient.post('/xrpc/com.atproto.repo.createRecord', {
    repo: this.session.did,
    collection: 'app.bsky.graph.follow',
    record: record
  })
  .then(function(response) {
    return response.data;
  });
};

/**
 * Unfollow a user
 * @param {string} followUri - Follow record URI
 * @returns {Promise} Promise that resolves when unfollowed
 */
ATPClient.prototype.unfollow = function(followUri) {
  // Parse the follow URI to get rkey
  var parts = followUri.split('/');
  var rkey = parts[parts.length - 1];
  
  return this.httpClient.post('/xrpc/com.atproto.repo.deleteRecord', {
    repo: this.session.did,
    collection: 'app.bsky.graph.follow',
    rkey: rkey
  })
  .then(function(response) {
    return response.data;
  });
};

/**
 * Get notifications
 * @param {Object} options - Query options
 * @param {number} options.limit - Number of notifications to fetch (default: 50)
 * @param {string} options.cursor - Pagination cursor (optional)
 * @param {string} options.seenAt - ISO timestamp to filter notifications (optional)
 * @returns {Promise} Promise that resolves with notifications data
 */
ATPClient.prototype.getNotifications = function(options) {
  var params = Object.assign({
    limit: 50
  }, options || {});
  
  var queryString = this.buildQueryString(params);
  
  return this.httpClient.get('/xrpc/app.bsky.notification.listNotifications' + queryString)
    .then(function(response) {
      return {
        notifications: response.data.notifications || [],
        cursor: response.data.cursor || null,
        seenAt: response.data.seenAt || null
      };
    });
};

/**
 * Get notification count
 * @param {Object} options - Query options
 * @param {string} options.seenAt - ISO timestamp to count from (optional)
 * @returns {Promise} Promise that resolves with count data
 */
ATPClient.prototype.getNotificationCount = function(options) {
  var params = options || {};
  var queryString = this.buildQueryString(params);
  
  return this.httpClient.get('/xrpc/app.bsky.notification.getUnreadCount' + queryString)
    .then(function(response) {
      return {
        count: response.data.count || 0
      };
    });
};

/**
 * Mark notifications as seen
 * @param {string} seenAt - ISO timestamp (optional, defaults to now)
 * @returns {Promise} Promise that resolves when marked
 */
ATPClient.prototype.updateSeenNotifications = function(seenAt) {
  var timestamp = seenAt || new Date().toISOString();
  
  return this.httpClient.post('/xrpc/app.bsky.notification.updateSeen', {
    seenAt: timestamp
  })
  .then(function(response) {
    return response.data;
  });
};

/**
 * Build query string from parameters
 * @param {Object} params - Query parameters
 * @returns {string} Query string
 */
ATPClient.prototype.buildQueryString = function(params) {
  var parts = [];
  
  for (var key in params) {
    if (params.hasOwnProperty(key) && params[key] !== undefined && params[key] !== null) {
      parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
    }
  }
  
  return parts.length > 0 ? '?' + parts.join('&') : '';
};

export default ATPClient;
