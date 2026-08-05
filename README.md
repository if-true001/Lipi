# Lipi

feat: implement responsive M3 editor status bar with dynamic metrics

- Added `#status-bar` to `#editor-view` in `index.html` to display line, column, length, language, line-endings, and encoding
- Styled status bar with M3 typography, layout CSS, and responsive breakpoints to gracefully hide non-essential data on mobile
- Built `updateStatusBar()` engine in `app.js` to calculate absolute cursor coordinates (Ln/Col) and document length dynamically
- Hooked `keyup`, `click`, and `input` events to the status engine for real-time tracking
- Implemented file-extension parsing to automatically detect and display view modes (Markdown, JSON, HTML, etc.)
- Added cross-platform line-ending detection that intelligently scans imported files or inherits OS defaults for new files