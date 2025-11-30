/**
 * KeyboardHint - Shows keyboard shortcuts to users
 */

import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import './KeyboardHint.css';

function KeyboardHint() {
  var _useState = useState(true);
  var visible = _useState[0];
  var setVisible = _useState[1];
  
  useEffect(function() {
    // Check if user has seen the hint before
    var hasSeenHint = localStorage.getItem('hasSeenKeyboardHint');
    
    if (hasSeenHint) {
      setVisible(false);
      return;
    }
    
    // Auto-hide after 8 seconds
    var timer = setTimeout(function() {
      setVisible(false);
      localStorage.setItem('hasSeenKeyboardHint', 'true');
    }, 8000);
    
    return function() {
      clearTimeout(timer);
    };
  }, []);
  
  var handleDismiss = function() {
    setVisible(false);
    localStorage.setItem('hasSeenKeyboardHint', 'true');
  };
  
  if (!visible) {
    return null;
  }
  
  return h('div', { className: 'keyboard-hint', role: 'alert', 'aria-live': 'polite' },
    h('div', { className: 'keyboard-hint__content' },
      h('div', { className: 'keyboard-hint__title' }, '💡 Keyboard Shortcuts'),
      h('div', { className: 'keyboard-hint__shortcuts' },
        h('div', null, '1=Refresh/Back'),
        h('div', null, '2=Compose/Reply'),
        h('div', null, '3=Menu')
      )
    ),
    h('button', {
      className: 'keyboard-hint__close',
      onClick: handleDismiss,
      'aria-label': 'Dismiss hint'
    }, '×')
  );
}

export default KeyboardHint;
