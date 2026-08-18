# SECTOR 04-1 — RUNTIME IMPLEMENTATION HANDOFF

Status: **IMPLEMENTATION TARGET / NOT IMPLEMENTED**

Sector-wide Persistent Pursuit contract: [`PERSISTENT-PURSUIT-RUNTIME-HANDOFF.md`](../PERSISTENT-PURSUIT-RUNTIME-HANDOFF.md).

Authoring snapshot:

```text
8afd16bc76462436490fe7c753611c2ecf36b548
```

This handoff describes **behavioral requirements**, not the required class/function architecture.

## 1. Existing Runtime to reuse

Verify before implementation:

```text
src/game/config.js
src/game/physics/PlayerPhysics.js
src/game/rope/FixedLengthRope.js
src/game/rope/RopeLauncher.js
src/game/input/RopePointerInput.js
src/game/combat/EnemyPatrol.js
src/game/combat/EnemyObject.js
src/game/combat/EnemyBehaviors.js
src/game/combat/EnemyArchetypeCatalog.js
src/game/simulation/GameSimulation.js
src/game/augments/FoundationAugmentCatalog.js
src/game/augments/FoundationAugmentState.js
src/game/world/AreaDefinitionValidator.js
src/game/world/areas/sector04/Sector04AreaCatalog.js
tests/sector04AreaCatalog.mjs
```

## 2. Area migration

Replace legacy 4-1 Transit content with the target in `AREA-SPEC.json`.

Preserve area identity:

```text
sector-04-01
nextAreaId = sector-04-02
```

Do not wire Sector 03 directly to 4-1 until the Post-Sector 03 transition is decided.

## 3. Grapple / surface contract

Use the AREA-SPEC local IDs with implementation prefix:

```text
sector-04-01:
```

Mandatory landmarks:

```text
A1
A2
A4
A5
```

Platform/recovery surfaces should not become unintended Grapple clutter if the implementation follows the approved blockout. The intended Grapple landmarks are the four authored targets.

Do not accept `validateAreaCatalog()` with the default 600px topology budget as proof of Base Rope playability.

## 4. Guard A

Before detection:

```text
4-point loop
speed 52
waitSeconds 0.15
```

Patrol points are in `AREA-SPEC.json`.

After detection:

```text
stop Patrol
latch Alert
persistent pursuit
```

## 5. Guard B

Before detection:

```text
long pingpong
speed 68
waitSeconds 0.35
```

After detection:

same persistent pursuit policy.

## 6. Persistent Pursuit behavior

Required:

```text
UNALERTED
→ authored patrol

first valid Player detection
→ alerted = true
→ remember target
→ patrol stops

ALERTED
→ pursuit continues inside current Area
→ initial detection distance no longer clears alert
→ temporary LOS loss does not clear alert
```

End:

```text
enemy death
valid area unload
area reset / party wipe
```

### Multiplayer

- First detected player may be the initial target.
- If that target dies/disconnects, retarget nearest active Player in the same Area.
- Do not allow a stale target reference to crash simulation.
- Do not make the Guard cross the Area transition into 4-2.
- Preserve authoritative enemy state/replication conventions used by the current game.

## 7. Detection Bounds vs Pursuit Bounds

The approved design requires two conceptual regions:

```text
detection / patrol band
whole-area pursuit region after alert
```

Current `activation` is used both for target eligibility and movement clamping in existing behavior helpers.

Therefore do **not** fake persistent pursuit by leaving a narrow activation box that clamps the Guard in place.

Implementation architecture is developer-owned. Acceptable result must satisfy the behavior, not a prescribed class design.

## 8. Weapon / Pursuit interaction

`pursuit-drone-t1` currently uses projectile attack and Pursuit behavior.

Ensure the hybrid does not accidentally apply both:

```text
Patrol movement
+
Pursuit movement
```

in the same tick after alert.

Ensure before detection the Guard does not silently Pursuit-seek the Player while supposedly following its authored Patrol.

## 9. Exit

No kill objective.

Flow:

```text
reach exit deck
→ contextual gate panel interact
→ gate opens
→ physical crossing
→ sector-04-02
```

## 10. Augment source

Do not invent a Sector 04 Augment Node in 4-1.

Current main explicitly has stable source topology for Sector 01~03; Sector 04~06 source placement remains pending.

## 11. Required tests

At minimum add/update tests covering:

### Area

- 4-1 name/bounds/anchors match AREA-SPEC.
- 2 Guards authored.
- Guard A loop points and Guard B pingpong points match spec.
- no Cutter/Wind/Scanner.
- gate requires no enemy death.
- catalog validator passes after migration.

### Persistent Pursuit

- unalerted guard patrols.
- first detection latches alert.
- patrol stops after alert.
- guard follows beyond original detection band.
- distance / temporary LOS loss does not clear alert.
- guard death ends pursuit.
- area unload removes guard.
- party wipe/reset restores intended initial state.
- multiplayer target death/disconnect retargets safely.
- existing Sector 01~03 legacy Patrol behavior does not regress.

### Rope

Runtime graybox:
- Base Rope only.
- four mandatory attach samples.
- fixed-length swing/release/landing.
- two live Pursuers survivable without mandatory kill.

### Augment regressions

- Long Rope
- Fast Recover
- Release Propulsion
- Direction Dash
- Slow Fall

## 12. Do not infer

Do not add without a planning decision:

- humanoid Guard
- vision cone
- stealth meter
- Guard radio / squad alert
- kill gate
- new weapon
- new Rope mode
- new Augment Node
- direct 3-8 → 4-1 wiring
