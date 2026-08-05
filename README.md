# Lipi

fix: restore keyboard focus flow and remove native select styling

- Removed `e.target.blur()` from theme selector to allow continuous keyboard navigation via Tab key
- Added `appearance: none` and a custom SVG background arrow to `.m3-select` to completely override native browser dropdown styling
- Enforced `outline: none` and `box-shadow: none` to prevent default browser focus rings from overriding the M3 design
- Adjusted `:focus-visible` padding constraints to accommodate the new custom arrow spacing