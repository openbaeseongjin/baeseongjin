# SECTOR 02-2 — PATROL WALKWAY

*BLOCKOUT CANDIDATE · REV 1.0*

◀ PREV — [SECTOR 02-1 / WORKER BLOCK 12](../2-1/README.md) · NEXT — [SECTOR 02-3 / RESIDENTIAL SERVICE NODE](../2-3/README.md) ▶

`SECTOR 02 WORKER DISTRICT` · `STAGE 02` · `FIRST PATROL DRONE` · `MOVING SECURITY PRESSURE`

| 항목 | 기준 |
|---|---|
| Status | HYPOTHESIS — BLOCKOUT CANDIDATE |
| Difficulty | ★★ |
| Expected First Playtime | 90–140 sec |
| Expected Skilled Clear | 40–65 sec |
| Enemy | 1 Patrol Drone |
| New Mechanic | Moving Enemy Patrol |
| New Augment | NONE |
| Wind | NONE |
| Rope Cut | NONE |
| Primary Role | Static Threat → Moving Threat |
| Space | Residential Transit Walkway |

---

## 0. 기획 기준

### LOCKED

2-2는 다음 조건을 지킨다.

- 첫 Patrol Drone 등장
- Drone은 정확히 1대
- Drone kill은 Optional
- 일반 Projectile은 Player Hit Only
- Rope Cut 없음
- Foundation Augment 유지
- Specialization은 아직 없음
- 새 Rope Input 없음
- 새 Rope Mode 없음
- Wind 없음
- 살아 있는 NPC 없음
- Group C의 진실 공개 없음
- Worker District의 생활 흔적은 계속 유지

2-2의 핵심 질문은 하나다.

> **“고정된 Turret이 아니라 위협 자체가 움직이면 Rope 경로를 어떻게 바꿔야 하는가?”**

---

## 0-1. Reference Scan

### SANABI

**VERIFIED**

SANABI는 Chain Hook을 단순 이동 장치가 아니라 이동과 적 처리를 모두 담당하는 핵심 도구로 사용하며, 총알·함정·적을 통과하는 과정이 이동과 결합된다.

**Reference**
- SANABI — Steam Developer Notes
- SANABI — 80.lv developer interview

### TRANSFER

2-2에서는:

```text
ROPE MOVEMENT
+
ENEMY READING
```

을 별개의 과제로 만들지 않는다.

Drone을 멈춰 서서 죽인 다음 이동하는 것이 최적해가 되면 실패다.

플레이어가:

```text
Drone 위치 확인
→ Attach 위치 변경
→ Swing
→ Drone LOS를 지나감
→ 계속 상승
```

하도록 만든다.

---

### Rusted Moss

**VERIFIED**

Rusted Moss 개발진은 전체 게임을 하나의 Grappling Hook을 중심으로 설계했고, 같은 Platforming Challenge를 여러 방식으로 해결하도록 허용하는 것을 중요한 Player Expression으로 설명한다.

**Reference**
- PlayStation Blog — How Rusted Moss devs teamed up to create physics-based grappling hook action

### TRANSFER

2-2에서도:

```text
KILL
WAIT
OUTRUN
ROPE OVER
ROPE UNDER
```

중 여러 해결법을 허용한다.

단 첫 Drone Tutorial이므로:

```text
공격적으로 죽이는 것
```

이 유일한 정답이 되어서는 안 된다.

---

## 1. 한 줄 정의

2-1의 비어 있는 Worker Block을 빠져나온 플레이어가 주거동 사이의 긴 외부 보행 통로에서 **정해진 구간을 순찰하는 Patrol Drone 한 대**를 처음 만나고, 기존 Sentry의 공격 언어를 이용해 **움직이는 위협과 Rope 동선을 동시에 읽는 법**을 배우는 Stage.

---

## 2. 전체 게임에서의 역할

Sector 01에서 Enemy Pressure는 이미 배웠다.

특히 1-3에서는 첫 Sentry가:

```text
IDLE
→ ACQUIRE
→ TRACK
→ LOCK
→ FIRE
→ COOLDOWN
```

이라는 읽을 수 있는 공격 언어를 가르친다.

따라서 2-2에서 새롭게 배워야 할 것은:

```text
PROJECTILE
```

이 아니다.

새로운 요소는 딱 하나다.

```text
THE THREAT MOVES
```

### 학습 계보

```text
1-3 SECURITY CHECK

STATIC ENEMY
+
READ TELEGRAPH

↓

1-7 / 1-8

STATIC ENEMY
+
MOVEMENT PRESSURE

↓

2-1

NO ENEMY
RESIDENTIAL TRANSITION

↓

2-2

MOVING ENEMY
+
FAMILIAR TELEGRAPH
```

---

## 3. Story 역할

2-2는 Story Reveal Stage가 아니다.

Story 목적은:

> **Worker District가 비어 있지만, Security System은 아직 작동하고 있다.**

정도만 전달한다.

### Player가 알아도 되는 것

```text
사람은 보이지 않는다.

하지만 순찰 시스템은 계속 작동한다.

대피가 끝났다고 보기에는 이상하다.
```

### 아직 알면 안 되는 것

```text
왜 Group C가 남았는가

누가 순찰을 명령했는가

Drone이 주민을 감시하기 위한 것이었는가

기업이 의도적으로 주민을 봉쇄했는가
```

---

## 4. 공간 콘셉트

**RESIDENTIAL TRANSIT WALKWAY**

2-1이:

```text
VERTICAL COURTYARD
```

였다면,

2-2는:

```text
LONG HORIZONTAL-TO-VERTICAL TRANSIT
```

이다.

주거동과 주거동 사이를 연결하는:

- Exterior Walkway
- Service Bridge
- Vertical Access Frame
- Residential Utility Spine

을 사용한다.

### 핵심 공간 형태

```text
HOUSING A

█████████████
      \
       \
        WALKWAY =========================
                         ↔ DRONE PATROL
                              \
                               \
                                █████ PLATFORM
                                      │
                                      │
                                      │
                                   UPPER ACCESS
                                      │
                                      ↓
                                     2-3
```

2-1보다 **수평 공간을 길게 보여준다.**

이유:

Drone의 이동 자체를 Player가 읽어야 하기 때문이다.

---

## 5. Pixel / Grid 기준

### VERIFIED — 2026-08-14 / current `main`

현재 Runtime 기준:

- Player Radius: `15`
- Gravity: `1250`
- Max Horizontal Speed: `360`
- Jump Speed: `440`
- Rope Max Attach Distance: `440`
- Attach Buffer: `0.1 sec`
- Swing Impulse: `780`
- Camera Zoom: Desktop `1`, Mobile `0.72`

현재 일반 Enemy 설정에는:

- Enemy Radius `18`
- Health `30`
- Attack Range `520`
- Fire Interval `1.4 sec`
- Projectile Speed `260`
- Projectile Radius `7`
- Projectile Damage `20`

가 존재한다.

### HYPOTHESIS — 2-2 BLOCKOUT

```text
GRID        32 px

WIDTH       1280 px
            40 tiles

HEIGHT      1088 px
            34 tiles
```

2-1보다 약간 넓게 시작한다.

이 값은 Playtest 전 확정값이 아니다.

---

## 6. 전체 맵 구조

```text
Y -1088

┌────────────────────────────────────────────────────┐
│                                      EXIT → 2-3    │
│                                    ███████████     │
│                                         ▲          │
│                                      G5 ●          │
│                                       ╱            │
│                             P4 ─────────────        │
│                                                    │
│                      G4 ●                          │
│                         ╲                          │
│                          ╲                         │
│                     P3 ─────────                   │
│                                                    │
│             ┌──── COVER B ────┐                   │
│                                                    │
│      ←────────── DRONE PATROL ─────────→          │
│                                                    │
│ P2 ===============================                 │
│    MAIN RESIDENTIAL WALKWAY                        │
│                                                    │
│             ● G2                   ● G3            │
│                                                    │
│       COVER A                                      │
│       ██████                                       │
│                                                    │
│ P1 ──────────────────                              │
│                                                    │
│     ● G1                                           │
│                                                    │
│ P0 — ENTRY FROM 2-1                                │
└────────────────────────────────────────────────────┘

Y 0
```

---

## 7. Zone 구성

### ZONE A — DRONE REVEAL

```text
Y 0 ~ -224
```

Player가 안전한 위치에서 Drone을 **먼저 볼 수 있는 구간**.

공격받으면서 처음 발견하면 안 된다.

### ZONE B — FIRST PATROL CROSSING

```text
Y -224 ~ -544
```

첫 실제 Patrol Interaction.

Safe / Flow / Kill 선택 가능.

### ZONE C — MOVING LOS

```text
Y -544 ~ -800
```

Drone의 위치에 따라 Grapple Timing이 달라지는 핵심 구간.

새 공격 패턴은 추가하지 않는다.

### ZONE D — DISENGAGE

```text
Y -800 ~ -960
```

Drone Encounter 종료.

Player에게 다시 안정감을 준다.

### ZONE E — SERVICE NODE APPROACH

```text
Y -960 ~ -1088
```

2-3 REST / SPECIALIZATION 공간으로 연결.

---

## 8. 좌표 / 오브젝트

### HYPOTHESIS — BLOCKOUT CANDIDATE

| ID | X | Y | Width | 역할 |
|---|---:|---:|---:|---|
| P0 | -544~-288 | 0 | 256 | Entry |
| G1 | -416~-288 | -176 | 128 | Reveal Grapple |
| P1 | -320~+32 | -256 | 352 | Observation Deck |
| Cover A | -32~+96 | -320 | 128 | Safe Read |
| G2 | +64~+192 | -384 | 128 | Lower Pivot |
| P2 | -64~+480 | -480 | 544 | Main Patrol Walkway |
| G3 | +320~+448 | -544 | 128 | Flow Pivot |
| Cover B | +160~+288 | -608 | 128 | Second Safe Read |
| P3 | +32~+320 | -704 | 288 | Upper Landing |
| G4 | -96~+32 | -768 | 128 | Exit Pivot |
| P4 | -320~+32 | -864 | 352 | Relief Deck |
| G5 | -128~0 | -928 | 128 | Final Grapple |
| Exit | +64~+384 | -1024 | 320 | To 2-3 |

### Patrol Rail

Drone Patrol 구간:

```text
X -32 ~ +416
Y -416 ± small vertical offset
```

**HYPOTHESIS**

Drone은 첫 Stage에서는 정해진 두 지점 사이만 왕복한다.

---

## 9. Safe Route

```text
P0
→ G1
→ P1
→ Observe
→ Cover A
→ Wait
→ G2
→ P2
→ Cover B
→ G3
→ P3
→ G4
→ P4
→ G5
→ EXIT
```

### Safe Route 원칙

첫 Drone을:

```text
REACTION TEST
```

로 만들지 않는다.

먼저:

```text
SEE
→ UNDERSTAND
→ MOVE
```

가 가능해야 한다.

### 첫 관찰

P1에서는 Player가 안전해야 한다.

Drone이:

```text
LEFT
→ RIGHT
→ LEFT
```

로 순찰하는 것을 최소 한 Cycle 볼 수 있어야 한다.

---

## 10. Flow Route

숙련자는 Drone이 멀어질 때 기다리지 않는다.

```text
P1
→ G2
→ Release
→ G3 airborne re-attach
→ pass above patrol line
→ P3
```

가능.

### 핵심

Flow Route가 의미하는 것은:

```text
더 빠르게 적을 죽인다
```

가 아니라:

```text
적의 이동을 읽고
자기 이동으로 Encounter 시간을 줄인다
```

다.

이게 우리 게임의 핵심 질문:

> **Rope를 잘 쓰는 사람이 더 강하게 싸우는가?**

와 직접 연결된다.

---

## 11. Build Route

### NO DEDICATED BUILD ROUTE

2-1과 동일하다.

2-3에서 Specialization을 제공하기 전까지:

```text
Foundation Build 전용 통로
```

를 만들지 않는다.

### IMPULSE COIL

가능한 이점:

- Patrol Zone 빠른 횡단
- Cover 하나 Skip
- Drone LOS 체류시간 감소

### RELAY LINK

가능한 이점:

```text
G2
→ G3
→ G4
```

연속 이동.

### SHEAR CURRENT

Drone의 이동 경로와 Rope Line이 자연스럽게 교차하면 공격적 활용 가능.

하지만:

```text
SHEAR로 Drone을 맞혀야만 통과
```

는 금지.

---

## 12. Recovery

2-2에서도 실수 비용은:

```text
DEATH
```

보다:

```text
POSITION LOSS
+
PRESSURE
```

가 먼저다.

### Recovery A

G2 실패 시:

```text
Lower Maintenance Ledge
```

에 떨어짐.

2–5초 내 재진입.

### Recovery B

G3 실패 시 P2 하단 Walkway로 복귀.

Start Return 없음.

### Combat Recovery

Drone Projectile에 맞아도:

- 전체 낙하 금지
- Rope Disabled를 연쇄 추락로 사용하지 않음
- 즉사 금지

현재 기본 Projectile Damage는 `20`, Rope Disable은 `0.6 sec`지만, 2-2 Blockout에서는 실제 체감이 첫 이동형 적 학습을 과도하게 방해하지 않는지 별도 검증한다.

---

## 13. Enemy / Hazard

### PATROL DRONE T1

#### 역할

```text
FIRST MOVING SECURITY THREAT
```

Turret의 상위호환이 아니다.

#### Turret vs Drone

| Sentry T1 | Patrol Drone T1 |
|---|---|
| 고정 위치 | 이동 위치 |
| 공간 자체를 지킴 | 경로를 순찰 |
| LOS 예측 쉬움 | LOS 위치 변화 |
| Cover 상대적으로 안정 | Cover 타이밍 변화 |
| 화력 언어 학습 | 공간 압력 학습 |

Drone이 모든 면에서 강하면 안 된다.

#### Patrol Drone 크기

```text
24×24 ~ 32×32
```

목표.

Player 출력 크기보다 크지 않게 한다.

#### Proposed FSM

```text
PATROL
   ↓
PLAYER DETECTED
   ↓
ACQUIRE
   ↓
TRACK
   ↓
LOCK
   ↓
FIRE
   ↓
RECOVER
   ↓
PATROL
```

**HYPOTHESIS**

#### 중요한 설계 결정

2-2에서는:

```text
CHASE
```

를 넣지 않는다.

즉 Player를 끝없이 쫓지 않는다.

Drone은:

```text
PATROL CORRIDOR
```

를 소유한다.

Player가 Encounter 공간을 벗어나면 다시 Patrol로 돌아간다.

#### 이유

2-2에서 배울 것은:

```text
MOVING PATROL
```

이지:

```text
FULL PURSUIT AI
```

가 아니다.

Chase는 이후 적 변형으로 남긴다.

#### Projectile

처음에는 기존 Sentry Projectile의:

- speed
- silhouette
- hit language
- telegraph family

를 재사용하는 것을 권장한다.

새 Enemy와 새 Projectile을 동시에 배우게 하지 않는다.

#### Rope Cut

```text
NO
```

Patrol Drone T1은 Rope를 자르지 않는다.

Cutter / Jammer 계열을 위한 설계 공간을 남긴다.

#### Kill

```text
OPTIONAL
```

Drone을 파괴하지 않고도 Stage Clear 가능.

---

## 14. Camera

### VERIFIED

현재 Camera는 Player 기준:

```text
X ≈ 38% from left
Y ≈ 58% from top
```

을 목표로 부드럽게 추적한다.

### 2-2에서는 Custom Camera Pan 없음

대신 공간 배치로 Drone을 미리 노출한다.

P1 도착 시:

```text
PLAYER
+
COVER A
+
PATROL DRONE
+
PATROL DESTINATION
```

중 최소 세 개가 같은 화면에 잡혀야 한다.

### 중요

Drone이 Screen Edge에서 갑자기 총을 쏘면 실패다.

첫 Drone은:

```text
Player sees Drone
before
Drone meaningfully threatens Player
```

를 지킨다.

---

## 15. Story Trigger

### TRIGGER A — WALKWAY SIGN

```text
BLOCK 12
RESIDENTIAL TRANSIT
```

### TRIGGER B — SECURITY STATUS

환경 패널:

```text
SECURITY PATROL
ACTIVE

RESIDENTIAL TRANSIT
RESTRICTED
```

여기까지.

### 넣지 말 것

```text
GROUP C CONTAINMENT

WORKER LOCKDOWN

EVACUATION DENIED

CLASS C RESTRICTION
```

같은 직접 해석.

### Story Beat

2-1:

> 사람이 없네?

2-2:

> 그런데 경비는 왜 계속 도는 거지?

정도가 적절하다.

---

## 16. Pixel Art Asset Spec

### Patrol Drone T1

Canvas:

```text
32×32
```

권장.

실제 본체:

```text
24×24 ~ 28×28
```

정도.

### Silhouette

멀리서도:

```text
GROUND TURRET
```

과 달라야 한다.

권장:

- compact hovering body
- side stabilizer
- small underside weapon
- single directional sensor

### 색

Body:

```text
Dark Gray
Gunmetal
```

Sensor:

```text
Muted Red
```

Lock / Fire:

```text
Red / Orange
```

Movement Engine:

```text
Low-saturation pale teal
```

### Cyan 금지

Drone에 Cyan을 강하게 사용하지 않는다.

Cyan은 Rope / Grapple Readability가 우선이다.

### Patrol Beacon

```text
16×16
or
24×24
```

환경 구조물.

Gameplay 중:

> 여기까지 순찰한다.

를 직접 표시하는 UI는 아니다.

아트 제작과 개발 Debug Marker는 분리한다.

---

## 17. Background

### 결정

**2-2도 새로운 Full Sector Background를 만들지 않는다.**

2-1과 같은 Worker District Far/Mid를 유지한다.

대신 Near Layer를 바꾼다.

### 2-1 Near

```text
Laundry
Door
Plant
Chair
```

### 2-2 Near

```text
Transit Rail
Security Camera
Service Light
Patrol Charging Socket
Bridge Joint
Access Gate
Directional Sign
```

### 중요

Worker District 정체성은 유지한다.

2-2가 갑자기:

```text
MILITARY BASE
```

처럼 보이면 안 된다.

경비 시스템은 **주거공간 위에 얹힌 Corporate Infrastructure**다.

---

## 18. Sound / VFX

### Drone Idle / Patrol

- soft servo hum
- short directional motor pulse
- quiet scanner tick

### Acquire

```text
short electronic chirp
```

### Lock

기존 Sentry와 같은 계열의 경고음.

Player가:

> 저 소리는 쏘기 직전이다.

를 이전 경험으로 이해할 수 있어야 한다.

### Fire

기존 Projectile family 유지.

### Movement VFX

아주 작은:

- stabilizer pixel exhaust
- engine flicker
- directional tilt

정도.

너무 큰 Thruster Trail 금지.

---

## 19. Implementation Notes

### 19-1. Current Code State

현재 저장소에는 일반 `EnemyObject`, `CombatSystems`, Projectile 관련 구현이 존재한다.

반면 현재 코드 검색에서 `PatrolDrone` 전용 구현은 확인되지 않았다.

따라서 Patrol Drone은 **현재 구현 완료 기능이 아니라 신규 Gameplay Object**로 취급한다.

### 19-2. 구현 우선순위

처음부터 복잡한 Drone AI를 만들지 않는다.

P0:

```text
horizontal patrol
+
existing enemy projectile
+
simple detection
```

만 만든다.

### 19-3. Patrol Ownership

Drone이:

```text
Point A
↔
Point B
```

를 왕복.

Player를 인식하더라도 Patrol Bounds 자체를 버리고 무한 Chase하지 않는다.

### 19-4. Telegraph Reuse

가능하면 1-3 Sentry의:

```text
Acquire
Track
Lock
Fire
Cooldown
```

Presentation Language를 재사용한다.

### 19-5. Multiplayer Targeting

2인 플레이에서 반드시 확인:

- Drone이 Target을 얼마나 자주 바꾸는가
- Player A Lock 직후 Player B로 순간 전환하지 않는가
- 두 Player 사이에서 Aim이 떨리지 않는가
- 한 Player가 Cover에 숨었을 때 다른 Player가 갑자기 불합리하게 피격되지 않는가

첫 구현에서는 **한 공격 Cycle 중 Target Lock을 유지**하는 방향을 권장한다.

Target switching은 다음 Cycle에서 평가.

### 19-6. Kill Optional

Exit Condition에:

```text
drone.dead === true
```

를 넣지 않는다.

Stage Completion은 이동 달성으로 한다.

---

## 20. Playtest Metrics

기본 기록:

```text
first clear time
drone encounter time
shots fired
shots hit
player damage
drone killed
drone bypassed
cover usage
recovery events
wrong attach
```

### 추가 중요 지표

#### FIRST DETECTION DISTANCE

Player가 Drone을 인식했을 때:

```text
이미 공격받고 있었는가?
```

기록.

목표:

첫 플레이의 대부분에서:

```text
SEE FIRST
THREAT SECOND
```

#### Drone Kill Rate

목표를 특정 %로 바로 고정하지 않는다.

하지만 초기 Test에서:

```text
거의 100%가 죽이고 간다
```

면 공격/자동공격이 너무 쉬워 이동 판단이 사라진 것일 수 있다.

반대로:

```text
아무도 죽일 생각조차 안 한다
```

면 Combat Build Expression을 막고 있을 수 있다.

#### Encounter Duration

HYPOTHESIS:

```text
15–35 sec
```

첫 플레이.

60초 이상 Drone 하나와 씨름하면 실패 후보.

#### Two Player

기록:

```text
target switch count
friendly body blockage
leader clear time
follower clear time
split encounter
```

---

## 21. PASS Criteria

### Gameplay

- 첫 Drone을 공격받기 전에 볼 수 있음
- Patrol 경로를 시각적으로 이해 가능
- 기존 Sentry Telegraph 기억을 사용할 수 있음
- 새 공격 패턴 학습이 필요 없음
- Drone Kill 없이 통과 가능
- Drone Kill로도 통과 가능
- Rope Movement가 가장 빠른 해결법 중 하나
- Safe Route 존재
- Flow Route 존재
- 780에 Geometry가 종속되지 않음
- Rope Cut 없음

### Enemy

- Drone이 Turret의 완전한 상위호환이 아님
- Patrol Boundary가 명확함
- 무한 Chase 없음
- Encounter 종료 후 계속 따라오지 않음
- Target이 프레임마다 흔들리지 않음

### Story

- Worker District 분위기 유지
- Security가 여전히 작동한다는 것만 읽힘
- Group C의 진실은 여전히 모름

---

## 22. FAIL Conditions

### FAIL — Drone

- 화면 밖에서 첫 발 발사
- 발견 즉시 발사
- Player를 Stage 끝까지 추격
- 너무 빨라 Rope로 거리를 만들 수 없음
- Turret보다 이동/화력/Range/Tracking 모두 강함
- Projectile까지 완전히 새로운 방식
- Rope Cut 사용

### FAIL — Level

- Drone을 죽이지 않으면 Exit 불가능
- Drone 앞에서 멈춰 서서 자동공격 기다리는 것이 최적
- Cover 뒤 대기만 하면 모든 문제가 해결됨
- Flow Route가 특정 Augment 필수
- 440px Max Range Grapple이 필수

### FAIL — Story

2-2 종료 시 Player가:

> Group C 주민을 경비 드론이 가둔 것이다.

라고 확신할 정도로 직접적이면 실패.

---

## 23. 개발 구현 우선순위

### P0 — DRONE MOTION MOCK

```text
Drone
Point A ↔ Point B
```

만 먼저 구현.

공격 없음.

Player가 움직이는 Enemy를 읽을 수 있는지 확인.

### P1 — GRAYBOX

```text
P0–P4
G1–G5
Cover A/B
Patrol Corridor
Recovery
Exit
```

### P2 — TELEGRAPH

기존 Sentry 언어 재사용.

```text
Acquire
Track
Lock
Fire
Recover
```

### P3 — EXISTING PROJECTILE

기존 Projectile family 연결.

### P4 — OPTIONAL COMBAT

Kill / Bypass 양쪽 확인.

### P5 — TWO PLAYER TEST

Target Lock / Crossing / Body Collision 검증.

### P6 — ART

Drone Sprite + Transit Near Layer.

### P7 — AUDIO / VFX

Gameplay PASS 후.

---

## 24. Stage Data Concept

**HYPOTHESIS — Runtime Schema 아님**

```js
{
    id: "sector-02-2-patrol-walkway",

    sector: 2,
    region: 2,

    role: "first-moving-security-threat",

    gameplay: {
        newMechanic: "patrol-drone",
        enemyCount: 1,
        wind: false,
        ropeCut: false,
        requiredKill: false
    },

    drone: {
        type: "patrol-drone-t1",

        patrol: {
            from: { x: -32, y: -416 },
            to: { x: 416, y: -416 }
        },

        behavior: [
            "patrol",
            "detect",
            "acquire",
            "track",
            "lock",
            "fire",
            "recover"
        ],

        chaseOutsidePatrol: false
    },

    completion: {
        type: "reach-exit"
    },

    exit: {
        nextRegion: "sector-02-3-residential-service-node"
    }
}
```

---

## 25. 아트 담당자 전달문

### PATROL WALKWAY

2-2의 그림에서 가장 중요한 대비:

```text
사람은 없는데
생활 공간을 경비 장치가 계속 순찰한다.
```

### 공간

주거시설이다.

군사시설이 아니다.

필요:

- Residential Bridge
- Balcony
- Utility Pipe
- Access Gate
- Security Camera
- Service Lighting
- Patrol Dock
- Directional Sign

### Patrol Drone

작게.

Player보다 위압적으로 크게 만들지 않는다.

```text
24×24 ~ 32×32
```

범위.

기계 자체보다:

```text
움직임
+
Sensor
+
Telegraph
```

가 먼저 읽혀야 한다.

### 색 우선순위

```text
Player Red Scarf
Rope Cyan
Drone Lock Red/Orange
Gameplay Surface
Residential Environment
Background
```

순.

---

## 26. 개발자 최종 전달 요약

### SECTOR 02-2 — PATROL WALKWAY

**새 요소는 하나뿐이다.**

```text
STATIC THREAT
→
MOVING THREAT
```

### Drone

```text
1 Patrol Drone
```

- fixed patrol corridor
- familiar Sentry telegraph
- existing projectile family
- optional kill
- no rope cut
- no unlimited chase

### 플레이어가 배우는 것

```text
Drone을 죽여야 한다
```

가 아니라:

```text
Drone이 어디 있는지에 따라
내 Rope 경로가 바뀐다
```

이다.

### 핵심 성공 경험

초보:

```text
Observe
→ Wait
→ Safe Swing
→ Cover
→ Exit
```

숙련자:

```text
Read Patrol
→ Commit Early
→ Airborne Chain
→ Cross LOS
→ Exit
```

Build:

```text
IMPULSE / RELAY / SHEAR
```

모두 통과 가능.

---

## OPEN QUESTIONS

### 1. Patrol Drone 이동 속도

아직 확정하지 않는다.

Geometry와 함께 Playtest해서 결정.

첫 기준은:

> Player가 Drone의 왕복 방향을 보고 다음 위치를 예상할 수 있는가?

다.

### 2. Detection Range

현재 일반 Enemy `attackRange = 520`을 Drone에 그대로 복사하는 것은 권장하지 않는다.

현재 값 자체는 코드상 VERIFIED지만 Drone의 첫 Tutorial Encounter에 적합한지는 별도 HYPOTHESIS다.

2-2 전용 Detection / Fire Range는 Blockout 플레이테스트 후 확정한다.

### 3. Drone Targeting — Multiplayer

첫 공격 Cycle 중에는 Target을 고정하는 방향을 우선 권장한다.

두 플레이어가 있을 때 실시간 Nearest Target으로 계속 바꾸는 방식은 Telegraph 가독성을 깨뜨릴 가능성이 있으므로 실제 2인 Test 후 확정한다.

### 4. Patrol Drone 구현 구조

현재 `PatrolDrone` 전용 코드가 확인되지 않으므로 기존 `EnemyObject`를 무리하게 조건문으로 확장할지, 별도 이동 capability를 조합할지는 **개발 구조 검토 후 결정**한다.

현재 저장소에는 Generic Enemy 구현과 Combat System이 이미 존재한다.

---

SECTOR 02-2 / PATROL WALKWAY — REV 1.0
