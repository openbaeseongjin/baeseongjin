# 2-4 PRODUCTION ALIGNMENT — REV8.0

> **CURRENT RUNTIME OVERRIDE — 0.68.0:** Enemy slot은 3개이며 아래 packaging-time 2-slot 기록을 대체한다.

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

## Runtime implementation (2026-08-19)

`Sector02AreaCatalog.js` area04 rewritten in full against REV8.0: bounds 1984x1088, entry
(-864,-32), broad braided tenement-court topology (ENTRY -> REVEAL -> FIRST BRAID
[safe/flow/pressure] -> SWITCH -> SECOND BRAID -> MERGE -> EXIT) replacing the old 1408x1280
tall vertical stack. All 11 authored grip points (AREA-SPEC's top-level `grappleTargets[]`, none
of which have a matching visible landmark object) are unlabeled `structural-grapple-target`
grips - same pattern as 2-1/2-2's B/D/F. Route Guard preserved to its single first-braid slot
(kill optional, no kill gate). Patrol Drone contract preserved exactly (speed 48, wait 0.45,
pingpong, kill-optional, no-rope-cut, target-lock-cycle, activation-band-only), repositioned to
the approved local path `(-128,-736)<->(544,-736)`. Route labels (`safe`/`flow`/`pressure`) are
risk styles, not build-locked lanes - `routes` metadata carries them but no runtime system gates
on card selection. Exactly 2 enemy slots, no Access Carrier, no Rope Cutter/Wind. `npm run check`
(2-4 clean)/`npm test` (7 scenario groups) pass.

Player Bark layer: still absent - approved Bark remains NOT IMPLEMENTED.
