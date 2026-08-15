# ACCESS SCAN FIELD — RUNTIME PROTOTYPE SPEC

*IMPLEMENTATION HANDOFF · REV 1.0 · SECTOR 03 CORE DEPENDENCY*

`OPENAI GAME BUILDERS HACKATHON` · `SECTOR 03` · `ROPE ATTACH ELIGIBILITY` · `DETERMINISTIC MULTIPLAYER`

| 항목 | 기준 |
|---|---|
| Status | IMPLEMENTATION SPEC — READY FOR PROTOTYPE |
| Current Main | `9e05c14db009837ccab34aa920a9e6a557a600cf` |
| Primary Consumer | SECTOR 03-2 ~ 03-8 |
| Core Question | “Scanner 상태가 바뀔 때 새 Rope Attach가 정확히 같은 규칙으로 허용/차단되는가?” |
| New Player Input | NONE |
| New Rope Mode | NONE |
| Damage | NONE |
| Knockback | NONE |
| Rope Disable | NONE |
| Forced Detach | NONE |
| Static Grapple Filter | VERIFIED — IMPLEMENTED |
| Dynamic Scanner Eligibility | NOT IMPLEMENTED — THIS PROTOTYPE |
| Multiplayer Model | time-derived state from shared `worldElapsedSeconds`, gated by prediction-clock parity test |
| Runtime Sector 03 | NOT YET CONNECTED |
| Art | MOCK / DEBUG ONLY until Sector 03 Runtime + Camera Zone stable |
| Production Timing | HYPOTHESIS — 3-2 baseline initially |
| Success Definition | authority + owner prediction match across normal, boundary, reconcile, and delayed-owner-motion cases |

> 이 문서는 설계 전체를 다룬다. 실행 담당(Codex 등)에게 바로 전달할 압축된 지시서는 [`ACCESS-SCAN-FIELD-CODEX-IMPLEMENTATION-HANDOFF.md`](./ACCESS-SCAN-FIELD-CODEX-IMPLEMENTATION-HANDOFF.md)를 사용한다. Sector 03 Master Plan의 구현 상태 판정은 [`README.md`](./README.md) §7을 참고한다.

---

## 0. 목적

Sector 03의 핵심 Gameplay System:

```text
ACCESS SCAN FIELD
```

를 실제 Runtime에 구현하기 위한 최소 Prototype 사양이다.

이 Prototype은:

```text
Scanner Beam 피하기
Scanner Damage
Scanner 해킹
Scanner Disable
```

시스템이 아니다.

오직:

```text
일부 authored Grapple Surface에
새 Rope Attach를 할 수 있는지
```

를 시간 상태에 따라 바꾼다.

Canonical Gameplay Rule:

```text
AVAILABLE / WARNING
→ NEW ATTACH ALLOWED

LOCKED / RESET
→ NEW ATTACH DENIED

ALREADY ATTACHED ROPE
→ STAYS ATTACHED
```

---

## 1. 왜 지금 구현해야 하는가

Sector 03 상세 설계:

```text
3-1
Scanner 없음

3-2
Scanner Tutorial

3-3
Scanner + Patrol

3-4
Public Route Scanner

3-5
Scanner 없음

3-6
Scanner + Large Flow

3-7
Scanner + Route Cost

3-8
Scanner Spine + Free-Weave
```

따라서 3-2 이후 대부분의 Stage가
이 Runtime System에 의존한다.

현재:

```text
Scenario Docs
= READY

Static Surface Filter
= READY

Patrol Drone
= READY

Dynamic Scanner
= MISSING
```

Sector 03 Runtime Integration 전에
이 dependency를 먼저 해결해야 한다.

---

## 2. 최신 코드 상태 — VERIFIED

### CURRENT MAIN AT FINAL REVIEW

최종 검토 시점 최신 `main`:

```text
9e05c14db009837ccab34aa920a9e6a557a600cf
```

PR #474 merge.

해당 최신 변경은:

```text
Sector 01~03 scenario / camera / runtime-state documentation review
```

중심이며
Rope / Simulation / AreaDefinition / WorldAssembler의 Scanner 관련 Runtime 구조는
이 Prototype 조사 중 확인한 코드에서 변경되지 않았다.

### 2-1. Rope Targeting

현재:

```js
if (surface.grappleable === false) continue;
```

가 `findRopeAttachment()` 안에 구현돼 있다.

즉:

```text
STATIC GRAPPLEABLE FILTER
= IMPLEMENTED
```

### 2-2. Rope Input Context

현재 `GameSimulation`은
Rope Input Capability에:

```text
surfaces: activeCollisionSurfaces
```

를 전달한다.

이 이름 때문에 Collision Surface만 들어간다고 오해하면 안 된다.

현재 `collisionSurfacesForProgress()`는:

```text
world.surfaces
+
locked Gate barrier surfaces
```

를 반환한다.

따라서:

```text
collision: false
```

인 authored `grapple-target`도
`world.surfaces`에 존재하는 한 Rope candidate collection에서 유지된다.

`InputDispatcher`는
context object를 그대로 capability에 전달할 수 있다.

따라서:

```text
canAttachToSurface
```

같은 추가 predicate를 context에 넣는 구조가 현재 architecture와 잘 맞는다.

### 2-3. Owner Prediction

현재 Owner Prediction:

```text
fixedDt = 1 / 120
```

기본.

Snapshot reconcile 시:

```text
worldProgress
+
worldElapsedSeconds
```

를 prediction simulation에 복원한다.

그 뒤 fixed-step으로 다시 advance한다.

### 2-4. Authority Snapshot

현재 Authority Snapshot은:

```text
worldElapsedSeconds
```

를 이미 state에 포함한다.

따라서 Scanner Phase를
별도 network event로 매번 복제하지 않아도 된다.

### 2-5. IMPORTANT — Prediction Clock Edge Case

통합 검토 중 현재 Owner Prediction의 시간 복원 경로에
Scanner 구현 전에 반드시 테스트해야 할 경계조건을 발견했다.

현재 reconcile 흐름은 개념상:

```text
Snapshot
serverTick = S
worldElapsedSeconds = T

↓

prepareSnapshot()
elapsedSeconds = T

↓

restoreOwnerPrediction()
simulation.tick = ownerMotionTick O

↓

O+1 ... targetTick replay
elapsedSeconds += fixedDt each replay tick
```

이다.

대부분:

```text
O == S
```

이면 문제가 없다.

하지만 delayed owner-motion 상황에서:

```text
O < S
```

이면 snapshot의 `T`가 이미 serverTick `S` 시점 시간인데
과거 `O`부터 replay하면서 elapsed time을 다시 더할 가능성이 있다.

이는 Scanner만의 문제가 아니라
현재 `elapsedSeconds`를 사용하는 Wind Prediction에도 관련될 수 있는
기존 Clock-Invariant 문제다.

### Required Clock Invariant

Owner Prediction 안에서는 항상:

```text
simulation elapsed time
```

이 현재 simulation tick이 나타내는 시간과 일관돼야 한다.

Snapshot 기준 권장 invariant:

```text
elapsedAtTick(X)
=
snapshot.worldElapsedSeconds
+
(X - snapshot.serverTick) * fixedDt
```

또는 수학적으로 동등한 방식.

### Prototype Gate

Scanner Core를 merge하기 전에
반드시 다음 regression test를 먼저 추가한다.

```text
ownerMotionTick < serverTick
+
snapshot worldElapsedSeconds
+
replay
```

이후 authority와 predictor가
동일한 time-derived phase를 만드는지 확인.

현재 코드가 실패하면:

```text
OwnerPredictionRuntime clock rebase
```

를 먼저 수정한다.

### Important

이 문제를 피하려고 Scanner만:

```text
Date.now()
performance.now()
client-local timer
```

를 사용하는 것은 금지.

또 Scanner만 별도 Network Phase Event로 우회하지 않는다.

### 2-6. Existing Precedent — Wind

Current `WorldForceField.js`는:

```text
elapsedSeconds
→ deterministic phase
```

계산을 이미 사용한다.

Scanner도 동일한 설계 철학을 따른다.

---

## 3. Architecture Decision

### 선택

```text
AUTHORED STATIC CONFIG
+
WORLD ELAPSED TIME
+
PURE PHASE EVALUATION
+
DYNAMIC ATTACH PREDICATE
```

### 선택하지 않음

```text
mutable Surface state
networked Scanner transform object
phase-change replication events
per-client timer
forced Rope detach
```

### 이유

Scanner State는
위치가 계속 움직이는 물리 오브젝트가 아니다.

따라서:

```text
authoring config
+
time
```

만 있으면 현재 상태를
항상 다시 계산할 수 있다.

---

## 4. Canonical Phase Model

Prototype baseline:

```text
AVAILABLE  1.50 sec
WARNING    0.60 sec
LOCKED     1.10 sec
RESET      0.30 sec

TOTAL      3.50 sec
```

### STATUS

```text
HYPOTHESIS — PROTOTYPE BASELINE
```

Production LOCK 아님.

### Boundary Semantics

```text
[0.00, 1.50)
AVAILABLE

[1.50, 2.10)
WARNING

[2.10, 3.20)
LOCKED

[3.20, 3.50)
RESET

3.50
→ next AVAILABLE
```

정확한 boundary tick에서는
**새 Phase가 즉시 적용**된다.

### Attach Permission

```text
AVAILABLE
true

WARNING
true

LOCKED
false

RESET
false
```

---

## 5. Phase Clock

### Recommended

Scanner State:

```text
worldElapsedSeconds
+
phaseOffsetSeconds
```

로 계산.

Pseudo:

```js
cycleTime =
    positiveModulo(
        worldElapsedSeconds + phaseOffsetSeconds,
        totalDuration
    );
```

### 왜 `worldElapsedSeconds`인가

Current Runtime은 이미:

- authority에서 증가
- snapshot으로 복제
- owner prediction reconcile 시 복원
- prediction fixed-step에서 증가

한다.

또 Wind가 같은 clock family를 이미 사용한다.

따라서 별도 Scanner Clock replication이 필요 없다.

단 위 §2-5의:

```text
prediction clock parity
```

가 먼저 PASS해야 한다.

Clock parity가 실패한 상태에서
Scanner를 얹어 기존 시간 오차를 Gameplay Rule로 승격시키면 안 된다.

### 왜 Area Entry Timer가 아닌가

Area마다:

```text
enteredAtSeconds
```

state를 새로 저장하면:

- Gate entry replication
- lagging multiplayer player
- per-player vs shared phase
- prediction restore

복잡도가 증가한다.

3-2에는 Safe Observation Deck이 있으므로
입장 순간 어떤 Phase였는지와 관계없이
최대 한 Cycle 이내에 Rule을 읽을 수 있다.

### phaseOffsetSeconds

각 Scanner Group은:

```text
phaseOffsetSeconds
```

를 가질 수 있다.

Prototype 의미:

```text
positive offset
→ cycle을 그만큼 앞당겨 평가

negative offset
→ cycle을 그만큼 늦춰 평가
```

목적:

- 여러 Group의 시각적 동기화
- 특정 Stage composition 조정

하지만 Sector 03 General Stage는 기본적으로
**한 Stage 내부 Scanner Group의 Phase를 공유**한다.

---

## 6. Authoring Data Model

### AreaDefinition 확장

현재 `defineArea()` 기본값에 추가:

```js
scannerGroups: []
```

### Prototype Group

```js
{
    id: "sector-03-02:scanner-A",

    cycle: {
        available: 1.50,
        warning: 0.60,
        locked: 1.10,
        reset: 0.30
    },

    phaseOffsetSeconds: 0,

    controlledSurfaceIds: [
        "sector-03-02:c1",
        "sector-03-02:c2",
        "sector-03-02:c3"
    ]
}
```

### Surface Source of Truth

권장:

```text
scannerGroups[].controlledSurfaceIds
```

를 Source of Truth로 한다.

즉 Surface Definition에:

```text
grappleAccessGroup
```

를 사람이 중복 작성하지 않는다.

Assembler가:

```text
controlledSurfaceIds
→ surface.grappleAccessGroup
```

를 Runtime Surface에 stamp한다.

### 이유

다음 불일치 방지:

```text
Group says C1 controlled
but
Surface says another group
```

### Stable ID Convention

현재 authored world의 Surface / Object / Gate ID는:

```text
sector-XX-YY:local-id
```

형식을 일관되게 사용한다.

Scanner Group도 동일하게:

```text
sector-03-02:scanner-A
sector-03-03:scanner-A
...
```

처럼 Area prefix를 포함한다.

README의 개념 ID:

```text
C1 / C2 / scanner-gallery-A
```

를 Runtime global ID로 그대로 쓰지 않는다.

---

## 7. Authoring Validation

Assembler 단계에서
다음을 fail-fast 검증한다.

### Group ID

- non-empty string
- World 전체에서 unique
- Area prefix 포함

### Cycle

모든 duration:

```text
finite
>
0
```

### phaseOffsetSeconds

```text
finite
```

이어야 한다.

음수 허용.

### Surface IDs

모든:

```text
controlledSurfaceIds
```

는 같은 Area의:

```text
definition.surfaces
```

에 실제 존재해야 한다.

### Duplicate Membership

한 Surface가:

```text
2개 이상의 Scanner Group
```

에 동시에 포함되면 Error.

### Controlled Surface Requirement

Scanner-controlled surface는:

```text
grappleable !== false
```

여야 한다.

Static false Surface를
Scanner가 다시 enable하는 기능은 Prototype 범위 밖.

### Dedicated Segment Contract

Runtime validator가 Geometry overlap까지
완벽히 판정할 필요는 없지만,
Stage Authoring 규칙:

```text
CONTROLLED SEGMENT
≠
ALWAYS-GRAPPLEABLE PARENT OVERLAY
```

는 유지.

---

## 8. Runtime World Shape

### AuthoredWorldAssembler 추가 Output

World:

```js
scannerGroups: [...]
```

### Area Metadata

Area:

```js
scannerGroupIds: [...]
```

### World Revision

Scanner Group / controlled-surface mapping은
Gameplay prediction 결과에 영향을 준다.

따라서 Production Catalog에 Scanner data를 추가할 때:

```text
catalog revision
```

도 반드시 갱신한다.

Owner Prediction은 현재 `worldRevision` 불일치를 검사하므로
구형 World Definition과 신형 Scanner Definition의 혼용을 막는 데 이 계약을 사용한다.

### Runtime Surface

Controlled Surface에는:

```js
grappleAccessGroup: "sector-03-02:scanner-A"
```

stamp.

Uncontrolled Surface:

```js
grappleAccessGroup
```

없음.

### Suggested Runtime Group Shape

```js
{
    id,
    areaId,

    cycle: {
        available,
        warning,
        locked,
        reset
    },

    phaseOffsetSeconds,

    controlledSurfaceIds
}
```

Immutable 유지.

---

## 9. New Pure Logic Module

권장 신규 파일:

```text
src/game/world/AccessScanField.js
```

### Required Exports

#### `evaluateAccessScanGroup(group, elapsedSeconds)`

Return:

```js
{
    id,
    phase,
    phaseTime,
    phaseProgress,
    secondsRemaining,
    attachAllowed
}
```

### `snapshotAccessScanStates(groups, elapsedSeconds)`

Return:

```js
[
    {
        id,
        phase,
        phaseTime,
        phaseProgress,
        secondsRemaining,
        attachAllowed
    }
]
```

### `accessScanStateMap(groups, elapsedSeconds)`

Return:

```text
Map<groupId, state>
```

또는 같은 O(1) lookup 구조.

### `isSurfaceAccessAllowed(surface, stateByGroupId)`

Semantics:

```text
NO grappleAccessGroup
→ true

group AVAILABLE / WARNING
→ true

group LOCKED / RESET
→ false
```

Unknown Group은
Assembler validation이 막아야 한다.

Defense-in-depth로 Runtime에서는:

```text
false
```

또는 explicit error 중 하나를 선택.

Prototype에서는
**development error를 즉시 발견하기 위해 throw 권장**.

---

## 10. Rope Targeting Integration

### Current

`findRopeAttachment()`:

```text
surface.grappleable === false
→ skip
```

### Required Signature Extension

개념:

```js
findRopeAttachment({
    aimPoint,
    playerPosition,
    surfaces,
    maxAttachDistance,
    canAttachToSurface
})
```

### Evaluation Order

```text
1.
surface.grappleable === false
→ skip

2.
canAttachToSurface?.(surface) === false
→ skip

3.
closest point

4.
distance / aim score

5.
candidate selection
```

### 중요한 이유

Static Rule은
`findRopeAttachment()` 내부에 계속 남긴다.

Dynamic predicate는 추가 Gate.

따라서 Scanner가 없는 기존 World는:

```text
behavior unchanged
```

이어야 한다.

---

## 11. Input Capability Integration

`withRopePointerInput.apply()` context에:

```text
canAttachToSurface
```

추가.

현재:

```text
surfaces
```

와 함께 전달.

Concept:

```js
this.attachmentCandidate =
    canControl
        ? findRopeAttachment({
              ...,
              surfaces,
              canAttachToSurface
          })
        : null;
```

### New Input 없음

Scanner 때문에:

```text
Interact
Hack
Disable
Mode Switch
```

추가 금지.

---

## 12. GameSimulation Integration

### Shared State Evaluation

Simulation step에서
현재 `elapsedSeconds` 기준 Scanner State를 계산한다.

권장:

```text
one scanner-state map
per simulation time
```

를 만든 뒤
모든 Player Input에 같은 map 사용.

### Input Context

```js
canAttachToSurface(surface) {
    return isSurfaceAccessAllowed(
        surface,
        scannerStateByGroupId
    );
}
```

### Important — 모든 Player 동일

같은 simulation step에서:

```text
Player A
Player B
```

둘 다 같은 Scanner State Map을 사용.

### Tick / Time Ordering

현재 authority와 owner prediction 모두
Gameplay input dispatch 전에:

```text
elapsedSeconds += dt
```

를 수행하는 경로를 사용한다.

Scanner도 해당 시점의:

```text
this.elapsedSeconds
```

를 기준으로 평가한다.

별도:

```text
pre-input scanner clock
post-input scanner clock
```

를 만들지 않는다.

이 순서를 authority / prediction에서 동일하게 유지한다.

### Existing Attached Rope

Scanner State 변경 시:

```text
releasePlayerRope()
```

호출 금지.

Scanner system은
Physics/Rope constraint를 건드리지 않는다.

---

## 13. Prediction / Reconciliation Integration

### Important Existing Path

Prediction restore 후
Rope attachment candidate를 다시 계산하는 코드가 존재한다.

이 경로도:

```text
same dynamic eligibility predicate
```

를 사용해야 한다.

금지:

```text
live input candidate
= Scanner aware

reconcile candidate
= Scanner unaware
```

### Why

그렇게 되면
LOCKED phase에서:

- prediction candidate가 잠깐 표시됨
- attach correction 발생 가능
- aim feedback flicker

문제가 생긴다.

### Required Rule

`findRopeAttachment()`의 모든 호출자는:

```text
same eligibility semantics
```

사용.

### Surface Collection

Prototype에서
기존 call site가 사용하는 Surface collection 자체는
불필요하게 변경하지 않는다.

Scanner PR에서:

```text
this.world.surfaces
vs
activeCollisionSurfaces
```

라는 별도 문제까지 동시에 리팩터링하지 않는다.

Scope를 분리한다.

---

## 14. Attach Buffer / Phase Boundary Contract

Current Rope:

```text
Attach Buffer
= 0.10 sec
```

Scanner 전용 Input Buffer를 새로 만들지 않는다.

### Expected Behavior

Player가 LOCKED 종료 직전:

```text
pointer down
```

하고 기존 Attach Buffer가 남아 있는 상태에서
다음 tick이 AVAILABLE이 되면:

```text
attach allowed
```

될 수 있다.

이는 의도된 Input Forgiveness로 본다.

### 반대 상황

WARNING 마지막 tick에서
attach press가 들어왔지만
실제 evaluation tick에서 LOCKED라면:

```text
new attach denied
```

단 이미 직전 tick에 Attach가 성공했다면:

```text
rope stays attached
```

### No Scanner-specific Grace

Prototype에서:

```text
extra coyote window
extra scanner buffer
```

는 추가하지 않는다.

먼저 기존 0.10 sec Attach Buffer로 Playtest.

---

## 15. Already-Attached Rope Contract

가장 중요한 Regression Test 중 하나.

### Scenario

```text
AVAILABLE
→ Player attaches C1
→ phase becomes WARNING
→ phase becomes LOCKED
```

Expected:

```text
rope.isAttached
= true
```

### During LOCKED

Player가 Rope를 유지하면
Swing 가능.

### Release During LOCKED

```text
release
→ rope detached
```

이후:

```text
new attach
→ denied
```

AVAILABLE까지 기다려야 함.

### Scanner Cannot

- shorten Rope
- damage Rope
- cut Rope
- disable Rope
- change Swing impulse
- eject Player

---

## 16. Snapshot / Network Model

### Authoritative Gameplay State

Scanner Phase 자체를
mutable authoritative object로 저장하지 않는다.

Authority Source:

```text
worldElapsedSeconds
+
scanner group config
```

### Optional Derived Snapshot Field

Presentation / debug 편의를 위해:

```text
scannerStates
```

를 snapshot에 넣는 것을 권장.

예:

```js
state: {
    ...
    worldElapsedSeconds,
    scannerStates
}
```

하지만:

```text
scannerStates
```

는 Derived Data.

Gameplay Source of Truth는
여전히:

```text
worldElapsedSeconds + config
```

### Phase Replication Event 금지

다음 이벤트를 매 Cycle마다 생성하지 않는다.

```text
scanner-warning
scanner-locked
scanner-reset
scanner-available
```

Gameplay phase는 time-derived state다.

### Authority Snapshot

현재 `WorldSnapshotEnvelope`는
normalized arbitrary state field를 허용한다.

따라서 prototype에서
`scannerStates` 필드 추가만으로
schema 자체를 크게 바꿀 필요는 없다.

### Protocol Version

Scanner 도입으로
구형 Client와 신형 Client를 동시에 지원해야 한다면
protocol / deployment compatibility를 별도로 검토.

현재 해커톤 배포가
동일 build 원자 배포라면
Prototype 단계에서 protocol bump를 필수 조건으로 두지 않는다.

---

## 17. Presentation Contract

### Prototype Goal

Art 완성이 아니라:

```text
STATE READABILITY
```

검증.

### Required Visual Information

Player가 즉시 알아야 한다.

```text
WHICH SURFACES ARE CONTROLLED

+

CURRENT STATE
```

### Recommended State Cue

#### AVAILABLE

- low-intensity ready cue
- Rope Cyan과 경쟁하지 않는 중립/저채도 계열

#### WARNING

- Amber pulse
- remaining window가 짧아진다는 명확한 Telegraph

#### LOCKED

- Red/Orange security state
- controlled mount outline disabled/read-only

#### RESET

- dim / transition cue
- attach still denied

### Rope Candidate

LOCKED controlled surface는:

```text
attachmentCandidate
= null
```

이므로 기존 Candidate Highlight도 나오지 않아야 한다.

### Beam

있다면:

```text
thin
informational
non-damaging
```

이어야 한다.

Damage Laser처럼:

- thick
- explosive
- hit flash
- knockback cue

사용 금지.

---

## 18. Renderer Integration Options

### Option A — Dedicated Layer

권장:

```text
AccessScanFieldRenderer
```

역할:

- Scanner Housing
- controlled surface state overlay
- optional thin beam
- warning pulse

장점:

- WorldGeometryRenderer의 static cache를 건드리지 않음
- Gameplay collision rendering과 state overlay 분리
- 이후 실제 art asset으로 교체 쉬움

### Option B — AuthoredWorldObjectRenderer 확장

`access-scanner` worldObject만
기존 object renderer에서 그림.

하지만 controlled surface overlay는
별도 layer가 여전히 더 명확하다.

### Recommendation

```text
Scanner Housing
→ Authored World Object

Controlled Surface State
→ dedicated overlay layer
```

---

## 19. Scanner Housing Authoring

Optional world object:

```js
worldObject(
    "sector-03-02:scanner-housing-A",
    "access-scanner",
    x,
    y,
    {
        scannerGroupId: "sector-03-02:scanner-A"
    }
)
```

### Validation

`scannerGroupId`가
해당 Area의 group에 없으면 Error.

### Gameplay

Housing 자체:

```text
Damage
Collision
Interaction
```

없음.

단순 Presentation / Worldbuilding object.

---

## 20. Prototype Area Strategy

Sector 03 전체 Catalog를
한 번에 구현하지 않는다.

### Phase 1 — Test-only Synthetic Area

Tests 안에서
작은 `defineAreaCatalog()` 생성.

구성:

```text
P0 SAFE DECK

Permanent Surface P1

Controlled C1
Controlled C2

Recovery Deck

Gate optional
```

목적:

- phase logic
- candidate filtering
- already attached Rope
- prediction parity

검증.

### Phase 2 — 3-2 Graybox Slice

순수 logic PASS 후:

```text
SECTOR 03-2 SCANNER GALLERY
```

의 최소 authored geometry를 실제 Runtime Area로 옮긴다.

단:

```text
Sector 03 full chain
```

을 한 PR에서 같이 구현하지 않는다.

### 이유

Scanner bug와
Sector03 Catalog integration bug를
분리해서 찾기 위함.

---

## 21. Recommended File Changes

### NEW

```text
src/game/world/AccessScanField.js
```

### MODIFY

```text
src/game/world/areas/AreaDefinition.js
```

Add:

```text
scannerGroups: []
```

### MODIFY

```text
src/game/world/AuthoredWorldAssembler.js
```

Add:

- scanner group validation
- Runtime group collection
- controlled surface stamping
- world.scannerGroups
- area.scannerGroupIds

### MODIFY

```text
src/game/input/RopePointerInput.js
```

Add:

```text
canAttachToSurface
```

dynamic predicate.

### MODIFY

```text
src/game/simulation/GameSimulation.js
```

Add:

- scanner state evaluation
- Rope input predicate
- prediction restore predicate
- scanner snapshot

### MODIFY — PRESENTATION

Candidate:

```text
src/render/layers/SharedSceneRenderers.js
```

또는 new dedicated layer file.

### MODIFY — OBJECT MOCK

Candidate:

```text
src/render/assets/WorldObjectPresentationCatalog.js
```

Add:

```text
world-object:access-scanner
```

prototype mock.

### MODIFY — SNAPSHOT

```text
src/game/runtime/AuthoritySnapshotBuilder.js
```

optional:

```text
scannerStates
```

derived debug/presentation field.

---

## 22. Required Unit Tests

권장 신규:

```text
tests/accessScanField.mjs
```

### Phase Boundary Tests

Pure evaluator를 직접 호출해 검사:

```text
t = 0
AVAILABLE

t = 1.499...
AVAILABLE

t = 1.50
WARNING

t = 2.10
LOCKED

t = 3.20
RESET

t = 3.50
AVAILABLE
```

Fixed-step integration test에서는
floating-point 누적값을 문자열 equality처럼 비교하지 않는다.

권장:

```text
phase result
+
epsilon-aware elapsed-time assertion
```

을 사용.

### Negative / Offset

```text
phaseOffsetSeconds
```

positive / negative deterministic.

### Permission

```text
AVAILABLE true
WARNING true
LOCKED false
RESET false
```

### Static + Dynamic

```text
surface.grappleable === false
```

는 Scanner AVAILABLE이어도 attach 불가.

Uncontrolled Surface는
Scanner LOCKED여도 영향 없음.

### Invalid Group

Unknown group:

```text
assembly fails
```

### Duplicate Controlled Surface

동일 Surface가
2 Groups에 있으면 fail.

---

## 23. Rope Targeting Tests

### Case A

Aim에 가장 가까운 Surface:

```text
C1 controlled / LOCKED
```

그 다음:

```text
P1 permanent
```

Expected:

```text
P1 selected
```

### Case B

같은 상황 WARNING.

Expected:

```text
C1 selected
```

### Case C

No Scanner Groups.

Expected:

```text
existing current targeting behavior unchanged
```

### Case D

Static:

```text
grappleable: false
```

Expected:

```text
always skipped
```

---

## 24. Simulation Tests

### Test 1 — Attach Then Lock

```text
AVAILABLE
attach C1

advance into LOCKED
```

Expected:

```text
rope remains attached
```

### Test 2 — Release While Locked

```text
attached
→ LOCKED
→ release
```

Expected:

```text
detached

re-attach
= denied
```

### Test 3 — Re-open

Advance to AVAILABLE.

Expected:

```text
re-attach allowed
```

### Test 4 — Attach Buffer

Press pointer:

```text
< 0.10 sec before AVAILABLE
```

Expected:

existing Attach Buffer can carry intent
into AVAILABLE.

Scanner-specific new buffer 없음.

### Test 5 — No Damage

Across all phase changes:

```text
health unchanged
velocity unaffected
ropeDisabledRemaining unchanged
```

---

## 25. Multiplayer / Prediction Tests

가장 중요한 Production Gate.

### Test A — Same Phase

Authority:

```text
worldElapsedSeconds = T
```

Owner Predictor reconcile.

Expected:

```text
authority scanner phase
=
predicted scanner phase
```

### Test B — Same Candidate

Controlled C1에 aim.

AVAILABLE:

```text
server eligible
prediction eligible
```

LOCKED:

```text
server ineligible
prediction ineligible
```

### Test C — Reconcile Mid-cycle

Snapshot:

```text
T = 2.35 sec
```

LOCKED middle.

Predictor restore 후:

```text
LOCKED
```

여야 함.

### Test C-2 — Delayed Owner Motion Clock Parity

필수.

```text
serverTick = S
ownerMotionTick = S - N
N > 0
```

인 Authority Snapshot 생성.

Snapshot:

```text
worldElapsedSeconds = T at S
```

Predictor reconcile + replay 후
같은 target tick에서:

```text
authority phase
=
prediction phase
```

여야 한다.

이 Test가 실패하면
Scanner PR 진행을 멈추고
OwnerPrediction clock rebase를 먼저 수정한다.

이 Test는 Scanner correctness뿐 아니라
기존 Wind time-state parity 회귀도 보호한다.

### Test D — Two Players

같은 Scanner Group 앞:

```text
A
B
```

Expected:

같은 tick:

```text
same phase
same attach rule
```

### Test E — Phase Boundary Prediction

Boundary 전후 1~2 fixed ticks에서
server/client candidate divergence 없음.

---

## 26. Snapshot / Debug Tests

If `scannerStates` snapshot field implemented:

Authority Snapshot:

```text
scannerStates.length
=
world.scannerGroups.length
```

각 state:

```text
id
phase
attachAllowed
phaseTime
secondsRemaining
```

검증.

Prediction `renderSnapshot()` 또는
local simulation state와
phase 일치.

---

## 27. Test Runner Integration

Current:

```text
npm test
→ tests/runAll.mjs
```

### Add

```text
accessScanField
```

scenario import.

예:

```js
import { run as accessScanField } from "./accessScanField.mjs";
```

### Full Required Commands

Prototype PR 완료 전:

```text
npm test
npm run check
npm run format:check
```

필수.

현재 test budget:

```text
180 sec
```

내 유지.

---

## 28. Prototype Implementation Order

### P0A — Prediction Clock Parity Regression

Scanner code 전에
`ownerMotionTick < serverTick` time-derived-state test를 작성.

PASS:

```text
existing clock invariant correct
```

이면 다음 단계.

FAIL:

```text
OwnerPredictionRuntime clock rebase
```

를 먼저 수정.

### P0B — Pure State Logic

```text
AccessScanField.js
```

Phase evaluation / permission tests.

PASS 조건:

```text
no GameSimulation dependency
```

pure function.

### P1 — Authoring Data

```text
scannerGroups
controlledSurfaceIds
assembler validation
surface stamp
```

### P2 — Rope Predicate

`findRopeAttachment()` dynamic gate.

기존 non-scanner test regression zero.

### P3 — GameSimulation

같은 Scanner State Map을
모든 Player Input에 전달.

Prediction restore path 포함.

### P4 — Multiplayer Prediction

Authority / Predictor parity.

이 단계 PASS 전:

```text
Sector 03 Runtime Integration
```

금지.

### P5 — Debug Renderer

상태가 눈으로 읽히게 한다.

### P6 — 3-2 Graybox Runtime Slice

실제 3-2 좌표 일부 연결.

### P7 — Playtest

Input forgiveness / phase readability.

---

## 29. Prototype PASS Criteria

### Logic

- 4 Phase exact
- no drift across cycle
- offset deterministic

### Rope

- AVAILABLE/WARNING attach
- LOCKED/RESET no new attach
- already attached Rope preserved
- static `grappleable:false` preserved
- permanent surfaces unaffected

### Multiplayer

- same `worldElapsedSeconds`
→ same phase

- authority/prediction candidate parity

### Authoring

- invalid surface id rejected
- duplicate group membership rejected
- immutable area data preserved

### Presentation

- controlled surface recognizable
- current state readable
- WARNING readable before LOCKED
- LOCKED not confused with damage laser

### Regression

Existing:

- Sector01/02 Rope
- Gate
- Patrol
- Wind
- Prediction

tests PASS.

---

## 30. Prototype FAIL Conditions

### Gameplay

- LOCKED forces detach
- Scanner damages Player
- Scanner disables Rope
- Scanner adds Input
- Scanner behaves like Turret

### Architecture

- mutate frozen `surface.grappleable`
- local client-only phase timer
- per-player Scanner phase
- network phase event every transition
- Surface control mapping duplicated in conflicting places

### Prediction

- authority LOCKED / client AVAILABLE
- candidate flicker after reconcile
- attach accepted client / denied authority

### Scope

- implement entire Sector 03 in same Scanner core PR
- add Security Shutter
- add new Drone type
- add Growth system
- refactor unrelated Rope physics

---

## 31. Performance Budget

Scanner Groups in Sector 03 are few.

Target:

```text
O(number of scanner groups)
per simulation time evaluation

+

O(1)
group lookup per candidate surface
```

Avoid:

```text
allocate filtered world.surfaces array
per player
per tick
```

if unnecessary.

### Recommended

Build:

```text
Map<groupId, phaseState>
```

once for current simulation time.

Predicate:

```text
surface.grappleAccessGroup
→ map lookup
```

---

## 32. Metrics Hooks — NOT P0

Stage docs want future metrics:

```text
locked attach attempts
warning attach attempts
scanner cycles observed
wait time
```

Prototype core에서
RunMetrics를 바로 확장할 필요는 없다.

### Later Hook

Rope Input에서:

```text
pointer intent
+
controlled surface under aim
+
phase denied
```

를 감지할 수 있게 된 뒤
metric event 추가.

### 이유

P0 목표:

```text
correctness first
```

Metrics는 Prototype PASS 후.

---

## 33. 3-2 Runtime Slice Acceptance

Core logic + multiplayer PASS 후
3-2에서 최소:

```text
P1 Safe Observation
C1
P2
C2
P3
C3
Recovery
Gate
```

를 authored runtime으로 연결.

### 3-2 Rule

```text
NO ENEMY
```

유지.

### Playtest Questions

1. AVAILABLE/LOCKED를 설명 없이 구분 가능한가?
2. WARNING이 실제로 다음 상태를 예고하는가?
3. 이미 붙은 Rope가 유지되는 것을 자연스럽게 이해하는가?
4. LOCKED 중 기다리는 시간이 답답한가?
5. 기존 0.10 sec Attach Buffer가 충분한가?
6. Mobile에서 상태 Cue가 충분히 읽히는가?

---

## 34. Timing Tuning Order

Prototype baseline이 답답하면:

### 먼저

1. Geometry
2. Safe Wait Deck
3. State Cue
4. phaseOffset
5. AVAILABLE duration
6. WARNING duration

### 나중

```text
LOCKED duration
```

### 가장 나중

새 Input Forgiveness System.

Scanner가 어렵다고
즉시:

```text
larger Attach Range
auto attach
scanner immunity
```

를 추가하지 않는다.

---

## 35. Art / VFX Boundary

현재 Sector 03 Runtime / Camera Zone이 없다.

따라서 Prototype visual은:

```text
DEBUG / MOCK
```

이다.

### Do Not

이 단계에서:

- final Scanner sprite
- polished commercial beam
- Approved Gameplay Reference
- final VFX sheet

제작을 Production 완료로 간주하지 않는다.

### After Runtime

```text
3-2 Runtime Area
+
Camera Zone
+
Stable IDs
+
Gameplay PASS
```

후 Scenario Art Standard 적용.

---

## 36. Definition of Done — Core PR

Core Scanner Prototype PR은
다음을 모두 만족하면 완료.

```text
[ ] delayed owner-motion prediction clock parity test
[ ] clock rebase fix if that test initially fails
[ ] AccessScanField pure module
[ ] scannerGroups authoring
[ ] assembler validation
[ ] surface group stamping
[ ] dynamic Rope predicate
[ ] live input path aligned
[ ] prediction restore path aligned
[ ] already attached Rope remains
[ ] authority/prediction phase parity test
[ ] two-player same phase test
[ ] no damage / forced detach regression
[ ] npm test PASS
[ ] npm run check PASS
[ ] npm run format:check PASS
```

### Not Required in Core PR

```text
full Sector03 catalog
final art
story triggers
3-3+ enemies
new growth
Sector04
Boss
```

---

## 37. Developer Handoff — Short Version

### Build

```text
STATIC AREA DATA
scannerGroups

↓

WORLD ASSEMBLER
stamp grappleAccessGroup

↓

AccessScanField
worldElapsedSeconds → phase

↓

GameSimulation
one shared phase map

↓

RopePointerInput
static filter
+
dynamic predicate

↓

NEW ATTACH
ALLOW / DENY
```

### Do Not Touch Existing Rope

```text
LOCKED
≠
DETACH
```

### Multiplayer

```text
worldElapsedSeconds
=
shared clock
```

No per-client timer.

### Prototype First

```text
prediction clock parity
→
pure scanner tests
→
synthetic authored area
→
authority / prediction eligibility parity
→
debug presentation
→
3-2 slice
```

---

## 38. Final Recommendation

현재 코드 구조에서는
ACCESS SCAN FIELD를
**새로운 Enemy/Object Simulation**으로 만드는 것보다:

```text
WorldForceField와 유사한
pure time-derived world rule
```

로 만드는 것이 가장 안전하다.

특히 이미 존재하는:

```text
worldElapsedSeconds replication
owner prediction restore
fixed-step prediction
InputDispatcher context
static grappleable filter
immutable authored area data
```

를 그대로 활용할 수 있다.

따라서 최소 위험 구현은:

> **“먼저 Prediction Clock이 time-derived state를 정확히 재현하는지 증명하고, Surface 자체를 바꾸지 말고, Rope가 새 Attach 후보를 평가할 때만 현재 Scanner State를 추가 조건으로 본다.”**

이다.

---

ACCESS SCAN FIELD — RUNTIME PROTOTYPE SPEC · REV 1.0
