# SECTOR 01-2 — DOUBLE ANCHOR SHAFT — REV8.0

> **DESIGN LOCKED**
> Runtime audit baseline: `5ae6efca720720ee34f2a8b45daf1778fd206c1f`
> 1-1 approved scale baseline: `1280×1024`
> 1-2 target core: `1664×960`
> Direction implementation coverage: `npm run validate:direction-specs`

## 1. One-line experience

1-1에서 `…일단 위로.`라는 임시 목표를 잡은 주인공은 정상 이동수단인 Lift에 잠깐 기대한다.
하지만 멈춘 Lift와 Counterweight가 실제 길을 막고 있고,
Player는 오른쪽 A에서 출발해 두 기계 사이 Service Slot으로 몸을 던진 뒤
공중에서 왼쪽 C를 다시 붙잡아 처음으로 Airborne Re-Attach를 익힌다.

핵심은:
`Lift를 고친다`가 아니라
`Lift 없이 움직이는 법에 적응한다`.

## 2. Scale / footprint

Target:
`1664×960`

Local:
- X `-832..+832`
- Y `0..-960`

Why:
- 1-1 `1280×1024`보다 폭 +30%, 높이 -64px
- 더 높은 Shaft가 아니라 더 넓은 machinery crossing
- 1-3 `3840×1152`의 첫 대형 Annex 전 단계
- added width is used by actual machine mass and airborne crossing

## 3. Verified current movement constants

Baseline code:
- Hook Reach: **400px**
- Grapple Link Budget: 600
- Player Jump Speed: 440
- Swing Impulse: 780
- Attach Buffer: 0.1s

Never use stale 440px Hook Reach assumptions.

## 4. Spatial Signature

`OFFSET DEAD LIFT + COUNTERWEIGHT SLOT`

Architecture:
- Dead Lift offset center-right
- Counterweight Tower on left
- 400px Service Slot between their inner edges
- upper Maintenance catwalk wraps left

Player silhouette:
`RIGHT ENTRY → RIGHT A → LEFT AIRBORNE C → RIGHT/CENTER ROOF → LEFT CATWALK → LEFT EXIT`

## 5. Core machinery

### Dead Lift — primary obstacle

Collision:
- x `-96..+352`
- y `-608..-288`
- `448×320`

Properties:
- solid
- oneWay false
- grappleable false
- non-damaging
- static

Function:
`MASS BLOCKING / BYPASS`

### Counterweight Tower

Collision:
- x `-592..-496`
- y `-704..-256`
- `96×448`

Properties:
- solid
- oneWay false
- grappleable false
- non-damaging
- static

Purpose:
- architectural silhouette
- defines left side of Service Slot
- NOT a second independent puzzle

### Service Slot

Between:
- Counterweight right edge `-496`
- Lift left edge `-96`

Width:
`400px`

The 400px slot is a spatial scale reference, not a stand-still Hook solution.

## 6. Target geometry

### Start
- Entry `(+448,-32)`
- P0 center `(+416,0)`, W448

### A / first launch
- A `(+224,-192)`
- Entry→A ≈275px: comfortable

### P1 — first miss catch
- center `(-416,-320)`
- W224
- recovery

P1 is a failure catch, not the intended success route.

### C — first Airborne Re-Attach
- C `(-320,-560)`

Static A→C ≈657px:
impossible as a direct stationary Hook link.

Desired release arc passes approximately around `(-208,-350)` inside the open Service Slot, left of the Dead Lift.
From there to C ≈240px:
inside current 400px Hook Reach.

Therefore the lesson is:
`move body into reach → reattach while airborne`.

### R2 — low reversal catch
- center `(+64,-656)`
- W224
- recovery

### P2 — successful roof reversal landing
- center `(+64,-704)`
- W256

### P3 — upper catwalk
- center `(-160,-768)`
- W320
- H24

### Final Deck
- center `(-352,-832)`
- W384
- topY `-832`

P3→Final Deck relation is low pressure.
No fourth Rope lesson.

### Casing
- left center `(-816,-480)`, `32×960`
- right center `(+816,-480)`, `32×960`

solid / non-grappleable / persistent through Seamless import.

## 7. Movement Signature

`RIGHT-SIDE LAUNCH → AIRBORNE RE-ATTACH LEFT → ROOF REVERSAL RIGHT → CATWALK EXIT LEFT`

Meaningful decisions:
1. A setup / launch
2. Release timing + C Airborne Re-Attach
3. C reversal / roof landing

Post-C catwalk:
known-language close.

## 8. Failure Signature

A→C miss:
`P1 LEFT catch`

C reversal low:
`R2 RIGHT/CENTER catch`

Failure direction alternates around machinery.

Retry target:
3–5s back to same problem.

No full-stage fall.

## 9. Psychology

Arc:
`BRIEF EXPECTATION → DISAPPOINTMENT → PRACTICAL FRUSTRATION → FOCUS → AIRBORNE COMMIT → SMALL ADAPTATION → NEW UNEASE`

Start:
- Fear ~72
- Control ~28
- Understanding ~15

Exit:
- Fear ~67
- Control ~36
- Understanding ~22

This is practical adaptation, NOT system distrust.

## 10. Story / dialogue

### S0 — Dead Lift

VERIFIED:
`LIFT CONTROL / OFFLINE`

DESIGN LOCKED Player Bark:
`…리프트도?`

Status:
`npm run validate:direction-specs`에서 자동 산출

Only Player text in Stage.

### S1 — Manual Access

VERIFIED:
`AUTOMATIC LIFT SERVICE / SUSPENDED · MANUAL ACCESS ONLY`

No Player Bark.

### S2 — Airborne C

No Story text.
No Player text.

Audio:
`Release → free-air → C attach snap`

### S3 — Roof Reversal

No Player text.
No success Toast.

### S4 — Upper Catwalk

Low-pressure close.
No new tutorial.

### S5 — Security Preview

VERIFIED final-deck sequence:
1. `POWER REDUCTION / STAGE 2`
2. +1.2s `SECURITY ACCESS / CHECK`

No Player Bark.

1-3 owns the meaningful Security reaction.

## 11. Camera target

C01 `lift-failure`
- y -224..0
- desktop ~1.15

C02 `left-cross`
- -448..-224
- desktop ~0.94

C03 `airborne-reattach`
- -640..-448
- desktop ~0.90

C04 `roof-wrap`
- -800..-640
- desktop ~0.96

C05 `exit`
- -960..-800
- desktop ~1.10

No forced cinematic camera.

## 12. Atmosphere

- Dead Lift mass is visible.
- Motor hum is absent.
- Cable/brake settle only.
- Counterweight remains motionless.
- During A→C: Rope/free-air/attach dominates.
- After final deck: clean Security beep/servo contrasts with dead machinery.

No explosion.
No full red emergency wash.

## 13. Gate results

MAP SCALE / WORLD FOOTPRINT:
PASS

MAP SIMILARITY:
PASS

OBSTACLE FUNCTION:
PASS — Dead Lift = MASS BLOCKING / BYPASS

LENGTH / PACING:
HYPOTHESIS PASS
- first clear target 1:00–1:30
- mastered 0:25–0:42

CURRENT GITHUB RUNTIME:
SEE GENERATED DIRECTION COVERAGE — `npm run validate:direction-specs`

## 14. Do not do

- restore B/D dedicated anchors
- turn the Lift into a moving platform
- add enemy/wind/laser/augment
- make A→C blind or frame-perfect
- tutorial popup for reattach
- success bark after C
- repeat 1-1's open alternating-ledge topology
- let 1-2 steal 1-3 Security conflict
