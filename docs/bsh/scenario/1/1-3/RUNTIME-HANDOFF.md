# 1-3 RUNTIME HANDOFF — REV8.0

Baseline: `5ae6efca720720ee34f2a8b45daf1778fd206c1f`

## Before edit
Fetch latest main and re-read:
- Sector01AreaCatalog.js
- LegacyAreaSeamlessSectorRuntime.js
- AreaDefinition.js
- config.js
- AuthoredStoryPresentation.js
- authoredStoryPresentation.mjs
- enemy-density-composition.md

If main changed, re-audit before edits.

## Preserve
- 3840×1152
- Entry / Scanner contract
- Main A/C concept
- Access A/B concept
- 3-enemy Access slot budget
- Carrier Module A
- standard projectile / no Rope cut / Cover LOS
- Story wording/order
- 3-of-3 Sector Access rule

## Re-author Annex

Retire continuous 832px walkable Bridge.

Implement:
- Security Junction
- Access A commit
- Mid Gantry
- Access B commit
- Arena Entry
- Arena Floor
- elevated Upper Guard balcony
- Carrier at deep-right target
- static Security Console cover
- static Power Rack cover

## Static Cover — mandatory

Both Arena Cover objects:
- STATIC
- MOVES = FALSE
- SOLID
- NON-GRAPPLEABLE
- NON-DAMAGING
- LOS BLOCKER
- sit on Arena Floor

Do not add moving-platform logic.

## Story

Retune position thresholds if geometry requires,
but preserve exact tested text and cadence/ordering.

Player Bark:
`…신분은 맞는데.`
only if local bark owner exists/is implemented.

## Camera

Rename/reframe `route-choice` semantics to Annex/Combat.
Do not imply equal-value free route choice.
Camera should follow horizontally through the Annex.

## Validation
- full check/test
- Story regression
- 3-enemy budget
- Cover LOS
- static-cover assertion
- Access A/B two-Rope traversal
- Carrier not reachable from Junction
- Return path
- mainline/access pacing
- seamless connectors

Report remaining NOT IMPLEMENTED items.
