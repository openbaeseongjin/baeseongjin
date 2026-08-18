# SECTOR 04-1 — VALIDATION

Snapshot: `8afd16bc76462436490fe7c753611c2ecf36b548`

## Static checks performed in this package

- Area-local bounds check: **PASS**
- Surface bounds check: **PASS**
- Anchor bounds check: **PASS**
- Patrol point bounds check: **PASS**
- Base Rope static hand-origin attach distance: **PASS for all 4 mandatory samples**

| Sample | Hand origin | Anchor | Distance | Margin to 400 | Base flight |
|---|---|---|---:|---:|---:|
| L0 | (-418, -27) | A1 | 256.5px | 143.5px | 0.214s |
| L1 | (52, -337) | A2 | 296.8px | 103.2px | 0.247s |
| L2 | (68, -647) | A4 | 286.3px | 113.7px | 0.239s |
| L3 | (12, -947) | A5 | 294.9px | 105.1px | 0.246s |

### Interpretation

These checks prove only that the nominated launch samples are inside the current physical 400px Hook reach when the current ±12,-7 hand origin is applied.

They **do not** prove the complete dynamic traversal.

## Dynamic checks still required in Runtime

- Fixed-Length Rope trajectory and tangent direction.
- Release velocity and actual landing position.
- 1.0s Base reload consumption between beats.
- One-way platform landing behavior.
- Guard projectile/pursuit pressure while swinging.
- Two simultaneous alerted Pursuers.
- Recovery 3–5 second target.
- Desktop/mobile camera readability.
- Long Rope 480 bypass.
- Fast Recover 0.5 timing.
- Release Propulsion ×1.25 collision safety.
- Dash / Slow Fall non-requirement.

## Blocked checks

Persistent Pursuit behavior cannot PASS until `sector04-persistent-pursuit-alert-latch` is implemented.

## Validator warning

Current `validateAreaCatalog()` defaults to `GRAPPLE_LINK_BUDGET = 600`, while Base physical Rope reach is 400. A catalog validator PASS alone is not sufficient gameplay validation.