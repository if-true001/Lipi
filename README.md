# Lipi

feat: implement togglable line number gutter synchronized with editor

- Added `#editor-container` and `#line-numbers-gutter` to layout DOM
- Synchronized `font-size`, `line-height`, `font-family`, and `padding` to guarantee perfect vertical alignment
- Implemented `scroll` and `input` event listeners to dynamically generate line numbers and sync scrolling
- Added "Show Line Numbers" toggle to the Settings -> Appearance card
- Added memory state and live migration support for `lipi-line-numbers`
- Implemented dynamic `white-space` toggling to enforce standard code-editor line counting when enabled