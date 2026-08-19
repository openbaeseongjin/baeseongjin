# 1-6 PRODUCTION ALIGNMENT — REV8.0

Baseline:
`ea9c4438c0f106474baa09621bfb42ae5876b86e`

## Current Runtime vs REV8

| Item | Current | REV8 | Status |
|---|---|---|---|
| Bounds | 3840×1280 | 3840×1280 | VERIFIED |
| Main silhouette | A/B/C right span -> Neutral Shadow -> D/E/F left span -> exit | two huge cross-flow sweeps | VERIFIED |
| Fan A | LEFT continuous 500, `bounds` [-480,1536]x[-480,-160] | preserve physics | VERIFIED / KEEP |
| Fan B | RIGHT pulsed 800, `bounds` [-1408,1280]x[-992,-704] | preserve physics | VERIFIED / KEEP |
| Fan B cycle | 1.75 / 0.7 / 1.4 / 0.3 | preserve | VERIFIED / KEEP |
| Wind damage | false | false | VERIFIED |
| Wind occlusion | `wind-baffle` solid, `grappleable:false`, `windOcclusion:true`, bottom-anchored flush on Neutral Shadow Deck | functional central Baffle | VERIFIED (`windOccludingSurfaces()` already honors `windOcclusion` - pre-existing infra, not new) |
| Access Module B | present | preserve | VERIFIED |
| Access enemies | Carrier + 2 Guards, all in the Access Intake pocket | preserve total 3 | VERIFIED |
| Mainline enemies | 0 (all 3 slots in the optional Access pocket) | explicitly 0 | VERIFIED |
| Landmarks | A/B/C (real grapple-landmarks, B/C presented as subtle structural joints) and D/E/F (D real, E/F structural) | A/B/C and D/E/F cross-flow layout | VERIFIED |
| Entry Story | AIRFLOW UNSTABLE | preserve | VERIFIED |
| `cooling-pressure-critical` | storyTrigger inventory only, no bound text | no visible Story until bound | HOLD |
| `bypass-required` | storyTrigger inventory only, no bound text | no visible Story until bound | HOLD |
| Player Bark layer | absent (`src/game/presentation/` still has no Bark layer) | 3 authored Barks | NOT IMPLEMENTED (per `bark-causality` acceptance test's own "if implemented" clause) |
| Camera | 6 cross-flow/optional zones | 6 cross-flow/optional zones | VERIFIED |

## Player Bark audit

At this baseline, `src/game/presentation/` contains only:
- AuthoredStoryPresentation
- PlayerRespawnPresentation
- WorldUnlockPresentation

No verified Player Bark presentation layer.

Therefore:
- Bark text is DESIGN LOCKED.
- Bark behavior is NOT IMPLEMENTED.
- Gameplay must ship independently of Bark implementation.

## Current Story authority

Visible verified 1-6 Entry:
`COOLING DISTRIBUTION / AIRFLOW UNSTABLE`

Do not treat planning `storyTriggers` inventory as presentation proof.

## Physics authority

Current Fan strengths and cycle are real Runtime values.
REV8 uses them as the implementation starting point.

Playtest may reveal tuning needs,
but any tuning must preserve:
- Fan A = understandable continuous assist
- Fan B = readable control-vs-speed timing choice

## Main geometry verdict

`IMPLEMENTED - npm run check / npm test (7 scenarios) all pass. The Wind system's existing physics
(WorldForceField.js) supported this Stage's role with zero new engine code needed - only the
targetBounds field was missing from the earlier blockout's windZones entries (added, matching
Sector04AreaCatalog.js's established bounds/direction/mode/strength/cycle shape). Remaining gap:
Story Presentation text for cooling-pressure-critical/bypass-required and the Player Bark layer are
NOT IMPLEMENTED (bark-causality acceptance test explicitly allows this).`
