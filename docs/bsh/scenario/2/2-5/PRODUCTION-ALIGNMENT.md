# 2-5 PRODUCTION ALIGNMENT — REV8.0

Baseline:
`1325320dc89d3c2da45ebd53204901d5ebbd10f1`

## Current Runtime truth

Current area:
- bounds `1280×1152`
- entry `(-480,-32)`
- exit `(464,-1088)`
- one current authored `g4`
- current route body is mostly vertical
- 3 enemy slots:
  - `drone-1`
  - `assembly-guard`
  - `upper-transit-guard`
- current Patrol path horizontal:
  `(-320,-512) ↔ (+352,-512)`
- current Gate at `(544,-576)`
- current Story Display at `(352,-704)`
- Access B on `upper-transit-guard`
- routes include `maintenance-bypass`
- nextArea `sector-02-06`

## Current Story truth

Current `AuthoredStoryPresentation` has exact 2-5 sequence:
1. `EVACUATION GROUP C / ASSEMBLY COMPLETE`
2. `TRANSFER AUTHORIZATION / PENDING`
3. `UPPER TRANSIT ACCESS / RESTRICTED`

## REV8 delta

| Item | Current | REV8 |
|---|---|---|
| Bounds | 1280×1152 | 1984×704 |
| Main body | vertical climb | long public funnel then downward service descent |
| Public Rope | mixed / old blockout | three skilled 350–380px relations |
| Patrol | horizontal | proposed vertical crossing band |
| Guard | assembly pressure | preserve, narrow Transit Neck |
| Story safety | positional | explicit full safe Forecourt |
| Gate | narrative locked | preserve, never open |
| Maintenance bypass | current concept | two-stage Commit Drop |
| Access B | current late-pool Carrier | preserve as optional side alcove |
| Recovery | two points | public + two drop recoveries with dividers |
| Exit | high | low relative to Gate; no height regain |

## Similarity correction

REV1 repeated 2-4 route-choice grammar and is HOLD.

REV2 remained too close to 2-1 diagonal ascent and was too easy.

REV8 final uses:
- single public route
- no Safe/Flow/Pressure
- vertical Patrol instead of 2-2 horizontal Patrol pressure
- irreversible two-stage descent after Gate
- no height recovery

Maximum meaningful overlap:
1.

## Patrol caveat

Changing the current Patrol path from horizontal to vertical is a geometry/configuration proposal,
not a request for new Patrol AI.

Before implementation:
verify `patrolDrone` / `EnemyPatrol` supports arbitrary two-point segments.

If vertical segments are unsupported:
do not invent AI.
Keep the same gameplay identity by using the closest supported short crossing trajectory and report the limitation.

Status:
**HYPOTHESIS UNTIL RUNTIME VALIDATED**

## Bark

Current presentation directory still has no dedicated Player Bark layer.

Approved:
`…여기까지 왔는데, 위로는 못 간 건가.`

Status:
NOT IMPLEMENTED.

Do not fake as System Toast.

## Runtime implementation (2026-08-19)

`Sector02AreaCatalog.js` area05 rewritten in full against REV8.0: bounds 1984x704, entry
(-864,-32), horizontal PUBLIC FUNNEL -> PRESSURE NECK -> SAFE GATE STORY -> SERVICE HATCH ->
DROP 1 -> MAINTENANCE SHELF -> DROP 2 -> LOW EXIT, replacing the old 1280x1152 mostly-vertical
climb. All 7 grip points are unlabeled `structural-grapple-target` grips (no visible landmark
object authored for any of them in the package). Both Commit Drop dividers implemented as real
static/non-grappleable solid walls (not visual-only) using the confirmed center-point convention
(`bottom = centerY + height/2`) - they physically prevent walking from a miss-Recovery into the
next successful phase, matching RUNTIME-HANDOFF's "Recovery is mercy, not challenge bypass".
Sealed Gate preserved with `opensInStage:false`/`narrativeLock:true`/`grappleable:false` - no
override interaction exists. `pooledSentry()` gained an optional `rules` override so the Access
Carrier B slot could carry its exact authored rule set (`kill-optional-for-stage-exit` +
`kill-required-for-access-module`, distinct from every other Sector 02 sentry's plain
`kill-optional`).

## Patrol vertical-segment verification (resolves HYPOTHESIS above)

`patrolDrone()`/the underlying `EnemyPatrol` runtime accept arbitrary two-point segments with no
axis restriction - the vertical path `(-288,-160)<->(-288,-368)` was implemented as authored with
no fallback needed. Verified via `npm test`'s full multiplayer/gameplay simulation passing with
this exact vertical patrol in place (not just a static assertion - the patrol actually steps
through simulated ticks). Status upgraded from HYPOTHESIS to VERIFIED.

`npm run check` (2-5 clean)/`npm test` (7 scenario groups) pass.

Player Bark layer: still absent - approved Bark remains NOT IMPLEMENTED.
