# SECTOR 05-2 — GLASS ATRIUM

*BLOCKOUT CANDIDATE · REV 1.0*

◀ PREV — [SECTOR 05-1 / CORPORATE THRESHOLD](../5-1/README.md) · NEXT — [SECTOR 05-3 / SECURITY REVIEW FLOOR](../5-3/README.md) ▶

`SECTOR 05 CORPORATE ZONE` · `STAGE 02` · `SPARSE HARDPOINT + PATROL TIMING` · `NO ROPE CUT`

| 항목 | 기준 |
|---|---|
| Status | HYPOTHESIS — BLOCKOUT CANDIDATE |
| Authoring Snapshot | `33bdb4997a85330c6b338a7fd06f1ae508767a93` |
| Sector Master | LOCAL REVIEWED — GitHub merge pending |
| 5-1 | LOCAL REVIEWED — GitHub merge pending |
| Difficulty | ★★★ |
| Expected First Playtime | 125–170 sec |
| Expected Skilled Clear | 50–75 sec |
| Enemy | Patrol Drone T1 ×1 |
| Patrol Rope Cut | NONE — `no-rope-cut` |
| Cutter | NONE |
| Standard Sentry | NONE |
| Wind / Transit Wake | NONE |
| Access Scan Field | NONE |
| Moving Platform / Train | NONE |
| New Player Input | NONE |
| New Rope Mode | NONE |
| Primary Spatial Rule | SEALED SURFACE / SERVICE HARDPOINT |
| Foundation | CURRENT RUNTIME — selected Foundation KEEP |
| First Specialization | CONTENT BLOCKED / NOT REQUIRED |
| New Growth | NONE |
| Legacy Artifact Layer | REMOVED FROM CURRENT RUNTIME |
| Required Kill | NONE |
| Boss | NONE |
| Stage Role | Hardpoint Commitment에 첫 Moving Threat 결합 |
| Stage-local Exit | Reach Final Atrium Deck → Gate Panel → Physical Crossing |
| Sector 05 Runtime | NOT CONNECTED |
| Approved Gameplay Art | HOLD until Runtime Area / Camera Zone / Stable IDs exist |

---

## 0. 기획 기준

### LOCKED FOR THIS STAGE

5-1에서 Player는:

```text
SEALED SURFACE
≠ ROPE TARGET

SERVICE HARDPOINT
= VALID ATTACH
```

를 Enemy 없이 배웠다.

5-2에서는 새 규칙을 추가하지 않는다.

추가되는 것은 정확히:

```text
PATROL DRONE T1 ×1
```

뿐이다.

### Core Question

> **“다음 Hardpoint가 제한돼 있을 때, Patrol의 현재 위치를 보고 언제 Commitment할 것인가?”**

### Stage Grammar

```text
SAFE PATROL PREVIEW
↓
ENTER ACTIVATION
↓
PATROL STOPS / ENGAGES
↓
HARDPOINT COMMITMENT
↓
SIDE RECOVERY
↓
EXIT ACTIVATION
↓
CLEAN CORPORATE FLOW
```

### 중요

현재 Patrol은 Target을 획득한 뒤에도
계속 좌우로 움직이는 적이 아니다.

```text
NO VALID TARGET
→ PATROL

VALID TARGET
→ PATROL PAUSE
→ AIM / FIRE

TARGET INVALID
→ PATROL RESUME
```

따라서 이번 Stage의 Timing은:

```text
“공격 중 움직이는 Drone을 추적”
```

이 아니라:

```text
“진입 전 어디에 있는 Drone을 상대할지 선택”
```

이다.

### 금지

- Cutter
- Patrol Rope Cut
- Standard Sentry 추가
- Scanner
- Wind
- New Input
- New Rope Mode
- New Growth
- Moving Platform
- Kill Gate
- Patrol이 Target 중 계속 이동한다고 가정
- Patrol이 특정 위치에 와야만 진행 가능
- 400px exact-range Mandatory
- Story terminal interaction

---

## 0-1. 최신 GitHub / Runtime 기준

### CURRENT MAIN AT AUTHORING

```text
33bdb4997a85330c6b338a7fd06f1ae508767a93
```

작성 시점 최신 `main`에는
Sector05 Runtime 추가가 없다.

### Current Hook / Rope

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

### Current Patrol Runtime

Verified behavior:

```text
patrol speed
configured per authored enemy

pingpong / loop
SUPPORTED

endpoint wait
SUPPORTED

activation bounds
patrol points are clamped inside

target 없음
→ patrol

target 있음
→ engagement
→ patrol pause

target invalid
→ patrol resume
```

### Reused T1 Baseline

Sector02 / Sector04 precedent:

```text
speed
48

waitSeconds
0.45

mode
pingpong
```

### Rules

5-2 D1:

```text
kill-optional
no-rope-cut
target-lock-cycle
activation-band-only
```

---

## 0-2. 5-1 → 5-2 → 5-3 역할

### 5-1

```text
STATIC HARDPOINT RULE
NO ENEMY
```

### 5-2

```text
STATIC HARDPOINT RULE
+
MOVING THREAT ENTRY TIMING
```

### 5-3

```text
STATIC HARDPOINT RULE
+
CUTTER
+
RECOVERY PLANNING
```

따라서 5-2에서
Rope Cut을 미리 가르치지 않는다.

---

## 1. 한 줄 정의

5-1 Corporate Threshold에서 대부분의 Corporate 마감면은 Rope를 받지 않고 드문 Service Hardpoint만 유효하다는 규칙을 학습한 Player가, 거대한 유리 Atrium의 Safe Preview Deck에서 좌우로 천천히 순찰하는 Patrol Drone 한 대와 중앙의 H2–H3 Hardpoint chain을 동시에 관찰한 뒤, Drone이 어느 쪽에 있을 때 진입할지 선택하고 Activation에 들어서는 순간 Drone이 그 위치에서 순찰을 멈춰 조준·발사를 시작하는 상황에서 제한된 Hardpoint를 빠르게 이어 Side Recovery 또는 Forward Deck으로 빠져나오며, `UPPER CONTROL NETWORK — POWERED / CONTINUITY ROUTE — AVAILABLE`이라는 상부 시스템 상태만 확인하고 다음 Security Review Floor로 이동하는 Sector05 첫 Threat Stage.

---

## 2. 전체 게임에서의 역할

### 2-1. Spatial Rule + Threat 결합

5-1:

```text
WHERE CAN I ATTACH?
```

5-2:

```text
WHEN SHOULD I COMMIT
TO THE ATTACHES I HAVE?
```

### 2-2. Patrol 재해석

4-6 Patrol은:

```text
ROPE LINE GEOMETRY
+
OPTIONAL SHEAR
```

의 일부였다.

5-2 Patrol은:

```text
ENTRY TIMING
+
SPARSE ATTACH OPTIONS
```

의 일부다.

### 2-3. Corporate Exposure

Corporate 공간은 cover가 많은 전투장이 아니다.

```text
WIDE GLASS VOID
+
FEW HARDPOINTS
+
CLEAR FIRE LINE
```

때문에 같은 Patrol도 더 통제된 Security처럼 느껴져야 한다.

### 2-4. 5-3 Preparation

5-2에서 Player가 배우는 것:

```text
hardpoint를 미리 읽고
threat 시작 전에 route를 결정
```

5-3에서는 이것이 Cutter recovery로 발전한다.

---

## 3. Story 역할

### S0 — Entry

5-1 Exit preview를 실제 상태로 이어받는다.

```text
GLASS ATRIUM

SECURITY PATROL
ACTIVE
```

### S1 — Post-Patrol Safe Deck

```text
UPPER CONTROL NETWORK

POWERED

CONTINUITY ROUTE
AVAILABLE
```

### Meaning

Player가 새로 확정:

```text
상부 Corporate control network가
사고 이후에도 powered state를 유지한다.
```

### 아직 미확인

```text
왜 upper control이 유지됐는가
무엇을 희생했는가
Lower evacuation policy
누가 결정했는가
```

### S2 — Exit

```text
SECURITY REVIEW FLOOR

ACCESS
RESTRICTED
```

5-3 preview.

---

## 4. 공간 콘셉트

### GLASS ATRIUM

Corporate Zone의
큰 수직 Lobby / Transfer Void.

### 핵심 이미지

```text
DARK GLASS
+
WHITE STRUCTURAL FRAME
+
FEW CYAN HARDPOINTS
+
ONE PATROL DRONE
```

### Atrium Identity

5-1보다:

- 더 넓은 중앙 void
- 더 긴 sightline
- 더 적은 foreground clutter
- 더 잘 보이는 Patrol silhouette

### 중요한 역설

공간이 잘 보이므로
길을 찾기는 쉽다.

하지만:

```text
valid attach options are few
```

라 Commitment가 중요하다.

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
1536 px

Y
0 ~ -1536
```

### Patrol

Current enemy visual family:

```text
24–32 px small drone class
```

### Hardpoint

```text
24–32 px
```

### Recovery

```text
224–320 px
```

### Glass Void

중앙에 큰 negative space를 유지.

---

## 6. 전체 맵 구조

```text
Y = 0

P0 ENTRY
  \
   H1
    \
     P1 SAFE PATROL PREVIEW

          H2
           \
        [ D1 PATROL ]
             \
              R1 SIDE RECOVERY
                \
                 H3
                  \
                   P2 SAFE CONTROL DECK

                      H4
                       \
                        R2
                         \
                          H5
                           \
                            H6
                             \
                              P5 FINAL
                              PANEL / GATE

Y = -1536
```

### Threat Band

실제 Patrol 압박은:

```text
H2
→ R1 / H3
```

주변 한 구간에 집중.

### After Threat

P2 이후:

```text
NO ENEMY ACTIVATION
```

으로 Corporate hardpoint flow를 다시 안정적으로 이어간다.

---

## 7. Zone 구성

### Z0 — Entry

```text
P0 → H1 → P1
```

D1 activation OUT.

목적:

- 5-1 Rule recall
- Glass Atrium scale reveal

### Z1 — Patrol Preview

```text
P1
```

D1 activation OUT.

Player가 볼 것:

- D1 current position
- full patrol corridor
- H2
- H3
- R1

### Z2 — Commitment Band

```text
P1 → H2 → R1 / H3
```

D1 activation IN.

진입 순간:

```text
Drone current patrol position
→ attack origin
```

으로 바뀐다.

### Z3 — Exit Patrol Band

```text
R1 → H3 → P2
```

P2는 activation OUT.

새 acquire 종료.

### Z4 — Clean Corporate Chain

```text
P2 → H4 → R2 → H5 → H6 → P5
```

Enemy 없음.

Stage가 전투 Room으로 끝나지 않고
다시 Rope flow로 끝난다.

---

## 8. 좌표 / 오브젝트

전부:

```text
HYPOTHESIS — BLOCKOUT
```

### 8-1. Landing / Recovery

| ID | Center | Size | Role |
|---|---:|---:|---|
| P0 | `(-512, 0)` | `352×32` | Entry |
| P1 | `(-352, -352)` | `320×32` | Safe Patrol Preview |
| R1 | `(+256, -608)` | `224×24` | Side Recovery |
| P2 | `(+320, -864)` | `320×32` | Post-Patrol Safe Deck |
| R2 | `(-256, -1120)` | `224×24` | Upper Recovery |
| P5 | `(+320, -1440)` | `448×32` | Final Atrium Deck |

### 8-2. Service Hardpoints

| ID | Position | Role |
|---|---:|---|
| H1 | `(-320, -224)` | Entry Hardpoint |
| H2 | `(-64, -512)` | Patrol Entry Hardpoint |
| H3 | `(+96, -704)` | Patrol Exit Hardpoint |
| H4 | `(+64, -960)` | Upper Central Hardpoint |
| H5 | `(-192, -1248)` | Upper Left Hardpoint |
| H6 | `(+64, -1344)` | Final Hardpoint |

### 8-3. Patrol Drone D1

```text
Initial Position
(+160, -624)

Type
patrol-drone-t1
```

Patrol Corridor:

```text
(-160, -624)
↔
(+160, -624)
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

### 8-4. D1 Activation

```text
X
-192 ~ +192

Y
-784 ~ -448
```

Membership:

```text
P1 OUT
H2 IN
R1 OUT
H3 IN
P2 OUT
```

### 8-5. Sealed Surface 후보

중앙 glass / wall parent는:

```text
grappleable:false
```

예:

```text
sector-05-02:sealed-glass-west
sector-05-02:sealed-glass-east
sector-05-02:sealed-frame-center
sector-05-02:sealed-upper-panel
```

### 8-6. Stable IDs 후보

```text
sector-05-02:hardpoint-h1
...
sector-05-02:hardpoint-h6

sector-05-02:patrol-d1
sector-05-02:p1
sector-05-02:r1
sector-05-02:p2
sector-05-02:r2
sector-05-02:p5
```

---

## 9. Safe Route

### Route

```text
P0
→ H1
→ P1
→ H2
→ R1
→ H3
→ P2
→ H4
→ R2
→ H5
→ H6
→ P5
```

### Distance Pre-check

| Link | Distance |
|---|---:|
| P0 → H1 | `295.0 px` |
| H1 → P1 | `131.9 px` |
| P1 → H2 | `329.5 px` |
| H2 → R1 | `334.1 px` |
| R1 → H3 | `186.6 px` |
| H3 → P2 | `275.3 px` |
| P2 → H4 | `273.4 px` |
| H4 → R2 | `357.8 px` |
| R2 → H5 | `143.1 px` |
| H5 → H6 | `273.4 px` |
| H6 → P5 | `273.4 px` |

### Result

```text
MAX SAFE LINK
= 357.8 px

CURRENT DERIVED HOOK REACH
= 400 px

MARGIN
= 42.2 px
```

### Safe Route Intent

Threat band 안에서는:

```text
H2 → R1 → H3
```

처럼 Recovery를 적극 사용.

Mandatory route가
Patrol timing과 max-range precision을 동시에 요구하지 않는다.

---

## 10. Flow Route

### Route

```text
P0
→ H1
→ H2
→ H3
→ H4
→ H5
→ H6
→ P5
```

P1 / R1 / P2 / R2 landing 대부분 생략.

### Distance Pre-check

| Link | Distance |
|---|---:|
| P0 → H1 | `295.0 px` |
| H1 → H2 | `385.3 px` |
| H2 → H3 | `249.9 px` |
| H3 → H4 | `258.0 px` |
| H4 → H5 | `385.3 px` |
| H5 → H6 | `273.4 px` |
| H6 → P5 | `273.4 px` |

### Result

```text
MAX FLOW LINK
= 385.3 px

CURRENT DERIVED HOOK REACH
= 400 px

MARGIN
= 14.7 px
```

### Important

```text
385.3 px
```

는 Flow-only.

Safe Route max는 357.8px.

### Playtest Risk

H1→H2 / H4→H5가
Hook Flight + Mobile Aim에서 반복 miss를 만들면:

```text
8~16 px inward
```

조정 우선.

Hook Reach를 늘리지 않는다.

---

## 11. Patrol Timing Contract

### Before Activation

P1에서 D1은:

```text
PATROL
```

상태.

Player는 D1이:

```text
LEFT
CENTER
RIGHT
```

중 어디에 있는지 보고 진입할 수 있다.

### On Activation

Player가 H2 band에 들어가
eligible target이 되면:

```text
D1 patrol pauses
```

후 공격 cycle.

### Therefore

좋은 진입:

```text
Drone far from planned Rope line
```

상태에서 Commit.

### 하지만 필수 기다리기 금지

D1이 어느 위치에 있어도:

```text
SAFE ROUTE
CLEARABLE
```

해야 한다.

### Skill Reward

좋은 timing은:

- first shot angle 감소
- exposure duration 감소
- R1 landing 없이 H3 direct 가능

정도의 이득.

---

## 12. Patrol Geometry

### D1 Corridor

```text
Y -624
X -160 ↔ +160
```

### Hardpoint Chain

```text
H2
(-64,-512)

H3
(+96,-704)
```

H2↔H3 midpoint:

```text
(+16,-608)
```

Patrol corridor 근처를 통과.

### Meaning

Player가 H2에 붙어 H3 방향으로 진행할 때:

```text
Drone position
+
Rope / Player path
```

관계가 잘 보인다.

### But Not 4-6 Again

이번 Stage의 목표는:

```text
SHEAR LINE
```

을 만드는 것이 아니다.

D1을 Rope line으로 때리는 것은
우발 optional offense일 뿐.

### No Rope Cut

D1 projectile:

```text
no-rope-cut
```

이므로 Rope를 직접 끊지 않는다.

---

## 13. Activation / Safe Deck Contract

### D1 Activation

```text
X -192 ~ +192
Y -784 ~ -448
```

### Safe Preview

P1:

```text
(-352,-352)
OUT
```

### Side Recovery

R1:

```text
(+256,-608)
OUT
```

### Post-Patrol Safe

P2:

```text
(+320,-864)
OUT
```

### Purpose

Enemy attack range 자체는 길더라도:

```text
activation membership
```

으로 새 target acquire를 제한.

### Already-fired Projectile

P1/R1/P2로 나갔다고
기존 projectile이 삭제된다고 가정하지 않는다.

즉:

```text
new acquire
STOP

already-fired shot
still readable
```

이다.

---

## 14. Recovery

### P1

Patrol 진입 전 Safe Preview.

### R1

Threat band에서 가장 중요한 Side Recovery.

목표:

```text
H2 miss
body hit
poor entry timing
```

후 즉시 안전 영역으로 빠질 수 있음.

### P2

Patrol을 빠져나온 Full Safe Deck.

Story S1 위치.

### R2

후반 Clean Chain의 일반 movement recovery.

### Recovery Target

Patrol band failure:

```text
≤ 4 sec
```

안에:

```text
R1
or
P2
```

도달.

### No Full Reset

H2/H3 실패가
P0까지 떨어지면 FAIL.

---

## 15. Enemy Behavior Contract

### D1

정확히:

```text
Patrol Drone T1 ×1
```

### Patrol

```text
48 px/s
0.45 sec wait
pingpong
```

### Engagement

Current combat timing family:

```text
Acquire
0.25 sec

Track
0.80 sec

Lock
0.20 sec

Fire
```

### Projectile

Current enemy projectile family:

```text
speed
520 px/s

damage
20
```

### Rope Cut

```text
NONE
```

반드시:

```text
no-rope-cut
```

### Kill

```text
OPTIONAL
```

Gate 조건에 Kill을 넣지 않는다.

---

## 16. Foundation Expression

### IMPULSE COIL

H2→H3 direct crossing에서:

```text
exposure compression
```

가 가장 명확.

또 H4→H5 Flow skip.

### RELAY LINK

Sparse Hardpoint 환경에서:

```text
next valid target가 적음
```

때문에 Relay consistency가 읽히기 좋다.

### SHEAR CURRENT

Enemy가 1개 있으므로
실제 Rope segment가 D1을 가로지르면
optional damage 가능.

하지만 Stage가:

```text
SHEAR TUTORIAL
```

로 변하면 FAIL.

### Mandatory

```text
NO FOUNDATION REQUIRED
```

---

## 17. Story Trigger

### S0 — Entry

P0/P1 approach.

```text
GLASS ATRIUM

SECURITY PATROL
ACTIVE
```

### S1 — P2 Safe Deck

```text
UPPER CONTROL NETWORK

POWERED

CONTINUITY ROUTE
AVAILABLE
```

### S2 — Exit

```text
SECURITY REVIEW FLOOR

ACCESS
RESTRICTED
```

### Presentation

Story는:

```text
P2
```

Threat 완전 OUT에서 읽게 한다.

Combat band에서 긴 text 없음.

---

## 18. Story Disclosure Boundary

### 이번 Stage에서 확정

```text
Upper Control Network
still powered.

Continuity route
available.
```

### 아직 숨김

```text
GRID CAPACITY CRITICAL DEFICIT
```

5-4.

```text
UPPER CONTROL / EVACUATION PRIORITY
MAINTAIN
```

5-5.

```text
LOWER ASCENT SUSPENSION
AUTHORIZED
```

5-6.

```text
LOWER SECTORS
EVACUATION SUSPENDED
```

5-7.

```text
WHO / WHY organizational directive
```

5-8.

### Accident Boundary

5-2에서:

```text
Company caused Cascade
```

암시 금지.

---

## 19. Camera

모두 HYPOTHESIS.

### C0 — Atrium Reveal

```text
P0 / H1 / P1
+
large glass void

Desktop 0.95
Mobile  0.72
```

### C1 — Patrol Preview / Commitment

```text
P1 / H2 / full D1 corridor / R1 / H3

Desktop 0.88
Mobile  0.68
```

가장 중요.

### C2 — Patrol Exit

```text
R1 / H3 / P2

Desktop 0.92
Mobile  0.70
```

### C3 — Upper Clean Chain

```text
P2 / H4 / R2 / H5

Desktop 0.90
Mobile  0.70
```

### C4 — Exit

```text
H5 / H6 / P5 / Gate

Desktop 0.96
Mobile  0.72
```

### Required Readability

P1에서 반드시 동시에:

```text
D1
H2
H3
R1
```

이 보여야 한다.

---

## 20. Gate Contract

Stage-local intent:

```text
Reach P5
→ Gate Panel
→ Gate Open
→ Physical Crossing
→ 5-3
```

### Runtime Status

Sector05 Runtime:

```text
NOT CONNECTED
```

이므로 현재는 Design Contract.

### Candidate

P5:

```text
(+320,-1440)
```

Panel:

```text
(+480,-1440)
```

Gate:

```text
(+608,-1440)
```

### No Kill Requirement

D1 생존 상태로도 Gate 사용 가능.

---

## 21. Pixel Art Asset Spec

### Glass Atrium

- tall dark glass curtain wall
- pale structural ribs
- polished bridge edge
- cyan maintenance hardpoint housing
- single patrol drone silhouette

### D1 Readability

Glass background 위에서
Drone silhouette가 묻히지 않아야 한다.

### Sealed Surface

glass 전체를 Rope Target처럼
cyan으로 강조하지 않는다.

### Hardpoint

H1~H6는 5-1과
동일 family 유지.

### Security

D1은 기존 Patrol family를 사용.

새 Corporate Patrol variant를
Gameplay requirement로 만들지 않는다.

---

## 22. Background / VFX / Sound

### Far

- suspended executive bridge
- distant office lights
- large exterior city glow
- vertical lift core

### Mid

- glass mullions
- structural braces
- sealed maintenance shafts

### Near

- sparse frame
- limited service housing

### Motion

D1 외에 큰 Gameplay motion 없음.

### Sound

P1:

```text
quiet HVAC
+
distant patrol motor
```

Activation:

```text
target acquire / lock audio
```

기존 family reuse.

### Exit

Combat layer를 줄이고
P2/P5에서 corporate ambience 복귀.

---

## 23. Multiplayer Contract

### Shared D1

한 Patrol Drone을 공유.

### Eligible Target

Activation 안의 Player만
새 target 후보.

### Different Pace

Player A:

```text
H2/H3 activation
```

Player B:

```text
P1 preview
```

동시 가능.

### P1 Safety

B가 P1에 있는 동안
새 acquire 대상이 되면 안 된다.

### R1 Safety

R1도 새 acquire 없음.

### Existing Projectile

A를 향해 발사된 projectile이
R1/P1의 다른 Player 방향으로 지나갈 수 있는지
추후 multiplayer playtest.

### Gate

```text
shared open
individual crossing
```

유지.

---

## 24. PASS Criteria

### Gameplay

- Patrol exactly 1
- `no-rope-cut`
- Cutter 0
- Standard Sentry 0
- Wind 0
- Scanner 0
- Moving Platform 0
- P1 activation OUT
- H2 activation IN
- R1 activation OUT
- H3 activation IN
- P2 activation OUT
- D1 corridor가 P1에서 전부 보임
- 모든 D1 위치에서 Safe Route clear 가능
- 좋은 entry timing은 보상만 제공
- Safe max 357.8px
- Flow max 385.3px
- all links <400px
- no new input
- no new Rope mode
- no Growth
- no Foundation lock
- Kill Optional

### Story

- Upper Control Network POWERED만 확정
- Continuity Route AVAILABLE
- lower evacuation policy 미공개
- next Security Review Floor만 preview

### Production

- Runtime implementation HOLD
- Approved Gameplay Art HOLD
- 5-1/5-3 actual Runtime wiring 없음

---

## 25. FAIL Conditions

### Gameplay

- Patrol이 Target 중 계속 순찰한다고 전제
- 특정 Patrol endpoint까지 기다려야 clear 가능
- Patrol projectile이 Rope를 자름
- H2/H3 외 큰 glass wall이 무료 grappleable
- R1이 activation 안
- P2가 activation 안
- Safe Route가 380~400px precision 위주
- D1 Kill이 Gate 조건
- Shear가 Mandatory
- Scanner/Wind를 추가해 난이도 상승
- one miss → P0 reset

### Story

- 5-2에서 Capacity Deficit 공개
- Lower evacuation suspension 공개
- Corporate priority 결정 공개
- Named villain 등장
- accident conspiracy 암시

### Production

- Sector05 Runtime 구현 시작
- 5-2 Art 승인
- 5-3 Cutter를 실제 pre-spawn
- direct 5-1→5-2→5-3 catalog wiring

---

## 26. 개발자 / 기획자 최종 전달 요약

### Stage

```text
SECTOR 05-2
GLASS ATRIUM
```

### Core

```text
SPARSE HARDPOINT
+
ONE PATROL DRONE
```

### Question

```text
When do I commit
when the attach options are already known?
```

### Patrol

```text
D1

corridor
(-160,-624)
↔
(+160,-624)

speed
48

wait
0.45

mode
pingpong

no-rope-cut
```

### Activation

```text
X -192 ~ +192
Y -784 ~ -448
```

### Safe / Threat

```text
P1 OUT

H2 IN

R1 OUT

H3 IN

P2 OUT
```

### Geometry

```text
SAFE MAX
357.8 px

FLOW MAX
385.3 px

HOOK REACH
400 px
```

### Story

```text
UPPER CONTROL NETWORK
POWERED

CONTINUITY ROUTE
AVAILABLE
```

### Do Not Add

- Cutter
- Standard Sentry
- Wind
- Scanner
- New Mechanic
- Growth
- Kill Gate
- Boss

### Stage Feeling

> **“붙을 곳은 이미 보인다. 문제는 저 Patrol이 어디에 있을 때 이 몇 개 안 되는 Hardpoint에 몸을 던질지다.”**

---

## OPEN QUESTIONS

### 1. D1 Corridor Width

현재:

```text
320 px
```

후보.

Patrol timing 차이가 거의 느껴지지 않으면:

```text
384~448 px
```

확장 가능.

단 activation과 Hardpoint geometry를 함께 재검산.

### 2. P1 Preview Duration

Player가 강제로 기다릴 필요는 없다.

P1에서:

```text
0.5~1.0 sec glance
```

만으로 corridor를 이해할 수 있는 framing이 목표.

### 3. H1→H2 Flow 385.3px

Flow-only narrow margin.

Mobile에서 반복 실패하면
H2를 8~16px 왼쪽/아래쪽으로 보정해
Flow margin을 넓힌다.

### 4. H4→H5 Flow 385.3px

Threat가 끝난 뒤의 Flow-only link.

5-2가 불필요하게 어려워지면
이쪽을 먼저 줄인다.

Patrol 구간 난이도와
후반 Rope precision을 동시에 올리지 않는다.

### 5. R1 Position

현재 Activation x 최대:

```text
+192
```

R1:

```text
+256
```

64px 밖.

체감상 이미 발사된 projectile 때문에
Recovery가 불안하면 R1을 +32~64px 더 바깥으로 이동하고
H2→R1 / R1→H3 거리 재검산.

### 6. Patrol Engagement Freeze

현재 design은 Target 획득 시
Patrol이 멈추는 Runtime을 전제로 한다.

향후 Runtime이 바뀌면
5-2 timing identity를 반드시 재검토.

### 7. Story S1 Wording

```text
CONTINUITY ROUTE
AVAILABLE
```

가 5-5의 Priority Reveal을 너무 일찍 암시하면:

```text
CONTROL ROUTE
AVAILABLE
```

로 약화 가능.

### 8. 5-3 Handoff

5-3은:

```text
CUTTER ×1
+
SPARSE HARDPOINT
+
RECOVERY PLANNING
```

이 핵심.

5-2 Exit에서는:

```text
SECURITY REVIEW FLOOR
ACCESS RESTRICTED
```

까지만 보여주고
Cutter capability를 미리 설명하지 않는다.

---

SECTOR 05-2 / GLASS ATRIUM — BLOCKOUT CANDIDATE · REV 1.0
