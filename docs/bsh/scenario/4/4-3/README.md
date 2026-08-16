# SECTOR 04-3 — FREIGHT BYPASS

*BLOCKOUT CANDIDATE · REV 1.2 — WIND STRENGTH RECLASSIFIED / 4-1 DRIFT FALSE ALARM RESOLVED*

◀ PREV — [SECTOR 04-2 / CUTTER LINE](../4-2/README.md) · NEXT — [SECTOR 04-4 / INFRASTRUCTURE SERVICE NODE](../4-4/README.md) ▶

`SECTOR 04 TRANSIT / INFRASTRUCTURE` · `STAGE 03` · `CUTTER + TRANSIT WAKE` · `MOMENTUM UNDER INTERRUPTION`

| 항목 | 기준 |
|---|---|
| Status | HYPOTHESIS — BLOCKOUT CANDIDATE |
| Difficulty | ★★★ |
| Expected First Playtime | 150–210 sec |
| Expected Skilled Clear | 60–90 sec |
| Enemy | Cutter Sentry T1 ×1 — STATIONARY |
| Cutter Fire | ACTIVE — current `canCutRope` capability |
| Transit Wake | Pulsed Wind ×1 — first Sector 04 reuse |
| Patrol | NONE |
| Scanner | NONE |
| Moving Platform / Train Collision | NONE |
| New Player Input | NONE |
| New Rope Mode | NONE |
| Foundation | CURRENT RUNTIME — 1 selected Foundation carried |
| First Specialization | DESIGN ASSUMPTION ONLY — runtime not found / not required |
| New Growth | NONE |
| Legacy Artifact Layer | REMOVED FROM CURRENT RUNTIME |
| Required Kill | NONE |
| Design Checkpoint / Reward | NONE |
| Boss | NONE |
| Primary Role | Cutter와 Pulsed Wake를 처음 한 이동 판단 안에서 결합 |
| Primary Space | Freight Pressure Bypass / Express Service Corridor |
| Exit | Reach Final Deck → Gate Panel → Gate Open → Physical Crossing |
| Runtime Status | Sector 04 standalone catalog AUTHORED & VALIDATED (4-1~4-8) — 메인 월드 NOT CONNECTED |
| Approved Gameplay Art | HOLD until Runtime Area / Camera Zone / Stable IDs exist |

---

## 0. 기획 기준

### LOCKED FOR THIS STAGE

4-3은 4-2에서 배운:

```text
CUTTER TELEGRAPH
→
RELEASE / LINE CHANGE
or
CUT → RECOVER
```

에 기존 Wind Physics를:

```text
TRANSIT WAKE
```

로 재컨텍스트화해 처음 결합한다.

### Core Question

> **“Wake가 밀고 Cutter가 조준하는 동안, 기다리지 않고 Rope Flow를 이어갈 수 있는가?”**

### 가장 중요한 원칙

4-3은:

```text
LULL까지 기다리는 Wind Puzzle
```

이 아니다.

다음 모두 유효해야 한다.

```text
LULL
→ safest / slowest

WARNING
→ prepare release / attach

ACTIVE
→ fastest but harder line control

DECAY
→ forgiving moving window
```

### 금지

- Wind LULL만 정답
- Cutter + Patrol 동시 사용
- Moving Platform
- Scanner
- Security Shutter
- New Input
- New Rope Mode
- New Growth
- Kill Gate
- Damage Wind
- Wind Shadow(현재 구현됨, §0-1 참고)를 Mandatory Route 성립 조건으로 설계
- Grounded Wind Attenuation(현재 구현됨, §0-1 참고)를 Mandatory Route 성립 조건으로 설계
- Lower Feeder Isolation Reveal

---

## 0-1. 최신 GitHub / Runtime 교차검증

### VERIFIED — CURRENT MAIN AT AUTHORING

최신 `main`:

```text
cb38a2c7fd5246f163cad633a9fde8c2f90f630b
```

최신 HEAD의 Art 변경은 이 Stage Runtime 계약에 영향이 없다.

직전 Runtime 변경에서 Rope attachment가:

```text
instant candidate attach
```

가 아니라:

```text
visible deterministic Hook flight
```

로 바뀌었다.

### VERIFIED — CURRENT ROPE / HOOK

Current `ROPE_CONFIG`:

```text
Hook Speed                 1400 px/s
Hook Flight Ratio          2 / 7 sec
Derived Hook Reach         400 px
Hook Reload                0.20 sec
Attach Buffer              0.10 sec
Swing Drag Min Hold        0.08 sec
Swing Impulse              780
Release Angular Transfer   0.55
```

중요:

```text
400 px
```

는 독립 `maxAttachDistance` 상수가 아니라:

```text
1400 × 2/7
```

에서 파생된다.

Sector 04 모든 신규 geometry는:

```text
MANDATORY / FLOW ATTACH
< 400 px
```

를 기준으로 한다.

### VERIFIED — CURRENT COMBAT

```text
Enemy Health              100
Enemy Attack Range        760
Acquire                   0.25 sec
Track                     0.80 sec
Lock                      0.20 sec
Fire Flash                0.08 sec
Enemy Fire Interval       1.00 sec
Enemy Projectile Speed    520
Enemy Projectile Radius   7
Enemy Projectile Damage   20
Rope Disabled On Cut      0.60 sec
```

4-2 초안 작성 당시의:

```text
Range 520
Fire Interval 1.40
Projectile Speed 260
```

은 현재 코드보다 오래된 값이다.

### VERIFIED — CURRENT CUTTER

Enemy projectile:

```text
canCutRope
=
!rules.includes("no-rope-cut")
```

현재도 유지.

Projectile은 Rope를 직접 조준하지 않고
Player target direction으로 발사된다.

### VERIFIED — CURRENT WIND

Pulsed Wind phase:

```text
LULL
→ WARNING
→ ACTIVE
→ DECAY
```

Force multiplier:

```text
LULL     0
WARNING  0
ACTIVE   1
DECAY    1 → 0 linear
```

Point가 static rectangular zone 안에 있을 때만 적용.

### RUNTIME UPDATE — WIND SHADOW / GROUNDED ATTENUATION 구현됨

4-3 최초 작성 이후 병합된 Runtime 변경(`WorldForceField.js`, `GameSimulation.js`)에서
다음이 실제로 구현되고 **기본 활성화**됐다.

```text
WIND_CONFIG (config.js)
groundedFactor  0.35
shadowFactor    0.15
defaultFalloff  0
```

```text
GROUNDED ATTENUATION
player.physics.isGrounded === true
→ wind force × 0.35

WIND SHADOW
windOrigin(zone)와 player point 사이 segment가
solid occluding surface(기본: collision !== false && oneWay !== true)와 교차
→ wind force × 0.15 (추가 배율)
```

이 Stage 초안의 §0 금지 목록과 §22 FAIL 목록에 있는
"Wind Shadow 가정" / "Grounded Wind Attenuation 가정" 문구는
**작성 당시(두 기능이 아직 없던 시점) 기준**이며 이제 STALE이다.
아래 §0 / §22 해당 항목을 참고.

여전히 없음:

```text
moving force volume
train-following force volume
```

Falloff는 `defaultFalloff: 0`이므로 Zone이 명시적으로 `falloff` 값을 지정하지 않는 한
spatial falloff는 비활성 상태로 남는다.

### TRANSIT WAKE BASELINE

4-3은 first combination이므로
Sector 01-6의 기존 pulsed Cycle을 그대로 재사용하는 후보로 시작한다.

```text
Lull     1.75 sec
Warning  0.70 sec
Active   1.40 sec
Decay    0.30 sec
```

이 Cycle 값은 Sector01 Pulsed Wind precedent(1-6/1-7/1-8)와 정확히 일치하는
**VERIFIED PRECEDENT**다.

```text
Strength 360
```

는 다르다. Sector01 실제 pulsed tuning(`Sector01AreaCatalog.js`)은 500~800이며
360은 Sector01에서 재사용한 값이 아니라 **Sector 04 고유 hypothesis**였다.
다만 이 값은 실제 shipped `Sector04AreaCatalog.js`의 4-3 `windZones`(`freight-wake`)에
그대로 구현·검증돼 현재 Sector 04의 CURRENT RUNTIME 값이다.

4-3에서 새 물리 튜닝값을 동시에 발명하지 않는다.

---

## 0-2. URGENT PREVIOUS-DOC DRIFT

최신 Rope 변경으로 이전 Sector 04 문서 일부가 stale해졌다.

### 4-1 Drift — FALSE ALARM (RESOLVED)

4-1의 Flow Route에는:

```text
A3 → A4
408.9 px
```

가 있고, 이는 Rope Max 400px을 실제로 초과한다(4-1 §10, "400px보다 작다"였던
오기는 수정됨).

하지만 이것이 **RUNTIME INVALID**를 의미하지 않는다. 4-1의 **Mandatory Safe
Route**는 같은 구간을 `A3 → M1 → A4`로 우회하며(4-1 §9, 각 222.3px / 186.6px),
전체 Safe Route max는 `374.5px`로 400px 이내다. Flow Route는 4-1 문서 자체가
`OPTIONAL EXPRESSION`으로 명시한 skilled-only 지름길이라, A3 → A4 직결이
막혀 있어도 Mandatory 진행에는 영향이 없다. 실제 shipped
`Sector04AreaCatalog.js`도 A4 `(-64, -800)` 그대로 구현·검증돼 있으므로
좌표 수정은 필요하지 않았다.

### 4-2 Drift — RESOLVED

4-2 geometry max:

```text
385.3 px
```

로 새 400 Reach 안에 남는다(margin 14.7px, graybox 우선 재검증 대상으로 4-2 문서에 명시됨).

Enemy Attack Range / Fire Interval / Projectile Speed / Artifact wording / Hook flight / reload contract는
4-2 REV 1.2 패치로 이미 GitHub `main`에 반영됐다.

4-1도 위 "4-1 Drift — FALSE ALARM (RESOLVED)" 참고.

### 4-3 Policy

본 Stage부터는:

```text
400 px derived Hook Reach
Hook Flight
0.20 sec Reload
current Combat Config
Foundation Runtime
Artifact Removed
```

를 기준으로 작성한다.

---

## 0-3. Foundation Runtime 교차검증

### VERIFIED — Foundation Implemented

Current Foundation catalog:

```text
IMPULSE COIL
RELAY LINK
SHEAR CURRENT
```

실제 Runtime 효과 존재.

### IMPULSE COIL

정상 Swing Drag가 trigger된 뒤 Release 시:

```text
+180 Release Impulse
```

### RELAY LINK

정상 Rope Release 후:

```text
Window       0.65 sec
AttachBuffer 0.16 sec
AimTolerance 108
```

### IMPORTANT — CUT ≠ RELEASE

Relay Window은:

```text
onRopeReleased()
```

에서 열린다.

Cutter가 Rope를 잘랐다고 자동으로:

```text
Relay recovery window
```

가 새로 생성된다고 가정하지 않는다.

즉 4-3에서 Relay의 장점은:

```text
정상 Release → 다음 Hook chain
```

에 있다.

### SHEAR CURRENT

Release 순간 Rope segment가 Enemy를 가로지르면:

```text
20 Damage
```

현재 Enemy Health:

```text
100
```

이므로 Shear 한 번이 Cutter Sentry를 즉시 제거하지 않는다.

Kill Optional 유지.

### First Specialization

Current source search에서 별도 first-Specialization Runtime은 확인되지 않는다.

따라서 4-3 Mandatory Geometry는:

```text
Foundation 없어도 통과 가능
```

해야 하고,

Foundation은:

```text
expression / efficiency
```

만 제공한다.

---

## 1. 한 줄 정의

4-2 Cutter Line을 통과한 Player가 Freight Pressure Bypass에 진입해,
P1 Safe Preview에서 Pulsed Transit Wake의 `LULL → WARNING → ACTIVE → DECAY`를 먼저 읽고,
W1에서 Wind만 경험한 뒤 W2/W3의 동일 Pressure Corridor 안에서 Stationary Cutter Sentry의 조준을 받으며,
LULL을 기다리면 안전하게 진행할 수 있지만 ACTIVE Wake를 타면 Cutter activation 체류 시간을 줄이고 더 빠른 Rope Flow를 만들 수 있는 대신 Release timing과 Hook flight를 더 정확히 관리해야 하며,
Combined Zone을 벗어난 뒤 Threat 없는 Upper Freight Frame에서 Momentum을 정리하고 4-4 Service Node로 향하는 첫 Cutter+Wake Synthesis Stage.

---

## 2. 전체 게임에서의 역할

### 2-1. First System Combination of Sector 04

4-1:

```text
PURE MOMENTUM
```

4-2:

```text
CUTTER INTERRUPTION
```

4-3:

```text
MOMENTUM
+
CUTTER
+
WAKE
```

첫 결합.

### 2-2. Waiting vs Moving

Player에게 두 가지 유효 전략을 준다.

#### Conservative

```text
LULL / WARNING 읽기
→ 들어가기
→ Cutter line 대응
```

#### Expressive

```text
ACTIVE / DECAY 진입
→ Wake를 속도에 사용
→ Cutter exposure 압축
→ early release / fast next Hook
```

둘 다 정답.

### 2-3. 4-4 Rest Setup

4-3은 첫 Combined Challenge이므로
끝난 직후 4-4:

```text
INFRASTRUCTURE SERVICE NODE
REST
```

로 압력을 내려준다.

---

## 3. Story 역할

4-3의 Story는 Infrastructure 상태를 한 단계만 추가한다.

### Entry

```text
FREIGHT BYPASS

PRESSURE SERVICE
CYCLING
```

### Combined Zone

```text
TRANSIT PRESSURE

AUTOMATED CONTROL
ACTIVE
```

### Exit

```text
FREIGHT SERVICE ROUTE

LIMITED OPERATION
```

### Meaning

확인:

```text
Freight / pressure service가
완전히 죽지 않았다.
```

아직 미확인:

```text
Lower Ascent Feeder Isolation
Upper / Lower comparison
Group mapping
Corporate decision
```

4-4가 첫 Lower Feeder 이상징후를 소유한다.

---

## 4. 공간 콘셉트

### FREIGHT PRESSURE BYPASS

큰 Freight Bypass Corridor의 한 구간이
Transit pressure discharge zone과 겹친다.

### Visual Shape

```text
SAFE MAINTENANCE LIP
→
PRESSURE CORRIDOR
→
CUTTER CROSS-LINE
→
FREIGHT EXIT FRAME
```

### Architecture

- freight rail truss
- pressure relief duct
- cross-braced conduit
- maintenance bypass lip
- protected Sentry mount
- upper freight inspection frame

### No Moving Train

배경에서 Freight movement cue는 가능하지만
Gameplay collision / grapple surface는 전부 static.

---

## 5. Pixel / Grid 기준

### Base

```text
32×32
```

### Map Hypothesis

```text
WIDTH  1472 px
X      -736 ~ +736

HEIGHT 1472 px
Y      0 ~ -1472
```

### Gameplay Targets

현재 Grapple Target family를 따름.

### Hook Reach Readability

이제 Hook이 실제로 비행하므로
Anchor 사이의 시각적 거리도:

```text
< 400 px
```

임이 화면에서 납득돼야 한다.

Anchor가 멀리 보여도 실제 후보는 400 내에 있어야 함.

---

## 6. 전체 맵 구조

```text
Y = 0

P0 ENTRY
  \
   A0
    \
    P1 SAFE PREVIEW
        \
         W1  ← WAKE ONLY
          \
           R1 SAFE RECOVERY
              \
               W2 ← WAKE + CUTTER
                \
                 W3 ← WAKE + CUTTER
                   \
                    P2 SAFE EXIT
                      \
                       A4
                       R2
                      /
                    A5
                   /
                 A6
                /
              P4 FINAL DECK
              PANEL / GATE

Y = -1472
```

### Decision Shape

3-8처럼 좌/중/우 Route 선택이 아니다.

4-3은:

```text
ONE CORRIDOR
+
WHEN TO ENTER
+
HOW LONG TO STAY ATTACHED
```

판단.

---

## 7. Zone 구성

### Z0 — Freight Entry

```text
P0 → A0 → P1
```

Threat 없음.

### Z1 — Wake Preview

```text
P1 → W1
```

W1은 Transit Wake 안이지만
Sentry activation 밖.

Player는:

```text
Wind state
```

만 먼저 경험.

### Z2 — Safe Recovery Lip

```text
R1
```

Wake Zone 밖.
Sentry Activation 밖.

Player가 W1에서 밀려도 회수.

### Z3 — Combined Commit

```text
R1 → W2 → W3 → P2
```

W2 / W3:

```text
Wake ACTIVE POSSIBLE
+
Cutter Sentry ACTIVE
```

같은 구간.

### Z4 — Upper Decompression

```text
P2 → A4 → R2 → A5 → A6 → P4
```

Wake 없음.
Sentry activation 없음.

4-4 Rest 전 짧은 정상 Rope Flow.

---

## 8. 좌표 / 오브젝트

전부:

```text
HYPOTHESIS — BLOCKOUT
```

### 8-1. Landing / Recovery

| ID | Center | Size | Role |
|---|---:|---:|---|
| P0 | `(-560, 0)` | `320×32` | Entry |
| P1 | `(-336, -224)` | `288×32` | Safe Wake Preview |
| R1 | `(-240, -640)` | `256×24` | Combined-zone Recovery |
| P2 | `(+320, -864)` | `288×32` | Safe Cutter/Wake Exit |
| R2 | `(+64, -1088)` | `224×16` | Upper Recovery |
| P4 | `(-288, -1376)` | `416×32` | Final Safe Deck |

### 8-2. Grapple Targets

| ID | Position | Role |
|---|---:|---|
| A0 | `(-432, -128)` | Entry Warm-up |
| W1 | `(-176, -384)` | Wake-only Anchor |
| W2 | `(+96, -544)` | Combined Anchor 1 |
| W3 | `(+256, -736)` | Combined Anchor 2 |
| A4 | `(+96, -992)` | Exit Flow Anchor |
| A5 | `(-160, -1184)` | Upper Relay Anchor |
| A6 | `(-320, -1312)` | Final Anchor |

### 8-3. Cutter Sentry

```text
S1
(+448, -640)
```

Stationary `sentry-t1`.

### 8-4. Sentry Activation — HYPOTHESIS

```text
X -128 ~ +576
Y -832 ~ -352
```

Membership:

```text
P1 OUT
W1 OUT
R1 OUT
W2 IN
W3 IN
P2 OUT
A4 OUT
```

### 8-5. Transit Wake Zone

```text
ID
sector-04-03:freight-wake

Bounds
X -208 ~ +352
Y -832 ~ -288

Direction
(+1, 0)

Mode
pulsed

Strength
360

Cycle
LULL    1.75
WARNING 0.70
ACTIVE  1.40
DECAY   0.30
```

### Why +X

Lower corridor 진행 방향과 대체로 같은 방향.

ACTIVE Wake는:

```text
free shortcut
```

이 아니라:

```text
more speed
+
less Cutter exposure time
+
more release-control demand
```

을 만든다.

### 8-6. Gate

```text
P4 Final Deck
Panel (-208, -1376)
Gate  (-80, -1376)
```

Threat 완전 밖.

---

## 9. Safe Route

### Route

```text
P0
→ A0
→ P1
→ W1
→ R1
→ W2
→ W3
→ P2
→ A4
→ R2
→ A5
→ A6
→ P4
```

### Distance Pre-check

| Link | Distance |
|---|---:|
| P0 → A0 | `181.0 px` |
| A0 → P1 | `135.8 px` |
| P1 → W1 | `226.3 px` |
| W1 → R1 | `263.9 px` |
| R1 → W2 | `349.4 px` |
| W2 → W3 | `249.9 px` |
| W3 → P2 | `143.1 px` |
| P2 → A4 | `258.0 px` |
| A4 → R2 | `101.2 px` |
| R2 → A5 | `243.7 px` |
| A5 → A6 | `204.9 px` |
| A6 → P4 | `71.6 px` |

### Result

```text
MAX SAFE LINK
= 349.4 px

CURRENT DERIVED HOOK REACH
= 400 px

MARGIN
= 50.6 px
```

### Safe Route Wind Contract

Safe Route는:

```text
LULL
WARNING
ACTIVE
DECAY
```

어느 상태에서도 **생존 가능한 진행**이어야 한다.

다만 ACTIVE에서 동일한 landing precision을
강제하지는 않는다.

R1 / P2가 recovery를 제공.

### `swingImpulse = 0`

Mandatory Safe Route는
Runtime graybox에서:

```text
swingImpulse = 0
```

검증 필요.

Wind가 있어도 Impulse bonus가 Mandatory key가 되면 FAIL.

---

## 10. Flow Route

### Route

```text
P0
→ A0
→ P1
→ W1
→ W2
→ W3
→ A4
→ A5
→ A6
→ P4
```

R1 / P2 / R2 대부분 생략.

### Distances

| Link | Distance |
|---|---:|
| P1 → W1 | `226.3 px` |
| W1 → W2 | `315.6 px` |
| W2 → W3 | `249.9 px` |
| W3 → A4 | `301.9 px` |
| A4 → A5 | `320.0 px` |
| A5 → A6 | `204.9 px` |

### Result

```text
MAX FLOW LINK
= 320.0 px
```

Hook flight를 고려해도
400 한계에 붙는 Aim Test가 아니다.

### Skilled Window

ACTIVE / DECAY Wake를 이용하면:

```text
W1
→ W2
→ W3
```

체류 시간을 줄일 수 있다.

하지만 Hook Reload `0.20 sec`와
실제 Hook Flight Time이 존재하므로:

```text
instant re-attach fantasy
```

를 가정하지 않는다.

---

## 11. Build Expression

### Current Runtime Baseline

```text
FOUNDATION
= IMPLEMENTED
```

첫 Specialization은 Mandatory 가정에서 제외.

### IMPULSE COIL

현재 실제:

```text
valid swing drag
→ normal release
→ +180 impulse
```

4-3에서는:

- W1 → W2 active wake entry
- W2 → W3 exposure compression
- W3 → A4 exit speed

에 유리.

### RELAY LINK

현재 실제:

```text
normal release
→ 0.65 sec Relay Window
→ 0.16 sec Attach Buffer
→ 108 Aim Tolerance
```

W1 → W2 → W3 chain에서 유리.

중요:

```text
CUTTER CUT
≠
RELAY WINDOW CREATION
```

따라서 Cut Recovery 전용 특성처럼 설명하지 않는다.

### SHEAR CURRENT

W2 / W3에서 Rope segment가 S1을 가로지르는 경우
Release로:

```text
20 damage
```

기회.

Enemy Health 100이라
Kill Skip Key가 아니다.

### Mandatory Contract

세 Foundation 모두:

```text
same mandatory geometry
```

통과 가능.

No Foundation 상태도 geometry test 가능해야 한다.

---

## 12. Recovery

### R1

```text
Wake OUT
Sentry Activation OUT
```

첫 안전 Recovery.

### P2

```text
Wake OUT by Y
Sentry Activation OUT by Y
```

Combined Zone 종료 Deck.

### Cutter Cut Recovery

Current:

```text
Rope Cut
→ Rope Disabled 0.60 sec
→ launcher flight cannot immediately restart
```

R1 / P2는 해당 free-fall을 흡수.

### Hook Flight After Disable

0.60초가 끝나도 Rope가 즉시 붙는 것이 아니다.

다음 Attach는:

```text
Hook launch
→ flight
→ hit
```

과정을 거친다.

따라서 recovery target:

```text
Cut event
→ stable landing ≤ 2.0 sec
→ next successful attach ≤ 3.0 sec target
```

### Full Reset

한 Cut / Wake overshoot로 P0 reset 금지.

---

## 13. Enemy / Hazard

### Cutter Sentry

```text
S1 ×1
Stationary
```

### Patrol

```text
NONE
```

4-3은 조합 대상이:

```text
Cutter
+
Wake
```

두 개뿐.

### Current Attack Baseline

```text
Acquire 0.25
Track   0.80
Lock    0.20
Fire
Cooldown / Fire Interval 1.00
Projectile Speed 520
```

4-2보다 현재 Projectile이 빠르므로
4-3은 off-screen reaction을 절대 허용하지 않는다.

### Cutter Rule

현재 production code 기준:

```text
no-rope-cut
```

를 넣지 않으면 Rope Cut enabled.

Stage data에는:

```text
CUTTER INTENT
```

를 명시하되,
미구현 positive rule을 실제 capability처럼 쓰지 않는다.

### Wind

Damage:

```text
NONE
```

Knockback event가 아니라
continuous world force.

---

## 14. Camera

모든 값 HYPOTHESIS.

### C0 — Entry / Wake Read

```text
P0 / A0 / P1 / W1
Desktop ~0.95
Mobile  ~0.72
```

### C1 — Combined Freight Line

```text
W1 / R1 / W2 / S1
Desktop ~0.88
Mobile  ~0.70
```

필수:

- Sentry visible
- Wake warning visible
- R1 visible

### C2 — Cutter Exit

```text
W2 / W3 / P2 / S1
Desktop ~0.90
Mobile  ~0.70
```

Projectile Speed 520이므로
Fire 후 처음 보는 상황 금지.

### C3 — Upper Decompression

```text
P2 / A4 / R2 / A5
Desktop ~0.95
Mobile  ~0.72
```

### C4 — Gate

```text
A6 / P4 / Panel / Gate
Desktop 1.00
Mobile  0.72
```

---

## 15. Story Trigger

### S0 — Entry

```text
FREIGHT BYPASS

PRESSURE SERVICE
CYCLING
```

### S1 — Combined Zone

```text
TRANSIT PRESSURE

AUTOMATED CONTROL
ACTIVE
```

### S2 — Exit

```text
FREIGHT SERVICE ROUTE

LIMITED OPERATION
```

### Presentation

짧은 infrastructure status만 사용.

Rope / Cutter / Wake를 읽는 동안
긴 문장 표시 금지.

---

## 16. Pixel Art Asset Spec

### Transit Wake Source

실제 Gameplay source는 static wind zone.

Visual source 후보:

- pressure relief vent
- freight piston exhaust
- express conduit pressure grille

### Cutter Sentry

4-2에서 정립한 Cutter visual family 그대로 reuse.

새 Variant 아님.

### Wake Cue

#### LULL

low motion.

#### WARNING

- amber pressure lamps
- cable vibration increase
- dust direction preview

#### ACTIVE

- strong horizontal particles
- cloth/scarf response
- vent glow

#### DECAY

particles taper.

### No Damage-Laser Confusion

Cutter와 Wake cue 색/형태 분리.

---

## 17. Background

### Freight Identity

- large bypass rail silhouette
- cargo support truss
- pressure duct
- distant freight signal
- static cargo cradle

### Background Motion

- distant passing light
- cargo indicator sequence
- vent rotation

허용.

### Gameplay Motion

```text
NONE
```

Moving Train collision 없음.

---

## 18. Sound / VFX

### Wake

```text
LULL
low duct hum

WARNING
pressure rising tone

ACTIVE
wide rush / freight roar

DECAY
fast taper
```

### Cutter

4-2 family reuse:

```text
scan
→ whine
→ lock
→ slice
```

### Combined Mix

WARNING tone이 Cutter Lock tone을 덮으면 FAIL.

두 신호:

```text
WAKE = broad environmental sound
CUTTER = narrow directional security sound
```

으로 분리.

### Hook Flight

현재 visible Hook flight가 추가됐으므로
Wake particle 속에서도 Hook head / rope line이 읽혀야 한다.

---

## 19. Implementation Notes

### Runtime Prefix

```text
sector-04-03:*
```

### Wind Zone Concept

```js
{
    id: "sector-04-03:freight-wake",
    bounds: triggerBounds(-208, -832, 560, 544),
    direction: { x: 1, y: 0 },
    mode: "pulsed",
    strength: 360,
    cycle: {
        lull: 1.75,
        warning: 0.70,
        active: 1.40,
        decay: 0.30
    }
}
```

### Cutter Sentry Concept

```js
worldObject(
    "sector-04-03:cutter-sentry-01",
    "sentry",
    448,
    -640,
    {
        enemyType: "sentry-t1",
        activation: triggerBounds(-128, -832, 704, 480),
        rules: [
            "target-lock-cycle",
            "activation-band-only"
        ]
    }
)
```

현재 Runtime에서 `no-rope-cut`가 없으므로 Cutter capable.

### Important

현재 Range가 760이라
Safe Zone 보장은 거리보다:

```text
activation bounds
```

에 의존한다.

### Gate

```text
reach P4
→ Panel interact
→ Gate open
→ physical crossing
```

Threat 밖.

---

## 20. Playtest Metrics

### Wake

```text
first phase entered
LULL entries
WARNING entries
ACTIVE entries
DECAY entries
```

### Cutter

```text
shots
ropeCuts
bodyHits
```

### Combined

```text
time inside Sentry activation
ropeCuts during ACTIVE
ropeCuts during LULL/WARNING
successful ACTIVE clear
waited full cycle count
```

### Recovery

```text
cut → landing
cut → next successful attach
wake overshoot → recovery
```

### Foundation

#### Impulse

activation exposure duration 변화.

#### Relay

normal Release chain success.

#### Shear

S1 rope-line hit count.

---

## 21. PASS Criteria

### Gameplay

- Wake state를 Cutter와 동시에 읽을 수 있음
- W1에서 Wake-only preview가 먼저 발생
- W2/W3에서 first true combination 발생
- LULL wait가 가능하지만 유일한 정답 아님
- ACTIVE Wake clear가 실제로 가능
- ACTIVE가 단순 무료 boost가 아니라 release-control tradeoff를 가짐
- Cutter off-screen fire 없음
- Recovery R1 / P2가 activation 밖
- Safe Route max 349.4px
- Flow Route max 320.0px
- 모든 Grapple link < current 400px Hook Reach
- Hook Reload 0.20 / actual flight를 고려한 flow
- `swingImpulse=0` Mandatory Safe Route graybox PASS
- no new input
- no new Rope mode
- no specific Foundation required
- Kill Optional

### Build

- Impulse / Relay / Shear current actual effects만 사용
- Relay를 Cut-triggered recovery로 잘못 설명하지 않음
- first Specialization을 mandatory로 가정하지 않음
- Legacy Artifact reward 없음

### Story

확인:

```text
Freight pressure / service automation remains partially active.
```

미확인:

```text
Lower Feeder Isolation
Group mapping
Corporate decision
```

### Production

- static wind rectangle only
- no moving train dependency
- no Scanner dependency
- no premature Approved Art

---

## 22. FAIL Conditions

### Gameplay

- Player가 매번 LULL까지 멈춰 기다림
- ACTIVE 진입이 사실상 자살
- Cutter + Wake cue를 구분 못함
- Hook flight 때문에 예상보다 재부착이 늦어지고 Recovery가 무너짐
- 400px를 넘는 Link 존재
- Flow가 4-1의 단순 long-gap 반복으로만 느껴짐
- R1/P2에서 Sentry가 새 target acquire
- one Cut → stage start reset

### Build

- Relay가 Cutter cut으로 자동 발동한다고 구현/설명
- Shear 20으로 Enemy100을 즉사한다고 가정
- Artifact reward 재도입
- first Specialization required

### Runtime

- old 440 range 사용
- independent maxAttachDistance 다시 추가
- old projectile speed 260 사용
- old attack range 520 사용
- old fire interval 1.40 사용
- Wind Shadow(0.15 배율) / Grounded Attenuation(0.35 배율) 존재를 모르고 옛 무보정 물리로만 Mandatory Route graybox 검증
- moving Wake volume 가정

### Story

- Lower Feeder Isolation 공개
- Group C와 Freight route 직접 연결
- Corporate order 공개

---

## 23. 개발 구현 우선순위

### P0 — Previous Drift Fix — RESOLVED

```text
4-1 Flow 408.9 > 400
```

는 FALSE ALARM으로 확인됨(§0-2 참고, Mandatory Safe Route는 M1/R3 경유로
이미 400px 이내). 좌표 교정 불필요.

4-2 current Combat / Hook / Foundation status 교정은 4-2 REV 1.2로 완료.

### P1 — 4-3 Geometry Only

Wind OFF.
Enemy OFF.

Safe / Flow graph를 current 400 Hook으로 검증.

### P2 — Hook Flight / Reload

현재 Hook flight + reload로:

```text
W1 → W2 → W3
```

실제 chain 가능한지 확인.

### P3 — Wake Only

Sentry OFF.

W1 / W2 / W3에서:

- LULL
- WARNING
- ACTIVE
- DECAY

각 상태 통과.

### P4 — Cutter Only

Wind OFF.

W2 / W3 activation geometry 검증.

### P5 — Combined

Wake + Cutter.

### P6 — Foundation Matrix

```text
NONE
IMPULSE
RELAY
SHEAR
```

4 cases mandatory clear.

### P7 — Multiplayer

같은 Wake phase / Cutter targeting / recovery.

### P8 — Camera / Story / Gate

### P9 — Art / Audio

Runtime stable 뒤.

---

## 24. Stage Data Concept

```js
{
    id: "sector-04-03",
    sectorId: "sector-04",
    order: 3,
    name: "FREIGHT BYPASS",

    bounds: {
        width: 1472,
        height: 1472
    },

    surfaces: [
        "P0", "P1", "R1", "P2", "R2", "P4",
        "A0", "W1", "W2", "W3", "A4", "A5", "A6"
    ],

    enemies: [
        {
            id: "sector-04-03:cutter-sentry-01",
            enemyType: "sentry-t1",
            position: { x: 448, y: -640 },
            activation: {
                x: -128,
                y: -832,
                width: 704,
                height: 480
            },
            ropeCutIntent: "ENABLED"
        }
    ],

    windZones: [
        {
            id: "sector-04-03:freight-wake",
            bounds: {
                x: -208,
                y: -832,
                width: 560,
                height: 544
            },
            direction: { x: 1, y: 0 },
            mode: "pulsed",
            strength: 360,
            cycle: {
                lull: 1.75,
                warning: 0.70,
                active: 1.40,
                decay: 0.30
            }
        }
    ],

    objectives: [
        "final-deck-reached",
        "exit-panel-engaged"
    ],

    nextAreaId: "sector-04-04"
}
```

### Important

`ropeCutIntent`는 문서 의미 표현일 뿐
현재 Runtime field가 아님.

실제 implementation은 current Enemy rule contract에 맞춘다.

---

## 25. 아트 담당자 전달문

> **4-3은 Freight Pressure Bypass에서 Cutter와 Transit Wake를 처음 동시에 읽는 Stage입니다. W1은 Wake만 경험하는 구간이고 W2/W3에서 Cutter Sentry가 활성화됩니다. Wake는 새로운 마법 바람이 아니라 도시 Freight/Pressure 설비가 주기적으로 토해내는 압력으로 보여야 합니다. LULL→WARNING→ACTIVE→DECAY 상태는 조명, 먼지, 케이블 떨림, 압력음으로 명확히 읽히되 Damage Hazard처럼 보이면 안 됩니다. Cutter는 4-2와 동일한 Hot Orange/White visual family를 유지하고, Rope/Hook Cyan은 최우선 가독성을 유지합니다. 현재 Hook은 실제로 날아가는 투사체 표현이 있으므로 강한 Wake particle 속에서도 Hook head와 Rope line이 묻히지 않아야 합니다. Final Art는 Runtime Area/Camera Zone/Stable ID 고정 전까지 HOLD입니다.**

---

## 26. 개발자 최종 전달 요약

### Current Runtime Basis

```text
HOOK REACH
400 px derived

HOOK SPEED
1400 px/s

HOOK FLIGHT
2/7 sec max

HOOK RELOAD
0.20 sec

CUTTER PROJECTILE
520 px/s

ENEMY RANGE
760

FIRE INTERVAL
1.00 sec
```

### Stage Core

```text
P1 SAFE PREVIEW
↓
W1 WAKE ONLY
↓
R1 SAFE
↓
W2 + W3
WAKE + CUTTER
↓
P2 SAFE EXIT
↓
NORMAL UPPER FLOW
↓
P4 GATE
```

### Wind

```text
+X
strength 360
1.75 / 0.70 / 1.40 / 0.30
```

### Sentry

```text
(+448, -640)
1 Stationary Cutter Sentry
W2/W3 only activation membership
```

### Geometry

```text
SAFE MAX
349.4 px

FLOW MAX
320.0 px

HOOK REACH
400 px
```

### Current Foundation

```text
IMPULSE
+180 release impulse

RELAY
0.65s normal-release window
0.16s buffer
108 aim tolerance

SHEAR
20 damage
```

### Do Not Add

- Patrol
- Scanner
- Moving Platform
- New Input
- New Rope Mode
- New Growth
- Artifact
- Boss

### Stage Feeling

> **“바람이 멈추길 기다려도 되지만, 흐름을 읽고 밀리는 순간을 이용하면 Cutter 구간을 더 빠르게 뚫을 수 있다.”**

---

## OPEN QUESTIONS

### 1. Transit Wake Strength

현재 첫 후보는 Sector01-6 재사용:

```text
360
```

실제 high-speed Rope에서 너무 강하면
Stage geometry를 먼저 보고 조정.

### 2. Global Wind Phase at Area Entry

Current pulsed Wind는 global elapsed time 기반.

즉 P1 도착 시 항상 LULL부터 시작하지 않는다.

이것은 허용.

P1 Safe Preview에서 현재 phase를 읽을 시간이 있어야 한다.

### 3. Cutter + Wake Difficulty

Projectile Speed가 현재 520으로 빨라졌다.

W2/W3에서 first-shot fairness가 부족하면:

- activation entry 위치
- Sentry position
- camera anticipation

을 먼저 조정.

Enemy projectile speed를 Stage 전용으로 낮추는 것은 후순위.

### 4. Relay and Cutter

현재 Cut 자체는 `onRopeReleased()`가 아니다.

향후 Design이 “Cut recovery도 Relay fantasy”를 원한다면
그건 별도 Foundation design change이며
4-3 Stage가 몰래 구현하지 않는다.

### 5. 4-1 Drift — RESOLVED

```text
4-2 runtime alignment patch
= RESOLVED (REV 1.2, GitHub main)

4-1 geometry patch (Flow Route A3→A4 408.9px > new 400px Hook Reach)
= FALSE ALARM — Mandatory Safe Route는 M1/R3 경유로 이미 400px 이내
```

위 §0-2 "4-1 Drift — FALSE ALARM (RESOLVED)" 참고. 4-4 이후 Stage로 가기 전에
추가로 처리할 4-1 Flow Route 항목은 없다.

### 6. First Specialization

Runtime 확인 전까지
4-3은 Foundation-only build expression으로 충분히 성립해야 한다.

### 7. 4-4 Story Handoff

4-3 Exit은 Freight service limited 상태까지만 전달.

4-4에서 처음:

```text
LOWER ASCENT FEEDER
STATUS: SEGMENTED
```

후보를 검토한다.

---

SECTOR 04-3 / FREIGHT BYPASS — BLOCKOUT CANDIDATE · REV 1.2
