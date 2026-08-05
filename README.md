# Lipi

feat: implement responsive bottom sheet for mobile status bar

- Removed horizontal ribbon scroll behavior from `#status-bar`
- Built `.m3-bottom-sheet` component to elegantly display document metrics on actual mobile devices
- Implemented user agent detection (`isMobile`) to automatically route mobile users to the Bottom Sheet UI
- Added "Classic Status Bar" setting (visible only on mobile) to let users force the desktop layout
- Re-implemented aggressive abbreviation logic tied to window resize (`isNarrow`) for narrow desktop views
- Expanded memory state manager to handle new `lipi-mobile-bar-force` user preference