# 맵 에디터 사용 가이드

## 시작

저장소 루트에서 다음 명령을 실행한다.

```powershell
node scripts/map-editor/serveMapEditor.mjs --port=4178
```

브라우저에서 `http://127.0.0.1:4178/map-editor/`을 연다. 서버는 loopback 주소만 수신하며, 현재 manifest에서 `source: generated`로 선언한 Sector 01 `1-1`, `1-7`만 표시한다.

## 저작 흐름

1. Stage와 왼쪽 레이어의 오브젝트를 선택한다.
2. Canvas 또는 Inspector에서 Draft를 편집한다. Anchor landmark와 24×24 grapple target은 항상 함께 이동하며, Recovery와 Route point는 각각 추가할 수 있다. Enemy slot은 위치·종류·허용 pool과 activation bounds/spec을 편집한다.
3. **Validate**로 파일을 쓰지 않는 v2 검증을 실행한다.
4. **Apply**로 v2 JSON과 결정적 generated JS를 함께 갱신한다. stale revision, legacy Stage, 비편집 영역, 2 MiB 초과 요청은 거부된다.
5. **Preview**로 선택된 generated Area 하나의 새 로컬 싱글플레이 run을 연다.

Bounds·Entry·terrain surface·Anchor·Recovery/Route·기존 Enemy slot·Wind·Camera zone은 편집 가능하다. Objective·Progression·Story·Scanner·Behavior Registry는 표시 전용이며 Draft와 서버가 모두 변경을 거부한다. Canvas drag는 이동 중 임시 상태만 갱신하고 pointer release에서 Undo 한 건으로 확정한다.

## 권위와 안전 경계

- Draft는 메모리 안에서만 바뀐다. Validate는 파일을 변경하지 않는다.
- Apply는 v2 구조와 실제 Runtime Area 불변식, read-only 경계를 확인하고 저장 직전에 현재 Stage source hash가 Draft를 연 시점과 같은지 검사한다. 브라우저는 요청 중 Apply를 비활성화한다.
- 해커톤 운영에서는 맵 에디터를 한 번에 한 명만 사용한다. 다중 사용자 mutex와 서버 crash까지 견디는 완전한 다중 파일 원자 저장은 후속 범위다.
- generated output은 수기 편집하지 않는다. 특수 동작은 Stable ID를 수기 Behavior Registry에서 해석한다.
- Preview는 새 single-player `GameSimulation`만 만든다. 정상 Catalog, 실행 중인 Run, multiplayer에는 hot-swap하지 않는다.
- Sector 01 `1-1`·`1-7`은 manifest의 `source: generated` 선택과 `composeSectorCatalog` facade를 통해 일반 seamless 싱글·멀티 Runtime에서도 generated Area를 사용한다. 나머지 여섯 Stage는 같은 manifest에서 legacy provider를 선택한다.
- 두 Stage의 `AREA-SPEC.v2.json`은 cutover 시점의 최신 legacy Runtime route·Story 의미와 동등하게 정렬한 live authoring source다. 기존 `AREA-SPEC.json`은 파일명/schema 승격 전의 기획·검증 계약이므로 맵 에디터 Runtime source로 추론하지 않는다.
- `generateAreaCatalogs.mjs --check`는 두 Stage module과 generated catalog manifest module의 byte 최신성을 확인한다. `npm run check`가 이 명령을 포함하므로 v2 source나 manifest만 바꾸고 generated Runtime을 갱신하지 않은 candidate는 통과하지 못한다.

## 확인 명령

```powershell
node scripts/area-authoring-v2/generateAreaCatalogs.mjs --check
npm run check
```
