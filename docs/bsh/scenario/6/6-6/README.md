# SECTOR 06-6 — BEACON SPAN

*BLOCKOUT CANDIDATE · REV 1.0*

◀ PREV — [SECTOR 06-5 / PAD ACCESS ARRAY](../6-5/README.md) · NEXT — [SECTOR 06-7 / CONTAINMENT LATTICE](../6-7/README.md) ▶

`SECTOR 06 ROOFTOP / EVACUATION` · `STAGE 06` · `PATROL MASTERY RECALL` · `DIAGONAL BEACON PATROL`

| 항목 | 기준 |
|---|---|
| Status | HYPOTHESIS — BLOCKOUT CANDIDATE |
| Authoring Snapshot | `4ebe0d4b5c80faaa6bc2c24385c77ffea9d5831a` |
| Sector Master | GitHub MERGED — PR #578 |
| 6-1 / 6-2 | GitHub MERGED — PR #579 |
| 6-3 | GitHub MERGED — PR #580 |
| 6-4 | GitHub MERGED — PR #582 |
| Previous Stage | 6-5 PAD ACCESS ARRAY REV 1.0 — LOCAL REVIEWED |
| Difficulty | ★★★★ |
| Expected First Playtime | 130–185 sec |
| Expected Skilled Clear | 50–75 sec |
| Enemy | Patrol Drone T1 ×1 |
| Patrol Path | DIAGONAL 2-POINT PINGPONG |
| Patrol Speed | `48` |
| Patrol Endpoint Wait | `0.45 sec` |
| Rope Cut | NONE — `cutter-fire` ABSENT / explicit `no-rope-cut` |
| Wind | NONE |
| Access Scan Field | NONE |
| Cutter | NONE |
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
| Primary Spatial Identity | LEFT ENTRY → RIGHT DIAGONAL COMBAT ARC → LEFTWARD BEACON EXIT |
| Primary Role | Patrol의 “이동 위치를 보고 진입 → 진입 시 그 위치에서 정지 사격” 문법을 Open-Sky diagonal topology에서 최종 재시험 |
| Story Role | Pad 03 접근 Beacon network가 가까워졌음을 확인. 최종 접근 거부는 아직 공개하지 않음 |
| Stage-local Exit | Reach P4 Containment Approach Deck → Gate Panel → Physical Crossing |
| Sector06 Runtime | NOT AUTHORED / NOT CONNECTED |
| Approved Gameplay Art | HOLD until Runtime Area / Camera Zone / Stable IDs exist |

---

## 0. 기획 기준

### LOCKED FOR THIS STAGE

6-6은:

```text
FIRST PATROL TUTORIAL
NO
```

다.

Player는 이미 Sector02 / Sector05에서:

```text
NO TARGET
→ DRONE PATROLS

TARGET ACQUIRED
→ PATROL STOPS
→ AIM / FIRE

TARGET INVALID
→ PATROL RESUMES
```

를 경험했다.

### Core Question

> **“대각선으로 움직이는 Drone의 현재 위치를 보고 진입하면, 그 위치가 firing origin으로 고정된 뒤 Rope body path를 바꿔 계속 전진할 수 있는가?”**

### Stage Grammar

```text
SAFE PATROL PREVIEW
↓
READ DIAGONAL DRONE POSITION
↓
ENTER ACTIVATION
↓
DRONE STOPS WHERE IT IS
↓
H2 → H3 → H4 BODY-ARC TRAVERSE
↓
VISIBLE LOWER RECOVERY
↓
FULL SAFE BEACON ISLAND
↓
LEFTWARD CLEAN EXIT
↓
CONTAINMENT LATTICE PREVIEW
```

### 금지

- Patrol이 Target 획득 후 계속 움직인다고 가정
- 특정 endpoint에 올 때까지 기다려야만 통과 가능
- second Patrol
- Cutter
- Scanner
- Wind
- Cover puzzle
- moving platform
- Kill Gate
- New Input
- New Rope Mode
- New Growth
- `ACCESS DENIED`
- Final Security reveal

---

## 0-1. 최신 GitHub / Runtime 교차검증

### CURRENT MAIN AT FINAL REVIEW

```text
4ebe0d4b5c80faaa6bc2c24385c77ffea9d5831a
```

6-6 작성 중 PR #582가 병합되어:

```text
6-4 ROOFTOP SERVICE SHELTER
```

가 GitHub 정식 Scenario Source가 됐다.

PR #582는 Scenario 문서 / integration 범위이며
Patrol / Combat Runtime 변경은 없다.

6-5는 현재 LOCAL REVIEWED.

### VERIFIED — CURRENT PATROL STATE

Current `EnemyPatrol.js`:

```text
speed > 0
required

points
SUPPORTED

route
SUPPORTED

corridor
SUPPORTED

mode
loop / pingpong

waitSeconds
SUPPORTED
```

Patrol point는 Activation이 있으면:

```text
activation bounds 안으로 clamp
```

된다.

### VERIFIED — TARGET / PATROL INTERACTION

Current `EnemyObject.js`:

```text
NO VALID TARGET
→ reset attack
→ advanceEnemyPatrol()

VALID TARGET
→ attack state machine
→ patrol advance NOT called
```

따라서:

```text
TARGET ACQUIRED
=
PATROL POSITION FREEZES
```

가 현재 정확한 동작.

### Current Patrol Baseline

기존 authored / reviewed precedent:

```text
speed
48

waitSeconds
0.45

mode
pingpong
```

6-6도 그대로 사용.

### Rope Cut

Current projectile:

```text
canCutRope
=
rules.includes("cutter-fire")
```

6-6 Patrol:

```text
cutter-fire
ABSENT
```

명시성 위해:

```text
no-rope-cut
```

도 유지.

---

## 0-2. Patrol Precedent Audit

### 2-2 PATROL WALKWAY — ACTUAL RUNTIME

```text
one Patrol
horizontal path
(-320,-416)
↔
(+320,-416)

large activation
first moving-security lesson
```

### 5-2 GLASS ATRIUM

```text
one Patrol
horizontal path
(-160,-624)
↔
(+160,-624)

Sparse Hardpoint
+
entry timing
```

### 5-7 EVACUATION ARCHIVE

```text
one short Patrol band
then long story-heavy threat-free ascent
```

### 6-6 — SELECTED DIFFERENCE

```text
DIAGONAL PATROL PATH

(+384,-432)
↔
(-96,-704)
```

그리고 Player route도
평평한 walkway가 아니라:

```text
OPEN-SKY DIAGONAL BEACON STRUCTURE
```

다.

### No New AI

대각 Patrol은:

```text
existing arbitrary patrol points
```

를 쓰는 것뿐.

---

## 0-3. 6-5 → 6-6 → 6-7 역할

### 6-5

```text
SCANNER
TIMING / ATTACH ELIGIBILITY
```

### 6-6

```text
PATROL
ENTRY TIMING / BODY PATH
```

### 6-7

```text
CUTTER
ROPE-CUT / RECOVERY
```

따라서 6-6에서는:

```text
Scanner
NO

Rope Cut
NO
```

로 분리.

---

## 1. 한 줄 정의

6-5 Pad Access Array의 세 Controlled Hardpoint를 통과한 Player가 Beacon Span의 왼쪽 Entry Deck에 진입해, P1 Safe Preview에서 Aviation Beacon 구조 사이를 `(+384,-432) ↔ (-96,-704)` 대각선으로 천천히 왕복하는 Patrol Drone 한 대와 H2–H3–H4의 오른쪽 상승 Arc, 그리고 아래쪽 R0 Recovery Tray를 한 화면에서 읽은 뒤 어떤 Patrol 위치에서도 기다림 없이 진입할 수 있지만 Activation에 들어서는 순간 Drone이 그 현재 위치에서 순찰을 멈추고 사격 origin이 되는 상황에서 H2→H3→H4 Rope body path를 계속 바꿔 오른쪽으로 통과하고, 실패 시 Activation 밖 R0로 내려가 재진입하며, 성공 시 P2 Full Safe Beacon Island에서 적 압박을 완전히 끝낸 뒤 H5/H6를 따라 다시 왼쪽 Containment Approach Deck으로 빠져나가 6-7 Cutter mastery를 준비하는 Open-Sky Patrol Final Recall Stage.

---

## 2. 전체 게임에서의 역할

### 2-1. Moving Threat의 마지막 회수

Patrol 자체의 이동이
새 난이도가 아니다.

Player가 읽는 것:

```text
CURRENT DRONE POSITION
```

이다.

### 2-2. Position → Attack Origin

진입 전:

```text
MOVING
```

진입 후:

```text
STATIONARY FIRING ORIGIN
```

으로 의미가 바뀐다.

### 2-3. No Waiting Gate

좋은 위치를 기다리면
조금 쉬울 수는 있다.

하지만:

```text
ANY PATROL POSITION
MUST BE CLEARABLE
```

이다.

### 2-4. 6-7 대비

6-7은 Rope 자체가 잘릴 수 있다.

6-6은 오직:

```text
BODY-SHOT PRESSURE
```

만.

---

## 3. Story 역할

### S0 — Entry

```text
BEACON SPAN

PAD APPROACH SIGNAL
ACTIVE
```

### S1 — P2 Full Safe

```text
PAD 03 BEACON

APPROACH LINK
ACTIVE
```

### S2 — Exit

```text
CONTAINMENT LATTICE

SECURITY
ACTIVE
```

### Meaning

Player는:

```text
Pad 03가 더 가까워졌고
Beacon 접근망이 작동 중
```

임을 확인.

### 아직 공개하지 않음

- Access Denied
- final containment verdict
- boarding access state
- Final Security identity

---

## 4. 공간 콘셉트

### BEACON SPAN

Pad03로 향하는:

- aviation beacon arms
- maintenance truss
- rooftop signal bridges
- isolated service brackets

로 구성된 외부 Span.

### Main Shape

```text
LEFT SAFE ENTRY
→
RIGHTWARD RISING COMBAT ARC
→
RIGHT SAFE BEACON ISLAND
→
LEFTWARD UPPER EXIT
```

### Enemy Motion Shape

Player와 다른 diagonal:

```text
UPPER RIGHT
↙
LOWER LEFT
```

을 왕복.

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
1280 px

Y
0 ~ -1280
```

### Main Sweep

P0:

```text
x -496
```

→ H3:

```text
x +400
```

→ P4:

```text
x -544
```

### Vertical Gain

약:

```text
1152 px
```

### Combat Band

H2/H3/H4만
Activation 안.

---

## 6. 전체 맵 구조

```text
Y = 0

P0 ENTRY
(-496,0)
   \
    H1 (-256,-144)
      \
       P1 (+16,-224)
       SAFE PATROL PREVIEW

                           D1 PATH START
                           (+384,-432)
                              ↙
                    H2 (+240,-352)
                         \
                          H3 (+400,-544)
                         /
                 D1 PATH END
                 (-96,-704)
                       \
                        H4 (+192,-720)

                              R0 (+448,-816)
                              SAFE LOWER RECOVERY

                   P2 (-80,-864)
                   FULL SAFE BEACON ISLAND
                      \
                       H5 (-64,-944)
                         \
                          H6 (-320,-1056)
                            \
                             P4 (-544,-1152)
                             CONTAINMENT APPROACH

Y = -1280
```

---

## 7. Zone 구성

### Z0 — Safe Preview

```text
P0 → H1 → P1
```

D1 activation OUT.

P1에서 반드시:

- full diagonal patrol path
- H2 / H3 / H4
- R0
- P2 direction

을 읽는다.

### Z1 — Activation Entry

```text
P1 → H2
```

H2 activation IN.

진입 순간 D1의
그 시점 위치가 firing origin이 된다.

### Z2 — Open-Sky Combat Arc

```text
H2 → H3 → H4
```

전부 Activation IN.

### Z3 — Recovery

Miss / body hit:

```text
R0
```

Activation OUT.

신규 acquire 없음.

### Z4 — Full Safe Beacon Island

```text
H4 → P2
```

P2 activation OUT.

### Z5 — Clean Exit

```text
P2 → H5 → H6 → P4
```

Enemy activation 없음.

---

## 8. 좌표 / 오브젝트

전부:

```text
HYPOTHESIS — BLOCKOUT
```

### 8-1. Landing / Recovery

| ID | Center | Size | Role |
|---|---:|---:|---|
| P0 | `(-496, 0)` | `320×32` | Entry Deck |
| P1 | `(+16, -224)` | `320×32` | Safe Patrol Preview |
| R0 | `(+448, -816)` | `240×24` | Lower Recovery |
| P2 | `(-80, -864)` | `320×32` | Full Safe Beacon Island |
| P4 | `(-544, -1152)` | `384×32` | Containment Approach Exit |

### 8-2. Grapple Landmarks

| ID | Position | Role |
|---|---:|---|
| H1 | `(-256, -144)` | Entry Brace |
| H2 | `(+240, -352)` | Combat Entry |
| H3 | `(+400, -544)` | High Arc Redirect |
| H4 | `(+192, -720)` | Combat Exit |
| H5 | `(-64, -944)` | Beacon Exit Joint |
| H6 | `(-320, -1056)` | Final Truss Joint |

### 8-3. Patrol Drone D1

```text
Initial
(+384,-432)

Type
patrol-drone-t1
```

Patrol Points:

```text
A
(+384,-432)

B
(-96,-704)
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

Rules:

```text
kill-optional
no-rope-cut
target-lock-cycle
activation-band-only
```

Explicit:

```text
cutter-fire
ABSENT
```

### 8-4. Activation

```text
X
-128 ~ +448

Y
-768 ~ -320
```

Equivalent candidate:

```text
triggerBounds(-128,-768,576,448)
```

### 8-5. Membership

```text
P1 OUT

H2 IN
H3 IN
H4 IN

R0 OUT
P2 OUT
H5 OUT
P4 OUT
```

### 8-6. Stable IDs

```text
sector-06-06:p0
sector-06-06:p1
sector-06-06:r0
sector-06-06:p2
sector-06-06:p4

sector-06-06:hardpoint-h1
sector-06-06:hardpoint-h2
sector-06-06:hardpoint-h3
sector-06-06:hardpoint-h4
sector-06-06:hardpoint-h5
sector-06-06:hardpoint-h6

sector-06-06:patrol-d1
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
→ H6
→ P4
```

### Distance Pre-check

| Link | Distance |
|---|---:|
| P0 → H1 | `279.9 px` |
| H1 → P1 | `283.5 px` |
| P1 → H2 | `258.0 px` |
| H2 → H3 | `249.9 px` |
| H3 → H4 | `272.5 px` |
| H4 → P2 | `307.8 px` |
| P2 → H5 | `81.6 px` |
| H5 → H6 | `279.4 px` |
| H6 → P4 | `243.7 px` |

### Result

```text
MAX SAFE LINK
= 307.8 px

HOOK REACH
= 400 px

MARGIN
= 92.2 px
```

### Active Mandatory Max

```text
H3 → H4
272.5 px
```

Patrol 압박과 range precision을
겹치지 않는다.

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
→ H6
→ P4
```

P2 landing 생략.

### Distance Pre-check

| Link | Distance |
|---|---:|
| P0 → H1 | `279.9 px` |
| H1 → P1 | `283.5 px` |
| P1 → H2 | `258.0 px` |
| H2 → H3 | `249.9 px` |
| H3 → H4 | `272.5 px` |
| H4 → H5 | `340.2 px` |
| H5 → H6 | `279.4 px` |
| H6 → P4 | `243.7 px` |

### Result

```text
MAX FLOW LINK
= 340.2 px
```

### Flow Meaning

숙련 Player는 Combat Band를 빠져나온 momentum으로
P2에 착지하지 않고 H5로 연결.

---

## 11. Patrol Position / Attack Origin Contract

### Before Activation

D1은:

```text
A ↔ B
```

대각선 Patrol.

### On Target Acquisition

현재 Runtime상:

```text
advanceEnemyPatrol()
NOT CALLED
```

이므로 D1은
그 순간 위치에서 멈춘다.

### Result

Player가 선택하는 것은:

```text
WHEN TO ENTER
```

이고 그 선택은:

```text
WHERE THE FIRING ORIGIN FREEZES
```

를 바꾼다.

### Important

Patrol이 공격하면서
계속 path를 따라 이동하는 연출 금지.

---

## 12. All-Patrol-Positions Clearable Contract

### Required

A endpoint:

```text
(+384,-432)
```

B endpoint:

```text
(-96,-704)
```

뿐 아니라
그 사이 모든 위치에서:

```text
P1 → H2 → H3 → H4 → P2
```

가 통과 가능해야 한다.

### Therefore

진행 조건:

```text
WAIT UNTIL D1 REACHES A
NO

WAIT UNTIL D1 REACHES B
NO
```

### Playtest

Patrol path를:

```text
0%
25%
50%
75%
100%
```

위치에서 강제로 freeze한 테스트를 권장.

각 상태에서 Mandatory route가
kill 없이 clear 가능해야 PASS.

---

## 13. Recovery

### R0

```text
(+448,-816)
```

Activation OUT.

### Useful Links

```text
H3 → R0
276.2 px

R0 → H4
273.4 px
```

따라서 H3/H4 구간의
body hit / miss를 받는 catch.

### Re-entry

```text
R0 → H4
```

후 P2로 진행.

### Target

일반 failure:

```text
≤ 5 sec
```

복귀.

### No Instant Death

Open Sky miss를
즉시 제거로 처리하지 않는다.

---

## 14. Projectile / Rope Contract

### Patrol Projectile

```text
cutter-fire
ABSENT
```

따라서:

```text
ROPE CUT
NONE
```

### Body Hit

현재 family의:

```text
damage
+
knockback
```

만.

### Existing Projectile

Activation 밖으로 나가도
이미 발사된 projectile가 즉시 삭제된다고 가정하지 않는다.

P2에서도
남은 projectile path를 읽어야 함.

---

## 15. Cover Policy

### Cover

```text
NONE REQUIRED
```

### Rule

```text
cover-ends-los
NOT REQUIRED
```

6-6의 핵심은:

```text
current firing origin
+
body arc
```

### Decorative Beacon

큰 Beacon mast가
실질적인 hard LOS wall이 되어
특정 D1 위치를 무효화하면 FAIL.

---

## 16. Foundation Expression

### IMPULSE COIL

Combat Band exposure 시간을 줄이고
H4→H5 Flow를 이어가기 좋음.

### RELAY LINK

H2→H3→H4의 빠른 body-path redirection에 직접 이득.

### SHEAR CURRENT

Patrol이 Rope segment에 걸리면
optional offense 가능.

### Kill

```text
OPTIONAL
```

### Mandatory

```text
NO FOUNDATION REQUIRED
```

---

## 17. Story Trigger

### S0 — Entry

```text
BEACON SPAN

PAD APPROACH SIGNAL
ACTIVE
```

### S1 — P2

```text
PAD 03 BEACON

APPROACH LINK
ACTIVE
```

### S2 — Exit

```text
CONTAINMENT LATTICE

SECURITY
ACTIVE
```

### No Denial Yet

```text
ACCESS DENIED
```

아님.

---

## 18. Camera

모두:

```text
HYPOTHESIS
```

### C0 — Patrol Preview — PRIMARY

```text
P1
H2
H3
H4
D1 full diagonal path
R0
```

가능한 한 함께 표시.

```text
Desktop
0.88

Mobile
0.68
```

### C1 — Combat Arc

```text
H2 / H3 / H4 / D1 / R0

Desktop
0.90

Mobile
0.68
```

### C2 — Safe Beacon Island

```text
H4 / R0 / P2 / H5

Desktop
0.94

Mobile
0.70
```

### C3 — Exit

```text
P2 / H5 / H6 / P4

Desktop
0.96

Mobile
0.72
```

### Guard

D1 path를 다 보여주려고
Player / Grapple cue를 과도하게 축소하지 않는다.

---

## 19. Geometry Repetition Audit

### vs 2-2

2-2:

```text
horizontal Patrol
large walkway / cover environment
first moving-security lesson
```

6-6:

```text
diagonal Patrol
open structural islands
late mastery
```

### vs 5-2

5-2:

```text
horizontal short corridor
Sparse Hardpoint core
```

6-6:

```text
diagonal wide Beacon path
no sealed-surface eligibility puzzle
```

### vs 5-7

5-7:

```text
short early Patrol interruption
then story-heavy quiet ascent
```

6-6:

```text
Patrol itself is the stage core
then short clean exit
```

### vs 6-3

6-3:

```text
fixed Standard Sentry
known fixed firing origin
```

6-6:

```text
moving preview
→ chosen freeze position
```

### Exact Coordinate Audit

최종 자동검사 대상:

- Sector05 5-1~5-8
- 6-1~6-5
- actual 2-2
- 5-2
- 5-7

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
→ 6-7
```

### Enemy Kill

```text
NOT REQUIRED
```

### Next

6-7:

```text
CONTAINMENT LATTICE
CUTTER T1 ×1
```

### Handoff

P4는
6-7 Cutter activation 전
Safe Preview Deck 역할을 할 수 있어야 한다.

---

## 21. Pixel Art Asset Spec

### Beacon Span

- aviation beacon arm
- exposed signal truss
- thin maintenance deck
- open sky
- distant Pad lights

### D1

Patrol Drone family 그대로.

Cutter orange Rope-cut telegraph 금지.

### Patrol Path Cue

physical rail 필요 없음.

Beacon light sequence / maintenance markers로
대각 movement range를 읽을 수 있게 함.

### Grapple

H2/H3/H4 Cyan clarity 유지.

---

## 22. Background / Parallax

### Far

- Pad03 direction
- sky
- city depth

### Mid

- beacon towers
- aviation light arrays
- distant service frames

### Near

- truss edge
- Patrol Drone
- recovery tray

### Critical

D1 silhouette와
beacon warning light가 겹쳐
enemy 위치가 안 읽히면 FAIL.

---

## 23. Sound / VFX

### Patrol Before Activation

soft drone motor
+
directional movement cue.

### On Acquire

기존 acquire / track / lock family 사용.

### No Cutter Cue

Rope-cut alarm 없음.

### P2

combat layer 감소.

Pad beacon hum이 조금 가까워짐.

---

## 24. PASS Criteria

### Runtime

- points-based diagonal patrol supported
- speed48
- wait0.45
- pingpong
- patrol points inside activation
- no target → patrol
- valid target → patrol stops / attacks
- target invalid → patrol resumes
- cutter-fire absent

### Geometry

- P1 OUT
- H2/H3/H4 IN
- R0/P2 OUT
- Safe max 307.8px
- Flow max 340.2px
- active mandatory max 272.5px
- all links <400px
- R0 visible
- R0→H4 <400px
- exact audited coordinate overlap 0
- no instant-death sky

### Gameplay

- Patrol exactly 1
- all Patrol positions clearable
- mandatory wait 0
- Kill optional
- no Scanner
- no Wind
- no Cutter
- no Cover dependency
- no Foundation lock

### Story

- Beacon approach active
- no final denial
- no Final Security identity
- Containment Lattice preview only

### Production

- Runtime implementation HOLD
- Approved Art HOLD
- physical PASS not claimed before graybox

---

## 25. FAIL Conditions

### Patrol

- D1 moves while actively targeting
- player must wait for one endpoint
- endpoint-only clear solution
- second Patrol
- Patrol path clamped into unintended line because activation too small
- `cutter-fire` accidentally present

### Geometry

- active mandatory 380~400px
- R0 inside activation
- R0 invisible
- one hit sends Player unrecoverably below frame
- Beacon mast accidentally creates dominant cover solution
- prior Stage coordinate reuse

### Gameplay

- Scanner added
- Wind added
- Cutter added
- Kill Gate
- moving platform
- new Patrol AI behavior

### Story

- `ACCESS DENIED`
- boarding access state
- Final Security reveal

### Product

- Sector06 Runtime early implementation
- Approved Art before Camera/IDs
- distance math treated as Physics PASS

---

## 26. 개발자 / 기획자 최종 전달 요약

### Stage

```text
SECTOR 06-6
BEACON SPAN
```

### Core

```text
DIAGONAL PATROL
→
ENTER
→
PATROL FREEZES
→
BODY-ARC CLEAR
```

### Patrol

```text
D1

(+384,-432)
↔
(-96,-704)

speed
48

wait
0.45

mode
pingpong
```

### Activation

```text
X -128 ~ +448
Y -768 ~ -320
```

Membership:

```text
P1 OUT
H2 IN
H3 IN
H4 IN
R0 OUT
P2 OUT
```

### Route

```text
SAFE
P0 → H1 → P1 → H2 → H3 → H4 → P2 → H5 → H6 → P4

FLOW
P0 → H1 → P1 → H2 → H3 → H4 → H5 → H6 → P4
```

### Geometry

```text
SAFE MAX
307.8 px

FLOW MAX
340.2 px

ACTIVE MANDATORY MAX
272.5 px

HOOK REACH
400 px
```

### Recovery

```text
R0 (+448,-816)

H3 → R0
276.2 px

R0 → H4
273.4 px
```

### Story

```text
BEACON SPAN
PAD APPROACH SIGNAL ACTIVE
```

Exit:

```text
CONTAINMENT LATTICE
SECURITY ACTIVE
```

### Stage Feeling

> **“Drone은 공격하면서 움직이지 않는다. 그래서 진짜 판단은 전투 중 추적이 아니라 진입 전 발생한다. 대각선으로 순찰하는 Drone이 어디에 있을 때 내가 들어갈지 고르면, 그 위치가 즉시 적의 firing origin이 된다. 그 뒤에는 기다리지 않고 Rope Arc를 바꾸며 지나가야 한다.”**

---

## OPEN QUESTIONS

### 1. Diagonal Patrol Visual Read

현재 AI는 arbitrary points를 지원하지만,
Player가 대각 patrol path를 한눈에 읽을 수 있는지는 별도 playtest 필요.

필요하면:

- beacon marker
- light sequence
- subtle patrol trail

등을 사용.

### 2. All-position Test

Runtime Graybox에서 D1을 path:

```text
0 / 25 / 50 / 75 / 100%
```

에 각각 고정하고
Mandatory route clear test.

하나라도 kill/wait 강제가 되면 geometry 수정.

### 3. Initial D1 Position

현재 A endpoint:

```text
(+384,-432)
```

에서 시작.

실제 first-read가 지나치게 어려우면
path midpoint start도 후보.

단 AI rule 변경 아님.

### 4. Activation Bound

현재 Patrol endpoints 모두 내부.

Runtime authoring 시 point clamp 결과가
원 좌표와 정확히 같은지 테스트.

### 5. R0

현재:

```text
(+448,-816)
```

Activation 바로 아래.

재진입 중 stray projectile 체감이 과하면
R0를 16~32px 더 아래/오른쪽으로 이동.

### 6. H4 → H5 Flow

```text
340.2px
```

Threat exit 이후 Flow-only.

Mobile miss가 높으면 H5를 오른쪽으로 16px 조정.

### 7. 6-7 Handoff

6-7은 Cutter.

P4에서:

- Cutter
- primary Rope line
- lower recovery layer

를 진입 전에 읽게 해야 한다.

### 8. 6-7 Before Authoring

반드시 다시 확인:

- latest GitHub main
- current cutter-fire semantics
- current Rope-cut recovery behavior
- actual 4-2 / 4-8 Cutter geometry
- 5-3 / 5-6 Cutter geometry
- 6-1~6-6 coordinate signatures

후 설계.

---

SECTOR 06-6 / BEACON SPAN — BLOCKOUT CANDIDATE · REV 1.0
