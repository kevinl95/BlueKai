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

  return h('div', { className: 'softkey-bar' },
    h('div', { 
      className: 'softkey-left' + (left.action ? ' softkey-clickable' : ''),
      onClick: handleLeftClick
    },
      left.label || ''
    ),
    h('div', { 
      className: 'softkey-center' + (center.action ? ' softkey-clickable' : ''),
      onClick: handleCenterClick
    },
      center.label || ''
    ),
    h('div', { 
      className: 'softkey-right' + (right.action ? ' softkey-clickable' : ''),
      onClick: handleRightClick
    },
      right.label || ''
    )
  );
}

// Export
export default SoftkeyBar;
