/**
 * Unit tests for TextProcessor
 * Simple test runner compatible with Gecko 48
 */

// Test runner
function runTextProcessorTests() {
  var tests = [];
  var passed = 0;
  var failed = 0;
  
  function test(name, fn) {
    tests.push({ name: name, fn: fn });
  }
  
  function assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }
  
  function assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(message || 'Expected "' + expected + '" but got "' + actual + '"');
    }
  }
  
  function assertContains(text, substring, message) {
    if (text.indexOf(substring) === -1) {
      throw new Error(message || 'Expected "' + text + '" to contain "' + substring + '"');
    }
  }
  
  // Load TextProcessor
  var TextProcessor;
  if (typeof require !== 'undefined') {
    try {
      TextProcessor = require('./text-processor.js');
    } catch (e) {
      console.error('Failed to load TextProcessor:', e.message);
      return { passed: 0, failed: 0, total: 0 };
    }
  } else if (typeof window !== 'undefined' && window.TextProcessor) {
    TextProcessor = window.TextProcessor;
  }
  
  if (!TextProcessor) {
    console.error('TextProcessor not found');
    return { passed: 0, failed: 0, total: 0 };
  }
  
  // Test: Truncate short text
  test('should not truncate text shorter than max length', function() {
    var processor = new TextProcessor();
    var text = 'Short text';
    var result = processor.truncate(text, 20);
    
    assertEqual(result, text, 'should return original text');
  });
  
  // Test: Truncate long text
  test('should truncate long text with ellipsis', function() {
    var processor = new TextProcessor();
    var text = 'This is a very long text that needs to be truncated';
    var result = processor.truncate(text, 20);
    
    assert(result.length <= 20, 'should be within max length');
    assert(result.indexOf('...') !== -1, 'should include ellipsis');
  });
  
  // Test: Truncate at word boundary
  test('should truncate at word boundary when possible', function() {
    var processor = new TextProcessor();
    var text = 'This is a test message';
    var result = processor.truncate(text, 15);
    
    assert(result.length <= 15, 'should be within max length');
    assert(result.indexOf('...') !== -1, 'should include ellipsis');
  });
  
  // Test: Custom ellipsis
  test('should support custom ellipsis', function() {
    var processor = new TextProcessor();
    var text = 'This is a long text';
    var result = processor.truncate(text, 10, '…');
    
    assert(result.indexOf('…') !== -1, 'should include custom ellipsis');
  });
  
  // Test: Detect URLs
  test('should detect HTTP URLs', function() {
    var processor = new TextProcessor();
    var text = 'Check out http://example.com for more info';
    var urls = processor.detectUrls(text);
    
    assertEqual(urls.length, 1, 'should find one URL');
    assertEqual(urls[0].url, 'http://example.com', 'should extract correct URL');
  });
  
  // Test: Detect HTTPS URLs
  test('should detect HTTPS URLs', function() {
    var processor = new TextProcessor();
    var text = 'Visit https://secure.example.com/path?query=value';
    var urls = processor.detectUrls(text);
    
    assertEqual(urls.length, 1, 'should find one URL');
    assertContains(urls[0].url, 'https://secure.example.com', 'should extract HTTPS URL');
  });
  
  // Test: Detect multiple URLs
  test('should detect multiple URLs', function() {
    var processor = new TextProcessor();
    var text = 'Check http://example.com and https://another.com';
    var urls = processor.detectUrls(text);
    
    assertEqual(urls.length, 2, 'should find two URLs');
  });
  
  // Test: Linkify URLs
  test('should linkify URLs in text', function() {
    var processor = new TextProcessor();
    var text = 'Visit http://example.com';
    var result = processor.linkify(text);
    
    assertContains(result, '<a href="http://example.com"', 'should create link');
    assertContains(result, 'target="_blank"', 'should open in new tab');
    assertContains(result, 'rel="noopener noreferrer"', 'should have security attributes');
  });
  
  // Test: Linkify with class
  test('should linkify URLs with custom class', function() {
    var processor = new TextProcessor();
    var text = 'Visit http://example.com';
    var result = processor.linkify(text, 'custom-link');
    
    assertContains(result, 'class="custom-link"', 'should include custom class');
  });
  
  // Test: Detect mentions
  test('should detect simple mentions', function() {
    var processor = new TextProcessor();
    var text = 'Hello @username, how are you?';
    var mentions = processor.detectMentions(text);
    
    assertEqual(mentions.length, 1, 'should find one mention');
    assertEqual(mentions[0].handle, 'username', 'should extract handle');
  });
  
  // Test: Detect domain mentions
  test('should detect mentions with domains', function() {
    var processor = new TextProcessor();
    var text = 'Hey @user.bsky.social!';
    var mentions = processor.detectMentions(text);
    
    assertEqual(mentions.length, 1, 'should find one mention');
    assertEqual(mentions[0].handle, 'user.bsky.social', 'should extract full handle');
  });
  
  // Test: Detect multiple mentions
  test('should detect multiple mentions', function() {
    var processor = new TextProcessor();
    var text = '@alice and @bob are here';
    var mentions = processor.detectMentions(text);
    
    assertEqual(mentions.length, 2, 'should find two mentions');
    assertEqual(mentions[0].handle, 'alice', 'should extract first handle');
    assertEqual(mentions[1].handle, 'bob', 'should extract second handle');
  });
  
  // Test: Detect hashtags
  test('should detect hashtags', function() {
    var processor = new TextProcessor();
    var text = 'This is #awesome and #cool';
    var hashtags = processor.detectHashtags(text);
    
    assertEqual(hashtags.length, 2, 'should find two hashtags');
    assertEqual(hashtags[0].tag, 'awesome', 'should extract first tag');
    assertEqual(hashtags[1].tag, 'cool', 'should extract second tag');
  });
  
  // Test: Count ASCII characters
  test('should count ASCII characters', function() {
    var processor = new TextProcessor();
    var text = 'Hello World';
    var count = processor.countCharacters(text);
    
    assertEqual(count, 11, 'should count 11 characters');
  });
  
  // Test: Count Unicode characters
  test('should count Unicode characters correctly', function() {
    var processor = new TextProcessor();
    var text = 'Hello 👋 World 🌍';
    var count = processor.countCharacters(text);
    
    // Should count emojis as single characters
    assert(count > 0, 'should count characters');
  });
  
  // Test: Count characters with emojis
  test('should handle emoji surrogate pairs', function() {
    var processor = new TextProcessor();
    var text = '😀😃😄';
    var count = processor.countCharacters(text);
    
    assertEqual(count, 3, 'should count 3 emoji characters');
  });
  
  // Test: Validate length - valid
  test('should validate text within length limit', function() {
    var processor = new TextProcessor();
    var text = 'Short text';
    var result = processor.validateLength(text, 20);
    
    assertEqual(result.valid, true, 'should be valid');
    assertEqual(result.length, 10, 'should report correct length');
    assertEqual(result.remaining, 10, 'should report remaining characters');
    assertEqual(result.exceeded, 0, 'should not be exceeded');
  });
  
  // Test: Validate length - invalid
  test('should validate text exceeding length limit', function() {
    var processor = new TextProcessor();
    var text = 'This is a very long text';
    var result = processor.validateLength(text, 10);
    
    assertEqual(result.valid, false, 'should be invalid');
    assert(result.exceeded > 0, 'should report exceeded amount');
  });
  
  // Test: Process for display
  test('should process text for display with all features', function() {
    var processor = new TextProcessor();
    var text = 'Check http://example.com @user #hashtag';
    var result = processor.processForDisplay(text);
    
    assertContains(result, '<a href="http://example.com"', 'should linkify URL');
    assertContains(result, '@user', 'should include mention');
    assertContains(result, '#hashtag', 'should include hashtag');
  });
  
  // Test: Strip HTML
  test('should strip HTML tags', function() {
    var processor = new TextProcessor();
    var html = '<p>Hello <strong>World</strong></p>';
    var result = processor.stripHtml(html);
    
    assertEqual(result, 'Hello World', 'should remove all tags');
  });
  
  // Test: Escape HTML
  test('should escape HTML special characters', function() {
    var processor = new TextProcessor();
    var text = '<script>alert("XSS")</script>';
    var result = processor._escapeHtml(text);
    
    assertContains(result, '&lt;', 'should escape <');
    assertContains(result, '&gt;', 'should escape >');
    assert(result.indexOf('<script>') === -1, 'should not contain raw script tag');
  });
  
  // Test: Split words
  test('should split text into words', function() {
    var processor = new TextProcessor();
    var text = 'Hello world from tests';
    var words = processor.splitWords(text);
    
    assertEqual(words.length, 4, 'should have 4 words');
    assertEqual(words[0], 'Hello', 'should extract first word');
  });
  
  // Test: Count words
  test('should count words in text', function() {
    var processor = new TextProcessor();
    var text = 'This is a test';
    var count = processor.countWords(text);
    
    assertEqual(count, 4, 'should count 4 words');
  });
  
  // Test: Highlight search terms
  test('should highlight search terms', function() {
    var processor = new TextProcessor();
    var text = 'Hello world';
    var result = processor.highlight(text, 'world');
    
    assertContains(result, '<mark>', 'should wrap in mark tag');
    assertContains(result, 'world', 'should include search term');
  });
  
  // Test: Highlight with class
  test('should highlight with custom class', function() {
    var processor = new TextProcessor();
    var text = 'Hello world';
    var result = processor.highlight(text, 'world', 'highlight');
    
    assertContains(result, 'class="highlight"', 'should include custom class');
  });
  
  // Test: Check whitespace
  test('should detect whitespace-only text', function() {
    var processor = new TextProcessor();
    
    assertEqual(processor.isWhitespace('   '), true, 'should detect spaces');
    assertEqual(processor.isWhitespace('\t\n'), true, 'should detect tabs and newlines');
    assertEqual(processor.isWhitespace('text'), false, 'should detect non-whitespace');
  });
  
  // Test: Normalize whitespace
  test('should normalize whitespace', function() {
    var processor = new TextProcessor();
    var text = '  Hello    world  ';
    var result = processor.normalizeWhitespace(text);
    
    assertEqual(result, 'Hello world', 'should collapse and trim whitespace');
  });
  
  // Test: Empty text handling
  test('should handle empty text gracefully', function() {
    var processor = new TextProcessor();
    
    assertEqual(processor.truncate('', 10), '', 'truncate should return empty');
    assertEqual(processor.detectUrls('').length, 0, 'detectUrls should return empty array');
    assertEqual(processor.detectMentions('').length, 0, 'detectMentions should return empty array');
    assertEqual(processor.countCharacters(''), 0, 'countCharacters should return 0');
  });
  
  // Test: Null handling
  test('should handle null input gracefully', function() {
    var processor = new TextProcessor();
    
    assertEqual(processor.truncate(null, 10), '', 'should handle null');
    assertEqual(processor.countCharacters(null), 0, 'should handle null');
  });
  
  // Test: URL with query parameters
  test('should detect URLs with query parameters', function() {
    var processor = new TextProcessor();
    var text = 'Visit https://example.com/page?foo=bar&baz=qux';
    var urls = processor.detectUrls(text);
    
    assertEqual(urls.length, 1, 'should find URL');
    assertContains(urls[0].url, 'foo=bar', 'should include query params');
  });
  
  // Test: URL with hash
  test('should detect URLs with hash fragments', function() {
    var processor = new TextProcessor();
    var text = 'See https://example.com/page#section';
    var urls = processor.detectUrls(text);
    
    assertEqual(urls.length, 1, 'should find URL');
    assertContains(urls[0].url, '#section', 'should include hash');
  });
  
  // Run all tests
  console.log('Running TextProcessor tests...\n');
  
  tests.forEach(function(testCase) {
    try {
      testCase.fn();
      passed++;
      console.log('✓ ' + testCase.name);
    } catch (error) {
      failed++;
      console.log('✗ ' + testCase.name);
      console.log('  Error: ' + error.message);
    }
  });
  
  console.log('\n' + passed + ' passed, ' + failed + ' failed');
  
  return { passed: passed, failed: failed, total: tests.length };
}

// Export for use in browser
if (typeof window !== 'undefined') {
  window.runTextProcessorTests = runTextProcessorTests;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = runTextProcessorTests;
}

// Auto-run in Node.js
if (typeof require !== 'undefined' && require.main === module) {
  var results = runTextProcessorTests();
  process.exit(results.failed > 0 ? 1 : 0);
}
