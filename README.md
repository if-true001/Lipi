# Lipi

refactor: group settings into M3 cards and dynamically update descriptions

- Introduced `.settings-card` CSS class to visually group related configuration items into elevated M3 containers
- Restructured `index.html` `#settings-view` into "Storage & Privacy" and "Appearance" groups
- Elevated the "Preserve Session Data" toggle to the very top of the settings page
- Added `#preserve-data-desc` ID to target the preservation description text
- Updated `handleFeatureSupportUI` in `app.js` to conditionally rewrite the description, hiding references to "recent files" on unsupported browsers