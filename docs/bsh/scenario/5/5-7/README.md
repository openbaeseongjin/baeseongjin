# SECTOR 05-7 — EVACUATION ARCHIVE

*BLOCKOUT CANDIDATE · REV 1.0*

◀ PREV — [SECTOR 05-6 / INCIDENT COMMAND ANNEX](../5-6/README.md) · NEXT — [SECTOR 05-8 / CONTINUITY CONTROL SPINE](../5-8/README.md) ▶

`SECTOR 05 CORPORATE ZONE` · `STAGE 07` · `STORY-HEAVY SPARSE ASCENT` · `EVACUATION OUTCOME REVEAL`

| 항목 | 기준 |
|---|---|
| Status | HYPOTHESIS — BLOCKOUT CANDIDATE |
| Authoring Snapshot | `28d99edd464c66ca5be37bc1708e9e4d7d61ae14` |
| Sector Master | LOCAL REVIEWED — GitHub merge pending |
| 5-1 ~ 5-6 | LOCAL REVIEWED — GitHub merge pending |
| Difficulty | ★★★★ |
| Expected First Playtime | 145–190 sec |
| Expected Skilled Clear | 50–75 sec |
| Enemy | Patrol Drone T1 ×1 |
| Patrol Rope Cut | NONE — `cutter-fire` ABSENT |
| Cutter | NONE |
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
| Boss | NONE |
| Stage Role | 짧은 Patrol interruption 뒤 긴 Threat-free Archive evidence ascent |
| Story Role | `LOWER SECTORS — EVACUATION STATUS: SUSPENDED` 최초 명시 |
| Stage-local Exit | Reach Final Archive Deck → Gate Panel → Physical Crossing |
| Sector 05 Runtime | NOT AUTHORED / NOT CONNECTED |
| Approved Gameplay Art | HOLD until Runtime Area / Camera Zone / Stable IDs exist |

---

## 0. 기획 기준

### LOCKED FOR THIS STAGE

5-6에서 Player는:

```text
INCIDENT RESPONSE
POST-CASCADE

LOWER ASCENT ROUTING
SUSPENSION AUTHORIZED
```

를 확인했다.

5-7은 다음 질문에 답한다.

> **“그 승인 조치는 실제 Evacuation 운영에 어떤 결과를 만들었는가?”**

Gameplay 질문은 deliberately 가볍다.

> **“이미 숙련된 Hardpoint + Patrol 규칙을 짧게 통과한 뒤, 전투 방해 없이 기록을 읽으며 계속 상승할 수 있는가?”**

### Core Grammar

```text
ENTRY
↓
PATROL PREVIEW
↓
ONE SHORT PATROL BAND
↓
FULL SAFE ARCHIVE DECK
↓
EVIDENCE A
↓
QUIET HARDPOINT ASCENT
↓
EVIDENCE B
LOWER EVACUATION SUSPENDED
↓
FINAL CLEAN FLOW
↓
5-8 AUTHORITY RECORD PREVIEW
```

### 중요

이번 Stage는:

```text
COMBAT PEAK
NO
```

이다.

5-6이 Gameplay / Policy Action Peak였고,
5-7은:

```text
STORY CONSEQUENCE PEAK
```

이다.

### 금지

- Cutter
- Standard Sentry
- 두 번째 Patrol
- Scanner
- Wind
- Moving Platform
- New Input
- New Rope Mode
- New Growth
- Kill Gate
- long combat after outcome reveal
- Mandatory terminal interaction
- Lower-sector casualty count
- trapped population number
- named executive
- final organization identity
- Rooftop Pad 03 final route reveal
- accident intentionality claim

---

## 0-1. 최신 GitHub / Runtime 교차검증

### CURRENT MAIN AT AUTHORING

```text
28d99edd464c66ca5be37bc1708e9e4d7d61ae14
```

최근 main은 debug / multiplayer / deployment 계열이 크게 전진했다.

### VERIFIED — CURRENT HOOK / ROPE

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

### VERIFIED — CURRENT COMBAT

```text
Enemy Health                100
Enemy Attack Range          760
Acquire                     0.25 sec
Track                       0.80 sec
Lock                        0.20 sec
Fire Flash                  0.08 sec
Enemy Fire Interval         1.00 sec
Enemy Projectile Speed      520
Enemy Projectile Radius     7
Enemy Projectile Damage     20
Rope Disabled On Cut        0.60 sec
```

### CURRENT PATROL BEHAVIOR

```text
NO ELIGIBLE TARGET
→ PATROL

ELIGIBLE TARGET
→ PATROL PAUSE
→ AIM / FIRE

TARGET INVALID
→ PATROL RESUME
```

5-7도 이를 전제로 한다.

### Patrol Baseline

```text
speed
48

waitSeconds
0.45

mode
pingpong
```

### CURRENT ROPE-CUT SEMANTICS — IMPORTANT DRIFT

최신 `EnemyObject.js`:

```text
canCutRope
=
rules.includes("cutter-fire")
```

즉 과거의:

```text
absence of no-rope-cut
=
Cutter
```

semantics는 RETIRED.

5-7 Patrol은:

```text
cutter-fire
ABSENT
```

이므로 Rope를 자르지 않는다.

---

## 0-2. Current Authored Runtime Boundary Drift

### Current default authored world

최신:

```text
SECTOR 01
+
SECTOR 02
+
SECTOR 03
```

가 연결돼 있다.

### Sector04

별도:

```text
SECTOR_04_AREA_CATALOG
```

이 존재하지만

```text
3-8
→
Post-Sector03 Boss / Transition TBD
```

경계를 존중해 default current world에는 직접 연결하지 않는다.

### Sector05

```text
NOT AUTHORED
NOT CONNECTED
```

### Later Alignment Queue — RESOLVED (Sector 05 통합 시 함께 반영)

```text
5-3 Cutter
→ cutter-fire positive opt-in

5-6 Cutter
→ cutter-fire positive opt-in
```

5-3 §0-1/§8-3, 5-6 §0-1/§8-7을 `cutter-fire` opt-in 기준으로 정정 완료.
Stage redesign 없이 Runtime rule wording만 정렬했다.

5-5의 `no-rope-cut` wording은 재확인 결과 수정이 필요 없었다 —
opt-in 모델에서도 `no-rope-cut` 자체는 여전히 유효한 명시적 표기이며,
5-5는 opt-out 모델을 전제한 설명 문구를 포함하지 않았다.

### Existing Sector04 Alignment Risk — RESOLVED (FALSE ALARM)

Standalone Sector04 catalog의 4-1 A4 좌표:

```text
A4
(-64,-800)
```

는 "known problem"이 아니었다. Sector 04 재검증 결과, 4-1의 Mandatory
Safe Route는 이 좌표 그대로 M1/R3를 경유해 이미 400px 이내로 연결되어
있었다(§0-1 GitHub 재검증, PR #576). 좌표 변경은 필요하지 않았고
이루어지지도 않았다.

---

## 0-3. 5-6 → 5-7 → 5-8 역할

### 5-6

```text
ACTION

LOWER ASCENT ROUTING
SUSPENSION AUTHORIZED
```

### 5-7

```text
CONSEQUENCE

LOWER SECTORS
EVACUATION STATUS
SUSPENDED
```

### 5-8

```text
RESPONSIBILITY / WHY

ORGANIZATIONAL DIRECTIVE
+
ROOFTOP PAD 03
```

따라서 5-7에서는:

```text
결과
```

는 명확하게 보여주되

```text
최종 조직 Identity / directive summary
```

는 아직 보여주지 않는다.

---

## 1. 한 줄 정의

5-6 Incident Command Annex에서 Lower Ascent Routing의 중단이 Cascade 이후 승인된 Incident Response 조치였음을 확인한 Player가 Evacuation Archive에 진입해, 초반 Safe Preview Deck에서 Archive 통로를 천천히 순찰하는 Patrol Drone 한 대와 H2–H3 Service Hardpoint를 읽은 뒤 짧은 Activation Band만 통과하고, R1과 P2부터는 모든 적 압박이 끝난 Threat-free Archive ascent를 이어가며 `EVACUATION ARCHIVE / POST-CASCADE / LOWER-SECTOR TRANSFER STATUS`를 확인하고, 다음 P3 Evidence Deck에서 마침내 `LOWER SECTORS / EVACUATION STATUS / SUSPENDED`라는 실제 운영 결과를 명확히 확인한 뒤, 그 중단의 승인 조직과 전체 Continuity Directive는 아직 보지 못한 상태로 `CONTINUITY CONTROL SPINE / AUTHORITY RECORDS AHEAD`를 따라 5-8로 이동하는 Sector05 Story Consequence Stage.

---

## 2. 전체 게임에서의 역할

### 2-1. Threat Density 감소

5-5:

```text
Standard + Patrol
```

5-6:

```text
Standard Route vs Cutter Route
```

5-7:

```text
Patrol ×1
ONLY
```

### 2-2. Patrol의 역할도 축소

5-2:

```text
PATROL TIMING
=
STAGE CORE
```

5-5:

```text
PATROL
=
SECOND SECURITY PROFILE
```

5-7:

```text
PATROL
=
SHORT ARCHIVE INTERRUPTION
```

이다.

### 2-3. Story Reading Space

Stage 절반 이상은:

```text
NO ENEMY ACTIVATION
```

이어야 한다.

### 2-4. Consequence Confirmation

5-6에서:

```text
authorized
```

를 봤다.

5-7에서:

```text
operational outcome
```

을 본다.

이 둘을 분리해
Story causality를 한 화면 dump로 만들지 않는다.

---

## 3. Story 역할

### S0 — Entry

```text
EVACUATION ARCHIVE

POST-INCIDENT RECORDS
AVAILABLE
```

### S1 — P2 Archive Index

```text
EVACUATION ARCHIVE

POST-CASCADE

LOWER-SECTOR TRANSFER STATUS
RECORD AVAILABLE
```

### S2 — P3 Outcome Reveal — PRIMARY

```text
LOWER SECTORS

EVACUATION STATUS
SUSPENDED
```

### Player가 확정할 수 있는 것

```text
Lower Ascent 중단 승인은
실제 Lower-sector Evacuation 운영 중단으로 이어졌다.
```

### 중요한 한계

이 문구는:

```text
evacuation suspended
```

를 뜻한다.

다음을 뜻하지 않는다.

```text
all lower residents died
all evacuation became permanently impossible
company intended casualties
```

### S3 — Exit

```text
CONTINUITY CONTROL SPINE

AUTHORITY RECORDS
AHEAD
```

5-8 preview.

---

## 4. 공간 콘셉트

### EVACUATION ARCHIVE

Corporate Zone의
Emergency circulation 기록을 보관하는
긴 Archive Spine.

### 공간 언어

- tall dark archive glass
- white recessed data wall
- sparse cyan maintenance hardpoints
- quiet record displays
- one short patrol corridor
- long empty evidence mezzanine

### Primary Feeling

> **“보안은 오히려 줄었는데, 기록이 더 직접적이 된다.”**

### Corporate Hierarchy Expression

기록 공간 자체도:

```text
clean
controlled
quiet
well-powered
```

상태.

그 안에:

```text
LOWER EVACUATION
SUSPENDED
```

기록이 차갑게 남아 있다.

---

## 5. Pixel / Grid 기준

### Base Grid

```text
32 px
```

### Map Hypothesis

```text
WIDTH
1536 px

X
-768 ~ +768

HEIGHT
1664 px

Y
0 ~ -1664
```

### Hardpoint

```text
24–32 px
```

### Archive Deck

Story read deck은:

```text
320–480 px
```

폭 권장.

### Story Display

Hardpoint보다 낮은 gameplay contrast.

### Colors

```text
Hardpoint
CYAN

Patrol / Projectile
ORANGE / RED

Archive Text
WHITE / MUTED AMBER
```

Outcome Reveal을
과도한 blood-red alarm으로 만들지 않는다.

---

## 6. 전체 맵 구조

```text
Y = 0

P0 ENTRY
  \
   H1
    \
     P1 SAFE PATROL / ARCHIVE PREVIEW

          H2
           \
         [D1 PATROL]
             \
              H3
               \
                R1
                 \
                  P2 ARCHIVE INDEX
                  [EVIDENCE A]

                     H4
                      \
                       P3 OUTCOME DECK
                       [EVIDENCE B]
                          \
                           H5
                            \
                             H6
                              \
                               P5 FINAL ARCHIVE DECK
                               PANEL / GATE

Y = -1664
```

### Threat Distribution

```text
EARLY 35%
PATROL

LATE 65%
THREAT-FREE STORY / MOVEMENT
```

---

## 7. Zone 구성

### Z0 — Entry

```text
P0 → H1 → P1
```

D1 activation OUT.

### Z1 — Patrol Preview

P1에서 한 화면:

```text
D1 corridor
H2
H3
R1
```

확인.

### Z2 — Short Patrol Band

```text
P1 → H2 → H3 → R1
```

H2/H3:

```text
D1 activation IN
```

R1:

```text
OUT
```

### Z3 — Archive Index

```text
R1 → P2
```

Enemy 완전 OUT.

S1 Story.

### Z4 — Outcome Ascent

```text
P2 → H4 → P3
```

S2 Primary Reveal.

Enemy 없음.

### Z5 — Quiet Final Flow

```text
P3 → H5 → H6 → P5
```

No threat.

5-8 Authority record preview.

---

## 8. 좌표 / 오브젝트

전부:

```text
HYPOTHESIS — BLOCKOUT
```

### 8-1. Landing / Recovery / Story Deck

| ID | Center | Size | Role |
|---|---:|---:|---|
| P0 | `(-480, 0)` | `352×32` | Entry |
| P1 | `(-320, -352)` | `352×32` | Safe Patrol Preview |
| R1 | `(+320, -800)` | `224×24` | Patrol Recovery |
| P2 | `(+256, -928)` | `416×32` | Archive Index Deck |
| P3 | `(-256, -1184)` | `448×32` | Evacuation Outcome Deck |
| P5 | `(+160, -1568)` | `448×32` | Final Archive Deck |

### 8-2. Service Hardpoints

| ID | Position | Role |
|---|---:|---|
| H1 | `(-288, -192)` | Entry Hardpoint |
| H2 | `(-96, -512)` | Patrol Entry Hardpoint |
| H3 | `(+128, -704)` | Patrol Exit Hardpoint |
| H4 | `(0, -1056)` | Archive Transition Hardpoint |
| H5 | `(+64, -1312)` | Final Flow Hardpoint A |
| H6 | `(-160, -1440)` | Final Flow Hardpoint B |

### 8-3. Patrol D1

```text
Initial Position
(+160,-640)

Type
patrol-drone-t1
```

Patrol Corridor:

```text
(-160,-640)
↔
(+160,-640)
```

Patrol:

```text
speed
48

waitSeconds
0.45

mode
pingpong
```

Rules / capability intent:

```text
standard projectile behavior
kill optional
activation-band-only
target-lock-cycle

cutter-fire
ABSENT
```

### 8-4. D1 Activation

```text
X
-192 ~ +192

Y
-768 ~ -448
```

Membership:

```text
P1 OUT

H2 IN
H3 IN

R1 OUT
P2 OUT
```

### 8-5. Story Displays

A1:

```text
Position
(+352,-928)

Role
Archive Index
```

A2:

```text
Position
(-64,-1184)

Role
Primary Evacuation Outcome
```

### 8-6. Stable ID 후보

```text
sector-05-07:hardpoint-h1
sector-05-07:hardpoint-h2
sector-05-07:hardpoint-h3
sector-05-07:hardpoint-h4
sector-05-07:hardpoint-h5
sector-05-07:hardpoint-h6

sector-05-07:patrol-d1

sector-05-07:archive-index-display
sector-05-07:evacuation-status-display
```

### 8-7. Sealed Surface 후보

```text
sector-05-07:sealed-archive-west
sector-05-07:sealed-patrol-glass
sector-05-07:sealed-index-wall
sector-05-07:sealed-outcome-wall
sector-05-07:sealed-upper-stack
```

모두:

```text
grappleable:false
```

후보.

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
→ P3
→ H5
→ H6
→ P5
```

### Distance Pre-check

| Link | Distance |
|---|---:|
| P0 → H1 | `271.5 px` |
| H1 → P1 | `163.2 px` |
| P1 → H2 | `275.3 px` |
| H2 → H3 | `295.0 px` |
| H3 → R1 | `214.7 px` |
| R1 → P2 | `143.1 px` |
| P2 → H4 | `286.2 px` |
| H4 → P3 | `286.2 px` |
| P3 → H5 | `344.7 px` |
| H5 → H6 | `258.0 px` |
| H6 → P5 | `344.7 px` |

### Result

```text
MAX SAFE LINK
= 344.7 px

CURRENT DERIVED HOOK REACH
= 400 px

MARGIN
= 55.3 px
```

### Intent

Story-heavy Stage이므로
Mandatory geometry를 넉넉하게 둔다.

---

## 10. Flow Route

### Route

```text
P0
→ H1
→ H2
→ H3
→ P2
→ H4
→ H5
→ H6
→ P5
```

P1 / R1 / P3 landing을 생략 가능.

### Distance Pre-check

| Link | Distance |
|---|---:|
| P0 → H1 | `271.5 px` |
| H1 → H2 | `373.2 px` |
| H2 → H3 | `295.0 px` |
| H3 → P2 | `258.0 px` |
| P2 → H4 | `286.2 px` |
| H4 → H5 | `263.9 px` |
| H5 → H6 | `258.0 px` |
| H6 → P5 | `344.7 px` |

### Result

```text
MAX FLOW LINK
= 373.2 px

CURRENT DERIVED HOOK REACH
= 400 px

MARGIN
= 26.8 px
```

### Important

Flow-only high link:

```text
H1 → H2
373.2 px
```

Patrol active Mandatory Safe link는
최대 295px.

---

## 11. Patrol Contract

### D1

```text
Patrol Drone T1 ×1
```

### Rope Cut

Current semantics:

```text
cutter-fire
ABSENT
```

따라서:

```text
canCutRope
false
```

### Before Activation

P1:

```text
D1 patrols
```

### In Activation

Player H2/H3:

```text
D1 patrol pauses
→ acquire
→ track
→ lock
→ fire
```

### Outside

R1/P2:

```text
new acquire
NONE
```

### Kill

```text
OPTIONAL
```

### Mandatory Wait

없음.

D1 corridor 어느 위치에서도
Safe Route 통과 가능해야 한다.

---

## 12. 5-2 / 5-5 Patrol과의 차이

### 5-2

```text
PATROL POSITION
=
PRIMARY ENTRY-TIMING LESSON
```

### 5-5

```text
PATROL
=
SECOND SECURITY PROFILE
AFTER STANDARD SENTRY
```

### 5-7

```text
PATROL
=
SHORT NARRATIVE GATE
```

### Design Requirement

Player가 5-7을 기억할 때:

```text
“Patrol Stage”
```

보다:

```text
“Evacuation Suspended 기록을 본 Stage”
```

로 기억해야 한다.

### Therefore

- activation 짧게
- recovery 바로 제공
- Patrol 이후 Enemy 0
- Story deck 넓게
- 후반 Flow clean

유지.

---

## 13. Evidence Ladder

5-7 안에서도 Story를 두 단계로 나눈다.

### Evidence A — P2

```text
EVACUATION ARCHIVE

POST-CASCADE

LOWER-SECTOR TRANSFER STATUS
RECORD AVAILABLE
```

기능:

```text
“이제 actual evacuation result를 본다.”
```

준비.

### Evidence B — P3

```text
LOWER SECTORS

EVACUATION STATUS
SUSPENDED
```

기능:

```text
OUTCOME CONFIRMATION
```

### Why Split

P2와 P3 사이
짧은 Rope 이동을 둬
Player가:

```text
authorization
```

과:

```text
actual outcome
```

을 사고 단계로 분리해 받아들이게 한다.

### 금지

한 화면에:

```text
capacity
priority
authorization
outcome
organization
```

전부 나열.

---

## 14. Recovery

### P1

Patrol 진입 전 Safe Preview.

### R1

Patrol miss / body hit 후
activation 밖 Recovery.

### P2

Full Safe Archive Index.

### P3

Full Safe Story Deck.

### Target

Patrol band miss:

```text
≤ 4 sec
```

안에 R1 / P2.

후반 movement miss:

```text
≤ 5 sec
```

안에 동일 progression band.

### No Full Reset

P3/H5/H6 miss가
P0까지 떨어지면 FAIL.

---

## 15. Foundation Expression

### IMPULSE COIL

Patrol band:

```text
exposure compression
```

후반:

```text
clean landing skip
```

### RELAY LINK

Sparse H1→H2→H3,
H4→H5→H6 chain에서 유리.

### SHEAR CURRENT

D1에 optional damage 가능.

그러나:

```text
Patrol kill
```

은 Stage 목적이 아니다.

### Mandatory

```text
NO FOUNDATION REQUIRED
```

### First Specialization

```text
NOT REQUIRED
```

---

## 16. Difficulty / Fairness Contract

### Difficulty ★★★★

전투 수가 많아서 ★★★★가 아니다.

난이도는:

```text
late-sector sparse Hardpoint confidence
+
one readable Patrol interruption
+
continuous upward flow
```

에서 나온다.

### Story Readability Priority

Gameplay difficulty가
S2 Outcome을 읽는 데 방해하면:

```text
Gameplay를 낮춘다.
```

Story display를 작게 하거나
Player를 억지로 멈추지 않는다.

### No Punishment for Reading

Sector timer는 계속 가지만
Story를 읽기 위해 긴 정지 시간을 요구하지 않는다.

---

## 17. Story Trigger

### S0 — Entry

```text
EVACUATION ARCHIVE

POST-INCIDENT RECORDS
AVAILABLE
```

### S1 — P2 Broad Trigger

```text
EVACUATION ARCHIVE

POST-CASCADE

LOWER-SECTOR TRANSFER STATUS
RECORD AVAILABLE
```

### S2 — P3 Broad Trigger — PRIMARY

```text
LOWER SECTORS

EVACUATION STATUS
SUSPENDED
```

### S3 — Exit

```text
CONTINUITY CONTROL SPINE

AUTHORITY RECORDS
AHEAD
```

### Presentation

- no interact requirement
- no movement lock
- persistent enough to read while moving
- P2/P3 enemy activation OUT
- no modal
- no voice monologue required

---

## 18. Story Disclosure Boundary

### 5-4

```text
CAPACITY
CRITICAL DEFICIT
```

### 5-5

```text
UPPER CONTROL / EVACUATION CAPACITY
MAINTAIN
```

### 5-6

```text
LOWER ASCENT ROUTING
SUSPENSION AUTHORIZED
POST-CASCADE
```

### 5-7

```text
LOWER SECTORS
EVACUATION STATUS
SUSPENDED
```

### Now Confirmed

Player는 이제 다음 연결을 합리적으로 할 수 있다.

```text
Real capacity shortage
↓
Upper capabilities preserved
↓
Lower ascent suspension authorized
↓
Lower-sector evacuation suspended
```

### Still Hidden for 5-8

```text
exact organizational authority
full directive framing
final WHY summary
Rooftop Pad 03 operational route
```

### Still NOT Established

```text
Company caused Cascade.
```

### Still NOT Established

```text
Suspension was ordered to kill lower residents.
```

---

## 19. Camera

모두 HYPOTHESIS.

### C0 — Archive Entry

```text
P0 / H1 / P1
+
archive scale

Desktop 0.94
Mobile 0.72
```

### C1 — Patrol Preview

```text
P1
full D1 corridor
H2
H3
R1

Desktop 0.88
Mobile 0.68
```

### C2 — Archive Index

```text
R1 / P2 / A1 / H4

Desktop 0.96
Mobile 0.72
```

### C3 — Outcome Reveal

```text
H4 / P3 / A2 / H5

Desktop 0.98
Mobile 0.74
```

S2가 가장 잘 읽혀야 한다.

### C4 — Final Clean Flow

```text
P3 / H5 / H6 / P5 / Gate

Desktop 0.92
Mobile 0.70
```

### Required

P3에서:

```text
LOWER SECTORS
EVACUATION STATUS
SUSPENDED
```

가 Rope / Hardpoint보다 우선하지 않으면서도
즉시 읽혀야 한다.

---

## 20. Gate Contract

Stage-local intent:

```text
Reach P5
→ Gate Panel
→ Gate Open
→ Physical Crossing
→ 5-8
```

### Runtime

Sector05:

```text
NOT AUTHORED
NOT CONNECTED
```

현재는 Design Contract.

### Candidate

P5:

```text
(+160,-1568)
```

Panel 후보:

```text
(+320,-1568)
```

Gate 후보:

```text
(+448,-1568)
```

### Kill Requirement

```text
NONE
```

D1 생존 상태로도 진행.

---

## 21. Pixel Art Asset Spec

### Archive Identity

- white recessed record walls
- tall smoked-glass archive stacks
- minimal service rails
- cyan hardpoints
- dark empty circulation void
- one patrol drone

### Evidence A

neutral index display.

### Evidence B

큰 status display이지만
재난 포스터처럼 만들지 않는다.

권장:

```text
white text
muted amber status
dark corporate display
```

### 금지

- casualty photos
- red human silhouette
- body count
- family photo
- executive villain portrait
- propaganda poster

Story의 무게는:

```text
cold operational record
```

에서 나온다.

---

## 22. Background / VFX / Sound

### Far

- archive tower
- upper evacuation circulation bridges
- city lights through glass
- sealed vertical control core

### Mid

- suspended record galleries
- recessed data arrays
- emergency route diagrams without social-class labels

### Near

- sparse frame
- service hardpoint housing
- archive display edge

### Patrol Audio

초반에만:

```text
motor
acquire
fire
```

### P2 이후

Combat audio layer 완전 제거.

### Outcome Reveal

과장된 tragedy sting 금지.

권장:

```text
low system confirmation
+
brief ambient drop
```

정도.

---

## 23. Multiplayer Contract

### D1

shared one Patrol.

### Eligibility

Activation 안 Player만
새 target 후보.

### Different Pace

Player A가 H2/H3,
Player B가 P1에 있을 수 있다.

P1 Player는 새 target 후보가 아님.

### P2/P3

두 Player 모두
enemy new acquire 없음.

### Story

S1/S2는 shared world fact.

한 Player가 먼저 지나도
다른 Player movement lock 없음.

### Story Persistence

뒤 Player도 기록을 확인할 수 있도록
one-shot-only UI로 사라지지 않게 하는 방향 권장.

### Gate

```text
shared open
individual physical crossing
```

---

## 24. PASS Criteria

### Gameplay

- Patrol exactly 1
- Cutter 0
- Standard Sentry 0
- `cutter-fire` ABSENT
- Wind 0
- Scanner 0
- Moving Platform 0
- P1 activation OUT
- H2 activation IN
- H3 activation IN
- R1 activation OUT
- P2 activation OUT
- Patrol band 이후 Enemy 0
- Kill Optional
- Safe max 344.7px
- Flow max 373.2px
- Patrol-active Safe links ≤295px
- all links <400px
- no new input
- no new Rope mode
- no Growth
- no Foundation lock
- Recovery ≤4~5 sec target

### Story

- POST-CASCADE archive context 유지
- `LOWER SECTORS / EVACUATION STATUS / SUSPENDED` 명시
- 5-6 Authorization과 논리적으로 연결
- final organization identity 미공개
- casualty outcome 미공개
- intentional disaster framing 없음

### Production

- Runtime implementation HOLD
- Approved Gameplay Art HOLD
- direct 5-7→5-8 Runtime wiring 없음

---

## 25. FAIL Conditions

### Gameplay

- Patrol이 Target 획득 후 계속 이동한다고 가정
- Patrol에 `cutter-fire` 추가
- Story Deck P2/P3가 Activation 안
- Outcome Reveal 중 projectile pressure 유지
- second enemy 추가
- Patrol kill Gate
- H2/H3 active link를 380~400px precision으로 만듦
- Sealed Surface parent bypass
- Story 읽기 위해 interact 강제
- one miss → P0 reset

### Story

- casualty number 추가
- `all lower residents died` 확정
- `company intended deaths` 확정
- Named CEO / executive villain
- final organization name 확정
- Rooftop Pad 03 operational path 최종 공개
- Group A/B/C social mapping
- Company caused Cascade 암시

### Production

- Sector05 Runtime 구현
- Scenario Art 승인
- 5-8 Authority record를 실제 Runtime으로 선반영
- Boss / Sector06 transition 추정

---

## 26. 개발자 / 기획자 최종 전달 요약

### Stage

```text
SECTOR 05-7
EVACUATION ARCHIVE
```

### Core

```text
ONE SHORT PATROL BAND
↓
LONG STORY-HEAVY SAFE ASCENT
```

### Patrol

```text
D1

corridor
-160 ↔ +160
at Y -640

speed
48

wait
0.45

mode
pingpong

cutter-fire
ABSENT
```

### Activation

```text
X -192 ~ +192
Y -768 ~ -448

P1 OUT
H2 IN
H3 IN
R1 OUT
P2 OUT
```

### Geometry

```text
SAFE MAX
344.7 px

FLOW MAX
373.2 px

PATROL ACTIVE SAFE MAX
295.0 px

HOOK REACH
400 px
```

### Story

```text
5-6
LOWER ASCENT ROUTING
SUSPENSION AUTHORIZED

↓

5-7
LOWER SECTORS
EVACUATION STATUS
SUSPENDED
```

### Still Hidden

```text
FINAL ORGANIZATION IDENTITY
FULL CONTINUITY DIRECTIVE
ROOFTOP PAD 03 ROUTE
```

### Runtime Drift Note

```text
Cutter is now positive opt-in:
cutter-fire
```

따라서
5-3 / 5-6 Cutter authoring 문구는
Sector06 완료 후 Alignment Patch 필요.

### Stage Feeling

> **“보안은 오히려 조용해진다. 짧은 Patrol을 지나 Archive 깊숙이 올라가면, 지금까지 추론하던 결과가 차가운 상태 기록 한 줄로 확정된다 — LOWER SECTORS / EVACUATION STATUS / SUSPENDED.”**

---

## OPEN QUESTIONS

### 1. Outcome Wording

현재 권장:

```text
LOWER SECTORS

EVACUATION STATUS
SUSPENDED
```

가장 직접적이고 시스템적.

대안:

```text
LOWER-SECTOR EVACUATION
SUSPENDED
```

둘 중 5-8 UI tone과 맞춰 LOCK.

### 2. Evidence A 필요성

P2의:

```text
LOWER-SECTOR TRANSFER STATUS
RECORD AVAILABLE
```

가 redundant하면 삭제 가능.

하지만 Authorization→Outcome 사이
한 박자 완충 역할은 유효.

### 3. Patrol Band 길이

현재 active Safe path:

```text
H2 → H3
295px 이하
```

라 매우 짧다.

Story Stage에서 적절.

너무 무의미하면
Activation을 늘리기보다
Patrol corridor를 ±192 정도로만 확대.

### 4. P3 Story Persistence

빠른 Player도 읽도록:

- display persistence
- camera framing
- text duration

조정.

Timer pause / movement lock은 사용하지 않는다.

### 5. H1→H2 Flow 373.2px

Flow-only.

Mobile에서 반복 miss가 높으면
H2를 8~16px inward.

Safe Route는 275.3px.

### 6. 5-8 Handoff

5-8은:

```text
CONTINUITY CONTROL SPINE
```

에서:

- organizational authority
- full WHY
- Rooftop Pad 03 / Maintenance Shuttle goal

을 정리해야 한다.

5-7에서는:

```text
AUTHORITY RECORDS AHEAD
```

까지만.

### 7. Current Runtime Drift

Current default authored world가
Sector01~03까지 전진했고
Sector04 standalone catalog도 생겼다.

5-8 작성 전에도
latest main을 다시 fetch해서
Sector05 설계에 영향을 주는 새 Runtime change를 확인한다.

### 8. Earlier Sector05 Cutter Docs — RESOLVED

현재 code 기준:

```text
cutter-fire
```

positive opt-in.

5-3 / 5-6의 old negative-default wording은 이번 Sector05 통합 시 함께
정정했다(§0-2 참고). Scenario geometry / Story 역할은 변경하지 않았다.

---

SECTOR 05-7 / EVACUATION ARCHIVE — BLOCKOUT CANDIDATE · REV 1.0
