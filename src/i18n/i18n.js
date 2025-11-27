/**
 * Simple i18n system for BlueKai
 * Provides key-based translation lookup with fallback to English
 */

// Store for loaded translations
let currentLanguage = 'en';
let translations = {};
let fallbackTranslations = {};

/**
 * Detect language from browser/device settings
 * @returns {string} Language code (e.g., 'en', 'es', 'fr', 'pt')
 */
function detectLanguage() {
  // Try navigator.language first (standard)
  if (typeof navigator !== 'undefined' && navigator.language) {
    var lang = navigator.language.toLowerCase();
    // Extract primary language code (e.g., 'en-US' -> 'en')
    var primaryLang = lang.split('-')[0];
    return primaryLang;
  }
  
  // Fallback to English
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
    xhr.open('GET', '/i18n/' + lang + '.json', true);
    
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
  
  // Always load English as fallback
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

// Export functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initI18n: initI18n,
    t: t,
    getCurrentLanguage: getCurrentLanguage,
    changeLanguage: changeLanguage,
    detectLanguage: detectLanguage
  };
}
