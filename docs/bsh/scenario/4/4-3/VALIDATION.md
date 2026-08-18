# SECTOR 04-3 — VALIDATION

Snapshot: `b6e5b640f04135545341d3368a843b45c35fcedd`

## Static checks

- Surface extents: **PASS**
- Grapple bounds: **PASS**
- Guard activation/pursuit bounds: **PASS**
- Wind bounds: **PASS**
- Base Rope hand-origin reach: **PASS**

| Sample | Hand | Anchor | Distance | Margin | Flight |
|---|---|---|---:|---:|---:|
| L0 | (-528,-39) | A1 | 295.7px | 104.3px | 0.246s |
| L1 | (152,-357) | A2 | 262.4px | 137.6px | 0.219s |
| L2 | (-28,-707) | A3 | 292.6px | 107.4px | 0.244s |
| L3 | (358,-1017) | A4 | 295.0px | 105.0px | 0.246s |

## Guard Wind Drift math

- Wind strength 360
- Normal factor 0.30 → 108px/s full ACTIVE raw drift
- Dash factor 0.12 → 43.2px/s full ACTIVE raw drift
- 1.40s theoretical no-correction displacement: normal 151.2px / dash 60.5px

Actual runtime displacement will be lower/different because AI correction, phase, shadow, and bounds act concurrently.

## Pending runtime checks

- official `swingImpulse=0` mandatory route
- dynamic Fixed-Length Swing under each Wind phase
- ACTIVE Wind not wait-gated
- Guard B Patrol + Drift stability
- Guard A Pursuit → Wind entry + Drift
- 0.30 visual/readability tuning
- 0.12 Dash telegraph stability
- A+B+Wind survivability
- Recovery does not clear Alert
- no Guard bounds escape
- Player Wind unchanged
- projectile Wind unchanged
- Augment bypass/collision regressions
- desktop/mobile camera readability

## Blocked

- `sector04-persistent-guard-v1`
- `guard-wind-drift-v1`

## AREA-SPEC infrastructure

REV1.1 generic enemy patrol validation is start/end-oriented. The package intentionally preserves the approved multi-point choreography under a declared NOT_IMPLEMENTED integrated Guard preset instead of misrepresenting it as a two-point patrol.