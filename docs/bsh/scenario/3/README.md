# SECTOR 03 — CENTRAL EXCHANGE COMPLEX MASTER PLAN

*MASTER PLAN · REV 2.0 — SPATIAL / STORY REWRITE INTEGRATED · INDIVIDUAL STAGE DOCS MIGRATION PENDING*

`SECTOR 03 CENTRAL EXCHANGE COMPLEX` · `SMART MAINTENANCE SAFETY SYSTEM` · `ENVIRONMENT RHYTHM` · `COMMITMENT` · `ROPE FLOW` · `FREE-WEAVE FINALE`

| 항목 | REV 2.0 기준 |
|---|---|
| Status | REV 2.0 ADOPTED — SPATIAL / STORY REWRITE INTEGRATED / Individual Stage Docs Migration PENDING |
| World Identity | **CENTRAL EXCHANGE COMPLEX — 수직 상업·환승 복합시설** |
| Sector Role | Worker District 이후 첫 Powered Upper-City Contrast |
| Core Gameplay | **ENVIRONMENT RHYTHM + COMMITMENT + ROPE FLOW** (= Moving Threat → Active Route Control → Free-Weave Synthesis) |
| Core Story Shift | “왜 C만 멈췄지?” → “같은 사고였는데… 이동 조건은 같지 않았어.” |
| Carry Build | Foundation + First Specialization KEEP |
| New Rope Mode / New Input | NONE |
| Runtime Mechanic | Existing `ACCESS SCAN FIELD` — RUNTIME PROTOTYPE INTEGRATED / TELEGRAPH IMPLEMENTED |
| World-facing Meaning | **SMART MAINTENANCE SAFETY SYSTEM** (이전: Access Control 암시 → REV 2.0에서 명시적으로 교체) |
| New Augment in Sector 03 General Stages | NONE — Growth HOLD |
| Security Shutter | NOT USED in Sector 03 General Stages |
| New Enemy Type | NONE |
| Reused Enemy | Patrol Drone T1 |
| Boss | 3-8 내부 NONE / Post-Sector 03 Boss / Transition 위치·정체·전투·진입 순서 TBD |
| General Stages | 8 authored progression regions |
| Stage 03-8 Canonical | REV 1.1 FREE-WEAVE — merged to GitHub main via PR #467 (space name만 REV 2.0에서 UPPER EXCHANGE GATE로 갱신, gameplay는 불변) |
| Sector 03 → 04 | Transit / Infrastructure 방향, 정확한 Boss / Transition 순서 TBD |
| Current Runtime | `3-1 → 3-8 MOCK INTEGRATED` (Sector 01 → Sector 03, 24개 Area 연결; Sector 04는 standalone) |
| Approved Gameplay Art | Runtime·Stable ID·기본 Camera 확인 완료; Stage별 Approved Blockout과 exact Camera Shot 확정 전 HOLD |

---

## 0. 재작성 목적

기존 REV 1.x는 Gameplay 계약은 명확했지만 공간 이름과 Story가 기믹 중심으로 분절되어 있었다.

기존 공간명:

```text
POWERED PROMENADE
SCANNER GALLERY
RETAIL SECURITY WALK
SERVICE ARCADE
COMMERCIAL SERVICE NODE
PREMIUM ATRIUM
PRIORITY CONCOURSE
UPPER MARKET GATE
```

문제는 “왜 이 공간 다음에 저 공간이 나오는가?”라는 건축적 질문에 충분히 답하지 못한다는 점이었다.

REV 2.0 원칙:

> **기믹을 위해 방을 만드는 것이 아니라, 실제로 존재할 법한 수직 상업·환승 복합시설을 먼저 만들고 그 공간에 원래 존재할 법한 시스템을 Gameplay 기믹으로 사용한다.**

유지 (REV 1.2에서 변경 없음, 본 문서 아래 기술 계약 섹션들이 그대로 소유):
- Scanner(`ACCESS SCAN FIELD`) Runtime 규칙
- Patrol Drone 재사용
- Foundation + Specialization
- 3-8 Free-Weave
- 8개 Stage의 난이도/기계적 역할
- Rope / Physics Contract, Multiplayer Contract, Collision Contract, Runtime Implementation Order, PASS/FAIL Criteria

재작성 (REV 2.0에서 이번에 갱신):
- Sector 공간 정체
- Stage 명칭
- Scanner 세계관 의미
- 3-1→3-8 이동 논리
- Priority 정보가 등장하는 위치와 해석

---

## 1. 현재 구현 경계

현재 Sector03는:

```text
3-1 → 3-8
MOCK INTEGRATED
```

이다.

`AccessScanField`, stable IDs, Patrol reuse, Story signage, Gate flow가 존재한다.

따라서 이번 REV 2.0은:

```text
CORE MECHANIC REPLACEMENT
NO

WORLD / SPACE / STORY MEANING REWRITE
YES
```

이다.

Scanner Runtime 규칙 유지:

```text
AVAILABLE
→ WARNING
→ LOCKED
→ RESET
```

새 Rope Attach:
- AVAILABLE / WARNING = 가능
- LOCKED / RESET = 불가

기존 Rope:
- **STAYS ATTACHED**

Damage / Rope Cut / Forced Detach:
- NONE

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

### Current Runtime Boundary (기술 상세)

- `AccessScanField`가 AVAILABLE/WARNING/LOCKED/RESET을 결정적으로 계산하고 controlled surface의 새 Rope attach만 제한한다.
- Scanner phase는 scene snapshot으로 전달되며 공용 overlay가 색뿐 아니라 solid/dash/chevron/X/box 형태로 네 상태를 구분한다.
- 3-1~3-8 Area Catalog, stable object/surface IDs와 Stage별 `PRODUCTION-ALIGNMENT.md`가 존재한다.
- Sector 03은 의도적으로 custom Camera Zone을 두지 않고 공용 기본 Camera를 사용한다. `Camera Zone 없음`은 구현 누락이 아니다.
- 남은 Production Gate는 전체 등반·모바일 가독성·두 기기 phase 일치 플레이테스트와 Stage별 Approved Blockout이다.

---

## 2. 공간 정체 — CENTRAL EXCHANGE COMPLEX

Sector03는 추상적인 Commercial District 8개 방이 아니다.

Worker District의 생활권과 상부 도시 Transit을 연결하는 하나의 거대한 **수직 상업·환승 복합시설**이다.

평상시 기능:
- 생활형 상권
- 중앙 상업 Atrium
- Front-of-House Retail
- Back-of-House Service
- Building Services
- 상층 Transfer / Transit Connection

도시 연결:

```text
SECTOR 04
TRANSIT INFRASTRUCTURE
          ↑
UPPER EXCHANGE / TRANSFER
          │
CENTRAL EXCHANGE COMPLEX
          │
LOWER MARKET / DAILY RETAIL
          │
SECTOR 02
WORKER DISTRICT
```

Worker District 주민들도 식사, 약국, 세탁, 수리, 쇼핑, Transit 환승을 위해 이 공간을 사용했다.

따라서 Sector02→03의 변화는 먼저:

```text
RESIDENTIAL LIFE
↓
DAILY COMMERCIAL LIFE
↓
CITY-WIDE TRANSFER
```

로 읽혀야 한다.

---

## 3. 수직 공간 흐름

```text
                         SECTOR 04
                   TRANSIT INFRASTRUCTURE
                           ↑
              ┌──────────────────────────┐
              │ 3-8 UPPER EXCHANGE GATE │
              ├──────────────────────────┤
              │ 3-7 TRANSFER MEZZANINE  │
              ├──────────────────────────┤
              │ 3-6 GRAND CENTRAL ATRIUM│
              ├──────────┐   ┌───────────┤
              │ 3-5      │   │           │
              │ BUILDING │   │           │
              │ SERVICES │   │           │
              ├──────────┘   │           │
              │ 3-4 RETAIL SERVICE SPINE│
              ├──────────────────────────┤
              │ 3-3 CENTRAL RETAIL WALK │
              ├──────────────────────────┤
              │ 3-2 FACADE SERVICE      │
              │     GALLERY              │
              ├──────────────────────────┤
              │ 3-1 LOWER MARKET        │
              │     PROMENADE            │
              └──────────────────────────┘
                           ↑
                     SECTOR 02
```

진행 논리:

```text
PUBLIC DAILY SPACE
→ BUILDING SKIN / SERVICE
→ CENTRAL PUBLIC SPACE
→ FRONT vs BACK-OF-HOUSE
→ BUILDING CORE
→ MONUMENTAL ATRIUM
→ TRANSFER LEVEL
→ CITY TRANSIT BOUNDARY
```

---

## 4. 감정 / Story Arc

Sector02 종료:
> 사람들의 생활 흔적과 대피 집결 기록은 남아 있지만 사람은 없다.

Sector03 시작:
> **그런데 이곳은 아직 켜져 있다.**

감정곡선:

```text
3-1 CONTRAST
“왜 여긴 이렇게 살아 있지?”

3-2 CURIOSITY
“건물 자동화도 계속 작동한다.”

3-3 READING
“서로 다른 시스템이 각자 자기 규칙대로 움직인다.”

3-4 CHOICE
“같은 건물에도 Public과 Service의 다른 구조가 있다.”

3-5 BREATH / QUESTION
“이 건물은 자체적으로 꽤 오래 버틴 것 같다.”

3-6 AWE / FLOW
“이 규모를 Rope로 타고 올라간다.”

3-7 UNEASE
“사고 당시 이동 요청에 우선순위가 있었다.”

3-8 CONNECTION
“Group C의 대기 기록과 Upper Transfer 기록이 연결된다.”
```

Sector03 종료 시 Player가 아는 것:
1. 상부 상업·환승시설은 하부보다 훨씬 많은 시스템이 살아 있었다.
2. 사고 당시 Transfer 요청에는 서로 다른 처리 상태가 존재했다.
3. Worker District의 Group C는 대기 상태였다.

아직 모르는 것:
- 왜 차이가 생겼는가
- 누가 결정했는가
- 자원 부족/정책/긴급 판단 중 무엇이 원인이었는가
- Group A/B/C의 사회계층 대응
- 의도적 희생 여부

인과와 책임은 Sector04~05로 남긴다.

---

## 5. Gameplay Shift

### 핵심 질문의 진화

Sector 01:
> **“Rope를 사용할 수 있는가?”**

Sector 02:
> **“움직이는 상황 속에서 언제 진입할 것인가?”**

Sector 03:
> **환경의 주기가 변할 때 언제 Commit해서 Flow를 유지할 것인가?**

### Sector 02 → Sector 03 압력 구조 전환

Sector 02:

```text
ENEMY POSITION
→ route pressure
```

Sector 03:

```text
SECURITY STATE (= Smart Maintenance Safety cycle)
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

Sector 03의 환경 리듬은:

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

### Formula

```text
ENVIRONMENT STATE
+
ENEMY POSITION
+
CURRENT BUILD
↓
COMMIT WINDOW
↓
ATTACH
↓
SWING / RELEASE
↓
KEEP FLOW
```

Sector03는 `RED면 기다리고 GREEN이면 간다`가 아니다.

초보:

```text
AVAILABLE
→ 이동
→ 착지
→ 다음 Cycle 확인
```

숙련:

```text
WARNING
→ 선행 Attach
→ LOCK 중 기존 Rope 유지
→ 다음 AVAILABLE 순간 Re-Attach
→ Landing Skip
```

---

## 6. ACCESS SCAN FIELD 세계관 재해석

내부 Runtime 명칭 `ACCESS SCAN FIELD`는 유지한다.

World-facing 의미:

> **SMART MAINTENANCE SAFETY SYSTEM**

Central Exchange Complex에는:
- Media Wall
- Smart Signage
- Facade Lighting
- Cleaning Rail
- Service Frame
- Ceiling Rig
- Advertising Mount
- Electrical Distribution

등 대형 자동화 설비가 많다.

정비용 Service Mount는 “현재 작업자 체중을 받아도 안전한가?”를 Building Automation이 확인한다.

정상 운용:

```text
AVAILABLE  작업 가능
WARNING    설비 상태 전환 예정
LOCKED     신규 작업자 부착 금지
RESET      점검 / 재초기화
```

Cascade 이후 Central coordination은 불안정하지만 Local Building Automation은 살아 있어 Fail-safe cycle을 반복한다.

이 시스템은 시민 감시나 이동 통제 장치가 아니다.

이미 작업자가 매달려 있는데 강제로 떼는 것은 더 위험하므로:

```text
CURRENT OCCUPANCY
KEEP

NEW ATTACHMENT
DENY
```

가 되어 현재 Runtime의 `LOCKED에서도 기존 Rope 유지`와 세계관이 맞는다.

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

### Why Scanner, Not Security Shutter

Security Shutter는 Sector 03 General Stage에서 사용하지 않는다.

**이유 1 — Current Architecture.** 물리 Shutter는 moving collision, player trapping, rope-anchor / collision state synchronization, multiplayer prediction, dynamic surface ownership을 동시에 요구한다.

**이유 2 — Sector Identity.** Sector 04는 `TRANSIT / INFRASTRUCTURE`가 핵심이다. Sector 03에서 움직이는 거대한 물리 구조를 대표 Gameplay로 소비하면 Sector 04 정체성과 겹칠 위험이 있다.

**이유 3 — Rope Coupling.** Scanner는 `STATIC GEOMETRY + DYNAMIC ATTACH ELIGIBILITY`만으로 Rope Timing 질문을 직접 만든다.

결론:

```text
SECURITY SHUTTER
= RESERVED / NOT USED

ACCESS SCAN FIELD (SMART MAINTENANCE SAFETY SYSTEM)
= SECTOR 03 PRIMARY SYSTEM
```

---

## 7. Patrol Drone과의 관계

Patrol Drone과 Smart Maintenance Safety는 같은 시스템이 아니다.

Patrol:
- Facility / Disaster Response Unit
- 구조·재난·시설 순회
- Player Security Incident 확인 시 Intercept

Smart Mount:
- Building Automation
- 구조 상태 / 정비 안전 관리

따라서 Sector03에서는:

```text
Mount는 열려 있는데 Drone이 그쪽에 있다.

또는

Drone은 멀리 있는데 Mount가 곧 잠긴다.
```

가 발생한다.

두 독립 시스템의 상태를 동시에 읽는 것이 Sector03의 복합 재미다.

---

## 8. Scanner Implementation Contract

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

지원. 따라서:

```text
STATIC FILTER
= IMPLEMENTED
```

### Current Dynamic Support

```text
authored dynamic access group
simulation-time phase evaluation
scanner renderer cue
authority / owner-prediction shared phase
= IMPLEMENTED PROTOTYPE
```

구현 전 설계와 실행 경계는 [`ACCESS-SCAN-FIELD-RUNTIME-PROTOTYPE-SPEC.md`](./ACCESS-SCAN-FIELD-RUNTIME-PROTOTYPE-SPEC.md)와 [`ACCESS-SCAN-FIELD-CODEX-IMPLEMENTATION-HANDOFF.md`](./ACCESS-SCAN-FIELD-CODEX-IMPLEMENTATION-HANDOFF.md)에 보존한다. 현재 Runtime 계약과 검증 근거는 [`3-2/PRODUCTION-ALIGNMENT.md`](./3-2/PRODUCTION-ALIGNMENT.md), `src/game/world/AccessScanField.js`, `tests/accessScanField.mjs`가 소유한다.

`STATIC FILTER`와 `DYNAMIC SCANNER`는 모두 구현됐으며, 현 단계의 남은 일은 전용 art/audio/VFX와 실제 기기에서의 telegraph 가독성 검증이다.

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

Scanner State는 `PLAYER A`, `PLAYER B`에게 같은 simulation phase여야 한다.

Client별 다른 Scanner phase 금지.

---

## 9. Controlled Surface Invariant

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

이유: LOCKED Surface 대신 바로 옆 permanent parent에 붙어 Mechanic을 무료 우회할 수 있다.

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

## 10. Rope / Physics Design Contract

### CURRENT MAIN BASELINE

```text
Rope Max Attach Distance 400
Attach Buffer            0.1 sec
Swing Impulse            780
Release Angular Transfer 0.55
```

### Mandatory Geometry

Sector 03 모든 필수 진행: `≤ 400 px`이어야 한다.

### Max Range Challenge 금지

Scanner / Drone / Route Choice와 동시에 `near-400 exact range test`를 필수로 요구하지 않는다.

권장: `180–390 px`

### `swingImpulse = 0` Validation

실제 Current Runtime: `780`

하지만 Blockout validation: `swingImpulse = 0` → mandatory route clearable 유지.

의도: `780 = expression`, `0 = geometry safety contract`

---

## 11. Enemy Progression

Sector 03에서는 새로운 Enemy Type을 만들지 않는다.

### Reuse

```text
PATROL DRONE T1
```

### Stage Count (신규 공간명 기준)

```text
3-1 LOWER MARKET PROMENADE     0
3-2 FACADE SERVICE GALLERY     0
3-3 CENTRAL RETAIL WALK        1
3-4 RETAIL SERVICE SPINE       1
3-5 BUILDING SERVICES HUB      0
3-6 GRAND CENTRAL ATRIUM       1
3-7 TRANSFER MEZZANINE         1
3-8 UPPER EXCHANGE GATE        2
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

Patrol T1 projectile: `no-rope-cut` 유지.

### 금지

Drone T2 / Fast Drone / Armored Drone / Laser Drone / Chase Drone / Burst Drone

---

## 12. LOS / Safe-Space Contract

Generic Enemy Runtime에는 `cover-ends-los` capability가 있다.

그러나 Patrol Drone T1 baseline에는 해당 rule이 기본 적용되지 않는다.

따라서 Sector 03 Safe Deck의 근거는 `COVER`가 아니라 `ACTIVATION BOUNDS`이다.

### Common Rule

Safe observation / recovery / story deck은 `new target acquire`가 불가능한 activation outside로 설계.

단, `already-fired projectile`은 즉시 삭제되지 않을 수 있다.

따라서 Safe Deck은 단순 activation outside뿐 아니라 실제 projectile trajectory도 Playtest한다.

---

## 13. Growth Progression — HOLD

Sector 03 시작 Design State:

```text
FOUNDATION
+
FIRST SPECIALIZATION
```

### Sector 03 General Stages

```text
NEW AUGMENT           NONE
SECOND SPECIALIZATION HOLD
SECONDARY AUGMENT     HOLD
HYBRID                HOLD
CHECKPOINT REWARD     NONE
```

### 3-5 Decision

3-5 `BUILDING SERVICES HUB`:

```text
REST
+
BUILD DIAGNOSTIC
```

새 Growth를 주지 않는다.

### 이유

Current production:

```text
Foundation design               = authored
Foundation runtime               = pending
First Specialization stage       = authored
Specialization names/values/pool = system gate
```

첫 성장 계층이 실제 Runtime / Playtest를 통과하기 전에 더 높은 Tier를 Stage 때문에 먼저 만들지 않는다.

---

## 14. Stage Naming Migration & Master Table

| 기존 (REV 1.2) | REV 2.0 공간명 | 공간 의미 | Gameplay Role | Enemy | Scanner | Growth |
|---|---|---|---|---:|---|---|
| 3-1 POWERED PROMENADE | **LOWER MARKET PROMENADE** | Worker District와 맞닿은 생활형 상권 | Powered Commercial reveal / low-pressure Rope flow | 0 | OFF | none |
| 3-2 SCANNER GALLERY | **FACADE SERVICE GALLERY** | 광고/외벽/조명 뒤 정비 Gallery | First Smart Maintenance Safety tutorial | 0 | first active | none |
| 3-3 RETAIL SECURITY WALK | **CENTRAL RETAIL WALK** | 중앙 Atrium 가장자리 Public Walk | Scanner + Patrol first synthesis | 1 T1 | 1 group | none |
| 3-4 SERVICE ARCADE | **RETAIL SERVICE SPINE** | Front / Back-of-House 분기 | Public vs Service first route identity | 1 T1 | Public route | none |
| 3-5 COMMERCIAL SERVICE NODE | **BUILDING SERVICES HUB** | 전력·환기·안내·Facade 관리층 | Rest / Build Diagnostic | 0 | none | **HOLD / none** |
| 3-6 PREMIUM ATRIUM | **GRAND CENTRAL ATRIUM** | 복합시설 대표 대공간 | Large Rope Flow + known Security timing | 1 T1 | 1 shared group | none |
| 3-7 PRIORITY CONCOURSE | **TRANSFER MEZZANINE** | 상층 Transit 환승층 | Static cost-profile route choice + Story pressure | 1 T1 | 1 shared group | none |
| 3-8 UPPER MARKET GATE | **UPPER EXCHANGE GATE** | Commercial → Transit 경계 | Dynamic Free-Weave Finale | 2 T1 separated | 1 shared group | none |

`Priority`, `Scanner`, `Security`는 공간명이 아니라 시스템/기록/사건 이름으로 사용한다.

---

## 15. Sector Rhythm & Difficulty

```text
SPACE
→ DISCOVERY
→ TIMING
→ CHOICE
→ BREATH
→ FLOW
→ DECISION
→ MASTERY
```

| Stage | 핵심 재미 | 학습/역할 | Difficulty |
|---|---|---|---|
| 3-1 LOWER MARKET PROMENADE | 새 대공간을 기존 Rope로 누비는 해방감 | 공간 대비 | ★★ |
| 3-2 FACADE SERVICE GALLERY | 환경 주기를 읽고 Attach하는 Aha | Smart Mount timing | ★★☆ |
| 3-3 CENTRAL RETAIL WALK | Mount timing + Drone position | synthesis | ★★★ |
| 3-4 RETAIL SERVICE SPINE | Public / Service 비용 선택 | route identity | ★★★ |
| 3-5 BUILDING SERVICES HUB | 현재 Build + 호흡 | rest | REST |
| 3-6 GRAND CENTRAL ATRIUM | 큰 Atrium의 Rope Flow | expression | ★★★☆ |
| 3-7 TRANSFER MEZZANINE | 다중 비용 Route + Transfer Story | synthesis | ★★★☆ |
| 3-8 UPPER EXCHANGE GATE | 순간 상태에 따른 즉석 Route 구성 | free-weave mastery | ★★★★ |

Sector03는 “Scanner Stage 7개”가 아니라 위 SPACE→MASTERY 흐름으로 느껴져야 한다.

---

## 16. 3-1 — LOWER MARKET PROMENADE

### Space

Worker District와 직접 맞닿은 생활형 상권.

공간: 식당 / 약국 / 세탁 / 수리점 / 편의점 / 작업용품점 / 작은 Market stalls

### Gameplay

```text
ONE CLEAR ASCENT
+
OPTIONAL FLOW SKIPS
```

- Enemy 없음
- Scanner 없음
- 새 Mechanic 없음
- 기존 Rope로 새로운 공간 규모를 즐김

핵심 재미:
> **“익숙한 Rope인데 공간의 분위기와 스케일이 완전히 달라졌다.”**

Key Question:
> **“왜 이곳은 아직 이렇게 잘 켜져 있지?”**

### Story

보여줌: Storefront standby / Signage loop / 일부 자동문 / Emergency illumination / powered lights / ad display / kiosk / cleaner commercial surfaces / products / no people

공개 금지: Priority identity / A·B identity / Group mapping

Character:
> **“여긴 아직 전력이 들어오네.”**

Priority / Access Tier는 아직 전면 노출하지 않는다.

### Important

3-1은 Sector Intro. Scanner Tutorial을 침범하지 않는다.

---

## 17. 3-2 — FACADE SERVICE GALLERY

### Space

Lower Market 상부의 Media Wall·대형 간판·천장 구조 뒤 정비 Gallery.

공간 논리:

```text
상점 / 광고
↓
그것을 유지하는 Service Layer
```

보이는 요소: media panel rear / lighting truss / cable trunk / service catwalk / smart service mount

### Gameplay

첫 Smart Maintenance Safety Cycle.

```text
SEE
→ WAIT IF NEEDED
→ ATTACH
→ STAY ATTACHED THROUGH LOCK
→ RELEASE
→ RE-ATTACH NEXT WINDOW
```

Enemy 없음.

핵심 재미:
> **“공간 자체에도 타이밍이 있다.”**

Character:
> **“정비 마운트가 안전 주기를 돌고 있어.”**

### Important Runtime Note

Canonical current state:

```text
STATIC GRAPPLEABLE FILTER
= IMPLEMENTED

DYNAMIC ACCESS SCAN FIELD FILTER
= NOT IMPLEMENTED
```

(현재 GitHub 3-2 REV 1.1 Runtime Note / Gate Contract Sync 상태 기준. 공간명만 REV 2.0 갱신 대상이며 이 Runtime 상태는 불변.)

---

## 18. 3-3 — CENTRAL RETAIL WALK

### Space

Facade Service Gallery를 통과해 중앙 Public 영역으로 복귀.

거대한 Atrium 가장자리의 여러 층을 잇는 Retail Walk.

아래를 보면 Lower Market과 하층 Walkway가 보여 **하나의 건물을 계속 올라가고 있음**을 인식시킨다.

### Gameplay

처음:

```text
SCANNER
+
PATROL DRONE
```

결합.

```text
OBSERVE TWO SIGNALS
→
ONE COMMIT WINDOW
```

Enemy: `Patrol Drone T1 × 1`

핵심 재미:
> **“열린 Mount와 움직이는 Drone 사이에서 Commit Window를 찾는다.”**

### Difficulty

Scanner / Drone을 강화하지 않고 기존 두 규칙을 한 판단 안에 겹친다.

---

## 19. 3-4 — RETAIL SERVICE SPINE

### Space

Front-of-House와 Back-of-House가 갈리는 상업시설 중층.

PUBLIC: 넓음 / 읽기 쉬움 / Rope 입력 적음 / Smart automation 많음 / Drone exposure 있음

SERVICE: 좁음 / Rope chaining 많음 / permanent maintenance frame 많음 / automation pressure 낮음

핵심 재미:
> **“편한 공공동선의 시스템 리듬을 탈 것인가, 복잡한 설비동선에서 Rope 실력으로 풀 것인가?”**

이것은 VIP vs 노동자 Route가 아니라 실제 상업시설 Front/Back 구조다.

### Story

```text
MAINTENANCE CLEARANCE
RECOGNIZED

LOCAL SERVICE ROUTE
AVAILABLE
```

하지만: `LOCAL SERVICE ACCESS ≠ VERTICAL TRANSIT AUTHORIZATION`

Character (필요 시):
> **“서비스 쪽은 자동화가 덜 걸려 있어.”**

### Important

Service가 정답이 아니다. Public도 함정이 아니다.

---

## 20. 3-5 — BUILDING SERVICES HUB

### Space

Service Spine들이 합류하는 중간 설비 허브.

기능: electrical distribution / ventilation / signage control / facade control / local backup power

### Gameplay

```text
REST
+
CURRENT BUILD RE-READ
```

- Enemy 없음
- Active Scanner 없음
- Growth 없음 (NO NEW TIER)

Optional Node: Read-only Diagnostic 가능. 단 Foundation / Specialization Runtime이 실제 존재한 뒤에만.

금지: fake build value / reroll / respec / upgrade / reward pedestal

### Story Display 후보

```text
LOCAL SYSTEM STATUS

LIFE SAFETY
ONLINE

ATRIUM LIGHTING
ONLINE

SERVICE GRID
ONLINE

EXTERNAL LINK
DEGRADED
```

Character:
> **“이 건물은 자체 계통으로 버티고 있었나…”**

단정이 아니라 가설.

---

## 21. 3-6 — GRAND CENTRAL ATRIUM

### Space

Sector03의 공간적 클라이맥스.

구성: 거대한 수직 Void / 여러 층 Balcony / Media Wall / Hanging signage / Ceiling structure / Service bridges / Escalator / elevator void

### Gameplay

```text
known Scanner
+
1 Patrol
+
large Rope arc
```

Structure:

```text
First Scanner Arc
→
Safe Mid Recombination
→
Scanner + Drone Commit
→
Upper Free Flow
```

새 기믹 없음. Growth: 새 Power 없음, Foundation + first Specialization Design State만 유지. Mandatory progression은 Build effect 없이도 성립.

핵심 재미:
> **“시스템이 열리길 기다리는 게 아니라 그 리듬 안으로 들어가 계속 흐른다.”**

초보는 Cycle 단위로 이동. 숙련자는 WARNING/LOCK 경계를 이용해 긴 Flow를 유지.

이 Stage에서는 말풍선보다 공간과 Rope 자체가 Story와 재미를 담당한다. (Character bubble 없음)

---

## 22. 3-7 — TRANSFER MEZZANINE

### Space

Grand Atrium 상부에서 도시 Transit으로 이동하는 사람들이 모이는 환승층.

여기서 처음 Platform direction / Shuttle connection / Service transfer / Emergency boarding 기록이 집중된다.

`PRIORITY`는 공간 이름이 아니라 **사고 당시 운영 기록**이다.

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

Enemy: `Patrol Drone T1 × 1` (Master REV 1.0의 `1–2`는 superseded)

핵심 재미:
> **“같은 목적지에 가기 위해 어떤 비용을 감수할지 내가 고른다.”**

### Story Reveal

예:

```text
EMERGENCY TRANSFER STATUS

PRIORITY A
BOARDING READY

PRIORITY B
QUEUE ASSIGNED

SERVICE
STANDBY
```

처음 확정: `SERVICE CLASS CONTROL exists`, `ACCESS TIER CONTROL exists`, `PRIORITY ROUTE active`

Group A/B/C와 직접 매핑하지 않는다.

Character:
> **“대피 순서가 따로 있었어.”**

### Important

다음은 아직 금지: `Group A = Priority`, `Group B = Premium`, `Group C = Standard`

---

## 23. 3-8 — UPPER EXCHANGE GATE (REV 1.1 FREE-WEAVE)

### CANONICAL STATUS

```text
REV 1.1
FREE-WEAVE
```

현재 GitHub REV 1.0은 superseded. (공간명은 REV 2.0에서 `UPPER MARKET GATE` → `UPPER EXCHANGE GATE`로 갱신, Free-Weave gameplay는 불변.)

### Space

Commercial Complex 최상부. Sector04 Transit Infrastructure로 넘어가는 Exchange Hall.

보이는 것: Departure / Transfer Board / Transit connector / 아래 Grand Atrium 전망 / Emergency transfer logs / Public / Service connector

### Why REV 1.0 Failed

3-7: `Outer / Priority / Service → choose one cost profile`

REV 1.0 3-8: `West / Central / East → choose one cost profile`

결국 `LEFT / CENTER / RIGHT → choose → merge` 판단 패턴 반복.

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

Scanner가 AVAILABLE: `CENTRAL FLOW`

Scanner가 LOCKED: `WAIT or MOVE SIDEWAYS INTO DRONE POCKET`

Lower 선택은 Upper 선택을 고정하지 않는다.

핵심 질문:

```text
WHERE?
+
WHEN?
```

### Enemy

```text
D1 WEST ONLY
D2 EAST ONLY
```

두 activation: `NO OVERLAP`. Central / M0 / MX / M1: `outside both`

### Story Climax

A1 Mandatory Story Deck: `EVACUATION TRANSFER ARCHIVE` + `UPPER COMMERCIAL ACCESS ARCHIVE`가 같은 facility에 존재.

하지만: `NO GROUP ↔ TIER MAPPING`, `NO DIRECT CAUSALITY`

Story 병치:

Sector02: `EVACUATION GROUP C / WAIT FOR FURTHER INSTRUCTION`

Sector03: `TRANSFER REQUESTS / READY / QUEUED / STANDBY`

Character:
> **“같은 사고였는데… 이동 조건은 같지 않았어.”**

인과는 확정하지 않는다.

### Gameplay Role

Sector03 Free-Weave Finale. Scanner + Patrol 2 territories. 정적 세 Route 선택이 아니라 현재 상태를 보고 즉석에서 Route 구성.

### Exit

```text
UPPER EXCHANGE GATE
→ POST-SECTOR 03 SAFE / BOSS ENTRY
```

3-8 내부 Boss 없음.

---

## 24. Story Disclosure Chain — Canonical

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

### 3-1 (LOWER MARKET PROMENADE)

```text
Commercial District
better maintained / powered / automated
```

하부와 상부의 기능 상태 차이를 체감.

### 3-2 (FACADE SERVICE GALLERY)

```text
EMPLOYEE VERIFIED
ROUTE AUTHORIZATION INVALID
```

### 3-2~3-4

건물 자동화가 Local fail-safe로 계속 작동함을 확인.

### 3-3 (CENTRAL RETAIL WALK)

```text
AUTOMATED SECURITY
still active
```

### 3-3~3-6

Drone / Building Automation / Signage가 각각 독립적으로 돌아감을 경험.

### 3-4 (RETAIL SERVICE SPINE)

```text
MAINTENANCE CLEARANCE
→ LOCAL SERVICE

NOT
→ UPPER VERTICAL AUTHORIZATION
```

### 3-5 (BUILDING SERVICES HUB)

새 Story Reveal 최소화.

### 3-6 (GRAND CENTRAL ATRIUM)

```text
LOCAL POWER BUS
ACTIVE

COMMERCIAL SERVICE NETWORK
LIMITED / ONLINE
```

Commercial이 더 잘 유지되지만 `citywide cascade가 없었다`는 뜻은 아님.

### 3-7 (TRANSFER MEZZANINE)

```text
Service Class Control exists
Access Tier Control exists
Priority Route active
```

Emergency Transfer 처리 상태가 동일하지 않았음을 발견.

### 3-8 (UPPER EXCHANGE GATE)

```text
Evacuation Transfer Archive

and

Access-Control Archive

coexisted in same Upper Commercial Gate
```

Group C의 WAIT 기록과 상층 Transfer 기록을 머릿속에서 연결.

Sector03의 결론은 **“차이가 있었다.”**까지다. **“왜 그런 차이가 생겼다.”**는 아직 아니다.

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

## 25. Character Bubble 연출 — 규칙

권장 Story Bubble (각 Stage 섹션에도 반복 표기):

- 3-1: **“여긴 아직 전력이 들어오네.”**
- 3-2: **“정비 마운트가 안전 주기를 돌고 있어.”**
- 3-3: 없음
- 3-4: 필요 시 **“서비스 쪽은 자동화가 덜 걸려 있어.”**
- 3-5: **“이 건물은 자체 계통으로 버틴 건가…”**
- 3-6: 없음
- 3-7: **“대피 순서가 따로 있었어.”**
- 3-8: **“같은 사고였는데… 이동 조건은 같지 않았어.”**

규칙:
- Safe Landing에서 표시
- 이동 중 긴 Bubble 금지
- 2줄 이하
- 사실은 Environment/System이 먼저 보여줌
- Character는 해석만 함

---

## 26. Commercial Power-State Canon

Sector 03은 `TOTALLY NORMAL UPPER CITY`가 아니다.

정확한 Contrast:

```text
WORKER DISTRICT
reduced / damaged / dim

CENTRAL EXCHANGE COMPLEX
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

## 27. Visual Identity / Architecture / Palette

### Worker District

```text
worn residential
laundry
balcony
personal traces
emergency lighting

WARM BUT DIM
WORN / DENSE / LIVED-IN / RESIDENTIAL
```

### Central Exchange Complex

```text
backlit signage
storefront module
glass / metal frame
service truss
media wall
large atrium void
backup lighting

BRIGHTER / POLISHED / POWERED / EMPTY / COMMERCIAL
```

하지만 Sector03를 완벽한 Luxury Mall로 만들지 않는다.

사고 흔적: cracked panel / fallen sign / frozen escalator / abandoned bags / partially dark storefront / looped advertisement

차이는 `NO DAMAGE`가 아니라 `MORE SYSTEMS STILL OPERATING`이다.

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

shopping atrium / retail balcony / storefront / service corridor / building services hub / grand atrium / transfer mezzanine / exchange gate / maintenance frame behind facade

### Avoid

flat modern mall floor repetition / Worker residential balcony repetition / Sector 04 moving transit identity / Sector 05 corporate office identity

### Palette — Base

```text
Deep Navy
Graphite
Polished Dark Gray
Cool Concrete
```

### Palette — Commercial Light

```text
Warm White
Muted Gold / Amber
Muted Magenta
Desaturated Teal
```

### Gameplay Priority Color

```text
Rope / Grapple
CYAN

Scanner Warning / Security
AMBER / RED / ORANGE

Player Scarf
RED
```

Commercial 광고에 Cyan을 과도하게 사용하지 않는다. `Rope Cyan`의 우선순위가 가장 높다. Scanner는 Damage Laser가 아니므로 두껍고 공격적인 Red Laser Beam처럼 만들지 않는다.

---

## 28. Smart Mount Visual Language

AVAILABLE:
- Cyan structural indicator
- solid mount

WARNING:
- Amber pulse
- cycle transition cue

LOCKED:
- dim / red-orange
- closed clamp / X
- Hook candidate clearly absent

RESET:
- neutral diagnostic pulse
- not attachable

금지: Damage laser / Surveillance eye / Citizen checkpoint / Moving red wall

---

## 29. Collision / Decoration Contract

Sector 03는 Visual Detail이 많기 때문에 Collision 오독 위험이 크다.

### Always Separate

```text
COLLISION GEOMETRY
≠
NONCOLLISION DECORATION
```

특히: pipe / cable / railing / ad frame / storefront trim / hanging sign이 Grapple Target이나 Terrain처럼 보여서는 안 된다.

### Terrain

Gameplay collision skin은 `actual authored geometry`를 따른다. Graphics가 Collision을 새로 정의하지 않는다.

---

## 30. Build Interaction

Foundation + First Specialization 유지.

IMPULSE: 큰 Atrium / 빠른 Commit / 노출시간 감소

RELAY: Service Spine / Multi-mount chain / Scanner window 사이 연결

SHEAR: Drone이 있는 Stage에서 이동선과 공격선 결합 / Kill mandatory 아님

금지: Build 전용 필수 Route / Scanner 무효화 Build / Priority Access Key / Specialization-only Door

Build는 `HOW`를 바꾸되 `CAN / CANNOT`을 바꾸지 않는다.

---

## 31. Multiplayer Contract

### Scanner

두 Player: `same scanner phase`를 본다.

### Enemy

각 Drone은 `activation bounds` 안 Player만 eligible. 다른 Route / Pocket / Safe Hub의 Player를 cross-zone target으로 잡지 않는다.

### Safe Hubs

2인 착지 폭 확보.

### UI

Story / Diagnostic UI: `NO GLOBAL PAUSE`

### Gate

현재 일반 Stage Gate: `shared open` / `individual physical crossing` 원칙.

3-8 Final Gate만 Post-Sector contract 확정 전 HOLD.

---

## 32. Recovery Contract

Sector 03은 Timing Layer가 추가되므로 실패 비용을 짧게 유지한다.

### Target

대부분 `3–5 sec` 내 재진입 가능.

### Avoid

full-stage fall / start reset / damage floor / recovery under sustained new fire

### Safe Deck

Safe 의미: `NO NEW ACQUIRE`이지 `all existing projectiles disappear`가 아니다.

---

## 33. Boss / Timer / Sector Transition

### Sector 03 General Stage

`3-1 ~ 3-8`

### Boss

각 Sector에 1 Boss가 존재하지만 `BOSS LOCATION / IDENTITY / ENTRY / COMBAT / REWARD` 현재 OPEN.

### 3-8

`BOSS NONE IN THIS STAGE`

### Stage-local Completion

3-8 REV 1.1: `A1 mandatory story trigger → Reach P6`

### HOLD

P6 이후: Gate Panel objective / physical crossing / nextAreaId / boss entry / general timer end / checkpoint 모두 TBD.

### 금지

`P6 → sector-04-01` 직접 연결.

---

## 34. Sector 04 Reservation

Sector 04: `TRANSIT / INFRASTRUCTURE`

### Sector 03에서 금지

moving train gameplay / moving rail route / conveyor identity / moving platform as primary mechanic / transit signal puzzle / large infrastructure motion

### 3-8 Preview

허용: static heavy frame / large conduit / distant infrastructure silhouette 까지만.

### Sector 공간 연결

```text
CENTRAL EXCHANGE COMPLEX
UPPER EXCHANGE GATE
↓
POST-SECTOR SAFE / BOSS ENTRY
↓
SECTOR BOSS
↓
SECTOR04
TRANSIT INFRASTRUCTURE
```

Sector03는 Mall / Exchange까지. Sector04부터 Rail / Long-span Transit / Infrastructure를 본격 사용한다. 따라서 Sector03에서 Moving Platform이나 대형 Transit Machinery를 대표 기믹으로 소비하지 않는다.

---

## 35. Scenario Art Generation Contract

최신 공통 규격: `docs/bsh/scenario/SCENARIO-ART-GENERATION-STANDARD.md`가 Sector 03의 오래된 개별 Art 지시보다 우선한다.

### Approved Gameplay Reference Before Generation

필수:
1. Runtime Area exists.
2. Camera Zone is stable.
3. Stable IDs exist.
4. Blockout geometry approved.
5. Exact visible object count fixed.

### Output

대표: `ONE GAMEPLAY CAMERA SHOT` 기본.

### Rules

- Player exactly 1
- live Rope exactly 1 line
- Anchor network / triangle 금지
- 전체 레벨맵을 Gameplay shot으로 위장 금지
- exact objects only
- current camera scale 따라야 함
- Smart Mount Visual Language(§28)와 금지 목록(Damage laser / Surveillance eye / Citizen checkpoint / Moving red wall) 준수

### Current Sector 03 Status

```text
RUNTIME AREA
3-1 → 3-8 MOCK INTEGRATED

CAMERA
DEFAULT CAMERA INTENTIONAL · STAGE CUSTOM ZONE NONE

STABLE IDS / STORY
IMPLEMENTED
```

따라서: `APPROVED GAMEPLAY ART = HOLD FOR STAGE BLOCKOUT / EXACT CAMERA SHOT`

---

## 36. Runtime Implementation Order

### COMPLETED P0 — Scanner Runtime + Telegraph

`ACCESS SCAN FIELD + CONTROLLED SURFACE TELEGRAPH` 공용 GameSimulation과 renderer에 통합된 prototype.

검증: deterministic phase / dynamic attach eligibility / current rope stays attached / multiplayer same phase / clear warning/readability

### P1 — Sector 03 Authored Geometry

Scanner OFF / Drone OFF. `3-1 → 3-8` base geometry.

### P2 — Patrol Reuse

3-3 / 3-4 / 3-6 / 3-7 / 3-8.

### P3 — Scanner Integration

3-2 onward.

### P4 — Multiplayer

split routes / safe hub / scanner phase / drone ownership / projectile overlap / Gate

### P5 — Story

Runtime stable ID / triggers.

### P6 — Art / Audio

Gameplay contract PASS 후.

---

## 37. Document Integration Status

### RESOLVED A — 3-8 REV 1.1

`PR #467` 3-8 REV 1.1 FREE-WEAVE. GitHub `main` 반영 완료.

### RESOLVED B — 3-2 Runtime Note

현재 GitHub 3-2: `REV 1.1 RUNTIME NOTE / GATE CONTRACT SYNC` 상태. Static Filter 구현 여부와 Dynamic Scanner 미구현 상태가 구분돼 있다.

### RESOLVED C — 3-1 / 3-2 Exit Contract

현재 GitHub: `3-1 REV 1.1 — GATE CONTRACT SYNC`, `3-2 REV 1.1 — RUNTIME NOTE / GATE CONTRACT SYNC` 모두 현재 일반 Gate 계약(`objective → Gate Panel interaction → Gate open → physical crossing`)으로 동기화됐다.

### RESOLVED D — Sector 03 Master Integration (REV 1.2)

- ACCESS SCAN FIELD design selection
- Growth HOLD
- 3-7 exactly 1 Patrol Drone
- 3-8 Free-Weave canonical status
- Boss / Post-Sector HOLD
- Runtime / Art dependency

를 당시 GitHub 상태에 맞춰 정렬 완료.

### RESOLVED E — Sector 03 Master Rewrite (REV 2.0, 본 문서)

- Sector 공간 정체(CENTRAL EXCHANGE COMPLEX), Stage 명칭, Scanner 세계관 의미(SMART MAINTENANCE SAFETY SYSTEM), 3-1→3-8 이동 논리, Priority 정보 노출 위치를 재작성.
- Geometry, Scanner timing, Enemy count, Gate, Rope physics는 이번 rewrite로 변경하지 않음.
- Runtime `name / subtitle / cue` 변경과 개별 `docs/bsh/scenario/3/3-N/README.md` 갱신은 별도 후속 패치로 남김 (§38 참고).

### REMAINING P0 — Runtime Prototype

문서 문제가 아니라 실제 구현 문제: `ACCESS SCAN FIELD` Runtime Spike.

### COMPLETED P1 — Sector 03 Authored Runtime

Sector 03 Area Catalog / 3-1 → 3-8 integration / Intentional default Camera / Stable IDs / Story entry·position·display bindings.

### COMPLETED P2 — Production Alignment

Stage별 `PRODUCTION-ALIGNMENT.md`가 README vs Runtime coordinates / enemy activation / scanner groups / camera zones / story cue IDs / Gate progression을 Stage별로 검증.

### REMAINING P3 — Approved Blockout / Gameplay Art

Runtime·기본 Camera·Stable ID는 안정됐다. 이제 Stage별 Approved Blockout과 대표 Camera Shot의 exact visible object count를 먼저 확정한다.

현재는: `HOLD FOR BLOCKOUT, NOT FOR RUNTIME`

---

## 38. Individual Stage Docs Migration — PENDING

REV 2.0 Master 채택 이후 남은 후속 변경:

```text
3-1 POWERED PROMENADE      → LOWER MARKET PROMENADE
3-2 SCANNER GALLERY        → FACADE SERVICE GALLERY
3-3 RETAIL SECURITY WALK   → CENTRAL RETAIL WALK
3-4 SERVICE ARCADE         → RETAIL SERVICE SPINE
3-5 COMMERCIAL SERVICE NODE→ BUILDING SERVICES HUB
3-6 PREMIUM ATRIUM         → GRAND CENTRAL ATRIUM
3-7 PRIORITY CONCOURSE     → TRANSFER MEZZANINE
3-8 UPPER MARKET GATE      → UPPER EXCHANGE GATE
```

각 `docs/bsh/scenario/3/3-N/README.md`에서 `ACCESS CONTROL / SECURITY ROUTE / PRIORITY SPACE`를 공간 자체의 의미로 쓰는 문장을 재검토한다.

Runtime `name / subtitle / cue` 변경은 개별 Stage 문서 승인 후 별도 패치로 진행한다.

이번 Master rewrite만으로 Geometry, Scanner timing, Enemy count, Gate, Rope physics는 바꾸지 않는다.

이 마이그레이션이 완료되기 전까지 개별 `3-N/README.md`는 구(REV 1.2) 공간명을 그대로 유지하므로, 본 Master 문서의 신규 명칭과 개별 Stage 문서 사이에 명칭 불일치가 존재할 수 있다. 충돌 시 [§0 Document Priority](#document-priority)에 따라 최신 Master(본 문서)가 우선한다.

### 진행 현황

- `3-7`, `3-8`: 제목(H1)·태그 줄·PREV/NEXT nav 링크만 REV 2.0 명칭(`TRANSFER MEZZANINE`/`UPPER EXCHANGE GATE`)으로 갱신했다. 두 문서의 본문 설계 프로즈는 원문(디자인 패키지) 그대로 보존했으므로 내부에는 여전히 구 명칭 언급이 남아 있을 수 있다. `3-7`은 REV 2.0 설계 자체가 geometry까지 전면 재작성됐고(`AREA-SPEC.json` 포함) 아직 Runtime에 반영되지 않았다. `3-8`은 REV 1.1의 `M0/MX/M1` Free-Weave Lattice 구조 자체를 폐기하고 zig-zag Swing Spine 구조로 다시 썼으며 마찬가지로 아직 Runtime 미반영이다. 두 Stage 모두 `docs/bsh/scenario/3/3-N/PRODUCTION-ALIGNMENT.md`에서 `NOT IMPLEMENTED` 판정을 유지한다.
- `3-1`~`3-6`, Runtime `name/subtitle/cue`: 아직 미착수.

---

## Document Priority

Sector 03 내부에서 충돌 시:

```text
1. Latest explicit user LOCKED decision
2. Latest reviewed individual Stage detail
3. This REV 2.0 Master Plan
4. Older Master / general docs
5. Current code = implementation fact, not intended design
6. Reference research
7. New hypothesis
```

단, Stage 공간명은 예외로 §38 Individual Stage Docs Migration이 완료되기 전까지 본 Master Plan(REV 2.0)의 신규 명칭이 우선한다.

---

## 39. Playtest Questions — Sector Level

### Gameplay

1. Scanner가 Damage Hazard가 아니라 **Attach Timing Rule**로 이해되는가?
2. 3-4의 Public / Service가 실제 비용 차이로 느껴지는가?
3. 3-5가 필요 없는 공백이 아니라 Rhythm Rest로 느껴지는가?
4. 3-6에서 새 Upgrade 없이도 Rope 이동이 충분히 재미있는가?
5. 3-7의 세 Cost Profile이 명확한가?
6. 3-8 REV 1.1이 3-7과 다르게 **계속 경로를 엮는 Stage**로 기억되는가?

### Story

1. Central Exchange Complex가 Worker District보다 더 잘 유지된 것은 이해되는가?
2. 하지만 Central Exchange Complex도 Incident 영향이 있다는 점은 남는가?
3. 3-7에서 Access Tier 구조가 실제 존재했다는 점을 이해하는가?
4. 3-8에서 두 Archive의 병치를 알아차리는가?
5. A/B/C와 Tier가 **아직 확정되지 않았음**을 이해하는가?

### Multiplayer

1. Scanner phase가 두 Player에게 동일하게 보이는가?
2. 한 Player의 Drone encounter가 다른 Route Player를 잘못 공격하는가?
3. Safe Hub가 실제로 2인에게 충분한가?
4. 3-8 좌우 Drone projectile이 중앙 Player에게 우발적 cross-lane hit를 만드는가?

---

## 40. PASS Criteria — Sector 03

### Spatial

- 3-1→3-8이 하나의 건물을 위로 올라가는 순서로 설명됨
- Stage 이름이 기믹명이 아니라 실제 공간명으로 읽힘
- Public / Service / Building Core / Transfer 관계가 보임
- 3-6 Atrium이 공간적 중심
- 3-8에서 Sector04 Transit 방향이 자연스럽게 연결

### Gameplay

- Scanner가 Sector의 한 가지 Primary New System으로 읽힘
- Scanner가 Damage Laser처럼 읽히지 않음
- 새 Input 없음
- 새 Rope Mode 없음
- New Enemy 없음
- 3-1~3-8 모두 Base Rope mandatory clear 가능
- 초보는 Cycle을 기다려 통과 가능
- 숙련자는 WARNING/LOCK timing으로 Flow 유지 가능
- Patrol과 Scanner가 독립된 판단 요소
- Scanner / Drone 강화 대신 공간 조합으로 난이도 상승
- 3-5 Rest 리듬 유효
- 3-7 / 3-8 decision pattern이 구분됨
- 3-8은 Free-Weave로 기억됨

### Growth

- Foundation + first Specialization 유지
- Sector 03 신규 Tier 없음
- Foundation과 Specialization 혼동 없음

### Story

- Sector02의 “사람들은 어디 갔지?”가 자연스럽게 이어짐
- Powered Commercial Contrast 전달
- Commercial의 전력 상태에 복수 가능성을 남김
- Access Tier 구조 공개
- Priority 기록은 3-7 이전에 과도하게 노출하지 않음
- Archive 병치 공개
- Group A/B/C와 계층 직접 매핑 금지
- Group ↔ Tier mapping 미확정
- Group C suspension 직접 원인 미확정
- Sector03는 “차이가 있었다”까지만 확정
- 책임/인과는 Sector04~05에 남김
- Corporate final truth 미공개

### Runtime Discipline

- Scanner dependency 명시
- Sector 03 Runtime 미연결 사실 명시
- Boss / post-sector transition 미추정
- Art generation premature approval 금지

---

## 41. FAIL Conditions — Sector 03

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

## 42. Canonical Sector 03 After REV 2.0

```text
3-1 LOWER MARKET PROMENADE
Commercial Contrast
No Threat

↓

3-2 FACADE SERVICE GALLERY
Teach Smart Maintenance Safety (ACCESS SCAN FIELD)

↓

3-3 CENTRAL RETAIL WALK
Scanner + 1 Patrol

↓

3-4 RETAIL SERVICE SPINE
Public vs Service

↓

3-5 BUILDING SERVICES HUB
REST
Growth HOLD

↓

3-6 GRAND CENTRAL ATRIUM
Large Rope Flow
+ known Security

↓

3-7 TRANSFER MEZZANINE
Static Cost-Profile Choice
+ Access Tier Reveal

↓

3-8 UPPER EXCHANGE GATE REV 1.1
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

Design state machine은 정해졌지만 `AVAILABLE / WARNING / LOCKED / RESET duration` 정확한 수치는 Runtime Prototype / Playtest 전까지 HYPOTHESIS.

### 2. Scanner Visual

필수: `AVAILABLE / WARNING / LOCKED / RESET`가 Mobile에서도 즉시 구분. 하지만 exact beam / housing animation은 Graphics implementation과 함께 확정. (기본 언어는 §28 Smart Mount Visual Language.)

### 3. Foundation / Specialization Runtime

현재 Sector 03의 Build Expression은 Design assumption. 실제 효과가 구현된 뒤 `3-4 / 3-6 / 3-7 / 3-8`을 Build matrix로 다시 검증.

### 4. 3-8 Free-Weave Value

핵심: `Scanner AVAILABLE → Central`, `Scanner LOCKED → Wait or Side Detour`. Side Detour가 항상 나쁘거나 Central이 항상 정답이면 geometry/timing 조정.

### 5. Sector 03 Boss

여전히 OPEN. 3-8은 일반 진행 Finale일 뿐 Boss Stage가 아니다.

### 6. Sector-end Checkpoint

Boss Entry / retry flow가 확정된 뒤 결정.

### 7. Individual Stage Docs Migration 순서

§38의 8개 Stage 문서 명칭 갱신과 Runtime `name/subtitle/cue` 패치를 언제 진행할지, `ACCESS SCAN FIELD Runtime Spike` 및 `Sector 04 Master Plan`과 어떤 순서로 병행할지는 일정 우선순위 결정이 필요하다.

Sector 04를 먼저 기획하거나 개별 Stage 문서를 먼저 마이그레이션하더라도, Sector 03 Scanner가 실제 구현 완료됐다고 가정해서는 안 된다.

---

## 43. Final Story Summary

> **Sector03의 Central Exchange Complex는 Worker District 주민의 일상 상권에서 시작해 도시 상부 Transit으로 연결되는 하나의 거대한 수직 상업·환승시설이다. Vertical Grid Cascade 이후 시설은 손상됐지만 강한 Local Backup과 Building Automation 때문에 하부 주거구역보다 훨씬 많은 시스템이 계속 작동한다. Player는 정비용 Service Mount의 안전 주기를 Rope 이동 리듬으로 이용하며 Lower Market, Facade Service, Central Retail, Back-of-House Service, Building Services, Grand Atrium을 거쳐 Transfer Mezzanine으로 올라간다. 그곳에서 사고 당시 모든 Transfer 요청이 같은 처리상태가 아니었다는 기록을 처음 발견하고, Worker District의 Group C 대기 기록과 상부 Transfer 기록 사이에 차이가 있었음을 인식한다. 그러나 그 차이가 왜 생겼고 누가 결정했는지는 아직 알지 못한 채 Upper Exchange Gate를 통해 다음 Transit Sector로 향한다.**

---

## 44. Final Design Sentence

> **Sector03는 ‘보안 Scanner를 피하는 상업구역’이 아니라, 사고 뒤에도 각자의 안전 절차를 반복하는 거대한 스마트 상업·환승시설의 리듬을 Rope로 타고 올라가며, 하부와 상부의 기능 상태와 대피 처리 결과가 같지 않았음을 처음 체감하는 Sector다.**

---

SECTOR 03 — CENTRAL EXCHANGE COMPLEX MASTER PLAN · REV 2.0 (SPATIAL / STORY REWRITE INTEGRATED)
