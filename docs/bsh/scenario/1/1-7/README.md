# SECTOR 01-7 — PRESSURE BYPASS — REV8.0

> **DESIGN LOCKED**
> Runtime audit baseline: `ea9c4438c0f106474baa09621bfb42ae5876b86e`
> Current Runtime: `3840×1536`
> REV8 target: **`3328×1472`**
> Spatial signature: **ENCLOSED CHAMBERED S-CURVE**
> Runtime status: `SYSTEM MATCH / MAJOR GEOMETRY RE-AUTHOR`

## 1. One-line experience

1-6에서 Wind Pulse를 이해한 Player가,
더 좁은 Pressure Bypass 내부에서
**같은 RIGHT Pulse가 공간 방향에 따라 방해가 되기도 하고 가속 도구가 되기도 한다는 사실**을 적용한다.

Core body trace:

`LOWER LEFT→RIGHT → MIDDLE RIGHT→LEFT → SAFE SHADOW → UPPER LEFT→RIGHT → MANUAL BYPASS → EXIT`

Stage thesis:

> **같은 WARNING 리듬도 현재 이동 방향에 따라 의미가 달라진다.**

## 2. Stage function

1-6:
`ENVIRONMENT REACTS`

1-7:
**`WARNING RHYTHM BECOMES GAMEPLAY RHYTHM`**

New mechanic:
**NONE**

Existing systems:
- Rope
- selected Augment
- residual Wind
- pulsed Wind
- Wind Shadow
- optional Access combat
- manual interaction

## 3. Latest Runtime facts — VERIFIED

At `ea9c4438c0f106474baa09621bfb42ae5876b86e`:
- name `PRESSURE BYPASS`
- subtitle `MANUAL PRESSURE CONTROL`
- bounds `3840×1536`
- residual airflow:
  - RIGHT
  - continuous
  - strength 220
  - falloff 80
- main pressure vent:
  - RIGHT
  - pulsed
  - strength 800
  - falloff 80
  - LULL 1.75
  - WARNING 0.7
  - ACTIVE 1.4
  - DECAY 0.3
- wind damage false
- Access Module C exists
- Access Carrier + 2 Guards = 3 Stage enemy slots
- current objective:
  `sector-01-07:bypass-open`
- current `storyTriggers`:
  - pressure-unstable
  - containment-violation
  - pressure-limit
  - bypass-ready
  - bypass-open
  - service-route-available

Verified visible Story:
- Entry:
  `PRESSURE NETWORK / UNSTABLE`
- Position:
  `PRESSURE LIMIT / EXCEEDED`
- Position:
  `CONTAINMENT VIOLATION / ACTIVE`

## 4. Enemy-budget correction

Old planning assumed:
- mainline Turret
- plus Access Carrier encounter

That would exceed the current Sector enemy budget.

REV8 rule:

**MAINLINE ENEMY = 0**

All 3 Stage enemy slots are:
1. Access Carrier
2. Access Guard
3. Access Guard

Full combination:
`ROPE + AUGMENT + PULSE WIND + COMBAT`
occurs only in Optional Access Module C pocket.

Do not add a fourth Sentry.

## 5. Scale

Target:
`3328×1472`

Local:
- X `-1664..+1664`
- Y `0..-1472`

Why narrower than 1-6:
- 1-6 owns huge open cross-flow.
- 1-7 should feel compressed / chambered.
- Pressure architecture turns the player repeatedly.
- Access pocket still needs side depth.

Scale sequence:
- 1-6 `3840×1280`
- 1-7 `3328×1472`
- 1-8 current `1024×1792`

## 6. Spatial signature

```text
                                   MANUAL BYPASS / EXIT
                                             ▲
                                             │
UPPER CHAMBER       LEFT ─────────────────► RIGHT
                    ACTIVE = ASSIST
                  ┌──────────────────────────┘
                  │
                  │ SAFE SHADOW / TURN
                  │
MIDDLE CHAMBER      RIGHT ◄──────────────── LEFT
                    ACTIVE = OPPOSE
                  └──────────────────────────┐
                                             │
LOWER CHAMBER       LEFT ─────────────────► RIGHT
                    RESIDUAL AIRFLOW
                                             ▲
                                           ENTRY
```

Body trace:
**RIGHT → LEFT → RIGHT**

Unlike 1-6:
- enclosed chambers
- shorter sweeps
- repeated turns
- same Pulse changes tactical meaning

## 7. Lower Chamber — residual approach

Entry:
`(-1248,-32)`

P0:
- center `(-1248,0)`
- W448

A:
`(-1088,-192)`

B:
`(-672,-256)`

C:
`(-224,-320)`

Right Turn Deck:
- center `(+352,-352)`
- W320

Residual Wind:
- RIGHT
- continuous
- strength 220

Main movement:
**LEFT → RIGHT**

No enemy.

Lower Recovery:
- center `(-544,-128)`
- W288
- target retry 4–6s

## 8. Right Turn / Pressure Preview

Right Turn Pocket:
around `(+448,-448)`

D:
`(+608,-512)`

The Player must be able to read:
- next Middle destination to LEFT
- Pressure Pulse direction RIGHT
- far-left Safe Shadow

Verified Story:
`PRESSURE LIMIT / EXCEEDED`

Preferred trigger:
before or at Middle Chamber commitment.

## 9. Middle Chamber — AGAINST the Pulse

Middle Entry:
around `(+736,-608)`

E:
`(+352,-640)`

F:
`(-128,-704)`

Safe Shadow:
- center `(-704,-832)`
- W352

Pressure Pulse:
RIGHT.

Player motion:
**RIGHT → LEFT**

Therefore:

### LULL / DECAY
more controllable.

### WARNING / ACTIVE
opposes traversal.

This is not a new Wind rule.
Only the spatial relation changed.

Middle Recovery:
- center `(+64,-544)`
- W320
- target retry 5–8s

No enemy.

## 10. Left Safe Shadow

Functional Pressure Baffle:
- around `(-832,-816)`
- W96
- H224
- STATIC
- SOLID
- NON-GRAPPLEABLE
- NON-DAMAGING
- WIND OCCLUDER

Safe Shadow Deck:
- center `(-704,-832)`
- W352

Purpose:
- stop pressure influence
- reset
- allow Player to hear/see next Pulse
- set up Upper Chamber

## 11. Player Bark

Text:
`…아까랑 같은 주기네.`

Trigger:
first stable arrival in Left Safe Shadow after completing Middle opposing-Pulse traversal.

Purpose:
- shows memory / competence
- confirms same cycle
- does not explain controls

Replay:
once per Stage attempt.

Status:
**`NOT IMPLEMENTED — PLAYER BARK LAYER`**

Do not fake as System Toast.

## 12. Upper Chamber — WITH the Pulse

Upper Setup:
around `(-704,-928)`

G:
`(-320,-960)`

H:
`(+160,-1024)`

Far Catch:
`(+704,-1088)`

Main movement:
**LEFT → RIGHT**

Pulse:
RIGHT.

Therefore:

### LULL
maximum precision.

### WARNING
launch preparation cue.

### ACTIVE
assist / speed window.

This is the Stage thesis:
same Pulse,
different tactical meaning.

## 13. Manual Bypass

Bypass Deck:
- center `(+896,-1216)`
- W384

Bypass Panel:
around `(+960,-1216)`

Objective:
preserve:
`sector-01-07:bypass-open`

Type:
interact.

This is a safe control zone.

No enemy.
No Wind pressure at Panel.

Exit Deck:
- center `(+1184,-1344)`
- W352

Exit:
upper-right.

## 14. Optional Access Module C

Module:
`sector-01:access-module:c`

Branch:
from Upper Far Catch.

Access A:
`(+960,-992)`

Access B:
`(+1280,-896)`

Overpressure Inspection Pocket:
- target center `(+1440,-832)`
- compact
- not a huge flat Annex

Carrier:
`(+1440,-832)`

Guard A:
`(+1216,-832)`

Guard B:
`(+1600,-832)`

Exactly:
Carrier + 2 Guards.

Entry:
`Far Catch → Access A → Access B → Pocket`

Return:
`Pocket → Access B → Access A → Far Catch`

No teleport.

## 15. Access pressure

Reuse the same RIGHT Pulse language.

Do NOT introduce:
- third Wind type
- faster cycle
- new enemy attack
- extra enemy slot

Optional pocket is the maximum-combination space:

`ROPE + AUGMENT + PULSE WIND + CARRIER + 2 GUARDS`

Access failure return:
10–20s target.

## 16. Augment expression

No card is a route key.

Natural benefits:
- fast-launch → late WARNING timing / reacquire
- long-rope → earlier chamber catch
- fast-recover → missed pulse retry
- release-propulsion → Upper with-pulse carry
- direction-dash → landing correction
- slow-fall → pulse-window correction
- combat Rope/Action cards → Access pressure

1-7 uses Build knowledge.
It does not reteach Build.

## 17. Failure / recovery

Lower:
4–6s local retry.

Middle:
5–8s local retry.

Upper:
5–8s local retry.

Access:
10–20s local return.

No full Stage reset.
No instant death.

## 18. Story function

Story function:
**SYSTEM INSTABILITY BECOMES PROCEDURAL**

Question:
`이 시설은 아직 정상적인 규칙으로 작동하고 있는가?`

Reveal:
The system is unstable,
but it still produces readable cycles.

The maintenance worker can use those cycles.

Do not reveal:
- sabotage
- deliberate accident
- conspiracy

## 19. Story sequence

### S0 Entry — VERIFIED
`PRESSURE NETWORK / UNSTABLE`

### S1 Lower Chamber
No Toast.

### S2 Pressure Preview — VERIFIED
`PRESSURE LIMIT / EXCEEDED`

### S3 Middle Against-Pulse
No Toast.

### S4 Safe Shadow
Player Bark:
`…아까랑 같은 주기네.`

### S5 Upper With-Pulse
No Toast.

### S6 Upper / Access Restriction — VERIFIED
`CONTAINMENT VIOLATION / ACTIVE`

Preferred use:
when Player enters upper restricted control / Access region.

### S7 Manual Bypass
No unverified Story Toast.
Interaction itself is the story action.

### S8 Exit
No extra Toast.
1-8 Entry owns:
`CONTAINMENT GATE / LOCKED`

## 20. Story verification boundary

Current trigger inventory includes:
- bypass-ready
- bypass-open
- service-route-available

These are **not automatically visible Story**.

Do not bind new Toasts merely because those strings exist in planning inventory.

## 21. Camera

C01 `lower-approach`
- ~0.95

C02 `pressure-preview`
- ~1.02

C03 `middle-against`
- ~0.84
- shows Player + next Grip + Safe Shadow

C04 `left-shadow`
- ~1.05
- tighter read/reset frame

C05 `upper-with`
- ~0.82
- rightward look-ahead

C06 `access-pocket`
- optional ~0.88
- local combat framing
- do not show full enemy formation before commitment

C07 `bypass`
- ~1.08

C08 `exit`
- ~1.12

No forced cinematic pan.

## 22. Pacing

Mainline first:
`2:00–2:45`

Mainline mastered:
`1:00–1:25`

Access included first:
`2:55–3:45`

Access mastered:
`1:35–2:00`

REDESIGN if:
- feels like 1-6 with walls
- Middle and Upper read identically
- LULL is always optimal
- ACTIVE is always optimal
- S-curve becomes simple platform zig-zag
- Access becomes flat arena
- Manual Bypass is slow
- first clear >3:10 without repeated mistakes

## 23. Five Gates

### MAP SCALE / WORLD FOOTPRINT
**PASS**

### MAP SIMILARITY
**PASS**

Different from:
- 1-5 Horseshoe / Drop
- 1-6 open Cross-flow
- 1-8 tall vertical finale

### OBSTACLE FUNCTION
**PASS**

Primary:
**SAME PULSE / DIFFERENT SPATIAL RELATION**

### LENGTH / PACING
**HYPOTHESIS PASS — PLAYTEST REQUIRED**

### CURRENT GITHUB RUNTIME
**SYSTEM MATCH / MAJOR GEOMETRY RE-AUTHOR**

## 24. 1-6 → 1-7 Seam dependency

At this baseline, current main still contains old 1-6 Runtime geometry.

Do NOT finalize 1-7 Entry continuity against stale 1-6 coordinates.

Implementation order:
1. land/reconcile approved 1-6 REV8
2. read actual 1-6 exit / Seam
3. minimally adjust 1-7 Entry connector
4. preserve Chambered S-Curve topology
5. test seamless spawn / camera handoff

Status:
`SEAM COORDINATE FINALIZATION — DEFER UNTIL 1-6 REV8 RUNTIME EXISTS`

## 25. Gameplay Preview rule

`MAP-PREVIEW.html` is Gameplay-only.

Show:
- real Collision
- Grapple
- Wind
- enemies
- Wind Baffle
- recovery
- route
- Access
- Bypass objective

Hide:
- background Pressure Valve Core
- decorative pipes
- decorative walls
- cables
- structural dressing
