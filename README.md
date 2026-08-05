# Lipi

feat: implement ephemeral state management and session persistence toggle

- Added a "Preserve Session Data" toggle to the Settings view using custom M3 switch styling
- Built a Memory State Manager (`this.memoryState`) to handle ephemeral settings and recent files
- Refactored `initTheme`, `initFonts`, and `saveToRecent` to use a dynamic getter/setter that checks the persistence flag
- Implemented real-time data migration logic: toggling persistence seamlessly pushes data to `localStorage`/`IndexedDB` or pulls it back to memory and wipes the permanent databases
- Made ephemeral mode the default state for maximum privacy and zero-footprint operation