# Build Report — v4.11z52w45 History Selected Report Real Time Fallback

## Source base
Built from `Tower-Battle-Intel_v4.11z52w43_RunABStateVisibilityPolish_FullBuild.zip`.

## Issue
The History Selected Report inspector could show:

```text
Real time
-
```

for runs that still had valid numeric runtime seconds in `core.time`.

The History card already displayed Real Time correctly because it used `formatTime(core.time)`, but the Selected Report inspector only checked `core.realTime` / `core.timeText`.

## Change
`src/ui/sections/history/historyInspector.js` now uses a focused resolver:

- prefers existing display strings such as `core.realTime`, `core.real_time`, or raw parsed real-time strings
- falls back to numeric `stats.realTimeSeconds`
- falls back to numeric `core.time`
- formats numeric seconds with the shared `formatTime()` helper
- returns `-` only if no useful value exists

## Test
Added:

```text
tests/v4.11z52w45-history-selected-real-time-fallback.test.mjs
```

The test builds a selected report with `core.time = 35376` and no `core.realTime`, then verifies the inspector displays:

```text
9h 49m 36s
```

## Protected
- Dashboard/Header
- Command Deck
- History hero/cards/pager
- Stats/Edit modals
- Click Truth Probe
- Raw source/archive spine
- Mobile CSS/modules/mobileView
