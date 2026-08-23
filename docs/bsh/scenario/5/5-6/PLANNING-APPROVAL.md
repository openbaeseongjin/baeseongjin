# ONE ROPE — SECTOR 05-6 INCIDENT AUTHORIZATION ANNEX — REV1 PLANNING DRAFT

> Status: APPROVED BY USER — DESIGN LOCKED REV1.1<br>
> Authoring snapshot: `3c9f661bba58af6f7351e00754c12aef86575a12`<br>
> Stage role: NEXT ROUTE + CURRENT ROPE / ROUTING AUTHORIZATION 03 OF 03<br>
> Supersedes legacy 5-6 `INCIDENT COMMAND ANNEX / BODY-SHOT ROUTE vs ROPE-CUT ROUTE`

---

# 0. Authority reset

The current GitHub 5-6 candidate is built around:

```text
LEFT = Standard Sentry / body-shot risk
RIGHT = Cutter / rope-cut risk
```

That is no longer the current Sector05 Master role.

Current 5-6 role:

```text
JAMMER
→ denies NEXT attachment

CUTTER
→ threatens CURRENT attached Rope

AEGIS
→ final angle gate

STAGED
→ not all three at once
```

Story role:

```text
ROUTING AUTHORIZATION
03 / 03

LOWER ASCENT ROUTING
SUSPENSION AUTHORIZED
```

5-7 owns the actual evacuation consequence.

---

# 1. Core question

> **“다음 Hardpoint가 잠길 수 있고 지금 걸린 Rope도 잘릴 수 있을 때, 현재 Rope와 다음 경로를 동시에 계획할 수 있는가?”**

5-3:
`READ NEXT ROUTE`

5-5:
`READ ROUTE + ANGLE`

5-6:
`READ NEXT ROUTE + PROTECT CURRENT ROPE`

---

# 2. Architectural concept

## INCIDENT AUTHORIZATION ANNEX

This is a vertically compressed authorization stack.

It contains three physical layers:

### UPPER SIGN-OFF GALLERY
executive / incident response authorization booths.

### LOWER CREDENTIAL TRENCH
protected underfloor route carrying authorization-state / routing control lines.

### VERIFICATION RISER
service route returning from the trench to the upper sign-off layer.

The front corporate stair/elevator is sealed.

Maintenance traversal therefore has a real reason to:

```text
ASCEND
↓
DROP INTO CREDENTIAL TRENCH
↓
CROSS UNDER THE ANNEX
↓
RE-ASCEND THROUGH VERIFICATION RISER
```

The route intentionally loses altitude in the middle.

---

# 3. Spatial signature

> **RIGHT VERTICAL RISE → LEFT CONTROL DROP → DEEP U-TRENCH CROSSING → RIGHT RE-ASCENT → UPPER-LEFT SIGN-OFF GATE**

Macro:

```text
FINAL / 5-7
←───────┐
        │ AEGIS GATE
        │
        │        ↑ RE-ASCENT
        │        │
        │        │
        └── U ───┘
           TRENCH
          ↓
     CONTROL DROP
          ↓
        JAM READ
          ↑
          │
      ENTRY RISE
```

This is not a diagonal ascent and not a hub detour.

---

# 4. Threat staging

## PHASE A — JAMMER READ / NEXT ROUTE

At P0 upper-right preview:
- two meaningful descent/transition Hardpoints visible
- Jammer visible
- current attached Hardpoint excluded from Jam target
- only one next candidate can be jammed

No Cutter active yet.
No AEGIS active yet.

Purpose:
re-establish next-route denial before current-Rope pressure arrives.

---

## PHASE B — CUTTER TRENCH / CURRENT ROPE

After the Jam decision, Player descends into the Credential Trench.

Cutter Sentry is placed across the trench so its projectile trajectory can intersect the current Rope segment.

Critical design rule:

> **Recovery is visible before committing to the vulnerable Rope.**

Player must see:
- current Rope anchor
- Cutter line
- recovery shelf below/behind
- next post-cut Hardpoint

Cutter:
- current Runtime Sentry family + `cutter-fire`
- projectile still aims at Player
- Rope cuts only if projectile trajectory intersects current Rope
- no fake “Cutter directly aims at Rope” behavior

No Jammer Active during the deepest Cutter beat.

Purpose:
cleanly teach current-Rope protection inside the same Stage.

---

## PHASE C — JAMMER + CUTTER HANDOFF WINDOW

At the end of the trench, a short **handoff window** combines the two concepts without making them fire simultaneously at maximum intensity.

Sequence:

```text
CUTTER TELEGRAPH / PROJECTILE PRESSURE
↓
PLAYER REACHES RE-ASCENT SAFE SHELF
↓
CUTTER ACTIVATION OUT
↓
JAMMER WARNING CAN BEGIN ON NEXT RISER CHOICE
```

So cognitively:

```text
CURRENT ROPE
→ SAFE SHELF
→ NEXT ROUTE
```

not:
`CUTTER PROJECTILE + ACTIVE JAM + AEGIS all at same instant`.

This is the Stage's central synthesis.

---

## PHASE D — AEGIS SIGN-OFF GATE

After full-safe Riser Top:
- Jammer out
- Cutter out
- one AEGIS only

The AEGIS protects the final Sign-off Gallery entrance.

This is not a new lesson.
It is a short confidence check:
- use vertical/reverse angle
- side/rear or bypass
- kill optional

Then all threat ends before Story.

---

# 5. Security count

```text
JAMMER ×1
CUTTER ×1
AEGIS ×1
```

But primary simultaneous cognitive pressure:

```text
≤ 1 special denial mechanic at full intensity
```

Staging prevents all three from overlapping.

Forbidden:
- Artillery
- Pursuit
- Patrol
- Standard Sentry
- extra Cutter
- extra Jammer
- kill gate

---

# 6. Jammer contract

Current Sector05 dynamic-surface contract:

- one automatically selected normal Rope surface per Jammer
- Warning → Active → Clear
- current attached surface is excluded
- attachment is not pre-blocked
- Active attachment starts one shock, cuts the new Rope and applies 25 damage over 0.5 seconds
- pulse-level network events are forbidden
- at least one Base-clear route remains
- death/disable clears Jam deterministically
- shared authoritative multiplayer state

---

# 7. Cutter contract

Current Runtime:

```text
canCutRope
=
rules.includes("cutter-fire")
```

Cutter projectile still targets Player.

Rope cut occurs only when projectile trajectory intersects the Rope.

Do not implement:
- homing-to-Rope projectile
- automatic Rope cut timer
- invisible cut zone

Expected cut consequence:
- Rope detach
- Rope disabled for current Runtime duration
- recovery / reattach required

---

# 8. Route

Entry rise:
[(720, -100), (720, -400), (720, -700), (720, -980)]

Jammer choice A:
[(720, -980), (430, -1120), (160, -1200)]

Jammer choice B:
[(720, -980), (520, -1260), (160, -1200)]

Control drop:
[(160, -1200), (-80, -1400), (-160, -1700), (-120, -1980)]

Credential trench:
[(-120, -1980), (180, -2100), (500, -2100), (800, -2000)]

Verification re-ascent:
[(800, -2000), (800, -1700), (800, -1400), (800, -1100)]

AEGIS gate:
[(800, -1100), (520, -950), (240, -850), (0, -720)]

Final:
[(0, -720), (-260, -600), (-260, -340), (-520, -220)]

Maximum intended relation:

**364.97px < 400px**

---

# 9. Recovery

## R1 — Jam Decision
below P0; returns before choice.

## R2 — Control Drop
mid-drop shelf.

## R3 — Cutter Trench
large recovery shelf clearly visible before vulnerable Rope.

## R4 — Re-ascent
below first riser Hardpoint.

## R5 — AEGIS Gate
safe lower ledge before final gate.

Target retry:
`≤5 sec`.

No recovery may skip `AUTHORIZATION 03/03`.

---

# 10. Story causality

5-4:
```text
CAPACITY
CRITICAL DEFICIT
```

5-5:
```text
UPPER CORE CONTROL
MAINTAIN

UPPER EVACUATION CAPACITY
MAINTAIN

GENERAL DISTRIBUTION
CAPACITY HOLD
```

5-6 now reveals:

```text
ROUTING AUTHORIZATION
03 / 03

INCIDENT RESPONSE
POST-CASCADE

LOWER ASCENT ROUTING
SUSPENSION AUTHORIZED
```

Meaning:

> Lower Ascent routing was not merely broken or automatically isolated.<br>
> Its suspension was an authorized post-incident response action.

---

# 11. Player Bark

After system text, full safe:

> **“…고장이 아니라, 멈추라고 승인한 거였네.”**

This is stronger than 5-5, but still does not claim:
- who exactly approved it
- Group C was intentionally sacrificed
- lower evacuation outcome
- company caused the accident

---

# 12. Exit / 5-7 handoff

```text
EVACUATION CONSEQUENCE ARCHIVE
POST-INCIDENT RECORDS
AHEAD
```

5-7 owns:
- actual lower-sector evacuation consequence
- outcome evidence

5-8 owns:
- organizational responsibility synthesis

---

# 13. High-input dialogue rule

No dialogue during:
- Jam Warning / Active
- Control Drop
- Cutter projectile / Rope cut
- Re-ascent
- AEGIS engagement

Authorization text + Bark occurs only after all security activation bands are out.

---

# 14. Uniqueness audit

## vs 5-1
5-1 = alternating diagonal ascent around monumental sealed cores.

5-6 = rise → deliberate descent → deep U-trench → re-ascent.

PASS.

## vs 5-2
5-2 = repeated local partition flank ascent.

5-6 = stacked annex with a major vertical loss and recovery climb.

PASS.

## vs 5-3
5-3 = central spine + symmetric bypass + lateral transfer + reverse return.

5-6 = one continuous U-shaped vertical compression route, not branch-return architecture.

PASS.

## vs 5-4
5-4 = horizontal island hopping then right Bus Riser.

5-6 = narrow stacked vertical/trench traversal.

PASS.

## vs 5-5
5-5 = central Hub → far-left detour → backside bridge → right ascent.

5-6 = no hub, no destination detour, no high cross-bridge; it descends under the Annex before rising again.

PASS.

---

# 15. Approval gate

Approve/revise:

1. rise → deliberate descent → U-trench → re-ascent macro
2. Jammer only at first choice
3. Cutter owns trench
4. no maximum-intensity Jammer+Cutter overlap
5. AEGIS only as short final gate
6. Authorization 03/03 wording
7. Bark


---

# REV1.1 COORDINATE CORRECTION

# 5-6 REV1.1 COORDINATE DIRECTION PATCH

> Status: GEOMETRY CORRECTION · STORY / MECHANIC AUTHORITY UNCHANGED

The approved REV1 concept remains:

```text
RISE
→ DELIBERATE DROP
→ LOWER CREDENTIAL TRENCH
→ RE-ASCENT
→ AEGIS GATE
→ AUTHORIZATION RECORD
```

REV1 SVG used increasingly negative Y values during the section labeled `CONTROL DROP`.

Because SVG Y increases downward, that made the displayed route rise instead of fall.

REV1.1 corrects only the geometry direction.

Correct route:

Entry rise:
[(720, -100), (720, -400), (720, -700), (720, -980)]

Jammer choices:
A [(720, -980), (430, -1120), (160, -1080)]
B [(720, -980), (500, -1230), (160, -1080)]

Actual visual drop:
[(160, -1080), (-80, -900), (-160, -650), (-120, -420)]

Lower trench:
[(-120, -420), (180, -360), (500, -360), (800, -420)]

Re-ascent:
[(800, -420), (800, -720), (800, -1020), (800, -1320)]

AEGIS gate:
[(800, -1320), (520, -1480), (240, -1580), (0, -1700)]

Final:
[(0, -1700), (-260, -1840), (-260, -2080), (-520, -2200)]

Max relation:
**371.62px < 400px**

No change to:
- Jammer → Cutter → AEGIS staging
- threat overlap rules
- Authorization 03/03
- Bark
- story boundary.


User approved the corrected flow and requested progression/package generation on 2026-08-21 KST.
