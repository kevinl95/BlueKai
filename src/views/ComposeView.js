import { h } from 'preact';
import { useState, useEffect, useMemo } from 'preact/hooks';
import TextInput from '../components/TextInput.js';
import Button from '../components/Button.js';
import ErrorMessage from '../components/ErrorMessage.js';
import Modal from '../components/Modal.js';
import * as performance from '../utils/performance.js';

/**
 * ComposeView - Post composition interface
 * Requirements: 4.5, 8.1, 8.2, 8.3, 8.4
 * 
 * @param {Object} props
 * @param {Function} props.onSubmit - Callback when post is submitted (receives post text and reply context)
 * @param {Function} props.onCancel - Callback when composition is cancelled
 * @param {Object} props.atpClient - ATP client instance
 * @param {Object} props.replyTo - Reply context (optional)
 * @param {Object} props.replyTo.post - Post being replied to
 * @param {string} props.replyTo.post.uri - Post URI
 * @param {string} props.replyTo.post.cid - Post CID
 * @param {Object} props.replyTo.post.author - Post author
 * @param {string} props.replyTo.post.author.handle - Author handle
 * @param {string} props.replyTo.post.author.displayName - Author display name
 * @param {string} props.replyTo.post.record.text - Post text
 */
function ComposeView(props) {
  var onSubmit = props.onSubmit;
  var onCancel = props.onCancel;
  var atpClient = props.atpClient;
  var replyTo = props.replyTo;
  
  var isReply = !!replyTo;
  var MAX_LENGTH = 300;
  var DRAFT_KEY = 'compose_draft';
  
  // Initialize text with @mention if replying
  var initialText = '';
  if (isReply && replyTo.post && replyTo.post.author) {
    initialText = '@' + replyTo.post.author.handle + ' ';
  }
  
  var _useState = useState(initialText);
  var text = _useState[0];
  var setText = _useState[1];
  
  var _useState2 = useState(false);
  var loading = _useState2[0];
  var setLoading = _useState2[1];
  
  var _useState3 = useState(null);
  var error = _useState3[0];
  var setError = _useState3[1];
  
  var _useState4 = useState(false);
  var showCancelConfirm = _useState4[0];
  var setShowCancelConfirm = _useState4[1];
  
  /**
   * Restore draft on mount (only for non-reply posts)
   * Requirements: 8.4 - Restore draft on ComposeView mount
   */
  useEffect(function() {
    if (!isReply) {
      var draft = localStorage.getItem(DRAFT_KEY);
      if (draft) {
        setText(draft);
      }
    }
  }, []);
  
  /**
   * Auto-save draft on text change (debounced)
   * Requirements: 8.4 - Save draft to LocalStorage on text change
   */
  useEffect(function() {
    if (!isReply && text && text.trim() !== '') {
      var timeoutId = setTimeout(function() {
        localStorage.setItem(DRAFT_KEY, text);
      }, 500); // 500ms debounce
      
      return function() {
        clearTimeout(timeoutId);
      };
    }
  }, [text, isReply]);
  
  /**
   * Handle text change
   * Requirements: 8.2 - Display character counter
   * Requirements: 8.3 - Enforce character limit
   */
  var handleTextChange = function(newText) {
    // Character limit is enforced by TextInput component
    setText(newText);
  };
  
  /**
   * Handle form submission
   * Requirements: 4.5 - Allow creating new posts up to 300 characters
   * Requirements: 4.4 - Include reply references in API call
   */
  var handleSubmit = function(e) {
    if (e) {
      e.preventDefault();
    }
    
    // Clear previous errors
    setError(null);
    
    // Validate text
    if (!text || text.trim() === '') {
      setError('Post cannot be empty');
      return;
    }
    
    if (text.length > MAX_LENGTH) {
      setError('Post exceeds character limit');
      return;
    }
    
    // Set loading state
    setLoading(true);
    
    // Build post options
    var postOptions = {
      text: text.trim()
    };
    
    // Add reply reference if replying
    if (isReply && replyTo.post) {
      postOptions.reply = {
        root: replyTo.root || {
          uri: replyTo.post.uri,
          cid: replyTo.post.cid
        },
        parent: {
          uri: replyTo.post.uri,
          cid: replyTo.post.cid
        }
      };
    }
    
    // Submit post
    atpClient.createPost(postOptions)
      .then(function(result) {
        setLoading(false);
        
        // Clear draft on successful submission
        if (!isReply) {
          localStorage.removeItem(DRAFT_KEY);
        }
        
        // Call onSubmit callback
        if (onSubmit) {
          onSubmit(result);
        }
      })
      .catch(function(err) {
        setLoading(false);
        
        // Map error to user-friendly message
        var errorMessage = getSubmitErrorMessage(err);
        setError(errorMessage);
      });
  };
  
  /**
   * Handle cancel button
   * Requirements: 8.4 - Show confirmation on cancel if text entered
   */
  var handleCancel = function() {
    // Check if there's text entered (excluding initial @mention for replies)
    var hasContent = false;
    if (isReply) {
      var mentionText = '@' + replyTo.post.author.handle + ' ';
      hasContent = text.trim() !== '' && text.trim() !== mentionText.trim();
    } else {
      hasContent = text.trim() !== '';
    }
    
    if (hasContent) {
      // Show confirmation modal
      setShowCancelConfirm(true);
    } else {
      // No content, cancel immediately
      confirmCancel();
    }
  };
  
  /**
   * Confirm cancel and clear draft
   * Requirements: 8.4 - Clear draft on confirmed cancel
   */
  var confirmCancel = function() {
    // Clear draft
    if (!isReply) {
      localStorage.removeItem(DRAFT_KEY);
    }
    
    // Close confirmation modal
    setShowCancelConfirm(false);
    
    // Call onCancel callback
    if (onCancel) {
      onCancel();
    }
  };
  
  /**
   * Close cancel confirmation modal
   */
  var closeCancelConfirm = function() {
    setShowCancelConfirm(false);
  };
  
  /**
   * Handle retry after error
   */
  var handleRetry = function() {
    setError(null);
  };
  
  /**
   * Get user-friendly error message for submission errors
   * Requirements: 9.3 - Offer to retry when post fails to send
   */
  var getSubmitErrorMessage = function(err) {
    if (!err) {
      return 'Failed to post. Please try again.';
    }
    
    // Network errors
    if (err.message && (
      err.message.indexOf('Network') !== -1 ||
      err.message.indexOf('Failed to fetch') !== -1 ||
      err.message.indexOf('timeout') !== -1
    )) {
      return 'Cannot connect. Check your connection.';
    }
    
    // Authentication errors (401)
    if (err.status === 401) {
      return 'Session expired. Please log in again.';
    }
    
    // Rate limiting (429)
    if (err.status === 429) {
      return 'Too many posts. Please wait and try again.';
    }
    
    // Server errors (500+)
    if (err.status && err.status >= 500) {
      return 'BlueSky is having issues. Try again later.';
    }
    
    // Generic error
    return err.message || 'Failed to post. Please try again.';
  };
  
  var charCount = text.length;
  var isOverLimit = charCount > MAX_LENGTH;
  var canSubmit = text.trim() !== '' && !isOverLimit && !loading;
  
  return h('div', { className: 'compose-view' },
    h('div', { className: 'compose-view__container' },
      h('div', { className: 'compose-view__header' },
        h('h1', { className: 'compose-view__title' }, 
          isReply ? 'Reply' : 'New Post'
        )
      ),
      
      // Show parent post context if replying
      isReply && replyTo.post && h('div', { className: 'compose-view__reply-context' },
        h('div', { className: 'compose-view__reply-label' }, 'Replying to'),
        h('div', { className: 'compose-view__reply-post' },
          h('div', { className: 'compose-view__reply-author' },
            h('span', { className: 'compose-view__reply-author-name' },
              replyTo.post.author.displayName || replyTo.post.author.handle
            ),
            h('span', { className: 'compose-view__reply-author-handle' },
              '@' + replyTo.post.author.handle
            )
          ),
          h('div', { className: 'compose-view__reply-text' },
            replyTo.post.record.text
          )
        )
      ),
      
      h('form', {
        className: 'compose-view__form',
        onSubmit: handleSubmit,
        noValidate: true
      },
        h(TextInput, {
          id: 'compose-text',
          label: 'What\'s happening?',
          value: text,
          onChange: handleTextChange,
          placeholder: isReply ? 'Write your reply...' : 'Share your thoughts...',
          maxLength: MAX_LENGTH,
          multiline: true,
          rows: 6,
          showCounter: true,
          required: true
        }),
        
        error && h(ErrorMessage, {
          error: error,
          onRetry: handleRetry,
          inline: true
        }),
        
        h('div', { className: 'compose-view__actions' },
          h(Button, {
            type: 'button',
            onClick: handleCancel,
            disabled: loading,
            variant: 'secondary'
          }, 'Cancel'),
          
          h(Button, {
            type: 'submit',
            loading: loading,
            disabled: !canSubmit,
            variant: 'primary'
          }, isReply ? 'Reply' : 'Post')
        )
      )
    ),
    
    // Cancel confirmation modal
    showCancelConfirm && h(Modal, {
      isOpen: showCancelConfirm,
      onClose: closeCancelConfirm,
      title: 'Discard ' + (isReply ? 'reply' : 'post') + '?'
    },
      h('div', { className: 'compose-view__confirm-content' },
        h('p', null, 
          'Are you sure you want to discard this ' + 
          (isReply ? 'reply' : 'post') + '? Your changes will be lost.'
        ),
        h('div', { className: 'compose-view__confirm-actions' },
          h(Button, {
            onClick: closeCancelConfirm,
            variant: 'secondary'
          }, 'Keep Editing'),
          h(Button, {
            onClick: confirmCancel,
            variant: 'danger'
          }, 'Discard')
        )
      )
    )
  );
}

export default ComposeView;
