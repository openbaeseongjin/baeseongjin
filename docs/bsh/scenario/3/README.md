# SECTOR 03 — COMMERCIAL DISTRICT MASTER PLAN

*MASTER PLAN CANDIDATE · REV 1.2 — DOCUMENT INTEGRATION RESOLVED*

`SECTOR 03 COMMERCIAL DISTRICT` · `POWERED UPPER CITY` · `ACCESS SCAN FIELD` · `ACTIVE ROUTE CONTROL` · `FREE-WEAVE FINALE`

| 항목 | REV 1.2 기준 |
|---|---|
| Status | HYPOTHESIS — MASTER PLAN CANDIDATE / DETAIL-ALIGNED |
| Sector Role | Worker District 이후 첫 Powered Upper-City Contrast |
| Core Gameplay Shift | Moving Threat → Active Route Control → Free-Weave Synthesis |
| Core Story Shift | “왜 C만 멈췄지?” → “누가 위쪽 이동 우선권을 가지고 있었지?” |
| Carry Build | Foundation + first Specialization KEEP |
| New Rope Mode | NONE |
| New Input | NONE |
| New Augment in Sector 03 General Stages | NONE — Growth HOLD |
| Primary New Security Mechanic | ACCESS SCAN FIELD — DESIGN SELECTED / RUNTIME GATE |
| Security Shutter | NOT USED in Sector 03 General Stages |
| New Enemy Type | NONE |
| Reused Enemy | Patrol Drone T1 |
| Boss | 3-8 내부에는 NONE; Post-Sector 03 Boss / Transition 위치·정체·전투·진입 순서 TBD |
| General Stages | 8 authored progression regions |
| Stage 03-8 Canonical | REV 1.1 FREE-WEAVE — merged to current GitHub main via PR #467 |
| Sector 03 → 04 | Transit / Infrastructure 방향, 정확한 Boss / Transition 순서 TBD |
| Current Runtime | Sector 01 + Sector 02 only; Sector 03 not connected |
| Approved Gameplay Art | HOLD until Sector 03 Runtime Area / Camera Zone / Stable IDs exist |

---

## 0. Source-of-Truth / Integration Status

### CURRENT MAIN AT INTEGRATION

REV 1.2 통합 정리 시점 최신 `main` HEAD:

```text
08db2906db9bc56d8a3f86c7bb030e99e6d27344
```

현재까지 확인된 관련 병합:

```text
PR #465
3-6 / 3-7 / initial 3-8 docs

PR #467
3-8 REV 1.1 FREE-WEAVE replacement

subsequent integration patches
3-1 Gate Contract Sync
3-2 Runtime Note / Gate Contract Sync
```

까지 GitHub `main`에 반영돼 있다.

따라서 현재 `docs/bsh/scenario/3/`에는:

```text
3-1
3-2
3-3
3-4
3-5
3-6
3-7
3-8
README.md
```

가 모두 존재한다.

### IMPORTANT — BOSS / TRANSITION BOUNDARY

```text
3-8 INTERNAL BOSS
= NONE

POST-SECTOR 03 BOSS / TRANSITION
= TBD
```

따라서 3-8의 마지막 Control Deck을:

```text
sector-04-01
```

로 직접 연결하지 않는다.

---

### RESOLVED — 3-8 VERSION DRIFT

이전 통합 감사에서:

```text
3-7
static three-cost-profile choice

3-8 REV 1.0
parallel three-route choice
```

의 Decision Pattern 반복을 발견했다.

수정안:

```text
3-8 REV 1.1
FREE-WEAVE SECURITY FIELD
```

은 PR #467로 이미 GitHub `main`에 병합됐다.

따라서 현재 상태:

```text
CURRENT GITHUB 3-8
= REV 1.1 FREE-WEAVE

REV 1.0
= HISTORICAL / SUPERSEDED
```

별도 3-8 replacement patch는 더 이상 필요하지 않는다.

### Document Priority

Sector 03 내부에서 충돌 시:

```text
1. Latest explicit user LOCKED decision
2. Latest reviewed individual Stage detail
3. This REV 1.1 Master Plan
4. Older Master / general docs
5. Current code = implementation fact, not intended design
6. Reference research
7. New hypothesis
```

---

## 1. Current Runtime Boundary

### VERIFIED — CURRENT AUTHORED RUNTIME

현재 `CurrentAuthoredAreaCatalog.js`는:

```text
SECTOR 01
+
SECTOR 02
```

만 assemble한다.

현재 Revision:

```text
sector-01-rev3-sector-02-rev1-v2
```

즉:

```text
SECTOR 03 DOCUMENT SET
= authored design spec

SECTOR 03 RUNTIME
= NOT YET CONNECTED
```

### Current Implemented Foundations

이미 재사용 가능한 것:

```text
Rope physics
static surface.grappleable filter
Patrol Drone capability
activation bounds
Enemy target / fire cycle
no-rope-cut rule
Gate / Gate Panel authored progression framework
generic optional cover LOS capability
multiplayer authored-world foundation
```

### Missing Core Dependency

아직 구현 확인되지 않음:

```text
ACCESS SCAN FIELD dynamic state
grappleAccessGroup
phase-based effective attach eligibility
Sector 03 authored area catalog
Sector 03 camera zones / stable runtime IDs
```

따라서 Sector 03의 핵심 Production Gate:

```text
ACCESS SCAN FIELD PROTOTYPE
```

다.

---

## 2. Sector 03 한 줄 정의

**꺼지고 낡은 Worker District를 벗어나 전력·광고·상점 자동화·접근 통제가 훨씬 더 오래 살아 있는 밝고 깨끗한 Commercial District에 도달한 Player가, 같은 Rope를 사용해 거대한 Atrium과 Public / Service 구조를 오가며 보안 상태가 Rope 부착 가능 시점을 바꾸는 공간을 돌파하고, 마지막에는 대피 Transfer 기록과 Access-Control 기록이 같은 상부 이동환경에 병치되어 있었음을 발견하는 Sector.**

---

## 3. Sector 03 핵심 질문

### Gameplay

Sector 01:

> **“Rope를 사용할 수 있는가?”**

Sector 02:

> **“움직이는 Threat 속에서 어떤 Route를 선택할 것인가?”**

Sector 03:

> **“공간의 Security State가 달라질 때 언제 붙고, 어디로 계속 움직일 것인가?”**

### Story

Sector 02 종료:

> **“왜 C만 멈췄지?”**

Sector 03 시작:

> **“그렇다면 A/B와 Priority Access는 누구를 위한 것이었지?”**

Sector 03 종료:

> **“이 Access 구조와 대피 결과는 어떤 관계였고, 누가 그 규칙을 만들었지?”**

---

## 4. Core Gameplay Shift

### Sector 02

```text
ENEMY POSITION
→ route pressure
```

### Sector 03

```text
SECURITY STATE
→ attach availability / route timing

+

ENEMY POSITION
→ exposure / commit pressure
```

따라서:

```text
STATIC ARCHITECTURE
↓
POWERED / REACTIVE ACCESS ARCHITECTURE
```

로 진화한다.

### 중요한 원칙

Sector 03의 Security는:

```text
Scanner disable minigame
→ platforming
→ combat
```

처럼 분리하지 않는다.

항상:

```text
ROPE TRAVERSAL
+
THREAT / STATE READING
```

이 하나의 판단이어야 한다.

---

## 5. Primary New Mechanic — ACCESS SCAN FIELD

### STATUS

```text
DESIGN SELECTED
RUNTIME PROTOTYPE GATE
```

이제 Scanner / Security Shutter 중 후보를 고르는 단계가 아니다.

Sector 03 General Stage의 Primary New System:

```text
ACCESS SCAN FIELD
```

로 선택한다.

### Canonical State

```text
AVAILABLE
→ WARNING
→ LOCKED
→ RESET
```

### New Rope Attach

```text
AVAILABLE / WARNING
= ALLOWED

LOCKED / RESET
= DENIED
```

### Existing Rope

이미 붙은 Rope:

```text
STAYS ATTACHED
```

Scanner 상태가 바뀌어도:

```text
NO FORCED DETACH
```

### Scanner Is Not Damage Laser

```text
Damage
= 0

Knockback
= 0

Rope Disable
= 0

Rope Cut
= 0
```

핵심 질문:

> **“언제 붙을 것인가?”**

이지:

> “Beam을 피하라.”

가 아니다.

---

## 6. Why Scanner, Not Security Shutter

Security Shutter는 Sector 03 General Stage에서 사용하지 않는다.

### 이유 1 — Current Architecture

물리 Shutter는:

- moving collision
- player trapping
- rope-anchor / collision state synchronization
- multiplayer prediction
- dynamic surface ownership

을 동시에 요구한다.

### 이유 2 — Sector Identity

Sector 04는:

```text
TRANSIT / INFRASTRUCTURE
```

가 핵심이다.

Sector 03에서 움직이는 거대한 물리 구조를
대표 Gameplay로 소비하면
Sector 04 정체성과 겹칠 위험이 있다.

### 이유 3 — Rope Coupling

Scanner는:

```text
STATIC GEOMETRY
+
DYNAMIC ATTACH ELIGIBILITY
```

만으로 Rope Timing 질문을 직접 만든다.

### 결론

```text
SECURITY SHUTTER
= RESERVED / NOT USED

ACCESS SCAN FIELD
= SECTOR 03 PRIMARY SYSTEM
```

---

## 7. Scanner Implementation Contract

### Required Runtime Model

권장:

```text
AUTHORED CONTROLLED SURFACE GROUP
+
SIMULATION TICK
+
DETERMINISTIC PHASE
+
EFFECTIVE ATTACH ELIGIBILITY
```

### Current Static Support

현재 Rope Targeting:

```text
surface.grappleable === false
→ skip
```

지원.

따라서:

```text
STATIC FILTER
= IMPLEMENTED
```

### Missing

```text
dynamic access group
phase evaluation
scanner renderer cue
network-consistent phase
```

### Implementation Spec — READY, NOT YET BUILT

이 Missing 목록을 해결하는 구체적인 구현 계획은 [`ACCESS-SCAN-FIELD-RUNTIME-PROTOTYPE-SPEC.md`](./ACCESS-SCAN-FIELD-RUNTIME-PROTOTYPE-SPEC.md)(설계 전체)와 [`ACCESS-SCAN-FIELD-CODEX-IMPLEMENTATION-HANDOFF.md`](./ACCESS-SCAN-FIELD-CODEX-IMPLEMENTATION-HANDOFF.md)(실행 지시서)에 이미 존재한다. 두 문서는 실제 코드(Rope Targeting, Owner Prediction, Authority Snapshot)를 대조해 작성됐으며, Scanner 구현 전에 먼저 고쳐야 하는 기존 Prediction Clock 경계조건(`ownerMotionTick < serverTick`)까지 식별했다.

**중요**: 스펙이 존재한다는 것이 구현 완료를 의미하지 않는다. 두 문서 모두 현재 상태를 `NOT IMPLEMENTED — PROTOTYPE READY`로 명시한다. `STATIC FILTER = IMPLEMENTED` 판정은 그대로 유지되고, `DYNAMIC SCANNER = NOT IMPLEMENTED`도 실제 구현·테스트 PASS 전까지 그대로 유지된다.

### 금지 구현

```text
surface.grappleable
```

을 Scanner phase마다 직접 mutate하는 구조는 피한다.

대신:

```text
isSurfaceEffectivelyGrappleable(surface, simulationState)
```

같은 계산 계층 권장.

### Multiplayer

Scanner State는:

```text
PLAYER A
PLAYER B
```

에게 같은 simulation phase여야 한다.

Client별 다른 Scanner phase 금지.

---

## 8. Controlled Surface Invariant

Scanner-controlled mount:

```text
DEDICATED GAMEPLAY SURFACE SEGMENT
```

이어야 한다.

금지:

```text
large always-grappleable wall

+

visual controlled strip
```

같은 위치에 둘이 겹치는 구조.

이유:

LOCKED Surface 대신
바로 옆 permanent parent에 붙어
Mechanic을 무료 우회할 수 있다.

### 유효한 Scanner Avoidance

다음은 Bug가 아니다.

```text
Service Route
Side Detour
Permanent Grapple Structure
```

를 더 많은 Rope 입력 / Enemy exposure 같은 비용을 내고 사용하는 것.

구분:

```text
ACCIDENTAL SAME-SPOT BYPASS
= FAIL

DESIGNED ALTERNATIVE ROUTE
= VALID
```

---

## 9. Rope / Physics Design Contract

### CURRENT MAIN BASELINE

```text
Rope Max Attach Distance 400
Attach Buffer            0.1 sec
Swing Impulse            780
Release Angular Transfer 0.55
```

### Mandatory Geometry

Sector 03 모든 필수 진행:

```text
≤ 400 px
```

이어야 한다.

### Max Range Challenge 금지

Scanner / Drone / Route Choice와 동시에:

```text
near-400 exact range test
```

를 필수로 요구하지 않는다.

권장:

```text
180–390 px
```

### `swingImpulse = 0` Validation

실제 Current Runtime:

```text
780
```

하지만 Blockout validation:

```text
swingImpulse = 0
→ mandatory route clearable
```

유지.

의도:

```text
780
= expression

0
= geometry safety contract
```

---

## 10. Enemy Progression

Sector 03에서는 새로운 Enemy Type을 만들지 않는다.

### Reuse

```text
PATROL DRONE T1
```

### Stage Count

```text
3-1  0
3-2  0
3-3  1
3-4  1
3-5  0
3-6  1
3-7  1
3-8  2
```

### Baseline

```text
Patrol Speed 48
Wait         0.45 sec
Mode         pingpong
```

### Target Family

```text
NO VALID TARGET
→ PATROL

VALID TARGET
→ target lock
→ patrol pause
→ ACQUIRE
→ TRACK
→ LOCK
→ FIRE
→ COOLDOWN

TARGET INVALID
→ reset
→ patrol resume
```

### Rope Cut

```text
NONE
```

Patrol T1 projectile:

```text
no-rope-cut
```

유지.

### 금지

- Drone T2
- Fast Drone
- Armored Drone
- Laser Drone
- Chase Drone
- Burst Drone

---

## 11. LOS / Safe-Space Contract

Generic Enemy Runtime에는:

```text
cover-ends-los
```

capability가 있다.

그러나 Patrol Drone T1 baseline에는
해당 rule이 기본 적용되지 않는다.

따라서 Sector 03 Safe Deck의 근거:

```text
COVER
```

가 아니라:

```text
ACTIVATION BOUNDS
```

이다.

### Common Rule

Safe observation / recovery / story deck은:

```text
new target acquire
```

가 불가능한 activation outside로 설계.

단:

```text
already-fired projectile
```

은 즉시 삭제되지 않을 수 있다.

따라서 Safe Deck은
단순 activation outside뿐 아니라
실제 projectile trajectory도 Playtest한다.

---

## 12. Growth Progression — HOLD

Sector 03 시작 Design State:

```text
FOUNDATION
+
FIRST SPECIALIZATION
```

### Sector 03 General Stages

```text
NEW AUGMENT
NONE

SECOND SPECIALIZATION
HOLD

SECONDARY AUGMENT
HOLD

HYBRID
HOLD

CHECKPOINT REWARD
NONE
```

### 3-5 Decision

3-5 `COMMERCIAL SERVICE NODE`:

```text
REST
+
BUILD DIAGNOSTIC
```

새 Growth를 주지 않는다.

### 이유

Current production:

```text
Foundation design
= authored

Foundation runtime
= pending

First Specialization stage
= authored

Specialization names / values / pool
= system gate
```

첫 성장 계층이 실제 Runtime / Playtest를 통과하기 전에
더 높은 Tier를 Stage 때문에 먼저 만들지 않는다.

---

## 13. Sector Rhythm

```text
3-1
REVEAL

↓

3-2
TEACH

↓

3-3
COMBINE

↓

3-4
ROUTE IDENTITY

↓

3-5
REST / DIAGNOSTIC

↓

3-6
LARGE MOVEMENT EXPRESSION

↓

3-7
STORY PRESSURE + STATIC COST CHOICE

↓

3-8
DYNAMIC FREE-WEAVE FINALE
```

### Difficulty

```text
3-1  ★★
3-2  ★★☆
3-3  ★★★
3-4  ★★★
3-5  REST
3-6  ★★★☆
3-7  ★★★☆
3-8  ★★★★
```

---

## 14. Stage Master Table — REV 1.2

| Stage | Name | Gameplay Role | Enemy | Scanner | Growth | Story |
|---|---|---|---:|---|---|---|
| 3-1 | POWERED PROMENADE | Powered Commercial reveal / low-pressure Rope flow | 0 | OFF | none | 상부 Commercial 유지 상태 첫 관찰 |
| 3-2 | SCANNER GALLERY | First Access Scan Field tutorial | 0 | first active | none | Player route authorization invalid 강화 |
| 3-3 | RETAIL SECURITY WALK | Scanner + Patrol first synthesis | 1 T1 | 1 group | none | 사람이 없어도 Security active |
| 3-4 | SERVICE ARCADE | Public vs Service first Commercial route identity | 1 T1 | Public route | none | Maintenance access = local only |
| 3-5 | COMMERCIAL SERVICE NODE | Rest / Build Diagnostic | 0 | none | **HOLD / none** | 권한 범위 재확인 |
| 3-6 | PREMIUM ATRIUM | Large Rope Flow + known Security timing | 1 T1 | 1 shared group | none | Local power/service 유지 정황 |
| 3-7 | PRIORITY CONCOURSE | Static cost-profile route choice + Story pressure | **1 T1** | 1 shared group | none | Service Class / Access Tier 구조 확인 |
| 3-8 | UPPER MARKET GATE **REV 1.1** | **Dynamic Free-Weave Finale** | **2 T1 separated** | 1 shared group | none | Evacuation + Access archive 병치 |

---

## 15. 3-1 — POWERED PROMENADE

### Role

Sector 03 첫 authored region.

### Gameplay

```text
ONE CLEAR ASCENT
+
OPTIONAL FLOW SKIPS
```

Enemy 없음.
Scanner active 없음.
Scanner Housing inactive preview 가능.

### Key Question

> **“왜 이곳은 아직 이렇게 잘 켜져 있지?”**

### Story

보여줌:

- powered lights
- ad display
- kiosk
- cleaner commercial surfaces
- products
- no people

공개 금지:

- Priority identity
- A/B identity
- Group mapping

### Important

3-1은 Sector Intro.

Scanner Tutorial을 침범하지 않는다.

---

## 16. 3-2 — SCANNER GALLERY

### Role

First Active Security State Tutorial.

### Rule

```text
SEE
→ WAIT IF NEEDED
→ ATTACH
→ STAY ATTACHED THROUGH LOCK
→ RELEASE
→ RE-ATTACH NEXT WINDOW
```

### Enemy

```text
NONE
```

### Important Runtime Note

Canonical current state:

```text
STATIC GRAPPLEABLE FILTER
= IMPLEMENTED

DYNAMIC ACCESS SCAN FIELD
= NOT IMPLEMENTED
```

기존 3-2 문서의
“static grappleable filter도 없음” 서술은 stale했지만,
현재 GitHub 3-2 REV 1.1에서:

```text
STATIC GRAPPLEABLE FILTER
= IMPLEMENTED

DYNAMIC ACCESS SCAN FIELD FILTER
= NOT IMPLEMENTED
```

로 교정 완료됐다.

---

## 17. 3-3 — RETAIL SECURITY WALK

### Role

처음:

```text
SCANNER
+
PATROL DRONE
```

결합.

### Core

```text
OBSERVE TWO SIGNALS
→
ONE COMMIT WINDOW
```

### Enemy

```text
Patrol Drone T1 × 1
```

### Difficulty

Scanner / Drone을 강화하지 않고
기존 두 규칙을 한 판단 안에 겹친다.

---

## 18. 3-4 — SERVICE ARCADE

### Role

첫 Commercial Route Identity.

### Public

```text
wide
fewer attaches
scanner
patrol exposure
```

### Service

```text
narrower
more chaining
permanent mounts
lower security exposure
```

### Story

```text
MAINTENANCE CLEARANCE
RECOGNIZED

LOCAL SERVICE ROUTE
AVAILABLE
```

하지만:

```text
LOCAL SERVICE ACCESS
≠
VERTICAL TRANSIT AUTHORIZATION
```

### Important

Service가 정답이 아니다.
Public도 함정이 아니다.

---

## 19. 3-5 — COMMERCIAL SERVICE NODE

### Role

```text
REST
+
CURRENT BUILD RE-READ
```

### Growth

```text
NO NEW TIER
```

### Optional Node

Read-only Diagnostic 가능.

단 Foundation / Specialization Runtime이 실제 존재한 뒤에만.

금지:

- fake build value
- reroll
- respec
- upgrade
- reward pedestal

---

## 20. 3-6 — PREMIUM ATRIUM

### Role

3-5의 작은 Rest 공간 직후:

```text
LARGE OPEN COMMERCIAL VOID
```

에서 Movement Joy 회복.

### Gameplay

```text
known Scanner
+
1 Patrol
+
large Rope arc
```

### Structure

```text
First Scanner Arc
→
Safe Mid Recombination
→
Scanner + Drone Commit
→
Upper Free Flow
```

### Growth

새 Power 없음.

Foundation + first Specialization Design State만 유지.

Mandatory progression은 Build effect 없이도 성립.

---

## 21. 3-7 — PRIORITY CONCOURSE

### Role

Sector 03 첫 본격 Story Pressure.

### Enemy

```text
Patrol Drone T1 × 1
```

Master REV 1.0의:

```text
1–2
```

는 superseded.

### Gameplay

한 Concourse의 세 static cost profile:

```text
OUTER GALLERY
Scanner + longer + low Drone exposure

PRIORITY SPINE
Scanner + Drone + shortest

SERVICE LATTICE
No Scanner + Drone + more Rope chaining
```

### Story Reveal

처음 확정:

```text
SERVICE CLASS CONTROL
exists

ACCESS TIER CONTROL
exists

PRIORITY ROUTE
active
```

### Important

다음은 아직 금지:

```text
Group A = Priority
Group B = Premium
Group C = Standard
```

---

## 22. 3-8 — UPPER MARKET GATE REV 1.1

### CANONICAL STATUS

```text
REV 1.1
FREE-WEAVE
```

현재 GitHub REV 1.0은 superseded.

### Why REV 1.0 Failed

3-7:

```text
Outer / Priority / Service
→ choose one cost profile
```

REV 1.0 3-8:

```text
West / Central / East
→ choose one cost profile
```

결국:

```text
LEFT / CENTER / RIGHT
→ choose
→ merge
```

판단 패턴 반복.

### REV 1.1 Core

```text
M0 SAFE HUB

Central Scanner C2
or
West Drone Pocket W1
or
East Drone Pocket E1

↓

MX SAFE CROSSOVER

↓

Central Scanner C3
or
West Drone Pocket W2
or
East Drone Pocket E2

↓

M1 SAFE MERGE
```

### New Finale Question

Scanner가 AVAILABLE:

```text
CENTRAL FLOW
```

Scanner가 LOCKED:

```text
WAIT
or
MOVE SIDEWAYS INTO DRONE POCKET
```

Lower 선택은 Upper 선택을 고정하지 않는다.

### Enemy

```text
D1 WEST ONLY
D2 EAST ONLY
```

두 activation:

```text
NO OVERLAP
```

Central / M0 / MX / M1:

```text
outside both
```

### Story Climax

A1 Mandatory Story Deck:

```text
EVACUATION TRANSFER ARCHIVE

+

UPPER COMMERCIAL ACCESS ARCHIVE
```

같은 facility에 존재.

하지만:

```text
NO GROUP ↔ TIER MAPPING
NO DIRECT CAUSALITY
```

---

## 23. Story Disclosure Chain — Canonical

### 2-8

```text
GROUP A
TRANSFER COMPLETE

GROUP B
TRANSFER COMPLETE

GROUP C
TRANSFER SUSPENDED

UPPER TRANSIT ROUTE
PRIORITY ACCESS ACTIVE
```

### 3-1

```text
Commercial District
better maintained / powered / automated
```

### 3-2

```text
EMPLOYEE VERIFIED
ROUTE AUTHORIZATION INVALID
```

### 3-3

```text
AUTOMATED SECURITY
still active
```

### 3-4

```text
MAINTENANCE CLEARANCE
→ LOCAL SERVICE

NOT
→ UPPER VERTICAL AUTHORIZATION
```

### 3-5

새 Story Reveal 최소화.

### 3-6

```text
LOCAL POWER BUS
ACTIVE

COMMERCIAL SERVICE NETWORK
LIMITED / ONLINE
```

Commercial이 더 잘 유지되지만:

```text
citywide cascade가 없었다
```

는 뜻은 아님.

### 3-7

```text
Service Class Control exists
Access Tier Control exists
Priority Route active
```

### 3-8

```text
Evacuation Transfer Archive

and

Access-Control Archive

coexisted in same Upper Commercial Gate
```

### Still Unknown

- Group A 정체
- Group B 정체
- Priority 대상
- Group ↔ Tier mapping
- Group C suspension 원인
- Priority와 C suspension 직접 인과
- Resource allocation 결정자
- Corporate final truth

---

## 24. Commercial Power-State Canon

Sector 03은:

```text
TOTALLY NORMAL UPPER CITY
```

가 아니다.

정확한 Contrast:

```text
WORKER DISTRICT
reduced / damaged / dim

COMMERCIAL DISTRICT
better maintained
local power active
service automation partially online
```

### 금지 표현

```text
POWER STATUS: PERFECT
INCIDENT IMPACT: NONE
```

같은 의미.

### 권장

```text
LOCAL POWER BUS
ACTIVE

COMMERCIAL SERVICE NETWORK
LIMITED / ONLINE
```

---

## 25. Architecture / Visual Direction

### Worker District

```text
WARM BUT DIM
WORN
DENSE
LIVED-IN
RESIDENTIAL
```

### Commercial

```text
BRIGHTER
POLISHED
POWERED
EMPTY
COMMERCIAL
```

### Core Architecture

```text
VERTICAL ATRIUM
+
OPEN VOID
+
POLISHED BALCONY
+
ACTIVE DISPLAY
+
BACK-OF-HOUSE SERVICE FRAME
```

### Representative Spaces

- shopping atrium
- retail balcony
- storefront
- service corridor
- commercial service node
- premium atrium
- upper concourse
- market gate
- maintenance frame behind facade

### Avoid

- flat modern mall floor repetition
- Worker residential balcony repetition
- Sector 04 moving transit identity
- Sector 05 corporate office identity

---

## 26. Palette / Gameplay Readability

### Base

```text
Deep Navy
Graphite
Polished Dark Gray
Cool Concrete
```

### Commercial Light

```text
Warm White
Muted Gold / Amber
Muted Magenta
Desaturated Teal
```

### Gameplay Priority

```text
Rope / Grapple
CYAN

Scanner Warning / Security
AMBER / RED / ORANGE

Player Scarf
RED
```

### Important

Commercial 광고에 Cyan을 과도하게 사용하지 않는다.

```text
Rope Cyan
```

의 우선순위가 가장 높다.

Scanner는 Damage Laser가 아니므로
두껍고 공격적인 Red Laser Beam처럼 만들지 않는다.

---

## 27. Collision / Decoration Contract

Sector 03는 Visual Detail이 많기 때문에
Collision 오독 위험이 크다.

### Always Separate

```text
COLLISION GEOMETRY
≠
NONCOLLISION DECORATION
```

특히:

- pipe
- cable
- railing
- ad frame
- storefront trim
- hanging sign

이 Grapple Target이나 Terrain처럼 보여서는 안 된다.

### Terrain

Gameplay collision skin은:

```text
actual authored geometry
```

를 따른다.

Graphics가 Collision을 새로 정의하지 않는다.

---

## 28. Multiplayer Contract

### Scanner

두 Player:

```text
same scanner phase
```

를 본다.

### Enemy

각 Drone은:

```text
activation bounds
```

안 Player만 eligible.

다른 Route / Pocket / Safe Hub의 Player를
cross-zone target으로 잡지 않는다.

### Safe Hubs

2인 착지 폭 확보.

### UI

Story / Diagnostic UI:

```text
NO GLOBAL PAUSE
```

### Gate

현재 일반 Stage Gate:

```text
shared open
individual physical crossing
```

원칙.

3-8 Final Gate만
Post-Sector contract 확정 전 HOLD.

---

## 29. Recovery Contract

Sector 03은 Timing Layer가 추가되므로
실패 비용을 짧게 유지한다.

### Target

대부분:

```text
3–5 sec
```

내 재진입 가능.

### Avoid

```text
full-stage fall
start reset
damage floor
recovery under sustained new fire
```

### Safe Deck

Safe 의미:

```text
NO NEW ACQUIRE
```

이지:

```text
all existing projectiles disappear
```

가 아니다.

---

## 30. Boss / Timer / Sector Transition

### Sector 03 General Stage

```text
3-1 ~ 3-8
```

### Boss

각 Sector에 1 Boss가 존재하지만:

```text
BOSS LOCATION
IDENTITY
ENTRY
COMBAT
REWARD
```

현재 OPEN.

### 3-8

```text
BOSS
NONE IN THIS STAGE
```

### Stage-local Completion

3-8 REV 1.1:

```text
A1 mandatory story trigger
→
Reach P6
```

### HOLD

P6 이후:

```text
Gate Panel objective
physical crossing
nextAreaId
boss entry
general timer end
checkpoint
```

모두 TBD.

### 금지

```text
P6
→ sector-04-01
```

직접 연결.

---

## 31. Sector 04 Reservation

Sector 04:

```text
TRANSIT / INFRASTRUCTURE
```

### Sector 03에서 금지

- moving train gameplay
- moving rail route
- conveyor identity
- moving platform as primary mechanic
- transit signal puzzle
- large infrastructure motion

### 3-8 Preview

허용:

```text
static heavy frame
large conduit
distant infrastructure silhouette
```

까지만.

---

## 32. Scenario Art Generation Contract

최신 공통 규격:

```text
docs/bsh/scenario/SCENARIO-ART-GENERATION-STANDARD.md
```

이 Sector 03의 오래된 개별 Art 지시보다 우선한다.

### Approved Gameplay Reference Before Generation

필수:

1. Runtime Area exists.
2. Camera Zone is stable.
3. Stable IDs exist.
4. Blockout geometry approved.
5. Exact visible object count fixed.

### Output

대표:

```text
ONE GAMEPLAY CAMERA SHOT
```

기본.

### Rules

- Player exactly 1
- live Rope exactly 1 line
- Anchor network / triangle 금지
- 전체 레벨맵을 Gameplay shot으로 위장 금지
- exact objects only
- current camera scale 따라야 함

### Current Sector 03 Status

```text
RUNTIME AREA
NONE

CAMERA ZONE
NONE
```

따라서:

```text
APPROVED GAMEPLAY ART
HOLD
```

---

## 33. Runtime Implementation Order

### P0 — Scanner Spike

```text
ACCESS SCAN FIELD
```

단독 prototype.

검증:

- deterministic phase
- dynamic attach eligibility
- current rope stays attached
- multiplayer same phase
- clear warning/readability

### P1 — Sector 03 Authored Geometry

Scanner OFF / Drone OFF.

```text
3-1 → 3-8
```

base geometry.

### P2 — Patrol Reuse

3-3 / 3-4 / 3-6 / 3-7 / 3-8.

### P3 — Scanner Integration

3-2 onward.

### P4 — Multiplayer

- split routes
- safe hub
- scanner phase
- drone ownership
- projectile overlap
- Gate

### P5 — Story

Runtime stable ID / triggers.

### P6 — Art / Audio

Gameplay contract PASS 후.

---

## 34. Document Integration Status — REV 1.2

### RESOLVED A — 3-8 REV 1.1

```text
PR #467
3-8 REV 1.1 FREE-WEAVE
```

GitHub `main` 반영 완료.

### RESOLVED B — 3-2 Runtime Note

현재 GitHub 3-2:

```text
REV 1.1
RUNTIME NOTE / GATE CONTRACT SYNC
```

상태.

Static Filter 구현 여부와
Dynamic Scanner 미구현 상태가 구분돼 있다.

### RESOLVED C — 3-1 / 3-2 Exit Contract

현재 GitHub:

```text
3-1
REV 1.1 — GATE CONTRACT SYNC

3-2
REV 1.1 — RUNTIME NOTE / GATE CONTRACT SYNC
```

모두 현재 일반 Gate 계약:

```text
objective
→ Gate Panel interaction
→ Gate open
→ physical crossing
```

으로 동기화됐다.

### RESOLVED D — Sector 03 Master Integration

REV 1.2에서:

- ACCESS SCAN FIELD design selection
- Growth HOLD
- 3-7 exactly 1 Patrol Drone
- 3-8 Free-Weave canonical status
- Boss / Post-Sector HOLD
- Runtime / Art dependency

를 현재 GitHub 상태에 맞춰 다시 정렬한다.

### REMAINING P0 — Runtime Prototype

문서 문제가 아니라 실제 구현 문제:

```text
ACCESS SCAN FIELD
```

Runtime Spike.

### REMAINING P1 — Sector 03 Authored Runtime

```text
Sector 03 Area Catalog
3-1 → 3-8 integration
Camera Zones
Stable IDs
Story triggers
```

### REMAINING P2 — Production Alignment

Sector 03 Runtime이 생긴 뒤:

```text
README vs Runtime coordinates
enemy activation
scanner groups
camera zones
story cue IDs
Gate progression
```

을 Stage별 `PRODUCTION-ALIGNMENT.md`로 검증.

### REMAINING P3 — Approved Gameplay Art

Runtime / Camera Zone / Stable ID가 안정된 이후만 진행.

현재는:

```text
HOLD
```


## 35. Playtest Questions — Sector Level

### Gameplay

1. Scanner가 Damage Hazard가 아니라 **Attach Timing Rule**로 이해되는가?
2. 3-4의 Public / Service가 실제 비용 차이로 느껴지는가?
3. 3-5가 필요 없는 공백이 아니라 Rhythm Rest로 느껴지는가?
4. 3-6에서 새 Upgrade 없이도 Rope 이동이 충분히 재미있는가?
5. 3-7의 세 Cost Profile이 명확한가?
6. 3-8 REV 1.1이 3-7과 다르게 **계속 경로를 엮는 Stage**로 기억되는가?

### Story

1. Commercial이 Worker보다 더 잘 유지된 것은 이해되는가?
2. 하지만 Commercial도 Incident 영향이 있다는 점은 남는가?
3. 3-7에서 Access Tier 구조가 실제 존재했다는 점을 이해하는가?
4. 3-8에서 두 Archive의 병치를 알아차리는가?
5. A/B/C와 Tier가 **아직 확정되지 않았음**을 이해하는가?

### Multiplayer

1. Scanner phase가 두 Player에게 동일하게 보이는가?
2. 한 Player의 Drone encounter가 다른 Route Player를 잘못 공격하는가?
3. Safe Hub가 실제로 2인에게 충분한가?
4. 3-8 좌우 Drone projectile이 중앙 Player에게 우발적 cross-lane hit를 만드는가?

---

## 36. PASS Criteria — Sector 03

### Gameplay

- Scanner가 Sector의 한 가지 Primary New System으로 읽힘
- 새 Input 없음
- 새 Rope Mode 없음
- New Enemy 없음
- 3-1~3-8 모두 Base Rope mandatory clear 가능
- Scanner / Drone 강화 대신 공간 조합으로 난이도 상승
- 3-5 Rest 리듬 유효
- 3-7 / 3-8 decision pattern이 구분됨
- 3-8은 Free-Weave로 기억됨

### Growth

- Foundation + first Specialization 유지
- Sector 03 신규 Tier 없음
- Foundation과 Specialization 혼동 없음

### Story

- Powered Commercial Contrast 전달
- Access Tier 구조 공개
- Archive 병치 공개
- Group ↔ Tier mapping 미확정
- Group C suspension 직접 원인 미확정
- Corporate final truth 미공개

### Runtime Discipline

- Scanner dependency 명시
- Sector 03 Runtime 미연결 사실 명시
- Boss / post-sector transition 미추정
- Art generation premature approval 금지

---

## 37. FAIL Conditions — Sector 03

### Gameplay

- Scanner를 Damage Laser로 변환
- Scanner Locked 시 current Rope 강제 detach
- Shutter를 별도 주요 시스템으로 추가
- Drone T2 추가
- 3-5에서 Hybrid / second specialization 지급
- 특정 Build만 통과 가능한 Mandatory Route
- 3-7과 3-8이 사실상 같은 3-Route choice
- 3-8 D1/D2 activation overlap
- Sector 04 moving-transit identity 선행 소비

### Story

- A = Priority 확정
- B = Premium 확정
- C = Standard 확정
- Priority 때문에 C가 중단됐다고 확정
- 고의적 Worker 희생 확정
- 사고 자체가 회사 계획이라고 확정
- Corporate 최종 책임자 공개

### Production

- Sector 03 Runtime도 없는데 Approved Gameplay Art 생성
- Scanner fake local timer만 renderer에 구현
- Stage마다 Scanner timing을 임의로 다르게 강화
- Boss 위치를 3-8 문서에서 추정
- P6를 Sector04-01로 바로 wiring

---

## 38. Canonical Sector 03 After REV 1.2

```text
3-1 POWERED PROMENADE
Commercial Contrast
No Threat

↓

3-2 SCANNER GALLERY
Teach ACCESS SCAN FIELD

↓

3-3 RETAIL SECURITY WALK
Scanner + 1 Patrol

↓

3-4 SERVICE ARCADE
Public vs Service

↓

3-5 COMMERCIAL SERVICE NODE
REST
Growth HOLD

↓

3-6 PREMIUM ATRIUM
Large Rope Flow
+ known Security

↓

3-7 PRIORITY CONCOURSE
Static Cost-Profile Choice
+ Access Tier Reveal

↓

3-8 UPPER MARKET GATE REV 1.1
Dynamic FREE-WEAVE
Central Scanner Spine
+ West/East Drone Pockets
+ Evacuation/Access Archive Juxtaposition

↓

POST-SECTOR 03
BOSS / TRANSITION
TBD
```

---

## OPEN QUESTIONS

### 1. ACCESS SCAN FIELD Exact Timing

Design state machine은 정해졌지만:

```text
AVAILABLE duration
WARNING duration
LOCKED duration
RESET duration
```

정확한 수치는 Runtime Prototype / Playtest 전까지 HYPOTHESIS.

### 2. Scanner Visual

필수:

```text
AVAILABLE
WARNING
LOCKED
RESET
```

가 Mobile에서도 즉시 구분.

하지만 exact beam / housing animation은 Graphics implementation과 함께 확정.

### 3. Foundation / Specialization Runtime

현재 Sector 03의 Build Expression은 Design assumption.

실제 효과가 구현된 뒤:

```text
3-4
3-6
3-7
3-8
```

을 Build matrix로 다시 검증.

### 4. 3-8 Free-Weave Value

핵심:

```text
Scanner AVAILABLE
→ Central

Scanner LOCKED
→ Wait or Side Detour
```

Side Detour가 항상 나쁘거나
Central이 항상 정답이면 geometry/timing 조정.

### 5. Sector 03 Boss

여전히 OPEN.

3-8은 일반 진행 Finale일 뿐 Boss Stage가 아니다.

### 6. Sector-end Checkpoint

Boss Entry / retry flow가 확정된 뒤 결정.

### 7. Sector 04 Master Plan

Sector 03 **문서 통합 패치는 완료**됐다.

다만 다음으로 바로 Sector 04 상세 Stage에 들어가기보다:

```text
ACCESS SCAN FIELD Runtime Spike
```

를 먼저 할지,

```text
Sector 04 Master Plan
```

을 병행할지는 일정 우선순위 결정이 필요하다.

Sector 04를 먼저 기획하더라도
Sector 03 Scanner가 실제 구현 완료됐다고 가정해서는 안 된다.

---

SECTOR 03 / COMMERCIAL DISTRICT MASTER PLAN — REV 1.2
