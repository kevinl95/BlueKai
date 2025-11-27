/**
 * i18n module exports
 */

var i18nCore = require('./i18n.js');

export { useTranslation, I18nProvider } from './useTranslation.js';

export var initI18n = i18nCore.initI18n;
export var t = i18nCore.t;
export var getCurrentLanguage = i18nCore.getCurrentLanguage;
export var changeLanguage = i18nCore.changeLanguage;
export var detectLanguage = i18nCore.detectLanguage;
