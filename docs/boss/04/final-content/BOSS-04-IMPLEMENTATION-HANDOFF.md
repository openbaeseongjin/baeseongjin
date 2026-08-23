# BOSS 04 — IMPLEMENTATION HANDOFF
## 기존 코드 우선 / 최소 확장 개발 지시서

> AUTHORING SNAPSHOT: GitHub `openbaeseongjin/baeseongjin` `main` `3301269a4de30f54a71a4361c3f9fc7f665a93cb` (2026-08-23 기준).
> 이 인계는 미래 구현의 참고 자료이며, 현재 main의 구현 지시나 Runtime 연결 증거가 아니다. 현재 상태는 `docs/scenario-development-integration.md`가 소유한다.
> 목표는 새 시스템을 최소화하고 기존 runtime capability를 최대한 보존하는 것이다.

---

# 0. 가장 먼저 할 일

개발자는 실제 local repository에서 다음을 확인한다.

```text
git status
git branch --show-current
git rev-parse HEAD
git log -1 --oneline
```

local HEAD가 `3301269a4de30f54a71a4361c3f9fc7f665a93cb`과 다르면:
- local의 더 최신 변경을 우선 검토
- 이 문서를 무조건 그대로 적용하지 말고 충돌 지점을 기록
- 기존 capability가 이미 추가되었다면 신규 구현하지 말고 재사용

---

# 1. 복원하는 기존 기획과 계속 금지하는 항목

사용자 결정으로 아래 기존 흐름은 현재 구현한다.

```text
추적 구역 이탈
→ 시야 끊기
→ 원위치 복귀
→ 복귀 중 약점 노출
→ P3 Guard A 복귀 / Guard B 발각 인계
```

이는 기존 Boss04 Runtime의 Guard state, authored collision surface LOS와 snapshot을 조합하는 범위이며 새 범용 AI/pathfinding 시스템을 만들지 않는다.

아래는 계속 구현하지 않는다.

```text
P3 Guard reactivation
Guard docking victory
combat gate / transparent wall
두 Guard 공격 순서 제어
```

---

# 2. 수정 우선순위

## P0 — 데이터/문서 정합성

업데이트 대상:
- `docs/boss/04/final-content/BOSS-04-BRIEF.md`
- `docs/boss/04/final-content/BOSS-04-COMPONENTS.md`
- `docs/boss/04/README.md`

README 상태는 Runtime 구현 전:
```text
DESIGN LOCKED / RUNTIME IMPLEMENTATION PENDING
```

Runtime merge 후:
```text
DESIGN LOCKED / RUNTIME IMPLEMENTED
```

---

## P1 — Guard runtime foundation

### 기존 그대로

- `EnemyObject`
- `EnemyActivationState`
- `PursuitEnemyBehavior`
- `PursuitEnemyBehaviorStates`
- `ArtilleryEnemyBehavior`
- `ArtilleryEnemyBehaviorStates`
- `PlayerEnemyImpactResolver`
- `RopeImpactAttack`

### 최소 확장

#### A. Persistent pursuit option

현재 activation bounds가 targeting/movement leash로 작동한다.

Boss04 Guard에만:
- awaken 이후 target selection에서 activation boundary 무시
- awaken 이후 movement clamp 무시

일반 pursuit enemy의 default behavior는 반드시 동일해야 한다.

#### B. Damage-awaken

미발각 Guard가 유효 Player impact를 받으면 awaken.

첫 타격은 무효 처리하지 말고 정상 damage.

#### C. Recovery pursuit

Boss04 Guard:
- RECOVER timer 동안 weakpoint open
- low-speed direct pursuit
- attack 금지
- timer 끝나면 normal pursuit

일반 Pursuit:
- 기존 recovery 유지

---

# 3. Guard A

권장 구현 형태:

```text
Boss04GuardA behavior/composition
  - pursuit movement primitives 재사용
  - artillery-style locked-position strike 재사용
  - Boss04 landing selector 추가
  - Boss04 weakpoint state 추가
```

## Required state data

개념적으로:

```text
detected
attackState
lockedBurstPositions[]
burstIndex
weakpointExposed
```

기존 snapshot style에 맞춰 serialize.

## Attack select

정상:
- actual reachable landing candidates
- choose 2~3
- lock
- sequential

fallback:
- current player position snapshot 1개

## Active

- invulnerable
- body hazard to player
- no attack cancel

## Recover

- rear weakpoint
- low-speed pursuit
- no timer extension on hit

---

# 4. Guard B

권장 구현:

기존 `PursuitEnemyBehavior` Dash execution 최대 재사용.

## 차이

WINDUP target:
- current Player center가 아니라 next landing candidate

fallback:
- Player current position snapshot

## Dash ACTIVE

- invulnerable
- body hazard
- direction locked

## Recover

- side weakpoint
- low-speed pursuit

---

# 5. Landing candidate resolver

가능하면 Boss04 전용 helper로 둔다.

신규 범용 AI/pathfinding framework로 확장하지 않는다.

입력 예:

```text
player position
player velocity/movement direction
authored surfaces/hardpoints
Base Rope capability / authored movement relation
current combat area geometry
```

출력:

```text
ordered reachable landing candidates
```

중요:
- 단순 straight-line distance만으로 안전/도달 가능 판정하지 않는다.
- 그러나 full future physics simulation도 요구하지 않는다.
- authored route/reachability 정보를 우선 활용한다.

---

# 6. Guard death → progress

Guard HP 0:
- EnemyObject 제거
- attack hazard 제거
- Protection Link permanent OFF
- completed encounter/progress 기록

Respawn anchor update:
- Guard A completion → Refuge Landing
- Guard B completion → P3 pre-entry

Guard를 skip하고 공간만 통과해서 save point가 앞당겨지면 안 된다.

기존 Stage Save Point trigger를 사용할 경우:
- progress prerequisite를 걸거나
- combat completion 후에만 해당 respawnAnchor가 유효하도록 연결

---

# 7. Hub runtime

## 기존 framework

- `BossEncounterRuntime`
- `ImpactTarget`
- `ImpactTargetRegistry`
- `BossStagePresentation`
- `BossMechanismRuntimeFactory`

## 신규 mechanism

Boss04 Hub mechanism을 factory에 등록.

권장 책임:

```text
P3 active state
Link A/B
Shield
Beam state
Burst state
Core exposed state
P3 pause/re-entry
Shutdown
```

Guard AI를 이 runtime 안에 구현하지 않는다.

---

# 8. GameSimulation integration

확인된 현재 Boss runtime context:

```text
players
surfaces
worldOffset
```

Boss04 Hub에는 Guard completion state가 추가로 필요하다.

권장:
- boss runtime context에 최소한의 immutable progress snapshot 전달
- 예: `guardStates` 또는 Boss04-specific `protectionLinks`

Hub가 `this.enemies`를 직접 강하게 참조하는 구조는 피한다.

---

# 9. Hub Beam

authored direction 3개:
- LEFT
- RIGHT
- UPPER

selector:

```text
valid = hub-only reachable safe route 존재
if >1:
    previous direction 제외 우선
if only previous valid:
    repeat allowed
```

attack selected 뒤 direction lock.

Guard hazards는 selector에서 무시.

---

# 10. Hub Burst

Beam 완료 뒤 새 player state 기준 landing candidate 재계산.

```text
n >= 3 → attack 2
n == 2 → attack 1
n == 1 → skip
```

Hub-only safe landing 1개 유지.

2 strikes simultaneous.

warning 후 position lock.

---

# 11. Hub Shield/Core

## Shield ON

- Hub can attack
- body/core damage 0
- Core closed

## Shield OFF

- current attack cycle completes
- then Core window

## Core OPEN

- only valid Hub damage target
- multiple impacts possible
- existing RopeImpactAttack overlap dedupe 유지
- hit 후 즉시 close 금지

---

# 12. P3 exit/re-entry

Player leaves P3:

```text
cancel current Hub warning
cancel current Hub active hazard
close Core
reset cycle state
keep HP
keep active flag
keep Links
keep Shield
```

Re-entry:
```text
start fresh Beam telegraph
```

Guard AI는 pause하지 않는다.

---

# 13. Friendly-fire / collision

Boss04 team rules:

```text
Guard A attack → Player only
Guard B attack → Player only
Hub attack → Player only
```

physics:
```text
Guard A ↔ Guard B ignore
Guard ↔ Hub ignore
```

Player ↔ Guard:
- normal pursuit/recover: depenetration only
- Guard attack ACTIVE: damage + knockback

Player ↔ Hub:
- Hub body interaction은 기존 boss collision contract를 우선 보존
- 새 contact damage를 임의 추가하지 않는다.
- Beam/Burst만 명시적 hazard damage source.

---

# 14. Presentation

`BossStagePresentation.js` 패턴을 유지하며 필요한 kind/state만 추가.

필요 concept:

```text
guard-a
guard-b
guard-a-burst-warning
guard-a-burst-active
guard-b-dash-warning
guard-b-dash-active
protection-link-a
protection-link-b
hub-shield
hub-beam
hub-landing-burst
hub-core
protected-gate
```

정확한 renderer 파일/ID는 최신 local 구조 확인 후 결정.

---

# 15. 권장 튜닝 시작값

모두 gameplay playtest로 조정 가능.

```text
Guard A Burst warning ~0.60s
Guard A interval ~0.25s
Guard A weakpoint ~1.80s

Guard B warning ~0.55s
Guard B weakpoint ~1.50s

body damage efficiency ~20–30%

Hub Beam warning ~0.75s
Hub Beam active ~0.60s
Hub Burst warning ~0.55s
Hub Burst active ~0.35s
Hub Core open ~2.20s

victory slowmo ~0.20s
```

HP/knockback/speed는 개발자 튜닝.

---

# 16. 테스트 요구

## Unit

- persistent pursuit option does not change normal Pursuit default
- damage-awaken
- locked target does not track after warning
- fallback current-position attack
- recovery pursuit
- ACTIVE invulnerability
- weakpoint availability
- link persistence
- Hub shield rule
- Beam safe-direction filtering
- Burst safe-candidate count
- P3 pause/re-entry
- Core overlap impact dedupe

## Integration

- A skipped → A+B simultaneous
- A+B skipped → A+B+Hub simultaneous
- last Guard dies during Beam
- last Guard dies during Burst
- death after A only
- death after A+B
- Hub retry
- P3 exit during Beam telegraph
- P3 exit during Beam active
- P3 exit during Burst
- P3 exit during Core open
- Gate victory

## Regression

반드시:
- general Pursuit Drone unchanged
- Artillery Drone unchanged
- Boss01/02 unchanged
- stage savepoints unchanged outside Boss04
- multiplayer snapshot/restore deterministic
- RopeImpactAttack behavior unchanged

---

# 17. Definition of Done

Boss04는 다음이 모두 만족되어야 Runtime Implemented로 바꿀 수 있다.

- [ ] old Return/LOS logic 없음
- [ ] Guard A functional
- [ ] Guard B functional
- [ ] persistent chase across Boss04 zones
- [ ] simultaneous A+B supported
- [ ] simultaneous A+B+Hub supported
- [ ] Protection Link persistence
- [ ] Hub Beam/Burst/Core full loop
- [ ] P3 exit/re-entry
- [ ] safe respawn progression
- [ ] Guard death visuals
- [ ] Hub shutdown/Gate open
- [ ] single-player tests
- [ ] multiplayer deterministic tests
- [ ] Boss01/02 regression green
- [ ] map Rope QA green
