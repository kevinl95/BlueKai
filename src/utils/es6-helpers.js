/**
 * ES6 feature helpers for Gecko 48 compatibility
 * Provides alternatives for template literals, destructuring, and other ES6 features
 */

/**
 * Template string helper - alternative to template literals
 * Usage: template('Hello {name}!', { name: 'World' })
 * @param {string} str - Template string with {key} placeholders
 * @param {Object} data - Data object with values
 * @returns {string} Interpolated string
 */
function template(str, data) {
  return str.replace(/\{(\w+)\}/g, function(match, key) {
    return data.hasOwnProperty(key) ? data[key] : match;
  });
}

/**
 * String formatting helper - sprintf-like functionality
 * Usage: format('Hello %s, you have %d messages', 'John', 5)
 * @param {string} str - Format string with %s (string) and %d (number) placeholders
 * @param {...*} args - Values to interpolate
 * @returns {string} Formatted string
 */
function format(str) {
  var args = Array.prototype.slice.call(arguments, 1);
  var index = 0;
  
  return str.replace(/%[sd]/g, function(match) {
    var arg = args[index++];
    if (match === '%s') {
      return String(arg);
    } else if (match === '%d') {
      return Number(arg);
    }
    return match;
  });
}

/**
 * Object destructuring helper - extract properties from object
 * Usage: var result = pick(obj, ['name', 'age'])
 * @param {Object} obj - Source object
 * @param {Array<string>} keys - Keys to extract
 * @returns {Object} New object with selected keys
 */
function pick(obj, keys) {
  var result = {};
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (obj.hasOwnProperty(key)) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * Object destructuring helper - extract all properties except specified ones
 * Usage: var result = omit(obj, ['password', 'secret'])
 * @param {Object} obj - Source object
 * @param {Array<string>} keys - Keys to exclude
 * @returns {Object} New object without specified keys
 */
function omit(obj, keys) {
  var result = {};
  for (var key in obj) {
    if (obj.hasOwnProperty(key) && keys.indexOf(key) === -1) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * Array destructuring helper - extract values from array
 * Usage: var result = slice(arr, 0, 2) // Get first 2 elements
 * @param {Array} arr - Source array
 * @param {number} start - Start index
 * @param {number} end - End index (optional)
 * @returns {Array} New array with selected elements
 */
function slice(arr, start, end) {
  return Array.prototype.slice.call(arr, start, end);
}

/**
 * Default parameter helper
 * Usage: var value = defaults(userValue, 'default')
 * @param {*} value - User provided value
 * @param {*} defaultValue - Default value if user value is undefined
 * @returns {*} Value or default
 */
function defaults(value, defaultValue) {
  return value !== undefined ? value : defaultValue;
}

/**
 * Spread operator helper for objects - merge multiple objects
 * Usage: var merged = extend({}, obj1, obj2, obj3)
 * @param {Object} target - Target object
 * @param {...Object} sources - Source objects to merge
 * @returns {Object} Merged object
 */
function extend(target) {
  var sources = Array.prototype.slice.call(arguments, 1);
  for (var i = 0; i < sources.length; i++) {
    var source = sources[i];
    if (source) {
      for (var key in source) {
        if (source.hasOwnProperty(key)) {
          target[key] = source[key];
        }
      }
    }
  }
  return target;
}

/**
 * Spread operator helper for arrays - concatenate arrays
 * Usage: var combined = concat(arr1, arr2, arr3)
 * @param {...Array} arrays - Arrays to concatenate
 * @returns {Array} Combined array
 */
function concat() {
  var result = [];
  for (var i = 0; i < arguments.length; i++) {
    var arr = arguments[i];
    if (Array.isArray(arr)) {
      for (var j = 0; j < arr.length; j++) {
        result.push(arr[j]);
      }
    } else {
      result.push(arr);
    }
  }
  return result;
}

/**
 * Rest parameters helper - collect remaining arguments
 * Usage: function myFunc(first, second) { var rest = rest(arguments, 2); }
 * @param {Arguments|Array} args - Arguments object or array
 * @param {number} start - Start index for rest parameters
 * @returns {Array} Array of remaining arguments
 */
function rest(args, start) {
  return Array.prototype.slice.call(args, start || 0);
}

/**
 * Arrow function helper - bind context
 * Usage: var bound = bind(fn, context)
 * @param {Function} fn - Function to bind
 * @param {Object} context - Context to bind to
 * @returns {Function} Bound function
 */
function bind(fn, context) {
  return function() {
    return fn.apply(context, arguments);
  };
}

/**
 * Class inheritance helper
 * Usage: inherit(Child, Parent)
 * @param {Function} child - Child constructor
 * @param {Function} parent - Parent constructor
 */
function inherit(child, parent) {
  child.prototype = Object.create(parent.prototype);
  child.prototype.constructor = child;
  child.super = parent;
}

/**
 * Deep clone helper - create deep copy of object
 * @param {*} obj - Object to clone
 * @returns {*} Cloned object
 */
function clone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }

  if (obj instanceof Array) {
    var arrCopy = [];
    for (var i = 0; i < obj.length; i++) {
      arrCopy[i] = clone(obj[i]);
    }
    return arrCopy;
  }

  if (obj instanceof Object) {
    var objCopy = {};
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        objCopy[key] = clone(obj[key]);
      }
    }
    return objCopy;
  }

  throw new Error('Unable to clone object');
}

// Export all helpers
export default {
  template: template,
  format: format,
  pick: pick,
  omit: omit,
  slice: slice,
  defaults: defaults,
  extend: extend,
  concat: concat,
  rest: rest,
  bind: bind,
  inherit: inherit,
  clone: clone
};
