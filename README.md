# Lipi

feat: implement cross-platform keyboard shortcuts and refine UI

- Added global `keydown` listener to intercept and handle application shortcuts
- Implemented cross-OS modifier detection (`metaKey` for Mac, `ctrlKey` for Windows/Linux)
- Added `Ctrl/Cmd + S` (Save), `Ctrl/Cmd + Shift + S` (Save As), `Ctrl/Cmd + O` (Open), and `Ctrl/Cmd + N` (New)
- Added `Ctrl/Cmd + Tab` (and `Shift+Tab`) for cycling through open files, with `Ctrl/Cmd + ArrowUp/ArrowDown` as browser-safe fallbacks
- Shortened the session preservation setting description to remove the word "browser" for a cleaner UI