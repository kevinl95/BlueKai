/**
 * Example usage of the ATP Client
 * Demonstrates common workflows and patterns
 */

import ATPClient from './atp-client.js';

// Initialize the client
var client = new ATPClient({
  baseURL: 'https://bsky.social',
  timeout: 30000
});

/**
 * Example 1: Login and fetch timeline
 */
function exampleLoginAndTimeline() {
  console.log('=== Example 1: Login and Timeline ===');
  
  client.login('user.bsky.social', 'xxxx-xxxx-xxxx-xxxx')
    .then(function(session) {
      console.log('✓ Logged in as:', session.handle);
      console.log('  DID:', session.did);
      
      // Fetch timeline
      return client.getTimeline({ limit: 10 });
    })
    .then(function(result) {
      console.log('✓ Loaded', result.feed.length, 'posts');
      
      // Display first post
      if (result.feed.length > 0) {
        var firstPost = result.feed[0].post;
        console.log('  First post by:', firstPost.author.handle);
        console.log('  Text:', firstPost.record.text.substring(0, 50) + '...');
      }
      
      // Check if there are more posts
      if (result.cursor) {
        console.log('  More posts available (cursor:', result.cursor.substring(0, 20) + '...)');
      }
    })
    .catch(function(error) {
      console.error('✗ Error:', error.statusText || error.message);
    });
}

/**
 * Example 2: Create a post
 */
function exampleCreatePost() {
  console.log('\n=== Example 2: Create Post ===');
  
  if (!client.isAuthenticated()) {
    console.error('✗ Not authenticated. Please login first.');
    return;
  }
  
  client.createPost({
    text: 'Hello from BlueKai! 👋 Testing the ATP client.'
  })
  .then(function(post) {
    console.log('✓ Post created successfully');
    console.log('  URI:', post.uri);
    console.log('  CID:', post.cid);
  })
  .catch(function(error) {
    console.error('✗ Error creating post:', error.statusText || error.message);
  });
}

/**
 * Example 3: Like and repost
 */
function exampleInteractions(postUri, postCid) {
  console.log('\n=== Example 3: Post Interactions ===');
  
  if (!client.isAuthenticated()) {
    console.error('✗ Not authenticated. Please login first.');
    return;
  }
  
  var likeUri;
  var repostUri;
  
  // Like the post
  client.likePost(postUri, postCid)
    .then(function(like) {
      console.log('✓ Post liked');
      likeUri = like.uri;
      
      // Repost it
      return client.repost(postUri, postCid);
    })
    .then(function(repost) {
      console.log('✓ Post reposted');
      repostUri = repost.uri;
      
      // Wait a moment, then unlike
      return new Promise(function(resolve) {
        setTimeout(resolve, 1000);
      });
    })
    .then(function() {
      return client.unlikePost(likeUri);
    })
    .then(function() {
      console.log('✓ Post unliked');
      
      // Unrepost
      return client.unrepost(repostUri);
    })
    .then(function() {
      console.log('✓ Post unreposted');
    })
    .catch(function(error) {
      console.error('✗ Error:', error.statusText || error.message);
    });
}

/**
 * Example 4: Profile operations
 */
function exampleProfile() {
  console.log('\n=== Example 4: Profile Operations ===');
  
  if (!client.isAuthenticated()) {
    console.error('✗ Not authenticated. Please login first.');
    return;
  }
  
  var session = client.getSession();
  
  // Get own profile
  client.getProfile(session.did)
    .then(function(profile) {
      console.log('✓ Profile loaded');
      console.log('  Handle:', profile.handle);
      console.log('  Display Name:', profile.displayName);
      console.log('  Followers:', profile.followersCount);
      console.log('  Following:', profile.followsCount);
      
      // Update profile
      return client.updateProfile({
        displayName: profile.displayName || 'BlueKai User',
        description: 'Updated via BlueKai ATP client'
      });
    })
    .then(function() {
      console.log('✓ Profile updated');
    })
    .catch(function(error) {
      console.error('✗ Error:', error.statusText || error.message);
    });
}

/**
 * Example 5: Notifications
 */
function exampleNotifications() {
  console.log('\n=== Example 5: Notifications ===');
  
  if (!client.isAuthenticated()) {
    console.error('✗ Not authenticated. Please login first.');
    return;
  }
  
  // Get unread count
  client.getNotificationCount()
    .then(function(result) {
      console.log('✓ Unread notifications:', result.count);
      
      // Fetch notifications
      return client.getNotifications({ limit: 10 });
    })
    .then(function(result) {
      console.log('✓ Loaded', result.notifications.length, 'notifications');
      
      // Display first few
      result.notifications.slice(0, 3).forEach(function(notif, index) {
        console.log('  ' + (index + 1) + '.', notif.reason, 'from', notif.author.handle);
      });
      
      // Mark as seen
      return client.updateSeenNotifications();
    })
    .then(function() {
      console.log('✓ Notifications marked as seen');
    })
    .catch(function(error) {
      console.error('✗ Error:', error.statusText || error.message);
    });
}

/**
 * Example 6: Pagination
 */
function examplePagination() {
  console.log('\n=== Example 6: Timeline Pagination ===');
  
  if (!client.isAuthenticated()) {
    console.error('✗ Not authenticated. Please login first.');
    return;
  }
  
  var allPosts = [];
  var maxPages = 3;
  
  function loadPage(cursor, pageNum) {
    return client.getTimeline({ limit: 10, cursor: cursor })
      .then(function(result) {
        allPosts = allPosts.concat(result.feed);
        console.log('✓ Page', pageNum, 'loaded:', result.feed.length, 'posts');
        
        // Load next page if available and under limit
        if (result.cursor && pageNum < maxPages) {
          return loadPage(result.cursor, pageNum + 1);
        }
      });
  }
  
  loadPage(null, 1)
    .then(function() {
      console.log('✓ Total posts loaded:', allPosts.length);
    })
    .catch(function(error) {
      console.error('✗ Error:', error.statusText || error.message);
    });
}

/**
 * Example 7: Error handling
 */
function exampleErrorHandling() {
  console.log('\n=== Example 7: Error Handling ===');
  
  // Try to create post without authentication
  var unauthClient = new ATPClient();
  
  unauthClient.createPost({ text: 'This will fail' })
    .then(function() {
      console.log('✗ Should not succeed');
    })
    .catch(function(error) {
      if (error.status === 401) {
        console.log('✓ Correctly caught authentication error');
      } else if (error.error === 'NetworkError') {
        console.log('✓ Correctly caught network error');
      } else {
        console.log('✓ Caught error:', error.statusText);
      }
    });
  
  // Try to create post without text
  if (client.isAuthenticated()) {
    client.createPost({})
      .then(function() {
        console.log('✗ Should not succeed');
      })
      .catch(function(error) {
        console.log('✓ Correctly caught validation error:', error.message);
      });
  }
}

/**
 * Example 8: Session management
 */
function exampleSessionManagement() {
  console.log('\n=== Example 8: Session Management ===');
  
  // Check if already authenticated
  if (client.isAuthenticated()) {
    var session = client.getSession();
    console.log('✓ Already authenticated as:', session.handle);
    
    // Check token expiry
    var timeUntilExpiry = session.expiresAt - Date.now();
    var minutesLeft = Math.floor(timeUntilExpiry / 60000);
    console.log('  Token expires in:', minutesLeft, 'minutes');
    
    if (client.shouldRefreshToken()) {
      console.log('  Token should be refreshed soon');
    }
  } else {
    console.log('✗ Not authenticated');
    console.log('  Session will be restored from storage if available');
  }
  
  // Logout example
  client.logout()
    .then(function() {
      console.log('✓ Logged out successfully');
      console.log('  Authenticated:', client.isAuthenticated());
    });
}

// Export examples for use in browser console or tests
export {
  exampleLoginAndTimeline,
  exampleCreatePost,
  exampleInteractions,
  exampleProfile,
  exampleNotifications,
  examplePagination,
  exampleErrorHandling,
  exampleSessionManagement
};

// If running in browser, expose to window
if (typeof window !== 'undefined') {
  window.atpExamples = {
    loginAndTimeline: exampleLoginAndTimeline,
    createPost: exampleCreatePost,
    interactions: exampleInteractions,
    profile: exampleProfile,
    notifications: exampleNotifications,
    pagination: examplePagination,
    errorHandling: exampleErrorHandling,
    sessionManagement: exampleSessionManagement
  };
  
  console.log('ATP Client examples loaded!');
  console.log('Try: atpExamples.loginAndTimeline()');
}
