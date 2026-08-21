# 4-5 RUNTIME HANDOFF — REV1.0

Baseline audit: `3c9f661bba58af6f7351e00754c12aef86575a12`. Start implementation from latest main, not this SHA blindly.

## Verified reusable contracts
- Base Hook Reach = 400px at package audit.
- Patrol family exists.
- `pursuit-drone-t1` exists.
- `SectorProgressState` supports access modules, collected module IDs, Sector requirement counts, and route `requiredAccessModuleCount`.

## Not implemented / do not fake
- New Residential Sector04 migration into current seamless runtime.
- Resident Security Override A/B/C concrete access-module mappings.
- Sector04 2-of-3 boundary contract in the new content.
- Player Bark trigger/runtime mapping is not guaranteed.

## Implementation order
1. Re-audit latest main and current Sector04 status.
2. Preserve approved 5376×2432 topology and Rope relations.
3. Implement geometry and recovery first.
4. Implement Patrol band, then Pursuit band; verify no unwanted overlap at S2 Bark read.
5. Map Override B to a data-driven Sector progression source only if the new Sector04 model supports it cleanly.
6. Keep 4-5 local exit independent of B.
7. Implement Direction tracks from `DIRECTION-SPEC.json`; do not duplicate them in legacy story paths.
8. If Player Bark layer is absent, leave Bark unimplemented and document the gap—never display it as system text.

## Override B required behavior
- unique collection
- local 4-5 exit does not require collection
- state survives normal progression according to Sector authority
- future 4-8 may count B toward `requiredCount=2`
- no double increment
- multiplayer/shared authority must converge if/when Sector04 supports it

## Pursuit truth
Pursuit is direct-player pursuit; do not make docs/UI imply navigation through the same architectural route as the Player.
