# AREA-SPEC AUTHORING STANDARD

*IMPLEMENTATION CONTRACT LAYER · REV 1.2*

이 문서는 `docs/bsh/scenario/<sector>/<stage>/AREA-SPEC.json`의 목적, 스키마, 검증 규칙을 정의한다. Stage 문서를 새로 쓰거나 기존 Stage에 `AREA-SPEC.json`을 추가할 때 이 문서를 먼저 확인한다.

REV 1.2 변경 요약: 같은 Sector 안의 Stage 지형은 Run 시작부터 정적이라는 현재 계약에 맞춰 `progression`을 논리 objective 관계로 한정했다. `requiredObjectiveIds`와 호환 mode 이름은 Stage surface를 추가·제거하거나 세로 barrier를 만드는 지시가 아니다. 물리 잠금은 Sector 간 `access-transit-lock`만 소유한다. REV 1.1에서 확정한 Local ID·Route shape·Runtime dependency·extent 검증 규칙은 유지한다.

## 0. 현재 Runtime 구조 — 반드시 먼저 이해할 것

현재 기본 제품 Runtime은 `Area 1-1 → Area 1-2 → Area 1-3 ...`처럼 단순 연결된 구조가 **아니다**. (`src/game/world/sectors/LegacyAreaSeamlessSectorRuntime.js`, `#625`)

```text
Sector
 ├ Landmark 01 = legacy Stage 1-1
 ├ Landmark 02 = legacy Stage 1-2
 ├ ...
 └ Landmark 08 = legacy Stage 1-8
```

파이프라인:

```text
AREA-SPEC Stage (기획 확정값)
→ legacy Stage-local implementation source (SectorXXAreaCatalog.js의 defineArea())
→ Area Catalog / related presentation-system authoring (AreaDefinition.js helper, AuthoredStoryPresentation.js)
→ Seamless Sector compiler (LegacyAreaSectorPreviewCatalog.js → LegacyAreaSeamlessSectorRuntime.js)
→ Sector Landmark Runtime (실제 플레이어가 보는 최종 상태)
```

핵심 사실:

- `SectorXXAreaCatalog.js`의 개별 Area(`defineArea()`)는 여전히 **geometry/system의 source**로 쓰인다. 이 계층은 없어지지 않았다.
- 실제 진행 권위는 legacy per-Area Gate portal이 아니라 **Seamless Sector의 landmark·objective·Sector transition**에 있다. 같은 Sector의 Stage 이동은 objective와 독립된 정적 geometry를 사용한다.
- Legacy Area의 `gate.requiredObjectiveIds`는 Stage 저작 의미와 objective prerequisite를 보존하는 호환 입력이다. 이를 intra-Sector connector의 `requiredRouteId` 또는 `blockedByRouteId`로 변환해 지형을 생성·제거하지 않는다. Per-Area Gate portal 자체는 최종 Runtime output에 없다(`gates: []`).
- Sector 간 이동만 `access-transit-lock`이 Access Module 3-of-3과 source objective를 요구하며, visual과 collider를 같은 `barrierSegments`에서 파생한다.
- Canonical landmark ID(예: `sector-01:landmark:01`)는 `stage.sector`/`stage.stage` 순서에서 파생되며, **JSON에 수동으로 중복 기록하지 않는다.**

이 구조를 알아야 `stage`/`sourceExit`/`progression` 필드가 왜 지금 모양인지 이해할 수 있다(§2-1, §2-2).

## 1. 네 계층의 Source of Truth

| 계층 | 소유 내용 | 소유자 |
|---|---|---|
| `README.md` | **WHY / EXPERIENCE** — 공간 의도, Story, Gameplay 의미 | 기획 |
| `AREA-SPEC.json` | **WHAT EXACTLY** — 구현 계약(좌표, ID, preset, 참조 무결성) | 기획 확정값 |
| `src/game/**` | **ACTUAL RUNTIME** — 실제 동작하는 코드 | 구현 |
| `PRODUCTION-ALIGNMENT.md` | **MATCH STATUS** — 위 세 계층이 실제로 일치하는지 | 검증 |

`AREA-SPEC.json`은 `AreaDefinition`(legacy Area 소스) 자체가 곧 최종 Runtime이라는 뜻이 아니다 — §0의 파이프라인 중 **"legacy Stage-local implementation source"** 단계의 계약이다. 최종 Runtime 정체성(Sector landmark)은 그 뒤 compiler가 결정한다.

충돌 시 자동으로 어느 한쪽을 덮어쓰지 않는다. 차이가 발견되면 `PRODUCTION-ALIGNMENT.md`에 기록하고, 사람이 "기획 변경인지 구현 버그인지"를 판정한다.

## 2. 스키마 개요 — `area-spec-v1`

최상위 필드는 반드시 `"schemaVersion": "area-spec-v1"`를 포함한다. 지원 필드:

```text
stage, bounds, entry
surfaces, grappleTargets, enemies
scannerGroups, windZones
objectives
route, recovery
sourceExit, progression
camera
story
runtimeDependencies
forbidden
acceptanceTests
```

전체 예시는 [`AREA-SPEC-TEMPLATE.json`](./AREA-SPEC-TEMPLATE.json)과 실제 구현 예시 [`1/1-1/AREA-SPEC.json`](./1/1-1/AREA-SPEC.json)을 참고한다. `AREA-SPEC-TEMPLATE.json`은 실제 Stage가 아니며 `<sector>/<stage>/AREA-SPEC.json` 경로에 있지 않으므로 `npm run validate:area-specs`의 stage-count에 포함되지 않는다.

### 2-1. `stage` — Stage Identity

```json
{
    "stage": {
        "sector": 1,
        "stage": 1,
        "legacyStageAlias": "1-1",
        "sourceAreaId": "sector-01-01",
        "runtimeModel": "seamless-sector-landmark-v1",
        "name": "SERVICE SHAFT",
        "subtitle": "VERTICAL GRID CASCADE FAILURE"
    }
}
```

의미(§0 참고):

- `legacyStageAlias` — `"1-1"` 같은 **기획/presentation identity**. `LegacyAreaSectorPreviewCatalog.js`가 `landmark.legacyStageAlias`로 그대로 사용한다.
- `sourceAreaId` — `"sector-01-01"` 같은 **legacy Area authoring source ID**. `SectorXXAreaCatalog.js`의 `defineArea({ id: ... })`와 대응한다. **최종 Runtime ID가 아니다.**
- `runtimeModel` — 이 Stage가 컴파일되는 Runtime 모델. 현재 KNOWN 값은 `seamless-sector-landmark-v1` 하나뿐이다.
- Canonical landmark ID(`sector-01:landmark:01`)는 여기 저장하지 않는다 — `sector`/`stage` 순서에서 파생 가능하기 때문이다(`SectorDefinition.canonicalLandmarkId`와 동일한 규칙: `${sector-id}:landmark:${order.padStart(2,"0")}`).

검증기는 폴더 경로(`docs/bsh/scenario/<sector>/<stage>/`)와 `stage.sector`/`stage.stage`/`stage.legacyStageAlias`/`stage.sourceAreaId`가 모두 일치하는지 확인한다.

### 2-2. `sourceExit` + `progression` — Exit vs Progression

과거 `exitBlock` 하나로 뭉쳐 있던 것을 두 계층으로 분리한다:

```json
{
    "sourceExit": {
        "deckX": 128,
        "deckTopY": -835,
        "deckWidth": 320,
        "panelObjectiveId": "terminal-read"
    },
    "progression": {
        "targetStageAlias": "1-2",
        "mode": "objective-gated-connector",
        "requiredObjectiveIds": ["terminal-read"]
    }
}
```

- `sourceExit` — **legacy source geometry**. `AreaDefinition.exitBlock()` helper가 필요로 하는 최소 입력(데크 위치/폭, panel objective)이다. `deck`, `exit`, `routeExit`, `panel`, `gateVisual`, `reachBounds`, `gate` 같은 파생 오브젝트를 만드는 데 쓰이지만, 이 자체가 Runtime 진행 권위는 아니다. `nextAreaId`는 여기 없다 — Stage 순서에 따라 catalog 배선(`connectArea()`류)이 구조적으로 결정하는 것이지 Stage 저작자가 선언하는 값이 아니다.
- `progression` — Stage가 다음 Stage와 맺는 **논리 objective 관계와 authoring handoff**다. 같은 Sector의 connector collision을 잠그거나 surface를 동적으로 생성·제거하는 물리 권위가 아니다.
  - `targetStageAlias` — 다음 Stage의 `legacyStageAlias`(예: `"1-2"`). Sector/Post-Sector Boss 경계처럼 실제 content boundary일 때만 `null`.
  - `mode` — 현재 KNOWN 값 `objective-gated-connector`는 기존 JSON·validator 호환 이름이다. 이름과 달리 intra-Sector 물리 connector를 gate하지 않는다.
  - `requiredObjectiveIds` — `objectives[].id`를 참조하는 Local ID 배열.

이 분리의 목적은 "legacy source geometry"와 "실제 Seamless Runtime 진행"을 혼동하지 않는 것이다. per-Area Gate portal은 기본 진행 경계가 아니다(§0).

## 3. Local ID 원칙

AREA-SPEC은 Runtime global ID(`sector-03-06:c1` 같은)를 반복하지 않는다. `{"id": "c1"}`처럼 Area 안에서만 유일한 Local ID를 쓴다. Runtime 구현자는 기존 계약에 따라 `<sourceAreaId>:<localId>` 형태의 legacy global ID로, 그리고 Seamless compiler가 다시 landmark 기준으로 확장한다.

`route`, `recovery`의 참조 필드(`route.mandatory`, `route.runtimeLandmarks`, `route.optional[].sequence`, `route.forbiddenBypasses[].from`/`.to`, `recovery[].failureZone`/`.recoverTo`)는 다음 **base referencable set**만 가리킬 수 있다:

- `entry.id`
- `surfaces[].id`
- `grappleTargets[].id`
- `enemies[].id`
- 예약어 `"exit"` (항상 유효 — `sourceExit`이 만드는 exit 지점을 가리킨다)

`route.runtimeLandmarks[]`에 적은 값은 이 집합을 **확장하지 않는다** — §10.1 참고.

## 4. 좌표 규칙 — Area-local

모든 좌표는 Area-local이다.

```text
X: -width/2 ~ +width/2
Y: 0 ~ -height   (작아질수록 위쪽)
```

World-global Y를 기록하지 않는다. `AuthoredWorldAssembler`가 Area origin으로 World 좌표를 계산하는 현재 구조를 그대로 신뢰한다. (Seamless compiler가 이 Area를 다시 landmark 좌표로 이동시키는 것은 또 다른 단계이며, `sourceExit`/`route` 등 AREA-SPEC 필드는 그 이전의 Area-local 좌표만 다룬다.)

### 4-1. Surface bounds — 중심점이 아니라 실제 extent

Surface의 `(x, y)`가 Area bounds 안에 있어도 `width`/`height`를 적용한 실제 좌우/상하 extent는 밖으로 튀어나갈 수 있다. 예를 들어 Area width 960(half-width 480)에서 `x: 470, width: 100`인 surface는 중심점은 안쪽이지만 실제로는 `x: 420~520`이라 오른쪽이 480을 넘는다.

검증기는 `preset`이 어떤 Runtime helper(따라서 어떤 coordinate anchor)에 대응하는지 알고 있다(§6 표) — `platform`/`safe-deck`/`recovery-deck`/`overhang`은 `top-center`(가로 중앙, 세로는 위에서 아래로), `sealed-door`는 `bottom-center`(가로 중앙, 세로는 아래에서 위로)다. 이 anchor로 실제 extent를 계산해 Area bounds(가로 `±width/2`, 세로 `0~-height`, 바닥 여유 `+160`까지)를 벗어나면 `surface-out-of-bounds`로 FAIL한다. `grappleTargets`도 같은 방식(고정 24×24, `center` anchor)으로 검사한다.

## 5. 중복 입력 금지

다음을 두 번 적지 않는다:

- **Grapple target + grapple-landmark**: `grappleTargets`에 한 번만 적는다. Runtime은 `<sourceAreaId>:<id>-surface`와 `<sourceAreaId>:<id>` grapple-landmark 쌍을 기존 helper 계약(`AreaDefinitionValidator.validateGrappleLandmarks`)에 따라 만든다.
- **exitBlock 파생 오브젝트**: `deck`, `exit`, `routeExit`, `panel`, `gateVisual`, `reachBounds`, `gate`는 `sourceExit` 최소 입력(`deckX`, `deckTopY`, `deckWidth`, `panelObjectiveId`)만 적으면 기존 `exitBlock()` helper가 자동으로 만든다. 이 파생 오브젝트를 `surfaces`에 별도로 적지 않는다.

## 6. Preset 중심 규칙

다음 저수준 구현값은 AREA-SPEC에 직접 적지 않는다 — 기존 helper/Runtime contract가 소유한다:

```text
oneWay, renderable, collision, coordinateAnchor, presentationId
```

대신 `preset`(surfaces/objectives/enemies) 또는 `profile`(scannerGroups) 또는 `runtimeModel`/`mode`(stage/progression)로 표현한다. 검증기가 아는 값(KNOWN)은 다음과 같다 (`scripts/validateAreaSpecs.mjs` 상단 registry가 최신 기준):

| 종류 | 값 | Runtime 대응 | Coordinate Anchor |
|---|---|---|---|
| surface preset | `platform` | `rectangle()` 기본 kind | `top-center` |
| surface preset | `safe-deck` | `rectangle(..., { kind: "safe-deck" })` | `top-center` |
| surface preset | `recovery-deck` | `rectangle(..., { kind: "recovery" })` | `top-center` |
| surface preset | `sealed-door` | `groundedSurface(..., { kind: "sealed-door" })` | `bottom-center` |
| surface preset | `overhang` | `rectangle(..., { kind: "overhang", oneWay: false })` | `top-center` |
| objective preset | `exit-panel` | `exitBlock().panel` + `panelObjectiveId` 계약 | — |
| objective preset | `reach-deck` | `type: "reach"` + `*:final-deck-reached` 패턴 | — |
| enemy preset | `patrol-drone-t1` | `enemyType: "patrol-drone-t1"` | — |
| scanner profile | `sector03-default` | `SCANNER_CYCLE` (`available 1.5 / warning 0.6 / locked 1.1 / reset 0.3`) | — |
| stage runtime model | `seamless-sector-landmark-v1` | `LegacyAreaSeamlessSectorRuntime.js` compiler | — |
| progression mode | `objective-gated-connector` | 다음 Stage objective 관계를 보존하는 호환 authoring metadata | — |

Stage가 정말 baseline override가 필요하면, 해당 Runtime API가 실제로 override를 지원하는지 먼저 확인하고 explicit override 필드를 추가한다(임의 추가 금지).

## 7. 신규 시스템 — KNOWN / NOT_IMPLEMENTED / UNKNOWN

현재 Runtime에 없는 preset/system을 마치 존재하는 것처럼 쓰지 않는다. 예:

```json
{
    "runtimeDependencies": {
        "newSystems": [{ "id": "breakable-grapple-anchor", "status": "NOT_IMPLEMENTED" }]
    }
}
```

검증기는 다음을 구분한다:

- **KNOWN** — §6 registry에 있는 preset/profile/runtimeModel/mode. 통과.
- **NOT_IMPLEMENTED** — `runtimeDependencies.newSystems`에 `status: "NOT_IMPLEMENTED"`로 선언된 preset/profile. 통과(구현 대기 명시).
- **UNKNOWN** — 위 둘 다 아님. **FAIL**. 조용히 허용하지 않는다.

### 7-1. `runtimeDependencies.required`

`newSystems`(아직 없는 것)와 별개로, **이미 Runtime에 존재하고 이 Stage가 의존하는** system/profile은 `required`에 선언한다:

```json
{
    "runtimeDependencies": {
        "required": [{ "id": "patrol-drone-t1" }],
        "newSystems": []
    }
}
```

`required[].id`는 §6 registry에 있는 KNOWN 이름이어야 한다 — 존재하지 않는 이름을 "이미 있다"고 선언하면 FAIL(`runtime-dependency-required-unknown`)한다. 새 system을 `required`에 넣지 않는다(그건 `newSystems` 몫이다).

## 8. Story 구조

```json
{
    "story": {
        "planningTriggers": ["lockdown", "gate-open"],
        "runtimePresentations": []
    }
}
```

- `planningTriggers` — `defineArea().storyTriggers`와 대응하는 **기획 inventory**. `AuthoredWorldAssembler`가 Runtime state로 노출하지 않는 현재 계약을 그대로 따른다.
- `runtimePresentations` — `src/game/presentation/AuthoredStoryPresentation.js`의 `TRIGGER_CUE_PRESENTATIONS`(story-display 오브젝트의 `cueIds`가 여는 프레젠테이션)에 대응하는 범위로 한정한다. `ENTRY_PRESENTATIONS`(`stage.legacyStageAlias`/`sourceAreaId`로 이미 식별됨), `OBJECTIVE_PRESENTATIONS`(`objectives[].id`로 이미 식별됨), `GATE_PRESENTATIONS`(`progression`으로 이미 식별됨)는 다른 필드로 이미 암시되므로 여기서 중복 기록하지 않는다.

이번 REV에서는 Story Runtime 전체를 JSON에서 자동 생성하지 않는다.

## 9. Recovery

```json
{
    "recovery": [{ "id": "recover-r1", "failureZone": "r1", "recoverTo": { "x": -176, "y": -248 }, "maxRetrySeconds": 5 }]
}
```

- `failureZone` — 실패를 유발하는 surface의 Local ID (§3 base referencable set 기준 검증됨).
- `recoverTo` — Local ID 참조(§3) 또는 Area-local `{x, y}` 좌표. 좌표를 직접 쓰는 경우가 일반적이다(복귀 지점이 별도 authored entity가 아닌 경우가 많다).
- `maxRetrySeconds` — 선택. 기획이 README에서 확정한 실패 비용(예: "5초 이내 재시도")이 있을 때만 적는다.

## 10. Route

```json
{
    "route": {
        "runtimeLandmarks": ["entry", "anchor-a", "anchor-c", "exit"],
        "mandatory": ["entry", "anchor-a", "anchor-c", "exit"],
        "optional": [
            { "id": "flow-route", "sequence": ["entry", "anchor-a", "exit"] }
        ],
        "forbiddenBypasses": [
            { "from": "entry", "to": ["exit"], "reason": "must not bypass the mandatory Anchor A commit" }
        ]
    }
}
```

- `runtimeLandmarks` — authored `routePoints` 후보. **§3 base referencable set에 실제로 존재하는 id만 허용**한다.
- `mandatory` — 기본 플레이(=`swingImpulse: 0` Blockout validation)에서 반드시 성립해야 하는 경로. Local ID의 flat 배열.
- `optional` — `{ id, sequence[] }` 객체 배열. `id`는 optional 배열 안에서 유일해야 하고, `sequence`는 비어 있지 않은 Local ID 배열이어야 한다. 숙련/Flow 경로 하나당 한 entry.
- `forbiddenBypasses` — `{ from, to[], reason }` 객체 배열. `from`은 시작 지점, `to`는 "여기로 직접 가면 안 되는" 목적지 목록, `reason`은 비어 있지 않은 설명. Geometry상 허용되면 안 되는 progression skip 하나당 한 entry.

`mandatory`/`optional`/`forbiddenBypasses`를 Runtime `routePoints` 배열로 억지 변환하지 않는다. 이 정보는 implementation review/playtest 계약으로만 쓴다.

### 10-1. `runtimeLandmarks` 참조 버그 (REV 1.0에서 수정됨)

REV 1.0 검증기는 `route.runtimeLandmarks`에 적힌 id를 검증 없이 "참조 가능한 집합"에 먼저 추가했다. 그 결과 다음처럼 존재하지 않는 id를 적어도 통과했다:

```json
{
    "route": {
        "runtimeLandmarks": ["made-up-anchor"],
        "mandatory": ["made-up-anchor"]
    }
}
```

REV 1.1부터는 `runtimeLandmarks` 자신도 §3 base referencable set(실제 `entry`/`surfaces`/`grappleTargets`/`enemies`/`"exit"`)에 존재하는 id만 참조할 수 있다. 존재하지 않는 id는 `route-runtime-landmark-unknown`으로 FAIL한다.

## 11. Acceptance Tests

```json
{
    "acceptanceTests": [
        { "id": "mandatory-route-clear-zero-impulse", "type": "geometry", "requirement": "...", "automation": "MANUAL" }
    ]
}
```

`type`은 다음 enum으로 제한한다: `schema | geometry | traversal | runtime | story | camera | multiplayer | regression`.

`automation`은 `AUTOMATED`(validator로 검증 가능) 또는 `MANUAL`(인간 Playtest 필요)만 허용한다.

## 12. Rope/Player/Combat 공통 수치 — 중복 기록 금지 재확인

`ROPE_CONFIG`/`PLAYER_CONFIG`/`COMBAT_CONFIG`(`src/game/config.js`)의 수치를 AREA-SPEC에 복사하지 않는다. `#632`(Rope 기본값 조정: `hookSpeed 1400→1200`, `hookFlightRatio 2/7→1/3`, `hookReloadSeconds 0.2→1`)와 `#646`(`hookReloadSeconds 1→0.5`)처럼 Runtime 값이 바뀌어도 AREA-SPEC은 그 자체로는 stale해지지 않아야 한다 — `swingImpulse = 0`처럼 **검증 방법**(methodology)만 acceptanceTests/route 설명에 쓰고, 실제 baseline 숫자(`780`, `400px` 등)를 하드코딩하지 않는다.

## 13. 하지 말아야 할 것

```text
공유 Runtime 상수를 반복 기록하지 않는다 (§12).
현재 Runtime에 없는 시스템을 마치 존재하는 것처럼 preset으로 쓰지 않는다 (§7).
World-global 좌표를 쓰지 않는다 (§4).
Grapple target + grapple-landmark를 두 번 기록하지 않는다 (§5).
exitBlock 파생 오브젝트(deck/exit/panel/gate 등)를 중복 기록하지 않는다 (§5).
기획 storyTriggers를 Runtime presentation으로 착각하지 않는다 (§8).
stage.sourceAreaId를 최종 Runtime landmark 정체성처럼 설명하지 않는다 (§0, §2-1).
sourceExit(legacy source geometry)를 Runtime 진행 권위처럼 설명하지 않는다 (§2-2). progression도 intra-Sector 물리 잠금 권위가 아니다.
Canonical landmark ID를 JSON에 수동으로 중복 기록하지 않는다 (§2-1) — sector/stage 순서에서 파생한다.
```

## 14. 검증

```bash
npm run validate:area-specs   # AREA-SPEC.json 단독 스키마/참조 검증
npm run check                 # syntax -> area-spec -> scenario-integration 순으로 실행
```

검증기는 **AREA-SPEC.json이 스스로 일관된지**만 확인한다. AREA-SPEC.json이 실제 `SectorXXAreaCatalog.js`/Seamless Sector Runtime과 일치하는지는 사람이 `PRODUCTION-ALIGNMENT.md`에서 판정한다 — 두 계층을 자동으로 동기화하는 codegen은 이번 REV의 범위가 아니다.

`docs/bsh/scenario/**/AREA-SPEC.json`의 변경은 `scripts/checkScenarioIntegration.mjs`의 `scenario-source-sha256`에 포함된다. `src/game/world/sectors/**`(및 `SectorDefinitionValidator.js`/`SectorProgressController.js`/`SectorProgressState.js`)의 변경은 별도의 `authored-sector-sha256`에 포함된다. 두 fingerprint는 서로 독립적이다 — AREA-SPEC만 바뀌었는데 `authored-sector-sha256`만 확인하거나, Sector Runtime만 바뀌었는데 `scenario-source-sha256`만 확인해서 stale-check를 통과시키는 상황은 금지한다.

## 15. 마이그레이션 범위

이 REV은 인프라(스키마 + 검증기 + stale-check 연동)와 대표 예시 1개(`1/1-1/AREA-SPEC.json`)만 도입/유지한다. 나머지 47개 Stage를 이번 PR에서 일괄 변환하지 않는다. 새 Stage 문서를 쓰거나 기존 Stage를 검토할 때 점진적으로 추가한다.

여전히 하지 않는 것:

```text
AREA-SPEC.json -> Runtime 전체 자동 codegen
Runtime이 AREA-SPEC.json을 직접 load
48개 Stage 전체 migration
Gameplay behavior 변경
새 system 임의 구현
```
