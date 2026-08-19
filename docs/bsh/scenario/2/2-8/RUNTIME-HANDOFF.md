# 2-8 RUNTIME HANDOFF — REV8.0

Baseline: `4fce8a27bc6cb7b4141735dec6c8e56cb9f88b5b`

## Before implementation
Fetch latest main. Re-read Sector02AreaCatalog, EnemyPatrol, enemy-density, Access module progression,
AuthoredStoryPresentation, current presentation directory, landed 2-7 and content-boundary behavior.

## Approved topology
`2304×1408`

`ARRIVAL FINGER → CENTRAL HUB → DEAD BOARDING LIP → CONTROLLED DROP → SAFE SUSPENDED RING → RELAUNCH → UPPER DEPARTURE ARM → FINAL CONTROL`

One mandatory route. No Safe/Flow/Build lanes.

## Enemy slots
Exactly 4.

### drone-1
Path: `(-704,-272) ↔ (-160,-528)`
Preserve T1 / 48 / .45 / pingpong / kill optional / no Rope Cut.

### transfer-lower-guard
Late Pool. Hub→Dead Lip only. Kill optional.

### drone-2
Path: `(+320,-784) ↔ (-320,-784)`
Preserve same Patrol contract. Only after Ring relaunch.

### transfer-upper-guard
Late Pool. Upper Arm final pressure. Kill optional.

No representative crossfire between phases.

## Transfer Ring
Fully safe.
Drop miss goes to Recovery with solid Ring Divider.
Recovery cannot walk directly to Ring success route.

## Rope targets
G1→G2 ~358
G2→G3 ~358
Ring edge→G6 ~385
G6→G7 ~375
G7→G8 ~358
G8→G9 ~358
No >400 mandatory relation.

## Final Story
Final Control Apron pressure = 0.

Exact:
A COMPLETE
→ B COMPLETE
→ C SUSPENDED
→ PRIORITY ACCESS ACTIVE

Bark:
`…왜 C만 멈춘 거지?`

If Bark layer absent: NOT IMPLEMENTED; no fake Toast.

## Access Runtime gap
Do NOT add a mandatory 3-of-3 A/B/C gate unless a newer Runtime authority has landed it.

Current 2-8 Area gate requires only Transfer Control read.

Geometry must remain Base-Rope reachable regardless of Access collection.

## Content boundary
Preserve:
- Sector-end Checkpoint
- `nextAreaId: null`
- content-boundary completion

Do not invent Sector 03 transition here.

## Validation
Full project checks plus 4 slots, phase isolation, Ring safety, Divider,
critical Rope distances, exact Story, checkpoint/content boundary,
no invented Access gate, similarity, multiplayer/respawn/pacing.
