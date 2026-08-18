# SECTOR 03-5 — COMMERCIAL SERVICE NODE

*BLOCKOUT CANDIDATE · REV 1.1 — GENERIC AUGMENT OVERRIDE*

◀ PREV — [SECTOR 03-4 / SERVICE ARCADE](../3-4/README.md) · NEXT — [SECTOR 03-6 / PREMIUM ATRIUM](../3-6/README.md) ▶

`SECTOR 03 COMMERCIAL DISTRICT` · `STAGE 05` · `REST / THIRD GENERIC AUGMENT`

## CURRENT RUNTIME OVERRIDE — 0.28.0

- 3-5의 기존 `sector-03-05:service-calibration-frame`을 세 번째 explicit `augment-node` source로 사용한다. 위치와 safe platform Geometry는 변경하지 않는다.
- 선택은 새 Hybrid·Second Specialization tier가 아니라 동일한 22장 generic Catalog의 selection index 2 offer다.
- Node의 `interact-choice` 선택과 final deck 도달을 모두 마쳐야 exit panel이 활성화된다. 특정 카드나 성공 Calibration은 요구하지 않는다.
- pending offer·선택·source 소비는 Player별이며 사망·재접속·party wipe 뒤 유지된다. 현재 채널 Player 전원이 선택한 뒤 공용 outbound objective가 완료되고, 완료 전 퇴장 Player는 route를 교착시키지 않는다.
- 아래 `NO NEW GROWTH`, Optional N1, Node 비필수, 새 Augment 금지 서술은 **AUTHORING SNAPSHOT — SUPERSEDED BY USER DECISION A / GENERIC AUGMENT V1**다. Rest, Enemy/Scanner/Wind 없음, Story 공개 제한과 안전한 Calibration Loop는 유지한다.

| 항목 | 기준 |
|---|---|
| Status | HYPOTHESIS — BLOCKOUT CANDIDATE |
| Difficulty | REST |
| Expected First Playtime | 40–70 sec |
| Expected Skilled Clear | 20–35 sec |
| Enemy | NONE |
| Scanner | NONE ACTIVE |
| New Mechanic | NONE |
| New Enemy Behavior | NONE |
| New Input | NONE |
| New Rope Mode | NONE |
| New Augment | NONE |
| Checkpoint reward | 없음 |
| Growth Decision | HOLD — no new tier in 3-5 |
| Wind | NONE |
| Damage Hazard | NONE |
| Rope Cut | NONE |
| Design Checkpoint / Reward | NONE |
| Exit | Reach → Gate Panel → opened Gate physical crossing |
| Design Carry Build | Foundation + Specialization KEEP — current runtime pending |
| Primary Role | Decompression + current-build expression check before 3-6 |
| Primary Space | Powered Commercial Back-of-House Service Calibration Room |

---

## 0. 기획 기준

### LOCKED FOR THIS STAGE

3-5는 **새 성장 선택을 지급하지 않는다.**

현재 결정:

```text
FOUNDATION
KEEP

SPECIALIZATION
KEEP

SECOND SPECIALIZATION
NO

SECONDARY AUGMENT
NO

HYBRID
NO

CHECKPOINT REWARD
NO
```

3-5의 역할은:

```text
TENSION / ROUTE CHOICE
3-4

↓

DECOMPRESSION
3-5

↓

CURRENT BUILD RE-READ
3-5

↓

LARGE MOVEMENT + SECURITY
3-6
```

이다.

### 핵심 질문

> **“지금까지 만든 Rope Build를, 아무 압박 없이 다시 한 번 내 손으로 확인할 수 있는가?”**

### 중요한 원칙

Rest Stage라고 해서:

- 긴 메뉴
- 새 Currency
- 새 Crafting
- 새 Upgrade Tree
- 새 Story Dump

를 넣지 않는다.

### 금지

- Hybrid 조기 지급
- Second Specialization 조기 지급
- Foundation / Specialization Reset
- Build Reroll
- Scanner Tutorial 재등장
- Patrol Drone
- Turret
- Wind
- Damage Floor
- Mandatory Calibration Challenge
- Node Interaction을 Gate Key로 만들기

---

## 0-1. 최신 GitHub / Runtime 교차검증

### VERIFIED — CURRENT MAIN

작성 시점 최신 `main` HEAD:

```text
9392cec1dd3512a0568b521a048d6b7050c59d39
```

PR #458에서:

```text
SECTOR 03-4 — SERVICE ARCADE
```

가 이미 병합됐다.

현재 Scenario Chain:

```text
3-1 POWERED PROMENADE
3-2 SCANNER GALLERY
3-3 RETAIL SECURITY WALK
3-4 SERVICE ARCADE
3-5 THIS DOCUMENT
```

### VERIFIED — CURRENT AUTHORED RUNTIME

현재 `CurrentAuthoredAreaCatalog`는 여전히:

```text
SECTOR 01
+
SECTOR 02
```

만 연결한다.

Sector 03 authored Runtime은 아직 없다.

따라서 3-5는:

```text
SPEC — PLANNED
```

상태다.

### VERIFIED — FOUNDATION PRODUCTION STATUS

현재 1-4 Production Alignment 기준:

```text
3 fixed Foundation choices
= AUTHORED ONLY

Foundation selection UI connection
= BLOCKED / PENDING

Foundation player state
= PENDING

Foundation network replication
= PENDING

Impulse / Relay / Shear runtime effects
= PENDING
```

즉 Foundation의 설계 철학은 확정되어 있지만
실제 플레이 가능한 성장 Runtime은 아직 완성되지 않았다.

### VERIFIED — FIRST SPECIALIZATION STATUS

2-3은:

```text
FOUNDATION
→ SPECIALIZATION
```

Stage 구조를 정의한다.

하지만 여전히 SYSTEM GATE:

- 실제 Specialization 이름
- 실제 수치
- Foundation당 후보 수
- Random / Weighted / Fixed Pool 규칙

은 확정되지 않았다.

## 0-2. Growth Decision — 왜 HOLD인가

Sector 03 Master Plan의 3-5는 원래 다음을 OPEN으로 남겼다.

```text
A. Second Specialization
B. Secondary Augment
C. Hybrid Eligibility
D. No Augment — Rest / Story only
```

3-5에서는:

```text
D
NO NEW AUGMENT
```

를 선택한다.

### A — Second Specialization을 지금 주지 않는 이유

첫 Specialization 자체의:

- 이름
- 수치
- Pool
- Runtime

이 아직 확정되지 않았다.

첫 단계가 검증되기 전에
두 번째 Specialization을 설계하면
분기 수만 늘어난다.

### B — Secondary Augment를 지금 주지 않는 이유

`Secondary Augment`가:

- 같은 Foundation 강화인지
- 다른 Foundation의 일부 기능인지
- 별도 Utility layer인지

정의가 없다.

정의되지 않은 Tier를 Stage 때문에 먼저 만들지 않는다.

### C — Hybrid를 지금 주지 않는 이유

Hybrid는:

```text
두 Behavior의 조합
```

이어야 의미가 있다.

현재는 첫 Foundation + 첫 Specialization의
실제 플레이 결과도 확보되지 않았다.

따라서 Hybrid를 지금 열면:

```text
expression before validation
```

이 된다.

### D — Rest / Diagnostic을 선택하는 이유

3-4까지 Player는 이미:

```text
Scanner Timing
Patrol Timing
Public / Service Route Choice
Build Expression
```

을 연속으로 사용했다.

3-6은 다시 큰 Premium Atrium에서
Movement + Security Timing을 요구한다.

따라서 3-5가:

```text
BREATH
+
BUILD RE-READ
```

를 담당하는 것이
게임 리듬과 구현 우선순위 모두에 맞다.

---

## 1. 한 줄 정의

3-4 Service Arcade의 Public / Service Route를 통과한 Player가,
상업공간 뒤편의 안전하고 전력이 안정된 **Commercial Service Calibration Room**에 들어가
새 Upgrade를 받지 않은 채 현재 Foundation + Specialization Rope를 짧은 비전투 Calibration Loop에서 다시 확인하고,
상단 Gate를 통해 3-6 Premium Atrium으로 진입하는 저압 Rest Stage.

---

## 2. 전체 게임에서의 역할

Sector 03 리듬:

```text
3-1
REVEAL

3-2
NEW RULE

3-3
COMBINATION

3-4
ROUTE CHOICE

3-5
REST / BUILD DIAGNOSTIC

3-6
LARGE EXPRESSION

3-7
STORY PRESSURE

3-8
SECTOR SYNTHESIS
```

3-5는 성장 시스템의 양을 늘리는 Stage가 아니다.

대신 다음 질문을 확인한다.

> **“새 Upgrade 없이도 현재 Build가 충분히 다르게 느껴지는가?”**

이 질문에 `NO`라면:

```text
3-5에서 새 Augment를 추가
```

하는 것이 아니라

```text
Foundation / Specialization 자체를 먼저 수정
```

해야 한다.

---

## 3. Story 역할

3-4에서 Player는:

```text
MAINTENANCE CLEARANCE
RECOGNIZED

LOCAL SERVICE ROUTE
AVAILABLE
```

를 확인했다.

3-5는 이 권한 범위를 다시 명확히 한다.

### Service Node Display 후보

```text
COMMERCIAL FACILITY SERVICE NODE

EMPLOYEE CLASS
VERTICAL MAINTENANCE

LOCAL SERVICE CHANNEL
AVAILABLE

VERTICAL ROUTE AUTHORIZATION
INVALID
```

### 의미

Player의 직업은:

```text
설비를 읽고
Local Service Infrastructure를 사용하는 데
실제 이점이 있다.
```

하지만:

```text
상부 도시의 이동 권한
```

을 주지는 않는다.

### 새 Story Reveal

```text
NONE
```

에 가깝게 유지한다.

3-7의 Priority / Access Tier Story를
앞당기지 않는다.

### 공개 금지

- Group A/B 정체
- Priority Customer
- Tier A / Tier B
- Executive Access
- Group C 중단 원인
- Resource Allocation 결정자
- Corporate 책임자

---

## 4. 공간 콘셉트

**COMMERCIAL BACK-OF-HOUSE CALIBRATION ROOM**

3-4의 Service Route가
잠시 넓어지는 안전한 설비실.

### 공간 언어

```text
COMMERCIAL BACK-END
+
CLEAN MAINTENANCE BAY
+
POWER DISTRIBUTION
+
GRAPPLE CALIBRATION FRAME
+
SAFE DECK
```

### 1-4와 차이

1-4:

```text
FIRST EMERGENCY OVERRIDE
FIRST BUILD CHOICE
INDUSTRIAL MAINTENANCE
```

3-5:

```text
NO NEW CHOICE
CURRENT BUILD CHECK
COMMERCIAL SERVICE INFRASTRUCTURE
```

### 2-3과 차이

2-3:

```text
FIRST SPECIALIZATION
RESIDENTIAL / PATCHED / WORN
```

3-5:

```text
NO NEW SPECIALIZATION
COMMERCIAL / POWERED / CLEANER
```

---

## 5. Pixel / Grid 기준

### VERIFIED — CURRENT MAIN

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

### HYPOTHESIS — BLOCKOUT

```text
BASE GRID     32 px

WIDTH         896 px
              28 tiles

HEIGHT        704 px
              22 tiles

X             -448 ~ +448
Y                0 ~ -704
```

3-5는 의도적으로 짧고 작다.

2-3과 달리 Mandatory Selection이 없으므로
Rest Stage 체류시간도 더 짧게 잡는다.

### Mandatory Grapple 목표

```text
160–320 px
```

정밀 Challenge 없음.

---

## 6. 전체 맵 구조

```text
Y -704

┌──────────────────────────────────────────────┐
│                         GATE → 3-6           │
│                   P4 ███████████ [PANEL]     │
│                          ▲                   │
│                      G3 ●                    │
│                        ╲                     │
│              P3 ███████████                 │
│                    ▲                         │
│                 G2 ●                         │
│                  ╱                           │
│          R1 █████████                        │
│               ▲                              │
│            G1 ●        CALIBRATION FRAME     │
│              ╲              [N1]              │
│               ╲                               │
│        P2 █████████████                       │
│             SAFE DIAGNOSTIC DECK              │
│                    ▲                          │
│        P1 █████████████████                   │
│             DECOMPRESSION                     │
│                    ▲                          │
│               P0 ENTRY                       │
└──────────────────────────────────────────────┘

Y 0
```

---

## 7. Zone 구성

### ZONE A — DECOMPRESSION

```text
Y 0 ~ -160
```

3-4의 Route / Security 판단이 완전히 끝난다.

- Enemy 없음
- Scanner 없음
- Projectile 없음
- 이동 정지 안전

### ZONE B — SERVICE DIAGNOSTIC DECK

```text
Y -160 ~ -352
```

N1 Service Calibration Frame이 보인다.

중요:

```text
Node interaction
= OPTIONAL
```

Stage 진행 필수 아님.

### ZONE C — BUILD RE-READ LOOP

```text
Y -352 ~ -576
```

G1 → G2 → G3.

짧고 안전한 Rope Loop.

새 효과를 가르치는 것이 아니다.

Player가 현재 Rope의:

```text
Momentum
Re-Attach Rhythm
Geometry
```

를 압박 없이 다시 느낀다.

### ZONE D — PREMIUM ATRIUM APPROACH

```text
Y -576 ~ -704
```

P4 / Gate.

3-6 방향에 더 큰 Commercial Void의
빛과 공간을 Preview.

---

## 8. 좌표 / 오브젝트

### HYPOTHESIS — BLOCKOUT CANDIDATE

| ID | X | Y | Width | 역할 |
|---|---:|---:|---:|---|
| P0 | -352~-128 | 0 | 224 | Entry |
| P1 | -320~+128 | -128 | 448 | Decompression Deck |
| P2 | -224~+224 | -288 | 448 | Diagnostic Deck |
| N1 | +240 | -288 | — | Optional Service Calibration Frame |
| G1 | -96~+32 | -400 | 128 | Calibration Pivot 1 |
| R1 | -192~+96 | -464 | 288 | Recovery / Landing |
| G2 | +128~+256 | -512 | 128 | Calibration Pivot 2 |
| P3 | +32~+320 | -576 | 288 | Upper Landing |
| G3 | -32~+96 | -624 | 128 | Exit Pivot |
| P4 | +160~+416 | -656 | 256 | Objective / Gate Deck |
| Gate Panel | +352 | -624 | — | Current contextual Gate Panel |
| Gate | +416 | -656 | — | To 3-6 |

### N1 역할

현재 Runtime에서 Augment 상태가 아직 없으므로
N1은 처음 구현 시:

```text
non-blocking service object
```

여도 된다.

즉 현재 구현 가능한 3-5 MVP는:

```text
PURE REST ROOM
+
SAFE ROPE CALIBRATION
+
STORY DISPLAY
+
GATE
```

까지다.

Foundation / Specialization Runtime이 실제 구현된 뒤에만
Optional Read-only Diagnostic UI를 붙인다.

Fake Build Name이나 임시 선택값을
3-5 전용으로 하드코딩하지 않는다.

---

## 9. Safe Route

```text
P0
→ P1
→ P2
→ G1
→ R1
→ G2
→ P3
→ G3
→ P4
→ Gate Panel
→ Gate
```

### 특징

- Enemy 없음
- Scanner 없음
- Damage 없음
- Wait 없음
- `swingImpulse = 0` 통과 가능
- Build 효과가 없어도 통과 가능

### 중요

N1을 Interact하지 않아도
Safe Route는 진행된다.

---

## 10. Flow Route

숙련자는:

```text
P2
→ G1
→ Release
→ G2
→ G3
→ P4
```

로 Landing을 줄일 수 있다.

### 역할

Challenge가 아니라:

```text
CURRENT ROPE FEEL
```

확인.

### 금지

- 특정 Specialization만 가능한 Chain
- Perfect Timing 강제
- Scanner Timing 결합
- Dummy Kill 요구

---

## 11. Build Diagnostic

### 현재 단계에서의 원칙

3-5는:

```text
BUILD SELECTION
```

이 아니라:

```text
BUILD OBSERVATION
```

Stage다.

### IMPULSE 계열

확인할 수 있는 느낌:

- 큰 Arc
- Release Commitment
- Momentum 유지

### RELAY 계열

확인할 수 있는 느낌:

- G1 → G2
- G2 → G3
- Re-Attach Rhythm

### SHEAR 계열

Enemy가 없으므로
Offense를 억지로 시험하지 않는다.

대신:

- Rope line placement
- crossing geometry
- release timing

을 공간적으로 확인할 수 있다.

### 중요한 제한

3-5에서:

```text
Build가 약해 보여서
추가 Power를 즉시 지급
```

하지 않는다.

이 Stage는 Playtest 측정점이다.

---

## 12. Recovery

G1 실패:

```text
P2 / R1
```

G2 실패:

```text
R1 / P3 lower edge
```

G3 실패:

```text
P3
```

목표:

```text
≤ 3 sec
```

내 재시도.

### 금지

```text
NO DAMAGE FLOOR
NO START RESET
NO FULL-STAGE FALL
NO SECURITY PRESSURE
```

---

## 13. Enemy / Hazard

```text
ENEMY            NONE
PATROL DRONE     NONE
SENTRY           NONE
SCANNER ACTIVE   NONE
WIND             NONE
TURRET           NONE
DAMAGE FLOOR     NONE
ROPE CUT         NONE
```

### 이유

3-5의 Gameplay 정보는:

```text
REST
+
CURRENT BUILD FEEL
```

하나면 충분하다.

---

## 14. Camera

### Entry

P1 / P2 / N1이
초기 화면 흐름에서 자연스럽게 보인다.

N1을 숨겨 찾게 만들지 않는다.

### Diagnostic Deck

Camera는 Player / G1 / G2를
같이 읽을 수 있어야 한다.

### Upper Preview

P3~P4에서
3-6 Premium Atrium 방향의:

- 더 큰 Void
- 밝은 Commercial light
- 높은 ceiling / open volume

을 Preview.

### Custom Pan

없음.

---

## 15. Story Trigger

### TRIGGER A — NODE ID

P2:

```text
COMMERCIAL FACILITY SERVICE NODE
```

### TRIGGER B — ACCESS SUMMARY

Optional N1 Display:

```text
EMPLOYEE CLASS
VERTICAL MAINTENANCE

LOCAL SERVICE CHANNEL
AVAILABLE

VERTICAL ROUTE AUTHORIZATION
INVALID
```

### TRIGGER C — NEXT AREA

P4:

```text
PREMIUM ATRIUM
UPPER PROMENADE
```

### 공개하지 않음

```text
PRIORITY
TIER A
TIER B
GROUP A
GROUP B
EXECUTIVE
```

3-7 Story Beat를 보존한다.

---

## 16. Pixel Art Asset Spec

### Service Calibration Frame N1

```text
64×96
96×96
```

1-4 Node보다 작고
덜 중요한 장비.

### Diagnostic Screen

```text
48×32
64×32
```

### Commercial Service Rack

```text
64×64
128×64
```

### Cable / Utility Tray

```text
32×16
64×16
```

Non-Collision Decoration 우선.

### Safe Deck Trim

```text
64×16
128×16
```

### Premium Atrium Direction Sign

```text
64×32
96×32
```

---

## 17. Background

Far / Mid는 Sector 03 Commercial Family 재사용.

3-5는 Front Retail보다
Back-of-House 비중이 높다.

### Near

- clean service wall
- diagnostic rack
- utility channel
- restrained ducts
- access panel
- maintenance light

### 중요한 차이

3-4 Service Route보다
조금 더 넓고 안정적이어야 한다.

```text
SERVICE ROUTE
= traversal

SERVICE NODE
= rest / calibration
```

### 3-6 Preview

상단 Far에:

```text
larger bright atrium volume
```

만 보여준다.

Scanner / Drone을 미리 보이지 않는다.

---

## 18. Sound / VFX

### Ambient

- clean transformer hum
- ventilation
- diagnostic relay click
- distant commercial ambience
- no alarm

### N1

Optional:

- short recognition tone
- diagnostic scan light
- no reward fanfare

### 중요한 금지

새 Augment를 받지 않으므로:

```text
LEVEL UP
POWER UP
RARE REWARD
```

같은 VFX/SFX 사용 금지.

### Exit Preview

3-6의 넓은 공간감을 위해
상단으로 갈수록 reverb가 약간 커져도 됨.

---

## 19. Implementation Notes

### 19-1. Growth Runtime Reality

현재 Foundation Runtime 자체가 아직 완성되지 않았다.

따라서 3-5 구현 우선순위는:

```text
NEW TIER
```

가 아니라:

```text
1-4 Foundation Runtime
→ 2-3 Specialization Runtime
→ 3-1~3-4 playtest
→ next growth decision
```

이다.

### 19-3. Optional Diagnostic UI

향후 Foundation + Specialization 상태가 Runtime에 들어오면
N1에서 read-only 정보 제공 가능:

```text
FOUNDATION
[CURRENT]

SPECIALIZATION
[CURRENT]
```

가능한 기능:

- 현재 Build 이름 확인
- 짧은 설명 확인

금지:

- Reroll
- Respec
- 추가 선택
- Upgrade
- Tier Unlock

### 19-4. Optional UI는 Progress Key가 아니다

현재 World Progress가 지원하는 일반 Objective는
실제 Runtime 계약에 맞춰 사용한다.

3-5 completion은:

```text
Reach P4
→ Gate Panel
→ Gate
```

이면 충분하다.

N1 Interaction은 Optional.

### 19-5. Runtime Area-Entry Anchor

현재 authored Runtime의 area entry에는
respawn/progress용 checkpoint record가 생길 수 있다.

이것은:

```text
Design Reward Checkpoint
```

가 아니다.

3-5의 Design Checkpoint / Reward는 NONE.

### 19-6. Multiplayer

- 한 Player가 N1을 보고 있어도 다른 Player Simulation은 계속
- N1 Optional UI가 생겨도 전체 Pause 금지
- Player별 Build 정보만 표시
- 다른 Player의 Foundation/Specialization 변경 금지
- P2 / R1 / P3에 2인 Landing 가능
- Gate shared open / individual crossing

### 19-7. Current Sector 03 Runtime Dependency

현재 Sector 03가 authored catalog에 연결되지 않았다.

3-5 Runtime 전제:

```text
3-1 integration
3-2 scanner implementation + integration
3-3 integration
3-4 integration
→ 3-5
```

### 19-8. Growth Gate Re-open Condition

다음 Growth Tier 설계는 최소 다음을 확인한 뒤 다시 연다.

1. Foundation 3종 실제 Runtime 구현
2. Foundation 선택 저장 / 복제
3. 첫 Specialization 실제 Catalog 확정
4. Specialization 저장 / 복제
5. 2-4 / 3-4에서 Build별 Route 사용 데이터
6. 각 Build가 “다르게 플레이된다”는 Playtest 근거
7. 특정 Build가 Scanner / Drone / Route를 무효화하지 않는지 확인

이 조건 전:

```text
HYBRID
SECOND SPECIALIZATION
SECONDARY AUGMENT
```

를 LOCK하지 않는다.

---

## 20. Playtest Metrics

### Rest Function

```text
time spent in stage
time stationary on P2
optional node interaction rate
```

질문:

> “3-4 다음에 이 구간이 쉬어가는 느낌이었나요?”

목표:

YES.

### Build Feel

질문:

> “새 Upgrade 없이도 현재 Rope Build가 다른 Build와 다르게 느껴졌나요?”

이 질문이 3-5의 핵심.

### Foundation / Specialization

가능하면 Build별 기록:

```text
IMPULSE family:
landing skips / arc length

RELAY family:
re-attach chain count

SHEAR family:
rope geometry / release attempts
```

정확한 Runtime effect가 구현된 뒤 계측.

### Growth Desire

질문:

> “여기서 새 Upgrade가 꼭 필요하다고 느꼈나요?”

응답을 기록하되:

```text
YES
=
즉시 새 Tier 확정
```

으로 해석하지 않는다.

### Story Comprehension

질문:

> “Maintenance Clearance가 지금 무엇을 허용하나요?”

기대:

> Local Service.

실패:

> Upper Transit 전체.

---

## 21. PASS Criteria

### Gameplay

- REST 체감
- Enemy 없음
- Scanner 없음
- 새 Mechanic 없음
- 새 Augment 없음
- Build Reset 없음
- Safe Route `swingImpulse = 0` 통과
- 실패 후 3초 내 재시도
- 3-6 전 긴장 완화

### Growth

- Foundation KEEP
- Specialization KEEP
- Hybrid 미확정 유지
- Second Specialization 미확정 유지
- Secondary Augment 미확정 유지
- Foundation과 Specialization 분리 유지

### Story

- Local Service Access 재확인
- Vertical Authorization은 INVALID
- 새 Priority 정보 없음
- Group A/B 미공개
- 3-7 Story Beat 침범 없음

### Runtime Alignment

- 현재 Foundation Runtime PENDING 사실 반영
- 현재 Specialization Catalog SYSTEM GATE 반영
- N1 Optional
- Current Gate contract 유지

### Multiplayer

- 전체 Simulation Pause 없음
- 개인 Build 정보 분리
- Gate party teleport 없음

---

## 22. FAIL Conditions

### FAIL — Growth

- 3-5에서 Hybrid 확정
- 실제 첫 Specialization이 없는데 Second Specialization 설계
- Foundation / Specialization Reroll
- Build Reset
- Upgrade를 받지 않으면 Gate가 안 열림

### FAIL — Gameplay

- Rest인데 Scanner 추가
- Drone 추가
- Calibration 성공 필수
- Perfect Chain 요구
- Damage Floor
- Long Fall
- N1 찾기 Exploration

### FAIL — Story

- Priority Tier 공개
- Group A/B 정체 공개
- Maintenance Clearance = Upper Transit
- Corporate 책임자 공개
- 3-6/3-7 Story 미리 설명

### FAIL — Runtime

- Foundation 상태가 아직 없는데 fake Runtime 값 하드코딩
- Optional Diagnostic 때문에 전체 Simulation Pause
- P4 도달 즉시 Gate 자동 통과

---

## 23. 개발 구현 우선순위

### P0 — REST GRAYBOX

```text
P0
P1
P2
G1
R1
G2
P3
G3
P4
Gate
```

Enemy / Scanner / Node UI 없음.

### P1 — RANGE TEST

```text
780
Reduced
0
```

Safe progression 확인.

### P2 — TWO-PLAYER LANDING

P2 / R1 / P3 / P4.

### P3 — SERVICE NODE PROP

N1을 Non-blocking world object로 추가.

### P4 — STORY DISPLAY

Local Service / Vertical Invalid 문구.

### P5 — OPTIONAL DIAGNOSTIC UI

오직 Foundation + Specialization Runtime이 실제 구현된 뒤.

### P6 — 3-6 PREVIEW

Premium Atrium visual hint.

### P7 — ART / AUDIO

마지막.

---

## 24. Stage Data Concept

**HYPOTHESIS — Runtime code 아님**

```js
{
    id: "sector-03-05",
    sectorId: "sector-03",
    order: 5,

    name: "COMMERCIAL SERVICE NODE",
    subtitle: "REST / BUILD DIAGNOSTIC",

    gameplay: {
        enemies: [],
        scanners: [],
        hazards: [],
        newMechanic: null,
        newAugment: null,
        globalReward: null
    },

    growth: {
        foundation: "keep",
        specialization: "keep",
        secondaryAugment: "hold",
        secondSpecialization: "hold",
        hybrid: "hold"
    },

    objects: [
        {
            id: "service-diagnostic-node",
            kind: "service-calibration-frame",
            position: { x: 240, y: -288 },
            interaction: "optional",
            reward: null
        }
    ],

    completion: {
        objective: "reach-exit-deck",
        gatePanelInteraction: true,
        physicalGateCrossing: true
    },

    nextAreaId: "sector-03-06"
}
```

---

## 25. 아트 담당자 전달문

### COMMERCIAL SERVICE NODE

핵심 이미지:

> **화려한 Commercial facade 뒤에 있는 깨끗한 설비실. 전투도 보안도 잠시 사라지고, 작은 Grapple Calibration Frame과 넓은 안전 Deck만 남는다. Player가 큰 Atrium으로 다시 나가기 전 Rope를 한두 번 시험한다.**

### 필요한 Assets

1. Small Service Calibration Frame
2. Diagnostic Screen
3. Commercial Utility Rack
4. Clean Service Wall
5. Maintenance Light
6. Premium Atrium Direction Sign

### Node 시각 위계

1-4의 첫 Augment Node보다 작고 조용해야 한다.

```text
THIS IS NOT A REWARD SHRINE
```

### 금지

- 3 Choice Card
- Rare Reward Glow
- Hybrid Icon
- Giant Cyan Machine

---

## 26. 개발자 최종 전달 요약

### SECTOR 03-5 — COMMERCIAL SERVICE NODE

결정:

```text
NO NEW GROWTH
```

이번 Stage는:

```text
REST
+
CURRENT BUILD DIAGNOSTIC
```

이다.

### 이유

현재 실제 프로젝트 상태:

```text
Foundation design = defined
Foundation runtime = pending

First Specialization stage = defined
Specialization catalog/runtime = open

```

따라서 3-5에서 새 Tier를 추가하면
검증되지 않은 분기를 더 쌓게 된다.

### Player State

```text
FOUNDATION KEEP
SPECIALIZATION KEEP
```

### Node

Optional.

현재는 Prop + Story Display만으로도 Stage 구현 가능.

향후 Build Runtime 완성 뒤
Read-only Diagnostic UI 연결 가능.

### Exit

```text
P4
→ Gate Panel
→ contextual interaction
→ opened Gate
→ individual physical crossing
→ 3-6
```

### 다음 Stage

3-6:

```text
PREMIUM ATRIUM
LARGE OPEN FLOW
+
SECURITY TIMING
```

새 성장 없이
현재 Build가 큰 공간에서 충분히 재미있는지 먼저 검증한다.

---

## OPEN QUESTIONS

### 1. 다음 Growth Tier 위치

3-5에서는 결정하지 않는다.

Foundation + Specialization Runtime 및 Playtest가 확보된 뒤
3-6~Sector 04 사이에서 다시 결정한다.

### 2. Hybrid의 정의

Hybrid 후보 이름은 과거 Roadmap에 존재하지만
실제 Runtime 계약과 prerequisite가 확정되지 않았다.

이름이 있다는 이유만으로
Hybrid Stage를 만들지 않는다.

### 3. Health / Repair Reward

Rest Stage라서 체력 회복을 줄지 여부는 별도 Health Economy 문제다.

현재 3-5에서는:

```text
FULL HEAL
```

을 LOCK하지 않는다.

Checkpoint / Death / Sector Timer와 함께 검토해야 한다.

### 4. Optional Diagnostic UI

Foundation / Specialization이 실제 구현되면 유용하다.

그 전에는 Fake Build UI를 만들지 않는다.

### 5. 3-6 난이도

3-5에서 새 Power를 지급하지 않으므로
3-6은 새 Growth를 전제로 Geometry를 만들면 안 된다.

3-6은:

```text
Foundation + first Specialization
```

만으로 모든 필수 Route가 성립해야 한다.

---

SECTOR 03-5 / COMMERCIAL SERVICE NODE — REV 1.0
