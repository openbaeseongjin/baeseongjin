# SECTOR 02-2 — PATROL WALKWAY — REV8.0

> **DESIGN LOCKED**
> Runtime audit baseline: `447e6c11e0a007364809aaad634afcb499a2d309`
> Current Runtime: `1280×1088`
> REV8 target: **`1792×896`**
> Spatial signature: **LONG RESIDENTIAL PATROL BRIDGE / SINGLE MOVING WINDOW**
> Runtime status: `MECHANIC + STORY + SLOT CONTRACT MATCH / MAJOR GEOMETRY RE-AUTHOR`

## 1. Stage role

2-1:
`LOW-RISE DIAGONAL RESIDENTIAL CUT-THROUGH`

2-2:
**`THE THREAT MOVES`**

New mechanic:
**MOVING ENEMY PATROL**

No:
- new Rope input
- new Rope mode
- Wind
- new Augment
- Rope Cut
- new projectile grammar

Core question:
**고정된 위협이 아니라 위협 자체가 움직이면 Rope 타이밍을 어떻게 바꾸는가?**

## 2. Verified current Runtime

At `447e6c11e0a007364809aaad634afcb499a2d309` current 2-2:
- name `PATROL WALKWAY`
- subtitle `FIRST MOVING SECURITY`
- bounds `1280×1088`
- nextAreaId `sector-02-03`
- explicit `patrol-drone-t1`
- Patrol start `(-320,-416)`
- Patrol end `(+320,-416)`
- speed `48px/s`
- wait `0.45s`
- mode `pingpong`
- rules:
  - kill-optional
  - no-rope-cut
  - target-lock-cycle
  - activation-band-only
- second enemy slot:
  `upper-walkway-guard`
- second slot owns:
  `accessModuleId: sector-02:access-module:a`

Sector 02 enemy budget:
2-2 = exactly **2 slots**.

## 3. Access authority

Sector 02 Carrier stages:
- 2-2
- 2-5
- 2-7

Transit requirement:
**3-of-3**

2-2 Access Module A is therefore globally required later,
but locally optional for finishing 2-2.

Carrier marker:
- off-screen edge arrow
- on-screen diamond
- no authored text label

Do not add a new key item.

## 4. Verified Story

Entry:
`PATROL WALKWAY`
`SECURITY STILL ACTIVE`

Observation status:
`SECURITY PATROL`
`ACTIVE`

then:
`RESIDENTIAL TRANSIT`
`RESTRICTED`

These exact texts stay.

## 5. Story meaning

The district is empty.
Security still operates.

Do not reveal:
- who ordered it
- why Group C waited
- whether residents were intentionally confined
- corporate motive
- sabotage

## 6. Scale

REV8:
`1792×896`

Local:
- X `-896..+896`
- Y `0..-896`

Reason:
the first moving enemy needs a long readable horizontal relationship.

The Player should move meaningfully **along the same transit span** as the Patrol.

The Stage becomes wider and shorter than current Runtime.

## 7. Silhouette

```text
ENTRY
  ↓
SAFE OBSERVE
  ↓
COVER A →====== LONG PATROL BRIDGE ======→ COVER B
             ← DRONE PINGPONG →
                                      ↓
                                  DISENGAGE
                                      ↓
                               SHORT UPPER RISE
                                  ↙ ACCESS A
                                      ↓
                                    EXIT
```

Dominant body trace:
**SAFE OBSERVE → LONG RIGHTWARD PATROL CROSS → DISENGAGE → SHORT RISE → EXIT**

No full-width reversal.

## 8. Entry / observation

Entry:
`(-768,-32)`

P0:
- center `(-720,0)`
- W352

G1:
`(-560,-160)`

Safe Observation Deck:
- center `(-464,-224)`
- W352

The Player must see Drone movement before first meaningful threat exposure.

Do NOT require a complete Patrol cycle.

640px one-way at 48px/s is ~13.3s before end wait,
so forced full-cycle observation would hurt pacing.

Teaching sequence:
**SEE MOVEMENT → READ DIRECTION → CHOOSE TIMING → MOVE**

## 9. Observation Story

After the Player has visibly seen Patrol motion:

1.
`SECURITY PATROL / ACTIVE`

2.
`RESIDENTIAL TRANSIT / RESTRICTED`

Approved Player Bark:
`…사람은 없는데, 순찰은 그대로네.`

Status:
**NOT IMPLEMENTED — PLAYER BARK LAYER**

Trigger only after physical evidence and System status.

## 10. Main Patrol

Planning Patrol baseline:
`(-320,-384) ↔ (+320,-384)`

Preserve current:
- speed 48
- wait 0.45
- pingpong
- target-lock cycle
- kill optional
- no Rope cut
- activation-band behavior

Do not add a new Patrol behavior.

## 11. Cover A

G2:
`(-240,-352)`

Local deck:
- center `(-176,-416)`
- W256

Cover A:
around `(-112,-416)`

Gameplay contract:
- static
- solid
- non-grappleable
- non-damaging
- LOS blocker

Safe route can wait.
Flow route may skip the wait.

## 12. Central moving-LOS crossing

G3:
`(+80,-352)`

Central Deck:
- center `(+64,-416)`
- W224

Possible valid solutions:
- WAIT
- FLOW / OUTRUN
- KILL
- ROPE ABOVE / UNDER depending on trajectory

No single one is globally mandatory.

If optimal play always means standing still behind Cover:
redesign.

If killing is always obviously best:
redesign.

## 13. Cover B / disengage

Cover B:
around `(+240,-416)`

G4:
`(+368,-448)`

Disengage Deck:
- center `(+512,-512)`
- W288

When Player reaches this deck,
the main Patrol lesson is complete.

Do not carry Patrol pressure into the Access Module lesson.

## 14. Recovery

Lower:
- center `(-320,-288)`
- W224

Middle:
- center `(+64,-320)`
- W224

Far:
- center `(+400,-448)`
- W224

Retry:
`2–6s`

Failure first costs:
**POSITION + PRESSURE**
not death.

## 15. Far-right rise

G5:
`(+608,-640)`

Upper Landing:
- center `(+608,-704)`
- W288

Short exit climb only.

No second moving-threat lesson.

## 16. Access Module A branch

Current Runtime second slot remains the Access Carrier.

Branch:
Upper Landing
→ Access Anchor `(+416,-752)`
→ Carrier Balcony `(+256,-800)`
→ return to Upper Landing.

Carrier slot:
around `(+256,-800)`

Access ID:
`sector-02:access-module:a`

Important:
- preserve exactly one second enemy slot
- preserve current Carrier identity/Access ID
- no third enemy
- no escort
- no simultaneous main-Patrol crossfire
- activate only after branch commit
- Module acquisition uses current Carrier-death contract

Locally optional:
Player can exit without collecting A.

Globally:
Sector 02 Transit requires all 3 Carrier modules.

## 17. Exit

Exit Deck:
- center `(+736,-800)`
- W256

Exit:
around `(+800,-832)`

Next:
`sector-02-03`

Threat fully disengaged before Service Node.

## 18. Augment expression

No dedicated Build route.

Current Foundation Build persists.

Examples:
- fast-launch: lower Patrol exposure
- long-rope: earlier central catch
- fast-recover: fast retry
- release-propulsion: cross moving LOS quickly
- direction-dash: landing correction
- slow-fall: moving-angle timing
- combat cards: optional Drone/Carrier removal

No Augment mandatory.

## 19. Camera

Current 2-2 has no custom Camera Zone contract.

REV8:
test default Camera first.

Observation should naturally show at least 3 of:
- Player
- Drone
- one Patrol direction
- Cover A
- G2

If not:
adjust geometry before adding custom Camera.

No cinematic Drone-follow pan.

## 20. Similarity gate

### vs 2-1 REV8.1
2-1 = diagonal Rowhouse cut.
2-2 = long horizontal moving-LOS bridge.
PASS.

### vs 1-6
1-6 = Wind force + large open Plenum.
2-2 = narrow residential bridge + moving threat.
Overlap: long horizontal read only.
PASS.

### vs 1-8
1-8 = counterflow static/sequential Security lanes.
2-2 = one continuous Patrol lane.
PASS.

### vs 1-3
1-3 = vertical spine + huge Access Annex.
2-2 = horizontal Patrol + small post-lesson Access alcove.
Overlap: Access concept only.
PASS.

Maximum meaningful overlap:
**1**

## 21. Obstacle function

Primary:
**MOVING LOS ON BROKEN RESIDENTIAL TRANSIT**

The new variable is:
**WHEN**
not just:
**WHERE**

Covers and Rope geometry let the Player manipulate exposure to a threat whose location changes over time.

## 22. Pacing

Mainline first:
`1:20–1:55`

Mainline mastered:
`0:40–1:00`

With Access A first:
`1:55–2:35`

With Access A mastered:
`1:05–1:25`

HYPOTHESIS.

Redesign if:
- observation needs >8s to understand
- Player is hit before movement is readable
- waiting is always optimal
- killing is always optimal
- Carrier overlaps first Patrol lesson
- Stage feels vertical
- Access branch becomes a large Annex
- first mainline >2:10 without repeated errors

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
**MECHANIC + STORY + SLOT CONTRACT MATCH / MAJOR GEOMETRY RE-AUTHOR**
