# 3-5 RUNTIME HANDOFF — REV8.0

Baseline: `d39cbb49d3d8247caf2542393994704292dd5002`

Before implementation:
1. fetch latest main and record SHA
2. re-read Sector03AreaCatalog
3. re-read Augment source/chooser runtime
4. re-read local Player Bark runtime
5. re-read AuthoredStoryPresentation
6. inspect 3-4 / 3-6 seams

## Preserve stable Runtime identities
- `sector-03-05:service-calibration-frame`
- `sector-03-05:node-entry-guard`
- `sector-03-05:node-exit-guard`
- `sector-03-05:node-id`
- `sector-03-05:access-summary`
- `sector-03-05:exit-panel`

## Geometry
`2688×1248`

Route:
`Tenant Delivery → vertical rise → Operations Balcony → Signage Catwalk → Tenant Transfer Deck → Upper Retail Link`

Do NOT reintroduce:
Plant Core / Busway / Switchgear / Industrial Trench.

## Node
World-facing concept:
`STAFF EQUIPMENT CALIBRATION FRAME`

Runtime type remains `augment-node`.

True safe-zone requirements:
- no Guard LOS
- no projectile path
- no Scanner/Patrol/hazard
- no kill requirement
- no Access B requirement
- world continues during chooser

## Enemy
Entry:
`node-entry-guard` / Support Pool / Delivery Passage only.

Exit:
`node-exit-guard` / Late Pool / Tenant Transfer Deck only / Access B carrier.

Exactly 2 slots.

## Player Bark
Approved:
`…내 구역 안에서는 통하는데.`

Use current local speaker-head typing bubble capability.
Do not route through System Story queue.
Do not use bottom caption or Toast.

## Exit
Preserve:
augment selected + final deck → exit panel → physical crossing → `sector-03-06`.

Access B itself is NOT a local exit condition.
