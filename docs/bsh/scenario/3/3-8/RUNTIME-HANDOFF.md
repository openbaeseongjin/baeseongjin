# 3-8 RUNTIME HANDOFF — REV8.0

Baseline: `cb4f690ac180a04868322e9c4cfe1384897c348b`

Before coding:
1. fetch latest main
2. re-read current 3-8 Area
3. re-read Direction Runtime schema/compiler/validator
4. re-read current legacy 3-8 Story presentation
5. recheck post-Sector03 transition contract

## Stable IDs
- `sector-03-08:drone-1`
- `sector-03-08:drone-2`
- `sector-03-08:market-lower-guard`
- `sector-03-08:market-upper-guard`
- `sector-03-08:final-control-guard`
- `sector-03-08:evacuation-archive`
- `sector-03-08:access-archive`
- `sector-03-08:final-control`
- `sector-03-08:scanner-upper-market-A`

`access-archive` stable ID may remain even though Player-facing visible content becomes route-status.

## Story migration
Retire old Service Class / Access Tier archive copy for 3-8.

LEFT:
Evacuation Transfer Record → A complete / B complete / C suspended.

RIGHT:
Upper Transfer Route Status → Public/Service active → Priority active.

Player physically moves LEFT→RIGHT.
No auto camera pan.

Final Bark:
`…C는 멈췄는데, 우선 통로는 열려 있었네.`

## Boundary
Keep `content-boundary`.
Do not wire directly to sector-04-01.
Do not invent Boss.

## Direction release gate
Required systemText/dialogue must compile and reach implemented/verified.
