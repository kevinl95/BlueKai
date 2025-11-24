/**
 * NavigationManager - Handles D-pad and softkey navigation for KaiOS
 * Provides focus management with circular navigation
 */

/**
 * @typedef {Object} NavigationOptions
 * @property {Function} onSelect - Callback when Enter is pressed
 * @property {Function} onSoftLeft - Callback for left softkey
 * @property {Function} onSoftRight - Callback for right softkey
 * @property {boolean} circular - Enable circular navigation (default: true)
 * @property {string} focusClass - CSS class for focused elements (default: 'focused')
 */

function NavigationManager(options) {
  this.options = Object.assign({
    onSelect: null,
    onSoftLeft: null,
    onSoftRight: null,
    circular: true,
    focusClass: 'focused'
  }, options || {});

  this.focusableElements = [];
  this.currentIndex = -1;
  this.isActive = false;
  
  // Bind methods to maintain context
  this.handleKeyDown = this.handleKeyDown.bind(this);
}

/**
 * Initialize the navigation manager and start listening for key events
 */
NavigationManager.prototype.init = function() {
  if (this.isActive) {
    return;
  }
  
  this.isActive = true;
  document.addEventListener('keydown', this.handleKeyDown);
};

/**
 * Destroy the navigation manager and clean up event listeners
 */
NavigationManager.prototype.destroy = function() {
  if (!this.isActive) {
    return;
  }
  
  this.isActive = false;
  document.removeEventListener('keydown', this.handleKeyDown);
  this.clearFocus();
  this.focusableElements = [];
  this.currentIndex = -1;
};

/**
 * Update the list of focusable elements
 * @param {Array<HTMLElement>|NodeList} elements - Elements that can receive focus
 */
NavigationManager.prototype.updateFocusableElements = function(elements) {
  // Clear current focus
  this.clearFocus();
  
  // Convert NodeList to Array if needed
  this.focusableElements = Array.prototype.slice.call(elements);
  
  // Set focus to first element if available
  if (this.focusableElements.length > 0) {
    this.currentIndex = 0;
    this.applyFocus();
  } else {
    this.currentIndex = -1;
  }
};

/**
 * Handle keyboard events for navigation
 * @param {KeyboardEvent} event
 */
NavigationManager.prototype.handleKeyDown = function(event) {
  if (!this.isActive || this.focusableElements.length === 0) {
    return;
  }

  var key = event.key;
  var handled = false;

  switch (key) {
    case 'ArrowUp':
      this.moveFocus(-1);
      handled = true;
      break;
    
    case 'ArrowDown':
      this.moveFocus(1);
      handled = true;
      break;
    
    case 'ArrowLeft':
      // Can be used for horizontal navigation or custom behavior
      this.moveFocus(-1);
      handled = true;
      break;
    
    case 'ArrowRight':
      // Can be used for horizontal navigation or custom behavior
      this.moveFocus(1);
      handled = true;
      break;
    
    case 'Enter':
      this.handleSelect();
      handled = true;
      break;
    
    case 'SoftLeft':
      this.handleSoftLeft();
      handled = true;
      break;
    
    case 'SoftRight':
      this.handleSoftRight();
      handled = true;
      break;
    
    // KaiOS specific softkey codes
    case 'F1':
      this.handleSoftLeft();
      handled = true;
      break;
    
    case 'F2':
      this.handleSoftRight();
      handled = true;
      break;
  }

  if (handled) {
    event.preventDefault();
    event.stopPropagation();
  }
};

/**
 * Move focus in the specified direction
 * @param {number} direction - 1 for forward, -1 for backward
 */
NavigationManager.prototype.moveFocus = function(direction) {
  if (this.focusableElements.length === 0) {
    return;
  }

  // Clear current focus
  this.clearFocus();

  // Calculate new index
  var newIndex = this.currentIndex + direction;

  // Handle circular navigation
  if (this.options.circular) {
    if (newIndex < 0) {
      newIndex = this.focusableElements.length - 1;
    } else if (newIndex >= this.focusableElements.length) {
      newIndex = 0;
    }
  } else {
    // Clamp to valid range
    if (newIndex < 0) {
      newIndex = 0;
    } else if (newIndex >= this.focusableElements.length) {
      newIndex = this.focusableElements.length - 1;
    }
  }

  this.currentIndex = newIndex;
  this.applyFocus();
};

/**
 * Apply focus to the current element
 */
NavigationManager.prototype.applyFocus = function() {
  if (this.currentIndex >= 0 && this.currentIndex < this.focusableElements.length) {
    var element = this.focusableElements[this.currentIndex];
    element.classList.add(this.options.focusClass);
    
    // Scroll element into view if needed
    if (element.scrollIntoView) {
      element.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }
};

/**
 * Clear focus from the current element
 */
NavigationManager.prototype.clearFocus = function() {
  if (this.currentIndex >= 0 && this.currentIndex < this.focusableElements.length) {
    var element = this.focusableElements[this.currentIndex];
    element.classList.remove(this.options.focusClass);
  }
};

/**
 * Get the currently focused element
 * @returns {HTMLElement|null}
 */
NavigationManager.prototype.getFocusedElement = function() {
  if (this.currentIndex >= 0 && this.currentIndex < this.focusableElements.length) {
    return this.focusableElements[this.currentIndex];
  }
  return null;
};

/**
 * Get the index of the currently focused element
 * @returns {number}
 */
NavigationManager.prototype.getFocusedIndex = function() {
  return this.currentIndex;
};

/**
 * Set focus to a specific index
 * @param {number} index
 */
NavigationManager.prototype.setFocusIndex = function(index) {
  if (index < 0 || index >= this.focusableElements.length) {
    return;
  }
  
  this.clearFocus();
  this.currentIndex = index;
  this.applyFocus();
};

/**
 * Handle Enter key press (selection)
 */
NavigationManager.prototype.handleSelect = function() {
  var element = this.getFocusedElement();
  
  if (element && this.options.onSelect) {
    this.options.onSelect(element, this.currentIndex);
  }
};

/**
 * Handle left softkey press
 */
NavigationManager.prototype.handleSoftLeft = function() {
  if (this.options.onSoftLeft) {
    this.options.onSoftLeft();
  }
};

/**
 * Handle right softkey press
 */
NavigationManager.prototype.handleSoftRight = function() {
  if (this.options.onSoftRight) {
    this.options.onSoftRight();
  }
};

/**
 * Update softkey callbacks
 * @param {Object} callbacks
 * @param {Function} callbacks.onSoftLeft
 * @param {Function} callbacks.onSoftRight
 */
NavigationManager.prototype.updateSoftkeys = function(callbacks) {
  if (callbacks.onSoftLeft !== undefined) {
    this.options.onSoftLeft = callbacks.onSoftLeft;
  }
  if (callbacks.onSoftRight !== undefined) {
    this.options.onSoftRight = callbacks.onSoftRight;
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NavigationManager;
}
