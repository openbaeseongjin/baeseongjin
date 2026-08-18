# SECTOR 04-7 — VALIDATION

Snapshot `1cb2d48870352dc71637cfc7ad553d655e0a94d4` / `0.32.0`

## Static checks
- Surface extents: **PASS**
- Grapple extents: **PASS**
- Wind rectangles: **PASS**
- Base Rope static links: **PASS**
- Long Rope next-band direct-anchor checks: **PASS**

| Link | Dist | Margin |
|---|---:|---:|
| entry→a1 | 306.8px | 93.2px |
| lower→a2 | 303.8px | 96.2px |
| mid→a3 | 322.3px | 77.7px |
| central→a4 | 315.2px | 84.8px |
| upper→a5 | 185.4px | 214.6px |

## Long Rope diagnostics
| Earlier→future | Dist | Within480 |
|---|---:|---|
| entry→a2 | 906.2px | NO |
| lower→a3 | 491.0px | NO |
| mid→a4 | 487.9px | NO |
| central→a5 | 583.6px | NO |

## Pending graybox/runtime
- swingImpulse=0 clear
- +X only traversal
- counter-flow overlap traversal
- Persistent Alert A/B/C
- Guard Wind Drift
- 3 Pursuer readability
- warning telegraph
- camera readability
- multiplayer Wind/Guard authority

## Blocked
- `sector04-persistent-guard-v1`
- `guard-wind-drift-v1`
- Sector04 source migration

Security Override Relay remains candidate only.