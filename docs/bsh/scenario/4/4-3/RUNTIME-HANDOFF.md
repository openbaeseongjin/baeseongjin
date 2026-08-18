# SECTOR 04-3 — RUNTIME IMPLEMENTATION HANDOFF

Status: **IMPLEMENTATION TARGET / NEW SYSTEMS REQUIRED**

Sector-wide Persistent Pursuit contract: [`PERSISTENT-PURSUIT-RUNTIME-HANDOFF.md`](../PERSISTENT-PURSUIT-RUNTIME-HANDOFF.md).

Snapshot:

```text
b6e5b640f04135545341d3368a843b45c35fcedd
```

## Required current files to recheck

```text
src/game/config.js
src/game/world/WorldForceField.js
src/game/simulation/GameSimulation.js
src/game/combat/EnemyPatrol.js
src/game/combat/EnemyBehaviors.js
src/game/combat/EnemyObject.js
src/game/combat/EnemyArchetypeCatalog.js
src/game/world/areas/sector04/Sector04AreaCatalog.js
docs/bsh/scenario/AREA-SPEC-AUTHORING-STANDARD.md
scripts/validateAreaSpecs.mjs
```

## Area

Migrate `sector-04-03` from legacy Freight Bypass to AREA-SPEC geometry.

Seamless progression target:

```text
4-4
objective-gated-connector
```

## Integrated Guard preset

New:

```text
sector04-persistent-guard-v1
```

Reuse current Enemy/Patrol/Pursuit pieces where practical. Architecture is developer-owned.

### Guard A
Before alert:
```text
loop / speed54 / wait0.18
(-390,-390)
(260,-390)
(260,-610)
(-390,-610)
```

After alert:
```text
Patrol stops
Alert latches
Pursuit continues through Shelter into Wind/B band
```

### Guard B
Before alert:
```text
pingpong / speed66 / wait0.25
(330,-780)
(80,-920)
(330,-1050)
```

B Patrol is inside Wind zone, so Drift must be visible before detection.

## Persistent Pursuit

```text
PATROL
→ DETECT
→ ALERT_LATCHED
→ PERSISTENT_PURSUIT
→ KILLED / VALID UNLOAD / RESET
```

Do not clear because of distance, temporary LOS loss, Shelter, or Recovery.

## Guard Wind Drift

New:

```text
guard-wind-drift-v1
```

Reuse the same World Wind phase clock and preferably `sampleWorldForce()` semantics.

Do not create a fake Player physics body for Enemy.

High-level order:

```text
PRIMARY AI MOVEMENT
→ SAMPLE WORLD WIND
→ APPLY SECONDARY DRIFT
```

### Normal Patrol/Pursuit

```text
driftFactor 0.30
full ACTIVE raw drift = 108 px/s
```

### Pursuit Dash

```text
driftFactor 0.12
full ACTIVE raw drift = 43.2 px/s
```

Numbers are initial tuning; behavior is locked.

### Important

- Waypoints stay fixed.
- Wind weakens → AI naturally corrects toward target.
- Unalerted drift clamps to activation.
- Alerted drift clamps to pursuitBounds.
- LULL/WARNING multiplier 0.
- DECAY uses same world multiplier.
- same Wind shadow semantics preferred.
- projectile Wind is out of scope.
- Player Wind behavior must not change.

## Simulation exclusivity

Never run Patrol and Pursuit locomotion together in the same tick.

Unalerted:
```text
Patrol move → Drift
```

Alerted:
```text
Pursuit move → Drift
```

Dash:
```text
Dash move → reduced Drift
```

## Multiplayer / replication

Final Guard position and alert state are authoritative.

Do not apply additional client-side Wind drift to already replicated Enemy position.

Retarget dead/disconnected latched Player to a valid active Player in the same stage scope.

Do not chase into 4-4 after valid progression unload.

## Crosswind

```text
x -460
y -1080
w 980
h 360
direction (1,0)
strength 360
pulsed:
  lull 1.75
  warning .70
  active 1.40
  decay .30
```

## AREA-SPEC validator

Current generic enemy patrol contract is start/end-oriented.

Do not collapse approved multi-point choreography merely to satisfy it.

Add approved support for `sector04-persistent-guard-v1` / richer authoring shape, or otherwise implement an equivalent validator-backed contract.

## Tests

- A 4-point loop before alert.
- B 3-point sweep before alert.
- A pursuit reaches Wind/B band.
- B drifts during Patrol ACTIVE/DECAY.
- A drifts after entering Wind.
- normal factor 0.30.
- Dash factor 0.12.
- LULL/WARNING zero.
- waypoints unchanged.
- no bounds escape.
- no projectile Wind.
- A+B+Wind Base traversal readable.
- Recovery does not clear Alert.
- existing Player Wind / earlier Sector enemies do not regress.
