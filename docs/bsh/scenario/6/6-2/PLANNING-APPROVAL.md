# ONE ROPE — SECTOR 06-2 CROSSWIND MASTS — REV3.1 APPROVED

> Status: **USER APPROVED · DESIGN LOCKED · NOT IMPLEMENTED**
> Authoring snapshot: `8b344f0f7a2309bfb316655668ed180718db7781`

## Final signature

**HORIZONTAL CROSSWIND GANTRY → BAFFLE MAST → RECESSED LEE POCKET → SHORT HOOK-BACK → VARIED-HEIGHT FINAL ASSIST**

## Why the macro is one-way

The dominant stage axis remains leftward because 6-2 is the continuous Crosswind mastery stage.

However REV3.1 explicitly avoids a flat one-line route.

Local altitude rhythm:

```text
SAFE PREVIEW
→ HIGH
→ LOW
→ HIGH
→ LOW
→ LEE POCKET
→ SHORT HOOK-BACK
→ LOW
→ HIGH
→ LOW
→ EXIT
```

This keeps the macro readable without making the route visually flat.

## Wind

```text
mode continuous
direction (-1,0)
strength 500
falloff 80
```

One static Wind rectangle.

Lee Pocket is outside the authored Wind rectangle.

## Route coordinates

- 00: `(1250, -300)`
- 01: `(1050, -420)`
- 02: `(760, -500)`
- 03: `(470, -430)`
- 04: `(150, -560)`
- 05: `(-160, -500)`
- 06: `(-350, -290)`
- 07: `(-180, -410)`
- 08: `(-70, -510)`
- 09: `(-390, -470)`
- 10: `(-700, -600)`
- 11: `(-1030, -520)`
- 12: `(-1260, -620)`

Max authored relation:

**345.4px < 400px**

Distances:

`233.24, 300.83, 298.33, 345.4, 315.75, 283.2, 208.09, 148.66, 322.49, 336.15, 339.56, 250.8`

## Recovery

R1 / R2 only.

No long lower recovery catwalk.

## Story

Entry:
`CROSSWIND MASTS / EXTERIOR SERVICE ROUTE / OPEN`

Player:
> **“…바람이 계속 한쪽으로 미네.”**

Exit:
`PERIMETER SIGNAL DECK / SECURITY / ACTIVE`

## Approval record

User explicitly requested the one-way macro to be refined with local height/arc variation and packaged.

REV2.x is superseded.
REV3 is superseded by REV3.1.
