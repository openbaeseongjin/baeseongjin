# BOSS 05 — CONTINUITY CONTROL CORE
## 처음 읽는 사람도 이해할 수 있는 기획 설명 + 전투/공간 규칙 + 구현 인계

> 상태: **설계 확정 · 최종 브리프 v12 · 이해도 강화 · 구현 인계 포함 · 런타임 미구현**
>
> Sector: **05 — CONTINUITY CONTROL**
>
> Sector Theme: **THE SYSTEM CHOOSES WHAT CONTINUES**
>
> Secondary: **EVERY ROUTE IS CONTROLLED**
>
> AUTHORING SNAPSHOT: `3301269a4de30f54a71a4361c3f9fc7f665a93cb` (2026-08-23 기준). 현재 main과 Runtime 연결 상태는 `docs/scenario-development-integration.md`가 소유한다.
>
> 구현 전제: 기존 Boss / Rope / Combat / Collision / Snapshot 체계를 재사용하고, Boss05 전용 공간통제 Runtime만 추가한다.

---

# 먼저 읽기 — 보스05는 어떤 보스인가

이 부분만 읽어도 보스05의 전체 구조를 이해할 수 있어야 한다.
아래 내용은 구현 세부가 아니라 **“플레이어가 무엇을 보고, 무엇을 피하고, 무엇을 공격해서 이기는 보스인가”**를 먼저 설명한다.

## 한 문장으로 설명

보스05는 플레이어를 직접 쫓아다니는 적이 아니다.

천장 중앙에 매달린 `Suspended Continuity Control Core`가
**분할벽을 내려 이동 경로를 끊고, 특정 구역에 펄스 공격을 발생시켜 방 전체를 통제하는 보스**다.

플레이어는 Wall 자체를 파괴하지 않는다.

```text
Wall을 피한다
→ Wall이 완전히 잠긴다
→ Wall을 움직인 구동 장치의 결합부가 열린다
→ 결합부를 공격한다
→ Core의 통제 기능 하나가 꺼진다
```

이 과정을 A → B → Main 순서로 반복한 뒤,
모든 공간 통제가 멈추면 마지막으로 중앙 Core를 공격한다.

---

## 전투를 한 장으로 보면

```text
                    [ SUSPENDED CONTINUITY CONTROL CORE ]
                                   │
                 ┌─────────────────┼─────────────────┐
                 │                 │                 │
           AUX ACTUATOR A    AUX ACTUATOR B     MAIN DRIVE
                 │                 │                 │
              A Wall          B Wall + Pulse    A/B Wall 재가동
                 │                 │             + Main Wall
                 │                 │             + Pulse
                 ▼                 ▼                 ▼
           A Coupling         B Coupling        Main Coupling
                 │                 │                 │
                 └──────────────┬──┴───────────────┘
                                ▼
                       Core 외피 완전 개방
                                ▼
                         Central Core 공격
                                ▼
                  모든 Wall / Pulse 영구 정지
                                ▼
                   Rooftop Service Access 개방
```

핵심은 **Wall → 결합부 → Core**의 관계다.

Wall은 보스 본체가 아니라 Core의 명령을 실제 공간에 실행하는 장치다.

---

# 핵심 요소 6개

## 1. 중앙 Core — 보스의 본체

`Suspended Continuity Control Core`

천장 중앙에 고정되어 있다.

처음에는 완전히 닫혀 있고,
A/B/Main을 파괴할수록 외피가 실제로 열린다.

```text
P1 시작      → 외피 닫힘
A 파괴       → 외피 1/3 개방
B 파괴       → 외피 2/3 개방
Main 파괴    → 외피 완전 개방
Core 파괴    → 보스전 종료
```

즉 플레이어는 Core의 외형만 봐도 현재 진행도를 알 수 있어야 한다.

---

## 2. A / B / Main 구동 장치 — 실제로 파괴하는 중간 목표

세 구동 장치는 Core가 Wall을 움직일 때 사용하는 장치다.

### A

P1에서 A Wall을 움직인다.

A Wall이 완전히 잠기면 A 결합부가 열리고,
플레이어는 이 결합부를 공격한다.

### B

P2에서 B Wall을 움직이고
오른쪽 전투 구역에 내부/외부 펄스 공격을 발생시킨다.

B Wall이 완전히 잠기면 펄스가 멈추고 B 결합부가 열린다.

### Main

P3의 마지막 구동 장치다.

A/B Wall을 다시 이용해 중앙 공간을 좁힌 뒤
Main Wall까지 내려 좌우 공간을 더 작게 나눈다.

Main Wall이 완전히 잠기면 Main 결합부가 열린다.

---

## 3. A / B / Main Wall — 플레이어의 이동 경로를 실제로 막는 구조물

세 Wall은 장식이나 이펙트가 아니다.

실제로:

- 플레이어 이동을 막는다.
- Wall 뒤의 Rope 연결 지점을 바로 잡지 못하게 한다.
- 투사체와 공격을 막는다.
- 이동 중 실제 Rope와 교차하면 Rope를 자른다.

단, Wall이 잠긴 뒤에는 접촉 피해를 계속 주지 않는다.

즉 Wall의 목적은 플레이어를 죽이는 것이 아니라
**“지금 어느 공간에 있어야 하는가”를 강제로 결정하는 것**이다.

---

## 4. Control Pulse — 한 곳에 계속 머무르지 못하게 하는 공격

Pulse는 Wall과 함께 사용되는 구역 공격이다.

P2에서는:

```text
INNER ↔ OUTER
```

P3-A에서는:

```text
LEFT ↔ RIGHT
```

P3-B에서는:

```text
UPPER ↔ LOWER
```

로 위험 구역이 번갈아 바뀐다.

플레이어는 Warning을 보고 반대쪽 안전 구역으로 이동해야 한다.

Pulse는:

- 즉사시키지 않는다.
- Rope를 자르지 않는다.
- 강제로 Rope를 해제하지 않는다.

작은 피해와 짧은 밀쳐내기만 준다.

---

## 5. Rope Hardpoint — 이동과 공격 각도를 만드는 수단

`A-STRIKE`, `B-STRIKE`, `CROSS`, `P3-BRIDGE`, `P3-LOW-L/R` 같은 지점이다.

이 지점들은:

- Wall을 넘을 경로를 만든다.
- Pulse 반대쪽으로 이동할 수 있게 한다.
- Coupling을 공격할 각도를 제공한다.

하지만 특정 Hardpoint 하나만 잡아야 공격이 성공하는 숨은 정답은 없다.

Mandatory Route는 모두 기본 Rope 400px 이내로 설계한다.

---

## 6. Central Void / Recovery / Exit — 실패와 승리 처리

중앙 Void는 실제 추락 구역이다.

한 플레이어가 떨어져도 멀티플레이 전체 보스전은 멈추지 않는다.

```text
추락
→ 추락 피해
→ 생존 시 개인 Recovery Route
→ 현재 전투 구역으로 복귀
```

보스전이 끝나면:

```text
EXIT-1 활성
→ EXIT-2 활성
→ Rooftop Service Access 개방
```

으로 탈출한다.

---

# 플레이어가 실제로 하는 일

## P1 — Wall 규칙을 처음 배운다

```text
A Wall Warning 확인
→ Wall이 닫히기 전에 왼쪽으로 이동
→ A Wall 완전 잠금
→ A Coupling 공격
```

P1에는 Pulse가 없다.

플레이어는 **“Wall을 피하면 결합부가 열린다”**는 규칙 하나만 배운다.

---

## P2 — Wall을 피하면서 Pulse 반대쪽으로 계속 이동한다

```text
B Wall을 넘어 오른쪽 전투 구역 진입
→ INNER Warning이면 OUTER로 이동
→ OUTER Warning이면 INNER로 이동
→ B Wall 완전 잠금
→ Pulse 종료
→ B Coupling 공격
```

P1에서 배운 Wall 규칙에
“한 위치에 오래 머무르지 말라”는 조건이 추가된다.

---

## P3-A — A/B Wall이 동시에 내려와 중앙 공간을 좁힌다

```text
A Wall + B Wall 동시 하강
→ 두 Wall 사이 중앙 구역에 갇힘
→ LEFT / RIGHT Pulse 회피
→ A/B Wall 완전 잠금
```

A와 B를 다시 파괴하는 단계가 아니다.

두 Wall은 이미 파괴된 구동 장치를 부활시키는 것이 아니라
Core의 비상 제어로 Wall만 다시 움직이는 것이다.

---

## P3-B — Main Wall까지 내려와 가장 좁은 공간에서 싸운다

```text
Main Wall 하강
→ 중앙 구역이 좌/우 두 Cell로 나뉨
→ UPPER / LOWER Pulse 회피
→ Main Wall 완전 잠금
→ Main Coupling 공격
```

이 구간이 Boss05의 난이도 최고점이다.

---

## Final — 더 이상 피하지 않고 Core만 마무리한다

Main Coupling을 파괴하면:

```text
A/B/Main Wall 모두 천장 복귀
→ 모든 Pulse 영구 종료
→ Core 외피 완전 개방
```

이후에는 새 공격이 없다.

플레이어는 노출된 Central Core에 접근해 HP를 모두 깎으면 된다.

---

# 설계 우선순위

## 1순위 — 플레이어가 항상 “Core가 Wall을 움직였다”고 이해해야 한다

공격이 시작될 때:

```text
Core 제어선 점등
→ 해당 Actuator 반응
→ 연결된 Wall Warning
→ Wall 이동
```

순서가 보여야 한다.

Wall만 갑자기 움직이면 안 된다.

---

## 2순위 — Wall 회피 성공이 바로 공격 기회로 이어져야 한다

```text
Wall을 올바르게 회피
→ Wall 완전 잠금
→ Pulse 종료
→ Coupling 즉시 노출
```

사이에 추가 스위치, 추가 적 처치, 숨은 퍼즐을 넣지 않는다.

---

## 3순위 — 진행도는 실제 공간 상태로 확인할 수 있어야 한다

HUD를 보지 않아도 다음 차이가 보여야 한다.

```text
A 파괴
→ A 제어선 OFF
→ Core 1/3 개방

B 파괴
→ B 제어선 OFF
→ Core 2/3 개방

Main 파괴
→ 모든 Wall 상승
→ 모든 Pulse OFF
→ Core 완전 개방
```

---

## 4순위 — 공격은 먼저 보고 피할 수 있어야 한다

모든 공격은:

```text
경고
→ 실제 공격
→ 종료
```

순서를 가진다.

Warning 중에는 피해가 없다.

화면에 표시된 위험 범위와 실제 피해 판정 범위가 반드시 같아야 한다.

---

## 5순위 — P3-B 이후 난이도를 더 올리지 않는다

P3-B에서:

- A/B/Main Wall
- 좁은 좌우 Cell
- UPPER/LOWER Pulse
- Main Coupling 공격

을 모두 처리한다.

따라서 Main 파괴 후에는 새 공격, 새 적, 새 퍼즐, Timer를 추가하지 않는다.

Final은 Core 마무리와 탈출만 남긴다.

---

# 처음 읽을 때 절대 헷갈리면 안 되는 8가지

1. **Wall은 Boss 본체가 아니다. Core가 Boss다.**
2. **Wall을 파괴하는 것이 아니라 Wall이 잠긴 뒤 열린 Coupling을 공격한다.**
3. **A/B/Main Coupling의 피해는 한 번의 노출에서 못 끝내도 다음 시도에 유지된다.**
4. **P3-A에서 A/B 체력이 부활하지 않는다. Wall만 다시 움직인다.**
5. **Main Coupling은 왼쪽/오른쪽 두 개가 아니라 하나의 HP다.**
6. **Pulse는 Rope를 자르지 않는다. Rope Cut은 움직이는 Wall과 실제 Rope가 교차할 때만 발생한다.**
7. **한 Player가 Void에 떨어져도 다른 Player의 전투 단계와 Coupling HP는 유지된다.**
8. **Main 파괴 뒤에는 Wall과 Pulse가 다시 시작되지 않는다.**

---

# 이 문서를 읽는 순서

처음 보는 사람은:

```text
먼저 읽기
→ 핵심 요소 6개
→ 플레이어가 실제로 하는 일
→ 설계 우선순위
```

까지만 읽으면 보스 구조를 이해할 수 있다.

그 다음부터는 개발자가 실제 구현할 때 필요한:

```text
현재 코드 재사용 범위
→ 새로 구현할 기능
→ 세부 좌표/시간
→ 충돌/멀티플레이/복귀
→ QA
```

순서로 읽으면 된다.

---

# 0. 개발자가 30초 안에 확인할 핵심 내용

## 0.1 현재 결론

Boss05의 기획·전투·공간 구조는 **설계 확정**다.

실제 보스:

# **SUSPENDED CONTINUITY CONTROL CORE**

전투의 네 진행 Target:

```text
P1
AUX ACTUATOR A COUPLING

P2
AUX ACTUATOR B COUPLING

P3
MAIN ACTUATOR COUPLING

FINAL
CENTRAL CORE
```

공통 전투 Loop:

```text
CORE COMMAND
→ WALL WARNING
→ SLOT SHUTTER OPEN
→ WALL MOVE
→ CONTROL PULSE
→ WALL FULL LOCK
→ PULSE OFF
→ COUPLING EXPOSED
→ PLAYER DAMAGE WINDOW
```

Coupling을 한 번의 노출에서 파괴하지 못해도:

```text
DAMAGE PERSISTS
→ COUPLING CLOSE
→ WALL RISE
→ SAME PHASE RETRY
```

P3 Main 실패만:

```text
P3-B FAIL
→ A/B/MAIN WALL RISE
→ MAIN DAMAGE PERSISTS
→ P3-A RESTART
```

Final에는 새 공격이 없다.

```text
MAIN DESTROYED
→ ALL WALLS UP
→ ALL PULSE OFF
→ CORE FULL OPEN
→ FINAL CORE
→ CONTROL LOST
```

---

## 0.2 상태 표기 기준

이 BRIEF는 구현 판단을 다음 세 상태로 구분한다.

### 코드 확인 완료

현재 `main` 코드에서 실제 존재와 동작 경계를 확인한 것.

### 설계 확정

게임 규칙과 기획은 확정되었지만 아직 Runtime 구현 여부와 별개인 것.

### 미구현

현재 `main`에서 Boss05용 실제 Runtime 또는 연결이 없는 것.

---

## 0.3 구현 상태 — AUTHORING SNAPSHOT 코드 점검

점검 기준:

```text
AUTHORING SNAPSHOT
3301269a4de30f54a71a4361c3f9fc7f665a93cb
```

| 항목 | 상태 | snapshot 확인 내용 |
|---|---|---|
| 공통 Boss Stage 정의 | **코드 확인 완료** | `BossStageDefinition.js` 존재 |
| 공통 Boss Encounter Runtime | **코드 확인 완료** | `BossEncounterRuntime.js` 존재 |
| Boss participant scaling / defeat / snapshot | **코드 확인 완료** | 공통 Runtime이 소유 |
| Rope Impact | **코드 확인 완료** | `RopeImpactAttack.js` 존재 |
| Augment combat | **코드 확인 완료** | `AugmentCombatRuntime.js` 존재 |
| Impact target registry | **코드 확인 완료** | 현재 Boss 공격 target 경로에서 사용 |
| Polygon collision | **코드 확인 완료** | `PolygonCollider.js` 존재 |
| Broad phase | **코드 확인 완료** | `CollisionBroadPhase.js` 존재 |
| Rope segment/surface intersection | **코드 확인 완료** | 기존 Rope attachment 경로에서 사용 |
| 기존 Rope Cut transition | **코드 확인 완료** | `GameSimulation`의 기존 rope-cut 흐름 존재 |
| Boss presentation pipeline | **코드 확인 완료** | `BossStagePresentation → BossStageWorldRenderer` |
| Boss polygon renderer registry | **코드 확인 완료** | Boss01/Boss02용 종류 존재 |
| Boss authoring pipeline | **코드 확인 완료** | `BossStageSpec` / generator / validator / catalog 존재 |
| Boss01 spec | **코드 확인 완료** | catalog/spec에 존재 |
| Boss02 spec | **코드 확인 완료** | catalog/spec에 존재 |
| Boss05 spec/catalog entry | **미구현** | 현재 catalog/spec에 없음 |
| `continuity-control-core` factory entry | **미구현** | Factory에 없음 |
| `ContinuityControlCoreRuntime` | **미구현** | 없음 |
| Boss05 Dynamic Partition | **미구현** | 없음 |
| Boss05 Slot/Shutter | **미구현** | 없음 |
| Boss05 Full-cell Pulse | **미구현** | 없음 |
| Personal Recovery Route | **미구현** | 없음 |
| Final Exit deployment Runtime | **미구현** | 없음 |

현재 `BossMechanismRuntimeFactory`가 지원하는 기구:

```text
rail-carriage
residential-security-pursuit
```

Boss05 추가 목표:

```text
continuity-control-core
→ ContinuityControlCoreRuntime
```

---

## 0.4 보스05 핵심 구성요소

아래 이름은 실제 구현에서 사용할 오브젝트·기구 이름이므로 유지한다.
각 항목은 추상적인 “역할” 대신 **플레이어에게 실제로 일어나는 일**, **화면에서 바뀌어야 하는 것**, **구현 완료를 확인하는 기준**으로 설명한다.

### 1. `Suspended Continuity Control Core`

보스05의 실제 본체다. 천장 가까운 중앙부에 매달려 있으며 P1부터 Final까지 같은 위치에 남는다.

#### 전투 중 실제 변화

```text
P1 시작
→ Core 외피 완전 닫힘
→ A/B/Main 제어선 모두 점등

AUX ACTUATOR A 파괴
→ A 제어선 소등
→ A Wall 천장으로 복귀
→ Core 외피 1/3 개방

AUX ACTUATOR B 파괴
→ B 제어선 소등
→ B Wall 천장으로 복귀
→ Core 외피 2/3 개방

MAIN COUPLING 파괴
→ Main 제어선 소등
→ A/B/Main Wall 모두 천장으로 복귀
→ 모든 Control Pulse 영구 종료
→ Core 외피 완전 개방

Final Core 파괴
→ Core 제어 신호 완전 종료
→ EXIT-1 / EXIT-2 활성
→ Rooftop Service Access 개방
```

#### 플레이어 판정

- P1~P3에서 닫혀 있는 Core 외피를 공격해도 단계 진행 피해는 0이다.
- A/B/Main Coupling이 현재 단계의 유효 공격 대상이다.
- Main 파괴 후에만 Core 자체가 유효 공격 대상이 된다.
- Final Core가 노출된 뒤에는 Wall과 Pulse가 다시 시작되지 않는다.

#### 구현 완료 확인

다음 네 장면을 캡처했을 때 Core 외피와 제어선 상태가 서로 달라야 한다.

1. P1 시작: 외피 닫힘
2. A 파괴 직후: 1/3 개방
3. B 파괴 직후: 2/3 개방
4. Main 파괴 직후: 완전 개방

단순히 “진동이 세진다” 같은 연출만으로 진행도를 표현하면 안 된다. **외피 개방량과 꺼진 제어선 수가 진행도를 직접 보여줘야 한다.**

---

### 2. `AUX ACTUATOR A`

P1의 왼쪽 보조 구동 장치다. A Wall을 움직이고, Wall이 바닥까지 내려가 완전히 잠긴 순간 A Coupling을 노출한다.

#### 플레이어에게 실제로 일어나는 일

```text
P1 시작
→ A Wall 경고 표시
→ A Wall 하강
→ Player가 Wall이 닫히기 전에 왼쪽 Cell로 이동
→ A Wall 완전 잠금
→ A Coupling 4초 노출
→ Player가 Rope Impact / 기존 공격으로 누적 피해
```

4초 안에 파괴하지 못하면:

```text
A Coupling 닫힘
→ A Wall 약 2초 동안 상승
→ A Wall이 천장에 수납됨
→ 같은 P1 공격 다시 시작
→ 이전에 준 A Coupling 피해는 유지
```

A를 파괴하면:

```text
A Wall 재사용 공격 종료
→ A 제어선 OFF
→ Core 외피 1/3 개방
→ CROSS 활성
```

#### P3-A에서의 처리

A의 체력은 부활하지 않는다.
P3-A에서 다시 움직이는 것은 **A Wall뿐**이다. A Coupling을 다시 공격하는 단계가 아니다.

---

### 3. `AUX ACTUATOR B`

P2의 오른쪽 보조 구동 장치다. B Wall과 INNER/OUTER Pulse를 한 공격 사이클로 묶는다.

#### 플레이어에게 실제로 일어나는 일

```text
P2 시작
→ B Wall 경고
→ B Wall 하강
→ 약 0.8초 뒤 첫 Pulse 경고
→ INNER / OUTER가 번갈아 공격
→ B Wall 완전 잠금
→ Pulse 즉시 종료
→ B Coupling 4초 노출
```

Player는 오른쪽 전투 구역 안에서:

```text
INNER 공격
→ OUTER 쪽으로 이동

OUTER 공격
→ INNER 쪽으로 이동
```

을 반복한다.

하단 발판에 내려가도 Pulse를 피할 수 없다. Pulse는 오른쪽 전투 구역 전체 높이에 적용된다.

B Coupling을 한 번의 노출에서 파괴하지 못하면:

```text
B Coupling 닫힘
→ B Wall 상승
→ B 누적 피해 유지
→ P2 처음부터 다시 시작
```

B 파괴 시:

```text
B 제어선 OFF
→ Core 외피 2/3 개방
```

P3-A에서는 B 체력 역시 부활하지 않는다.

---

### 4. `MAIN DRIVE MODULE / MAIN COUPLING`

P3-B의 최종 구동부다. A/B Wall 사이로 압축된 중앙 구역에 Main Wall을 내려 좌/우 Cell을 만든다.

#### 플레이어에게 실제로 일어나는 일

```text
P3-A에서 A/B Wall 완전 잠금
→ P3-BRIDGE 비활성
→ Main Wall 경고
→ Main Wall 하강
→ 각 좌/우 Cell에서 UPPER / LOWER Pulse 반복
→ Main Wall 완전 잠금
→ Pulse 종료
→ Main Wall 점검용 Aperture 개방
→ MAIN COUPLING 4초 노출
```

#### Main Coupling 판정

왼쪽과 오른쪽에서 보이는 공격 기회가 서로 다른 체력이 아니다.

```text
LEFT SIDE HIT
┐
├→ MAIN COUPLING 하나의 HP
┘
RIGHT SIDE HIT
```

- Player는 Aperture를 통과할 수 없다.
- Rope Impact / Projectile / 기존 Augment 공격은 Aperture를 통해 Main Coupling에 도달할 수 있다.
- Main Wall의 solid 영역에 먼저 닿은 공격은 차단한다.

#### 실패

```text
4초 내 Main 미파괴
→ Main Coupling 닫힘
→ Main/A/B Wall 모두 상승
→ Main 누적 피해 유지
→ P3-A부터 다시 시작
```

---

### 5. `A / MAIN / B Sliding Partition Wall`

세 Wall은 단순 시각 효과가 아니라 실제 충돌 구조물이다.

#### Player와의 상호작용

Wall 이동 중 Player가 실제 Wall 충돌면에 닿으면:

```text
작은 피해
→ 가장 가까운 정상 좌/우 Cell 방향으로 밀어냄
```

아래쪽 Void 방향으로 강제로 밀지 않는다.

Wall 완전 잠금 후:

```text
Player collision = 유지
contact damage = 종료
```

#### Rope와의 상호작용

새 Rope Hook:

```text
Player
→ Wall
→ 뒤쪽 Hardpoint
```

이면 뒤쪽 Hardpoint를 선택할 수 없다.

이미 연결된 Rope:

```text
moving Wall polygon
×
실제 Player↔Anchor Rope 선분
```

이 교차하는 프레임에만 기존 Rope Cut 처리를 실행한다.

- 하강 중 교차 → Rope Cut
- 상승 중 교차 → Rope Cut
- Wall 정지 상태 → 지속 Rope Cut 없음

#### 공격과의 상호작용

Projectile 또는 Action attack이:

```text
Player → Wall → Coupling
```

순서로 지나가면 Wall에서 차단한다.

---

### 6. `220px Wall Slot + Shutter`

Wall 이동축과 Platform이 겹치는 부분에 만드는 전용 통과 구조다.

```text
Wall 폭 = 180px
Slot 폭 = 220px
```

#### 평상시

```text
Shutter CLOSED
→ Platform 표면이 이어짐
→ Player가 정상 발판처럼 이동 가능
```

#### Wall 작동 직전

```text
Wall Warning
→ Slot Shutter Warning
→ Slot 위 Player overlap 확인
→ Player를 가까운 정상 Platform으로 수평 밀어냄
→ Shutter OPEN
→ Wall 이동
```

#### Wall 천장 수납 후

```text
Wall이 Slot 위를 완전히 빠져나감
→ Shutter CLOSE
→ Platform 표면 복구
```

#### 구현 완료 확인

- Wall이 닫힌 Shutter를 뚫고 지나가는 프레임이 없어야 한다.
- Shutter가 열리는 순간 Player가 슬롯 위에 남아 Void로 떨어지는 경우가 없어야 한다.
- Wall이 천장에 수납된 뒤 Slot이 계속 열린 채 남아 있으면 실패다.

---

### 7. `Control Pulse`

특정 위치에 오래 있지 못하게 하는 전투 구역 공격이다. “위험해 보이는 이펙트”가 아니라 실제 공격 범위가 명확히 정의되어야 한다.

#### P2

B Wall 오른쪽 전투 구역:

```text
x < 3750
→ INNER

x >= 3750
→ OUTER
```

INNER와 OUTER가 번갈아 활성된다.
각 영역은 해당 전투 구역의 천장~바닥 전체 높이를 공격한다.

#### P3-A

A Wall과 B Wall 사이 중앙 전투 구역:

```text
LEFT
↔
RIGHT
```

가 번갈아 활성된다.

`P3-BRIDGE`는 중앙에 있기 때문에 어느 쪽 Pulse가 활성되어도 안전지대가 아니다.

#### P3-B

Main Wall로 나뉜 좌/우 Cell 각각에서:

```text
y < 840
→ UPPER

y >= 840
→ LOWER
```

를 번갈아 공격한다.

#### 공통 시간 흐름

```text
0.7초 Warning
→ Warning 동안 피해 없음
→ 약 0.35초 실제 공격
→ 작은 피해 + 짧은 knockback
→ 약 0.8초 간격
→ 다음 구역 Warning
```

Pulse는 Rope Cut이나 강제 Rope 해제를 하지 않는다.

#### 구현 완료 확인

Warning으로 표시된 직사각형/다각형과 실제 Active hazard collider가 같은 위치와 크기여야 한다.
Warning보다 실제 피해 범위가 넓거나 좁으면 실패다.

---

### 8. `Phase-gated Service Hardpoint`

전투 단계에 따라 활성/비활성되는 Rope 연결 지점이다. 각 Hardpoint는 사용 시점이 정해져 있다.

#### `A-STRIKE`

- P1 왼쪽 Route에서 A Coupling까지 약 384px.
- Base Rope 400px 이내.
- A Coupling을 공격하기 좋은 지점이지만 필수 정답은 아니다.

#### `B-STRIKE`

- P2 오른쪽 Route에서 B Coupling까지 약 378px.
- Base Rope 400px 이내.
- B Coupling 공격 각도를 확보하는 추천 지점이다.

#### `CROSS`

```text
P1 시작 = OFF
A 파괴 = ON
P3 시작 = OFF
```

L8 → CROSS → R8 이동을 가능하게 한다.

#### `P3-BRIDGE`

```text
P3-A = ON
P3-B 시작 = OFF
```

P3-A 중앙 좌우 이동용이다.
Pulse 안전지대로 사용하지 못한다.

#### `P3-LOW-L / P3-LOW-R`

P3-B에서 UPPER Pulse가 활성됐을 때 아래쪽으로 이동할 수 있는 Rope 지점이다.

#### 비활성화 순간

이미 해당 Hardpoint에 Rope가 붙어 있다면:

```text
즉시 새 attach 금지
→ 현재 Rope 안전 해제
→ ropeDisabled 페널티 없음
```

Wall Rope Cut과 다른 처리다.

---

### 9. `Central Void + Personal Recovery Route`

Central Void는 실제 낙하 위험 구역이다. 전투 중 중앙에 떨어져도 받아주는 영구 바닥을 두지 않는다.

#### 추락 처리

```text
Player가 Void 낙하 경계를 통과
→ 기존 fall damage 적용
```

HP가 남으면:

```text
P1/P2/P3-A
→ 현재 단계에 맞는 Entry Recovery 위치로 이동

P3-B
→ 추락 직전 LEFT Cell이었다면 LEFT Entry Recovery
→ 추락 직전 RIGHT Cell이었다면 RIGHT Entry Recovery
```

그 뒤 해당 Player에게만 Recovery Hardpoint를 활성화한다.

#### 멀티플레이

한 Player가 떨어져도:

```text
Boss Phase = 그대로 진행
다른 Player = 위치/공격 상태 유지
Coupling 누적 피해 = 유지
```

추락한 Player만 복귀한다.

#### Recovery 보호

Recovery 상태인 Player에게:

```text
Control Pulse damage = 0
moving Wall contact damage = 0
Boss05 hazard damage = 0
```

하지만:

```text
Wall collision = 정상
Platform collision = 정상
Rope physics = 정상
Void 재추락 = 가능
```

또한 Recovery 상태에서는 Boss target에 주는 피해를 0으로 한다.
현재 legal combat cell에 다시 들어오면 Recovery 보호와 Recovery Hardpoint를 즉시 끈다.

---

### 10. `EXIT-1 / EXIT-2 + Rooftop Service Access`

Boss05 완료 뒤에만 생기는 최종 탈출 연결이다.

#### Final Core 파괴 전

```text
EXIT-1 = OFF
EXIT-2 = OFF
Rooftop Service Access = LOCKED
```

#### Final Core 파괴 직후

```text
모든 Wall 천장 수납
→ 모든 Pulse 영구 종료
→ Core 공격 판정 종료
→ EXIT-1 ON
→ EXIT-2 ON
→ Rooftop Service Access OPEN
```

좌표:

```text
EXIT-1 = (2600,400)
EXIT-2 = (2600,180)
```

Base Rope 연결:

```text
TOPL/TOPR → EXIT-1 ≈ 333px
EXIT-1 → EXIT-2 = 220px
```

따라서 Long Rope 없이도 탈출 가능하다.

#### 구현 완료 확인

전투 중 EXIT Hardpoint에 Rope를 걸 수 있으면 실패다.
Final Core 파괴 후에는 추가 적이나 새 공격 없이 EXIT Route만 남아야 한다.

## 0.5 구현 원칙 — 기존 코드 재사용 → 최소 확장 → 보스05 전용 신규 구현

구현 순서는 다음 원칙을 지킨다.

```text
1. 기존 기능 그대로 재사용
2. 기존 generic 경계만 최소 확장
3. Boss05 전용 기구 기능만 신규 작성
4. 새 global system은 만들지 않음
```

---

## 0.6 기존 게임 코드 — 그대로 재사용할 부분

### A. Boss 공통 정의

파일:

```text
src/game/boss/BossStageDefinition.js
```

**코드 확인 완료 / 기존 코드 그대로 재사용**

사용:

- `BossStageDefinition`
- `scaledHealth()`
- phase health
- `weakTargetId`
- `mechanicId`
- participant count scaling
- Boss HUD / source / next-area metadata

Boss05용 별도 체력 프레임워크를 만들지 않는다.

---

### B. Boss 공통 Runtime

파일:

```text
src/game/boss/BossEncounterRuntime.js
```

**코드 확인 완료 / 기존 코드 그대로 재사용**

사용:

- `start()`
- `advance()`
- `applyImpact()`
- `applyDamage()`
- `applyHazardContact()`
- `handlePlayerDefeat()`
- `snapshot()`
- `restore()`

이 공통 Runtime이 실제로 관리하는 값과 처리:

- 현재 참가 Player 목록과 생존 상태
- 현재 Boss 시도 횟수/진행 상태
- 현재 Phase HP
- `applyImpact()` / `applyDamage()`를 통한 피해 반영
- Phase HP가 0이 되었을 때 다음 Phase 전환
- Final HP가 0이 되었을 때 Boss 완료 처리
- 전원 사망 시 defeat/retry 처리
- `snapshot()` / `restore()`를 통한 상태 저장·복원

`ContinuityControlCoreRuntime`은 이것을 대체하지 않는다.

---

### C. Boss Impact Target

현재 코드:

```text
ImpactTarget
ImpactTargetRegistry
BossEncounterRuntime.applyImpact()
```

**코드 확인 완료 / 기존 코드 그대로 재사용 + 대상 데이터만 확장**

Boss05에서 Target:

```text
P1    aux-a-coupling
P2    aux-b-coupling
P3    main-coupling
FINAL central-core
```

새 Boss05 전용 Damage API를 만들지 않는다.

---

### D. 기본 Rope 공격

파일:

```text
src/game/combat/RopeImpactAttack.js
```

**코드 확인 완료 / 기존 코드 그대로 재사용**

사용:

- `RopeImpactAttack`
- `ropeImpactDamageForSpeed()`

Boss05용 별도 공격 버튼 또는 별도 Rope Impact 시스템을 만들지 않는다.

Base Rope Impact만으로 Mandatory clear가 가능해야 한다.

---

### E. 기존 Augment 공격

파일:

```text
src/game/augments/AugmentCombatRuntime.js
```

**코드 확인 완료 / 기존 코드 그대로 재사용**

허용되는 기존 공격 흐름:

- Action attack
- Projectile attack
- Rope Electric
- Collision Explosion
- 기타 현재 정상 Augment Impact

원칙:

```text
AUGMENT = 공략 선택지 확대
AUGMENT ≠ 필수 열쇠
```

---

### F. Polygon Collision

파일:

```text
src/game/physics/colliders/PolygonCollider.js
```

**코드 확인 완료 / 기존 코드 그대로 재사용**

사용:

- moving Wall collision shape
- Pulse area overlap
- Player/Wall collision
- Boss 구조물 collision

새 충돌 엔진을 만들지 않는다.

---

### G. Broad Phase

파일:

```text
src/game/physics/spatial/CollisionBroadPhase.js
```

**코드 확인 완료 / REUSE**

기존 공간 탐색/충돌 후보 축소 구조를 유지한다.

Boss05에서는 현재 frame의 dynamic Wall surface를 이 구조에 연결한다.

---

### H. Rope segment intersection

현재 Rope 입력/geometry 경로에서 사용하는:

```text
segmentIntersectsSurface()
```

**코드 확인 완료 / 기존 코드 그대로 재사용**

사용:

```text
active Rope segment
×
moving Partition surface
```

교차 여부 확인.

새 선분 충돌 알고리즘을 만들지 않는다.

---

### I. 기존 Rope Cut transition

현재 `GameSimulation`의 기존 rope-cut 흐름:

```text
rope detach/release
swing state clear
launcher clear
existing rope-disabled handling
```

**코드 확인 완료 / REUSE**

Boss05 Wall은 이 기존 transition을 호출하도록 일반화한다.

Wall 전용 별도 Rope 객체를 만들지 않는다.

---

### J. Boss Presentation / Renderer Pipeline

파일:

```text
src/render/boss/BossStagePresentation.js
src/render/boss/BossStageWorldRenderer.js
src/render/boss/BossPolygonObjectRenderers.js
```

**코드 확인 완료 / 기존 처리 흐름 재사용**

흐름:

```text
Boss Runtime Snapshot
→ BossStagePresentation
→ BossStageWorldRenderer
→ registered polygon renderer
```

새 Boss05 전용 렌더링 엔진을 만들지 않는다.

---

### K. Boss Authoring Pipeline

현재 구조:

```text
src/game/boss-authoring/specs/
src/game/boss-authoring/BossStageSpec.js
src/game/boss-authoring/BossStageSpecGenerator.js
src/game/boss-authoring/BossStageSpecValidator.js
src/game/boss-authoring/BossStageCatalog.js
```

**코드 확인 완료 / 기존 처리 흐름 재사용**

현재 catalog에는 Boss01 / Boss02만 있다.

Boss05도 같은 authoring → validate → generate → catalog 경로에 들어가야 한다.

별도 하드코딩 Boss Definition을 `GameSimulation`에 추가하지 않는다.

---

## 0.7 기존 게임 코드 — 기존 구조를 유지한 채 확장할 부분

### A. `BossMechanismRuntimeFactory.js`

현재:

```text
rail-carriage
residential-security-pursuit
```

추가:

```text
continuity-control-core
```

연결:

```text
continuity-control-core
→ ContinuityControlCoreRuntime
```

분류:

# **기존 시스템 확장**

새 Factory를 만들지 않는다.

---

### B. Boss authoring catalog/spec

추가할 authored content:

```text
src/game/boss-authoring/specs/boss-05.json
```

generator output:

```text
Boss05Stage.generated.js
```

catalog:

```text
BOSS_STAGE_CATALOG
```

에 Boss05 등록.

분류:

# **기존 저작 시스템 위에 새 보스 콘텐츠 추가**

새 authoring framework를 만들지 않는다.

---

### C. `GameSimulation.js`

현재 공통 Boss path를 유지하면서 Boss01/Boss02 전용 가정을 일반화한다.

확장 대상:

1. mechanism이 제공하는 실제 Boss target snapshot 위치
2. generic Boss hazard actor
3. Boss05 Full-cell Pulse contact
4. moving Partition collision source
5. Wall Rope Cut source
6. Wall projectile/attack occlusion
7. per-player Recovery state 적용
8. Final Exit deployment 반영
9. Boss05 중 join/rejoin recovery
10. Phase ready-player transition

분류:

# **기존 시뮬레이션 확장**

Boss05용 별도 GameSimulation을 만들지 않는다.

---

### D. Rope attachment occlusion

현재 Rope attachment 차폐는 특정 divider 종류를 기준으로 하는 경로가 있다.

권장 generic 확장:

```text
surface.ropeOccluder === true
```

Boss05 Partition:

```text
ropeOccluder = true
```

분류:

# **기존 Rope 입력 처리 확장**

---

### E. Player Projectile surface occlusion

현재 Player projectile → enemy/Boss target 경로는 재사용한다.

추가:

```text
previous projectile position
→ next projectile position
→ first blocking Partition intersection
```

Wall이 Boss target보다 먼저 맞으면:

```text
PROJECTILE BLOCKED
```

분류:

# **기존 Projectile 처리 확장**

새 Boss05 projectile 시스템을 만들지 않는다.

---

### F. Dynamic Collision Source

Wall 위치 변화 시:

```text
visible Wall position
=
current collision surface position
```

이 되도록 current-frame collision source를 갱신한다.

Broad phase에 stale Wall이 남으면 안 된다.

분류:

# **기존 충돌 처리 흐름 확장**

---

### G. Boss Polygon Renderer Registry

현재 renderer 종류에는 Boss01/Boss02용:

```text
carriage
beam
ram
weakpoint
residential-pursuer
charge-line
slam-zone
dive-line
architecture-impact
```

등이 존재한다.

Boss05 추가 종류:

```text
continuity-core
actuator
partition-wall
slot-shutter
control-pulse
coupling
maintenance-aperture
recovery-hardpoint
exit-hardpoint
```

분류:

# **기존 Renderer 등록 체계 확장**

새 Renderer Pipeline 금지.

---

## 0.8 보스05 전용으로 새로 만들어야 하는 것

다음은 공통 시스템이 아니라 **Boss05-specific 신규 기능**이다.

### 1. `ContinuityControlCoreRuntime`

권장 파일:

```text
src/game/boss/ContinuityControlCoreRuntime.js
```

상태 소유:

- P1 / P2 / P3-A / P3-B / Final substate
- A/B/Main Wall position/state
- Wall warning / descent / lock / rise
- Slot Shutter state
- Pulse state / active region
- Coupling exposure
- Core shell 0/3 → 1/3 → 2/3 → full
- temporary hardpoint activation
- Main maintenance aperture
- per-player Recovery state
- per-player Recovery target cell
- Exit deployment
- hazard sequence

분류:

# **미구현 / 보스05 전용 신규 기구**

---

### 2. Dynamic Partition state adapter

Boss05 Runtime의 Wall state를 실제 world collision surface로 변환한다.

필수:

```text
rendered position
=
collision position
```

분류:

# **미구현 / 보스05 전용 연결부**

---

### 3. Slot / Shutter state

상태:

```text
closed
warning
open
closing
```

Wall 작동 직전에만 해당 Slot을 연다.

분류:

# **미구현 / 보스05 전용 기믹**

---

### 4. Full-cell Control Pulse state

P2:

```text
INNER / OUTER
```

P3-A:

```text
LEFT / RIGHT
```

P3-B:

```text
UPPER / LOWER
```

Warning / Active / Recovery state와 hazard sequence를 가진다.

분류:

# **미구현 / 보스05 전용 공격 판정**

---

### 5. Personal Recovery Route

per-player:

```text
active
reason
targetCell
protection
```

상태를 소유.

분류:

# **미구현 / 보스05 전용 복귀 기능**

---

### 6. Final Exit deployment

Core defeat 후:

```text
EXIT-1 ON
EXIT-2 ON
ROOFTOP SERVICE ACCESS OPEN
```

분류:

# **미구현 / 보스05 완료 처리**

---

## 0.9 새로 만들지 말아야 하는 공통 시스템

Boss05 때문에 다음 global system을 새로 만들지 않는다.

- 새 Boss health framework
- 새 Boss participant framework
- 새 Boss damage framework
- 새 Rope Impact attack system
- 새 Rope physics
- 새 collision engine
- 새 broad-phase engine
- 새 Player projectile system
- 새 augment system
- 새 Boss renderer pipeline
- 새 snapshot framework
- Boss05 전용 별도 `GameSimulation`

필요한 것은:

```text
EXISTING GENERIC SYSTEM
+
MINIMAL EXTENSION
+
BOSS05 MECHANISM
```

이다.

---

## 0.10 구현 우선순위

### P0 — 전투 규칙이 틀리지 않도록 만드는 핵심 구현

가장 먼저 구현/검증:

1. Boss05 authoring spec / catalog
2. `ContinuityControlCoreRuntime`
3. 현재 active Target만 Phase Damage 인정
4. `closedBodyDamageMultiplier = 0`
5. `weakFixedPercent = 0`
6. Wall authoritative state / snapshot
7. visible Wall = collision Wall

P0 실패 시 나머지 연출 작업을 진행하지 않는다.

---

### P1 — 공간 통제 핵심 구현

1. Wall Slot/Shutter
2. Wall descent / lock / rise
3. Player Wall contact push
4. Hook occlusion
5. Projectile / attack occlusion
6. actual Rope segment × moving Wall Rope Cut
7. temporary hardpoint ON/OFF + Safe Release

---

### P2 — 단계별 공격과 멀티플레이 처리

1. P2 Full-cell INNER/OUTER
2. P3-A A/B emergency Wall + LEFT/RIGHT
3. P3-B Main Wall + UPPER/LOWER
4. Void fall
5. Personal Recovery Route
6. one-player-ready Phase start
7. join/rejoin Recovery
8. Recovery protection / attack exploit block

---

### P3 — 연출 및 최종 다듬기

1. Core shell 1/3 → 2/3 → Full Open
2. Core → Actuator → Wall signal readability
3. Warning VFX / sound
4. Boss05 renderer kinds
5. Camera framing
6. Final `CONTROL LOST`
7. EXIT-1 / EXIT-2 deployment
8. Rooftop Service Access opening

---

## 0.11 구현 완료 최소 판정 기준

Boss05는 다음이 모두 확인되어야 Runtime 구현 완료로 본다.

```text
1P Base Rope clear
4P multiplayer clear
P1/P2/P3-A/P3-B/Final full cycle
failed exposure damage persistence
P3 Main fail → P3-A restart
Wall Hook occlusion
Wall projectile occlusion
moving Wall Rope Cut
Void Recovery
late player Recovery
snapshot/restore
join/rejoin
Final Exit
```

그리고:

```text
보이지 않는 충돌벽 금지
보이지 않는 피해 판정 금지
닫힌 본체 공격으로 단계 진행 금지
영구 안전지대 금지
특정 Augment 필수 금지
```

---

---

# 1. 한 줄 정의 — 위의 전체 설명을 개발/기획 용어로 압축한 문장

**5-8 CONTINUITY COMMAND SPINE에서 Player는 이미 실제 Cascade, Capacity 부족, 상층 우선 유지, Lower Ascent suspension 승인, 실제 하층 대피 중단, 그리고 Incident Continuity Control의 조직적 책임까지 확인했다. Rooftop Service Access로 탈출하려는 순간, 중앙 Void 위의 SUSPENDED CONTINUITY CONTROL CORE가 Chamber 전체를 Sliding Partition Wall과 Control Pulse로 재구성해 탈출을 차단한다. Player는 AUX A → AUX B → Emergency Auxiliary Control → MAIN ACTUATOR 순으로 공간 통제를 무너뜨리고, 모든 Partition과 Pulse가 정지한 뒤 완전히 노출된 Central Core에 최종 공격을 가해 “시스템을 파괴한다”기보다 “통제를 정지시킨다.”**

---

# 2. 보스05의 정체성

## 2.1 Boss는 Wall이 아니다

실제 Boss:

# **SUSPENDED CONTINUITY CONTROL CORE**

Player가 공격해야 하는 진행 대상은 Wall 자체가 아니다.

Wall은 Core가 내린 명령에 따라 움직이고,
Wall이 완전히 잠긴 뒤 해당 Actuator의 Coupling이 공격 가능 상태가 된다.

화면에서 다음 순서가 확인되어야 한다.

```text
Core에서 제어 신호 점등
→ 해당 Actuator 표시등 점등
→ 해당 Wall Warning
→ Wall 이동
→ Wall FULL LOCK
→ Coupling OPEN
```

따라서 Player가 P1 화면을 한 번만 봐도:

```text
Core가 명령한다
→ Wall이 움직인다
→ Wall이 잠기면 약점이 열린다
```

를 알 수 있어야 한다.

Control Pulse 역시 별도 적이 아니다.
P2/P3에서 Core가 현재 전투 Cell의 특정 영역을 위험 구역으로 지정하는 공격이다.

Boss 정체성을 확인하는 최소 화면 요소:

- 상부 중앙 Core가 카메라에 보임
- Core→Actuator 제어선이 현재 활성 대상만 점등
- 현재 움직이는 Wall과 연결된 Actuator가 같은 신호 상태를 사용
- Wall 잠금 순간 Coupling의 색/형태가 공격 가능 상태로 바뀜

# 3. 섹터05 스토리에서의 위치

보스05는 새로운 문서나 음성 기록으로 정보를 추가하지 않는다.

Boss 직전 5-8에서 Player는 이미 다음 순서를 확인했다.

```text
실제 Cascade 발생
→ Capacity 부족 확인
→ 상층 보존 우선순위 결정
→ Lower Ascent 중단 승인
→ 실제 Lower evacuation 중단
→ Incident Continuity Control의 책임 확인
```

탈출 목표도 이미 보인다.

```text
ROOFTOP PAD 03
MAINTENANCE SHUTTLE / STANDBY
ROOFTOP SERVICE ACCESS / ROUTE AVAILABLE
```

Boss05가 이 내용을 반복 설명하는 대신 실제 플레이로 연결하는 방식은 다음과 같다.

```text
5-8:
"누가 어떤 경로를 계속 유지할지 결정했다"는 기록 확인

Boss05:
Core가 실제 Chamber의 경로를 Wall로 닫고,
Pulse로 특정 Cell을 비우게 하며,
Rooftop route를 잠근 상태로 유지

Boss defeat:
Control Core 정지
→ Wall/Pulse 정지
→ Rooftop Service Access 재개방
```

즉 스토리의 “경로 통제”가 Boss전에서는 실제 이동 제한으로 바뀐다.

Boss05에서 추가로 만들면 안 되는 것:

- 새로운 책임자 이름
- 새로운 사망자 수
- 새로운 Priority 문서
- 새로운 Authorization 문서
- Cascade가 계획된 사고였다는 반전
- Sector06의 결론

# 4. 보스05에서 새로 밝히면 안 되는 내용

Boss05는 다음을 새 Story Reveal로 만들지 않는다.

- 특정 CEO / 임원 / named executive villain
- 누군가의 개인적 복수
- Cascade가 계획된 사고였다는 주장
- 의도적으로 사람을 죽이라는 명령
- “아래 사람은 모두 죽었다”는 단정
- 새로운 Capacity/Priority 문서
- 새로운 Authorization 기록
- Sector06의 결론
- Rooftop 이후 세계의 진실

Canon:

```text
사고는 실제였다.
Capacity 부족도 실제였다.
Lower routing suspension은 승인됐다.
그 결과 실제 Lower evacuation이 중단됐다.
```

Boss05에서는 이 Canon을 다시 설명하는 대신 실제 Arena 상태로 바꾼다.

```text
전투 시작
→ Rooftop Service Access 잠김
→ Core가 A/B/Main Wall 제어권 보유
→ Wall이 Player 이동 경로를 실제로 폐쇄
→ Pulse가 특정 전투 구역 체류를 제한

Boss 완료
→ Wall 제어 종료
→ Pulse 종료
→ Rooftop Service Access 개방
```

즉 5-8에서 문서로 확인한 “경로를 유지하거나 중단하는 권한”이 Boss전에서는 실제 이동 가능/불가능 상태로 나타난다.

---

# 5. 기획 우선순위 상위 3개

## 우선순위 1 — Core가 항상 원인으로 보이게 한다

단순히 Core를 화면 중앙에 놓는다는 뜻이 아니다.

각 공격에서 아래 세 요소가 같은 공격 사이클 안에 실제로 순서대로 바뀌어야 한다.

```text
1. Core의 현재 제어선 점등
2. 같은 제어선의 Actuator 반응
3. 그 Actuator와 연결된 Wall 이동
```

P1 예:

```text
A 제어선 ON
→ AUX A 표시등 ON
→ A Wall Warning
→ A Wall 하강
```

P2 예:

```text
B 제어선 ON
→ AUX B 표시등 ON
→ B Wall 하강
→ 오른쪽 Cell Pulse 시작
```

P3-B 예:

```text
Main 제어선 ON
→ MAIN DRIVE MODULE 활성
→ Main Wall 하강
→ UPPER/LOWER Pulse 시작
```

Wall만 카메라에 보이고 Core/Actuator 반응이 전혀 보이지 않으면 이 우선순위를 충족하지 못한다.

---

## 우선순위 2 — Wall 회피 성공이 곧 Coupling 공격 기회가 되게 한다

Player가 Wall을 피한 뒤 다른 퍼즐을 찾아야 하는 구조로 만들지 않는다.

각 Phase는 동일한 인과관계를 사용한다.

```text
Wall Warning 확인
→ 닫히기 전에 올바른 Cell로 이동
→ Wall FULL LOCK
→ Pulse 종료
→ Coupling 자동 노출
→ 즉시 4초 공격 시간
```

따라서 약점 노출 조건은:

- 숨겨진 스위치 작동
- 특정 Anchor에서만 공격
- 별도 적 처치

가 아니다.

**Wall이 완전히 잠겼는가**가 Coupling 노출 조건이다.

---

## 우선순위 3 — 진행도는 Core 외형과 Chamber 상태로 즉시 구분한다

“통제력을 잃고 있다”는 추상 연출 대신 아래 상태가 실제로 바뀐다.

| 시점 | Core 외피 | 제어선 | Wall 상태 | 다음 이동 |
|---|---|---|---|---|
| P1 시작 | 닫힘 | A/B/Main ON | 모두 천장 | A route |
| A 파괴 | 1/3 개방 | A OFF | A 천장 복귀 | CROSS 활성 |
| B 파괴 | 2/3 개방 | A/B OFF | A/B 천장 복귀 | P3 진입 |
| P3-A | 2/3 개방 | Emergency Wall signal | A/B 재하강 | 중앙 Cell |
| Main 파괴 | 완전 개방 | Main OFF | A/B/Main 전부 상승 | Final Core |
| Final Core 파괴 | 무력화 | 전부 OFF | 전부 수납 | EXIT 활성 |

Player가 HUD를 보지 않아도 현재 진행도가 방의 상태로 구분되어야 한다.

# 6. 공간 구성 원칙

Boss05는 방을 바꾸지 않고 같은 Chamber의 통과 가능 영역을 단계마다 바꾼다.

고정되는 것:

- Core 위치
- 외곽 Chamber 경계
- 좌/우 Service Platform
- 주요 Base Rope Anchor 좌표
- Central Void 위치

단계에 따라 바뀌는 것:

- A/B/Main Wall의 높이와 잠금 상태
- Wall Slot Shutter의 개폐
- CROSS / P3-BRIDGE / Recovery / EXIT Hardpoint 활성 여부
- Pulse의 실제 위험 영역
- Core 외피 개방량

따라서 새 방으로 순간이동하거나 Stage geometry 전체를 교체하지 않는다.

P1에서 보였던 같은 A Wall 위치가 P3-A에서 다시 내려와야 하고,
P2에서 사용한 B Wall도 같은 위치에서 재가동되어야 한다.

## 6.1 외곽 Frame / Bracket

대형 Side Frame / L-shaped Frame / 장식용 외곽 Bracket은 사용하지 않는다.

이전 Preview처럼 플랫폼 주변을 큰 사각 프레임으로 감싸면:

- 실제 Platform 경계가 잘 안 보이고
- Rope Hardpoint와 장식 구조가 혼동되며
- Wall과 충돌 가능한 구조물인지 판단하기 어렵다.

따라서 최종 Preview에서는 Platform, Hardpoint, Wall, Core만 주요 실루엣으로 남긴다.

# 7. Anchor와 Platform의 역할 구분

```text
ANCHOR / HARDPOINT
= Rope가 걸리는 지점

PLATFORM
= Player가 실제로 서거나 회복할 수 있는 collision surface
```

모든 Platform이 grappleable인 것은 아니다.

모든 Anchor가 발판인 것도 아니다.

특히:

- Core Service Recess
- EXIT hardpoint
- Recovery hardpoint

는 발판이 아니다.

---

# 8. 기본 로프 사거리 기준

Base Rope Mandatory Reach:

```text
400px
```

Long Rope augment 없이도 Mandatory Route는 모두 통과 가능해야 한다.

Locked 핵심 좌표:

```text
ENTRY  = (2600,2520)

A-STRIKE = (1500,1230)
B-STRIKE = (3700,1230)

CROSS = (2600,760)

P3-BRIDGE = (2600,900)
P3-LOW-L = (2380,1030)
P3-LOW-R = (2820,1030)

MAIN COUPLING = (2600,980)

TOPL = (2380,650)
TOPR = (2820,650)

FINAL CORE ≈ (2600,450)

EXIT-1 = (2600,400)
EXIT-2 = (2600,180)
```

핵심 거리:

| 관계 | 거리 |
|---|---:|
| L5 → A-STRIKE | ≈212.60 |
| A-STRIKE → L6 | ≈138.92 |
| A-STRIKE → A | ≈384.19 |
| R5 → B-STRIKE | ≈212.60 |
| B-STRIKE → R6 | ≈138.92 |
| B-STRIKE → B | ≈378.02 |
| L8 → CROSS | ≈392.05 |
| CROSS → R8 | ≈392.05 |
| TOPL → P3-BRIDGE | ≈333.02 |
| P3-BRIDGE → TOPR | ≈333.02 |
| TOPL → P3-LOW-L | 380 |
| TOPR → P3-LOW-R | 380 |
| TOPL → MAIN | ≈396.61 |
| TOPR → MAIN | ≈396.61 |
| P3-LOW-L → MAIN | ≈225.61 |
| P3-LOW-R → MAIN | ≈225.61 |
| TOPL/TOPR → FINAL CORE | ≈297.32 |
| TOPL/TOPR → EXIT-1 | ≈333.02 |
| EXIT-1 → EXIT-2 | 220 |

모두 Base Rope 400px 이하.

---

# 9. 임시 Hardpoint 활성화 규칙

지름길은 거리로 막지 않고 **Phase Activation**으로 막는다.

## CROSS

```text
P1
OFF

A DESTROYED
ON

P3 START
OFF
```

## P3-BRIDGE

```text
P3-A
ON

P3-B START
OFF
```

## EXIT-1 / EXIT-2

```text
FIGHT
OFF

FINAL CORE DESTROYED
ON
```

Temporary hardpoint가 OFF될 때 이미 Rope가 붙어 있다면:

```text
SAFE RELEASE
NO ROPE-CUT PENALTY
```

로 처리한다.

---

# 10. Partition Wall 기본 구조

세 Wall은 독립 구조다.

```text
A WALL
x = 2020..2200

MAIN WALL
x = 2510..2690

B WALL
x = 3070..3250

width = 180px
ceiling y ≈ 100
floor top y ≈ 2460
```

Wall:

```text
collision = yes
grappleable = no
```

완전 폐쇄 시 천장→바닥을 실제로 막는다.

---

# 11. Wall Slot과 Shutter

Wall 이동축과 실제 Platform이 만나는 곳에는:

```text
220px WALL SLOT
```

을 둔다.

Wall 폭:

```text
180px
```

이므로 양쪽에 clearance가 남는다.

## 평상시

```text
SLOT SHUTTER CLOSED
→ 정상 발판처럼 사용
```

## 공격 직전

```text
WALL WARNING
→ SLOT SHUTTER WARNING
→ 슬롯 위 Player를 가장 가까운 정상 Platform 방향으로 밀어냄
→ SHUTTER OPEN
→ WALL MOVE
```

## Wall 천장 수납 완료

```text
SHUTTER CLOSE
```

Shutter는 플레이어를 끼워 죽이지 않는다.

---

# 12. 움직이는 Wall과의 접촉

Wall 이동 중 Player 접촉:

```text
SMALL DAMAGE
+
NEAREST SAFE LEFT/RIGHT CELL PUSH
```

중요:

- 아래로 밀어 Void에 떨어뜨리는 공격이 아니다.
- Crush Instant Kill 없음.
- arbitrary instant kill 없음.
- Wall top에 안전하게 올라탈 수 있는 platform을 만들지 않는다.

Wall FULL LOCK 후:

```text
contact damage = OFF
collision = ON
```

---

# 13. Wall과 Rope의 상호작용

## 13.1 신규 Hook

Wall 뒤의 Anchor를 향한 신규 Hook은 Wall을 통과하지 못한다.

```text
PLAYER
→ WALL
→ TARGET
```

이면 TARGET attach 불가.

## 13.2 기존 Rope

움직이는 Wall과:

```text
Player Rope Attachment Point
↔
Current Rope Anchor
```

사이 실제 Rope 선분이 **물리적으로 교차하는 순간** Rope Cut.

```text
DESCENDING WALL + ROPE INTERSECTION
→ ROPE CUT

RISING WALL + ROPE INTERSECTION
→ ROPE CUT
```

Wall 근처에 있다는 이유만으로 자르지 않는다.

## 13.3 Locked Wall

Locked Wall:

- 신규 Hook 차폐
- Player 이동 차폐
- Projectile 차폐
- 공격선 차폐

하지만 지속 Rope Cut hazard는 아니다.

---

# 14. Wall Rope Cut과 Cutter 적의 차이

Cutter:

```text
ACTIVE ENEMY ATTACK
→ projectile
→ Player/Rope disruption
```

Partition Wall:

```text
ROOM CONTROL DEVICE MOVES
→ Rope가 실제 이동 경로와 교차
→ physical Rope Cut
```

따라서 Wall에는:

- Cutter 조준선
- Rope 추적 AI
- Cutter projectile

을 넣지 않는다.

Wall Rope Cut은 **공간 통제의 결과**다.

---

# 15. 플레이어 Projectile / Augment 공격의 Wall 차폐

Wall은 Player 공격도 실제로 막는다.

```text
Projectile / action attack
→ Wall first
→ BLOCKED
```

반대편 Coupling을 Wall을 관통해 공격할 수 없다.

모든 Augment는 사용할 수 있지만,
어떤 Augment도 Wall의 공간통제 규칙을 무효화하지 않는다.

---

# 16. 보스 피해 판정 원칙

Boss05에서는 generic Boss 기본 body damage를 사용하지 않는다.

필수:

```text
closedBodyDamageMultiplier = 0
weakFixedPercent = 0
weakNormalDamageMultiplier = 1
```

따라서:

```text
Closed Core
Inactive Coupling
Actuator Housing
Partition Wall
```

을 때려도 Phase 진행 피해가 들어가지 않는다.

현재 Phase에서 노출된 Target만 유효하다.

```text
P1
A COUPLING

P2
B COUPLING

P3
MAIN COUPLING

FINAL
CENTRAL CORE
```

Strike Anchor는 최적 공격각을 유도할 뿐
숨은 필수 provenance가 아니다.

---

# 17. 공격 가독성 공통 원칙

모든 공격은:

```text
NEUTRAL / MOVEMENT
→ WARNING
→ ATTACK
→ END / RECOVERY
```

순서를 따른다.

## Warning

```text
NO DAMAGE
```

## Active

실제 Hazard Collider가 존재한다.

## 가독성

공격 구분은 색상 하나에 의존하지 않는다.

함께 사용:

- shape
- movement
- animation
- sound
- color

가장 중요한 원칙:

# **보이는 Hazard 위치 = 실제 Collider 위치**

---

# 18. P1 — AUX ACTUATOR A

## P1에서 Player가 실제로 해야 하는 것

P1에서는 A Wall 하나만 움직이고 Pulse는 사용하지 않는다.
따라서 Player가 처음 확인해야 하는 정보는 `A Wall이 어디에서 내려오고 어느 쪽 Cell로 넘어가야 하는가` 하나뿐이다.

```text
ENTRY에서 시작
→ A Wall Warning 확인
→ A Wall이 닫히기 전에 왼쪽 Cell로 이동
→ L5 / A-STRIKE / L6 부근까지 상승
→ A Wall FULL LOCK 확인
→ A Coupling 노출
→ 4초 동안 공격
```

P1에서 요구하지 않는 것:

- Pulse 회피
- 두 Wall 동시 판단
- 중앙 Bridge 사용
- Upper/Lower 판단

즉 P1 실패 원인은 명확해야 한다.

```text
Wall을 늦게 넘음
또는
Coupling 노출 시간 내 충분한 피해를 못 줌
```

## 시작

```text
ENTRY
→ L0
```

전투 시작 후 약 1.0초 동안 A Wall이 아직 움직이지 않는 read 시간을 둔다.
이 시간에 Player가 Core, A Actuator, A Wall 위치를 볼 수 있어야 한다.

## A Wall

권장 하강 시간:

```text
≈ 5.0s
```

P1은 세 Wall 공격 중 가장 느리다.

추천 Route:

```text
ENTRY
→ L0
→ L1
→ L2
→ L3
→ L4
→ L5
→ A-STRIKE
→ L6 / L7
```

`A-STRIKE = (1500,1230)`.

## A Coupling

A Wall FULL LOCK 순간 Pulse 없이 바로 A Coupling이 열린다.

```text
노출 시간 ≈ 4.0s
```

한 번의 Rope Impact로 자동 파괴하는 QTE가 아니다.
개발자가 설정한 Coupling HP만큼 여러 번 피해를 누적한다.

## 노출 시간 내 파괴 실패

```text
A Coupling CLOSE
→ A Wall 약 2초 상승
→ A 누적 피해 유지
→ 1초 내외 준비
→ A Wall Warning 재시작
```

## 성공

```text
A 파괴
→ A 제어선 OFF
→ A Wall 천장 복귀
→ Core 외피 1/3 개방
→ CROSS ON
```

# 19. P1에서 P2로 전환

이동:

```text
L7
→ L8
→ CROSS
→ R8
```

CROSS:

```text
(2600,760)
```

A 파괴 전에는 OFF.

P3 시작 시 다시 OFF.

R8에 첫 생존 Player가 도착하면
다음 Phase 시작 준비에 들어간다.

권장 Phase prep:

```text
≈ 0.8s
```

멀티플레이에서:

# **생존 Player 한 명만 준비구역에 도착해도 P2 시작**

다른 Player를 기다리지 않는다.

뒤처진 Player는 필요하면 Personal Recovery Route로 합류한다.

---

# 20. P2 — AUX ACTUATOR B + CONTROL PULSE

## P2에서 Player가 실제로 해야 하는 것

P2는 “오른쪽 Cell 안에서 Pulse 반대 구역으로 계속 이동하면서 B Wall이 잠기기를 기다리는 단계”다.

```text
R8 부근에서 P2 시작
→ B Wall Warning
→ B Wall이 닫히기 전에 오른쪽 전투 Cell 진입
→ INNER Warning이면 OUTER로 이동
→ OUTER Warning이면 INNER로 이동
→ B Wall FULL LOCK
→ Pulse 즉시 OFF
→ B Coupling 4초 공격
```

P2에서 Player가 판단할 정보는 두 가지다.

1. B Wall의 현재 위치
2. 다음 Pulse가 INNER인지 OUTER인지

하단 발판에 내려가서 Pulse를 무시하는 공략은 허용하지 않는다.

## B Wall

권장 하강:

```text
≈ 4.2s
```

P1보다 빠르다.

오른쪽 Route:

```text
R7 / R6 / R5 / R4 / R3 / B-STRIKE
```

중 하나를 상황에 맞게 사용한다.

`B-STRIKE = (3700,1230)`.

## Pulse

첫 Warning:

```text
B Wall 하강 시작 약 0.8초 후
```

반복:

```text
INNER Warning 0.7초
→ INNER Active 0.35초
→ 0.8초 간격
→ OUTER Warning
→ OUTER Active
→ 반복
```

경계:

```text
x < 3750 = INNER
x >= 3750 = OUTER
```

중립 지대는 없다.

## B Coupling

B Wall FULL LOCK 즉시 Pulse를 종료하고 B Coupling을 연다.

```text
노출 ≈ 4.0s
```

실패:

```text
B 누적 피해 유지
→ B Wall 상승
→ P2 재시작
```

성공:

```text
B 제어선 OFF
→ B Wall 천장 복귀
→ Core 외피 2/3 개방
```

# 21. P2 INNER / OUTER Pulse 실제 범위

P2 Pulse는 오른쪽 전투 구역을 x=3750 기준으로 두 구역으로 나눈다.

```text
INNER
B Wall 오른쪽 끝 ~ x<3750

OUTER
x>=3750 ~ Chamber 오른쪽 경계
```

Warning과 Active는 같은 구역 크기를 사용한다.

```text
Warning collider size
=
Active damage collider size
```

Pulse는 오른쪽 전투 구역 전체 높이에 적용하므로,
Player의 y좌표가 낮다고 안전해지지 않는다.

Active 시:

- 작은 피해
- 짧은 knockback

만 적용한다.

하지 않는 것:

- Rope Cut
- 강제 Rope release
- instant kill

P2 테스트 시 확인할 것:

- INNER Warning 중 OUTER에 선 Player는 피해 없음
- INNER Active 중 INNER Player만 피해
- OUTER Active에서는 반대
- x=3750은 OUTER로 판정
- B Wall FULL LOCK 순간 남아 있던 Pulse collider 제거

# 22. P2 Coupling 노출 구간

B Wall FULL LOCK:

```text
PULSE OFF
→ B COUPLING EXPOSED
```

B Coupling:

```text
(3470,930)
```

권장 exposure:

```text
≈ 4.0s
```

Exposure 실패:

```text
B COUPLING CLOSE
→ B WALL RISE
→ accumulated B damage persists
→ P2 repeat
```

성공:

```text
B DESTROYED
→ B CONTROL LINE OFF
→ B WALL RISE
→ CORE SHELL OPEN 2/3
```

---

# 23. P3 전체 구조

P3는 두 단계의 하나의 공격 사이클이다.

```text
P3-A
A/B Wall 동시 하강
+ LEFT/RIGHT Pulse
→ 중앙 Cell을 만든다

P3-B
Main Wall 하강
+ UPPER/LOWER Pulse
→ 중앙 Cell을 좌/우 두 Cell로 다시 나눈다
→ Main Coupling 노출
```

P3-A에서 A/B Coupling을 다시 공격하지 않는다.
A/B HP는 이미 0인 상태를 유지한다.

P3의 실패 조건은 Main Coupling 노출 시간 내 파괴하지 못하는 것이다.

실패 시:

```text
Main 누적 피해 유지
→ Main/A/B Wall 모두 천장 복귀
→ P3-A부터 재시작
```

따라서 P3-B만 반복하지 않는다.

# 24. P3-A — 보조 Wall 비상 재가동

A/B Actuator HP는 부활하지 않는다.

이미 파괴된 Actuator를 다시 때리는 Phase가 아니다.

Core가 비상 통제 권한으로:

```text
A WALL
+
B WALL
```

을 다시 작동시킨다.

## 시작

```text
CROSS OFF
P3-BRIDGE ON
P3-LOW-L/R ON
```

권장 Prep:

```text
≈ 0.8s
```

A/B Wall:

```text
simultaneous warning
→ simultaneous descent
```

권장 하강:

```text
≈ 3.5s
```

---

# 25. P3-A 좌측 / 우측 Pulse

A/B Wall 사이의 중앙 Cell에서 작동한다.

중앙:

```text
P3-BRIDGE = (2600,900)
```

Bridge는 양쪽을 연결하지만 캠핑 지점이 아니다.

Pattern:

```text
LEFT
→ RIGHT
→ LEFT
→ RIGHT
...
```

LEFT active:

```text
LEFT CELL + BRIDGE = DANGER
```

RIGHT active:

```text
RIGHT CELL + BRIDGE = DANGER
```

Bridge:

# **양쪽 Pulse 모두 위험**

## Full-height

P3-A Pulse는 중앙 Cell 전체 높이 판정.

하부로 내려가 Pulse를 무효화할 수 없다.

---

# 26. P3-A에서 P3-B로 전환

A/B Wall이 모두 FULL LOCK되면:

```text
P3-BRIDGE OFF
```

한다.

Bridge에 이미 Rope가 붙어 있으면 Safe Release.

그 뒤 MAIN Wall Warning.

P3-A에서 새로운 Coupling은 등장하지 않는다.

---

# 27. P3-B — MAIN 통제 단계

Core 바로 아래 MAIN DRIVE MODULE이 작동한다.

Main Wall:

```text
x = 2510..2690
```

권장 하강:

```text
≈ 3.5s
```

Main Wall은 이미 A/B Wall로 좁혀진 중앙 영역을
다시 LEFT / RIGHT Cell로 분리한다.

---

# 28. P3-B 상부 / 하부 Pulse

P3-B는 좌우 이동이 아니라 수직 Rope 판단을 요구한다.

Lower anchors:

```text
P3-LOW-L = (2380,1030)
P3-LOW-R = (2820,1030)
```

Upper:

```text
TOPL
TOPR
```

경계:

```text
y = 840
```

정의:

```text
UPPER = y < 840
LOWER = y >= 840
```

Neutral Strip:

```text
NONE
```

Pattern:

```text
UPPER
→ LOWER
→ UPPER
→ LOWER
...
```

LOWER active:

```text
MOVE HIGH
→ TOPL / TOPR
```

UPPER active:

```text
MOVE LOW
→ P3-LOW-L / P3-LOW-R
```

Pulse는 각 Main Cell 전체 폭에 적용한다.

---

# 29. Main Coupling / 점검용 Aperture

Main Wall FULL LOCK:

```text
ALL PULSE OFF
→ CIRCULAR MAINTENANCE APERTURE OPEN
→ MAIN COUPLING EXPOSED
```

Main Coupling:

```text
(2600,980)
```

중요:

## Aperture는 통로가 아니다

```text
Player collision
= BLOCKED
```

하지만:

```text
valid Player attack
= aperture를 통해 Main Coupling hit 가능
```

## Main Coupling은 하나

LEFT side와 RIGHT side에 서로 다른 HP를 만들지 않는다.

```text
ONE LOGICAL TARGET
ONE HP
```

권장 exposure:

```text
≈ 4.0s
```

---

# 30. P3 실패 시 처리

Main exposure 동안 Main을 파괴하지 못하면:

```text
MAIN COUPLING CLOSE
→ MAIN WALL RISE
→ A/B WALL RISE
→ accumulated MAIN damage persists
→ P3-A restart
```

P3-B만 다시 시작하지 않는다.

# **P3-A부터 재시작**

한다.

이것이 P3의 하나의 종합 공격 사이클이다.

---

# 31. P3 성공 시 처리

Main 파괴:

```text
MAIN DISABLED
→ ALL WALLS RISE
→ ALL PULSE OFF PERMANENTLY
→ CORE SHELL FULL OPEN
```

여기서 공간 통제는 끝난다.

---

# 32. 최종 마무리 단계

Main Coupling 파괴 후에는 더 이상 회피 패턴이 없다.

즉시 다음 상태로 바뀐다.

```text
A Wall → 천장 수납
B Wall → 천장 수납
Main Wall → 천장 수납
Control Pulse → 영구 OFF
P3-BRIDGE → 필요 없음
Core 외피 → FULL OPEN
Central Core → 유효 공격 대상
```

Player가 해야 하는 행동은 하나다.

```text
TOPL / TOPR 부근에서
→ 완전히 노출된 Central Core 접근
→ 기존 Rope Impact / 일반 공격으로 Core HP 소진
```

Final 중에는 다음 이벤트가 다시 발생하면 안 된다.

- Wall Warning
- Wall 재하강
- Pulse Warning
- Pulse Active
- 새로운 Enemy spawn
- 새로운 퍼즐
- Timer

즉 P3-B를 통과한 뒤에는 **회피 난이도를 더 올리지 않고 Core 마무리 공격만 남긴다.**

# 33. 승리 연출

Final Core HP가 0이 된 프레임부터 다음 순서로 상태를 바꾼다.

```text
1. Core damage target 비활성
2. Core 제어선 모두 OFF
3. 남은 Wall movement state 정지
4. Pulse Warning/Active collider 모두 제거
5. Chamber warning light 순차 소등
6. Core 외피/회전/진동 정지
7. EXIT-1 활성
8. EXIT-2 활성
9. Rooftop Service Access OPEN
```

거대한 폭발이나 Chamber 붕괴는 넣지 않는다.

Player가 승리를 확인하는 직접적인 근거는:

- 더 이상 Wall이 내려오지 않음
- Pulse Warning이 다시 생기지 않음
- Core가 움직이지 않음
- 위쪽 Exit Hardpoint 두 개가 새로 나타남
- Rooftop Service Access가 열림

이다.

화면 문구가 필요하면:

```text
CONTINUITY CHAMBER
CONTROL LOST

ROOFTOP SERVICE ACCESS
OPEN
```

을 사용할 수 있지만,
문구가 없어도 위의 실제 공간 상태 변화만으로 승리를 이해할 수 있어야 한다.

# 34. 최종 탈출 경로

Final Core 파괴 전:

```text
EXIT-1 OFF
EXIT-2 OFF
ROOFTOP SERVICE ACCESS LOCKED
```

승리 후:

```text
EXIT-1 = (2600,400)
EXIT-2 = (2600,180)
```

전개.

```text
TOPL / TOPR
→ EXIT-1
→ EXIT-2
→ ROOFTOP SERVICE ACCESS
```

Base Rope 400px 이내.

전투 중에는 Exit hardpoint가 존재하지 않으므로 지름길이 되지 않는다.

---

# 35. 중앙 Void

Control Void는 진짜 위험 공간이다.

Boss 전투 중 Void 아래에 Player를 정상적으로 받아주는
연속 중앙 Platform을 두지 않는다.

전투 시작 전 Arrival용 구조는 전투 시작 후
Void의 추락 판정을 방해하지 않게 retract / disable한다.

---

# 36. Void 추락 처리

추락:

```text
VOID FALL
→ FALL DAMAGE
```

HP > 0:

```text
ENTRY RECOVERY
→ PERSONAL RECOVERY ROUTE
```

HP <= 0:

```text
NORMAL PLAYER DEFEAT
```

Void Fall은:

```text
Boss Phase를 reset하지 않는다.
Coupling damage를 reset하지 않는다.
다른 Player 전투를 reset하지 않는다.
```

---

# 37. 멀티플레이 Void 추락 처리

한 Player가 떨어져도:

```text
OTHER PLAYERS
→ CURRENT PHASE CONTINUES
```

추락 Player만 복귀.

P3-B:

```text
LEFT CELL FALL
→ LEFT ENTRY RECOVERY

RIGHT CELL FALL
→ RIGHT ENTRY RECOVERY
```

Main Wall 내부나 반대편 Cell로 순간이동시키지 않는다.

---

# 38. 개인 전용 복귀 경로

Recovery Route는 해당 Player에게만 활성화한다.

사용 대상:

1. Void fall 생존자
2. Phase가 먼저 시작되어 이전 Cell에 남은 Player
3. Boss 도중 join/rejoin 후 legal combat cell 밖의 Player

동작:

```text
ENTRY RECOVERY
→ PERSONAL RECOVERY HARDPOINT ON
→ CURRENT LEGAL COMBAT CELL
→ RECOVERY OFF
```

---

# 39. 복귀 중 보호 규칙

Recovery 중에는 Boss05 공격 판정만 보호한다.

```text
Control Pulse damage = ignored
moving Wall contact damage = ignored
Boss05 hazard damage = ignored
```

하지만:

```text
Wall collision = ON
Platform collision = ON
Rope physics = NORMAL
Void fall = POSSIBLE
```

완전 무적이 아니다.

## Exploit 방지

Recovery 상태에서는:

```text
Boss05 target damage = 0
```

으로 처리한다.

즉 Recovery Route에서 안전하게 Coupling/Core를 공격할 수 없다.

현재 legal combat cell 재진입:

```text
Recovery protection OFF
Boss target damage NORMAL
```

---

# 40. 멀티플레이 단계 시작 규칙

다음 Phase ready region에:

# **생존 Player 한 명만 도착해도 Phase 시작**

한다.

모든 Player를 기다리지 않는다.

뒤처진 Player가 새 Phase의 legal combat cell 밖에 남으면:

```text
Personal Recovery Route
```

를 제공한다.

중간 join/rejoin도 같은 규칙.

Boss HP Scaling은 도중에 다시 계산하지 않는다.

---

# 41. 공격 방식 / Augment 호환성

Boss05는 어떤 Foundation Augment를 선택했더라도 클리어 가능해야 한다.

Mandatory win condition:

```text
Base movement
+
Base Rope
+
normal valid combat impact
```

로 성립해야 한다.

Augment는:

- 더 빠른 Damage
- 더 좋은 이동
- 유리한 angle
- 추가 attack style

을 줄 수 있지만
특정 Augment를 가져오지 않으면 Main Coupling을 못 때리는 구조는 금지.

---

# 42. 영구 안전지대 금지

다음 위치가 영구 안전지대가 되면 안 된다.

- Core top
- Actuator housing top
- Partition Wall top
- Room corner
- Entry lower deck
- P3-BRIDGE
- Recovery Route
- Service Recess
- Final Exit hardpoint before victory

---

# 43. P2 / P3 공격 범위 규칙

## P2

B Wall 오른쪽 Combat Region에서:

```text
INNER / OUTER
```

한쪽 전체 높이가 공격.

하단 Neutral Strip 없음.

## P3-A

A/B Wall 사이 중앙 Cell:

```text
LEFT / RIGHT
```

각 영역 전체 높이.

Bridge 포함.

## P3-B

Main Wall 좌/우 Cell:

```text
UPPER / LOWER
```

각 영역 전체 폭.

중립 경계 없음.

---

# 카메라 구성 기준 — 실제 화면 포함 요소

카메라는 “보스가 멋있게 보이는가”가 아니라 **Player가 다음 입력을 결정하는 데 필요한 오브젝트가 같은 화면 안에 들어오는가**로 판정한다.

## P1

A Wall 이동 중 한 화면에 최소:

```text
Player
A Wall의 현재 하단 위치
다음으로 잡을 수 있는 L5/A-STRIKE/L6 중 1개 이상
```

이 들어와야 한다.

A Wall FULL LOCK 후에는:

```text
Player
A Coupling
A-STRIKE 또는 L6/L7 중 1개 이상
```

이 동시에 보여야 한다.

## P2

Pulse Warning 중 한 화면에:

```text
Player
현재 Warning 영역의 경계
반대쪽 안전 영역
그 안전 영역 안의 Rope Hardpoint 1개 이상
```

이 들어와야 한다.

Warning 영역만 크게 보이고 반대쪽 이동 지점이 화면 밖이면 실패다.

## P3-A

한 화면에:

```text
Player
A Wall
B Wall
P3-BRIDGE
현재 LEFT/RIGHT Pulse 경계
```

중 최소 `Player + 두 Wall + Bridge + 현재 Warning`이 함께 들어와야 한다.

## P3-B

Main Wall 하강 중:

```text
Player
Main Wall
현재 Cell의 TOPL/TOPR 또는 P3-LOW-L/R
현재 UPPER/LOWER Warning 경계
```

가 함께 보여야 한다.

Main Wall FULL LOCK 후:

```text
Player
Maintenance Aperture
Main Coupling
현재 Player가 서 있는 좌/우 Cell 경계
```

가 한 화면에 들어와야 한다.

## 카메라 QA 실패 조건

- Player가 피해야 할 Warning은 보이는데 안전 Hardpoint가 화면 밖
- Main Coupling이 열렸는데 Aperture가 화면 밖
- Wall이 내려오는데 Wall 하단 위치가 화면 밖
- 4인 멀티에서 다른 Player UI/rope가 Warning 경계를 가려 현재 위험 구역을 판별할 수 없음

# 44. 현재 권장 초기 조정값

다음 수치는 인터뷰 대상이 아니라 초기 authored tuning 권장값이다.

| 항목 | 권장 |
|---|---:|
| P1 시작 Read | ≈1.0s |
| P2/P3 Prep | ≈0.8s |
| P1 Wall descent | ≈5.0s |
| P2 Wall descent | ≈4.2s |
| P3 Wall descent | ≈3.5s |
| Wall rise | ≈2.0s |
| Coupling exposure | ≈4.0s |
| Pulse first warning after wall move | ≈0.8s |
| Pulse warning | ≈0.7s |
| Pulse active | ≈0.35s |
| Pulse gap | ≈0.8s |

HP / exact Damage는 개발 플레이테스트에서 조절한다.

---

# 45. 단계별 실제 플레이 부담

| 단계 | 동시에 판단해야 하는 것 | 실수했을 때 결과 |
|---|---|---|
| P1 | A Wall 위치 하나 | 잘못된 Cell에 남음 / Rope Cut 가능 |
| P2 | B Wall + INNER/OUTER Pulse | Pulse 피해 또는 이동 지연 |
| P3-A | A/B Wall + LEFT/RIGHT Pulse + Bridge 위치 | 중앙 Cell 이동 실패 |
| P3-B | Main Wall + UPPER/LOWER Pulse + 좌/우 Cell | Main 접근 실패 / Void 추락 가능 |
| Final | Core 접근과 공격만 | 회피 패턴 없음 |

P3-B가 가장 많은 정보를 동시에 요구하는 구간이다.
따라서 Final에서는 추가 공격을 넣지 않는다.

4인 멀티플레이에서 반드시 확인할 것:

- 한쪽 P3-B Cell에 여러 Player가 모여도 Rope 이동이 가능한가
- Wall/Player 충돌 때문에 통로가 막히지 않는가
- 서로 다른 Player의 Rope가 시각적으로 Pulse Warning을 가리지 않는가

# 46. 반드시 피해야 할 설계

## Story

- Boss05에서 Capacity/Priority/Authorization 재설명
- named executive villain
- planned Cascade claim
- intentional casualty directive
- Sector06 spoiler
- 새 증거 문서

## Combat

- Partition 자체를 Boss처럼 연출
- AEGIS/Jammer/Cutter/Artillery를 다시 순서대로 시험
- mandatory enemy kill
- Partition crush instant kill
- Arena collapse
- Boss Timer 추가
- Final에서 새 공격 추가
- P1/P2/P3가 같은 Wall 3회 반복처럼 보이는 구성
- Main 뒤에 또 새로운 combat gimmick
- Pulse Rope Cut
- Pulse forced detach
- hidden mandatory attack anchor
- 특정 Augment 필수

## Geometry

- Wall이 보이는데 Collider는 다른 위치
- 닫힌 Slot을 Wall이 ghost-through
- Core Recess를 안전 발판으로 사용
- Main aperture를 Player passage로 사용
- Void 아래 영구 catcher floor
- Wall top safe platform
- Recovery Route 공격 exploit
- Exit hardpoint 전투 중 선활성

---

# 47. 구현 전 최종 점검표

## Identity / Story

- [ ] Core가 항상 Boss의 시각적 중심
- [ ] “중앙 시스템이 방을 조종한다”가 읽힘
- [ ] Boss05에서 새 Story Reveal 없음
- [ ] 5-8의 책임 Chain을 반복 설명하지 않음
- [ ] 승리는 “통제 정지”로 읽힘

## Geometry

- [ ] A/Main/B Wall 이동축과 Platform Slot 일치
- [ ] Slot 220px / Wall 180px
- [ ] Shutter가 정상적으로 닫히고 열림
- [ ] Core 좌우 Service Recess 존재
- [ ] Recess는 Platform 아님
- [ ] Central Void 아래 정상 catcher floor 없음
- [ ] Main Aperture는 통로 아님
- [ ] Exit는 승리 후만 활성

## Combat

- [ ] closed/inactive target damage = 0
- [ ] Coupling 누적 damage persists
- [ ] Exposure 실패 후 같은 Phase retry
- [ ] P3 실패 시 P3-A restart
- [ ] Main은 ONE HP
- [ ] Final Core에서 Wall/Pulse restart 없음

## Pulse

- [ ] Warning damage = 0
- [ ] Active만 damage
- [ ] P2 Full-height
- [ ] P3-A Full-height
- [ ] P3-B Full-width
- [ ] Neutral Strip 없음
- [ ] Bridge camping 불가
- [ ] 보이는 Hazard = 실제 Collider

## Rope / Wall

- [ ] 신규 Hook Wall 관통 불가
- [ ] Projectile Wall 관통 불가
- [ ] Moving Wall 실제 Rope 교차 시만 Cut
- [ ] Rising Wall도 실제 교차 시 Cut
- [ ] Locked Wall 지속 Cut 없음
- [ ] Temporary hardpoint OFF = Safe Release

## 구현 인계 점검

- [ ] Boss05가 기존 Boss authoring spec/generator/catalog 경로에 등록됨
- [ ] `BossMechanismRuntimeFactory`에 `continuity-control-core` 등록
- [ ] `ContinuityControlCoreRuntime`이 `BossEncounterRuntime` 아래에서 동작
- [ ] 새 Boss health/damage/collision/renderer framework를 만들지 않음
- [ ] Boss target은 `ImpactTargetRegistry` / 기존 `applyImpact()` 경로 사용
- [ ] Base Rope Impact는 기존 `RopeImpactAttack` 사용
- [ ] Augment attack은 기존 `AugmentCombatRuntime` 경로 사용
- [ ] Dynamic Wall은 기존 `PolygonCollider` / `CollisionBroadPhase` 경로 사용
- [ ] Wall Rope Cut은 기존 rope-cut transition 재사용
- [ ] Hook occlusion은 기존 Rope input 경로의 generic surface 차폐 확장
- [ ] Projectile occlusion은 기존 projectile path의 surface first-hit 확장
- [ ] Boss05 renderer는 기존 Boss renderer registry 확장
- [ ] Boss05-specific snapshot state가 공통 Boss snapshot/restore에 포함

## Multiplayer

- [ ] Player 1명 ready → 다음 Phase 시작
- [ ] 뒤처진 Player Recovery 합류 가능
- [ ] 한 명 Void fall → 나머지 Phase 지속
- [ ] Recovery protection은 해당 Player만 적용
- [ ] Recovery 중 Boss target damage = 0
- [ ] P3-B left/right Recovery 정확
- [ ] join/rejoin Recovery 가능
- [ ] 4인 P3-B 공간밀도 플레이테스트

---

# 48. 최종 설계 확정 요약

Boss05의 실제 Boss 오브젝트:

```text
SUSPENDED CONTINUITY CONTROL CORE
```

전투 완료까지의 상태 변화:

```text
P1
A Wall 하강
→ A Coupling 파괴
→ A 제어선 OFF
→ Core 외피 1/3 개방
→ CROSS ON

P2
B Wall + INNER/OUTER Pulse
→ B Coupling 파괴
→ B 제어선 OFF
→ Core 외피 2/3 개방

P3-A
A/B Wall 비상 재가동
→ 중앙 Cell LEFT/RIGHT Pulse
→ A/B Wall FULL LOCK

P3-B
Main Wall 하강
→ UPPER/LOWER Pulse
→ Main Coupling 파괴
→ Main 제어선 OFF
→ A/B/Main Wall 전부 천장 복귀
→ Pulse 영구 OFF
→ Core FULL OPEN

FINAL
Central Core HP 0
→ Boss damage target OFF
→ EXIT-1 / EXIT-2 ON
→ Rooftop Service Access OPEN
```

구현이 끝났을 때 Player가 실제로 확인할 수 있어야 하는 것은 다음 다섯 가지다.

1. A를 파괴하면 A Wall이 다시 내려오지 않고 Core가 1/3 열린다.
2. B를 파괴하면 B Wall의 P2 공격은 끝나고 Core가 2/3 열린다.
3. P3-A에서는 A/B 체력이 부활하지 않고 Wall만 다시 움직인다.
4. Main을 파괴하면 Wall/Pulse가 영구 정지하고 Central Core가 열린다.
5. Central Core를 파괴하면 새 공격 없이 EXIT Route가 활성화된다.

이 다섯 상태가 모두 실제 Runtime, collision, renderer, snapshot에서 동일하게 재현되면 Boss05의 핵심 설계 구현이 완료된 것으로 본다.
