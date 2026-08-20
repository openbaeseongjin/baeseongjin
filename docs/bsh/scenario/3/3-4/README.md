# ONE ROPE — SECTOR 03-4 RETAIL SERVICE SPINE — REV8 STAGE DRAFT

> Status: DESIGN LOCKED  
> Runtime audit baseline: `d588aa041a350cab198cd187d8dccbe3b3a244dd`  
> Sector 03 Master Plan: REV3  
> Current Runtime name: `SERVICE ARCADE`  
> Master canonical name: **`RETAIL SERVICE SPINE`**  
> Current Runtime bounds: `1280×1216`  
> Proposed REV8 target: **`3584×1664`**  
> Spatial Signature: **DOUBLE-SKIN COMMERCIAL SECTION / PUBLIC FRONT LEFT vs SERVICE BACK RIGHT → HIGH MERGE**  
> Stage Role: **FIRST TRUE COST-PROFILE ROUTE CHOICE**  
> Full package: CREATED — REV8.0 GITHUB-READY  
> Map Preview: GAMEPLAY-ONLY

---

# 0. LATEST RUNTIME — VERIFIED

Current `sector-03-04` keeps:

- Runtime name `SERVICE ARCADE`
- subtitle `PUBLIC VS SERVICE`
- current bounds `1280×1216`
- next `sector-03-05`
- Scanner Group:
  `sector-03-04:scanner-service-arcade-public`
- controlled Scanner surfaces:
  - C1
  - C2
- exactly **3 enemy slots**:
  1. `sector-03-04:drone-1`
     - fixed Patrol Drone
  2. `sector-03-04:service-route-guard`
     - Support Pool
  3. `sector-03-04:upper-arcade-guard`
     - Late Pool
- no Access Module
- no Wind
- no Rope Cut
- current Story objects:
  - route-split
  - public-route
  - service-route
  - service-node-upper
- current Exit:
  `final deck → exit panel → physical crossing → 3-5`

Current Patrol baseline:
- speed 48
- wait .45
- pingpong
- no Rope Cut
- kill optional

---

# 1. VERIFIED STORY COPY

## Split

```text
PUBLIC PROMENADE
←
```

```text
FACILITY SERVICE
→
```

## Public

```text
PUBLIC ROUTE
AUTHORIZATION INVALID
```

## Service

```text
FACILITY SERVICE ACCESS
MAINTENANCE CLEARANCE RECOGNIZED

LOCAL SERVICE ROUTE
AVAILABLE
```

## Upper Merge

```text
COMMERCIAL SERVICE NODE
UPPER LEVEL
```

Story meaning:

> Player's Maintenance identity works locally in the Service layer,
> but that does not equal general Public / Upper Transit authorization.

---

# 2. CORE DESIGN QUESTION

3-3 asked:

> `Scanner state + Patrol position → when do I commit?`

3-4 asks:

> **`Which cost profile do I want to pay?`**

### PUBLIC FRONT

- wider landing surfaces
- fewer Rope inputs
- Scanner timing
- Patrol exposure
- longer sightlines

### SERVICE BACK

- no active Scanner
- narrower collision geometry
- more Rope chaining
- Support Guard in a cramped service bay
- poorer sightline / more precision

Neither is a trap.

Neither is always correct.

---

# 3. IMPORTANT CHOICE RULE

This is NOT a fake “free choice.”

The architecture creates two real layers:

```text
PUBLIC FRONT-OF-HOUSE
vs
SERVICE BACK-OF-HOUSE
```

They diverge at one split and do not cross again until the high merge.

Player may backtrack to the split,
but cannot casually switch halfway between routes.

This makes the cost decision meaningful.

---

# 4. SCALE

Target:

> **`3584×1664`**

Local:
- X `-1792..+1792`
- Y `0..-1664`

The Stage uses the full width because the two skins separate strongly:

- Public route reaches ~X `-1500`
- Service route reaches ~X `+1500`
- both merge around X `+160`
- final upper arcade continues to ~X `+1280`

This is a true cross-section,
not two lines drawn close together.

---

# 5. MASTER SILHOUETTE

```text
Y -1664

                                      EXIT → 3-5
                                          █████
                                       G9 ●
                                         /
                          UPPER ARCADE ███████
                          LATE GUARD     ●
                                   /
                                MERGE █████
                                  ▲
                 ┌────────────────┴────────────────┐
                 │                                 │
      PUBLIC FRONT                           SERVICE BACK
      wide / timing                          narrow / inputs

  P4 PUBLIC DECK █████                   SERVICE RETURN ███
             ↗ C2 ●                       G7 ● ← G6
                /                               ↑
   PATROL ←────────→                           G5 ●
              /                                ↑
           C1 ●                         SERVICE GUARD ●
          /                                   G4 ●
 PUBLIC LOBBY █████                          /
        ←                                  ███ SERVICE BAY
         \                                  /
          \                                /
           █████ SPLIT / STORY █████
                     ↑
                    ENTRY

Y 0
```

Overall silhouette is a large **Y / double-skin section**.

This deliberately avoids reusing 3-3's:
`↗ → ↖ → ↘ → ↖ → ↗` switchback rhythm.

---

# 6. ENTRY / ROUTE SPLIT — FULL SAFE

Entry:
`(0,-32)`

P0:
- X `-128..+128`
- W256
- Y0

G0:
`(0,-128)`

Split Deck P1:
- X `-256..+256`
- W512
- Y `-192`

Stable Story:
`sector-03-04:route-split`

Displays:

```text
PUBLIC PROMENADE ←
FACILITY SERVICE →
```

No enemy.
No Scanner pressure.

The Player can visually preview both routes before choosing.

---

# 7. PUBLIC ROUTE — ARCHITECTURE

Public Front follows the open retail facade / balcony.

It bends far left around the public-facing void,
then returns toward the upper merge.

Movement character:

> **wide surfaces + long readable swings + fewer commits**

Public route has only:
- one static approach anchor
- C1
- C2
- one static merge anchor

The cost is timing/exposure rather than input count.

---

# 8. PUBLIC ROUTE — GEOMETRY

From Split left edge:
`(-256,-192)`

Public Approach G1:
`(-544,-320)`

Public Lobby P2:
- X `-832..-448`
- W384
- Y `-384`

C1:
`(-1088,-544)`

Public Main Deck P3:
- X `-1408..-960`
- W448
- Y `-640`

C2:
`(-992,-800)`

Public Upper Deck P4:
- X `-832..-384`
- W448
- Y `-896`

Public Merge Anchor G3:
`(-160,-1056)`

Merge P8:
- X `-32..+352`
- W384
- Y `-1120`

Key mandatory relations:
- Split→G1 ≈315px
- G1→P2 ≈? comfort
- P2→C1 ≈302px
- C1→P3 ≈? comfort
- P3→C2 ≈? comfort
- C2→P4 ≈? comfort
- P4→G3 ≈? skilled
- G3→Merge ≈132px

All final links must remain ≤400px.

---

# 9. PUBLIC SCANNER GROUP

Preserve one group:

`sector-03-04:scanner-service-arcade-public`

Controls:
- C1
- C2

Same cycle:
`1.5 / .6 / 1.1 / .3`

No forced detach.
No damage.
No Rope Cut.

Public route deliberately has **fewer Rope inputs** than Service route.

---

# 10. PUBLIC PATROL — SLOT 1

Stable:
`sector-03-04:drone-1`

REV8 proposed path:

> `(-1376,-704) ↔ (-768,-704)`

Keep:
- speed 48
- wait .45
- pingpong
- kill optional
- no Rope Cut
- target-lock cycle

Patrol covers Public P3/C2 exposure,
not the split or merge.

The Public route's cost is:

> **Scanner timing + visible Patrol position**

but it should still be faster for a confident Player.

---

# 11. PUBLIC STORY

Stable:
`sector-03-04:public-route`

At Public Lobby / before C1:

```text
PUBLIC ROUTE
AUTHORIZATION INVALID
```

No Player Bark by default.

This is the same authorization problem already established,
not a new revelation.

Important:

`INVALID` does NOT mean a hard invisible wall.

The damaged building still leaves physical passage.

The system status says the route is not formally authorized.

---

# 12. SERVICE ROUTE — ARCHITECTURE

Service Back drops behind the public wall into:
- stock / delivery passage
- maintenance riser
- cable/service rack
- upper equipment return

Movement character:

> **narrow + more Rope inputs + more permanent/static anchors**

There is no active Scanner on this route.

The cost is execution density and a cramped Support Guard,
not timing automation.

---

# 13. SERVICE ROUTE — GEOMETRY

From Split right edge:
`(+256,-192)`

Service Entry G4:
`(+512,-352)`

Service Bay P5:
- X `+448..+704`
- W256
- Y `-448`

G5:
`(+768,-608)`

Narrow Shelf P6:
- X `+704..+928`
- W224
- Y `-672`

G6:
`(+1088,-768)`

G7:
`(+1280,-928)`

Service Return P7:
- X `+1088..+1408`
- W320
- Y `-992`

Return Anchor G8:
`(+736,-1056)`

Merge P8:
- X `-32..+352`
- W384
- Y `-1120`

This route uses significantly more Rope actions.

No Scanner.

---

# 14. SERVICE GUARD — SLOT 2

Stable:
`sector-03-04:service-route-guard`

Authority:
`SECTOR_03_SUPPORT_POOL`

Target:
around `(+816,-672)` on the narrow Service shelf.

Rules:
- Service route only
- no Scanner overlap
- no Patrol overlap
- kill optional
- no kill gate
- no Rope Cut
- activation begins after Service Story is read

The Guard creates a cost the Public route does not have:
combat in tighter geometry.

But Public has Scanner+Patrol timing.

Tradeoff stays real.

---

# 15. SERVICE STORY

Stable:
`sector-03-04:service-route`

At Service Bay:

```text
FACILITY SERVICE ACCESS
MAINTENANCE CLEARANCE RECOGNIZED
```

followed by:

```text
LOCAL SERVICE ROUTE
AVAILABLE
```

This is the first explicit confirmation:

> **Maintenance identity works in the building's local service layer.**

But it does NOT imply:
- upper transit authorization
- priority status
- public access equivalence
- evacuation priority

---

# 16. PLAYER BARK — PROPOSED

After:

`MAINTENANCE CLEARANCE RECOGNIZED / LOCAL SERVICE ROUTE AVAILABLE`

Proposed:

> **`…이쪽은 열리네.`**

Short.

Why:
- immediate physical recognition
- does not explain the permission model
- contrasts naturally with previous `왜 막히는 거지?`
- avoids sounding like tutorial text

Status:
**NOT IMPLEMENTED — PLAYER BARK LAYER**

No additional Bark on Public route.

---

# 17. HIGH MERGE

Both routes converge on P8.

Merge is FULL SAFE.

Purpose:
- routes are different costs but same progression
- no route is “correct canon path”
- multiplayer Players may arrive from different routes
- regroup before common final pressure

Story object:
`sector-03-04:service-node-upper`

Exact:

```text
COMMERCIAL SERVICE NODE
UPPER LEVEL
```

This is also a clean handoff toward 3-5 Building Services Hub.

---

# 18. COMMON UPPER ARCADE — SLOT 3

After merge:

G9:
`(+512,-1248)`

Upper Arcade P9:
- X `+576..+960`
- W384
- Y `-1312`

Stable:
`sector-03-04:upper-arcade-guard`

Authority:
`SECTOR_03_LATE_POOL`

Current Late Pool:
- pursuit
- shield
- artillery
- support
- swarm

Rules:
- activates only after merge
- cannot attack either lower branch
- no Scanner overlap
- no Patrol overlap
- kill optional
- no kill gate

This is the common cost both routes pay.

---

# 19. EXIT

G10:
`(+1088,-1440)`

Exit Deck:
- X `+1152..+1472`
- W320
- Y `-1536`

Easy final movement.

Exit → 3-5 BUILDING SERVICES HUB.

No active pressure on final Story / panel.

---

# 20. MULTIPLAYER CHOICE

This route choice is especially useful in multiplayer.

Players may choose independently:

- Player A Public
- Player B Service

No global route lock.

No shared “vote.”

No route becomes unavailable because another Player chose it.

Both converge at the high merge.

If one Player reaches merge first:
- world does not pause
- they may continue
- other Player remains on their route

This is not a synchronized route puzzle.

---

# 21. WHY PUBLIC IS NOT THE BAD ROUTE

Public:
- wider
- fewer inputs
- cleaner sightlines
- potentially fastest
- Scanner timing
- Patrol exposure

Service:
- no Scanner
- more anchors
- narrow landings
- Support Guard
- more input density

Depending on:
- Player confidence
- current build
- enemy pool selection
- multiplayer role

either route can feel preferable.

PASS if Player preference varies.

FAIL if >80% choose the same route because it is obviously superior.

---

# 22. CAMERA

## Split
Show both:
- Public left wide opening / C1 direction
- Service right narrow vertical/back route

Neither route visually hidden.

## Public
Wide camera:
Player + Scanner mount + Patrol position + next wide landing.

## Service
Tighter:
Player + next static anchor + narrow service shelf.

## Merge
Player + safe regroup deck + both route arrival directions.

## Upper Arcade
ordinary enemy gameplay framing.

## Exit
Player + 3-5 Service Hub threshold.

---

# 23. MAP SIMILARITY

## vs 3-3
3-3:
mandatory switchback direction rhythm `↗→↖→↘→↖→↗`.

3-4:
one Y-shaped split into two parallel cost profiles,
then one merge.

No repeated switchback signature.

PASS.

## vs 2-4
2-4:
braided residential courtyard field with multiple interlocking traversal strands.

3-4:
exactly two architecture-defined front/back skins with explicit cost identity and one high merge.

Overlap:
route multiplicity only.

Meaningful overlap = 1.

PASS.

## vs 1-5
No horseshoe/drop-return.

PASS.

## vs 2-8
No dead lip/drop/relaunch.

PASS.

## vs 3-2
Both use front/back architecture conceptually,
but:
- 3-2 is one mandatory Media Wall wrap
- 3-4 is simultaneous Public Front vs Service Back choice

Overlap:
front/back-of-house identity.

Meaningful overlap = 1.

PASS.

Maximum meaningful overlap:
**1**

---

# 24. OBSTACLE FUNCTION

Every route exists because of actual commercial architecture.

PUBLIC:
- broad public promenade
- damaged access but surviving wide front deck
- smart safety mounts
- active patrol coverage

SERVICE:
- staff/service corridor behind public wall
- narrow racks and maintenance anchors
- local clearance recognized
- security guard in service shelf

HIGH MERGE:
- both circulation systems meet at upper commercial service node

No arbitrary branch.

PASS.

---

# 25. PACING

Difficulty:
**★★★**

First play:
- Public: `1:50–2:35`
- Service: `2:05–2:50`
- Common upper: +`0:35–0:55`

Mastered:
- Public usually fastest if timing is confident
- Service can be safer for Scanner-averse play but more input-heavy

Target total:
**2:30–3:35**

REDESIGN if:
- one route is clearly always superior
- Player cannot preview costs at Split
- Public route feels like 3-3 again
- Service route feels like a Rope ladder
- branch switching is possible halfway and erases choice
- common upper Guard attacks lower routes
- route choice causes multiplayer synchronization gate
- Public `AUTHORIZATION INVALID` is mistaken for invisible collision lock

---

# 26. FIVE GATES

MAP SCALE:
**PASS**
`3584×1664`, wide split uses almost full authored width.

MAP SIMILARITY:
**PASS**
Maximum meaningful overlap = 1.

OBSTACLE FUNCTION:
**PASS**
Public Front / Service Back are architecturally causal.

STAGE LENGTH:
**HYPOTHESIS PASS**

CURRENT RUNTIME:
**1 Scanner Group + Patrol + Support Guard + Late Guard = 3 slots + 4 Story objects + Exit contract match / major topology expansion**

---

# 27. APPROVAL STATUS

```text
3-4 RETAIL SERVICE SPINE
REV8 DRAFT

3584×1664

              PUBLIC FRONT
             / Scanner + Patrol
ENTRY → SPLIT
             \ Service Rope + Guard
              SERVICE BACK
                    ↓
                  MERGE
                    ↓
              LATE GUARD
                    ↓
                 3-5

USER APPROVED / DESIGN LOCKED
```


---

# 28. PACKAGING-TIME RE-AUDIT

Final packaging baseline:

`d588aa041a350cab198cd187d8dccbe3b3a244dd`

Latest `main` rechecked before packaging.

Verified current Runtime contract:
- `sector-03-04`
- runtime name `SERVICE ARCADE`
- subtitle `PUBLIC VS SERVICE`
- current bounds `1280×1216`
- one Scanner Group:
  `sector-03-04:scanner-service-arcade-public`
- Scanner controls current C1/C2
- fixed Patrol:
  `sector-03-04:drone-1`
- Support Pool Guard:
  `sector-03-04:service-route-guard`
- Late Pool Guard:
  `sector-03-04:upper-arcade-guard`
- exactly 3 enemy slots
- Story object IDs:
  - `sector-03-04:route-split`
  - `sector-03-04:public-route`
  - `sector-03-04:service-route`
  - `sector-03-04:service-node-upper`
- no Access Module
- no Wind
- no Rope Cut
- Exit contract remains:
  `final-deck-reached → exit-panel-engaged → physical crossing → sector-03-05`

REV8 expands the existing Public-vs-Service contract into a full double-skin architectural route choice.
