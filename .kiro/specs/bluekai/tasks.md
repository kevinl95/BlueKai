# Implementation Plan

- [x] 1. Set up project structure and build configuration
  - Create directory structure for components, services, utilities, and styles
  - Configure Webpack 4 with Babel for ES5 transpilation targeting Firefox 48
  - Set up package.json with Preact and minimal dependencies
  - Create HTML template with KaiOS meta tags and viewport settings
  - Configure build scripts for development and production
  - _Requirements: 1.1, 1.3, 1.4, 1.5_

- [x] 2. Implement polyfills and compatibility layer
  - Create polyfills file with Promise, Object.assign, and Array methods for Gecko 48
  - Implement XMLHttpRequest wrapper that returns Promises
  - Create utility functions for ES6 features (template literals, destructuring alternatives)
  - Write compatibility tests to verify polyfills work correctly
  - _Requirements: 1.2, 1.4, 1.5_

- [x] 3. Create core utilities and helpers
  - [x] 3.1 Implement storage wrapper for LocalStorage
    - Write StorageManager class with get, set, remove, and clear methods
    - Add error handling for quota exceeded scenarios
    - Implement serialization/deserialization for complex objects
    - Write unit tests for storage operations
    - _Requirements: 5.3, 5.4, 6.2_
  
  - [x] 3.2 Create date formatting utilities
    - Implement relative time formatting (e.g., "2h ago", "3d ago")
    - Add locale-aware date formatting
    - Create timestamp parsing utilities
    - Write tests for various date scenarios
    - _Requirements: 10.5_
  
  - [x] 3.3 Build text processing utilities
    - Implement text truncation with ellipsis
    - Create URL detection and linkification
    - Add mention (@handle) detection
    - Write character counting utility respecting Unicode
    - Write tests for edge cases
    - _Requirements: 4.5, 8.2_

- [x] 4. Implement ATP API client
  - [x] 4.1 Create base HTTP client
    - Implement XMLHttpRequest wrapper with Promise interface
    - Add request/response interceptors
    - Implement timeout handling
    - Add retry logic with exponential backoff
    - Write tests for HTTP client methods
    - _Requirements: 4.1, 6.1, 6.4, 9.1_
  
  - [x] 4.2 Implement authentication methods
    - Write login method (createSession endpoint)
    - Implement session refresh method
    - Add JWT token storage and retrieval
    - Implement automatic token refresh before expiration
    - Write tests for auth flows
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [x] 4.3 Implement timeline and post methods
    - Write getTimeline method with cursor pagination
    - Implement createPost method
    - Add likePost, unlikePost methods
    - Implement repost and unrepost methods
    - Add getPost method for single post retrieval
    - Write tests for post operations
    - _Requirements: 4.2, 4.3, 4.4, 4.5_
  
  - [x] 4.4 Implement profile methods
    - Write getProfile method
    - Implement updateProfile method for display name and bio
    - Add follow and unfollow methods
    - Write tests for profile operations
    - _Requirements: 4.7, 4.8, 4.9_
  
  - [x] 4.5 Implement notifications method
    - Write getNotifications method with pagination
    - Add notification count method
    - Write tests for notification retrieval
    - _Requirements: 4.7_

- [x] 5. Create cache management system
  - Implement CacheManager class with TTL support
  - Add cache key generation utilities
  - Implement cache pruning for expired entries
  - Add LRU eviction when approaching storage limits
  - Write cache invalidation methods
  - Write tests for cache operations
  - _Requirements: 6.2, 6.4, 7.5_

- [x] 6. Build state management layer
  - [x] 6.1 Create app state structure and context
    - Define AppState interface with user, session, timeline, settings, navigation
    - Implement Preact Context for global state
    - Create useAppState hook for consuming state
    - Write state initialization logic
    - _Requirements: 5.3, 5.4_
  
  - [x] 6.2 Implement state reducer and actions
    - Write reducer function for state updates
    - Create action creators for login, logout, timeline updates, navigation
    - Implement state persistence to LocalStorage
    - Add state hydration on app load
    - Write tests for reducer logic
    - _Requirements: 5.3, 5.4, 5.6_
  
  - [x] 6.3 Create session management logic
    - Implement session validation on app start
    - Add automatic session refresh logic
    - Create logout handler that clears state and storage
    - Write session expiration detection
    - Write tests for session management
    - _Requirements: 5.4, 5.5, 5.6_

- [x] 7. Implement navigation system
  - [x] 7.1 Create NavigationManager class
    - Implement D-pad event handling (ArrowUp, ArrowDown, ArrowLeft, ArrowRight)
    - Add Enter key handling for selection
    - Implement softkey event handling (SoftLeft, SoftRight)
    - Create focus management with circular navigation
    - Add visual focus indicator application
    - Write tests for navigation logic
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [x] 7.2 Create custom router
    - Implement simple hash-based router
    - Add route registration and matching
    - Create navigation history management
    - Implement back navigation
    - Write route change event handling
    - Write tests for routing logic
    - _Requirements: 3.1, 3.2_
  
  - [x] 7.3 Build SoftkeyBar component
    - Create component that displays softkey labels
    - Implement dynamic softkey context updates
    - Add softkey action binding
    - Style component for KaiOS display
    - Write tests for softkey interactions
    - _Requirements: 3.5_

- [x] 8. Create base UI components
  - [x] 8.1 Implement LoadingIndicator component
    - Create simple loading spinner or text indicator
    - Add props for different loading states
    - Style for visibility on small screens
    - _Requirements: 9.4_
  
  - [x] 8.2 Create ErrorMessage component
    - Implement error display with user-friendly messages
    - Add retry button when applicable
    - Create error message mapping utility
    - Style for readability
    - _Requirements: 9.1, 9.2, 9.3_
  
  - [x] 8.3 Build TextInput component
    - Create input wrapper with KaiOS compatibility
    - Add character counter display
    - Implement max length enforcement
    - Add label and error state support
    - Style for KaiOS display
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [x] 8.4 Create Button component
    - Implement focusable button with navigation support
    - Add loading and disabled states
    - Style with focus indicators
    - _Requirements: 3.4_
  
  - [x] 8.5 Build Modal component
    - Create modal overlay and content container
    - Implement focus trapping within modal
    - Add close on Escape or back button
    - Style for KaiOS screen size
    - _Requirements: 9.1_

- [x] 9. Implement LoginView
  - Create LoginView component with handle and password inputs
  - Implement form submission handler
  - Add loading state during authentication
  - Display authentication errors
  - Navigate to timeline on successful login
  - Add input validation
  - Write tests for login flow
  - _Requirements: 5.1, 5.2, 9.2_

- [ ] 9.5. Implement SignupView
  - [ ] 9.5.1 Add signup API method to ATP client
    - Implement createAccount method using com.atproto.server.createAccount endpoint
    - Add email validation
    - Add handle availability check
    - Add invite code support (if required)
    - Handle signup errors (handle taken, invalid email, etc.)
    - Write tests for signup API calls
    - _Requirements: 5.1_
  
  - [ ] 9.5.2 Create SignupView component
    - Create form with email, handle, password, and invite code inputs
    - Add real-time handle validation
    - Implement password strength indicator
    - Add terms of service acceptance checkbox
    - Show loading state during account creation
    - Display validation and API errors
    - Navigate to timeline on successful signup
    - Write tests for signup flow
    - _Requirements: 5.1, 5.2, 9.2_
  
  - [ ] 9.5.3 Add signup link to LoginView
    - Add "Sign up" button/link to LoginView
    - Navigate to SignupView when clicked
    - Add "Already have an account?" link in SignupView to return to login
    - Update routing to include signup route
    - _Requirements: 5.1_

- [x] 10. Build timeline functionality
  - [x] 10.1 Create PostItem component
    - Implement component to display single post
    - Show author info (avatar, display name, handle)
    - Display post text with linkified URLs
    - Show timestamp with relative formatting
    - Display engagement counts (likes, reposts, replies)
    - Add visual indicators for user's interactions
    - Style for readability on small screen
    - _Requirements: 4.3, 4.6, 10.3_
  
  - [x] 10.2 Implement PostList component with virtual scrolling
    - Create list component that renders PostItem components
    - Implement virtual scrolling to render only visible items plus buffer
    - Add scroll position management
    - Handle empty state
    - Integrate with NavigationManager for D-pad navigation
    - Write tests for virtual scrolling logic
    - _Requirements: 3.1, 3.4, 7.2_
  
  - [x] 10.3 Create TimelineView component
    - Implement view that fetches and displays timeline
    - Add pull-to-refresh via softkey action
    - Implement infinite scroll with cursor pagination
    - Add loading states for initial load and pagination
    - Display errors with retry option
    - Integrate cache for offline viewing
    - Wire up navigation to post detail on selection
    - Write tests for timeline loading
    - _Requirements: 4.2, 4.3, 6.1, 6.2, 6.4, 9.4_

- [x] 11. Implement post interaction features
  - [x] 11.1 Create PostActionMenu component
    - Build action menu with like, repost, reply options
    - Implement D-pad navigation within menu
    - Add visual indicators for selected action
    - Handle action execution
    - Show loading states during actions
    - Display success/error feedback
    - _Requirements: 3.1, 3.2, 4.4_
  
  - [x] 11.2 Implement like/unlike functionality
    - Write like action handler in PostItem
    - Update local state optimistically
    - Call API to persist like
    - Handle errors and revert on failure
    - Update post viewer state
    - Write tests for like interactions
    - _Requirements: 4.4, 9.3_
  
  - [x] 11.3 Implement repost functionality
    - Write repost action handler
    - Show confirmation modal
    - Update local state optimistically
    - Call API to create repost
    - Handle errors and revert on failure
    - Write tests for repost interactions
    - _Requirements: 4.4, 9.3_

- [x] 12. Build post composition
  - [x] 12.1 Create ComposeView component
    - Implement text area for post composition
    - Add character counter (300 max)
    - Implement character limit enforcement
    - Add cancel and submit actions
    - Show confirmation on cancel if text entered
    - Display loading state during submission
    - Handle submission errors
    - _Requirements: 4.5, 8.1, 8.2, 8.3, 8.4_
  
  - [x] 12.2 Implement draft auto-save
    - Save draft to LocalStorage on text change (debounced)
    - Restore draft on ComposeView mount
    - Clear draft on successful submission
    - Clear draft on confirmed cancel
    - Write tests for draft persistence
    - _Requirements: 8.4_
  
  - [x] 12.3 Add reply composition support
    - Modify ComposeView to accept reply context
    - Pre-populate @mention of parent author
    - Display parent post context
    - Include reply references in API call
    - Write tests for reply composition
    - _Requirements: 4.4, 8.4_

- [x] 13. Implement PostDetailView
  - Create PostDetailView component
  - Fetch and display single post with full content
  - Load and display reply thread
  - Implement nested reply rendering (max 3 levels)
  - Add "View more" for deeper threads
  - Integrate PostActionMenu for interactions
  - Add navigation to reply composition
  - Write tests for post detail loading
  - _Requirements: 4.4_

- [x] 14. Build profile functionality
  - [x] 14.1 Create ProfileHeader component
    - Display avatar (with data saver option)
    - Show display name and handle
    - Display bio/description
    - Show follower and following counts
    - Add follow/unfollow button for other users
    - Add edit button for own profile
    - Style for small screen
    - _Requirements: 4.7_
  
  - [x] 14.2 Implement ProfileView component
    - Fetch and display user profile
    - Show ProfileHeader
    - Display user's posts using PostList
    - Add loading and error states
    - Integrate with cache
    - Write tests for profile loading
    - _Requirements: 4.7_
  
  - [x] 14.3 Create EditProfileView component
    - Implement form with display name and bio inputs
    - Add character counters for both fields
    - Implement save and cancel actions
    - Show loading state during save
    - Display validation errors
    - Navigate back to profile on success
    - Write tests for profile editing
    - _Requirements: 4.8, 4.9_

- [ ] 15. Implement notifications
  - [x] 15.1 Create NotificationItem component
    - Display notification type (like, repost, follow, reply, mention)
    - Show actor info and timestamp
    - Display relevant post content if applicable
    - Add navigation to related content on selection
    - Style for readability
    - _Requirements: 4.7_
  
  - [x] 15.2 Create NotificationsView component
    - Fetch and display notifications list
    - Implement pagination
    - Add loading and error states
    - Integrate with NavigationManager
    - Mark notifications as read on view
    - Write tests for notification loading
    - _Requirements: 4.7_

- [ ] 16. Implement data saver mode
  - [ ] 16.1 Create settings management
    - Add settings to app state
    - Implement settings persistence to LocalStorage
    - Create settings toggle utilities
    - _Requirements: 2.6, 6.1_
  
  - [ ] 16.2 Implement conditional image loading
    - Modify PostItem to check data saver setting
    - Show placeholder instead of avatar when enabled
    - Add "Load images" option in post action menu
    - Update image loading logic throughout app
    - Write tests for image loading behavior
    - _Requirements: 2.3, 2.5, 2.6_
  
  - [ ] 16.3 Add data usage optimizations
    - Implement request deduplication
    - Add conditional requests with ETags if supported
    - Optimize timeline refresh to fetch only new posts
    - Write tests for optimization logic
    - _Requirements: 2.4_

- [ ] 17. Implement offline support
  - Create offline detection utility
  - Add network status to app state
  - Display offline indicator in UI
  - Modify API client to check network status before requests
  - Show cached content when offline
  - Display appropriate error messages for offline actions
  - Implement automatic retry when connection restored
  - Write tests for offline behavior
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 18. Add error handling and user feedback
  - Implement global error boundary component
  - Create error logging utility
  - Add toast notification system for non-critical errors
  - Implement error message mapping for common errors
  - Add retry mechanisms for failed requests
  - Create user-friendly error messages for all error types
  - Write tests for error handling flows
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 19. Implement App component and routing
  - Create main App component
  - Set up AppState provider
  - Implement router with all view routes
  - Add route guards for authentication
  - Implement initial session check and restoration
  - Add global NavigationManager initialization
  - Wire up SoftkeyBar with route-specific actions
  - Create ErrorBoundary wrapper
  - Write tests for app initialization
  - _Requirements: 5.4, 5.5_

- [ ] 20. Add internationalization support
  - [ ] 20.1 Create i18n infrastructure
    - Implement simple key-based translation lookup
    - Create language file loader
    - Add language detection from device settings
    - Implement fallback to English
    - Create useTranslation hook
    - _Requirements: 10.1, 10.4_
  
  - [ ] 20.2 Create language files
    - Write English (en) translations for all UI text
    - Create Spanish (es) translations
    - Create French (fr) translations
    - Create Portuguese (pt) translations
    - Write tests for translation loading
    - _Requirements: 10.1, 10.4_
  
  - [ ] 20.3 Apply translations throughout app
    - Replace hardcoded strings with translation keys
    - Update all components to use useTranslation hook
    - Test language switching
    - _Requirements: 10.1, 10.4_

- [ ] 21. Implement accessibility features
  - Add semantic HTML throughout components
  - Implement ARIA labels for icon buttons and interactive elements
  - Add ARIA live regions for dynamic content updates
  - Ensure proper heading hierarchy in all views
  - Add skip navigation links
  - Verify focus indicators meet contrast requirements
  - Test with screen reader (if available on KaiOS)
  - Write accessibility audit checklist
  - _Requirements: 10.2, 10.3_

- [ ] 22. Create styling and theming
  - [ ] 22.1 Set up base styles
    - Create CSS reset for consistency
    - Define CSS variables for colors, spacing, typography
    - Implement base typography styles
    - Create utility classes for common patterns
    - _Requirements: 10.3_
  
  - [ ] 22.2 Style all components
    - Apply styles to all view components
    - Ensure high contrast for readability (WCAG AA)
    - Implement focus indicators with 3:1 contrast
    - Optimize for 240x320 screen resolution
    - Test on actual KaiOS device for visual verification
    - _Requirements: 3.4, 10.3_
  
  - [ ] 22.3 Implement responsive adjustments
    - Add media queries for different KaiOS screen sizes
    - Test on multiple device resolutions
    - Adjust font sizes for readability
    - _Requirements: 10.3_

- [ ] 23. Optimize bundle and performance
  - [ ] 23.1 Analyze and optimize bundle size
    - Run Webpack Bundle Analyzer
    - Identify and remove unused dependencies
    - Implement code splitting for routes
    - Optimize imports to enable tree shaking
    - Verify gzipped bundle is under 200KB
    - _Requirements: 2.1, 2.2_
  
  - [ ] 23.2 Implement performance optimizations
    - Add memoization to expensive computations
    - Implement debouncing for scroll and input handlers
    - Optimize re-renders with React.memo equivalents
    - Add request deduplication
    - Profile and optimize hot paths
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [ ] 23.3 Add memory management
    - Implement cache size limits
    - Add automatic cache pruning
    - Clean up event listeners on component unmount
    - Limit in-memory timeline size
    - Test memory usage on device
    - _Requirements: 7.5_

- [ ] 24. Create build and deployment setup
  - Configure production Webpack build
  - Set up minification with UglifyJS for ES5 compatibility
  - Enable gzip compression for assets
  - Create deployment script for static hosting
  - Set up environment variable management
  - Create README with build and deployment instructions
  - Test production build on KaiOS device
  - _Requirements: 1.1, 1.3, 1.4_

- [ ] 25. Write end-to-end integration tests
  - Create test scenarios for complete user flows
  - Write test for login to timeline flow
  - Write test for post creation flow
  - Write test for post interaction flow
  - Write test for profile viewing and editing flow
  - Write test for offline behavior
  - Write test for session expiration handling
  - Document test results
  - _Requirements: All requirements_
