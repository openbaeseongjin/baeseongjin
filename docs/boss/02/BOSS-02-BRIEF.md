# 보스 02 — 옥상 봉쇄 / 주거지역 보안 추격기

> **상태:** 기획 확정 / 런타임 미구현  
> **검토한 GitHub main:** `91e7aa833eead7cd473ced39bf206d969ee98e42`  
> **위치:** Sector 02 완료 → Boss 02 → Sector 03  
> **핵심 전투:** **보스의 강공격을 지정 건축물로 유도하고 Rope로 빠져나오면 보스가 스스로 자세를 무너뜨리고 약점이 열린다.**  
> **구현 상세:** `BOSS-02-COMPONENTS.md`

---

# 0. 개발자가 가장 먼저 볼 것

```text
보스 추격
→ 강공격 예고
→ 공격 방향/목표 고정
→ Rope 회피
→ 지정 건축물 충돌
→ 보스 기절
→ 약점 노출
→ 반격
```

3개 Phase가 모두 이 문법을 사용한다.

| Phase | 공격 | 유효 충돌 구조물 | 약점 | 노출 |
|---|---|---|---|---:|
| P1 | 직선 고정 돌진 | Wall A / Stairwell Wall B | Rear Thruster | 6초 |
| P2 | 회전 지면 강타 | Central Service Slab | Lower Stabilizer | 5초 |
| P3 | 대각선 급강하 | Water Tank / Stairwell Head / Heavy Vent Housing | Central Sensor | 4초 |

---

# 1. 최우선 구현

## 최우선 1 — 화면 공격과 실제 판정이 같아야 한다

```text
화면에 보이는 공격선
=
보스 실제 이동
=
실제 피해 collider
```

P1 돌진선, P2 강타 지점, P3 급강하선을 화면용과 판정용으로 따로 계산하지 않는다.

## 최우선 2 — 방향 고정 순간이 읽혀야 한다

모든 공격은:

```text
추격/대기
→ 공격 예고
→ 방향 또는 목표 고정
→ 실제 공격
→ 충돌/실패
→ 약점 노출 또는 회복
```

으로 구분한다.

**방향이 고정된 뒤에는 공격선이 Player를 다시 따라오지 않는다.**

## 최우선 3 — 지정 건축물 충돌 때만 약점을 연다

일반 바닥이나 엉뚱한 벽과의 충돌은 약점 개방 조건이 아니다.

## 최우선 4 — 영구 안전지대를 금지한다

Rope로 공격을 읽고 피하는 것은 정상 플레이지만:

```text
특정 구조물 위/뒤 또는 보스 위에 정지
→ 모든 공격 무시
```

는 허용하지 않는다.

---

# 2. 현재 게임코드에서 바로 활용할 핵심 기능

BRIEF에서는 코드 세부 구현을 길게 설명하지 않되, 실제 사용할 기반은 명확히 한다.

## 이동하는 보스 본체와 위험물

현재 코드:

`src/game/physics/KinematicPhysicsBody.js`

활용 기능:

- `setKinematicPosition()`
- `holdKinematicPosition()`
- `replaceCollider()`
- `collisionActor()`
- `snapshot()` / `restore()`

Boss02 본체와 이동형 공격 collider는 이 Kinematic body를 기반으로 만든다.

새 이동 물리 시스템을 만들지 않는다.

## Player와 보스 본체의 물리 접촉

현재 코드:

- `src/game/physics/PlayerCollision.js` → `resolvePlayerCollisions()`
- `src/game/physics/SurfacePhysicsMixin.js` → `resolveActorPhysics()`
- `src/game/physics/colliders/Collider.js` → `resolveActorCollider()`
- `src/game/physics/PlayerPhysicsDefinition.js` → `PHYSICS_ACTOR_KIND.BOSS`, `BOSS_HAZARD`

Boss02 본체를 기존 Actor collision 흐름에 등록한다.

이 흐름은 moving kinematic actor와 Player의 겹침 해소와 상대속도 기반 충돌 반응을 이미 처리한다.

따라서 **보스 위 안전지대를 막기 위한 별도 물리 엔진을 만들지 않는다.**

## 건축물 충돌

현재 코드:

`src/game/physics/colliders/PolygonCollider.js`

활용 기능:

- `firstSolidContactAlong()`
- `farthestSafePositionAlong()`
- `overlapsCollider()`

`firstSolidContactAlong()`은 최초 접촉한 `surface`를 반환한다.

Boss02는 이 `surface.id`를 현재 Phase의 유효 구조물 목록과 비교한다.

## P1 추격·방향 고정

현재 코드:

- `PursuitEnemyBehavior.js`
- `PursuitEnemyBehaviorStates.js`
- `EnemyBehaviorSupport.js`

활용할 문법/함수:

- `nearestTarget()`
- `directionBetween()`
- `frozenDirection()`
- `SEEK → WINDUP → DASH → RECOVER`
- WINDUP 진입 시 `dashDirection` 고정

일반 Enemy 클래스를 Boss에 직접 장착하지 않고, **이미 검증된 추격/고정 방향 문법과 helper를 Boss02 runtime에서 활용**한다.

## 고정 위치 예고 타이밍

현재 코드:

- `ArtilleryEnemyBehavior.js`
- `ArtilleryEnemyBehaviorStates.js`

현재 Artillery는 target position을 저장한 뒤 TELEGRAPH 시간이 끝나면 저장된 위치에서 공격한다.

이 **“목표 위치 저장 → 예고 → 저장된 위치에서 발동”** 계약을 P2 Slam 지점과 P3 Dive line lock 설계에 활용한다.

## 보스 체력·약점·몸체 감소 피해

현재 코드:

- `BossStageDefinition.js`
- `BossEncounterRuntime.js`

이미 존재:

- Participant 1~4 체력 scaling
- Phase health / floor
- `closedBodyDamageMultiplier`
- `weakFixedPercent`
- `applyImpact()`
- `applyHazardContact()`
- Phase complete
- retry / spectator
- snapshot / restore

Boss02 전용 HP 또는 weakpoint damage 시스템을 만들지 않는다.

## Player 공격 통합

현재 코드:

- `RopeImpactAttack.js`
- `ImpactTarget.js`
- `ImpactTargetRegistry.js`
- `AugmentCombatRuntime.js`
- `GameSimulation.js`

현재 Rope Impact, Action/Projectile, Electrified Rope, Collision Explosion이 기존 impact 경로로 처리된다.

Boss02 Body/Weakpoint도 같은 `ImpactTargetRegistry`를 사용한다.

---

# 3. P1 — Lower Alley / Simple Lock Charge

## 공격

```text
CHASE
→ WINDUP
→ PLAYER POSITION READ
→ DIRECTION LOCK
→ STRAIGHT CHARGE
→ STRUCTURE HIT / MISS
```

### 핵심 읽기

Player가 봐야 하는 것은 **돌진 방향 고정 순간**이다.

```text
방향 고정
→ 경고선 정지
→ Rope로 이탈
→ Boss가 구조물에 충돌
```

### 유효 구조물

- Wall A
- Stairwell Wall B

### 약점

**Rear Thruster**

- 진행 방향 반대쪽 rear corner
- 6초 노출

---

# 4. P2 — Central Courtyard / Rotating Ground Slam

## 공격

```text
CENTRAL ORBIT
→ 가까운 Balcony segment 판독
→ APPROACH SIDE LOCK
→ ROTATION TELEGRAPH
→ INWARD ROTATION
→ GROUND SLAM
```

Player의 정확한 좌표를 끝까지 추적하지 않는다.

가까운 Balcony segment는 **접근 방향 선택**에 사용하고 실제 약점 개방 충돌 지점은 항상 Central Service Slab이다.

### 유효 구조물

**Central Service Slab**

### 약점

**Lower Stabilizer**

- 하부 중앙
- 5초 노출

---

# 5. P3 — Three Roof Islands / Diagonal Dive

## 공격

```text
AERIAL CHASE
→ RISE
→ SENSOR TRACK 0.75s
→ DIVE LINE LOCK
→ CONFIRM 0.25s
→ DIAGONAL DIVE
```

### 핵심 읽기

```text
추적 중
→ 공격선이 Player를 따라 움직임

LOCK
→ 공격선 정지
→ 0.25초 확인
→ Rope 회피
```

실제 Dive는 고정된 선과 같은 trajectory를 사용한다.

### 유효 구조물

- Water Tank
- Stairwell Head
- Heavy Vent Housing

### 약점

**Central Sensor**

- 상부 중앙
- 4초 노출

---

# 6. 구조물 규칙

보스 충돌 후에도 구조물 gameplay state는 바뀌지 않는다.

유지:

- geometry
- collision
- grappleable
- platform 위치
- route

허용 연출:

- 먼지
- 진동
- surface crack decal
- spark
- impact sound

금지:

- 구조물 삭제
- collider 변경
- grappleable 변경
- 파편 physics
- 경로 개폐

---

# 7. 안전지대 QA

## P1

검사:

- Upper Balcony 특정 지점
- Wall A 상단/뒤
- Stairwell Wall B 상단/뒤
- Boss body 위
- Alley 끝 모서리

## P2

검사:

- U-shaped Balcony 양 끝
- Central Service Slab 위/아래/옆
- Boss body 위
- Courtyard 모서리

## P3

검사:

- Water Tank 뒤/위
- Stairwell Head 뒤/위
- Heavy Vent Housing 뒤/위
- Roof edge
- Recovery Deck
- Boss 바로 아래

**한 지점에서 움직이지 않고 공격 cycle 전체를 반복 무효화할 수 없어야 한다.**

---

# 8. Player 공격 계약

필수 클리어 방식:

```text
Base Rope traversal
→ Boss attack 유도
→ valid architecture impact
→ Base Rope Impact counter
```

특정 Augment는 필수가 아니다.

기존 combat pipeline이 허용하는 Rope Impact / projectile / action impact / electrified rope / collision explosion은 Boss02 weakpoint counter에 사용할 수 있다.

단, 공격 강화가 **architecture impact → weakpoint exposure** 기믹을 생략하게 해서는 안 된다.

---

# 9. Phase 전환

## P1 → P2

- Fire-Escape 3-step 상승
- Boss attack 없음
- Boss hazard 없음
- Boss는 다음 combat 위치로 reposition

## P2 → P3

- Balcony Spiral 4-anchor 상승
- Boss attack 없음
- Boss hazard 없음
- Boss는 Rooftop pursuit axis로 reposition

Player traversal은 현재 Rope/Player physics를 그대로 사용한다.

---

# 10. Map 계약

- Arena: **5600 × 2800**
- Route point: **28**
- Authored relation: **28**
- 최대 relation: **350.14px**
- Base Hook Reach: **400px**
- 비의도 non-edge `≤400px` shortcut: **0**
- Recovery Deck: Phase당 2개 / 총 6개

---

# 11. 완료 기준

처음 플레이하는 사람이 설명 없이 다음을 이해해야 한다.

```text
Boss가 나를 추격한다.
곧 강공격이 온다.
공격 방향이 고정됐다.
지금 Rope로 빠져야 한다.
지정 구조물에 충돌하면 Boss가 무너진다.
약점이 열렸다.
지금 반격해야 한다.
```

그리고:

- 화면 공격과 실제 판정 일치
- 지정 구조물 충돌만 weakpoint trigger
- 구조물 비파괴
- 영구 안전지대 없음
- Base Rope clear
- 특정 Augment mandatory 없음
- Phase transition safe
- 기존 코드로 해결 가능한 기능을 별도 시스템으로 재구현하지 않음
