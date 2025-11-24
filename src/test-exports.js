/**
 * Test Exports
 * Exposes components and utilities for testing
 */

// Import polyfills first
import './utils/polyfills';

// Import Preact
import { h, render, Component, createContext, useContext, useReducer, useEffect } from 'preact';

// Import components
import LoadingIndicator from './components/LoadingIndicator';
import ErrorMessage from './components/ErrorMessage';
import TextInput from './components/TextInput';
import Button from './components/Button';
import Modal from './components/Modal';

// Import views
import LoginView from './views/LoginView';
import PostItem from './views/PostItem';
import PostList from './views/PostList';
import TimelineView from './views/TimelineView';
import PostActionMenu from './views/PostActionMenu';

// Import utilities
import DateFormatter from './utils/date-formatter';
import TextProcessor from './utils/text-processor';

// Import services
import ATPClient from './services/atp-client';

// Import state management
import { AppStateContext, useAppState } from './state/app-state';
import appReducer from './state/reducer';

// Import navigation
import NavigationManager from './navigation/navigation-manager';
import Router from './navigation/router';
import SoftkeyBar from './navigation/SoftkeyBar';

// Import test runners
import runPostItemTests from './views/PostItem.test';
import runPostListTests from './views/PostList.test';
import runTimelineViewTests from './views/TimelineView.test';
import runPostActionMenuTests from './views/PostActionMenu.test';

// Expose to window for testing
window.preact = {
  h,
  render,
  Component,
  createContext,
  useContext,
  useReducer,
  useEffect
};

window.LoadingIndicator = LoadingIndicator;
window.ErrorMessage = ErrorMessage;
window.TextInput = TextInput;
window.Button = Button;
window.Modal = Modal;
window.LoginView = LoginView;
window.PostItem = PostItem;
window.PostList = PostList;
window.TimelineView = TimelineView;
window.PostActionMenu = PostActionMenu;

window.DateFormatter = DateFormatter;
window.TextProcessor = TextProcessor;
window.ATPClient = ATPClient;

window.AppStateContext = AppStateContext;
window.useAppState = useAppState;
window.appReducer = appReducer;

window.NavigationManager = NavigationManager;
window.Router = Router;
window.SoftkeyBar = SoftkeyBar;

window.runPostItemTests = runPostItemTests;
window.runPostListTests = runPostListTests;
window.runTimelineViewTests = runTimelineViewTests;
window.runPostActionMenuTests = runPostActionMenuTests;
