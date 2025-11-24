// Import polyfills first - must be before any other imports
import './utils/polyfills';

import { h, render } from 'preact';
import App from './components/App';

// Mount the app
render(h(App), document.getElementById('app'));
