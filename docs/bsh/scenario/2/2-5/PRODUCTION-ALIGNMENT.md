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
