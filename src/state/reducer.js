/**
 * State Reducer
 * Handles all state updates for the application
 * Compatible with Gecko 48 (ES5 transpiled)
 * 
 * Requirements: 5.3, 5.4, 5.6
 */

import { ActionTypes } from './actions';
import { initialState } from './app-state';

/**
 * Main reducer function
 * 
 * @param {Object} state - Current state
 * @param {Object} action - Action to process
 * @returns {Object} New state
 */
function reducer(state, action) {
  switch (action.type) {
    // Authentication actions
    case ActionTypes.LOGIN_SUCCESS:
      return Object.assign({}, state, {
        user: action.payload.user,
        session: action.payload.session,
        navigation: Object.assign({}, state.navigation, {
          currentView: 'timeline'
        })
      });
    
    case ActionTypes.LOGIN_FAILURE:
      return Object.assign({}, state, {
        session: Object.assign({}, state.session, {
          error: action.payload.error
        })
      });
    
    case ActionTypes.LOGOUT:
      // Requirements: 5.6 - Clear all stored credentials and session data
      return Object.assign({}, initialState, {
        settings: state.settings, // Preserve settings
        navigation: Object.assign({}, initialState.navigation, {
          currentView: 'login'
        })
      });
    
    case ActionTypes.REFRESH_SESSION:
      return Object.assign({}, state, {
        session: Object.assign({}, state.session, action.payload)
      });
    
    // Timeline actions
    case ActionTypes.TIMELINE_LOAD_START:
      return Object.assign({}, state, {
        timeline: Object.assign({}, state.timeline, {
          loading: true,
          error: null
        })
      });
    
    case ActionTypes.TIMELINE_LOAD_SUCCESS:
      return Object.assign({}, state, {
        timeline: {
          posts: action.payload.posts,
          cursor: action.payload.cursor,
          loading: false,
          error: null,
          lastFetch: action.payload.lastFetch
        }
      });
    
    case ActionTypes.TIMELINE_LOAD_FAILURE:
      return Object.assign({}, state, {
        timeline: Object.assign({}, state.timeline, {
          loading: false,
          error: action.payload.error
        })
      });
    
    case ActionTypes.TIMELINE_APPEND:
      return Object.assign({}, state, {
        timeline: Object.assign({}, state.timeline, {
          posts: state.timeline.posts.concat(action.payload.posts),
          cursor: action.payload.cursor
        })
      });
    
    case ActionTypes.TIMELINE_CLEAR:
      return Object.assign({}, state, {
        timeline: Object.assign({}, initialState.timeline)
      });
    
    case ActionTypes.TIMELINE_UPDATE_POST:
      return Object.assign({}, state, {
        timeline: Object.assign({}, state.timeline, {
          posts: state.timeline.posts.map(function(post) {
            if (post.uri === action.payload.uri) {
              return Object.assign({}, post, action.payload.updates);
            }
            return post;
          })
        })
      });
    
    // Navigation actions
    case ActionTypes.NAVIGATE:
      var newHistory = state.navigation.history.concat([{
        view: state.navigation.currentView,
        params: state.navigation.params
      }]);
      
      return Object.assign({}, state, {
        navigation: {
          currentView: action.payload.view,
          params: action.payload.params,
          history: newHistory
        }
      });
    
    case ActionTypes.NAVIGATE_BACK:
      if (state.navigation.history.length === 0) {
        return state;
      }
      
      var history = state.navigation.history.slice();
      var previous = history.pop();
      
      return Object.assign({}, state, {
        navigation: {
          currentView: previous.view,
          params: previous.params,
          history: history
        }
      });
    
    // Settings actions
    case ActionTypes.UPDATE_SETTINGS:
      return Object.assign({}, state, {
        settings: Object.assign({}, state.settings, action.payload)
      });
    
    case ActionTypes.TOGGLE_DATA_SAVER:
      var newDataSaverMode = !state.settings.dataSaverMode;
      return Object.assign({}, state, {
        settings: Object.assign({}, state.settings, {
          dataSaverMode: newDataSaverMode,
          autoLoadImages: !newDataSaverMode
        })
      });
    
    // User actions
    case ActionTypes.UPDATE_USER:
      return Object.assign({}, state, {
        user: Object.assign({}, state.user, action.payload)
      });
    
    // Network actions
    case ActionTypes.NETWORK_STATUS_CHANGE:
      return Object.assign({}, state, {
        network: Object.assign({}, state.network, {
          isOnline: action.payload.isOnline,
          lastOnlineAt: action.payload.lastOnlineAt || state.network.lastOnlineAt
        })
      });
    
    case ActionTypes.ADD_RETRY_REQUEST:
      return Object.assign({}, state, {
        network: Object.assign({}, state.network, {
          retryQueue: state.network.retryQueue.concat([action.payload])
        })
      });
    
    case ActionTypes.CLEAR_RETRY_QUEUE:
      return Object.assign({}, state, {
        network: Object.assign({}, state.network, {
          retryQueue: []
        })
      });
    
    default:
      return state;
  }
}

/**
 * Export reducer
 */
export { reducer };
