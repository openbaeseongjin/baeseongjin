# SECTOR 04 — TRANSIT / INFRASTRUCTURE MASTER PLAN

*MASTER PLAN CANDIDATE · REV 1.0*

`SECTOR 04 TRANSIT / INFRASTRUCTURE` · `MOMENTUM UNDER INTERRUPTION` · `CUTTER FIRE` · `TRANSIT WAKE` · `CONTINUOUS SPEED FLOW`

| 항목 | REV 1.0 기준 |
|---|---|
| Status | HYPOTHESIS — MASTER PLAN CANDIDATE |
| Current Main Snapshot | `37ebeb90a2f2197af0420c0a0b00970eab41dea7` |
| Sector Role | Commercial District 이후 도시의 대형 이동·전력·환기 Backbone 진입 |
| Core Gameplay Shift | Active Route Control → Momentum Under Interruption |
| Core Story Shift | “누가 위쪽 이동 우선권을 가졌지?” → “왜 Lower Ascent Feeder만 격리됐지?” |
| Carry Build | Foundation + first Specialization KEEP — runtime pending |
| New Rope Mode | NONE |
| New Input | NONE |
| New Growth Tier | NONE — Growth Gate remains HOLD |
| Primary New Threat | CUTTER FIRE — existing Rope-Cut capability, new player-facing rule |
| Secondary Environment | TRANSIT WAKE / PRESSURE PULSE — reuse existing deterministic Wind |
| Moving Platform / Train Collision | TECH SPIKE ONLY — not mandatory canon |
| New Enemy AI Type | NONE |
| Existing Enemy Families | Sentry T1 / Patrol Drone T1 |
| Boss | 4-8 내부 NONE; Post-Sector 04 Boss / Transition TBD |
| General Stages | 8 authored progression regions |
| Sector 04 Runtime | NOT IMPLEMENTED |
| Approved Gameplay Art | HOLD until Runtime Area / Camera Zone / Stable IDs exist |

---

## 0. Source-of-Truth / 현재 상태

### CURRENT MAIN AT AUTHORING

Sector 04 Master Plan 작성 시작 시점 최신 `main`:

```text
37ebeb90a2f2197af0420c0a0b00970eab41dea7
```

최근 관련 상태:

```text
Sector 03
3-1 ~ 3-8 docs complete

3-8
REV 1.1 FREE-WEAVE

ACCESS SCAN FIELD
Runtime prototype spec / Codex handoff merged

Scenario Art Standard
Sector 01~03 status audit merged
```

### Sector 04 Scenario Tree

현재 저장소 검색 기준:

```text
docs/bsh/scenario/4/
```

상세 Master / Stage 문서는 아직 확인되지 않는다.

즉 본 문서는:

```text
SECTOR 04 FIRST CANONICAL MASTER CANDIDATE
```

다.

### Current Runtime Boundary

현재 authored Runtime은:

```text
SECTOR 01
+
SECTOR 02
```

까지 연결된 상태다.

따라서:

```text
SECTOR 03
= docs ahead of runtime

SECTOR 04
= master-planning stage
```

다.

### Important — 3-8 → 4-1 직접 연결 금지

현재 공통 계약:

```text
3-8 GENERAL FINALE
→
POST-SECTOR 03 BOSS / TRANSITION TBD
→
SECTOR 04
```

정확한 Boss Entry가 미확정이다.

따라서 Sector 04 Master는:

```text
4-1 Entry
```

의 공간·Gameplay 역할은 정하지만,

```text
3-8 Gate → 4-1
```

직접 wiring을 확정하지 않는다.

---

## 1. 레퍼런스 스캔

### VERIFIED / OFFICIAL — SANABI

공식 설명에서 Chain-hook 계열 도구는:

```text
movement
+
bullet / trap traversal
+
enemy defeat
```

를 하나의 행동 체계로 묶는다.

### TRANSFER

Sector 04에서:

```text
이동 구간
→ 전투 구간
→ 이동 구간
```

으로 나누지 않는다.

대신:

```text
ROPE FLOW
+
CUTTER PROJECTILE
+
TRANSIT PRESSURE
```

가 같은 순간 판단 안에 들어간다.

### VERIFIED / DEVELOPER — Rusted Moss

개발자 설명에서:

```text
one unusual grapple mechanic
→ everything revolves around it

same challenge
→ multiple valid solutions
```

을 핵심 철학으로 둔다.

### TRANSFER

Sector 04는:

```text
“정해진 열차를 기다리고 탄다.”
```

보다:

```text
“같은 인프라 공간을
Momentum / Chaining / Rope Geometry에 따라
다르게 통과한다.”
```

를 우선한다.

### TRANSFER — Celeste / N 계열 원칙

- 실패 후 즉시 다시 판단 가능
- 사실적인 철도 시뮬레이션보다 예측 가능한 상태
- Player intention을 과도하게 벌하지 않음
- Speed Stage라도 Blind Reaction Test로 만들지 않음

---

## 2. 이전 초안에서 가져올 것 / 버릴 것

Historical scenario skeleton에는 Sector 04가:

```text
TRANSIT / INFRASTRUCTURE
=
SPEED ZONE
```

으로 제안돼 있었다.

공간 후보:

- 대형 수직 열차 Shaft
- Freight Rail
- Power Transmission Structure
- Ventilation Infrastructure
- 긴 이동 공간

### TRANSFER — 유지

```text
SPEED
LONG SPAN
INFRASTRUCTURE SCALE
ROPE INTERRUPTION
```

은 유지한다.

### RETIRED — 폐기

과거 초안의:

```text
CYAN / AMBER / VIOLET MODE
```

전제는 폐기.

현재:

```text
ONE ROPE, GROWING TOOL
```

기준.

또 과거 초안의:

```text
“중앙 시스템이 의도적으로
하층을 못 올라오게 만들었다.”
```

라는 직접 결론은
현재 Story Disclosure 기준보다 강하다.

Sector 04에서는:

```text
LOWER ASCENT FEEDER
ISOLATED

UPPER EXPRESS TRUNK
LIMITED / ACTIVE
```

라는 **운영 상태**까지만 확정한다.

누가 왜 그 격리를 결정했는지는
Sector 05 이후로 남긴다.

---

## 3. Sector 04 한 줄 정의

**Player가 Commercial District의 상부 Gate를 넘어 도시 전체를 연결하는 Transit / Infrastructure Backbone에 진입해, 긴 수직·사선 이동 공간에서 Rope Momentum을 키우고, Rope 자체를 끊을 수 있는 Cutter Fire와 반복되는 Transit Wake 때문에 Flow가 흔들릴 때마다 빠르게 다음 Anchor를 선택·재부착하며, 마지막에는 Lower Ascent Feeder가 다른 상부 이동망과 다르게 격리된 상태였음을 확인하는 고속 Rope-Recovery Sector.**

---

## 4. Sector 04 핵심 Gameplay 질문

Sector 01:

> **“Rope를 사용할 수 있는가?”**

Sector 02:

> **“움직이는 Threat 속에서 어떤 Route를 선택할 것인가?”**

Sector 03:

> **“Security State가 바뀔 때 언제 붙고 어디로 갈 것인가?”**

Sector 04:

> **“속도를 유지하다 Rope Flow가 끊겼을 때, 얼마나 빠르고 유리하게 다음 연결을 만들 수 있는가?”**

짧게:

> **MOMENTUM → INTERRUPTION → RECOVERY → MOMENTUM**

---

## 5. Core Gameplay Shift

### Sector 03

```text
READ SECURITY STATE
→ choose attach timing / route
```

### Sector 04

```text
BUILD MOMENTUM
→ commit through long span
→ flow interruption
→ re-attach / redirect
→ keep moving
```

### 중요

Sector 04는:

```text
FASTER PLATFORMING
```

만 의미하지 않는다.

핵심은:

```text
SPEED
+
RECOVERY QUALITY
```

다.

잘하는 Player는
방해를 맞지 않는 사람만이 아니라:

> **방해를 받아도 다음 Rope를 빠르게 만드는 사람**

이어야 한다.

---

## 6. Primary New Threat — CUTTER FIRE

### STATUS

```text
DESIGN SELECTED
RUNTIME CAPABILITY VERIFIED
PRESENTATION / AUTHORING CONTRACT REQUIRED
```

### Current Runtime — VERIFIED

Enemy projectile은:

```text
canCutRope
```

를 지원한다.

Projectile이 Player의 현재 Rope Segment:

```text
Player Rope Attachment Point
→
Rope Anchor
```

를 가로지르면:

```text
rope-cut
```

resolution이 존재한다.

### 현재 Sector 01~03 Baseline

현재 사용 중인 Patrol / Sentry 시나리오는
대부분 명시적으로:

```text
no-rope-cut
```

을 사용해 Rope Cut을 비활성화한다.

Sector 04는 이 이미 구현된 capability를
처음 **명시적 Gameplay Rule**로 사용한다.

---

## 7. Cutter Fire의 디자인 목적

Cutter는:

```text
Player Body를 맞히는 Bullet
```

의 강화판이 아니다.

질문:

> **“내 Rope Line을 어디에 만들 것인가?”**

### Cutter가 압박하는 것

- Anchor Choice
- Rope Line Angle
- Release Timing
- Re-Attach Speed
- Momentum Recovery

### Cutter가 압박하지 않는 것

- 새로운 회피 버튼
- Parry
- Shield
- Rope Mode Switch
- 특정 Augment 보유 여부

### 핵심

Cutter 때문에 Player가:

```text
Rope를 덜 쓰는 것
```

이 아니라:

```text
Rope를 더 잘 다시 쓰는 것
```

이 목표다.

---

## 8. Cutter Fire 공정성 계약

Rope Cut은 체감상 큰 상태 변화이므로
기존 일반 Projectile과 **명확하게 구분**돼야 한다.

### Required Telegraph

최소:

```text
distinct charge cue
distinct projectile silhouette
distinct audio cue
distinct trail
```

### 금지

같은 Sentry가 같은 Bullet Graphic으로
갑자기 Rope만 끊는 것.

### Recommended Presentation Profile

Underlying AI:

```text
sentry-t1
or
patrol-drone-t1
```

재사용.

Presentation / authored rule:

```text
CUTTER FIRE
```

를 명시.

### Production Hardening — 권장

현재 구현은:

```text
!rules.includes("no-rope-cut")
→ canCutRope
```

형태다.

Sector 04 production integration 시
의도하지 않은 Rope Cut이 생기지 않도록:

```text
rope-cut
```

같은 **명시적 opt-in authoring rule**로 강화할지
개발자가 검토한다.

단 Master Plan은 이 refactor를
Stage 구현의 절대 선행 조건으로 잠그지 않는다.

---

## 9. Cutter Recovery Contract

Rope Cut 발생 후:

```text
Player
→ free airborne
```

상태가 된다.

### Stage Design Rule

Cutter Encounter에는 항상:

```text
NEXT VALID ATTACH
```

가 보여야 한다.

### Recovery Target

대부분:

```text
≤ 2.0 sec
```

안에:

- 다음 Anchor
- Recovery Ledge
- Safe Lower Pivot

중 하나를 선택 가능.

### 금지

```text
Rope Cut
→ 6초 낙하
→ Stage Start
```

### 좋은 Cutter 성공

```text
CUT
→ emergency re-attach
→ lower arc
→ regain momentum
→ continue
```

이 자체가 재미있는 순간이어야 한다.

---

## 10. Secondary Environment — TRANSIT WAKE

### STATUS

```text
TRANSFER OF EXISTING WIND SYSTEM
NO NEW PHYSICS REQUIRED
```

### Current Runtime — VERIFIED

기존 Wind는:

```text
continuous
pulsed
```

지원.

Pulsed:

```text
LULL
→ WARNING
→ ACTIVE
→ DECAY
```

deterministic phase.

### Sector 04 Recontextualization

Sector 01:

```text
COOLING WIND
```

Sector 04:

```text
TRANSIT WAKE
PRESSURE DISPLACEMENT
VENT / EXPRESS TRUNK PULSE
```

### 중요한 차이

Sector 01의 질문:

> Wind를 어떻게 이용할까?

Sector 04의 질문:

> Momentum이 이미 큰 상태에서 Wake가 밀 때 Flow를 유지하거나 재설계할 수 있는가?

---

## 11. Transit Wake 구현 한계

Current Wind Runtime:

```text
STATIC RECT ZONE
```

이다.

없음:

- moving force volume
- train-following force volume
- wind shadow
- grounded attenuation
- spatial falloff

### 따라서

Sector 04 Prototype에서:

```text
moving train wake volume
```

처럼 구현되지 않은 것을 사실로 가정하지 않는다.

### 구현 가능한 표현

Static Corridor 안에서:

```text
WARNING
→ pressure ACTIVE
→ DECAY
```

가 반복.

Visual은:

- tunnel pressure light
- warning stripe
- dust / cable movement
- passing-train-like background streak

로 Transit context를 줄 수 있다.

Gameplay Force Zone은 정적.

---

## 12. Moving Train / Moving Platform — TECH SPIKE ONLY

### Current Runtime Result

코드 검색 기준:

```text
moving authored collision surface
moving train platform
moving grapple surface
```

공통 Runtime system은 확인되지 않는다.

`maintenance-lift`도 현재:

```text
background-prop
gameplay:false
```

다.

### 결론

Sector 04의 필수 재미를:

```text
moving platform
```

에 의존시키지 않는다.

### TECH SPIKE CANDIDATE

후반 Stage에서 선택적으로:

```text
MOVING GRAPPLE CARRIER
```

또는:

```text
NON-COLLIDING MOVING TRANSIT OBJECT
```

실험 가능.

### Production Gate

다음이 모두 PASS하기 전:

- collision
- Rope attach
- player carry
- release velocity
- multiplayer authority/prediction
- rollback/reconcile
- recovery

Mandatory Route에 넣지 않는다.

### Fallback

Tech Spike 실패:

```text
STATIC INFRASTRUCTURE
+
CUTTER FIRE
+
TRANSIT WAKE
```

만으로 Sector 04 전체를 완성할 수 있어야 한다.

---

## 12-1. Sector 03 Mechanic Carry Policy

Sector 04는 Sector 03의 Scanner를
주요 Gameplay Layer로 계속 쌓지 않는다.

```text
ACCESS SCAN FIELD
= NOT REQUIRED FOR SECTOR 04 CORE
```

이유:

1. Sector 04가 고유한 Momentum / Recovery 정체성을 가져야 한다.
2. Scanner Runtime은 아직 구현 진행 중이다.
3. Sector 04 전체가 Sector 03 미완성 시스템에 연쇄 차단되면 안 된다.

필요하면 Background Security Prop 또는 Story 흔적으로는 재사용할 수 있지만,
4-1~4-8 Mandatory Route에 Scanner timing을 요구하지 않는다.

---

## 13. Build Expression

Sector 04 시작 Design State:

```text
FOUNDATION
+
FIRST SPECIALIZATION
```

Current actual runtime:

```text
pending / incomplete
```

### IMPULSE

빛나는 상황:

- long span
- wake-assisted arc
- Cutter exposure time compression
- interrupted momentum recovery

### RELAY

빛나는 상황:

```text
CUT
→ emergency re-attach
→ next attach
```

연속 recovery.

### SHEAR

빛나는 상황:

- Cutter / Patrol path를 Rope Line으로 가로지름
- 긴 Infrastructure geometry를 공격각으로 활용
- Kill Optional

### 중요한 원칙

```text
BUILD
= efficiency / expression
```

이지:

```text
BUILD
= mandatory key
```

가 아니다.

---

## 14. Growth Progression — HOLD

Sector 03의 Growth Gate를
Sector 04 Master가 임의 해제하지 않는다.

```text
SECOND SPECIALIZATION
HOLD

SECONDARY AUGMENT
HOLD

HYBRID
HOLD

CAPSTONE
HOLD
```

### 왜

Foundation Runtime / first Specialization Runtime과
Build 차이가 실제 플레이에서 충분히 검증되지 않았다.

### Sector 04 Growth Slot

4-4:

```text
INFRASTRUCTURE SERVICE NODE
```

를 Growth Slot 후보 위치로 남긴다.

Default:

```text
REST / BUILD DIAGNOSTIC
NO NEW REWARD
```

나중에 Growth Gate가 공식적으로 reopen되면
이 위치를 재검토할 수 있다.

### 중요한 계약

4-5~4-8 Mandatory Geometry는:

```text
new growth tier
```

를 요구하지 않는다.

---

## 15. Story 역할

Sector 03 종료:

Player는:

```text
Evacuation Archive
+
Access Archive
```

가 같은 Upper facility에 존재했다는 것을 안다.

하지만 관계는 모른다.

### Sector 04에서 추가할 것

이제 도시의 **물리적 이동망 상태**를 본다.

```text
LOWER ASCENT FEEDER
ISOLATED

UPPER EXPRESS TRUNK
LIMITED / ACTIVE
```

### 의미

Player는 확실히 알게 된다:

> 도시의 모든 이동망이 똑같이 고장난 것은 아니었다.

그리고:

> Lower → Upper 연결부가 별도 상태로 격리돼 있었다.

### 아직 말하지 않음

- 누가 격리를 명령했는가
- 회사 경영진의 정확한 정책
- Group A/B/C와 Feeder 상태의 직접 매핑
- 하층을 의도적으로 죽이려 했다는 결론
- 사고 자체가 계획됐다는 결론

Sector 05가
더 직접적인 Corporate record / policy reveal을 소유한다.

---

## 16. Sector 04 Story 질문

### 시작

> **“이 Access 구조와 대피 결과는 어떤 관계였지?”**

### 중간

> **“왜 Upper Trunk는 살아 있는데 Lower Feeder는 격리되어 있지?”**

### 종료

> **“이 격리 상태가 Group C의 중단과 관련 있었다면, 누가 이 Routing을 결정했지?”**

중요:

```text
IF
```

의심은 생겨도 된다.

```text
CONFIRMED CAUSALITY
```

는 아직 아니다.

---

## 17. 권장 System 문구

### 허용

```text
TRANSIT BACKBONE
SERVICE DEGRADED
```

```text
UPPER EXPRESS TRUNK
LIMITED OPERATION
```

```text
CONTAINMENT ROUTING
ACTIVE
```

```text
LOWER ASCENT FEEDER
ISOLATED
```

```text
LOCAL OVERRIDE
UNAVAILABLE
```

### 금지

```text
LOWER WORKERS DENIED
```

```text
EXECUTIVE EVACUATION PRIORITY
```

```text
GROUP C BLOCKED BY ORDER
```

```text
LOWER SECTORS SACRIFICED
```

Sector 05 Story scope 침범.

---

## 18. Spatial Identity

Sector 03:

```text
POLISHED COMMERCIAL ATRIUM
```

Sector 04:

```text
CITY BACKBONE
```

### Architecture

- huge vertical transit shaft
- freight bypass bridge
- rail support truss
- power relay span
- cable gallery
- ventilation pressure chamber
- switching junction
- control trunk

### 공간 비율

Player는 더 작아진다.

```text
SMALL TECHNICIAN
vs
CITY-SCALE MACHINE
```

### Level Rhythm

Sector 03보다:

```text
LONGER READABLE LINES
FEWER SMALL ROOMS
MORE CONTINUOUS AIRTIME
```

---

## 19. Visual Direction

### Base

```text
Deep Steel Blue
Graphite
Black Structural Frame
Cold Concrete
```

### Infrastructure Energy

```text
Sodium Amber
Electrical White
Desaturated Green
Warning Red
```

### Gameplay Priority

```text
Rope
CYAN

Cutter
distinct RED / HOT ORANGE + unique trail

Transit Wake
WHITE / AMBER pressure cue
```

### Cyan Rule

Train lights / utility LEDs에 Cyan 남발 금지.

Rope가 최우선.

---

## 20. Motion / Parallax Direction

Sector 04는
실제 moving collision 없이도
**움직이는 도시**처럼 보여야 한다.

### Far

- passing light streak
- distant elevator/rail silhouette
- power pulses
- moving signal bands

### Mid

- rotating ventilation machinery
- cable vibration
- pressure shutters as visual-only distant props
- freight indicator sequence

### Gameplay Layer

Static unless Runtime system verified.

### Important

```text
BACKGROUND MOTION
≠
GAMEPLAY MOVING SURFACE
```

명확히 분리.

---

## 21. Sector Rhythm

```text
4-1
SPEED SPACE REVEAL

↓

4-2
TEACH CUTTER FIRE

↓

4-3
CUTTER + TRANSIT WAKE

↓

4-4
REST / ROUTING PREVIEW

↓

4-5
EXPRESS FLOW

↓

4-6
ROPE GEOMETRY + INFRASTRUCTURE PRESSURE

↓

4-7
ISOLATION STORY PRESSURE

↓

4-8
CONTINUOUS VELOCITY / RECOVERY FINALE
```

Difficulty:

```text
4-1  ★★☆
4-2  ★★★
4-3  ★★★
4-4  REST
4-5  ★★★☆
4-6  ★★★☆
4-7  ★★★★
4-8  ★★★★
```

---

## 22. Stage Master Table — REV 1.0

| Stage | Name | Gameplay Role | Enemy / Threat | Environment | Growth | Story |
|---|---|---|---|---|---|---|
| 4-1 | TRANSIT INTAKE | Long-span Speed Space reveal | NONE | static infrastructure | none | Upper Express Trunk is degraded but not dead |
| 4-2 | CUTTER LINE | First Rope-Cut tutorial | Sentry T1 ×1, Cutter Fire | no Wake | none | Infrastructure security still enforces route control |
| 4-3 | FREIGHT BYPASS | Cutter + pressure-flow combination | Cutter Sentry ×1 | Pulsed Transit Wake | none | Freight/service routing remains partially active |
| 4-4 | INFRASTRUCTURE SERVICE NODE | REST / Build Diagnostic / Routing Preview | NONE | quiet service bay | HOLD | Lower feeder status begins to look abnormal |
| 4-5 | EXPRESS SHAFT | High-speed movement-expression stage | NONE | Pulsed Wake | none | Upper trunk is still carrying limited service |
| 4-6 | POWER RELAY SPAN | Rope geometry / threat separation | Cutter Sentry ×1 + Patrol T1 ×1 separated | NO Wake; static power span; optional tech-spike carrier only | none | Transit and power routing share the same protected backbone |
| 4-7 | ISOLATION JUNCTION | Story pressure + Cutter/Wake synthesis | Cutter Sentry ×1 | Pulsed Transit Wake | none | Lower Ascent Feeder = ISOLATED confirmed |
| 4-8 | TRANSIT CONTROL TRUNK | Continuous speed / interruption / recovery Finale | Cutter Sentry ×1 + Patrol T1 ×1 separated | Pulsed Wake + long trunk | none | Upper Trunk vs Lower Feeder state juxtaposition |

---

## 23. 4-1 — TRANSIT INTAKE

### Role

Sector 04의 첫 인상.

### Enemy

```text
NONE
```

### New Threat

```text
NONE
```

Cutter를 바로 쏘지 않는다.

### Gameplay

긴:

```text
ENTRY DECK
→ LONG ARC
→ RE-ATTACH
→ LONG ARC
```

로 Commercial의 작은 판단 밀도에서
Infrastructure의 큰 이동 스케일로 전환.

### 핵심 감정

> **“여기서는 속도를 만들 수 있다.”**

### Story

허용:

```text
TRANSIT BACKBONE
SERVICE DEGRADED

UPPER EXPRESS TRUNK
LIMITED OPERATION
```

Lower Isolation은 아직 확정하지 않는다.

---

## 24. 4-2 — CUTTER LINE

### Role

First Cutter Tutorial.

### Enemy

```text
SENTRY T1 ×1
```

Stationary 권장.

### 왜 Stationary

첫 학습에서:

```text
enemy movement
+
rope-cut projectile
```

을 동시에 해석시키지 않는다.

### Structure

```text
SAFE OBSERVATION
→
CLEAR CUTTER TELEGRAPH
→
FIRST LONG ROPE
→
CUT POSSIBILITY
→
VISIBLE EMERGENCY RE-ATTACH
→
SAFE LANDING
```

### Pass

Player가 한 번 Rope를 잘렸어도:

> “왜 잘렸는지, 다음에 뭘 해야 하는지”

이해.

---

## 25. 4-3 — FREIGHT BYPASS

### Role

이미 배운:

```text
CUTTER
+
WIND
```

를 Transit context에서 결합.

### Threat

```text
Cutter Sentry ×1
```

### Environment

```text
PULSED TRANSIT WAKE
```

### Gameplay

Wake가:

```text
ACTIVE
```

일 때도 통과 가능.

LULL 대기가 유일한 답이면 FAIL.

### Build

Impulse:

```text
Wake-assisted long arc
```

Relay:

```text
Cut recovery chain
```

Shear:

```text
Cutter line offense opportunity
```

---

## 26. 4-4 — INFRASTRUCTURE SERVICE NODE

### Role

REST.

### Enemy

NONE.

### Growth

Default:

```text
NO NEW TIER
```

### Optional Diagnostic

현재 Build Runtime이 구현된 뒤에만
read-only diagnostic.

### Story

처음 이상징후:

```text
LOWER ASCENT FEEDER
STATUS: SEGMENTED
```

정도.

아직:

```text
ISOLATED
```

를 핵심 Reveal로 쓰지 않는다.

### Purpose

4-7 Story reveal을 위한 setup.

---

## 27. 4-5 — EXPRESS SHAFT

### Role

Sector 04의 Movement Joy Stage.

4-4 Rest 뒤
다시 크게 속도를 낸다.

### Threat

```text
NONE
```

### Environment

Pulsed Transit Wake.

### 핵심

4-3의 결합 압박과 4-4 Rest 뒤,
적을 완전히 빼고 **고속 Rope 이동 자체**를 다시 즐긴다.

Sector 04가:

```text
ROPE-CUT GAUNTLET
```

로만 느껴지지 않게 하는 중요한 Movement Joy Stage다.

### Question

> **“Wake와 Momentum을 싸우지 않고 같이 쓸 수 있는가?”**

### Important

Wake를 기다리는 것보다
ACTIVE / DECAY를 이용해 흐름을 이어가는 숙련 선택이 있어야 한다.

---

## 28. 4-6 — POWER RELAY SPAN

### Role

Cutter / Patrol / Rope Geometry를
한 큰 Infrastructure Span에서 분리 조합.

### Threat

권장:

```text
Cutter Sentry ×1

+

Patrol Drone T1 ×1
no-rope-cut
```

### Environment

```text
TRANSIT WAKE
NONE
```

4-6은 force timing보다
Rope Line / Enemy Geometry에 집중한다.

### Important

Activation / exposure는 겹치지 않거나
짧게만 교차.

지속 2-Enemy Crossfire 금지.

### SHEAR

실제 Rope line이
Enemy route를 가로지르는 유효한 공격각을 만든다.

Kill Optional.

### Moving Carrier

```text
TECH SPIKE PASS
```

시에만 optional shortcut 후보.

실패하면 static geometry로 동일 Stage 유지.

---

## 29. 4-7 — ISOLATION JUNCTION

### Role

Sector 04 Story Pressure.

### Threat

```text
Cutter Sentry ×1
```

Patrol은 넣지 않는다.

### Gameplay

```text
MOMENTUM
+
CUTTER
+
TRANSIT WAKE
```

synthesis.

### Story Reveal

처음 확정:

```text
CONTAINMENT ROUTING
ACTIVE

LOWER ASCENT FEEDER
ISOLATED
```

동시에 상부 쪽:

```text
UPPER EXPRESS TRUNK
LIMITED OPERATION
```

### Player Interpretation

확실:

```text
NETWORK FAILURE WAS NOT UNIFORM
```

확실하지 않음:

```text
WHO ORDERED IT
WHY
WHICH GROUP MAPPED TO WHICH ROUTE
```

---

## 30. 4-8 — TRANSIT CONTROL TRUNK

### Role

Sector 04 General Finale.

### Boss

```text
4-8 INTERNAL BOSS
= NONE

POST-SECTOR 04 BOSS / TRANSITION
= TBD
```

### 핵심 Gameplay

3-8처럼:

```text
LEFT / CENTER / RIGHT
route selection
```

을 반복하지 않는다.

4-8은 **하나의 긴 Control Trunk**다.

```text
MOMENTUM BUILD
→
CUTTER INTERRUPTION
→
RECOVERY
→
WAKE ACCELERATION
→
RE-ATTACH CHAIN
→
SECOND INTERRUPTION
→
FINAL FLOW
```

### Threat Budget

정확히:

```text
Cutter Sentry ×1
+
Patrol Drone T1 ×1
no-rope-cut
```

서로 다른 연속 구간.

둘이 동시에 한 Arena를 점유하지 않는다.

### 금지

두 적을 한 Arena에서
동시에 오래 싸우게 하지 않는다.

### Story

Final Control Deck에서:

```text
UPPER EXPRESS TRUNK
LIMITED OPERATION

LOWER ASCENT FEEDER
ISOLATED
```

상태를 같은 routing overview에서 본다.

### Still No Causality

다음 인과는 **NOT CONFIRMED**:

```text
GROUP C SUSPENSION
← CAUSED BY →
LOWER FEEDER ISOLATION
```

문서 / Terminal / UI에서 직접 인과로 쓰지 않는다.

Player가:

```text
MAY BE RELATED
```

라고 의심하게만 한다.

---

## 31. 3-8 vs 4-8 반복 방지

### 3-8

```text
FREE-WEAVE
Scanner state
→ central / side movement 선택
```

### 4-8

```text
CONTINUOUS TRUNK
Momentum is already active
→ interruption
→ recovery
→ resume speed
```

### Pass Question

Player에게:

> “3-8과 4-8이 어떻게 달랐나요?”

기대:

```text
3-8:
어디로 엮을지 계속 골랐다.

4-8:
한 흐름을 계속 살리면서
끊기면 다시 붙었다.
```

---

## 32. Safe Route / Flow Route 철학

Sector 04의 Stage 상세에서도:

```text
SAFE ROUTE
```

와:

```text
FLOW ROUTE
```

를 둘 다 제공.

### Safe

- 짧은 Rope
- Recovery Landing
- Cutter Observation
- Wake Wait 가능
- swingImpulse=0 clearable

### Flow

- fewer landings
- longer arc
- wake timing 활용
- Cutter exposure 압축
- emergency re-attach 연계

### Skill Reward

Flow Route는:

```text
MORE FUN / FASTER / CLEANER
```

이지:

```text
ONLY POSSIBLE ROUTE
```

가 아니다.

---

## 33. Rope Geometry Contract

Current:

```text
maxAttachDistance = 440
```

### Sector 04

긴 공간이어도:

```text
MANDATORY ATTACH
≤ 440
```

### Speed Illusion

긴 느낌은:

```text
one huge impossible gap
```

이 아니라:

```text
multiple readable anchors
+
fewer forced landings
+
large background scale
```

로 만든다.

### Validation

모든 Mandatory geometry:

```text
swingImpulse = 0
```

에서도 안전 경로 통과 가능.

---

## 34. Enemy / Cutter Authoring Contract

### Cutter Sentry

Underlying family:

```text
sentry-t1
```

가능.

### Required Stage Data Meaning

문서에서 반드시:

```text
ROPE-CUT ENABLED
```

또는 동등한 명시적 표기를 한다.

단순히:

```text
no-rope-cut rule을 빼면 됨
```

이라고만 쓰지 않는다.

### Patrol

기존 T1을 쓸 경우:

```text
no-rope-cut
```

유지하는 Stage와
Cutter-enabled Stage를 구분.

### Why

Player-facing expectation을
맵마다 암묵적으로 바꾸지 않기 위해.

---

## 35. Multiplayer Contract

### Cutter

Projectile / Rope Cut 결과는
현재 projectile prediction / impact contract를 따른다.

### Design Requirement

Player A의 Cutter encounter가
다른 구간 Player B의 Rope를
장거리 우발적으로 자르지 않도록:

- activation bounds
- projectile angle
- platform separation

검증.

### Transit Wake

둘 다 같은 deterministic phase를 봐야 함.

현재 Wind time-derived state가
owner prediction clock parity 문제와 연결될 수 있으므로:

```text
ACCESS SCAN FIELD clock parity audit
```

결과를 함께 확인.

### Moving Carrier

Multiplayer tech spike PASS 전
사용 금지.

---

## 36. Recovery Contract

Sector 04의 난이도는 높지만
Retry friction은 낮춘다.

### Cutter

```text
≤ 2 sec
```

다음 Attach 의사결정.

### Fall

대부분:

```text
≤ 5 sec
```

내 원래 flow 구간 재진입.

### Wake

Recovery deck이
ACTIVE Wake 안에서 계속 밀려나지 않게
Zone bounds를 설계.

현재 Grounded Wind attenuation이 없다는 점 중요.

### 금지

```text
Cut
→ bottomless fall
→ stage reset
```

반복.

---

## 37. Camera Direction

Sector 04 Camera는
“속도감” 때문에 Player를 너무 확대하지 않는다.

### Long Span

앞쪽:

```text
NEXT ANCHOR
+
CUTTER TELEGRAPH
+
RECOVERY TARGET
```

을 미리 보여야 한다.

### Warning

Speed Section에서
Off-screen Cutter projectile 금지.

### Mobile

0.72 baseline에서도
Cutter projectile과 Rope line이 분리돼 보여야 함.

### Moving Background

Parallax speed를 높여도
Gameplay Surface가 흐려지지 않게 한다.

---

## 38. Sound / VFX Direction

### Ambient

- rail hum
- heavy transformer hum
- pressure release
- distant freight resonance
- structural vibration

### Cutter

반드시 고유:

```text
CHARGE
→ FIRE
→ CUT
```

Audio family.

### Transit Wake

```text
warning pressure build
→ active roar
→ decay
```

### Rope Cut Feedback

강하지만 짧게.

Player에게:

```text
Rope is gone
```

을 즉시 알려야 한다.

화면을 길게 흔들어
Emergency Re-Attach를 방해하지 않는다.

---

## 39. Pixel / Asset Direction

### Base Grid

```text
32×32
```

### Major Structures

- Rail Truss 128–256 wide modules
- Freight Support 64–128
- Power Relay Core 96–192
- Vent / Pressure Duct 64–128
- Signal Tower 32–64
- Cutter Housing 32–64

### Background

- huge shaft
- distant rail line
- transformer silhouette
- conduit bundle
- suspended freight frame

### Player Scale

계속 작게.

Infrastructure Scale이 주인공처럼 커져야 한다.

---

## 40. Scenario Art Contract

Current global:

```text
SCENARIO-ART-GENERATION-STANDARD.md
```

따름.

### Sector 04 현재 상태

```text
Runtime Area
NONE

Camera Zone
NONE

Stable IDs
NONE
```

따라서:

```text
APPROVED GAMEPLAY ART
HOLD
```

### Before Art

1. Stage README
2. Runtime graybox
3. Camera Zone
4. Stable IDs
5. exact visible object count
6. approved blockout

순서.

---

## 41. Runtime Feasibility Matrix

| 시스템 | 현재 Runtime | Sector 04 판정 |
|---|---|---|
| Static Grapple Surface | IMPLEMENTED | CORE |
| Rope Max 440 | IMPLEMENTED | CORE |
| Rope Cut Projectile | IMPLEMENTED | PRIMARY NEW PLAYER-FACING THREAT |
| Sentry T1 | IMPLEMENTED | REUSE |
| Patrol Drone T1 | IMPLEMENTED | REUSE |
| Pulsed Wind | IMPLEMENTED | TRANSIT WAKE로 REUSE |
| Wind Shadow | NOT IMPLEMENTED | NOT REQUIRED |
| Grounded Wind Attenuation | NOT IMPLEMENTED | geometry로 회피 |
| Moving Collision Platform | NOT FOUND | TECH SPIKE ONLY |
| Moving Grapple Surface | NOT FOUND | TECH SPIKE ONLY |
| Train Physics | NOT FOUND | VISUAL / TECH SPIKE ONLY |
| Access Scan Field | SPEC ONLY / implementation pending | Sector 04 core에는 dependency로 만들지 않음 |
| Foundation Runtime | pending | no mandatory Build lock |
| Specialization Runtime | pending | no mandatory Build lock |

---

## 42. Production Risk Ranking

### LOW

- static long-span geometry
- Cutter projectile reuse
- existing Patrol reuse
- existing Wind reuse
- Story terminals
- visual-only infrastructure

### MEDIUM

- Cutter visual distinction
- high-speed camera framing
- 2-player projectile cross-lane safety
- Wake + Cutter combined tuning

### HIGH

- moving collision train
- moving grapple target
- carrying Player on moving surface
- moving surface + attached Rope
- multiplayer moving-platform prediction

### 결론

High-risk features 없이
Sector 04의 핵심 재미가 성립해야 한다.

---

## 43. Implementation Order

### P0 — CUTTER PLAYTEST SLICE

Synthetic room.

검증:

```text
normal projectile
vs
Cutter projectile
```

가 즉시 구분되는가?

Rope Cut 후
2초 내 재부착이 재미있는가?

### P1 — 4-1 Static Speed Graybox

Enemy 없음.

### P2 — 4-2 Cutter Tutorial

Stationary Sentry.

### P3 — Transit Wake Recontextualization

Existing pulsed Wind.

### P4 — 4-3 Combined Slice

Cutter + Wake.

### P5 — 4-4~4-8 Static Geometry

Moving platform 없이 먼저 완성.

### P6 — Multiplayer

Cutter / Wake / recovery.

### P7 — Moving Carrier TECH SPIKE

시간이 남고 P0~P6 PASS 후에만.

### P8 — Art / Audio

Runtime / Camera 안정 뒤.

---

## 44. Playtest Metrics

### Sector-level

```text
clear time
airborne time ratio
landing count
average re-attach chain
momentum loss events
full reset count
```

### Cutter

```text
cutter shots
rope cuts
body hits
successful emergency re-attach
time-to-re-attach
death after rope cut
```

### Transit Wake

```text
waited through active
entered during active
wake-assisted clear
wake-caused fall
```

### Build

Runtime 구현 뒤:

```text
IMPULSE
exposure compression / landing skip

RELAY
cut recovery chain

SHEAR
rope-line offense opportunity
```

---

## 45. Sector-level Playtest Questions

### Q1

> “4구간에서 잘하면 무엇을 잘하는 느낌이었나요?”

기대:

> 속도를 만들고, 끊겨도 빨리 다시 연결하는 것.

FAIL:

> 그냥 총알을 피하는 것.

### Q2

> “Rope가 잘렸을 때 불공평했나요?”

기대:

> 미리 알아볼 수 있었고 다음 Anchor가 보여서 복구 가능했다.

### Q3

> “4-3 / 4-5의 Wake가 1-6 Wind와 똑같이 느껴졌나요?”

기대:

> 같은 힘이지만 긴 Transit 속도 흐름 안에서 다르게 느껴졌다.

### Q4

> “3-8과 4-8의 차이가 있었나요?”

기대:

> 3-8은 경로를 엮고, 4-8은 속도를 끊기지 않게 복구했다.

---

## 46. PASS Criteria — Sector 04

### Gameplay

- `MOMENTUM → INTERRUPTION → RECOVERY`가 기억됨
- Cutter가 Rope usage를 억제하지 않음
- Cutter telegraph 명확
- Rope Cut 후 빠른 recovery 가능
- no new player input
- no new Rope mode
- no new enemy AI required
- Wake가 기존 physics로 동작
- Moving Platform 없이 Sector 전체 성립
- all mandatory geometry ≤ 440
- `swingImpulse=0` safe clear 가능
- Kill Optional
- 4-8 ≠ 3-8 decision pattern

### Growth

- no new tier
- Foundation + first Specialization carry
- Artifact와 Rope Growth 분리

### Story

Player가 확실히 앎:

```text
Lower ascent feeder was isolated.
Upper trunk still had limited operation.
Network failure was not uniform.
```

Player가 아직 모름:

```text
who ordered isolation
exact reason
group-tier-route mapping
direct causal link to Group C
```

### Production

- moving train not mandatory
- Sector 04 does not depend on unfinished Access Scan Field
- no premature approved art
- post-sector Boss/transition remains TBD

---

## 47. FAIL Conditions — Sector 04

### Gameplay

- Cutter Bullet이 일반 Bullet과 구분 안 됨
- Rope Cut이 사실상 즉사
- Cutter 때문에 Rope를 안 쓰는 게 최적
- every stage = Cutter gauntlet
- Wind LULL 기다리기만 정답
- moving train tech가 실패하면 Sector가 붕괴
- exact 440px max-range mandatory
- specific Build required
- 3-8처럼 left/center/right route choice Finale 반복

### Story

- 회사가 사고를 고의로 냈다고 확정
- 회사가 하층을 죽이려 했다고 확정
- Group C = lower feeder라고 확정
- Group A/B = upper trunk라고 확정
- Corporate executive order 공개
- Sector 05의 policy reveal 선점

### Runtime

- unverified moving collision을 LOCKED 기능처럼 문서화
- moving train을 static Surface teleport로 fake
- Cutter encounter에서 cross-zone multiplayer rope cut
- Wake를 client-local timer로 계산
- 4-8을 Sector05에 바로 연결

---

## 48. Sector 03 → 04 → 05 Story Handoff

### Sector 03

```text
ACCESS STRUCTURE EXISTS

EVACUATION ARCHIVE
+
ACCESS ARCHIVE
COEXIST
```

질문:

> 둘이 무슨 관계지?

### Sector 04

```text
LOWER ASCENT FEEDER
ISOLATED

UPPER EXPRESS TRUNK
LIMITED OPERATION
```

질문:

> 왜 이 Routing만 다르게 적용됐지?

### Sector 05

예약:

```text
WHO / WHY
POLICY / CORPORATE RECORD
```

즉:

```text
03
STRUCTURE

04
PHYSICAL / NETWORK CONSEQUENCE

05
DECISION / POLICY
```

순서.

---

## 49. Canonical Sector 04 — REV 1.0

```text
4-1 TRANSIT INTAKE
Speed Space Reveal
No Enemy

↓

4-2 CUTTER LINE
First Rope-Cut Tutorial
1 Stationary Cutter Sentry

↓

4-3 FREIGHT BYPASS
Cutter + Transit Wake

↓

4-4 INFRASTRUCTURE SERVICE NODE
REST
Growth HOLD
Routing Preview

↓

4-5 EXPRESS SHAFT
Pure High-Speed Rope Flow
Wake
No Enemy

↓

4-6 POWER RELAY SPAN
Cutter + Patrol separated
Rope Geometry
Moving Carrier optional only

↓

4-7 ISOLATION JUNCTION
1 Cutter + Wake
Story Pressure
Lower Feeder Isolation Reveal

↓

4-8 TRANSIT CONTROL TRUNK
1 Cutter + 1 Patrol + Wake
Continuous Momentum
→ Interruption
→ Recovery Finale

↓

POST-SECTOR 04
BOSS / TRANSITION
TBD
```

---

## OPEN QUESTIONS

### 1. Cutter Authoring Rule

Current code is negative-default:

```text
no-rope-cut
```

absence means rope-cut capable.

Before production Sector 04 integration:

```text
explicit rope-cut opt-in
```

으로 harden할지 개발 검토.

Gameplay meaning은 변하지 않는다.

### 2. Cutter Presentation

Underlying AI를 재사용하더라도:

```text
charge
projectile
trail
audio
```

는 일반 Projectile과 구분돼야 한다.

Exact VFX 아직 OPEN.

### 3. Transit Wake Tuning

1-6 Runtime 수치를 그대로 copy할 필요 없음.

Physics system은 reuse하되
Sector 04 stage별 strength/cycle은 HYPOTHESIS.

### 4. Moving Carrier

```text
OPTIONAL TECH SPIKE
```

Only.

PASS하지 않아도 Sector04 design 유지.

### 5. Growth Gate

4-4는 future slot일 뿐.

현재는:

```text
NO NEW GROWTH
```

### 6. Sector 03 Boss → 4-1 Entry

정확한 연결 OPEN.

4-1의 첫 공간은 설계 가능하지만
Gate / Timer / Checkpoint semantics는 Boss flow 확정 뒤 연결.

### 7. Sector 04 Boss

Identity / location / combat / reward 전부 OPEN.

4-8 내부 Boss 없음.

### 8. Sector 05 Story Scope

Sector05 Master Plan을 만들 때
Sector04의:

```text
Lower Feeder Isolation
```

에서 어느 정도 직접적인 Corporate Policy로 넘어갈지
다시 Story Disclosure audit 필요.

---

SECTOR 04 / TRANSIT & INFRASTRUCTURE MASTER PLAN — REV 1.0
