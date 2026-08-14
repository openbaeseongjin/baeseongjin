# SECTOR 03-4 — SERVICE ARCADE

*BLOCKOUT CANDIDATE · REV 1.0*

◀ PREV — [SECTOR 03-3 / RETAIL SECURITY WALK](../3-3/README.md) · NEXT — [SECTOR 03-5 / COMMERCIAL SERVICE NODE](../3-5/README.md) ▶

`SECTOR 03 COMMERCIAL DISTRICT` · `STAGE 04` · `FRONT-OF-HOUSE vs BACK-OF-HOUSE` · `FIRST COMMERCIAL ROUTE IDENTITY`

| 항목 | 기준 |
|---|---|
| Status | HYPOTHESIS — BLOCKOUT CANDIDATE |
| Difficulty | ★★★ |
| Expected First Playtime | 145–220 sec |
| Expected Skilled Clear | 55–90 sec |
| Enemy | Patrol Drone T1 × 1 |
| Scanner | ACCESS SCAN FIELD × 1 group — PUBLIC ROUTE only |
| New Mechanic | NONE |
| New Enemy Behavior | NONE |
| New Input | NONE |
| New Rope Mode | NONE |
| New Augment | NONE |
| Wind | NONE |
| Rope Cut | NONE for Patrol Drone |
| Required Kill | NONE |
| Design Checkpoint / Reward | NONE |
| Exit | Objective → Gate Panel → opened Gate physical crossing |
| Required Build | Foundation + Specialization carried, no Build Lock |
| Primary Role | First Front-of-House vs Service Multi-Route choice |
| Primary Space | Retail Arcade facade + exposed maintenance service frame |

---

## 0. 기획 기준

### LOCKED FOR THIS STAGE

3-4는 Commercial District에서 처음으로:

```text
PUBLIC / FRONT-OF-HOUSE
vs
SERVICE / BACK-OF-HOUSE
```

를 실제 플레이 Route 차이로 만든다.

PUBLIC:

```text
WIDE
READABLE
FEWER ATTACHES
+
SCANNER
+
PATROL EXPOSURE
```

SERVICE:

```text
NARROWER
MORE ROPE CHAINING
MORE PERMANENT MOUNTS
+
LOWER SECURITY EXPOSURE
```

두 Route 모두:

- 모든 Foundation / Specialization 통과 가능
- Enemy Kill 불필요
- 새 Input 불필요
- 같은 Upper Merge로 합류
- 중간 Crossover 가능

핵심 질문:

> **“정면의 쉬운 길에서 보안을 상대할 것인가, 뒤쪽 설비 길에서 Rope를 더 적극적으로 사용할 것인가?”**

### 금지

- SERVICE Route를 특정 Augment 전용으로 만들기
- Maintenance Key 아이템 추가
- 별도 문 열기 미니게임
- Scanner 강화형
- Drone T2
- 두 번째 Enemy
- Security Shutter
- Moving Platform
- Wind
- Turret
- Kill Gate
- Public = 명백한 함정
- Service = 명백한 정답

---

## 0-1. 최신 GitHub / Runtime 교차검증

### VERIFIED — CURRENT MAIN

작성 시점 최신 `main` HEAD:

```text
586679cad69b744f6dfd185268c9b546e5bf85f0
```

3-3 `RETAIL SECURITY WALK`은 이미 `main`에 병합되어 있다.

현재 상세 Scenario Chain:

```text
3-1 POWERED PROMENADE
3-2 SCANNER GALLERY
3-3 RETAIL SECURITY WALK
3-4 THIS DOCUMENT
```

### VERIFIED — CURRENT AUTHORED RUNTIME

현재 `CurrentAuthoredAreaCatalog`는:

```text
SECTOR 01
+
SECTOR 02
```

만 실제 Runtime World에 조립한다.

Sector 03 Catalog는 아직 없다.

따라서 3-4는 현재:

```text
SPEC — PLANNED
```

이며 deployed authored region이 아니다.

### VERIFIED — PATROL DRONE

현재 Runtime에는 Patrol capability가 구현되어 있다.

```text
EnemyObject
+
activation bounds
+
patrol config
+
existing enemy weapon
```

Sector 02 baseline:

```text
speed       48
waitSeconds 0.45
mode        pingpong
```

를 3-4에서도 우선 재사용한다.

### VERIFIED — STATIC GRAPPLE FILTER

현재 Surface는 기본 `grappleable: true`.
Rope candidate 계산은:

```text
surface.grappleable === false
→ skip
```

을 실제 지원한다.

### IMPLEMENTATION DEPENDENCY — ACCESS SCAN FIELD

현재 Main에서 아직 확인되지 않음:

```text
scanner phase
+
dynamic attach eligibility
+
controlled surface group
```

따라서 Public Route Scanner는 3-2 Scanner Spike가 구현·검증돼야 Runtime에 연결 가능하다.

### VERIFIED — GATE CONTRACT

현재 authored Stage Exit는:

```text
objective
→ Gate Panel interaction
→ Gate open
→ Player physically crosses
```

구조다.

별도 `E` Key를 추가하지 않고 현재 contextual interaction 문법을 유지한다.

---

## 0-2. 최신 코드가 3-4에 주는 설계 변화

초기 Master Plan은 3-4를:

```text
PUBLIC
vs
SERVICE
```

Route 아이디어로만 정의했다.

현재 구현 상태에서는:

PUBLIC:

```text
implemented Patrol Drone activation
+
planned Access Scan Field
```

SERVICE:

```text
existing permanent grappleable geometry
```

로 구성할 수 있다.

즉 새 Route 차이는 새 시스템을 더 만드는 것이 아니라:

```text
SAME PLAYER TOOL
+
DIFFERENT ENVIRONMENTAL CONDITIONS
```

로 만든다.

---

## 1. 한 줄 정의

3-3의 Retail Security Walk를 빠져나온 Player가, 밝고 넓지만 Scanner와 Patrol Drone의 감시를 받는 **PUBLIC RETAIL PROMENADE**와, 좁고 부착 지점이 많아 Rope Chaining을 요구하지만 보안 노출이 낮은 **BACK-OF-HOUSE SERVICE FRAME** 중 하나를 선택하거나 중간에 갈아타며 올라가고, 상단 공용 Merge Deck에서 두 길이 같은 Commercial Service Node로 이어진다는 것을 확인하는 첫 Commercial Multi-Route Stage.

---

## 2. 전체 게임에서의 역할

```text
3-1
POWERED SPACE

↓

3-2
WHEN TO ATTACH

↓

3-3
WHEN TO COMMIT

↓

3-4
WHERE TO GO

↓

3-5
REST / GROWTH DECISION
```

3-4는 2-4의 `SAFE / FLOW / PRESSURE`를 그대로 반복하지 않는다.

여기서는:

```text
PUBLIC
vs
SERVICE
```

두 공간의 **사회적 기능과 보안 조건 자체가 다르다.**

Route Choice가 Worldbuilding과 Gameplay를 동시에 설명한다.

---

## 3. Story 역할

Player는 이미:

```text
EMPLOYEE CLASS:
VERTICAL MAINTENANCE

ROUTE AUTHORIZATION:
INVALID
```

상태다.

3-4에서는 Commercial facade 뒤에 도시를 유지하는 Service Infrastructure가 있음을 강화한다.

SERVICE Route Sign 후보:

```text
FACILITY SERVICE ACCESS

MAINTENANCE CLEARANCE
RECOGNIZED

LOCAL SERVICE ROUTE
AVAILABLE
```

중요:

```text
LOCAL MAINTENANCE ACCESS
≠
VERTICAL TRANSIT AUTHORIZATION
```

PUBLIC Route Sign 후보:

```text
PUBLIC PROMENADE

ROUTE AUTHORIZATION
INVALID

SECURITY CONTROL
ACTIVE
```

Player가 느껴야 하는 것:

> **“위로 올라갈 권한은 없지만, 설비 길은 내가 알던 작업 공간이다.”**

아직 공개하지 않음:

- Group A/B 정체
- Priority Customer
- Access Tier A/B
- Executive Access
- Group C 중단 원인
- Commercial 고객 계층과 Evacuation Group 직접 연결
- Corporate 책임자

---

## 4. 공간 콘셉트

**SERVICE ARCADE**

하나의 Commercial Atrium Wall을 두 겹으로 보여준다.

```text
FRONT
POLISHED RETAIL FACADE

BACK
EXPOSED MAINTENANCE FRAME
```

전체 구조:

```text
                         UPPER MERGE / EXIT
                              P5
                               ▲
                         G6 ●───┘
                           ╲
                       P4 █████
                           ▲
                         G5 ●
                           ▲
                      M1 ███████
                      ▲       ▲
                      │       │
          PUBLIC      │       │      SERVICE
          ROUTE       │       │      ROUTE

       PU2 █████      │       │      █████ SV2
            ▲         │       │         ▲
          C2 ●        │       │       GS2 ●
            ▲         │       │         ▲
      ← DRONE →       │       │      █████ SV1
            ▲         │      X1 ███      ▲
       PU1 █████──────┘       │        GS1 ●
            ▲                 │          ▲
          C1 ●                │        S0 ●
             ╲                │        ╱
                 P1 SPLIT DECK
                       ▲
                    P0 ENTRY
```

---

## 5. Pixel / Grid 기준

### VERIFIED — CURRENT MAIN

```text
Player Radius            15
Gravity                  1250
Max Horizontal Speed     360
Jump Speed               440

Rope Max Attach Distance 440
Attach Buffer            0.1 sec
Swing Impulse            780

Camera Desktop Zoom      1
Camera Mobile Zoom       0.72
```

Enemy baseline:

```text
Enemy Radius             18
Enemy Health             30
Enemy Attack Range       520
Enemy Fire Interval      1.4 sec
Enemy Projectile Speed   260
Enemy Projectile Radius  7
Enemy Projectile Damage  20
```

### HYPOTHESIS — BLOCKOUT

```text
BASE GRID     32 px
WIDTH         1408 px / 44 tiles
HEIGHT        1280 px / 40 tiles

X             -704 ~ +704
Y                0 ~ -1280
```

Mandatory Grapple 목표:

```text
180–380 px
```

두 Route 모두 Max Range 440 Challenge를 추가하지 않는다.

---

## 6. 전체 맵 구조

```text
Y -1280

┌──────────────────────────────────────────────────────────────────┐
│                              GATE → 3-5                          │
│                        P5 ███████████ [PANEL]                    │
│                               ▲                                  │
│                           G6 ●                                   │
│                             ╲                                    │
│                       P4 █████████                               │
│                           ▲                                      │
│                         G5 ●                                     │
│                           ▲                                      │
│                    M1 █████████████                              │
│                     ▲            ▲                               │
│       PUBLIC        │            │        SERVICE                │
│ PU2 █████████       │            │       █████████ SV2           │
│       ▲             │            │              ▲                │
│     C2 ●            │            │            GS2 ●              │
│       ╲             │            │              ▲                │
│   ← DRONE D1 →      │       X1 █████       █████████ SV1        │
│       ▲             │         ╱    ╲            ▲               │
│ PU1 █████████───────┘        ╱      ╲         GS1 ●              │
│       ▲                     ╱        ╲          ▲                │
│     C1 ●                   ╱          ╲       S0 ●               │
│       ╲                   ╱            ╲        ╱                │
│             P1 █████████████ SPLIT DECK                          │
│                      ▲                                           │
│                 P0 ENTRY                                         │
└──────────────────────────────────────────────────────────────────┘

Y 0
```

---

## 7. Zone 구성

### ZONE A — SPLIT REVEAL

```text
Y 0 ~ -256
```

P1에서 두 Route가 동시에 보여야 한다.

```text
PUBLIC PROMENADE
vs
FACILITY SERVICE
```

Enemy / Scanner Pressure 없음.

### ZONE B — ROUTE IDENTITY

```text
Y -256 ~ -512
```

PUBLIC:

```text
C1 → PU1
```

넓은 Retail Balcony. Scanner 상태를 읽지만 아직 Drone activation 밖.

SERVICE:

```text
S0 → GS1 → SV1
```

Permanent Grapple Geometry. Scanner 없음.

### ZONE C — MID CROSSOVER

```text
Y -512
```

X1.

Public PU1 ↔ Service SV1 간 Route 변경 허용.

X1은:

- Scanner Controlled 아님
- Drone new acquire zone 밖
- 좁은 Choke 아님

### ZONE D — ROUTE COMMIT

```text
Y -512 ~ -768
```

PUBLIC:

```text
C2 + Patrol Drone D1
```

SERVICE:

```text
GS2 → SV2
```

Enemy / Scanner 없음. 대신 Attach/Release 횟수와 Landing 정밀도가 Public보다 높다.

### ZONE E — UPPER MERGE

```text
Y -768 ~ -1024
```

M1에서 완전 합류.

Enemy 새 Acquire 없음. Scanner 없음.

### ZONE F — SERVICE NODE APPROACH

```text
Y -1024 ~ -1280
```

G5 → P4 → G6 → P5.

3-5 `COMMERCIAL SERVICE NODE` Preview.

P5 Objective 뒤 Gate Panel → Gate.

---

## 8. 좌표 / 오브젝트

### HYPOTHESIS — BLOCKOUT CANDIDATE

| ID | X | Y | Width | 역할 |
|---|---:|---:|---:|---|
| P0 | -560~-320 | 0 | 240 | Entry |
| P1 | -448~-96 | -160 | 352 | Split Deck |
| C1 | -352~-224 | -320 | 128 | Public Controlled Mount 1 |
| PU1 | -512~-128 | -448 | 384 | Public Observation Balcony |
| C2 | -224~-96 | -608 | 128 | Public Controlled Mount 2 |
| PU2 | -448~-96 | -736 | 352 | Public Upper Balcony |
| S0 | -32~+96 | -256 | 128 | Service Entry Pivot |
| GS1 | +256~+384 | -384 | 128 | Service Permanent Pivot 1 |
| SV1 | +352~+512 | -512 | 160 | Service Ledge 1 |
| X1 | +32~+160 | -512 | 128 | Mid Crossover Deck |
| GS2 | +256~+384 | -640 | 128 | Service Permanent Pivot 2 |
| SV2 | +352~+512 | -736 | 160 | Service Ledge 2 |
| M1 | -96~+288 | -832 | 384 | Upper Merge Deck |
| G5 | +0~+128 | -960 | 128 | Final Permanent Pivot |
| P4 | -128~+192 | -1024 | 320 | Service Node Approach |
| G6 | +192~+320 | -1120 | 128 | Exit Pivot |
| P5 | +224~+544 | -1184 | 320 | Objective / Gate Deck |
| Gate Panel | +480 | -1152 | — | Current contextual Gate Panel |
| Gate | +576 | -1184 | — | To 3-5 |

### PUBLIC SCANNER S1 — HYPOTHESIS

```text
Position:
X -560
Y -544

Group:
scanner-service-arcade-public

Controls:
C1
C2

Timing:
reuse 3-2 baseline
```

3-4만 별도 고속 Timing을 사용하지 않는다.

### PATROL DRONE D1 — HYPOTHESIS POSITION / VERIFIED FAMILY

```text
Start: X -384 / Y -576
End:   X -64  / Y -576

Speed: 48
Wait:  0.45 sec
Mode:  pingpong
```

Activation:

```text
X -608 ~ +16
Y -704 ~ -480
```

의도:

- PU1 outside
- C2 inside
- PU2 outside
- SERVICE route outside
- X1 center outside

---

## 9. PUBLIC ROUTE

```text
P0
→ P1
→ C1
→ PU1
→ observe Scanner + Patrol
→ C2
→ PU2
→ M1
→ G5
→ P4
→ G6
→ P5
```

장점:

- 넓은 Landing
- Attach 횟수 적음
- 다음 진행 방향 명확
- Base Rope로 이해하기 쉬움

비용:

- Scanner Window 관찰
- C2 구간 Drone activation
- 기다리는 시간이 생길 수 있음

```text
EASY MOVEMENT
≠
EASY SECURITY
```

---

## 10. SERVICE ROUTE

```text
P0
→ P1
→ S0
→ GS1
→ SV1
→ GS2
→ SV2
→ M1
→ G5
→ P4
→ G6
→ P5
```

장점:

- Scanner 없음
- Drone new acquire 없음
- Waiting 거의 없음
- Rope 숙련이 좋으면 빠를 수 있음

비용:

- Attach 횟수 증가
- SV1 / SV2 Landing 폭 160px 후보
- Release / Re-Attach Rhythm 요구
- 긴 `SV2 → M1` 복귀 Arc
- Public보다 시각적으로 덜 직관적

SERVICE는 Secret Route가 아니다.

P1에서 Sign / frame으로 처음부터 인지 가능해야 한다.

또한 SERVICE는 Specialization Required가 아니다.

Base Rope + `swingImpulse = 0`에서도 mandatory 연결이 성립해야 한다.

---

## 11. MID CROSSOVER / Route Switching

X1을 통해 첫 선택을 취소할 수 있다.

PUBLIC → SERVICE:

```text
PU1
→ X1
→ SV1
→ GS2
```

SERVICE → PUBLIC:

```text
SV1
→ X1
→ C2
→ PU2
```

처음 선택이:

```text
LOCKED COMMITMENT
```

가 되지 않게 한다.

좋은 Multi-Route는:

> “선택하고, 보고, 마음을 바꿀 수 있다.”

를 허용한다.

---

## 12. Build Expression / Recovery

### IMPULSE

SERVICE에서 Arc / Landing 압축.
PUBLIC에서는 C2 이후 activation 체류시간 감소 가능.

### RELAY

SERVICE Route에서 가장 자연스럽게 빛난다.

```text
S0
→ GS1
→ GS2
→ M1
```

단 Relay 없이는 SV1 / SV2 Landing으로 반드시 통과 가능.

### SHEAR

PUBLIC Route에서 Player가 PU1에서 C2에 Attach하는 순간:

```text
PU1
→ C2
```

Rope line이 D1 Patrol Corridor를 가로지르는 공격 기회를 허용할 수 있다.

Kill Optional.

### Recovery — PUBLIC

C1 실패:

```text
P1 / PU1
```

C2 실패:

```text
PU1
or
X1
or
lower public catch
```

### Recovery — SERVICE

GS1 실패:

```text
P1 / Service Lower Ledge
```

GS2 실패:

```text
SV1 / X1
```

Recovery 목표:

```text
≤ 5 sec
```

### Projectile Note

PUBLIC에서 이미 발사된 Projectile은 activation band를 빠져나가도 즉시 삭제되지 않는다.

PU2 / M1은 새 Acquire가 없는 안전 구간이지만, 기발사 탄 궤적은 Playtest에서 확인한다.

---

## 13. Enemy / Hazard

### PATROL DRONE T1 × 1

Current behavior family:

```text
NO TARGET
→ PATROL

ELIGIBLE TARGET ACQUIRED
→ TARGET LOCK
→ PATROL PAUSE
→ FIRE

TARGET INVALID
→ LOCK CLEAR
→ PATROL RESUME
```

Drone은 Public Route의 Security Cost를 만든다.

Service Route까지 쫓아가지 않는다.

2인 플레이에서:

```text
A = PUBLIC
B = SERVICE
```

로 동시에 갈 수 있다.

Patrol Drone T1:

```text
Damage   20
Speed    260 projectile
Interval 1.4 sec
Rope Cut NONE
```

Scanner는 3-2/3-3과 동일:

```text
AVAILABLE / WARNING
→ new attach allowed

LOCKED / RESET
→ new attach denied

existing rope
→ stays attached
```

Hazard Budget:

```text
Wind           NONE
Turret         NONE
Damage Floor   NONE
Moving Door    NONE
Trap           NONE
```

---

## 14. Camera

P1 Split Deck에서 한 화면 안에 최소:

- C1 / Public Sign
- S0 / Service Sign
- 두 Route의 첫 Landing

이 보여야 한다.

Mobile Zoom `0.72`에서도 Public / Service 방향이 색 하나가 아니라 구조로 구분돼야 한다.

PU1 / SV1 근처에서 X1이 두 Route 연결점이라는 것이 읽혀야 한다.

M1에서는:

> “다른 Route도 여기로 왔구나.”

가 공간적으로 이해돼야 한다.

Custom Pan 없음.

---

## 15. Story Trigger

### TRIGGER A — ROUTE SPLIT

P1:

```text
PUBLIC PROMENADE
←

FACILITY SERVICE
→
```

### TRIGGER B — PUBLIC

PU1:

```text
PUBLIC ROUTE

AUTHORIZATION
INVALID

SECURITY CONTROL
ACTIVE
```

### TRIGGER C — SERVICE

SV1:

```text
FACILITY SERVICE ACCESS

MAINTENANCE CLEARANCE
RECOGNIZED

LOCAL SERVICE ROUTE
AVAILABLE
```

### TRIGGER D — MERGE

M1:

```text
COMMERCIAL SERVICE NODE
UPPER LEVEL
```

3-5 Preview.

Story Meaning:

```text
Local Maintenance Access
≠
Vertical / Public Authorization
```

### 공개 금지

- GROUP A
- GROUP B
- PRIORITY CUSTOMER
- TIER A / B
- EXECUTIVE ACCESS
- WORKER DENIED
- Maintenance worker 계급 설명

---

## 16. Pixel Art Asset Spec

### PUBLIC

Storefront Facade:

```text
128×96 / 256×96
```

Public Route Header:

```text
64×32 / 96×32
```

Access Scanner reuse:

```text
64×64 / 96×64
```

Controlled Mount reuse:

```text
32×16 / 64×16
```

### SERVICE

Exposed Service Frame:

```text
64×64 / 128×64
```

Maintenance Rail / Pipe Frame:

```text
32×32 / 64×32
```

Service Route Header:

```text
64×32 / 96×32
```

Service Grating Ledge:

```text
64×16 / 128×16
```

Patrol Drone T1 reuse:

```text
24×24 ~ 32×32
```

현재 사람 기준 Gate / Panel Scale 유지.

---

## 17. Background

Far / Mid는 Sector 03 Commercial Family를 재사용한다.

화면 Front:

```text
polished
lit
advertising
glass / retail
```

Back:

```text
service frame
utility
duct / cable
maintenance structure
```

Service Route를 Sector 01 Maintenance와 똑같이 만들지 않는다.

Commercial Back-of-House이므로:

- 더 정돈됨
- 더 얇은 구조 프레임
- 상업 facade 바로 뒤
- active utility light

를 유지.

특히:

```text
PIPE / CABLE
≠
GRAPPLE SURFACE
```

가 분명해야 한다.

---

## 18. Sound / VFX

PUBLIC:

- advertisement electrical tone
- clean ventilation
- Scanner state sound
- Drone servo / projectile

SERVICE:

- ventilation duct vibration
- transformer hum
- maintenance relay click
- distant motor
- Scanner sound 거의 없음
- Drone sound attenuated

X1에서는 두 Sound Family가 약하게 겹친다.

금지:

- Service 전용 영웅 음악
- Public을 “잘못된 선택”처럼 만드는 경고 음악
- Human Crowd
- Villain Voice

---

## 19. Implementation Notes

### 19-1. Current Runtime Boundary

현재 Runtime authored world는 Sector 02에서 끝난다.

3-4 구현 선행:

```text
3-1 integration
3-2 scanner system + integration
3-3 integration
→ 3-4
```

### 19-2. Public Scanner Dependency

C1 / C2는 3-2와 같은 dynamic attach filter가 필요하다.

C1 / C2는 반드시:

```text
DEDICATED CONTROLLED SURFACE SEGMENT
```

로 authoring한다.

동일 위치에:

```text
always-grappleable parent surface
+
controlled overlay
```

를 겹치지 않는다.

그렇게 하면 Public Route에서 Scanner를 무료로 우회할 수 있기 때문이다.

frozen Surface에:

```text
surface.grappleable = false
```

를 phase마다 mutation하지 않는다.

### 19-3. Service Route Uses Existing Surface Model

SERVICE는 별도 시스템이 아니다.

```text
normal permanent grappleable surfaces
```

만 사용.

따라서 Service Graybox 자체는 Scanner 구현과 독립적으로 테스트 가능하다.

### 19-4. Deliberate vs Accidental Scanner Bypass

3-3에서는 Scanner 옆 Permanent Surface 우회가 실패였다.

3-4에서는:

```text
SERVICE ROUTE
```

자체가 의도된 우회다.

BAD:

```text
C2 바로 옆 Permanent point로 같은 Public Route를 무료 우회
```

GOOD:

```text
P1에서 Service Architecture를 선택
→ 더 많은 Rope Cost
→ Security를 피함
```

### 19-5. Patrol Implementation

기존 Patrol T1 재사용.

새 AI 없음.

### 19-6. Gate Contract

```text
P5 reach objective
→ Gate Panel
→ contextual interaction
→ Gate open
→ physical crossing
```

유지.

### 19-7. Runtime Area-Entry Respawn Anchor vs Design Checkpoint

현재 `AuthoredWorldAssembler`는 각 authored area entry에:

```text
checkpoint:<area-id>
reward: false
```

Runtime checkpoint record를 자동 생성한다.

이것은 3-4의:

```text
Design Checkpoint / Reward = NONE
```

와 구분한다.

3-4에는:

- 새 Reward Checkpoint 없음
- 새 Sector-end Checkpoint 없음
- 새 Augment 없음

### 19-8. Multiplayer Route Split

```text
A → PUBLIC
B → SERVICE
```

허용.

필수:

- Public Player만 Drone eligible
- Service Player 때문에 Drone cross-route target 재선정 금지
- X1 body collision이 Route 변경을 막지 않음
- M1 충분한 폭
- Gate open shared
- Gate crossing individual

### 19-9. Same Simulation

두 Player가 다른 Route에 있어도 별도 scene / network zone으로 분리하지 않는다.

같은 authored area / same simulation이다.

### 19-10. 3-5 Dependency

3-5 Growth 내용은 아직 OPEN.

3-4 Exit에서:

```text
NEW AUGMENT AVAILABLE
HYBRID READY
SECOND SPECIALIZATION
```

을 미리 표시하지 않는다.

단지:

```text
COMMERCIAL SERVICE NODE
```

위치만 Preview.

---

## 20. Playtest Metrics

Route:

```text
public chosen first
service chosen first
route switched
public → service
service → public
```

Clear:

```text
first clear time
skilled clear time
public clear time
service clear time
```

PUBLIC:

```text
scanner cycles waited
C1/C2 locked attach attempts
drone shots
drone hits
drone kill / bypass
activation dwell
```

SERVICE:

```text
attach count
re-attach count
falls
recovery time
landing count
wrong attach
```

Crossover:

```text
X1 reached
route switch after failure
route switch without failure
```

질문:

> “두 Route의 차이를 어떻게 느꼈나요?”

기대:

> Public은 이동은 편한데 보안이 많았다. Service는 Rope를 더 써야 하지만 보안이 적었다.

질문:

> “어느 Route가 정답처럼 느껴졌나요?”

목표:

```text
정답 하나 없음
```

Story 질문:

> “Maintenance Clearance가 무엇을 허용했다고 이해했나요?”

기대:

> Local Service Route.

실패:

> 이제 위쪽 모든 문을 열 수 있다.

---

## 21. PASS Criteria

### Gameplay

- Difficulty ★★★
- PUBLIC / SERVICE 차이 즉시 읽힘
- 새 Mechanic 없음
- Enemy 1
- Scanner 1 group
- Route 둘 다 통과 가능
- Route Switching 가능
- Drone Kill Optional
- No Build Lock
- Public = 넓지만 Security Cost
- Service = Rope Cost 있지만 lower Security
- 어느 Route도 절대 우위 아님
- `swingImpulse = 0` 두 Route mandatory progression 가능
- Recovery ≤ 5 sec 목표

### Runtime Alignment

- Current Patrol capability 재사용
- Current Gate contract 재사용
- Service는 current Surface model만으로 구현
- Scanner dynamic filter만 dependency
- Sector 03 runtime 미연결 사실 유지
- Area-entry runtime anchor와 Design Checkpoint를 혼동하지 않음

### Story

- Technician identity가 Gameplay 선택에 의미를 가짐
- Maintenance Clearance = local service access
- Vertical authorization은 여전히 없음
- Group A/B 미공개
- Priority Tier 미공개
- Group C 원인 미공개

### Multiplayer

- 서로 다른 Route 동시 진행 가능
- Drone cross-route acquire 없음
- X1 / M1 Choke 없음
- Gate party teleport 없음

---

## 22. FAIL Conditions

### Route

- SERVICE가 숨겨져 초회 Player가 못 봄
- PUBLIC이 명백한 함정
- SERVICE가 모든 면에서 더 빠르고 더 안전함
- PUBLIC이 모든 면에서 더 쉬움
- 특정 Augment만 SERVICE 통과
- Route 선택 후 변경 불가
- Crossover가 Rope Max 440 밖
- Public Scanner를 같은 Route의 옆 Permanent Anchor로 무료 우회

### System

- 새 Shutter
- 새 Enemy
- Drone T2
- Wind
- Turret
- Scanner Damage
- Scanner Forced Detach
- Service 전용 Interaction Key

### Runtime

- Current Gate contract 무시
- P5 도달 즉시 다음 Stage
- Sector 03 연결 시 Boss/Transition 임의 결정
- frozen Surface phase mutation
- Service를 별도 scene / network zone으로 분리

### Story

- Maintenance Clearance = Upper Transit Authorization
- Group A/B 정체 공개
- Priority Customer 공개
- Executive Access 공개
- Worker 계층 직접 설명
- 3-5 Growth 미리 확정

---

## 23. 개발 구현 우선순위

### P0 — DUAL-ROUTE GRAYBOX

Enemy / Scanner OFF.

```text
P0 / P1
PUBLIC geometry
SERVICE geometry
X1
M1
P5 / Gate
```

### P1 — RANGE VALIDATION

Public / Service 각각:

```text
780
Reduced
0
```

검증.

### P2 — ROUTE IDENTITY

아트 없이도:

```text
Public = wider / fewer attaches
Service = narrower / more chaining
```

이 느껴지는지 확인.

### P3 — SCANNER PUBLIC ONLY

C1 / C2.

### P4 — PATROL PUBLIC ONLY

D1 + activation band.

Service Player가 eligible하지 않은지 확인.

### P5 — CROSSOVER

Public ↔ Service.

### P6 — BUILD MATRIX

IMPULSE / RELAY / SHEAR × Public / Service.

### P7 — TWO PLAYER

Split / crossover / merge / Gate.

### P8 — STORY / SIGN

권한 문구 적용.

### P9 — ART / AUDIO

Gameplay PASS 이후.

---

## 24. Stage Data Concept

**HYPOTHESIS — Runtime code 아님**

```js
{
    id: "sector-03-04",
    sectorId: "sector-03",
    order: 4,

    name: "SERVICE ARCADE",
    subtitle: "PUBLIC / SERVICE ROUTE",

    routes: ["public", "service", "crossover", "recovery"],

    scannerGroups: [
        {
            id: "scanner-service-arcade-public",
            position: { x: -560, y: -544 },
            controlledSurfaceIds: ["C1", "C2"],
            timingProfile: "scanner-gallery-baseline",
            damagePlayer: false,
            detachExistingRope: false
        }
    ],

    enemies: [
        {
            id: "drone-1",
            enemyType: "patrol-drone-t1",

            activation: {
                x: -608,
                y: -704,
                width: 624,
                height: 224
            },

            patrol: {
                points: [
                    { x: -384, y: -576 },
                    { x: -64, y: -576 }
                ],
                speed: 48,
                waitSeconds: 0.45,
                mode: "pingpong"
            },

            rules: [
                "kill-optional",
                "no-rope-cut",
                "target-lock-cycle",
                "activation-band-only"
            ]
        }
    ],

    story: {
        publicRoute: "authorization-invalid",
        serviceRoute: "maintenance-clearance-local-only"
    },

    completion: {
        objective: "reach-exit-deck",
        gatePanelInteraction: true,
        physicalGateCrossing: true
    },

    nextAreaId: "sector-03-05"
}
```

---

## 25. 아트 담당자 전달문

### SERVICE ARCADE

핵심 이미지:

> **같은 Commercial Wall의 앞면은 유리·광고·넓은 Public Promenade이고, 그 바로 뒤쪽은 배관·프레임·설비 ledge가 노출된 Service Route다. Player는 두 길 사이를 Rope로 선택하거나 갈아탄다.**

Public:

- polished storefront
- active lightbox
- scanner
- wide balcony
- small Patrol Drone

Service:

- exposed service frame
- maintenance grating
- utility lamp
- restrained pipes
- cable tray
- local service signage

중요:

```text
PIPE / CABLE
≠
GRAPPLE TARGET
```

우선순위:

```text
Player / Rope
>
Route Structure
>
Scanner / Drone
>
Route Sign
>
Commercial Decoration
```

---

## 26. 개발자 최종 전달 요약

### SECTOR 03-4 — SERVICE ARCADE

핵심:

```text
PUBLIC
wide / fewer attaches / more security

vs

SERVICE
more rope chaining / less security
```

새 시스템 없음.

Reuse:

```text
3-2 Access Scan Field
3-3 Patrol Drone T1
Current Gate Panel / Gate
Current Grapple Surface
```

새 Design Value:

```text
ROUTE IDENTITY
```

Current Runtime Reality:

Implemented:

```text
Patrol capability
activation bounds
static grappleable filter
authored area boundaries
Gate Panel
physical Gate crossing
Sector 01+02 runtime catalog
```

Not Yet Implemented:

```text
dynamic Access Scan Field
Sector 03 authored runtime
3-1~3-3 runtime integration
```

Story:

```text
MAINTENANCE CLEARANCE
→ LOCAL SERVICE ROUTE

NOT
→ UPPER TRANSIT AUTHORIZATION
```

다음 3-5는 `COMMERCIAL SERVICE NODE — REST / GROWTH DECISION`.

3-4에서 Growth 내용을 미리 확정하지 않는다.

---

## OPEN QUESTIONS

### 1. Scanner Prototype

3-4 Public Route는 3-2 Scanner Spike PASS를 전제로 한다.

Scanner가 Prototype에서 FAIL하면 Public Route의 Security Cost를 다른 새 시스템으로 즉시 대체하지 않는다. 먼저 Sector 03 Master Plan을 재검토한다.

### 2. Public vs Service Time Balance

목표:

```text
Public:
movement easy / waiting-security cost

Service:
movement harder / low waiting cost
```

정확한 평균 Clear Time은 Blockout Playtest로 조정한다.

### 3. Crossover X1

X1이 너무 좋으면 각 Route의 어려운 절반만 피하는 무료 최적 Route가 생길 수 있다.

Route Switching은 허용하지만 자동 최적해가 되지 않는지 측정한다.

### 4. Maintenance Clearance Presentation

Panel Interaction으로 새 권한을 획득하지 않는다.

Story Display / signage만으로 기존 Employee Class가 Local Service에 유효함을 보여주는 방향을 우선한다.

### 5. 3-5 Growth

현재 OPEN.

3-4 Playtest까지 보고:

```text
Second Specialization
Secondary Augment
Hybrid Eligibility
No Augment
```

중 결정한다.

---

SECTOR 03-4 / SERVICE ARCADE — REV 1.0
