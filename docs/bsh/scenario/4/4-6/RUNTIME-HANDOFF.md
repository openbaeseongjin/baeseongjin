# SECTOR 04-6 — RUNTIME IMPLEMENTATION HANDOFF

Sector-wide Persistent Pursuit contract: [`PERSISTENT-PURSUIT-RUNTIME-HANDOFF.md`](../PERSISTENT-PURSUIT-RUNTIME-HANDOFF.md).

Snapshot `90208deb1e1946538dd76c22e280fcf7677106bd`. Developer owns architecture; this file owns behavior.

## Recheck
`config.js`, `EnemyObject.js`, `ProjectileClientCollision.js`, `EnemyPatrol.js`, `EnemyBehaviors.js`, enemy mobility policy, `GameSimulation.js`, `Sector04AreaCatalog.js`, `FoundationAugmentCatalog.js`, AREA-SPEC standard/validator.

## Runtime target
- Replace legacy 4-6 source with Private Skybridge blockout.
- Do not reintroduce Stage portal/gate progression.
- Guard A authored Pingpong `(-440,-430)↔(320,-430)`, then Persistent Alert on detect.
- Cutter at `(650,-825)`, reuse Sentry FSM + `cutter-fire`, remain fixed.
- Guard B authored Pingpong `(-260,-1350)↔(520,-1350)`, then Persistent Alert.
- Max hostiles 3.
- Cutter Read does not reset Alert or force a kill.
- R2/R3 must catch representative Rope-cut falls.
- Use current attack FSM/config at implementation time; do not create a Stage-local copied timing constant.
- Fast Recover affects normal reload only unless the Augment contract is separately changed.

## Multiplayer tests
- Cutter cutting Player A Rope must not detach Player B.
- One Player may kill Cutter while another traverses.
- Persistent Guard retarget follows Sector-wide contract.
- party wipe/reset follows existing Sector semantics.

## Wide city
Do not author a 4,800px Stage-local rectangle. Stage-local Area remains geometry source; city wings/world placement are compiler composition.
