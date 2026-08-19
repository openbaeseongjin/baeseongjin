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
