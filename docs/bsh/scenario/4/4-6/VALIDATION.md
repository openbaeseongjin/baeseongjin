# SECTOR 04-6 — VALIDATION

Snapshot: `90208deb1e1946538dd76c22e280fcf7677106bd`

## Static checks
- Surface extents: PASS
- Grapple targets: PASS
- Enemy origins: PASS
- Base static attachment samples: PASS

| Link | Distance | Margin | Flight |
|---|---:|---:|---:|
| L0→A1 | 290.4px | 109.6px | 0.242s |
| L1→A2 | 290.3px | 109.7px | 0.242s |
| L2→A3 | 277.7px | 122.3px | 0.231s |
| L3→A4 | 290.3px | 109.7px | 0.242s |
| L4→A5 | 189.8px | 210.2px | 0.158s |

## Latest Runtime
- Base Rope reload: `0.50s`
- Cutter Rope-disabled: `0.60s`
- Fast Recover halves current normal Rope reload
- Cutter collision resolves Rope overlap before body hit for cutter-enabled projectile

## Pending
- swingImpulse=0 mandatory clear
- Guard A persistence through Cutter band
- Cutter telegraph readability
- Cut→R2/R3 recovery
- Guard B stack
- kill-none clear
- Long Rope/Fast Recover regression
- multiplayer independent Rope Cut
- camera Cutter+A3+R2+incoming Guard readability

AREA-SPEC deliberately avoids hard-coding current Rope/Combat values in acceptanceTests.