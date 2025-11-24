import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';

/**
 * Modal - Modal dialog component with focus trapping for KaiOS
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Close handler
 * @param {string} props.title - Modal title
 * @param {*} props.children - Modal content
 * @param {boolean} props.closeOnEscape - Whether to close on Escape key (default: true)
 * @param {boolean} props.closeOnBackdrop - Whether to close on backdrop click (default: true)
 * @param {string} props.size - Modal size: 'small', 'medium', 'large'
 */
function Modal(props) {
  var isOpen = props.isOpen;
  var onClose = props.onClose;
  var title = props.title;
  var children = props.children;
  var closeOnEscape = props.closeOnEscape !== false; // Default true
  var closeOnBackdrop = props.closeOnBackdrop !== false; // Default true
  var size = props.size || 'medium';
  
  var modalRef = useRef(null);
  var previousFocusRef = useRef(null);
  
  useEffect(function() {
    if (isOpen) {
      // Store previously focused element
      previousFocusRef.current = document.activeElement;
      
      // Focus first focusable element in modal
      if (modalRef.current) {
        var focusableElements = getFocusableElements(modalRef.current);
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      }
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      return function() {
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Restore focus to previous element
        if (previousFocusRef.current && previousFocusRef.current.focus) {
          previousFocusRef.current.focus();
        }
      };
    }
  }, [isOpen]);
  
  useEffect(function() {
    if (!isOpen) return;
    
    var handleKeyDown = function(e) {
      // Close on Escape or Back button
      if (closeOnEscape && (e.key === 'Escape' || e.key === 'Backspace')) {
        e.preventDefault();
        if (onClose) {
          onClose();
        }
        return;
      }
      
      // Trap focus within modal
      if (e.key === 'Tab') {
        trapFocus(e, modalRef.current);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return function() {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeOnEscape, onClose]);
  
  if (!isOpen) {
    return null;
  }
  
  var handleBackdropClick = function(e) {
    if (closeOnBackdrop && e.target.classList.contains('modal__backdrop')) {
      if (onClose) {
        onClose();
      }
    }
  };
  
  var modalClass = 'modal__content modal__content--' + size;
  
  return h('div', {
    className: 'modal__backdrop',
    onClick: handleBackdropClick,
    role: 'dialog',
    'aria-modal': 'true',
    'aria-labelledby': title ? 'modal-title' : undefined
  },
    h('div', {
      className: modalClass,
      ref: modalRef
    },
      title && h('div', { className: 'modal__header' },
        h('h2', { className: 'modal__title', id: 'modal-title' }, title),
        onClose && h('button', {
          className: 'modal__close',
          onClick: onClose,
          'aria-label': 'Close',
          type: 'button'
        }, '×')
      ),
      h('div', { className: 'modal__body' }, children)
    )
  );
}

/**
 * Get all focusable elements within a container
 */
function getFocusableElements(container) {
  if (!container) return [];
  
  var selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  var elements = container.querySelectorAll(selector);
  
  return Array.prototype.filter.call(elements, function(el) {
    return !el.disabled && el.offsetParent !== null;
  });
}

/**
 * Trap focus within modal
 */
function trapFocus(e, container) {
  var focusableElements = getFocusableElements(container);
  
  if (focusableElements.length === 0) {
    e.preventDefault();
    return;
  }
  
  var firstElement = focusableElements[0];
  var lastElement = focusableElements[focusableElements.length - 1];
  
  if (e.shiftKey) {
    // Shift + Tab
    if (document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    }
  } else {
    // Tab
    if (document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  }
}

export default Modal;
