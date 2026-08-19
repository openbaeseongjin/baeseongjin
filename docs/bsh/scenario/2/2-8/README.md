# ONE ROPE — SECTOR 02-8 EVACUATION PLATFORM — REV8 DRAFT REV2

> Status: DESIGN LOCKED
> Runtime audit baseline: `4fce8a27bc6cb7b4141735dec6c8e56cb9f88b5b`
> REV1: HOLD — too linear / too simple for Sector Finale
> Proposed REV2: **`2304×1408`**
> Spatial Signature: **BROKEN TRANSFER FAN / HUB → DEAD BOARDING LIP → SUSPENDED RING → UPPER DEPARTURE ARM**
> Dominant body:
> **`LONG ↗ ARRIVAL → SHORT → DEAD END → CONTROLLED DROP → LONG ↖ DEPARTURE → FINAL CONTROL`**
> Full package: CREATED — REV8.0 GITHUB-READY

---

# 0. WHY REV1 IS NOT ENOUGH

REV1 passed similarity because it was intentionally simple:

`↗ → one turn → ↖`

But that created a different failure:

- four enemy slots were arranged on one obvious path
- no meaningful spatial surprise after entering the platform
- no memorable central structure
- the Finale looked like a long corridor bent once
- the map did not visually communicate “Sector 02's largest public transfer infrastructure”

Therefore:

**REV1 = HOLD / SUPERSEDED CANDIDATE**

REV2 adds complexity through:
- actual architecture
- elevation change
- a false public continuation that physically terminates
- a central suspended transfer layer
- a long second departure arm
- recoveries at multiple elevations

It does **not** add:
- a fifth enemy
- new mechanics
- Stage-scale route choice
- multi-route braid
- mandatory Access dependency

---

# 1. RUNTIME AUTHORITY — KEEP

Current authority remains:
- 4 enemy slots exactly
  - Patrol A
  - Patrol B
  - Lower Late Guard
  - Upper Late Guard
- no Boss
- no Wind
- no Rope Cut
- Transfer Control Story
- Sector-end Checkpoint
- `nextAreaId: null`
- `content-boundary`
- A/B/C/Priority sequence exact
- 3-of-3 Access is NOT currently a direct 2-8 Area-gate requirement

No Runtime authority is changed by this revision.

---

# 2. NEW FINAL SILHOUETTE

## BROKEN TRANSFER FAN

```text
                         FINAL CONTROL / CHECKPOINT
                               ███████
                                  ▲
                               G9 ●
                                 ↗
                       UPPER GUARD
                            ●
                          ↖
                      G8 ●
                    ↖
               G7 ●
             ↖
        Patrol B crossing band
            ↖
        G6 ●
          ▲
          │  launch out of ring
          │
     ┌──────────────┐
     │ SUSPENDED    │
     │ TRANSFER RING│
     └──────────────┘
             ▲
             │ controlled drop
             ● G5
            /
      DEAD BOARDING LIP
               ● G4
              /
        LOWER GUARD
             ●
           /
       CENTRAL HUB
          ● G3
        ↗
     G2 ●
   ↗
 G1 ●
↗
ENTRY
   Patrol A follows arrival arm
```

The important spatial beat:

> Player thinks the public Boarding Finger continues upward through the Hub.

But the right-side Boarding Lip is physically dead.

Instead of another gate override,
the Player drops into a **lower suspended transfer ring**,
crosses underneath the main public deck,
then launches into the **opposite upper departure arm**.

This creates a Finale-scale spatial memory.

---

# 3. SCALE

Target:
**`2304×1408`**

Local:
- X `-1152..+1152`
- Y `0..-1408`

Reason:
- needs three visually distinct height layers
- arrival arm
- suspended ring
- upper departure arm
- final control apron

The map is wider and layered,
not simply taller.

---

# 4. STAGE BODY

```text
PHASE A
ENTRY
→ Arrival Finger
→ Patrol A
→ Central Hub
→ Lower Guard

PHASE B
→ Dead Boarding Lip
→ controlled Drop
→ Suspended Transfer Ring
→ full relief

PHASE C
→ launch from Ring
→ Patrol B
→ Upper Departure Arm
→ Upper Guard

PHASE D
→ Final Control
→ A/B/C/Priority Story
→ Checkpoint
```

One mandatory authored route.

No Safe / Flow / Build lanes.

---

# 5. ENTRY / ARRIVAL FINGER

Entry:
`(-960,-32)`

P0:
center `(-928,0)`, W320.

G1:
`(-768,-224)`

G2:
`(-448,-384)`

G3:
`(-128,-544)`

Relations:
- Entry→G1 ≈272px
- G1→G2 ≈358px
- G2→G3 ≈358px

Architecture:
large Worker arrival boarding finger climbing into the transfer hub.

This gives the Player enough time to read:
- huge central machinery
- right-side Boarding Lip
- upper structures only partially visible

Final Control remains unreadable.

---

# 6. PATROL A

Stable:
`drone-1`

Proposed path:
`(-704,-272) ↔ (-160,-528)`

Current Patrol behavior only:
48 / 0.45 / pingpong / kill optional / no Rope Cut.

Relationship:
Player and Patrol share the arrival finger direction.

Activation ends at Hub.

---

# 7. ARRIVAL RECOVERY

Recovery A:
center `(-320,-256)`, W288.

Retry:
`4–7s`.

Cannot reach Hub directly without replaying G2/G3.

---

# 8. CENTRAL HUB

Hub Deck:
center `(+64,-608)`, W384.

Not fully safe yet.

This is where public arrival routes converge around the central transfer machinery.

The Player can stand and reorient,
but Lower Guard owns the outgoing Boarding Lip.

No Story.

---

# 9. LOWER GUARD / DEAD BOARDING LIP

Stable:
`transfer-lower-guard`

Pool:
`SECTOR_02_LATE_POOL`

Target:
around `(+288,-608)`.

Kill optional.
No Rope Cut.
No kill gate.

G4:
`(+448,-736)`

Boarding Lip:
center `(+576,-768)`, W256.

Hub usable edge→G4:
~260–320px depending exact landing.

The Lip visually looks like the obvious continuation toward transfer.

Then it ends.

No opened door.
No override.
No alternate public route.

---

# 10. CONTROLLED DROP INTO SUSPENDED TRANSFER RING

G5:
`(+608,-512)`

Lip→G5:
≈295px nominal relation.

This is a **deliberate downward catch**.

Important:
This is not 2-5's maintenance descent.

2-5:
public Gate → maintenance-only descent → Stage ends lower.

2-8:
public Boarding Lip → suspended transfer machinery → **relaunch to a higher opposite departure arm**.

Different function and rhythm.

Ring Deck:
- X `+352..+736`
- center `(+544,-448)`
- W384

Ring is fully safe.

---

# 11. RING RELIEF

This is the most important non-Story gameplay pause.

Target:
`5–10s` first play.

Requirements:
- Patrol A inactive
- Lower Guard inactive
- Patrol B inactive
- Upper Guard inactive

The Player sees:
- the dead public Lip above/right
- the Ring they fell into
- the upper Departure Arm rising far to the left
- final Control still above

This is the Stage's large “space understood” beat.

No System Toast.

---

# 12. RING RECOVERY

If Drop misses:

Recovery B:
center `(+832,-320)`, W224.

A real Divider / ring housing prevents walking directly onto Ring success route.

Retry:
`5–9s`.

No death pit.

---

# 13. LAUNCH FROM RING

From Ring's left usable edge around:
`(+352,-448)`

G6:
`(+64,-704)`

Relation:
≈385px.

This is the first major upper-half commitment.

Landing:
small upper structural bracket around G6.

The Player now understands:
**the route is not continuing right; the transfer machinery redirects them up-left.**

---

# 14. PATROL B — CENTRAL CROSSING PRESSURE

Stable:
`drone-2`

Proposed path:

`(+320,-784) ↔ (-320,-784)`

Player route:
up-left.

Drone:
horizontal across the central transfer volume.

This is visually and mechanically different from Patrol A.

No crossfire with Patrol A.

---

# 15. UPPER DEPARTURE ARM

G7:
`(-288,-832)`

G8:
`(-608,-992)`

Relations:
- G6→G7 ≈375px
- G7→G8 ≈358px

Upper Arm is narrower than Arrival Finger.

Landings:
128–160px class.

This is Gameplay Peak 2.

Recovery C:
center `(-32,-640)`, W224.

Recovery D:
center `(-384,-768)`, W192.

Both:
`4–8s`.

Do not allow direct G8 skip.

---

# 16. UPPER GUARD

Stable:
`transfer-upper-guard`

Pool:
`SECTOR_02_LATE_POOL`

Target:
around `(-544,-992)`.

Kill optional.
No Rope Cut.
No kill gate.

Activate after Patrol B representative pressure ends.

G9:
`(-288,-1152)`

G8→G9:
≈358px.

This is Sector 02's final combat pressure.

---

# 17. FINAL CONTROL APRON

Final Deck:
- center `(+0,-1248)`
- W448

G9→Final left edge around `(-224,-1248)`:
≈116px.

No enemy/hazard.

Transfer Control:
around `(-80,-1248)`.

Checkpoint:
around `(+112,-1248)`.

All combat audio ends.

The broad neutral Final Apron contrasts with the crowded layered traversal below.

---

# 18. FINAL STORY

Exact Runtime sequence:

1.
`EVACUATION GROUP A / TRANSFER COMPLETE`

2.
`EVACUATION GROUP B / TRANSFER COMPLETE`

3.
`EVACUATION GROUP C / TRANSFER SUSPENDED`

4.
`PRIORITY ACCESS / ACTIVE`

All in one safe interaction context.

No class explanation.
No VIP visual cue.
No causal answer.

---

# 19. PLAYER BARK

After Priority:

**`…왜 C만 멈춘 거지?`**

Status:
**NOT IMPLEMENTED — PLAYER BARK LAYER**

This is the Sector-end question.

---

# 20. FOUR-SLOT PHASING

```text
PATROL A
  ↓
LOWER GUARD
  ↓
DROP
  ↓
SAFE RING
  ↓
PATROL B
  ↓
UPPER GUARD
  ↓
FINAL STORY
```

This gives the 4-slot finale structure without combat soup.

Never:
- all four
- Patrol A + Patrol B
- Story under pressure

---

# 21. WHY THIS FEELS MORE LIKE A FINALE

REV1:
one long bent path.

REV2 has five memorable spatial verbs:

1. **CLIMB THE ARRIVAL FINGER**
2. **BREAK THROUGH THE HUB**
3. **DROP INTO THE TRANSFER RING**
4. **RELAUNCH INTO THE OPPOSITE UPPER ARM**
5. **READ THE FINAL TRANSFER RECORD**

The Player passes:
- above public deck
- below public deck
- back above it
- into final Control

That gives the Stage a genuine large-infrastructure identity.

---

# 22. SIMILARITY AUDIT

## vs 2-4
2-4 = Braid / switch / remerge / three risk styles.

2-8 REV2:
one mandatory route,
no branch choice,
complexity comes from stacked elevations and one dead Boarding Lip.

PASS.

## vs 2-5
Overlap:
one deliberate drop.

Difference:
2-5 continues downward through maintenance;
2-8 drops only to a suspended machinery layer then launches much higher into the opposite public departure arm.

Meaningful overlap = 1.

PASS.

## vs 1-5
Overlap:
drop followed by re-launch.

Difference:
1-5 = Horseshoe and returns through a load loop;
2-8 = asymmetric public transfer fan with central suspended ring and final Story Control.

Meaningful overlap = 1.

PASS.

## vs 1-7
No parallel S-curve lanes.
No repeated left/right corridor reversal.

PASS.

## vs 2-7
2-7 = diagonal→vertical two-axis Shelter/Mast.

2-8 = arrival arm→dead lip→drop/ring→opposite departure arm.

PASS.

## vs 1-8
1-8 = tall locks / override / world reveal.

2-8 = layered transfer fan / no override / comparative records / checkpoint.

PASS.

Maximum meaningful overlap:
**1**

---

# 23. DIFFICULTY

Critical:
- G1→G2 ≈358
- G2→G3 ≈358
- Ring→G6 ≈385
- G6→G7 ≈375
- G7→G8 ≈358
- G8→G9 ≈358

Only one mandatory relation approaches 385px.

No repeated 390–400 fishing.

The challenge comes from:
- long sequence
- changing elevation
- moving pressure
- smaller upper landings
- recovery cost
- four pressure phases

---

# 24. PACING

Mainline first:
`2:55–3:45`

Mastered:
`1:25–1:55`

Story:
`8–14s`

HYPOTHESIS.

REDESIGN if:
- first play >4:00 without repeated misses
- Ring reads like filler
- Drop feels identical to 2-5
- upper arm can be skipped from Ring Recovery
- final Story is attacked
- Stage reads like a giant 1-5
- Stage reads like 2-4 with hidden lane colors
- final movement is less memorable than 2-7

---

# 25. FIVE GATES

MAP SCALE:
**PASS**

MAP SIMILARITY:
**PASS**

OBSTACLE FUNCTION:
**PASS — DEAD BOARDING LIP → SUSPENDED RING → OPPOSITE DEPARTURE ARM**

LENGTH / PACING:
**HYPOTHESIS PASS — PLAYTEST REQUIRED**

CURRENT RUNTIME:
**4-SLOT + FINAL STORY + CHECKPOINT + CONTENT BOUNDARY MATCH / MAJOR TOPOLOGY RE-AUTHOR**

User approved. REV8.0 package is authoritative.


---

# 26. PACKAGING-TIME RE-AUDIT

Final packaging baseline:
`4fce8a27bc6cb7b4141735dec6c8e56cb9f88b5b`

The latest `main` changed after REV2 approval through Sector 01 REV8 implementation work.
The actual Sector 02-8 Runtime authority remained intact.

Verified at packaging:
- current 2-8 still owns exactly 4 slots:
  - `drone-1`
  - `drone-2`
  - `transfer-lower-guard`
  - `transfer-upper-guard`
- both Patrols remain fixed `patrol-drone-t1`
- both Guards remain `SECTOR_02_LATE_POOL`
- Transfer Control remains `sector-02-08:transfer-control-read`
- Sector-end Checkpoint remains
- `nextAreaId` remains `null`
- completion remains `content-boundary`
- current Area gate still directly requires Transfer Control read, not A/B/C Access Modules
- final Story sequence remains:
  A COMPLETE → B COMPLETE → C SUSPENDED → PRIORITY ACCESS ACTIVE
- current Player Bark layer remains absent

Therefore REV2 remains valid as final REV8.0.
