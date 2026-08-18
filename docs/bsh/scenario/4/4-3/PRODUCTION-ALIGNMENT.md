# SECTOR 04-3 — PRODUCTION ALIGNMENT

Status: **MIGRATION REQUIRED**

Latest checked main:

```text
b6e5b640f04135545341d3368a843b45c35fcedd
```

## Current source Runtime

`sector-04-03` is still:

```text
FREIGHT BYPASS
CUTTER + TRANSIT WAKE
Cutter Sentry ×1
Wind strength 360 →
cycle 1.75 / 0.70 / 1.40 / 0.30
```

## REV2.3 target

```text
SKY GARDEN TERRACES
Guard A: Perimeter Loop → Persistent Pursuit
Guard B: Trellis Sweep → Persistent Pursuit
Crosswind: same existing 360 pulsed baseline
Guard Wind Drift: new
Cutter: none
Scanner: none
```

## Verified existing facts

- `sampleWorldForce()` owns Wind phase/direction/strength/shadow evaluation.
- GameSimulation applies sampled Wind to Player velocity only.
- Enemy Patrol supports arbitrary 2D points in Runtime.
- PursuitEnemyBehavior exists.
- Current Pursuit still reacquires inside activation/acquireRange and clears target on seek reset.
- Enemy has no Player-like velocity body for World Wind.

## Gaps

```text
sector04-persistent-guard-v1 = NOT IMPLEMENTED
guard-wind-drift-v1         = NOT IMPLEMENTED
```

Guard Wind Drift must be authoritative and additive after primary AI movement.

## AREA-SPEC standard

Package is authored for REV1.1 Seamless Sector semantics:

- `sourceExit` = legacy source geometry
- `progression` = real connector authority
- runtimeModel = `seamless-sector-landmark-v1`

Generic enemy patrol validation is still start/end-oriented, so validator support for the new integrated Guard preset must be added rather than flattening the approved choreography.

Scenario Art: **HOLD** until runtime + graybox alignment.
