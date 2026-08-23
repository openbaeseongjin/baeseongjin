# DESIGN DECISION RESOLUTION PACKAGE

> **CURRENT GROWTH CONTRACT:** 성장 계약은 `docs/augment-v1.md`, 획득 source는 `1-4 → 2-3 → 3-5` explicit Node가 소유한다. 고정 Foundation/Specialization tier는 사용하지 않는다.

*BOSS / TIMER / NPC / ENDING · IMPLEMENTABLE PLANNING CONTRACT · CURRENT*

| 항목 | 기준 |
|---|---|
| Repository | `openbaeseongjin/baeseongjin` |
| Authoring Snapshot | `bd5be25b900b65f3ab42eeb4ee5ff45f2052a06b` |
| Scenario Scope | `1-1 → 6-8`, 48/48 detailed general stages |
| Current Connected Runtime | Sector01→03 = 24 areas |
| Sector04 | standalone authored |
| Sector05/06 | Runtime not authored |
| Purpose | `docs/design-decision-requests.md` P1~P5를 구현 가능한 계약으로 해소하는 확정 기획 |
| Status | **APPROVED PLANNING CONTRACT — PARTIAL RUNTIME; CURRENT STATUS IN SCENARIO INTEGRATION** |

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
60 sec / sector
+10 sec progress reward
cap 60 sec
Purge 240 px/s
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

## 1. P1 — GENERIC AUGMENT V1

과거 Foundation별 Specialization catalog, pair pool, 별도 선택·저장·UI 계약은 폐기됐다. 현재 성장 계약은 [`augment-v1.md`](./augment-v1.md), 획득 source는 `1-4 → 2-3 → 3-5` explicit Node가 소유한다. 고정 Specialization tier를 구현하지 않는다.

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
| 04 | 4-8 PROTECTED ASCENT GATEHOUSE | protected ascent boundary | persistent Guard A/B + Central Security Hub boss |
| 05 | 5-8 CONTINUITY CONTROL SPINE | control boundary | sparse hardpoint / commitment boss |
| 06 | 6-8 ROOFTOP PAD 03 | access denial 뒤 | Final Security boss |

Only Sector01 and Sector06 are detailed in this package.

Sector02~03 names/mechanics remain later contracts. Boss04와 Boss05의 authored handoff는 각각 `docs/boss/04/README.md`, `docs/boss/05/README.md`가 소유하며 Runtime·전환 계약은 별도다.

---

## 3. BOSS 01 — GATE LOCKING CARRIAGE

> **현재 authored content:** [`boss/01/README.md`](./boss/01/README.md)가 `GATE LOCKING CARRIAGE`의 유일한 authoring 기준이다. 아래 C-01 세부안은 `legacy` 이전 전의 historical prototype이며 현행 구현 입력이 아니다.

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

**DEFERRED — 초기 Boss01 구현 입력 아님.**

- 초기 Boss01/Post-Sector Boss Slot은 시간 제한과 시간 만료 Arena collapse 없이 구현한다.
- 과거 `210 sec / 80 px/s prototype`은 후속 Boss timer 작업에서 다시 검토할 보류 값이며 Runtime·snapshot·HUD·탈락 판정에 연결하지 않는다.
- 현재 재시도는 일반 전투 피해로 모든 참가자가 탈락했을 때 Boss 시도만 초기화한다.
- Survivor 관전·시간 만료 탈락·붕괴 전선은 후속 Timer 계약과 함께 구현한다.
- Boss 처치 뒤에는 모든 세션 Player를 post-boss safe transition에서 합류시킨다.

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

## 4. P3 — GENERAL TIMER / CONTAINMENT PURGE FIELD

현재 prototype 계약:

```text
SECTOR GENERAL TIMER: 60 sec
PROGRESS REWARD: +10 sec
TIMER CAP: 60 sec
CONTAINMENT PURGE FIELD: 240 world px/sec
PURGE CONTACT: lethal
BOSS ENTRY: general Timer/Purge 종료, 잔여 시간 폐기
```

Field는 보상 중 현재 높이에서 멈추고 다음 0초부터 같은 위치에서 재상승하며 후퇴·Player 추적·순간이동을 하지 않는다. 전멸은 current Sector만 reset하고 Player별 증강과 이전 Sector 진행을 보존한다. 정확한 +10초 landmark/objective, 최초 Field origin, 개인 Purge 사망 복귀 방식은 HOLD이며 Stage ID·legacy Gate·Area 하단에서 추정하지 않는다. 단일 현재 기준은 [`sector-timer-and-boss-flow.md`](./sector-timer-and-boss-flow.md)다.

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

**DEFERRED — 초기 Final Security 구현 입력 아님.**

- 과거 `240 sec / Pad arena collapse 80 px/s`는 후속 Boss Timer 작업 전까지 Runtime에 연결하지 않는다.
- 초기 Final Security는 시간 제한 없이 구현하며 일반 전투 피해 전멸 시 Final Security만 재시작한다.
- 시간 만료 탈락·관전·붕괴 cue는 후속 Timer 범위다.

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

Current state:

```text
P1
구현 완료
generic Augment v1 / deterministic 3-card offer / no fixed Specialization tier

P2
답변됨
global boss boundary + Boss01 locked
Sector02~05 detailed boss mechanics still follow-up

P3
core 계약 확정 — topology mapping HOLD
60 sec / +10 sec / cap 60 sec / Purge 240 px/s

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
