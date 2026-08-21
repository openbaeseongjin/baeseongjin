# 5-5 RUNTIME HANDOFF — REV4.0

Checked main: `3c9f661bba58af6f7351e00754c12aef86575a12`.

## Required Runtime basis

Existing:
- `shield-drone-t1`
- current directional shield behavior
- `surface.grappleable === false`
- Rope candidate filtering through `canAttachToSurface(surface)`

New dependency:
- `hardpoint-jammer-v1`
- `corporate-proof-terminal-v1` or equivalent proof interaction

## Do not preserve old REV3.8 unlock semantics blindly

The front Evacuation Ascent is not a door that opens because `priority-directive` was collected.

Approved REV4 geometry is:

```text
HUB
→ left Routing Control maintenance route
→ combined Jammer + AEGIS chamber
→ Priority Directive Deck
→ backside service bridge
→ physically emerge behind authorized front boundary
→ right ascent
```

The Directive remains a mandatory story objective, but geometry progression is architectural.

## Security

Only:
- Jammer ×1
- AEGIS ×1

Do not add:
- Standard Sentry
- Artillery
- Cutter
- Pursuit
- Patrol

## Jammer

Reuse the Sector05 Jammer V1 contract:
- one target at a time
- never current attached Hardpoint
- no Rope cut
- no force release
- no damage
- launched-before-active Hook resolves
- one Base-clear flank always remains

## AEGIS

Reuse current `shield-drone-t1`.
Kill optional.
No kill gate.

## Story boundary

5-5 owns:
- Priority Directive 02/03
- upper core control maintain
- upper evacuation capacity maintain
- general distribution capacity hold

5-5 does NOT own:
- Lower Ascent suspension authorization
- named authorizer
- Group C sacrifice conclusion
