/**
 * Router - Simple hash-based router for KaiOS
 * Provides route registration, matching, and navigation history
 */

/**
 * @typedef {Object} Route
 * @property {string} path - Route path pattern (e.g., '/timeline', '/post/:id')
 * @property {Function} handler - Function to call when route matches
 * @property {string} name - Optional route name
 */

function Router() {
  this.routes = [];
  this.currentRoute = null;
  this.history = [];
  this.maxHistorySize = 50;
  this.isActive = false;
  
  // Bind methods
  this.handleHashChange = this.handleHashChange.bind(this);
}

/**
 * Initialize the router and start listening for hash changes
 */
Router.prototype.init = function() {
  if (this.isActive) {
    return;
  }
  
  this.isActive = true;
  window.addEventListener('hashchange', this.handleHashChange);
  
  // Handle initial route
  this.handleHashChange();
};

/**
 * Destroy the router and clean up event listeners
 */
Router.prototype.destroy = function() {
  if (!this.isActive) {
    return;
  }
  
  this.isActive = false;
  window.removeEventListener('hashchange', this.handleHashChange);
};

/**
 * Register a route
 * @param {string} path - Route path pattern
 * @param {Function} handler - Handler function
 * @param {string} name - Optional route name
 */
Router.prototype.register = function(path, handler, name) {
  this.routes.push({
    path: path,
    handler: handler,
    name: name || null,
    pattern: this.pathToRegex(path)
  });
};

/**
 * Convert a path pattern to a regex for matching
 * @param {string} path - Path pattern (e.g., '/post/:id')
 * @returns {Object} - Regex and param names
 */
Router.prototype.pathToRegex = function(path) {
  var paramNames = [];
  
  // Extract parameter names
  var regexStr = path.replace(/:([^/]+)/g, function(match, paramName) {
    paramNames.push(paramName);
    return '([^/]+)';
  });
  
  // Escape forward slashes and create regex
  regexStr = '^' + regexStr + '$';
  
  return {
    regex: new RegExp(regexStr),
    paramNames: paramNames
  };
};

/**
 * Match a path against registered routes
 * @param {string} path - Path to match
 * @returns {Object|null} - Match result with route and params
 */
Router.prototype.match = function(path) {
  for (var i = 0; i < this.routes.length; i++) {
    var route = this.routes[i];
    var matches = path.match(route.pattern.regex);
    
    if (matches) {
      var params = {};
      
      // Extract parameters
      for (var j = 0; j < route.pattern.paramNames.length; j++) {
        params[route.pattern.paramNames[j]] = matches[j + 1];
      }
      
      return {
        route: route,
        params: params,
        path: path
      };
    }
  }
  
  return null;
};

/**
 * Navigate to a path
 * @param {string} path - Path to navigate to
 * @param {boolean} replace - Replace current history entry instead of pushing
 */
Router.prototype.navigate = function(path, replace) {
  // Ensure path starts with /
  if (path.charAt(0) !== '/') {
    path = '/' + path;
  }
  
  if (replace) {
    window.location.replace('#' + path);
  } else {
    window.location.hash = '#' + path;
  }
};

/**
 * Navigate back in history
 */
Router.prototype.back = function() {
  if (this.history.length > 1) {
    // Remove current route
    this.history.pop();
    
    // Get previous route
    var previousPath = this.history[this.history.length - 1];
    
    // Navigate without adding to history
    window.location.replace('#' + previousPath);
  } else {
    // No history, go to default route
    this.navigate('/', true);
  }
};

/**
 * Get current path from hash
 * @returns {string}
 */
Router.prototype.getCurrentPath = function() {
  var hash = window.location.hash;
  
  // Remove # prefix
  if (hash.charAt(0) === '#') {
    hash = hash.substring(1);
  }
  
  // Default to / if empty
  if (!hash) {
    hash = '/';
  }
  
  return hash;
};

/**
 * Handle hash change event
 */
Router.prototype.handleHashChange = function() {
  var path = this.getCurrentPath();
  var match = this.match(path);
  
  if (match) {
    // Add to history if different from current
    if (this.history.length === 0 || this.history[this.history.length - 1] !== path) {
      this.history.push(path);
      
      // Limit history size
      if (this.history.length > this.maxHistorySize) {
        this.history.shift();
      }
    }
    
    this.currentRoute = match;
    
    // Call route handler
    if (match.route.handler) {
      match.route.handler(match.params, match.path);
    }
  } else {
    // No match found, could handle 404 here
    console.warn('No route found for path: ' + path);
  }
};

/**
 * Get current route information
 * @returns {Object|null}
 */
Router.prototype.getCurrentRoute = function() {
  return this.currentRoute;
};

/**
 * Get navigation history
 * @returns {Array<string>}
 */
Router.prototype.getHistory = function() {
  return this.history.slice(); // Return copy
};

/**
 * Clear navigation history
 */
Router.prototype.clearHistory = function() {
  this.history = [];
};

/**
 * Check if can go back
 * @returns {boolean}
 */
Router.prototype.canGoBack = function() {
  return this.history.length > 1;
};

/**
 * Find route by name
 * @param {string} name - Route name
 * @returns {Route|null}
 */
Router.prototype.findRouteByName = function(name) {
  for (var i = 0; i < this.routes.length; i++) {
    if (this.routes[i].name === name) {
      return this.routes[i];
    }
  }
  return null;
};

/**
 * Navigate to a named route
 * @param {string} name - Route name
 * @param {Object} params - Route parameters
 * @param {boolean} replace - Replace current history entry
 */
Router.prototype.navigateToRoute = function(name, params, replace) {
  var route = this.findRouteByName(name);
  
  if (!route) {
    console.error('Route not found: ' + name);
    return;
  }
  
  // Build path with parameters
  var path = route.path;
  
  if (params) {
    for (var key in params) {
      if (params.hasOwnProperty(key)) {
        path = path.replace(':' + key, params[key]);
      }
    }
  }
  
  this.navigate(path, replace);
};

// Export for use in other modules
export default Router;
