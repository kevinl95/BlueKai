/**
 * Icon Component
 * Simple wrapper for Iconify icons
 */

import { h } from 'preact';

function Icon(props) {
  var icon = props.icon;
  var size = props.size || '16';
  var className = props.className || '';
  
  return h('iconify-icon', {
    icon: icon,
    width: size,
    height: size,
    className: className,
    'aria-hidden': 'true'
  });
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Icon;
}
export default Icon;
