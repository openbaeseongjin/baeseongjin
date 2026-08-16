# SECTOR 04-6 — POWER RELAY SPAN

*BLOCKOUT CANDIDATE · REV 1.1 — GATE COORDINATE FIX / 4-1 DRIFT FALSE ALARM RESOLVED*

◀ PREV — [SECTOR 04-5 / EXPRESS SHAFT](../4-5/README.md) · NEXT — [SECTOR 04-7 / ISOLATION JUNCTION](../4-7/README.md) ▶

`SECTOR 04 TRANSIT / INFRASTRUCTURE` · `STAGE 06` · `ROPE GEOMETRY COMBAT` · `CUTTER / PATROL SEPARATED`

| 항목 | 기준 |
|---|---|
| Status | HYPOTHESIS — BLOCKOUT CANDIDATE |
| Difficulty | ★★★☆ |
| Expected First Playtime | 150–210 sec |
| Expected Skilled Clear | 65–95 sec |
| Enemy | Cutter Sentry T1 ×1 + Patrol Drone T1 ×1 |
| Simultaneous Enemy Pressure | NONE — separated activation bands |
| Cutter Fire | LOWER BAND ONLY |
| Patrol Rope Cut | NONE — `no-rope-cut` |
| Transit Wake / Wind | NONE |
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
| Boss | NONE |
| Primary Role | Rope Line Geometry를 이동·회피·공격 판단에 동시에 사용 |
| Primary Space | Power Relay Bridge / Transit Grid Coupling Span |
| Exit | Reach Final Deck → Gate Panel → Gate Open → Physical Crossing |
| Runtime Status | Sector 04 standalone catalog AUTHORED & VALIDATED (4-1~4-8) — 메인 월드 NOT CONNECTED |
| Approved Gameplay Art | HOLD until Runtime Area / Camera Zone / Stable IDs exist |

---

## 0. 기획 기준

### LOCKED FOR THIS STAGE

4-6은 4-5의:

```text
PURE MOVEMENT JOY
```

직후 처음으로 다시 Enemy를 넣는다.

하지만 4-3처럼:

```text
ENVIRONMENTAL FORCE
+
CUTTER
```

를 결합하지 않는다.

이번 질문은 오직:

```text
ROPE LINE
+
ENEMY POSITION
```

이다.

### Core Question

> **“다음 Anchor만 보는 것이 아니라, 지금 만들어진 Rope Line이 적과 어떤 관계인지 읽을 수 있는가?”**

### Stage Grammar

```text
LOWER
CUTTER SENTRY
+
STATIC ROPE LINE GEOMETRY

↓

M0
FULL SAFE RESET

↓

UPPER
PATROL DRONE
+
MOVING ENEMY / ROPE LINE GEOMETRY

↓

FINAL SAFE FLOW
```

### 핵심 차이

4-2:

```text
Cutter가 Rope를 자르는 법을 배움
```

4-6:

```text
내 Rope Line 자체를
공격각 / 위험각으로 읽음
```

### 금지

- Cutter + Patrol 동시 Activation
- Wake
- Scanner
- Moving Platform
- New Enemy AI
- Kill Gate
- 특정 Foundation 요구
- Rope Cut Patrol
- `cover-ends-los`
- Arena Combat
- Lower Feeder Isolation Reveal
- New Growth

---

## 0-1. 최신 GitHub / Runtime 교차검증

### VERIFIED — CURRENT MAIN AT AUTHORING

작성 시작 시점 최신 `main`:

```text
1a4e7ffa4cad91be0f66461374b4301bebeeaa9e
```

현재 `main`에는:

```text
4-1
4-2
4-3
4-4
4-5
```

상세 문서가 병합돼 있다.

PR #501:

```text
SECTOR 04-5
EXPRESS SHAFT
```

까지 반영됐다.

따라서 4-6은
현재 GitHub 4-5의 Final Role:

```text
PURE HIGH-SPEED ROPE FLOW
→
4-6 COMBAT GEOMETRY
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

4-6 모든:

```text
MANDATORY
+
FLOW
```

링크는:

```text
< 400 px
```

로 설계한다.

### VERIFIED — CURRENT COMBAT

```text
Player Weapon Range         320
Player Weapon Damage        10
Player Fire Interval        0.65

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

### VERIFIED — CURRENT CUTTER

Enemy projectile:

```text
canCutRope
=
!rules.includes("no-rope-cut")
```

따라서 Lower Sentry는:

```text
no-rope-cut
```

을 넣지 않는다.

### VERIFIED — CURRENT PATROL

Current Patrol Runtime:

```text
target 없음
→ patrol

target 있음
→ patrol 정지
→ aim / attack cycle

target가 activation 밖
→ target clear
→ patrol resume
```

### Current Patrol Baseline

Sector 02의 Production baseline:

```text
speed       48
waitSeconds 0.45
mode        pingpong
```

rules:

```text
kill-optional
no-rope-cut
target-lock-cycle
activation-band-only
```

4-6도 같은 T1 behavior를 재사용한다.

---

## 0-2. Current Foundation Alignment

### VERIFIED — Foundation Runtime

Current Foundation:

```text
IMPULSE COIL
RELAY LINK
SHEAR CURRENT
```

실제 효과:

```text
IMPULSE
+180 release impulse

RELAY
0.65 sec release window
0.16 sec attach buffer
108 aim tolerance

SHEAR
20 damage
segment tolerance 4
```

### 4-6의 핵심 Build Expression

4-5는 Movement Foundation 표현이 중심이었다.

4-6에서는 처음으로 Sector 04에서:

```text
SHEAR
```

가 명시적으로 읽히는 Geometry를 준다.

### IMPORTANT

```text
SHEAR
= OPTIONAL OFFENSE
```

다.

Mandatory progression key가 아니다.

### Enemy Health

```text
100
```

Shear:

```text
20
```

따라서:

```text
1 Shear
≠ instant kill
```

이다.

### First Specialization

Runtime complete로 가정하지 않는다.

```text
NOT REQUIRED
```

### Legacy Artifact

없음.

---

## 0-3. 4-5 → 4-6 → 4-7 Rhythm

### 4-5

```text
NO ENEMY
UPWARD WAKE
PURE SPEED
```

### 4-6

```text
NO WAKE
2 ENEMIES
SEQUENTIAL / SEPARATED
ROPE GEOMETRY
```

### 4-7

```text
CUTTER + WAKE
STORY PRESSURE
LOWER FEEDER ISOLATION REVEAL
```

따라서 4-6은:

```text
MOVEMENT PEAK
→
COMBAT GEOMETRY
→
STORY SYNTHESIS
```

중앙 단계.

---

## 1. 한 줄 정의

4-5 Express Shaft에서 Enemy 없이 Wake-assisted 고속 상승을 충분히 즐긴 Player가
도시의 Transit / Power Backbone이 교차하는 **Power Relay Span**에 진입해,
하단에서는 Stationary Cutter Sentry와 C1–C2 사이의 긴 Rope Line을 이용해
자신의 Rope가 Cutter Projectile에 노출되는 동시에 Shear Current가 있다면 Sentry를 가로지르는 공격선으로도 사용할 수 있고,
완전 안전한 M0 Relay Deck에서 전투 상태를 초기화한 뒤,
상단에서는 `no-rope-cut` Patrol Drone이 좌우로 움직이는 Corridor를 A4–A5 Rope Line이 가로지르도록 설계해
정적인 Cutter Geometry와 움직이는 Enemy Geometry의 차이를 연속해서 체험한 후,
Threat가 없는 Final Deck을 통해 4-7 Isolation Junction으로 진입하는 Rope Geometry Combat Stage.

---

## 2. 전체 게임에서의 역할

### 2-1. Movement → Combat Reconnection

4-5:

```text
Rope = movement
```

감각을 최고점까지 올렸다.

4-6:

```text
Rope = movement
+
defense
+
offense geometry
```

로 다시 넓힌다.

### 2-2. Shear Readability Stage

Shear를 선택한 Player는:

> **“적에게 다가가서 공격하는 것이 아니라, Rope Line을 적 위로 통과시키는 것”**

을 명확히 경험할 수 있다.

### 2-3. Non-Shear Validity

Impulse / Relay Player도:

- 더 빠른 exposure exit
- 더 안정적인 chain
- 기존 Weapon

으로 동일 Stage 통과.

### 2-4. 4-7 Preparation

4-7은 다시 Cutter+Wake를 결합한다.

4-6에서는 Wake를 완전히 제거해:

```text
ENEMY GEOMETRY
```

에만 집중하게 한다.

---

## 3. Story 역할

4-6은 Story Reveal Stage가 아니다.

### S0 — Entry

```text
POWER RELAY SPAN

GRID COUPLING
ACTIVE
```

### S1 — Mid Relay Deck

```text
TRANSIT POWER FEED

REDUNDANT CHANNEL
ONLINE
```

### S2 — Exit

```text
JUNCTION CONTROL

ROUTING SECURITY
AHEAD
```

### 의미

확인:

```text
Transit system과 Power routing이
같은 protected backbone 일부를 공유한다.
```

### 아직 미확인

```text
Lower Feeder Isolation
why segmented
who ordered routing
Group C causality
```

### 금지

4-4의:

```text
SEGMENTED
```

정보를 다시 설명하지 않는다.

4-7의:

```text
ISOLATED
```

도 아직 공개하지 않는다.

---

## 4. 공간 콘셉트

### POWER RELAY SPAN

하나의 큰 Power / Transit Coupling 구조 안에
두 개의 독립 Security Span이 있다.

```text
LOWER CUTTER SPAN
↓
MID RELAY DECK
↓
UPPER PATROL SPAN
```

### Lower

정적인:

```text
C1
SENTRY
C2
```

삼각/직선 관계.

### Mid

넓고 안전한:

```text
M0
```

### Upper

움직이는:

```text
PATROL CORRIDOR
```

를 Rope Line이 가로지름.

### No Formal Route Menu

3-7처럼:

```text
OUTER / PRIORITY / SERVICE
```

route identity를 만들지 않는다.

하나의 연속 Span.

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
1568 px

Y
0 ~ -1568
```

### Spatial Scale

4-5보다
vertical speed는 줄고
horizontal/diagonal Span 읽기가 늘어난다.

### Gameplay Target Priority

```text
Rope / Hook Cyan
> Enemy silhouette
> Projectile
> Power background
```

### Power Visual

- transformer bridge
- busbar support
- relay conductor
- insulated coupler
- service catwalk

---

## 6. 전체 맵 구조

```text
Y = 0

P0 ENTRY
 \
  A0
   \
   P1 SAFE CUTTER READ
        \
         C1
           \
            [S1 CUTTER]
               \
                C2
                  \
                   M0 FULL SAFE RELAY DECK

                       A3
                        \
                        P3 SAFE PATROL READ
                           \
                            A4
                              \
                       [D1 PATROL CORRIDOR]
                                \
                                 A5
                               /
                             R2
                              \
                               P4 FINAL SAFE
                               PANEL / GATE

Y = -1568
```

### Threat Structure

```text
S1 LOWER ACTIVATION
ENDS

↓

SAFE GAP

↓

D1 UPPER ACTIVATION
STARTS
```

Activation overlap:

```text
NONE
```

---

## 7. Zone 구성

### Z0 — Entry / Cutter Read

```text
P0 → A0 → P1
```

P1:

```text
S1 activation OUT
D1 activation OUT
```

Cutter telegraph / C1 / C2를 읽는다.

### Z1 — Lower Cutter Span

```text
P1 → C1 → C2 → M0
```

C1 / C2:

```text
S1 activation IN
```

D1은 아직 완전히 비활성.

### Z2 — M0 Full Reset

```text
M0
```

두 Activation 모두 OUT.

목적:

- Cutter pressure 완전 종료
- incoming projectile 확인
- upper Patrol read 전 rhythm reset

### Z3 — Patrol Read

```text
M0 → A3 → P3
```

P3:

```text
D1 activation OUT
```

Drone corridor / A4 / A5를 읽는다.

### Z4 — Upper Patrol Span

```text
P3 → A4 → A5 → R2
```

A4 / A5:

```text
D1 activation IN
```

S1은 완전히 비활성.

### Z5 — Final Exit

```text
R2 → P4
```

D1 activation OUT.

Gate 완전 Safe.

---

## 8. 좌표 / 오브젝트

모두:

```text
HYPOTHESIS — BLOCKOUT
```

### 8-1. Landing / Recovery

| ID | Center | Size | Role |
|---|---:|---:|---|
| P0 | `(-480, 0)` | `320×32` | Entry |
| P1 | `(-288, -256)` | `320×32` | Safe Cutter Read |
| M0 | `(+160, -768)` | `448×32` | Full Safe Relay Deck |
| P3 | `(+352, -1024)` | `288×32` | Safe Patrol Read |
| R2 | `(-320, -1312)` | `256×24` | Upper Recovery |
| P4 | `(-256, -1472)` | `416×32` | Final Safe Deck |

### 8-2. Grapple Targets

| ID | Position | Role |
|---|---:|---|
| A0 | `(-352, -128)` | Entry Brace |
| C1 | `(-96, -416)` | Cutter Line Anchor 1 |
| C2 | `(+256, -576)` | Cutter Line Anchor 2 |
| A3 | `(+320, -928)` | Mid-to-Upper Brace |
| A4 | `(+160, -1120)` | Patrol Line Anchor 1 |
| A5 | `(-192, -1248)` | Patrol Line Anchor 2 |

### 8-3. Cutter Sentry S1

```text
Position
(+80, -496)

Type
sentry-t1
```

Activation:

```text
X -160 ~ +352
Y -704 ~ -352
```

Rules:

```text
kill-optional
target-lock-cycle
activation-band-only
```

중요:

```text
NO "no-rope-cut"
```

따라서 current Runtime에서 Cutter capable.

### 8-4. Patrol Drone D1

```text
Initial Position
(+208, -1184)

Type
patrol-drone-t1
```

Activation:

```text
X -448 ~ +448
Y -1360 ~ -1056
```

Patrol:

```text
(-240, -1184)
↔
(+208, -1184)

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

### 8-5. Gate

```text
Panel
(-80, -1472)

Gate
(-48, -1472)
```

D1 activation 밖.

---

## 9. Safe Route

### Route

```text
P0
→ A0
→ P1
→ C1
→ C2
→ M0
→ A3
→ P3
→ A4
→ A5
→ R2
→ P4
```

### Distance Pre-check

| Link | Distance |
|---|---:|
| P0 → A0 | `181.0 px` |
| A0 → P1 | `143.1 px` |
| P1 → C1 | `249.9 px` |
| C1 → C2 | `386.7 px` |
| C2 → M0 | `214.7 px` |
| M0 → A3 | `226.3 px` |
| A3 → P3 | `101.2 px` |
| P3 → A4 | `214.7 px` |
| A4 → A5 | `374.6 px` |
| A5 → R2 | `143.1 px` |
| R2 → P4 | `172.3 px` |

### Result

```text
MAX SAFE LINK
= 386.7 px

CURRENT DERIVED HOOK REACH
= 400 px

MARGIN
= 13.3 px
```

### Important

```text
386.7
```

은 Mandatory Safe Route 기준으로
400에 비교적 가깝다.

Runtime Hook Flight에서 Aim 부담이 크면:

```text
C1 x -96
→ -80

or

C2 x +256
→ +240
```

처럼 16px inward 조정을 우선한다.

### `swingImpulse = 0`

Mandatory Safe Route:

```text
swingImpulse = 0
```

graybox PASS 필수.

---

## 10. Flow Route

### Route

```text
P0
→ A0
→ P1
→ C1
→ C2
→ M0
→ A3
→ A4
→ A5
→ P4
```

P3 / R2 landing 생략.

### 주요 거리

```text
C1 → C2
386.7 px

M0 → A3
226.3 px

A3 → A4
249.9 px

A4 → A5
374.6 px

A5 → P4
233.0 px
```

### Result

```text
MAX FLOW LINK
= 386.7 px
```

### Flow Meaning

4-6의 Flow Route는:

```text
더 긴 거리
```

보다:

```text
enemy activation 안에서
landing / exposure time 감소
```

가 Skill Reward.

---

## 11. Lower Cutter Geometry

### Static Shear Line

C1:

```text
(-96, -416)
```

C2:

```text
(+256, -576)
```

S1:

```text
(+80, -496)
```

S1은 정확히:

```text
C1 ↔ C2
```

선분의 중점에 놓인다.

### Meaning

Player가:

```text
C1 attached
→ swing / move toward C2 side
```

인 순간,

현재 Rope Segment:

```text
C1
→ Player
```

가 S1을 가로지를 수 있다.

그때 Shear Player가 Release하면:

```text
20 damage opportunity
```

### Important

```text
C1 → C2 Anchor-to-Anchor line
```

자체가 공격판정이라는 뜻이 아니다.

실제 Shear는:

```text
CURRENT ANCHOR
→ CURRENT PLAYER POSITION
```

segment를 Release 순간 검사한다.

### Non-Shear

Impulse / Relay / no-Foundation test도
C1 → C2를 정상 통과 가능.

S1 kill 불필요.

---

## 12. Upper Patrol Geometry

### Patrol Corridor

```text
Y -1184

X
-240 ↔ +208
```

### Rope Line

A4:

```text
(+160, -1120)
```

A5:

```text
(-192, -1248)
```

A4 ↔ A5 선분의 중앙은:

```text
(-16, -1184)
```

이다.

즉 Patrol corridor의 중앙을 통과한다.

### Shear Opportunity

D1이 Corridor 중앙 근처일 때:

```text
A4 attached
+
Player moving toward A5 side
```

Rope line이 D1을 가로지를 가능성이 높다.

### Difference from Lower

Lower:

```text
STATIC
predictable Shear line
```

Upper:

```text
MOVING
timing-dependent Shear line
```

### Important

D1을 Rope로 맞히기 위해
Player가 기다려야만 진행 가능하면 FAIL.

Shear는 Optional reward.

---

## 13. Activation / Threat Separation

### S1 Lower Band

```text
X -160 ~ +352
Y -704 ~ -352
```

Membership:

```text
P1 OUT
C1 IN
C2 IN
M0 OUT
```

### D1 Upper Band

```text
X -448 ~ +448
Y -1360 ~ -1056
```

Membership:

```text
M0 OUT
A3 OUT
P3 OUT
A4 IN
A5 IN
R2 IN
P4 OUT
```

### Issue — R2

R2는 현재 좌표상 D1 activation 안이다.

따라서 R2를:

```text
true recovery-safe deck
```

으로 쓰려면
activation lower edge를 올리거나
R2를 아래로 이동해야 한다.

### REV 1.0 DESIGN DECISION

R2는 Recovery이므로
새 acquire를 막는다.

D1 activation을:

```text
Y -1280 ~ -1056
```

로 축소한다.

최종:

```text
X -448 ~ +448
Y -1280 ~ -1056
```

Membership:

```text
P3 OUT
A4 IN
A5 IN
R2 OUT
P4 OUT
```

### Final Threat Overlap

Lower S1 bottom:

```text
-704
```

Upper D1 top:

```text
-1056
```

사이:

```text
352 px vertical full-safe gap
```

M0 / A3 / P3가 이 reset rhythm을 소유.

---

## 14. Enemy Behavior Contract

### Cutter Sentry S1

Stationary.

Current attack:

```text
Acquire 0.25
Track   0.80
Lock    0.20
Fire
```

Projectile:

```text
520 px/s
canCutRope = true
```

### Patrol D1

Target 없음:

```text
48 px/s pingpong patrol
0.45 sec endpoint wait
```

Target 있음:

```text
patrol pauses
locks / fires
```

### Rope Cut

D1:

```text
no-rope-cut
```

유지.

즉 Upper band 질문은:

```text
moving body-threat
+
rope geometry
```

이지 두 번째 Cutter가 아니다.

### No Generic LOS

둘 다:

```text
cover-ends-los
```

사용하지 않는다.

Visual cover를 안전하다고 설명하지 않는다.

### Already-fired Projectile

Player가 Activation 밖으로 나가도:

```text
already-fired projectile
```

은 사라진다고 가정하지 않는다.

M0 / R2 진입 직후
기존 projectile trajectory는 계속 읽어야 한다.

단:

```text
new acquire / new fire
```

는 Activation 밖에서 멈춘다.

---

## 15. Foundation Expression

### IMPULSE COIL

Lower:

```text
C1 → C2
exposure compression
```

Upper:

```text
A4 → A5
Patrol band 빠른 이탈
```

### RELAY LINK

```text
C1 release
→ C2 next Hook

A4 release
→ A5 next Hook
```

chain consistency.

### SHEAR CURRENT

4-6의 대표 Foundation expression.

#### Lower

```text
STATIC guaranteed-readable opportunity
```

#### Upper

```text
MOVING timing opportunity
```

### No Foundation

Mandatory clear 가능.

### First Specialization

필요 없음.

---

## 16. Recovery

### M0

```text
FULL SAFE RELAY DECK
```

두 Enemy activation 밖.

목적:

- Lower threat 종료
- next threat preview
- combat rhythm reset

### P3

Upper Patrol read용 Safe Deck.

D1 activation 밖.

### R2

Final adjusted D1 activation 기준:

```text
OUTSIDE
```

Upper Recovery.

### Recovery Target

Enemy band에서 실패 후:

```text
≤ 4 sec
```

내 safe deck / next attempt.

### Cutter Cut

Lower C1/C2에서 Rope Cut:

```text
0.60 sec rope disable
```

후 M0 또는 lower geometry로 recovery.

### No Full Reset

Upper A5 miss가 P0까지 떨어지는 구조 금지.

---

## 17. Camera

모든 값 HYPOTHESIS.

### C0 — Entry / Cutter Read

```text
P0 / A0 / P1 / C1 / S1

Desktop 0.94
Mobile  0.70
```

### C1 — Lower Cutter Span

```text
C1 / S1 / C2 / M0

Desktop 0.90
Mobile  0.68
```

필수:

```text
C1-C2 spatial line
+
S1
+
escape deck
```

동시 가시.

### C2 — Mid Reset

```text
M0 / A3 / P3
+
upper D1 silhouette

Desktop 0.94
Mobile  0.70
```

### C3 — Patrol Span

```text
P3 / A4 / D1 corridor / A5 / R2

Desktop 0.88
Mobile  0.68
```

### C4 — Exit

```text
R2 / P4 / Gate

Desktop 1.00
Mobile  0.72
```

### Off-screen Fire

Projectile Speed 520 기준:

```text
off-screen first shot
= FAIL
```

---

## 18. Story Trigger

### S0 — Entry

```text
POWER RELAY SPAN

GRID COUPLING
ACTIVE
```

### S1 — M0

```text
TRANSIT POWER FEED

REDUNDANT CHANNEL
ONLINE
```

### S2 — Exit

```text
JUNCTION CONTROL

ROUTING SECURITY
AHEAD
```

### Story Rhythm

S1은 M0에서
Player가 이미 Threat 밖일 때 보여준다.

Combat 중 긴 Story 표시 없음.

---

## 19. Pixel Art Asset Spec

### Lower Cutter Span

- power relay conductor
- protected Sentry mount
- insulated crossbar
- Cutter charge core

### Upper Patrol Span

- horizontal relay bridge
- cable bus corridor
- patrol guide lights
- moving Drone silhouette

### M0

넓은 neutral maintenance relay deck.

### Color

```text
Rope / Hook
CYAN

Cutter
HOT ORANGE / WHITE

Patrol projectile
existing enemy danger RED/ORANGE

Power relay
muted amber / white
```

### Important

Power conductor가
grappleable Anchor처럼 보이지 않게 한다.

---

## 20. Background / Parallax

### Far

- high-voltage trunk
- transformer core silhouette
- power distribution bus
- transit relay frame

### Mid

- conductor rings
- static service cranes
- cable bundles
- insulator arrays

### Motion

- electrical pulse
- indicator travel
- distant turbine rotation

### Gameplay Motion

```text
Patrol Drone only
```

Moving terrain 없음.

---

## 21. Sound / VFX

### Entry

4-5 pressure roar를 끄고:

```text
electrical hum
+
relay pulse
```

로 전환.

### Cutter

4-2/4-3 Cutter family 그대로 reuse.

### Patrol

기존 Patrol ping / lock / projectile family.

### Shear

4-6에서는 Shear hit가
가장 읽혀야 한다.

- line-cut flash
- short enemy hit accent
- no huge explosion

### M0

두 Enemy band 사이에서
음향적으로도 명확한 quiet gap.

---

## 22. Multiplayer Contract

### Separate Threat Bands

Player A가 Lower Cutter에 있고
Player B가 Upper Patrol에 있을 수 있다.

각 Enemy activation은
자기 Band Player만 eligible target으로 본다.

### Cutter Cross-Rope

S1 projectile이
다른 Player Rope를 우발적으로 자를 수 있는지
2P prototype에서 확인.

### Patrol

D1은 현재 target 하나를 lock.

Target을 잡으면 patrol pause.

### Safe Decks

M0 / P3 / R2에서
새 acquire 없어야 한다.

### Already-fired Projectile

Safe Deck 진입 직후
기존 projectile이 사라지지는 않는다.

### Gate

```text
shared open
individual physical crossing
```

유지.

### No Party Teleport

한 Player가 P4 도착해도
다른 Player를 threat band에서 강제 이동시키지 않는다.

---

## 23. Playtest Metrics

### Lower Cutter

```text
shots
ropeCuts
bodyHits
time in activation
S1 kills
Shear hits on S1
```

### Mid Reset

```text
time on M0
incoming projectile after activation exit
```

### Upper Patrol

```text
time in activation
D1 shots
D1 patrol pause duration
D1 kills
Shear hits on D1
R2 recovery count
```

### Foundation

#### Impulse

```text
activation exposure duration
landing skips
```

#### Relay

```text
C1→C2 / A4→A5 successful next-hook
```

#### Shear

```text
optional enemy damage events
```

### Desired Result

Player가:

> **“적을 죽이려고 멈춘 것이 아니라, 지나가는 Rope Line이 자연스럽게 공격이 됐다.”**

라고 느끼면 성공.

---

## 24. PASS Criteria

### Gameplay

- 4-5와 즉시 다른 Combat rhythm
- Wake 없음
- Cutter Sentry 정확히 1
- Patrol Drone 정확히 1
- 두 Enemy activation overlap 없음
- M0 complete reset 존재
- P3 safe Patrol preview
- R2 activation 밖 recovery
- S1 Cutter capable
- D1 `no-rope-cut`
- C1/C2 static Shear opportunity
- A4/A5 dynamic Patrol Shear opportunity
- Kill Optional
- Safe max 386.7px
- Flow max 386.7px
- 모든 Hook link < 400px
- `swingImpulse=0` Safe Route graybox PASS
- no new input
- no new Rope mode
- no Foundation lock
- no new growth

### Runtime Fidelity

- Patrol target 중 이동 멈춤 반영
- target invalid 시 patrol resume 반영
- already-fired projectile persists 고려
- generic LOS 가정 안 함
- current Combat 760 / 520 / 1.00 사용

### Story

확인:

```text
Transit / Power backbone coupling remains active.
```

미확인:

```text
Lower Feeder Isolation
Group C causality
Corporate routing decision
```

### Production

- no Wake dependency
- no Moving Platform dependency
- Approved Gameplay Art HOLD

---

## 25. FAIL Conditions

### Gameplay

- S1과 D1이 동시에 Player를 공격
- Lower / Upper 둘 다 Cutter
- Patrol까지 Rope Cut
- M0에서도 새 target acquire
- P3에서도 새 target acquire
- R2가 Patrol activation 안
- Shear가 필수 Kill Key
- 400px 이상 Hook link
- exact reach-limit test가 핵심
- Enemy를 죽일 때까지 Gate 잠김
- 4-5와 동일한 순수 speed stage로 느껴짐

### Runtime

- Patrol이 target을 잡아도 계속 움직인다고 가정
- activation 밖 projectile 즉시 삭제 가정
- `cover-ends-los` 없이 cover safety 주장
- old Enemy speed / health / range 사용
- Moving Platform 추가
- Wake 재추가

### Story

- Lower Feeder `ISOLATED` 공개
- `SEGMENTED` 원인 확정
- Group C와 Power Relay 직접 연결
- Corporate decision 공개

---

## 26. 개발자 최종 전달 요약

### Stage

```text
SECTOR 04-6
POWER RELAY SPAN
```

### Threat Order

```text
LOWER
CUTTER SENTRY ×1

↓

M0
FULL SAFE RESET

↓

UPPER
PATROL DRONE T1 ×1
NO ROPE CUT
```

### Lower Geometry

```text
C1 (-96,-416)
S1 (+80,-496)
C2 (+256,-576)
```

S1:

```text
C1↔C2 segment midpoint
```

Shear optional line.

### Upper Geometry

```text
A4 (+160,-1120)
A5 (-192,-1248)

D1 corridor
X -240 ↔ +208
Y -1184
```

A4↔A5 midpoint:

```text
(-16,-1184)
```

Patrol corridor와 교차.

### Activation

```text
S1
X -160 ~ +352
Y -704 ~ -352

D1
X -448 ~ +448
Y -1280 ~ -1056
```

Overlap:

```text
NONE
```

### Patrol

```text
speed 48
wait 0.45
pingpong
no-rope-cut
```

### Geometry

```text
SAFE MAX
386.7 px

FLOW MAX
386.7 px

HOOK REACH
400 px
```

### Foundation

```text
IMPULSE
exposure compression

RELAY
chain consistency

SHEAR
optional Rope-line offense
```

### Do Not Add

- Wake
- Scanner
- Moving Platform
- new Enemy type
- new Input
- new Rope Mode
- Growth
- Artifact
- Kill Gate
- Boss

### Stage Feeling

> **“Rope는 이동선이면서 위험선이고, 잘 그으면 그대로 공격선도 된다.”**

---

## OPEN QUESTIONS

### 1. C1 → C2 Reach Margin

```text
386.7 / 400
```

margin이 13.3px로 작다.

Runtime Hook Flight에서 초행 Aim 부담이 크면
16px inward patch를 우선.

### 2. Static Shear Frequency

S1은 C1↔C2 midpoint에 정확히 있지만
실제 Shear는 Player position 기반.

Playtest에서 Shear 기회가 너무 드물면:

- S1 위치
- C1/C2 height
- Player release corridor

를 조정.

Shear auto-hit 범위 자체는 먼저 늘리지 않는다.

### 3. Patrol Corridor

현재:

```text
-240 ↔ +208
```

폭 448px.

Upper Shear timing이 너무 랜덤하면
corridor를 줄이거나 wait point를 조정.

새 Patrol AI는 만들지 않는다.

### 4. R2 Activation Boundary

최종 D1 lower edge:

```text
Y -1280
```

R2:

```text
Y -1312
```

32px 차이.

Enemy radius / camera readability까지 고려해
실제 prototype에서는 48~64px 추가 여유를 줄 수 있다.

### 5. Cutter Opt-in Hardening

Current:

```text
absence of no-rope-cut
```

semantics 유지.

Sector 04 production integration 전에
positive opt-in rule로 바꿀지는 계속 시스템 이슈.

### 6. 4-5 Runtime Handoff

4-5는 PR #501로 GitHub merge 완료.

현재 4-6은 4-5의:

```text
UPPER EXPRESS TRUNK
LIMITED OPERATION
```

상태 이후:

```text
POWER RELAY SPAN
GRID COUPLING ACTIVE
```

로 이어진다.

향후 4-5 실제 Runtime geometry가 구현되면:

- Gate arrival position
- 4-6 P0 framing
- camera continuity

를 다시 검증.

### 7. 4-7 Story Handoff

4-6 Exit:

```text
JUNCTION CONTROL
ROUTING SECURITY AHEAD
```

까지만.

4-7에서 처음:

```text
CONTAINMENT ROUTING
ACTIVE

LOWER ASCENT FEEDER
ISOLATED
```

를 확정한다.

### 8. 4-1 Geometry Drift — FALSE ALARM (RESOLVED)

4-1의 Flow Route `A3 → A4 = 408.9px > 400px Hook Reach`는 실제로는 문제가 아니었다.
4-1의 Mandatory Safe Route는 같은 구간을 `A3 → M1 → A4`로 우회해 400px 이내로
통과하며, shipped `Sector04AreaCatalog.js`도 이 좌표 그대로 구현·검증돼 있다.
좌표 교정은 필요하지 않았다(4-1 §9/§10 참고).

---

SECTOR 04-6 / POWER RELAY SPAN — BLOCKOUT CANDIDATE · REV 1.1
