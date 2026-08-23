# 보스05 최신 `main` 코드 대조 및 수정 구현 기획

> 기준 커밋: `ea007998cef6168bfa4139d06f443eb444acfda5`
>
> 판정: **런타임 부분 구현 · 최종 기획 정합화 필요 · 실제 플레이테스트 미검증**
>
> 목적: 현재 코드를 폐기하지 않고, 이미 연결된 Boss framework를 재사용하면서 최종 Boss05 기획에 맞게 수정한다.

---

# P0 추가 — 플레이어 이동·공격 접근 차단 수정

최신 `main@ea007998cef6168bfa4139d06f443eb444acfda5` 재점검에서
Final Core와 승리 Exit에 **거리 문제가 아닌 실제 Collision 차단**이 확인되었다.

따라서 기존 P0보다 먼저 다음을 처리한다.

```text
P0-1 Final Core Access
P0-2 Rooftop Exit Gap
P0-3 Exit presentation 좌표 단일화
P0-4 Wall top-fixed geometry
P0-5 Slot occupant safety
```

구체 형상/좌표/Runtime 변경은
`BOSS-05-MOVEMENT-ACCESSIBILITY-FIX-PLAN.md`를 기준으로 한다.

핵심 원칙:

```text
Anchor distance PASS
≠
실제 플레이 가능 PASS
```

이후 모든 QA는 Collision + Rope line-of-sight + Target 접촉 가능성까지 함께 본다.

---

# 0. 이번 점검에서 확정된 규칙

## 전원 사망

완료한 이전 Phase는 유지한다.

```text
전원 사망
→ 완료 Phase 유지
→ 현재 Phase HP 최대치 복구
→ 현재 Phase 내부 상태 초기화
→ 현재 Phase 처음부터 재시작
```

노출 시간 초과는 전원 사망과 다르다.

```text
노출 시간 초과
→ Coupling 누적 피해 유지
→ 같은 Phase 재시도
```

## 멀티플레이 카메라

각 플레이어가 자신의 로컬 카메라를 가진다.

```text
local Player
+
Core
+
현재 Warning
+
다음 이동 Hardpoint
```

를 기준으로 각각 독립적으로 프레이밍한다.

카메라 위치는 네트워크 동기화 대상이 아니다.

## Recovery 중 Boss 공격

Recovery 상태에서도 유효 Coupling/Core에 정상 피해를 준다.

```text
열린 공격선
→ 정상 피해

Wall이 차폐
→ 공격 차단
```

Recovery는 Boss05 위험 공격 피해에 대한 보호이지 공격 금지 상태가 아니다.

---

# 1. 맵 크기 / 좌표계 / Phase 경계

## 현재 코드

Boss05 arena:

```text
x = 0 ~ 5200
y = -2600 ~ 0
```

현재 `arena.exit.y = -2420`.

Spec에는 P1/P2/P3/Core용 phase zone이 존재한다.

## 문제

기존 디자인 Preview는 아래쪽 진입에서 위쪽 Core/Exit으로 올라가는 구조인데,
현재 일부 Anchor/Core/EXIT 좌표가 Runtime의 음수 Y 축 방향과 일관되지 않아
Core 이후 EXIT Route가 실제 Stage exit 방향과 반대로 배치될 수 있다.

## 수정 기획

Boss05에 한해 Preview 좌표를 Runtime 좌표로 명시적으로 변환하는 기준을 하나로 고정한다.

권장 기준:

```text
runtimeY = previewY - 2600
```

이 기준을 적용하면 승인된 EXIT-2 `(2600,180)`은 Runtime `(2600,-2420)`이 되어 현재 `arena.exit`과 일치한다.

단, 이 변환은 **코드 수정 전에 Base Rope 거리와 Platform 높이를 자동 검사해서 확정**한다.

## 코드 수정 위치

- `src/game/boss-authoring/specs/boss-05.json`
- generated Boss05 spec
- BossStageSpec validator 테스트

## QA

- ENTRY → P1 → P2 → P3 → Core → EXIT가 화면상 계속 “위쪽 진행”이어야 함.
- 모든 Mandatory Rope edge ≤ 400px.
- `EXIT-2`가 실제 Boss Stage exit trigger와 같은 상부 영역이어야 함.

---

# 2. 보스 이동 / Wall 실제 형상

## 현재 코드

Core는 중앙 고정이다.
A/B/Main Wall은 `ContinuityControlCoreRuntime`에서 움직인다.

## 문제

Wall 위치값을 내려가게 갱신하면서 Wall 높이를 현재 y와 lock y 차이로 만드는 방식은
“천장에 붙은 Wall이 바닥까지 길어지는” 기획과 반대로 보일 수 있다.

또 현재 A/B/Main의 `moveSeconds`가 모두 0.8초다.

## 수정 기획

Wall 윗면은 authored ceiling에 고정한다.

```text
topY = authored wall bounds top
bottomY = ceiling → floor로 이동
height = bottomY - topY
```

Wall 하단이 Platform/Floor까지 내려오면 FULL LOCK.

초기 시간:

```text
P1 A        ≈ 5.0s
P2 B        ≈ 4.2s
P3 A/B/Main ≈ 3.5s
상승         ≈ 2.0s
```

수치는 플레이테스트 튜닝값이고 공간 규칙은 고정한다.

## 코드 수정 위치

- `src/game/boss/ContinuityControlCoreRuntime.js`
- `src/game/boss-authoring/specs/boss-05.json`

## QA

- WARNING에서 Wall은 천장 수납 상태.
- DESCENT 중 topY는 고정.
- FULL LOCK에서 천장~바닥 사이가 실제 collision으로 막힘.
- 렌더 위치와 collision 위치가 같은 frame에 일치.

---

# 3. 약점 접근 / Main Aperture

## 현재 코드

A/B/Main/Core는 각각 하나의 Boss target으로 존재한다.
피해 배율도 최종 기획과 맞는다.

## 유지

```text
closedBodyDamageMultiplier = 0
weakFixedPercent = 0
weakNormalDamageMultiplier = 1
```

## 미구현/불일치

Main FULL LOCK 뒤 좌/우 어느 쪽에서도 하나의 Main Coupling을 공격하게 하는
점검용 Aperture 공간이 없다.

## 수정 기획

Main Wall FULL LOCK:

```text
Pulse OFF
→ Maintenance Aperture OPEN
→ Main Coupling exposed
```

Aperture 규칙:

- Player passage: 차단
- Wall solid 영역: Hook/Projectile/Attack 차단
- Aperture 공격선: Main Coupling까지 허용
- 좌/우 공격 모두 동일한 `MAIN_COUPLING` HP 사용

## 코드 수정 위치

- `ContinuityControlCoreRuntime.js`
- Boss05 presentation object 생성
- 기존 Boss polygon renderer registry
- projectile/rope occlusion에서 aperture 예외 geometry

## QA

- 왼쪽 hit와 오른쪽 hit가 같은 HP를 감소.
- Player는 Aperture 통과 불가.
- Aperture 밖 Wall을 관통한 공격은 차단.

---

# 4. Anchor / Hardpoint

## 현재 코드

A-STRIKE, B-STRIKE, CROSS, P3-BRIDGE, P3-LOW-L/R, TOP-L/R, EXIT-1/2가 Spec에 있다.

## 문제

현재 Core/Wall이 rope attachment actor로 노출될 수 있다.
최종 설계는 Service Hardpoint만 공략용 Rope target으로 사용한다.

또 Hardpoint의 Phase 활성 시점이 충분히 권위화되지 않았다.

## 수정 기획

```text
Core = Rope target 아님
Partition Wall = Rope target 아님
Service Hardpoint = Rope target
```

활성 계약:

```text
CROSS
P1 시작 OFF
A 파괴 후 ON
P3 시작 OFF

P3-BRIDGE
P3-A ON
P3-B 시작 OFF

P3-LOW-L/R
P3-B ON

EXIT-1/2
Final Core 파괴 전 OFF
Final Core 파괴 후 ON
```

비활성 순간 기존 Rope가 붙어 있으면 Safe Release.
Rope Cut 페널티는 주지 않는다.

## 코드 수정 위치

- `ContinuityControlCoreRuntime.ropeAttachmentActors()`
- Boss05 authored anchor 활성 필터
- `GameSimulation` Boss attachment actor 조합 경로

## QA

- Core/Wall 직접 grapple 불가.
- phase OFF Hardpoint 신규 attach 불가.
- OFF 전 붙어 있던 Rope는 안전 해제.

---

# 5. Wall / one-way / Slot / Shutter

## 현재 코드

Partition surface는 `oneWay:false`, `ropeOccluder:true`, `projectileOccluder:true`.
공통 Rope input도 `ropeOccluder`를 실제 차폐에 사용한다.

## 유지

Rope/Projectile 차폐 공용 구조는 새로 만들지 않는다.

## 수정 필요

220px Slot + Shutter의 실제 Platform collision 개폐를 완성한다.

```text
Wall Warning
→ Slot Warning
→ Slot 위 Player 감지
→ 가장 가까운 정상 Platform으로 수평 배출
→ Slot collision 제거
→ Shutter OPEN
→ Wall 이동
```

Wall 완전 수납:

```text
Slot collision 복원
→ Shutter CLOSE
```

one-way Platform은 기존 authored surface 성격을 유지하고,
Partition 자체는 one-way가 아니다.

## QA

- 닫힌 Shutter를 Wall이 관통하지 않음.
- Slot 위 Player가 Void로 자동 낙하하지 않음.
- Wall 수납 후 Platform이 정상 복구.

---

## Wall 접촉 피해 구현 — 필수

현재 Wall collision을 이동 방해만으로 처리하지 말고 Boss05 hazard contact로 연결한다.

### 상태별

```text
WARNING    damage 0
DESCENT    damage 20
LOCKED     damage 20
RISE       damage 20
STORED     damage 0
```

### 수정 위치

- `src/game/boss/ContinuityControlCoreRuntime.js`
  - Wall state별 contact hazard 생성
  - 동일한 `wallBounds()` 사용
- `src/game/simulation/GameSimulation.js`
  - 기존 composite Boss hazard resolver 재사용
  - `recoveryProtected(player.id)`이면 피해 무시
  - 기존 player hit invulnerability로 연속 피해 제한

### 주의

Wall contact damage와 Rope Cut을 하나의 판정으로 합치지 않는다.

```text
Player ↔ Wall overlap
→ HP damage

Rope segment ↔ moving Wall intersect
→ Rope Cut
```

둘은 동시에 발생할 수 있지만 조건은 독립이다.

# 6. 공격 판정 / Control Pulse / Rope Cut

## P1

Pulse 없음.

현재 P1에서도 `none` variant Pulse 객체가 만들어질 수 있으므로 P1에서는 `#startPulse()`를 호출하지 않는다.

## P2

Wall FULL LOCK 전까지 반복:

```text
INNER WARNING 0.7
→ INNER ACTIVE 0.35
→ GAP 0.8
→ OUTER WARNING
→ OUTER ACTIVE
→ GAP
→ 반복
```

B Wall FULL LOCK 즉시 Pulse 종료.

구역은 B Wall 오른쪽 실제 combat cell 안에서:

```text
x < 3750 = INNER
x >= 3750 = OUTER
```

## P3-A

```text
LEFT ↔ RIGHT
```

A/B Wall 사이 중앙 Cell 전체 높이.
P3-BRIDGE도 어느 활성 측에도 안전지대가 아니어야 한다.

## P3-B

```text
UPPER ↔ LOWER
```

Main 양쪽 legal cell의 전체 폭.

기준선은 final authored geometry에서 한 값으로 고정한다.

## Rope Cut

```text
Wall moving (descending or rising)
+
실제 Rope segment와 실제 Wall surface 교차
→ Rope Cut
```

Locked Wall은 차폐는 유지하지만 지속 Cut 없음.

## 코드 수정 위치

- `ContinuityControlCoreRuntime`
- `GameSimulation` Boss hazard/Rope-cut integration
- Boss05 spec parameter

## QA

Warning 피해 0.
Active만 피해.
P1 Pulse 0회.
P2 INNER/OUTER 반복.
P3-B UPPER/LOWER 반복.
Pulse는 Rope를 자르지 않음.

---

# 7. Phase 전환 / P3 상태기계

## 현재 가장 큰 불일치

P3-A에서 A/B Wall이 잠긴 뒤 다시 상승하고 Main으로 넘어간다.
Main 실패 시 P3-A 전체를 다시 시작하지 않는다.

## 수정 상태기계

Boss HP Phase는 4개 유지한다.

Phase 3 내부만:

```text
P3_A_WARNING
P3_A_DESCENT
P3_A_LOCKED

P3_B_WARNING
P3_B_DESCENT
P3_B_LOCKED
P3_B_COUPLING_OPEN

P3_FAIL_RISE
```

### P3-A 성공

```text
A/B Wall FULL LOCK
→ A/B Wall 위치 유지
→ LEFT/RIGHT Pulse OFF
→ P3-B 시작
```

### P3-B 성공

```text
Main Wall FULL LOCK
→ UPPER/LOWER Pulse OFF
→ Aperture OPEN
→ Main Coupling expose
```

### Main 노출 실패

```text
Main HP 누적 유지
→ Aperture CLOSE
→ A/B/Main Wall 모두 상승
→ 모두 수납
→ P3-A 다시 시작
```

## 다음 Phase 시작

생존 Player 한 명이 다음 준비 구역에 도착하면 시작한다.
전원 도착을 기다리지 않는다.

## 전원 사망

```text
완료 Phase 유지
현재 Phase HP reset
현재 Phase 내부 상태 reset
```

## QA

- P3-A 종료 후 A/B Wall이 움직이지 않고 유지됨.
- P3-B 실패 후 세 Wall 모두 상승.
- Main HP만 누적 유지.
- party wipe에서는 Main HP도 현재 Phase reset.

---

# 8. 카메라

## 확정 원칙

각 Player 로컬 카메라 독립 추적.

공통 framing 기준:

```text
local Player 중심
+
Core를 보조 focus
+
현재 판단 정보가 화면 밖이면 zoom out
```

Phase별 필수 화면 요소:

| 단계 | 반드시 같은 로컬 화면에 포함 |
|---|---|
| P1 | Player + A Wall 하단 + 다음 Hardpoint |
| P2 | Player + 현재 Pulse Warning 경계 + 반대 안전 Cell + Hardpoint |
| P3-A | Player + A/B Wall + P3-BRIDGE + LEFT/RIGHT Warning |
| P3-B | Player + Main Wall + UPPER/LOWER Warning + 현재 Cell Hardpoint |
| Main expose | Player + Aperture + Main Coupling |
| Final | Player + Core + 상부 Exit 방향 |

## 코드 수정 위치

- `src/game/GameApp.js`
- `src/game/MultiplayerGameApp.js`
- 기존 authored camera director 확장

새 카메라 시스템은 만들지 않는다.

## QA

Player A/B가 서로 다른 화면을 가져도 Boss state는 동일.
안전 Hardpoint가 계속 화면 밖이면 실패.

---

# 9. 리셋 / 사망 / Void / Recovery

## Void 추락

먼저 기존 fall damage를 적용한다.

HP 0:

```text
기존 player defeat
```

생존:

```text
개인 Recovery 시작
```

## Recovery 목적지

```text
P1 → 현재 유효 왼쪽 Cell
P2 → 현재 유효 오른쪽 Cell
P3-A → A/B Wall 사이 중앙 Cell
P3-B → 추락 직전 LEFT/RIGHT Cell을 기억해 같은 쪽
```

Player별 최소 상태:

```text
active
reason
lastLegalCell
targetCell
protection
```

## 보호

Recovery 중:

```text
Control Pulse damage = 0
moving Wall contact damage = 0
Boss05 hazard damage = 0
```

유지:

```text
Wall collision
Platform collision
Rope physics
Void fall
```

## Boss 공격

**정상 피해 허용.**

Recovery 상태를 이유로 `applyImpact()` 피해를 0으로 만들지 않는다.

Wall 차폐와 target 활성 조건은 그대로 적용한다.

---

# 10. 멀티플레이

## 이미 활용할 기반

- 1~4 참가자
- Boss participant state
- late join without rescale
- authoritative Boss snapshot
- predicted Boss hazard submission 경로

## 보강

Late Join / Rejoin:

```text
현재 Phase 조회
→ 현재 legal cell 밖이면 해당 Player만 Recovery
→ Boss HP scaling 변경 없음
→ 다른 Player 전투 지속
```

뒤처진 Player도 동일.

카메라는 로컬 계산이므로 네트워크 동기화하지 않는다.

## QA

- 2P: 한 명 추락해도 다른 한 명 공격 계속.
- 4P: P3-B 한 Cell에 여러 명이 있어도 이동 가능.
- late join이 Phase를 reset하지 않음.
- 새 Player 참가로 Boss HP가 다시 계산되지 않음.

---

# 11. Snapshot / Restore

## 현재 문제

노출 시간 `remainingSeconds`만으로 Runtime 전체 timer를 복원하면
WARNING/DESCENT/LOCKED/RISE 저장 시 남은 시간이 정확하지 않을 수 있다.

## 반드시 저장할 값

```text
phase
p3Substate
state
stateTimerRemaining
pulseState
pulseVariant
pulseTimerRemaining
hazardSequence

A/B/Main Wall state
A/B/Main Wall position
각 Shutter state

A/B/Main/Core HP
active target
Core shell state

pendingPhase
activeWalls

Player별:
Recovery active
reason
lastLegalCell
targetCell
protection

EXIT active
```

## QA

각 상태에서 snapshot→restore:

```text
P2 Pulse WARNING
P2 Pulse ACTIVE
P3-A A/B DESCENT
P3-A A/B LOCKED
P3-B Main DESCENT
P3-B Main COUPLING OPEN
Recovery active
Final Core open
```

후 다음 tick의 상태 전이가 저장 전과 같아야 한다.

---

# 12. 시나리오 기획을 실제 화면에 연결할 부분

Boss05의 시나리오 문장은:

```text
중앙 시스템이 방을 조종한다.
```

이다.

이를 텍스트 설명이 아니라 화면 변화로 구현한다.

```text
Core control link ON
→ 해당 Actuator ON
→ 해당 Wall Warning
→ Wall Move
```

파괴:

```text
A 파괴
→ A control link OFF
→ Core shell 1/3 open

B 파괴
→ B control link OFF
→ Core shell 2/3 open

Main 파괴
→ Main link OFF
→ 모든 Wall/Pulse 정지
→ Core full open
```

기존 Boss renderer registry에 `boss-control-link`, `boss-maintenance-aperture` 종류를 추가하는 방식으로 처리한다.
새 renderer pipeline은 만들지 않는다.

---

# 13. 구현 우선순위

## P0 — 전투 구조 오류 수정

1. Final Core / Rooftop Exit 실제 Collision 접근성 수정
2. 좌표계/Anchor/Exit audit
2. Wall top-fixed geometry
3. P3-A/P3-B 상태기계
4. Main 실패 → P3-A restart
5. Party wipe current-phase-only reset 테스트

## P1 — 핵심 공간통제

1. P1 Pulse 제거
2. P2 INNER/OUTER 반복
3. P3-A LEFT/RIGHT
4. P3-B UPPER/LOWER
5. Slot/Shutter 실제 collision
6. Rising Wall Rope Cut
7. Core/Wall direct grapple 제거
8. phase-gated Hardpoint

## P2 — 약점/복귀/동기화

1. Main Aperture
2. Personal Recovery
3. Recovery hazard protection
4. Recovery 중 Boss 정상 공격 유지
5. Late Join/Rejoin
6. snapshot timer/P3 substate

## P3 — 화면 가독성과 Final

1. 각 Player 독립 Boss05 camera framing
2. Core→Actuator control link
3. Core shell 1/3 → 2/3 → full
4. Final Core 영구 노출
5. EXIT-1/2 + Rooftop Access

## P4 — 실제 플레이테스트

- 1P Base Rope
- 2P
- 4P
- desktop
- mobile
- fall/recovery
- party wipe
- late join/rejoin
- snapshot/restore
- P3-B 4인 밀도

---

# 14. 구현 완료 판정

다음이 모두 PASS해야 Boss05를 `PLAYTEST VERIFIED` 후보로 올린다.

```text
P1: A Wall → A Coupling
P2: B Wall + INNER/OUTER 반복 → B Coupling
P3-A: A/B Wall FULL LOCK 유지
P3-B: Main + UPPER/LOWER → Main Coupling
Main 실패: Main HP 유지 + P3-A restart
Party wipe: 현재 Phase HP만 reset
Main 성공: 모든 Wall/Pulse 영구 OFF
Final: Core 영구 노출
Core defeat: EXIT 실제 활성

Recovery:
hazard 보호
Boss 공격 정상
Wall 차폐 유지

Multiplayer:
1명 fall / late join이 다른 Player 전투를 reset하지 않음

Snapshot:
각 중간 상태 복원 후 같은 상태기계 진행
```
