# 추가 확정 — Wall 접촉 피해

기존 이동성 문서의 `locked wall contact damage = 0`, `ascending body damage = 0` 규칙은 폐기한다.

최신 규칙:

```text
WARNING    = 0
DESCENT    = 20
LOCKED     = 20
RISE       = 20
STORED     = 0
```

Player collider와 실제 Wall collider가 겹칠 때만 적용한다.
연속 접촉은 기존 hit invulnerability/cooldown으로 다단히트를 제한한다.

---

# 보스05 플레이어 이동성·공격 접근성 전면 수정 기획

> 최신 점검 기준: `main@ea007998cef6168bfa4139d06f443eb444acfda5`
>
> 목적: “좌표상 400px 안에 있다”만 확인하지 않고, **플레이어가 실제 충돌체를 피해 이동하고, Rope를 걸고, 약점에 접근하고, 승리 후 출구까지 빠져나갈 수 있는지**를 전체 전투 흐름으로 검증한다.
>
> 상태: **개발 반영 필요 · 차단급 문제 포함**

---

# 1. 최종 Core 접근 차단 — 반드시 수정

## 현재 문제

현재 `boss-05:core-housing`:

```text
x = 2100
y = -2550
width = 1000
height = 400
grappleable = true
oneWay = false
```

Final Core Target:

```text
(2600, -2350)
radius = 72
```

Core는 solid Housing 중앙에 있다.

`TOP-L/R → Core`의 거리 자체는 Base Rope 400px 안이지만,
Player가 Core Target 판정 거리까지 들어가려면 Housing을 통과해야 한다.

즉:

```text
거리 검사 = PASS
실제 Collision 경로 = FAIL
```

이다.

## 수정 형상

기존 단일 Housing을 세 부분으로 나눈다.

```text
LEFT CORE SHELL
x = 2100
y = -2550
w = 320
h = 400
grappleable = false

CORE ACCESS
x = 2420
y = -2550
w = 360
h = 400

RIGHT CORE SHELL
x = 2780
y = -2550
w = 320
h = 400
grappleable = false
```

P1~P3에서는 중앙 `CORE ACCESS`를 `core-access-shutter` 동적 Collision으로 막는다.

```text
P1/P2/P3
core-access-shutter = collision ON

Main 파괴
→ phase 4
→ core-access-shutter = collision OFF
→ Final Core 실제 접근 가능
```

Core 위치는 `(2600,-2350)`을 유지한다.

## 왜 Core 위치를 옮기지 않는가

현재 주요 거리:

```text
TOP-L → Core ≈ 297px
TOP-R → Core ≈ 297px
```

이라 Base Rope 거리 자체는 이미 적절하다.

문제는 위치가 아니라 **Housing collision**이다.

## Core Recess 정리

현재 Recess가 중앙 개구부 쪽으로 일부 겹칠 수 있으므로:

```text
LEFT RECESS
x = 2200
w = 200

RIGHT RECESS
x = 2800
w = 200
```

으로 중앙 진입부에서 물린 형상을 제거한다.

`TOP-L=(2380,-2150)`, `TOP-R=(2820,-2150)`는 유지한다.

## QA

Final 진입 후:

```text
TOP-L
→ Core Target 반경까지 실제 Player 중심 진입 가능

TOP-R
→ 동일

Housing collision을 통과하지 않고 가능
```

해야 한다.

---

# 2. 옥상 Exit가 Roof에 막히는 문제 — 반드시 수정

## 현재 문제

현재:

```text
route-roof
x = 450
width = 4300
y = -2685
height = 115

rooftop-gate
x = 2420
width = 360
y = -2685
height = 115
```

이다.

중앙 Gate를 제거해도 뒤에 4300px짜리 `route-roof`가 그대로 존재하면
실제 통로가 열리지 않는다.

또 `EXIT-2=(2600,-2620)`은 현재 Gate slab 내부에 있다.

## 수정 형상

`route-roof`를 세 덩어리로 분리한다.

```text
LEFT ROOF
x = 450
y = -2685
w = 1970
h = 115

CENTRAL ROOFTOP GATE
x = 2420
y = -2685
w = 360
h = 115

RIGHT ROOF
x = 2780
y = -2685
w = 1970
h = 115
```

LEFT/RIGHT ROOF는 고정한다.

CENTRAL GATE만:

```text
Boss active
→ collision ON

Final Core 파괴
→ collision OFF
```

로 변경한다.

권장 구현은 static Gate surface에:

```text
blockedByBossStageId = "boss-05"
```

를 주고 현재 `#bossFilteredCollisionSurfaces()` 경로를 그대로 재사용하는 것이다.

## Exit 순서

```text
TOP-L/R
→ EXIT-1 (2600,-2400)
→ EXIT-2 (2600,-2620)
→ actual exit trigger (2600,-2717)
```

거리:

```text
TOP-L/R → EXIT-1 ≈ 333px
EXIT-1 → EXIT-2 = 220px
EXIT-2 → actual exit ≈ 97px
```

모두 Base Rope 400px 안이다.

## QA

Core 파괴 전:

```text
Gate collision ON
EXIT actor OFF
통과 불가
```

Core 파괴 후:

```text
Gate collision OFF
EXIT-1/2 ON
actual exit까지 연속 통과 가능
```

---

# 3. Runtime Exit 표시 좌표 불일치 — 반드시 수정

현재 `boss-05.json`의 Exit Anchor는:

```text
EXIT-1 = (2600,-2400)
EXIT-2 = (2600,-2620)
```

인데 `ContinuityControlCoreRuntime.presentationObjects()`는 아직:

```text
(2600,-400)
(2600,-180)
```

을 하드코딩한다.

이 상태에서는 실제 Exit와 화면 표시가 서로 다른 곳에 나타난다.

## 수정

`presentationObjects()` 안의 하드코딩 좌표를 제거한다.

Runtime config 생성 시:

```text
exitPoints = definition.arena.anchors에서
boss-05:exit-1 / boss-05:exit-2를 찾아 저장
```

하고 presentation도 이 값을 사용한다.

**좌표 원본은 `boss-05.json` 한 곳만 소유한다.**

---

# 4. Core/Wall이 Rope 가능해 보이는 잘못된 표시 수정

실제 `ropeAttachmentActors()`는 빈 배열이지만 presentation은:

```text
Core ropeAttachable = true
Wall ropeAttachable = state !== stored
```

로 표시한다.

실제 입력과 시각 표시가 다르다.

## 수정

```text
Core ropeAttachable = false
Partition Wall ropeAttachable = false
```

로 고정한다.

Rope 가능한 요소는 visible Service Hardpoint만 표시한다.

---

# 5. 거대한 Housing / Roof / Shutter가 Hook을 빼앗지 않게 수정

현재 Rope surface 판정은:

```text
collision != false
grappleable == true
```

인 Surface 전체를 후보로 쓴다.

따라서 큰 `core-housing`, Roof, Slot Shutter가 grappleable이면
플레이어가 원하는 Hardpoint 대신 넓은 면에 Hook이 붙을 수 있다.

## 수정

다음은 `grappleable=false`:

```text
Core shell left/right
Core access shutter
Partition Wall
Slot Shutter
Rooftop Gate
Left/Right Roof
```

Boss05 Rope 이동은 **서비스 Hardpoint actor**가 담당한다.

---

# 6. Boss05 Anchor를 실제 Runtime Hardpoint로 사용

현재 `arena.anchors`는 Spec에는 있지만 Rope 입력에서 직접 discrete target으로 사용되지 않는다.

## 수정

`ContinuityControlCoreRuntime.ropeAttachmentActors(worldOffset)`가
현재 활성 Hardpoint만 반환하도록 한다.

각 반환값:

```js
{
  id: anchor.id,
  position: worldPoint(anchor),
  ropeAttachment: {
    ownerId: anchor.id,
    localAnchor: { x: 0, y: 0 }
  }
}
```

기존 `GameSimulation.#ropeAttachmentActors()`와
`findRopeAttachment()` 경로를 그대로 재사용한다.

## 활성 규칙

### P1

```text
ENTRY
L0~L8
A-STRIKE
TOP-L
```

### A 파괴 후 / P2

```text
CROSS ON
R0~R8
B-STRIKE
TOP-R
```

기존 왼쪽 Route를 강제로 없앨 필요는 없지만
P2 진행 필수 Hardpoint는 오른쪽 계열이다.

### P3-A

```text
CROSS OFF
P3-BRIDGE ON
TOP-L/R ON
```

### P3-B

```text
P3-BRIDGE OFF
P3-LOW-L/R ON
TOP-L/R ON
```

### Final

```text
TOP-L/R ON
EXIT-1/2 OFF
```

### Core 파괴

```text
EXIT-1/2 ON
```

Phase-gated Hardpoint가 OFF될 때 이미 Rope가 붙어 있다면:

```text
Safe Release
ropeDisabled penalty = 0
```

Wall Rope Cut과 분리한다.

---

# 7. Phase 시작 구역과 실제 전투 Cell을 분리

현재 `phaseZones` 하나를:

- Phase 시작 판정
- Recovery 종료 판정

에 같이 사용한다.

이러면 P2처럼 **Wall을 넘은 뒤에야 Phase가 시작되는** 식의 어색한 흐름이 생길 수 있다.

## 수정 구조

Spec에 두 종류를 분리한다.

```text
phaseReadyZones
legalCombatZones
```

### P2 Ready

B Wall이 내려오기 전에 Player가 대기하는 R8 부근.

권장 초기값:

```text
x = 2880..3060
y = -2100..-1880
```

R8 `(2990,-2000)`을 포함하고 B Wall 중심 `x=3070`의 왼쪽이다.

즉:

```text
R8 도착
→ P2 시작
→ B Wall 하강
→ Player가 오른쪽 Cell로 넘어감
```

이 된다.

### P2 Legal Combat Cell

B Wall 오른쪽:

```text
x >= 3250
```

### P3-A Ready

P2 완료 후 중앙 진입 지점.

### P3-A Legal Cell

```text
A Wall 오른쪽 ~ B Wall 왼쪽
```

### P3-B Legal Cells

```text
LEFT  = A/B 중앙 Cell 중 Main Wall 왼쪽
RIGHT = A/B 중앙 Cell 중 Main Wall 오른쪽
```

Recovery 보호 종료는 `legalCombatZones` 진입으로 판단한다.

---

# 8. Wall 형상을 “천장 고정 + 하단 이동”으로 통일

현재 Runtime은 `state.y`를 Wall 상단처럼 쓰고:

```text
height = lockY - state.y
```

를 계산한다.

FULL LOCK에서 height가 0에 가까워지는 구조다.

## 수정 데이터

Wall state의 `y`를 폐기하고 명확히:

```text
bottomY
```

로 바꾼다.

```text
stored:
bottomY = ceilingY

descending:
bottomY = lerp(ceilingY, lockY, progress)

locked:
bottomY = lockY

rising:
bottomY = lerp(lockY, ceilingY, progress)
```

공통 함수:

```js
wallBounds(configuration, state) => ({
  x: configuration.x - configuration.width / 2,
  y: configuration.ceilingY,
  width: configuration.width,
  height: Math.max(1, state.bottomY - configuration.ceilingY)
})
```

다음 세 곳이 반드시 **같은 함수**를 사용한다.

```text
presentationObjects()
activeHazards()
dynamicCollisionSurfaces()
```

시각과 실제 Collision이 달라지는 것을 막는다.

---

# 9. Wall Slot에서 발판이 갑자기 사라지는 문제 수정

현재 Wall stored 상태에서는 Shutter가 실제 one-way surface로 존재하다가
Wall이 움직이기 시작하면 사라진다.

Player가 Slot 위에 서 있으면 그대로 추락할 수 있다.

## 수정 시퀀스

```text
WALL WARNING
→ SLOT WARNING
→ Slot overlap Player 검사
→ 안전한 옆 Platform으로 수평 배출
→ Shutter collision 제거
→ Wall DESCENT
```

## 안전 배출 계산

각 Slot에 대해:

```text
leftCandidateX
= slot.x - PLAYER_RADIUS - 8

rightCandidateX
= slot.x + slot.width + PLAYER_RADIUS + 8
```

두 Candidate 중:

1. 실제 Platform support가 있고
2. Wall 반대쪽 위험 Cell로 강제로 보내지 않으며
3. Void 위가 아닌

가까운 쪽을 선택한다.

Y는 해당 Platform top 기준:

```text
platformTopY - PLAYER_RADIUS - 2
```

로 둔다.

둘 다 안전하지 않으면 Wall 이동을 1 frame 지연하고
authored fallback eject point를 사용한다.

## Slot Shutter Rope

Shutter 자체는:

```text
grappleable = false
```

로 바꿔 Rope aim을 빼앗지 않는다.

---

# 10. 움직이는 Wall과 Player 접촉 시 Crush/Snag 방지

동적 Collision solver에만 맡기면 Player가 Wall과 Platform 사이에서
아래/위 방향으로 튕기거나 끼일 수 있다.

## 수정

움직이는 Partition이 Player와 overlap하면 Boss05 전용 contact resolver가:

```text
작은 피해
+
수평 방향 push
```

만 적용한다.

방향:

```text
player.x < wall.x
→ 왼쪽 legal cell

player.x >= wall.x
→ 오른쪽 legal cell
```

수직 push는 금지한다.

Locked Wall:

```text
collision 유지
contact damage = 20
Rope Cut = 없음
```

Ascending Wall:

```text
contact damage = 20
수평 Push
Rope intersection cut = 가능
```

---

# 11. 상승 Wall Rope Cut 누락 수정

현재:

```text
ropeCutSurfaces()
→ descending only
```

이다.

수정:

```text
descending || rising
```

중 실제 Rope line과 Wall polygon이 교차한 frame에만 기존 Rope Cut 처리.

```text
locked
stored
→ Rope Cut 없음
```

---

# 12. P2/P3 Pulse의 “안전 구역에 이동 Anchor가 없는” 상황 자동 방지

각 Pulse Warning이 뜰 때 반대쪽 안전 영역 안에
현재 활성 Hardpoint가 최소 하나 있어야 한다.

자동 검증:

```text
safeRegion
∩
activeHardpoints
>= 1
```

P2:

```text
INNER active → OUTER에 활성 Anchor >= 1
OUTER active → INNER에 활성 Anchor >= 1
```

P3-A:

```text
LEFT active → RIGHT에 Anchor
RIGHT active → LEFT에 Anchor
```

P3-B:

```text
UPPER active → LOWER에 Anchor
LOWER active → UPPER에 Anchor
```

Warning은 보이는데 이동할 Rope 지점이 없는 상태를 금지한다.

---

# 13. Arrival Pad 수납 시 Player를 떨어뜨리지 않음

Preview 기획에는 P1 시작 후 중앙 Arrival Pad 수납이 있다.

실제로 구현할 때 Pad를 Player 밑에서 즉시 삭제하면 안 된다.

## 수정

Arrival Pad 수납 조건:

```text
모든 active Player가
LEFT/RIGHT Recovery Deck 또는 P1 legal cell로 이탈
```

한 뒤 수납한다.

시간이 지나도 Player가 위에 있으면:

```text
가까운 좌/우 Recovery Deck으로 수평 배출
→ 그 다음 Pad 수납
```

한다.

---

# 14. Recovery를 “다시 처음부터 등반”으로 만들지 않음

현재 Runtime:

```text
phase <= 2 → entry
phase >= 3 → main 계열
```

정도만 구분한다.

P2/P3에서 추락했는데 다시 전투 전체를 등반해야 하면
전투 실패보다 이동 반복이 더 큰 페널티가 된다.

## 수정

기존 설계의 Personal Recovery 원칙을 유지한다.

```text
Fall
→ Recovery 상태 시작
→ 현재 Phase의 legal cell로 돌아갈 수 있는
   owner-only Recovery Hardpoint/Recovery target 제공
```

P3-B는 추락 직전 `lastLegalCell`을 저장해
LEFT/RIGHT를 유지한다.

Recovery 중:

```text
Boss05 hazard 피해 보호
Wall/Platform/Rope 물리 정상
Boss target 공격 정상
```

Recovery Route는 다음 Phase나 Exit로 연결되지 않아
진행을 건너뛸 수 없게 한다.

---

# 15. Phase 전환 시 뒤처진 Player 교착 방지

한 명이 Ready Zone에 도착하면 다음 Phase가 시작하는 규칙은 유지한다.

단 Phase가 시작될 때:

```text
각 active Player 위치 검사
```

를 수행한다.

새 Wall이 내려오면 현재 위치에서 legal cell에 도달할 수 없는 Player는:

```text
그 Player만 Personal Recovery 활성
```

한다.

다른 Player의 Phase/HP를 reset하지 않는다.

---

# 16. 승리 시 Spectator를 Boss 입구로 보내지 않음

현재 승리 복구 경로는 spectator를 Boss Stage entry 쪽으로 보내는 코드가 있어
죽은 Player가 보스가 끝난 뒤 다시 전체 맵을 올라가야 할 수 있다.

## 수정

Victory spectator recovery:

```text
TOP-L / TOP-R 근처 승리 복귀 지점
```

으로 변경한다.

권장:

```text
victory-recovery-left  ≈ TOP-L
victory-recovery-right ≈ TOP-R
```

Spectator 복귀 후:

```text
EXIT-1 → EXIT-2 → Sector06
```

만 수행하면 된다.

---

# 17. 카메라로 목적지가 화면 밖에 숨는 문제 방지

각 로컬 Player 카메라는 독립이라는 확정 규칙을 유지한다.

추가로 Boss05 전용 `requiredFocusPoints`를 계산한다.

P1:

```text
Player
A Wall 하단
다음 P1 Hardpoint
```

P2:

```text
Player
현재 Warning 경계
반대 safe region의 Hardpoint
```

P3-A:

```text
Player
A/B Wall
P3-BRIDGE 또는 현재 safe Hardpoint
```

P3-B:

```text
Player
Main Wall
현재 UPPER/LOWER Warning
반대 safe Hardpoint
```

Final:

```text
Player
Core opening
Core Target
```

Victory:

```text
Player
EXIT-1
EXIT-2 방향
```

이 점들이 화면 밖이면 local camera만 단계적으로 zoom-out한다.

---

# 18. Editor/Validator에서 같은 문제를 다시 못 만들게 자동 검사

현재 Validator는 Anchor가 존재하는 Surface ID를 참조하는지는 보지만,
**실제로 접근 가능한지**까지는 확인하지 않는다.

Boss05에 아래 검증을 추가한다.

## A. Base Rope Graph

활성 단계별 Anchor graph:

```text
edge 생성 조건:
distance <= baseHookReach
AND line of sight not blocked by solid ropeOccluder
```

필수 시작점에서 필수 공격 지점까지 경로가 있어야 한다.

## B. Target Accessibility

각 Coupling/Core에 대해:

```text
reachable player center
→ target contact distance
```

가 존재하는지 검사한다.

단순 Anchor→Target 거리만 보지 않는다.

## C. Victory Exit Accessibility

Boss completed collision state에서:

```text
Final combat cell
→ EXIT-1
→ EXIT-2
→ stage.exitTrigger
```

연속 경로가 있어야 한다.

## D. Anchor-in-solid

활성 Anchor가 같은 Phase에서
제거되지 않는 solid 내부에 들어가면 오류.

## E. Safe Pulse Anchor

모든 Pulse의 반대 안전영역에
활성 Hardpoint가 최소 하나 있어야 한다.

## F. Slot Safety

각 Slot 좌우에 최소 하나의 안전 eject support가 있어야 한다.

---

# 19. 수정 우선순위

## P0 — 플레이 불가능 차단

1. Final Core 중앙 개구부
2. Roof 좌/중앙Gate/우 분할
3. Runtime Exit 표시 좌표
4. Wall top-fixed geometry

## P1 — 이동 조작 불편

5. Core/Roof/Shutter non-grappleable
6. 실제 Phase-gated Hardpoint actor
7. Slot occupant eject
8. moving Wall horizontal push
9. rising Wall Rope Cut

## P2 — 전투 중 재진입/교착

10. phaseReadyZones / legalCombatZones 분리
11. Personal Recovery
12. lagging Player Recovery
13. victory spectator 상부 복귀

## P3 — 가독성/자동 검증

14. Boss05 local camera requiredFocusPoints
15. Rope graph validator
16. Target accessibility validator
17. Victory exit validator
18. Pulse safe-anchor validator
19. Slot safety validator

---

# 20. 완료 판정

아래 전부 PASS해야 이동성 문제를 해결한 것으로 본다.

```text
[ ] P1 Entry에서 A까지 Base Rope로 실제 이동 가능
[ ] P2 Ready에서 Wall 하강을 보고 오른쪽 Cell로 실제 이동 가능
[ ] P2 각 Pulse 반대 안전구역에 Rope 지점 존재
[ ] P3-A 중앙 Cell에서 좌우 이동 가능
[ ] P3-B 좌/우 Cell 각각 Upper/Lower 대응 가능
[ ] Main Aperture 양쪽 공격 가능
[ ] Final Core Housing에 막히지 않고 Rope Impact 가능
[ ] Core 파괴 뒤 Roof 중앙 실제 통로 개방
[ ] EXIT-1/2 표시와 실제 좌표 일치
[ ] Slot 위 Player가 발판 삭제로 추락하지 않음
[ ] Wall 접촉으로 아래쪽 Crush 발생하지 않음
[ ] Rising Wall이 실제 Rope를 관통하지 않음
[ ] Recovery Player가 현재 legal cell로 복귀 가능
[ ] Lagging Player가 Phase Wall 뒤에 영구 고립되지 않음
[ ] Spectator가 승리 후 Boss 입구에서 다시 등반하지 않음
[ ] 1P / 2P / 4P에서 카메라가 다음 이동 목적지를 숨기지 않음
```
