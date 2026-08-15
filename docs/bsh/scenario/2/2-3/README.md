# SECTOR 02-3 — RESIDENTIAL SERVICE NODE

*BLOCKOUT CANDIDATE · REV 1.0*

◀ PREV — [SECTOR 02-2 / PATROL WALKWAY](../2-2/README.md) · NEXT — [SECTOR 02-4 / RESIDENTIAL STACK](../2-4/README.md) ▶

`SECTOR 02 WORKER DISTRICT` · `STAGE 03` · `FIRST SPECIALIZATION` · `REST / REWARD`

| 항목 | 기준 |
|---|---|
| Status | HYPOTHESIS — BLOCKOUT CANDIDATE |
| Difficulty | REST / REWARD |
| Expected First Playtime | 60–100 sec |
| Expected Skilled Clear | 30–50 sec |
| Enemy | NONE |
| Damage Hazard | NONE |
| Wind | NONE |
| New Mechanic | First Rope Specialization Selection |
| New Input | NONE |
| Required Previous Build | 1 Foundation Augment |
| Primary Role | FOUNDATION → SPECIALIZATION |
| Space | Residential Service / Utility Calibration Room |

---

## 0. 기획 기준

### LOCKED

2-3은 다음 조건을 지킨다.

- Sector 02의 첫 Specialization Node
- 1-4에서 고른 Foundation Augment가 그대로 유지됨
- Rope는 교체하지 않음
- Rope Mode를 추가하지 않음
- 새 조작 버튼을 추가하지 않음
- Specialization은 기존 Rope 행동을 더 구체적으로 변화시켜야 함
- Enemy 없음
- Patrol Drone 없음
- Wind 없음
- Damage Hazard 없음
- 선택 직후 짧은 Calibration 공간 제공
- 모든 Foundation 계열이 Stage를 통과 가능
- 살아 있는 NPC 없음
- Group C의 진실 공개 없음
- 2-4 RESIDENTIAL STACK에서 Specialization + Multi-Route를 본격 검증

### SYSTEM GATE

다음은 아직 LOCKED가 아니다.

- IMPULSE 계열 Specialization의 실제 이름
- RELAY 계열 Specialization의 실제 이름
- SHEAR 계열 Specialization의 실제 이름
- 각 Specialization의 수치
- 각 Foundation당 몇 개의 후보를 제공할지
- Specialization 선택 Pool의 Random / Weighted / Fixed 규칙

따라서 이 문서는 **Specialization Stage 구조와 선택 원칙**을 설계하며,
실제 Augment 카탈로그를 임의로 확정하지 않는다.

---

## 0-1. Reference / Design Transfer

### 기존 1-4 MAINTENANCE NODE

**VERIFIED — current project document**

1-4는 첫 Foundation 선택을 담당한다.

핵심 구조:

```text
ONE ROPE
→
GROWING TOOL
```

그리고 첫 선택은 항상:

```text
IMPULSE COIL
RELAY LINK
SHEAR CURRENT
```

세 Foundation을 고정 제공한다.

후속 Node에서는:

```text
Weighted Random
Prerequisite
Specialization
Hybrid
```

등을 적용할 수 있도록 이미 설계되어 있다.

### TRANSFER

2-3은 1-4를 반복하지 않는다.

1-4의 질문:

> "이번 Run에서 Rope를 어떤 방향으로 쓸 것인가?"

2-3의 질문:

> "내가 이미 고른 방향을 어떤 식으로 더 깊게 밀어붙일 것인가?"

따라서:

```text
FOUNDATION
=
PLAYSTYLE DIRECTION

SPECIALIZATION
=
PLAYSTYLE COMMITMENT
```

로 구분한다.

---

### Rusted Moss 원리

하나의 Grapple을 끝까지 중심에 두고,
후속 능력은 Grapple의 기존 행동과 시너지를 만들어야 한다.

### TRANSFER

Specialization은:

```text
새 버튼
새 무기
새 Rope Mode
```

가 아니라:

```text
기존 Attach
기존 Swing
기존 Release
기존 Re-Attach
기존 Rope Geometry
```

중 하나 이상의 의미를 강화해야 한다.

---

## 1. 한 줄 정의

2-2의 첫 Patrol Drone을 통과한 플레이어가 비어 있는 Worker Housing의 공동 Service Room에 들어가,
1-4에서 선택한 Foundation Augment를 **처음으로 한 단계 더 전문화**하고,
짧은 안전 Calibration을 거쳐 2-4의 본격적인 Multi-Route 주거 스택으로 진입하는 휴식·보상 Stage.

---

## 2. 전체 게임에서의 역할

현재 성장 리듬:

```text
1-1
Basic Rope

↓

1-2
Rope Chaining

↓

1-3
Enemy Pressure

↓

1-4
FOUNDATION

↓

1-5
Foundation Expression

↓

1-6
Wind

↓

1-7
Combination

↓

1-8
Sector Synthesis

↓

2-1
Worker District Transition

↓

2-2
Moving Threat

↓

2-3
SPECIALIZATION

↓

2-4
Specialization + Multi-Route Expression
```

2-3은 전투 Stage가 아니다.

리듬:

```text
TENSION
2-2 Patrol Drone

↓

RELIEF
2-3 Safe Service Room

↓

REWARD
Specialization

↓

ANTICIPATION
Short Calibration

↓

EXPERIMENT
2-4 Residential Stack
```

---

## 3. Story 역할

2-3의 Story 역할은 작다.

핵심:

> Worker District 주민들도 이 도시의 Maintenance Infrastructure에 의존하며 살았다.

를 공간으로 전달한다.

### 보여줄 수 있는 것

- 공동 Utility Room
- Worker Equipment Locker
- Tool Charging Rack
- Residential Power Distribution
- Emergency Service Terminal
- Maintenance Bench
- 오래 사용한 개인 작업 장갑 / 컵 / 라벨
- 비어 있는 대기 의자

### 아직 보여주지 않는 것

- Group C가 의도적으로 버려졌다는 증거
- Human Authorization 기록
- Corporate Executive Order
- 계급별 Evacuation Priority 설명
- 사망자
- 살아 있는 주민
- 직접적인 감정 기록 / 유언

### Story Beat

2-1:

> 사람들이 여기 살았다.

2-2:

> 그런데 경비 시스템은 계속 작동한다.

2-3:

> 이곳은 대피 직전까지 정상적인 생활·정비 공간으로 사용된 것 같다.

정도까지.

---

## 4. 공간 콘셉트

**RESIDENTIAL SERVICE / UTILITY CALIBRATION ROOM**

1-4 Maintenance Node와 기능적으로 연결되지만,
공간 언어는 달라야 한다.

### 1-4

```text
INDUSTRIAL
CORPORATE
CENTRALIZED
CLEANER
MAINTENANCE FACILITY
```

### 2-3

```text
RESIDENTIAL
SHARED
PATCHED
WORN
LOCAL SERVICE ROOM
```

즉 동일한 기업 설비가 Worker District에서:

> 더 오래되고, 더 많이 수리되고, 생활공간에 끼워 넣어진 형태

로 보인다.

---

## 5. Pixel / Grid 기준

### VERIFIED — 2026-08-14 / current `main`

현재 Runtime 기준:

```text
Player Radius            15
Gravity                  1250
Max Horizontal Speed     360
Jump Speed               440
Rope Max Attach Distance 400
Attach Buffer            0.1 sec
Swing Impulse            780
Camera Desktop Zoom      1
Camera Mobile Zoom       0.72
```

### VERIFIED — Current Reward Selection Input

현재 `FoundationRewardSelection` 구현은:

```text
Horizontal Input
→ Choice 이동

Vertical Up
→ Confirm
```

구조를 사용한다.

2-3 Specialization UI는 새 입력 체계를 만들기보다
이 공용 Selection Interaction을 재사용하는 것을 우선 권장한다.

### HYPOTHESIS — BLOCKOUT

```text
GRID        32 px

WIDTH       960 px
            30 tiles

HEIGHT      768 px
            24 tiles
```

REST Stage이므로 2-1 / 2-2보다 작게 시작한다.

---

## 6. 전체 맵 구조

```text
Y -768

┌──────────────────────────────────────────────┐
│                                  EXIT → 2-4  │
│                            █████████████     │
│                                   ▲          │
│                              SHORT TEST      │
│                                   ▲          │
│                      G2 ●         │          │
│                        ╲          │          │
│                         ╲      P3 ───────    │
│                                              │
│                 SPECIALIZATION               │
│                    NODE                      │
│                ╔══════════╗                  │
│                ║          ║                  │
│                ╚══════════╝                  │
│                     ▲                        │
│             P2 ─────────────────             │
│               SAFE CHOICE DECK               │
│                     ▲                        │
│                                              │
│       LOCKER / BENCH / UTILITY WALL          │
│                                              │
│ P1 ─────────────────────────                 │
│                                              │
│ P0 ← ENTRY FROM 2-2                          │
└──────────────────────────────────────────────┘

Y 0
```

---

## 7. Zone 구성

### ZONE A — DECOMPRESSION

```text
Y 0 ~ -192
```

2-2 Drone Encounter가 완전히 끝나는 구간.

Enemy LOS 없음.

Projectile 없음.

Player가 이동을 멈춰도 손해가 없다.

### ZONE B — RESIDENTIAL SERVICE ROOM

```text
Y -192 ~ -416
```

생활 + Utility 흔적.

Specialization Node를 처음 발견.

### ZONE C — SPECIALIZATION SELECTION

```text
Y -416 ~ -544
```

안전한 Choice Zone.

선택 중:

- Enemy 없음
- Hazard 없음
- Wind 없음
- 낙사 없음

### ZONE D — CALIBRATION

```text
Y -544 ~ -704
```

선택 직후 즉시 변화 확인.

새 mechanic tutorial이 아니라
현재 Rope를 한두 번 사용해보는 짧은 공간.

### ZONE E — 2-4 APPROACH

```text
Y -704 ~ -768
```

2-4 RESIDENTIAL STACK Preview.

---

## 8. 좌표 / 오브젝트

### HYPOTHESIS — BLOCKOUT CANDIDATE

| ID | X | Y | Width | 역할 |
|---|---:|---:|---:|---|
| P0 | -416~-160 | 0 | 256 | Entry |
| P1 | -352~+32 | -160 | 384 | Decompression Deck |
| P2 | -224~+224 | -384 | 448 | Choice Deck |
| Node | -64~+64 | -416 | 128 | Specialization Node |
| G1 | +128~+256 | -512 | 128 | Calibration Pivot |
| R1 | -32~+224 | -576 | 256 | Recovery |
| G2 | -96~+32 | -608 | 128 | Final Calibration Pivot |
| P3 | +96~+384 | -672 | 288 | Exit Landing |
| Exit | +160~+448 | -736 | 288 | To 2-4 |

### Geometry Rule

Node 주변 192px 이상은:

```text
FLAT
SAFE
NON-COMBAT
```

으로 유지.

Selection UI를 보다가 떨어지는 일이 없어야 한다.

---

## 9. Safe Route

```text
P0
→ P1
→ P2
→ Node
→ Specialization Select
→ G1
→ R1 / P3
→ G2
→ P3
→ EXIT
```

핵심:

2-3의 이동 자체는 어려우면 안 된다.

Safe Route는:

```text
swingImpulse = 0
```

에서도 안정적으로 통과 가능해야 한다.

---

## 10. Flow Route

2-3의 Flow Route는 Challenge가 아니다.

숙련자는 Calibration에서:

```text
Node
→ G1
→ Release
→ G2 Re-Attach
→ P3
```

를 한 흐름으로 연결할 수 있다.

그러나 이를 성공해야 Specialization 효과를 이해할 수 있는 구조로 만들지 않는다.

### 목적

```text
"내 Rope가 달라졌다."
```

를 짧게 느끼는 것.

```text
"새 시험을 통과했다."
```

가 아니다.

---

## 11. Build / Specialization Route

### 핵심 원칙

별도의 Foundation 전용 Room을 만들지 않는다.

```text
IMPULSE ROOM
RELAY ROOM
SHEAR ROOM
```

금지.

대신 같은 Calibration 공간을
각 Build가 조금 다르게 느끼게 한다.

### IMPULSE FOUNDATION 보유자

Specialization 이후 기대하는 변화:

```text
Momentum
Release Timing
Arc Commitment
```

중 하나가 더 분명해져야 한다.

### RELAY FOUNDATION 보유자

Specialization 이후 기대하는 변화:

```text
Re-Attach
Chain Rhythm
Airborne Continuity
```

중 하나가 더 분명해져야 한다.

### SHEAR FOUNDATION 보유자

Specialization 이후 기대하는 변화:

```text
Rope Geometry
Line Placement
Offensive Timing
```

중 하나가 더 분명해져야 한다.

### 중요

2-3에는 Enemy가 없으므로
SHEAR 계열의 공격 효과를 억지로 시험시키지 않는다.

SHEAR의 실제 Combat Specialization 검증은
2-4 이후 Drone이 다시 등장하는 구간에서 수행한다.

---

## 12. Recovery

2-3의 실패 비용은 거의 없어야 한다.

### Calibration Miss

G1 / G2를 놓치면:

```text
R1
```

또는 Choice Deck 하단의 넓은 Recovery로 착지.

목표:

```text
재시도 ≤ 3 sec
```

### 금지

- Damage Floor
- Spike
- Start Return
- Node 재선택 강제
- Specialization 손실
- Selection 재오픈

선택은 확정 후 Run State에 유지된다.

---

## 13. Enemy / Hazard

```text
ENEMY          NONE
PATROL DRONE   NONE
TURRET         NONE
PROJECTILE     NONE
WIND           NONE
TRAP           NONE
ROPE CUT       NONE
DAMAGE FLOOR   NONE
```

### 이유

2-2에서 새 Moving Threat를 학습했다.

2-3의 역할은:

```text
PRESSURE
→
REWARD
```

전환이다.

2-3에 적을 넣으면
Specialization의 첫 인상이 전투 압박과 섞인다.

---

## 14. Camera

### VERIFIED

현재 Camera는 Player가 화면 기준 대략:

```text
38% from left
58% from top
```

위치에 오도록 추적한다.

### Node Composition

P2 Choice Deck 진입 시:

- Player
- Node
- 3개 또는 현재 확정된 Choice UI
- Exit 방향 일부

가 읽혀야 한다.

### Custom Camera

필요 없음.

Node가 큰 공간의 중앙 Landmark로 보이도록
Level Composition으로 해결한다.

---

## 15. Story Trigger

### TRIGGER A — SERVICE ROOM SIGN

```text
RESIDENTIAL SERVICE
BLOCK 12–14

AUTHORIZED MAINTENANCE
```

### TRIGGER B — NODE DETECTION

Node 접근:

```text
GRAPPLE DEVICE DETECTED

EMERGENCY CONFIGURATION
ACTIVE
```

1-4와 같은 기업 시스템 언어를 재사용한다.

### TRIGGER C — INSTALLED FOUNDATION

Node가 현재 Run의 Foundation을 인식:

```text
FOUNDATION AUGMENT
DETECTED

SPECIALIZATION
AVAILABLE
```

### 중요

실제 Specialization 이름은
Augment Catalog가 확정되기 전까지 Placeholder로 사용한다.

예:

```text
SPECIALIZATION A
SPECIALIZATION B
SPECIALIZATION C
```

개발 Mock에서만 허용.

최종 아트/UI에는 사용하지 않는다.

---

## 16. Pixel Art Asset Spec

### Residential Service Node

권장 Canvas:

```text
64×64
or
96×96
```

1-4 Node보다:

- 작음
- 오래됨
- 벽에 통합됨
- 수리 흔적 있음

### Node Color

Base:

```text
Dark Steel
Old Gray
Muted Green
```

Active UI:

```text
Limited Cyan
```

Cyan은 Rope와 경쟁하지 않게 제한.

### Service Props

#### Worker Locker

```text
32×64
```

#### Maintenance Bench

```text
64×32
or
96×32
```

#### Charging Rack

```text
64×64
```

#### Utility Panel

```text
32×32
64×32
```

#### Waiting Chair

```text
24×24
32×32
```

#### Personal Mug / Gloves

```text
8×8
16×16
```

작은 생활 흔적.

---

## 17. Background

2-3도 Sector 02 공통 Far / Mid Worker District Background를 유지한다.

새 Full Background 생성 불필요.

### Near Layer

2-3에서는:

```text
Utility Wall
Service Pipe
Maintenance Bench
Locker
Cable Rack
Power Distribution Panel
Residential Sign
```

중심.

### 공간 느낌

```text
Corporate Maintenance Technology
+
Worker District Improvisation
```

가 동시에 보여야 한다.

너무 깨끗하면 안 된다.

너무 폐허처럼 망가져도 안 된다.

---

## 18. Sound / VFX

### Ambient

- low electrical transformer hum
- weak fluorescent buzz
- distant residential ventilation
- occasional relay click

### Node Idle

아주 약한:

```text
electrical pulse
```

### Node Activation

1-4와 같은 System Family를 느낄 수 있는:

- short boot tone
- scan pulse
- confirmation chime

### Specialization Confirm

Foundation 선택 때보다
조금 더 날카롭고 짧은 Upgrade Sound.

핵심:

```text
새 아이템 획득
```

보다는:

```text
기존 장비가 더 깊게 개조됨
```

을 느끼게 한다.

---

## 19. Implementation Notes

### 19-1. Existing Selection Input Reuse

**VERIFIED — current `main`**

현재 `src/game/rewards/FoundationRewardSelection.js`는:

```text
Horizontal
→ selectedIndex 이동

Vertical Up
→ Confirm
```

Interaction을 이미 제공한다.

2-3 Specialization은 가능한 한
새 Input System을 만들지 말고
이 선택 흐름을 재사용한다.

### 19-2. Foundation과 Specialization을 같은 시스템으로 취급하지 않는다

1-4 Foundation 선택은 authored Node에서만 열리며
2-3 Specialization은 그 방향을 한 단계 심화한다.

기획상 Rope Augment는:

```text
ONE ROPE
→ GROWING TOOL
```

의 핵심 성장 축이다.

따라서 구현에서 UI 입력 흐름이나 Choice Navigation은 재사용할 수 있어도:

```text
Foundation ID
=
Specialization ID
```

처럼 의미 체계를 합쳐버리는 것은 별도 설계 결정 없이 하지 않는다.

### 19-3. Node State

Node는 최소 다음 상태를 필요로 한다.

```text
INACTIVE
AVAILABLE
SELECTING
CONFIRMED
SPENT
```

### 19-4. Multiplayer

각 Player는 자기 Rope Build를 소유한다.

따라서 2인 플레이에서:

- Player A가 먼저 선택 가능
- Player B가 나중에 독립적으로 선택 가능
- A 선택이 B Choice UI를 닫으면 안 됨
- 두 Player가 같은 Node 앞에 있어도 입력 소유권이 섞이면 안 됨

### 19-5. Exit Condition

권장:

```text
각 살아 있는 Player의 Specialization 선택 완료
```

를 Exit 진행 조건으로 삼기보다,
멀티 흐름과 합류 규칙을 고려해 구현 설계를 따로 검토한다.

Stage 문서 차원에서는:

```text
Local Player가 선택을 완료해야 자신의 Exit 진행이 가능
```

정도로 Mock한다.

팀 전체 Gate의 정확한 권위 규칙은
멀티 Stage Progression 구현 시 확정한다.

---

## 20. Playtest Metrics

### 기본

```text
time_to_node
choice_time
selection_changes_before_confirm
calibration_attempts
calibration_falls
time_node_to_exit
```

### Specialization Readability

선택 직후 질문:

> "방금 무엇이 달라졌다고 느꼈나요?"

좋은 상태:

플레이어가 정확한 수치를 모르더라도
자신의 Rope 행동 변화 방향을 설명할 수 있음.

나쁜 상태:

> "데미지가 오른 것 같아요."
> "뭐가 바뀐지 모르겠어요."

### Choice Time

HYPOTHESIS:

```text
10–25 sec
```

첫 선택.

60초 이상 선택 화면에서 고민하면:

- 설명 과다
- 차이 불명확
- 텍스트 과다

후보.

### Calibration

목표:

```text
0–1 fall
≤ 15 sec
```

---

## 21. PASS Criteria

### Gameplay

- 2-2 이후 확실한 휴식 구간
- Enemy / Hazard 없음
- 새 입력 없음
- Foundation이 유지됨
- Specialization이 기존 Foundation 방향을 심화함
- 선택 직후 Rope 변화가 느껴짐
- Calibration은 짧고 안전함
- `swingImpulse = 0`에서도 공간 통과 가능

### System

- 1-4 Foundation Node와 역할이 구분됨
- Specialization이 새 Rope Mode가 아님
- 기존 Choice Input 재사용 가능
- Foundation과 Specialization의 의미 체계가 임의로 합쳐지지 않음

### Multiplayer

- 각 Player가 독립적으로 선택 가능
- 한 Player의 UI가 다른 Player 입력을 먹지 않음
- 선택 중 다른 Player가 밀어서 위험에 빠뜨리지 않음

### Story

- Worker District의 공동 Service Space로 읽힘
- 생활 흔적 존재
- Group C의 진실은 여전히 공개되지 않음

---

## 22. FAIL Conditions

### FAIL — Growth

- Specialization이 단순 +Damage%
- 새 버튼 추가
- 새 Rope Mode 추가
- Foundation과 무관한 랜덤 능력만 제공
- 선택했는데 Rope 사용감 차이가 거의 없음
- 1-4를 그대로 반복하는 느낌

### FAIL — Level

- Selection 중 Enemy가 공격
- 선택 중 낙사 가능
- Calibration 실패가 큰 시간 손실
- 특정 Foundation만 Exit 가능

### FAIL — Story

- Service Node 기록에서 Group C의 운명을 직접 설명
- 주민 시체 / 살아 있는 NPC 등장
- Corporate Intent를 조기 확정

---

## 23. 개발 구현 우선순위

### P0 — NODE FLOW MOCK

```text
ENTRY
→ NODE
→ SELECT
→ CONFIRM
→ EXIT
```

부터 구현.

실제 Specialization 효과는 Placeholder 가능.

### P1 — SELECTION INPUT REUSE

현재 Reward Selection의:

```text
Left / Right
+
Up Confirm
```

흐름 재사용 가능성 검증.

### P2 — MULTIPLAYER OWNERSHIP

두 Player가 독립 선택 가능한지 확인.

### P3 — CALIBRATION GRAYBOX

```text
G1
R1
G2
P3
```

만 구현.

### P4 — REAL SPECIALIZATION EFFECTS

Augment Catalog 확정 후 연결.

### P5 — STORY / UI

Service Sign
Node Detection
Foundation Detection
Specialization Available

### P6 — ART

Residential Service Node + Near Props.

### P7 — AUDIO / VFX

Gameplay / Selection PASS 이후.

---

## 24. Stage Data Concept

**HYPOTHESIS — Runtime Schema 아님**

```js
{
    id: "sector-02-3-residential-service-node",

    sector: 2,
    region: 3,

    role: "first-specialization",

    gameplay: {
        enemies: [],
        hazards: [],
        wind: false,
        newInput: false
    },

    node: {
        type: "rope-specialization-node",
        requiresFoundation: true,
        selectionPool: "TBD",
        choiceCount: "TBD",
        perPlayerSelection: true
    },

    calibration: {
        requiredForCompletion: false,
        safe: true
    },

    exit: {
        nextRegion: "sector-02-4-residential-stack"
    }
}
```

---

## 25. 아트 담당자 전달문

### RESIDENTIAL SERVICE NODE

이곳은 1-4의 중앙 Maintenance Facility가 아니다.

Worker District 안에 있는
**공동 장비 관리실**이다.

핵심 이미지:

> 기업이 만든 표준 Maintenance Technology를
> 노동자들이 오래 사용하고 수리해온 흔적.

### 필요한 것

1. Wall-integrated Service Node
2. Worker Locker
3. Maintenance Bench
4. Charging Rack
5. Utility Panel
6. Cable / Pipe
7. Waiting Chair
8. Small Personal Object
9. Residential Service Sign

### 피해야 할 것

- 화려한 Upgrade Shrine
- RPG 마법 제단
- 지나치게 깨끗한 Laboratory
- 군사시설
- 과한 Neon
- 사람 / 시체

### 색

Base:

```text
Dark Navy
Charcoal
Old Gray
```

Utility accents:

```text
Muted Green
Warm Dirty Yellow
```

Node Active:

```text
Limited Cyan
```

Player / Rope 가독성을 가장 우선한다.

---

## 26. 개발자 최종 전달 요약

### SECTOR 02-3 — RESIDENTIAL SERVICE NODE

역할:

```text
2-2 PRESSURE

↓

2-3 REST / REWARD

↓

FIRST SPECIALIZATION

↓

2-4 EXPRESSION
```

### 절대 넣지 않음

```text
Enemy
Drone
Wind
Trap
Damage Floor
New Rope Button
New Rope Mode
```

### 핵심 시스템

Player가 이미 가진:

```text
IMPULSE
or
RELAY
or
SHEAR
```

Foundation을 읽고,

그 방향을 더 깊게 만드는:

```text
SPECIALIZATION
```

을 선택.

### 현재 구현 시 주의

Specialization 실제 이름과 효과는 아직 미확정이다.

따라서:

```text
Stage Geometry / Node Flow
```

는 먼저 구현 가능하지만,

```text
Final Augment Catalog
```

는 별도 기획 확정 없이 임의 구현하지 않는다.

---

## OPEN QUESTIONS

### 1. Foundation당 Specialization Choice 수

아직 미확정.

후보:

```text
2 choices
3 choices
weighted pool
```

실제 Augment System 설계에서 확정한다.

### 2. Specialization 카탈로그

IMPULSE / RELAY / SHEAR 각각에 대해
최소 2개 이상의 분화 후보가 필요하다.

그러나 2-3 Stage 문서에서 임의로 이름과 수치를 LOCK하지 않는다.

### 3. Foundation과 Specialization UI 관계

1-4 Foundation Reward Selection이 구현되어 있다.

입력·Choice Navigation은 재사용 후보지만,
Foundation과 Specialization을 하나의 동일 성장 시스템으로 합칠지는
별도 시스템 결정이 필요하다.

### 4. Multiplayer Gate

한 Player가 선택을 끝내고 다른 Player가 아직 선택 중일 때
Exit Gate를 어떻게 처리할지는
연속 World / Gate / Spectator / 합류 규칙과 함께 구현 단계에서 확정한다.

---

SECTOR 02-3 / RESIDENTIAL SERVICE NODE — REV 1.0
