# SECTOR 03 — INTEGRATION CROSS-VALIDATION AUDIT

*INTEGRATION AUDIT · REV 1.0 · 2026-08-15 KST*

`COMMERCIAL DISTRICT` · `3-1 ~ 3-8` · `SCENARIO / RUNTIME / STORY / MULTIPLAYER / ART CROSS-CHECK`

---

### DOCUMENT INTEGRATION UPDATE — PATCHES APPLIED

이 감사가 지적한 §22 Integration Patch List의 **P0 (PATCH 01~04)** 는
Sector 03 Master Plan REV 1.1, 3-2 Runtime Note, 3-1/3-2 Exit Contract, 3-8 REV 1.1 교체와
같은 변경에서 모두 적용됐다.

아래 본문은 패치 적용 이전 시점의 원본 감사 기록이며,
Runtime 미연결·Access Scan Field 미구현 등 §22 **P1~P3**(GitHub 병합 이후 / Runtime 통합 단계)는 여전히 OPEN이다.

---

## 0. 최종 판정

```text
DESIGN COHERENCE
PASS

STORY DISCLOSURE
PASS

ROPE / ENEMY / MULTIPLAYER CONTRACT
PASS WITH RUNTIME DEPENDENCIES

DOCUMENT INTEGRATION
HOLD — PATCHES REQUIRED

SECTOR 03 RUNTIME INTEGRATION
HOLD — ACCESS SCAN FIELD NOT IMPLEMENTED

SECTOR 03 APPROVED ART GENERATION
HOLD — RUNTIME AREA / CAMERA ZONE NOT YET AVAILABLE
```

### 가장 중요한 결과

Sector 03의 3-1~3-8 전체 Gameplay / Story Progression은
큰 방향에서 일관된다.

하지만 통합 검토 중 다음을 확인했다.

1. **3-7과 초기 3-8의 Gameplay 구조가 지나치게 유사했다.**
2. 이 문제는 `3-8 REV 1.1 FREE-WEAVE`로 수정했다.
3. Sector 03 Master Plan은 상세 Stage 결정보다 일부 뒤처져 있다.
4. 3-2의 Runtime Note는 최신 Rope Surface 구현보다 오래됐다.
5. 3-1 / 3-2는 최신 Gate / Gate Panel 진행 계약보다 먼저 작성되어 Exit 표현을 동기화해야 한다.
6. 최신 Scenario Art Runtime-alignment 규격은 Sector 03 초기 문서들보다 나중에 추가됐다.
7. 실제 Runtime은 아직 Sector 01 + 02까지만 연결되어 있다.
8. Access Scan Field는 여전히 구현 의존성이다.

---

## 1. 감사 기준 Source of Truth

### Current Main

통합 감사 시작 시 확인한 최신 `main` HEAD:

```text
7c57bf7b91575b96eb5bff125ba896b4e5e94505
```

해당 최신 커밋은 Sector 01-1 문서 좌표 동기화이며
Sector 03 Gameplay Runtime을 새로 추가한 변경은 아니다.

직전 주요 제작 계약:

```text
PR #461
Scenario Art Runtime-alignment standard
```

### GitHub Scenario Tree

감사 시점 `main`:

```text
docs/bsh/scenario/3/

3-1/
3-2/
3-3/
3-4/
3-5/
README.md
```

즉:

```text
3-6
3-7
3-8
```

은 현재 대화에서 검토 완료됐지만
아직 GitHub `main`에는 미병합 상태다.

### Current Runtime Catalog

현재:

```text
src/game/world/areas/CurrentAuthoredAreaCatalog.js
```

는:

```text
SECTOR 01
+
SECTOR 02
```

만 assemble한다.

Revision:

```text
sector-01-rev3-sector-02-rev1-v2
```

따라서:

```text
SECTOR 03
= SPEC AHEAD OF RUNTIME
```

이다.

---

## 2. Sector 03 Stage Progression Matrix

| Stage | Role | Enemy | Scanner | Growth | Story Step | Integration Status |
|---|---|---:|---|---|---|---|
| 3-1 POWERED PROMENADE | Commercial reveal | 0 | OFF / inactive preview only | none | 상부 Commercial이 훨씬 잘 유지됨 | GitHub |
| 3-2 SCANNER GALLERY | first Active Security tutorial | 0 | first ACCESS SCAN FIELD | none | route authorization invalid 강화 | GitHub / runtime dependency |
| 3-3 RETAIL SECURITY WALK | Scanner + Patrol first synthesis | 1 T1 | 1 group | none | automated security still active | GitHub |
| 3-4 SERVICE ARCADE | Public vs Service route identity | 1 T1 | Public only | none | local maintenance access ≠ vertical authorization | GitHub |
| 3-5 COMMERCIAL SERVICE NODE | rest / build diagnostic | 0 | none | **HOLD — no new tier** | 기존 권한 범위 재확인 | GitHub |
| 3-6 PREMIUM ATRIUM | large-space movement expression | 1 T1 | 1 shared group | none | local power/service 유지 정황 강화 | reviewed local |
| 3-7 PRIORITY CONCOURSE | Access-Tier story pressure | 1 T1 | 1 shared group | none | Access Tier / Priority Route 구조 존재 확인 | reviewed local |
| 3-8 UPPER MARKET GATE REV 1.1 | free-weave sector finale | 2 T1 separated | 1 shared group | none | Evacuation archive + Access archive 병치 | reviewed local |

### Difficulty Curve

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

판정:

```text
PASS
```

3-5가 의도적인 decompression 역할을 하고
3-6에서 movement joy를 다시 올린 뒤
3-7 Story Pressure,
3-8 Finale로 상승한다.

---

## 3. ACCESS SCAN FIELD — Sector-wide Canonical Rule

### Canonical Rule

3-2에서 정의:

```text
AVAILABLE
→ WARNING
→ LOCKED
→ RESET
```

새 Rope Attach:

```text
AVAILABLE / WARNING
= ALLOWED

LOCKED / RESET
= DENIED
```

이미 붙은 Rope:

```text
STAYS ATTACHED
```

Scanner:

```text
Damage
= 0

Knockback
= 0

Rope Cut
= 0

Forced Detach
= 0
```

### Stage Reuse

```text
3-1
ACTIVE SCANNER NONE

3-2
TEACH

3-3
SCANNER + DRONE

3-4
PUBLIC ROUTE SECURITY COST

3-5
NONE

3-6
LARGE FLOW + SCANNER

3-7
ACCESS / ROUTE SYNTHESIS

3-8
FREE-WEAVE CENTRAL SPINE + FINAL C4
```

판정:

```text
PASS
```

새 Scanner Variant나 더 빠른 Scanner를 Stage 상승 수단으로 쓰지 않는다.

---

## 4. Scanner Implementation State

### IMPLEMENTED

Current Rope Targeting은:

```text
surface.grappleable === false
→ candidate skip
```

을 지원한다.

즉:

```text
STATIC GRAPPLEABLE FILTER
= IMPLEMENTED
```

### NOT IMPLEMENTED

현재 코드 검색에서 확인되지 않음:

```text
grappleAccessGroup
dynamic scanner phase attach eligibility
```

따라서:

```text
ACCESS SCAN FIELD RUNTIME
= IMPLEMENTATION DEPENDENCY
```

### Required Prototype Contract

권장 최소 구현:

```text
authored controlled-surface group

+

simulation-tick deterministic scanner phase

+

effective attach eligibility filter

+

state renderer / cue

+

multiplayer deterministic agreement
```

### 금지

```text
frozen surface.grappleable 값을
phase마다 mutation
```

---

## 5. Scanner Surface Invariant

3-2 이후 전 Stage 공통:

```text
CONTROLLED SURFACE
=
DEDICATED GAMEPLAY SURFACE SEGMENT
```

금지:

```text
ALWAYS-GRAPPLEABLE PARENT SURFACE
+
CONTROLLED VISUAL OVERLAY
```

이유:

LOCKED 상태를
바로 옆 Parent Surface attach로 무료 우회 가능.

### 3-4 이후 중요한 예외

Service Route / side detour처럼:

```text
DIFFERENT MOVEMENT COST
```

를 지불하고 Scanner를 피하는 것은
의도된 Systemic Solution.

구분:

```text
ACCIDENTAL BYPASS
= FAIL

DESIGNED ALTERNATIVE
= VALID
```

---

## 6. Patrol Drone Progression

### Enemy Count

```text
3-1    0
3-2    0
3-3    1
3-4    1
3-5    0
3-6    1
3-7    1
3-8    2
```

판정:

```text
PASS
```

### Canonical Patrol Family

Current Runtime family:

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

### Baseline

```text
Patrol Speed     48
Patrol Wait      0.45 sec
Mode             pingpong
```

Stage 03에서:

```text
Drone T2
Fast Drone
Armored Drone
Burst Drone
Chase Drone
```

를 추가하지 않는다.

### Rope Cut

```text
Patrol Drone T1
no-rope-cut
```

유지.

판정:

```text
PASS
```

---

## 7. LOS / Cover Contract

Current Generic Enemy에는:

```text
cover-ends-los
```

capability가 존재한다.

하지만 Patrol Drone T1 baseline rules에는
이를 사용하지 않는다.

따라서 Sector 03 Safe Space의 근거:

```text
COVER
```

가 아니라:

```text
ACTIVATION BOUNDS
```

이다.

3-3~3-8 상세 설계는 이 원칙으로 정렬됐다.

판정:

```text
PASS
```

---

## 8. Rope Geometry / 440 px Contract

Current:

```text
Rope Max Attach Distance
= 440 px
```

모든 Stage는:

```text
mandatory progression
≠ max-range challenge
```

원칙을 사용한다.

### 완료된 Stage-level Review

3-1~3-7:

```text
mandatory / representative route links
≤ 440 px
```

개별 Stage 작성 직후 검산 완료.

### 3-8 REV 1.1 재검산

Free-Weave revision:

```text
MAX REPRESENTATIVE LINK
≈ 401 px
```

Drone Pocket activation:

```text
M0   outside
C2   outside
W1   D1 only
E1   D2 only
MX   outside
C3   outside
W2   D1 only
E2   D2 only
M1   outside
```

SHEAR geometry:

```text
W1 → W2
crosses D1 patrol y=-944 at x≈-336

E1 → E2
crosses D2 patrol y=-944 at x≈+336
```

판정:

```text
PASS
```

---

## 9. `swingImpulse = 0` Validation Rule

Current implementation:

```text
swingImpulse = 780
```

하지만 authored mandatory progression은
해당 impulse에 의존하지 않는다.

Sector 03 공통 validation:

```text
swingImpulse = 0
→ mandatory clear possible
```

의도:

```text
780
= expression / current implementation

0
= geometry safety validation
```

판정:

```text
PASS AS DESIGN CONTRACT
```

실제 Runtime integration 후 전 Stage 재플레이 필요.

---

## 10. Build / Growth Progression

Sector 03 진입 Design State:

```text
FOUNDATION
+
FIRST SPECIALIZATION
```

### 3-5 Decision

```text
SECOND SPECIALIZATION
HOLD

SECONDARY AUGMENT
HOLD

HYBRID
HOLD

ARTIFACT REWARD
NONE
```

따라서 Sector 03 전체:

```text
NO NEW GROWTH TIER
```

로 끝난다.

### 이유

현재 실제 제작 상태:

```text
Foundation design
= defined

Foundation runtime
= pending

First Specialization stage
= defined

Specialization catalog / values / pool
= system gate

Artifact runtime
= implemented but separate layer
```

### Artifact 분리

```text
ARTIFACT
≠
ROPE AUGMENT
```

현재 Artifact가 구현되어 있다는 이유로
Sector 03 Rope Growth를 대체하지 않는다.

판정:

```text
PASS
```

---

## 11. Story Disclosure Chain

### Before Sector 03 — 2-8

Player knows:

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

Player does NOT know:

```text
A = 누구
B = 누구
Priority 대상 = 누구
왜 C가 중단
누가 결정
```

### 3-1

관찰:

```text
Commercial District
= brighter / powered / automated / empty
```

질문:

> 왜 위쪽은 이렇게 잘 유지됐지?

### 3-2

확인:

```text
EMPLOYEE VERIFIED
ROUTE AUTHORIZATION INVALID
```

아직 Priority identity 미공개.

### 3-3

확인:

```text
Automated Patrol / Commercial Security
still active
```

새 사회적 진실 없음.

### 3-4

확인:

```text
MAINTENANCE CLEARANCE
→ LOCAL SERVICE ROUTE

NOT
→ VERTICAL TRANSIT AUTHORIZATION
```

### 3-5

새 Reveal 최소화.

현재 권한 상태 재확인.

### 3-6

환경 정황:

```text
LOCAL POWER BUS ACTIVE
COMMERCIAL SERVICE NETWORK LIMITED / ONLINE
```

중요:

```text
Commercial better maintained
≠
citywide incident absent
```

### 3-7

처음 확정:

```text
SERVICE CLASS CONTROL EXISTS
ACCESS TIER CONTROL EXISTS
PRIORITY ROUTE ACTIVE
```

하지만:

```text
A/B/C ↔ tier
```

직접 매핑 금지.

### 3-8

처음 병치:

```text
EVACUATION TRANSFER ARCHIVE

+

UPPER COMMERCIAL ACCESS ARCHIVE
```

같은 facility / deck.

하지만:

```text
NO DIRECT MAPPING
NO DIRECT CAUSALITY
```

### Sector 03 End Question

> **“이 Access 구조와 대피 결과는 어떤 관계였고, 누가 그 규칙을 만들었지?”**

판정:

```text
PASS
```

---

## 12. 3-7 → 3-8 Gameplay Repetition Audit

### 발견된 문제

기존 3-7:

```text
OUTER
PRIORITY
SERVICE
```

세 Cost Profile 선택.

초기 3-8 REV 1.0:

```text
WEST
CENTRAL
EAST
```

세 Cost Profile 선택.

이 구조는 Enemy 수와 이름은 달라도:

```text
LEFT / CENTER / RIGHT
→ choose one
→ merge
```

라는 핵심 decision pattern이 반복된다.

판정:

```text
FAIL — GAMEPLAY REPETITION
```

### 수정

3-8을:

```text
REV 1.1
FREE-WEAVE SECURITY FIELD
```

로 변경.

구조:

```text
M0 SAFE HUB

CENTRAL C2
or
WEST W1
or
EAST E1

↓

MX SAFE CROSSOVER

↓

CENTRAL C3
or
WEST W2
or
EAST E2

↓

M1 SAFE MERGE
```

핵심 차이:

```text
3-7
ONE STATIC COST-PROFILE CHOICE

3-8
REPEATED MOMENT-TO-MOMENT WEAVE
```

Scanner LOCK 시:

```text
WAIT
or
SIDE DETOUR
```

를 선택.

Lower 선택이 Upper 선택을 고정하지 않는다.

판정:

```text
FIXED
PASS AFTER REV 1.1
```

---

## 13. Multiplayer Cross-Check

### Sector 03 Common

- Scanner phase는 모든 Player에 동일해야 함.
- Scanner Lock이 이미 붙은 Rope를 강제 해제하지 않음.
- Player A의 Encounter가 lagging Player B를 다른 Zone에서 공격하게 만들지 않음.
- Safe Hub는 2인 착지 폭 확보.
- Gate open은 shared state.
- Physical crossing은 Player별 진행.

### 3-8 REV 1.1

```text
D1
WEST POCKET ONLY

D2
EAST POCKET ONLY

CENTRAL / M0 / MX / M1
outside both
```

허용:

```text
A → WEST
B → EAST

A → CENTRAL
B → SIDE

MX에서 rejoin / swap
```

주의:

Activation은 겹치지 않아도
이미 발사된 projectile trajectory는 중앙으로 나올 수 있다.

실제 2-player prototype에서 계측 필수.

판정:

```text
PASS AS SPEC
RUNTIME TEST REQUIRED
```

---

## 14. Stage Exit / Gate Contract Audit

### Current Runtime Contract

현재 authored progression:

```text
objective complete
→ Gate Panel
→ contextual interaction
→ Gate open
→ physical crossing
```

별도 `E` Key를 추가하지 않는다.

### Aligned

```text
3-3
3-4
3-5
3-6
3-7
```

는 이 계약을 명시적으로 따른다.

### DRIFT FOUND — 3-1 / 3-2

3-1 / 3-2는 최신 Gate contract 이전에 작성되어
현재 문서에서:

```text
EXIT → next stage
```

중심으로 표현되어 있고
Gate Panel 계약이 명확히 들어가 있지 않다.

### Required Patch

3-1 / 3-2의 Gameplay를 바꾸지 않고
Exit만 다음으로 동기화:

```text
reach exit objective
→ Gate Panel
→ current contextual interaction
→ Gate open
→ physical crossing
```

단:

- 새 Input 없음
- 새 Puzzle 없음
- Gate Panel은 Combat/Scanner pressure 밖
- Gate를 새 기믹처럼 가르치지 않음

판정:

```text
DOCUMENT PATCH REQUIRED
```

---

## 15. 3-8 Final Gate / Boss Contract

### Current Decision

3-8:

```text
BOSS
NONE IN THIS STAGE
```

Stage-local completion:

```text
A1 mandatory Story Trigger
→
Reach P6
```

### HOLD

다음은 아직 확정하지 않는다.

```text
P6 Gate Panel Objective
Physical Gate Crossing
nextAreaId
Boss Entry
General Timer End
Gate Replenishment
Sector-end Checkpoint
```

### 금지

```text
nextAreaId: sector-04-01
```

직접 연결.

### 이유

공통 Boss contract:

```text
planner-defined boss entry
→ general timer / collapse ends
→ remaining time discarded
→ boss timer starts
→ boss defeat
→ next sector
```

정확한 Sector 03 Boss / transition 위치가 아직 OPEN.

판정:

```text
PASS
```

---

## 16. Master Plan Drift Audit

현재 Master Plan은 상세 Stage보다 오래된 부분이 있다.

### DRIFT A — Security Mechanic

Master:

```text
Scanner / Security Shutter 후보
HYPOTHESIS
```

Detailed 3-2 onward:

```text
ACCESS SCAN FIELD
DESIGN SELECTED

Security Shutter
NOT USED
```

권장 Master 업데이트:

```text
Primary New Security Mechanic
ACCESS SCAN FIELD

Status
DESIGN SELECTED / RUNTIME PROTOTYPE GATE
```

즉 Gameplay Design은 선택됐지만
실제 Runtime prototype PASS 전 Production LOCK은 아님.

### DRIFT B — 3-5 Growth

Master:

```text
Growth Tier TBD
```

Detailed 3-5:

```text
NO NEW TIER
GROWTH HOLD
```

Master 업데이트 필요.

### DRIFT C — Planned New Augment

Master:

```text
Planned New Augment TBD
```

Sector 03 상세 전체:

```text
NO NEW AUGMENT IN GENERAL STAGES
```

다음 Tier 결정은 이후 Gate.

Master 업데이트 필요.

### DRIFT D — 3-7 Enemy Count

Master:

```text
1–2 Patrol Drone
```

Detailed 3-7:

```text
1 Patrol Drone exactly
```

3-8의 2-Drone Finale 밀도를 보존하기 위해
Master를 1로 업데이트 권장.

### DRIFT E — 3-8 Gameplay Identity

Master:

```text
Sector General Finale / Story Climax
2 max separated
```

Enemy 수는 그대로 맞는다.

다만 상세 REV 1.1의 차별화:

```text
FREE-WEAVE SECURITY FIELD
```

를 Master에 추가해야 한다.

판정:

```text
MASTER PLAN PATCH REQUIRED
```

---

## 17. 3-2 Runtime Note Drift

3-2 작성 당시 문서에는:

```text
Rope Targeting에 grappleable filter가 없다
```

는 과거 구현 상태가 남아 있다.

하지만 이후 Current Main은:

```text
surface.grappleable === false
→ skip
```

을 지원한다.

3-3 문서도 이미 이 drift를 지적하고 있다.

### Required Patch

3-2 Runtime section:

```text
STATIC GRAPPLEABLE FILTER
= IMPLEMENTED

DYNAMIC SCANNER ACCESS GROUP
= NOT IMPLEMENTED
```

로 갱신.

Gameplay Rule은 변경하지 않는다.

판정:

```text
DOCUMENT PATCH REQUIRED
```

---

## 18. Runtime Snapshot Labeling Policy

각 Stage는 작성 당시의 `main` SHA를 기록하고 있다.

개발이 계속되면:

```text
VERIFIED — CURRENT MAIN
```

이라는 제목은 곧 stale해진다.

### 권장 표준

각 Stage:

```text
VERIFIED — AUTHORING SNAPSHOT
SHA: ...
```

로 기록.

통합 감사 / Production Alignment만:

```text
CURRENT MAIN AT INTEGRATION
```

을 기록한다.

### 이유

Stage 문서가 매 커밋마다
“틀린 문서”가 되는 것을 방지.

판정:

```text
PROCESS PATCH RECOMMENDED
```

---

## 19. Scenario Art Standard Audit

최신 공통 계약:

```text
docs/bsh/scenario/SCENARIO-ART-GENERATION-STANDARD.md
```

PR #461 이후 적용.

핵심:

- 대표 Gameplay Camera Shot 1장
- 전체 Stage Map을 이미지로 대체하지 않음
- 정확한 오브젝트 수
- Player 1명
- live Rope 1줄
- Anchor network / triangle 금지
- Runtime Camera Zone / Stable ID 정렬
- retired / pending image를 새 reference로 사용 금지

### Sector 03 Status

현재:

```text
Sector 03 Runtime Area
= 없음

Sector 03 Camera Zone
= 없음
```

따라서:

```text
APPROVED SECTOR 03 GAMEPLAY ART REFERENCE
= HOLD
```

### Older Stage Docs

3-1~3-7의 개별 Pixel / Art section은
PR #461보다 먼저 작성된 부분이 많다.

앞으로 실제 이미지를 만들기 전에:

```text
GLOBAL ART STANDARD
OVERRIDES OLD LOCAL ART INSTRUCTIONS
```

를 명시한다.

판정:

```text
ART PREPRODUCTION HOLD
```

---

## 20. Visual / Collision Contract

Sector 03 공통:

```text
COLLISION
≠
DECORATION
```

특히:

- pipe
- cable
- rail
- ad frame
- storefront trim

이 Rope Target / Terrain처럼 보이지 않게 한다.

Controlled Surface는:

```text
gameplay segment
+
access-control skin
```

으로 처리.

Scanner Beam은:

```text
thin / informational / amber
```

공격 Laser처럼 만들지 않는다.

Rope:

```text
CYAN
```

Security:

```text
RED / ORANGE / AMBER
```

Commercial Decoration의 Cyan은 제한.

판정:

```text
PASS
```

---

## 21. Sector 04 Reservation Audit

Sector 04:

```text
TRANSIT / INFRASTRUCTURE
```

가 다음 큰 공간/기믹 영역.

Sector 03에서 금지:

```text
moving rail gameplay
train gameplay
moving platform identity
transit signal puzzle
large infrastructure motion
```

3-8은 Gate 너머에:

```text
STATIC
HEAVIER
INFRASTRUCTURAL SILHOUETTE
```

만 허용.

판정:

```text
PASS
```

---

## 22. Integration Patch List

### P0 — REQUIRED BEFORE SECTOR 03 DOC INTEGRATION

#### PATCH 01 — Master Plan

Update:

```text
Scanner / Shutter Candidate
→ ACCESS SCAN FIELD — DESIGN SELECTED / RUNTIME GATE

Growth Tier TBD
→ HOLD / NO NEW TIER IN SECTOR 03 GENERAL STAGES

Planned New Augment TBD
→ NONE IN SECTOR 03 GENERAL STAGES

3-7 Enemy 1–2
→ 1

3-8 identity
→ FREE-WEAVE SECURITY FIELD / 2 separated T1
```

#### PATCH 02 — 3-2 Runtime Note

Update stale static grappleable status.

#### PATCH 03 — 3-1 / 3-2 Exit Contract

Align to current Gate Panel / physical crossing contract.

#### PATCH 04 — 3-8

Use:

```text
REV 1.1 FREE-WEAVE
```

not REV 1.0 three-route version.

### P1 — REQUIRED BEFORE GITHUB SECTOR 03 COMPLETION

Merge in order:

```text
3-6
→
3-7
→
3-8 REV 1.1
```

Then update:

```text
docs/README.md
Sector 03 Master stage table
adjacent NEXT / PREV references
```

### P2 — REQUIRED BEFORE RUNTIME INTEGRATION

1. Implement / prototype Access Scan Field.
2. Verify deterministic multiplayer Scanner Phase.
3. Verify current Rope attachment filter extension.
4. Create Sector 03 authored area catalog.
5. Integrate 3-1 → 3-8.
6. Do not wire 3-8 Post-Sector Gate until Boss flow is locked.
7. Run `swingImpulse=0` geometry validation.
8. Run two-player activation / projectile tests.

### P3 — REQUIRED BEFORE APPROVED ART

1. Runtime Area stable.
2. Camera Zone stable.
3. Stable IDs stable.
4. Blockout approved.
5. Apply Scenario Art Generation Standard.
6. Generate one representative Gameplay Camera Shot per approved request.

---

## 23. Canonical Sector 03 Design After Audit

```text
3-1
POWERED PROMENADE
Commercial contrast
No threat

↓

3-2
SCANNER GALLERY
Teach Access Scan Field

↓

3-3
RETAIL SECURITY WALK
Scanner + 1 Patrol

↓

3-4
SERVICE ARCADE
Public vs Service route identity

↓

3-5
COMMERCIAL SERVICE NODE
Rest / Growth HOLD

↓

3-6
PREMIUM ATRIUM
Large Rope Flow + known security

↓

3-7
PRIORITY CONCOURSE
Static cost-profile route choice
+ Access Tier structure reveal

↓

3-8 REV 1.1
UPPER MARKET GATE
Dynamic Free-Weave
Central Scanner Spine
+ West/East Drone Pockets
+ Archive Juxtaposition

↓

POST-SECTOR 03
BOSS / TRANSITION
TBD
```

---

## 24. Canonical Story State After Sector 03

### KNOWN

```text
Group A
Transfer Complete

Group B
Transfer Complete

Group C
Transfer Suspended

Commercial District
better maintained / powered

Local Maintenance Access
exists

Vertical Authorization
invalid for Player

Service Class Control
exists

Access Tier Control
exists

Priority Route
active

Evacuation Archive
and
Access Archive
coexisted in Upper Commercial Gate
```

### UNKNOWN

```text
Who Group A is

Who Group B is

Who had Priority Access

Exact Group ↔ Access mapping

Why Group C was suspended

Whether Priority directly caused the suspension

Who made resource-allocation decisions

Corporate final truth
```

판정:

```text
STORY SCOPE PASS
```

---

## 25. Implementation Readiness

### Can Graybox Now Without Scanner Runtime

```text
3-1
3-5
3-4 Service-side geometry
3-6 base movement geometry
3-7 / 3-8 pure geometry
```

### Blocked by Scanner Runtime

```text
3-2 core
3-3 combined commit
3-4 Public security
3-6 Scanner flow
3-7 scanner cost
3-8 central free-weave timing
```

### Patrol Side

Already has reusable Runtime foundation:

```text
Patrol capability
activation bounds
target lock cycle
no-rope-cut rule
```

### Growth Side

Still blocked / pending:

```text
Foundation runtime
Specialization catalog/runtime
network replication
```

3-5 correctly does not add another Tier.

---

## 26. 최종 통합 판정

### DESIGN

```text
PASS
```

### GAMEPLAY DIFFERENTIATION

```text
PASS
after 3-8 REV 1.1 Free-Weave fix
```

### STORY

```text
PASS
```

### MULTIPLAYER SPEC

```text
PASS
prototype test required
```

### RUNTIME

```text
NOT READY
Scanner + Sector03 authored catalog missing
```

### DOCUMENT SET

```text
NOT READY FOR FINAL MERGE
until P0 patches applied
```

### NEXT RECOMMENDED ACTION

```text
1. Patch Master Plan
2. Patch 3-2 Runtime Note
3. Patch 3-1 / 3-2 Exit contract
4. Merge 3-6
5. Merge 3-7
6. Merge 3-8 REV 1.1
7. Run final GitHub-wide Sector 03 cross-check
8. Then begin Sector 04 Master Plan
```

---

SECTOR 03 — INTEGRATION CROSS-VALIDATION AUDIT · REV 1.0
