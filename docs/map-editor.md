# 맵 에디터 사용 가이드

## 시작

저장소 루트에서 다음 명령을 실행한다.

```powershell
node scripts/map-editor/serveMapEditor.mjs --port=4178
```

브라우저에서 `http://127.0.0.1:4178/map-editor/`을 연다. 서버는 loopback 주소만 수신하며 Sector 01~06의 48개 일반 Stage와 독립 `boss-01` Stage를 표시한다. Stage 이름 뒤의 상태가 저장 적용의 범위를 알려 준다.

- `Runtime 적용`: Sector 01~02의 16개 Stage다. 저장 적용은 v2 JSON과 generated JS를 갱신하고, manifest가 선택하는 현재 Sector Catalog에도 반영된다.
- `시나리오 전용`: Sector 03~06의 32개 Stage다. 승인된 시나리오 맵을 v2 원본으로 편집하며 게임 Runtime·진행·멀티플레이에는 적용하지 않는다.
- `boss-01`: `specType: "boss-stage"`인 Post-Sector Boss Stage다. 일반 Area와 섞지 않고 Boss 전용 JSON과 generated 정의를 함께 갱신한다.

## 저작 흐름

1. 스테이지를 고르고 왼쪽 `오브젝트 찾기`에서 Stable ID 또는 종류로 오브젝트를 찾는다.
2. 먼저 `0` 또는 `전체 보기`로 선택한 Stage의 전체 Bounds를 화면에 맞춘다. 시나리오 기준과 비교할 때는 `C` 또는 `시나리오 비교`를 열어 Runtime/v2 캔버스와 같은 Stage의 `MAP-PREVIEW.html`을 함께 본다.
3. 목록이나 캔버스에서 오브젝트를 선택한 뒤, 필요하면 `선택 집중`으로 화면 중앙에 가져온다.
4. 캔버스 또는 속성 패널에서 초안을 편집한다. 시작 지점과 아래 지지 플랫폼, 앵커 표식과 24×24 갈고리 부착 대상은 각각 함께 이동한다. 출구는 데크·출구점·Gate trigger·Gate panel·Gate visual·마지막 route point가 하나의 복합 객체로 이동한다. Entry·Exit는 Stage마다 각각 최대 1개이며 삭제 후 새 위치에 다시 추가할 수 있다. 복구·일반 경로·등록된 기본 Enemy slot을 추가할 수 있으며 적 슬롯은 위치·종류·허용 목록과 활성화 영역/설정을 편집한다.

Enemy의 `적 종류`는 실제 Runtime `AUTHORABLE_ENEMY_TYPE_IDS`를 사용하는 비어 있지 않은 다중 select다. 한 종류만 선택하면 고정 생성하고 둘 이상이면 run seed와 world revision이 같은 목록에서 결정적으로 선택한다. 별도 fallback 종류나 자유 문자열을 저장하지 않으며 단일 Area Preview와 실제 seamless Runtime이 같은 선택 계약을 사용한다.

Enemy 종류·activation anchor·Wind mode·Boss visual preset/mechanic/vulnerability/transition처럼 Runtime enum·Registry 또는 현재 Spec ID로 닫힌 값은 단일/다중 select로만 편집한다. Phase 이름·HUD 목표·UI 제목처럼 사람이 새 문구를 저작하는 값만 텍스트 입력으로 둔다.
5. **메모리 초안 저장**으로 v2 검증을 통과한 현재 Draft를 서버 메모리에 저장한다. 파일은 쓰지 않으며 이 상태부터 **새 미리보기**로 현재 변경을 확인할 수 있다.
6. **저장 적용**으로 v2 JSON을 갱신한다. Runtime Stage는 결정적 generated JS도 함께 갱신한다. stale revision, 읽기 전용 영역, 2 MiB 초과 요청은 거부된다.
7. **새 미리보기**는 `Runtime 적용`과 `Runtime 준비` Stage에서만 선택된 generated Area 하나의 새 로컬 싱글플레이 run을 실제 게임의 sprite renderer·환경 표현·HUD·입력 경로로 연다. 시나리오 전용 Stage에는 의도적으로 제공하지 않는다.

Boss Stage에서는 Arena·Entry/Exit·표면·Rope 경로·Recovery·Boss Actor·등록된 Mechanic·Phase 순서와 수·전환·HUD를 편집한다. `phases[].basePhaseHealth`, `combat.additionalPlayerMultiplier`, `combat.weakFixedPercent`가 HP 저작 권위이며, Inspector의 1~4인 총 HP·Phase HP·floor·약점 고정 피해는 저장되지 않는 읽기 전용 파생값이다. Boss Preview는 메모리에 저장한 현재 Boss Stage Spec을 독립 `GameSimulation`의 전투 시작 상태로 열어 이동·Rope·일반 공격·Boss HUD를 실제 게임 입력으로 확인한다. 새 mechanic 종류는 Editor 텍스트만으로 만들 수 없고 먼저 코드 Registry와 validator를 추가해야 한다.

맵 경계·시작 지점·출구·지형 표면·앵커·복구/경로·기존 적 슬롯·바람·카메라 구역은 편집 가능하다. 목표·출구의 목적지/해제 조건·스토리·스캐너·행동 레지스트리는 표시 전용이며 초안과 서버가 모두 변경을 거부한다. 위치가 있는 편집 요소는 드래그와 X/Y 수치 입력 모두 가장 가까운 5px 격자로 스냅하며, 카메라 구역의 최소/최대 Y도 같은 규칙을 따른다. 캔버스 드래그는 이동 중 임시 상태만 갱신하고 pointer release에서 되돌리기 한 건으로 확정한다.

Bounds는 삭제할 수 없다. Entry·Exit와 Surface·Anchor·Recovery/Route·Enemy·Wind·Camera는 Inspector의 `선택 요소 삭제` 또는 `Delete`로 초안에서 제거하며 Undo로 복구할 수 있다. Entry·Exit를 삭제한 동안 Draft는 검증 오류 상태이고 각각 하나를 다시 추가하거나 Undo해야 Apply할 수 있다. Anchor는 landmark/target 쌍을, Wind는 source/zone 쌍을 함께 삭제한다.

## 빠른 조작

- `0`: 전체 스테이지 보기, `C`: 시나리오 HTML 비교 열기/닫기, `F`: 선택한 위치로 집중, `Esc`: 선택 해제.
- `Ctrl/Cmd + Z`, `Ctrl/Cmd + Shift + Z`: 초안 되돌리기/다시 실행. 속성 패널 입력 중에는 브라우저의 일반 입력 편집을 우선한다.
- `Delete`: 선택한 비필수 편집 요소를 초안에서 삭제한다. 입력 필드에 포커스가 있으면 일반 문자 편집을 우선한다.
- 캔버스는 클릭으로 선택하고, 선택한 오브젝트만 5px 단위로 드래그해 이동한다. 속성 패널의 X/Y 입력도 5px 단위이며, 새 요소는 현재 캔버스 중심의 5px 격자 위치에 추가된다. 휠로 확대/축소하며 `Space + 드래그` 또는 가운데 버튼으로 화면을 이동한다.
- 각 캔버스 요소 위에는 `이름`과 실제 authoring 값에서 계산한 `효과`를 표시한다. 예를 들어 지형은 통과/부착 성질, 바람은 세기, 카메라는 데스크톱 배율을 보여 준다.
- Desktop은 캔버스를 화면 높이에 고정하고 좌측 목록과 속성 패널만 내부 스크롤한다. 작은 화면에서는 목록 → 캔버스 → 속성 패널 순서로 세로 배치된다.
- `시나리오 비교`는 데스크톱에서 전체 Bounds 캔버스와 같은 Stage `MAP-PREVIEW.html`의 SVG 지도를 나란히 놓고, 작은 화면에서는 캔버스 아래에 배치한다. 설명 패널은 숨겨 지도 전체를 우선 표시한다. 참조는 실행 격리된 읽기 전용 화면이며 Stage를 바꾸면 같은 Stage의 HTML로 함께 바뀐다.
- 상태 줄의 `저장되지 않은 초안`은 아직 파일에 쓰이지 않았음을 뜻한다. 저장 적용 단축키나 자동 저장은 없다.

## 권위와 안전 경계

- 초안은 브라우저 Draft에서 바뀌고 **메모리 초안 저장**을 누르면 검증된 현재 값이 서버 메모리에 복사된다. 파일은 변경하지 않으며, **저장 적용**을 누르기 전에는 v2 JSON·generated JS가 갱신되지 않는다.
- 저장 적용은 v2 구조와 실제 Runtime Area 불변식, 읽기 전용 경계를 확인하고 저장 직전에 현재 스테이지 source hash가 초안을 연 시점과 같은지 검사한다. 브라우저는 요청 중 저장 적용을 비활성화한다.
- 메모리 초안 저장은 로컬 v2 검사와 서버 검증을 통과한 Draft만 보관하며, 요청 중 상태와 최종 성공·실패를 상태 줄에 즉시 표시한다. 이후 Draft를 다시 수정하면 메모리 저장 상태와 Preview 준비 상태를 해제한다.
- 시작 지점은 아래 지지 플랫폼 상단 32px을 기준으로 하는 최대 1개의 Entry 컴포넌트다. 둘은 독립 좌표로 편집하지 않으며 서버도 저장 전에 같은 이동량으로 다시 구성한다.
- 출구는 Stage당 최대 1개이며 데크 위치가 복합 객체 이동의 단일 권위다. 출구점·Gate trigger·Gate panel·Gate visual·출구 route point는 에디터와 서버가 데크 이동량에서 다시 구성하며 독립 좌표로 편집하지 않는다. `nextAreaId`, Gate ID와 해제 조건은 이동 대상이 아니며 일반 Runtime의 Stage 전환 계약을 유지한다.
- 해커톤 운영에서는 맵 에디터를 한 번에 한 명만 사용한다. 다중 사용자 mutex와 서버 crash까지 견디는 완전한 다중 파일 원자 저장은 후속 범위다.
- generated output은 수기 편집하지 않는다. 특수 동작은 Stable ID를 수기 Behavior Registry에서 해석한다.
- Boss Stage Apply도 진행 중 전투를 hot reload하지 않는다. 저장된 Spec은 다음 Boss Stage 시작 또는 새 게임에서만 읽으며, 참가자 수와 scaled Phase HP는 최초 Boss Stage 시작에서 고정한다.
- Preview는 선택한 Stage 하나만 가진 새 single-player `GameSimulation`을 만들고, 시작 시 Area 수와 ID를 다시 확인해 상태 줄에 표시한다. 프리뷰 복제본의 출구는 content boundary로 끝내지만 Apply된 Area의 `nextAreaId`는 바꾸지 않는다. 정상 Catalog, 실행 중인 Run, multiplayer에는 hot-swap하지 않는다.
- Preview는 에디터 전용 polygon renderer를 쓰지 않고 실제 게임 renderer를 쓴다. 서버 메모리의 Area/Boss Stage Spec과 player/enemy/direction 리소스를 병렬로 준비하고, 선택 Area의 환경 정의만 추가로 불러온다. isolated `GameSimulation`을 먼저 만든 뒤 `GameApp`에 주입하므로 전체 Seamless Runtime을 만들었다가 교체하지 않는다. 고해상도 화면에서는 Preview 전용 backing canvas를 최대 2M 화소·최대 1배, 최저 0.5배로 제한해 과도한 GPU/Canvas 작업을 피하며, 일반 게임의 해상도 정책은 바꾸지 않는다.
- 일반 Area Preview의 `저사양 비행 테스트` 패널을 켜면 Rope 입력을 끄고 WASD·방향키로 맵 Bounds 안을 비행한다. 이 상태는 Preview 인스턴스만 소유하며 일반 게임·Boss Preview·멀티플레이·맵 source에는 포함하지 않는다.
- Sector 01~02의 16개 Stage와 Sector 03의 3-1·3-2는 manifest의 `source: generated` 선택과 각 `composeSectorCatalog` facade를 통해 일반 seamless 싱글·멀티 Runtime에서도 generated Area를 사용한다. 각 v2 source는 cutover 시점의 Runtime 의미를 소유한다. 메인 개발자와의 분리 경계는 facade·진행·멀티플레이 권위에 남기고, 에디터는 v2 source·generator·generated module만 소유한다.
- Sector 03~06의 `AREA-SPEC.v2.json`은 각 `AREA-SPEC-REV*-DESIGN.json`의 지도 편집 투영과 원본 snapshot을 보존하는 `scenario-only` source다. 기존 design JSON은 migration 입력/근거이며, Editor Apply는 v2 source만 갱신한다.
- `MAP-PREVIEW.html`은 시나리오의 지도 구성 비교 근거다. 비교 패널은 이 파일을 읽기 전용으로 표시할 뿐, v2 AREA-SPEC·generated JS·Runtime Catalog의 단일 권위를 대체하거나 저장 적용·미리보기·멀티플레이에 영향을 주지 않는다.
- 시나리오 입력은 `x/y`, `x/topY`, `cx/topY` 좌표 형식을 같은 지형 표면으로 정규화한다. 위치·크기가 없는 건축 설명은 임의 collision이나 좌표를 발명하지 않고 원본 snapshot에 남긴다. 그 Stage에 새 지형이 필요하면 v2 Draft에서 명시적으로 추가해 저작한다.
- `generateAreaCatalogs.mjs --check`는 Sector 01과 Sector 02의 generated module·catalog output byte 최신성을 확인한다. `npm run check`가 이 명령을 포함하므로 v2 Runtime source나 manifest만 바꾸고 generated output을 갱신하지 않은 candidate는 통과하지 못한다.

## 실제 게임 반영 흐름

1. Editor는 선택 Stage의 `AREA-SPEC.v2.json`을 메모리 Draft로 연다.
2. **메모리 초안 저장**은 브라우저와 서버에서 구조·Runtime 불변식·읽기 전용 경계를 확인한 뒤 현재 Draft를 Preview 입력으로 보관하지만 파일을 쓰지 않는다.
3. **새 미리보기**는 메모리 초안이 있으면 그 값을, 없으면 마지막 Apply source를 사용한다.
4. **저장 적용**은 v2 source를 갱신하고 `Runtime 적용` Stage라면 같은 transaction에서 결정적 generated JS를 다시 만든다.
5. Sector manifest/composer는 generated module을 실제 싱글·멀티 공용 World Catalog에 포함한다. `시나리오 전용` Stage는 v2 source만 저장하고 Runtime에는 연결하지 않는다.
6. 실행 중인 Run은 hot reload하지 않는다. 실제 게임은 새 게임·새 서버 세션부터 변경된 Catalog를 사용한다.

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
node -e "import {createMapEditorAuthoringServer} from './scripts/map-editor/MapEditorAuthoringServer.mjs'; const server=await createMapEditorAuthoringServer({projectRoot:process.cwd()}); console.log((await server.readStage('boss-01')).derivedPreview);"
npm run check
```
