# Lipi

style: refine theme dropdown button aesthetics and focus states

- Removed `border` and updated `background-color` on `.m3-select-btn` to `surface-container-high` for instant M3 interactive recognition
- Added mouse hover states to `.m3-select-btn` with dark mode support
- Removed old padding/border-shifting `:focus-visible` rules
- Injected `.m3-select-btn:focus-visible` into the global Keyboard Focus Engine for a unified background highlight behavior