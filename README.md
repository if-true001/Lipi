# Lipi

feat: implement customizable typography for UI and editor

- Added UI Font and Editor Font custom M3 dropdowns to the Settings view
- Populated dropdowns with highly available cross-platform system fonts
- Implemented `initFonts` logic to persist font choices via `localStorage` and apply them dynamically via CSS variable overrides
- Included "Reset to Defaults" action to instantly clear overrides and restore Roboto / JetBrains Mono
- Applied `font-family: inherit` to `#main-editor::placeholder` to keep placeholder text synced with the editor font
- Expanded universal keyboard navigation engine to support the new font dropdown menus