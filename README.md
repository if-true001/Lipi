# Lipi

A lightweight, modern, browser-based text editor featuring real-time Markdown preview, tabbed file management, and offline PWA functionality.

Lipi operates entirely in the browser and can be installed on your desktop or mobile device as a Progressive Web App (PWA) for a native offline experience.

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

## Project Structure

```
Lipi/
├── index.html              # PWA Landing page & installation layout
├── style.css               # Landing page custom styles
├── script.js               # Landing page PWA install driver
├── service_worker.js       # App Shell caching service worker
├── manifest.json           # Web app install manifest config
├── LICENSE                 # MIT License (Lipi)
├── THIRD_PARTY_LICENSES.md # Third-party licenses (Marked.js, Markdown)
├── README.md               # Project documentation
└── app/
    ├── app.html            # Main Lipi Editor app interface
    ├── css/
    │   ├── main.css        # Core Material Design 3 design system tokens
    │   └── layout.css      # Editor screen grids & markdown rendering
    ├── icons/
    │   ├── icon-192.png    # PWA 192x192 icon
    │   ├── icon-512.png    # PWA 512x512 icon
    │   ├── icon.png        # Standard app icon
    │   └── icon.svg        # Scalable vector app icon
    └── js/
        ├── app.js          # LipiApp core logic & state manager
        └── sw-register.js  # Client-side service worker register & installer
```

---

## Release Notes — Version 1.1.2

### Added
- `fix`: enable web share target on Android

- Add common MIME types (application/octet-stream, application/json,
  application/javascript, text/css, text/html) to manifest.json share_target params.
  This allows Android system share sheets, which filter strictly by MIME type,
  to display Lipi for shared markdown and config files.
- Normalize incoming share target pathname in service_worker.js to handle
  trailing slashes robustly.
- Resolve service worker redirect URLs relative to self.registration.scope
  instead of event.request.url to prevent incorrect directory path resolution.
- Bumped app and service worker cache version to `1.1.2` to force cache invalidation.

---

## License

Distributed under the [MIT License](LICENSE). Third-party software notices are available in [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md).
