# ONE ROPE — SECTOR 03-2 FACADE SERVICE GALLERY — REV8 STAGE DRAFT REV2

> Status: DESIGN LOCKED  
> Runtime audit baseline: `d588aa041a350cab198cd187d8dccbe3b3a244dd`  
> Sector 03 Master Plan: REV3  
> REV1: **HOLD / SUPERSEDED — DIALOGUE AWKWARD + MAP TOO LINEAR**  
> Current Runtime name: `SCANNER GALLERY`  
> Master canonical name: **`FACADE SERVICE GALLERY`**  
> Current Runtime bounds: `1280×1184`  
> Proposed REV2 target: **`3200×1472`**  
> Spatial Signature: **THREE-LAYER MEDIA WALL SERVICE WRAP / UNDERFRAME SWEEP → BACKSIDE RETURN → CROWN DEPARTURE**  
> Dominant body: **`LOWER L→R → MID R→L → UPPER L→R`**  
> Stage role: **FIRST ACTIVE SCANNER TUTORIAL / ARCHITECTURAL WRAP / ACCESS MODULE A**  
> Full package: CREATED — REV8.0 GITHUB-READY

---

# 0. WHY REV1 IS REJECTED

REV1 had two problems.

## Dialogue

Old proposed Bark:

> `…직원은 맞다면서, 경로는 안 된다고?`

Problem:
- sounds like paraphrasing UI text
- uses `직원 / 경로` too mechanically
- emotional reaction is weak

REV2 changes it to:

> **`…인증은 됐는데, 왜 막히는 거지?`**

This reads as immediate confusion rather than exposition.

Second Bark also becomes shorter:

Old:
`…붙어 있는 건 안 끊기네.`

REV2:

> **`…이미 붙은 건 그대로네.`**

## Map

REV1:

```text
DIAGONAL SCANNER CHAIN
→ GUARD
→ DIAGONAL CLEFT
→ EXIT
```

This was still one long bent line.

REV2 makes the Player move around **one giant Media Wall structure on three different service elevations**.

---

# 1. CURRENT RUNTIME AUTHORITY

Current 3-2 contract remains:

- areaId `sector-03-02`
- subtitle `FIRST ACCESS SCAN`
- one deterministic Scanner Group
- Scanner cycle:
  - AVAILABLE 1.5s
  - WARNING 0.6s
  - LOCKED 1.1s
  - RESET 0.3s
- current Rope stays attached through LOCK
- exactly 2 enemy slots
  1. lower Standard Pool Guard
  2. upper Support Pool Access A Carrier
- Access Module:
  `sector-03:access-module:a`
- no Patrol
- no Wind
- no Rope Cut
- Story:
  - Access Control
  - Service Mount
  - Retail Security
- exit → `sector-03-03`

REV2 changes topology, not these contracts.

---

# 2. NEW ARCHITECTURAL IDEA

## THREE-LAYER MEDIA WALL SERVICE WRAP

The Stage is the backside of one enormous commercial Media Wall.

Three maintenance layers:

### LAYER 1 — UNDERFRAME
The underside sign-support rail.

- first Scanner tutorial
- moves left → right

### LAYER 2 — BACKSIDE RETURN GALLERY
A static service catwalk behind the Media Wall.

- Lower Guard at entry
- moves right → left
- no Scanner
- lets Player see the same structure from behind

### LAYER 3 — CROWN SERVICE DECK
Upper signage/electrical crown.

- one Scanner recall
- optional Access A cassette
- long upper departure toward 3-3
- moves left → right

This is one building object read from three elevations.

---

# 3. SCALE

Target:

> **`3200×1472`**

Local:

- X `-1600..+1600`
- Y `0..-1472`

Player path uses:

- Entry X ≈ -1450
- far-right cradle ≈ +1470
- backside return ≈ X 0
- Access branch ≈ -960
- Exit ≈ +1120

The route spans almost the entire width multiple times at different elevations.

Scale comes from architecture,
not empty bounds.

---

# 4. OVERALL SILHOUETTE

```text
Y -1472

               ACCESS A
                  ●
                 /
      CROWN DECK █████
             C4 ●
                 ─────────→ G5 → G6 → EXIT

          ↑
          │ CROWN SLOT
          │

        █████ BACKSIDE RETURN GALLERY
              G4 ← G3 ← G2
                         ↑
                    RIGHT CRADLE
                    LOWER GUARD
                         ↑

ENTRY → ACCESS CONTROL
          ↓
      C1 → C2 → C3 ─────────────→
          UNDERFRAME SCANNER SWEEP

Y 0
```

Movement:

> **LOWER RIGHTWARD SWEEP → MID LEFTWARD RETURN → UPPER RIGHTWARD DEPARTURE**

The two direction changes are caused by the Media Wall service layout,
not arbitrary zigzagging.

---

# 5. ENTRY / ACCESS CONTROL — FULL SAFE

Entry:

`(-1456,-32)`

P0:
- W224
- Y 0

G0:
`(-1280,-128)`

Access Deck P1:
- X `-1360..-1040`
- W320
- Y `-160`

All safe.

Stable Story:

```text
COMMERCIAL ACCESS CONTROL
EMPLOYEE VERIFIED

ROUTE AUTHORIZATION
INVALID
```

No Scanner commit yet.

No enemy.

---

# 6. PLAYER BARK A — REVISED

Trigger:
after `ROUTE AUTHORIZATION / INVALID`.

Text:

> **`…인증은 됐는데, 왜 막히는 거지?`**

Why this is better:
- immediate confusion
- natural spoken Korean
- does not repeat `EMPLOYEE VERIFIED`
- does not explain permissions
- leaves the system hierarchy mysterious

Status:

**NOT IMPLEMENTED — PLAYER BARK LAYER**

---

# 7. SERVICE MOUNT STORY

Before movement:

```text
SERVICE MOUNT ACCESS
CYCLING
```

The Player can observe at least one full cycle.

No enemy.

---

# 8. LAYER 1 — UNDERFRAME SCANNER SWEEP

Scanner Tutorial chain:

### C1
`(-896,-304)`

### C2
`(-544,-384)`

### C3
`(-192,-432)`

Right Service Cradle begins:
`X +128`

Key relations:

P1 right edge → C1:
~200px

C1 → C2:
~361px

C2 → C3:
~355px

C3 → Cradle:
~322px

All three are one shared Scanner Group visually attached to the underside of the same Media Wall.

Tutorial:

```text
WATCH
→ ATTACH
→ STAY ATTACHED THROUGH LOCK
→ RELEASE
→ RE-ATTACH
→ LAND
```

No enemy pressure.

---

# 9. PLAYER BARK B — REVISED

After the Player remains attached through LOCK at least once:

> **`…이미 붙은 건 그대로네.`**

This is more conversational than:

`붙어 있는 건 안 끊기네.`

It describes exactly what the Player felt,
without sounding like a rule manual.

Status:

**NOT IMPLEMENTED — PLAYER BARK LAYER**

---

# 10. RIGHT SERVICE CRADLE — TUTORIAL ENDS

P2:

- X `+128..+512`
- W384
- Y `-464`

Full safe landing first.

The Player now sees:

- the giant Media Wall above/left
- a service cradle farther right
- a backside gallery running back left behind the sign

This is the first big spatial reorientation.

No Scanner overlap with upcoming Guard.

---

# 11. LOWER GUARD — SLOT 1

Stable:

`scanner-lower-guard`

Authority:

`SECTOR_03_STANDARD_POOL`

Target:
around `(+864,-560)` after the Cradle transition.

Right Guard Shelf:

- X `+704..+1024`
- Y `-560`

Rules:

- exactly one lower slot
- kill optional
- no Rope Cut
- no kill gate
- tutorial Scanner mounts cannot be pressured
- Guard pressure ends before Backside Return begins

Purpose:

> ordinary Security briefly interrupts the environmental lesson.

3-3 still owns the first true Scanner + Enemy simultaneous synthesis.

---

# 12. FAR-RIGHT SERVICE CRADLE

Static G1:

`(+1216,-640)`

P3:

- X `+1152..+1472`
- W320
- Y `-704`

This is the farthest right point in the Stage.

From here the route does something the Player did not do in 3-1:

> **turns around and travels behind the Media Wall.**

No Story Toast.

The architecture itself explains the turn.

---

# 13. LAYER 2 — BACKSIDE RETURN GALLERY

The backside is mostly stable/static maintenance geometry.

No Scanner here.

The Player returns right → left using:

### G2
`(+832,-800)`

### G3
`(+448,-896)`

### G4
`(+64,-960)`

Backside Safe Gallery P4:

- X `-320..+64`
- W384
- Y `-992`

Distances:

P3 left edge → G2:
~334px

G2 → G3:
~396px

G3 → G4:
~389px

G4 → P4:
comfort

These are the Stage's skilled static Rope relations.

Why static?

Because Scanner should not be every single movement.

This section lets the Player:
- use normal Rope
- understand the building depth
- feel the Media Wall as a huge object
- reset Scanner attention

---

# 14. BACKSIDE RETURN RECOVERY

Recovery B:
around `(+448,-704)`

W256.

Recovery C:
around `(+64,-800)`

W224.

Retry:
`4–7s`.

No full-stage fall.

No recovery may walk directly to P4.

---

# 15. CROWN SLOT — SCANNER RECALL

From P4,
the service route climbs into a narrow gap between two top sign/electrical frames.

C4:

`(-256,-1184)`

P5 Crown Deck:

- X `-448..-128`
- W320
- Y `-1248`

P4 → C4:
~230px

C4 → Crown:
~143–210px depending landing.

C4 uses the known Scanner cycle.

No new Tutorial text.

No enemy.

This is a short recall:
> `I know what this color/state means now.`

---

# 16. ACCESS MODULE A — SLOT 2

From the safe Crown Deck,
optional local branch goes farther left into a service cassette.

Access Anchor:

`(-736,-1280)`

Carrier Bay:

- around `(-960,-1248)`

Stable carrier:

`scanner-upper-guard`

Authority:

`SECTOR_03_SUPPORT_POOL`

Access:
`sector-03:access-module:a`

Rules:

- optional local branch
- no escort
- no third enemy
- no Scanner inside Carrier bay
- no relocking mainline
- Carrier activates only after deliberate branch commit
- kill required for Module A
- local Stage exit does not require the kill
- preserve Access marker contract

The Crown Deck stays safe until the branch is committed.

---

# 17. LAYER 3 — UPPER CROWN DEPARTURE

After Crown / optional Access A,
mainline moves left → right again across the upper Media Wall crown.

Static targets:

### G5
`(+224,-1280)`

### G6
`(+576,-1344)`

Exit Deck:
- X `+800..+1120`
- Y `-1408`

Relations:

Crown right edge → G5:
~353px

G5 → G6:
~358px

G6 → Exit:
~233px

No enemy pressure here.

This gives the Stage a clean mastery-style finish after the Access choice.

---

# 18. EXIT STORY

Stable:

`retail-security-ahead`

Exact current presentation:

```text
RETAIL SECURITY
ACTIVE
```

Final safe frame.

Meaning:

> the next public retail space still has Security pressure.

No Scanner + enemy demo yet.

3-3 owns it.

---

# 19. WHY THIS MAP IS LESS SIMPLE

REV1 was:

```text
one diagonal chain
→ one guard
→ one diagonal cleft
```

REV2 has five spatial phases:

1. **SAFE ACCESS CONTROL**
2. **SCANNER UNDERFRAME SWEEP**
3. **RIGHT SERVICE CRADLE + GUARD**
4. **BACKSIDE RETURN GALLERY**
5. **CROWN SLOT + ACCESS A + UPPER DEPARTURE**

The Player sees the same Media Wall:
- from below
- from the right service side
- from behind
- from the crown

That makes the architecture memorable.

---

# 20. MAP SIMILARITY

## vs 3-1

3-1:
one giant Market Void crossed through a central Suspended Island.

3-2:
one giant Media Wall wrapped on three service elevations.

Overlap:
large Sector-scale landmark only.

PASS.

## vs 1-7

1-7:
enclosed chambered S-curve with repeated directional corridors.

3-2:
open facade backside with three functional maintenance layers around one Media Wall.

Overlap:
direction reversal count only.

Meaningful overlap = 1.

PASS.

## vs 1-5

1-5:
Horseshoe / drop-through load loop.

3-2:
no Drop, no lower return, no loop back to origin.

PASS.

## vs 2-7

2-7:
diagonal Shelter Buttress → Safe Core → vertical Mast.

3-2:
horizontal/diagonal underframe → backside return → crown departure.

PASS.

## vs planned 3-3

3-3:
Half-Orbit public Retail Balcony around central Atrium.

3-2:
back-of-house media facade wrap.

PASS.

Maximum meaningful overlap:
**1**

---

# 21. OBSTACLE FUNCTION

Primary architectural object:

> **GIANT MEDIA WALL**

Why the route folds:

- underside structural joints are Scanner-controlled
- the right edge contains the service cradle
- technicians normally return behind the panel along a backside gallery
- the crown electrical/service deck is reached through the top slot
- upper commercial level continues from the crown

Thus:

```text
UNDERFRAME
→ RIGHT SERVICE EDGE
→ BACKSIDE
→ CROWN
```

is actual maintenance circulation.

No arbitrary zigzag.

PASS.

---

# 22. SCANNER TEACHING RULE

First Scanner lesson must remain:

**COMPLETELY SAFE**

Mandatory sequence:

```text
SYSTEM SAYS CYCLING
↓
PLAYER WATCHES
↓
PLAYER ATTACHES
↓
MOUNT LOCKS
↓
CURRENT ROPE REMAINS
↓
PLAYER UNDERSTANDS
↓
SAFE LANDING
```

Only after that:
Lower Guard.

This remains non-negotiable.

---

# 23. CAMERA

Default first.

## Access Control
Player + Access panel + first Underframe mount.

## Underframe
Player + current Scanner Mount + next two supports if readable.

## Right Cradle
Player + far-right service edge + Backside Return direction.

This is the main architectural reveal.

## Backside Return
Player + next static joint + Media Wall body occupying foreground/background.

## Crown Slot
Player + C4 + Crown landing.

## Access A
local branch only.

## Upper Departure
Player + distant Exit direction.

No cinematic full-map pan.

---

# 24. PACING

First mainline:
**2:20–3:05**

Mastered:
**1:05–1:35**

With Access A first:
**2:50–3:45**

HYPOTHESIS.

REV2 is intentionally longer than REV1 because:
- the building is now spatially richer
- Scanner tutorial still needs observation time
- static backside traversal adds mastery without more mechanics

REDESIGN if:
- Backside Return feels like filler
- Stage reads as 1-7 S-curve
- Scanner tutorial is forgotten before C4
- G2→G3 or G3→G4 becomes blind max-range fishing
- Access A branch feels mandatory
- right/left/right traversal becomes confusing rather than architectural
- mobile camera cannot read the Backside Return

---

# 25. FIVE GATES

MAP SCALE:
**PASS**

`3200×1472` with multi-elevation full-width use.

MAP SIMILARITY:
**PASS**

Maximum meaningful overlap = 1.

OBSTACLE FUNCTION:
**PASS**

Media Wall maintenance circulation causes all direction changes.

STAGE LENGTH / PACING:
**HYPOTHESIS PASS**

CURRENT RUNTIME:
**SCANNER + 2 SLOTS + ACCESS A + STORY + EXIT CONTRACT MATCH / MAJOR TOPOLOGY RE-AUTHOR**

---

# 26. STATUS

```text
3-2 REV1
HOLD / SUPERSEDED

3-2 REV2
3200×1472

UNDERFRAME SWEEP
→ RIGHT CRADLE
→ BACKSIDE RETURN
→ CROWN SLOT
→ ACCESS A
→ UPPER DEPARTURE

DIALOGUE
A: …인증은 됐는데, 왜 막히는 거지?
B: …이미 붙은 건 그대로네.

USER APPROVED / DESIGN LOCKED
```


---

# 27. PACKAGING-TIME RE-AUDIT

Final packaging baseline:

`d588aa041a350cab198cd187d8dccbe3b3a244dd`

Verified at packaging:

- source area `sector-03-02`
- Runtime name `SCANNER GALLERY`
- subtitle `FIRST ACCESS SCAN`
- Scanner Group `sector-03-02:scanner-A`
- Scanner cycle `1.5 / 0.6 / 1.1 / 0.3`
- exactly 2 enemy slots
- lower slot = Standard Pool
- upper slot = Support Pool + `sector-03:access-module:a`
- Patrol / Wind / Rope Cut absent
- Story object IDs and current copy remain unchanged
- Exit still crosses to `sector-03-03`

REV8 extends the existing Scanner Group from the old C1/C2/C3 blockout to the approved C1/C2/C3 + C4 recall layout.
It does not add a new Scanner mechanic or second cycle.

Player Bark remains NOT IMPLEMENTED unless a dedicated Player Bark layer lands.
