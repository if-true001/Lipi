# Lipi

style: implement cross-browser theme-adaptive custom scrollbars

- Applied standard W3C `scrollbar-width` and `scrollbar-color` to all elements for native Firefox support
- Implemented `::-webkit-scrollbar` pseudo-elements for Chrome/Edge/Safari to override bulky default UI
- Removed scrollbar up/down arrows (`::-webkit-scrollbar-button { display: none; }`) for a cleaner look
- Bound scrollbar thumb colors directly to M3 CSS variables (`--md-sys-color-outline`) to guarantee perfect Light/Dark theme syncing
- Kept scrollbar track transparent to blend seamlessly with elevated M3 surface containers