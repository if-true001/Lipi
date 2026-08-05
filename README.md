# Lipi

style: implement unified custom cross-device scrollbars

- Applied global `scrollbar-width: thin` and `scrollbar-color` for Firefox support
- Implemented `::-webkit-scrollbar` suite for Chrome/Edge/Safari to override native OS scrollbars
- Removed scroll arrows using `::-webkit-scrollbar-button { display: none; }`
- Used `border: solid transparent` and `background-clip: padding-box` trick to create a narrow scrollbar that visually enlarges on `:hover` and `:active`
- Linked scrollbar colors to M3 CSS variables (`--md-sys-color-outline` and `--md-sys-color-primary`) for native dark mode adaptability