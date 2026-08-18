# SECTOR 04-8 — RUNTIME IMPLEMENTATION HANDOFF

Sector-wide Persistent Pursuit contract: [`PERSISTENT-PURSUIT-RUNTIME-HANDOFF.md`](../PERSISTENT-PURSUIT-RUNTIME-HANDOFF.md). Resident Security Override contract: [`SECTOR-04-ACCESS-ROLLOUT.md`](./SECTOR-04-ACCESS-ROLLOUT.md).

Status: **IMPLEMENTATION TARGET**

Snapshot:

```text
1cb2d48870352dc71637cfc7ad553d655e0a94d4
0.32.0
```

## 1. Recheck before implementation

```text
src/game/config.js
src/game/input/RopePointerInput.js
src/game/rope/RopeLauncher.js
src/game/rope/FixedLengthRope.js
src/game/combat/EnemyPatrol.js
src/game/combat/EnemyBehaviors.js
src/game/world/SectorProgressState.js
src/game/world/SectorProgressController.js
src/game/world/sectors/LegacyAreaSeamlessSectorRuntime.js
src/game/world/areas/sector04/Sector04AreaCatalog.js
docs/bsh/scenario/AREA-SPEC-AUTHORING-STANDARD.md
scripts/validateAreaSpecs.mjs
```

## 2. Migrate 4-8 source

Retire legacy Cutter/Wind `TRANSIT CONTROL TRUNK`.

Implement approved Upper Residential Threshold geometry from AREA-SPEC.

## 3. Guard Patrols

A:

```text
(-460,-500) ↔ (300,-500)
target speed 62
```

B:

```text
(360,-840) ↔ (-260,-840)
target speed 70
```

C:

```text
(300,-1190) ↕ (300,-1460)
target speed 74
```

The official AREA-SPEC only encodes the currently validated endpoint Patrol contract. Exact tuning belongs to source implementation/playtest until the authoring schema has a stable tuning field.

## 4. Persistent Pursuit

New integration:

```text
sector04-persistent-pursuit-latch-v1
```

Required semantics:

```text
PATROL
→ valid detection
→ alert latched
→ persistent pursuit
```

Alert ends on:

- guard death
- valid Stage/Sector unload/transition
- approved party-wipe/current-Sector reset

Alert does not end on:

- temporary LOS loss
- Recovery
- moving to next security band
- leaving initial Patrol activation

No fake stealth/aggro decay/search mode.

## 5. Max pressure

Authored ceiling:

```text
3 Guards
```

Do not add a fourth Guard if the finale feels easy.

Tune activation, speeds, camera and recovery first.

## 6. Relay rollout

### A — 4-2

```text
id suggestion:
sector-04:resident-override:courtyard

host:
4-2 decision-deck

terminal:
(-165,-730)
```

### B — 4-5

```text
id suggestion:
sector-04:resident-override:amenity

host:
4-5 upper-gallery

terminal:
(-200,-1420)
```

Mandatory Static Route must reach this without Moving Anchor Drone.

### C — 4-7

```text
id suggestion:
sector-04:resident-override:refuge

relay ledge top:
y -1285

terminal:
(420,-1325)
```

No Alert clear and no Wind reset on collection.

## 7. Relay interaction

First implementation target:

```text
normal interact
→ collect shared access proof
```

Do not silently reuse the current timed objective sequence as a damage-interrupt hold interaction; current sequence semantics do not provide that contract.

## 8. Generalize current access state

Prefer extending the current shared access contract.

Current `SectorProgressState` already has:

```text
accessModulesById
collectedAccessModuleIds
accessSummary()
requiredAccessModuleCount route check
```

The missing compiler/source capability is that current Access Modules are produced from encounter `accessModuleId`, and the transition requirement is currently specialized to Sector01.

Required design behavior:

```text
source can be ENCOUNTER or RELAY INTERACTION
→ both collect into shared Sector access proof state
```

Naming can be generalized internally if needed, but preserve snapshot compatibility deliberately.

## 9. Sector04 transition condition

Future transition route:

```text
source = Sector04 final landmark / post-Sector transition mouth
required stage objective = 4-8 exit-panel-engaged
required Resident Security Override count = 2
target = Post-Sector04 Boss / Transition landmark
```

Do not target 5-1 until that transition content is approved.

## 10. UI

On Sector04 entry:

```text
OVERRIDE 0/2
SIGNAL 3
```

After one:

```text
OVERRIDE 1/2
SIGNAL 2
```

Ready:

```text
OVERRIDE 2/2
TRANSIT CLEARANCE READY
```

Third:

```text
OVERRIDE 3/2
ALL RESIDENT NETWORKS COMPROMISED
```

The exact 3/2 presentation can instead display `3/3 FOUND · 2 REQUIRED`; avoid confusing arithmetic in production UI.

## 11. Multiplayer

Required:

- shared proof count.
- simultaneous Relay interaction idempotent.
- duplicate interact does not duplicate proof.
- individual death preserves.
- reconnect receives authoritative proof set.
- party wipe follows current-Sector reset policy.
- route readiness replicates to all players.

## 12. Test matrix

### Traversal
- Base Rope
- swingImpulse=0
- Long Rope
- Fast Launch
- Fast Recover
- Release Propulsion
- Direction Dash

### Patrol/Pursuit
- A only
- A+B
- A+B+C
- kill A then B/C
- outrun all
- recovery does not reset

### Access
- A+B
- A+C
- B+C
- all 3
- only 1 + final objective => route locked
- 2 + final objective => route ready
- 2 without final objective => route locked

### Boundary
- no direct 5-1 transition
- correct post-Sector content boundary behavior until transition slot exists
