# SECTOR 04-7 — PRODUCTION ALIGNMENT

> **CURRENT RUNTIME OVERRIDE — 0.68.0:** Enemy slot은 4개이며 아래 Pursuit/Security 2기 authoring 기록을 대체한다.

## Current source-of-truth split

Latest checked main: `3c9f661bba58af6f7351e00754c12aef86575a12`.

The deleted legacy `Sector04AreaCatalog.js` contained:

- name: `ISOLATION JUNCTION`
- subtitle: `CUTTER + WAKE SYNTHESIS`
- bounds: `1472×1536`
- Cutter ×1
- pulsed Wake ×1
- `LOWER ASCENT FEEDER / ISOLATED` story

That retired runtime block is **not the approved creative authority anymore**.

## New approved authority

This package replaces only the 4-7 authored design with:

- name: `REFUGE TERRACE`
- bounds hypothesis: `5440×2816`
- Pursuit ×1 on the main lower ascent
- full-safe M0 Refuge Airlock
- optional Inner Security Spur
- Static Security ×1 on that spur
- Resident Security Override C
- final fact: `UPPER REFUGE / SECURITY ACTIVE`
- final fact: `PROTECTED ASCENT / AVAILABLE`
- one bark: `…대피로까지 따로 지키고 있네.`

## Preserve from current Runtime

Reuse existing Runtime primitives whenever possible:

- area definitions / surfaces / grapple targets
- `pursuit-drone-t1` enemy behavior already present in current enemy pools
- `sentry-t1` static security behavior
- `no-rope-cut`
- activation-band-only targeting
- gate panel / reach objective pattern
- camera zone infrastructure
- authored story presentation / Direction Runtime capability already present elsewhere in main

## Runtime dependency: Resident Security Override C

Sector04 A/B/C override progression is implemented; 4-7 owns optional source C.

Implementation rule:

1. First inspect current main for an existing reusable access/override progression state.
2. Reuse it if semantically compatible.
3. If absent, add the **smallest general persistent module/flag path** necessary for Sector04 `resident-security-override:a|b|c`.
4. Do not implement 4-8 quorum logic in this PR unless required solely to keep existing tests compiling.
5. Never replace actual acquisition state with a Story Toast.

## Downstream boundary

Current 4-8 is the generated Protected Ascent Gatehouse and owns the 2-of-3 quorum check.

This package may preserve `nextAreaId: sector-04-08` for continuity, but it does **not** authorize:
- rewriting 4-8,
- implementing its future 2-of-3 design,
- restoring old 4-7 `LOWER FEEDER ISOLATED` story,
- inventing Sector05 causal explanation.
