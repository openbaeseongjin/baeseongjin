# SECTOR 04-1 — TRANSIT INTAKE

*BLOCKOUT CANDIDATE · REV 1.0*

◀ PREV — POST-SECTOR 03 BOSS / TRANSITION TBD · NEXT — [SECTOR 04-2 / CUTTER LINE](../4-2/README.md) ▶

`SECTOR 04 TRANSIT / INFRASTRUCTURE` · `STAGE 01` · `SPEED SPACE REVEAL` · `PURE ROPE FLOW`

| 항목 | 기준 |
|---|---|
| Status | HYPOTHESIS — BLOCKOUT CANDIDATE |
| Difficulty | ★★☆ |
| Expected First Playtime | 105–150 sec |
| Expected Skilled Clear | 40–60 sec |
| Enemy | NONE |
| Cutter Fire | NONE |
| Transit Wake / Wind | NONE |
| Scanner | NONE |
| Moving Platform / Train Collision | NONE |
| New Mechanic | NONE |
| New Enemy Behavior | NONE |
| New Input | NONE |
| New Rope Mode | NONE |
| New Augment | NONE |
| Artifact Reward | NONE |
| Required Kill | NONE |
| Design Checkpoint / Reward | NONE |
| Boss | NONE |
| Design Carry Build | Foundation + first Specialization KEEP — runtime pending |
| Primary Role | Sector 04 첫 대형 이동 스케일 + 순수 Momentum 표현 |
| Primary Space | Vertical Transit Intake Shaft / Structural Truss Backbone |
| Exit | Reach Final Deck → Gate Panel → Gate Open → Physical Crossing |
| Runtime Status | Sector 04 authored runtime NOT CONNECTED |
| Art Status | HOLD until Runtime Area / Camera Zone / Stable IDs exist |

---

## 0. 기획 기준

### LOCKED FOR THIS STAGE

4-1은 Sector 04의 첫 일반 Stage다.

이 Stage의 역할은:

```text
CUTTER를 가르치는 것
아님

TRANSIT WAKE를 가르치는 것
아님

MOVING TRAIN을 보여주는 것
아님
```

이다.

오직:

```text
COMMERCIAL의 짧고 조밀한 판단 공간
↓
TRANSIT의 길고 열린 이동 공간
```

으로 감각을 전환한다.

### Core Question

> **“착지를 줄이고 Rope를 계속 이어 쓰면 얼마나 빠르고 크게 움직일 수 있는가?”**

### Sector 04 전체 흐름 안에서

```text
4-1
SPEED SPACE REVEAL

↓

4-2
FIRST CUTTER FIRE

↓

4-3
CUTTER + TRANSIT WAKE
```

따라서 4-1에서
4-2 / 4-3의 학습을 미리 소비하지 않는다.

### 금지

- Enemy
- Projectile
- Rope Cut
- Transit Wake
- Wind
- Scanner
- Security Shutter
- Moving Platform
- Moving Train Collision
- Moving Grapple Surface
- Damage Floor
- Timed Door
- New Input
- New Rope Mode
- New Growth
- Kill Gate
- Story exposition
- Lower Feeder Isolation reveal

---

## 0-1. 최신 GitHub / Runtime 교차검증

### VERIFIED — CURRENT MAIN

최종 작성 기준 최신 `main`:

```text
fc84c49342364b15fe9a203ba06610de64bb21d6
```

최근 변경은 Access Scan Field 문서 cross-reference 정리다.

Sector 04 Runtime / Rope physics / Gate contract를 바꾸는 변경은 아니다.

### VERIFIED — CURRENT AUTHORED RUNTIME

현재 `CurrentAuthoredAreaCatalog.js`:

```text
SECTOR 01
+
SECTOR 02
```

만 assemble.

Revision:

```text
sector-01-rev3-sector-02-rev1-v2
```

따라서:

```text
SECTOR 03
= design docs ahead of runtime

SECTOR 04
= not connected
```

4-1 좌표는 모두:

```text
HYPOTHESIS — BLOCKOUT DATA
```

다.

### VERIFIED — CURRENT ROPE

```text
Player Radius            15
Gravity                  1250
Max Horizontal Speed     360
Jump Speed               440

Rope Max Attach Distance 440
Attach Buffer             0.10 sec
Swing Drag Min Hold       0.08 sec
Swing Impulse             780
Release Angular Transfer  0.55
```

### LOCKED BLOCKOUT VALIDATION

실제 Runtime은:

```text
swingImpulse = 780
```

이지만 Mandatory Safe Route는:

```text
swingImpulse = 0
```

에서도 통과해야 한다.

본 문서는 거리 topology를 먼저 검증한다.

실제 물리 시뮬레이션 PASS는
Runtime graybox에서 별도 확인한다.

### VERIFIED — CURRENT GATE CONTRACT

현재 진행 흐름:

```text
objective complete
→
Gate Panel contextual interact
→
Gate unlocked
→
Player physically enters Gate trigger
→
next area
```

4-1도 동일.

새 PC 키 추가 없음.

Panel은:

```text
W / ↑
```

계열 contextual interact와
모바일 Jump 입력 재사용.

### IMPORTANT — PREV BOUNDARY

현재 3-8은:

```text
POST-SECTOR 03 TRANSITION / BOSS FLOW TBD
```

로 끝난다.

따라서 4-1 문서는:

```text
3-8 → 4-1
```

직접 연결을 확정하지 않는다.

4-1 Entry Deck의 내부 구조만 설계한다.

---

## 0-2. Sector 04 Master Plan 교차검증

4-1의 Master Role:

```text
TRANSIT INTAKE
Speed Space Reveal
Enemy NONE
Static Infrastructure
Growth NONE
```

### Master Core

Sector 04 전체 질문:

```text
MOMENTUM
→ INTERRUPTION
→ RECOVERY
→ MOMENTUM
```

하지만 4-1에는 아직:

```text
INTERRUPTION
```

을 넣지 않는다.

먼저 Player에게:

```text
MOMENTUM 자체가 즐거운 상태
```

를 만든다.

그래야 4-2의 Cutter가
무엇을 빼앗는 Threat인지 느낄 수 있다.

### Sector 03 Mechanic Carry

```text
ACCESS SCAN FIELD
= NOT REQUIRED
```

4-1에서 Scanner timing을 요구하지 않는다.

---

## 0-3. Reference Transfer

### SANABI — TRANSFER

같은 Chain / Hook 행동이
이동과 이후 Threat 대응을 계속 담당한다는 원칙을 유지.

4-1에서는 전투를 제거하고:

```text
ATTACH
→ SWING
→ RELEASE
→ RE-ATTACH
```

자체의 속도감을 먼저 크게 보여준다.

### Rusted Moss — TRANSFER

같은 Grapple 공간에서:

```text
SAFE ROUTE
+
FLOW ROUTE
```

를 동시에 허용.

숙련자는 착지를 줄이고,
초행자는 Recovery Deck을 사용한다.

### Celeste / N 계열 — TRANSFER

Speed Stage라도:

```text
blind reaction
exact max-range
long punitive reset
```

을 요구하지 않는다.

---

## 1. 한 줄 정의

Post-Sector 03 Transition을 통과한 Player가
처음으로 도시의 거대한 **Transit Backbone Intake Shaft**에 진입해,
적·Scanner·Wind 없이 멀리 보이는 구조 Truss 사이를 Rope로 연속 연결하고,
안전한 Service Recovery Deck을 밟아도 되지만 숙련자는 거의 착지하지 않은 채
A1 → A6을 큰 진자와 Release로 이어 올라가며,
**Upper Express Trunk가 완전히 죽지 않고 제한 운용 중임**을 확인한 뒤
첫 Security Line 구역인 4-2로 진입하는 Sector 04 도입 Stage.

---

## 2. 전체 게임에서의 역할

### 2-1. Mechanical Reset

3-8은:

```text
Scanner
+
2 Patrol Drones
+
Free-Weave route reading
```

으로 높은 판단 밀도를 가진다.

4-1은 의도적으로:

```text
NO ENEMY
NO SCANNER
NO WAKE
```

로 비운다.

목적:

> **“내 Build와 Rope만으로 크게 움직이는 게 다시 재미있다.”**

를 느끼게 한다.

### 2-2. Scale Shift

Commercial:

```text
Atrium
Balcony
Service Route
Market Gate
```

에서:

```text
Transit Shaft
Structural Truss
Freight Backbone
Power Conduit
```

로 규모가 커진다.

Player는 시각적으로 더 작아진다.

### 2-3. 4-2 Setup

4-1에서 Player는:

```text
LONG ROPE FLOW
```

에 익숙해진다.

4-2 Cutter는 바로 그 Flow를:

```text
CUT
```

한다.

따라서 Cutter의 의미가 선명해진다.

---

## 3. Story 역할

### 3-1. 시작 질문

Sector 03 종료 질문:

> **“이 Access 규칙과 대피 결과는 어떤 관계였고, 누가 그 규칙을 만들었지?”**

4-1은 답하지 않는다.

대신 첫 번째 물리적 관찰만 추가:

> **“이 도시의 상부 Transit Backbone은 완전히 죽은 게 아니다.”**

### 3-2. Entry Display

```text
TRANSIT BACKBONE

SERVICE DEGRADED
```

### 3-3. Mid Display

```text
UPPER EXPRESS TRUNK

LIMITED OPERATION
```

### 3-4. Exit Preview

```text
INFRASTRUCTURE SECURITY
ACTIVE

SERVICE LINE
AHEAD
```

### 아직 금지

4-1 Story Contract:

```text
LOWER ASCENT FEEDER
ISOLATED
=
NOT SHOWN IN 4-1
```

해당 Reveal은 4-7 소유다.

그 정보는 4-4에서 이상징후를 만들고
4-7에서 확정 Reveal한다.

또:

- Group A/B/C와 Transit Route 연결
- Priority 이용자 정체
- Corporate order
- deliberate sacrifice

모두 금지.

---

## 4. 공간 콘셉트

### TRANSIT INTAKE SHAFT

하나의 거대한 수직 인프라 Intake.

핵심은:

```text
ROOM
→ ROOM
```

이 아니라:

```text
ONE CONTINUOUS BACKBONE
```

이다.

### 공간 요소

- giant vertical rail frame
- diagonal maintenance truss
- freight cable bundle
- express conduit
- pressure duct
- distant signal bridge
- service ledge
- inspection deck

### Gameplay Layer

실제 움직이는 구조 없음.

```text
STATIC COLLISION
+
STATIC GRAPPLE TARGET
```

만 사용.

### Background Motion

Gameplay와 무관한:

- distant light sequence
- cable vibration
- rotating machinery
- far rail signal sweep

정도만 허용.

---

## 5. Pixel / Grid 기준

### Base Grid

```text
32×32
```

### Map Hypothesis

```text
WIDTH
1600 px

X
-800 ~ +800

HEIGHT
1376 px

Y
0 ~ -1376
```

### Gameplay Surface

- Main Deck: 32px
- Recovery Ledge: 16px
- Grapple Target gameplay footprint: current 24×24 family
- Final Deck: 32px

### Structural Art Scale

- Rail Truss: 128–256px module
- Conduit Cluster: 64–128px
- Signal Frame: 32–64px
- Giant Far Shaft: screen-scale

### Readability

Gameplay Anchor 주위:

```text
32~48px CLEAN ZONE
```

유지.

Far infrastructure가
Anchor처럼 보이지 않게 한다.

---

## 6. 전체 맵 구조

```text
Y = 0
┌────────────────────────────┐
│ P0 — ENTRY / INTAKE DECK   │
│          A1                │
│      R1        A2          │
│                  R2        │
│                      A3    │
│             M1             │
│        A4                  │
│      R3                    │
│                 A5         │
│                    P4      │
│                       A6   │
│                       P5   │
│                  PANEL GATE│
└────────────────────────────┘
Y = -1376
```

### Stage Shape

단순한 좌우 Zig-Zag가 아니라
큰 Transit Structure 안에서:

```text
LEFT LOWER INTAKE
→
CENTER TRUSS
→
RIGHT EXPRESS FRAME
→
CENTER SERVICE SPINE
→
LEFT RELAY
→
RIGHT UPPER TRUNK
```

으로 공간 규모를 읽게 한다.

---

## 7. Zone 구성

### Z0 — Intake Reveal

```text
Y 0 ~ -224
```

목적:

- Player smallness
- A1 확인
- 상부 Shaft depth
- Entry story

Threat:

```text
NONE
```

### Z1 — Lower Long Span

```text
Y -224 ~ -560
```

A1 → A2.

처음으로:

```text
landing 없이 2 Rope
```

를 이어보는 Flow 선택.

R1 / R2가 안전 경로 제공.

### Z2 — Cross-Trunk

```text
Y -560 ~ -864
```

A3 → M1 → A4.

Background express frame이
왼쪽에서 오른쪽으로 큰 사선을 만든다.

Threat 없음.

### Z3 — Upper Relay

```text
Y -864 ~ -1184
```

R3 → A5 → P4.

Safe Route에서 가장 긴 연결도
440보다 충분히 작게 유지.

### Z4 — Exit Trunk

```text
Y -1184 ~ -1376
```

A6 → P5.

Gate Panel은 완전 안전.

---

## 8. 좌표 / 오브젝트

모두:

```text
HYPOTHESIS — BLOCKOUT
```

### 8-1. Collision / Landing Surface

| ID | Center / top-center | Size | Role |
|---|---:|---:|---|
| P0 | `(-560, 0)` | `352×32` | Entry / Safe Deck |
| R1 | `(-192, -320)` | `192×16` | Lower Recovery |
| R2 | `(+160, -512)` | `192×16` | Lower Recovery |
| M1 | `(+96, -704)` | `256×32` | Mid Service Deck |
| R3 | `(-160, -928)` | `192×16` | Upper Recovery |
| P4 | `(+320, -1120)` | `288×32` | Upper Inspection Deck |
| P5 | `(+480, -1312)` | `416×32` | Final Safe Deck |

### 8-2. Grapple Target

| ID | Position | Meaning |
|---|---:|---|
| A1 | `(-352, -192)` | Intake Crossbeam |
| A2 | `(0, -352)` | Central Rail Brace |
| A3 | `(+288, -592)` | Express Frame Node |
| A4 | `(-64, -800)` | Service Spine Joint |
| A5 | `(+192, -1056)` | Upper Relay Joint |
| A6 | `(+448, -1248)` | Final Trunk Brace |

### 8-3. Entry

```text
ENTRY
(-640, -32)
```

P0 위.

Exact post-Boss spawn contract는
Post-Sector 03 transition 확정 후 조정.

### 8-4. Gate

```text
Gate Panel
(+560, -1312)

Gate Door
(+672, -1312)

Portal / Exit
near (+672, -1344)
```

Panel과 Gate는 P5 위에 있다.

### 8-5. Non-Gameplay World Objects

- Transit Backbone Status Display
- Upper Express Trunk Indicator
- Far Freight Rail Frame
- Power Conduit Stack
- Ventilation Motor
- Signal Mast
- Cable Tensioner

전부:

```text
gameplay:false
```

unless later implementation explicitly promotes one.

---

## 9. Safe Route

### Route

```text
P0
→ A1
→ R1
→ A2
→ R2
→ A3
→ M1
→ A4
→ R3
→ A5
→ P4
→ A6
→ P5
```

### Distance Pre-check

| Link | Distance |
|---|---:|
| P0 → A1 | `283.1 px` |
| A1 → R1 | `204.9 px` |
| R1 → A2 | `194.6 px` |
| A2 → R2 | `226.3 px` |
| R2 → A3 | `150.9 px` |
| A3 → M1 | `222.3 px` |
| M1 → A4 | `186.6 px` |
| A4 → R3 | `160.0 px` |
| R3 → A5 | `374.5 px` |
| A5 → P4 | `143.1 px` |
| P4 → A6 | `181.0 px` |
| A6 → P5 | `71.6 px` |

### Result

```text
MAX SAFE LINK
= 374.5 px

ROPE MAX
= 440 px
```

Range margin:

```text
65.5 px
```

### Mandatory Contract

Safe Route는:

```text
swingImpulse = 0
```

에서도 실제 graybox simulation으로 통과 가능해야 한다.

거리만 PASS하고 실제 physics가 FAIL하면:

```text
geometry 수정
```

이 우선.

Swing Impulse를 mandatory escape key로 사용하지 않는다.

---

## 10. Flow Route

### Skilled Route

```text
P0
→ A1
→ A2
→ A3
→ A4
→ A5
→ A6
→ P5
```

Recovery Deck 대부분 생략.

### Distance

| Link | Distance |
|---|---:|
| P0 → A1 | `283.1 px` |
| A1 → A2 | `386.7 px` |
| A2 → A3 | `374.9 px` |
| A3 → A4 | `408.9 px` |
| A4 → A5 | `362.0 px` |
| A5 → A6 | `320.0 px` |
| A6 → P5 | `71.6 px` |

### Result

```text
MAX FLOW LINK
= 408.9 px
```

440px보다 작다.

하지만 이 Route는:

```text
OPTIONAL EXPRESSION
```

이다.

A3 → A4처럼 400px대 연결을
Mandatory Safe Route에 요구하지 않는다.

### Desired Feel

```text
large arc
→ clean release
→ airborne re-attach
→ no forced landing
```

---

## 11. Build Expression

Design State:

```text
FOUNDATION
+
FIRST SPECIALIZATION
KEEP
```

Runtime effect는 아직 pending일 수 있다.

따라서 Build effect는:

```text
OPTIONAL ADVANTAGE
```

다.

### IMPULSE COIL

4-1에서 가장 즉시 읽히는 Build.

- A1 → A2 large arc
- A2 → A3 carry
- landing skip
- upper flow speed

### RELAY LINK

- A1 → A2
- A2 → A3
- A3 → A4

airborne re-attach chain에서
더 자연스럽게 드러남.

### SHEAR CURRENT

Enemy가 없으므로
공격 가치는 일부러 검증하지 않는다.

이 Stage에서 Shear가:

```text
약해 보이는 것
```

은 문제 아님.

Sector 전체 Build parity를
매 Stage마다 억지로 맞추지 않는다.

4-2 이후 Enemy geometry에서 다시 표현.

### Build Lock

NONE.

---

## 12. Recovery

### Philosophy

4-1은 Speed Reveal이지만
실패를 큰 낙하로 벌하지 않는다.

### Recovery Surfaces

```text
R1
R2
M1
R3
P4
```

### Failure Example

A2 → A3 Release 실패:

```text
R2
or
M1
```

로 회수.

A4 → A5 실패:

```text
R3
```

회수.

A5 → A6 실패:

```text
P4
```

회수.

### Target

대부분 실패 후:

```text
≤ 5 sec
```

안에 원래 높이대 Flow 재진입.

### No Damage Floor

낙하 자체가:

```text
automatic damage
```

를 주는 Stage가 아니다.

### Full Reset

단순 Release miss 하나로
P0까지 내려가면 FAIL.

---

## 13. Enemy / Hazard

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

### Sentry

```text
NONE
```

### Wind / Transit Wake

```text
NONE
```

### Scanner

```text
NONE
```

### Moving Platform

```text
NONE
```

### Why

4-1의 유일한 Challenge는:

```text
ROPE FLOW QUALITY
```

여야 한다.

---

## 14. Camera

모든 값:

```text
HYPOTHESIS
```

### C0 — Intake Reveal

```text
Y 0 ~ -224
Desktop ~0.95
Mobile  ~0.72
```

보여야 함:

- P0
- Player
- A1
- A2 일부
- giant far shaft

### C1 — Lower Long Span

```text
Y -224 ~ -560
Desktop ~0.90
Mobile  ~0.70
```

보여야 함:

- 현재 Anchor
- 다음 Anchor
- Recovery Deck 최소 1개

### C2 — Cross-Trunk

```text
Y -560 ~ -864
Desktop ~0.88
Mobile  ~0.70
```

Stage에서 가장 넓은 구조 스케일.

A3 / M1 / A4 동시 읽기 목표.

### C3 — Upper Relay

```text
Y -864 ~ -1184
Desktop ~0.90
Mobile  ~0.70
```

R3 / A5 / P4.

### C4 — Exit

```text
Y -1184 ~ -1376
Desktop ~1.00
Mobile  ~0.72
```

A6 / P5 / Panel / Gate가 명확.

### Camera Rule

Speed감을 위해
무조건 zoom-out하지 않는다.

항상:

```text
PLAYER
+
NEXT ANCHOR
+
RECOVERY OPTION
```

이 우선.

---

## 15. Story Trigger

### S0 — Entry

P0 진입.

```text
TRANSIT BACKBONE

SERVICE DEGRADED
```

### S1 — Mid Trunk

M1 접근.

```text
UPPER EXPRESS TRUNK

LIMITED OPERATION
```

### S2 — Exit Preview

P5 도착.

```text
INFRASTRUCTURE SECURITY
ACTIVE

SERVICE LINE
AHEAD
```

### Story Presentation Rule

각 메시지는 짧다.

Player가 Rope Flow 중
긴 문장을 읽게 하지 않는다.

### No Reveal

```text
LOWER ASCENT FEEDER
ISOLATED
```

금지.

---

## 16. Pixel Art Asset Spec

현재는:

```text
APPROVED GAMEPLAY ART
HOLD
```

다.

아래는 Production 후보.

### Gameplay Foreground

- Intake Deck frame
- Recovery service ledge
- Inspection deck
- Grapple brace housing
- Gate / Panel

### Mid Structure

- rail truss
- power conduit bundle
- signal bridge
- cable tensioner
- vent machinery

### Far

- colossal vertical transit shaft
- distant express trunk
- secondary rail silhouette

### Grapple Housing

Gameplay target 주변은
Rope Cyan과 경쟁하지 않는
neutral steel / off-white edge.

### Warning Red

4-1에서는 Security Threat가 없으므로
Red를 과도하게 쓰지 않는다.

4-2 Cutter 대비를 위해
4-1의 위험 색 밀도를 낮춘다.

---

## 17. Background

### Far Layer

도시 규모를 보여주는:

```text
VERTICAL VOID
+
PARALLEL RAIL SILHOUETTES
+
POWER BACKBONE
```

### Mid Layer

- stationary rail frame
- rotating remote ventilation
- sequential indicator lamps
- cable vibration

### Near Decoration

- maintenance stencil
- service numbering
- conduit clamps
- inspection labels

### Motion Rule

움직이는 Background는 허용.

그러나:

```text
BACKGROUND MOTION
≠
GAMEPLAY MOVING PLATFORM
```

명확히 유지.

Player가 붙을 수 있을 것처럼 보이는
움직이는 구조 금지.

---

## 18. Sound / VFX

### Ambient

- deep rail hum
- transformer resonance
- distant metal vibration
- ventilation drone

### Rope Flow

4-1은 Enemy가 없으므로
Rope feedback가 더 잘 들려야 한다.

- attach snap
- tension rise
- release whoosh
- high-speed scarf / air cue

### Speed Feedback

속도가 높을 때:

- mild directional particles
- background streak
- scarf extension

단:

```text
screen shake spam
```

금지.

### 4-2 Foreshadow

Exit 근처에서
아주 약한 Security system hum은 가능.

Cutter charge sound 자체는
4-2에서 처음 명확히 들려준다.

---

## 19. Implementation Notes

### Runtime Area ID

후보:

```text
sector-04-01
```

### Stable ID Prefix

모든 runtime ID:

```text
sector-04-01:*
```

### Surface

예:

```text
sector-04-01:p0
sector-04-01:r1
sector-04-01:a1-surface
...
sector-04-01:p5
```

### Object

예:

```text
sector-04-01:transit-status-display
sector-04-01:express-status-display
sector-04-01:exit-panel
sector-04-01:service-gate
```

### Objective

권장:

```text
sector-04-01:final-deck-reached
sector-04-01:exit-panel-engaged
```

### Gate

```text
sector-04-01:gate
```

### Next

Design intent:

```text
sector-04-02
```

단 실제 catalog wiring은:

```text
Post-Sector03 Boss / Transition
+
Sector04 runtime integration
```

계약과 함께 한다.

### Runtime Checkpoint Distinction

이 Stage의:

```text
Design Checkpoint / Reward
= NONE
```

은 별도 Reward Node를 두지 않는다는 뜻이다.

향후 authored world integration 과정에서
공용 Runtime이 Area entry를 progress / respawn anchor로 생성한다면
그것은:

```text
runtime progress checkpoint
```

이며 4-1의 성장 보상이나 Design Reward로 해석하지 않는다.

### No New Runtime System

4-1 자체를 위해
새 physics capability를 만들지 않는다.

---

## 20. Playtest Metrics

### Core

```text
clear time
landing count
airborne time ratio
rope attach count
release count
failed attach count
fall / recovery count
```

### Key Derived

#### Landing Reduction

초행:

```text
R1 / R2 / M1 / R3 / P4
```

사용.

숙련:

```text
landing count decreases
```

해야 한다.

#### Flow Continuity

A1→A6 사이에서
Grounded 상태가 얼마나 줄어드는지.

### Build Runtime 구현 뒤

- IMPULSE landing skips
- RELAY re-attach chains
- build별 clear time

참고.

---

## 21. PASS Criteria

### Gameplay

- 20~30초 내 Sector 03과 공간 스케일 차이가 느껴짐
- Enemy 없이 Rope 자체가 재미있음
- 초행은 Recovery Deck으로 통과 가능
- 숙련자는 Recovery Deck 대부분 생략 가능
- Safe Route mandatory link ≤ 374.5px
- Flow Route max link ≤ 408.9px
- exact 440px test 없음
- Runtime blockout에서 `swingImpulse=0` Safe Route clear
- no new input
- no new Rope mode
- no Build lock
- no forced waiting
- no full-stage reset from one miss

### Story

Player가 알아야 함:

```text
Transit Backbone exists.
Upper Express Trunk still has limited operation.
```

아직 몰라야 함:

```text
Lower Feeder Isolation
who ordered routing
Group mapping
direct causality
```

### Production

- no moving platform dependency
- no Access Scan Field dependency
- Gate Panel safe
- 4-2 Cutter role preserved
- approved art still HOLD

---

## 22. FAIL Conditions

### Gameplay

- 4-1이 또 하나의 3-6 Atrium처럼 느껴짐
- Recovery Deck을 전부 밟아야만 진행
- 숙련 Route가 단순 max-range 시험
- long gap이 440px를 넘음
- swingImpulse 780 없이는 사실상 진행 불가
- fall 하나가 P0 reset으로 이어짐
- background moving object가 실제 anchor처럼 오해됨

### Progression

- Cutter를 4-1에서 발사
- Wake를 4-1에서 사용
- Moving Train을 mandatory로 사용
- Scanner를 다시 사용
- Growth reward 추가
- Artifact reward 추가

### Story

- Lower Feeder Isolation 공개
- Group C와 Transit 직접 연결
- Corporate decision 공개
- deliberate sacrifice 암시를 사실처럼 제시

### Gate

- Panel에 새 키 요구
- Rope로 Panel interact 요구
- Panel interaction 중 Threat 존재
- Gate를 4-2로 강제 teleport

---

## 23. 개발 구현 우선순위

### P0 — Geometry Only

- P0 / R1 / R2 / M1 / R3 / P4 / P5
- A1~A6
- no decoration
- no story

검증:

```text
440 range
Safe Route
Flow Route
```

### P1 — `swingImpulse=0`

Mandatory Safe Route test.

FAIL이면 좌표 수정.

### P2 — Base Runtime 780

Movement Joy test.

질문:

> 큰 공간이 실제로 더 즐거운가?

### P3 — Recovery

Miss마다:

```text
≤ 5 sec
```

재진입 확인.

### P4 — Camera

Next Anchor + Recovery 읽기.

### P5 — Gate

Reach → Panel → Gate → crossing.

### P6 — Story

3개 짧은 display.

### P7 — Multiplayer

두 Player가 서로 다른 Flow 속도로 올라가도
Gate / camera / progress에 문제 없는지 확인.

### P8 — Art / Audio

Runtime stable 뒤.

---

## 24. Stage Data Concept

```js
{
    id: "sector-04-01",
    sectorId: "sector-04",
    order: 1,

    name: "TRANSIT INTAKE",

    bounds: {
        width: 1600,
        height: 1376
    },

    entry: {
        id: "sector-04-01:entry",
        x: -640,
        y: -32
    },

    surfaces: [
        "P0",
        "R1",
        "R2",
        "M1",
        "R3",
        "P4",
        "P5",
        "A1~A6 grapple targets"
    ],

    objects: [
        "status displays",
        "exit-panel",
        "service-gate"
    ],

    windZones: [],

    objectives: [
        "final-deck-reached",
        "exit-panel-engaged"
    ],

    gate: {
        id: "sector-04-01:gate",
        nextAreaId: "sector-04-02"
    },

    storyTriggers: [
        "transit-backbone-status",
        "upper-express-status",
        "security-line-preview"
    ]
}
```

### Important

이 객체는:

```text
CONCEPT
```

이며 현재 Runtime implementation이 아니다.

Post-Sector03 transition 계약이 확정되기 전
global catalog order / entry wiring을 확정하지 않는다.

---

## 25. 아트 담당자 전달문

> **4-1은 적도 위험물도 없는 거대한 Transit Intake입니다. 핵심은 Player가 Commercial District보다 훨씬 작은 존재처럼 보이면서도, 실제로 붙어야 하는 A1~A6 구조는 가장 명확하게 읽히는 것입니다. Background에서는 수직 레일, 전력 Backbone, 환기 기계와 멀리 움직이는 Indicator를 사용해 도시가 아직 일부 살아 있다는 느낌을 주세요. 단 움직이는 배경 구조가 실제 Gameplay Platform처럼 보여서는 안 됩니다. Rope/Anchor Cyan을 최우선으로 남기고, Cutter가 처음 등장하는 4-2 대비를 위해 이 Stage에서는 Warning Red 사용량을 낮게 유지합니다. Final Art는 Runtime Area와 Camera Zone이 확정되기 전까지 HOLD입니다.**

---

## 26. 개발자 최종 전달 요약

### Must Build

```text
ONE LARGE STATIC TRANSIT SHAFT

7 LANDING SURFACES

6 GRAPPLE TARGETS

NO ENEMY
NO WIND
NO SCANNER
NO MOVING PLATFORM
```

### Mandatory Safe Route

```text
P0
→ A1
→ R1
→ A2
→ R2
→ A3
→ M1
→ A4
→ R3
→ A5
→ P4
→ A6
→ P5
```

Max:

```text
374.5 px
```

### Optional Flow

```text
P0
→ A1
→ A2
→ A3
→ A4
→ A5
→ A6
→ P5
```

Max:

```text
408.9 px
```

### Required Validation

```text
ROPE MAX
440

SAFE ROUTE
swingImpulse = 0 PASS

RECOVERY
≤ 5 sec target

GATE
Reach → Panel → Open → Physical Crossing
```

### Do Not Add

- Cutter
- Wind
- Scanner
- Train Physics
- Moving Surface
- new Input
- new Rope Mode
- Growth
- Artifact
- Boss

### Stage Feeling

> **“이제 공간이 커졌다. 착지하지 않고 계속 이어 붙이면 훨씬 빠르게 올라갈 수 있다.”**

---

## OPEN QUESTIONS

### 1. Exact Post-Sector03 Entry

4-1 Entry Deck 좌표는 정했지만:

```text
Boss Defeat
→ transition room
→ 4-1
```

정확한 연결은 미정.

### 2. Final Camera Zoom

`0.88~1.00` 후보는
실제 Desktop / Mobile blockout 후 조정.

### 3. Flow Route A3 → A4

```text
408.9 px
```

는 Optional Flow에만 사용.

실플레이에서 aim precision 부담이 크면:

- A3를 16~32px inward
- A4를 16~32px inward

중 하나로 조정.

Safe Route는 영향 없음.

### 4. Mid Service Deck M1

M1이 너무 강한 정지점이 되어
Flow를 자꾸 끊는다면:

```text
width 256
→ 192~224
```

후보.

단 Safe Route readability는 유지.

### 5. Background Transit Motion

실제 train silhouette를 보여줄지,
light streak / signal motion만 보여줄지는 Art 단계 결정.

Gameplay moving platform으로 오해되는 경우
train silhouette를 줄인다.

### 6. 4-2 Preview

4-1 Exit에서
Cutter Housing을 silhouette로 미리 보여줄지 OPEN.

기본안:

```text
NO explicit Cutter visual
```

4-2 Safe Observation에서 처음 읽힌다.

---

SECTOR 04-1 / TRANSIT INTAKE — BLOCKOUT CANDIDATE · REV 1.0
