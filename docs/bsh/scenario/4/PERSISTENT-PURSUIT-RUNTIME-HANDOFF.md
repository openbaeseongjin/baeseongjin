# SECTOR 04 — PERSISTENT PURSUIT SECURITY RUNTIME HANDOFF

Status: `NEW SYSTEM / NOT IMPLEMENTED`

Latest checked main:

```text
8afd16bc76462436490fe7c753611c2ecf36b548
```

## Existing pieces

Already implemented:

```text
EnemyPatrol
pursuit-drone-t1
PursuitEnemyBehavior
Enemy weapon state machine
activation bounds
Enemy health / death
```

Current pursuit behavior already moves toward Player and supports:

```text
seek
windup
dash
recover
```

## Missing behavior

Sector 04 requires a hybrid:

```text
PATROL BEFORE DETECTION
+
LATCHED PURSUIT AFTER DETECTION
```

Contract:

```text
UNALERTED
→ follow authored patrol

first valid target acquisition
→ alerted = true
→ latch target
→ stop authored patrol

ALERTED
→ pursue target independent of initial acquire distance
→ do not return to patrol due to range or temporary LOS loss

END
→ enemy killed
→ valid area unload / stage transition
→ area reset / party wipe
```

## Multiplayer

- latch first detected Player.
- if latched Player dies/disconnects, retarget nearest active Player in same area.
- do not chase across area transition.
- authoritative enemy state required.

## Suggested implementation direction

Do not implement from this document by inventing architecture.

Inspect current:

```text
src/game/combat/EnemyObject.js
src/game/combat/EnemyPatrol.js
src/game/combat/EnemyBehaviors.js
src/game/combat/EnemyArchetypeCatalog.js
src/game/simulation/GameSimulation.js
tests/enemyArchetypes.mjs
tests/enemyEncounterSelection.mjs
```

Prefer reusing `PursuitEnemyBehavior` rather than duplicating movement logic.

Possible design options to evaluate in code:

```text
A. new hybrid behavior
B. persistent-pursuit rule + alert state on EnemyObject
C. wrapper behavior that delegates patrol before alert and PursuitEnemyBehavior after alert
```

Developer owns architecture choice.

## Acceptance tests

- unalerted guard follows authored patrol.
- first valid Player detection latches alert.
- alerted guard stops patrol.
- alerted guard follows Player beyond original acquireRange.
- temporary LOS loss does not clear alert.
- guard death ends pursuit.
- area transition unloads pursuit.
- Player death/disconnect retargets correctly in multiplayer.
- no active Player => no invalid target / no crash.
- pursuit state serializes/snapshots authoritatively if current multiplayer requires it.
- existing Sector01~03 Patrol behavior remains unchanged.
