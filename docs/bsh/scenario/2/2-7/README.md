# ONE ROPE — SECTOR 02-7 SHELTER ACCESS — REV8 STAGE DRAFT

> Status: DESIGN LOCKED
> Runtime audit baseline: `c8b7a23276574cc4965da8f94fb98022ac967d53`
> Current Runtime: `1408×1440`
> Proposed REV8: **`1792×1280`**
> Spatial Signature: **SHELTER BUTTRESS → SAFE CORE → TRANSFER MAST**
> Dominant body: **`DIAGONAL UP-RIGHT → HARD TURN → VERTICAL UP`**
> Stage role: **SECTOR FINAL BUILD-UP / TWO-AXIS PATROL SYNTHESIS / ACCESS C**
> Full package: CREATED — REV8.0 GITHUB-READY
> Map Preview: GAMEPLAY-ONLY

---

## 0. CURRENT RUNTIME — VERIFIED

Current 2-7:
- area `sector-02-07`
- name `SHELTER ACCESS`
- subtitle `EVACUATION TRANSFER SUSPENDED`
- bounds `1408×1440`
- entry `(-480,-32)`
- exit around `(+544,-1376)`
- nextAreaId `sector-02-08`
- exactly **3 slots**
  1. `drone-1` — fixed `patrol-drone-t1`
  2. `drone-2` — fixed `patrol-drone-t1`
  3. `shelter-centre-guard` — `SECTOR_02_LATE_POOL`
- `shelter-centre-guard` owns:
  `accessModuleId: sector-02:access-module:c`
- current Story prop:
  `shelter-status`
- current Story cue IDs:
  - `shelter-capacity-full`
  - `evacuation-transfer-suspended`
  - `remain-designated-area`
- current cue:
  `two-patrol-bands / no-crossfire`
- current Patrols are two horizontal pingpong bands
- current routes:
  `safe / flow / pressure / recovery`

Sector 02 density authority:
2-7 = exactly **3 slots**.

Sector 02 Access Carrier stages:
2-2 / 2-5 / 2-7.

2-7 owns:
**Access Module C**.

---

## 1. CURRENT STORY — VERIFIED

Entry:

`SHELTER ACCESS`
`EVACUATION TRANSFER SUSPENDED`

Shelter Status sequence:

1.
`SHELTER CAPACITY`
`FULL`

2.
`EVACUATION TRANSFER`
`SUSPENDED`

3.
`REMAIN IN`
`DESIGNATED AREA`

2-5:
`PENDING`

2-7:
**`SUSPENDED`**

This is a real Story escalation.

But do NOT reveal:
- why transfer was suspended
- who suspended it
- Group A / B result
- Priority Access
- whether the shelter is currently occupied
- 2-8 comparison

`SHELTER CAPACITY FULL` is a recorded system state,
not proof that people are currently alive behind the door.

---

## 2. WHY OLD MULTI-ROUTE IS RETIRED

The old README describes:

`Multi-Route + Drone + Build Synthesis`

But 2-4 already owns the Sector's major Route-choice grammar.

Repeating:
- Safe / Flow / Pressure
- route choice around Patrol
- Build efficiency routes

would create direct 2-4 similarity.

REV8 therefore keeps:
- two sequential Patrol encounters
- Build expression
- Safe mid Story
- Access C

but removes:
**Stage-scale Multi-Route.**

The synthesis is now:
**two different movement axes against two different Patrol orientations.**

---

## 3. RUNTIME PATROL CAPABILITY — VERIFIED

Current `EnemyPatrol`:
- accepts arbitrary `{x,y}` patrol points
- computes a full 2D delta vector
- moves toward target by normalized delta
- is not hardcoded to horizontal motion

Therefore:
- diagonal Patrol
- vertical Patrol
- horizontal crossing Patrol

can be authored with current AI.

No new Patrol behavior is required.

REV8 uses:
- Encounter A = **diagonal Patrol**
- Encounter B = **horizontal Patrol crossing a vertical climb**

---

## 4. SCALE

Target:
**`1792×1280`**

Local:
- X `-896..+896`
- Y `0..-1280`

Why:
- first half needs a long shelter buttress face
- second half needs a vertical transfer mast
- still shorter than current `1440px` height
- avoids another pure tall-spine Stage

Difficulty comes from:
- 350–385px Rope
- moving Security
- changing movement axis
- smaller mast landings

not raw height alone.

---

## 5. SPATIAL SIGNATURE

**SHELTER BUTTRESS → SAFE CORE → TRANSFER MAST**

```text
                                              EXIT → 2-8
                                                  ▲
                                              G6  │
                                                  │
                                     ── Patrol 2 ─┼──
                                                G5│
                                                  │
                                                G4│
                                       TRANSFER MAST
                                                  ▲
                                                  │
           ACCESS C ← SAFE SHELTER CORE / STATUS ┘
                              ▲
                            G3
                          ↗
                      G2
                    ↗
                G1
              ↗
           ENTRY

      Patrol 1 moves diagonally along the shelter buttress
```

Body:
**`↗ THEN ↑`**

The hard 45°→90° axis change at the Shelter Core is the identity.

---

## 6. ARCHITECTURAL CAUSALITY

Worker shelter architecture:

1. **Overflow Evacuation Buttress**
   - sloped exterior ramp / reinforced circulation face
   - people approached the shelter from the residential district

2. **Shelter Core**
   - reinforced sealed access
   - status display
   - safe landing

3. **Transfer Mast**
   - narrow external service / transfer structure rising beside the shelter
   - leads toward Evacuation Platform infrastructure

The Player does not pass through the Shelter.

The core is full / transfer is suspended.

Progress continues **around the exterior transfer structure**.

---

## 7. ENTRY

Entry:
`(-768,-32)`

P0:
- center `(-736,0)`
- W320

Exact Entry Story:
`SHELTER ACCESS / EVACUATION TRANSFER SUSPENDED`

No Bark here.

Player should immediately read:
- upward-right Shelter Buttress direction
- first usable G1
- no second Patrol yet

---

## 8. G1 / BUTTRESS APPROACH

G1:
`(-576,-240)`

Buttress Landing A:
- center `(-480,-320)`
- W176

Entry→G1:
≈283px.

This is the last comfort relation.

After G1,
the Stage enters synthesis difficulty.

---

## 9. PATROL ENCOUNTER A — DIAGONAL SAME-AXIS PRESSURE

G2:
`(-256,-416)`

G3:
`(+64,-592)`

Distances:
- G1→G2 ≈365px
- G2→G3 ≈365px

Proposed `drone-1` path:

`(-512,-304) ↔ (+32,-560)`

Preserve:
- `patrol-drone-t1`
- speed 48
- wait 0.45
- pingpong
- kill optional
- no Rope Cut
- target-lock-cycle
- activation-band-only

Purpose:

2-2:
Drone moved along a horizontal bridge.

2-7 Encounter A:
Drone moves **diagonally along the same shelter buttress direction** as the Player.

Player must decide:
- chase the gap behind it
- pass before it returns
- kill it
- use current Augment mobility to reduce exposure

No new tutorial.

---

## 10. LOWER RECOVERY

Buttress Recovery:
- center `(-128,-288)`
- W256

Retry:
`4–7s`.

It is below the diagonal pressure band.

A miss:
- loses height
- loses timing
- does not reset Stage

Recovery cannot directly reach the Safe Story Core without replaying the buttress.

---

## 11. SAFE SHELTER CORE

Story Deck:
- center `(+160,-672)`
- W384
- approximate span `X -32..+352`

This is completely safe.

Requirements:
- drone-1 activation has ended
- drone-2 is not active
- Access C Carrier is not active unless Player deliberately enters its branch
- no crossfire
- no hazard

The reinforced shelter wall/core should visibly stop the diagonal public approach.

This is the Stage's major decompression beat.

---

## 12. SHELTER STATUS STORY

At Safe Core:

1.
`SHELTER CAPACITY / FULL`

2.
`EVACUATION TRANSFER / SUSPENDED`

3.
`REMAIN IN / DESIGNATED AREA`

No camera cut is required.

Same frame should keep:
- Player
- shelter access/core
- Story Display

The meaning should come from:
**system status + sealed quiet shelter architecture.**

No voices or silhouettes behind the door.

---

## 13. PLAYER BARK — PROPOSED

After all three status messages:

**`…대피소가 꽉 찼는데, 여기 남으라고?`**

Why:
- reacts directly to the recorded status
- disbelief comes before explanation
- emotionally stronger than tutorial-style commentary
- does not identify the decision-maker
- does not mention Group A/B

Status:
**NOT IMPLEMENTED — PLAYER BARK LAYER**

No second Bark.

---

## 14. ACCESS MODULE C BRANCH

After / beside the Safe Story Core:

Access Anchor:
`(-64,-736)`

Carrier Alcove:
- center `(-256,-768)`
- W160

Current slot:
`shelter-centre-guard`

Pool:
`SECTOR_02_LATE_POOL`

Access:
`sector-02:access-module:c`

Branch body:

`STORY CORE → short left/down service recess → Carrier C → return to Core`

Rules:
- current Carrier slot only
- no escort
- no fourth enemy
- activate only after deliberate branch commit
- Story Core itself remains safe
- kill required for Module C
- Module C optional for local Stage exit
- globally required for Sector 02 3-of-3 Transit Lock
- preserve current edge-arrow → diamond marker
- no authored Access label

This small optional branch does **not** count as Stage-scale Multi-Route.

---

## 15. AXIS TURN / TRANSFER MAST ENTRY

The Shelter Core blocks the previous diagonal continuation.

Player turns upward.

G4:
`(+416,-800)`

Mast Landing A:
- center `(+448,-864)`
- W144

Story Core right edge→G4:
≈143px.

This short relation is intentional:
the challenge is not the turn itself.

The Player has time to understand:
**the route has changed from diagonal public approach to vertical external transfer.**

---

## 16. PATROL ENCOUNTER B — PERPENDICULAR CROSSING PRESSURE

G5:
`(+128,-1056)`

G6:
`(+448,-1216)`

Distances:
- G4→G5 ≈385px
- G5→G6 ≈358px

Proposed `drone-2` path:

`(+32,-992) ↔ (+448,-992)`

So:

Player movement:
**mostly vertical / diagonal-up through the Mast**

Drone movement:
**horizontal across the Mast**

This is a different pressure relation from:
- 2-2 same-axis horizontal chase/read
- Encounter A diagonal same-axis pressure

This is **Gameplay Peak 2**.

No new AI.

---

## 17. MAST RECOVERY

Lower Mast Recovery:
- center `(+512,-736)`
- W160

Upper Mast Recovery:
- center `(-32,-896)`
- W160

Targets:
`4–8s` retry.

Important:
Recovery should make the failed route replayable,
but not make G6 directly reachable while skipping G5.

If a Recovery geometry permits a >stage-step skip:
move it or add architectural separation.

Do not add instant death.

---

## 18. EXIT

Exit Deck:
- center `(+640,-1248)`
- W256

Exit:
around `(+768,-1248)`.

Next:
`sector-02-08`.

No enemy after G6 / final landing.

No new Story at Exit.

2-8 owns:
- Group A / B comparison
- Group C comparison
- Priority Access
- Sector finale conclusion

---

## 19. THREE-SLOT PHASING

Exactly **3 slots**.

```text
PATROL 1
   ↓
SAFE STORY
   ↓
ACCESS C optional branch
   ↓
PATROL 2
   ↓
EXIT
```

Never:

`Patrol 1 + Carrier + Patrol 2`

simultaneously.

No crossfire.

The existing `no-crossfire` contract remains important.

---

## 20. GENERIC AUGMENT EXPRESSION

No card-specific Route.

Current generic Build may affect:

### Encounter A
- launch / propulsion: reduce diagonal Patrol exposure
- reach: earlier catch
- defense/combat: optional Drone kill

### Encounter B
- direction correction: narrow Mast landings
- recovery: recover failed Mast sequence
- combat: optional Drone kill
- reach: improve G4→G5 timing margin

But:
- Base Rope can clear the Stage
- no selected-card proof
- no Foundation/Specialization language
- no Build lock

---

## 21. STORY FUNCTION

2-5:
`TRANSFER AUTHORIZATION / PENDING`

2-7:
`EVACUATION TRANSFER / SUSPENDED`

The system has moved from:
**not yet approved**

to:
**stopped.**

Then:
`REMAIN IN / DESIGNATED AREA`

This should feel bureaucratically cold,
not melodramatic.

The Player sees no people.

Do not imply:
- mass death
- people currently trapped behind the door
- intentional abandonment
- upper-class priority yet

---

## 22. ENVIRONMENTAL STORY

Shelter Buttress:
- reinforced evacuation ramp
- crowd-width railing remnants
- emergency route lights
- scuffed queue/waiting marks
- numbered shelter infrastructure

Safe Core:
- large reinforced shelter access
- status display
- stacked waiting traces
- quiet sealed door
- no human movement

Transfer Mast:
- narrower industrial/service framing
- less civilian comfort
- cable/utility circulation
- exposed Grapple-friendly joints

No:
- bodies
- blood
- HELP / SAVE US
- current voices
- silhouettes behind door

---

## 23. CAMERA

Default Camera first.

### Encounter A
Player + next diagonal target + Patrol direction.

### Safe Story
Player + Shelter Core + Status Display.

No enemy pressure.

### Access C
small local branch framing only.

### Encounter B
Player + next Mast catch + horizontal Patrol crossing line.

This is important:
the Player must understand the **perpendicular movement relationship**.

No cinematic Drone follow.

If default frame fails:
adjust geometry first.

---

## 24. DIFFICULTY CURVE

```text
ENTRY            ▂
G1               ▃
PATROL A          ▅▆
G2→G3             ▆
SAFE STORY        ▁
ACCESS C          ▅  optional
MAST ENTRY        ▂
PATROL B          ▆▇
G4→G5→G6          ▇
EXIT              ▁
```

2-7 is harder than 2-6.

It may be slightly harder than 2-5 in movement synthesis,
but 2-8 must still own the Sector climax.

---

## 25. PACING

Mainline first:
`2:10–2:55`

Mainline mastered:
`1:00–1:25`

With Access C first:
`2:40–3:30`

With Access C mastered:
`1:25–1:50`

HYPOTHESIS.

REDESIGN if:
- Patrol A and B overlap
- Story Deck can be attacked
- Carrier C overlaps Story without deliberate branch commit
- G4→G5 consistently requires reach-limit fishing
- Stage becomes another 2-4 route-choice map
- diagonal first half dominates so much that map reads like 2-1
- vertical second half dominates so much that map reads like 1-3
- first mainline >3:10 without repeated misses
- 2-7 feels harder/more climactic than 2-8

---

## 26. MAP SIMILARITY

### vs 2-6
2-6:
short vertical lift → long horizontal rim.

2-7:
long diagonal buttress → vertical mast.

PASS.

### vs 2-5
2-5:
horizontal public Funnel → downward two-stage service descent.

2-7:
diagonal ascent → vertical ascent.

PASS.

### vs 2-4
2-4:
braided Safe/Flow/Pressure route field.

2-7:
single mandatory route + one optional Access alcove.

PASS.

### vs 2-2
2-2:
single long horizontal Patrol bridge.

2-7:
two sequential Patrol encounters on different axes.

Meaningful overlap:
Patrol knowledge only.

PASS.

### vs 2-1
2-1:
dominant diagonal Rowhouse ascent throughout.

2-7:
diagonal only first half;
second half hard-turns into Mast.

Meaningful overlap:
diagonal first half.

PASS.

### vs 1-3
1-3:
dominant vertical Security spine + huge side Annex.

2-7:
vertical Mast only second half,
no huge Annex.

Meaningful overlap:
vertical second-half pressure.

PASS.

### vs 1-8
1-8:
tall sequential multi-lock security lanes + override.

2-7:
one Shelter Core safe beat + two Patrol phases,
no override.

PASS.

Maximum meaningful overlap:
**1**

---

## 27. OBSTACLE FUNCTION

Primary:
**SEALED / FULL SHELTER CORE BREAKS THE PUBLIC APPROACH AXIS**

Architecture causes the gameplay turn:

`diagonal evacuation approach`
→ `shelter access status`
→ `public shelter path cannot continue`
→ `external transfer mast`

This is not an arbitrary corner.

The 45°→90° movement-axis change has a social/system cause.

PASS.

---

## 28. CURRENT RUNTIME GATE

### KEEP
- Stage identity
- exact Entry Story
- exact Shelter Status Story
- 2 Patrol slots
- Access C Carrier slot
- 3-slot budget
- Patrol T1 behavior
- no Rope Cut
- kill optional
- no-crossfire
- Safe mid Story intent
- nextAreaId 2-8
- Access 3-of-3 contract

### RE-AUTHOR
- bounds `1408×1440 → 1792×1280`
- old tall route
- Stage-scale Safe/Flow/Pressure routes
- Patrol paths/orientations
- Story Deck position
- Carrier position/activation
- Recovery geometry
- exit position

### RETIRE
- old `Foundation + Specialization` language
- old Stage-scale Multi-Route requirement
- any Group A/B or Priority Access reveal
- any implication of current shelter occupants

---

## 29. FIVE GATES

MAP SCALE / WORLD FOOTPRINT:
**PASS**

MAP SIMILARITY:
**PASS**

OBSTACLE FUNCTION:
**PASS**

LENGTH / PACING:
**HYPOTHESIS PASS — PLAYTEST REQUIRED**

CURRENT GITHUB RUNTIME:
**3-SLOT + 2 PATROL + ACCESS C + STORY CONTRACT MATCH / MAJOR TOPOLOGY RE-AUTHOR**

User approved. REV8.0 package is authoritative.


---

## 30. PACKAGING-TIME RE-AUDIT

Final packaging baseline:
`c8b7a23276574cc4965da8f94fb98022ac967d53`

The latest `main` changed after Draft approval through the Sector 01 REV8 implementation merge.
The current Sector 02-7 authority remained intact.

Verified at packaging:
- 2-7 still owns exactly 3 slots
- `drone-1` and `drone-2` remain fixed `patrol-drone-t1`
- `shelter-centre-guard` remains `SECTOR_02_LATE_POOL`
- `shelter-centre-guard` still owns `sector-02:access-module:c`
- Entry Story remains `SHELTER ACCESS / EVACUATION TRANSFER SUSPENDED`
- Shelter status sequence remains `FULL → SUSPENDED → REMAIN`
- current `EnemyPatrol` supports arbitrary 2D point-to-point motion
- current presentation directory still has no dedicated Player Bark layer

Therefore the approved REV8 topology remains valid against the new baseline.
