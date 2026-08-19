# ONE ROPE — SECTOR 02-6 QUIET RESIDENTIAL VOID — REV8 STAGE DRAFT

> Status: DESIGN LOCKED
> Runtime audit baseline: `2ea921fed1fee27a4b3837ecde3281d5cd3390dd`
> Current Runtime: `1472×1216`
> Proposed REV8: **`1920×832`**
> Spatial Signature: **L-SHAPED COURTYARD RIM / REVEAL TURN**
> Stage Role: **RELIEF / RESIDENTIAL SCALE REVEAL / DELAYED SECURITY**
> Full package: CREATED — REV8.0 GITHUB-READY
> MAP-PREVIEW: GAMEPLAY-ONLY

---

## 0. LATEST RUNTIME — VERIFIED

Current 2-6:
- area `sector-02-06`
- name `QUIET RESIDENTIAL VOID`
- subtitle `RESIDENTIAL SCALE REVEAL`
- bounds `1472×1216`
- entry `(-512,-32)`
- exit `(544,-1152)`
- nextAreaId `sector-02-07`
- current authored Grapple landmarks:
  - `g3`
  - `g5`
- exactly **2 enemy slots**
  1. `courtyard-left-guard` — `SECTOR_02_SUPPORT_POOL`
  2. `courtyard-right-guard` — `SECTOR_02_LATE_POOL`
- `courtyard-void` background Story prop
- current routes:
  - safe
  - flow
  - recovery
- current cueIds include:
  - `quiet-residential-void`
  - `residential-scale`
  - `no-enemy`
  - `visual-relief`

## 1. Runtime contradiction

The current cue `no-enemy` is not literal Runtime truth.

Actual area code contains **2 enemy slots**.

Therefore REV8 does NOT claim Enemy 0.

Interpret `QUIET / VISUAL RELIEF` as:

> **the Player gets the complete reveal before any Security pressure returns.**

Both existing slots remain,
but are delayed into the final third and never overlap.

This preserves:
- current density authority
- 2-6 relief role

without inventing Enemy removal.

## 2. Verified Entry Story

Current Entry presentation:

`RESIDENTIAL BLOCKS`
`12–18`

There is no current 2-6 positional Story sequence in `AuthoredStoryPresentation.js`.

Therefore REV8 adds:
- no new System Toast
- one proposed Player Bark only

## 3. Why current vertical blockout is re-authored

Current body climbs:
`lower left → centre → lower/upper alternation → upper right`

and is another tall `1216px` Stage.

That risks repeating:
- Sector 01 vertical progression
- 2-1 diagonal rise
- 2-7/2-8 tall upcoming evacuation structures

2-5 REV8 also ends with a difficult downward service descent.

2-6 should therefore:
1. give a short recovery lift,
2. make one unmistakable **90° Reveal Turn**,
3. spend most of the Stage moving quietly along the upper residential rim.

## 4. Final silhouette proposal

**L-SHAPED COURTYARD RIM / REVEAL TURN**

```text
                                       EXIT → 2-7
                             ────────────────────────→
                            late Guard A → late Guard B
                 QUIET UPPER RESIDENTIAL RIM
                 ────────────────────────────────→
                /
        SAFE REVEAL OVERLOOK
        ─────────────────
        ▲
        │
      G2│
        │
  LIFT LANDING
        ▲
      G1│
        │
      ENTRY
```

Body:
**SHORT UP → HARD 90° TURN → LONG RIGHT**

The turn itself is the Stage signature.

## 5. Scale

Target:
`1920×832`

Local:
- X `-960..+960`
- Y `0..-832`

Why:
- wider horizontal rim gives the residential scale reveal room to breathe
- height is reduced to stop another full vertical climb
- a short lift from 2-5's low service exit causally reaches the public/residential overlook

The Stage should feel spatially large,
but mechanically less dense than 2-5.

## 6. Entry / recovery lift

Entry:
`(-816,-32)`

P0:
- center `(-800,0)`
- W320

G1:
`(-704,-224)`

Lift Landing:
- center `(-640,-288)`
- W256

G2:
`(-608,-480)`

Reveal Overlook:
- center `(-448,-512)`
- W384

Planning relations:
- Entry region→G1 ≈264px
- G1→G2 ≈274px

Comfort/normal.

No enemy activation here.

No precision peak.

This is deliberate decompression after 2-5.

## 7. Reveal Overlook — full safe zone

The 90° turn happens here.

Player reaches the Overlook and for the first time reads:
- several residential blocks at once
- deep central courtyard void
- repeated balconies and small doors
- no visible residents
- no immediate active Security

The upper Rim extends far to the right.

Current `courtyard-void` Story prop remains useful here.

No System Story beyond the Entry title.

## 8. Proposed Player Bark

After Player reaches the Overlook,
after several Blocks are physically visible,
with no enemy pressure:

**`…이렇게 많은데, 너무 조용해.`**

Purpose:
- physical observation first
- emotional recognition second
- reinforces absence without explaining it
- no evacuation theory

Status:
`NOT IMPLEMENTED — PLAYER BARK LAYER`

No second Bark.

## 9. Quiet upper Rim

Reveal Overlook:
roughly `x -640..-256`.

Quiet Gallery:
- center `(-128,-512)`
- W320

The first long section is mostly walking / small jump / easy Rope correction.

The Player is allowed to look at the environment.

No Patrol.
No moving hazard.
No new mechanic.

## 10. Cross-courtyard Gap A

G3:
`(+192,-576)`

Rim Landing A:
- center `(+320,-544)`
- W256

From the usable right edge of Quiet Gallery:
planning relation to G3:
~260–300px.

The landing is broad.

Recovery A:
- center `(+128,-384)`
- W256

Retry:
`3–5s`.

This is traversal,
not a difficulty spike.

## 11. Delayed Guard A

Current stable slot:
`courtyard-left-guard`

REV8 target:
around `(+352,-544)`.

Pool:
`SECTOR_02_SUPPORT_POOL`.

Activation:
**only after the Player has passed the Reveal / Quiet Gallery.**

Rules:
- kill optional
- no Rope Cut
- no kill gate
- no activation in Reveal zone
- activation ends before Guard B begins

Role:
first sign that Security is still present,
but only after the visual relief has landed.

## 12. Cross-courtyard Gap B

Rim Transfer Deck:
- center `(+480,-544)`
- W224

G4:
`(+640,-608)`

Final Rim Landing:
- center `(+736,-576)`
- W320

Transfer→G4:
~171px.

This is intentionally easy.

Recovery B:
- center `(+512,-448)`
- W224

Retry:
`3–5s`.

## 13. Delayed Guard B

Current stable slot:
`courtyard-right-guard`

REV8 target:
around `(+704,-576)`.

Pool:
`SECTOR_02_LATE_POOL`.

Activation:
after Guard A activation band ends.

Rules:
- kill optional
- no Rope Cut
- no kill gate
- never simultaneous with Guard A in representative gameplay

No crossfire.

The Stage remains a relief Stage even with its 2-slot authority.

## 14. Exit

Exit Deck:
- center `(+800,-640)`
- W256

Exit:
around `(+864,-672)`.

Next:
`sector-02-07`.

No new Story at Exit.

2-7 owns:
`SHELTER ACCESS / EVACUATION TRANSFER SUSPENDED`.

Do not preview `TRANSFER SUSPENDED` here.

## 15. Environmental Story

2-1 established:
**people lived here.**

2-4 established:
**the district is dense.**

2-5 established:
**Group C reached the evacuation terminus but public upward access remained restricted.**

2-6 now establishes:
**the residential district is much larger than one Block, and it is unnaturally quiet.**

Final art can show:
- Blocks 12–18 across multiple depths
- dozens of small doors
- balcony repetitions
- laundry
- plants
- chairs
- shared service shelves
- small repair patches
- a few weak lights
- courtyard depth continuing far below

Do NOT show:
- bodies
- explicit evacuation messages
- Group A/B
- shelter status
- transfer suspended
- intentional abandonment

## 16. Central Void composition

The Void is mostly Story / scale.

Do not fill the gameplay Map with background platforms.

Gameplay foreground should remain:
- short lift
- Reveal Overlook
- long upper rim
- two actual broken transfers
- two delayed enemy slots
- recovery

Background architecture must not look grappleable unless authored as a target.

## 17. Camera

Default Camera first.

### Entry lift
Player + next G1/G2.

### Reveal Overlook
This is the most important frame.

Need:
- Player readable
- upper Rim direction readable
- large central Void / several housing blocks readable

Do NOT zoom so far that Player becomes tiny.

If default camera cannot show enough scale:
prefer foreground depth composition / nearby façade layers first.

Only then consider a light authored Camera zone.

### Enemy section
Return to ordinary gameplay framing.

No cinematic pan.

## 18. Enemy pressure curve

```text
ENTRY LIFT        ▁
REVEAL            ▁
QUIET RIM         ▁
GAP A             ▂
GUARD A           ▃
GAP B             ▂
GUARD B           ▃
EXIT              ▁
```

This is intentionally lower than 2-5.

2-6 is a sawtooth relief Stage,
not another escalation.

## 19. Difficulty

First:
`1:15–1:45`

Mastered:
`0:40–0:55`

HYPOTHESIS.

Rope:
- mostly 250–320px
- no 360+ mandatory relation
- broad landings
- no Commit Drop
- no moving enemy
- no Access Carrier

If the Stage feels too trivial:
increase observation/traversal spacing slightly,
not enemy count or precision.

If it feels almost as hard as 2-5:
reduce pressure.

## 20. Similarity audit

### vs 2-5
2-5:
long rightward public Funnel → two-stage downward Commit.

2-6:
short vertical recovery lift → 90° turn → quiet upper Rim.

The axis order is reversed and the emotional/gameplay pressure is opposite.

Meaningful overlap:
one 90° axis turn only.

PASS.

### vs 2-1
2-1:
dominant diagonal rowhouse ascent.

2-6:
short vertical lift is only the opening quarter,
then dominant horizontal Rim.

PASS.

### vs 2-2
2-2:
long horizontal Patrol pressure bridge.

2-6:
horizontal Rim after reveal,
but:
- no Patrol
- no moving LOS lesson
- two static late guards only
- safe first half

Meaningful overlap:
horizontal second-half traversal only.

PASS.

### vs 1-1
1-1:
straight service riser.

2-6:
vertical lift stops quickly at the Reveal Turn.

Meaningful overlap:
short opening lift only.

PASS.

### vs 1-6
1-6:
wide open cross-flow Plenum + Wind.

2-6:
residential courtyard Rim + no Wind + L-shaped body.

Meaningful overlap:
large open visual space only.

PASS.

### vs 1-5
No drop-and-relaunch.
No Horseshoe.
PASS.

Maximum meaningful overlap:
**1**

## 21. Obstacle function

Primary:
**BROKEN RESIDENTIAL COURTYARD RIM**

Architectural causality:
- 2-5 service exit is low
- Player climbs to a residential Overlook
- normal upper gallery once circled the courtyard
- two damaged transfers interrupt it
- Security remains only on the far residential rim

No videogame lane abstraction.

PASS.

## 22. Current Runtime gate

### KEEP
- Stage identity
- Entry text `RESIDENTIAL BLOCKS / 12–18`
- exactly 2 slots
- Support Pool left slot
- Late Pool right slot
- `courtyard-void` Story prop
- no Access
- nextAreaId 2-7
- reach→panel exit pattern

### RE-AUTHOR
- bounds `1472×1216 → 1920×832`
- current tall zigzag route
- G3/G5 landmark positions
- Recovery positions
- enemy positions / activation bands
- courtyard-void placement
- exit position

### RETIRE / CORRECT
- literal interpretation of stale `no-enemy` cue
- simultaneous two-guard courtyard pressure
- another tall vertical climb
- unnecessary Safe/Flow route-choice language

## 23. Five Gates

MAP SCALE:
**PASS**

MAP SIMILARITY:
**PASS**

OBSTACLE FUNCTION:
**PASS**

LENGTH / PACING:
**HYPOTHESIS PASS — PLAYTEST REQUIRED**

CURRENT GITHUB RUNTIME:
**2-SLOT + COURTYARD VOID + ENTRY STORY MATCH / `no-enemy` CUE CONFLICT IDENTIFIED / MAJOR TOPOLOGY RE-AUTHOR**

User approved. REV8.0 package is authoritative.


---

## 24. PACKAGING-TIME RE-AUDIT

Final packaging baseline:
`2ea921fed1fee27a4b3837ecde3281d5cd3390dd`

The latest `main` changed after Draft approval due a Quick Tunnel / root `index.html` operational deployment update.
The actual 2-6 area catalog and authored Story contract remained unchanged.

Verified at packaging:
- current 2-6 Runtime remains `1472×1216`
- current slots remain exactly 2:
  - `courtyard-left-guard` → `SECTOR_02_SUPPORT_POOL`
  - `courtyard-right-guard` → `SECTOR_02_LATE_POOL`
- current `courtyard-void` background Story prop remains
- current cue still contains stale literal `no-enemy` wording
- current Entry Story remains:
  `RESIDENTIAL BLOCKS / 12–18`
- presentation directory still has no dedicated Player Bark layer

Therefore the approved REV8 topology and Story direction remain valid.
