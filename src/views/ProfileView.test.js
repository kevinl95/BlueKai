/**
 * ProfileView Component Tests
 */

import { h, render } from 'preact';
import { ProfileView } from './ProfileView.js';

describe('ProfileView', function() {
  var container;

  beforeEach(function() {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function() {
    document.body.removeChild(container);
    container = null;
  });

  it('should show loading state initially', function(done) {
    var mockClient = {
      getProfile: function() {
        return new Promise(function(resolve) {
          setTimeout(function() {
            resolve({
              did: 'did:plc:test',
              handle: 'test.bsky.social',
              displayName: 'Test User'
            });
          }, 100);
        });
      },
      getTimeline: function() {
        return Promise.resolve({ feed: [] });
      }
    };

    render(h(ProfileView, {
      atpClient: mockClient,
      actor: 'test.bsky.social',
      currentUserDid: 'did:plc:current'
    }), container);

    var loading = container.querySelector('.loading-indicator');
    
    if (!loading) {
      throw new Error('Should show loading indicator');
    }

    done();
  });

  it('should load and display profile', function(done) {
    var mockProfile = {
      did: 'did:plc:test',
      handle: 'test.bsky.social',
      displayName: 'Test User',
      description: 'Test bio',
      postsCount: 10,
      followersCount: 50,
      followsCount: 25
    };

    var mockClient = {
      getProfile: function(actor) {
        return Promise.resolve(mockProfile);
      },
      getTimeline: function() {
        return Promise.resolve({ feed: [] });
      }
    };

    render(h(ProfileView, {
      atpClient: mockClient,
      actor: 'test.bsky.social',
      currentUserDid: 'did:plc:current'
    }), container);

    setTimeout(function() {
      var displayName = container.querySelector('.profile-header__display-name');
      
      if (!displayName || displayName.textContent !== 'Test User') {
        done(new Error('Profile should be displayed'));
        return;
      }

      done();
    }, 50);
  });

  it('should use cache when available', function(done) {
    var mockProfile = {
      did: 'did:plc:test',
      handle: 'test.bsky.social',
      displayName: 'Cached User'
    };

    var getProfileCalled = false;

    var mockClient = {
      getProfile: function() {
        getProfileCalled = true;
        return Promise.resolve(mockProfile);
      },
      getTimeline: function() {
        return Promise.resolve({ feed: [] });
      }
    };

    var mockCache = {
      get: function(key) {
        if (key === 'profile:test.bsky.social') {
          return mockProfile;
        }
        return null;
      },
      set: function() {}
    };

    render(h(ProfileView, {
      atpClient: mockClient,
      actor: 'test.bsky.social',
      currentUserDid: 'did:plc:current',
      cacheManager: mockCache
    }), container);

    setTimeout(function() {
      if (getProfileCalled) {
        done(new Error('Should use cache instead of calling API'));
        return;
      }

      var displayName = container.querySelector('.profile-header__display-name');
      
      if (!displayName || displayName.textContent !== 'Cached User') {
        done(new Error('Should display cached profile'));
        return;
      }

      done();
    }, 50);
  });

  it('should show error state on failure', function(done) {
    var mockClient = {
      getProfile: function() {
        return Promise.reject(new Error('Network error'));
      }
    };

    render(h(ProfileView, {
      atpClient: mockClient,
      actor: 'test.bsky.social',
      currentUserDid: 'did:plc:current'
    }), container);

    setTimeout(function() {
      var error = container.querySelector('.error-message');
      
      if (!error) {
        done(new Error('Should show error message'));
        return;
      }

      done();
    }, 50);
  });

  it('should handle retry after error', function(done) {
    var attempts = 0;
    var mockProfile = {
      did: 'did:plc:test',
      handle: 'test.bsky.social',
      displayName: 'Test User'
    };

    var mockClient = {
      getProfile: function() {
        attempts++;
        if (attempts === 1) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve(mockProfile);
      },
      getTimeline: function() {
        return Promise.resolve({ feed: [] });
      }
    };

    render(h(ProfileView, {
      atpClient: mockClient,
      actor: 'test.bsky.social',
      currentUserDid: 'did:plc:current'
    }), container);

    setTimeout(function() {
      var retryButton = container.querySelector('.error-message__retry');
      
      if (!retryButton) {
        done(new Error('Should show retry button'));
        return;
      }

      retryButton.click();

      setTimeout(function() {
        var displayName = container.querySelector('.profile-header__display-name');
        
        if (!displayName || displayName.textContent !== 'Test User') {
          done(new Error('Should display profile after retry'));
          return;
        }

        done();
      }, 50);
    }, 50);
  });

  it('should identify own profile correctly', function(done) {
    var mockProfile = {
      did: 'did:plc:current',
      handle: 'current.bsky.social',
      displayName: 'Current User'
    };

    var mockClient = {
      getProfile: function() {
        return Promise.resolve(mockProfile);
      },
      getTimeline: function() {
        return Promise.resolve({ feed: [] });
      }
    };

    render(h(ProfileView, {
      atpClient: mockClient,
      actor: 'current.bsky.social',
      currentUserDid: 'did:plc:current'
    }), container);

    setTimeout(function() {
      var editButton = container.querySelector('.profile-header__button--edit');
      
      if (!editButton) {
        done(new Error('Should show edit button for own profile'));
        return;
      }

      done();
    }, 50);
  });

  it('should show follow button for other profiles', function(done) {
    var mockProfile = {
      did: 'did:plc:other',
      handle: 'other.bsky.social',
      displayName: 'Other User',
      viewer: {}
    };

    var mockClient = {
      getProfile: function() {
        return Promise.resolve(mockProfile);
      },
      getTimeline: function() {
        return Promise.resolve({ feed: [] });
      }
    };

    render(h(ProfileView, {
      atpClient: mockClient,
      actor: 'other.bsky.social',
      currentUserDid: 'did:plc:current'
    }), container);

    setTimeout(function() {
      var followButton = container.querySelector('.profile-header__button--follow');
      
      if (!followButton) {
        done(new Error('Should show follow button for other profiles'));
        return;
      }

      done();
    }, 50);
  });

  it('should handle follow action', function(done) {
    var mockProfile = {
      did: 'did:plc:other',
      handle: 'other.bsky.social',
      displayName: 'Other User',
      followersCount: 10,
      viewer: {}
    };

    var followCalled = false;

    var mockClient = {
      getProfile: function() {
        return Promise.resolve(mockProfile);
      },
      getTimeline: function() {
        return Promise.resolve({ feed: [] });
      },
      follow: function(did) {
        followCalled = true;
        if (did !== 'did:plc:other') {
          throw new Error('Wrong DID passed to follow');
        }
        return Promise.resolve({ uri: 'at://follow/123' });
      }
    };

    render(h(ProfileView, {
      atpClient: mockClient,
      actor: 'other.bsky.social',
      currentUserDid: 'did:plc:current'
    }), container);

    setTimeout(function() {
      var followButton = container.querySelector('.profile-header__button--follow');
      
      if (!followButton) {
        done(new Error('Should show follow button'));
        return;
      }

      followButton.click();

      setTimeout(function() {
        if (!followCalled) {
          done(new Error('Follow should be called'));
          return;
        }

        done();
      }, 50);
    }, 50);
  });

  it('should display user posts', function(done) {
    var mockProfile = {
      did: 'did:plc:test',
      handle: 'test.bsky.social',
      displayName: 'Test User'
    };

    var mockPosts = [
      {
        uri: 'at://post1',
        cid: 'cid1',
        author: mockProfile,
        record: { text: 'Post 1', createdAt: '2025-11-23T12:00:00Z' }
      },
      {
        uri: 'at://post2',
        cid: 'cid2',
        author: mockProfile,
        record: { text: 'Post 2', createdAt: '2025-11-23T11:00:00Z' }
      }
    ];

    var mockClient = {
      getProfile: function() {
        return Promise.resolve(mockProfile);
      },
      getTimeline: function() {
        return Promise.resolve({ feed: mockPosts });
      }
    };

    render(h(ProfileView, {
      atpClient: mockClient,
      actor: 'test.bsky.social',
      currentUserDid: 'did:plc:current'
    }), container);

    setTimeout(function() {
      var posts = container.querySelectorAll('.post-item');
      
      if (posts.length !== 2) {
        done(new Error('Should display user posts'));
        return;
      }

      done();
    }, 100);
  });

  it('should show no posts message when user has no posts', function(done) {
    var mockProfile = {
      did: 'did:plc:test',
      handle: 'test.bsky.social',
      displayName: 'Test User'
    };

    var mockClient = {
      getProfile: function() {
        return Promise.resolve(mockProfile);
      },
      getTimeline: function() {
        return Promise.resolve({ feed: [] });
      }
    };

    render(h(ProfileView, {
      atpClient: mockClient,
      actor: 'test.bsky.social',
      currentUserDid: 'did:plc:current'
    }), container);

    setTimeout(function() {
      var noPosts = container.querySelector('.profile-view__no-posts');
      
      if (!noPosts) {
        done(new Error('Should show no posts message'));
        return;
      }

      done();
    }, 100);
  });
});
