# Lipi

fix: remove hidden menu elements from keyboard tab index

- Added `visibility` toggles to `.m3-menu`, `.custom-context-menu`, and `.m3-dialog` CSS classes
- Implemented delayed visibility transitions (`visibility 0s linear 0.2s`) to sync with opacity fade-outs
- Ensured closed UI components are completely ignored by native browser Tab navigation while preserving M3 animation fluidity