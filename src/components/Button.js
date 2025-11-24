import { h } from 'preact';

/**
 * Button - Focusable button component with navigation support for KaiOS
 * @param {Object} props
 * @param {Function} props.onClick - Click handler
 * @param {string} props.children - Button text/content
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {boolean} props.loading - Whether button is in loading state
 * @param {string} props.variant - Button style variant: 'primary', 'secondary', 'danger'
 * @param {string} props.size - Button size: 'small', 'medium', 'large'
 * @param {string} props.type - Button type: 'button', 'submit', 'reset'
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.fullWidth - Whether button should take full width
 */
function Button(props) {
  var onClick = props.onClick;
  var children = props.children;
  var disabled = props.disabled || false;
  var loading = props.loading || false;
  var variant = props.variant || 'primary';
  var size = props.size || 'medium';
  var type = props.type || 'button';
  var className = props.className || '';
  var fullWidth = props.fullWidth || false;
  
  var isDisabled = disabled || loading;
  
  var buttonClass = 'button button--' + variant + ' button--' + size;
  if (loading) {
    buttonClass += ' button--loading';
  }
  if (isDisabled) {
    buttonClass += ' button--disabled';
  }
  if (fullWidth) {
    buttonClass += ' button--full-width';
  }
  if (className) {
    buttonClass += ' ' + className;
  }
  
  var handleClick = function(e) {
    if (!isDisabled && onClick) {
      onClick(e);
    }
  };
  
  var handleKeyDown = function(e) {
    // Support Enter key activation
    if (e.key === 'Enter' && !isDisabled && onClick) {
      e.preventDefault();
      onClick(e);
    }
  };
  
  return h('button', {
    className: buttonClass,
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    disabled: isDisabled,
    type: type,
    'aria-disabled': isDisabled ? 'true' : 'false',
    'aria-busy': loading ? 'true' : 'false',
    tabIndex: isDisabled ? -1 : 0
  },
    loading && h('span', { className: 'button__spinner' },
      h('span', { className: 'button__spinner-dot' }),
      h('span', { className: 'button__spinner-dot' }),
      h('span', { className: 'button__spinner-dot' })
    ),
    h('span', { className: 'button__text' }, children)
  );
}

export default Button;
