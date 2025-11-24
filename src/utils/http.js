/**
 * XMLHttpRequest wrapper that returns Promises
 * Compatible with Gecko 48 (no Fetch API available)
 */

/**
 * Makes an HTTP request using XMLHttpRequest
 * @param {Object} options - Request options
 * @param {string} options.url - Request URL
 * @param {string} options.method - HTTP method (GET, POST, PUT, DELETE)
 * @param {Object} options.headers - Request headers
 * @param {*} options.body - Request body (will be JSON stringified if object)
 * @param {number} options.timeout - Request timeout in milliseconds (default: 30000)
 * @returns {Promise} Promise that resolves with response data
 */
function request(options) {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    var method = options.method || 'GET';
    var url = options.url;
    var headers = options.headers || {};
    var body = options.body;
    var timeout = options.timeout || 30000;

    // Open the request
    xhr.open(method, url, true);

    // Set timeout
    xhr.timeout = timeout;

    // Set headers
    for (var key in headers) {
      if (headers.hasOwnProperty(key)) {
        xhr.setRequestHeader(key, headers[key]);
      }
    }

    // Handle successful response
    xhr.onload = function() {
      var response = {
        status: xhr.status,
        statusText: xhr.statusText,
        headers: parseHeaders(xhr.getAllResponseHeaders()),
        data: null
      };

      // Parse response based on content type
      var contentType = xhr.getResponseHeader('Content-Type') || '';
      if (contentType.indexOf('application/json') !== -1) {
        try {
          response.data = JSON.parse(xhr.responseText);
        } catch (e) {
          response.data = xhr.responseText;
        }
      } else {
        response.data = xhr.responseText;
      }

      // Resolve or reject based on status code
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(response);
      } else {
        reject(response);
      }
    };

    // Handle network errors
    xhr.onerror = function() {
      reject({
        status: 0,
        statusText: 'Network Error',
        headers: {},
        data: null,
        error: 'NetworkError'
      });
    };

    // Handle timeout
    xhr.ontimeout = function() {
      reject({
        status: 0,
        statusText: 'Request Timeout',
        headers: {},
        data: null,
        error: 'TimeoutError'
      });
    };

    // Handle abort
    xhr.onabort = function() {
      reject({
        status: 0,
        statusText: 'Request Aborted',
        headers: {},
        data: null,
        error: 'AbortError'
      });
    };

    // Send the request
    if (body !== undefined && body !== null) {
      if (typeof body === 'object' && !(body instanceof FormData)) {
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(body));
      } else {
        xhr.send(body);
      }
    } else {
      xhr.send();
    }
  });
}

/**
 * Parse response headers string into object
 * @param {string} headerStr - Raw header string
 * @returns {Object} Parsed headers object
 */
function parseHeaders(headerStr) {
  var headers = {};
  if (!headerStr) {
    return headers;
  }

  var headerPairs = headerStr.split('\r\n');
  for (var i = 0; i < headerPairs.length; i++) {
    var headerPair = headerPairs[i];
    var index = headerPair.indexOf(': ');
    if (index > 0) {
      var key = headerPair.substring(0, index).toLowerCase();
      var val = headerPair.substring(index + 2);
      headers[key] = val;
    }
  }

  return headers;
}

/**
 * Convenience method for GET requests
 * @param {string} url - Request URL
 * @param {Object} options - Additional options
 * @returns {Promise} Promise that resolves with response data
 */
function get(url, options) {
  return request(Object.assign({}, options, {
    url: url,
    method: 'GET'
  }));
}

/**
 * Convenience method for POST requests
 * @param {string} url - Request URL
 * @param {*} body - Request body
 * @param {Object} options - Additional options
 * @returns {Promise} Promise that resolves with response data
 */
function post(url, body, options) {
  return request(Object.assign({}, options, {
    url: url,
    method: 'POST',
    body: body
  }));
}

/**
 * Convenience method for PUT requests
 * @param {string} url - Request URL
 * @param {*} body - Request body
 * @param {Object} options - Additional options
 * @returns {Promise} Promise that resolves with response data
 */
function put(url, body, options) {
  return request(Object.assign({}, options, {
    url: url,
    method: 'PUT',
    body: body
  }));
}

/**
 * Convenience method for DELETE requests
 * @param {string} url - Request URL
 * @param {Object} options - Additional options
 * @returns {Promise} Promise that resolves with response data
 */
function del(url, options) {
  return request(Object.assign({}, options, {
    url: url,
    method: 'DELETE'
  }));
}

// Export the HTTP client
export default {
  request: request,
  get: get,
  post: post,
  put: put,
  delete: del
};
