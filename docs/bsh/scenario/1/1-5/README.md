# SECTOR 01-5 — AUGMENT TEST BAY

*BLOCKOUT CANDIDATE · REV 3.0*

◀ PREV — [SECTOR 01-4 / MAINTENANCE NODE](../1-4/README.md) · NEXT — [SECTOR 01-6 / COOLING SHAFT](../1-6/README.md) ▶

Sector: 01 MAINTENANCE
Stage: 05
Theme: Live Grapple Calibration / Maintenance Test Bay
Difficulty: ★★
Expected First Playtime: 120~180 sec
Expected Skilled Clear: 45~75 sec

Primary Goal:
FIRST BUILD EXPRESSION

New Gameplay Mechanic:
NONE

Reused Mechanics:
- Basic Grapple
- Airborne Re-Attach
- Sentry Turret
- First Rope Augment

Required Augment:
ONE OF
- IMPULSE COIL
- RELAY LINK
- SHEAR CURRENT

Combat:
OPTIONAL / LIGHT

Damage Hazard:
1 Sentry Turret

Wind:
NONE

Moving Platform:
NONE

---

## 1. 한 줄 정의

1-4에서 첫 Rope Augment를 선택한 플레이어가
하나의 큰 Maintenance Test Bay를 통과하며,

같은 맵이더라도

IMPULSE
RELAY
SHEAR

중 무엇을 선택했느냐에 따라
가장 효율적인 이동 방법이 달라진다는 사실을 처음 체감하는 Stage.

핵심 질문:

"내가 고른 Augment 때문에
이 공간을 다른 방식으로 볼 수 있는가?"

---

## 2. 전체 게임에서의 역할

1-1:
기본 Rope

1-2:
Rope Chaining

1-3:
Enemy Pressure

1-4:
First Augment Selection

1-5:
FIRST BUILD EXPRESSION

1-6:
Wind Introduction

1-7:
Build + Enemy + Wind Combination

1-8:
Sector Finale

따라서 1-5에서는
절대 새로운 환경 기믹을 추가하지 않는다.

이 Stage의 새 경험은:

"새 시스템"

이 아니라

"이미 아는 공간을
내 Build 때문에 다르게 해결하는 것."

이다.

---

## 3. 가장 중요한 설계 원칙

1-5를 다음처럼 만들면 안 된다.

IMPULSE 전용 Room
→ RELAY 전용 Room
→ SHEAR 전용 Room

이렇게 만들면
Player는 자신이 고르지 않은 Augment의 Tutorial을
강제로 통과하는 느낌을 받는다.

대신:

하나의 Challenge
+
여러 해법

구조를 사용한다.

모든 Build가 동일한 START에서 출발하고
동일한 EXIT에 도착한다.

그러나 중간 경로의 최적해가 달라진다.

---

## 4. Build별 핵심 플레이 질문

### IMPULSE COIL

"이 큰 공간을
한 번의 강한 Swing으로 얼마나 건너뛸 수 있지?"

키워드:

- Long Arc
- Shortcut
- Speed
- Momentum
- Risk Compression

---

### RELAY LINK

"어디까지 착지하지 않고
Anchor를 계속 연결할 수 있지?"

키워드:

- Chain
- Rhythm
- Re-Attach
- Continuous Motion
- Flow

---

### SHEAR CURRENT

"어디에 Rope를 걸어야
Enemy를 Rope 선 사이에 넣을 수 있지?"

키워드:

- Geometry
- Rope Line
- Positioning
- Offensive Route
- Enemy Removal

---

## 5. 공정성 규칙

어느 Augment도 필수 Key가 아니다.

IMPULSE가 없어도 Long Gap 통과 가능.

RELAY가 없어도 Anchor Chain 통과 가능.

SHEAR가 없어도 Turret 통과 가능.

즉:

AUGMENT
=
BETTER SOLUTION

NOT

AUGMENT
=
REQUIRED KEY

---

## 6. 공간 콘셉트

공간:

VERTICAL GRAPPLE LOAD TEST BAY

원래 Maintenance Grapple의:

- Cable Load
- Swing Radius
- Emergency Movement
- Equipment Stress
- Security Response

를 시험하는 기업 정비 시설.

따라서 1-4 Calibration Room보다 훨씬 큰
실제 장비 Test Chamber.

대표 랜드마크:

CENTRAL LOAD TEST FRAME

샤프트 중앙을 관통하는
거대한 사각 철골 구조체.

구성:

- Crane Beam
- Load Weight
- Grapple Test Ring
- Maintenance Platforms
- Diagnostic Dummy
- Security Test Sentry
- Cable Reel
- Structural Frames

---

## 7. 픽셀 / Grid 기준

Base Grid:

32×32 px

Player Output:

48×48 px

Anchor:

24×24 px

Sentry:

32×32 px

Thin Platform:

32×16 px

Standard Platform:

32×32 px

Stage Width:

960 px
= 30 tiles

Stage Height:

1280 px
= 40 tiles

Coordinate:

X = -480 ~ +480
Y = 0 ~ -1280

---

## 8. 전체 맵 구조

SYMBOL

●     = Grapple Target
[T]   = Sentry Turret
██    = Solid Geometry
════  = Main Platform
----  = Recovery / Thin Platform
▒▒    = Background Load Test Frame


                         Y -1280

      ┌─────────────────────────────────────┐
      │                        GATE 06 →    │
      │                   ═══════════════   │
      │                        P6           │
      │                       ↑             │
      │                    ● H              │
      │                   ╱                 │
      │        ███████████                  │
      │        UPPER COVER                  │
      │                                     │
      │        ● G                          │
      │           ╲                         │
      │            ╲        [ T1 ]          │
      │             ╲        ╱              │
      │              ╲      ╱ LOS           │
      │          ● F   ╲    ╱               │
      │            ╲    ╲  ╱                │
      │             ╲    ╲╱                 │
      │              ▒▒▒▒▒▒                 │
      │              ▒ LOAD ▒               │
      │              ▒FRAME ▒               │
      │              ▒▒▒▒▒▒                 │
      │                                     │
      │         ---- R3 ----                │
      │                                     │
      │                   ● E               │
      │                  ╱                  │
      │             ● D                     │
      │            ╱                        │
      │       ● C                           │
      │      ╱                              │
      │     ╱                               │
      │  ---- R2 ----                       │
      │                                     │
      │                           ● B        │
      │                          ╱           │
      │                         ╱            │
      │      LARGE OPEN GAP                 │
      │                                     │
      │       ● A                           │
      │                                     │
      │  ---- R1 ----                       │
      │                                     │
      │ P0 START                            │
      │ ═════════════════                   │
      └─────────────────────────────────────┘

                         Y 0


전체 Stage는 세 Challenge Beat로 나뉜다.

BEAT 1
LONG ARC

BEAT 2
ANCHOR SPINE

BEAT 3
LIVE SENTRY GEOMETRY

하지만 세 Beat 모두
어느 Build든 통과 가능.

---

## 9. Stage Zone 구성

ZONE A
LOAD GAP

Y:
0 ~ -416

역할:

IMPULSE Opportunity
+
Base Grapple Route

---

ZONE B
RELAY SPINE

Y:
-416 ~ -832

역할:

RELAY Opportunity
+
Continuous Grapple Flow

---

ZONE C
LIVE SECURITY TEST

Y:
-832 ~ -1152

역할:

SHEAR Opportunity
+
Build별 다른 Turret 대응

---

ZONE D
RESULT / EXIT

Y:
-1152 ~ -1280

역할:

Build 체감 종료
+
1-6 연결

---

## 10. PLAYER SPAWN

position:

(-320, -32)

---

## 11. P0 — START PLATFORM

bounds:

x = -416 ~ -128
y = 0

size:

288×32 px

role:

- Stage Start
- 선택 Augment 상태 확인
- 첫 Challenge Preview

입구 작은 Display:

LIVE CALIBRATION

ACTIVE AUGMENT:

[AUGMENT NAME]

예:

ACTIVE AUGMENT:
RELAY LINK

플레이어가 자신의 선택을 다시 확인.

---

## 12. ZONE A — LOAD GAP

첫 공간은
넓은 빈 Shaft.

목표는 오른쪽 위 Platform으로 이동.

중앙에 큰 안전 Platform을 많이 놓지 않는다.

화면에서:

A
→ B

가 크게 떨어져 보이게 한다.

---

## 13. ANCHOR A

position:

(-160, -224)

visual:

24×24 px

role:

첫 Swing Start.

difficulty:

EASY

---

## 14. ANCHOR B

position:

(+224, -384)

visual:

24×24 px

role:

Base Route의 다음 Anchor.

A→B 연결:

NORMAL CHAIN ROUTE

---

## 15. IMPULSE SHORTCUT — ZONE A

IMPULSE Player는
A에서 충분한 Swing + Impulse를 사용하면

B를 사용하지 않고

ZONE B의 Anchor C 근처까지
직접 도달할 수 있는 Shortcut을 허용.

IMPORTANT:

Shortcut은:

가능

하지만

필수 아님.

권장 Blockout 목표:

BASE ROUTE:

A
→ B
→ C

IMPULSE ROUTE:

A
→ C

---

## 16. 왜 Impulse Shortcut을 숨기지 않는가

처음 얻은 Build의 재미를
플레이어가 우연히 발견해야만 하면 안 된다.

A에서 Swing 중 Camera가
멀리 있는 C를 살짝 보여준다.

Player가:

"저기까지 한 번에 갈 수 있나?"

라고 생각하도록 유도.

직접:

USE IMPULSE HERE

표시는 하지 않는다.

공간이 제안한다.

---

## 17. R1 — LOWER RECOVERY

bounds:

x = -96 ~ +128
y = -192

size:

224×16 px

role:

A 실패 Catch.

A 재시도 가능.

B로 직접 쉽게 점프할 수 있게 하지 않는다.

---

## 18. Zone A Safe Route

START

→ A

→ Landing / Recovery

→ B

→ Zone B

가장 느리지만 안정적.

---

## 19. Zone A Flow Route

START

→ A

→ B Airborne Attach

→ C

착지 최소화.

RELAY도 여기서 이미 유리함을 느낄 수 있다.

---

## 20. Zone A Impulse Route

START

→ A

→ Charged Impulse

→ Large Release Arc

→ C

가장 빠름.

첫 Build-specific Shortcut.

---

## 21. ZONE B — RELAY SPINE

중앙 Load Test Frame의 한쪽을 따라

C
D
E

세 Anchor가
지그재그로 빠르게 배치된다.

목적:

연속 Re-Attach Rhythm.

---

## 22. ANCHOR C

position:

(-160, -544)

visual:

24×24 px

role:

Relay Spine Entry.

---

## 23. ANCHOR D

position:

(+64, -640)

visual:

24×24 px

role:

Short Handoff.

C→D는
빠른 Re-Attach가 유리.

---

## 24. ANCHOR E

position:

(+224, -752)

visual:

24×24 px

role:

Relay Spine Exit.

D→E는
다시 오른쪽 위로 이동.

---

## 25. Relay Spine 공간 구조

권장 연결:

C → D:
약 240~280px

D → E:
약 240~300px

즉 Maximum Distance를 시험하는 곳이 아니다.

정확도보다:

RHYTHM

을 시험한다.

---

## 26. RELAY BUILD의 장점

RELAY 사용자는:

C

→ Release

→ Relay Window

→ D Attach

→ Release

→ Relay Window

→ E Attach

를 빠르게 연결.

Player가 생각해야 하는 것:

"다음 Anchor를 계속 이어 잡자."

---

## 27. 다른 Build의 Zone B

IMPULSE:

C에서 강한 Arc를 만들어
D 또는 일부 경로를 크게 넘길 수 있음.

단 모든 Spine을 통째로 Skip하지 않게 한다.

SHEAR:

특별한 전용 능력은 없지만
기본 Grapple Chain으로 정상 통과.

중요:

각 Build가 Stage의 모든 구간에서
항상 특별한 보너스를 가져야 하는 것은 아니다.

Build마다:

잘하는 상황

이 존재해야 한다.

---

## 28. R2 — RELAY RECOVERY

bounds:

x = -96 ~ +192
y = -608

size:

288×16 px

role:

C/D Miss Catch.

D 또는 C 재시도.

---

## 29. R3 — UPPER RELAY RECOVERY

bounds:

x = +32 ~ +256
y = -800

size:

224×16 px

role:

D/E Miss Catch.

Zone C 진입 가능.

---

## 30. Relay Spine의 핵심 성공 기준

숙련자가:

C
→ D
→ E

를

Camera stop 없이

Landing 없이

약 한 호흡에 연결할 수 있어야 함.

실패해도:

3~5초 내 재시도.

---

## 31. ZONE C — LIVE SECURITY TEST

1-5의 핵심 종합 구간.

여기서 1-3의 Turret 한 기가 다시 등장.

새 Enemy가 아니다.

플레이어는 이미 공격 규칙을 안다.

따라서 Tutorial Text 없음.

---

## 32. Turret T1

position:

(+384, -960)

mount:

RIGHT WALL

visual:

32×32 px

behavior:

1-3 Sentry FSM 재사용.

IDLE
→ ACQUIRE
→ TRACK
→ LOCK
→ FIRE
→ COOLDOWN

No new attack.

---

## 33. 왜 Turret을 다시 쓰는가

1-3에서는 질문이:

"이 공격을 피할 수 있는가?"

였다.

1-5에서는 질문이:

"내 Augment를 사용하면
이 위협을 어떻게 다르게 처리할 수 있는가?"

로 발전.

같은 적의 의미가 바뀐다.

---

## 34. ANCHOR F

position:

(-128, -896)

visual:

24×24 px

role:

Turret Encounter Entry.

---

## 35. ANCHOR G

position:

(+32, -1040)

visual:

24×24 px

role:

Turret 상부 이동
+
Shear Geometry Target.

---

## 36. ANCHOR H

position:

(-128, -1168)

visual:

24×24 px

role:

Turret LOS 탈출
+
Exit 연결.

---

## 37. Turret와 Rope Geometry

핵심 배치:

Player가 F에 붙어
G 방향으로 Swing할 때

Rope Segment가
Turret 근처를 가로지를 수 있게 한다.

즉:

Anchor 위치
Player 위치
Turret 위치

세 점의 관계가 중요.

Shear Player는:

F Attach

↓

Swing

↓

Rope line crosses T1

↓

Release

↓

SHEAR HIT

가능.

---

## 38. SHEAR Route

권장:

F

→ Turret을 Rope 선 안에 배치

→ Release

→ Shear Trigger

→ G

→ H

→ Exit

SHEAR의 보상:

Enemy를 보기 전에 총을 쏘는 게 아니라

Anchor Geometry를 먼저 생각하게 됨.

---

## 39. IMPULSE Route — Turret

Impulse Player의 최적해는
Turret과 싸우는 것이 아닐 수 있다.

F에서:

큰 Swing

→ Impulse

→ 위험 LOS를 빠르게 관통

→ H 근처까지 이동

목표:

"강한 Mobility가 방어가 된다."

---

## 40. RELAY Route — Turret

Relay Player:

F

→ G

→ H

를 빠르게 연결.

Turret가 두 번째 사격 Cycle에 들어가기 전에
LOS 탈출 가능.

목표:

"Chain Speed가 방어가 된다."

---

## 41. BASE Route — Turret

어느 Augment든 통과 가능.

F

→ Safe Ledge

→ Turret Shot 확인

→ G

→ Upper Cover

→ H

→ Exit

느리지만 안정적.

---

## 42. SAFE LEDGE S1

bounds:

x = -288 ~ -96
y = -960

size:

192×16 px

Cover:

32×96 px

role:

- Turret Cycle 확인
- 모든 Build용 안전 루트

---

## 43. UPPER COVER

bounds:

x = -64 ~ +64
y ≈ -1088 ~ -1184

role:

Turret LOS 종료.

H 접근 전
Encounter 종료 신호.

---

## 44. Turret Clear Condition

Turret Destroy:

OPTIONAL

Turret Survive:

ALLOWED

Exit Condition:

REACH H
→ Final Deck

즉 SHEAR를 선택하지 않았다고
Turret을 죽여야 할 필요 없음.

---

## 45. Auto-Fire 관련 중요한 테스트

현재 자동공격이 존재하므로
실제 Blockout에서 반드시 확인:

Player가 Safe Ledge에 서 있기만 해도
Turret가 자동으로 죽는가?

YES라면
Augment Choice가 의미 없어질 수 있음.

우선 조정 순서:

1.
Turret placement

2.
LOS / distance

3.
Encounter duration

4.
그 이후에만 HP 검토

처음부터 HP를 크게 올리는 방식은 피한다.

---

## 46. Shear Feedback

Shear가 Turret에 적중:

- 짧은 bright slice
- small spark
- distinct audio
- hit-stop 아주 짧게 가능

그러나 화면 전체 Flash 금지.

Pixel effect target:

32×32 ~ 64×64.

---

## 47. Augment 간 우열 방지

이 Stage에서:

IMPULSE가 항상 최단시간

RELAY가 항상 두 번째

SHEAR가 항상 느림

같은 구조가 되면 안 된다.

각 Build가 잘하는 영역이 다르다.

예상:

ZONE A
IMPULSE strongest

ZONE B
RELAY strongest

ZONE C
SHEAR strongest

그러나 전체 Stage에서는
숙련도에 따라 기록이 겹칠 수 있어야 한다.

---

## 48. 중요한 원칙 — Build Showcase와 Build Exam의 차이

1-5는:

EXAM

이 아니다.

SHOWCASE

다.

즉 Player에게:

"이걸 제대로 못 쓰면 못 지나가."

라고 말하지 않는다.

대신:

"이렇게 쓰면 굉장히 편하거나 멋있네."

라고 느끼게 한다.

본격적인 Build 숙련 요구는
1-7 이후.

---

## 49. 전체 추천 ROUTE

### BASE SAFE ROUTE

START

→ A

→ B

→ C

→ Recovery

→ D

→ Recovery

→ E

→ F

→ Safe Ledge

→ G

→ Cover

→ H

→ EXIT

---

## 50. IMPULSE EXPRESS ROUTE

START

→ A

→ IMPULSE LONG ARC

→ C

→ D or E

→ F

→ IMPULSE THROUGH LOS

→ H

→ EXIT

특징:

Few Attachments
Large Arcs
High Speed

---

## 51. RELAY EXPRESS ROUTE

START

→ A

→ B

→ C

→ D

→ E

→ F

→ G

→ H

→ EXIT

특징:

Many Attachments
No Landing
Continuous Rhythm

---

## 52. SHEAR CONTROL ROUTE

START

→ A

→ B

→ C

→ D

→ E

→ F

→ Rope crosses Turret

→ Release / SHEAR

→ G

→ H

→ EXIT

특징:

Movement + Combat Geometry
Enemy Removal

---

## 53. Recovery Philosophy

1-5에서도:

FAIL
≠
RESET

Lower Recovery:
R1

Middle:
R2/R3

Upper:
Safe Ledge

Stage 아래까지 다시 떨어지는 상황을 최소화.

다만 1-4보다
Recovery 위치를 조금 불리하게 만들어

Build 활용이
편하고 빠르다는 차이를 만든다.

---

## 54. Camera — Zone A

A Attach 시:

show:

- Player
- B
- 멀리 C의 일부
- Large Gap

IMPULSE Player가:

"혹시 C까지?"

라는 생각을 할 수 있어야 한다.

---

## 55. Camera — Zone B

C Attach:

show:

- D
- E 일부

D Attach:

show:

- E
- R3

다음 Anchor가 계속 위쪽으로 이어지는
Rhythm을 보여준다.

---

## 56. Camera — Zone C

F 접근:

반드시 같은 화면에:

- Player
- F
- G
- Turret
- Safe Ledge

를 가능한 한 보여준다.

Shear Player는:

Rope
+
Turret
+
Anchor

세 위치 관계를 판단해야 함.

---

## 57. Camera 금지사항

DO NOT:

- Impulse Shortcut C를 화면 밖에 완전히 숨김
- Relay 다음 Anchor를 뒤늦게 보여줌
- Shear Turret와 Anchor를 동시에 볼 수 없게 함
- Turret가 화면 밖에서 Fire
- Recovery 위치 숨김

---

## 58. Stage Story

1-5에서는 새로운 큰 Story Reveal 없음.

입구 Display:

LIVE CALIBRATION

GRAPPLE CONFIGURATION:
MODIFIED

또는

UNAUTHORIZED FIRMWARE:
ACTIVE

정도.

---

## 59. 중간 Story Detail

Background Monitor에:

VERTICAL LOAD TEST

SECURITY RESPONSE TEST

EMERGENCY TRANSIT TEST

등을 표시.

이 공간이 원래
기업 유지보수 장비 시험시설이었다는 맥락 제공.

---

## 60. Exit Story

Exit Gate 근처:

COOLING DISTRIBUTION

SERVICE ACCESS

다음 1-6을 예고.

아주 멀리:

Fan silhouette

또는

Ventilation symbol

을 처음 볼 수 있음.

Fan은 아직 Gameplay에 영향 없음.

---

## 61. Pixel Art — Gameplay Assets

Player:

48×48 output

Anchor:

24×24

Sentry:

32×32

Projectile:

16×8 ~ 16×16

Platform:

32×16 / 32×32 Tile

Recovery:

32×16 modules

Cover:

32×96 / 32×128

Gate:

64×96 ~ 96×128

---

## 62. Load Test Frame — Mid Background

대표 랜드마크.

Recommended component:

256×256 px

여러 모듈 세로 조합.

전체 화면에서:

약 500~800px 규모로 읽히게 구성.

내용:

- Steel Frame
- Cable Drum
- Hanging Weights
- Load Gauge
- Crane Arm
- Test Target Rails

Background / mostly non-collision.

---

## 63. FAR Background

512×288
또는
960×540

내용:

- deeper industrial shaft
- massive corporate structure
- distant bridge
- cable network
- low-density light
- large negative space

Contrast:
LOW

Saturation:
LOW

---

## 64. NEAR Background

32×32 ~ 64×64.

- load gauge
- diagnostic panel
- cable socket
- service marking
- test number
- small warning lamp
- maintenance cabinet

Collision Terrain과 혼동 금지.

---

## 65. 색 정보

PLAYER:
Dark silhouette + Red Scarf

ROPE:
Cyan

ANCHOR:
Cyan

SENTRY:
Dark body + Red sensor

PROJECTILE:
Red / Orange

COLLISION:
Dark Gray / Navy

BACKGROUND:
Dark Navy / Steel / Charcoal

DIAGNOSTIC:
Desaturated White / Cyan

Background Cyan Neon 남발 금지.

---

## 66. Stage 시각 밀도

1-4보다 다시
High-bit Background Density를 높인다.

하지만 Anchor Network가 많기 때문에

Anchor 주변은
Background Detail Clean Zone 유지.

특히:

C
D
E

Relay Spine 주변에는
Cyan 장식 금지.

---

## 67. Sound Design

IMPULSE:

low mechanical burst
+
wind snap

RELAY:

release
→ click
→ attach
→ click

리듬 강조.

SHEAR:

thin metallic/electrical slice

Turret:

1-3와 동일한 Telegraph Audio.

새 적처럼 들리면 안 됨.

---

## 68. VFX 원칙

IMPULSE:

32~64px directional burst
짧게.

RELAY:

16~32px device pulse.

SHEAR:

rope line flash
+
32~64px target slice.

모든 효과는
Player / Anchor 판독성을 가리지 않는다.

---

## 69. Build Telemetry

1-5는 반드시
Augment별 데이터를 따로 기록하는 것을 권장.

공통:

- selected augment
- first clear time
- total clear time
- number of landings
- number of falls
- turret hits
- turret destroyed
- deaths

---

## 70. IMPULSE Metrics

- Impulse activations
- successful long skips
- A→C shortcut usage
- LOS skip usage
- missed impulse arcs
- average attach count

---

## 71. RELAY Metrics

- Relay windows generated
- Relay-assisted attaches
- longest grapple chain
- C→D→E no-land success
- F→G→H no-land success

---

## 72. SHEAR Metrics

- Shear attempts
- valid shear hits
- Turret shear hit
- Shear kills
- rope-target intersection failures

---

## 73. Playtest Questions

1.
선택한 Augment를 이 Stage에서
실제로 많이 사용했는가?

2.
그 Augment 때문에
원래와 다른 경로를 선택했는가?

3.
다른 Augment를 골랐으면
이 맵을 다르게 플레이했을 것 같은가?

4.
Augment를 사용하지 않아도
맵을 통과할 수 있었는가?

5.
특정 Augment가
명백하게 정답처럼 느껴졌는가?

6.
Shortcut을 발견했을 때
"게임을 깨뜨렸다"가 아니라
"잘 이용했다"고 느꼈는가?

7.
다른 Build로 다시 플레이해보고 싶은가?

---

## 74. Build별 성공 질문

### IMPULSE

"큰 빈 공간이 보일 때
멀리 날아갈 방법을 먼저 생각했는가?"

YES 목표.

---

### RELAY

"Anchor가 여러 개 보일 때
착지 없이 전부 이어보고 싶었는가?"

YES 목표.

---

### SHEAR

"Enemy가 보일 때
총보다 Rope의 위치를 먼저 생각한 순간이 있었는가?"

YES 목표.

---

## 75. PASS Criteria

PASS 01

모든 Build로 Base Route 클리어 가능.

PASS 02

IMPULSE 사용자는 Zone A에서
명확한 Shortcut 기회를 발견.

PASS 03

RELAY 사용자는 C→D→E를
부드럽게 연속 연결 가능.

PASS 04

SHEAR 사용자는 Turret에
Rope Geometry를 활용할 수 있음.

PASS 05

Augment 전용 문/필수 조건 없음.

PASS 06

각 Build의 최적 Route가 서로 다름.

PASS 07

Safe Route 존재.

PASS 08

실패 후 3~6초 내 재시도.

PASS 09

새 Gameplay Mechanic 없이도
1-4보다 재미와 선택이 증가.

PASS 10

Turret가 Auto Weapon으로
Encounter 시작 전에 사라지지 않음.

PASS 11

Player가 Build를 사용하지 않고
그냥 지나가는 것이 항상 최적해가 아님.

PASS 12

숙련자는 약 45~75초 내
Flow Clear 가능.

PASS 13

첫 플레이 약 120~180초.

PASS 14

플레이어가 다른 Augment로
다시 시험해보고 싶어 함.

---

## 76. FAIL Conditions

FAIL IF:

- 특정 Augment 없이는 통과 불가
- 세 Augment용 코스가 완전히 따로 분리됨
- Impulse가 Stage 절반 이상 완전히 Skip
- Relay가 Auto Grapple처럼 느껴짐
- Shear 없이 Turret Encounter가 지나치게 어려움
- Auto Weapon이 Turret을 너무 빨리 제거
- Safe Route가 가장 빠름
- Recovery가 Shortcut으로 사용됨
- Build를 거의 사용하지 않아도 최적 플레이 가능
- Anchor가 너무 많아 화면이 Cyan 점으로 가득 참
- Background가 Anchor Network를 가림
- 새로운 Tutorial Text가 계속 등장

---

## 77. 제외 요소

DO NOT ADD:

- Wind
- Moving Platform
- New Enemy Type
- Second Turret
- Laser
- Rope Cutter
- Grapple Jammer
- New Augment
- Second Augment Choice
- Boss
- Timed Challenge
- Locked Build Route
- Puzzle Switch
- Instant Death Pit
- Combo Score
- Currency
- Shop

---

## 78. 개발 구현 우선순위

PRIORITY 1

Greybox entire Stage with Base Rope.

확인:

모든 Build 없이도
기본 Route가 물리적으로 통과 가능.

---

PRIORITY 2

Impulse Route Test.

A→C Shortcut.

---

PRIORITY 3

Relay Spine.

C→D→E.

---

PRIORITY 4

Turret Geometry.

F→G→H.

---

PRIORITY 5

Shear Interaction.

Rope intersection
+
Release trigger.

---

PRIORITY 6

Safe / Recovery Route.

---

PRIORITY 7

Camera Zones.

---

PRIORITY 8

Telemetry.

---

PRIORITY 9

Art / VFX / Audio.

---

## 79. 개발용 Stage Data Concept

stageId:
sector-01-05

name:
AUGMENT TEST BAY

subtitle:
LIVE CALIBRATION

bounds:
960×1280

spawn:
(-320,-32)

grappleTargets:
- A
- B
- C
- D
- E
- F
- G
- H

platforms:
- P0 start
- R1 lower-recovery
- R2 relay-recovery
- R3 upper-recovery
- safe-ledge
- final-deck

collisionObjects:
- safe-cover
- upper-cover

enemies:
- sentry-turret-01

environmentHazards:
NONE

routes:
- base-safe
- impulse-express
- relay-express
- shear-control
- recovery

storyTriggers:
- active-augment-display
- live-calibration
- cooling-access-preview

cameraZones:
- load-gap
- relay-spine
- live-security
- exit

---

## 80. 아트 담당자 전달문

32px Grid 기반의
거대한 Vertical Grapple Load Test Bay.

Player:
48×48 dark silhouette + long Red Scarf.

Anchor:
24×24 Cyan.

Stage의 대표 배경은
256×256 단위의 Load Test Frame을 조합한
수백 px 규모의 거대한 철골 시험장치.

Gameplay Layer에는
A~H Anchor와 적은 수의 Platform만 두고,

Background에는:

- Crane
- Cable Drum
- Load Weight
- Diagnostic Frame
- Structural Beam
- Maintenance Screen

등을 풍부하게 배치해
SANABI-inspired High-bit Pixel Art 밀도를 만든다.

그러나 Relay Spine C/D/E와
Turret Geometry F/G 주변은
배경 Detail과 Cyan Light를 줄여
Gameplay 판독성을 확보한다.

Rope / Anchor:
Cyan.

Danger:
Red / Orange.

Player:
Red Scarf.

Background:
Dark Navy / Steel / Charcoal.

---

## 81. 개발자 최종 전달 요약

SECTOR 01-5 `AUGMENT TEST BAY`는
1-4에서 선택한 첫 Foundation Augment가
실제 Level Solution을 바꾸는 경험을 제공하는
첫 Build Expression Stage다.

새 Gameplay Mechanic은 추가하지 않는다.

Stage는 하나의 연속된 수직 Test Bay이며
모든 Build가 동일한 START와 EXIT를 사용한다.

하지만 최적 공략은 달라진다.

ZONE A `LOAD GAP`에서는
IMPULSE COIL이 A→C Long Arc Shortcut을 만들 수 있다.

ZONE B `RELAY SPINE`에서는
RELAY LINK가 C→D→E를 착지 없이 빠르게 연결한다.

ZONE C `LIVE SECURITY TEST`에서는
SHEAR CURRENT가 F/G Anchor와 Turret의 위치 관계를 이용해
Rope 선으로 Sentry를 공격할 수 있다.

동시에:

IMPULSE는 Turret LOS를 빠르게 관통할 수 있고,

RELAY는 F→G→H Chain으로
사격 Cycle 전에 빠져나갈 수 있으며,

SHEAR가 없는 Player도
Safe Ledge와 Cover를 사용해 정상 통과 가능하다.

즉 이 Stage의 핵심은:

"세 개의 Augment용 코스"

가 아니라

"하나의 공간에 세 개 이상의 좋은 해법"

이다.

1-5 성공 기준은:

"플레이어가 Augment 설명을 기억해서 쓰는 것이 아니라,
공간을 보자마자 자신의 Build가 할 수 있는 행동을
스스로 떠올리기 시작하는가?"

이다.

1-5가 성공했다면
이후부터 Augment 시스템은 단순 Reward가 아니라
Level을 읽는 방식 자체를 변화시키는 시스템이 된다.

---

SECTOR 01-5 / AUGMENT TEST BAY — BLOCKOUT CANDIDATE · REV 3.0
