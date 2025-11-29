/**
 * SettingsView Component Tests
 * Tests for settings page functionality
 * Requirements: 1.4, 1.6, 1.7
 */

import { h } from 'preact';
import { SettingsView } from './SettingsView';
import { getState, dispatch, resetState } from '../state/app-state';
import { updateSettings } from '../state/actions';

/**
 * Test suite for SettingsView component
 */
describe('SettingsView', function() {
  var container;
  var mockOnBack;
  var mockOnUpdateSoftkeys;
  
  beforeEach(function() {
    container = document.createElement('div');
    document.body.appendChild(container);
    
    mockOnBack = jasmine.createSpy('onBack');
    mockOnUpdateSoftkeys = jasmine.createSpy('onUpdateSoftkeys');
    
    // Reset state
    resetState();
    
    // Set up initial settings
    dispatch(updateSettings({
      dataSaverMode: false,
      language: 'en'
    }));
  });
  
  afterEach(function() {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    container = null;
  });
  
  /**
   * Test: Component renders correctly
   * Requirements: 1.4 - Settings view displays settings options
   */
  it('should render settings view with all items', function() {
    var component = h(SettingsView, {
      onBack: mockOnBack,
      onUpdateSoftkeys: mockOnUpdateSoftkeys
    });
    
    preact.render(component, container);
    
    var view = container.querySelector('[data-testid="settings-view"]');
    expect(view).toBeTruthy();
    
    var dataSaverItem = container.querySelector('[data-testid="settings-item-data-saver"]');
    expect(dataSaverItem).toBeTruthy();
    
    var languageItem = container.querySelector('[data-testid="settings-item-language"]');
    expect(languageItem).toBeTruthy();
    
    var aboutItem = container.querySelector('[data-testid="settings-item-about"]');
    expect(aboutItem).toBeTruthy();
  });
  
  /**
   * Test: Data saver toggle displays current state
   * Requirements: 1.4 - Data saver mode toggle
   */
  it('should display current data saver mode state', function() {
    dispatch(updateSettings({ dataSaverMode: true }));
    
    var component = h(SettingsView, {
      onBack: mockOnBack,
      onUpdateSoftkeys: mockOnUpdateSoftkeys
    });
    
    preact.render(component, container);
    
    var toggle = container.querySelector('[data-testid="data-saver-toggle"]');
    expect(toggle).toBeTruthy();
    expect(toggle.classList.contains('settings-view__toggle--on')).toBe(true);
    expect(toggle.getAttribute('aria-checked')).toBe('true');
  });
  
  /**
   * Test: Language displays current selection
   * Requirements: 1.4, 1.6 - Language selector and internationalization
   */
  it('should display current language', function() {
    dispatch(updateSettings({ language: 'es' }));
    
    var component = h(SettingsView, {
      onBack: mockOnBack,
      onUpdateSoftkeys: mockOnUpdateSoftkeys
    });
    
    preact.render(component, container);
    
    var languageValue = container.querySelector('[data-testid="language-value"]');
    expect(languageValue).toBeTruthy();
    expect(languageValue.textContent).toBe('Español');
  });
  
  /**
   * Test: About section displays app version
   * Requirements: 1.4 - About section with app version
   */
  it('should display app version in about section', function() {
    var component = h(SettingsView, {
      onBack: mockOnBack,
      onUpdateSoftkeys: mockOnUpdateSoftkeys
    });
    
    preact.render(component, container);
    
    var version = container.querySelector('[data-testid="app-version"]');
    expect(version).toBeTruthy();
    expect(version.textContent).toContain('1.0.0');
  });
  
  /**
   * Test: D-pad navigation moves focus
   * Requirements: 1.7 - D-pad navigation between settings items
   */
  it('should navigate between items with arrow keys', function(done) {
    var component = h(SettingsView, {
      onBack: mockOnBack,
      onUpdateSoftkeys: mockOnUpdateSoftkeys
    });
    
    var instance = preact.render(component, container);
    
    // Initial focus should be on first item (index 0)
    expect(instance.state.selectedIndex).toBe(0);
    
    // Press down arrow
    var downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    document.dispatchEvent(downEvent);
    
    setTimeout(function() {
      expect(instance.state.selectedIndex).toBe(1);
      
      // Press down arrow again
      document.dispatchEvent(downEvent);
      
      setTimeout(function() {
        expect(instance.state.selectedIndex).toBe(2);
        
        // Press up arrow
        var upEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
        document.dispatchEvent(upEvent);
        
        setTimeout(function() {
          expect(instance.state.selectedIndex).toBe(1);
          done();
        }, 50);
      }, 50);
    }, 50);
  });
  
  /**
   * Test: Navigation wraps around
   * Requirements: 1.7 - D-pad navigation with wrapping
   */
  it('should wrap focus when navigating past boundaries', function(done) {
    var component = h(SettingsView, {
      onBack: mockOnBack,
      onUpdateSoftkeys: mockOnUpdateSoftkeys
    });
    
    var instance = preact.render(component, container);
    
    // Start at first item
    expect(instance.state.selectedIndex).toBe(0);
    
    // Press up arrow (should wrap to last item)
    var upEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
    document.dispatchEvent(upEvent);
    
    setTimeout(function() {
      expect(instance.state.selectedIndex).toBe(2);
      
      // Press down arrow (should wrap to first item)
      var downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      document.dispatchEvent(downEvent);
      
      setTimeout(function() {
        expect(instance.state.selectedIndex).toBe(0);
        done();
      }, 50);
    }, 50);
  });
  
  /**
   * Test: Toggle data saver mode
   * Requirements: 1.4 - Data saver mode toggle
   */
  it('should toggle data saver mode when selected', function(done) {
    var component = h(SettingsView, {
      onBack: mockOnBack,
      onUpdateSoftkeys: mockOnUpdateSoftkeys
    });
    
    var instance = preact.render(component, container);
    
    // Ensure we're on data saver item (index 0)
    expect(instance.state.selectedIndex).toBe(0);
    expect(instance.state.dataSaverMode).toBe(false);
    
    // Press Enter to toggle
    var enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    document.dispatchEvent(enterEvent);
    
    setTimeout(function() {
      expect(instance.state.dataSaverMode).toBe(true);
      
      var state = getState();
      expect(state.settings.dataSaverMode).toBe(true);
      expect(state.settings.autoLoadImages).toBe(false);
      
      // Toggle again
      document.dispatchEvent(enterEvent);
      
      setTimeout(function() {
        expect(instance.state.dataSaverMode).toBe(false);
        
        var updatedState = getState();
        expect(updatedState.settings.dataSaverMode).toBe(false);
        expect(updatedState.settings.autoLoadImages).toBe(true);
        done();
      }, 50);
    }, 50);
  });
  
  /**
   * Test: Open language picker
   * Requirements: 1.4 - Language selector with picker dialog
   */
  it('should open language picker when language item selected', function(done) {
    var component = h(SettingsView, {
      onBack: mockOnBack,
      onUpdateSoftkeys: mockOnUpdateSoftkeys
    });
    
    var instance = preact.render(component, container);
    
    // Navigate to language item (index 1)
    instance.setState({ selectedIndex: 1 });
    
    setTimeout(function() {
      expect(instance.state.editingLanguage).toBe(false);
      
      // Press Enter to open picker
      var enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      document.dispatchEvent(enterEvent);
      
      setTimeout(function() {
        expect(instance.state.editingLanguage).toBe(true);
        
        var modal = container.querySelector('[data-testid="language-picker-modal"]');
        expect(modal).toBeTruthy();
        
        done();
      }, 50);
    }, 50);
  });
  
  /**
   * Test: Navigate in language picker
   * Requirements: 1.4 - Language selector navigation
   */
  it('should navigate between languages in picker', function(done) {
    var component = h(SettingsView, {
      onBack: mockOnBack,
      onUpdateSoftkeys: mockOnUpdateSoftkeys
    });
    
    var instance = preact.render(component, container);
    
    // Open language picker
    instance.openLanguagePicker();
    
    setTimeout(function() {
      expect(instance.state.languageSelectedIndex).toBe(0);
      
      // Press down arrow
      var downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      document.dispatchEvent(downEvent);
      
      setTimeout(function() {
        expect(instance.state.languageSelectedIndex).toBe(1);
        
        // Press down arrow again
        document.dispatchEvent(downEvent);
        
        setTimeout(function() {
          expect(instance.state.languageSelectedIndex).toBe(2);
          done();
        }, 50);
      }, 50);
    }, 50);
  });
  
  /**
   * Test: Select language from picker
   * Requirements: 1.4, 1.6 - Language selection and internationalization
   */
  it('should update language when selected from picker', function(done) {
    var component = h(SettingsView, {
      onBack: mockOnBack,
      onUpdateSoftkeys: mockOnUpdateSoftkeys
    });
    
    var instance = preact.render(component, container);
    
    // Open language picker
    instance.openLanguagePicker();
    
    setTimeout(function() {
      // Navigate to Spanish (index 1)
      instance.setState({ languageSelectedIndex: 1 });
      
      setTimeout(function() {
        // Press Enter to select
        var enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        document.dispatchEvent(enterEvent);
        
        setTimeout(function() {
          expect(instance.state.language).toBe('es');
          expect(instance.state.editingLanguage).toBe(false);
          
          var state = getState();
          expect(state.settings.language).toBe('es');
          
          done();
        }, 50);
      }, 50);
    }, 50);
  });
  
  /**
   * Test: Cancel language picker
   * Requirements: 1.4 - Language picker can be cancelled
   */
  it('should close language picker on back button', function(done) {
    var component = h(SettingsView, {
      onBack: mockOnBack,
      onUpdateSoftkeys: mockOnUpdateSoftkeys
    });
    
    var instance = preact.render(component, container);
    
    // Open language picker
    instance.openLanguagePicker();
    
    setTimeout(function() {
      expect(instance.state.editingLanguage).toBe(true);
      
      // Press Backspace to cancel
      var backEvent = new KeyboardEvent('keydown', { key: 'Backspace' });
      document.dispatchEvent(backEvent);
      
      setTimeout(function() {
        expect(instance.state.editingLanguage).toBe(false);
        
        var modal = container.querySelector('[data-testid="language-picker-modal"]');
        expect(modal).toBeFalsy();
        
        done();
      }, 50);
    }, 50);
  });
  
  /**
   * Test: Softkeys are configured correctly
   * Requirements: 1.7 - Softkey configuration (Select, Back)
   */
  it('should configure softkeys on mount', function() {
    var component = h(SettingsView, {
      onBack: mockOnBack,
      onUpdateSoftkeys: mockOnUpdateSoftkeys
    });
    
    preact.render(component, container);
    
    expect(mockOnUpdateSoftkeys).toHaveBeenCalled();
    
    var softkeyConfig = mockOnUpdateSoftkeys.calls.mostRecent().args[0];
    expect(softkeyConfig.left).toBe(null);
    expect(softkeyConfig.center).toBeDefined();
    expect(softkeyConfig.center.label).toBe('Select');
    expect(softkeyConfig.right).toBeDefined();
    expect(softkeyConfig.right.label).toBe('Back');
  });
  
  /**
   * Test: Softkeys update when language picker opens
   * Requirements: 1.7 - Softkey configuration updates
   */
  it('should update softkeys when language picker opens', function(done) {
    var component = h(SettingsView, {
      onBack: mockOnBack,
      onUpdateSoftkeys: mockOnUpdateSoftkeys
    });
    
    var instance = preact.render(component, container);
    
    mockOnUpdateSoftkeys.calls.reset();
    
    // Open language picker
    instance.openLanguagePicker();
    
    setTimeout(function() {
      expect(mockOnUpdateSoftkeys).toHaveBeenCalled();
      
      var softkeyConfig = mockOnUpdateSoftkeys.calls.mostRecent().args[0];
      expect(softkeyConfig.center.label).toBe('Select');
      expect(softkeyConfig.right.label).toBe('Cancel');
      
      done();
    }, 50);
  });
  
  /**
   * Test: Back button calls onBack callback
   * Requirements: 1.7 - Back navigation
   */
  it('should call onBack when back button pressed', function(done) {
    var component = h(SettingsView, {
      onBack: mockOnBack,
      onUpdateSoftkeys: mockOnUpdateSoftkeys
    });
    
    preact.render(component, container);
    
    // Press Backspace
    var backEvent = new KeyboardEvent('keydown', { key: 'Backspace' });
    document.dispatchEvent(backEvent);
    
    setTimeout(function() {
      expect(mockOnBack).toHaveBeenCalled();
      done();
    }, 50);
  });
  
  /**
   * Test: Focused item has correct styling
   * Requirements: 1.7 - Visual focus indicators
   */
  it('should apply focused class to selected item', function(done) {
    var component = h(SettingsView, {
      onBack: mockOnBack,
      onUpdateSoftkeys: mockOnUpdateSoftkeys
    });
    
    var instance = preact.render(component, container);
    
    // First item should be focused
    var firstItem = container.querySelector('[data-testid="settings-item-data-saver"]');
    expect(firstItem.classList.contains('settings-view__item--focused')).toBe(true);
    
    // Navigate to second item
    var downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    document.dispatchEvent(downEvent);
    
    setTimeout(function() {
      preact.render(h(SettingsView, {
        onBack: mockOnBack,
        onUpdateSoftkeys: mockOnUpdateSoftkeys
      }), container);
      
      var secondItem = container.querySelector('[data-testid="settings-item-language"]');
      expect(secondItem.classList.contains('settings-view__item--focused')).toBe(true);
      
      done();
    }, 50);
  });
  
  /**
   * Test: Component cleans up event listeners
   * Requirements: 1.7 - Proper cleanup
   */
  it('should remove event listeners on unmount', function() {
    var component = h(SettingsView, {
      onBack: mockOnBack,
      onUpdateSoftkeys: mockOnUpdateSoftkeys
    });
    
    var instance = preact.render(component, container);
    
    spyOn(document, 'removeEventListener');
    
    preact.render(null, container);
    
    expect(document.removeEventListener).toHaveBeenCalledWith('keydown', jasmine.any(Function));
  });
});
