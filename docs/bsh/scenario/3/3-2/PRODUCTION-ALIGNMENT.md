# 3-2 PRODUCTION ALIGNMENT — REV8.0

Baseline: `d588aa041a350cab198cd187d8dccbe3b3a244dd`

## Current Runtime truth
- `AREA-SPEC.v2.json → Sector03Stage02.generated.js → AREA-CATALOG.sector03.json → Sector03AreaCatalog composer`의 명시적 generated source
- `sector-03-02 / FACADE SERVICE GALLERY / FIRST ACCESS SCAN`, bounds `3200×1472`
- topology: Underframe L→R / Backside R→L / Crown L→R. center-anchored `media-wall-body`는 Editor에서 구조를 읽기 위한 비충돌 `design-reference`이며 Runtime terrain·Rope surface가 아니다.
- 하나의 Scanner Group `sector-03-02:scanner-A`: C1/C2/C3/C4, cycle `1.5 / .6 / 1.1 / .3`; LOCK/RESET은 새 부착만 거부하고 이미 부착된 Rope는 보존
- 첫 Scanner tutorial과 Right Service Cradle은 적 압력 없이 유지한다. Lower Standard Pool Guard는 tutorial 뒤 shelf에만, Support Pool Access A Carrier는 optional Crown cassette에만 둔다.
- Story stable ID: `access-control`, `service-mount`, `retail-security-ahead`; 세 `story-display`는 Map Editor의 `worldObjects`에 표시되고 위치를 편집한다. 문구·cue·진행 규칙은 read-only다. Player Bark 두 줄은 기존 Bark layer가 없으므로 NOT IMPLEMENTED
- Patrol·Wind·Rope Cut·추가 Scanner cycle은 없다. custom Camera Zone은 저작 수치가 없어 기본 authored camera를 사용한다.
- final deck → exit panel → authored Gate trigger를 통과한 Player 한 명만 `3-3` authored Entry로 텔레포트한다. Runtime seam/city-wing/격벽은 추가하지 않는다.

## Cutover boundary
- Sector 03의 3-1~3-8은 모두 `source: "generated"`이며 수기 provider나 Stage별 fallback을 유지하지 않는다.
- 기존 seamless progression·Access 3-of-3 권위·multiplayer 권위와 Sector 03 이후 Boss/4-1 전환은 이 cutover가 소유하지 않는다.
- Map Editor의 Draft → Validate → Apply → 새 로컬 Preview는 generated v2 source만 대상으로 하며 활성 Run·정상 seamless Catalog·multiplayer를 hot-swap하지 않는다.

## Stale docs
Legacy `Enemy NONE` is superseded by current Runtime's two slots.
Legacy Foundation/Specialization wording is superseded by generic Augment carry.

## Dialogue
- `…인증은 됐는데, 왜 막히는 거지?`
- `…이미 붙은 건 그대로네.`

Both remain NOT IMPLEMENTED if Player Bark layer is absent.
