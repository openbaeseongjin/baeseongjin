# 1-7 PRODUCTION ALIGNMENT — REV8.0

Baseline:
`ea9c4438c0f106474baa09621bfb42ae5876b86e`

## AREA-SPEC v2 live cutover — 2026-08-20

`docs/bsh/scenario/AREA-CATALOG.json`은 `1-7`을 `source: generated`로 선택한다. 최신 chambered S-curve route의 middle/upper turn과 final deck을 `AREA-SPEC.v2.json`에 다시 흡수했고, generated Stage와 legacy provider의 Area definition deep parity를 확인했다. 일반 seamless 싱글·멀티 Runtime은 `Sector01AreaCatalog` 합성 facade를 통해 이 generated Stage를 사용하며 Wind·Enemy·Access C·Camera 의미는 변경하지 않았다.

## MAP-PREVIEW primary route sync — 2026-08-20

`MAP-PREVIEW.html`의 Lower Left→Right→Middle Right→Left→Safe Shadow→Upper Left→Right→Bypass endpoint 전체를 Runtime `routePoints`와 seamless `world.route`에 반영했다. 같은 Pulse·Access pocket·Collision은 변경하지 않았다.

## Current Runtime vs REV8

| Item | Current | REV8 | Status |
|---|---|---|---|
| Bounds | 3360×1472 (widened 32px from the package's stated 3328 - `access-pocket-deck` at x1440±240 clips the stated bound by 16px each side; a documented mechanical fix, not a design change) | 3328×1472 | VERIFIED (bounds note above) |
| Silhouette | chambered S-curve (A/B/C right span -> Middle opposing Pulse -> Left Safe Shadow -> D/E/F/G/H/Far Catch -> Bypass) | chambered S-curve | VERIFIED |
| Residual Wind | RIGHT continuous 220, `bounds` [-1248,416]x[-384,-128] | preserve | VERIFIED / KEEP |
| Main Pulse | RIGHT pulsed 800, `bounds` [-736,960]x[-1120,-544] (single shared zone spanning both the Middle-opposes and Upper-assists chambers - direction never changes, only the Player's own travel direction relative to it does) | preserve | VERIFIED / KEEP |
| Cycle | 1.75 / 0.7 / 1.4 / 0.3 | preserve | VERIFIED / KEEP |
| Wind damage | false | false | VERIFIED |
| Pressure Baffle | static, `grappleable:false`, `windOcclusion:true` | functional no-wind pocket | VERIFIED |
| Mainline enemy | 0 (all 3 slots in optional Access C pocket) | none | VERIFIED |
| Access enemies | Carrier + 2 Guards | preserve 3 | VERIFIED |
| Access Module | C | C | VERIFIED |
| Route | A/B/C -> right-turn -> D/E/F -> Left Shadow -> G/H/Far Catch -> Bypass -> exit | chambered A/B/C→D/E/F→G/H/Far Catch | VERIFIED |
| Objective | bypass-open interact | preserve | VERIFIED |
| Entry Story | PRESSURE NETWORK / UNSTABLE | preserve | VERIFIED |
| Pressure Limit | storyTrigger id preserved, no text authored | preserve text / re-author trigger | PARTIAL |
| Containment Violation | storyTrigger id preserved, no text authored | preserve text / re-author trigger | PARTIAL |
| bypass-ready/open/service-route | trigger inventory | no automatic Story | HOLD |
| Player Bark layer | absent | one Bark designed | NOT IMPLEMENTED (bark test explicitly allows this) |
| Camera | 8 chamber phases | 8 chamber phases | VERIFIED (approximated minY/maxY bands, see 1-5/1-6 precedent for the same non-Y-monotonic-route caveat) |

## Enemy-budget correction

Do not implement the old planning assumption of a separate mainline Turret.

Actual Runtime owns exactly the Access C Carrier + 2 Guards for this Stage.

Adding another Turret would break the Sector Stage budget.

## Player Bark boundary

Current presentation directory contains:
- AuthoredStoryPresentation
- PlayerRespawnPresentation
- WorldUnlockPresentation

No separate Player Bark layer.

Approved Bark:
`…아까랑 같은 주기네.`

Status:
`DESIGN LOCKED / NOT IMPLEMENTED`

## Physics authority

Current Wind values are real Runtime values.

REV8 changes spatial relationship, not the Wind rules:
- same RIGHT Pulse
- Middle traversal goes LEFT
- Upper traversal goes RIGHT

The tactical inversion must come from geometry.

## Geometry verdict

`IMPLEMENTED - npm run check / npm test (7 scenarios) all pass. Single shared Pulse zone confirmed
(one windZones entry, "opposes"/"assists" is purely which direction the Player is moving through it).
Remaining gap: Pressure Limit/Containment Violation Story text and the one designed Player Bark are
NOT IMPLEMENTED (bark acceptance test explicitly allows this).`
