# Tower Battle Intel v4.11z52w46 — Command Deck Build Style Input Retention

## Fixed
- Changing the Command Deck Build Style dropdown now preserves the visible pasted Battle Report text.
- The build-style change handler now caches the visible Command Deck textarea before triggering the set-build-style action and render.
- This prevents pasted single/batch reports from disappearing when switching from Unknown to Hybrid, Blender, Devo, etc.

## Protected
- Dashboard untouched.
- Header untouched.
- Command Deck save/validate/raw-source logic untouched.
- History cards/search/pager/inspector untouched.
- Stats/Edit modals untouched.
- Click Truth Probe untouched.
- Raw source/archive spine untouched.
- Mobile unchanged.
