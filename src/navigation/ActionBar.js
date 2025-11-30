/**
 * ActionBar - Fixed navigation bar with actual buttons for browser-based KaiOS
 * Replaces SoftkeyBar with real focusable buttons
 */

import './ActionBar.css';

var h = require('preact').h;

/**
 * ActionBar Component
 * @param {Object} props
 * @param {Object} props.left - Left action config {label, action, icon}
 * @param {Object} props.center - Center action config {label, action, icon}
 * @param {Object} props.right - Right action config {label, action, icon}
 */
function ActionBar(props) {
  var left = props.left || {};
  var center = props.center || {};
  var right = props.right || {};

  return h('nav', { 
    className: 'action-bar',
    role: 'navigation',
    'aria-label': 'Main actions'
  },
    left.label && h('button', {
      className: 'action-bar__button action-bar__button--left',
      onClick: left.action,
      'aria-label': left.label + ' (Press 1)',
      tabIndex: -1
    }, [
      h('span', { className: 'action-bar__shortcut' }, '1'),
      left.icon && h('span', { className: 'action-bar__icon' }, left.icon),
      h('span', { className: 'action-bar__label' }, left.label)
    ]),
    
    center.label && h('button', {
      className: 'action-bar__button action-bar__button--center',
      onClick: center.action,
      'aria-label': center.label + ' (Press 2)',
      tabIndex: -1
    }, [
      h('span', { className: 'action-bar__shortcut' }, '2'),
      center.icon && h('span', { className: 'action-bar__icon' }, center.icon),
      h('span', { className: 'action-bar__label' }, center.label)
    ]),
    
    right.label && h('button', {
      className: 'action-bar__button action-bar__button--right',
      onClick: right.action,
      'aria-label': right.label + ' (Press 3)',
      tabIndex: -1
    }, [
      h('span', { className: 'action-bar__shortcut' }, '3'),
      right.icon && h('span', { className: 'action-bar__icon' }, right.icon),
      h('span', { className: 'action-bar__label' }, right.label)
    ])
  );
}

export default ActionBar;
