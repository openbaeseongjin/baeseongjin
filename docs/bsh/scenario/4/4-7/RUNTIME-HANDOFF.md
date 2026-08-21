# SECTOR 04-7 — RUNTIME HANDOFF

## 1. Mandatory preflight

Before editing:
1. checkout/pull latest `main`;
2. confirm HEAD is still compatible with checked source `3c9f661bba58af6f7351e00754c12aef86575a12`;
3. inspect `src/game/world/areas/sector04/Sector04AreaCatalog.js`;
4. inspect current enemy factory/selection path for `pursuit-drone-t1`;
5. inspect interaction/progression state for reusable access-module semantics;
6. inspect current Direction/Player Bark implementation.

If main has materially changed, reconcile first. **Do not silently preserve legacy 4-7 semantics.**

## 2. Migration scope

Replace the legacy `sector-04-07` authored block only.

Preserve:
- id `sector-04-07`
- sector order `7`
- handoff from 4-6
- `nextAreaId: sector-04-08` as a temporary continuity seam

Do not redesign 4-8 in this package.

## 3. Geometry authority

`AREA-SPEC-REV1-DESIGN.json` is collision/object authority.

`MAP-PREVIEW.html` is the approved visual/gameplay topology and must not be creatively altered.

Important: the large central core rectangle in the preview is an **architectural cutaway/backdrop**, not one monolithic collision rectangle. The optional Inner Security Spur occupies the core-side maintenance/security cutaway. Author collision only where `AREA-SPEC-REV1-DESIGN.json` marks platforms, partitions, and recovery.

## 4. Rope reach

Base Hook Reach: `400 px`.

Validated:
- Mainline max: `394.46 px`
- Override C spur max: `357.77 px`

Do not exceed 400 px for mandatory or intended Override-C chain relations.

## 5. Pursuit phase

`persistent-pursuit-01`:
- use existing `pursuit-drone-t1`
- no rope cut
- no kill gate
- lower/main ascent only
- activation must end before/at M0
- M0 must be full-safe and target-clear

The Airlock “door closes” beat is presentation first. Do not introduce a new dynamic-door gameplay dependency merely for the shot. If current door animation is unavailable, use activation boundary + LOS partition + audio/light presentation.

## 6. Override C phase

After M0:
- show Outer Bypass and Inner Security Spur together
- Outer Bypass is longer but threat-free
- Inner Security Spur is shorter and has one late static Sentry
- Pursuit must remain inactive
- entering the Override C booth must make the player safe
- Sentry kill is optional
- Override C interact is optional
- 4-7 local exit must work with C uncollected

Suggested runtime object:

`sector-04-07:override-c-panel`

Persistent semantic ID:

`sector-04:resident-security-override:c`

Do not require a kill to acquire C unless the user later explicitly changes this design.

## 7. Story / Direction

`DIRECTION-SPEC.json` is the timing authority.

Never play dialogue during:
- active Pursuit
- active static security
- high-input Rope traversal

Only one material Player Bark:

`…대피로까지 따로 지키고 있네.`

Play only at the final full-safe deck after both System facts.

If Direction Runtime and legacy authored story would both fire, migrate to one authority and prevent double firing.

## 8. Exit

Local exit requirements:
- final Refuge Control reached
- exit panel interacted

Not required:
- Override C
- enemy kill

4-8 quorum is downstream and out of scope.
