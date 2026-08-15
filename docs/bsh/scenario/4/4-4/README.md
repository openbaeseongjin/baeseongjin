# SECTOR 04-4 — INFRASTRUCTURE SERVICE NODE

*BLOCKOUT CANDIDATE · REV 1.0*

◀ PREV — [SECTOR 04-3 / FREIGHT BYPASS](../4-3/README.md) · NEXT — [SECTOR 04-5 / EXPRESS SHAFT](../4-5/README.md) ▶

`SECTOR 04 TRANSIT / INFRASTRUCTURE` · `STAGE 04` · `REST / ROUTING DIAGNOSTIC` · `GROWTH GATE: HOLD`

| 항목 | 기준 |
|---|---|
| Status | HYPOTHESIS — BLOCKOUT CANDIDATE |
| Difficulty | REST |
| Expected First Playtime | 55–85 sec |
| Expected Skilled Clear | 25–40 sec |
| Enemy | NONE |
| Cutter Fire | NONE |
| Transit Wake / Wind | NONE |
| Patrol | NONE |
| Scanner | NONE |
| Moving Platform / Train Collision | NONE |
| New Player Input | NONE |
| New Rope Mode | NONE |
| Foundation | CURRENT RUNTIME — selected Foundation KEEP |
| First Specialization | CONTENT BLOCKED / EFFECTS NOT IMPLEMENTED — not required |
| New Growth | NONE |
| Legacy Artifact Layer | REMOVED FROM CURRENT RUNTIME |
| Required Kill | NONE |
| Design Checkpoint / Reward | NONE |
| Health Refill | NONE ADDED |
| Timer Pause | NONE |
| Boss | NONE |
| Primary Role | 4-3 Cutter+Wake 이후 완전한 Decompression + Lower Feeder 이상징후 첫 Setup |
| Primary Space | Transit Routing Control Bay / Service Spine |
| Exit | Reach Final Deck → Gate Panel → Gate Open → Physical Crossing |
| Runtime Status | Sector 04 authored runtime NOT CONNECTED |
| Approved Gameplay Art | HOLD until Runtime Area / Camera Zone / Stable IDs exist |

---

## 0. 기획 기준

### LOCKED FOR THIS STAGE

4-4는 Sector 04 중간의 **완전한 저압 Rest Stage**다.

직전 4-3:

```text
CUTTER
+
TRANSIT WAKE
+
HOOK FLIGHT
+
RECOVERY
```

를 동시에 읽었다.

4-4에서는 전부 끈다.

```text
NO ENEMY
NO CUTTER
NO WAKE
NO SCANNER
NO MOVING PLATFORM
```

### Core Question

> **“아무 압박 없이 도시의 Routing 상태를 읽었을 때, 무엇이 이상한가?”**

### Gameplay Function

4-4는 새로운 Skill Test가 아니다.

```text
DECOMPRESSION
+
CURRENT FOUNDATION CONTINUITY
+
STORY SETUP
+
4-5 SPEED PREVIEW
```

가 역할이다.

### REST의 정확한 의미

```text
REST
≠ TIMER PAUSE
≠ HEALTH REFILL
≠ CHECKPOINT REWARD
≠ BUILD REROLL
```

REST는 오직:

```text
THREAT-FREE SPACE
```

를 뜻한다.

Sector 일반 Timer는 기존 계약대로 계속 진행한다.
Gate의 기존 Timer 보충 규칙이 있다면 그것만 그대로 적용한다.

### 금지

- New Growth
- Second Specialization
- Hybrid
- Foundation Reset
- Foundation Reroll
- Artifact Reward
- Health Station 추가
- Timer Freeze
- Cutter
- Patrol
- Sentry
- Wake
- Scanner
- Moving Train
- Mandatory Terminal Interaction
- Long Story Dump
- `LOWER ASCENT FEEDER = ISOLATED` Reveal
- Group A/B/C와 Routing 연결

---

## 0-1. 최신 GitHub / Runtime 교차검증

### VERIFIED — CURRENT MAIN AT AUTHORING

최신 `main`:

```text
e05f9210475aec2d8a301adada83ac382530b9c5
```

현재 관련 병합:

```text
PR #497
4-2 CUTTER LINE
REV 1.1 Runtime Re-alignment

PR #498
4-3 FREIGHT BYPASS
current Hook / Combat / Foundation 기준 정렬
```

까지 `main`에 반영됐다.

### Current Sector 04 Document State

```text
4-1
MERGED
current GitHub doc still carries known 400px Flow drift note

4-2
MERGED / REV 1.1

4-3
MERGED / current Hook + Cutter + Wake alignment

4-4
THIS DOCUMENT
```

본 문서는 현재 GitHub 4-3을
직접 PREV로 사용한다.

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

따라서 4-4 모든 Mandatory / Flow Link:

```text
< 400 px
```

로 설계한다.

### VERIFIED — CURRENT FOUNDATION

현재 상태:

```text
FOUNDATION
= IMPLEMENTED
```

현재 Foundation Runtime:

```text
IMPULSE COIL
+180 release impulse

RELAY LINK
0.65 sec release window
0.16 sec attach buffer
108 aim tolerance

SHEAR CURRENT
20 damage
```

실제로 구현돼 있다.

### VERIFIED — FOUNDATION AREA TRANSITION CONTINUITY

현재 Portal transition은 Foundation 선택 자체를 clear하지 않고
Foundation의 transient runtime state만 reset하는 구조를 사용한다.

현재 `resetRuntime()`이 초기화하는 대표 transient state는
Relay의 남은 Window이며, 선택된 Foundation ID는 유지된다.

따라서 4-4에서:

```text
CURRENT FOUNDATION
= KEEP
```

가 Runtime 방향과 맞는다.

### VERIFIED — FIRST SPECIALIZATION

현재 2-3 Production Alignment:

```text
Specialization Node skeleton
= IMPLEMENTED

selectionPool
= TBD

Specialization Catalog / effects / result storage
= PENDING
```

따라서 4-4는:

```text
FIRST SPECIALIZATION
= NOT REQUIRED FOR CLEAR
```

로 둔다.

### VERIFIED — LEGACY ARTIFACT

현재 Runtime progression은 Foundation 중심으로 정리되었고
기존 Artifact checkpoint reward layer는 제거됐다.

4-4에 Artifact Node / Reward를 추가하지 않는다.

---

## 0-2. Sector 04 Master Plan 교차검증

Master의 4-4 역할:

```text
INFRASTRUCTURE SERVICE NODE

REST
BUILD DIAGNOSTIC
ROUTING PREVIEW

Enemy NONE
Growth HOLD
```

### REV 1.0 해석

여기서 `BUILD DIAGNOSTIC`은:

```text
새 UI
새 선택
새 Calibration 장치
```

를 의미하지 않는다.

4-4에서는:

> **압박이 없는 짧은 Rope Spine을 지나며 현재 Foundation의 손맛이 그대로 유지되는지 확인한다.**

정도로 구현한다.

### Why

3-5에서 이미:

```text
COMMERCIAL SERVICE CALIBRATION ROOM
```

이라는 명시적 Calibration Rest를 사용했다.

4-4까지 같은 구조를 쓰면 반복된다.

따라서:

```text
3-5
BUILD CALIBRATION

4-4
NETWORK / ROUTING DIAGNOSTIC
```

로 역할을 분리한다.

---

## 0-3. 4-3 → 4-4 → 4-5 Rhythm

### 4-3

```text
CUTTER + WAKE
FIRST COMBINATION
```

### 4-4

```text
ZERO THREAT
READ NETWORK
SHORT CLEAN ROPE
```

### 4-5

```text
EXPRESS SHAFT
PURE HIGH-SPEED WAKE FLOW
NO ENEMY
```

따라서 4-4는:

```text
COMBAT REST
```

뿐 아니라:

```text
NEXT MOVEMENT JOY SETUP
```

도 담당한다.

4-4 Exit에서 4-5의 큰 Express Shaft를 시각적으로 Preview한다.

---

## 1. 한 줄 정의

4-3 Freight Bypass의 Cutter+Transit Wake 결합을 통과한 Player가
소음과 압력이 크게 줄어든 **Infrastructure Routing Control Bay**에 들어와,
Enemy·Cutter·Wake 없이 짧고 안전한 Service Spine을 Rope로 올라가며 현재 Foundation의 이동 감각을 다시 정리하고,
중앙 Routing Overview Deck에서 처음으로 `LOWER ASCENT FEEDER — STATUS: SEGMENTED`라는 비정상 상태를 확인하지만 그것이 고장·격리·정책 중 무엇 때문인지는 알 수 없는 상태로 남긴 뒤,
상부 Express Shaft의 거대한 개방 공간을 Preview하고 4-5로 진입하는 Rest / Story Setup Stage.

---

## 2. 전체 게임에서의 역할

### 2-1. Mechanical Decompression

4-3은:

```text
Wake phase
+
Cutter telegraph
+
Hook flight
+
Recovery
```

를 동시에 처리한다.

4-4는 Player에게:

```text
STOP READING THREATS
START READING WORLD
```

시간을 준다.

### 2-2. Foundation Continuity Check

새 효과를 가르치지 않는다.

다만 짧은:

```text
RELEASE
→ NEXT HOOK
→ RELEASE
```

연결에서 현재 Foundation이 계속 느껴지는지 확인한다.

### 2-3. Story Pivot

Sector 04 Story의 첫 이상징후.

이전:

```text
Upper transit infrastructure
partially alive
```

4-4:

```text
Lower ascent feeder telemetry
is abnormal
```

아직 원인은 모름.

### 2-4. 4-5 Setup

4-4 끝에서는 Threat가 아니라:

```text
LARGE EXPRESS VOID
```

를 Preview.

다음 Stage를 기대하게 한다.

---

## 3. Story 역할

### S0 — Entry

```text
INFRASTRUCTURE SERVICE NODE

LOCAL CONTROL
AVAILABLE
```

### S1 — Routing Overview — MANDATORY TRAVERSAL BEAT

P2 Routing Overview Deck 접근 시:

```text
LOWER ASCENT FEEDER

STATUS
SEGMENTED

TELEMETRY
PARTIAL
```

### 이 문구가 의미하는 것

확실:

```text
Lower Ascent Feeder가
정상적인 단일 연결 상태는 아니다.
```

아직 미확인:

```text
물리적 고장인가?
Containment인가?
의도적 Routing인가?
누가 결정했는가?
Group C와 관련 있는가?
```

### S2 — Exit Preview

```text
EXPRESS SHAFT

SERVICE CHANNEL
OPEN
```

### 4-4에서 절대 쓰지 않는 문구

```text
LOWER ASCENT FEEDER
ISOLATED
```

이 Reveal은 4-7 소유.

또 금지:

- Group C Route
- Group A/B upper transit mapping
- Priority evacuation route
- Executive decision
- Deliberate sacrifice
- 사고 원인 설명

---

## 4. 공간 콘셉트

### TRANSIT ROUTING CONTROL BAY

4-3 Freight pressure corridor와
4-5 Express Shaft 사이의 안전한 Control / Service 공간.

### 공간 언어

```text
LOW NOISE
WIDE SERVICE DECK
ROUTING SCHEMATIC
STATIC CONDUIT
INSPECTION SPINE
EXPRESS VOID PREVIEW
```

### 3-5와 차이

3-5:

```text
COMMERCIAL CALIBRATION ROOM
current-build re-read
explicit calibration identity
```

4-4:

```text
TRANSIT ROUTING CONTROL BAY
network status read
no calibration apparatus
```

### No Upgrade Node

4-4 중앙에:

```text
AUGMENT NODE
SPECIALIZATION NODE
REWARD ALTAR
```

없음.

중앙 오브젝트는 오직:

```text
ROUTING STATUS DISPLAY
```

다.

---

## 5. Pixel / Grid 기준

### Base Grid

```text
32 px
```

### Map Hypothesis

```text
WIDTH
1152 px

X
-576 ~ +576

HEIGHT
896 px

Y
0 ~ -896
```

Sector 04 일반 Action Stage보다 짧고 조밀.

### Gameplay Surface

- Entry / Main Deck: 32px
- Small Recovery Ledge: 16–24px
- Final Deck: 32px
- Grapple Target: current 24×24 family

### Visual Priority

Rest Stage이므로:

```text
Danger Red
LOW

Rope / Hook Cyan
HIGH

Routing Display
neutral white / amber
```

### Express Preview

Exit 쪽 Background는 다시 스케일이 커져
4-5 진입을 예고한다.

---

## 6. 전체 맵 구조

```text
Y = 0

P0 ENTRY / DECOMPRESSION
  \
   A1
    \
     P1 QUIET SERVICE DECK
        \
         A2
          \
          P2 ROUTING OVERVIEW
          [LOWER FEEDER STATUS]
             \
              A3
               \
               R1
              /
            A4
             \
             P3 UPPER SERVICE DECK
               \
                A5
                 \
                 P4 FINAL / EXPRESS PREVIEW
                 PANEL / GATE

Y = -896
```

### Decision Shape

4-4는 Route Puzzle이 아니다.

```text
ONE QUIET SERVICE SPINE
```

만 있다.

Safe Route와 Flow Route 차이는:

```text
landing 횟수
```

정도만 존재.

---

## 7. Zone 구성

### Z0 — Decompression

```text
Y 0 ~ -224
```

P0 → A1 → P1.

- Enemy 없음
- Wake 없음
- Story 최소

4-3의 소리 / 압력을 시각적으로도 끊는다.

### Z1 — Routing Overview

```text
Y -224 ~ -448
```

A2 → P2.

P2는 Stage에서 가장 넓고 안전한 Deck.

여기서:

```text
LOWER ASCENT FEEDER
STATUS: SEGMENTED
```

를 자동 Traversal Story Beat로 읽는다.

### Z2 — Quiet Foundation Continuity

```text
Y -448 ~ -736
```

A3 → R1 → A4 → P3.

별도 Calibration 목표 없음.

현재 Foundation이 있다면
자연스럽게 작동할 뿐.

### Z3 — Express Preview / Exit

```text
Y -736 ~ -896
```

A5 → P4.

Background에 4-5 Express Shaft의
큰 수직 Void / pressure conduit를 Preview.

Threat 없음.

---

## 8. 좌표 / 오브젝트

전부:

```text
HYPOTHESIS — BLOCKOUT
```

### 8-1. Landing / Deck

| ID | Center | Size | Role |
|---|---:|---:|---|
| P0 | `(-352, 0)` | `320×32` | Entry / Decompression |
| P1 | `(-160, -192)` | `320×32` | Quiet Service Deck |
| P2 | `(0, -384)` | `448×32` | Routing Overview / Story Deck |
| R1 | `(+192, -608)` | `256×24` | Quiet Recovery |
| P3 | `(-96, -736)` | `288×32` | Upper Service Deck |
| P4 | `(+320, -832)` | `384×32` | Final Safe Deck / Express Preview |

### 8-2. Grapple Targets

| ID | Position | Role |
|---|---:|---|
| A1 | `(-256, -128)` | Entry Brace |
| A2 | `(+128, -320)` | Routing Deck Approach |
| A3 | `(+224, -512)` | Upper Service Joint 1 |
| A4 | `(-32, -672)` | Upper Service Joint 2 |
| A5 | `(+160, -800)` | Final Express Brace |

### 8-3. Routing Display

```text
N1
(+176, -384)
```

Type:

```text
routing-status-display
```

Gameplay:

```text
collision:false
grappleable:false
interaction NOT REQUIRED
```

P2 진입 Story Trigger와 연결되는 Presentation object 후보.

### 8-4. Gate

```text
Panel
(+400, -800)

Gate
(+512, -832)
```

완전 Safe.

---

## 9. Safe Route

### Route

```text
P0
→ A1
→ P1
→ A2
→ P2
→ A3
→ R1
→ A4
→ P3
→ A5
→ P4
```

### Distance Pre-check

| Link | Distance |
|---|---:|
| P0 → A1 | `160.0 px` |
| A1 → P1 | `115.4 px` |
| P1 → A2 | `315.2 px` |
| A2 → P2 | `143.1 px` |
| P2 → A3 | `258.0 px` |
| A3 → R1 | `101.2 px` |
| R1 → A4 | `233.0 px` |
| A4 → P3 | `90.5 px` |
| P3 → A5 | `263.9 px` |
| A5 → P4 | `163.2 px` |

### Result

```text
MAX SAFE LINK
= 315.2 px

CURRENT DERIVED HOOK REACH
= 400 px

MARGIN
= 84.8 px
```

### Why Short

4-4는 Reach Test가 아니다.

Player의 시선은:

```text
WORLD STATUS
```

에 가야 한다.

### `swingImpulse = 0`

Runtime graybox에서 Safe Route는:

```text
swingImpulse = 0
```

PASS해야 한다.

---

## 10. Flow Route

### Route

```text
P0
→ A1
→ P1
→ A2
→ A3
→ A4
→ A5
→ P4
```

P2 / R1 / P3 landing을 일부 생략 가능.

### 주요 거리

```text
P1 → A2
315.2 px

A2 → A3
214.7 px

A3 → A4
301.9 px

A4 → A5
230.8 px

A5 → P4
163.2 px
```

### Result

```text
MAX FLOW LINK
= 315.2 px
```

### Important Story Contract

P2 Story Trigger를 landing 기반으로 만들면
Flow Route가 Story를 skip할 수 있다.

따라서 S1 Routing Story는:

```text
P2 주변 넓은 traversal trigger volume
```

으로 설계한다.

Flow Route도 반드시 통과.

단 Player movement를 강제로 멈추지 않는다.

---

## 11. Foundation / Build Expression

### Foundation Runtime

현재 실제:

```text
IMPULSE
RELAY
SHEAR
```

세 Foundation이 존재한다.

### IMPULSE COIL

4-4에서는:

```text
A2 → A3
A4 → A5
```

Release momentum으로 landing을 자연스럽게 생략할 수 있다.

### RELAY LINK

정상 Release 이후:

```text
0.65 sec Relay Window
```

으로 A2 → A3 → A4 연결이 부드러워질 수 있다.

### SHEAR CURRENT

Enemy가 없으므로:

```text
OFFENSE VALUE
= NONE IN 4-4
```

문제 아님.

Rest Stage마다 세 Build의 전투 가치를 억지로 동등화하지 않는다.

### Diagnostic의 의미

4-4는 Player에게:

```text
“내 Foundation이 여전히 유지되고 있다.”
```

를 자연스럽게 느끼게 할 뿐이다.

Foundation 변경 UI를 열지 않는다.

### Build Lock

```text
NONE
```

Foundation이 없는 테스트 상태에서도
Mandatory Geometry는 통과 가능해야 한다.

---

## 12. Growth Decision — HOLD

### Current Decision

```text
NEW FOUNDATION
NO

FIRST SPECIALIZATION COMPLETION
NO

SECOND SPECIALIZATION
NO

SECONDARY AUGMENT
NO

HYBRID
NO

LEGACY ARTIFACT
NO
```

### Why

현재 Specialization은:

```text
Node skeleton
= exists

actual content/effects
= pending
```

이다.

완료되지 않은 첫 Specialization 위에
새 성장 Tier를 얹지 않는다.

### Future Slot

4-4는 향후 Growth cadence를 재설계할 때
후보 위치로 다시 검토 가능.

하지만 현재 Canonical:

```text
NO NEW REWARD
```

이다.

---

## 13. Recovery / Failure

### Threat

```text
NONE
```

따라서 4-4 Recovery는
Combat recovery가 아니라 이동 실수 복구용.

### R1

Upper service section의 안전 Landing.

### Lower Recovery

P1 / P2가 넓어
Release miss를 자연스럽게 받는다.

### Target

단일 miss 후:

```text
≤ 4 sec
```

안에 원래 진행 높이 복귀.

### Full Reset

P0까지 떨어지는 구조 금지.

### No Damage Floor

4-4에서는 낙하를 Damage Hazard로 쓰지 않는다.

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

### Wind / Wake

```text
NONE
```

### Scanner

```text
NONE
```

### Moving Surface

```text
NONE
```

### Damage Floor

```text
NONE
```

### Why

4-4에서 Player가 읽어야 하는 변화는:

```text
NETWORK INFORMATION
```

하나뿐이어야 한다.

---

## 15. Camera

모두 HYPOTHESIS.

### C0 — Decompression

```text
P0 / A1 / P1
Desktop 1.00
Mobile  0.72
```

공간이 갑자기 조용해졌음을 느끼게 함.

### C1 — Routing Overview

```text
A2 / P2 / N1
Desktop 0.95
Mobile  0.72
```

N1 status text와
Player / Hook을 동시에 읽을 수 있어야 한다.

### C2 — Upper Service Spine

```text
A3 / R1 / A4 / P3
Desktop 0.95
Mobile  0.72
```

### C3 — Express Preview

```text
A5 / P4 / Gate
+
large 4-5 shaft background

Desktop 0.92
Mobile  0.70
```

### Camera Rule

Story 때문에 Player를 멈추거나
과도하게 Zoom-in하지 않는다.

---

## 16. Story Trigger Contract

### Trigger S0

P0 / P1 traversal.

```text
INFRASTRUCTURE SERVICE NODE
LOCAL CONTROL AVAILABLE
```

### Trigger S1 — MANDATORY

P2 주변 넓은 crossing volume.

```text
LOWER ASCENT FEEDER
STATUS: SEGMENTED
TELEMETRY: PARTIAL
```

### Trigger S2

P4 approach.

```text
EXPRESS SHAFT
SERVICE CHANNEL OPEN
```

### Multiplayer

Story trigger는 Player별 이동 차이 때문에
한 Player의 빠른 통과가 다른 Player를 강제 teleport하거나
Control을 멈추게 하면 안 된다.

Presentation은 shared world fact여도
movement ownership은 각 Player 유지.

---

## 17. Pixel Art Asset Spec

### Primary Visual Object

```text
ROUTING STATUS DISPLAY
```

크기 후보:

```text
96×64 ~ 160×96
```

### Visual Language

Transit schematic:

- main trunk solid line
- feeder segments divided
- incomplete telemetry marks
- neutral system white
- muted amber abnormal status

### 금지

- Group A/B/C color mapping
- Priority lane icon
- skull / evacuation casualty icon
- red X that implies deliberate shutdown
- executive authorization badge

### Service Node

3-5 Calibration Node처럼 보이면 안 된다.

4-4는:

```text
NETWORK CONTROL / TELEMETRY
```

장소다.

### Gameplay Targets

Rope / Hook Cyan priority 유지.

---

## 18. Background / Environment

### Near

- service cable trays
- routing panels
- quiet inspection lighting
- static maintenance rails

### Mid

- feeder conduit split
- relay cabinet
- signal bus

### Far / Exit

4-5 Express Shaft:

- huge vertical void
- pressure duct spine
- distant express frame
- long uninterrupted shaft lines

### Motion

4-4 내부는 움직임을 줄인다.

Exit background에서만
4-5 Wake를 암시하는:

- distant dust pull
- slow indicator pulse

정도 허용.

실제 Gameplay Wind는 없음.

---

## 19. Sound / VFX

### Ambient

4-3보다 크게 낮춘다.

```text
low transformer hum
soft relay click
quiet ventilation
```

### Routing Display

S1 trigger 때:

```text
single soft diagnostic tone
```

정도.

Alarm 사용 금지.

### Why

`SEGMENTED`는 이상징후이지
즉시 위기 경보가 아니다.

### Exit Preview

P4 근처에서 4-5 방향의:

```text
distant pressure rumble
```

을 조금씩 올린다.

---

## 20. Implementation Notes

### Runtime Area ID

```text
sector-04-04
```

### Stable ID Prefix

```text
sector-04-04:*
```

### Candidate Surface IDs

```text
sector-04-04:p0
sector-04-04:p1
sector-04-04:p2
sector-04-04:r1
sector-04-04:p3
sector-04-04:p4

sector-04-04:a1-surface
sector-04-04:a2-surface
sector-04-04:a3-surface
sector-04-04:a4-surface
sector-04-04:a5-surface
```

### Routing Display

```text
sector-04-04:routing-status-display
```

Gameplay interaction:

```text
NONE REQUIRED
```

### Story Cue IDs — 후보

```text
sector-04-04:service-node-online
sector-04-04:lower-feeder-segmented
sector-04-04:express-shaft-open
```

### Objective

권장:

```text
reach final deck
→ Gate Panel
```

Routing Display inspection은 Objective가 아니다.

### Gate

```text
sector-04-04:gate
→ sector-04-05
```

Sector04 runtime catalog가 실제 구현될 때 연결.

---

## 21. Timer / Checkpoint / Progress Contract

### Sector General Timer

4-4에 들어왔다고:

```text
PAUSE
RESET
```

하지 않는다.

### Gate

기존 Sector Timer / Gate 규칙을 그대로 따른다.

### Design Checkpoint

```text
NONE
```

### Runtime Progress Anchor

향후 authored world assembler가 Area entry checkpoint를 생성한다면
그것은:

```text
runtime progress / respawn anchor
```

이지 성장 Reward가 아니다.

### Health

새 Heal Station을 만들지 않는다.

Current general game recovery contract 외
4-4 전용 Health refill 없음.

---

## 22. Multiplayer Contract

### No Shared Selection

4-4에는:

```text
augment choice
specialization choice
reward choice
```

가 없다.

따라서 Player 간 선택 lock / race 없음.

### Routing Story

각 Player가 S1 traversal volume을 지나며
동일 World Fact를 볼 수 있어야 한다.

### Gate

현재 계약:

```text
shared open
individual physical crossing
```

유지.

### Different Pace

Player A가 P4까지 먼저 가도
Player B는 P2 Story Deck에서 자유롭게 움직일 수 있어야 한다.

강제 party teleport 없음.

---

## 23. Playtest Metrics

### Rest Rhythm

```text
stage clear time
idle time on P2
landing count
fall / recovery count
```

### Story Read

```text
S1 trigger exposure time
players who stop near N1
players who pass without stopping
```

Stopping은 필수가 아니다.

### Build Continuity

Foundation별:

```text
release count
relay-assisted attach count
impulse event count
```

현재 metrics가 지원할 경우 참고.

Shear는 Enemy가 없어 0이어도 정상.

### Desired Result

4-3보다:

```text
combat input density
↓

story observation
↑
```

가 명확해야 한다.

---

## 24. PASS Criteria

### Gameplay

- 4-3 이후 즉시 압력이 낮아짐
- Enemy / Cutter / Wake / Scanner 전부 없음
- Safe Route max 315.2px
- Flow Route max 315.2px
- 모든 Hook Link < 400px
- `swingImpulse=0` Safe Route graybox PASS
- no new input
- no new Rope mode
- no new growth
- no mandatory terminal interaction
- no Health refill invention
- no Timer pause invention
- Foundation 선택 유지
- first Specialization required 아님

### Repetition

- 3-5 Calibration Room 반복 아님
- 4-4 primary object = Routing Status Display
- explicit Build Calibration Node 없음

### Story

Player가 알아야 함:

```text
LOWER ASCENT FEEDER
STATUS: SEGMENTED
TELEMETRY: PARTIAL
```

Player가 아직 몰라야 함:

```text
ISOLATED
why segmented
who decided
Group C causal relation
```

### Production

- 4-5 Express Shaft preview 존재
- Approved Gameplay Art HOLD
- Sector04 authored runtime 아직 미구현임을 유지

---

## 25. FAIL Conditions

### Gameplay

- Rest Stage인데 새 Upgrade Menu가 열림
- Terminal을 눌러야 Gate가 열림
- Foundation reroll / respec 제공
- Timer 정지
- HP 자동 회복
- Cutter / Wind / Patrol 재등장
- 400px 이상 Hook Link 존재
- 4-3보다 플레이 시간이 더 길어짐
- Routing Story를 읽기 위해 Player control을 오래 잠금

### Repetition

- 3-5처럼 Calibration Frame을 중심으로 Stage 구성
- 2-3처럼 Specialization 선택 Node 사용
- 1-4처럼 Foundation 선택 재실행

### Story

- `LOWER ASCENT FEEDER ISOLATED` 조기 공개
- `SEGMENTED = intentional shutdown` 확정
- Group C를 Lower Feeder에 직접 매핑
- Executive / Corporate order 공개
- 사고 고의성 암시를 사실로 확정

### Runtime

- Legacy Artifact system 다시 가정
- first Specialization effect 구현 완료라고 가정
- legacy fixed Rope-range assumption 재사용
- moving train / moving surface 추가

---

## 26. 개발자 최종 전달 요약

### Stage

```text
SECTOR 04-4
INFRASTRUCTURE SERVICE NODE
```

### Role

```text
REST
+
ROUTING DIAGNOSTIC
+
STORY SETUP
+
4-5 EXPRESS PREVIEW
```

### Threat

```text
NONE
```

정확히:

```text
Enemy 0
Cutter 0
Wind 0
Scanner 0
Moving Surface 0
```

### Geometry

```text
SAFE MAX
315.2 px

FLOW MAX
315.2 px

CURRENT HOOK REACH
400 px
```

### Story Beat

```text
LOWER ASCENT FEEDER
STATUS: SEGMENTED
TELEMETRY: PARTIAL
```

반드시 Traversal에서 보지만
Player를 강제로 멈추지 않는다.

### Growth

```text
CURRENT FOUNDATION
KEEP

NEW GROWTH
NONE

FIRST SPECIALIZATION
NOT REQUIRED

LEGACY ARTIFACT
NONE
```

### REST Means

```text
NO THREAT
```

이지:

```text
NO TIMER
FREE HEAL
FREE REWARD
```

가 아니다.

### Exit

```text
EXPRESS SHAFT
SERVICE CHANNEL OPEN
```

→ 4-5.

### Stage Feeling

> **“잠깐 숨을 돌렸는데, 이 도시의 Lower Ascent 쪽 상태가 단순 고장처럼 보이지 않기 시작한다.”**

---

## OPEN QUESTIONS

### 1. `SEGMENTED` 최종 문구

현재 후보:

```text
STATUS: SEGMENTED
TELEMETRY: PARTIAL
```

Story 의미는 적절하지만
한국어/영문 UI에서 너무 기술적으로 느껴지면:

```text
SEGMENT STATUS
PARTIAL LINK
```

계열로 조정 가능.

단:

```text
ISOLATED
```

는 4-7 전까지 금지.

### 2. Routing Display Interaction

기본안:

```text
AUTO TRAVERSAL STORY
NO INTERACTION
```

이다.

추후 Story terminal presentation이 구현돼도
4-4 Gate Key로 만들지 않는다.

### 3. Foundation Persistent HUD

현재 Foundation Runtime은 존재하지만
4-4에서 별도 Build Diagnostic HUD를 새로 만들 필요는 없다.

향후 persistent Foundation HUD가 생기면
P2 Rest Deck에서 자연스럽게 확인되는 정도로만 활용.

### 4. First Specialization

2-3 Specialization content가 실제 구현되기 전까지
4-4는 그것을 Story/UI/Geometry 어디에도 요구하지 않는다.

향후 구현돼도 4-4는 선택 지점이 아니라 Carry-only Stage 유지 권장.

### 5. 4-3 Runtime Handoff

4-3은 PR #498로 GitHub merge 완료.

현재 4-4는 4-3의:

```text
FREIGHT SERVICE ROUTE
LIMITED OPERATION
```

Exit Story 이후 Decompression으로 이어진다.

향후 4-3 실제 Runtime geometry가 구현되면:

- Gate arrival position
- camera handoff
- first 4-4 P0 framing

만 다시 검증.

### 6. 4-5 Express Shaft

4-5 상세 설계에서 4-4 P4 Background Preview와
실제 첫 Camera Shot이 동일한 spatial promise를 주는지 검증.

### 7. Sector Timer Feel

REST Stage인데 Timer가 계속 흐르는 것이 과도한 압박으로 느껴지면
4-4 전용 pause를 만들기보다:

```text
Gate replenish amount
Sector timer tuning
Stage traversal length
```

을 먼저 조정한다.

---

SECTOR 04-4 / INFRASTRUCTURE SERVICE NODE — BLOCKOUT CANDIDATE · REV 1.0
