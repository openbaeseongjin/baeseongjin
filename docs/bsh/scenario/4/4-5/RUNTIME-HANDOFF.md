# SECTOR 04-5 — RUNTIME IMPLEMENTATION HANDOFF

Status: **IMPLEMENTATION TARGET / MOVING ANCHOR NEW SYSTEM**

Sector-wide Persistent Pursuit contract: [`PERSISTENT-PURSUIT-RUNTIME-HANDOFF.md`](../PERSISTENT-PURSUIT-RUNTIME-HANDOFF.md).

Snapshot:

```text
b6e5b640f04135545341d3368a843b45c35fcedd
```

Developer owns architecture. This file owns behavior.

---

## 1. Recheck before coding

```text
src/game/config.js
src/game/input/RopePointerInput.js
src/game/rope/RopeLauncher.js
src/game/rope/FixedLengthRope.js
src/game/rope/RopeAttachment.js
src/game/combat/EnemyPatrol.js
src/game/combat/EnemyBehaviors.js
src/game/world/areas/sector04/Sector04AreaCatalog.js
src/game/augments/FoundationAugmentCatalog.js
docs/bsh/scenario/AREA-SPEC-AUTHORING-STANDARD.md
scripts/validateAreaSpecs.mjs
```

---

## 2. Source migration

Replace legacy 4-5 Express Shaft content.

Remove:

```text
sector-04-05:express-wake
```

No Wind in REV2.5.

Seamless progression:

```text
4-5 → 4-6
```

---

## 3. Guards

Use integrated:

```text
sector04-persistent-guard-v1
```

### A/B

Shared Diamond route:

```text
(-420,-650)
(0,-850)
(420,-650)
(0,-500)
```

Both:

```text
mode loop
speed 60
wait 0
```

Phase:

```text
A 0.0
B 0.5
```

The phase relationship is part of Stage behavior.

Do not implement B as a different route just to approximate the look.

### Alert

Detected Guard:

```text
stop Orbit
latch Alert
Persistent Pursuit
```

Undetected partner continues Orbit.

### C

```text
(350,-1120)
(70,-1230)
(330,-1360)
(20,-1490)

mode pingpong
speed 72
wait .20
```

Worst case = 3 Pursuers.

---

# 4. Anchor Drone

New preset/system:

```text
moving-anchor-drone-v1
```

Exact authored body path:

```text
start (-190,-900)
end   (110,-900)
speed 80
wait  .20
mode  pingpong
```

Grapple socket:

```text
local (0,-31)
```

Rules:

```text
neutral
non-hostile
indestructible
kinematic
no combat attack
no cover/collision gameplay
multiattach allowed
not mandatory for clear
```

---

# 5. Dynamic candidate selection

Current `findRopeAttachment()` only receives `surfaces`.

Extend Rope targeting behavior so static and dynamic candidates coexist.

Design requirements:

- same pointer input
- same Base reach
- same aim-tolerance philosophy
- same divider occlusion
- access predicates supported
- deterministic selection when static and dynamic targets are both near cursor

Do not globally prefer Moving Anchor over a much better static aim match.

Dynamic candidate must carry stable identity, not only a transient x/y.

Minimum conceptual data:

```text
targetId
socketId
currentPosition
currentVelocity
```

Exact data structure is developer-owned.

---

# 6. Hook flight

Current Launcher copies target x/y at launch.

Moving Anchor needs a dynamic-target shot contract.

### Launch

At launch:

```text
current socket must be within Hook Reach 400
```

Store stable dynamic target identity.

### Advance

During flight:

```text
resolve current socket position
advance Hook toward current socket
```

Do not teleport.

Hook still obeys:

```text
hookSpeed 1200
flight lifetime 1/3 sec
max reach 400
```

At Drone speed80, target may shift up to approximately:

```text
26.7px
```

during one max flight lifetime.

### Invalid target

If target unloads/becomes invalid:

```text
miss/cancel
normal reload
```

---

# 7. Attach and moving pivot

On hit:

```text
ropeLength = hand → socket distance at hit
```

Rope length remains fixed.

A moving pivot requires socket:

```text
position
velocity
```

### Constraint velocity

For a moving anchor, radial constraint velocity must be based on:

```text
(player hand point velocity - anchor socket velocity)
dot ropeNormal
```

not Player hand velocity against a zero-velocity anchor.

Position correction also uses the current socket position every physics tick.

This requirement is behavior-level physics correctness, not a mandate to modify a particular class.

---

# 8. Release

Release remains normal Rope release.

Do NOT add:

```text
moving-anchor-release-boost
```

Player leaves with the velocity created by:

- Player motion
- existing Rope constraint
- moving pivot
- existing release angular transfer
- current Augment if selected

Then normal reload.

---

# 9. Drone path authority

Drone is kinematic.

Player Rope cannot:

- move it
- slow it
- change route
- change phase

The Drone does not solve forces from Players.

Multiple Players may attach simultaneously.

Each Player gets its own Rope length/constraint to the same socket transform.

---

# 10. Multiplayer

Authoritative simulation owns:

- Drone path phase
- body transform
- socket position
- socket velocity
- Player dynamic attachment identity

Clients must not independently advance the Drone and then add another offset to replicated state.

Required tests:

- 2+ Players attach same Drone
- one releases, other remains
- no Drone speed change
- no shared Rope length
- disconnect attached Player
- party wipe
- Stage transition
- reconnect/snapshot no duplicate attachment

---

# 11. Dynamic target reversal

At pingpong endpoint the Drone velocity changes direction.

The implementation must provide finite/stable socket velocity through reversal.

No NaN / teleport / large one-frame impulse.

If an instantaneous kinematic velocity reversal produces unacceptable Rope spikes, smooth the Drone route velocity profile without changing the visible authored path endpoints or making the Drone mandatory.

---

# 12. Static fallback

Moving Anchor feature failure must not block Stage clear.

Mandatory route:

```text
entry → a1 → a2 → atrium-read → a3 → mid-bridge → a4 → upper-gallery → a5 → exit
```

The Drone route removes a landing; it does not own progression.

---

# 13. Drone optional route

Intended sequence:

```text
ATRIUM READ
→ hook Anchor Drone
→ moving swing/release
→ DRONE EXIT TERRACE
→ A4
```

Drone Exit body sample `(300,-1130)` → A4 current hand-origin distance:

```text
109.6px
```

so successful Drone play hands back to stable static progression immediately.

---

# 14. Camera

Atrium camera must show:

```text
Guard A
Guard B
Anchor Drone
A3 fallback
Player
```

during the read.

Do not zoom so tightly onto Drone that mandatory path disappears.

---

# 15. AREA-SPEC extension

Current REV1.1 cannot encode the dynamic entity/path/socket as a first-class top-level collection.

Do not commit an ad-hoc schema key.

Extend the official authoring contract deliberately, then migrate the handoff constants into machine-readable data.

Until then:

```text
moving-anchor-drone-v1 = NOT_IMPLEMENTED
```

is the honest contract.

---

# 16. Tests

## Rope targeting
- static target regression
- dynamic target selection
- occlusion
- 400 reach
- target invalidation

## Launcher
- moving target tracking
- speed/lifetime enforcement
- miss/reload

## Constraint
- moving position
- moving anchor velocity
- endpoint reversal
- fixed Rope length
- normal release

## Multiplayer
- multiattach
- independent Rope lengths
- authoritative Drone
- release/disconnect/unload

## Stage
- static fallback clear
- A/B phase window
- one Guard alert breaks only its Orbit membership
- C upper sweep
- max3 pursuit
- Long Rope / Fast Recover / Release Propulsion regression
