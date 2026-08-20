# SECTOR 01-1 — SERVICE SHAFT — REV8.0

> **DESIGN LOCKED**
> Runtime audit baseline: `5ae6efca720720ee34f2a8b45daf1778fd206c1f`
> Geometry authority: REV8 Scale Reset
> Story/Psychology authority: approved REV7 direction, retained here
> REV7.0 package: **SUPERSEDED FOR GEOMETRY**

## 1. One-line experience

사고 직후 주인공은 정상성을 잃은 첫 유지관리 설비를 마주하고 당황한다.
Player는 넓어진 Service Riser 안에서 좌우 Swing을 통해 Rope 기본을 익히고,
실제 Maintenance 구조를 공간 언어로 읽으며 작은 통제감을 얻는다.
Terminal은 그 안도를 다시 흔들고, Stage는 `…일단 위로.`라는 임시 목표로 끝난다.

## 2. Scale

Current Runtime:
`960×960`

REV8 target:
`1280×1024`

Local:
- X `-640..+640`
- Y `0..-1024`

Why:
- Straight Service Riser identity remains compact relative to later Stages.
- Extra width is used by the actual Swing route.
- Height grows only 64px so the tutorial does not become longer just because the world widened.

## 3. Verified current movement constants

At baseline `src/game/config.js`:
- Player radius: 15
- max horizontal speed: 360
- jump speed: 440
- Rope hook speed: 1200
- hook flight ratio: 1/3
- **effective Hook Reach: 400px**
- attach buffer: 0.1s
- swing impulse: 780
- Grapple link budget: 600

Planning must use 400px Hook Reach, not the older 440px assumption.

## 4. Spatial Signature

`STRAIGHT SERVICE RISER WITH ALTERNATING MAINTENANCE LEDGES`

Architectural silhouette:
- one continuous vertical riser
- persistent left/right casing
- no central blocking mass

Player movement silhouette:
`LOWER LEFT → MID RIGHT → MID LEFT → UPPER RIGHT`

This keeps the architecture simple while making the first Rope actions visually legible.

## 5. Geometry

### Entry / Ground
- Entry `(-416,-32)`
- P0 center `(0,0)`, `1184×32`
- Ground Shutter center `(-560,0)`, `128×128`

### Rope / landing
- A `(-128,-192)`
- R1 center `(-304,-240)`, W192
- P1 center `(+224,-320)`, W224
- P2 center `(-144,-560)`, W224
- Cable Overhang center `(+240,-608)`, W256, H32
- C `(-96,-736)`
- R3 center `(-272,-768)`, W192
- P3 center `(+256,-864)`, W256, H24
- Final Deck center `(+320,-947)`, W384

### Casing
- left center `(-624,-512)`, `32×1024`
- right center `(+624,-512)`, `32×1024`
- solid
- oneWay false
- grappleable false
- survives Seamless import
- visible Service Riser casing

## 6. Reach sanity

Approximate static distances:
- Entry → A: ~330px
- A → P1 center: ~375px
- P1 → Cable Overhang center: ~289px
- P2 → C: ~182px
- C → P3 center: ~375px

Base route does NOT require a frame-perfect 400px link.

### Structural Grip

Cable Overhang is a normal grappleable Maintenance structure.

It is useful from the P1 / middle corridor because it offers an architectural read across the shaft,
but it is NOT:
- dedicated Anchor B
- tutorial popup
- unique mandatory solution
- hidden quiz

The Player can clear with base Rope language without proving they discovered the Overhang.

## 7. Movement Signature

`ATTACH → SWING → RELEASE → LAND`

Core:
1. Entry → A
2. A → P1 right
3. cross back toward P2
4. optional Structural Grip read
5. P2 → C
6. C → P3 right open swing
7. Terminal

Airborne Re-Attach is NOT mandatory here.
That belongs to 1-2.

## 8. Psychology

`STARTLED → FOCUS → FIRST UNDERSTANDING → SMALL CONTROL → BRIEF RELIEF → SCALE REVEAL → UNCERTAIN DIRECTION`

Start:
- Fear ~92
- Control ~8
- Understanding ~5

Exit:
- Fear ~72
- Control ~28
- Understanding ~15

1-1 does not complete:
- fear resolution
- accident explanation
- system distrust
- heroic resolve

## 9. Story / dialogue

S0 VERIFIED system:
`GROUND SERVICE ACCESS / LOCKDOWN`

DESIGN LOCKED local Player Bark:
`뭐야…?`
Implementation coverage: `npm run validate:direction-specs`

S1 First Rope:
no Player text

S2 cross-back / Structural Read:
no Player text

S3 Open Swing:
no text; optional nonverbal exhale only

S4 VERIFIED Terminal:
1. `VERTICAL GRID / CASCADE FAILURE`
2. +0.9s `LOWER TRANSIT / OFFLINE`
3. +0.9s `ROOFTOP PAD 03 / MAINTENANCE SHUTTLE · STANDBY`

No Player text during sequence.

S5 VERIFIED gate:
`SERVICE SHAFT 02 / ACCESS OPEN`

DESIGN LOCKED local Player Bark:
`…일단 위로.`
Implementation coverage: `npm run validate:direction-specs`

## 10. Camera target

Five-zone structure retained conceptually, resized to REV8:

- intro `-192..0`
- first-hook `-384..-192`
- cross-back / release-corridor `-640..-384`
- open-swing `-896..-640`
- terminal `-1024..-896`

No forced cinematic pan.

## 11. Atmosphere

`NORMAL HUM`
→ `LOCAL RELAY / SHUTTER FAILURE`
→ `ROPE FOCUS`
→ `CROSS-SHAFT UNDERSTANDING`
→ `STRUCTURAL READ`
→ `OPEN SWING RELIEF`
→ `TERMINAL SCALE REVEAL`
→ `UNCERTAIN EXIT`

No full-screen red emergency wash.

## 12. Pre-approval gates

MAP SCALE / WORLD FOOTPRINT:
PASS

MAP SIMILARITY:
PASS as Sector opening baseline

OBSTACLE FUNCTION:
PASS — Cable Overhang = AFFORDANCE / USE

LENGTH / PACING:
HYPOTHESIS PASS
- First clear target 1:20–1:50
- Mastered target 0:38–0:58

CURRENT RUNTIME:
MAJOR DELTA
- Runtime still uses 960×960 old blockout
- REV8 requires full geometry update

## 13. Source split

- README = WHY / PLAYER EXPERIENCE
- AREA-SPEC = WHERE / WHAT
- DIRECTION-SPEC = WHEN / HOW
- PRODUCTION-ALIGNMENT = CURRENT MATCH
- RUNTIME-HANDOFF = IMPLEMENTATION DELTA
- VALIDATION = ACCEPTANCE
