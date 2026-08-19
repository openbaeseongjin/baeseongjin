# SECTOR 01-5 — AUGMENT TEST BAY — REV8.0

> **DESIGN LOCKED**
> Runtime audit baseline: `29d72baa1879850ea9e811ff6640dfce7e23c7c9`
> Current Runtime: `960×1280`
> REV8 target: **`2304×1152`**
> Spatial signature: **HORIZONTAL HORSESHOE / DROP-THROUGH LOAD LOOP**
> Runtime status: `PARTIAL CONTRACT MATCH / MAJOR BLOCKOUT RE-AUTHOR`

## 1. One-line experience

1-4에서 Augment를 선택하고 Micro-Calibration까지 끝낸 Player가,
실제 Load Test Bay를 통과하며
**그 카드가 실전 이동·Recovery·Security 압력에서 어떻게 자신의 해법을 바꾸는지 증명한다.**

Core body trace:

`SHORT ASCENT → LONG RIGHT COMMIT → CONTROLLED DROP → LOW TEST SLOT → RE-LAUNCH → UPPER LEFT RETURN`

1-5의 기억점은:
**진행을 위해 일부러 높이를 버렸다가 다시 회복한다.**

## 2. Stage function

1-1: Basic Rope  
1-2: Airborne Re-Attach / Mechanical Bypass  
1-3: Security Pressure + Access Objective  
1-4: Select + Micro-Calibration  
**1-5: FIRST LIVE BUILD EXPRESSION**  
1-6: Environmental Airflow

New mechanic:
**NONE**

This Stage does not introduce Wind, moving platforms, Rope cutters, jammers, new enemies, or another Augment source.

## 3. Current Runtime facts — VERIFIED

At baseline:
- name `AUGMENT TEST BAY`
- subtitle `LIVE CALIBRATION`
- bounds `960×1280`
- Entry `(-320,-32)`
- Grapple landmarks C/G
- exactly 2 enemy slots using Sector 01 Early Pool
- no Wind
- no moving platform
- objective `final-deck-reached`
- exit panel requires final deck
- Camera phases: load-gap / relay-spine / live-security / exit
- Story entry:
  - `AUGMENT TEST BAY / LIVE CALIBRATION`
- Story current positional sequence:
  1. `VERTICAL LOAD TEST / IN PROGRESS`
  2. `SECURITY RESPONSE TEST / IN PROGRESS`
- Gate handoff:
  - `COOLING DISTRIBUTION / SERVICE ACCESS`

## 4. Stale planning retired

Do not use:
- `impulse-express`
- `relay-express`
- `shear-control`
- fixed IMPULSE / RELAY / SHEAR first-build assumptions
- old A~H ladder-style authoring
- vertical Anchor staircase topology

Current Augment v1 is the authority.

## 5. Scale

Target:
`2304×1152`

Local bounds:
- X `-1152..+1152`
- Y `0..-1152`

Why:
- Stage needs a genuinely long horizontal Load Span.
- Controlled Drop must be separated from the Re-launch.
- Upper Return must cross back over prior space.
- Height stays below the later Cooling Stage so 1-6 owns the next environmental escalation.

Scale rhythm:
- 1-4 `1152×832`
- 1-5 `2304×1152`
- 1-6 current `3840×1408`

## 6. Spatial silhouette

```text
                                   HIGH RETURN
                  EXIT ◄─────────────────────────────┐
                    ▲                               │
                    │                               │
                    │                        RE-LAUNCH
                    │                               ▲
ENTRY → SHORT RISE ───────► LONG RIGHT SPAN         │
                                      │              │
                                      ▼              │
                                CONTROLLED DROP      │
                                      │              │
                                      ▼              │
                                  LOW TEST SLOT ─────┘
```

This is not a vertical zig-zag.

## 7. Entry / Short Rise

Entry:
`(-896,-32)`

P0:
- center `(-832,0)`
- W512
- H32

C:
`(-704,-224)`

Launch Deck:
- center `(-560,-320)`
- W288

The opening only establishes test height.
Target:
`8–12s`.

## 8. Problem A — Long Right Load Span

Structural Grip F1:
`(-176,-384)`

Structural Grip F2:
`(+224,-416)`

Far Right Landing:
- center `(+736,-448)`
- W320

Base:
`C → Launch Deck → F1 → F2 → Far Right Landing`

This is one lateral air commitment, not a platform staircase.

### R1 miss catch

- center `(+64,-256)`
- W320
- recovery

Miss retry target:
`4–6s`

## 9. Problem B — Controlled Drop

At Far Right Landing, the intended progression turns **downward**.

Drop corridor:
- around x `+704..+960`
- from around y `-448`
- landing into Low Test Slot around y `-160`

The Camera must reveal the Low Slot **before** or during the start of the drop.

The drop:
- is progression
- is not failure
- is not damaging
- is not instant death
- has no Wind
- has no moving geometry

## 10. Low Test Slot

Floor:
- center `(+736,-160)`
- W448

Static Cover:
- around center `(+608,-216)` conceptual floor-standing
- approx W72 H112
- STATIC
- SOLID
- NON-GRAPPLEABLE
- NON-DAMAGING
- LOS BLOCKER

Enemy Slot 1:
`(+864,-160)`

Allowed pool:
current `SECTOR_01_EARLY_POOL`.

Kill:
**NOT REQUIRED**

Role:
light pressure while Player selects how to leave the low channel.

## 11. Problem C — Re-launch

Re-launch Anchor:
`(+544,-352)`

Mid Grip:
`(+352,-512)`

High Capture:
`(+192,-672)`

Base:
`Low Slot → Re-launch → Mid Grip → High Capture`

This is one committed height recovery,
not another multi-floor ladder.

Augments may compress or stabilize it,
but no Augment is required.

## 12. Upper Left Return

G:
`(-160,-768)`

Enemy Slot 2:
`(+96,-832)`

Upper Return Deck:
- center `(-416,-832)`
- W288

Static Cover:
- around center `(-224,-888)` conceptual floor-standing
- W64 H112
- STATIC
- LOS blocker
- NON-GRAPPLEABLE

Final Return Grip:
`(-576,-928)`

Final Deck:
- center `(-768,-1024)`
- W384

Exit:
upper-left.

The dominant motion here is **leftward**.

## 13. Base route

`ENTRY`
→ C
→ Launch Deck
→ F1
→ F2
→ Far Right Landing
→ Controlled Drop
→ Low Test Slot
→ Re-launch
→ Mid Grip
→ High Capture
→ G
→ Upper Return Deck
→ Final Return Grip
→ Final Deck
→ Exit

All valid first Augments can clear the same base route.

## 14. Build expression — Rope cards

### fast-launch
- later F1/F2 Hook commitment
- later Drop catch
- faster Re-launch catch
- less Security exposure during Hook flight

### long-rope
- earlier F2 acquisition
- wider Drop catch
- earlier High Capture
- route compression, never geometry-key requirement

### fast-recover
- faster Span chain recovery
- faster retry after missed Drop catch
- faster Re-launch retry

### release-propulsion
- deeper Right Span carry
- stronger Low Slot Re-launch
- shorter Upper Return setup

### electrified-rope
- Low Guard / Upper Guard can be pressured by attached Rope geometry while movement continues

### collision-explosion
- high-speed body contact around Low Slot exit / Upper pressure can create combat compression
- kill not required

## 15. Build expression — Base Actions

### direction-dash
- Right Landing correction
- Drop Slot lateral correction
- Upper Return compression

### dash-strike
- merge Low Slot exit movement and Guard pressure

### instant-guard
- maintain Drop or Upper Return through one readable combat hit

### push-away
- create space if current pool selects displacement-eligible pursuit behavior
- otherwise still damage
- no geometry dependency

### straight-shot
- pressure Upper Guard from Return Deck

### slow-fall
- strongest natural expression during Controlled Drop
- more aiming/landing correction time
- also stabilizes Long Span release

## 16. Build fairness

Do NOT:
- create 12 routes
- create card-labelled gates
- make one card required
- make one card skip most of the Stage
- tune base route around Augment-only reach
- add another mandatory calibration objective

1-4 verifies the card.

1-5 lets the card improve:
- time
- safety
- recovery
- combat pressure
- motion continuity

## 17. Enemy contract

Exactly 2 enemy slots.

1. Low Guard:
`(+864,-160)`

2. Upper Guard:
`(+96,-832)`

Kill:
optional.

No enemy death is a Gate prerequisite.

No new attack family.

No Rope cut.

## 18. Failure / recovery

Long Span miss:
→ R1
→ ~4–6s retry

Controlled Drop:
→ Low Slot
→ intentional progression

Re-launch miss:
→ Low Slot
→ ~4–7s retry

Upper Return miss:
→ upper recovery / re-launch region
→ no Stage-start reset

No full-stage fall.

## 19. Story

Story function:
`PLAYER PROVES ADAPTATION`

Story question:
`이 개조가 실제 작업 흐름에서도 유용한가?`

Answer:
`그렇다.`

No new truth/conspiracy reveal.

No Player Bark.

1-4 already owns:
`…이건 쓸 수 있겠네.`

1-5 proves it by play.

### S0 Entry — VERIFIED text
`AUGMENT TEST BAY / LIVE CALIBRATION`

### S1 Long Right Span
No Toast.

### S2 Load Test Context — VERIFIED text
1. `VERTICAL LOAD TEST / IN PROGRESS`
2. `SECURITY RESPONSE TEST / IN PROGRESS`

REV8 retunes the trigger position to support the new Drop / Low Slot sequence.

### S3 Low Slot
No extra Story text.

### S4 Re-launch
No Story text.

### S5 Upper Return
No Story text.

### S6 Exit — VERIFIED text
`COOLING DISTRIBUTION / SERVICE ACCESS`

## 20. Atmosphere

1-4:
small quiet diagnostic chamber.

1-5:
large operational industrial Test Bay.

Audio:
- cable load/tension
- machinery relays
- large chamber reverb
- existing enemy telegraphs
- selected Augment's existing gameplay sounds
- distant fan pulse at exit

Lighting:
- neutral maintenance white
- instrumentation cyan
- local load-warning yellow
- enemy telegraph red/orange only
- no full-screen alarm wash

## 21. Camera

### C01 launch-span
- Stage Y `0..-448`
- desktop ~0.88
- Player + next 2 grips + far landing

### C02 drop-slot
- follows Far Right Landing → Drop → Low Slot
- ~0.96
- must reveal intended lower destination
- no failure framing

### C03 relaunch
- Low Slot → High Capture
- ~0.92
- Player + Re-launch + Mid Grip + High Capture

### C04 upper-return
- `-736..-992`
- ~0.90
- G + Cover + Upper Guard + leftward destination

### C05 exit
- `-992..-1152`
- ~1.10

No cinematic forced pan.

## 22. Pacing

First clear:
`1:45–2:25`

Mastered:
`0:50–1:15`

Major beats:
1. short ascent
2. long right span
3. controlled drop
4. low pressure slot
5. re-launch
6. upper return

REDESIGN if:
- Drop reads as accidental failure
- Low Slot becomes a combat arena
- Re-launch becomes an Anchor ladder
- one card skips >50%
- flat walking dominates
- understood base route becomes frame-perfect

## 23. Mandatory Gates

### MAP SCALE / WORLD FOOTPRINT
**PASS**

### MAP SIMILARITY
**PASS**

REV3 was rejected.
REV8 approved silhouette is the Horsehoe / Controlled Drop loop.

### OBSTACLE FUNCTION
**PASS**

Primary:
`BUILD EXPRESSION THROUGH HEIGHT LOSS / RECOVERY`

### LENGTH / PACING
**HYPOTHESIS PASS — PLAYTEST REQUIRED**

### CURRENT GITHUB RUNTIME
**PARTIAL CONTRACT MATCH / MAJOR GEOMETRY DELTA**

## 24. Preview policy — DESIGN LOCKED

`MAP-PREVIEW.html` is **GAMEPLAY ONLY**.

Show only:
- actual collision
- actual grapple points
- enemies
- LOS cover
- recovery/safe platforms
- routes
- objective/exit

Do NOT show:
- decorative truss
- background braces
- background cable
- scenery-only beams
- non-gameplay architecture

## 25. 1-4 → 1-5 Seam dependency

At the package baseline, current `main` still contains the old 1-4 Runtime blockout.

Therefore:
- do NOT tune 1-5 entry continuity against the stale current 1-4 coordinates,
- first apply/reconcile the approved 1-4 REV8.1 implementation,
- then validate the physical Seam / spawn / camera handoff into this 1-5 topology,
- preserve the approved 1-5 body trace even if a small connector offset is needed.

Status:
`SEAM COORDINATE FINALIZATION — DEFER UNTIL 1-4 REV8.1 RUNTIME EXISTS`
