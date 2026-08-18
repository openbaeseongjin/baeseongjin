# SECTOR 04-7 — RUNTIME HANDOFF

Sector-wide Persistent Pursuit contract: [`PERSISTENT-PURSUIT-RUNTIME-HANDOFF.md`](../PERSISTENT-PURSUIT-RUNTIME-HANDOFF.md).

Snapshot `1cb2d48870352dc71637cfc7ad553d655e0a94d4` / `0.32.0`.

## Recheck before coding

`config.js`, `WorldForceField.js`, `GameSimulation.js`, `EnemyPatrol.js`, `EnemyBehaviors.js`, `EnemyObject.js`, current Sector04 catalog, AREA-SPEC standard/validator.

## Stage migration

Replace legacy 4-7 with Refuge Terrace geometry. No Cutter. No per-Stage portal.

## Guards

A: `(-470,-470) ↔ (250,-470)` pingpong, speed58, wait.20.

B: `(380,-760) ↔ (-260,-760)` pingpong, speed66, wait.18.

C perimeter: `(-360,-1080),(300,-1080),(300,-1320),(-360,-1320)` loop, speed54, wait.10.

Detected Guard leaves authored Patrol and uses approved Persistent Alert behavior. Recovery/Wind do not clear Alert.

## Wind A

`tower-gap-gust`: x -480 y -1420 w1100 h820; +X; strength220; pulsed 1.10/.30/.55/.20.

## Wind B

`return-eddy`: x -420 y -1510 w940 h570; -X; strength170; pulsed 1.55/.35/.45/.25.

Use existing authoritative elapsed-time evaluation and force summation. Do not add random direction/strength or client-local phase.

## Telegraph

Use WARNING phase for foliage/ribbon/canopy/curtain/debris direction cues. Debug phase overlay is allowed for testing only.

## Guard Wind Drift

New `guard-wind-drift-v1`.

```text
AI displacement
→ same sampleWorldForce phase/direction
→ reduced Drift displacement
```

Initial factors: normal .30; Pursuit Dash .12. Do not create a Player-style enemy physics body. Do not run Patrol and Pursuit locomotion together.

## Multiplayer

Authoritative simulation owns Wind phase and final Guard position. Clients must not add a second Wind displacement. Test different Player/Guard zone membership, overlap, ACTIVE/DECAY snapshot/reconnect and no-double-drift.

## Security Override

Do not implement from this package. Wait for 4-8/full Sector04 proof placement.
