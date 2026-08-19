# SECTOR 02-3 — RESIDENTIAL SERVICE NODE — REV8.0

> **DESIGN LOCKED**
> Runtime audit baseline: `c042f614f07ff62184aca3d0c128c89f51f25708`
> Current Runtime: `960×768`
> REV8 target: **`1344×576`**
> Spatial signature: **SIDE-LOADED COMMUNAL UTILITY HALL / ONE-WAY SAFE THRESHOLD**
> Stage role: **APPROACH → SELECT → EXIT**
> Runtime verdict: `GENERIC AUGMENT + 1 SLOT MATCH / STALE DOC CONFLICT / MAJOR GEOMETRY RE-AUTHOR`

## 1. Revision decision

Initial REV8 Draft proposed:
`APPROACH → SELECT → FEEL → EXIT`.

That was rejected after a direct 1-4 Runtime comparison.

Current actual 1-4 already owns:
- Augment Node
- 1 enemy slot
- safe Node Deck
- post-choice Calibration
- Calibration Dummy
- authored Calibration Camera

Therefore 2-3 must not repeat a post-choice Rope/Calibration phrase.

Final REV8:
**ACTIVE APPROACH → ONE EASY ROPE THRESHOLD → SAFE COMMUNAL NODE HALL → SELECT → FLAT EXIT**

Selection is the reward.
2-4 is the experiment.

## 2. Latest 2-3 Runtime facts — VERIFIED

At `c042f614f07ff62184aca3d0c128c89f51f25708`:
- area `sector-02-03`
- `RESIDENTIAL SERVICE NODE`
- subtitle `AUGMENT SERVICE`
- bounds `960×768`
- stable Node object ID:
  `sector-02-03:specialization-node`
- objective:
  `sector-02-03:specialization-selected`
- type:
  `interact-choice`
- nextAreaId:
  `sector-02-04`
- exactly 1 current enemy slot:
  `node-approach-guard`
- current enemy pool:
  `SECTOR_02_SUPPORT_POOL`
- `area03Landmarks = []`

Current Sector 02 density authority:
2-3 = **1 slot**.

Old docs that say `Enemy NONE` are superseded by current code.

## 3. Generic Augment authority — VERIFIED

Despite the legacy stable object ID `specialization-node`,
2-3 is not a Foundation/Specialization tier.

It is:
**the second generic Augment source**.

Current contract:
- same 22-card Catalog
- compatible deterministic 3-card offer
- no reroll
- no rarity
- no category quota
- Player max 6 cards
- Player-specific source consumption
- chooser captures selecting Player gameplay input only
- world/enemies/projectiles/teammates continue
- source/pending selection persists through death/rejoin/wipe
- shared outbound completes after current channel Players consume source
- departed Players do not deadlock
- late joiner may still receive personal offer without relocking an opened route

Do not reintroduce player-facing:
- Foundation tier
- Specialization tier
- fixed Foundation prerequisite
- fixed three legacy Foundation choices

## 4. Verified Story

Entry:
`AUGMENT SERVICE NODE`
`OFFER 2 AVAILABLE`

Node region:
`GRAPPLE DEVICE`
`DETECTED`

then:
`EMERGENCY CONFIGURATION`
`ACTIVE`

Keep exact.

## 5. Scale

Target:
`1344×576`

Local:
- X `-672..+672`
- Y `0..-576`

Why:
- broad horizontal communal room
- one simple pre-Node Rope action
- no post-choice vertical Calibration stack
- immediately different from 1-4

## 6. Silhouette

```text
ENTRY / ACTIVE SERVICE EDGE
──────── Guard ─────────┐
                        │
                  G1 / easy arc
                        │
                 SERVICE CORE
                   LOS BLOCK
                        │
                        ▼
        ┌──────────────────────────────┐
        │ SAFE COMMUNAL UTILITY HALL  │
        │          [ NODE ]            │
        └──────────────────────→ EXIT  │
```

Dominant:
**LEFT → RIGHT**

Only meaningful Rope phrase:
**before Node**.

Post-choice:
flat safe exit.

## 7. Entry / approach

Entry:
`(-576,-32)`

P0:
- center `(-544,0)`
- W256

Approach Deck:
- center `(-416,-128)`
- W256

Approach Guard:
around `(-384,-128)`.

Player gets a short decompression/read before the Guard becomes relevant.

## 8. Enemy contract

Exactly:
**1 slot**

Identity:
current `node-approach-guard`.

Preserve current Support Pool unless a newer Runtime authority changes it.

Rules:
- kill optional
- no Rope cut
- activation-band only
- Guard death does not gate Node
- no enemy exists inside safe Hall
- Guard pressure ends after threshold

Valid:
- pass
- evade
- kill

No mini-boss.

## 9. Service Core safe threshold

Gameplay Core:
around `(-64,-208)`.

Contract:
- static
- solid
- non-grappleable
- non-damaging
- LOS blocker

G1:
`(-160,-352)`

Safe Hall Landing:
around `(+96,-256)`.

Planning checks:
- Approach center→G1 ≈340px
- G1→Hall landing ≈273px

Both within 400px Base Hook Reach.

Purpose:
1. make one easy Rope transition into the room
2. physically separate active security from chooser safety

The Service Core is a real gameplay blocker,
not background decoration.

## 10. Safe communal utility Hall

Choice Floor:
- center `(+288,-256)`
- W640

Node:
around `(+256,-256)`.

Stable source:
`sector-02-03:specialization-node`.

Node zone:
- Enemy 0
- Hazard 0
- Wind 0
- no instant death
- broad flat floor

Chooser itself does not make Player invulnerable.
Safety comes from authored geometry and encounter separation.

## 11. Player Bark

Approved proposed Bark:

`…이 장비, 여기에도 있네.`

Trigger:
after `GRAPPLE DEVICE / DETECTED`,
after Player has seen the Node embedded in the communal residential utility space.

Purpose:
recognize infrastructure continuity.

Do not explain:
- evacuation
- Group C
- motive
- later Sector truth

Status:
**NOT IMPLEMENTED — PLAYER BARK LAYER**

No second Bark.

## 12. Selection

Interact with the stable Node.

Experience:
`INTERACT → compatible 3-card offer → choose 1 → Player source consumed`

No:
- reroll
- rarity
- category quota
- card-specific room
- shared single card
- first-Player-wins behavior

Different Players may choose different cards.

## 13. Multiplayer

During chooser:
- only selecting Player's relevant gameplay input is captured
- world remains active
- other Players continue

Shared outbound:
opens after all current channel Players consume source.

Departed Player:
removed from required set.

Late joiner after route open:
can still receive their own offer.
Route does not relock.

## 14. After selection — DESIGN LOCK

**NO CALIBRATION.**

No:
- post-choice Grapple test
- G1/G2 calibration route
- Dummy
- proof target
- augment-calibrated objective
- requirement to trigger selected card

The Exit is a short flat safe corridor.

Exit:
around `(+576,-288)`.

Next:
`sector-02-04`.

This is the primary difference from 1-4.

## 15. Residential Story / Art

Final art may show:
- communal electrical distribution
- patched conduit
- locally repaired Node casing
- worker lockers
- charging rack
- worn bench
- old gloves
- cup
- taped labels
- waiting chair

Meaning:
**maintenance infrastructure was embedded in ordinary Worker District life.**

Do not show:
- Group C final truth
- death
- farewell notes
- executive order
- intentional abandonment evidence

## 16. Camera

Current Runtime:
no custom 2-3 Camera Zones.

REV8:
**default Camera only.**

No:
- cinematic Node zoom
- calibration shot
- Camera-held test sequence

Choice UI owns selection focus.

## 17. 1-4 similarity audit

### 1-4 current actual Runtime
- compact vertical calibration chamber
- Node early
- Guard in lower/post-Node calibration band
- Calibration Dummy
- post-choice movement/feedback
- custom Entry/Node/Calibration/Exit Camera

### 2-3 REV8
- broad horizontal communal utility Hall
- Guard before safe threshold
- one pre-Node Rope arc
- no Dummy
- no post-choice Rope
- default Camera

Uniqueness dimensions:
- silhouette: different
- movement axis: different
- Rope rhythm: different
- failure direction: different
- enemy pressure: different
- Augment use: overlap

Meaningful overlap:
**1**

VERDICT:
**PASS**

## 18. Other similarity

2-1:
diagonal outdoor Rowhouse traversal.
PASS.

2-2:
long moving-LOS Patrol Bridge.
PASS.

1-5:
large live Build-expression course.
PASS.

## 19. Obstacle function

Primary:
**SERVICE CORE SAFE THRESHOLD**

Architecture explains:
- one easy Rope arc
- LOS break
- safe chooser room

No filler platform chain.

PASS.

## 20. Pacing

First:
`0:45–1:05` + deliberate choice reading.

Mastered:
`0:20–0:30` + choice time.

Targets:
- entry/approach 5–8s
- Guard + threshold 10–18s
- Node Story 5–8s
- selection variable
- exit 3–6s

REDESIGN if:
- Guard can maintain LOS to Node
- Guard kill is required
- post-choice Rope challenge reappears
- Calibration Dummy/frame reappears
- Stage reads vertically
- room looks like 1-4 corporate Lab
- first >1:15 excluding deliberate menu reading

## 21. Five Gates

MAP SCALE:
**PASS**

MAP SIMILARITY:
**PASS — 1-4 OVERLAP = 1**

OBSTACLE FUNCTION:
**PASS**

LENGTH / PACING:
**HYPOTHESIS PASS — PLAYTEST REQUIRED**

CURRENT GITHUB RUNTIME:
**GENERIC AUGMENT + 1 SLOT MATCH / STALE DOC CONFLICT FOUND / MAJOR GEOMETRY RE-AUTHOR**
