# 맵 에디터 v2 저작 기반 설계

## 상태와 목적

이 설계는 통합 맵 에디터의 첫 번째 비시각 마일스톤을 구현한다. 현재 브라우저 Runtime 계약을 유지하면서 수기로 중복 저작한 맵 데이터를 통제된 `AREA-SPEC v2 → 생성 Runtime JS Catalog` 경로로 바꾼다.

이 마일스톤은 Stage `1-1`과 `1-7`만 migration한다. 48개 Stage 전체에 반복 적용할 migration 경로를 확립하며, 시각 에디터는 아직 만들지 않는다.

## 제품 계약

- 장기 canonical 저작 원본은 `AREA-SPEC v2`다. 모든 Stage를 명시적으로 migration하며, 생성 파일의 존재만으로 Runtime source를 추론하지 않는다.
- 에디터는 장차 Stage를 불러와 Bounds·Entry, terrain surface, 표식과 24×24 부착 target을 묶은 Anchor, Recovery·Route, 기존 Enemy slot의 activation·허용 적, Wind source·zone·cycle, Camera zone을 시각적으로 편집한다.
- Objective·Progression·Story·Scanner·수기 Behavior Registry는 에디터에서 보이되 읽기 전용이다. 정적 데이터는 v2에 남기고, 동작 알고리즘만 Registry에 Stable ID로 참조한다.
- 편집기는 in-memory Draft만 소유한다. `Apply`는 v2 JSON 저장·JS 재생성·validation 성공 뒤에만 선택 Stage의 새 싱글플레이 미리보기를 시작한다. 실행 중인 게임과 멀티플레이 세션은 hot-swap하지 않는다.

## 첫 마일스톤 범위

v2 schema·validator, 결정적 generator, cutover manifest 데이터·validator, behavior reference registry, migration한 두 Stage spec, 생성 JS, `1-1`·`1-7` parity test, 메인 개발자에게 넘길 integration contract를 추가한다.

시각 에디터, 나머지 46개 Stage의 일괄 migration, gameplay 규칙 변경, 브라우저 JSON 직접 로드, 월드 hot-swap, 멀티플레이 권한 변경은 포함하지 않는다. 이 source lane에서는 기존 Sector facade와 seamless Runtime 통합 파일도 수정하지 않는다.

## 협업 경계 — 최우선 제약

메인 개발자와 병렬로 진행할 수 있도록 이 작업은 source를 분리한다. 이는 다른 구현 편의·속도보다 우선하는 L1 협업 제약이다. v2 lane은 새 경로만 소유한다. 수기 v2 schema·validation·generation·registry·composition contract 코드는 `src/game/world/area-authoring-v2/`, 결정적 출력은 `src/game/world/areas/generated/`, 격리 Node 명령은 `scripts/area-authoring-v2/`, 그리고 focused v2 test, migration한 두 Stage spec, 이 설계의 handoff 자료에 둔다.

병렬로 활성일 수 있는 통합 파일은 메인 개발자가 소유한다. 현재 `Sector01AreaCatalog`, legacy provider 분리, `LegacyAreaSeamlessSectorRuntime`, 루트 `package.json` script, 공용 test runner 등록, 전역 scenario-integration 상태가 이에 해당한다. 이 lane은 이를 수정하지 않는다. 대신 검증된 manifest 데이터와 legacy/generated Stage definition을 받아 현재 catalog 모양을 돌려주고 모든 source-selection 위반을 거부하는 `composeSectorCatalog` 입·출력 API 하나를 작고 테스트된 공개 계약으로 인계한다.

메인 개발자는 이 계약을 얇은 Sector facade에 적용하고 최종 Runtime cutover 근거를 소유한다. 그 전까지 이 lane은 generated와 legacy의 의미 동등성만 독립적으로 증명하며, live Sector 01 Runtime이 generated Stage를 사용한다고 주장하지 않는다.

## 소유권과 데이터 흐름

```text
AREA-SPEC.v2.json (source-lane candidate) ─┐
AREA-CATALOG.json (source manifest) ─┼─> Node 검증과 생성
수기 Behavior Registry ─────────────┘             │
                                                   ├─> generated Stage JS와 정적 source index
legacy Stage provider ─────────────────────────────┤
                                                   └─> integration contract ─> 얇은 Sector Catalog facade
                                                            │
                                                            v
                                                  기존 defineAreaCatalog Runtime 계약
```

source-isolated lane은 기존 루트 v1 validator를 바꾸지 않으므로, migration 후보를 우선 `AREA-SPEC.v2.json` sidecar에 기록한다. 메인 개발자가 root validator와 Sector facade를 같은 통합 변경에서 연결할 때에만 sidecar를 canonical `AREA-SPEC.json` v2로 승격한다. 기존 v1 spec은 각자의 migration 전까지 v1로 남긴다. v2 후보는 서술 문서가 아니라 실행 중인 legacy area definition에서 도출하므로, legacy definition을 독립적인 의미 동등성 기준으로 사용할 수 있다. 현재 첫 두 후보는 `docs/bsh/scenario/1/1-1/AREA-SPEC.v2.json`, `docs/bsh/scenario/1/1-7/AREA-SPEC.v2.json`이며, `scripts/area-authoring-v2/extractLegacyStageSpecs.mjs --write`는 현재 legacy Catalog에서 이 초기 migration 입력을 명시적으로 만드는 bootstrap일 뿐 이후 편집 경로가 아니다.

generator는 Node build-time 도구다. `src/game/world/areas/generated/` 아래에만 결정적이고 Git에 포함되는 JS를 내보낸다. 생성물은 generated header를 가지며 전체 집합으로 덮어쓴다. Runtime ES module은 생성된 정적 import를 사용하고 저작 JSON을 직접 해석하지 않는다.

## v2 Stage 계약

v2 spec은 stable `stageId`, Runtime `areaId`, Sector identity, bounds·entry와 surface, anchor, recovery·route, encounter slot, wind, camera, objective, progression, story, scanner, behavior reference 데이터 section을 가진다.

모든 편집 가능한 entity에는 stable local ID가 있다. Anchor는 보이는 landmark와 24×24 grapple target을 함께 가진 하나의 의미 객체이며, 둘을 독립적으로 편집하는 것은 유효하지 않다. 읽기 전용 section도 schema 검증과 동일한 출력 대상이지만, 미래 에디터는 이를 변경하는 control을 제공하지 않는다.

`behaviorRefs`에는 등록된 Stable ID와 명시적인 data argument만 담는다. 실행 source, module path, callback, 임의 import를 담을 수 없다. 수기 `AreaBehaviorRegistry`가 Stable ID에서 runtime factory로의 mapping을 소유한다. generator와 validator는 어떤 출력도 쓰기 전에 알 수 없는 reference를 거부한다.

## Cutover 계약

`docs/bsh/scenario/AREA-CATALOG.json`은 명시적 v2 cutover manifest 후보다. 합성 Runtime catalog에 참여하는 각 Stage에 stable Stage ID, Runtime Area ID, Sector, `source: "legacy" | "generated"`, 권위 source 경로를 기록한다. 초기 manifest는 Sector 01의 여덟 Stage entry를 모두 담으며, `1-1`·`1-7`은 generated 후보이고 나머지 여섯 개는 legacy다. 메인 개발자가 facade를 연결하기 전에는 이 manifest가 live Runtime source를 전환하지 않는다.

manifest만 source selector다. build-time validation은 예상 Sector Stage가 정확히 한 번 존재하는지, source가 하나인지, identity triple·source 경로가 맞는지, generated entry에는 output module이 있는지를 확인한다. 중복·누락·미지의 항목·필드 overlay source 선택은 거부한다.

integration contract는 기존 Sector 01 definition을 legacy Stage provider 뒤로 옮기고, `Sector01AreaCatalog`가 생성된 manifest 선택에 따라 legacy provider와 generated Stage index를 합성하는 얇은 facade가 되도록 명세한다. 선택한 generated Stage는 legacy Stage definition 전체를 교체하며 legacy object와 병합하지 않는다. 메인 개발자가 이 계약을 적용해 facade가 현재 seamless-sector Runtime이 쓰는 정확한 `defineAreaCatalog` 형태를 계속 export하도록 한다.

## 생성과 검증

generator는 결정적이다. 같은 validation을 통과한 v2 spec, manifest, registry version, generator version은 byte-identical output을 만들어야 한다. 선택한 output 집합의 생성은 all-or-nothing이며 validation 실패는 생성 파일을 덮어쓰지 않는다.

명령 계약은 다음과 같다.

- 메인 개발자 통합 뒤 `npm run validate:area-specs`는 선언한 schema version에 따라 v1·v2 file을 검증하고, 합성 catalog의 cutover manifest를 검증한다.
- 격리된 `scripts/area-authoring-v2/` 명령은 먼저 validation하고 generated output 경로에만 쓴다.
- `--check` mode는 메모리에서 재생성하고 Git에 포함된 generated file이 없거나 stale하면 실패한다.
- 메인 개발자는 integration facade가 준비되면 이 명령을 `npm run generate:area-catalogs`, `npm run check`에 연결한다. 이 lane은 루트 script를 바꾸지 않고 command contract를 제공한다.

기존 `AreaDefinition` helper와 `AreaDefinitionValidator`는 Runtime 공개 계약으로 남는다. generated module은 이 helper를 사용한다. v2 validator는 저작 오류를 더 일찍 발견하고 기존 Runtime validator는 생성한 catalog를 계속 방어한다.

## Parity와 안전성 test

`1-1`·`1-7`에는 현재 legacy Stage definition과 v2/generation counterpart를 import하는 semantic parity fixture를 둔다. `createAreaDefinitionFromV2(spec)`, generated export, manifest composer 결과를 legacy Catalog 값과 깊게 비교해 Runtime 관련 area identity, bounds, entry, surface·property, grapple target·landmark object, recovery·route, encounter slot·activation bounds, wind, camera, objective, progression, story, scanner, behavior reference가 같은지 단언한다.

focused test는 유효하지 않은 v2 ID·geometry, 잘못 짝지은 Anchor, 읽기 전용 mutation policy metadata, 알 수 없는 behavior reference, 비결정적·stale output, 모든 manifest failure mode도 다룬다. integration test는 합성한 Sector 01 catalog에 `1-1`·`1-7`이 하나씩 있고 중복 Area ID 없이 seamless-sector Runtime까지 compile되는지 확인한다.

이 lane은 focused test와 generated-output check를 실행한다. 통합 뒤 최종 candidate에서 `npm test`, `npm run check`, `npm run format:check`을 한 번 실행하고 ledger에 기록하는 책임은 메인 개발자가 가진다. 이 마일스톤은 Canvas 동작을 바꾸지 않으므로 실제 브라우저 검증은 미래 시각 에디터 UI 때 필요해진다.

## Migration과 rollback

migration은 Stage 단위이며 원자적이다. 완료한 Stage는 generated output을 즉시 쓸 수 있고 migration하지 않은 Stage는 legacy JS를 유지한다. 병합 전 failure는 manifest entry를 `legacy`로 되돌린다. 필드별 fallback·예외 override·`generated/` 안 수기 편집은 허용하지 않는다.

다음 Stage migration은 같은 순서를 반복한다. 실행 legacy definition에서 v2를 도출하고, semantic parity를 세우고, 생성하고, manifest entry를 전환하고, 합성 Runtime을 검증한다. manifest는 Runtime catalog coverage와 함께 커지며, 최종적으로 48개 Stage 모두가 v2 source로 표현된다.

## 완료 기준

- 이 lane은 기존 Runtime entrypoint를 바꾸지 않고 canonical 승격 후보인 v2 `1-1`·`1-7` sidecar, 결정적 생성물, semantic parity 근거, 검증된 integration contract를 제공한다.
- 메인 개발자는 명시적 manifest를 Sector 01에 적용하고 seamless Runtime을 통해 변경 없는 catalog API를 검증한다. 이때만 `1-1`·`1-7`이 원자적으로 선택된 live Runtime Stage가 된다.
- generated output은 결정적·완전하며 수기 저작하지 않는다.
- Registry reference는 stable하고 검증되며 수기 동작으로 가는 유일한 경로다.
- semantic parity와 필요한 validation suite가 통과하고, scenario-integration 상태는 UI 또는 48개 전체 완료를 주장하지 않고 실제 migration 근거를 기록한다.
