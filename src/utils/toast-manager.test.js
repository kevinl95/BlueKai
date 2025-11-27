/**
 * Toast Manager Tests
 */

import {
  showToast,
  showInfo,
  showSuccess,
  showWarning,
  showError,
  dismissToast,
  dismissAll,
  getToasts,
  subscribe
} from './toast-manager.js';

describe('Toast Manager', function() {
  beforeEach(function() {
    dismissAll();
  });

  it('should show a toast', function() {
    var id = showToast('Test message', { type: 'info' });
    var toasts = getToasts();
    
    console.assert(toasts.length === 1, 'Should have one toast');
    console.assert(toasts[0].id === id, 'Should return toast ID');
    console.assert(toasts[0].message === 'Test message', 'Should set message');
    console.assert(toasts[0].type === 'info', 'Should set type');
  });

  it('should show info toast', function() {
    showInfo('Info message');
    var toasts = getToasts();
    
    console.assert(toasts[0].type === 'info', 'Should be info type');
    console.assert(toasts[0].message === 'Info message', 'Should set message');
  });

  it('should show success toast', function() {
    showSuccess('Success message');
    var toasts = getToasts();
    
    console.assert(toasts[0].type === 'success', 'Should be success type');
  });

  it('should show warning toast', function() {
    showWarning('Warning message');
    var toasts = getToasts();
    
    console.assert(toasts[0].type === 'warning', 'Should be warning type');
  });

  it('should show error toast with longer duration', function() {
    showError('Error message');
    var toasts = getToasts();
    
    console.assert(toasts[0].type === 'error', 'Should be error type');
    console.assert(toasts[0].duration === 5000, 'Should have 5 second duration');
  });

  it('should allow custom duration', function() {
    showToast('Test', { duration: 10000 });
    var toasts = getToasts();
    
    console.assert(toasts[0].duration === 10000, 'Should set custom duration');
  });

  it('should dismiss toast by ID', function() {
    var id1 = showToast('Toast 1');
    var id2 = showToast('Toast 2');
    
    console.assert(getToasts().length === 2, 'Should have two toasts');
    
    dismissToast(id1);
    var toasts = getToasts();
    
    console.assert(toasts.length === 1, 'Should have one toast');
    console.assert(toasts[0].id === id2, 'Should keep second toast');
  });

  it('should dismiss all toasts', function() {
    showToast('Toast 1');
    showToast('Toast 2');
    showToast('Toast 3');
    
    console.assert(getToasts().length === 3, 'Should have three toasts');
    
    dismissAll();
    console.assert(getToasts().length === 0, 'Should dismiss all toasts');
  });

  it('should notify subscribers of changes', function() {
    var notificationCount = 0;
    var lastToasts = null;
    
    var unsubscribe = subscribe(function(toasts) {
      notificationCount++;
      lastToasts = toasts;
    });
    
    showToast('Test 1');
    console.assert(notificationCount === 1, 'Should notify on show');
    console.assert(lastToasts.length === 1, 'Should pass toasts to subscriber');
    
    showToast('Test 2');
    console.assert(notificationCount === 2, 'Should notify on second show');
    console.assert(lastToasts.length === 2, 'Should pass updated toasts');
    
    dismissAll();
    console.assert(notificationCount === 3, 'Should notify on dismiss');
    console.assert(lastToasts.length === 0, 'Should pass empty array');
    
    unsubscribe();
  });

  it('should unsubscribe listeners', function() {
    var notificationCount = 0;
    
    var unsubscribe = subscribe(function() {
      notificationCount++;
    });
    
    showToast('Test 1');
    console.assert(notificationCount === 1, 'Should notify before unsubscribe');
    
    unsubscribe();
    
    showToast('Test 2');
    console.assert(notificationCount === 1, 'Should not notify after unsubscribe');
  });

  it('should generate unique IDs', function() {
    var id1 = showToast('Toast 1');
    var id2 = showToast('Toast 2');
    var id3 = showToast('Toast 3');
    
    console.assert(id1 !== id2, 'IDs should be unique');
    console.assert(id2 !== id3, 'IDs should be unique');
    console.assert(id1 !== id3, 'IDs should be unique');
  });

  it('should return copy of toasts array', function() {
    showToast('Test');
    var toasts1 = getToasts();
    var toasts2 = getToasts();
    
    console.assert(toasts1 !== toasts2, 'Should return different array instances');
    console.assert(toasts1.length === toasts2.length, 'Should have same content');
  });
});

console.log('Toast Manager tests completed');
