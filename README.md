# Lipi

feat: implement native UI text selection blocking and custom context menu

- Applied global `user-select: none` to `body` to prevent accidental UI highlighting
- Overrode `user-select` to `text` for `textarea`, `input`, and `contenteditable` elements
- Intercepted global `contextmenu` event to block the default browser right-click menu on all UI elements
- Kept native right-click menu active inside the main text editor for clipboard/spellcheck access
- Implemented a custom M3 Context Menu for sidebar files (Open, Rename, Close)
- Updated sidebar rendering to include `data-id` attributes for context menu targeting