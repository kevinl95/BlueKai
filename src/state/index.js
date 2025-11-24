/**
 * State Management Module Exports
 * Central export point for all state management functionality
 * Compatible with Gecko 48 (ES5 transpiled)
 */

var appState = require('./app-state');
var actions = require('./actions');
var reducer = require('./reducer');
var AppStateProvider = require('./AppStateProvider');
var sessionManager = require('./session-manager');

/**
 * Export all state management modules
 */
module.exports = {
  // App State
  AppStateContext: appState.AppStateContext,
  initialState: appState.initialState,
  getInitialState: appState.getInitialState,
  useAppState: appState.useAppState,
  
  // Provider
  AppStateProvider: AppStateProvider.AppStateProvider,
  
  // Actions
  ActionTypes: actions.ActionTypes,
  loginSuccess: actions.loginSuccess,
  loginFailure: actions.loginFailure,
  logout: actions.logout,
  refreshSession: actions.refreshSession,
  timelineLoadStart: actions.timelineLoadStart,
  timelineLoadSuccess: actions.timelineLoadSuccess,
  timelineLoadFailure: actions.timelineLoadFailure,
  timelineAppend: actions.timelineAppend,
  timelineClear: actions.timelineClear,
  timelineUpdatePost: actions.timelineUpdatePost,
  navigate: actions.navigate,
  navigateBack: actions.navigateBack,
  updateSettings: actions.updateSettings,
  toggleDataSaver: actions.toggleDataSaver,
  updateUser: actions.updateUser,
  
  // Reducer
  reducer: reducer.reducer,
  
  // Session Manager
  SessionManager: sessionManager.SessionManager
};
