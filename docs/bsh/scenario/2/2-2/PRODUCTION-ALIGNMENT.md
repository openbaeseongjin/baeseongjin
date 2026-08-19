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
