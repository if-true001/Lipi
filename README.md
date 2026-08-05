# Lipi

style: refine mobile UI with floating M3 status pill and fixed settings layout

- Fixed settings UI squeezing by applying `flex: 1` to `.setting-info` and `flex-shrink: 0` to interactable controls (`.m3-switch`, `.dropdown-anchor`)
- Added `.pill-mode` class to `#status-bar` to transform the mobile status trigger into a floating, elevated Material 3 pill
- Updated `#editor-view` to `position: relative` to safely anchor the floating absolute pill
- Added `transition: all 0.3s cubic-bezier(0.2, 0, 0, 1)` to the status bar to seamlessly animate morphological changes when toggling between desktop and mobile modes
- Updated JS `updateStatusBar` to dynamically inject the `.pill-mode` class when the bottom sheet configuration is active