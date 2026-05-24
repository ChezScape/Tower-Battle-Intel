# Tower Battle Intel v4.11a6 Command Deck Layout Cleanup

## Problem

On normal window sizes the Command Deck looked acceptable, but on a maximised desktop window the Battle Report Input console drifted into a separate centred block. That made the page feel like disconnected panels instead of one workflow.

## Fix

Desktop Command Deck now follows one logical structure:

```text
[ Command Deck shortcuts ................ ] [ Current Data ]
[ Battle Report Input ..................................... ]
```

## Desktop-only rules

- Shared width: `min(1600px, calc(100% - 32px))`
- Top row: Command Deck + Current Data
- Bottom row: Battle Report Input spans the same width
- Buttons stay deduped: top shortcuts only, input actions only below
- Mobile behaviour is not changed in this build
