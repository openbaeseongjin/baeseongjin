# SECTOR 04-2 — RUNTIME IMPLEMENTATION HANDOFF

Status: **IMPLEMENTATION TARGET / NOT IMPLEMENTED**

Sector-wide Persistent Pursuit contract: [`PERSISTENT-PURSUIT-RUNTIME-HANDOFF.md`](../PERSISTENT-PURSUIT-RUNTIME-HANDOFF.md).

Snapshot:

```text
eaf05cd4b771879504f76d078ee728c48be5feb6
```

## 1. Reuse current systems

Inspect latest:

```text
src/game/config.js
src/game/combat/EnemyPatrol.js
src/game/combat/EnemyBehaviors.js
src/game/combat/EnemyObject.js
src/game/combat/EnemyArchetypeCatalog.js
src/game/simulation/GameSimulation.js
src/game/augments/FoundationAugmentState.js
src/game/world/AreaDefinitionValidator.js
src/game/world/areas/sector04/Sector04AreaCatalog.js
tests/sector04AreaCatalog.mjs
```

## 2. Area rewrite

Legacy CUTTER LINE is replaced by the exact geometry / enemy contract in `AREA-SPEC.json`.

Keep:

```text
area id       sector-04-02
nextAreaId    sector-04-03
```

## 3. No Cutter

Remove the current 4-2 Cutter Sentry from this stage.

Do not replace it with another static security enemy.

4-2 is a pursuit-stacking stage.

## 4. Guard A

Before alert:

```text
3-point pingpong
(-390,-390)
(-30,-535)
(300,-405)
speed 58
wait 0.18
```

After first valid detection:

```text
alert latched
patrol stops
persistent pursuit
```

Critical acceptance:

> Guard A must be able to follow beyond its initial detection band, across Decision Balcony, into Guard B band.

## 5. Guard B

Before alert:

```text
3-point pingpong
(330,-735)
(330,-945)
(20,-1070)
speed 72
wait 0.28
```

After alert:

same persistent pursuit contract.

## 6. Pursuit stacking

Required scenarios:

### A killed

```text
A dies before B band
→ only B pressure remains
```

### A outrun

```text
A alive + alerted
→ A follows into B band
→ B may alert
→ two Pursuers
```

No third Guard in 4-2.

## 7. Decision Balcony

The Decision Balcony is not:

- a checkpoint that clears enemies
- an aggro reset
- a safe room
- a route branch

It is a normal traversal surface / reload / combat-decision beat.

## 8. Activation architecture warning

Current Patrol/Pursuit helpers clamp position and eligible targets to `enemy.activation`.

A narrow `activation` cannot simultaneously serve as:

```text
initial patrol / detection band
+
whole-stage persistent chase bounds
```

without code changes.

Implementation architecture is developer-owned.

Possible approaches may include separate detection and pursuit regions or alert-state-specific activation handling, but do not infer a final architecture from this document.

## 9. Multiplayer

- initial target may be first detected active Player.
- if target dies/disconnects, retarget safely within current area.
- keep alert state until area unload/reset.
- do not let 4-2 guards enter 4-3.
- avoid stale target IDs.
- preserve authoritative state conventions.

## 10. Rope

Do not accept default 600px grapple topology validator as proof of 400px playability.

Run dynamic Base Rope graybox:

- L0→A1
- L1→A2
- L2→A3
- L3→A4

Then run two-Pursuer traversal.

## 11. Augments

No Node in 4-2.

Regression:

- Long Rope 480
- Fast Recover 0.5
- Release Propulsion 1.25
- Direction Dash
- Slow Fall

Long Rope must not skip the entire Decision Balcony + Guard B beat.

## 12. Tests

### Area
- 4-2 identity / bounds / anchors.
- Guard A and B patrol point exactness.
- no Cutter / Wind / Scanner.
- no kill objective.

### Pursuit
- A follows across Decision Balcony.
- A can coexist with B pursuit.
- killed A does not return.
- Decision Balcony does not reset alert.
- two Pursuers remain stable to exit.
- normal area transition unloads both.

### Regression
- Sector 01~03 Patrol behavior unchanged.
- 4-1 Persistent Pursuit contract remains valid.
