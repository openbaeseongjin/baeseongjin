# SECTOR 03-7 — PRIORITY CONCOURSE

*BLOCKOUT CANDIDATE · REV 1.0*

◀ PREV — [SECTOR 03-6 / PREMIUM ATRIUM](../3-6/README.md) · NEXT — [SECTOR 03-8 / UPPER MARKET GATE](../3-8/README.md) ▶

`SECTOR 03 COMMERCIAL DISTRICT` · `STAGE 07` · `PRIORITY / ACCESS-TIER STORY PRESSURE` · `SECURITY ROUTE SYNTHESIS`

| 항목 | 기준 |
|---|---|
| Status | HYPOTHESIS — BLOCKOUT CANDIDATE |
| Difficulty | ★★★☆ |
| Expected First Playtime | 175–250 sec |
| Expected Skilled Clear | 70–105 sec |
| Enemy | Patrol Drone T1 × 1 |
| Scanner | ACCESS SCAN FIELD × 1 shared group |
| New Mechanic | NONE |
| New Enemy Behavior | NONE |
| New Input | NONE |
| New Rope Mode | NONE |
| New Augment | NONE |
| Checkpoint reward | 없음 |
| Wind | NONE |
| Rope Cut | NONE for Patrol Drone |
| Required Kill | NONE |
| Design Checkpoint / Reward | NONE |
| Exit | Reach → Gate Panel → opened Gate physical crossing |
| Design Carry Build | Foundation + first Specialization KEEP — current runtime pending |
| Primary Role | Access-Tier Story Build-up + Scanner / Drone / Multi-Route synthesis |
| Primary Space | One continuous upper Commercial Priority Concourse |

---

## 0. 기획 기준

### LOCKED FOR THIS STAGE

3-7은 Sector 03에서 처음으로:

```text
ACCESS TIER
PRIORITY ROUTE
SERVICE CLASS
```

가 Commercial 이동 체계의 **상시 구조**였다는 사실을 명확히 보여준다.

하지만 다음은 아직 말하지 않는다.

```text
GROUP A = 특정 계층
GROUP B = 특정 계층
GROUP C = 특정 계층
PRIORITY 대상 = 특정 사람
GROUP C 중단 원인 = Priority
```

### Gameplay 핵심

3-7은 새 시스템을 추가하지 않는다.

```text
KNOWN SCANNER
+
KNOWN PATROL DRONE
+
KNOWN MULTI-ROUTE
+
CURRENT BUILD
```

을 하나의 Concourse 안에서 종합한다.

### Route Identity

```text
OUTER GALLERY
Scanner timing / low enemy exposure / longer

PRIORITY SPINE
Scanner + Drone / shortest / highest timing pressure

SERVICE LATTICE
No Scanner / Drone exposure / more Rope chaining
```

### 핵심 질문

Gameplay:

> **“같은 목적지에 갈 때, 나는 어떤 비용을 감수하는 Route를 선택할 것인가?”**

Story:

> **“Priority는 비상시에 갑자기 생긴 표기가 아니라, 원래부터 이 구역의 접근 체계에 들어 있던 규칙이었나?”**

### 금지

- Drone 2대 사용
- 2-7식 두 개의 독립 Encounter Room
- Scanner 강화형
- Scanner Damage
- Scanner Forced Detach
- Drone T2
- Turret
- Wind
- Security Shutter
- Moving Platform
- Kill Gate
- 새로운 Access Key
- 특정 Build 전용 Route
- Group A/B/C와 Access Tier 직접 매핑
- 3-8 Story Climax 선행 공개

---

## 0-1. 최신 GitHub / Runtime 교차검증

### VERIFIED — CURRENT MAIN

작성 시점 최신 `main` HEAD:

```text
c9cd55b690512fa009aec03ce826e1496f15cec6
```

현재 `main`의 Sector 03 상세 Scenario Tree:

```text
3-1
3-2
3-3
3-4
3-5
README.md
```

3-6은 현재 대화에서 검토 완료된
`PREMIUM ATRIUM REV 1.0`을 직전 Stage premise로 사용하지만,
작성 시점 아직 GitHub `main`에는 병합되지 않았다.

따라서 3-6이 GitHub에 반영될 때 내용이 달라지면
3-7도 다시 인접 Stage 교차검증한다.

### VERIFIED — CURRENT AUTHORED RUNTIME

현재 `CurrentAuthoredAreaCatalog.js`는:

```text
SECTOR 01
+
SECTOR 02
```

만 실제 Runtime World에 연결한다.

현재 catalog revision:

```text
sector-01-rev3-sector-02-rev1-v2
```

따라서:

```text
SECTOR 03 authored runtime
= NOT CONNECTED
```

### VERIFIED — CURRENT ROPE PHYSICS

```text
Player Radius            15
Gravity                  1250
Max Horizontal Speed     360
Jump Speed               440

Rope Max Attach Distance 400
Attach Buffer            0.1 sec
Swing Impulse            780
Release Angular Transfer 0.55

Camera Desktop Zoom      1
Camera Mobile Zoom       0.72
```

### VERIFIED — CURRENT ENEMY TIMING

```text
Enemy Attack Range       520

Acquire                  0.25 sec
Track                    0.80 sec
Lock                     0.20 sec
Fire Flash               0.08 sec
Fire Interval            1.40 sec

Projectile Speed         260
Projectile Damage        20
Rope Disabled On Hit     0.60 sec
```

### VERIFIED — PATROL / TARGET BEHAVIOR

현재 Patrol Drone 계열은:

```text
NO VALID TARGET
→ PATROL

VALID TARGET ACQUIRED
→ LOCK TARGET
→ PATROL PAUSE
→ ACQUIRE / TRACK / LOCK / FIRE / COOLDOWN

TARGET LOST / INVALID
→ RESET
→ PATROL RESUME
```

계약을 사용한다.

3-7은 이 Runtime behavior를 재사용한다.

### VERIFIED — GENERIC LOS CAPABILITY

현재 `EnemyObject.js`에는:

```text
cover-ends-los
```

rule을 가진 Enemy에 한해
`kind === "cover"` Surface가 Line of Sight를 끊는 기능이 존재한다.

하지만 현재 Sector 02 Patrol Drone T1 authored rules는:

```text
kill-optional
no-rope-cut
target-lock-cycle
activation-band-only
```

이며:

```text
cover-ends-los
```

를 포함하지 않는다.

따라서 3-7의 Safe Route를:

```text
“광고판 뒤에 숨으면 Drone이 못 쏜다.”
```

에 의존시키지 않는다.

안전은 계속:

```text
ACTIVATION BOUNDS
```

로 설계한다.

### VERIFIED — STATIC GRAPPLE FILTER

현재 Rope Targeting은:

```text
surface.grappleable === false
→ skip
```

을 지원한다.

### IMPLEMENTATION DEPENDENCY — DYNAMIC ACCESS SCAN FIELD

현재 Main에는 아직:

```text
scanner phase
grappleAccessGroup
dynamic attach eligibility
```

가 확인되지 않는다.

따라서 3-7 Scanner는
3-2에서 정의한 Access Scan Field Runtime 구현이 선행 조건이다.

---

## 0-2. Story Disclosure Cross-Check

### 2-8 — Player가 이미 아는 것

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

확실히 아는 것:

1. A/B는 Transfer Complete.
2. C는 Suspended.
3. Worker District는 Group C와 연결됨.
4. Upper Transit에 Priority Access가 존재했음.

아직 모르는 것:

```text
A = 누구
B = 누구
Priority 대상 = 누구
왜 C만 중단
누가 결정
```

### 3-1 ~ 3-6

추가된 관찰:

```text
Commercial District의 Local Power / Service가 더 잘 유지됨
Commercial Security가 계속 작동
Maintenance Clearance는 Local Service에만 유효
Security State가 Commercial Route를 통제
```

3-6까지도:

```text
Priority Customer
Tier A / B
Group A / B 정체
```

는 공개하지 않는다.

### 3-7에서 처음 확정할 것

```text
Commercial Concourse 자체에
Service Class / Access Tier / Priority Route
구조가 평시 접근제어 체계로 존재했다.
```

### 3-7에서 절대 확정하지 않을 것

```text
Priority Access
→ Group A/B

Standard Access
→ Group C

Group C suspended
BECAUSE OF
Access Tier
```

### 3-8에 남길 것

3-8은:

```text
Evacuation Transfer 기록
+
Access Tier 기록
```

이 **같은 상부 Commercial 이동환경에 병치**되어 있음을 보여주는 Finale다.

3-7이 그 연결까지 완료하면
3-8 Story Climax가 사라지므로 금지.

---

## 1. 한 줄 정의

3-6 Premium Atrium을 빠져나온 Player가
하나의 넓은 **Upper Commercial Concourse**에서
Scanner 비용이 있지만 Drone 노출이 낮은 `OUTER GALLERY`,
Scanner와 Drone을 동시에 읽지만 가장 짧은 `PRIORITY SPINE`,
Scanner 없이 Rope Chaining과 Drone Geometry를 사용하는 `SERVICE LATTICE`
중 하나를 선택해 같은 안전한 상단 Control Deck으로 합류하고,
그곳에서 처음으로 **SERVICE CLASS / ACCESS TIER / PRIORITY ROUTE가 Commercial 이동 체계에 구조적으로 존재했다**는 기록을 확인한 뒤 3-8 Upper Market Gate로 향하는 Story Pressure Stage.

---

## 2. 전체 게임에서의 역할

Sector 03 후반:

```text
3-5
REST

↓

3-6
LARGE MOVEMENT EXPRESSION
“큰 공간을 내 Rope로 움직인다.”

↓

3-7
PRIORITY CONCOURSE
“같은 공간에도 접근 비용이 다르다.”

↓

3-8
UPPER MARKET GATE
“Evacuation 기록과 Access 기록이 같은 시스템 안에 놓여 있다.”
```

3-7은:

```text
NEW RULE
```

이 아니다.

```text
KNOWN RULES
+
STRONGER WORLD MEANING
```

Stage다.

---

## 3. Story 역할

### 핵심 Story Beat

M2 `ACCESS CONTROL DECK`에서
다음 계열의 기록을 보여준다.

```text
UPPER CONCOURSE ACCESS CONTROL

SERVICE CLASS CONTROL
STANDARD / PREMIUM PROFILES
ENABLED

ACCESS TIER CONTROL
ENABLED

PRIORITY ROUTE
ACTIVE
```

### 이 문구가 말하는 것

Player가 확실히 알 수 있는 것:

1. `SERVICE CLASS`라는 분류가 존재한다.
2. Standard / Premium이라는 서로 다른 Service Profile이 존재한다.
3. 별도의 `ACCESS TIER CONTROL`이 존재한다.
4. `PRIORITY ROUTE`가 Active 기록으로 남아 있다.
5. Priority는 단순 경고 문구가 아니라 실제 Route-Control 구조의 일부였다.
6. 그러나 Service Class와 Priority Tier의 정확한 대응관계는 아직 보이지 않는다.

### 이 문구가 말하지 않는 것

- Standard / Premium Profile이 어느 Evacuation Group과 연결되는지
- Priority Access의 대상이 누구였는지
- Group C가 특정 Service Class였는지
- A/B가 Premium/Priority였는지
- Priority 때문에 C가 중단됐는지

### Player에게 남길 질문

> **“누가 이 Tier를 사용하도록 되어 있었지?”**

그리고:

> **“2-8에서 본 A/B/C Transfer 결과와 이 Access 구조는 어떤 관계였지?”**

두 번째 질문은 생겨도 되지만
답은 3-7에서 주지 않는다.

---

## 4. 공간 콘셉트

**UPPER COMMERCIAL PRIORITY CONCOURSE**

3-4처럼:

```text
PUBLIC CORRIDOR
vs
SERVICE CORRIDOR
```

두 공간을 좌우로 완전히 분리하지 않는다.

3-7은 하나의 큰 Concourse 안에서
세 이동선이 같은 Atrium Volume을 공유한다.

```text
OUTER GALLERY
        ╲
         ╲
      CENTRAL PRIORITY SPINE
         ╱
        ╱
SERVICE LATTICE
```

### 핵심

Player가 다른 Route를 선택해도
항상:

- 다른 Route
- Drone
- Scanner state
- 상단 Story Deck

의 위치를 어느 정도 인식할 수 있다.

### 2-7과 차이

2-7:

```text
LOWER ENCOUNTER
→ FULL SAFE DECK
→ UPPER ENCOUNTER
```

3-7:

```text
ONE CONTINUOUS CONCOURSE
+
ONE DRONE
+
THREE COST PROFILES
+
ONE FINAL STORY MERGE
```

---

## 5. Pixel / Grid 기준

### VERIFIED

```text
Rope Max Attach Distance 400
```

### HYPOTHESIS — BLOCKOUT

```text
BASE GRID     32 px

WIDTH         1536 px
              48 tiles

HEIGHT        1408 px
              44 tiles

X             -768 ~ +768
Y                0 ~ -1408
```

### Mandatory Grapple Target

```text
180–390 px
```

### 이유

3-7은 이미:

- Route choice
- Scanner
- Drone
- Story pressure

를 처리한다.

Rope Max Range 자체를 추가 Challenge로 만들지 않는다.

---

## 6. 전체 맵 구조

```text
Y -1408

┌────────────────────────────────────────────────────────────────────────┐
│                                      GATE → 3-8                       │
│                              P5 ███████████ [PANEL]                   │
│                                     ▲                                 │
│                                 G5 ●                                  │
│                                   ╱                                   │
│                   M2 █████████████████                                │
│                      ACCESS CONTROL STORY DECK                         │
│                     ▲          ▲          ▲                           │
│                     │          │          │                           │
│                C2 ● │      G4 ● │      S4 ●                           │
│        OUTER GALLERY │   PRIORITY│   SERVICE LATTICE                  │
│               ▲      │     SPINE │      ▲                             │
│            O2 ███    │      C3 ● │   S3 ●                             │
│               ▲      │        ╲  │      ╲                             │
│               │      │        ← PATROL D1 →                          │
│               │      │                                                │
│                   M1 █████████████████                                │
│                      SAFE ROUTE-CHOICE DECK                            │
│                    ▲          ▲                                       │
│                 O1 ███      S2 ●                                      │
│                    ▲          ▲                                       │
│                  C1 ●       S1 ●                                      │
│                     ╲       ╱                                         │
│                    P1 ███████████                                     │
│                         ▲                                              │
│                    P0 ENTRY                                           │
└────────────────────────────────────────────────────────────────────────┘

Y 0
```

---

## 7. Zone 구성

### ZONE A — CONCOURSE ENTRY

```text
Y 0 ~ -256
```

P0 / P1.

Enemy 없음.

Scanner state를 멀리서 볼 수 있지만
즉시 압박 없음.

Route Sign:

```text
OUTER CONCOURSE
PRIORITY SPINE
FACILITY SERVICE
```

정도.

### ZONE B — LOWER ROUTE IDENTITY

```text
Y -256 ~ -576
```

두 방식으로 M1에 도달.

#### Outer / Priority Entry

```text
P1
→ C1
→ O1
→ M1
```

C1 Scanner Timing 사용.

Drone 없음.

#### Service Entry

```text
P1
→ S1
→ S2
→ M1
```

Scanner 없음.

Attach 횟수 증가.

### ZONE C — M1 SAFE ROUTE-CHOICE DECK

```text
Y -576
```

완전 Safe.

M1에서 세 Route를 동시에 비교.

보여야 하는 것:

- O2
- C2
- C3
- G4
- S3
- S4
- Drone D1 patrol

M1은 Drone activation 밖.

### ZONE D — THREE-COST SECURITY FIELD

```text
Y -640 ~ -976
```

3-7 Gameplay 핵심.

#### ROUTE A — OUTER GALLERY

```text
M1
→ O2
→ C2
→ M2
```

비용:

```text
SCANNER
+
LONGER DISTANCE
```

보상:

```text
NO DRONE NEW ACQUIRE
```

#### ROUTE B — PRIORITY SPINE

```text
M1
→ C3
→ G4
→ M2
```

비용:

```text
SCANNER
+
DRONE ACTIVATION
```

보상:

```text
SHORTEST
+
FEWEST LANDINGS
```

#### ROUTE C — SERVICE LATTICE

```text
M1
→ S3
→ S4
→ M2
```

비용:

```text
DRONE ACTIVATION
+
MORE ROPE COMMITMENT
```

보상:

```text
NO SCANNER WAIT
+
SHEAR GEOMETRY
```

### ZONE E — M2 STORY MERGE

```text
Y -1056
```

모든 Route 완전 합류.

M2:

```text
NO SCANNER
NO NEW DRONE ACQUIRE
NO NEW DRONE FIRE CYCLE
NO WIND
NO ENVIRONMENTAL HAZARD
```

Story를 안전하게 읽는 Deck이다.

단 현재 Runtime 계약상 이미 발사된 Projectile은
activation을 벗어났다고 즉시 삭제되지 않으므로,
M2 진입 직후 기발사 탄이 지나갈 수 있는지는
Graybox Playtest에서 확인한다.

### ZONE F — 3-8 APPROACH

```text
Y -1056 ~ -1408
```

G5 → P5.

Story를 읽은 뒤
짧은 free-flow Exit.

3-8 Gate silhouette / Market control architecture Preview.

3-8의 Evacuation archive 내용은 미리 보여주지 않는다.

---

## 8. 좌표 / 오브젝트

### HYPOTHESIS — BLOCKOUT CANDIDATE

| ID | X | Y | Width | 역할 |
|---|---:|---:|---:|---|
| P0 | -640~-384 | 0 | 256 | Entry |
| P1 | -544~-160 | -160 | 384 | Concourse Entry Deck |
| C1 | -256~-128 | -320 | 128 | Controlled Mount — lower outer/priority entry |
| O1 | -448~-192 | -416 | 256 | Lower Outer Gallery Landing |
| S1 | -96~+32 | -288 | 128 | Service Pivot 1 |
| S2 | +224~+352 | -416 | 128 | Service Pivot 2 |
| M1 | -192~+192 | -576 | 384 | Safe Route-Choice Deck |
| O2 | -512~-256 | -736 | 256 | Outer Gallery Upper Landing |
| C2 | -352~-224 | -864 | 128 | Outer Controlled Mount |
| C3 | +0~+128 | -736 | 128 | Priority Spine Controlled Mount |
| G4 | +64~+192 | -896 | 128 | Priority Spine Permanent Pivot |
| S3 | +288~+416 | -736 | 128 | Service Lattice Pivot 3 |
| S4 | +320~+448 | -896 | 128 | Service Lattice Pivot 4 |
| M2 | -192~+192 | -1056 | 384 | Access Control Story Deck |
| G5 | +128~+256 | -1184 | 128 | Exit Flow Pivot |
| P5 | +224~+544 | -1312 | 320 | Objective / Gate Deck |
| Gate Panel | +480 | -1280 | — | contextual Gate Panel |
| Gate | +576 | -1312 | — | To 3-8 |

### SCANNER GROUP S1 — HYPOTHESIS

```text
ID:
scanner-priority-concourse-A

Controls:
C1
C2
C3

Timing:
reuse 3-2 baseline

Phase:
shared
```

### 중요한 이유

3-7에서:

```text
C1
C2
C3
```

를 서로 다른 위상으로 만들면
Route Choice가 아니라 Timer 퍼즐이 된다.

따라서 하나의 읽기 쉬운 State를 공유.

### PATROL DRONE D1 — HYPOTHESIS POSITION / VERIFIED BEHAVIOR FAMILY

```text
Start:
X -64
Y -800

End:
X +416
Y -800

Speed:
48

Wait:
0.45 sec

Mode:
pingpong
```

Activation:

```text
X -160 ~ +544
Y -976 ~ -640
```

결과:

```text
M1 = OUTSIDE

O2 = OUTSIDE
C2 = OUTSIDE

C3 = INSIDE
G4 = INSIDE

S3 = INSIDE
S4 = INSIDE

M2 = OUTSIDE
```

---

## 9. OUTER GALLERY — Safe Route

### Route

```text
P0
→ P1
→ wait if needed
→ C1
→ O1
→ M1
→ O2
→ wait if needed
→ C2
→ M2
→ G5
→ P5
→ Gate Panel
→ Gate
```

### 비용

```text
Scanner Timing
+
Longer lateral movement
+
More landings
```

### 보상

Drone activation에 들어가지 않는다.

### Safe Route 정의

3-7의 가장 안전한 Route.

단:

```text
NO SECURITY
```

Route는 아니다.

Scanner Timing은 사용한다.

### `swingImpulse = 0`

Mandatory clear 가능해야 한다.

---

## 10. PRIORITY SPINE — Flow Route

### Route

```text
P0
→ P1
→ C1
→ M1
→ C3
→ G4
→ M2
→ G5
→ P5
```

### 비용

C3 / G4가 Drone activation 안.

```text
SCANNER
+
DRONE
```

동시 압력.

### 보상

- 가장 짧음
- Landing 적음
- 중앙 Concourse Arc
- 숙련 Momentum 보상

### 핵심

Player는 M1에서:

```text
Scanner State
+
Drone Position
```

을 보고 Commit.

한 번 들어간 뒤에는
멈춰 기다리기보다 M2까지 Flow 유지.

### 금지

Priority Spine이:

```text
“Priority 권한이 있어야만 들어갈 수 있는 문”
```

처럼 Key Gate가 되면 안 된다.

Player는 권한 없는 상태로
Rope Timing을 이용해 통과한다.

---

## 11. SERVICE LATTICE — Build Route

### Route

```text
P0
→ P1
→ S1
→ S2
→ M1
→ S3
→ S4
→ M2
→ G5
→ P5
```

### 비용

```text
MORE ATTACH / RELEASE
+
DRONE ACTIVATION
```

### 보상

```text
NO SCANNER WAIT
```

### IMPULSE

M1 → S3 / upper merge에서
Arc 압축 가능.

### RELAY

가장 자연스러운 Route.

```text
S1
→ S2
→ M1
→ S3
→ S4
```

연속 Re-Attach rhythm.

### SHEAR

S3 → S4 Rope line이
Drone patrol y=-800을 가로지른다.

따라서 위치가 맞으면:

```text
S3
→ attach S4
→ rope crosses D1
→ release
```

공격적 해법 가능.

Kill Optional.

### 중요

Service Route는:

```text
BEST ROUTE
```

가 아니다.

Scanner Wait는 없지만
Drone Exposure와 Rope 입력 수가 늘어난다.

---

## 12. Recovery

### Lower

C1 실패:

```text
P1
or
O1
```

Service lower 실패:

```text
P1
or
lower catch
```

### M1 이후 OUTER

O2 / C2 실패:

```text
M1
or
outer recovery ledge
```

Drone new acquire 없음.

### PRIORITY SPINE

C3 / G4 실패:

```text
M1
or
central lower catch
```

M1 복귀 목표.

### SERVICE LATTICE

S3 / S4 실패:

```text
M1
or
service lower catch
```

### M2

모든 Route의 완전한 Safe Merge.

### Recovery 목표

```text
≤ 5 sec
```

내 다시 Route 선택 가능.

### 이미 발사된 Projectile

Activation 밖으로 나가면:

```text
NEW ACQUIRE / NEW FIRE
```

는 중단되지만
기발사 Projectile까지 즉시 삭제되는 것은 아니다.

M2는 충분한 폭과 위치로
기발사 탄을 회피하고 Story를 읽을 수 있어야 한다.

### 금지

```text
NO FULL-STAGE FALL
NO START RESET
NO DAMAGE FLOOR
NO RECOVERY INSIDE SUSTAINED NEW FIRE
```

---

## 13. Enemy / Hazard

### PATROL DRONE T1 × 1

3-7에서 2대를 쓰지 않는다.

### 이유

3-8 Finale가:

```text
2 max / separated
```

를 사용할 수 있어야 한다.

또 2-7에서 이미
2 Drone sequential 구조를 사용했다.

3-7의 난이도는 Enemy 수가 아니라:

```text
ROUTE COST CHOICE
+
STORY PRESSURE
```

에서 만든다.

### Current Behavior

```text
NO TARGET
→ patrol

TARGET ACQUIRED
→ patrol pause
→ acquire
→ track
→ lock
→ fire
→ cooldown

TARGET INVALID
→ reset
→ patrol resume
```

### Patrol Rule

```text
no-rope-cut
```

유지.

### LOS

Generic Runtime에는
`cover-ends-los` capability가 있지만
Patrol Drone T1 baseline에는 해당 rule이 없다.

따라서:

```text
OUTER GALLERY SAFE
```

의 근거는 Cover가 아니라
activation x-range 밖이라는 사실이다.

### Scanner

3-2 Rule 그대로.

```text
AVAILABLE / WARNING
→ new attach allowed

LOCKED / RESET
→ new attach denied

existing rope
→ stays attached

Damage
→ 0

Forced Detach
→ 0
```

### Hazard Budget

```text
WIND            NONE
TURRET          NONE
SHUTTER         NONE
MOVING PLATFORM NONE
DAMAGE FLOOR    NONE
SECOND DRONE    NONE
```

---

## 14. Camera

### P1

보여야 할 것:

- C1
- S1
- Route signage
- M1 방향

전체 3개 Route를 한 화면에 완전히 설명할 필요 없음.

### M1 — 가장 중요

M1에서 반드시 동시에 읽혀야 한다.

```text
O2 / C2
C3 / G4
S3 / S4
Drone D1
Scanner State Cue
```

Player가:

> “어디로 갈지 선택한다.”

고 느끼는 지점.

### Mobile Zoom

`0.72`에서도
세 Route는 색만이 아니라
공간 위치 / 구조 / Surface density로 구분돼야 한다.

### M2

Story panel이
Enemy / Scanner Telegraph보다 우선 읽힌다.

M2 진입 후
화면 내 Threat Cue 밀도를 의도적으로 낮춘다.

### Custom Pan

없음.

---

## 15. Story Trigger

### TRIGGER A — CONCOURSE SIGN

P1:

```text
UPPER CONCOURSE

OUTER GALLERY
PRIORITY SPINE
FACILITY SERVICE
```

### TRIGGER B — ACCESS CONTROL DIRECTORY

M2:

```text
UPPER CONCOURSE ACCESS CONTROL

SERVICE CLASS CONTROL
STANDARD / PREMIUM PROFILES
ENABLED

ACCESS TIER CONTROL
ENABLED

PRIORITY ROUTE
ACTIVE
```

### Story Interpretation

이 기록은:

```text
Commercial access system
had differentiated service/access states
```

를 확인한다.

### 금지 해석을 직접 쓰지 않는다

```text
STANDARD = GROUP C
PREMIUM = GROUP B
PRIORITY = GROUP A
```

금지.

### TRIGGER C — 3-8 PREVIEW

P5:

```text
UPPER MARKET GATE
TRANSFER CONTROL
```

정도.

여기서:

```text
EVACUATION GROUP A/B/C
```

를 다시 출력하지 않는다.

그 병치는 3-8의 Story Climax다.

---

## 16. Pixel Art Asset Spec

### Priority Concourse Header

```text
96×32
128×32
```

### Access Control Directory

```text
96×64
128×96
```

### Outer Gallery Balcony

```text
128×32
256×32
```

### Priority Spine Frame

```text
64×64
128×64
```

### Service Lattice Frame

```text
64×64
128×64
```

### Premium / Standard Service Sign

```text
64×32
96×32
```

### Scanner

3-2 Asset reuse.

```text
64×64
96×64
```

### Controlled Mount

3-2 reuse.

```text
32×16
64×16
```

### Patrol Drone T1

Sector 02 reuse.

```text
24×24 ~ 32×32
```

---

## 17. Background

### Sector 03 Family

Far / Mid는 기존 Commercial Family 재사용.

### 3-7의 차별화

3-6:

```text
SCALE
```

3-7:

```text
ORDER / ACCESS
```

### FAR

- upper concourse volume
- repeated illuminated terraces
- distant controlled bridge
- market tower silhouettes

### MID

- concourse signage
- differentiated entry frames
- premium-service facade
- service frame behind polished skin

### NEAR

- route markers
- scanner
- access directory
- controlled mount
- minimal security trim

### 중요한 규칙

`Priority`를 Gold Neon으로 과장해서:

```text
이게 악당/부자 Route다
```

라고 즉시 읽히게 만들지 않는다.

Premium / Priority는:

```text
cleaner
more maintained
more controlled
```

정도의 차이로 표현.

---

## 18. Sound / VFX

### Outer Gallery

- clean commercial ambience
- Scanner cue
- 낮은 Drone sound

### Priority Spine

- Scanner cue
- Drone servo
- projectile cue
- stronger open-concourse reverb

### Service Lattice

- utility hum
- relay click
- Drone servo
- no Scanner cue

### M2 Story Deck

Threat SFX를 줄인다.

Access Directory:

- neutral system confirmation
- no villain sting
- no dramatic reveal chord

### 이유

이 정보는:

```text
악당의 자백
```

이 아니라:

```text
정상적으로 존재하던 시스템 기록
```

이어야 한다.

---

## 19. Implementation Notes

### 19-1. Current Runtime Boundary

현재 Sector 03는 authored Runtime에 연결되지 않았다.

3-7 선행:

```text
Sector 03 catalog
3-1
3-2 Scanner Runtime
3-3
3-4
3-5
3-6
→ 3-7
```

### 19-2. Scanner Group

```text
scanner-priority-concourse-A
```

한 Group으로:

```text
C1
C2
C3
```

를 제어.

독립 phase 금지.

### 19-3. Controlled Surface Invariant

C1 / C2 / C3:

```text
DEDICATED CONTROLLED SURFACE SEGMENT
```

이어야 한다.

동일 위치에 Always-Grappleable Parent Surface를 겹치지 않는다.

### 19-4. Deliberate Scanner Avoidance

Service Lattice는
의도적으로 Scanner를 사용하지 않는다.

이것은 Bug / Bypass가 아니다.

Player가 대신:

```text
more rope input
+
drone exposure
```

를 지불한다.

### 19-5. Outer Route Safety

Outer O2 / C2는
Drone activation x-range 밖으로 유지.

Cover / LOS에 의존하지 않는다.

### 19-6. Patrol Rule

3-7 Patrol Drone에는 기존 T1 rules만 사용.

```text
kill-optional
no-rope-cut
target-lock-cycle
activation-band-only
```

`cover-ends-los`를 3-7 전용으로 새로 추가하지 않는다.

### 19-7. Story Deck Safety

M2에서는:

```text
Scanner none
new Drone acquire none
Wind none
Hazard none
```

Story를 읽는 동안
Gameplay 실패가 일어나지 않게 한다.

### 19-8. Gate Contract

P5:

```text
reach objective
→ Gate Panel
→ contextual interaction
→ Gate open
→ individual physical crossing
→ 3-8
```

### 19-9. Build Runtime

Design:

```text
Foundation + first Specialization KEEP
```

현재 Runtime effect는 pending.

그래서:

```text
ALL MANDATORY ROUTES
= BASE ROPE CLEARABLE
```

### 19-10. Multiplayer

2인 플레이:

#### Split

```text
Player A → OUTER
Player B → SERVICE / PRIORITY
```

허용.

#### Drone

activation 안 Player만 eligible.

Outer Player를
cross-route target으로 잡지 않는다.

#### M1

2명 모두 대기 가능.

#### M2

2명 동시에 Story 확인 가능.

Story Trigger는 한 Player가 먼저 진입해도
다른 Player의 이동을 강제하지 않는다.

#### Gate

shared open / individual crossing.

### 19-11. 3-8 Story Handoff

3-7이 소유:

```text
Access Tier structure exists
Priority Route is structurally active
```

3-8이 소유:

```text
Evacuation records
+
Access records
same upper movement environment
```

이 경계를 넘지 않는다.

---

## 20. Playtest Metrics

### Route Choice

```text
outer chosen
priority spine chosen
service chosen

route choice at M1
route abandon / switch before commit
```

### Clear

```text
first clear
skilled clear

outer clear time
priority clear time
service clear time
```

### Scanner

```text
C1 wait
C2 wait
C3 wait
locked attach attempts
warning attach attempts
```

### Drone

```text
priority route shots
service route shots

hits
kill / bypass
activation dwell
```

### Rope

```text
attach count
re-attach count
landing count
fall count
wrong attach
```

### Story Comprehension — 핵심

질문:

> “M2 기록을 보고 새로 확실히 알게 된 것은 무엇인가요?”

기대:

> Commercial 구역에는 Standard/Premium 같은 Service Class와 Priority Access Tier가 실제로 있었다.

### 과도한 해석 체크

질문:

> “Group A/B/C가 각각 어떤 Tier였다고 확정할 수 있나요?”

기대:

> 아직 확정할 수 없다.

FAIL:

> A=Priority, B=Premium, C=Standard라고 게임이 확정했다.

### Gameplay 질문

> “세 Route가 무엇이 달랐나요?”

기대:

```text
Outer:
Scanner but safer from Drone

Priority:
Scanner + Drone but short

Service:
more rope + Drone but no Scanner
```

### Route Dominance

한 Route가:

```text
clear time
risk
input load
waiting
```

모든 면에서 우수하면 FAIL 후보.

---

## 21. PASS Criteria

### Gameplay

- Difficulty ★★★☆
- 1 continuous Concourse
- Enemy 1
- Scanner 1 shared group
- New Mechanic 없음
- 3 distinct cost profiles
- All routes Base Rope clearable
- No Build Lock
- Kill Optional
- Outer avoids Drone by activation bounds
- Priority combines Scanner + Drone
- Service avoids Scanner but pays Rope + Drone cost
- Recovery ≤ 5 sec 목표
- 2-7 sequential two-encounter 반복 아님
- 3-8의 2-Drone Finale를 침범하지 않음

### Story

Player가:

```text
Access Tier system exists
Priority Route is structural
```

를 이해.

하지만:

```text
A/B/C = Tier mapping
```

은 모름.

### Runtime Alignment

- current max rope 400 반영
- current Patrol behavior 반영
- generic cover LOS 존재 / Patrol baseline 미사용 차이 반영
- Scanner Runtime dependency 명시
- Sector 03 Runtime 미연결 사실 명시
- Gate contract 유지

### Multiplayer

- Route split 가능
- Cross-route target 없음
- M1/M2 2인 수용
- Story trigger forced teleport 없음
- Gate individual crossing

---

## 22. FAIL Conditions

### Gameplay

- 2-7처럼 두 Encounter Room을 직렬 반복
- Drone 2대
- Priority Route만 실질적 정답
- Outer가 너무 느려 선택 가치 없음
- Service가 Scanner도 없고 Drone도 쉬워 최적해
- Scanner faster variant
- C1/C2/C3 독립 phase puzzle
- Scanner Damage
- Scanner forced detach
- Wind / Turret / Shutter 추가
- specific Augment gate
- 실패 시 Stage Entry로 복귀

### Runtime

- `cover-ends-los`가 없는 Patrol Drone인데 Cover를 Safe Route 핵심으로 사용
- frozen Surface `grappleable` phase mutation
- Scanner가 구현되지 않았는데 fake timer만 local render에 넣음
- 3-7을 별도 network room 3개로 분리
- Gate 자동통과

### Story

- Group A = Priority 확정
- Group B = Premium 확정
- Group C = Standard 확정
- Priority 때문에 C 중단 확정
- “상류층 우선” 같은 직접 설명 문구
- Corporate 책임자 공개
- Evacuation Group A/B/C를 M2에 다시 표시
- 3-8 Story Climax 소진

---

## 23. 개발 구현 우선순위

### P0 — THREE-ROUTE GRAYBOX

Scanner / Drone OFF.

```text
P0
P1

C1 / O1
S1 / S2
M1

O2 / C2
C3 / G4
S3 / S4
M2

G5
P5
Gate
```

### P1 — RANGE VALIDATION

```text
swingImpulse 780
reduced
0
```

세 Route 모두 Mandatory Clear 검증.

### P2 — ROUTE COST TEST

Scanner / Drone 없이도:

```text
Outer = longer
Priority = short
Service = more chaining
```

이 느껴지는지 먼저 확인.

### P3 — SCANNER ONLY

C1 / C2 / C3 same group.

### P4 — PATROL ONLY

D1 + activation.

확인:

```text
O2/C2 outside
C3/G4 inside
S3/S4 inside
M2 outside
```

### P5 — COMBINED

세 Route 비용 비교.

### P6 — STORY

M2 Access Directory.

Story comprehension test.

### P7 — BUILD MATRIX

Runtime 가능 시:

```text
IMPULSE / RELAY / SHEAR
×
3 routes
```

### P8 — MULTIPLAYER

- route split
- staggered M1 commit
- Drone target
- M2 merge
- Gate

### P9 — ART / AUDIO

마지막.

---

## 24. Stage Data Concept

**HYPOTHESIS — Runtime code 아님**

```js
{
    id: "sector-03-07",
    sectorId: "sector-03",
    order: 7,

    name: "PRIORITY CONCOURSE",
    subtitle: "ACCESS-TIER STORY PRESSURE",

    routes: [
        "outer-gallery",
        "priority-spine",
        "service-lattice"
    ],

    gameplay: {
        newMechanic: null,
        newAugment: null,
        globalReward: null,
        wind: false,
        requiredKill: false
    },

    scannerGroups: [
        {
            id: "scanner-priority-concourse-A",
            controlledSurfaceIds: ["C1", "C2", "C3"],
            timingProfile: "scanner-gallery-baseline",
            phaseMode: "shared",
            damagePlayer: false,
            detachExistingRope: false
        }
    ],

    enemies: [
        {
            id: "drone-1",
            enemyType: "patrol-drone-t1",

            activation: {
                x: -160,
                y: -976,
                width: 704,
                height: 336
            },

            patrol: {
                points: [
                    { x: -64, y: -800 },
                    { x: 416, y: -800 }
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
        triggerDeck: "M2",
        reveals: [
            "service-class-exists",
            "access-tier-exists",
            "priority-route-active"
        ],
        forbiddenInference: [
            "group-a-tier-map",
            "group-b-tier-map",
            "group-c-tier-map",
            "priority-caused-group-c-suspension"
        ]
    },

    completion: {
        objective: "reach-exit-deck",
        gatePanelInteraction: true,
        physicalGateCrossing: true
    },

    nextAreaId: "sector-03-08"
}
```

---

## 25. 아트 담당자 전달문

### PRIORITY CONCOURSE

핵심 이미지:

> **밝은 상부 Commercial Concourse 하나 안에 세 개의 수직 이동선이 보인다. 왼쪽은 넓은 Outer Gallery, 중앙은 Scanner와 Patrol Drone이 겹치는 짧은 Priority Spine, 오른쪽은 얇은 Service Lattice다. 세 길은 위의 하나의 Access Control Deck으로 모이고, 그곳의 정상적인 시스템 화면에 STANDARD / PREMIUM / PRIORITY라는 접근 구조가 조용히 표시된다.**

### Visual Hierarchy

```text
PLAYER / ROPE
>
ROUTE GEOMETRY
>
SCANNER / DRONE
>
ACCESS DIRECTORY
>
COMMERCIAL DECORATION
```

### Story Board Tone

Access Directory는:

```text
EMERGENCY RED SCREEN
```

이 아니라:

```text
NORMAL SYSTEM UI
```

처럼 보여야 한다.

이게 평소부터 존재한 분류체계라는 느낌.

### 금지

- A/B/C 아이콘
- 사람 계층 그림
- Crown / VIP 사람 그림
- Worker silhouette와 Standard를 직접 연결
- 악당 메시지

---

## 26. 개발자 최종 전달 요약

### SECTOR 03-7 — PRIORITY CONCOURSE

Role:

```text
STORY PRESSURE
+
SECURITY ROUTE SYNTHESIS
```

### Three Routes

```text
OUTER
Scanner / low Drone / longer

PRIORITY
Scanner + Drone / shortest

SERVICE
No Scanner / Drone + Rope chaining
```

### Enemy

```text
Patrol Drone T1 × 1
```

2대 아님.

3-8 Finale의 Enemy density를 보존.

### Scanner

```text
C1 / C2 / C3
one shared phase
```

### Story Reveal

처음 확정:

```text
SERVICE CLASS exists
ACCESS TIER exists
PRIORITY ROUTE is structural / active
```

아직 금지:

```text
A/B/C ↔ Tier mapping
Priority → C suspension causality
```

### Current Runtime

Implemented:

```text
Rope physics
static grappleable filter
Patrol capability
activation bounds
enemy FSM
optional cover LOS capability
Gate progression
Sector 01+02 authored world
```

Not Yet:

```text
dynamic Access Scan Field
Sector 03 runtime catalog
3-1~3-7 runtime integration
```

### 다음 Stage

3-8 `UPPER MARKET GATE`에서:

```text
Evacuation Transfer records
+
Access Tier records
```

이 같은 상부 Commercial 이동환경에 병치된 사실을
Sector 03 Finale로 회수한다.

직접 인과관계는 아직 확정하지 않는다.

---

## OPEN QUESTIONS

### 1. 3-6 GitHub Integration

작성 시점 3-6은 아직 `main` Scenario Tree에 없다.

3-6 병합본이 현재 reviewed local spec과 달라지면
3-7 PREV premise를 재검토한다.

### 2. Access Directory Wording

현재 후보는:

```text
SERVICE CLASS CONTROL
STANDARD / PREMIUM PROFILES

ACCESS TIER CONTROL

PRIORITY ROUTE
ACTIVE
```

처럼 **Service Class와 Access Tier를 같은 3단계 목록으로 정렬하지 않는 방식**이다.

목표는:

```text
여러 접근 분류가 존재
```

까지만 확정하고,

```text
A/B/C ↔ Standard/Premium/Priority
```

자동 대응을 억제하는 것.

Playtest에서 여전히 A/B/C 직접 매핑이 강하게 발생하면
Service Profile의 개별 명칭 노출을 더 줄인다.

### 3. Scanner Runtime

3-2 Scanner Runtime PASS가 선행 조건.

Scanner 실패 시
3-7만 임시 Laser Hazard로 교체하지 않는다.

Sector 03 전체 Mechanic을 다시 검토한다.

### 4. Patrol Cover Rule

현재 Generic Enemy는 `cover-ends-los`를 지원하지만
Patrol Drone baseline은 사용하지 않는다.

3-7 Playtest 편의를 위해
Patrol Drone에 이 rule을 추가하는 것은
새 Enemy Behavior 변경이므로
별도 검토 없이 하지 않는다.

### 5. 3-8 Information Density

3-7이 끝났을 때 Player가 아는 것:

```text
Access Tier structure exists.
```

3-8에서만:

```text
Evacuation records beside Access records
```

를 회수.

3-8 작성 전에
2-8 → 3-7 Story comprehension을 다시 검증한다.

---

SECTOR 03-7 / PRIORITY CONCOURSE — REV 1.0
