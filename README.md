# Lipi

feat: implement recent files memory management and cleanup

- Implemented a strict 6-file limit for the IndexedDB Recent Files storage
- Upgraded `saveToRecent` to automatically prune the oldest files when the limit is exceeded
- Added `removeRecentFile` logic to explicitly delete specific files from history
- Injected individual "remove" (`close`) icon buttons for recent files in both the Welcome View and Dropdown
- Added `.recent-item-wrapper` flexbox CSS to smoothly align files and their corresponding delete buttons