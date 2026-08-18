# SECTOR 04-5 — VALIDATION

Snapshot: `b6e5b640f04135545341d3368a843b45c35fcedd`

## Static package checks

- Surface extents: **PASS**
- Static grapple targets: **PASS**
- Guard activation / pursuit bounds: **PASS**
- Anchor Drone body path: **PASS**
- Base Rope mandatory static links: **PASS**

| Static sample | Hand | Anchor | Distance | Margin | Flight |
|---|---|---|---:|---:|---:|
| L0 | (-548,-39) | A1 | 295.7px | 104.3px | 0.246s |
| L1 | (132,-357) | A2 | 281.4px | 118.6px | 0.235s |
| L2 | (-92,-697) | A3 | 320.5px | 79.5px | 0.267s |
| L3 | (162,-1047) | A4 | 277.0px | 123.0px | 0.231s |
| L4 | (-28,-1387) | A5 | 290.8px | 109.2px | 0.242s |

## Moving Anchor static acquisition envelope

| Socket extreme | Distance from Atrium Read | Margin to 400 |
|---|---:|---:|
| LEFT | 253.7px | 146.3px |
| RIGHT | 294.0px | 106.0px |

- Drone body speed: `80px/s`
- Base Hook flight lifetime: `1/3s`
- Max target body translation during one full lifetime: `26.7px`
- Drone Exit body sample → A4: `109.6px`

## Pending Runtime validation

- official `swingImpulse=0` mandatory route
- dynamic target candidate selection
- moving target hook flight
- dynamic target leaves reach / invalidates
- moving socket position + velocity constraint
- fixed Rope length under moving pivot
- Drone endpoint reversal stability
- release momentum / no artificial boost
- multi-Player same Drone attachment
- independent Rope lengths
- authoritative replication
- A/B 0.5 phase relationship
- independent Orbit break on detection
- A+B+C worst-case survivability
- Long Rope 480 bypass regression
- Fast Recover retry cadence
- Release Propulsion / Direction Dash landing regression
- camera A/B + Drone + A3 readability

## Blocked by new systems

- `sector04-persistent-guard-v1`
- `moving-anchor-drone-v1`
- official AREA-SPEC dynamic grapple entity authoring/validator extension

## Important physics warning

Simply overwriting `FixedLengthRope.anchor` with the Drone position each frame is insufficient for a correct moving pivot because current radial velocity solving assumes a zero-velocity anchor. The moving socket velocity must participate in the relative radial constraint.