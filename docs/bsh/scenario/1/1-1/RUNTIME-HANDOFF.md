# 1-1 RUNTIME HANDOFF — REV8.0

Baseline: `5ae6efca720720ee34f2a8b45daf1778fd206c1f`

## Before edit
1. fetch latest main
2. record SHA
3. reread:
   - Sector01AreaCatalog.js
   - LegacyAreaSeamlessSectorRuntime.js
   - AreaDefinition.js
   - config.js
   - AuthoredStoryPresentation.js
   - authored Story tests
4. if current constants/owners differ, report before adapting

## Geometry delta
Implement the REV8 coordinates in AREA-SPEC.

Important:
- bounds 1280×1024
- Entry -416,-32
- A -128,-192
- C -96,-736
- P1/P2/P3/Overhang/Final Deck exact target positions
- two persistent non-grappleable casing walls

Use existing rectangle/surface semantics where possible.
Do not create a new collision subsystem just for casing.

## Story
Preserve exact verified facility system Story.
Do not rewrite terminal order/cadence.

Player Bark if implemented:
- `뭐야…?`
- `…일단 위로.`
local-player / nonblocking / deduped / not objective authority.

## Runtime reach
Current effective hook reach is 400px.
Do not implement geometry based on stale 440px assumptions.

## Tests
- area definition/schema checks
- Story regression
- seamless geometry/bypass
- 1-1 traversal smoke
- multiplayer story/bark dedupe if bark exists
- playtest timing

## Report
- pre-edit main SHA
- final SHA
- changed files
- exact geometry delta
- checks
- remaining NOT IMPLEMENTED
