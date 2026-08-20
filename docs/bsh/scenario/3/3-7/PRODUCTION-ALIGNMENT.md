# 3-7 PRODUCTION ALIGNMENT — REV8.1

Baseline: `cb4f690ac180a04868322e9c4cfe1384897c348b`

## Runtime VERIFIED
- area `sector-03-07`
- current name `PRIORITY CONCOURSE`
- 4 enemy slots
- one Scanner group controlling C1/C2/C3
- upper guard carries `sector-03:access-module:c`
- local exit crosses to `sector-03-08`

## Direction Runtime VERIFIED
Main now includes Direction Runtime v1:
`DIRECTION-SPEC → compiler → DirectionRuntime → domain adapter`.

Only migrated Stage coverage is currently limited; 3-7 is NOT IMPLEMENTED in Direction Runtime.

## Planning delta
- bounds `3840×1792`
- three-band commercial transfer braid
- Priority Spine / Outer Gallery / Facility Service gameplay retained
- Story simplified:
  - remove Player-facing Service Class / Standard-Premium / Access Tier
  - retain Priority Route as the only late-3-7 reveal
- Bark:
  `…우선 통로가 따로 있었네.`

## Critical migration rule
When 3-7 moves to Direction Runtime:
- update/remove legacy 3-7 `access-directory` Story copy
- do not let both legacy AuthoredStoryPresentation and DIRECTION-SPEC fire
- systemText + Bark must compile from DIRECTION-SPEC
- required track coverage must be implemented/verified before release
