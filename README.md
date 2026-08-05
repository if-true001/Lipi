# Lipi

fix: fix title overflow and implement unsaved state indicators

- Applied `flex: 1` and `min-width: 0` to the Top App Bar left group to enforce text ellipsis on long filenames
- Locked Top App Bar right group with `flex-shrink: 0` to prevent layout compression
- Introduced `isUnsaved` tracking to the internal file state array
- Added dynamic unsaved indicators (`●`) next to the active file title and within the sidebar
- Wired the editor's `input` event to trigger the unsaved state and enable the save button
- Reset the unsaved state upon successful native disk save or fallback download