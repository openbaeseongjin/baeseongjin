# SECTOR 05-5 — CORPORATE TRANSFER HALL

*BLOCKOUT CANDIDATE · REV 1.0*

◀ PREV — [SECTOR 05-4 / CONTINUITY SERVICE NODE](../5-4/README.md) · NEXT — [SECTOR 05-6 / INCIDENT COMMAND ANNEX](../5-6/README.md) ▶

`SECTOR 05 CORPORATE ZONE` · `STAGE 05` · `SEQUENTIAL SECURITY / PRIORITY REVEAL` · `NO CUTTER`

| 항목 | 기준 |
|---|---|
| Status | HYPOTHESIS — BLOCKOUT CANDIDATE |
| Authoring Snapshot | `33bdb4997a85330c6b338a7fd06f1ae508767a93` |
| Sector Master | LOCAL REVIEWED — GitHub merge pending |
| 5-1 ~ 5-4 | LOCAL REVIEWED — GitHub merge pending |
| Difficulty | ★★★☆ |
| Expected First Playtime | 150–205 sec |
| Expected Skilled Clear | 60–90 sec |
| Enemy | Standard Sentry T1 ×1 + Patrol Drone T1 ×1 |
| Simultaneous Enemy Pressure | NONE — separated activation bands |
| Cutter | NONE |
| Standard Sentry Rope Cut | NONE — `no-rope-cut` |
| Patrol Rope Cut | NONE — `no-rope-cut` |
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
| Stage Role | Sparse Hardpoint 안에서 정지형 사격 압박과 이동형 진입 타이밍을 순차적으로 구분 |
| Story Role | Capacity 부족 이후 실제로 유지 우선순위가 설정됐음을 첫 공개 |
| Stage-local Exit | Reach Final Transfer Deck → Gate Panel → Physical Crossing |
| Sector 05 Runtime | NOT CONNECTED |
| Approved Gameplay Art | HOLD until Runtime Area / Camera Zone / Stable IDs exist |

---

## 0. 기획 기준

### LOCKED FOR THIS STAGE

5-4에서 Player는 처음으로:

```text
GRID CAPACITY
CRITICAL DEFICIT
```

을 확인했다.

5-5에서는 그 다음 질문에 답한다.

> **“부족한 Capacity 속에서 무엇을 계속 유지하도록 우선했는가?”**

Gameplay 질문:

> **“붙을 곳이 적은 공간에서, 정지형 사격 압박과 이동형 Patrol 압박을 같은 방식으로 처리하지 않고 구분할 수 있는가?”**

### Stage Grammar

```text
STANDARD SENTRY READ
↓
BODY-SHOT EXPOSURE
↓
M0 FULL SAFE RESET
↓
PATROL PREVIEW
↓
ENTRY TIMING
↓
FINAL SAFE DECK
↓
PRIORITY REVEAL
```

### 금지

- Cutter
- 두 Enemy 동시 Activation
- Standard Sentry Rope Cut
- Patrol Rope Cut
- Scanner
- Wind
- Moving Platform
- New Input
- New Rope Mode
- New Growth
- Kill Gate
- Story 중 Combat 강제
- `LOWER ASCENT SUSPENSION AUTHORIZED` 공개
- `LOWER SECTORS EVACUATION SUSPENDED` 공개
- Named villain
- Company-caused-accident framing

---

## 0-1. 최신 GitHub / Runtime 기준

### CURRENT MAIN AT AUTHORING

```text
33bdb4997a85330c6b338a7fd06f1ae508767a93
```

작성 시점 최신 `main`에는
Sector05 Runtime 구현이 추가되지 않았다.

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

### Current Combat

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
```

### Standard Sentry

Current authored precedent에서:

```text
enemyType
sentry-t1

rules
standard-projectile
no-rope-cut
```

을 사용한다.

5-5 Standard Sentry도 반드시:

```text
no-rope-cut
```

을 명시한다.

### Patrol

Current baseline:

```text
speed       48
waitSeconds 0.45
mode        pingpong
```

Target 없음:

```text
patrol
```

Target 획득:

```text
patrol pause
→ aim / fire
```

Target invalid:

```text
patrol resume
```

Patrol 역시:

```text
no-rope-cut
```

유지.

---

## 0-2. 5-4 → 5-5 → 5-6 역할

### 5-4

```text
CAPACITY
CRITICAL DEFICIT
```

### 5-5

```text
PRIORITY
UPPER CONTROL / EVACUATION CAPACITY
MAINTAIN
```

### 5-6

```text
AUTHORIZATION
LOWER ASCENT ROUTING
SUSPENSION AUTHORIZED
```

따라서 5-5는:

```text
constraint
→ priority
```

까지만 간다.

`priority → lower suspension authorization`
은 5-6 소유.

---

## 1. 한 줄 정의

5-4 Continuity Service Node에서 Vertical Grid의 available capacity가 multi-sector stable operation에 부족했다는 사실을 확인한 Player가 Corporate Transfer Hall에 진입해, 하단에서는 `no-rope-cut` Standard Sentry 한 대의 넓은 body-shot sightline을 sparse Hardpoint chain으로 빠르게 통과하고, 완전 안전한 M0 Transfer Relay Deck에서 공격 상태를 끊은 뒤, 상단에서는 `no-rope-cut` Patrol Drone의 현재 위치를 미리 읽고 제한된 H5–H6 Hardpoint에 언제 Commitment할지 선택하여 두 종류의 Security 압박을 순차적으로 처리한 후, 모든 Threat가 종료된 Final Transfer Deck에서 `CONTINUITY PRIORITY — UPPER CORE CONTROL: MAINTAIN / UPPER EVACUATION CAPACITY: MAINTAIN`을 확인해 부족한 Capacity 속에서도 상부 핵심 제어와 상부 대피 능력을 유지하도록 우선순위를 둔 사실을 처음 확정하지만, Lower Ascent의 중단 승인과 Lower-sector evacuation 결과는 아직 보지 못한 채 5-6 Incident Command Annex로 진입하는 Stage.

---

## 2. 전체 게임에서의 역할

### 2-1. Same Space, Different Threat Reading

Lower:

```text
STANDARD SENTRY
=
STATIC FIRING ORIGIN
+
BODY-SHOT PRESSURE
```

Upper:

```text
PATROL
=
MOVING PREVIEW POSITION
+
ENTRY TIMING
```

### 2-2. No Rope Cut

5-3이 Cutter였다.

5-5에서는 의도적으로:

```text
ROPE CUT
0
```

으로 바꿔
Corporate Security가 전부 Cutter로 보이지 않게 한다.

### 2-3. Priority Story Pivot

5-4가:

```text
“용량이 부족했다.”
```

를 보여줬다면

5-5는:

```text
“그래서 무엇을 유지했는지 정했다.”
```

를 보여준다.

### 2-4. 5-6 Preparation

다음 Stage에서는:

```text
유지 우선순위
→ Lower Ascent suspension authorization
```

으로 한 단계 더 간다.

---

## 3. Story 역할

### S0 — Entry

```text
CORPORATE TRANSFER HALL

CONTINUITY ROUTING
ACTIVE
```

### S1 — Mid M0

중간은 Gameplay Reset만.

Story Reveal 없음.

```text
TRANSFER RELAY

LOCAL SECURITY
CLEAR
```

정도만 가능.

### S2 — Final Priority Reveal

P5 Final Safe Deck.

```text
CONTINUITY PRIORITY

UPPER CORE CONTROL
MAINTAIN

UPPER EVACUATION CAPACITY
MAINTAIN
```

### Player가 확정할 수 있는 것

```text
부족한 Capacity 속에서
상부 Core Control과
상부 Evacuation Capacity를
유지 대상으로 지정했다.
```

### 아직 확정할 수 없는 것

```text
그 결과 Lower Ascent를 공식적으로 중단했는가?
누가 그 결정을 승인했는가?
Lower-sector evacuation이 실제로 중단됐는가?
Group A/B/C가 어느 route였는가?
```

### S3 — Exit

```text
INCIDENT COMMAND ANNEX

RESPONSE AUTHORITY
AHEAD
```

5-6 preview.

---

## 4. 공간 콘셉트

### CORPORATE TRANSFER HALL

Corporate Continuity Zone 안의
상부 Control / Evacuation circulation이 갈라지는 큰 Transfer Hall.

### 공간 언어

- wide white bridge
- dark glass shaft
- sealed corporate bulkhead
- sparse cyan hardpoint
- one fixed security node
- one patrol corridor
- central neutral relay deck

### Spatial Structure

```text
LOWER SECURITY BAND
↓
M0 FULL SAFE RELAY
↓
UPPER SECURITY BAND
↓
FINAL PRIORITY DECK
```

### 중요

두 Enemy가 같은 Atrium에 보일 수는 있어도
실제 Activation은 겹치지 않는다.

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
1792 px

Y
0 ~ -1792
```

### Hardpoint

```text
24–32 px
```

### Main Deck

```text
288–448 px
```

### M0

두 Security Band 사이
가장 명확한 Neutral Deck.

### Visual Priority

```text
Hardpoint Cyan
>
Enemy silhouette
>
Projectile
>
Story status
>
Corporate background
```

---

## 6. 전체 맵 구조

```text
Y = 0

P0 ENTRY
  \
   H1
    \
     P1 SAFE SENTRY READ

          H2
           \
            H3
             \
             R1
              \
               M0 FULL SAFE RELAY

                   H4
                    \
                     P3 SAFE PATROL READ

                         H5
                          \
                       [D1 PATROL]
                            \
                             H6
                              \
                               R2
                                \
                                 H7
                                  \
                                   P5 FINAL PRIORITY DECK
                                   PANEL / GATE

Y = -1792
```

### Enemy Separation

```text
S1 LOWER BAND

M0 / P3
NO ENEMY ACQUIRE

D1 UPPER BAND
```

---

## 7. Zone 구성

### Z0 — Entry / Standard Sentry Read

```text
P0 → H1 → P1
```

S1 activation OUT.

P1에서:

- S1
- H2
- H3
- R1

을 읽는다.

### Z1 — Standard Sentry Band

```text
P1 → H2 → H3 → R1
```

H2/H3:

```text
S1 activation IN
```

R1:

```text
OUT
```

### Z2 — M0 Full Safe Reset

```text
R1 → M0
```

S1 OUT.
D1 OUT.

이미 발사된 projectile만 계속 읽는다.

### Z3 — Patrol Preview

```text
M0 → H4 → P3
```

D1 activation OUT.

P3에서:

- full patrol corridor
- H5
- H6
- R2

를 한 화면에 본다.

### Z4 — Patrol Band

```text
P3 → H5 → H6 → R2
```

H5/H6:

```text
D1 activation IN
```

R2:

```text
OUT
```

### Z5 — Final Clean Flow / Story

```text
R2 → H7 → P5
```

Enemy activation 없음.

P5에서 Priority Reveal.

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
| P1 | `(-352, -320)` | `320×32` | Safe Sentry Preview |
| R1 | `(+288, -768)` | `224×24` | Lower Recovery |
| M0 | `(+256, -896)` | `384×32` | Full Safe Relay |
| P3 | `(-288, -1136)` | `320×32` | Safe Patrol Preview |
| R2 | `(+288, -1472)` | `224×24` | Upper Recovery |
| P5 | `(+320, -1696)` | `448×32` | Final Priority Deck |

### 8-2. Service Hardpoints

| ID | Position | Role |
|---|---:|---|
| H1 | `(-320, -192)` | Entry Hardpoint |
| H2 | `(-96, -480)` | Standard Sentry Entry |
| H3 | `(+128, -672)` | Standard Sentry Exit |
| H4 | `(+64, -1024)` | Patrol Approach |
| H5 | `(-96, -1248)` | Patrol Entry |
| H6 | `(+128, -1408)` | Patrol Exit |
| H7 | `(+64, -1584)` | Final Hardpoint |

### 8-3. Standard Sentry S1

```text
Position
(+448, -608)

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

### 8-4. S1 Activation

```text
X
-192 ~ +192

Y
-736 ~ -416
```

Membership:

```text
P1 OUT
H2 IN
H3 IN
R1 OUT
M0 OUT
```

### 8-5. Patrol D1

```text
Initial
(+160,-1312)

Type
patrol-drone-t1
```

Corridor:

```text
(-176,-1312)
↔
(+176,-1312)
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

### 8-6. D1 Activation

```text
X
-192 ~ +192

Y
-1456 ~ -1184
```

Membership:

```text
P3 OUT
H5 IN
H6 IN
R2 OUT
H7 OUT
```

### 8-7. Sealed Surface 후보

```text
sector-05-05:sealed-lower-west
sector-05-05:sealed-lower-east
sector-05-05:sealed-relay-wall
sector-05-05:sealed-upper-glass
sector-05-05:sealed-priority-wall
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
→ M0
→ H4
→ P3
→ H5
→ H6
→ R2
→ H7
→ P5
```

### Distance Pre-check

| Link | Distance |
|---|---:|
| P0 → H1 | `271.5 px` |
| H1 → P1 | `131.9 px` |
| P1 → H2 | `301.9 px` |
| H2 → H3 | `295.0 px` |
| H3 → R1 | `186.6 px` |
| R1 → M0 | `131.9 px` |
| M0 → H4 | `230.8 px` |
| H4 → P3 | `369.4 px` |
| P3 → H5 | `222.3 px` |
| H5 → H6 | `275.3 px` |
| H6 → R2 | `172.3 px` |
| R2 → H7 | `250.4 px` |
| H7 → P5 | `279.4 px` |

### Result

```text
MAX SAFE LINK
= 369.4 px

CURRENT DERIVED HOOK REACH
= 400 px

MARGIN
= 30.6 px
```

### Important

가장 긴:

```text
H4 → P3
369.4
```

는 Enemy activation 밖으로 향하는
Patrol Preview 접근.

Threat band 내부 Mandatory link는 더 짧다.

---

## 10. Flow Route

### Route

```text
P0
→ H1
→ H2
→ H3
→ M0
→ H4
→ H5
→ H6
→ H7
→ P5
```

P1 / R1 / P3 / R2 landing 대부분 생략.

### Distance Pre-check

| Link | Distance |
|---|---:|
| P0 → H1 | `271.5 px` |
| H1 → H2 | `364.9 px` |
| H2 → H3 | `295.0 px` |
| H3 → M0 | `258.0 px` |
| M0 → H4 | `230.8 px` |
| H4 → H5 | `275.3 px` |
| H5 → H6 | `275.3 px` |
| H6 → H7 | `187.3 px` |
| H7 → P5 | `279.4 px` |

### Result

```text
MAX FLOW LINK
= 364.9 px
```

### Intent

5-5는 max-range Stage가 아니다.

난이도는:

```text
THREAT TYPE SWITCH
+
SPARSE ATTACH OPTIONS
```

에서 나온다.

---

## 11. Lower Standard Sentry Contract

### S1

```text
Stationary Standard Sentry T1 ×1
```

### Rope Cut

```text
NONE
```

반드시:

```text
no-rope-cut
```

### Player Problem

Cutter처럼 Rope Line 자체를 지키는 것이 아니라:

```text
body-shot angle
+
limited Hardpoint
+
exposure duration
```

를 관리.

### Good Skill

- H2→H3 빠른 연결
- early release
- projectile body-path 회피
- R1 recovery

### Kill

```text
OPTIONAL
```

---

## 12. Mid Full Safe Reset

### M0

```text
(+256,-896)
```

### Contract

```text
S1 activation
OUT

D1 activation
OUT
```

### Purpose

Player가:

```text
“지금부터 적 종류가 바뀐다.”
```

를 명확히 느끼게 한다.

### Already-fired Projectile

M0 진입 시
기존 S1 projectile은 삭제되지 않는다고 가정.

새 acquire만 종료.

### No Story Dump

M0는 Gameplay Reset.

Priority Reveal을 여기서 하지 않는다.

---

## 13. Upper Patrol Contract

### D1

```text
Patrol Drone T1 ×1
```

### Rope Cut

```text
NONE
```

### Before Activation

P3에서:

```text
D1 patrols
```

### On Activation

H5/H6 band 진입:

```text
valid target
→ patrol pause
→ aim / fire
```

### Player Problem

Standard Sentry와 달리
진입 전에:

```text
D1 current position
```

을 보고 시작 각도를 선택.

### Mandatory Wait

없음.

D1이 corridor 어디에 있어도
Safe Route clear 가능해야 한다.

---

## 14. Enemy Separation Contract

### S1 Band

```text
Y -736 ~ -416
```

### D1 Band

```text
Y -1456 ~ -1184
```

### Vertical Separation

두 band 사이:

```text
448 px
```

의 activation-free gap.

### Safe Structures

```text
R1
M0
P3
R2
```

에서 관련 Enemy 새 acquire 없음.

### FAIL

```text
S1 + D1
same mandatory segment active
```

---

## 15. Recovery

### P1

Lower band 진입 전 Safe Preview.

### R1

Standard Sentry body-hit / miss recovery.

### M0

Full reset.

### P3

Patrol Preview.

### R2

Patrol band recovery.

### Target

일반 실패:

```text
≤ 4 sec
```

안에:

```text
R1
M0
R2
or forward progression
```

복귀.

### No Full Reset

Upper Patrol miss가 P0까지 떨어지면 FAIL.

---

## 16. Foundation Expression

### IMPULSE COIL

Lower:

```text
S1 exposure compression
```

Upper:

```text
Patrol band 빠른 탈출
```

### RELAY LINK

Sparse Hardpoint chain에서
두 Security band 모두 일관되게 강함.

### SHEAR CURRENT

두 Enemy 모두 optional Rope-line offense 가능.

하지만:

```text
SHEAR SHOWCASE
```

아님.

### Mandatory

```text
NO FOUNDATION REQUIRED
```

---

## 17. Story Trigger

### S0 — Entry

```text
CORPORATE TRANSFER HALL

CONTINUITY ROUTING
ACTIVE
```

### S1 — Final Priority Deck

Threat 완전 종료 후 P5.

```text
CONTINUITY PRIORITY

UPPER CORE CONTROL
MAINTAIN

UPPER EVACUATION CAPACITY
MAINTAIN
```

### S2 — Exit

```text
INCIDENT COMMAND ANNEX

RESPONSE AUTHORITY
AHEAD
```

### Presentation

- movement lock 없음
- terminal interaction 없음
- combat band text 없음
- broad traversal trigger

---

## 18. Story Disclosure Boundary

### 이번 Stage에서 확정

```text
Capacity shortage가 있었고,
그 안에서 Upper Core Control과
Upper Evacuation Capacity를
유지 대상으로 지정했다.
```

### 아직 미확인

```text
Lower Ascent 중단 승인
```

5-6.

```text
Lower-sector evacuation 실제 중단
```

5-7.

```text
조직 책임 / 최종 WHY
```

5-8.

### 중요

5-5에서:

```text
Upper kept
therefore Lower was suspended
```

직접 causal sentence를 쓰지 않는다.

Player가 추론할 수는 있지만
공식 Authorization은 아직 보지 못했다.

---

## 19. Camera

모두 HYPOTHESIS.

### C0 — Lower Sentry Preview

```text
P0 / H1 / P1 / S1 / H2

Desktop 0.92
Mobile 0.70
```

### C1 — Lower Band

```text
H2 / H3 / S1 / R1 / M0

Desktop 0.88
Mobile 0.68
```

### C2 — Full Reset / Patrol Preview

```text
M0 / H4 / P3 / full D1 corridor

Desktop 0.88
Mobile 0.68
```

### C3 — Patrol Band

```text
P3 / H5 / D1 / H6 / R2

Desktop 0.86
Mobile 0.66
```

### C4 — Final Priority Deck

```text
R2 / H7 / P5 / Priority Display / Gate

Desktop 0.96
Mobile 0.72
```

### Required

P3에서:

```text
full D1 corridor
+
H5
+
H6
+
R2
```

동시에 보여야 한다.

---

## 20. Gate Contract

Stage-local intent:

```text
Reach P5
→ Gate Panel
→ Gate Open
→ Physical Crossing
→ 5-6
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
(+320,-1696)
```

Panel:

```text
(+480,-1696)
```

Gate:

```text
(+608,-1696)
```

### Kill Optional

S1/D1 생존 여부와 무관.

---

## 21. Pixel Art Asset Spec

### Lower Band

- clean security bridge
- fixed wall-mounted sentry
- white panel + dark glass
- cyan hardpoints
- sparse cover-free sightline

### M0

- neutral transfer relay
- soft white lighting
- no danger cue

### Upper Band

- taller glass transfer void
- visible patrol corridor
- minimal clutter
- same hardpoint family

### Priority Deck

Display:

```text
UPPER CORE CONTROL
MAINTAIN

UPPER EVACUATION CAPACITY
MAINTAIN
```

### 금지

- Lower-sector red X
- casualty icon
- executive portrait
- “SAVE UPPER / ABANDON LOWER” 문구

---

## 22. Background / VFX / Sound

### Background

Lower:

- controlled service corridor
- sealed access walls

Mid:

- large transfer relay shaft

Upper:

- glass evacuation bridge
- distant upper circulation

### Standard Sentry Audio

기존 acquire / fire family.

### Patrol Audio

P3에서 motor movement가 먼저 들림.

Activation 후:
- acquire
- lock
- fire

### M0

Combat layer를 확실히 낮춘다.

### Final Story

soft continuity-status tone.

Alarm / villain sting 금지.

---

## 23. Multiplayer Contract

### Enemy Bands

Player A가 Lower S1 band,
Player B가 Upper D1 band에 있을 수 있다.

각 Enemy는
자기 activation 안 eligible target만 사용.

### M0 / P3

새 acquire 없음.

### Patrol

Target 획득 시 Patrol pause.

### Standard Sentry

`no-rope-cut`.

### Cross-player projectile

Target A용 projectile이
Player B body에 우발 충돌하는지
추후 Runtime multiplayer 검증.

### Story

P5 Priority fact는 shared world fact.

Movement lock 없음.

### Gate

```text
shared open
individual crossing
```

---

## 24. PASS Criteria

### Gameplay

- Standard Sentry exactly 1
- Patrol exactly 1
- Cutter 0
- both enemies `no-rope-cut`
- Activation overlap 없음
- S1 band → M0 reset → D1 band 구조 명확
- P1 Safe
- R1 Safe
- M0 Safe
- P3 Safe
- R2 Safe
- D1 patrol corridor P3에서 전부 보임
- Kill Optional
- Safe max 369.4px
- Flow max 364.9px
- all Hook links <400px
- no new input
- no new Rope mode
- no Growth
- no Foundation lock

### Story

- `GRID CAPACITY CRITICAL DEFICIT` 이후 Priority Reveal로 이어짐
- Upper Core Control MAINTAIN
- Upper Evacuation Capacity MAINTAIN
- Lower Ascent suspension authorization 미공개
- Lower evacuation suspension 미공개
- Named decision-maker 미공개

### Production

- Runtime implementation HOLD
- Approved Gameplay Art HOLD
- 5-5→5-6 Runtime wiring 없음

---

## 25. FAIL Conditions

### Gameplay

- S1 projectile가 Rope를 자름
- D1 projectile가 Rope를 자름
- 두 Enemy activation overlap
- M0에서 새 acquire 발생
- P3에서 Patrol corridor가 안 보임
- 특정 Patrol 위치를 기다려야만 clear
- Enemy kill이 progression key
- Sealed Surface 뒤 free grapple parent
- 380~400px Mandatory 반복
- Cutter 추가
- Scanner / Wind 추가
- one miss → P0 reset

### Story

- 5-5에서 `LOWER ASCENT SUSPENSION AUTHORIZED` 공개
- `LOWER SECTORS EVACUATION SUSPENDED` 공개
- `Upper를 살리기 위해 Lower를 버렸다`를 직접 시스템 문장으로 확정
- Named villain
- Company caused Cascade 암시

### Production

- Sector05 Runtime 구현 시작
- Approved Art 생성
- 5-6 Enemy pre-spawn
- Boss/Transition 추정

---

## 26. 개발자 / 기획자 최종 전달 요약

### Stage

```text
SECTOR 05-5
CORPORATE TRANSFER HALL
```

### Core

```text
STANDARD SENTRY
→ FULL SAFE RESET
→ PATROL
```

### Lower Enemy

```text
S1 Standard Sentry T1
no-rope-cut
```

### Upper Enemy

```text
D1 Patrol T1
speed 48
wait 0.45
pingpong
no-rope-cut
```

### Geometry

```text
SAFE MAX
369.4 px

FLOW MAX
364.9 px

HOOK REACH
400 px
```

### Story

```text
CONTINUITY PRIORITY

UPPER CORE CONTROL
MAINTAIN

UPPER EVACUATION CAPACITY
MAINTAIN
```

### Meaning

```text
CAPACITY SHORTAGE
→
UPPER CAPABILITY PRESERVATION PRIORITY
```

### Still Hidden

```text
LOWER ASCENT SUSPENSION AUTHORIZATION
LOWER EVACUATION OUTCOME
FINAL WHO / WHY
```

### Do Not Add

- Cutter
- Wind
- Scanner
- New Mechanic
- Growth
- Kill Gate
- Boss

### Stage Feeling

> **“용량이 부족했다는 건 이미 안다. 이제 두 종류의 보안을 지나며 확인하는 것은, 그 부족한 여유 속에서 상부 제어와 상부 대피 능력은 ‘유지’ 대상으로 분명히 지정돼 있었다는 사실이다.”**

---

## OPEN QUESTIONS

### 1. H4→P3 Safe 369.4px

Safe Route에서 가장 긴 연결.

Threat-free transition이라 현재 허용.

Mobile에서 반복 miss가 높으면
P3를 8~16px inward.

### 2. Lower Sentry Activation

현재:

```text
X -192 ~ +192
Y -736 ~ -416
```

H2/H3만 IN.

Body-shot pressure가 너무 짧으면
Y 범위를 넓히기보다
H2/H3 체류 / Camera를 먼저 조정.

### 3. D1 Corridor

현재:

```text
-176 ↔ +176
```

진입 타이밍 차이가 약하면
±208까지 확대 후보.

### 4. Priority Wording

현재:

```text
UPPER CORE CONTROL
MAINTAIN

UPPER EVACUATION CAPACITY
MAINTAIN
```

`UPPER`가 너무 직접적이라도
이번 Stage는 의도적으로 Priority를 공개하는 단계라 유지 가능.

다만 UI 톤에서 더 행정적으로 만들면:

```text
PRIORITY CLASS
CORE CONTROL / EVACUATION CAPACITY
MAINTAIN
```

후보.

### 5. “Evacuation Capacity” vs “Evacuation Route”

현재는:

```text
CAPACITY
```

를 권장.

Route라고 쓰면
Group A/B/C 실제 이동 경로가 확정된 것처럼 읽힐 수 있다.

### 6. M0 Length

두 Enemy가 정말 다른 encounter로 읽히려면
M0에서 1~2초 정도 시각적 안정이 필요.

Timer pause는 하지 않는다.

### 7. 5-6 Handoff

5-6은 처음으로:

```text
LOWER ASCENT ROUTING
SUSPENSION AUTHORIZED
```

를 공개.

5-5 Exit에서는:

```text
INCIDENT COMMAND ANNEX
RESPONSE AUTHORITY AHEAD
```

까지만 보여준다.

---

SECTOR 05-5 / CORPORATE TRANSFER HALL — BLOCKOUT CANDIDATE · REV 1.0
