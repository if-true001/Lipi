# Lipi

style: optimize status bar for mobile devices with swipeable ribbon and compact metrics

- Removed `display: none` media query for status bar elements on small screens
- Implemented `overflow-x: auto` and `scrollbar-width: none` on `#status-bar` to create a swipeable, invisible-scroll track for mobile devices
- Condensed JS metric outputs: "Windows (CRLF)" to "CRLF", "Unix (LF)" to "LF", and "chars" to "ch"
- Reduced `.status-left` and `.status-right` flex gaps on mobile breakpoints to maximize visible data