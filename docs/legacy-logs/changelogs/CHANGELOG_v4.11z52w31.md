# Changelog — v4.11z52w31 Raw Source Hydration + Tournament Metadata Repair

- Re-asserts Command Deck raw archive records after the parser/History save path runs.
- Copies raw source metadata onto parsed History entries so raw source counts and tournament markers survive render/reload.
- Preserves `runType`, `sourceMarker`, and `manualMarkers` when raw archive records merge.
- Accepts legacy `rawArchive.records[]` shapes in the raw archive normaliser.
- Lets Command Deck fall back to raw-backed History entries when displaying Raw Report Sources.
- Adds History search/card support for manual run type markers such as Tournament.
- Adds a fixture/test using Andrew's 31-report batch paste: 31 reports, 31 raw sources, 5 tournament markers, no separator junk.
