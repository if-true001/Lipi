# Lipi

refactor: implement universal WAI-ARIA keyboard navigation for all dropdowns

- Abstracted theme-specific keyboard navigation into a reusable `setupMenuKeyboardNav` helper function
- Applied the new keyboard engine to the Add Menu, Save Menu, and Theme Menu
- Implemented smart element querying to dynamically handle injected "Recent Files"
- Ensured keyboard navigation securely skips elements with `disabled` attributes or `.disabled` classes
- Retained dynamic focus target memory (Theme menu still remembers the active theme on open)