# SECTOR 02-5 — EVACUATION WALKWAY — REV8.0

> **DESIGN LOCKED**
> Runtime audit baseline: `1325320dc89d3c2da45ebd53204901d5ebbd10f1`
> Current Runtime: `1280×1152`
> REV8 target: **`1984×704`**
> Spatial signature: **HORIZONTAL EVACUATION FUNNEL / HIGH-PRESSURE NECK → SAFE STORY → TWO-STAGE MAINTENANCE DROP**
> Runtime status: `3-SLOT + ACCESS B + LOCKED GATE + STORY MATCH / MAJOR TOPOLOGY RE-AUTHOR`

## 1. Revision history / why REV3 became final

### REV1 — HOLD / SUPERSEDED
`EVACUATION FUNNEL / BLOCKED PUBLIC GATE + BACKSIDE MAINTENANCE HOOK`

Rejected because it repeated 2-4:
- Safe / Flow / Pressure route styles
- Patrol as route price
- merge after route choice

Meaningful overlap >=3 → REDESIGN.

### REV2 — HOLD / SUPERSEDED
`STEPPED EVACUATION FUNNEL / LOCKED TRANSIT NECK + SIDE SERVICE RISER`

Rejected because:
- the dominant body still resembled 2-1's lower-left → upper-right diagonal ascent
- mandatory Rope relations were mostly comfort range (~258px maximum), making 2-5 too easy after 2-4

### REV3 — FINAL
**`HORIZONTAL EVACUATION FUNNEL → NARROW HIGH-PRESSURE NECK → SAFE STORY → TWO-STAGE MAINTENANCE DROP`**

This solves both:
- map similarity
- difficulty continuity

## 2. Latest Runtime authority — VERIFIED

At `1325320dc89d3c2da45ebd53204901d5ebbd10f1` current 2-5:
- `sector-02-05`
- name `EVACUATION WALKWAY`
- subtitle `UPPER TRANSIT RESTRICTED`
- bounds `1280×1152`
- nextAreaId `sector-02-06`
- current exit objective chain:
  reach → panel
- exactly **3 enemy slots**
  1. fixed `patrol-drone-t1`
  2. `assembly-guard` from `SECTOR_02_SUPPORT_POOL`
  3. `upper-transit-guard` from `SECTOR_02_LATE_POOL`
- `upper-transit-guard` owns:
  `accessModuleId: sector-02:access-module:b`
- `upper-transit-gate`
  - narrativeLock `true`
  - non-grappleable blockade in current geometry
- `evacuation-status` story display
- current maintenance-bypass cue/route concept
- current area has one authored `g4`

Sector 02 density:
2-5 = exactly **3 slots**.

Access Carrier stages:
2-2 / 2-5 / 2-7.

2-5 owns:
**Access Module B**.

## 3. Verified Story

Entry:
`EVACUATION WALKWAY`
`UPPER TRANSIT RESTRICTED`

Safe Gate Forecourt sequence:

1.
`EVACUATION GROUP C`
`ASSEMBLY COMPLETE`

2.
`TRANSFER AUTHORIZATION`
`PENDING`

3.
`UPPER TRANSIT ACCESS`
`RESTRICTED`

Story question changes from:
`사람들은 어디 갔지?`

to:
**`여기까지 왔는데 왜 위로 못 갔지?`**

Do not answer why yet.

Do not reveal:
- who denied authorization
- intentional abandonment
- Group A/B outcome
- 2-7 `TRANSFER SUSPENDED`
- 2-8 group comparison

## 4. Final scale

Target:
`1984×704`

Local:
- X `-992..+992`
- Y `0..-704`

Reason:
- the public evacuation route needs long horizontal civic scale
- challenge comes from narrowing landing tolerance and enemy pressure, not height
- after Gate, the Stage drops back downward instead of continuing the common upward body

The height is deliberately compact enough that the final body reads:
**RIGHTWARD PUBLIC APPROACH → DOWN/LEFT SERVICE DESCENT**

not another tall climb.

## 5. Final silhouette

```text
ENTRY
  └──────────────────────────────────────────────→
      BROAD ASSEMBLY CONCOURSE
          → BROKEN QUEUE SPAN
              → VERTICAL PATROL BAND
                  → BROKEN QUEUE SPAN
                      → NARROW TRANSIT NECK
                          → ASSEMBLY GUARD
                              → SAFE STORY FORECOURT
                                  █ LOCKED GATE █
                                         │
                                   SERVICE HATCH
                                         ▼
                                COMMIT DROP 1
                                   ↙ catch
                                NARROW SHELF
                                  ↙ ACCESS B
                                         │
                                COMMIT DROP 2
                                   ↙ catch
                                      EXIT
```

Important:
the Gate never opens.

The public route terminates.

The Player continues only by abandoning public circulation and entering service structure.

## 6. Difficulty curve

2-5 must not feel easier than 2-4.

### Broad Assembly
- 250–320px relations
- large footing
- readable warm-up

### Broken Queue Span / Patrol
- G1→G2 ≈380px
- vertical Patrol crossing
- landing width around 160–192px

### Transit Neck
- G2→G3 ≈358px
- G3→G4 ≈353px
- 96–128px target landing class
- Assembly Guard pressure
- kill optional

This is **Gameplay Peak 1**.

### Safe Story
Enemy pressure = 0.

This deliberate trough protects Story comprehension.

### Commit Drop 1
Service Hatch → G5 ≈339px nominal relation.

Catch is read while falling.

Miss:
Recovery pocket, not death.

A real divider prevents walking forward from Recovery.

### Access B
Optional local branch from narrow maintenance shelf.

### Commit Drop 2
Maintenance Shelf → G6 ≈379px nominal relation.

No regain of Gate height afterward.

This is **Gameplay Peak 2**.

No mandatory 390–400px catch.

## 7. Entry / Broad Assembly Concourse

Entry:
`(-864,-32)`

P0:
- center `(-832,0)`
- W320

Assembly Concourse:
- center `(-640,-128)`
- W384

Exact Entry Story:
`EVACUATION WALKWAY / UPPER TRANSIT RESTRICTED`

Public architecture can initially be walked/jumped.

Rope difficulty ramps after the first broken Queue span.

## 8. G1 / Queue Shelf A

G1:
`(-560,-224)`

Queue Shelf A:
- center `(-448,-256)`
- W192

This is the transition from:
public walking space
to:
broken public evacuation infrastructure.

## 9. Vertical Patrol Band

Patrol is intentionally **not another 2-2 horizontal bridge Patrol**.

Proposed planning path:
`(-288,-160) ↔ (-288,-368)`

Behavior family:
preserve current `patrol-drone-t1`.

Keep:
- speed 48
- wait 0.45
- pingpong
- kill optional
- no Rope Cut
- target-lock-cycle
- activation-band-only

Only the path orientation / bounds are re-authored.

Runtime validation required because current authored Patrol path is horizontal.

Purpose:
the Drone cuts vertically across the shrinking public route rather than following the Player along it.

## 10. G2 / Public Recovery

G2:
`(-192,-320)`

G1→G2:
≈380px.

Public Recovery:
- center `(-96,-192)`
- W256
- target retry `4–6s`

Miss costs position and Patrol timing,
not full Stage reset.

Recovery does not skip the Neck.

## 11. G3 / Transit Neck

G3:
`(+160,-384)`

Transit Neck:
- center `(+160,-416)`
- W128

G2→G3:
≈358px.

This is the spatial compression moment.

The Player feels:
a public walkway built for a crowd
has narrowed into a compromised single-person traversal.

## 12. Assembly Guard / G4

Assembly Guard:
around `(+288,-416)`.

Authority:
current `SECTOR_02_SUPPORT_POOL`.

G4:
`(+512,-448)`

G3→G4:
≈353px.

Rules:
- kill optional
- no Rope Cut
- no kill gate
- activation starts after the Patrol phase
- activation ends before Story Forecourt

The Guard should make the Neck tense,
not turn the Forecourt into combat.

## 13. Safe Story Forecourt

Forecourt:
- center `(+576,-480)`
- W256

This is fully safe.

Required:
- Patrol pressure ended
- Assembly Guard pressure ended
- Carrier B not active
- no hazard

The Player must be able to read:
- locked Gate
- evacuation-status display
- waiting/queue traces

without attacks.

## 14. Locked Upper Transit Gate

Gate:
around `(+788,-480)`.

Contract:
- public barrier
- sealed
- non-grappleable
- narrative lock
- **never opened in 2-5**

This is the end of the ordinary evacuation route.

1-8:
Player overrides and opens a Gate.

2-5:
Player accepts the public Gate as closed and leaves public circulation.

## 15. Story sequence

At Forecourt:

`EVACUATION GROUP C / ASSEMBLY COMPLETE`

then:

`TRANSFER AUTHORIZATION / PENDING`

then:

`UPPER TRANSIT ACCESS / RESTRICTED`

No dramatic cut.

Same physical frame should ideally retain:
Player + Status + Gate.

## 16. Player Bark

Approved:

`…여기까지 왔는데, 위로는 못 간 건가.`

Trigger:
after the full three-part status sequence,
with the locked Gate physically visible.

Interpretation remains uncertain.

Status:
**NOT IMPLEMENTED — PLAYER BARK LAYER**

Do not fake as System Toast.

## 17. Service Hatch

Hatch:
around `(+720,-558)`.

The Player does not open the public Gate.

They enter a small service aperture beside/under it.

Visual contract:
- no civilian-width corridor
- no public handrail
- narrow maintenance frame
- Rope access expected
- visibly unsuitable as mass evacuation circulation

This distinction is part of Story logic.

## 18. Commit Drop 1

G5 / Drop Catch 1:
`(+464,-336)`

Nominal:
Hatch `(720,-558)` → G5 ≈339px.

Narrow Maintenance Shelf:
- center `(+432,-272)`
- W128

Player loses Gate elevation.

No immediate re-ascent.

Drop 1 Recovery:
- center `(+688,-160)`
- W192

A solid Divider separates Recovery from the successful Shelf.

If Player misses:
they can recover and re-grapple,
but cannot simply walk to the next phase.

Retry:
`5–9s`.

## 19. Access Module B

From successful Maintenance Shelf:

Access Anchor:
`(+320,-320)`

Carrier Alcove:
- center `(+208,-272)`
- W160

Current Carrier:
`upper-transit-guard`

Pool:
`SECTOR_02_LATE_POOL`

Access ID:
`sector-02:access-module:b`

Rules:
- exactly one current Carrier slot
- no escort
- no fourth enemy
- activate only after service-path commit
- Carrier kill required to collect Module B
- Module B optional for local 2-5 exit
- globally required by Sector 02 3-of-3 Transit Lock
- preserve current off-screen arrow / on-screen diamond marker
- no authored Access text label

Player returns to the successful Shelf after collecting/skipping B.

## 20. Commit Drop 2

G6 / Drop Catch 2:
`(+96,-96)`

Nominal:
Maintenance Shelf `(432,-272)` → G6 ≈379px.

This is the longest mandatory relation.

It is a skilled commitment,
not a 390–400px reach-limit gimmick.

Drop 2 Recovery:
- center `(+384,-80)`
- W160

A second solid Divider prevents Recovery from walking directly to Exit.

Miss:
Recovery + reattempt.

Retry:
`5–8s`.

Successful catch lands on the low service side.

## 21. Exit

Low Service Exit:
- center `(+80,-64)`
- W256

Exit target:
around `(+32,-64)`.

Next:
`sector-02-06`.

Crucial:
the Stage ends **lower than the public Gate**.

No return to original Gate elevation.

This distinguishes the two drops from 1-5.

2-6 is `QUIET RESIDENTIAL VOID`,
so all Security pressure ends before exit.

## 22. Enemy phasing

Exactly **3 slots**:

### Phase A — Patrol
vertical public-concourse pressure.

### Phase B — Assembly Guard
narrow Transit Neck pressure.

### Phase C — Carrier B
maintenance-access optional combat.

Ordering:

**PATROL → ASSEMBLY → SAFE STORY → CARRIER**

Never:
A + B + C simultaneous.

Never attack Player while reading Story.

## 23. Generic Augment expression

Current generic Augments influence execution naturally:

- reach: easier skilled catches
- propulsion / launch: faster broken Queue traversal
- recovery: faster re-entry
- combat: optional Guard / Carrier handling
- defense: tolerate public pressure
- movement correction: narrow Neck and Drop catches

But:
- no Build lock
- no specific card required
- no card-named route
- no selected-card proof gate

The service route is available because the Player is a maintenance worker with Grapple access,
not because they own a particular Augment.

## 24. Environmental Story

Final art may show:

Public section:
- queue rails
- waiting chairs
- water containers
- bags
- folded blankets
- orderly assembly markings
- worker ID tags

Forecourt:
- dense but orderly waiting traces
- evacuation status screen
- sealed upper-transit Gate

No:
- bodies
- blood
- panic graffiti
- HELP / SAVE US
- goodbye notes

The disturbing fact is:
**people assembled here and the system remained unresolved.**

Service section:
- raw framing
- cable trays
- maintenance labels
- narrow shelves
- no civilian amenities

## 25. Camera

Default Camera first.

Public:
Player + next skilled target + current security phase.

Forecourt:
Player + locked Gate + Story Display.

No cinematic zoom/pan required.

Drop 1:
Gate remains partially readable above if geometry allows,
then Catch 1 becomes primary.

Drop 2:
Catch + recovery relation must be readable during fall.

If dynamic catch is unreadable:
adjust shaft width / target placement before custom Camera.

## 26. Similarity audit

### vs 2-1
2-1:
diagonal low-rise ascent.

2-5:
mostly horizontal civic traversal followed by irreversible downward service descent.

PASS.

### vs 2-2
2-2:
one long horizontal bridge + horizontally moving Patrol.

2-5:
broken/narrowing stepped public Concourse + vertically crossing Patrol + Gate + Commit Drops.

Meaningful overlap:
rightward traversal only.

PASS.

### vs 2-4
2-4:
braided route-choice field with switch/remerge.

2-5:
single mandatory funnel.
No Safe/Flow/Pressure system.
No route switching.

PASS.

### vs 1-5
1-5:
deliberate drop followed by height recovery / Horseshoe.

2-5:
drop after Gate and continue downward to exit.

Meaningful overlap:
deliberate height loss only.

PASS.

### vs 1-7
1-7:
S-curve with multiple horizontal reversals.

2-5:
one public direction, then one service descent.
No repeated reversal.

PASS.

### vs 1-8
1-8:
Gate override opens route/world state.

2-5:
public Gate stays closed forever in this Stage.

Meaningful overlap:
Gate as Story object only.

PASS.

Maximum meaningful overlap:
**1**

## 27. Obstacle function

Primary:
**PUBLIC EVACUATION ROUTE COMPRESSES INTO A LOCKED TRANSIT TERMINUS**

Then:
**MAINTENANCE-ONLY DESCENT**

Every gameplay change has architectural causality:

broad crowd space
→ broken queue circulation
→ narrow Transit Neck
→ public Gate
→ service hatch
→ non-civilian maintenance descent

This is the Stage identity.

## 28. Pacing

First mainline:
`2:05–2:45`

Mastered:
`1:00–1:25`

With Access B first:
`2:30–3:15`

HYPOTHESIS.

Targets:
- Entry/Assembly 8–12s
- skilled public spans + Patrol 25–40s
- Neck + Guard 15–25s
- Safe Story 12–18s
- Drop 1 10–18s
- Access B variable
- Drop 2 10–18s
- exit 3–6s

REDESIGN if:
- public max catch falls below ~340px everywhere
- Story Forecourt can be attacked
- all 3 enemies overlap
- Gate opens
- Drops can be bypassed by walking Recovery
- Carrier blocks local exit
- maintenance structure reads civilian-accessible
- Stage turns into another route-choice field
- first mainline >3:00 excluding repeated mistakes / optional Carrier fight

## 29. Five Gates

MAP SCALE:
**PASS**

MAP SIMILARITY:
**PASS — FINAL REV3**

OBSTACLE FUNCTION:
**PASS**

LENGTH / PACING:
**HYPOTHESIS PASS — PLAYTEST REQUIRED**

CURRENT GITHUB RUNTIME:
**3-SLOT + ACCESS B + LOCKED GATE + STORY + MAINTENANCE-BYPASS CONTRACT MATCH / MAJOR TOPOLOGY RE-AUTHOR**

User approved full package generation.
