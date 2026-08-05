# Lipi

style: apply high-contrast primary color to mobile status pill and remove shadow

- Updated `#status-bar.pill-mode` `background-color` to `var(--md-sys-color-primary)` for distinct visual separation from the editor canvas
- Mapped text `color` inside the pill to `var(--md-sys-color-on-primary)` to guarantee perfect legibility in both Light and Dark modes
- Removed `box-shadow` from the pill mode as the high-contrast color strategy eliminates the need for artificial depth