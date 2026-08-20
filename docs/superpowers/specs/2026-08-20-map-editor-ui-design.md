# 맵 에디터 UI 설계

## 목표와 범위

이 설계는 v2 기반 PR 위에 로컬 전용 시각 맵 에디터를 추가한다. 사용자는 `1-1` 또는 `1-7`을 불러와 편집 가능한 도메인을 Canvas와 Inspector에서 수정하고, 메모리 Draft를 검증한 뒤에만 sidecar JSON과 generated JS를 원자적으로 갱신한다. 성공한 Apply 뒤에는 편집한 Area 하나만 넣은 새 싱글플레이 GameApp preview를 연다.

이 UI는 GitHub Pages, 실행 중인 일반 Run, 멀티플레이 세션에 노출하지 않는다. root `index.html`, `src/main.js`, Sector facade, legacy provider, seamless Runtime, root `package.json` script와 shared test runner는 이 작업의 범위 밖이다.

## 레퍼런스에서 채택하는 원칙

`docs/bsh/scenario/1/images/sector-01-background-reference.png`, `1-1/images/05_scenario_art_reference.png`, `1-4/images/03_scenario_art_reference.png`와 기존 설정/디버그 UI를 시각 기준으로 사용한다. 외부 이미지나 artwork를 에디터에 복제하지 않는다.

- Navy/Charcoal 저대비 바탕과 넓은 여백을 사용해 많은 지형을 한 화면에 읽게 한다.
- Cyan은 선택한 surface, Anchor의 landmark/24×24 target 쌍, 연결선과 현재 drag handle에만 쓴다. Cyan을 일반 버튼·본문 색으로 쓰지 않는다.
- Amber는 unsaved Draft, validation warning/error, wind source와 위험 상태에만 쓴다. 성공 상태는 muted green, 읽기 전용은 slate로 구분한다.
- 배경 이미지는 editor Canvas의 장식용 저대비 layer일 뿐 좌표·collision·선택 판정의 원본이 아니다. 블록아웃 geometry가 항상 선택·드래그의 단일 권위다.

## 소유권과 데이터 흐름

```text
AREA-SPEC.v2.json ── GET /api/stages/:id ──> browser Draft
                                              │
                           Canvas + Inspector + undo/redo
                                              │
                                   Validate (no filesystem write)
                                              │
PUT /api/stages/:id ──> v2 validator ──> transaction write JSON + generated JS
                                              │
                           /map-editor/preview.html?stage=:id
                                              │
                     AreaPreviewGameApp (single selected generated Area)
```

브라우저는 project filesystem 또는 Node child process에 직접 접근하지 않는다. `MapEditorAuthoringServer`만 manifest에서 `source: "generated"`인 Stage의 sidecar/output 경로를 허용 목록으로 만들고 API를 제공한다. Apply는 입력 크기와 Stage ID를 확인한 뒤 manifest·v2 spec을 검증하고 모든 generated output을 메모리에서 생성한다. 이 단계가 모두 성공해야 임시 파일을 target과 같은 directory에 쓴 후 rename한다. write 중 오류가 나면 저장 전의 JSON과 generated content를 backup에서 복구하고 오류를 응답한다.

## UI 구조와 편집 동작

에디터 URL은 local server의 `/map-editor/`다. 화면은 고정된 세 영역과 하단 상태 bar를 가진다.

1. 좌측 **Stage/Layer panel**은 `1-1`, `1-7` stage selector와 Bounds·Entry·Surfaces·Anchors·Recovery/Route·Enemy·Wind·Camera·Read-only의 계층을 보인다. 각 item은 Stable ID로 선택하며 read-only item은 lock 표식을 가진다.
2. 중앙 **Canvas**는 world X/Y를 화면 X/반전 Y로 투영한다. wheel/pinch zoom과 space/중간 버튼 pan을 제공한다. surface는 polygon, Anchor는 landmark circle과 24×24 target square를 하나의 Cyan pair로, Entry/Recovery/Route는 서로 다른 neutral marker로, Enemy/Wind source는 Amber icon으로, Camera zone은 translucent band로 그린다.
3. 우측 **Inspector**는 선택 entity의 ID와 editable number/text/enum field를 보인다. Bounds·Entry, surface geometry, Anchor pair, Recovery/Route, existing Enemy object의 position/activation/allowed types, Wind source/zone/cycle, Camera zone을 수정한다. Canvas drag와 field edit는 같은 draft mutation을 호출한다.
4. 하단 **Draft strip**은 clean/dirty/valid/invalid 상태, 오류 개수, Undo/Redo, Validate, Apply, Preview button을 제공한다. Validate는 filesystem을 쓰지 않으며 Apply는 valid일 때만 가능하다. Preview는 마지막 Apply revision이 있는 선택 Stage에서만 가능하다.

삭제/추가는 unsafe generic JSON 편집으로 제공하지 않는다. toolbar는 preset을 가진 surface/Anchor/Recovery point/route point/Wind zone/Camera zone만 만들며, Enemy는 해당 Stage의 기존 slot만 편집한다. Objective·Progression·Story·Scanner·Behavior Registry는 summary/JSON 보기를 제공하지만 모든 control을 disabled로 두며 Draft mutation API도 이를 거부한다.

`AreaEditorDraft`는 현재 spec, dirty revision, selection, undo stack, redo stack을 소유한다. history 항목은 immutable pre/post spec snapshot이 아니라 `{ label, before, after }`의 changed JSON-pointer value만 저장하고 80개로 제한한다. failed validation과 Apply failure는 Draft를 바꾸지 않는다.

## 실제 싱글플레이 preview

`AreaPreviewGameApp`은 새 source 파일로 `GameApp`을 상속한다. base constructor가 만든 local authority를 즉시 `new LocalAuthority(new GameSimulation({ worldCatalog, startAreaId }))`로 바꾸고 camera를 재생성한다. preview catalog는 `defineAreaCatalog({ id: "map-editor-preview", revision, areas: [generatedArea] })`로 만들며 legacy/seamless catalog와 합성하지 않는다. 따라서 preview는 edited generated Stage를 사용하는 새 single-player simulation이고, 실행 중 Run·multiplayer authority·main Runtime catalog에는 영향을 주지 않는다.

`preview.html`은 server API로 selected generated module URL과 monotonic Apply revision을 받고 `import(`${moduleUrl}?revision=${revision}`)`로 `GENERATED_AREA`를 불러온다. start/reload는 새 GameApp을 만들며 existing preview instance를 hot-swap하지 않는다. preview page는 polygon renderer를 기본으로 쓰고 audio/multiplayer bootstrap을 만들지 않는다.

## 파일 경계

| 경로 | 책임 |
| --- | --- |
| `src/game/world/area-authoring-v2/editor/AreaEditorDraft.js` | Browser-safe Draft, selection, history, editable/read-only mutation guard |
| `src/game/world/area-authoring-v2/editor/AreaEditorProjection.js` | spec entity ↔ Canvas projection과 hit-test metadata |
| `src/game/runtime/AreaPreviewGameApp.js` | 단일 generated Area를 쓰는 isolated GameApp preview adapter |
| `scripts/map-editor/MapEditorAuthoringServer.mjs` | manifest allowlist, read/validate/apply transaction, static/API response |
| `scripts/map-editor/serveMapEditor.mjs` | localhost-only server bootstrap |
| `tools/map-editor/index.html`, `main.js`, `editor.css` | editor layout, Canvas interaction, Inspector, API client |
| `tools/map-editor/preview.html`, `preview.js`, `preview.css` | Apply된 generated Area의 새 single-player preview |
| `tests/areaEditorDraft.mjs`, `tests/mapEditorAuthoringServer.mjs`, `tests/areaPreviewGameApp.mjs` | Draft/transaction/preview public contract regression |

이 파일 밖의 main-owned Runtime integration file은 수정하지 않는다.

## 오류와 안전성

- server는 loopback host에서만 listen하고 `POST`/`PUT` body를 2 MiB로 제한한다.
- unknown stage, legacy source, path traversal, malformed JSON, validator issue, stale write revision, generated write failure는 structured `{ code, message, issues? }` error로 응답한다.
- Apply는 client가 보낸 `baseRevision`이 server revision과 같을 때만 허용한다. 충돌이면 server의 최신 spec과 `revision-conflict`를 반환하고 browser Draft는 유지한다.
- generated directory 밖의 write, Behavior factory/callback/module path 같은 executable behavior data, read-only domain mutation은 server와 Draft 양쪽에서 거부한다.

## 검증

- `AreaEditorDraft` test는 no-write Validate, read-only guard, paired Anchor drag, surface translation, undo/redo, revision conflict payload를 확인한다.
- authoring server test는 generated Stage allowlist, invalid draft no-write, multi-file Apply, rollback, stale revision, deterministic output을 temporary fixture directory에서 확인한다.
- preview adapter test는 injected one-Area catalog의 selected area와 startArea가 simulation/world snapshot에 나타나며 base Runtime catalog를 바꾸지 않는지 확인한다.
- browser smoke는 local server로 `1-7`을 열어 Anchor를 drag하고 Validate → Apply → Preview를 실행한 뒤 Preview canvas의 new GameApp state를 확인한다. 변경 후 `node tests/areaAuthoringV2.mjs`, editor focused tests, generated-output check, `npm run format:check`를 실행한다. 최종 integrated candidate의 `npm test`·`npm run check`·`npm run format:check` ledger는 main developer가 담당한다.
