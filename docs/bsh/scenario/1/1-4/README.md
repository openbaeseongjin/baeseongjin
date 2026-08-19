# SECTOR 01-4 — MAINTENANCE NODE — REV8.1

> **DESIGN LOCKED**
> Runtime audit baseline: `5ae6efca720720ee34f2a8b45daf1778fd206c1f`
> Current Runtime bounds: `768×640`
> REV8.1 target bounds: `1152×832`
> Primary change: **SELECT → USE SELECTED AUGMENT → CALIBRATION VERIFIED → EXIT**
> Runtime status: `PARTIAL SYSTEM MATCH / NEW CALIBRATION CONTRACT REQUIRED`

## 1. One-line experience

1-3의 Security 압박에서 빠져나온 정비기사는 작은 Maintenance Calibration Lab에 진입한다.
Node는 Grapple을 분석하고 현재 Run에 맞는 3장의 Augment를 제시한다.
Player는 하나를 선택한 뒤 Universal Calibration Frame에서
**자신이 실제로 선택한 카드 효과를 한 번 성공적으로 사용해야**
출구를 열 수 있다.

1-4의 핵심은:
`카드를 고른다`
가 아니라
`내가 고른 카드가 무엇을 바꾸는지 몸으로 증명한다`.

## 2. Current Augment authority

Current `augment-v1`:
- 22-card catalog
- compatible deterministic 3-card offer
- no reroll / rarity / category quota
- max 6 cards per Player
- source `sector-01-04:maintenance-node`
- chooser takes only selecting Player gameplay input
- world / enemies / projectiles / teammates continue
- source consumption and pending offer are Player-specific
- route does not relock for late join after shared completion

Old fixed first offer:
- `impulse-coil`
- `relay-link`
- `shear-current`

is retired.

Those IDs are legacy migration inputs only.

## 3. First-node candidate set

With an empty starting build, current compatibility allows:

### Rope
1. `fast-launch`
2. `long-rope`
3. `fast-recover`
4. `release-propulsion`
5. `electrified-rope`
6. `collision-explosion`

### Base Action
7. `direction-dash`
8. `dash-strike`
9. `instant-guard`
10. `push-away`
11. `straight-shot`
12. `slow-fall`

Signature and modifier cards do not appear as a valid first empty-build choice under the current compatibility rules.

REV8.1 supports all 12.

No particular card is required.
The requirement is:
**whatever card the Player selected must be demonstrated once.**

## 4. Scale

Target:
`1152×832`

Local:
- X `-576..+576`
- Y `0..-832`

Scale rhythm:
- 1-1 `1280×1024`
- 1-2 `1664×960`
- 1-3 `3840×1152`
- 1-4 `1152×832`

1-4 remains the compact decompression pocket after the huge 1-3 Annex.

The extra size over the old 768×640 is used for:
- safe chooser chamber
- Universal Calibration Frame
- visible separation between residual Security and test space

Not for a longer Rope course.

## 5. Spatial Signature

`COMPACT ADAPTIVE CALIBRATION LAB`

Flow:

`RIGHT SECURITY VESTIBULE`
→ `STATIC SERVICE BAFFLE`
→ `SAFE NODE CHAMBER`
→ `UNIVERSAL CALIBRATION FRAME`
→ `UPPER-LEFT EXIT`

This is a room/lab,
not a vertical shaft.

## 6. Entry / residual pressure

Entry:
`(+224,-32)`

P0:
- center `(+256,0)`
- W512

Vestibule Deck:
- center `(+320,-160)`
- W320

Node Approach Guard:
- target `(+432,-160)`
- exactly one 1-4 enemy slot
- residual pressure from 1-3
- NO kill prerequisite
- cannot shoot into Node Chamber after authored threshold

## 7. Static Service Baffle

Target:
- center `(+96,-288)`
- W64
- H256
- floor-standing from Vestibule/threshold architecture

Properties:
- STATIC
- SOLID
- NON-GRAPPLEABLE
- NON-DAMAGING
- LOS BLOCKER
- no motion

Purpose:
- physical safety threshold
- blocks Guard LOS/projectiles into chooser area
- reduces Security audio
- makes the Node safe by architecture, not invulnerability

Not a puzzle.
Not a moving wall.

## 8. Node Chamber

Node Deck:
- center `(-96,-288)`
- W448
- H32
- safe-deck

Maintenance Node:
- source ID `sector-01-04:maintenance-node`
- center `(-96,-288)`
- interaction radius 80

The Node is the visual center.

No enemy inside the chamber.

## 9. Objective contract — REV8.1

Current:
`augment-selected`
→ Exit panel available

REV8.1:
`augment-selected`
→ `calibration-profile-loaded`
→ selected-card effect successfully demonstrated
→ `augment-calibrated`
→ Exit panel available

### New objective
`sector-01-04:augment-calibrated`

Exit panel requires:
- `sector-01-04:augment-selected`
- `sector-01-04:augment-calibrated`

The actual completion authority should be the calibration runtime,
not Presentation/UI.

## 10. Universal Calibration Frame

Calibration Floor:
- center `(+32,-512)`
- W704
- H32

The frame is one static industrial rig.

It contains dormant instruments:
- FAR SENSOR / ANCHOR receiver
- dual reload sensors
- release speed gate
- neutral calibration receiver
- action line sensor
- nonlethal pulse emitter
- displacement puck rail
- slow-fall scan field

Only the profile relevant to the selected card becomes active/readable.

The room geometry does NOT transform per card.

This is important for multiplayer:
different Players may select different cards in the same shared world.

## 11. Calibration profiles — design principle

A profile must prove:
1. Player has the selected card.
2. Player actually triggers that card's canonical effect.
3. The effect succeeds in a low-pressure instrumented task.

Do not complete merely because the card exists in inventory.

Do not require combat kills.

Do not damage/modify the Augment itself to make the test work.

## 12. Rope card micro-tests

### fast-launch
Effect:
Hook speed 1200 → 1800px/s.

Test:
- Player stands on launch plate.
- Sensor target ~390px away becomes valid for ~0.28s.
- successful Hook attach inside the window passes.

Intent:
base 1200 speed should miss the time window;
fast-launch should make it comfortably.

Tuning is PLAYTEST REQUIRED.
Never turn this into frame-perfect timing.

### long-rope
Effect:
Hook Reach 400 → 480px.

Test:
- calibration start plate
- target ~440–455px away
- attach target once

Base 400 cannot reach.
Long Rope can.

### fast-recover
Effect:
Rope reload 0.50 → 0.25s.

Test:
- attach Sensor A
- normal release/cancel
- Sensor B opens in a window reachable only with fast reload
- attach Sensor B

Window target:
broad enough for 0.25s,
closed before normal 0.50s reload can recover.

### release-propulsion
Effect:
normal Rope release multiplies total velocity ×1.25.

Test:
- attach marked tether
- normal release inside frame
- cross downstream speed gate within calibrated window

Calibration should read canonical release-propulsion activation plus gate crossing,
not velocity alone.

### electrified-rope
Effect:
attached Rope contact emits periodic augment impact.

Test:
- attach to test anchor
- sweep/hold Rope across neutral Calibration Receiver
- detect one valid electrified-rope pulse

Receiver is non-hostile and does not need to die.

### collision-explosion
Effect:
valid high-speed Rope-body collision triggers explosion.

Test:
- build safe swing speed
- collide with neutral impact receiver
- detect one `collision-explosion` activation/impact

No HP kill requirement.

## 13. Base Action micro-tests

### direction-dash
- dash across instrumented line/gate
- validate actionId `direction-dash`
- pass on safe destination

### dash-strike
- use Dash Strike into neutral strike receiver
- validate canonical action activation + receiver contact

### instant-guard
- calibration emitter announces a nonlethal pulse
- Player uses Instant Guard
- pass when the pulse is blocked by the actual guard effect

Pulse must be nonlethal by Calibration rules.
Do not risk killing a 1 HP Player.

### push-away
- activate Push Away near calibration puck/receiver
- pass when the canonical action causes required displacement / receiver event

### straight-shot
- fire through a marked line into remote receiver
- pass on canonical straight-shot receiver hit

### slow-fall
- step/fall into vertical scan field
- activate Slow Fall
- remain in slow-fall state through the minimum scan duration
- landing ends test safely

## 14. Failure handling

Calibration failure:
- no death
- no card reroll
- no source re-consumption
- no Stage reset

Instrument resets in:
`~1–2s`

Player can immediately retry.

For Instant Guard profile:
- missed pulse must be nonlethal / calibration-safe
- instrument resets automatically

## 15. Multiplayer contract

Each Player may have a different selected card.

Therefore:
- calibration profile is Player-local in activation/readability
- instruments are shared geometry but validation is Player-specific
- no world geometry swap
- one Player's pass does not falsely calibrate another Player

Shared route completion:
- `augment-calibrated` shared objective completes when the current required Player set has individually passed
- leaving Player is removed from the current requirement set to avoid deadlock
- if Gate already opened, late join does NOT relock route
- late join may still consume Node / run its personal calibration if current Augment topology allows

This should mirror the existing source-consumption/shared-objective philosophy rather than invent a conflicting ownership model.

## 16. Story / Presentation

### S0 Entry — VERIFIED
`GRAPPLE DEVICE / DETECTED`

No Bark.

### S1 Safe Threshold
No Toast.

Guard LOS/audio disappears behind Service Baffle.

### S2 Node Scan — VERIFIED
1. `GRAPPLE TELEMETRY / ANALYZED`
2. `SAFETY LIMIT OVERRIDE / AVAILABLE`

### S3 Choice
Generic compatible 3-card chooser.

No Story Toast layered over chooser.

### S4 Selected — VERIFIED current response
1. `AUGMENT PROTOCOL / ACCEPTED`
2. `[SELECTED CARD NAME] / ONLINE`

### S5 Calibration Load — NEW
`CALIBRATION PROFILE / LOADED`

Optional detail:
selected card family/name can be shown in Calibration HUD,
but do not repeat long card description.

Status:
`NOT IMPLEMENTED`

### S6 Calibration Success — NEW
`CALIBRATION / VERIFIED`

Then Player Bark:
`…이건 쓸 수 있겠네.`

Bark status:
`NOT IMPLEMENTED — PLAYER BARK LAYER`

This Bark now has gameplay evidence.

### S7 Exit
No triumph text required.

Audio handoff to 1-5:
distant live Test Bay machinery.

## 17. Psychology

Start:
- Fear ~69
- Control ~43
- Understanding ~30

Node choice:
- Fear ~46
- Control ~47
- Understanding ~34

Calibration success:
- Fear ~46
- Control ~55
- Understanding ~39

Exit:
- Fear ~48
- Control ~55
- Understanding ~39

Arc:
`TENSION DROP → CURIOSITY → CHOICE → EXPERIMENT → PRACTICAL CONFIDENCE`

## 18. Camera

C01 Vestibule:
- `0..-192`
- Entry + Guard + Baffle
- desktop ~1.10

C02 Node:
- `-192..-384`
- Node + Player
- ~1.12

C03 Calibration:
- `-384..-672`
- Universal Frame + currently active instrument
- ~0.95–1.00

C04 Exit:
- `-672..-832`
- upper-left Exit
- ~1.12

No cinematic pan.

## 19. Pacing

Movement + interaction without card reading:
`~0:45–1:05`

First play including reading + first calibration:
`~1:10–1:50`

Mastered:
`~0:40–1:00`

No forced chooser timer.

Calibration micro-test target:
`~5–15s` once profile is understood.

REDESIGN if:
- any profile routinely takes >20s after understanding
- any profile is frame-perfect
- player can pass without actually activating selected card
- Guard can threaten chooser/calibration
- card choice becomes a disguised mandatory single-card selection
- geometry changes based on one Player and breaks multiplayer

## 20. MAP SCALE gate

1-3:
`3840×1152`

1-4:
`1152×832`

PASS.

Strong compression remains.
Extra width/height over old 768×640 is used by safe choice + universal test.

## 21. MAP SIMILARITY gate

1-3:
- huge T spine + annex
- combat/LOS
- carrier

1-4:
- compact lab
- static room bands
- stop / choose / prove
- no Rope course

PASS.

## 22. OBSTACLE FUNCTION gate

Primary:
`SELECTED-CARD PROOF / SAFE CALIBRATION`

This is different from:
- 1-1 affordance
- 1-2 blocking mass
- 1-3 LOS/access pressure

PASS.

## 23. CURRENT RUNTIME gate

### VERIFIED / KEEP
- augment-node source
- generic 3-card offer Runtime
- source/player persistence
- chooser world-continuation behavior
- 1 enemy slot budget
- Story entry/node scan/current selection confirmation
- calibration dummy concept
- four camera phases concept

### CHANGE REQUIRED
- bounds 768×640 → 1152×832
- room-like blockout
- Guard to isolated Vestibule
- static Service Baffle
- Universal Calibration Frame
- new `augment-calibrated` objective
- Exit requires calibration
- per-card validation adapter for 12 first-node candidates
- new Calibration loaded / verified presentation
- player-local calibration ownership
- multiplayer shared completion aggregation

Status:
`MAJOR BLOCKOUT + NEW CALIBRATION RUNTIME CONTRACT`
