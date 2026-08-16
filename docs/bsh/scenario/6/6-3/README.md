# SECTOR 06-3 — PERIMETER SIGNAL DECK

*BLOCKOUT CANDIDATE · REV 1.0*

◀ PREV — [SECTOR 06-2 / CROSSWIND MASTS](../6-2/README.md) · NEXT — [SECTOR 06-4 / ROOFTOP SERVICE SHELTER](../6-4/README.md) ▶

`SECTOR 06 ROOFTOP / EVACUATION` · `STAGE 03` · `STANDARD SENTRY MASTERY RECALL` · `OPEN-SKY BODY-ARC CONTROL`

| 항목 | 기준 |
|---|---|
| Status | HYPOTHESIS — BLOCKOUT CANDIDATE |
| Authoring Snapshot | `04e1b7272c9baa8b71a6d516556e1e60895a2985` |
| Sector Master | GitHub MERGED — PR #578 |
| Previous Stage | 6-2 CROSSWIND MASTS REV 1.0 — GitHub MERGED / PR #579 |
| Difficulty | ★★★☆ |
| Expected First Playtime | 120–170 sec |
| Expected Skilled Clear | 45–70 sec |
| Enemy | Standard Sentry T1 ×1 |
| Rope Cut | NONE — `cutter-fire` ABSENT |
| Cover LOS | NONE — `cover-ends-los` ABSENT |
| Cover Surfaces | NONE |
| Wind | NONE |
| Access Scan Field | NONE |
| Cutter | NONE |
| Patrol | NONE |
| Moving Platform / Train | NONE |
| New Player Input | NONE |
| New Rope Mode | NONE |
| New Growth | NONE |
| Foundation | CURRENT RUNTIME — selected Foundation KEEP |
| First Specialization | CONTENT BLOCKED / NOT REQUIRED |
| Legacy Artifact Layer | REMOVED FROM CURRENT RUNTIME |
| Required Kill | NONE |
| Internal Boss | NONE |
| Primary Spatial Identity | LEFT SAFE PREVIEW → OPEN FIRING ARC → RIGHT RECOVERY → LEFTWARD SIGNAL EXIT |
| Primary Role | 1-3의 첫 Sentry 학습을 Cover 없이 Open Sky body-path mastery로 재시험 |
| Story Role | Pad perimeter까지 Security가 살아 있음을 확인. 새 정책 정보 없음 |
| Stage-local Exit | Reach P4 Signal Exit Deck → Gate Panel → Physical Crossing |
| Sector06 Runtime | NOT AUTHORED / NOT CONNECTED |
| Approved Gameplay Art | HOLD until Runtime Area / Camera Zone / Stable IDs exist |

---

## 0. 기획 기준

### LOCKED FOR THIS STAGE

6-3은:

```text
FIRST SENTRY TUTORIAL
NO
```

다.

Player는 이미 1-3에서:

- Enemy acquire / track / lock telegraph
- projectile body hit
- Rope 이동 중 사격 회피
- Safe Cover / LOS break

를 경험했다.

Sector06에서 같은 Sentry를 다시 쓸 때
1-3의 Cover puzzle을 반복하지 않는다.

### Core Question

> **“엄폐물이 없는 Open Sky에서, Sentry가 조준한 위치에 계속 있지 않도록 Rope Arc 자체를 바꿔 탄을 피할 수 있는가?”**

### Stage Grammar

```text
SAFE SENTRY PREVIEW
↓
OPEN-SKY FIRING BAND
↓
RIGHTWARD ARC
↓
VISIBLE LOWER RECOVERY
↓
FULL SAFE SIGNAL ISLAND
↓
LEFTWARD CLEAN EXIT
↓
ROOFTOP SERVICE SHELTER
```

### 금지

- `cover-ends-los`
- Cover surface
- Cutter
- Patrol
- Wind
- Scanner
- Moving Platform
- Second Sentry
- Kill Gate
- stationary shooting-room solution
- mandatory cover wait
- New Input
- New Rope Mode
- New Growth
- Pad03 / Shuttle close reveal
- `ACCESS DENIED`

---

## 0-1. 최신 GitHub / Runtime 교차검증

### CURRENT MAIN AT FINAL REVIEW

```text
04e1b7272c9baa8b71a6d516556e1e60895a2985
```

6-3 작성 중 PR #579가 병합되어:

```text
Sector06
6-1 SKYBREAK ACCESS
6-2 CROSSWIND MASTS
```

가 GitHub 정식 Scenario Source로 들어왔다.

PR #579는 문서 범위이며
Combat / Rope Runtime 변경은 없다.

현재 GitHub에는:

```text
Sector05
Master + 5-1~5-8 merged

Sector06
Master + 6-1 + 6-2 merged
```

상태.

Sector06 authored Runtime은 여전히 없다.

### VERIFIED — CURRENT HOOK / ROPE

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
Enemy Attack Range          760
Acquire                     0.25 sec
Track                       0.80 sec
Lock                        0.20 sec
Fire Flash                  0.08 sec
Enemy Fire Interval         1.00 sec
Enemy Projectile Speed      520
Enemy Projectile Radius     7
Enemy Projectile Damage     20
Player Hit Invulnerability  0.45 sec
Player Hit Knockback        260
```

### Current First-shot Read

연속 Target 상태라면:

```text
Acquire
0.25

Track
0.80

Lock
0.20
```

이후 projectile spawn.

즉 첫 탄 전
약:

```text
1.25 sec
```

의 acquire/track/lock sequence가 존재.

정확한 체감은
frame timing / player movement에 따라 playtest.

---

## 0-2. Current Enemy Rule Semantics

### Rope Cut

현재 projectile:

```text
canCutRope
=
enemy.rules.includes("cutter-fire")
```

따라서 6-3 Standard Sentry는:

```text
cutter-fire
ABSENT
```

이어야 한다.

`no-rope-cut` tag에 의존하지 않는다.

### Cover LOS

Current `hasLineOfSight()`:

```text
cover-ends-los
ABSENT
→ LOS always true

cover-ends-los
PRESENT
→ kind:"cover" collision surface가
enemy → player segment를 막으면 LOS break
```

### 6-3

```text
cover-ends-los
ABSENT

kind:"cover"
0
```

로 설계.

따라서:

```text
BODY PATH
```

이 해결책.

---

## 0-3. Precedent Audit — 1-3 vs 5-5 vs 6-3

### 1-3 SECURITY CHECK — ACTUAL RUNTIME

현재 1-3은:

```text
Sentry
(+416,-640)

activation
x -480 ~ +480
y -928 ~ -384

rules
standard-projectile
no-rope-cut
cover-ends-los
```

그리고 실제:

```text
safe-cover
upper-cover
```

두 Cover surface가 있다.

Role:

```text
FIRST SENTRY / COVER LEARNING
```

### 5-5 CORPORATE TRANSFER HALL — CURRENT SCENARIO

5-5 Standard Sentry는:

```text
Sparse Hardpoint
+
Body-shot exposure
+
later Patrol separation
```

을 사용.

Role:

```text
THREAT TYPE DISTINCTION
```

### 6-3 — SELECTED DIFFERENCE

```text
ONE SENTRY
ONE ENCOUNTER BAND
NO COVER
NO SECOND ENEMY
NO SPARSE CORPORATE ELIGIBILITY PUZZLE
NO WIND
```

Topology:

```text
OPEN-SKY SIGNAL STRUCTURES
```

### Final Lesson

```text
1-3
hide / break LOS

6-3
keep moving / alter body arc
```

---

## 1. 한 줄 정의

6-2 Crosswind Masts의 왼쪽 Signal Service Exit에서 Perimeter Signal Deck으로 넘어온 Player가, Wind가 완전히 사라진 Safe Preview Shelf P1에서 오른쪽 Signal Pylon의 Standard Sentry 한 대와 H2–H3–H4의 넓은 Open-Sky arc, 그리고 그 아래 R0 Recovery Tray와 오른쪽 바깥 R1 Safe Deck을 한 번에 읽은 뒤, `cutter-fire`와 `cover-ends-los`가 모두 없는 Sentry의 acquire/track/lock을 엄폐로 끊지 않고 Rope swing과 release timing으로 Player body path를 계속 바꿔 H2→H3→H4를 통과하고, R1/P2에서 모든 신규 acquire가 끝난 상태로 안정된 다음 H5를 통해 다시 왼쪽 Signal Exit Deck으로 돌아가며, 1-3에서 처음 배운 Sentry를 “Cover 뒤에 숨는 적”이 아니라 “움직임으로 탄을 빗나가게 만드는 정지형 firing origin”으로 최종 재해석하고 6-4 Rooftop Service Shelter의 휴식 구간으로 진입하는 Stage.

---

## 2. 전체 게임에서의 역할

### 2-1. Wind → Combat 전환

6-2:

```text
ENVIRONMENT FORCE
```

6-3:

```text
BODY-SHOT SECURITY
```

시스템을 하나씩 분리해 회수.

### 2-2. No Cover Crutch

이번에는:

```text
WAIT BEHIND COVER
```

가 없다.

### 2-3. Open Sky Combat

Combat 공간 자체가:

```text
room
NO

catwalk bunker
NO

structural islands
YES
```

### 2-4. 6-4 대비

6-3 직후 6-4는:

```text
REST
+
PAD / SHUTTLE DIRECT VISUAL CONFIRMATION
```

이므로
6-3 Exit은 Enemy pressure를 완전히 끝내고
감정적으로 내려놓을 수 있어야 한다.

---

## 3. Story 역할

### Entry

```text
PERIMETER SIGNAL DECK

SECURITY
ACTIVE
```

### Mid

Story 없음.

Combat readability 우선.

### Exit

```text
ROOFTOP SERVICE SHELTER

ACCESS
AHEAD
```

### 이번 Stage에서 금지

- Pad03 close visual confirmation
- Shuttle close visual confirmation
- Shuttle STANDBY status full display
- Access Denied
- Containment Violation final denial
- Incident Continuity Control exposition
- Lower evacuation exposition

### Meaning

Player는 단순히:

```text
Pad 방향 Rooftop perimeter에도
Security가 여전히 활성 상태다.
```

까지만 확인.

---

## 4. 공간 콘셉트

### PERIMETER SIGNAL DECK

옥상 Crown 외곽의:

- aviation signal pylon
- beacon service arm
- perimeter lighting truss
- maintenance signal deck

으로 이루어진 열린 통로.

### Main Shape

```text
LEFT ENTRY
↓
RIGHTWARD FIRING ARC
↓
RIGHT SAFE ISLAND
↓
LEFTWARD CLEAN EXIT
```

### Stage Feeling

> **“숨을 벽이 없다. 대신 계속 움직일 공간이 있다.”**

### Important

Open Sky라고
모든 표면을 얇은 선으로 만들지 않는다.

Landing / Recovery는
명확한 platform silhouette 유지.

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
1184 px

Y
0 ~ -1184
```

### Horizontal Sweep

P0:

```text
x -608
```

에서 R1:

```text
x +512
```

까지 오른쪽으로 크게 이동.

이후 P4:

```text
x -160
```

으로 일부 복귀.

### Visual Difference

6-2는 전체적으로:

```text
RIGHT → LEFT
```

였다.

6-3은:

```text
LEFT → FAR RIGHT → LEFT-CENTER
```

로 반전.

---

## 6. 전체 맵 구조

```text
Y = 0

P0 ENTRY
(-608,0)
    \
     H1 (-416,-160)
       \
        P1 (-384,-288)
        SAFE SENTRY PREVIEW

            H2 (-192,-416)
               \
                H3 (+64,-544)

                              S1 STANDARD SENTRY
                              (+416,-560)

                    \
                     H4 (+320,-672)

                 R0 (+96,-800)
                 LOWER RECOVERY

                                  R1 (+512,-800)
                                  SAFE OUTSIDE BAND
                                     \
                                      P2 (+384,-896)
                                       \
                                        H5 (+128,-992)
                                          \
                                           P4 (-160,-1088)
                                           SIGNAL EXIT

Y = -1184
```

### Shape Signature

```text
LEFT
→ CENTER
→ RIGHT
→ FAR RIGHT
→ LEFT-CENTER
```

---

## 7. Zone 구성

### Z0 — Safe Preview

```text
P0 → H1 → P1
```

S1 activation OUT.

P1에서 반드시:

- S1
- H2
- H3
- H4
- R0 lower recovery
- R1 right recovery direction

을 읽을 수 있어야 한다.

### Z1 — Open Firing Arc

```text
P1 → H2 → H3 → H4
```

H2/H3/H4:

```text
S1 activation IN
```

### Z2 — Recovery Split

성공:

```text
H4 → R1
```

Miss / knockback:

```text
H2/H3/H4
↓
R0
```

R0/R1 모두:

```text
activation OUT
```

### Z3 — Full Safe Signal Island

```text
R1 → P2
```

new acquire 없음.

이미 발사된 projectile은
자동 삭제된다고 가정하지 않는다.

### Z4 — Clean Exit

```text
P2 → H5 → P4
```

Enemy activation 없음.

6-4 Rest로 전달.

---

## 8. 좌표 / 오브젝트

모두:

```text
HYPOTHESIS — BLOCKOUT
```

### 8-1. Landing / Recovery

| ID | Center | Size | Role |
|---|---:|---:|---|
| P0 | `(-608, 0)` | `320×32` | Entry Signal Deck |
| P1 | `(-384, -288)` | `320×32` | Safe Sentry Preview |
| R0 | `(+96, -800)` | `224×20` | Lower Recovery Tray |
| R1 | `(+512, -800)` | `240×24` | Right Safe Recovery |
| P2 | `(+384, -896)` | `320×32` | Full Safe Signal Island |
| P4 | `(-160, -1088)` | `384×32` | Final Signal Exit Deck |

### 8-2. Grapple Landmarks

| ID | Position | Form | Role |
|---|---:|---|---|
| H1 | `(-416, -160)` | perimeter brace | Entry approach |
| H2 | `(-192, -416)` | signal boom joint | Firing band entry |
| H3 | `(+64, -544)` | beacon truss node | Arc change |
| H4 | `(+320, -672)` | pylon service bracket | Firing band exit |
| H5 | `(+128, -992)` | shelter-route bracket | Clean exit |

### 8-3. Standard Sentry S1

```text
Position
(+416,-560)

Type
sentry-t1
```

Runtime-relevant rule contract:

```text
cutter-fire
ABSENT

cover-ends-los
ABSENT
```

Candidate descriptive rules:

```text
standard-projectile
```

Activation은 object property로 별도 정의.

### 8-4. S1 Activation

```text
X
-256 ~ +384

Y
-736 ~ -352
```

Equivalent candidate:

```text
triggerBounds(-256,-736,640,384)
```

### 8-5. Membership

```text
P1 OUT

H2 IN
H3 IN
H4 IN

R0 OUT
R1 OUT
P2 OUT
H5 OUT
P4 OUT
```

### 8-6. Attack Range Pre-check

S1:

```text
(+416,-560)
```

거리:

```text
S1 → H2
624.8 px

S1 → H3
352.4 px

S1 → H4
147.5 px
```

모두:

```text
< 760 px
```

따라서 Activation에 들어오면
현재 Attack Range 안.

P1:

```text
845.0 px
```

로 Range 밖이면서 Activation도 OUT.

### 8-7. Stable ID 후보

```text
sector-06-03:p0
sector-06-03:p1
sector-06-03:r0
sector-06-03:r1
sector-06-03:p2
sector-06-03:p4

sector-06-03:hardpoint-h1
sector-06-03:hardpoint-h2
sector-06-03:hardpoint-h3
sector-06-03:hardpoint-h4
sector-06-03:hardpoint-h5

sector-06-03:sentry-s1
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
→ R1
→ P2
→ H5
→ P4
```

### Distance Pre-check

| Link | Distance |
|---|---:|
| P0 → H1 | `249.9 px` |
| H1 → P1 | `131.9 px` |
| P1 → H2 | `230.8 px` |
| H2 → H3 | `286.2 px` |
| H3 → H4 | `286.2 px` |
| H4 → R1 | `230.8 px` |
| R1 → P2 | `160.0 px` |
| P2 → H5 | `273.4 px` |
| H5 → P4 | `303.6 px` |

### Result

```text
MAX SAFE LINK
= 303.6 px

HOOK REACH
= 400 px

MARGIN
= 96.4 px
```

### Active-band Mandatory Max

```text
H2 → H3
286.2 px

H3 → H4
286.2 px
```

### Intent

Sentry와 400px aim precision을
동시에 시험하지 않는다.

---

## 10. Flow Route

### Route

```text
P0
→ H1
→ H2
→ H3
→ H4
→ P2
→ H5
→ P4
```

P1/R1 landing 생략.

### Distance Pre-check

| Link | Distance |
|---|---:|
| P0 → H1 | `249.9 px` |
| H1 → H2 | `340.2 px` |
| H2 → H3 | `286.2 px` |
| H3 → H4 | `286.2 px` |
| H4 → P2 | `233.0 px` |
| P2 → H5 | `273.4 px` |
| H5 → P4 | `303.6 px` |

### Result

```text
MAX FLOW LINK
= 340.2 px
```

### Flow Meaning

숙련 Player는:

```text
P1 landing
R1 landing
```

을 줄이고
Sentry telegraph 사이에서
body position을 계속 이동.

---

## 11. Recovery Route

### R0

```text
(+96,-800)
```

Open Firing Arc 아래.

### Example

```text
H3 miss
→ R0
→ H4
```

Distances:

```text
H3 → R0
258.0 px

R0 → H4
258.0 px
```

또는:

```text
R0 → P2
303.6 px
```

로 Full Safe Island 직행 가능.

### Important

R0는:

```text
activation OUT
```

이라 recovery 중 신규 acquire 없음.

### R1

성공 route의
명확한 Band Exit.

---

## 12. Standard Sentry Combat Contract

### S1

```text
stationary
```

Patrol 없음.

### Acquire

Player가 Activation 안에 있을 때
현재 range / target 조건으로 acquire.

### Attack Sequence

```text
IDLE
→ ACQUIRE
→ TRACK
→ LOCK
→ PROJECTILE
→ FIRE
→ COOLDOWN
```

### Track

Track 중:

```text
aim updates
```

### Lock

Lock 진입 후 마지막 aim direction으로
projectile이 생성됨.

### Gameplay Meaning

Player가:

```text
한 지점에 오래 머무르면
맞기 쉬움
```

반대로:

```text
Swing Arc
Release
Re-Attach
```

로 body path를 계속 바꾸면
탄을 비껴가게 만들 수 있음.

---

## 13. Cover Policy

### Cover Surfaces

```text
0
```

### Rule

```text
cover-ends-los
ABSENT
```

### Why

1-3의 핵심 학습은:

```text
Cover로 LOS break 가능
```

이었다.

6-3의 핵심은:

```text
Open Sky movement 자체가 defense
```

이다.

### Forbidden

신호 Mast base나 decorative housing을
`kind:"cover"`로 authoring해
우연히 LOS를 끊지 않는다.

### Solid Geometry

필요한 solid structure가 있더라도
`kind:"cover"`가 아니면
현재 `cover-ends-los` 로직의 Cover 차단으로 사용되지 않는다.

하지만 6-3에서는
가급적 firing band 시야 자체를 깨끗하게 유지.

---

## 14. Projectile / Rope Contract

### Standard Projectile

```text
cutter-fire
ABSENT
```

따라서:

```text
Rope Cut
NONE
```

### Body Hit

현재 Standard projectile의 위험은:

```text
20 damage
+
player knockback
```

### Rope Strategy

Player가 Rope를 유지하며
body trajectory를 바꾸는 것이 핵심.

### Important

Projectile가 Activation 밖으로 나간 순간
자동 삭제된다고 가정하지 않는다.

R1/P2에서도
이미 날아온 탄은 계속 시각적으로 읽는다.

---

## 15. Foundation Expression

### IMPULSE COIL

```text
Band exposure compression
```

H2→H3→H4 통과 시간을 줄임.

### RELAY LINK

```text
rapid body-path redirection
```

H2/H3/H4 re-attach chain에서 이득.

### SHEAR CURRENT

Rope segment가 S1을 교차할 경우
optional offense 가능.

### Kill

```text
OPTIONAL
```

### Mandatory

```text
NO FOUNDATION REQUIRED
```

### Build Philosophy

6-3은:

```text
build expression
YES

build gate
NO
```

---

## 16. Story Trigger

### S0 — Entry

```text
PERIMETER SIGNAL DECK

SECURITY
ACTIVE
```

### S1 — P2

Optional:

```text
PERIMETER SIGNAL
ROUTE CLEAR
```

정도의 상태.

### S2 — Exit

```text
ROOFTOP SERVICE SHELTER

ACCESS
AHEAD
```

### No Story Dump

Combat 중
Sector05 WHO/WHY를 다시 띄우지 않는다.

---

## 17. Camera

모두:

```text
HYPOTHESIS
```

### C0 — Entry / Preview

```text
P0 / H1 / P1

Desktop
0.98

Mobile
0.72
```

### C1 — Sentry Full Read

가장 중요.

```text
P1
H2
H3
H4
S1
R0
```

를 한 Frame에 최대한 포함.

```text
Desktop
0.88

Mobile
0.68
```

### C2 — Band Exit

```text
H3
H4
R0
R1
P2

Desktop
0.90

Mobile
0.68
```

### C3 — Safe Return

```text
R1 / P2 / H5 / P4

Desktop
0.94

Mobile
0.70
```

### Guard

Sentry를 보기 위해
Player를 48px readability 이하로 축소하는
과도한 Zoom-out 금지.

---

## 18. Gate Contract

Stage-local:

```text
Reach P4
→ Gate Panel
→ Gate Open
→ Physical Crossing
→ 6-4
```

### Enemy Kill

```text
NOT REQUIRED
```

S1이 살아 있어도
P4 도달 / Panel 진행 가능.

### Runtime

Sector06:

```text
NOT AUTHORED
```

### Important

6-4는 REST이므로
P4와 6-4 Entry 사이에
새 enemy activation을 끼우지 않는다.

---

## 19. Geometry Repetition Audit

### vs 1-3

1-3:

```text
vertical-ish security check
+
Cover LOS
+
safe ledge
```

6-3:

```text
wide rightward outdoor arc
+
no Cover
+
body-path movement
```

### vs 5-5

5-5:

```text
Sentry band
→ Full Safe Relay
→ Patrol band
```

6-3:

```text
ONE SENTRY BAND ONLY
→ clean exit
```

### vs 6-1

6-1:

```text
RIGHT → FAR LEFT → RIGHT
neutral V traverse
```

6-3:

```text
LEFT → FAR RIGHT → LEFT-CENTER
combat arc
```

### vs 6-2

6-2:

```text
RIGHT → LEFT
continuous crosswind
```

6-3:

```text
LEFT → RIGHT
no environmental force
```

### Exact Coordinate Audit

최종 자동검사 대상:

- Sector05 5-1~5-8
- 6-1
- 6-2
- actual 1-3
- current 5-5 scenario

목표:

```text
EXACT MAJOR-POINT OVERLAP
0
```

---

## 20. Pixel Art Asset Spec

### Signal Deck

- narrow perimeter structural frame
- aviation lights
- beacon housing
- antenna service arm
- open sky
- distant city

### S1 Standard Sentry

Cutter와 혼동되지 않게:

```text
standard security color / silhouette
```

사용.

Cutter 전용 orange rope-cut telegraph를 쓰지 않는다.

### Grapple

Cyan landmarks clear.

### Recovery

R0/R1 platform edge는
sky background와 명확히 분리.

---

## 21. Background / Parallax

### Far

- open sky
- lower city
- distant tower crowns

### Mid

- signal masts
- beacon arrays
- non-colliding antenna

### Near

- deck edge
- service arm
- Sentry mount

### Critical

background antenna / wire가
grapple target처럼 보이면 FAIL.

### Combat Readability

Projectile path보다
background navigation light가 더 밝으면 FAIL.

---

## 22. Sound / VFX

### Entry

6-2 Crosswind sound 감소.

### Sentry

- acquire cue
- track / lock visual
- projectile fire

현재 family 사용.

### No Cutter Audio

Rope-cut-specific cue 금지.

### Exit

S1 sound가 멀어지고
6-4 Service Shelter의 quieter mechanical ambience가 들어오기 시작.

---

## 23. Multiplayer Contract

### S1

shared one Sentry.

### Target Selection

현재:

```text
eligible activation players
중 nearest valid target
```

기반.

### Player Separation

Player A가 Band 안,
Player B가 P1/R1 밖이면:

- A는 Target 후보
- B는 Activation 밖

### Projectile

한 Player를 향해 발사된 projectile가
다른 Player body와 충돌하는 실제 Multiplayer 결과는
Runtime playtest 대상으로 유지.

### R0/R1/P2

new acquire 없음.

### Gate

```text
shared open
individual physical crossing
```

원칙.

---

## 24. PASS Criteria

### Runtime Alignment

- current main `04e1b727...`
- Sentry Attack Range 760
- `cutter-fire` absent
- `cover-ends-los` absent
- Cover surfaces 0
- Activation bounds used
- projectile persists independently of activation exit assumption

### Geometry

- P1 OUT
- H2 IN
- H3 IN
- H4 IN
- R0 OUT
- R1 OUT
- P2 OUT
- Safe max 303.6px
- Flow max 340.2px
- active mandatory max 286.2px
- all links <400px
- S1→H2/H3/H4 all <760px
- R0 visible as lower recovery
- no instant-death sky dependency

### Gameplay

- Standard Sentry exactly 1
- no second enemy
- no Wind
- no Scanner
- no Cutter
- no Cover solution
- Kill optional
- Foundation independent
- movement is primary defense

### Story

- Security active 확인
- Pad03 direct close reveal 없음
- Access Denied 없음
- no new conspiracy
- 6-4 Shelter preview

### Production

- Runtime implementation HOLD
- Approved Art HOLD
- no physics PASS claim before graybox

---

## 25. FAIL Conditions

### Combat

- `cover-ends-los` 추가
- Cutter rule 추가
- second Sentry 추가
- mandatory kill
- stationary safe spot에서 Sentry를 쏘기만 하면 끝
- activation 밖 P1에서 acquire
- R0/R1에서 new acquire
- body-shot stage가 Rope-cut stage처럼 보임

### Geometry

- active mandatory 380~400px
- R0가 commitment 전에 전혀 안 보임
- knockback 하나로 unrecoverable sky
- giant cover mast로 LOS가 실질적으로 사라짐
- 5-5처럼 second threat band 추가
- 1-3 Cover room silhouette 반복

### Story

- Shuttle close reveal
- Pad03 final route reveal
- Access Denied
- Sector05 exposition repeat

### Product

- Sector06 Runtime 조기 구현
- Approved Art 조기 생성
- distance math를 physical PASS로 간주

---

## 26. 개발자 / 기획자 최종 전달 요약

### Stage

```text
SECTOR 06-3
PERIMETER SIGNAL DECK
```

### Core

```text
STANDARD SENTRY
+
OPEN SKY
+
NO COVER
```

### Sentry

```text
S1
(+416,-560)

cutter-fire
ABSENT

cover-ends-los
ABSENT
```

### Activation

```text
X -256 ~ +384
Y -736 ~ -352
```

Membership:

```text
P1 OUT

H2 IN
H3 IN
H4 IN

R0 OUT
R1 OUT
P2 OUT
```

### Route

```text
SAFE
P0 → H1 → P1 → H2 → H3 → H4 → R1 → P2 → H5 → P4

FLOW
P0 → H1 → H2 → H3 → H4 → P2 → H5 → P4
```

### Geometry

```text
SAFE MAX
303.6 px

FLOW MAX
340.2 px

ACTIVE MANDATORY MAX
286.2 px

HOOK REACH
400 px
```

### Recovery

```text
R0
lower service tray
activation OUT

R1
right safe recovery
activation OUT
```

### Story

```text
PERIMETER SIGNAL DECK
SECURITY ACTIVE
```

Exit:

```text
ROOFTOP SERVICE SHELTER
ACCESS AHEAD
```

### Stage Feeling

> **“1-3에서는 총알이 오면 Cover 뒤로 숨을 수 있었다. 여기에는 벽이 없다. 대신 하늘이 있고 Rope가 있다. 조준이 끝날 때 내가 그 자리에 없도록 Swing Arc를 계속 바꾸는 것이 이번 Stage의 방어다.”**

---

## OPEN QUESTIONS

### 1. S1 Position

현재:

```text
(+416,-560)
```

H2/H3/H4 모두 760px range 안.

실제 projectile hit rate가 너무 높으면
공격 stat보다 먼저:

- S1 32~64px outward
- Activation width
- H3/H4 arc

를 조정.

### 2. Activation Y

현재:

```text
-736 ~ -352
```

R0(-800)가 확실히 OUT.

Knockback 후 R0 landing 시
즉시 재acquire되지 않는 것이 목적.

### 3. R0 Intentional Bypass

R0를 일부러 타면:

```text
H3 → R0 → P2
```

로 H4 exposure 일부를 줄일 수 있음.

이는 recovery mastery 보상으로 허용 후보.

너무 dominant하면
R0 x / width를 조정하되
삭제하지 않는다.

### 4. No Cover Visual

시각적으로 signal mast가 커도
Player가:

```text
“저 뒤에 숨으면 조준이 끊기겠지”
```

라고 기대할 수 있다.

따라서 firing band의 큰 mast body는
player-sentry sightline을 시각적으로 완전히 가리지 않는 배치 권장.

### 5. Standard Sentry Rule Tags

현재 Runtime에서 Rope Cut 여부는:

```text
cutter-fire
```

가 결정.

Cover LOS는:

```text
cover-ends-los
```

가 결정.

`standard-projectile` 같은 tag는
authoring metadata 성격이므로
Sector06 Runtime authoring 시 현재 Factory/Validator 계약을 다시 확인.

### 6. 6-4 Handoff

6-4는:

```text
ROOFTOP SERVICE SHELTER
REST
PAD 03 / SHUTTLE DIRECT VISUAL CONFIRMATION
```

따라서 6-3 P4 이후에는
추가 Enemy / projectile pressure를 만들지 않는다.

### 7. Camera

C1에서 P1/S1/H2/H3/H4/R0가
모바일에서도 동시에 읽히지 않으면:

1. geometry compact
2. S1 position 조정
3. camera zoom

순으로 해결.

무조건 zoom-out부터 하지 않는다.

### 8. Geometry Audit

6-4 작성 직전
최신 GitHub main 재확인 후:

- 6-1
- 6-2
- 6-3
- Sector05 REST 5-4
- Sector04 REST 4-4
- 2-4 등 기존 decompression stage

를 비교해
6-4가 또 다른 “중앙 안전 플랫폼” 복제가 되지 않게 한다.

---

SECTOR 06-3 / PERIMETER SIGNAL DECK — BLOCKOUT CANDIDATE · REV 1.0
