# SECTOR 06-4 — ROOFTOP SERVICE SHELTER

*BLOCKOUT CANDIDATE · REV 1.0*

◀ PREV — [SECTOR 06-3 / PERIMETER SIGNAL DECK](../6-3/README.md) · NEXT — SECTOR 06-5 / PAD ACCESS ARRAY — NOT YET AUTHORED ▶

`SECTOR 06 ROOFTOP / EVACUATION` · `STAGE 04` · `REST / GOAL CONFIRMATION` · `PAD 03 + SHUTTLE FIRST DIRECT VISUAL`

| 항목 | 기준 |
|---|---|
| Status | HYPOTHESIS — BLOCKOUT CANDIDATE |
| Authoring Snapshot | `a7c146965a96f7086f3f0642db47042710efc454` |
| Sector Master | GitHub MERGED — PR #578 |
| 6-1 / 6-2 | GitHub MERGED — PR #579 |
| Previous Stage | 6-3 PERIMETER SIGNAL DECK REV 1.0 — GitHub MERGED / PR #580 |
| Difficulty | REST |
| Expected First Playtime | 55–85 sec |
| Expected Skilled Clear | 25–40 sec |
| Enemy | NONE |
| Wind | NONE |
| Access Scan Field | NONE |
| Cutter | NONE |
| Patrol | NONE |
| Standard Sentry | NONE |
| Moving Platform / Train | NONE |
| Damage Hazard | NONE |
| New Player Input | NONE |
| New Rope Mode | NONE |
| New Growth | NONE |
| Foundation | CURRENT RUNTIME — selected Foundation KEEP |
| First Specialization | CONTENT BLOCKED / NOT REQUIRED |
| Legacy Artifact Layer | REMOVED FROM CURRENT RUNTIME |
| Required Kill | NONE |
| Design Checkpoint / Reward | NONE |
| Health Refill | NONE ADDED |
| Timer Pause | NONE |
| Internal Boss | NONE |
| Primary Spatial Identity | LEFT EXPOSED SHELF → LOW SHELTER PASS → RIGHT OBSERVATION LIP |
| Primary Role | 6-2 Wind + 6-3 Sentry 이후 Decompression / Pad03와 Shuttle의 첫 실제 목표 확인 |
| Story Role | `ROOFTOP PAD 03 — SIGNAL ACQUIRED` + `MAINTENANCE SHUTTLE — STANDBY`를 처음 직접 시각 확인 |
| Stage-local Exit | Reach P4 Shelter Exit Deck → Gate Panel → Physical Crossing |
| Sector06 Runtime | NOT AUTHORED / NOT CONNECTED |
| Approved Gameplay Art | HOLD until Runtime Area / Camera Zone / Stable IDs exist |

---

## 0. 기획 기준

### LOCKED FOR THIS STAGE

6-2:

```text
WIND MASTERY RECALL
```

6-3:

```text
STANDARD SENTRY
OPEN-SKY BODY-ARC CONTROL
```

을 연속으로 수행했다.

6-4에서는 모두 끈다.

```text
NO ENEMY
NO WIND
NO SCANNER
NO CUTTER
NO PATROL
NO DAMAGE HAZARD
```

### Core Question

> **“처음부터 찾아온 탈출 목표가 정말 존재하고, 이제 실제로 가까워졌다는 것을 Player가 압박 없이 확인할 수 있는가?”**

### REST의 정확한 의미

```text
REST
≠ TIMER PAUSE
≠ HEALTH REFILL
≠ CHECKPOINT REWARD
≠ BUILD REROLL
≠ NEW GROWTH
```

REST는:

```text
THREAT-FREE SPACE
```

만 의미한다.

Sector06 General Timer는 계속 진행한다.

Gate의 기존 Timer replenish가 존재한다면
그 제품 계약만 그대로 사용한다.

### Stage Grammar

```text
EXPOSED ENTRY SHELF
↓
LOW SHELTER ROOF PASS
↓
P2 QUIET SERVICE DECK
PAD 03 SIGNAL ACQUIRED
↓
P3 OBSERVATION LIP
SHUTTLE DIRECT VISUAL
↓
SHORT EXIT TURN
↓
PAD ACCESS ARRAY PREVIEW
```

### 금지

- Enemy
- Wind Force
- Scanner active field
- Cutter
- Patrol
- New Rope Rule
- New Input
- New Growth
- Health Station
- Timer Freeze
- Mandatory Terminal Interaction
- Long Story Dump
- `ACCESS DENIED`
- `CONTAINMENT VIOLATION`
- Final Security Encounter
- Shuttle boarding
- Shuttle guaranteed operational claim

---

## 0-1. 최신 GitHub / Runtime 기준

### CURRENT MAIN AT FINAL REVIEW

```text
a7c146965a96f7086f3f0642db47042710efc454
```

6-4 작성 중 PR #580이 병합되어:

```text
Sector06
6-3 PERIMETER SIGNAL DECK
```

도 GitHub 정식 Scenario Source가 됐다.

PR #580은 문서 범위이며
Gameplay Runtime 변경은 없다.

현재 GitHub:

```text
Sector05
Master + 5-1~5-8 merged

Sector06
Master + 6-1 + 6-2 + 6-3 merged
```

Sector06 authored Runtime은 여전히 없다.

### Current Rope

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

문서 단계:

```text
all Mandatory links
< 400 px
```

향후 Graybox:

```text
swingImpulse = 0
```

로 actual physical clear 검증.

본 문서는 거리 계산만으로:

```text
PHYSICS PASS
```

를 주장하지 않는다.

---

## 0-2. 기존 REST Stage 교차검증

### 3-5 — COMMERCIAL SERVICE NODE

Current authored Runtime:

```text
compact vertical service room
P0 / P1 / P2 broad decks
G1 / G2 / G3 short vertical rope loop
```

Role:

```text
BUILD DIAGNOSTIC
```

### 4-4 — INFRASTRUCTURE SERVICE NODE

Current authored Runtime:

```text
short vertical service spine
central routing overview deck
5 grapple targets
```

Role:

```text
NETWORK / ROUTING DIAGNOSTIC
```

### 5-4 — CONTINUITY SERVICE NODE

Scenario:

```text
quiet vertical hardpoint spine
central capacity overview
```

Role:

```text
CAPACITY EVIDENCE
```

### Repetition Risk

세 Stage 모두 대체로:

```text
ENTRY
↓
CENTRAL SAFE INFORMATION DECK
↓
SHORT VERTICAL SERVICE SPINE
↓
EXIT
```

골격을 공유한다.

### 6-4 Selected Difference

```text
LEFT-TO-RIGHT HORIZONTAL REST
+
LOW SHELTER ROOF
+
OUTDOOR OBSERVATION LIP
+
REAL DISTANT GOAL VISUAL
```

즉:

```text
information-room Rest
```

가 아니라:

```text
goal-confirmation Rest
```

이다.

---

## 1. 한 줄 정의

6-3 Perimeter Signal Deck의 Standard Sentry firing arc를 통과한 Player가 옥상 가장자리의 작은 Service Shelter 구역으로 들어와, Enemy·Wind·Scanner가 모두 사라진 상태에서 왼쪽 P0 Exposed Entry Shelf에서 H1과 P1을 통해 낮은 Shelter Roof 아래로 들어가고, H2를 거쳐 넓은 P2 Shelter Deck에 안착하며 `ROOFTOP PAD 03 / SIGNAL ACQUIRED` 상태를 확인한 뒤, H3을 따라 오른쪽 P3 Observation Lip으로 나가 처음으로 실제 Pad 03 구조와 그 위의 Maintenance Shuttle 실루엣을 같은 화면에서 직접 보고 `MAINTENANCE SHUTTLE / STANDBY`를 확인해 게임 시작부터 추적해온 탈출 목표가 실재하며 가까워졌음을 확신하고, 짧은 H4 전환을 통해 P4 Exit Deck에서 `PAD ACCESS ARRAY / CONTROL ONLINE`을 읽은 뒤 아직 접근 거부나 Final Security의 정체는 모르는 상태로 6-5에 진입하는 Sector06의 감정적 Rest / Goal Confirmation Stage.

---

## 2. 전체 게임에서의 역할

### 2-1. First Tangible Goal Confirmation

1-1:

```text
PAD 03
정보로 존재
```

5-8:

```text
PAD 03
탈출 목표로 재확인
```

6-4:

```text
PAD 03
눈앞의 실제 장소로 존재
```

### 2-2. Combat Rhythm Reset

6-2:

```text
Wind
```

6-3:

```text
Sentry
```

6-4:

```text
ZERO THREAT
```

6-5:

```text
Scanner mastery
```

### 2-3. No New Exposition

Sector05에서:

```text
WHO / WHY
```

는 끝났다.

6-4는 정책 정보를 더 설명하지 않는다.

### 2-4. Motivation Becomes Spatial

Player motivation이:

```text
UI text
```

에서:

```text
visible landmark
```

로 바뀐다.

---

## 3. Story 역할

### S0 — Entry

```text
ROOFTOP SERVICE SHELTER

LOCAL ACCESS
AVAILABLE
```

### S1 — P2 Signal Confirmation

Mandatory broad traversal trigger.

```text
ROOFTOP PAD 03

SIGNAL
ACQUIRED
```

### S2 — P3 Direct Visual — PRIMARY

P3 Observation Lip에서
실제 Pad / Shuttle silhouette가 시야에 들어온다.

권장 상태:

```text
MAINTENANCE SHUTTLE

STANDBY
```

### Player가 확정할 수 있는 것

```text
Pad 03은 실제로 존재한다.

Maintenance Shuttle도
그 위치에 있다.

현재 시스템 상태는
STANDBY로 표시된다.
```

### 아직 확정할 수 없는 것

```text
Pad에 지금 들어갈 수 있는가?

Shuttle이 즉시 출발 가능한가?

누가 access를 막는가?

Final Security가 무엇인가?
```

### S3 — Exit

```text
PAD ACCESS ARRAY

CONTROL
ONLINE
```

### 아직 절대 쓰지 않는 문구

```text
ACCESS DENIED

CONTAINMENT VIOLATION
```

6-8 소유.

---

## 4. 공간 콘셉트

### ROOFTOP SERVICE SHELTER

항공 Beacon과 Pad 접근 구조를 유지보수하는
작은 외부 Shelter.

### 공간 언어

```text
LOW ROOF
OPEN SIDE
SERVICE BENCH
SIGNAL PANEL
OBSERVATION LIP
PAD IN DISTANCE
```

### Main Shape

```text
LEFT EXPOSED SHELF
→
LOW SHELTER
→
WIDE QUIET DECK
→
RIGHT OBSERVATION LIP
→
SHORT UPPER EXIT
```

### 중요한 차이

중앙 Tower를 위로 오르지 않는다.

```text
VERTICAL SERVICE SPINE
NO
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
1344 px

X
-672 ~ +672

HEIGHT
704 px

Y
0 ~ -704
```

### Horizontal Travel

P0:

```text
x -592
```

에서 P4:

```text
x +576
```

까지 약:

```text
1168 px
```

### Vertical Gain

약:

```text
608 px
```

따라서:

```text
HORIZONTAL REST
```

가 먼저 느껴져야 한다.

### Shelter Roof

낮은 roof silhouette는
배경/Collision clarity를 주되
Rope route를 막는 precision obstacle이 되면 안 된다.

---

## 6. 전체 맵 구조

```text
Y = 0

P0 ENTRY
(-592,0)
    \
     H1 (-368,-128)
       \
        P1 (-208,-176)
        EXPOSED LIP
           \
            H2 (-16,-240)
              \
               P2 (+176,-288)
               QUIET SHELTER DECK
               [PAD 03 SIGNAL ACQUIRED]

       R1 (+16,-384)
       LOWER SERVICE AWNING

                    \
                     H3 (+400,-352)
                       \
                        P3 (+528,-416)
                        OBSERVATION LIP
                        [PAD 03 + SHUTTLE VISIBLE]
                           \
                            H4 (+416,-544)
                              \
                               P4 (+576,-608)
                               EXIT / PAD ACCESS ARRAY

Y = -704
```

### Shape Signature

```text
LEFT
→ CENTER
→ RIGHT
→ SMALL LEFT TURN
→ RIGHT EXIT
```

---

## 7. Zone 구성

### Z0 — Pressure Release

```text
P0 → H1 → P1
```

6-3 Combat Audio / Security pressure 종료.

### Z1 — Low Shelter Pass

```text
P1 → H2 → P2
```

새 Challenge 없음.

P2는 가장 넓고 조용한 deck.

### Z2 — Pad Signal Confirmation

P2 broad trigger:

```text
ROOFTOP PAD 03
SIGNAL ACQUIRED
```

### Z3 — Observation Lip

```text
P2 → H3 → P3
```

P3에서
Pad03 + Shuttle을 처음 직접 본다.

### Z4 — Exit Turn

```text
P3 → H4 → P4
```

6-5 Pad Access Array의
security structures를 미리 볼 수 있음.

단 Scanner는 아직 작동시키지 않는다.

---

## 8. 좌표 / 오브젝트

전부:

```text
HYPOTHESIS — BLOCKOUT
```

### 8-1. Landing / Recovery

| ID | Center | Size | Role |
|---|---:|---:|---|
| P0 | `(-592, 0)` | `288×32` | Entry Shelf |
| P1 | `(-208, -176)` | `288×24` | Exterior Shelter Lip |
| P2 | `(+176, -288)` | `448×32` | Quiet Shelter / Signal Deck |
| R1 | `(+16, -384)` | `256×20` | Lower Service Awning Recovery |
| P3 | `(+528, -416)` | `288×32` | Observation Lip |
| P4 | `(+576, -608)` | `352×32` | Pad Access Array Exit Deck |

### 8-2. Grapple Landmarks

| ID | Position | Form | Role |
|---|---:|---|---|
| H1 | `(-368, -128)` | shelter outer brace | Entry |
| H2 | `(-16, -240)` | low roof service joint | Shelter pass |
| H3 | `(+400, -352)` | observation frame bracket | Pad visual approach |
| H4 | `(+416, -544)` | upper access truss | Exit turn |

### 8-3. Pad 03 Visual Landmark V1

```text
Role
BACKGROUND / MIDGROUND LANDMARK

gameplay
false
```

P3 Camera에서:

- pad perimeter geometry
- pad lights
- maintenance shuttle silhouette

가 읽혀야 한다.

### 8-4. Shuttle V2

```text
MAINTENANCE SHUTTLE
```

현재 6-4에서는:

```text
NON-COLLIDING
NON-INTERACTIVE
DISTANT LANDMARK
```

이다.

### 8-5. Story Display N1

P2 근처:

```text
ROOFTOP PAD 03
SIGNAL ACQUIRED
```

non-interactive display 후보.

### 8-6. Stable ID 후보

```text
sector-06-04:p0
sector-06-04:p1
sector-06-04:p2
sector-06-04:r1
sector-06-04:p3
sector-06-04:p4

sector-06-04:hardpoint-h1
sector-06-04:hardpoint-h2
sector-06-04:hardpoint-h3
sector-06-04:hardpoint-h4

sector-06-04:pad03-visual
sector-06-04:shuttle-visual
sector-06-04:pad-signal-display
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
→ P3
→ H4
→ P4
```

### Distance Pre-check

| Link | Distance |
|---|---:|
| P0 → H1 | `258.0 px` |
| H1 → P1 | `167.0 px` |
| P1 → H2 | `202.4 px` |
| H2 → P2 | `197.9 px` |
| P2 → H3 | `233.0 px` |
| H3 → P3 | `143.1 px` |
| P3 → H4 | `170.1 px` |
| H4 → P4 | `172.3 px` |

### Result

```text
MAX SAFE LINK
= 258.0 px

HOOK REACH
= 400 px

MARGIN
= 142.0 px
```

### Intent

REST에서:

```text
RANGE TEST
NONE
```

---

## 10. Flow Route

### Route

```text
P0
→ H1
→ H2
→ P2
→ H3
→ P3
→ P4
```

P1과 H4를 생략.

### Distance Pre-check

| Link | Distance |
|---|---:|
| P0 → H1 | `258.0 px` |
| H1 → H2 | `369.4 px` |
| H2 → P2 | `197.9 px` |
| P2 → H3 | `233.0 px` |
| H3 → P3 | `143.1 px` |
| P3 → P4 | `197.9 px` |

### Result

```text
MAX FLOW LINK
= 369.4 px

HOOK REACH
= 400 px

MARGIN
= 30.6 px
```

### Important

```text
H1 → H2
369.4 px
```

는 optional Flow shortcut.

Safe route는:

```text
H1 → P1 → H2
167.0 / 202.4 px
```

이다.

---

## 11. Recovery

### R1

```text
(+16,-384)
```

P1→H2→P2 Shelter pass 아래의
넓은 service awning.

### Purpose

Rest Stage에서도
Open Sky miss가
unrecoverable fall이 되지 않게 함.

### Re-entry

```text
R1 → H3
```

거리 후보는
향후 Graybox에서 추가 조정.

Mandatory Safe Route에는 R1 필요 없음.

### Target

일반 miss:

```text
≤ 5 sec
```

안에 P2/P3 progression band 복귀.

### No Instant Death

```text
Sky miss
≠ immediate death
```

---

## 12. Shelter Roof / Collision Contract

### Low Roof

Shelter의 낮은 Roof는
공간 정체성을 만든다.

하지만:

```text
precision ceiling hazard
```

가 아니다.

### Recommended

Roof main mass:

```text
collision:true
oneWay:false
grappleable:false
```

후보.

### Grapple

H2는 Roof와 분리된
명확한 service joint.

### Bypass Guard

Roof 전체가 grappleable이면:

```text
H2 의미
0
```

가 되므로 금지.

### Important

Sector05의:

```text
SEALED SURFACE puzzle
```

를 다시 가르치는 것이 아니다.

H2는 단순히 가장 명확한 service attachment point.

---

## 13. Enemy / Hazard Contract

```text
Enemy
0

Wind Force
0

Scanner
0

Projectile
0

Damage Hazard
0
```

### Ambient Wind

외부 공간이므로:

```text
wind audio / scarf motion
YES
```

가능.

Gameplay Wind Force:

```text
NO
```

6-2와 구분.

---

## 14. REST Product Contract

### Timer

```text
CONTINUES
```

### Health

```text
NO FREE REFILL
```

### Growth

```text
NONE
```

### Reward

```text
NONE
```

### Foundation

```text
KEEP
```

### Specialization

```text
NOT REQUIRED
```

### Gate

기존 Gate replenish 제품 규칙만 허용.

새 Rest bonus를 만들지 않는다.

---

## 15. Foundation Expression

### IMPULSE COIL

H1→H2 Flow shortcut에서
짧은 movement expression 가능.

### RELAY LINK

H2→H3→P3 연결에서
smooth chain 가능.

### SHEAR CURRENT

Enemy 없음.

Offense value 0.

### Important

Rest Stage에서
모든 Foundation을 억지로 시험하지 않는다.

### Mandatory

```text
NO FOUNDATION REQUIRED
```

---

## 16. Pad03 Visual Contract

### 6-4가 소유하는 첫 Direct Visual

P3 Camera에서:

```text
ROOFTOP PAD 03
+
MAINTENANCE SHUTTLE
```

동시에 보인다.

### Distance Feeling

```text
reachable soon
but not next jump
```

이어야 한다.

### Camera Rule

Shuttle을 크게 보여주려고
Player를 과도하게 축소하지 않는다.

### Visual Read

Pad:

- perimeter lights
- landing markings candidate
- service mast
- shuttle silhouette

### Gameplay Read

Pad / Shuttle은
아직 collision target이 아니다.

---

## 17. Story Trigger

### S0 — Entry

```text
ROOFTOP SERVICE SHELTER

LOCAL ACCESS
AVAILABLE
```

### S1 — P2

```text
ROOFTOP PAD 03

SIGNAL
ACQUIRED
```

### S2 — P3

```text
MAINTENANCE SHUTTLE

STANDBY
```

### S3 — Exit

```text
PAD ACCESS ARRAY

CONTROL
ONLINE
```

### No Mandatory Interact

모두 broad traversal / persistent environment display로 해결.

### No Denial Yet

```text
ACCESS DENIED
```

금지.

---

## 18. Camera

모두:

```text
HYPOTHESIS
```

### C0 — Entry Shelf

```text
P0 / H1 / P1

Desktop
1.00

Mobile
0.74
```

6-3 combat view보다 조금 안정.

### C1 — Shelter Interior

```text
P1 / H2 / P2 / R1

Desktop
0.98

Mobile
0.72
```

### C2 — Observation Reveal — PRIMARY

```text
P2
H3
P3
Pad03
Shuttle
```

Desktop:

```text
0.90
```

Mobile:

```text
0.68
```

후보.

### C3 — Exit

```text
P3 / H4 / P4
+
Pad Access Array silhouette

Desktop
0.96

Mobile
0.72
```

### Critical

C2에서 Pad를 보여주기 위해
Player/H3 readability를 희생하면 FAIL.

---

## 19. Geometry Repetition Audit

### vs 3-5

3-5 actual Runtime:

```text
compact vertical service room
broad central decks
short calibration loop
```

6-4:

```text
long horizontal shelter traverse
right-side observation lip
real distant goal visual
```

### vs 4-4

4-4 actual Runtime:

```text
1152×896
vertical service spine
P2 central overview deck
5 grapple targets
```

6-4:

```text
1344×704
horizontal shelter
4 grapple targets
observation lip
```

### vs 5-4

5-4:

```text
vertical quiet hardpoint spine
capacity information deck
```

6-4:

```text
horizontal open-side shelter
goal landmark confirmation
```

### vs 6-1~6-3

6-1:

```text
large V neutral traverse
```

6-2:

```text
leftward crosswind
```

6-3:

```text
rightward Sentry firing arc
```

6-4:

```text
low-risk horizontal shelter walk
```

### Exact Coordinate Audit

최종 자동검사:

- Sector05 5-1~5-8
- 6-1
- 6-2
- 6-3
- actual 3-5
- actual 4-4

대상.

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
→ 6-5
```

### P4

```text
(+576,-608)
```

### Next

6-5:

```text
PAD ACCESS ARRAY
ACCESS SCAN FIELD ×1
```

### Important

P4는 Scanner activation 밖의
Safe Preview Deck 역할을 하도록
6-5 상세 설계 때 handoff 조정.

### Kill Requirement

```text
NONE
```

---

## 21. Pixel Art Asset Spec

### Shelter

- pale rooftop maintenance shell
- low roof
- open right side
- service cabinets
- signal panel
- minimal clutter

### Observation Lip

- narrow guard frame
- beacon light
- open sky
- unobstructed Pad view

### Pad03

Distant but tangible.

### Shuttle

작은 silhouette라도
Vehicle임이 읽혀야 함.

### Prohibited

- huge hero shuttle close-up
- boarding ramp already open
- green “READY TO DEPART” guarantee
- Final Security silhouette
- villain icon

---

## 22. Background / Parallax

### Far

- sky
- vertical city depth
- distant crown structures

### Mid — Critical

```text
PAD 03
SHUTTLE
```

### Near

- shelter frame
- observation rail
- service brace

### Parallax Rule

Pad03 / Shuttle은
중요 목표 Landmark라
과도한 parallax로 위치가 흔들려 보이면 안 됨.

### Gameplay Separation

Pad structure가
현재 Stage의 grapple target처럼 보이지 않게:

- lower luminance
- no cyan anchor cue
- background depth separation

유지.

---

## 23. Sound / VFX

### Entry

6-3 Security audio fade.

### Shelter

- quiet rooftop mechanical hum
- low ventilation
- wind ambience

### P2

Pad signal confirmation:

```text
short neutral system tone
```

### P3

Shuttle idle machinery가
아주 멀리서 처음 들릴 수 있음.

### No Music Triumph Yet

6-4는 도착이 아니라:

```text
goal confirmation
```

이다.

Final arrival는 6-8.

---

## 24. PASS Criteria

### REST

- Enemy 0
- Wind force 0
- Scanner 0
- Damage hazard 0
- Timer pause 0
- Health refill 0
- Reward 0
- Growth 0
- Mandatory interaction 0

### Geometry

- horizontal shelter identity
- Safe max 258.0px
- Flow max 369.4px
- all links <400px
- Flow high link optional only
- R1 visible lower recovery
- no instant-death sky
- shelter roof not grappleable
- H2 clear service target

### Repetition

- not 3-5 vertical calibration room
- not 4-4 vertical routing spine
- not 5-4 vertical capacity spine
- exact audited coordinate overlap 0

### Story

- Pad03 first direct visual
- Shuttle first direct visual
- `SIGNAL ACQUIRED`
- `STANDBY`
- no Access Denied
- no Final Security
- no new conspiracy
- no boarding success guarantee

### Production

- Runtime implementation HOLD
- Approved Gameplay Art HOLD
- physics PASS not claimed

---

## 25. FAIL Conditions

### REST

- free heal
- timer stop
- checkpoint reward
- upgrade choice
- scanner active inside Shelter
- enemy added for “something to do”

### Geometry

- another central vertical service spine
- P2 becomes mandatory terminal room
- Roof precision trap
- H1→H2 369.4 becomes mandatory
- Observation Lip miss becomes unrecoverable fall
- Pad background looks immediately grappleable

### Story

- `ACCESS DENIED`
- `CONTAINMENT VIOLATION`
- Shuttle “READY FOR DEPARTURE”
- boarding prompt
- Final Security reveal
- Sector05 WHO/WHY repetition

### Product

- Sector06 runtime authoring
- Pad03 gameplay collision authored early
- Shuttle interaction authored early
- Approved Art before camera/runtime IDs

---

## 26. 개발자 / 기획자 최종 전달 요약

### Stage

```text
SECTOR 06-4
ROOFTOP SERVICE SHELTER
```

### Role

```text
REST
+
GOAL CONFIRMATION
```

### Threat

```text
NONE
```

### Shape

```text
LEFT EXPOSED SHELF
→
LOW SHELTER PASS
→
P2 QUIET DECK
→
P3 OBSERVATION LIP
→
RIGHT EXIT
```

### Route

```text
SAFE
P0 → H1 → P1 → H2 → P2 → H3 → P3 → H4 → P4

FLOW
P0 → H1 → H2 → P2 → H3 → P3 → P4
```

### Geometry

```text
SAFE MAX
258.0 px

FLOW MAX
369.4 px

HOOK REACH
400 px
```

### Story

P2:

```text
ROOFTOP PAD 03
SIGNAL ACQUIRED
```

P3:

```text
MAINTENANCE SHUTTLE
STANDBY
```

Exit:

```text
PAD ACCESS ARRAY
CONTROL ONLINE
```

### Still Hidden

```text
ACCESS DENIED
CONTAINMENT VIOLATION
FINAL SECURITY
```

### Stage Feeling

> **“6-3의 마지막 탄을 벗어나 낮은 Shelter 안으로 들어오면 게임이 잠시 조용해진다. 몇 번의 쉬운 Rope 이동 뒤 오른쪽 Observation Lip에 나서는 순간, 아래에서부터 계속 찾아온 Pad 03과 Shuttle이 처음으로 실제 물체로 보인다. 아직 탈출한 것은 아니지만, 이제 목표가 문장이 아니라 장소가 된다.”**

---

## OPEN QUESTIONS

### 1. P3 Pad Visual Scale

목표:

```text
recognizable
but not yet reachable
```

Pad / Shuttle이 너무 크면
6-8 arrival 감정이 약해짐.

너무 작으면
6-4 Story Beat가 무의미.

### 2. Shuttle STANDBY Interpretation

현재:

```text
STANDBY
```

만 확정.

이는:

```text
shuttle present / system recognizes it
```

정도의 의미.

즉시 출발 가능 보장은 아님.

### 3. Shelter Roof Collision

Roof를 solid non-oneWay로 둘 경우
향후 6-5 등에 Wind가 없으므로 force occlusion 문제는 없음.

다만 Player collision snag가 생기지 않는 높이 필요.

### 4. H1 → H2 Flow

```text
369.4px
```

Optional.

REST Stage에서 이 shortcut 실패율이 높아도
Safe P1 landing이 매우 쉬워야 한다.

### 5. R1 Re-entry

현재 R1은 Fail Catch 개념.

6-4 Graybox에서:

```text
R1 → H3
```

또는:

```text
R1 → P2
```

중 어느 쪽이 더 자연스러운지 검증.

### 6. Pad Access Array Preview

P4에서 6-5 Scanner Housing silhouette는
보여줄 수 있음.

하지만 Scanner phase / warning effect는
6-5 진입 전 활성화하지 않는다.

### 7. 6-5 Handoff

6-5 작성 시 P4는:

```text
SAFE SCANNER PREVIEW
```

역할을 가져야 한다.

즉 첫 controlled Hardpoint와
Scanner field를 미리 볼 수 있게 조정.

### 8. Previous REST Comparison

6-4의 성공 여부를 판단할 때:

```text
3-5 = build re-read
4-4 = routing anomaly
5-4 = capacity evidence
6-4 = visible escape goal
```

이 네 Rest가
플레이 기억에서도 구분되는지 확인.

### 9. Camera vs Gameplay Readability

P3에서 Pad를 넓게 보이게 하려다가
H3/P3가 작아지면
geometry / pad placement를 먼저 조정.

Zoom-out은 마지막 수단.

### 10. 6-5 Before Authoring

다시 확인:

- latest GitHub main
- 6-1~6-4 geometry signatures
- actual Sector03 Scanner stages
- AccessScanField current code
- same-purpose bypass guard
- scanner phase / controlled surfaces

후 상세 좌표 결정.

---

SECTOR 06-4 / ROOFTOP SERVICE SHELTER — BLOCKOUT CANDIDATE · REV 1.0
