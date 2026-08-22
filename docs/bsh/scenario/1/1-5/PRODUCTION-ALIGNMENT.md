# 1-5 PRODUCTION ALIGNMENT — REV8.0

Baseline:
`29d72baa1879850ea9e811ff6640dfce7e23c7c9`

## MAP-PREVIEW primary route sync — 2026-08-20

`MAP-PREVIEW.html`의 Horseshoe→Long Span→Controlled Drop→Low Slot→Relaunch→Upper Return→Final Deck endpoint를 Runtime `routePoints`와 seamless `world.route`에 정확히 동기화했다. 기존 Collision·Enemy·Cover는 변경하지 않았다.

## Latest-main audit

Latest branch changed from the earlier planning baseline to `29d72baa1879850ea9e811ff6640dfce7e23c7c9`.

Relevant recheck:
- `Sector01AreaCatalog.js` Stage 1-5 definition is still the current 960×1280 vertical blockout.
- `AuthoredStoryPresentation.js` relevant file SHA is unchanged from the prior audit and still contains the same 1-5 text sequence.
- `FoundationAugmentCatalog.js` relevant file SHA is unchanged and legacy Foundation migration remains:
  - impulse-coil → release-propulsion
  - relay-link → rope-link
  - shear-current → electrified-rope

The latest main change does not invalidate the approved REV8 planning direction.

## Runtime vs REV8

| Item | Current Runtime | REV8 | Status |
|---|---|---|---|
| Bounds | 2304×1152 | 2304×1152 | VERIFIED |
| Silhouette | horseshoe/drop loop (short rise -> long right span -> controlled drop -> low slot -> re-launch -> upper-left return) | horseshoe/drop loop | VERIFIED |
| Entry | (-896,-32) | (-896,-32) | VERIFIED |
| C | (-704,-224) | (-704,-224) | VERIFIED |
| G | (-160,-768) | (-160,-768) | VERIFIED |
| F1/F2/Mid Grip/High Capture/Final Grip | real `grapple-landmark` surfaces + objects, subtle `structural-grapple-joint` presentationId | real gameplay grapple joints, not glowing tutorial anchors | VERIFIED |
| Low/Upper Cover | static, solid, `grappleable:false`, bottom-anchored flush on Low Test Slot / Upper Return Deck | static LOS blockers | VERIFIED (LOS itself is MANUAL/visual) |
| Enemy slots | 2 (Low Guard, Upper Guard) | 2 | VERIFIED |
| Enemy pool | Early Pool | Early Pool | VERIFIED |
| Kill requirement | none | none | VERIFIED |
| Wind | none | none | VERIFIED |
| Moving platform | none | none | VERIFIED |
| Card-specific route logic | none (Stage Runtime never reads a card id) | none | VERIFIED |
| final-deck objective | yes | yes | VERIFIED |
| old routes | `base-safe` / `recovery` only | retire fixed-build route names | VERIFIED |
| Story entry | LIVE CALIBRATION | preserve | VERIFIED (trigger geometry retuned to new topology, not re-authored text) |
| Story load/security | storyTriggers renamed to REV8 wording (`vertical-load-test`/`security-response-test`/`cooling-distribution-service-access`) | preserve text; re-author trigger location | PARTIAL (ids renamed; no Story Presentation text authored - not this pass's scope) |
| Gate Story | COOLING DISTRIBUTION / SERVICE ACCESS | preserve | VERIFIED (trigger id only, no text authored) |
| Camera | 5 topology-phase zones (approximated minY/maxY bands, see note) | 5 topology phases | PARTIAL |

## Camera zone note

The package's `camera.zones` gave `intent` prose (e.g. "far-right landing through controlled drop and
low slot") instead of `minY`/`maxY`, because 1-5's route is not Y-monotonic (it descends, stays low,
then climbs back up-left) - the minY/maxY banding model every other Stage uses doesn't cleanly express
that. `docs/bsh/scenario/1/1-5/AREA-SPEC.json` was given five equal-ish sequential bands over the full
[-1152,0] range in the package's own zone order as the closest mechanical fit; this is an approximation
of the described intent, not a value taken directly from the package, and should be revisited by a human
with the actual play-tested camera framing in mind.

## 맵 에디터 점검 — 2026-08-22

Map Editor에서 `1-5`의 저장됨/검증 통과 상태(오류 0)를 직접 확인했다. v2 source에는 지형 9개,
Anchor 8개, Recovery/Route 18개, Low/Upper Guard 2슬롯, Wind 0개, Camera Zone 5개가 있으며,
모두 기존 Runtime 적용 source에서 읽혔다. 시나리오의 Horseshoe→Long Right Span→Controlled
Drop→Re-launch→Upper Return→Final Deck 구조와 충돌하는 데이터는 발견하지 못했다.

이번 audit은 source 적합성 확인만 수행했으므로 `저장 적용`을 실행하지 않았고, v2 JSON·generated JS·Camera
수치를 바꾸지 않았다. 실제 넓은 route를 끝까지 통과하며 모든 Camera Zone 전환과 Cover LOS를 보는 검증은
기존 `PARTIAL` 상태를 유지한다.

## Important correction to old docs

Old Production Alignment history mentions A~H Anchors / fixed Foundation expression.
Current actual Runtime source owns only dedicated C/G landmark targets.

REV8 does not resurrect A~H.

Structural F1/F2/Mid/High/Final grips are authored as real gameplay grapple joints,
but are not tutorial-labelled A~H landmarks.

## Map Preview authority

The Gameplay Map must show only gameplay-relevant geometry.

Do not restore decorative:
- trusses
- braces
- background beams
- cables
- architecture-only surfaces

If a structural member appears in the Map Preview,
it must have a real gameplay contract.
