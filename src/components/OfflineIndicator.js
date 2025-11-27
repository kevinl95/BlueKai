/**
 * Offline Indicator Component
 * Displays when the device is offline
 * Requirements: 6.1 - Display offline indicator in UI
 */

import { h } from 'preact';

/**
 * OfflineIndicator component
 * Shows a banner when offline
 * @param {Object} props
 * @param {boolean} props.isOnline - Current online status
 */
function OfflineIndicator(props) {
  // Don't show if online
  if (props.isOnline) {
    return null;
  }
  
  return h('div', { className: 'offline-indicator' },
    h('span', { className: 'offline-indicator__icon' }, '⚠'),
    h('span', { className: 'offline-indicator__text' }, 'Offline')
  );
}

export default OfflineIndicator;
