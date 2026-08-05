# Lipi

style: unify typography across the application using Google Fonts

- Consolidated Google Fonts imports in `index.html` to include Roboto, JetBrains Mono, and Supermercado One
- Updated `--md-sys-typescale-display-large-font` CSS variable to prioritize `Roboto` for global UI consistency
- Introduced `--editor-font-family` CSS variable utilizing `JetBrains Mono`
- Applied the new monospace font to `#main-editor` in `layout.css`