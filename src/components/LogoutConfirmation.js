import { h, Component } from 'preact';
import { useTranslation } from '../i18n/useTranslation';

/**
 * LogoutConfirmation - Confirmation dialog for logout action
 * @param {Object} props
 * @param {Function} props.onConfirm - Callback when user confirms logout
 * @param {Function} props.onCancel - Callback when user cancels logout
 */
function LogoutConfirmation(props) {
  var onConfirm = props.onConfirm;
  var onCancel = props.onCancel;
  
  var translation = useTranslation();
  var t = translation.t;
  
  return h(LogoutConfirmationClass, {
    onConfirm: onConfirm,
    onCancel: onCancel,
    t: t
  });
}

/**
 * Class component for LogoutConfirmation to handle lifecycle methods
 */
class LogoutConfirmationClass extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      selectedOption: 'cancel' // Default to cancel for safety
    };
    
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }
  
  componentDidMount() {
    // Add keyboard event listeners
    document.addEventListener('keydown', this.handleKeyDown);
    
    // Focus on the dialog
    if (this.dialogRef) {
      this.dialogRef.focus();
    }
  }
  
  componentWillUnmount() {
    // Remove keyboard event listeners
    document.removeEventListener('keydown', this.handleKeyDown);
  }
  
  handleKeyDown(e) {
    var key = e.key;
    
    // Handle left/right navigation
    if (key === 'ArrowLeft') {
      e.preventDefault();
      this.setState({ selectedOption: 'cancel' });
    } else if (key === 'ArrowRight') {
      e.preventDefault();
      this.setState({ selectedOption: 'confirm' });
    }
    // Handle selection with Enter or center button
    else if (key === 'Enter') {
      e.preventDefault();
      this.handleSelect();
    }
    // Handle dismissal with Escape or Backspace (back button)
    else if (key === 'Escape' || key === 'Backspace') {
      e.preventDefault();
      if (this.props.onCancel) {
        this.props.onCancel();
      }
    }
  }
  
  handleSelect() {
    var selectedOption = this.state.selectedOption;
    
    if (selectedOption === 'confirm' && this.props.onConfirm) {
      this.props.onConfirm();
    } else if (selectedOption === 'cancel' && this.props.onCancel) {
      this.props.onCancel();
    }
  }
  
  render() {
    var selectedOption = this.state.selectedOption;
    var t = this.props.t;
    
    var cancelClass = 'logout-confirmation__button logout-confirmation__button--cancel';
    if (selectedOption === 'cancel') {
      cancelClass += ' logout-confirmation__button--selected';
    }
    
    var confirmClass = 'logout-confirmation__button logout-confirmation__button--confirm';
    if (selectedOption === 'confirm') {
      confirmClass += ' logout-confirmation__button--selected';
    }
    
    var self = this;
    
    return h('div', {
      className: 'logout-confirmation__backdrop',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': 'logout-confirmation-title'
    },
      h('div', {
        className: 'logout-confirmation__dialog',
        ref: function(el) { self.dialogRef = el; },
        tabIndex: -1
      },
        h('div', { className: 'logout-confirmation__content' },
          h('p', {
            className: 'logout-confirmation__message',
            id: 'logout-confirmation-title'
          }, t('menu.logoutConfirm')),
          
          h('div', { className: 'logout-confirmation__buttons' },
            h('button', {
              className: cancelClass,
              onClick: this.props.onCancel,
              'aria-selected': selectedOption === 'cancel' ? 'true' : 'false',
              type: 'button'
            }, t('menu.logoutConfirmNo')),
            
            h('button', {
              className: confirmClass,
              onClick: this.props.onConfirm,
              'aria-selected': selectedOption === 'confirm' ? 'true' : 'false',
              type: 'button'
            }, t('menu.logoutConfirmYes'))
          )
        )
      )
    );
  }
}

export default LogoutConfirmation;
