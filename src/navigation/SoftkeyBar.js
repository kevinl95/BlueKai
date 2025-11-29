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
    h('div', { 
      className: 'softkey-left' + (left.action && left.label ? ' softkey-clickable' : ''),
      onClick: left.action && left.label ? handleLeftClick : null,
      role: left.label ? 'button' : 'presentation',
      'aria-label': left.label ? 'Left softkey: ' + left.label : undefined,
      tabIndex: left.action && left.label ? 0 : -1
    },
      left.label || ''
    ),
    h('div', { 
      className: 'softkey-center' + (center.action && center.label ? ' softkey-clickable' : ''),
      onClick: center.action && center.label ? handleCenterClick : null,
      role: center.label ? 'button' : 'presentation',
      'aria-label': center.label ? 'Center softkey: ' + center.label : undefined,
      tabIndex: center.action && center.label ? 0 : -1
    },
      center.label || ''
    ),
    h('div', { 
      className: 'softkey-right' + (right.action && right.label ? ' softkey-clickable' : ''),
      onClick: right.action && right.label ? handleRightClick : null,
      role: right.label ? 'button' : 'presentation',
      'aria-label': right.label ? 'Right softkey: ' + right.label : undefined,
      tabIndex: right.action && right.label ? 0 : -1
    },
      right.label || ''
    )
  );
}

// Export
export default SoftkeyBar;
