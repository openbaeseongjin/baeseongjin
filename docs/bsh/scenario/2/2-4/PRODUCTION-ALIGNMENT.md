# 2-4 PRODUCTION ALIGNMENT — REV8.0

Baseline: `1325320dc89d3c2da45ebd53204901d5ebbd10f1`

## Packaging-time re-audit
`main` changed immediately before packaging due PR #700 P0 alignment.
The current 2-4 Runtime itself remains:
- 1408×1280
- 2 enemy slots
- Patrol + route-choice Guard
- safe-left / flow-centre / pressure-right / recovery
- nextAreaId sector-02-05
- exact Entry Story `RESIDENTIAL STACK / MULTI-ROUTE HOUSING`

The merge reinforces current **generic Augment** terminology.
Old Foundation/Specialization route language is stale.

## Current vs REV8

| Item | Current | REV8 |
|---|---|---|
| Bounds | 1408×1280 | 1984×1088 |
| Silhouette | tall vertical stack | broad braided tenement courts |
| Routes | left/centre/right | switchable Safe/Flow/Pressure braid |
| Enemy slots | 2 | 2 |
| Patrol | fixed patrol-drone-t1 | preserve AI, reposition path |
| Guard | Support Pool | preserve one first-half slot |
| Access | none | none |
| Story | implemented | exact copy |
| Bark | absent | one authored, NOT IMPLEMENTED |
| Growth wording | stale Specialization docs | generic Augment only |

## Critical regression rules
Do not recreate:
- three isolated parallel lanes
- vertical central spine
- card-specific route locks
- third enemy
- Access Carrier
- 2-5 evacuation Story

## Bark
Approved:
`…여기서 몇 명이나 살았던 거지.`

Current presentation directory has no dedicated Player Bark layer.
Do not fake as System Toast.
