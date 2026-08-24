# 3-4 PRODUCTION ALIGNMENT — REV8.0

> **CURRENT RUNTIME OVERRIDE — 0.68.0:** Enemy slot은 4개이며 아래 3-slot cutover 기록을 대체한다.

Baseline: `d588aa041a350cab198cd187d8dccbe3b3a244dd`

Runtime cutover: canonical `AREA-SPEC.v2.json` generates `Sector03Stage04.generated.js`; the generated Stage uses `RETAIL SERVICE SPINE`, `3584×1792`, the approved double-skin blocker/topology, 3 enemy slots, C1/C2 Scanner, physical exit panel/gate, and `sector-03-05` next.

## Pre-cutover legacy baseline
- `sector-03-04`
- `SERVICE ARCADE / PUBLIC VS SERVICE`
- bounds `1280×1216`
- Scanner Group `scanner-service-arcade-public`, C1/C2
- Patrol `drone-1`
- Support Pool `service-route-guard`
- Late Pool `upper-arcade-guard`
- exactly 3 slots
- Story split/public/service/upper-node implemented
- no Access Module / Wind / Rope Cut
- Exit → 3-5

## REV8 delta
- canonical name `RETAIL SERVICE SPINE`
- bounds `3584×1792`
- split becomes a true architectural double-skin
- Public Front: wider/fewer inputs + Scanner/Patrol
- Service Back: narrower/more inputs + Support Guard
- solid separation prevents casual mid-route switching
- safe high merge
- Late Guard after merge only

## Story
Legacy Runtime copy is preserved as the semantic KEEP baseline.
Service Bark `…이쪽은 열리네.` remains NOT IMPLEMENTED unless Player Bark layer exists.
