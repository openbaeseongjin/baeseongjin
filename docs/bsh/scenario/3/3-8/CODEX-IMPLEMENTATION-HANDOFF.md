# SECTOR 03-8 — CODEX IMPLEMENTATION HANDOFF

*ROPE-AWARE REV2 MIGRATION*

## Goal

Current `sector-03-08` legacy vertical/free-weave blockout을
README REV2의 Rope-aware zig-zag Swing Spine으로 migration한다.

## Non-negotiable first step

Branch / edit 시작 전에 최신 `main`을 다시 읽는다.

최소 확인:

```text
src/game/config.js
src/game/physics/PlayerPhysics.js
src/game/rope/FixedLengthRope.js
src/game/rope/RopeLauncher.js
src/game/rope/RopeAttachment.js
src/game/input/RopePointerInput.js
src/game/augments/FoundationAugmentCatalog.js
src/game/augments/FoundationAugmentState.js
src/game/augments/actions/ActionAugmentCatalog.js
src/game/augments/AugmentCombatRuntime.js
src/game/world/AccessScanField.js
src/game/world/AreaDefinitionValidator.js
src/game/world/areas/sector03/Sector03AreaCatalog.js
docs/bsh/scenario/3/3-7/README.md
docs/bsh/scenario/3/3-7/PRODUCTION-ALIGNMENT.md
docs/bsh/scenario/3/3-8/README.md
docs/bsh/scenario/3/3-8/PRODUCTION-ALIGNMENT.md
```

HEAD 또는 gameplay contract가 이 handoff 작성 시점과 다르면
stale 숫자를 그대로 구현하지 말고 문서를 먼저 정합시킨다.

Reference checked HEAD:

```text
6f8d2529a759ca37c8aecc0185d9a0a797c6bbda
```

## Current known mismatch

Current area08:

```text
C1(-160,-384)
C2(0,-736)
C3(0,-1024)
C4(0,-1344)
```

REV2는 중앙 vertical chain을 금지한다.

## Implementation target

```text
one zig-zag Main Scanner Swing Spine

C1
→ C2 opposite side
→ C3 opposite side
→ C4

plus:
S2 one permanent wait pivot
S3 one permanent wait pivot
```

Do not build:

```text
S2a → S2b → S2c
```

## Provisional positions

These are starting hypotheses only:

```text
entry approach (-416,-160)

C1 (-160,-352)
Read A (96,-480)

S2 (-192,-544)
C2 (384,-704)

Mid (-128,-800)

S3 (160,-864)
C3 (-416,-1024)

Final Launch (128,-1120)
C4 (416,-1344)

Archive (0,-1440)
```

Adjust after runtime simulation.

## Stable IDs

Preserve existing IDs where possible:

```text
c1/c2/c3/c4
scanner-upper-market-A
drone-1/drone-2
market-gate
market-directory
evacuation-archive
access-archive
final-control
final-deck-reached
exit-panel-engaged
```

New:

```text
s2-surface / s2
s3-surface / s3
recovery-a
recovery-b
```

Confirm project naming convention before finalizing.

## Scanner

C1/C2/C3/C4 remain the shared scanner group.

S2/S3 are not controlled by scanner.

Do not change AccessScanField behavior.

## Drone

Re-author placement so:

```text
drone-1 activation
= C2/S2 beat

drone-2 activation
= C3/S3 beat
```

Activation bounds must not overlap.

No:
- T2
- rope cut
- kill gate
- new enemy rule
- cover dependency

## Recovery

Add 1–2 service recovery ledges only if playtest shows C2/C3 miss resets are too punitive.

Recovery must:
- be slower than main line
- recover in roughly 3–4s target
- work with no movement augment
- not skip Archive/Final objective

## Required physics validation

Do not rely only on the default area validator.

Current validator default uses:

```text
GRAPPLE_LINK_BUDGET = 600
```

Current Base Rope Reach:

```text
400
```

Mandatory traversal validation must use actual Rope reach.

Check actual:
- launch hand point
- closest surface point
- segment occlusion
- 400 reach
- hook flight
- fixed rope length
- swing tangent
- release state
- 1.0s reload
- landing/recovery

## Required Augment matrix

Test at least:

```text
[]
[fast-launch]
[long-rope]
[fast-recover]
[release-propulsion]
[direction-dash]
[slow-fall]
[direction-dash, rope-link]
```

If current compatibility rules disallow one listed combination,
use the closest valid current selection and document it.

Pass rule:

```text
no movement augment = clear
augment = advantage / expression only
```

## Long Rope regression

With Reach 480:

- no critical story skip
- no sealed gate bypass
- no C1→C3 / C2→C4 unintended shortcut if that invalidates the designed beat
- Archive / final objective still observed

## Camera

Test Desktop and Mobile baseline zoom.

No custom cinematic is required unless current camera readability fails.

## Tests

At minimum run:

```text
npm test
npm run check
npm run format:check
git diff --check
```

Also add/update focused Sector03 tests for:

- stable ids
- scanner controlled surface set
- S2/S3 not scanner controlled
- drone activation non-overlap
- content boundary unchanged
- no new enemy behavior
- actual 400px mandatory grapple validation
- long-rope 480 bypass regression where feasible
- augment/no-augment simulation or deterministic traversal harness where feasible

## Status update rule

Before runtime PR:

```text
ROPE-AWARE BLOCKOUT CANDIDATE
RUNTIME MIGRATION REQUIRED
```

After code + tests + playtest:

```text
MOCK INTEGRATED — REV2
```

Only after Approved Blockout:

```text
Scenario Art production
```
