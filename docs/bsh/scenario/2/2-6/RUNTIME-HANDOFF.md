# 2-6 RUNTIME HANDOFF — REV8.0

Baseline:
`2ea921fed1fee27a4b3837ecde3281d5cd3390dd`

## Before implementation

Fetch latest main and record SHA.

Re-read:
- `src/game/world/areas/sector02/Sector02AreaCatalog.js`
- current Support / Late pool definitions
- `docs/enemy-density-composition.md`
- `AuthoredStoryPresentation.js`
- current `src/game/presentation/`
- landed 2-5 REV8
- current 2-7 entry/seam
- generic Augment/P0 contract

If authority changed:
report conflict before coordinate edits.

## Approved topology

Bounds:
`1920×832`

Body:
`SHORT RECOVERY LIFT → SAFE REVEAL TURN → QUIET UPPER RIM → GAP A / GUARD A → GAP B / GUARD B → EXIT`

Dominant:
**SHORT UP → HARD 90° TURN → LONG RIGHT**

Do not restore:
- current tall zigzag climb
- Safe/Flow route-choice system
- Patrol
- Access Carrier
- moving hazard
- vertical Stage-length escalation

## Rope

Critical authored relations are intentionally easy:
- Entry→G1 ≈222px
- G1→G2 ≈273px
- Quiet Rim edge→G3 ≈172px
- Rim Transfer→G4 ≈172px
- G4→Exit ≈233px

This is a relief Stage.

Do not increase them into 360–390px skilled catches just to add difficulty.

If pacing feels empty:
increase environment-read walking distance or gallery spacing first.

## Enemy slots

Exactly 2.

### courtyard-left-guard
Preserve stable slot ID and Support Pool.

Target:
around `(+352,-544)`.

Activation intent:
only after Reveal / Quiet Rim.

Suggested band:
X `+160..+480`
Y `-640..-480`

Rules:
- kill optional
- no Rope Cut
- no kill gate

### courtyard-right-guard
Preserve stable slot ID and Late Pool.

Target:
around `(+704,-576)`.

Suggested band:
X `+544..+896`
Y `-672..-512`

Rules:
- kill optional
- no Rope Cut
- no kill gate

Representative pressure bands must not overlap.

If exact Runtime trigger shapes cause overlap:
shrink/shift activation before changing enemy count.

## `no-enemy` cue cleanup

Do not delete the two slots to satisfy the cue.

Prefer replacing/retiring stale cue `no-enemy` with a semantic equivalent such as:
`delayed-security`

Keep:
`visual-relief`
and residential-scale cues.

## Courtyard Void

Preserve current `courtyard-void` Story prop family.

Reposition for Reveal Overlook.

It is:
- background Story / scale
- not collision
- not a Grapple field

Do not make background balconies look like usable targets unless actually authored.

## Story

Entry exact:
`RESIDENTIAL BLOCKS / 12–18`

No additional System Story.

Approved Bark:
`…이렇게 많은데, 너무 조용해.`

Trigger only:
- Reveal Overlook reached
- multiple Blocks / Void physically visible
- before any Guard activation

If Bark layer still absent:
- keep NOT IMPLEMENTED
- no fake Toast
- no gameplay dependency

## Camera

Default camera first.

Reveal requirement:
- Player readable
- upper Rim direction readable
- courtyard Void scale readable
- several low-rise block depths readable

Do not make Player tiny.

If default framing is insufficient:
1. improve nearby/mid/far façade composition
2. adjust Overlook position
3. only then consider a light Camera zone

No cinematic pan.

## Exit / 2-7 boundary

Preserve reach→panel objective pattern.

nextAreaId:
`sector-02-07`

At Exit:
do not trigger or display:
- SHELTER ACCESS
- SHELTER CAPACITY FULL
- EVACUATION TRANSFER SUSPENDED
- REMAIN IN DESIGNATED AREA

2-7 owns those.

## Validation

Run full project checks plus:
- bounds 1920×832
- exactly 2 slots
- Support/Late pool preservation
- first half no enemy activation
- Guard A/B non-overlap representative bands
- no Patrol
- no Access
- easy Rope distance targets
- `courtyard-void` non-collision Story role
- stale `no-enemy` cue corrected without density change
- exact Entry Story
- no new positional System Toast
- Bark status / no fake Toast
- map uniqueness
- 2-5 seam
- 2-7 handoff
- multiplayer / respawn
- pacing

Report:
start SHA / final SHA / changed files / tests / conflicts / HYPOTHESIS / NOT IMPLEMENTED.
