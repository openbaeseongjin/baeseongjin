# ONE ROPE — SECTOR 04-3 RESIDENTIAL SKYBRIDGE — REV1.0

> Status: **DESIGN LOCKED — FULL PACKAGE**
> Sector04 Master: **UPPER RESIDENTIAL / AMENITY DISTRICT**
> Theme: **PRIVILEGE IS PROTECTED**
> Authoring snapshot: `3c9f661bba58af6f7351e00754c12aef86575a12`
> Approved Gameplay Preview basis: **REV7**
> Legacy current Runtime 4-3: **FREIGHT BYPASS / CUTTER + TRANSIT WAKE — SUPERSEDED FOR NEW AUTHORING**
> New 4-3 Runtime: **NOT IMPLEMENTED**
> Local Relay objective Runtime: **NOT VERIFIED / IMPLEMENTATION GAP**

---

# 0. CANONICAL WORKING IDENTITY

## Name

**4-3 RESIDENTIAL SKYBRIDGE**

## Stage Role

> **FIRST FULL PERSISTENT PURSUIT + PURPOSE-DRIVEN LOCAL SERVICE RESTORE**

4-2 teaches:
`Pursuit can follow me inside a bounded exposed territory.`

4-3 asks:
> **“목적지가 보이는데 연결이 죽어 있다. 복구 목표를 수행하는 동안 추격을 어떻게 흘려보낼 것인가?”**

The Stage is not a random `drop → reverse → relaunch` course.
Every large direction change is caused by the local objective state.

---

# 1. CAUSAL CHAIN — DO NOT BREAK

The approved Stage only works if this cause-and-effect chain remains readable:

```text
BLOCK C visible from the upper route
↓
BLOCK C LINK = OFFLINE
↓
local diagnostic points to SERVICE RELAY B-03
↓
Player descends because Relay B-03 is the Stage objective
↓
Pursuit pressures the relay run; Pursuit does NOT create the objective
↓
Relay B-03 reset completes
↓
SHARED UTILITY RISER B-C / SERVICE CONNECTOR becomes the valid continuation
↓
Player ascends and re-enters Block C
↓
BLOCK C LINK / RESTORED
SECURITY CONTACT / LOST
```

If implementation makes the Player descend before the Relay objective is readable, **FAIL**.
If the lower deck is only a gameplay detour with no objective reason, **FAIL**.

---

# 2. MAP SCALE

Approved bounds:

> **5376×2432**

Area-local:
- X `-2688..+2688`
- Y `0..-2432`

Entry:
`(-2432,-512)`

Exit:
`(+2060,-2060)`

This is intentionally broader than 4-2 and uses two vertically separated circulation systems:
- upper resident circulation
- lower maintenance circulation

The width is not filler: the entire middle span is used to establish a visible target, a failed link, a relay run, and a return ascent.

---

# 3. SPATIAL SIGNATURE

> **VISIBLE DESTINATION / DEAD LINK → UNDERSIDE RELAY RUN → SHARED UTILITY RISER → BLOCK C RE-ENTRY**

Dominant movement:

> **`→ → X ↓ ← ← [RESET] ← ↑ ↗ →`**

The `↓` is not a stylistic movement beat.
It exists because `SERVICE RELAY B-03` is below.

The `←` after the drop is not a chase gimmick.
It follows the underside maintenance gantry to the relay and then to the shared utility riser.

---

# 4. PLAYER READ BEFORE COMMIT

Before the Player commits to the service drop, the camera composition must allow them to understand at least:

1. `BLOCK C · TARGET`
2. `BLOCK C LINK · OFFLINE`
3. `LOCAL SERVICE RELAY B-03 ↓`

Do not require a blind drop to discover the objective.

The ideal read is:

```text
I can see where I need to go.
The normal link is dead.
The game shows which local service component restores it.
I choose to go down because I need that component.
```

---

# 5. UPPER ROUTE — NORMAL RESIDENT CIRCULATION

Entry is Block A Upper Residential access.
The player reaches the long Garden Skybridge through A1→A3.

Upper chain:
`G1 → G8`

At/near the far end:
- Block C is visually readable as the destination,
- the B-C link is visibly OFFLINE,
- the lower Relay B-03 objective is signposted.

This upper route should feel maintained and intentionally protected, not ruined.

---

# 6. LOCAL OBJECTIVE — SERVICE RELAY B-03

Objective ID:

`sector-04-03:service-relay-b03`

Purpose:

> Restore the local B-C service link required to continue toward Block C.

This is **Stage-local**.
It is NOT:
- Override A/B/C,
- Sector04 2-of-3 progression,
- an Augment,
- a permanent key,
- a kill gate.

## Interaction contract

Design intent:
- use an existing interaction/objective primitive if one exists after latest-main audit,
- short manual reset interaction,
- candidate interaction hold: **1.0–1.4s**, tuning only,
- Player control should not be globally frozen,
- no cinematic world pause.

### Important Runtime truth

At package authoring time, a dedicated validated `service-relay` AREA-SPEC preset was **not verified**.
Do not fabricate one.
Implementation must first audit current interactable/objective helpers and either:
1. reuse an existing compatible local interaction primitive, or
2. add the smallest stage-local objective capability necessary, with tests.

---

# 7. PURSUIT — PRESSURE, NOT MOTIVATION

Enemy:

> **Pursuit Drone ×1**

Current verified defaults at baseline:
- moveSpeed `160`
- acquireRange `640`
- triggerDistance `96`
- windup `0.25s`
- dashSpeed `640`
- dash `0.2s`
- recovery `0.5s`
- Dash direction is frozen when windup begins.

Pursuit purpose:
- make the long approach to Relay B-03 tense,
- punish staying on one height/axis,
- create a meaningful drop/reverse decision,
- continue pressure immediately after reset until the Player reaches the riser/re-entry path.

Pursuit must NOT:
- be required to die,
- unlock Relay on death,
- explain why the link is offline,
- become a new pathfinding AI fiction.

---

# 8. RELAY RESET → RETURN ROUTE

After Relay B-03 completes:

```text
SERVICE RELAY B-03
RESET COMPLETE

BLOCK C LINK
RESTORED
```

The next movement target becomes:

`SHARED UTILITY RISER B-C`

The Player continues along the lower maintenance level toward S3→S6, then climbs:

`U1 → U4`

Then:

`C1 → C5 → EXIT`

The service connector/re-entry path may be visually dormant before the reset, but same-Sector physical geometry should not be dynamically created/deleted merely to simulate progression unless the actual Runtime contract explicitly supports it. Prefer state/readability changes over fake geometry mutation.

---

# 9. ROPE CONTRACT

Current Runtime:

```text
hookSpeed = 1200
hookFlightRatio = 1/3
base Hook Reach = 400px
```

Approved mandatory route max adjacent relation:

> **396.02px — PASS**

Do not re-space required anchors beyond 400px without a fresh Runtime audit.

No Long Rope requirement.
No Augment requirement.

---

# 10. STORY / DIRECTION

Story stays operational and experiential.

Required player-facing states:

```text
UPPER RESIDENTIAL ACCESS
NORMAL CIRCULATION

BLOCK C LINK
OFFLINE

LOCAL SERVICE RELAY B-03
MANUAL RESET REQUIRED

RESIDENTIAL SECURITY
TRACKING

SERVICE RELAY B-03
RESET COMPLETE

BLOCK C LINK
RESTORED

SECURITY CONTACT
LOST
```

Do not explain:
- who decided the privilege hierarchy,
- why one population is protected,
- Sector05 continuity decision structure.

4-3 shows protection/security through space and operations.
Sector05 owns the deeper causal explanation.

---

# 11. FAILURE / RECOVERY

Required recovery logic:

- Failed service drop should recover to a readable maintenance landing, not a long death void.
- Failed Utility Riser ascent should return to lower service circulation.
- No failure should reset Relay B-03 after the local objective has already been completed within the Stage unless current Stage lifecycle rules explicitly require that behavior.

Persistence scope for the relay must be selected deliberately during implementation:
- at minimum stable across normal local recovery/respawn within the Stage attempt,
- not a Sector-wide collectible.

---

# 12. SECTOR PROGRESSION

4-3 owns **NO Resident Security Override**.

Sector04 long progression remains:
- A = 4-2
- B = 4-5
- C = 4-7
- required = any 2 of 3
- quorum owner = 4-8

Relay B-03 must not increment this count.

---

# 13. FORBIDDEN

- Legacy Freight Bypass identity
- Cutter
- Transit Wake / Wind
- Scanner
- Patrol companion
- Override source
- Augment source
- Kill gate
- unexplained lower detour
- hidden Relay objective revealed only after the drop
- Sector05 corporate continuity exposition
- dynamic geometry assumptions not supported by current Runtime

---

# 14. RELEASE GATE

Do not call 4-3 implemented until all are true:

1. Approved 5376×2432 topology is represented in actual Runtime.
2. Block C / OFFLINE / Relay B-03 read occurs before mandatory descent.
3. Relay B-03 has a real tested Runtime objective behavior.
4. Relay completion makes the continuation state unambiguous.
5. Exactly one Pursuit is used.
6. No kill gate.
7. Mandatory Rope relations remain ≤400px under current config.
8. Story beats correspond to real Runtime states.
9. No 4-2 Override A or 4-5/4-7 source semantics are reused for Relay B-03.
10. Browser playtest confirms the reason for descending is understandable without reading planning docs.
