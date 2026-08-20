# 맵 에디터 사용 가이드

## 시작

저장소 루트에서 다음 명령을 실행한다.

```powershell
node scripts/map-editor/serveMapEditor.mjs --port=4178
```

브라우저에서 `http://127.0.0.1:4178/map-editor/`을 연다. 서버는 loopback 주소만 수신하며, 현재 manifest에서 `source: generated`로 선언한 Sector 01 `1-1`, `1-7`만 표시한다.

## 저작 흐름

1. Stage와 왼쪽 레이어의 오브젝트를 선택한다.
2. Canvas 또는 Inspector에서 Draft를 편집한다. Anchor landmark와 24×24 grapple target은 항상 함께 이동한다.
3. **Validate**로 파일을 쓰지 않는 v2 검증을 실행한다.
4. **Apply**로 v2 JSON과 결정적 generated JS를 함께 갱신한다. stale revision, legacy Stage, 비편집 영역, 2 MiB 초과 요청은 거부된다.
5. **Preview**로 선택된 generated Area 하나의 새 로컬 싱글플레이 run을 연다.

Bounds·Entry·terrain surface·Anchor·Recovery/Route·기존 Enemy slot·Wind·Camera zone은 편집 가능하다. Objective·Progression·Story·Scanner·Behavior Registry는 표시 전용이다.

## 권위와 안전 경계

- Draft는 메모리 안에서만 바뀐다. Validate는 파일을 변경하지 않는다.
- Apply는 validation과 generated output 갱신이 모두 성공할 때만 저장한다. 실패하면 JSON과 generated JS를 함께 원상 복구한다.
- generated output은 수기 편집하지 않는다. 특수 동작은 Stable ID를 수기 Behavior Registry에서 해석한다.
- Preview는 새 single-player `GameSimulation`만 만든다. 정상 Catalog, 실행 중인 Run, multiplayer에는 hot-swap하지 않는다.
- 현재 일반 seamless Runtime은 legacy Sector Catalog를 계속 사용한다. `AREA-SPEC.json` 승격과 `composeSectorCatalog` facade를 통한 live cutover는 별도 통합 작업이다.

## 확인 명령

```powershell
node tests/areaAuthoringV2.mjs
node tests/areaEditorDraft.mjs
node tests/mapEditorAuthoringServer.mjs
node tests/areaPreviewGameApp.mjs
node scripts/area-authoring-v2/generateAreaCatalogs.mjs --check
```
