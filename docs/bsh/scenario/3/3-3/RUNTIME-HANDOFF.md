# 3-3 RUNTIME HANDOFF — REV8.0

Baseline: `d588aa041a350cab198cd187d8dccbe3b3a244dd`

Before implementation:
1. fetch latest main and record SHA
2. re-read Sector03AreaCatalog
3. re-read EnemyPatrol behavior
4. re-read AccessScanField/effective grapple eligibility
5. re-read Story Presentation
6. inspect 3-2 / 3-4 seams

## Approved topology
`3712×1792`

Direction:
`↗ → ↖ → ↘ → ↖ → ↗`

Do not collapse back into global right/up ascent.

## Scanner
Preserve group:
`sector-03-03:scanner-retail-A`

C1/C2 only.
Same cycle.
No damage/forced detach/Rope Cut.

## Patrol
Preserve stable ID:
`sector-03-03:drone-1`

REV8 path:
`(-384,-976) ↔ (+352,-976)`

Preserve:
speed 48 / wait .45 / pingpong / target-lock-cycle / kill optional / no Rope Cut.

Observation zone must remain safe enough to read the full sweep.

## Support Guard
Preserve stable ID:
`sector-03-03:retail-support-guard`

Support Pool.
West Upper only.
No overlap with Scanner or Patrol.
Kill optional.

## Story
Preserve exact:
- RETAIL SECURITY / ACTIVE
- VERTICAL SERVICE ROUTE / AUTHORIZATION INVALID
- AUTOMATED PATROL / ONLINE

No Player dialogue by default.

## Exit
Preserve final deck → exit panel → physical crossing → `sector-03-04`.

## Validation
- exact direction changes
- camera makes each next reversal legible
- all mandatory links <=400
- recovery outside sustained Patrol pressure
- no support overlap
- maximum meaningful similarity <=1
