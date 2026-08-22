# SECTOR 04-8 — PRODUCTION ALIGNMENT

## Checked source

Latest checked main: `3c9f661bba58af6f7351e00754c12aef86575a12`.

The deleted legacy repository 4-8 contained:
- `TRANSIT CONTROL TRUNK`
- Cutter + Patrol
- Pulsed Wake/Wind
- old Transit/Infrastructure story
- old `UPPER EXPRESS TRUNK / LIMITED OPERATION` juxtaposition

That creative authority is superseded by this package for `sector-04-08`.

## New 4-8 authority

- `PROTECTED ASCENT GATEHOUSE`
- 3328×2720 approved map hypothesis
- Resident Security Override quorum: **2 of 3**
- no enemy/wind/scanner/moving-platform pressure
- alternating east/west maintenance-gallery ascent
- final `PROTECTED ASCENT / POWER NORMAL`
- final `ASCENT CONTROL / READY`
- one Bark: `…여긴 아직도 정상이라고?`

## Override source contract

Expected semantic progression IDs:
- `sector-04:resident-security-override:a` — earlier Sector04 source / 4-2
- `sector-04:resident-security-override:b` — earlier Sector04 source / 4-5
- `sector-04:resident-security-override:c` — 4-7

Before coding, inspect actual latest main and the implementation produced by the approved 4-7 package. Reuse the actual persistent-state representation if it differs syntactically while preserving these semantics.

## Preserve Runtime capabilities, not retired content

Reuse:
- surfaces/collision
- grapple targets
- reach objectives
- interaction/state checks
- Direction Runtime / Player Bark capability
- camera zones
- gate/interlock presentation primitives if available

Remove from 4-8 authored content:
- Cutter
- Patrol
- Wake/Wind
- old Transit status cues
- old `Momentum → interruption → recovery` finale

## Post-sector boundary

Do not invent:
- Sector05 direct wiring
- boss arena
- boss entry trigger
- timer transition
- corporate continuity reveal

The final control is a **content boundary** until downstream planning is separately approved.
