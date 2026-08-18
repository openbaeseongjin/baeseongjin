# SECTOR 04-2 — VALIDATION

Snapshot: `eaf05cd4b771879504f76d078ee728c48be5feb6`

## Static package checks

- Area bounds: **PASS**
- Surface bounds: **PASS**
- Anchor bounds: **PASS**
- Guard patrol points: **PASS**
- Base Rope static hand-origin reach: **PASS**

| Sample | Hand origin | Anchor | Distance | Margin to 400 | Flight |
|---|---|---|---:|---:|---:|
| L0 | (-488,-39) | A1 | 309.5px | 90.5px | 0.258s |
| L1 | (152,-357) | A2 | 255.3px | 144.7px | 0.213s |
| L2 | (-52,-697) | A3 | 241.3px | 158.7px | 0.201s |
| L3 | (162,-977) | A4 | 248.8px | 151.2px | 0.207s |

## Pending dynamic checks

- Fixed-Length Swing / release / landing for all four beats.
- 1.0s reload rhythm.
- Guard A pursuit through Decision Balcony into Guard B band.
- A+B simultaneous pursuit readability and survivability.
- Projectile pressure under enemy attack range 760.
- Recovery does not clear alert.
- Camera keeps Guard A readable from below during B band.
- Long Rope 480 bypass regression.
- Fast Recover 0.5 timing regression.
- Release Propulsion ×1.25 collision safety.
- Direction Dash / Slow Fall non-requirement.

## Blocked

`sector04-persistent-pursuit-alert-latch` and state-aware pursuit bounds are not yet implemented.

## Validator warning

Current area validator uses `GRAPPLE_LINK_BUDGET = 600` by default; Base physical Rope reach remains 400. Runtime playability requires separate 400px + dynamic traversal verification.