# P0 ALIGNMENT PATCH PACKAGE

*FULL GAME AUDIT FOLLOW-UP · CURRENT RUNTIME / DOC SOURCE-OF-TRUTH NORMALIZATION · REV 2.0 REVIEWED*

| 항목 | 기준 |
|---|---|
| Repository | `openbaeseongjin/baeseongjin` |
| Audit Source Snapshot | `bd5be25b900b65f3ab42eeb4ee5ff45f2052a06b` |
| Detailed Scenario | 48/48 merged |
| Goal | Geometry redesign 없이 Runtime·문서·기획 게이트를 한 진실로 정렬 |
| Status | **P0 ALIGNMENT APPLIED — P0-I SUPERSEDED BY GENERIC AUGMENT V1** |

---

## 0. Updated Audit Finding

이 패키지는 Full Game Audit 이후 최신 `main`을 다시 확인해 정정한 버전이다.

가장 중요한 정정은 P0-A 패치 전 Runtime에도 조기 최종 문구가 존재했다는 점이었다. 현재는 P0-A가 반영되어 1-7이 다음을 사용한다.

```text
1-7
VERTICAL TRANSIT VIOLATION / SECURITY RESPONSE ACTIVE
```

최종 `CONTAINMENT VIOLATION`은 6-8 / Final Security 경계에만 남긴다. 패치 대상은:

```text
src/game/presentation/AuthoredStoryPresentation.js
```

의 Position Presentation과 Area `storyTriggers`, 테스트와 현행 시나리오 문서였다.

따라서 이 항목은 `DOC ONLY`가 아닌:

```text
RUNTIME + DOC
P0
```

수직 변경 수정이었으며 지형·Wind·Sentry·Access 계약은 변경하지 않았다.

---

## 1. P0-A — SECURITY ESCALATION RUNTIME PATCH

Integration status: **APPLIED** — Runtime token/ID, visible copy, regression test, Sector 01 scenario handoff are aligned. `CONTAINMENT VIOLATION` remains reserved for 6-8 / Final Security.

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

Applied definition:

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

Area07 `storyTriggers` uses:

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

Global search after patch confirms the retired 1-7 token, ID, and combined copy no longer appear in active source, tests, or Sector 01 documents. The final phrase remains valid only in the 6-8 / Final Security contract.

---

## 2. P0-B — CUTTER POSITIVE OPT-IN TRUTH

Integration status: **APPLIED** — active Stage/Master docs use `cutter-fire` positive opt-in, and the historical audit carries a do-not-author banner.

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

## 3. P0-C — GENERIC AUGMENT IMPLEMENTATION STATE

Integration status: **APPLIED** — 1-5~1-8 Production Alignment records the 22-card generic Augment prototype and playtest-balance gap; retired three-Foundation routes are not mandatory.

Current 1-4 / 2-3 / 3-5 truth:

```text
generic Augment deterministic offer / selection / effects
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

Do not restore or mark retired Foundation-dependent routes as mandatory.

---

## 4. P0-D — CHECKPOINT REWARD DRIFT

Integration status: **APPLIED** — 1-8 Production Alignment now records checkpoint progress/personal respawn only and no reward selection.

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

Integration status: **APPLIED** — the common Art standard and Sector 02/03 masters accept a verified default-camera capture contract without adding fake gameplay Camera zones.

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

Integration status: **APPLIED** — 48/48, 현재 구현 순서, P0-A~E 완료 상태를 roadmap·schedule·handoff·scenario integration에 반영했다.

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

Integration status: **APPLIED IN EXISTING OWNERS** — `docs/sector-timer-and-boss-flow.md`, `docs/design-decision-requests.md`, and the scenario integration checkpoint own this boundary. A duplicate file is not created.

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

## 9. P0-I — SPECIALIZATION CONTRACT — SUPERSEDED

Integration status: **DO NOT IMPLEMENT** — the fixed six-Specialization tier and Foundation prerequisite mapping were replaced by `docs/augment-v1.md`. The stable 2-3 Node is the second generic Augment offer source; no separate Specialization state, pool, or document is introduced.

---

## 10. P0-J — FINAL SECURITY / ENDING CONTRACT

Integration status: **APPLIED IN EXISTING OWNERS** — `docs/design-decision-requests.md`, its resolution package, `SESSION-HANDOFF.md`, and the scenario integration checkpoint own this contract. A duplicate file is not created.

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
Boss / Ending contracts in existing canonical owners
```

Why Story first:

Current Runtime visibly presents the conflicting early final label.

Why Cutter second:

Wrong doc can generate wrong future runtime.

---

## 12. Validation

After code-affecting Patch 1:

Run:

```text
npm run check
npm run check:scenario-integration
```

Also search production callers and documents for old Story ID/token.

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
- a new Specialization tier
- timer implementation
- NPC implementation
- art generation
- commit / push

This package only defines the safe repo normalization before those tasks.

---

## 14. Final Verdict

```text
APPLIED
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
