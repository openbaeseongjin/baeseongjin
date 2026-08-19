# 2-7 PRODUCTION ALIGNMENT — REV8.0

Baseline:
`c8b7a23276574cc4965da8f94fb98022ac967d53`

## Packaging-time Runtime truth

Current 2-7 still owns:
- `SHELTER ACCESS`
- `EVACUATION TRANSFER SUSPENDED`
- current bounds `1408×1440`
- exactly 3 slots
- `drone-1` fixed `patrol-drone-t1`
- `drone-2` fixed `patrol-drone-t1`
- `shelter-centre-guard` from `SECTOR_02_LATE_POOL`
- Access C on `shelter-centre-guard`
- `shelter-status` Story display
- no-crossfire cue/intent
- nextArea `sector-02-08`

Current Area Runtime at packaging still shows:
`drone-2` path at y -1080 and Carrier C at `(64,-640)`.

## Patrol capability

Current `EnemyPatrol.js`:
- accepts arrays of arbitrary `{x,y}` points
- moves using a normalized 2D vector delta
- clamps to activation
- is not horizontal-only

Therefore the REV8 diagonal Patrol A and horizontal Patrol B require **no new enemy behavior**.

## Current Story truth

Entry:
`SHELTER ACCESS / EVACUATION TRANSFER SUSPENDED`

Positional Shelter status:
1. `SHELTER CAPACITY / FULL`
2. `EVACUATION TRANSFER / SUSPENDED`
3. `REMAIN IN / DESIGNATED AREA`

## Current vs REV8

| Item | Current | REV8 |
|---|---|---|
| Bounds | 1408×1440 | 1792×1280 |
| Body | tall segmented route | diagonal buttress → safe core → vertical mast |
| Route system | safe/flow/pressure/recovery | single mandatory route + local Access C alcove |
| Patrol A | horizontal | diagonal same-axis |
| Patrol B | horizontal | horizontal crossing against vertical mast |
| Story Core | mid safe intent | explicit fully safe core |
| Carrier C | central broad slot | deliberate small branch |
| Access ID | C | preserve |
| Build language | stale Foundation/Specialization in old docs | generic Augment only |

Old Stage-scale Multi-Route is retired because 2-4 owns that grammar.

Bark:
`…대피소가 꽉 찼는데, 여기 남으라고?`

Current presentation directory has no dedicated Bark layer.
Status: NOT IMPLEMENTED.
Do not fake as System Toast.
