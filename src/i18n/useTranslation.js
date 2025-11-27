/**
 * Preact hook for using translations in components
 */

import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';

// Simple global i18n instance holder
var globalI18n = null;

// Set the global i18n instance
function setI18nInstance(i18n) {
  globalI18n = i18n;
}

/**
 * Hook to access translation functions
 * @returns {Object} Translation utilities
 */
function useTranslation() {
  if (!globalI18n) {
    // Return a fallback that returns keys as-is
    console.warn('i18n instance not initialized. Using fallback.');
    return {
      t: function(key) { return key; },
      language: 'en',
      changeLanguage: function() { return Promise.resolve(); }
    };
  }
  
  var _useState = useState(globalI18n.getCurrentLanguage ? globalI18n.getCurrentLanguage() : 'en');
  var language = _useState[0];
  var setLanguage = _useState[1];
  
  // Listen for language changes
  useEffect(function() {
    if (!globalI18n || !globalI18n.changeLanguage) return;
    
    var originalChangeLanguage = globalI18n.changeLanguage;
    
    globalI18n.changeLanguage = function(lang) {
      return originalChangeLanguage.call(globalI18n, lang).then(function() {
        setLanguage(lang);
      });
    };
    
    return function() {
      if (globalI18n) {
        globalI18n.changeLanguage = originalChangeLanguage;
      }
    };
  }, []);
  
  // Bind the t function to preserve context
  var t = function(key, params) {
    if (!globalI18n || !globalI18n.t) {
      console.warn('i18n.t not available, returning key:', key);
      return key;
    }
    try {
      return globalI18n.t.call(globalI18n, key, params);
    } catch (error) {
      console.error('Error calling i18n.t:', error);
      return key;
    }
  };
  
  var changeLanguage = function(lang) {
    if (!globalI18n || !globalI18n.changeLanguage) {
      return Promise.resolve();
    }
    return globalI18n.changeLanguage.call(globalI18n, lang);
  };
  
  return {
    t: t,
    language: language,
    changeLanguage: changeLanguage
  };
}

/**
 * Provider component for i18n - simplified version without context
 * @param {Object} props - Component props
 * @param {Function} props.i18n - i18n instance with t, getCurrentLanguage, changeLanguage
 * @param {*} props.children - Child components
 */
function I18nProvider(props) {
  var i18n = props.i18n;
  var children = props.children;
  
  // Set the global i18n instance
  useEffect(function() {
    setI18nInstance(i18n);
  }, [i18n]);
  
  return children;
}

export { useTranslation, I18nProvider, setI18nInstance };
