# SECTOR 04-8 — VALIDATION

Snapshot: `1cb2d48870352dc71637cfc7ad553d655e0a94d4` / `0.32.0`

## Static geometry

- Base Rope planning samples: **PASS**
- Surface extents: **PASS by package-side extent check**
- Grapple target extents: **PASS by package-side extent check**
- Enemy activation rectangles: **PASS by package-side bounds check**
- Source exit position: **PASS**

| Link | Distance | Margin to 400 | Flight |
|---|---:|---:|---:|
| entry→a1 | 301.2px | 98.8px | 0.251s |
| lower→a2 | 330.9px | 69.1px | 0.276s |
| mid→a3 | 336.0px | 64.0px | 0.280s |
| core→a4 | 339.7px | 60.3px | 0.283s |
| upper→a5 | 198.7px | 201.3px | 0.166s |

## Long Rope 480

| Earlier body → next-band Anchor | Distance | Within 480 |
|---|---:|---|
| entry→a2 | 944.7px | NO |
| lower→a3 | 515.2px | NO |
| mid→a4 | 522.3px | NO |
| core→a5 | 633.6px | NO |

## AREA-SPEC contract

- top-level fields follow REV1.1.
- enemy preset uses only current known `patrol-drone-t1`.
- progression target is `null` because 4-8 remains content boundary.
- Persistent Pursuit and Resident Override quorum are explicitly declared `NOT_IMPLEMENTED`.
- Sector access requirement is not falsely encoded as a Stage-local objective.

## Runtime verification required

- repo-local `npm run validate:area-specs` after placement
- Sector04 source migration
- `swingImpulse=0` graybox
- Persistent Alert across A/B/C
- kill-none clear
- 3-Pursuer readability
- Long Rope dynamic bypass regression
- Relay A/B/C integration
- shared access state multiplayer
- 2-of-3 + 4-8 objective transition unlock

## Current known blockers

- default seamless compiler currently imports Sector01~03 catalogs, not Sector04.
- compiler access proof generation is currently encounter-oriented.
- access transition count is currently specialized to Sector01.
- Post-Sector04 Boss / Transition destination is not authored.