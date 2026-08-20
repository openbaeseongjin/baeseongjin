# 3-6 RUNTIME HANDOFF — REV8.0

Baseline: `d39cbb49d3d8247caf2542393994704292dd5002`

Before implementation:
1. fetch latest main and record SHA
2. re-read Sector03AreaCatalog
3. re-read Scanner runtime
4. re-read EnemyPatrol
5. re-read local Player Bark runtime
6. re-read Story Presentation
7. inspect 3-5 / 3-7 seams

## Preserve
- Scanner group `sector-03-06:scanner-premium-atrium-A`
- stable IDs C1/C2
- `sector-03-06:drone-1`
- `sector-03-06:atrium-lower-guard`
- `sector-03-06:atrium-upper-guard`
- all Story stable IDs
- Exit objective/panel/physical crossing

## Geometry
`4352×2176`

One continuous Atrium:
Lower Grand Balcony → East Event Balcony → East Sky Lobby → Central Security Crossing → West Upper Gallery → Upper Concourse.

## Patrol
REV8 authored path:
`(+960,-1512) ↔ (+240,-1600)`

Keep:
- speed 48
- wait .45
- pingpong
- target-lock cycle
- kill optional
- no Rope Cut

This is a path-orientation change only; no new behavior.

## Player Bark
Approved:
`…잠깐, 위가 어디까지야.`

Use existing local speaker-head typing bubble capability.
No System Toast.

## Story
Preserve exact current System copy:
- PREMIUM ATRIUM
- LOCAL POWER BUS / ACTIVE
- COMMERCIAL SERVICE NETWORK / ONLINE
- UPPER CONCOURSE
- ACCESS CONTROL AHEAD

Do not reinterpret `LOCAL POWER BUS` as spatial infrastructure identity.

## Exit
Final deck → panel → physical crossing → `sector-03-07`.
