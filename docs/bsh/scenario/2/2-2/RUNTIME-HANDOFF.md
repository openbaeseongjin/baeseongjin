# 2-2 RUNTIME HANDOFF — REV8.0

Baseline:
`447e6c11e0a007364809aaad634afcb499a2d309`

## Before edit

Fetch latest main and record SHA.

Re-read:
- Sector02AreaCatalog.js
- EnemyObject / EnemyPatrol if Patrol contract changed
- AuthoredStoryPresentation.js
- src/game/presentation/
- enemy-density-composition.md
- current Access Carrier / Transit lock owner
- landed 2-1 REV8.1

## Preserve Patrol behavior

Do not rewrite AI.

Keep:
- `patrol-drone-t1`
- speed 48
- wait 0.45
- pingpong
- kill optional
- no Rope cut
- target-lock-cycle
- activation-band-only

Spatially retune its local Y/path staging to the approved bridge only if needed by the geometry.

## Geometry

Target:
`1792×896`

Main:
`SAFE OBSERVE → COVER A → MOVING LOS → COVER B → DISENGAGE → SHORT RISE → EXIT`

Critical:
Player must move along the same long transit axis the Drone patrols.

## Observe-first rule

Player must be able to see actual Drone translation before unavoidable first pressure.

Do not force a full cycle.

If default Camera does not show enough:
1. move Observation Deck / initial Drone relation
2. retest
3. only then consider custom Camera

## Covers

Cover A/B:
- static solid
- non-grappleable
- non-damaging
- LOS blocker

They provide a safe option,
not mandatory waiting.

## Access Module A

Preserve second current enemy slot and:
`accessModuleId: sector-02:access-module:a`

Do not add escorts.

Move it into small post-lesson Access Alcove.

Activation:
after branch commit.

Do not allow simultaneous crossfire with first Patrol lesson.

Preserve current module marker and shared-progress behavior.

## Story

Exact:
`PATROL WALKWAY / SECURITY STILL ACTIVE`

Observation:
`SECURITY PATROL / ACTIVE`
then
`RESIDENTIAL TRANSIT / RESTRICTED`

Retune positional bounds to new Observation zone.

## Player Bark

Approved:
`…사람은 없는데, 순찰은 그대로네.`

Trigger:
physical Patrol movement visible first,
then full Security status,
then Bark.

Current Bark layer absent.

If absent:
- leave NOT IMPLEMENTED
- do not fake as Toast
- no gameplay dependency

## Exit

Preserve:
nextAreaId `sector-02-03`
and current reach→panel objective chain.

Exit Deck fully safe.

## Validation

Run full checks plus:
- bounds 1792×896
- 2 enemy slots
- Patrol exact behavior
- observe-before-pressure
- Wait / Flow / Kill paths
- local recovery
- Cover LOS behavior
- no Patrol/Carrier crossfire
- Access A collection + marker
- 3-of-3 Transit progression unaffected
- Story exact copy/order
- Bark test if implemented
- no fake Bark Toast
- 2-1→2-2 seam
- 2-2→2-3 exit
- multiplayer/shared progress
- pacing

Report SHA/files/tests/HYPOTHESIS/NOT IMPLEMENTED.
