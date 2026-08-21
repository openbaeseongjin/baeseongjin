# SECTOR 04-8 — PROTECTED ASCENT GATEHOUSE

**APPROVED DESIGN · REV 2.0 · SECTOR 04 GENERAL FINALE**

`UPPER RESIDENTIAL / AMENITY` · `PRIVILEGE IS PROTECTED`

> Authoring snapshot: `3c9f661bba58af6f7351e00754c12aef86575a12`<br>
> This package supersedes legacy 4-8 `TRANSIT CONTROL TRUNK`.<br>
> It does **not** authorize Sector 05, a boss entry, or timer transition.

## Stage sentence

**2-OF-3 RESIDENT SECURITY QUORUM → ALTERNATING MAINTENANCE GALLERIES → FINAL PROTECTED ASCENT CONTROL**

The player reaches the Protected Ascent Gate from 4-7, presents the actual persistent Resident Security Override state, and must have any **2 of A/B/C**. When verified, the lower security interlock releases and the maintenance worker climbs the pressurized Gatehouse through service galleries that alternate between opposite equipment faces. The route keeps gaining height while changing horizontal direction repeatedly.

## Architectural cause

The switchbacks are not arbitrary platform variety.

Pressure/smoke-lock actuator, vent, seal, and inspection equipment are distributed on alternating east/west service faces. The facilities-maintenance path therefore changes side at successive levels while the protected resident ascent remains enclosed inside the central core.

## Gameplay

`4-7 → QUORUM LANDING → 2/3 CHECK → EAST LOWER FACE → CENTER CROSSOVER → WEST LOWER GALLERY → MID INTERLOCK → EAST UPPER FACE → WEST FINAL RETURN → FINAL ASCENT CONTROL`

Pressure:
- Enemy: **NONE**
- Pursuit: **NONE**
- Cutter: **NONE**
- Scanner: **NONE**
- Wind: **NONE**
- Moving Platform: **NONE**
- Kill Gate: **NONE**

Rope:
- Base Reach: `400 px`
- Max mandatory authored relation: `386.26 px`

## Under-quorum

If override count is below 2:

```text
RESIDENT SECURITY
ACCESS INCOMPLETE

GATE REQUIREMENT
2 OVERRIDES REQUIRED
```

The protected ascent remains closed and a real return path/safe return mechanism remains available. No damage, death, substitute credential, or stage-local bypass is allowed.

## Final Story

At the full-safe Final Ascent Control:

```text
PROTECTED ASCENT
POWER NORMAL

ASCENT CONTROL
READY
```

Then, one short Player reaction:

> “…여긴 아직도 정상이라고?”

Sector 04 ends on the contradiction that this protected system remains operational. It does **not** explain why or who benefits.

## Boundary

Stage-local completion:
`FINAL ASCENT CONTROL reached`

Not automatically:
- Sector 05 entry
- Boss entry
- General Timer stop
- Boss Timer start

Those require separate approved downstream authority.
