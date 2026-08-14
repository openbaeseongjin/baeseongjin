# SECTOR 02-1 — WORKER BLOCK 12

*BLOCKOUT CANDIDATE · REV 2.0*

NEXT — [SECTOR 02-2 / PATROL WALKWAY](../2-2/README.md) ▶

`SECTOR 02 WORKER DISTRICT` · `STAGE 01` · `DIFFICULTY ★` · `TARGET 70–110s (HYPOTHESIS)` · `SKILLED 30–50s (HYPOTHESIS)` · `ENEMY NONE — LOCKED` · `NEW MECHANIC NONE — LOCKED` · `NEW AUGMENT NONE — LOCKED` · `CHECKPOINT NONE — 현재 계획`

| 항목 | 내용 |
|---|---|
| Status | HYPOTHESIS — BLOCKOUT CANDIDATE |
| Primary Role | Worker District Introduction / Transition |
| Primary Space | Vertical Residential Courtyard |

## Contents

0. [기획 기준](#0--기획-기준)
0-1. [Reference Scan](#0-1--reference-scan)
1. [한 줄 정의](#1--한-줄-정의)
2. [전체 게임에서의 역할](#2--전체-게임에서의-역할)
3. [Story 역할](#3--story-역할)
4. [공간 콘셉트](#4--공간-콘셉트)
5. [Pixel / Grid 기준](#5--pixel--grid-기준)
6. [전체 맵 구조](#6--전체-맵-구조)
7. [Zone 구성](#7--zone-구성)
8. [좌표 / 오브젝트](#8--좌표--오브젝트)
9. [Safe Route](#9--safe-route)
10. [Flow Route](#10--flow-route)
11. [Build Route](#11--build-route)
12. [Recovery](#12--recovery)
13. [Enemy / Hazard](#13--enemy--hazard)
14. [Camera](#14--camera)
15. [Story Trigger](#15--story-trigger)
16. [Pixel Art Asset Spec](#16--pixel-art-asset-spec)
17. [Background](#17--background)
18. [Sound / VFX](#18--sound--vfx)
19. [Implementation Notes](#19--implementation-notes)
20. [Playtest Metrics](#20--playtest-metrics)
21. [PASS Criteria](#21--pass-criteria)
22. [FAIL Conditions](#22--fail-conditions)
23. [개발 구현 우선순위](#23--개발-구현-우선순위)
24. [Stage Data Concept](#24--stage-data-concept)
25. [아트 담당자 전달문](#25--아트-담당자-전달문)
26. [개발자 최종 전달 요약](#26--개발자-최종-전달-요약)
OPEN QUESTIONS. [Non-Blocking](#open-questions--non-blocking)

---

## 0. 기획 기준

### LOCKED

2-1은 다음을 변경하지 않는다.

- ONE ROPE, GROWING TOOL
- Sector 01에서 얻은 Foundation Augment 유지
- IMPULSE / RELAY / SHEAR 모두 필수 진행 가능
- Drone은 2-2에서 처음 등장
- Specialization은 2-3에서 처음 등장
- 살아 있는 NPC 없음
- 사람 실루엣 없음
- 시체 없음
- Worker District가 Group C라는 사실까지만 암시
- Group C가 왜 정지되었는지는 설명하지 않음
- 새 Rope 입력 / Mode / 버튼 추가 없음

## 0-1. Reference Scan

### SANABI

**VERIFIED**

[SANABI](https://store.steampowered.com/app/1562700/_/?l=english) 개발진은 Chain Arm의 winding 기능을 초기에 이미 구현했지만, 이를 너무 일찍 제공했을 때 플레이어가 Swing을 익히기보다 winding에 의존하는 문제가 생겨 후반으로 미뤘다고 설명했다.

### TRANSFER

2-1은:

> 새로운 이동 능력을 보여주는 Stage가 아니라
> 이미 배운 Rope 기본기를 다른 공간에서 다시 즐기는 Stage

로 만든다. 따라서:

- New Traversal Mechanic 없음
- New Tutorial Input 없음
- Tight Timing Challenge 없음

### Rusted Moss

**VERIFIED**

[Rusted Moss](https://blog.playstation.com/?p=393354)는 하나의 Grapple Hook을 게임 전체의 중심으로 두고, 후속 능력도 Grapple과 시너지를 내도록 설계했다. 개발진은 같은 Platforming Challenge가 여러 방식으로 해결되는 것을 긍정적으로 보며 플레이어가 예상하지 못한 이동법과 Shortcut을 발견하는 것도 허용했다.

### TRANSFER

2-1은:

```text
ONE REQUIRED DESTINATION
+
MULTIPLE VALID MOVEMENT SOLUTIONS
```

구조를 사용한다. 단:

```text
Shortcut ≠ Stage Skip
```

이다. 숙련 플레이어가 Landing 하나를 건너뛰는 것은 허용한다. Story와 2-2 Entry까지 한 번에 Skip하는 것은 허용하지 않는다.

### Celeste

**VERIFIED**

[Celeste](https://www.mattmakesgames.com/articles/celeste_and_forgiveness/index.html)는 Coyote Time, Jump Buffer, Corner Correction 등 플레이어의 의도를 약간 유리하게 해석하는 여러 보정 방식을 사용한다.

### TRANSFER

2-1에서는 이 철학을 시스템 추가가 아니라 Level Geometry로 번역한다.

```text
Wide Landing
+
Nearby Recovery
+
Fast Re-Attempt
```

실수했을 때 `DEATH`보다 `MOMENTUM LOSS`가 먼저 발생해야 한다.

### N / Metanet

**VERIFIED**

[Metanet](https://www.metanetsoftware.com/technique/tutorialsbak.html)은 N 개발 과정에서 보다 현실적인 충돌 반응도 시험했지만 단순한 모델 쪽이 게임에서 더 재미있었다고 설명한다.

### TRANSFER

Worker District가 시각적으로 복잡해진다고 해서 Collision까지 복잡하게 만들지 않는다.

```text
VISUAL COMPLEXITY
≠
PHYSICAL COMPLEXITY
```

## 1. 한 줄 정의

Sector 01의 차갑고 산업적인 Maintenance 시설을 빠져나온 플레이어가 처음으로 **사람이 살았던 수직 노동자 주거구역**을 Rope로 올라가며, 전투 없이 생활 흔적과 대피 흔적을 발견하는 저압 전환 Stage.

## 2. 전체 게임에서의 역할

Sector 01은 플레이어에게 Rope 문법을 가르쳤다. 현재 최신 Sector 01 기준은:

```text
1-1 Basic Rope
1-2 Airborne Re-Attach
1-3 Security Pressure
1-4 Foundation Augment
1-5 Build Expression
1-6 Wind
1-7 System Combination
1-8 Final Synthesis
```

이다. 2-1에서 이 학습곡선을 다시 시작하면 안 된다. 2-1의 변화는 `MECHANICAL CHANGE`가 아니라 `SPATIAL + EMOTIONAL CHANGE`다. 즉:

```text
INDUSTRIAL INFRASTRUCTURE
↓
LIVED-IN INFRASTRUCTURE
```

### Stage Emotional Curve

```text
1-8
HIGH PRESSURE
Containment
Shutdown
Security
  ↓
2-1 ENTRY
RELIEF
  ↓
RESIDENTIAL REVEAL
CURIOSITY
  ↓
LIVED-IN TRACES
UNEASE
  ↓
COMMUNITY NOTICE
QUESTION
  ↓
2-2
MOVING SECURITY PRESSURE
```

## 3. Story 역할

2-1에서 Player가 알아야 할 것은 정확히 세 가지다.

```text
1. 여기는 사람들이 살던 곳이다.
2. 대피 절차가 진행됐다.
3. 현재는 아무도 보이지 않는다.
```

Player가 아직 알아서는 안 되는 것:

```text
Group C가 버려졌다.
Group A/B가 상류층이다.
기업이 의도적으로 노동자를 희생했다.
누군가 Human Authorization으로 대피를 막았다.
사고가 기업에 의해 조작됐다.
```

### Story Question

Sector 02 시작 질문:

> **사람들은 어디 갔지?**

2-1에서는 이 질문에 답하지 않는다. 질문만 만든다.

## 4. 공간 콘셉트

**VERTICAL RESIDENTIAL COURTYARD**

Worker Block 12는 일반적인 현대 Apartment Complex가 아니다. 핵심: `VERTICAL` · `DENSE` · `MODULAR` · `WORN` · `LIVED-IN`

#### 공간 구조

좌우에 Worker Housing Module이 쌓이고, 가운데에는 긴 Residential Courtyard Void가 열린다.

```text
LEFT HOUSING STACK
█████ BALCONY
█████ LAUNDRY
█████ DOOR
█████ PIPE
        │
        │
        │
        │
        │
      COURTYARD
        │
        │
        │
                    █████ HOUSING STACK
                    █████ CANTEEN
                    █████ BALCONY
                    █████ SERVICE CORE
```

Maintenance의 Shaft와 유사한 수직성을 유지하지만, 그 수직성이 이제 `기계 관리` → `사람의 생활`을 위해 만들어진 공간으로 보인다.

## 5. Pixel / Grid 기준

### HYPOTHESIS — BLOCKOUT

```text
BASE GRID     32 px
WIDTH         1152 px (36 tiles)
HEIGHT        1024 px (32 tiles)
X             -576 ~ +576
Y                0 ~ -1024
```

이 값은 확정 월드 크기가 아니다. Blockout 시작값이다.

### 기존 Rope 기준 — VERIFIED

2026-08-14 `main` 기준 (`src/game/config.js`):

```text
Player Radius             15
Gravity                   1250
Max Horizontal Speed      360
Jump Speed                440
Rope Max Attach Distance  440
Attach Buffer             0.1 sec
Swing Impulse             780
```

하지만 최신 Sector 01 기획에서는 **1-1과 1-2를 `swingImpulse = 0`에서도 안정적으로 통과 가능하게 검증**하도록 명시하고 있다. 따라서 2-1 역시 동일 원칙을 이어간다.

### Mandatory Grapple Range

권장: `220–320 px` 목표. 필수 Grapple에서 `400–440 px` 사거리 끝을 시험하지 않는다.

## 6. 전체 맵 구조

```text
Y -1024
┌──────────────────────────────────────────────┐
│                                   → 2-2      │
│                            PATROL WALKWAY    │
│                            ██████████████    │
│                                    ▲         │
│                               EXIT DECK      │
│                                    ▲         │
│                         EXTERIOR STAIR       │
│                                    ▲         │
│         P4 — CENTRAL ASSEMBLY WALKWAY       │
│       ───────────────────────────────        │
│       COMMUNITY NOTICE                      │
│                                             │
│                 ● G4                        │
│                ╱                            │
│               ╱                             │
│     P3 ─────────────                        │
│     LEFT BALCONY                            │
│                                             │
│             R3 ─────────                    │
│                         ● G3                │
│                          ╲                  │
│                           ╲                 │
│                           P2 ─────────────   │
│                           RIGHT BALCONY      │
│                                             │
│                  R2 ───────────             │
│                         ● G2                │
│                        ╱                    │
│                       ╱                     │
│       P1 ───────────────────                │
│       COMMUNITY WALKWAY                     │
│                                             │
│              ● G1                           │
│                                             │
│       R1 ─────────────                      │
│                                             │
│ P0 ENTRY DECK                               │
│ ─────────────────                           │
│ ← SECTOR 02 ENTRY                           │
└──────────────────────────────────────────────┘
Y 0
```

## 7. Zone 구성

### ZONE A — RESIDENTIAL THRESHOLD

`Y 0 ~ -160`

Role: Worker District Reveal. Gameplay: 거의 없음. Player가 걸어 들어가며 처음 주변을 볼 시간을 준다.

### ZONE B — LOWER COMMUNITY WALKWAY

`Y -160 ~ -336`

Role: 기본 Rope 복습. 생활 흔적 첫 노출.

### ZONE C — CENTRAL COURTYARD

`Y -336 ~ -704`

Role: Stage의 핵심 공간. Safe Route와 Flow Route가 처음 자연스럽게 분리된다.

### ZONE D — UPPER HOUSING STACK

`Y -704 ~ -896`

Role: 짧은 마지막 Rope Flow. Residential scale을 위쪽으로 확장.

### ZONE E — ASSEMBLY WALKWAY

`Y -896 ~ -1024`

Role: Story Question 확정. 2-2 연결.

## 8. 좌표 / 오브젝트

### HYPOTHESIS — BLOCKOUT CANDIDATE

다음 좌표는 **확정 사양이 아니다.** 첫 Graybox 제작용이다.

| ID | X | Y | Width | 역할 |
|---|---:|---:|---:|---|
| P0 | -416~-192 | 0 | 224 | Entry |
| R1 | -352~-128 | -144 | 224 | Recovery |
| G1 | -288~-160 | -192 | 128 | Grapple-readable beam |
| P1 | -192~+128 | -288 | 320 | Community Walkway |
| R2 | 0~+224 | -400 | 224 | Recovery |
| G2 | +128~+256 | -448 | 128 | Right Pivot |
| P2 | +192~+480 | -544 | 288 | Right Balcony |
| R3 | -128~+96 | -592 | 224 | Recovery |
| G3 | 0~+128 | -640 | 128 | Left Pivot |
| P3 | -448~-160 | -736 | 288 | Left Balcony |
| R4 | -96~+128 | -784 | 224 | Recovery |
| G4 | -160~-32 | -832 | 128 | Final Pivot |
| P4 | +32~+352 | -928 | 320 | Assembly Walkway |
| Exit | +288~+544 | -992 | 256 | 2-2 Transition |

### Grapple Distance Intent

대표 접근거리는 대략 다음 범위로 시작한다. 모두 440px Max Range를 시험하지 않는다.

```text
P0 → G1   ~250 px
P1 → G2   ~275 px
P2 → G3   ~290 px
P3 → G4   ~235 px
```

### G1–G4의 의미

> **중요**
> G1–G4는 전용 Anchor Object가 아니다.

현재 구현은 전용 Anchor만 탐색하는 방식이 아니라 Aim 근처의 world surface를 대상으로 attachment를 찾는다. G1–G4는 **"이 표면을 잡으면 좋은 Swing이 나온다."**를 Player에게 시각적으로 암시하는 Level Design Landmark다. Cyan Eyelet / Cyan Edge Lighting을 사용할 수 있다.

## 9. Safe Route

Safe Route는:

```text
P0 → G1 → P1 → G2 → P2 → G3 → P3 → G4 → P4 → EXIT
```

### Safe Route 핵심 조건

#### 1. `swingImpulse = 0` 통과 가능

Player는 Jump / Horizontal Momentum / Gravity / Attach / Release만으로 Safe Route를 통과할 수 있어야 한다.

#### 2. Landing이 넓다

Safe Platform: `256–320 px` 권장.

#### 3. Two-Player Safe

현재 프로젝트는 실제 2인 동기화와 플레이어 간 몸체 충돌을 포함하는 멀티플레이 기준선을 가지고 있다. 따라서 Main Safe Platform에서 Player A + Player B가 동시에 착지해도 통행을 방해하지 않아야 한다. Main Landing은 최소 `256 px`를 우선 사용한다.

#### 4. Choke Point 없음

필수 진행에서 `64px 폭 단독 착지` 같은 지점을 사용하지 않는다.

## 10. Flow Route

2-1의 Skill Expression은 새로운 기술이 아니다. Sector 01에서 익힌 `Momentum` / `Release` / `Airborne Re-Attach`를 사용한다.

### FLOW A

P1에서:

```text
G2 → Swing / Release → P2에 Landing하지 않음 → G3 Airborne Re-Attach → P3
```

가능. 즉 `P2 SKIP`을 허용한다.

### FLOW B

P3에서:

```text
G4 → 높은 Release → P4 중앙부
```

로 빠르게 진입.

### FLOW PRINCIPLE

[Rusted Moss 개발자 인터뷰](https://blog.playstation.com/?p=393354)식 원리는 `같은 문제 + 여러 움직임`으로 사용한다. 2-1은 `SAFE ROUTE`와 `FLOW ROUTE`가 다른 Stage가 아니다. **같은 공간을 다르게 읽는 것**이다.

## 11. Build Route

### NO DEDICATED BUILD ROUTE

REV 1에서 가장 중요한 수정점. 2-1에는 별도의 `IMPULSE ROUTE` / `RELAY ROUTE` / `SHEAR ROUTE`를 만들지 않는다. 이 구조는 이미 1-5에서 충분히 검증하는 역할을 가진다. 1-5의 최신 기준 역시 하나의 Challenge 안에서 Build별 최적해가 달라져야 하며 Augment별 전용 Room 구조를 피하도록 명시한다.

### Passive Build Expression Only

#### IMPULSE COIL

자연스럽게 Larger Arc / Landing Skip / Faster Clear 가능.

#### RELAY LINK

자연스럽게 G2 → G3, G3 → G4 Airborne Chain이 편해진다.

#### SHEAR CURRENT

Enemy가 없으므로 공격 이점을 만들지 않는다. 그리고 이를 보상하기 위해 `Shear 전용 장애물`을 억지로 넣지 않는다.

#### 핵심

2-1의 목적은 `BUILD BALANCE TEST`가 아니다. `WORLD TRANSITION`이다.

## 12. Recovery

Difficulty ★의 핵심은 Recovery다.

### R1

G1 실패. `R1 → G1` 즉시 재시도. 목표 실패 비용: `2–4 sec`

### R2

G2 / P2 실패. Canteen Awning 또는 Community Service Deck 형태. `R2 → G2` 직접 복귀.

### R3

G3 / P3 실패. Utility Balcony 형태.

### R4

G4 / P4 실패. Upper Housing Service Walkway.

### Recovery Rule

```text
NO SPIKE
NO DAMAGE FLOOR
NO FORCED RESET
NO START RETURN
```

### Two-Player Recovery

Recovery Platform은 최소 `192–224 px` 권장. 한 Player가 실패해 떨어져도 다른 Player와 부딪혀 Retry가 불가능해지는 폭은 피한다.

## 13. Enemy / Hazard

```text
ENEMY          NONE
DRONE          NONE
TURRET         NONE
PROJECTILE     NONE
WIND           NONE
TRAP           NONE
ROPE CUT       NONE
DAMAGE FLOOR   NONE
```

#### 이유

2-2에서 `STATIC SECURITY` → `MOVING SECURITY` 전환을 해야 한다. 2-1에 Drone을 보이면 2-2의 역할이 약해진다.

## 14. Camera

**VERIFIED** — 2026-08-14 `main` 기준 (`src/game/GameApp.js`): 현재 Desktop Zoom은 `1`, Mobile은 `0.72`이며, 카메라는 플레이어가 화면 가로 약 38%, 세로 약 58% 지점에 오도록 부드럽게 추적한다. 2-1에서는 새로운 Camera System을 만들지 않는다.

### Opening Composition

첫 화면에서 최소한 읽혀야 한다.

```text
Player + Sector 01 Exit 일부 + Housing Exterior + Balcony + Laundry + 첫 진행 Surface
```

2초 정도 안에 **"공간이 완전히 바뀌었다."**가 느껴져야 한다.

### Central Courtyard

P1에 도달하면 `Upper Housing + P2 + G2 + 큰 Courtyard Void`가 함께 보이게 배치한다.

### Camera Goal

Maintenance에서는 `SHAFT`가 강조됐다면, Worker District에서는 `VOID BETWEEN HOMES`를 강조한다.

## 15. Story Trigger

### TRIGGER A — BLOCK 12 ENTRY

환경 Sign:

```text
WORKER DISTRICT
BLOCK 12
```

강제 Cutscene 없음.

### TRIGGER B — LIVED-IN TRACE

Zone B–D에서 플레이어가 자연스럽게 발견한다.

#### 사용

Laundry, Closed Housing Door, Worker Locker, Canteen Window, Small Plant, Waiting Chair, Utility Cart

#### 사용하지 않음

Blood, Corpse, Broken family photo, Emergency scream, Human silhouette, Explicit abandoned child imagery

2-1에서 너무 강한 비극을 확정하지 않는다.

### TRIGGER C — COMMUNITY NOTICE

P4에 배치.

> `COMMUNITY NOTICE`
>
> `EVACUATION GROUP C`
>
> `ASSEMBLY: BLOCK 12 CENTRAL WALKWAY`
>
> `STATUS: WAIT FOR INSTRUCTION`

### Multiplayer Trigger

Story 진행을 `"두 Player가 동시에 Trigger 안에 있어야 함"`으로 만들지 않는다. 각 Player가 P4를 통과할 때 자기 Client에서 읽을 수 있어야 한다. 전체 Region 진행은 Notice interaction 버튼을 요구하지 않는다.

### Why

Notice는 `PUZZLE KEY`가 아니다. `ENVIRONMENTAL STORY BEAT`다.

## 16. Pixel Art Asset Spec

| ASSET | 규격 | 비고 |
|---|---:|---|
| Environment Base | 32×32 | Tile 중심 |
| Apartment Wall | 32×32 | tile |
| Balcony Floor | 96×32 / 128×32 | Module 조합 |
| Balcony Rail | 32×16 | Decoration, Collision 금지 권장 |
| Housing Door | 32×64 | |
| Exterior Stair | 32×16 | step module |
| Canteen Window | 96×64 / 128×64 | |
| Laundry Line | 64×16 / 96×16 | |
| Laundry Cloth | 16×16 / 16×24 | |
| Plant | 16×24 / 16×32 | |
| Chair | 24×24 / 32×32 | |
| Utility Pipe | 32×32 junction / 64×16 straight | |
| Grapple Readability Cue | 24×24 | Cyan structural eyelet / maintenance marking, 실제 Anchor Object 아님 |
| Community Notice | 64×48 / 96×64 | Readable text는 근거리에서 별도 표시 |

## 17. Background

### Production Decision

#### 2-1 전용 Full Background는 새로 생성하지 않는다

이미 생성한 Sector 02 Worker District 방향 이미지를 `FAR + MID` Visual Reference로 사용한다. 2-1에서 새로 필요한 것은 `NEAR RESIDENTIAL LANGUAGE`이다.

### FAR

Corporate Mega-Structure, Worker Housing Towers, Distant bridge layers, Vertical city scale. 색: `Dark Navy` · `Charcoal` · `Desaturated Blue`

### MID

Housing Module Stack, Exterior corridor, Community infrastructure, Service Core, Canteen facade, Balcony rhythm

### NEAR

Laundry, Door, Plant, Chair, Pipe, Sign, worn floor edge

### Visual Hierarchy

```text
PLAYER / ROPE > GAMEPLAY SURFACE > NEAR DECORATION > MID WORLD > FAR WORLD
```

### Palette

- Base: `Dark Navy` · `Charcoal` · `Gray`
- Residential accents: `Muted Warm Yellow` · `Muted Teal` · `Old Fluorescent Green`
- Danger: `Red / Orange`
- Rope / Grapple readability: `Cyan`
- Player: `Dark silhouette` + `Long Red Scarf`

## 18. Sound / VFX

### Ambient

Maintenance에서 기계음을 없애지는 않는다. 그러나 종류를 바꾼다.

| Maintenance | Worker District |
|---|---|
| Heavy machinery | Ventilation hum |
| Fan | Old fluorescent buzz |
| Pressure | Distant relay |
| Metal | Loose fabric / Housing structure creak / Canteen refrigeration |

### 중요한 부재

사용하지 않는다: Human voice, Conversation, Children, Scream, Cry, Evacuation announcement voice.

Player가 "사람이 없다는 것을 소리로 강요받는 것"보다 **"원래 사람이 있어야 할 공간이 조용한 것"**을 느끼게 한다.

### VFX

subtle fluorescent flicker, laundry sway, tiny dust, occasional status LED, distant lower-grid light loss. 과도한 VFX 금지.

## 19. Implementation Notes

### 19-1. Rope Collision Clutter

현재 Rope Attachment는 world surface를 검사하고 Aim과 가까운 surface를 Attachment 후보로 고른다. 따라서 다음은 기본적으로 Decoration으로 처리한다.

```text
Balcony Rail / Laundry Line / Window Frame / Small Pipe / Chair / Plant / Door Frame / Sign / AC Unit
```

### 19-2. Visual Architecture ≠ Collision Architecture

현재 환경 렌더링 계약 역시 terrain collision과 non-collision decoration을 분리하도록 설계되어 있다. 따라서 `Detailed Housing Art + Simple Traversal Geometry`를 유지한다.

### 19-3. Base Rope Test

Blockout PASS 전에 최소 세 조건을 테스트한다.

```text
PROFILE A   current 780
PROFILE B   reduced base candidate
PROFILE C   0
```

필수 조건: `PROFILE C`에서도 Safe Route가 통과 가능해야 한다. 단, 0 impulse가 최종 Base Rope 값이라는 뜻은 아니다. 최종 감각값은 별도 플레이테스트 대상이다.

### 19-4. `surface.grappleable`

2-1 선행 구현으로 요구하지 않는다. 현재는 `Collision 최소화 + Decoration 분리`로 해결한다. 그러나 Worker District가 복잡해지는 `2-4 RESIDENTIAL STACK` 전에는 다시 검토한다.

### 19-5. Continuous World

현재 프로젝트 기준에서 `2-1`은 별도 월드를 새로 Load하는 Stage가 아니다. 6 Sector × 8 Region은 하나의 붕괴 도시 런 안에서 이어진다. 따라서 `Player Build / HP / Run State / Checkpoint` 등을 2-1 진입 때 초기화하지 않는다.

### 19-6. Multiplayer

Main Platform / Exit / Recovery에 Player 2명이 함께 존재할 수 있어야 한다. 피해야 한다:

- single-file 64px choke
- 한 Player가 서 있으면 다른 Player가 착지 불가능
- Recovery에서 Player collision 때문에 연속 추락
- Story 진행에 두 Player 동시 위치 강제

## 20. Playtest Metrics

| METRIC | 목표 |
|---|---|
| First-Time Clear Time | 70–110 sec (HYPOTHESIS) |
| Skilled Clear | 30–50 sec (HYPOTHESIS) |
| Falls / Recovery (First Run Median) | 0–2 recovery events |
| Retry Time (Main failure 후 재진입) | ≤ 5 sec |
| Navigation Pause | 8 sec 이상 정지하면 조사 |
| Wrong Attach | 평균 1회 미만 / first clear |
| Flow Discovery | 숙련 플레이에서 P2 Skip 등 Landing Skip이 자연스럽게 발견되는지 기록 |

### Multiplayer 기록 항목

Player collision blockage count, simultaneous landing failure, recovery interference, leader/follower gap, story trigger miss

### Story Comprehension

테스트 후 질문: `"여기가 무슨 공간 같았나요?"` — 기대 답변: 노동자들이 살던 주거구역.

질문: `"사람들은 어떻게 된 것 같나요?"`

- 좋은 상태: "대피한 것 같은데 정확히 모르겠다."
- 나쁜 상태: "회사가 C그룹을 일부러 죽였다."

후자가 2-1에서 바로 나온다면 Story Hint가 너무 강하다.

## 21. PASS Criteria

다음이 모두 만족되어야 한다.

#### Gameplay

- Enemy 없음
- New Mechanic 없음
- Safe Route가 `swingImpulse=0`에서 통과 가능
- Max Rope Range에 의존하지 않음
- Frame-perfect Release 없음
- 실패 후 5초 안에 재시도 가능
- 숙련자는 최소 한 Landing Skip 가능
- 특정 Foundation Augment가 필수 아님

#### Multiplayer

- 두 Player가 주요 Landing에 함께 있을 수 있음
- Player collision이 필수 이동을 봉쇄하지 않음
- Recovery에서 서로 방해해 반복 낙하하지 않음

#### Story

- 사람이 살았던 공간임이 읽힘
- 대피 흔적이 읽힘
- 현재 사람이 없다는 것이 읽힘
- 왜 없는지는 확정되지 않음
- Group C의 사회적 의미가 아직 드러나지 않음

#### Graphics

- Maintenance와 Worker District 차이가 첫 화면에서 읽힘
- Player / Rope / Traversal Surface가 Background보다 우선
- Residential Detail이 Grapple Readability를 해치지 않음

## 22. FAIL Conditions

### FAIL — Gameplay

- 780 Impulse가 없으면 필수 구간 불가능
- 400–440px Attach가 반복적으로 필수
- Safe Route가 사실상 Airborne Chain을 강제
- Recovery가 Start Return과 비슷한 비용
- 2-1에서 새 Tutorial Text가 필요

### FAIL — Build

`IMPULSE 전용 길` / `RELAY 전용 길` / `SHEAR 전용 길`처럼 명백히 분리됨.

### FAIL — Multiplayer

- 한 Player가 발판을 점유하면 다른 Player가 못 올라감
- 한 Player가 먼저 Story Trigger를 지나가면 다른 Player가 Story를 볼 수 없음
- 좁은 Recovery에서 두 Player가 계속 충돌함

### FAIL — Story

Player가 2-1 종료 시 **"Group C는 회사가 버린 노동자 계급이다."**라고 확신할 수 있음.

### FAIL — Visual

- 현대식 넓은 Apartment처럼 보임
- 너무 깨끗함
- Cyberpunk Neon이 과함
- Cyan이 Background 전반에 퍼짐
- Gameplay Surface와 Balcony Decoration이 구분되지 않음

## 23. 개발 구현 우선순위

| 단계 | 내용 |
|---|---|
| P0 — GRAYBOX | `P0–P4`, `G1–G4`, `R1–R4`, `Exit`만 구현. 아트 없음 |
| P1 — ZERO-IMPULSE TEST | `780 / Reduced / 0` 세 Profile에서 플레이. 먼저 Geometry 수정 |
| P2 — TWO-PLAYER TEST | 두 Player가 동시 상승 / 동시 착지 / Recovery / 추월 가능한지 확인 |
| P3 — STORY BLOCKOUT | Block 12 Sign, Community Notice, Exit Transition |
| P4 — RESIDENTIAL DECORATION | Balcony, Laundry, Canteen, Door, Plant, Chair, Pipe — Collision 없이 추가 |
| P5 — FINAL PIXEL ART | 기존 Sector 02 Background Direction 사용. Near Residential Assets 교체 |
| P6 — AUDIO / VFX | Gameplay PASS 후 적용 |

## 24. Stage Data Concept

> **HYPOTHESIS** — 현재 Runtime 확정 Schema가 아니다.

```js
{
    id: "sector-02-1-worker-block-12",
    sector: 2,
    region: 1,
    role: "worker-district-introduction",
    bounds: {
        minX: -576,
        maxX: 576,
        minY: -1024,
        maxY: 0
    },
    playerEntry: {
        x: -448,
        y: -32
    },
    gameplay: {
        enemies: [],
        hazards: [],
        newMechanic: null,
        newAugment: null
    },
    landmarks: [
        "G1",
        "G2",
        "G3",
        "G4"
    ],
    story: [
        { id: "block-12-entry" },
        { id: "community-notice-group-c" }
    ],
    exit: {
        id: "to-sector-02-2",
        nextRegion: "sector-02-2-patrol-walkway"
    }
}
```

## 25. 아트 담당자 전달문

### WORKER BLOCK 12

2-1에서 가장 중요한 이미지:

> **거대한 수직 기업도시 속, 작고 낡은 노동자 주거공간.**

사람은 그리지 않는다. 시체도 그리지 않는다.

#### 생활 흔적 — 필수 우선순위

1. Apartment Exterior
2. Balcony
3. Laundry
4. Canteen Window
5. Housing Door
6. Exterior Stair
7. Utility Pipe
8. Small Plant
9. Waiting Chair
10. Community Notice

#### 분위기

`사용된 공간, 하지만 현재 비어 있음`이지 `폐허가 된 학살 현장`이 아니다.

#### 기존 Background

Sector 02 전체 Worker District용으로 만든 Background를 `Far / Mid Direction`으로 유지한다. 2-1 전용 Full Background 신규 제작은 하지 않는다. 이번 핵심 제작은 `Near Residential Layer`다.

#### 색

- `Dark Navy` · `Charcoal` · `Gray` + `Muted Warm Yellow` · `Muted Teal` · `Old Fluorescent Green`
- Player: `Dark / Charcoal` + `Long Red Scarf`
- Rope / Grapple cue: `Cyan`
- Danger: `Red / Orange`

## 26. 개발자 최종 전달 요약

### SECTOR 02-1 `WORKER BLOCK 12`

#### 역할

`MAINTENANCE → WORKER DISTRICT` 세계 전환.

#### 절대 넣지 않음

Enemy, Drone, Turret, Wind, Trap, New Mechanic, New Augment, New Input, New Rope Mode

#### 핵심 플레이

기존 Rope + 새 Residential Geometry + Safe / Flow / Recovery

#### Core Route

```text
P0 → G1 → P1 → G2 → P2 → G3 → P3 → G4 → P4 → 2-2
```

#### Skilled Route

`P1 → G2 → airborne G3 → P3` 등 Landing Skip 허용.

#### Rope Requirement

필수 Route는 `swingImpulse = 0`에서도 가능해야 한다. 현재 `780`에 맞춰 맵을 만들지 않는다.

#### Story

마지막에 Player가 알아야 하는 것: 사람들이 여기 살았다 / 대피 준비를 했다 / 지금은 아무도 없다. 모르는 것: 왜 C만 남았는가.

## OPEN QUESTIONS — NON-BLOCKING

### 1. Sector 01 Boss → Sector 02 Entry

현재 이전 기획에서도 Sector 01 Boss가 `1-8 / Checkpoint / 2-1` 사이 정확히 어디에 배치될지는 아직 열려 있다. 따라서 2-1은 Boss Transition을 소유하지 않는다. `SECTOR 02 ENTRY SOCKET`만 제공한다.

### 2. Final Base Rope Impulse

2-1 설계는 `0`에서도 통과하도록 한다. 그러나 최종 Base Rope 수치가 `0 / Reduced Value / Other Value` 중 무엇인지는 별도 Rope 플레이테스트에서 확정한다. Stage Geometry가 그 결정을 강제하지 않는다.

### 3. `surface.grappleable`

2-1 구현의 선행 조건은 아니다. 다만 Worker District의 Visual Geometry가 크게 늘어나는 **2-4 RESIDENTIAL STACK 이전**에 실제 Wrong Attach 데이터를 보고 도입 여부를 재평가한다.

---

SECTOR 02-1 / WORKER BLOCK 12 — REV 2.0
