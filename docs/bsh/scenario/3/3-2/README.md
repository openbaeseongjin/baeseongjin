# SECTOR 03-2 — SCANNER GALLERY

*BLOCKOUT CANDIDATE · REV 1.1 — RUNTIME ALIGNMENT + GATE CONTRACT SYNC*

◀ PREV — [SECTOR 03-1 / POWERED PROMENADE](../3-1/README.md) · NEXT — [SECTOR 03-3 / RETAIL SECURITY WALK](../3-3/README.md) ▶

`SECTOR 03 COMMERCIAL DISTRICT` · `STAGE 02` · `FIRST ACTIVE SECURITY STATE` · `GRAPPLE AVAILABILITY TIMING`

| 항목 | 기준 |
|---|---|
| Status | HYPOTHESIS — BLOCKOUT CANDIDATE |
| Runtime Alignment | 2026-08-15 KST / main `08db2906db9bc56d8a3f86c7bb030e99e6d27344` |
| Difficulty | ★★☆ |
| Expected First Playtime | 110–170 sec |
| Expected Skilled Clear | 45–70 sec |
| Enemy | NONE |
| New Mechanic | ACCESS SCAN FIELD |
| New Input | NONE |
| New Rope Mode | NONE |
| New Augment | NONE |
| Damage Hazard | NONE |
| Rope Cut | NONE |
| Forced Rope Detach | NONE |
| Required Build | Foundation + Specialization carried, but no Build Lock |
| Primary Role | First Powered Security-State Tutorial |
| Primary Space | Commercial Access Gallery / Smart Service-Mount Corridor |

---

## 0. 기획 기준

### LOCKED FOR THIS STAGE

3-2에서는 Sector 03의 새 핵심 시스템을 다음 형태로 채택한다.

```text
ACCESS SCAN FIELD
```

Scanner는 Player에게 직접 Damage를 주는 Laser가 아니다.

Scanner가 제어하는 일부 Commercial Service-Mount Surface는:

```text
AVAILABLE
→ WARNING
→ LOCKED
→ RESET
```

상태를 반복한다.

핵심 규칙:

```text
AVAILABLE / WARNING
= 새로운 Rope Attach 가능

LOCKED / RESET
= 새로운 Rope Attach 불가
```

이미 Rope가 붙어 있는 Surface가 LOCKED로 바뀌어도:

```text
CURRENT ROPE STAYS ATTACHED
```

강제 Detach하지 않는다.

즉 Scanner의 새 질문은:

> **“언제 붙을 것인가?”**

이며:

> “Beam을 맞지 마라.”

가 아니다.

### 3-2에서 하지 않는 것

- Scanner Damage 없음
- Scanner Knockback 없음
- Rope Disable 없음
- 현재 붙은 Rope 강제 해제 없음
- Patrol Drone 없음
- Sentry 없음
- Security Shutter 없음
- Moving Platform 없음
- Wind 없음
- Trap 없음
- 새 Combat Input 없음
- 새 Rope Input 없음
- Build 전용 Gate 없음

### 핵심 학습 문장

```text
SEE STATE
→ WAIT IF NEEDED
→ ATTACH WHILE AVAILABLE
→ COMMIT
→ STAY ATTACHED THROUGH LOCK
→ RELEASE
→ RE-ATTACH ON NEXT WINDOW
```

---

## 0-1. GitHub / 구현 상태 교차검증 — RUNTIME ALIGNMENT PATCH

### VERIFIED — AUTHORING SNAPSHOT

이 Stage를 처음 작성할 당시 확인한 `main` HEAD:

```text
ead7a356d8884a8d8f607fc9ab90afc5a8fe2212
```

PR #420 merge 시점이다.

이 값은 역사적 작성 기준으로 보존한다.

즉 앞으로 이 SHA를:

```text
CURRENT MAIN
```

이라고 해석하지 않고:

```text
AUTHORING SNAPSHOT
```

으로 해석한다.

### VERIFIED — CURRENT MAIN AT RUNTIME ALIGNMENT

2026-08-15 KST 통합 정리 시점 최신 `main`:

```text
08db2906db9bc56d8a3f86c7bb030e99e6d27344
```

최근 주요 문서 변경:

```text
PR #467
3-8 REV 1.1 FREE-WEAVE merge

PR #468
Sector 02 PRODUCTION-ALIGNMENT docs merge
```

현재 GitHub Scenario Tree에는:

```text
3-1
3-2
3-3
3-4
3-5
3-6
3-7
3-8
```

이 모두 존재한다.

3-8은 현재:

```text
REV 1.1
FREE-WEAVE SECURITY FIELD
```

로 이미 교체된 상태다.

### VERIFIED — CURRENT AUTHORED RUNTIME BOUNDARY

현재 `CurrentAuthoredAreaCatalog.js`는:

```text
SECTOR 01
+
SECTOR 02
```

만 실제 World에 assemble한다.

따라서:

```text
SECTOR 03 AUTHORED RUNTIME
= NOT YET CONNECTED
```

이고 3-2는 여전히:

```text
SPEC — PLANNED
```

다.

### VERIFIED — Scanner 구현 여부

현재 저장소 코드 검색에서:

```text
grappleAccessGroup
dynamic scanner phase attach eligibility
```

Runtime 구현은 확인되지 않는다.

검색 결과는 Scenario 문서 중심이며
Scanner용 Gameplay object / capability / phase controller는 아직 확인되지 않았다.

따라서:

```text
ACCESS SCAN FIELD
= IMPLEMENTATION DEPENDENCY
```

상태를 유지한다.

### VERIFIED — Current Surface Model

현재 `WorldGenerator.createSurface(vertices, properties)`는
Surface property를 실을 수 있는 구조를 유지한다.

그리고 현재 `RopePointerInput.findRopeAttachment()`에는 이미:

```js
if (surface.grappleable === false) continue;
```

가 구현돼 있다.

따라서 기존 문서의 과거 주장:

```text
OLD CLAIM:
STATIC GRAPPLEABLE GATE WAS NOT IMPLEMENTED
```

은 **STALE / SUPERSEDED**다.

현재 정확한 상태:

```text
STATIC SURFACE GRAPPLEABLE FILTER
= IMPLEMENTED

DYNAMIC ACCESS-SCAN ELIGIBILITY
= NOT IMPLEMENTED
```

### IMPLEMENTATION DEPENDENCY — Dynamic Scanner Filter

3-2에 필요한 것은
Static Filter를 새로 만드는 것이 아니다.

필요한 확장:

```text
AUTHORED CONTROLLED-SURFACE GROUP
+
SIMULATION-TICK SCANNER PHASE
+
EFFECTIVE ATTACH ELIGIBILITY
```

예시 개념:

```text
surface.grappleable === false
→ always unavailable

controlled group + scanner LOCKED / RESET
→ temporarily unavailable

controlled group + AVAILABLE / WARNING
→ available
```

### IMPORTANT — Frozen Surface Mutation 금지

Scanner Phase마다:

```text
surface.grappleable = true / false
```

를 직접 바꾸는 방식은 우선하지 않는다.

대신:

```text
STATIC SURFACE DATA
+
DYNAMIC SIMULATION STATE
```

를 분리한다.

권장 개념:

```js
isSurfaceEffectivelyGrappleable(surface, scannerState)
```

또는 동일 역할의 deterministic filter layer.

### VERIFIED — Current Simulation Model

현재 GameSimulation 계열은:

- simulation tick 보유
- InputDispatcher 사용
- Rope input context에 `surfaces` 전달
- simulation-driven capability 구조 사용
- multiplayer authoritative / prediction 경계 보유

따라서 Scanner는
고주파 독립 network transform object보다:

```text
AUTHORED SCANNER CONFIG
+
SIMULATION TICK
+
DETERMINISTIC PHASE
```

로 계산하는 방향을 유지한다.

### MULTIPLAYER CONTRACT

두 Player가 같은 Scanner를 볼 때:

```text
SAME SCANNER PHASE
```

여야 한다.

금지:

```text
PLAYER A = AVAILABLE
PLAYER B = LOCKED
```

처럼 client-local timer에 의해
Attach Eligibility가 갈리는 상태.

### VERIFIED — Current Renderer Gap

현재 Runtime에는 Scanner Gameplay State를 위한:

```text
AVAILABLE
WARNING
LOCKED
RESET
```

전용 Presentation이 아직 확인되지 않는다.

따라서 Runtime Spike에는:

```text
state cue
controlled-surface cue
warning readability
```

도 포함해야 한다.

단 Beam은:

```text
DAMAGE LASER
```

처럼 보이면 안 된다.

### DEPLOYED GAME CHECK LIMIT

GitHub Pages 공개 게임은 구현 기준에 포함하지만
현재 이 작업 환경에서는 직접 인터랙티브 플레이 검증을 수행하지 못했다.

따라서 이 Runtime Alignment는:

```text
latest main code
+
current authored catalog
+
scenario docs
```

를 기준으로 한다.

Scanner Prototype이 실제 Runtime / 배포에 들어간 뒤에는
3-2를 다시 플레이테스트하여:

- phase 가독성
- input forgiveness
- 2-player phase 일치
- attach candidate cue
- already-attached rope 유지

를 재검증한다.

---

## 0-2. Scanner vs Security Shutter 결정

Sector 03 Master Plan에는:

```text
SCANNER
vs
SECURITY SHUTTER
```

가 후보로 남아 있었다.

3-2에서는 **Scanner를 우선 채택**한다.

### Security Shutter를 지금 선택하지 않는 이유

현재 World Surface는 정적이다.

Shutter를 Gameplay Collision으로 만들면:

- 동적 Surface 추가 / 제거
- Player 끼임 처리
- Rope Anchor와 Collision State 정합성
- Multiplayer State Sync
- Client Prediction
- Renderer State
- Recovery Edge Case

를 동시에 해결해야 한다.

또한 Sector 04가:

```text
TRANSIT / INFRASTRUCTURE MOTION
```

을 담당하기 때문에
Sector 03에서 물리적으로 움직이는 Route Wall을 핵심으로 쓰면
다음 Sector의 정체성을 일부 소비한다.

### Scanner를 선택하는 이유

Scanner는 Static Geometry를 유지하면서:

```text
Rope Attach Availability
```

만 바꾼다.

즉:

```text
NEW BUTTON = 0
NEW PLAYER MODE = 0
NEW ENEMY = 0
NEW MOVING COLLIDER = 0
```

이면서
새로운 Rope Timing 판단을 만든다.

---

## 0-3. VERIFIED — Gate / Exit Contract Sync

현재 authored Stage Exit는:

```text
objective
→ Gate Panel interaction
→ Gate open
→ Player physically crosses
```

구조다.

별도 `E` Key를 추가하지 않고 현재 contextual interaction 문법을 유지한다.

3-2 최초 작성 시점에는 이 계약이 확정되기 전이라 Exit가 단순 `EXIT → next stage`로만 표현돼 있었다. Sector 03 Integration Cross-Validation Audit(PATCH 03)에 따라 PR #469에서 Gameplay / Geometry 변경 없이 Exit 표현만 동기화했다.

---

## 1. 한 줄 정의

3-1의 Powered Promenade를 지나 Commercial Access Gallery에 들어온 플레이어가,
`UNAUTHORIZED VERTICAL TRANSIT` 판정을 이어받은 자동 보안 Scanner가 일부 **Service-Mount Surface의 새 Rope 부착을 주기적으로 제한하는 상태 변화**를 관찰하고,
안전한 대기 Deck과 Recovery를 사용해 `AVAILABLE → WARNING → LOCKED → RESET` 사이에서 Attach Timing을 익히는 첫 Active Security Tutorial Stage.

---

## 2. 전체 게임에서의 역할

Gameplay 진화:

```text
SECTOR 01
Threat Telegraph를 보고 계속 이동

↓

SECTOR 02
Moving Enemy의 위치를 보고 Route 선택

↓

SECTOR 03-1
Powered Commercial Space 관찰

↓

SECTOR 03-2
SPACE STATE를 보고 Attach Timing 선택
```

3-2의 역할은:

```text
ACTIVE SECURITY STATE
```

라는 Sector 03 문법을
Enemy 없이 단독으로 가르치는 것이다.

3-3에서 처음:

```text
ACCESS SCAN FIELD
+
PATROL DRONE
```

을 결합한다.

---

## 3. Story 역할

### 1-3에서 이미 있었던 Security Scanner 계보

Sector 01-3에서 Entrance Scanner는:

```text
EMPLOYEE VERIFIED

EMPLOYEE CLASS:
VERTICAL MAINTENANCE

ASSIGNED SECTOR:
LOWER MAINTENANCE
```

를 읽고,
Player의 상행을:

```text
ROUTE VIOLATION
UNAUTHORIZED VERTICAL TRANSIT
```

로 판정했다.

### 3-2의 Scanner

완전히 다른 세계관 장치를 새로 만들지 않는다.

같은 도시 Security Family의
상부 Commercial 버전으로 해석한다.

차이:

```text
1-3
IDENTITY / ROUTE CHECK

3-2
AUTOMATED ACCESS CONTROL
```

### 보여줄 수 있는 문구

입구 Panel:

```text
COMMERCIAL ACCESS CONTROL

EMPLOYEE VERIFIED

ROUTE AUTHORIZATION
INVALID

SERVICE MOUNT ACCESS
CYCLING
```

### 중요한 제한

아직:

```text
PRIORITY CUSTOMER
TIER A
TIER B
GROUP A
GROUP B
EXECUTIVE ACCESS
```

같은 정보는 보여주지 않는다.

Scanner는:

> **“너는 이 Route의 정상 이용자가 아니다.”**

를 강화할 뿐,

> “누가 정상 이용자인가”

는 아직 말하지 않는다.

---

## 4. 공간 콘셉트

**COMMERCIAL ACCESS GALLERY**

3-1의 넓은 Powered Atrium에서
조금 더 좁고 통제된 Gallery로 이동한다.

### 공간 언어

```text
POLISHED PUBLIC WALL
+
SERVICE-MOUNT STRIP
+
ACCESS SCANNER HOUSING
+
SAFE WAIT DECK
+
OPEN VOID BELOW
```

### Surface 구분

#### PERMANENT SURFACE

항상 Rope Attach 가능.

일반 Commercial Structural Beam / Balcony.

#### SECURITY-CONTROLLED SURFACE

Scanner가 제어.

시각적으로:

```text
SERVICE MOUNT STRIP
```

으로 구분.

중요:

C1 / C2 / C3는
큰 Always-Grappleable Wall 위에 얹는 단순 Decoration이 아니라
**별도의 Gameplay Surface Segment**여야 한다.

```text
CONTROLLED SEGMENT
≠
DECORATION OVER PERMANENT PARENT SURFACE
```

같은 위치에 항상 Attach 가능한 Parent Surface가 겹치면
LOCKED 상태를 옆 Surface로 우회할 수 있으므로 금지한다.

Collision 자체는 항상 존재한다.

변하는 것은:

```text
NEW ROPE ATTACH AVAILABILITY
```

뿐이다.

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

### HYPOTHESIS — BLOCKOUT

```text
BASE GRID     32 px

WIDTH         1216 px
              38 tiles

HEIGHT        1184 px
              37 tiles

X             -608 ~ +608
Y                0 ~ -1184
```

### 필수 Grapple 목표 거리

```text
180–360 px
```

Scanner Timing과 Max Range Challenge를 동시에 요구하지 않는다.

### `swingImpulse = 0`

Safe Route는 계속:

```text
PASS REQUIRED
```

---

## 6. 전체 맵 구조

```text
Y -1184

┌──────────────────────────────────────────────────────────────┐
│                                      GATE → 3-3              │
│                                P5 ███████████                │
│                                      ▲                       │
│                                 G5 ●                         │
│                                   ╱                          │
│                        P4 █████████                           │
│                              ▲                               │
│                         G4 ●                                 │
│                           ╲                                  │
│                            ╲                                 │
│                    C3 ● [CONTROLLED]                         │
│                       ▲                                      │
│                       │                                      │
│              R1 ███████████       SCANNER H1                │
│                  ▲                    ◉                      │
│                  │                                           │
│             P3 ███████████                                  │
│                    ▲                                         │
│               C2 ● [CONTROLLED]                             │
│                    ▲                                         │
│                    │                                         │
│             P2 █████████████                                │
│                    ▲                                         │
│               C1 ● [CONTROLLED]                             │
│                  ╱                                           │
│             G1 ●                                             │
│               ╲                                              │
│          P1 ███████████                                      │
│               ▲                                              │
│          P0 ENTRY                                            │
└──────────────────────────────────────────────────────────────┘

Y 0
```

---

## 7. Zone 구성

### ZONE A — OBSERVATION

```text
Y 0 ~ -288
```

Scanner가 보이지만
아직 실패할 필요가 없다.

P1은 넓은 Safe Deck.

Player가 서서:

```text
AVAILABLE
→ WARNING
→ LOCKED
→ RESET
```

한 Cycle 전체를 관찰할 수 있다.

### ZONE B — FIRST COMMIT

```text
Y -288 ~ -512
```

C1이 첫 Required Controlled Surface.

Player는:

```text
AVAILABLE / WARNING
```

중 C1에 Attach.

LOCKED로 바뀌어도
현재 Rope는 유지된다.

이것이 Stage의 가장 중요한 첫 학습.

### ZONE C — RE-ATTACH WINDOW

```text
Y -512 ~ -864
```

C2 / C3를 사용.

Safe Player:

```text
C2
→ P3
→ wait
→ C3
```

Flow Player:

```text
C2
→ Release
→ C3
```

를 같은 Available Window 안에 연결할 수 있다.

### ZONE D — CONFIRMATION

```text
Y -864 ~ -1056
```

Controlled Surface 종료.

Permanent Surface G4 / G5로
기존 Rope Rhythm 복귀.

### ZONE E — 3-3 APPROACH

```text
Y -1056 ~ -1184
```

Enemy 없음.

다음 Stage 방향에
Commercial Security Patrol Sign 정도만 Preview 가능.

Drone 자체를 미리 공격시키지 않는다.

---

## 8. 좌표 / 오브젝트

### HYPOTHESIS — BLOCKOUT CANDIDATE

| ID | X | Y | Width | 역할 |
|---|---:|---:|---:|---|
| P0 | -544~-320 | 0 | 224 | Entry |
| P1 | -480~-128 | -160 | 352 | Observation / Wait Deck |
| G1 | -384~-256 | -256 | 128 | Permanent Pivot |
| C1 | -128~0 | -320 | 128 | Controlled Surface 1 |
| P2 | -96~+224 | -416 | 320 | First Safe Landing |
| C2 | +96~+224 | -544 | 128 | Controlled Surface 2 |
| P3 | -96~+224 | -640 | 320 | Mid Wait Deck |
| R1 | +288~+544 | -672 | 256 | Re-Attach Recovery |
| C3 | +32~+160 | -768 | 128 | Controlled Surface 3 |
| G4 | -192~-64 | -864 | 128 | Permanent Upper Pivot |
| P4 | -256~+64 | -928 | 320 | Confirmation Deck |
| G5 | +64~+192 | -1024 | 128 | Final Permanent Pivot |
| P5 | +224~+512 | -1120 | 288 | Exit Deck |
| Exit / Gate Panel | +320~+576 | -1152 | 256 | Objective → Gate Panel → Gate open → physical crossing → 3-3 |

### Scanner H1

**HYPOTHESIS**

```text
X +480
Y -624
```

Role:

```text
controls C1 / C2 / C3
```

Scanner Beam은
Player Damage Collider가 아니다.

---

## 9. Safe Route

```text
P0
→ P1
→ observe cycle
→ G1
→ C1 during AVAILABLE / WARNING
→ P2
→ wait if needed
→ C2
→ P3
→ wait if needed
→ C3
→ G4
→ P4
→ G5
→ P5
→ Gate Panel
→ Gate open
→ EXIT (3-3)
```

### 특징

- 한 번에 하나의 Scanner 판단
- 넓은 Wait Deck
- Damage 없음
- Enemy 없음
- Locked Surface에 억지 Attach 필요 없음
- `swingImpulse = 0` 통과 가능

### Safe Route 핵심

```text
WAITING IS VALID PLAY
```

그러나 Timing을 읽으면
기다리는 시간을 줄일 수 있다.

---

## 10. Flow Route

숙련자는 하나의 Available Window에서:

```text
P2
→ C2
→ Release
→ C3
→ G4
```

까지 연결 가능.

### 보상

Scanner State를 잘 읽으면:

```text
WAIT TIME ↓
LANDING COUNT ↓
FLOW ↑
```

### 중요

Flow Route는:

```text
RELAY REQUIRED
```

가 아니다.

Base Rope도
충분히 좋은 Timing이면 가능하거나,
P3를 사용하면 반드시 통과 가능해야 한다.

---

## 11. Build Route

### NO BUILD-LOCKED ROUTE

3-2에서 어느 Foundation / Specialization도
Scanner를 무시하는 Key가 되지 않는다.

### IMPULSE

Available Window 동안
더 큰 Arc로 다음 Landing에 빠르게 도달 가능.

Scanner LOCK을 무효화하지 않는다.

### RELAY

C2 → C3 Re-Attach Rhythm에서
자연스러운 효율을 얻을 수 있다.

Scanner LOCK을 무효화하지 않는다.

### SHEAR

Enemy 없음.

별도 SHEAR Target을 추가하지 않는다.

### 금지

```text
IMPULSE = Scanner 면역
RELAY = Locked Surface Attach 가능
SHEAR = Scanner 파괴
```

같은 Build Key.

Sector Mechanic은
모든 Run에 공통으로 읽혀야 한다.

---

## 12. Recovery

### FIRST COMMIT

C1을 놓치면:

```text
P1 / P2 lower catch
```

로 복귀.

전체 Stage Reset 없음.

### RE-ATTACH

C2 → C3를 놓치면:

```text
P3
or
R1
```

으로 착지.

### 목표

Scanner 관련 실패 후:

```text
≤ 4 sec
```

안에 다음 시도 준비.

단 Scanner Cycle 자체를 기다려야 하는 시간은
Recovery Time과 별도로 기록한다.

### 금지

```text
NO DAMAGE
NO DEATH FLOOR
NO START RESET
NO FORCED ROPE DETACH
NO LONG FALL
```

---

## 13. Enemy / Hazard

### Enemy

```text
NONE
```

### Scanner는 Damage Hazard가 아니다

```text
PLAYER CONTACT WITH BEAM
= NO DAMAGE
```

Beam은 Security State Telegraph다.

### 실제 Gameplay Effect

LOCKED 상태에서는:

```text
C1 / C2 / C3
NEW ATTACH CANDIDATE = NONE
```

이미 Attached된 Rope:

```text
UNCHANGED
```

### 왜 이렇게 하는가

Damage Beam으로 만들면
Sector 03의 새 질문이:

```text
또 하나의 Laser Dodge
```

로 축소된다.

부착 가능성만 바꾸면:

```text
Rope Timing
```

자체가 핵심이 된다.

---

## 14. Camera

### VERIFIED

현재 Camera는 Player를 대략:

```text
38% from left
58% from top
```

위치에 두고 추적한다.

### P1 Observation

P1에서 반드시 보일 것:

- Scanner H1
- C1
- State Light / Sweep
- 다음 P2
- Recovery Space

### State Readability

Mobile Zoom `0.72`에서도:

```text
AVAILABLE
WARNING
LOCKED
```

가 색만이 아니라
형태 / 발광 / Surface Cue 차이로 읽혀야 한다.

### Custom Pan

없음.

---

## 15. Story Trigger

### TRIGGER A — ACCESS CONTROL

P1 근처:

```text
COMMERCIAL ACCESS CONTROL

EMPLOYEE VERIFIED

ROUTE AUTHORIZATION
INVALID
```

### TRIGGER B — MOUNT SYSTEM

작은 System Panel:

```text
SERVICE MOUNT ACCESS
CYCLING
```

### TRIGGER C — NEXT SECURITY AREA

Exit:

```text
RETAIL SECURITY
ACTIVE
```

정도까지 가능.

### 아직 공개 금지

```text
GROUP A
GROUP B
PRIORITY CUSTOMER
ACCESS TIER A
EXECUTIVE
UPPER CLASS
```

3-2는 도시 Security가
Player의 Route Violation에 반응한다는 것만 강화한다.

---

## 16. Pixel Art Asset Spec

### Scanner Housing

```text
64×64
96×64
```

### Controlled Service-Mount Strip

```text
32×16
64×16
```

반복 가능.

### State 표현

#### AVAILABLE

- mount physically visible
- small neutral-white body
- restrained cyan grapple cue
- stable light

#### WARNING

- amber pulse
- edge shutter begins closing
- two-step flash preferred

#### LOCKED

- mount visually recessed / covered
- red-orange lock strip
- grapple cue OFF

#### RESET

- dim neutral
- opening mechanical animation
- no attach until AVAILABLE

### Beam / Sweep

- thin translucent amber scan plane
- NOT projectile red
- NOT Rope cyan
- no impact spark on player

### 중요

색만으로 State를 구분하지 않는다.

---

## 17. Background

### Production Decision

3-1 Sector 03 Far / Mid Visual Family를 재사용한다.

새 Full Background 불필요.

### 3-2 Near Layer

- access-control wall
- smart storefront facade
- scanner housing
- service-mount strip
- polished gallery railing
- inactive customer gate
- small security signage

### Density

3-1보다 Near Detail은 조금 증가.

하지만:

```text
Scanner State
+
Controlled Surface
```

가 Commercial Decoration보다 먼저 읽혀야 한다.

---

## 18. Sound / VFX

### AVAILABLE

- low stable hum
- soft mount-ready click

### WARNING

- two short amber beeps
- rising mechanical whir

### LOCKED

- single firm lock click
- low security tone
- no damage impact sound

### RESET

- soft release mechanism
- descending tone

### Beam

지속적으로 큰 Laser Hum을 내지 않는다.

Player가:

```text
“Beam에 닿으면 죽는다.”
```

고 오해하지 않도록
공격적 Laser SFX를 피한다.

---

## 19. Implementation Notes

### 19-1. CURRENT MAIN — Not Implemented

Scanner Gameplay System은 현재 없다.

따라서 3-2는:

```text
SPEC — PLANNED
+
IMPLEMENTATION DEPENDENCY
```

다.

### 19-2. Recommended Minimal Surface Contract

현재 Surface는 arbitrary property를 가질 수 있다.

권장 초기 계약:

```js
{
    ...surface,
    id: "C1",
    grappleAccessGroup: "scanner-A"
}
```

기본 Surface:

```text
grappleAccessGroup = null
→ always attachable
```

C1 / C2 / C3는
각각 독립 Surface Segment여야 한다.

동일 위치에:

```text
always-grappleable parent surface
+
controlled child surface
```

를 겹치지 않는다.

### 19-3. Rope Target Filter

현재 `findRopeAttachment()`는 모든 Surface를 검사하되
`surface.grappleable === false`인 Surface는 candidate에서 제외한다(§0-1 STATIC SURFACE GRAPPLEABLE FILTER 참고).

Dynamic Access Scan Field 기반 filter는 아직 없다.

권장 확장:

```js
findRopeAttachment({
    aimPoint,
    playerPosition,
    surfaces,
    maxAttachDistance,
    canAttachToSurface
})
```

그리고:

```text
if canAttachToSurface(surface) === false
→ skip
```

형태.

기존 Stage는 Filter가 없으면
현재 동작을 그대로 유지해야 한다.

### 19-3A. Locked-Aim Feedback

현재 `findRopeAttachment()` 반환값은:

```text
point or null
```

뿐이라,
LOCKED Surface를 정확히 겨냥했을 때도
단순 Aim Miss와 같은 `null`로 보일 수 있다.

3-2 P0에서는 최소한 Surface 자체의
AVAILABLE / WARNING / LOCKED 형태 변화가 충분히 명확해야 한다.

필요하면 후속 개선으로:

```text
candidate point
+
candidate surface id
+
rejection reason
```

을 분리할 수 있지만,
3-2 첫 구현의 필수 API 확대 조건으로는 두지 않는다.

### 19-4. Existing Rope Persistence

Scanner가 LOCKED가 되어도
이미 Attached된 Rope는 건드리지 않는다.

구현상 Scanner State는:

```text
attachment candidate selection
```

에만 영향.

`RopeAttachment.detach()`를 호출하지 않는다.

### 19-5. Deterministic Scanner Phase

권장:

```text
phase = f(simulationTick, scannerConfig.phaseOffset)
```

Client wall-clock:

```text
performance.now()
Date.now()
```

사용 금지.

목표:

- single-player deterministic
- replay deterministic
- multiplayer prediction 가능
- 별도 20Hz mutable scanner snapshot 최소화

### 19-6. Initial Timing — HYPOTHESIS

초기 Prototype 후보:

```text
AVAILABLE   1.50 sec
WARNING     0.60 sec
LOCKED      1.10 sec
RESET       0.30 sec

TOTAL       3.50 sec
```

### WARNING Rule

WARNING 동안은:

```text
ATTACH STILL ALLOWED
```

로 한다.

이유:

- Telegraph를 본 Player에게 마지막 Commit Window 제공
- 네트워크 Tick 경계의 체감 오류 완화
- 첫 Timing Mechanic의 과도한 정밀도 방지

### 19-7. Multiplayer Transition Tolerance

가장 위험한 Edge Case:

```text
Client:
still WARNING

Server:
just entered LOCKED
```

이 경우 Attach 결과가 튀면
Scanner가 Input Failure처럼 느껴질 수 있다.

권장 구현 검토:

- state transition을 authoritative tick으로 계산
- owner prediction도 동일 tick domain 사용
- WARNING을 충분히 길게 유지
- 필요하면 1~2 tick acceptance tolerance 추가
- Scanner Transition 직전 Attach를 Server가 일방적으로 강제 Detach하지 않음

정확한 Network Contract는 개발자 검증 후 확정.

### 19-8. Simulation Object Option

현재 `SimulationDrivenObject` +
`SimulationDispatcher` 구조가 있으므로
Scanner를 Simulation Object로 모델링하는 것도 가능하다.

단 3-2 P0에서는
Scanner 자체가 별도 mutable entity가 필요하지 않다면
단순 deterministic phase function이 더 작은 구현이다.

### 19-9. Renderer

P0 Prototype은 Sprite 없이 Canvas Primitive로 가능.

필수 표시:

```text
scanner beam
mount state
warning
locked cover
```

Gameplay 검증 후 Pixel Art 연결.

### 19-10. Authored World Dependency

현재 Live Prototype은 procedural 48-level world 중심이다.

3-2의:

```text
C1
C2
C3
scanner-A
```

같은 명시적 authored object는
Authored Region data가 Runtime에 연결되어야 실제 게임에 들어간다.

이는 Scanner만의 문제가 아니라
현재 1-1~3-2 authored scenario 전체의 공통 구현 dependency다.

---

## 20. Playtest Metrics

### 기본

```text
first clear time
skilled clear time

scanner cycles observed
locked attach attempts
warning attach attempts
available attach attempts

scanner-related falls
recovery time
cycle wait time
adjacent-surface bypass attempts

C1 attempts
C2 attempts
C3 attempts

forced detach count
wrong attach
```

### 핵심 Metric 1 — Rule Comprehension

첫 플레이 후 질문:

> “Scanner가 무엇을 막았나요?”

기대:

> 새 Rope 부착 / 특정 Mount에 새로 붙는 것.

실패:

> Beam에 닿으면 Damage.
> Rope가 자동으로 끊긴다.
> 바닥이 사라진다.

### 핵심 Metric 2 — Existing Rope Persistence

질문:

> “붙은 다음 LOCKED가 되면 어떻게 됐나요?”

기대:

> 붙은 Rope는 유지됐다.

### 핵심 Metric 3 — State Readability

Player가 Tutorial 설명 없이:

```text
AVAILABLE
WARNING
LOCKED
```

차이를 구분하는지 확인.

### Target

첫 C1 실패 이후:

```text
다음 시도에서 같은 실수 반복 ≤ 1회
```

목표.

### Forced Detach

```text
0
```

고정.

### Damage

```text
0
```

고정.

### Surface Bypass

LOCKED C1 / C2 / C3 대신
같은 위치의 인접 Always-Grappleable Surface에 붙어
Mechanic을 사실상 무시하는 사례:

```text
0
```

목표.

### Multiplayer

기록:

```text
scanner phase disagreement
predicted attach correction
player A/B state mismatch
same-window dual attach
```

---

## 21. PASS Criteria

### Gameplay

- ★★☆ 체감
- Enemy 없음
- Scanner만 새 Gameplay Rule
- 새 버튼 없음
- 새 Rope Mode 없음
- Damage 없음
- Forced Detach 없음
- LOCKED = new attach only 차단
- Safe Wait Deck 존재
- `swingImpulse = 0` Safe Route 통과
- 실패 후 4초 내 재시도 준비
- Scanner를 Laser Dodge가 아니라 Rope Timing으로 이해

### Implementation

- 기존 Surface가 기본적으로 영향을 받지 않음
- 기존 Stage Rope Targeting regression 없음
- Scanner phase가 simulation tick 기반
- Replay / Multiplayer에서 phase 재현 가능
- locked transition에서 기존 Rope 유지
- Dynamic Collision Shutter 불필요

### Story

- 1-3 Security Scanner와 같은 시스템 계보로 읽힘
- Route Violation 지속
- Group A/B 정보 없음
- Priority 대상 정보 없음
- 계급 정체 직접 공개 없음

### Visual

- Scanner Beam과 Enemy Projectile 색 언어가 다름
- LOCKED Surface가 명확히 닫힌 것으로 보임
- Rope Cyan이 여전히 가장 잘 읽힘
- 광고가 Scanner Warning을 묻지 않음

---

## 22. FAIL Conditions

### FAIL — Mechanic

- Scanner가 단순 Damage Laser가 됨
- Player 접촉 시 HP 감소
- 현재 Rope를 강제로 끊음
- LOCKED 상태에서도 Visual 차이가 약함
- Player가 왜 Attach 실패했는지 이해 못함
- Scanner Window가 프레임 단위 Timing 요구
- 특정 Build가 Scanner를 완전히 무효화

### FAIL — Implementation

- Dynamic Collision Shutter를 3-2 필수로 추가
- Client wall-clock 기반 Scanner
- Single / Multi에서 Scanner Phase 불일치
- 기존 모든 Surface Grapple 로직을 깨뜨림
- Scanner 때문에 기존 Stage에 Surface Tag를 전부 강제 추가
- Controlled Surface와 Always-Grappleable Parent Surface가 겹쳐 LOCK을 우회 가능

### FAIL — Story

- Priority Tier 정체 공개
- Group A/B 정체 공개
- Scanner가 “WORKER DENIED” 같은 계급 확정 문구 사용
- Corporate 책임자 공개

### FAIL — Visual

- Beam이 빨간 Instant-Kill Laser처럼 보임
- Controlled Surface가 일반 Decoration과 구분 안 됨
- AVAILABLE / LOCKED를 색만으로 구분
- Cyan 광고가 Grapple Cue를 묻음

---

## 23. 개발 구현 우선순위

### P0 — MECHANIC SPIKE

Authored full Stage 전에 작은 Test Room.

구현:

```text
1 permanent surface
1 controlled surface
1 scanner
```

검증:

```text
AVAILABLE attach
WARNING attach
LOCKED no new attach
existing rope persists
```

### P1 — DETERMINISTIC PHASE

Simulation Tick 기반 State Cycle.

Replay / single-player 테스트.

### P2 — ROPE FILTER

`findRopeAttachment()`에
optional Surface Predicate / capability 추가.

기존 Rope unit test regression 확인.

### P3 — VISUAL PROTOTYPE

Canvas Primitive로:

```text
AVAILABLE
WARNING
LOCKED
RESET
```

표현.

### P4 — MULTIPLAYER TEST

같은 Scanner Cycle에서
두 Player의 Candidate / Attach 결과 비교.

### P5 — 3-2 GRAYBOX

P0~P5 / C1~C3 Geometry 배치.

### P6 — RANGE / RECOVERY TEST

```text
780
Reduced
0
```

검증.

### P7 — ART / AUDIO

Gameplay PASS 이후
Commercial Scanner Pixel Art 연결.

### P8 — 3-3 INTEGRATION GATE

3-2 Scanner가 실제로 재미있고 읽힌 뒤에만:

```text
Scanner + Patrol Drone
```

을 3-3에 결합.

---

## 24. Stage Data Concept

**HYPOTHESIS — Runtime Schema 아님**

```js
{
    id: "sector-03-2-scanner-gallery",

    sector: 3,
    region: 2,

    role: "first-active-security-state",

    gameplay: {
        enemies: [],
        damageHazards: [],
        newMechanic: "access-scan-field",
        ropeCut: false,
        forcedDetach: false
    },

    scanners: [
        {
            id: "scanner-A",
            controlledSurfaceIds: ["C1", "C2", "C3"],
            phaseOffsetTicks: 0,

            timing: {
                availableSeconds: 1.50,
                warningSeconds: 0.60,
                lockedSeconds: 1.10,
                resetSeconds: 0.30
            },

            rules: {
                attachAllowedInAvailable: true,
                attachAllowedInWarning: true,
                attachAllowedInLocked: false,
                attachAllowedInReset: false,
                detachExistingRopeOnLock: false,
                damagePlayer: false
            }
        }
    ],

    completion: {
        type: "gate-panel-objective",
        gatePanel: "contextual-interaction",
        physicalCrossing: true
    },

    exit: {
        nextRegion: "sector-03-3-retail-security-walk"
    }
}
```

---

## 25. 아트 담당자 전달문

### SCANNER GALLERY

핵심 이미지:

> **밝고 세련된 Commercial Gallery에서
> 보안 Scanner가 벽의 Service-Mount Strip을 주기적으로 잠그고,
> Player는 빛의 상태를 읽으며 Rope Attach 타이밍을 잡는다.**

### 반드시 구분할 네 상태

```text
AVAILABLE
WARNING
LOCKED
RESET
```

### 중요한 표현

`LOCKED`는 단순히 빨갛게 빛나는 것이 아니라
Mount 자체가:

```text
recessed
covered
closed
```

된 형태로 보여야 한다.

### Beam

Scanner Beam은:

```text
thin
translucent
amber
informational
```

방향.

Laser Weapon처럼 만들지 않는다.

### 플레이 우선순위

```text
PLAYER
>
ROPE
>
CONTROLLED MOUNT STATE
>
SCANNER WARNING
>
COMMERCIAL DECORATION
```

---

## 26. 개발자 최종 전달 요약

### SECTOR 03-2 — SCANNER GALLERY

Sector 03의 새 시스템을:

```text
ACCESS SCAN FIELD
```

로 우선 채택.

핵심 Rule:

```text
AVAILABLE / WARNING
→ new attach allowed

LOCKED / RESET
→ new attach blocked

already attached rope
→ NEVER FORCE DETACH
```

### 왜 Scanner인가

현재 코드 기준으로
Security Shutter보다 구현 범위가 작고,
Rope 자체의 Timing 판단을 만든다.

### 현재 필요한 개발

```text
1. Controlled Surface tag / group
2. Rope attachment surface filter
3. deterministic scanner phase
4. scanner / mount state renderer
5. multiplayer phase verification
6. authored stage data integration
```

### 절대 하지 않음

```text
damage laser
rope cut
new button
dynamic collision shutter
new enemy
```

### 다음 Stage Gate

3-2 Prototype Playtest가 PASS한 뒤에만
3-3에서:

```text
Scanner
+
Patrol Drone
```

을 결합한다.

---

## OPEN QUESTIONS

### 1. Surface Contract 이름

후보:

```text
grappleAccessGroup
securityControlled
grappleable
```

권장:

```text
grappleAccessGroup
```

이유:

정적 `grappleable: false`와
동적 Security Group을 구분하기 쉽다.

최종 API 이름은 개발자가 Architecture 규칙에 맞춰 결정.

### 2. Scanner Phase Network Contract

Deterministic Tick 방식을 우선하지만
Owner Prediction과 Server Transition Edge를 실제로 테스트해야 한다.

필요하면:

- Warning 연장
- transition tolerance
- claim tick validation

중 최소 변경으로 해결.

### 3. Controlled Surface Visual

현재 Rope는 모든 일반 Surface에 Attach 가능하다.

따라서 Controlled Surface만
“새로운 Anchor Object”처럼 과도하게 보이면
Player가 일반 Surface에는 못 붙는다고 오해할 수 있다.

Geometry는:

```text
dedicated controlled surface segment
```

로 분리하되,
아트는 그 Segment를:

```text
normal structural language
+
access-controlled mount skin
```

처럼 보이게 한다.

즉 시각적으로는 기존 Architecture의 일부지만,
Gameplay 데이터에서는 독립 Surface다.

### 4. Scanner Beam 필요성

Mount State 자체만으로 충분히 읽힌다면
큰 Sweep Beam은 줄일 수 있다.

Beam이 Damage Laser로 오해되면
과감히 약화하거나 삭제.

### 5. Master Plan Update

3-2 Prototype이 PASS하면
Sector 03 Master Plan의:

```text
Scanner / Security Shutter 후보
```

를:

```text
ACCESS SCAN FIELD — LOCKED
```

로 업데이트해야 한다.

Prototype이 FAIL하면
Master Plan은 후보 상태로 되돌리고
Security Shutter 또는 다른 Route-Control System을 재검토한다.

**RESOLVED (spec 단계):** Sector 03 Master Plan REV 1.1(PR #469)에서 Primary New Security Mechanic을 `ACCESS SCAN FIELD — DESIGN SELECTED / RUNTIME PROTOTYPE GATE`로 이미 확정했다. 단 이는 spec-level 결정이며, 실제 Runtime Prototype Playtest PASS는 여전히 별도 Gate다.

---

SECTOR 03-2 / SCANNER GALLERY — REV 1.1
