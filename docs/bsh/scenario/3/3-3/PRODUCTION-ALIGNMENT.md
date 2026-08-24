# 3-3 PRODUCTION ALIGNMENT — REV8.0

> **CURRENT RUNTIME OVERRIDE — 0.68.0:** Enemy slot은 4개이며 아래 2-slot cutover 기록을 대체한다.

Baseline: `d588aa041a350cab198cd187d8dccbe3b3a244dd`

Runtime cutover: canonical `AREA-SPEC.v2.json` generates `Sector03Stage03.generated.js`; the handwritten Sector 03 catalog is no longer a Runtime authority. The generated Stage uses `CENTRAL RETAIL WALK`, `3712×1952`, the approved switchback topology, 2 enemy slots, C1/C2 Scanner, physical exit panel/gate, and `sector-03-04` next.

## Pre-cutover legacy baseline
- `sector-03-03`
- `RETAIL SECURITY WALK / SCANNER + PATROL`
- bounds `1280×1184`
- one Scanner Group
- C1/C2
- cycle `1.5 / .6 / 1.1 / .3`
- fixed Patrol `drone-1`
- Patrol baseline path `-256↔+256 @ y -560`
- speed 48 / wait .45 / pingpong
- Support Pool Guard `retail-support-guard`
- exactly 2 slots
- Story copy verified
- no Access Module / Wind / Rope Cut
- Exit → 3-4

## REV8 delta
- canonical name `CENTRAL RETAIL WALK`
- bounds `3712×1952`
- direction rhythm `↗ → ↖ → ↘ → ↖ → ↗`
- alternating broken escalator circulation
- Scanner+Patrol only on descending central security dip
- Patrol path re-authored to `-384↔+352 @ y -976`
- Support Guard moved to West Upper Bridge
- final exit pressure-free

## Similarity
Maximum meaningful overlap with prior approved stages:
**1 — PASS**
