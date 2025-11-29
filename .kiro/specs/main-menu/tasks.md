# Implementation Plan

- [x] 1. Create LogoutConfirmation component
  - Create `src/components/LogoutConfirmation.js` with confirmation dialog
  - Implement left/right navigation between Cancel and Confirm options
  - Add keyboard event handlers for selection and dismissal
  - Create `src/components/LogoutConfirmation.css` with styling
  - Write unit tests in `src/components/LogoutConfirmation.test.js`
  - _Requirements: 1.5_

- [x] 2. Add internationalization strings for menu and settings
  - Add menu translation keys to `public/i18n/en.json`
  - Add menu translation keys to `public/i18n/es.json`
  - Add menu translation keys to `public/i18n/fr.json`
  - Add menu translation keys to `public/i18n/pt.json`
  - Add settings translation keys to all language files
  - _Requirements: 1.6_

- [x] 3. Create MainMenu component
  - Create `src/views/MainMenu.js` with menu structure
  - Implement menu items array (Profile, Settings, Logout)
  - Add D-pad navigation with up/down arrow keys and wrapping
  - Implement selection handler that calls appropriate callback
  - Add keyboard event listeners in componentDidMount
  - Integrate LogoutConfirmation dialog for logout action
  - Create `src/views/MainMenu.css` with overlay and menu styling
  - Write unit tests in `src/views/MainMenu.test.js`
  - _Requirements: 1.1, 1.2, 1.3, 1.5, 1.6, 1.7, 1.8_

- [x] 4. Create SettingsView component
  - Create `src/views/SettingsView.js` with settings list
  - Implement data saver mode toggle
  - Implement language selector with picker dialog
  - Add about section with app version
  - Add D-pad navigation between settings items
  - Implement softkey configuration (Select, Back)
  - Create `src/views/SettingsView.css` with settings styling
  - Write unit tests in `src/views/SettingsView.test.js`
  - _Requirements: 1.4, 1.6, 1.7_

- [x] 5. Integrate MainMenu into App.js
  - Add `/settings` route to App.js router
  - Add state for showing/hiding main menu
  - Create `openMainMenu` handler that shows menu overlay
  - Create `closeMainMenu` handler that hides menu
  - Create `handleNavigateToProfile` that navigates to user's profile using `state.user.handle`
  - Create `handleNavigateToSettings` that navigates to `/settings`
  - Create `handleLogout` that dispatches LOGOUT action and clears session
  - Render MainMenu component when menu state is open
  - Pass all required props and callbacks to MainMenu
  - _Requirements: 1.1, 1.3, 1.4, 1.5_

- [x] 6. Update TimelineView to use MainMenu
  - Change right softkey from "Actions" to "Menu"
  - Update softkey action to call `props.onOpenMainMenu` instead of `openActionMenu`
  - Keep post action menu accessible via Enter/Select on focused post
  - Update TimelineView tests to reflect new softkey behavior
  - _Requirements: 1.1, 1.2_