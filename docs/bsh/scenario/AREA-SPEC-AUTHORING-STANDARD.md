# AREA-SPEC AUTHORING STANDARD

*IMPLEMENTATION CONTRACT LAYER · REV 1.0*

이 문서는 `docs/bsh/scenario/<sector>/<stage>/AREA-SPEC.json`의 목적, 스키마, 검증 규칙을 정의한다. Stage 문서를 새로 쓰거나 기존 Stage에 `AREA-SPEC.json`을 추가할 때 이 문서를 먼저 확인한다.

## 1. 네 계층의 Source of Truth

| 계층 | 소유 내용 | 소유자 |
|---|---|---|
| `README.md` | **WHY / EXPERIENCE** — 공간 의도, Story, Gameplay 의미 | 기획 |
| `AREA-SPEC.json` | **WHAT EXACTLY** — 구현 계약(좌표, ID, preset, 참조 무결성) | 기획 확정값 |
| `src/game/**` | **ACTUAL RUNTIME** — 실제 동작하는 코드 | 구현 |
| `PRODUCTION-ALIGNMENT.md` | **MATCH STATUS** — 위 세 계층이 실제로 일치하는지 | 검증 |

충돌 시 자동으로 어느 한쪽을 덮어쓰지 않는다. 차이가 발견되면 `PRODUCTION-ALIGNMENT.md`에 기록하고, 사람이 "기획 변경인지 구현 버그인지"를 판정한다.

## 2. 스키마 개요 — `area-spec-v1`

최상위 필드는 반드시 `"schemaVersion": "area-spec-v1"`를 포함한다. 지원 필드:

```
stage, bounds, entry
surfaces, grappleTargets, enemies
scannerGroups, windZones
objectives
route, recovery
exitBlock
camera
story
runtimeDependencies
forbidden
acceptanceTests
```

전체 예시는 [`AREA-SPEC-TEMPLATE.json`](./AREA-SPEC-TEMPLATE.json)과 실제 구현 예시 [`1/1-1/AREA-SPEC.json`](./1/1-1/AREA-SPEC.json)을 참고한다. `AREA-SPEC-TEMPLATE.json`은 실제 Stage가 아니며 `<sector>/<stage>/AREA-SPEC.json` 경로에 있지 않으므로 `npm run validate:area-specs`의 stage-count에 포함되지 않는다.

## 3. Local ID 원칙

AREA-SPEC은 Runtime global ID(`sector-03-06:c1` 같은)를 반복하지 않는다. `{"id": "c1"}`처럼 Area 안에서만 유일한 Local ID를 쓴다. Runtime 구현자는 기존 계약에 따라 `<areaId>:<localId>` 형태의 global ID로 확장한다.

`route`, `recovery`의 참조 필드(`mandatory`, `optional`, `forbiddenBypasses`, `failureZone`, `recoverTo`)는 다음 중 하나를 가리키는 Local ID여야 한다:

- `entry.id`
- `surfaces[].id`
- `grappleTargets[].id`
- `enemies[].id`
- `route.runtimeLandmarks[]`에 선언한 값
- 예약어 `"exit"` (항상 유효 — `exitBlock`이 만드는 exit 지점을 가리킨다)

## 4. 좌표 규칙 — Area-local

모든 좌표는 Area-local이다.

```
X: -width/2 ~ +width/2
Y: 0 ~ -height   (작아질수록 위쪽)
```

World-global Y를 기록하지 않는다. `AuthoredWorldAssembler`가 Area origin으로 World 좌표를 계산하는 현재 구조를 그대로 신뢰한다.

## 5. 중복 입력 금지

다음을 두 번 적지 않는다:

- **Grapple target + grapple-landmark**: `grappleTargets`에 한 번만 적는다. Runtime은 `<areaId>:<id>-surface`와 `<areaId>:<id>` grapple-landmark 쌍을 기존 helper 계약(`AreaDefinitionValidator.validateGrappleLandmarks`)에 따라 만든다.
- **exitBlock 파생 오브젝트**: `deck`, `exit`, `routeExit`, `panel`, `gateVisual`, `reachBounds`, `gate`는 `exitBlock` 최소 입력(`deckX`, `deckTopY`, `deckWidth`, `nextAreaId`, `panelObjectiveId`)만 적으면 기존 `exitBlock()` helper가 자동으로 만든다. 이 파생 오브젝트를 `surfaces`에 별도로 적지 않는다.

## 6. Preset 중심 규칙

다음 저수준 구현값은 AREA-SPEC에 직접 적지 않는다 — 기존 helper/Runtime contract가 소유한다:

```
oneWay, renderable, collision, coordinateAnchor, presentationId
```

대신 `preset`(surfaces/objectives) 또는 `profile`(scannerGroups)로 표현한다. 검증기가 아는 값(KNOWN)은 다음과 같다 (`scripts/validateAreaSpecs.mjs` 상단 registry가 최신 기준):

| 종류 | 값 | Runtime 대응 |
|---|---|---|
| surface preset | `platform` | `rectangle()` 기본 kind |
| surface preset | `safe-deck` | `rectangle(..., { kind: "safe-deck" })` |
| surface preset | `recovery-deck` | `rectangle(..., { kind: "recovery" })` |
| surface preset | `sealed-door` | `groundedSurface(..., { kind: "sealed-door" })` |
| surface preset | `overhang` | `rectangle(..., { kind: "overhang", oneWay: false })` |
| objective preset | `exit-panel` | `exitBlock().panel` + `panelObjectiveId` 계약 |
| objective preset | `reach-deck` | `type: "reach"` + `*:final-deck-reached` 패턴 |
| enemy preset | `patrol-drone-t1` | `enemyType: "patrol-drone-t1"` |
| scanner profile | `sector03-default` | `SCANNER_CYCLE` (`available 1.5 / warning 0.6 / locked 1.1 / reset 0.3`) |

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

- **KNOWN** — 위 registry에 있는 preset/profile. 통과.
- **NOT_IMPLEMENTED** — `runtimeDependencies.newSystems`에 `status: "NOT_IMPLEMENTED"`로 선언된 preset/profile. 통과(구현 대기 명시).
- **UNKNOWN** — 위 둘 다 아님. **FAIL**. 조용히 허용하지 않는다.

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
- `runtimePresentations` — `src/game/presentation/AuthoredStoryPresentation.js`의 `TRIGGER_CUE_PRESENTATIONS`(story-display 오브젝트의 `cueIds`가 여는 프레젠테이션)에 대응하는 범위로 한정한다. `ENTRY_PRESENTATIONS`(`stage.areaId`로 이미 식별됨), `OBJECTIVE_PRESENTATIONS`(`objectives[].id`로 이미 식별됨), `GATE_PRESENTATIONS`(`exitBlock`으로 이미 식별됨)는 다른 필드로 이미 암시되므로 여기서 중복 기록하지 않는다.

이번 REV에서는 Story Runtime 전체를 JSON에서 자동 생성하지 않는다.

## 9. Recovery

```json
{
    "recovery": [{ "id": "recover-r1", "failureZone": "r1", "recoverTo": { "x": -176, "y": -248 }, "maxRetrySeconds": 5 }]
}
```

- `failureZone` — 실패를 유발하는 surface의 Local ID (검증됨).
- `recoverTo` — Local ID 참조(§3 참조 가능 집합) 또는 Area-local `{x, y}` 좌표. 좌표를 직접 쓰는 경우가 일반적이다(복귀 지점이 별도 authored entity가 아닌 경우가 많다).
- `maxRetrySeconds` — 선택. 기획이 README에서 확정한 실패 비용(예: "5초 이내 재시도")이 있을 때만 적는다.

## 10. Route

```json
{
    "route": {
        "runtimeLandmarks": ["entry", "anchor-a", "anchor-c", "exit"],
        "mandatory": ["entry", "anchor-a", "anchor-c", "exit"],
        "optional": [],
        "forbiddenBypasses": []
    }
}
```

- `runtimeLandmarks` — authored `routePoints` 후보.
- `mandatory` — 기본 플레이(=`swingImpulse: 0` Blockout validation)에서 반드시 성립해야 하는 경로.
- `optional` — 숙련/Flow 경로.
- `forbiddenBypasses` — Geometry상 허용되면 안 되는 progression skip.

`mandatory`/`optional`/`forbiddenBypasses`를 Runtime `routePoints` 배열로 억지 변환하지 않는다. 이 정보는 implementation review/playtest 계약으로만 쓴다.

## 11. Acceptance Tests

```json
{
    "acceptanceTests": [
        { "id": "mandatory-route-clear-zero-impulse", "type": "geometry", "requirement": "...", "automation": "MANUAL" }
    ]
}
```

`type`은 다음 enum으로 제한한다: `schema | geometry | traversal | runtime | story | camera | multiplayer | regression`.

`automation`은 `AUTOMATED`(스크립트/테스트로 검증 가능) 또는 `MANUAL`(인간 Playtest 필요)만 허용한다.

## 12. 하지 말아야 할 것

```
공유 Runtime 상수를 반복 기록하지 않는다 (Rope 물리, Player 물리, Combat baseline 등은 src/game/config.js가 Source of Truth).
현재 Runtime에 없는 시스템을 마치 존재하는 것처럼 preset으로 쓰지 않는다 (§7).
World-global 좌표를 쓰지 않는다 (§4).
Grapple target + grapple-landmark를 두 번 기록하지 않는다 (§5).
exitBlock 파생 오브젝트(deck/exit/panel/gate 등)를 중복 기록하지 않는다 (§5).
기획 storyTriggers를 Runtime presentation으로 착각하지 않는다 (§8).
```

## 13. 검증

```bash
npm run validate:area-specs   # AREA-SPEC.json 단독 스키마/참조 검증
npm run check                 # syntax -> area-spec -> scenario-integration 순으로 실행
npm test                      # tests/areaSpecValidator.mjs 포함 전체 회귀
```

검증기는 **AREA-SPEC.json이 스스로 일관된지**만 확인한다. AREA-SPEC.json이 실제 `SectorXXAreaCatalog.js` Runtime과 일치하는지는 사람이 `PRODUCTION-ALIGNMENT.md`에서 판정한다 — 두 계층을 자동으로 동기화하는 codegen은 이번 REV의 범위가 아니다.

`docs/bsh/scenario/**/AREA-SPEC.json`의 변경은 `scripts/checkScenarioIntegration.mjs`의 scenario fingerprint에 포함된다. JSON만 바뀌고 `.md`가 안 바뀌어도 stale-check는 실패해야 한다 — 통과한다면 버그다.

## 14. 마이그레이션 범위

이 REV은 인프라(스키마 + 검증기 + stale-check 연동)와 대표 예시 1개(`1/1-1/AREA-SPEC.json`)만 도입한다. 나머지 47개 Stage를 이번 PR에서 일괄 변환하지 않는다. 새 Stage 문서를 쓰거나 기존 Stage를 검토할 때 점진적으로 추가한다.
