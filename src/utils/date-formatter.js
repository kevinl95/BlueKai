/**
 * Date Formatting Utilities
 * Compatible with Gecko 48 (ES5)
 */

/**
 * @class DateFormatter
 * @description Provides date formatting utilities including relative time
 */
function DateFormatter() {
  // Locale can be set, defaults to 'en'
  this.locale = 'en';
}

/**
 * Set the locale for formatting
 * @param {string} locale - Locale code (e.g., 'en', 'es', 'fr', 'pt')
 */
DateFormatter.prototype.setLocale = function(locale) {
  this.locale = locale || 'en';
};

/**
 * Parse a timestamp string or number into a Date object
 * @param {string|number|Date} timestamp - ISO string, Unix timestamp, or Date object
 * @returns {Date|null} Date object or null if invalid
 */
DateFormatter.prototype.parseTimestamp = function(timestamp) {
  try {
    if (timestamp instanceof Date) {
      return isNaN(timestamp.getTime()) ? null : timestamp;
    }
    
    if (typeof timestamp === 'number') {
      var date = new Date(timestamp);
      return isNaN(date.getTime()) ? null : date;
    }
    
    if (typeof timestamp === 'string') {
      var date = new Date(timestamp);
      return isNaN(date.getTime()) ? null : date;
    }
    
    return null;
  } catch (error) {
    console.error('DateFormatter.parseTimestamp error:', error);
    return null;
  }
};

/**
 * Format a date as relative time (e.g., "2h ago", "3d ago")
 * @param {string|number|Date} timestamp - Timestamp to format
 * @param {Date} now - Current time (optional, defaults to now)
 * @returns {string} Formatted relative time string
 */
DateFormatter.prototype.formatRelative = function(timestamp, now) {
  var date = this.parseTimestamp(timestamp);
  if (!date) {
    return 'Invalid date';
  }
  
  var currentTime = now || new Date();
  var diffMs = currentTime.getTime() - date.getTime();
  var diffSeconds = Math.floor(diffMs / 1000);
  
  // Future dates
  if (diffSeconds < 0) {
    return 'in the future';
  }
  
  // Less than a minute
  if (diffSeconds < 60) {
    return this._getTranslation('now');
  }
  
  // Minutes
  var diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return diffMinutes + this._getTranslation('m');
  }
  
  // Hours
  var diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return diffHours + this._getTranslation('h');
  }
  
  // Days
  var diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return diffDays + this._getTranslation('d');
  }
  
  // Weeks
  var diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) {
    return diffWeeks + this._getTranslation('w');
  }
  
  // Months (approximate)
  var diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    return diffMonths + this._getTranslation('mo');
  }
  
  // Years
  var diffYears = Math.floor(diffDays / 365);
  return diffYears + this._getTranslation('y');
};

/**
 * Format a date in locale-aware format
 * @param {string|number|Date} timestamp - Timestamp to format
 * @param {string} format - Format type: 'short', 'medium', 'long', 'full'
 * @returns {string} Formatted date string
 */
DateFormatter.prototype.formatDate = function(timestamp, format) {
  var date = this.parseTimestamp(timestamp);
  if (!date) {
    return 'Invalid date';
  }
  
  format = format || 'medium';
  
  try {
    // Try to use toLocaleDateString if available
    if (date.toLocaleDateString) {
      var options = this._getDateFormatOptions(format);
      return date.toLocaleDateString(this.locale, options);
    }
  } catch (error) {
    // Fallback to manual formatting
  }
  
  // Manual fallback formatting
  return this._formatDateManual(date, format);
};

/**
 * Format a time in locale-aware format
 * @param {string|number|Date} timestamp - Timestamp to format
 * @param {boolean} includeSeconds - Include seconds in output
 * @returns {string} Formatted time string
 */
DateFormatter.prototype.formatTime = function(timestamp, includeSeconds) {
  var date = this.parseTimestamp(timestamp);
  if (!date) {
    return 'Invalid time';
  }
  
  try {
    // Try to use toLocaleTimeString if available
    if (date.toLocaleTimeString) {
      var options = {
        hour: '2-digit',
        minute: '2-digit'
      };
      if (includeSeconds) {
        options.second = '2-digit';
      }
      return date.toLocaleTimeString(this.locale, options);
    }
  } catch (error) {
    // Fallback to manual formatting
  }
  
  // Manual fallback formatting
  return this._formatTimeManual(date, includeSeconds);
};

/**
 * Format a date and time together
 * @param {string|number|Date} timestamp - Timestamp to format
 * @param {string} format - Format type: 'short', 'medium', 'long'
 * @returns {string} Formatted date and time string
 */
DateFormatter.prototype.formatDateTime = function(timestamp, format) {
  var date = this.parseTimestamp(timestamp);
  if (!date) {
    return 'Invalid date';
  }
  
  format = format || 'medium';
  
  var dateStr = this.formatDate(timestamp, format);
  var timeStr = this.formatTime(timestamp, false);
  
  return dateStr + ' ' + timeStr;
};

/**
 * Get translation for relative time units
 * @private
 */
DateFormatter.prototype._getTranslation = function(key) {
  var translations = {
    'en': {
      'now': 'now',
      'm': 'm',
      'h': 'h',
      'd': 'd',
      'w': 'w',
      'mo': 'mo',
      'y': 'y'
    },
    'es': {
      'now': 'ahora',
      'm': 'm',
      'h': 'h',
      'd': 'd',
      'w': 'sem',
      'mo': 'mes',
      'y': 'a'
    },
    'fr': {
      'now': 'maintenant',
      'm': 'm',
      'h': 'h',
      'd': 'j',
      'w': 'sem',
      'mo': 'mois',
      'y': 'an'
    },
    'pt': {
      'now': 'agora',
      'm': 'm',
      'h': 'h',
      'd': 'd',
      'w': 'sem',
      'mo': 'mês',
      'y': 'a'
    }
  };
  
  var localeTranslations = translations[this.locale] || translations['en'];
  return localeTranslations[key] || translations['en'][key];
};

/**
 * Get date format options for toLocaleDateString
 * @private
 */
DateFormatter.prototype._getDateFormatOptions = function(format) {
  var options = {};
  
  switch (format) {
    case 'short':
      options = { year: 'numeric', month: 'numeric', day: 'numeric' };
      break;
    case 'medium':
      options = { year: 'numeric', month: 'short', day: 'numeric' };
      break;
    case 'long':
      options = { year: 'numeric', month: 'long', day: 'numeric' };
      break;
    case 'full':
      options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      break;
    default:
      options = { year: 'numeric', month: 'short', day: 'numeric' };
  }
  
  return options;
};

/**
 * Manual date formatting fallback
 * @private
 */
DateFormatter.prototype._formatDateManual = function(date, format) {
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  var year = date.getFullYear();
  var month = months[date.getMonth()];
  var day = date.getDate();
  
  if (format === 'short') {
    return (date.getMonth() + 1) + '/' + day + '/' + year;
  }
  
  return month + ' ' + day + ', ' + year;
};

/**
 * Manual time formatting fallback
 * @private
 */
DateFormatter.prototype._formatTimeManual = function(date, includeSeconds) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var seconds = date.getSeconds();
  
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  
  var minutesStr = minutes < 10 ? '0' + minutes : minutes;
  var timeStr = hours + ':' + minutesStr;
  
  if (includeSeconds) {
    var secondsStr = seconds < 10 ? '0' + seconds : seconds;
    timeStr += ':' + secondsStr;
  }
  
  return timeStr + ' ' + ampm;
};

/**
 * Check if a date is today
 * @param {string|number|Date} timestamp - Timestamp to check
 * @returns {boolean} True if date is today
 */
DateFormatter.prototype.isToday = function(timestamp) {
  var date = this.parseTimestamp(timestamp);
  if (!date) {
    return false;
  }
  
  var today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
};

/**
 * Check if a date is yesterday
 * @param {string|number|Date} timestamp - Timestamp to check
 * @returns {boolean} True if date is yesterday
 */
DateFormatter.prototype.isYesterday = function(timestamp) {
  var date = this.parseTimestamp(timestamp);
  if (!date) {
    return false;
  }
  
  var yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  return date.getDate() === yesterday.getDate() &&
         date.getMonth() === yesterday.getMonth() &&
         date.getFullYear() === yesterday.getFullYear();
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DateFormatter;
}
