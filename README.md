# Lipi

feat: build custom M3 theme dropdown and custom keyboard focus

- Completely replaced native `<select>` element with a custom HTML/CSS/JS dropdown
- Implemented global keyboard focus engine: stripped all native `outline` properties and replaced them with `:focus-visible` background color highlights
- Reused existing `.m3-menu` CSS class to ensure the new Theme dropdown matches the visual style of the Add and Save menus
- Updated JavaScript to handle custom theme dropdown state, option selection, and label updating
- Ensured keyboard arrow keys no longer accidentally cycle themes since the native select is gone