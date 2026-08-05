# Lipi

A lightweight, modern, browser-based text editor which works completely offline.

---

## Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl` + `S` / `Cmd` + `S` | Save current file |
| `Ctrl` + `Shift` + `S` / `Cmd` + `Shift` + `S` | Save file as... |
| `Ctrl` + `O` / `Cmd` + `O` | Open file picker |
| `Ctrl` + `N` / `Cmd` + `N` | Create new file |
| `Ctrl` + `Tab` / `Cmd` + `Tab` | Switch to next open tab |
| `Esc` then `Tab` | Escape editor tab insertion to navigate UI focus |

---

## Release Notes — Version 1.0.0

### Added
- `feat`: Integrated `marked.js` for real-time Markdown preview with interactive mode toggling in the status bar.
- `feat`: Added **About Lipi** section in Settings with versioning (`1.0.0`), GitHub link (`https://github.com/if-true001/Lipi`), and Open Source Licenses modal.
- `feat`: Added `THIRD_PARTY_LICENSES.md` file in repository root for third-party open-source notices.

### Styling & UI
- `style`: Designed Markdown preview pane with neutral typography, styled inline `code` highlights, pre-blocks, and table rendering.
- `style`: Formatted Open Source Licenses modal with scrollable content area (`50vh`) and clean HTML hierarchy.
- `style`: Added interactive cursor and underline indicators for `.md` language status pill.

### Fixes & Refinements
- `fix`: Resolved status bar click event bubbling to prevent mobile bottom sheet trigger when toggling Markdown view mode.
- `fix`: Wired open/close modal event listeners for Open Source Licenses view action.
- `fix`: Synced tab rename logic to dynamically trigger Markdown view mode and status bar updates.

---

## License

Distributed under the [MIT License](LICENSE). Third-party software notices are available in [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md).