# Tower Battle Intel v4.11w — Compare Workspace Refinement

Desktop-only Compare tab refinement built from v4.11v, with the protected v4.11u dashboard visuals left untouched.

## Guardrails

- Dashboard visuals remain locked/protected.
- `mobile.css` untouched.
- Changes are scoped to Compare tab rendering, Compare tab desktop CSS, and the DIFF+ modal bridge fallback.

## Changes

- Tightened Compare hero copy and added category lead badges.
- Changed awkward negative lead headlines into clean absolute lead wording.
- Removed the old full-width DIFF+ strip from Compare deep-diff tables.
- Added compact DIFF+ pills in each Compare detail card header.
- Updated the DIFF+ modal bridge so header pills can open the nearest table details.
- Reduced default deep-diff rows so the page feels less wall-like while DIFF+ keeps the full details available.
- Fixed the Compare footer label path so `Defense & Survival` does not render as `&AMP;`.
- Lightly polished trend wording and findings labels.
- Added compare-scoped winning-column emphasis for Run A / Run B in deep diff tables.

## Tests run

```powershell
node .\tests\current-v4.11w-compare-workspace-refinement.test.mjs
node .\tests\ui-render-layer.test.mjs
node .\tests\native-import-placement.test.mjs
node .\tests\ui-action-foundation.test.mjs
node .\tests\pipeline-foundation.test.mjs
node .\tests\report-parser-game-brain.test.mjs
node .\tests\history-storage-ui-utils.test.mjs
```
