# SECTOR 02-1 — WORKER BLOCK 12 — REV8.1

> **DESIGN LOCKED**
> Runtime audit baseline: `447e6c11e0a007364809aaad634afcb499a2d309`
> Previous package: `REV8.0 — SUPERSEDED / DO NOT IMPLEMENT`
> Current Runtime: `1152×1024`
> REV8.1 target: **`1440×832`**
> Spatial signature: **DIAGONAL ROWHOUSE CUT-THROUGH / STAGGERED LOW-RISE TERRACES**
> Runtime status: `STORY + SLOT MATCH / MAJOR GEOMETRY RE-AUTHOR / PATROL POOL CORRECTION`

## 1. Revision reason

REV8.0 correctly established:
- low-rise Worker Housing
- human-scale residential Story
- static Security residue
- Group C Notice

But its movement skeleton was:

`L→R → rise → R→L → rise → L→R`

That overlaps too strongly with 1-7's Chambered S-Curve.

REV8.1 fixes the topology.

New dominant movement:

**`LOWER-LEFT → MID-CENTER → UPPER-RIGHT`**

There is only one small local leftward offset.

No repeated full-width reversals.

## 2. One-line experience

The Player cuts diagonally through several adjacent 2–3 storey Worker Rowhouses,
using broken low-rise residential circulation as Rope infrastructure,
then discovers Group C evacuation instructions on a small Community Terrace.

Core:
`LOWER ALLEY → SMALL COURT → UTILITY LANDING → LAUNDRY OFFSET → UPPER GALLERY → COMMUNITY TERRACE → EXIT`

## 3. Sector 02 first impression

Lead with:
- human-scale doors
- narrow shared galleries
- exterior stairs
- laundry
- worn railings
- close neighboring façades

Do NOT lead with:
- giant vertical city
- residential tower atrium
- huge open void
- skyline spectacle

2-1 is the **lower Worker Housing tier**.

The city can grow taller later.

## 4. Latest Runtime — VERIFIED

At `447e6c11e0a007364809aaad634afcb499a2d309` current 2-1:
- `WORKER BLOCK 12`
- `RESIDENTIAL COURTYARD`
- bounds `1152×1024`
- nextAreaId `sector-02-02`
- one `courtyard-guard` slot
- current slot uses `SECTOR_02_STANDARD_POOL`
- that pool includes `patrol-drone-t1`
- Community Notice story-display exists
- exit objective/panel chain exists

Current 2-2:
- `PATROL WALKWAY`
- `FIRST MOVING SECURITY`
- explicit `patrol-drone-t1` object exists

Therefore:
**2-1 Patrol Drone is forbidden.**

## 5. Enemy authority

Keep exactly:
**1 slot**

Identity:
**LEGACY STATIC SECURITY RESIDUE**

Preferred minimal Runtime correction:
fixed `sentry-t1`.

Contract:
- kill optional
- no Rope cut
- low pressure
- activation-band only
- one readable firing angle
- no kill gate

Do NOT resolve:
`patrol-drone-t1`

2-2 owns the first moving-security reveal.

## 6. Scale

Target:
`1440×832`

Local:
- X `-720..+720`
- Y `0..-832`

Why:
- low-rise density
- long diagonal progression
- short/medium Rope spans
- no giant courtyard
- no three-band S shape

## 7. Spatial signature

```text
                                            COMMUNITY TERRACE / EXIT
                                                  ───────►
                                               /
                                    UPPER SHARED GALLERY
                                           /
                                LAUNDRY LANDING
                                     ↙ small offset
                                  /
                         MID UTILITY LANDING
                               /
                       SMALL COURTYARD
                            /
ENTRY → LOWER ALLEY ───────
```

Dominant:
**LEFT → RIGHT + UP**

Secondary:
one short left correction.

Movement identity:
**DIAGONAL INFILTRATION THROUGH ROWHOUSES**

not:
**CHAMBERED S-CURVE**

## 8. Entry

Entry:
`(-624,-32)`

Entry Walk:
- center `(-560,0)`
- W352

Lower Alley:
- center `(-448,-96)`
- W288

First ~5–8 seconds:
quiet human-scale read.

Verified Entry Story:
`WORKER BLOCK 12 / RESIDENTIAL COURTYARD`

No Bark.

## 9. Small Courtyard Cut

A:
`(-384,-176)`

B:
`(-96,-256)`

Court Landing:
- center `(+96,-288)`
- W256

Movement:
diagonal right/up.

A→B ≈299px.

B→Court Landing ≈195px.

Comfortable Base Rope.

No giant aerial crossing.

## 10. Lower recovery

R1:
- center `(-192,-112)`
- W224

R2:
- center `(+16,-208)`
- W224

Retry:
`3–5s`

No instant death.

## 11. Mid Rowhouse Cut

C:
`(+224,-352)`

Mid Utility Landing:
- center `(+320,-384)`
- W224

Security:
around `(+384,-384)`.

The Player passes through this Landing.

Do not convert to combat arena.

## 12. Laundry Offset

D:
`(+160,-464)`

Laundry Landing:
- center `(-32,-496)`
- W256

This is the only meaningful leftward correction.

Architectural cause:
- broken exterior stair
- obstructed façade circulation
- laundry / utility landing offset

It is not:
- a full-floor reversal
- a second lane
- an S-chamber

After this,
progress resumes up-right.

## 13. Mid recovery

R3:
- center `(+160,-320)`
- W224

R4:
- center `(-64,-416)`
- W208

Retry:
`3–6s`

## 14. Upper Gallery Cut

E:
`(+160,-576)`

F:
`(+416,-640)`

Upper Shared Gallery:
- center `(+480,-672)`
- W288

Movement:
up-right.

Laundry Landing→E ≈221px.

E→F ≈264px.

The Player now moves continuously toward the exit side.

## 15. Story Safe Landing

Story Landing:
- center `(+288,-704)`
- W256

Fully safe.

Final art:
- multiple doors
- laundry
- storage
- chair
- small plant
- meal trace

Player Bark A:
`…다 어디 간 거지?`

Status:
`NOT IMPLEMENTED — PLAYER BARK LAYER`

## 16. Community Terrace

G:
`(+416,-752)`

Community Terrace:
- center `(+536,-768)`
- W320

Safe.

Verified Community Notice:

1.
`COMMUNITY NOTICE / EVACUATION GROUP C`

2.
`ASSEMBLY: BLOCK 12 / WAIT FOR FURTHER INSTRUCTION`

Player Bark B:
`…여기서 기다리라고 한 건가.`

Exit:
upper-right around `(+640,-784)`.

## 17. Story arc

`RELIEF → LIVED-IN RECOGNITION → ABSENCE → PROCEDURE EVIDENCE → QUESTION`

S0:
Worker Block 12.

S1:
front-door-scale traversal.

S2:
one static powered Security residue.

S3:
domestic traces accumulate.

S4:
`…다 어디 간 거지?`

S5:
Group C Notice.

S6:
Wait instruction.

S7:
`…여기서 기다리라고 한 건가.`

Exit to 2-2.

## 18. Story restraint

Do not reveal:
- Group A/B details
- transfer suspended
- priority transfer
- intentional abandonment
- sabotage
- confirmed harm

This Stage asks:
**Where did everyone go?**

It does not answer.

## 19. Camera

Current 2-1 has no required custom camera contract.

REV8.1:
**default camera preferred.**

Composition:
- next upper-right support remains visible
- nearby façade stays in frame
- empty sky is not dominant
- no forced cinematic pan
- no dramatic scale-reveal zoom

## 20. Augment expression

Current build persists.

Natural:
- fast-launch → diagonal chain speed
- long-rope → earlier support catch
- fast-recover → local miss recovery
- release-propulsion → forward carry
- direction-dash → landing correction
- slow-fall → staggered terrace correction
- combat cards → optional static Security handling

No card-specific route.

## 21. 1-7 similarity correction — DESIGN LOCK

1-7:
```text
LOWER  L→R
          ↑
MIDDLE R→L
          ↑
UPPER  L→R
```

2-1 REV8.1:
```text
ENTRY → ↗ → ↗
           ↙ small local offset
             ↗ → ↗ EXIT
```

Forbidden regression:
- three full horizontal bands
- full-width alternating reversal
- end-wall rise after every lane
- safe center chamber
- repeated L→R / R→L / L→R

If implementation recreates those:
**REDESIGN**

## 22. Similarity matrix

### vs 1-1
Overlap: elevation only.
PASS.

### vs 1-2
No meaningful overlap.
PASS.

### vs 1-3
No meaningful overlap.
PASS.

### vs 1-4
No meaningful overlap.
PASS.

### vs 1-5
No deliberate drop/relaunch or Horseshoe.
PASS.

### vs 1-6
No giant cross-flow or Wind.
PASS.

### vs 1-7
Only one short directional correction.
PASS.

### vs 1-8
No counterflow combat lanes.
PASS.

Maximum meaningful overlap:
**1**

## 23. Obstacle function

Primary:
**BROKEN DIAGONAL RESIDENTIAL CIRCULATION**

Causal sequence:
- lower alley terminates
- adjacent court structure survives
- utility landing remains
- exterior stair path is interrupted
- laundry landing provides offset
- upper shared gallery remains

Rope follows fragments of real residential circulation.

## 24. Pacing

First:
`1:00–1:30`

Mastered:
`0:28–0:45`

REDESIGN if:
- feels like S-curve
- repeated full-width reversals reappear
- diagonal route becomes trivial staircase
- walking dominates
- Security becomes main event
- domestic evidence is skipped
- Notice is reached before lived-in traces
- first >1:45 without repeated misses

## 25. Five Gates

MAP SCALE:
**PASS**

MAP SIMILARITY:
**PASS — REV8.0 / 1-7 CONFLICT RESOLVED**

OBSTACLE FUNCTION:
**PASS**

LENGTH / PACING:
**HYPOTHESIS PASS — PLAYTEST REQUIRED**

CURRENT GITHUB RUNTIME:
**STORY + SLOT MATCH / MAJOR GEOMETRY RE-AUTHOR / PATROL FAMILY CORRECTION**

## 26. 1-8 → 2-1 Seam dependency

Before final connector:
1. land/reconcile approved 1-8
2. identify current Sector checkpoint/transition owner
3. inspect actual 2-1 spawn
4. minimally adjust Entry connector
5. preserve REV8.1 diagonal internal topology

## 27. 2-1 → 2-2 handoff

2-2 explicitly owns:
`PATROL WALKWAY / FIRST MOVING SECURITY`

Therefore 2-1 must not:
- spawn Patrol
- show Patrol silhouette
- use moving Patrol lock-cycle as gameplay
- teach patrol-path timing

## 28. Gameplay Preview

Gameplay-only.

Show:
- collision
- Grapple
- recovery
- static Security
- route
- exit

Hide:
- doors
- windows
- laundry
- plants
- furniture
- Notice art
- housing façade
