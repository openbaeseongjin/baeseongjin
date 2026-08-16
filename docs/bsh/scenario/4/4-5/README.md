# SECTOR 04-5 — EXPRESS SHAFT

*BLOCKOUT CANDIDATE · REV 1.2 — WIND STRENGTH RECLASSIFIED / 4-1 DRIFT FALSE ALARM RESOLVED*

◀ PREV — [SECTOR 04-4 / INFRASTRUCTURE SERVICE NODE](../4-4/README.md) · NEXT — [SECTOR 04-6 / POWER RELAY SPAN](../4-6/README.md) ▶

`SECTOR 04 TRANSIT / INFRASTRUCTURE` · `STAGE 05` · `PURE HIGH-SPEED ROPE FLOW` · `TRANSIT WAKE AS ASSIST`

| 항목 | 기준 |
|---|---|
| Status | HYPOTHESIS — BLOCKOUT CANDIDATE |
| Difficulty | ★★★☆ |
| Expected First Playtime | 120–175 sec |
| Expected Skilled Clear | 45–70 sec |
| Enemy | NONE |
| Cutter Fire | NONE |
| Patrol | NONE |
| Transit Wake / Wind | Pulsed Wind ×1 — CENTRAL EXPRESS PRESSURE COLUMN |
| Scanner | NONE |
| Moving Platform / Train Collision | NONE |
| New Player Input | NONE |
| New Rope Mode | NONE |
| Foundation | CURRENT RUNTIME — selected Foundation KEEP |
| First Specialization | CONTENT BLOCKED / NOT REQUIRED |
| New Growth | NONE |
| Legacy Artifact Layer | REMOVED FROM CURRENT RUNTIME |
| Required Kill | NONE |
| Design Checkpoint / Reward | NONE |
| Boss | NONE |
| Primary Role | Sector 04 중간의 순수 Movement Joy / Wake-assisted continuous ascent |
| Primary Space | Tall Express Pressure Shaft / Central Service Core |
| Exit | Reach Final Deck → Gate Panel → Gate Open → Physical Crossing |
| Runtime Status | Sector 04 standalone catalog AUTHORED & VALIDATED (4-1~4-8) — 메인 월드 NOT CONNECTED |
| Approved Gameplay Art | HOLD until Runtime Area / Camera Zone / Stable IDs exist |

---

## 0. 기획 기준

### LOCKED FOR THIS STAGE

4-5는 Sector 04에서
Player가 가장 순수하게:

```text
ROPE
+
MOMENTUM
+
TRANSIT WAKE
```

를 즐기는 Stage다.

직전:

```text
4-3
CUTTER + WAKE

4-4
ZERO-THREAT REST
```

후:

```text
4-5
WAKE-ASSISTED MOVEMENT JOY
```

로 간다.

### Core Question

> **“Wake를 위험으로 기다리는 대신, 상승 Momentum을 더 오래 살리는 보조 흐름으로 사용할 수 있는가?”**

### 핵심 전환

4-3에서 ACTIVE Wake는:

```text
faster
but
Cutter line control harder
```

였다.

4-5에서는 Enemy가 없으므로:

```text
ACTIVE / DECAY
=
PURE MOVEMENT OPPORTUNITY
```

가 된다.

### 4-5가 가르치지 않는 것

- 새 Wind Physics
- 새 Rope Mode
- Moving Train
- Moving Platform
- Cutter
- Enemy
- Scanner
- New Growth

### 금지

- LULL까지 기다려야만 진행 가능
- ACTIVE Wake가 즉사/낙사 Hazard
- 중앙 Wake를 Mandatory Elevator처럼 사용
- Wake 밖에서는 진행 불가
- Moving Train collision
- Moving Grapple Surface
- Damage Wind
- Wind Shadow(현재 구현됨, §0-1 참고)를 Mandatory Route 성립 조건으로 설계
- Grounded Wind Attenuation(현재 구현됨, §0-1 참고)를 Mandatory Route 성립 조건으로 설계
- New Input
- New Rope Mode
- Build Lock
- Lower Feeder Isolation Reveal

---

## 0-1. 최신 GitHub / Runtime 교차검증

### VERIFIED — CURRENT MAIN AT AUTHORING

작성 시작 시점 최신 `main`:

```text
ea993b55c6f9d946fa8e166dc710f0e336b7b169
```

현재 관련 병합:

```text
PR #498
SECTOR 04-3
FREIGHT BYPASS

PR #499
SECTOR 04-4
INFRASTRUCTURE SERVICE NODE
```

까지 현재 `main`에 반영돼 있다.

### Current Document Chain

현재:

```text
4-1
MERGED
known 400px Flow drift remains in GitHub doc

4-2
MERGED / REV 1.1

4-3
MERGED / REV 1.0

4-4
MERGED / REV 1.0

4-5
THIS DOCUMENT
```

따라서 4-5는
현재 GitHub 4-4의 Exit promise:

```text
EXPRESS SHAFT
SERVICE CHANNEL OPEN
```

을 PREV Story handoff로 사용한다.

### VERIFIED — CURRENT HOOK / ROPE

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

Mandatory / Flow geometry:

```text
ALL LINKS
< 400 px
```

기준.

### VERIFIED — CURRENT WIND MODEL

Current Pulsed Wind:

```text
LULL
multiplier 0

WARNING
multiplier 0

ACTIVE
multiplier 1

DECAY
multiplier 1 → 0 linear
```

Force는 Player point가
static rectangular zone 안에 있을 때 적용된다.

### RUNTIME UPDATE — WIND SHADOW / GROUNDED ATTENUATION 구현됨

4-5 최초 작성 이후 병합된 Runtime 변경(`WorldForceField.js`, `GameSimulation.js`)에서
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

이 Stage 초안의 §0 금지 목록과 §13 Recovery "Why", §24 FAIL 목록에 있는
"grounded attenuation이 없다"는 서술은 **작성 당시 기준**이며 이제 STALE이다.
해당 섹션을 참고해 갱신된 내용을 확인한다.

Falloff는 `defaultFalloff: 0`이므로 Zone이 명시적으로 `falloff` 값을 지정하지 않는 한
spatial falloff는 비활성 상태로 남는다. 4-5 Wake Zone은 falloff를 지정하지 않으므로
falloff 관련 설계는 변경 없음.

### 4-5 BASELINE

4-3과 동일한 Sector 04 Wake 값을 재사용한다.

```text
Lull     1.75 sec
Warning  0.70 sec
Active   1.40 sec
Decay    0.30 sec
```

Cycle은 Sector01 Pulsed Wind precedent와 일치하는 **VERIFIED PRECEDENT**다.

```text
Strength 360
```

는 Sector01에서 재사용한 값이 아니라 4-3에서 시작된 **Sector 04 고유 hypothesis**이며,
실제 shipped `Sector04AreaCatalog.js`의 4-5 `windZones`(`express-wake`)에 그대로
구현·검증돼 현재 Sector 04의 CURRENT RUNTIME 값이다.

4-5에서 새 Wind 수치를 동시에 발명하지 않는다.

### Direction Change Only

4-3:

```text
direction
(+1, 0)
```

4-5:

```text
direction
(0, -1)
```

로 재컨텍스트.

Current Wind Runtime은 direction vector를 normalize해 force를 적용하므로
별도 Physics System이 필요하지 않다.

---

## 0-2. Current Foundation Alignment

### VERIFIED — Foundation Runtime

```text
IMPULSE COIL

RELAY LINK

SHEAR CURRENT
```

현재 실제 Runtime에 존재.

### IMPULSE

```text
valid swing release
→ +180 impulse
```

### RELAY

```text
normal release
→ 0.65 sec window
→ 0.16 sec attach buffer
→ 108 aim tolerance
```

### SHEAR

```text
release rope segment
→ enemy intersection
→ 20 damage
```

### 4-5 의미

Enemy가 없으므로:

```text
SHEAR OFFENSE VALUE
= NONE
```

이어도 정상.

4-5의 Build expression은:

```text
IMPULSE
= speed / landing skip

RELAY
= chain continuity

SHEAR
= base Rope movement only
```

로 비대칭이어도 허용.

### First Specialization

현재 Production Alignment 기준:

```text
Node skeleton
= IMPLEMENTED

selectionPool
= TBD

effects / storage
= PENDING
```

따라서:

```text
FIRST SPECIALIZATION
= NOT REQUIRED
```

### Legacy Artifact

Current Runtime에서 제거.

4-5에 Reward / Artifact 가정 없음.

---

## 0-3. 4-4 → 4-5 → 4-6 Rhythm

### 4-4

```text
REST
ROUTING DIAGNOSTIC
LOWER FEEDER: SEGMENTED
```

### 4-5

```text
PURE HIGH-SPEED ASCENT
NO ENEMY
WAKE ASSIST
```

### 4-6

```text
POWER RELAY SPAN
CUTTER + PATROL
ROPE GEOMETRY
NO WAKE
```

따라서 4-5는:

```text
STORY READING
→
MOVEMENT JOY
→
COMBAT GEOMETRY
```

사이의 Movement Peak다.

---

## 1. 한 줄 정의

4-4 Infrastructure Service Node에서 `LOWER ASCENT FEEDER — STATUS: SEGMENTED`라는 이상 상태를 처음 확인한 Player가,
바로 원인을 조사하는 대신 도시 상부의 거대한 **Express Pressure Shaft**를 따라 계속 상승하며,
Enemy·Cutter 없이 중앙의 Pulsed Transit Wake Column과 양옆의 Safe Recovery Ledge 사이를 Rope로 연결하고,
LULL에도 안전하게 올라갈 수 있지만 ACTIVE/DECAY에 중앙 Column을 연속으로 타면 상승 Momentum이 더 오래 유지되어 착지를 크게 줄일 수 있는
Sector 04의 순수 Movement Joy Stage.

---

## 2. 전체 게임에서의 역할

### 2-1. Movement Reward

4-2 / 4-3은
새 Threat 때문에 Rope를 더 신중하게 사용했다.

4-5에서는:

> **“이제 다시 마음껏 크게 움직여도 된다.”**

를 준다.

### 2-2. Wake Reinterpretation

4-3:

```text
WAKE
=
RISK / OPPORTUNITY
```

4-5:

```text
WAKE
=
MOVEMENT ASSIST / TIMING BONUS
```

동일 Physics를
다른 Level Context로 느끼게 한다.

### 2-3. Vertical Scale Peak

4-1에서 큰 Transit Scale을 보여줬다면
4-5는 실제로:

```text
LONG VERTICAL CONTINUOUS AIRTIME
```

을 가장 강하게 사용한다.

### 2-4. 4-6 대비

4-5는:

```text
NO ENEMY
```

이므로
4-6에서 다시 Cutter/Patrol이 나타날 때
압력 변화가 선명해진다.

---

## 3. Story 역할

4-5는 4-4 Story Reveal을 확장하지 않는다.

### Entry

```text
EXPRESS SHAFT

SERVICE CHANNEL
OPEN
```

### Mid

```text
PRESSURE ASSIST

CYCLING
```

### Upper

```text
UPPER EXPRESS TRUNK

LIMITED OPERATION
```

### 의미

확인:

```text
Upper Express Infrastructure는
실제로 일부 작동 중이다.
```

### 아직 미확인

```text
왜 Lower Feeder는 segmented인가?
segmented = isolated인가?
누가 routing을 결정했는가?
Group C와 관련 있는가?
```

### Story Discipline

4-4에서 얻은:

```text
SEGMENTED
```

정보를
4-5에서 반복 설명하지 않는다.

Player가 움직이는 동안
긴 Story 문구를 띄우지 않는다.

---

## 4. 공간 콘셉트

### EXPRESS PRESSURE SHAFT

하나의 긴 수직 Express Service Shaft.

중앙:

```text
PRESSURE ASSIST COLUMN
```

양옆:

```text
STATIC SERVICE RECOVERY LEDGES
```

### Shape

```text
          P5 FINAL
           /
         W5
     R4
         W4
 R3
         W3
     R2
         W2
 R1
         W1
       P1
        |
       P0
```

### 핵심

Formal Route Menu가 아니다.

Player는 계속 같은 Shaft 안에 있다.

차이는:

```text
CENTRAL
= more airborne / Wake exposure / faster

SIDE LEDGE
= stable / slower / reset rhythm
```

### Moving Train 없음

Speed는:

- large vertical void
- long airtime
- Wake-assisted arc
- reduced landing count
- background streak

으로 만든다.

---

## 5. Pixel / Grid 기준

### Base Grid

```text
32 px
```

### Map Hypothesis

```text
WIDTH
1216 px

X
-608 ~ +608

HEIGHT
1536 px

Y
0 ~ -1536
```

### Visual Scale

4-4보다 즉시 커져야 한다.

- central pressure duct: 128–192px width
- shaft structural span: 256–512px
- side service ledge: 160–256px
- far express frame: screen-scale

### Gameplay Priority

```text
Hook / Rope Cyan
> Wake particles
> Background motion
```

Wake particle가 Hook head를 가리면 FAIL.

---

## 6. 전체 맵 구조

```text
Y = 0

P0 ENTRY
  \
   A0
    \
    P1 PRESSURE PREVIEW
       \
        W1  ← CENTER WAKE
      R1
        \
         W2
            R2
         W3
      R3
         W4
            R4
         W5
           \
            P5 FINAL DECK
            PANEL / GATE

Y = -1536
```

### Stage Shape

```text
ONE VERTICAL SHAFT
```

이다.

3-7 / 3-8처럼
다중 Route identity를 부여하지 않는다.

---

## 7. Zone 구성

### Z0 — Express Entry

```text
Y 0 ~ -288
```

P0 → A0 → P1.

Wake 밖.

4-4의 조용한 Control Bay에서
큰 Shaft로 카메라/음향 스케일 전환.

### Z1 — Wake Read

```text
Y -288 ~ -544
```

P1 → W1 → R1.

W1부터 중앙 Wake 진입.

R1은 Wake 밖.

첫 ACTIVE를 놓쳐도
R1에서 안전하게 다음 Cycle을 읽을 수 있다.

### Z2 — Continuous Express Core

```text
Y -544 ~ -1056
```

W2 → W3.

Flow Route는 중앙에 머문다.

Safe Route는 R2를 밟을 수 있다.

### Z3 — Upper Express Chain

```text
Y -1056 ~ -1408
```

W4 → W5.

Wake-assisted chain의 가장 긴 연속 구간.

R3 / R4가 양옆 Recovery.

### Z4 — Exit

```text
Y -1408 ~ -1536
```

P5.

Wake 완전 밖.

Gate / Story / Input 안전.

---

## 8. 좌표 / 오브젝트

모두:

```text
HYPOTHESIS — BLOCKOUT
```

### 8-1. Landing / Recovery

| ID | Center | Size | Role |
|---|---:|---:|---|
| P0 | `(-448, 0)` | `320×32` | Entry |
| P1 | `(-288, -256)` | `320×32` | Pressure Preview |
| R1 | `(-256, -544)` | `224×24` | Lower Recovery |
| R2 | `(+256, -768)` | `224×24` | Mid Recovery |
| R3 | `(-256, -1024)` | `224×24` | Upper Recovery 1 |
| R4 | `(+256, -1280)` | `224×24` | Upper Recovery 2 |
| P5 | `(+320, -1472)` | `416×32` | Final Safe Deck |

### 8-2. Grapple Targets

| ID | Position | Role |
|---|---:|---|
| A0 | `(-320, -160)` | Entry Brace |
| W1 | `(-96, -416)` | Wake Anchor 1 |
| W2 | `(+96, -640)` | Wake Anchor 2 |
| W3 | `(+96, -896)` | Wake Anchor 3 |
| W4 | `(-96, -1152)` | Wake Anchor 4 |
| W5 | `(+96, -1376)` | Wake Anchor 5 |

### 8-3. Transit Wake

```text
ID
sector-04-05:express-wake

Bounds
X -192 ~ +192
Y -1408 ~ -320

Direction
(0, -1)

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

### Membership

```text
W1 IN
W2 IN
W3 IN
W4 IN
W5 IN

R1 OUT
R2 OUT
R3 OUT
R4 OUT

P1 OUT
P5 OUT
```

### 8-4. Gate

```text
Panel
(+432, -1472)

Gate
(+528, -1472)
```

Wake / Threat 밖.

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
→ R2
→ W3
→ R3
→ W4
→ R4
→ W5
→ P5
```

### Distance Pre-check

| Link | Distance |
|---|---:|
| P0 → A0 | `204.9 px` |
| A0 → P1 | `101.2 px` |
| P1 → W1 | `249.9 px` |
| W1 → R1 | `204.9 px` |
| R1 → W2 | `364.9 px` |
| W2 → R2 | `204.9 px` |
| R2 → W3 | `204.9 px` |
| W3 → R3 | `374.6 px` |
| R3 → W4 | `204.9 px` |
| W4 → R4 | `374.6 px` |
| R4 → W5 | `186.6 px` |
| W5 → P5 | `243.7 px` |

### Result

```text
MAX SAFE LINK
= 374.6 px

CURRENT DERIVED HOOK REACH
= 400 px

MARGIN
= 25.4 px
```

### Safe Route Contract

Safe Route는:

```text
LULL
WARNING
ACTIVE
DECAY
```

어느 상태에서도 진행 가능해야 한다.

ACTIVE가 Safe Route를
바깥 낙사로 밀어내면 FAIL.

### `swingImpulse = 0`

Runtime graybox에서:

```text
Safe Route
swingImpulse = 0
```

PASS 필수.

Wake ACTIVE가 없어도
Side Recovery를 사용해 진행 가능해야 한다.

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
→ W4
→ W5
→ P5
```

R1~R4 landing 전부 생략 가능.

### Distances

| Link | Distance |
|---|---:|
| P1 → W1 | `249.9 px` |
| W1 → W2 | `295.0 px` |
| W2 → W3 | `256.0 px` |
| W3 → W4 | `320.0 px` |
| W4 → W5 | `295.0 px` |
| W5 → P5 | `243.7 px` |

### Result

```text
MAX FLOW LINK
= 320.0 px
```

400px 사거리 정밀 시험이 아니다.

### Flow Fantasy

```text
RELEASE
→ Hook Flight
→ ATTACH
→ WAKE EXTENDS ASCENT
→ RELEASE
→ NEXT HOOK
```

### ACTIVE / DECAY

Flow Route의 최고 숙련은:

```text
ACTIVE에 진입
→ upward deceleration 감소
→ fewer landings
→ DECAY까지 chain 유지
```

이다.

### LULL

LULL에도 Flow Route 자체는
Player Base Rope로 가능한 geometry여야 한다.

Wake는:

```text
BONUS
```

이지:

```text
PROGRESSION KEY
```

가 아니다.

---

## 11. Transit Wake Gameplay Contract

### Current Physics Meaning

Direction:

```text
(0,-1)
```

Strength:

```text
360
```

Player gravity:

```text
1250 downward baseline
```

이므로 ACTIVE Wake가
Player를 자동으로 위로 쏘는 Elevator는 아니다.

### Expected Feel

이미 upward momentum이 있는 Player에게:

```text
descent / deceleration을 늦추고
airtime을 늘리는 assist
```

로 작용.

### 좋은 결과

```text
same swing
+
ACTIVE wake
→ one landing less
```

### 나쁜 결과

```text
stand still
→ wind automatically carries player to top
```

이 되면 Strength / geometry 재조정.

### Global Phase

Current Wind는 global elapsed time 기반.

Area 입장 시:

```text
always LULL
```

을 보장하지 않는다.

P1 Safe Preview에서
현재 phase를 읽을 수 있게 한다.

---

## 12. Foundation / Build Expression

### IMPULSE COIL

현재 실제:

```text
+180 release impulse
```

4-5에서 가장 강하게 빛나는 Foundation.

후보:

- W1 → W2
- W3 → W4
- W4 → W5

ACTIVE Wake와 겹치면
landing skip 가능.

### RELAY LINK

현재 실제:

```text
0.65 sec release window
0.16 sec attach buffer
108 aim tolerance
```

W1 → W5 continuous chain에서
편안함 / consistency를 올린다.

### SHEAR CURRENT

Enemy 없음.

```text
OFFENSE VALUE
= NONE
```

하지만 Base Rope geometry는 동일하게 통과.

### Balance Principle

4-5가:

```text
IMPULSE ONLY STAGE
```

가 되면 FAIL.

Impulse는 더 빠를 수 있지만:

```text
Relay
= easier chain

Shear
= normal base clear
```

모두 Mandatory clear 가능.

### First Specialization

필요 없음.

### New Growth

없음.

---

## 13. Recovery

### Side Ledge Rule

R1~R4:

```text
WAKE OUTSIDE
```

다.

### Why

Current Wind는 이제:

```text
GROUNDED ATTENUATION
= player.physics.isGrounded일 때 force × 0.35
```

를 지원한다(§0-1 RUNTIME UPDATE 참고).

하지만 0.35는 **감쇠**이지 **차단**이 아니다.
Strength 360 기준 착지 중에도 약 126의 잔여 force가 남고,
착지 실패로 다시 airborne이 되는 순간 즉시 감쇠 없는 전체 force로 복귀한다.

따라서 Recovery Deck을 Wake 안에 두는 것은
여전히 "약하게 계속 밀리다가 실패 시 다시 강하게 밀리는" 불안정한 설계다.

안전 Recovery는 계속:

```text
Wake bounds 밖
```

에 둔다. 이 결정은 Grounded Attenuation의 존재 여부와 무관하게
가장 단순하고 예측 가능한 선택이다.

### Miss Examples

W2 → W3 실패:

```text
R2
or
R3
```

회수.

W3 → W4 실패:

```text
R3
```

회수.

W4 → W5 실패:

```text
R4
```

회수.

### Recovery Target

단일 miss 후:

```text
≤ 5 sec
```

안에 원래 진행 높이로 복귀.

### No Damage Floor

낙하 자체 Damage 없음.

### No Full Reset

W4 실패가 P0까지 이어지면 FAIL.

---

## 14. Enemy / Hazard

### Enemy

```text
NONE
```

### Cutter

```text
NONE
```

### Patrol

```text
NONE
```

### Scanner

```text
NONE
```

### Damage Hazard

```text
NONE
```

### Transit Wake

```text
ONLY ACTIVE GAMEPLAY PRESSURE / ASSIST
```

### Important

4-5에서 Player가 죽는다면
대부분:

```text
world fall / sector collapse context
```

이지
Wake 자체 Damage 때문이 아니어야 한다.

---

## 15. Camera

모두 HYPOTHESIS.

### C0 — Shaft Reveal

```text
P0 / A0 / P1
+
far vertical shaft

Desktop 0.94
Mobile  0.70
```

### C1 — Lower Express

```text
W1 / R1 / W2

Desktop 0.88
Mobile  0.68
```

보여야 함:

- current Hook
- next central Anchor
- nearest side Recovery

### C2 — Mid Express

```text
W2 / R2 / W3 / R3

Desktop 0.86
Mobile  0.68
```

가장 넓은 Movement framing.

### C3 — Upper Express

```text
W3 / W4 / R3 / R4

Desktop 0.86
Mobile  0.68
```

### C4 — Exit

```text
W5 / P5 / Gate

Desktop 0.96
Mobile  0.72
```

### Camera Look-ahead

고속 상승 시:

```text
vertical look-ahead
```

가 필요할 수 있다.

하지만 새 Camera System을
Stage 문서에서 확정하지 않는다.

기존 Camera Zone만으로 부족하면
Runtime spike 후 별도 결정.

---

## 16. Story Trigger

### S0 — Entry

```text
EXPRESS SHAFT

SERVICE CHANNEL
OPEN
```

### S1 — Pressure Column

```text
PRESSURE ASSIST

CYCLING
```

### S2 — Upper Exit

```text
UPPER EXPRESS TRUNK

LIMITED OPERATION
```

### Presentation

Flow 중 긴 문장 금지.

상태 라벨은:

```text
1~2초 glance
```

로 읽을 수 있어야 한다.

### Story Hold

4-4의:

```text
LOWER ASCENT FEEDER
STATUS: SEGMENTED
```

를 다시 화면에 반복하지 않는다.

4-7의:

```text
ISOLATED
```

도 아직 금지.

---

## 17. Pixel Art Asset Spec

### Central Pressure Column

구조:

- vertical vent spine
- express pressure duct
- segmented grille
- pressure lamps
- cable guides

### State Cue

#### LULL

- low particle density
- stable cables
- dim neutral lamps

#### WARNING

- upward indicator chase
- cable tension increase
- amber prep cue

#### ACTIVE

- clear upward particles
- scarf lift
- vent light sequence
- far streak acceleration

#### DECAY

- particle density taper
- indicator fade

### Important

Wake cue가:

```text
DAMAGE HAZARD
```

처럼 보이면 안 된다.

Red/orange danger stripe 남발 금지.

### Side Recovery

차분한 neutral steel.

Player가:

```text
여기서 쉬어도 된다
```

고 느껴야 한다.

---

## 18. Background / Parallax

### Far

- colossal vertical express trunk
- distant rail/service lines
- parallel pressure shafts
- moving indicator bands

### Mid

- ventilation turbines
- static maintenance bridge
- conduit rings
- cable assemblies

### Movement Illusion

실제 moving gameplay surface 없이:

- upward light streak
- passing far silhouette
- pressure particles
- parallax speed

로 고속감을 강화.

### No False Grapple

Far moving frame이
실제 Anchor처럼 보이면 FAIL.

---

## 19. Sound / VFX

### Entry

4-4의 quiet hum에서
점진적으로 pressure rumble 증가.

### LULL

```text
deep duct hum
```

### WARNING

```text
rising pressure tone
```

### ACTIVE

```text
broad upward rush
```

### DECAY

```text
fast pressure taper
```

### Rope / Hook

Enemy가 없으므로:

- hook launch
- hook hit
- tension
- release
- relay cadence

가 매우 잘 들려야 한다.

### Impulse

Impulse Foundation의 Release feedback가
Wake roar에 묻히면 FAIL.

---

## 20. Implementation Notes

### Runtime Area ID

```text
sector-04-05
```

### Stable Prefix

```text
sector-04-05:*
```

### Candidate Surface IDs

```text
sector-04-05:p0
sector-04-05:p1
sector-04-05:r1
sector-04-05:r2
sector-04-05:r3
sector-04-05:r4
sector-04-05:p5

sector-04-05:a0-surface
sector-04-05:w1-surface
sector-04-05:w2-surface
sector-04-05:w3-surface
sector-04-05:w4-surface
sector-04-05:w5-surface
```

### Wind Zone

```js
{
    id: "sector-04-05:express-wake",
    bounds: {
        x: -192,
        y: -1408,
        width: 384,
        height: 1088
    },
    direction: {
        x: 0,
        y: -1
    },
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

### Enemy

```text
NONE
```

### Gate

```text
reach P5
→ Gate Panel
→ Gate open
→ physical crossing
→ sector-04-06
```

### No New Runtime System

4-5는 기존:

```text
static surfaces
+
Hook Flight
+
Pulsed Wind
+
Foundation
```

만으로 성립해야 한다.

---

## 21. Timer / Progress Contract

### General Sector Timer

계속 진행.

4-5는:

```text
speed reward
```

Stage지만
특별 Timer multiplier 없음.

### Gate

현재 공용 Sector Timer / Gate replenish 계약 유지.

### Design Checkpoint

```text
NONE
```

### Runtime Area Entry

공용 Runtime이 entry progress anchor를 생성하면
그것은 Reward가 아니다.

### Speed Incentive

Skilled Player의 reward는:

```text
less time spent
+
fewer landings
+
cleaner movement
```

이다.

별도 Score Currency 추가 없음.

---

## 22. Multiplayer Contract

### Shared Wake Phase

두 Player 모두:

```text
same deterministic wind phase
```

를 봐야 한다.

### Different Routes

Player A:

```text
central Flow
```

Player B:

```text
side Recovery
```

동시에 가능.

### No Party Lock

한 Player가 R2에서 기다린다고
다른 Player의 Wake / Gate / camera가 멈추면 안 된다.

### Gate

```text
shared open
individual crossing
```

계약.

### Camera / Split Pace

두 Player가 vertical gap을 크게 벌렸을 때
현재 multiplayer camera contract가 어떻게 처리하는지는
Runtime integration에서 검증.

Stage 때문에 강제 tether / teleport 추가 금지.

---

## 23. Playtest Metrics

### Core Movement

```text
clear time
landing count
airborne time ratio
hook launch count
successful hook hit count
release count
```

### Wake Use

```text
time inside wake
ACTIVE entry count
ACTIVE chain count
DECAY chain count
full-cycle waits
```

### Recovery

```text
R1~R4 landing count
fall depth
recovery time
full reset count
```

### Foundation

#### IMPULSE

```text
side ledge skips
clear time
```

#### RELAY

```text
continuous central chain count
failed next-hook count
```

#### SHEAR

Combat metric 0이어도 정상.

### Desired Skilled Signature

```text
landing count ↓
airborne ratio ↑
ACTIVE/DECAY use ↑
clear time ↓
```

---

## 24. PASS Criteria

### Gameplay

- 4-4 이후 즉시 큰 이동 공간으로 전환
- Enemy 없음
- Cutter 없음
- 중앙 Wake만 active gameplay layer
- LULL에도 Mandatory clear 가능
- ACTIVE/DECAY를 쓰면 실제 landing을 줄일 수 있음
- Wake가 자동 Elevator가 아님
- Side Recovery R1~R4가 Wake 밖
- Safe Route max 374.6px
- Flow Route max 320.0px
- 모든 Hook link < 400px
- Hook Flight / Reload가 chain feel에 반영됨
- `swingImpulse=0` Safe Route graybox PASS
- no new input
- no new Rope mode
- no Foundation lock
- no new growth
- no moving platform dependency

### Rhythm

- 4-3의 Combined Pressure와 다름
- 4-4 Rest와 다름
- 4-6 Combat Geometry 전에 Movement Joy peak 역할 수행

### Story

확인:

```text
UPPER EXPRESS TRUNK
LIMITED OPERATION
```

미확인:

```text
LOWER FEEDER ISOLATED
why segmented
who decided
Group C causal mapping
```

### Production

- Wind = static rectangular zone
- direction only `(0,-1)`
- existing cycle reused
- Approved Gameplay Art HOLD

---

## 25. FAIL Conditions

### Gameplay

- LULL에서 진행 사실상 불가능
- ACTIVE가 유일한 Progression Key
- Wake가 Player를 자동으로 위층까지 운반
- side ledge가 Wake 안이라 안전하지 않음
- 400px 이상 Hook link
- exact reach-limit 시험
- Stage가 단순 기다리기 퍼즐
- Enemy를 추가해야 재미가 성립
- Moving Train이 없으면 정체성이 사라짐

### Build

- Impulse 없으면 clear 불가능
- Relay 없으면 central chain 불가능
- Shear에게 가짜 이동 bonus를 추가
- Specialization required
- Legacy Artifact reward 재도입

### Story

- `SEGMENTED` 원인을 설명
- `ISOLATED` 조기 공개
- Group C와 Lower Feeder 직접 연결
- Corporate decision 공개

### Runtime

- Wind Shadow(0.15 배율) / Grounded Attenuation(0.35 배율) 존재를 모르고 옛 무보정 물리로만 Mandatory Route graybox 검증
- moving force volume 가정
- client-local Wind phase
- legacy fixed Rope-range assumption 재사용

---

## 26. 개발자 최종 전달 요약

### Stage

```text
SECTOR 04-5
EXPRESS SHAFT
```

### Role

```text
PURE MOVEMENT JOY
+
WAKE-ASSISTED ASCENT
```

### Threat

```text
Enemy 0
Cutter 0
Patrol 0
Scanner 0
Damage Hazard 0
```

### Wake

```text
ONE STATIC CENTRAL COLUMN

Bounds
X -192 ~ +192
Y -1408 ~ -320

Direction
(0,-1)

Strength
360

Cycle
1.75 / 0.70 / 1.40 / 0.30
```

### Geometry

```text
SAFE MAX
374.6 px

FLOW MAX
320.0 px

CURRENT HOOK REACH
400 px
```

### Safe

```text
central Anchor
→ side Recovery
→ central Anchor
```

### Flow

```text
W1 → W2 → W3 → W4 → W5
```

central continuous chain.

### Foundation

```text
IMPULSE
fastest / landing skip

RELAY
easiest chain continuity

SHEAR
base movement clear
```

### Do Not Add

- Enemy
- Cutter
- Moving Platform
- Scanner
- New Growth
- New Input
- New Rope Mode
- Artifact
- Boss

### Stage Feeling

> **“압력 흐름이 켜지는 순간을 잘 타면, 발판에 거의 내려오지 않고 거대한 Shaft를 한 번에 이어 올라갈 수 있다.”**

---

## OPEN QUESTIONS

### 1. Wake Strength 360

Sector01 baseline이 아니라 Sector 04 고유 hypothesis(§0-1 참고)이며,
현재 shipped `Sector04AreaCatalog.js`에 그대로 구현돼 CURRENT RUNTIME 값이다.

실제 vertical ascent에서 너무 약해
LULL과 차이가 거의 없으면:

1. geometry / release angle
2. zone width
3. active timing

을 먼저 조정.

Strength 증가는 후순위.

### 2. Upward Wind vs Gravity

현재 `360`은 Gravity `1250`보다 작다.

의도:

```text
AUTO LIFT
아님

MOMENTUM PRESERVATION
```

이다.

Playtest에서 효과가 너무 미미하면
“강한 상승풍”으로 바로 증폭하기보다
Stage spacing과 arc를 먼저 조정.

### 3. Central Column Width

현재:

```text
384 px
```

후보.

너무 넓어 Side Recovery 접근 중에도 Wake에 계속 걸리면
`320~352px`로 축소.

### 4. W3 → W4

```text
320 px
```

Flow 구간의 가장 긴 central link.

Hook flight + active wake에서
조준이 불안하면 16~24px inward 조정.

### 5. Camera Look-ahead

고속 vertical flow에서
기존 Camera Zone만으로 Next Anchor가 늦게 보이면
별도 look-ahead spike 필요.

하지만 Stage spec이 새 Camera System을 미리 요구하지 않는다.

### 6. 4-4 Runtime Handoff

4-4는 PR #499로 GitHub merge 완료.

현재 4-5는 4-4의:

```text
EXPRESS SHAFT
SERVICE CHANNEL OPEN
```

Exit promise를 직접 이어받는다.

향후 4-4 실제 Runtime geometry가 구현되면:

- Gate arrival position
- first 4-5 P0 framing
- camera continuity

를 다시 검증.

### 7. 4-6 Handoff

4-5 Exit에서 적을 Preview하지 않는다.

4-6 시작 Safe Deck에서:

```text
POWER RELAY SPAN
+
Cutter / Patrol spatial read
```

를 처음 보여주는 것을 기본으로 한다.

### 8. 4-1 Drift — FALSE ALARM (RESOLVED)

4-1의 Flow Route `A3 → A4 = 408.9px > 400px Hook Reach`는 실제로는 문제가 아니었다.
4-1의 **Mandatory Safe Route**는 같은 구간을 `A3 → M1 → A4`로 우회해
(§9, 각 222.3px / 186.6px) 400px 이내로 통과하며, shipped
`Sector04AreaCatalog.js`도 이 좌표 그대로 구현·검증돼 있다. Flow Route는
문서 자체가 `OPTIONAL EXPRESSION`으로 명시한 skilled-only 지름길이라
A3 → A4 직결이 막혀 있어도 Mandatory 진행에는 영향이 없다(4-1 §10 참고).
좌표 변경은 필요하지 않았다.

4-5는 4-1의 Flow Route 수치를 참조하지 않으므로 추가 조치가 필요 없다.

---

SECTOR 04-5 / EXPRESS SHAFT — BLOCKOUT CANDIDATE · REV 1.2
