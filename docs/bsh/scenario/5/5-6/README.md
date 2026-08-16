# SECTOR 05-6 — INCIDENT COMMAND ANNEX

*BLOCKOUT CANDIDATE · REV 1.0*

◀ PREV — [SECTOR 05-5 / CORPORATE TRANSFER HALL](../5-5/README.md) · NEXT — [SECTOR 05-7 / EVACUATION ARCHIVE](../5-7/README.md) ▶

`SECTOR 05 CORPORATE ZONE` · `STAGE 06` · `BODY-SHOT ROUTE vs ROPE-CUT ROUTE` · `SUSPENSION AUTHORIZATION REVEAL`

| 항목 | 기준 |
|---|---|
| Status | HYPOTHESIS — BLOCKOUT CANDIDATE |
| Authoring Snapshot | `33bdb4997a85330c6b338a7fd06f1ae508767a93` |
| Sector Master | LOCAL REVIEWED — GitHub merge pending |
| 5-1 ~ 5-5 | LOCAL REVIEWED — GitHub merge pending |
| Difficulty | ★★★★ |
| Expected First Playtime | 165–220 sec |
| Expected Skilled Clear | 65–95 sec |
| Enemy | Standard Sentry T1 ×1 + Cutter Sentry T1 ×1 |
| Simultaneous Enemy Activation | NONE — mutually exclusive route bands |
| Standard Sentry Rope Cut | NONE — `no-rope-cut` |
| Cutter Rope Cut | ACTIVE |
| Patrol | NONE |
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
| Stage Role | 같은 Annex Void에서 Body-shot 실패비용과 Rope-cut 실패비용 중 하나를 진입 전 선택 |
| Story Role | `LOWER ASCENT ROUTING — SUSPENSION AUTHORIZED / POST-CASCADE` 최초 확정 |
| Stage-local Exit | Reach Final Command Deck → Gate Panel → Physical Crossing |
| Sector 05 Runtime | NOT CONNECTED |
| Approved Gameplay Art | HOLD until Runtime Area / Camera Zone / Stable IDs exist |

---

## 0. 기획 기준

### LOCKED FOR THIS STAGE

5-4:

```text
CAPACITY
CRITICAL DEFICIT
```

5-5:

```text
UPPER CORE CONTROL
MAINTAIN

UPPER EVACUATION CAPACITY
MAINTAIN
```

까지 확인했다.

5-6에서는 다음 인과 단계로 간다.

> **“그 Priority가 실제 Lower Ascent 중단 승인으로 이어졌는가?”**

Gameplay 질문:

> **“같은 Sparse Hardpoint 공간에서, Health를 위협하는 Route와 Rope continuity를 위협하는 Route 중 어느 실패 비용을 감수할 것인가?”**

### Core Grammar

```text
SAFE ANNEX PREVIEW
↓
READ TWO COMMITMENT ROUTES

LEFT
STANDARD SENTRY
BODY-SHOT RISK

RIGHT
CUTTER SENTRY
ROPE-CUT RISK

↓
CHOOSE ONE
↓
CROSS ONE ACTIVATION BAND
↓
RECOVERY / MERGE
↓
M0 FULL SAFE COMMAND DECK
↓
AUTHORIZATION REVEAL
```

### 핵심

두 Enemy가 같은 공간에 존재하지만:

```text
SIMULTANEOUS ACTIVATION
NONE
```

이다.

Player는:

```text
one route
=
one dominant enemy pressure
```

만 처리한다.

### 금지

- 두 Enemy 동시 Target
- unavoidable crossfire
- Standard Sentry Rope Cut
- Cutter를 피하려면 Standard Route가 강제되는 구조
- Standard를 피하려면 Cutter Route가 강제되는 구조
- 어느 한 Route가 특정 Foundation 전용
- Patrol
- Scanner
- Wind
- Moving Platform
- New Input
- New Rope Mode
- New Growth
- Kill Gate
- `LOWER SECTORS EVACUATION SUSPENDED` 결과 공개
- 최종 조직명 공개
- Company-caused-accident framing

---

## 0-1. 최신 GitHub / Runtime 기준

### CURRENT MAIN AT AUTHORING

```text
33bdb4997a85330c6b338a7fd06f1ae508767a93
```

작성 시점 최신 `main`에는
Sector05 Runtime 구현이 없다.

### CURRENT ROPE

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

### CURRENT COMBAT

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
Rope Disabled On Cut        0.60 sec
```

### Current Enemy Capability

Projectile 생성 시:

```text
canCutRope
=
rules.includes("cutter-fire")
```

(`src/game/combat/EnemyObject.js`, positive opt-in semantics)

따라서:

Standard Sentry:

```text
cutter-fire
```

부여하지 않음. `no-rope-cut`도 함께 명시해 authoring 의도를 남긴다.

Cutter:

```text
cutter-fire
```

명시적으로 추가해야 한다(§8-7).

### Current Collision Priority

Cutter projectile이
현재 Rope segment와 먼저 겹치면:

```text
rope-cut
```

Body collision은:

```text
!ropeHit
```

일 때만 처리.

따라서 Rope Cut branch는
Body hit과 동일 사건으로 중첩되지 않는다.

### Important

Cutter Route라고 해서:

```text
Health damage impossible
```

은 아니다.

Projectile이 Rope를 만나지 않고
Body를 맞히면 20 damage 가능.

정확한 표현:

```text
DOMINANT RISK
=
ROPE CONTINUITY
```

이다.

---

## 0-2. 5-5 → 5-6 → 5-7 역할

### 5-5

```text
CAPACITY SHORTAGE
→
UPPER CAPABILITY PRESERVATION PRIORITY
```

### 5-6

```text
PRIORITY
→
LOWER ASCENT ROUTING
SUSPENSION AUTHORIZED
```

### 5-7

```text
AUTHORIZATION
→
LOWER SECTORS
EVACUATION SUSPENDED
```

### 따라서

5-6은:

```text
ACTION AUTHORIZED
```

까지만 확정.

실제 전체 Evacuation Outcome은
5-7 소유.

---

## 1. 한 줄 정의

5-5 Corporate Transfer Hall에서 부족한 Capacity 속에서도 Upper Core Control과 Upper Evacuation Capacity가 유지 대상으로 지정됐음을 확인한 Player가 Incident Command Annex의 넓고 깨끗한 Command Void에 진입해, P1 Safe Preview에서 왼쪽의 `no-rope-cut` Standard Sentry Route와 오른쪽의 Cutter Sentry Route를 동시에 읽은 뒤, 왼쪽에서는 제한된 B1–B2 Service Hardpoint를 따라 Body-shot과 Knockback 위험을 감수하거나 오른쪽에서는 C1–C2 Hardpoint를 따라 Rope Cut과 0.60초 재연결 지연 위험을 감수하는 두 Commitment 중 하나를 선택하고, 어느 Route에서도 상대편 Enemy Activation에는 들어가지 않은 채 RB/RC Recovery를 거쳐 M0 Safe Command Deck으로 합류한 뒤, Threat가 완전히 종료된 상태에서 `INCIDENT RESPONSE / POST-CASCADE / LOWER ASCENT ROUTING / SUSPENSION AUTHORIZED`를 확인해 Lower Ascent의 중단이 단순 장애가 아니라 사고 이후 승인된 대응 조치였음을 처음 확정하지만, 그 결과 Lower-sector evacuation 전체가 실제로 중단됐다는 최종 Outcome과 승인 조직의 정확한 Identity는 아직 보지 못한 채 5-7 Evacuation Archive로 이동하는 Sector05 Policy-Action Stage.

---

## 2. 전체 게임에서의 역할

### 2-1. Route Choice Returns, But With Failure Cost

Sector03의 Route Choice는:

```text
Security state
+
route timing
```

중심이었다.

5-6은:

```text
same destination
+
different failure cost
```

가 핵심.

### 2-2. Left Route

```text
STANDARD SENTRY
no-rope-cut

dominant consequence
BODY HIT
20 damage + knockback
```

### 2-3. Right Route

```text
CUTTER SENTRY

dominant consequence
ROPE CUT
0.60 sec rope disable
+
recovery delay
```

### 2-4. Neither Is Correct Answer

```text
SAFE ROUTE A
and
SAFE ROUTE B
```

모두 Foundation 없이 clear 가능.

### 2-5. Story Mirrors Gameplay

Gameplay:

```text
choose which cost to accept
```

Story:

```text
organization chose which capability to preserve
```

를 같은 Stage에서 병치한다.

단 Gameplay 선택을
Corporate moral choice와 직접 동일시하는
대사/라벨은 넣지 않는다.

---

## 3. Story 역할

### S0 — Entry

```text
INCIDENT COMMAND ANNEX

RESPONSE CONTROL
ACTIVE
```

### S1 — Route Merge / M0 — MANDATORY

Threat 완전 종료 후.

```text
INCIDENT RESPONSE

POST-CASCADE

LOWER ASCENT ROUTING
SUSPENSION AUTHORIZED
```

### Player가 확정할 수 있는 것

```text
Lower Ascent의 중단은
단순 고장이나 자동 isolation만이 아니라

Cascade 이후
Incident Response 과정에서
승인된 조치였다.
```

### 아직 확정할 수 없는 것

```text
Lower-sector evacuation 전체가
실제로 중단됐는가?

누가 정확히 승인했는가?

개별 임원인가?
조직인가?

Group A/B/C가 누구였는가?
```

### S2 — Exit

```text
EVACUATION ARCHIVE

POST-INCIDENT RECORDS
AHEAD
```

5-7 preview.

---

## 4. 공간 콘셉트

### INCIDENT COMMAND ANNEX

Corporate Continuity Zone 내부의
보조 Command / Routing authorization space.

### Shape

```text
ONE LARGE VOID
+
LEFT SERVICE ROUTE
+
RIGHT SECURITY ROUTE
+
CENTER SAFE MERGE
```

### Visual Character

- large white command wall
- dark glass control volume
- recessed authorization panels
- few cyan Service Hardpoints
- two distant security nodes
- strong central negative space

### Important

두 Route가:

```text
red route / blue route
```

처럼 UI로 과도하게 색칠되지 않는다.

Player는 Enemy silhouette와
Hardpoint position으로 비용을 읽는다.

---

## 5. Pixel / Grid 기준

### Base Grid

```text
32 px
```

### Map Hypothesis

```text
WIDTH
1664 px

X
-832 ~ +832

HEIGHT
1664 px

Y
0 ~ -1664
```

### Hardpoint

```text
24–32 px
```

### Route Separation

좌우 Route center 간:

```text
~448–640 px
```

수평 차이를 유지.

### Visual Priority

```text
Hardpoint
>
Enemy
>
Projectile
>
Story authorization panel
>
background
```

---

## 6. 전체 맵 구조

```text
Y = 0

P0 ENTRY
  \
   H1
    \
     P1 SAFE ROUTE PREVIEW

          LEFT BODY ROUTE              RIGHT CUTTER ROUTE

          B1                           C1
           \                           /
            B2                       C2
             \                       /
              RB                   RC
                \                 /
                 \               /
                    M0 SAFE COMMAND DECK
                    [AUTHORIZATION REVEAL]
                           \
                            H4
                             \
                              H5
                               \
                                P5 FINAL
                                PANEL / GATE

Y = -1664
```

### Enemy Placement

왼쪽 Route를
오른쪽/중앙의 Standard Sentry가 압박.

오른쪽 Route를
왼쪽/중앙의 Cutter가 압박.

하지만 Target eligibility는
각 Route Activation으로 분리.

---

## 7. Zone 구성

### Z0 — Entry / Route Preview

```text
P0 → H1 → P1
```

두 Enemy activation 모두 OUT.

P1에서 동시에 보여야 함:

```text
B1 / B2 / RB
S1 Standard

C1 / C2 / RC
S2 Cutter
```

### Z1-A — Body-shot Route

```text
P1 → B1 → B2 → RB
```

S1 activation IN.

S2 activation OUT.

### Z1-B — Rope-cut Route

```text
P1 → C1 → C2 → RC
```

S2 activation IN.

S1 activation OUT.

### Z2 — Route Merge

```text
RB / RC → M0
```

둘 다 관련 activation OUT.

### Z3 — Command Story

```text
M0
```

Threat 없음.

Mandatory S1 Authorization Reveal.

### Z4 — Clean Exit

```text
M0 → H4 → H5 → P5
```

Enemy activation 없음.

5-7 전에 전투 리듬을 정리.

---

## 8. 좌표 / 오브젝트

전부:

```text
HYPOTHESIS — BLOCKOUT
```

### 8-1. Common Landing

| ID | Center | Size | Role |
|---|---:|---:|---|
| P0 | `(-448, 0)` | `352×32` | Entry |
| P1 | `(0, -352)` | `448×32` | Route Preview / Fork |
| M0 | `(0, -992)` | `512×32` | Safe Command Merge |
| P5 | `(+192, -1504)` | `448×32` | Final Command Deck |

### 8-2. Common Hardpoints

| ID | Position | Role |
|---|---:|---|
| H1 | `(-224, -192)` | Entry Hardpoint |
| H4 | `(+128, -1152)` | Post-Story Hardpoint |
| H5 | `(-128, -1312)` | Final Hardpoint |

### 8-3. Body-shot Route

| ID | Position | Role |
|---|---:|---|
| B1 | `(-256, -544)` | Standard Route Entry |
| B2 | `(-224, -704)` | Standard Route Commitment |
| RB | `(-352, -832)` | Body-shot Recovery |

### 8-4. Cutter Route

| ID | Position | Role |
|---|---:|---|
| C1 | `(+256, -544)` | Cutter Route Entry |
| C2 | `(+224, -704)` | Cutter Route Commitment |
| RC | `(+352, -832)` | Cut Recovery |

### 8-5. Standard Sentry S1

```text
Position
(+64, -640)

Type
sentry-t1
```

Rules:

```text
standard-projectile
no-rope-cut
kill-optional
target-lock-cycle
activation-band-only
```

### 8-6. S1 Activation

```text
X
-320 ~ -96

Y
-800 ~ -480
```

Membership:

```text
P1 OUT
B1 IN
B2 IN
RB OUT

C1 OUT
C2 OUT
RC OUT

M0 OUT
```

### 8-7. Cutter S2

```text
Position
(-32, -448)

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

### 8-8. S2 Activation

```text
X
+96 ~ +320

Y
-800 ~ -480
```

Membership:

```text
P1 OUT

B1 OUT
B2 OUT
RB OUT

C1 IN
C2 IN
RC OUT

M0 OUT
```

### 8-9. Sealed Surface 후보

```text
sector-05-06:sealed-body-route
sector-05-06:sealed-center-command
sector-05-06:sealed-cutter-route
sector-05-06:sealed-auth-wall
sector-05-06:sealed-exit
```

모두:

```text
grappleable:false
```

후보.

---

## 9. Safe Route

5-6은 두 개의 Safe Route를 가진다.

### Safe Route A — Body-shot

```text
P0
→ H1
→ P1
→ B1
→ B2
→ RB
→ M0
→ H4
→ H5
→ P5
```

### Distance A

| Link | Distance |
|---|---:|
| P0 → H1 | `295.0 px` |
| H1 → P1 | `275.3 px` |
| P1 → B1 | `320.0 px` |
| B1 → B2 | `163.2 px` |
| B2 → RB | `181.0 px` |
| RB → M0 | `386.7 px` |
| M0 → H4 | `204.9 px` |
| H4 → H5 | `301.9 px` |
| H5 → P5 | `373.2 px` |

### Safe Route B — Cutter

```text
P0
→ H1
→ P1
→ C1
→ C2
→ RC
→ M0
→ H4
→ H5
→ P5
```

### Distance B

좌우 대칭:

```text
P1 → C1
320.0

C1 → C2
163.2

C2 → RC
181.0

RC → M0
386.7
```

나머지 공통.

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

386.7px는:

```text
RB / RC
→
M0 SAFE MERGE
```

의 Threat-out 연결.

Enemy activation 안의 Mandatory link는
최대 320px.

---

## 10. Flow Route

### Flow A — Body-shot

```text
P0
→ H1
→ P1
→ B1
→ B2
→ M0
→ H4
→ H5
→ P5
```

### Flow B — Cutter

```text
P0
→ H1
→ P1
→ C1
→ C2
→ M0
→ H4
→ H5
→ P5
```

### Route-specific Distances

```text
B2 / C2 → M0
364.9 px
```

### Result

```text
MAX FLOW LINK
= 373.2 px
```

공통:

```text
H5 → P5
373.2 px
```

### Design Intent

숙련 Player는:

```text
RB / RC
```

Recovery를 생략.

Route 선택 자체가
속도 선택이 아니라 실패비용 선택으로 남는다.

---

## 11. Standard Route Contract

### Enemy

```text
S1 Standard Sentry
```

### Rope Cut

```text
NONE
```

### Dominant Failure

```text
BODY HIT
20 damage
+
knockback
```

### Important

Body hit이 반드시 발생하는 Route 아님.

좋은 Player는:

- projectile arc 읽기
- early release
- fast B1→B2 transition
- RB landing skip

으로 무피해 통과 가능.

### Recovery

RB:

```text
S1 activation OUT
```

### Route Identity

> **“Rope continuity는 안정적이지만, 몸이 맞으면 Health를 잃는다.”**

정도의 읽기.

---

## 12. Cutter Route Contract

### Enemy

```text
S2 Cutter Sentry
```

### Rope Cut

```text
ACTIVE
```

### Critical Geometry

```text
S2
(-32,-448)

C2
(+224,-704)

RC
(+352,-832)
```

벡터:

```text
S2 → C2
(+256,-256)

C2 → RC
(+128,-128)
```

따라서:

```text
S2 → C2 → RC
COLLINEAR
```

### Meaning

C2에 붙고 RC 방향으로 빠질 때
Cutter projectile path와 Rope near-anchor가
겹치기 쉬움.

### Not Guaranteed

- early release
- arc change
- fast exit

로 Cut 회피 가능.

### Recovery

RC:

```text
S2 activation OUT
```

Cut 이후:

```text
0.60 sec disable
+
Hook launch
+
flight
```

를 거쳐 M0 방향 재연결.

### Route Identity

> **“Health보다 Rope continuity가 흔들릴 가능성이 높은 Route.”**

단 Body hit 가능성은 여전히 존재.

---

## 13. Mutual Exclusivity Contract

### S1 Activation

```text
X -320 ~ -96
```

### S2 Activation

```text
X +96 ~ +320
```

### Neutral Gap

```text
X -96 ~ +96
```

사이에:

```text
192 px
```

폭의 no-acquire corridor.

### Result

Body Route Player:

```text
S1 only
```

Cutter Route Player:

```text
S2 only
```

### Route Switch

중간에 다른 Route로 건너가려는
숙련 행동 자체를 물리적으로 막지 않는다.

다만 cross-center movement를 하면:

```text
one activation exit
→ neutral
→ other activation enter
```

순서여야 함.

동시 Target은 없음.

---

## 14. Recovery / Merge

### RB

```text
(-352,-832)
```

Standard Route Recovery.

### RC

```text
(+352,-832)
```

Cutter Route Recovery.

### M0

```text
(0,-992)
```

두 Route가 합쳐지는
Full Safe Command Deck.

### Contract

M0:

```text
S1 activation OUT
S2 activation OUT
```

### Already-fired Projectile

RB/RC/M0 진입 시
기존 projectile이 즉시 사라진다고 가정하지 않는다.

### Recovery Target

Standard Route body hit / miss:

```text
≤ 4 sec
```

안에 RB 또는 M0.

Cutter Route cut:

```text
stable RC landing
≤ 2 sec target

next attach
≤ 3 sec target
```

---

## 15. Foundation Expression

### IMPULSE COIL

둘 다:

```text
activation exposure compression
```

이득.

Cutter Route에서 특히
C2 exit가 빨라짐.

### RELAY LINK

Sparse route chain의
B1→B2 / C1→C2에서 유리.

### SHEAR CURRENT

각 Enemy와 Rope segment 관계에 따라
optional damage 가능.

하지만:

```text
ROUTE CHOICE
```

를 Shear 유무로 고정하면 FAIL.

### Mandatory

```text
NO FOUNDATION REQUIRED
```

---

## 16. Difficulty / Fairness Contract

### 두 Route는 동일 난이도일 필요 없음

Playstyle에 따라:

- 현재 Health
- Foundation
- Cutter confidence
- body projectile dodge confidence

때문에 선호가 달라질 수 있다.

### 하지만

한 Route가 명백한 정답이면 FAIL.

### Playtest Target

선호 분포가:

```text
100 : 0
```

으로 고정되면 원인 분석.

### 먼저 조정할 것

- Camera
- recovery visibility
- activation entry
- enemy placement

### 마지막에 조정할 것

- combat stats

Stage-specific Damage / Projectile Speed를 바꾸지 않는다.

---

## 17. Story Trigger

### S0 — Entry

```text
INCIDENT COMMAND ANNEX

RESPONSE CONTROL
ACTIVE
```

### S1 — M0 Mandatory Reveal

Threat OUT.

```text
INCIDENT RESPONSE

POST-CASCADE

LOWER ASCENT ROUTING
SUSPENSION AUTHORIZED
```

### S2 — Exit

```text
EVACUATION ARCHIVE

POST-INCIDENT RECORDS
AHEAD
```

### Presentation

- no terminal requirement
- no movement lock
- broad traversal volume
- no combat text during Route
- no long paragraph

---

## 18. Story Disclosure Boundary

### 5-4

```text
CAPACITY SHORTAGE
```

### 5-5

```text
UPPER CAPABILITY
MAINTAIN PRIORITY
```

### 5-6

```text
LOWER ASCENT ROUTING
SUSPENSION AUTHORIZED
POST-CASCADE
```

### 이번 Stage에서 새로 확정

Lower Ascent Isolation은:

```text
mere technical failure
```

만이 아니었다.

사고 후:

```text
authorized response action
```

이었다.

### 아직 미확정

```text
LOWER SECTORS
EVACUATION SUSPENDED
```

5-7.

### 아직 미확정

정확한 조직명:

```text
INCIDENT CONTINUITY CONTROL
```

등은 5-8.

### 중요

Authorization 사실이:

```text
intended casualties
```

를 뜻하지 않는다.

---

## 19. Camera

모두 HYPOTHESIS.

### C0 — Annex Entry

```text
P0 / H1 / P1
+
two Route silhouettes

Desktop 0.90
Mobile 0.68
```

### C1 — Full Route Preview

가장 중요.

```text
P1
S1
B1/B2/RB
S2
C1/C2/RC

Desktop 0.82
Mobile 0.64
```

### C2-A — Body Route

```text
B1 / B2 / S1 / RB / M0

Desktop 0.88
Mobile 0.68
```

### C2-B — Cutter Route

```text
C1 / C2 / S2 / RC / M0

Desktop 0.88
Mobile 0.68
```

### C3 — M0 Story

```text
RB / RC / M0 / Authorization Display

Desktop 0.96
Mobile 0.72
```

### C4 — Exit

```text
M0 / H4 / H5 / P5 / Gate

Desktop 0.92
Mobile 0.70
```

### Required

P1에서:

```text
both enemy types
+
both recoveries
+
both first/second hardpoints
```

가 동시에 읽혀야 한다.

---

## 20. Gate Contract

Stage-local intent:

```text
Reach P5
→ Gate Panel
→ Gate Open
→ Physical Crossing
→ 5-7
```

### Runtime

Sector05:

```text
NOT CONNECTED
```

현재 Design Contract.

### Candidate

P5:

```text
(+192,-1504)
```

Panel:

```text
(+352,-1504)
```

Gate:

```text
(+480,-1504)
```

### Kill

두 Enemy 모두 Optional.

Gate condition에 Kill 없음.

---

## 21. Pixel Art Asset Spec

### Annex Architecture

- white command wall
- dark central glass void
- recessed response panel
- sparse maintenance seam
- left/right route symmetry
- cyan Service Hardpoints

### Standard Sentry

기존 normal Sentry family.

### Cutter

기존 Cutter family.

### Route Readability

Enemy projectile 위험 종류가
시각적으로 구분돼야 한다.

특히 Cutter-specific telegraph는
Runtime production gate에서 검증 필요.

### Authorization Display

```text
POST-CASCADE
LOWER ASCENT ROUTING
SUSPENSION AUTHORIZED
```

neutral white / muted amber.

### 금지

- blood-red abandonment icon
- death count
- Lower worker silhouette
- executive portrait
- villain stamp

---

## 22. Background / VFX / Sound

### Background

- command mezzanine
- sealed routing core
- dark control glass
- upper administrative bridge
- hidden power/data spine

### Audio — P1

두 Enemy를 미리 구분:

Standard:

```text
normal security hum
```

Cutter:

```text
distinct Cutter readiness cue
```

### M0

Combat layer clear down.

### Story

authorization confirmation tone.

악역 reveal sting 금지.

---

## 23. Multiplayer Contract

### Route Split

Player A:

```text
Body Route
```

Player B:

```text
Cutter Route
```

동시 진행 가능.

### Enemy Eligibility

S1은 Body activation Player만.

S2는 Cutter activation Player만.

### Cross-route Projectile

물리 projectile이
다른 Route를 가로질러 Partner에게 닿을 수 있는지는
향후 Runtime playtest 대상.

### Cutter Cross-Rope

S2 projectile이
Target이 아닌 Partner Rope를 자를 수 있는지도
추후 검증.

### M0

두 Player가 합류 가능한 shared Safe Deck.

### Story

Authorization fact는 shared world fact.

### Gate

```text
shared open
individual crossing
```

---

## 24. PASS Criteria

### Gameplay

- Standard Sentry exactly 1
- Cutter exactly 1
- Patrol 0
- Standard `no-rope-cut`
- Cutter canCutRope
- S1 / S2 activation overlap 없음
- P1 both OUT
- B1/B2 S1 IN, S2 OUT
- C1/C2 S2 IN, S1 OUT
- RB/RC both OUT
- M0 both OUT
- both Routes Foundation-free clearable
- Kill Optional
- Safe max 386.7px
- Flow max 373.2px
- enemy-active Mandatory links ≤320px
- Cutter line `S2 → C2 → RC` collinear
- no new input
- no new Rope mode
- no Growth

### Story

- POST-CASCADE 명시
- Lower Ascent Routing Suspension AUTHORIZED 확정
- Lower-sector evacuation outcome 미공개
- Final organization identity 미공개
- accident intentionality 미확정 / 부정

### Production

- Runtime implementation HOLD
- Cutter presentation remains future verification gate
- Approved Gameplay Art HOLD

---

## 25. FAIL Conditions

### Gameplay

- Standard projectile Rope Cut
- 두 Enemy 동시에 Target
- route choice UI가 정답색으로 강제
- 한 Route Foundation requirement
- 한 Route가 항상 명백히 우월
- Cutter line이 hidden
- Recovery가 Route 진입 후에야 보임
- enemy-active link를 380~400px precision으로 설계
- Kill Gate
- Patrol 추가
- Wind / Scanner 추가
- miss → P0 reset

### Story

- 5-6에서 `LOWER SECTORS EVACUATION SUSPENDED` 결과 공개
- 정확한 승인 조직명 최종 확정
- Named executive villain
- accident planned / caused by company
- “하층을 죽이기 위해 승인” 식 의도 확정
- Group A/B/C mapping

### Production

- Sector05 Runtime 구현
- Cutter VFX 코드 구현
- Approved Art 생성
- direct 5-6→5-7 Runtime wiring
- Boss/Transition 추정

---

## 26. 개발자 / 기획자 최종 전달 요약

### Stage

```text
SECTOR 05-6
INCIDENT COMMAND ANNEX
```

### Core

```text
CHOOSE FAILURE COST
```

### Route A

```text
STANDARD SENTRY
no-rope-cut

BODY HIT RISK
20 damage + knockback
```

### Route B

```text
CUTTER SENTRY

ROPE CUT RISK
0.60 sec disable
+
re-attach delay
```

### Activation

```text
LEFT
X -320 ~ -96

RIGHT
X +96 ~ +320

NO OVERLAP
```

### Geometry

```text
SAFE MAX
386.7 px

FLOW MAX
373.2 px

ACTIVE-BAND MANDATORY MAX
320.0 px

HOOK REACH
400 px
```

### Cutter Geometry

```text
S2 (-32,-448)
→
C2 (+224,-704)
→
RC (+352,-832)

COLLINEAR
```

### Story

```text
INCIDENT RESPONSE

POST-CASCADE

LOWER ASCENT ROUTING
SUSPENSION AUTHORIZED
```

### Still Hidden

```text
LOWER-SECTOR EVACUATION OUTCOME
FINAL ORGANIZATION IDENTITY
```

### Stage Feeling

> **“이제 회사가 무엇을 유지했는지는 안다. Annex에 들어서면 나도 두 종류의 실패비용 중 하나를 선택해야 하고, 두 Route가 합쳐진 곳에서 마침내 Lower Ascent의 중단이 사고 뒤 ‘승인된 조치’였다는 기록을 보게 된다.”**

---

## OPEN QUESTIONS

### 1. Route Preference Balance

목표는 완전 50:50이 아니다.

다만 대부분 Player가 항상 한쪽만 고르면:

- Recovery visibility
- camera
- enemy position
- activation entry

부터 조정.

### 2. Standard Sentry Position

현재:

```text
(+64,-640)
```

Body Route 왼쪽을 향해 충분히 명확한
사격각이 나오는지 상세 blockout에서 검증.

### 3. Cutter S2 Position

현재:

```text
(-32,-448)
```

C2/RC와 완전 collinear.

Cut rate 과다 시:

1. S2 16~32px offset
2. C2 small offset
3. activation timing

순서로 조정.

### 4. RB/RC→M0 386.7px

Safe Route 최대 연결이지만
Enemy activation OUT에서 발생.

Mobile에서 실패율이 높으면
M0 width/position을 먼저 조정해
~360px대로 줄일 수 있다.

### 5. Story Wording

현재:

```text
SUSPENSION AUTHORIZED
```

는 강한 정책적 사실.

보다 시스템 로그 느낌이면:

```text
SUSPENSION
AUTHORIZATION CONFIRMED
```

후보.

단 핵심은:

```text
POST-CASCADE
+
AUTHORIZED ACTION
```

보존.

### 6. Authority Identity

5-6에서는 일부러:

```text
INCIDENT RESPONSE
```

까지만.

5-8에서:

```text
INCIDENT CONTINUITY CONTROL
```

같은 조직명을 LOCK할지 결정.

### 7. 5-7 Handoff

5-7은 Authorization의 결과:

```text
LOWER SECTORS
EVACUATION SUSPENDED
```

를 명확히 확인하는 Story-heavy Stage.

따라서 5-6 Exit에서는:

```text
EVACUATION ARCHIVE
POST-INCIDENT RECORDS AHEAD
```

까지만.

### 8. Gameplay / Story Metaphor

두 Route 선택과 Corporate Priority 결정을
너무 직접적인 도덕적 비유로 묶지 않는다.

Player 선택은 skill/risk preference이고
Corporate 선택은 Story fact다.

둘은 thematic echo만 가진다.

---

SECTOR 05-6 / INCIDENT COMMAND ANNEX — BLOCKOUT CANDIDATE · REV 1.0
