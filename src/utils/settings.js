/**
 * Settings Utilities
 * Helper functions for managing application settings
 * Compatible with Gecko 48 (ES5 transpiled)
 * 
 * Requirements: 2.6, 6.1
 */

/**
 * Default settings
 */
var DEFAULT_SETTINGS = {
  dataSaverMode: false,
  autoLoadImages: true,
  language: 'en'
};

/**
 * Get settings from state or localStorage
 * 
 * @param {Object} state - Optional app state
 * @returns {Object} Settings object
 */
function getSettings(state) {
  if (state && state.settings) {
    return state.settings;
  }
  
  try {
    var stored = localStorage.getItem('bluekai_state');
    if (stored) {
      var parsed = JSON.parse(stored);
      if (parsed.settings) {
        return Object.assign({}, DEFAULT_SETTINGS, parsed.settings);
      }
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  
  return DEFAULT_SETTINGS;
}

/**
 * Check if data saver mode is enabled
 * 
 * @param {Object} settings - Settings object
 * @returns {boolean} True if data saver mode is enabled
 */
function isDataSaverEnabled(settings) {
  return settings && settings.dataSaverMode === true;
}

/**
 * Check if images should auto-load
 * 
 * @param {Object} settings - Settings object
 * @returns {boolean} True if images should auto-load
 */
function shouldAutoLoadImages(settings) {
  if (!settings) {
    return true;
  }
  return settings.autoLoadImages === true && !isDataSaverEnabled(settings);
}

/**
 * Get language setting
 * 
 * @param {Object} settings - Settings object
 * @returns {string} Language code
 */
function getLanguage(settings) {
  if (settings && settings.language) {
    return settings.language;
  }
  return DEFAULT_SETTINGS.language;
}

/**
 * Create settings update object
 * 
 * @param {Object} updates - Settings to update
 * @returns {Object} Settings update object
 */
function createSettingsUpdate(updates) {
  return Object.assign({}, updates);
}

/**
 * Toggle data saver mode
 * 
 * @param {Object} currentSettings - Current settings
 * @returns {Object} Updated settings
 */
function toggleDataSaverMode(currentSettings) {
  var newDataSaverMode = !currentSettings.dataSaverMode;
  return Object.assign({}, currentSettings, {
    dataSaverMode: newDataSaverMode,
    autoLoadImages: !newDataSaverMode
  });
}

/**
 * Export utilities
 */
module.exports = {
  DEFAULT_SETTINGS: DEFAULT_SETTINGS,
  getSettings: getSettings,
  isDataSaverEnabled: isDataSaverEnabled,
  shouldAutoLoadImages: shouldAutoLoadImages,
  getLanguage: getLanguage,
  createSettingsUpdate: createSettingsUpdate,
  toggleDataSaverMode: toggleDataSaverMode
};
