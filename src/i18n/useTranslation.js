/**
 * Preact hook for using translations in components
 */

import { h } from 'preact';
import { useState, useEffect, useContext, createContext } from 'preact/hooks';

// Create context for i18n
const I18nContext = createContext({
  language: 'en',
  t: function(key) { return key; },
  changeLanguage: function() { return Promise.resolve(); }
});

/**
 * Hook to access translation functions
 * @returns {Object} Translation utilities
 */
function useTranslation() {
  var context = useContext(I18nContext);
  
  if (!context) {
    throw new Error('useTranslation must be used within I18nProvider');
  }
  
  return {
    t: context.t,
    language: context.language,
    changeLanguage: context.changeLanguage
  };
}

/**
 * Provider component for i18n context
 * @param {Object} props - Component props
 * @param {Function} props.i18n - i18n instance with t, getCurrentLanguage, changeLanguage
 * @param {*} props.children - Child components
 */
function I18nProvider(props) {
  var i18n = props.i18n;
  var children = props.children;
  
  var _useState = useState(i18n.getCurrentLanguage());
  var language = _useState[0];
  var setLanguage = _useState[1];
  
  // Wrapper for changeLanguage that updates state
  var handleChangeLanguage = function(lang) {
    return i18n.changeLanguage(lang).then(function() {
      setLanguage(lang);
    });
  };
  
  var contextValue = {
    language: language,
    t: i18n.t,
    changeLanguage: handleChangeLanguage
  };
  
  return h(I18nContext.Provider, { value: contextValue }, children);
}

export { useTranslation, I18nProvider, I18nContext };
