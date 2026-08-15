# SECTOR 04-8 — TRANSIT CONTROL TRUNK

*BLOCKOUT CANDIDATE · REV 1.0*

◀ PREV — [SECTOR 04-7 / ISOLATION JUNCTION](../4-7/README.md) · NEXT — POST-SECTOR 04 BOSS / TRANSITION — TBD ▶

`SECTOR 04 TRANSIT / INFRASTRUCTURE` · `STAGE 08` · `GENERAL FINALE` · `MOMENTUM → INTERRUPTION → RECOVERY`

| 항목 | 기준 |
|---|---|
| Status | HYPOTHESIS — BLOCKOUT CANDIDATE |
| Difficulty | ★★★★ |
| Expected First Playtime | 190–260 sec |
| Expected Skilled Clear | 80–115 sec |
| Enemy | Cutter Sentry T1 ×1 + Patrol Drone T1 ×1 |
| Simultaneous Enemy Pressure | NONE — separated activation bands |
| Cutter Fire | LOWER BAND ONLY |
| Patrol Rope Cut | NONE — `no-rope-cut` |
| Transit Wake / Wind | Pulsed Wind ×1 — LONG CENTRAL TRUNK |
| Scanner | NONE |
| Moving Platform / Train Collision | NONE |
| New Player Input | NONE |
| New Rope Mode | NONE |
| Foundation | CURRENT RUNTIME — selected Foundation KEEP |
| First Specialization | CONTENT BLOCKED / NOT REQUIRED |
| New Growth | NONE |
| Legacy Artifact Layer | REMOVED FROM CURRENT RUNTIME |
| Required Kill | NONE |
| Design Checkpoint / Reward | NONE |
| Internal Boss | NONE |
| Post-Sector 04 Boss / Transition | TBD |
| Primary Role | Sector 04 전체 Rope 문법의 Continuous Finale |
| Primary Story | Upper Express Trunk LIMITED OPERATION ↔ Lower Ascent Feeder ISOLATED 병치 |
| Stage-local Completion | Reach P6 → Final Status Juxtaposition |
| Final Gate / Boss Entry | VISUAL HOLD — product transition not locked |
| `nextAreaId` | `null` / DO NOT WIRE Sector 05 |
| Runtime Status | Sector 04 authored runtime NOT CONNECTED |
| Approved Gameplay Art | HOLD until Runtime Area / Camera Zone / Stable IDs exist |

---

## 0. 기획 기준

### LOCKED FOR THIS STAGE

4-8은 Sector 04의:

```text
GENERAL FINALE
```

다.

새 기믹을 가르치지 않는다.

지금까지 배운:

```text
MOMENTUM
CUTTER
WAKE
RECOVERY
PATROL
ROPE LINE CONTROL
FOUNDATION EXPRESSION
```

을 하나의 긴 진행 흐름으로 묶는다.

### Core Question

> **“Flow가 반복해서 끊겨도, 멈춰서 전투하는 대신 다음 Rope를 만들어 Sector의 속도를 끝까지 유지할 수 있는가?”**

### Finale Grammar

```text
WAKE LAUNCH
↓
CUTTER INTERRUPTION
↓
RECOVERY
↓
WAKE RE-ACCELERATION
↓
PATROL INTERRUPTION
↓
RECOVERY
↓
FINAL CLEAN FLOW
↓
STATUS JUXTAPOSITION
```

### Sector 04 Core Loop

```text
MOMENTUM
→
INTERRUPTION
→
RECOVERY
→
MOMENTUM
```

을 4-8 전체에서 최소 두 번 반복.

### 금지

- New Threat
- New Enemy Variant
- New Input
- New Rope Mode
- New Growth
- Scanner
- Moving Platform
- Moving Train collision
- Cutter + Patrol simultaneous activation
- Patrol Rope Cut
- Kill Gate
- Internal Boss
- Sector 05 direct wiring
- Post-Sector Boss 임의 배치
- Group A/B/C Route mapping
- Isolation 원인 확정
- Corporate decision 공개

---

## 0-1. 최신 GitHub / Runtime 교차검증

### VERIFIED — CURRENT MAIN AT AUTHORING

작성 시작 시점 최신 `main`:

```text
1e46a3f805998c89d8233a6af7b89e188c499e4f
```

현재 포함:

```text
PR #505
4-7 ISOLATION JUNCTION

PR #503
4-6 POWER RELAY SPAN

PR #501
4-5 EXPRESS SHAFT

PR #500
Current Sentry Combat Stat documentation alignment
```

### Current Sector 04 Document State

```text
4-1
MERGED

4-2
MERGED / REV 1.1

4-3
MERGED / REV 1.0

4-4
MERGED / REV 1.0

4-5
MERGED / REV 1.0

4-6
MERGED / REV 1.0

4-7
MERGED / REV 1.0

4-8
THIS DOCUMENT
```

본 문서는 현재 GitHub 4-7의 Stage-local Exit:

```text
TRANSIT CONTROL TRUNK
ACCESS AHEAD
```

를 PREV candidate로 사용한다.

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

모든 Mandatory / Flow Link:

```text
< 400 px
```

### VERIFIED — CURRENT COMBAT

```text
Enemy Radius                18
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

### VERIFIED — CURRENT WIND

Current Pulsed Wind:

```text
LULL
0

WARNING
0

ACTIVE
1

DECAY
1 → 0
```

static rectangular zone 안의 Player point에 적용.

### Baseline Reuse

4-8도 기존 Sector 04 Wake baseline:

```text
Strength 360

Lull     1.75 sec
Warning  0.70 sec
Active   1.40 sec
Decay    0.30 sec
```

를 재사용한다.

---

## 0-2. Boss / Timer Boundary

### VERIFIED PRODUCT CONTRACT

각 Sector에는:

```text
GENERAL TIMER
+
SEPARATE BOSS TIMER
```

계약이 있다.

기획자가 지정한 Boss Entry에서:

```text
General Timer
STOP

General Collapse
STOP

Remaining General Time
DISCARD

Boss Timer
START
```

한다.

### 4-8 Master Contract

```text
4-8 INTERNAL BOSS
= NONE

POST-SECTOR 04 BOSS / TRANSITION
= TBD
```

### 따라서 4-8은

```text
P6 reached
```

를 Stage-local completion으로 정의하지만,

```text
P6
=
Boss Entry
```

라고 가정하지 않는다.

또:

```text
4-8 Gate
→ sector-05-01
```

도 금지.

### Final Boundary

현재:

```text
P6
→ Status Juxtaposition
→ VISUAL HOLD
```

까지만 확정.

명시적으로:

```text
P6 STAGE-LOCAL COMPLETION
≠
BOSS ENTRY

P6 REACH
DOES NOT END GENERAL TIMER BY ITSELF
```

Boss Entry가 별도로 확정되기 전에는
P6를 General Timer / Collapse 종료 지점으로 취급하지 않는다.

향후 Boss Entry / Transition이 정해지면
그 위치와 Timer semantics를 별도 integration에서 연결.

---

## 0-3. 4-7 → 4-8 Finale Handoff

### 4-7

확정:

```text
LOWER ASCENT FEEDER
ISOLATED
```

### 4-8

새 원인을 설명하지 않는다.

대신 같은 Finale 안에서:

```text
UPPER EXPRESS TRUNK
LIMITED OPERATION

vs

LOWER ASCENT FEEDER
ISOLATED
```

를 나란히 확인.

### Story Question

> **“같은 Transit Backbone인데 왜 한쪽은 제한적으로 살아 있고, 한쪽은 격리돼 있었지?”**

이 질문을 Sector 05 이후로 넘긴다.

---

## 1. 한 줄 정의

4-7 Isolation Junction에서 Lower Ascent Feeder가 실제로 `ISOLATED` 상태였음을 확인한 Player가
Sector 04의 마지막 일반 구간인 거대한 **Transit Control Trunk**에 진입해,
하나의 긴 Upward Pulsed Wake Spine을 타고 먼저 Momentum을 만든 뒤,
Lower Cutter Band에서 Rope Cut 위협 때문에 Flow가 끊겨도 Side Recovery Deck으로 빠져 다시 중앙 Wake에 진입하고,
중간 Wake-only 구간에서 Momentum을 재구축한 뒤,
Upper Patrol Band에서는 `no-rope-cut` Patrol Drone의 움직이는 압박을 통과하고 다시 Recovery한 후,
Enemy가 없는 마지막 Wake Chain으로 P6 Control Deck에 도달해
`UPPER EXPRESS TRUNK — LIMITED OPERATION`과 `LOWER ASCENT FEEDER — ISOLATED`를 같은 Control Summary에서 독립 상태로 병치해서 보고,
Post-Sector 04 Boss / Transition은 추정하지 않은 채 Finale Boundary에서 멈추는 Sector 04 General Finale.

---

## 2. 전체 게임에서의 역할

### 2-1. Sector Exam

4-8은 새 내용을 가르치지 않는다.

다시 묻는다.

```text
Can you build speed?
Can you survive a cut?
Can you recover?
Can you re-accelerate?
Can you read a moving threat?
Can you finish without stopping?
```

### 2-2. Speed Is Recovery Quality

Sector 04에서 잘한다는 것은:

```text
Never interrupted
```

만이 아니다.

핵심:

```text
Interrupted
→ recover faster
→ restore momentum
```

이다.

### 2-3. Build Expression Without Lock

Foundation마다 Finale의 편한 지점은 다르지만:

```text
NONE
IMPULSE
RELAY
SHEAR
```

모든 상태가 Mandatory clear 가능해야 한다.

### 2-4. Story Closure, Not Explanation

Sector 04 Story는:

```text
operational asymmetry
```

를 확정하고 끝낸다.

원인 설명은 하지 않는다.

---

## 3. Story 역할

### S0 — Entry

```text
TRANSIT CONTROL TRUNK

SYSTEM ACCESS
LIMITED
```

### S1 — Mid Control Status

Threat-free M0에서:

```text
UPPER EXPRESS TRUNK

LIMITED OPERATION
```

### S2 — Final P6 Control Summary

두 독립 Row:

```text
UPPER EXPRESS TRUNK
LIMITED OPERATION
```

```text
LOWER ASCENT FEEDER
ISOLATED
```

### Display Contract

두 Row 사이에:

```text
CAUSE
AUTHORIZATION
EVACUATION GROUP
PRIORITY CLASS
```

field 없음.

### Player가 확정할 수 있는 것

```text
Upper trunk
still partly operating.

Lower feeder
isolated.
```

### 아직 미확인

```text
why
who
when exact order
Group A route
Group B route
Group C route
intentional sacrifice
```

---

## 4. 공간 콘셉트

### TRANSIT CONTROL TRUNK

Sector 04에서 본 구조들을
하나의 거대한 Backbone 내부에 집약.

### Shape

```text
CENTRAL WAKE SPINE
+
SIDE RECOVERY DECKS
+
SEPARATED SECURITY BANDS
+
FINAL CONTROL DECK
```

### Spatial Rhythm

```text
CENTRAL
→ SIDE
→ CENTRAL
→ SIDE
→ CENTRAL
```

끊겼다가 다시 Trunk로 복귀하는 움직임.

### Finale Identity

4-5는:

```text
PURE CENTRAL SPEED
```

4-8은:

```text
CENTRAL SPEED
repeatedly interrupted
but restored
```

다.

---

## 5. Pixel / Grid 기준

### Base

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
1856 px

Y
0 ~ -1856
```

Sector 04 General Stage 중
가장 긴 authored blockout 후보.

### Scale

- central pressure/control spine: 320–416px visual width
- side recovery decks: 224–320px
- control ring: 384–640px
- final P6 deck: 512px+

### Readability

```text
Hook / Rope Cyan
>
Cutter
>
Patrol
>
Wake state
>
Control UI
>
Background
```

---

## 6. 전체 맵 구조

```text
Y = 0

P0 ENTRY
 \
  A0
   \
   P1 TRUNK PREVIEW
      \
       C1   ← WAKE + CUTTER
        \
         C2
          \
        R1 SIDE RECOVERY

          W3  ← WAKE RE-ACCELERATION
           \
            A3
             \
             P3 PATROL READ

               A4  ← WAKE + PATROL
                \
                 A5
                  \
                R2 SIDE RECOVERY

                  W6
                   \
                    A6
                     \
                      P6 FINAL CONTROL DECK

                       [UPPER LIMITED]
                       [LOWER ISOLATED]

                       POST-SECTOR
                       VISUAL HOLD
```

### Enemy Bands

```text
LOWER
S1 CUTTER

UPPER
D1 PATROL
```

Activation overlap 없음.

### Wake

하나의 긴:

```text
UPWARD CENTRAL ZONE
```

으로 C1~A6를 묶는다.

R1 / P3 / R2 / P6는 Wake 밖.

---

## 7. Zone 구성

### Z0 — Trunk Entry

```text
P0 → A0 → P1
```

Wake OUT.
Enemy OUT.

Sector Finale scale reveal.

### Z1 — Cutter Interruption

```text
P1 → C1 → C2
```

Wake IN.
S1 activation IN.

목표:

```text
build speed
→ Cutter threatens Rope
```

### Z2 — Recovery 1

```text
R1
```

Wake OUT.
S1 activation OUT.
D1 activation OUT.

Cutter 이후 안정.

### Z3 — Re-Acceleration

```text
R1 → W3 → A3
```

Wake IN.
Enemy activation OUT.

Sector 핵심:

```text
RECOVERY
→ MOMENTUM AGAIN
```

을 명시적으로 체험.

### Z4 — Patrol Read

```text
P3
```

Wake OUT.
D1 activation OUT.

Upper Patrol corridor 확인.

### Z5 — Patrol Interruption

```text
P3 → A4 → A5
```

Wake IN.
D1 activation IN.

Patrol:

```text
no-rope-cut
```

이므로 Cutter와 다른 Interruption.

### Z6 — Recovery 2

```text
R2
```

Wake OUT.
D1 activation OUT.

### Z7 — Final Clean Flow

```text
R2 → W6 → A6 → P6
```

Wake IN → OUT.

Enemy 없음.

마지막은 위협보다:

```text
successful regained momentum
```

으로 끝난다.

### Z8 — Final Control Summary

```text
P6
```

Wake OUT.
Enemy OUT.

Story + Stage-local completion.

---

## 8. 좌표 / 오브젝트

전부:

```text
HYPOTHESIS — BLOCKOUT
```

### 8-1. Landing / Recovery

| ID | Center | Size | Role |
|---|---:|---:|---|
| P0 | `(-448, 0)` | `320×32` | Entry |
| P1 | `(-288, -288)` | `320×32` | Trunk Preview |
| R1 | `(-256, -832)` | `288×24` | Cutter Recovery |
| P3 | `(+320, -1088)` | `288×32` | Patrol Preview |
| R2 | `(-320, -1408)` | `288×24` | Patrol Recovery |
| P6 | `(+352, -1760)` | `544×32` | Final Control Deck |

### 8-2. Grapple Targets

| ID | Position | Role |
|---|---:|---|
| A0 | `(-320, -160)` | Entry Brace |
| C1 | `(-96, -448)` | Cutter Anchor 1 |
| C2 | `(+96, -736)` | Cutter Anchor 2 |
| W3 | `(-96, -960)` | Recovery Re-entry Anchor |
| A3 | `(+96, -1024)` | Wake Re-acceleration Anchor |
| A4 | `(+96, -1216)` | Patrol Anchor 1 |
| A5 | `(-160, -1344)` | Patrol Anchor 2 |
| W6 | `(-96, -1536)` | Final Wake Anchor |
| A6 | `(+128, -1640)` | Final Trunk Anchor |

### 8-3. Cutter Sentry S1

```text
Position
(+448, -640)

Type
sentry-t1
```

### 8-4. S1 Activation

```text
X -192 ~ +192
Y -800 ~ -400
```

Membership:

```text
P1 OUT
C1 IN
C2 IN
R1 OUT
W3 OUT
```

### 8-5. Patrol Drone D1

```text
Initial
(+176, -1280)

Type
patrol-drone-t1
```

Patrol Corridor:

```text
(-208, -1280)
↔
(+208, -1280)

speed       48
waitSeconds 0.45
mode        pingpong
```

Rules:

```text
kill-optional
no-rope-cut
target-lock-cycle
activation-band-only
```

### 8-6. D1 Activation

```text
X -192 ~ +192
Y -1392 ~ -1152
```

Membership:

```text
P3 OUT
A4 IN
A5 IN
R2 OUT
W6 OUT
```

### 8-7. Transit Wake

```text
ID
sector-04-08:control-trunk-wake

Bounds
X -192 ~ +192
Y -1664 ~ -400

Direction
(0, -1)

Mode
pulsed

Strength
360

Cycle
LULL    1.75
WARNING 0.70
ACTIVE  1.40
DECAY   0.30
```

Membership:

```text
C1 IN
C2 IN
W3 IN
A3 IN
A4 IN
A5 IN
W6 IN
A6 IN

P1 OUT
R1 OUT
P3 OUT
R2 OUT
P6 OUT
```

### 8-8. Final Status Display

```text
N1
(+64, -1760)
```

Rows:

```text
UPPER EXPRESS TRUNK
LIMITED OPERATION

LOWER ASCENT FEEDER
ISOLATED
```

### 8-9. Post-Sector Boundary

Visual object 후보:

```text
sector-04-08:post-sector-access
```

표기:

```text
TRANSIT CORE ACCESS
ROUTE PENDING
```

Gameplay:

```text
NO INTERACT
NO nextAreaId
NO timer transition
```

Boss / Transition 확정 전까지만 Visual Hold.

---

## 9. Safe Route

### Route

```text
P0
→ A0
→ P1
→ C1
→ C2
→ R1
→ W3
→ A3
→ P3
→ A4
→ A5
→ R2
→ W6
→ A6
→ P6
```

### Distance Pre-check

| Link | Distance |
|---|---:|
| P0 → A0 | `204.9 px` |
| A0 → P1 | `131.9 px` |
| P1 → C1 | `249.9 px` |
| C1 → C2 | `346.1 px` |
| C2 → R1 | `364.9 px` |
| R1 → W3 | `204.9 px` |
| W3 → A3 | `202.4 px` |
| A3 → P3 | `233.0 px` |
| P3 → A4 | `258.0 px` |
| A4 → A5 | `286.2 px` |
| A5 → R2 | `172.3 px` |
| R2 → W6 | `258.0 px` |
| W6 → A6 | `247.0 px` |
| A6 → P6 | `254.1 px` |

### Result

```text
MAX SAFE LINK
= 364.9 px

CURRENT DERIVED HOOK REACH
= 400 px

MARGIN
= 35.1 px
```

### Safe Route Contract

LULL에도 clear 가능.

ACTIVE Wake는:

```text
assist
```

이지 progression key가 아니다.

### `swingImpulse = 0`

Mandatory Safe Route는
Runtime graybox에서:

```text
swingImpulse = 0
```

PASS해야 한다.

---

## 10. Flow Route

### Route

```text
P0
→ A0
→ P1
→ C1
→ C2
→ W3
→ A3
→ A4
→ A5
→ W6
→ A6
→ P6
```

R1 / P3 / R2 landing을 생략.

### 주요 거리

```text
C1 → C2
346.1 px

C2 → W3
295.0 px

W3 → A3
202.4 px

A3 → A4
192.0 px

A4 → A5
286.2 px

A5 → W6
202.4 px

W6 → A6
247.0 px
```

### Result

```text
MAX FLOW LINK
= 346.1 px
```

### Skilled Signature

```text
lower Cutter band
no full stop

↓

mid Wake
rebuild speed

↓

upper Patrol
no full stop

↓

final Wake
finish airborne
```

---

## 11. Lower Cutter Geometry

### Critical Line

S1:

```text
(+448, -640)
```

C2:

```text
(+96, -736)
```

R1 nominal exit:

```text
(-256, -832)
```

벡터:

```text
S1 → C2
(-352, -96)

C2 → R1
(-352, -96)
```

완전 collinear.

### Meaning

C2에 붙은 채
R1 방향으로 이동하는 Player는
S1 shot trajectory와 Rope near-anchor가
정렬될 가능성이 높다.

### Cut Result

Current:

```text
detach
+
0.60 sec Rope Disable
```

### Recovery

R1은:

```text
Wake OUT
S1 activation OUT
```

이다.

### Important

Cutter를 일부러 맞아야 진행하는 Stage 아님.

- early release
- arc change
- faster exit
- cut + recover

모두 유효.

---

## 12. Mid Re-Acceleration

### Why This Zone Exists

4-8에서 가장 중요한 구간 중 하나.

Cutter를 빠져나온 뒤
바로 다음 Enemy를 붙이지 않는다.

```text
R1
→ W3
→ A3
```

에서:

```text
RECOVERY
→ SPEED AGAIN
```

을 체험.

### Threat

```text
NONE
```

### Wake

```text
ACTIVE POSSIBLE
```

### Purpose

Sector 04의 핵심이:

```text
survive interruption
```

이 아니라:

```text
restore flow after interruption
```

임을 보여준다.

---

## 13. Upper Patrol Geometry

### Patrol Corridor

```text
Y -1280

X
-208 ↔ +208
```

### Rope Line

A4:

```text
(+96, -1216)
```

A5:

```text
(-160, -1344)
```

Midpoint:

```text
(-32, -1280)
```

Patrol Corridor 중앙 근처를 통과.

### Patrol Difference

D1:

```text
no-rope-cut
```

이다.

따라서 Player는:

```text
Cutter
```

를 또 상대하는 것이 아니라:

```text
moving body threat
+
moving firing origin
```

을 상대한다.

### Current Behavior

Target 없음:

```text
patrol
```

Target 획득:

```text
patrol pause
→ aim
→ fire
```

Target invalid:

```text
patrol resume
```

### Recovery

R2:

```text
Wake OUT
D1 activation OUT
```

이다.

---

## 14. Wake Finale Contract

### One Continuous Spine

4-8에서는
Wake Zone을 Enemy별로 나누지 않는다.

```text
ONE GLOBAL TRUNK PRESSURE ZONE
```

으로 사용.

### Meaning

Player가 Side Recovery로 빠지면:

```text
WAKE OFF
```

Central Trunk로 돌아오면:

```text
WAKE ON
```

### Phase

Current global elapsed-time derived.

R1/P3/R2에서 쉬었다 돌아와도
새 Cycle이 reset되지 않는다.

### Good Finale Feel

```text
same trunk
same phase
different threat
```

이어서 하나의 공간처럼 느껴져야 한다.

### Bad Finale Feel

각 Zone이 독립 Room처럼 느껴지면 FAIL.

---

## 15. Foundation Expression

### IMPULSE COIL

```text
+180 release impulse
```

유리:

- Cutter band 빠른 이탈
- R1→W3 re-accel
- Patrol band exposure compression
- final W6→A6

### RELAY LINK

```text
0.65 sec window
0.16 sec buffer
108 aim tolerance
```

유리:

- C1→C2→W3
- A4→A5→W6
- Final no-landing chain

### SHEAR CURRENT

Enemy 두 종류가 있어
optional offense 기회는 존재.

하지만:

```text
SHEAR SHOWCASE
```

가 4-8 핵심은 아니다.

4-6에서 충분히 학습했다.

### Mandatory

```text
NO Foundation
```

test state도 Safe Route 통과 가능.

---

## 16. Recovery

### R1 — Cutter Recovery

```text
(-256,-832)
```

Wake OUT.
S1 activation OUT.

### P3 — Patrol Preview

```text
(+320,-1088)
```

Wake OUT.
D1 activation OUT.

### R2 — Patrol Recovery

```text
(-320,-1408)
```

Wake OUT.
D1 activation OUT.

### Cut Recovery Target

```text
cut → stable landing ≤ 2.0 sec
cut → next successful attach ≤ 3.0 sec target
```

### Patrol Recovery Target

Body hit / miss 후:

```text
≤ 4 sec
```

안에 R2 또는 forward progression 복귀.

### Already-fired Projectile

Activation 밖으로 나와도
기존 projectile이 사라진다고 가정하지 않는다.

---

## 17. Enemy / Threat Contract

### S1

```text
Cutter Sentry T1 ×1
```

Lower only.

### D1

```text
Patrol Drone T1 ×1
```

Upper only.

### Simultaneous Activation

```text
NONE
```

S1 lower boundary:

```text
Y -800
```

D1 upper boundary starts:

```text
Y -1152
```

사이에:

```text
352 px
```

Enemy-free vertical gap.

### Patrol Rules

```text
kill-optional
no-rope-cut
target-lock-cycle
activation-band-only
```

### Kill

둘 다 Optional.

### No Generic LOS

```text
cover-ends-los
```

사용하지 않는다.

---

## 18. Final Story Juxtaposition

### Location

```text
P6
```

Threat 전부 종료 후.

### Control Summary

독립 Row A:

```text
UPPER EXPRESS TRUNK

LIMITED OPERATION
```

독립 Row B:

```text
LOWER ASCENT FEEDER

ISOLATED
```

### No Added Explanation

없음:

```text
REASON
ORDERED BY
EVAC GROUP
ACCESS TIER
PRIORITY ROUTE
```

### Story Result

Sector 04 End Question:

> **“같은 Backbone인데 왜 위쪽 Trunk는 제한적으로 살아 있고 Lower Feeder만 격리돼 있었지?”**

### Do Not Resolve Here

답은 Sector 04 일반 구간 소유가 아니다.

---

## 19. Camera

모든 값 HYPOTHESIS.

### C0 — Entry Scale

```text
P0 / A0 / P1
+
long trunk preview

Desktop 0.93
Mobile  0.70
```

### C1 — Cutter Band

```text
C1 / S1 / C2 / R1

Desktop 0.88
Mobile  0.68
```

### C2 — Re-Acceleration

```text
R1 / W3 / A3 / P3

Desktop 0.90
Mobile  0.68
```

### C3 — Patrol Band

```text
P3 / A4 / D1 / A5 / R2

Desktop 0.87
Mobile  0.68
```

### C4 — Final Flow

```text
R2 / W6 / A6 / P6

Desktop 0.90
Mobile  0.70
```

### C5 — Final Control Deck

```text
P6 / N1 / Post-Sector Visual Hold

Desktop 1.00
Mobile  0.72
```

### Speed Camera

4-8을 위해 새 Camera System을 미리 확정하지 않는다.

기존 Camera Zone으로 Next Anchor가 늦으면
별도 runtime spike.

---

## 20. Story Trigger Contract

### S0

P1 broad traversal:

```text
TRANSIT CONTROL TRUNK
SYSTEM ACCESS LIMITED
```

### S1

P3 safe preview:

```text
UPPER EXPRESS TRUNK
LIMITED OPERATION
```

### S2 — MANDATORY FINALE

P6 broad traversal:

```text
UPPER EXPRESS TRUNK
LIMITED OPERATION

LOWER ASCENT FEEDER
ISOLATED
```

### Movement

S2:

```text
NO modal
NO movement lock
NO terminal requirement
```

### Completion

S2 + P6 reach:

```text
STAGE-LOCAL COMPLETE
```

### Product Transition

```text
NOT COMPLETE / TBD
```

다른 개념.

---

## 21. Pixel Art Asset Spec

### Transit Control Trunk

- massive control spine
- pressure conduit
- trunk monitoring rails
- suspended relay frame
- lower feeder branch silhouette
- upper trunk continuation

### Cutter Band

4-2 계열 Cutter visual reuse.

### Patrol Band

기존 Patrol visual reuse.

### Wake

4-5 Express Shaft family reuse.

### Final Control Summary

한 화면 안에서:

```text
UPPER
LIMITED

LOWER
ISOLATED
```

가 읽히되
두 Row를 화살표로 연결하지 않는다.

### Post-Sector Access

Door / lift / trunk continuation silhouette는 가능.

하지만:

```text
BOSS ICON
SECTOR 05 LABEL
CORPORATE HQ LABEL
```

금지.

---

## 22. Background / Sound / VFX

### Background

#### Lower

pressure / control conduits.

#### Mid

large trunk ring.

#### Upper

patrol control bridge.

#### Final

upper continuation + lower isolated branch를
동시에 볼 수 있는 giant schematic architecture.

### Sound

#### Entry

trunk hum + pressure pulse.

#### Cutter

existing Cutter family.

#### Recovery 1

combat layer down.

#### Patrol

existing Patrol ping / lock family.

#### Recovery 2

combat layer down.

#### Final Flow

pressure rhythm + Rope sounds foreground.

#### P6

pressure sound 크게 낮추고
Control Summary tone.

### Finale Rule

마지막 Story 순간에
폭발/승리 fanfare 사용 금지.

아직 Escape 완료가 아니다.

---

## 23. Multiplayer Contract

### Shared Wake Phase

두 Player가 같은 phase.

### Separated Enemy Bands

Player A가 Lower Cutter,
Player B가 Upper Patrol에 있을 수 있다.

각 Enemy는
자기 activation eligible Player만 target.

### Cutter Cross-Rope

다른 Player Rope에 우발 cut 가능성
prototype 확인.

### Patrol

Target 하나 lock,
engaged 중 patrol pause.

### Recovery Decks

R1 / P3 / R2에서
새 acquire 없어야 한다.

### Story Summary

P6 Summary는 shared world fact.

하지만:

```text
no forced teleport
no input lock
```

### Stage-local Completion

한 Player가 P6에 먼저 도착했다고
다른 Player를 강제 이동시키지 않는다.

### Post-Sector Transition

Boss Entry semantics 확정 전
party transition 구현하지 않는다.

---

## 24. PASS Criteria

### Gameplay

- Sector 04 General Finale로 느껴짐
- 새 mechanic 없음
- Cutter exactly 1
- Patrol exactly 1
- Patrol `no-rope-cut`
- Enemy activation overlap 없음
- one continuous central Wake
- R1 / P3 / R2 Wake OUT
- R1 S1 activation OUT
- P3 / R2 D1 activation OUT
- Lower Cutter interruption
- Mid re-acceleration
- Upper Patrol interruption
- Final clean flow
- Kill Optional
- Safe max 364.9px
- Flow max 346.1px
- all Hook links < 400px
- `swingImpulse=0` Safe Route graybox PASS
- no new input
- no new Rope mode
- no Foundation lock
- no new growth

### Story

확정:

```text
UPPER EXPRESS TRUNK
LIMITED OPERATION

LOWER ASCENT FEEDER
ISOLATED
```

미확정:

```text
why
who
Group mapping
intentional sacrifice
```

### Boss Boundary

- 4-8 internal Boss 없음
- P6를 Boss Entry라고 가정하지 않음
- Sector 05 direct link 없음
- final post-sector access VISUAL HOLD
- Product-level timer transition TBD 유지

### Runtime Fidelity

- current Hook 400 derived reach
- current Combat 100 / 760 / 1.00 / 520
- Cutter current opt-out semantics
- Patrol target/pause/resume contract
- static Wind zone
- deterministic global phase
- already-fired projectile persists
- no generic LOS assumption

### Production

- Approved Gameplay Art HOLD

---

## 25. FAIL Conditions

### Gameplay

- Cutter + Patrol 동시 activation
- Patrol Rope Cut
- Recovery deck Wake 안
- Recovery deck에서 새 enemy acquire
- Flow가 Enemy kill 때문에 멈춤
- 400px 이상 Hook link
- LULL clear 불가능
- final clean flow 없이 전투 중 바로 Story 종료
- 새 기믹 필요
- Moving Platform 추가

### Story

- Upper Trunk와 Lower Feeder를 직접 원인 화살표로 연결
- Group A/B/C route mapping
- isolation reason 설명
- company intent 확정
- Escape 성공처럼 연출

### Boss / Transition

- 4-8 내부 Boss 추가
- P6 뒤 임의 Boss 구현
- `nextAreaId: sector-05-01`
- 남은 General Timer를 Boss Timer에 더함
- Boss Entry 미확정 상태에서 General Timer 종료 지점 확정

### Runtime

- old 440 fixed reach
- old Enemy combat values
- moving Wind volume
- client-local Wind phase
- `cover-ends-los` 없는 cover safety

---

## 26. 개발자 최종 전달 요약

### Stage

```text
SECTOR 04-8
TRANSIT CONTROL TRUNK
```

### Role

```text
GENERAL FINALE
```

### Core Flow

```text
WAKE LAUNCH

→ CUTTER

→ R1 RECOVERY

→ WAKE RE-ACCELERATION

→ PATROL

→ R2 RECOVERY

→ FINAL WAKE FLOW

→ P6 STATUS SUMMARY
```

### Enemy

```text
S1 Cutter ×1
Lower band

D1 Patrol ×1
Upper band
no-rope-cut
```

### Wake

```text
ONE STATIC CENTRAL ZONE

X -192 ~ +192
Y -1664 ~ -400

Direction
(0,-1)

Strength
360

Cycle
1.75 / 0.70 / 1.40 / 0.30
```

### Geometry

```text
SAFE MAX
364.9 px

FLOW MAX
346.1 px

HOOK REACH
400 px
```

### Recovery

```text
R1
Cutter recovery

P3
Patrol preview

R2
Patrol recovery
```

전부 Wake / relevant Enemy activation 밖.

### Story

```text
UPPER EXPRESS TRUNK
LIMITED OPERATION

vs

LOWER ASCENT FEEDER
ISOLATED
```

### Boss

```text
4-8 INTERNAL BOSS
NONE

POST-SECTOR 04 BOSS / TRANSITION
TBD
```

### Final Boundary

```text
P6
STAGE-LOCAL COMPLETE

POST-SECTOR ACCESS
VISUAL HOLD

nextAreaId
null
```

### Do Not Add

- new Enemy
- Scanner
- Moving Platform
- new Rope mode
- new Input
- Growth
- Artifact
- Kill Gate
- Internal Boss
- Sector 05 wiring

### Stage Feeling

> **“잘 달리다가 끊기고, 다시 속도를 만들고, 또 방해받아도 끝까지 Flow를 회복한다. 마지막에 멈춰 보니 위쪽 Trunk는 살아 있었고 Lower Feeder만 격리돼 있었다.”**

---

## OPEN QUESTIONS

### 1. Wake Zone Length

현재:

```text
Y -1664 ~ -400
```

하나의 긴 Zone.

Finale cohesion은 좋지만
phase가 지나치게 반복적으로 느껴지면
Zone을 쪼개지 않고 Visual source / camera rhythm을 먼저 조정한다.

### 2. Cutter C2 Alignment

현재:

```text
S1 → C2 → R1
```

완전 collinear.

Cut rate가 과하면:

- S1 vertical 16~32px offset
- C2 16px inward
- activation entry

순으로 조정.

### 3. P3 Wake Outside

P3를 Wake 밖에 둬
Patrol을 미리 읽게 했다.

Flow Route에서는 P3 landing을 생략 가능.

Playtest에서 Finale가 너무 자주 멈추면
P3 자체를 삭제하지 말고
Flow line을 더 명확히 한다.

### 4. Patrol Corridor

현재:

```text
-208 ↔ +208
```

A4↔A5 midpoint와 교차.

Shear opportunity가 너무 자주 우연히 발생해
Patrol threat가 사라지면 corridor / wait를 조정.

### 5. Final P6 Summary Duration

Player를 멈추지 않는다.

너무 빨리 지나가 읽지 못하면:

- trigger를 넓히기
- UI persistence 늘리기
- camera framing 조정

을 먼저 한다.

Interaction Gate로 바꾸지 않는다.

### 6. Post-Sector Boss Entry

가장 큰 OPEN.

결정 필요:

```text
Boss location
Boss identity
Boss combat
Boss timer
exact Boss Entry
4-8 → Boss transition
Boss → Sector 05 transition
```

이 결정 전:

```text
P6 post-sector access
= VISUAL HOLD
```

유지.

### 7. General Timer End

P6 Stage-local completion과
General Timer 종료는 현재 같은 사건으로 잠그지 않는다.

Boss Entry가 정해진 뒤
product timer contract에 맞춰 연결.

### 8. 4-7 Runtime Handoff

4-7은 PR #505로 GitHub merge 완료.

현재 4-8은 4-7의:

```text
TRANSIT CONTROL TRUNK

ACCESS
AHEAD
```

Exit handoff를 직접 이어받는다.

향후 4-7 실제 Runtime geometry가 구현되면:

- Gate arrival position
- first 4-8 P0 framing
- camera continuity

를 다시 검증.

### 9. Sector 04 Full Audit

4-8 완료 후:

```text
4-1 ~ 4-8
```

전체를 한 번에 다시 검증한다.

특히:

- current 400px Hook
- current Combat
- Growth / Artifact drift
- Stage repetition
- Story disclosure
- Enemy count
- Wake reuse
- final Boss boundary

를 cross-stage 기준으로 점검.

---

SECTOR 04-8 / TRANSIT CONTROL TRUNK — BLOCKOUT CANDIDATE · REV 1.0
