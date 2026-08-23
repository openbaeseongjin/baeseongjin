# 4-1 PRODUCTION ALIGNMENT — REV1.0

Baseline: `4551798860193a16e53814aae5c3a42022b4e1cf`

## Current Runtime — GENERATED / PLAYABLE

The deleted legacy standalone Sector04 implementation contained:

- name: `TRANSIT INTAKE`
- subtitle: `SPEED SPACE REVEAL`
- bounds: `1600×1376`
- transit/infrastructure identity
- next legacy area: `sector-04-02`

This is **SUPERSEDED FOR NEW AUTHORING**.

The new Upper Residential 4-1 is generated from canonical `AREA-SPEC.v2.json`.

## Relevant Runtime capabilities — VERIFIED

- Base Rope effective reach: 400px planning contract.
- Patrol supports authored 2D point routes, `loop` / `pingpong`, speed, wait.
- `pursuit-drone-t1` exists, but 4-1 intentionally does not use it.
- Player Bark presentation capability exists.
- Stage Direction Runtime v1 exists.

## Approved planning delta

- bounds → `4992×2112`
- signature → `SUNKEN SKY-GARDEN BASIN / CROSS-VALLEY RESIDENTIAL ASCENT`
- enemy → exactly one Patrol
- central garden → playable Basin, not lethal void
- Story → maintained Upper Residential environment
- no Override / Pursuit / Cutter / Scanner / Wind / Augment

## Integration warning

Do not interpret this documentation package as an already migrated Runtime.

`AREA-SPEC.v2.json` is the production geometry authority and is registered through the Sector04 manifest.
Post-Sector03 Boss/Transition remains TBD, so do not directly wire 3-8 into this Stage without the transition contract.
