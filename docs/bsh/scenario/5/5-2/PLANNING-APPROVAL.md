# ONE ROPE — SECTOR 05-2 CONTROL ATRIUM — REV1 PLANNING DRAFT

> Status: APPROVED BY USER — PACKAGE AUTHORITY REV1.0<br>
> Sector: 05 CONTINUITY CONTROL<br>
> Theme: THE SYSTEM CHOOSES WHAT CONTINUES<br>
> Authoring snapshot: `3c9f661bba58af6f7351e00754c12aef86575a12`<br>

## 0. Authority decision

Current GitHub still contains an older 5-2 candidate:

`GLASS ATRIUM / Patrol Drone timing`

That candidate is **superseded for current creative authoring** by the Sector05 Master Plan:

`5-2 CONTROL ATRIUM / first AEGIS lesson`.

Current Runtime facts checked:
- `shield-drone-t1` is an official enemy archetype.
- Shield direction turns toward the nearest active target.
- Runtime shield half-angle = ~60° each side of facing (front ~120° protected arc).
- Runtime turn speed = `π × 1.5 rad/s`.
- `shield-drone-t1` uses projectile attack.
- Rope Impact is rejected when it arrives from the protected frontal arc.

## 1. Stage question

> **“정면이 막혔을 때, Rope로 공격 각도를 바꿀 수 있는가?”**

5-1 asked:

`WHERE CAN I ATTACH?`

5-2 asks:

`FROM WHICH ANGLE SHOULD I APPROACH?`

## 2. Architectural reason

Space:

`CONTROL ATRIUM / STAGGERED GLASS SECURITY PARTITIONS + SUSPENDED REVIEW BRIDGES`

The Control Atrium connects multiple command floors through broad, straight review bridges.
Those authorized bridges are watched by AEGIS security.

Maintenance circulation does not use the bridge centerline.
It runs along:
- partition-frame inspection lugs,
- service brackets,
- outside edge maintenance ledges.

Therefore the Player naturally moves **around the edge of each security partition**, which also changes the attack angle against AEGIS.

The flank is architectural first, combat second.

## 3. Spatial signature

`TWO STAGGERED PARTITION FLANKS / LEFT SECURITY BRIDGE → RIGHT SECURITY BRIDGE → UPPER CONTROL DECK`

Not:
- another monumental alternating-core Stage like 5-1,
- another central-core loop like 4-7,
- a flat combat room.

## 4. Macro flow

`5-1 FINAL CONTROL VESTIBULE`
→ Entry
→ P0 AEGIS Preview / FULL SAFE
→ Lower Partition Flank
→ AEGIS A Bridge
→ M0 Post-AEGIS Safe Deck
→ Upper Partition Flank
→ AEGIS B Bridge
→ M1 Post-AEGIS Safe Deck
→ Upper Return Hardpoints
→ Final Control Deck / FULL SAFE
→ `5-3 SECURITY REVIEW GALLERY`

Overall movement keeps gaining height.

## 5. Security

### AEGIS A
First lesson.
- activation only in lower partition band
- no other enemy active
- Player sees shield orientation before entering
- direct frontal Rope Impact is blocked
- side/rear impact is allowed by current Runtime
- kill optional
- no kill gate

### AEGIS B
Reinforcement.
- separate upper band
- never overlaps A
- partition orientation flips
- forces the Player to perform the same principle from the opposite side
- kill optional
- no kill gate

Total Security target: **2**.

Forbidden:
- Jammer
- Cutter
- Artillery
- Pursuit
- Wind
- Scanner
- required kill
- new Rope input
- new Rope physics

## 6. Important AEGIS fairness

Because the shield turns toward the Player, a static “stand behind it forever” solution is not the lesson.

The intended rhythm is:

`READ SHIELD`
→ `COMMIT TO SIDE HARDPOINT`
→ `MOVE 90°+ AROUND PARTITION`
→ `IMMEDIATE SIDE/REAR ATTACK WINDOW OR BYPASS`
→ `SAFE DECK`

The Stage must be playtested against the Runtime shield turn speed.

The Player is never required to damage/kill an AEGIS to open a door.
The mandatory lesson is the **flanking route**, not a kill check.

## 7. Rope route

Route points:

[(-2100, -100), (-1800, -260), (-1540, -420), (-1240, -600), (-920, -780), (-650, -960), (-330, -1120), (-20, -1270), (300, -1440), (620, -1620), (900, -1790), (620, -1970), (300, -2150), (-20, -2320), (-340, -2480)]

Neighbor distances:

[340.0, 305.29, 349.86, 367.15, 324.5, 357.77, 344.38, 362.35, 367.15, 327.57, 332.87, 367.15, 362.35, 357.77]

Maximum intended relation:

**367.15px < 400px**

## 8. Recovery

R1 — below lower partition flank<br>
R2 — below upper partition flank<br>
R3 — below final return

Target retry:
`≤5 sec`

Recovery must return Player to the same flank lesson, not skip AEGIS.

## 9. Story

5-1 established:

`CITY SYSTEM STATUS / DEGRADED`
`CONTROL NETWORK / ONLINE`

5-2 adds only:

`UPPER CONTROL / POWERED`

and:

`CONTINUITY SECURITY / ACTIVE`

Exit preview:

`SECURITY REVIEW GALLERY / ACCESS RESTRICTED`

No Player Bark proposed in 5-2.

Reason:
5-1 already had the human reaction.
5-2 should let the active security architecture itself carry the unease.

## 10. Story boundary

Do NOT reveal:
- Capacity shortage
- Priority Directive
- Suspension Authorization
- who was preferred
- who ordered the decision
- why Sector04 refuge/protected ascent stayed active

Those remain later Sector05 evidence.

## 11. Approval gate

This REV1 is not a final package.

Approve/revise:
1. staggered partition architecture,
2. two sequential AEGIS bands,
3. no Player Bark,
4. upward route silhouette.

After user approval:
- AREA-SPEC
- DIRECTION-SPEC
- runtime handoff
- validation
- final package


## Approval record

User approved the map similarity result and requested packaging on 2026-08-21 KST.
