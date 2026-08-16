# SECTOR 05-8 — CONTINUITY CONTROL SPINE

*BLOCKOUT CANDIDATE · REV 1.1 — GEOMETRY REPETITION FIX*

◀ PREV — [SECTOR 05-7 / EVACUATION ARCHIVE](../5-7/README.md) · NEXT — POST-SECTOR 05 BOSS / TRANSITION — TBD ▶

`SECTOR 05 CORPORATE ZONE` · `STAGE 08` · `NARROW CONTROL SPINE` · `SECTOR SYNTHESIS` · `WHO / WHY + ESCAPE ROUTE REVEAL`

| 항목 | REV 1.1 기준 |
|---|---|
| Status | HYPOTHESIS — BLOCKOUT CANDIDATE / CROSS-STAGE GEOMETRY REVISED |
| Authoring Snapshot | `28d99edd464c66ca5be37bc1708e9e4d7d61ae14` |
| Revision Reason | REV 1.0이 5-5와 12개 주요 좌표·Safe/Flow signature를 과도하게 공유해 전면 재배치 |
| Sector Master | LOCAL REVIEWED — GitHub merge pending |
| 5-1 ~ 5-7 | LOCAL REVIEWED — GitHub merge pending |
| Difficulty | ★★★★ |
| Expected First Playtime | 170–230 sec |
| Expected Skilled Clear | 65–95 sec |
| Enemy | Patrol Drone T1 ×1 + Cutter Sentry T1 ×1 |
| Simultaneous Enemy Activation | NONE — controlled sequential bands |
| Patrol Rope Cut | NONE — `cutter-fire` ABSENT |
| Cutter Rope Cut | ACTIVE — `cutter-fire` PRESENT |
| Standard Sentry | NONE |
| Wind / Transit Wake | NONE |
| Access Scan Field | NONE |
| Moving Platform / Train | NONE |
| New Player Input | NONE |
| New Rope Mode | NONE |
| Primary Spatial Rule | SEALED SURFACE / SERVICE HARDPOINT |
| Geometry Identity | NARROW CENTRAL SPINE → DIRECTION REVERSAL → EXTERIOR-FACING FINAL RISE |
| Foundation | CURRENT RUNTIME — selected Foundation KEEP |
| First Specialization | CONTENT BLOCKED / NOT REQUIRED |
| New Growth | NONE |
| Legacy Artifact Layer | REMOVED FROM CURRENT RUNTIME |
| Required Kill | NONE |
| Internal Boss | NONE |
| Story Role | Capacity → Priority → Authorization → Outcome → Responsibility / WHY 완성 |
| Escape Goal | ROOFTOP PAD 03 / MAINTENANCE SHUTTLE — STANDBY |
| Post-Sector05 Boss / Transition | TBD |
| Sector06 Direct Wiring | FORBIDDEN |
| Sector 05 Runtime | NOT AUTHORED / NOT CONNECTED |
| Approved Gameplay Art | HOLD until Runtime Area / Camera Zone / Stable IDs exist |

---

## 0. 기획 기준

### REV 1.1의 핵심 수정

REV 1.0은 5-5와 다음 문제가 있었다.

```text
major coordinate overlap
12 points

SAFE MAX
5-5 = 369.4
5-8 REV1.0 = 369.4

FLOW MAX
5-5 = 364.9
5-8 REV1.0 = 364.9
```

즉 Gameplay 역할은 달라도
실제 Blockout skeleton이 지나치게 같았다.

REV 1.1은 Story / Enemy / Sector Finale 역할은 유지하고
Geometry만 전면 재설계한다.

### New Finale Identity

```text
WIDE TWO-BAND HALL
NO

NARROW CONTROL SPINE
YES
```

Player는 중앙 Control Spine을:

```text
RIGHTWARD ENTRY SWEEP
→
LEFTWARD PATROL REVERSAL
→
CENTER RELAY
→
LEFTWARD CUTTER DESCENT LINE
→
RIGHTWARD EXTERIOR RISE
```

로 통과한다.

### Gameplay Question

> **“Sector05에서 배운 Sparse Hardpoint planning을 서로 다른 방향 전환 속에서 Patrol timing과 Cutter recovery에 연속 적용할 수 있는가?”**

### Story Question

> **“이 모든 결과를 만든 조직적 판단은 무엇이었고, 이제 어디로 탈출할 것인가?”**

### 금지

- 5-5 skeleton 재사용
- Patrol + Cutter simultaneous activation
- Standard Sentry
- Wind
- Scanner
- Moving Platform
- New Input
- New Rope Mode
- New Growth
- Kill Gate
- Internal Boss
- direct 5-8 → 6-1 wiring
- Named executive villain
- intentional Cascade claim
- intentional casualty directive
- Group A/B/C social mapping
- revenge objective

---

## 0-1. 최신 GitHub / Runtime 기준

### CURRENT MAIN

```text
28d99edd464c66ca5be37bc1708e9e4d7d61ae14
```

최종 재확인 시 동일.

### Current Hook

```text
Hook Speed
1400 px/s

Hook Flight Ratio
2 / 7 sec

Derived Hook Reach
400 px

Hook Reload
0.20 sec

Attach Buffer
0.10 sec

Swing Impulse
780

Release Angular Transfer
0.55
```

### Current Patrol

```text
no eligible target
→ patrol

eligible target
→ patrol pause
→ acquire / track / lock / fire

target invalid
→ patrol resume
```

### Current Cutter

```text
canCutRope
=
rules.includes("cutter-fire")
```

Cutter 전용 aim-line / sensor presentation도
현재 `cutter-fire` 기준으로 구분된다.

### Authored Runtime Boundary

```text
DEFAULT WORLD
Sector01 → Sector02 → Sector03

SECTOR04
standalone authored catalog

SECTOR05
not authored
```

5-8은 계속 Scenario-only.

---

## 0-2. GitHub Late-Stage Geometry 비교 기준

REV 1.1 전 재검토한 대표 late-stage 구조:

```text
3-7 PRIORITY CONCOURSE
multi-route access-tier choice

3-8 UPPER MARKET GATE
free-weave / broad lateral field

4-7 ISOLATION JUNCTION
S-route + Wake reinterpretation

4-8 TRANSIT CONTROL TRUNK
long central Wake trunk + Cutter / Patrol bands
```

5-8은 이들과 다른:

```text
NARROW SPINE
+
DIRECTION REVERSALS
+
NO ENVIRONMENTAL FORCE
```

를 사용한다.

### Exact-coordinate Cross-check

REV 1.1 주요 Landing / Hardpoint / Enemy 좌표는:

```text
Sector05 5-1 ~ 5-7
exact overlap = 0

GitHub 3-8 representative runtime coordinates
exact overlap = 0

GitHub 4-8 representative runtime coordinates
exact overlap = 0
```

이 검사는 “좌표가 다르면 자동으로 좋은 Stage”라는 뜻이 아니다.

목적은:

```text
accidental skeleton copy
```

를 조기에 잡는 것.

---

## 0-3. 5-7 → 5-8 → Sector06 경계

### 5-7

```text
LOWER SECTORS
EVACUATION STATUS
SUSPENDED
```

### 5-8

```text
WHO
+
WHY
+
ESCAPE ROUTE
```

### 이후

```text
5-8
→
POST-SECTOR05 BOSS / TRANSITION TBD
→
SECTOR06
```

### Forbidden

```text
5-8 Gate
→
sector-06-01
```

직접 연결.

---

## 1. 한 줄 정의

5-7 Evacuation Archive에서 Lower-sector evacuation이 실제로 `SUSPENDED`였음을 확인한 Player가 Corporate Zone 최상단의 좁고 깊은 Continuity Control Spine에 진입해, 오른쪽으로 열리는 Entry Sweep 뒤 중앙 Patrol corridor를 가로질러 왼쪽 Recovery로 방향을 꺾고, 다시 중앙 Relay를 거쳐 오른쪽 Cutter Preview에서 왼쪽 아래로 뻗는 `S2 → C2 → R2` Rope-cut line을 읽어 통과한 다음, 마지막에는 전투가 완전히 사라진 상태에서 오른쪽 Exterior / Rooftop 방향으로 Hardpoint를 세 번 이어 올라가 P6 Directive Deck에 도달해 `INCIDENT CONTINUITY CONTROL`이 Cascade 이후 Critical Capacity Deficit 속에서 Upper Core Control과 Upper Evacuation Capacity를 보존하도록 Continuity Triage를 수행했고 그 결과 Lower Ascent와 Lower-sector evacuation이 중단됐다는 전체 인과를 확인한 뒤, 복수가 아니라 `ROOFTOP PAD 03 / MAINTENANCE SHUTTLE / STANDBY`를 다음 탈출 목표로 삼는 Sector05 General Finale.

---

## 2. 전체 게임에서의 역할

### 2-1. Sector05 Gameplay Synthesis

```text
5-1
attach literacy

5-2
commit timing

5-3
recovery planning

5-5
threat-type distinction

5-6
failure-cost choice

5-7
story-heavy confidence

5-8 REV1.1
continuous direction-changing synthesis
```

### 2-2. Finale가 5-5와 다른 이유

5-5:

```text
LOWER BAND
→ SAFE
→ UPPER BAND
```

의 두 encounter hall.

5-8:

```text
SPINE
→ REVERSAL
→ RELAY
→ REVERSAL
→ EXTERIOR RISE
```

의 연속 등반.

### 2-3. No New Mechanic

Finale에서 새 시스템 없음.

### 2-4. No Simultaneous Enemy Pressure

난이도는:

```text
route continuity
+
direction change
+
late-sector confidence
```

에서 나온다.

---

## 3. Story 역할

### S0 — Entry

```text
CONTINUITY CONTROL SPINE

AUTHORITY RECORDS
AVAILABLE
```

### S1 — M0 Relay

```text
CONTINUITY RELAY

CONTROL ACCESS
ACTIVE
```

### S2 — P6 Authority

```text
VERTICAL GRID CASCADE

POST-CASCADE
CONTINUITY DIRECTIVE

AUTHORITY
INCIDENT CONTINUITY CONTROL
```

### S3 — P6 WHY

```text
CRITICAL CAPACITY DEFICIT

PRIORITY

UPPER CORE CONTROL
PRESERVE

UPPER EVACUATION CAPACITY
PRESERVE
```

### S4 — P6 Consequence

```text
LOWER ASCENT ROUTING
SUSPEND

LOWER-SECTOR EVACUATION
SUSPENDED
```

### S5 — Escape Goal

```text
ROOFTOP PAD 03

MAINTENANCE SHUTTLE
STANDBY

LOWER TRANSIT
OFFLINE
```

---

## 4. WHO / WHY Canon Lock

### WHO

Working Canon:

```text
INCIDENT CONTINUITY CONTROL
```

조직적 기능.

개인 악당 아님.

### WHY

```text
CRITICAL CAPACITY DEFICIT
+
CONTINUITY PRESERVATION
```

### Decision Chain

```text
REAL CASCADE
↓
CAPACITY DEFICIT
↓
UPPER CORE CONTROL PRESERVE
+
UPPER EVACUATION CAPACITY PRESERVE
↓
LOWER ASCENT SUSPEND
↓
LOWER EVACUATION SUSPENDED
```

### Moral Boundary

비판점:

```text
planned disaster
NO
```

비판점:

```text
post-crisis resource allocation
followed vertical hierarchy
YES
```

---

## 5. 공간 콘셉트

### NARROW CONTROL SPINE

REV 1.0의
큰 두 Band Hall을 폐기.

### Width / Feeling

```text
less lateral room
more vertical depth
strong central structural spine
```

### Visual Sequence

1. enclosed white control shell
2. central glass slit
3. narrow relay deck
4. oblique Cutter command seam
5. exterior light opening
6. Rooftop-facing final deck

### Key Contrast

5-5:

```text
TRANSFER HALL
horizontal / broad
```

5-8:

```text
CONTROL SPINE
vertical / narrow
```

---

## 6. 전체 맵 구조

```text
Y = 0

P0 ENTRY (-528,0)
       \
        H1 (-272,-192)
          \
           P1 (+64,-352)
             \
              H2 (+192,-544)
             /
        [ D1 PATROL ]
           /
     H3 (-48,-720)
       \
        R1 (-320,-832)
          \
           M0 (-80,-960)
             \
              H4 (+160,-1088)
                \
                 P3 (+352,-1184)
                  /
                 C1 (+96,-1312)
                /
        [ S2 CUTTER (+320,-1248) ]
              /
        C2 (-128,-1440)
          /
     R2 (-352,-1536)
          \
           H7 (-64,-1664)
             \
              H8 (+224,-1760)
                \
                 P6 (+480,-1856)
                 DIRECTIVE / ROOFTOP
```

### Shape Signature

```text
RIGHT
→ RIGHT
→ LEFT
→ LEFT
→ CENTER
→ RIGHT
→ LEFT
→ LEFT
→ RIGHT
→ RIGHT
```

단순 좌우 대칭이 아니다.

---

## 7. Zone 구성

### Z0 — Rightward Entry Sweep

```text
P0 → H1 → P1
```

Corporate exterior light가 오른쪽 위에서 처음 보임.

### Z1 — Patrol Commitment

```text
P1 → H2 → H3 → R1
```

오른쪽으로 Commit 후
왼쪽으로 크게 방향 전환.

### Z2 — Central Relay

```text
R1 → M0
```

D1 / S2 모두 OUT.

### Z3 — Cutter Approach

```text
M0 → H4 → P3
```

오른쪽 Control Shelf에서
Cutter와 C1/C2/R2 전체 Preview.

### Z4 — Cutter Reversal

```text
P3 → C1 → C2 → R2
```

오른쪽에서 왼쪽 아래로 진행.

### Z5 — Exterior-facing Rise

```text
R2 → H7 → H8 → P6
```

위협 없음.

왼쪽 Recovery에서
최종 Rooftop 방향인 오른쪽으로 크게 열림.

---

## 8. 좌표 / 오브젝트

전부:

```text
HYPOTHESIS — BLOCKOUT
```

### 8-1. Landing / Recovery

| ID | Center | Size | Role |
|---|---:|---:|---|
| P0 | `(-528, 0)` | `320×32` | Entry |
| P1 | `(+64, -352)` | `288×32` | Safe Patrol Preview Shelf |
| R1 | `(-320, -832)` | `240×24` | Patrol Recovery |
| M0 | `(-80, -960)` | `320×32` | Full Safe Central Relay |
| P3 | `(+352, -1184)` | `288×32` | Safe Cutter Preview Shelf |
| R2 | `(-352, -1536)` | `240×24` | Cutter Recovery |
| P6 | `(+480, -1856)` | `384×32` | Final Directive / Exterior Deck |

### 8-2. Service Hardpoints

| ID | Position | Role |
|---|---:|---|
| H1 | `(-272, -192)` | Entry Sweep |
| H2 | `(+192, -544)` | Patrol Right Commitment |
| H3 | `(-48, -720)` | Patrol Direction Reversal |
| H4 | `(+160, -1088)` | Cutter Approach |
| C1 | `(+96, -1312)` | Cutter Entry |
| C2 | `(-128, -1440)` | Cutter Commitment |
| H7 | `(-64, -1664)` | Exterior Rise A |
| H8 | `(+224, -1760)` | Exterior Rise B |

### 8-3. Map Bounds

```text
WIDTH
1408 px

X
-704 ~ +704

HEIGHT
1920 px

Y
0 ~ -1920
```

### 8-4. Stable ID 후보

```text
sector-05-08:p0
sector-05-08:p1
sector-05-08:r1
sector-05-08:m0
sector-05-08:p3
sector-05-08:r2
sector-05-08:p6

sector-05-08:hardpoint-h1
sector-05-08:hardpoint-h2
sector-05-08:hardpoint-h3
sector-05-08:hardpoint-h4
sector-05-08:hardpoint-c1
sector-05-08:hardpoint-c2
sector-05-08:hardpoint-h7
sector-05-08:hardpoint-h8
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
→ M0
→ H4
→ P3
→ C1
→ C2
→ R2
→ H7
→ H8
→ P6
```

### Distance Pre-check

| Link | Distance |
|---|---:|
| P0 → H1 | `320.0 px` |
| H1 → P1 | `372.2 px` |
| P1 → H2 | `230.8 px` |
| H2 → H3 | `297.6 px` |
| H3 → R1 | `294.2 px` |
| R1 → M0 | `272.0 px` |
| M0 → H4 | `272.0 px` |
| H4 → P3 | `214.7 px` |
| P3 → C1 | `286.2 px` |
| C1 → C2 | `258.0 px` |
| C2 → R2 | `243.7 px` |
| R2 → H7 | `315.2 px` |
| H7 → H8 | `303.6 px` |
| H8 → P6 | `273.4 px` |

### Result

```text
MAX SAFE LINK
= 372.2 px

HOOK REACH
= 400 px

MARGIN
= 27.8 px
```

### Enemy-active Safe Max

Patrol band:

```text
H2 → H3
297.6 px
```

Cutter band:

```text
C1 → C2
258.0 px
```

---

## 10. Flow Route

### Route

```text
P0
→ H1
→ P1
→ H3
→ M0
→ H4
→ C1
→ C2
→ H7
→ H8
→ P6
```

### Distance Pre-check

| Link | Distance |
|---|---:|
| P0 → H1 | `320.0 px` |
| H1 → P1 | `372.2 px` |
| P1 → H3 | `384.7 px` |
| H3 → M0 | `242.1 px` |
| M0 → H4 | `272.0 px` |
| H4 → C1 | `233.0 px` |
| C1 → C2 | `258.0 px` |
| C2 → H7 | `233.0 px` |
| H7 → H8 | `303.6 px` |
| H8 → P6 | `273.4 px` |

### Result

```text
MAX FLOW LINK
= 384.7 px

HOOK REACH
= 400 px

MARGIN
= 15.3 px
```

### Flow Identity

숙련 Player는:

```text
P1 → H3
```

에서 Patrol Entry H2를 생략하고
방향 전환 자체를 한 번에 수행.

R1 / P3 / R2도 생략 가능.

---

## 11. Patrol Band Contract

### D1

```text
Position
(+64,-624)

Patrol Corridor
(-128,-624)
↔
(+256,-624)

speed
48

waitSeconds
0.45

mode
pingpong

cutter-fire
ABSENT
```

### Activation

```text
X
-96 ~ +224

Y
-752 ~ -496
```

Membership:

```text
P1 OUT

H2 IN
H3 IN

R1 OUT
M0 OUT
```

### Gameplay

P1에서 D1 위치를 보고
오른쪽 H2로 Commit.

H3에서 왼쪽으로 방향을 뒤집는다.

### Mandatory Wait

NONE.

---

## 12. M0 Full Safe Relay

### M0

```text
(-80,-960)
```

### Contract

```text
D1 OUT
S2 OUT
```

### Purpose

REV 1.1의 중앙 기준점.

5-5의 넓은 Hall reset과 달리
좁은 중앙 maintenance relay.

### Story

최종 Directive 공개 없음.

---

## 13. Cutter Band Contract

### S2 Cutter

```text
Position
(+320,-1248)
```

Rule:

```text
cutter-fire
PRESENT
```

### Activation

```text
X
-160 ~ +160

Y
-1472 ~ -1264
```

Membership:

```text
P3 OUT

C1 IN
C2 IN

R2 OUT
H7 OUT
```

### Critical Line

```text
S2
(+320,-1248)

C2
(-128,-1440)

R2
(-352,-1536)
```

Vectors:

```text
S2 → C2
(-448,-192)

C2 → R2
(-224,-96)
```

따라서:

```text
S2 → C2 → R2
COLLINEAR
```

### Not Forced

Release / arc / speed로 Cut 회피 가능.

### Cut Recovery

```text
R2
activation OUT
```

0.60초 Disable 뒤
Hook launch + flight 필요.

---

## 14. Recovery

### R1

Patrol failure catch.

### M0

Full reset.

### P3

Cutter plan preview.

### R2

Cutter cut / miss recovery.

### Final Rise

R2 이후 Enemy 없음.

### Targets

Patrol failure:

```text
≤4 sec
```

Cutter stable landing:

```text
≤2 sec target
```

Cutter next attach:

```text
≤3 sec target
```

### No Full Reset

Upper failure가 P0까지 떨어지면 FAIL.

---

## 15. Foundation Expression

### IMPULSE COIL

- P1→H3 Flow shortcut
- Cutter band exposure compression
- final exterior rise speed

### RELAY LINK

방향 전환이 많은 chain에서
Attach continuity에 직접 이득.

### SHEAR CURRENT

D1 / S2 optional Rope-line damage.

### Mandatory

```text
NO FOUNDATION REQUIRED
```

### First Specialization

```text
NOT REQUIRED
```

---

## 16. Difficulty / Finale Contract

### ★★★★

난이도 출처:

```text
direction reversal
+
sparse attach confidence
+
Patrol read
+
Cutter read
+
continuous late-stage flow
```

### 아님

```text
more enemies
max-range chain
new mechanic
boss
```

### Finale Identity

5-8은:

```text
GENERAL STAGE FINALE
```

이지 Boss가 아니다.

---

## 17. Story Trigger

### S0 — Entry

```text
CONTINUITY CONTROL SPINE

AUTHORITY RECORDS
AVAILABLE
```

### S1 — M0

```text
CONTINUITY RELAY
CONTROL ACCESS ACTIVE
```

### S2 — P6 Authority

```text
VERTICAL GRID CASCADE

POST-CASCADE
CONTINUITY DIRECTIVE

AUTHORITY
INCIDENT CONTINUITY CONTROL
```

### S3 — P6 WHY

```text
CRITICAL CAPACITY DEFICIT

UPPER CORE CONTROL
PRESERVE

UPPER EVACUATION CAPACITY
PRESERVE
```

### S4 — P6 Consequence

```text
LOWER ASCENT ROUTING
SUSPEND

LOWER-SECTOR EVACUATION
SUSPENDED
```

### S5 — P6 Escape

```text
ROOFTOP PAD 03

MAINTENANCE SHUTTLE
STANDBY

LOWER TRANSIT
OFFLINE
```

### Presentation

P6는 Enemy activation 0.

정보는 3 beat 이상으로 분산.

---

## 18. Full Story Causality

Sector05 종료 시:

```text
CASCADE
REAL INCIDENT
```

↓

```text
CAPACITY
CRITICAL DEFICIT
```

↓

```text
INCIDENT CONTINUITY CONTROL
POST-CASCADE TRIAGE
```

↓

```text
UPPER CORE CONTROL
PRESERVE

UPPER EVACUATION CAPACITY
PRESERVE
```

↓

```text
LOWER ASCENT
SUSPEND
```

↓

```text
LOWER EVACUATION
SUSPENDED
```

### Interpretation

실제 사고 이후
제한된 Capacity를 배분하는 조직적 선택이
상부 기능을 우선했다.

---

## 19. Player Motivation Contract

### Final Objective

```text
REACH ROOFTOP PAD 03
FIND MAINTENANCE SHUTTLE
ESCAPE
```

### Not Objective

```text
REVENGE
DESTROY COMPANY
KILL EXECUTIVES
LEAK DATA
```

### Shuttle

```text
STANDBY
```

는 탈출 가능성이지
탈출 성공 보장이 아니다.

---

## 20. Gate / Boss / Sector06 Boundary

### P6

Stage-local completion Deck.

Gate candidate는
제품 Transition이 확정되기 전
content-boundary 성격만 가진다.

### Internal Boss

```text
NONE
```

### Next

```text
5-8
→
POST-SECTOR05 BOSS / TRANSITION TBD
→
SECTOR06
```

### Sector Timer

실제 Boss Entry가 정해진 시점에만
General Timer 종료 / Boss Timer 시작.

---

## 21. Pixel Art Asset Spec

### Control Spine

- narrow white structural shell
- tall black glass slit
- recessed command seams
- sparse cyan hardpoints
- minimal exposed cable
- strong vertical silhouette

### Final Rise

H7부터:

- exterior daylight 증가
- glass / wall 밀도 감소
- Rooftop machinery silhouette 등장

### P6

정보층:

1. Authority
2. Directive / Consequence
3. Rooftop route

### 금지

- executive portrait
- villain hologram
- casualty imagery
- giant propaganda slogan

---

## 22. Background / VFX / Sound

### Patrol Band

Interior control ambience.

### M0

Combat layer down.

### Cutter Band

Current orange Cutter telegraph family 활용.

### Final Rise

처음으로:

```text
exterior wind
sky glow
rooftop mechanical hum
```

을 점진적으로 전면화.

### P6

Combat sound 완전 제거.

Story sting 대신
cold system confirmation.

---

## 23. Multiplayer Contract

### D1

Activation 내부 Player만 새 Target 후보.

### S2

Cutter activation 내부 Player만 새 Target 후보.

### Sequential Separation

한 Player가 D1,
다른 Player가 S2에 있을 수는 있으나
Stage geometry상 local bands는 분리.

### Cross-player Projectile / Rope

실제 authority runtime playtest 대상.

### P6

shared world facts.

movement lock 없음.

### Gate

```text
shared open
individual crossing
```

원칙 유지.

---

## 24. PASS Criteria

### Geometry

- 5-5 exact major-coordinate reuse 0
- Sector05 5-1~5-7 주요 좌표 exact overlap 0
- representative GitHub 3-8 / 4-8 runtime 좌표 exact overlap 0
- Safe max 372.2px
- Flow max 384.7px
- all links <400px
- Patrol-active Safe max 297.6px
- Cutter-active Safe max 258.0px
- `S2 → C2 → R2` collinear
- recovery visible before commitment
- no parent grapple bypass

### Gameplay

- Patrol exactly 1
- Cutter exactly 1
- D1 `cutter-fire` absent
- S2 `cutter-fire` present
- activation overlap none
- Kill Optional
- no new mechanic
- no new input
- no Growth
- no Foundation lock
- no internal Boss

### Story

- Incident Continuity Control organizational WHO
- Capacity Deficit WHY
- Upper preservation
- Lower suspension
- Lower evacuation outcome
- no named villain
- no intentional-disaster claim
- Rooftop Pad 03 goal
- ESCAPE 유지

### Production

- Runtime implementation HOLD
- Approved Art HOLD
- no direct Sector06 wiring

---

## 25. FAIL Conditions

### Geometry

- 5-5와 다시 같은 두-band Hall silhouette
- P1/M0/P3/R2 위치 패턴 재복제
- Safe/Flow signature가 기존 Stage와 사실상 동일
- active-band Mandatory 380~400px
- final rise가 camera 밖 blind attach
- failure → P0 reset

### Gameplay

- Patrol + Cutter simultaneous acquire
- D1 `cutter-fire`
- S2 `cutter-fire` 누락
- Kill Gate
- Wind / Scanner 추가
- Foundation requirement
- internal Boss

### Story

- named executive villain
- planned Cascade
- intentional death order
- Group A/B/C mapping
- revenge objective
- Shuttle 탈출 성공 보장

### Product

- 5-8→6-1 direct wiring
- Post-Sector05 Boss 추정
- Approved Art 조기 생성

---

## 26. 개발자 / 기획자 최종 전달 요약

### Revision

```text
REV 1.0
RETIRED FOR GEOMETRY REPETITION

REV 1.1
CURRENT BLOCKOUT CANDIDATE
```

### New Shape

```text
NARROW CONTROL SPINE
↓
PATROL DIRECTION REVERSAL
↓
CENTRAL RELAY
↓
CUTTER DIRECTION REVERSAL
↓
EXTERIOR-FACING FINAL RISE
```

### Geometry

```text
SAFE MAX
372.2 px

FLOW MAX
384.7 px

PATROL ACTIVE SAFE MAX
297.6 px

CUTTER ACTIVE SAFE MAX
258.0 px

HOOK REACH
400 px
```

### Exact Repetition Audit

```text
vs Sector05 5-1~5-7
major coordinate overlap
0

vs GitHub 3-8 representative runtime
0

vs GitHub 4-8 representative runtime
0
```

### Enemy

```text
D1 PATROL
cutter-fire ABSENT

S2 CUTTER
cutter-fire PRESENT
```

### Cutter Line

```text
S2 (+320,-1248)
→
C2 (-128,-1440)
→
R2 (-352,-1536)

COLLINEAR
```

### Story

```text
INCIDENT CONTINUITY CONTROL
+
CRITICAL CAPACITY DEFICIT
+
UPPER PRESERVATION
+
LOWER SUSPENSION
```

### Escape

```text
ROOFTOP PAD 03
MAINTENANCE SHUTTLE
STANDBY

OBJECTIVE
ESCAPE
```

### Boundary

```text
5-8 INTERNAL BOSS
NONE

POST-SECTOR05 BOSS / TRANSITION
TBD

DIRECT 6-1 WIRING
FORBIDDEN
```

---

## OPEN QUESTIONS

### 1. H1 → P1 372.2px

Safe Route에서 가장 긴 Link.

Threat-free Entry이므로 허용 후보.

Mobile 반복 miss 시:

```text
P1 x +64 → +48
```

또는 H1 16px inward.

### 2. P1 → H3 Flow 384.7px

숙련 shortcut only.

Safe는:

```text
P1 → H2 → H3
```

로 230.8 / 297.6px.

따라서 Mandatory max-range 아님.

### 3. Final Exterior Rise

R2→H7→H8→P6에서
카메라가 Rooftop 방향을 너무 일찍 보여
Sector06 공간을 spoiler하지 않게 한다.

보이는 것은:

```text
sky / exterior machinery / pad direction
```

정도.

정확한 Sector06 Arena는 숨김.

### 4. P6 width

현재 384px.

WHO/WHY + Escape 3 beat를 담기에
좁으면 416px까지 확대 가능.

Map right bound 안에서 유지.

### 5. Cutter Angle

현재 exact collinear.

Cut rate 과다 시:

1. S2 16~32px offset
2. C2 minor offset
3. activation timing

순으로 조정.

### 6. Organization Label

```text
INCIDENT CONTINUITY CONTROL
```

은 Working Canon.

Sector06 Master 시작 전
Naming만 한 번 재검토 가능.

### 7. Full Sector05 Geometry Audit

REV1.1 기준으로
Sector05 전체 exact-coordinate duplication은 크게 해소.

Sector06 각 Stage부터는
작성 직전에 자동 Geometry Signature Audit을 수행한다.

검사:

- exact coordinates
- direction sequence
- landing / recovery cadence
- Safe / Flow maxima
- activation layout
- enemy sequence

### 8. Runtime Alignment Queue

Sector05 통합 시 완료:

- 5-3 Cutter wording → `cutter-fire` (완료)
- 5-6 Cutter wording → `cutter-fire` (완료)
- Sector04 A4 "known issue" → 재검증 결과 FALSE ALARM으로 확인, 좌표 변경 불필요(PR #576)

Sector06 Scenario 완료 후 남은 항목:

- Sector05 Runtime authoring
- full 1~6 scenario/runtime alignment

순으로 처리.

---

SECTOR 05-8 / CONTINUITY CONTROL SPINE — BLOCKOUT CANDIDATE · REV 1.1
