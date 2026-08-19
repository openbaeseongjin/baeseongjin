# 1-5 RUNTIME HANDOFF — REV8.0

Baseline:
`29d72baa1879850ea9e811ff6640dfce7e23c7c9`

## Before implementation

1. Fetch latest main.
2. Record actual SHA.
3. Re-read:
   - `src/game/world/areas/sector01/Sector01AreaCatalog.js`
   - `src/game/presentation/AuthoredStoryPresentation.js`
   - `src/game/augments/FoundationAugmentCatalog.js`
   - `docs/augment-v1.md`
   - `docs/enemy-density-composition.md`
4. Compare with this package.
5. If relevant Runtime changed, stop and report the conflict before blindly applying coordinates.

## Preserve

- Stage name/subtitle
- current Augment v1
- 2 enemy slot budget
- Early Pool selector behavior
- no Wind
- no moving platform
- no enemy-kill gate
- final deck → exit panel progression pattern
- verified Story text strings

## Retire

Do not reuse:
- `impulse-express`
- `relay-express`
- `shear-control`
- Foundation-specific route assumptions
- old vertical platform stack
- old A~H design history

## Geometry

Implement the AREA-SPEC horseshoe loop.

Core movement:
`short rise → long right span → controlled drop → low slot → re-launch → upper-left return`

The Controlled Drop is progression.
Do not add damage or death semantics to it.

## Grapple authoring

Dedicated visual landmarks:
- C
- G
- RE-LAUNCH may use local structural labeling if useful, but do not invent global tutorial semantics

Gameplay structural grips:
- F1
- F2
- Mid Grip
- High Capture
- Final Grip

They are real grapple targets.
They may visually read as structural joints, not glowing tutorial anchors if readability remains sufficient.

## Covers

Low Cover and Upper Cover:
- static
- solid
- non-grappleable
- non-damaging
- actual LOS blockers

Validate exact engine coordinate anchoring so both stand on their intended floors.
The planning coordinates express floor-standing intent; Runtime collision semantics are authoritative.

## Enemies

Exactly two:
- Low Guard around (+864,-160)
- Upper Guard around (+96,-832)

Use current Early Pool selection contract.

No enemy death requirement.

## Augment expression

Do not make Stage logic inspect card IDs to open geometry or route progression.

The Stage should be clearable through the common route.

Augments improve existing canonical gameplay naturally:
- reach
- reload
- release carry
- rope combat
- action correction/pressure
- slow-fall control

No card-specific route objective.

## Story

Keep exact verified text:
- `AUGMENT TEST BAY / LIVE CALIBRATION`
- `VERTICAL LOAD TEST / IN PROGRESS`
- `SECURITY RESPONSE TEST / IN PROGRESS`
- `COOLING DISTRIBUTION / SERVICE ACCESS`

Retune Story trigger geometry to the new topology.
Do not keep obsolete y-only placement if it fires at the wrong moment.

Preferred:
- entry text at Stage enter
- load/security sequence as Far Right Landing / Controlled Drop foreshadows the live Low Slot
- gate handoff at exit

No Player Bark.

## Camera

Do not reuse old `relay-spine` semantics.

Target phases:
1. launch-span
2. drop-slot
3. relaunch
4. upper-return
5. exit

Critical test:
at Far Right Landing, the lower destination must read as **intentional next progression**.

## Gameplay-only Preview rule

Implementation may contain background art,
but planning `MAP-PREVIEW.html` must remain clean:
only gameplay collision, grapple, enemy, cover, recovery, route and exit.

## Validation

Run:
- standard project checks
- scenario/spec validation
- enemy budget regression
- Story presentation regression
- Camera smoke
- base-route clear with multiple representative first-card loadouts
- recovery timing playtest
- multiplayer smoke if Stage-area changes affect seamless translation

Report:
- pre-edit SHA
- final SHA
- exact files changed
- Runtime deltas
- tests/checks
- any remaining NOT IMPLEMENTED / HYPOTHESIS

## 1-4 dependency / Seam validation

At this baseline, latest main still has the old 1-4 Runtime.

Do not finalize 1-5 entry/spawn continuity against that stale blockout.

Implementation order:
1. reconcile / implement approved 1-4 REV8.1
2. re-read its actual exit deck / gate / Seam transform
3. implement/reposition only the minimal 1-5 connector/entry needed
4. keep the approved 1-5 internal topology and movement silhouette
5. test seamless transition and camera handoff

A small connector adjustment is allowed.
Reverting 1-5 to the old vertical topology for coordinate convenience is not allowed.
