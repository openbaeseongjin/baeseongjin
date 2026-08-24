# 2-6 PRODUCTION ALIGNMENT — REV8.0

> **CURRENT RUNTIME OVERRIDE — 0.68.0:** Enemy slot은 3개이며 아래 packaging-time 2-slot 기록을 대체한다.

Baseline:
`2ea921fed1fee27a4b3837ecde3281d5cd3390dd`

## 1. Packaging-time Runtime truth

Current 2-6 remains:
- `QUIET RESIDENTIAL VOID`
- subtitle `RESIDENTIAL SCALE REVEAL`
- bounds `1472×1216`
- entry `(-512,-32)`
- exit around `(544,-1152)`
- exactly 2 enemy slots:
  - `courtyard-left-guard` → `SECTOR_02_SUPPORT_POOL`
  - `courtyard-right-guard` → `SECTOR_02_LATE_POOL`
- `courtyard-void` background Story prop
- no Access Carrier
- nextAreaId `sector-02-07`
- current route labels `safe / flow / recovery`
- current cueIds include:
  - `quiet-residential-void`
  - `residential-scale`
  - `no-enemy`
  - `visual-relief`

Current exact pools:
- Support = `patrol-drone-t1 / shield-drone-t1 / support-drone-t1`
- Late = `pursuit-drone-t1 / shield-drone-t1 / support-drone-t1 / artillery-drone-t1`

## 2. `no-enemy` conflict

Current cue text and current area object list conflict.

`no-enemy` cannot be treated as actual Enemy 0 authority because the Runtime owns two stable slots.

REV8 resolves this as:

**NO ENEMY PRESSURE DURING REVEAL / DELAYED SECURITY RETURN**

Recommended Runtime cleanup:
replace or retire the stale `no-enemy` cue rather than deleting enemy slots.

Do not change Sector 02 density budget.

## 3. Current Story truth

Current Entry presentation is exactly:

`RESIDENTIAL BLOCKS`
`12–18`

No 2-6 positional System Story sequence exists in current `AuthoredStoryPresentation.js`.

Therefore REV8:
- preserves Entry
- adds no new System Toast
- authors one optional Player Bark only

## 4. Current vs REV8

| Item | Current | REV8 | Status |
|---|---|---|---|
| Bounds | 1472×1216 | 1920×832 | RE-AUTHOR |
| Body | tall zigzag climb | short lift → 90° reveal turn → long rim | MAJOR DELTA |
| Enemy slots | 2 | 2 | KEEP |
| Left Guard | Support Pool | delayed Guard A | KEEP / REPOSITION |
| Right Guard | Late Pool | delayed Guard B | KEEP / REPOSITION |
| Simultaneous pressure | possible from current broad bands | representative bands separated | REDUCE |
| courtyard-void | present | preserve for reveal | KEEP |
| `no-enemy` cue | stale literal | delayed-security interpretation | CORRECT |
| Entry Story | implemented | exact copy | KEEP |
| Positional Story | none | none | KEEP |
| Player Bark | no layer | 1 authored | NOT IMPLEMENTED |
| Access | none | none | KEEP |
| Patrol | none | none | KEEP |

## 5. Relief contract

The stage is not Enemy 0.

It is quiet because:
1. Entry Lift = no pressure
2. Reveal Overlook = no pressure
3. Quiet Rim = no pressure
4. only after the player has had time to look does Guard A return
5. Guard B is a second short band after Guard A

The two guards must not create the 2-5-style sustained escalation.

## 6. Story boundary

2-6 owns:
- scale of Blocks 12–18
- unnatural silence
- lived-in residential absence

2-6 does NOT own:
- Shelter Capacity Full
- Evacuation Transfer Suspended
- Remain in Designated Area

Those are 2-7 Story authority.

## 7. Bark

Approved:
`…이렇게 많은데, 너무 조용해.`

Current presentation directory still contains only:
- AuthoredStoryPresentation.js
- PlayerRespawnPresentation.js
- WorldUnlockPresentation.js

No dedicated Player Bark layer.

Status:
**NOT IMPLEMENTED — PLAYER BARK LAYER**

Do not convert to System Toast.

## 8. Runtime implementation (2026-08-19)

`Sector02AreaCatalog.js` area06 rewritten in full against REV8.0: bounds 1920x832, entry
(-816,-32), SHORT UP -> HARD 90 DEGREE TURN -> LONG RIGHT (SHORT RECOVERY LIFT -> SAFE REVEAL
TURN -> QUIET UPPER RIM -> GAP A/GUARD A -> GAP B/GUARD B -> EXIT), replacing the old tall zigzag
climb. G1-G4 are real labeled `grapple-landmark` targets (unlike 2-4/2-5, this package's
`grappleTargets[]` corresponds 1:1 to labeled visible landmark objects). All authored Rope
relations kept intentionally easy (<=273px). Both delayed-security guards preserved on their
stable slot IDs/pools, activation bands approximated around each guard's own authored position
per the doc's own "Suggested band" language, verified non-overlapping (left x:[192,512], right
x:[528,880]). `courtyard-void` kept as a non-collision background Story prop
(`gameplayCollision:false`). Stale `no-enemy` cue retired and replaced with `delayed-security`
without touching either enemy slot, per the doc's explicit correction. `npm run check` (2-6
clean)/`npm test` (7 scenario groups) pass.

Player Bark layer: still absent - approved Bark remains NOT IMPLEMENTED.
