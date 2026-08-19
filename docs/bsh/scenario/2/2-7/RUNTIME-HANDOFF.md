# 2-7 RUNTIME HANDOFF — REV8.0

Baseline:
`c8b7a23276574cc4965da8f94fb98022ac967d53`

## Approved topology

Bounds:
`1792×1280`

Body:
`DIAGONAL SHELTER BUTTRESS → SAFE SHELTER CORE → VERTICAL TRANSFER MAST`

No Stage-scale Safe/Flow/Pressure routes.

One optional Access C alcove only.

## Patrol A

Stable slot `drone-1`.
Preserve `patrol-drone-t1`, 48, 0.45, pingpong, kill optional, no Rope Cut.

REV8 path:
`(-512,-304) ↔ (+32,-560)`

This uses current arbitrary 2D Patrol support.
Activation ends before Story Core.

## Patrol B

Stable slot `drone-2`.
Preserve same Patrol contract.

REV8 path:
`(+32,-992) ↔ (+448,-992)`

Player climbs Mast while Patrol crosses horizontally.

No Patrol A / Patrol B overlap.

## Story Core

Completely safe.

Exact:
`SHELTER CAPACITY / FULL`
→ `EVACUATION TRANSFER / SUSPENDED`
→ `REMAIN IN / DESIGNATED AREA`

## Player Bark

Approved:
`…대피소가 꽉 찼는데, 여기 남으라고?`

If Bark layer remains absent:
NOT IMPLEMENTED; no fake Toast.

## Access C

Stable Carrier:
`shelter-centre-guard`

Preserve:
- Late Pool
- `sector-02:access-module:c`
- edge-arrow → diamond marker
- no escort
- no fourth enemy

Local exit remains possible without C.
Sector 02 global 3-of-3 still requires C.

## Rope distances

- Entry→G1 ~283px
- G1→G2 ~365px
- G2→G3 ~365px
- StoryEdge→G4 ~143px
- G4→G5 ~385px
- G5→G6 ~358px
- G6→Exit target ~322px

No mandatory >400px.

## 2-8 boundary

Do not reveal:
- Group A result
- Group B result
- Priority Access
- final Group C comparison

## Validation

Full tests plus geometry / 3 slots / patrol paths / no-crossfire /
Story safety / Access C / critical distances /
generic Augment wording / no Multi-Route regression /
2-6 seam / 2-8 handoff / multiplayer / respawn / pacing.
