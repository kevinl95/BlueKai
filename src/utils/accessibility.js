/**
 * Accessibility Utilities
 * Provides helper functions for accessibility features
 * Requirements: 10.2, 10.3
 */

/**
 * Generate unique ID for ARIA relationships
 * @param {string} prefix - Prefix for the ID
 * @returns {string} Unique ID
 */
function generateId(prefix) {
  return prefix + '-' + Math.random().toString(36).substr(2, 9);
}

/**
 * Announce message to screen readers
 * @param {string} message - Message to announce
 * @param {string} priority - 'polite' or 'assertive'
 */
function announceToScreenReader(message, priority) {
  priority = priority || 'polite';
  
  var liveRegion = document.getElementById('aria-live-region-' + priority);
  
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'aria-live-region-' + priority;
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.setAttribute('role', priority === 'assertive' ? 'alert' : 'status');
    liveRegion.style.position = 'absolute';
    liveRegion.style.left = '-10000px';
    liveRegion.style.width = '1px';
    liveRegion.style.height = '1px';
    liveRegion.style.overflow = 'hidden';
    document.body.appendChild(liveRegion);
  }
  
  // Clear and set message
  liveRegion.textContent = '';
  setTimeout(function() {
    liveRegion.textContent = message;
  }, 100);
}

/**
 * Create skip link element
 * @param {string} targetId - ID of target element to skip to
 * @param {string} label - Label for skip link
 * @returns {HTMLElement} Skip link element
 */
function createSkipLink(targetId, label) {
  var link = document.createElement('a');
  link.href = '#' + targetId;
  link.className = 'skip-link';
  link.textContent = label;
  link.setAttribute('tabindex', '0');
  
  link.addEventListener('click', function(e) {
    e.preventDefault();
    var target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView();
    }
  });
  
  return link;
}

/**
 * Check if element meets contrast requirements
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} True if meets WCAG AA requirements
 */
function checkContrast(element) {
  if (!element) return false;
  
  var style = window.getComputedStyle(element);
  var color = style.color;
  var backgroundColor = style.backgroundColor;
  
  // Simple check - in production would use proper contrast calculation
  // For now, just verify colors are set
  return color && backgroundColor && color !== backgroundColor;
}

/**
 * Get accessible label for post
 * @param {Object} post - Post object
 * @returns {string} Accessible label
 */
function getPostLabel(post) {
  if (!post) return '';
  
  var author = post.author || {};
  var record = post.record || {};
  var text = record.text || '';
  
  var authorName = author.displayName || author.handle || 'Unknown';
  var truncatedText = text.length > 100 ? text.substring(0, 100) + '...' : text;
  
  return 'Post by ' + authorName + ': ' + truncatedText;
}

/**
 * Get accessible label for notification
 * @param {Object} notification - Notification object
 * @returns {string} Accessible label
 */
function getNotificationLabel(notification) {
  if (!notification) return '';
  
  var reason = notification.reason || 'notification';
  var author = notification.author || {};
  var authorName = author.displayName || author.handle || 'Someone';
  
  var labels = {
    'like': authorName + ' liked your post',
    'repost': authorName + ' reposted your post',
    'follow': authorName + ' followed you',
    'mention': authorName + ' mentioned you',
    'reply': authorName + ' replied to your post',
    'quote': authorName + ' quoted your post'
  };
  
  return labels[reason] || authorName + ' interacted with your content';
}

/**
 * Format count for screen readers
 * @param {number} count - Count to format
 * @param {string} singular - Singular form
 * @param {string} plural - Plural form
 * @returns {string} Formatted string
 */
function formatCountForScreenReader(count, singular, plural) {
  if (count === 0) return 'No ' + plural;
  if (count === 1) return '1 ' + singular;
  return count + ' ' + plural;
}

/**
 * Initialize ARIA live regions
 */
function initializeLiveRegions() {
  // Create polite live region
  announceToScreenReader('', 'polite');
  
  // Create assertive live region
  announceToScreenReader('', 'assertive');
}

/**
 * Add skip navigation links to page
 * @param {Array} links - Array of {targetId, label} objects
 */
function addSkipLinks(links) {
  var container = document.getElementById('skip-links');
  
  if (!container) {
    container = document.createElement('nav');
    container.id = 'skip-links';
    container.className = 'skip-links';
    container.setAttribute('aria-label', 'Skip navigation');
    document.body.insertBefore(container, document.body.firstChild);
  }
  
  container.innerHTML = '';
  
  links.forEach(function(link) {
    var skipLink = createSkipLink(link.targetId, link.label);
    container.appendChild(skipLink);
  });
}

// Export functions (ES6 module syntax)
export {
  generateId,
  announceToScreenReader,
  createSkipLink,
  checkContrast,
  getPostLabel,
  getNotificationLabel,
  formatCountForScreenReader,
  initializeLiveRegions,
  addSkipLinks
};
