# BOSS 04 — COMPONENTS
## FINAL IMPLEMENTATION COMPONENT SPEC

> 상태: **DESIGN LOCKED / RUNTIME IMPLEMENTATION PENDING**
> AUTHORING SNAPSHOT: GitHub `main` `3301269a4de30f54a71a4361c3f9fc7f665a93cb` (2026-08-23 기준). 현재 main과 Runtime 연결 상태는 `docs/scenario-development-integration.md`가 소유한다.
> 목적: 개발자가 무엇을 **그대로 재사용하고**, 무엇을 **최소 확장하며**, 무엇을 **Boss04 전용으로 새로 구현해야 하는지** 구분한다.

---

# 1. 구현 분류 원칙

모든 Boss04 구성은 아래 4종 중 하나로 분류한다.

1. **[기존 그대로 사용]**
2. **[기존 기능 확장]**
3. **[Boss04 전용 신규]**
4. **[신규 범용 시스템 금지]**

Boss04 때문에 기존 일반 적/보스 동작을 전역 변경하지 않는다.
필요한 새 동작은 option/config 또는 Boss04 coordinator에서 한정한다.

---

# 2. 기존 그대로 사용하는 시스템

## 2.1 Rope Impact

**파일**
- `src/game/combat/RopeImpactAttack.js`

**유지**
- rope attached 필요
- minimum impact speed 필요
- overlap 진입 시 1회 impact
- 겹친 채 계속 접촉하면 반복 impact 없음
- 분리 후 새 충돌 시 새 impact 가능

**Boss04 사용**
- Guard body
- Guard weakpoint
- Hub Core

Hub Core 복수타격을 위해 별도 rapid-contact damage system을 만들지 않는다.

---

## 2.2 일반 Enemy HP / 사망 판정

**파일**
- `src/game/combat/PlayerEnemyImpactResolver.js`
- `src/game/combat/EnemyObject.js`

**유지**
- health 감소
- health <= 0 defeat
- impact feedback
- existing network/snapshot contract

**Boss04 사용**
- Guard A
- Guard B

Guard HP를 BossEncounterRuntime 하나에 억지로 합치지 않는다.

---

## 2.3 Impact Target Registry

**파일**
- `src/game/combat/ImpactTarget.js`
- `src/game/combat/ImpactTargetRegistry.js`

**Boss04 권장 target IDs**
```text
boss04:guard-a:body
boss04:guard-a:rear-thruster
boss04:guard-b:body
boss04:guard-b:side-controller
boss04:hub:body
boss04:hub:core
```

실제 ID 네이밍은 repository naming convention에 맞춰 조정 가능.

---

## 2.4 Enemy activation

**파일**
- `src/game/combat/EnemyActivationState.js`

**유지**
- activation bounds 진입 시 `awakened = true`
- 한번 awakened 되면 일반적인 observe 과정에서 다시 false로 돌아가지 않음
- snapshot/restore에서 awakened 보존

Boss04의 “한번 발각되면 계속 활성” 상태 기반으로 재사용한다.

---

## 2.5 기본 Pursuit 상태기계

**파일**
- `src/game/combat/enemy-behavior/PursuitEnemyBehavior.js`
- `src/game/combat/enemy-behavior/states/PursuitEnemyBehaviorStates.js`
- `src/game/combat/enemy-behavior/EnemyBehaviorSupport.js`

**기존 상태**
```text
SEEK
→ WINDUP
→ DASH
→ RECOVER
→ SEEK
```

**재사용**
- target acquisition
- direction calculation
- chase movement primitives
- fixed dash direction
- timed state transition
- snapshot/restore

---

## 2.6 Artillery fixed-position strike contract

**파일**
- `src/game/combat/enemy-behavior/ArtilleryEnemyBehavior.js`
- `src/game/combat/enemy-behavior/states/ArtilleryEnemyBehaviorStates.js`

**기존 계약**
```text
target 선택
→ targetPosition snapshot
→ TELEGRAPH
→ snapshot 좌표에 STRIKE
→ COOLDOWN
```

Guard A Burst의 “warning 뒤 재추적 금지” 기반으로 재사용한다.

---

## 2.7 Respawn / Stage Save Point

**파일**
- `src/game/world/StageSavePointGeometry.js`
- `src/game/simulation/GameSimulation.js`

**기존 기능**
- `respawnAnchorId`
- `setPlayerRespawnAnchor()`
- `updatePlayerStageSavepoint()`
- Stage Save Point overlap
- seamless-sector respawn anchor

**Boss04 사용**
- P1 이전
- Refuge Landing
- P3 이전

새 Boss04 전용 checkpoint framework를 만들지 않는다.

---

## 2.8 Sector progress persistence

**파일**
- `src/game/world/SectorProgressState.js`

**기존 기능**
- resolved encounter
- completed objective
- snapshot/restore
- route/access progress persistence

Guard 처치 완료 상태 및 Link OFF persistence를 이 계열과 연결한다.

---

## 2.9 Boss encounter damage/hazard framework

**파일**
- `src/game/boss/BossEncounterRuntime.js`

**기존 기능**
- Boss status
- health
- impact deduplication
- weakpoint damage multiplier/bonus
- hazard contact
- phase/boss completion event
- snapshot/restore

Central Security Hub의 체력/impact authority에 재사용한다.

---

## 2.10 Boss presentation

**파일**
- `src/render/boss/BossStagePresentation.js`

**유지**
- world presentation object
- hazard kind/state
- active/damaging
- weakpoint exposed/secured
- HUD health/vulnerability data

Boss04용 presentation kind만 확장한다.

---

# 3. 기존 기능 확장

## 3.1 Pursuit — activation leash 해제 option

### 현재 문제

`EnemyBehaviorSupport.eligibleTargets()`는 activation 영역 내부 target을 우선하고,
`moveInDirection()`은 activation bounds 밖으로 destination을 clamp한다.

따라서 현재 Pursuit 그대로면 Boss04 Guard가 P1/P2 경계를 넘어 추격할 수 없다.

### 확장 요구

Boss04 Guard에만 적용 가능한 config/option을 추가한다.

개념:

```text
respectActivationAfterAwaken = false
movementLeashAfterAwaken = false
```

정확한 API 이름은 개발자가 기존 style에 맞춰 결정.

### 금지

- 일반 Pursuit Drone의 기존 activation behavior 변경
- 전역 기본값 false 변경

---

## 3.2 선제공격 발각

### 요구

미발각 Guard가 유효한 Player Impact를 받으면:

```text
damage 적용
→ awaken
→ pursuit 시작
```

현재 activation 관찰 외에 공격을 통한 명시적 awaken route가 필요하다.

### 권장

`EnemyActivationState` 또는 EnemyObject 수준에 작은 explicit activation API를 추가.

신규 범용 aggro system을 만들지 않는다.

---

## 3.3 Guard recovery chase

현재 `PursuitRecoverState`는 이동 없이 timer만 소비한다.

Boss04 Guard는:

```text
RECOVER
+ weakpoint active
+ low-speed pursuit
```

이 필요하다.

### 구현 방향

기존:
- `directionBetween()`
- `moveInDirection()`
- nearest target selection

재사용.

Boss04 config가 있을 때만 RECOVER 이동.

일반 Pursuit는 현재 정지 recovery 유지.

---

## 3.4 Guard A multi-target Burst

기존 Artillery는 단일 targetPosition을 사용한다.

Boss04 A에는:

```text
landingCandidatePositions[]
lockedBurstPositions[]
burstIndex
```

등 Boss04 전용 state가 필요할 수 있다.

### 유지할 기존 계약

- telegraph 시작 시 좌표 lock
- 실제 strike가 warning area와 일치
- warning 이후 Player 위치 재추적 금지

### 차이

- 정상 상황: 2~3 target
- sequential strike
- candidate 없음: Player current position 1개 snapshot fallback

---

## 3.5 Guard B landing intercept Dash

기존 Pursuit Dash의 이동 실행을 재사용.

변경점:

현재:
```text
target current player position
→ direction
→ dash
```

Boss04:
```text
next reachable landing candidate
→ lock
→ dash
```

fallback:
```text
candidate 없음
→ current player position snapshot
→ lock
→ dash
```

Dash 시작 뒤 target 재추적 금지.

---

## 3.6 Guard ACTIVE invulnerability

Guard attack ACTIVE 동안 Player Rope Impact가 들어오더라도:

```text
accepted/feedback policy는 기존 pipeline과 정합성 유지
damage = 0
attack cancel = false
```

필요한 것은 **상태 기반 damage gate**이지 별도 HP system이 아니다.

---

## 3.7 Weakpoint target availability

Guard weakpoint collider/ImpactTarget은 회복 window와 정확히 동기화.

```text
RECOVER + exposed
→ active true

그 외
→ active false 또는 hit blocked
```

Visual state도 동일 authority snapshot에서 파생.

---

## 3.8 Enemy-team collision filter

현재 EnemyObject는 기존 physics pipeline을 사용한다.

Boss04 요구:
- Guard A ↔ Guard B 충돌 무시
- Guard ↔ Hub 충돌 무시
- friendly fire 없음

일반 enemy collision rule을 전역 제거하지 말 것.

Boss04 team/tag 또는 Boss04-specific actor filtering으로 최소 확장.

---

## 3.9 Boss runtime context 확장

현재 `GameSimulation.#advanceBossRuntime()` context는 확인 기준:

```text
players
surfaces
worldOffset
```

Hub Shield는 Guard 생존 여부가 필요하다.

Boss04에 필요한 최소 context:

```text
guardA defeated?
guardB defeated?
```

또는 동일 의미의 completed encounter/link state.

Hub Runtime이 직접 EnemyObject 배열 전체를 임의 탐색하는 결합은 피한다.

---

# 4. Boss04 전용 신규

## 4.1 Boss04 coordinator / mechanism

현재 `BossMechanismRuntimeFactory.js`에 등록된 mechanism은:

```text
rail-carriage
residential-security-pursuit
```

Boss04용 mechanism은 아직 없다.

### 필요

예시 명칭:

```text
upper-residential-security
```

정확한 이름은 repository convention에 맞춰 개발자 결정.

### 책임

오직 Boss04 고유 관계만 담당:

- Protection Link A
- Protection Link B
- Hub Shield
- P3 zone active/pause/re-entry
- Hub Beam
- Hub Landing Burst
- Hub Core open/close
- Hub shutdown
- Protected Gate victory signal

### 책임 아님

- Guard 이동 물리 재구현
- Rope Impact 재구현
- Player damage system 재구현
- checkpoint framework 재구현
- 일반 artillery system 재구현

---

## 4.2 Hub state machine

권장 상태:

```text
INACTIVE
SHIELDED_READY
BEAM_TELEGRAPH
BEAM_ACTIVE
BURST_TELEGRAPH
BURST_ACTIVE
CORE_EXPOSED
CYCLE_RECOVERY
PAUSED_OUTSIDE_P3
SHUTDOWN
```

세부 상태명은 code style에 맞춰 조정 가능.

---

## 4.3 Protection Link authority

```text
Guard A alive → Link A ON
Guard B alive → Link B ON

A dead → Link A OFF permanently
B dead → Link B OFF permanently

A/B both dead
→ Hub Shield OFF
```

현재 공격 cycle 진행 중 마지막 Guard 사망:

```text
Shield visual OFF
→ current Hub attack finishes
→ next valid Core window opens
```

공격 즉시 cancel 금지.

---

## 4.4 Hub P3 zone behavior

P3 최초 진입:
- activate Hub

P3 밖으로 나감:
- current Hub telegraph/attack cancel
- Core close
- Hub HP 유지
- Hub active status 유지
- Shield/Link 유지

재진입:
- fresh Beam cycle

Guard들은 P3 zone과 무관하게 계속 추격.

---

## 4.5 Beam direction safety selector

authored candidates:

```text
LEFT
RIGHT
UPPER
```

selector priority:

1. Hub Beam 단독으로 reachable safe route가 있는 방향만 valid
2. valid가 여러 개면 직전 방향 제외 우선
3. 직전 방향만 safe면 반복 허용

Guard hazard는 safety evaluation에 포함하지 않는다.

---

## 4.6 Hub Landing Burst selector

post-Beam Player state에서 reachable landing candidate 계산.

```text
>=3 valid → attack 2
2 valid → attack 1
1 valid → attack 0
```

Hub attack 단독 기준 최소 1 safe landing 유지.

2개 공격 시 simultaneous.

---

## 4.7 Hub Core

Core CLOSED:
- invulnerable

Core OPEN:
- impact target active
- multiple independent Rope Impact 허용
- continuous overlap repeated damage 금지 — 기존 RopeImpactAttack contract 사용

Core open 후 hit했다고 즉시 닫지 않음.
노출 timer 끝까지 유지.

---

## 4.8 Hub shutdown / Gate

Hub HP 0:

- current hazard stop
- warnings clear
- Core break
- Hub body remains
- Hub combat disabled
- Protected Gate unlock
- automatic open
- Sector05 sightline

별도 interact button 금지.

---

# 5. Presentation components

## Guard A

states:
- dormant
- pursuit
- burst-telegraph
- burst-active
- weakpoint-exposed
- defeated

visual:
- rear armor open/close
- thruster glow
- overheat/spark
- pursuit light

## Guard B

states:
- dormant
- pursuit
- dash-telegraph
- dash-active
- weakpoint-exposed
- defeated

visual:
- side panel open/close
- controller glow
- electric/spark
- pursuit light

## Hub

states:
- shielded
- beam-telegraph
- beam-active
- burst-telegraph
- burst-active
- core-exposed
- shutdown

visual:
- Link A/B status
- shield state
- Core secured/exposed
- warning direction
- gate state

---

# 6. 복원하는 기존 기획 구성요소

현재 Boss04는 아래 구성을 다시 사용한다.

- 추적 구역 이탈
- 시야 끊기
- 원위치 복귀
- 복귀 중 약점 노출
- P3 Guard A 복귀 / Guard B 발각 인계

P3 Guard 재활성화, Guard docking victory, Refuge Landing hard barrier와 두 Guard 공격 순서 제어는 계속 구현하지 않는다.

맵의 물리 topology와 Sector04 환경/스토리 테마는 유지 대상이다.

---

# 7. QA acceptance

## Guard

- [ ] detection 후 zone 밖에서도 pursuit 지속
- [ ] LOS로 aggro 해제되지 않음
- [ ] 선제 Rope Impact가 damage + detection 모두 발생
- [ ] A는 높은 위치 성격 유지
- [ ] B는 비슷한 높이 성격 유지
- [ ] 평상시 Player와 최소 간격 유지
- [ ] A Burst warning 뒤 target 이동 없음
- [ ] B Dash warning 뒤 target 이동 없음
- [ ] candidate 없는 공간에서도 fallback 공격 정상
- [ ] ACTIVE 완전 무적
- [ ] ACTIVE body only player damage
- [ ] recovery 중 low-speed pursuit
- [ ] weakpoint visual/collider exact sync
- [ ] weakpoint hit가 exposure timer를 연장하지 않음
- [ ] death 즉시 attack/collision 제거
- [ ] A/B friendly fire 없음
- [ ] A/B physical blocking 없음

## Hub

- [ ] P3 진입 시 Guard 생존 여부와 무관하게 활성
- [ ] Link ON이면 공격 가능 + Core CLOSED
- [ ] Link ON이면 Hub damage 0
- [ ] Beam direction lock
- [ ] Hub-only safe route guarantee
- [ ] Guard hazard가 Hub safety selector에 포함되지 않음
- [ ] Burst 후 최소 1 Hub-only safe landing
- [ ] Core OPEN에서만 damage
- [ ] distinct Rope Impact만 반복 damage
- [ ] P3 exit 시 current attack cancel
- [ ] re-entry fresh Beam
- [ ] final Guard death가 current Hub attack을 cancel하지 않음
- [ ] Hub death 즉시 hazard stop
- [ ] Gate automatic open

## Progress

- [ ] A 죽고 사망 → A dead/Link A OFF 유지
- [ ] B 죽고 사망 → A/B dead 유지
- [ ] live Guard HP는 death retry 시 reset
- [ ] Hub HP는 Hub retry 시 reset
- [ ] checkpoint는 이동 거리가 아니라 completed combat 기준
- [ ] Guard를 skip하면 checkpoint가 앞당겨지지 않음

---

# 8. Map contract

가능한 한 기존 authored topology 유지:

- approx planning bounds 5400×2500
- Base Hook Reach 400
- mandatory relations 21
- max mandatory relation 353.55
- unintended non-adjacent ≤400 shortcut 0

Runtime 요구 때문에 map 전면 재설계 금지.
