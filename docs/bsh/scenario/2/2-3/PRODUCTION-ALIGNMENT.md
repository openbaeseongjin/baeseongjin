# 2-3 PRODUCTION ALIGNMENT — REV8.0

Baseline:
`c042f614f07ff62184aca3d0c128c89f51f25708`

## 1. Current Runtime truth

Current code is authoritative over stale 2-3 documentation.

Verified current:
- bounds 960×768
- stable `specialization-node`
- generic `interact-choice`
- second generic Augment source
- exactly 1 `node-approach-guard`
- no area03 authored landmarks
- next area 2-4
- default Camera contract
- Story entry + node detection implemented

Stale statements to retire:
- `Enemy NONE`
- current G1/G2 Runtime landmarks
- current Foundation/Specialization tier
- Foundation-dependent offer

## 2. Current vs REV8

| Item | Current | REV8 | Status |
|---|---|---|---|
| Bounds | 960×768 | 1344×576 | RE-AUTHOR |
| Movement | compact vertical stack | horizontal side-loaded hall | MAJOR DELTA |
| Enemy | 1 approach slot | preserve 1 | KEEP |
| Enemy death gate | none | none | KEEP |
| Node ID | specialization-node | preserve stable ID | KEEP |
| Offer | generic second 3-card | preserve | VERIFIED |
| Safe chooser | not strongly isolated by topology | Service Core LOS threshold | STRENGTHEN |
| Post-choice | old docs imply calibration | none | DESIGN LOCK |
| Story | implemented | exact copy/reposition | KEEP |
| Camera | none | none | KEEP |
| Bark layer | absent | 1 Bark designed | NOT IMPLEMENTED |

## 3. 1-4 cross-audit

Current actual 1-4 Runtime also has:
- Node
- one enemy slot
- safe Node Deck
- calibration dummy
- post-choice calibration band
- custom camera zones

Therefore 2-3 REV8 final deliberately uses:
- guard **before** Node
- one pre-Node Rope threshold
- horizontal Hall
- no dummy
- no post-choice Rope
- no calibration/proof
- default Camera

Meaningful overlap:
generic Augment choice only.

VERDICT:
PASS.

## 4. Story authority

Exact Runtime:
- `AUGMENT SERVICE NODE / OFFER 2 AVAILABLE`
- `GRAPPLE DEVICE / DETECTED`
- `EMERGENCY CONFIGURATION / ACTIVE`

Do not restore old Specialization wording.

## 5. Bark boundary

Current presentation directory still has:
- AuthoredStoryPresentation
- PlayerRespawnPresentation
- WorldUnlockPresentation

No dedicated Bark layer.

Approved:
`…이 장비, 여기에도 있네.`

Status:
NOT IMPLEMENTED.

Do not fake as System Toast.

## 6. Runtime implementation (2026-08-19)

`Sector02AreaCatalog.js` area03 rewritten in full against REV8.0: bounds 1344x576, entry
(-576,-32), horizontal ACTIVE APPROACH -> G1 OVER SERVICE CORE -> SAFE COMMUNAL HALL -> NODE ->
FLAT EXIT (was a 960x768 compact vertical stack). Service Core added as a real static/
non-grappleable/non-damaging LOS-blocking solid separating the approach Guard from the chooser
Hall (center-point convention: `bottom = centerY + height/2`). Stable source ID
(`specialization-node`)/objective ID (`specialization-selected`)/generic `interact-choice`/
second-generic-offer semantics all preserved unchanged - only geometry moved. Guard kept to the
single preserved slot, approach-band-only, kill optional, no death gate on Node access. No
calibration dummy, no post-choice Rope requirement, default Camera - all per REV8's explicit
forbidden list. `npm run check` (2-3 clean)/`npm test` (7 scenario groups) pass.

Player Bark layer: still absent - approved Bark remains NOT IMPLEMENTED.
