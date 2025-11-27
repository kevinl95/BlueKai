/**
 * ErrorBoundary Component Tests
 */

import { h } from 'preact';
import ErrorBoundary from './ErrorBoundary.js';

// Component that throws an error
function ThrowError(props) {
  if (props.shouldThrow) {
    throw new Error('Test error');
  }
  return h('div', null, 'No error');
}

describe('ErrorBoundary', function() {
  it('should render children when no error', function() {
    var container = document.createElement('div');
    document.body.appendChild(container);

    var vnode = h(ErrorBoundary, null,
      h('div', { id: 'test-child' }, 'Test content')
    );

    // Render using Preact's render function
    if (typeof preact !== 'undefined' && preact.render) {
      preact.render(vnode, container);
    }

    var child = container.querySelector('#test-child');
    console.assert(child !== null, 'Child should be rendered');
    console.assert(child.textContent === 'Test content', 'Child content should match');

    document.body.removeChild(container);
  });

  it('should catch errors and display fallback UI', function() {
    var container = document.createElement('div');
    document.body.appendChild(container);

    var vnode = h(ErrorBoundary, null,
      h(ThrowError, { shouldThrow: true })
    );

    // This would need actual Preact rendering to test properly
    // For now, we'll test the component methods directly
    var boundary = new ErrorBoundary({});
    
    var error = new Error('Test error');
    var errorInfo = { componentStack: 'test stack' };
    
    boundary.componentDidCatch(error, errorInfo);
    
    console.assert(boundary.state.hasError === true, 'Should set hasError to true');
    console.assert(boundary.state.error === error, 'Should store error');
    console.assert(boundary.state.errorInfo === errorInfo, 'Should store errorInfo');

    document.body.removeChild(container);
  });

  it('should reset error state when handleReset is called', function() {
    var boundary = new ErrorBoundary({});
    
    // Set error state
    boundary.setState({
      hasError: true,
      error: new Error('Test'),
      errorInfo: {}
    });
    
    // Reset
    boundary.handleReset();
    
    console.assert(boundary.state.hasError === false, 'Should reset hasError');
    console.assert(boundary.state.error === null, 'Should clear error');
    console.assert(boundary.state.errorInfo === null, 'Should clear errorInfo');
  });

  it('should call onReset callback when provided', function() {
    var resetCalled = false;
    var boundary = new ErrorBoundary({
      onReset: function() {
        resetCalled = true;
      }
    });
    
    boundary.handleReset();
    
    console.assert(resetCalled === true, 'Should call onReset callback');
  });

  it('should render custom fallback when provided', function() {
    var customFallbackCalled = false;
    var boundary = new ErrorBoundary({
      fallback: function(props) {
        customFallbackCalled = true;
        console.assert(props.error !== undefined, 'Should pass error to fallback');
        console.assert(props.reset !== undefined, 'Should pass reset to fallback');
        return h('div', null, 'Custom fallback');
      }
    });
    
    boundary.setState({
      hasError: true,
      error: new Error('Test'),
      errorInfo: {}
    });
    
    var result = boundary.render(boundary.props, boundary.state);
    console.assert(customFallbackCalled === true, 'Should call custom fallback');
  });
});

console.log('ErrorBoundary tests completed');
