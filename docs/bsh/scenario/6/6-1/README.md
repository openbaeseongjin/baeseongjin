# SECTOR 06-1 — SKYBREAK ACCESS

*BLOCKOUT CANDIDATE · REV 1.0*

◀ PREV — POST-SECTOR 05 BOSS / TRANSITION — TBD · NEXT — [SECTOR 06-2 / CROSSWIND MASTS](../6-2/README.md) ▶

`SECTOR 06 ROOFTOP / EVACUATION` · `STAGE 01` · `OPEN SKY TRANSITION` · `V-SHAPED ROOFTOP TRAVERSE`

| 항목 | 기준 |
|---|---|
| Status | HYPOTHESIS — BLOCKOUT CANDIDATE |
| Authoring Snapshot | `c3ef82486fce6b262fd3572fee1ebc9495e939fc` |
| Sector Master | LOCAL REVIEWED — Sector06 Master REV 1.0 |
| Previous General Stage | 5-8 CONTINUITY CONTROL SPINE REV 1.1 — LOCAL REVIEWED |
| Difficulty | ★★★ |
| Expected First Playtime | 105–145 sec |
| Expected Skilled Clear | 40–60 sec |
| Enemy | NONE |
| Cutter | NONE |
| Patrol | NONE |
| Standard Sentry | NONE |
| Wind | NONE |
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
| Primary Spatial Identity | RIGHT ENTRY → LEFT ROOFTOP SWEEP → RIGHT CROWN RETURN |
| Primary Role | Corporate interior의 마지막 외피를 벗어나 처음으로 Open Sky / Structural Island 문법을 읽게 함 |
| Story Role | `ROOFTOP ZONE / EXTERIOR SERVICE ACCESS` 확인. 새로운 음모·정책 정보 없음 |
| Stage-local Exit | Reach P4 Crown Deck → Gate Panel → Physical Crossing |
| Sector06 Runtime | NOT AUTHORED / NOT CONNECTED |
| Approved Gameplay Art | HOLD until Runtime Area / Camera Zone / Stable IDs exist |

---

## 0. 기획 기준

### LOCKED FOR THIS STAGE

6-1은 Sector06의 첫 일반 Stage다.

이 Stage에서 새로 배우는 것은:

```text
NEW MECHANIC
NO

NEW THREAT
NO

NEW INPUT
NO
```

다.

배우는 것은 오직:

> **“이제 더 이상 방 안을 오르는 것이 아니라, 하늘에 노출된 구조물 사이를 가로질러 이동한다.”**

라는 공간 문법이다.

### Core Question

> **“벽과 천장이 사라져도, 눈앞의 구조물 chain만 보고 다음 Rope를 계획할 수 있는가?”**

### Stage Grammar

```text
CORPORATE ROOF HATCH
↓
FIRST SKYBREAK
↓
RIGHT → LEFT LONG SWEEP
↓
FAR MAST ISLAND
↓
LEFT → RIGHT RETURN
↓
ROOFTOP CROWN DECK
↓
CROSSWIND MASTS PREVIEW
```

### 금지

- Enemy
- Wind
- Scanner
- Cutter
- Patrol
- Standard Sentry
- Moving Platform
- Moving Grapple Surface
- Damage Floor
- Instant-death sky
- New Rope mode
- New Input
- New Growth
- Build Lock
- Pad03 / Shuttle 직접 확인
- `ACCESS DENIED`
- Final Encounter preview
- 5-8 → 6-1 direct wiring

---

## 0-1. 최신 GitHub / Runtime 교차검증

### CURRENT MAIN AT AUTHORING

```text
c3ef82486fce6b262fd3572fee1ebc9495e939fc
```

최신 merge는 Sector04 문서 재검증이다.

### IMPORTANT — Sector04 4-1 Reach Issue Correction

이전 내부 메모의:

```text
4-1 A4 coordinate bug
```

판정은 RETIRED.

최신 GitHub 재검증에서:

```text
A3 → A4
408.9 px
```

는 Optional Flow 직결이고,

Mandatory Safe Route는:

```text
A3 → M1 → A4
```

로 우회해 400px 이내임이 확인됐다.

따라서:

```text
SECTOR04 4-1 A4 ISSUE
RESOLVED / FALSE ALARM
```

이다.

6-1 이후 Alignment queue에서 이 항목을 더 이상 P0 문제로 취급하지 않는다.

### Current Authored Runtime Boundary

GitHub 통합 문서 기준:

```text
1-1 → 3-8
MOCK INTEGRATED

4-1 → 4-8
standalone authored catalog
GRAYBOX READY / main world not connected

Sector05
runtime not authored

Sector06
runtime not authored
```

### Current Rope

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

### Mandatory Validation Policy

거리 pre-check:

```text
< 400 px
```

는 문서 단계에서 수행.

실제 graybox에서는:

```text
swingImpulse = 0
```

으로 Mandatory route를 물리 검증한다.

이 문서에서는:

```text
PHYSICS PASS
```

라고 주장하지 않는다.

---

## 0-2. 인접 Stage 경계

### PREV

```text
5-8 GENERAL FINALE
→
POST-SECTOR05 BOSS / TRANSITION
TBD
→
SECTOR06
```

따라서 6-1의 실제 Spawn은:

```text
POST-SECTOR05 TRANSITION
```

이 확정된 뒤 최종 조정.

본 문서는:

```text
Sector06 first playable rooftop space
```

만 설계한다.

### NEXT

6-2:

```text
CROSSWIND MASTS
KNOWN WIND RECALL
```

따라서 6-1은 Wind를 미리 작동시키지 않는다.

Exit에서:

```text
CROSSWIND MASTS
SERVICE ROUTE AHEAD
```

정도의 preview만 가능.

---

## 0-3. Sector Entry Repetition Audit

GitHub 실제 authored entry Stage를 비교했다.

### 1-1 SERVICE SHAFT

```text
vertical shaft
3 anchors
recovery beams
first Rope tutorial
```

### 2-1 WORKER BLOCK 12

```text
vertical residential courtyard
4 grapple landmarks
many balcony / recovery landings
```

### 3-1 POWERED PROMENADE

```text
open commercial atrium
single clear vertical ascent
5 grapple landmarks
```

### 4-1 TRANSIT INTAKE

```text
long vertical / diagonal intake
6 anchors
momentum flow
```

### 5-1 CORPORATE THRESHOLD

```text
sealed corporate surface
service hardpoint literacy
```

### 6-1 Selected Difference

```text
NO CENTRAL VERTICAL SHAFT

NO TALL ATRIUM

NO SEALED-SURFACE TEST

RIGHT ENTRY
→ FAR LEFT SWEEP
→ RIGHT RETURN
```

즉 Sector Entry의 변화가
배경만이 아니라 이동 궤적 자체에 나타난다.

---

## 1. 한 줄 정의

Post-Sector05 Boss / Transition 이후 Corporate Crown의 오른쪽 Roof Access Deck에서 Sector06 첫 플레이 공간에 진입한 Player가, Enemy·Wind·Scanner가 전혀 없는 상태에서 처음으로 화면 절반 이상을 차지하는 하늘과 도시 아래의 깊이를 보며 H1과 P1을 통해 건물 외피를 벗어나고, H2–H3을 따라 멀리 왼쪽 Antenna Service Island까지 횡단한 뒤 P2에서 진행 방향을 완전히 뒤집어 H4–H5를 통해 다시 오른쪽 Rooftop Crown Deck으로 돌아오면서 `ROOM / SHAFT`가 아닌 `VISIBLE STRUCTURAL CHAIN`을 읽는 Sector06의 Open-Sky 문법을 익히고, 마지막 P4에서 `ROOFTOP ZONE / EXTERIOR SERVICE ACCESS`와 `CROSSWIND MASTS / SERVICE ROUTE AHEAD`를 확인해 다음 6-2의 Wind mastery recall로 진입하는 저압 공간 전환 Stage.

---

## 2. 전체 게임에서의 역할

### 2-1. Five Sectors of Vertical Enclosure End

Sector01~05:

```text
SHAFT
COURTYARD
ATRIUM
TRUNK
SPINE
```

Sector06:

```text
SKY
+
ISLANDS
```

### 2-2. Movement Axis Shift

기존:

```text
UP
```

중심.

6-1:

```text
UP
+
ACROSS
```

로 바뀐다.

### 2-3. No Threat

Player가 첫 Open Sky를:

```text
Projectile
Wind
Scanner warning
```

보다 먼저 읽게 한다.

### 2-4. Goal Pursuit

Pad03의 정확한 위치나 Shuttle을 직접 보여주지 않는다.

다만:

```text
rooftop crown direction
```

이 이전보다 명확하게 느껴져야 한다.

---

## 3. Story 역할

### Entry

```text
ROOFTOP ZONE

EXTERIOR SERVICE ACCESS
```

### Mid

직접 Story text 없음.

도시 아래가 처음 크게 보이는 것 자체가 Story.

### Exit

```text
CROSSWIND MASTS

SERVICE ROUTE
AHEAD
```

### 이번 Stage에서 새로 확정하지 않는 것

- Incident Continuity Control 추가 정보
- Lower evacuation 추가 결과
- Pad03 exact location
- Shuttle exact visual
- Shuttle operational guarantee
- Access denial
- Final security identity

Sector05에서 WHO / WHY는 이미 끝났다.

Sector06은:

```text
KNOWLEDGE
→ ACTION
```

구간이다.

---

## 4. 공간 콘셉트

### SKYBREAK ACCESS

Corporate Zone의 최상부 외피에 난
Emergency exterior maintenance access.

### Shape

```text
RIGHT CORPORATE HATCH
↓
LEFTWARD EXTERIOR SWEEP
↓
FAR LEFT MAST ISLAND
↓
RIGHTWARD CROWN RETURN
```

### Key Silhouette

실내 중앙 Void가 아니라:

```text
broken skyline
+
isolated platforms
+
mast brackets
```

가 이동 구조를 만든다.

### Stage Feeling

> **“위로만 올라가던 게임이 처음으로 도시 꼭대기를 가로지르기 시작한다.”**

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
1024 px

Y
0 ~ -1024
```

### Vertical Rise

약:

```text
896 px
```

### Horizontal Sweep

P0 오른쪽:

```text
x +512
```

에서

H3 far left:

```text
x -448
```

까지 약 960px.

이후 P4:

```text
x +480
```

으로 되돌아온다.

### Why

Sector06가 단순한 6번째 Vertical Shaft가 되는 것을 방지.

---

## 6. 전체 맵 구조

```text
Y = 0

                                     P0 CORPORATE ROOF ACCESS
                                     (+512,0)
                                        /
                                  H1 (+288,-144)
                                     /
                             P1 (+64,-224)
                                  /
                        H2 (-192,-336)
                               /
                  H3 (-448,-432)
                     \
              R1 (-544,-560)   [LOWER RECOVERY]
                       \
                        P2 (-288,-608)
                              \
                               H4 (-32,-688)
                                     \
                                      H5 (+256,-784)
                                         \
                                  R2 (+288,-832)
                                            \
                                             P4 (+480,-896)
                                             CROWN EXIT

Y = -1024
```

### Main Signature

```text
RIGHT
→ CENTER
→ LEFT
→ FAR LEFT
→ CENTER
→ RIGHT
```

---

## 7. Zone 구성

### Z0 — Roof Hatch

```text
P0
```

실내 / 외부 경계.

첫 Camera는:

- Corporate wall
- open sky
- H1
- P1 일부

를 같이 보여준다.

### Z1 — First Skybreak

```text
P0 → H1 → P1
```

처음 건물 외피에서 완전히 떨어지는 구간.

### Z2 — Left Sweep

```text
P1 → H2 → H3
```

Stage의 가장 큰 lateral direction shift.

### Z3 — Far Mast Island

```text
H3 → P2
```

P2가 첫 명확한 Outdoor Structural Island landing.

R1은 실패용 lower service tray.

### Z4 — Crown Return

```text
P2 → H4 → H5 → P4
```

진행 방향을 오른쪽으로 완전히 반전.

### Z5 — Exit Preview

P4에서:

```text
CROSSWIND MASTS
SERVICE ROUTE AHEAD
```

6-2 preview.

---

## 8. 좌표 / 오브젝트

전부:

```text
HYPOTHESIS — BLOCKOUT
```

### 8-1. Landing / Recovery

| ID | Center | Size | Role |
|---|---:|---:|---|
| P0 | `(+512, 0)` | `320×32` | Corporate Roof Access |
| P1 | `(+64, -224)` | `256×24` | First Exterior Lip |
| R1 | `(-544, -560)` | `224×20` | Lower Mast Service Recovery |
| P2 | `(-288, -608)` | `288×32` | Far Mast Island |
| R2 | `(+288, -832)` | `224×20` | Crown-side Recovery |
| P4 | `(+480, -896)` | `352×32` | Rooftop Crown Exit Deck |

### 8-2. Grapple Landmarks

| ID | Position | Visual Form | Role |
|---|---:|---|---|
| H1 | `(+288, -144)` | Crown brace joint | Exterior break |
| H2 | `(-192, -336)` | Antenna service bracket | Left sweep |
| H3 | `(-448, -432)` | Far mast bracket | Deepest left commitment |
| H4 | `(-32, -688)` | Relay boom joint | Return start |
| H5 | `(+256, -784)` | Crown lighting truss joint | Final return |

### 8-3. Proposed Stable IDs

```text
sector-06-01:p0
sector-06-01:p1
sector-06-01:r1
sector-06-01:p2
sector-06-01:r2
sector-06-01:p4

sector-06-01:hardpoint-h1
sector-06-01:hardpoint-h2
sector-06-01:hardpoint-h3
sector-06-01:hardpoint-h4
sector-06-01:hardpoint-h5
```

### 8-4. Collision Islands

Candidate:

- roof access deck
- exterior lip
- far mast service island
- lower mast tray
- crown recovery gantry
- crown exit deck

### 8-5. Grapple Eligibility

H1~H5에는:

```text
visible grapple-landmark
+
same-position hidden grappleTarget
```

후보.

주변 mast/antenna decoration은:

```text
gameplay:false
```

또는 명확한 non-grapple structure로 분리.

6-1의 목적은:

```text
어디에 붙을 수 있는지 추리
```

가 아니라

```text
보이는 구조 chain을 읽고 횡단
```

이다.

---

## 9. Safe Route

### Route

```text
P0
→ H1
→ P1
→ H2
→ H3
→ P2
→ H4
→ H5
→ P4
```

### Distance Pre-check

| Link | Distance |
|---|---:|
| P0 → H1 | `266.3 px` |
| H1 → P1 | `237.9 px` |
| P1 → H2 | `279.4 px` |
| H2 → H3 | `273.4 px` |
| H3 → P2 | `237.9 px` |
| P2 → H4 | `268.2 px` |
| H4 → H5 | `303.6 px` |
| H5 → P4 | `250.4 px` |

### Result

```text
MAX SAFE LINK
= 303.6 px

CURRENT DERIVED HOOK REACH
= 400 px

MARGIN
= 96.4 px
```

### Intent

첫 Open Sky Stage에서:

```text
range precision
```

을 시험하지 않는다.

---

## 10. Flow Route

### Route

```text
P0
→ H1
→ P1
→ H2
→ P2
→ H4
→ H5
→ P4
```

H3를 생략하고:

```text
H2 → P2
```

로 직접 갈 수 있는 숙련 shortcut.

### Distance Pre-check

| Link | Distance |
|---|---:|
| P0 → H1 | `266.3 px` |
| H1 → P1 | `237.9 px` |
| P1 → H2 | `279.4 px` |
| H2 → P2 | `288.4 px` |
| P2 → H4 | `268.2 px` |
| H4 → H5 | `303.6 px` |
| H5 → P4 | `250.4 px` |

### Result

```text
MAX FLOW LINK
= 303.6 px
```

### Important

6-1은:

```text
Flow shortcut spectacle
```

Stage가 아니다.

Safe/Flow 차이는 작아도 된다.

핵심은 topology shift.

---

## 11. Geometry Repetition Audit

### Exact Coordinate Audit

6-1 주요 좌표:

```text
P0/P1/R1/P2/R2/P4
H1/H2/H3/H4/H5
```

를 다음과 비교.

```text
Sector05
5-1 ~ 5-8 reviewed geometry

GitHub actual runtime
1-1
2-1
3-1
4-1
```

결과:

```text
EXACT MAJOR-POINT OVERLAP
0
```

### Direction Signature

1-1:

```text
L → R → L → R
VERTICAL
```

2-1:

```text
residential zig-zag vertical
```

3-1:

```text
single rising promenade
```

4-1:

```text
long vertical diagonal flow
```

5-8:

```text
direction-reversal narrow spine
```

6-1:

```text
RIGHT → FAR LEFT → RIGHT
LOW-RISE WIDE TRAVERSE
```

### Safe / Flow Signature

```text
SAFE MAX
303.6

FLOW MAX
303.6
```

기존 5-8 REV1.1:

```text
372.2 / 384.7
```

와 명확히 다름.

---

## 12. Recovery

### R1

```text
(-544,-560)
```

H3 / P2 아래쪽.

Player가 H2→H3 또는 H3→P2에서 실패하면
화면 아래쪽에 미리 보이는 service tray.

### R2

```text
(+288,-832)
```

H5→P4 아래.

### Recovery Philosophy

Open Sky라고:

```text
miss
→ abyss
```

가 아니다.

### Target

일반 miss:

```text
≤ 5 sec
```

안에 main progression band 복귀.

### No Instant Death

Stage-local void:

```text
instant death hazard
NONE
```

전역 Sector collapse만 별도 제품 규칙으로 존재.

---

## 13. Enemy / Hazard

```text
Enemy
NONE

Wind
NONE

Scanner
NONE

Cutter
NONE

Patrol
NONE

Damage Hazard
NONE
```

### Why

6-2가 Wind를 소유한다.

6-1은 Sky 자체가 새로운 감각이므로
첫 노출을 hazard로 덮지 않는다.

---

## 14. Structural Island / Grapple Clarity

### Gameplay Structure

- P0 Roof Access
- P1 Exterior Lip
- P2 Mast Island
- P4 Crown Deck

가 주요 silhouette.

### Grapple

H1~H5는:

- cyan maintenance mount
- clearly protruding bracket
- 24~32px gameplay cue

### Decorative Mast

다음은 Cyan 금지.

- far antenna wire
- guy wire
- distant beacon
- background truss
- lightning rod

### Parent Bypass Guard

H1~H5 바로 뒤에:

```text
same-purpose large grappleable surface
```

를 두어 Hardpoint chain을 무의미하게 만들지 않는다.

하지만 Sector05처럼:

```text
SEALED SURFACE puzzle
```

로 읽히게 하지도 않는다.

---

## 15. Foundation Expression

### IMPULSE COIL

P2 이후:

```text
return sweep
```

에서 더 빠른 exit 가능.

### RELAY LINK

H2→H3→P2,
H4→H5 chain에서
안정적 re-attach.

### SHEAR CURRENT

Enemy가 없으므로 공격 이득 없음.

이는 문제 아님.

6-3/6-6/6-7에서 offense expression이 돌아온다.

### Mandatory

```text
NO FOUNDATION REQUIRED
```

---

## 16. Story Trigger

### S0 — Entry

```text
ROOFTOP ZONE

EXTERIOR SERVICE ACCESS
```

### S1 — First Skybreak

Text 없음.

Camera / environment가 Story.

### S2 — P4 Exit Preview

```text
CROSSWIND MASTS

SERVICE ROUTE
AHEAD
```

### Not Yet

```text
ROOFTOP PAD 03
MAINTENANCE SHUTTLE
```

의 가까운 직접 visual confirmation은
6-4가 소유.

---

## 17. Camera

모두:

```text
HYPOTHESIS
```

### C0 — Roof Hatch

P0 / H1 / P1.

```text
Desktop
1.00

Mobile
0.72
```

Sky:

```text
35~45%
```

정도.

### C1 — First Skybreak

P1 / H2 / H3 / R1.

```text
Desktop
0.92

Mobile
0.70
```

Sky가 Frame 절반 이상 가능.

### C2 — Far Mast Island

H3 / R1 / P2 / H4.

```text
Desktop
0.90

Mobile
0.68
```

도시 아래 depth를 가장 크게 느끼는 Frame.

### C3 — Crown Return

P2 / H4 / H5 / R2 / P4.

```text
Desktop
0.92

Mobile
0.70
```

### Important

웅장함을 위해:

```text
Player를 너무 작게 만드는 zoom-out
```

금지.

48px Player readability 유지.

---

## 18. Gate Contract

Stage-local:

```text
Reach P4
→ Gate Panel
→ Gate Open
→ Physical Crossing
→ 6-2
```

### Runtime

Sector06:

```text
NOT AUTHORED
```

이므로 실제 nextAreaId는 아직 없음.

### Candidate

P4:

```text
(+480,-896)
```

Panel / Gate 좌표는
Runtime Area 작성 시 P4 width와
6-2 Entry handoff를 보고 확정.

### Important

Post-Sector05 transition이 정해지기 전:

```text
5-8
→ 6-1
```

직접 연결 금지.

---

## 19. Pixel Art Asset Spec

### P0 Corporate Roof Access

- pale sealed crown wall
- heavy exterior hatch
- last trace of Sector05 interior

### First Skybreak

- open navy sky
- distant city
- building edge
- H1 maintenance bracket

### Far Mast Island

- exposed antenna service frame
- compact industrial platform
- small aviation light
- no dense pipe clutter

### Crown Return

- lighter rooftop structure
- beacon / mast silhouettes ahead

### Player Readability

- charcoal body
- red scarf
- cyan Rope / Hardpoint

### Danger Color

6-1에는 active threat가 없으므로
Red/Orange gameplay telegraph 최소.

---

## 20. Background / Parallax

### Far

- city vertical depth
- distant tower crowns
- sky

### Mid

- non-colliding rooftop machinery
- antenna towers
- bridge silhouettes

### Near

- roof edge frame
- mast brace
- service gantry

### Important

Background mast / wire가
H1~H5보다 선명하면 FAIL.

### Parallax

Exterior depth를 강화하지만
Rope aim 중 Hardpoint 위치가 흔들려 보이지 않게 제한.

---

## 21. Sound / VFX

### P0

Sector05 indoor hum 잔향.

### First Skybreak

실내 hum 감소.

```text
open air
distant wind ambience
city depth
```

증가.

### Important

6-1에서 들리는 wind는:

```text
AMBIENT
```

다.

Gameplay force Wind는:

```text
NONE
```

6-2에서 처음 recall.

### Scarf

Open Sky reveal에서
Red Scarf motion이
실내보다 더 크게 읽혀도 좋다.

이는 cosmetic presentation.

---

## 22. Multiplayer Contract

### Shared Space

두 Player가 같은 Structural Island chain을 사용.

### Different Pace

한 Player가 P2,
다른 Player가 P1에 있어도
강제 teleport 없음.

### Recovery

R1 / R2는
두 Player가 동시에 올라서도
기능적으로 충분한 폭 후보.

### Enemy Target

없음.

### Gate

기존 원칙:

```text
shared open
individual physical crossing
```

후보.

정확한 6-1→6-2 multiplayer portal behavior는
Sector06 Runtime authoring에서 기존 Gate framework 재사용.

---

## 23. Playtest Metrics

### Primary

1. P0에서 3초 안에 H1 / P1과 Sky direction을 읽는가.
2. Player가 첫 20초 안에 “공간이 달라졌다”고 느끼는가.
3. H2→H3 Left Sweep이 vertical shaft가 아닌 horizontal traverse로 느껴지는가.
4. P2에서 진행 방향 reversal을 즉시 읽는가.
5. R1 / R2가 실패 전에 보이는가.
6. Open Sky 때문에 추락 공포만 커지고 route readability가 낮아지지 않는가.
7. Mobile에서 Player / H1~H5가 충분히 크게 보이는가.

### Secondary

- Safe route first-try completion
- Flow H3 skip usage
- recovery usage
- idle / confusion time
- accidental decor aim rate

---

## 24. PASS Criteria

### Gameplay

- Enemy 0
- Wind force 0
- Scanner 0
- Cutter 0
- Patrol 0
- Damage Hazard 0
- New mechanic 0
- New input 0
- Growth 0
- no Foundation lock
- main geometry = right → far left → right
- Safe max 303.6px
- Flow max 303.6px
- all mandatory / flow links <400px
- R1 / R2 visible before likely miss
- no instant-death sky dependency
- no same-purpose parent grapple bypass

### Cross-Stage

- exact major-coordinate overlap vs Sector05 5-1~5-8 = 0
- exact major-coordinate overlap vs GitHub actual 1-1 / 2-1 / 3-1 / 4-1 = 0
- not another central vertical shaft
- not 5-8 narrow combat spine
- not 4-1 speed intake clone

### Story

- WHO / WHY not repeated
- no new conspiracy
- no Pad03 direct visual confirmation
- no Access Denied
- no Final Encounter
- Escape motivation unchanged

### Production

- Runtime implementation HOLD
- Approved Gameplay Art HOLD
- physics PASS not claimed before graybox

---

## 25. FAIL Conditions

### Geometry

- H1~H5 arrangement becomes simple L/R vertical zig-zag
- central shaft silhouette dominates
- mandatory 380~400px link
- R1 / R2 invisible before commitment
- one miss sends Player out of recoverable frame
- far antenna decoration reads as live Grapple
- huge background platform looks collidable

### Gameplay

- Wind force added
- Enemy added
- Scanner added
- new Grapple rule added
- Foundation requirement
- Pad access puzzle added
- combat Gate

### Story

- Pad03 / Shuttle full reveal pulled forward from 6-4
- `ACCESS DENIED` shown early
- Incident Continuity Control exposition repeated
- Sector05 decision chain restated as text dump

### Product

- direct 5-8→6-1 wiring
- Boss transition assumed
- Scenario Art approved before runtime geometry / camera
- physical success claimed from distance math alone

---

## 26. 개발자 / 기획자 최종 전달 요약

### Stage

```text
SECTOR 06-1
SKYBREAK ACCESS
```

### Core Identity

```text
THE ROOM IS GONE
```

### Geometry

```text
RIGHT ENTRY
→ FAR LEFT SWEEP
→ RIGHT CROWN RETURN
```

### Threat

```text
NONE
```

### Route

```text
P0
→ H1
→ P1
→ H2
→ H3
→ P2
→ H4
→ H5
→ P4
```

### Geometry Numbers

```text
SAFE MAX
303.6 px

FLOW MAX
303.6 px

HOOK REACH
400 px
```

### Recovery

```text
R1
lower mast service tray

R2
crown-side service gantry
```

### Story

```text
ROOFTOP ZONE
EXTERIOR SERVICE ACCESS
```

Exit:

```text
CROSSWIND MASTS
SERVICE ROUTE AHEAD
```

### Not Yet

```text
Pad03 close reveal
Shuttle close reveal
Access Denied
Final Security
```

### Current Runtime Note

```text
Sector04 4-1 A4 reach issue
RESOLVED / FALSE ALARM
```

최신 GitHub 정정 반영.

### Stage Feeling

> **“처음 다섯 Sector 동안 Player를 둘러싸던 방과 벽이 끊어진다. 적도 바람도 없이 첫 Rope를 밖으로 던지고, 도시 꼭대기를 왼쪽으로 크게 가로질렀다가 다시 Crown 쪽으로 돌아오는 순간부터 게임의 마지막 구역이 ‘상승’이 아니라 ‘목적지를 향한 옥상 횡단’으로 바뀐다.”**

---

## OPEN QUESTIONS

### 1. P0 Spawn

Post-Sector05 Boss / Transition이 TBD이므로:

```text
(+512,0)
```

은 Stage-local 후보.

실제 Boss exit 방향이 반대면
6-1 전체를 mirror할지
Entry connector만 조정할지 재검토.

### 2. P0 → H1 Sky Reveal

현재:

```text
266.3px
```

로 매우 안전.

첫 Open Sky 공포를 줄이기 위해 유지 권장.

### 3. H3 Position

```text
(-448,-432)
```

가 Stage의 far-left extreme.

Camera에서 도시 depth는 크게 보이되
P2 / R1이 동시에 읽혀야 한다.

### 4. Safe / Flow Difference

현재 Flow는 H3 landing/attach 일부를 줄이는 정도라
시간차가 크지 않을 수 있다.

6-1의 목적은 speed challenge가 아니므로
필수 수정 아님.

### 5. Ambient Wind

6-1에는 exterior wind sound / scarf motion 가능.

하지만 Gameplay Wind Force는 절대 없음.

6-2의 첫 force application을 보호.

### 6. Pad Direction Hint

6-1에서:

```text
PAD 03
```

직접 signage를 넣을지는 HOLD.

Master 기준으로 6-4가
Pad / Shuttle direct visual confirmation을 소유하므로
6-1은 단순 Rooftop / Crosswind route signage를 우선.

### 7. Structural Grapple Surfaces

Runtime authoring 때
platform rectangle의 default grappleable semantics가
Hardpoint route를 우회하지 않는지 확인.

필요하면:

```text
platform grappleable:false
+
visible same-position grappleTarget
```

사용.

단 이를 Sector05식 eligibility puzzle로 연출하지 않는다.

### 8. Camera Zone Exact Bounds

현재 camera zoom만 HYPOTHESIS.

Runtime Area가 생기면:

- P0/H1/P1
- P1/H2/H3/R1
- H3/P2/H4
- P2/H4/H5/R2/P4

구조를 기준으로 zone bounds 확정.

### 9. 6-2 Handoff

6-2는:

```text
CROSSWIND MASTS
```

이고 Known Wind Recall이 핵심.

6-1 Exit P4는
6-2 첫 Wind zone 바깥의 Safe Preview Deck 역할을 할 수 있도록
향후 인접 상세 Stage 작성 시 함께 조정.

### 10. Full Geometry Audit

6-2 작성 직전에도 다시:

- latest GitHub main
- 6-1 coordinates
- Sector05 all coordinates
- actual authored 1~4 analogous Wind stages

를 비교한다.

---

SECTOR 06-1 / SKYBREAK ACCESS — BLOCKOUT CANDIDATE · REV 1.0
