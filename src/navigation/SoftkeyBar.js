/**
 * SoftkeyBar - Displays softkey labels for KaiOS navigation
 * Shows left, center, and right softkey actions at the bottom of the screen
 */

var h = require('preact').h;
var Component = require('preact').Component;

/**
 * @typedef {Object} SoftkeyConfig
 * @property {string} label - Label to display
 * @property {Function} action - Function to call when pressed
 */

/**
 * SoftkeyBar Component
 * @param {Object} props
 * @param {SoftkeyConfig} props.left - Left softkey configuration
 * @param {SoftkeyConfig} props.center - Center softkey configuration
 * @param {SoftkeyConfig} props.right - Right softkey configuration
 */
function SoftkeyBar(props) {
  var left = props.left || {};
  var center = props.center || {};
  var right = props.right || {};

  return h('div', { className: 'softkey-bar' },
    h('div', { className: 'softkey-left' },
      left.label || ''
    ),
    h('div', { className: 'softkey-center' },
      center.label || ''
    ),
    h('div', { className: 'softkey-right' },
      right.label || ''
    )
  );
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SoftkeyBar;
}
