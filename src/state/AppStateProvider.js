/**
 * App State Provider Component
 * Provides global state context to the application
 * Compatible with Gecko 48 (ES5 transpiled)
 */

import { h } from 'preact';
import { useReducer, useEffect } from 'preact/hooks';
import { AppStateContext, getInitialState } from './app-state';
import { reducer } from './reducer';

/**
 * AppStateProvider Component
 * Wraps the application and provides state context
 * 
 * Requirements: 5.3, 5.4
 * 
 * @param {Object} props - Component props
 * @param {*} props.children - Child components
 */
function AppStateProvider(props) {
  var initialState = getInitialState();
  var result = useReducer(reducer, initialState);
  var state = result[0];
  var dispatch = result[1];
  
  // Persist state to localStorage on changes
  // Requirements: 5.3 - Store session token locally
  useEffect(function() {
    try {
      // Only persist certain parts of state
      var stateToPersist = {
        user: state.user,
        session: state.session,
        settings: state.settings,
        navigation: {
          currentView: state.navigation.currentView
        }
      };
      localStorage.setItem('bluekai_state', JSON.stringify(stateToPersist));
    } catch (e) {
      console.error('Failed to persist state:', e);
    }
  }, [state]);
  
  var contextValue = {
    state: state,
    dispatch: dispatch
  };
  
  return h(AppStateContext.Provider, { value: contextValue }, props.children);
}

export { AppStateProvider };
