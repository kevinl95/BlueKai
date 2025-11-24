/**
 * Example usage of the Navigation System
 * Demonstrates NavigationManager, Router, and SoftkeyBar integration
 */

var NavigationManager = require('./navigation-manager');
var Router = require('./router');
var h = require('preact').h;
var render = require('preact').render;
var SoftkeyBar = require('./SoftkeyBar');

// Example 1: Basic NavigationManager usage
function example1_BasicNavigation() {
  console.log('\n=== Example 1: Basic Navigation ===\n');
  
  // Create navigation manager
  var nav = new NavigationManager({
    onSelect: function(element, index) {
      console.log('Selected item at index:', index);
      console.log('Element:', element.textContent);
    },
    circular: true
  });
  
  // Initialize
  nav.init();
  
  // Simulate having some list items
  var items = [
    { id: 1, text: 'Item 1' },
    { id: 2, text: 'Item 2' },
    { id: 3, text: 'Item 3' }
  ];
  
  console.log('Created navigation manager with', items.length, 'items');
  console.log('Current focus index:', nav.getFocusedIndex());
  
  // Clean up
  nav.destroy();
}

// Example 2: Router with multiple routes
function example2_BasicRouting() {
  console.log('\n=== Example 2: Basic Routing ===\n');
  
  var router = new Router();
  
  // Register routes
  router.register('/', function() {
    console.log('Home page loaded');
  }, 'home');
  
  router.register('/timeline', function() {
    console.log('Timeline page loaded');
  }, 'timeline');
  
  router.register('/post/:id', function(params) {
    console.log('Post page loaded with ID:', params.id);
  }, 'post');
  
  router.register('/user/:userId/post/:postId', function(params) {
    console.log('User post loaded:', params);
  }, 'userPost');
  
  console.log('Registered', router.routes.length, 'routes');
  
  // Test route matching
  var match1 = router.match('/timeline');
  console.log('Match /timeline:', match1 ? 'Found' : 'Not found');
  
  var match2 = router.match('/post/123');
  console.log('Match /post/123:', match2 ? 'Found with params:' : 'Not found', match2 ? match2.params : '');
  
  var match3 = router.match('/user/abc/post/456');
  console.log('Match /user/abc/post/456:', match3 ? 'Found with params:' : 'Not found', match3 ? match3.params : '');
}

// Example 3: SoftkeyBar rendering
function example3_SoftkeyBar() {
  console.log('\n=== Example 3: SoftkeyBar ===\n');
  
  // Create a container
  var container = document.createElement('div');
  
  // Render softkey bar
  render(h(SoftkeyBar, {
    left: { label: 'Back', action: function() { console.log('Back pressed'); } },
    center: { label: 'Select', action: function() { console.log('Select pressed'); } },
    right: { label: 'Options', action: function() { console.log('Options pressed'); } }
  }), container);
  
  console.log('Rendered SoftkeyBar');
  console.log('HTML:', container.innerHTML);
}

// Example 4: Integrated navigation system
function example4_IntegratedSystem() {
  console.log('\n=== Example 4: Integrated System ===\n');
  
  var router = new Router();
  var nav = new NavigationManager({
    circular: true
  });
  
  var currentSoftkeys = {};
  
  // Helper to update softkeys
  function updateSoftkeys(config) {
    currentSoftkeys = config;
    console.log('Updated softkeys:', config);
    
    // Update navigation manager callbacks
    nav.updateSoftkeys({
      onSoftLeft: config.left ? config.left.action : null,
      onSoftRight: config.right ? config.right.action : null
    });
  }
  
  // Register timeline route
  router.register('/timeline', function() {
    console.log('Timeline view loaded');
    
    updateSoftkeys({
      left: { 
        label: 'Menu',
        action: function() { 
          console.log('Opening menu');
          router.navigate('/menu');
        }
      },
      center: { 
        label: 'Select',
        action: function() { 
          console.log('Post selected');
        }
      },
      right: { 
        label: 'Compose',
        action: function() { 
          console.log('Opening compose');
          router.navigate('/compose');
        }
      }
    });
  }, 'timeline');
  
  // Register post detail route
  router.register('/post/:id', function(params) {
    console.log('Post detail view loaded for ID:', params.id);
    
    updateSoftkeys({
      left: { 
        label: 'Back',
        action: function() { 
          console.log('Going back');
          router.back();
        }
      },
      center: { 
        label: 'Select',
        action: function() { 
          console.log('Action selected');
        }
      },
      right: { 
        label: 'Options',
        action: function() { 
          console.log('Opening options');
        }
      }
    });
  }, 'post');
  
  // Register compose route
  router.register('/compose', function() {
    console.log('Compose view loaded');
    
    updateSoftkeys({
      left: { 
        label: 'Cancel',
        action: function() { 
          console.log('Canceling compose');
          router.back();
        }
      },
      center: { 
        label: 'Post',
        action: function() { 
          console.log('Posting...');
          router.navigate('/timeline');
        }
      },
      right: { 
        label: '',
        action: null
      }
    });
  }, 'compose');
  
  // Initialize
  router.init();
  nav.init();
  
  console.log('System initialized');
  console.log('Current path:', router.getCurrentPath());
  
  // Simulate navigation
  console.log('\nNavigating to /timeline...');
  router.navigate('/timeline');
  
  console.log('\nNavigating to /post/123...');
  router.navigate('/post/123');
  
  console.log('\nNavigating to /compose...');
  router.navigate('/compose');
  
  console.log('\nGoing back...');
  router.back();
  
  console.log('\nHistory:', router.getHistory());
  console.log('Can go back:', router.canGoBack());
  
  // Clean up
  nav.destroy();
  router.destroy();
}

// Example 5: Dynamic focus management
function example5_DynamicFocus() {
  console.log('\n=== Example 5: Dynamic Focus Management ===\n');
  
  var nav = new NavigationManager({
    onSelect: function(element, index) {
      console.log('Selected:', element.id, 'at index:', index);
    },
    circular: true,
    focusClass: 'focused'
  });
  
  nav.init();
  
  // Create mock elements
  var elements = [];
  for (var i = 0; i < 5; i++) {
    var el = document.createElement('div');
    el.id = 'item-' + i;
    el.textContent = 'Item ' + i;
    el.classList = {
      add: function(cls) { this._cls = cls; },
      remove: function(cls) { this._cls = null; },
      contains: function(cls) { return this._cls === cls; },
      _cls: null
    };
    elements.push(el);
  }
  
  nav.updateFocusableElements(elements);
  console.log('Initial focus:', nav.getFocusedIndex());
  
  // Move focus forward
  nav.moveFocus(1);
  console.log('After moving forward:', nav.getFocusedIndex());
  
  // Move focus forward again
  nav.moveFocus(1);
  console.log('After moving forward again:', nav.getFocusedIndex());
  
  // Move focus backward
  nav.moveFocus(-1);
  console.log('After moving backward:', nav.getFocusedIndex());
  
  // Jump to specific index
  nav.setFocusIndex(4);
  console.log('After jumping to index 4:', nav.getFocusedIndex());
  
  // Test circular navigation (wrap around)
  nav.moveFocus(1);
  console.log('After moving forward from last item (circular):', nav.getFocusedIndex());
  
  nav.destroy();
}

// Run all examples
function runAllExamples() {
  console.log('=================================');
  console.log('Navigation System Examples');
  console.log('=================================');
  
  example1_BasicNavigation();
  example2_BasicRouting();
  example3_SoftkeyBar();
  example4_IntegratedSystem();
  example5_DynamicFocus();
  
  console.log('\n=================================');
  console.log('All examples completed!');
  console.log('=================================\n');
}

// Export examples
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    example1_BasicNavigation: example1_BasicNavigation,
    example2_BasicRouting: example2_BasicRouting,
    example3_SoftkeyBar: example3_SoftkeyBar,
    example4_IntegratedSystem: example4_IntegratedSystem,
    example5_DynamicFocus: example5_DynamicFocus,
    runAllExamples: runAllExamples
  };
  
  // Run if executed directly
  if (require.main === module) {
    runAllExamples();
  }
}
