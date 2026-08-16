# SECTOR 06-8 — ROOFTOP PAD 03

*BLOCKOUT CANDIDATE · REV 1.0*

◀ PREV — [SECTOR 06-7 / CONTAINMENT LATTICE](../6-7/README.md) · NEXT — POST-SECTOR 06 FINAL SECURITY ENCOUNTER — DETAILED CONTRACT TBD ▶

`SECTOR 06 ROOFTOP / EVACUATION` · `STAGE 08` · `48TH GENERAL PROGRESSION REGION` · `PURE MOVEMENT CLIMAX` · `ARRIVAL / ACCESS DENIAL`

| 항목 | 기준 |
|---|---|
| Status | HYPOTHESIS — BLOCKOUT CANDIDATE |
| Authoring Snapshot | `5d8e37518467aa56dca308e1958a5d78007ae517` |
| Sector Master | GitHub MERGED — PR #578 |
| 6-1 / 6-2 | GitHub MERGED — PR #579 |
| 6-3 | GitHub MERGED — PR #580 |
| 6-4 | GitHub MERGED — PR #582 |
| 6-5 / 6-6 / 6-7 | GitHub MERGED — PR #584 |
| Previous Stage | 6-7 CONTAINMENT LATTICE REV 1.0 — GitHub MERGED |
| Difficulty | ★★★★ |
| Expected First Playtime | 120–175 sec |
| Expected Skilled Clear | 40–65 sec |
| Enemy | NONE |
| Wind | NONE |
| Access Scan Field | NONE |
| Cutter | NONE |
| Patrol | NONE |
| Standard Sentry | NONE |
| Damage Hazard | NONE |
| Moving Platform / Train | NONE |
| New Player Input | NONE |
| New Rope Mode | NONE |
| New Growth | NONE |
| Foundation | CURRENT RUNTIME — selected Foundation KEEP |
| First Specialization | CONTENT BLOCKED / NOT REQUIRED |
| Legacy Artifact Layer | REMOVED FROM CURRENT RUNTIME |
| Required Kill | NONE |
| Internal Boss | NONE |
| Primary Spatial Identity | ONE-WAY LEFT → RIGHT FINAL RUNWAY / OPEN SKY / PAD ALWAYS AHEAD |
| Primary Role | 48번째 일반 Stage의 Enemy-free Rope continuity climax와 실제 탈출지점 도달 |
| Story Role | Pad03 / Shuttle에 물리적으로 도달 → `ACCESS DENIED / CONTAINMENT VIOLATION` → Final Security Encounter boundary |
| Stage-local Final Beat | Reach P3 Maintenance Access Deck → Interact Pad Access Console → Denial |
| Standard Gate to Next General Area | NONE — no 6-9 |
| Post-6-8 Final Security | REQUIRED CONCEPT / detailed Boss contract TBD |
| Sector06 Runtime | NOT AUTHORED / NOT CONNECTED |
| Approved Gameplay Art | HOLD until Runtime Area / Camera Zone / Stable IDs exist |
| Review Result | PASS_AFTER-FULL-FINALE-FLOW-GEOMETRY-BOUNDARY-AND-LATEST-MAIN-REVIEW |

---

## 0. 기획 기준

### LOCKED FOR THIS STAGE

6-8은:

```text
48TH GENERAL PROGRESSION REGION
```

이며 Sector06의 일반 진행 Finale다.

하지만:

```text
INTERNAL BOSS
NONE
```

이다.

최종 Security 전투는:

```text
POST-SECTOR06 FINAL SECURITY ENCOUNTER
```

로 6-8 밖에 존재한다.

### Core Question

> **“적도 상태 퍼즐도 없는 마지막 Open Sky에서, 지금까지 익힌 Rope continuity만으로 눈앞의 Pad 03까지 한 번의 긴 흐름을 완성할 수 있는가?”**

### Gameplay Grammar

```text
PAD ALWAYS VISIBLE
↓
FINAL MAST
↓
LIGHTING FRAME A
↓
LIGHTING FRAME B
↓
PAD PERIMETER
↓
MAINTENANCE ACCESS DECK
↓
SHUTTLE AT ARM'S REACH
↓
ACCESS REQUEST
↓
ACCESS DENIED
CONTAINMENT VIOLATION
↓
FINAL SECURITY BOUNDARY
```

### Final Movement Rule

6-8의 Main Route는 의도적으로:

```text
LEFT → RIGHT
LEFT → RIGHT
LEFT → RIGHT
```

같은 Zig-zag가 아니다.

정확한 identity:

```text
ONE-WAY PROGRESSION
X increases continuously
toward Pad 03
```

이다.

### 금지

- Enemy
- Wind
- Scanner
- Cutter
- Patrol
- Combat Gauntlet
- New Mechanic
- New Input
- New Growth
- Moving Platform
- Blind Leap
- Instant-death Sky
- giant flat rooftop walk-only finale
- 5-8 Patrol → Safe → Cutter reprise
- 4-8 long Wake trunk reprise
- 3-8 Free-Weave reprise
- 2-8 multi-route atrium reprise
- 1-8 sequential security phase reprise
- Boss inside 6-8
- Final Security mechanics invention
- Shuttle boarding before Final Security win
- Pad lock release before Final Security win

---

## 0-1. 최신 GitHub / Runtime 기준

### CURRENT MAIN AT AUTHORING

```text
5d8e37518467aa56dca308e1958a5d78007ae517
```

최신 merge:

```text
PR #584

6-5 PAD ACCESS ARRAY
6-6 BEACON SPAN
6-7 CONTAINMENT LATTICE
```

까지 GitHub에 정식 병합.

따라서 현재 Sector06 Scenario Source:

```text
MASTER
6-1
6-2
6-3
6-4
6-5
6-6
6-7
```

이 모두 GitHub 기준.

6-8이 마지막 미작성 detailed Stage.

### Current Runtime Boundary

현재 `CURRENT_AUTHORED_AREA_CATALOG`:

```text
Sector01
→
Sector02
→
Sector03
```

까지만 연결.

Sector04:

```text
standalone authored catalog
```

Sector05 / Sector06:

```text
NOT AUTHORED / NOT CONNECTED
```

따라서 6-8도 Scenario-only.

### VERIFIED — CURRENT ROPE

```text
Hook Speed                 1400 px/s
Hook Flight Ratio          2 / 7 sec
Derived Hook Reach         400 px
Hook Reload                0.20 sec
Attach Buffer              0.10 sec
Swing Impulse              780
Release Angular Transfer   0.55
```

### Validation Policy

Document geometry:

```text
Mandatory < 400 px
```

Later Graybox:

```text
swingImpulse = 0
```

actual physical clear test.

본 문서는 거리 계산만으로
Physics PASS를 주장하지 않는다.

---

## 0-2. 1-8 ~ 5-8 Finale 전수 비교

### 1-8 — CONTAINMENT GATE

```text
2 Sentry
+
Pulsed Wind
+
Sequential Security
+
Maintenance Override
```

Memory:

```text
VERTICAL SECURITY ASCENT
```

### 2-8 — EVACUATION PLATFORM

```text
2 Patrol Bands
+
Large Atrium
+
Safe / Flow / Build Routes
+
Interconnected Choice
```

Memory:

```text
PLAYER CHOOSES HOW TO CROSS A LARGE SPACE
```

### 3-8 — UPPER MARKET GATE

```text
Access Scan
+
2 Patrol
+
Parallel Security Routes
+
Free-Weave
```

Memory:

```text
OPEN ROUTE EXPRESSION
```

### 4-8 — TRANSIT CONTROL TRUNK

```text
Long Wake
+
Cutter
+
Patrol
+
Recovery
```

Memory:

```text
MOMENTUM → INTERRUPTION → RECOVERY
```

### 5-8 — CONTINUITY CONTROL SPINE

```text
Narrow Spine
+
Patrol Band
+
Safe Relay
+
Cutter Band
+
Direction Reversal
```

Memory:

```text
SPARSE HARDPOINT SYNTHESIS
```

### 6-8 — SELECTED DIFFERENCE

```text
Enemy 0
State Hazard 0
Environmental Force 0
Route Fork 0
Direction Reversal 0
```

Memory:

```text
PAD IS VISIBLE
KEEP MOVING TOWARD IT
```

### Conclusion

전체 게임 마지막 일반 Stage를
또 하나의 “모든 시스템 종합전”으로 만들지 않는다.

Final Combat synthesis는:

```text
POST-6-8 FINAL SECURITY ENCOUNTER
```

가 담당.

---

## 0-3. 6-1 ~ 6-7 Flow Audit

### 6-1

```text
OPEN SKY TOPOLOGY INTRO
neutral V traverse
```

### 6-2

```text
continuous lateral Crosswind
```

### 6-3

```text
fixed Standard Sentry
Open-Sky body arc
```

### 6-4

```text
horizontal REST
Pad / Shuttle first direct visual
```

### 6-5

```text
one Scanner group
three controlled Hardpoints
```

### 6-6

```text
diagonal Patrol
entry timing
```

### 6-7

```text
upper Cutter line
+
lower recovery catwalk
```

### 6-8

```text
NO THREAT
NO INTERRUPTION
ONE-WAY FINAL RUNWAY
```

### Rhythm Closure

```text
SYSTEM RECALL
6-2 → 6-3

REST / GOAL
6-4

MASTERY RECALL
6-5 → 6-6 → 6-7

ARRIVAL
6-8
```

### Final Cross-Stage Coordinate Verification

Automated local comparison:

```text
6-8 candidate major / recovery points
vs
Sector05 5-1~5-8 reviewed docs
=
exact overlap 0

vs
Sector06 6-1~6-7 reviewed docs
=
exact overlap 0
```

Current GitHub repository code search at:

```text
5d8e37518467aa56dca308e1958a5d78007ae517
```

for the 6-8 candidate coordinate-pair strings also returned:

```text
exact pair-string matches
0
```

This check is an accidental-skeleton-copy guard,
not proof of physical uniqueness or gameplay quality.

---

## 1. 한 줄 정의

6-7 Containment Lattice의 마지막 Cutter pressure와 Lower Recovery Layer를 통과한 Player가 Pad Perimeter Approach의 왼쪽 P0 Deck에 도착해, 이제 Enemy·Wind·Scanner가 모두 사라진 상태에서 오른쪽 멀리 실제 Maintenance Shuttle이 계속 보이는 하나의 넓은 Open-Sky 시야 속으로 진입하고, Final Mast의 H1/P1/H2를 거쳐 Pad Lighting Frame H3–H4를 끊김 없이 오른쪽으로 연결하며, 두 개의 visible lower recovery lip R1/R2가 실패를 받아주는 가운데 방향을 한 번도 되돌리지 않고 P2 Pad Perimeter Deck에 올라선 뒤 H5를 통해 P3 Maintenance Access Deck까지 마지막 짧은 Rope를 걸어 실제 Shuttle 바로 앞에 물리적으로 도달하고, 기존 Interact 입력으로 Pad Access Console을 시도했으나 `ACCESS DENIED / CONTAINMENT VIOLATION`을 받아 1-1부터 이어진 탈출 목표가 가짜가 아니라 실제였지만 마지막 Security clearance가 남아 있음을 확인한 채 별도 Final Security Encounter의 content boundary에서 일반 진행을 끝내는 48번째 Stage.

---

## 2. 전체 게임에서의 역할

### 2-1. 48번째 일반 Region

```text
6 sectors
×
8 authored general regions
=
48
```

6-8이 마지막.

### 2-2. Movement Is the Climax

마지막 일반 시험:

```text
Can you keep the Rope flow?
```

이지:

```text
Can you survive one more combat soup?
```

가 아니다.

### 2-3. Goal Becomes Physical

1-1:

```text
Pad03
information
```

5-8:

```text
Pad03
explicit escape route
```

6-4:

```text
Pad03
visible landmark
```

6-8:

```text
Pad03
physical destination
```

### 2-4. Denial Creates Boss Need

Final Encounter는:

```text
random boss appearance
```

가 아니다.

Player 행동:

```text
I reached the escape point.
I request access.
```

에 Security가:

```text
ACCESS DENIED
CONTAINMENT VIOLATION
```

으로 반응하기 때문에 발생.

---

## 3. Story 역할

### S0 — Entry

```text
ROOFTOP PAD 03

FINAL APPROACH
OPEN
```

### S1 — P2 Pad Perimeter

```text
ROOFTOP PAD 03

MAINTENANCE SHUTTLE
STANDBY
```

### S2 — P3 Access Deck

환경 표시:

```text
PAD ACCESS
AVAILABLE FOR REQUEST
```

이는:

```text
ACCESS GRANTED
```

가 아니다.

### S3 — Access Interaction

Player가 기존 Interact로
Pad Access Console을 시도.

표시:

```text
ROOFTOP PAD 03

ACCESS DENIED

CONTAINMENT VIOLATION
```

### Player가 확정할 수 있는 것

```text
Pad03 is real.
Shuttle is real.
Shuttle status is STANDBY.
Player has physically reached the Pad access point.
Existing Security escalation now denies final access.
```

### 아직 확정하지 않는 것

```text
Final Security identity
Boss HP
Boss phase
Boss arena
Boss timer value
exact unlock mechanic
boarding multiplayer behavior
```

---

## 4. 공간 콘셉트

### FINAL RUNWAY

실제 활주로가 아니라
Rope Gameplay 관점의:

```text
FINAL ONE-WAY RUNWAY
```

다.

### Structural Sequence

```text
ENTRY SERVICE DECK
→
FINAL MAST
→
PAD LIGHTING FRAME A
→
PAD LIGHTING FRAME B
→
PAD PERIMETER DECK
→
MAINTENANCE ACCESS FRAME
→
SHUTTLE ACCESS DECK
```

### Spatial Emotion

초반:

```text
Pad is still ahead.
```

중간:

```text
Pad fills more of the frame.
```

후반:

```text
I am on the Pad.
```

### No Direction Reversal

Main Route의 x좌표:

```text
STRICTLY INCREASING
```

후보.

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
1344 px

Y
0 ~ -1344
```

### Main Route Horizontal Travel

P0:

```text
x -640
```

→ P3:

```text
x +672
```

약:

```text
1312 px
```

의 한 방향 횡단.

### Vertical Gain

약:

```text
1216 px
```

### Identity

```text
DIAGONAL ASCENT
+
MONOTONIC HORIZONTAL PROGRESS
```

---

## 6. 전체 맵 구조

```text
Y = 0

P0 ENTRY
(-640,0)
    \
     H1 (-416,-176)
       \
        P1 (-320,-288)
        FINAL MAST FOOT
           \
            H2 (-96,-416)
                \
                 H3 (+192,-576)
                 LIGHTING FRAME A

             R1 (+32,-704)
             LOWER RECOVERY LIP

                         \
                          H4 (+480,-736)
                          LIGHTING FRAME B

                       R2 (+352,-848)
                       LOWER PERIMETER LIP

                              \
                               P2 (+608,-928)
                               PAD PERIMETER
                               [SHUTTLE STANDBY]

                                \
                                 H5 (+624,-1088)
                                   \
                                    P3 (+672,-1216)
                                    MAINTENANCE ACCESS DECK
                                    [ACCESS REQUEST]

                                    SHUTTLE
                                    NEAR-FIELD / LOCKED ACCESS

Y = -1344
```

### Shape Signature

```text
X:

-640
-416
-320
-96
+192
+480
+608
+624
+672

STRICT LEFT → RIGHT
```

---

## 7. Zone 구성

### Z0 — Arrival Preview

```text
P0 → H1 → P1
```

Pad03 / Shuttle visible.

No threat.

### Z1 — Final Mast

```text
P1 → H2
```

P1 is optional landing / breath.

### Z2 — Long Exterior Continuity

```text
H2 → H3 → H4
```

Stage의 가장 긴 Mandatory movement.

No enemy.

No state timing.

질문은 오직:

```text
release
+
arc
+
re-attach
```

continuity.

### Z3 — Recovery Layer

Gap 1:

```text
R1
```

Gap 2:

```text
R2
```

둘 다 Main Route 아래에서
Commit 전에 보임.

### Z4 — Pad Perimeter

```text
H4 → P2
```

여기서 Player는
실제로 Pad geometry에 올라섬.

### Z5 — Maintenance Access

Safe:

```text
P2 → H5 → P3
```

Flow:

```text
H4 → H5 → P3
```

### Z6 — Access Denial

P3:

```text
Interact Pad Access Console
```

→ denial.

No Boss spawned inside this Stage document.

---

## 8. 좌표 / 오브젝트

전부:

```text
HYPOTHESIS — BLOCKOUT
```

### 8-1. Landing / Recovery

| ID | Center | Size | Grappleable | Role |
|---|---:|---:|---|---|
| P0 | `(-640, 0)` | `320×32` | NO candidate | Entry / Pad Preview |
| P1 | `(-320, -288)` | `272×24` | NO candidate | Final Mast Foot Landing |
| R1 | `(+32, -704)` | `288×24` | NO candidate | First Lower Recovery Lip |
| R2 | `(+352, -848)` | `288×24` | NO candidate | Second Lower Recovery Lip |
| P2 | `(+608, -928)` | `384×32` | NO candidate | Pad Perimeter Deck |
| P3 | `(+672, -1216)` | `480×32` | NO candidate | Maintenance / Shuttle Access Deck |

### 8-2. Grapple Landmarks

| ID | Position | Form | Role |
|---|---:|---|---|
| H1 | `(-416, -176)` | Final Mast lower brace | Entry |
| H2 | `(-96, -416)` | Final Mast upper ring | Launch into open span |
| H3 | `(+192, -576)` | Pad Lighting Frame A | Long arc redirect |
| H4 | `(+480, -736)` | Pad Lighting Frame B | Perimeter approach |
| H5 | `(+624, -1088)` | Maintenance Access Frame | Final Rope |

### 8-3. Pad03 Landmark

P0부터:

```text
VISIBLE
```

but:

```text
BACKGROUND / MIDGROUND
NON-GAMEPLAY
```

until P2.

P2부터 실제 Pad collision/deck layer에 진입.

### 8-4. Maintenance Shuttle

6-4에서 첫 직접 확인.

6-8에서는 Near-field.

Status:

```text
STANDBY
```

### 8-5. Pad Access Console A1

P3.

Candidate:

```text
kind
interact objective / access console

new input
NO

uses existing
INTERACT
```

Interaction result:

```text
ACCESS DENIED
CONTAINMENT VIOLATION
```

### 8-6. Stable ID 후보

```text
sector-06-08:p0
sector-06-08:p1
sector-06-08:r1
sector-06-08:r2
sector-06-08:p2
sector-06-08:p3

sector-06-08:hardpoint-h1
sector-06-08:hardpoint-h2
sector-06-08:hardpoint-h3
sector-06-08:hardpoint-h4
sector-06-08:hardpoint-h5

sector-06-08:pad03-landmark
sector-06-08:maintenance-shuttle
sector-06-08:pad-access-console
sector-06-08:access-denial-trigger
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
→ H4
→ P2
→ H5
→ P3
```

### Distance Pre-check

| Link | Distance |
|---|---:|
| P0 → H1 | `284.9 px` |
| H1 → P1 | `147.5 px` |
| P1 → H2 | `258.0 px` |
| H2 → H3 | `329.5 px` |
| H3 → H4 | `329.5 px` |
| H4 → P2 | `230.8 px` |
| P2 → H5 | `160.8 px` |
| H5 → P3 | `136.7 px` |

### Result

```text
MAX SAFE LINK
= 329.5 px

HOOK REACH
= 400 px

MARGIN
= 70.5 px
```

### Final Movement Pressure

핵심 두 Link:

```text
H2 → H3
329.5 px

H3 → H4
329.5 px
```

고정 위협 없이
continuity 자체를 시험.

---

## 10. Flow Route

### Route

```text
P0
→ H1
→ P1
→ H2
→ H3
→ H4
→ H5
→ P3
```

P2 landing 생략.

### Distance Pre-check

| Link | Distance |
|---|---:|
| P0 → H1 | `284.9 px` |
| H1 → P1 | `147.5 px` |
| P1 → H2 | `258.0 px` |
| H2 → H3 | `329.5 px` |
| H3 → H4 | `329.5 px` |
| H4 → H5 | `380.3 px` |
| H5 → P3 | `136.7 px` |

### Result

```text
MAX FLOW LINK
= 380.3 px
```

### Important

high-380s는:

```text
H4 → H5
ONE optional Flow link only
```

이다.

Mandatory route는 329.5px 이하.

---

## 11. Recovery Route

### R1 — Final Mast Span Recovery

```text
(+32,-704)
```

H2→H3 gap 아래.

Useful:

```text
R1 → H3
204.9 px
```

### R2 — Pad Perimeter Recovery

```text
(+352,-848)
```

H3→H4 / H4→P2 transition 아래.

Useful:

```text
R2 → H4
170.1 px

R2 → P2
268.2 px
```

### Properties

둘 다 후보:

```text
collision
YES

grappleable
FALSE
```

### Why

Recovery가
Main Route보다 빠른 별도 Rope highway가 되지 않게 함.

### Target

일반 miss:

```text
stable landing
≤ 2–3 sec

main progression return
≤ 5 sec
```

정확한 시간은 Graybox 측정.

---

## 12. Pure Movement Difficulty Contract

### Difficulty Source

Enemy가 없다고
Difficulty가 REST는 아니다.

6-8의 ★★★★는:

- long exterior continuity
- open void exposure
- two consecutive ~329px mandatory arcs
- late-game release / re-attach fluency
- optional 380px Flow skip
- Pad를 보면서도 Rope timing을 유지해야 하는 심리적 압박

에서 나온다.

### Not Difficulty Source

```text
precision 400px repeated
NO

enemy damage
NO

scanner timing
NO

wind force
NO

invisible landing
NO
```

---

## 13. One-Way Geometry Contract

### Strict X Progression

Main Safe Route major points:

```text
P0  -640
H1  -416
P1  -320
H2   -96
H3  +192
H4  +480
P2  +608
H5  +624
P3  +672
```

### Meaning

Player가 매 swing마다:

```text
Where next?
```

보다:

```text
Keep going toward the Shuttle.
```

를 느끼게 한다.

### No Reversal

6-7의:

```text
upper route
→ left safe island
→ right exit
```

을 이어서 복제하지 않는다.

---

## 14. Pad / Shuttle Spatial Contract

### P0

Shuttle:

```text
visible
small / distant
```

### H3

Shuttle:

```text
mid-distance
```

Pad perimeter frame이 더 커짐.

### P2

Player는:

```text
ON PAD PERIMETER
```

상태.

Shuttle:

```text
near-field
```

### P3

Shuttle access point 바로 앞.

### Important

Shuttle을 너무 크게 보여
Rope anchors가 안 읽히면 안 됨.

Goal landmark와 Gameplay target
둘 다 동시에 명확해야 함.

---

## 15. Foundation Expression

### IMPULSE COIL

```text
H2 → H3 → H4
```

의 exterior continuity를 빠르게 압축.

### RELAY LINK

연속 Release / Re-Attach에서
가장 명확한 comfort / expression.

### SHEAR CURRENT

Enemy 0.

Offense value:

```text
0
```

정상.

### Mandatory

```text
NO FOUNDATION REQUIRED
```

### Final Exam Philosophy

모든 Foundation이
동일하게 빛나야 할 필요는 없다.

핵심은:

```text
selected build can express
but base Rope always clears
```

---

## 16. Story / Access Console Contract

### Existing Input

```text
INTERACT
```

재사용.

New Input:

```text
NONE
```

### P3 Access Request

권장 Sequence:

```text
PLAYER INTERACT
↓
PAD ACCESS REQUEST
↓
short neutral processing beat
↓
ACCESS DENIED
↓
CONTAINMENT VIOLATION
```

### No Villain Voice

Named executive voice:

```text
NONE
```

### No Twist

Denial 이유:

```text
existing security escalation
```

의 마지막 회수.

---

## 17. Final Security Boundary Contract

### 6-8 Does Not Contain Boss

```text
BOSS
0
```

### Denial

Pad access denial은:

```text
FINAL SECURITY ENCOUNTER ENTRY CANDIDATE
```

이다.

### Detailed Boss Contract

아직 TBD:

- identity
- arena
- phase
- HP
- enemy count
- exact victory condition
- timer value
- collapse shape
- multiplayer sync

### Runtime Authoring Rule

Boss detailed spec 전까지:

```text
DO NOT
spawn guessed boss
DO NOT
wire guessed Boss Area
DO NOT
start guessed Boss Timer
```

### Content Boundary Candidate

6-8 Scenario-only boundary:

```text
nextAreaId
null

completionMode
content-boundary candidate
```

정도까지만.

정확한 Runtime field는
Final Boss detailed spec과 함께 확정.

---

## 18. Timer Contract

Sector06 General Timer:

```text
6-1 ~ 6-8
SHARED
```

### During 6-8

계속 감소.

### If / When Denial Is Formally Locked As Boss Entry

그 순간:

```text
GENERAL TIMER
STOP

GENERAL COLLAPSE
STOP

REMAINING GENERAL TIME
DISCARD

FINAL BOSS TIMER
START
```

### Until Boss Spec Exists

6-8 문서가 임의로:

```text
timer stop implemented
```

라고 주장하지 않는다.

### Boss Failure

향후 Boss contract:

```text
all players out
→ retry Final Security only
```

Sector06 전체 reset 아님.

---

## 19. Gate / Progression Contract

### 6-1 ~ 6-7

기존:

```text
Reach objective
→ Panel Interact
→ Gate Open
→ Physical Crossing
```

### 6-8

다르다.

No 6-9.

따라서:

```text
P3
→ Pad Access Console Interact
→ ACCESS DENIED
→ content boundary / Final Security entry candidate
```

### Do Not Add

```text
fake gate to 6-9
```

### Do Not Auto Unlock Shuttle

Denial 전:

```text
SHUTTLE STANDBY
```

Denial 후에도:

```text
BOARDING
NOT AVAILABLE
```

Final Security 승리 후에만
Pad release / boarding가 가능.

---

## 20. Multiplayer Contract

### General Movement

개별 Rope 이동.

### Recovery

Player A가 R1/R2로 떨어져도
Player B 이동에 영향 없음.

### P3 Console

첫 Player가 Interact했다고:

```text
Partner auto teleport
NO
```

### Boss Entry

정확한:

```text
party ready
arena transfer
late player handling
```

은 Final Boss detailed spec에서 LOCK.

### Denial Presentation

Shared world event일 수 있으나
모든 Player의 이동을 임의로 freeze / teleport하는 계약은
이 Stage 문서가 정하지 않는다.

---

## 21. Camera

전부:

```text
HYPOTHESIS
```

### C0 — Final Runway Opening

```text
P0
H1
P1
H2
Pad03 direction
Shuttle silhouette
```

Desktop:

```text
0.92
```

Mobile:

```text
0.70
```

### C1 — Long Arc

```text
H2
H3
H4
R1
R2
Pad perimeter

Desktop
0.86

Mobile
0.66
```

### C2 — Pad Perimeter

```text
H4
P2
H5
P3
Shuttle

Desktop
0.90

Mobile
0.68
```

### C3 — Access Denial

P3 / Console / Shuttle.

Player apparent scale 유지.

```text
Desktop
0.98

Mobile
0.72
```

### Guard

“마지막 Pad 전체샷” 욕심 때문에
Player를 작게 만들지 않는다.

전체 도시 Wide Shot은
Final Security 승리 후 Ending의 Shuttle ascent가 소유.

---

## 22. Pixel Art / Visual Spec

### Final Mast

큰 외부 mast silhouette.

Gameplay H1/H2는
명확한 cyan attachment cue.

### Pad Lighting Frames

H3/H4:

- utility frame
- aviation light
- honest attach language

### Pad Perimeter

P2부터 foreground gameplay geometry.

### Shuttle

현재:

```text
STANDBY
```

- engine / system idle
- closed access
- no boarding ramp success cue

### Access Console

기존 Corporate / Security UI family.

### Denial

```text
ACCESS DENIED
CONTAINMENT VIOLATION
```

red/orange danger UI 가능.

하지만 Final Boss 자체를
배경 silhouette로 미리 발명하지 않는다.

---

## 23. Background / Parallax / Sound

### Far

- vertical city below
- adjacent crown structures
- sky

### Mid

- Pad03
- Shuttle
- beacon frames

### Near

- final mast
- lighting frame
- access deck

### Pad Landmark Stability

Pad / Shuttle은 goal landmark라
과도한 parallax로 흔들리면 안 됨.

### Sound Progression

P0:

```text
open wind ambience
distant shuttle machinery
```

H3:

```text
beacon / shuttle louder
```

P2:

```text
Pad utility hum
```

P3:

```text
shuttle near-field idle
```

Denial:

```text
short security denial cue
```

### No Triumph Music Yet

완전한 승리 음악은
Final Security 승리 / boarding 이후.

---

## 24. PASS Criteria

### Full-Game Finale Differentiation

- not 1-8 sequential Sentry/Wind
- not 2-8 multi-route Patrol atrium
- not 3-8 Scanner Free-Weave
- not 4-8 Wake/Cutter/Patrol trunk
- not 5-8 Patrol/Cutter narrow spine
- not 6-4 REST
- 6-8 identity = monotonic enemy-free final runway

### Geometry

- Main Route x strictly increasing
- Safe max 329.5px
- Flow max 380.3px
- only one high-380 Flow link
- all Mandatory <400px
- two visible Recovery lips
- R1→H3 204.9px
- R2→H4 170.1px
- R2→P2 268.2px
- no blind leap
- no instant-death sky dependency
- exact audited major-coordinate overlap 0 after final cross-check

### Gameplay

- Enemy 0
- Wind 0
- Scanner 0
- Cutter 0
- Patrol 0
- Damage Hazard 0
- New Mechanic 0
- New Input 0
- New Growth 0
- Foundation independent
- final movement remains Rope-centric
- Pad not reached by flat walking only

### Story

- Pad03 real
- Shuttle real
- Shuttle STANDBY
- access requested only after physical arrival
- ACCESS DENIED
- CONTAINMENT VIOLATION
- no new conspiracy
- no named villain
- no intentional Cascade twist
- Escape remains goal
- no boarding before Final Security

### Product

- 6-8 internal Boss 0
- no fake 6-9
- Final Security detailed contract remains TBD
- Boss Timer not guessed
- multiplayer Boss entry not guessed
- Runtime implementation HOLD
- Approved Art HOLD
- no physical PASS claim before Graybox

---

## 25. FAIL Conditions

### Geometry

- Main Route reverses direction repeatedly
- another V-traverse like 6-1
- giant flat Pad with no Rope climax
- Mandatory high-380 links repeated
- Recovery invisible
- P3 requires blind final leap
- Pad background looks grappleable before gameplay layer
- exact prior Stage skeleton reused

### Gameplay

- combat inserted because Finale feels “too quiet”
- Wind added for spectacle
- Scanner added at final Pad
- Cutter guarding Shuttle
- Patrol around Pad
- Shuttle boarding becomes timing puzzle
- new ultimate build requirement

### Story

- denial before Player reaches Pad
- Shuttle was fake
- Shuttle secretly destroyed
- named CEO villain appears
- terrorist / enemy-of-state escalation
- access granted before Final Security
- player revenge objective
- long exposition

### Product

- Boss inside 6-8
- guessed Final Boss spawned
- guessed timer starts
- first Player console automatically teleports all players
- ending plays immediately on denial
- Sector06 Runtime authored before Full Game Audit
- Approved Art generated before Runtime Area / Camera / Stable IDs

---

## 26. 개발자 / 기획자 최종 전달 요약

### Stage

```text
SECTOR 06-8
ROOFTOP PAD 03
```

### Role

```text
48TH GENERAL REGION
PURE MOVEMENT CLIMAX
PHYSICAL ARRIVAL
ACCESS DENIAL
```

### Threat

```text
NONE
```

### Main Route

```text
P0 (-640,0)
→
H1 (-416,-176)
→
P1 (-320,-288)
→
H2 (-96,-416)
→
H3 (+192,-576)
→
H4 (+480,-736)
→
P2 (+608,-928)
→
H5 (+624,-1088)
→
P3 (+672,-1216)
```

### Identity

```text
STRICTLY LEFT → RIGHT
NO REVERSAL
PAD ALWAYS AHEAD
```

### Geometry

```text
SAFE MAX
329.5 px

FLOW MAX
380.3 px

HOOK REACH
400 px
```

### Recovery

```text
R1 (+32,-704)
→ H3
204.9 px

R2 (+352,-848)
→ H4
170.1 px

R2
→ P2
268.2 px
```

### Final Story

P2:

```text
ROOFTOP PAD 03

MAINTENANCE SHUTTLE
STANDBY
```

P3 Interact:

```text
ROOFTOP PAD 03

ACCESS DENIED

CONTAINMENT VIOLATION
```

### Boundary

```text
6-8 INTERNAL BOSS
NONE

6-9
NONE

POST-6-8
FINAL SECURITY ENCOUNTER
DETAILED CONTRACT TBD
```

### Stage Feeling

> **“마지막 적은 6-7에서 끝났다. 이제 Player와 Pad 사이에는 오직 하늘과 Rope만 남는다. 방향을 되돌릴 이유도 없다. Shuttle을 계속 보면서 한 번의 긴 흐름으로 Final Mast와 Lighting Frame을 지나 실제 Pad에 올라선다. 목표는 진짜였다. 도착도 성공했다. 단지 문이 열리지 않는다.”**

---

## OPEN QUESTIONS

### 1. Final Security Entry Trigger

현재 Concept:

```text
P3 Access Interact
→ Denial
→ Final Security Entry
```

하지만 정확한:

- party sync
- arena transfer
- timer handoff
- boss activation

은 Boss detailed spec에서 확정.

### 2. Access Console Object Type

기존 `interact`를 사용해야 함.

Runtime authoring 전
현재 objective / panel / story-display object contracts를 재확인해서
새 bespoke input object를 만들지 않는다.

### 3. P0 → Pad Visibility

P0에서 Shuttle이 너무 작으면
Pad 방향성만 읽히고 Shuttle silhouette가 사라질 수 있음.

목표:

```text
Pad clear
Shuttle recognizable
not dominant
```

### 4. H2 → H3 → H4

두 Mandatory 329.5px Arc가
Final movement core.

실제 `swingImpulse=0` Graybox에서
Mobile 포함 물리 clear 확인.

### 5. H4 → H5 Flow

```text
380.3px
```

Flow-only.

Mandatory가 되면 FAIL.

### 6. Recovery Lip Readability

R1/R2는:

```text
before commitment visible
```

이어야 한다.

하늘 배경에 묻히면
위치보다 silhouette / camera를 먼저 조정.

### 7. P2 → P3 Emotional Pacing

P2부터 access까지
너무 빨라 denial이 즉시 나오면
도착 감정이 없다.

권장:

```text
P2 landing
→ short quiet approach
→ H5
→ P3
→ one beat
→ interact
```

정확한 seconds는 playtest.

### 8. Shuttle Interaction

6-8에서 Player는 Shuttle에 탑승하지 않는다.

Interact target은:

```text
Pad / Shuttle Access
```

이며 denial이 먼저.

### 9. General Timer

Denial을 Boss Entry로 정식 확정하기 전
Scenario doc만 보고 Timer stop을 구현하지 않는다.

### 10. Full Game Audit — NEXT

6-8 완료 직후
새 Stage를 더 쓰지 않는다.

다음 작업:

```text
SECTOR01~06
FULL GAME CROSS-SECTOR AUDIT
```

반드시 검토:

- Rope learning curve
- Foundation / Growth cadence
- Enemy repetition
- Scanner repetition
- Cutter repetition
- Wind repetition
- Recovery cadence
- Safe / Flow geometry signatures
- Story disclosure ladder
- Sector identity
- REST spacing
- Stage08 differentiation
- Boss boundary consistency
- total playtime
- multiplayer handoffs
- current Runtime drift
- Approved Art readiness

그 뒤에만:

```text
Alignment Patch
→ Graybox
→ Runtime implementation
```

으로 이동.

---

SECTOR 06-8 / ROOFTOP PAD 03 — BLOCKOUT CANDIDATE · REV 1.0
