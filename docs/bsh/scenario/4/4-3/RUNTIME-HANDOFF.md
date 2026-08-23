# 4-3 RUNTIME HANDOFF — REV1.0

Baseline: `3c9f661bba58af6f7351e00754c12aef86575a12`

## Mandatory preflight

Before code changes, re-read latest main and inspect:
- `src/game/config.js`
- current `PursuitEnemyBehavior`
- `EnemyMobility.js`
- canonical `AREA-SPEC.v2.json` and current generated-area migration contract
- current objective/interactable helpers
- current Direction Runtime/compiler/validator
- latest AREA-SPEC standard + validator registry
- latest Sector04 4-1 / 4-2 implementation status

## Stage migration

Replace legacy 4-3 identity:
`FREIGHT BYPASS / CUTTER + TRANSIT WAKE`

with:
`RESIDENTIAL SKYBRIDGE`

Bounds:
`5376×2432`

Approved causal sequence:
`BLOCK C visible → LINK OFFLINE → Relay B-03 objective → descend → reset → Utility Riser → Block C`.

Do not reintroduce the rejected reasonless `drop/reverse/relaunch` course.

## Rope

Verified at package baseline:
- hookSpeed = 1200
- hookFlightRatio = 1/3
- reach = 400px
- max approved mandatory relation = `396.02px`

Re-audit before implementation. If Runtime changes, recalculate; do not silently preserve coordinates.

## Pursuit

Exactly one `pursuit-drone-t1`.
Use existing behavior. Do not add pathfinding fiction.
Current defaults verified at baseline:
160 move / 960 acquire / 96 trigger / .25 windup / 640 dash / .2 dash / .5 recovery.

Pursuit is pressure only.
No kill gate.
No Relay unlock on enemy death.

## SERVICE RELAY B-03 — Runtime gap

The package intentionally does **not** claim that a dedicated `service-relay` canonical AREA-SPEC preset exists.

Implementation order:
1. Search latest Runtime for a compatible existing local interaction/objective primitive.
2. If compatible, reuse it and document the exact mapping.
3. If absent, implement the smallest stage-local reset objective necessary.
4. Add tests for activation, one-time completion, respawn/state behavior, and Direction event mapping.
5. Only then create/upgrade canonical `AREA-SPEC-REV1-DESIGN.json` under the current validator contract.

Do not weaken the objective to a mere hidden position trigger unless that is explicitly reviewed, because the Stage reason for descending is the manual service restoration.

## Progression

Relay B-03 is local only.
It must never increment:
- Override A
- Override B
- Override C
- Sector04 2-of-3 count

4-3 owns no Sector progression source.

## Geometry/state rule

Current AREA-SPEC standard states same-Sector geometry is static by default.
Do not implement Relay completion by creating/deleting giant route geometry unless current Runtime explicitly supports and tests that contract.
Prefer:
- dormant/active presentation state,
- objective state,
- existing traversable service connector whose continuation becomes clearly authorized/readable,
- or another verified current primitive.

## Direction

Required operational reads:
- UPPER RESIDENTIAL ACCESS / NORMAL CIRCULATION
- BLOCK C LINK / OFFLINE
- LOCAL SERVICE RELAY B-03 / MANUAL RESET REQUIRED
- RESIDENTIAL SECURITY / TRACKING
- SERVICE RELAY B-03 / RESET COMPLETE
- BLOCK C LINK / RESTORED
- SECURITY CONTACT / LOST

Every state line must correspond to actual Runtime state.

## Release block

No release until:
- new geometry is actual Runtime geometry,
- objective reason is visible before descent,
- Relay is a tested real objective,
- Pursuit ×1 verified,
- no kill gate,
- no legacy Cutter/Wake,
- Rope audit passes,
- relay does not touch 2-of-3 progression,
- browser playtest confirms objective causality is understandable.
