# Lipi

feat: implement progressive save dropdown with dynamic fallback icons

- Wrapped Save button in a dropdown anchor to group "Save" and "Save As" actions
- Styled Save button to include a dropdown arrow indicating a hidden menu
- Removed "Save As" from the Add menu and relocated it to the new Save dropdown
- Implemented dynamic icon swapping: uses 'save'/'save_as' on supported browsers, and 'download'/'sim_card_download' on unsupported fallback browsers
- Updated UI state logic: main Save menu is enabled for all active files, while the "Save" action within the menu tracks the `isUnsaved` state