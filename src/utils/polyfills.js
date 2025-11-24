/**
 * Polyfills for Gecko 48 (Firefox 48) compatibility
 * Provides Promise, Object.assign, and Array methods
 */

// Promise polyfill (minimal implementation)
if (typeof Promise === 'undefined') {
  window.Promise = (function() {
    function Promise(executor) {
      var self = this;
      self.state = 'pending';
      self.value = undefined;
      self.handlers = [];

      function resolve(value) {
        if (self.state !== 'pending') return;
        self.state = 'fulfilled';
        self.value = value;
        self.handlers.forEach(handle);
        self.handlers = null;
      }

      function reject(reason) {
        if (self.state !== 'pending') return;
        self.state = 'rejected';
        self.value = reason;
        self.handlers.forEach(handle);
        self.handlers = null;
      }

      function handle(handler) {
        if (self.state === 'pending') {
          self.handlers.push(handler);
        } else {
          if (self.state === 'fulfilled' && typeof handler.onFulfilled === 'function') {
            handler.onFulfilled(self.value);
          }
          if (self.state === 'rejected' && typeof handler.onRejected === 'function') {
            handler.onRejected(self.value);
          }
        }
      }

      self.then = function(onFulfilled, onRejected) {
        return new Promise(function(resolve, reject) {
          handle({
            onFulfilled: function(value) {
              if (typeof onFulfilled === 'function') {
                try {
                  resolve(onFulfilled(value));
                } catch (err) {
                  reject(err);
                }
              } else {
                resolve(value);
              }
            },
            onRejected: function(reason) {
              if (typeof onRejected === 'function') {
                try {
                  resolve(onRejected(reason));
                } catch (err) {
                  reject(err);
                }
              } else {
                reject(reason);
              }
            }
          });
        });
      };

      self.catch = function(onRejected) {
        return self.then(null, onRejected);
      };

      try {
        executor(resolve, reject);
      } catch (err) {
        reject(err);
      }
    }

    Promise.resolve = function(value) {
      return new Promise(function(resolve) {
        resolve(value);
      });
    };

    Promise.reject = function(reason) {
      return new Promise(function(resolve, reject) {
        reject(reason);
      });
    };

    Promise.all = function(promises) {
      return new Promise(function(resolve, reject) {
        var results = [];
        var remaining = promises.length;

        if (remaining === 0) {
          resolve(results);
          return;
        }

        function resolver(index) {
          return function(value) {
            results[index] = value;
            remaining--;
            if (remaining === 0) {
              resolve(results);
            }
          };
        }

        for (var i = 0; i < promises.length; i++) {
          Promise.resolve(promises[i]).then(resolver(i), reject);
        }
      });
    };

    return Promise;
  })();
}

// Object.assign polyfill
if (typeof Object.assign !== 'function') {
  Object.assign = function(target) {
    if (target == null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }

    var to = Object(target);

    for (var index = 1; index < arguments.length; index++) {
      var nextSource = arguments[index];

      if (nextSource != null) {
        for (var nextKey in nextSource) {
          if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
    }
    return to;
  };
}

// Array.prototype.find polyfill
if (!Array.prototype.find) {
  Array.prototype.find = function(predicate) {
    if (this == null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];

    for (var i = 0; i < length; i++) {
      var value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}

// Array.prototype.findIndex polyfill
if (!Array.prototype.findIndex) {
  Array.prototype.findIndex = function(predicate) {
    if (this == null) {
      throw new TypeError('Array.prototype.findIndex called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];

    for (var i = 0; i < length; i++) {
      if (predicate.call(thisArg, list[i], i, list)) {
        return i;
      }
    }
    return -1;
  };
}

// Array.prototype.includes polyfill
if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement) {
    if (this == null) {
      throw new TypeError('Array.prototype.includes called on null or undefined');
    }

    var O = Object(this);
    var len = parseInt(O.length, 10) || 0;
    if (len === 0) {
      return false;
    }

    var n = parseInt(arguments[1], 10) || 0;
    var k;
    if (n >= 0) {
      k = n;
    } else {
      k = len + n;
      if (k < 0) {
        k = 0;
      }
    }

    while (k < len) {
      var currentElement = O[k];
      if (searchElement === currentElement ||
         (searchElement !== searchElement && currentElement !== currentElement)) {
        return true;
      }
      k++;
    }
    return false;
  };
}

// Array.from polyfill
if (!Array.from) {
  Array.from = function(arrayLike) {
    var items = Object(arrayLike);
    if (arrayLike == null) {
      throw new TypeError('Array.from requires an array-like object');
    }

    var len = items.length >>> 0;
    var A = new Array(len);

    for (var k = 0; k < len; k++) {
      A[k] = items[k];
    }

    return A;
  };
}

// String.prototype.startsWith polyfill
if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(search, pos) {
    pos = !pos || pos < 0 ? 0 : +pos;
    return this.substring(pos, pos + search.length) === search;
  };
}

// String.prototype.endsWith polyfill
if (!String.prototype.endsWith) {
  String.prototype.endsWith = function(search, this_len) {
    if (this_len === undefined || this_len > this.length) {
      this_len = this.length;
    }
    return this.substring(this_len - search.length, this_len) === search;
  };
}

// String.prototype.includes polyfill
if (!String.prototype.includes) {
  String.prototype.includes = function(search, start) {
    if (typeof start !== 'number') {
      start = 0;
    }

    if (start + search.length > this.length) {
      return false;
    } else {
      return this.indexOf(search, start) !== -1;
    }
  };
}
