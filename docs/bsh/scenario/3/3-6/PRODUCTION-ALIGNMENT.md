# 3-6 PRODUCTION ALIGNMENT — REV8.0

> **CURRENT RUNTIME OVERRIDE — 0.68.0:** Enemy slot은 4개이며 아래 3-slot cutover 기록을 대체한다.

Baseline: `d39cbb49d3d8247caf2542393994704292dd5002`

Runtime cutover: canonical `AREA-SPEC.v2.json` generates `Sector03Stage06.generated.js`; the generated Stage uses `GRAND CENTRAL ATRIUM`, `4352×2336`, the approved atrium topology, 3 enemy slots, C1/C2 Scanner, physical exit panel/gate, and `sector-03-07` next.

## Pre-cutover legacy baseline
- `sector-03-06`
- `PREMIUM ATRIUM / LARGE MOVEMENT`
- current bounds `1280×1440`
- Scanner group `sector-03-06:scanner-premium-atrium-A`
- C1 + C2 same group
- Patrol `sector-03-06:drone-1`
- Support Pool `sector-03-06:atrium-lower-guard`
- Late Pool `sector-03-06:atrium-upper-guard`
- exactly 3 enemy slots
- Story: atrium-id / power-state / upper-concourse / access-control-ahead
- no Access Module / Wind / Rope Cut
- Exit → 3-7

## REV8.0 authored delta
- canonical name `GRAND CENTRAL ATRIUM`
- bounds `4352×2336`
- one continuous monumental public-commercial Atrium
- macro direction `↗ LONG → ↑ → ← LONG → ↗ LONG`
- C1 becomes lower long-flight timing
- P3 becomes true safe observation
- C2 + diagonal Patrol = central crossing peak
- final long free-flow arc is pressure-free
