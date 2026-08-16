# SECTOR 06-2 — CROSSWIND MASTS

*BLOCKOUT CANDIDATE · REV 1.0*

◀ PREV — [SECTOR 06-1 / SKYBREAK ACCESS](../6-1/README.md) · NEXT — SECTOR 06-3 / PERIMETER SIGNAL DECK — 상세 문서 미작성 ▶

`SECTOR 06 ROOFTOP / EVACUATION` · `STAGE 02` · `KNOWN WIND MASTERY RECALL` · `OPEN-SKY LATERAL CROSSWIND`

| 항목 | 기준 |
|---|---|
| Status | HYPOTHESIS — BLOCKOUT CANDIDATE |
| Authoring Snapshot | `17ea485751effbbc996e3cc1c2a1f88547944888` |
| Sector Master | LOCAL REVIEWED — Sector06 Master REV 1.0 |
| Previous Stage | 6-1 SKYBREAK ACCESS REV 1.0 — LOCAL REVIEWED |
| Difficulty | ★★★☆ |
| Expected First Playtime | 115–165 sec |
| Expected Skilled Clear | 45–70 sec |
| Enemy | NONE |
| Wind | Continuous Crosswind ×1 |
| Wind Direction | `(-1, 0)` — RIGHT → LEFT |
| Wind Strength | `500` — REUSED CURRENT 1-6 CONTINUOUS BASELINE |
| Wind Falloff | `80` — REUSED CURRENT 1-6 BASELINE |
| Wind Cycle | NONE |
| Wind Shadow Requirement | NONE |
| Grounded Attenuation Requirement | NONE |
| Cutter | NONE |
| Patrol | NONE |
| Standard Sentry | NONE |
| Access Scan Field | NONE |
| Moving Platform / Train | NONE |
| Damage Hazard | NONE |
| New Player Input | NONE |
| New Rope Mode | NONE |
| New Growth | NONE |
| Foundation | CURRENT RUNTIME — selected Foundation KEEP |
| First Specialization | CONTENT BLOCKED / NOT REQUIRED |
| Legacy Artifact Layer | REMOVED FROM CURRENT RUNTIME |
| Required Kill | NONE |
| Internal Boss | NONE |
| Primary Spatial Identity | ONE-WAY ROOFTOP MAST TRAVERSE + ONE CONTINUOUS LATERAL WIND FIELD |
| Primary Role | 1-6에서 배운 Wind를 새 규칙 없이 Open-Sky lateral topology에서 다시 사용 |
| Story Role | Pad 방향으로 이어지는 Rooftop Service Mast Route가 살아 있음을 확인 |
| Stage-local Exit | Reach P4 Signal Service Deck → Gate Panel → Physical Crossing |
| Sector06 Runtime | NOT AUTHORED / NOT CONNECTED |
| Approved Gameplay Art | HOLD until Runtime Area / Camera Zone / Stable IDs exist |

---

## 0. 기획 기준

### LOCKED FOR THIS STAGE

6-2는:

```text
FIRST WIND TUTORIAL
NO
```

다.

Player는 이미 1-6에서:

- Wind가 Player body에 external force로 작용함
- Rope Anchor는 움직이지 않음
- Wind가 Swing Arc를 바꿈
- Wind를 이용하거나 거스를 수 있음
- Pulsed Wind는 phase를 읽을 수 있음

을 배웠다.

4-5에서는 같은 Wind Runtime을:

```text
VERTICAL WAKE
+
MOVEMENT ASSIST
```

로 재사용했다.

6-2의 질문은:

> **“Cycle을 기다릴 필요 없는 지속 Crosswind 안에서, 같은 바람이 이동 방향에 따라 도움과 저항 둘 다 된다는 것을 이용할 수 있는가?”**

### Stage Grammar

```text
SAFE WIND PREVIEW
↓
LEFTWARD WIND-ASSISTED CROSSING
↓
LEE-SIDE MAST ISLAND
↓
SHORT RIGHTWARD RE-ENTRY AGAINST WIND
↓
LEFTWARD WIND-ASSISTED EXIT
↓
PERIMETER SIGNAL DECK PREVIEW
```

### 금지

- Pulsed cycle
- LULL 대기
- 두 번째 Wind Zone
- Wind direction reversal
- Moving Wind volume
- Wind damage
- Fan blade hazard
- Enemy
- Scanner
- Cutter
- Patrol
- New input
- New Rope mode
- New growth
- Wind Shadow mandatory route
- Grounded attenuation mandatory route
- 4-5식 vertical Wind elevator
- 1-6식 `continuous → pulsed` tutorial repeat

---

## 0-1. 최신 GitHub / Runtime 교차검증

### CURRENT MAIN AT FINAL REVIEW

```text
17ea485751effbbc996e3cc1c2a1f88547944888
```

작성 중간에는 `5255f90b...`가 최신이었고,
최종 검토 직전 Sector06 Master가 PR #578로 병합되며 `17ea4857...`로 전진했다.

새 병합은 문서 범위이며
Rope / Wind Runtime은 변경하지 않았다.

현재 GitHub에는:

```text
Sector05
Master + 5-1~5-8

Sector06
Master REV 1.0
```

이 병합돼 있다.

따라서 6-2는 최신 GitHub Sector05 + Sector06 Master를 기준으로 최종 재베이스했다.

### VERIFIED — CURRENT ROPE

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

### VERIFIED — CURRENT WIND CONFIG

```text
groundedFactor
0.35

shadowFactor
0.15

defaultFalloff
0
```

### VERIFIED — CURRENT WORLD FORCE MODEL

Wind Zone은:

```text
STATIC RECTANGLE
```

이다.

지원:

```text
continuous
pulsed
arbitrary direction vector
per-zone strength
optional falloff
additive multiple zones
wind shadow
grounded attenuation
```

지원하지 않거나 6-2에서 사용하지 않음:

```text
moving force volume
random gust source
damage wind
moving anchor
```

### Current Continuous Behavior

```text
mode
continuous

phase
active

multiplier
1
```

즉 6-2에는:

```text
WAIT FOR LULL
```

가 존재하지 않는다.

---

## 0-2. Wind Precedent Audit

### 1-6 COOLING SHAFT — CURRENT RUNTIME

두 Zone.

Fan A:

```text
direction
(-1,0)

mode
continuous

strength
500

falloff
80
```

Fan B:

```text
direction
(+1,0)

mode
pulsed

strength
800

falloff
80

cycle
1.75 / 0.70 / 1.40 / 0.30
```

Role:

```text
FIRST WIND LEARNING
```

### 4-5 EXPRESS SHAFT — CURRENT RUNTIME

한 Zone.

```text
direction
(0,-1)

mode
pulsed

strength
360

cycle
1.75 / 0.70 / 1.40 / 0.30
```

Role:

```text
VERTICAL WAKE-ASSISTED MOVEMENT JOY
```

### 6-2 — SELECTED

```text
direction
(-1,0)

mode
continuous

strength
500

falloff
80
```

수치는 1-6 Fan A의
현재 shipped baseline을 재사용.

하지만 공간 역할은 다르다.

```text
1-6
vertical cooling shaft
wind tutorial

4-5
vertical express shaft
pulsed upward wake

6-2
open rooftop
lateral structural-island traverse
continuous crosswind mastery recall
```

### Classification

```text
500 / 80
VERIFIED EXISTING RUNTIME PRECEDENT

6-2에 같은 수치를 쓰는 것
HYPOTHESIS — NEW GEOMETRY PLAYTEST REQUIRED
```

---

## 0-3. Wind Shadow / Grounded Attenuation Discipline

현재 Runtime은:

```text
grounded
→ force × 0.35
```

그리고 Wind origin과 Player 사이가
solid occluder에 막히면:

```text
force × 0.15
```

추가 적용 가능.

### 6-2 Rule

Mandatory Route는 둘 다 없어도 성립해야 한다.

즉:

```text
WIND SHADOW
BONUS / INCIDENTAL ONLY

GROUNDED ATTENUATION
CURRENT RUNTIME EFFECT
BUT NOT PUZZLE KEY
```

### Collision Authoring Guard

Wind Zone 내부의 큰 Mast silhouette는:

```text
background-prop
gameplay:false
```

우선.

Gameplay Landing은:

```text
oneWay:true
```

계열을 우선해
의도치 않은 Wind Shadow를 만들지 않는다.

Solid non-oneWay structure를 넣으면
`windOccludingSurfaces()`에 잡힐 수 있으므로
Runtime authoring 시 별도 검증한다.

---

## 1. 한 줄 정의

6-1 Skybreak Access의 P4 Crown Deck에서 처음 Open Sky topology를 익힌 Player가, Crosswind Masts의 오른쪽 Entry Mast에서 streamers와 Scarf가 강하게 왼쪽으로 흐르는 것을 안전하게 읽은 뒤 하나의 `direction(-1,0) / continuous / strength500 / falloff80` Crosswind Field에 진입해 H2→H3을 따라 바람 방향과 같은 왼쪽으로 크게 이동하고, Field 바깥의 R1/P2 Lee-side Mast Island에서 완전히 안정된 뒤 P2→H4로 짧게 오른쪽으로 되돌아가 바람을 거스르는 Re-entry를 수행한 다음 H4→R2/H5에서 다시 왼쪽 Wind Assist를 받아 Signal Service Deck까지 빠져나오면서, Cycle이나 새 Wind 기믹 없이 이미 학습한 external-force 감각을 Open-Sky traversal에 적용하고 6-3 Perimeter Signal Deck의 Security가 아직 살아 있음을 예고받는 Sector06 첫 mastery-recall Stage.

---

## 2. 전체 게임에서의 역할

### 2-1. 6-1에서 공간을 배움

6-1:

```text
THE ROOM IS GONE
```

### 2-2. 6-2에서 Known Force를 다시 만남

6-2:

```text
THE WIND IS NOT NEW
THE CONTEXT IS
```

### 2-3. No Tutorial Text Dependency

Player에게:

```text
WIND PUSHES LEFT
```

를 긴 설명으로 다시 가르치지 않는다.

환경:

- streamer
- scarf
- dust
- rooftop vapor
- beacon ribbon

으로 읽힌다.

### 2-4. 6-3 대비

6-3은:

```text
STANDARD SENTRY
```

를 가져온다.

따라서 6-2는
Enemy를 전혀 넣지 않아
Wind mastery만 분리한다.

---

## 3. Story 역할

### Entry

```text
CROSSWIND MASTS

EXTERIOR SERVICE ROUTE
OPEN
```

### Mid

```text
ROOFTOP CROSSWIND
HIGH
```

정도의 짧은 환경 status 가능.

### Exit

```text
PERIMETER SIGNAL DECK

SECURITY
ACTIVE
```

### 아직 보여주지 않음

- Pad03 가까운 직접 visual
- Shuttle 가까운 직접 visual
- Access Denied
- Containment Violation final denial
- Final Security Encounter
- 새로운 Corporate policy 정보

Sector06 Story는 계속:

```text
KNOWLEDGE
→ ACTION
```

에 집중.

---

## 4. 공간 콘셉트

### CROSSWIND MASTS

Rooftop Crown 바깥쪽에
maintenance mast와 aviation signal structure가
한 방향으로 이어진 서비스 횡단로.

### Shape

```text
RIGHT ENTRY
↓
LEFTWARD WIND RUN
↓
LEFT OUTSIDE-WIND ISLAND
↓
SHORT RIGHTWARD RE-ENTRY
↓
LEFTWARD FINAL RELEASE
```

### Key Difference from 6-1

6-1:

```text
RIGHT
→ FAR LEFT
→ RIGHT
```

큰 V-shaped neutral traverse.

6-2:

```text
RIGHT
→ LEFT
→ small RIGHT
→ LEFT EXIT
```

대부분 한 방향으로 진행하는 Crosswind run.

### Key Difference from 4-5

```text
NO CENTRAL VERTICAL COLUMN
NO LONG UPWARD WAKE
```

---

## 5. Pixel / Grid 기준

### Base Grid

```text
32 px
```

### Map Hypothesis

```text
WIDTH
1408 px

X
-704 ~ +704

HEIGHT
1088 px

Y
0 ~ -1088
```

### Horizontal Travel

P0:

```text
x +544
```

에서 P4:

```text
x -608
```

까지 약:

```text
1152 px
```

왼쪽으로 이동.

### Vertical Gain

약:

```text
992 px
```

### Stage Read

Vertical ascent보다:

```text
LATERAL ROOFTOP CROSSING
```

이 먼저 느껴져야 한다.

---

## 6. 전체 맵 구조

```text
Y = 0

                                       P0 ENTRY
                                       (+544,0)
                                         /
                                    H1 (+352,-160)
                                      /
                                 P1 (+256,-224)
                                  [SAFE WIND PREVIEW]

          WIND:  <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
          ZONE:  x -448 ~ +480 / y -832 ~ -288

                              H2 (+32,-352)
                               /
                    H3 (-256,-480)
                       \
                        R1 (-560,-560)   OUTSIDE WIND
                          \
                           P2 (-512,-640) LEE MAST ISLAND
                             \
                              H4 (-320,-736)  IN WIND
                               \
                     R2 (-608,-800) OUTSIDE
                         \
                          H5 (-576,-864) OUTSIDE
                           \
                            P4 (-608,-992)
                            SIGNAL SERVICE EXIT

Y = -1088
```

---

## 7. Zone 구성

### Z0 — Wind Preview

```text
P0 → H1 → P1
```

Wind Zone OUT.

Player가:

- streamer left
- scarf left
- vapor left

를 먼저 본다.

### Z1 — First Wind-Assisted Crossing

```text
P1 → H2 → H3
```

H2/H3:

```text
WIND IN
```

진행 방향:

```text
LEFT
```

Wind 방향:

```text
LEFT
```

따라서 assist.

### Z2 — Lee-side Neutral Island

```text
H3 → R1 → P2
```

R1/P2:

```text
WIND OUT
```

완전 안정.

### Z3 — Short Windward Re-entry

```text
P2 → H4
```

P2는 Wind OUT.
H4는 Wind IN.

이 연결은:

```text
RIGHTWARD
```

이라 Wind를 짧게 거스른다.

### Z4 — Final Assisted Exit

```text
H4 → R2 → H5 → P4
```

H4에서 다시 왼쪽으로 빠지며
Wind direction을 이용.

R2/H5/P4는 Wind OUT.

---

## 8. 좌표 / 오브젝트

모두:

```text
HYPOTHESIS — BLOCKOUT
```

### 8-1. Landing / Recovery

| ID | Center | Size | Role |
|---|---:|---:|---|
| P0 | `(+544, 0)` | `320×32` | Entry Mast Deck |
| P1 | `(+256, -224)` | `288×32` | Safe Wind Preview |
| R1 | `(-560, -560)` | `224×20` | First Wind Recovery |
| P2 | `(-512, -640)` | `288×32` | Lee-side Mast Island |
| R2 | `(-608, -800)` | `224×20` | Second Wind Recovery |
| P4 | `(-608, -992)` | `352×32` | Signal Service Exit Deck |

### 8-2. Grapple Landmarks

| ID | Position | Form | Role |
|---|---:|---|---|
| H1 | `(+352, -160)` | Entry mast bracket | Wind-free approach |
| H2 | `(+32, -352)` | Crosswind truss joint | First wind attach |
| H3 | `(-256, -480)` | Mid-span beacon bracket | Assisted crossing |
| H4 | `(-320, -736)` | Return-side mast bracket | Against-wind re-entry |
| H5 | `(-576, -864)` | Signal lattice joint | Final wind exit |

### 8-3. Wind Zone W1

```text
ID
sector-06-02:crosswind-main

bounds
x -448 ~ +480
y -832 ~ -288

equivalent
triggerBounds(-448,-832,928,544)

direction
(-1,0)

mode
continuous

strength
500

falloff
80
```

### 8-4. Wind Membership

```text
P0 OUT
H1 OUT
P1 OUT

H2 IN
H3 IN

R1 OUT
P2 OUT

H4 IN

R2 OUT
H5 OUT
P4 OUT
```

### 8-5. Visual Wind Source

6-2에는 거대한 Fan 없음.

Wind는:

```text
AMBIENT ROOFTOP CROSSWIND
```

로 해석.

WorldForceField는
별도 physical fan object 없이
static zone 자체로 힘을 계산할 수 있다.

### 8-6. Stable ID 후보

```text
sector-06-02:p0
sector-06-02:p1
sector-06-02:r1
sector-06-02:p2
sector-06-02:r2
sector-06-02:p4

sector-06-02:hardpoint-h1
sector-06-02:hardpoint-h2
sector-06-02:hardpoint-h3
sector-06-02:hardpoint-h4
sector-06-02:hardpoint-h5

sector-06-02:crosswind-main
```

---

## 9. Safe Route

### Route

```text
P0
→ H1
→ P1
→ H2
→ H3
→ R1
→ P2
→ H4
→ R2
→ H5
→ P4
```

### Distance Pre-check

| Link | Distance |
|---|---:|
| P0 → H1 | `249.9 px` |
| H1 → P1 | `115.4 px` |
| P1 → H2 | `258.0 px` |
| H2 → H3 | `315.2 px` |
| H3 → R1 | `314.4 px` |
| R1 → P2 | `93.3 px` |
| P2 → H4 | `214.7 px` |
| H4 → R2 | `295.0 px` |
| R2 → H5 | `71.6 px` |
| H5 → P4 | `131.9 px` |

### Result

```text
MAX SAFE LINK
= 315.2 px

HOOK REACH
= 400 px

MARGIN
= 84.8 px
```

### Active Wind Mandatory Max

```text
H2 → H3
315.2 px
```

---

## 10. Flow Route

### Route

```text
P0
→ H1
→ H2
→ H3
→ H4
→ H5
→ P4
```

P1 / R1 / P2 / R2 Landing을 생략.

### Distance Pre-check

| Link | Distance |
|---|---:|
| P0 → H1 | `249.9 px` |
| H1 → H2 | `373.2 px` |
| H2 → H3 | `315.2 px` |
| H3 → H4 | `263.9 px` |
| H4 → H5 | `286.2 px` |
| H5 → P4 | `131.9 px` |

### Result

```text
MAX FLOW LINK
= 373.2 px

HOOK REACH
= 400 px

MARGIN
= 26.8 px
```

### Important

```text
H1 → H2
373.2 px
```

는 Wind Zone 진입 전에서
첫 Wind attach로 가는 Flow-only skip.

Safe Route는:

```text
H1 → P1 → H2
115.4 / 258.0
```

이다.

### Flow Meaning

숙련 Player는
Wind Field에서 Landing하지 않고:

```text
assist
→ controlled resistance
→ assist
```

를 연속으로 읽을 수 있다.

---

## 11. Wind Interaction Contract

### First Crossing

```text
P1 → H2 → H3
```

Player progression:

```text
LEFT
```

Wind:

```text
LEFT
```

따라서:

```text
ASSIST
```

### Re-entry

```text
P2 → H4
```

Player progression:

```text
RIGHT
```

Wind:

```text
LEFT
```

따라서:

```text
RESISTANCE
```

### Exit

```text
H4 → H5
```

다시:

```text
LEFT
```

으로 빠지며 Assist.

### Core Lesson

새 설명 없이:

> **“같은 바람도 내가 어느 방향으로 움직이느냐에 따라 의미가 달라진다.”**

를 실행으로 확인.

---

## 12. Recovery

### R1

```text
(-560,-560)
```

Wind Zone 왼쪽 바깥.

H3 crossing 실패 시
완전 neutral landing.

### P2

```text
(-512,-640)
```

Main Lee-side Mast Island.

### R2

```text
(-608,-800)
```

H4 Re-entry 실패 후
Wind 바깥에서 안정.

### Target

일반 miss:

```text
≤ 5 sec
```

안에 main progression 복귀.

### No Instant Death

```text
Sky void
≠ instant death
```

### No Recovery Wind Dependency

R1/R2는:

```text
Wind Shadow
```

덕분에 안전한 것이 아니라
Zone bounds 자체 바깥이라 안전.

---

## 13. Wind Shadow / Occlusion Safety

### Current Code Risk

`windOccludingSurfaces()`는:

```text
windOcclusion === true
```

또는:

```text
collision !== false
AND
oneWay !== true
```

인 surface를 occluder로 사용.

### 6-2 Authoring Rule

Wind Zone 내부:

- landing platform → oneWay
- decorative mast body → background / collision false
- grapple landmark → current target/landmark contract
- no mandatory solid wall

권장.

### Why

6-2에서 Player가 갑자기:

```text
mast 뒤에서는 바람이 15%로 줄어듦
```

을 퍼즐 핵심으로 읽게 만들지 않는다.

Wind Shadow는 존재해도
Stage solution의 조건이 아니다.

---

## 14. Enemy / Hazard

```text
Enemy
NONE

Projectile
NONE

Cutter
NONE

Patrol
NONE

Scanner
NONE

Damage Wind
NONE

Fan Contact
NONE
```

Wind는:

```text
MOVEMENT FORCE
```

일 뿐.

---

## 15. Foundation Expression

### IMPULSE COIL

Wind-assisted H2→H3 / H4→H5에서:

```text
exposure compression
+
landing skip
```

가능.

### RELAY LINK

Wind가 궤적을 바꾸는 상황에서
H2/H3/H4/H5 chain 안정화.

### SHEAR CURRENT

Enemy 없음.

Offense value:

```text
NONE
```

정상.

### Mandatory

```text
NO FOUNDATION REQUIRED
```

---

## 16. Story Trigger

### S0 — Entry

```text
CROSSWIND MASTS

EXTERIOR SERVICE ROUTE
OPEN
```

### S1 — P2

Optional environmental status:

```text
ROOFTOP CROSSWIND
HIGH
```

### S2 — Exit

```text
PERIMETER SIGNAL DECK

SECURITY
ACTIVE
```

### Story Discipline

Sector05 WHO / WHY를 반복하지 않는다.

Pad03 direct visual은 아직 6-4 소유.

---

## 17. Camera

모두:

```text
HYPOTHESIS
```

### C0 — Wind Preview

```text
P0 / H1 / P1 / H2
+
leftward streamer field

Desktop
0.96

Mobile
0.72
```

### C1 — First Crossing

```text
P1 / H2 / H3 / R1

Desktop
0.88

Mobile
0.68
```

### C2 — Lee-side Island

```text
H3 / R1 / P2 / H4

Desktop
0.94

Mobile
0.70
```

### C3 — Re-entry / Exit

```text
P2 / H4 / R2 / H5 / P4

Desktop
0.90

Mobile
0.68
```

### Required

P2에서:

```text
H4
+
R2
+
H5
```

가 Re-entry 전에 보여야 한다.

---

## 18. Gate Contract

Stage-local intent:

```text
Reach P4
→ Gate Panel
→ Gate Open
→ Physical Crossing
→ 6-3
```

### Runtime

Sector06:

```text
NOT AUTHORED
```

### P4

```text
(-608,-992)
```

### Panel / Gate

Runtime Area 작성 시
6-3 Entry direction과 함께 확정.

### No Kill

Enemy가 없으므로
당연히 Kill requirement 없음.

---

## 19. Geometry Repetition Audit

### 6-1 비교

6-1:

```text
RIGHT
→ FAR LEFT
→ RIGHT
```

큰 V.

6-2:

```text
RIGHT
→ LEFT
→ SHORT RIGHT RE-ENTRY
→ LEFT EXIT
```

전체 displacement는 계속 왼쪽.

### 1-6 비교

1-6:

```text
VERTICAL SHAFT
2 WIND LESSONS
continuous + pulsed
```

6-2:

```text
LATERAL ROOFTOP
1 CONTINUOUS FIELD
```

### 4-5 비교

4-5:

```text
CENTRAL VERTICAL WAKE
pulsed
direction (0,-1)
```

6-2:

```text
LATERAL CROSSWIND
continuous
direction (-1,0)
```

### Exact Coordinate Audit

후보 주요 좌표를:

- Sector05 5-1~5-8 reviewed / merged geometry
- 6-1 reviewed geometry
- GitHub actual 1-6
- GitHub actual 4-5

와 비교.

목표:

```text
EXACT MAJOR-POINT OVERLAP
0
```

최종 자동검사에서 확인.

---

## 20. Pixel Art Asset Spec

### Environment

- antenna service mast
- aviation beacon frame
- rooftop truss
- narrow maintenance platform
- signal cable housing
- far skyline

### Wind Visual

색상이 아니라 움직임.

권장:

- red scarf
- small maintenance streamers
- vapor streak
- dust / rain mist candidate
- cable flag
- rotating rooftop vent cap

### Cyan

계속:

```text
ROPE / GRAPPLE LANDMARK
```

전용.

### Wind

Cyan vector line 금지.

---

## 21. Background / Parallax

### Far

- sky
- city below
- distant corporate crowns

### Mid

- non-colliding antenna towers
- signal arrays
- maintenance frames

### Near

- wind streamer
- mast bracket
- service rail

### Critical

Guy wire / antenna wire를
Rope Target처럼 보이게 하지 않는다.

### Parallax

Crosswind VFX와 background movement가
Hook aim target을 가리지 않게 한다.

---

## 22. Sound / VFX

### Wind Sound

6-1 ambient보다
명확히 강해짐.

하지만:

```text
phase cue
```

가 아니다.

Continuous이므로
경고/활성/감쇠 audio cycle 없음.

### Streamer

항상 왼쪽.

### Scarf

Wind Zone 진입 시
leftward response 강화.

### Exit

6-3 Security preview를 위해
아주 먼 security hum / signal ping 가능.

Projectile sound 없음.

---

## 23. Multiplayer Contract

### Wind

같은 shared Wind Zone.

각 Player position에 대해
동일 elapsed world state에서 sampling.

Continuous이므로
phase divergence 문제 없음.

### Different Pace

Player A가 P2,
Player B가 H2에 있어도
각 위치에 맞는 force만 받음.

### Recovery

R1/R2 폭은
2인 동시 landing 후보로 충분히 확보.

### Gate

```text
shared open
individual physical crossing
```

원칙 유지.

---

## 24. PASS Criteria

### Runtime Alignment

- current main `5255f90...` 기준
- Hook Reach 400
- continuous Wind supported
- direction `(-1,0)` supported
- strength500/falloff80 = current 1-6 precedent
- groundedFactor0.35 acknowledged
- shadowFactor0.15 acknowledged
- no mandatory shadow dependency

### Gameplay

- Enemy 0
- one Wind Zone only
- continuous only
- no cycle waiting
- no damage Wind
- P0/H1/P1 OUT
- H2/H3 IN
- R1/P2 OUT
- H4 IN
- R2/H5/P4 OUT
- Safe max 315.2px
- Flow max 373.2px
- all links <400px
- active Wind Safe max 315.2px
- recovery visible before commitment
- no instant death
- no Foundation lock

### Repetition

- not 1-6 tutorial structure
- not 4-5 vertical wake
- not 6-1 V-shaped neutral traverse
- exact major-coordinate overlap 0 against audited sets

### Story

- Pad03 direct reveal 없음
- new conspiracy 없음
- 6-3 Security preview만
- Escape motivation 유지

### Production

- Runtime implementation HOLD
- Approved Gameplay Art HOLD
- physical PASS not claimed before graybox

---

## 25. FAIL Conditions

### Wind

- second zone 추가
- pulsed cycle 추가
- wait-for-lull mandatory
- Wind damage
- random gust
- direction reversal
- moving zone
- mandatory Wind Shadow
- solid mast가 의도치 않게 route마다 shadow 생성

### Geometry

- central vertical column
- 4-5의 W1~W5 vertical chain 복제
- active-wind mandatory high-380s
- invisible recovery
- P2에서 H4/R2/H5 미리 안 보임
- guy wire가 live Rope target처럼 보임
- one miss → unrecoverable sky

### Gameplay

- Enemy 추가
- Scanner 추가
- New input
- New Rope mode
- Build lock

### Story

- Pad03 / Shuttle close reveal 조기 사용
- Access Denied
- Sector05 WHO/WHY 재설명

### Product

- Sector06 Runtime 조기 구현
- Approved Art 생성
- distance precheck를 physics PASS로 표현

---

## 26. 개발자 / 기획자 최종 전달 요약

### Stage

```text
SECTOR 06-2
CROSSWIND MASTS
```

### Core

```text
KNOWN WIND
NEW TOPOLOGY
```

### Wind

```text
ONE STATIC ZONE

direction
(-1,0)

mode
continuous

strength
500

falloff
80
```

### Current Global Wind Runtime

```text
groundedFactor
0.35

shadowFactor
0.15

defaultFalloff
0
```

### Route

```text
SAFE
P0 → H1 → P1 → H2 → H3 → R1 → P2 → H4 → R2 → H5 → P4

FLOW
P0 → H1 → H2 → H3 → H4 → H5 → P4
```

### Geometry

```text
SAFE MAX
315.2 px

FLOW MAX
373.2 px

HOOK REACH
400 px
```

### Wind Membership

```text
P1 OUT
H2 IN
H3 IN
R1/P2 OUT
H4 IN
R2/H5 OUT
```

### Story

```text
CROSSWIND MASTS
EXTERIOR SERVICE ROUTE OPEN
```

Exit:

```text
PERIMETER SIGNAL DECK
SECURITY ACTIVE
```

### Stage Feeling

> **“바람 자체는 이미 안다. 이번에는 기다릴 phase도, Enemy도 없다. 열린 옥상에서 같은 지속 Crosswind를 등에 받고 왼쪽으로 크게 건넌 뒤, 잠깐 바람을 거슬러 다음 Mast에 들어갔다가 다시 그 힘을 이용해 빠져나오는 것으로 ‘배운 시스템을 새 공간에서 쓸 수 있는가’를 묻는다.”**

---

## OPEN QUESTIONS

### 1. Strength 500

현재 shipped 1-6 continuous baseline을 그대로 사용.

장점:

```text
new tuning invention 없음
```

단점:

Open Sky topology에서
체감이 더 강할 수 있음.

따라서:

```text
HYPOTHESIS IN 6-2
```

이고 실제 graybox에서 검증.

### 2. Falloff 80

현재 1-6 baseline.

Zone 경계 진입/이탈을 부드럽게 해
Open Sky에서 갑작스러운 lateral jerk를 줄일 가능성이 있음.

유지 우선.

### 3. P2 → H4 Against-Wind Re-entry

거리:

```text
214.7px
```

로 짧게 잡았다.

바람을 거스르는 mastery를 보여주되
range challenge와 겹치지 않게 하기 위함.

### 4. R1 / R2 위치

둘 다 Zone 밖.

Wind Shadow를 사용한 shelter가 아니다.

이 원칙 유지 권장.

### 5. Solid Mast Collision

Visual mast body에 실제 solid collision이 필요하면
Wind origin line을 가리는지 반드시 `WorldForceField` 기준 재검증.

의도치 않은 `shadowFactor 0.15`가 생기면:

- collision false background mast
- geometry 이동
- explicit shadow design

중 하나로 정리.

### 6. Flow H1 → H2

```text
373.2px
```

Flow-only.

Mobile 반복 miss가 높으면 H2를 8~16px 오른쪽/아래로 조정.

Safe는 P1 경유.

### 7. 6-3 Handoff

6-3:

```text
PERIMETER SIGNAL DECK
STANDARD SENTRY ×1
```

6-2 P4는
Sentry activation 전 Safe Deck이 되도록
6-3 상세 작성 시 방향을 함께 맞춘다.

### 8. 6-3 Before Authoring

다시 확인:

- latest GitHub main
- current Standard Sentry runtime
- 1-3 actual Sentry geometry
- 5-5 Standard Sentry geometry
- 6-1 / 6-2 geometry signatures

후 좌표 결정.

---

SECTOR 06-2 / CROSSWIND MASTS — BLOCKOUT CANDIDATE · REV 1.0
