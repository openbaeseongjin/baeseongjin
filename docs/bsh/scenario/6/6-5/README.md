# SECTOR 06-5 — PAD ACCESS ARRAY

*BLOCKOUT CANDIDATE · REV 1.0*

◀ PREV — [SECTOR 06-4 / ROOFTOP SERVICE SHELTER](../6-4/README.md) · NEXT — [SECTOR 06-6 / BEACON SPAN](../6-6/README.md) ▶

`SECTOR 06 ROOFTOP / EVACUATION` · `STAGE 05` · `ACCESS SCAN MASTERY RECALL` · `ONE CONCISE CONTROLLED-HARDPOINT BAND`

| 항목 | 기준 |
|---|---|
| Status | HYPOTHESIS — BLOCKOUT CANDIDATE |
| Authoring Snapshot | `a7c146965a96f7086f3f0642db47042710efc454` |
| Sector Master | GitHub MERGED — PR #578 |
| 6-1 / 6-2 | GitHub MERGED — PR #579 |
| 6-3 | GitHub MERGED — PR #580 |
| Previous Stage | 6-4 ROOFTOP SERVICE SHELTER REV 1.0 — LOCAL REVIEWED |
| Difficulty | ★★★★ |
| Expected First Playtime | 120–175 sec |
| Expected Skilled Clear | 45–70 sec |
| Enemy | NONE |
| Access Scan Group | ×1 |
| Controlled Grapple Targets | C1 / C2 / C3 exactly 3 |
| Scanner Cycle | `AVAILABLE 1.5 / WARNING 0.6 / LOCKED 1.1 / RESET 0.3` |
| Scanner Phase Offset | `0` |
| Scanner Damage | NONE |
| Forced Rope Detach | NONE |
| Wind | NONE |
| Cutter | NONE |
| Patrol | NONE |
| Standard Sentry | NONE |
| Moving Platform / Train | NONE |
| New Player Input | NONE |
| New Rope Mode | NONE |
| New Growth | NONE |
| Foundation | CURRENT RUNTIME — selected Foundation KEEP |
| First Specialization | CONTENT BLOCKED / NOT REQUIRED |
| Legacy Artifact Layer | REMOVED FROM CURRENT RUNTIME |
| Required Kill | NONE |
| Internal Boss | NONE |
| Primary Spatial Identity | RIGHT SAFE PREVIEW → THREE CONTROLLED DIAGONAL HARDPOINTS → LEFT SAFE ISLAND → RIGHT CLEAN EXIT |
| Primary Role | Sector03 Scanner literacy를 Enemy 없이 한 번 짧고 명확하게 최종 재시험 |
| Story Role | Pad 접근용 Service Mount control이 아직 cycling 중임을 확인. 최종 접근 거부는 아직 공개하지 않음 |
| Stage-local Exit | Reach P4 Beacon Approach Deck → Gate Panel → Physical Crossing |
| Sector06 Runtime | NOT AUTHORED / NOT CONNECTED |
| Approved Gameplay Art | HOLD until Runtime Area / Camera Zone / Stable IDs exist |

---

## 0. 기획 기준

### LOCKED FOR THIS STAGE

6-4에서 Player는 처음으로:

```text
ROOFTOP PAD 03
SIGNAL ACQUIRED

MAINTENANCE SHUTTLE
STANDBY
```

를 실제 목표로 확인했다.

6-5에서는 목표를 다시 설명하지 않는다.

질문은:

> **“Pad 접근 구조의 세 Service Mount가 같은 Access Scan Cycle에 묶여 있을 때, 상태를 읽고 새 Attach 타이밍을 다시 맞출 수 있는가?”**

### Core Grammar

```text
SAFE PREVIEW
↓
READ ONE SHARED PHASE
↓
ATTACH C1
↓
STAY ATTACHED IF LOCK ARRIVES
↓
RELEASE / RE-ATTACH C2
↓
RECOVERY IF MIS-TIMED
↓
C3
↓
FULL SAFE ISLAND
↓
CLEAN EXIT
```

### 금지

- Scanner damage
- Scanner knockback
- forced Rope detach
- second Scanner group
- phase offset puzzle
- faster Scanner variant
- moving Scanner volume
- Enemy
- Patrol
- Cutter
- Wind
- Security shutter
- moving platform
- Kill Gate
- New Input
- New Rope Mode
- New Growth
- 3-8식 Free-Weave
- always-grappleable same-purpose bypass
- `ACCESS DENIED`
- `CONTAINMENT VIOLATION`

---

## 0-1. 최신 GitHub / Runtime 교차검증

### CURRENT MAIN AT AUTHORING

```text
a7c146965a96f7086f3f0642db47042710efc454
```

현재 GitHub:

```text
Sector05
Master + 5-1~5-8 merged

Sector06
Master + 6-1 + 6-2 + 6-3 merged
```

6-4는 본 Stage 작성 시점
LOCAL REVIEWED.

Sector06 authored Runtime은 아직 없다.

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

### VERIFIED — CURRENT ACCESS SCAN PHASES

Current `AccessScanField.js`:

```text
AVAILABLE
WARNING
LOCKED
RESET
```

### Current Attach Contract

```text
AVAILABLE
→ new Attach allowed

WARNING
→ new Attach allowed

LOCKED
→ new Attach blocked

RESET
→ new Attach blocked
```

정확히:

```text
attachAllowed
=
phase === AVAILABLE
OR
phase === WARNING
```

### Existing Rope

Access Scan predicate는
새 attachment candidate / attach eligibility에 적용된다.

이미 Rope가 붙은 상태를
phase change만으로 강제 해제하는 로직은 없다.

따라서 현재 계약:

```text
ATTACHED DURING AVAILABLE
↓
PHASE BECOMES LOCKED
↓
CURRENT ROPE STAYS ATTACHED
```

### Deterministic Shared Phase

현재 scanner state는:

```text
elapsedSeconds
+
phaseOffsetSeconds
```

로 결정.

같은 authored group은
동일 simulation time에서 같은 phase.

---

## 0-2. Current Scanner Cycle Baseline

Current Sector03 catalog:

```text
SCANNER_CYCLE

available
1.5 sec

warning
0.6 sec

locked
1.1 sec

reset
0.3 sec
```

총:

```text
3.5 sec
```

Attach 가능:

```text
2.1 sec
```

Attach 불가:

```text
1.4 sec
```

### 6-5 Decision

새 tuning 발명하지 않는다.

```text
6-5
same cycle
same phase offset 0
```

사용.

Classification:

```text
cycle values
VERIFIED EXISTING RUNTIME PRECEDENT

6-5 geometry에서의 체감
HYPOTHESIS / PLAYTEST REQUIRED
```

---

## 0-3. Scanner는 Rectangle Field가 아니다

Current Runtime의 핵심:

```text
scannerGroup
=
group id
+
cycle
+
controlledSurfaceIds
```

그리고 Surface가:

```text
grappleAccessGroup
```

으로 group에 연결된다.

따라서 6-5에는:

```text
SCANNER ACTIVATION RECTANGLE
```

을 만들지 않는다.

### 6-5 Controlled Set

정확히:

```text
C1
C2
C3
```

세 개.

### Uncontrolled

```text
H1
P1
R1
P2
H4
P4
```

는 Scanner phase에 의해 attach eligibility가 바뀌지 않는다.

---

## 0-4. Sector03 Scanner Precedent Audit

### 3-2 SCANNER GALLERY — CURRENT RUNTIME

Role:

```text
FIRST ACCESS SCAN TUTORIAL
```

실제 Group:

```text
scanner-A
```

Controlled:

```text
C1
C2
C3
```

Cycle:

```text
1.5 / 0.6 / 1.1 / 0.3
```

Enemy:

```text
0
```

### 3-8 UPPER MARKET GATE — CURRENT RUNTIME

Role:

```text
FREE-WEAVE FINALE
```

한 shared Scanner Group이:

```text
C1
C2
C3
C4
```

를 제어.

동시에:

```text
West / East Patrol spaces
multiple rejoin routes
```

가 존재.

### 6-5 — SELECTED DIFFERENCE

```text
ONE GROUP
THREE CONTROLLED TARGETS
ONE DIAGONAL BAND
NO ENEMY
NO SIDE ROUTE FIELD
NO FREE-WEAVE
```

### Question Difference

3-2:

> **“Scanner는 무엇이고 언제 붙을 수 있는가?”**

3-8:

> **“Scanner가 잠겼을 때 다른 공간으로 계속 움직일 것인가?”**

6-5:

> **“Pad가 가까운 상황에서도 이미 아는 상태를 짧고 정확하게 읽고 한 번에 통과할 수 있는가?”**

---

## 1. 한 줄 정의

6-4 Rooftop Service Shelter의 Observation Lip에서 실제 Pad 03과 Maintenance Shuttle을 확인한 Player가 오른쪽 Pad Access Array Entry Deck에 진입해, Enemy나 Wind 없이 P1 Safe Preview에서 하나의 Access Scan Group에 묶인 C1–C2–C3 세 Service Mount의 공통 `AVAILABLE → WARNING → LOCKED → RESET` 상태를 한눈에 읽고, AVAILABLE/WARNING 중 C1에 붙은 뒤 LOCKED가 와도 현재 Rope가 유지된다는 기존 Scanner 문법을 활용해 적절한 Release 시점까지 버티거나 다음 Window에 C2/C3로 이어가며 왼쪽 방향의 짧은 diagonal controlled chain을 통과하고, 타이밍을 놓치면 non-grappleable R1 Recovery Tray에서 다시 C2/C3 Window를 기다린 뒤 P2 Full Safe Island에 도달해 Scanner pressure를 끝내고 H4를 통해 오른쪽 Beacon Approach Deck으로 빠져나가며, 3-2의 첫 Tutorial과 3-8의 Free-Weave를 반복하지 않고 Pad 접근 전 Scanner literacy만 한 번 깨끗하게 최종 확인하는 Stage.

---

## 2. 전체 게임에서의 역할

### 2-1. Goal Confirmation → Security Mastery

6-4:

```text
THE GOAL IS REAL
```

6-5:

```text
ACCESS CONTROL STILL EXISTS
```

### 2-2. No New Rule

6-5에서:

```text
NEW SCANNER BEHAVIOR
0
```

### 2-3. Timing Without Enemy Noise

6-6은 Patrol.

따라서 6-5는:

```text
Scanner only
```

로 분리.

### 2-4. Pad Proximity Pressure

Pad가 보였다고
급하게 움직이다가 Timing을 놓치는
심리적 압박만 존재.

시스템 자체는 더 빠르지 않다.

---

## 3. Story 역할

### S0 — Entry

```text
PAD ACCESS ARRAY

CONTROL
ONLINE
```

### S1 — P1 Safe Preview

```text
PAD SERVICE MOUNTS

ACCESS
CYCLING
```

### S2 — P2 Full Safe

```text
BEACON SPAN

SERVICE PATH
AVAILABLE
```

### Meaning

확실:

```text
Pad 접근 Maintenance Infrastructure도
자동 Access Control 아래 있다.
```

### 아직 미확정

```text
Player의 최종 Pad access가 거부됐는가?
누가 거부하는가?
Shuttle boarding이 가능한가?
```

### Forbidden Story

```text
ACCESS DENIED
CONTAINMENT VIOLATION
FINAL SECURITY
PAD LOCKED
BOARDING BLOCKED
```

6-8 소유.

---

## 4. 공간 콘셉트

### PAD ACCESS ARRAY

Pad perimeter 이전의:

- access-control mast
- service antenna
- maintenance truss
- controlled attachment mounts

가 한 diagonal service line으로 이어진 공간.

### Shape

```text
RIGHT SAFE ENTRY
↓
LEFTWARD CONTROLLED DIAGONAL
↓
LEFT FULL SAFE ISLAND
↓
RIGHT CLEAN EXIT
```

### Primary Visual

C1–C3가 같은 system family임이
색/하우징/phase cue로 명확해야 한다.

### No Broad Field

3-8처럼:

```text
CENTRAL SPINE
+
WEST
+
EAST
```

없음.

---

## 5. Pixel / Grid 기준

### Base Grid

```text
32 px
```

### Map Hypothesis

```text
WIDTH
1280 px

X
-640 ~ +640

HEIGHT
1056 px

Y
0 ~ -1056
```

### Main Travel

P0:

```text
x +528
```

에서 P2:

```text
x -480
```

까지 왼쪽 diagonal.

이후 P4:

```text
x +96
```

으로 오른쪽 복귀.

### Vertical Gain

약:

```text
960 px
```

### Controlled Band

C1→C2→C3는
각 Link를 280px 안쪽으로 유지.

---

## 6. 전체 맵 구조

```text
Y = 0

                                        P0 ENTRY
                                        (+528,0)
                                           /
                                      H1 (+352,-128)
                                         /
                                      P1 (+384,-224)
                                      SAFE PREVIEW
                                      [ACCESS CYCLING]

                         C1 (+160,-320)
                        /
                 C2 (-64,-448)
                     \
                 R1 (-16,-576)
                 NON-GRAPPLE RECOVERY
                   /
          C3 (-304,-608)
             /
       P2 (-480,-704)
       FULL SAFE ISLAND
            \
             H4 (-224,-832)
                \
                 P4 (+96,-960)
                 BEACON APPROACH EXIT

Y = -1056
```

---

## 7. Zone 구성

### Z0 — Safe Preview

```text
P0 → H1 → P1
```

Scanner-controlled target는 아직 사용하지 않음.

P1에서:

```text
C1
C2
C3
R1
P2 direction
```

을 읽을 수 있어야 한다.

### Z1 — Controlled Entry

```text
P1 → C1
```

C1 새 Attach는:

```text
AVAILABLE / WARNING
```

에서만 가능.

### Z2 — Controlled Chain

```text
C1 → C2 → C3
```

세 Target은:

```text
SAME GROUP
SAME PHASE
```

### Z3 — Recovery

Timing miss:

```text
R1
```

에 landing.

R1은:

```text
collision YES
grappleable NO
scanner-controlled NO
```

후보.

R1에서
다음 C2/C3 available window를 다시 읽는다.

### Z4 — Full Safe Island

```text
C3 → P2
```

P2부터 Scanner-controlled attachment 필요 없음.

### Z5 — Clean Exit

```text
P2 → H4 → P4
```

6-6 Beacon Span preview.

---

## 8. 좌표 / 오브젝트

전부:

```text
HYPOTHESIS — BLOCKOUT
```

### 8-1. Landing / Recovery

| ID | Center | Size | Grappleable | Role |
|---|---:|---:|---|---|
| P0 | `(+528, 0)` | `320×32` | NO candidate | Entry Deck |
| P1 | `(+384, -224)` | `320×32` | NO candidate | Safe Scanner Preview |
| R1 | `(-16, -576)` | `256×24` | **NO** | Timing Recovery Tray |
| P2 | `(-480, -704)` | `320×32` | NO candidate | Full Safe Island |
| P4 | `(+96, -960)` | `384×32` | NO candidate | Beacon Approach Exit |

### 8-2. Grapple Landmarks

| ID | Position | Scanner Group | Role |
|---|---:|---|---|
| H1 | `(+352, -128)` | NONE | Entry Approach |
| C1 | `(+160, -320)` | `pad-access-A` | Controlled Entry |
| C2 | `(-64, -448)` | `pad-access-A` | Controlled Mid |
| C3 | `(-304, -608)` | `pad-access-A` | Controlled Exit |
| H4 | `(-224, -832)` | NONE | Clean Exit Hardpoint |

### 8-3. Scanner Group A

Candidate:

```text
id
sector-06-05:scanner-pad-access-A

cycle
available 1.5
warning   0.6
locked    1.1
reset     0.3

phaseOffsetSeconds
0

controlledSurfaceIds
C1
C2
C3
```

### 8-4. Scanner Housing V1

Candidate visual position:

```text
(+496,-448)
```

Role:

```text
background-prop
gameplay:false
```

### 8-5. Stable IDs

```text
sector-06-05:p0
sector-06-05:p1
sector-06-05:r1
sector-06-05:p2
sector-06-05:p4

sector-06-05:hardpoint-h1
sector-06-05:controlled-c1
sector-06-05:controlled-c2
sector-06-05:controlled-c3
sector-06-05:hardpoint-h4

sector-06-05:scanner-pad-access-A
sector-06-05:scanner-housing
```

---

## 9. Safe Route

### Route

```text
P0
→ H1
→ P1
→ C1
→ C2
→ C3
→ P2
→ H4
→ P4
```

### Distance Pre-check

| Link | Distance |
|---|---:|
| P0 → H1 | `217.6 px` |
| H1 → P1 | `101.2 px` |
| P1 → C1 | `243.7 px` |
| C1 → C2 | `258.0 px` |
| C2 → C3 | `288.4 px` |
| C3 → P2 | `200.5 px` |
| P2 → H4 | `286.2 px` |
| H4 → P4 | `344.7 px` |

### Result

```text
MAX SAFE LINK
= 344.7 px

HOOK REACH
= 400 px

MARGIN
= 55.3 px
```

### Controlled Mandatory Max

```text
C2 → C3
288.4 px
```

Scanner timing과 끝거리 Aim을
동시에 요구하지 않는다.

---

## 10. Flow Route

### Route

```text
P0
→ H1
→ C1
→ C2
→ C3
→ H4
→ P4
```

P1/P2 landing 생략.

### Distance Pre-check

| Link | Distance |
|---|---:|
| P0 → H1 | `217.6 px` |
| H1 → C1 | `271.5 px` |
| C1 → C2 | `258.0 px` |
| C2 → C3 | `288.4 px` |
| C3 → H4 | `237.9 px` |
| H4 → P4 | `344.7 px` |

### Result

```text
MAX FLOW LINK
= 344.7 px
```

### Flow Meaning

AVAILABLE window가 길게 남아 있으면
숙련 Player는:

```text
C1
→ C2
→ C3
```

를 빠르게 chain.

LOCK이 오면
현재 Rope를 유지하며 다음 Window를 기다릴 수 있음.

---

## 11. Scanner Timing Contract

### Shared Phase

C1/C2/C3:

```text
SAME GROUP
```

이므로 항상 같은 phase.

### Attach Window

```text
AVAILABLE 1.5
+
WARNING 0.6

=
2.1 sec attach-allowed window
```

### Block Window

```text
LOCKED 1.1
+
RESET 0.3

=
1.4 sec attach-blocked window
```

### Critical Current Behavior

C1에 이미 Attach한 뒤:

```text
LOCKED
```

가 와도:

```text
forced detach
NO
```

### Player Choice

1. available window 안에 빠르게 다음 C target으로 이동.
2. 현재 Rope를 유지하고 다음 window를 기다림.
3. Release 후 miss하면 R1/P2 recovery.

---

## 12. Recovery

### R1

```text
(-16,-576)
```

### Intended Properties

```text
collision
YES

grappleable
FALSE

scanner group
NONE
```

### Why Non-Grappleable

R1이 grappleable이면:

```text
C2/C3 controlled chain
```

옆에 항상 붙을 수 있는 같은-purpose bypass가 생길 수 있다.

따라서 R1은:

```text
LAND / WAIT / JUMP
```

용.

### Re-entry

```text
R1 → C2
136.7 px

R1 → C3
289.8 px
```

둘 다 Hook Reach 내.

### P2

R1에서 P2 직접 Rope attach를
Mandatory recovery로 가정하지 않는다.

정상 Recovery:

```text
R1
→ C3
→ P2
```

### Target

Scanner timing failure:

```text
≤ 4 sec
```

안에 다시 controlled chain 복귀 목표.

---

## 13. Same-purpose Bypass Guard

### Critical Rule

C1/C2/C3 주변에:

```text
always-grappleable mast
large grappleable roof
decorative truss with collision/grapple
```

를 두면 FAIL.

### Required

Controlled Target 주변의 구조물은:

```text
grappleable:false
```

또는:

```text
gameplay:false
```

로 명확히 분리.

### R1

Recovery platform도:

```text
grappleable:false
```

후보.

### Why

Scanner의 의미는:

```text
some necessary new Attach points
temporarily unavailable
```

이어야 한다.

```text
controlled C2 locked
but adjacent beam always attachable
```

이면 시스템 자체가 무효.

---

## 14. Existing Rope / Release Discipline

### Scanner가 하지 않는 것

```text
detach current rope
NO

disable rope
NO

damage player
NO

knockback
NO
```

### Timing Mistake

Player가:

```text
LOCKED 중
current rope release
```

후 다음 controlled surface로
새 Attach를 시도하면 실패.

### Forgiveness

- P1 preview
- R1 recovery
- P2 safe island
- short controlled link lengths

으로 해결.

### No Punishment Stack

Scanner miss와:

```text
Enemy projectile
Wind
Cutter
```

를 동시에 겹치지 않는다.

---

## 15. Foundation Expression

### IMPULSE COIL

AVAILABLE Window 안에서:

```text
C1 → C2 → C3
```

chain 압축 가능.

### RELAY LINK

release/re-attach가 핵심인 Stage라
가장 직접적인 comfort gain.

### SHEAR CURRENT

Enemy 없음.

Offense value:

```text
0
```

정상.

### Mandatory

```text
NO FOUNDATION REQUIRED
```

### Important

Relay가 있다고 Scanner Locked를
무시할 수 있다고 가정하지 않는다.

Dynamic attach eligibility가 우선.

---

## 16. Story Trigger

### S0 — Entry

```text
PAD ACCESS ARRAY

CONTROL
ONLINE
```

### S1 — P1

```text
PAD SERVICE MOUNTS

ACCESS
CYCLING
```

### S2 — P2

```text
BEACON SPAN

SERVICE PATH
AVAILABLE
```

### No Denial

아직:

```text
ACCESS DENIED
```

아님.

이것은:

```text
mount access is cycling
```

일 뿐
최종 Pad 진입 판정이 아니다.

---

## 17. Scanner Presentation Contract

### Gameplay State

현재 attach eligibility Runtime은 VERIFIED.

### Presentation

이번 authoring pass에서
최신 코드 검색으로 전용 Renderer 구현을 별도 확정하지 못했다.

따라서:

```text
GAMEPLAY CAPABILITY
VERIFIED

STATE-CUE PRESENTATION
PRODUCTION RE-VERIFY REQUIRED
```

### Required Cue

C1/C2/C3가 같은 phase임을
한눈에 읽어야 한다.

권장 semantic:

```text
AVAILABLE
clear cyan / open

WARNING
pulse / amber transition

LOCKED
muted / crossed / unavailable

RESET
neutral reset cue
```

정확한 색/animation은
현재 Renderer contract 확인 후 확정.

### Forbidden

Damage Laser처럼 보이는
red beam presentation.

---

## 18. Camera

모두:

```text
HYPOTHESIS
```

### C0 — Entry

```text
P0 / H1 / P1

Desktop
0.98

Mobile
0.72
```

### C1 — Scanner Full Read — PRIMARY

반드시:

```text
P1
C1
C2
C3
R1
```

를 가능한 한 함께 보여준다.

```text
Desktop
0.88

Mobile
0.68
```

### C2 — Controlled Exit

```text
C2
C3
R1
P2
H4

Desktop
0.90

Mobile
0.68
```

### C3 — Beacon Handoff

```text
P2 / H4 / P4

Desktop
0.96

Mobile
0.72
```

### Guard

Scanner 전체를 보이게 하려고
Player / controlled Hardpoint cue가
너무 작아지면 geometry를 먼저 줄인다.

---

## 19. Geometry Repetition Audit

### vs 3-2

3-2 actual Runtime:

```text
vertical-ish Gallery
C1/C2/C3 interleaved with several safe decks
first tutorial
```

6-5:

```text
single exposed diagonal controlled chain
one recovery tray
one safe endpoint
mastery recall
```

### vs 3-8

3-8 actual Runtime:

```text
4 controlled targets
central scanner spine
west/east alternative targets
2 Patrol territories
multiple rejoin hubs
```

6-5:

```text
3 controlled targets
no enemy
no west/east free-weave
no alternate bypass
```

### vs 6-1~6-4

```text
6-1
neutral V traverse

6-2
continuous crosswind

6-3
single Sentry arc

6-4
horizontal shelter rest

6-5
right-to-left timed controlled diagonal
```

### Exact Coordinate Audit

최종 자동검사 대상:

- Sector05 5-1~5-8
- 6-1
- 6-2
- 6-3
- 6-4
- actual 3-2
- actual 3-8

목표:

```text
EXACT MAJOR-POINT OVERLAP
0
```

---

## 20. Gate Contract

Stage-local:

```text
Reach P4
→ Gate Panel
→ Gate Open
→ Physical Crossing
→ 6-6
```

### P4

```text
(+96,-960)
```

### Next

6-6:

```text
BEACON SPAN
PATROL DRONE T1 ×1
```

### Handoff

P4는 6-6 Patrol activation 전
Safe Preview 역할을 할 수 있어야 한다.

### Required Kill

```text
NONE
```

---

## 21. Pixel Art Asset Spec

### Pad Access Array

- sparse antenna control frames
- service mount rails
- pad-direction beacon structures
- open sky

### Controlled C1/C2/C3

같은 family.

- same housing language
- same state cue rhythm
- cyan gameplay anchor identity 유지

### Scanner Housing

background security equipment.

### R1

얇지만 명확한 maintenance tray.

### Pad / Shuttle

6-4에서 이미 확인했으므로
6-5 background에서 계속 방향 landmark로 일부 보일 수 있음.

하지만 gameplay focus를 빼앗지 않는다.

---

## 22. Background / Parallax

### Far

- sky
- vertical city
- Pad direction

### Mid

- access-array towers
- scanner housing
- beacon frames

### Near

- controlled mount support
- recovery tray
- rail edge

### Critical

C1/C2/C3 바로 옆의 background joint가
live Grapple point처럼 보이면 FAIL.

### Pad Landmark

6-4 이후 Player가 방향을 잃지 않게
일부 silhouette continuity 허용.

---

## 23. Sound / VFX

### Scanner State

AVAILABLE:

```text
low stable tone
```

WARNING:

```text
short escalating cue
```

LOCKED:

```text
closed / muted confirmation
```

RESET:

```text
brief reset cue
```

정도 후보.

### No Alarm Combat Layer

Enemy가 없으므로
Scanner를 전투 경보처럼 과장하지 않는다.

### Pad Direction

distant shuttle machinery / beacon sound
아주 약하게 유지 가능.

---

## 24. PASS Criteria

### Runtime Alignment

- current AccessScan phases 4개 사용
- cycle `1.5 / 0.6 / 1.1 / 0.3`
- same group C1/C2/C3
- phase offset 0
- AVAILABLE/WARNING new Attach allowed
- LOCKED/RESET new Attach blocked
- existing Rope not force-detached
- scanner is controlled-surface group, not damage rectangle

### Geometry

- C1/C2/C3 exactly 3
- Safe max 344.7px
- Flow max 344.7px
- controlled mandatory max 288.4px
- all links <400px
- R1 non-grapple recovery
- R1→C2 / C3 both <400px
- no same-purpose always-grapple bypass
- P2 full safe
- no instant-death sky dependency

### Gameplay

- Enemy 0
- Wind 0
- Cutter 0
- Patrol 0
- new mechanic 0
- no forced detach
- no damage
- no second scanner group
- Foundation independent

### Story

- Pad Access Control still cycling
- no final denial
- no new conspiracy
- Beacon Span preview

### Production

- Runtime implementation HOLD
- Scanner presentation re-verification required
- Approved Art HOLD
- physical PASS not claimed before graybox

---

## 25. FAIL Conditions

### Scanner

- `LOCKED` causes current rope detach
- RESET attach allowed by mistake
- separate phase per C1/C2/C3
- second group
- faster cycle just for difficulty
- damage laser presentation
- phase visibility unreadable

### Geometry

- adjacent always-grappleable beam bypasses C target
- R1 grappleable and becomes primary bypass
- controlled mandatory 380~400px
- C1/C2/C3 not visible from P1
- P2 also Scanner-controlled
- recovery requires blind fall
- 3-8-style west/east alternate field emerges

### Gameplay

- Patrol added
- Wind added
- moving shutter added
- Foundation required

### Story

- `ACCESS DENIED`
- `CONTAINMENT VIOLATION`
- Final Security reveal
- Shuttle boarding prompt

### Product

- Sector06 Runtime early implementation
- Scanner Art approved without renderer/state-cue verification
- distance precheck treated as Physics PASS

---

## 26. 개발자 / 기획자 최종 전달 요약

### Stage

```text
SECTOR 06-5
PAD ACCESS ARRAY
```

### Core

```text
KNOWN SCANNER
+
ONE CONCISE MASTERY BAND
```

### Scanner

```text
ONE GROUP

C1
C2
C3

cycle
1.5 / 0.6 / 1.1 / 0.3

phase offset
0
```

### Attach Contract

```text
AVAILABLE / WARNING
NEW ATTACH YES

LOCKED / RESET
NEW ATTACH NO

CURRENT ATTACHED ROPE
STAYS ATTACHED
```

### Route

```text
SAFE
P0 → H1 → P1 → C1 → C2 → C3 → P2 → H4 → P4

FLOW
P0 → H1 → C1 → C2 → C3 → H4 → P4
```

### Geometry

```text
SAFE MAX
344.7 px

FLOW MAX
344.7 px

CONTROLLED MANDATORY MAX
288.4 px

HOOK REACH
400 px
```

### Recovery

```text
R1 (-16,-576)

collision YES
grappleable NO

R1 → C2
136.7 px

R1 → C3
289.8 px
```

### Story

```text
PAD ACCESS ARRAY
CONTROL ONLINE

PAD SERVICE MOUNTS
ACCESS CYCLING
```

Exit:

```text
BEACON SPAN
SERVICE PATH AVAILABLE
```

### Stage Feeling

> **“Pad와 Shuttle은 이미 눈앞에 있다. 하지만 접근 구조는 여전히 도시의 자동 보안 리듬 안에서 움직인다. 새로운 퍼즐은 없다. 세 개의 Mount가 동시에 열리고 닫히는 익숙한 상태를 한 번 정확하게 읽고, 붙었으면 LOCK을 버티고, 다음 Window에 다시 붙어 계속 전진하면 된다.”**

---

## OPEN QUESTIONS

### 1. Scanner Presentation

Gameplay filtering은 current Runtime에서 확인.

하지만 이번 authoring pass에서
최신 dedicated Renderer state cue는 별도 확인하지 못했다.

6-5 Runtime authoring 전:

- AVAILABLE
- WARNING
- LOCKED
- RESET
- candidate highlight

표현 경로를 다시 찾는다.

### 2. C1/C2/C3 All Same Phase

현재 의도적으로
한 group.

6-5는 mastery recall이므로
phase offset을 추가하지 않는다.

### 3. R1 Grappleable False

Recovery는 landing용.

실제 Graybox에서
R1→C3 재진입이 불편하면
R1 위치/폭을 먼저 조정.

R1을 grappleable로 바꾸는 것은
bypass 분석 후 최후에 고려.

### 4. H4 → P4 344.7px

Threat-free clean exit.

허용 후보.

Mobile miss가 반복되면
P4를 16px 왼쪽으로 조정.

### 5. Scanner Housing

Gameplay field rectangle가 아니므로
Housing과 C1-C3 사이에
“광선이 닿아야만 작동”하는 식의 물리적 오해를 만들지 않는다.

### 6. 6-4 Handoff

6-4 P4가 오른쪽 끝이므로
6-5 P0도 오른쪽 Entry로 잡은 것은
공간적 handoff 후보.

실제 Portal spawn 위치는
Sector06 Runtime authoring에서 조정.

### 7. Pad Visibility

6-4가 direct reveal을 소유.

6-5에서는 Pad를 계속 일부 볼 수 있지만
새 Story beat로 다시 강조하지 않는다.

### 8. 6-6 Before Authoring

다시 확인:

- latest GitHub main
- 6-1~6-5 geometry signatures
- current Patrol Runtime
- actual 2-2 / 5-2 / 5-7 Patrol geometry
- activation / patrol-stop-on-target contract

후 Beacon Span 좌표를 작성.

---

SECTOR 06-5 / PAD ACCESS ARRAY — BLOCKOUT CANDIDATE · REV 1.0
