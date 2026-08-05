# Lipi

feat: hide action buttons in settings and improve theme select UX

- Added `id="top-bar-actions"` to the right App Bar container for precise JS targeting
- Updated UI state logic to hide the top bar actions when in Settings View, restoring them for Editor/Welcome views
- Replaced `.m3-select:focus` with `:focus-visible` in CSS to prevent lingering focus styles after mouse interaction
- Appended `e.target.blur()` to the theme selection listener to drop keyboard focus and prevent accidental arrow-key changes