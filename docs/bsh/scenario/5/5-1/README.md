# SECTOR 05-1 — CORPORATE THRESHOLD

*BLOCKOUT CANDIDATE · REV 1.0*

◀ PREV — POST-SECTOR 04 BOSS / TRANSITION — TBD · NEXT — [SECTOR 05-2 / GLASS ATRIUM](../5-2/README.md) ▶

`SECTOR 05 CORPORATE ZONE` · `STAGE 01` · `SEALED SURFACE / SERVICE HARDPOINT INTRODUCTION` · `NO ENEMY`

| 항목 | 기준 |
|---|---|
| Status | HYPOTHESIS — BLOCKOUT CANDIDATE |
| Authoring Snapshot | `33bdb4997a85330c6b338a7fd06f1ae508767a93` |
| Sector Master | LOCAL REVIEWED — GitHub merge pending |
| Difficulty | ★★★ |
| Expected First Playtime | 105–145 sec |
| Expected Skilled Clear | 40–60 sec |
| Enemy | NONE |
| Cutter | NONE |
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
| Stage Role | Corporate visual reset + static grapple-eligibility rule introduction |
| Stage-local Exit | Reach Final Corporate Deck → Gate Panel → Physical Crossing |
| Sector 05 Runtime | NOT CONNECTED |
| Approved Gameplay Art | HOLD until Runtime Area / Camera Zone / Stable IDs exist |

---

## 0. 기획 기준

### LOCKED FOR THIS STAGE

5-1은 Sector 05의 첫 구간이다.

따라서 처음부터:

```text
ENEMY
+
CUTTER
+
HARDPOINT SCARCITY
```

를 동시에 묻지 않는다.

이번 Stage에서 Player가 배울 것은 하나다.

> **“Corporate 공간에서는 큰 마감면이 아니라, 노출된 Service Hardpoint를 읽고 붙는다.”**

### Core Grammar

```text
SEE SEALED SURFACE
↓
SEE HARDPOINT
↓
ATTACH
↓
CROSS LARGE NEGATIVE SPACE
↓
LAND / PREVIEW
↓
CHAIN HARDPOINTS
```

### 금지

- Enemy
- Cutter
- Patrol
- Scanner
- Wind
- Moving Surface
- New Input
- New Rope Mode
- New Growth
- Story Terminal requirement
- 400px exact-range tutorial
- invisible grapple denial
- 4-8 → 5-1 direct wiring 확정

---

## 0-1. 최신 GitHub / Runtime 기준

### CURRENT MAIN AT AUTHORING

```text
33bdb4997a85330c6b338a7fd06f1ae508767a93
```

최신 commit은 Sector01 Scenario Art 계열이며
Sector05 Runtime을 새로 구현한 변경은 확인되지 않았다.

### Current Product Boundary

```text
4-8 GENERAL FINALE
→
POST-SECTOR 04 BOSS / TRANSITION TBD
→
SECTOR 05
```

따라서 본 문서의:

```text
P0 Entry
```

는 Stage-local 좌표 후보일 뿐
실제 Post-Sector04 spawn을 확정하지 않는다.

### Current Rope Contract

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

### Current Static Grapple Eligibility

Sector05 Master가 선택한 Rule:

```text
SEALED SURFACE
grappleable = false

SERVICE HARDPOINT
grappleable = true
```

동적 Scanner가 아니다.

---

## 0-2. 4-8 → 5-1 → 5-2 역할

### 4-8

```text
TRANSIT CONTROL TRUNK
UPPER LIMITED
vs
LOWER ISOLATED
```

### 5-1

```text
CORPORATE VISUAL RESET
+
STATIC HARDPOINT RULE
```

### 5-2

```text
GLASS ATRIUM
+
PATROL ×1
+
HARDPOINT COMMITMENT
```

따라서 5-1은
5-2의 Enemy 압박을 미리 소비하지 않는다.

---

## 1. 한 줄 정의

Post-Sector04 Boss / Transition을 통과했다고 가정되는 Player가 Corporate Continuity Zone의 넓고 밝으며 비어 있는 Threshold에 진입해, 처음에는 거대한 흰색·유리 마감면이 전부 Rope Target처럼 보일 수 있지만 실제로는 Cyan maintenance housing을 가진 소수의 Service Hardpoint만 명확한 Attach Point라는 공간 규칙을 읽고, Enemy나 Wind 없이 몇 개의 큰 Negative Space를 Hardpoint chain과 Recovery Deck으로 안전하게 통과하며, 마지막에는 `CORPORATE CONTINUITY / EMERGENCY OPERATIONS ACTIVE`라는 상태만 확인한 채 다음 Glass Atrium의 보안 구역으로 들어가는 Sector05 spatial-rule introduction Stage.

---

## 2. 전체 게임에서의 역할

### 2-1. Visual Reset

Sector04:

```text
dense
industrial
moving pressure
```

에서:

Sector05:

```text
clean
bright
sparse
controlled
```

로 즉시 바뀐다.

### 2-2. Gameplay Reset

Sector04에서 Player는
많은 Anchor와 Momentum 속에서 빠르게 회복했다.

5-1에서는:

```text
LESS AVAILABLE ATTACH SURFACE
```

를 처음 느낀다.

### 2-3. No Threat Learning

이번 Stage는:

```text
“안 붙는 면이 있다.”
```

를 적에게 맞으며 배우는 구간이 아니다.

### 2-4. Future Commitment Setup

5-2 이후에는:

```text
Hardpoint position
+
Enemy exposure
```

를 함께 읽게 된다.

5-1은 그 전에 visual grammar를 잠근다.

---

## 3. Story 역할

### S0 — Entry

```text
CORPORATE CONTINUITY ZONE

EMERGENCY OPERATIONS
ACTIVE
```

### Meaning

Player가 처음 확정:

```text
이 상부 Corporate 영역은
사고 이후에도 Emergency Operation 상태로 유지됐다.
```

### 아직 말하지 않는 것

- 왜 Lower sector가 격리됐는지
- 누가 Lower evacuation을 중단했는지
- Corporate Continuity가 어떤 Priority를 선택했는지
- Group A/B/C가 누구였는지

### S1 — Mid

Gameplay affordance와 세계관을 동시에 보여주는 짧은 표기 후보:

```text
STRUCTURAL SERVICE ACCESS

MAINTENANCE HARDPOINTS
ACTIVE
```

### S2 — Exit

```text
GLASS ATRIUM

SECURITY PATROL
ACTIVE
```

5-2 preview.

---

## 4. 공간 콘셉트

### CORPORATE THRESHOLD

Corporate Zone의 외곽 Service Access와
고급 업무공간 사이 경계.

### 공간 언어

- 거대한 white composite wall
- dark glass void
- brushed metal frame
- hidden infrastructure
- 드문 maintenance bracket
- 큰 빈 Atrium-like gap
- 낮은 clutter

### 핵심 대비

```text
SURFACE AREA
LARGE

VALID ATTACH AREA
SMALL / CLEAR
```

### Player가 느껴야 할 것

> **“공간은 더 비어 있고 고급스러운데, Rope를 걸 만한 구조는 오히려 더 제한돼 있다.”**

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
1504 px

Y
0 ~ -1504
```

### Player

Current presentation scale:

```text
48 px
```

### Hardpoint Cue

권장:

```text
24–32 px
```

### Recovery Deck

```text
192–288 px
```

### Negative Space

Corporate identity를 위해
Sector04보다 큰 빈 면과 Void를 유지.

---

## 6. 전체 맵 구조

```text
Y = 0

P0 ENTRY
  \
   H1
    \
     P1 FIRST SAFE READ

          H2
            \
             R1

               H3
                \
                 P2 MID CORPORATE DECK

                    H4
                   /
                R2

             H5
               \
                H6
                  \
                   P5 FINAL CORPORATE DECK
                   PANEL / GATE

Y = -1504
```

### Sealed Surfaces

Hardpoint 주변의 큰 흰색/유리 면:

```text
NON-GRAPPLEABLE
```

### Hardpoint Flow

```text
LEFT
→ CENTER
→ RIGHT
→ CENTER
→ LEFT
→ CENTER
→ RIGHT
```

큰 Corporate void 안에서
명확한 zig-zag 시선 흐름을 만든다.

---

## 7. Zone 구성

### Z0 — Corporate Entry Read

```text
P0 → H1 → P1
```

목적:

- Corporate visual reset
- 첫 Hardpoint
- 첫 Sealed Surface 구분

### Z1 — First Sparse Crossing

```text
P1 → H2 → R1 → H3 → P2
```

목적:

- 큰 wall 전체가 아닌 Hardpoint chain 사용
- Recovery가 존재함을 보여줌

### Z2 — Negative Space Commitment

```text
P2 → H4 → R2 → H5
```

목적:

- 다음 두 Hardpoint를 미리 읽는 구간
- Enemy 없이 route planning만 체험

### Z3 — Final Clean Chain

```text
H5 → H6 → P5
```

목적:

- 숙련 Player는 landing 없이 연결
- Gate 진입 전 Rule mastery 확인

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
| P1 | `(-256, -384)` | `288×32` | First Safe Read |
| R1 | `(+288, -576)` | `224×24` | First Recovery |
| P2 | `(+256, -864)` | `320×32` | Mid Corporate Deck |
| R2 | `(-256, -1056)` | `224×24` | Second Recovery |
| P5 | `(+320, -1408)` | `448×32` | Final Corporate Deck |

### 8-2. Service Hardpoints

| ID | Position | Role |
|---|---:|---|
| H1 | `(-320, -224)` | First Corporate Hardpoint |
| H2 | `(-16, -448)` | First Sparse Crossing |
| H3 | `(+224, -736)` | Right Structural Hardpoint |
| H4 | `(0, -960)` | Central Ceiling Hardpoint |
| H5 | `(-288, -1184)` | Left Service Joint |
| H6 | `(+16, -1312)` | Final Relay Hardpoint |

### 8-3. Stable ID 후보

```text
sector-05-01:hardpoint-h1
sector-05-01:hardpoint-h2
sector-05-01:hardpoint-h3
sector-05-01:hardpoint-h4
sector-05-01:hardpoint-h5
sector-05-01:hardpoint-h6
```

### 8-4. Sealed Surface 후보

각 Gameplay band에 최소 하나의
큰 `grappleable:false` 면을 둔다.

예:

```text
sector-05-01:sealed-west-a
sector-05-01:sealed-east-a
sector-05-01:sealed-glass-b
sector-05-01:sealed-panel-c
```

### Important

Hardpoint 뒤 동일 위치에
always-grappleable parent wall 금지.

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
| H1 → P1 | `172.3 px` |
| P1 → H2 | `248.4 px` |
| H2 → R1 | `329.8 px` |
| R1 → H3 | `172.3 px` |
| H3 → P2 | `131.9 px` |
| P2 → H4 | `273.4 px` |
| H4 → R2 | `273.4 px` |
| R2 → H5 | `131.9 px` |
| H5 → H6 | `329.8 px` |
| H6 → P5 | `318.8 px` |

### Result

```text
MAX SAFE LINK
= 329.8 px

CURRENT DERIVED HOOK REACH
= 400 px

MARGIN
= 70.2 px
```

### Design Intent

Safe Route는
Hardpoint scarcity를 학습하지만
거리 정밀도는 요구하지 않는다.

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

### Distances

| Link | Distance |
|---|---:|
| P0 → H1 | `295.0 px` |
| H1 → H2 | `377.6 px` |
| H2 → H3 | `374.9 px` |
| H3 → H4 | `316.8 px` |
| H4 → H5 | `364.9 px` |
| H5 → H6 | `329.8 px` |
| H6 → P5 | `318.8 px` |

### Result

```text
MAX FLOW LINK
= 377.6 px

CURRENT DERIVED HOOK REACH
= 400 px

MARGIN
= 22.4 px
```

### Important

Flow Route에서만 high-370s가 나온다.

Mandatory Safe Route는 최대 329.8px.

따라서:

```text
HARDPOINT SCARCITY
≠
MANDATORY MAX-RANGE TEST
```

원칙을 지킨다.

---

## 11. Sealed Surface Tutorial

### 첫 화면

P0에서 Player가 봐야 하는 것:

```text
large white sealed panel
+
small cyan H1
```

### Expected Read

```text
H1
= attach affordance

white panel
= structural / collision surface
not Rope target
```

### 강제 실패 금지

Player에게:

```text
“먼저 sealed wall을 클릭해서 실패해봐.”
```

를 요구하지 않는다.

### Correct Learning

성공하는 Target이 너무 명확해서
실패 없이도 Rule을 이해할 수 있어야 한다.

### Optional Error Feedback

Player가 Sealed Surface를 조준하면
기존 non-target behavior만으로 충분.

새 Tutorial modal / error popup 추가 금지.

---

## 12. Service Hardpoint Visual Contract

### Required

모든 H1~H6:

- Cyan 계열 gameplay cue
- 같은 silhouette family
- corporate wall에서 약간 돌출
- background decor보다 높은 contrast
- 실제 collision / attach 위치와 sprite 중심 정렬

### Recommended Form

```text
MAINTENANCE LUG
+
small metal housing
+
cyan service light
```

### Hardpoint Size

시각상:

```text
24–32 px
```

후보.

### 금지

- giant glowing circle
- floating UI-only target
- arrow network
- 여러 Hardpoint를 선으로 연결한 tutorial overlay

---

## 13. Sealed Surface Visual Contract

### Material

- white composite
- smoked glass
- pale brushed metal
- dark glossy bulkhead

### Rope Affordance

```text
NO CYAN CUE
```

### Collision Clarity

유리라도:

- outer frame
- floor edge
- structural mullion

으로 collision boundary를 분명히.

### Decor

light strip / hologram / corporate logo가
Hardpoint처럼 보이지 않게 한다.

---

## 14. Recovery

### P1

첫 Rule 확인 후 완전 Safe.

### R1

First Sparse Crossing 실패 catch.

### P2

Stage 중앙의 큰 Safe Deck.

### R2

Second Commitment 실패 catch.

### Recovery Principle

```text
MISS
→ lower service geometry
→ read next hardpoint
→ rejoin
```

### Target

대부분의 실패:

```text
≤ 5 sec
```

안에 원래 진행 높이대로 복귀.

### No Full Reset

H4/H5 miss가
P0까지 떨어지면 FAIL.

---

## 15. Foundation Expression

### IMPULSE COIL

Flow Route에서:

```text
H1 → H2
H2 → H3
H4 → H5
```

landing skip과 exposure 없는 speed expression.

### RELAY LINK

Hardpoint 선택지가 제한돼 있으므로
next attach가 명확하고 Relay consistency가 잘 읽힌다.

### SHEAR CURRENT

Enemy 없음.

```text
offense value
NONE
```

그러나 base Rope movement로 정상 clear.

### Mandatory

```text
NO FOUNDATION REQUIRED
```

### First Specialization

```text
NOT REQUIRED
```

---

## 16. Enemy / Hazard Contract

정확히:

```text
Enemy
0

Cutter
0

Patrol
0

Wind
0

Scanner
0

Moving Platform
0
```

### Why

5-1에서 Threat를 넣으면
Player가:

```text
왜 안 붙었지?
```

와:

```text
왜 맞았지?
```

를 동시에 해석해야 한다.

이번 Stage는 공간 Rule만 학습.

---

## 17. Story Trigger

### S0 — Entry

P0 broad traversal.

```text
CORPORATE CONTINUITY ZONE

EMERGENCY OPERATIONS
ACTIVE
```

### S1 — Mid

P2 safe deck.

```text
STRUCTURAL SERVICE ACCESS

MAINTENANCE HARDPOINTS
ACTIVE
```

### S2 — Exit

P5 approach.

```text
GLASS ATRIUM

SECURITY PATROL
ACTIVE
```

### Presentation

- movement lock 없음
- terminal interact 없음
- 긴 paragraph 없음

---

## 18. Story Disclosure Boundary

### Player가 이번 Stage에서 확정

```text
Corporate continuity zone
remains operational.

Maintenance hardpoint network
is still active.

Security exists ahead.
```

### 아직 확정 금지

```text
GRID CAPACITY CRITICAL DEFICIT
```

5-4 소유.

```text
UPPER EVACUATION CAPACITY MAINTAIN
```

5-5 소유.

```text
LOWER ASCENT SUSPENSION AUTHORIZED
```

5-6 소유.

```text
LOWER SECTORS EVACUATION SUSPENDED
```

5-7 소유.

---

## 19. Camera

모두 HYPOTHESIS.

### C0 — Threshold Reveal

```text
P0 / H1 / P1
+
large sealed panel

Desktop 0.95
Mobile  0.72
```

### C1 — First Sparse Crossing

```text
P1 / H2 / R1 / H3

Desktop 0.90
Mobile  0.70
```

### C2 — Mid Corporate Void

```text
H3 / P2 / H4 / R2

Desktop 0.90
Mobile  0.70
```

### C3 — Upper Commitment

```text
R2 / H5 / H6

Desktop 0.88
Mobile  0.68
```

### C4 — Exit

```text
H6 / P5 / Panel / Gate

Desktop 1.00
Mobile  0.72
```

### Camera Rule

적이 없으므로
Player가 Hardpoint를 찾기 위해
카메라 밖으로 blind leap하면 FAIL.

---

## 20. Gate Contract

Stage-local intent:

```text
Reach P5
→ Gate Panel
→ Gate Open
→ Physical Crossing
→ 5-2
```

### But Product Boundary

Sector05 Runtime 자체가 아직 없다.

따라서 이 문서는:

```text
Gate contract
DESIGN ONLY
```

이다.

### Gate Candidate

P5:

```text
(+320,-1408)
```

Panel 후보:

```text
(+480,-1408)
```

Gate 후보:

```text
(+608,-1408)
```

정확한 authored mounting은 Runtime 단계에서 검증.

### No New Key

기존 contextual interact 재사용.

---

## 21. Pixel Art Asset Spec

### Player-visible Foreground

1. white sealed panel
2. dark glass wall
3. service hardpoint
4. recovery lip
5. gate / panel

### Corporate Architecture

- concealed ventilation
- recessed doors
- flush wall joints
- high-cost finish
- minimal exposed cable

### Important Contrast

Sector04:

```text
exposed infrastructure
```

Sector05:

```text
infrastructure hidden behind finish
```

Service Hardpoint는
그 숨겨진 구조가 드물게 노출된 지점.

---

## 22. Background / Parallax / VFX

### Far

- high-rise interior void
- distant corporate bridge
- lit upper offices
- sealed lift core
- sky glow through glass

### Mid

- structural ribs
- executive circulation bridge
- maintenance spine hidden behind glass

### Near

- sparse mullion
- clean frame
- occasional service housing

### Motion

거의 없음.

- subtle light scan
- ventilation shimmer
- distant elevator indicator

Gameplay state 변화처럼 보이는 큰 flashing 금지.

---

## 23. Sound

### Sector Transition

Sector04의:

```text
industrial pressure
machine rumble
```

를 줄이고:

```text
quiet HVAC
soft relay hum
distant building tone
```

으로 전환.

### Hardpoint

Hook hit sound가
깨끗한 공간에서 더 명확히 들려야 한다.

### Story

S0 status tone은
경보가 아니라 corporate system confirmation 느낌.

### No Combat Layer

Enemy가 없으므로 Combat music escalation 없음.

---

## 24. Multiplayer Contract

### Shared Hardpoints

모든 Player가 같은 H1~H6를 사용 가능.

```text
single-user occupancy
NONE
```

### Sealed Surface

Player별 attach eligibility 차이 없음.

### Recovery

P1 / R1 / P2 / R2에 여러 Player가 동시에 있어도 진행 가능.

### Gate

기존 원칙:

```text
shared open
individual physical crossing
```

### No Forced Catch-up

Player A가 P5 도달해도
Player B를 순간이동시키지 않는다.

---

## 25. PASS Criteria

### Gameplay

- Enemy 0
- Wind 0
- Scanner 0
- Moving Platform 0
- Hardpoint rule이 첫 화면에서 읽힘
- Sealed Surface와 Hardpoint가 시각적으로 구분됨
- hidden free grapple parent surface 없음
- Safe max 329.8px
- Flow max 377.6px
- 모든 Hook link <400px
- Mandatory Safe Route가 max-range test 아님
- Recovery ≤5 sec target
- no new input
- no new Rope mode
- no Growth
- no Foundation lock

### Story

- Corporate Continuity Zone 진입만 확정
- Emergency Operations ACTIVE 확인
- Lower evacuation policy 미공개
- accident causality 미공개
- Glass Atrium / Patrol만 preview

### Production

- Runtime implementation HOLD
- 4-8→5-1 direct wiring 없음
- Approved Gameplay Art HOLD

---

## 26. FAIL Conditions

### Gameplay

- 첫 화면에서 흰 벽과 Hardpoint를 구분할 수 없음
- Sealed wall 뒤에 always-grappleable parent 존재
- 일부 decor가 Hardpoint처럼 보임
- Hardpoint를 찾으려면 blind camera movement 필요
- Safe Route 360~400px 반복
- Player에게 일부러 attach 실패를 강제
- one miss → Stage start
- Enemy를 추가해 Rule 학습 방해
- Scanner / Wind를 넣어 난이도 추가

### Story

- 5-1에서 `LOWER SECTORS EVACUATION SUSPENDED` 공개
- Corporate가 사고를 일으켰다고 암시
- Named villain 등장
- Player 목표가 복수로 전환

### Product Boundary

- 4-8에서 5-1 직접 spawn 확정
- 5-1에서 5-2 Runtime wiring 확정
- Post-Sector04 Boss를 임의 생성

---

## OPEN QUESTIONS

### 1. H1→H2 Flow 377.6px

Flow Route에서 가장 긴 연결.

Mandatory Safe Route는 329.8px이므로 현재 허용 가능.

Mobile playtest에서 반복 miss가 많으면
H2를 8~16px inward 조정.

### 2. Hardpoint Count

현재:

```text
6
```

후보.

5-1이 너무 tutorial-like하게 촘촘하면
H3/H4 간 구조를 넓히되
Mandatory range를 키우는 방식보다
landing / sightline을 조정한다.

### 3. Sealed Glass

Glass가 배경처럼 보이면
충돌면 이해가 약해질 수 있다.

Frame / mullion contrast로 해결하고
glass 전체를 cyan outline으로 칠하지 않는다.

### 4. Mid Story Text

```text
STRUCTURAL SERVICE ACCESS
MAINTENANCE HARDPOINTS ACTIVE
```

는 Gameplay rule을 너무 직접 설명할 수 있다.

환경만으로 충분히 읽히면
S1 문구는 삭제 가능.

### 5. 5-1 Exact Entry

P0는 Stage-local blockout 기준.

Post-Sector04 Boss / Transition이 정해지면
spawn / camera / first hardpoint orientation 재검증.

### 6. 5-2 Handoff

5-2는:

```text
PATROL ×1
+
GLASS ATRIUM
+
HARDPOINT COMMITMENT
```

를 소유.

5-1 Exit에서 Patrol을 실제 공격 상태로 미리 넣지 않는다.

### 7. Foundation Visibility

Enemy가 없는 Stage라 Shear는 가치가 눈에 띄지 않는다.

이는 의도적이다.

Sector05 전체가 Foundation별 동일 효율이어야 한다는 뜻이 아니라
5-1의 학습 대상이 Build가 아니라 Corporate spatial grammar이기 때문이다.

---

SECTOR 05-1 / CORPORATE THRESHOLD — BLOCKOUT CANDIDATE · REV 1.0
