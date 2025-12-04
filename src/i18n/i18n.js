/**
 * Simple i18n system for BlueKai
 * Provides key-based translation lookup with fallback to English
 */

import { inlineTranslations } from './translations-inline.js';

// Store for loaded translations
let currentLanguage = 'en';
let translations = {};
let fallbackTranslations = inlineTranslations.en || {};

// Supported languages array - defined at module level
var supportedLanguages = ['en', 'es', 'fr', 'pt', 'ar', 'hi', 'id', 'sw'];

/**
 * Get list of supported languages
 * @returns {Array<string>} Array of supported language codes
 */
function getSupportedLanguages() {
  return supportedLanguages.slice(); // Return a copy to prevent external modification
}

/**
 * Detect language from browser/device settings
 * @returns {string} Language code (e.g., 'en', 'es', 'fr', 'pt')
 */
function detectLanguage() {
  
  // Try navigator.language first (standard)
  if (typeof navigator !== 'undefined' && navigator.language) {
    var lang = navigator.language.toLowerCase();
    console.log('Browser language detected:', lang);
    
    // Extract primary language code (e.g., 'en-US' -> 'en')
    var primaryLang = lang.split('-')[0];
    
    // Check if we support this language
    if (supportedLanguages.indexOf(primaryLang) !== -1) {
      console.log('Using supported language:', primaryLang);
      return primaryLang;
    } else {
      console.log('Unsupported language "' + primaryLang + '", falling back to English');
    }
  }
  
  // Also try navigator.languages array (newer browsers)
  if (typeof navigator !== 'undefined' && navigator.languages && navigator.languages.length > 0) {
    for (var i = 0; i < navigator.languages.length; i++) {
      var langCode = navigator.languages[i].toLowerCase().split('-')[0];
      if (supportedLanguages.indexOf(langCode) !== -1) {
        console.log('Using language from navigator.languages:', langCode);
        return langCode;
      }
    }
  }
  
  // Fallback to English
  console.log('Using fallback language: en');
  return 'en';
}

/**
 * Load translations for a specific language
 * @param {string} lang - Language code
 * @returns {Promise<Object>} Translation object
 */
function loadTranslations(lang) {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    // Use relative path for better compatibility
    var path = './i18n/' + lang + '.json';
    console.log('Loading translation file:', path);
    xhr.open('GET', path, true);
    
    xhr.onload = function() {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          var data = JSON.parse(xhr.responseText);
          resolve(data);
        } catch (e) {
          reject(new Error('Failed to parse translation file: ' + e.message));
        }
      } else {
        reject(new Error('Failed to load translations: ' + xhr.status));
      }
    };
    
    xhr.onerror = function() {
      reject(new Error('Network error loading translations'));
    };
    
    xhr.send();
  });
}

/**
 * Initialize i18n system
 * @param {string} [lang] - Optional language code, auto-detects if not provided
 * @returns {Promise<void>}
 */
function initI18n(lang) {
  var targetLang = lang || detectLanguage();
  
  console.log('Initializing i18n with target language:', targetLang);
  console.log('Available browser languages:', typeof navigator !== 'undefined' ? navigator.languages : 'Not available');
  
  // Try to load English translations from file
  return loadTranslations('en')
    .then(function(enTranslations) {
      fallbackTranslations = enTranslations;
      
      // If target language is English, we're done
      if (targetLang === 'en') {
        currentLanguage = 'en';
        translations = enTranslations;
        return;
      }
      
      // Try to load target language
      return loadTranslations(targetLang)
        .then(function(targetTranslations) {
          currentLanguage = targetLang;
          translations = targetTranslations;
        })
        .catch(function(error) {
          // If target language fails, fall back to English
          console.warn('Failed to load language "' + targetLang + '", using English:', error.message);
          currentLanguage = 'en';
          translations = fallbackTranslations;
        });
    })
    .catch(function(error) {
      // If loading English fails, use inline translations
      console.warn('Failed to load translation files, using inline translations:', error.message);
      currentLanguage = 'en';
      translations = inlineTranslations.en || {};
      fallbackTranslations = inlineTranslations.en || {};
      return Promise.resolve();
    });
}

/**
 * Get translation for a key
 * @param {string} key - Translation key (e.g., 'login.title')
 * @param {Object} [params] - Optional parameters for interpolation
 * @returns {string} Translated text
 */
function t(key, params) {
  // Try current language first
  var text = getNestedValue(translations, key);
  
  // Fall back to English if not found
  if (text === undefined || text === null) {
    text = getNestedValue(fallbackTranslations, key);
  }
  
  // If still not found, return the key itself
  if (text === undefined || text === null) {
    console.warn('Translation missing for key: ' + key);
    return key;
  }
  
  // Interpolate parameters if provided
  if (params) {
    text = interpolate(text, params);
  }
  
  return text;
}

/**
 * Get nested value from object using dot notation
 * @param {Object} obj - Object to search
 * @param {string} path - Dot-separated path (e.g., 'login.title')
 * @returns {*} Value at path or undefined
 */
function getNestedValue(obj, path) {
  var keys = path.split('.');
  var current = obj;
  
  for (var i = 0; i < keys.length; i++) {
    if (current === undefined || current === null) {
      return undefined;
    }
    current = current[keys[i]];
  }
  
  return current;
}

/**
 * Interpolate parameters into translation string
 * @param {string} text - Text with placeholders like {{name}}
 * @param {Object} params - Parameters to interpolate
 * @returns {string} Interpolated text
 */
function interpolate(text, params) {
  var result = text;
  
  for (var key in params) {
    if (params.hasOwnProperty(key)) {
      var placeholder = '{{' + key + '}}';
      var value = params[key];
      // Replace all occurrences
      while (result.indexOf(placeholder) !== -1) {
        result = result.replace(placeholder, value);
      }
    }
  }
  
  return result;
}

/**
 * Get current language code
 * @returns {string} Current language code
 */
function getCurrentLanguage() {
  return currentLanguage;
}

/**
 * Change language at runtime
 * @param {string} lang - New language code
 * @returns {Promise<void>}
 */
function changeLanguage(lang) {
  if (lang === currentLanguage) {
    return Promise.resolve();
  }
  
  if (lang === 'en') {
    currentLanguage = 'en';
    translations = fallbackTranslations;
    return Promise.resolve();
  }
  
  return loadTranslations(lang)
    .then(function(newTranslations) {
      currentLanguage = lang;
      translations = newTranslations;
    });
}

// Export functions for CommonJS (test environments)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initI18n: initI18n,
    t: t,
    getCurrentLanguage: getCurrentLanguage,
    changeLanguage: changeLanguage,
    getSupportedLanguages: getSupportedLanguages,
    detectLanguage: detectLanguage
  };
}

// Export for ES modules
// Export a debug function for testing language detection
function debugLanguageDetection() {
  console.log('=== Language Detection Debug ===');
  console.log('navigator.language:', typeof navigator !== 'undefined' ? navigator.language : 'undefined');
  console.log('navigator.languages:', typeof navigator !== 'undefined' ? navigator.languages : 'undefined');
  console.log('Detected language:', detectLanguage());
  console.log('Current i18n language:', currentLanguage);
  console.log('================================');
}

// Function to re-detect and change language
function redetectLanguage() {
  var newLang = detectLanguage();
  console.log('Re-detecting language, found:', newLang);
  if (newLang !== currentLanguage) {
    console.log('Language changed from', currentLanguage, 'to', newLang);
    return changeLanguage(newLang);
  } else {
    console.log('Language unchanged:', currentLanguage);
    return Promise.resolve();
  }
}

// Make debug functions globally available
if (typeof window !== 'undefined') {
  window.debugLanguageDetection = debugLanguageDetection;
  window.redetectLanguage = redetectLanguage;
}

// Export all functions
export {
  initI18n,
  t,
  getCurrentLanguage,
  changeLanguage,
  getSupportedLanguages,
  detectLanguage,
  debugLanguageDetection,
  redetectLanguage
};
