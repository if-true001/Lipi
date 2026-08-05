# Lipi

feat: implement custom M3 context menu for text editor

- Added `#editor-context-menu` to `index.html` with standard text manipulation options (Cut, Copy, Paste, Undo, Redo, Delete)
- Reused `.custom-context-menu` CSS class for consistent visibility and tab-blocking behavior
- Updated global `contextmenu` listener to intercept right-clicks inside `#main-editor` and trigger the custom menu
- Implemented `document.execCommand` for Cut, Copy, Undo, Redo, and Delete to perfectly preserve the native browser undo stack
- Implemented `navigator.clipboard.readText()` paired with `insertText` for secure pasting
- Ensured editor retains focus during menu clicks to prevent command execution failures