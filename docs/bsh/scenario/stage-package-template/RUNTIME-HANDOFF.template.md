# <STAGE ID> — RUNTIME HANDOFF

> AUTHORING SNAPSHOT: `main@<GITHUB_MAIN_SHA>` (<YYYY-MM-DD>)

`DIRECTION-SPEC-AUTHORING-STANDARD.md` §8의 Required Mapping Table을 이 Stage 기준으로 채운다. 기획 ID와 실제 Runtime 파일/함수를 1:1로 매핑하지 못하는 항목은 `NOT IMPLEMENTED`로 표시하고 최소 adapter 제안을 적는다 — 추측으로 채우지 않는다.

| Planning ID | Runtime Target | File | Trigger/Event | Test |
|---|---|---|---|---|
| Beat <beatId> | `<함수/맵 이름>` | `src/game/...` | `<event 이름>` | `tests/...` |

## Current Runtime Boundaries (참고)

- Geometry: `src/game/world/areas/AreaDefinition.js` (+ `src/game/world/areas/sectorNN/SectorNNAreaCatalog.js`)
- Story: `src/game/presentation/AuthoredStoryPresentation.js`
- Camera: `src/game/camera/AuthoredCameraDirector.js`
- Audio: `src/audio/AudioEventBindings.js`
- Tests: `tests/authoredStoryPresentation.mjs`, `tests/authoredCameraDirector.mjs` + 관련 gameplay test

## NOT IMPLEMENTED 항목

<현재 Runtime에 대응 코드가 없는 Direction 필드/track. 이 Stage를 구현하기 전에 `docs/bsh/scenario/DIRECTION-RUNTIME-CAPABILITY-MATRIX.md`를 먼저 확인한다.>
