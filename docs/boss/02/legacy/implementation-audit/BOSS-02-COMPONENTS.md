> LEGACY — 인터뷰 확정 전 구현 감사 자료이며 현재 기획 권위가 아니다.

# 보스 02 — GitHub 게임코드 재사용 / 확장 / 신규 구현 인계

> **검토한 main:** `91e7aa833eead7cd473ced39bf206d969ee98e42`  
> **목적:** Boss02 구현자가 현재 게임코드에서 무엇을 실제로 재사용할지 함수·클래스 단위로 확인한다.  
> **주의:** 다른 보스의 구현을 복사한다는 의미가 아니다. **현재 코드베이스의 공용 전투·물리·보스·렌더 시스템을 직접 활용**한다.

---

# 0. 결론

## 현재 코드 그대로 활용

- Boss HP / Phase / multiplayer scaling / retry
- Rope Impact
- ImpactTarget registry
- Augment combat damage/defense
- Kinematic actor movement
- Actor-vs-Player collision response
- Polygon/world surface collision
- target selection / direction helper
- common Boss HUD / World renderer
- portal transition reset

## 기존 공용 코드를 확장

- Boss mechanism factory registration
- Boss authoring enums / validator / catalog
- single-boss world/runtime assumption
- Boss hazard type projection
- 2D mechanism-supplied presentation
- Boss02 renderer kinds
- branched routeEdges validator

## Boss02 전용으로 새로 구현

- `ResidentialSecurityPursuitRuntime`
- valid architecture surface-ID rule
- P2 rotating slam state sequence
- P3 diagonal dive state sequence
- safe inter-phase reposition state

## 새 범용 시스템

**필요 없음.**

---

# 1. Boss HP / Phase / Weakpoint Damage

## 현재 코드

`src/game/boss/BossStageDefinition.js`

활용:

- `BossStageDefinition`
- `defineBossStage()`
- `scaledBossPhaseHealth()`
- `roundBossHealth()`
- `closedBodyDamageMultiplier`
- `weakFixedPercent`

현재 이미:

```text
1~4 participants
→ Phase HP scaling
→ phase floors
```

이 존재한다.

`closedBodyDamageMultiplier`도 현재 공용 Boss definition에 포함되어 있으므로 약점이 닫힌 몸체 피해를 별도 Boss02 피해 시스템으로 만들 필요가 없다.

## 현재 코드

`src/game/boss/BossEncounterRuntime.js`

활용:

- `start()`
- `applyImpact()`
- `applyDamage()`
- `advance()`
- `applyHazardContact()`
- `handlePlayerDefeat()`
- `snapshot()`
- `restore()`

현재 `applyImpact()`가:

```text
targetId
→ mechanism.isWeakpointActive(targetId)
→ closed body multiplier 또는 full normal damage
→ weak fixed bonus
→ Phase floor
→ Phase complete / Boss complete
```

를 이미 처리한다.

### Boss02에서 필요한 확장

현재 `snapshot()` 안의:

```text
phaseIndex === 2 && mechanism.beamFailed
```

같은 특정 mechanism 전제가 공용 Boss runtime에 남아 있다.

Boss02를 위해 **persistent vulnerability 여부를 mechanism snapshot 또는 공용 vulnerability contract에서 제공하도록 일반화**한다.

---

# 2. Base Rope Impact

## 현재 코드

`src/game/combat/RopeImpactAttack.js`

활용:

- `RopeImpactAttack.advance()`
- `ropeImpactDamageForSpeed()`

현재 처리:

```text
Rope attached
+
minimum speed 충족
+
ImpactTarget overlap
+
같은 overlap의 반복 타격 방지
→ impact event
```

Boss02 weakpoint counter도 그대로 이 흐름을 사용한다.

새 Boss02 Rope attack class는 만들지 않는다.

---

# 3. Boss Body / Weakpoint를 Combat Target에 연결

## 현재 코드

`src/game/combat/ImpactTarget.js`

활용:

- `IMPACT_TARGET_KIND.BOSS`
- `ImpactTarget`
- `createImpactDamage()`
- `scaledWeakpointDamage()`

`src/game/combat/ImpactTargetRegistry.js`

활용:

- `register()`
- `find()`
- `activeSnapshots()`
- `resolve()`

`GameSimulation.#registerBossImpactTargets()`는 현재 Boss body actor ID와 각 Phase `weakTargetId`를 `ImpactTargetRegistry`에 등록한다.

Boss02도:

- Body
- Rear Thruster
- Lower Stabilizer
- Central Sensor

를 같은 registry에 등록한다.

### 확장 필요

현재 `GameSimulation.#bossImpactSnapshot()`은 presentation에서 `boss-carriage`를 찾는 전제가 남아 있다.

이 부분은 **mechanism이 제공하는 Boss body / active weakpoint world position과 collider를 소비하도록 일반화**한다.

---

# 4. Player Action / Projectile / Rope Augment

## 현재 코드

`src/game/augments/AugmentCombatRuntime.js`

활용:

- `advance()` — action runtime과 action projectile
- `observeAttachedRope()` — Electrified Rope
- `collisionExplosionEvents()` — Collision Explosion
- `absorbPlayerDamage()` — Guard/Shield 계열 incoming damage 처리
- `snapshot()` / `restore()`

현재 impact event는 `sourcePlayerId`, `targetId`, `sourceKind`, `damage`, contact position을 가진 공용 event로 나온다.

`GameSimulation.resolveAugmentImpactClaim()`과 현재 Boss ImpactTarget 경로를 통해 Boss02에 합류시킨다.

Boss02 전용 projectile 또는 augment resolver를 만들지 않는다.

---

# 5. 이동하는 Boss Body — KinematicPhysicsBody 직접 활용

## 현재 코드

`src/game/physics/KinematicPhysicsBody.js`

Boss02에서 가장 중요한 재사용 대상이다.

활용:

- `setKinematicPosition(position, dt)`
- `holdKinematicPosition()`
- `replaceCollider()`
- `collisionActor(offset)`
- `snapshot()`
- `restore()`

현재 `KinematicPhysicsBody`는:

- kinematic position
- velocity 자동 계산
- collider
- collision restitution
- actor snapshot

을 이미 제공한다.

### Boss02 적용

Boss body:

```text
KinematicPhysicsBody
actorKind = PHYSICS_ACTOR_KIND.BOSS
```

필요 시 active attack collider:

```text
KinematicPhysicsBody
actorKind = PHYSICS_ACTOR_KIND.BOSS_HAZARD
```

P1 Charge, P2 Slam, P3 Dive의 이동 collider를 새 physics object 체계로 만들지 않는다.

---

# 6. Boss 위 안전지대 / Boss-Player 물리 접촉

## 현재 코드

`src/game/physics/PlayerCollision.js`

- `resolvePlayerCollisions()`

`src/game/physics/SurfacePhysicsMixin.js`

- `resolveActorPhysics()`
- `resolveSurfaceActors()`
- `carryActorCollisionVelocity()`
- `queueSurfaceDisplacement()`

`src/game/physics/colliders/Collider.js`

- `resolveActorCollider()`

`src/game/physics/PlayerPhysicsDefinition.js`

- `PHYSICS_ACTOR_KIND.BOSS`
- `PHYSICS_ACTOR_KIND.BOSS_HAZARD`

현재 `KinematicPhysicsBody.collisionActor()`는 `canGroundActors = false`를 전달한다.

따라서 Player가 Boss를 정상 플랫폼처럼 밟아 grounded 되는 기능을 새로 만들 이유가 없다.

`GameSimulation.#bossCollisionActors()`가 mechanism의 `collisionActors()`를 Player collision actor 목록에 넣고 있고, broad phase의 `neutralActors`에도 등록한다.

### Boss02 적용

`ResidentialSecurityPursuitRuntime.collisionActors()`에서 Boss body를 계속 반환한다.

그 결과:

```text
Player ↔ moving Boss overlap
→ 기존 resolveActorCollider()
→ penetration 해소
→ relative velocity impulse
→ Boss를 바닥처럼 grounding하지 않음
```

이 흐름을 이용한다.

**Boss 위 체류 방지용 별도 범용 시스템은 만들지 않는다.**

QA에서 실제로 영구 체류가 남는 경우에만 collider shape/position 또는 restitution을 Boss02 tuning으로 조정한다.

---

# 7. Boss가 건축물에 충돌하는 계산

## 현재 코드

`src/game/physics/colliders/PolygonCollider.js`

활용:

- `firstSolidContactAlong(start, delta, surfaces)`
- `farthestSafePositionAlong({ start, direction, distance, surfaces })`
- `overlapsCollider()`

`firstSolidContactAlong()`은 결과에:

```text
amount
surface
contact.normal
contact.penetration
```

을 제공한다.

`farthestSafePositionAlong()`은:

```text
position
blocked
surfaceId
```

를 제공한다.

### Boss02 적용

P1/P2/P3 active movement에서:

```text
Boss start position
+
이번 tick 이동 delta
+
Boss collider
+
Boss Stage collision surfaces
→ firstSolidContactAlong()
```

으로 최초 건축물 접촉을 구한다.

그 뒤:

```text
hit.surface.id
```

를 Phase별 valid surface IDs와 비교한다.

따라서 **새 collision math나 architecture hit engine은 만들지 않는다.**

새로운 것은 surface ID를 gameplay success로 해석하는 Boss02 규칙뿐이다.

---

# 8. P1 추격 / 방향 고정에서 활용할 현재 코드

## 현재 코드

`src/game/combat/enemy-behavior/PursuitEnemyBehavior.js`

`src/game/combat/enemy-behavior/states/PursuitEnemyBehaviorStates.js`

현재 상태 문법:

```text
SEEK
→ WINDUP
→ DASH
→ RECOVER
```

특히 `PursuitSeekState`는 trigger 거리에서 WINDUP으로 바뀌면서:

```text
behavior.dashDirection = direction
```

으로 방향을 고정한다.

`PursuitDashState`는 그 고정된 `dashDirection`으로만 이동한다.

## helper

`src/game/combat/enemy-behavior/EnemyBehaviorSupport.js`

활용:

- `nearestTarget()`
- `directionBetween()`
- `frozenDirection()`
- `clamp()`

### Boss02 적용

P1은 이 target selection / direction lock contract를 이용한다.

일반 `PursuitEnemyBehavior` 객체를 Boss actor에 직접 장착하지 않는다.

Boss02 mechanism runtime이 encounter/weakpoint/architecture impact를 소유하면서 위 helper와 동작 계약을 활용한다.

---

# 9. P2/P3 목표 고정 예고에서 활용할 현재 코드

## 현재 코드

`src/game/combat/enemy-behavior/ArtilleryEnemyBehavior.js`

`src/game/combat/enemy-behavior/states/ArtilleryEnemyBehaviorStates.js`

현재 Artillery:

```text
IDLE
→ targetPosition 저장
→ TELEGRAPH
→ 저장된 position에서 STRIKE
→ COOLDOWN
```

즉 예고 중 목표를 계속 수정하지 않는 **locked target position** 계약이 이미 있다.

### Boss02 적용

P2:

```text
Balcony proximity read
→ approach side / slam target lock
→ telegraph
→ locked slab point로 commit
```

P3:

```text
0.75s track
→ dive line lock
→ 0.25s confirm
→ locked direction으로 dive
```

에 같은 timing/lock 원칙을 적용한다.

Artillery class 자체를 Boss에 장착하지 않고 공용적인 target-position-lock pattern을 활용한다.

---

# 10. P2 회전 계산에서 활용할 현재 코드

## 현재 코드

`src/game/combat/enemy-behavior/ShieldEnemyBehavior.js`

현재 `advance()`에는:

- `currentAngle`
- `desiredAngle`
- `atan2(sin(delta), cos(delta))` angle wrapping
- angular acceleration clamp
- angular speed clamp
- overshoot 방지

가 이미 구현되어 있다.

### Boss02 적용

P2 Rotating Ground Slam의 시각적/물리적 orientation 보간에 같은 회전 계산을 재사용하거나 공용 helper로 추출한다.

Shield guard 자체를 재사용하는 것이 아니라 **이미 검증된 angular tracking 계산**을 이용한다.

---

# 11. Boss Mechanism Runtime 연결

## 현재 코드

`src/game/boss/BossMechanismRuntimeFactory.js`

현재 factory는 mechanism ID → Runtime class를 생성한다.

Boss02 추가:

```text
residential-security-pursuit
→ ResidentialSecurityPursuitRuntime
```

## 신규 파일

권장:

`src/game/boss/ResidentialSecurityPursuitRuntime.js`

이 Runtime이 가져야 할 공용 contract:

- `reset(phaseIndex)`
- `advance(dt)`
- `completePhase(nextPhaseIndex)`
- `stop()`
- `isWeakpointActive(targetId)`
- `collisionActors(offset)`
- `snapshot()`
- `restore(snapshot)`

이 메서드들은 현재 `BossEncounterRuntime`과 `GameSimulation`이 mechanism에 기대하는 실제 계약에 맞춘다.

---

# 12. Boss02 Runtime 내부 상태

## P1

```text
CHASE
→ WINDUP
→ DIRECTION_LOCK
→ CHARGE
→ IMPACT / MISS
→ EXPOSED
→ RECOVER
```

## P2

```text
COURTYARD_ORBIT
→ BALCONY_READ
→ APPROACH_LOCK
→ ROTATION_TELEGRAPH
→ ROTATING_APPROACH
→ SLAM
→ IMPACT / MISS
→ EXPOSED
→ RECOVER
```

## P3

```text
AERIAL_CHASE
→ RISE
→ SENSOR_TRACK
→ DIVE_LINE_LOCK
→ CONFIRM
→ DIVE
→ IMPACT / MISS
→ EXPOSED
→ RECOVER
```

## Phase transition

```text
PHASE_TRANSITION
attack disabled
hazard disabled
Boss reposition
```

---

# 13. Architecture Impact의 신규 범위

새로 만드는 것은 collision이 아니라 **ID 판정 규칙**이다.

## P1

- `boss-02:p1:wall-a`
- `boss-02:p1:stairwell-wall-b`

## P2

- `boss-02:p2:central-service-slab`

## P3

- `boss-02:p3:water-tank`
- `boss-02:p3:stairwell-head`
- `boss-02:p3:heavy-vent-housing`

처리:

```text
PolygonCollider first contact
→ surface.id
→ currentPhase.validSurfaceIds.has(surface.id)
    true  → expose weakpoint
    false → miss / normal collision
```

Structure 자체는 mutate하지 않는다.

---

# 14. Boss Hazard / Player Damage

## 현재 코드

`GameSimulation.#resolveBossHazardContacts()`

현재 이미:

```text
Boss collision actor
→ Player collidedWithActor
→ contact ID dedupe
→ BossEncounterRuntime.applyHazardContact()
→ player.augmentCombat.absorbPlayerDamage()
→ HP / invulnerability / participant defeat
```

흐름을 가진다.

### Boss02 확장

현재 hazard kind가 `sweep`, `ram` 중심으로 고정되어 있으므로:

- `charge`
- `ground-slam`
- `diagonal-dive`

를 mechanism이 제공하는 active hazard actor/state로 일반화한다.

Player damage/guard/retry 흐름 자체는 그대로 사용한다.

---

# 15. Boss Stage entry / exit

## 현재 코드

`GameSimulation.applyPortalTransition()`

현재:

- player physics reset
- Rope detach
- aim/candidate reset
- portal transition state 기록

을 수행한다.

Boss02 entry/exit도 이 기존 transition을 사용한다.

Phase 내부의 Fire-Escape / Balcony Spiral 이동은 portal이 아니라 실제 Rope traversal이다.

---

# 16. Authoring Spec 확장

## 현재 코드

`src/game/boss-authoring/BossStageSpec.js`

현재 공용 구조로 이미 사용 가능한 것:

- `boss-stage-spec-v2`
- combat scaling
- closed body multiplier
- phase health
- arena
- mechanics
- HUD

확장할 enum/authoring vocabulary:

- Boss02 mechanic types
- Boss02 visual preset
- Boss02 weakpoint IDs
- architecture-impact vulnerability trigger
- Boss02 victory presentation

## 현재 코드

`BossStageSpecValidator.js`

현재 validator가 mechanic / visual / vulnerability / transition 값을 등록 목록으로 검증한다.

Boss02 값 추가와 `routeEdges` 검증을 확장한다.

### 현재 Route 문제

현재 `validateArena()`는 anchors 배열에서:

```text
anchors[i] → anchors[i+1]
```

만 authored edge로 본다.

Boss02는 분기/재합류 맵이므로:

```text
arena.routeEdges[]
```

를 추가하고 명시 edge 기반으로 거리/shortcut/connectivity를 검증한다.

---

# 17. Catalog / Definition

## 현재 코드

`src/game/boss-authoring/BossStageCatalog.js`

현재 generated stage spec catalog가 존재한다.

Boss02 generated spec을 같은 catalog에 등록한다.

## Definition

`BossStageDefinition.defineBossStage()`를 사용해 Boss02 definition을 만든다.

새 definition framework를 만들지 않는다.

---

# 18. 현재 Single-Boss 가정 일반화

이 부분은 Boss02 구현에 반드시 필요하다.

## `LegacyAreaSeamlessSectorRuntime.js`

현재 함수 입력이:

```text
bossStageSpec = ...
```

단일 spec이다.

또 transition 삽입도 단일 `bossStageSpec.sourceAreaId / nextAreaId`를 비교한다.

### 확장

```text
bossStageSpecs[]
```

collection을 받아 각 inter-Sector transition에 맞는 Boss Stage를 등록하도록 일반화한다.

## `GameSimulation.js`

현재 constructor도 singular:

```text
bossDefinition = ...
this.bossRuntime = new BossEncounterRuntime(bossDefinition)
```

전제다.

### 확장

현재 world의 active Boss Stage ID에 맞는 definition/runtime을 선택하도록 일반화한다.

새 Boss combat framework를 만드는 것이 아니라 **현재 BossEncounterRuntime을 stage별로 선택/생성할 수 있게 하는 확장**이다.

---

# 19. Presentation / Renderer

## 현재 공용으로 재사용

`src/render/boss/BossStageWorldRenderer.js`

현재:

```text
presentation.objects
→ bossPolygonObjectRenderer(kind)
→ draw()
```

이므로 renderer dispatcher는 그대로 사용한다.

## 확장

`src/render/boss/BossStagePresentation.js`

현재 Boss HUD는 재사용 가능하다.

다만 world object fallback에는 carriage/beam/ram 전제가 있으므로 mechanism snapshot이 다음을 직접 공급하도록 일반화한다.

```text
bossPosition
bossDirection
presentationObjects[]
activeTargetId
activeTargetPosition
activeHazards[]
```

## `BossPolygonObjectRenderers.js`

현재 renderer interface를 유지하고 Boss02 kind를 추가한다.

예:

- `residential-pursuer`
- `charge-telegraph`
- `slam-telegraph`
- `dive-line`
- `architecture-impact`
- 기존 `weakpoint` 또는 Boss02 weakpoint variant

새 World renderer를 만들지 않는다.

---

# 20. 구현하지 말아야 할 것

- 새 Rope Impact 시스템
- 새 Boss HP 시스템
- 새 Weakpoint damage 시스템
- 새 Projectile 시스템
- 새 Augment resolver
- 새 Player damage/guard 시스템
- 새 Player-vs-Boss collision engine
- 새 architecture collision math
- 구조물 destruction system
- debris physics
- Boss02 전용 multiplayer participant manager
- 새로운 전체 Boss renderer pipeline

---

# 21. 개발 완료 체크

## 코드 재사용

- [ ] `BossStageDefinition`의 scaling/damage policy 사용
- [ ] `BossEncounterRuntime`의 lifecycle/phase/retry/snapshot 사용
- [ ] `RopeImpactAttack` 사용
- [ ] `ImpactTargetRegistry` 사용
- [ ] `AugmentCombatRuntime` impact/defense 사용
- [ ] `KinematicPhysicsBody`로 Boss body/hazard movement 구현
- [ ] `resolvePlayerCollisions` 공용 actor collision 사용
- [ ] `PolygonCollider.firstSolidContactAlong()`으로 architecture contact 계산
- [ ] `PursuitEnemyBehavior`의 direction-lock 문법/helper 활용
- [ ] Artillery의 locked-target telegraph 문법 활용
- [ ] `BossStageWorldRenderer` 유지
- [ ] `applyPortalTransition()` 유지

## 신규 범위 제한

- [ ] Boss02 mechanism runtime만 신규
- [ ] valid surface ID gameplay rule만 신규
- [ ] P2 Slam state sequence 신규
- [ ] P3 Dive state sequence 신규
- [ ] Phase-transition reposition state 신규
- [ ] 새 범용 physics/combat framework 없음

## 전투 QA

- [ ] P1 charge line = actual trajectory = damage actor
- [ ] P2 approach/slam marker = actual slam
- [ ] P3 dive line = actual trajectory
- [ ] valid surface collision만 weakpoint 노출
- [ ] 구조물 geometry/collision/grapple state 변화 없음
- [ ] Boss 위/구조물 위/뒤 영구 안전지대 없음
- [ ] Base Rope clear
- [ ] 특정 Augment mandatory 없음
- [ ] Phase transition 중 attack/hazard 없음
