# SECTOR 03-8 — UPPER MARKET GATE

*BLOCKOUT CANDIDATE · REV 1.0*

◀ PREV — [SECTOR 03-7 / PRIORITY CONCOURSE](../3-7/README.md) · NEXT — POST-SECTOR 03 TRANSITION / BOSS FLOW TBD ▶

`SECTOR 03 COMMERCIAL DISTRICT` · `STAGE 08` · `SECTOR GENERAL FINALE` · `MARKET / ACCESS / TRANSFER SYNTHESIS`

| 항목 | 기준 |
|---|---|
| Status | HYPOTHESIS — BLOCKOUT CANDIDATE |
| Difficulty | ★★★★ |
| Expected First Playtime | 205–295 sec |
| Expected Skilled Clear | 85–130 sec |
| Enemy | Patrol Drone T1 × 2 — HORIZONTAL / NON-OVERLAPPING SECURITY TERRITORIES |
| Scanner | ACCESS SCAN FIELD × 1 shared group |
| New Mechanic | NONE |
| New Enemy Behavior | NONE |
| New Input | NONE |
| New Rope Mode | NONE |
| New Augment | NONE |
| Artifact Reward | NONE |
| Wind | NONE |
| Rope Cut | NONE for Patrol Drone |
| Required Kill | NONE |
| Boss | NONE IN THIS STAGE |
| Sector-end Checkpoint | OPEN — Boss transition contract must be locked first |
| Exit Destination | POST-SECTOR 03 TRANSITION / BOSS FLOW TBD |
| Design Carry Build | Foundation + first Specialization KEEP — current runtime pending |
| Primary Role | Sector 03 Gameplay Synthesis + Access / Evacuation Story Juxtaposition |
| Primary Space | One continuous Upper Market Gate Atrium with parallel security routes |

---

## 0. 기획 기준

### LOCKED FOR THIS STAGE

3-8은 Sector 03의 **일반 진행 Finale**다.

이 Stage에서:

```text
BOSS
= NONE
```

Boss 위치 / 정체 / 전투 / 진입 순서는
이 문서가 정하지 않는다.

또:

```text
3-8 → SECTOR 04
```

를 직접 확정하지 않는다.

현재 공통 제품 계약:

```text
SECTOR GENERAL FLOW
→ PLANNER-DEFINED BOSS ENTRY
→ BOSS FLOW
→ NEXT SECTOR
```

의 정확한 연결은 별도 확정이 필요하다.

### Gameplay Climax

새 규칙이 아니라:

```text
KNOWN SCANNER
+
KNOWN PATROL DRONE
+
KNOWN ROUTE CHOICE
+
KNOWN ROPE EXPRESSION
+
LARGER FINAL SPACE
```

를 회수한다.

### Story Climax

3-7에서 Player는:

```text
SERVICE CLASS CONTROL EXISTS
ACCESS TIER CONTROL EXISTS
PRIORITY ROUTE ACTIVE
```

를 확인했다.

3-8은 처음으로 같은 Upper Commercial 이동 환경 안에:

```text
EVACUATION TRANSFER ARCHIVE
+
ACCESS CONTROL ARCHIVE
```

가 함께 존재했음을 보여준다.

하지만:

```text
Priority Access
CAUSED
Group C Suspension
```

은 확정하지 않는다.

### 금지

- Boss
- 새 Enemy Type
- Drone T2
- Drone 3대 이상
- 두 Drone activation overlap
- 지속 Crossfire
- Scanner Faster Variant
- Scanner Damage
- Scanner Forced Detach
- Security Shutter
- Moving Platform
- Train / Rail Motion
- Wind
- Turret
- 새 Augment
- Hybrid
- Kill Gate
- Group A/B/C ↔ Access Tier 직접 매핑
- Corporate 책임자 공개
- Sector 04 Transit Mechanic 선행 사용

---

## 0-1. 최신 GitHub / Runtime 교차검증

### VERIFIED — CURRENT MAIN

작성 중 재확인한 최신 `main` HEAD:

```text
6fa3a44a0efdfd8b51bc8056bf6baeef173a390d
```

PR #461에서 Scenario Art Reference의 공통 Runtime-alignment 규격이 병합됐다.

이 변경은 Gameplay Runtime 자체를 바꾸는 것이 아니라
Stage Art Reference가 현재 Runtime의 Camera Zone / Stable ID / 정확한 오브젝트 수를 따라야 한다는 제작 계약을 강화한다.

현재 GitHub `main` Scenario Tree에는:

```text
3-1
3-2
3-3
3-4
3-5
README.md
```

가 반영돼 있다.

현재 대화에서 검토 완료된:

```text
3-6 PREMIUM ATRIUM
3-7 PRIORITY CONCOURSE
```

는 작성 시점 아직 `main`에 병합되지 않았다.

따라서 두 문서가 GitHub에 반영될 때
내용이 변경되면 3-8도 다시 인접 Stage 검증한다.

### VERIFIED — CURRENT AUTHORED RUNTIME

현재 `CurrentAuthoredAreaCatalog.js`는:

```text
SECTOR 01
+
SECTOR 02
```

만 실제 World에 assemble한다.

Sector 03 Runtime Catalog는 아직 없다.

즉 3-8은:

```text
SPEC — PLANNED
```

이며 현재 배포 authored world에 아직 존재하지 않는다.

### VERIFIED — CURRENT ROPE

```text
Player Radius            15
Gravity                  1250
Max Horizontal Speed     360
Jump Speed               440

Rope Max Attach Distance 440
Attach Buffer            0.1 sec
Swing Impulse            780
Release Angular Transfer 0.55

Camera Desktop Zoom      1
Camera Mobile Zoom       0.72
```

### VERIFIED — CURRENT ENEMY

```text
Enemy Attack Range       520

Acquire                  0.25 sec
Track                    0.80 sec
Lock                     0.20 sec
Fire Interval            1.40 sec

Projectile Speed         260
Projectile Damage        20
Rope Disabled On Hit     0.60 sec
```

### VERIFIED — PATROL / TARGET CONTRACT

Current Patrol Drone T1 family:

```text
NO VALID TARGET
→ PATROL

VALID TARGET
→ LOCK TARGET
→ PATROL PAUSE
→ ACQUIRE / TRACK / LOCK / FIRE / COOLDOWN

TARGET INVALID
→ RESET
→ PATROL RESUME
```

Projectile:

```text
no-rope-cut
```

rule을 사용한다.

### VERIFIED — COVER LOS CAPABILITY

Generic Enemy에는:

```text
cover-ends-los
```

capability가 존재한다.

하지만 Patrol Drone T1 baseline authored rules에는
그 rule이 없다.

따라서 3-8 Safe Route는
Cover에 의존하지 않는다.

### VERIFIED — STATIC GRAPPLE FILTER

Current Rope targeting:

```text
surface.grappleable === false
→ skip
```

지원.

### IMPLEMENTATION DEPENDENCY — ACCESS SCAN FIELD

현재 `main` 코드 검색에서:

```text
grappleAccessGroup
dynamic scanner phase attach eligibility
```

Runtime 구현은 확인되지 않는다.

따라서 Scanner는 계속
3-2 Runtime Spike 선행 조건이다.

---

## 0-2. Boss / Timer / Transition Cross-Check

공통 `sector-timer-and-boss-flow` 계약:

```text
Sector General Timer
→ areas 사이에서 계속 유지
→ Gate 통과 때 보충

Planner-defined Boss Entry
→ General Timer / Collapse 종료
→ Remaining Time 폐기
→ Boss Timer 시작

Boss Defeat
→ Next Sector
→ New General Timer
```

### 3-8에서 확정하는 것

```text
THIS IS THE FINAL GENERAL STAGE OF SECTOR 03
```

### 3-8에서 확정하지 않는 것

```text
3-8 Final Gate
=
Boss Entrance
```

인지,

```text
3-8
→ transition room
→ Boss
```

인지,

```text
Checkpoint
→ Boss
```

인지 아직 모른다.

따라서 개발자는 3-8의 final gate를
임의로:

```text
nextAreaId: sector-04-01
```

로 연결하지 않는다.

### Sector-end Checkpoint

1-8 / 2-8에는 Sector-end Checkpoint 사례가 있지만,
Sector 03 Boss entrance sequence가 아직 확정되지 않았다.

따라서 3-8 문서에서는:

```text
SECTOR-END CHECKPOINT
= OPEN
```

으로 둔다.

Boss 전환 계약과 함께 별도 확정한다.

---

## 0-3. Story Disclosure Cross-Check

### 2-8에서 이미 본 정보

```text
EVACUATION GROUP A
TRANSFER COMPLETE

EVACUATION GROUP B
TRANSFER COMPLETE

EVACUATION GROUP C
TRANSFER SUSPENDED

UPPER TRANSIT ROUTE
PRIORITY ACCESS: ACTIVE
```

### 3-7에서 새로 확인한 정보

```text
SERVICE CLASS CONTROL
STANDARD / PREMIUM PROFILES

ACCESS TIER CONTROL

PRIORITY ROUTE
ACTIVE
```

의미:

```text
Priority / Access 분류가
Commercial 이동체계의 구조적 일부
```

였다.

### 3-8에서 추가할 정보

새로운 Group 결과를 발명하지 않는다.

대신:

> **2-8에서 본 Transfer 기록과 3-7에서 본 Access 기록이
> 같은 Upper Commercial Gate의 운영 환경 안에 나란히 보관되어 있었다.**

를 확인한다.

### 인과관계는 금지

3-8에서도 Player는 아직 모른다.

- A가 Priority였는가
- B가 Premium이었는가
- C가 Standard였는가
- Priority가 C 중단의 직접 원인이었는가
- 누가 Tier를 정했는가
- 누가 대피 Resource를 배분했는가

### Sector 03 종료 질문

> **“이 Access 규칙과 대피 결과는 어떤 관계였고, 누가 그 규칙을 만들었지?”**

---

## 1. 한 줄 정의

3-7 Priority Concourse를 통과한 Player가
거대한 **Upper Market Gate Atrium**에 진입해,
좌측 `MARKET RING`의 넓은 Landing과 Patrol Drone,
중앙 `PRIORITY FLOW SPINE`의 연속 Access-Controlled Mount,
우측 `SERVICE FRAME`의 Rope Chaining과 별도 Patrol Drone 중
자신에게 맞는 비용을 선택해 하나의 상부 Merge로 올라가고,
마지막 Scanner Commit 뒤 안전한 Archive Deck에서
**Group A/B/C Transfer 기록과 Commercial Access-Control 기록이 같은 상부 이동환경에 병치되어 있었음**을 확인한 뒤
미확정 Post-Sector 03 Gate에 도달하는 Sector 03 일반 진행 Finale.

---

## 2. 전체 게임에서의 역할

Sector 03 회수:

```text
3-1
POWERED COMMERCIAL REVEAL

3-2
ACCESS SCAN FIELD

3-3
SCANNER + PATROL

3-4
PUBLIC / SERVICE ROUTE

3-5
REST / BUILD DIAGNOSTIC

3-6
LARGE ATRIUM FLOW

3-7
ACCESS-TIER STORY PRESSURE

3-8
FULL COMMERCIAL SYNTHESIS
+
STORY JUXTAPOSITION
```

### 2-8과 다른 Finale

2-8:

```text
LOWER PATROL BAND
→
UPPER PATROL BAND
```

이라는 Vertical Security Pressure가 강했다.

3-8:

```text
WEST DRONE TERRITORY
│
CENTRAL SCANNER SPINE
│
EAST DRONE TERRITORY
```

를 **평행하게 선택**한다.

즉 Drone 2대를 쓰지만:

```text
DRONE 1
→ DRONE 2
```

순차 Encounter가 아니다.

---

## 3. Story 역할

### Story Deck에는 두 Archive가 있다

#### ARCHIVE A — EVACUATION TRANSFER

```text
EVACUATION TRANSFER ARCHIVE

GROUP A
TRANSFER COMPLETE

GROUP B
TRANSFER COMPLETE

GROUP C
TRANSFER SUSPENDED
```

#### ARCHIVE B — ACCESS CONTROL

```text
UPPER COMMERCIAL ACCESS ARCHIVE

SERVICE CLASS CONTROL
ENABLED

ACCESS TIER CONTROL
ENABLED

PRIORITY ROUTE
ACTIVE
```

### 핵심 연출

두 Archive는:

```text
SAME DECK
SAME OPERATING ENVIRONMENT
```

에 있지만:

```text
SAME TABLE
SAME ROW
SAME COLOR CODE
ARROW CONNECTION
```

으로 직접 연결하지 않는다.

### 이유

Player가 해야 할 것은:

```text
NOTICE THE JUXTAPOSITION
```

이지:

```text
READ A CONFIRMED CAUSAL MAP
```

이 아니다.

### 구체적 금지

다음 UI 금지:

```text
GROUP A → PRIORITY
GROUP B → PREMIUM
GROUP C → STANDARD
```

또:

```text
C SUSPENDED
BECAUSE
PRIORITY ACTIVE
```

금지.

---

## 4. 공간 콘셉트

**UPPER MARKET GATE ATRIUM**

Sector 03의 Commercial architecture를 한 번에 회수한다.

```text
POLISHED MARKET FRONT
+
CENTRAL PRIORITY CONTROL
+
BACK-OF-HOUSE SERVICE FRAME
+
LARGE OPEN VOID
+
TRANSFER / ACCESS ARCHIVE
```

### 전체 형태

```text
                  FINAL CONTROL / POST-SECTOR GATE
                              ▲
                         P6 ███████
                              ▲
                         G6 ●
                              ▲
                   A1 █████████████
                      ARCHIVE DECK
                              ▲
                         C4 ●
                              ▲
                         G4 ●
                              ▲
                   M1 █████████████
                       UPPER MERGE
                 ▲         ▲         ▲
                 │         │         │
              W3 ●       C3 ●       S3 ●
              ▲            ▲          ▲
          WEST D1       CENTRAL      EAST D2
              ▲         SCANNER        ▲
              W2           C2          S2
              ▲            ▲          ▲
              W1           ▲           S1
                 ╲         │         ╱
                  M0 █████████████
                    ROUTE CHOICE
                         ▲
                       P2
                         ▲
                       C1
                         ▲
                       G1
                         ▲
                       P1
                         ▲
                       P0
```

---

## 5. Pixel / Grid 기준

### VERIFIED

```text
Rope Max Attach Distance 440
```

### HYPOTHESIS — BLOCKOUT

```text
BASE GRID     32 px

WIDTH         1600 px
              50 tiles

HEIGHT        1568 px
              49 tiles

X             -800 ~ +800
Y                0 ~ -1568
```

### Mandatory Grapple 목표

```text
160–390 px
```

### Finale 원칙

3-8은 이미:

- 3 Route
- Scanner
- 2 Drone
- Story Climax

를 담는다.

440px Max Range 자체를
추가 시험으로 사용하지 않는다.

---

## 6. 전체 맵 구조

```text
Y -1568

┌──────────────────────────────────────────────────────────────────────────┐
│                        POST-SECTOR 03 GATE / TBD                         │
│                              P6 ████████ [PANEL]                         │
│                                   ▲                                      │
│                               G6 ●                                       │
│                                 ╱                                        │
│                    A1 █████████████████                                  │
│                       ARCHIVE / STORY DECK                               │
│                              ▲                                           │
│                           C4 ● [CONTROLLED]                              │
│                              ▲                                           │
│                           G4 ●                                           │
│                              ▲                                           │
│                    M1 █████████████████                                  │
│                       UPPER MERGE                                        │
│                ▲             ▲             ▲                             │
│              W3 ●       C3A ● [CTRL]       S3 ●                         │
│                ▲            ╱╲             ▲                             │
│      ← DRONE D1 →     C3 ● [CTRL]      ← DRONE D2 →                    │
│                ▲          ╱                 ▲                             │
│              W2 ●     C2 ● [CTRL]          S2 ●                          │
│                ▲             ▲             ▲                             │
│              W2 ●            │             S2 ●                          │
│                ▲             │             ▲                             │
│              W1 ●            │             S1 ●                          │
│                 ╲            │            ╱                              │
│                    M0 █████████████                                      │
│                       ROUTE CHOICE                                       │
│                              ▲                                           │
│                         P2 ███████                                       │
│                              ▲                                           │
│                         C1 ● [CONTROLLED]                                │
│                           ╱                                              │
│                         G1 ●                                             │
│                           ╲                                              │
│                        P1 █████████                                      │
│                              ▲                                           │
│                         P0 ENTRY                                         │
└──────────────────────────────────────────────────────────────────────────┘

Y 0
```

---

## 7. Zone 구성

### ZONE A — MARKET GATE REVEAL

```text
Y 0 ~ -512
```

P0 → P1 → G1 → C1 → P2.

Enemy 없음.

C1은 Scanner Reminder.

Player가 위쪽의:

- Market Gate volume
- 좌/중/우 Route
- 두 Drone의 먼 Silhouette

를 순차적으로 인지.

### ZONE B — M0 FINAL ROUTE CHOICE

```text
Y -608
```

M0는 완전 Safe.

보여야 할 것:

```text
WEST MARKET RING
CENTRAL PRIORITY SPINE
EAST FACILITY SERVICE
```

두 Drone의 patrol도 보이되
M0는 둘의 activation 밖.

### ZONE C — PARALLEL SECURITY TERRITORIES

```text
Y -640 ~ -960
```

세 Route가 **동시에 존재**.

#### WEST — MARKET RING

```text
M0
→ W1
→ W2
→ W3
→ M1
```

- Scanner 없음
- D1 activation 있음
- wide / readable
- long lateral route
- Kill Optional

#### CENTRAL — PRIORITY FLOW SPINE

```text
M0
→ C2
→ C3
→ C3A
→ M1
```

- D1/D2 activation 모두 없음
- Scanner Timing
- shortest
- fewer landings
- missed window = wait / drop recovery

#### EAST — FACILITY SERVICE FRAME

```text
M0
→ S1
→ S2
→ S3
→ M1
```

- Scanner 없음
- D2 activation 있음
- more rope chaining
- narrower landings
- Kill Optional

### ZONE D — M1 UPPER MERGE

```text
Y -1024
```

세 Route 완전 합류.

Scanner 없음.
Drone new acquire 없음.

M1은 잠깐 숨을 돌리는 Deck이지만
Story Deck은 아니다.

### ZONE E — FINAL SCANNER COMMIT

```text
Y -1024 ~ -1248
```

M1 → G4 → C4 → A1.

Enemy 없음.

Sector 03의 대표 Mechanic을
마지막으로 단순하게 회수.

### ZONE F — ARCHIVE STORY DECK

```text
Y -1280
```

A1.

```text
NO SCANNER
NO NEW DRONE ACQUIRE
NO NEW DRONE FIRE CYCLE
NO WIND
NO ENVIRONMENTAL HAZARD
```

A1은 P6로 가는 Mandatory Traversal Deck이다.

Player가 A1 bounds에 진입하면
두 Archive가 존재한다는 Story Beat 자체는 자동 Trigger되어
Story Climax를 이동 Skill로 완전히 Skip할 수 없게 한다.

개별 Terminal을 가까이서 읽는 것은 추가 확인 행동으로 남겨도 된다.

현재 Runtime 특성상 이미 발사된 Projectile은
activation을 벗어났다고 즉시 삭제되지는 않으므로,
A1은 Security Territory에서 충분히 멀리 떨어뜨린다.

### ZONE G — FINAL CONTROL APPROACH

```text
Y -1280 ~ -1568
```

A1 → G6 → P6.

Gameplay Pressure 없음.

Beyond-Gate에는
더 무겁고 infrastructure-like한 구조 Silhouette를
멀리 보여줄 수 있다.

하지만:

```text
TRAIN
MOVING PLATFORM
RAIL MOTION
```

을 작동시키지 않는다.

또 Gate가 Sector 04로 바로 연결된다고 표시하지 않는다.

---

## 8. 좌표 / 오브젝트

### HYPOTHESIS — BLOCKOUT CANDIDATE

| ID | X | Y | Width | 역할 |
|---|---:|---:|---:|---|
| P0 | -672~-416 | 0 | 256 | Entry |
| P1 | -576~-256 | -160 | 320 | Reveal Deck |
| G1 | -512~-384 | -288 | 128 | Permanent Lower Pivot |
| C1 | -224~-96 | -384 | 128 | Controlled Mount — reminder |
| P2 | -224~+96 | -480 | 320 | Lower Landing |
| M0 | -192~+192 | -608 | 384 | Final Route Choice Deck |
| W1 | -416~-288 | -704 | 128 | West Pivot 1 |
| W2 | -448~-320 | -864 | 128 | West Pivot 2 |
| W3 | -320~-192 | -960 | 128 | West Exit Pivot |
| C2 | -192~-64 | -704 | 128 | Central Controlled Mount 1 |
| C3 | +64~+192 | -832 | 128 | Central Controlled Mount 2 |
| C3A | -192~-64 | -960 | 128 | Central Controlled Mount 3 |
| S1 | +256~+384 | -704 | 128 | Service Pivot 1 |
| S2 | +320~+448 | -864 | 128 | Service Pivot 2 |
| S3 | +160~+288 | -960 | 128 | Service Exit Pivot |
| M1 | -192~+192 | -1024 | 384 | Upper Merge Deck |
| G4 | +160~+288 | -1120 | 128 | Upper Permanent Pivot |
| C4 | -64~+64 | -1184 | 128 | Final Controlled Mount |
| A1 | -256~+256 | -1280 | 512 | Safe Archive Story Deck |
| G6 | +192~+320 | -1376 | 128 | Final Control Pivot |
| P6 | +256~+576 | -1472 | 320 | Final Control / Gate Deck |
| Gate Panel | +512 | -1440 | — | contextual gate-style panel |
| Final Gate | +608 | -1472 | — | destination / timer semantics TBD |

### SCANNER GROUP — HYPOTHESIS

```text
ID:
scanner-upper-market-A

Controls:
C1
C2
C3
C3A
C4

Timing:
reuse 3-2 baseline

Phase:
shared
```

### 이유

Finale에서 Scanner 수를 늘리는 것이 아니라
공간적 맥락을 바꾼다.

```text
ONE READABLE SECURITY CLOCK
```

유지.

### DRONE D1 — WEST

```text
Start:
X -512
Y -800

End:
X -192
Y -800

Speed:
48

Wait:
0.45

Mode:
pingpong
```

Activation:

```text
X -640 ~ -160
Y -928 ~ -640
```

### DRONE D2 — EAST

```text
Start:
X +192
Y -800

End:
X +512
Y -800

Speed:
48

Wait:
0.45

Mode:
pingpong
```

Activation:

```text
X +160 ~ +640
Y -928 ~ -640
```

### 핵심

두 Activation은:

```text
NO OVERLAP
```

한다.

Central Spine:

```text
X around 0
```

은 두 Drone activation 모두 밖이다.

---

## 9. WEST MARKET RING — Safe / Combat Route

### Route

```text
P0
→ P1
→ G1
→ C1
→ P2
→ M0
→ W1
→ W2
→ W3
→ M1
→ G4
→ C4
→ A1
→ G6
→ P6
```

### 비용

```text
D1 EXPOSURE
+
LONGER ROUTE
```

### 보상

- Scanner wait 없음 in main security territory
- wide / readable geometry
- predictable landings

### Safe Route 의미

3-8의 가장 안정적인 traversal route 후보.

`Safe`는:

```text
NO ENEMY
```

가 아니라:

```text
MOVEMENT ERROR TOLERANCE HIGH
```

라는 뜻.

M0에서 Drone 위치를 읽고 진입.

### Kill

Optional.

---

## 10. CENTRAL PRIORITY FLOW SPINE — Timing Route

### Route

```text
P0
→ P1
→ G1
→ C1
→ P2
→ M0
→ C2
→ C3
→ C3A
→ M1
→ G4
→ C4
→ A1
→ G6
→ P6
```

### 비용

```text
SCANNER TIMING
+
FEWER RECOVERY LANDINGS
```

### 보상

```text
SLIGHTLY SHORTEST TOTAL LINE
NO DRONE NEW ACQUIRE
NO STABLE MID-LANDING
```

### 중요한 균형

Scanner는 Damage가 없으므로
Central이 자동 최적해가 되지 않게:

- C2 → C3 → C3A를 좌우 Zig-Zag로 배치
- C2 / C3 / C3A 사이 Stable Landing 없음
- 총 이동선 길이를 West / East와 크게 벌어지지 않게 조정
- missed attach는 M0/lower catch로 복귀
- Window를 기다릴 수는 있음
- Exact frame timing은 금지

### `swingImpulse = 0`

Landing / Wait를 사용하면
Mandatory Clear 가능해야 한다.

### Build Lock 금지

Relay가 유리할 수 있지만
Relay 없이는 못 가는 Route가 아니다.

---

## 11. EAST FACILITY SERVICE FRAME — Build Route

### Route

```text
P0
→ P1
→ G1
→ C1
→ P2
→ M0
→ S1
→ S2
→ S3
→ M1
→ G4
→ C4
→ A1
→ G6
→ P6
```

### 비용

```text
D2 EXPOSURE
+
MORE ATTACH / RELEASE
+
NARROWER LANDINGS
```

### 보상

```text
NO SCANNER WAIT
+
BUILD EXPRESSION
```

### IMPULSE

M0 → S1 및
S2 → S3 구간에서
Arc / Landing 압축.

### RELAY

가장 자연스럽게 빛남.

```text
S1
→ S2
→ S3
→ M1
```

### SHEAR

S1 → S2 Rope가
D2 patrol y=-800을 가로지른다.

위치가 맞으면:

```text
attach S2
→ rope crosses D2
→ release
```

공격적 선택.

Kill Optional.

---

## 12. Route Recovery / Switching

### Route Selection

M0에서
West / Central / East를 모두 고를 수 있다.

### Mid-Route Switching

3-8에서는
security territory 중간의 free crossover를
강제로 제공하지 않는다.

이유:

3-7에서 이미
Route Cost를 읽고 선택하는 학습을 완료했다.

3-8에서는:

```text
COMMIT TO A COST PROFILE
→
EXECUTE
→
MERGE AT M1
```

을 Final Expression으로 본다.

### 하지만 Build Lock은 아님

Route 선택은:

```text
KEY LOCK
```

가 아니다.

실패해서 M0로 떨어지면
다른 Route로 바꿀 수 있다.

### WEST Recovery

W1 실패:

```text
M0 / west lower catch
```

W2 실패:

```text
W1 / west catch
```

W3 실패:

```text
W2 / M1 lower edge
```

### CENTRAL Recovery

C2/C3 실패:

```text
M0 / central lower catch
```

### EAST Recovery

S1 실패:

```text
M0 / east lower catch
```

S2/S3 실패:

```text
previous service pivot / service catch
```

### 목표

```text
≤ 5 sec
```

내 다시 진입.

---

## 13. Enemy / Hazard

### PATROL DRONE T1 × 2

둘은 같은 T1.

새 Variant 없음.

### D1

West Market Ring 담당.

### D2

East Service Frame 담당.

### Activation Territory

```text
D1
WEST ONLY

D2
EAST ONLY
```

No overlap.

### Multiplayer 의미

두 Player가:

```text
A → WEST
B → EAST
```

를 선택하면
각자 다른 Drone에 노출될 수 있다.

한 Drone이 반대편 Route Player를
cross-route target으로 획득하지 않는다.

### Projectile

각 Drone:

```text
Damage   20
Speed    260
Interval 1.40
Rope Cut NONE
```

### Crossfire

지속적인 Crossfire 금지.

두 Drone은
서로 다른 target territory를 갖는다.

이미 발사된 Projectile이
territory 밖으로 이동할 수는 있으므로
Geometry Playtest로 우발적 trajectory overlap을 확인한다.

### Scanner

```text
Damage          0
Forced Detach   0

AVAILABLE / WARNING
→ new attach allowed

LOCKED / RESET
→ new attach denied
```

### Hazard Budget

```text
WIND            NONE
TURRET          NONE
MOVING PLATFORM NONE
SHUTTER         NONE
DAMAGE FLOOR    NONE
TRAIN MOTION    NONE
```

---

## 14. Camera

### P1 / P2

먼저 큰 Market Gate volume을 보여준다.

두 Drone을 처음부터
모두 전투 대상으로 크게 강조하지 않는다.

### M0 — FINAL ROUTE CHOICE SHOT

가장 중요.

M0에서:

```text
WEST route shape + D1
CENTRAL C2/C3/C3A + Scanner state
EAST route shape + D2
M1 general direction
```

이 읽혀야 한다.

### Camera Constraint

Mobile `0.72`에서도
세 Route의 공간적 차이가 읽혀야 한다.

필요하다면 Map width를 줄이되
Stage-specific zoom 변경을 필수로 만들지 않는다.

### M1

Threat density 감소.

C4 / A1 방향이 우선 보임.

### A1

두 Archive가 한 공간에 있음을 보여주되
UI를 한 화면에 억지로 모두 읽게 하지 않는다.

Player가 Deck 안에서
짧게 이동하며 각각 읽을 수 있다.

---

## 15. Story Trigger

### TRIGGER A — MARKET GATE

P1:

```text
UPPER MARKET GATE
ACCESS CONTROL ACTIVE
```

### TRIGGER B — ROUTE DIRECTORY

M0:

```text
MARKET RING
PRIORITY SPINE
FACILITY SERVICE
```

### TRIGGER C — TRANSFER ARCHIVE

A1 left:

```text
EVACUATION TRANSFER ARCHIVE

GROUP A
TRANSFER COMPLETE

GROUP B
TRANSFER COMPLETE

GROUP C
TRANSFER SUSPENDED
```

### TRIGGER D — ACCESS ARCHIVE

A1 right:

```text
UPPER COMMERCIAL ACCESS ARCHIVE

SERVICE CLASS CONTROL
ENABLED

ACCESS TIER CONTROL
ENABLED

PRIORITY ROUTE
ACTIVE
```

### 중요 — 두 기록의 시각적 관계

허용:

```text
same deck
same facility
different terminals
```

금지:

```text
same table rows
same color categories
matching icons
connecting arrows
shared A/B/C labels
exact one-to-one layout
```

### TRIGGER E — FINAL CONTROL

P6:

```text
UPPER CONTROL
ROUTE STATUS
PENDING
```

정도.

현재 3-8의 **Stage-local completion point는 P6 도달**이다.

Final Gate / Panel은 다음 Post-Sector destination이 확정되기 전까지:

```text
BLOCKOUT VISUAL / HOLD
```

로 취급하며,
아직 progression objective로 연결하지 않는다.

### 금지

```text
NEXT: SECTOR 04
BOSS AHEAD
TRANSIT BOSS
```

같은 미확정 전환 정보.

---

## 16. Pixel Art Asset Spec

### Upper Market Gate Header

```text
96×32
128×32
```

### Market Balcony Module

```text
128×32
256×32
```

### Priority Spine Frame

```text
64×64
128×64
```

### Facility Service Frame

```text
64×64
128×64
```

### Evacuation Archive Terminal

```text
64×64
96×96
```

### Access Archive Terminal

```text
64×64
96×96
```

두 Terminal은 같은 UI System Family지만
동일한 3-row 카드 구조로 만들지 않는다.

### Scanner

3-2 reuse.

### Controlled Mount

3-2 reuse.

### Patrol Drone T1

Sector 02 reuse.

```text
24×24 ~ 32×32
```

### Final Gate

현재 Gate 사람 Scale 계약 유지.

Destination architecture는
미확정 Transition을 과도하게 암시하지 않는다.

---

## 17. Background

### Sector 03 Final Visual

Sector 03의:

```text
BRIGHT
POLISHED
POWERED
EMPTY
COMMERCIAL
```

을 가장 크게 회수.

### FAR

- upper market terraces
- large commercial void
- distant infrastructure silhouette
- powered signs
- high vertical service core

### MID

- suspended market facade
- access control bridge
- service truss
- transfer-control shell

### NEAR

- route signs
- scanner housing
- archive terminals
- Gate frame
- Drone

### Sector 04 Preview 제한

Far에:

```text
heavier structural frame
large conduit
static transit-like infrastructure silhouette
```

정도 가능.

금지:

- 실제 움직이는 Train
- Moving Rail
- Conveyor gameplay
- Moving Platform
- Transit signal gameplay

Sector 04의 Gameplay Identity를 미리 소비하지 않는다.

---

## 18. Sound / VFX

### West

- market electrical ambience
- Drone servo
- projectile cue
- no Scanner cue in main route

### Central

- scanner state
- large atrium reverb
- minimal combat sound

### East

- utility hum
- relay click
- Drone servo

### M1

Threat layer 감소.

### A1

- neutral archive terminal sound
- low HVAC
- distant machinery
- no alarm
- no dramatic villain sting

### Story Reveal Tone

두 Archive가 함께 있다는 사실은 중요하지만:

```text
PLOT TWIST FANFARE
```

금지.

Player가 스스로 연결을 의심하게 한다.

### Final Gate

Low mechanical confirmation.

Boss music / Sector04 music 미리 재생 금지.

---

## 19. Implementation Notes

### 19-1. Current Runtime Boundary

현재 Sector 03 Runtime Catalog 없음.

3-8은 다음 선행 필요:

```text
Sector 03 authored catalog
3-1 integration
3-2 Scanner Runtime
3-3
3-4
3-5
3-6
3-7
→ 3-8
```

### 19-2. Scanner Group

```text
scanner-upper-market-A
```

하나.

Controls:

```text
C1
C2
C3
C4
```

shared phase.

### 19-3. Controlled Surface Invariant

C1/C2/C3/C3A/C4는:

```text
DEDICATED CONTROLLED SURFACE SEGMENT
```

동일 위치에 Always-Grappleable Parent Surface 겹침 금지.

### 19-4. Parallel Drone Territories

D1 / D2 activation:

```text
NO OVERLAP
```

필수.

두 Drone을 하나의 큰 activation으로 두고
nearest player를 서로 바꿔가며 쏘게 만들지 않는다.

### 19-5. Central Spine Safety

Central x≈0은
D1/D2 activation 밖.

안전 근거:

```text
activation bounds
```

이지 Cover가 아니다.

### 19-6. Shear Geometry

West:

```text
W1 → W2
```

East:

```text
S1 → S2
```

가 각각 Drone patrol line을 가로지르도록 배치.

두 Route 모두
SHEAR 공격 기회를 줄 수 있지만
Kill은 Optional.

### 19-7. In-flight Projectile

Activation 종료:

```text
NEW ACQUIRE / NEW FIRE
```

중단.

기발사 Projectile 즉시 삭제 안 됨.

M1 / A1 안전성은
거리 + geometry로 확보.

### 19-8. Final Gate — DO NOT WIRE YET

P6 도달을 3-8의 현재 Stage-local completion으로 본다.

P6의 Gate visual / panel은
Blockout에 둘 수 있지만:

```text
VISUAL HOLD
```

상태다.

Runtime에서는 다음이 확정되기 전:

```text
nextAreaId
panel objective
physical crossing
timer semantic
checkpoint semantic
boss-entry semantic
```

을 하드코딩하지 않는다.

특히:

```text
nextAreaId: "sector-04-01"
```

금지.

### 19-9. Sector Timer

3-8은 Sector 03 General Timer의 일부.

이 Stage 진입 자체로
Timer reset 없음.

Final Gate가 일반 Gate인지
Boss-entry boundary인지 확정된 뒤
Timer 보충 / 종료 semantics를 연결한다.

### 19-10. Checkpoint

Sector-end checkpoint는
Boss transition과 함께 OPEN.

3-8 문서만 보고:

```text
checkpoint reward
checkpoint respawn
```

을 새로 구현하지 않는다.

### 19-11. Build Runtime

Design:

```text
Foundation + first Specialization KEEP
```

Current runtime effects pending.

따라서 모든 Mandatory Route는
Base Rope clearable.

### 19-12. Multiplayer

#### Route Split

```text
Player A → West
Player B → East
```

허용.

또:

```text
A → Central
B → West/East
```

허용.

#### Targeting

D1은 West activation Player만.
D2는 East activation Player만.

#### Merge

M1 / A1 / P6는 2인 landing 폭 확보.

#### Story

한 Player가 A1에 먼저 도착해도
다른 Player를 teleport하지 않는다.

Archive UI가 생겨도
global pause 금지.

#### Final Gate

shared open / individual crossing 원칙은
destination contract가 확정된 뒤 적용.

### 19-13. Sector 04 Reservation

3-8에서:

```text
Transit Motion
Infrastructure Motion
Moving Rail
Moving Platform
```

구현 금지.

Sector 04의 디자인 공간으로 남긴다.

---

## 20. Playtest Metrics

### Route Selection

```text
west chosen
central chosen
east chosen

route changed after failure
route changed after clear attempt
```

### Clear

```text
first clear
skilled clear

west clear time
central clear time
east clear time
```

### West

```text
D1 shots
D1 hits
D1 kill / bypass
W1/W2 falls
```

### Central

```text
C2 wait
C3 wait
locked attach attempts
scanner cycles
central falls
```

### East

```text
D2 shots
D2 hits
D2 kill / bypass
attach count
re-attach count
service falls
```

### Final Scanner

```text
C4 wait
C4 locked attach attempt
```

### Story Comprehension

질문 1:

> “A1에서 확실히 새로 알게 된 것은 무엇인가요?”

기대:

> Transfer 기록과 Access-Control 기록이 같은 Upper Commercial Gate 환경에 함께 남아 있었다.

질문 2:

> “Group A/B/C가 각각 어떤 Access Tier였나요?”

기대:

> 아직 확정할 수 없다.

질문 3:

> “Group C가 중단된 이유가 Priority Access 때문이라고 게임이 확정했나요?”

기대:

> 아니다. 관계가 의심되지만 직접 원인은 아직 모른다.

### Finale Identity

질문:

> “2-8과 3-8의 전투 구조가 같게 느껴졌나요?”

목표:

```text
NO
```

3-8은 Parallel Route Territory로 기억돼야 한다.

---

## 21. PASS Criteria

### Gameplay

- Difficulty ★★★★
- Boss 없음
- Enemy exactly 2 T1
- horizontal activation separation
- no cross-target territory
- New Mechanic 없음
- Scanner shared group 1
- 3 distinct Route identities
- all routes Base Rope clearable
- no Build Lock
- Kill Optional
- no Wind / Turret / Shutter
- Central avoids Drone but pays Scanner / zig-zag commitment / recovery cost
- West wide + D1
- East chaining + D2
- M1 / A1 Safe Merge
- 2-8 vertical sequential Drone structure 반복 아님

### Story

Player가 이해:

```text
Evacuation records
and
Access records
coexisted in same upper movement facility
```

Player가 아직 모름:

```text
A/B/C ↔ Tier mapping
direct causality
decision maker
```

### Runtime

- current Rope 440 반영
- current Enemy FSM 반영
- cover LOS를 Patrol safety에 잘못 사용하지 않음
- Scanner dependency 정확히 표기
- Sector 03 runtime 미연결 사실 유지
- Final nextArea / boss semantics 미확정 유지

### Multiplayer

- parallel routes split 가능
- D1/D2 cross-route target 없음
- safe merge supports two players
- Story Deck no forced teleport
- no global pause

---

## 22. FAIL Conditions

### Gameplay

- D1 → D2 순차 Encounter 강제
- Drone activation overlap
- 두 Drone이 같은 Player를 장거리 Crossfire
- Drone T2
- third enemy
- Scanner independent phase puzzle
- Scanner Damage
- Scanner Forced Detach
- central route가 모든 면에서 최적
- west/east가 사실상 같은 Route
- specific Build required
- full-stage fall reset
- Sector04 moving mechanics 선행 추가

### Story

- Group A = Priority
- Group B = Premium
- Group C = Standard
- 같은 색 / 같은 row로 A/B/C와 Tier 직접 대응
- Priority 때문에 C 중단 확정
- Corporate 책임자 공개
- 사고 고의성 공개

### Boss / Transition

- Boss를 3-8 내부에 추가
- P6를 Sector04-01로 직접 연결
- Boss 위치 추정
- Final Gate에서 General Timer를 임의 종료
- Sector-end Checkpoint 임의 확정
- Boss Music 미리 재생

### Runtime

- Scanner fake local timer
- frozen surface phase mutation
- 3 Route를 별도 network rooms로 분리
- new interaction key
- Gate 자동 teleport

---

## 23. 개발 구현 우선순위

### P0 — ONE-ATRIUM THREE-ROUTE GRAYBOX

Scanner / Drone OFF.

```text
P0
P1
G1
C1 placeholder
P2
M0

West:
W1 W2 W3

Central:
C2 C3 C3A

East:
S1 S2 S3

M1
G4
C4 placeholder
A1
G6
P6
```

### P1 — RANGE / RECOVERY

```text
swingImpulse 780
reduced
0
```

모든 Mandatory Route 검증.

### P2 — ROUTE IDENTITY

Security OFF 상태에서도:

```text
West = wide / long
Central = short / low landing
East = chain-heavy
```

가 느껴지는지 확인.

### P3 — SCANNER

C1 / C2 / C3 / C3A / C4 shared group.

### P4 — D1 ONLY

West activation / recovery.

### P5 — D2 ONLY

East activation / recovery.

### P6 — TWO DRONE PARALLEL

- activation no-overlap
- 2-player split
- no cross-target
- projectile trajectory overlap

검증.

### P7 — BUILD MATRIX

Runtime 가능 시:

```text
IMPULSE
RELAY
SHEAR
×
3 routes
```

### P8 — STORY DECK

두 Archive를 별도 Terminal로 구현.

Story comprehension test.

### P9 — FINAL GATE HOLD

Boss / Transition 계약 확정 전
nextArea 연결하지 않는다.

### P10 — ART / AUDIO

Gameplay + Story PASS 후.

---

## 24. Stage Data Concept

**HYPOTHESIS — Runtime code 아님**

```js
{
    id: "sector-03-08",
    sectorId: "sector-03",
    order: 8,

    name: "UPPER MARKET GATE",
    subtitle: "COMMERCIAL SECTOR FINALE",

    boss: null,

    routes: [
        "west-market-ring",
        "central-priority-spine",
        "east-service-frame"
    ],

    gameplay: {
        newMechanic: null,
        newAugment: null,
        artifactReward: null,
        wind: false,
        requiredKill: false
    },

    scannerGroups: [
        {
            id: "scanner-upper-market-A",
            controlledSurfaceIds: ["C1", "C2", "C3", "C3A", "C4"],
            timingProfile: "scanner-gallery-baseline",
            phaseMode: "shared",
            damagePlayer: false,
            detachExistingRope: false
        }
    ],

    enemies: [
        {
            id: "drone-west",
            enemyType: "patrol-drone-t1",
            activation: {
                x: -640,
                y: -928,
                width: 480,
                height: 288
            },
            patrol: {
                points: [
                    { x: -512, y: -800 },
                    { x: -192, y: -800 }
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
        },

        {
            id: "drone-east",
            enemyType: "patrol-drone-t1",
            activation: {
                x: 160,
                y: -928,
                width: 480,
                height: 288
            },
            patrol: {
                points: [
                    { x: 192, y: -800 },
                    { x: 512, y: -800 }
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
        deck: "A1",

        evacuationArchive: [
            "group-a-transfer-complete",
            "group-b-transfer-complete",
            "group-c-transfer-suspended"
        ],

        accessArchive: [
            "service-class-control-enabled",
            "access-tier-control-enabled",
            "priority-route-active"
        ],

        forbiddenInference: [
            "group-tier-mapping",
            "priority-caused-group-c-suspension",
            "decision-maker-identity"
        ]
    },

    completion: {
        stageLocalObjective: "reach-P6",
        archiveStoryTrigger: "A1-mandatory",
        gatePanelObjective: "HOLD",
        physicalGateCrossing: "HOLD",
        postSectorDestination: "TBD",
        bossEntrySemantic: "TBD",
        sectorEndCheckpoint: "TBD"
    }
}
```

---

## 25. 아트 담당자 전달문

### CURRENT SCENARIO ART GENERATION CONTRACT

최신 공통 규격:

```text
docs/bsh/scenario/SCENARIO-ART-GENERATION-STANDARD.md
```

를 반드시 따른다.

3-8 Scenario Art Reference를 만들 때:

- 전체 Stage Map을 한 장에 그리지 않는다.
- 대표 Gameplay Camera Shot **한 장**만 만든다.
- 정확한 좌표 / 전체 Route / Activation / LOS는 Approved Blockout이 소유한다.
- Player는 정확히 **1명**.
- Player apparent body height는 현재 desktop Camera 기준 `48 × zoom`에 가깝게 유지.
- 살아 있는 Rope는 Player와 현재 Anchor 사이 **한 줄만** 표시.
- 다른 Anchor끼리 Polyline / Triangle / Network로 연결 금지.
- 화면에 보일 Drone / Anchor / Gate / Archive object 수는 선택한 Camera Zone에서 정확히 지정.
- `PENDING REGENERATION` / `RETIRED` 이미지를 새 생성 입력으로 쓰지 않는다.
- 현재 Sector 03 Runtime이 아직 미구현이므로, Scanner를 실제 배포 완료 시스템처럼 확정된 Runtime Screenshot으로 오인시키지 않는다.

3-8은 아직 Runtime Area / Camera Zone이 없으므로:

```text
APPROVED ART REFERENCE
```

를 지금 생성하지 않는다.

우선:

```text
Stage README
→ Sector 03 Runtime area
→ cameraZone / Stable ID
→ Approved Blockout
```

이 정렬된 뒤 생성한다.

### UPPER MARKET GATE

핵심 이미지:

> **Sector 03에서 가장 큰 상부 Market Atrium. 아래 M0에서 왼쪽에는 넓은 Market Ring과 작은 Drone, 중앙에는 Cyan Grapple Cue가 반복되는 Priority Spine, 오른쪽에는 얇은 Service Frame과 또 다른 Drone이 보인다. 세 Route는 위의 하나의 Merge Deck으로 합쳐지고, 그 위의 조용한 Archive Deck에는 Evacuation Terminal과 Access-Control Terminal 두 개가 서로 떨어져 서 있다.**

### 핵심 Composition

```text
LEFT
MARKET / D1

CENTER
SCANNER FLOW

RIGHT
SERVICE / D2

TOP
ARCHIVE JUXTAPOSITION
```

### 두 Archive

같은 시설 Family.

하지만:

```text
different terminal layout
different information hierarchy
no matching A/B/C colors
no connecting arrows
```

### Sector 04 Preview

Gate 너머:

```text
HEAVIER
MORE INFRASTRUCTURAL
STATIC
```

까지만.

움직이는 Rail / Train 금지.

---

## 26. 개발자 최종 전달 요약

### SECTOR 03-8 — UPPER MARKET GATE

Sector 03 General Finale.

```text
BOSS
NONE IN THIS STAGE
```

### Gameplay

```text
WEST
D1 + wide market traversal

CENTRAL
shared Scanner + shortest flow

EAST
D2 + rope chaining

→
M1 MERGE
→
C4 FINAL SCANNER
→
A1 STORY
→
P6 FINAL CONTROL
```

### Enemy

```text
Patrol Drone T1 × 2
```

하지만:

```text
HORIZONTAL
NON-OVERLAPPING ACTIVATION
```

2-8의 Vertical sequential 2-Drone 구조를 반복하지 않는다.

### Story

A1에서:

```text
TRANSFER ARCHIVE
+
ACCESS ARCHIVE
```

를 같은 환경에서 확인.

그러나:

```text
NO GROUP ↔ TIER MAPPING
NO DIRECT CAUSALITY
```

### Current Runtime Reality

Implemented:

```text
Rope physics
static grappleable filter
Patrol capability
activation bounds
Enemy FSM
optional generic cover LOS
Gate / authored progression framework
Sector 01+02 authored runtime
Scenario Art Runtime-alignment standard
```

Not Yet:

```text
dynamic Access Scan Field
Sector 03 authored runtime
3-1~3-8 integration
```

### Final Transition

```text
POST-SECTOR 03
BOSS FLOW
TBD
```

현재 3-8 completion은:

```text
A1 mandatory Story Trigger
→
reach P6
```

까지.

P6 Gate / Panel은 destination이 정해지기 전까지 HOLD.

P6를 Sector 04로 직접 연결하지 않는다.

Checkpoint / Timer / physical crossing semantics도
Boss transition과 함께 확정.

---

## OPEN QUESTIONS

### 1. 3-6 / 3-7 GitHub Merge

작성 시점 둘 다 `main` 미반영.

Merge 과정에서 내용이 달라지면
3-8 premise를 다시 검토한다.

### 2. Sector 03 Boss

위치 / 정체 / 전투 / 보상 / Stage 03-8과의 연결
모두 OPEN.

3-8이 이를 추정하지 않는다.

### 3. Sector-end Checkpoint

1-8 / 2-8 precedent는 있지만
Sector 03 Boss entrance contract와 함께 결정해야 한다.

3-8만 보고 확정하지 않는다.

### 4. Archive Information Density

두 Archive를 동시에 보여주는 것만으로
Player가:

```text
A=Priority
B=Premium
C=Standard
```

라고 확정해버리는지 Playtest.

그렇다면 정보 삭제가 아니라:

- layout separation 강화
- color mapping 제거
- Service Class 상세명 감소

순으로 수정.

### 5. Central Route Dominance

Central은 Drone이 없어
Scanner를 이해한 Player에게 자동 최적해가 될 위험이 있다.

REV 1.0 검토에서 이미:

```text
C2 → C3 → C3A
```

좌우 Zig-Zag로 수정해
직선 2-Anchor Route보다 이동선과 실패비용을 늘렸다.

추가 조정 순서:

1. recovery landing density
2. lateral offset
3. controlled mount placement
4. route length

Scanner Timing 자체를 더 빠르게 만드는 것은 후순위.

### 6. Two-Drone Projectile Overlap

Activation은 겹치지 않아도
기발사 projectile trajectory는 중앙으로 나올 수 있다.

2-player split test에서
unexpected cross-lane hits를 반드시 계측.

필요하면:

- drone y
- patrol x
- platform geometry

를 먼저 조정.

새 projectile behavior는 후순위.

### 7. Sector 04 Preview

현재는 visual silhouette only.

Sector 04 Master Plan 작성 전
3-8에 실제 Transit Gameplay를 추가하지 않는다.

---

SECTOR 03-8 / UPPER MARKET GATE — REV 1.0
