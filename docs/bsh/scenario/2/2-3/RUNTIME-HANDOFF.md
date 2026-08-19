# 2-3 RUNTIME HANDOFF — REV8.0

Baseline:
`c042f614f07ff62184aca3d0c128c89f51f25708`

## Before implementation

Fetch latest main and record SHA.

Re-read:
- `Sector02AreaCatalog.js`
- current `AuthoredStoryPresentation.js`
- current `src/game/presentation/`
- `docs/augment-v1.md`
- enemy-density authority
- landed 2-2 REV8
- current 2-4 entry seam

If current contracts changed, report conflict before coordinate edits.

## Preserve

- area ID `sector-02-03`
- stable source ID `sector-02-03:specialization-node`
- objective ID `sector-02-03:specialization-selected`
- `interact-choice`
- generic second Augment offer
- one enemy slot
- kill optional
- no Rope cut
- exact Story copy
- nextAreaId `sector-02-04`
- default Camera

## Re-author geometry

Target:
`1344×576`

Core:
`ACTIVE APPROACH → G1 OVER SERVICE CORE → SAFE COMMUNAL HALL → NODE → FLAT EXIT`

Do not recreate:
- vertical calibration stack
- post-choice Rope test
- dummy
- card-specific proof

## Service Core

Must be real gameplay geometry.

Required:
- static
- solid
- non-grappleable
- non-damaging
- LOS blocker

Guard must not maintain direct authored LOS into chooser Hall.

## Guard

Preserve the single current slot.

Use current Support Pool unless newer authority says otherwise.

Activation:
approach band only.

Node access must not require Guard death.

## Node

Stable object ID remains `specialization-node`.

Do not infer its legacy name means current Specialization tier.

Use current generic 22-card offer system.

Player-specific source consumption and roster-based outbound behavior must remain.

## Story

Entry exact:
`AUGMENT SERVICE NODE / OFFER 2 AVAILABLE`

Node exact:
`GRAPPLE DEVICE / DETECTED`
then
`EMERGENCY CONFIGURATION / ACTIVE`

Retune position bounds to safe Hall.

## Bark

Approved:
`…이 장비, 여기에도 있네.`

Current Bark layer absent.

If absent:
- keep NOT IMPLEMENTED
- no fake Toast
- no gameplay dependency

If implemented:
- local Player
- once per attempt
- after physical Node read + first detection
- world continues

## Exit

After shared source objective is ready:
short flat safe exit only.

No Calibration.

No post-choice Rope requirement.

## Validation

Run full checks plus:
- bounds 1344×576
- exactly 1 enemy slot
- Guard kill optional
- Service Core collision / LOS
- Guard cannot pressure chooser
- G1 threshold <=400
- generic offer source / roster behavior
- exact Story
- no Foundation/Specialization tier regression
- no dummy/calibration
- default Camera
- Bark test if implemented
- no fake Toast
- 2-2 seam
- 2-4 exit
- multiplayer selection / rejoin / late join
- pacing

Report:
start SHA, final SHA, changed files, tests, conflicts, HYPOTHESIS/NOT IMPLEMENTED.
