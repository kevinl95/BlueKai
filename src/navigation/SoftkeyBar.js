/**
 * SoftkeyBar - Displays softkey labels for KaiOS navigation
 * Shows left, center, and right softkey actions at the bottom of the screen
 */

import './SoftkeyBar.css';

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

  var handleLeftClick = function(e) {
    e.preventDefault();
    if (left.action) {
      left.action();
    }
  };

  var handleCenterClick = function(e) {
    e.preventDefault();
    if (center.action) {
      center.action();
    }
  };

  var handleRightClick = function(e) {
    e.preventDefault();
    if (right.action) {
      right.action();
    }
  };

  return h('nav', { 
    className: 'softkey-bar',
    role: 'navigation',
    'aria-label': 'Softkey navigation'
  },
    h('button', { 
      className: 'softkey-left' + (left.action ? ' softkey-clickable' : ''),
      onClick: handleLeftClick,
      disabled: !left.action,
      'aria-label': left.label ? 'Left softkey: ' + left.label : 'Left softkey',
      type: 'button'
    },
      left.label || ''
    ),
    h('button', { 
      className: 'softkey-center' + (center.action ? ' softkey-clickable' : ''),
      onClick: handleCenterClick,
      disabled: !center.action,
      'aria-label': center.label ? 'Center softkey: ' + center.label : 'Center softkey',
      type: 'button'
    },
      center.label || ''
    ),
    h('button', { 
      className: 'softkey-right' + (right.action ? ' softkey-clickable' : ''),
      onClick: handleRightClick,
      disabled: !right.action,
      'aria-label': right.label ? 'Right softkey: ' + right.label : 'Right softkey',
      type: 'button'
    },
      right.label || ''
    )
  );
}

// Export
export default SoftkeyBar;
