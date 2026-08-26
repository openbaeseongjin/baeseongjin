# 1-1 PRODUCTION ALIGNMENT — REV8.0

Baseline: `5ae6efca720720ee34f2a8b45daf1778fd206c1f`

## AREA-SPEC v2 live cutover — 2026-08-20

`docs/bsh/scenario/AREA-CATALOG.json`은 `1-1`을 `source: generated`로 선택한다. 최신 Runtime route와 Direction migration 뒤 빈 `storyTriggers`를 `AREA-SPEC.v2.json`에 다시 흡수했고, generated Stage와 legacy provider의 Area definition deep parity를 확인했다. 일반 seamless 싱글·멀티 Runtime은 `Sector01AreaCatalog` 합성 facade를 통해 이 generated Stage를 사용하며 geometry·objective·Camera 의미는 변경하지 않았다.

## MAP-PREVIEW primary route sync — 2026-08-20

`MAP-PREVIEW.html`의 ENTRY→A→P1→P2→Structural Grip→C→P3→Final Deck endpoint 전체를 Runtime `routePoints`와 seamless `world.route`에 반영했다. Collision 좌표는 이미 REV8과 일치해 변경하지 않았다.

## Direction Runtime migration — 0.45.0

`DIRECTION-SPEC.json`이 `DirectionDefinition`으로 compile되어 Camera·System Text·Bark·Audio·Lighting·비언어 track을 실행한다. `뭐야…?`는 entry System cue `GROUND SERVICE ACCESS / LOCKDOWN` 뒤, `…일단 위로.`는 `SERVICE SHAFT 02 / ACCESS OPEN` 뒤 local Player 머리 위 말풍선에서 글자가 차례로 나타나며 한 번 표시한다. Stage 문자열을 `AuthoredStoryPresentation`이나 Bark catalog에 중복하지 않는다.

Exit Panel의 authored 직사각형 interaction Polygon과 Player collider가 겹친 W 입력은 `terminal-read` objective를 같은 tick에 완료해 문을 즉시 활성화한다. seamless 사건은 canonical objective·Gate source ID를 함께 보존하므로 Direction의 0/0.9/1.8초 Terminal 텍스트와 후속 `SERVICE SHAFT 02 / ACCESS OPEN`이 순서대로 별도 재생되며 진행을 차단하지 않는다.

## Current Runtime vs target

| Item | Current | REV8 Target | Status |
|---|---|---|---|
| Bounds | 1280×1024 | 1280×1024 | VERIFIED |
| Entry | (-416,-32) | (-416,-32) | VERIFIED |
| A | (-128,-192) | (-128,-192) | VERIFIED |
| P1 | (224,-320), W224 | (224,-320), W224 | VERIFIED |
| P2 | (-144,-560), W224 | (-144,-560), W224 | VERIFIED |
| Overhang | (240,-608), W256 | (240,-608), W256 | VERIFIED |
| C | (-96,-736) | (-96,-736) | VERIFIED |
| P3 | (256,-864), W256 | (256,-864), W256 | VERIFIED |
| Final Deck | (320,-947), W384 | (320,-947), W384 | VERIFIED |
| Casing | `shaft-shell-left/right`, ±624, 32×1024, `grappleable:false`, spans full room height (center-anchor formula: `topY = centerY - height/2`) | ±624, 32×1024 | VERIFIED |
| Anchor B | removed (matches `forbidden: "dedicated grapple anchor B"`) | not present | VERIFIED |
| Story sequence | current verified | preserve exact | VERIFIED / PRESERVE (trigger ids only, no text changed this pass) |
| Direction tracks | compiled source | Camera·Story·Bark·Audio·Lighting·nonverbal | AUTO: `npm run validate:direction-specs` |

## Runtime implementation note (2026-08-19)

1-1 had been sitting on pre-REV8 geometry (960×960, no casing, dedicated Anchor B) despite this
doc's own REV8.0 heading - the REV7→REV8 Runtime rewrite done earlier for 1-1 never actually landed on
`main`. Rewritten to the REV8.0 package's exact coordinates above; `npm run check`/`npm test` (7
scenarios) pass, plus targeted regressions
(`legacyAreaSeamlessSectorRuntime`/`seamlessSectorGameSimulation`/`seamlessSectorMultiplayerWorld`/
`routeSurfaceVisibility`/`sectorProgressState`/`sectorDefinitionValidator`/`authoredStoryPresentation`/
`areaDefinitionValidator`/`sector01MapReconstruction`).

## Important Runtime correction

Current config verifies effective Rope hook reach = **400px**, not the older 440px planning value.
Implementation and tests must use current code as authority.

## Seamless

Seamless Runtime width remains 4800.
City Wing surfaces overlap local core by 48px.
Persistent casing must survive legacy import and block external bypass.

## Geometry authority

REV7.0 geometry is superseded.
REV7 psychology/story remains incorporated into REV8.
