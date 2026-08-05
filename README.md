# Lipi

feat: implement custom M3 Save As dialog for fallback browsers

- Replaced native `prompt()` with a custom in-app modal for unsupported browsers
- Designed modal using Material 3 specifications (centered, elevated, rounded geometry)
- Utilized the existing `.scrim` overlay logic for a consistent background dimming effect
- Implemented smart text selection: automatically highlights the filename portion (excluding extension) when the modal opens
- Added keyboard accessibility: Enter to save, Escape to cancel from within the input field