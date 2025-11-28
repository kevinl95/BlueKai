/**
 * ErrorBoundary Component
 * Catches JavaScript errors anywhere in the child component tree
 * and displays a fallback UI instead of crashing the whole app
 */

import { h, Component } from 'preact';
import { logError } from '../utils/error-logger.js';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console (always, even in production)
    if (typeof console !== 'undefined' && console.error) {
      console.error('ErrorBoundary caught error:', error);
      console.error('Error info:', errorInfo);
    }
    
    // Log the error
    logError(error, {
      componentStack: errorInfo.componentStack,
      type: 'component_error'
    });

    // Update state to show fallback UI
    this.setState({
      hasError: true,
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });

    // Call optional onReset callback
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render(props, state) {
    if (state.hasError) {
      // Custom fallback UI if provided
      if (props.fallback) {
        return props.fallback({
          error: state.error,
          errorInfo: state.errorInfo,
          reset: this.handleReset
        });
      }

      // Default fallback UI
      return h('div', {
        className: 'error-boundary',
        style: {
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#fff',
          minHeight: '100vh'
        }
      },
        h('div', {
          style: {
            fontSize: '48px',
            marginBottom: '20px'
          }
        }, '⚠️'),
        h('h1', {
          style: {
            fontSize: '20px',
            marginBottom: '10px',
            color: '#333'
          }
        }, 'Something went wrong'),
        h('p', {
          style: {
            fontSize: '14px',
            color: '#666',
            marginBottom: '10px'
          }
        }, 'The app encountered an unexpected error.'),
        state.error && h('p', {
          style: {
            fontSize: '12px',
            color: '#999',
            marginBottom: '20px',
            fontFamily: 'monospace',
            wordBreak: 'break-word'
          }
        }, state.error.toString()),
        h('button', {
          onClick: this.handleReset,
          style: {
            padding: '10px 20px',
            fontSize: '14px',
            backgroundColor: '#1da1f2',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          },
          'data-focusable': 'true'
        }, 'Try Again')
      );
    }

    return props.children;
  }
}

export default ErrorBoundary;
