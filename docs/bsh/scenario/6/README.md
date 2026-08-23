# SECTOR 06 — ROOFTOP / EVACUATION MASTER PLAN

*RUNTIME GENERATED · PLAYTEST TUNING PENDING*

`SECTOR 06 ROOFTOP / EVACUATION` · `THE GOAL IS VISIBLE; THE ROOM IS GONE` · `OPEN SKY / STRUCTURAL ISLANDS` · `FINAL BUILD EXAM` · `ESCAPE`

| 항목 | REV 1.0 기준 |
|---|---|
| Status | 6-1~6-8 RUNTIME GENERATED — browser playtest tuning pending |
| Authoring Snapshot | `8b344f0f7a2309bfb316655668ed180718db7781` |
| Sector Role | Corporate Continuity Zone 이후 최종 Rooftop / Pad 03 접근 |
| Core Gameplay Shift | Sparse Corporate Hardpoint Commitment → Open-Sky Structural-Island Execution |
| Core Story Shift | “왜 Lower evacuation이 중단됐는가?” → “진실을 안 상태에서 실제 탈출 지점까지 도달할 수 있는가?” |
| Primary Spatial Identity | OPEN SKY / STRUCTURAL ISLANDS / HORIZONTAL-DIAGONAL ROOFTOP TRAVERSE |
| New Rope Mode | NONE |
| New Input | NONE |
| New Growth | NONE |
| Foundation | CURRENT RUNTIME — selected Foundation KEEP |
| First Specialization | CONTENT BLOCKED / NOT REQUIRED |
| Legacy Artifact Layer | REMOVED FROM CURRENT RUNTIME |
| New Enemy AI Type | NONE |
| Existing Threat Recall | Wind / Standard Sentry / Access Scan Field / Patrol / Cutter |
| Moving Platform / Train | NONE |
| General Stages | 8 |
| 6-8 Internal Boss | NONE |
| Post-6-8 Final Security Encounter | REQUIRED CONCEPT / detailed boss contract TBD |
| Sector06 Direct Wiring | 6-8 → Final Encounter boundary only; no arbitrary next-area wiring |
| Final Escape | ROOFTOP PAD 03 → MAINTENANCE SHUTTLE |
| Ending Tone | ESCAPE, not revenge / revolution |
| Sector06 Runtime | 6-1~6-8 internally connected; 6-8 content boundary |
| Approved Gameplay Art | HOLD until Runtime Area / Camera Zone / Stable IDs exist |

---

## 0. Source-of-Truth / 작성 기준

### Authoring Package Boundary

This Master owns the cross-stage Rooftop / Evacuation direction. The detailed
topology, story, validation, handoff, and preview sources for 6-1 through 6-8
are the authored package files in their Stage directories. The separately
supplied `6-1/MASTERPLAN-REV2-MAP-SCALE.md` identifies itself as a 6-1 planning
draft, so it is retained as reference-only material and does not override this
Master or the 6-1 REV3.0 package.

Importing these sources does not create Runtime geometry, a Sector transition,
the Final Security encounter, a general timer, or multiplayer behavior. Current
main and Runtime integration status are owned by
[`scenario-development-integration.md`](../../../scenario-development-integration.md).

### Authoring Snapshot

작성 시작·최종 검토 기준:

```text
8b344f0f7a2309bfb316655668ed180718db7781
```

This is an authoring snapshot, not a statement that the packages are connected
to the current Runtime.

### Current Scenario / Runtime Integration

GitHub 통합 문서 기준:

```text
Detailed Scenario Docs
1-1 ~ 6-8
= 48 stages
= Sector 06 authored package merged; Runtime status remains separate

Default Authored World
1-1 → 3-8
= 24 areas
= MOCK INTEGRATED

Sector04
4-1 → 4-8
= standalone authored catalog
= GRAYBOX READY / main world not connected

Sector05
Master + 5-1~5-8 merged (#577)
runtime not authored

Sector06
Master + 6-1~6-8 authored packages
runtime not authored
```

### Current Planning Priority

사용자 결정:

```text
SECTOR 01 ~ 06
SCENARIO FIRST
```

따라서 Sector06에서도:

- Sector05 Runtime authoring
- Sector04 alignment patch
- boss code
- final ending code
- art production

으로 빠지지 않는다.

Sector06 상세 시나리오와 전체 게임 Audit을 먼저 끝낸다.

---

## 0-1. Historical Skeleton Transfer Filter

GitHub historical scenario skeleton의 Sector06 핵심:

```text
ROOFTOP / EVACUATION
41–48

Gameplay
모든 능력 종합

Visual
하늘
고층 구조물
안테나
착륙장
작은 조명

48 이후
Rooftop Landing Pad
마지막 탈출 기체 존재
ACCESS DENIED
Final Security Encounter
```

Ending skeleton:

```text
보안 시스템 돌파
→ 착륙장 잠금 해제
→ 기체 탑승
→ 상승
→ 수직도시 전체가 처음 한 화면에 보임
→ 하층은 어둡고 상층은 불이 남아 있음
→ Red Scarf
→ EVACUATION COMPLETE
```

### TRANSFER — 유지

- 마지막 8개 일반 Stage는 새 보상 구간이 아니라 Final Exam.
- 실내가 아니라 처음으로 하늘이 크게 보이는 구역.
- 48번째 일반 Stage 이후 탈출 수단이 실제로 존재.
- 접근은 마지막 Security에 의해 차단.
- 최종 Security Encounter는 거대한 인간형 악당보다 도시 Security / Anchor 구조 중심이 적합.
- Ending은 짧고 시각적.
- Player 목표는 끝까지 Escape.

### REFINED — 현재 Canon에 맞춤

Historical:

```text
last evacuation craft
```

현재:

```text
ROOFTOP PAD 03
MAINTENANCE SHUTTLE
STANDBY
```

Historical:

```text
company abandoned lower sectors
```

현재 확정된 더 정확한 Canon:

```text
Cascade
REAL INCIDENT

Post-Cascade
Incident Continuity Control
resource / continuity triage

Upper Core / Evacuation Capacity
preserved

Lower Ascent
suspended

Lower-sector Evacuation
suspended
```

---

## 0-2. Opening → Ending Loop

### 1-1에서 처음 얻은 목표

Current 1-1 Story:

```text
Lower transit
offline

Rooftop Pad 03
Maintenance Shuttle
available / alive
```

Player의 전체 게임 목표는 여기서 생겼다.

### 5-8에서 재확인

```text
ROOFTOP PAD 03
MAINTENANCE SHUTTLE
STANDBY

LOWER TRANSIT
OFFLINE
```

### 6-8에서 물리적으로 도달

```text
ROOFTOP PAD 03
SHUTTLE VISIBLE
```

하지만:

```text
ACCESS DENIED
CONTAINMENT VIOLATION
```

### Final Encounter 이후

```text
PAD LOCK RELEASED
→ SHUTTLE BOARDING
→ EVACUATION COMPLETE
```

즉 1-1에서 시작한 목표를
마지막에 같은 장소 / 같은 수단으로 회수한다.

---

## 1. Sector 06 한 줄 정의

**Incident Continuity Control의 판단과 Lower-sector Evacuation Suspension의 전모를 이해한 Player가 더 이상 비밀이나 진실을 찾기 위해서가 아니라 처음부터 목표였던 Rooftop Pad 03까지 살아서 가기 위해 Corporate 건물의 외피를 뚫고 처음으로 넓은 하늘과 도시 전체의 깊이가 드러나는 Rooftop Crown에 진입해, 벽과 방 대신 서로 떨어진 Antenna Mast·Beacon Frame·Service Deck·Pad Perimeter 같은 Structural Island를 Rope로 가로지르며 Wind, Standard Sentry, Access Scan Field, Patrol, Cutter라는 이미 학습한 시스템을 새로운 Outdoor topology에서 하나씩 다시 증명하고, 마지막 6-8에서 위협이 사라진 순수 Open-Sky Rope Chain을 통해 실제 Maintenance Shuttle 앞에 도달하지만 `ACCESS DENIED / CONTAINMENT VIOLATION`으로 차단되어 별도의 Final Security Encounter로 진입한 뒤, Security를 돌파하면 Pad가 해제되고 Shuttle에 탑승해 도시를 떠나는 최종 Sector.**

---

## 2. Sector 06 핵심 문장

> **THE GOAL IS VISIBLE; THE ROOM IS GONE.**

Sector01~05에서는
대부분:

```text
ROOM
SHAFT
ATRIUM
CORRIDOR
TRUNK
SPINE
```

이 Player의 이동 방향을 어느 정도 프레이밍했다.

Sector06에서는:

```text
SKY
VOID
ROOFTOP ISLAND
MAST
BEACON
PAD
```

가 중심.

Player는 더 이상
“방의 위쪽 출구”를 찾는 것이 아니라:

```text
멀리 보이는 Pad 03
```

을 향해 도시의 Crown을 직접 횡단한다.

---

## 3. 전체 게임 Gameplay 질문의 완성

### Sector 01

> **Rope를 사용할 수 있는가?**

### Sector 02

> **Moving Threat 속에서 어떤 Route를 선택할 것인가?**

### Sector 03

> **Security State가 바뀔 때 언제 붙고 어디로 갈 것인가?**

### Sector 04

> **Flow가 끊겼을 때 얼마나 빨리 Momentum을 회복할 것인가?**

### Sector 05

> **Valid Anchor가 적을 때 어디에 Commitment할 것인가?**

### Sector 06

> **방과 벽이 사라지고 탈출 목표가 직접 보일 때, 지금까지 배운 Rope / Threat / Build 판단을 실제 Open Sky에서 끝까지 실행할 수 있는가?**

짧게:

> **SEE GOAL → READ STRUCTURE → COMMIT → ADAPT → ESCAPE**

---

## 4. Pre-Authoring Cross-Stage Repetition Audit

Sector06 Master 작성 전
기존 Finale / 대표 Geometry를 다시 확인했다.

### 1-8 — CONTAINMENT GATE

```text
2 Sentry
+
Pulsed Wind
+
Sequential Security Phases
+
Maintenance Override
```

### 2-8 — EVACUATION PLATFORM

```text
Large Atrium
+
2 Patrol Bands
+
Safe / Flow / Build routes
+
interconnected route choice
```

### 3-8 — UPPER MARKET GATE REV1.1

```text
FREE-WEAVE FIELD
+
Access Scan
+
2 Patrol
+
parallel / open route expression
```

### 4-8 — TRANSIT CONTROL TRUNK

```text
Long Central Wake
+
Cutter
+
Patrol
+
Momentum → Interruption → Recovery
```

### 5-8 REV1.1 — CONTINUITY CONTROL SPINE

```text
Narrow Spine
+
Patrol direction reversal
+
Full Safe Relay
+
Cutter direction reversal
+
Exterior-facing final rise
```

### Sector06 Finale Guard

따라서 6-8은 다음이 되어서는 안 된다.

```text
two sequential enemy bands
NO

giant free-weave atrium
NO

long wind trunk
NO

scanner + patrol field
NO

Patrol → Cutter relay reprise
NO
```

### Selected Difference

```text
6-8
=
PURE OPEN-SKY FINAL APPROACH
+
VISIBLE SHUTTLE
+
NO ACTIVE ENEMY
+
ACCESS DENIED BOSS ENTRY
```

실제 최종 Combat synthesis는
6-8 내부가 아니라
별도 Final Security Encounter가 담당한다.

---

## 5. Actual Geometry / Obstacle Lessons from GitHub

현재 authored Runtime을 기준으로
이미 사용된 대표 구조:

### Sector01

- narrow vertical shafts
- zig-zag grapple chains
- recovery beams
- solid overhang / crossbeam
- non-grappleable collision beam
- cover blocks
- fixed Sentry
- Wind shaft

### Sector02

- balconies
- residential bridges
- courtyard platforms
- Patrol corridors
- large evacuation atrium

### Sector03

- broad commercial atria
- parallel access routes
- Scanner-controlled grapple targets
- safe mid decks
- free-weave finale
- horizontal Patrol territories

### Sector04

- long infrastructure spans
- Cutter activation bands
- Wake / Wind rectangles
- recovery decks
- S-route
- central trunk
- separated Patrol/Cutter pressure

### Sector05 — reviewed local design

- sealed non-grappleable Corporate finish
- dedicated Service Hardpoints
- sparse attach choices
- preplanned Cutter recovery
- narrow Control Spine
- open Exterior-facing final rise

### Sector06 Geometry Rule

위 구조를 단순 복사하지 않는다.

Sector06의 메인 Collision / Traversal 단위:

```text
ROOFTOP ISLAND
ANTENNA SERVICE PLATFORM
BEACON FRAME
MAST BRACKET
PERIMETER GANTRY
PAD LIGHTING FRAME
MAINTENANCE CATWALK
```

---

## 6. Primary Spatial Rule — OPEN SKY / STRUCTURAL ISLANDS

### New Physics?

```text
NONE
```

### New Grapple Rule?

```text
NONE
```

### New Input?

```text
NONE
```

### What Changes

기존 실내에서는:

```text
wall / ceiling / floor
```

이 연속된 큰 덩어리를 만들었다.

Sector06은:

```text
ISLAND
   gap
ISLAND
       diagonal gap
MAST
          gap
PAD
```

형태.

### Gameplay Meaning

Player는:

```text
room boundary
```

가 아니라:

```text
visible structural chain
```

을 읽는다.

### Important

Sector05의:

```text
SEALED SURFACE / SERVICE HARDPOINT
```

가 Sector06의 Primary Rule은 아니다.

Sector06에서는 가능한 한:

```text
visible gameplay structure
=
honest attach / collision language
```

를 사용.

---

## 7. Structural Island Fairness Contract

Open Sky가
Instant Death Sky가 되어서는 안 된다.

### Main Route

- high rooftop deck
- antenna platform
- beacon frame
- pad approach structure

### Recovery Layer

Main Route 아래 한 Tier에:

- service catwalk
- maintenance lip
- lower antenna platform
- pad maintenance frame

를 둔다.

### Target

일반 실패:

```text
≤ 5 sec
```

안에 main progression band 복귀.

Cutter Cut:

```text
stable recovery ≤ 2 sec target
next attach ≤ 3 sec target
```

### Forbidden

```text
miss one Rope
→ disappear into sky / instant death
```

Sector timer collapse가
global failure pressure를 이미 담당한다.

---

## 8. Rooftop Collision / Decoration Rule

Outdoor Stage는
배경과 플레이 구조가 섞이기 쉽다.

### Colliding

- deck edge
- structural mast platform
- service gantry
- beacon base
- pad perimeter frame

### Grapple Target

- mast bracket
- truss joint
- maintenance anchor
- beacon boom node

### Non-Colliding Background

- distant antenna
- far rooftop
- city silhouette
- cable far plane
- skyline light

### Critical Guard

얇은:

```text
antenna wire
guy wire
far mast
navigation light
```

가 Rope Target처럼 보이면 FAIL.

Gameplay Anchor는 계속 Cyan family 유지.

---

## 9. Directional Shift — Vertical City → Rooftop Traverse

Sector01~05의 큰 흐름:

```text
UP
UP
UP
```

Sector06은:

```text
UP
→
ACROSS THE CROWN
→
PAD 03
```

으로 변한다.

### Recommended Orientation

Sector 전체:

```text
vertical 35–45%
horizontal / diagonal 55–65%
```

정도 후보.

정확한 수치는 각 Stage에서 정한다.

### Why

48개 Stage 모두
수직 zig-zag로 끝나면
Rooftop이라는 공간 변화가 Gameplay에 반영되지 않는다.

---

## 10. Wind Reuse Policy

### Current Capability

Current Wind는:

- static rectangle
- arbitrary normalized direction
- deterministic phases
- optional falloff
- grounded attenuation
- shadow / occlusion

을 지원.

### Sector06 Use

Wind를 새 Mechanic으로 가르치지 않는다.

```text
6-2
CROSSWIND MASTS
```

에서 한 번 명확하게 Recall.

### Difference from Sector04

Sector04:

```text
TRANSIT WAKE
=
sector identity
```

Sector06:

```text
ROOFTOP CROSSWIND
=
one mastery recall
```

### Forbidden

- Sector06 전체를 Wind Sector로 만들기
- 6-8 long Wind trunk
- Moving Wind volume
- unseen random gust

---

## 11. Standard Sentry Reuse Policy

### 6-3 candidate

Standard Sentry T1 ×1.

Current semantics:

```text
cutter-fire
ABSENT
```

### Purpose

1-3에서 배운:

```text
telegraph
body-shot avoidance
```

를
Open Sky structural island에서 재시험.

### Difference from 1-3

1-3:

```text
cover / LOS learning
```

6-3:

```text
aerial body-path control
```

### No Cover Puzzle Requirement

`cover-ends-los`를
Sector06 핵심으로 다시 꺼내지 않는다.

---

## 12. Access Scan Field Reuse Policy

### 6-5 candidate

```text
PAD ACCESS ARRAY
```

### Function

Pad 접근 전 Security hardpoint 일부가
기존 Access Scan state에 따라 유효.

### New Variant?

```text
NONE
```

### Difference from Sector03

Sector03:

```text
Scanner
=
sector core
multiple route/state literacy
```

6-5:

```text
Scanner
=
one concise mastery checkpoint
```

### Critical Guard

Scanner-controlled Hardpoint 바로 옆에:

```text
always-grappleable same-purpose bypass
```

금지.

---

## 13. Patrol Reuse Policy

### 6-6 candidate

Patrol Drone T1 ×1.

### Purpose

Open rooftop beacon span에서:

```text
position preview
+
entry timing
```

을 다시 사용.

### Difference from 5-2 / 5-7

- room / archive 없음
- wide exterior sightline
- diagonal structural islands
- Pad beacon visible in distance

### Rope Cut

```text
cutter-fire
ABSENT
```

---

## 14. Cutter Reuse Policy

### 6-7 candidate

Cutter Sentry T1 ×1.

### Current Semantics

```text
cutter-fire
PRESENT
```

### Purpose

Final Pad Perimeter 바로 전:

```text
Rope continuity
+
open-sky recovery planning
```

을 마지막으로 시험.

### Difference from 5-3

5-3:

```text
Corporate sealed wall
+
preplanned R1/E1 recovery
```

6-7:

```text
exposed structural island
+
lower catwalk recovery
+
no enclosing wall
```

### Difference from 4-2 / 4-8

Wind / Wake와 결합하지 않는다.

---

## 15. Growth / Build Policy

### Historical skeleton

```text
No more reward module.
Use the build you made.
```

### Current Production Translation

Foundation:

```text
IMPLEMENTED
KEEP
```

First Specialization:

```text
CONTENT BLOCKED
NOT REQUIRED
```

Legacy Artifact:

```text
REMOVED
```

### Sector06 Decision

```text
NO NEW GROWTH
```

### Final Build Exam의 정확한 의미

```text
all 8 stages
collectively test
selected Foundation expression
```

이지:

```text
every single Stage must benefit every Foundation equally
```

가 아니다.

### Geometry

Mandatory route:

```text
Foundation independent
```

---

## 16. Foundation Expression Across Sector06

### IMPULSE COIL

특히:

- 6-2 Crosswind exit
- 6-3 Sentry exposure compression
- 6-6 Patrol span
- 6-8 long exterior arcs

에서 강점.

### RELAY LINK

특히:

- Structural Island chaining
- 6-5 Scanner timing
- 6-7 post-cut recovery
- 6-8 final chain

에서 강점.

### SHEAR CURRENT

특히:

- 6-3 Standard Sentry
- 6-6 Patrol
- 6-7 Cutter

에서 optional offense.

### No Foundation Lock

어느 Stage도:

```text
requires Impulse
requires Relay
requires Shear
```

금지.

---

## 17. Stage Progression Overview

| Stage | 이름 | 난이도 | Core | Threat / System | Story / Emotional Role |
|---|---|---:|---|---|---|
| 6-1 | SKYBREAK ACCESS | ★★★ | Indoor→Open Sky transition / Structural Island read | NONE | 처음으로 하늘과 Rooftop Crown이 크게 열림 |
| 6-2 | CROSSWIND MASTS | ★★★☆ | Lateral / diagonal Rope arcs | Wind ×1 | Pad direction 유지, Story 최소 |
| 6-3 | PERIMETER SIGNAL DECK | ★★★☆ | Aerial body-path control | Standard Sentry ×1 | Security가 Pad perimeter까지 살아 있음 |
| 6-4 | ROOFTOP SERVICE SHELTER | REST | Decompression / Pad visual confirmation | NONE | Pad03 + Shuttle signal 직접 시각 확인 |
| 6-5 | PAD ACCESS ARRAY | ★★★★ | State-timed Hardpoint chain | Access Scan Field ×1 | Pad access control active |
| 6-6 | BEACON SPAN | ★★★★ | Moving threat in open structural islands | Patrol ×1 | Shuttle / beacon becomes near-field landmark |
| 6-7 | CONTAINMENT LATTICE | ★★★★ | Final Rope-cut recovery test | Cutter ×1 | Pad perimeter containment |
| 6-8 | ROOFTOP PAD 03 | ★★★★ | Pure Open-Sky final approach / Movement climax | NONE before access denial | Shuttle 도달 → ACCESS DENIED → Final Encounter Entry |

### Key Rule

```text
6-1~6-7
known systems are recalled cleanly

6-8
ENEMY-FREE MOVEMENT CLIMAX
NO COMBAT GAUNTLET
```

최종 Combat synthesis는
별도 Final Security Encounter가 소유.

---

## 18. 6-1 — SKYBREAK ACCESS

### Role

Sector06 공간 문법 소개.

### Threat

```text
NONE
```

### Wind

```text
NONE
```

첫 Sky reveal을
바로 force hazard로 덮지 않는다.

### Geometry

Corporate exterior hatch / crown shell에서:

```text
roof edge
→ mast platform
→ first rooftop island
```

로 전환.

### Learn

```text
There is no room anymore.
Follow the structure.
```

### Story

짧게:

```text
ROOFTOP ZONE

EXTERIOR SERVICE ACCESS
```

### Visual

처음으로
Sky가 Frame 절반 이상을 차지할 수 있음.

---

## 19. 6-2 — CROSSWIND MASTS

### Role

Known Wind Recall.

### Threat

```text
Enemy 0
Wind 1
```

### Geometry

Antenna mast 사이
horizontal / diagonal crossing.

### Difference from 4-5

4-5:

```text
vertical shaft
central wake
```

6-2:

```text
open sky
crosswind
discrete mast islands
```

### Wind

Static zone.
No moving volume.

Strength / cycle:

```text
HYPOTHESIS
```

상세 Stage에서 현재 Runtime precedent와 비교해 결정.

---

## 20. 6-3 — PERIMETER SIGNAL DECK

### Role

Final Standard Sentry mastery recall.

### Enemy

```text
Standard Sentry T1 ×1
cutter-fire ABSENT
```

### Wind / Scanner

```text
NONE
```

### Question

> **“Cover room이 없는 Sky deck에서 Telegraph를 읽고 Player body path를 바꿀 수 있는가?”**

### Kill

Optional.

### Geometry

Sentry를 죽이는 platform shooter room이 아니라
Rope arc로 firing lane을 가로지르는 outdoor deck.

---

## 21. 6-4 — ROOFTOP SERVICE SHELTER

### Role

```text
REST
```

### Threat

```text
NONE
```

### REST Contract

```text
Threat-free
YES

Timer pause
NO

Health refill
NO

Reward
NO

Growth
NO
```

### Major Emotional Beat

처음으로
Pad 03 / Shuttle을
배경 landmark가 아니라
가까운 실제 목표로 확인.

### Status 후보

```text
ROOFTOP PAD 03
SIGNAL ACQUIRED

MAINTENANCE SHUTTLE
STANDBY

PAD ACCESS CONTROL
ONLINE
```

### Important

아직:

```text
ACCESS DENIED
```

를 띄우지 않는다.

실제 거부는 6-8.

---

## 22. 6-5 — PAD ACCESS ARRAY

### Role

Final Scanner mastery recall.

### Enemy

```text
NONE
```

### Scanner

```text
ACCESS SCAN FIELD ×1
```

### Question

> **“Threat가 없어도 Security State를 읽고 Rope chain을 끊김 없이 유지할 수 있는가?”**

### Why Enemy 0

Scanner를 Final Sector에서 다시 쓰되
3-8처럼 Patrol과 함께 Free-Weave field로 반복하지 않는다.

### Geometry

Linear / diagonal Access Array.

One concise scan band.

---

## 23. 6-6 — BEACON SPAN

### Role

Final Patrol mastery recall.

### Enemy

```text
Patrol Drone T1 ×1
cutter-fire ABSENT
```

### Wind

```text
NONE
```

6-2에서 이미 Wind 회수.

### Question

> **“Pad가 가까이 보이는 상태에서도 Drone 위치를 보고 안전한 Commitment timing을 선택할 수 있는가?”**

### Geometry

Aviation beacon frames와
service platforms를 가로지르는
open diagonal span.

### Kill

Optional.

---

## 24. 6-7 — CONTAINMENT LATTICE

### Role

Final Cutter / Recovery mastery recall.

### Enemy

```text
Cutter Sentry T1 ×1
cutter-fire PRESENT
```

### Other Systems

```text
Patrol 0
Wind 0
Scanner 0
```

### Question

> **“마지막 Pad perimeter에서 Rope를 잃어도 Open Sky recovery layer를 읽고 다시 올라올 수 있는가?”**

### Geometry

- upper lattice
- exposed Cutter line
- lower maintenance recovery catwalk
- forward Pad approach

### Kill

Optional.

### Why Not Combination Gauntlet

4-8 / 5-8과의 반복 방지.

---

## 25. 6-8 — ROOFTOP PAD 03

### Role

48번째 일반 progression region.

### Gameplay

```text
PURE MOVEMENT CLIMAX
```

### Enemy before final access

```text
0
```

### Wind / Scanner / Cutter

```text
0
```

### Geometry

Rooftop Pad가
화면에서 계속 보이는 상태로:

```text
final mast
→ lighting frame
→ pad perimeter
→ maintenance access deck
```

을 Rope로 연결.

### Why no enemy

Player가:

```text
드디어 도착했다
```

는 감정을 얻기 전에
또 다른 5-8식 combat band를 반복하지 않는다.

### Final Interactive Beat

Maintenance Shuttle 접근.

```text
ROOFTOP PAD 03

MAINTENANCE SHUTTLE
STANDBY
```

Player가 Pad access / shuttle access를 시도.

결과:

```text
ACCESS DENIED

CONTAINMENT VIOLATION
```

### This Is Not Ending Yet

이 순간이:

```text
POST-SECTOR06 FINAL SECURITY ENCOUNTER
```

의 진입 후보.

---

## 26. Final Security Encounter — Concept Lock

### Status

```text
REQUIRED
DETAILED BOSS CONTRACT TBD
```

### Sector Boss 역할

Sector06의 Boss / Final Encounter.

6-8 내부 Boss가 아니다.

### Historical Transfer

거대한 인간형 보스보다:

```text
CITY SECURITY SYSTEM
+
ANCHOR STRUCTURE
+
EXISTING SECURITY ENEMY FAMILIES
```

중심이 현재 게임에 더 맞는다.

### Current Design Direction

Working concept:

```text
PAD 03 CONTAINMENT SECURITY
```

또는:

```text
ROOFTOP PAD SECURITY NETWORK
```

### Important

정확한:

- Boss identity
- HP
- Phase
- enemy count
- arena geometry
- timer
- collapse
- victory condition

은 Global Boss Audit / detailed Boss Scenario에서 LOCK.

### Core Requirement

최종 Encounter에서도:

> **Rope를 잘 쓰는 사람이 더 강하게 싸워야 한다.**

---

## 27. Final Boss Timer Boundary

6-8 일반 Stage에서:

```text
Pad access attempt
→ ACCESS DENIED
→ Final Security activation
```

이 상세 Boss Spec에서
정식 Boss Entry로 승인되면:

```text
Sector06 General Timer
STOP

General Collapse
STOP

Remaining General Time
DISCARD

Final Boss Timer
START
```

### Retry

전원 탈락:

```text
retry Final Security Encounter only
```

Sector06 전체 재시작 아님.

### Important

Boss detailed spec 전까지
6-8 Runtime에서 임의로 timer transition 구현 금지.

---

## 28. Ending Contract — Current Recommended

Final Security Encounter 승리 후:

```text
PAD SECURITY
OVERRIDDEN

ROOFTOP PAD 03
ACCESS RELEASED
```

↓

```text
MAINTENANCE SHUTTLE
BOARDING AVAILABLE
```

↓

Player boards.

### Ending Visual

Historical ending의 장점을 유지:

1. Shuttle 상승.
2. 처음으로 수직도시 전체가 아래에 보임.
3. Lower city는 거의 암흑.
4. Upper levels에는 일부 전력 / 조명이 남아 있음.
5. Player silhouette.
6. Red Scarf가 바람에 날림.
7. 긴 독백 없음.

Final text:

```text
EVACUATION COMPLETE
```

### No Epilogue Claim

다음은 말하지 않는다.

- 회사가 무너졌다.
- 시민들이 모두 구조됐다.
- 하층 주민이 모두 죽었다.
- 주인공이 폭로했다.
- 혁명이 시작됐다.

Ending은:

```text
ONE PERSON / PARTY ESCAPED
```

까지만.

---

## 29. Security Escalation Closure

게임 중 Security:

```text
EMPLOYEE VERIFIED
→
RETURN TO ASSIGNED SECTOR
→
ROUTE VIOLATION
→
UNAUTHORIZED VERTICAL TRANSIT
→
CONTAINMENT VIOLATION
```

### Final Denial

6-8:

```text
ACCESS DENIED
CONTAINMENT VIOLATION
```

은
기존 escalation의 마지막 회수.

### Forbidden

새로:

```text
TERRORIST
ENEMY OF STATE
EXECUTION ORDER
```

같은 과장된 label 추가 금지.

---

## 30. Story Disclosure Policy

Sector05에서 WHO / WHY는 끝났다.

Sector06은:

```text
NEW CONSPIRACY
NONE
```

### Story Function

```text
knowledge
→ action
```

으로 전환.

### 6-1~6-7

스토리 최소.

- Pad direction
- shuttle signal
- access control

위주.

### 6-8

Escape object / denial만.

### Final Encounter

Security clearance problem.

### Ending

Visual closure.

---

## 31. No Last-Minute Twist Rule

Final Sector에서 다음 금지.

```text
Actually the Cascade was intentional.
```

금지.

```text
The shuttle was fake all along.
```

금지.

```text
The protagonist was secretly special.
```

금지.

```text
A named CEO appears as the final villain.
```

금지.

```text
Rooftop is another simulation / dream.
```

금지.

Sector06의 만족감은:

```text
twist
```

가 아니라:

```text
execution + arrival + escape
```

에서 나온다.

---

## 32. Full-Sector Difficulty Rhythm

권장:

```text
6-1  ★★★
OPEN SKY TRANSITION

6-2  ★★★☆
WIND RECALL

6-3  ★★★☆
STANDARD SENTRY RECALL

6-4  REST
PAD VISUAL CONFIRMATION

6-5  ★★★★
SCANNER MASTERY

6-6  ★★★★
PATROL MASTERY

6-7  ★★★★
CUTTER MASTERY

6-8  ★★★★
PURE MOVEMENT / ARRIVAL

POST-6-8
FINAL SECURITY ENCOUNTER
BOSS FLOW
```

### Why 6-8 can be ★★★★ with Enemy 0

- open-sky long arcs
- late-game structural island chain
- precision is moderate, continuity is high
- no new mechanic
- no combat distraction

### Important

Mandatory links는
high-380s 반복으로 만들지 않는다.

---

## 33. Sector06 Geometry Signature Guard

각 6-N 상세 작성 전에 자동으로 비교:

### Exact Coordinate

```text
new major points
vs
Sector05 5-1~5-8

new major points
vs
GitHub authored Sector01~04
```

### Direction Sequence

예:

```text
L → R → L → R
```

같은 sequence가
인접 Stage와 과도하게 반복되는지 검사.

### Landing Cadence

```text
Anchor
Anchor
Recovery
Safe
```

패턴 반복 검사.

### Safe / Flow Max

같은:

```text
369.4 / 364.9
```

같은 signature 복제 여부 검사.

### Activation Layout

- lower band / upper band
- left/right split
- full safe relay

같은 구조 반복 검사.

### Enemy Sequence

같은:

```text
Patrol → safe → Cutter
```

패턴 반복 금지.

---

## 34. Detailed Stage Geometry Contract

모든 6-N 상세 Stage:

### Hook

```text
Derived Reach
400 px
```

### Mandatory

```text
< 400 px
```

### Recommended active-threat mandatory

가능하면:

```text
≤ 340–360 px
```

### Flow-only

high-380s 가능.

### Runtime Graybox — later

```text
swingImpulse = 0
```

로 Mandatory route 실제 물리 검증.

Geometry precheck만으로:

```text
PHYSICS PASS
```

라고 쓰지 않는다.

---

## 35. Recovery Contract

### Standard

```text
failure
→ recovery
→ main band
≤ 5 sec target
```

### Cutter

```text
cut
→ stable platform
≤ 2 sec target

cut
→ next successful attach
≤ 3 sec target
```

### Open Sky

Recovery가:

```text
far below / invisible
```

이면 FAIL.

Player가 Commit 전에
아래 Recovery layer를 볼 수 있어야 한다.

---

## 36. Camera Philosophy

Sector06 Camera는
이전보다 목표 / skyline을 더 자주 보여야 한다.

### Rule

현재 local problem과:

```text
Pad 03 direction
```

이 동시에 읽히는 구간을 늘린다.

### 6-1

Sky reveal.

### 6-4

Pad direct visual.

### 6-8

Shuttle remains in visual pursuit.

### Mobile

넓은 sky 때문에
Player / Anchor가 작아지지 않게 한다.

Zoom-out로 “웅장함”을 해결하지 않는다.

---

## 37. Visual Identity

### Keywords

```text
OPEN SKY
ROOFTOP CROWN
ANTENNA
AVIATION LIGHT
BEACON
SERVICE GANTRY
PAD PERIMETER
HIGH WIND EXPOSURE
CITY DEPTH
```

### Background

Sector05:

```text
clean sealed interior
```

Sector06:

```text
open exterior silhouette
```

### Palette

기본 World continuity:

- deep navy / charcoal
- pale metal
- cyan grapple
- red/orange danger
- red scarf

추가:

- sky gradient / exterior atmospheric depth
- aviation light
- pad utility light

### No New Color Gameplay Language

기존 readability 유지.

---

## 38. Exterior Scale Rule

### Player

48px current presentation.

### Mast

Player보다 훨씬 크지만
gameplay anchor는 24–32px cue.

### Pad

6-8에서
한 Camera에 전체 Pad를 다 넣으려
Player를 작게 만들지 않는다.

### City Below

Background scale reference.

Collision / platform으로 오해되면 안 됨.

---

## 39. Background / Parallax

### Far

- city below
- adjacent skyscraper crowns
- distant infrastructure
- sky

### Mid

- antenna towers
- rooftop machinery
- pad approach frames

### Near

- structural edge
- beacon arm
- gantry silhouette

### Parallax

실내보다 더 큰 depth 가능.

하지만 Rope aim 중
Hardpoint가 흔들려 보이면 FAIL.

---

## 40. Sound Direction

### 6-1

실내 HVAC / system hum 감소.

Exterior:

```text
open air
distant city
mechanical rooftop tone
```

증가.

### Wind

6-2에서만 Gameplay force cue 강조.

### Pad Approach

6-4 이후:

```text
beacon
shuttle idle machinery
pad signal
```

점차 가까워짐.

### Ending

Final encounter combat audio 제거 후
Shuttle / wind 중심.

긴 voiceover 없음.

---

## 41. Multiplayer Contract

### General Sector

기존:

```text
shared authored world
individual movement
shared enemy world
```

유지.

### Open Sky Recovery

한 Player가 떨어졌다고
partner까지 강제 이동시키지 않는다.

### Gate

6-1~6-7:

```text
shared open
individual crossing
```

원칙.

### 6-8 / Final Encounter

첫 Player가 Pad console을 눌렀다고
Partner를 자동 teleport하지 않는다.

정확한:

```text
Boss Entry party sync
```

는 Final Boss detailed spec에서 LOCK.

### Ending Boarding

다음은 아직 구현 가정 금지.

```text
first player boards
→ everyone teleported
```

Final ending multiplayer contract 필요.

---

## 42. Timer Contract

Sector06 General:

```text
one general timer
```

6-1~6-8 공유.

REST 6-4:

```text
timer continues
```

Gate 보충 기존 계약 유지.

### Boss Entry

6-8 Pad Access denial이
Final Boss detailed spec에서 정식 Entry로 확정되면:

```text
general timer stop
collapse stop
remaining time discard
Boss Timer deferred; 초기 Final Security는 시간 제한 없이 시작
```

### Boss Failure

전원 탈락:

```text
retry boss only
```

---

## 43. Boss / Ending Product Decision Status

GitHub `design-decision-requests.md`의 P5:

```text
ENDING / FINAL TRANSITION
REQUESTED
```

Current implementation:

```text
NONE
```

### This Master Resolves Conceptually

- Ending target: Rooftop Pad03 / Maintenance Shuttle.
- 6-8 entrance to final security: Access Denied / Containment Violation.
- Final Security Encounter exists outside 6-8.
- Win releases Pad access.
- Player boards Shuttle.
- City-wide visual ending.
- `EVACUATION COMPLETE`.

### Still Needs Separate Detailed Contract

- Final Boss mechanics.
- Boss exact timer.
- Boss arena.
- Boss phase.
- multiplayer boss entry.
- multiplayer boarding completion.
- ending implementation / camera timings.
- Sector01~05 Boss cadence와 비교한 final difficulty / tone.

따라서 이 Master가 GitHub P2의 전체 Sector Boss 설계를 해결한 것으로 해석하지 않는다.

---

## 44. Full-Game Repetition Guards

Sector06 must not become:

### Sector01 replay

```text
basic shaft + wind + two sentries
```

### Sector02 replay

```text
giant lived-in atrium + multi-route patrol field
```

### Sector03 replay

```text
scanner-driven free-weave route field
```

### Sector04 replay

```text
long wake / momentum trunk
```

### Sector05 replay

```text
sealed walls + sparse service-hardpoint puzzle
```

### Selected Final Identity

```text
VISIBLE GOAL
+
OPEN SKY
+
STRUCTURAL ISLANDS
+
KNOWN SYSTEM MASTERY LAP
+
FINAL PURE MOVEMENT ARRIVAL
```

---

## 45. Sector06 PASS Criteria

### Gameplay

- new Rope mechanic 0
- new input 0
- new enemy AI 0
- new growth 0
- moving platform 0
- Sector identity comes from topology, not system count
- Wind / Sentry / Scanner / Patrol / Cutter each recalled without turning every Stage into combination soup
- 6-4 genuine threat-free REST
- 6-8 enemy-free movement climax
- mandatory geometry Foundation-independent
- all future authored links <400px
- visible recovery layers
- no instant-death sky dependency
- no repeated 5-8 / 4-8 finale skeleton
- final Boss outside 6-8

### Story

- no new conspiracy
- no named villain
- no intentional Cascade twist
- goal remains Escape
- Pad03 / Shuttle visible and real
- Shuttle remains `STANDBY`
- access blocked by existing `CONTAINMENT VIOLATION`
- final encounter unlocks access
- ending is short / visual
- no broad world-resolution epilogue

### Production

- Sector06 Runtime remains HOLD
- Boss detailed implementation remains HOLD
- Approved Art HOLD
- current main rechecked before every detailed Stage

---

## 46. Sector06 FAIL Conditions

### Geometry

- another interior vertical shaft for most of Sector
- same exact coordinates / direction pattern as earlier Stage
- giant flat rooftop with no Rope structure
- open sky with invisible recovery
- mandatory 380–400px chain repeated
- background antenna looks grappleable
- final Pad requires blind leap

### Gameplay

- all systems active simultaneously every Stage
- 6-8 combat gauntlet
- final boss inside 6-8
- Specialization requirement
- new ultimate augment
- shuttle access tied to enemy kill inside normal Stage
- instant death void

### Story

- late conspiracy twist
- CEO final villain
- revenge objective
- shuttle fake / destroyed only for twist
- player becomes chosen hero
- forced revolution
- casualty number invented
- city is magically fixed after escape

---

## 47. Detailed Authoring Order

```text
6-1 SKYBREAK ACCESS
↓
6-2 CROSSWIND MASTS
↓
6-3 PERIMETER SIGNAL DECK
↓
6-4 ROOFTOP SERVICE SHELTER
↓
6-5 PAD ACCESS ARRAY
↓
6-6 BEACON SPAN
↓
6-7 CONTAINMENT LATTICE
↓
6-8 ROOFTOP PAD 03
```

### Before Every Stage

1. re-fetch latest `main`
2. check `scenario-development-integration.md`
3. check current Sector06 Master
4. check previous Stage
5. check next planned role
6. inspect analogous GitHub Stage docs
7. inspect analogous actual AreaCatalog geometry
8. inspect current Rope / threat runtime
9. create coordinate candidate
10. calculate Safe / Flow distances
11. compare exact coordinates against earlier Stages
12. compare direction sequence
13. compare recovery cadence
14. compare activation layout
15. story disclosure check
16. camera / collision readability check
17. review and fix before delivery

---

## 48. Sector06 Master Summary

### Sector

```text
SECTOR 06
ROOFTOP / EVACUATION
```

### Identity

```text
THE GOAL IS VISIBLE
THE ROOM IS GONE
```

### Spatial Core

```text
OPEN SKY
+
STRUCTURAL ISLANDS
+
ROOFTOP TRAVERSE
```

### General Stage Curriculum

```text
6-1
PURE OPEN SKY

6-2
WIND

6-3
STANDARD SENTRY

6-4
REST / PAD CONFIRMATION

6-5
SCANNER

6-6
PATROL

6-7
CUTTER

6-8
PURE FINAL MOVEMENT
```

### Final Arrival

```text
ROOFTOP PAD 03
MAINTENANCE SHUTTLE
STANDBY
```

### Block

```text
ACCESS DENIED
CONTAINMENT VIOLATION
```

### Final Encounter

```text
POST-6-8
FINAL SECURITY ENCOUNTER
SEPARATE BOSS FLOW
```

### Ending

```text
SECURITY OVERRIDE
→
PAD RELEASE
→
SHUTTLE BOARDING
→
CITY WIDE SHOT
→
RED SCARF
→
EVACUATION COMPLETE
```

### Core Feeling

> **“아래에서부터 계속 위를 향해 올라왔고, 이제 목적지가 눈앞에 있다. 마지막 구역은 새로운 능력을 주지 않는다. 대신 벽이 사라진 하늘 위에서 지금까지 배운 모든 판단을 하나씩 스스로 증명하게 한 뒤, 마지막 Rope를 놓는 순간 실제 Pad 03에 발을 딛게 한다.”**

---

## OPEN QUESTIONS

### 1. Final Security Encounter Name

Working:

```text
PAD 03 CONTAINMENT SECURITY
```

또는:

```text
ROOFTOP PAD SECURITY NETWORK
```

Boss detailed spec에서 LOCK.

### 2. Final Encounter Form

Historical preference:

```text
Security system + Anchor structure + existing enemies
```

유지 권장.

거대한 humanoid boss는 현재 게임 정체성과 덜 맞음.

### 3. 6-2 Wind Tuning

현재 Master에서는 Strength / cycle 미확정.

상세 Stage에서:

- current Sector01 / Sector04 precedent
- open-sky recovery
- mobile aim

비교 후 HYPOTHESIS tuning.

### 4. 6-5 Scanner Geometry

Sector03의 broad Free-Weave를 반복하지 않도록:

```text
one concise scan band
```

원칙.

### 5. 6-8 Pure Movement Difficulty

Enemy가 없으므로
난이도를 거리 extreme으로 보상하려 하면 안 됨.

난이도는:

- continuity
- direction
- open-sky commitment
- emotional pursuit

에서 만들 것.

### 6. Pad03 Visual Reveal Timing

6-4에서 실제 Shuttle을 어느 정도 크기로 보여줄지
상세 Camera 설계에서 결정.

목표:

```text
tangible
but still distant
```

### 7. Final Access Denial Wording

현재 권장:

```text
ACCESS DENIED

CONTAINMENT VIOLATION
```

기존 Security escalation과 정확히 연결됨.

### 8. Ending Multiplayer

최종 Boarding을:

- all active players required
- survivor-only
- first-player triggers shared ending

중 어떻게 처리할지
Boss / Ending spec에서 결정.

자동 party teleport는 현재 가정하지 않는다.

### 9. NPC

Sector06 General Stage는
NPC system을 요구하지 않는다.

NPC 도입은 별도 P4 design decision.

### 10. Boss03·06 cadence

제품 Boss는 Sector 03·06 끝의 두 개다. Boss03은 이동형 보스몹으로 재기획 중이며, Boss06은 최종 전투와 Boarding을 소유한다. 두 전투의 Tone·Difficulty는 신규 Boss03 기획에서 함께 대조한다.

### 11. Sector05 Runtime Drift — 대부분 RESOLVED

Sector 05 통합(#577) 시 이미 반영됨:

- 5-3 / 5-6 Cutter wording → `cutter-fire` (완료)
- 5-5 Standard / Patrol semantics는 재확인 결과 이미 정확해 수정 불필요
- Sector04 known 4-1 A4 issue → 재검증 결과 FALSE ALARM(#576), 좌표 변경 불필요

Sector06 Scenario 완료 후 남은 항목:

- Sector05 Runtime authoring
- full 1~6 scenario/runtime alignment

### 12. Full Game Audit

6-8 상세 작성 완료 후:

```text
48 General Stages
+
Boss boundaries
+
Growth
+
Story
+
Geometry repetition
+
Difficulty
+
Playtime
+
Ending
```

전수 Audit을 수행한 뒤
Runtime / Graybox로 전환.

---

SECTOR 06 — ROOFTOP / EVACUATION MASTER PLAN · AUTHORED PACKAGE MERGED

**STATUS: 6-1~6-8 AUTHORING SOURCES MERGED / RUNTIME WORK REMAINS HELD PENDING SEPARATE APPROVAL**
