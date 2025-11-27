/**
 * EditProfileView Component
 * Allows users to edit their profile information
 */

import { h, Component } from 'preact';
import TextInput from '../components/TextInput.js';
import LoadingIndicator from '../components/LoadingIndicator.js';
import ErrorMessage from '../components/ErrorMessage.js';

var DISPLAY_NAME_MAX_LENGTH = 64;
var BIO_MAX_LENGTH = 256;

/**
 * EditProfileView component
 * @param {Object} props
 * @param {Object} props.atpClient - ATP API client instance
 * @param {Object} props.profile - Current user profile
 * @param {Function} props.onSave - Callback when profile is saved successfully
 * @param {Function} props.onCancel - Callback when user cancels editing
 * @param {Object} props.navigationManager - Navigation manager instance
 */
export function EditProfileView(props) {
  return h(EditProfileViewClass, props);
}

class EditProfileViewClass extends Component {
  constructor(props) {
    super(props);
    
    var profile = props.profile || {};
    
    this.state = {
      displayName: profile.displayName || '',
      bio: profile.description || '',
      loading: false,
      error: null,
      validationErrors: {}
    };

    this.handleDisplayNameChange = this.handleDisplayNameChange.bind(this);
    this.handleBioChange = this.handleBioChange.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }

  handleDisplayNameChange(e) {
    var value = e.target.value;
    
    // Enforce max length
    if (value.length > DISPLAY_NAME_MAX_LENGTH) {
      return;
    }

    this.setState({ 
      displayName: value,
      validationErrors: Object.assign({}, this.state.validationErrors, { displayName: null })
    });
  }

  handleBioChange(e) {
    var value = e.target.value;
    
    // Enforce max length
    if (value.length > BIO_MAX_LENGTH) {
      return;
    }

    this.setState({ 
      bio: value,
      validationErrors: Object.assign({}, this.state.validationErrors, { bio: null })
    });
  }

  validate() {
    var errors = {};
    var displayName = this.state.displayName.trim();
    var bio = this.state.bio.trim();

    if (displayName.length === 0) {
      errors.displayName = 'Display name cannot be empty';
    }

    if (displayName.length > DISPLAY_NAME_MAX_LENGTH) {
      errors.displayName = 'Display name is too long';
    }

    if (bio.length > BIO_MAX_LENGTH) {
      errors.bio = 'Bio is too long';
    }

    return errors;
  }

  handleSave() {
    var self = this;
    var errors = this.validate();

    if (Object.keys(errors).length > 0) {
      this.setState({ validationErrors: errors });
      return;
    }

    var displayName = this.state.displayName.trim();
    var bio = this.state.bio.trim();

    // Check if anything changed
    var profile = this.props.profile || {};
    var hasChanges = displayName !== (profile.displayName || '') || 
                     bio !== (profile.description || '');

    if (!hasChanges) {
      // Nothing to save, just go back
      if (this.props.onCancel) {
        this.props.onCancel();
      }
      return;
    }

    this.setState({ loading: true, error: null });

    var updates = {
      displayName: displayName,
      description: bio
    };

    this.props.atpClient.updateProfile(updates)
      .then(function(updatedProfile) {
        self.setState({ loading: false });
        
        if (self.props.onSave) {
          self.props.onSave(updatedProfile);
        }
      })
      .catch(function(error) {
        self.setState({
          loading: false,
          error: error.message || 'Failed to update profile'
        });
      });
  }

  handleCancel() {
    var profile = this.props.profile || {};
    var hasChanges = this.state.displayName !== (profile.displayName || '') || 
                     this.state.bio !== (profile.description || '');

    if (hasChanges) {
      // Show confirmation
      var confirmed = confirm('Discard changes?');
      if (!confirmed) {
        return;
      }
    }

    if (this.props.onCancel) {
      this.props.onCancel();
    }
  }

  render() {
    var state = this.state;
    var displayNameRemaining = DISPLAY_NAME_MAX_LENGTH - state.displayName.length;
    var bioRemaining = BIO_MAX_LENGTH - state.bio.length;

    if (state.loading) {
      return h('div', { className: 'edit-profile-view' },
        h(LoadingIndicator, { message: 'Saving profile...' })
      );
    }

    return h('div', { className: 'edit-profile-view' },
      h('div', { className: 'edit-profile-view__header' },
        h('h1', { className: 'edit-profile-view__title' }, 'Edit Profile')
      ),

      h('form', { 
        className: 'edit-profile-view__form',
        onSubmit: function(e) {
          e.preventDefault();
          this.handleSave();
        }.bind(this)
      },
        // Display Name
        h('div', { className: 'edit-profile-view__field' },
          h(TextInput, {
            label: 'Display Name',
            value: state.displayName,
            onChange: this.handleDisplayNameChange,
            maxLength: DISPLAY_NAME_MAX_LENGTH,
            error: state.validationErrors.displayName,
            'data-focusable': 'true'
          }),
          h('div', { className: 'edit-profile-view__counter' },
            displayNameRemaining + ' characters remaining'
          )
        ),

        // Bio
        h('div', { className: 'edit-profile-view__field' },
          h('label', { className: 'edit-profile-view__label' }, 'Bio'),
          h('textarea', {
            className: 'edit-profile-view__textarea' + 
              (state.validationErrors.bio ? ' edit-profile-view__textarea--error' : ''),
            value: state.bio,
            onInput: this.handleBioChange,
            maxLength: BIO_MAX_LENGTH,
            rows: 4,
            placeholder: 'Tell us about yourself...',
            'data-focusable': 'true'
          }),
          state.validationErrors.bio && h('div', { className: 'edit-profile-view__error' },
            state.validationErrors.bio
          ),
          h('div', { className: 'edit-profile-view__counter' },
            bioRemaining + ' characters remaining'
          )
        ),

        // Error message
        state.error && h(ErrorMessage, {
          message: state.error
        }),

        // Action buttons
        h('div', { className: 'edit-profile-view__actions' },
          h('button', {
            type: 'button',
            className: 'edit-profile-view__button edit-profile-view__button--cancel',
            onClick: this.handleCancel,
            'data-focusable': 'true'
          }, 'Cancel'),
          
          h('button', {
            type: 'submit',
            className: 'edit-profile-view__button edit-profile-view__button--save',
            'data-focusable': 'true'
          }, 'Save')
        )
      )
    );
  }
}
