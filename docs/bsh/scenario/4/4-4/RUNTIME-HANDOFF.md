# SECTOR 04-4 — RUNTIME IMPLEMENTATION HANDOFF

Status: **IMPLEMENTATION TARGET / NEW SYSTEMS REQUIRED**

Sector-wide Persistent Pursuit contract: [`PERSISTENT-PURSUIT-RUNTIME-HANDOFF.md`](../PERSISTENT-PURSUIT-RUNTIME-HANDOFF.md).

Snapshot:

```text
b6e5b640f04135545341d3368a843b45c35fcedd
```

This document fixes behavior; developer owns architecture.

## 1. Recheck before coding

```text
src/game/config.js
src/game/players/PlayerRuntimeFactory.js
src/game/simulation/GameSimulation.js
src/game/combat/EnemyPatrol.js
src/game/combat/EnemyBehaviors.js
src/game/combat/EnemyObject.js
src/game/world/areas/sector04/Sector04AreaCatalog.js
docs/bsh/scenario/AREA-SPEC-AUTHORING-STANDARD.md
scripts/validateAreaSpecs.mjs
```

## 2. Source Area migration

Rewrite legacy `sector-04-04` to approved Care Pavilion geometry.

Seamless progression:

```text
4-4 → 4-5
objective-gated-connector
```

Pod usage is NOT a progression requirement.

## 3. Persistent Guards

New integrated preset:

```text
sector04-persistent-guard-v1
```

### A
Reception Ring, 4-point loop, speed56, wait0.16.

### B
Cross-Atrium X Loop, 4-point loop, speed68, wait0.12.

### C
Recovery Gallery Zigzag, 4-point pingpong, speed74, wait0.20.

After detection:

```text
Patrol stops
Alert latches
Persistent Pursuit
```

Distance / temporary LOS / Recovery / Treatment Deck must not clear alert.

## 4. Treatment Pod new system

```text
care-treatment-pod-v1
```

Exact approved location:

```text
x 60
y -1128
on treatment-deck
```

### Initial tuning

```text
channelSeconds = 3.0
healAmount = 40
maxHealthCap = 100
usesPerPlayer = 1
```

### State machine

Suggested behavior, not required class names:

```text
AVAILABLE
→ CHANNELING(playerId)
→ SUCCESS_USED(playerId)

CHANNELING
→ INTERRUPTED on valid HP damage
→ AVAILABLE for that player if successful use was not consumed
```

A successful treatment consumes that Player's one use.

Do not consume the use merely because channel started.

### Success

At channel completion:

```text
newHealth = min(100, currentHealth + 40)
```

No overheal/shield.

### Damage interrupt

A valid Player HP damage event during channel:

```text
cancel channel
no heal
```

Existing invulnerability semantics should decide whether a hit is actual HP damage; do not invent a second damage model.

### Pursuit relationship

Pod must NOT:

- clear enemy alert
- freeze enemy simulation
- despawn enemy
- block enemy path to Treatment Deck
- grant Player channel invulnerability

Guard A/B can arrive during channel.

## 5. Multiplayer

Treatment state must be authoritative.

Use entitlement:

```text
per Player
```

not global Pod consumed state.

Required outcomes:

- A used → B still available.
- simultaneous interactions must be deterministic.
- disconnect/death during channel cancels cleanly.
- no duplicate heal from client retries.
- reconnect/state snapshot follows current authoritative Player state conventions.

Whether multiple Players may channel the same physical Pod simultaneously is an implementation/product choice; if current interaction architecture requires exclusivity, preserve per-Player entitlement and document the queue/lock behavior rather than changing to team-wide consumption.

## 6. AREA-SPEC extension

Do not add unsupported random fields to stage JSON.

Add explicit approved validator/authoring support for `care-treatment-pod-v1`.

The contract needs to express:

```text
objective/interactable identity
source surface or position
channelSeconds
healAmount
max cap
per-player use
damage interrupt
```

If objective preset remains the integration point, extend its schema deliberately.

## 7. Treatment is optional

Do not add:

```text
treatment-pod-used
```

to `progression.requiredObjectiveIds`.

Exit remains:

```text
final-deck-reached
→ exit-panel-engaged
→ connector to 4-5
```

## 8. 3-Pursuer test

Worst case:

```text
A alive + alerted
B alive + alerted
C alive + alerted
```

Player must still be able to:

```text
skip Pod
→ continue Base Rope
→ reach exit
```

If unreadable, tune activation overlap / C detection / enemy engagement timing before considering a kill gate.

## 9. Required tests

Treatment:
- exact 3s channel
- +40 capped at100
- valid damage interrupt
- no heal on interrupt
- successful use consumed per Player
- teammate entitlement preserved
- no Alert clear
- no invulnerability
- no enemy pause/despawn
- disconnect/death safe cancellation
- authoritative duplicate protection

Security:
- A/B/C authored patterns
- persistent alert
- A/B reach Treatment Deck
- 3 Pursuer worst case

Traversal:
- Base Rope clear without Pod
- treatment optional
- Recovery does not clear alert

Regression:
- earlier Sector Player health/damage behavior unchanged
- existing enemy behavior outside Sector04 persistent preset unchanged
