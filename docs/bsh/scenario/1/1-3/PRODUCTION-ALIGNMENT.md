# 1-3 PRODUCTION ALIGNMENT — REV8.0

Baseline: `5ae6efca720720ee34f2a8b45daf1778fd206c1f`

## MAP-PREVIEW primary route sync — 2026-08-20

`MAP-PREVIEW.html`의 Main Security Spine ENTRY→A→Warning Deck→Security Junction→C→Upper Relief→Final Deck endpoint 전체를 Runtime `routePoints`와 seamless `world.route`에 반영했다. Access Annex collision·Carrier·Cover 좌표는 이미 REV8과 일치해 변경하지 않았다.

## Current Runtime vs REV8

| Item | Current | REV8 | Status |
|---|---|---|---|
| Bounds | 3840×1152 | same | VERIFIED / KEEP |
| Entry / Scanner | existing | same intent | VERIFIED |
| Main Grapple | A/C | A(64,-224)/C(-192,-752) | VERIFIED |
| Annex Grapple | Access A/B | Access A(512,-496)/B(960,-608) | VERIFIED |
| Annex Bridge | segmented (mid-gantry + entry) | segmented two-commit approach | VERIFIED |
| Arena | W736 around x1536 | W736 around x1536 | VERIFIED |
| Carrier | x1760 deepest point | x1760 deepest point | VERIFIED |
| Guard 1 | x960 approach pressure | x960 approach pressure | VERIFIED |
| Guard 2 | x1512 elevated balcony | x1512 elevated balcony | VERIFIED |
| Cover | distinct static Console(1328,-584,72×112) + Power Rack(1600,-560,88×160), grappleable:false | distinct static Console + Power Rack | VERIFIED |
| Enemy budget | 3 (Carrier + 2 guards) | 3 | VERIFIED / PRESERVE |
| Access Module A | present, 3-of-3 Sector contract | present | VERIFIED |
| Story | implemented/tested | preserve exact | VERIFIED |
| Camera | 6 zones, `turret-reveal`+`annex-combat` retuned | preserve count, rename/reframe annex shot | VERIFIED |
| Old Main B/D docs | retired | retired | DOC FIX |

## Access Module A (Sector 3-of-3 contract)

- 기존 Sentry T1 stable ID와 행동을 유지하면서 Stage-local 오른쪽 Annex `(1500,-640)`으로 옮겨 `sector-01:access-module:a`를 운반하는 Access Carrier A로 사용한다.
- 처치하면 Sector 공용 모듈 1개를 얻으며, 0.41.0의 3-of-3 계약에서 1-3·1-6·1-7 Carrier 세 기를 모두 요구하므로 이 개체는 Sector 경계 개방에 필수다.
- 0.42.0부터 위치 문자열과 720px 거리 제한을 제거한다. 화면 밖에서는 다음 미수집 Carrier를 safe-area edge arrow로, 화면 안에서는 Carrier 위 무문자 diamond marker로 안내한다.
- 기존 960px 보안 spine 좌표는 유지하고 Stage 폭을 3840px로 확장했다. Annex Bridge `(640,-576, 832×16)`, Arena `(1320,-640, 960×32)`, Access Anchor `(448,-480)`, `(896,-544)`가 Stage-local 좌표를 소유한다.

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
- 3-of-3 Sector transit rule (current `seamless-sector-runtime-v9`)

## Runtime implementation note

Implemented in `src/game/world/areas/sector01/Sector01AreaCatalog.js`'s `area03`. The two static Cover
surfaces use `groundedSurface()` (bottom-center anchor, required by `AreaDefinitionValidator`/tests for
any `kind: "cover"` surface taller than it is wide) with the AREA-SPEC's `(x,y)` passed straight through
as the bottom-anchor point - the spec does not state which anchor convention its cover preset authors
against, so this is a documented judgment call rather than a value taken from the package. Actual
LOS-blocking geometry should be re-checked visually (`MAP-PREVIEW.html`) before treating `cover-los`
(MANUAL acceptance test) as satisfied.

## Verdict

`FULL MATCH — Runtime rewritten to REV8.0, npm run check / npm test (7 scenarios) / targeted regressions all pass`
