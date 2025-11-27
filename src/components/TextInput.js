import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';

/**
 * TextInput - Input wrapper with character counter for KaiOS
 * @param {Object} props
 * @param {string} props.label - Input label
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - Change handler
 * @param {number} props.maxLength - Maximum character length
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.error - Error message
 * @param {boolean} props.multiline - Whether to use textarea
 * @param {number} props.rows - Number of rows for textarea
 * @param {string} props.type - Input type (text, password, etc.)
 * @param {boolean} props.showCounter - Whether to show character counter
 * @param {boolean} props.required - Whether field is required
 * @param {string} props.id - Input ID
 */
function TextInput(props) {
  var label = props.label;
  var value = props.value || '';
  var onChange = props.onChange;
  var maxLength = props.maxLength;
  var placeholder = props.placeholder || '';
  var error = props.error;
  var multiline = props.multiline || false;
  var rows = props.rows || 3;
  var type = props.type || 'text';
  var showCounter = props.showCounter !== false; // Default true
  var required = props.required || false;
  var id = props.id || 'input-' + Math.random().toString(36).substr(2, 9);
  
  var charCount = value.length;
  var isOverLimit = maxLength && charCount > maxLength;
  var hasError = !!error || isOverLimit;
  
  var containerClass = 'text-input';
  if (hasError) {
    containerClass += ' text-input--error';
  }
  
  var handleChange = function(e) {
    var newValue = e.target.value;
    
    // Enforce max length
    if (maxLength && newValue.length > maxLength) {
      return; // Don't allow input beyond max length
    }
    
    if (onChange) {
      onChange(newValue);
    }
  };
  
  var inputProps = {
    id: id,
    className: 'text-input__field',
    value: value,
    onInput: handleChange,
    onChange: handleChange, // Also listen to onChange for better T9 support
    placeholder: placeholder,
    maxLength: maxLength,
    required: required,
    'aria-invalid': hasError ? 'true' : 'false',
    'aria-describedby': hasError ? id + '-error' : (showCounter && maxLength ? id + '-counter' : undefined),
    // KaiOS-specific attributes
    autocomplete: props.autocomplete || 'off',
    autocorrect: 'off',
    autocapitalize: props.autocapitalize || 'off',
    spellcheck: 'false'
  };
  
  if (!multiline) {
    inputProps.type = type;
  }
  
  return h('div', { className: containerClass },
    label && h('label', {
      className: 'text-input__label',
      htmlFor: id
    }, 
      label,
      required && h('span', { className: 'text-input__required' }, ' *')
    ),
    
    multiline 
      ? h('textarea', Object.assign({}, inputProps, { rows: rows }))
      : h('input', inputProps),
    
    h('div', { className: 'text-input__footer' },
      hasError && h('div', {
        className: 'text-input__error',
        id: id + '-error',
        role: 'alert'
      }, error || 'Character limit exceeded'),
      
      showCounter && maxLength && h('div', {
        className: 'text-input__counter' + (isOverLimit ? ' text-input__counter--over' : ''),
        id: id + '-counter',
        'aria-live': 'polite'
      }, charCount + '/' + maxLength)
    )
  );
}

export default TextInput;
