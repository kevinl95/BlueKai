/**
 * Profile Components Tests Runner
 * Run all profile component tests in Node.js environment
 */

console.log('====================================');
console.log('BlueKai Profile Components Tests');
console.log('====================================\n');

// Mock browser globals for Node.js environment
global.document = {
  activeElement: null,
  body: { 
    style: {},
    appendChild: function(el) { this._children = this._children || []; this._children.push(el); },
    removeChild: function(el) { 
      this._children = this._children || [];
      var idx = this._children.indexOf(el);
      if (idx > -1) this._children.splice(idx, 1);
    }
  },
  addEventListener: function() {},
  removeEventListener: function() {},
  querySelectorAll: function() { return []; },
  createElement: function(tag) {
    return {
      tagName: tag.toUpperCase(),
      style: {},
      children: [],
      _children: [],
      appendChild: function(child) { this._children.push(child); this.children.push(child); },
      removeChild: function(child) {
        var idx = this._children.indexOf(child);
        if (idx > -1) {
          this._children.splice(idx, 1);
          this.children.splice(idx, 1);
        }
      },
      querySelector: function(selector) {
        // Simple mock - return first child with matching class
        if (selector.startsWith('.')) {
          var className = selector.substring(1);
          for (var i = 0; i < this._children.length; i++) {
            if (this._children[i].className && this._children[i].className.indexOf(className) > -1) {
              return this._children[i];
            }
            if (this._children[i].querySelector) {
              var found = this._children[i].querySelector(selector);
              if (found) return found;
            }
          }
        }
        return null;
      },
      querySelectorAll: function(selector) {
        var results = [];
        if (selector.startsWith('.')) {
          var className = selector.substring(1);
          for (var i = 0; i < this._children.length; i++) {
            if (this._children[i].className && this._children[i].className.indexOf(className) > -1) {
              results.push(this._children[i]);
            }
            if (this._children[i].querySelectorAll) {
              var found = this._children[i].querySelectorAll(selector);
              results = results.concat(Array.prototype.slice.call(found));
            }
          }
        }
        return results;
      },
      addEventListener: function() {},
      removeEventListener: function() {},
      click: function() {
        if (this.onClick) this.onClick();
      },
      dispatchEvent: function(event) {
        if (event.type === 'input' && this.onInput) {
          this.onInput({ target: this });
        }
      }
    };
  }
};

global.window = {};
global.confirm = function(msg) {
  console.log('  [CONFIRM] ' + msg);
  return false; // Default to no for tests
};

// Load test files
var profileHeaderTests = require('./src/views/ProfileHeader.test.js');
var profileViewTests = require('./src/views/ProfileView.test.js');
var editProfileViewTests = require('./src/views/EditProfileView.test.js');

// Run all tests
var allPassed = true;

console.log('\n1. ProfileHeader Tests');
console.log('----------------------');
if (!profileHeaderTests.runProfileHeaderTests()) {
  allPassed = false;
}

console.log('\n2. ProfileView Tests');
console.log('--------------------');
if (!profileViewTests.runProfileViewTests()) {
  allPassed = false;
}

console.log('\n3. EditProfileView Tests');
console.log('------------------------');
if (!editProfileViewTests.runEditProfileViewTests()) {
  allPassed = false;
}

console.log('\n====================================');
if (allPassed) {
  console.log('✓ All tests passed!');
  process.exit(0);
} else {
  console.log('✗ Some tests failed');
  process.exit(1);
}
