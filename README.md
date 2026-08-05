# Lipi

feat: implement inline file renaming and progressive 'Save As'

- Made Top App Bar title `contenteditable` for active files to allow inline renaming
- Added logic to sever native file handles upon renaming to prevent accidental overwriting of old files
- Added "Save As..." option to the M3 Dropdown Menu with disabled state management
- Implemented native `showSaveFilePicker` for "Save As" on supported browsers
- Implemented `prompt()` based "Save As" fallback for unsupported browsers
- Added CSS styles for editable title hover/focus states