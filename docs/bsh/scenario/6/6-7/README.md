# SECTOR 06-7 — CONTAINMENT LATTICE

*BLOCKOUT CANDIDATE · REV 1.0*

◀ PREV — [SECTOR 06-6 / BEACON SPAN](../6-6/README.md) · NEXT — SECTOR 06-8 / ROOFTOP PAD 03 — NOT YET AUTHORED ▶

`SECTOR 06 ROOFTOP / EVACUATION` · `STAGE 07` · `FINAL CUTTER MASTERY RECALL` · `OPEN-SKY CUT → LOWER CATWALK RECOVERY`

| 항목 | 기준 |
|---|---|
| Status | HYPOTHESIS — BLOCKOUT CANDIDATE |
| Authoring Snapshot | `4ebe0d4b5c80faaa6bc2c24385c77ffea9d5831a` |
| Sector Master | GitHub MERGED — PR #578 |
| 6-1 / 6-2 | GitHub MERGED — PR #579 |
| 6-3 | GitHub MERGED — PR #580 |
| 6-4 | GitHub MERGED — PR #582 |
| Previous Stage | 6-6 BEACON SPAN REV 1.0 — LOCAL REVIEWED |
| Difficulty | ★★★★ |
| Expected First Playtime | 135–190 sec |
| Expected Skilled Clear | 50–75 sec |
| Enemy | Cutter Sentry T1 ×1 — STATIONARY |
| Cutter Fire | ACTIVE — `cutter-fire` PRESENT |
| Patrol | NONE |
| Wind | NONE |
| Access Scan Field | NONE |
| Standard Sentry | NONE |
| Moving Platform / Train | NONE |
| Cover Puzzle | NONE |
| New Player Input | NONE |
| New Rope Mode | NONE |
| New Growth | NONE |
| Foundation | CURRENT RUNTIME — selected Foundation KEEP |
| First Specialization | CONTENT BLOCKED / NOT REQUIRED |
| Legacy Artifact Layer | REMOVED FROM CURRENT RUNTIME |
| Required Kill | NONE |
| Internal Boss | NONE |
| Primary Spatial Identity | LEFT PREVIEW → RIGHTWARD UPPER CUT-LINE → LOWER RECOVERY CATWALK → LEFT SAFE ISLAND → RIGHT PAD APPROACH |
| Primary Role | Open Sky에서 Rope Cut 시 하부 maintenance layer를 읽고 다시 올라오는 마지막 Cutter mastery |
| Story Role | Pad perimeter의 containment security가 가까워졌음을 확인. 실제 `ACCESS DENIED`는 아직 공개하지 않음 |
| Stage-local Exit | Reach P4 Pad Perimeter Approach Deck → Gate Panel → Physical Crossing |
| Sector06 Runtime | NOT AUTHORED / NOT CONNECTED |
| Approved Gameplay Art | HOLD until Runtime Area / Camera Zone / Stable IDs exist |

---

## 0. 기획 기준

### LOCKED FOR THIS STAGE

6-7은:

```text
FIRST CUTTER TUTORIAL
NO
```

다.

Player는 이미:

```text
4-2
FIRST ROPE CUT / REACTIVE RECOVERY

5-3
PRE-PLANNED CUT RECOVERY

5-6
BODY-SHOT ROUTE vs ROPE-CUT ROUTE
```

를 경험했다.

따라서 6-7은
새 Cutter mechanic을 추가하지 않는다.

### Core Question

> **“벽이 없는 Pad perimeter에서 Rope가 끊겨도, 이미 보고 있던 Lower Maintenance Catwalk로 떨어져 침착하게 다시 올라올 수 있는가?”**

### Stage Grammar

```text
SAFE CUTTER PREVIEW
↓
READ UPPER CUT LINE
+
READ LOWER CATWALK
↓
C1
↓
C2
↓
H3
NORMAL UPPER EXIT
or
CUT
↓
R0 LOWER CATWALK
↓
0.60s ROPE DISABLE
↓
E1 RE-ATTACH
↓
P2 FULL SAFE
↓
CLEAN PAD-APPROACH FLOW
↓
ROOFTOP PAD 03 PREVIEW
```

### 금지

- Cutter + Patrol
- Cutter + Wind
- Cutter + Scanner
- second Cutter
- forced scripted Rope Cut
- instant death after Cut
- Kill Gate
- Cover solution
- moving lattice
- moving platform
- New Input
- New Rope Mode
- New Growth
- 5-6식 Route Choice fork
- 4-8식 Wake + Cutter + Patrol finale
- `ACCESS DENIED`
- Final Security activation
- Shuttle boarding

---

## 0-1. 최신 GitHub / Runtime 교차검증

### CURRENT MAIN AT AUTHORING

```text
4ebe0d4b5c80faaa6bc2c24385c77ffea9d5831a
```

현재 GitHub Scenario Source:

```text
Sector05
Master + 5-1~5-8 merged

Sector06
Master + 6-1 + 6-2 + 6-3 + 6-4 merged
```

6-5 / 6-6은 본 Stage 작성 시점
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
Player Hit Knockback        260
Rope Disabled On Cut        0.60 sec
```

### VERIFIED — CUTTER OPT-IN

Current `EnemyObject.js`:

```text
canCutRope
=
rules.includes("cutter-fire")
```

따라서 6-7 S1:

```text
cutter-fire
PRESENT
```

필수.

### Important

Cutter는:

```text
ROPE
```

를 별도로 추적해 조준하지 않는다.

현재 Enemy AI는:

```text
PLAYER POSITION
```

을 track / lock.

Rope Cut은 Projectile trajectory가
현재 Rope segment와 실제로 교차할 때 발생.

---

## 0-2. Rope Cut의 현재 결과

### Rope Cut

Current design/runtime contract:

```text
Rope Detach
+
Swing Drag Clear
+
Launcher Clear
+
Rope Disabled
0.60 sec
```

### Reconnect

```text
0.60 sec
```

이 끝난다고 즉시 붙는 것이 아니다.

그 뒤:

```text
Hook Launch
→
Hook Flight
→
Surface Hit
```

가 필요.

### Body Damage

Rope collision이 성립한 Cut event를:

```text
Body Hit 20
+
Rope Cut
```

의 동시 패널티로 설계하지 않는다.

Projectile이 Rope를 놓치고 Body를 맞히면
일반 Body Hit은 여전히 가능.

### 6-7 Design Consequence

Recovery는:

```text
0.60 sec를 공중에서 버티는 것
```

이 아니라:

```text
stable catwalk에 먼저 landing
→ disable 종료
→ re-attach
```

를 목표로 한다.

---

## 0-3. Cutter Presentation — CURRENT CORRECTION

과거 Scenario 메모 중:

```text
Cutter-specific visual distinction
PENDING
```

만으로 분류된 내용은 현재 Runtime 기준으로 오래됐다.

### VERIFIED CURRENT PRESENTATION

현재 `EnemyTelegraphPresentation.js`는:

```text
isCutter
=
rules includes cutter-fire
```

로 Cutter를 구분.

Track / Lock Aim Line:

```text
Standard
dark red → red

Cutter
dark orange → bright orange
```

로 분리.

Sensor 색도 Cutter 전용 orange family가 존재.

### VERIFIED — CUTTER PROJECTILE RENDERER

Sprite Runtime에는:

```text
SpriteCutterProjectileRenderer
```

가 있고:

- orange projectile palette
- orange tail
- 별도 cutter projectile collection

을 지원.

### Current Production Classification

```text
CUTTER GAMEPLAY DISTINCTION
IMPLEMENTED

FINAL ART / AUDIO / POLISH
NOT LOCKED

BROWSER PLAYTEST READABILITY
STILL REQUIRED
```

따라서 6-7은
“Cutter를 구분할 수 있는 표현이 전혀 없다”고 가정하지 않는다.

---

## 0-4. Multiplayer / Prediction Note

Current owner-predicted Rope Cut은:

```text
releasePlayerRope(
  transferAngularMomentum:true
)
```

를 사용하고
Rope disabled state를 즉시 예측한다.

현재 owner prediction tests에는:

- predicted rope cut immediate detach
- accepted impact receipt 후 stale snapshot이 Rope를 되살리지 않음
- authority resolve event로 pending impact settle

검증이 존재.

### Still Re-verify in Final Graybox

6-7 production playtest 전:

```text
post-cut velocity
angular velocity
rope attached state
launcher state
0.60 disable state
```

의 owner / authority 체감을
실제 multiplayer session에서 다시 확인.

Scenario Geometry는
네트워크 차이를 해결하는 장치로 사용하지 않는다.

---

## 0-5. Cutter Precedent Audit

### 4-2 CUTTER LINE — ACTUAL RUNTIME

현재 standalone Runtime:

```text
Cutter
(92,-501)

Activation
(-96,-880,352×640)

Grapple
C1(32,-448)
C2(-32,-621)

Recovery
R1(-288,-600)
P2(-224,-824)
```

Role:

```text
FIRST CUTTER TUTORIAL
```

### 4-8 TRANSIT CONTROL TRUNK — ACTUAL RUNTIME

```text
Cutter
+
long vertical Wake
+
later Patrol
```

Role:

```text
Sector04 full synthesis
```

### 5-3 SECURITY REVIEW FLOOR

```text
S1(+448,-640)
→
H3(+96,-736)
→
R1(-256,-832)

COLLINEAR
```

Role:

```text
SEE RECOVERY
BEFORE COMMIT
```

즉 Cutter–Anchor–Recovery 자체가 직선.

### 5-6 INCIDENT COMMAND ANNEX

```text
LEFT BODY-SHOT ROUTE
vs
RIGHT ROPE-CUT ROUTE
```

Role:

```text
FAILURE-COST ROUTE CHOICE
```

### 6-7 — SELECTED DIFFERENCE

6-7은:

```text
S1
→
C2
→
H3

COLLINEAR
```

이다.

하지만 H3는:

```text
NORMAL PROGRESSION ANCHOR
```

이고 Recovery는:

```text
SEPARATE LOWER R0 CATWALK
```

다.

즉:

```text
5-3
CUT LINE ITSELF POINTS TOWARD RECOVERY

6-7
CUT LINE IS THE NORMAL UPPER ROUTE
RECOVERY SITS BELOW IT
```

라는 차이를 만든다.

---

## 1. 한 줄 정의

6-6 Beacon Span의 대각 Patrol을 통과한 Player가 Pad perimeter 직전의 열린 Containment Lattice 왼쪽 Entry에 진입해, P1 Safe Preview에서 오른쪽 Cutter Sentry S1, C1–C2–H3 Upper Lattice chain, 그 아래 R0 Maintenance Catwalk와 E1 Emergency Hardpoint를 동시에 읽은 뒤, C1→C2에 진입하고 `S1(+560,-448) → C2(+304,-576) → H3(+48,-704)`가 정확히 한 직선을 이루는 정상 진행 Rope line을 따라 H3로 이동하면서 Cutter shot이 Rope segment를 가를 수 있는 명확한 위험을 처리하고, Telegraph를 읽어 Release/Arc 변경으로 Cut을 피하면 H3→P2 Full Safe Island로 바로 빠져나가되 Cut이 발생하면 Open Sky 아래 R0 Catwalk에 안정적으로 착지해 0.60초 Rope Disable을 버틴 뒤 E1로 Hook을 다시 발사해 P2로 복귀하며, 마지막 H4–H5 chain을 통해 Pad Perimeter Approach Deck에 도달해 6-8 Rooftop Pad 03의 순수 이동 Climax 직전까지 Security pressure를 완전히 정리하는 Final Cutter Mastery Stage.

---

## 2. 전체 게임에서의 역할

### 2-1. Last Enemy Mastery Before Arrival

Sector06:

```text
6-2 Wind
6-3 Standard Sentry
6-5 Scanner
6-6 Patrol
6-7 Cutter
```

를 하나씩 회수.

### 2-2. 6-8 Protect

6-8은:

```text
ENEMY-FREE MOVEMENT CLIMAX
```

이다.

따라서 6-7에서
마지막 적 압박을 끝낸다.

### 2-3. Open Sky Failure Literacy

실내에서는:

```text
wall / floor
```

가 자연스럽게 recovery가 됐다.

6-7에서는 Player가:

```text
LOWER MAINTENANCE LAYER
```

를 의식적으로 읽어야 한다.

### 2-4. Cut ≠ Failure State

Cutter hit가:

```text
automatic death
```

가 아니라:

```text
route changes from upper line
to lower recovery layer
```

가 되게 한다.

---

## 3. Story 역할

### S0 — Entry

```text
CONTAINMENT LATTICE

SECURITY
ACTIVE
```

### S1 — P2 Full Safe

```text
PAD PERIMETER

SERVICE ACCESS
AHEAD
```

### S2 — Exit

```text
ROOFTOP PAD 03

APPROACH
AHEAD
```

### Meaning

Player가 새로 아는 것:

```text
Pad 03 perimeter가
바로 다음 progression zone에 있다.
```

### 아직 금지

```text
ACCESS DENIED
CONTAINMENT VIOLATION
PAD LOCK RELEASE
FINAL SECURITY
```

실제 Denial은 6-8에서만.

---

## 4. 공간 콘셉트

### CONTAINMENT LATTICE

Pad perimeter 외곽의
얇은 Structural security frame.

### Visual Language

- exposed upper lattice
- aviation warning nodes
- open sky
- lower maintenance catwalk
- emergency service bracket
- pad approach structure in distance

### Main Shape

```text
LEFT ENTRY
→
RIGHTWARD UPPER CUT LINE
→
LEFT SAFE ISLAND
→
RIGHTWARD PAD APPROACH
```

### Two Vertical Layers

```text
UPPER
normal progression

LOWER
recovery
```

가 한 Camera에 읽혀야 한다.

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
1376 px

Y
0 ~ -1376
```

### Main Sweep

P0:

```text
x -560
```

→ C2:

```text
x +304
```

→ P2:

```text
x -160
```

→ P4:

```text
x +496
```

### Vertical Gain

약:

```text
1264 px
```

### Recovery Separation

Upper H3:

```text
y -704
```

Lower R0:

```text
y -944
```

약:

```text
240 px
```

vertical separation.

---

## 6. 전체 맵 구조

```text
Y = 0

P0 ENTRY
(-560,0)
   \
    H1 (-352,-144)
      \
       P1 (-176,-240)
       SAFE CUTTER / RECOVERY PREVIEW

                           S1 CUTTER
                           (+560,-448)
                              \
                               \
                    C1 (+64,-400)
                          \
                           C2 (+304,-576)
                              \
                               H3 (+48,-704)
                               UPPER NORMAL EXIT
                                  \
                                   P2 (-160,-832)
                                   FULL SAFE ISLAND

                         R0 (+96,-944)
                         LOWER CATWALK
                            \
                             E1 (-128,-1008)
                              \
                               ↗ P2

                                   H4 (-16,-1056)
                                      \
                                       H5 (+240,-1168)
                                         \
                                          P4 (+496,-1264)
                                          PAD APPROACH EXIT

Y = -1376
```

### Critical Cut Line

```text
S1
(+560,-448)

C2
(+304,-576)

H3
(+48,-704)
```

세 점:

```text
EXACTLY COLLINEAR
```

C2는 S1↔H3 segment의 정확한 midpoint.

---

## 7. Zone 구성

### Z0 — Entry

```text
P0 → H1 → P1
```

S1 Activation OUT.

### Z1 — Full Preview

P1에서 동시에 확인:

- S1 Cutter
- C1
- C2
- H3
- R0 lower catwalk
- E1
- P2 safe direction

### Z2 — Cutter Entry

```text
P1 → C1 → C2
```

C1/C2:

```text
S1 Activation IN
```

### Z3-A — No-Cut Upper Exit

```text
C2 → H3 → P2
```

H3까지 Activation IN.

P2:

```text
OUT
```

### Z3-B — Cut Recovery

Cut:

```text
C2 / H3 approach
↓
R0
```

R0:

```text
OUT
```

Landing 후:

```text
0.60 sec disable
↓
E1
↓
P2
```

### Z4 — Full Safe

```text
P2
```

Cutter 신규 acquire 없음.

### Z5 — Final Clean Flow

```text
P2 → H4 → H5 → P4
```

6-8 전 마지막 Enemy-free 연결.

---

## 8. 좌표 / 오브젝트

전부:

```text
HYPOTHESIS — BLOCKOUT
```

### 8-1. Landing / Recovery

| ID | Center | Size | Role |
|---|---:|---:|---|
| P0 | `(-560, 0)` | `320×32` | Entry Deck |
| P1 | `(-176, -240)` | `320×32` | Safe Cutter / Recovery Preview |
| P2 | `(-160, -832)` | `352×32` | Full Safe Perimeter Island |
| R0 | `(+96, -944)` | `320×24` | Lower Maintenance Catwalk |
| P4 | `(+496, -1264)` | `416×32` | Pad Perimeter Approach Exit |

### 8-2. Grapple Landmarks

| ID | Position | Role |
|---|---:|---|
| H1 | `(-352, -144)` | Entry Brace |
| C1 | `(+64, -400)` | Cutter Entry Anchor |
| C2 | `(+304, -576)` | Primary Cut-Line Anchor |
| H3 | `(+48, -704)` | Normal Upper Exit Anchor |
| E1 | `(-128, -1008)` | Emergency Recovery Anchor |
| H4 | `(-16, -1056)` | Clean Exit Re-entry |
| H5 | `(+240, -1168)` | Final Pad Approach Anchor |

### 8-3. Cutter Sentry S1

```text
Position
(+560,-448)

Type
sentry-t1
```

Rules:

```text
cutter-fire
kill-optional
target-lock-cycle
activation-band-only
```

### 8-4. S1 Activation

```text
X
-32 ~ +384

Y
-768 ~ -320
```

Equivalent candidate:

```text
triggerBounds(-32,-768,416,448)
```

### 8-5. Membership

```text
P1 OUT

C1 IN
C2 IN
H3 IN

P2 OUT
R0 OUT
E1 OUT
H4 OUT
P4 OUT
```

### 8-6. Attack Range

S1:

```text
(+560,-448)
```

Distances:

```text
S1 → P1
764.8 px

S1 → C1
498.3 px

S1 → C2
286.2 px

S1 → H3
572.4 px
```

P1은:

```text
> 760 px
+
Activation OUT
```

이라 확실한 Preview.

C1/C2/H3는:

```text
< 760 px
```

로 실제 Threat band.

### 8-7. Stable IDs

```text
sector-06-07:p0
sector-06-07:p1
sector-06-07:p2
sector-06-07:r0
sector-06-07:p4

sector-06-07:hardpoint-h1
sector-06-07:cutter-anchor-c1
sector-06-07:cutter-anchor-c2
sector-06-07:hardpoint-h3
sector-06-07:recovery-e1
sector-06-07:hardpoint-h4
sector-06-07:hardpoint-h5

sector-06-07:cutter-s1
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
→ H3
→ P2
→ H4
→ H5
→ P4
```

### Distance Pre-check

| Link | Distance |
|---|---:|
| P0 → H1 | `253.0 px` |
| H1 → P1 | `200.5 px` |
| P1 → C1 | `288.4 px` |
| C1 → C2 | `297.6 px` |
| C2 → H3 | `286.2 px` |
| H3 → P2 | `244.2 px` |
| P2 → H4 | `266.3 px` |
| H4 → H5 | `279.4 px` |
| H5 → P4 | `273.4 px` |

### Result

```text
MAX SAFE LINK
= 297.6 px

HOOK REACH
= 400 px

MARGIN
= 102.4 px
```

### Active Mandatory Max

```text
C1 → C2
297.6 px
```

Cutter threat와
끝거리 aim을 겹치지 않는다.

---

## 10. Flow Route

### Route

```text
P0
→ H1
→ P1
→ C1
→ C2
→ H3
→ H4
→ H5
→ P4
```

P2 landing 생략.

### Distance Pre-check

| Link | Distance |
|---|---:|
| P0 → H1 | `253.0 px` |
| H1 → P1 | `200.5 px` |
| P1 → C1 | `288.4 px` |
| C1 → C2 | `297.6 px` |
| C2 → H3 | `286.2 px` |
| H3 → H4 | `357.8 px` |
| H4 → H5 | `279.4 px` |
| H5 → P4 | `273.4 px` |

### Result

```text
MAX FLOW LINK
= 357.8 px
```

### Important

```text
H3 → H4
357.8 px
```

는 Cutter band를 벗어나면서 사용하는
Flow-only continuation.

Safe Route는 P2를 경유.

---

## 11. Critical Cutter Geometry

### Exact Line

```text
S1
(+560,-448)

↓

C2
(+304,-576)

↓

H3
(+48,-704)
```

Vector:

```text
S1 → C2
(-256,-128)

C2 → H3
(-256,-128)
```

따라서:

```text
C2
=
exact midpoint
```

### Meaning

Player가 C2에 Rope를 두고
H3 방향으로 Upper Route를 진행할 때
Cutter가 Player를 향해 쏘는 line과
현재 Rope segment가 위험하게 정렬될 수 있다.

### Important

이 Geometry는:

```text
CUT GUARANTEED
```

를 뜻하지 않는다.

실제 Cut은:

- Player body position
- current Rope segment
- projectile timing
- release timing

이 함께 결정.

### Design Goal

```text
Cutter threat legibility
YES

scripted unavoidable Cut
NO
```

---

## 12. Recovery Route

### If Cut

목표:

```text
CUT
→
R0 LAND
→
WAIT DISABLE
→
E1
→
P2
```

### Geometry

```text
R0
(+96,-944)

E1
(-128,-1008)

P2
(-160,-832)
```

Distances:

```text
R0 → E1
233.0 px

E1 → P2
178.9 px
```

### Recovery Target

```text
stable landing after cut
≤ 2 sec target

next successful attach
≤ 3 sec target
```

실제 시간은
Runtime Graybox에서 측정.

### R0 Activation

```text
OUT
```

따라서 Landing 후
새 Cutter acquire 없음.

### R0 Width

```text
320 px
```

후보.

Open Sky final mastery이지만
precision catch로 만들지 않는다.

---

## 13. Recovery Visibility

### P1에서 보여야 할 것

```text
C1
C2
H3
R0
E1
```

### Before Commitment

Player가:

```text
“잘리면 저 아래로 간다”
```

를 미리 이해할 수 있어야 한다.

### Difference from 5-3

5-3:

```text
R1
=
Cut Line 연장선
```

6-7:

```text
R0
=
Cut Line 아래 별도 Layer
```

### Camera

Upper / Lower를
같이 읽히게 해야 함.

---

## 14. Cutter Combat Contract

### S1

```text
STATIONARY
```

### Attack

현재 generic:

```text
ACQUIRE
0.25

TRACK
0.80

LOCK
0.20

FIRE
```

### Rope Cut Capability

```text
cutter-fire
PRESENT
```

### Kill

```text
OPTIONAL
```

### Player Options

1. Telegraph 읽고 Release / Arc 변경.
2. 빠르게 H3로 통과.
3. Shear로 optional damage.
4. Cut을 감수하고 R0 recovery 실행.

### Not an Option Requirement

```text
must kill before crossing
NO
```

---

## 15. Cutter Presentation Contract

### Runtime Existing

Cutter는 현재:

- orange track line
- brighter orange lock line
- orange sensor state
- orange projectile
- projectile tail

을 지원.

### 6-7 Requirement

P1에서:

```text
Standard Sentry와 다른 threat
```

임을 즉시 읽을 수 있어야 함.

### Still Production Check

최종 art / VFX에서:

- background aviation orange light
- Cutter orange telegraph
- projectile tail

이 서로 섞이면 안 됨.

### Visual Priority

```text
Cutter Telegraph
>
Cutter Projectile
>
Grapple Anchor
>
Aviation Decor
```

가 아니라,

Rope aiming 중에는:

```text
Grapple Anchor
+
Cutter Telegraph

둘 다 명확
```

해야 한다.

---

## 16. Foundation Expression

### IMPULSE COIL

C1→C2→H3 exposure를
짧게 압축.

### RELAY LINK

Cut을 피한 경우
빠른 re-attach chain.

Cut 이후 Relay Window가
자동으로 열리는 것으로 가정하지 않는다.

Cutter Cut은:

```text
normal manual Release
```

와 동일한 Foundation event가 아니다.

### SHEAR CURRENT

Cutter가 Rope segment와 교차하는 위치라면
optional offense.

### Mandatory

```text
NO FOUNDATION REQUIRED
```

---

## 17. Story Trigger

### S0 — Entry

```text
CONTAINMENT LATTICE

SECURITY
ACTIVE
```

### S1 — P2

```text
PAD PERIMETER

SERVICE ACCESS
AHEAD
```

### S2 — P4

```text
ROOFTOP PAD 03

APPROACH
AHEAD
```

### No Final Verdict

아직:

```text
ACCESS DENIED
CONTAINMENT VIOLATION
```

없음.

6-8에서 실제 Pad에 도달한 후 발생.

---

## 18. Camera

전부:

```text
HYPOTHESIS
```

### C0 — Preview — PRIMARY

```text
P1
S1
C1
C2
H3
R0
E1
```

가능한 한 함께 표시.

```text
Desktop
0.86

Mobile
0.66
```

### C1 — Upper Cut Line

```text
C1 / C2 / H3 / S1 / R0

Desktop
0.90

Mobile
0.68
```

### C2 — Recovery Layer

```text
H3 / P2 / R0 / E1 / H4

Desktop
0.92

Mobile
0.70
```

### C3 — Pad Approach

```text
P2 / H4 / H5 / P4

Desktop
0.96

Mobile
0.72
```

### Guard

Open Sky scale를 보여주려고
Cutter aim line이나 R0를
너무 작게 만들면 FAIL.

---

## 19. Geometry Repetition Audit

### vs 4-2

4-2:

```text
first tutorial
compact Cutter line
reactive recovery
```

6-7:

```text
late mastery
open sky
upper line + lower catwalk
```

### vs 4-8

4-8:

```text
Cutter
+
Wake
+
Patrol
```

6-7:

```text
Cutter only
```

### vs 5-3

5-3:

```text
Sentry → H3 → R1
collinear recovery line
```

6-7:

```text
Sentry → C2 → H3
collinear NORMAL route

R0 recovery
separate lower layer
```

### vs 5-6

5-6:

```text
Body route vs Cutter route
fork
```

6-7:

```text
single upper route
+
failure recovery layer
```

### vs 6-6

6-6:

```text
moving Patrol preview
→ freeze origin
```

6-7:

```text
fixed Cutter origin
→ Rope-line geometry
```

### Exact Coordinate Audit

최종 자동검사 대상:

- Sector05 5-1~5-8
- Sector06 6-1~6-6
- actual 4-2 Runtime
- actual 4-8 Runtime

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
→ 6-8
```

### Enemy Kill

```text
NOT REQUIRED
```

### P4

6-8의:

```text
PURE MOVEMENT CLIMAX
```

진입 전 Safe Deck.

### Critical Handoff

P4 이후에는
새 Cutter projectile spawn이 없어야 한다.

이미 발사된 projectile의 수명/trajectory는
별도 Runtime behavior이므로
Gate handoff camera / spacing에서 확인.

---

## 21. Pixel Art Asset Spec

### Upper Lattice

- thin but solid structural truss
- pad perimeter warning nodes
- exposed service bracket
- aviation utility light

### Lower Catwalk

R0:

- wider silhouette
- darker maintenance tier
- clear floor edge
- no cyan full-surface cue

### Cutter

현재 runtime orange family와 충돌하지 않는 mount design.

### Grapple

C1/C2/H3/E1:

```text
CYAN
```

clarity 유지.

---

## 22. Background / Parallax

### Far

- Pad03 approach structures
- open sky
- vertical city below

### Mid

- containment mast
- security lattice
- pad lighting frames

### Near

- upper truss
- lower R0 catwalk
- Cutter mount

### Critical

background orange aviation light가
Cutter Lock telegraph로 오인되면 FAIL.

### Recovery Read

R0는
far background로 밀지 않는다.

Gameplay Mid/Near layer로 명확히 유지.

---

## 23. Sound / VFX

### Cutter

Current telegraph family 재사용.

- acquire
- track
- orange lock
- projectile
- rope-cut feedback

### Rope Cut

Cut 발생 시:

```text
brief rope-cut feedback
+
launcher disabled state
```

가 명확.

### R0

Landing 후
과도한 alarm을 줄여
Recovery 판단을 돕는다.

### Exit

P2 이후 combat layer 감소.

6-8의 arrival atmosphere가
들어오기 시작.

---

## 24. PASS Criteria

### Runtime Alignment

- current main `4ebe0d4b...`
- cutter-fire positive opt-in
- Rope disable 0.60 sec
- Cut ≠ instant reconnect
- Cutter targets Player, not Rope
- Cutter-specific aim/sensor presentation exists
- Cutter projectile renderer exists
- Relay Window not assumed on Cut

### Geometry

- P1 OUT
- C1/C2/H3 IN
- P2/R0/E1 OUT
- Safe max 297.6px
- Flow max 357.8px
- active mandatory max 297.6px
- all links <400px
- S1→C2→H3 exactly collinear
- R0 separate lower layer
- R0→E1 233.0px
- E1→P2 178.9px
- exact audited coordinate overlap 0
- no instant-death recovery dependency

### Gameplay

- Cutter exactly 1
- no second enemy
- no Wind
- no Scanner
- no Patrol
- no Cover dependency
- Kill optional
- Cut not guaranteed
- Foundation independent
- stable recovery visible before commitment

### Story

- Pad perimeter approach only
- no Access Denied
- no Final Security activation
- 6-8 approach preview

### Production

- Runtime implementation HOLD
- Approved Art HOLD
- multiplayer post-cut feel recheck queued
- physical PASS not claimed before graybox

---

## 25. FAIL Conditions

### Cutter

- `cutter-fire` missing
- scripted guaranteed Cut
- Cutter aims directly at Rope by invented AI
- Cut deals mandatory body damage simultaneously
- 0.60 sec described as instant reconnect
- Relay Window assumed from Cut
- old “no cutter presentation exists” claim retained

### Geometry

- R0 not visible from P1
- R0 inside Activation
- recovery requires 380~400px attach
- one Cut sends Player out of Camera
- upper and lower route visually merge
- 5-3 recovery-line clone
- 5-6 two-route fork clone
- exact coordinate reused from prior stage

### Gameplay

- Patrol added
- Wind added
- Scanner added
- Kill Gate
- Foundation requirement
- moving lattice

### Story

- `ACCESS DENIED`
- `CONTAINMENT VIOLATION`
- Final Security identity
- boarding prompt

### Product

- Sector06 Runtime early authoring
- Approved Art before Area / Camera / IDs
- geometry math treated as actual Physics PASS

---

## 26. 개발자 / 기획자 최종 전달 요약

### Stage

```text
SECTOR 06-7
CONTAINMENT LATTICE
```

### Core

```text
UPPER CUT LINE
+
LOWER RECOVERY CATWALK
```

### Cutter

```text
S1
(+560,-448)

cutter-fire
PRESENT
```

Activation:

```text
X -32 ~ +384
Y -768 ~ -320
```

Membership:

```text
P1 OUT

C1 IN
C2 IN
H3 IN

P2 OUT
R0 OUT
E1 OUT
```

### Critical Geometry

```text
S1 (+560,-448)
↓
C2 (+304,-576)
↓
H3 (+48,-704)

EXACT COLLINEAR
```

### Normal Route

```text
P0
→ H1
→ P1
→ C1
→ C2
→ H3
→ P2
→ H4
→ H5
→ P4
```

### Cut Recovery

```text
CUT
→ R0
→ 0.60 sec disable
→ E1
→ P2
```

### Geometry Numbers

```text
SAFE MAX
297.6 px

FLOW MAX
357.8 px

ACTIVE MANDATORY MAX
297.6 px

HOOK REACH
400 px
```

Recovery:

```text
R0 → E1
233.0 px

E1 → P2
178.9 px
```

### Current Presentation Correction

```text
CUTTER-SPECIFIC
AIM LINE / SENSOR / PROJECTILE
IMPLEMENTED

FINAL ART POLISH
NOT LOCKED
```

### Story

```text
CONTAINMENT LATTICE
SECURITY ACTIVE

↓

PAD PERIMETER
SERVICE ACCESS AHEAD

↓

ROOFTOP PAD 03
APPROACH AHEAD
```

### Stage Feeling

> **“이번에는 Rope가 잘렸을 때 처음 보는 Recovery를 찾는 시험이 아니다. P1에서 이미 아래 Catwalk를 본다. 정상적으로는 위 Lattice를 통과하고, 잘리면 아래 Maintenance Layer로 떨어진다. 중요한 것은 Cut을 완벽히 피하는 것이 아니라, Cut이 나도 흐름을 잃지 않고 마지막 Pad 접근선으로 돌아오는 것이다.”**

---

## OPEN QUESTIONS

### 1. Cutter Line Hit Rate

```text
S1 → C2 → H3
```

collinear은 위험을 읽기 쉽게 만들지만
실제 Cut rate를 보장하지 않는다.

Graybox에서:

- slow swing
- fast swing
- early release
- late release
- each Foundation

별로 Cut / Body Hit / Miss 분포 측정.

### 2. S1 Position

현재:

```text
(+560,-448)
```

P1은 760px 밖,
C1/C2/H3는 안.

실제 first shot이 너무 빠르면
Combat stat보다 먼저:

- S1 x
- activation
- C1/C2 line

을 조정.

### 3. R0 Catch Width

현재:

```text
320px
```

final Cutter mastery지만
Open Sky precision landing exam으로 만들지 않음.

Cut 후 실제 trajectory 분산이 크면
R0 width를 먼저 넓히는 것을 허용.

### 4. R0 Vertical Position

현재 H3보다:

```text
240px
```

아래.

0.60s disable 동안
Landing 전에 지나치게 아래로 떨어지는 경우
R0를 위로 조정.

### 5. E1

Recovery-only Hardpoint.

E1이 Normal Flow에서 dominant shortcut이 되면
위치/aim cue를 조정.

### 6. Cutter Presentation

현재 Runtime 구분 표현은 존재.

6-7 제작 전 확인할 것은:

```text
“존재 여부”
```

가 아니라:

```text
Open Sky / aviation orange 환경에서도
실제로 잘 읽히는가
```

이다.

### 7. Multiplayer Cut Parity

현재 prediction persistence test는 존재.

Final production test에서는
same Cut event 직후:

- position
- velocity
- angular velocity
- rope state
- launcher state
- disable timer

를 owner / authority에서 비교.

### 8. 6-8 Handoff

6-8은 Enemy 0.

P4 이후:

```text
Cutter threat
DONE
```

이 명확해야 한다.

6-8 첫 Camera에서:
- Pad03
- Shuttle
- first final-movement anchor

가 읽혀야 한다.

### 9. 6-8 Before Authoring

반드시 다시 확인:

- latest GitHub main
- 6-1~6-7 geometry signatures
- historical ending skeleton
- Pad03 / Shuttle story contract
- Gate / final content-boundary rules
- Boss timer handoff product contract
- final movement repetition against 1-8~5-8

후 48번째 일반 Stage를 작성.

---

SECTOR 06-7 / CONTAINMENT LATTICE — BLOCKOUT CANDIDATE · REV 1.0
