# SECTOR 01-7 — PRESSURE BYPASS

*BLOCKOUT CANDIDATE · REV 3.0*

◀ PREV — [SECTOR 01-6 / COOLING SHAFT](../1-6/README.md) · NEXT — [SECTOR 01-8 / CONTAINMENT GATE](../1-8/README.md) ▶

Sector: 01 MAINTENANCE
Stage: 07
Theme: Cooling Pressure Bypass / Emergency Service Shaft
Difficulty: ★★★
Expected First Playtime: 150~220 sec
Expected Skilled Clear: 60~100 sec

Primary Goal:
FIRST SYSTEM COMBINATION

Combined Mechanics:
- Rope Chaining
- Selected Foundation Augment
- Sentry Turret
- Wind
- Cover / Wind Shadow
- Recovery Route

New Gameplay Mechanic:
NONE

Enemy:
1 Sentry Turret

Wind:
1 Main Pulsed Pressure Vent
+ Weak Residual Airflow

Instant Kill:
NONE

New Augment:
NONE

---

## 1. 한 줄 정의

Cooling System의 Automatic Pressure Bypass가 실패하면서
정비기사가 수동 Bypass Control까지 직접 올라가야 하는 Stage.

플레이어는 처음으로:

ROPE
+
AUGMENT
+
WIND
+
SENTRY

를 하나의 연속된 공간에서 동시에 사용한다.

새로운 규칙을 배우는 방이 아니라,

"지금까지 배운 것을 상황에 맞게 조합할 수 있는가?"

를 확인하는 첫 실전 Stage다.

---

## 2. 전체 게임에서의 역할

1-1
Basic Rope

1-2
Rope Chaining

1-3
Sentry / Movement Under Threat

1-4
First Augment

1-5
Build Expression

1-6
Wind

1-7
SYSTEM COMBINATION

1-8
SECTOR FINALE

따라서 1-7에는
새 기믹을 절대 추가하지 않는다.

플레이어가 이미 아는 시스템들이
처음으로 서로 영향을 주게 만든다.

---

## 3. 핵심 설계 질문

1-7의 성공 여부는 다음 질문으로 판단한다.

"위험 요소가 많아졌는데도
플레이어가 무엇을 해야 하는지 읽을 수 있는가?"

좋은 복합 난이도:

Wind가 나를 밀고 있다.
Turret이 조준 중이다.
다음 Anchor가 저기 있다.
내 Augment를 이렇게 쓰면 된다.

나쁜 복합 난이도:

뭔가 여러 개가 동시에 일어나고
왜 실패했는지 모르겠다.

따라서 한 번에 모든 요소를 투입하지 않는다.

---

## 4. Stage 구조 원칙

전체 Stage는 4개의 Beat로 나눈다.

BEAT A
PRESSURE APPROACH

Rope + 약한 Wind

↓

BEAT B
SECURITY OVERLAP

Rope + Turret

↓

BEAT C
PRESSURE CROSSING

Rope + Wind + Turret + Augment

↓

BEAT D
MANUAL BYPASS

완전 안전 + Story Interaction

즉 복잡도를 단계적으로 겹친다.

---

## 5. Story 역할

1-6 마지막:

COOLING PRESSURE:
CRITICAL

AUTOMATIC BYPASS:
FAILED

MANUAL PRESSURE BYPASS
REQUIRED

1-7은 여기서 바로 이어진다.

주인공이 도시를 구하기 위해
Cooling System을 수리하는 것이 핵심은 아니다.

현재 탈출 경로의 Pressure Gate가
압력 때문에 잠겨 있기 때문에

수동 Bypass를 열어야
위쪽 Service Route가 열린다.

주인공의 목적은 계속:

ESCAPE UPWARD

이다.

---

## 6. Story Sequence

ENTRY:

PRESSURE NETWORK
UNSTABLE

↓

BYPASS CONTROL
MANUAL ACCESS REQUIRED

↓

상승 중:

PRESSURE LIMIT
EXCEEDED

↓

Security가 Player 감지:

CONTAINMENT VIOLATION
ACTIVE

↓

최상단 Control:

MANUAL BYPASS
READY

↓

Player Interaction:

OPEN BYPASS

↓

큰 Vent / Valve 작동

↓

PRESSURE:
STABILIZING

↓

SERVICE ROUTE:
AVAILABLE

↓

Exit Open.

---

## 7. 대표 환경 랜드마크

CENTRAL PRESSURE VALVE CORE

Stage 중앙에
거대한 원형 / 수직 Valve Assembly가 존재.

권장 화면 규모:

256×384 ~ 320×448 px equivalent

여러 Pixel Module 조합.

구성:

- Main Valve Wheel
- Pressure Chamber
- Thick Cooling Pipe
- Safety Shutter
- Gauge Array
- Emergency Vent
- Service Walkway

1-7 전체의 시각 중심.

---

## 8. Pixel / Grid 기준

Base Grid:
32×32 px

Player:
48×48 px output

Anchor:
24×24 px

Sentry:
32×32 px

Thin Platform:
32×16 px

Standard Platform:
32×32 px

Pressure Valve Core:
256×384 px 이상

Vent Housing:
192×192 ~ 256×256 px

Service Panel:
32×64 px

Pressure Lever / Control:
32×64 ~ 64×64 px

Stage Width:
960 px
= 30 tiles

Stage Height:
1536 px
= 48 tiles

Coordinate:

X = -480 ~ +480
Y = 0 ~ -1536

---

## 9. 전체 맵 구조

SYMBOL

●      = Grapple Anchor
[T]    = Sentry
>>>    = Strong Wind
~>     = Weak Wind
████   = Solid / Cover
════   = Main Platform
----   = Recovery Platform
[V]    = Pressure Valve Core
CTRL   = Bypass Control


                         Y -1536

      ┌─────────────────────────────────────┐
      │                         GATE 08 →  │
      │                   ═══════════════  │
      │                        P7          │
      │                                    │
      │                   [ CTRL ]         │
      │                MANUAL BYPASS       │
      │                                    │
      │                     ● G            │
      │                    ╱               │
      │          ███████████               │
      │          UPPER WIND SHADOW         │
      │                                    │
      │               ● F                  │
      │                ╲                   │
      │                 ╲                  │
      │       >>>>>>>>>>>>>>>>>>>>>        │
      │       MAIN PRESSURE VENT           │
      │                                    │
      │            ● E                     │
      │           ╱                        │
      │          ╱       [ T1 ]            │
      │         ╱         ╱ LOS            │
      │        ╱         ╱                 │
      │      ● D        [V]                │
      │                  [V]               │
      │       ---- R3 ----[V]              │
      │                  [V]               │
      │         ███████████                │
      │         SAFE SHADOW                │
      │                                    │
      │                   ● C              │
      │                  ╱                 │
      │       ~> ~> ~> ~>                  │
      │       RESIDUAL WIND                │
      │                                    │
      │         ● B                        │
      │        ╱                           │
      │       ╱                            │
      │    ---- R2 ----                    │
      │                                    │
      │      ● A                           │
      │                                    │
      │   ---- R1 ----                     │
      │                                    │
      │ P0 START                           │
      │ ═════════════════                  │
      └─────────────────────────────────────┘

                         Y 0

주 이동 Spine:

START
→ A
→ B
→ C
→ D
→ E
→ F
→ G
→ BYPASS CONTROL
→ EXIT

---

## 10. Zone 구성

ZONE A — PRESSURE APPROACH

Y:
0 ~ -480

사용 요소:

Rope
+
Weak Wind

목적:

1-6 복습.

---

ZONE B — SECURITY OVERLAP

Y:
-480 ~ -832

사용 요소:

Rope
+
Turret
+
Cover

목적:

1-3 복습.

아직 Main Wind 없음.

---

ZONE C — PRESSURE CROSSING

Y:
-832 ~ -1248

사용 요소:

Rope
+
Turret
+
Pulsed Wind
+
Augment

목적:

Stage Main Challenge.

---

ZONE D — MANUAL BYPASS

Y:
-1248 ~ -1536

사용 요소:

Rope
+
Interaction

위협 종료.

Story / Relief.

---

## 11. PLAYER SPAWN

position:

(-320, -32)

---

## 12. P0 — START PLATFORM

bounds:

x = -416 ~ -96
y = 0

size:
320×32 px

role:

Stage Start.

화면 위쪽에
Pressure Valve Core 일부가 보임.

Display:

PRESSURE BYPASS
MANUAL ACCESS

---

## 13. ANCHOR A — REVIEW

position:

(-128, -224)

visual:
24×24 px

role:

1-6 Wind 이후
쉬운 첫 Rope.

difficulty:
EASY

---

## 14. ANCHOR B — WEAK WIND CHAIN

position:

(+160, -416)

visual:
24×24 px

role:

약한 Residual Wind 속
A→B Re-Attach.

Residual Wind:

LEFT → RIGHT

strength:
LOW

새로운 학습 없음.

---

## 15. R1 / R2

R1:

224×16 px

A 실패 Catch.

R2:

224×16 px

A→B 실패 Catch.

Wind:
LOW 또는 SHADOW.

Recovery에서
Player가 계속 밀려나지 않게 한다.

---

## 16. ANCHOR C — SECURITY ENTRY

position:

(+224, -608)

visual:
24×24 px

role:

Wind Lesson 종료.

Turret Encounter 시작점.

C 주변은
Wind Shadow.

여기서 잠깐 안전하게
다음 공간을 읽을 수 있다.

---

## 17. SENTRY T1

recommended position:

(+64, -864)

mount:

CENTRAL PRESSURE CORE

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

New Attack:
NONE

Projectile:
Standard Sentry Projectile

---

## 18. Turret 배치 이유

Turret을 오른쪽 외벽이 아니라
Pressure Core 측면에 배치.

이유:

1.
Safe / Flow Route 양쪽을 압박 가능.

2.
Cover / Valve Housing으로 LOS 차단 가능.

3.
SHEAR CURRENT 사용자가
Rope Geometry로 Turret을 가로지를 수 있음.

4.
Level의 대표 랜드마크와 Enemy가
공간적으로 연결됨.

---

## 19. Turret Activation

Player가 C를 지나
Y 약 -640 이상 올라가면 활성.

큰 Tutorial Text 없음.

Player는 이미 1-3과 1-5에서
Turret 규칙을 안다.

짧은 System Message만:

CONTAINMENT VIOLATION
ACTIVE

---

## 20. ZONE B — Turret 복습

C→D 구간에서는
Main Pressure Vent가 아직 직접 영향을 주지 않는다.

즉 Player가 먼저:

Turret
+
Rope

관계를 다시 익힘.

목적:

복합구간 전에
Enemy State를 다시 기억시킨다.

---

## 21. ANCHOR D — COMBINATION ENTRY

position:

(-192, -832)

visual:
24×24 px

role:

Main Pressure Crossing 진입.

D 근처에는
작은 Wind Shadow 존재.

Player가 잠시:

- Turret State
- Fan Cycle
- Anchor E

를 동시에 볼 수 있음.

---

## 22. SAFE SHADOW

bounds:

x = -352 ~ -160
y ≈ -864

platform:

192×16 px

cover:

64~96 px high Valve Housing

role:

- Turret LOS 차단
- Main Vent Force 차단
- Safe Route 준비
- 복잡한 상황을 읽는 공간

중요:

이곳이 완전한 장기 Camp Zone이 되어도
Stage가 깨지지는 않는다.

단 Safe Route는 느리게 만든다.

---

## 23. MAIN PRESSURE VENT

position:

LEFT SIDE
approximately (-416, -992)

direction:

LEFT → RIGHT

→→→→→→→

mode:

PULSED

State:

LULL
→ WARNING
→ ACTIVE
→ DECAY

1-6 Fan B와
같은 시각 / 사운드 언어 사용.

새 규칙 없음.

---

## 24. Vent Timing

1-6에서 튜닝된 값을 우선 재사용.

1-7에서
더 빠른 별도 Cycle을 만들지 않는다.

Player가:

"아, 저 Fan이랑 같은 규칙이다."

라고 알아볼 수 있어야 한다.

난이도는 Timing 변경이 아니라:

Turret와의 공간 중첩

으로 올린다.

---

## 25. Main Challenge 구조

Player가 D에 있음.

동시에 확인 가능한 정보:

Anchor E

Turret T1

Pressure Vent

Safe Shadow

Recovery R3

이 순간이 1-7의
Main Decision Frame.

---

## 26. ANCHOR E — PRESSURE CROSSING

position:

(+224, -1056)

visual:
24×24 px

role:

Main Combination Target.

D→E가
Main Pressure Vent 방향과 일치.

Vent ACTIVE 시
빠르게 오른쪽으로 밀어줌.

Turret는 이 Corridor를 조준 가능.

---

## 27. 왜 Wind가 Turret 쪽으로 미는가

처음에는 위험처럼 느껴진다.

Vent ACTIVE:

Player를 오른쪽으로 빠르게 이동.

오른쪽/중앙에는 Turret.

하지만 제대로 이용하면:

Player가 Turret LOS를
아주 짧은 시간에 관통.

즉 같은 Wind가:

잘못 사용하면
위험 증가.

잘 사용하면
위험구간 체류시간 감소.

이 Stage의 핵심이다.

---

## 28. SAFE ROUTE

D Wind Shadow에서 대기.

↓

Turret FIRE 확인.

↓

Vent LULL 확인.

↓

D → E.

↓

중간 Landing.

↓

다음 Turret Cycle 기다림.

↓

F.

특징:

- 가장 쉬움
- 가장 느림
- Augment 숙련 거의 불필요

---

## 29. FLOW ROUTE

D에서:

Turret TRACK 확인.

↓

Vent WARNING 시작.

↓

Swing.

↓

Turret LOCK 직전 Release.

↓

Vent ACTIVE.

↓

강한 오른쪽 이동.

↓

E Airborne Attach.

↓

Turret Shot은 이전 위치 통과.

↓

F.

특징:

Movement timing으로
두 위협을 동시에 해결.

---

## 30. RECOVERY ROUTE

D→E 실패.

↓

R3.

↓

Valve Housing 뒤 Wind Shadow.

↓

D 또는 E 재시도.

Recovery에서도
Turret LOS가 일부만 들어오게 한다.

실패:

punishment

은 있지만

reset

은 아니다.

---

## 31. R3 — CENTRAL RECOVERY

bounds:

x = -64 ~ +192
y = -944

size:
256×16 px

role:

D/E 실패 Catch.

Valve Housing이
일부 Turret LOS를 막음.

Wind:
30~50% 이하.

Goal:

약 4~7초 내 재시도.

1-7이므로
이전 Stage보다 Recovery가 조금 더 긴 것은 허용.

---

## 32. SHEAR CURRENT — 핵심 Geometry

1-7에서 SHEAR가
다시 명확한 강점을 가져야 한다.

추천 구조:

Player가 D에서 Release해
E를 Attach하면,

Player는 E의 왼쪽 / 아래쪽에서 Swing을 시작.

이때:

PLAYER
──── ROPE ────
TURRET
──────── E

관계가 만들어지도록 배치.

즉 Rope Segment가
T1의 위치를 가로지를 수 있다.

---

## 33. SHEAR Route

D

↓

Release

↓

E Attach

↓

Wind가 Player를 오른쪽으로 밀면서
Rope line이 Turret를 Sweep

↓

Rope crosses T1

↓

Release

↓

SHEAR HIT

↓

F

↓

Exit.

목표:

Wind 때문에 Rope Line이 움직이는 것 자체가
공격 Geometry를 만들어냄.

즉 1-7에서 처음:

ENVIRONMENT
+
AUGMENT
+
COMBAT

가 하나의 행동 안에서 연결.

---

## 34. IMPULSE COIL Route

D에서:

Vent WARNING 확인

↓

Swing / Charge

↓

ACTIVE 시작

↓

Wind Direction
+
Impulse Direction

합산

↓

E 또는 F 방향
큰 Release Arc.

장점:

Turret LOS 체류시간 최소화.

위험:

Overshoot.

따라서 F 아래쪽에는
Recovery Route 유지.

Impulse가 Stage를 완전히 Skip해서
바로 Exit까지 가면 안 됨.

---

## 35. RELAY LINK Route

D

↓

E

↓

F

를 빠르게 Re-Attach.

Wind 때문에 평소보다
Trajectory가 변하지만

Relay Window를 이용해
Chain 유지.

장점:

Turret가 두 번째 Cycle에 들어가기 전에
LOS 탈출.

---

## 36. Build별 핵심 차이

IMPULSE:

위험구간을
"크게 날아서" 압축.

RELAY:

위험구간을
"계속 연결해서" 압축.

SHEAR:

위험 자체를
"Rope Geometry로 제거".

세 Build가
같은 문제에 다른 답을 갖는다.

---

## 37. ANCHOR F — LOS EXIT

position:

(-32, -1216)

visual:
24×24 px

role:

Turret + Main Wind Corridor 탈출.

F에 도달하면
Pressure Core의 상단 Housing이
Turret LOS를 완전히 차단.

여기서 전투 긴장 종료.

---

## 38. UPPER WIND SHADOW

F 위쪽:

Wind Strength:
0 또는 VERY LOW.

Turret LOS:
NONE.

Purpose:

Stage Main Challenge 종료를
물리적으로 명확히 전달.

Audio:

Fan 소리가 muffled.

Visual:

Steam movement 감소.

Scarf 안정화.

---

## 39. ANCHOR G — RELIEF ANCHOR

position:

(+128, -1376)

visual:
24×24 px

difficulty:
EASY

role:

위협이 끝난 뒤
Bypass Control까지 마지막 상승.

D/E보다 쉽게 만든다.

난이도를 끝까지 올리지 않는다.

---

## 40. MANUAL BYPASS CONTROL

position:

(+256, -1440)

visual:

64×64
또는
32×64 + Valve Lever

role:

Story Interaction.

Enemy:
NONE

Wind:
NONE

---

## 41. Bypass Interaction

Player Interact.

Sequence:

MANUAL BYPASS
READY

↓

OPEN BYPASS

↓

Large Valve Rotation

↓

Pressure Vent bursts briefly
BACKGROUND ONLY

↓

Pressure Gauge drops

↓

PRESSURE:
STABILIZING

↓

SERVICE ROUTE:
AVAILABLE

↓

Gate opens.

Player를 밀어내는 마지막 Surprise Wind 금지.

Interaction 이후는
보상 / 해소 구간.

---

## 42. 왜 Player가 Bypass를 작동시키는가

추천 Story Logic:

Pressure를 정상화하지 않으면
상단 Sector Gate가
Safety Interlock으로 잠겨 있음.

즉 Player가 도시 전체를 구하기 위해
수리하는 것이 아니다.

"위쪽으로 가려면 이 장치를 열어야 한다."

가 직접 목적.

주인공 Character와도 맞음:

정비기사이기 때문에
복잡한 장치를 보고
별도 설명 없이 수동 조작할 수 있음.

---

## 43. Bypass 이후 환경 변화

Player가 Bypass를 열면
Stage 전체가 조금 변한다.

추천:

Main Vent:
ACTIVE → LOW

Steam:
감소

Pressure alarm:
OFF

Gauge:
RED → NORMAL RANGE

Background machinery:
rotation stabilizes

이 변화는 Story Feedback.

이전 공간으로 내려가 볼 경우에도
변화를 확인 가능하면 좋지만
필수 구현은 아님.

---

## 44. EXIT

Gate:

SECTOR CONTAINMENT
ACCESS

또는

MAINTENANCE SECTOR GATE

Destination:

SECTOR 01-8

Stage 종료 직전 Display:

LOWER GRID
CONTAINMENT SEQUENCE
ADVANCING

1-8의 Sector Gate 압박을 예고.

---

## 45. Camera — Zone A

A Attach:

show:

- A
- B
- residual Steam
- Pressure Core 일부

---

## 46. Camera — Security Entry

C 도착:

show:

- D
- Turret T1
- Safe Shadow
- Pressure Vent 일부

Player가 Turret를
공격 전에 인지.

---

## 47. Camera — Main Decision Frame

D 위치에서는 반드시:

PLAYER

TURRET

ANCHOR E

MAIN VENT

SAFE SHADOW

중 최소 4개가
한 화면에 읽혀야 한다.

가능하면 Recovery R3도 표시.

---

## 48. Camera — E / F

E Attach 후:

Camera는 위쪽으로 Lead.

F
+
Upper Cover

가 보임.

Player는:

"저기까지 가면 안전하다."

를 알아야 한다.

---

## 49. Camera — Bypass

F 이후:

Turret는 화면 아래로 내려감.

G
+
Bypass Control
+
Exit Gate

중심.

전투 화면에서
Story / Relief 화면으로 전환.

---

## 50. 시각적 정보 우선순위

Main Challenge에서:

1.
Player / Red Scarf

2.
Cyan Rope / Anchor

3.
Turret Telegraph

4.
Wind Direction

5.
Collision / Cover

6.
Pressure Core

7.
Background Detail

중요:

Pressure Core가
거대하더라도 Gameplay를 가리면 안 됨.

---

## 51. Main Vent Pixel Art

Vent Housing:

192×192 ~ 256×256 px

Blade / Shutter:

큰 Dark Silhouette.

WARNING:

small mechanical orange indicators.

ACTIVE:

Steam / particle motion 증가.

Cyan 사용 금지.

---

## 52. Pressure Valve Core Pixel Art

전체:

256×384px 이상 equivalent.

모듈:

128×128
128×256
256×256

조합 가능.

구성:

- giant circular valve
- pressure chamber
- gauge banks
- thick pipe
- safety housing
- structural rib

색:

Dark Steel
Navy
Charcoal

Warning accent:

Red / Orange 소량.

---

## 53. Background FAR

512×288
또는
960×540.

내용:

- Vertical cooling network
- giant pipe silhouettes
- distant service bridges
- ventilation towers
- deep city infrastructure

낮은 Contrast.

---

## 54. Background MID

128×128 ~ 256×256.

- Pressure Tank
- Pipe Junction
- Valve
- Condenser
- Ventilation Module
- Pump
- Gauge Array

High-bit 산업 밀도 유지.

---

## 55. Background NEAR

32×32 ~ 64×64.

- pressure gauge
- conduit
- warning sign
- service panel
- drain
- bolts
- inspection marking

Turret / Anchor 주변 Clean Zone 유지.

---

## 56. Sentry Projectile Rule

RECOMMENDED FOR 1-7:

Standard Sentry Projectile
DOES NOT CUT ROPE.

Player Hit only.

이유:

1-7의 복합요소는 이미:

Wind
+
Turret
+
Augment

세 개.

여기에 Rope Cut까지 넣으면
새 규칙이 하나 더 추가된다.

Rope Cut은
추후 전용 Cutter / Jammer Enemy에서
명시적으로 소개하는 것이 좋다.

---

## 57. Turret Rule

Turret는 1-3의 규칙과
완전히 동일하게 유지.

같은:

Telegraph

Projectile Speed

Visual

Sound

를 우선 재사용.

1-7 난이도는
Turret 숫자나 공격속도를 올려서 만들지 않는다.

난이도 상승 원인:

SYSTEM OVERLAP

이어야 한다.

---

## 58. Turret 수

ONLY ONE.

Second Turret 금지.

두 Turret 종합은
1-8에서 사용.

1-7에서 두 기를 쓰면
1-8의 escalation 여지가 줄어든다.

---

## 59. 전체 Safe Route

START

→ A

→ B

→ C

→ Safe Shadow

→ Wait Turret Shot

→ Wait Vent LULL

→ D

→ E

→ Recovery / Cover

→ F

→ G

→ Bypass

→ Exit

가장 느리지만
모든 Build로 안정적.

---

## 60. 전체 Flow Route

START

→ A

→ B

→ C

→ D

→ Vent WARNING

→ Turret TRACK

→ Commit

→ E

→ ACTIVE Wind

→ Dodge Shot through movement

→ F

→ G

→ Bypass

→ Exit

Landing 최소화.

---

## 61. 전체 Recovery Route

Lower failure:

R1/R2

Combination failure:

R3

Upper failure:

F 아래 Catch Platform

어떤 한 번의 실패도
Stage 시작까지 되돌리지 않는다.

---

## 62. 실패 원인 판독 기준

Player가 실패했을 때
다음 중 하나를 말할 수 있어야 한다.

"Turret Shot Timing을 잘못 봤다."

"Wind Active 타이밍을 잘못 잡았다."

"Anchor E를 놓쳤다."

"Impulse를 너무 세게 썼다."

반대로:

"그냥 뭔가에 밀리고 맞아서 떨어졌다."

라고 느끼면
복합 설계 실패.

---

## 63. Damage Philosophy

1-7은 ★★★지만
Damage 숫자를 올려 난이도를 만들지 않는다.

첫 목표:

한 발 피격
→ Recovery 가능.

Turret Hit
+
Wind

조합으로 Player가
Stage 바닥까지 날아가는 상황은 피한다.

Knockback과 Wind가 합쳐지는 상황
반드시 테스트.

---

## 64. Playtest Metrics

공통:

- selected augment
- clear time
- deaths
- turret hits
- turret kills
- recovery uses
- D→E attempts
- D→E success rate
- bypass interaction time

Wind:

- crossing state:
  LULL / WARNING / ACTIVE

- average crossing velocity

- overshoots

Build:

IMPULSE:
- long crossings
- overshoots

RELAY:
- D→E→F chain success

SHEAR:
- turret intersection attempts
- shear hits / kills

---

## 65. Playtest Questions

1.
D에서 다음 행동을 결정하기 전에
Turret / Wind / E 위치를 모두 이해할 수 있었는가?

2.
복잡하지만 불공정하다고 느끼지는 않았는가?

3.
Wind와 Turret를
따로따로 처리했는가,
아니면 한 움직임으로 같이 해결했는가?

4.
자신이 선택한 Augment가
이 Encounter의 해법에 영향을 줬는가?

5.
Safe Route와 빠른 Route의 차이를 느꼈는가?

6.
실패한 이유를 바로 이해할 수 있었는가?

7.
Pressure Bypass를 작동시켜야 하는
스토리 이유가 자연스러웠는가?

---

## 66. PASS Criteria

PASS 01
새 Gameplay Mechanic이 없음.

PASS 02
C까지는 복합 난이도가 낮음.

PASS 03
D에서 전체 Main Challenge 정보를 미리 읽을 수 있음.

PASS 04
Safe Route로 모든 Build 클리어 가능.

PASS 05
Flow Route에서 Wind + Turret를 한 움직임으로 해결 가능.

PASS 06
IMPULSE / RELAY / SHEAR가 서로 다른 장점을 가짐.

PASS 07
SHEAR가 Turret와 Rope Geometry를 실제로 만들 수 있음.

PASS 08
Turret 파괴가 필수가 아님.

PASS 09
Standard projectile는 Rope를 끊지 않음.

PASS 10
Recovery 후 4~7초 내 재시도.

PASS 11
한 번의 피격으로 Stage 바닥까지 추락하지 않음.

PASS 12
Main Challenge 이후 완전한 Relief 구간 존재.

PASS 13
Bypass Interaction 후 환경 상태 변화가 보임.

PASS 14
첫 플레이 150~220초 정도.

PASS 15
숙련 Flow Clear 약 60~100초 가능.

---

## 67. FAIL Conditions

FAIL IF:

- Wind와 Turret가 동시에 처음 등장
- D에서 E 또는 Turret가 안 보임
- Turret가 화면 밖에서 발사
- Main Vent가 Active일 때 통과 불가능
- LULL 대기가 항상 최적해
- Safe Route가 가장 빠름
- Turret 두 기 이상
- Sentry 공격속도를 올려 난이도 생성
- Standard Sentry가 Rope까지 끊음
- Knockback + Wind로 Stage 전체 낙하
- IMPULSE가 Main Challenge 전체 Skip
- RELAY가 자동 Attach처럼 됨
- SHEAR Geometry가 사실상 불가능
- Bypass가 복잡한 새 Puzzle이 됨
- Bypass 이후 Surprise Hazard 발생

---

## 68. 구현 우선순위

PRIORITY 1

Greybox with no Enemy / no Wind.

확인:

A→B→C→D→E→F→G
Base Rope만으로 통과 가능.

---

PRIORITY 2

Cover / Recovery Geometry.

---

PRIORITY 3

1-3 Sentry FSM 재사용.

---

PRIORITY 4

1-6 WindZone 재사용.

새 Wind System 작성 금지.

---

PRIORITY 5

D→E Turret + Wind Overlap.

---

PRIORITY 6

Augment Routes.

Impulse
Relay
Shear

---

PRIORITY 7

Bypass Interaction / Environment State Change.

---

PRIORITY 8

Camera.

---

PRIORITY 9

Telemetry.

---

PRIORITY 10

Pixel Art / VFX / Sound.

---

## 69. 개발용 Stage Data Concept

stageId:
sector-01-07

name:
PRESSURE BYPASS

subtitle:
MANUAL PRESSURE CONTROL

bounds:
960×1536

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

platforms:
- P0 start
- R1 lower-catch
- R2 lower-recovery
- safe-shadow
- R3 central-recovery
- upper-catch
- final-deck

enemies:
- sentry-turret-01

windZones:
- residual-airflow
- main-pressure-vent

environmentObjects:
- pressure-valve-core
- main-pressure-vent
- cooling-pipes
- gauge-array

interactables:
- manual-bypass-control
- exit-gate

storyTriggers:
- pressure-unstable
- containment-violation
- pressure-limit
- bypass-ready
- bypass-open
- service-route-available

routes:
- safe
- flow
- recovery
- impulse
- relay
- shear

cameraZones:
- approach
- security-entry
- decision-frame
- pressure-crossing
- relief
- bypass

newMechanics:
NONE

---

## 70. 아트 담당자 전달문

32px Grid 기반의
대형 Cooling Pressure Bypass Shaft.

화면 중심 랜드마크는
256×384px 이상 규모의
Central Pressure Valve Core.

Player:
48×48 dark silhouette + long Red Scarf.

Anchor:
24×24 Cyan.

Sentry:
32×32,
Dark Body + Red Telegraph.

Main Pressure Vent:
192~256px 이상,
강한 Horizontal Airflow.

Background는 SANABI-inspired High-bit Pixel Art 방향으로
128~256px 단위의:

- Valve
- Cooling Pipe
- Pressure Tank
- Pump
- Gauge
- Vent
- Structural Frame

을 조합한다.

그러나 Main Challenge인 D→E 구간에서는
Player / Anchor / Turret / Wind가
우선적으로 읽히도록
Background Detail Density를 낮춘다.

Cyan:
Rope / Anchor 중심.

Red / Orange:
Sentry / Pressure Warning.

Wind:
Steam / Dust / Scarf / Cable Motion.

Background:
Dark Navy / Charcoal / Steel.

---

## 71. 개발자 최종 전달 요약

SECTOR 01-7 `PRESSURE BYPASS`는
Sector 1에서 처음으로

Rope Chaining
+
Foundation Augment
+
Sentry Turret
+
Wind

를 하나의 공간에서 조합하는 실전 Stage다.

새로운 Gameplay Mechanic은 추가하지 않는다.

초반 A→B에서는 약한 Residual Wind로
1-6을 복습하고,

C→D에서는 Wind 없이 Turret 규칙을 복습한다.

이후 D→E에서 처음으로
Turret LOS와 Pulsed Pressure Wind가 겹친다.

Safe Player는
Wind Shadow에서 Turret Shot과 Vent LULL을 확인한 뒤 이동한다.

숙련 Player는
Turret TRACK과 Vent WARNING을 동시에 읽고
ACTIVE Wind가 시작되는 순간 이동해
위험구간을 빠르게 통과한다.

Augment별 해법:

IMPULSE:
Wind와 Impulse를 합쳐
LOS 구간을 큰 Arc로 빠르게 통과.

RELAY:
D→E→F를 연속 Re-Attach해
두 번째 사격 전에 LOS 탈출.

SHEAR:
E에 Attach된 Rope Line이
Central Core의 Turret를 가로지르도록 Geometry를 만들고
Release하여 Turret를 공격.

Turret 파괴는 필수가 아니다.

Main Challenge 이후 F부터는
Wind와 Turret가 모두 차단되어
완전한 Relief 구간이 시작된다.

최상단에서 Player가
Manual Pressure Bypass를 열면:

PRESSURE:
STABILIZING

SERVICE ROUTE:
AVAILABLE

상태로 전환되고
1-8 Sector Gate가 열린다.

Stage 성공 기준:

"Player가 Wind, Enemy, Rope를
세 개의 별도 문제로 처리하는 것이 아니라
한 번의 좋은 Rope 움직임으로
여러 문제를 동시에 해결하기 시작하는가?"

이다.

---

## 72. LOCKED DECISIONS — 1-8 확정 반영

`SECTOR 01-8 CONTAINMENT GATE` 기준으로 다음 권장안 A를 확정한다.

- Manual Pressure Bypass는 도시 복구가 아니라 위쪽 탈출 경로 개방을 위한 조작이다.
- 일반 Sentry Projectile은 Player에게만 피해를 주며 Rope를 자르지 않는다.
- 압력은 잠시 안정화되지만 1-8의 Lower Grid Containment로 다시 악화된다.

아래 A/B 기록은 대안을 다시 선택하기 위한 열린 질문이 아니라 확정 배경으로 보존한다.

### Q1. Manual Pressure Bypass의 의미

현재 권장안:

Player가 도시를 구하기 위해 수리하는 것이 아니라,
압력 때문에 잠긴 위쪽 Service Gate를 열기 위해
필요한 만큼 Bypass를 작동시킨다.

A:
이 방향 확정.

B:
주인공이 실제 Cooling Failure도 일부 복구하게 변경.

RECOMMEND:
A

이유:
주인공의 목표를 끝까지 "탈출"로 유지할 수 있음.

---

### Q2. 일반 Sentry Projectile의 Rope Cut

현재 권장안:

일반 Sentry Projectile은
Player에게만 Damage.

Rope Cut 없음.

향후 별도의 Cutter / Jammer Enemy에서
Rope Cut을 명확하게 Tutorial.

A:
일반 Sentry = Player Hit only.

B:
1-7부터 일반 Sentry도 Rope Cut 가능.

RECOMMEND:
A

이유:
1-7은 이미 Wind + Turret + Augment가 겹치므로
Rope Cut까지 추가하면
새 규칙을 하나 더 가르치는 문제가 생김.

---

### Q3. Bypass 이후 압력 안정화의 영구성

현재 권장안:

1-7에서 Bypass를 열면
1-7의 Fan/Steam/Alarm 상태가 실제로 낮아지고,
1-8 진입 시 Maintenance Sector 전체가
잠시 안정된 것처럼 보인다.

하지만 이후 Lower Grid Containment 때문에
다시 하층이 꺼지기 시작한다.

A:
잠깐 안정화 → 1-8에서 Containment로 다시 악화.

B:
Bypass 효과는 해당 방에만 있고
세계 상태 변화 없음.

RECOMMEND:
A

이유:
Player 행동이 세계에 영향을 줬다는 피드백을 주면서도
전체 재난을 해결해버리지는 않음.

---

SECTOR 01-7 / PRESSURE BYPASS — BLOCKOUT CANDIDATE · REV 3.0
