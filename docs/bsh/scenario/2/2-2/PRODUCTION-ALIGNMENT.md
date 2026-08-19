# 2-2 PRODUCTION ALIGNMENT — REV8.0

Baseline:
`447e6c11e0a007364809aaad634afcb499a2d309`

## Current Runtime vs REV8

| Item | Current | REV8 | Status |
|---|---|---|---|
| Bounds | 1280×1088 | 1792×896 | RE-AUTHOR |
| Player route | vertical-dominant climb | long horizontal Patrol bridge | MAJOR DELTA |
| Patrol Drone | explicit patrol-drone-t1 | preserve | VERIFIED |
| Patrol X | -320↔+320 | preserve | KEEP |
| Speed | 48 | preserve | KEEP |
| Wait | 0.45 | preserve | KEEP |
| Mode | pingpong | preserve | KEEP |
| Kill optional | yes | yes | KEEP |
| Rope cut | no | no | KEEP |
| Slot count | 2 | 2 | KEEP |
| Access Carrier A | upper-walkway-guard | preserve, separate branch | KEEP |
| Entry Story | implemented | preserve exact | VERIFIED |
| Security status | implemented | preserve/reposition | VERIFIED |
| Camera zones | none | default first | KEEP |
| Bark layer | absent | 1 Bark authored | NOT IMPLEMENTED |

## Runtime Story

Verified exact copy:
- `PATROL WALKWAY / SECURITY STILL ACTIVE`
- `SECURITY PATROL / ACTIVE`
- `RESIDENTIAL TRANSIT / RESTRICTED`

## Access authority

Current second slot owns:
`sector-02:access-module:a`

Sector 02 Carrier stages:
2-2 / 2-5 / 2-7

Global Transit:
3-of-3.

REV8 moves the spatial encounter but does not invent a new slot or module.

## Main correction

Current Patrol moves horizontally,
but Player route is too vertical.

REV8 makes the Player travel horizontally through the moving LOS.

## P4 drift

Old documentation referenced a P4 Relief Deck that current Runtime lacks.

REV8 does not restore old P4 by name.

Instead it authors:
- explicit Disengage
- Upper Landing
- Access branch
- Exit Deck

from the approved REV8 topology.

## Bark status

Current `src/game/presentation/` contains:
- AuthoredStoryPresentation
- PlayerRespawnPresentation
- WorldUnlockPresentation

No dedicated Bark layer.

Approved:
`…사람은 없는데, 순찰은 그대로네.`

Do not fake as System Toast.

## Runtime implementation (2026-08-19)

`Sector02AreaCatalog.js` area02 rewritten in full against REV8.0: bounds 1792x896, entry
(-768,-32), horizontal SAFE OBSERVE -> COVER A -> MOVING LOS -> COVER B -> DISENGAGE -> SHORT
RISE -> EXIT route replacing the old vertical climb. `patrolDrone()` contract preserved exactly
(speed 48, wait 0.45, pingpong, kill-optional, no-rope-cut, target-lock-cycle,
activation-band-only) - only its local Y/path retuned to the new -320<->320 horizontal band.
Access Carrier A (`upper-walkway-guard`) kept on `sector-02:access-module:a` and moved into the
small post-lesson Access Alcove (256,-800); its activation box was narrowed from an initially
authored 384x320 to 384x192 because the taller box spilled 64px past the area's own top bound
(`encounter-activation-bounds` invariant in `tests/seamlessSectorGameSimulation.mjs`) - same
disclosed-narrowing pattern used for 1-7/1-8 in Sector 01, position unchanged. Covers A/B are
static/non-grappleable/non-damaging LOS blockers placed with the confirmed center-point
convention (`bottom = centerY + height/2`). G3 and the Access Anchor are unlabeled
`structural-grapple-target` grips (same pattern as 2-1's B/D/F). Security Status sequence text
preserved exactly. `npm run check` (2-2 clean)/`npm test` (7 scenario groups) pass.

Player Bark layer: still absent - approved Bark remains NOT IMPLEMENTED.
