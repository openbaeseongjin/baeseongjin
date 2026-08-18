# SECTOR 04 — UPPER RESIDENTIAL / AMENITY DISTRICT

*MASTER PLAN CANDIDATE · REV 2.3 — PERSISTENT PURSUIT SECURITY*

`SECTOR 04 UPPER RESIDENTIAL / AMENITY DISTRICT` · `PRIVILEGE IS PROTECTED` · `PATROL-HEAVY SECURITY` · `LONG-ARC ROPE PLAY` · `SECTOR 02 MIRROR` · `SECTOR 05 HANDOFF`

| 항목 | REV 2.1 기준 |
|---|---|
| Status | DESIGN LOCKED AT MASTER CONCEPT / PATROL CHOREOGRAPHY + PERSISTENT PURSUIT ADOPTED / INDIVIDUAL STAGE BLOCKOUTS PENDING |
| Latest Main Checked | `8afd16bc76462436490fe7c753611c2ecf36b548` |
| World Identity | **UPPER RESIDENTIAL / AMENITY DISTRICT — 상층 주거·여가·지원 생활권** |
| Sector Role | Sector 02 Worker District의 사회적·공간적 Mirror / Sector 05 Corporate로 넘어가는 상층 생활권 |
| Core Theme | **PRIVILEGE IS PROTECTED** |
| Core Gameplay | **PATROL READ → DETECTION → PERSISTENT PURSUIT → OUTRUN OR KILL → LONG-ARC ROPE CONTINUATION** |
| Primary Enemy | `Patrol Drone T1` — current implemented moving-security family |
| Humanoid Guard | NOT IMPLEMENTED — Master mandatory requirement 아님 |
| Cutter | Limited reuse candidate from 4-6 onward only |
| Wind | Limited reuse as upper-level Crosswind candidate at exposed terraces |
| Scanner | NONE as Sector core |
| New Rope Mode / New Input | NONE |
| New Mandatory Augment | NONE |
| Augment Contract | Base Rope clear mandatory / Augment = expression, speed, recovery advantage |
| Boss | 4-8 내부 NONE / Post-Sector 04 Boss or transition TBD |
| Runtime | Existing Sector04 standalone catalog = LEGACY TRANSIT VERSION / REV2.1 MIGRATION REQUIRED |
| Sector 04 → 05 | Corporate boundary only; direct wiring locked only after transition contract |

---

## 마이그레이션 상태 — Stage 문서 동기화

이 Master Plan은 REV 2.3(Upper Residential / Persistent Pursuit)이다. Stage 문서 동기화 현재 상태:

```text
4-1  SKY RESIDENCE ARRIVAL   REV 2.3 동기화 완료
4-2  RESIDENTIAL COURTYARD   REV 2.3 동기화 완료
4-3~4-8                      아직 REV 1.1 TRANSIT / INFRASTRUCTURE 기준
                              (TRANSIT INTAKE 계열 세계관 — 이 Master와 불일치, 별도 후속 작업 필요)
```

`Persistent Pursuit Alert Latch` 시스템 상세는 [`PERSISTENT-PURSUIT-RUNTIME-HANDOFF.md`](./PERSISTENT-PURSUIT-RUNTIME-HANDOFF.md)를 따른다.

---

## 0. Source of Truth

### Latest checked `main`

```text
6f8d2529a759ca37c8aecc0185d9a0a797c6bbda
```

Latest HEAD change is multiplayer Quick Tunnel metadata only.
Gameplay contract change 없음.

### Current Base Rope

```text
Player radius             15
Gravity                   1250
Max horizontal speed      360
Jump speed                440

Hook speed                1200 px/s
Hook lifetime             1/3 sec
Hook reach                400 px
Hook reload               1.0 sec
Attach buffer             0.1 sec
Swing impulse             780
Release angular transfer  0.55
```

### Augment V1

Current v1 replaces the old Foundation / Specialization product contract.

Key rules:

- Base Rope + base action만으로 mandatory progression 완주 가능해야 함.
- 특정 card / party combination을 mandatory geometry 해법으로 요구하지 않음.
- Player당 최대 6장.
- Sector당 1회 logical entitlement.
- 정확한 Sector 02~06 획득 Landmark는 아직 HOLD.
- Therefore Sector 04 Master does not lock an Augment room or exact Augment pickup stage.

Relevant movement expression:

```text
fast-launch
long-rope
fast-recover
release-propulsion
direction-dash
slow-fall
rope-link
```

---

# 1. Sector 04 한 줄 정의

**Player가 Sector 03의 공공 상업·교류 공간을 빠져나와, Sector 02의 노동자 주거와 정반대로 넓고 조용하며 빛·식재·의료·여가·개인 서비스가 풍부했던 상층 생활권에 진입하지만 사람은 사라지고 자동 Security Patrol만 규칙적으로 계속 움직이는 공간에서, 경비의 현재 위치와 순찰 경로를 읽은 뒤 큰 Rope Arc로 그 coverage를 통과하고, 상층의 생활·지원·대피 체계가 하층보다 더 오래 유지되었다는 운영 상태를 확인한 뒤 Corporate Continuity 영역으로 올라가는 Sector.**

---

# 2. World Role — Sector 02 Mirror

## Sector 02 — Worker District

```text
dense
shared
worn
labor-centered
balcony
canteen
laundry
shelter
waiting
```

Question:

> 왜 이 사람들은 여기서 기다리고 있었지?

## Sector 04 — Upper Residential / Amenity

```text
spacious
private
quiet
clean
care-centered
sky garden
private lounge
clinic
amenity
refuge terrace
persistent security
```

Question:

> 같은 사고인데 왜 이곳의 삶과 지원 시스템은 더 오래 유지됐지?

## Contrast Rule

Sector 04를 단순한 “부자 구역 caricature”로 만들지 않는다.

차이는 다음으로 보여준다.

- 1인당 공간
- 조명과 시야
- 조경과 외부 접촉
- 의료·건강·여가 서비스
- private / shared 공간 비율
- Security coverage
- evacuation support 상태

---

# 3. Core Theme — PRIVILEGE IS PROTECTED

Sector 04의 첫 인상:

```text
People are gone.

Lights remain.
Gardens remain.
Care systems remain.

Security still patrols.
```

Gameplay적으로:

> **Patrol은 예외적 Encounter가 아니라 공간의 정상 상태다.**

Sector 02에서 Patrol Drone은 “첫 Moving Enemy”였다.

Sector 04에서 Patrol Drone은:

```text
normal environmental pressure
```

가 된다.

Player가 새 공간에 들어오면:

```text
WHERE IS THE NEXT ANCHOR?
+
WHERE IS THE PATROL NOW?
+
WHERE IS IT MOVING?
+
WHEN DO I COMMIT?
```

를 함께 읽는다.

---

# 4. Current Patrol Runtime Reality

## VERIFIED

Current patrol state supports:

```text
2+ patrol points
pingpong
loop
speed
waitSeconds
activation bounds
```

Patrol route는 activation bounds 안으로 clamp된다.

## Combat behavior

Current Patrol Drone is not a continuous chase-shoot guard.

Conceptually:

```text
PATROL
→ PLAYER ACQUIRED
→ TRACK
→ LOCK
→ FIRE
→ COOLDOWN
```

따라서 Sector 04의 핵심 skill은:

> “발견된 뒤 추격전을 오래 한다”

가 아니라

> **“순찰 위치가 바뀌는 공간에 Rope로 언제 Commit하느냐”**

다.

## NOT IMPLEMENTED

```text
humanoid walking guard
continuous chase while firing
squad search
stealth vision cone
cover-state investigation
```

이 기능들은 REV2.1 Master의 mandatory dependency가 아니다.

---

# 5. Many Guards ≠ Many Simultaneous Fights

현재 enemy attack range:

```text
760 px
```

Projectile damage:

```text
20
```

따라서 3~4기 Crossfire를 한 화면에 동시에 넣으면 Rope보다 탄막이 Gameplay를 지배한다.

### Sector-wide rule

```text
MANY TOTAL PATROLS
+
FEW SIMULTANEOUS ACTIVE PATROLS
```

권장:

```text
normal beat:
active combat 0~1

high-pressure beat:
active combat <=2

3+ simultaneous combat:
FORBIDDEN BY DEFAULT
```

Patrol 총량은 많지만 `activation-band-only`를 이용해 progression band를 나눈다.

---

# 6. Sector 04 Gameplay Grammar

```text
OBSERVE PATROL POSITION
→
READ NEXT LONG ARC
→
COMMIT ROPE
→
CROSS SECURITY COVERAGE
→
LAND / COAST / RELOAD
→
REASSESS
```

## Not a stealth game

금지:

```text
wait behind cover for 10 seconds
vision cone puzzle
mandatory crouch / hide
silent takedown
enemy clearance gate
```

Player의 가장 좋은 해법은 여전히:

> **좋은 Rope movement**

다.

## Not an arena shooter

Patrol kill:

```text
OPTIONAL
```

Kill하면 통과가 쉬워질 수는 있다.

하지만:

```text
ALL GUARDS DEAD
→ DOOR OPEN
```

금지.

---

# 7. Rope Geometry Rule

Sector 04 공간은 넓다.

따라서 촘촘한 Grapple ladder 금지.

```text
BAD
A → B → C → D
short repetitive hook chain
```

권장:

```text
HOOK
→ LARGE PENDULUM
→ RELEASE
→ COAST / TERRACE LANDING
→ RELOAD
→ NEXT LONG COMMIT
```

### Base validation

Mandatory Base Rope:

```text
reach <= 400
```

Default `GRAPPLE_LINK_BUDGET = 600` validation만으로 Gameplay PASS 판정 금지.

### Augment validation

`long-rope`:

```text
400 → 480
```

허용:

- aggressive grab
- landing reduction
- expressive shortcut

금지:

- Story skip
- Gate skip
- entire security beat bypass

---

# 8. Patrol Geometry Vocabulary

## A. Balcony Pingpong

```text
● ←────────→ ●
```

Use:
- Residential bridge
- Private balcony line

Question:
- patrol이 어느 쪽 끝에 있는가?

## B. Courtyard Loop

```text
●────●
│    │
●────●
```

Use:
- Garden
- Amenity Atrium perimeter

Question:
- coverage가 어느 변으로 이동 중인가?

## C. Staggered Patrol

```text
LOWER  ←────→
            UPPER ←────→
```

Use:
- multi-height courtyard
- refuge terrace

No overlapping crossfire.

## D. Sequential Bands

```text
BAND A
↓
SAFE / RECOMPOSE
↓
BAND B
```

Use:
- 4-5 onward

---

# 9. Eight-Stage Spatial / Security Progression

## 4-1 — SKY RESIDENCE ARRIVAL

Role:

```text
WORLD CONTRAST
+
SECURITY PRESENCE INTRO
```

Space:

- arrival terrace
- upper residential lobby
- open planted courtyard
- long sightline

Security:

```text
1 Patrol Drone
```

Purpose:
- “경비가 존재한다”를 첫 화면부터 보여줌.
- 적 튜토리얼 아님.
- 한 번의 low-pressure timing beat.

No:
- Cutter
- Wind
- Scanner
- kill gate

---

## 4-2 — RESIDENTIAL COURTYARD

Role:

```text
FIRST PATROL TIMING
```

Space:

- private balcony
- residential bridge
- courtyard planting

Security:

```text
2 Patrols total
simultaneous combat <=1
```

Different height patrols.

Player learns:
- 같은 Backbone도 patrol 위치에 따라 좋은 release timing이 바뀜.

---

## 4-3 — SKY GARDEN TERRACES

Role:

```text
PATROL ROUTE GEOMETRY
```

Space:

- exterior garden
- terrace chain
- canopy frame

Security:

```text
2 Patrols
loop / pingpong variation
```

Optional environment candidate:

```text
Crosswind
```

Crosswind is not locked until Stage design proves it adds value.

---

## 4-4 — CARE PAVILION

Role:

```text
LOW-PRESSURE STORY TRAVERSE
```

Space:

- clinic
- wellness
- care atrium
- protected balcony

Security:

```text
1 visible Patrol pressure
```

No Rest Room.

Movement continues.

Story:
- Upper Residential Support / Emergency Care remained available for a limited period.

No causal explanation.

---

## 4-5 — AMENITY ATRIUM

Role:

```text
PATROL DENSITY PEAK
+
BUILD EXPRESSION
```

Space:

- large lounge atrium
- indoor garden void
- suspended architecture

Security:

```text
3 Patrols total
simultaneous active <=2
```

Sector 04 largest pure Rope expression room under moving security.

Augment benefits are visible but never required.

---

## 4-6 — PRIVATE SKYBRIDGE

Role:

```text
MOBILE + STATIC SECURITY
```

Space:

- controlled private bridge
- upper facade crossover
- private boundary

Security candidate:

```text
2 Patrols
+
1 Cutter Sentry
```

Roles separated:

```text
Patrol
= changing position pressure

Cutter
= Rope-line pressure
```

No full overlap / crossfire wall.

---

## 4-7 — REFUGE TERRACE

Role:

```text
PATROL NETWORK SYNTHESIS
+
STORY REVEAL
```

Space:

- emergency refuge
- protected terrace
- upper evacuation interface

Security:

```text
3 Patrols total
simultaneous active <=2
```

Optional:
- limited Crosswind if spatially justified.

Story:
- Upper Residential Evacuation Support remained LIMITED / AVAILABLE.

No Group mapping.

---

## 4-8 — UPPER RESIDENTIAL THRESHOLD

Role:

```text
SECURITY ECOSYSTEM FINALE
+
CORPORATE HANDOFF
```

Space:

- private upper lobby
- controlled transfer hall
- Corporate threshold

Security:

```text
3~4 Patrols total
sequential bands
simultaneous active <=2
```

Final rhythm:

```text
PATROL READ
→ LONG COMMIT
→ SECURITY INTERRUPTION
→ RECOVERY
→ SECOND PATROL BAND
→ FINAL CLEAN SWING
```

No new mechanic.

---

# 10. Patrol Count Candidate

| Stage | Patrol Total | Simultaneous Active Target |
|---|---:|---:|
| 4-1 | 1 | 0~1 |
| 4-2 | 2 | ≤1 |
| 4-3 | 2 | ≤2 |
| 4-4 | 1 | ≤1 |
| 4-5 | 3 | ≤2 |
| 4-6 | 2 + Cutter 1 | ≤2 security sources |
| 4-7 | 3 | ≤2 |
| 4-8 | 3~4 | ≤2 |

Approx total Sector presence:

```text
17~18 moving patrol instances
```

This is a planning density target, not a locked spawn count.
Individual Stage blockout/playtest may reduce counts.

---


# 8-1. Patrol Choreography — Sector 04 대표 Gameplay 언어

Sector 04에서 Patrol을 단순한 `좌↔우 왕복 적`으로 반복하지 않는다.

현재 Runtime이 지원하는:

```text
2+ patrol points
pingpong
loop
speed
waitSeconds
activation bounds
```

를 조합해 Stage마다 다른 **경비 동선 문법**을 만든다.

## Pattern A — LONG PINGPONG

```text
●────────────────────●
        ←      →
```

사용:
- residential skybridge
- long balcony
- private corridor edge

Player 판단:
- 경비가 반대편 끝으로 이동한 순간 긴 Rope commit.

## Pattern B — PERIMETER LOOP

```text
●──────●
│      │
│      │
●──────●
```

사용:
- courtyard
- amenity atrium
- sky garden perimeter

Player 판단:
- 어느 변의 coverage가 비어 있는가.

## Pattern C — VERTICAL / DIAGONAL SWEEP

```text
●
 ╲
  ╲
   ●
```

또는:

```text
●
│
│
●
```

사용:
- double-height lounge
- facade void
- refuge terrace

현재 Patrol point는 2D 좌표이므로 수평 patrol만 고집하지 않는다.

Player 판단:
- 다음 Rope arc와 Guard path가 언제 교차하는가.

## Pattern D — STAGGERED PAIR

```text
LOWER   ●──────●
              ↑ phase offset
UPPER       ●──────●
```

두 경비의 route/activation을 서로 다른 progression band에 둔다.

목적:
- 경비가 많은 느낌
- 동시 Crossfire 제한

## Pattern E — DIFFERENT SPEED / WAIT RHYTHM

현재 Runtime은 segment별 speed variation은 지원하지 않는다.

하지만 Enemy instance마다:

```text
speed
waitSeconds
```

를 다르게 줄 수 있다.

따라서:

```text
FAST PATROL / SHORT WAIT
SLOW PATROL / LONG WAIT
```

처럼 서로 다른 경비 리듬을 만든다.

## Pattern F — SEQUENTIAL SECURITY BANDS

```text
PATROL A
↓
RECOMPOSE TERRACE
↓
PATROL B
↓
RECOMPOSE
↓
PATROL C
```

Sector 04 후반 기본 구조.

---

# 8-2. Patrol Choreography 금지선

현재 Runtime에 없는 것을 있는 것처럼 설계하지 않는다.

NOT IMPLEMENTED:

```text
vision cone stealth
player chase while continuously patrolling
guard-to-guard alert propagation
search state
formation movement
segment-by-segment variable speed
humanoid guard locomotion
```

따라서 현재 Master의 “경비가 다양하게 움직인다”는 의미는:

> **각 경비가 서로 다른 2D patrol route / loop / pingpong / speed / wait / activation choreography를 가진다.**

새 AI는 실제 구현된 뒤 별도 확장한다.

---

# 8-3. Stage별 Patrol Choreography 목표

| Stage | Patrol Choreography |
|---|---|
| 4-1 | `PERIMETER LOOP + LONG PINGPONG` — 첫 두 문법 소개, activation 분리 |
| 4-2 | 서로 다른 높이의 `STAGGERED PINGPONG` |
| 4-3 | Sky Garden `PERIMETER LOOP + DIAGONAL SWEEP` |
| 4-4 | 외곽 `SLOW LOOP` 1기 — Story 공간 안쪽은 상대적 안전 |
| 4-5 | `3-LAYER CIRCUIT` — Loop / Pingpong / Diagonal, 동시 active ≤2 |
| 4-6 | `LONG PINGPONG Patrol + Cutter Line` 역할 분리 |
| 4-7 | `STAGGERED PAIR + PERIMETER LOOP` |
| 4-8 | `SEQUENTIAL BANDS`로 이전 Patrol pattern 전체 회수 |


# 11. Recovery

Sector 04 failure should usually mean:

```text
MOMENTUM / POSITION LOSS
```

not:

```text
FULL STAGE RESET
```

Recovery is architectural:

- balcony
- terrace
- planter ledge
- lounge deck
- care balcony
- refuge platform

Target:

```text
~3–5 sec to regain current progression band
```

Recovery must not become the fastest intentional route.

---

# 12. Story Progression

## 4-1 — CONTRAST

Observe:

```text
UPPER RESIDENTIAL
LIGHTING / BASIC SERVICE
STILL ACTIVE OR RECENTLY ACTIVE
```

No causal statement.

## 4-4 — SUPPORT

Confirm:

```text
UPPER RESIDENTIAL SUPPORT
EMERGENCY CARE
LIMITED OPERATION
```

## 4-7 — EVACUATION

Confirm:

```text
UPPER RESIDENTIAL
EVACUATION SUPPORT
LIMITED / AVAILABLE
```

## 4-8 — JUXTAPOSITION

Player has now seen:

```text
LOWER:
waiting / suspended / degraded traces

UPPER:
residential support
security
evacuation support
persisted longer
```

Question carried into Sector 05:

> **누가 왜 이 차이를 유지했는가?**

---

# 13. Story Disclosure Boundary

## Sector 04 may confirm

- Upper residential services persisted longer.
- Upper care support existed after the incident.
- Upper evacuation support remained available in limited form.
- Security patrol persisted.

## Sector 04 must not confirm

- Group C = a specific lower route.
- Group A/B = upper residential population.
- Priority caused lower suspension.
- Exact Corporate decision maker.
- Deliberate sacrifice of a named group.
- Exact resource-allocation order.

These belong to Sector 05 Corporate Continuity.

---

# 14. Visual / Architectural Identity

## Material

- warm stone
- pale composite
- controlled glass
- timber-like panels
- planted systems
- low signage density

## Scale

- wide courtyards
- double-height lounge
- long terrace views
- low object density around Player
- large negative space for Rope arcs

## Life trace

- private furniture
- gardens
- health / care props
- recreation
- education / family amenity traces
- emergency refuge equipment

Avoid:
- cartoon luxury
- gold-everything caricature
- generic hotel corridor repetition

---

# 15. Augment Compatibility

## Fast Launch

Advantage:
- patrol window에 더 빠른 hook commit.

Must not:
- be required for a mandatory gap.

## Long Rope

Advantage:
- aggressive terrace grab / fewer landings.

Must not:
- skip Stage objective/security/story.

## Fast Recover

Advantage:
- shorter exposure after release.

Must not:
- invalidate a timing puzzle built around exactly 1.0 sec waiting.

## Release Propulsion

Advantage:
- large atrium expressive arc.

Must not:
- cause mandatory ceiling/wall impact.

## Direction Dash

Advantage:
- correction / recovery.

Must not:
- be the only way through security.

## Slow Fall

Advantage:
- safer miss recovery.

Must not:
- be required for any mandatory fall.

## Combat cards

Advantage:
- remove Patrol/Cutter more easily.

Must not:
- create kill requirement.

---


# 16-A. NEW SECTOR 04 SECURITY CONTRACT — PERSISTENT PURSUIT

## Design Decision

Sector 04부터 상층 Security Guard/Drone은:

```text
PATROL
→
PLAYER DETECTED
→
ALERT LATCHED
→
PERSISTENT PURSUIT
→
KILLED
```

를 기본 상태 전이로 사용한다.

### Core Rule

> **한 번 Player를 인지한 경비는 다시 Patrol 상태로 돌아가지 않는다.**

단순히 공격 사거리 밖으로 나갔다고 Aggro가 해제되지 않는다.

Line of sight가 잠시 끊겨도 Alert는 해제되지 않는다.

---

## Current Runtime Basis

현재 코드에는 이미:

```text
pursuit-drone-t1
PursuitEnemyBehavior
```

가 존재한다.

Current default behavior:

```text
seek
→ windup
→ dash
→ recover
→ seek
```

Default tuning:

```text
moveSpeed        160
dashSpeed        640
triggerDistance   96
acquireRange     640
windupSeconds   0.25
dashSeconds     0.20
recoverySeconds 0.50
```

또한 `pursuit-drone-t1`은 projectile attack도 사용하는 current archetype이다.

하지만 현재 behavior는:

```text
target outside acquireRange / activation
→ may lose target
```

이므로 REV2.3의 persistent pursuit는 아직 완전히 구현된 상태가 아니다.

Status:

```text
PERSISTENT PURSUIT LATCH
= NEW SYSTEM / NOT IMPLEMENTED
```

---

## Required Runtime Behavior

### Before Detection

경비는 authored Patrol Route를 따른다.

```text
loop
pingpong
multi-point
speed / waitSeconds
```

### Detection

첫 valid Player acquisition 순간:

```text
alerted = true
latchedTargetId = detected player
```

### After Detection

Patrol route를 중단.

```text
PATROL OFF
PERSISTENT PURSUIT ON
```

경비는 해당 Stage 안에서 Player를 계속 추적한다.

### Chase Persistence

다음으로 Aggro를 해제하지 않는다.

```text
distance > initial acquireRange
temporary line-of-sight loss
Player reaches recovery ledge
Player enters next security band
```

### Chase End

다음 중 하나만 허용:

```text
guard health <= 0
Stage / Area unloaded by valid transition
party wipe / area reset
```

### Multiplayer Target Policy

초기 Target은 최초 인지 Player.

그 Player가:

```text
dead
disconnected
not active
```

가 되면:

```text
nearest active Player in same area
```

로 retarget.

Area 안에 active Player가 없으면 alerted state는 유지하되 이동/공격은 정지하고 reset contract를 기다린다.

---

## Pursuit Movement Rule

Player는 경비를 완전히 따돌리는 stealth 게임을 하지 않는다.

대신:

```text
OUTRUN
or
KILL
```

을 선택한다.

Existing Pursuit default:

```text
moveSpeed 160
```

은 Player의 일반 수평 max 360보다 느리므로,
Rope Momentum을 유지하는 Player는 추격을 앞설 수 있다.

하지만 Player가:

```text
landing
miss
recovery
story reading
```

으로 오래 멈추면 Pursuit가 따라붙는다.

근접하면 current Pursuit dash:

```text
windup 0.25
→ dash 640
→ recover 0.5
```

가 압박한다.

Exact tuning은 playtest 대상이며 Master에서 lock하지 않는다.

---

## Important Gameplay Consequence

기존:

```text
PATROL BAND A
→ leave activation
→ pressure ends
```

이제:

```text
PATROL A detects Player
→ Player climbs
→ Patrol A follows
→ next beat에도 뒤에서 pressure
```

가 된다.

즉 **경비를 죽이지 않고 지나가는 선택에는 미래 비용이 생긴다.**

### Player Choice

```text
KILL GUARD
= 현재 시간을 쓰고 이후 pressure 제거

OUTRUN GUARD
= 현재 Momentum 유지
  but pursuit pressure carries forward through Stage
```

이 선택이 Sector 04의 전투/이동 결합 핵심이다.

---

## Stage Boundary Rule

Persistent Pursuit는 기본적으로:

```text
CURRENT STAGE / AREA ONLY
```

다.

경비가 다음 Stage로 물리적으로 넘어오지는 않는다.

이유:

- authored area lifecycle과 충돌 방지
- 4-1에서 놓친 Guard가 4-8까지 누적되는 snowball 방지
- 각 Stage의 Security composition 보존
- multiplayer state 단순화

Stage Gate를 정상 통과하면 해당 Stage 경비는 unload된다.

---

## Density Rule Revision

이전 Master의:

```text
MANY TOTAL
FEW ACTIVE
```

는 다음으로 수정한다.

```text
MANY PATROLS
+
PERSISTENT ONCE ALERTED
+
LIMIT INITIAL SPAWN COUNT
```

### Early Sector

```text
4-1: 2 total
4-2: 2 total
4-3: 2 total
```

Worst case:
2 Pursuers.

### Mid / Late Sector

```text
4-5: 3 total
4-7: 3 total
4-8: 3~4 total
```

하지만 Stage geometry / spawn bands는
Player가 3~4 Pursuers에게 동시에 즉시 발각되지 않게 구성한다.

Skillful Player:
- 일부를 지나치고 Momentum으로 outrun 가능.

Slow Player:
- 추격자가 합류하며 pressure 증가.

---

## No Fake Stealth

REV2.3에서도 다음은 없음:

```text
vision-cone stealth
hide meter
aggro decay
silent takedown
search mode
alert reset room
```

“발각되지 않기”보다:

> **발각된 뒤에도 Rope Momentum으로 얼마나 잘 계속 올라가는가**

가 Sector 04 핵심이다.

---

## Story Meaning

Persistent Security는 Story에도 의미를 가진다.

```text
Residents are gone.
Security does not disengage.
```

즉 상층 생활권 보호 시스템은:

> 사고 이후에도 자기 임무를 계속 수행하고 있다.

Sector 05로 넘기는 질문:

> **왜 이 상층 영역의 보호와 연속성은 이렇게 오래 유지되도록 설계됐는가?**


# 16. Runtime Migration Status

Current `Sector04AreaCatalog.js` is the legacy Transit version.

Current area names / mechanics are not the REV2.1 target.

Therefore:

```text
CURRENT SECTOR04 RUNTIME
= LEGACY STANDALONE

REV2.1 UPPER RESIDENTIAL / PATROL
= NOT IMPLEMENTED
```

Do not label REV2.1 as Runtime aligned until migration PR + tests + playtest pass.

---

# 17. Before Every Stage Design

Re-check latest `main`:

```text
src/game/config.js
src/game/physics/PlayerPhysics.js
src/game/rope/*
src/game/combat/EnemyPatrol.js
enemy attack / projectile logic
src/game/augments/*
src/game/world/AreaDefinitionValidator.js
src/game/world/areas/sector04/Sector04AreaCatalog.js
adjacent Stage docs / runtime
```

Review:

- Rope reach / reload / release changed?
- Patrol behavior changed?
- Attack range / damage changed?
- new Guard family implemented?
- Augment catalog changed?
- Camera changed?
- Cutter changed?
- World validator changed?

Map planning must use current code, not stale Master numbers.

---

# 18. Sector 04 Master PASS

### Space

- [ ] Sector 02/03와 첫 화면부터 다른 Upper Residential identity.
- [ ] 8 Stages are explainable as one continuous upper living district.
- [ ] Security patrol feels native to the space.

### Gameplay

- [ ] Base Rope only clear.
- [ ] Patrol position meaningfully changes commit timing.
- [ ] Many patrols across Sector, few simultaneous active fights.
- [ ] No kill gate.
- [ ] No artificial Safe/Flow corridor menu.
- [ ] Recovery is architectural and quick.

### Runtime

- [ ] No humanoid Guard required until actually implemented.
- [ ] Patrol routes use current pingpong/loop contract.
- [ ] Activation bands limit crossfire.
- [ ] 400px actual reach validated separately from 600 topology budget.
- [ ] Augment bypass regression tested.

### Story

- [ ] Upper privilege is shown through space and system persistence.
- [ ] Security remains active after residents disappear.
- [ ] Sector 05 still owns causality and decision responsibility.

---

# 19. Final Master Summary

```text
SECTOR 04
UPPER RESIDENTIAL / AMENITY DISTRICT

VISUAL FANTASY
Spacious upper-city life

GAMEPLAY FANTASY
Read moving security positions
→ commit Rope through patrol coverage
→ recover quickly
→ keep climbing

STORY FANTASY
People are gone,
but the systems protecting upper life are still running.

CORE THEME
PRIVILEGE IS PROTECTED
```
