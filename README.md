# Lipi

polishing: refine UI for unsupported browsers and update sidebar labels

- Added feature detection for the File System Access API
- Conditionally hide "Recent" sections in the Welcome View and Dropdown for unsupported browsers
- Changed sidebar section label from "OPEN EDITORS" to "ACTIVE FILES"
- Updated `initDB` and `renderRecentFiles` to fail gracefully if the API is missing