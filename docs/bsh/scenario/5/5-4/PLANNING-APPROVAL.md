# ONE ROPE — SECTOR 05-4 CAPACITY ALLOCATION CORE — REV2 APPROVED DESIGN

> Status: DESIGN LOCKED FOR PACKAGING<br>
> Supersedes: REV1 continuous horizontal floor<br>
> Authoring snapshot: `3c9f661bba58af6f7351e00754c12aef86575a12`<br>
> Role: FIRST ARTILLERY STAGE + CAPACITY RECORD 1/3

---

# 0. REV2 CHANGE

REV1 macro silhouette was correct:

`HORIZONTAL → RIGHT-SIDE VERTICAL RISER`

but the implementation used a long continuous floor.

REV2 keeps the macro and replaces the floor with:

```text
ALLOCATION ISLAND A
→ CONTROL VOID
→ ALLOCATION ISLAND B
→ CONTROL VOID
→ ALLOCATION ISLAND C
→ CONTROL VOID
→ ALLOCATION ISLAND D
→ BUS RISER
```

This preserves:
- horizontal first half
- L-shaped stage silhouette
- Artillery dwell-control lesson

while restoring:
- Rope traversal
- One Rope identity
- Sector05 Control Console Island grammar.

---

# 1. Spatial signature

> **HORIZONTAL ALLOCATION ISLAND FIELD → RIGHT-SIDE VERTICAL BUS RISER**

The Player does not simply run across a floor.

They move between broad console islands separated by short clean voids.

Each island is:
- large enough to land on
- small enough that Artillery telegraph matters
- positioned so the next Hardpoint / next island is visible before landing.

---

# 2. Architectural cause

The Capacity Allocation Core is a command floor that compares multiple infrastructure systems.

Each console island represents a separate allocation domain / control cluster.

Between islands:
- sealed data trenches
- cable voids
- inaccessible floor gaps
- flush corporate surfaces

prevent generic traversal.

Maintenance access uses overhead/service-edge Hardpoints.

The far-right side contains the **Vertical Control Bus Riser**, which connects the allocation floor to the record deck above.

---

# 3. Gameplay lesson

5-3:
`NEXT ATTACHMENT CHOICE CAN BE DENIED`

5-4:
> **“착지한 위치가 곧 공격받는다면, 다음 이동을 준비한 채 계속 움직일 수 있는가?”**

Current Artillery:
- locks current target position once
- telegraph 0.65s
- strike radius 72px
- strike hits stored location
- cooldown 1.4s

Target rhythm:

```text
LAND ON ISLAND
↓
TELEGRAPH APPEARS
↓
NEXT HARDPOINT ALREADY VISIBLE
↓
MOVE TO NEXT ISLAND
↓
STRIKE HITS OLD ISLAND
```

---

# 4. Island layout

## ISLAND A — Preview / First Trigger
Large and safe enough for first read.

Player sees:
- Artillery A
- next Hardpoint
- Island B.

## ISLAND B — First Commitment
Telegraph should appear here reliably during first lesson.

## ISLAND C — Flow Confirmation
Keeps the Player moving without adding new mechanic.

## ISLAND D — Riser Setup
Ends the horizontal field and gives a full-safe beat before vertical phase if needed.

---

# 5. Security

## Artillery A — Allocation Field
- first lesson
- broad activation band across Islands A–C
- no Jammer / AEGIS / Cutter / Pursuit
- kill optional
- no kill gate

## Artillery B — Bus Riser
- reinforcement only
- separate activation band
- never overlaps A
- same telegraph / stored-position logic
- no new mechanic

Total:
`ARTILLERY ×2`

---

# 6. Rope route

[(-2120, -260), (-1840, -300), (-1520, -360), (-1220, -420), (-900, -360), (-580, -300), (-260, -380), (60, -440), (360, -420), (640, -520), (760, -800), (760, -1120), (760, -1440), (760, -1760), (500, -1960), (220, -2140)]

Neighbor relations:
[282.84, 325.58, 305.94, 325.58, 325.58, 329.85, 325.58, 300.67, 297.32, 304.63, 320.0, 320.0, 320.0, 328.02, 332.87]

Maximum intended relation:

**332.87px < 400px**

All mandatory relations Base-clear.

---

# 7. Recovery

- R1 under A/B void
- R2 under B/C void
- R3 under C/D void
- R4 below Bus Riser middle
- R5 below upper Riser

Target retry:
`≤5 sec`

Recovery must return to the nearest unfinished movement beat.

---

# 8. Story

Entry:

```text
CAPACITY ALLOCATION CORE
OPERATIONS ACTIVE
```

After all Artillery pressure ends, at the full-safe Capacity Record Deck:

```text
CAPACITY ALLOCATION RECORD
01 / 03

AVAILABLE CAPACITY
CRITICAL DEFICIT

SIMULTANEOUS STABLE OPERATION
UNAVAILABLE
```

Meaning:
- not enough available capacity existed to keep all systems stably operating simultaneously.

Player Bark:

> **“…전부 살릴 수는 없었던 거네.”**

This is still only the **constraint**.

Forbidden interpretation:
- which group was prioritized
- who was sacrificed
- who authorized the decision
- why Sector04 remained protected

Exit:

```text
PRIORITY ROUTING HALL
ACCESS AHEAD
```

---

# 9. Stage uniqueness

5-1:
monumental alternating core crossings.

5-2:
staggered partition flanks / AEGIS angle control.

5-3:
central spine → dual bypass → lateral transfer → reverse return.

5-4 REV2:
**horizontal console-island hopping → right vertical riser.**

Result:
PASS — distinct macro silhouette and movement rhythm.
