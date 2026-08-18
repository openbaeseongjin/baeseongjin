# SECTOR 01-6 — COOLING SHAFT

*BLOCKOUT CANDIDATE · REV 3.0*

◀ PREV — [SECTOR 01-5 / AUGMENT TEST BAY](../1-5/README.md) · NEXT — [SECTOR 01-7 / PRESSURE BYPASS](../1-7/README.md) ▶

Sector: 01 MAINTENANCE
Stage: 06
Theme: Industrial Cooling / Ventilation Shaft
Difficulty: ★★☆
Expected First Playtime: 120~180 sec
Expected Skilled Clear: 50~80 sec

Primary Goal:
FIRST EXTERNAL FORCE

New Gameplay Mechanic:
WIND

Reused Mechanics:
- Basic Grapple
- Swing / Release
- Airborne Re-Attach
- First Rope Augment

Enemy:
OPTIONAL ACCESS CARRIER (REUSED SENTRY T1)

Damage Hazard:
NONE

Instant Kill:
NONE

Moving Platform:
NONE

---

## 1. 한 줄 정의

고장 난 Cooling Distribution Shaft를 통과하면서
플레이어가 처음으로 바람이라는 외력이
Rope의 Swing Arc를 바꾼다는 사실을 배우는 Stage.

첫 번째 Fan은 약한 지속풍으로
바람의 존재를 안전하게 학습시키고,

두 번째 Fan은
WARNING → ACTIVE → LULL
주기를 사용해

"기다려서 안전하게 갈 수도 있고,
바람을 이용해 더 빠르게 갈 수도 있다."

는 선택을 만든다.

핵심 질문:

"바람을 피해야 할 장애물이 아니라
내 Swing에 이용할 힘으로 볼 수 있는가?"

---

## 2. 전체 게임에서의 역할

1-1:
Basic Rope

1-2:
Rope Chaining

1-3:
Movement Under Enemy Pressure

1-4:
First Augment

1-5:
Build Expression

1-6:
FIRST ENVIRONMENTAL FORCE

1-7:
Wind + Turret + Augment Combination

1-8:
Sector Finale

따라서 1-6의 본선 Wind 학습 구간은 적 없이 유지한다.
다만 Sector 출구용 Access Module 후보 3개 중 하나를 얻는 선택 전투를
Neutral Deck의 별도 Carrier encounter로 둔다. 플레이어는 다른 두 Carrier를 선택해
이 전투를 건너뛸 수 있으며, 새 적 유형이나 새 공격 규칙은 도입하지 않는다.

플레이어가 실패했을 때 원인은:

WIND + ROPE

관계 하나로 읽혀야 한다.

---

## 3. 1-6에서 새로 배우는 것

- 바람은 Player 이동 방향을 바꾼다.
- Rope에 매달린 상태에서도 Swing Arc가 변한다.
- 같은 Anchor라도 바람 방향에 따라 궤적이 달라진다.
- 바람을 거슬러 갈 수도 있다.
- 바람을 이용하면 더 멀리 / 빠르게 이동할 수도 있다.
- 강풍은 항상 켜져 있지 않을 수 있다.
- 환경의 시각적 움직임으로 바람 상태를 미리 읽을 수 있다.

---

## 4. 1-6에서 배우지 않는 것

DO NOT ADD:

- 본선 Wind 학습을 방해하는 추가 Turret(선택 Carrier 1기는 예외)
- Drone
- Projectile
- Rope Cut
- Laser
- Moving Platform
- Rotating Blade Damage
- Fan Contact Damage
- New Augment
- Second Augment Choice
- Boss
- Instant Death Pit

Fan은 이번 Stage에서:

WIND SOURCE

일 뿐이다.

회전날 접촉 Hazard로 사용하지 않는다.

---

## 5. 공간 콘셉트

공간:

VERTICAL COOLING DISTRIBUTION SHAFT

도시 하층에서 발생한 열을
위쪽 Cooling Grid로 보내는 거대한 환기 설비.

1-1에서 배경으로 봤던
거대한 Cooling Fan이
이번에는 실제 작동하는 Gameplay 설비가 된다.

대표 요소:

- Giant Cooling Fans
- Ventilation Duct
- Pressure Louvers
- Steam
- Condensation
- Maintenance Bridges
- Cooling Pipes
- Airflow Indicators

공간 인상:

1-5:
Industrial Test Facility

1-6:
Huge Ventilation Void

이전보다 중앙 Negative Space를 크게 확보.

---

## 6. Pixel / Grid 기준

Base Grid:
32×32 px

Player:
48×48 px output

Anchor:
24×24 px

Thin Platform:
32×16 px

Standard Platform:
32×32 px

Small Vent:
64×64 px

Main Cooling Fan:
192×192 ~ 256×256 px

Large Fan Housing:
256×256 ~ 320×320 equivalent

Stage Width:
3840 px (960px 기존 Wind spine + 왼쪽 Access Annex)
= 30 tiles

Stage Height:
1408 px
= 44 tiles

Coordinate:

X = -480 ~ +480
Y = 0 ~ -1408

---

## 7. Wind Visual Rule

바람 자체를
Cyan Gameplay Line으로 표현하지 않는다.

Cyan은 Rope / Anchor 언어로 유지.

Wind는 다음으로 표현:

- Steam
- Dust
- Condensation particles
- Hanging cable
- Cloth strip
- Red Scarf movement
- Vent shutter
- Fan rotation

즉:

ROPE = CYAN

WIND = ENVIRONMENT MOTION

색보다 움직임으로 읽힌다.

---

## 8. 전체 맵 구조

SYMBOL

●      = Grapple Anchor
<<<    = Wind left
>>>    = Wind right
[F]    = Cooling Fan
════   = Main Platform
----   = Recovery Platform
██     = Solid Structure


                         Y -1408

      ┌─────────────────────────────────────┐
      │                     GATE 07 →      │
      │                ═════════════════   │
      │                     P6             │
      │                     ↑              │
      │                  ● F               │
      │                                    │
      │      [FAN B] >>>>>>>>>>>>>>>       │
      │      WARNING / ACTIVE / LULL       │
      │                                    │
      │                    ● E             │
      │                  ╱                 │
      │                 ╱                  │
      │          ---- R4 ----              │
      │                                    │
      │       ● D                          │
      │          ╲                         │
      │           ╲                        │
      │            ╲                       │
      │     █████████████                  │
      │     CENTRAL COOLING CORE           │
      │                                    │
      │           ---- R3 ----             │
      │                                    │
      │                         ● C        │
      │                        ╱           │
      │                       ╱            │
      │
      │  <<<<<<<<<<<<<< [FAN A]            │
      │   CONTINUOUS WEAK WIND             │
      │                                    │
      │           ● B                      │
      │         ╱                          │
      │        ╱                           │
      │   ---- R2 ----                     │
      │                                    │
      │      ● A                           │
      │                                    │
      │   ---- R1 ----                     │
      │                                    │
      │ P0 START                           │
      │ ═════════════════                  │
      └─────────────────────────────────────┘

                         Y 0


Stage는 크게 두 개의 Wind Lesson으로 구성.

LOWER:
FAN A / CONTINUOUS WIND

UPPER:
FAN B / PULSED WIND

---

## 9. Zone 구성

ZONE A
AIRFLOW PREVIEW

Y:
0 ~ -256

목적:
바람을 보기 전에 먼저 시각적으로 예상.

---

ZONE B
FAN A — CONTINUOUS WIND

Y:
-256 ~ -704

목적:
바람이 Swing Arc를 바꾼다는 사실 학습.

---

ZONE C
NEUTRAL RECOVERY

Y:
-704 ~ -864

목적:
바람 없는 공간에서 비교 / 휴식.

---

ZONE D
FAN B — PULSED WIND

Y:
-864 ~ -1248

목적:
Wind Cycle 읽기 + 이용하기.

---

ZONE E
EXIT

Y:
-1248 ~ -1408

목적:
1-7 Pressure Bypass 예고.

---

## 10. PLAYER SPAWN

position:
(-320, -32)

---

## 11. P0 — START PLATFORM

bounds:

x = -416 ~ -96
y = 0

size:
320×32 px

role:

- Stage Start
- Fan silhouette preview
- Wind visual language preview

Hazard:
NONE

---

## 12. Stage 시작 연출

플레이어가 들어오면
아직 직접 Wind Zone 안은 아니다.

하지만 화면 위쪽에서:

Steam이 왼쪽으로 흐름.

Loose cable이 왼쪽으로 기울어짐.

Red Scarf 끝이 약하게 왼쪽으로 움직임.

Background Fan이 회전.

작은 Display:

COOLING DISTRIBUTION

AIRFLOW:
UNSTABLE

목적:

Player가 바람을
맞기 전에 먼저 본다.

---

## 13. ANCHOR A — WIND-FREE REVIEW

position:

(-128, -224)

visual:
24×24 px

role:

- 기존 Rope 한 번 복습
- Wind Zone 진입 전 기준 움직임 제공

difficulty:
EASY

---

## 14. R1 — LOWER CATCH

bounds:

x = -256 ~ -32
y = -192

size:
224×16 px

role:
A 실패 Catch.

---

## 15. ZONE B — FAN A

FAN A 역할:

FIRST WIND SOURCE

상태:

CONTINUOUS

방향:

RIGHT → LEFT

즉:

<<<<<<<<<<

강도:

WEAK

Player Damage:
NONE

Fan Contact Damage:
NONE

Cycle:
NONE

---

## 16. FAN A 위치

recommended:

(+416, -480)

mount:

RIGHT WALL

visual:

192×192 ~ 256×256 px

Fan 자체는
대형 Mid/Near Environment Object.

Gameplay Hitbox:
NONE 또는 housing only.

Fan Blade:
NO DAMAGE.

---

## 17. FAN A WIND ZONE

recommended bounds:

x = -320 ~ +352
y = -320 ~ -640

즉 샤프트 중앙 대부분.

방향:

(-1, 0)

초기 Wind Acceleration Hypothesis:

180 ~ 240 px/s²

정확한 값:
PLAYTEST

목적:

바람 때문에 Player가
조금 왼쪽으로 밀린다는 것이 느껴지지만,

기본 Rope를 망가뜨릴 정도는 아님.

---

## 18. Wind 물리 원칙

Wind는:

Player Position을 직접 이동시키지 않는다.

Teleport / Tween 방식 금지.

Player velocity에
continuous external acceleration으로 작용.

Concept:

velocity.x += windAcceleration.x * dt
velocity.y += windAcceleration.y * dt

이후 기존 Rope Constraint 적용.

목표:

Wind가 Rope와 실제로 상호작용해
Swing Arc가 달라지도록 한다.

---

## 19. Wind가 Rope Anchor에 미치는 영향

NONE.

Anchor position:
STATIC

Rope attachment point:
STATIC

Wind affects:
PLAYER BODY

Wind does not affect:
ANCHOR

따라서:

고정점은 그대로

Player 궤적만 변화.

예측 가능한 Pendulum 유지.

---

## 20. ANCHOR B — FIRST WIND SWING

position:

(+96, -416)

visual:
24×24 px

role:

첫 Wind Swing.

Player가 B에 붙으면
Fan A가 Player를 왼쪽으로 지속적으로 밀어

기본 Swing Arc와 차이가 발생.

---

## 21. B 구간의 설계 의도

바람이 없었다면:

B
→ 오른쪽/왼쪽 대칭 Swing

바람이 있으면:

왼쪽 Arc:
조금 커짐

오른쪽 Arc:
조금 줄어듦

Player가 자연스럽게:

"바람이 나를 밀고 있다."

라고 체감.

Tutorial Text보다
움직임 차이를 우선.

---

## 22. ANCHOR C — WIND-ASSIST TARGET

position:

(-224, -640)

visual:
24×24 px

role:

Fan A의 방향을 이용하면
쉽게 도달할 수 있는 Target.

B→C가
바람 방향과 일치하도록 배치.

즉 첫 Wind Lesson은:

바람을 거스르기

보다

바람을 이용하기

부터 시작.

---

## 23. 왜 첫 Wind가 플레이어를 도와주는가

첫 경험부터:

Wind = 방해

로 학습시키면

이후 Player는
Fan이 보일 때마다 기다리거나 피하려 한다.

우리 목표:

Wind = External Tool / Risk

둘 다 가능.

따라서 Fan A는
첫 성공 경로를 오히려 도와준다.

---

## 24. FAN A Safe Route

A
→ B
→ 짧게 Swing
→ R2
→ C

안전하게 Platform을 사용.

---

## 25. FAN A Flow Route

A
→ B
→ Wind-assisted Swing
→ Release
→ Airborne C Attach

Landing 0.

---

## 26. FAN A Augment Interaction

### IMPULSE

바람 방향 + Impulse를 합쳐
더 큰 Arc 가능.

하지만 Stage 전체 Skip 금지.

---

### RELAY

B→C Re-Attach가
Wind 때문에 궤적이 변해도
Relay Window로 안정적인 연결 가능.

---

### SHEAR

Enemy가 없으므로
공격 효과는 특별한 이점 없음.

이것은 의도적.

모든 Stage에서
모든 Build가 최고의 효과를 받을 필요 없음.

SHEAR Player도
기본 Rope로 정상 통과 가능.

---

## 27. R2 — FAN A RECOVERY

bounds:

x = -128 ~ +128
y = -512

size:
256×16 px

role:

B→C 실패 Catch.

중요:

R2에도 약한 Wind가 적용될 수 있지만
Player가 즉시 밀려 떨어질 정도는 금지.

권장:

Recovery Platform에서는
Wind Strength 50~70%로 감소.

또는
부분적인 구조물 차폐 사용.

---

## 28. Wind Shadow 개념 도입

Solid Cooling Core 뒤에는
Wind가 약하거나 없는 공간을 만들 수 있다.

이를:

WIND SHADOW

라고 정의.

Player가 구조물 뒤에 들어가면:

Steam motion 감소.

Scarf 정상화.

Wind force 감소.

별도 UI 없음.

환경만으로 이해.

이 개념은 1-7에서
Cover + Wind 조합에 재사용 가능.

---

## 29. ZONE C — NEUTRAL PLATFORM

Fan A 이후
잠깐 완전한 Wind-free Zone.

P3 / Neutral Deck:

bounds:

x = -288 ~ +64
y = -768

size:
352×32 px

role:

- Fan A Lesson 종료
- 기본 Rope와 Wind Rope의 차이 체감
- Fan B Preview
- 짧은 휴식

---

## 30. Neutral Deck 연출

Fan A 소리가 줄어듦.

Steam 거의 없음.

Scarf 움직임 감소.

위쪽에서 Fan B가 보임.

Fan B는:

돌아감
→ 멈춤
→ 돌아감

Cycle을 반복.

Player는 아직 위험구간에 들어가지 않은 상태에서
Fan B 주기를 미리 볼 수 있어야 한다.

---

## 31. FAN B — PULSED WIND

Fan B는
1-6의 Main Challenge.

방향:

LEFT → RIGHT

즉:

>>>>>>>>>>>

Fan A와 반대.

상태:

WARNING
→ ACTIVE
→ LULL
→ WARNING

반복.

---

## 32. FAN B 위치

recommended:

(-416, -1024)

mount:

LEFT WALL

visual:

256×256 px

Fan A보다 약간 크게 보일 수 있음.

---

## 33. FAN B STATE MACHINE

IDLE / LULL

↓

WARNING

↓

ACTIVE

↓

DECAY

↓

LULL

↓

WARNING

반복.

---

## 34. FAN B 초기 Timing Hypothesis

LULL:

1.5 ~ 2.0 sec

WARNING:

0.6 ~ 0.8 sec

ACTIVE:

1.2 ~ 1.6 sec

DECAY:

0.3 sec

정확한 값:
PLAYTEST

목적:

Player가 Cycle을 한두 번 보고
예측할 수 있을 정도로 단순하게 유지.

랜덤 Timing 금지.

---

## 35. FAN B Telegraph

LULL:

- Fan slow / stopped
- Steam settles
- low hum

WARNING:

- Fan spins up
- shutter opens
- dust starts moving
- mechanical rising sound

ACTIVE:

- full rotation
- strong Steam stream
- hanging cable fully deflected
- strong airflow audio

DECAY:

- fan slows
- particles gradually settle

색 UI에 의존하지 않는다.

---

## 36. FAN B Wind Acceleration

Initial HYPOTHESIS:

ACTIVE:

320 ~ 420 px/s²

WARNING:

0 → ACTIVE strength ramp

LULL:

0 ~ 40 px/s²

Fan A보다 명확히 강함.

하지만 Player Control을 완전히 빼앗으면 안 됨.

---

## 37. ANCHOR D — CYCLE ENTRY

position:

(-160, -896)

visual:
24×24 px

role:

Fan B Cycle을 관찰하며
언제 출발할지 결정하는 Anchor.

D 주변은 Wind Shadow에 가까움.

즉 D에서 잠시 기다릴 수 있다.

---

## 38. ANCHOR E — ACTIVE WIND TARGET

position:

(+192, -1088)

visual:
24×24 px

role:

Fan B의 오른쪽 바람을 이용하는 핵심 Target.

D→E:

Wind direction과 일치.

---

## 39. ANCHOR F — EXIT TARGET

position:

(-32, -1280)

visual:
24×24 px

role:

Fan Zone 탈출.

E에서 Release 후
F 또는 Final Deck으로 이동.

---

## 40. FAN B의 세 가지 공략

### SAFE ROUTE

D Wind Shadow에서 대기.

↓

Fan ACTIVE 종료 확인.

↓

LULL 시작.

↓

D → E

↓

Platform

↓

F

가장 안전.

가장 느림.

---

### FLOW ROUTE

WARNING 중 D에서 출발.

↓

Wind가 강해지는 순간 Swing.

↓

ACTIVE force를 이용해
D→E 빠르게 이동.

↓

E→F.

가장 빠른 기본 Route.

---

### RECOVERY ROUTE

Timing 실패.

↓

R4로 떨어짐.

↓

Wind Shadow에서 안정화.

↓

E 또는 D 재시도.

전체 Stage Reset 없음.

---

## 41. 바람을 기다리는 것이 유일한 정답이면 실패

Fan B가:

ACTIVE = 절대 통과 불가능

LULL = 통과 가능

구조면

Wind는 물리 기믹이 아니라
단순 신호등이 된다.

금지.

ACTIVE에도 통과 가능해야 한다.

차이는:

LULL:
쉬움

ACTIVE:
어렵지만 Wind를 이용하면 빠름

이어야 한다.

---

## 42. IMPULSE × FAN B

IMPULSE Player는
Wind ACTIVE와 Impulse를 함께 이용해
큰 Speed Burst 가능.

하지만 Overshoot 위험도 생김.

좋은 플레이:

D
→ ACTIVE 시작
→ Impulse
→ E 또는 F 방향 큰 Arc

즉:

HIGH REWARD
+
HIGH OVERSHOOT RISK

---

## 43. RELAY × FAN B

RELAY는
강풍 때문에 평소보다 궤적이 달라져도

D→E→F 연결을
안정적으로 이어갈 수 있음.

장점:

Precision Recovery
+
Continuous Chain

---

## 44. SHEAR × FAN B

Enemy 없음.

특수 혜택 없음.

하지만 이 Stage에서
SHEAR Build가 불리해서 통과하기 어려우면 안 됨.

기본 Safe/Flow Route로 정상 진행.

향후 1-7에서:

Wind
+
Turret
+
SHEAR Geometry

가 결합되면서 다시 강점 발생.

---

## 45. R3 — CENTRAL RECOVERY

position:

Central Cooling Core 아래.

size:
256×16 px

role:

C / D 전환구간 Catch.

Wind:
NONE 또는 VERY LOW

완전 안전.

---

## 46. R4 — FAN B RECOVERY

bounds:

x = +32 ~ +288
y = -1120

size:
256×16 px

role:

D→E 실패 Catch.

Wind:
부분 차폐.

ACTIVE Wind에서
Player가 플랫폼에 서 있는 동안
계속 미끄러져 떨어지면 안 됨.

---

## 47. FINAL DECK P6

bounds:

x = -96 ~ +320
y = -1344

size:
416×32 px

Wind:
NONE

role:

- Wind Challenge 종료
- Story
- 1-7 Preview

---

## 48. Exit Story

근처 Cooling Control Display:

COOLING PRESSURE:
CRITICAL

↓

AUTOMATIC BYPASS:
FAILED

↓

MANUAL PRESSURE BYPASS
REQUIRED

Exit:

PRESSURE BYPASS
SERVICE ACCESS

이게 1-7 이름과 자연스럽게 연결.

---

## 49. Story 역할

1-6에서는
큰 음모 Reveal 없음.

환경 스토리:

Vertical Grid Cascade 때문에
Cooling System도 무너지고 있다.

이전에는:

Lift Offline

Security Response

였고

이번에는:

Cooling Pressure Failure

즉 사고가 도시 여러 Infrastructure System으로
연쇄 확산되고 있음을 보여준다.

---

## 50. Player가 받아야 하는 이야기

"도시 전체 설비가 하나씩 무너지고 있다."

정도.

아직:

왜 Lower Grid가 희생되는지

누가 승인했는지

는 공개하지 않는다.

---

## 51. Camera — Intro

show:

- Player
- A
- distant Fan A
- moving Steam

Fan이 Gameplay에 들어오기 전에
보여준다.

---

## 52. Camera — Fan A

B Attach 시:

show:

- Player
- B
- C
- Steam direction
- Fan A 일부

바람 방향을 화면에서 읽을 수 있어야 함.

---

## 53. Camera — Neutral Deck

P3 도착:

Camera가 약간 위쪽을 보여

Fan B
+
D
+
Wind particles

를 한 화면에 Preview.

Player는 안전한 상태에서
Cycle 한 번을 관찰 가능.

---

## 54. Camera — Fan B

D Attach 시:

show:

- D
- E
- Fan B
- Wind direction
- R4

가능하면 동시에.

E Attach 시:

show:

- F
- Final Deck

---

## 55. Camera 금지사항

DO NOT:

- Fan을 화면 밖에 숨긴 채 Wind 적용
- Wind 방향이 보이지 않음
- Next Anchor가 Wind 시작 후에야 등장
- Recovery Deck이 화면 밖
- Fan Animation과 실제 Wind State 불일치

---

## 56. Wind Telegraph 동기화

Fan visual state와
실제 Wind force는 반드시 동일한 state source 사용.

금지:

Animation:
ACTIVE

Physics:
LULL

또는

Animation:
STOPPED

Physics:
STRONG WIND

Player trust가 무너짐.

---

## 57. Physics 구현 권장 구조

Concept:

WindZone {
  bounds
  direction
  acceleration
  state
  falloff
}

Player가 WindZone 내부에 있으면:

externalAcceleration +=
direction * currentWindStrength

이 값을 Player Physics에 전달.

권장 적용 순서 개념:

1. Player input
2. Player locomotion
3. Wind external acceleration
4. Gravity
5. Rope constraint
6. Position integration
7. Collision resolution
8. Rope correction

정확한 코드 위치는
기존 Physics 구조에 맞춰 개발자가 조정.

---

## 58. Wind Zone 경계

Wind Zone 경계에서
Force가 즉시 0 → 100%가 되면
부자연스러울 수 있음.

초기 권장:

64~96px Falloff Region.

Zone 중심:
100%

경계:
점진적 감소.

단 처음 구현은
Hard Rect Zone으로 먼저 재미 검증 가능.

우선순위:

Gameplay
→ Falloff polish

---

## 59. Grounded Player와 Wind

Player가 큰 안전 Platform에
서 있는 동안 약풍 때문에
계속 미끄러지는 것은 피한다.

Prototype 권장:

Grounded 상태의 horizontal wind influence:

Airborne 대비
약 25~40%

후보.

이유:

Wind는 Rope Arc를 바꾸는 기믹이지
가만히 서는 것까지 스트레스 주는 기믹이 아님.

---

## 60. Rope Attached 상태

Rope Attached 상태에서는
Wind 효과를 제대로 적용.

이 순간이 1-6 핵심.

Wind가:

Player velocity

를 변화시키고

Rope constraint가:

고정 길이

를 유지하면서

결과적으로 Swing Arc 변화.

---

## 61. Detached Airborne 상태

Wind 적용.

Release 후에도:

바람이 Player trajectory를 계속 변경.

따라서 Player는:

Rope Swing

뿐 아니라

Release Arc

에서도 Wind를 읽어야 한다.

---

## 62. Wind와 maxHorizontalSpeed

현재 비-Rope 상태에는
horizontal speed clamp가 존재.

Wind를 추가한 후 반드시 확인:

- Strong Fan이 speed clamp 때문에 거의 체감되지 않는가?
- 반대로 Wind를 clamp 밖에 적용해서 비정상 속도가 나오는가?

이 부분은 구현 순서에 따라 달라질 수 있으므로
1-6 Greybox에서 Velocity Logging 필요.

---

## 63. 필수 Physics Telemetry

Wind Zone마다 기록:

player position
player velocity
rope attached
rope length
wind state
wind strength
wind direction
grounded
selected augment

특히:

D release 직전 velocity

D release 직후 velocity

E attach 직전 velocity

를 비교.

---

## 64. Fan A Test Matrix

Test:

Wind 0

Wind 160

Wind 200

Wind 240

목적:

Player가 설명 없이
바람의 존재를 느끼는 최소값 확인.

Fan A는:

"강하다"

보다

"분명히 다르다"

가 목표.

---

## 65. Fan B Test Matrix

Test:

280
320
360
420

목적:

ACTIVE 상태가
명확한 변화는 만들지만

Control Loss가 되지 않는 범위 찾기.

---

## 66. Wind Direction Visual Test

Player에게 질문하지 않고
플레이 영상만 보고 확인:

Wind 시작 전
Player aim / movement이
올바른 방향으로 준비되는가?

YES면
환경 시각 정보가 성공.

계속 반대 방향으로 실수하면
Wind readability 실패.

---

## 67. Pixel Art — Main Fan

Fan A:

192×192 ~ 256×256 px

Fan B:

256×256 px recommended

구성:

- thick industrial housing
- 4~6 blade silhouette
- central motor
- shutter
- warning stripes
- pipe connections

Gameplay Object지만
Player가 Fan에 붙어야 하는 Target으로 보이면 안 됨.

Cyan 금지.

---

## 68. Fan Animation

LULL:

2~4 frame slow / stop state

WARNING:

2~4 frame spin-up

ACTIVE:

4~6 frame rapid rotation

DECAY:

spin-down

High frame count 불필요.

Speed impression은
blade frame + particles + sound로 만든다.

---

## 69. Wind Particles

Steam / Dust asset:

16×16 ~ 32×16 px

반복 사용.

Background particle density는
Gameplay 판독성을 가리지 않게 제한.

Active Fan B에서도
Anchor를 가리면 안 됨.

---

## 70. Scarf Feedback

Player Red Scarf가
Wind Direction을 읽는 보조 장치로 기능.

RIGHT WIND:

Scarf tail left→right 방향으로 더 강하게 뻗음.

LEFT WIND:

반대.

다만 Physics Simulation을
정교하게 만들 필요 없음.

State-based procedural / simple deformation이면 충분.

---

## 71. Background FAR

512×288
또는
960×540

내용:

- giant ventilation cavities
- distant fans
- cooling towers inside mega-structure
- vertical pipes
- deep corporate infrastructure

Dark Navy / Charcoal.

---

## 72. Background MID

128×128 ~ 256×256.

- cooling fan module
- duct junction
- condenser
- pressure tank
- large pipe
- ventilation shutter
- cooling core

High-bit density 유지.

---

## 73. Background NEAR

32×32 ~ 64×64.

- pressure gauge
- warning lamp
- drain pipe
- condensation
- service marking
- inspection panel
- vent cover

Anchor 주변은 Clean Zone.

---

## 74. 색 규칙

PLAYER:
Dark + Red Scarf

ROPE / ANCHOR:
Cyan

FAN:
Dark Steel

WARNING:
Orange / Red small accent

WIND:
Steam / White Gray / low saturation

BACKGROUND:
Dark Navy / Charcoal

Wind에 Cyan 사용 금지.

---

## 75. Sound Design

Fan A:

constant low industrial rumble.

Fan B LULL:

low motor idle.

WARNING:

spin-up rising sound.

ACTIVE:

strong airflow roar.

DECAY:

falling motor tone.

Wind Shadow:

소리가 확실히 줄어듦.

시각뿐 아니라 귀로도
Zone 경계를 이해 가능하게 한다.

---

## 76. 전체 Route

### SAFE ROUTE

START
→ A
→ B
→ R2
→ C
→ Neutral Deck
→ Wait Fan B LULL
→ D
→ E
→ R4 / Platform
→ F
→ Exit

---

### FLOW ROUTE

START
→ A
→ B
→ Wind-assisted C
→ Neutral Deck
→ D during WARNING
→ use ACTIVE Wind
→ E
→ F
→ Exit

---

### RECOVERY ROUTE

B/C miss
→ R2/R3
→ Retry

D/E miss
→ R4
→ Retry

Stage Reset 없음.

---

## 77. IMPULSE Route

핵심:

Wind Direction
+
Impulse Direction

을 맞춰 큰 Arc 생성.

하지만 1-5처럼
Stage 대규모 Skip은 만들지 않는다.

보상:

위험구간 체류시간 감소
+
큰 이동 만족감.

---

## 78. RELAY Route

Wind 때문에 평소보다
Release trajectory가 변해도

B→C
D→E→F

Re-Attach를 부드럽게 연결.

보상:

Wind 속에서도 Flow 유지.

---

## 79. SHEAR Route

특별한 Offensive Opportunity 없음.

이 Stage에서는
Movement fundamentals를 그대로 사용.

중요:

Build마다 매 Stage 동등한 보너스를
억지로 제공하지 않는다.

1-7에서 Shear의 환경+전투 조합을 보상.

---

## 80. Playtest Questions

1.
첫 Fan에 들어가기 전에
바람 방향을 예상했는가?

2.
Fan A에서 Rope Arc가 달라졌음을
설명 없이 느꼈는가?

3.
바람이 단순 방해물이라고 느꼈는가,
아니면 이용할 수 있다고 느꼈는가?

4.
Fan B의 ACTIVE/LULL 주기를
한두 번 본 뒤 예측할 수 있었는가?

5.
ACTIVE 중에도 통과할 수 있다고 느꼈는가?

6.
숙련 후 ACTIVE를 일부러 이용하고 싶었는가?

7.
실패했을 때
Wind 때문인지 Rope 조작 때문인지 이해됐는가?

8.
Fan Animation과 실제 Force가 일치한다고 느꼈는가?

---

## 81. PASS Criteria

PASS 01
Fan A 전에 Wind Direction이 시각적으로 읽힘.

PASS 02
Fan A에서 바람 효과가 분명하지만 과도하지 않음.

PASS 03
B→C에서 Wind를 이용하면 더 자연스러운 Route가 만들어짐.

PASS 04
Fan B State가 설명 없이 대략 읽힘.

PASS 05
Fan B ACTIVE에서도 숙련자는 통과 가능.

PASS 06
LULL은 Safe Route 역할을 함.

PASS 07
ACTIVE는 Fast/Skill Route로 활용 가능.

PASS 08
Wind가 Rope Swing과 Release Arc 양쪽에 영향을 줌.

PASS 09
Wind 때문에 Anchor targeting 자체가 불쾌해지지 않음.

PASS 10
Recovery에서 3~6초 내 재시도.

PASS 11
Enemy 없이도 Stage가 충분히 새롭고 재미있음.

PASS 12
세 Augment 모두 정상 클리어 가능.

PASS 13
Impulse/Relay는 자연스러운 장점을 가지지만 필수 아님.

PASS 14
Fan contact damage가 없어 학습 목표가 하나로 유지됨.

PASS 15
첫 플레이 약 120~180초.

---

## 82. FAIL Conditions

FAIL IF:

- Fan이 화면 밖인데 Wind가 작동
- Wind 방향을 알 수 없음
- Active/Lull이 랜덤처럼 느껴짐
- Active 중 통과가 사실상 불가능
- Lull을 기다리는 것이 무조건 정답
- Fan Blade가 Damage까지 줘 학습이 섞임
- Recovery Platform에서 Wind 때문에 계속 추락
- Wind가 Player Position을 강제로 Tween
- Rope Anchor 자체가 움직임
- Wind가 너무 강해 Player Control 상실
- Wind가 너무 약해 차이를 못 느낌
- Cyan Wind Effect가 Anchor를 가림
- 새 Enemy가 추가됨
- Background Steam이 Gameplay를 가림

---

## 83. 구현 우선순위

PRIORITY 1

Greybox:

- A/B/C/D/E/F
- Recovery Platforms
- Neutral Deck
- Final Deck

Wind 없이 기본 Rope로 전체 클리어 확인.

---

PRIORITY 2

Generic WindZone.

Required:

- bounds
- direction
- strength
- active state

---

PRIORITY 3

Fan A continuous wind.

---

PRIORITY 4

Fan B state machine.

LULL
WARNING
ACTIVE
DECAY

---

PRIORITY 5

Wind Shadow / sheltered Recovery.

---

PRIORITY 6

Velocity Telemetry.

---

PRIORITY 7

Augment Interaction Test.

---

PRIORITY 8

Camera.

---

PRIORITY 9

Fan Animation / Steam / Scarf / Sound.

Gameplay 튜닝 후 아트 적용.

---

## 84. 개발용 Stage Data Concept

stageId:
sector-01-06

name:
COOLING SHAFT

subtitle:
AIRFLOW FAILURE

bounds:
960×1408

spawn:
(-320,-32)

grappleTargets:
- A
- B
- C
- D
- E
- F

platforms:
- P0 start
- R1 lower-catch
- R2 fan-a-recovery
- R3 neutral-recovery
- neutral-deck
- R4 fan-b-recovery
- final-deck

windZones:

- id: fan-a-wind
  direction: LEFT
  mode: CONTINUOUS
  strength: WEAK

- id: fan-b-wind
  direction: RIGHT
  mode: PULSED
  states:
    - LULL
    - WARNING
    - ACTIVE
    - DECAY

environmentObjects:
- fan-a
- fan-b
- central-cooling-core
- ventilation-ducts

enemies:
NONE

damageHazards:
NONE

storyTriggers:
- airflow-unstable
- cooling-pressure-critical
- bypass-required

routes:
- safe
- flow
- recovery

cameraZones:
- airflow-preview
- fan-a
- neutral-deck
- fan-b
- exit

---

## 85. 아트 담당자 전달문

32px Grid 기반의
거대한 Vertical Cooling Distribution Shaft.

Gameplay 구조는
큰 Negative Space와 소수의 Anchor / Platform으로 단순하게 유지.

Player:
48×48 dark silhouette + long Red Scarf.

Anchor:
24×24 Cyan.

Main Fan:
192~256px 이상.

Fan B는 약 256×256px 권장.

Background는:

- giant fan housing
- ventilation ducts
- cooling pipes
- pressure tanks
- steam
- condenser machinery

를 128~256px 단위로 조합해
SANABI-inspired High-bit 산업 밀도를 만든다.

Wind는 Cyan line으로 표시하지 않는다.

대신:

Steam
Dust
Cable
Scarf
Shutter
Fan Rotation

의 움직임으로 방향과 세기를 보여준다.

Fan A:
약하고 지속적인 Wind.

Fan B:
LULL / WARNING / ACTIVE / DECAY가
Animation만으로도 구분되어야 한다.

Red / Orange는
Fan Warning indicator에 소량만 사용.

Cyan은 Rope / Anchor에 집중.

---

## 86. 개발자 최종 전달 요약

SECTOR 01-6 `COOLING SHAFT`는
게임 최초로 Environment Force인 WIND를 소개하는 Stage다.

Enemy와 Damage Hazard는 사용하지 않는다.

첫 Fan A는
약한 Continuous Wind를 사용하며,
바람 방향으로 이동하는 B→C Route를 구성해
Player가 처음부터 Wind를 도움으로 경험하게 한다.

두 번째 Fan B는:

LULL
→ WARNING
→ ACTIVE
→ DECAY

의 예측 가능한 Cycle을 사용한다.

LULL을 기다리면
안전하게 통과할 수 있지만,

숙련자는 WARNING에서 출발해
ACTIVE Wind를 Swing과 Release에 이용하면
더 빠르게 D→E→F를 통과할 수 있다.

따라서 Wind는:

"켜지면 기다려야 하는 장애물"

이 아니라

"위험하지만 이용할 수 있는 외력"

이어야 한다.

Wind는 Player 위치를 직접 이동시키지 않고
velocity에 external acceleration으로 작용하며,
고정 Rope Anchor에는 영향을 주지 않는다.

IMPULSE는 Wind와 힘을 합쳐 큰 Arc를 만들 수 있고,

RELAY는 바뀐 궤도에서도 Re-Attach Flow를 유지하는 데 유리하며,

SHEAR는 특별한 전투 보너스 없이도
기본 Route로 정상 클리어 가능해야 한다.

Stage 마지막에는:

COOLING PRESSURE: CRITICAL
AUTOMATIC BYPASS: FAILED
MANUAL PRESSURE BYPASS REQUIRED

를 표시해

다음 SECTOR 01-7
`PRESSURE BYPASS`

로 연결한다.

Stage 성공 기준:

"Player가 Fan이 켜졌을 때 기다리기만 하는 대신,
언제 이 바람을 Swing에 이용할 수 있을지 생각하기 시작하는가?"

이다.

---

SECTOR 01-6 / COOLING SHAFT — BLOCKOUT CANDIDATE · REV 3.0
