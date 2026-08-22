# 4-1 RUNTIME HANDOFF — REV1.0

Baseline: `4551798860193a16e53814aae5c3a42022b4e1cf`

## Before implementation

1. Fetch/rebase latest `main`.
2. Confirm the obsolete Transit catalog remains deleted and read canonical `AREA-SPEC.v2.json`.
3. Re-read `EnemyPatrol.js`, enemy archetype/runtime ownership.
4. Re-read Direction Runtime v1 compiler/catalog/validator.
5. Re-check latest post-Sector03 Boss/Transition contract.
6. Re-check Sector04 master before changing shared progression.

## Required replacement

Legacy:
`TRANSIT INTAKE / SPEED SPACE REVEAL / 1600×1376`

New:
`UPPER RESIDENTIAL ARRIVAL / 4992×2112`

This is a major geometry + identity re-author.

## Enemy

Exactly one new authored Patrol slot.

Planning ID:
`sector-04-01:residential-basin-patrol`

Preferred enemy type:
`patrol-drone-t1`

Patrol:
- loop
- speed 48
- wait 0.4
- 4 authored Basin points
- no Rope Cut
- kill optional
- no Pursuit behavior

Activation must not reach M0 or final Lobby.

## Story

M0:
`UPPER RESIDENTIAL DISTRICT`
`ENVIRONMENTAL SERVICE / NORMAL`

then local Bark:
`…여긴 아직 다 돌아가고 있네.`

Basin:
`RESIDENTIAL SECURITY / ACTIVE`

Exit:
`RESIDENT COURTYARD / SECURITY CONTROL`

Do not duplicate Story/Bark in a legacy presentation path after Direction migration.

## Progression

4-1:
- no Resident Security Override
- no 2-of-3 count change
- no Augment source
- no kill gate

4-2 owns first Override A.

## Transition

The new 4-1 planning exit points toward 4-2.
The actual entry from Sector03 remains blocked by the unresolved Post-Sector03 transition contract.

## Release block

Required Direction tracks must compile and show `implemented/verified`.
Unsupported required actions are not silently approximated.
