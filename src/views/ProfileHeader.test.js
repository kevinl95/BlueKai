/**
 * ProfileHeader Component Tests
 */

import { h, render } from 'preact';
import { ProfileHeader } from './ProfileHeader.js';

describe('ProfileHeader', function() {
  var container;

  beforeEach(function() {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(function() {
    document.body.removeChild(container);
    container = null;
  });

  it('should render profile information', function() {
    var profile = {
      did: 'did:plc:test123',
      handle: 'testuser.bsky.social',
      displayName: 'Test User',
      description: 'This is my bio',
      postsCount: 42,
      followersCount: 100,
      followsCount: 50
    };

    render(h(ProfileHeader, { profile: profile, isOwnProfile: false }), container);

    var displayName = container.querySelector('.profile-header__display-name');
    var handle = container.querySelector('.profile-header__handle');
    var bio = container.querySelector('.profile-header__bio');

    if (!displayName || displayName.textContent !== 'Test User') {
      throw new Error('Display name not rendered correctly');
    }

    if (!handle || handle.textContent !== '@testuser.bsky.social') {
      throw new Error('Handle not rendered correctly');
    }

    if (!bio || bio.textContent !== 'This is my bio') {
      throw new Error('Bio not rendered correctly');
    }
  });

  it('should display stats correctly', function() {
    var profile = {
      handle: 'testuser.bsky.social',
      postsCount: 42,
      followersCount: 100,
      followsCount: 50
    };

    render(h(ProfileHeader, { profile: profile, isOwnProfile: false }), container);

    var stats = container.querySelectorAll('.profile-header__stat-value');

    if (stats.length !== 3) {
      throw new Error('Expected 3 stats');
    }

    if (stats[0].textContent !== '42') {
      throw new Error('Posts count incorrect');
    }

    if (stats[1].textContent !== '100') {
      throw new Error('Followers count incorrect');
    }

    if (stats[2].textContent !== '50') {
      throw new Error('Following count incorrect');
    }
  });

  it('should show avatar when data saver is off', function() {
    var profile = {
      handle: 'testuser.bsky.social',
      displayName: 'Test User',
      avatar: 'https://example.com/avatar.jpg'
    };

    render(h(ProfileHeader, { 
      profile: profile, 
      isOwnProfile: false,
      dataSaverMode: false 
    }), container);

    var avatar = container.querySelector('.profile-header__avatar');
    
    if (!avatar) {
      throw new Error('Avatar image should be displayed');
    }

    if (avatar.src !== 'https://example.com/avatar.jpg') {
      throw new Error('Avatar src incorrect');
    }
  });

  it('should show placeholder when data saver is on', function() {
    var profile = {
      handle: 'testuser.bsky.social',
      displayName: 'Test User',
      avatar: 'https://example.com/avatar.jpg'
    };

    render(h(ProfileHeader, { 
      profile: profile, 
      isOwnProfile: false,
      dataSaverMode: true 
    }), container);

    var placeholder = container.querySelector('.profile-header__avatar-placeholder');
    
    if (!placeholder) {
      throw new Error('Avatar placeholder should be displayed');
    }

    if (placeholder.textContent !== 'T') {
      throw new Error('Placeholder should show first letter of name');
    }
  });

  it('should show edit button for own profile', function() {
    var profile = {
      handle: 'testuser.bsky.social',
      displayName: 'Test User'
    };

    var editCalled = false;
    var onEdit = function() {
      editCalled = true;
    };

    render(h(ProfileHeader, { 
      profile: profile, 
      isOwnProfile: true,
      onEdit: onEdit
    }), container);

    var editButton = container.querySelector('.profile-header__button--edit');
    
    if (!editButton) {
      throw new Error('Edit button should be displayed for own profile');
    }

    if (editButton.textContent !== 'Edit Profile') {
      throw new Error('Edit button text incorrect');
    }

    editButton.click();

    if (!editCalled) {
      throw new Error('Edit callback should be called');
    }
  });

  it('should show follow button for other profiles', function() {
    var profile = {
      handle: 'testuser.bsky.social',
      displayName: 'Test User',
      viewer: {
        following: null
      }
    };

    var followCalled = false;
    var onFollowToggle = function() {
      followCalled = true;
    };

    render(h(ProfileHeader, { 
      profile: profile, 
      isOwnProfile: false,
      onFollowToggle: onFollowToggle
    }), container);

    var followButton = container.querySelector('.profile-header__button--follow');
    
    if (!followButton) {
      throw new Error('Follow button should be displayed for other profiles');
    }

    if (followButton.textContent !== 'Follow') {
      throw new Error('Follow button text incorrect');
    }

    followButton.click();

    if (!followCalled) {
      throw new Error('Follow callback should be called');
    }
  });

  it('should show unfollow when already following', function() {
    var profile = {
      handle: 'testuser.bsky.social',
      displayName: 'Test User',
      viewer: {
        following: 'at://did:plc:test/app.bsky.graph.follow/123'
      }
    };

    render(h(ProfileHeader, { 
      profile: profile, 
      isOwnProfile: false,
      onFollowToggle: function() {}
    }), container);

    var followButton = container.querySelector('.profile-header__button--follow');
    
    if (!followButton) {
      throw new Error('Follow button should be displayed');
    }

    if (followButton.textContent !== 'Unfollow') {
      throw new Error('Should show Unfollow when already following');
    }
  });

  it('should disable follow button when loading', function() {
    var profile = {
      handle: 'testuser.bsky.social',
      displayName: 'Test User',
      viewer: {}
    };

    render(h(ProfileHeader, { 
      profile: profile, 
      isOwnProfile: false,
      onFollowToggle: function() {},
      followLoading: true
    }), container);

    var followButton = container.querySelector('.profile-header__button--follow');
    
    if (!followButton) {
      throw new Error('Follow button should be displayed');
    }

    if (!followButton.disabled) {
      throw new Error('Follow button should be disabled when loading');
    }

    if (followButton.textContent !== 'Loading...') {
      throw new Error('Should show Loading... when loading');
    }
  });

  it('should handle profile without bio', function() {
    var profile = {
      handle: 'testuser.bsky.social',
      displayName: 'Test User'
    };

    render(h(ProfileHeader, { profile: profile, isOwnProfile: false }), container);

    var bio = container.querySelector('.profile-header__bio');
    
    if (bio) {
      throw new Error('Bio should not be displayed when not present');
    }
  });

  it('should use handle as fallback for display name', function() {
    var profile = {
      handle: 'testuser.bsky.social'
    };

    render(h(ProfileHeader, { profile: profile, isOwnProfile: false }), container);

    var displayName = container.querySelector('.profile-header__display-name');
    
    if (!displayName || displayName.textContent !== 'testuser.bsky.social') {
      throw new Error('Should use handle as fallback for display name');
    }
  });

  it('should return null when no profile provided', function() {
    render(h(ProfileHeader, { profile: null, isOwnProfile: false }), container);

    if (container.children.length > 0) {
      throw new Error('Should not render anything when profile is null');
    }
  });
});
