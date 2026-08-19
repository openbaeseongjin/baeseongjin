# 1-3 PRODUCTION ALIGNMENT — REV8.0

Baseline: `5ae6efca720720ee34f2a8b45daf1778fd206c1f`

## Current Runtime vs REV8

| Item | Current | REV8 | Status |
|---|---|---|---|
| Bounds | 3840×1152 | same | VERIFIED / KEEP |
| Entry / Scanner | existing | same intent | VERIFIED |
| Main Grapple | A/C | A/C | VERIFIED / RETUNE C |
| Annex Grapple | Access A/B | Access A/B | VERIFIED / RETUNE |
| Annex Bridge | continuous W832 | segmented two-commit approach | NOT IMPLEMENTED |
| Arena | W960 around x1320 | W736 around x1536 | NOT IMPLEMENTED |
| Carrier | x1500 | x1760 deepest point | NOT IMPLEMENTED |
| Guard 1 | x1040 floor | x960 approach pressure | RETUNE |
| Guard 2 | x1760 floor | x1512 elevated balcony | NOT IMPLEMENTED |
| Cover | current cover elements | distinct static Console + Power Rack | NOT IMPLEMENTED |
| Enemy budget | 3 | 3 | VERIFIED / PRESERVE |
| Access Module A | present | present | VERIFIED |
| Story | implemented/tested | preserve exact | VERIFIED |
| Camera | 6 zones | preserve count, rename/reframe annex shot | PARTIAL |
| Old Main B/D docs | stale | retired | DOC FIX |

## Static Cover clarification

The two Arena Cover objects are:
- fixed Security Console
- fixed Equipment/Power Rack

They:
- stand on Arena Floor
- do not move
- are solid
- are non-grappleable
- are non-damaging
- exist to break Sentry LOS

Do NOT implement moving cover behavior.

## Story regression authority

Preserve current tested sequences:
- Employee Verified → Assigned Sector
- Final Warning
- Route Violation → Unauthorized Vertical Transit
- Access Denied
- Maintenance Override
- Violation Logged

## Current Combat authority

Preserve:
- standard projectile
- no Rope cut
- cover ends LOS
- Carrier + 2 guards
- Access Module A
- 2-of-3 Sector transit rule

## Verdict

`PARTIAL MATCH — BOUNDS/CORE SYSTEMS VALID, ANNEX RE-AUTHOR REQUIRED`
