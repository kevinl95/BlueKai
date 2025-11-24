// Import polyfills first - must be before any other imports
import './utils/polyfills';

// Import global styles
import './styles/app.css';
import './components/Button.css';
import './components/TextInput.css';
import './components/ErrorMessage.css';
import './components/Modal.css';
import './views/LoginView.css';
import './views/PostItem.css';
import './views/PostList.css';
import './views/TimelineView.css';
import './views/PostActionMenu.css';
import './views/ComposeView.css';
import './navigation/softkey-bar.css';

import { h, render } from 'preact';
import App from './components/App';

// Mount the app
render(h(App), document.getElementById('app'));
