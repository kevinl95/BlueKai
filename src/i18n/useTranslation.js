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
    throw new Error('i18n instance not initialized. Call setI18nInstance first.');
  }
  
  var _useState = useState(globalI18n.getCurrentLanguage());
  var language = _useState[0];
  var setLanguage = _useState[1];
  
  // Listen for language changes
  useEffect(function() {
    var originalChangeLanguage = globalI18n.changeLanguage;
    
    globalI18n.changeLanguage = function(lang) {
      return originalChangeLanguage.call(globalI18n, lang).then(function() {
        setLanguage(lang);
      });
    };
    
    return function() {
      globalI18n.changeLanguage = originalChangeLanguage;
    };
  }, []);
  
  return {
    t: globalI18n.t,
    language: language,
    changeLanguage: globalI18n.changeLanguage
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
