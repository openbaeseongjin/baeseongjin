# ONE ROPE — SECTOR 06-8 ROOFTOP PAD 03 — REV3 FINAL CROWN WEAVE

> Status: **HYPOTHESIS — USER APPROVAL REQUIRED**
> Baseline checked: `8b344f0f7a2309bfb316655668ed180718db7781`
> Role: 48TH GENERAL STAGE / THREAT-FREE MOVEMENT CLIMAX / PHYSICAL ARRIVAL / ACCESS DENIAL

---

# 0. Why REV3

REV2 was structurally correct but too simple.

Problem:

```text
FINAL MAST
→ two simple Lighting Frames
→ simple Pad approach
```

It reduced:

> **NO ACTIVE THREAT**

into:

> **LOW SPATIAL COMPLEXITY**

Those are not the same thing.

6-8 must remove combat pressure while preserving a final-stage feeling through:
- richer rooftop Crown architecture
- varied Rope arc shapes
- multiple height bands
- a clearly staged physical approach to Pad03.

REV3 therefore becomes:

> **FINAL CROWN WEAVE**

---

# 1. New spatial identity

> **FINAL MAST → CROWN RIB A → LIGHTING BRIDGE → CROWN RIB B → SERVICE GANTRY → PAD RING ASCENT → ACCESS SPUR**

Macro:

```text
ENTRY
  ↗
FINAL MAST
  ↑
  ╲
CROWN RIB A
      ╲
       APEX ───── LIGHTING BRIDGE
                       ╲
                        CROWN RIB B
                              ─── SERVICE GANTRY
                                      ╲
                                       PAD RING LOWER
                                            ╲
                                             PAD RING UPPER
                                                  ─ PAD PERIMETER
                                                       ╲
                                                        ACCESS SPUR
                                                             ╲
                                                              CONSOLE
```

Main route rules:

```text
X NEVER DECREASES
Y NEVER DESCENDS
NO DIRECTION REVERSAL
NO FLAT RUNWAY
```

The route is more complex without becoming a zig-zag backtrack.

---

# 2. Movement identity

Each architectural section asks for a different Rope shape.

## A. FINAL MAST

```text
P0 → H1 → H2
```

Short vertical compression.

Purpose:
- 6-7 combat pressure ends
- camera opens
- Pad becomes dominant.

---

## B. CROWN RIB A

```text
H2 → H3 → H4
```

Wide diagonal into a high apex.

Movement:
- longer body arc
- vertical momentum conversion.

---

## C. SUSPENDED LIGHTING BRIDGE

```text
H4 → H5
```

A nearly horizontal release-transfer beat.

No floor-route substitute.

---

## D. CROWN RIB B

```text
H5 → H6
```

Second rising structural arc.

This is not symmetric with Rib A:
- different span
- different elevation
- directly aims at Pad approach.

---

## E. SERVICE GANTRY

```text
H6 → P1
```

Short controlled landing.

This is the single intentional pacing breath before the final Pad structure.

System:

```text
MAINTENANCE SHUTTLE
STANDBY
```

---

## F. PAD RING ASCENT

```text
P1 → H7 → H8 → P2
```

Player moves around the outside of Pad03's actual perimeter ring.

This is the key REV3 addition.

The player no longer simply approaches a platform.

They physically:

> **CLIMB ONTO THE PAD STRUCTURE**

---

## G. ACCESS SPUR

```text
P2 → H9 → P3
```

Final two Rope inputs.

Shuttle is now immediately adjacent.

---

# 3. Route coordinates

```text
P0  (-760, -100) ENTRY
H1  (-540, -250) FINAL MAST LOWER
H2  (-430, -520) FINAL MAST CROWN

H3  (-120, -560) CROWN RIB A
H4  ( 100, -760) RIB APEX
H5  ( 390, -780) LIGHTING BRIDGE

H6  ( 650, -940) CROWN RIB B
P1  ( 900, -940) SERVICE GANTRY

H7  (1080,-1130) PAD RING LOWER
H8  (1260,-1280) PAD RING UPPER
P2  (1450,-1370) PAD PERIMETER

H9  (1600,-1520) ACCESS SPUR
P3  (1750,-1670) ACCESS DECK / CONSOLE
```

Adjacent distances:

`266.27, 291.55, 312.57, 297.32, 290.69, 305.29, 250.0, 261.73, 234.31, 210.24, 212.13, 212.13`

Metrics:

```text
Mandatory links      12
Route length         3144.23px
Net vertical gain    1570px
Max link             312.57px < 400px
Non-adjacent skips   0
```

---

# 4. Difficulty / pacing

Active threat:

```text
Enemy       0
Wind        0
Scanner     0
Cutter      0
Patrol      0
Damage      0
```

But movement is not trivial.

Target:

```text
Movement Difficulty  ★★★★☆
Failure Punishment   ★★☆☆☆
Narrative Tension    ★★★★★
```

Why movement difficulty rises vs REV2:
- 12 mandatory links
- three different swing geometries
- vertical-to-horizontal momentum conversion
- actual Pad Ring ascent
- no walk-only finale.

Target playtime:

```text
First Play   105–145 sec
Skilled      40–55 sec
```

Still clearly less punishing than 6-7.

---

# 5. Recovery architecture

No instant-death sky.

Three small safety lips.

## R1 — Crown Recovery

```text
(-40,-350)
```

Reach:
```text
{"H3": 224.72}
```

Returns to H3 only.

## R2 — Lighting Recovery

```text
(+500,-600)
```

Reach:
```text
{"H5": 210.95, "H6": 371.62}
```

Returns to the current Crown/Lighting band only.

## R3 — Pad Ring Recovery

```text
(+1350,-950)
```

Reach:
```text
{"H7": 324.5, "H8": 342.05}
```

Returns to H7/H8 only.

All:
- landing-only
- non-grappleable
- disconnected.

No continuous safety floor.

---

# 6. Pad visual progression

Pad03 must not simply sit at the far right like a static icon.

Camera / composition progression:

```text
P0
Pad03 occupies ~15–20% of destination side

H4
Pad03 becomes the primary background mass

P1
Pad ring and Shuttle become individually readable

H7/H8
Player crosses in front of / onto Pad perimeter structure

P2
Pad fills the destination side of the gameplay frame

P3
Shuttle is immediately adjacent
```

Visual movement:

> **LOOK AT PAD → APPROACH PAD → CLIMB PAD → STAND ON PAD**

---

# 7. Story

## S0 — ENTRY

```text
ROOFTOP PAD 03
FINAL APPROACH / OPEN
```

No Bark.

---

## S1 — P1 SERVICE GANTRY

```text
MAINTENANCE SHUTTLE
STANDBY
```

The route is real.
The vehicle is real.

---

## S2 — PAD RING

No text.

The physical act of climbing the Pad is the story.

---

## S3 — P2 PAD PERIMETER

```text
ROOFTOP PAD 03
PERIMETER / REACHED
```

---

## S4 — P3 ACCESS DECK

```text
PAD ACCESS
AVAILABLE FOR REQUEST
```

Existing Interact.

Then:

```text
ROOFTOP PAD 03
ACCESS DENIED
CONTAINMENT VIOLATION
```

After the system message:

> **“…여기까지 왔는데.”**

No further exposition.

---

# 8. Final boundary

6-8 ends here.

```text
GENERAL PROGRESSION
COMPLETE

ESCAPE
NOT COMPLETE
```

Next content:

> **POST-SECTOR06 FINAL SECURITY ENCOUNTER**

6-8 does NOT define:
- boss identity
- boss HP
- phases
- exact unlock method
- boarding logic.

---

# 9. Cross-stage distinction

## 6-6
Two vertical Beacon structures + one long exposed Cantilever + Patrol.

## 6-7
Three stacked vertical Lattice Bays + Cutter + Recovery.

## 6-8 REV3
Large Crown ribs + suspended Lighting Bridge + physical Pad Ring ascent + no threat.

Distinct silhouette:
**PASS**

Distinct gameplay:
**PASS**

---

# 10. Final-stage feeling

6-8 is not the hardest general Stage.

6-7 already owns that role.

6-8 instead becomes:

> **THE MOST COMPOSED MOVEMENT STAGE**

The climax is:
- uninterrupted Rope rhythm
- changing architectural scale
- Pad getting closer
- physically stepping onto the destination.

---

# 11. Forbidden

- Enemy
- Wind
- Scanner
- Cutter
- Patrol
- moving platform
- route fork
- direction reversal
- mandatory descent
- blind leap
- giant flat rooftop
- walk-only finish
- new Rope mode
- new Input
- final boss inside 6-8
- boarding before Final Security
- access granted before Final Security.

---

# 12. Approval gate

Check visually:

1. Final Crown architecture is rich enough for the last general Stage.
2. Route feels varied even with zero threats.
3. Main macro still clearly climbs toward Pad03.
4. Pad Ring ascent feels like physically entering the destination.
5. No section looks like a repeat of 6-6 Cantilever or 6-7 Lattice.
6. Access denial lands only after the player stands beside the Shuttle.
