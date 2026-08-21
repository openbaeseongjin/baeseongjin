# ONE ROPE — SECTOR 06-6 BEACON SPAN — REV2.2 APPROVED

> Status: **USER APPROVED DIRECTION · PRE-PACKAGE QA PASSED · DESIGN LOCKED · NOT IMPLEMENTED**
> Authoring snapshot: `8b344f0f7a2309bfb316655668ed180718db7781`
> Role: PATROL MASTERY RECALL / SUSTAINED CANTILEVER COMBAT / POSITION → FIRING ORIGIN

---

# 0. REV2.2 packaging correction

REV2.1 correctly increased the combat span from 3 beats to 5 beats.

Pre-package QA found two Base-Reach bypasses:

```text
H1 → H2
could bypass P1 Safe Preview

H4 → H6
could bypass H5
```

REV2.2 adjusts authored coordinates only.

Mandatory flow is now protected:

```text
P0 → H1 → P1
→ H2 → H3 → H4 → H5 → H6
→ P2 → H7 → P3
```

---

# 1. Spatial identity

> **BEACON NEEDLE → LONG CANTILEVER CROSSING → UPPER BEACON RISE**

Macro:

```text
                       DISTANT PAD03
                              △

                         P3 EXIT
                           ↑
                           ↑
                    RIGHT BEACON
                           ↑
                           ↑
LEFT BEACON ─ H2 ─ H3 ─ H4 ─ H5 ─ H6
    ↑
    ↑
 P1 SAFE
    ↑
  ENTRY
```

Primary axis:

> **UP → RIGHT → UP**

No mandatory descent.

---

# 2. Runtime contract

Latest checked main:

`8b344f0f7a2309bfb316655668ed180718db7781`

Current Rope:

```text
hookSpeed              1200
hookFlightRatio        1 / 3 sec
Derived Hook Reach     400 px
hookReloadSeconds      0.5
attachBufferSeconds    0.1
swingImpulse           780
releaseAngularTransfer 0.55
```

Current Combat:

```text
Enemy Attack Range     760
Acquire                0.25 sec
Track                  0.80 sec
Lock                   0.20 sec
Fire Interval          1.00 sec
Projectile Speed       520
Projectile Damage      20
```

Current Patrol:

```text
NO VALID TARGET
→ advance patrol

VALID TARGET
→ patrol does not advance
→ current position becomes firing origin
```

No new AI is invented.

---

# 3. Difficulty / map-size gate

```text
Difficulty        ★★★★
First Play        120–170 sec
Skilled           50–70 sec

Mandatory links   10
Route length      2439.03px
Vertical gain     1600px
Max link          290.69px < 400px
```

Difficulty source:

> **SUSTAINED EXPOSURE + FIRING-ORIGIN READ**

not oversized travel.

---

# 4. Final coordinates

```text
P0  (-520,  -80) ENTRY
H1  (-520, -300)
P1  (-520, -500) SAFE PATROL PREVIEW

H2  (-260, -630)
H3  ( -40, -660)
H4  ( 180, -700)
H5  ( 400, -750)
H6  ( 620, -880)

P2  ( 620,-1160) FULL SAFE
H7  ( 640,-1420)
P3  ( 660,-1680) EXIT
```

Adjacent distances:

`220.0, 200.0, 290.69, 222.04, 223.61, 225.61, 255.54, 280.0, 260.77, 260.77`

---

# 5. Mandatory anti-skip proof

```text
H1 → H2    420.12px > 400
P1 → H3    505.96px > 400

H2 → H4    445.53px > 400
H3 → H5    449.11px > 400
H4 → H6    475.39px > 400
H5 → P2    465.3px > 400
```

Therefore:
- P1 preview cannot be skipped by Base Reach.
- all five combat beats H2–H6 are individually required.
- P2 Full Safe cannot be reached before H6.

---

# 6. Patrol

D1:

```text
Patrol Drone T1 ×1
mode        pingpong
speed       48
wait        0.45 sec

A (+420,-600)
B (-100,-870)
```

Patrol path length:

**585.92px**

Rules:
- standard projectile
- no `cutter-fire`
- no Rope Cut
- kill optional.

Any patrol position must be clearable.

No mandatory endpoint waiting.

---

# 7. Recovery

Two small local brackets only.

## R0 EARLY
```text
(-180,-480)
```

```text
R0 → H2  170.0px
R0 → H3  228.04px
R0 → H4  421.9px > 400
```

## R1 LATE
```text
(+360,-500)
```

```text
R1 → H4  269.07px
R1 → H5  253.18px
R1 → H6  460.43px > 400
```

Both:
- landing-only
- non-grappleable
- Activation OUT
- disconnected
- recovery target ≤5 sec.

No continuous lower layer.

---

# 8. Sector06 concept alignment

Sector06 promise:

> **THE GOAL IS VISIBLE; THE ROOM IS GONE.**

6-6 therefore keeps:

```text
DISTANT ROOFTOP PAD 03
VISIBLE
OUTSIDE CURRENT STAGE BOUNDS
```

It remains small and distant.

No new Pad story reveal.

Architecture remains:

> **two Beacon Needles connected by one exposed Cantilever**

This uses Sector06's:
- Open Sky
- Beacon Frame
- Mast
- Structural Island

language.

---

# 9. Story

Entry:

```text
BEACON SPAN
PAD APPROACH SIGNAL / ACTIVE
```

P2:

```text
PAD 03 BEACON
APPROACH LINK / ACTIVE
```

Exit:

```text
CONTAINMENT LATTICE
SECURITY / ACTIVE
```

No Player Bark during combat.

No:
- ACCESS DENIED
- CONTAINMENT VIOLATION
- Final Security reveal
- Shuttle boarding.

---

# 10. Difficulty curve

```text
6-4  ★☆☆☆   REST / GOAL
6-5  ★★★★   SCANNER TIMING
6-6  ★★★★   PATROL + SUSTAINED BODY PATH
6-7  ★★★★☆  CUTTER / RECOVERY
6-8          MOVEMENT CLIMAX
```

6-6 is sustained danger.

6-7 still owns the stronger failure/recovery climax.

---

# 11. QA result

| Check | Result |
|---|---|
| Latest main | PASS |
| Current Hook Reach 400px | PASS |
| All mandatory adjacent links <400px | PASS |
| P1 Preview cannot be skipped | PASS |
| H2–H6 five combat beats cannot be skipped by every-other Base Reach | PASS |
| Continuous ascent | PASS |
| Patrol Runtime alignment | PASS |
| One Patrol only | PASS |
| No Rope Cut | PASS |
| R0/R1 local recovery only | PASS |
| Recovery cannot skip to later band | PASS |
| Pad03 visible continuity | PASS |
| 6-5 distinction | PASS |
| 6-7 distinction | PASS |
| Story boundary | PASS |
| Runtime physical clear | REQUIRED AFTER IMPLEMENTATION |

---

# 12. Runtime validation required

Do not claim before graybox:

- all Patrol A↔B positions are comfortably clearable
- 120–170 sec first-play timing
- 50–70 sec skilled timing
- R0/R1 return ≤5 sec
- actual shot count during H2–H6
- camera shows full patrol preview and distant Pad03 simultaneously
