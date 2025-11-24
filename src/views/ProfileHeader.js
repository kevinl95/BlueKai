/**
 * ProfileHeader Component
 * Displays user profile information including avatar, name, handle, bio, and stats
 */

import { h } from 'preact';

/**
 * ProfileHeader component
 * @param {Object} props
 * @param {Object} props.profile - User profile data
 * @param {boolean} props.isOwnProfile - Whether this is the current user's profile
 * @param {boolean} props.dataSaverMode - Whether data saver mode is enabled
 * @param {Function} props.onFollowToggle - Callback for follow/unfollow action
 * @param {Function} props.onEdit - Callback for edit profile action
 * @param {boolean} props.followLoading - Whether follow action is in progress
 */
export function ProfileHeader(props) {
  var profile = props.profile;
  var isOwnProfile = props.isOwnProfile;
  var dataSaverMode = props.dataSaverMode;
  var onFollowToggle = props.onFollowToggle;
  var onEdit = props.onEdit;
  var followLoading = props.followLoading || false;

  if (!profile) {
    return null;
  }

  var isFollowing = profile.viewer && profile.viewer.following;
  var followButtonText = followLoading ? 'Loading...' : (isFollowing ? 'Unfollow' : 'Follow');

  return h('div', { className: 'profile-header' },
    // Avatar
    h('div', { className: 'profile-header__avatar-container' },
      !dataSaverMode && profile.avatar
        ? h('img', {
            src: profile.avatar,
            alt: profile.displayName || profile.handle,
            className: 'profile-header__avatar'
          })
        : h('div', { className: 'profile-header__avatar-placeholder' },
            h('span', null, (profile.displayName || profile.handle).charAt(0).toUpperCase())
          )
    ),

    // Name and handle
    h('div', { className: 'profile-header__info' },
      h('h1', { className: 'profile-header__display-name' },
        profile.displayName || profile.handle
      ),
      h('p', { className: 'profile-header__handle' },
        '@' + profile.handle
      )
    ),

    // Bio/description
    profile.description && h('div', { className: 'profile-header__bio' },
      h('p', null, profile.description)
    ),

    // Stats
    h('div', { className: 'profile-header__stats' },
      h('div', { className: 'profile-header__stat' },
        h('span', { className: 'profile-header__stat-value' }, profile.postsCount || 0),
        h('span', { className: 'profile-header__stat-label' }, ' Posts')
      ),
      h('div', { className: 'profile-header__stat' },
        h('span', { className: 'profile-header__stat-value' }, profile.followersCount || 0),
        h('span', { className: 'profile-header__stat-label' }, ' Followers')
      ),
      h('div', { className: 'profile-header__stat' },
        h('span', { className: 'profile-header__stat-value' }, profile.followsCount || 0),
        h('span', { className: 'profile-header__stat-label' }, ' Following')
      )
    ),

    // Action buttons
    h('div', { className: 'profile-header__actions' },
      isOwnProfile
        ? h('button', {
            className: 'profile-header__button profile-header__button--edit',
            onClick: onEdit,
            'data-focusable': 'true'
          }, 'Edit Profile')
        : h('button', {
            className: 'profile-header__button profile-header__button--follow',
            onClick: onFollowToggle,
            disabled: followLoading,
            'data-focusable': 'true'
          }, followButtonText)
    )
  );
}
