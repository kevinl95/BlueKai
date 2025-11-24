/**
 * Text Processing Utilities
 * Compatible with Gecko 48 (ES5)
 */

/**
 * @class TextProcessor
 * @description Provides text processing utilities for posts and content
 */
function TextProcessor() {
  // URL regex pattern
  this.urlPattern = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;
  
  // Mention pattern (@handle or @handle.domain)
  this.mentionPattern = /@([a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)*)/g;
  
  // Hashtag pattern
  this.hashtagPattern = /#([a-zA-Z0-9_]+)/g;
}

/**
 * Truncate text to a maximum length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} ellipsis - Ellipsis string (default: '...')
 * @returns {string} Truncated text
 */
TextProcessor.prototype.truncate = function(text, maxLength, ellipsis) {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  ellipsis = ellipsis || '...';
  
  if (text.length <= maxLength) {
    return text;
  }
  
  // Truncate and add ellipsis
  var truncated = text.substring(0, maxLength - ellipsis.length);
  
  // Try to break at word boundary
  var lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > maxLength * 0.8) {
    truncated = truncated.substring(0, lastSpace);
  }
  
  return truncated + ellipsis;
};

/**
 * Detect URLs in text
 * @param {string} text - Text to search
 * @returns {Array<Object>} Array of URL objects with url, start, end properties
 */
TextProcessor.prototype.detectUrls = function(text) {
  if (!text || typeof text !== 'string') {
    return [];
  }
  
  var urls = [];
  var regex = new RegExp(this.urlPattern);
  var match;
  
  while ((match = regex.exec(text)) !== null) {
    urls.push({
      url: match[0],
      start: match.index,
      end: match.index + match[0].length
    });
  }
  
  return urls;
};

/**
 * Linkify URLs in text (convert to HTML links)
 * @param {string} text - Text to linkify
 * @param {string} className - CSS class for links (optional)
 * @returns {string} HTML string with linkified URLs
 */
TextProcessor.prototype.linkify = function(text, className) {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  var classAttr = className ? ' class="' + this._escapeHtml(className) + '"' : '';
  
  return text.replace(this.urlPattern, function(url) {
    return '<a href="' + url + '"' + classAttr + ' target="_blank" rel="noopener noreferrer">' + 
           url + '</a>';
  });
};

/**
 * Detect mentions (@handle) in text
 * @param {string} text - Text to search
 * @returns {Array<Object>} Array of mention objects with handle, start, end properties
 */
TextProcessor.prototype.detectMentions = function(text) {
  if (!text || typeof text !== 'string') {
    return [];
  }
  
  var mentions = [];
  var regex = new RegExp(this.mentionPattern);
  var match;
  
  while ((match = regex.exec(text)) !== null) {
    mentions.push({
      handle: match[1],
      fullMatch: match[0],
      start: match.index,
      end: match.index + match[0].length
    });
  }
  
  return mentions;
};

/**
 * Detect hashtags in text
 * @param {string} text - Text to search
 * @returns {Array<Object>} Array of hashtag objects with tag, start, end properties
 */
TextProcessor.prototype.detectHashtags = function(text) {
  if (!text || typeof text !== 'string') {
    return [];
  }
  
  var hashtags = [];
  var regex = new RegExp(this.hashtagPattern);
  var match;
  
  while ((match = regex.exec(text)) !== null) {
    hashtags.push({
      tag: match[1],
      fullMatch: match[0],
      start: match.index,
      end: match.index + match[0].length
    });
  }
  
  return hashtags;
};

/**
 * Count characters in text, respecting Unicode
 * @param {string} text - Text to count
 * @returns {number} Character count
 */
TextProcessor.prototype.countCharacters = function(text) {
  if (!text || typeof text !== 'string') {
    return 0;
  }
  
  // Handle Unicode properly
  // In ES5, we can use Array.from polyfill or manual counting
  var count = 0;
  
  for (var i = 0; i < text.length; i++) {
    var code = text.charCodeAt(i);
    
    // Check for high surrogate (first part of surrogate pair)
    if (code >= 0xD800 && code <= 0xDBFF) {
      // Skip the low surrogate (second part)
      i++;
    }
    
    count++;
  }
  
  return count;
};

/**
 * Process text for display (linkify URLs and mentions)
 * @param {string} text - Text to process
 * @param {Object} options - Processing options
 * @returns {string} Processed HTML string
 */
TextProcessor.prototype.processForDisplay = function(text, options) {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  options = options || {};
  var linkifyUrls = options.linkifyUrls !== false;
  var linkifyMentions = options.linkifyMentions !== false;
  var linkifyHashtags = options.linkifyHashtags !== false;
  var escapeHtml = options.escapeHtml !== false;
  
  var processed = text;
  
  // Escape HTML first if needed
  if (escapeHtml) {
    processed = this._escapeHtml(processed);
  }
  
  // Linkify URLs
  if (linkifyUrls) {
    processed = this.linkify(processed, options.urlClass);
  }
  
  // Linkify mentions
  if (linkifyMentions) {
    var mentionClass = options.mentionClass ? ' class="' + options.mentionClass + '"' : '';
    processed = processed.replace(this.mentionPattern, function(match, handle) {
      return '<a href="#/profile/' + handle + '"' + mentionClass + '>' + match + '</a>';
    });
  }
  
  // Linkify hashtags
  if (linkifyHashtags) {
    var hashtagClass = options.hashtagClass ? ' class="' + options.hashtagClass + '"' : '';
    processed = processed.replace(this.hashtagPattern, function(match, tag) {
      return '<a href="#/search?q=' + encodeURIComponent(match) + '"' + hashtagClass + '>' + 
             match + '</a>';
    });
  }
  
  return processed;
};

/**
 * Extract plain text from HTML
 * @param {string} html - HTML string
 * @returns {string} Plain text
 */
TextProcessor.prototype.stripHtml = function(html) {
  if (!html || typeof html !== 'string') {
    return '';
  }
  
  // Simple HTML stripping (not perfect but works for basic cases)
  return html.replace(/<[^>]*>/g, '');
};

/**
 * Escape HTML special characters
 * @private
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
TextProcessor.prototype._escapeHtml = function(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  var map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, function(char) {
    return map[char];
  });
};

/**
 * Validate text length
 * @param {string} text - Text to validate
 * @param {number} maxLength - Maximum allowed length
 * @returns {Object} Validation result with valid, length, remaining properties
 */
TextProcessor.prototype.validateLength = function(text, maxLength) {
  var length = this.countCharacters(text);
  
  return {
    valid: length <= maxLength,
    length: length,
    remaining: maxLength - length,
    exceeded: Math.max(0, length - maxLength)
  };
};

/**
 * Split text into words
 * @param {string} text - Text to split
 * @returns {Array<string>} Array of words
 */
TextProcessor.prototype.splitWords = function(text) {
  if (!text || typeof text !== 'string') {
    return [];
  }
  
  // Split on whitespace and filter empty strings
  return text.split(/\s+/).filter(function(word) {
    return word.length > 0;
  });
};

/**
 * Get word count
 * @param {string} text - Text to count
 * @returns {number} Word count
 */
TextProcessor.prototype.countWords = function(text) {
  return this.splitWords(text).length;
};

/**
 * Highlight search terms in text
 * @param {string} text - Text to search in
 * @param {string} searchTerm - Term to highlight
 * @param {string} className - CSS class for highlights
 * @returns {string} HTML with highlighted terms
 */
TextProcessor.prototype.highlight = function(text, searchTerm, className) {
  if (!text || !searchTerm || typeof text !== 'string' || typeof searchTerm !== 'string') {
    return text || '';
  }
  
  var escaped = this._escapeHtml(text);
  var escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  var regex = new RegExp('(' + escapedTerm + ')', 'gi');
  var classAttr = className ? ' class="' + this._escapeHtml(className) + '"' : '';
  
  return escaped.replace(regex, '<mark' + classAttr + '>$1</mark>');
};

/**
 * Check if text contains only whitespace
 * @param {string} text - Text to check
 * @returns {boolean} True if only whitespace
 */
TextProcessor.prototype.isWhitespace = function(text) {
  if (!text || typeof text !== 'string') {
    return true;
  }
  
  return text.trim().length === 0;
};

/**
 * Normalize whitespace (collapse multiple spaces, trim)
 * @param {string} text - Text to normalize
 * @returns {string} Normalized text
 */
TextProcessor.prototype.normalizeWhitespace = function(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  return text.replace(/\s+/g, ' ').trim();
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TextProcessor;
}
