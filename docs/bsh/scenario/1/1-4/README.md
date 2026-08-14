# SECTOR 01-4 — MAINTENANCE NODE

*BLOCKOUT CANDIDATE · REV 3.1*

◀ PREV — [SECTOR 01-3 / SECURITY CHECK](../1-3/README.md) · NEXT — [SECTOR 01-5 / AUGMENT TEST BAY](../1-5/README.md) ▶

> 실제 Runtime 구현 상태·문서 이미지·Camera·첫 선택 계약은 [PRODUCTION-ALIGNMENT.md](./PRODUCTION-ALIGNMENT.md)를 함께 따른다.

Sector: 01 MAINTENANCE
Stage: 04
Theme: Emergency Grapple Calibration Chamber
Difficulty: REST / REWARD
Expected First Playtime: 60~100 sec

Primary Mechanic:
FIRST ROPE AUGMENT SELECTION

New Gameplay Element:
Maintenance Node / 3-Choice Augment

Combat:
NONE

Damage Hazard:
NONE

Wind:
NONE

Required Previous Knowledge:
- Basic Grapple
- Swing / Release
- Airborne Re-Attach
- Movement Under Turret Pressure

---

## 1. 한 줄 정의

Security Check를 강제로 통과한 정비기사가
비상 정비용 Maintenance Node를 발견하고,

자신이 사용하던 산업용 Grapple의
기업 안전제한을 처음으로 Override한다.

플레이어는:

IMPULSE COIL
RELAY LINK
SHEAR CURRENT

중 하나를 선택하며,

이 순간부터 같은 Rope가 Run마다
다른 방식으로 성장하기 시작한다.

핵심 감정:

"아이템을 하나 먹었다."

가 아니라

"내 Rope가 이제 달라졌다."

---

## 2. 전체 게임에서의 역할

1-1:
기본 Rope

1-2:
Rope Chaining

1-3:
Enemy Pressure

1-4:
FIRST BUILD CHOICE

1-5:
선택한 Augment를 실제 공간에서 활용

즉 1-4는 새로운 난이도 구간이 아니라

TENSION
→ REWARD
→ EXPERIMENT

리듬의 REWARD 구간이다.

---

## 3. 왜 첫 Augment가 1-4인가

너무 일찍 Augment를 주면
플레이어가 기본 Rope와 Augmented Rope의 차이를 알 수 없다.

너무 늦게 주면
이 게임의 Build Roguelike 정체성이 늦게 드러난다.

현재 구조:

1-1
기본 Rope 경험

1-2
연속 Rope 경험

1-3
위험 속 Rope 경험

이후 1-4에서 선택.

따라서 플레이어는 이미:

"기본 Rope가 어떻게 움직이는가"

를 알고 있어

Augment의 변화도 바로 체감할 수 있다.

---

## 4. Augment System 철학

Rope는 교체하지 않는다.

Mode를 전환하지 않는다.

Q / 숫자키 등
새로운 Mode Switch Button을 추가하지 않는다.

플레이어는 게임 처음부터 끝까지:

같은 Grapple Device

를 사용한다.

Augment는 이 Grapple의 Firmware / Hardware를
하나씩 누적 개조하는 개념이다.

핵심:

ONE ROPE
→ GROWING TOOL

---

## 5. 첫 Augment 설계 원칙

첫 선택지는 모두 Foundation Augment다.

Foundation의 목적:

Run의 플레이 방향을 결정.

좋은 Augment 질문:

"이걸 얻으면 Rope를 어떻게 다르게 써볼까?"

나쁜 Augment 질문:

"Damage가 몇 % 올랐지?"

따라서 첫 3개는:

IMPULSE
= Momentum / Timing

RELAY
= Chaining / Rhythm

SHEAR
= Geometry / Offense

세 개의 서로 다른 Rope 플레이를 대표한다.

---

## 6. 첫 선택은 랜덤으로 하지 않는다

FIRST NODE에서는 항상:

1. IMPULSE COIL
2. RELAY LINK
3. SHEAR CURRENT

세 개를 보여준다.

목적:

- 모든 플레이어가 시스템 정체성을 이해
- Playtest 비교가 쉬움
- 1-5를 세 Foundation 기준으로 설계 가능
- 첫 Run부터 운 때문에 핵심 체험을 놓치는 문제 방지

후속 Node부터:

Weighted Random
Prerequisite
Specialization
Hybrid

등을 적용 가능.

---

## 7. 스토리 설정

주인공의 Grapple은
기업의 Vertical Infrastructure Maintenance 장비다.

평상시에는:

- 출력 제한
- 안전제한
- Firmware 제한
- 승인된 Maintenance Protocol

이 걸려 있다.

Vertical Grid 사고 이후
일부 비상 Maintenance Node가
Emergency Configuration Mode로 전환됐다.

이 Node들은 손상된 설비를 현장에서 복구하기 위해
정비도구 Firmware를 재설정할 수 있다.

따라서 Augment는:

마법 아이템

이 아니라

기업 설비의 비상 Reconfiguration Protocol.

---

## 8. 1-3과 Story 연결

1-3 마지막:

ACCESS DENIED

↓

MAINTENANCE OVERRIDE

↓

VIOLATION LOGGED

1-4 진입 후
Node가 플레이어 Grapple을 자동 인식.

SYSTEM:

GRAPPLE DEVICE DETECTED

MODEL:
VERTICAL MAINTENANCE UNIT

잠시 분석.

GRAPPLE TELEMETRY ANALYZED

현재 장비 상태 표시.

SAFETY LIMIT:
ACTIVE

이후:

EMERGENCY MAINTENANCE MODE

SAFETY LIMIT OVERRIDE
AVAILABLE

그리고:

3 COMPATIBLE AUGMENTS FOUND

여기서 첫 선택.

---

## 9. 공간 콘셉트

1-3의 Security Shaft보다
작고 조용한 공간.

이곳은 원래 정비기사가 장비를:

- 진단
- 충전
- Calibration
- Firmware Update

하던 Maintenance Calibration Room.

전투공간처럼 넓지 않다.

공간의 중심은
하나의 거대한 Maintenance Node.

구조:

ENTRY
→ NODE
→ CHOICE
→ SHORT CALIBRATION SPACE
→ EXIT

---

## 10. Pixel / Grid 기준

Base Grid:
32×32 px

Player:
48×48 px output

Stage Width:
768 px
= 24 tiles

Stage Height:
640 px
= 20 tiles

Coordinate:

X = -384 ~ +384
Y = 0 ~ -640

1-1~1-3보다 의도적으로 짧고 작다.

---

## 11. 전체 맵 구조

SYMBOL

N     = Maintenance Node
●     = Grapple Target
D     = Calibration Dummy
════  = Main Platform
----  = Thin Platform
GATE  = Exit


                         Y -640

        ┌──────────────────────────────┐
        │                 GATE 05 →   │
        │                █████████    │
        │                              │
        │            ● C               │
        │                ╲             │
        │                 ╲            │
        │          D CALIBRATION       │
        │            DUMMY             │
        │                              │
        │       ● B                    │
        │          ╲                   │
        │           ╲                  │
        │      ---- P2 ----            │
        │                              │
        │                    ● A       │
        │                              │
        │        [ MAINTENANCE NODE ]  │
        │               N              │
        │                              │
        │ P0 ENTRY                     │
        │ ═══════════════════          │
        └──────────────────────────────┘

                          Y 0


전체 플레이:

ENTRY
→ NODE
→ AUGMENT SELECT
→ A
→ B
→ C
→ EXIT

위쪽 짧은 공간은
새 Augment가 실제로 적용됐는지 확인하는 Calibration 공간.

본격적인 테스트는 1-5.

---

## 12. Stage Zone 구성

ZONE A
DECOMPRESSION

Y:
0 ~ -128

목적:

1-3의 전투 긴장 해소.

---

ZONE B
MAINTENANCE NODE

Y:
-128 ~ -320

목적:

첫 Augment 선택.

---

ZONE C
CALIBRATION

Y:
-320 ~ -576

목적:

선택 직후 Rope가 바뀌었다는 최소 체감.

---

ZONE D
EXIT

Y:
-576 ~ -640

목적:

1-5 진입.

---

## 13. P0 — ENTRY PLATFORM

bounds:

x = -320 ~ +320
y = 0

size:

640×32 px

role:

- Stage 진입
- 완전 안전
- Maintenance Node 확인
- Story pacing

Enemy:
NONE

Hazard:
NONE

Background Sound도
1-3보다 크게 줄인다.

---

## 14. Node가 처음부터 화면에 보여야 한다

Stage 진입 Camera에서:

- Player
- Maintenance Node
- Calibration 공간 일부

가 보인다.

Node를 숨겨 찾게 만들지 않는다.

1-4는 Exploration Stage가 아니다.

Reward Stage다.

---

## 15. MAINTENANCE NODE N1

position:

(0, -160)

coordinate anchor:

BOTTOM-CENTER

Player interaction route point:

(0, -128)

recommended visual size:

96×128 px

또는

128×128 px

role:

- Grapple Scan
- Augment Selection
- Story interaction
- First Build Seed

visual hierarchy:

Player / Rope보다 크지만
화려한 Shrine처럼 만들지 않는다.

Industrial Maintenance Machine 느낌.

---

## 16. Node Pixel Art Spec

Source component:

96×128
또는
128×128

구성:

- central diagnostic screen
- grapple docking port
- side cable
- mechanical arm
- status lamp
- maintenance markings

색:

Dark Steel / Navy

Screen:
dim Cyan / White

Emergency Override:
small Amber / Orange

절대:

전체 Node를 Cyan Neon으로 만들지 않는다.

Cyan은 Rope / Anchor가 우선.

---

## 17. Node Interaction 방식

권장:

Player가 Node 앞
약 48~64px Interaction Radius에 진입.

Interact.

게임 Movement 정지.

Node UI 활성.

기존 Reward Selection 입력 구조를 최대한 재사용.

선택:

LEFT / RIGHT

확정:

UP / CONFIRM

UI 종료 이후 Player control 반환.

중요:

입력 진입 직후 방향키가
선택까지 같이 움직이지 않도록 Input Gate 사용.

---

## 18. Selection UI 구조

한 화면에 3개의 Choice를 동시에 보여준다.

LEFT:
IMPULSE COIL

CENTER:
RELAY LINK

RIGHT:
SHEAR CURRENT

카드는 너무 많은 텍스트를 넣지 않는다.

각 Choice는:

NAME

1줄 기능

작은 Gameplay Icon

로 구성.

---

## 19. UI Copy — IMPULSE COIL

IMPULSE COIL

POWER THE SWING

Timing / Momentum

설명:

Charged swing input grants
a strong directional impulse.

플레이어 언어:

"타이밍을 맞춰 더 강하게 날아간다."

---

## 20. UI Copy — RELAY LINK

RELAY LINK

KEEP THE CHAIN ALIVE

Chaining / Rhythm

설명:

After a clean release,
the next grapple receives
a brief attachment assist.

플레이어 언어:

"놓은 직후 다음 Rope를 더 쉽게 연결한다."

---

## 21. UI Copy — SHEAR CURRENT

SHEAR CURRENT

TURN THE ROPE INTO A BLADE

Geometry / Offense

설명:

Cross an enemy with the rope,
then release to trigger a shear hit.

플레이어 언어:

"Rope 선으로 적을 가르고 놓으면 공격한다."

---

## 22. FOUNDATION AUGMENT 01 — IMPULSE COIL

Category:

FOUNDATION / MOMENTUM

Core behavior:

Player가 Rope Attached 상태에서
기존 Swing Charge / Drag 입력 조건을 만족하면

강한 directional impulse 발생.

중요:

새 버튼 없음.

기존 Rope 행동:

Attach
→ Swing
→ Drag / Timing
→ Release

안에서 작동.

---

## 23. IMPULSE COIL과 현재 swingImpulse 문제

현재 프로젝트에는 이미
swingImpulse = 780

기능이 기본 Rope에 존재.

REV 3.1 Production 판정:

기본 Rope에서
현재 780 impulse를 그대로 유지하면서
IMPULSE를 단순 +20% 강화로 만드는 것은 권장하지 않는다.

하지만 현재 780을 바로 제거해
Impulse 전용으로 옮기는 안도 아직 확정하지 않는다.

`swingImpulse = 780` 소유권 이전은 `HYPOTHESIS`다.

먼저 1-1과 1-2에서:

- A: 현재값 780
- B: 중간 후보값
- C: 0

을 비교해 기본 Rope의 재미와 통과 가능성을 검증한다.

장기 목표 후보:

BASE ROPE

Pendulum
+
normal player movement

IMPULSE COIL

기존 강한 directional impulse 기능을
Augment로 승격.

즉 현재 swingImpulse 기능의
Gameplay Ownership을:

BASE

에서

IMPULSE AUGMENT

로 이동.

정확한 ownership과 strength는 Playtest 대상.

---

## 24. IMPULSE COIL 플레이 변화

선택 전:

Anchor
→ Swing
→ Release

선택 후:

Anchor
→ Swing
→ Charge direction
→ IMPULSE
→ Large Release Arc

플레이어 생각:

"이 Anchor에서 얼마나 크게 날아갈 수 있지?"

이 Foundation의 재미는:

거리
속도
큰 Arc
위험구간 짧게 통과

---

## 25. FOUNDATION AUGMENT 02 — RELAY LINK

Category:

FOUNDATION / CHAINING

Core behavior:

Player가 Rope를 Release한 직후
짧은 Relay Window 생성.

Window 중 다음 Attach에는:

- slightly longer input buffer
- slightly greater aim forgiveness

등의 도움 제공.

중요:

Max Rope Distance 자체를
과도하게 늘리는 것은 피한다.

---

## 26. RELAY LINK 권장 동작

Example Initial Hypothesis:

BASE:

attach buffer
100ms

RELAY WINDOW:

약 0.5~0.8 sec

그 Window 안에 다음 Attach 입력 시:

effective attach buffer:
150~180ms 후보

aim assist:
baseline보다 약간 확대

정확한 값:
PLAYTEST

---

## 27. RELAY 조건

Relay는 단순히 계속 켜져 있는
Passive Aim Assist가 아니다.

조건:

Rope Release

↓

짧은 Relay Window

↓

다음 Rope Attach

↓

Relay consumed

즉:

Release → Attach

리듬을 잘 연결하는 플레이를 보상.

---

## 28. RELAY Visual Feedback

Release 순간:

아주 짧은 Cyan pulse가
grapple device에서 발생.

Relay Window:

device에 작은 1~2px pulse.

다음 Anchor가 잡히면:

짧은 double-click sound.

큰 화면 Glow 금지.

효과를 UI가 아니라
플레이 리듬으로 느끼게 한다.

---

## 29. FOUNDATION AUGMENT 03 — SHEAR CURRENT

Category:

FOUNDATION / GEOMETRY-OFFENSE

Core behavior:

Rope가 Enemy / Valid Target의 위치를
가로지른 상태에서

Player가 Release하면

Rope line을 따라
Shear Damage 발생.

핵심:

Rope의 "선" 자체가 공격 공간이 됨.

---

## 30. SHEAR CURRENT 입력

새 버튼 없음.

기존:

Attach
→ Swing
→ Rope crosses enemy
→ Release

그 순간:

SHEAR TRIGGER

즉 Player가 생각하는 것:

"어디에 Rope를 걸면
적을 Rope 선 사이에 넣을 수 있지?"

---

## 31. SHEAR CURRENT의 목적

자동사격 Damage +X%

가 아니다.

공격 방식 자체가:

"좋은 Rope Geometry"

를 요구.

우리 게임 핵심 질문:

"Rope를 잘 쓰는 사람이
더 강하게 싸우는가?"

에 직접 연결.

---

## 32. SHEAR VALID TARGET

초기 Prototype:

Enemy body only.

DO NOT initially include:

- projectile
- wall
- destructible prop
- multiple special target types

먼저:

Rope intersects enemy
→ Release
→ Damage

하나만 검증.

---

## 33. FIRST NODE 선택 이후 공통 처리

선택 확정.

Node:

AUGMENT PROTOCOL ACCEPTED

↓

SAFETY LIMIT OVERRIDE

↓

FIRMWARE PATCH APPLIED

↓

선택 이름 표시.

예:

IMPULSE COIL
ONLINE

또는

RELAY LINK
ONLINE

또는

SHEAR CURRENT
ONLINE

---

## 34. 주인공 대사

긴 독백 금지.

가능하면 없음.

필요할 경우:

"...override."

정도.

Node 시스템 UI가 설명 담당.

---

## 35. AUGMENT 선택 이후 Calibration 공간

Node 바로 뒤에
아주 짧은 Rope 공간.

목적:

"선택한 게 실제로 켜졌다."

를 즉시 체감.

본격적으로:

"이 Build를 어떻게 활용하지?"

를 묻는 것은 1-5.

---

## 36. ANCHOR A — CALIBRATION START

position:

(+192, -320)

visual:

24×24 px

role:

선택 직후 첫 Rope.

difficulty:

VERY EASY

---

## 37. ANCHOR B — CHAIN TARGET

position:

(-96, -448)

visual:

24×24 px

role:

짧은 Re-Attach 기회.

모든 Augment로 통과 가능.

RELAY:

차이가 바로 느껴질 가능성.

IMPULSE:

큰 Arc 가능.

SHEAR:

아직 공격 Target 없어도 됨.

---

## 38. CALIBRATION DUMMY

position:

(+80, -448)

visual:

32×48 또는 32×64 px

type:

NON-HOSTILE MAINTENANCE TEST TARGET

role:

SHEAR CURRENT 사용자에게
효과를 바로 확인시킬 수 있는 Target.

중요:

Enemy가 아님.

Player에게 공격하지 않음.

---

## 39. Dummy 설정

Visual:

- hanging diagnostic unit
- repair target
- articulated training fixture

색:

Gray / Steel

small orange target mark

SHEAR로 맞으면:

small spark

DIAGNOSTIC:
CONTACT REGISTERED

Player가 SHEAR가 아닌 경우:

아무 문제 없이 그냥 지나감.

---

## 40. 왜 실제 Enemy를 넣지 않는가

1-4는 Reward / Rest Stage.

첫 Augment를 고른 직후
전투를 요구하면:

선택 UI
+
새 Augment
+
Enemy

를 동시에 처리해야 함.

따라서 실제 Enemy는 1-5에서 다시 사용.

1-4 Dummy는
위협 없는 Feedback Object.

---

## 41. ANCHOR C — EXIT TARGET

position:

(+160, -560)

visual:

24×24 px

role:

짧은 Calibration 종료.

모든 Augment에서
기본 Rope만으로도 도달 가능.

---

## 42. P1 / P2 플랫폼

Calibration 구간 아래에는
낙하 Catch Platform 존재.

P1:

192×16 px

P2:

160×16 px

Hazard 없음.

실패해도
즉시 다시 Rope 사용.

1-4에서 추락 Punishment를 넣지 않는다.

---

## 43. EXIT

상단 Gate:

TEST BAY 05

또는

GRAPPLE CALIBRATION

표시.

다음 Stage가
선택한 Augment를 시험할 공간임을 암시.

---

## 44. 전체 플레이 경로

ENTRY

↓

Node 발견

↓

Grapple Scan

↓

3 Choice

IMPULSE
/
RELAY
/
SHEAR

↓

One Selected

↓

Firmware Applied

↓

Anchor A

↓

B

↓

Calibration Dummy

↓

C

↓

Exit to 1-5

---

## 45. 이동경로 설계

1-4는 Safe / Flow / Recovery가
복잡하게 갈라지는 Stage가 아니다.

주 경로 하나.

목적은:

Decision Clarity

다.

다만 Calibration 구간에서는
작은 표현 차이를 허용.

---

## 46. IMPULSE 사용자 Calibration

A Attach

↓

Impulse Charge

↓

큰 Arc

↓

B 또는 C 방향 빠른 이동.

목적:

"확실히 더 강하게 날아간다."

---

## 47. RELAY 사용자 Calibration

A

↓

Release

↓

B Re-Attach

↓

Relay Feedback

↓

C

목적:

"연속 Rope가 더 부드럽다."

---

## 48. SHEAR 사용자 Calibration

A 또는 B Rope가
Dummy를 가로지르도록 Swing.

↓

Release.

↓

Dummy Hit Spark.

목적:

"Rope 선 자체가 공격이 됐다."

---

## 49. 중요한 공정성 규칙

어느 Augment를 골라도
Calibration 공간과 다음 Gate는 통과 가능.

IMPULSE 전용 문

RELAY 전용 문

SHEAR 전용 문

금지.

Augment는:

Solution Option

이지

Key

가 아니다.

---

## 50. 첫 선택 UI 정보량

선택 화면에서
미래 Upgrade Tree 전체를 보여주지 않는다.

플레이어에게 필요한 정보:

1.
이름

2.
어떤 Rope 행동을 바꾸는가

3.
어떤 스타일인가

정도.

예:

IMPULSE COIL
Momentum
"Swing timing grants a powerful burst."

RELAY LINK
Chaining
"Release into your next grapple more easily."

SHEAR CURRENT
Offense
"Release while your rope crosses an enemy to cut."

---

## 51. 향후 성장 구조

첫 Node에서
Foundation 선택.

후속 Node에서는:

FOUNDATION

↓

SPECIALIZATION

↓

SPECIALIZATION / SECONDARY

↓

HYBRID

↓

CAPSTONE

방향.

예:

IMPULSE

→ OVERCHARGE
→ AFTERBURN

RELAY

→ HANDOFF
→ EXTENDED RELAY

SHEAR

→ TRACE
→ CHAIN CUT

그리고 조합 조건을 만족하면:

IMPULSE + SHEAR
→ VELOCITY CUT

IMPULSE + RELAY
→ HOT TRANSFER

RELAY + SHEAR
→ LIVE CIRCUIT

이 구조는 1-4 UI에 전부 표시하지 않는다.

기획 구조로만 유지.

---

## 52. Build Seed라는 개념

첫 Augment는
단순 Reward가 아니라:

BUILD SEED

다.

향후 선택 Pool은
현재 Build를 어느 정도 따라가야 한다.

예:

IMPULSE 사용자는
IMPULSE 계열 Upgrade 등장 확률 증가.

하지만 다른 계열도 완전히 막지는 않는다.

목표:

Build Identity

+
Run Variation

둘 다 유지.

---

## 53. 현재 Artifact 시스템과의 관계

현재 구현에는 기존 Artifact가 존재.

현재 Artifact:

POWER CORE
→ Auto Fire Damage 증가

RAPID GEAR
→ Fire Interval 감소

ROPE RESONANCE
→ Swing 후 일정 시간 Damage 증가

이 시스템은
새 Augment 철학과 완전히 같지 않음.

권장:

Artifact
≠
Rope Augment

개념 분리.

---

## 54. 권장 데이터 구조

새:

AUGMENT_CATALOG

사용 권장.

예:

augment:
  id
  name
  family
  tier
  description
  prerequisites
  effects

family:

IMPULSE
RELAY
SHEAR
UTILITY
HYBRID

tier:

FOUNDATION
SPECIALIZATION
HYBRID
CAPSTONE

---

## 55. 기존 Reward Selection 재사용 가능 부분

기존 시스템의:

choices[]

selectedIndex

horizontal selection

confirm input

UI State

개념은 재사용 가능.

하지만 현재 Selection이
checkpointId 중심이면

Node 선택을 위해:

sourceId

또는

rewardId

처럼 일반화하는 것을 권장.

예:

sourceId:
"sector-01-04-node-01"

대신:

checkpointId only

구조에 Augment를 억지로 끼우지 않는다.

---

## 56. Node와 Checkpoint 분리

1-4 Node는
Sector 8 Checkpoint가 아니다.

따라서:

Checkpoint
= Death / Progress Recovery

Maintenance Node
= Build Decision

으로 역할 분리.

둘이 나중에 같은 공간에
함께 등장할 수는 있지만

시스템 개념은 구분한다.

---

## 57. Run Persistence

첫 Augment 선택 후
해당 Run 동안 유지.

기본 방향:

Death 후 Checkpoint에서 복귀할 때
Run Augment 정책은 별도 결정 필요.

권장 Prototype:

Checkpoint 이전에 획득한 Augment:
KEEP

Checkpoint 이후 임시 Augment:
정책 추후 결정

하지만 이 규칙은
1-4 구현 필수조건이 아님.

별도 Run System 설계에서 확정.

---

## 58. Pixel Art — Node UI

Node Selection은
일반 RPG 메뉴처럼 화면 전체를 화려하게 채우지 않는다.

배경:

게임 화면 darkened 30~40%

중앙:

3개의 산업용 Diagnostic Card.

각 카드:

약 96×128 logical presentation unit.

Icon:

32×32

Title

1-line effect

Family tag

선택 Card만
얇은 Cyan/White Border.

---

## 59. Augment Icon Spec

IMPULSE:

32×32

형태:
coil + directional burst

RELAY:

32×32

형태:
two linked grapple points

SHEAR:

32×32

형태:
rope line crossing target

색깔만으로 분류하지 않는다.

각 Silhouette이 달라야 한다.

---

## 60. Node Background Layer

FAR:

어두운 Maintenance Room continuation

512×288 / 960×540

---

MID:

Diagnostic machinery

128×128

Cable rack

128×256

Grapple repair arm

128×128

Emergency power unit

128×128

---

NEAR:

32×32 / 64×64

tool cabinet

service terminal

cable socket

warning marking

repair bench

---

## 61. 화면 밀도

1-4는 1-3보다
배경 Motion을 줄인다.

목적:

Reward 선택에 집중.

환경은 촘촘하지만
조명과 움직임은 차분.

Contrast hierarchy:

Node
→ Player
→ Selection UI
→ Calibration Anchors
→ Background

선택 UI 활성 중에는
Anchor Glow를 약하게 낮춰도 됨.

---

## 62. Camera

ENTRY:

Player + Node가 동시에 보임.

NODE INTERACTION:

Camera movement stop.

필요하면 Node 중심으로
아주 약한 reframe.

큰 Cinematic Zoom 금지.

CHOICE COMPLETE:

Camera 다시 Gameplay 위치.

CALIBRATION:

A/B/C와 Player를 우선.

EXIT:

1-5 Gate 표시.

---

## 63. Sound Design

입장:

1-3 Security siren 감소.

Node idle:

low transformer hum.

Scan:

short diagnostic sweep.

Choice navigation:

small mechanical tick.

Confirm:

heavy relay click.

Firmware Apply:

electric charge
+
grapple device sound.

IMPULSE:

deep short burst.

RELAY:

double-link click.

SHEAR:

thin electric slice.

---

## 64. Story Message Sequence

추천 순서:

GRAPPLE DEVICE DETECTED

↓

GRAPPLE TELEMETRY ANALYZED

↓

EMERGENCY MAINTENANCE MODE

↓

SAFETY LIMIT OVERRIDE AVAILABLE

↓

3 COMPATIBLE AUGMENTS FOUND

↓

PLAYER SELECTS

↓

FIRMWARE PATCH APPLIED

↓

[AUGMENT NAME] — ONLINE

총 텍스트 시간을 짧게 유지.

---

## 65. Story에서 아직 말하지 않을 것

DO NOT REVEAL:

- Evacuation priority
- Lower Grid abandonment
- Human authorization
- Corporate conspiracy
- Upper-class evacuation
- Final shuttle eligibility

1-4의 스토리 역할은:

"도시의 시스템을 어기면서
장비도 제한에서 벗어나기 시작한다."

까지만.

---

## 66. 1-4의 감정 곡선

ENTRY

Relief

↓

Node Discovery

Curiosity

↓

Scan

Anticipation

↓

3 Choices

Decision

↓

Confirm

Power / Ownership

↓

Calibration

Immediate Satisfaction

↓

Exit

"I want to try this."

이 마지막 감정이
1-5로 연결되어야 한다.

---

## 67. 플레이테스트 핵심 질문

1.
세 Augment의 차이를
설명만 보고 이해할 수 있는가?

2.
각 선택이 단순 Stat 증가가 아니라
다른 플레이스타일처럼 느껴지는가?

3.
선택 직후 Calibration에서
효과를 알아챘는가?

4.
"다른 두 개도 다음 Run에서 써보고 싶다"
는 생각이 드는가?

5.
선택 화면이 너무 오래 걸리는가?

6.
Node가 세계관에 자연스럽게 느껴지는가?

7.
Augment 때문에 새 버튼이 필요하다고 느끼는가?

마지막 질문은
가능하면 NO가 목표.

---

## 68. Augment별 Playtest

### IMPULSE

질문:

"기본 Rope와 운동량 차이가 명확한가?"

너무 강하면:

기존 Rope Skill 무시.

너무 약하면:

단순 숫자 Upgrade.

목표:

Skill Expression 강화.

---

### RELAY

질문:

"Re-Attach가 부드러워졌지만
게임이 자동으로 해주는 느낌은 아닌가?"

너무 강하면:

Aim 의미 소멸.

너무 약하면:

효과 인지 불가.

---

### SHEAR

질문:

"적을 맞히기 위해
Anchor와 Rope 선을 다르게 생각하게 되는가?"

YES가 핵심.

단순:

Swing하면 자동 Damage

가 되면 실패.

---

## 69. PASS Criteria

PASS 01

1-3 직후 긴장이 확실히 낮아짐.

PASS 02

Node를 찾느라 헤매지 않음.

PASS 03

첫 선택이 항상
Impulse / Relay / Shear로 명확히 제시됨.

PASS 04

세 선택의 역할이
Momentum / Chaining / Offense로 구분됨.

PASS 05

세 Augment 모두 새 버튼 필요 없음.

PASS 06

선택 후 10초 이내 효과를 시험 가능.

PASS 07

모든 Augment로 Exit 가능.

PASS 08

Calibration 실패에 Punishment 없음.

PASS 09

Augment가 단순 Damage/Speed Stat 선택처럼 느껴지지 않음.

PASS 10

Player가 다음 Stage에서
선택한 Augment를 더 써보고 싶어 함.

PASS 11

Story상 Augment 등장 이유가 이해됨.

PASS 12

전체 Stage 첫 플레이 약 60~100초.

---

## 70. FAIL Conditions

FAIL IF:

- Node에서 긴 설명문을 읽어야 함
- Augment 선택에 1분 이상 소요
- 선택 하나가 명백히 정답처럼 보임
- Impulse가 기본 이동을 완전히 대체
- Relay가 Auto-Aim처럼 동작
- Shear가 Rope Geometry 없이 자동 공격
- 선택하지 않은 Augment가 없으면 Exit 불가능
- Dummy가 실제 Enemy처럼 공격
- 1-4가 또 하나의 Combat Room처럼 느껴짐
- Node가 판타지 Shrine처럼 보임
- Augment가 기존 Artifact와 구분되지 않음

---

## 71. 제외 요소

DO NOT ADD:

- Enemy
- Turret
- Drone
- Damage Hazard
- Wind
- Moving Platform
- Laser
- Boss
- Timed Challenge
- Random First Augment
- Mode Switching
- New Combat Button
- Augment-specific locked doors
- Complex Crafting
- Currency Cost
- Reroll at First Node

---

## 72. 개발 구현 우선순위

PRIORITY 1

Augment Data Model

FOUNDATION:
- impulse-coil
- relay-link
- shear-current

---

PRIORITY 2

Maintenance Node Trigger

---

PRIORITY 3

3-Choice Selection UI

기존 Artifact Reward Selection 로직
재사용 가능한 부분 우선 검토.

---

PRIORITY 4

Impulse behavior

기존 swingImpulse 기능을
Augment ownership으로 이전하는 Prototype.

---

PRIORITY 5

Relay Window

---

PRIORITY 6

Shear Line Intersection + Release Trigger

---

PRIORITY 7

Calibration Dummy

---

PRIORITY 8

Story / VFX / Art

기능 검증 이후.

---

## 73. 개발용 Stage Data Concept

stageId:
sector-01-04

name:
MAINTENANCE NODE

subtitle:
EMERGENCY CALIBRATION

bounds:
768×640

spawn:
(-288,-32)

platforms:
- P0 entry
- P1 calibration-catch
- P2 calibration-catch
- final-deck

grappleTargets:
- A
- B
- C

interactables:
- maintenance-node
- exit-gate

testObjects:
- calibration-dummy

augmentsOffered:
- impulse-coil
- relay-link
- shear-current

choicePolicy:
FIXED_FIRST_NODE

enemies:
NONE

damageHazards:
NONE

storyTriggers:
- grapple-detected
- telemetry-analyzed
- override-available
- augment-selected
- firmware-applied

cameraZones:
- entry
- node
- calibration
- exit

---

## 74. 아트 담당자 전달문

32px Grid 기반의
Emergency Grapple Calibration Room.

이 Stage는 이전 Security Shaft보다
조용하고 작은 Maintenance 공간이다.

플레이어는 48×48 출력.

Anchor는 24×24 Cyan.

Maintenance Node는
96×128 또는 128×128 규모의
Industrial Diagnostic Machine.

Node는 거대한 Neon Shrine이 아니라:

- mechanical repair arm
- docking port
- diagnostic monitor
- cable rack
- emergency indicator

로 구성한다.

Augment Icon:

32×32.

IMPULSE:
Coil / Burst silhouette.

RELAY:
Linked Anchor silhouette.

SHEAR:
Rope crossing target silhouette.

배경은 SANABI-inspired High-bit Pixel Art 밀도를 유지하되,
1-3보다 Motion과 Lighting을 줄여
Reward / Rest Room 분위기를 만든다.

Player:
Dark silhouette + Red Scarf.

Rope / Anchor:
Cyan.

Warning:
Amber / Orange small accents.

Background:
Dark Navy / Steel / Charcoal.

---

## 75. 개발자 최종 전달 요약

SECTOR 01-4 `MAINTENANCE NODE`는
1-3의 첫 Security Encounter 직후 등장하는
전투 없는 Reward / Build Seed Stage다.

주인공은 사고로 Emergency Mode에 들어간
Maintenance Node를 발견하고,

자신의 기업용 Grapple에 걸려 있던
Safety Limit를 Override한다.

첫 Node에서는 랜덤 선택을 사용하지 않고
항상 세 Foundation Augment를 제공한다.

IMPULSE COIL:
Momentum / Timing 중심.

RELAY LINK:
Re-Attach / Chaining 중심.

SHEAR CURRENT:
Rope Geometry / Offense 중심.

모든 Augment는
기존 Attach / Swing / Release 행동 안에서 작동하며
새로운 Mode Switch나 Button을 요구하지 않는다.

선택 이후에는
A→B→C로 이루어진 짧은 Calibration 공간을 제공해
10초 이내에 선택 효과를 시험하게 한다.

SHEAR 사용자를 위해
공격하지 않는 Calibration Dummy 하나를 배치한다.

하지만 본격적인 Build 활용 시험은
다음 1-5에서 진행한다.

현재 기존 Artifact 시스템의
3-choice selection UI/입력 구조는 재사용 가능하지만,

기존 Artifact가
자동사격 Stat 중심이고
checkpointId 중심으로 설계되어 있으므로

Rope Augment는
별도의 AUGMENT_CATALOG와
Node 기반 Reward Source로 분리하는 것을 권장한다.

Stage 성공 기준은:

"선택 직후 플레이어가
내 Rope가 달라졌다고 느끼고,
다음 방에서 이걸 더 써보고 싶어 하는가?"

이다.

---

## 문서 이미지 상태

### Scenario Art Reference

![1-4 Scenario Art Reference](./images/01_scenario_art_reference.png)

`TEMPORARY / PENDING REGENERATION`: 산업용 Maintenance Node, 동등한 세 Firmware Profile, 조용한 Reward Room과 비공격 Dummy의 위계만 참고한다. Player 크기와 삼각 Anchor 연결은 생성 기준이 아니며 [Scenario Art 생성 규격](../../SCENARIO-ART-GENERATION-STANDARD.md)에 따라 대표 Gameplay Shot으로 교체한다.

### Approved Blockout

![1-4 Approved Blockout](./images/02_approved_blockout.svg)

`APPROVED BLOCKOUT`: 현재 768×640 Geometry, Node Deck, A/B/C, Recovery, Dummy, Panel, Gate 좌표와 구현 누락 상태를 정한다.

SECTOR 01-4 / MAINTENANCE NODE — BLOCKOUT CANDIDATE · REV 3.1
