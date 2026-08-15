# ACCESS SCAN FIELD — CODEX IMPLEMENTATION HANDOFF

*IMPLEMENTATION TASK · REV 1.0 · SECTOR 03 CORE RUNTIME*

Project:
OpenAI Game Builders Hackathon

Repository:
`https://github.com/openbaeseongjin/baeseongjin`

Current reviewed main:
`1f6875c5ed49e9b162a6acd61acdbea512b28187`

Important:
이 SHA 이후 `main`이 바뀌었다면 작업 시작 전에 최신 HEAD를 다시 확인하고,
아래 Runtime 관련 파일에 변경이 있으면 먼저 diff를 읽고 지시서를 현재 코드에 맞게 재해석한다.

---

## 0. 목표

Sector 03의 핵심 Gameplay System:

```text
ACCESS SCAN FIELD
```

의 **최소 Runtime Prototype**을 구현한다.

Canonical Rule:

```text
AVAILABLE / WARNING
→ NEW ROPE ATTACH ALLOWED

LOCKED / RESET
→ NEW ROPE ATTACH DENIED

ALREADY ATTACHED ROPE
→ STAYS ATTACHED
```

이 작업은 Scanner의:

- Damage
- Knockback
- Rope Cut
- Rope Disable
- Forced Detach
- Hack Input
- Disable Input
- Security Shutter

를 구현하는 작업이 아니다.

---

## 1. 가장 먼저 할 일 — 최신 코드 검증

작업 시작 직후:

```bash
git status
git fetch
git log -1 --oneline origin/main
```

확인.

현재 기준 Runtime 파일:

```text
src/game/input/RopePointerInput.js
src/game/input/InputDispatcher.js
src/game/simulation/GameSimulation.js
src/game/runtime/OwnerPredictionRuntime.js
src/game/runtime/AuthoritySnapshotBuilder.js
src/game/world/WorldForceField.js
src/game/world/AuthoredWorldAssembler.js
src/game/world/areas/AreaDefinition.js
src/game/world/WorldGateGeometry.js
src/game/network/WorldSnapshotEnvelope.js
tests/authoredMultiplayerWorld.mjs
tests/runAll.mjs
```

다음 검색:

```bash
rg "AccessScanField|scannerGroups|grappleAccessGroup" src tests
```

현재 기준 기대:

```text
Runtime implementation 없음
```

만약 이미 구현돼 있으면
중복 구현하지 말고 기존 구현과 본 사양의 차이를 먼저 보고한다.

---

## 2. 현재 코드에서 절대 깨면 안 되는 것

### Static Grapple Filter

현재:

```js
if (surface.grappleable === false) continue;
```

는 이미 구현돼 있다.

이 동작을 제거하거나
Scanner Rule로 대체하지 않는다.

Scanner는:

```text
STATIC FILTER
+
DYNAMIC FILTER
```

의 두 번째 계층이다.

### Current Rope Behavior

다음은 그대로 유지:

- max attach distance
- aim scoring
- attach buffer
- swing impulse
- release behavior
- current rope physics
- static non-grappleable surface behavior

---

## 3. P0A — Prediction Clock Parity Test부터 작성

Scanner logic보다 먼저 한다.

이유:

Scanner Phase는:

```text
worldElapsedSeconds
```

로 계산할 예정이고,
현재 owner prediction은 snapshot의:

```text
worldElapsedSeconds
serverTick
ownerMotionTick
```

을 사용해 replay한다.

### 반드시 테스트할 케이스

```text
serverTick = S
ownerMotionTick = S - N
N > 0
```

인 snapshot을 만든다.

Snapshot 시간:

```text
worldElapsedSeconds = T
```

Authority와 Predictor를 같은 target tick까지 진행.

검증:

```text
time-derived state
```

가 동일해야 한다.

Scanner 구현 전에는
기존 Wind의 `evaluateWindZone()` 같은 time-derived function을
이 parity test에 사용할 수 있다.

### PASS

authority / prediction에서
동일 elapsed-time-derived 결과.

### FAIL

Scanner 구현 중단.

먼저:

```text
OwnerPredictionRuntime clock rebase
```

를 고친다.

권장 invariant:

```text
elapsedAtTick(X)
=
snapshot.worldElapsedSeconds
+
(X - snapshot.serverTick) * fixedDt
```

또는 수학적으로 동등한 구현.

### 금지

Clock 문제를 피하기 위해:

```text
Date.now()
performance.now()
client-local scanner timer
scanner phase network spam
```

를 추가하지 않는다.

---

## 4. P0B — Pure Scanner Logic 구현

신규 권장 파일:

```text
src/game/world/AccessScanField.js
```

### Phase

Prototype baseline:

```text
AVAILABLE  1.50
WARNING    0.60
LOCKED     1.10
RESET      0.30

TOTAL      3.50
```

모두 HYPOTHESIS 값이다.

### 함수 1

```js
evaluateAccessScanGroup(group, elapsedSeconds)
```

반환 개념:

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

### 함수 2

```js
snapshotAccessScanStates(groups, elapsedSeconds)
```

### 함수 3

```js
accessScanStateMap(groups, elapsedSeconds)
```

### 함수 4

```js
isSurfaceAccessAllowed(surface, stateByGroupId)
```

Rule:

```text
no grappleAccessGroup
→ true

AVAILABLE
→ true

WARNING
→ true

LOCKED
→ false

RESET
→ false
```

Unknown Group은
조용히 true 처리하지 않는다.

개발 단계에서는
명시적 Error가 낫다.

---

## 5. Phase Boundary Contract

Pure unit test:

```text
t = 0
AVAILABLE

t < 1.50
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

positive modulo를 사용해:

```text
elapsedSeconds + phaseOffsetSeconds
```

평가.

`phaseOffsetSeconds`:

```text
positive
→ cycle advance

negative
→ cycle delay
```

---

## 6. P1 — AreaDefinition에 Scanner Authoring 추가

수정:

```text
src/game/world/areas/AreaDefinition.js
```

`defineArea()` 기본값에:

```js
scannerGroups: []
```

추가.

### Runtime ID 규칙

예:

```text
sector-03-02:scanner-A
```

Surface:

```text
sector-03-02:c1
sector-03-02:c2
sector-03-02:c3
```

README의 단축 개념명:

```text
C1
C2
scanner-gallery-A
```

를 Runtime global ID로 사용하지 않는다.

---

## 7. Scanner Group Authoring Model

예:

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

Source of Truth:

```text
scannerGroups[].controlledSurfaceIds
```

Surface와 Group 양쪽에
사람이 같은 mapping을 중복 입력하지 않는다.

---

## 8. P1 — AuthoredWorldAssembler 확장

수정:

```text
src/game/world/AuthoredWorldAssembler.js
```

### 해야 할 것

1. Area의 `scannerGroups` 수집.
2. Group validation.
3. `controlledSurfaceIds` 검증.
4. Runtime surface에 group ID stamp.
5. World에 `scannerGroups` 추가.
6. Area metadata에 `scannerGroupIds` 추가.

### Runtime Surface 예

```js
{
    ...surface,
    grappleAccessGroup: "sector-03-02:scanner-A"
}
```

### 반드시 immutable 유지

현재 AreaDefinition / Assembler의
freeze 계약을 깨지 않는다.

---

## 9. Assembler Validation

fail-fast.

### Group ID

- non-empty
- World unique
- Area-prefixed

### Cycle

모든 duration:

```text
finite
> 0
```

### Offset

```text
finite
```

### Surface

controlled ID는:

```text
same area's definition.surfaces
```

안에 반드시 존재.

### Duplicate

같은 Surface가
2 Scanner Groups에 들어가면 Error.

### Static False

```text
grappleable: false
```

Surface를 Scanner Group이 enable하려 하지 않는다.

Controlled Surface는
기본 static grappleable surface여야 한다.

---

## 10. World Revision 갱신

Scanner Group data는
Gameplay prediction 결과를 바꾼다.

따라서 Production catalog에
실제 Scanner data를 추가하는 커밋에서는:

```text
catalog revision
```

을 반드시 올린다.

현재 prediction은:

```text
worldRevision
```

불일치를 검사하므로
이를 compatibility gate로 유지한다.

---

## 11. P2 — RopePointerInput Dynamic Predicate

수정:

```text
src/game/input/RopePointerInput.js
```

`findRopeAttachment()` signature 확장:

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
closestPointOnSurface

4.
distance

5.
aim scoring
```

### Regression

`canAttachToSurface` 미전달 시
현재 Behavior와 동일해야 한다.

---

## 12. P2 — Input Capability Context

`withRopePointerInput.apply()` context에:

```text
canAttachToSurface
```

를 받는다.

`InputDispatcher` 구조 자체는
대규모 변경하지 않는다.

현재 context pass-through를 활용.

---

## 13. P3 — GameSimulation Integration

Scanner State를
Simulation time으로 계산.

### 기준 시간

현재 gameplay input dispatch 시점의:

```text
this.elapsedSeconds
```

사용.

Authority / Prediction 둘 다
같은 ordering을 가져야 한다.

### 한 tick에서

Scanner State Map:

```text
1회 계산
```

권장.

모든 Player가
같은 Map 사용.

### Predicate

개념:

```js
const canAttachToSurface = (surface) =>
    isSurfaceAccessAllowed(
        surface,
        scannerStateByGroupId
    );
```

Rope Input Context에 전달.

---

## 14. Prediction Restore Path도 반드시 동일하게 수정

현재 `GameSimulation`에는
prediction state restore 후:

```text
findRopeAttachment()
```

로 candidate를 재계산하는 별도 경로가 있다.

이 경로도
동일한 Scanner predicate를 사용해야 한다.

금지:

```text
live input
= Scanner aware

prediction restore
= Scanner unaware
```

결과:

```text
candidate flicker
client attach / server deny divergence
```

가 생길 수 있다.

---

## 15. Existing Rope는 절대 Scanner가 끊지 않는다

Test:

```text
AVAILABLE
→ attach

WARNING
→ attached

LOCKED
→ still attached
```

Scanner phase 변경 처리에서 아래 동작은 **금지**다.

```text
FORBIDDEN:
releasePlayerRope()
rope.detach()
ropeDisabledRemaining mutation
```

Scanner는 이미 붙은 Rope의 상태를 변경하지 않는다.

### LOCKED 중 Release

Player가 직접 release:

```text
rope detached
```

그 후:

```text
new attach denied
```

AVAILABLE까지 기다린다.

---

## 16. Attach Buffer는 기존 0.10 sec 재사용

Scanner 전용 buffer 추가 금지.

현재 attach buffer가
LOCKED 종료 직전 입력을
다음 AVAILABLE tick까지 보존할 수 있으면
그대로 input forgiveness로 인정.

먼저 Playtest.

추가:

```text
scanner coyote time
auto attach
extra range
```

는 P0 범위 밖.

---

## 17. P4 — Authority / Prediction Tests

필수.

### A. Same Phase

Authority와 Predictor:

```text
same worldElapsedSeconds
→ same phase
```

### B. Same Candidate — AVAILABLE

Controlled Surface aim:

```text
authority eligible
prediction eligible
```

### C. Same Candidate — LOCKED

```text
authority ineligible
prediction ineligible
```

### D. Reconcile Mid-cycle

```text
T = 2.35
```

LOCKED middle snapshot.

Prediction restore:

```text
LOCKED
```

### E. Delayed Owner Motion

```text
ownerMotionTick < serverTick
```

snapshot/replay.

같은 final tick:

```text
authority phase
=
prediction phase
```

### F. Two Players

같은 Scanner 앞의 A/B:

```text
same tick
same phase
same attach rule
```

---

## 18. P4 — Rope Regression Tests

### Case 1

Nearest:

```text
controlled C1
LOCKED
```

behind/fallback:

```text
permanent P1
```

Expected:

```text
P1 selected
```

### Case 2

WARNING.

Expected:

```text
C1 selected
```

### Case 3

```text
grappleable:false
```

Scanner AVAILABLE이어도:

```text
never selected
```

### Case 4

No Scanner Group.

Expected:

```text
existing Rope targeting behavior unchanged
```

---

## 19. P4 — Simulation Behavior Tests

### Attach Then Lock

```text
attach
→ advance phase to LOCKED
```

Expected:

```text
rope.isAttached === true
```

### Release During Lock

Expected:

```text
rope.isAttached === false
re-attach denied
```

### Re-open

Next AVAILABLE:

```text
attach allowed
```

### No Combat Side Effect

All phase transitions:

```text
health unchanged
velocity unchanged
ropeDisabledRemaining unchanged
```

---

## 20. P5 — Debug Presentation

Production Art 아님.

목적:

```text
STATE READABILITY
```

### 필요

- Scanner Housing
- Controlled Surface 표시
- AVAILABLE
- WARNING
- LOCKED
- RESET

### 추천

Housing:

```text
AuthoredWorldObjectRenderer
```

Controlled Surface overlay:

```text
dedicated AccessScanFieldRenderer
```

### 이유

Static WorldGeometry cache와
dynamic state overlay를 분리.

---

## 21. Prototype Visual Rules

### AVAILABLE

low-intensity ready.

### WARNING

Amber pulse.

### LOCKED

Red/Orange security state.

### RESET

dim transition.

### 금지

Scanner를:

```text
damage laser
```

처럼 보이게 하지 않는다.

No:

- thick hit beam
- explosion flash
- damage particles
- knockback VFX

---

## 22. Optional Scanner Housing

예:

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

Housing:

```text
collision none
damage none
interaction none
```

Presentation only.

---

## 23. Snapshot Debug State

Optional but recommended:

Authority snapshot state에
derived:

```text
scannerStates
```

추가 가능.

예:

```js
[
    {
        id,
        phase,
        phaseTime,
        secondsRemaining,
        attachAllowed
    }
]
```

하지만 Gameplay Source of Truth는:

```text
worldElapsedSeconds + group config
```

이다.

`scannerStates`를 mutable truth로 사용하지 않는다.

---

## 24. Network Event로 Phase를 복제하지 않는다

```text
PHASE REPLICATION EVENT
= FORBIDDEN
```

매 cycle:

```text
scanner-warning
scanner-locked
scanner-reset
scanner-available
```

같은 replication event 생성 금지.

Scanner는:

```text
time-derived deterministic world rule
```

로 유지.

---

## 25. P6 — 3-2 실제 Slice는 Core PASS 후

Core Scanner PR과
전체 Sector 03 Runtime을 한 번에 만들지 않는다.

### 먼저

Synthetic test area.

그 뒤:

```text
3-2 SCANNER GALLERY
```

최소 Runtime slice.

### 3-2에서 구현할 것

- P1 Safe Observation
- C1
- P2
- C2
- P3
- C3
- Recovery
- current Gate contract

Enemy:

```text
NONE
```

---

## 26. 이 PR에서 하지 말 것

### Sector

- 3-3 전체 구현
- 3-4 전체 구현
- 3-6~3-8 구현
- Sector 04
- Boss

### Systems

- Security Shutter
- new Drone
- Growth
- Augment Runtime
- Artifact redesign
- Rope physics refactor

### Networking

- unrelated protocol overhaul
- broad snapshot redesign

### Art

- final Scanner sprite
- final Commercial VFX
- Approved Scenario Art

---

## 27. 권장 테스트 파일

신규:

```text
tests/accessScanField.mjs
```

필요 시:

```text
tests/accessScanFieldPrediction.mjs
```

로 분리 가능.

하지만 test runner가 현재 scenario 단위이므로
불필요하게 테스트 파일을 과도하게 쪼개지 않는다.

---

## 28. tests/runAll.mjs 연결

현재 runner에:

```js
import { run as accessScanField } from "./accessScanField.mjs";
```

추가.

Scenario map에 등록.

전체 test time budget:

```text
180 sec
```

유지.

---

## 29. 최종 검증 명령

반드시:

```bash
npm test
npm run check
npm run format:check
git diff --check
```

모두 PASS.

추가로:

```bash
git status --short
```

로 의도하지 않은 파일 변경 확인.

---

## 30. 예상 수정 파일

최소 후보:

```text
NEW
src/game/world/AccessScanField.js
tests/accessScanField.mjs

MODIFY
src/game/world/areas/AreaDefinition.js
src/game/world/AuthoredWorldAssembler.js
src/game/input/RopePointerInput.js
src/game/simulation/GameSimulation.js
tests/runAll.mjs
```

Clock parity가 실제 실패할 경우에만:

```text
src/game/runtime/OwnerPredictionRuntime.js
```

수정.

Presentation을 같은 PR에 포함한다면 추가:

```text
src/render/layers/SharedSceneRenderers.js
src/render/assets/WorldObjectPresentationCatalog.js
```

### 중요

Clock parity가 PASS하면
`OwnerPredictionRuntime.js`를
괜히 수정하지 않는다.

---

## 31. 구현 우선순위

```text
P0A
Prediction Clock Parity Test

↓

P0B
Pure AccessScanField

↓

P1
Area authoring + assembler

↓

P2
Rope predicate

↓

P3
GameSimulation

↓

P4
Authority / Prediction tests

↓

P5
Debug presentation

↓

P6
3-2 runtime slice
```

P4 PASS 전
P6 진행 금지.

---

## 32. 완료 조건

다음 전부 만족.

```text
[ ] delayed owner-motion clock parity proven
[ ] clock fix only if required
[ ] pure Scanner phase evaluator implemented
[ ] scannerGroups authoring implemented
[ ] assembler validation implemented
[ ] stable Area-prefixed IDs used
[ ] controlled surfaces stamped
[ ] static grappleable filter preserved
[ ] dynamic Rope predicate implemented
[ ] all findRopeAttachment call paths aligned
[ ] existing attached Rope survives LOCKED
[ ] LOCKED release prevents re-attach
[ ] authority/prediction phase parity
[ ] authority/prediction candidate parity
[ ] two-player same phase
[ ] no damage/knockback/Rope disable
[ ] existing Sector01/02 tests pass
[ ] npm test pass
[ ] npm run check pass
[ ] npm run format:check pass
[ ] git diff --check pass
```

---

## 33. 결과 보고 형식

Codex/개발자는 작업 완료 후
다음 형식으로 보고한다.

### 1. Changed Files

파일별 한 줄 목적.

### 2. Prediction Clock Result

```text
PASS
```

또는:

```text
FAIL FOUND
→ fix description
```

### 3. Scanner Architecture

실제 구현한 data flow:

```text
AreaDefinition
→ Assembler
→ Simulation
→ Rope
```

### 4. Test Results

실행한 명령과 결과.

### 5. Deviations

본 지시서에서 다르게 구현한 부분.

없으면:

```text
NONE
```

### 6. Remaining Work

특히:

```text
3-2 Runtime Slice
Presentation
Sector03 Catalog
```

상태.

---

## 34. PR Scope Rule

가능하면 Core Scanner는
독립 PR.

권장 제목:

```text
feat(game): add deterministic Access Scan Field prototype
```

PR 설명에:

```text
- static grapple filter preserved
- dynamic attach eligibility added
- existing rope not detached
- authority/prediction parity tested
- no Sector03 full integration yet
```

명시.

### Do Not Auto-merge

테스트 PASS 후에도
기획/코드 검토 없이
자동 merge하지 않는다.

---

## 35. Codex에 그대로 전달할 짧은 지시문

아래를 그대로 사용할 수 있다.

> 최신 `main`에서 ACCESS SCAN FIELD Runtime Prototype을 구현해라. 먼저 `ownerMotionTick < serverTick` 상황에서 `worldElapsedSeconds` 기반 time-derived state의 authority/owner-prediction parity regression test를 작성하고, 실패하면 Scanner보다 먼저 prediction clock rebase를 최소 범위로 수정해라. 그 다음 `src/game/world/AccessScanField.js`에 AVAILABLE 1.50 / WARNING 0.60 / LOCKED 1.10 / RESET 0.30의 pure phase evaluator를 만들고, `AreaDefinition`의 `scannerGroups`, `AuthoredWorldAssembler`의 validation 및 controlled surface `grappleAccessGroup` stamping, `RopePointerInput.findRopeAttachment()`의 optional dynamic `canAttachToSurface` predicate, `GameSimulation`의 shared scanner state evaluation을 구현해라. `surface.grappleable === false` static rule은 반드시 유지하고, LOCKED/RESET은 새 attach만 차단하며 이미 붙은 Rope는 절대 강제로 끊지 마라. 모든 live-input / prediction-restore `findRopeAttachment()` 경로가 동일한 predicate를 사용해야 한다. Runtime ID는 `sector-03-02:scanner-A`처럼 Area prefix를 써라. client-local timer, Scanner phase replication event, Surface mutation, Damage, Rope Disable, Forced Detach, 새 Input, Security Shutter, Growth, 전체 Sector03 구현은 금지한다. 테스트는 phase boundary, static+dynamic filtering, fallback candidate, attach-then-lock, release-during-lock, authority/prediction candidate parity, delayed owner-motion parity, two-player same phase를 포함한다. `npm test`, `npm run check`, `npm run format:check`, `git diff --check` 전부 통과시켜라. 작업 완료 후 Changed Files / Prediction Clock Result / Scanner Architecture / Test Results / Deviations / Remaining Work 형식으로 보고하고 자동 merge하지 마라.

---

## 36. 다음 단계

이 지시서 결과를 받은 뒤:

```text
1.
최신 PR / branch diff 독립 검토

2.
Clock parity 실제 결과 확인

3.
Scanner Rule regression 확인

4.
multiplayer prediction 확인

5.
PASS 시 3-2 Runtime Slice 진행
```

순서.

Scanner 구현이 완료됐다고 해서
즉시:

```text
Sector 03 full production ready
```

로 판정하지 않는다.

---

ACCESS SCAN FIELD — CODEX IMPLEMENTATION HANDOFF · REV 1.0
