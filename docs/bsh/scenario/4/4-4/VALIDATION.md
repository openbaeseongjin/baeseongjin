# SECTOR 04-4 — VALIDATION

Snapshot: `b6e5b640f04135545341d3368a843b45c35fcedd`

## Static package checks

- Surface extents: **PASS**
- Grapple target bounds: **PASS**
- Guard activation/pursuit bounds: **PASS**
- Treatment Pod position: **PASS**
- Base Rope static hand-origin reach: **PASS**

| Sample | Hand | Anchor | Distance | Margin | Flight |
|---|---|---|---:|---:|---:|
| L0 | (-528,-39) | A1 | 295.7px | 104.3px | 0.246s |
| L1 | (132,-347) | A2 | 248.8px | 151.2px | 0.207s |
| L2 | (-92,-667) | A3 | 264.3px | 135.7px | 0.220s |
| L3 | (192,-977) | A4 | 255.3px | 144.7px | 0.213s |
| L4 | (-28,-1307) | A5 | 321.5px | 78.5px | 0.268s |

## Treatment Pod design constants

- channelSeconds: `3.0`
- healAmount: `40`
- maxHealthCap: `100`
- usesPerPlayer: `1`
- damage interrupt: `true`
- clear alert: `false`
- invulnerability: `false`

## Pending Runtime checks

- official `swingImpulse=0` mandatory route
- Fixed-Length Swing/release/landing
- A/B/C multi-point patrol
- persistent pursuit through Treatment Deck
- 3 Pursuer readability/survivability
- treatment 3.0s exact timing
- valid HP damage interruption
- heal cap and no overheal
- successful-use-only entitlement consumption
- per-Player multiplayer entitlement
- death/disconnect during channel
- authoritative duplicate prevention
- Treatment Deck camera readability
- Long Rope / Fast Recover / Release Propulsion / Dash / Slow Fall regression

## Blocked

- `sector04-persistent-guard-v1`
- `care-treatment-pod-v1`
- AREA-SPEC validator/authoring extension for custom treatment placement/tuning

## Schema note

This package does not invent an unsupported top-level `interactables` array. The exact Treatment Pod contract is carried in README/RUNTIME-HANDOFF while AREA-SPEC declares the custom objective preset and NOT_IMPLEMENTED dependency. Production integration must extend the official authoring/validator contract explicitly.