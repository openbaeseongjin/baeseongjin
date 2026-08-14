# SECTOR 03-6 — PREMIUM ATRIUM

*BLOCKOUT CANDIDATE · REV 1.0*

◀ PREV — [SECTOR 03-5 / COMMERCIAL SERVICE NODE](../3-5/README.md) · NEXT — [SECTOR 03-7 / PRIORITY CONCOURSE](../3-7/README.md) ▶

`SECTOR 03 COMMERCIAL DISTRICT` · `STAGE 06` · `LARGE ATRIUM FLOW` · `SECURITY TIMING EXPRESSION`

| 항목 | 기준 |
|---|---|
| Status | HYPOTHESIS — BLOCKOUT CANDIDATE |
| Difficulty | ★★★☆ |
| Expected First Playtime | 165–235 sec |
| Expected Skilled Clear | 65–100 sec |
| Enemy | Patrol Drone T1 × 1 |
| Scanner | ACCESS SCAN FIELD × 1 group / C1+C2 |
| New Mechanic | NONE |
| New Enemy Behavior | NONE |
| New Input | NONE |
| New Rope Mode | NONE |
| New Augment | NONE |
| Artifact Reward | NONE |
| Wind | NONE |
| Rope Cut | NONE for Patrol Drone |
| Required Kill | NONE |
| Design Checkpoint / Reward | NONE |
| Exit | Reach → Gate Panel → opened Gate physical crossing |
| Design Carry Build | Foundation + first Specialization KEEP — current runtime pending |
| Primary Role | Large-space Rope expression + Security timing after 3-5 Rest |
| Primary Space | One continuous Premium Commercial Atrium / central vertical void |

---

## 0. 기획 기준

### LOCKED FOR THIS STAGE

3-6은 3-5 직후
새 성장 없이 현재 Build를 큰 공간에서 다시 사용한다.

핵심:

```text
NO NEW POWER

CURRENT ROPE
+
LARGER SPACE
+
KNOWN SCANNER
+
KNOWN PATROL DRONE
```

3-6의 새로운 체감은
시스템 추가가 아니라 **공간 Scale과 Rope Flow**에서 만든다.

### 핵심 질문

> **“작은 서비스 공간에서 확인한 내 Rope Build를, 큰 Commercial Void에서도 자연스럽게 이어갈 수 있는가?”**

### 3-4와의 차이

3-4:

```text
PUBLIC ROUTE
vs
SERVICE ROUTE
```

명시적인 두 Route의 기능 차이.

3-6:

```text
ONE LARGE ATRIUM
```

안에서:

```text
SAFE LANDINGS
+
CENTRAL FLOW SPINE
+
OPTIONAL RECOVERY
```

가 서로 보이고 이어진다.

즉 3-6은 다시 별도의 두 복도처럼 만들지 않는다.

### 금지

- 새로운 Route System
- 새로운 Enemy
- Drone T2
- Scanner Faster Variant
- 두 Scanner의 복잡한 독립 위상 Puzzle
- Security Shutter
- Moving Platform
- Wind
- Turret
- Damage Floor
- Build-locked Route
- 새 Augment
- 3-7 Priority Story 선행 공개

---

## 0-1. 최신 GitHub / Runtime 교차검증

### VERIFIED — CURRENT MAIN

작성 시점 `main` HEAD:

```text
c9cd55b690512fa009aec03ce826e1496f15cec6
```

PR #459에서:

```text
SECTOR 03-5 — COMMERCIAL SERVICE NODE
```

가 `main`에 병합됐다.

현재 Scenario Tree에는:

```text
3-1
3-2
3-3
3-4
3-5
README.md
```

가 존재한다.

3-6은 다음 상세 Stage다.

### VERIFIED — CURRENT AUTHORED RUNTIME

현재 `CurrentAuthoredAreaCatalog.js`는:

```text
SECTOR 01
+
SECTOR 02
```

만 import / assemble한다.

현재 Revision:

```text
sector-01-rev3-sector-02-rev1-v2
```

즉:

```text
SECTOR 03 authored runtime
= NOT YET CONNECTED
```

다.

### VERIFIED — CURRENT PHYSICS

현재 `config.js`:

```text
Player Radius            15
Gravity                  1250
Max Horizontal Speed     360
Jump Speed               440

Rope Max Attach Distance 440
Attach Buffer            0.1 sec
Swing Impulse            780
Release Angular Transfer 0.55

Camera Desktop Zoom      1
Camera Mobile Zoom       0.72
```

### VERIFIED — CURRENT COMBAT

```text
Enemy Radius             18
Enemy Health             30
Enemy Attack Range       520

Acquire                  0.25 sec
Track                    0.80 sec
Lock                     0.20 sec

Enemy Fire Interval      1.40 sec
Projectile Speed         260
Projectile Damage        20

Rope Disabled On Hit     0.60 sec
```

### VERIFIED — PATROL DRONE

Patrol capability / activation band / no-rope-cut authored rule은
현재 Runtime에 존재한다.

3-6은 새 AI를 요구하지 않는다.

### IMPLEMENTATION DEPENDENCY — ACCESS SCAN FIELD

현재 코드 검색에서는:

```text
grappleAccessGroup
scanner phase dynamic attach eligibility
```

Runtime 구현이 확인되지 않는다.

Static:

```text
surface.grappleable === false
```

filter는 구현돼 있지만
Scanner의 시간 상태에 따른 동적 부착 허용은 아직 dependency다.

따라서 3-6 구현 순서는:

```text
3-2 Scanner system PASS
→ 3-3 / 3-4 integration
→ 3-6
```

이다.

### DEPLOYED GAME CHECK

GitHub Pages 공개 게임 URL은
이번 작업 환경에서 직접 interactive fetch가 되지 않았다.

따라서 구현 사실은 최신 `main` Runtime을 우선 Source of Truth로 사용한다.

---

## 0-2. 3-5 Growth HOLD가 3-6에 주는 조건

3-5에서 결정:

```text
NO SECOND SPECIALIZATION
NO SECONDARY AUGMENT
NO HYBRID
NO ARTIFACT REWARD
```

따라서 3-6의 Mandatory Route는:

```text
BASE ROPE PHYSICS
```

만으로도 성립해야 한다.

Design Build state는:

```text
Foundation + first Specialization
```

이지만,
현재 Runtime에서는 해당 효과가 아직 완성되지 않았으므로:

```text
BUILD EFFECT REQUIRED FOR CLEAR
```

금지.

### 중요한 Playtest 의미

3-6이 새 Upgrade 없이 재미없다면:

```text
3-5에서 Power를 더 준다
```

보다 먼저:

```text
현재 Foundation / Specialization expression
+
3-6 geometry
```

를 재검토한다.

---

## 1. 한 줄 정의

3-5의 조용한 Commercial Service Node를 나온 Player가
한눈에 위층까지 열린 거대한 **Premium Commercial Atrium**으로 진입해,
동일 Phase의 두 Access-Controlled Mount와 중앙 Patrol Drone의 위치를 읽으며
넓은 Landing을 사용하는 Safe Flow 또는 중앙을 압축하는 숙련 Flow로 상승하고,
현재 Rope Build의 이동 성향을 큰 공간에서 처음 강하게 표현한 뒤 3-7 Priority Concourse로 넘어가는 Stage.

---

## 2. 전체 게임에서의 역할

Sector 03 진행:

```text
3-1
SPACE REVEAL

3-2
SCANNER RULE

3-3
SCANNER + DRONE COMMIT

3-4
ROUTE IDENTITY

3-5
REST / BUILD DIAGNOSTIC

3-6
LARGE ATRIUM EXPRESSION

3-7
STORY PRESSURE

3-8
SECTOR SYNTHESIS
```

3-6은:

```text
LEARN
```

이 아니라:

```text
ENJOY + EXPRESS
```

에 가깝다.

### 3-6의 핵심 감정

> **“여기서는 Rope로 크게 날아다닐 수 있다.”**

보안은 이를 방해하는 주인공이 아니라
Timing과 Route Commitment를 만드는 압력이다.

---

## 3. Story 역할

### 핵심

3-6은 새 문서 정보를 많이 주지 않는다.

대신 Environment로:

```text
POWER
LIGHT
VENTILATION
DISPLAY
SERVICE
```

가 Worker District보다 훨씬 안정적으로 유지됨을 강화한다.

### 보여줄 수 있는 상태

```text
PREMIUM ATRIUM

LOCAL POWER BUS
ACTIVE

COMMERCIAL SERVICE NETWORK
LIMITED / ONLINE
```

또는 동등한 중립 System 표시.

### 보여주는 공간 흔적

- 켜진 대형 광고 패널
- 작동 중인 공조
- 자동 조명
- 깨끗한 floor / balcony
- 상품 진열
- 비어 있는 lounge
- 정상 작동하는 안내 kiosk

### 중요한 Tone

```text
SYSTEM IS HEALTHY
PEOPLE ARE ABSENT
```

### 아직 공개하지 않음

- Priority Customer
- Priority Route의 정확한 사용자
- Tier A/B
- Group A/B 정체
- Group C 중단 원인
- Resource allocation 결정자
- Corporate order

이 정보는 3-7 이후에 보존한다.

---

## 4. 공간 콘셉트

**ONE LARGE PREMIUM ATRIUM**

3-6은
여러 개의 작은 방을 직렬로 붙이지 않는다.

### 공간 언어

```text
TALL
OPEN
BRIGHT
VERTICAL
POLISHED
EMPTY
```

### 핵심 구성

```text
LOWER ENTRY BALCONY

↓

FIRST LARGE SCANNER ARC

↓

MID SAFE RECOMBINATION DECK

↓

SCANNER + PATROL COMMIT

↓

UPPER FREE-FLOW TERRACE

↓

EXIT
```

모든 구간이
하나의 Atrium Void 안에서
시각적으로 연결돼 있어야 한다.

### 공간 비율

Player는
환경에 비해 작아 보여야 한다.

3-6은 Sector 03에서
Commercial 공간의 Scale을 가장 강하게 보여주는 첫 Stage다.

---

## 5. Pixel / Grid 기준

### VERIFIED

```text
BASE PHYSICS
Rope Max = 440
```

### HYPOTHESIS — BLOCKOUT

```text
BASE GRID     32 px

WIDTH         1536 px
              48 tiles

HEIGHT        1472 px
              46 tiles

X             -768 ~ +768
Y                0 ~ -1472
```

### Mandatory Grapple 목표

```text
180–390 px
```

### 이유

Stage는 이미:

- 큰 공간
- Scanner
- Drone
- Flow

를 사용한다.

440px 근처의 극단적 Max-Range를
Mandatory Skill Check로 추가하지 않는다.

---

## 6. 전체 맵 구조

```text
Y -1472

┌────────────────────────────────────────────────────────────────────┐
│                                   GATE → 3-7                       │
│                           P5 ████████████ [PANEL]                  │
│                                  ▲                                 │
│                              G5 ●                                  │
│                            ╱                                       │
│                    P4 ███████████                                  │
│                          ▲                                         │
│                       G4 ●                                         │
│                         ╲                                          │
│                          ╲                                         │
│                  P3 ███████████                                    │
│                       ▲                                            │
│                    G3 ●        ← BAND EXIT                         │
│                      ╲                                             │
│                       ╲                                            │
│                C2 ● [CONTROLLED]                                  │
│                    ╲                                               │
│            ← PATROL DRONE D1 →                                   │
│                                                                  │
│                   M1 █████████████                                │
│                     SAFE WAIT / RECOMBINATION                      │
│                           ▲                                        │
│                           │                                        │
│                 P2 ███████████        R1 ███████                  │
│                       ▲                                            │
│                    C1 ● [CONTROLLED]                              │
│                       ╲                                            │
│                    G1 ●                                            │
│                      ╲                                             │
│               P1 █████████████                                    │
│                       ▲                                            │
│                  P0 ENTRY                                         │
└────────────────────────────────────────────────────────────────────┘

Y 0
```

---

## 7. Zone 구성

### ZONE A — ATRIUM REVEAL

```text
Y 0 ~ -256
```

P0 / P1.

Enemy 없음.

Scanner Pressure 없음.

Player가 3-5의 작은 Service Room에서
큰 Atrium으로 나왔다는 것을 즉시 느낀다.

### ZONE B — FIRST LARGE ARC

```text
Y -256 ~ -544
```

G1 → C1 → P2.

C1은 Scanner-controlled.

Drone 없음.

목적:

```text
Scanner Timing
+
Large Arc
```

를 압박 없이 먼저 사용.

### ZONE C — MID RECOMBINATION

```text
Y -544 ~ -704
```

M1.

완전 Safe.

Player가:

- Scanner Phase
- Drone patrol
- C2
- G3

를 관찰할 수 있다.

M1은 3-6의 핵심 Safety Valve.

### ZONE D — SECURITY COMMIT

```text
Y -704 ~ -960
```

C2 + Patrol Drone D1.

3-3과 같은 규칙이지만
더 큰 Atrium Arc에서 사용한다.

### ZONE E — UPPER FREE FLOW

```text
Y -960 ~ -1280
```

P3 → G4 → P4.

Scanner 없음.
Drone new acquire 없음.

Player가 긴장을 풀고
Rope Flow 자체를 즐기는 구간.

### ZONE F — PRIORITY CONCOURSE APPROACH

```text
Y -1280 ~ -1472
```

G5 → P5 → Gate.

3-7 방향에:

```text
CONCOURSE
ACCESS CONTROL
```

정도의 공간 Preview만 허용.

Priority 정보 본문은 아직 공개하지 않는다.

---

## 8. 좌표 / 오브젝트

### HYPOTHESIS — BLOCKOUT CANDIDATE

| ID | X | Y | Width | 역할 |
|---|---:|---:|---:|---|
| P0 | -640~-384 | 0 | 256 | Entry |
| P1 | -576~-192 | -160 | 384 | Atrium Reveal Deck |
| G1 | -480~-352 | -288 | 128 | Permanent Lower Pivot |
| C1 | -128~0 | -384 | 128 | Controlled Mount 1 |
| P2 | -224~+96 | -480 | 320 | Lower Atrium Landing |
| R1 | +256~+448 | -512 | 192 | Lower Flow Recovery |
| M1 | -192~+192 | -640 | 384 | Mid Safe Wait / Recombination |
| C2 | +128~+256 | -768 | 128 | Controlled Mount 2 |
| G3 | -64~+64 | -928 | 128 | Security Band Exit |
| P3 | -192~+160 | -992 | 352 | Upper Safe Landing |
| G4 | +192~+320 | -1088 | 128 | Upper Free-Flow Pivot |
| P4 | +256~+576 | -1184 | 320 | Upper Premium Terrace |
| G5 | +64~+192 | -1312 | 128 | Final Pivot |
| P5 | +224~+544 | -1408 | 320 | Objective / Gate Deck |
| Gate Panel | +480 | -1376 | — | contextual Gate Panel |
| Gate | +576 | -1408 | — | To 3-7 |

### SCANNER GROUP S1 — HYPOTHESIS

```text
ID:
scanner-premium-atrium-A

Controls:
C1
C2

Timing:
reuse 3-2 baseline

Phase:
same state for C1 / C2
```

중요:

```text
NO INDEPENDENT PHASE PUZZLE
```

C1과 C2는 같은 Scanner 문법을 공유한다.

### PATROL DRONE D1 — HYPOTHESIS POSITION / VERIFIED BEHAVIOR FAMILY

```text
Start:
X -128
Y -736

End:
X +320
Y -736

Speed:
48

Wait:
0.45 sec

Mode:
pingpong
```

Activation:

```text
X -384 ~ +448
Y -896 ~ -672
```

의도:

```text
M1 center
= outside

C2
= inside

G3 center
= outside

P3
= outside
```

---

## 9. Safe Route

```text
P0
→ P1
→ G1
→ wait if needed
→ C1
→ P2
→ M1
→ observe Scanner + Drone
→ wait if needed
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

### Safe Route 역할

3-6은 넓지만
Safe Player가 길을 잃으면 안 된다.

Landing을 사용하면:

```text
ONE DECISION AT A TIME
```

으로 분해된다.

### Scanner

C1 / C2:

```text
AVAILABLE / WARNING
→ attach

LOCKED / RESET
→ no new attach
```

기존 Rope 강제 Detach 없음.

### Drone

M1은 activation 밖.

Player는 여기서
Scanner + patrol을 모두 읽을 수 있다.

### Mandatory Physics

```text
swingImpulse = 0
```

에서도 Safe Route 통과 가능해야 한다.

---

## 10. Flow Route

숙련자는 Landing을 압축한다.

후보:

```text
P1
→ C1
→ M1
→ C2
→ G3
→ G4
→ P4
→ G5
→ P5
```

### IMPULSE 후보 Shortening

충분한 Momentum / Timing이면:

```text
P1
→ C1
```

에서 G1 Landing을 생략하는 효율 가능.

하지만 Base Rope도:

```text
P1
→ G1
→ C1
```

로 반드시 통과 가능.

### Scanner Same-Phase 활용

C1과 C2가 같은 Phase라 하더라도
둘을 한 Window에 반드시 연결할 필요는 없다.

M1에서 언제든 기다릴 수 있다.

숙련 플레이에서는
도착 Timing이 맞으면
불필요한 Wait가 줄어드는 정도.

### 금지

```text
C1 AVAILABLE 진입
→ 정해진 0.x초 안에 C2까지 가야만 성공
```

같은 고정 Timing Puzzle.

---

## 11. Build Expression

### NO BUILD LOCK

모든 Mandatory Route:

```text
Base Rope compatible
```

### IMPULSE

가장 자연스럽게 보이는 것:

- P1 → C1 큰 Arc
- Security Band 체류시간 압축
- P3 → G4 → P4 Landing Skip 후보

### RELAY

가장 자연스럽게 보이는 것:

```text
C1
→ M1
→ C2
→ G3
```

연속 Re-Attach Rhythm.

### SHEAR

M1 → C2 Rope line이
Drone Patrol Corridor를 가로지르도록 배치한다.

따라서:

```text
M1
→ C2 attach
+
rope crosses D1
+
release
```

에서 공격적 선택 가능.

Kill Optional.

### 중요한 조건

SHEAR를 쓰기 위해
Drone 위치를 억지로 기다려야 하는 Stage가 아니다.

Geometry가 맞을 때 생기는
Player Expression이어야 한다.

---

## 12. Recovery

### Lower Arc

C1 실패:

```text
P1
or
P2 lower catch
```

### P2 → M1

실패:

```text
P2
or
R1
```

R1은 progression shortcut이 아니라
낙하 Catch.

### Security Commit

C2 / G3 실패:

```text
M1
or
lower recovery
```

로 돌아가게 한다.

중요:

M1은 activation 밖이므로
새 Target Acquire / 새 Attack Cycle은 중단된다.

단 이미 발사된 Projectile은
즉시 삭제되지 않을 수 있다.

### Upper

G4 실패:

```text
P3
```

G5 실패:

```text
P4
```

### 목표

```text
≤ 5 sec
```

내 재시도 준비.

### 금지

```text
NO FULL-ATRIUM FALL
NO START RESET
NO DAMAGE FLOOR
NO RECOVERY INSIDE SUSTAINED NEW FIRE
```

---

## 13. Enemy / Hazard

### PATROL DRONE T1 × 1

새 Enemy 없음.

현재 Behavior Family 재사용.

```text
NO TARGET
→ PATROL

TARGET ACQUIRED INSIDE ACTIVATION
→ TARGET LOCK
→ PATROL PAUSE
→ FIRE

TARGET INVALID / LEFT BAND
→ LOCK CLEAR
→ PATROL RESUME
```

### Combat Baseline

```text
Acquire        0.25
Track          0.80
Lock           0.20
Fire Interval  1.40
Projectile     260
Damage         20
Rope Cut       NONE
```

### ACCESS SCAN FIELD

3-2 Rule 재사용.

Scanner는:

```text
Damage = 0
Forced Detach = 0
```

### Hazard Budget

```text
WIND            NONE
TURRET          NONE
MOVING PLATFORM NONE
SHUTTER         NONE
DAMAGE FLOOR    NONE
SECOND ENEMY    NONE
```

### 이유

3-6의 난이도는:

```text
SPACE SCALE
+
FLOW
+
KNOWN SECURITY
```

에서 나온다.

---

## 14. Camera

### 핵심 목표

3-6은 큰 공간이지만
Gameplay Cue를 너무 멀리 보여주지 않는다.

현재 Camera baseline을 우선 사용하고,
Geometry / Layering으로 Scale을 만든다.

### P1 Reveal

보여야 할 것:

- Player
- G1
- C1
- 반대편 Atrium facade
- 위쪽으로 이어지는 대형 Void

C2까지 한 화면에 강제로 보여줄 필요 없음.

### M1 Observation

반드시:

- C2
- Drone D1
- G3
- Recovery direction

이 함께 읽혀야 한다.

### P3 / Upper

P3 진입 후
보안 Cue 밀도를 줄여
공간이 다시 열리는 느낌.

### Custom Zoom

Stage-specific camera zoom이
현재 Sector 03 Runtime 계약으로 확정된 것은 아니므로
3-6 필수 조건으로 두지 않는다.

---

## 15. Story Trigger

### TRIGGER A — ATRIUM ID

P1:

```text
PREMIUM ATRIUM
```

### TRIGGER B — POWER STATE

P2 또는 Background display:

```text
LOCAL POWER BUS
ACTIVE

COMMERCIAL SERVICE NETWORK
LIMITED / ONLINE
```

### TRIGGER C — UPPER WAYFINDING

P4:

```text
UPPER CONCOURSE
```

정도.

### TRIGGER D — 3-7 PREVIEW

P5:

```text
ACCESS CONTROL
AHEAD
```

정도.

### 금지

```text
PRIORITY ROUTE
PRIORITY CUSTOMER
TIER A
TIER B
GROUP A
GROUP B
EXECUTIVE
```

3-7의 정보 밀도를 보존한다.

---

## 16. Pixel Art Asset Spec

### Large Premium Balcony Module

```text
128×32
256×32
```

### Atrium Column / Frame

```text
64×128
128×128
```

### Premium Storefront Shell

```text
128×96
256×96
```

### Large Advertisement Panel

```text
128×64
256×128
```

Non-Collision.

### Lounge / Display Cluster

```text
64×32
128×64
```

Non-Collision.

### Scanner Housing

3-2 reuse:

```text
64×64
96×64
```

### Controlled Mount

3-2 reuse:

```text
32×16
64×16
```

### Patrol Drone T1

Sector 02 reuse:

```text
24×24 ~ 32×32
```

---

## 17. Background

### Production Direction

새로운 Sector 03 Asset Family를 만들기보다
기존 Commercial Far / Mid를
**Scale Composition Variant**로 활용한다.

### FAR

- 매우 높은 Atrium ceiling
- 반복되는 upper terrace
- powered advertising grid
- distant commercial towers
- deeper city void

### MID

- large balcony silhouette
- premium display bridge
- service ceiling structure
- vertical sign tower

### NEAR

Gameplay Cue 주변은 절제.

### 3-6의 차별화

3-1:

```text
Commercial Reveal
```

3-6:

```text
Commercial Scale
```

### Color

Base:

- deep navy
- graphite
- polished gray

Light:

- warm white
- muted gold
- muted magenta

Gameplay:

- Rope Cyan
- Scanner Warning Amber
- Security Danger Red/Orange

### 금지

화면 전체 Neon Saturation.

---

## 18. Sound / VFX

### Ambient

- large atrium HVAC
- distant escalator / lift machinery
- long indoor reverb
- advertisement electrical ambience
- clean mechanical hum

### Scanner

3-2 재사용.

### Drone

Sector 02 Patrol T1 재사용.

### 공간감

3-5보다:

```text
REVERB ↑
DISTANT MACHINE LAYER ↑
```

### 사람 소리

```text
NONE
```

Crowd / announcement chatter 금지.

### VFX

- large stable light panels
- restrained glass reflection
- far display animation
- no constant particle clutter

---

## 19. Implementation Notes

### 19-1. Current Runtime Boundary

현재 Runtime Area Catalog는 Sector 01+02만 연결.

3-6은 현재 직접 플레이 불가.

선행:

```text
Sector 03 catalog
3-1
3-2 scanner
3-3
3-4
3-5
→ 3-6
```

### 19-2. Scanner Dependency

C1 / C2:

```text
DEDICATED CONTROLLED SURFACE SEGMENT
```

로 authoring.

동일 위치에 always-grappleable parent surface를 겹치지 않는다.

Dynamic 상태는 frozen Surface mutation이 아니라
effective attach eligibility 계산으로 처리하는 방향 유지.

### 19-3. Same Scanner Group

3-6에서 C1 / C2를
두 독립 Scanner puzzle로 만들지 않는다.

권장:

```text
scanner-premium-atrium-A
→ C1
→ C2
```

동일 Timing Profile / 동일 Phase.

이유:

- 구현 비용 감소
- State 이해 단순화
- 큰 공간 이동에 집중

### 19-4. Patrol Reuse

새 Enemy AI 없음.

기존 Patrol config / activation / `no-rope-cut` 사용.

### 19-5. Activation Safety

M1 / G3 / P3는
Player center 기준 activation 밖에 둔다.

안전 구간은 LOS Cover가 아니라:

```text
activation bounds
```

로 보장한다.

### 19-6. In-flight Projectile

Band Exit 후:

```text
NEW ACQUIRE / NEW FIRE
```

는 멈추지만
기발사 Projectile은 즉시 삭제되지 않는다.

3-6은 Projectile Cleanup Rule을 새로 만들지 않는다.

### 19-7. R1 Recovery

R1의 **의도된 Safe Recovery**는:

```text
R1
→ M1
→ observe
→ C2
```

다.

R1에서 C2로 직접 Commit하는 숙련 선택이 물리적으로 가능하더라도
Scanner와 Drone Security Band 자체를 건너뛰지는 않는다.

금지되는 것은:

```text
R1
→ permanent upper pivot
→ G3 / P3
```

처럼 C2 Scanner / Security Band를 무료로 우회하는 progression이다.

### 19-8. Gate Contract

P5:

```text
reach objective
→ Gate Panel available
→ contextual interaction
→ Gate open
→ physical crossing
→ 3-7
```

현재 계약 유지.

### 19-9. Design Build vs Runtime Build

문서상:

```text
Foundation + first Specialization KEEP
```

그러나 현재 Runtime effect는 pending.

따라서 3-6 Geometry / Progress는
Augment 효과가 없어도 통과 가능해야 한다.

### 19-10. Multiplayer

2인 플레이:

- P1 / P2 / M1 / P3 / P4 / P5 두 명 착지 가능
- Player A가 C2 band에 들어가도 M1의 Player B는 새 target 아님
- 한 Player가 기다리는 동안 다른 Player flow 허용
- Drone target lock은 현재 Runtime cycle 계약 따름
- Scanner Phase는 두 Player에게 동일해야 함
- Gate open shared
- Gate crossing individual

### 19-11. Large Atrium ≠ Separate Network Zone

P1~P5는 모두:

```text
same authored area
same simulation
```

이다.

Atrium 아래 / 위를
별도 Stage나 Network Room으로 쪼개지 않는다.

---

## 20. Playtest Metrics

### Movement

```text
first clear time
skilled clear time

landing count
landing skips
airborne re-attach count
large-arc attempts
large-arc success
wrong attach
```

### Scanner

```text
C1 wait time
C2 wait time

locked attach attempts
warning attach attempts
scanner cycles observed
```

### Drone

```text
shots fired
hits
kill / bypass
activation dwell time
```

### Recovery

```text
C1 failure recovery
C2/G3 failure recovery
upper-flow recovery
full-stage fall count
```

### Build Expression

Foundation/Specialization Runtime 구현 뒤:

```text
IMPULSE:
landing skips / arc compression

RELAY:
re-attach chain length

SHEAR:
rope-line crossings / release attack opportunities
```

### 핵심 질문 1

> “이 Stage에서 가장 재미있었던 이동은 어디였나요?”

기대:

- 큰 Atrium Arc
- C1 / C2 Flow
- Upper free-flow

### 핵심 질문 2

> “Scanner와 Drone이 Rope 이동을 방해했나요, 아니면 출발 타이밍을 정하게 했나요?”

목표:

```text
TIMING PRESSURE
not
FLOW KILLER
```

### 핵심 질문 3

> “3-5에서 새 Upgrade를 받지 않았는데도 Build가 충분히 느껴졌나요?”

이 답은 다음 Growth Tier 의사결정 자료.

---

## 21. PASS Criteria

### Gameplay

- Difficulty ★★★☆
- 큰 Atrium 체감
- New Mechanic 없음
- Enemy 1
- Scanner 1 group
- Scanner Timing 강화 없음
- Drone 강화 없음
- No Build Lock
- Kill Optional
- Safe Route 존재
- Flow Route 존재
- Recovery ≤ 5 sec 목표
- `swingImpulse = 0` Mandatory clear 가능
- 3-4의 Public/Service 두 복도 반복처럼 느껴지지 않음
- 3-5 Rest 뒤 Movement Joy 회복

### Runtime

- current physics 반영
- current Patrol behavior 재사용
- Scanner는 dependency로 정확히 표기
- Sector 03 Runtime 미연결 사실 유지
- Gate contract 유지
- Build Runtime pending 사실 유지

### Story

- Commercial power stability 강화
- 사람 없음
- 새 Priority 정보 없음
- Group A/B 미공개
- 3-7 Story Beat 보존

### Multiplayer

- M1 안전 대기 가능
- 서로 다른 Timing으로 Commit 가능
- cross-zone target 없음
- Gate party teleport 없음

---

## 22. FAIL Conditions

### Gameplay

- Atrium이 여러 작은 방처럼 보임
- 3-4 Public/Service 분기를 그대로 반복
- Scanner Window가 더 빨라짐
- 두 Scanner가 독립 위상 Puzzle이 됨
- Drone T2 추가
- 두 번째 Enemy 추가
- Wind 추가
- Damage Floor 추가
- 특정 Build 없으면 C1/C2 통과 불가
- R1로 C2를 무료 우회
- M1이 Drone new fire zone 안에 들어감
- 실패 시 Stage Entry까지 낙하

### Story

- Priority Customer 공개
- Tier A/B 공개
- Group A/B 정체 공개
- Upper Resource Allocation의 원인을 확정
- Corporate 책임자 공개

### Runtime

- Scanner dynamic filter 미구현인데 fake state hardcode
- Surface `grappleable` phase mutation
- Stage를 여러 network zone으로 분리
- current Gate interaction 대신 새 Key 추가

---

## 23. 개발 구현 우선순위

### P0 — LARGE ATRIUM GRAYBOX

Scanner / Drone OFF.

```text
P0
P1
G1
C1 placeholder
P2
R1
M1
C2 placeholder
G3
P3
G4
P4
G5
P5
Gate
```

### P1 — RANGE / RECOVERY

```text
swingImpulse 780
reduced
0
```

검증.

### P2 — MOVEMENT JOY

Enemy / Scanner 없이도
큰 공간 Rope 이동 자체가 재미있는지 확인.

PASS 전 Security 추가 금지.

### P3 — SCANNER ONLY

C1 / C2 same group.

### P4 — PATROL ONLY

D1 / activation band.

M1 / G3 안전성 검증.

### P5 — COMBINED

Scanner + Drone.

### P6 — BUILD MATRIX

가능해진 Runtime 기준:

```text
IMPULSE
RELAY
SHEAR
```

각각 clear / efficiency.

### P7 — TWO PLAYER

- staggered commit
- simultaneous commit
- wait / flow split
- target lock
- Gate crossing

### P8 — STORY / VISUAL

Power-status 환경 정보.

### P9 — ART / AUDIO

마지막.

---

## 24. Stage Data Concept

**HYPOTHESIS — Runtime code 아님**

```js
{
    id: "sector-03-06",
    sectorId: "sector-03",
    order: 6,

    name: "PREMIUM ATRIUM",
    subtitle: "LARGE FLOW / SECURITY TIMING",

    gameplay: {
        newMechanic: null,
        newAugment: null,
        artifactReward: null,
        wind: false,
        requiredKill: false
    },

    scannerGroups: [
        {
            id: "scanner-premium-atrium-A",
            controlledSurfaceIds: ["C1", "C2"],
            timingProfile: "scanner-gallery-baseline",
            phaseMode: "shared",
            damagePlayer: false,
            detachExistingRope: false
        }
    ],

    enemies: [
        {
            id: "drone-1",
            enemyType: "patrol-drone-t1",

            activation: {
                x: -384,
                y: -896,
                width: 832,
                height: 224
            },

            patrol: {
                points: [
                    { x: -128, y: -736 },
                    { x: 320, y: -736 }
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

    nextAreaId: "sector-03-07"
}
```

---

## 25. 아트 담당자 전달문

### PREMIUM ATRIUM

핵심 이미지:

> **작은 Service Node에서 나온 Player가 거대한 밝은 Commercial Atrium의 중앙 Void 앞에 선다. 아래와 위가 하나의 공간으로 이어지고, 작은 Patrol Drone과 Scanner Mount가 거대한 건축에 비해 작게 보인다. Player는 Cyan Rope로 그 빈 공간을 크게 가로지른다.**

### 핵심 Scale

```text
SMALL PLAYER
+
SMALL SECURITY DEVICE
+
HUGE COMMERCIAL VOID
```

### 필요한 Visual

- Large premium balcony
- tall atrium frame
- large powered advertisement
- empty lounge
- premium storefront shell
- scanner reuse
- Patrol Drone reuse
- Gate / Panel reuse

### 가장 중요한 제한

```text
BIG SPACE
≠
MORE DETAIL EVERYWHERE
```

Near Gameplay 주변은 절제.

---

## 26. 개발자 최종 전달 요약

### SECTOR 03-6 — PREMIUM ATRIUM

역할:

```text
3-5 REST
→
3-6 LARGE MOVEMENT EXPRESSION
```

새 시스템 없음.

Reuse:

```text
Access Scan Field
Patrol Drone T1
Gate Panel / Gate
Current Rope physics
```

### Core Layout

```text
FIRST LARGE SCANNER ARC
→
MID SAFE M1
→
SCANNER + DRONE COMMIT
→
UPPER FREE FLOW
→
GATE
```

### Scanner

```text
C1 + C2
same group
same timing
no faster variant
```

### Drone

```text
1 T1
kill optional
no rope cut
```

### Build

```text
Foundation + first Specialization
DESIGN KEEP

Runtime effect
PENDING
```

그래서 Build effect 없이 Mandatory Clear 가능해야 한다.

### Story

새 정보보다:

```text
LOCAL POWER BUS ACTIVE
COMMERCIAL SERVICE LIMITED / ONLINE
```

환경 대비 강화.

Priority / Tier는 3-7에 남긴다.

### 다음 Stage

3-7:

```text
PRIORITY CONCOURSE
STORY PRESSURE
+
SECURITY SYNTHESIS
```

에서 처음 Access / Priority 언어를 본격적으로 전진시킨다.

---

## OPEN QUESTIONS

### 1. Scanner Runtime

3-6은 3-2 Scanner Prototype PASS가 선행 조건.

Scanner가 실제 구현되기 전
3-6 Runtime integration 금지.

### 2. Same Scanner Phase

C1/C2 동일 Phase를 기본으로 한다.

Playtest에서 지나치게 기다리는 시간이 길면
Phase를 복잡하게 만들기 전에:

- Geometry
- Landing time
- Scanner baseline duration

을 먼저 조정한다.

### 3. R1 위치

R1의 기본 Recovery는:

```text
R1 → M1
```

이다.

R1 → C2 직접 Commit은 Security Band를 그대로 사용하므로 숙련 선택으로 허용 가능하다.

반대로 R1에서 C2 없이 G3 / P3로 진행할 수 있으면
무료 Security Skip이므로 위치 또는 grappleable geometry를 수정한다.

### 4. Growth

3-6에서도 새 성장 없음.

3-6 Playtest 결과는
다음 Growth Tier 위치를 결정하는 핵심 데이터로 사용.

### 5. 3-7 Story Scope

3-6은 `POWER STATUS / SERVICE ONLINE`까지만.

Access Tier / Priority Route는
3-7 상세 문서에서 다시 검토 후 공개한다.

---

SECTOR 03-6 / PREMIUM ATRIUM — REV 1.0
