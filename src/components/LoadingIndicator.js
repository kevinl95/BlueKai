import { h } from 'preact';

/**
 * LoadingIndicator - Simple loading indicator for KaiOS
 * @param {Object} props
 * @param {string} props.message - Loading message to display
 * @param {string} props.size - Size variant: 'small', 'medium', 'large'
 * @param {boolean} props.inline - Whether to display inline
 */
function LoadingIndicator(props) {
  var message = props.message || 'Loading...';
  var size = props.size || 'medium';
  var inline = props.inline || false;
  
  var className = 'loading-indicator loading-indicator--' + size;
  if (inline) {
    className += ' loading-indicator--inline';
  }
  
  return h('div', { className: className, role: 'status', 'aria-live': 'polite' },
    h('div', { className: 'loading-indicator__spinner' },
      h('span', { className: 'loading-indicator__dot' }),
      h('span', { className: 'loading-indicator__dot' }),
      h('span', { className: 'loading-indicator__dot' })
    ),
    h('div', { className: 'loading-indicator__message' }, message)
  );
}

export default LoadingIndicator;
