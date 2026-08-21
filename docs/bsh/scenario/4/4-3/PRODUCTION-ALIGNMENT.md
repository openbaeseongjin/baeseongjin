# 4-3 PRODUCTION ALIGNMENT — REV1.0

Baseline: `3c9f661bba58af6f7351e00754c12aef86575a12`

## Current Runtime — VERIFIED

At the audited main:
- Rope hookSpeed = `1200`
- hookFlightRatio = `1/3`
- base Hook Reach = `400px`
- Pursuit defaults: move `160`, acquire `640`, trigger `96`, windup `.25`, dashSpeed `640`, dash `.2`, recovery `.5`
- Pursuit movement is direct toward eligible Player target and clamps to activation when authored.

Approved design max mandatory relation:
`396.02px` — PASS against 400px.

## Legacy 4-3 — SUPERSEDED

Current legacy Sector04 authoring still represents old Transit/Infrastructure identity (`FREIGHT BYPASS / CUTTER + TRANSIT WAKE`).
The new Residential 4-3 is a major re-author, not a small patch.

## Local Relay capability — GAP / DO NOT FAKE

The current canonical AREA-SPEC authoring standard has a finite validator registry for objective presets.
A dedicated `service-relay` preset was not verified during this package audit.
Repository code search also did not establish an existing Relay B-03 interaction implementation.

Therefore:
- `AREA-SPEC-REV1-DESIGN.json` is design authority only,
- canonical `AREA-SPEC-REV1-DESIGN.json` must wait until implementation maps Relay B-03 to an actual Runtime capability and current validator schema,
- do not pretend a design JSON proves Runtime behavior.

## Dynamic geometry caution

Current AREA-SPEC standard says same-Sector Stage geometry is static by default; logical objectives are not authority to create/delete surfaces.
Relay completion should therefore prefer a verified state/presentation/interaction contract rather than unsupported large geometry mutation.

## Progression separation

Relay B-03 is local.
Resident Security Override remains A=4-2, B=4-5, C=4-7, any 2-of-3 at 4-8.
