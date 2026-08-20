# 3-7 RUNTIME HANDOFF — REV8.1

Baseline: `cb4f690ac180a04868322e9c4cfe1384897c348b`

Before coding:
1. fetch latest main
2. re-read `Sector03AreaCatalog.js`
3. re-read `direction-spec.schema.json`
4. re-read Direction compiler/catalog/validator
5. audit 3-7 legacy Story presentation
6. audit 3-8 seam

## Stable IDs to preserve
- `sector-03-07:drone-1`
- `sector-03-07:concourse-lower-guard`
- `sector-03-07:concourse-centre-guard`
- `sector-03-07:concourse-upper-guard`
- `sector-03-07:concourse-sign`
- `sector-03-07:access-directory`
- `sector-03-07:upper-market-gate-ahead`
- `sector-03-07:scanner-priority-concourse-A`

## Geometry
Implement `3840×1792`.
Do not turn the Stage into three disconnected corridors.

M1 and M2 are full-safe authored hubs.

## Story migration
Legacy 3-7 copy with:
`SERVICE CLASS / STANDARD-PREMIUM / ACCESS TIER`
must be retired for this Stage.

DIRECTION-SPEC owns:
`UPPER CONCOURSE ROUTE CONTROL`
→ `PUBLIC / SERVICE ROUTES / ACTIVE`
→ `PRIORITY ROUTE / ACTIVE`
→ Player Bark `…우선 통로가 따로 있었네.`

No A/B/C in 3-7.

## Access C
Upper Guard carries C.
C is not required for local 3-7 exit and current 3-8 does not require A/B/C.

## Direction release gate
Run current Direction validator/compiler.
If required systemText/dialogue is `unsupported / compile-failed / review-required / unbound`, do not release.
