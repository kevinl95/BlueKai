/**
 * MainMenu Component
 * Main application menu for navigation to profile, settings, and logout
 * Compatible with Gecko 48 (ES5 transpiled)
 * Requirements: 1.1, 1.2, 1.3, 1.5, 1.6, 1.7, 1.8
 */

import { h, Component } from 'preact';
import { useTranslation } from '../i18n/useTranslation';
import LogoutConfirmation from '../components/LogoutConfirmation';
import './MainMenu.css';

/**
 * MainMenu functional wrapper
 * @param {Object} props
 * @param {Function} props.onClose - Callback when menu is closed
 * @param {Function} props.onNavigateToProfile - Callback to navigate to user profile
 * @param {Function} props.onNavigateToSettings - Callback to navigate to settings
 * @param {Function} props.onLogout - Callback to handle logout
 * @param {Object} props.currentUser - Current user data with handle/did
 */
function MainMenu(props) {
  var translation = useTranslation();
  var t = translation.t;
  
  return h(MainMenuClass, {
    onClose: props.onClose,
    onNavigateToProfile: props.onNavigateToProfile,
    onNavigateToSettings: props.onNavigateToSettings,
    onLogout: props.onLogout,
    currentUser: props.currentUser,
    t: t
  });
}

/**
 * @class MainMenuClass
 * @description Main menu component with D-pad navigation
 */
class MainMenuClass extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      selectedIndex: 0,
      showLogoutConfirm: false
    };
    
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.moveFocus = this.moveFocus.bind(this);
    this.confirmLogout = this.confirmLogout.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.cancelLogout = this.cancelLogout.bind(this);
  }
  
  /**
   * Component mounted - add keyboard listeners
   */
  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown);
    
    // Focus on the menu container
    if (this.menuRef) {
      this.menuRef.focus();
    }
  }
  
  /**
   * Component will unmount - remove keyboard listeners
   */
  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }
  
  /**
   * Get menu items array
   * Requirements: 1.2, 1.6
   */
  getMenuItems() {
    var t = this.props.t;
    
    return [
      {
        id: 'profile',
        labelKey: 'menu.profile',
        label: t('menu.profile'),
        icon: '👤',
        action: this.props.onNavigateToProfile
      },
      {
        id: 'settings',
        labelKey: 'menu.settings',
        label: t('menu.settings'),
        icon: '⚙️',
        action: this.props.onNavigateToSettings
      },
      {
        id: 'logout',
        labelKey: 'menu.logout',
        label: t('menu.logout'),
        icon: '🚪',
        action: this.confirmLogout
      }
    ];
  }
  
  /**
   * Handle keyboard navigation
   * Requirements: 1.2, 1.7
   */
  handleKeyDown(e) {
    // Don't handle keys if logout confirmation is showing
    if (this.state.showLogoutConfirm) {
      return;
    }
    
    var key = e.key;
    
    // D-pad navigation
    if (key === 'ArrowUp') {
      e.preventDefault();
      this.moveFocus(-1);
    } else if (key === 'ArrowDown') {
      e.preventDefault();
      this.moveFocus(1);
    } else if (key === 'Enter') {
      e.preventDefault();
      this.handleSelect();
    } else if (key === 'Backspace' || key === 'Escape') {
      e.preventDefault();
      if (this.props.onClose) {
        this.props.onClose();
      }
    }
  }
  
  /**
   * Move focus up or down with wrapping
   * Requirements: 1.2
   */
  moveFocus(direction) {
    var menuItems = this.getMenuItems();
    var newIndex = this.state.selectedIndex + direction;
    
    // Wrap around at boundaries
    if (newIndex < 0) {
      newIndex = menuItems.length - 1;
    } else if (newIndex >= menuItems.length) {
      newIndex = 0;
    }
    
    this.setState({ selectedIndex: newIndex });
  }
  
  /**
   * Handle selection of current menu item
   * Requirements: 1.2, 1.3, 1.4, 1.5
   */
  handleSelect() {
    var menuItems = this.getMenuItems();
    var selectedItem = menuItems[this.state.selectedIndex];
    
    if (selectedItem && selectedItem.action) {
      selectedItem.action();
    }
  }
  
  /**
   * Show logout confirmation dialog
   * Requirements: 1.5
   */
  confirmLogout() {
    this.setState({ showLogoutConfirm: true });
  }
  
  /**
   * Handle logout after confirmation
   * Requirements: 1.5
   */
  handleLogout() {
    this.setState({ showLogoutConfirm: false });
    
    if (this.props.onLogout) {
      this.props.onLogout();
    }
  }
  
  /**
   * Cancel logout and return to menu
   * Requirements: 1.5
   */
  cancelLogout() {
    this.setState({ showLogoutConfirm: false });
  }
  
  /**
   * Render component
   * Requirements: 1.1, 1.6, 1.7, 1.8
   */
  render() {
    var self = this;
    var menuItems = this.getMenuItems();
    var selectedIndex = this.state.selectedIndex;
    var showLogoutConfirm = this.state.showLogoutConfirm;
    var t = this.props.t;
    
    return h('div', {
      className: 'main-menu-overlay',
      onClick: function(e) {
        // Close menu if clicking on overlay background
        if (e.target.className === 'main-menu-overlay') {
          if (self.props.onClose) {
            self.props.onClose();
          }
        }
      }
    },
      h('div', {
        className: 'main-menu',
        'role': 'menu',
        'aria-label': t('menu.title'),
        ref: function(el) { self.menuRef = el; },
        tabIndex: -1
      },
        // Menu header
        h('div', { className: 'main-menu__header' },
          t('menu.title')
        ),
        
        // Menu items
        h('div', { className: 'main-menu__list' },
          menuItems.map(function(item, index) {
            var isSelected = index === selectedIndex;
            var className = 'main-menu__item';
            if (isSelected) {
              className += ' main-menu__item--focused';
            }
            
            return h('div', {
              key: item.id,
              className: className,
              'role': 'menuitem',
              'aria-selected': isSelected ? 'true' : 'false',
              tabIndex: isSelected ? 0 : -1
            },
              h('span', { className: 'main-menu__icon' }, item.icon),
              h('span', { className: 'main-menu__label' }, item.label)
            );
          })
        ),
        
        // Instructions
        h('div', { className: 'main-menu__instructions' },
          '↑↓ Navigate • Enter Select • Back Close'
        )
      ),
      
      // Logout confirmation dialog
      showLogoutConfirm && h(LogoutConfirmation, {
        onConfirm: this.handleLogout,
        onCancel: this.cancelLogout
      })
    );
  }
}

export default MainMenu;
