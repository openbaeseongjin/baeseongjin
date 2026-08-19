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

## Runtime implementation (2026-08-19)

`Sector02AreaCatalog.js` area07 rewritten in full against REV8.0: DIAGONAL SHELTER BUTTRESS ->
SAFE SHELTER CORE -> VERTICAL TRANSFER MAST, replacing the old tall segmented multi-route Stage.
All 7 grips (including Access Anchor) are unlabeled `structural-grapple-target` grips - no
matching visible landmark object exists in the package for any of them. Patrol A/B contracts
preserved exactly (`patrolCapability` in the package itself confirms `EnemyPatrol` already
accepts arbitrary 2D point targets - no new AI needed), repositioned to the diagonal
`(-512,-304)<->(32,-560)` and horizontal `(32,-992)<->(448,-992)` paths with non-overlapping
activation bands. Access Carrier C moved to the small deliberate-branch alcove, kept on
`sector-02:access-module:c` with its distinct `kill-required-for-access-module` rule set (same
`pooledSentry()` `rules` override added for 2-5's Carrier B).

Bounds widened from the doc's stated 1792x1280 to 1792x1312 (32px) - the exit objective's trigger
bounds (derived from the exit point, itself derived from the exitBlock's fixed door-inset/
exit-height convention) extended 32px above the doc's stated top edge. Same disclosed-widening
pattern as 1-7/2-1. `shelter-core-wall`'s width/height were not specified anywhere in the
package (only x/y) - sized as a judgment call (32 wide, 256 tall, spanning from the Shelter Core
deck up toward the Mast approach) since its stated purpose ("architectural stop that causes
diagonal-to-vertical axis turn") only requires it to block rightward movement past the Core, not
an exact footprint. `npm run check` (2-7 clean)/`npm test` (7 scenario groups) pass.

Player Bark layer: still absent - approved Bark remains NOT IMPLEMENTED.
