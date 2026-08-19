# 1-2 RUNTIME HANDOFF — REV8.0

Baseline: `5ae6efca720720ee34f2a8b45daf1778fd206c1f`

## First
Fetch latest main and record SHA.

Re-read:
- `src/game/world/areas/sector01/Sector01AreaCatalog.js`
- `src/game/world/sectors/LegacyAreaSeamlessSectorRuntime.js`
- `src/game/world/areas/AreaDefinition.js`
- `src/game/config.js`
- `src/game/presentation/AuthoredStoryPresentation.js`
- `tests/authoredStoryPresentation.mjs`

If main changed, re-audit before edits.

## Implement geometry

Use AREA-SPEC as target:
- bounds 1664×960
- Entry +448,-32
- A +224,-192
- C -320,-560
- P1 / R2 / P2 / P3
- Dead Lift collision
- Counterweight collision
- Final Deck
- persistent casing

Align background Lift visual to physical collision.
Do not leave a Story-only Lift floating away from collision.

## Airborne Re-Attach

Current Hook Reach = 400px.

The important validation is dynamic:
- A→C must NOT be statically reachable.
- A Swing/Release must create a broad enough C attach window.
- C must be visible before Release.
- no blind leap
- no one-frame requirement

Tune geometry first.
Do not solve a bad window with tutorial spam.

## Story preservation

Preserve:
- `LIFT CONTROL / OFFLINE`
- `AUTOMATIC LIFT SERVICE / SUSPENDED · MANUAL ACCESS ONLY`
- `POWER REDUCTION / STAGE 2`
- `SECURITY ACCESS / CHECK`

Retune position thresholds if new bounds require it,
but do not change meaning/order/cadence without explicit planning review.

Player Bark:
`…리프트도?`
only if a clean local bark owner exists/is implemented.

## Do not add
- B / D anchors
- moving Lift
- enemies
- wind
- laser
- augment
- tutorial popup
- success Bark

## Validation
- full check/test suite
- authored Story tests
- area/geometry validators
- seamless connector/bypass smoke
- 400px Hook Reach traversal
- first-clear/mastered pacing
- multiplayer/replay Story dedupe

Report exact remaining NOT IMPLEMENTED items.
