# Lipi

fix: implement W3C standard escape hatch for editor tab trap

- Replaced native `.blur()` on `Escape` with a stateful `escapeTabTrap` flag
- Updated `keydown` listener on `#main-editor` to bypass `e.preventDefault()` on the next `Tab` stroke if the escape hatch is active
- Added reset logic to re-enable the tab trap if the user resumes typing
- Ensured seamless forward (`Tab`) and backward (`Shift+Tab`) navigation out of the text editor