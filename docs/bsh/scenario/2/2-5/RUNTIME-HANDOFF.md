# 2-5 RUNTIME HANDOFF — REV8.0

Baseline:
`1325320dc89d3c2da45ebd53204901d5ebbd10f1`

## Before implementation

Fetch latest main and record SHA.

Re-read:
- `src/game/world/areas/sector02/Sector02AreaCatalog.js`
- Patrol movement implementation / `patrolDrone` helper
- `SECTOR_02_SUPPORT_POOL`
- `SECTOR_02_LATE_POOL`
- current Access Module / 3-of-3 Transit contract
- `AuthoredStoryPresentation.js`
- current `src/game/presentation/`
- generic Augment v1/P0 docs
- landed 2-4 REV8
- current 2-6 entry/seam

If current authority changed:
report conflict before coordinate edits.

## Approved geometry

Target:
`1984×704`

Main body:
`PUBLIC FUNNEL → G1/G2/G3/G4 PRESSURE NECK → SAFE GATE STORY → SERVICE HATCH → DROP 1 → MAINTENANCE SHELF → DROP 2 → LOW EXIT`

Do not recreate:
- Safe/Flow/Pressure public routes
- route-switch system
- tall diagonal ascent
- backside hook with return
- Gate override

## Rope difficulty

Critical relations:
- G1→G2 ~380px
- G2→G3 ~358px
- G3→G4 ~353px
- Hatch→G5 nominal ~339px
- Maintenance Shelf→G6 nominal ~379px

No mandatory >390px relation.

Keep:
- skilled pressure before Story
- full safe trough at Story
- second peak from two Commit Drops

## Enemy slots

Exactly 3.

### drone-1
Preserve:
- `patrol-drone-t1`
- speed 48
- wait 0.45
- pingpong
- kill optional
- no Rope Cut
- current target-lock cycle

Proposed path:
`(-288,-160) ↔ (-288,-368)`

First verify arbitrary vertical segment support.

No new AI.

### assembly-guard
Preserve current Support Pool authority.

Move to Transit Neck phase.

Kill optional.
No kill gate.
No pressure in Story Forecourt.

### upper-transit-guard
Preserve current Late Pool +:
`accessModuleId: sector-02:access-module:b`

Move to Access B side Alcove after Drop 1.

No escort.
No fourth enemy.

Carrier kill required for Module B only.
Local Stage exit remains possible without collecting B.

## Gate

Preserve:
- narrative lock
- sealed state
- non-grappleable public blockade

The public Gate **never opens in 2-5**.

Do not implement an override interaction.

## Story

Exact Entry:
`EVACUATION WALKWAY / UPPER TRANSIT RESTRICTED`

Exact Forecourt:
`EVACUATION GROUP C / ASSEMBLY COMPLETE`
→
`TRANSFER AUTHORIZATION / PENDING`
→
`UPPER TRANSIT ACCESS / RESTRICTED`

Retune positional bounds to the new Safe Story Forecourt.

No enemy activation may reach the reading zone.

## Player Bark

Approved:
`…여기까지 왔는데, 위로는 못 간 건가.`

Trigger:
after full three-part status sequence,
Gate visible.

Current Bark layer absent.

If absent:
- keep NOT IMPLEMENTED
- no fake Toast
- no gameplay dependency

## Commit Drop recovery

Two real gameplay dividers are required.

Drop 1:
miss → right-side Recovery.
Divider prevents walking to successful Maintenance Shelf.

Drop 2:
miss → right-side Recovery.
Divider prevents walking to Low Service Exit.

Recovery is mercy,
not challenge bypass.

## Access Module B

Preserve current marker behavior:
off-screen edge arrow → on-screen diamond.

No authored Access label.

Preserve Sector 02 3-of-3 global progression.

## Camera

Default Camera first.

Forecourt:
Player + Gate + Story Display.

Drop 1:
next Catch must become readable during fall.

Drop 2:
Catch + Recovery relation readable.

Only add a custom Camera solution if geometry cannot provide readability.

## Exit

Preserve current reach→panel objective pattern.

Reposition exit to the low service side.

nextAreaId remains:
`sector-02-06`.

All enemy pressure ends before exit.

## Validation

Run full project checks plus:
- bounds 1984×704
- 3 enemy slots exactly
- Patrol behavior/value preservation
- vertical/short-crossing path support validation
- Support/Late Pool authority
- Access B identity and marker
- all critical Rope relations
- recovery divider collision
- Recovery cannot walk-skip Commit
- Gate never opens
- exact Story
- Story Forecourt safe
- Bark status
- no fake Toast
- no Group A/B / 2-7 Story leak
- generic Augment wording
- 2-4 seam
- 2-6 exit
- multiplayer / respawn
- pacing

Report exact:
start SHA / final SHA / changed files / tests / runtime limitation / HYPOTHESIS / NOT IMPLEMENTED.
