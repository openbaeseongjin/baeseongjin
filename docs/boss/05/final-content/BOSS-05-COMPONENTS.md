# BOSS 05 — 구성요소 / 런타임 구현 인계

> 상태: **설계 확정 · 현재 main 부분 구현 · 최종 기획 정합화 필요 · 플레이테스트 미검증**
>
> 최신 코드 점검 기준: `ea007998cef6168bfa4139d06f443eb444acfda5`

---

## 현재 `main` 기준 구현 상태

점검 기준: `20e6c22deb6e95d9a5a7e351a95874d931a0a845`

- `ContinuityControlCoreRuntime.js`: **존재**
- Boss05 Stage Spec / Catalog: **연결됨**
- A/B/Main/Core 공격 대상: **연결됨**
- Wall 동적 surface / Rope·Projectile 차폐: **기반 연결됨**
- Recovery/snapshot/final exit: **기반은 있으나 최종 기획에 맞춘 보강 필요**
- P3-A/P3-B, Pulse 반복, Slot collision, Main Aperture, 단계별 카메라: **수정 필요**

이 문서의 기존 “새로 구현” 표현은 이제 “기반은 존재하지만 최종 설계에 맞춰 수정/보강”으로 읽는다.
세부 수정 순서는 `BOSS-05-MAIN-AUDIT-IMPLEMENTATION-PLAN.md`를 따른다.

## 보스05 핵심 구성요소 — 구현 입력/출력 기준

아래 요소는 “무슨 역할인지”가 아니라 **런타임이 어떤 입력을 받고 어떤 상태를 바꿔야 하는지**로 정의한다.

### `ContinuityControlCoreRuntime`

입력:

- 현재 Boss Phase / subphase
- frame delta
- 각 Coupling HP / expose 상태
- 참가 Player 위치 / 생존 상태
- Void fall event
- Wall/Rope intersection event

출력:

- A/B/Main Wall 현재 위치
- Shutter 열림/닫힘
- 현재 Pulse Warning/Active 영역
- 활성 Boss target ID
- Core shell 단계
- Player별 Recovery 상태
- EXIT 활성 여부

### `A/B/Main Wall`

런타임 상태:

```text
stowed
warning
descending
locked
ascending
```

각 상태가 바뀔 때 collision surface와 renderer position을 같은 frame에 갱신한다.

### `Control Pulse`

런타임 상태:

```text
off
warning
active
gap
```

`warning`에서는 damage event를 만들지 않는다.
`active`에서만 현재 authored polygon 안 Player에게 hazard contact를 보낸다.

### Coupling

```text
closed
exposed
destroyed
```

`closed`일 때 ImpactTargetRegistry에 phase-progress target으로 등록하지 않는다.
`exposed`일 때만 기존 Boss impact 경로로 damage를 받는다.

### Recovery

Player별:

```text
active
reason
targetCell
```

Recovery 중에는 Boss05 위험 공격 피해만 무시한다. 현재 유효 Coupling/Core에는 정상 피해를 줄 수 있으며 Wall 차폐와 공격선 판정은 그대로 적용한다.
targetCell 진입 순간 `active=false`.

### Exit

Final Core defeat event 전에는 attachment candidate에 포함하지 않는다.
defeat event 후 EXIT-1/EXIT-2를 candidate에 추가하고 Rooftop Access를 open state로 바꾼다.

---

## 1. 구현 기본 원칙

```text
기존 기능 exact reuse
→ 기존 generic 경계 최소 확장
→ Boss05-specific runtime 추가
→ 신규 global system 최소화
```

**새 범용 게임 시스템을 만들지 않는다.**

---

## 2. 기존 코드에서 그대로 재사용할 부분

### Boss

- `BossStageDefinition`
- `BossEncounterRuntime`
- Boss participant scaling
- Boss snapshot/restore
- Boss HUD/presentation pipeline

### Combat

- `ImpactTargetRegistry`
- `RopeImpactAttack`
- existing player projectile flow
- `AugmentCombatRuntime`
- existing rope-cut transition

### Rope / Geometry

- Rope attachment/release
- `segmentIntersectsSurface()`
- `PolygonCollider`
- `CollisionBroadPhase`

### Render

- Boss Stage presentation
- Boss Stage world renderer
- polygon object renderer registry

---

## 3. 현재 Factory 상태

최신 점검 기준 Factory에는 현재:

```text
rail-carriage
residential-security-pursuit
```

가 등록되어 있다.

Boss05 추가:

```text
continuity-control-core
→ ContinuityControlCoreRuntime
```

---

## 4. 보스05 전용 Runtime

권장 파일:

```text
src/game/boss/ContinuityControlCoreRuntime.js
```

소유 상태:

- phase/subphase
- A/B/Main Wall state + position
- A/B/Main Slot Shutter
- Pulse warning/active/recovery
- current Pulse region
- Coupling exposure
- Core shell
- temporary hardpoint activation
- per-player Recovery state
- per-player Recovery target cell
- Final Exit deployment
- hazard sequence

---

## 5. Wall 정의

```text
A:    x 2020..2200
MAIN: x 2510..2690
B:    x 3070..3250

width = 180
slot width = 220
```

Wall surface:

```text
collision yes
grappleable false
ropeOccluder true
projectileOccluder true
```

Wall movement 중 Rope segment intersection:

```text
segmentIntersectsSurface(player↔anchor, wallSurface)
→ existing rope-cut transition
```

하강/상승 모두 적용.

Locked Wall은 신규 Hook/Projectile/attack을 차폐하지만
지속 Rope Cut event를 생성하지 않는다.

---

## 6. Slot / Shutter 상태

상태:

```text
closed
warning
open
closing
```

Wall Warning과 Shutter Warning을 같은 authored event chain에 둔다.

Open 전 슬롯 위 Player overlap 검사:

```text
resolve to nearest valid platform side
```

압사/아래 방향 강제 push 금지.

---

## 7. 움직이는 Wall 충돌 처리

Moving Wall은 frame마다 실제 position의 Polygon surface를 제공한다.

필수:

```text
render position == collision position
```

Broad phase에 stale surface가 남지 않게 한다.

Platform Slot은 Wall state와 Shutter state에 따라 현재 collision surface를 바꾼다.

---

## 8. Hook 경로 차단 확장

현재 Rope attachment의 특정 divider 차폐 로직을 Boss05 전용 kind로 위장하지 않는다.

권장 generic 확장:

```text
surface.ropeOccluder === true
```

이면 origin→candidate segment가 surface와 교차할 때 candidate를 거부한다.

---

## 9. 플레이어 Projectile 경로 차단 확장

현재 player projectile→Boss target 흐름은 재사용한다.

추가할 것:

```text
previousProjectilePosition
→ nextProjectilePosition
→ first Partition surface intersection
```

Boss target hit보다 Wall hit가 먼저면 projectile resolution을 Wall hit/blocked로 종료한다.

Wall 뒤 Coupling 원거리 우회 금지.

---

## 10. 보스 피해 대상 제한

Boss05 combat spec:

```text
closedBodyDamageMultiplier = 0
weakFixedPercent = 0
weakNormalDamageMultiplier = 1
```

active target:

```text
P1    aux-a-coupling
P2    aux-b-coupling
P3    main-coupling
FINAL central-core
```

inactive target/body/Wall/housing:

```text
phase damage = 0
```

---

## 11. Pulse 공격 판정

Pulse는 단순 VFX가 아니라 authored full-cell hazard polygon이다.

P2:

```text
right combat cell full height
INNER x<3750
OUTER x>=3750
```

P3-A:

```text
A/B between-cell full height
LEFT / RIGHT
P3-BRIDGE always included in active side
```

P3-B:

```text
each Main cell
UPPER y<840
LOWER y>=840
```

Warning collider는 damage를 내지 않는다.

Active collider만 Boss hazard contact를 만든다.

---

## 12. Main Aperture 처리

Main Wall FULL LOCK 시:

```text
visual aperture open
player collision remains blocked
main-coupling becomes attackable
```

좌/우 접근이 같은 target ID / 같은 HP를 사용한다.

두 HP 금지.

---

## 13. 중앙 Void 추락 복귀

Void fall detection 후:

```text
apply fall damage
```

생존:

```text
move to legal Entry Recovery position
set personalRecovery = true
```

사망:

```text
existing Boss/player defeat flow
```

Boss Phase는 유지한다.

Boss/Coupling 누적 damage도 유지한다.

P3-B:

```text
left player → left Entry Recovery
right player → right Entry Recovery
```

---

## 14. 개인 전용 복귀

per-player state:

```text
active
targetCell
reason
```

Recovery hardpoint는 해당 Player에게만 attachment candidate가 된다.

Recovery active 중 Boss05 hazard resolver:

```text
Pulse damage ignored
moving Wall contact damage ignored
Boss05 hazard damage ignored
```

하지만 collision/Rope physics는 정상이다.

legal combat cell 진입:

```text
personalRecovery = false
recovery hardpoints off
```

다른 Player에게는 보이지 않거나 attach 불가.

---

## 15. 멀티플레이 단계 전환

**생존 Player 한 명이 다음 ready region에 도착하면 Phase 전환을 시작한다.**

뒤처진 Player 때문에 transition을 hold하지 않는다.

transition 뒤 legal combat cell 밖에 남은 Player는 Personal Recovery로 합류시킨다.

Boss scaling은 중간에 다시 계산하지 않는다.

---

## 16. 임시 Hardpoint 비활성화

다음 hardpoint deactivate:

- CROSS
- P3-BRIDGE
- Recovery hardpoint
- Exit hardpoint

처리:

```text
new attach disabled
existing attached rope → safe release
rope-cut disabled penalty = none
```

Wall intersection Rope Cut과 다른 event type으로 유지.

---

## 17. 최종 탈출 경로

전투 중:

```text
EXIT-1 OFF
EXIT-2 OFF
Rooftop Access locked
```

Central Core defeat:

```text
EXIT-1 deploy
EXIT-2 deploy
Rooftop Access open
```

권장 위치:

```text
EXIT-1 (2600,400)
EXIT-2 (2600,180)
```

---

## 18. Renderer에 추가할 종류

기존 renderer pipeline에만 추가한다.

- continuity-core
- actuator
- partition-wall
- slot-shutter
- control-pulse
- coupling
- maintenance-aperture
- recovery-hardpoint
- exit-hardpoint

별도 Boss05 렌더링 엔진 금지.

---

## 19. Snapshot / 멀티플레이 동기화

최소 authority snapshot:

```text
phase
subphase
wall states/positions
shutter states
pulse state/region
active target
coupling exposed
core shell state
temporary hardpoints
per-player recovery state
per-player recovery cell
exit deployed
hazard sequence
```

멀티플레이에서 Wall/Collision/Pulse/Recovery가 client마다 다르게 보이면 안 된다.

---


## 상태 동기화 완료 기준

다음 값은 Host/Client와 snapshot 복원 후 모두 동일해야 한다.

```text
A/B/Main Wall position
A/B/Main Wall state
각 Shutter state
현재 Pulse zone + warning/active state
A/B/Main Coupling HP
현재 exposed target
Core shell stage
Player별 Recovery active/targetCell
EXIT-1/EXIT-2 active
```

검증 방법:

```text
1. P2 Pulse active 중 snapshot 저장
2. restore
3. 같은 Wall 위치 / Pulse zone / B HP인지 비교

4. P3-B Main expose 중 snapshot 저장
5. restore
6. Main aperture / Main HP / A/B/Main Wall lock 상태 비교

7. Player 한 명 Recovery 중 snapshot 저장
8. restore
9. 해당 Player에게만 Recovery hardpoint/protection이 유지되는지 비교
```


## 이동성 보강용 Boss05 전용 구성요소

### `core-access-shutter`

목적:

```text
P1~P3 Core 접근 차단
Main 파괴 후 실제 Collision 제거
```

형상:

```text
x=2420
y=-2550
width=360
height=400
grappleable=false
```

`phase < 4`일 때만 `dynamicCollisionSurfaces()`에 포함한다.

### `core-shell-left / core-shell-right`

기존 `core-housing` 한 덩어리를 좌우 정적 Shell로 나눈다.

```text
left  = x2100..2420
right = x2780..3100
```

둘 다 non-grappleable.

### `rooftop-gate`

Roof 전체 slab와 분리된 중앙 360px Gate.

Boss 완료 전 Collision ON,
Boss 완료 후 `blockedByBossStageId="boss-05"` 경로로 제거한다.

### Boss05 Hardpoint actor

`arena.anchors`를 실제 `ropeAttachmentActors()`로 노출한다.

Runtime이 Phase/substate에 따라 활성 Anchor만 반환한다.

큰 Platform/Housing/Shutter에 Hook을 붙여 경로를 만드는 방식보다
Visible Hardpoint를 우선한다.

### Slot Occupant Eject

WARNING→DESCENT 전 Slot overlap을 검사한다.

안전한 좌/우 Platform center 후보를 찾아
Player를 수평으로 배출한 후 Shutter collision을 제거한다.

### `wallBounds()`

Wall 렌더/Collision/Hazard가 모두 같은 형상 함수를 사용한다.

```text
top = ceilingY
bottom = state.bottomY
```

### `phaseReadyZones / legalCombatZones`

Phase 시작 위치와 Recovery 종료 위치를 분리한다.

P2는 R8 쪽 Ready에서 시작한 뒤 B Wall을 넘어가는 흐름을 유지한다.

### Victory Recovery

Boss 승리 시 spectator는 Boss entry가 아니라
TOP-L/TOP-R 부근 승리 복귀 지점으로 보낸다.

## Wall Contact Damage Resolver — 설계 확정

Boss05 Wall은 `warning`과 `stored`를 제외한 활성 물리 상태에서 Player 접촉 피해를 준다.

```text
descent  → damage + horizontal push
locked   → damage
rise     → damage + horizontal push
stored   → no damage
warning  → no damage
```

구현은 Wall의 실제 `dynamicCollisionSurfaces()` geometry와 같은 bounds를 사용한다.

권장 입력:

```js
resolveWallContact({
  player,
  wallSurface,
  wallState,
  damage: 20
})
```

판정 조건:

```text
player collider overlaps wall collider
AND player.hitInvulnerabilityRemaining <= 0
```

성공 시:

```text
player HP -= wallDamage
player.hitInvulnerabilityRemaining = existing combat invulnerability
horizontal push toward nearest legal cell
```

`locked`에서는 수평 Push를 강제하지 않아도 되지만,
Player가 Wall 내부에 끼어 있는 overlap 상태라면 nearest legal side로 분리한다.

Wall contact damage는 `control-pulse`와 별도 hazard sequence/id를 사용한다.

## 20. 구현 후 점검

다음 항목은 문장 설명이 아니라 실제 테스트로 확인한다.

### 기본 전투 테스트

```text
P1 A expose 실패 1회
→ 다음 expose에서 이전 damage 유지 확인

P2 B Wall lock
→ 같은 frame 또는 다음 authoritative frame에 Pulse collider 제거 확인

P3 Main expose 실패
→ Main damage 유지 + P3-A restart 확인

Final Core defeat
→ Wall/Pulse 재시작 이벤트가 이후 0회인지 확인
```

### 공간/충돌 테스트

```text
Hook line이 locked Wall을 가로지름
→ Wall 뒤 Hardpoint 후보 제외

Projectile path가 Wall→Coupling 순서
→ Wall에서 소멸/차단

moving Wall × active Rope segment 교차
→ 1회 Rope Cut

stationary Wall 옆 Rope
→ Rope Cut 없음
```

### 멀티플레이 테스트

```text
Player A가 ready region 도달
→ Phase 시작

Player B가 이전 Cell에 남음
→ Player B만 Recovery Route 활성

Player B Void fall
→ Player A Boss Phase 계속
→ Coupling HP 유지
```



### Geometry

- [ ] Slot 220 / Wall 180 clearance
- [ ] Wall과 platform stale overlap 없음
- [ ] Core recess와 TOPL/TOPR가 겹치지 않음
- [ ] Main aperture가 player passage가 아님
- [ ] Central Void에 정상 catcher floor 없음

### Rope

- [ ] Wall behind target attach 차단
- [ ] moving Wall actual rope intersection만 Cut
- [ ] rising Wall에서도 intersection Cut
- [ ] locked Wall 지속 Cut 없음
- [ ] temporary hardpoint OFF = safe release

### Combat

- [ ] inactive target damage 0
- [ ] projectile Wall occlusion
- [ ] augment attack Wall occlusion
- [ ] Main Coupling one HP
- [ ] accumulated damage persists

### Pulse

- [ ] P2 full-height
- [ ] P3-A full-height
- [ ] P3-B full-width
- [ ] warning damage 0
- [ ] Bridge camping impossible

### Multiplayer

- [ ] one-player ready starts next Phase
- [ ] lagging player recovery
- [ ] one player fall does not reset Phase
- [ ] Recovery 보호는 Boss05 위험 공격 피해에만 적용
- [ ] snapshot/restore recovery state

### Final

- [ ] no new gimmick
- [ ] EXIT only after Core defeat
- [ ] Base Rope route to exit
