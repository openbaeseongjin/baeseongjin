# 맵 에디터 사용 가이드

## 시작

저장소 루트에서 다음 명령을 실행한다.

```powershell
node scripts/map-editor/serveMapEditor.mjs --port=4178
```

브라우저에서 `http://127.0.0.1:4178/map-editor/`을 연다. 서버는 loopback 주소만 수신하며 Sector 01~06의 48개 Stage를 모두 표시한다. Stage 이름 뒤의 상태가 저장 적용의 범위를 알려 준다.

- `Runtime 적용`: Sector 01~02의 16개 Stage다. 저장 적용은 v2 JSON과 generated JS를 갱신하고, manifest가 선택하는 현재 Sector Catalog에도 반영된다.
- `시나리오 전용`: Sector 03~06의 32개 Stage다. 승인된 시나리오 맵을 v2 원본으로 편집하며 게임 Runtime·진행·멀티플레이에는 적용하지 않는다.

## 저작 흐름

1. 스테이지를 고르고 왼쪽 `오브젝트 찾기`에서 Stable ID 또는 종류로 오브젝트를 찾는다.
2. 목록이나 캔버스에서 오브젝트를 선택한 뒤, 필요하면 `선택 집중`으로 화면 중앙에 가져온다.
3. 캔버스 또는 속성 패널에서 초안을 편집한다. 앵커 표식과 24×24 갈고리 부착 대상은 항상 함께 이동하며, 복구·경로 지점은 각각 추가할 수 있다. 적 슬롯은 위치·종류·허용 목록과 활성화 영역/설정을 편집한다.
4. **초안 검증**으로 파일을 쓰지 않는 v2 검증을 실행한다.
5. **저장 적용**으로 v2 JSON을 갱신한다. Runtime Stage는 결정적 generated JS도 함께 갱신한다. stale revision, 읽기 전용 영역, 2 MiB 초과 요청은 거부된다.
6. **새 미리보기**는 `Runtime 적용`과 `Runtime 준비` Stage에서만 선택된 generated Area 하나의 새 로컬 싱글플레이 run을 연다. `시나리오 전용` Stage에는 의도적으로 제공하지 않는다.

맵 경계·시작 지점·지형 표면·앵커·복구/경로·기존 적 슬롯·바람·카메라 구역은 편집 가능하다. 목표·진행·스토리·스캐너·행동 레지스트리는 표시 전용이며 초안과 서버가 모두 변경을 거부한다. 캔버스 드래그는 이동 중 임시 상태만 갱신하고 pointer release에서 되돌리기 한 건으로 확정한다.

## 빠른 조작

- `0`: 전체 스테이지 보기, `F`: 선택한 위치로 집중, `Esc`: 선택 해제.
- `Ctrl/Cmd + Z`, `Ctrl/Cmd + Shift + Z`: 초안 되돌리기/다시 실행. 속성 패널 입력 중에는 브라우저의 일반 입력 편집을 우선한다.
- 캔버스는 클릭으로 선택하고, 선택한 오브젝트만 드래그해 이동한다. 휠로 확대/축소하며 `Space + 드래그` 또는 가운데 버튼으로 화면을 이동한다.
- 각 캔버스 요소 위에는 `이름`과 실제 authoring 값에서 계산한 `효과`를 표시한다. 예를 들어 지형은 통과/부착 성질, 바람은 세기, 카메라는 데스크톱 배율을 보여 준다.
- Desktop은 캔버스를 화면 높이에 고정하고 좌측 목록과 속성 패널만 내부 스크롤한다. 작은 화면에서는 목록 → 캔버스 → 속성 패널 순서로 세로 배치된다.
- 상태 줄의 `저장되지 않은 초안`은 아직 파일에 쓰이지 않았음을 뜻한다. 저장 적용 단축키나 자동 저장은 없다.

## 권위와 안전 경계

- 초안은 메모리 안에서만 바뀐다. 초안 검증은 파일을 변경하지 않으며, **저장 적용**을 누르기 전에는 v2 JSON·generated JS가 갱신되지 않는다.
- 저장 적용은 v2 구조와 실제 Runtime Area 불변식, 읽기 전용 경계를 확인하고 저장 직전에 현재 스테이지 source hash가 초안을 연 시점과 같은지 검사한다. 브라우저는 요청 중 저장 적용을 비활성화한다.
- 해커톤 운영에서는 맵 에디터를 한 번에 한 명만 사용한다. 다중 사용자 mutex와 서버 crash까지 견디는 완전한 다중 파일 원자 저장은 후속 범위다.
- generated output은 수기 편집하지 않는다. 특수 동작은 Stable ID를 수기 Behavior Registry에서 해석한다.
- Preview는 새 single-player `GameSimulation`만 만든다. 정상 Catalog, 실행 중인 Run, multiplayer에는 hot-swap하지 않는다.
- Sector 01~02의 16개 Stage는 manifest의 `source: generated` 선택과 각 `composeSectorCatalog` facade를 통해 일반 seamless 싱글·멀티 Runtime에서도 generated Area를 사용한다. 각 v2 source는 cutover 시점의 legacy Runtime과 의미 동등하게 추출했다. 메인 개발자와의 분리 경계는 facade·진행·멀티플레이 권위에 남기고, 에디터는 v2 source·generator·generated module만 소유한다.
- Sector 03~06의 `AREA-SPEC.v2.json`은 각 `AREA-SPEC-REV*-DESIGN.json`의 지도 편집 투영과 원본 snapshot을 보존하는 `scenario-only` source다. 기존 design JSON은 migration 입력/근거이며, Editor Apply는 v2 source만 갱신한다.
- 시나리오 입력은 `x/y`, `x/topY`, `cx/topY` 좌표 형식을 같은 지형 표면으로 정규화한다. 위치·크기가 없는 건축 설명은 임의 collision이나 좌표를 발명하지 않고 원본 snapshot에 남긴다. 그 Stage에 새 지형이 필요하면 v2 Draft에서 명시적으로 추가해 저작한다.
- `generateAreaCatalogs.mjs --check`는 Sector 01과 Sector 02의 generated module·catalog output byte 최신성을 확인한다. `npm run check`가 이 명령을 포함하므로 v2 Runtime source나 manifest만 바꾸고 generated output을 갱신하지 않은 candidate는 통과하지 못한다.

## Sector 03~06 Runtime 승격 게이트

시나리오 전용 Stage를 불완전한 Runtime으로 자동 전환하지 않는다. Editor는 각 Stage를 불러올 때 같은 v2 spec을 가상 `runtime` 모드로 검증하고 다음 차단 사유를 표시한다.

- `진행 Gate 미저작`: Runtime Area가 요구하는 exit trigger·조건이 없다.
- `다음 스테이지 전환 미정`: `nextAreaId`와 연결 계약이 확정되지 않았다.
- `충돌 지형 미저작`: 좌표 없는 기획 설명을 collision으로 추정하지 않는다.
- `적 Runtime 타입 미연결`: 기획용 적 ID가 Runtime Registry에 없다.

현재 Sector 03~06의 32개 Stage는 모두 이 승격 검증을 통과하지 못한다. Scenario v2의 Apply는 계속 원본을 저장하지만, Runtime Catalog·seamless world·진행·멀티플레이에는 쓰지 않는다. 승격은 Stage별로 Runtime 계약을 저작한 뒤 `runtime` source, generated manifest, Sector facade를 같은 변경에서 추가하는 별도 작업이다. 이 경계 덕분에 메인 개발자는 facade·진행·멀티플레이 권위를 독립적으로 구현할 수 있다.

## 확인 명령

```powershell
node scripts/area-authoring-v2/generateAreaCatalogs.mjs --check
npm run check
```
