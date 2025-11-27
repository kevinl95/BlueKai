// Import polyfills first - must be before any other imports
import './utils/polyfills';

// Import global styles
import './styles/app.css';
import './components/Button.css';
import './components/TextInput.css';
import './components/ErrorMessage.css';
import './components/Modal.css';
import './components/OfflineIndicator.css';
import './views/LoginView.css';
import './views/PostItem.css';
import './views/PostList.css';
import './views/TimelineView.css';
import './views/PostActionMenu.css';
import './views/ComposeView.css';
import './navigation/softkey-bar.css';

import { h, render } from 'preact';
import App from './components/App';
import { setI18nInstance } from './i18n/useTranslation';

// Import i18n
import i18n from './i18n/i18n-init.js';

// Initialize i18n and then mount the app
i18n.init().then(function() {
  console.log('App starting with language:', i18n.getCurrentLanguage());
  // Set the global i18n instance for useTranslation hook
  setI18nInstance(i18n);
  render(h(App), document.getElementById('app'));
}).catch(function(error) {
  console.error('Failed to initialize i18n:', error);
  // Set i18n instance anyway and render app with fallback
  setI18nInstance(i18n);
  render(h(App), document.getElementById('app'));
});
