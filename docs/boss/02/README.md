# Boss 02 — 옥상 봉쇄 / RESIDENTIAL SECURITY PURSUER

> 상태: **DESIGN LOCKED / RUNTIME NOT IMPLEMENTED / CURRENT-CODE REUSE AUDITED**  
> GitHub main audit: `91e7aa833eead7cd473ced39bf206d969ee98e42`

이 README는 Boss02의 현행 상세 설계 권위다.

문서 역할:

- `BOSS-02-BRIEF.md`: 전투 핵심과 구현 우선순위
- `BOSS-02-COMPONENTS.md`: GitHub 현재 코드에서 실제 재사용·확장·신규 구현할 기능을 함수/클래스 단위로 명시
- `MAP-PREVIEW.html`: 공간·공격선·구조물 충돌·Rope 경로 QA

---

# 1. 역할과 위치

Boss02는 Sector02 `2-8` 완료 뒤 별도 Boss Stage다.

```text
2-8 FINAL STORY
→ CHECKPOINT
→ BOSS 02 ENTRY
→ RESIDENTIAL SECURITY PURSUER
→ BOSS 02 VICTORY
→ SECTOR 03 / CENTRAL EXCHANGE
```

Boss Timer와 Arena time-collapse는 사용하지 않는다.

핵심 전투 문법:

> **Boss의 강공격을 지정 건축물로 유도하고 Rope로 회피하면 Boss가 스스로 자세를 무너뜨리며 약점이 열린다.**

---

# 2. 공통 전투 계약

```text
CHASE
→ TELEGRAPH
→ TARGET / DIRECTION LOCK
→ ACTIVE ATTACK
→ VALID ARCHITECTURE HIT 또는 MISS
→ VALID HIT이면 BOSS STUN / WEAKPOINT EXPOSED
→ PLAYER COUNTER
→ RECOVERY
```

화면과 판정 계약:

```text
telegraph geometry
attack lock
Boss movement
active hazard collider
```

는 같은 mechanism state에서 파생한다.

---

# 3. 구조물 충돌 계약

Boss의 강공격이 현재 Phase에 지정된 surface와 충돌해야 약점이 열린다.

구조물은 파괴되지 않는다.

허용:

- dust
- shake
- crack decal
- spark
- impact sound

금지:

- surface 삭제
- collision 변경
- grappleable 변경
- platform 이동
- route 변경
- physics debris

현재 게임코드의 `PolygonCollider.firstSolidContactAlong()`이 반환하는 `surface.id`를 Boss02의 valid-surface rule이 해석한다.

---

# 4. Map

- Arena: **5600 × 2800**
- CENTRAL COURTYARD WRAP
- Route points: **28**
- Authored relations: **28**
- Max relation: **350.14px**
- Base Hook Reach: **400px**
- unintended non-edge `≤400px`: **0**

흐름:

```text
P1 Lower Alley + Upper Balcony
→ 3-step Safe Fire-Escape Ascent
→ P2 U-shaped Balcony Ring + Central Service Slab
→ 4-anchor Safe Balcony Spiral
→ P3 Three Roof Islands
→ Sector03 Exit
```

---

# 5. P1 — SIMPLE LOCK CHARGE

공간:

- Lower Alley
- Upper Balcony
- Anchor 8
- Recovery Deck 2

유효 구조물:

- Wall A
- Stairwell Wall B

공격:

```text
CHASE
→ WINDUP
→ PLAYER POSITION READ
→ DIRECTION LOCK
→ STRAIGHT CHARGE
→ HIT / MISS
```

약점:

**Rear Thruster / 6s**

진행 방향 반대쪽 rear corner에 노출한다.

---

# 6. P1 → P2

```text
FIRE-ESCAPE A
→ B
→ C
→ P2 BALCONY ENTRY
```

- 공격 없음
- hazard 없음
- Player는 기존 Rope traversal 사용
- Boss만 다음 combat 위치로 reposition

---

# 7. P2 — ROTATING GROUND SLAM

공간:

**U-shaped Balcony Ring + Central Service Slab**

- Balcony anchors 8
- Recovery Deck 2

가장 가까운 Balcony segment가 접근 방향을 결정한다.

공격:

```text
CENTRAL ORBIT
→ BALCONY PROXIMITY READ
→ APPROACH SIDE LOCK
→ ROTATION TELEGRAPH
→ INWARD ROTATION
→ GROUND SLAM
→ SLAB HIT / MISS
```

유효 구조물:

**Central Service Slab**

약점:

**Lower Stabilizer / 5s**

---

# 8. P2 → P3

```text
SPIRAL A
→ B
→ C
→ D
→ ROOF A
```

- 공격 없음
- hazard 없음
- Player는 기존 Rope physics 사용
- Boss는 Rooftop pursuit 위치로 reposition

---

# 9. P3 — DIAGONAL DIVE

공간:

Three Roof Islands.

유효 구조물:

- Water Tank
- Stairwell Head
- Heavy Vent Housing

공격:

```text
AERIAL CHASE
→ RISE
→ SENSOR TRACK 0.75s
→ DIVE LINE LOCK
→ CONFIRM 0.25s
→ DIAGONAL DIVE
→ HIT / MISS
```

약점:

**Central Sensor / 4s**

---

# 10. Player Combat

Boss02는 특정 Augment를 필수로 하지 않는다.

필수 클리어:

```text
Base Rope traversal
→ attack bait
→ valid architecture impact
→ Base Rope Impact counter
```

현재 게임의 ImpactTarget 경로가 허용하는 projectile/action/electrified-rope/collision-explosion도 counter에 사용할 수 있다.

단, 강화 공격으로 architecture-impact 기믹 자체를 생략할 수 없어야 한다.

---

# 11. 현재 게임코드 활용 원칙

구체적 파일/함수는 `BOSS-02-COMPONENTS.md`가 권위다.

핵심은 다음과 같다.

### 그대로 사용

- `BossStageDefinition` / `BossEncounterRuntime`
- `RopeImpactAttack`
- `ImpactTarget` / `ImpactTargetRegistry`
- `AugmentCombatRuntime`
- `KinematicPhysicsBody`
- `resolvePlayerCollisions()` / actor collision
- `PolygonCollider`
- `BossStageWorldRenderer`
- `applyPortalTransition()`

### 기존 코드 확장

- mechanism runtime factory 등록
- Boss authoring vocabulary / validator / catalog
- single-Boss world/runtime assumption
- Boss hazard type projection
- mechanism-supplied 2D presentation
- Boss02 renderer kinds
- `routeEdges` validation

### Boss02 전용 신규

- `ResidentialSecurityPursuitRuntime`
- valid architecture surface-ID rule
- Rotating Ground Slam state sequence
- Diagonal Dive state sequence
- safe phase reposition state

새 범용 combat/physics framework는 만들지 않는다.

---

# 12. Recovery

각 Phase Recovery Deck 2개.

목표:

```text
MISS / FALL
→ VISIBLE RECOVERY
→ MAIN COMBAT BAND
```

일반 실패는 Boss Stage 시작점 reset을 요구하지 않는다.

---

# 13. 안전지대 QA

반드시 검사:

P1:
- Upper Balcony
- Wall/Stairwell 위·뒤
- Boss 위
- Alley ends

P2:
- U-ring ends
- Slab 위/아래/옆
- Boss 위
- Courtyard corners

P3:
- Water Tank 뒤/위
- Stairwell Head 뒤/위
- Heavy Vent 뒤/위
- Roof edges
- Recovery decks
- Boss 아래

**한 위치에 정지하여 전체 공격 cycle을 반복 무효화할 수 없어야 한다.**

---

# 14. Release Gate

처음 플레이한 사람이 별도 설명 없이 다음을 읽어야 한다.

```text
Boss가 추격한다.
공격이 예고된다.
공격 방향이 고정된다.
Rope로 빠져야 한다.
지정 구조물 충돌이 성공했다.
약점이 열렸다.
지금 반격해야 한다.
```

그리고:

- 화면과 실제 판정 일치
- valid architecture hit만 weakpoint trigger
- 구조물 gameplay geometry 불변
- Base Rope clear
- no mandatory Augment
- no permanent safe spot
- phase transition safe
- current game systems reused before any new system is introduced
