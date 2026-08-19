# SECTOR 01-6 — COOLING SHAFT — REV8.0

> **DESIGN LOCKED**
> Runtime audit baseline: `ea9c4438c0f106474baa09621bfb42ae5876b86e`
> Current Runtime: `3840×1408`
> REV8 target: **`3840×1280`**
> Spatial signature: **WIDE OPEN CROSS-FLOW PLENUM**
> Runtime status: `SYSTEM MATCH / MAJOR GEOMETRY RE-AUTHOR`

## 1. One-line experience

1-5에서 Build를 실제 공간에 적용한 Player가
고장 난 Cooling Distribution 구역으로 들어오고,
처음으로 **환경의 힘이 Rope 궤적 자체를 바꾸는 경험**을 한다.

Core body trace:

`ENTRY RIGHT → FAN A LEFT SWEEP → WIND SHADOW → FAN B RIGHT SWEEP → EXIT RIGHT`

Mainline is two huge horizontal cross-flow sweeps.

## 2. Stage function

1-5:
`PLAYER PROVES ADAPTATION`

1-6:
**`ENVIRONMENT REACTS`**

Primary lesson:
**FIRST EXTERNAL FORCE — WIND**

New mechanic:
WIND

Do not add:
- new enemy family
- moving platform
- fan blade damage
- instant death pit
- Rope cutter
- Grapple jammer
- second Augment choice

## 3. Latest Runtime facts — VERIFIED

At `ea9c4438c0f106474baa09621bfb42ae5876b86e`:
- area name `COOLING SHAFT`
- subtitle `AIRFLOW FAILURE`
- current bounds `3840×1408`
- current main route uses B / D landmarks
- Fan A:
  - direction LEFT
  - mode continuous
  - strength 500
  - falloff 80
  - damage false
- Fan B:
  - direction RIGHT
  - mode pulsed
  - strength 800
  - falloff 80
  - cycle:
    - LULL 1.75
    - WARNING 0.7
    - ACTIVE 1.4
    - DECAY 0.3
  - damage false
- current wind occlusion concept exists
- Access Module B exists
- Access encounter = Carrier + 2 Guards
- current Stage enemy slots = 3
- final-deck reach → exit panel
- Entry Story presentation:
  - `COOLING DISTRIBUTION / AIRFLOW UNSTABLE`
- camera phases currently:
  - airflow-preview
  - fan-a
  - neutral-deck
  - fan-b
  - exit

## 4. Story verification boundary

VERIFIED visible Story:
`COOLING DISTRIBUTION / AIRFLOW UNSTABLE`

Current `storyTriggers` inventory also contains:
- `cooling-pressure-critical`
- `bypass-required`

But those are NOT verified as visible authored Presentation at this baseline.

Status:
`HOLD / NOT VERIFIED AS PRESENTATION`

Do not invent Toasts for them in REV8.

## 5. Player Bark Runtime boundary

At the baseline, `src/game/presentation/` contains:
- `AuthoredStoryPresentation.js`
- `PlayerRespawnPresentation.js`
- `WorldUnlockPresentation.js`

No separate Player Bark layer is verified.

Therefore all 1-6 Player dialogue is:

`DESIGN LOCKED / NOT IMPLEMENTED — PLAYER BARK LAYER`

The Stage must remain fully playable without Bark implementation.

## 6. Scale

Target:
`3840×1280`

Local:
- X `-1920..+1920`
- Y `0..-1280`

Why:
- Wind direction must define the main spatial axis.
- Two large cross-flow lanes need visible travel distance.
- Neutral Wind Shadow needs real spatial separation.
- Optional Access Intake needs deep side-space.
- Height is reduced because 1-6 is not another upward shaft.

Scale rhythm:
- 1-5 `2304×1152`
- 1-6 `3840×1280`
- 1-7 current `3840×1536`

## 7. Spatial signature

```text
LOWER CROSS-FLOW

                               ENTRY RIGHT
                                    │
                                    ▼
FAN A      <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
               PLAYER SWEEPS LEFT
                       │
                       ▼
                 WIND SHADOW


UPPER CROSS-FLOW

                 PULSE SETUP
                       │
                       ▼
FAN B      >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
               PLAYER SWEEPS RIGHT
                                    │
                                    ▼
                                EXIT RIGHT
```

Dominant body trace:
**RIGHT → LEFT → READ / RESET → RIGHT**

Minimal vertical stacking.

## 8. Entry / airflow preview

Entry target:
`(+1408,-32)`

P0:
- center `(+1408,0)`
- W512

Anchor A:
`(+1120,-192)`

Before direct Wind exposure:
- gameplay reads the wind-zone direction
- final art may use steam / cable / cloth motion
- MAP-PREVIEW shows only real Wind Zone / vector

Entry Story:
`COOLING DISTRIBUTION / AIRFLOW UNSTABLE`

No Entry Bark.

## 9. Fan A — first continuous Wind

Fan A source target:
near right side around `(+1664,-352)`

Preserve starting Runtime contract:
- LEFT
- continuous
- strength 500
- no damage

Wind Zone target:
approximately
- X `-480..+1536`
- Y `-160..-480`

Main route direction:
**RIGHT → LEFT**

Gameplay grips:
- A `(+1120,-192)`
- B `(+736,-288)`
- C `(+320,-352)`

Neutral Landing:
- center `(-128,-416)`
- W416

Base:
`A → B → C → Neutral Landing`

The first Wind assists the desired direction.

Lesson:
**Wind is a force, not automatically a punishment.**

## 10. Fan A recovery

Lower Recovery:
- center `(+544,-128)`
- W320

Miss retry target:
`4–6s`

No Stage reset.

## 11. Bark A — STARTLED

Trigger intent:
first meaningful unexpected Fan A influence changes Player's lateral motion while attached or airborne.

Text:
`뭐야—!`

Timing:
immediate reflex during first unexpected push.

Do NOT fire:
- at Stage entry
- from visual preview only
- after Fan A has already been successfully understood in this attempt

Purpose:
Player reacts before understanding.

Status:
`NOT IMPLEMENTED — PLAYER BARK LAYER`

## 12. Central Wind Shadow

Functional Cooling Baffle:
- center `(-224,-544)`
- W96
- H288
- STATIC
- SOLID
- NON-GRAPPLEABLE
- NON-DAMAGING
- WIND OCCLUDER

Neutral Deck:
- center `(-160,-576)`
- W512

Purpose:
`WIND ON → WIND OFF`

The absence of force explains the spatial boundary.

No combat here.

## 13. Bark B — IDENTIFY CAUSE

Trigger:
Player reaches Neutral Landing / Wind Shadow after first Fan A traversal.

Text:
`…바람 때문에 밀린 건가.`

Timing:
after Player stabilizes and Fan A force/audio drops away.

Purpose:
confusion becomes observation.

Status:
`NOT IMPLEMENTED — PLAYER BARK LAYER`

## 14. Fan B — pulsed Wind

Fan B source target:
near far left around `(-1664,-800)`

Preserve starting Runtime contract:
- RIGHT
- pulsed
- strength 800
- LULL 1.75
- WARNING 0.7
- ACTIVE 1.4
- DECAY 0.3
- no damage

Wind Zone target:
approximately
- X `-1408..+1280`
- Y `-704..-992`

Setup Deck:
- center `(-704,-704)`
- W288

D:
`(-448,-768)`

E:
`(+64,-832)`

F:
`(+704,-896)`

Exit Approach:
- center `(+1184,-992)`
- W352

Main direction:
**LEFT → RIGHT**

## 15. Fan B timing rule

Same route.
Two valid timing styles.

### Control
Use LULL / DECAY.
Base Rope remains predictable.

### Speed
Enter WARNING / ACTIVE.
Use the rightward pulse for larger/faster carry.

Do NOT teach:
`ACTIVE = red / never move`.

The goal:
`ACTIVE = more force / more commitment / potentially faster`

Both approaches must be valid.

## 16. Fan B recovery

Pulse Miss Catch:
- center `(+320,-736)`
- W320

Retry target:
`5–8s`

No Stage reset.

## 17. Bark C — INTENTIONAL USE

Trigger:
Player reaches Far Catch / equivalent success after:
- entering Fan B during WARNING or ACTIVE
- receiving meaningful rightward pulse assistance
- completing the intended traversal successfully

Text:
`…이 바람, 이용할 수 있겠는데.`

Do NOT fire:
- on LULL-only clear
- merely when ACTIVE begins
- on failed attempt

Purpose:
external interference becomes a usable movement resource.

Status:
`NOT IMPLEMENTED — PLAYER BARK LAYER`

## 18. Dialogue causality

Dialogue arc:

`STARTLED → IDENTIFY CAUSE → INTENTIONAL USE`

Physical event first.
Interpretation second.
Strategy last.

Forbidden:
- explicit control tutorial
- `바람 방향으로 가면 된다`
- `강풍 때 움직이면 된다`
- `기다렸다 가자`

No Exit Bark.

## 19. Optional Access Module B

Access Module:
`sector-01:access-module:b`

Main route does not require it.

Location:
far-left Cooling Intake Pocket.

Access A:
`(-672,-576)`

Access B:
`(-1056,-640)`

Intake Deck:
- center `(-1456,-672)`
- W704

Carrier:
`(-1456,-672)`

Guard 1:
`(-1728,-672)`

Guard 2:
`(-1184,-672)`

Exactly:
**Carrier + 2 Guards**

Carrier carries:
`sector-01:access-module:b`

Deepest meaningful side-space.
Highest local pressure.
Base Rope clearable.
Augment useful but not required.
No teleport.

## 20. Access route

From Neutral Deck:
`Neutral → Access A → Access B → Intake Pocket`

Return:
`Intake Pocket → Access B → Access A → Neutral`

At least two meaningful Rope decisions.

Success return target:
`10–20s`

The optional pocket may reuse residual continuous LEFT flow.

Do NOT introduce a third Wind behavior.

## 21. Enemy contract

Total Stage slots:
**3**

All 3 are optional Access:
1. Carrier
2. Guard
3. Guard

Mainline:
**0 enemies**

Critical rule:
first Wind learning failure must read as:

`WIND + ROPE`

not:
`WIND + ENEMY + PROJECTILE`

## 22. Augment expression

No specific Augment required.

Natural benefits:
- fast-launch → late catch under flow
- long-rope → earlier cross-flow catch
- fast-recover → quicker missed-flow retry
- release-propulsion → tailwind carry
- direction-dash → landing correction
- slow-fall → cross-flow correction
- combat Rope / Action cards → optional Access pressure

But 1-6's new lesson remains:
**WIND**

Do not convert the Stage into another Build tutorial.

## 23. Story function

Sector arc:
`ENVIRONMENT REACTS`

Meaning:
Cooling infrastructure still operates,
but unstable airflow now physically changes Player movement.

Do not imply:
- intentional accident
- sabotage proof
- conspiracy

## 24. Psychology

Start:
- Fear ~48
- Control ~55
- Understanding ~39

First Fan A push:
- Fear ~55
- Control ~44
- Understanding ~40

Wind Shadow:
- Fear ~50
- Control ~50
- Understanding ~47

Fan B intentional use:
- Fear ~48
- Control ~58
- Understanding ~52

Exit:
- Fear ~50
- Control ~58
- Understanding ~54

Arc:
**COMPETENCE → STARTLED → IDENTIFY FORCE → READ CYCLE → USE FORCE**

## 25. Story beats

### S0 Entry
VERIFIED:
`COOLING DISTRIBUTION / AIRFLOW UNSTABLE`

### S1 Fan A first push
No System Toast.
Bark A if layer exists.

### S2 Wind Shadow
No System Toast.
Bark B if layer exists.

### S3 Fan B cycle
No Story Toast.
Use Gameplay telegraph:
`LULL → WARNING → ACTIVE → DECAY`

### S4 Fan B assisted success
No System Toast.
Bark C if layer exists.

### S5 Optional Access
No new lore Toast.

### S6 Exit
No new 1-6 Toast required.
1-7 Entry owns the next Story beat.

## 26. Camera

C01 `airflow-preview`
- ~1.05
- Entry + A + first Wind boundary

C02 `fan-a-crossflow`
- ~0.78–0.84
- Player + next 2 grips + Neutral Landing
- horizontal movement space

C03 `neutral-shadow`
- ~1.02
- Player + Baffle edge + safe Fan B observation

C04 `fan-b-crossflow`
- ~0.76–0.82
- D/E/F + wind direction + Far Catch
- widest mainline movement frame

C05 `access-intake`
- ~0.86
- optional
- Player + firing angle + next Access anchor
- do not show whole Arena

C06 `exit`
- ~1.10

No forced cinematic pan.

## 27. Pacing

Mainline first:
`1:40–2:20`

Mainline mastered:
`0:50–1:10`

Access included first:
`2:35–3:20`

Access included mastered:
`1:25–1:50`

REDESIGN if:
- Fan A feels mainly punitive
- Fan B state cannot be predicted
- waiting is always optimal
- ACTIVE is always optimal
- mainline has enemy interference
- cross-flow becomes long flat walking
- Access return >20s
- map reads as another vertical shaft

## 28. Five Gates

### MAP SCALE / WORLD FOOTPRINT
**PASS**

### MAP SIMILARITY
**PASS**

1-6 is two cross-flow sweeps, not:
- 1-1 riser
- 1-2 blocking-mass bypass
- 1-3 spine + Annex
- 1-4 lab
- 1-5 horseshoe/drop loop

### OBSTACLE FUNCTION
**PASS**

Primary:
`EXTERNAL FORCE MODIFIES ROPE ARC`

### LENGTH / PACING
**HYPOTHESIS PASS — PLAYTEST REQUIRED**

### CURRENT GITHUB RUNTIME
**SYSTEM MATCH / MAJOR GEOMETRY RE-AUTHOR**

## 29. 1-5 → 1-6 Seam dependency

At this baseline, current main still contains the old 1-5 Runtime blockout.

Do NOT finalize 1-6 Entry continuity against stale 1-5 coordinates.

Implementation order:
1. land/reconcile approved 1-5 REV8
2. read actual final deck / exit / Seam transform
3. minimally adjust 1-6 connector / entry
4. preserve 1-6 cross-flow topology
5. test seamless transition and camera handoff

Status:
`SEAM COORDINATE FINALIZATION — DEFER UNTIL 1-5 REV8 RUNTIME EXISTS`

## 30. Gameplay Preview rule

`MAP-PREVIEW.html` is Gameplay-only.

Wind Zone is displayed because it changes physics.

Do NOT add scenery-only:
- fan housing
- pipes
- steam
- decorative frames
- cables
- background cooling core
