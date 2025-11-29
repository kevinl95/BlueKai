/**
 * SettingsView Component
 * Settings page with data saver mode, language selector, and about section
 * Compatible with Gecko 48 (ES5 transpiled)
 * 
 * Requirements: 1.4, 1.6, 1.7
 */

import { h, Component } from 'preact';
import { getState, dispatch } from '../state/app-state';
import { updateSettings } from '../state/actions';
import { changeLanguage } from '../i18n/i18n';
import { useTranslation } from '../i18n/useTranslation';
import Modal from '../components/Modal';
import './SettingsView.css';

/**
 * SettingsView Component
 * 
 * @class SettingsViewClass
 * @extends {Component}
 */
class SettingsViewClass extends Component {
  constructor(props) {
    super(props);
    
    var state = getState();
    var settings = state.settings || {};
    
    this.state = {
      selectedIndex: 0,
      editingLanguage: false,
      languageSelectedIndex: 0,
      dataSaverMode: settings.dataSaverMode || false,
      language: settings.language || 'en'
    };
    
    this.settingsItems = [
      { id: 'dataSaver', type: 'toggle' },
      { id: 'language', type: 'picker' },
      { id: 'about', type: 'info' }
    ];
    
    this.languages = [
      { code: 'en', label: 'English' },
      { code: 'es', label: 'Español' },
      { code: 'fr', label: 'Français' },
      { code: 'pt', label: 'Português' }
    ];
    
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleLanguageKeyDown = this.handleLanguageKeyDown.bind(this);
    this.toggleDataSaver = this.toggleDataSaver.bind(this);
    this.openLanguagePicker = this.openLanguagePicker.bind(this);
    this.closeLanguagePicker = this.closeLanguagePicker.bind(this);
    this.selectLanguage = this.selectLanguage.bind(this);
    this.handleBack = this.handleBack.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
  }
  
  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown);
    
    // Set up softkeys
    if (this.props.onUpdateSoftkeys) {
      this.props.onUpdateSoftkeys({
        left: null,
        center: { label: 'Select', action: this.handleSelect },
        right: { label: 'Back', action: this.handleBack }
      });
    }
  }
  
  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }
  
  /**
   * Handle keyboard navigation
   * Requirements: 1.7 - Keyboard navigation
   */
  handleKeyDown(event) {
    // If language picker is open, handle separately
    if (this.state.editingLanguage) {
      return;
    }
    
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        this.moveFocus(-1);
        break;
      
      case 'ArrowDown':
        event.preventDefault();
        this.moveFocus(1);
        break;
      
      case 'Enter':
        event.preventDefault();
        this.handleSelect();
        break;
      
      case 'Backspace':
        event.preventDefault();
        this.handleBack();
        break;
    }
  }
  
  /**
   * Handle language picker keyboard navigation
   */
  handleLanguageKeyDown(event) {
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        this.moveLanguageFocus(-1);
        break;
      
      case 'ArrowDown':
        event.preventDefault();
        this.moveLanguageFocus(1);
        break;
      
      case 'Enter':
        event.preventDefault();
        this.selectLanguage();
        break;
      
      case 'Backspace':
        event.preventDefault();
        this.closeLanguagePicker();
        break;
    }
  }
  
  /**
   * Move focus between settings items
   * 
   * @param {number} direction - Direction to move (-1 for up, 1 for down)
   */
  moveFocus(direction) {
    var newIndex = this.state.selectedIndex + direction;
    
    // Wrap around
    if (newIndex < 0) {
      newIndex = this.settingsItems.length - 1;
    } else if (newIndex >= this.settingsItems.length) {
      newIndex = 0;
    }
    
    this.setState({ selectedIndex: newIndex });
  }
  
  /**
   * Move focus between language options
   * 
   * @param {number} direction - Direction to move (-1 for up, 1 for down)
   */
  moveLanguageFocus(direction) {
    var newIndex = this.state.languageSelectedIndex + direction;
    
    // Wrap around
    if (newIndex < 0) {
      newIndex = this.languages.length - 1;
    } else if (newIndex >= this.languages.length) {
      newIndex = 0;
    }
    
    this.setState({ languageSelectedIndex: newIndex });
  }
  
  /**
   * Handle select action on current item
   */
  handleSelect() {
    var item = this.settingsItems[this.state.selectedIndex];
    
    if (item.type === 'toggle') {
      this.toggleDataSaver();
    } else if (item.type === 'picker') {
      this.openLanguagePicker();
    }
    // Info items don't have actions
  }
  
  /**
   * Toggle data saver mode
   * Requirements: 1.4 - Data saver mode toggle
   */
  toggleDataSaver() {
    var newValue = !this.state.dataSaverMode;
    
    this.setState({ dataSaverMode: newValue });
    
    // Update state
    dispatch(updateSettings({
      dataSaverMode: newValue,
      autoLoadImages: !newValue
    }));
  }
  
  /**
   * Open language picker dialog
   * Requirements: 1.4 - Language selector
   */
  openLanguagePicker() {
    // Find current language index
    var currentIndex = this.languages.findIndex(function(lang) {
      return lang.code === this.state.language;
    }.bind(this));
    
    this.setState({
      editingLanguage: true,
      languageSelectedIndex: currentIndex >= 0 ? currentIndex : 0
    });
    
    // Update softkeys for language picker
    if (this.props.onUpdateSoftkeys) {
      this.props.onUpdateSoftkeys({
        left: null,
        center: { label: 'Select', action: this.selectLanguage },
        right: { label: 'Cancel', action: this.closeLanguagePicker }
      });
    }
    
    // Add language picker keyboard listener
    setTimeout(function() {
      document.addEventListener('keydown', this.handleLanguageKeyDown);
    }.bind(this), 0);
  }
  
  /**
   * Close language picker dialog
   */
  closeLanguagePicker() {
    document.removeEventListener('keydown', this.handleLanguageKeyDown);
    
    this.setState({ editingLanguage: false });
    
    // Restore settings softkeys
    if (this.props.onUpdateSoftkeys) {
      this.props.onUpdateSoftkeys({
        left: null,
        center: { label: 'Select', action: this.handleSelect },
        right: { label: 'Back', action: this.handleBack }
      });
    }
  }
  
  /**
   * Select language from picker
   * Requirements: 1.4, 1.6 - Language selection and internationalization
   */
  selectLanguage() {
    var selectedLang = this.languages[this.state.languageSelectedIndex];
    
    this.setState({ language: selectedLang.code });
    
    // Update state
    dispatch(updateSettings({
      language: selectedLang.code
    }));
    
    // Update i18n
    changeLanguage(selectedLang.code).then(function() {
      // Force re-render after language change
      this.forceUpdate();
    }.bind(this));
    
    this.closeLanguagePicker();
  }
  
  /**
   * Handle back navigation
   */
  handleBack() {
    if (this.props.onBack) {
      this.props.onBack();
    }
  }
  
  /**
   * Render settings item
   * 
   * @param {Object} item - Settings item
   * @param {number} index - Item index
   * @returns {JSX.Element} Settings item element
   */
  renderSettingsItem(item, index) {
    var isFocused = this.state.selectedIndex === index;
    var className = 'settings-view__item' + (isFocused ? ' settings-view__item--focused' : '');
    var t = this.props.t;
    
    if (item.id === 'dataSaver') {
      return h('div', {
        key: item.id,
        className: className,
        'data-testid': 'settings-item-data-saver'
      }, [
        h('div', { className: 'settings-view__label' }, t('settings.dataSaver')),
        h('div', {
          className: 'settings-view__toggle' + (this.state.dataSaverMode ? ' settings-view__toggle--on' : ''),
          'data-testid': 'data-saver-toggle',
          'aria-checked': this.state.dataSaverMode
        }, [
          h('div', { className: 'settings-view__toggle-thumb' })
        ])
      ]);
    }
    
    if (item.id === 'language') {
      var currentLang = this.languages.find(function(lang) {
        return lang.code === this.state.language;
      }.bind(this));
      
      return h('div', {
        key: item.id,
        className: className,
        'data-testid': 'settings-item-language'
      }, [
        h('div', { className: 'settings-view__label' }, t('settings.language')),
        h('div', {
          className: 'settings-view__value',
          'data-testid': 'language-value'
        }, currentLang ? currentLang.label : 'English')
      ]);
    }
    
    if (item.id === 'about') {
      return h('div', {
        key: item.id,
        className: className,
        'data-testid': 'settings-item-about'
      }, [
        h('div', { className: 'settings-view__label' }, t('settings.about')),
        h('div', {
          className: 'settings-view__value',
          'data-testid': 'app-version'
        }, t('settings.version') + ' 1.0.0')
      ]);
    }
    
    return null;
  }
  
  /**
   * Render language picker modal
   * 
   * @returns {JSX.Element|null} Language picker modal
   */
  renderLanguagePicker() {
    if (!this.state.editingLanguage) {
      return null;
    }
    
    var t = this.props.t;
    
    return h(Modal, {
      isOpen: true,
      onClose: this.closeLanguagePicker,
      title: t('settings.language'),
      'data-testid': 'language-picker-modal'
    }, [
      h('div', { className: 'settings-view__language-picker' }, 
        this.languages.map(function(lang, index) {
          var isFocused = this.state.languageSelectedIndex === index;
          var className = 'settings-view__language-option' + 
            (isFocused ? ' settings-view__language-option--focused' : '');
          
          return h('div', {
            key: lang.code,
            className: className,
            'data-testid': 'language-option-' + lang.code,
            'aria-selected': isFocused
          }, lang.label);
        }.bind(this))
      )
    ]);
  }
  
  render() {
    var t = this.props.t;
    
    return h('div', { className: 'settings-view', 'data-testid': 'settings-view' }, [
      h('div', { className: 'settings-view__header' }, [
        h('h1', { className: 'settings-view__title' }, t('settings.title'))
      ]),
      h('div', { className: 'settings-view__list' },
        this.settingsItems.map(function(item, index) {
          return this.renderSettingsItem(item, index);
        }.bind(this))
      ),
      this.renderLanguagePicker()
    ]);
  }
}


/**
 * Functional wrapper for SettingsView that provides translation
 */
export function SettingsView(props) {
  var translation = useTranslation();
  var t = translation.t;
  
  return h(SettingsViewClass, Object.assign({}, props, { t: t }));
}

export default SettingsView;
