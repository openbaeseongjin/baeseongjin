# 맵 에디터 사용 가이드

## 시작

저장소 루트에서 다음 명령을 실행한다.

```powershell
node scripts/map-editor/serveMapEditor.mjs --port=4178
```

브라우저에서 `http://127.0.0.1:4178/map-editor/`을 연다. 서버는 loopback 주소만 수신하며 Sector 01~06의 48개 일반 Stage와 독립 Boss01·02·04·05 Stage를 표시한다. Stage 이름 뒤의 상태가 저장 적용의 범위를 알려 준다.

- `Runtime 적용`: Sector 01~06의 48개 Stage다. 저장 적용은 canonical v2 JSON과 generated JS를 갱신하고, manifest가 선택하는 현재 Sector Catalog에도 반영된다.
- `시나리오 전용`: 현재 0개다. 향후 Runtime 계약이 완결되지 않은 Stage를 추가할 때만 이 mode를 사용한다.
- `boss-01`·`boss-02`·`boss-04`·`boss-05`: `specType: "boss-stage"`인 Post-Sector Boss Stage다. 일반 Area와 섞지 않고 Boss 전용 JSON과 generated 정의를 함께 갱신한다.

## 저작 흐름

1. 스테이지를 고르고 왼쪽 `오브젝트 찾기`에서 Stable ID 또는 종류로 오브젝트를 찾는다.
2. 먼저 `0` 또는 `전체 보기`로 선택한 Stage의 전체 Bounds를 화면에 맞춘다. 시나리오 기준과 비교할 때는 `C` 또는 `시나리오 비교`를 열어 Runtime/v2 캔버스와 같은 Stage의 `MAP-PREVIEW.html`을 함께 본다.
3. 목록이나 캔버스에서 오브젝트를 선택한 뒤, 필요하면 `선택 집중`으로 화면 중앙에 가져온다.
4. 캔버스 또는 속성 패널에서 초안을 편집한다. 시작 지점과 아래 지지 플랫폼, 앵커 표식과 24×24 갈고리 부착 대상은 각각 함께 이동한다. 출구는 데크·출구점·Gate trigger·Gate panel·Gate visual·마지막 route point가 하나의 복합 객체로 이동한다. Entry·Exit는 Stage마다 각각 최대 1개이며 삭제 후 새 위치에 다시 추가할 수 있다. 복구·일반 경로·등록된 기본 Enemy slot을 추가할 수 있으며 적 슬롯은 위치·종류·허용 목록과 활성화 영역/설정을 편집한다.

Enemy의 `적 종류`는 실제 Runtime `AUTHORABLE_ENEMY_TYPE_IDS`를 사용하는 비어 있지 않은 다중 select다. 한 종류만 선택하면 고정 생성하고 둘 이상이면 run seed와 world revision이 같은 목록에서 결정적으로 선택한다. 별도 fallback 종류나 자유 문자열을 저장하지 않으며 Gameplay View와 실제 seamless Runtime이 같은 선택 계약을 사용한다.

Enemy 종류·activation anchor·Wind mode·Boss visual preset/mechanic/vulnerability/transition처럼 Runtime enum·Registry 또는 현재 Spec ID로 닫힌 값은 단일/다중 select로만 편집한다. Phase 이름·HUD 목표·UI 제목처럼 사람이 새 문구를 저작하는 값만 텍스트 입력으로 둔다. 5. **메모리 초안 저장**으로 v2 검증을 통과한 현재 Draft를 서버 메모리에 저장한다. 파일은 쓰지 않으며 이 상태부터 **Gameplay View**로 현재 변경을 확인할 수 있다. 6. **저장 적용**으로 v2 JSON을 갱신한다. Runtime Stage는 결정적 generated JS도 함께 갱신한다. stale revision, 읽기 전용 영역, 2 MiB 초과 요청은 거부된다. 7. **Gameplay View**는 `Runtime 적용` Stage를 production seamless compiler로 전체 월드에 조립하고 선택한 landmark에서 시작한다. 실제 게임 renderer·환경 표현·HUD·입력 경로를 그대로 사용하며 시나리오 전용 Stage에는 제공하지 않는다.

Boss Stage에서는 Arena·Entry/Exit·표면·Rope 경로·Recovery·Boss Actor·등록된 Mechanic·Phase 순서와 수·전환·HUD를 편집한다. `phases[].basePhaseHealth`, `combat.additionalPlayerMultiplier`, `combat.closedBodyDamageMultiplier`, `combat.weakFixedPercent`와 Beam Failure의 `failureProgress`가 피해·전환 저작 권위이며, Inspector의 1~4인 총 HP·Phase HP·floor·약점 고정 피해는 저장되지 않는 읽기 전용 파생값이다. Boss Preview는 메모리에 저장한 현재 Boss Stage Spec을 독립 `GameSimulation`의 전투 시작 상태로 열고 Player를 실제 Carriage 근처에 배치한 뒤 둘 사이를 framing해 Polygon mock·이동·Rope·일반 공격·Boss HUD를 즉시 확인한다. Boss01의 현행 기획 권위는 [`boss/01/README.md`](./boss/01/README.md) 한 문서이며 `legacy/`의 정적 Preview는 비교 패널에 노출하지 않는다. 실제 Stage 진입 위치와 진행 규칙은 바꾸지 않는다. 새 mechanic 종류는 Editor 텍스트만으로 만들 수 없고 먼저 코드 Registry와 validator를 추가해야 한다.

Boss의 Arena 경계는 캔버스 드래그와 Inspector X/Y로 이동할 수 있다. 표면·앵커·Recovery·Phase 구역은 데이터형 기본 요소이므로 추가·삭제할 수 있다. 새 Mechanic 종류·Boss 행동·전환 조건처럼 Runtime 코드 Registry가 필요한 개념은 에디터에서 생성하지 않고 코드에 등록된 선택지만 조합한다. 일반 Area Bounds는 원점 고정 크기 계약이므로 위치 입력을 표시하지 않고 너비·높이만 편집한다.

Boss의 MAP HTML이 catalog의 `mapReferencePath`로 등록되면 `시나리오 비교`가 그 HTML을 실제 Gameplay View의 공간 기준으로 읽기 전용 대조한다. Boss05의 최종 MAP HTML은 발판·Wall Slot·Core·Void·Recovery·탈출의 기준이며, Runtime spec은 이를 축약한 별도 arena를 만들 수 없다. Ropeable은 중심점 Anchor가 아니라 collision surface의 `grappleable: true` capability다. Anchor는 route 설명과 surface ID 참조만 소유하며 별도 non-collision grapple target을 생성하지 않는다.

왼쪽 레이어 목록은 `실게임 요소`, `표시형 오브젝트`, `규칙 / 설정`으로 구분한다. 표시형 오브젝트는 일반 Area의 맵 경계·복구/예상 경로·카메라 구역과 Boss의 Arena 경계·예상 Rope 경로·Recovery·Phase 구역을 포함하며, 실제 게임 오브젝트보다 낮은 선택·표현 우선순위를 가진다.

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
- `저장 버전`은 마지막 Git `HEAD` 기준과 각 `저장 적용` 직전의 Stage source snapshot을 보여 준다. `버전 복원`은 선택한 snapshot을 다시 적용할 뿐 새 version을 만들지 않는다. 이 local `.map-editor-history/` 기록은 commit·merge를 만들거나 Git history를 바꾸지 않으며, Stage별 최근 20개만 보관한다.
- 메모리 초안 저장은 로컬 v2 검사와 서버 검증을 통과한 Draft만 보관하며, 요청 중 상태와 최종 성공·실패를 상태 줄에 즉시 표시한다. 이후 Draft를 다시 수정하면 메모리 저장 상태와 Gameplay View 준비 상태를 해제한다.
- 시작 지점은 아래 지지 플랫폼 상단 32px을 기준으로 하는 최대 1개의 Entry 컴포넌트다. 둘은 독립 좌표로 편집하지 않으며 서버도 저장 전에 같은 이동량으로 다시 구성한다.
- 출구는 Stage당 최대 1개이며 데크 위치가 복합 객체 이동의 단일 권위다. 출구점·Gate trigger·Gate panel·Gate visual·출구 route point는 에디터와 서버가 데크 이동량에서 다시 구성하며 독립 좌표로 편집하지 않는다. `nextAreaId`, Gate ID와 해제 조건은 이동 대상이 아니며 일반 Runtime의 Stage 전환 계약을 유지한다.
- 해커톤 운영에서는 맵 에디터를 한 번에 한 명만 사용한다. 다중 사용자 mutex와 서버 crash까지 견디는 완전한 다중 파일 원자 저장은 후속 범위다.
- generated output은 수기 편집하지 않는다. 특수 동작은 Stable ID를 수기 Behavior Registry에서 해석한다.
- Boss Stage Apply도 진행 중 전투를 hot reload하지 않는다. 저장된 Spec은 다음 Boss Stage 시작 또는 새 게임에서만 읽으며, 참가자 수와 scaled Phase HP는 최초 Boss Stage 시작에서 고정한다.
- Gameplay View는 선택 Stage의 검증된 memory draft를 Area override로 주입해 `AuthoredSeamlessSectorRuntime`의 production world 전체를 만들고 canonical `stageId`에 해당하는 landmark에서 시작한다. 나머지 Stage와 compiler 계약은 production과 같고 출구를 바꾼 별도 preview world를 만들지 않으며 정상 Catalog, 실행 중인 Run, multiplayer에는 hot-swap하지 않는다.
- Gameplay View는 에디터 전용 polygon renderer가 아니라 `GameRendererFactory`의 실제 게임 renderer를 사용한다. production renderer가 숨기는 `renderable: false` surface도 동일하게 숨기며 상태 줄은 Stage 전체 surface 수와 실제 표시 수를 나눠 보여 준다.
- Gameplay View의 `저사양 비행 테스트` 패널은 Rope 입력을 끄고 WASD·방향키로 production world의 선택 Stage Bounds 안을 비행한다. 일반 Area와 Boss Preview 모두에서 제공하며, 이 상태는 Gameplay View 인스턴스만 소유하고 일반 게임·멀티플레이·맵 source에는 포함하지 않는다.
- Boss Preview의 `약점 타격`은 현재 노출된 약점에만 Preview 전용 normal Boss impact를 넣는다. Phase 번호·상태를 강제하지 않으며 실제 약점 판정·피해·전환을 사용한다.
- Sector 01~06의 48개 Stage는 `AREA-SPEC.v2.json → generated module → generated catalog → authored seamless compiler` 한 경로를 일반 싱글·멀티와 Gameplay View가 함께 사용한다. 수기 catalog, v1 AREA-SPEC, migration provenance 기반 복원과 실행 fallback은 없다.
- 기존 `AREA-SPEC-REV*-DESIGN.json`과 `MAP-PREVIEW.html`은 읽기 전용 기획 근거일 뿐 Editor Apply·generated catalog·Runtime fallback 입력이 아니다.
- `MAP-PREVIEW.html`은 시나리오의 지도 구성 비교 근거다. 비교 패널은 이 파일을 읽기 전용으로 표시할 뿐, v2 AREA-SPEC·generated JS·Runtime Catalog의 단일 권위를 대체하거나 저장 적용·미리보기·멀티플레이에 영향을 주지 않는다.
- 시나리오 입력은 `x/y`, `x/topY`, `cx/topY` 좌표 형식을 같은 지형 표면으로 정규화한다. 위치·크기가 없는 건축 설명은 임의 collision이나 좌표를 발명하지 않고 non-Runtime `AREA-SPEC-REV*-DESIGN.json` 기획 근거에만 남긴다. 그 Stage에 새 지형이 필요하면 canonical v2 Draft에서 명시적으로 추가해 저작한다.
- `generateAreaCatalogs.mjs --check`는 Sector 01~06의 generated module·catalog output byte 최신성을 확인한다. `validateProductionMapParity.mjs`는 48개 Stage의 authored/derived/hidden/progress-gated surface와 mismatch ID, seam·content-boundary·Access/Jammer/proof 소유권, 중복·퇴화 geometry와 금지 provenance 재도입을 확인한다. `npm run check`가 두 명령을 포함하므로 source·generated·production compiler가 어긋난 candidate는 통과하지 못한다.

## 실제 게임 반영 흐름

1. Editor는 선택 Stage의 `AREA-SPEC.v2.json`을 메모리 Draft로 연다.
2. **메모리 초안 저장**은 브라우저와 서버에서 구조·Runtime 불변식·읽기 전용 경계를 확인한 뒤 현재 Draft를 Gameplay View 입력으로 보관하지만 파일을 쓰지 않는다.
3. **Gameplay View**는 메모리 초안이 있으면 그 값을, 없으면 마지막 Apply source를 사용한다.
4. **저장 적용**은 v2 source를 갱신하고 `Runtime 적용` Stage라면 같은 transaction에서 결정적 generated JS를 다시 만든다.
5. Sector manifest/composer는 generated module을 실제 싱글·멀티 공용 World Catalog에 포함한다. `시나리오 전용` Stage는 v2 source만 저장하고 Runtime에는 연결하지 않는다.
6. 실행 중인 Run은 hot reload하지 않는다. 실제 게임은 새 게임·새 서버 세션부터 변경된 Catalog를 사용한다.

## Sector 04~06 Runtime 승격 게이트

시나리오 전용 Stage를 불완전한 Runtime으로 자동 전환하지 않는다. Editor는 각 Stage를 불러올 때 같은 v2 spec을 가상 `runtime` 모드로 검증하고 다음 차단 사유를 표시한다.

- `진행 Gate 미저작`: Runtime Area가 요구하는 exit trigger·조건이 없다.
- `다음 스테이지 전환 미정`: `nextAreaId`와 연결 계약이 확정되지 않았다.
- `콘텐츠 경계 전환 오류`: 3-8·4-8·5-8·6-8은 `nextAreaId: null`과 `completionMode: "content-boundary"`를 함께 소유해야 한다. compiler는 이 네 경계 뒤 Sector를 직접 연결하지 않는다.
- `충돌 지형 미저작`: 좌표 없는 기획 설명을 collision으로 추정하지 않는다.
- `적 Runtime 타입 미연결`: 기획용 적 ID가 Runtime Registry에 없다.

현재 Sector 01~~06의 48개 Stage는 모두 canonical v2/generated Runtime source이며 scenario-only Stage는 없다. Apply는 Stage source와 generated output을 함께 갱신하고 Gameplay View는 같은 production compiler·renderer로 결과를 표시한다. 1-1~~3-7의 기존 연결과 4-1~~4-7·5-1~~5-7·6-1~6-7의 Sector 내부 연결만 만들며, 3-8·4-8·5-8·6-8은 `content-boundary`로 끝나 Post-Sector Boss나 다음 Sector를 직접 연결하지 않는다.

Sector의 Access 해제 요구 수는 manifest의 `accessModuleRequirement`가 소유한다. 개별 module은 authored enemy의 `enemy-defeat` 또는 authored objective의 `objective-completion` source를 사용하며, 같은 module ID를 두 source가 가리켜도 shared progress에는 한 번만 수집된다. Sector 01~~03은 기존 3-of-3 enemy-defeat, Sector 04는 세 Resident Security Override objective 중 두 개를 요구하는 2-of-3, Sector 05~~06은 Access Module 없음이 현재 계약이다.

## 확인 명령

```powershell
node scripts/area-authoring-v2/generateAreaCatalogs.mjs --check
node scripts/map-editor/validateBossStageSpecs.mjs
node scripts/validateProductionMapParity.mjs
npm run check
```
