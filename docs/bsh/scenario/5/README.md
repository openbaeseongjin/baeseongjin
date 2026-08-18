# SECTOR 05 — CONTINUITY CONTROL MASTER PLAN REV 3.0

**MASTER DESIGN LOCKED · STAGE BLOCKOUTS NOT IMPLEMENTED**

Latest checked `main`:

```text
c7b2bd582cf35d140dccba8c83b5732a3527c5ac
```

Current relevant Runtime facts:

- `shield-drone-t1` exists as an official Runtime enemy archetype.
- `artillery-drone-t1` exists as an official Runtime enemy archetype.
- Cutter behavior already exists through current Sentry + `cutter-fire` Rope-cut rule.
- Rope target selection already supports `surface.grappleable === false`.
- Rope target selection also exposes `canAttachToSurface(surface)`, which can support a future authoritative Hardpoint Jam state.
- `support-drone-t1` and `pursuit-drone-t1` exist in Runtime but are **intentionally excluded from Sector05** by this Master decision.

---

## 마이그레이션 상태 — Stage 문서 동기화

이 Master Plan은 REV 3.0(Continuity Control)이다. Stage 문서 동기화 현재 상태:

```text
5-1  CONTINUITY RECEPTION       REV 3.1 동기화 완료 (AREA-SPEC.json 포함)
5-5  PRIORITY ROUTING HALL      REV 3.8 동기화 완료 (AREA-SPEC.json 포함)
5-2, 5-3, 5-4, 5-8              PLANNING-DRAFT만 존재, AREA-SPEC 미작성 (별도 후속 작업)
5-6  INCIDENT AUTHORIZATION     초안 AREA-SPEC 패키지 있으나 route/sourceExit 블록 누락으로 미반영
5-7  EVACUATION CONSEQUENCE     초안 AREA-SPEC 패키지 있으나 route/sourceExit 블록 누락·surface bounds 오류로 미반영
```

`5-1`/`5-5`는 area-spec-v1 REV 1.1 스키마로 검증을 통과했다. `5-6`/`5-7`은 원본 패키지 자체가 mandatory route를 명시하지 않아, 임의로 추론해 채우지 않고 이번 반영에서 제외했다.

---

# 0. FINAL MASTER DECISIONS

## Sector Name

```text
SECTOR 05 — CONTINUITY CONTROL
```

## Theme

> **THE SYSTEM CHOOSES WHAT CONTINUES.**  
> **시스템은 무엇을 계속 유지할지 선택한다.**

Sector04:

```text
PRIVILEGE IS PROTECTED
```

Sector05:

```text
THE SYSTEM CHOOSES
WHAT CONTINUES
```

즉:

```text
Sector04
"왜 상층은 이렇게 보호되고 있었지?"
        ↓
Sector05
"그 보호와 하층 중단은 어디에서 결정됐지?"
```

## Gameplay Identity

```text
MORE SECURITY
+
MORE CONTROL OBSTACLES
+
FEWER VALID HARDPOINTS
+
SPECIALIZED SECURITY ABILITIES
=
CONTROLLED COMMITMENT
```

## Selected Special Security

```text
AEGIS
HARDPOINT JAMMER
ARTILLERY
CUTTER
```

## Explicitly Excluded

```text
SUPPORT / HEALING SECURITY
INTERCEPTOR / PURSUIT DRONE
SWARM AS SECTOR05 CORE
SECTOR04-STYLE PERSISTENT PURSUIT AS PRIMARY IDENTITY
```

Standard Sentry / Patrol may remain as baseline security actors.

---

# 1. SECTOR FANTASY

Sector05 is not simply a clean corporate office.

It is:

```text
CORPORATE CONTINUITY COMMAND COMPLEX
```

A crisis-control complex that decides:

- which infrastructure remains powered,
- which evacuation route remains open,
- which control layer remains operational,
- which systems are suspended under capacity shortage.

Representative spaces:

```text
CONTINUITY RECEPTION
CONTROL ATRIUM
SECURITY REVIEW GALLERY
CAPACITY ALLOCATION CORE
PRIORITY ROUTING HALL
INCIDENT AUTHORIZATION ANNEX
EVACUATION CONSEQUENCE ARCHIVE
CONTINUITY COMMAND SPINE
```

The architecture is not a place that directly operates pumps, shops, homes or shelters.

It is a place that:

> **decides what those systems are allowed to keep doing.**

---

# 2. ARCHITECTURAL CONTRAST

Previous Sectors exposed their systems.

```text
Sector01
pipes / machinery / maintenance

Sector02
homes / shelter / worker life

Sector03
transfer / commerce / routing

Sector04
residential / amenity / refuge security
```

Sector05 hides systems behind controlled finishes.

```text
clean wall
glass partition
sealed ceiling
flush panel
control console
large void
```

Visible machinery decreases.

Decision infrastructure increases.

The space should feel:

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

# 3. CORE ROPE LANGUAGE

## SEALED CORPORATE SURFACE

```text
collision    YES
grappleable  NO
```

Examples:

- glass curtain wall,
- polished composite cladding,
- sealed control-room partition,
- finished ceiling plate,
- flush executive bulkhead.

## SERVICE HARDPOINT

```text
grappleable YES
```

Examples:

- maintenance lug,
- inspection bracket,
- structural service joint,
- emergency access mount,
- relay support frame.

Player-facing rule:

> **READ THE HIDDEN INFRASTRUCTURE.**

The protagonist is a facilities-maintenance worker.

Other people see a finished Corporate wall.

The protagonist reads:

```text
service joint
inspection lug
maintenance bracket
```

and uses those hidden structures to climb through a space designed to exclude them.

---

# 4. HARDPOINT FAIRNESS

Hardpoint scarcity is not hidden-answer design.

## Sealed

```text
large uninterrupted pale/glass surface
no cyan affordance
flush silhouette
```

## Hardpoint

```text
cyan/cool-tech ring
mechanical projection
clear depth
strong silhouette
```

At any mandatory launch/read point:

```text
current usable Hardpoint
+
next route information
```

must remain readable.

In Jammer encounters:

```text
at least 2 meaningful visible route choices
```

are preferred.

The Jammer may change which choice is available.

It must not turn the Stage into guessing.

---

# 5. CONTROL OBSTACLE GRAMMAR

Sector05 has **more obstacles**, but not visual clutter.

Forbidden identity:

```text
boxes everywhere
broken pipes everywhere
debris everywhere
```

Target identity:

```text
MANY CONTROL ELEMENTS
IN A CLEAN SPACE
```

## 5.1 SEALED WALL

Purpose:

```text
removes broad Rope freedom
```

Player must read Hardpoints.

## 5.2 SECURITY PARTITION

Glass / composite vertical fins.

Purpose:

```text
blocks Rope angle
blocks direct shooting angle
splits sightline
```

Should create a spatial reason to reposition.

## 5.3 CONTROL CONSOLE ISLAND

Large floor or suspended console mass.

Purpose:

- movement obstruction,
- firing cover,
- release trajectory constraint,
- route-reading landmark.

## 5.4 OVERHEAD BULKHEAD

Purpose:

```text
prevents generic high swing
forces lateral/diagonal Hardpoint read
```

## 5.5 CONTROL VOID

Large clean negative space with very few valid Hardpoints.

Purpose:

```text
COMMITMENT
```

Not every Void needs enemy pressure.

## 5.6 SECURITY BOOTH / REVIEW BOX

Good placement for:

- Jammer,
- Artillery,
- Cutter.

It makes the enemy's control function architectural rather than arbitrary.

---

# 6. SECURITY PHILOSOPHY

Sector04 security asked:

> **“Can you outrun the patrol?”**

Sector05 security asks:

> **“Which action is the system denying right now?”**

The four special abilities control different parts of Rope play.

```text
AEGIS
→ denies direct attack angle

JAMMER
→ denies next attachment choice

ARTILLERY
→ denies staying in one place

CUTTER
→ denies the current attached Rope
```

This separation is mandatory.

Abilities must not overlap into indistinguishable punishment.

---

# 7. AEGIS GUARD

Runtime basis:

```text
shield-drone-t1
CURRENT RUNTIME ARCHETYPE
```

Current behavior already turns its shield direction toward a target and blocks impacts from a frontal arc.

## Sector05 Role

> **ANGLE CONTROL**

AEGIS is not just a high-HP enemy.

It should make the Player use Rope movement to change attack angle.

Desired interaction:

```text
FRONT ATTACK
→ BLOCKED

ROPE OVER / AROUND
→ SIDE OR REAR ANGLE
→ DAMAGE WINDOW
```

## Good Placement

- narrow control gallery,
- below a Service Hardpoint,
- between two partitions,
- near a high/low route split.

## Do Not

- give omnidirectional shield,
- make shield visually ambiguous,
- combine first AEGIS lesson with Cutter or Jammer.

---

# 8. HARDPOINT JAMMER — SECTOR05 SIGNATURE

Status:

```text
NEW SYSTEM
NOT IMPLEMENTED
```

Candidate Runtime identity:

```text
hardpoint-jammer-v1
```

This is Sector05's signature security ability.

## Role

> **ROUTE CONTROL**

CUTTER says:

```text
your current Rope is unsafe
```

JAMMER says:

```text
your planned next Rope is unavailable
```

They are different.

---

## 8.1 Basic Jam Flow

```text
SELECT HARDPOINT
↓
WARNING / TARGET MARK
↓
JAM ACTIVE
↓
HARDPOINT CANNOT BE SELECTED FOR NEW ATTACHMENT
↓
JAM EXPIRES
↓
CYAN HARDPOINT RETURNS
```

### Visual

Normal:

```text
CYAN
```

Warning:

```text
AMBER SCAN BRACKETS
```

Jammed:

```text
VIOLET / MAGENTA INTERFERENCE
```

Do not use Cutter red as the primary Jam color.

---

## 8.2 Rope Contract

Current Rope input already calls:

```text
canAttachToSurface(surface)
```

before selecting an attachment candidate.

Target implementation:

```text
jammed hardpoint id
→ canAttachToSurface(surface) = false
```

for new candidate selection.

### Jammer MUST NOT

```text
cut an already-attached Rope
force release
damage the Player
move the Hardpoint
change Rope length
```

Those belong to other systems.

---

## 8.3 First Implementation Rule

If a Hook is already launched before Jam becomes ACTIVE:

```text
allow that launch to resolve normally
```

Do not require dynamic in-flight target invalidation in V1.

This makes the warning phase meaningful:

```text
commit before lock
OR
choose another Hardpoint
```

---

## 8.4 Attached Hardpoint Rule

Initial recommended rule:

```text
Hardpoint with an active Player Rope
= not eligible as a new Jam target
```

Reason:

- avoids teammate ambiguity,
- avoids Cutter-role overlap,
- simplifies multiplayer,
- preserves clear visual semantics.

---

## 8.5 Fairness Invariant

A Jammer encounter must NEVER create:

```text
all Base-clear options jammed simultaneously
```

At every Jam-active moment:

```text
at least one authored Base Rope route remains
```

unless the Player is currently transitioning through a clearly recoverable optional challenge path.

No specific Augment may be required to escape a Jam state.

---

## 8.6 Candidate Tuning — PLAYTEST ONLY

Not final constants:

```text
warning         ~0.45s
jam active      ~1.10s
cooldown        ~2.20s
target range    authored per encounter
max targets     1 per Jammer
```

Values are candidates, not Runtime baseline.

Tune visibility before duration.

---

## 8.7 Death / Disable

If Jammer is killed:

```text
active Jam ends
Hardpoint restores
```

within a short deterministic transition.

No lingering invisible Jam.

---

## 8.8 Multiplayer

Jam state is shared authoritative world state.

```text
one Hardpoint
one Jam state
all Players see same state
```

Required eventual tests:

- two Players aiming same Hardpoint,
- one attached before warning,
- Jammer dies during Warning,
- Jammer dies during Active,
- reconnect during Active Jam,
- no duplicate client-local Jam timers.

---

# 9. ARTILLERY CONTROLLER

Runtime basis:

```text
artillery-drone-t1
CURRENT RUNTIME ARCHETYPE
```

Current Runtime behavior already:

```text
locks a target position
→ telegraphs
→ strikes that stored position
```

## Sector05 Role

> **POSITION / DWELL CONTROL**

It prevents:

```text
sit on one deck
sit on one Hardpoint
wait forever
```

Desired loop:

```text
LAND
→ TELEGRAPH APPEARS
→ MOVE / COMMIT
→ STRIKE HITS OLD POSITION
```

## Good Placement

- broad control floor,
- suspended console deck,
- archive approach,
- long negative-space transition.

## Do Not

- track the Player continuously after telegraph,
- overlap the first Artillery lesson with Jammer,
- place strike radius so every valid landing is covered simultaneously.

---

# 10. CUTTER

Runtime basis:

```text
CURRENT SENTRY + cutter-fire
```

## Sector05 Role

> **CURRENT ROPE CONTROL**

The Player already learned Cutter in Sector04.

Sector05 does not need a tutorial repeat.

It uses Cutter later in combinations with sparse Hardpoints.

Target relation:

```text
few valid Hardpoints
+
Cutter pressure
=
high commitment
```

## Cutter vs Jammer

```text
JAMMER
blocks next attachment

CUTTER
cuts current attached Rope
```

Never merge them into one enemy in the first Sector05 implementation.

---

# 11. BASELINE SECURITY

Allowed as supporting pressure:

```text
STANDARD SENTRY
PATROL DRONE
```

They are not the Sector identity.

They provide:

- movement,
- basic projectile pressure,
- sightline occupation,
- background security density.

They should not steal focus from the special ability being taught in a Stage.

---

# 12. EXCLUDED SECURITY

## SUPPORT / HEALING

```text
support-drone-t1
NOT USED IN SECTOR05
```

Reason:

- creates HP attrition / kill-order emphasis,
- weak relation to Rope-route control,
- can make already dense Corporate encounters feel grindy.

## INTERCEPTOR / PURSUIT

```text
pursuit-drone-t1
NOT USED IN SECTOR05
```

Reason:

- Sector04 already owns extended pursuit pressure,
- Sector05 should control route/angle/position rather than repeat chase identity.

## SWARM

Not part of the selected Sector05 special roster.

May be reconsidered only through a separate explicit design decision.

---

# 13. SECURITY DENSITY RULE

Sector05 visibly contains more security than Sector04.

But:

```text
TOTAL ENEMIES ↑
SIMULTANEOUS COGNITIVE PRESSURE ≤ 3 PRIMARY ACTORS
```

Recommended:

```text
2 enemies
= common

3 enemies
= major encounter

4–5 total authored enemies
= acceptable in late Stage
if activation is staged
```

Do not solve difficulty by firing 5 different special abilities simultaneously.

---

# 14. ABILITY COMBINATION RULES

## Good

```text
AEGIS + STANDARD SENTRY
```

Angle + basic pressure.

```text
JAMMER + PATROL
```

Route choice changes while firing origin moves.

```text
ARTILLERY + AEGIS
```

Move from marked position, then solve angle.

```text
JAMMER + CUTTER
```

Late Sector only:
next Rope denied + current Rope threatened.

## Avoid

First introduction of:

```text
JAMMER + CUTTER + ARTILLERY
```

all at once.

Also avoid:

```text
2 Jammers
```

until final-stage validation proves at least one Base-clear option always survives.

---

# 15. CORPORATE AUTHORIZATION — 3 OF 3

Sector04:

```text
ANY 2 OF 3
PLAYER CHOICE
```

Sector05:

```text
ALL 3 OF 3
STORY CONVERGENCE
```

The three proofs reconstruct the organization's decision logic.

---

## 15.1 5-4 — CAPACITY RECORD

```text
GRID CAPACITY
CRITICAL DEFICIT
```

Meaning:

> The post-cascade system could not keep every sector fully operational.

Proof:

```text
CAPACITY RECORD
1 / 3
```

---

## 15.2 5-5 — PRIORITY DIRECTIVE

```text
CONTINUITY PRIORITY

UPPER CONTROL
MAINTAIN

UPPER EVACUATION TRUNK
MAINTAIN
```

Meaning:

> Limited capacity was deliberately prioritized.

Proof:

```text
PRIORITY DIRECTIVE
2 / 3
```

---

## 15.3 5-6 — ROUTING AUTHORIZATION

```text
LOWER ASCENT ROUTING
SUSPENSION AUTHORIZED
```

Meaning:

> Lower ascent was not merely broken; suspension was an authorized response.

Proof:

```text
ROUTING AUTHORIZATION
3 / 3
```

---

# 16. CANONICAL STORY STATEMENT

Sector05 confirms:

```text
VERTICAL GRID CASCADE
= REAL ACCIDENT

POST-CASCADE CAPACITY SHORTAGE
= REAL

CONTINUITY PRIORITIZATION
= ORGANIZATIONAL DECISION

LOWER ASCENT / EVACUATION SUSPENSION
= AUTHORIZED RESPONSE
```

Sector05 does NOT claim:

```text
THE ACCIDENT WAS PLANNED
THE COMPANY WANTED WORKERS TO DIE
A NAMED CEO PERSONALLY ORDERED MURDER
```

The moral revelation is:

> **사고 자체만으로 현재의 격차가 생긴 것이 아니라, 사고 이후 무엇을 계속 살릴지 결정하는 조직적 선택이 있었다.**

Player objective remains:

```text
ESCAPE
```

not revenge.

---

# 17. STAGE PROGRESSION — REV3

| Stage | Name | Spatial Lesson | Special Security | Total Security Target | Story / Access |
|---|---|---|---|---:|---|
| **5-1** | **CONTINUITY RECEPTION** | Sealed Surface vs Service Hardpoint | NONE | 0 | Continuity Complex ACTIVE |
| **5-2** | **CONTROL ATRIUM** | Hardpoint + partition flank | **AEGIS** | 2 | Upper control remains powered |
| **5-3** | **SECURITY REVIEW GALLERY** | two-choice Hardpoint routing | **JAMMER** | 2–3 | Incident records restricted |
| **5-4** | **CAPACITY ALLOCATION CORE** | move after landing / broad control deck | **ARTILLERY** | 2 | **CAPACITY RECORD 1/3** |
| **5-5** | **PRIORITY ROUTING HALL** | route denial + angle control | **JAMMER + AEGIS** | 3–4 | **PRIORITY DIRECTIVE 2/3** |
| **5-6** | **INCIDENT AUTHORIZATION ANNEX** | sparse commitment under Rope denial | **JAMMER + CUTTER + AEGIS** staged | 4–5 | **ROUTING AUTHORIZATION 3/3** |
| **5-7** | **EVACUATION CONSEQUENCE ARCHIVE** | must keep moving through archive spine | **ARTILLERY + CUTTER** staged | 3–4 | Lower evacuation suspension consequence |
| **5-8** | **CONTINUITY COMMAND SPINE** | full controlled-route synthesis | **selected AEGIS / JAMMER / ARTILLERY / CUTTER bands** | ~5 total, max3 active | organizational responsibility + Sector06 route |

---

# 18. STAGE DETAIL INTENT

## 5-1 — CONTINUITY RECEPTION

Question:

> **“What can I actually attach to here?”**

No enemy.

Teach:

```text
SEALED SURFACE
vs
SERVICE HARDPOINT
```

Entry spawn remains provisional until Post-Sector04 transition is authored.

---

## 5-2 — CONTROL ATRIUM

Question:

> **“Can I use Rope movement to attack around a protected front?”**

First AEGIS.

Use:

- partitions,
- two elevations,
- Hardpoint above/behind Guard.

No Jammer yet.

---

## 5-3 — SECURITY REVIEW GALLERY

Question:

> **“If the route I planned becomes unavailable, can I immediately read another?”**

First Jammer.

Mandatory authoring:

```text
2 visible meaningful Hardpoint choices
```

Jammer may disable one.

At least one Base-clear option remains.

---

## 5-4 — CAPACITY ALLOCATION CORE

Question:

> **“Can I keep moving while the space attacks the place I just occupied?”**

First Artillery.

After the major movement beat, Player reaches the Capacity terminal.

No arbitrary REST room.

Acquire:

```text
CAPACITY RECORD 1/3
```

---

## 5-5 — PRIORITY ROUTING HALL

Question:

> **“Which route and angle remain when the system controls both?”**

Combine:

```text
JAMMER
+
AEGIS
```

This is the first Stage where two Sector05 special abilities intentionally interact.

Acquire:

```text
PRIORITY DIRECTIVE 2/3
```

---

## 5-6 — INCIDENT AUTHORIZATION ANNEX

Sector05 security peak before story consequence.

Question:

> **“Can I make a commitment when both my current Rope and next Rope choice are under control?”**

Use staged composition:

```text
BAND A
AEGIS

BAND B
JAMMER + baseline security

BAND C
CUTTER + JAMMER
```

Do not start all 4–5 enemies together.

Acquire:

```text
ROUTING AUTHORIZATION 3/3
```

This is the moment Player reconstructs the full decision chain.

---

## 5-7 — EVACUATION CONSEQUENCE ARCHIVE

Question:

> **“Now that I know the decision, can I keep moving through its evidence?”**

Use:

```text
ARTILLERY
+
CUTTER
```

but staged so Player is not permanently denied both landing and Rope.

Story:

```text
LOWER SECTORS
EVACUATION SUSPENDED
```

The human consequence becomes explicit.

---

## 5-8 — CONTINUITY COMMAND SPINE

No new ability.

Final exam through separated control bands.

Example:

```text
BAND A
AEGIS + JAMMER

BAND B
ARTILLERY + STANDARD SECURITY

BAND C
CUTTER + JAMMER
```

Max active primary pressure:

```text
3
```

Final story:

```text
INCIDENT RESPONSE DIRECTIVE
POST-CASCADE
CONTINUITY CONTROL
```

Player now understands:

```text
CAPACITY
→ PRIORITY
→ AUTHORIZATION
→ CONSEQUENCE
→ RESPONSIBILITY
```

Then:

```text
3/3 CORPORATE AUTHORIZATION
+
5-8 FINAL OBJECTIVE
→ POST-SECTOR05 TRANSITION READY
```

Destination remains subject to the future Sector05→06 transition/Boss slot.

---

# 19. DIFFICULTY CURVE

```text
5-1
READ SURFACE

5-2
READ ANGLE

5-3
READ ALTERNATE ROUTE

5-4
READ TIME / DWELL

5-5
ROUTE + ANGLE

5-6
NEXT ROUTE + CURRENT ROPE

5-7
DWELL + CURRENT ROPE

5-8
SELECTED SYNTHESIS
```

The difficulty increase comes from:

```text
RELATIONSHIP COMPLEXITY
```

not just:

```text
HP ↑
DAMAGE ↑
ENEMY COUNT ↑
```

---

# 20. AUGMENT POLICY

No Augment is mandatory.

### Long Rope

Can expand optional Hardpoint choices.

Must not bypass sealed-surface logic or entire security bands.

### Fast Launch

Reduces exposure while committing.

### Fast Recover

Improves failed Rope retry.

### Release Propulsion

Improves large Void traversal.

### Direction Dash

Landing correction.

### Combat Actions

Can change whether the Player kills or bypasses a security actor.

None may become the only answer to Jammer/Aegis/Cutter/Artillery.

---

# 21. JAMMER × AUGMENT FAIRNESS

Jammer authoring is validated against:

```text
BASE REACH
```

not Long Rope.

At Jam active:

```text
Base Player must retain at least one valid clear option.
```

Long Rope may create an extra route.

It must never be the required rescue from a Jam.

---

# 22. MULTIPLAYER

## AEGIS

Target orientation must use authoritative target selection.

## ARTILLERY

Telegraph/strike target position is authoritative.

## CUTTER

One Player's Rope Cut must not detach another Player's Rope.

## JAMMER

Jam is shared world state.

```text
same Hardpoint
same Warning
same Active window
same restoration
```

Do not run independent client Jam timers.

---

# 23. VISUAL SECURITY LANGUAGE

All special security must be readable before mechanics.

## AEGIS

```text
broad frontal shield silhouette
cool white / blue defensive plane
```

## JAMMER

```text
antenna / interference emitter
amber warning
violet/magenta Hardpoint interference
```

## ARTILLERY

```text
target projection / ground reticle
clear delayed strike line
```

## CUTTER

```text
existing Rope-cut identity
distinct red cut telegraph
```

The Player should identify the security role from silhouette + VFX before reading text.

---

# 24. AUDIO LANGUAGE

Suggested:

## AEGIS
short shield rotate / lock tone.

## JAMMER
three-step electronic sequence:

```text
SCAN
→ LOCK
→ INTERFERENCE
```

## ARTILLERY

```text
TARGET ACQUIRED
→ delayed charge
→ strike
```

## CUTTER

retain distinct Rope-threat sound.

Do not reuse the same warning beep for every ability.

---

# 25. RECOVERY

Corporate recovery geometry is subtle:

- maintenance lip,
- inspection balcony,
- service bridge,
- recessed access shelf.

It should look subordinate to polished architecture.

Target:

```text
most failure recovery ≤ 5 seconds
```

Special cases:

### Cutter
nearby drop catch.

### Jammer
failure should route to another Hardpoint/recovery, not death because one route disappeared.

### Artillery
strike should punish camping, not launch Player into unrecoverable void by default.

---

# 26. CAMERA

Sector05 Camera must show **decision information**.

For Jammer:

```text
Jammer
+
jam target
+
alternative Hardpoint
```

For AEGIS:

```text
Guard facing
+
flank route
```

For Artillery:

```text
telegraph
+
next movement destination
```

For Cutter:

```text
Cutter source
+
current Rope line
+
recovery
```

Camera cannot hide the answer to a control mechanic.

---

# 27. RUNTIME / AUTHORING STATUS

## CURRENT RUNTIME

```text
shield-drone-t1
IMPLEMENTED

artillery-drone-t1
IMPLEMENTED

cutter-fire
IMPLEMENTED

surface.grappleable=false
IMPLEMENTED

canAttachToSurface(surface)
IMPLEMENTED HOOK
```

## NEW / NOT IMPLEMENTED

```text
hardpoint-jammer-v1
sealed-corporate-surface AREA-SPEC authoring preset
Sector05 3-of-3 Corporate Authorization rollout
Sector05 source Area/Catalog migration
```

Important:

Existing low-level capability does not mean the Stage/AREA-SPEC contract is already authored.

---

# 28. SECTOR05 DO NOT

```text
NO Support / healing enemy
NO Interceptor / pursuit-drone
NO Sector04-style endless chase as core identity
NO invisible grapple denial
NO Jam that cuts attached Rope
NO Cutter that also Jams
NO mandatory enemy kill
NO mandatory Augment
NO all Hardpoints jammed
NO five simultaneous special abilities
NO random Jam duration/target without deterministic authority
NO generic office-space visual identity
NO arbitrary REST stage
NO direct revenge-story turn
```

---

# 29. MASTER ACCEPTANCE

Sector05 succeeds if a Player can describe it as:

> **“여기는 붙을 곳도 통제되고, 공격 각도도 통제되고, 가만히 있을 곳도 통제되는 공간이다.”**

and the story can be summarized:

> **“사고 뒤 시스템 용량이 부족해졌고, Corporate Continuity가 상층 시스템을 유지하기 위해 하층 상승과 대피를 후순위화·중단하는 결정을 승인했다.”**

Gameplay and Story must express the same idea:

```text
CONTROL
```

---

# 30. NEXT AUTHORING ORDER

1. Rebuild **5-1 CONTINUITY RECEPTION** from the current Hardpoint study.
2. 5-1 package approval.
3. Design **5-2 CONTROL ATRIUM** with first AEGIS.
4. Design **5-3 SECURITY REVIEW GALLERY** with first HARDPOINT JAMMER.
5. Recheck Runtime before every Stage.
6. Do not produce Scenario Art until each Stage blockout/package is approved.
