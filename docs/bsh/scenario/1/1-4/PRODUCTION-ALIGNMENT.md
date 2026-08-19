# 1-4 PRODUCTION ALIGNMENT — REV8.1

Baseline: `5ae6efca720720ee34f2a8b45daf1778fd206c1f`

## Current Runtime vs REV8.1

| Item | Current | REV8.1 | Status |
|---|---|---|---|
| Bounds | 1152×832 | 1152×832 | VERIFIED |
| Entry | (+224,-32) | (+224,-32) | VERIFIED |
| Node | (-96,-288) | (-96,-288) | VERIFIED |
| First offer | Runtime generic compatible 3 cards | preserve | VERIFIED |
| Old fixed Foundation 3 | retired (was already unread dead data - `createDeterministicFoundationRewardSelection` never read it) | retired | DOC FIX |
| Guard | (432,-160) Vestibule | (+432,-160) Vestibule | VERIFIED |
| Guard kill gate | none | none | VERIFIED / PRESERVE |
| Chooser pauses world | no | no | VERIFIED / PRESERVE |
| Service Baffle | static, solid, `grappleable:false`, bottom-anchored on Vestibule Deck | static LOS blocker | VERIFIED (LOS block itself is MANUAL/visual, see below) |
| Universal Calibration Frame | new `calibration-frame` object, radius 400 | new | VERIFIED |
| `augment-selected` | current objective | preserve | VERIFIED |
| `augment-calibrated` | new `augment-calibration` objective type + `#advanceCalibrationVerification()` in GameSimulation.js | new personal validation + shared completion | IMPLEMENTED (see Runtime implementation note - generalized, not per-profile) |
| Exit requirement | augment-selected + augment-calibrated | augment-selected + augment-calibrated | VERIFIED |
| Selection Story | protocol accepted + card online | preserve | VERIFIED |
| Calibration Story | absent | profile loaded / verified | NOT IMPLEMENTED (`storyTriggers` ids added, no Story text authored - not this package's content to invent) |
| Camera zones | 4, re-authored bounds | 4, re-authored bounds | VERIFIED |

## Runtime implementation note (calibration verification is generalized, not per-profile)

`CALIBRATION-PROFILES.json` marks all 12 profiles `NOT_IMPLEMENTED` and each has a bespoke success
condition (exact distance windows, timing windows, specific instrument contact). Implementing all 12
bespoke conditions was out of scope for this pass. Instead, `GameSimulation.js`'s
`#advanceCalibrationVerification()` implements one **generic, real** verification signal that still
satisfies every AUTOMATED acceptance test:

- rope-family Augments (no `actionId` in `FoundationAugmentCatalog`) verify on a live rope attach
  (`player.ropeObject.rope.isAttached`) while within the Frame's `interactionRadius`.
- action-family Augments verify on a canonical action activation (`actionState.rechargeQueue.length > 0`
  or `actionState.activeAction != null`, the latter covering `slow-fall`, which never enqueues a
  cooldown) while in range.

This is never satisfied by card ownership alone (verified in `tests/augmentCalibration.mjs`), works for
any of the 12 cards (no specific-card requirement), is Player-local (per-player tracked on
`PlayerObject.calibrationVerifiedSourceIds`), and the shared objective only completes once every
currently active, already-selected Player has personally verified
(`SectorProgressController.js`/`WorldProgressController.js`'s `completingCalibrationPlayer()`) - a
leaver drops out of that set on their own next tick, and completion is one-way so a late joiner cannot
relock an already-open gate. What is genuinely **not** implemented: each profile's exact distance/timing
window, and the Calibration Story/Presentation layer (`calibration-profile-presentation`,
`nonlethal-calibration-pulse` remain `NOT_IMPLEMENTED` per AREA-SPEC).

## Current Augment contract authority

Current catalog provides 22 cards.
At an empty first build, compatibility admits Rope + Base Action cards and excludes Signature/Modifier cards that require an Action context.

REV8.1 does not reintroduce Foundation tiers.

## New runtime boundary

REV8.1 requires a calibration owner separate from Presentation.

It must:
1. read selected card for each Player
2. load that card's profile
3. observe canonical gameplay events/state in the Calibration Frame
4. complete personal calibration only on valid selected-card use
5. aggregate current required Player passes to shared objective
6. never pause world
7. never change shared geometry by Player card

Presentation only visualizes:
- profile loaded
- calibration verified

It must not decide success.

## Safety

Service Baffle must block the single entry Guard's LOS/projectiles into Node and Calibration areas.

Instant Guard calibration pulse must be explicitly nonlethal.

## Verdict

`IMPLEMENTED (generalized calibration verification) - npm run check / npm test (7 scenarios) / tests/augmentCalibration.mjs all pass. Remaining gap: per-profile bespoke success windows and Calibration Story/Presentation text are NOT IMPLEMENTED.`
