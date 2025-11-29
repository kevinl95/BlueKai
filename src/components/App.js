/**
 * Main App Component
 * Implements routing, state management, and global navigation
 * Requirements: 5.4, 5.5
 */

import { h, Component } from 'preact';
import { AppStateProvider } from '../state/AppStateProvider.js';
import { useAppState } from '../state/app-state.js';
import { SessionManager } from '../state/session-manager.js';
import Router from '../navigation/router.js';
import NavigationManager from '../navigation/navigation-manager.js';
import SoftkeyBar from '../navigation/SoftkeyBar.js';
import ErrorBoundary from './ErrorBoundary.js';
import OfflineIndicator from './OfflineIndicator.js';
import ATPClient from '../services/atp-client.js';
import CacheManager from '../utils/cache-manager.js';
import StorageManager from '../utils/storage.js';
import networkStatus from '../utils/network-status.js';
import { I18nProvider } from '../i18n/useTranslation.js';
import i18n from '../i18n/i18n-init.js';

// Import actions (CommonJS module)
var actions = require('../state/actions.js');

// Import accessibility utilities
import * as accessibility from '../utils/accessibility.js';

// Import views
import LoginView from '../views/LoginView.js';
import TimelineView from '../views/TimelineView.js';
import ComposeView from '../views/ComposeView.js';
import PostDetailView from '../views/PostDetailView.js';
import ProfileView from '../views/ProfileView.js';
import EditProfileView from '../views/EditProfileView.js';
import NotificationsView from '../views/NotificationsView.js';
import SettingsView from '../views/SettingsView.js';
import MainMenu from '../views/MainMenu.js';

/**
 * AppContent Component
 * Contains the main app logic with access to state
 */
function AppContent() {
  return h(AppContentClass);
}

class AppContentClass extends Component {
  constructor(props) {
    super(props);
    
    // Get state context
    var context = this.context;
    
    // Initialize services
    this.atpClient = new ATPClient({ baseURL: 'https://bsky.social' });
    this.storage = new StorageManager('bluekai');
    this.cacheManager = new CacheManager(this.storage);
    this.router = new Router();
    this.navigationManager = null;
    this.sessionRefreshTimer = null;
    
    // Bind methods
    this.handleRouteChange = this.handleRouteChange.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleSignup = this.handleSignup.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.handleNetworkChange = this.handleNetworkChange.bind(this);
    this.requireAuth = this.requireAuth.bind(this);
    this.getSoftkeyConfig = this.getSoftkeyConfig.bind(this);
    this.openMainMenu = this.openMainMenu.bind(this);
    this.closeMainMenu = this.closeMainMenu.bind(this);
    this.handleNavigateToProfile = this.handleNavigateToProfile.bind(this);
    this.handleNavigateToSettings = this.handleNavigateToSettings.bind(this);
    
    // Component state
    this.state = {
      isInitialized: false,
      currentRoute: null,
      routeParams: {},
      isOnline: networkStatus.getStatus(),
      showMainMenu: false
    };
  }
  
  componentDidMount() {
    var self = this;
    var context = this.context;
    var state = context.state;
    var dispatch = context.dispatch;
    
    // Initialize accessibility features
    // Requirements: 10.2, 10.3
    accessibility.initializeLiveRegions();
    accessibility.addSkipLinks([
      { targetId: 'main-content', label: 'Skip to main content' },
      { targetId: 'softkey-navigation', label: 'Skip to navigation' }
    ]);
    
    // Monitor network status
    this.networkUnsubscribe = networkStatus.subscribe(this.handleNetworkChange);
    
    // Initialize router
    this.setupRoutes();
    this.router.init();
    
    // Initialize global navigation manager
    this.navigationManager = new NavigationManager({
      onSelect: function(element) {
        if (element && element.click) {
          element.click();
        }
      }
    });
    
    // Validate and restore session
    // Requirements: 5.4 - Implement initial session check and restoration
    SessionManager.validateAndRestoreSession(state, dispatch, this.atpClient)
      .then(function(isValid) {
        if (isValid) {
          console.log('Session restored successfully');
          
          // Start session refresh timer
          // Requirements: 5.5 - Automatic session refresh
          self.sessionRefreshTimer = SessionManager.startSessionRefreshTimer(
            state,
            dispatch,
            self.atpClient
          );
          
          // Navigate to timeline if on login page
          if (window.location.hash === '' || window.location.hash === '#/' || window.location.hash === '#/login') {
            self.router.navigate('/timeline', true);
          }
        } else {
          // No valid session, go to login
          self.router.navigate('/login', true);
        }
        
        self.setState({ isInitialized: true });
      })
      .catch(function(error) {
        console.error('Session restoration failed:', error);
        self.router.navigate('/login', true);
        self.setState({ isInitialized: true });
      });
  }
  
  componentWillUnmount() {
    // Clean up
    if (this.router) {
      this.router.destroy();
    }
    
    if (this.navigationManager) {
      this.navigationManager.destroy();
    }
    
    if (this.networkUnsubscribe) {
      this.networkUnsubscribe();
    }
    
    if (this.sessionRefreshTimer) {
      SessionManager.stopSessionRefreshTimer(this.sessionRefreshTimer);
    }
  }
  
  /**
   * Setup all application routes
   * Requirements: 5.4, 5.5 - Implement router with all view routes
   */
  setupRoutes() {
    var self = this;
    
    // Public routes
    this.router.register('/login', this.handleRouteChange, 'login');
    
    // Protected routes (require authentication)
    this.router.register('/timeline', function(params) {
      self.requireAuth(function() {
        self.handleRouteChange(params, '/timeline');
      });
    }, 'timeline');
    
    this.router.register('/compose', function(params) {
      self.requireAuth(function() {
        self.handleRouteChange(params, '/compose');
      });
    }, 'compose');
    
    this.router.register('/post/:uri', function(params) {
      self.requireAuth(function() {
        self.handleRouteChange(params, '/post/:uri');
      });
    }, 'post');
    
    this.router.register('/profile/:actor', function(params) {
      self.requireAuth(function() {
        self.handleRouteChange(params, '/profile/:actor');
      });
    }, 'profile');
    
    this.router.register('/profile/:actor/edit', function(params) {
      self.requireAuth(function() {
        self.handleRouteChange(params, '/profile/:actor/edit');
      });
    }, 'editProfile');
    
    this.router.register('/notifications', function(params) {
      self.requireAuth(function() {
        self.handleRouteChange(params, '/notifications');
      });
    }, 'notifications');
    
    this.router.register('/settings', function(params) {
      self.requireAuth(function() {
        self.handleRouteChange(params, '/settings');
      });
    }, 'settings');
    
    // Default route
    this.router.register('/', function() {
      var context = self.context;
      var isAuthenticated = context.state.session.isAuthenticated;
      
      if (isAuthenticated) {
        self.router.navigate('/timeline', true);
      } else {
        self.router.navigate('/login', true);
      }
    }, 'home');
  }
  
  /**
   * Route guard - require authentication
   * Requirements: 5.4, 5.5 - Add route guards for authentication
   */
  requireAuth(callback) {
    var context = this.context;
    var isAuthenticated = context.state.session.isAuthenticated;
    
    if (!isAuthenticated) {
      console.log('Authentication required, redirecting to login');
      this.router.navigate('/login', true);
      return;
    }
    
    callback();
  }
  
  /**
   * Handle route changes
   */
  handleRouteChange(params, path) {
    this.setState({
      currentRoute: path || this.router.getCurrentPath(),
      routeParams: params || {}
    });
    
    // Update navigation manager for new view
    var self = this;
    setTimeout(function() {
      if (self.navigationManager) {
        // Update focusable elements for the new view
        var focusableElements = document.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        self.navigationManager.updateFocusableElements(focusableElements);
      }
    }, 100);
  }
  
  /**
   * Handle successful login
   */
  handleLogin(sessionData) {
    var context = this.context;
    var dispatch = context.dispatch;
    
    // Update state
    dispatch(actions.loginSuccess(sessionData, {
      did: sessionData.did,
      handle: sessionData.handle,
      displayName: sessionData.displayName,
      avatar: sessionData.avatar
    }));
    
    // Session is already set in ATP client during login
    
    // Start session refresh timer
    var self = this;
    this.sessionRefreshTimer = SessionManager.startSessionRefreshTimer(
      context.state,
      dispatch,
      this.atpClient
    );
    
    // Navigate to timeline
    this.router.navigate('/timeline');
  }
  
  /**
   * Handle successful signup
   */
  handleSignup(sessionData) {
    // Signup creates a session, so handle like login
    this.handleLogin(sessionData);
  }
  
  /**
   * Handle logout
   */
  handleLogout() {
    var context = this.context;
    var dispatch = context.dispatch;
    
    // Close main menu if open
    this.setState({ showMainMenu: false });
    
    // Stop session refresh timer
    if (this.sessionRefreshTimer) {
      SessionManager.stopSessionRefreshTimer(this.sessionRefreshTimer);
      this.sessionRefreshTimer = null;
    }
    
    // Clear cache
    this.cacheManager.clear();
    
    // Logout
    SessionManager.logout(dispatch, this.atpClient);
    
    // Navigate to login
    this.router.navigate('/login');
  }
  
  /**
   * Open main menu
   */
  openMainMenu() {
    this.setState({ showMainMenu: true });
  }
  
  /**
   * Close main menu
   */
  closeMainMenu() {
    this.setState({ showMainMenu: false });
  }
  
  /**
   * Navigate to user's profile
   */
  handleNavigateToProfile() {
    var context = this.context;
    var handle = context.state.user.handle;
    
    this.closeMainMenu();
    this.router.navigate('/profile/' + handle);
  }
  
  /**
   * Navigate to settings
   */
  handleNavigateToSettings() {
    this.closeMainMenu();
    this.router.navigate('/settings');
  }
  
  /**
   * Handle network status changes
   */
  handleNetworkChange(isOnline) {
    var context = this.context;
    var dispatch = context.dispatch;
    
    this.setState({ isOnline: isOnline });
    dispatch(actions.networkStatusChange(isOnline));
    
    if (isOnline) {
      console.log('Connection restored');
      // Could trigger retry of queued requests here
    } else {
      console.log('Connection lost');
    }
  }
  
  /**
   * Get softkey configuration for current route
   * Requirements: 5.4, 5.5 - Wire up SoftkeyBar with route-specific actions
   */
  getSoftkeyConfig() {
    var self = this;
    var route = this.state.currentRoute;
    var context = this.context;
    var isAuthenticated = context.state.session.isAuthenticated;
    
    // Login view
    if (route === '/login') {
      return {
        left: null,
        center: { label: 'Login', action: null }, // Handled by form
        right: { label: 'Sign Up', action: function() {
          self.router.navigate('/signup');
        }}
      };
    }
    
    // Signup view
    if (route === '/signup') {
      return {
        left: { label: 'Back', action: function() {
          self.router.navigate('/login');
        }},
        center: { label: 'Sign Up', action: null }, // Handled by form
        right: null
      };
    }
    
    // Timeline view
    if (route === '/timeline') {
      return {
        left: { label: 'Menu', action: function() {
          // Could open a menu with Profile, Notifications, Settings, Logout
          self.handleLogout();
        }},
        center: { label: 'Compose', action: function() {
          self.router.navigate('/compose');
        }},
        right: { label: 'Notifications', action: function() {
          self.router.navigate('/notifications');
        }}
      };
    }
    
    // Compose view
    if (route === '/compose') {
      return {
        left: { label: 'Cancel', action: function() {
          self.router.back();
        }},
        center: { label: 'Post', action: null }, // Handled by form
        right: null
      };
    }
    
    // Post detail view
    if (route && route.indexOf('/post/') === 0) {
      return {
        left: { label: 'Back', action: function() {
          self.router.back();
        }},
        center: { label: 'Reply', action: function() {
          self.router.navigate('/compose');
        }},
        right: null
      };
    }
    
    // Profile view
    if (route && route.indexOf('/profile/') === 0 && route.indexOf('/edit') === -1) {
      var actor = this.state.routeParams.actor;
      var currentUserHandle = context.state.user.handle;
      var isOwnProfile = actor === currentUserHandle;
      
      return {
        left: { label: 'Back', action: function() {
          self.router.back();
        }},
        center: isOwnProfile ? { label: 'Edit', action: function() {
          self.router.navigate('/profile/' + actor + '/edit');
        }} : null,
        right: null
      };
    }
    
    // Edit profile view
    if (route && route.indexOf('/edit') !== -1) {
      return {
        left: { label: 'Cancel', action: function() {
          self.router.back();
        }},
        center: { label: 'Save', action: null }, // Handled by form
        right: null
      };
    }
    
    // Notifications view
    if (route === '/notifications') {
      return {
        left: { label: 'Back', action: function() {
          self.router.navigate('/timeline');
        }},
        center: null,
        right: null
      };
    }
    
    // Settings view
    if (route === '/settings') {
      return {
        left: { label: 'Back', action: function() {
          self.router.back();
        }},
        center: null,
        right: null
      };
    }
    
    // Default
    return {
      left: isAuthenticated ? { label: 'Back', action: function() {
        self.router.back();
      }} : null,
      center: null,
      right: null
    };
  }
  
  /**
   * Render the current view based on route
   */
  renderView() {
    var route = this.state.currentRoute;
    var params = this.state.routeParams;
    var context = this.context;
    var state = context.state;
    var self = this;
    
    // Login view
    if (route === '/login') {
      return h(LoginView, {
        atpClient: this.atpClient,
        onLogin: this.handleLogin
      });
    }
    
    // Timeline view
    if (route === '/timeline') {
      return h(TimelineView, {
        atpClient: this.atpClient,
        cacheManager: this.cacheManager,
        navigationManager: this.navigationManager,
        onReply: function(post) {
          // Store reply context and navigate
          self.replyContext = post;
          self.router.navigate('/compose');
        },
        onNavigateToPost: function(uri) {
          self.router.navigate('/post/' + encodeURIComponent(uri));
        },
        onNavigateToProfile: function(actor) {
          self.router.navigate('/profile/' + actor);
        },
        onOpenMainMenu: this.openMainMenu
      });
    }
    
    // Compose view
    if (route === '/compose') {
      return h(ComposeView, {
        atpClient: this.atpClient,
        replyTo: this.replyContext ? { post: this.replyContext } : null,
        onSubmit: function(result) {
          console.log('Post created:', result);
          self.replyContext = null;
          self.router.back();
        },
        onCancel: function() {
          self.replyContext = null;
          self.router.back();
        }
      });
    }
    
    // Post detail view
    if (route && route.indexOf('/post/') === 0) {
      var uri = decodeURIComponent(params.uri);
      return h(PostDetailView, {
        apiClient: this.atpClient,
        cacheManager: this.cacheManager,
        navigationManager: this.navigationManager,
        postUri: uri,
        dataSaverMode: state.settings.dataSaverMode,
        onNavigateToProfile: function(actor) {
          self.router.navigate('/profile/' + actor);
        },
        onNavigateToPost: function(uri) {
          self.router.navigate('/post/' + encodeURIComponent(uri));
        },
        onNavigateToReply: function(post) {
          self.replyContext = post;
          self.router.navigate('/compose');
        }
      });
    }
    
    // Profile view
    if (route && route.indexOf('/profile/') === 0 && route.indexOf('/edit') === -1) {
      return h(ProfileView, {
        atpClient: this.atpClient,
        cacheManager: this.cacheManager,
        navigationManager: this.navigationManager,
        actor: params.actor,
        currentUserDid: state.user.did,
        dataSaverMode: state.settings.dataSaverMode,
        onNavigateToEdit: function() {
          self.router.navigate('/profile/' + params.actor + '/edit');
        },
        onNavigateToPost: function(uri) {
          self.router.navigate('/post/' + encodeURIComponent(uri));
        }
      });
    }
    
    // Edit profile view
    if (route && route.indexOf('/edit') !== -1) {
      return h(EditProfileView, {
        atpClient: this.atpClient,
        navigationManager: this.navigationManager,
        profile: state.user,
        onSave: function(updatedProfile) {
          console.log('Profile updated:', updatedProfile);
          self.router.back();
        },
        onCancel: function() {
          self.router.back();
        }
      });
    }
    
    // Notifications view
    if (route === '/notifications') {
      return h(NotificationsView, {
        atpClient: this.atpClient,
        cacheManager: this.cacheManager,
        navigationManager: this.navigationManager,
        onNavigateToPost: function(uri) {
          self.router.navigate('/post/' + encodeURIComponent(uri));
        },
        onNavigateToProfile: function(actor) {
          self.router.navigate('/profile/' + actor);
        }
      });
    }
    
    // Settings view
    if (route === '/settings') {
      return h(SettingsView, {
        settings: state.settings,
        onUpdateSettings: function(updatedSettings) {
          var dispatch = context.dispatch;
          dispatch(actions.updateSettings(updatedSettings));
        },
        onBack: function() {
          self.router.back();
        }
      });
    }
    
    // Unknown route
    return h('div', { 
      style: { 
        padding: '20px', 
        textAlign: 'center' 
      } 
    },
      h('h1', null, 'BlueKai'),
      h('p', null, 'Page not found'),
      h('button', {
        onClick: function() {
          self.router.navigate('/timeline');
        },
        'data-focusable': 'true'
      }, 'Go to Timeline')
    );
  }
  
  render() {
    var softkeyConfig = this.getSoftkeyConfig();
    
    // Show loading state during initialization
    if (!this.state.isInitialized) {
      return h('div', {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          flexDirection: 'column',
          gap: '10px'
        }
      },
        h('div', {
          style: {
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1da1f2'
          }
        }, 'BlueKai'),
        h('div', {
          style: {
            fontSize: '12px',
            color: '#666'
          }
        }, 'Loading...')
      );
    }
    
    // Render main app
    var context = this.context;
    
    return h('div', {
      style: {
        height: '100vh',
        display: 'flex',
        flexDirection: 'column'
      },
      role: 'application',
      'aria-label': 'BlueKai - BlueSky client for KaiOS'
    },
      h(OfflineIndicator, { isOnline: this.state.isOnline }),
      h('div', {
        style: {
          flex: 1,
          overflow: 'auto'
        },
        id: 'app-content'
      }, this.renderView()),
      // Hide softkey bar on login and signup screens
      (this.state.currentRoute !== '/login' && this.state.currentRoute !== '/signup') && h('div', { id: 'softkey-navigation' },
        h(SoftkeyBar, softkeyConfig)
      ),
      // Render MainMenu when open
      this.state.showMainMenu && h(MainMenu, {
        onClose: this.closeMainMenu,
        onNavigateToProfile: this.handleNavigateToProfile,
        onNavigateToSettings: this.handleNavigateToSettings,
        onLogout: this.handleLogout,
        currentUser: context.state.user
      })
    );
  }
}

// Set context type for AppContentClass
AppContentClass.contextType = require('../state/app-state').AppStateContext;

/**
 * Main App Component
 * Wraps everything in providers and error boundary
 * Requirements: 5.4, 5.5
 */
function App() {
  return h(ErrorBoundary, {
    onReset: function() {
      // Reload the page on error reset
      window.location.reload();
    }
  },
    h(I18nProvider, { i18n: i18n },
      h(AppStateProvider, null,
        h(AppContent)
      )
    )
  );
}

export default App;
