# SECTOR 05-3 — SECURITY REVIEW FLOOR

*BLOCKOUT CANDIDATE · REV 1.0*

◀ PREV — [SECTOR 05-2 / GLASS ATRIUM](../5-2/README.md) · NEXT — [SECTOR 05-4 / CONTINUITY SERVICE NODE](../5-4/README.md) ▶

`SECTOR 05 CORPORATE ZONE` · `STAGE 03` · `SPARSE HARDPOINT + CUTTER RECOVERY PLANNING` · `NO PATROL`

| 항목 | 기준 |
|---|---|
| Status | HYPOTHESIS — BLOCKOUT CANDIDATE |
| Authoring Snapshot | `33bdb4997a85330c6b338a7fd06f1ae508767a93` |
| Sector Master | LOCAL REVIEWED — GitHub merge pending |
| 5-1 / 5-2 | LOCAL REVIEWED — GitHub merge pending |
| Difficulty | ★★★☆ |
| Expected First Playtime | 145–195 sec |
| Expected Skilled Clear | 55–80 sec |
| Enemy | Cutter Sentry T1 ×1 — STATIONARY |
| Cutter Fire | ACTIVE |
| Patrol | NONE |
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
| Stage Role | Sparse Hardpoint 환경에서 Cutter 이전에 Recovery를 미리 읽는 첫 Stage |
| Stage-local Exit | Reach Final Review Deck → Gate Panel → Physical Crossing |
| Sector 05 Runtime | NOT CONNECTED |
| Approved Gameplay Art | HOLD until Runtime Area / Camera Zone / Stable IDs exist |

---

## 0. 기획 기준

### LOCKED FOR THIS STAGE

5-1:

```text
WHERE CAN I ATTACH?
```

5-2:

```text
WHEN DO I COMMIT?
```

5-3:

> **“Rope가 잘리면 아무 벽에 다시 붙을 수 없는 공간에서, 진입 전에 Recovery를 이미 읽었는가?”**

### Core Grammar

```text
SAFE CUTTER PREVIEW
↓
READ MAIN HARDPOINTS
+
READ RECOVERY
↓
COMMIT
↓
CUTTER LINE PRESSURE
↓
RELEASE / AVOID
or
CUT
↓
R1 RECOVERY
↓
RE-ATTACH AFTER DISABLE
↓
SAFE REVIEW DECK
```

### 4-2와의 차이

4-2 CUTTER LINE:

```text
FIRST ROPE CUT
→
WHAT HAPPENED?
→
HOW DO I RECOVER?
```

5-3 SECURITY REVIEW FLOOR:

```text
CUTTER ALREADY KNOWN
→
WHERE WILL I RECOVER?
→
COMMIT WITH A PLAN
```

### 금지

- Cutter를 새 mechanic처럼 다시 장황하게 튜토리얼
- Patrol 추가
- Standard Sentry 추가
- Wind
- Scanner
- Moving Platform
- New Input
- New Rope Mode
- New Growth
- Kill Gate
- 특정 Foundation 요구
- Recovery를 Cutter 맞은 뒤에야 처음 보여주기
- 400px exact-range Mandatory
- Story terminal interaction requirement

---

## 0-1. 최신 GitHub / Runtime 기준

### CURRENT MAIN AT AUTHORING

```text
33bdb4997a85330c6b338a7fd06f1ae508767a93
```

작성 시점 최신 `main`에는
Sector05 Runtime 추가가 없다.

### VERIFIED — CURRENT ROPE

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
Rope Disabled On Cut        0.60 sec
```

### VERIFIED — CUTTER CAPABILITY

현재 Enemy projectile:

```text
canCutRope
=
rules.includes("cutter-fire")
```

(`src/game/combat/EnemyObject.js`, positive opt-in semantics)

따라서 S1 Cutter에는:

```text
cutter-fire
```

를 명시적으로 추가해야 한다(§8-3).

### Cutter는 Rope를 직접 조준하지 않는다

Current Enemy AI는:

```text
PLAYER
```

를 조준.

Rope Cut은:

```text
Projectile trajectory
INTERSECTS
current Rope segment
```

일 때 발생.

따라서 5-3도
Cutter를 아무 곳에 놓고
“알아서 Rope를 자른다”고 가정하지 않는다.

---

## 0-2. Rope Cut의 정확한 결과

### Collision Priority

Projectile이 Rope와 Body 모두 위협할 때
Rope collision이 먼저 성립하면:

```text
ROPE CUT
```

으로 처리.

### Rope Cut

```text
Rope Detach
+
Swing Drag Clear
+
Rope Disabled
0.60 sec
```

### Health

현재 rope-cut branch는:

```text
NO BODY DAMAGE
```

가 의도.

### Body Hit

Rope와 만나지 않고 Body에 맞으면:

```text
20 Damage
+
Knockback
```

### Recovery Timing

0.60초가 끝난 뒤에도:

```text
Hook launch
→ flight
→ hit
```

가 필요하다.

따라서:

```text
0.60 sec
= instant reconnect
```

가 아니다.

---

## 0-3. Cutter Telegraph / Production Status

Current generic attack cycle:

```text
ACQUIRE
0.25

TRACK
0.80

LOCK
0.20

→ FIRE
```

첫 발 전 약:

```text
1.25 sec
```

의 읽기 시간이 있다.

### Current Status

```text
CUTTER PHYSICS
VERIFIED

CUTTER-SPECIFIC PRESENTATION
PROTOTYPE / VERIFY BEFORE RUNTIME PLAYTEST
```

5-3 Scenario는
기존 Cutter presentation family를 재사용하는 것을 전제로 하지만
Runtime 구현은 Sector06 시나리오 완료 후 HOLD 해제.

---

## 0-4. 5-2 → 5-3 → 5-4 역할

### 5-2

```text
PATROL
+
ENTRY TIMING
+
HARDPOINT COMMITMENT
```

### 5-3

```text
CUTTER
+
RECOVERY PRE-PLANNING
+
HARDPOINT SCARCITY
```

### 5-4

```text
REST
+
GRID CAPACITY EVIDENCE
```

따라서 5-3 후반에는
적을 더 추가하지 않고
5-4로 들어가기 전에 압박을 종료한다.

---

## 1. 한 줄 정의

5-2 Glass Atrium에서 Patrol의 위치를 보고 제한된 Hardpoint chain에 진입하는 법을 배운 Player가, Corporate Incident 기록이 보관된 Security Review Floor에 도착해 Safe Preview Deck에서 Stationary Cutter Sentry와 H2–H3 Main Hardpoint뿐 아니라 Cut 이후 떨어질 R1 Recovery Deck과 다음 Emergency Hardpoint E1까지 한 화면에서 먼저 확인하고, H3에 Rope를 건 채 R1 방향으로 빠질 때 `S1 → H3 → R1`이 정확히 같은 선을 이루는 Cutter Geometry를 통과하며, Telegraph를 읽고 Release해서 Cut을 피하거나 Cut을 감수하고 이미 계획한 R1에 착지한 뒤 0.60초 Rope Disable + Hook Flight를 거쳐 E1으로 재연결해 살아남고, Threat가 끝난 P2 Review Deck에서 Incident Review Archive의 존재만 확인한 채 5-4 Continuity Service Node로 이동하는 Sector05 Cutter Recovery-Planning Stage.

---

## 2. 전체 게임에서의 역할

### 2-1. Reactive Recovery → Planned Recovery

4-2:

```text
CUT
→ RECOVER
```

5-3:

```text
SEE RECOVERY
→ COMMIT
→ CUT MAY HAPPEN
→ EXECUTE PLAN
```

### 2-2. Corporate Rule 강화

일반 벽에 아무 데나 붙을 수 없으므로
Cut 이후:

```text
nearest wall
```

이 정답이 아니다.

Player가 사용할 수 있는 것은:

- R1 Recovery Deck
- E1 Emergency Hardpoint
- 다음 Main Hardpoint

처럼 미리 읽힌 구조뿐.

### 2-3. No New Threat

Cutter 자체는 이미 학습된 시스템.

5-3의 새 난이도는:

```text
Cutter
+
fewer valid attach options
```

의 조합에서 나온다.

### 2-4. 5-4 Preparation

5-3 끝에서는 Combat을 완전히 끊고
Corporate Incident 기록이 실제로 존재한다는 사실만 남긴다.

---

## 3. Story 역할

### S0 — Entry

```text
SECURITY REVIEW FLOOR

ACCESS
RESTRICTED
```

### S1 — Post-Cutter P2

```text
INCIDENT REVIEW ARCHIVE

RECORD SET
AVAILABLE

ACCESS
RESTRICTED
```

### Meaning

Player가 새로 확정:

```text
Corporate upper zone에
Cascade 이후 사고 대응 기록이 보관돼 있다.
```

### 아직 공개하지 않는 것

```text
GRID CAPACITY
CRITICAL DEFICIT
```

5-4 소유.

```text
UPPER CONTROL / EVACUATION
MAINTAIN
```

5-5 소유.

```text
LOWER ASCENT
SUSPENSION AUTHORIZED
```

5-6 소유.

### S2 — Exit

```text
CONTINUITY SERVICE NODE

LOCAL ACCESS
AVAILABLE
```

5-4 REST preview.

---

## 4. 공간 콘셉트

### SECURITY REVIEW FLOOR

Corporate 기록 검토 공간과
보안/서비스 spine이 교차하는 층.

### Visual Language

- dark review glass
- white archive wall
- recessed data cabinets
- flush security panels
- exposed maintenance hardpoint only at service seams
- one stationary Cutter security node

### Spatial Feeling

5-2가:

```text
OPEN GLASS ATRIUM
```

이었다면 5-3은:

```text
LONG CLEAN REVIEW CORRIDOR
+
ONE CONTROLLED VOID
```

가 중심.

### Important

Corridor라고 해서
모든 wall이 grappleable이면 안 된다.

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

### Service Hardpoint

```text
24–32 px
```

### Cutter

기존 Sentry T1 silhouette family.

### Recovery Deck

```text
224–320 px
```

### Archive Display

Gameplay보다 낮은 luminance.

---

## 6. 전체 맵 구조

```text
Y = 0

P0 ENTRY
  \
   H1
    \
     P1 SAFE CUTTER PREVIEW
       [S1 visible]
       [H2 / H3 visible]
       [R1 / E1 visible]

          H2
            \
             H3
            /
      S1 →────────→ R1 RECOVERY
                     \
                      E1
                       \
                        P2 SAFE REVIEW DECK

                           H4
                            \
                             H5
                              \
                               P5 FINAL
                               PANEL / GATE

Y = -1568
```

### 핵심 Cut Line

```text
S1
(+448,-640)

H3
(+96,-736)

R1
(-256,-832)
```

세 점은:

```text
COLLINEAR
```

이다.

---

## 7. Zone 구성

### Z0 — Entry

```text
P0 → H1 → P1
```

S1 activation OUT.

5-2 Patrol pressure가 완전히 끝난 상태.

### Z1 — Recovery Preview

```text
P1
```

Player가 한 화면에 확인:

- S1 Cutter
- H2
- H3
- R1
- E1

### Z2 — Cutter Commitment

```text
P1 → H2 → H3
```

H2/H3:

```text
S1 activation IN
```

### Z3 — Recovery Exit

```text
H3 → R1 → E1
```

R1:

```text
S1 activation OUT
```

E1도 OUT.

Cut을 맞은 경우
0.60 sec 동안 R1에서 버틴 뒤
E1으로 재연결.

### Z4 — Safe Review

```text
E1 → P2
```

Threat 완전 종료.

Story S1.

### Z5 — Clean Corporate Exit

```text
P2 → H4 → H5 → P5
```

Enemy 없음.

5-4 REST로 부드럽게 연결.

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
| P1 | `(-352, -352)` | `320×32` | Safe Cutter Preview |
| R1 | `(-256, -832)` | `288×24` | Primary Cut Recovery |
| P2 | `(-32, -1056)` | `384×32` | Safe Review Deck |
| P5 | `(+256, -1472)` | `448×32` | Final Review Deck |

### 8-2. Service Hardpoints

| ID | Position | Role |
|---|---:|---|
| H1 | `(-320, -224)` | Entry Hardpoint |
| H2 | `(-128, -512)` | Cutter Entry Hardpoint |
| H3 | `(+96, -736)` | Cutter Commitment Hardpoint |
| E1 | `(-96, -928)` | Emergency Recovery Hardpoint |
| H4 | `(+192, -1184)` | Review Exit Hardpoint |
| H5 | `(-64, -1344)` | Final Hardpoint |

### 8-3. Cutter Sentry S1

```text
Position
(+448, -640)

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
-192 ~ +192

Y
-800 ~ -448
```

Membership:

```text
P1 OUT

H2 IN
H3 IN

R1 OUT
E1 OUT
P2 OUT
```

### 8-5. Stable ID 후보

```text
sector-05-03:hardpoint-h1
sector-05-03:hardpoint-h2
sector-05-03:hardpoint-h3
sector-05-03:hardpoint-e1
sector-05-03:hardpoint-h4
sector-05-03:hardpoint-h5

sector-05-03:cutter-s1

sector-05-03:p1
sector-05-03:r1
sector-05-03:p2
sector-05-03:p5
```

### 8-6. Sealed Surface 후보

```text
sector-05-03:sealed-review-west
sector-05-03:sealed-review-east
sector-05-03:sealed-archive-glass
sector-05-03:sealed-upper-panel
```

모두:

```text
grappleable:false
```

후보.

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
→ E1
→ P2
→ H4
→ H5
→ P5
```

### Distance Pre-check

| Link | Distance |
|---|---:|
| P0 → H1 | `295.0 px` |
| H1 → P1 | `131.9 px` |
| P1 → H2 | `275.3 px` |
| H2 → H3 | `316.8 px` |
| H3 → R1 | `364.9 px` |
| R1 → E1 | `186.6 px` |
| E1 → P2 | `143.1 px` |
| P2 → H4 | `258.0 px` |
| H4 → H5 | `301.9 px` |
| H5 → P5 | `344.7 px` |

### Result

```text
MAX SAFE LINK
= 364.9 px

CURRENT DERIVED HOOK REACH
= 400 px

MARGIN
= 35.1 px
```

### Important

가장 긴 H3→R1은:

```text
landing / recovery
```

방향.

Cutter 압박 속에서
다음 공격 Hardpoint를 high-380s로 맞추는 구조가 아니다.

---

## 10. Flow Route

### Route

```text
P0
→ H1
→ H2
→ H3
→ P2
→ H4
→ H5
→ P5
```

P1 / R1 / E1 landing 생략 가능.

### Distance Pre-check

| Link | Distance |
|---|---:|
| P0 → H1 | `295.0 px` |
| H1 → H2 | `346.1 px` |
| H2 → H3 | `316.8 px` |
| H3 → P2 | `344.7 px` |
| P2 → H4 | `258.0 px` |
| H4 → H5 | `301.9 px` |
| H5 → P5 | `344.7 px` |

### Result

```text
MAX FLOW LINK
= 346.1 px
```

### Design Intent

5-3은 속도 Challenge가 아니다.

숙련 Player는 Cut을 피하면
R1/E1을 건너뛰어:

```text
H3 → P2
```

로 빠르게 탈출.

---

## 11. Cutter Geometry

### Critical Line

```text
S1
(+448,-640)

H3
(+96,-736)

R1
(-256,-832)
```

벡터:

```text
S1 → H3
(-352,-96)

H3 → R1
(-352,-96)
```

따라서:

```text
S1
→ H3
→ R1
```

은 정확히 같은 선.

### Meaning

Player가 H3에 Rope를 걸고
R1 쪽으로 빠질 때:

```text
S1 projectile path
+
current Rope near H3
```

가 겹치기 쉬운 상황.

### Not Guaranteed

```text
GUARANTEED CUT
```

아님.

Player가:

- early release
- arc change
- body path shift
- fast exit

로 회피 가능.

### Core Learning

Cut을 피하는 것도 실력.

Cut을 맞더라도
R1을 이미 읽고 살아남는 것도 실력.

---

## 12. Recovery Planning Contract

### P1에서 반드시 보일 것

```text
H2
H3
R1
E1
S1
```

### Player Mental Model

진입 전:

```text
MAIN PLAN
H2 → H3 → P2

FAIL PLAN
H3 → R1 → E1 → P2
```

이 동시에 보여야 한다.

### Why E1 exists

R1은 Landing Recovery.

E1은:

```text
Rope Disabled 종료 후
첫 명확한 Re-Attach Target
```

역할.

### Important

Cut을 맞은 뒤:

```text
어디에 붙지?
```

를 처음 고민하게 만들면 FAIL.

정답은 이미 P1에서 보였어야 한다.

---

## 13. Rope Cut Recovery Timing

### Cut

```text
0.60 sec Rope Disable
```

### During Disable

Player:

```text
R1 landing
```

을 목표.

### After Disable

```text
Hook launch
→ flight
→ E1 hit
```

### Target

```text
CUT
→ stable R1 landing
≤ 2.0 sec

CUT
→ next successful attach
≤ 3.0 sec target
```

### No Instant Reconnect Claim

문서 / UI에서:

```text
0.60초 후 즉시 Rope 복구
```

라고 설명하지 않는다.

---

## 14. Activation / Safe Deck Contract

### S1 Activation

```text
X -192 ~ +192
Y -800 ~ -448
```

### Membership

```text
P1
OUT

H2
IN

H3
IN

R1
OUT

E1
OUT

P2
OUT
```

### Why

P1:

```text
SAFE PREVIEW
```

R1/E1:

```text
RECOVERY / RE-ATTACH
```

P2:

```text
STORY
```

에서 새 acquire가 없어야 한다.

### Already-fired Projectile

Activation 밖으로 나왔다고
기존 Projectile이 사라진다고 가정하지 않는다.

R1에서 이미 발사된 탄을
계속 읽을 수 있어야 한다.

---

## 15. Enemy Contract

### S1

```text
Stationary Cutter Sentry T1 ×1
```

### Attack

```text
Acquire
0.25

Track
0.80

Lock
0.20

Fire
```

### Projectile

```text
520 px/s
7 px radius
20 body damage
canCutRope
true
```

### Rope Cut

```text
0 body damage
+
0.60 sec Rope disable
```

현재 intended collision priority 기준.

### Kill

```text
OPTIONAL
```

### No LOS Assumption

```text
cover-ends-los
```

같은 규칙을 추가하지 않는다.

Safe zone은 Activation으로 보장.

---

## 16. Foundation Expression

### IMPULSE COIL

H2→H3 / H3→P2에서:

```text
exposure duration 감소
```

### RELAY LINK

H1→H2→H3 chain에서:

```text
limited valid target
+
re-attach consistency
```

이득.

### SHEAR CURRENT

실제 Rope segment가 S1을 가로지르면
optional damage 가능.

그러나 이번 Stage의 핵심은:

```text
CUTTER RECOVERY PLAN
```

이다.

### Mandatory

```text
NO FOUNDATION REQUIRED
```

### First Specialization

```text
NOT REQUIRED
```

---

## 17. Story Trigger

### S0 — P1 Approach

```text
SECURITY REVIEW FLOOR

ACCESS
RESTRICTED
```

### S1 — P2 Safe Review Deck

```text
INCIDENT REVIEW ARCHIVE

RECORD SET
AVAILABLE

ACCESS
RESTRICTED
```

### S2 — Exit P5

```text
CONTINUITY SERVICE NODE

LOCAL ACCESS
AVAILABLE
```

### Presentation

P2는 S1 activation OUT.

Story 읽기 위해
Combat 구간에서 멈추지 않는다.

---

## 18. Story Disclosure Boundary

### 이번 Stage에서 확정

```text
Incident Review Archive
exists.

Post-incident records
are stored in Corporate zone.
```

### 아직 공개 금지

5-4:

```text
GRID CAPACITY
CRITICAL DEFICIT
```

5-5:

```text
CONTINUITY PRIORITY
UPPER CONTROL / EVACUATION
MAINTAIN
```

5-6:

```text
LOWER ASCENT ROUTING
SUSPENSION AUTHORIZED
```

5-7:

```text
LOWER SECTORS
EVACUATION SUSPENDED
```

5-8:

```text
WHO / WHY
organizational responsibility
```

### Accident Boundary

```text
Company caused Cascade
```

암시 금지.

---

## 19. Camera

모두 HYPOTHESIS.

### C0 — Entry

```text
P0 / H1 / P1

Desktop 0.95
Mobile  0.72
```

### C1 — Cutter Planning Shot

가장 중요.

```text
P1
H2
H3
R1
E1
S1

Desktop 0.86
Mobile  0.66
```

### C2 — Cutter / Recovery

```text
H2 / H3 / S1 / R1 / E1

Desktop 0.88
Mobile  0.68
```

### C3 — Review Deck

```text
E1 / P2 / Archive status

Desktop 0.96
Mobile  0.72
```

### C4 — Exit

```text
P2 / H4 / H5 / P5 / Gate

Desktop 0.92
Mobile  0.70
```

### Required

P1에서:

```text
MAIN PLAN
+
FAIL PLAN
```

을 동시에 읽을 수 있어야 한다.

---

## 20. Gate Contract

Stage-local intent:

```text
Reach P5
→ Gate Panel
→ Gate Open
→ Physical Crossing
→ 5-4
```

### Runtime Status

Sector05:

```text
NOT CONNECTED
```

현재는 Design Contract.

### Candidate

P5:

```text
(+256,-1472)
```

Panel:

```text
(+432,-1472)
```

Gate:

```text
(+560,-1472)
```

### No Kill Gate

S1 생존 여부와 무관.

---

## 21. Pixel Art Asset Spec

### Security Review Floor

- white archive wall
- smoked review glass
- dark recessed record cabinet
- sparse service seams
- cyan maintenance hardpoints
- one Cutter security node

### Recovery Readability

R1은 Corporate main deck보다
조금 낮은:

```text
service lip / maintenance catch
```

로 표현.

E1은:

```text
emergency maintenance hardpoint
```

family.

### Cutter

기존 Cutter visual family를 재사용.

새 Corporate Cutter AI Variant를 만들지 않는다.

### Approved Art

```text
HOLD
```

---

## 22. Background / VFX / Sound

### Far

- corporate review chambers
- glass archive stacks
- controlled lighting
- distant office core

### Mid

- sealed data cabinets
- maintenance recesses
- security rail

### Near

- sparse frame
- hardpoint housing
- recovery lip

### Cutter VFX

현재 production에서
Cutter-specific charge/projectile/trail/audio는
별도 verification 필요.

Scenario에서는:

```text
readable distinct Cutter telegraph
```

를 요구.

### Sound

- quiet corporate HVAC
- Cutter charge cue
- rope cut HUD/audio family
- P2에서 combat layer fade

---

## 23. Multiplayer Contract

### Shared S1

Cutter Sentry 하나 공유.

### Eligible Target

Activation 안 Player만 새 target 후보.

### Different Pace

Player A:

```text
H2/H3
```

Player B:

```text
P1 preview
```

동시 가능.

### Cross-Rope Risk

S1 projectile이
Target Player가 아닌 다른 Player Rope를
우발적으로 자를 수 있는지는
추후 runtime playtest 필요.

### Recovery

R1 / E1 / P2에서
새 acquire 없어야 한다.

### Story

P2 Archive fact는 shared world fact.

Movement lock 없음.

### Gate

```text
shared open
individual crossing
```

---

## 24. PASS Criteria

### Gameplay

- Cutter exactly 1
- Patrol 0
- Standard Sentry 0
- Wind 0
- Scanner 0
- Moving Platform 0
- P1 activation OUT
- H2 activation IN
- H3 activation IN
- R1 activation OUT
- E1 activation OUT
- P2 activation OUT
- P1에서 H2/H3/R1/E1/S1 전부 읽힘
- `S1 → H3 → R1` collinear
- Cut 회피 가능
- Cut recovery 가능
- Kill Optional
- Safe max 364.9px
- Flow max 346.1px
- all links <400px
- no new input
- no new Rope mode
- no Growth
- no Foundation lock

### Story

- Incident Review Archive 존재만 공개
- Capacity Deficit 미공개
- Priority decision 미공개
- Lower evacuation policy 미공개

### Production

- Runtime implementation HOLD
- Cutter-specific presentation remains verification gate
- Approved Gameplay Art HOLD

---

## 25. FAIL Conditions

### Gameplay

- Cut을 맞은 뒤에야 R1/E1이 처음 보임
- Recovery Target이 sealed wall과 구분 안 됨
- R1이 activation 안
- E1이 activation 안
- H2/H3 외 parent wall이 무료 grappleable
- Cutter가 Rope를 직접 homing한다고 가정
- 0.60초 후 instant reconnect라고 설명
- Cutter Kill이 Gate 조건
- 380~400px Mandatory 반복
- Patrol 추가
- Scanner/Wind 추가
- one Cut → Stage start

### Story

- Capacity Deficit 조기 공개
- Lower ascent suspension 공개
- Evacuation suspension 공개
- Named villain 등장
- accident conspiracy 암시

### Production

- Sector05 Runtime 구현 시작
- Cutter VFX를 Scenario 범위에서 코드 구현
- Approved Art 생성
- direct 5-3→5-4 Runtime wiring

---

## 26. 개발자 / 기획자 최종 전달 요약

### Stage

```text
SECTOR 05-3
SECURITY REVIEW FLOOR
```

### Core

```text
SPARSE HARDPOINT
+
ONE CUTTER
+
PRE-PLANNED RECOVERY
```

### Question

```text
Before I commit,
do I already know
where I recover if the Rope is cut?
```

### Cutter

```text
S1
(+448,-640)
```

### Critical Geometry

```text
S1
(+448,-640)

→ H3
(+96,-736)

→ R1
(-256,-832)

COLLINEAR
```

### Activation

```text
X -192 ~ +192
Y -800 ~ -448
```

### Membership

```text
P1 OUT
H2 IN
H3 IN
R1 OUT
E1 OUT
P2 OUT
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
landing catch

E1
first clear re-attach target
```

### Story

```text
INCIDENT REVIEW ARCHIVE
RECORD SET AVAILABLE
ACCESS RESTRICTED
```

### Do Not Add

- Patrol
- Standard Sentry
- Wind
- Scanner
- New Mechanic
- Growth
- Kill Gate
- Boss

### Stage Feeling

> **“Cutter가 Rope를 자를 수 있다는 건 이미 안다. 이제 중요한 건 맞고 나서 당황하는 게 아니라, 들어가기 전에 내가 떨어질 자리와 다시 붙을 곳을 이미 보고 있는가다.”**

---

## OPEN QUESTIONS

### 1. H3→R1 364.9px

Safe Route에서 가장 긴 연결.

이 Link는:

```text
forward precision
```

보다:

```text
fall / recovery direction
```

역할.

Runtime graybox에서 Cut knock/velocity 때문에
R1 landing rate가 낮으면
R1을 16~32px inward / upward 조정.

### 2. E1 위치

현재:

```text
(-96,-928)
```

R1에서 재연결하기 쉬운 후보.

0.60 sec disable 동안 Player가
R1을 지나쳐 떨어지는 비율이 높다면
E1보다 먼저 R1 폭 / vertical catch를 조정.

### 3. Cutter Alignment Strength

현재:

```text
S1-H3-R1
perfect collinear
```

Cut rate가 지나치게 높으면:

1. S1 vertical 16~32px offset
2. H3 position small offset
3. activation entry

순으로 조정.

Projectile speed 자체를 Stage-specific으로 낮추지 않는다.

### 4. P1 Camera

이 Stage의 성공을 좌우한다.

P1에서:

```text
S1
H2
H3
R1
E1
```

중 하나라도 안 보이면
Geometry보다 Camera를 먼저 수정.

### 5. Cutter Presentation

현재 Rope-cut physics는 존재하지만
Cutter-specific player-facing telegraph는
Runtime 구현 단계의 verification gate.

Sector06 Scenario 완료 전에는 구현하지 않는다.

### 6. Story S1

```text
RECORD SET AVAILABLE
```

가 너무 게임 UI처럼 보이면:

```text
INCIDENT REVIEW ARCHIVE
INDEX ONLINE
ACCESS RESTRICTED
```

로 교체 가능.

핵심은 기록의 존재만 보여주는 것.

### 7. 5-4 Handoff

5-4는:

```text
REST
+
GRID CAPACITY CRITICAL DEFICIT
```

를 소유.

5-3 Exit에서는:

```text
CONTINUITY SERVICE NODE
LOCAL ACCESS AVAILABLE
```

까지만 보여준다.

---

SECTOR 05-3 / SECURITY REVIEW FLOOR — BLOCKOUT CANDIDATE · REV 1.0
