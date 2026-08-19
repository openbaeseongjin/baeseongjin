# 1-1 RUNTIME HANDOFF — REV7.0

## Baseline
`5ae6efca720720ee34f2a8b45daf1778fd206c1f`

## Goal
Implement only the delta needed to make current Runtime match the approved 1-1 REV7 plan.

## Audit before edit
Re-read latest:
- `src/game/world/areas/sector01/Sector01AreaCatalog.js`
- `src/game/presentation/AuthoredStoryPresentation.js`
- `tests/authoredStoryPresentation.mjs`
- `src/game/world/sectors/LegacyAreaSeamlessSectorRuntime.js`
- current surface helper/validator contracts
- current player presentation owners

If `main` changed after the package baseline, record the new SHA and re-audit before applying.

## Required geometry delta
1. P3 target:
   - x 224
   - y -800
   - width 192
   - height 16

2. Add persistent Shaft Shell:
   - left center (-464,-480), 32×960
   - right center (+464,-480), 32×960
   - solid, non-one-way, non-grappleable
   - must survive Seamless import
   - must read as visible Service Riser casing

3. Preserve:
   - A (-96,-192)
   - C (-64,-704)
   - no B
   - Cable Overhang structural grapple opportunity
   - R1/R2/R3
   - exitBlock source geometry
   - five camera zones

## Required story delta
Preserve current verified system Story exactly.

Add player voice only if no equivalent owner exists:
- S0: `뭐야…?`
- S5: `…일단 위로.`

Player voice contract:
- local-player
- no objective ownership
- no gate ownership
- non-blocking
- no world pause
- no input lock
- dedupe network/retry repeats
- must not visually compete with system Toast
- exact scheduling follows DIRECTION-SPEC

Optional:
- S3 nonverbal exhale
- atmosphere lighting/audio hooks

These optional presentation items must never delay geometry/story correctness.

## Do not implement
- dedicated Anchor B
- enemy
- Wind/Laser/Cutter
- Augment
- Key/Access Module
- mandatory airborne reattach
- cutscene camera
- long dialogue
- conspiracy implication

## Suggested validation
- existing full tests
- `npm run validate:area-specs`
- direction validator if present
- authored story regression
- 1-1 traversal smoke
- seamless City Wing bypass test
- multiplayer/replay bark dedupe test if bark implemented

## Report
Return:
- baseline SHA
- implementation SHA
- files changed
- exact geometry delta
- Story presentation delta
- tests/checks
- remaining NOT IMPLEMENTED items
