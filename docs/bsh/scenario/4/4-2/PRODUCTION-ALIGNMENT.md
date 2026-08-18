# SECTOR 04-2 — PRODUCTION ALIGNMENT

Status: **MIGRATION REQUIRED**

Latest checked `main`:

```text
eaf05cd4b771879504f76d078ee728c48be5feb6
```

## Current Runtime

Current `Sector04AreaCatalog.js` still defines:

```text
id        sector-04-02
name      CUTTER LINE
subtitle  FIRST ROPE INTERRUPTION
bounds    1280 × 1312
enemy     1 × sentry-t1
rules     cutter-fire / target-lock-cycle / activation-band-only
anchors   A0(-352,-128)
          C1(32,-448)
          A3(64,-992)
```

## REV2.3 target

```text
name      RESIDENTIAL COURTYARD
bounds    1440 × 1400
enemy     Guard A + Guard B
A patrol  3-point diagonal pingpong
B patrol  3-point vertical/diagonal pingpong
after detect
          persistent pursuit
stacking  Guard A may follow into Guard B band
Cutter    NONE
Wind      NONE
Scanner   NONE
```

Therefore:

```text
README / AREA-SPEC / MAP-PREVIEW
= DESIGN LOCKED

Runtime
= NOT ALIGNED

Persistent Pursuit Alert Latch
= NOT IMPLEMENTED
```

## Current code facts rechecked at latest main

- Base Rope Reach = 400.
- Base Reload = 1.0 sec.
- Enemy attack range = 760.
- `EnemyPatrol` supports arbitrary 2D multi-point `pingpong` and `loop`.
- Patrol points are clamped to activation.
- `PursuitEnemyBehavior` exists.
- Pursuit target selection is still constrained by activation and acquire range.
- Pursuit resets target after recover back to seek.
- Therefore alert persistence and cross-band chase are not implemented yet.

## Migration blockers

1. Persistent alert latch.
2. State-aware detection bounds vs wider pursuit region.
3. Guard A cross-band pursuit into Guard B area.
4. Rewrite 4-2 geometry and enemy composition.
5. Remove legacy Cutter from 4-2.
6. Update Sector04 catalog tests.
7. Dynamic Rope + Pursuit stacking graybox validation.
8. 4-3 migration before final continuity.

Scenario Art remains HOLD until Runtime and graybox alignment.
