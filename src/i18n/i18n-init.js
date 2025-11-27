/**
 * i18n initialization helper
 * Initializes the i18n system and provides it to the app
 */

var i18nCore = require('./i18n.js');

// Create a singleton instance
var i18nInstance = {
  initialized: false,
  currentLanguage: 'en',
  
  /**
   * Initialize i18n system
   * @param {string} [lang] - Optional language code
   * @returns {Promise<void>}
   */
  init: function(lang) {
    var self = this;
    return i18nCore.initI18n(lang).then(function() {
      self.initialized = true;
      self.currentLanguage = i18nCore.getCurrentLanguage();
      console.log('i18n initialized with language:', self.currentLanguage);
    });
  },
  
  /**
   * Get translation function
   * @returns {Function}
   */
  t: function(key, params) {
    return i18nCore.t(key, params);
  },
  
  /**
   * Get current language
   * @returns {string}
   */
  getCurrentLanguage: function() {
    return i18nCore.getCurrentLanguage();
  },
  
  /**
   * Change language
   * @param {string} lang - Language code
   * @returns {Promise<void>}
   */
  changeLanguage: function(lang) {
    var self = this;
    return i18nCore.changeLanguage(lang).then(function() {
      self.currentLanguage = lang;
    });
  },
  
  /**
   * Detect language from device
   * @returns {string}
   */
  detectLanguage: function() {
    return i18nCore.detectLanguage();
  }
};

// Export singleton
if (typeof module !== 'undefined' && module.exports) {
  module.exports = i18nInstance;
}
