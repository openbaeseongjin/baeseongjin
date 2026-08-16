# SECTOR 05-4 — CONTINUITY SERVICE NODE

*BLOCKOUT CANDIDATE · REV 1.0*

◀ PREV — [SECTOR 05-3 / SECURITY REVIEW FLOOR](../5-3/README.md) · NEXT — [SECTOR 05-5 / CORPORATE TRANSFER HALL](../5-5/README.md) ▶

`SECTOR 05 CORPORATE ZONE` · `STAGE 04` · `REST / CAPACITY EVIDENCE` · `GROWTH HOLD`

| 항목 | 기준 |
|---|---|
| Status | HYPOTHESIS — BLOCKOUT CANDIDATE |
| Authoring Snapshot | `33bdb4997a85330c6b338a7fd06f1ae508767a93` |
| Sector Master | LOCAL REVIEWED — GitHub merge pending |
| 5-1 ~ 5-3 | LOCAL REVIEWED — GitHub merge pending |
| Difficulty | REST |
| Expected First Playtime | 60–90 sec |
| Expected Skilled Clear | 25–40 sec |
| Enemy | NONE |
| Cutter | NONE |
| Patrol | NONE |
| Standard Sentry | NONE |
| Wind / Transit Wake | NONE |
| Access Scan Field | NONE |
| Moving Platform / Train | NONE |
| New Player Input | NONE |
| New Rope Mode | NONE |
| Primary Spatial Rule | SEALED SURFACE / SERVICE HARDPOINT |
| Foundation | CURRENT RUNTIME — selected Foundation KEEP |
| First Specialization | CONTENT BLOCKED / NOT REQUIRED |
| New Growth | NONE |
| Legacy Artifact Layer | REMOVED FROM CURRENT RUNTIME |
| Required Kill | NONE |
| Design Checkpoint / Reward | NONE |
| Health Refill | NONE ADDED |
| Timer Pause | NONE |
| Boss | NONE |
| Stage Role | 5-3 Cutter 압박 이후 Decompression + 첫 Grid Capacity 원인 단서 |
| Stage-local Exit | Reach Final Service Deck → Gate Panel → Physical Crossing |
| Sector 05 Runtime | NOT CONNECTED |
| Approved Gameplay Art | HOLD until Runtime Area / Camera Zone / Stable IDs exist |

---

## 0. 기획 기준

### LOCKED FOR THIS STAGE

5-3은:

```text
SPARSE HARDPOINT
+
CUTTER
+
PRE-PLANNED RECOVERY
```

를 동시에 읽었다.

5-4에서는 전부 끈다.

```text
NO ENEMY
NO CUTTER
NO PATROL
NO WIND
NO SCANNER
NO MOVING PLATFORM
```

### Core Question

> **“위협이 없는 상태에서 Corporate Continuity 시스템을 읽었을 때, 사고 이후 실제로 부족했던 것은 무엇이었는가?”**

### REST의 정확한 의미

```text
REST
≠ TIMER PAUSE
≠ HEALTH REFILL
≠ CHECKPOINT REWARD
≠ BUILD REROLL
≠ NEW GROWTH
```

REST는 오직:

```text
THREAT-FREE SPACE
```

를 뜻한다.

Sector 일반 Timer는 기존 제품 계약대로 계속 진행한다.

Gate에 기존 Timer replenish 규칙이 있다면
그 규칙만 그대로 사용한다.

### Gameplay Function

```text
DECOMPRESSION
+
CORPORATE HARDPOINT RULE CONTINUITY
+
CAPACITY EVIDENCE
+
5-5 PRIORITY REVEAL SETUP
```

### 금지

- New Growth
- Augment Node
- Specialization Node
- Artifact Reward
- Health Station
- Timer Freeze
- Enemy
- Cutter
- Patrol
- Scanner
- Wind
- Moving Platform
- Mandatory Terminal Interaction
- Long Story Dump
- `UPPER CONTROL / EVACUATION MAINTAIN` 공개
- `LOWER ASCENT SUSPENSION AUTHORIZED` 공개
- `LOWER SECTORS EVACUATION SUSPENDED` 공개
- Named villain
- Accident conspiracy

---

## 0-1. 최신 GitHub / Runtime 기준

### CURRENT MAIN AT AUTHORING

```text
33bdb4997a85330c6b338a7fd06f1ae508767a93
```

작성 시점 최신 `main`에는
Sector05 Runtime 추가가 없다.

### Current Rope Contract

```text
Hook Speed                 1400 px/s
Hook Flight Ratio          2 / 7 sec
Derived Hook Reach         400 px
Hook Reload                0.20 sec
Attach Buffer              0.10 sec
Swing Drag Min Hold        0.08 sec
Swing Impulse              780
Release Angular Transfer   0.55
```

### Current Foundation

```text
IMPULSE COIL
+180 release impulse

RELAY LINK
0.65 sec release window
0.16 sec attach buffer
108 aim tolerance

SHEAR CURRENT
20 damage
```

Foundation은 구현돼 있고
선택 상태는 Sector transition 사이 유지되는 방향.

### First Specialization

```text
NODE SKELETON
IMPLEMENTED

CONTENT / EFFECTS
PENDING
```

따라서 5-4에서도:

```text
NOT REQUIRED
```

### Legacy Artifact

```text
REMOVED
```

5-4에 새 보상을 만들지 않는다.

---

## 0-2. 4-4 REST와의 차이

### 4-4

```text
INFRASTRUCTURE SERVICE NODE

질문:
Lower Feeder 상태가 왜 이상하지?

Reveal:
STATUS SEGMENTED
TELEMETRY PARTIAL
```

### 5-4

```text
CONTINUITY SERVICE NODE

질문:
사고 뒤 실제 시스템 여유가 충분했나?

Reveal:
GRID CAPACITY
CRITICAL DEFICIT
```

### 차이

4-4:

```text
NETWORK STATE ANOMALY
```

5-4:

```text
SYSTEM CAPACITY LIMIT
```

이다.

따라서 같은 REST라도
Story 기능이 중복되지 않는다.

---

## 0-3. 5-3 → 5-4 → 5-5 Rhythm

### 5-3

```text
CUTTER
+
RECOVERY PRE-PLANNING
```

### 5-4

```text
ZERO THREAT
+
CAPACITY EVIDENCE
```

### 5-5

```text
STANDARD SENTRY
+
PATROL
+
SEQUENTIAL SECURITY
+
UPPER PRIORITY MAINTAINED REVEAL
```

5-4는:

```text
“왜 모든 것을 동시에 살리지 못했는가?”
```

의 조건만 보여준다.

```text
“그래서 무엇을 우선했는가?”
```

의 답은 5-5가 소유한다.

---

## 1. 한 줄 정의

5-3 Security Review Floor에서 Cutter 압박을 통과하고 Incident Review Archive의 존재를 확인한 Player가 위협이 완전히 사라진 Corporate Continuity Service Node에 들어와, 적은 Service Hardpoint만 노출된 짧고 조용한 Maintenance Spine을 현재 Foundation 상태 그대로 지나며 숨을 고르고, 중앙 P2 Capacity Overview Deck에서 처음으로 `VERTICAL GRID / AVAILABLE CAPACITY — CRITICAL DEFICIT / MULTI-SECTOR STABLE OPERATION — UNAVAILABLE`이라는 시스템 상태를 자동으로 확인해 사고 이후 모든 Sector를 동시에 정상 운영할 충분한 여유가 없었다는 사실만 확정한 뒤, 아직 무엇을 우선하고 무엇을 중단했는지는 모르는 상태로 5-5 Corporate Transfer Hall에 진입하는 Sector05 Rest / Capacity Evidence Stage.

---

## 2. 전체 게임에서의 역할

### 2-1. Mechanical Decompression

5-3:

```text
Cutter Telegraph
+
Rope Cut Risk
+
Recovery Plan
+
Sparse Hardpoint
```

를 처리했다.

5-4는:

```text
STOP READING THREATS
START READING SYSTEM STATE
```

구간.

### 2-2. Corporate Spatial Rule 유지

Rest라고 해서
Sector05의 Hardpoint grammar를 버리지 않는다.

계속:

```text
SEALED SURFACE
=
NOT GRAPPLEABLE

SERVICE HARDPOINT
=
GRAPPLEABLE
```

이다.

### 2-3. Foundation Continuity

새 Build를 고르지 않는다.

짧은:

```text
RELEASE
→ NEXT HARDPOINT
→ RELEASE
```

에서 현재 Foundation의 손맛만 자연스럽게 유지.

### 2-4. Story Causality Ladder

이번 Stage는:

```text
CAPACITY
```

까지만 확정.

다음 Stage부터:

```text
PRIORITY
→ AUTHORIZATION
→ CONSEQUENCE
```

로 넘어간다.

---

## 3. Story 역할

### S0 — Entry

5-3 Exit를 이어받는다.

```text
CONTINUITY SERVICE NODE

LOCAL ACCESS
AVAILABLE
```

### S1 — Capacity Overview — MANDATORY TRAVERSAL BEAT

P2 접근.

권장 Display:

```text
VERTICAL GRID

AVAILABLE CAPACITY
CRITICAL DEFICIT

MULTI-SECTOR
STABLE OPERATION
UNAVAILABLE
```

### Player가 확정할 수 있는 것

```text
Cascade 이후
전력 / 제어 용량이
모든 Sector를 동시에 안정 운영하기엔 부족했다.
```

### Player가 아직 확정할 수 없는 것

```text
어느 Sector를 먼저 살렸는가?
누가 Priority를 정했는가?
왜 Lower Ascent가 중단됐는가?
Evacuation을 일부러 멈췄는가?
```

### S2 — Exit

```text
CORPORATE TRANSFER HALL

CONTINUITY ROUTING
AHEAD
```

### 절대 아직 쓰지 않는 문구

```text
UPPER CONTROL
MAINTAIN

UPPER EVACUATION
MAINTAIN
```

5-5 소유.

---

## 4. 공간 콘셉트

### CONTINUITY SERVICE NODE

Corporate public-facing space 뒤에 숨은
작은 Emergency Continuity service bay.

### 공간 언어

```text
LOW NOISE
PALE SERVICE WALL
RECESSED CAPACITY DISPLAY
MAINTENANCE HARDPOINTS
SEALED CORPORATE PANELS
SHORT SAFE SPINE
```

### 5-1과 차이

5-1:

```text
large Corporate threshold
visual reset
```

5-4:

```text
small service control pocket
system evidence
```

### 4-4와 차이

4-4가:

```text
industrial routing bay
```

였다면 5-4는:

```text
clean continuity service room
```

이다.

---

## 5. Pixel / Grid 기준

### Base Grid

```text
32 px
```

### Map Hypothesis

```text
WIDTH
1152 px

X
-576 ~ +576

HEIGHT
1088 px

Y
0 ~ -1088
```

### Hardpoint

```text
24–32 px
```

### Deck

```text
224–416 px
```

### Capacity Display

큰 화면이더라도
Rope affordance보다 낮은 contrast.

### Color

```text
Hardpoint
CYAN

Capacity warning
MUTED AMBER / WHITE

Danger Red
MINIMAL
```

Enemy가 없으므로
빨간 전투 언어를 만들지 않는다.

---

## 6. 전체 맵 구조

```text
Y = 0

P0 ENTRY
  \
   H1
    \
     P1 QUIET SERVICE DECK
       \
        H2
         \
          P2 CAPACITY OVERVIEW
          [GRID CAPACITY STATUS]
            \
             H3
              \
               R1
                \
                 H4
                  \
                   P4 FINAL SERVICE DECK
                   PANEL / GATE

Y = -1088
```

### Route Identity

```text
ONE QUIET HARDPOINT SPINE
```

Route Puzzle 아님.

Safe와 Flow의 차이는
landing 횟수 정도.

---

## 7. Zone 구성

### Z0 — Decompression

```text
P0 → H1 → P1
```

Threat 없음.

5-3 Cutter audio / visual pressure를 끊는다.

### Z1 — Capacity Overview

```text
P1 → H2 → P2
```

P2는 Stage에서 가장 넓은 Safe Deck.

여기서 S1 Capacity Beat.

### Z2 — Foundation Continuity

```text
P2 → H3 → R1 → H4
```

짧은 Corporate Hardpoint chain.

### Z3 — Exit

```text
H4 → P4
```

5-5 Transfer Hall preview.

---

## 8. 좌표 / 오브젝트

전부:

```text
HYPOTHESIS — BLOCKOUT
```

### 8-1. Landing / Recovery

| ID | Center | Size | Role |
|---|---:|---:|---|
| P0 | `(-448, 0)` | `352×32` | Entry |
| P1 | `(-192, -288)` | `320×32` | Quiet Service Deck |
| P2 | `(+128, -544)` | `416×32` | Capacity Overview Deck |
| R1 | `(-224, -768)` | `224×24` | Optional Recovery |
| P4 | `(+320, -992)` | `416×32` | Final Service Deck |

### 8-2. Service Hardpoints

| ID | Position | Role |
|---|---:|---|
| H1 | `(-256, -160)` | Entry Hardpoint |
| H2 | `(+16, -400)` | Capacity Approach Hardpoint |
| H3 | `(-64, -672)` | Lower Service Hardpoint |
| H4 | `(+32, -864)` | Final Service Hardpoint |

### 8-3. Capacity Display N1

```text
Position
(+256,-544)
```

Role:

```text
NON-COLLIDING
NON-GRAPPLEABLE
NON-INTERACTIVE
STORY DISPLAY
```

### 8-4. Sealed Surface 후보

```text
sector-05-04:sealed-west
sector-05-04:sealed-capacity-wall
sector-05-04:sealed-east
sector-05-04:sealed-upper-panel
```

전부:

```text
grappleable:false
```

후보.

### 8-5. Stable ID 후보

```text
sector-05-04:p0
sector-05-04:p1
sector-05-04:p2
sector-05-04:r1
sector-05-04:p4

sector-05-04:hardpoint-h1
sector-05-04:hardpoint-h2
sector-05-04:hardpoint-h3
sector-05-04:hardpoint-h4

sector-05-04:capacity-display
```

---

## 9. Safe Route

### Route

```text
P0
→ H1
→ P1
→ H2
→ P2
→ H3
→ R1
→ H4
→ P4
```

### Distance Pre-check

| Link | Distance |
|---|---:|
| P0 → H1 | `249.9 px` |
| H1 → P1 | `143.1 px` |
| P1 → H2 | `236.2 px` |
| H2 → P2 | `182.4 px` |
| P2 → H3 | `230.8 px` |
| H3 → R1 | `186.6 px` |
| R1 → H4 | `273.4 px` |
| H4 → P4 | `315.2 px` |

### Result

```text
MAX SAFE LINK
= 315.2 px

CURRENT DERIVED HOOK REACH
= 400 px

MARGIN
= 84.8 px
```

### Intent

REST Stage의 Mandatory Route는
Aim precision 시험이 아니다.

---

## 10. Flow Route

### Route

```text
P0
→ H1
→ H2
→ H3
→ H4
→ P4
```

P1 / P2 / R1 landing을 생략 가능.

### Distance Pre-check

| Link | Distance |
|---|---:|
| P0 → H1 | `249.9 px` |
| H1 → H2 | `362.7 px` |
| H2 → H3 | `283.5 px` |
| H3 → H4 | `214.7 px` |
| H4 → P4 | `315.2 px` |

### Result

```text
MAX FLOW LINK
= 362.7 px
```

### Design Intent

숙련자는 Story trigger를 지나면서도
movement lock 없이 Flow를 유지.

하지만 Story를 아예 건너뛰지는 못하게
S1 Trigger는 broad traversal volume으로 둔다.

---

## 11. REST Contract

### 정확한 상태

```text
Enemy
0

Cutter
0

Patrol
0

Standard Sentry
0

Wind
0

Scanner
0

Damage Hazard
0
```

### REST가 아닌 것

```text
SAFE ROOM WITH HEAL
NO

BUILD SHOP
NO

CHECKPOINT REWARD
NO

TIMER FREEZE
NO
```

### Sector Timer

```text
CONTINUES
```

### Gate

기존 replenish rule만 사용.

Stage-specific bonus time 없음.

---

## 12. Growth / Build Contract

### Foundation

```text
KEEP
```

현재 선택을 그대로 유지.

### First Specialization

```text
NOT REQUIRED
```

### New Growth

```text
NONE
```

### Legacy Artifact

```text
REMOVED
```

### No Calibration Apparatus

5-4 중앙에:

```text
AUGMENT NODE
SPECIALIZATION NODE
CALIBRATION DEVICE
REWARD ALTAR
```

없음.

### Why

5-4의 중앙 오브젝트는:

```text
CAPACITY STATUS DISPLAY
```

하나면 충분하다.

---

## 13. Foundation Expression

### IMPULSE COIL

Flow Route에서:

```text
H1 → H2
H3 → H4
```

landing skip이 자연스러움.

### RELAY LINK

짧은 Hardpoint chain에서
Release→Re-attach 리듬이 편해짐.

### SHEAR CURRENT

Enemy 없음.

```text
offense value
NONE
```

정상.

### Important

모든 Foundation이
매 Stage에서 같은 가치를 줄 필요는 없다.

5-4의 목적은:

```text
REST
+
STORY
```

이다.

---

## 14. Capacity Evidence Contract

### N1

P2 주변.

표시:

```text
VERTICAL GRID

AVAILABLE CAPACITY
CRITICAL DEFICIT

MULTI-SECTOR
STABLE OPERATION
UNAVAILABLE
```

### 확정되는 인과 단계

```text
Cascade
→ capacity shortage
```

까지만.

### 아직 확정 금지

```text
capacity shortage
→ upper priority
```

5-5.

```text
upper priority
→ lower ascent suspension authorization
```

5-6.

```text
authorization
→ lower evacuation suspended
```

5-7.

### 중요

이 Stage는 Corporate의 도덕적 판단을
아직 보여주는 곳이 아니다.

먼저:

```text
REAL CONSTRAINT
```

을 보여준다.

---

## 15. Story Trigger

### S0 — Entry

```text
CONTINUITY SERVICE NODE

LOCAL ACCESS
AVAILABLE
```

### S1 — P2 Mandatory

Broad traversal trigger.

```text
VERTICAL GRID

AVAILABLE CAPACITY
CRITICAL DEFICIT

MULTI-SECTOR
STABLE OPERATION
UNAVAILABLE
```

### S2 — Exit

```text
CORPORATE TRANSFER HALL

CONTINUITY ROUTING
AHEAD
```

### Presentation

- no terminal interaction
- no movement lock
- no modal
- no long paragraph

### Flow Player

P2 landing을 생략해도
S1 broad trigger를 지나도록 배치.

---

## 16. Story Disclosure Boundary

### 이번 Stage에서 확정

```text
The post-Cascade system
did not have enough available capacity
for stable multi-sector operation.
```

### 아직 숨김

```text
Upper control priority
```

5-5.

```text
Upper evacuation capacity priority
```

5-5.

```text
Lower ascent suspension authorized
```

5-6.

```text
Lower evacuation suspended
```

5-7.

```text
Incident Continuity Control
organizational responsibility
```

5-8.

### Accident Canon

여전히:

```text
CASCADE
=
REAL INCIDENT
```

회사 고의 사고 아님.

---

## 17. Recovery

### P1

Entry 후 첫 넓은 Safe Deck.

### P2

가장 넓은 Story Deck.

### R1

후반 Movement miss catch.

### Target

일반 miss:

```text
≤ 5 sec
```

안에 같은 progression band 복귀.

### No Full Reset

H3/H4 miss가
P0 reset이면 FAIL.

### No Damage

Recovery는 단순 movement recovery.

---

## 18. Hardpoint / Sealed Surface Contract

### Hardpoints H1~H4

5-1~5-3과 동일한:

```text
cyan maintenance housing
+
distinct silhouette
```

family.

### Sealed Surface

```text
grappleable:false
```

visual language 유지.

### No Parent Bypass

Hardpoint 뒤:

```text
always-grappleable large wall
```

금지.

### Rest Stage에서도 중요

Threat가 없기 때문에
Player가 Corporate spatial grammar를
더 명확하게 읽을 수 있는 구간이기도 하다.

---

## 19. Camera

모든 값 HYPOTHESIS.

### C0 — Entry Decompression

```text
P0 / H1 / P1

Desktop 0.98
Mobile  0.74
```

### C1 — Capacity Overview

```text
P1 / H2 / P2 / N1

Desktop 0.96
Mobile  0.72
```

### C2 — Quiet Chain

```text
P2 / H3 / R1 / H4

Desktop 0.94
Mobile  0.72
```

### C3 — Exit

```text
H4 / P4 / Gate
+
5-5 Transfer Hall preview

Desktop 1.00
Mobile  0.74
```

### Camera Goal

5-3보다 조금 가까워지고
화면 안정감을 높인다.

---

## 20. Gate Contract

Stage-local intent:

```text
Reach P4
→ Gate Panel
→ Gate Open
→ Physical Crossing
→ 5-5
```

### Runtime

Sector05:

```text
NOT CONNECTED
```

현재는 Design Contract.

### Candidate

P4:

```text
(+320,-992)
```

Panel:

```text
(+448,-992)
```

Gate:

```text
(+544,-992)
```

### No New Interaction

기존 contextual interact 재사용.

### No Reward

Gate는 단순 progression boundary.

---

## 21. Pixel Art Asset Spec

### Continuity Service Node

- clean pale service wall
- recessed utility panel
- minimal exposed conduit
- cyan service hardpoint
- central capacity display
- corporate finish surrounding hidden infrastructure

### N1 Capacity Display

색:

```text
white
+
muted amber
```

권장.

### 금지

- red catastrophe alarm
- casualty icon
- executive portrait
- priority class diagram
- Lower-sector map highlight

이번 Stage는:

```text
constraint
```

만 보여준다.

---

## 22. Background / VFX / Sound

### Far

- quiet upper building shaft
- distant control-room glow
- sealed service cores

### Mid

- power/control bus behind glass
- clean service cabinet
- hidden cable channel

### Near

- sparse hardpoint frame
- capacity display housing

### VFX

위협 없음.

- subtle status pulse
- small capacity graph animation
- quiet indicator sweep

### Sound

5-3 Cutter charge / projectile layer를 완전히 제거.

```text
quiet HVAC
+
low electrical load hum
+
soft system confirmation
```

### S1

경보음이 아니라:

```text
warning-status chime
```

정도.

---

## 23. Multiplayer Contract

### Threat

없음.

### Hardpoints

shared.

single-user occupancy 없음.

### Story

S1 Capacity fact는 shared world fact.

한 Player가 먼저 Trigger해도:

```text
other player movement lock
NONE
```

### Different Pace

Player A가 P2를 지나고
Player B가 P1에 있어도 정상.

### Gate

```text
shared open
individual physical crossing
```

유지.

### Timer

한 Player가 Story를 읽는 동안에도
Sector general timer 계약은 그대로.

---

## 24. PASS Criteria

### Gameplay

- REST
- Enemy 0
- Cutter 0
- Patrol 0
- Standard Sentry 0
- Wind 0
- Scanner 0
- Moving Platform 0
- Health refill 없음
- Timer pause 없음
- Reward 없음
- Growth 없음
- Foundation reset 없음
- Safe max 315.2px
- Flow max 362.7px
- all links <400px
- broad Story trigger가 Flow Route에서도 통과
- Recovery ≤5 sec
- no Foundation lock

### Story

- `GRID CAPACITY — CRITICAL DEFICIT` 확정
- stable multi-sector operation unavailable 확정
- Upper priority 미공개
- Lower suspension authorization 미공개
- Lower evacuation suspension 미공개
- Named decision-maker 미공개

### Production

- Runtime implementation HOLD
- Approved Gameplay Art HOLD
- direct 5-4→5-5 Runtime wiring 없음

---

## 25. FAIL Conditions

### Gameplay

- Rest에서 Enemy 등장
- Health Station 추가
- Timer freeze
- Augment/Reward 선택
- Hardpoint chain이 380~400px precision test
- Story를 읽기 위해 Terminal interact 강제
- Flow Route가 S1 Story를 완전히 우회
- H3/H4 miss → P0 reset
- Sealed Surface rule을 버리고 모든 wall grappleable

### Story

- 5-4에서 Upper priority 확정
- Lower ascent suspension authorized 공개
- Lower evacuation suspended 공개
- `Corporate chose upper over lower`를 직접 문장으로 설명
- Named villain
- Company caused Cascade 암시

### Production

- Sector05 Runtime 구현
- final art 승인
- 5-5 Enemy를 실제 pre-spawn
- Boss/Transition 추정

---

## 26. 개발자 / 기획자 최종 전달 요약

### Stage

```text
SECTOR 05-4
CONTINUITY SERVICE NODE
```

### Role

```text
REST
+
CAPACITY EVIDENCE
```

### Core

```text
THREAT-FREE
SHORT HARDPOINT SPINE
```

### Geometry

```text
SAFE MAX
315.2 px

FLOW MAX
362.7 px

HOOK REACH
400 px
```

### Growth

```text
NONE
```

### Timer / Health

```text
TIMER PAUSE
NONE

HEALTH REFILL
NONE
```

### Story

```text
VERTICAL GRID

AVAILABLE CAPACITY
CRITICAL DEFICIT

MULTI-SECTOR
STABLE OPERATION
UNAVAILABLE
```

### Meaning

```text
REAL SYSTEM CONSTRAINT
CONFIRMED
```

but:

```text
PRIORITY DECISION
NOT YET REVEALED
```

### Do Not Add

- Enemy
- Cutter
- Patrol
- Wind
- Scanner
- Reward
- Growth
- Heal
- Timer Pause
- Boss

### Stage Feeling

> **“처음으로 아무것도 나를 공격하지 않는다. 조용한 시스템 화면을 지나며 확인한 것은 음모가 아니라, 사고 뒤 모든 구역을 동시에 살릴 만큼의 여유가 실제로 없었다는 사실이다.”**

---

## OPEN QUESTIONS

### 1. Capacity Wording

현재 후보:

```text
AVAILABLE CAPACITY
CRITICAL DEFICIT

MULTI-SECTOR
STABLE OPERATION
UNAVAILABLE
```

`UNAVAILABLE`이 너무 절대적이면:

```text
NOT SUSTAINABLE
```

후보 검토.

핵심은:

```text
capacity constraint
```

확정.

### 2. Numerical Capacity Value

현재는 실제 수치:

```text
42%
63%
MW
```

등을 쓰지 않는다.

공식 Lore 숫자가 확정되지 않았으므로
임의 수치 금지.

### 3. Flow H1→H2 362.7px

Rest Stage Flow-only 후보.

초행에서 Hardpoint scarcity가 너무 빡빡하면
H2를 8~16px inward.

Safe Route는 이미 315.2px 이하.

### 4. Story Trigger Persistence

Flow Player가 빠르게 지나도
Capacity status를 읽을 수 있도록
display persistence를 길게 둘지
상세 presentation 단계에서 결정.

movement lock은 사용하지 않는다.

### 5. 5-5 Handoff

5-5가 처음으로:

```text
UPPER CONTROL
MAINTAIN

UPPER EVACUATION CAPACITY
MAINTAIN
```

를 공개.

5-4 Exit에서는:

```text
CONTINUITY ROUTING
AHEAD
```

까지만.

### 6. 4-4 Repetition Check

둘 다 REST이지만:

```text
4-4
routing anomaly

5-4
capacity constraint
```

차이가 실제 플레이에서도 느껴지는지
Full Game Audit에서 재검증.

### 7. Timer Budget

REST라고 Timer가 멈추지 않는다.

Story 읽기 때문에 유저가 손해 본다고 느끼면
Timer를 Stage-specific으로 멈추기보다:

- Story visibility
- persistence
- walk-through readability

를 먼저 조정.

---

SECTOR 05-4 / CONTINUITY SERVICE NODE — BLOCKOUT CANDIDATE · REV 1.0
