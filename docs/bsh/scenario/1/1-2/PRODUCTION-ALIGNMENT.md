# 1-2 PRODUCTION ALIGNMENT — REV8.0

Baseline: `5ae6efca720720ee34f2a8b45daf1778fd206c1f`

## MAP-PREVIEW primary route sync — 2026-08-20

`MAP-PREVIEW.html`의 RIGHT ENTRY→A→Airborne C Window→C→Roof Reversal P2→Upper Catwalk→Final Deck endpoint 전체를 Runtime `routePoints`와 seamless `world.route`에 반영했다. Collision 좌표는 이미 REV8과 일치해 변경하지 않았다.

## Traversal and Player Bark override — 0.44.0

- 중앙 Dead Lift·Counterweight는 유지한다. `lift-failure`/`left-cross` camera가 Service Slot 방향을 먼저 보여 Anchor C와 주변 Recovery·Roof route가 Dead Lift에 가려지지 않게 한다.
- A→C는 정적 직접 부착이 아니라 Dead Lift 왼쪽 Service Slot의 MAP HTML free-air sample `(-208,-350)`에서 400px 이내가 되는 Airborne Re-Attach다. B/D Anchor나 tutorial popup을 추가하지 않는다.
- `…리프트도?`는 `LIFT CONTROL / OFFLINE` 뒤 local Player 머리 위 말풍선에서 글자가 차례로 나타나며 한 번 표시한다. Airborne C와 Final Deck에는 새 Bark를 추가하지 않는다.

## Current vs REV8

| Item | Current Runtime | REV8 Target | Status |
|---|---|---|---|
| Bounds | 960×1088 | 1664×960 | NOT IMPLEMENTED |
| Entry | (-320,-32) | (+448,-32) | NOT IMPLEMENTED |
| A | (-128,-192) | (+224,-192) | NOT IMPLEMENTED |
| C | (-160,-640) | (-320,-560) | NOT IMPLEMENTED |
| P1 | (+160,-288) | (-416,-320) | NOT IMPLEMENTED |
| P2/current recovery | (-192,-576) | R2 (+64,-656) + P2 (+64,-704) | NOT IMPLEMENTED |
| P3 | (+160,-800) | (-160,-768), W320 | NOT IMPLEMENTED |
| Lift | background-only at (0,-544) | offset visual + 448×320 solid collision | NOT IMPLEMENTED |
| Counterweight | absent | 96×448 solid + visual | NOT IMPLEMENTED |
| Final Deck | +208,-963,W288 | -352,-832,W384 | NOT IMPLEMENTED |
| Casing | absent | ±816, 32×960 | NOT IMPLEMENTED |
| Entry Story | LIFT CONTROL/OFFLINE | preserve | VERIFIED |
| Manual access Story | current positional trigger | preserve meaning; threshold may need retune | VERIFIED / RETUNE |
| Final-deck Story | POWER REDUCTION → SECURITY ACCESS | preserve exact | VERIFIED |

## Current Story tests

Tests verify:
- Entry `LIFT CONTROL / OFFLINE`
- manual access waits until first ascent
- `AUTOMATIC LIFT SERVICE / SUSPENDED · MANUAL ACCESS ONLY`
- final deck:
  - `POWER REDUCTION / STAGE 2`
  - +1.2s `SECURITY ACCESS / CHECK`
- replayed final-deck event does not duplicate either cue

These are regression authority.

## Current physics correction

Effective Hook Reach = **400px** at baseline.

REV8 A→C:
- static ≈657px
- intended release-arc sample `(-208,-350)` → C ≈240px

This must be verified in actual gameplay rather than accepted from paper geometry alone.

## Seamless

Because local core changes from 960 to 1664:
- recheck City Wing generation and overlap
- verify casing stops external bypass
- verify connector from 1-1 REV8 right exit into 1-2 right Entry
- verify 1-2 left exit connects cleanly to current 1-3 entry near x=-320

## Verdict

`IMPLEMENTED` - Stage 1-2 REV8 is fully built and committed (see docs/scenario-development-integration.md entries). The table above is stale (predates implementation); left as historical record rather than rewritten line-by-line this pass.
