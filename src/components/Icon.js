/**
 * Icon Component
 * Simple wrapper for icons using Unicode symbols
 */

import { h } from 'preact';

// Map icon names to Unicode symbols
var iconMap = {
  'mdi:message-reply': '↩',
  'mdi:repeat': '🔁',
  'mdi:heart': '♥'
};

function Icon(props) {
  var icon = props.icon;
  var className = props.className || '';
  var symbol = iconMap[icon] || '•';
  
  return h('span', {
    className: 'icon ' + className,
    'aria-hidden': 'true'
  }, symbol);
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Icon;
}
export default Icon;
