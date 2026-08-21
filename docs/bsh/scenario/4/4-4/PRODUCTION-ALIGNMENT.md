# 4-4 PRODUCTION ALIGNMENT — REV1.0

Baseline: `3c9f661bba58af6f7351e00754c12aef86575a12`

## Verified current Runtime inputs

At packaging audit:
- `ROPE_CONFIG.hookSpeed = 1200`
- `hookFlightRatio = 1/3`
- Base Hook Reach = **400px**
- `patrol-drone-t1` remains a known legacy enemy type / canonical template-supported enemy preset.
- current AREA-SPEC template supports `patrol-drone-t1`, `reach-deck`, and `exit-panel`.
- sealed-door is part of the current AREA-SPEC surface vocabulary.

Approved map max mandatory relation: **390.61px — PASS vs 400px**.

## Runtime status

New 4-4 Residential Refuge Hall gameplay is **NOT IMPLEMENTED**. The current repository may still carry legacy Sector04 content. This package is implementation authority for the approved redesign, not proof that runtime already matches it.

## Player Bark gap

The scenario packages have used a Player Bark planning layer that is not yet a verified general Runtime capability. Therefore `“…아래는 저 꼴인데.”` is **DESIGN LOCKED / RUNTIME MAPPING REQUIRED**. Do not convert it into a System Toast.

## Current-main delta note

Baseline `3c9f661bba58af6f7351e00754c12aef86575a12` is a post-Surface-Physics-fix / Quick-Tunnel endpoint state. The most recent endpoint-only commit does not change 4-4 design causality, but implementation must still start from latest main and re-run movement/ground-contact playtests.
