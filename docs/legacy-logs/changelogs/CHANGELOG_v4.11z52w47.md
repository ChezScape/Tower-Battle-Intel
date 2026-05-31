# Tower Battle Intel v4.11z52w47 — Command Deck Build Style No-Render Retention

## Fixed
- Build Style changes in Command Deck no longer re-render the Command Deck textarea.
- Pasted Battle Report text stays visible when choosing Unknown / Health EHP / Blender / Devo / Orb Devo / Glass Cannon / Hybrid.
- Build Style still updates app state and storage.
- Current Loadout Build Style text is updated in-place without replacing the report input.

## Why
The w46 attempt cached the textarea draft before render, but the dropdown still triggered a full Command Deck render. In Chrome/VS Code browser testing, that render could still replace the visible textarea and clear the pasted report. w47 removes that full-render path for Build Style changes.

## Protected
- Dashboard/Header untouched.
- Command Deck validate/save/raw-source logic untouched.
- History cards/search/pager/inspector untouched.
- Stats/Edit modals untouched.
- Click Truth Probe untouched.
- Raw source/archive spine untouched.
- Mobile untouched.
