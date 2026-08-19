# ONE ROPE — SECTOR 02-4 RESIDENTIAL STACK — REV8 STAGE DRAFT

> Status: DESIGN LOCKED  
> Runtime audit baseline: `1325320dc89d3c2da45ebd53204901d5ebbd10f1`  
> Current Runtime: `1408×1280`  
> Proposed REV8: **`1984×1088`**  
> Spatial Signature: **INTERLOCKED TENEMENT COURTS / BRAIDED ROUTE FIELD**  
> Stage Role: **FIRST TRUE ROUTE EXPRESSION AFTER OFFER #2**  
> Full package: CREATED — REV8.0 GITHUB-READY  
> MAP-PREVIEW: GAMEPLAY-ONLY

---

## 0. CURRENT RUNTIME — VERIFIED

Current 2-4:
- `RESIDENTIAL STACK`
- `MULTI-ROUTE HOUSING`
- bounds `1408×1280`
- nextAreaId `sector-02-05`
- exactly 2 enemy slots:
  1. `patrol-drone-t1`
  2. `route-choice-guard` from `SECTOR_02_SUPPORT_POOL`
- no Rope Cut
- Patrol kill optional
- routes:
  - `safe-left`
  - `flow-centre`
  - `pressure-right`
  - `recovery`
- current Patrol:
  `(-416,-768) ↔ (+416,-768)`
- Patrol speed 48 / wait 0.45 / pingpong
- current Story Entry:
  `RESIDENTIAL STACK / MULTI-ROUTE HOUSING`

Sector 02 enemy budget:
2-4 = exactly **2 slots**.

No Access Module in 2-4.

---

## 1. WHY CURRENT VERTICAL STACK IS RE-AUTHORED

The old blockout uses:
- a tall 1280px stack
- Safe Left
- Flow Centre
- Pressure Right

That is valid mechanically,
but its visual skeleton risks repeating:
- 1-3 Vertical Security Spine
- 1-8 parallel Security lanes
- Sector 01 repeated vertical rise rooms

REV8 keeps the **three risk styles**,
but removes the parallel-lane reading.

Routes become:
**a braided field across two linked low-rise tenement courts.**

They:
- separate
- cross visually
- offer transfer points
- recombine

They are not three tunnels.

---

## 2. PRIMARY ROLE

2-3:
`SECOND GENERIC OFFER`

2-4:
**`PLAYER CHOOSES HOW TO READ THE SAME SPACE`**

No new mechanic.

Question:

> **“같은 주거 공간을 내 현재 Build와 숙련도에 따라 어떤 경로로 읽을 것인가?”**

This is not:
- Build Lock
- card-specific route
- mandatory selected-card demonstration

All current Builds:
- same Start
- same Exit
- all routes available

---

## 3. SCALE

Target:
`1984×1088`

Local:
- X `-992..+992`
- Y `0..-1088`

Why wider:
- routes can braid rather than stack vertically
- route choices read spatially at once
- multiple residential courts feel like a district fragment

Why shorter than old:
- avoid another tall Sector 01-style climb
- route choice, not raw height, is the difficulty

This is still dense Worker Housing,
not a giant open plaza.

---

## 4. SPATIAL SIGNATURE

**INTERLOCKED TENEMENT COURTS / BRAIDED ROUTE FIELD**

```text
                                   SAFE UPPER BALCONY
                              ┌───────────────┐
                            ↗                  ↘
ENTRY → REVEAL → SPLIT A ─── X ── SWITCH DECK ─── X ── MERGE → EXIT
                            ↘                  ↗
                         PRESSURE COURT     PATROL COURT
                              ↘            ↗
                                FLOW BRAID
```

Dominant movement:
**LEFT → RIGHT + gradual UP**

The routes cross and reconnect.

No full-width backtracking.

No left/centre/right permanent lane ownership.

---

## 5. ROUTE REVEAL

Entry:
`(-864,-32)`

P0:
- center `(-816,0)`
- W320

Reveal Deck:
- center `(-672,-160)`
- W384

At Reveal Deck:
Player can read:
- Safe Balcony route
- Flow Anchor route
- Pressure Court route

No immediate enemy fire.

Current Story Entry:
`RESIDENTIAL STACK / MULTI-ROUTE HOUSING`

Proposed Bark after enough environment is visible:

**`…여기서 몇 명이나 살았던 거지.`**

Status:
`NOT IMPLEMENTED — PLAYER BARK LAYER`

Purpose:
turn housing density into human scale,
without revealing evacuation truth.

---

## 6. SPLIT A — THREE STYLES, NOT THREE LOCKS

Split point:
around `(-512,-256)`.

### SAFE BRAID A

S1:
- center `(-672,-384)`
- W288

G-SAFE-A:
`(-560,-320)`

G-SAFE-X:
`(-352,-480)`

Characteristics:
- 250–340px Rope relations
- broad landing
- low enemy exposure
- longest distance

### FLOW BRAID A

G-FLOW-A:
`(-336,-352)`

C1:
- center `(-176,-416)`
- W256

Characteristics:
- 330–370px Rope
- smaller landing
- continuous momentum
- recovery directly below

### PRESSURE BRAID A

G-PRESS-A:
`(-304,-256)`

P1:
- center `(+64,-352)`
- W320

Guard:
around `(+96,-352)`

Characteristics:
- shortest geometric path
- broad landing
- longest Guard exposure
- kill optional

No Build requirement.

---

## 7. FIRST BRAID SWITCH

Switch Deck:
- center `(-64,-544)`
- W448

This is critical.

All three routes can reach it.

At this deck the Player may:
- stay in current style
- switch to another second-half route

This prevents fake choice.

Choice is:
**risk / speed / momentum**
not:
**pick one tunnel and stay there.**

Guard activation should be over before the second-half Patrol encounter dominates.

---

## 8. RECOVERY A

Lower Recovery:
- center `(-224,-480)`
- W352

Catch target:
3–6s retry.

A miss may drop the Player here and let them re-enter:
- Safe
- Flow
- Pressure

No Stage reset.

---

## 9. SPLIT B — ROUTES CROSS AGAIN

From Switch Deck:

### SAFE BRAID B

G-SAFE-B:
`(-352,-672)`

S2:
- center `(-448,-768)`
- W320

G-SAFE-M1:
`(-192,-848)`

G-SAFE-M2:
`(+96,-896)`

Safest route:
- outside Patrol core
- longer arc
- wide landing

### FLOW BRAID B

G-FLOW-B1:
`(+64,-672)`

G-FLOW-B2:
`(+320,-768)`

Flow landing:
- center `(+176,-832)`
- W256

Fast:
- continuous Attach/Release
- Patrol position matters briefly
- recovery below

### PRESSURE BRAID B

G-PRESS-B:
`(+224,-608)`

Pressure Balcony:
- center `(+512,-672)`
- W352

Patrol crosses:
`(-128,-736) ↔ (+544,-736)`

Current Patrol behavior preserved:
- speed 48
- wait 0.45
- pingpong
- kill optional
- no Rope Cut

Pressure path:
shortest,
but spends the most time in moving LOS.

---

## 10. PATROL INTEGRATION

This is not another 2-2 tutorial.

2-2 taught:
**read moving threat.**

2-4 asks:
**choose how much of that threat to accept.**

Patrol affects routes differently:
- Safe: minimal LOS overlap
- Flow: short timed cross
- Pressure: sustained direct overlap

The Drone should already be understandable.

No dedicated observation lesson.

No new enemy behavior.

---

## 11. RECOVERY B

Central Recovery:
- center `(+64,-704)`
- W352

Right Recovery:
- center `(+416,-832)`
- W288

Retry:
`3–7s`

Recovery positions also allow route changes.

Failure should create:
**a new routing decision**
not merely repeat the same jump.

---

## 12. MERGE

Merge Deck:
- center `(+288,-928)`
- W512

All routes converge here.

No active enemy pressure on Merge Deck.

Purpose:
- clear comparison of chosen route
- decompression before Story Stage 2-5
- remove ambiguity about Exit

---

## 13. FINAL EXIT

G-FINAL:
`(+560,-960)`

Exit Deck:
- center `(+720,-992)`
- W320

Exit:
around `(+832,-1024)`

Next:
`sector-02-05`.

No enemy after Merge.

---

## 14. ENEMY CONTRACT

Exactly 2 slots.

### Slot 1 — Route Choice Guard

Current role:
first-half pressure.

Target:
around `(+96,-352)`.

Pool:
current `SECTOR_02_SUPPORT_POOL`.

Rules:
- kill optional
- no Rope Cut
- no kill gate
- activation limited to first braid

### Slot 2 — Patrol Drone

Second-half moving pressure.

Patrol:
`(-128,-736) ↔ (+544,-736)` proposed geometry.

Behavior:
preserve current Patrol AI values.

No third enemy.

No Access Carrier.

---

## 15. BUILD EXPRESSION

2-3 supplied Offer #2.

2-4 gives it room to matter naturally.

Examples:

### Fast launch / release propulsion
Flow Braid becomes smoother.

### Long Rope
Can catch alternate braid targets earlier,
but does not skip whole Stage.

### Slow Fall / Direction Dash
More forgiving route transfers.

### Combat cards
Pressure path becomes more attractive.

### Defensive / Guard options
Allow longer LOS exposure.

But:
every route remains Base-Rope compatible.

No UI says:
`this route is for X card`.

---

## 16. ENVIRONMENTAL STORY

2-4 Story is mostly environmental.

Goal:
**the Worker District is much larger and denser than 2-1 implied.**

Show in final art:
- many small housing doors
- stacked external galleries
- bridge-to-bridge laundry
- communal utility shelves
- canteen crates
- plants
- waiting benches
- repair patches
- resident-specific small markers
- optional neutral child drawing

Child drawing:
small ordinary drawing only.

Forbidden:
- HELP
- SAVE US
- blood
- death message
- explicit tragedy shorthand

Do not reveal 2-5 evacuation information early.

---

## 17. STORY PRESENTATION

Verified Entry only:

`RESIDENTIAL STACK`
`MULTI-ROUTE HOUSING`

No additional System Toast is necessary.

Player Bark:
`…여기서 몇 명이나 살았던 거지.`

Trigger:
after Reveal Deck,
only when multiple inhabited housing clusters are visible.

Physical evidence first.
Interpretation second.

No further dialogue.

---

## 18. CAMERA

No need for forced route-choice cinematic.

Default Camera first.

At Reveal Deck:
frame should contain:
- Player
- at least 2 viable route starts
- enough residential density to motivate Bark

At Switch Deck:
next second-half alternatives should be naturally visible.

No zoom-out so large that Player readability suffers.

If route choice is unreadable:
fix geometry/foreground before custom Camera.

---

## 19. MAP SIMILARITY

### vs 2-1
2-1:
single diagonal Rowhouse cut-through.

2-4:
braided multi-route field with two choice/recombination moments.

PASS.

### vs 2-2
2-2:
one long horizontal moving-LOS bridge.

2-4:
multiple crossing route arcs + optional Patrol exposure.

PASS.

### vs 1-3
1-3:
vertical security spine + huge side Annex.

2-4:
broad braided housing courts,
no single spine,
no Annex.

PASS.

### vs 1-5
1-5:
single Horseshoe + deliberate drop/relaunch.

2-4:
multi-route braid + route switching.

Overlap:
Build expression only.

PASS.

### vs 1-8
1-8:
sequential counterflow Security lanes.

2-4:
nonparallel intersecting route field,
optional risk exposure,
route switch.

PASS.

Maximum meaningful overlap:
**1**

---

## 20. OBSTACLE FUNCTION

Primary:
**DENSE BROKEN RESIDENTIAL CIRCULATION WITH BRAIDED RE-ROUTING**

Architecture explains:
- interrupted gallery
- adjacent balcony
- maintenance bridge
- shared courtyard
- service frames
- alternate circulation

The three styles are emergent from architecture.

Not three colored videogame lanes.

PASS.

---

## 21. PACING

Mainline first:
`1:45–2:25`

Mastered:
`0:50–1:15`

HYPOTHESIS.

Route-style rough target:
- Safe: slowest + easiest
- Flow: fastest if executed well
- Pressure: geometrically shortest but enemy-dependent

REDESIGN if:
- one route is always clearly optimal
- paths cannot switch
- route choice only changes cosmetics
- Patrol forces every route equally
- map reads as three parallel lanes
- map reads as another vertical stack
- first >2:40 without repeated misses
- player must kill either enemy

---

## 22. CURRENT RUNTIME GATE

### KEEP
- Stage identity
- no new mechanic
- exactly 2 enemy slots
- Patrol behavior family
- route-choice Guard family
- kill optional
- no Rope Cut
- same Start/Exit for all Builds
- multi-route philosophy
- nextAreaId 2-5
- exact Entry Story

### RE-AUTHOR
- bounds `1408×1280 → 1984×1088`
- old vertical Safe Left / Centre / Right parallel layout
- route targets
- recovery
- enemy positions
- Patrol path
- Merge Deck
- Story Bark trigger position

### RETIRE
- player-facing legacy Foundation/Specialization wording
- Build-locked path implication
- three permanent parallel route lanes

---

## 23. FIVE GATES

MAP SCALE / WORLD FOOTPRINT:
**PASS**

MAP SIMILARITY:
**PASS**

OBSTACLE FUNCTION:
**PASS**

LENGTH / PACING:
**HYPOTHESIS PASS — PLAYTEST REQUIRED**

CURRENT GITHUB RUNTIME:
**2-SLOT + MULTI-ROUTE CONTRACT MATCH / MAJOR TOPOLOGY RE-AUTHOR**

User approved. REV8.0 package is authoritative.


---

## 24. PACKAGING-TIME P0 ALIGNMENT

Packaging baseline:
`1325320dc89d3c2da45ebd53204901d5ebbd10f1`

Immediately before packaging, PR #700 aligned P0 wording and Runtime expression to the current
**generic Augment v1** contract.

Therefore:
- old `Foundation + Specialization` carry-state language is retired
- old `Specialization Expression` player-facing label is retired
- current 2-4 is generic Augment Build expression
- no route is card-locked
- all routes remain Base-Rope clearable

Current 2-4 Runtime geometry/enemy contract remained unchanged by that merge.
