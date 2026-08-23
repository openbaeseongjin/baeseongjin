# ONE ROPE — SECTOR 05-3 SECURITY REVIEW GALLERY — REV2 PLANNING DRAFT

> Status: APPROVED BY USER — DESIGN LOCKED REV2.0<br>
> Supersedes: REV1 diagonal lower-left → upper-right layout<br>
> Sector: 05 CONTINUITY CONTROL<br>
> Role: FIRST HARDPOINT JAMMER STAGE<br>
> Authoring snapshot: `3c9f661bba58af6f7351e00754c12aef86575a12`<br>

---

# 0. REV2 CHANGE — MAP SILHOUETTE RESET

REV1 failed the Stage-uniqueness test.

Problem:

```text
5-1
lower-left → upper-right alternating ascent

5-2
lower-left → upper-right partition ascent

5-3 REV1
lower-left → upper-right archive ascent
```

Even though the mechanics differed, the macro silhouette repeated the same diagonal climb.

REV2 keeps **net vertical ascent** but changes the route grammar to:

```text
BOTTOM-CENTER
↑
CENTRAL VERTICAL SPINE
↙       ↘
BAY A LEFT / RIGHT BYPASS
↘       ↙
CENTER MERGE
→ → → RIGHT TRANSFER
↖ / ←
BAY B REVERSE RETURN
← / ↙
LEFT-CENTER MERGE
↑
FINAL VERTICAL ASCENT
↖
TOP-LEFT EXIT
```

The Player no longer gains height by continuously drifting in one horizontal direction.

---

# 1. Spatial signature

> **CENTRAL ASCENT SPINE → DUAL-SIDED ARCHIVE BYPASS → RIGHTWARD TRANSFER → REVERSE ARCHIVE RETURN → FINAL VERTICAL CLIMB**

This Stage deliberately uses **five distinct movement phases**:

1. straight vertical rise
2. left/right arch around Archive Wall A
3. long rightward transfer
4. right-to-left return around Archive Wall B
5. final vertical/top-left climb

Net movement remains upward.

---

# 2. Architectural cause

## Bay A — CENTRAL SUSPENDED REVIEW WALL

Archive Wall A hangs directly above the central Service Spine.

Authorized staff access the wall from enclosed review decks.
Maintenance workers use either:

```text
LEFT INSPECTION RAIL
or
RIGHT INSPECTION RAIL
```

around its sides.

Jammer A watches both first attachment choices.

## Transfer Gallery

Above Wall A, the maintenance path reaches a **long lateral cable/data bridge** that carries the Player to the far-right Review Bay.

This is an architectural horizontal transfer, not a filler detour.

## Bay B — OFFSET ARCHIVE SLAB

Archive Wall B is offset to the right and blocks the return path.

Two maintenance options:

```text
UPPER INNER REVIEW RAIL
or
LOWER OUTER SERVICE RAIL
```

both move **back leftward while gaining height**.

Jammer B charges one automatically selected normal Rope surface while leaving another Hook-reachable route available.

## Final

After Bay B merge, the route becomes a short clean vertical ascent toward the final Archive Deck.

---

# 3. Core question

> **“두 개의 다음 선택 중 하나가 감전됐을 때, 안전한 경로를 읽거나 위험을 감수할 수 있는가?”**

Jammer still controls:

```text
NEXT ATTACHMENT RISK
```

It does not pre-block attachment or change Rope length. Attaching to the active target shocks the Player and cuts that newly attached Rope.

---

# 4. Jammer layout

## JAMMER A

Clean first lesson.

At P0:
- left candidate visible
- right candidate visible
- merge direction visible
- Jammer A visible

One automatically selected candidate receives Warning → Jam Active. The other remains reachable; choosing the active target starts shock and Rope cut.

Player takes the other.

## JAMMER B

After a full-safe merge and lateral transfer:
- upper-inner candidate visible
- lower-outer candidate visible
- both move back left/up
- Jammer B visible

Again only one candidate may be jammed.

Jammer activation bands do not overlap.

---

# 5. Jammer V1 contract

Normal:
`CYAN`

Warning:
`AMBER`

Active:
`VIOLET / MAGENTA`

Jammer MUST NOT:
- cut current Rope
- force release
- damage Player
- move Hardpoint
- alter Rope length
- invalidate already-launched Hook in V1

Attached Hardpoint is not eligible as a new Jam target.

At every Jam-active moment:

> **at least one authored Base-clear route remains.**

---

# 6. Rope route

Entry / spine:
[(0, -100), (0, -400), (0, -650)]

Bay A left:
[(0, -650), (-320, -780), (-560, -1030), (-300, -1260), (0, -1400)]

Bay A right:
[(0, -650), (320, -780), (560, -1030), (300, -1260), (0, -1400)]

Lateral transfer:
[(0, -1400), (320, -1510), (640, -1600), (900, -1700)]

Bay B upper-inner:
[(900, -1700), (660, -1920), (340, -2040), (80, -2200), (-180, -2300)]

Bay B lower-outer:
[(900, -1700), (580, -1800), (300, -1980), (20, -2180), (-180, -2300)]

Final ascent:
[(-180, -2300), (-180, -2520), (-480, -2700), (-720, -2860)]

Maximum intended authored relation:

**349.86px < 400px**

---

# 7. Recovery

R1:
beneath Bay A, returns to P0-side retry.

R2:
beneath right transfer/Bay B entry.

R3:
beneath Bay B merge/final climb.

Target retry:
`≤5 sec`.

No recovery should skip the Jam decision.

---

# 8. Story

Entry:

```text
SECURITY REVIEW GALLERY
ACCESS RESTRICTED
```

Final full-safe Archive Deck:

```text
INCIDENT REVIEW ARCHIVE
RECORD SET / AVAILABLE
ACCESS / RESTRICTED
```

Player Bark:

> **“…기록까지 잠가놨네.”**

Exit:

```text
CAPACITY ALLOCATION CORE
ACCESS AHEAD
```

No Capacity Record content yet.

---

# 9. Stage uniqueness check

## vs 5-1
5-1 = repeated large alternating core crossings.
5-3 REV2 = central vertical spine + symmetric bypass + lateral transfer + reverse return.

## vs 5-2
5-2 = two sequential partition flanks, each paired with AEGIS.
5-3 REV2 = branch choice around archive masses; no combat angle control.

## vs 4-7
4-7 = one large terrace loop around a protected core.
5-3 REV2 = two compact archive bypasses separated by a straight transfer, not one enclosing loop.

REV2 target:
**PASS — macro silhouette intentionally distinct.**


## Approval record

User explicitly approved REV2 map direction (`오케이 굿`) and requested continuation/package on 2026-08-21 KST.
