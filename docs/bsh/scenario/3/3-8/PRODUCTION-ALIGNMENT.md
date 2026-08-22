# 3-8 PRODUCTION ALIGNMENT — REV8.0

Baseline: `cb4f690ac180a04868322e9c4cfe1384897c348b`

Runtime cutover: canonical `AREA-SPEC.v2.json` generates `Sector03Stage08.generated.js`; the generated Stage uses `UPPER EXCHANGE GATE`, `4608×2176`, explicit Preview platform/Anchor topology, 5 enemy slots, C1/C2/C3/C4 Scanner, the existing exit-panel objective interaction, `nextAreaId: null`, and `content-boundary`. Sector 04 remains disconnected.

## Pre-cutover legacy baseline
- `sector-03-08`
- 5 enemy slots
- one Scanner group controlling C1/C2/C3/C4
- no Access A/B/C completion requirement
- no required kill
- `nextAreaId: null`
- `completionMode: content-boundary`

## Direction Runtime VERIFIED
Direction Runtime v1 exists on main.
3-8 itself is not migrated yet.

## Planning delta
- bounds `4608×2176`
- repeated free-weave lattice
- true-safe Incident Transfer Control records bay
- Player-facing Access Tier story removed
- final juxtaposition:
  - LEFT `GROUP C / TRANSFER SUSPENDED`
  - RIGHT `PRIORITY ROUTE / ACTIVE`
- Bark:
  `…C는 멈췄는데, 우선 통로는 열려 있었네.`

## Critical
Do not infer causality.
Do not connect directly to Sector04.
