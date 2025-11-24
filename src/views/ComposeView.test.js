/**
 * ComposeView Tests
 * Requirements: 4.5, 8.1, 8.2, 8.3, 8.4
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
 * Test 1: Component renders with text area
 * Requirements: 8.1 - Support text input
 */
function testRenderWithTextArea() {
  console.log('Test 1: Component renders with text area');
  
  var container = document.createElement('div');
  var atpClient = createMockATPClient();
  
  render(h(ComposeView, {
    atpClient: atpClient,
    onSubmit: function() {},
    onCancel: function() {}
  }), container);
  
  var textarea = container.querySelector('textarea');
  var title = container.querySelector('.compose-view__title');
  
  if (!textarea) {
    console.error('❌ FAIL: Text area not found');
    return false;
  }
  
  if (!title || title.textContent !== 'New Post') {
    console.error('❌ FAIL: Title not correct');
    return false;
  }
  
  console.log('✓ PASS: Component renders with text area');
  return true;
}

/**
 * Test 2: Character counter displays correctly
 * Requirements: 8.2 - Display character counter
 */
function testCharacterCounter() {
  console.log('Test 2: Character counter displays correctly');
  
  var container = document.createElement('div');
  var atpClient = createMockATPClient();
  
  render(h(ComposeView, {
    atpClient: atpClient,
    onSubmit: function() {},
    onCancel: function() {}
  }), container);
  
  var counter = container.querySelector('.text-input__counter');
  
  if (!counter) {
    console.error('❌ FAIL: Character counter not found');
    return false;
  }
  
  if (counter.textContent !== '0/300') {
    console.error('❌ FAIL: Counter does not show 0/300, got:', counter.textContent);
    return false;
  }
  
  console.log('✓ PASS: Character counter displays correctly');
  return true;
}

/**
 * Test 3: Character limit enforcement
 * Requirements: 8.3 - Enforce character limit
 */
function testCharacterLimitEnforcement() {
  console.log('Test 3: Character limit enforcement');
  
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
    return false;
  }
  
  // Check maxLength attribute
  if (textarea.maxLength !== 300) {
    console.error('❌ FAIL: Max length not set to 300, got:', textarea.maxLength);
    return false;
  }
  
  console.log('✓ PASS: Character limit enforcement in place');
  return true;
}

/**
 * Test 4: Submit button disabled when empty
 * Requirements: 4.5 - Validate post content
 */
function testSubmitDisabledWhenEmpty() {
  console.log('Test 4: Submit button disabled when empty');
  
  var container = document.createElement('div');
  var atpClient = createMockATPClient();
  
  render(h(ComposeView, {
    atpClient: atpClient,
    onSubmit: function() {},
    onCancel: function() {}
  }), container);
  
  var buttons = container.querySelectorAll('button');
  var submitButton = null;
  
  for (var i = 0; i < buttons.length; i++) {
    if (buttons[i].textContent.indexOf('Post') !== -1) {
      submitButton = buttons[i];
      break;
    }
  }
  
  if (!submitButton) {
    console.error('❌ FAIL: Submit button not found');
    return false;
  }
  
  if (!submitButton.disabled) {
    console.error('❌ FAIL: Submit button should be disabled when empty');
    return false;
  }
  
  console.log('✓ PASS: Submit button disabled when empty');
  return true;
}

/**
 * Test 5: Cancel and submit buttons present
 * Requirements: 8.1 - Add cancel and submit actions
 */
function testCancelAndSubmitButtons() {
  console.log('Test 5: Cancel and submit buttons present');
  
  var container = document.createElement('div');
  var atpClient = createMockATPClient();
  
  render(h(ComposeView, {
    atpClient: atpClient,
    onSubmit: function() {},
    onCancel: function() {}
  }), container);
  
  var buttons = container.querySelectorAll('button');
  var hasCancelButton = false;
  var hasSubmitButton = false;
  
  for (var i = 0; i < buttons.length; i++) {
    var text = buttons[i].textContent;
    if (text.indexOf('Cancel') !== -1) {
      hasCancelButton = true;
    }
    if (text.indexOf('Post') !== -1) {
      hasSubmitButton = true;
    }
  }
  
  if (!hasCancelButton) {
    console.error('❌ FAIL: Cancel button not found');
    return false;
  }
  
  if (!hasSubmitButton) {
    console.error('❌ FAIL: Submit button not found');
    return false;
  }
  
  console.log('✓ PASS: Cancel and submit buttons present');
  return true;
}

/**
 * Test 6: Reply mode shows parent post context
 * Requirements: 4.4 - Display parent post context
 */
function testReplyModeShowsContext() {
  console.log('Test 6: Reply mode shows parent post context');
  
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
  
  var replyContext = container.querySelector('.compose-view__reply-context');
  var title = container.querySelector('.compose-view__title');
  
  if (!replyContext) {
    console.error('❌ FAIL: Reply context not found');
    return false;
  }
  
  if (!title || title.textContent !== 'Reply') {
    console.error('❌ FAIL: Title should be "Reply"');
    return false;
  }
  
  var replyText = container.querySelector('.compose-view__reply-text');
  if (!replyText || replyText.textContent !== 'This is the parent post') {
    console.error('❌ FAIL: Parent post text not displayed');
    return false;
  }
  
  console.log('✓ PASS: Reply mode shows parent post context');
  return true;
}

/**
 * Test 7: Reply mode pre-populates @mention
 * Requirements: 8.4 - Pre-populate @mention of parent author
 */
function testReplyPrePopulatesMention() {
  console.log('Test 7: Reply mode pre-populates @mention');
  
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
    return false;
  }
  
  if (textarea.value !== '@parent.bsky.social ') {
    console.error('❌ FAIL: @mention not pre-populated, got:', textarea.value);
    return false;
  }
  
  console.log('✓ PASS: Reply mode pre-populates @mention');
  return true;
}

/**
 * Test 8: Post submission calls API
 * Requirements: 4.5 - Create new posts
 */
function testPostSubmissionCallsAPI() {
  console.log('Test 8: Post submission calls API');
  
  return new Promise(function(resolve) {
    var container = document.createElement('div');
    var createPostCalled = false;
    var postText = null;
    
    var atpClient = createMockATPClient({
      createPost: function(options) {
        createPostCalled = true;
        postText = options.text;
        return Promise.resolve({
          uri: 'at://did:plc:test/app.bsky.feed.post/test123',
          cid: 'bafytest123'
        });
      }
    });
    
    render(h(ComposeView, {
      atpClient: atpClient,
      onSubmit: function() {
        if (!createPostCalled) {
          console.error('❌ FAIL: createPost not called');
          resolve(false);
          return;
        }
        
        if (postText !== 'Test post content') {
          console.error('❌ FAIL: Post text incorrect, got:', postText);
          resolve(false);
          return;
        }
        
        console.log('✓ PASS: Post submission calls API');
        resolve(true);
      },
      onCancel: function() {}
    }), container);
    
    var textarea = container.querySelector('textarea');
    var form = container.querySelector('form');
    
    // Simulate text input
    textarea.value = 'Test post content';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Wait a bit for state to update
    setTimeout(function() {
      // Submit form
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    }, 100);
  });
}

/**
 * Test 9: Reply submission includes reply references
 * Requirements: 4.4 - Include reply references in API call
 */
function testReplySubmissionIncludesReferences() {
  console.log('Test 9: Reply submission includes reply references');
  
  return new Promise(function(resolve) {
    var container = document.createElement('div');
    var replyData = null;
    
    var atpClient = createMockATPClient({
      createPost: function(options) {
        replyData = options.reply;
        return Promise.resolve({
          uri: 'at://did:plc:test/app.bsky.feed.post/test123',
          cid: 'bafytest123'
        });
      }
    });
    
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
      onSubmit: function() {
        if (!replyData) {
          console.error('❌ FAIL: Reply data not included');
          resolve(false);
          return;
        }
        
        if (!replyData.parent || replyData.parent.uri !== replyTo.post.uri) {
          console.error('❌ FAIL: Parent reference incorrect');
          resolve(false);
          return;
        }
        
        if (!replyData.root || replyData.root.uri !== replyTo.post.uri) {
          console.error('❌ FAIL: Root reference incorrect');
          resolve(false);
          return;
        }
        
        console.log('✓ PASS: Reply submission includes reply references');
        resolve(true);
      },
      onCancel: function() {},
      replyTo: replyTo
    }), container);
    
    var textarea = container.querySelector('textarea');
    var form = container.querySelector('form');
    
    // Add text after the @mention
    textarea.value = '@parent.bsky.social This is my reply';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Wait a bit for state to update
    setTimeout(function() {
      // Submit form
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    }, 100);
  });
}

/**
 * Test 10: Error handling displays error message
 * Requirements: 9.3 - Display submission errors
 */
function testErrorHandlingDisplaysMessage() {
  console.log('Test 10: Error handling displays error message');
  
  return new Promise(function(resolve) {
    var container = document.createElement('div');
    
    var atpClient = createMockATPClient({
      createPost: function() {
        return Promise.reject(new Error('Network error'));
      }
    });
    
    render(h(ComposeView, {
      atpClient: atpClient,
      onSubmit: function() {},
      onCancel: function() {}
    }), container);
    
    var textarea = container.querySelector('textarea');
    var form = container.querySelector('form');
    
    // Simulate text input
    textarea.value = 'Test post content';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Wait a bit for state to update
    setTimeout(function() {
      // Submit form
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      
      // Wait for error to be displayed
      setTimeout(function() {
        var errorMessage = container.querySelector('.error-message');
        
        if (!errorMessage) {
          console.error('❌ FAIL: Error message not displayed');
          resolve(false);
          return;
        }
        
        console.log('✓ PASS: Error handling displays error message');
        resolve(true);
      }, 100);
    }, 100);
  });
}

/**
 * Run all tests
 */
export function runComposeViewTests() {
  console.log('=== ComposeView Tests ===\n');
  
  var results = [];
  
  // Synchronous tests
  results.push(testRenderWithTextArea());
  results.push(testCharacterCounter());
  results.push(testCharacterLimitEnforcement());
  results.push(testSubmitDisabledWhenEmpty());
  results.push(testCancelAndSubmitButtons());
  results.push(testReplyModeShowsContext());
  results.push(testReplyPrePopulatesMention());
  
  // Asynchronous tests
  return Promise.all([
    testPostSubmissionCallsAPI(),
    testReplySubmissionIncludesReferences(),
    testErrorHandlingDisplaysMessage()
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
  runComposeViewTests();
}
