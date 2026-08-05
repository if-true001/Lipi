# Lipi

feat: implement WAI-ARIA keyboard navigation for custom theme dropdown

- Added `keydown` listener to the Theme Select button to open the menu via `Enter`, `Space`, or `ArrowDown`
- Implemented automatic focus trapping: opening the menu via keyboard instantly focuses the currently active theme option
- Added `ArrowUp` and `ArrowDown` listeners to `.theme-option` items for seamless looping navigation
- Added `Escape` key listener to abort selection and safely return focus to the main button
- Updated option `click` (and `Enter`) logic to automatically restore focus to the main button after a selection is made