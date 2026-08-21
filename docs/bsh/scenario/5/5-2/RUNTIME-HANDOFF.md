# 5-2 RUNTIME HANDOFF — REV1.0

## Before coding

1. fetch/rebase current `main`
2. re-check `shield-drone-t1` behavior and tuning
3. re-check `RopeImpactAttack`
4. re-check enemy activation bounds
5. re-check non-grappleable corporate surfaces
6. re-run authored-distance validation

## Stable contract

```text
sourceAreaId
sector-05-02

name
CONTROL ATRIUM

special security
shield-drone-t1 ×2

simultaneous AEGIS
NEVER

kill requirement
NONE

next
5-3 SECURITY REVIEW GALLERY
```

## Geometry

Use `AREA-SPEC-REV4-DESIGN.json`.

Do not creatively convert the Stage into a flat combat room.

The architectural cause of the flank is:
- straight Review Bridge is watched,
- maintenance circulation wraps the partition frame,
- valid Service Hardpoints sit on that edge route.

## AEGIS A

- only first lower band
- activation OUT at P0
- Player can read AEGIS + partition + H2/H3 before committing
- no other special actor
- kill optional

## AEGIS B

- only second upper band
- reverse partition orientation
- does not activate until A is fully out
- no other special actor
- kill optional

## Shield behavior

Reuse current `shield-drone-t1`.

Do not:
- make shield omnidirectional
- freeze shield direction
- add a new “backstab state”
- force enemy death to progress

The intended lesson is movement-based angle change.

## Story

Use `DIRECTION-SPEC.json`.

No Player Bark.
No dialogue during AEGIS pressure.

## Exit

Final control deck
→ exit panel
→ 5-3 connector.

Do not implement 5-3 Jammer as part of this package.
