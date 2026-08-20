# 3-4 RUNTIME HANDOFF — REV8.0

Baseline: `d588aa041a350cab198cd187d8dccbe3b3a244dd`

Before implementation:
1. fetch latest main
2. re-read Sector03AreaCatalog
3. re-read Scanner and EnemyPatrol behavior
4. re-read Story Presentation
5. inspect 3-3 / 3-5 seams
6. confirm current enemy pools

## Geometry
`3584×1664`

One safe split:
- Public Front left
- Facility Service right

Routes remain physically separate until High Merge.

## Public
Scanner group:
`sector-03-04:scanner-service-arcade-public`

C1/C2 only.
Cycle unchanged.

Patrol stable ID:
`sector-03-04:drone-1`

REV8 path:
`(-1376,-704) ↔ (-768,-704)`

Keep speed 48 / wait .45 / pingpong / kill optional / no Rope Cut.

## Service
Stable:
`sector-03-04:service-route-guard`

Support Pool.
No Scanner.
No Patrol.
Kill optional.

## Common
Stable:
`sector-03-04:upper-arcade-guard`

Late Pool.
Activate only after safe merge.
Never pressure either lower branch or merge.

## Story
Preserve:
`PUBLIC PROMENADE ←`
`FACILITY SERVICE →`
`PUBLIC ROUTE / AUTHORIZATION INVALID`
`FACILITY SERVICE ACCESS / MAINTENANCE CLEARANCE RECOGNIZED`
`LOCAL SERVICE ROUTE / AVAILABLE`
`COMMERCIAL SERVICE NODE / UPPER LEVEL`

Approved Bark:
`…이쪽은 열리네.`

If Bark layer absent, report NOT IMPLEMENTED; no Toast substitute.

## Multiplayer
Each Player chooses independently.
No vote, no synchronized gate, no route lock by another Player.

## Exit
final deck → panel → physical crossing → `sector-03-05`.
