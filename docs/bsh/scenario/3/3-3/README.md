# SECTOR 03-3 — RETAIL SECURITY WALK

*BLOCKOUT CANDIDATE · REV 1.0*

◀ PREV — [SECTOR 03-2 / SCANNER GALLERY](../3-2/README.md) · NEXT — [SECTOR 03-4 / SERVICE ARCADE](../3-4/README.md) ▶

`SECTOR 03 COMMERCIAL DISTRICT` · `STAGE 03` · `SCANNER + PATROL SYNTHESIS` · `COMMIT UNDER SECURITY PRESSURE`

| 항목 | 기준 |
|---|---|
| Status | HYPOTHESIS — BLOCKOUT CANDIDATE |
| Difficulty | ★★★ |
| Expected First Playtime | 135–200 sec |
| Expected Skilled Clear | 55–85 sec |
| Enemy | Patrol Drone T1 × 1 |
| Scanner | ACCESS SCAN FIELD × 1 group |
| New Mechanic | NONE — 3-2 Scanner reuse |
| New Enemy Behavior | NONE — current Patrol capability reuse |
| New Input | NONE |
| New Rope Mode | NONE |
| New Augment | NONE |
| Wind | NONE |
| Rope Cut | NONE for Patrol Drone |
| Required Kill | NONE |
| Checkpoint | NONE |
| Exit | Existing objective → Gate Panel → player enters opened Gate |
| Required Build | Foundation + Specialization carried, but no Build Lock |
| Primary Role | First Scanner + Moving Security synthesis |
| Primary Space | Powered Retail Security Walk / Vertical Storefront Gallery |

---

## 0. 기획 기준

### LOCKED FOR THIS STAGE

3-3은 3-2에서 배운:

```text
ACCESS SCAN FIELD
```

와 Sector 02에서 배운:

```text
PATROL DRONE T1
```

을 처음 결합한다.

새 시스템을 추가하지 않는다.

### 핵심 플레이 문장

```text
OBSERVE SCANNER
+
OBSERVE PATROL POSITION
→
CHOOSE COMMIT WINDOW
→
ATTACH
→
ENTER ACTIVATION BAND
→
KEEP ROPE FLOW
→
EXIT BAND
```

### 중요한 원칙

3-3의 난이도는:

```text
Scanner 속도 증가
+
Drone 강화
```

로 만들지 않는다.

기존 두 규칙을
**한 번의 Commit 판단 안에 겹쳐서** 올린다.

### 금지

- Scanner Damage
- Scanner Rope Cut
- Scanner Forced Detach
- Scanner Faster Variant
- Drone T2
- Faster Drone
- Faster Fire Rate
- Burst Fire
- Dash / Chase
- Security Shutter
- Wind
- Turret
- 두 번째 Enemy
- Build-locked Route
- 새 Interaction Key

---

## 0-1. 최신 GitHub / Runtime 교차검증

### VERIFIED — CURRENT MAIN

작성 시점 확인한 최신 `main` HEAD:

```text
9ef4610a21e1285ad4a4bad8b2841058d3a2eed3
```

현재 Runtime은:

```text
SECTOR 01
+
SECTOR 02
=
16 authored areas
```

를 하나의 연속 World로 실제 조립한다.

현재 `CurrentAuthoredAreaCatalog`에는:

```text
sector01
sector02
```

만 연결되어 있으며,
Sector 03 Runtime Catalog는 아직 없다.

따라서:

```text
3-1
3-2
3-3
```

은 현재 문서상 정의돼 있지만
아직 CURRENT AUTHORED RUNTIME에는 연결되지 않았다.

### VERIFIED — Patrol Drone Implementation

Patrol Drone은 이제 실제 Runtime capability가 존재한다.

현재 구조:

```text
EnemyObject
+
optional patrol config
+
activation bounds
+
existing enemy weapon
```

Patrol data가 있으면 `EnemyPatrol.js`가:

- points / route / corridor
- speed
- waitSeconds
- pingpong / loop

를 처리한다.

Sector 02 authored Patrol Drone 현재 baseline:

```text
speed       48
waitSeconds 0.45
mode        pingpong
```

### VERIFIED — Current Target Behavior

현재 Enemy는:

```text
NO TARGET
→ patrol moves

TARGET ACQUIRED INSIDE ACTIVATION
→ target lock
→ patrol movement pauses
→ existing projectile fire

TARGET INVALID / LEFT BAND
→ lock clears
→ patrol resumes
```

즉 3-3은:

```text
계속 움직이며 추격 사격하는 Drone
```

을 가정하지 않는다.

### VERIFIED — Patrol Drone Rope-Cut Rule

Current Enemy projectile 생성은:

```text
canCutRope = !rules.includes("no-rope-cut")
```

을 사용한다.

Sector 02 Patrol Drone authored rule에는:

```text
no-rope-cut
```

이 있다.

3-3도 같은 Patrol Drone T1을 재사용하므로
Projectile은 Rope Cut을 만들지 않는다.

### VERIFIED — Current Rope Surface Rule

현재 `AreaDefinition.rectangle()`은 기본:

```text
grappleable: true
```

이고,
`RopePointerInput.findRopeAttachment()`은:

```text
surface.grappleable === false
→ skip
```

을 실제로 처리한다.

따라서 3-2 작성 시점과 비교하면
**static grappleable filter는 이미 구현된 상태**다.

그러나:

```text
grappleAccessGroup
Scanner phase-based dynamic attach filter
```

는 현재 코드에서 확인되지 않는다.

따라서 Access Scan Field의 동적 상태 제어는
여전히 IMPLEMENTATION DEPENDENCY다.

### VERIFIED — Current Gate Contract

현재 authored Stage는:

```text
objective complete
→ Gate Panel interaction
→ Gate unlock/open
→ Player physically enters Gate
```

구조로 정렬돼 있다.

최근 Runtime 결정:

- Gate를 목표 완료 즉시 자동 개방하지 않음
- 문 옆 Gate Panel을 조작
- PC / Mobile 모두 기존 Jump 계열 조작을 문맥 interaction으로 재사용
- 별도 E Key 추가하지 않음
- Gate 외 층간 경계는 물리적으로 우회 불가
- 열린 Gate는 플레이어별로 직접 통과

따라서 3-3도 이 Exit Contract를 따른다.

### DEPLOYED GAME CHECK

제공된 GitHub Pages URL은
이번 환경에서 직접 인터랙티브 플레이 fetch가 되지 않았다.

따라서 현재 구현 판정은:

```text
latest main
+
authored runtime catalog
+
recent merged implementation commits
```

을 Source of Truth로 사용한다.

---

## 0-2. 3-2 구현 메모의 최신화 필요점

3-2 문서에는 당시:

```text
Rope Targeting에 grappleable / Security Filter가 아직 없다
```

는 취지의 구현 메모가 있다.

현재 main에서는:

```text
grappleable === false
```

static filter가 이미 존재한다.

따라서 현재 정확한 상태는:

```text
STATIC GRAPPLEABLE FILTER
= IMPLEMENTED

DYNAMIC SCANNER ACCESS GROUP
= NOT IMPLEMENTED
```

이다.

3-2의 Gameplay Rule 자체는 바뀌지 않는다.

향후 3-2 문서 Runtime Note를 수정할 때
이 부분만 최신 코드에 맞게 갱신한다.

---

## 1. 한 줄 정의

3-2에서 Access Scan Field의 `AVAILABLE → WARNING → LOCKED → RESET` 문법을 배운 Player가,
Powered Retail Security Walk의 안전한 대기 Deck에서 **Scanner 상태와 Patrol Drone의 순찰 위치를 동시에 관찰한 뒤** Scanner-controlled Service Mount에 Rope를 걸어 Drone activation band를 한 번에 돌파하고,
안전한 상단 Gallery에서 기존 Gate Panel을 열어 3-4 Service Arcade로 넘어가는 첫 Security Synthesis Stage.

---

## 2. 전체 게임에서의 역할

Sector 03 진행:

```text
3-1
POWERED SPACE
“여긴 살아 있다.”

↓

3-2
ACCESS SCAN FIELD
“언제 Attach할 것인가?”

↓

3-3
SCANNER + PATROL
“언제 Commit할 것인가?”

↓

3-4
SERVICE ARCADE
“어느 Route를 고를 것인가?”
```

3-3은 새로운 Route Puzzle을 크게 추가하지 않는다.

핵심은:

```text
TWO KNOWN SIGNALS
→
ONE COMMIT DECISION
```

이다.

---

## 3. Story 역할

### 3-2까지

Player는 Commercial Security가
자신을:

```text
EMPLOYEE VERIFIED

ROUTE AUTHORIZATION
INVALID
```

로 계속 판정한다는 것을 확인했다.

### 3-3

새로운 사회적 진실을 추가하지 않는다.

대신:

```text
RETAIL SECURITY
ACTIVE

AUTOMATED PATROL
ONLINE
```

정도의 System 상태를 보여준다.

핵심:

> 사람이 없어도 Commercial Security는
> 접근 통제를 계속 수행한다.

### 아직 공개하지 않음

- Group A 정체
- Group B 정체
- Priority Customer
- Access Tier A/B
- Executive Access
- Group C 중단 원인
- Corporate 명령
- 고의적 Worker 희생

### 3-4 Preview

Exit 근처에:

```text
SERVICE ARCADE
PUBLIC / SERVICE ACCESS
```

정도의 방향 Sign은 가능.

아직 실제 Front / Back Route의
Gameplay 차이를 3-3에서 본격 설명하지 않는다.

---

## 4. 공간 콘셉트

**VERTICAL RETAIL SECURITY WALK**

Commercial Atrium의 한쪽 벽을 따라
수직으로 이어지는 Retail Gallery.

구조:

```text
POLISHED STOREFRONT
+
SECURITY-CONTROLLED SERVICE MOUNT
+
PATROL BAND
+
SAFE WAIT DECK
+
UPPER RETAIL TERRACE
```

### 핵심 공간 논리

Scanner와 Drone을
Stage 전체에 동시에 뿌리지 않는다.

```text
REMINDER SCANNER
→
SAFE OBSERVATION
→
ONE COMBINED SECURITY BAND
→
SAFE CONFIRMATION
```

구조다.

---

## 5. Pixel / Grid 기준

### VERIFIED — CURRENT MAIN

```text
Player Radius            15
Gravity                  1250
Max Horizontal Speed     360
Jump Speed               440

Rope Max Attach Distance 400
Attach Buffer            0.1 sec
Swing Impulse            780

Camera Desktop Zoom      1
Camera Mobile Zoom       0.72
```

### VERIFIED — Enemy Baseline

```text
Enemy Radius             18
Enemy Health             100
Enemy Attack Range       760
Enemy Fire Interval      1.0 sec
Enemy Projectile Speed   520
Enemy Projectile Radius  7
Enemy Projectile Damage  20
```

Patrol Drone T1은
이 전투 규칙을 재사용한다.

### VERIFIED — Patrol Baseline

현재 Sector 02 authored implementation:

```text
Patrol Speed             48
Patrol Wait              0.45 sec
Patrol Mode              pingpong
```

3-3에서 강화하지 않는다.

### HYPOTHESIS — BLOCKOUT

```text
BASE GRID     32 px

WIDTH         1280 px
              40 tiles

HEIGHT        1216 px
              38 tiles

X             -640 ~ +640
Y                0 ~ -1216
```

### Mandatory Grapple 목표

```text
200–360 px
```

Scanner + Enemy 판단과
Max Range Challenge를 동시에 강제하지 않는다.

---

## 6. 전체 맵 구조

```text
Y -1216

┌──────────────────────────────────────────────────────────────┐
│                             GATE → 3-4 SERVICE ARCADE        │
│                       P5 █████████████  [PANEL]              │
│                              ▲                               │
│                         G5 ●                                 │
│                           ╱                                  │
│                 P4 █████████████                             │
│                       ▲                                      │
│                  G4 ●                                        │
│                    ╲                                         │
│                     ╲                                        │
│                  P3 █████████                                │
│                       ▲                                      │
│                  G3 ●  ← ACTIVATION BAND EXIT               │
│                    ╲                                         │
│                     ╲                                        │
│               C2 ● [CONTROLLED]                             │
│                   ╲                                          │
│            ← PATROL DRONE T1 →                              │
│                    y -560                                    │
│                                                             │
│       S2 █████████████      R1 ███████                      │
│         SAFE OBSERVATION         SAFE RECOVERY               │
│                ▲                                            │
│           C1 ● [CONTROLLED REMINDER]                        │
│              ╱                                               │
│         P1 ███████████                                      │
│              ▲                                               │
│         P0 ENTRY                                             │
└──────────────────────────────────────────────────────────────┘

Y 0
```

---

## 7. Zone 구성

### ZONE A — SCANNER REMINDER

```text
Y 0 ~ -352
```

Enemy 없음.

C1 하나로 3-2 Rule을 짧게 복습.

```text
AVAILABLE / WARNING
→ attach

LOCKED / RESET
→ no new attach
```

새 설명을 길게 반복하지 않는다.

### ZONE B — SAFE OBSERVATION DECK

```text
Y -352 ~ -448
```

S2.

완전 Safe.

S2는 Drone activation band 바깥.

Player가 여기서 동시에 볼 수 있어야 한다.

- C2 Scanner State
- Drone patrol position
- G3 Exit Pivot
- R1 Recovery

### ZONE C — COMBINED SECURITY BAND

```text
Y -448 ~ -768
```

Stage 핵심.

Player는 S2에서:

```text
Scanner window
+
Drone patrol position
```

을 읽고 Commit.

C2에 Attach해
Drone patrol line을 가로질러
G3로 상승.

중요:

```text
S2 → G3
```

사이에 C2를 대체할
Always-Grappleable Permanent Pivot을 두지 않는다.

Combined Band의 전진 Attach는
C2 Scanner Window를 반드시 읽게 하되,
대기와 Recovery는 안전하게 제공한다.

### ZONE D — SAFE CONFIRMATION

```text
Y -768 ~ -1024
```

G3를 지나면 Drone activation band 종료.

Scanner-controlled Surface도 종료.

기존 Permanent Grapple Rhythm으로 복귀.

### ZONE E — GATE APPROACH

```text
Y -1024 ~ -1216
```

Enemy 없음.

Scanner 없음.

P5에서 Stage objective 완료 후
Gate Panel Interaction.

Gate Open 뒤
Player가 직접 Gate를 통과한다.

---

## 8. 좌표 / 오브젝트

### HYPOTHESIS — BLOCKOUT CANDIDATE

| ID | X | Y | Width | 역할 |
|---|---:|---:|---:|---|
| P0 | -544~-320 | 0 | 224 | Entry |
| P1 | -480~-160 | -160 | 320 | Scanner Reminder Deck |
| C1 | -160~-32 | -288 | 128 | Controlled Surface — Reminder |
| S2 | -224~+128 | -416 | 352 | Safe Observation Deck |
| R1 | +256~+512 | -416 | 256 | Safe Recovery outside Drone band |
| C2 | +64~+192 | -640 | 128 | Controlled Surface — Combined Commit |
| G3 | -64~+64 | -800 | 128 | Activation Band Exit Pivot |
| P3 | -160~+160 | -864 | 320 | First Safe Upper Landing |
| G4 | +128~+256 | -960 | 128 | Permanent Upper Pivot |
| P4 | +160~+448 | -1024 | 288 | Retail Terrace |
| G5 | +32~+160 | -1104 | 128 | Final Pivot |
| P5 | +224~+512 | -1152 | 288 | Objective / Gate Deck |
| Gate Panel | +480 | -1120 | — | Existing contextual Gate interaction |
| Gate | +544 | -1152 | — | To 3-4 |

### ACCESS SCANNER S1 — HYPOTHESIS

```text
Position:
X +480
Y -576

controlled group:
scanner-retail-A

controls:
C1
C2

timing:
reuse 3-2 baseline
```

초기 3-2 후보:

```text
AVAILABLE   1.50 sec
WARNING     0.60 sec
LOCKED      1.10 sec
RESET       0.30 sec
```

3-3에서 더 빠르게 만들지 않는다.

### PATROL DRONE D1 — HYPOTHESIS POSITION / VERIFIED BEHAVIOR FAMILY

```text
Start:
X -256
Y -560

End:
X +256
Y -560

Speed:
48

Wait:
0.45 sec

Mode:
pingpong
```

Activation:

```text
X -512 ~ +512
Y -768 ~ -448
```

S2 / R1은
Player center 기준 activation 바깥에 둔다.

---

## 9. Safe Route

```text
P0
→ P1
→ C1
→ S2
→ observe scanner + patrol
→ wait for favorable commit
→ C2
→ G3
→ P3
→ G4
→ P4
→ G5
→ P5
→ Gate Panel
→ Gate
```

### Safe Route의 핵심

S2에서 기다리는 것은
정상적인 Safe Play다.

Commit 후에는:

```text
STOP AND WAIT
```

보다:

```text
KEEP MOVING
```

이 안전하다.

### Scanner

C2가:

```text
AVAILABLE / WARNING
```

일 때 Attach.

이미 붙은 뒤 LOCKED가 되어도
Rope 유지.

### Drone

Player가 activation band에 들어가면
현재 Runtime 기준 Drone이 target을 획득할 수 있다.

한 번 Commit했다면
G3까지 빠르게 벗어나는 것이 목표.

### `swingImpulse = 0`

Safe Route 통과 가능해야 한다.

---

## 10. Flow Route

숙련자는:

```text
P1
→ C1
→ S2
→ C2
→ Release
→ G3
→ G4
→ G5
→ P5
```

처럼 Landing을 줄일 수 있다.

### Flow의 보상

좋은 Commit은:

```text
Scanner Wait ↓
Drone Exposure ↓
Landing Count ↓
```

를 동시에 만든다.

### 금지

Scanner와 Drone의 정확한 위상 조합 하나만
정답으로 만들지 않는다.

예:

```text
Scanner AVAILABLE 시작 0.2초 뒤
Drone x=-137일 때만 성공
```

같은 프레임 퍼즐 금지.

---

## 11. Build Expression

### NO BUILD LOCK

모든 Foundation / Specialization으로 통과 가능.

### IMPULSE

자연스러운 이점:

- C2 Commit 후 activation band 체류시간 감소
- G3까지 Arc 압축
- Upper permanent route Landing 일부 감소

### RELAY

자연스러운 이점:

```text
C2
→ G3
→ G4
```

연속 Re-Attach.

### SHEAR

C2 자체가 Drone patrol line을 가로지르는 Rope Geometry를 만들 수 있다.

조건이 맞으면:

```text
C2 attached
+
rope line crosses D1
+
release
```

로 공격적 해법 가능.

하지만:

```text
Drone Kill
```

은 절대 필수 아님.

### 중요한 규칙

Scanner는 Build가 무효화하지 않는다.

```text
IMPULSE ≠ Scanner immune
RELAY ≠ Locked attach
SHEAR ≠ Scanner destroy
```

---

## 12. Recovery

### C1 실패

P1로 즉시 복귀.

### Combined Commit 실패

C2 / G3 이동 실패 시:

```text
S2
or
R1
```

로 떨어지게 한다.

두 Deck 모두
Drone activation band 바깥이므로
**새 Target Acquire / 새 Attack Cycle의 대상이 되지 않는다.**

단 현재 Enemy Projectile은 발사 뒤 독립적으로 이동하므로,
band 밖으로 나갔다고 이미 발사된 탄이 즉시 삭제되는 것은 아니다.

따라서 R1은:

```text
NO NEW FIRE
```

를 보장하는 Recovery이며,

```text
PROJECTILE IMMUNITY
```

를 의미하지 않는다.

### 목표

실패 후:

```text
≤ 5 sec
```

내 다음 Commit 준비.

Scanner Cycle Wait는
Recovery Time과 별도 Metric으로 기록.

### 금지

```text
NO START RESET
NO FULL-STAGE FALL
NO DAMAGE FLOOR
NO FORCED ROPE DETACH
NO RECOVERY INSIDE SUSTAINED DRONE FIRE
```

---

## 13. Enemy / Hazard

### PATROL DRONE T1 × 1

Current implemented behavior family 재사용.

### Encounter 전

```text
NO TARGET
→ Drone patrols
```

Player는 S2에서
Drone 위치를 읽는다.

### Encounter 중

Player가 activation band에 진입하고
eligible target이 되면:

```text
TARGET ACQUIRED
→ target locked
→ patrol pauses
→ existing projectile fire
```

따라서:

> 이동 중인 Drone을 계속 추적하면서
> Scanner까지 동시에 계산

하는 것이 목적이 아니다.

핵심은:

> **들어가기 전에 이동 위치를 읽고,
> 들어간 뒤에는 Rope 흐름을 유지한다.**

### Projectile

Current baseline:

```text
Speed    260
Damage   20
Interval 1.4 sec
```

Patrol Drone rule:

```text
no-rope-cut
```

유지.

### Cover

현재 Enemy targeting은:

```text
activation bounds
+
distance
```

기반이며
별도 LOS 차단을 Stage 안전성의 전제로 삼지 않는다.

따라서 Storefront / Rail 뒤를:

```text
SAFE COVER
```

라고 설계하지 않는다.

안전은:

```text
activation band 밖
```

으로 정의한다.

---

### Scanner / Drone Interaction Rule

### Scanner가 바꾸는 것

```text
C1 / C2 NEW ATTACH AVAILABILITY
```

### Drone이 바꾸는 것

```text
COMMIT AFTER ENTERING BAND의 PRESSURE
```

### 서로 바꾸지 않는 것

Scanner가:

- Drone을 켜지 않음
- Drone Fire Rate를 바꾸지 않음
- Alarm으로 추가 Enemy Spawn하지 않음

Drone이:

- Scanner Phase를 바꾸지 않음
- Scanner를 Lock하지 않음
- C2 availability를 바꾸지 않음

### 이유

첫 결합 Stage에서
두 시스템은 독립적으로 예측 가능하되
Player의 Commit 순간에만 함께 압력을 준다.

---

## 14. Camera

### VERIFIED

현재 Camera baseline:

```text
Desktop Zoom 1
Mobile Zoom 0.72
```

### S2 Observation Composition

S2에서 한 화면 안에 우선 보여야 하는 것:

1. C2
2. Scanner State Cue
3. Drone D1 patrol
4. G3
5. R1 Recovery

### 중요

Drone이 화면 밖에서
첫 Projectile을 쏘면 실패.

C2가 Scanner 상태만 보이고
Drone이 안 보이는 구성도 실패.

### Custom Pan

없음.

---

## 15. Story Trigger

### TRIGGER A — RETAIL SECURITY

P1 / C1 주변:

```text
RETAIL SECURITY
ACTIVE
```

### TRIGGER B — ROUTE STATE

S2:

```text
VERTICAL SERVICE ROUTE

AUTHORIZATION
INVALID
```

### TRIGGER C — PATROL STATUS

작은 Environment Panel:

```text
AUTOMATED PATROL
ONLINE
```

### EXIT PREVIEW

P5:

```text
SERVICE ARCADE
NEXT
```

또는:

```text
PUBLIC / SERVICE ACCESS
```

정도까지.

### 공개 금지

```text
GROUP A
GROUP B
PRIORITY CUSTOMER
TIER A
TIER B
EXECUTIVE ACCESS
WORKER DENIED
```

---

## 16. Pixel Art Asset Spec

### Reuse

#### ACCESS SCANNER

3-2와 동일.

```text
64×64
96×64
```

#### Controlled Mount Strip

3-2와 동일.

```text
32×16
64×16
```

#### Patrol Drone T1

Sector 02와 동일.

```text
24×24 ~ 32×32
```

새 색상 / 무장 금지.

### New Near Assets

#### Retail Security Header

```text
64×32
96×32
```

#### Storefront Security Frame

```text
64×64
128×64
```

#### Retail Balcony Trim

```text
128×32
256×32
```

#### Service Access Sign

```text
32×32
64×32
```

### Gate

현재 Runtime Gate / Gate Panel mock의
사람 기준 상대 Scale을 유지.

Player 48px 기준:

- Gate = Player보다 조금 큼
- Panel = Player보다 작음
- Gate bottom = Exit Deck에 맞춤

---

## 17. Background

### Sector 03 공통

3-1 / 3-2의 Far / Mid Commercial Family 재사용.

### 3-3 Near

- powered storefront
- retail security frame
- access scanner
- service mount strip
- polished balcony
- gate frame
- gate panel
- active wayfinding

### Density

3-2보다 약간 증가.

하지만 우선순위:

```text
PLAYER / ROPE
>
C2 STATE
>
DRONE
>
G3
>
COMMERCIAL DECORATION
```

### Color Ownership

```text
Rope / Grapple       Cyan
Scanner Warning      Amber
Scanner Locked       Red-Orange
Drone Danger         Red / Orange family
Commercial Light     Warm White / Muted Gold / Muted Magenta
```

Scanner와 Drone이 둘 다
같은 순수 Red Blob으로 합쳐지지 않게 한다.

---

## 18. Sound / VFX

### Scanner

3-2 그대로.

```text
AVAILABLE
low ready hum

WARNING
two short amber beeps

LOCKED
firm mechanical lock

RESET
soft release
```

### Drone

Sector 02 T1 그대로.

- patrol servo
- acquire / lock cue
- projectile cue

### Combined Observation Deck

S2에서:

Scanner Warning과 Drone Servo가
서로 구분되어 들려야 한다.

### 금지

- 새 Alarm Theme
- Scanner가 Drone Alert Sound를 재생
- Scanner Lock과 Drone Fire를 같은 SFX로 표현
- Human Voice

---

## 19. Implementation Notes

### 19-1. Sector 03 Runtime Dependency

현재 `CurrentAuthoredAreaCatalog`는:

```text
SECTOR 01
+
SECTOR 02
```

만 포함한다.

3-3 구현 순서:

```text
3-1 authored area integration
→
3-2 Access Scan Field implementation + area integration
→
3-3
```

가 맞다.

### 19-2. Scanner Dynamic Filter

현재 Static:

```text
surface.grappleable === false
```

는 실제 Rope targeting에서 지원한다.

하지만 authored definitions / assembled surfaces는 freeze되므로
Scanner가 매 Phase마다:

```text
surface.grappleable = false
```

처럼 직접 mutation하는 방식은 사용하지 않는다.

권장:

```text
effective canAttachToSurface(surface, scannerState)
```

또는 동등한
결정적 Runtime Filter.

### 19-3. Scanner Bypass Invariant

C2 주변에는:

```text
same progression purpose
+
always grappleable
```

인 대체 Surface를 두지 않는다.

Recovery Surface는
낙하를 받아줄 수 있지만
S2에서 G3로 바로 전진하는 Attach 해법이 되어서는 안 된다.

이 규칙은 3-2에서 발견한
`controlled segment over permanent parent surface`
우회 문제를 그대로 방지한다.

### 19-4. Patrol Drone — IMPLEMENTED

3-3의 Enemy 쪽은
새 AI 구현이 필요 없다.

현재 Sector 02 방식처럼 authored object에:

```text
enemyType
activation
patrol
rules
```

를 제공하면
`AuthoredWorldAssembler`가 enemy spawn data로 전달할 수 있다.

### 19-5. Patrol Config Candidate

3-3도 기존 T1 baseline 유지:

```js
{
    enemyType: "patrol-drone-t1",

    activation: {
        x: -512,
        y: -768,
        width: 1024,
        height: 320
    },

    patrol: {
        points: [
            { x: -256, y: -560 },
            { x: 256, y: -560 }
        ],
        speed: 48,
        waitSeconds: 0.45,
        mode: "pingpong"
    },

    rules: [
        "kill-optional",
        "no-rope-cut",
        "target-lock-cycle",
        "activation-band-only"
    ]
}
```

HYPOTHESIS coordinate / current behavior contract 조합.

### 19-6. Exit Gate Contract

P5 도달은
Stage Clear 자체가 아니라:

```text
exit objective ready
```

에 해당.

권장 흐름:

```text
P5 reached
→ exit objective complete
→ Gate Panel available
→ existing contextual interaction
→ Gate opened
→ Player physically enters Gate
→ 3-4
```

### 19-7. No New Interaction Key

현재 Gate Panel의 사용자 조작은
기존 Jump 계열 입력을 문맥 interaction으로 공유한다.

따라서 3-3 문서 / UI에서:

```text
PRESS E
```

같은 새 PC 전용 Key를 만들지 않는다.

### 19-8. Gate Safety

Gate Panel은:

- Scanner Group 영향 없음
- Drone activation band 밖
- Projectile Pressure 없음
- Rope Attach가 필요 없는 Landing

위에 둔다.

Gate 조작 중 피격을 요구하지 않는다.

### 19-9. Multiplayer

Scanner:

```text
same deterministic phase
```

가 두 Player에 보여야 한다.

Drone:

- activation band 안 Player만 eligible
- attack cycle target lock 유지
- S2 밖 Player를 cross-zone target으로 잡지 않음

Player A가 먼저 Commit하고
Player B가 S2에서 기다리는 것은 정상.

두 Player 동시 Commit도 허용하지만
성공 조건으로 강제하지 않는다.

Gate:

- shared objective / open state는 현재 진행 계약 재사용
- 열린 Gate는 각 Player가 직접 통과
- Player A가 먼저 통과했다고 Player B를 즉시 강제 이동하지 않음

### 19-10. In-Flight Projectile Edge Case

현재 Projectile은 발사 뒤
Drone activation state와 별개로 계속 이동한다.

따라서 Player가 G3 / R1로 band를 빠져나가면:

```text
NEW FIRE / NEW ACQUIRE
= stop
```

하지만 이미 발사된 탄까지 즉시 제거하지 않는다.

3-3은 이를 해결하기 위해
Projectile 삭제 Rule을 새로 만들지 않는다.

대신:

- band traversal을 짧게 유지
- R1을 기존 탄 궤적에서 벗어나기 쉬운 폭으로 제공
- Recovery에서 장시간 정지 강제 금지

로 대응한다.

### 19-11. Authored Boundary

현재 Runtime은
각 Area bounds와 Gate 개구부를 실제 공간 경계로 표현하고
Gate 외 층간 우회를 막는다.

따라서 3-3도:

```text
Rope Shortcut으로 3-4를 Gate 바깥에서 직접 진입
```

할 수 없게 한다.

이것은 Build Lock이 아니라
현재 전체 Stage 진행 계약이다.

---

## 20. Playtest Metrics

### 기본

```text
first clear time
skilled clear time

scanner cycles observed
C1 locked attach attempts
C2 locked attach attempts

S2 dwell time
combined commit attempts

drone patrol position at commit
drone shots fired
drone hits
drone killed / bypassed

activation band dwell time
recovery time
wrong attach

gate panel interaction success
gate crossing success
```

### 핵심 Metric — Combined Readability

질문:

> “S2에서 무엇을 보고 출발 타이밍을 정했나요?”

기대:

- Scanner 상태
- Drone 위치
- 둘 다

### 실패 원인 이해

피격 / 추락 후 질문:

> “왜 실패했다고 느꼈나요?”

좋은 답:

- Scanner가 Locked인데 늦게 붙으려 했다.
- Drone이 가까운 쪽에 있을 때 들어갔다.
- 들어간 뒤 너무 오래 머물렀다.

나쁜 답:

- 뭐 때문에 안 붙었는지 모르겠다.
- Scanner Beam에 맞아서 Rope가 끊긴 것 같다.
- Drone이 갑자기 순간이동했다.

### Commit Wait

S2 첫 방문에서
한 Cycle 이상 관찰하는 것은 허용.

그러나 반복적으로:

```text
> 2 full scanner cycles
```

을 기다려야만 안전하다면
Pattern Density 과다 후보.

### Drone Kill Rate

Kill Optional.

Kill하지 않아도
Stage가 자연스럽게 통과돼야 한다.

### Gate

Panel 근처에서:

```text
“어떤 키로 열지 모르겠다”
```

피드백이 나오면
현재 Gate interaction cue 문제로 기록.

---

## 21. PASS Criteria

### Gameplay

- Difficulty ★★★
- 3-2 Scanner Rule을 반복 설명 없이 기억
- Patrol Drone T1 재사용
- Scanner + Drone이 한 Commit 판단으로 결합
- Enemy 1대
- Scanner 1 group
- 새 Mechanic 없음
- 새 Enemy Behavior 없음
- Drone Kill Optional
- Scanner Damage 0
- Scanner Forced Detach 0
- Patrol Rope Cut 0
- Safe Observation Deck 존재
- Recovery가 activation band 밖이며 새 공격 획득이 중단됨
- C2를 우회하는 permanent progression attach 없음
- `swingImpulse = 0` Safe Route 통과
- 특정 Build Lock 없음
- 3-4의 대형 Route Split을 선행하지 않음

### Runtime Alignment

- current Patrol capability 재사용 가능
- current Gate contract와 정합
- static grappleable filter 존재를 반영
- dynamic Scanner filter는 dependency로 명시
- Sector 03 authored integration 미구현을 사실대로 표기
- LOS Cover를 안전성 전제로 사용하지 않음

### Story

- Commercial Security가 계속 작동함을 강화
- Group A/B 정체 미공개
- Priority 대상 미공개
- Group C 중단 원인 미공개
- 새 음모 정보 없음

### Multiplayer

- 기다리는 Player가 band 밖에서 안전
- 한 Player 진입으로 다른 Player 강제 진입 없음
- Drone target lock이 cycle 중 유지
- Gate에서 party forced teleport 없음

---

## 22. FAIL Conditions

### FAIL — Combined Gameplay

- Scanner + Drone의 정확한 단일 위상만 정답
- Scanner가 Locked일 때 Recovery에서 강제 대기 중 계속 피격
- Scanner Damage 추가
- Scanner가 Rope 강제 해제
- Drone T2 도입
- Drone Chase 추가
- 두 번째 Enemy 추가
- Turret 추가
- Wind 추가
- Player가 Scanner와 Drone 중 무엇 때문에 실패했는지 구분 못함
- C2 옆 Permanent Surface로 Scanner를 완전히 우회 가능

### FAIL — Runtime

- Sector 03를 Sector 02 뒤에 연결하면서 Boss / Transition 미확정 계약을 임의로 해결
- Scanner 구현 전에 3-3을 runtime에 직접 연결
- frozen surface의 `grappleable` property를 phase마다 mutation
- Gate objective 완료 즉시 자동 open으로 되돌림
- E Key 등 새 Gate interaction 추가
- Gate 바깥 boundary를 Rope로 우회 가능

### FAIL — Story

- Group A/B = 특정 계층 확정
- Priority Customer 공개
- Executive Access 공개
- WORKER DENIED 문구
- 기업이 C를 고의로 버렸다고 확정

---

## 23. 개발 구현 우선순위

### P0 — 3-2 Scanner Spike PASS

선행 조건:

```text
AVAILABLE / WARNING attach
LOCKED / RESET no new attach
existing rope persists
deterministic phase
multiplayer phase agreement
```

### P1 — 3-1 / 3-2 Authored Runtime 연결

정확한 2-8 → Boss → 3-1 순서는
공통 Boss Flow 확정 전 임의 LOCK 금지.

### P2 — 3-3 PURE GRAYBOX

Enemy / Scanner OFF.

Geometry + Recovery + Gate 배치만 검증.

### P3 — SCANNER ONLY

C1 / C2를 3-2와 동일 Rule로 연결.

### P4 — PATROL ONLY

D1 Patrol / Activation만 연결.

확인:

```text
S2 outside band
R1 outside band
G3 exit clears band
```

### P5 — COMBINED

Scanner + Patrol 동시 적용.

### P6 — BUILD PASS

IMPULSE / RELAY / SHEAR 각각:

- 통과 가능
- 효율 차이
- no build lock

검증.

### P7 — TWO PLAYER

- A commits / B waits
- simultaneous commit
- target lock
- recovery
- Gate crossing

검증.

### P8 — ART / AUDIO

Gameplay PASS 후
Scanner / Drone / Retail Security Visual 연결.

---

## 24. Stage Data Concept

**HYPOTHESIS — current authored schema를 참고한 구현 후보이며 Runtime 코드 아님**

```js
{
    id: "sector-03-03",
    sectorId: "sector-03",
    order: 3,

    name: "RETAIL SECURITY WALK",
    subtitle: "SCANNER + PATROL SYNTHESIS",

    gameplay: {
        newMechanic: null,
        requiredKill: false,
        wind: false
    },

    scannerGroups: [
        {
            id: "scanner-retail-A",
            position: { x: 480, y: -576 },
            controlledSurfaceIds: ["C1", "C2"],
            timingProfile: "scanner-gallery-baseline",
            damagePlayer: false,
            detachExistingRope: false
        }
    ],

    enemies: [
        {
            id: "drone-1",
            enemyType: "patrol-drone-t1",

            activation: {
                x: -512,
                y: -768,
                width: 1024,
                height: 320
            },

            patrol: {
                points: [
                    { x: -256, y: -560 },
                    { x: 256, y: -560 }
                ],
                speed: 48,
                waitSeconds: 0.45,
                mode: "pingpong"
            },

            rules: [
                "kill-optional",
                "no-rope-cut",
                "target-lock-cycle",
                "activation-band-only"
            ]
        }
    ],

    completion: {
        objective: "reach-exit-deck",
        gatePanelInteraction: true,
        physicalGateCrossing: true
    },

    nextAreaId: "sector-03-04"
}
```

---

## 25. 아트 담당자 전달문

### RETAIL SECURITY WALK

핵심 이미지:

> **밝은 Retail Gallery의 안전 Deck에서
> Player가 Scanner Mount의 상태와 작은 Patrol Drone의 왕복 움직임을 동시에 바라본 뒤,
> Cyan Rope로 한 번에 Security Band를 가로지르는 장면.**

### Reuse 우선

- 3-2 Scanner Housing
- 3-2 Controlled Mount
- Sector 02 Patrol Drone T1
- Current Gate
- Current Gate Panel

### New Near

- Retail Security Header
- Powered Storefront Frame
- Service Arcade Direction Sign
- Commercial Balcony Trim

### 반드시 읽히는 순서

```text
1. Player
2. Rope / C2
3. Scanner State
4. Drone
5. G3 Exit
6. Retail Decoration
```

---

## 26. 개발자 최종 전달 요약

### SECTOR 03-3 — RETAIL SECURITY WALK

새 시스템 추가 없음.

```text
3-2 SCANNER
+
2-2 PATROL DRONE T1
```

첫 결합.

### Player 판단

```text
S2 SAFE DECK

SEE SCANNER
SEE PATROL

↓

COMMIT

↓

C2 ATTACH
ENTER BAND

↓

KEEP MOVING

↓

G3
EXIT BAND
```

### Current Runtime Reality

Implemented:

```text
Patrol capability
activation band
target lock
no-rope-cut rule
static grappleable:false filter
authored Gate / Gate Panel
16 authored Sector 01+02 areas
```

Not yet implemented:

```text
Sector 03 authored runtime
dynamic Access Scan Field filter
3-1 / 3-2 runtime integration
```

### Exit

```text
P5 objective
→ Gate Panel
→ existing contextual interaction
→ opened Gate
→ each Player physically crosses
→ 3-4
```

### 다음 Stage

3-4에서 처음:

```text
FRONT-OF-HOUSE
vs
BACK-OF-HOUSE
```

Multi-Route 공간 선택을 본격 도입한다.

---

## OPEN QUESTIONS

### 1. Dynamic Scanner Filter API

Static `grappleable:false`는 이미 구현됐다.

남은 핵심:

```text
scanner phase
→ effective attach eligibility
```

를 Rope candidate 계산에 어떻게 전달할지.

frozen authored Surface mutation은 피한다.

### 2. Scanner Timing Profile

3-3은 3-2와 같은 Timing을 재사용하는 것이 기본.

3-2 Prototype에서 Timing이 수정되면
3-3도 그대로 따라간다.

### 3. Drone Patrol Speed

현재 authored baseline `48`을 우선 재사용.

3-3 Geometry에서 지나치게 느리거나 빠르게 느껴지면
먼저 Patrol corridor 길이 / Commit distance를 조정한다.

Enemy 자체 Speed 상향은 후순위.

### 4. Gate Interaction Cue

Gate 입력은 최근 Runtime에서
기존 Jump 계열 interaction으로 통일됐다.

3-3 정식 Visual에서
Panel이 “별도 키가 필요한 콘솔”처럼 보이지 않도록
현재 Gate cue를 그대로 이어받는다.

### 5. Sector 03 Runtime Entry

현재 authored catalog는 2-8에서 끝난다.

Sector 03 Runtime을 실제 연결할 때
Sector 02 Boss / Transition 계약을 먼저 해결해야 한다.

3-3 문서가 그 전환을 임의 확정하지 않는다.

---

SECTOR 03-3 / RETAIL SECURITY WALK — REV 1.0
