# ONE ROPE — SECTOR 03-6 GRAND CENTRAL ATRIUM — REV8 STAGE DRAFT

> Status: DESIGN LOCKED  
> Runtime audit baseline: `d39cbb49d3d8247caf2542393994704292dd5002`  
> Sector 03 identity: **CENTRAL EXCHANGE COMPLEX — 수직 상업·환승 복합시설**  
> Current Runtime name: `PREMIUM ATRIUM`  
> Current Runtime subtitle: `LARGE MOVEMENT`  
> Proposed canonical name: **`GRAND CENTRAL ATRIUM`**  
> Current Runtime bounds: `1280×1440`  
> Proposed REV8 target: **`4352×2176`**  
> Spatial Signature: **GRAND ATRIUM FLIGHT CIRCUIT / LOWER LONG FLIGHT → EAST SKY LOBBY RISE → CENTRAL LEFTWARD SECURITY CROSSING → UPPER FREE-FLOW ARC**  
> Dominant Movement: **`↗ LONG → ↑ → ← LONG → ↗ LONG`**  
> Stage Role: **SECTOR 03 SCALE CLIMAX / AWE + FLOW / BUILD EXPRESSION**

---

# 0. LATEST RUNTIME — VERIFIED

Latest `main`:

`d39cbb49d3d8247caf2542393994704292dd5002`

Current `sector-03-06`:

- name `PREMIUM ATRIUM`
- subtitle `LARGE MOVEMENT`
- bounds `1280×1440`
- entry `(-512,-32)`
- next `sector-03-07`

Scanner:
- one group:
  `sector-03-06:scanner-premium-atrium-A`
- controlled:
  - `sector-03-06:c1-surface`
  - `sector-03-06:c2-surface`
- cycle:
  `1.5 / .6 / 1.1 / .3`

Current enemy slots = **3**

1. `sector-03-06:drone-1`
   - fixed Patrol Drone
   - speed 48
   - wait .45
   - pingpong
   - no Rope Cut

2. `sector-03-06:atrium-lower-guard`
   - Support Pool

3. `sector-03-06:atrium-upper-guard`
   - Late Pool

Current old Stage README saying `Patrol Drone ×1` only is stale.
Current Runtime 3-slot composition is authority.

No:
- Access Module
- Wind
- Rope Cut
- new enemy behavior
- new Rope input

Exit:
`final deck → exit panel → physical crossing → 3-7`

---

# 1. CURRENT STORY — VERIFIED

Stable Story objects:

`sector-03-06:atrium-id`

```text
PREMIUM ATRIUM
```

`sector-03-06:power-state`

```text
LOCAL POWER BUS
ACTIVE
```

```text
COMMERCIAL SERVICE NETWORK
ONLINE
```

`sector-03-06:upper-concourse`

```text
UPPER CONCOURSE
```

`sector-03-06:access-control-ahead`

```text
ACCESS CONTROL AHEAD
```

Story role:

> **SYSTEM IS HEALTHY / PEOPLE ARE ABSENT**

Do not reveal in 3-6:
- exact Priority user
- Group A/B identity
- Group C cause
- class mapping
- deliberate sacrifice
- corporate decision-maker

3-7 owns the next access/story pressure.

---

# 2. CORE DESIGN QUESTION

3-5:
`safe build choice / local-vs-vertical authority`

3-6:

> **“이 큰 Atrium에서 내 현재 Rope Build로 얼마나 오래 Flow를 유지할 수 있는가?”**

This is not a new-mechanic Stage.

Formula:

`LARGE VOID + KNOWN SCANNER + KNOWN PATROL + CURRENT BUILD → LONG COMMIT → KEEP FLOW`

3-5 Augment #3 may change how the Player prefers to move,
but no card is mandatory.

Base Rope + base punch must clear.

---

# 3. WHY 3-6 MUST BE THE BIGGEST SO FAR IN SECTOR 03

3-5 deliberately compressed to `2688×1248`.

3-6 immediately expands to:

> **`4352×2176`**

The contrast must be visible in the first camera frame.

The Player should feel:

> `“I came out of a staff-side pocket into the center of the whole commercial complex.”`

This is Sector 03's major scale climax.

---

# 4. ONE SPACE, NOT MANY ROOMS

3-6 is **one continuous Grand Atrium**.

Architectural elements are all public-commercial circulation:

- Lower Grand Balcony
- East Event Balcony
- East Sky Lobby / Panorama Balcony
- Suspended Central Wayfinding Crossing
- West Upper Gallery
- Upper Concourse

No:
- plant floor
- infrastructure tunnel
- service shaft identity
- small-room serial sequence

The Player should always perceive the same giant central Void.

---

# 5. MASTER SILHOUETTE

```text
Y -2176

                                 EXIT → 3-7
                             UPPER CONCOURSE █████
                                 ↗  F4 ●
                              ↗ F3 ●
                           ↗ F2 ●
                    ↗ F1 ●
 WEST UPPER GALLERY █████
     LATE GUARD ●
           ↑
           └──── G10 ● ← G9 ● ← G8 ● ← G7 ● ← C2 ●
                      CENTRAL SECURITY CROSSING
                                        ↙ PATROL BAND

                                              EAST SKY LOBBY █████
                                                    ↑
                                                   V2 ●
                                                    ↑
                                                   V1 ●
                                                    ↑
                              EAST EVENT BALCONY █████
                                SUPPORT GUARD ●
                                           ↗
                              G4C ● ← flight path
                           ↗ G4B ●
                        ↗ G4 ●
                     ↗ G3 ●
                  ↗ G2 ●
               ↗ C1 ●
            ↗ G1 ●
 LOWER GRAND BALCONY █████

 ENTRY ████

       <----------- ONE HUGE GRAND ATRIUM VOID ----------->

Y 0
```

The movement reads:

> **`↗ LONG → ↑ → ← LONG → ↗ LONG`**

Not a staircase.

Not a tight switchback.

Not one overall direction.

---

# 6. PHASE A — ATRIUM REVEAL

Bounds:
- X `-2176..+2176`
- Y `0..-2176`

Entry:
`(-1920,-64)`

P0 Entry:
- W256
- Y0

P1 Lower Grand Balcony:
- X `-1904..-1456`
- W448
- Y `-192`

No enemy.
No Scanner.

Camera shows:
- Player
- first 2–3 aerial targets
- huge empty Void
- distant East Event Balcony
- upper layers far above

Do not reveal the entire final route as a HUD line in Runtime.

The architecture itself should make the scale legible.

---

# 7. PLAYER BARK — PROPOSED

At first full Atrium reveal:

> **`…잠깐, 위가 어디까지야.`**

Reason:
- immediate physical/spatial surprise
- not a tutorial
- no story theory
- fits AWE
- does not repeat 3-1 `불이 들어와 있어`

Latest Runtime has local Player Bark capability.

Status:
**RUNTIME CAPABILITY VERIFIED / 3-6 BARK NOT YET AUTHORED**

Use speaker-head local typing bubble.
Never System Toast.

---

# 8. PHASE B — LOWER LONG FLIGHT / C1

From P1:

G1:
`(-1280,-320)`

C1:
`(-920,-448)`

G2:
`(-560,-576)`

G3:
`(-200,-704)`

G4:
`(+160,-832)`

G4B:
`(+520,-900)`

G4C:
`(+880,-928)`

P2 East Event Balcony:
- X `+1024..+1472`
- W448
- Y `-928`

Movement:

> **one sustained long up-right flight across the lower half of the Atrium**

C1 is the only Scanner-controlled mount in this flight.

No Patrol.

Purpose:
- use known Scanner timing inside a long Flow chain
- first giant cross-void commitment
- make the Player small relative to architecture

C1 same Scanner group as C2.

---

# 9. C1 SCANNER RULE

Preserve:

`sector-03-06:scanner-premium-atrium-A`

Cycle:

`AVAILABLE 1.5 → WARNING .6 → LOCKED 1.1 → RESET .3`

C1:
- new attach allowed AVAILABLE/WARNING
- denied LOCKED/RESET
- existing Rope persists through LOCK
- no damage
- no forced detach
- no knockback
- no Rope Cut

The chain must remain Base-Rope clear.

---

# 10. LOWER SUPPORT GUARD — SLOT 1 OF 3

Stable:

`sector-03-06:atrium-lower-guard`

Authority:
`SECTOR_03_SUPPORT_POOL`

REV8 placement:
East Event Balcony around `(+1280,-928)`.

Rules:
- activates only after landing P2
- cannot pressure lower flight before landing
- cannot pressure East Sky Lobby
- no Scanner overlap
- no Patrol overlap
- kill optional
- no kill gate
- no Rope Cut

Purpose:

> break the long flight with one short grounded/local pressure beat.

Not the Stage climax.

---

# 11. PHASE C — EAST SKY LOBBY RISE

From P2 right edge:

V1:
`(+1480,-1120)`

V2:
`(+1440,-1320)`

P3 East Sky Lobby:
- X `+1216..+1600`
- W384
- Y `-1408`

Movement:

> **mostly vertical**

This is not a shaft.

It is the tall open east edge of the same public Atrium:
- stacked balcony faces
- panorama / event lobby level
- open sightline back across the Void

P3 is FULL SAFE.

The Lower Guard pressure must end before P3.

---

# 12. P3 — SECURITY OBSERVATION SAFE

From P3 the Player can see:

- C2
- Patrol path
- the entire leftward central crossing
- West Upper Gallery destination
- final upper route hinted beyond

P3 is the decision point.

No incoming fire.

No Scanner pressure reaches the standing area.

The Player reads:

`Scanner phase + Patrol position → commit leftward`.

---

# 13. PHASE D — CENTRAL LEFTWARD SECURITY CROSSING

C2:
`(+1184,-1496)`

G7:
`(+832,-1536)`

G8:
`(+480,-1576)`

G9:
`(+128,-1616)`

G10:
`(-224,-1656)`

P4 West Upper Gallery:
- X `-960..-576`
- W384
- Y `-1680`

Movement:

> **LONG LEFT / slightly upward across the center of the Grand Atrium**

This is the 3-6 gameplay peak.

C2 = Scanner-controlled.

Patrol overlaps the central portion of the crossing.

The Player is not climbing a narrow corridor;
they are crossing a large visible public Void while security moves through it.

---

# 14. PATROL — SLOT 2 OF 3

Stable:

`sector-03-06:drone-1`

REV8 proposed path:

> `(+960,-1512) ↔ (+240,-1600)`

This is a shallow diagonal Patrol across the central aerial crossing.

Supported by current arbitrary 2D Patrol runtime.

Preserve:
- speed 48
- wait .45
- pingpong
- target-lock cycle
- kill optional
- no Rope Cut

Activation band intent:
- central crossing only
- P3 observation safe
- P4 pressure ends

This is NOT new behavior.
Only authored path orientation changes.

---

# 15. C2 + PATROL COMMIT

Decision:

```text
C2 STATE
+
PATROL POSITION
+
CURRENT BUILD
↓
LEFTWARD COMMIT
```

The Player should be able to:

- wait safely on P3
- commit when Scanner/Patrol relation is favorable
- sustain multiple Rope releases across the Void
- land on P4

No second Scanner group.

No faster Scanner.

No Damage Floor.

---

# 16. UPPER LATE GUARD — SLOT 3 OF 3

Stable:

`sector-03-06:atrium-upper-guard`

Authority:
`SECTOR_03_LATE_POOL`

Placement:
West Upper Gallery around `(-768,-1680)`.

Rules:
- activates only after Player lands P4
- no C2 Scanner overlap
- no Patrol overlap after landing
- kill optional
- no kill gate
- no Rope Cut
- cannot attack P3 observation zone

Purpose:

> short local pressure between Security peak and final pure Flow.

---

# 17. PHASE E — UPPER FREE-FLOW ARC

After P4:

F1:
`(-320,-1800)`

F2:
`(+32,-1880)`

F3:
`(+384,-1960)`

F4:
`(+736,-2040)`

Exit Deck P5:
- X `+1024..+1344`
- W320
- Y `-2070`

Movement:

> **one final long up-right aerial arc**

No Scanner.
No Patrol.
No new enemy acquire.

This is the emotional payoff:

> **FLOW AFTER READING THE SYSTEM**

The Stage ends with movement, not another puzzle.

---

# 18. STORY PLACEMENT

## Atrium Reveal

`sector-03-06:atrium-id`

```text
PREMIUM ATRIUM
```

Use near P1.

## East Event / powered-space confirmation

`sector-03-06:power-state`

```text
LOCAL POWER BUS
ACTIVE
```

```text
COMMERCIAL SERVICE NETWORK
ONLINE
```

Use around P2 / lower-mid Atrium.

Important:
`LOCAL POWER BUS` is system status copy.
It must NOT turn the architecture into an infrastructure/busway Stage.

## Upper Gallery

`sector-03-06:upper-concourse`

```text
UPPER CONCOURSE
```

## Exit Preview

`sector-03-06:access-control-ahead`

```text
ACCESS CONTROL AHEAD
```

This hands off to 3-7 without revealing its full access hierarchy.

---

# 19. STORY FUNCTION

3-6 reveals no major new secret.

It strengthens the contrast:

```text
WORKER DISTRICT
evacuation / transfer failure
vs
CENTRAL EXCHANGE
power / network / premium public space still operating
```

The Player experiences the evidence physically:
- huge space
- active systems
- empty public circulation
- automated security still functioning

Do not write a System message that says:
`UPPER CLASS AREA PRESERVED`
or any equivalent interpretation.

Let the Player infer.

---

# 20. RECOVERY

Recovery A:
under lower long flight.

Intent:
- fail C1/early release → 5–7s retry
- returns to lower flight setup
- cannot bypass C1

Recovery B:
under central security crossing.

Intent:
- fail C2/patrol crossing → 5–7s retry
- returns toward P3 setup
- cannot land beyond C2
- Patrol must not sustain fire into recovery

No full-stage reset.

---

# 21. CAMERA

## Entry / Reveal
Wide enough to show:
- Player small in frame
- distant East Event Balcony
- multiple vertical levels
- large central emptiness

## Lower Long Flight
Camera leads horizontally enough to maintain G2/G3/G4 readability.
Do not zoom so far out that Player/Rope becomes tiny.

## East Vertical Rise
Camera emphasizes height and the next upper landing.

## P3 Observation
Player + C2 + Patrol + full leftward destination.

Critical:
the Player must understand that next movement is **leftward across the Atrium**, not continuing upward/right.

## Security Crossing
Preserve central Void scale while keeping:
- Scanner target state
- Patrol
- next anchor
readable.

## P4
Frame local Late Guard and final up-right route separately.

## Final Free Flow
Camera should lead into the large arc and give breathing room.

---

# 22. MULTIPLAYER

No synchronized traversal.

Players may:
- leave P3 at different Scanner cycles
- cross separately
- wait on safe balconies
- use different Augment builds

No party gate at P3/P4.

No shared scanner phase modification per Player.

World remains continuous.

---

# 23. MAP SIMILARITY

## vs 3-1
Overlap:
- one huge commercial Void

3-1:
`Suspended Market Island Arch`
with one central island and long rise/fall.

3-6:
`Grand Atrium Flight Circuit`
with long lower flight, east vertical rise, long leftward security cross, final upper flight.

Meaningful overlap = **1**.

PASS.

## vs 3-2
3-2:
three-layer Media Wall wrap, facade/backside.

3-6:
single open public Atrium with cross-void flights.

Overlap = 0.

PASS.

## vs 3-3
Overlap:
direction changes.

3-3:
tight escalator switchback:
`↗→↖→↘→↖→↗`

3-6:
large-flight macro rhythm:
`↗ LONG → ↑ → ← LONG → ↗ LONG`

Meaningful overlap = **1**.

PASS.

## vs 3-4
3-4:
Y split / Public vs Service route choice.

3-6:
one mandatory open-flow circuit.

Overlap = 0.

PASS.

## vs 3-5
3-5:
compressed back-of-house sectional interchange.

3-6:
monumental Public Atrium.

Overlap = 0.

PASS.

Maximum meaningful overlap:

> **1 / PASS**

---

# 24. OBSTACLE FUNCTION

Every gameplay phase comes from public Atrium architecture.

- Lower Grand Balcony = lower public concourse
- East Event Balcony = broad event / retail landing
- East Sky Lobby = stacked open public balcony
- Central crossing = suspended wayfinding / concourse link
- West Upper Gallery = upper public gallery
- Upper Concourse = 3-7 approach

The central Void is the architectural reason for long Rope flights.

No arbitrary floating obstacle course.

---

# 25. PACING

Difficulty:

**★★★☆**

First play:
**2:45–3:55**

Mastered:
**1:05–1:40**

Expected rhythm:

- Reveal / first flight: 35–55s
- East local pressure + rise: 35–55s
- P3 read + central security crossing: 45–70s
- upper local pressure + free-flow finish: 35–55s

REDESIGN if:
- Stage visually becomes one diagonal staircase
- first flight feels like a rope ladder of tiny equal gaps
- P3 next direction is not clearly left
- C2+Patrol cannot be read before commit
- Lower Guard overlaps C1 flight
- Upper Guard overlaps C2 crossing
- final arc still has security pressure
- architecture reads as infrastructure instead of public commercial Atrium
- Player cannot feel the massive size difference from 3-5

---

# 26. CURRENT RUNTIME GATE

## KEEP
- `sector-03-06`
- one Scanner group C1/C2
- Scanner cycle unchanged
- `drone-1`
- `atrium-lower-guard`
- `atrium-upper-guard`
- exactly 3 enemy slots
- Support / Late Pool roles
- Story IDs and exact System copy
- no Access Module
- no Wind
- no Rope Cut
- final deck → panel → physical crossing → 3-7

## RE-AUTHOR
- canonical name:
  `PREMIUM ATRIUM` → `GRAND CENTRAL ATRIUM`
- bounds:
  `1280×1440` → `4352×2176`
- all Stage geometry
- Scanner target positions
- Patrol path
- enemy activation bands
- Story placement
- Camera/readability zones
- recovery geometry

---

# 27. FIVE GATES

MAP SCALE:
**PASS**
`4352×2176` and visually largest Sector 03 public space so far.

MAP DIRECTION / VARIETY:
**PASS CANDIDATE**
`↗ LONG → ↑ → ← LONG → ↗ LONG`

MAP SIMILARITY:
**PASS**
Maximum meaningful overlap = 1.

OBSTACLE FUNCTION:
**PASS**
One Grand Atrium Void causally creates long flights and public balcony transitions.

CURRENT RUNTIME:
**PASS**
1 Scanner Group + Patrol + Support Guard + Late Guard = 3 slots + 4 Story objects + 3-7 Exit preserved.

---

# 28. APPROVAL STATUS

```text
3-6 GRAND CENTRAL ATRIUM
REV8 DRAFT

4352×2176

LOWER GRAND BALCONY
      ↗ LONG
C1 / LOWER FLIGHT
      ↗
EAST EVENT BALCONY
SUPPORT GUARD
      ↑
EAST SKY LOBBY / SAFE READ
      ← LONG
C2 + DIAGONAL PATROL
CENTRAL SECURITY CROSSING
      ←
WEST UPPER GALLERY
LATE GUARD
      ↗ LONG
UPPER FREE FLOW
      ↗
EXIT → 3-7

USER APPROVED / DESIGN LOCKED
```

## Mandatory Rope sanity
- `P1→G1` = `217.62px`
- `G1→C1` = `382.08px`
- `C1→G2` = `382.08px`
- `G2→G3` = `382.08px`
- `G3→G4` = `382.08px`
- `G4→G4B` = `366.37px`
- `G4B→G4C` = `361.09px`
- `G4C→P2` = `144.00px`
- `P2→V1` = `192.17px`
- `V1→V2` = `203.96px`
- `V2→P3` = `182.60px`
- `P3→C2` = `93.64px`
- `C2→G7` = `354.27px`
- `G7→G8` = `354.27px`
- `G8→G9` = `354.27px`
- `G9→G10` = `354.27px`
- `G10→P4` = `352.82px`
- `P4→F1` = `282.73px`
- `F1→F2` = `360.98px`
- `F2→F3` = `360.98px`
- `F3→F4` = `360.98px`
- `F4→Exit` = `289.56px`

Maximum mandatory relation = `382.08px`.
All mandatory links ≤400px.


---

# 29. PACKAGING-TIME RE-AUDIT

Final packaging baseline:

`d39cbb49d3d8247caf2542393994704292dd5002`

Verified current Runtime contract:
- source area `sector-03-06`
- current Runtime name `PREMIUM ATRIUM`
- subtitle `LARGE MOVEMENT`
- current Runtime bounds `1280×1440`
- one Scanner group:
  `sector-03-06:scanner-premium-atrium-A`
- C1 + C2 controlled by same Scanner group
- `sector-03-06:drone-1` = Patrol
- `sector-03-06:atrium-lower-guard` = Support Pool
- `sector-03-06:atrium-upper-guard` = Late Pool
- exactly 3 enemy slots
- Story objects:
  - `atrium-id`
  - `power-state`
  - `upper-concourse`
  - `access-control-ahead`
- no Access Module
- no Wind
- no Rope Cut
- Exit remains:
  `final-deck-reached → exit-panel-engaged → physical crossing → sector-03-07`

REV8.0 re-authors the old compact vertical Premium Atrium into one monumental public-commercial Atrium while preserving these Runtime contracts.
