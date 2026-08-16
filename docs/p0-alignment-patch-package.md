# P0 ALIGNMENT PATCH PACKAGE

*FULL GAME AUDIT FOLLOW-UP · CURRENT RUNTIME / DOC SOURCE-OF-TRUTH NORMALIZATION · REV 2.0 REVIEWED*

| 항목 | 기준 |
|---|---|
| Repository | `openbaeseongjin/baeseongjin` |
| Audit Source Snapshot | `bd5be25b900b65f3ab42eeb4ee5ff45f2052a06b` |
| Detailed Scenario | 48/48 merged |
| Goal | Geometry redesign 없이 Runtime·문서·기획 게이트를 한 진실로 정렬 |
| Status | **APPROVED PATCH CONTRACT — P0-F/P0-G APPLIED; RUNTIME PATCH NOT YET IMPLEMENTED** |

---

## 0. Updated Audit Finding

이 패키지는 Full Game Audit 이후 최신 `main`을 다시 확인해 정정한 버전이다.

가장 중요한 정정:

```text
1-7
CONTAINMENT VIOLATION / ACTIVE
```

는 오래된 문서에만 남아 있는 것이 아니다.

현재:

```text
src/game/presentation/AuthoredStoryPresentation.js
```

에도 실제 Position Presentation으로 구현되어 있다.

따라서 이 항목은:

```text
DOC ONLY
```

가 아니라:

```text
RUNTIME + DOC
P0
```

이다.

---

## 1. P0-A — SECURITY ESCALATION RUNTIME PATCH

## Problem

Current visible progression already has in 1-3:

```text
RETURN TO ASSIGNED SECTOR
ROUTE VIOLATION
UNAUTHORIZED VERTICAL TRANSIT
ACCESS DENIED
```

1-7 Runtime then shows:

```text
CONTAINMENT VIOLATION
ACTIVE
```

But 6-8 now owns the final escape-point denial:

```text
ACCESS DENIED
CONTAINMENT VIOLATION
```

Using the final phrase in 1-7 destroys its final payoff.

---

## Recommended Replacement

1-7 visible cue:

```text
UNAUTHORIZED VERTICAL TRANSIT
SECURITY RESPONSE ACTIVE
```

or if avoiding exact 1-3 title repeat:

```text
VERTICAL TRANSIT VIOLATION
SECURITY RESPONSE ACTIVE
```

Preferred canonical:

```text
VERTICAL TRANSIT VIOLATION
SECURITY RESPONSE ACTIVE
```

Reserve:

```text
CONTAINMENT VIOLATION
```

for 6-8 / Final Security boundary.

---

## Runtime Targets

### `src/game/presentation/AuthoredStoryPresentation.js`

Replace:

```text
token:
containment-violation

id:
sector-01-07:containment-violation

title:
CONTAINMENT VIOLATION

detail:
ACTIVE
```

with:

```text
token:
security-response-active

id:
sector-01-07:security-response-active

title:
VERTICAL TRANSIT VIOLATION

detail:
SECURITY RESPONSE ACTIVE
```

### `src/game/world/areas/sector01/Sector01AreaCatalog.js`

Area07 `storyTriggers`:

```text
containment-violation
```

→

```text
security-response-active
```

No geometry / activation / enemy / wind changes.

---

## Document Targets

At minimum:

- `docs/bsh/scenario/1/1-7/README.md`
- `docs/bsh/scenario/1/1-7/PRODUCTION-ALIGNMENT.md`
- `docs/bsh/scenario/1/CAMERA-STORY-IMPLEMENTATION-HANDOFF.md`
- related Story Presentation tests if exact IDs are asserted

Global search after patch:

```text
CONTAINMENT VIOLATION ACTIVE
sector-01-07:containment-violation
"containment-violation"
```

Only historical/forbidden/final valid occurrences may remain.

---

## 2. P0-B — CUTTER POSITIVE OPT-IN TRUTH

## Current Runtime Truth

```text
canCutRope
=
rules.includes("cutter-fire")
```

Therefore:

```text
Cutter
must include cutter-fire

Standard / Patrol
omit cutter-fire
```

`no-rope-cut` may remain as legacy metadata temporarily,
but its absence does NOT grant rope cutting.

---

## Operative Docs With Retired Negative-default Explanation

Current exact search hits include:

- `docs/bsh/scenario/4/README.md`
- `docs/bsh/scenario/4/4-3/README.md`
- `docs/bsh/scenario/4/4-6/README.md`
- `docs/bsh/scenario/4/4-7/README.md`
- `docs/bsh/scenario/3/3-3/README.md`
- `docs/scenario-development-integration.md`
- `docs/bsh/scenario/4/INTEGRATION-CROSS-VALIDATION-AUDIT.md`

Treatment:

### Current operative Stage/Master docs

Rewrite to current positive opt-in rule.

### Historical audit

Do not rewrite history line-by-line if unnecessary.

Add a clear top banner:

```text
HISTORICAL CUTTER SEMANTICS
DO NOT USE FOR CURRENT AUTHORING
CURRENT = cutter-fire POSITIVE OPT-IN
```

---

## 3. P0-C — FOUNDATION IMPLEMENTATION STATE

Current 1-4 truth:

```text
Foundation selection
IMPLEMENTED PROTOTYPE

Impulse
IMPLEMENTED PROTOTYPE

Relay
IMPLEMENTED PROTOTYPE

Shear
IMPLEMENTED PROTOTYPE

player-local persistence / multiplayer
IMPLEMENTED
```

But old Production Alignment files still say
Foundation state/effects are absent.

Exact search hits:

- `1/1-5/PRODUCTION-ALIGNMENT.md`
- `1/1-6/PRODUCTION-ALIGNMENT.md`
- `1/1-7/PRODUCTION-ALIGNMENT.md`
- `1/1-8/PRODUCTION-ALIGNMENT.md`

Patch:

```text
NOT IMPLEMENTED
```

→

```text
IMPLEMENTED PROTOTYPE
PLAYTEST BALANCE PENDING
```

Build routes remain:

```text
DESIGN VALID
PHYSICAL PLAYTEST PENDING
```

Do not mark Foundation-dependent route as mandatory.

---

## 4. P0-D — CHECKPOINT REWARD DRIFT

Current Sector01 AreaCatalog checkpoint:

- checkpoint point
- checkpoint world object

does not contain:

```text
reward:true
```

But `1-8/PRODUCTION-ALIGNMENT.md` still states it.

Patch:

```text
Sector Checkpoint reward:true
```

→

```text
Sector Checkpoint
progress / respawn only
NO reward selection
```

Global search:
- `reward:true`
- `checkpoint reward`
- `Artifact reward`

Preserve only historical clearly marked references.

---

## 5. P0-E — SCENARIO ART CAMERA CONTRACT

## Problem

Current common Art standard effectively requires:

```text
Runtime Area
+
cameraZone
+
Stable IDs
+
Approved Blockout
```

Sector02 / Sector03 intentionally use default gameplay camera in many stages.

Creating custom gameplay cameras only to satisfy art documentation is unnecessary.

---

## Recommended Standard Revision

Approved Art requires either:

### Mode A

```text
explicit Runtime cameraZone
```

or

### Mode B

```text
VERIFIED DEFAULT-CAMERA CAPTURE CONTRACT

area ID
local Y range
default desktop zoom
default mobile zoom
vertical player ratio / framing target
stable IDs
approved visible geometry
```

Mode B does not alter gameplay Camera Runtime.

---

## Files

- `docs/bsh/scenario/SCENARIO-ART-GENERATION-STANDARD.md`
- `docs/bsh/scenario/2/README.md`
- `docs/bsh/scenario/3/README.md`
- individual Stage Production Alignment only when Art production starts

Change wording from:

```text
Camera Zone unnecessary
```

to:

```text
Custom gameplay camera unnecessary.
Approved Scenario Art still requires a verified default-camera capture contract.
```

---

## 6. P0-F — DESIGN DECISION REQUESTS REFRESH

Integration status: **APPLIED** — P1~P5 답변과 48/48 현재 상태가 canonical 문서에 반영됐다.

Before this integration, the current file had valid P1~P5 categories but stale current-state prose.

Update:

```text
48/48 detailed Stage complete
```

and remove stale claims such as:

```text
Sector 05 / 06 detailed Stage documents do not exist
```

Replace P1~P5 answer blocks using:

```text
docs/design-decision-resolution-package.md
```

Recommended statuses:

```text
P1
답변됨

P2
답변됨
Boss01 detailed / Sector02~05 boss details follow-up

P3
답변됨 — PROTOTYPE BASELINE

P4
답변됨 — qualifier live NPC cut

P5
답변됨
```

---

## 7. P0-G — IMPLEMENTATION ROADMAP / SCHEDULE REFRESH

Integration status: **APPLIED FOR DECISION STATE** — 48/48과 현재 구현 순서를 roadmap·schedule·handoff·scenario integration에 반영했다. 후속 P0 Runtime/문서 패치 결과는 해당 구현 PR에서 다시 갱신한다.

Before this integration, roadmap/schedule still contained older scenario-count statements.

Refresh:

- `docs/implementation-roadmap.md`
- `docs/development-schedule.md`
- `SESSION-HANDOFF.md` only where decision state changes
- `docs/scenario-development-integration.md` after decisions/patches

Canonical:

```text
Scenario authoring
48 / 48 COMPLETE

next
Alignment
→ Specialization
→ Boss primitive / Boss01
→ Timer baseline
→ Runtime expansion
→ Final Security / Ending
→ Playtest
```

Do not leave:
- “32 detailed stages”
- “Sector05/06 not authored as scenarios”
- old due-date task interpreted as still unstarted

Historical schedule dates may remain,
but actual status must be explicit.

---

## 8. P0-H — BOSS BOUNDARY CONTRACT

Create a dedicated current file:

Suggested path:

```text
docs/boss-placement-and-cadence.md
```

Lock:

```text
n-8
→ boss entry
→ sector boss
→ next sector
```

and:

```text
1-8 checkpoint remains before Boss01
6-8 denial remains before Final Security
```

Use Design Decision package Boss01 / Final Security sections.

Do not connect guessed Sector02~05 bosses until their detailed contracts exist.

---

## 9. P0-I — SPECIALIZATION CONTRACT

Create:

Suggested:

```text
docs/specialization-system.md
```

or update a current growth system doc if one already owns the contract.

Must contain:

- 6 IDs
- Foundation prerequisite mapping
- exact REV1 prototype values
- fixed pair pool
- selection/persistence
- multiplayer player-local state
- reset policy
- no geometry dependency
- future random pool is OPEN, not current behavior

Then:

```text
2-3 selectionPool:"TBD"
```

can be replaced during implementation.

---

## 10. P0-J — FINAL SECURITY / ENDING CONTRACT

Create:

```text
docs/final-security-and-ending.md
```

Lock:

```text
6-8 denial
→ Pad Security Warden P-03
→ Access Restored
→ per-player boarding
→ all active ready
→ Escape ending
```

No direct boarding before Boss.

No auto-teleport partner on first board.

No revenge ending.

---

## 11. Patch Ordering

Recommended branch work order:

```text
PATCH 1
Story escalation Runtime + docs

PATCH 2
Cutter semantics docs

PATCH 3
Foundation / checkpoint state docs

PATCH 4
Art camera standard

PATCH 5
Design decisions + roadmap/current-state docs

PATCH 6
new Boss / Specialization / Ending contracts
```

Why Story first:

Current Runtime visibly presents the conflicting early final label.

Why Cutter second:

Wrong doc can generate wrong future runtime.

---

## 12. Tests / Validation

After code-affecting Patch 1:

Run:

```text
npm test
npm run check:scenario-integration
```

Also search assertions for old Story ID/token.

Acceptance:

```text
1-7
does NOT visibly say CONTAINMENT VIOLATION

6-8 contract
still owns final CONTAINMENT VIOLATION

Sector01 geometry unchanged
Wind unchanged
Sentry unchanged
Gate unchanged
```

Documentation patches:

- current code references correct
- no operative negative-default Cutter statement
- Foundation current state matches 1-4
- checkpoint has no reward claim
- design-decision current state says 48/48
- Art standard supports intentional default Camera capture contract

---

## 13. What This Patch Does NOT Do

No:
- Sector05 geometry redesign
- Sector06 geometry redesign
- boss implementation
- Specialization implementation
- timer implementation
- NPC implementation
- art generation
- commit / push

This package only defines the safe repo normalization before those tasks.

---

## 14. Final Verdict

```text
READY
```

Highest immediate issue:

```text
1-7 EARLY CONTAINMENT VIOLATION
IS CURRENT RUNTIME, NOT ONLY STALE DOC
```

Next:

```text
P0 ALIGNMENT
→
DESIGN DECISIONS
→
IMPLEMENTATION
```

---

P0 ALIGNMENT PATCH PACKAGE · REV 2.0 REVIEWED
