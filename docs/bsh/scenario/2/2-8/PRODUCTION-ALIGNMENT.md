# 2-8 PRODUCTION ALIGNMENT — REV8.0

Baseline: `4fce8a27bc6cb7b4141735dec6c8e56cb9f88b5b`

## Current Runtime truth
- current bounds `1536×1536`
- exactly 4 slots:
  - `drone-1` fixed Patrol T1
  - `drone-2` fixed Patrol T1
  - `transfer-lower-guard` Late Pool
  - `transfer-upper-guard` Late Pool
- Sector-end Checkpoint
- `nextAreaId: null`
- `completionMode: content-boundary`
- Transfer Control objective: `sector-02-08:transfer-control-read`
- current gate directly requires Transfer Control read
- no direct A/B/C Access Module requirement on current Area gate

## Story truth
Entry:
`EVACUATION PLATFORM / GROUP C TRANSFER SUSPENDED`

Transfer Control:
A COMPLETE → B COMPLETE → C SUSPENDED → PRIORITY ACCESS ACTIVE.

## Seamless Access override — 2026-08-19

- 0.46.0 `seamless-sector-runtime-v9`에서 compiled 2-8→3-1 transit device는 Sector 02의 2-2·2-5·2-7 Carrier 3/3과 source objective를 요구한다. 같은 collision/visual 가로 segment가 source bounds 양끝에서 기본 Grapple budget 600px만큼 연장돼 중앙과 좌우 우회를 막고, 3/3 뒤 barrier만 제거한다. 미수집 Carrier는 거리순 최대 3개를 화면 밖 edge arrow 또는 화면 안 diamond로 안내한다. 아래 legacy `nextAreaId:null` 기록은 standalone authoring snapshot이며 기본 seamless Runtime의 전환 권위를 대체하지 않는다.

## REV8 delta
| Item | Current | REV8 |
|---|---|---|
| Bounds | 1536×1536 | 2304×1408 |
| Topology | giant atrium / old route set | Arrival Finger → Hub → Dead Lip → Ring → Upper Arm |
| Patrol A | horizontal band | diagonal Arrival pressure |
| Lower Guard | current broad location | Hub/Lip phase |
| Patrol B | horizontal upper band | central crossing during Ring relaunch |
| Upper Guard | current upper location | final Upper Arm phase |
| Relief | existing band separation | explicit fully safe Transfer Ring |
| Finale Story | existing Transfer Control | preserve on fully safe Final Apron |
| Multi-Route | old Safe/Flow/Build language | retired |
| Access 3-of-3 | planning assumption | documented Runtime gap; not invented |

REV1 was rejected because it was too linear for the Sector Finale.
REV2 adds layered terminal architecture without adding new mechanics/enemies.

## Runtime implementation (2026-08-19)

`Sector02AreaCatalog.js` area08 rewritten in full against REV8.0: bounds 2304x1408, ARRIVAL
FINGER -> CENTRAL HUB -> DEAD BOARDING LIP -> CONTROLLED DROP -> SAFE SUSPENDED RING -> RELAUNCH
-> UPPER DEPARTURE ARM -> FINAL CONTROL, replacing the old 1536x1536 giant atrium. All 9 grips
are unlabeled `structural-grapple-target` grips. Ring Divider implemented as a real static/
non-grappleable solid wall (center-point convention) so a missed Controlled Drop's Recovery
cannot walk directly onto the successful Ring route. Both Patrol contracts preserved exactly,
phase-isolated (`tests/sector02AreaCatalog.mjs` asserts Patrol A/B activation bands never
vertically overlap - Patrol A's band was tightened to stay above y=-608 specifically to satisfy
this, since a naive full-path-plus-margin box would have overlapped Patrol B's Ring-relaunch
band). Both Late Pool guards kept phase-scoped (Hub->Dead Lip only / Upper Arm final only), kill
optional, no crossfire. Sector-end Checkpoint and `nextAreaId: null`/`completionMode:
"content-boundary"` preserved exactly - no Sector 03 transition invented here. No mandatory
Access-module 3-of-3 gate added to the local Area gate (matches the package's own explicit
`accessModuleRuntimeGap` disclosure - global Sector 02 3-of-3 progression is a separate system
this local gate does not depend on).

AREA-SPEC.json's `objectives[]` included the Sector-end checkpoint with an invalid `type:
"checkpoint"` (not in the validator's `OBJECTIVE_TYPES`) - removed as a mechanical schema fix; the
actual Runtime checkpoint mechanism is the area's separate `checkpoints` field plus a
`kind:"checkpoint"` world object, matching how 1-8's Sector-end checkpoint already works. This is
the eighth and final Sector 02 Stage - Sector 02 REV8/REV8.1 implementation is now complete
end-to-end (2-1 through 2-8). `npm run check` (2-8 clean)/`npm test` (7 scenario groups) pass.

Player Bark layer: still absent - approved Bark remains NOT IMPLEMENTED.
