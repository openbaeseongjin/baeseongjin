# SECTOR 04-7 — PRODUCTION ALIGNMENT

Status: **MIGRATION REQUIRED**

Snapshot `1cb2d48870352dc71637cfc7ad553d655e0a94d4` / `0.32.0`.

## VERIFIED Runtime basis

- Wind Runtime supports `continuous` and `pulsed`.
- Pulsed phases are `LULL → WARNING → ACTIVE → DECAY`.
- Multiple active Wind Zone vectors are summed.
- Current simulation applies World Wind to Players.
- AREA-SPEC official contract remains REV1.1 / `area-spec-v1` / `seamless-sector-landmark-v1`.

Therefore the irregular-feeling airflow does **not** need RNG: two authored pulsed zones with different cycles/directions are sufficient.

## NOT IMPLEMENTED

- `sector04-persistent-guard-v1`: approved whole-Stage Alert/Pursuit integration.
- `guard-wind-drift-v1`: Enemy sampling/application of the same World Wind.

## Current 4-7 source

Legacy `ISOLATION JUNCTION / CUTTER + WAKE SYNTHESIS` remains migration source. Target removes Cutter and changes Wind usage to deterministic counter-flow turbulence in the Refuge Terrace.

## Security Override

4-7 Relay (`resident-override-refuge`, Proof C/3) is confirmed by the 4-8 Sector Access Rollout and is now in AREA-SPEC as an optional interact objective (`resident-security-override-relay-v1`, `NOT_IMPLEMENTED`). See `../4-8/SECTOR-04-ACCESS-ROLLOUT.md` and `../4-8/ACCESS-PATCHES/4-7-RELAY-PATCH.md`.

## Scenario Art

HOLD until source migration, persistent pursuit, Guard Wind Drift, overlap graybox, telegraph/camera validation and proof-slot review.
