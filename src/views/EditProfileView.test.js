/**
 * EditProfileView Component Tests
 */

import { h, render } from 'preact';
import { EditProfileView } from './EditProfileView.js';

describe('EditProfileView', function() {
  var container;

  beforeEach(function() {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function() {
    document.body.removeChild(container);
    container = null;
  });

  it('should render form with profile data', function() {
    var profile = {
      displayName: 'Test User',
      description: 'This is my bio'
    };

    var mockClient = {
      updateProfile: function() {
        return Promise.resolve({});
      }
    };

    render(h(EditProfileView, {
      atpClient: mockClient,
      profile: profile
    }), container);

    var displayNameInput = container.querySelector('input[type="text"]');
    var bioTextarea = container.querySelector('textarea');

    if (!displayNameInput || displayNameInput.value !== 'Test User') {
      throw new Error('Display name input should be populated');
    }

    if (!bioTextarea || bioTextarea.value !== 'This is my bio') {
      throw new Error('Bio textarea should be populated');
    }
  });

  it('should show character counters', function() {
    var profile = {
      displayName: 'Test',
      description: 'Bio'
    };

    var mockClient = {
      updateProfile: function() {
        return Promise.resolve({});
      }
    };

    render(h(EditProfileView, {
      atpClient: mockClient,
      profile: profile
    }), container);

    var counters = container.querySelectorAll('.edit-profile-view__counter');

    if (counters.length !== 2) {
      throw new Error('Should show 2 character counters');
    }

    // Display name: 64 - 4 = 60 remaining
    if (counters[0].textContent.indexOf('60') === -1) {
      throw new Error('Display name counter incorrect');
    }

    // Bio: 256 - 3 = 253 remaining
    if (counters[1].textContent.indexOf('253') === -1) {
      throw new Error('Bio counter incorrect');
    }
  });

  it('should update character counter on input', function() {
    var profile = {
      displayName: '',
      description: ''
    };

    var mockClient = {
      updateProfile: function() {
        return Promise.resolve({});
      }
    };

    render(h(EditProfileView, {
      atpClient: mockClient,
      profile: profile
    }), container);

    var displayNameInput = container.querySelector('input[type="text"]');
    
    // Simulate input
    displayNameInput.value = 'New Name';
    displayNameInput.dispatchEvent(new Event('input', { bubbles: true }));

    var counter = container.querySelector('.edit-profile-view__counter');

    // 64 - 8 = 56 remaining
    if (counter.textContent.indexOf('56') === -1) {
      throw new Error('Counter should update on input');
    }
  });

  it('should enforce max length on display name', function() {
    var profile = {
      displayName: '',
      description: ''
    };

    var mockClient = {
      updateProfile: function() {
        return Promise.resolve({});
      }
    };

    render(h(EditProfileView, {
      atpClient: mockClient,
      profile: profile
    }), container);

    var displayNameInput = container.querySelector('input[type="text"]');
    
    // Try to input more than max length
    var longName = 'a'.repeat(70);
    displayNameInput.value = longName;
    displayNameInput.dispatchEvent(new Event('input', { bubbles: true }));

    // Should be truncated to 64
    if (displayNameInput.value.length > 64) {
      throw new Error('Display name should be limited to 64 characters');
    }
  });

  it('should enforce max length on bio', function() {
    var profile = {
      displayName: 'Test',
      description: ''
    };

    var mockClient = {
      updateProfile: function() {
        return Promise.resolve({});
      }
    };

    render(h(EditProfileView, {
      atpClient: mockClient,
      profile: profile
    }), container);

    var bioTextarea = container.querySelector('textarea');
    
    // Try to input more than max length
    var longBio = 'a'.repeat(300);
    bioTextarea.value = longBio;
    bioTextarea.dispatchEvent(new Event('input', { bubbles: true }));

    // Should be truncated to 256
    if (bioTextarea.value.length > 256) {
      throw new Error('Bio should be limited to 256 characters');
    }
  });

  it('should validate empty display name', function() {
    var profile = {
      displayName: 'Test',
      description: 'Bio'
    };

    var mockClient = {
      updateProfile: function() {
        return Promise.resolve({});
      }
    };

    render(h(EditProfileView, {
      atpClient: mockClient,
      profile: profile
    }), container);

    var displayNameInput = container.querySelector('input[type="text"]');
    var saveButton = container.querySelector('.edit-profile-view__button--save');

    // Clear display name
    displayNameInput.value = '';
    displayNameInput.dispatchEvent(new Event('input', { bubbles: true }));

    // Try to save
    saveButton.click();

    var error = container.querySelector('.text-input__error');

    if (!error) {
      throw new Error('Should show validation error for empty display name');
    }
  });

  it('should call updateProfile on save', function(done) {
    var profile = {
      displayName: 'Old Name',
      description: 'Old Bio'
    };

    var updateCalled = false;
    var updatedData = null;

    var mockClient = {
      updateProfile: function(updates) {
        updateCalled = true;
        updatedData = updates;
        return Promise.resolve(Object.assign({}, profile, updates));
      }
    };

    render(h(EditProfileView, {
      atpClient: mockClient,
      profile: profile
    }), container);

    var displayNameInput = container.querySelector('input[type="text"]');
    var saveButton = container.querySelector('.edit-profile-view__button--save');

    // Change display name
    displayNameInput.value = 'New Name';
    displayNameInput.dispatchEvent(new Event('input', { bubbles: true }));

    // Save
    saveButton.click();

    setTimeout(function() {
      if (!updateCalled) {
        done(new Error('updateProfile should be called'));
        return;
      }

      if (updatedData.displayName !== 'New Name') {
        done(new Error('Should pass new display name'));
        return;
      }

      done();
    }, 50);
  });

  it('should call onSave callback on success', function(done) {
    var profile = {
      displayName: 'Old Name',
      description: 'Old Bio'
    };

    var saveCalled = false;

    var mockClient = {
      updateProfile: function(updates) {
        return Promise.resolve(Object.assign({}, profile, updates));
      }
    };

    var onSave = function(updatedProfile) {
      saveCalled = true;
      if (updatedProfile.displayName !== 'New Name') {
        throw new Error('Should pass updated profile to callback');
      }
    };

    render(h(EditProfileView, {
      atpClient: mockClient,
      profile: profile,
      onSave: onSave
    }), container);

    var displayNameInput = container.querySelector('input[type="text"]');
    var saveButton = container.querySelector('.edit-profile-view__button--save');

    displayNameInput.value = 'New Name';
    displayNameInput.dispatchEvent(new Event('input', { bubbles: true }));

    saveButton.click();

    setTimeout(function() {
      if (!saveCalled) {
        done(new Error('onSave callback should be called'));
        return;
      }

      done();
    }, 50);
  });

  it('should show loading state during save', function(done) {
    var profile = {
      displayName: 'Test',
      description: 'Bio'
    };

    var mockClient = {
      updateProfile: function() {
        return new Promise(function(resolve) {
          setTimeout(function() {
            resolve(profile);
          }, 100);
        });
      }
    };

    render(h(EditProfileView, {
      atpClient: mockClient,
      profile: profile
    }), container);

    var displayNameInput = container.querySelector('input[type="text"]');
    var saveButton = container.querySelector('.edit-profile-view__button--save');

    displayNameInput.value = 'New Name';
    displayNameInput.dispatchEvent(new Event('input', { bubbles: true }));

    saveButton.click();

    setTimeout(function() {
      var loading = container.querySelector('.loading-indicator');
      
      if (!loading) {
        done(new Error('Should show loading indicator'));
        return;
      }

      done();
    }, 10);
  });

  it('should show error on save failure', function(done) {
    var profile = {
      displayName: 'Test',
      description: 'Bio'
    };

    var mockClient = {
      updateProfile: function() {
        return Promise.reject(new Error('Network error'));
      }
    };

    render(h(EditProfileView, {
      atpClient: mockClient,
      profile: profile
    }), container);

    var displayNameInput = container.querySelector('input[type="text"]');
    var saveButton = container.querySelector('.edit-profile-view__button--save');

    displayNameInput.value = 'New Name';
    displayNameInput.dispatchEvent(new Event('input', { bubbles: true }));

    saveButton.click();

    setTimeout(function() {
      var error = container.querySelector('.error-message');
      
      if (!error) {
        done(new Error('Should show error message'));
        return;
      }

      done();
    }, 50);
  });

  it('should call onCancel when cancel button clicked', function() {
    var profile = {
      displayName: 'Test',
      description: 'Bio'
    };

    var cancelCalled = false;

    var mockClient = {
      updateProfile: function() {
        return Promise.resolve({});
      }
    };

    var onCancel = function() {
      cancelCalled = true;
    };

    render(h(EditProfileView, {
      atpClient: mockClient,
      profile: profile,
      onCancel: onCancel
    }), container);

    var cancelButton = container.querySelector('.edit-profile-view__button--cancel');
    
    cancelButton.click();

    if (!cancelCalled) {
      throw new Error('onCancel callback should be called');
    }
  });

  it('should not save if no changes made', function() {
    var profile = {
      displayName: 'Test',
      description: 'Bio'
    };

    var updateCalled = false;
    var cancelCalled = false;

    var mockClient = {
      updateProfile: function() {
        updateCalled = true;
        return Promise.resolve({});
      }
    };

    var onCancel = function() {
      cancelCalled = true;
    };

    render(h(EditProfileView, {
      atpClient: mockClient,
      profile: profile,
      onCancel: onCancel
    }), container);

    var saveButton = container.querySelector('.edit-profile-view__button--save');
    
    saveButton.click();

    if (updateCalled) {
      throw new Error('Should not call updateProfile if no changes');
    }

    if (!cancelCalled) {
      throw new Error('Should call onCancel if no changes');
    }
  });
});
