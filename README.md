# Lipi

feat: implement native 'Save As' dialog for newly created files

- Upgraded `saveCurrentFile` to use `showSaveFilePicker` for files without an existing handle
- Implemented dynamic UI updates to reflect filename changes made via the OS save dialog
- Added logic to automatically push newly saved files into the IndexedDB Recent Files list
- Handled `AbortError` gracefully so canceling the save dialog doesn't trigger a fallback download