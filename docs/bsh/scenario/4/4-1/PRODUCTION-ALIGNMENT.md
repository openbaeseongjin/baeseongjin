# SECTOR 04-1 — PRODUCTION ALIGNMENT

Status: **MIGRATION REQUIRED**

Checked against latest `main`:

```text
8afd16bc76462436490fe7c753611c2ecf36b548
```

## Current shipped/validated standalone Runtime

Current `Sector04AreaCatalog.js` and `tests/sector04AreaCatalog.mjs` still require:

```text
area id      sector-04-01
name         TRANSIT INTAKE
bounds       1600 × 1376
enemy        NONE
anchors      A1(-352,-192)
             A2(0,-352)
             A4(-64,-800)
             A5(192,-1056)
next         sector-04-02
```

Current Sector 04 catalog validates successfully in the existing test suite.

## REV2.3 target

```text
name         SKY RESIDENCE ARRIVAL
bounds       1440 × 1280
enemy        Guard A + Guard B
guard A      Perimeter Loop → Persistent Pursuit
guard B      Long Pingpong → Persistent Pursuit
anchors      A1(-220,-190)
             A2(300,-500)
             A4(-180,-790)
             A5(280,-1070)
story        Upper Residential observation only
```

Therefore:

```text
README / AREA-SPEC / MAP-PREVIEW
= DESIGN LOCKED

Runtime
= NOT ALIGNED

Persistent pursuit latch
= NOT IMPLEMENTED
```

## Important current Runtime facts

- `pursuit-drone-t1` exists.
- `PursuitEnemyBehavior` exists with seek/windup/dash/recover movement.
- `EnemyPatrol` supports multi-point `loop` and `pingpong`.
- Current normal enemy weapon logic resets to patrol when there is no target.
- Current Pursuit target selection still depends on acquire range / activation.
- Current Area validator requires patrol activation and 2+ patrol points.
- Current validator default Grapple topology budget is 600, which is **not** the physical Base Rope reach.
- Base Rope reach remains 400.

## Migration blockers

1. Hybrid `Patrol before detection → latched Pursuit after detection`.
2. State-aware detection bounds vs whole-area pursuit bounds.
3. 4-1 geometry/runtime rewrite.
4. Sector04AreaCatalog tests update.
5. Dynamic Rope graybox validation.
6. 4-2 master migration before treating the 4-1 exit as final content continuity.

## Art

Approved Gameplay Scenario Art remains **HOLD** until:

```text
Runtime migration
+
graybox traversal verification
+
camera / pursuit readability verification
```

No Scenario Art is included in this package.
