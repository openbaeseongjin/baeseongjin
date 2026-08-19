# DESIGN DECISION RESOLUTION PACKAGE

> **CURRENT GROWTH OVERRIDE:** 이 문서의 Foundation/Specialization 세부 계약은 0.26.0 generic Augment v1으로 대체됐다. 현재 성장 계약은 `docs/augment-v1.md`, 획득 source는 `1-4 → 2-3 → 3-5` explicit Node를 따른다. 아래 Specialization catalog·pair pool·별도 상태는 이력으로만 보존하며 구현 입력으로 사용하지 않는다.

*SPECIALIZATION / BOSS / TIMER / NPC / ENDING · IMPLEMENTABLE PLANNING CONTRACT · REV 1.0 REVIEWED*

| 항목 | 기준 |
|---|---|
| Repository | `openbaeseongjin/baeseongjin` |
| Decision Source Snapshot | `bd5be25b900b65f3ab42eeb4ee5ff45f2052a06b` |
| Scenario Scope | `1-1 → 6-8`, 48/48 detailed general stages |
| Current Connected Runtime | Sector01→03 = 24 areas |
| Sector04 | standalone authored |
| Sector05/06 | Runtime not authored |
| Purpose | `docs/design-decision-requests.md` P1~P5를 구현 가능한 계약으로 해소하는 확정 기획 |
| Status | **APPROVED PLANNING CONTRACT — RUNTIME NOT YET IMPLEMENTED** |

---

## 0. Decision Summary

권장 결정:

```text
P1 GENERIC AUGMENT V1
IMPLEMENTED
22-card catalog
deterministic 3-card offers at 1-4 / 2-3 / 3-5
player-local selection and persistence
no fixed Specialization tier

P2 FIRST BOSS
LOCK NOW
Sector01 after 1-8 checkpoint
CONTAINMENT GANTRY C-01

P3 TIMER
LOCK PROTOTYPE BASELINE
960 sec / sector
+45 sec internal Gate
cap 960 sec
collapse 80 px/s
final tuning after playtest

P4 NPC
CUT FROM ONLINE QUALIFIER CORE
no live NPC / no dialogue framework dependency
optional post-core 2-6 micro-NPC only

P5 ENDING
LOCK NOW
6-8 denial
→ Final Security Boss
→ Pad Access Restored
→ individual boarding
→ all active players ready
→ Escape ending
```

이 결정의 핵심은:

> 48개 시나리오를 더 늘리는 것이 아니라, 지금 존재하는 Rope / Foundation / Security / Pad 목표를 닫아 주는 최소 제품 계약을 완성하는 것.

---

## 1. P1 — FIRST SPECIALIZATION RULE

## 1-1. Final Recommendation

```text
FOUNDATION
=
PLAYSTYLE DIRECTION

SPECIALIZATION
=
ONE DEEPER COMMITMENT INSIDE THAT DIRECTION
```

2-3에서 Player는 자기 Foundation에 맞는 **2개 카드 중 1개**를 선택한다.

### 선택 Pool

```text
IMPULSE COIL
→ OVERDRIVE COIL
or
→ INERTIA COUPLER

RELAY LINK
→ CASCADE LINK
or
→ WIDE-BAND LINK

SHEAR CURRENT
→ DEEP CURRENT
or
→ BACKFEED LOOP
```

총 6종.

### Why 2-per-Foundation

- 1-4의 3개 Foundation을 다시 고르는 느낌을 피한다.
- Foundation을 바꾸지 않고 “깊게 민다.”
- 9종 이상보다 구현·밸런스 비용이 낮다.
- 1종 고정 업그레이드보다 선택의 의미가 있다.
- 첫 Specialization에서 Random pool까지 넣지 않아 재현성과 테스트가 좋다.
- 향후 콘텐츠가 늘면 3-of-N random pool로 확장 가능하다.

---

## 1-2. Specialization Catalog

### IMPULSE — OVERDRIVE COIL

Identity:

```text
DISTANCE / SPEED
```

Current Impulse:

```text
qualifying release impulse
+180
```

Specialized candidate:

```text
+260
```

Rules:

- 기존 qualifying Impulse Release에서만 동작.
- 상시 Speed 증가 없음.
- 새 입력 없음.
- Rope reach 자체는 증가하지 않음.
- Mandatory geometry는 이 효과에 의존하지 않음.

Role:

> 한 번의 좋은 Release로 위험 구간 체류시간을 더 크게 압축.

Status:

```text
PROTOTYPE VALUE
```

---

### IMPULSE — INERTIA COUPLER

Identity:

```text
ARC CARRY / MOMENTUM PRESERVATION
```

Current:

```text
releaseAngularTransfer
0.55
```

Specialized candidate for qualifying Impulse Release:

```text
effective releaseAngularTransfer
0.72
```

Rules:

- Impulse qualifying Release에만 Player-local effective value 적용.
- global Rope config를 mutation하지 않음.
- Rope length / Hook reach 변경 없음.

Difference from Overdrive:

```text
OVERDRIVE
more raw push

INERTIA COUPLER
better carry of the arc you already created
```

---

### RELAY — CASCADE LINK

Identity:

```text
CHAIN DEPTH
```

Current Relay:

```text
window
0.65 sec

attach buffer
0.16 sec

aim tolerance
108
```

Specialized rule:

```text
successful assisted Relay Attach
→ Relay Window reopens once
```

Maximum:

```text
one additional assisted attach
per original release chain
```

State:

```text
relayCascadeCharges
1
```

Flow:

```text
normal Release
→ Relay window
→ assisted Attach
→ consume cascade charge
→ reopen one Relay window
→ second assisted Attach
→ no more refresh
```

No infinite chain.

---

### RELAY — WIDE-BAND LINK

Identity:

```text
FORGIVENESS / STABILITY
```

Candidate:

```text
relayWindowSeconds
0.85

relayAttachBufferSeconds
0.20

relayAimTolerance
124
```

Rules:

- no window refresh
- no auto-target
- no Hook reach extension
- first assisted re-attach becomes more forgiving

Difference:

```text
CASCADE
more chain depth

WIDE-BAND
easier single handoff
```

---

### SHEAR — DEEP CURRENT

Identity:

```text
DAMAGE COMMITMENT
```

Current:

```text
shearDamage
20
```

Candidate:

```text
shearDamage
35
```

Keep:

```text
shearSegmentTolerance
4
```

No:
- projectile cut
- wall cut
- passive contact damage
- automatic Rope damage

Role:

> Rope Geometry를 전투에 적극적으로 쓰는 Player에게 더 큰 payoff.

---

### SHEAR — BACKFEED LOOP

Identity:

```text
OFFENSE → MOVEMENT CONTINUITY
```

Trigger:

```text
successful Shear hit
```

Effect:

```text
open 0.45 sec BACKFEED WINDOW

during this window:
the next Hook fire ignores remaining Hook reload once
```

Rules:

- one-shot.
- no aim assist.
- no reach increase.
- no Relay Window creation.
- if no Attach is attempted within 0.45 sec, expires.
- multiple enemies in one Shear Release do not stack charges.

Difference:

```text
DEEP CURRENT
kill pressure

BACKFEED LOOP
combat success feeds back into movement
```

---

## 1-3. Selection Rule

2-3 Node:

```text
requiresFoundation
true

perPlayerSelection
true
```

Pool:

```text
selected Foundation
→ exact fixed pair
```

No RNG for REV 1.

Reason:

- test determinism
- player can learn relationship
- content count remains six
- easier multiplayer sync

Future:

```text
3+ per Foundation
→ show 2-of-N
```

may be reopened later.

---

## 1-4. Persistence

```text
death
KEEP

checkpoint respawn
KEEP

area transition
KEEP

sector transition
KEEP

boss retry
KEEP

run reset / new run
CLEAR
```

No respec in current run.

No checkpoint reroll.

Foundation and Specialization are separate IDs.

Recommended Player state:

```text
foundationAugment
impulse-coil | relay-link | shear-current

specialization
overdrive-coil
inertia-coupler
cascade-link
wide-band-link
deep-current
backfeed-loop
null
```

---

## 1-5. UI Contract

Reuse current Foundation selection primitive.

2 cards only.

Header:

```text
SPECIALIZATION AVAILABLE
```

Subheader example:

```text
FOUNDATION
RELAY LINK
```

Cards show:

```text
NAME
one-line behavior
one icon
```

No long numeric stat sheet during run.

Example:

```text
CASCADE LINK
Chain one more assisted re-attach.

WIDE-BAND LINK
Make the next assisted re-attach more forgiving.
```

Confirm:

```text
SPECIALIZATION ACCEPTED
[NAME]
ONLINE
```

---

## 1-6. 2-3 Progression

Current placeholder:

```text
interact
```

becomes actual:

```text
interact-choice
→ personal choice
→ personal specialization stored
→ shared specialization-selected objective can resolve
→ exit panel
```

Calibration remains non-blocking.

No Foundation / Specialization can be mandatory for geometry.

---

## 2. P2 — BOSS PLACEMENT & FIRST BOSS

## 2-1. Global Boss Boundary

Canonical:

```text
n-8
FINAL GENERAL REGION

→
POST-SECTOR SAFE / BOSS ENTRY

→
SECTOR BOSS

→
NEXT SECTOR
```

Never:

```text
n-8 contains boss
```

and never:

```text
3-8 direct → 4-1
4-8 direct → 5-1
5-8 direct → 6-1
```

---

## 2-2. Sector Boss Placement Map

| Sector | General Finale | Boss Entry | Boss Role |
|---|---|---|---|
| 01 | 1-8 CONTAINMENT GATE | checkpoint 이후 sealed transfer vestibule | Foundation + Sentry + Wind first synthesis |
| 02 | 2-8 EVACUATION PLATFORM | final safe deck 이후 evacuation control boundary | Patrol / route-pressure boss |
| 03 | 3-8 UPPER MARKET GATE | final control boundary | Access-state / route-read boss |
| 04 | 4-8 TRANSIT CONTROL TRUNK | trunk terminal boundary | Cutter / Wake / recovery boss |
| 05 | 5-8 CONTINUITY CONTROL SPINE | control boundary | sparse hardpoint / commitment boss |
| 06 | 6-8 ROOFTOP PAD 03 | access denial 뒤 | Final Security boss |

Only Sector01 and Sector06 are detailed in this package.

Sector02~05 names/mechanics remain later contracts.

---

## 3. BOSS 01 — CONTAINMENT GANTRY C-01

## 3-1. Identity

Working Name:

```text
CONTAINMENT GANTRY C-01
```

Type:

```text
AUTOMATED FACILITY SECURITY / MAINTENANCE GANTRY
```

Not:
- human villain
- company executive
- intentional-Cascade reveal
- military superweapon

Story meaning:

> 1-8의 Maintenance Override와 Lower Grid shutdown 이후, 비정상 vertical transit를 막는 자동 Containment system이 마지막 inter-sector barrier를 걸어온다.

---

## 3-2. Placement

```text
1-8
Maintenance Override
→ Lower Grid Shutdown
→ Worker District Reveal
→ Sector Checkpoint

→ short sealed transfer vestibule

→ BOSS ENTRY
CONTAINMENT GANTRY C-01

→ boss win

→ Worker District / 2-1
```

Important:

- 1-8 checkpoint remains where it is.
- Boss retry starts at Boss only.
- no moving 1-8 Story beats behind Boss.

---

## 3-3. Arena Principle

One compact vertical maintenance chamber.

No new movement mechanic.

Use:

```text
existing Grapple
existing standard projectile
existing Wind
existing interact
existing auto weapon
Foundation expression
```

Do not use:
- Cutter
- Patrol
- Scanner
- moving platform
- new button

---

## 3-4. Boss State

Prototype:

```text
Boss Core HP
360

3 phases
120 HP each effective segment
```

Shield:

```text
normally CLOSED

Maintenance Breaker interact
→ shield OPEN
8 sec
```

Current auto weapon:

```text
10 damage / 0.65 sec
≈15.38 DPS
```

A clean 8-second exposure is therefore roughly one 120-HP phase.

If Player loses damage uptime:
- shield can close
- same phase breaker re-arms after short delay
- no hard fail

---

## 3-5. Phase 1 — SECURITY READ

Threat:

```text
ONE STANDARD EMITTER
```

Goal:

```text
rope to BREAKER A
→ interact
→ 8 sec core exposure
→ damage 120
```

Teach:

> Boss도 결국 Rope로 좋은 위치를 만들어야 공격할 수 있다.

No Wind yet.

---

## 3-6. Phase 2 — PRESSURE CROSSING

Threat:

```text
STANDARD EMITTER
+
ONE PULSED WIND LANE
```

Goal:

```text
BREAKER B
on opposite upper side
```

Uses Sector01 learned language:

```text
1-6 Wind
+
1-7 Sentry/Wind
```

No second simultaneous emitter.

---

## 3-7. Phase 3 — FINAL CONTAINMENT

Threat:

```text
LEFT / RIGHT emitter
ALTERNATING

NO CROSSFIRE
+
PULSED WIND
```

Goal:

```text
BREAKER C
→ final core exposure
```

This recalls 1-8 sequential security without copying 1-8 geometry.

---

## 3-8. Foundation Expression

All Builds valid.

Impulse:

```text
faster Breaker approach
```

Relay:

```text
safer multi-anchor reposition
```

Shear:

```text
if exposed Core is represented as enemy body,
Shear can contribute 20/35 optional damage
```

Specialization not required.

---

## 3-9. Boss Timer

Prototype:

```text
210 sec
```

At 0:

```text
Arena collapse begins
80 px/s prototype
```

No instant game over.

One player caught:
- spectates survivor

All players caught:
- Boss retry only

Survivor wins:
- all active session players reunite at post-boss safe transition.

---

## 3-10. Reward

No Artifact.

No new Growth tier.

Reward:

```text
CONTAINMENT CLEARED
+
next Sector unlocked
+
new Sector general timer starts
```

Health restoration:
- do not invent in Boss01 contract.
- preserve current player health policy until global boss-transition health rule is separately locked.

---

## 4. P3 — GENERAL TIMER / COLLAPSE PROTOTYPE BASELINE

## 4-1. Why Prototype, Not “Final”

There is still no complete 48-stage physical playtest.

Therefore exact values must be labeled:

```text
PROTOTYPE BASELINE
```

not final balance truth.

But implementation no longer needs arbitrary developer-picked values.

---

## 4-2. Recommended Baseline

```text
SECTOR GENERAL TIMER
960 sec
16:00

INTERNAL GATE REPLENISH
+45 sec

TIMER CAP
960 sec

COLLAPSE SPEED
80 world px/sec
2.5 base tiles/sec
```

Stage08→Boss entry:

```text
NO REPLENISH

general timer / collapse ends
remaining time discarded
boss timer begins
```

With seven internal Gate bonuses:

```text
960 + (45 × 7)
=
1275 sec

21:15 maximum effective general-section budget
```

This keeps the timer as:
- anti-stall pressure
- not speedrun score

---

## 4-3. Warning Cue

Recommended:

```text
120 sec
LOW TIME warning

30 sec
CRITICAL warning

0 sec
COLLAPSE RISING
```

Do not create damage at 0.

---

## 4-4. Collapse Elimination Text

Keep existing product wording:

```text
붕괴에 휩쓸림
```

Secondary:

```text
다음 Gate에서 합류
```

If English UI is required:

```text
CAUGHT BY COLLAPSE
REJOIN AT NEXT GATE
```

---

## 4-5. Playtest Adjustment Rule

After representative-stage Graybox:

Capture:

```text
P50 first clear
P80 first clear
skilled clear
failure count
recovery time
2-player clear
```

Adjust timer only after this.

First tuning target:

```text
normal first-clear team
should usually reach Boss before collapse

repeated stalls / repeated failures
should experience collapse pressure
```

---

## 5. P4 — NPC / DIALOGUE SCOPE

## 5-1. Recommendation

For the online qualifier:

```text
LIVE NPC
NO

BRANCHING DIALOGUE SYSTEM
NO

ESCORT
NO
```

Status:

```text
CUT FROM QUALIFIER CORE
```

Reason:

- no dialogue/NPC Runtime exists
- 48 Stage environmental story already exists
- Augment/Boss/Ending are higher-value blockers
- new NPC animation, networking and UI increases integration risk
- player goal is escape, not conversation-driven questing

Therefore P4 should stop blocking Sector implementation.

---

## 5-2. Optional Post-Core NPC Contract

If core is stable before content freeze:

First optional NPC:

```text
Stage
2-6 QUIET RESIDENTIAL VOID

Role
RESIDENT MAINTENANCE TECHNICIAN
```

Presentation:
- behind sealed service glass / partition
- stationary
- no pathfinding
- no combat
- no escort

Trigger:

```text
proximity
→ 3 short lines
→ done
```

No dialogue choices.

Suggested content:

```text
1.
"Service route's still live?"

2.
"They moved some groups upward.
Not everyone."

3.
"If you're climbing, don't wait here."
```

Constraints:
- does not know corporate WHY
- does not map Group A/B/C to classes
- does not claim company caused Cascade
- does not become quest giver
- does not give item/reward

UI:
- existing story/subtitle presentation can be extended
- no dialogue tree screen

If this cannot be added cleanly:
- cut it entirely.

---

## 6. P5 — ENDING & FINAL TRANSITION

## 6-1. Entry

Already locked by 6-8:

```text
PAD 03 REACHED
→ ACCESS REQUEST
→ ACCESS DENIED
→ CONTAINMENT VIOLATION
→ FINAL SECURITY
```

No new twist.

---

## 7. FINAL SECURITY — PAD SECURITY WARDEN P-03

## 7-1. Identity

Working Name:

```text
PAD SECURITY WARDEN P-03
```

Automated rooftop security gantry.

Story:

> Player reached the real escape vehicle, but the existing Containment system rejects the unauthorized vertical transit and activates the final Pad Warden.

No:
- CEO
- human final villain
- intentional Cascade reveal
- revenge target

---

## 7-2. Boss Grammar

Final boss is NOT:

```text
all mechanics at once
```

It is:

```text
SECURITY MASTERY
PHASE BY PHASE
```

No Wind.
No Patrol.

Use:
- Standard Projectile
- Cutter
- Scanner
- Rope movement
- recovery
- interact breaker
- auto weapon

---

## 7-3. Boss HP / Exposure

Prototype:

```text
450 HP
3 × 150 HP phases
```

Each phase:

```text
reach Security Relay
→ interact
→ core exposed 10 sec
```

At current weapon rate:

```text
10 / 0.65
≈ 15.38 DPS
```

10-sec clean uptime:

```text
≈154 damage
```

So one excellent exposure can clear one phase.

Poor positioning:
- needs another cycle
- not instant fail

---

## 7-4. Phase 1 — STANDARD LOCK

Threat:

```text
one Standard emitter
no Rope cut
```

Movement:
- open-sky anchor path
- one full safe recovery deck

Goal:
- Relay A
- expose core
- 150 damage

---

## 7-5. Phase 2 — CUT LINE

Threat:

```text
one cutter-fire emitter
```

No Standard simultaneously.

Arena:
- upper commitment route
- lower stable recovery catwalk

Goal:
- Relay B
- expose core

Required fairness:

```text
Cut → stable recovery ≤2 sec target
Cut → next attach ≤3 sec target
```

---

## 7-6. Phase 3 — CLEARANCE LOCK

Threat:

```text
one Scanner-controlled 3-hardpoint group
+
one Standard core emitter during exposed-core window
```

No Cutter simultaneously.

Flow:

```text
Scanner timing
→ Relay C
→ final core exposure
→ finish
```

No alternate always-grappleable bypass adjacent to controlled hardpoints.

---

## 7-7. Final Boss Timer

Prototype:

```text
240 sec
```

At 0:

```text
Pad arena collapse
80 px/s prototype
```

All-out:
- retry Final Security only
- not Sector06 general run

---

## 8. BOARDING CONTRACT

Boss defeated:

```text
PAD SECURITY WARDEN
OFFLINE

ROOFTOP PAD 03
ACCESS RESTORED

MAINTENANCE SHUTTLE
BOARDING
```

Shuttle door becomes available.

### Single Player

```text
enter boarding trigger
or Interact at door
→ boarding ready
→ end transition
```

### Multiplayer

Never:

```text
Player A boards
→ Player B auto-teleported instantly
```

Instead:

```text
each active player
must individually reach boarding zone
```

First ready Player:

```text
BOARDING READY
WAITING FOR PARTNER
```

They remain safe.

If another Player was in boss spectator state when Boss dies:

```text
rejoin at final safe Pad deck
```

Then board normally.

Completion:

```text
ALL ACTIVE PLAYERS READY
→ input lock
→ ending sequence
```

---

## 9. ENDING SEQUENCE

Target:

```text
10–15 sec
```

No long cutscene dependency.

### Beat 1 — Door Close

Side-on Pad view.

Player silhouette inside Shuttle.

```text
MAINTENANCE SHUTTLE
DEPARTURE
```

### Beat 2 — City Pullback

Shuttle rises away.

Show:
- lower city darkness
- partial upper infrastructure light
- Pad receding

Do not show:
- corporate headquarters exploding
- protagonist destroying city
- citizens magically saved

Meaning:

> Player escaped. The city problem remains larger than one person.

### Beat 3 — Run Complete

```text
ESCAPE CONFIRMED

ROUTE COMPLETE
```

Then compact run stats from existing metrics where available:

- Active Time
- Areas Cleared
- Deaths
- Rope Cuts
- Foundation
- Specialization

Optional final small line:

```text
VERTICAL GRID STATUS
UNRESOLVED
```

Then:

```text
NEW RUN
TITLE
```

No permanent meta-reward required in current scope.

New Run:
- Foundation reset
- Specialization reset
- world progression reset

---

## 10. Delivery Scope Decision

## Full Game Design

Keep:

```text
48 general stages
+
6 bosses
```

as authored full-game architecture.

## Online Qualifier Executable

Do not make “all final-quality 48 + six polished bosses + NPC” the only success condition.

Priority:

```text
1.
Rope feel

2.
Foundation + Specialization

3.
connected representative sector progression

4.
Boss01

5.
Final Pad / Final Security / Ending

6.
broader 48-area runtime coverage

7.
NPC only if surplus time
```

This preserves the complete design while protecting submission quality.

---

## 11. `design-decision-requests.md` Status

After approval, recommended state:

```text
P1
답변됨
Specialization catalog / selection / persistence locked

P2
답변됨
global boss boundary + Boss01 locked
Sector02~05 detailed boss mechanics still follow-up

P3
답변됨 — PROTOTYPE BASELINE
final tuning remains playtest-dependent

P4
답변됨
qualifier scope = no live NPC
optional post-core micro-NPC only

P5
답변됨
Final Security → boarding → escape ending locked
```

---

## 12. Implementation Order After Planning Approval

```text
A.
P0 Alignment Patch

B.
Specialization Runtime
2-3

C.
Boss Flow primitive
+
Boss01

D.
Timer baseline
+
collapse

E.
Sector04→05→06 Runtime authoring / wiring
as boss boundaries are added

F.
Final Security
+
boarding
+
ending

G.
playtest tuning

H.
NPC only if surplus
```

---

## 13. Review Result

```text
SPECIALIZATION
PASS — implementable with existing event model + small player-local state

BOSS01
PASS — uses known combat / wind / interact language

TIMER
PASS AS PROTOTYPE BASELINE
NOT FINAL BALANCE

NPC
PASS — scope cut removes unnecessary blocker

ENDING
PASS — preserves ESCAPE goal and story canon

MULTIPLAYER
PASS AS CONTRACT
implementation required

OVERALL
READY_FOR_P0_ALIGNMENT_AND_IMPLEMENTATION_HANDOFF
```

---

DESIGN DECISION RESOLUTION PACKAGE · REV 1.0 REVIEWED
