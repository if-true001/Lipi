# Lipi

feat: implement progressive file I/O with IndexedDB recent file tracking

- Added `<input type="file">` in `index.html` for fallback file opening
- Implemented `IndexedDB` integration to securely store `FileSystemFileHandle` objects
- Implemented modern `showOpenFilePicker()` for native file reading on supported devices
- Implemented modern `createWritable()` for direct-to-disk overwriting on supported devices
- Hooked up fallback Blob download mechanism for devices restricting local disk access
- Built interactive "Recent Files" list that queries OS permissions upon reactivation
- Refactored file loading logic to attach handles to internal state array