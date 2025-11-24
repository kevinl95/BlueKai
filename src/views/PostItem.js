/**
 * PostItem Component
 * Displays a single post with author info, content, and engagement metrics
 * Compatible with Gecko 48 (ES5 transpiled)
 * Requirements: 4.3, 4.6, 10.3
 */

var h = require('preact').h;
var Component = require('preact').Component;
var DateFormatter = require('../utils/date-formatter');
var TextProcessor = require('../utils/text-processor');

/**
 * @class PostItem
 * @description Component to display a single BlueSky post
 */
function PostItem(props) {
  var post = props.post;
  var onSelect = props.onSelect;
  var focused = props.focused;
  var dataSaverMode = props.dataSaverMode || false;
  
  if (!post) {
    return null;
  }
  
  // Initialize utilities
  var dateFormatter = new DateFormatter();
  var textProcessor = new TextProcessor();
  
  // Extract post data
  var author = post.author || {};
  var record = post.record || {};
  var text = record.text || '';
  var createdAt = record.createdAt;
  
  // Engagement counts
  var likeCount = post.likeCount || 0;
  var repostCount = post.repostCount || 0;
  var replyCount = post.replyCount || 0;
  
  // User interaction indicators
  var viewer = post.viewer || {};
  var isLiked = !!viewer.like;
  var isReposted = !!viewer.repost;
  
  // Format timestamp
  var timestamp = dateFormatter.formatRelative(createdAt);
  
  // Process text for display (linkify URLs)
  var processedText = textProcessor.linkify(textProcessor._escapeHtml(text), 'post-link');
  
  // Handle click/selection
  var handleClick = function() {
    if (onSelect) {
      onSelect(post);
    }
  };
  
  var handleKeyDown = function(e) {
    if (e.key === 'Enter' && onSelect) {
      e.preventDefault();
      onSelect(post);
    }
  };
  
  // Build class names
  var className = 'post-item';
  if (focused) {
    className += ' post-item--focused';
  }
  
  return h('div', {
    className: className,
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    tabIndex: focused ? 0 : -1,
    role: 'article',
    'aria-label': 'Post by ' + (author.displayName || author.handle)
  },
    // Author info
    h('div', { className: 'post-item__header' },
      // Avatar (conditional based on data saver mode)
      !dataSaverMode && author.avatar && h('img', {
        className: 'post-item__avatar',
        src: author.avatar,
        alt: author.displayName || author.handle,
        width: 32,
        height: 32
      }),
      dataSaverMode && h('div', {
        className: 'post-item__avatar post-item__avatar--placeholder',
        'aria-label': 'Avatar placeholder'
      }),
      
      // Author details
      h('div', { className: 'post-item__author' },
        h('div', { className: 'post-item__author-name' },
          author.displayName || author.handle
        ),
        h('div', { className: 'post-item__author-handle' },
          '@' + author.handle
        )
      ),
      
      // Timestamp
      h('div', { className: 'post-item__timestamp' },
        timestamp
      )
    ),
    
    // Post content
    h('div', {
      className: 'post-item__content',
      dangerouslySetInnerHTML: { __html: processedText }
    }),
    
    // Engagement metrics
    h('div', { className: 'post-item__engagement' },
      // Reply count
      h('span', {
        className: 'post-item__metric',
        'aria-label': replyCount + ' replies'
      },
        h('span', { className: 'post-item__metric-icon' }, '💬'),
        ' ',
        replyCount > 0 ? replyCount : ''
      ),
      
      // Repost count
      h('span', {
        className: 'post-item__metric' + (isReposted ? ' post-item__metric--active' : ''),
        'aria-label': repostCount + ' reposts' + (isReposted ? ', you reposted' : '')
      },
        h('span', { className: 'post-item__metric-icon' }, '🔁'),
        ' ',
        repostCount > 0 ? repostCount : ''
      ),
      
      // Like count
      h('span', {
        className: 'post-item__metric' + (isLiked ? ' post-item__metric--active' : ''),
        'aria-label': likeCount + ' likes' + (isLiked ? ', you liked' : '')
      },
        h('span', { className: 'post-item__metric-icon' }, '❤️'),
        ' ',
        likeCount > 0 ? likeCount : ''
      )
    )
  );
}

module.exports = PostItem;
