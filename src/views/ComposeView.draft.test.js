/**
 * ComposeView Draft Auto-Save Tests
 * Requirements: 8.4 - Draft persistence
 */

import { h, render } from 'preact';
import ComposeView from './ComposeView.js';

/**
 * Mock ATP Client
 */
function createMockATPClient(options) {
  options = options || {};
  
  return {
    createPost: options.createPost || function(postOptions) {
      return Promise.resolve({
        uri: 'at://did:plc:test/app.bsky.feed.post/test123',
        cid: 'bafytest123'
      });
    },
    getSession: function() {
      return {
        did: 'did:plc:test',
        handle: 'test.bsky.social'
      };
    }
  };
}

/**
 * Test 1: Draft is saved to LocalStorage on text change
 * Requirements: 8.4 - Save draft to LocalStorage on text change (debounced)
 */
function testDraftSavedToLocalStorage() {
  console.log('Test 1: Draft is saved to LocalStorage on text change');
  
  return new Promise(function(resolve) {
    // Clear any existing draft
    localStorage.removeItem('compose_draft');
    
    var container = document.createElement('div');
    var atpClient = createMockATPClient();
    
    render(h(ComposeView, {
      atpClient: atpClient,
      onSubmit: function() {},
      onCancel: function() {}
    }), container);
    
    var textarea = container.querySelector('textarea');
    
    if (!textarea) {
      console.error('❌ FAIL: Text area not found');
      resolve(false);
      return;
    }
    
    // Simulate text input
    textarea.value = 'This is a draft post';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Wait for debounce (500ms + buffer)
    setTimeout(function() {
      var savedDraft = localStorage.getItem('compose_draft');
      
      if (!savedDraft) {
        console.error('❌ FAIL: Draft not saved to LocalStorage');
        resolve(false);
        return;
      }
      
      if (savedDraft !== 'This is a draft post') {
        console.error('❌ FAIL: Draft content incorrect, got:', savedDraft);
        resolve(false);
        return;
      }
      
      console.log('✓ PASS: Draft is saved to LocalStorage on text change');
      
      // Cleanup
      localStorage.removeItem('compose_draft');
      resolve(true);
    }, 700);
  });
}

/**
 * Test 2: Draft is restored on ComposeView mount
 * Requirements: 8.4 - Restore draft on ComposeView mount
 */
function testDraftRestoredOnMount() {
  console.log('Test 2: Draft is restored on ComposeView mount');
  
  // Set a draft in LocalStorage
  localStorage.setItem('compose_draft', 'Restored draft content');
  
  var container = document.createElement('div');
  var atpClient = createMockATPClient();
  
  render(h(ComposeView, {
    atpClient: atpClient,
    onSubmit: function() {},
    onCancel: function() {}
  }), container);
  
  var textarea = container.querySelector('textarea');
  
  if (!textarea) {
    console.error('❌ FAIL: Text area not found');
    localStorage.removeItem('compose_draft');
    return false;
  }
  
  if (textarea.value !== 'Restored draft content') {
    console.error('❌ FAIL: Draft not restored, got:', textarea.value);
    localStorage.removeItem('compose_draft');
    return false;
  }
  
  console.log('✓ PASS: Draft is restored on ComposeView mount');
  
  // Cleanup
  localStorage.removeItem('compose_draft');
  return true;
}

/**
 * Test 3: Draft is cleared on successful submission
 * Requirements: 8.4 - Clear draft on successful submission
 */
function testDraftClearedOnSubmission() {
  console.log('Test 3: Draft is cleared on successful submission');
  
  return new Promise(function(resolve) {
    // Set a draft in LocalStorage
    localStorage.setItem('compose_draft', 'Draft to be cleared');
    
    var container = document.createElement('div');
    var atpClient = createMockATPClient();
    
    render(h(ComposeView, {
      atpClient: atpClient,
      onSubmit: function() {
        // Check if draft was cleared
        var draft = localStorage.getItem('compose_draft');
        
        if (draft !== null) {
          console.error('❌ FAIL: Draft not cleared after submission, got:', draft);
          localStorage.removeItem('compose_draft');
          resolve(false);
          return;
        }
        
        console.log('✓ PASS: Draft is cleared on successful submission');
        resolve(true);
      },
      onCancel: function() {}
    }), container);
    
    var textarea = container.querySelector('textarea');
    var form = container.querySelector('form');
    
    // Add text
    textarea.value = 'Post content';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Wait a bit for state to update
    setTimeout(function() {
      // Submit form
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    }, 100);
  });
}

/**
 * Test 4: Draft is cleared on confirmed cancel
 * Requirements: 8.4 - Clear draft on confirmed cancel
 */
function testDraftClearedOnCancel() {
  console.log('Test 4: Draft is cleared on confirmed cancel');
  
  return new Promise(function(resolve) {
    // Set a draft in LocalStorage
    localStorage.setItem('compose_draft', 'Draft to be cleared on cancel');
    
    var container = document.createElement('div');
    var atpClient = createMockATPClient();
    
    render(h(ComposeView, {
      atpClient: atpClient,
      onSubmit: function() {},
      onCancel: function() {
        // Check if draft was cleared
        var draft = localStorage.getItem('compose_draft');
        
        if (draft !== null) {
          console.error('❌ FAIL: Draft not cleared after cancel, got:', draft);
          localStorage.removeItem('compose_draft');
          resolve(false);
          return;
        }
        
        console.log('✓ PASS: Draft is cleared on confirmed cancel');
        resolve(true);
      }
    }), container);
    
    var textarea = container.querySelector('textarea');
    
    // Add text
    textarea.value = 'Some content';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Wait a bit for state to update
    setTimeout(function() {
      // Click cancel button
      var buttons = container.querySelectorAll('button');
      var cancelButton = null;
      
      for (var i = 0; i < buttons.length; i++) {
        if (buttons[i].textContent.indexOf('Cancel') !== -1) {
          cancelButton = buttons[i];
          break;
        }
      }
      
      if (!cancelButton) {
        console.error('❌ FAIL: Cancel button not found');
        localStorage.removeItem('compose_draft');
        resolve(false);
        return;
      }
      
      // Click cancel
      cancelButton.click();
      
      // Wait for modal to appear
      setTimeout(function() {
        // Find and click the "Discard" button in the modal
        var modalButtons = container.querySelectorAll('button');
        var discardButton = null;
        
        for (var i = 0; i < modalButtons.length; i++) {
          if (modalButtons[i].textContent.indexOf('Discard') !== -1) {
            discardButton = modalButtons[i];
            break;
          }
        }
        
        if (!discardButton) {
          console.error('❌ FAIL: Discard button not found');
          localStorage.removeItem('compose_draft');
          resolve(false);
          return;
        }
        
        // Click discard
        discardButton.click();
      }, 100);
    }, 100);
  });
}

/**
 * Test 5: Draft is not saved for reply posts
 * Requirements: 8.4 - Only save drafts for new posts, not replies
 */
function testDraftNotSavedForReplies() {
  console.log('Test 5: Draft is not saved for reply posts');
  
  return new Promise(function(resolve) {
    // Clear any existing draft
    localStorage.removeItem('compose_draft');
    
    var container = document.createElement('div');
    var atpClient = createMockATPClient();
    
    var replyTo = {
      post: {
        uri: 'at://did:plc:parent/app.bsky.feed.post/parent123',
        cid: 'bafyparent123',
        author: {
          handle: 'parent.bsky.social',
          displayName: 'Parent User'
        },
        record: {
          text: 'This is the parent post'
        }
      }
    };
    
    render(h(ComposeView, {
      atpClient: atpClient,
      onSubmit: function() {},
      onCancel: function() {},
      replyTo: replyTo
    }), container);
    
    var textarea = container.querySelector('textarea');
    
    if (!textarea) {
      console.error('❌ FAIL: Text area not found');
      resolve(false);
      return;
    }
    
    // Simulate text input
    textarea.value = '@parent.bsky.social This is a reply';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Wait for debounce (500ms + buffer)
    setTimeout(function() {
      var savedDraft = localStorage.getItem('compose_draft');
      
      if (savedDraft !== null) {
        console.error('❌ FAIL: Draft should not be saved for replies, got:', savedDraft);
        localStorage.removeItem('compose_draft');
        resolve(false);
        return;
      }
      
      console.log('✓ PASS: Draft is not saved for reply posts');
      resolve(true);
    }, 700);
  });
}

/**
 * Test 6: Empty drafts are not saved
 * Requirements: 8.4 - Only save non-empty drafts
 */
function testEmptyDraftsNotSaved() {
  console.log('Test 6: Empty drafts are not saved');
  
  return new Promise(function(resolve) {
    // Clear any existing draft
    localStorage.removeItem('compose_draft');
    
    var container = document.createElement('div');
    var atpClient = createMockATPClient();
    
    render(h(ComposeView, {
      atpClient: atpClient,
      onSubmit: function() {},
      onCancel: function() {}
    }), container);
    
    var textarea = container.querySelector('textarea');
    
    if (!textarea) {
      console.error('❌ FAIL: Text area not found');
      resolve(false);
      return;
    }
    
    // Simulate empty input
    textarea.value = '';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Wait for debounce (500ms + buffer)
    setTimeout(function() {
      var savedDraft = localStorage.getItem('compose_draft');
      
      if (savedDraft !== null) {
        console.error('❌ FAIL: Empty draft should not be saved, got:', savedDraft);
        localStorage.removeItem('compose_draft');
        resolve(false);
        return;
      }
      
      console.log('✓ PASS: Empty drafts are not saved');
      resolve(true);
    }, 700);
  });
}

/**
 * Run all draft tests
 */
export function runComposeViewDraftTests() {
  console.log('=== ComposeView Draft Auto-Save Tests ===\n');
  
  var results = [];
  
  // Synchronous test
  results.push(testDraftRestoredOnMount());
  
  // Asynchronous tests
  return Promise.all([
    testDraftSavedToLocalStorage(),
    testDraftClearedOnSubmission(),
    testDraftClearedOnCancel(),
    testDraftNotSavedForReplies(),
    testEmptyDraftsNotSaved()
  ])
  .then(function(asyncResults) {
    results = results.concat(asyncResults);
    
    var passed = results.filter(function(r) { return r === true; }).length;
    var failed = results.filter(function(r) { return r === false; }).length;
    
    console.log('\n=== Test Summary ===');
    console.log('Total: ' + results.length);
    console.log('Passed: ' + passed);
    console.log('Failed: ' + failed);
    
    return {
      total: results.length,
      passed: passed,
      failed: failed,
      success: failed === 0
    };
  });
}

// Auto-run tests if this is the main module
if (typeof window !== 'undefined') {
  runComposeViewDraftTests();
}
