# ONE ROPE — SECTOR 04-2 RESIDENT COURTYARD — REV1.0

> Status: **DESIGN LOCKED — FULL PACKAGE**
> Sector04 Master: **UPPER RESIDENTIAL / AMENITY DISTRICT**
> Theme: **PRIVILEGE IS PROTECTED**
> Authoring snapshot: `4551798860193a16e53814aae5c3a42022b4e1cf`
> 4-1 handoff: **UPPER RESIDENTIAL ARRIVAL — DESIGN LOCKED**
> Legacy current Runtime 4-2: **CUTTER LINE — SUPERSEDED FOR NEW AUTHORING**
> New 4-2 Runtime: **NOT IMPLEMENTED**
> Resident Security Override 2-of-3: **DESIGN LOCKED / RUNTIME NOT IMPLEMENTED**

---

# 0. CANONICAL WORKING IDENTITY

## Name

**4-2 RESIDENT COURTYARD**

## Stage Role

> **FIRST LIMITED PURSUIT + RESIDENT SECURITY OVERRIDE A**

4-1:
`MOVING SECURITY EXISTS`

4-2:
> **“이 경비는 나를 따라온다. 하지만 보호구역 전체를 무한히 쫓는 것은 아니다.”**

4-3:
`FIRST FULL PERSISTENT PURSUIT`

4-2는 Pursuit를 완성형으로 쓰지 않는다.
명확한 한 개 Territory에서 추적을 경험하고,
건축적 경계를 넘어가면 추격이 끊기는 것을 배운다.

---

# 1. VERIFIED CURRENT RUNTIME

Latest main:
`4551798860193a16e53814aae5c3a42022b4e1cf`

## Legacy 4-2

Current `sector-04-02` is:

```text
CUTTER LINE
FIRST ROPE INTERRUPTION
1280×1312
Cutter Sentry
```

This is legacy Transit Sector04 and is **SUPERSEDED**.

## Pursuit Runtime

Current `pursuit-drone-t1`:
- direct-player pursuit
- default moveSpeed `160`
- acquireRange `640`
- triggerDistance `96`
- windup `0.25s`
- dashSpeed `640`
- dash `0.2s`
- recovery `0.5s`
- activation region constrains eligible target and movement

Therefore 4-2 can author:

> **one bounded Pursuit Territory**

without inventing a new AI state.

---

# 2. MAP SCALE

Target:

> **4480×2112**

Bounds:
- X `-2240..+2240`
- Y `0..-2112`

4-1:
`4992×2112`

4-2 intentionally compresses width slightly because:
- 4-1's role was huge spatial contrast,
- 4-2's role is denser protected Courtyard security,
- Sector04 scale growth is an average/perceived rule, not mandatory monotonic growth every Stage.

Actual route X span:
**3968px / 88.6% of width**

The Stage still uses a large upper-residential footprint.

---

# 3. SPATIAL SIGNATURE

> **DOUBLE-CRESCENT COURTYARD / PURSUIT ARC → INTERIOR CUT-THROUGH → SAFE OVERRIDE VESTIBULE**

Not a full courtyard orbit.

Not a rim.

Not a central death void.

Macro:

```text
HIGH LEFT ENTRY
      ↓
M0 COURTYARD OVERLOOK
      ↓
OUTER CRESCENT
  ↘ → → → ↗

[ PURSUIT TERRITORY ]

             ↘
       INTERIOR ARCADE CUT
             ↓
          R1 LOW
             ↗
       INNER VESTIBULE
             ↓
      PURSUIT BREAKS

      OVERRIDE A
             ↓
      UPPER-RIGHT EXIT
```

Dominant movement:

> **`↘ CURVE → RIGHT ARC → DOWN-IN CUT → ↗ SAFE VESTIBULE → ↗ EXIT`**

The architectural trick is the **cut-through**:
Player does not finish a circle around the Courtyard.
They escape the Pursuit by leaving the exposed garden ring and cutting through a residential arcade.

---

# 4. ENTRY / M0

Entry:
`(-1984,-256)`

A1:
`(-1696,-384)`

M0:
`(-1408,-480)`

M0:
**FULL SAFE**

Player sees:
- private resident courtyard below,
- Pursuit Drone stationed far enough away to read,
- outer crescent route,
- interior arcade opening on the far side,
- Override Vestibule not yet readable as reward.

Story:

```text
RESIDENT COURTYARD
SECURITY CONTROL / ACTIVE
```

No Bark.

4-1 already owns the emotional line about normal operation.
4-2 should move quickly into Gameplay.

---

# 5. OUTER CRESCENT — PURSUIT INTRODUCTION

Path:

```text
C1 (-1120,-640)
C2 (-800,-736)
C3 (-448,-800)
C4 (-96,-736)
C5 (+256,-640)
C6 (+576,-512)
```

This is a **single broad exposed crescent**.

At C1/C2:
Pursuit acquires Player.

## Enemy

Exactly:

> **Pursuit Drone ×1**

No Patrol companion.
No Sentry.
No Cutter.

Purpose:
Player should clearly attribute all pressure to one chasing actor.

## Pursuit Territory

Candidate activation:

```text
x ≈ -1280..+720
y ≈ -920..-400
```

The Pursuit:
- can follow Player across C1→C6,
- cannot follow through the Interior Arcade cut,
- cannot pressure M0,
- cannot enter Safe Override Vestibule.

The Player must see the Territory exit before the chase peaks.

---

# 6. PURSUIT LESSON

The intended learning loop:

```text
DRONE ACQUIRES
↓
PLAYER MOVES
↓
DRONE CLOSES DISTANCE
↓
WINDUP / DASH
↓
PLAYER CHANGES ROPE ARC / HEIGHT
↓
REACHES ARCADE CUT
↓
Pursuit loses eligible target
↓
CONTACT BREAK
```

No tutorial pop-up that explains numbers.

System may briefly show:

```text
RESIDENTIAL SECURITY
TRACKING
```

when acquire begins.

Then when Player crosses into the cut-through:

```text
SECURITY CONTACT
LOST
```

This is a candidate presentation, not a new Gameplay mechanic.

---

# 7. INTERIOR ARCADE CUT-THROUGH

From C6:

CUT1:
`(+832,-704)`

Then drop inward/down to:

R1:
`(+640,-992)`

Then:

CUT2:
`(+896,-1248)`

This creates a strong **depth change**:
open Courtyard ring → narrow shaded interior arcade.

Why it matters:
- Pursuit is broken by architecture,
- map does not become a full orbit,
- Player experiences Security Territory as spatially authored,
- failure direction changes from outer exposed crescent to lower interior recovery.

R1:
recovery-capable.

No enemy acquire here.

---

# 8. SAFE OVERRIDE VESTIBULE

V0:
`(+1184,-1408)`

Override Deck:
around `(+1456,-1504)`

This is **FULL SAFE**.

No Pursuit acquire.
No projectile.
No hidden damage.
No invulnerability required.

The Player first gets 0.8–1.2 sec of calm.

Then Story/interaction:

```text
RESIDENT SECURITY OVERRIDE
SOURCE A
```

Upon interaction:

```text
RESIDENT SECURITY OVERRIDE
ACQUIRED
```

Optional small local status:

```text
OVERRIDE SOURCE
A / 3
```

Important:
Do **not** explain `2 OF 3 REQUIRED` here unless the progression UI needs it.

The strategic quorum is better discovered later / at 4-8,
while each source remains individually understandable.

---

# 9. OVERRIDE A CONTRACT

Status:

> **DESIGN LOCKED / RUNTIME NOT IMPLEMENTED**

4-2 owns Source A.

Source B:
4-5.

Source C:
4-7.

Sector requirement:
2 of 3.

4-2 local exit:
> **must NOT require acquiring A**

Why:
If each source's own Stage exit forces collection,
the supposed 2-of-3 choice becomes fake.

Therefore Player can:
- pass through 4-2 without A,
- later use B+C,
- or backtrack depending final progression contract.

Override A should be:
- clearly visible,
- safe to interact,
- optional for local Stage completion.

This is a crucial design lock.

---

# 10. EXIT

After Override Vestibule:

A7:
`(+1728,-1696)`

Exit:
`(+1984,-1856)`

Preview:

```text
RESIDENTIAL SKYBRIDGE
SECURITY PATROL
```

Do not say:
`FULL PURSUIT`

4-3 should reveal the escalation through play.

---

# 11. ENEMY / MECHANIC LOCK

Exactly:

- Pursuit Drone ×1

No:
- Patrol
- Cutter
- Scanner
- Wind
- Shield
- Support
- Artillery
- Swarm
- kill gate
- Augment Node

Override A:
present, optional for local exit.

---

# 12. FAILURE DIRECTION

The exposed crescent sits above/along a recoverable lower Courtyard edge.

If Player misses:
- do not drop to instant-death pit,
- land on one of a small number of lower recovery ledges,
- recover into the Arcade Cut or back to exposed ring.

Retry target:
**4–7 sec**

Pursuit should not remain permanently glued to a Player on the recovery deck if that deck is outside its activation territory.

---

# 13. CAMERA

## M0

Frame:
- Player,
- crescent route,
- Pursuit Drone,
- distant arcade opening.

## Pursuit

Frame:
- Player,
- Pursuit Drone,
- next Rope anchor,
- at least partial view of Territory escape direction.

Never frame only the enemy.

## Cut-through

Camera compresses slightly to communicate:
`outside chase → inside break`.

## Override

Frame:
- Player,
- Override terminal,
- next exit direction.

Pursuit not visible/acquiring.

---

# 14. STORY FUNCTION

Emotion:

> **PROTECTION**

4-1:
“여긴 아직 다 돌아가고 있네.”

4-2:
> “그 정상적인 생활환경을 실제 Security가 적극적으로 보호하고 있다.”

But Player does not yet conclude:
- who is being protected,
- who is excluded,
- why C stopped.

No villain exposition.

---

# 15. STORY BEATS

## Beat A — M0

```text
RESIDENT COURTYARD
SECURITY CONTROL / ACTIVE
```

## Beat B — Acquire

Candidate:

```text
RESIDENTIAL SECURITY
TRACKING
```

## Beat C — Contact Break

Candidate:

```text
SECURITY CONTACT
LOST
```

## Beat D — Override

```text
RESIDENT SECURITY OVERRIDE
SOURCE A
```

Interact:

```text
RESIDENT SECURITY OVERRIDE
ACQUIRED
```

No Player Bark required in REV1.

---

# 16. MAP SIMILARITY

## vs 4-1

4-1:
high entry → descend → low Basin crossing → mid loop Patrol → far-side ascent.

4-2:
safe overlook → exposed crescent Pursuit → interior cut-through → safe Override vestibule.

Overlap:
upper residential environment only.

**1 / PASS**

## vs 2-6

2-6:
short up → reveal turn → long upper rim → late security.

4-2:
curved chase → interior depth cut → safe reward.

Overlap:
courtyard/residential vocabulary only.

**1 / PASS**

## vs 3-7

3-7:
three-way cost-profile choice.

4-2:
single chase route with architectural escape.

**0 / PASS**

## vs 3-8

3-8:
repeated Free-Weave safe-hub decisions.

4-2:
one bounded chase territory.

Overlap:
security-driven movement only.

**1 / PASS**

## vs planned 4-3

4-3:
full Persistent Pursuit across interlocked skybridges with handoff/extended chase.

4-2:
one short bounded pursuit territory and guaranteed contact break.

Overlap:
Pursuit.

**1 / PASS CANDIDATE**

---

# 17. SCALE / SIMILARITY / FUNCTION GATES

MAP SCALE:
> **PASS CANDIDATE — 4480×2112**

MAP SIMILARITY:
> **PASS CANDIDATE — max overlap 1**

OBSTACLE FUNCTION:
> **PASS CANDIDATE**
> Crescent exposes Player; Arcade physically breaks pursuit.

STAGE LENGTH:
> **PASS CANDIDATE**
> First `2:20–3:15`
> Mastered `1:05–1:40`

CURRENT RUNTIME:
> **PASS WITH MAJOR RE-AUTHOR**
> Pursuit Runtime verified.
> Override 2-of-3 not implemented.

STORY:
> **PASS CANDIDATE**
> Protection shown through active chase, not exposition.

---

# 18. REDESIGN CONDITIONS

Redesign if:
- Player completes a full courtyard orbit,
- map reads like 2-6 rim traversal,
- Pursuit can enter Override Vestibule,
- Pursuit starts at Entry before Player reads it,
- Pursuit is effectively Stage-wide infinite aggro,
- Override A is required to leave 4-2,
- 2-of-3 is revealed but not actually supported,
- another enemy overlaps the tutorial Pursuit,
- kill is required,
- cut-through is decorative and does not break pursuit,
- mandatory Rope link >400px.

---

# 19. APPROVAL SUMMARY

```text
4-2 RESIDENT COURTYARD
REV1 DRAFT

4480×2112

ENTRY
↓
M0 FULL SAFE

RESIDENT COURTYARD
SECURITY CONTROL / ACTIVE

↓
EXPOSED OUTER CRESCENT
↓
PURSUIT DRONE ×1
LIMITED TERRITORY

RESIDENTIAL SECURITY
TRACKING

↘
INTERIOR ARCADE CUT-THROUGH
↓
CONTACT BREAK

SECURITY CONTACT
LOST

↓
SAFE OVERRIDE VESTIBULE

RESIDENT SECURITY OVERRIDE
SOURCE A

INTERACT
↓
ACQUIRED

↓
4-3 RESIDENTIAL SKYBRIDGE

NO PATROL COMPANION
NO CUTTER
NO SCANNER
NO WIND
NO AUGMENT
NO KILL GATE

OVERRIDE A
OPTIONAL FOR LOCAL 4-2 EXIT

DESIGN LOCKED
```

## Mandatory Rope Audit
- `ENTRY→A1` = `315.16px`
- `A1→M0` = `303.58px`
- `M0→C1` = `329.46px`
- `C1→C2` = `334.09px`
- `C2→C3` = `357.77px`
- `C3→C4` = `357.77px`
- `C4→C5` = `364.86px`
- `C5→C6` = `344.65px`
- `C6→CUT1` = `320.00px`
- `CUT1→R1` = `346.13px`
- `R1→CUT2` = `362.04px`
- `CUT2→V0` = `329.46px`
- `V0→OVR` = `288.44px`
- `OVR→A7` = `332.94px`
- `A7→EXIT` = `301.89px`

**Max mandatory Rope link = 364.86px / PASS ≤400px**

---

# 20. SECTOR PROGRESSION / KEY STRUCTURE — REQUIRED GATE

This Stage is part of Sector04's persistent cross-Stage progression.

```text
4-2  RESIDENT SECURITY OVERRIDE A
4-5  RESIDENT SECURITY OVERRIDE B
4-7  RESIDENT SECURITY OVERRIDE C

Sector04 requirement:
2 OF 3
```

Critical rule:

> **4-2 local exit MUST NOT require Override A.**

Otherwise Sector04 would become a disguised 3-of-3 sequence.

Valid eventual Sector04 completion combinations:

```text
A + B
A + C
B + C
A + B + C
```

4-8 owns the final quorum check.

This is distinct from current Sector01~03 Runtime, which uses Access Module 3-of-3.

Sector04 2-of-3 is **DESIGN LOCKED / RUNTIME NOT IMPLEMENTED**.

See:
`../SECTOR-PROGRESSION-KEY-CONTRACT.md`

---

# 21. FINAL AUTHORING AUTHORITY

README = WHY / PLAYER EXPERIENCE<br>
AREA-SPEC-REV1-DESIGN.json = WHERE / WHAT<br>
DIRECTION-SPEC.json = WHEN / HOW<br>
SECTOR-PROGRESSION-KEY-CONTRACT.md = CROSS-STAGE KEY / QUORUM RULE<br>
RUNTIME-HANDOFF.md = REQUIRED IMPLEMENTATION DELTA<br>
VALIDATION.md = RELEASE GATES
