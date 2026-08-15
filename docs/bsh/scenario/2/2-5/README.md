# SECTOR 02-5 — EVACUATION WALKWAY

*BLOCKOUT CANDIDATE · REV 1.0*

◀ PREV — [SECTOR 02-4 / RESIDENTIAL STACK](../2-4/README.md) · NEXT — [SECTOR 02-6 / QUIET RESIDENTIAL VOID](../2-6/README.md) ▶

`SECTOR 02 WORKER DISTRICT` · `STAGE 05` · `STORY PRESSURE + GAMEPLAY PRESSURE` · `EVACUATION ROUTE BLOCKED`

| 항목 | 기준 |
|---|---|
| Status | HYPOTHESIS — BLOCKOUT CANDIDATE |
| Difficulty | ★★★ |
| Expected First Playtime | 140–210 sec |
| Expected Skilled Clear | 60–90 sec |
| Enemy | 1 Patrol Drone T1 |
| New Mechanic | NONE |
| New Enemy Behavior | NONE |
| New Augment | NONE |
| Wind / Airflow | NONE |
| Rope Cut | NONE |
| Required Build | Foundation + Specialization, but no Build Lock |
| Primary Role | Route Choice + Evacuation Story Pressure |
| Space | Central Worker Evacuation Walkway / Locked Upper Transit Gate |

---

## 0. 기획 기준

### LOCKED

2-5는 다음 조건을 지킨다.

- Sector 02 첫 본격 Evacuation Story Pressure Stage
- Difficulty ★★★
- Patrol Drone T1 사용
- Drone Kill은 Optional
- Drone은 Route Choice를 바꾸는 Moving Security Pressure
- 새 Drone 공격 패턴 없음
- Rope Cut 없음
- 새 Rope Input 없음
- 새 Rope Mode 없음
- 새 Augment 없음
- Foundation + Specialization 유지
- 모든 Build가 통과 가능
- 2-4에서 배운 Multi-Route를 재사용
- Story 공간과 Gameplay 공간을 따로 분리하지 않음
- 살아 있는 NPC 없음
- 시체 없음
- Group C가 왜 멈췄는지는 아직 설명하지 않음
- Group A / B 정보는 아직 공개하지 않음
- 2-7의 `TRANSFER SUSPENDED`를 선행 공개하지 않음
- 2-8의 A/B 완료 · C 중단 비교를 선행 공개하지 않음
- 2-6은 반드시 2-5보다 낮은 압력의 Relief Stage로 남김

### MASTER PLAN STORY TEXT

2-5에서 처음 명확하게 보여줄 정보:

```text
EVACUATION GROUP C

ASSEMBLY COMPLETE

TRANSFER AUTHORIZATION
PENDING

UPPER TRANSIT
ACCESS RESTRICTED
```

Player가 이해해야 하는 것:

> 사람들이 이곳까지 실제로 모였고,
> 위쪽으로 이동하기 위한 절차가 진행되었지만
> 여기서 멈췄다.

Player가 아직 알아서는 안 되는 것:

> 누가 멈췄는가.
> 왜 C만 멈췄는가.
> 고의로 버린 것인가.
> A/B는 누구인가.
> 계급별 대피였는가.

---

## 0-1. Reference / Transfer 기준

### SANABI — TRANSFER

이동과 Story / Threat를 별개의 방으로 분리하지 않는다.

2-5의 대피 Walkway는:

```text
STORY SET
```

이면서 동시에:

```text
ROPE + DRONE GAMEPLAY SPACE
```

여야 한다.

Player가 Story Terminal을 읽기 위해
전투 공간을 끝낸 뒤 별도 방에 들어가는 구조를 피한다.

---

### Rusted Moss — TRANSFER

2-4에서 도입한 Multi-Route 철학을 유지한다.

```text
SAFE
FLOW
PRESSURE
```

는 Build 전용 길이 아니라
위험 / 속도 / 판단 성향이 다른 해법이다.

---

### Celeste — TRANSFER

Story 압박이 강해져도
실패 비용까지 크게 올리지 않는다.

2-5의 난이도 상승은:

```text
재도전 시간 증가
```

가 아니라:

```text
Route + Moving Threat + Story Landmark를
동시에 읽는 밀도 증가
```

에서 만든다.

---

### Metanet N — TRANSFER

Queue Barrier, Chair, Bag, Shelter Prop가 많아져도
Collision을 현실적으로 복잡하게 만들지 않는다.

```text
STORY DENSITY
≠
COLLISION DENSITY
```

---

## 1. 한 줄 정의

Worker Housing Stack을 빠져나온 플레이어가
주거블록 주민들이 실제 대피를 위해 모였던 **Central Evacuation Walkway**를 통과하며,
Patrol Drone이 순찰하는 대피 동선에서 Safe / Flow / Pressure Route를 선택하고,
끝내 `ASSEMBLY COMPLETE`였음에도 `TRANSFER AUTHORIZATION PENDING`과 `UPPER TRANSIT ACCESS RESTRICTED` 상태로 대피가 멈춰 있었다는 사실을 처음 명확하게 발견하는 Stage.

---

## 2. 전체 게임에서의 역할

Sector 02 진행:

```text
2-1
사람들이 살았다.

↓

2-2
경비는 계속 작동한다.

↓

2-3
Build가 Specialization 된다.

↓

2-4
큰 주거공간을 여러 Route로 읽는다.

↓

2-5
사람들이 실제로 대피 지점까지 왔지만
위쪽 이동은 이루어지지 않았다.

↓

2-6
거대한 빈 주거공간을 보며
규모와 부재를 체감한다.

↓

2-7
EVACUATION TRANSFER SUSPENDED

↓

2-8
A/B COMPLETE
C SUSPENDED
```

2-5는 Story가 처음으로:

```text
"사람들이 어디 갔지?"
```

에서

```text
"여기까지 왔는데 왜 못 올라갔지?"
```

로 발전하는 지점이다.

---

## 3. Story 역할

### 2-1에서 이미 안 것

```text
EVACUATION GROUP C

ASSEMBLY:
BLOCK 12 CENTRAL WALKWAY

STATUS:
WAIT FOR FURTHER INSTRUCTION
```

즉:

> 대피하려고 모일 예정이었다.

### 2-5에서 새로 아는 것

```text
ASSEMBLY COMPLETE
```

즉:

> 실제로 사람들이 모였다.

그리고:

```text
TRANSFER AUTHORIZATION
PENDING
```

```text
UPPER TRANSIT
ACCESS RESTRICTED
```

즉:

> 모인 다음 단계가 진행되지 않았다.

### 아직 모르는 것

- 왜 Pending이었는가
- 누가 Authorization을 승인하는가
- Group C가 의도적으로 제외됐는가
- 다른 Group은 어떻게 됐는가
- Upper Transit Priority가 누구에게 주어졌는가

---

## 4. 공간 콘셉트

**CENTRAL WORKER EVACUATION WALKWAY**

원래 동선:

```text
RESIDENTIAL BLOCK
→
ASSEMBLY POINT
→
EVACUATION WALKWAY
→
UPPER TRANSIT
```

현재:

```text
RESIDENTIAL BLOCK
→
ASSEMBLY COMPLETE
→
EVACUATION WALKWAY
→
UPPER TRANSIT GATE
LOCKED / RESTRICTED
```

Player는 일반 대피 Gate를 통과하지 않는다.

대신 주인공의 산업용 Grapple과 Maintenance 접근 능력을 이용해
Gate 옆의 좁은 **Maintenance Service Frame**으로 올라가
다음 구역으로 계속 전진한다.

### 중요

Maintenance Service Frame은:

```text
일반 주민 대피 경로
```

가 아니다.

따라서:

> “주민들도 그냥 이 길로 올라가면 되잖아?”

라는 인상을 주면 안 된다.

형태는:

- 좁은 설비 프레임
- 일반 보행 난간 없음
- Grapple / Maintenance 장비 전제
- Utility access 표시

로 구분한다.

---

## 5. Pixel / Grid 기준

### VERIFIED — 2026-08-14 / current `main`

현재 Runtime 기준:

```text
Player Radius            15
Gravity                  1250
Max Horizontal Speed     360
Jump Speed               440
Rope Max Attach Distance 400
Attach Buffer            0.1 sec
Swing Impulse            780

Camera Desktop Zoom      1
Camera Mobile Zoom       0.72
```

현재 일반 Enemy 기준:

```text
Enemy Radius             18
Enemy Health             100
Enemy Attack Range       760
Enemy Fire Interval      1.0 sec
Enemy Projectile Speed   520
Enemy Projectile Damage  20
Rope Disabled On Hit     0.6 sec
```

### IMPORTANT IMPLEMENTATION NOTE

현재 Generic Enemy의 기본 공격은
가장 가까운 Player를 사거리 안에서 선택하는 구조이며,
저장소 검색 기준 별도 LOS / Cover 차단 구현은 확인되지 않았다.

따라서 2-5의 Safe Route를:

```text
벽 뒤에 숨으면 현재 코드에서 총알을 안 맞는다.
```

라는 전제로 설계하지 않는다.

Safe Route의 1차 안전성은:

```text
Patrol Timing
+
Encounter Bounds
+
Distance
+
Wide Holding Platform
```

으로 만든다.

실제 LOS 시스템이 추가되면
Waiting Structure를 추가 Cover로 활용할 수 있다.

### HYPOTHESIS — BLOCKOUT

```text
BASE GRID     32 px

WIDTH         1280 px
              40 tiles

HEIGHT        1152 px
              36 tiles

X             -640 ~ +640
Y                0 ~ -1152
```

---

## 6. 전체 맵 구조

```text
Y -1152

┌──────────────────────────────────────────────────────────────┐
│                                       EXIT → 2-6             │
│                                     █████████████            │
│                                            ▲                 │
│                                       G7 ●                   │
│                                         ╱                    │
│                              P4 ───────────────              │
│                                    ▲                         │
│                                 G6 ●                         │
│                                   ╲                          │
│                         R1 ─────────────                      │
│                                   ▲                          │
│                              G5 ●                            │
│                                ╲                             │
│                                 ╲                            │
│             UPPER TRANSIT GATE  ███████ LOCKED              │
│                                 █ STORY DISPLAY              │
│                           P3 ───────────────                  │
│                               MERGE / SAFE STORY             │
│                                     ▲                        │
│                    G3 ●──── FLOW ──┘                         │
│                      ╲                                       │
│                       ╲                                      │
│        ←──────── PATROL DRONE T1 ────────→                  │
│                                                              │
│ P2 ====================================================      │
│       PUBLIC EVACUATION WALKWAY / PRESSURE LINE              │
│                                                              │
│      WAITING / QUEUE AREA                                    │
│ S1 ─────────────────────          ● G4                       │
│        ▲                           ╱                          │
│       G1 ●                ● G2 ───                            │
│         ╲                 ╱                                  │
│          ╲               ╱                                   │
│          P1 ──────────────────                               │
│                 ▲                                            │
│          P0 ENTRY FROM 2-4                                   │
└──────────────────────────────────────────────────────────────┘

Y 0
```

---

## 7. Zone 구성

### ZONE A — ASSEMBLY APPROACH

```text
Y 0 ~ -256
```

2-4의 Dense Housing에서
Evacuation Infrastructure로 공간 언어가 바뀐다.

Player가 보는 것:

- Queue Line
- Waiting Chair
- Temporary Shelter Sign
- Water Container
- Bag
- Worker ID Tag
- Folded Blanket

아직 핵심 Status Board는 보이지 않아도 된다.

### ZONE B — PUBLIC EVACUATION WALKWAY

```text
Y -256 ~ -608
```

Patrol Drone T1 Encounter.

2-4에서 배운 Route Choice를
실제 대피 동선에 적용.

### ZONE C — UPPER TRANSIT APPROACH

```text
Y -608 ~ -768
```

모든 Route가 P3로 합류.

Drone Encounter 종료.

Story Display가 안전하게 읽히는 구간.

### ZONE D — BLOCKED TRANSIT REVEAL

```text
Y -768 ~ -864
```

핵심 Story Beat:

```text
ASSEMBLY COMPLETE
TRANSFER AUTHORIZATION PENDING
UPPER TRANSIT ACCESS RESTRICTED
```

### ZONE E — MAINTENANCE BYPASS

```text
Y -864 ~ -1152
```

Public Transit Gate는 열리지 않는다.

Player는 옆의 Maintenance Service Frame을
기존 Rope 문법으로 올라간다.

Enemy 없음.

Story를 이해한 뒤 짧게 움직이며 2-6으로 전환.

---

## 8. 좌표 / 오브젝트

### HYPOTHESIS — BLOCKOUT CANDIDATE

| ID | X | Y | Width | 역할 |
|---|---:|---:|---:|---|
| P0 | -608~-352 | 0 | 256 | Entry |
| P1 | -512~-192 | -160 | 320 | Assembly Approach |
| G1 | -448~-320 | -256 | 128 | Safe Pivot |
| S1 | -512~-192 | -352 | 320 | Waiting / Holding Deck |
| G2 | -224~-96 | -288 | 128 | Flow Pivot 1 |
| P2 | -256~+448 | -448 | 704 | Public Evacuation Walkway |
| G3 | +32~+160 | -560 | 128 | Flow Pivot 2 |
| G4 | +256~+384 | -576 | 128 | Pressure / Gate Pivot |
| P3 | +224~+512 | -672 | 288 | Gate Approach / Story Merge |
| Gate | +512~+576 | -416~-736 | 64 | Upper Transit Gate |
| G5 | +256~+384 | -768 | 128 | Maintenance Bypass Pivot 1 |
| R1 | +64~+320 | -832 | 256 | Bypass Recovery |
| G6 | -64~+64 | -928 | 128 | Maintenance Bypass Pivot 2 |
| P4 | +32~+320 | -1024 | 288 | Upper Service Landing |
| G7 | +224~+352 | -1088 | 128 | Final Pivot |
| Exit | +320~+608 | -1120 | 288 | To 2-6 |

### Patrol Drone T1 — HYPOTHESIS

```text
PATROL START
X -128
Y -544

PATROL END
X +320
Y -544
```

Drone Encounter Bounds는
Zone B에 한정하는 것을 권장한다.

Player가 P3 Story Merge에 진입하면
Drone이 더 이상 새로운 Attack Cycle을 시작하지 않아야 한다.

이것은 2-2에서 정의한:

```text
PATROL CORRIDOR OWNERSHIP
NO UNLIMITED CHASE
```

의 연장이다.

---

## 9. Safe Route

### SAFE / WAIT ROUTE

```text
P0
→ P1
→ G1
→ S1
→ Patrol 관찰
→ P2 진입
→ Drone이 반대쪽으로 이동할 때 전진
→ G4
→ P3
→ Story
→ G5
→ R1
→ G6
→ P4
→ G7
→ EXIT
```

### 특징

- 가장 넓은 Landing 사용
- Airborne Chain 최소화
- Patrol Cycle을 기다릴 수 있음
- Drone Kill 불필요
- 구조물 LOS 차단을 필수 전제로 하지 않음
- `swingImpulse = 0`에서도 통과 가능해야 함

### Safe Route의 핵심

```text
WAIT
→ READ
→ COMMIT
```

2-2에서 배운 Drone 학습을
더 긴 실제 동선에 적용한다.

---

## 10. Flow Route

### FLOW / OVERHEAD ROUTE

```text
P1
→ G2
→ Release
→ G3 Airborne Re-Attach
→ P3
```

### 특징

- Public Walkway 체류시간 최소화
- Drone Patrol Line을 짧게 교차
- 1-2 Re-Attach 학습 재사용
- RELAY 계열은 자연스러운 이점
- IMPULSE 계열은 G2에서 큰 Arc 가능
- SHEAR 계열도 동일 경로 사용 가능

### Story Lock

Flow Route도 반드시 P3를 거친다.

P3 이전에 G5로 직접 넘어가는
Full Story Skip은 허용하지 않는다.

---

## 11. Build Route

### NO BUILD-LOCKED ROUTE

2-4와 동일.

```text
IMPULSE 전용
RELAY 전용
SHEAR 전용
```

통로를 만들지 않는다.

### IMPULSE Affordance

- G2에서 큰 Arc로 Public Walkway Exposure 압축
- P2 중간 Landing Skip
- Bypass에서 G5 → P4 빠른 이동 가능성

### RELAY Affordance

- G2 → G3
- G5 → G6 → G7

연속 Re-Attach에 강점.

### SHEAR Affordance

Drone이 Public Walkway 위를 순찰할 때
Rope Line과 Drone 위치가 자연스럽게 겹치는 순간이 생길 수 있다.

하지만 Drone Kill은 필수 아님.

### Specialization

2-3 Specialization의 실제 효과가 아직 완전히 확정되지 않았으므로
특정 이름 / 수치에 Geometry를 맞추지 않는다.

---

## 12. Recovery

### Encounter Recovery

P2는 긴 Public Walkway이면서
첫 번째 Recovery Floor다.

Flow Route에서 G3를 놓쳐도:

```text
P2
```

로 떨어져
즉시 Pressure Route 또는 Safe Timing Route로 전환 가능.

### Bypass Recovery

```text
R1
```

이 G5 / G6 실패를 받아준다.

목표:

```text
재시도 ≤ 5 sec
```

### Story Zone Safety

P3에서는:

```text
NO ACTIVE DRONE FIRE
NO DAMAGE HAZARD
NO WIND
```

를 목표로 한다.

Story Text를 읽는 동안
Player가 공격받으면 실패다.

### Two-Player Recovery

P2 / P3 / R1 / P4는
두 Player가 동시에 존재해도
통행을 막지 않는 폭을 우선한다.

---

## 13. Enemy / Hazard

### PATROL DRONE T1 × 1

2-2와 2-4에서 사용한 동일 적.

### 이유 — 왜 1대인가

Sector Master Plan은 2-5에:

```text
1~2 Patrol Drone
동시 난전 금지
```

를 허용한다.

그러나 2-5에서는 **1대**를 권장한다.

이유:

1. 2-5의 새 압력은 Story + Route Integration이다.
2. 새 Enemy Count escalation까지 동시에 넣을 필요가 없다.
3. 2-7이 2대 순차 Drone Synthesis 역할을 가진다.
4. 2-5와 2-7의 기능 중복을 줄인다.

### Behavior

재사용:

```text
PATROL
→ DETECT
→ ACQUIRE
→ TRACK
→ LOCK
→ FIRE
→ RECOVER
→ PATROL
```

### 추가하지 않음

```text
CHASE
BURST
DASH
BOMB
JAM
ROPE CUT
NEW PROJECTILE
```

### Kill

Optional.

Stage Completion 조건에
Drone Death를 넣지 않는다.

---

## 14. Camera

### VERIFIED

현재 Camera는 Player를 대략:

```text
38% from left
58% from top
```

위치에 두고 추적한다.

### Opening

P1에 도달했을 때:

- Queue / Waiting Props
- Public Walkway
- Patrol Drone 일부
- Upper Transit 방향 Sign

이 읽혀야 한다.

### Gate Reveal

P3 도달 시:

```text
Player
+
Upper Transit Gate
+
Status Display
+
Maintenance Bypass 시작점
```

이 같은 화면 구성 안에 들어오는 것을 목표로 한다.

### Custom Pan

필수 아님.

Gate는 Level Composition으로 Landmark가 되어야 한다.

---

## 15. Story Trigger

### TRIGGER A — EVACUATION ROUTE SIGN

Zone A:

```text
CENTRAL EVACUATION WALKWAY

UPPER TRANSIT
→
```

### TRIGGER B — ENVIRONMENTAL EVIDENCE

Zone A / B:

- Waiting Chair
- Bags
- Folded Blankets
- Water Containers
- Queue Barriers
- Worker ID Tags
- Temporary Shelter Sign
- Small Children's Items

목표:

> 사람들이 실제로 이곳까지 와서 기다렸다.

### TRIGGER C — STATUS DISPLAY

P3에서 반드시 보게 되는 핵심 Story Trigger.

```text
EVACUATION GROUP C

ASSEMBLY COMPLETE

TRANSFER AUTHORIZATION
PENDING

UPPER TRANSIT
ACCESS RESTRICTED
```

### Trigger 방식

권장:

- One-shot
- Auto-trigger
- 새 Interaction Button 없음
- 짧은 Overlay 또는 World Display 확대
- 이동을 완전히 잠그는 긴 Cutscene 없음

### Multiplayer

각 Player가 자기 화면에서
Status 내용을 확인할 수 있어야 한다.

한 Player가 먼저 Trigger했다고
다른 Player의 Story Display가 사라지면 안 된다.

---

## 16. Pixel Art Asset Spec

### Upper Transit Gate

```text
128×128
or
128×192
```

Module 조합 가능.

일반 Housing Door보다 훨씬 큰
Public Infrastructure Scale.

### Status Display

World:

```text
64×48
96×64
```

Readable text는 근거리 Overlay 가능.

### Queue Barrier

```text
32×16
64×16
```

기본 Non-Collision Decoration 권장.

### Waiting Chair / Bench

```text
32×32
64×32
```

### Bag

```text
16×16
24×16
```

### Blanket / Shelter Pack

```text
16×16
32×16
```

### Water Container

```text
16×24
```

### Worker ID Tag

World prop에서는 너무 작게 읽히므로
작은 Lanyard / Badge Cluster로 표현.

### Temporary Shelter Sign

```text
64×32
96×32
```

### Maintenance Service Frame

```text
32×32
64×32
```

반복 구조.

Gameplay Collision과 명확히 정렬.

---

## 17. Background

### Production Decision

2-5 전용 Full Background를 새로 만들 필요는 없다.

Sector 02 공통 Far / Mid를 유지하고,
Near Layer를 Evacuation Infrastructure 중심으로 교체한다.

### Near Layer

```text
Queue Barrier
Waiting Bench
Transit Sign
Emergency Light
Gate Frame
Status Display
Shelter Pack
Water Container
Service Access Frame
```

### Visual Shift

2-4:

```text
RESIDENTIAL DENSITY
```

2-5:

```text
PUBLIC EVACUATION INFRASTRUCTURE
```

### 색

Base:

```text
Dark Navy
Charcoal
Old Gray
```

Evacuation Sign:

```text
Muted Yellow
Old Fluorescent Green
```

Restriction / Alert:

```text
Red / Orange
```

Rope / Grapple:

```text
Cyan
```

Cyan은 Gate UI 전체에 과용하지 않는다.

---

## 18. Sound / VFX

### Ambient

- long ventilation hum
- distant transit machinery
- idle gate actuator
- emergency fluorescent buzz
- loose plastic barrier rattle
- water container / fabric subtle movement

### Drone

2-2 / 2-4와 같은 Audio Family 재사용.

### Gate

잠긴 Gate는:

- low inactive motor hum
- occasional failed relay click

정도.

### Story Display

짧은 status flicker.

### 금지

- 사람 목소리
- 대피 방송 음성
- 비명
- 울음
- 직접적인 “Group C stay here” 음성

Story는 텍스트와 공간으로 전달한다.

---

## 19. Implementation Notes

### 19-1. Scenario Source-of-Truth Check

현재 Sector 02 Master Plan에서 2-5는:

```text
EVACUATION WALKWAY
Story Pressure + Gameplay Pressure
1~2 Patrol Drone
동시 난전 금지
New Mechanic NONE
```

으로 정의되어 있다.

이 문서는 그 범위 안에서:

```text
1 Patrol Drone
Wind NONE
```

을 선택한다.

### 19-2. LOS / Cover Dependency

**CURRENT IMPLEMENTATION RISK**

현재 Generic Enemy 기본 구현은
사거리 내 가장 가까운 Player를 선택해 발사하며,
저장소 검색에서 별도의 LOS / Cover 차단 기능은 확인되지 않았다.

따라서:

```text
Waiting Structure 뒤 = 무조건 안전
```

으로 구현하지 않는다.

Blockout Safe Route는
Patrol Timing / Encounter Bounds를 우선 사용한다.

### 19-3. Patrol Encounter Bounds

2-5 Story Trigger가 안전하려면
Patrol Drone T1이 P3 이후 Player를 계속 공격해서는 안 된다.

권장:

```text
Drone Encounter Zone = Zone B
```

Player가 Zone C에 들어가면:

- 현재 Attack Cycle 정리
- 새 Acquire 금지
- Patrol 상태 복귀

이 기능은 2-5 전용 새 Mechanic이 아니라
2-2에서 정의된 Patrol Corridor Ownership의 구현 계약이어야 한다.

### 19-4. Upper Transit Gate

Gate는 Gameplay Puzzle이 아니다.

```text
LOCKED
```

상태를 풀기 위해
스위치 찾기 / 적 처치 / Key Item을 요구하지 않는다.

Player는:

```text
"이 대피 경로는 막혀 있다."
```

를 이해하고
옆의 Maintenance Service Frame으로 진행한다.

### 19-5. Maintenance Override 논리

Player가 Maintenance Override를 사용할 수 있다고 해서
Evacuation Transfer Authorization을 발급할 수 있는 것은 아니다.

권장 시스템 구분:

```text
LOCAL MAINTENANCE ACCESS
≠
TRANSIT AUTHORIZATION
```

2-5에서는 이를 장황한 설명으로 말하지 않는다.

Level Structure만으로:

- Public Gate는 막힘
- Maintenance Service Frame은 접근 가능

을 보여준다.

### 19-6. Decoration / Collision

다음은 기본 Non-Collision:

```text
Bag
Blanket
Chair Back
Queue Rope
Small Barrier
ID Tag
Water Container
Temporary Sign
Cable
```

Gameplay Surface처럼 보이지 않게 한다.

### 19-7. Multiplayer

- Drone Attack Cycle 중 Target Lock 유지 우선
- P3 Story Trigger는 Player별 Presentation 가능
- 한 Player가 먼저 Bypass에 올라가도 다른 Player의 Status Display 유지
- P3 / R1 / P4에 두 Player 동시 착지 가능
- Gate 앞에서 Body Collision이 Story Trigger 진입을 막지 않음

---

## 20. Playtest Metrics

### 기본

```text
first clear time
skilled clear time
route chosen
route switches
drone encounter time
shots fired
shots hit
damage taken
drone killed
drone bypassed
falls
recovery time
story trigger rate
story read duration
wrong attach
```

### Story Comprehension

플레이 후 질문 1:

> "이곳 사람들은 어디까지 대피했던 것 같나요?"

기대:

> 이 Walkway / Assembly Point까지 실제로 모였다.

질문 2:

> "그 다음 왜 이동하지 못했다고 생각하나요?"

좋은 상태:

> 허가가 안 났거나 위쪽 통로가 막힌 것 같다.
> 이유는 아직 모르겠다.

나쁜 상태:

> 회사가 노동자들을 일부러 버렸다.

후자가 확정적으로 나오면
2-5의 Story Evidence가 너무 강할 수 있다.

### Story Trigger

목표:

```text
100%
```

핵심 Status Display는
정상 진행에서 Skip 불가.

### Encounter Duration

HYPOTHESIS:

```text
20–40 sec
```

첫 플레이.

### Recovery

주요 실패 후:

```text
≤ 5 sec
```

안에 해당 Challenge 재진입.

### Route Distribution

기록:

```text
Safe %
Flow %
Pressure %
Mixed %
```

2-4와 비교해
Story Landmark 때문에 한 Route만 강제되는지 확인.

### Wrong Attach

Evacuation Props 적용 후:

```text
평균 < 1회 / first clear
```

목표.

---

## 21. PASS Criteria

### Gameplay

- Difficulty ★★★로 느껴짐
- 새 Mechanic 없음
- Patrol Drone T1 1대
- Drone 새 공격 없음
- Drone Kill Optional
- Safe / Flow / Pressure 접근이 모두 가능
- Build Lock 없음
- Safe Route는 `swingImpulse = 0`에서도 통과 가능
- Story Trigger 이전에 Drone Encounter가 정리됨
- Story 읽는 동안 공격받지 않음
- Gate는 Puzzle이 아님
- Maintenance Bypass는 기존 Rope 문법만 사용

### Story

- 사람들이 실제로 Assembly를 완료했다는 사실 전달
- Transfer가 Pending이었다는 사실 전달
- Upper Transit이 Restricted였다는 사실 전달
- 누가 / 왜 막았는지는 설명하지 않음
- Group A / B 공개 없음
- `SUSPENDED` 문구 공개 없음
- 2-8의 Priority Access 공개 없음

### Multiplayer

- Player별 Story 확인 가능
- 한 Player의 Trigger가 다른 Player Story를 삭제하지 않음
- P3 Gate Approach가 Choke가 아님
- Drone Target Switching이 Telegraph를 깨뜨리지 않음

### Visual

- Evacuation Infrastructure가 Residential Stack과 구분됨
- 생활 흔적과 대피 흔적은 있지만 사람 / 시체 없음
- Story Props가 Grapple Target처럼 오해되지 않음

---

## 22. FAIL Conditions

### FAIL — Story

- `GROUP A / B` 등장
- `TRANSFER SUSPENDED` 등장
- `PRIORITY ACCESS` 등장
- 회사가 Group C를 버렸다고 직접 설명
- Human Authorization 책임자 공개
- 주민 시체 / 직접적인 참사 이미지
- 주민이 Maintenance Bypass를 쉽게 사용할 수 있어 보임

### FAIL — Gameplay

- Drone 2대 Crossfire
- 새 Drone 공격 추가
- Drone Kill 필수
- Upper Transit Gate를 열어야 Stage Clear
- Gate Unlock Puzzle 추가
- Safe Route가 LOS Cover 기능을 필수 전제
- Story Display 읽는 중 피격
- 한 번 실수로 Stage 시작점까지 복귀

### FAIL — Build

- 특정 Foundation / Specialization만 Maintenance Bypass 가능
- SHEAR가 없으면 Drone 통과 불가
- RELAY가 없으면 Flow Route 자체가 불가능

### FAIL — Visual

- Queue / Bag / Chair가 Collision Clutter를 만듦
- Gate Alert Cyan이 Rope Cyan보다 강함
- 대피구역이 군사 Checkpoint처럼 보임
- Public Walkway가 지나치게 깨끗하고 새것처럼 보임

---

## 23. 개발 구현 우선순위

### P0 — STORY-GAMEPLAY BLOCKOUT

먼저:

```text
P0
P1
S1
P2
P3
Upper Transit Gate
Maintenance Bypass
Exit
```

만 구현.

Drone 없음.

목표:

Public Evacuation Route가
Gate에서 실제로 막혀 보이는지 확인.

### P1 — ROUTE VALIDATION

Safe / Flow / Pressure가
동일 P3로 합류하는지 확인.

Story Skip 경로가 없는지 확인.

### P2 — PATROL DRONE T1

2-2에서 구현한 동일 Drone 재사용.

1대만 배치.

### P3 — ENCOUNTER BOUNDARY

P3 Story Zone에서
새 Attack Cycle이 발생하지 않는지 확인.

### P4 — STORY DISPLAY

정확한 문구 적용:

```text
EVACUATION GROUP C
ASSEMBLY COMPLETE
TRANSFER AUTHORIZATION
PENDING
UPPER TRANSIT
ACCESS RESTRICTED
```

### P5 — TWO-PLAYER TEST

Drone Target / Route Split / Gate Merge / Story Trigger 검증.

### P6 — EVACUATION PROPS

Waiting / Bag / Blanket / Water / Barrier 추가.

Wrong Attach 측정.

### P7 — ART / AUDIO

Gameplay + Story PASS 이후.

---

## 24. Stage Data Concept

**HYPOTHESIS — Runtime Schema 아님**

```js
{
    id: "sector-02-5-evacuation-walkway",

    sector: 2,
    region: 5,

    role: "evacuation-story-pressure",

    gameplay: {
        newMechanic: null,
        enemyCount: 1,
        enemyType: "patrol-drone-t1",
        wind: false,
        ropeCut: false,
        requiredKill: false
    },

    routes: [
        "safe-wait",
        "flow-overhead",
        "pressure-public-walkway"
    ],

    evacuationGate: {
        state: "restricted",
        unlockableInStage: false,
        publicRouteBlocked: true
    },

    story: {
        group: "C",
        assembly: "complete",
        transferAuthorization: "pending",
        upperTransitAccess: "restricted"
    },

    maintenanceBypass: {
        publicEvacuationRoute: false,
        requiresNewAbility: false
    },

    completion: {
        type: "reach-exit"
    },

    exit: {
        nextRegion: "sector-02-6-quiet-residential-void"
    }
}
```

---

## 25. 아트 담당자 전달문

### EVACUATION WALKWAY

핵심 이미지:

> 사람들이 대피를 위해 실제로 모였던
> Worker District의 공용 이동 통로가
> 지금은 비어 있고,
> 위쪽 Transit Gate만 닫혀 있다.

### 필요한 Near Assets

1. Large Upper Transit Gate
2. Status Display
3. Queue Barrier
4. Waiting Bench
5. Bags
6. Folded Blankets
7. Water Containers
8. Worker ID / Lanyard Cluster
9. Temporary Shelter Sign
10. Emergency Light
11. Public Transit Direction Sign
12. Maintenance Service Frame

### 분위기

```text
대피가 준비되지 않은 장소
```

가 아니라:

```text
대피를 위해 실제로 사용된 장소
하지만 다음 단계가 멈춘 장소
```

로 보여야 한다.

### 절대 넣지 않음

- Corpse
- Blood
- Human silhouette
- Crying child
- Help graffiti
- Armed military barricade
- Group A / B signage

### 색

Player / Rope 우선.

```text
Player Red Scarf
Rope Cyan
Drone Red/Orange Telegraph
Gate Restriction Red/Orange
Muted Yellow / Green Evacuation Sign
Dark Navy / Charcoal Architecture
```

---

## 26. 개발자 최종 전달 요약

### SECTOR 02-5 — EVACUATION WALKWAY

핵심:

```text
MULTI-ROUTE
+
1 PATROL DRONE
+
UNAVOIDABLE EVACUATION EVIDENCE
```

### Enemy

```text
PATROL DRONE T1 × 1
```

2-2 / 2-4와 동일.

새 공격 없음.

### Story

Player가 처음 확실히 확인:

```text
EVACUATION GROUP C

ASSEMBLY COMPLETE

TRANSFER AUTHORIZATION
PENDING

UPPER TRANSIT
ACCESS RESTRICTED
```

하지만 이유는 모른다.

### Gate

Public Upper Transit Gate는
이 Stage에서 열리지 않는다.

Player는:

```text
Maintenance Service Frame
```

을 Rope로 올라가 다음 Stage로 진행.

### 중요 구현 위험

현재 Generic Enemy에
LOS / Cover 차단이 확인되지 않았으므로
Safe Route를 Cover 의존으로 만들지 않는다.

Patrol Timing + Encounter Bounds가 우선.

---

## OPEN QUESTIONS

### 1. Patrol Drone Detection / Encounter Bounds

2-5 Story Zone 안전성을 위해
Drone이 Zone B 바깥 Player를 새로 Acquire하지 않는 계약이 필요하다.

이는 2-2 Patrol Drone 구현에서 확정하는 것이 가장 좋다.

### 2. Upper Transit Gate와 Maintenance 권한

`LOCAL MAINTENANCE ACCESS ≠ TRANSIT AUTHORIZATION`
구분은 Level Logic상 필요하다.

다만 이를 UI Text로 직접 설명할 필요는 없다.

후속 Story에서 권한 체계가 확정되면 문구를 재검토한다.

### 3. Exact Story Display Presentation

World Display만 사용할지,
근거리 Auto Overlay를 사용할지는 UI 구현과 함께 확정한다.

새 Interaction Button은 추가하지 않는다.

### 4. 2-6 공식 이름

Sector Master Plan에는:

```text
QUIET RESIDENTIAL VOID
(working title: EMPTY COURTYARD)
```

가 함께 존재한다.

2-5 NEXT 링크는 현재 Master Plan의 우선 표기인:

```text
QUIET RESIDENTIAL VOID
```

를 사용한다.

2-6 상세 설계 시작 시 최종 이름을 다시 확인한다.

---

SECTOR 02-5 / EVACUATION WALKWAY — REV 1.0
