# 4-6 PRODUCTION ALIGNMENT

Baseline audited main: `3c9f661bba58af6f7351e00754c12aef86575a12`

## Design authority
- Approved MAP: REV2
- Approved Story / Dialogue: REV2
- New Sector04 Residential authoring supersedes legacy Transit `POWER RELAY SPAN` identity.

## Verified current capability
- Base Hook Reach remains 400px at current config audit.
- `pursuit-drone-t1` exists.
- Enemy projectiles set `canCutRope` when enemy rules include `cutter-fire`; `cover-ends-los` uses authored `cover` surfaces.

## Target not yet production-aligned
- New 4-6 geometry is not the current live Sector04 authored Runtime.
- New Stage Direction mapping must be wired and validated.
- Canonical AREA-SPEC must be run through the latest validator at implementation time.

## Critical non-regressions
- Do not restore legacy Transit/Power Relay story.
- Pursuit and Cutter activation must remain separated.
- Cutter must remain a secondary late-Sector lesson, not Sector04 identity.
- 4-6 owns no Resident Security Override.
