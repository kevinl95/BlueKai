/**
 * ProfileView Component
 * Displays user profile with header and posts
 */

import { h, Component } from 'preact';
import ProfileHeader from './ProfileHeader.js';
import PostList from './PostList.js';
import LoadingIndicator from '../components/LoadingIndicator.js';
import ErrorMessage from '../components/ErrorMessage.js';
import './ProfileView.css';

/**
 * ProfileView component
 * @param {Object} props
 * @param {Object} props.atpClient - ATP API client instance
 * @param {string} props.actor - Actor identifier (handle or DID)
 * @param {string} props.currentUserDid - Current user's DID
 * @param {Object} props.navigationManager - Navigation manager instance
 * @param {Object} props.cacheManager - Cache manager instance
 * @param {boolean} props.dataSaverMode - Whether data saver mode is enabled
 * @param {Function} props.onNavigateToEdit - Callback to navigate to edit profile
 * @param {Function} props.onNavigateToPost - Callback to navigate to post detail
 */
export function ProfileView(props) {
  return h(ProfileViewClass, props);
}

class ProfileViewClass extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      profile: null,
      posts: [],
      loading: true,
      error: null,
      postsLoading: false,
      postsError: null,
      followLoading: false,
      cursor: null,
      hasMore: true
    };

    this.handleFollowToggle = this.handleFollowToggle.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleRetry = this.handleRetry.bind(this);
    this.handleLoadMore = this.handleLoadMore.bind(this);
    this.handlePostSelect = this.handlePostSelect.bind(this);
  }

  componentDidMount() {
    this.loadProfile();
  }

  componentDidUpdate(prevProps) {
    // Reload if actor changes
    if (prevProps.actor !== this.props.actor) {
      this.setState({
        profile: null,
        posts: [],
        loading: true,
        error: null,
        cursor: null,
        hasMore: true
      });
      this.loadProfile();
    }
  }

  loadProfile() {
    var self = this;
    var actor = this.props.actor;
    var atpClient = this.props.atpClient;
    var cacheManager = this.props.cacheManager;

    // Try cache first
    if (cacheManager) {
      var cacheKey = 'profile:' + actor;
      var cached = cacheManager.get(cacheKey);
      if (cached) {
        self.setState({
          profile: cached,
          loading: false
        });
        self.loadPosts(actor);
        return;
      }
    }

    // Fetch from API
    atpClient.getProfile(actor)
      .then(function(profile) {
        // Cache the profile
        if (cacheManager) {
          cacheManager.set('profile:' + actor, profile, 15 * 60 * 1000); // 15 min TTL
        }

        self.setState({
          profile: profile,
          loading: false,
          error: null
        });

        // Load user's posts
        self.loadPosts(actor);
      })
      .catch(function(error) {
        self.setState({
          loading: false,
          error: error.message || 'Failed to load profile'
        });
      });
  }

  loadPosts(actor, cursor) {
    var self = this;
    var atpClient = this.props.atpClient;

    self.setState({ postsLoading: true, postsError: null });

    // Use getAuthorFeed to get posts by this specific user
    atpClient.getAuthorFeed({ actor: actor, cursor: cursor, limit: 20 })
      .then(function(response) {
        var feed = response.feed || [];
        var existingPosts = cursor ? self.state.posts : [];
        
        // Extract posts from feed items and filter out any null/undefined
        var newPosts = feed
          .map(function(item) { return item.post; })
          .filter(function(post) { return post != null; });

        self.setState({
          posts: existingPosts.concat(newPosts),
          postsLoading: false,
          postsError: null,
          cursor: response.cursor || null,
          hasMore: !!response.cursor && newPosts.length > 0
        });
      })
      .catch(function(error) {
        self.setState({
          postsLoading: false,
          postsError: error.message || 'Failed to load posts'
        });
      });
  }

  handleFollowToggle() {
    var self = this;
    var profile = this.state.profile;
    var atpClient = this.props.atpClient;

    if (!profile || self.state.followLoading) {
      return;
    }

    var isFollowing = profile.viewer && profile.viewer.following;

    self.setState({ followLoading: true });

    var promise = isFollowing
      ? atpClient.unfollow(profile.did)
      : atpClient.follow(profile.did);

    promise
      .then(function(result) {
        // Update profile viewer state
        var updatedProfile = Object.assign({}, profile);
        updatedProfile.viewer = updatedProfile.viewer || {};
        
        if (isFollowing) {
          updatedProfile.viewer.following = null;
          updatedProfile.followersCount = (updatedProfile.followersCount || 1) - 1;
        } else {
          updatedProfile.viewer.following = result.uri;
          updatedProfile.followersCount = (updatedProfile.followersCount || 0) + 1;
        }

        self.setState({
          profile: updatedProfile,
          followLoading: false
        });

        // Update cache
        if (self.props.cacheManager) {
          self.props.cacheManager.set('profile:' + self.props.actor, updatedProfile, 15 * 60 * 1000);
        }
      })
      .catch(function(error) {
        self.setState({ followLoading: false });
        // Could show error toast here
        console.error('Follow/unfollow failed:', error);
      });
  }

  handleEdit() {
    if (this.props.onNavigateToEdit) {
      this.props.onNavigateToEdit();
    }
  }

  handleRetry() {
    this.setState({
      loading: true,
      error: null
    });
    this.loadProfile();
  }

  handleLoadMore() {
    if (!this.state.postsLoading && this.state.hasMore && this.state.cursor) {
      this.loadPosts(this.props.actor, this.state.cursor);
    }
  }

  handlePostSelect(post) {
    if (this.props.onNavigateToPost) {
      this.props.onNavigateToPost(post);
    }
  }

  render() {
    var state = this.state;
    var props = this.props;
    var profile = state.profile;
    var isOwnProfile = profile && props.currentUserDid && profile.did === props.currentUserDid;

    // Loading state
    if (state.loading) {
      return h('div', { className: 'profile-view' },
        h(LoadingIndicator, { message: 'Loading profile...' })
      );
    }

    // Error state
    if (state.error) {
      return h('div', { className: 'profile-view' },
        h(ErrorMessage, {
          message: state.error,
          onRetry: this.handleRetry
        })
      );
    }

    // Profile loaded
    return h('div', { className: 'profile-view' },
      h(ProfileHeader, {
        profile: profile,
        isOwnProfile: isOwnProfile,
        dataSaverMode: props.dataSaverMode,
        onFollowToggle: this.handleFollowToggle,
        onEdit: this.handleEdit,
        followLoading: state.followLoading
      }),

      h('div', { className: 'profile-view__posts' },
        h('h2', { className: 'profile-view__posts-title' }, 'Posts'),
        
        state.posts.length > 0
          ? h(PostList, {
              posts: state.posts,
              navigationManager: props.navigationManager,
              onPostSelect: this.handlePostSelect,
              onLoadMore: this.handleLoadMore,
              hasMore: state.hasMore,
              loading: state.postsLoading,
              dataSaverMode: props.dataSaverMode
            })
          : !state.postsLoading && h('p', { className: 'profile-view__no-posts' }, 'No posts yet'),

        state.postsError && h(ErrorMessage, {
          message: state.postsError,
          onRetry: function() {
            this.loadPosts(props.actor);
          }.bind(this)
        })
      )
    );
  }
}

export default ProfileView;
