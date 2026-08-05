# Lipi

feat: implement settings page with dynamic M3 dark mode theming

- Created `#settings-view` workspace canvas to replace the editor/welcome screen
- Implemented a Theme toggle dropdown (Light, Dark, System Default)
- Added comprehensive M3 dark mode CSS variables using data attributes and media queries
- Updated JS state management to handle the settings view and highlight the sidebar button
- Connected theme selection to `localStorage` for persistent user preferences