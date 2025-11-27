/**
 * Offline Indicator Component
 * Displays when the device is offline
 * Requirements: 6.1 - Display offline indicator in UI
 */

var h = require('preact').h;
var useAppState = require('../state/app-state').useAppState;

/**
 * OfflineIndicator component
 * Shows a banner when offline
 */
function OfflineIndicator() {
  var context = useAppState();
  var state = context.state;
  
  // Don't show if online
  if (state.network.isOnline) {
    return null;
  }
  
  return h('div', { className: 'offline-indicator' },
    h('span', { className: 'offline-indicator__icon' }, '⚠'),
    h('span', { className: 'offline-indicator__text' }, 'Offline')
  );
}

module.exports = OfflineIndicator;
