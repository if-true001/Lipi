# Lipi

feat: implement unsaved file safety net and confirmation modal

- Added a custom M3 warning modal when attempting to close an unsaved file
- Implemented smart Save button logic in the modal: dynamically switches between "Save" and "Save As..." based on file handle state
- Added "Discard" button with M3 Error coloring (`.m3-btn-danger`) for distinct visual hierarchy
- Refactored `closeFile` logic to intercept the action, utilizing `performCloseFile` only upon confirmation
- Implemented `beforeunload` global window listener to prevent accidental browser refreshes/closes with unsaved work