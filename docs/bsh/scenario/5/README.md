# SECTOR 05 — CONTINUITY CONTROL MASTER PLAN REV4

> **CURRENT RUNTIME ENEMY DENSITY — 0.68.0:** 각 Stage는 5개 slot을 사용한다. 아래 authored snapshot의 exact enemy count는 대체되며 기존 Jammer/Cutter/특수 band와 현재 권위는 [`../../../enemy-density-composition.md`](../../../enemy-density-composition.md)를 따른다.

Runtime promotion status: [`RUNTIME-PROMOTION.md`](./RUNTIME-PROMOTION.md)

> **RUNTIME GENERATED — PLAYTEST PENDING**<br>
> Authoring snapshot: `3c9f661bba58af6f7351e00754c12aef86575a12`<br>
> Sector04 handoff authority: `UPPER RESIDENTIAL / AMENITY — PRIVILEGE IS PROTECTED`<br>
> Sector05 theme: `THE SYSTEM CHOOSES WHAT CONTINUES`

---

# 0. MASTER STATUS

## Sector Name

```text
SECTOR 05 — CONTINUITY CONTROL
```

## Theme

> **THE SYSTEM CHOOSES WHAT CONTINUES.**<br>
> **시스템은 무엇을 계속 유지할지 선택한다.**

Sector04가 보여준 것은:

```text
PRIVILEGE IS PROTECTED
```

Sector05가 밝히는 것은:

```text
THE SYSTEM CHOOSES
WHAT CONTINUES
```

즉 서사 연결은 다음과 같다.

```text
SECTOR 04
"왜 상층 주거·피난 구역은 이렇게까지 보호되고 있었지?"
        ↓
SECTOR 05
"그 보호와 다른 구역의 중단은 어디에서 결정됐지?"
```

Sector05는 단순한 회사 사무실이 아니다.

이곳은 도시 위기 상황에서:

- 무엇에 전력을 계속 공급할지,
- 어떤 대피 동선을 유지할지,
- 어떤 네트워크를 계속 운영할지,
- 어떤 구역을 제한하거나 중단할지,

결정하는 **CORPORATE CONTINUITY COMMAND COMPLEX**다.

---

# 1. SECTOR FUNCTION

Sector05의 기능은 Sector04에서 보여준 결과의 **원인 구조**를 추적하게 하는 것이다.

Sector04:

```text
보호가 존재한다.
```

Sector05:

```text
보호는 우연히 존재한 것이 아니다.
누군가의 판단과 시스템의 절차를 거쳐 유지되었다.
```

하지만 Sector05에서도 처음부터 모든 진실을 한 번에 공개하지 않는다.

Story progression은:

```text
SYSTEM ACTIVE
→ CAPACITY
→ PRIORITY
→ AUTHORIZATION
→ CONSEQUENCE
→ RESPONSIBILITY
```

순서로 올라간다.

---

# 2. PLAYER EMOTION CURVE

Sector05의 감정 흐름:

```text
5-1
"여기는 아직 도시 전체를 보고 있다."

5-2
"여긴 단순히 살아 있는 게 아니라 통제되고 있다."

5-3
"기록조차 접근이 제한되어 있다."

5-4
"무엇을 유지할지 용량 단위로 선택했다."

5-5
"그 선택에는 우선순위가 있었다."

5-6
"그 우선순위는 승인된 결정이었다."

5-7
"그 결정 때문에 실제로 멈춘 곳이 있었다."

5-8
"이건 사고의 부산물이 아니라 조직적인 의사결정 구조였다."
```

---

# 3. ARCHITECTURAL FANTASY

Previous Sectors exposed physical infrastructure.

```text
SECTOR 01
MAINTENANCE / MACHINE / PIPE

SECTOR 02
WORKER HOUSING / SHELTER / DAILY LIFE

SECTOR 03
TRANSFER / COMMERCE / ROUTING

SECTOR 04
UPPER RESIDENTIAL / AMENITY / REFUGE SECURITY

SECTOR 05
DECISION INFRASTRUCTURE
```

Sector05에서는 기계 설비가 보이지 않는다.

대신 시스템은 다음 뒤에 숨는다.

```text
CLEAN WALL
GLASS PARTITION
SEALED CEILING
FLUSH PANEL
CONTROL CONSOLE
SECURITY REVIEW BOX
LARGE CONTROL VOID
```

Target atmosphere:

```text
CLEAN
BRIGHT
PRECISE
EMPTY
EXPENSIVE
RESTRICTED
HOSTILE TO IMPROVISED MOVEMENT
```

---

# 4. CORE ROPE LANGUAGE

Sector05의 가장 중요한 공간 문법:

## 4.1 SEALED CORPORATE SURFACE

```text
collision    YES
grappleable  NO
```

Examples:

- glass curtain wall
- polished composite cladding
- sealed control-room partition
- finished ceiling plate
- executive bulkhead
- large control console casing

Player는 그 표면 위를 밟거나 충돌할 수 있지만 Rope를 걸 수 없다.

---

## 4.2 SERVICE HARDPOINT

```text
grappleable  YES
```

Examples:

- maintenance lug
- inspection bracket
- structural service joint
- emergency access mount
- relay support frame

Visual rule:

```text
SEALED SURFACE
= smooth / pale / flush / no cyan affordance

SERVICE HARDPOINT
= cyan / mechanical projection / clear depth / strong silhouette
```

Player-facing lesson:

> **READ THE HIDDEN INFRASTRUCTURE.**

주인공은 시설 유지관리자다.

일반 이용자가 완성된 벽을 볼 때,
주인공은 그 뒤의:

```text
service joint
inspection lug
maintenance bracket
```

를 읽는다.

---

# 5. HARDPOINT FAIRNESS

Hardpoint scarcity must never become hidden-answer design.

At every mandatory launch/read point:

```text
CURRENT USABLE HARDPOINT
+
NEXT ROUTE INFORMATION
```

must remain readable.

## Base Hook Reach

Current planning authority:

```text
BASE HOOK REACH = 400px
```

Rules:

- mandatory relation < 400px
- intended flow relation < 400px
- optional route intended as Base-clear < 400px
- Long Rope/Augment may add expression but must not be required
- no invisible grapple denial

---

# 6. CONTROL OBSTACLE GRAMMAR

Sector05 has more control obstacles, but not more visual clutter.

Forbidden:

```text
boxes everywhere
debris everywhere
pipes everywhere
random blockers
```

Target:

```text
MANY CONTROL ELEMENTS
IN A CLEAN SPACE
```

## 6.1 SEALED WALL

Purpose:

```text
removes broad Rope freedom
```

Player must read actual Hardpoints.

## 6.2 SECURITY PARTITION

Purpose:

- blocks Rope angle
- blocks attack angle
- splits sightline
- creates a reason to reposition

## 6.3 CONTROL CONSOLE ISLAND

Purpose:

- movement obstruction
- projectile cover
- release trajectory constraint
- spatial landmark

## 6.4 OVERHEAD BULKHEAD

Purpose:

```text
prevents generic high swing
forces lateral / diagonal Hardpoint read
```

## 6.5 CONTROL VOID

Large clean negative space with few valid Hardpoints.

Purpose:

> **COMMITMENT**

## 6.6 SECURITY BOOTH / REVIEW BOX

Architectural placement for:

- Jammer
- Artillery
- Cutter
- static security control

---

# 7. SECURITY PHILOSOPHY

Sector04 security asked:

> **“Can you outrun the patrol?”**

Sector05 security asks:

> **“Which action is the system denying right now?”**

Selected specialized security:

```text
AEGIS
HARDPOINT JAMMER
ARTILLERY
CUTTER
```

Each controls a different Rope decision.

```text
AEGIS
→ denies direct attack angle

JAMMER
→ denies the planned next attachment

ARTILLERY
→ denies staying at one position

CUTTER
→ denies the currently attached Rope
```

These functions must remain visually and mechanically distinct.

---

# 8. AEGIS GUARD

Runtime basis:

```text
shield-drone-t1
```

Sector05 role:

> **ANGLE CONTROL**

Desired interaction:

```text
FRONT ATTACK
→ BLOCKED

ROPE OVER / AROUND
→ SIDE OR REAR ANGLE
→ DAMAGE WINDOW
```

Good placements:

- narrow control gallery
- below a Service Hardpoint
- between partitions
- high/low route split

Do not:

- use omnidirectional shield
- hide the shield direction
- teach first AEGIS together with Cutter/Jammer

First dedicated Stage:

```text
5-2 CONTROL ATRIUM
```

---

# 9. HARDPOINT JAMMER

Status:

```text
SECTOR05 SIGNATURE SYSTEM
NEW RUNTIME SUPPORT REQUIRED
```

Candidate identity:

```text
hardpoint-jammer-v1
```

Role:

> **ROUTE CONTROL**

Difference from Cutter:

```text
JAMMER
predicts a likely next Rope surface
electrifies and cuts a Rope attached there

CUTTER
fires a projectile that cuts the current attached Rope
```

## Jam Flow

```text
NORMAL ROPEABLE SURFACES QUERIED INSIDE HOOK REACH
↓
CURRENT ATTACHMENT / OCCLUDED / NO-ALTERNATIVE SURFACES EXCLUDED
↓
LIKELY NEXT SURFACE SELECTED BY MOVEMENT ALIGNMENT + DISTANCE
↓
WARNING
↓
JAM ACTIVE
↓
PLAYER ATTACHES TO JAMMED SURFACE
↓
ROPE CUT + ELECTRIFIED STATUS START
↓
2.5 DAMAGE / 0.05s × 10 = 25 OVER 0.5s
↓
JAM EXPIRES
↓
HARDPOINT RESTORED
```

Visual:

```text
NORMAL   = CYAN
WARNING  = AMBER
JAMMED   = VIOLET / MAGENTA
```

Do not use Cutter-red as primary Jam color.

## Jammer status contract

- Map authoring does not list dedicated `eligibleSurfaceIds`; normal ropeable collision surfaces are queried automatically.
- Jam activation never cuts a Rope that was already attached before target selection.
- Attaching a new Rope to the active target cuts that Rope and starts one shared Electrified status.
- Electrified damage is one 0.5-second state: 2.5 damage every 0.05 seconds, total 25.
- Reapplication refreshes remaining duration to 0.5 seconds without stacking another state or damage multiplier.
- Network sends the shock-start event once; the ten damage pulses are fixed-step state progression, not ten events.
- Jammer does not move the Hardpoint or change Rope length.

## Fairness invariant

At every Jam-active moment:

```text
AT LEAST ONE CURRENTLY REACHABLE BASE-CLEAR ROUTE REMAINS
```

Prefer:

```text
2 visible meaningful Hardpoint choices
```

before Jam selection.

First dedicated Stage:

```text
5-3 SECURITY REVIEW GALLERY
```

---

# 10. ARTILLERY CONTROLLER

Runtime basis:

```text
artillery-drone-t1
```

Role:

> **POSITION / DWELL CONTROL**

Desired loop:

```text
LAND
→ TELEGRAPH
→ MOVE
→ STRIKE HITS OLD POSITION
```

Good placements:

- broad control floor
- suspended console deck
- archive approach
- long negative-space transition

Do not:

- continuously track after telegraph lock
- cover every valid landing simultaneously
- teach first Artillery together with Jammer

First dedicated Stage:

```text
5-4 CAPACITY ALLOCATION CORE
```

---

# 11. CUTTER

Runtime basis:

```text
current Sentry + cutter-fire
```

Role:

> **CURRENT ROPE CONTROL**

Sector04 already introduced Rope interruption.

Therefore Sector05:

- does not repeat the tutorial
- uses Cutter later
- combines it with sparse Hardpoints
- does not merge Cutter and Jammer into one ambiguous enemy

---

# 12. BASELINE / EXCLUDED SECURITY

Allowed as supporting pressure:

```text
STANDARD SENTRY
PATROL DRONE
```

They are not Sector05 identity.

Explicitly excluded as Sector05 core:

```text
PURSUIT / INTERCEPTOR
SUPPORT / HEALING
SWARM
```

Reason:

- Pursuit belongs strongly to Sector04's chase identity
- Support creates HP attrition / kill-order gameplay
- Swarm muddies the clean control-space readability

Sector05 is about:

```text
ROUTE
ANGLE
POSITION
CURRENT ROPE
```

not enemy quantity.

---

# 13. SECURITY DENSITY

Sector05 may visibly contain more security than Sector04.

But:

```text
TOTAL SECURITY ↑
SIMULTANEOUS PRIMARY COGNITIVE PRESSURE ≤ 3
```

Recommended rule:

- first teaching encounter = one special mechanic
- later synthesis = two mechanics
- finale may present several security actors, but no more than ~3 primary pressures active simultaneously

---

# 14. STORY INFORMATION LADDER

Sector05 Story must reveal evidence in stages.

## 5-1

Allowed:

```text
CONTINUITY CONTROL
INCIDENT OPERATIONS ACTIVE
CITY SYSTEM STATUS DEGRADED
CONTROL NETWORK ONLINE
```

Forbidden:

- Capacity decision
- Priority decision
- authorization
- Group C causal explanation
- responsible organization/person

## 5-2

Allowed:

```text
UPPER CONTROL REMAINS POWERED
SECURITY OPERATIONS ACTIVE
```

Still no causal chain.

## 5-3

Allowed:

```text
INCIDENT RECORDS EXIST
REVIEW ACCESS RESTRICTED
```

The player knows the information exists but cannot yet reconstruct the decision.

## 5-4

Reveal:

```text
CAPACITY RECORD 1/3
```

Meaning:

> capacity was explicitly allocated.

## 5-5

Reveal:

```text
PRIORITY DIRECTIVE 2/3
```

Meaning:

> allocation followed a priority structure.

## 5-6

Reveal:

```text
ROUTING AUTHORIZATION 3/3
```

Meaning:

> the priority was approved and operationalized.

This is where the Player reconstructs the decision chain.

## 5-7

Reveal:

```text
EVACUATION CONSEQUENCE
```

Meaning:

> the decision had a concrete downstream consequence.

## 5-8

Reveal:

```text
ORGANIZATIONAL RESPONSIBILITY
```

Meaning:

> this was a continuity-control decision structure, not a random technical accident.

Sector06 route is introduced only after this point.

---

# 15. STAGE PROGRESSION — REV4

| Stage | Name | Primary Spatial Lesson | Special Security | Story Function | Current Planning Status |
|---|---|---|---|---|---|
| **5-1** | **CONTINUITY RECEPTION** | Sealed Surface vs Service Hardpoint | NONE | Continuity Complex ACTIVE | AUTHORED PACKAGE MERGED · Runtime not implemented |
| **5-2** | **CONTROL ATRIUM** | Hardpoint + partition flank | **AEGIS** | Upper control remains powered | AUTHORED PACKAGE MERGED · Runtime not implemented |
| **5-3** | **SECURITY REVIEW GALLERY** | Two-choice Hardpoint routing | **JAMMER** | Incident records restricted | AUTHORED PACKAGE MERGED · Runtime not implemented |
| **5-4** | **CAPACITY ALLOCATION CORE** | Move after landing / broad control floor | **ARTILLERY** | **CAPACITY RECORD 1/3** | AUTHORED PACKAGE MERGED · Runtime not implemented |
| **5-5** | **PRIORITY ROUTING HALL** | Route denial + angle control | **JAMMER + AEGIS** | **PRIORITY DIRECTIVE 2/3** | AUTHORED PACKAGE MERGED · Runtime not implemented |
| **5-6** | **INCIDENT AUTHORIZATION ANNEX** | Sparse commitment / next route + current Rope | **JAMMER + CUTTER + AEGIS** staged | **ROUTING AUTHORIZATION 3/3** | AUTHORED PACKAGE MERGED · Runtime not implemented |
| **5-7** | **EVACUATION CONSEQUENCE ARCHIVE** | Keep moving through evidence spine | **ARTILLERY + CUTTER** staged | Lower evacuation consequence | AUTHORED PACKAGE MERGED · Runtime not implemented |
| **5-8** | **CONTINUITY COMMAND SPINE** | Selected synthesis | **AEGIS / JAMMER / ARTILLERY / CUTTER** | Responsibility + Sector06 route | AUTHORED PACKAGE MERGED · Runtime not implemented |

---

# 16. STAGE 5-1 — CURRENT REV4 WORKING AUTHORITY

## Name

```text
CONTINUITY RECEPTION
```

## Core question

> **“What can I actually attach to here?”**

## Purpose

Sector05 begins without an enemy.

The Player must first understand:

```text
CORPORATE FINISH ≠ GRAPPLE SURFACE
```

and:

```text
SERVICE HARDPOINT = VALID ROPE STRUCTURE
```

## REV4 Flow

```text
ENTRY
→ H1
→ CONTINUITY RECEPTION
→ H2
→ CONTROL VOID
→ H3
→ SERVICE INSPECTION
→ SAFE LEFT or FLOW RIGHT
→ FINAL CONTROL VESTIBULE
→ 5-2
```

## Route choice

SAFE LEFT:

- lower maintenance brackets
- easier release timing
- better recovery
- slower

FLOW RIGHT:

- higher service joints
- faster
- larger void commitment
- more momentum expression

Both are intended Base-clear choices.

## Reach correction

Previous REV3.1 had an optional H4 FLOW relation exceeding Base Hook Reach.

REV4 corrects this.

```text
MAX AUTHORED RELATION = 390px
BASE HOOK REACH       = 400px
```

## Enemy

```text
NONE
```

## Story

```text
CONTINUITY CONTROL
INCIDENT OPERATIONS ACTIVE
```

then:

```text
CITY SYSTEM STATUS
DEGRADED
```

then at the final safe vestibule:

```text
CONTROL NETWORK
ONLINE
```

Candidate Player Bark:

> **“…여긴 아직 도시를 보고 있어.”**

This Bark is still **REV4 planning**, not final authority until user approval.

---

# 17. DIFFICULTY CURVE

```text
5-1
READ SURFACE

5-2
READ ANGLE

5-3
READ NEXT ROUTE

5-4
MOVE AFTER LANDING

5-5
ROUTE + ANGLE

5-6
NEXT ROUTE + CURRENT ROPE

5-7
DWELL + CURRENT ROPE

5-8
SELECTED SYNTHESIS
```

---

# 18. PLAYER BARK RULE

Global rule:

```text
SYSTEM = FACT
PLAYER = HUMAN REACTION
```

System text:

- status
- operational condition
- record
- authorization
- routing state

Player Bark:

- surprise
- doubt
- anger
- recognition

Do not use Player Bark to explain the plot.

Never play explanatory dialogue during:

- hard Rope traversal
- active Jam
- Cutter pressure
- Artillery evasion
- multi-enemy combat

Story belongs primarily at:

```text
SAFE LANDING
CONTROL VESTIBULE
REVIEW ROOM
ARCHIVE DECK
POST-ENCOUNTER SPACE
```

---

# 19. MAP AUTHORING RULES

Every Stage must follow:

```text
REASON / PURPOSE
↓
ARCHITECTURAL SPACE
↓
PLAYER ROUTE
↓
MAP PREVIEW
↓
STORY / DIRECTION PREVIEW
↓
USER APPROVAL
↓
FINAL PACKAGE
```

Never:

```text
make an interesting detour first
→ invent a reason afterward
```

Every:

- descent
- ascent
- route change
- backtrack
- bypass

must have a physical architectural reason before gameplay geometry is authored.

---

# 20. RECOVERY RULE

Failure should not become long replay.

Target:

```text
RECOVERY → RECENT CHALLENGE
≤ ~5 sec retry
```

Recovery must:

- preserve the same challenge
- not bypass the lesson
- not drop the Player back multiple encounters
- remain readable

---

# 21. STAGE UNIQUENESS RULE

Before approving each map, compare against:

- Sector01
- Sector02
- Sector03
- Sector04
- previous Sector05 Stages

Check at minimum:

1. silhouette
2. primary movement axis
3. Rope rhythm
4. failure pattern
5. enemy pressure
6. route-choice grammar
7. Story-safe location

A Stage should differ meaningfully in at least several of these categories.

---

# 22. RUNTIME ALIGNMENT

Current known reusable Runtime basis:

```text
shield-drone-t1
artillery-drone-t1
Sentry + cutter-fire
surface.grappleable === false
surface spatial query + Hook reach
owner-first player impact
```

Sector05 new Runtime requirement:

```text
HARDPOINT JAMMER
```

Current implementation principle:

```text
normal ropeable surface query
→ likely next candidate selected automatically
→ attach succeeds
→ jammer-shock starts once
→ Rope cut + shared Electrified state
```

Jammer does not require dedicated map anchors, mid-flight target invalidation, new Rope physics or new player input.

---

# 23. MULTIPLAYER RULES

Any Sector05 world-state mechanic must be authoritative and shared.

Especially Jammer:

```text
ONE HARDPOINT
ONE SHARED JAM STATE
ALL PLAYERS SEE THE SAME STATE
```

Required eventual tests:

- two Players target the same Hardpoint
- one is already attached before Jam warning
- Jammer dies during Warning
- Jammer dies during Active
- reconnect during active Jam
- shock-start claim occurs once and pulse events remain zero
- reapplication refreshes duration without effect stacking
- owner/server/peer HP and Electrified state converge

---

# 24. FORBIDDEN SECTOR05 FAILURE MODES

Do not allow Sector05 to become:

```text
generic office tileset
combat gauntlet
random enemy density
hidden grapple guessing
all-white unreadable walls
purple = arbitrary disabled
Jammer = Cutter clone
AEGIS = HP sponge
Artillery = unavoidable floor damage
story exposition hallway
```

Sector identity is:

> **A clean command complex that restricts movement by controlling which structural choices remain available.**

---

# 25. MASTER STORY BOUNDARY

Sector05 may reveal:

- capacity allocation existed
- priority routing existed
- authorization existed
- those decisions caused downstream operational consequences
- an organizational continuity-control structure was responsible

Do not jump ahead into Sector06 content before 5-8 establishes the handoff.

Sector05 should answer:

> **“Where was the decision made, and how did the system formalize it?”**

Sector06 should answer the next larger question, not Sector05.

---

# 26. NEXT INTEGRATION ORDER

The authoring checklist above predates this package merge. All eight supplied Stage packages, including their MAP and STORY/DIRECTION previews, are now preserved in this repository; that does not approve Runtime migration or change the current Runtime.

1. Review each packaged Stage against the Runtime boundary before implementation.
2. Preserve the authored direct 4-8 → 5-1 Gate portal and its 2-of-3 prerequisite.
3. Define the shared, authoritative Hardpoint Jammer contract before any Stage depends on it.
4. Implement geometry, Stable IDs, Camera, Story, progression, and multiplayer ownership only after that decision.
5. Collect desktop/mobile browser and multiplayer play evidence before declaring a Stage Runtime integrated.

---

# 27. CURRENT AUTHORITY SUMMARY

```text
SECTOR 05
CONTINUITY CONTROL

THE SYSTEM CHOOSES
WHAT CONTINUES
```

Gameplay progression:

```text
READ SURFACE
→ CONTROL ANGLE
→ CONTROL NEXT ROUTE
→ CONTROL POSITION
→ COMBINE ROUTE + ANGLE
→ COMBINE NEXT ROUTE + CURRENT ROPE
→ MOVE THROUGH CONSEQUENCE
→ SYNTHESIZE CONTROL SYSTEM
```

Story progression:

```text
ACTIVE
→ RECORD
→ CAPACITY
→ PRIORITY
→ AUTHORIZATION
→ CONSEQUENCE
→ RESPONSIBILITY
```

The Player should leave Sector05 understanding:

> **상층의 보호는 단순히 남아 있었던 것이 아니다.<br>
> 도시가 무너지는 동안에도 어떤 시스템은 무엇을 계속 유지할지 선택하고 있었다.**
