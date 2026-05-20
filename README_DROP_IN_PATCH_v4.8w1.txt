Tower Battle Intel v4.8w1 Drop-In Hotfix
========================================

Purpose:
Fixes the confirm modal appearing immediately on page load and blocking the site.

Changed files:
- config/appConfig.js
- src/ui/components/confirmModal.js
- src/ui/events.js

Install:
Copy the files into the same paths in your project, replacing the old versions.
Then hard refresh the browser.

What changed:
- The History confirmation modal now starts hidden.
- The modal now uses inert while closed.
- The modal removes inert only when opened.
- Closing the modal now moves focus out before aria-hidden is restored.
- This avoids the Chrome "Blocked aria-hidden because descendant retained focus" warning.
- Version changed to v4.8w1.
