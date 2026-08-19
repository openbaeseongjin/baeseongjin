# DIRECTION-SPEC AUTHORING STANDARD

*STAGE DESIGN → BEAT-LEVEL IMPLEMENTATION CONTRACT LAYER · REV 1.0*

> AUTHORING SNAPSHOT: `main@ddaeaba6aec183e49b974de88bafed87493080b2` (2026-08-19)

이 문서는 ONE ROPE Stage를 기획(ChatGPT 등)에서 확정한 뒤 `docs/bsh/scenario/<sector>/<stage>/DIRECTION-SPEC.json`으로 저작하고, Claude Code/Codex가 이를 해석 없이 구현하기 위한 공통 계약을 정의한다. `AREA-SPEC.json`이 `WHERE/WHAT`(공간 구현 계약)을 담당하는 것과 짝을 이루어, `DIRECTION-SPEC.json`은 `WHEN/HOW`(연출 구현 계약)를 담당한다.

이 문서는 외부에서 전달된 `ONE-ROPE-PLANNING-DIRECTION-STANDARD-v1.0` 패키지(01~11, MANIFEST, README)의 내용을 이 repo의 기존 문서 관례(`AREA-SPEC-AUTHORING-STANDARD.md`처럼 한 주제를 하나의 기준 문서로 관리)에 맞춰 정착시킨 것이다. §11 "배치 결정 근거"에 원본과 다르게 배치한 이유를 기록한다.

## 0. 현재 Runtime 구조 — 반드시 먼저 이해할 것

DIRECTION-SPEC이 실제로 무엇에 연결되는지는 [`DIRECTION-RUNTIME-CAPABILITY-MATRIX.md`](./DIRECTION-RUNTIME-CAPABILITY-MATRIX.md)가 소유한다. 이 표준 문서를 작성하는 시점(2026-08-19, `main@ddaeaba6`) 기준 핵심 사실:

- **repo 전체에 `DIRECTION-SPEC.json`은 하나도 없다.** Beat 단위 연출 계약이 이 REV에서 최초로 도입된다.
- `AreaDefinition.js`의 `storyTriggers`는 **기획 inventory일 뿐**이며 Runtime state로 노출되지 않는다(`src/game/world/areas/AreaDefinition.js:172-173` 주석 재확인). `DIRECTION-SPEC.beats[].trigger`가 이를 대체하지 않는다 — 서로 다른 계층이다.
- `AuthoredStoryPresentation.js`는 `ENTRY_PRESENTATIONS`(area-enter) / `POSITION_PRESENTATIONS`(position-zone) / `TRIGGER_CUE_PRESENTATIONS`(object-trigger, `cueIds` 경유) / `OBJECTIVE_PRESENTATIONS` / `GATE_PRESENTATIONS` 다섯 종류의 authored map만 존재한다. 이 다섯 개 바깥의 trigger type(예: `enemy-activated`, `augment-selected`, `route-lock-changed`)은 Story Presentation 계층에 대응 코드가 없다.
- Dedupe는 `AuthoredStoryPresentation` 인스턴스의 `this.seenTokens`(단일 Set, `#enqueue()`) 하나뿐이다. DIRECTION-SPEC이 요구하는 4가지 `replayPolicy`(once-per-run / once-per-life / once-per-sector-attempt / repeatable)를 구분하는 코드는 없다.
- `worldPause`, `playerControl`(movement/aim/rope/action/interaction 개별 boolean), Camera mode `composition-contract`/`temporary-shot`/`default` 개념은 **`src/game/` 전체에서 문자열 검색 결과 0건** — 이름조차 Runtime에 존재하지 않는다.
- Camera는 `AuthoredCameraDirector.js`의 zone 기반 `resolveAuthoredCameraShot()`만 있다 — 이것이 `camera.mode: "authored-zone"`에 대응하는 유일한 실제 구현이다.

**결론: 이 표준의 스키마는 기획 계약으로서 유효하지만, Beat의 상당수 필드는 오늘 시점에 "Schema Valid"와 "Runtime Capability"가 별개다.** §4의 검증기는 이 둘을 절대 섞지 않는다.

## 1. Source-of-truth 분리

```text
README.md            = WHY / PLAYER EXPERIENCE
AREA-SPEC.json        = WHERE / WHAT  (기존, docs/bsh/scenario/AREA-SPEC-AUTHORING-STANDARD.md)
DIRECTION-SPEC.json   = WHEN / HOW    (이 문서)
RUNTIME-HANDOFF.md    = WHICH CODE
VALIDATION.md         = DID IT MATCH?
```

충돌 시 자동으로 어느 한쪽을 덮어쓰지 않는다. `PRODUCTION-ALIGNMENT.md`에 기록하고 사람이 판정한다(`AREA-SPEC-AUTHORING-STANDARD.md` §1과 동일 원칙).

## 2. 필수 Workflow

```text
REFERENCE GATE → REFERENCE ANALYSIS → ONE ROPE ADAPTATION
→ STAGE CONCEPT → MAP + GAMEPLAY → STORY + DIRECTION
→ USER APPROVAL
→ AREA-SPEC → DIRECTION-SPEC → RUNTIME-HANDOFF
→ IMPLEMENTATION → AUTOMATED TEST → VISUAL ACCEPTANCE
```

## 3. Status 라벨

`VERIFIED` / `DESIGN LOCKED` / `HYPOTHESIS` / `NOT IMPLEMENTED` / `HOLD`

실제 Runtime/code가 문서보다 우선한다. `HYPOTHESIS`를 구현 편의상 `VERIFIED`로 바꾸지 않는다. `DESIGN LOCKED`는 임의로 변경하지 않는다.

## 4. Reference Analysis Gate

새 레퍼런스를 ONE ROPE에 처음 도입할 때, Stage 설계 전에 반드시 완료한다.

필수 분석 25항목(요약 — 전체 항목은 기획 산출물에 포함): 전체 Story 구조 / Chapter·Stage별 Beat / Gameplay↔Story 전환 / Cutscene 사용 조건 / Player Control 제거 조건 / Camera / Character Blocking / Dialogue UI / Text Timing / Gesture·Animation / Environmental Storytelling / Music·SFX / Screen Effect·Lighting / Object Animation / Scene Entry·Exit / Emotional Pacing / Foreshadowing / Tutorial+Story / Combat·Boss 전후 연출 / Failure·Retry / Multiplayer 적용 가능성 / 제작비 요소 / ONE ROPE에 가져올 것·버릴 것.

산출 형식: `REFERENCE → MECHANISM → WHY IT WORKS → ONE ROPE ADAPTATION → DO → DON'T`.

레퍼런스 분석 완료 전에는 Stage 좌표/연출 스펙에 직접 반영하지 않는다. (현재 확정 레퍼런스: MapleStory — `2D MAP AS STAGE / BLOCKING / READABLE OBJECT & CHARACTER STAGING` / SANABI — `PLAYABLE STORY / PLAYER ACTION BECOMES STORY`. 겉모습·UI skin·특정 Shot·대사·캐릭터 복제는 금지.)

## 5. Map Uniqueness Rules

> 상태: DESIGN LOCKED

각 Stage는 인접/이전 Stage와 다음 7개 신호 중 최소 3개 이상 달라야 한다: silhouette / movement axis / Rope rhythm / failure direction / enemy pressure / Key approach / Augment use. 이름·배경·색만 바꾸는 것은 FAIL.

필수 signature: SPATIAL / MOVEMENT / FAILURE / COMBAT·PRESSURE / AUGMENT AFFORDANCE / DO-NOT-REPEAT / NEXT-STAGE CONTRAST.

Check 10항목(주 진행축 반복? Anchor 배치 반복? Landing rhythm 반복? Entry→Exit silhouette 유사? Width/enclosure 유사? Failure direction 유사? Enemy pressure angle 유사? Key approach 유사? Augment 표현 유사? Architectural causality 없는 topology 반복?) — 판정: 0-1 overlap PASS / 2 overlap REVIEW / 3+ overlap REDESIGN.

## 6. Story Presentation Rules

> 상태: DESIGN LOCKED

핵심 원칙: `PLAYER MOVES → PLAYER SEES/EXPERIENCES → GAMEPLAY MAKES IT MEANINGFUL → SYSTEM MESSAGE CONFIRMS ONLY NECESSARY FACTS → NEXT QUESTION REMAINS`. Cutscene이 먼저 설명하고 Gameplay가 따라가는 구조를 기본값으로 쓰지 않는다.

Stage마다 정의: STORY FUNCTION / STORY QUESTION / STORY REVEAL / PRESENTATION SIGNATURE / ENVIRONMENTAL STORY / SYSTEM PRESENTATION / STORY CAMERA FRAME / STORY TIMING / AUDIO·MOTION INTENT / DO-NOT-REPEAT / NEXT-STAGE HANDOFF.

우선순위: `GAMEPLAY READABILITY > HAZARD/ENEMY READABILITY > STORY PRESENTATION > DECORATIVE DETAIL`.

핵심 Story Fact는 보통 1~3개로 제한. 금지: 긴 설명문 / 과도한 Terminal·Log / 안 본 사건 선설명 / 사고 원인 조기 단정 / 미래 Sector 진실 선공개.

기본 Camera 계약은 Cutscene Camera가 아니라 `PLAYER + NEXT ACTION + STORY OBJECT`(composition contract). Multiplayer: world pause 기본 false, scope 명시, replay/dedupe 명시, Story 때문에 Enemy/Projectile/Teammate를 정지하지 않는다.

## 7. `DIRECTION-SPEC.json` 스키마 — `one-rope-direction-spec-v1`

최상위 필드는 `"schemaVersion": "one-rope-direction-spec-v1"`를 포함한다. 나머지 최상위: `stageId`, `revision`, `sourceCommit`, `presentationSignature`, `beats[]`. Template: [`DIRECTION-SPEC-TEMPLATE.json`](./DIRECTION-SPEC-TEMPLATE.json).

### 7-1. Event-driven Rule

Stage 전체를 초 단위 Timeline으로 만들지 않는다. Beat trigger는 다음 10종만 허용:

```text
area-enter · position-zone · object-trigger · objective-started · objective-completed
gate-unlocked · enemy-activated · enemy-defeated · augment-selected · route-lock-changed
```

각 Beat *내부*에서만 상대시간(`tracks[].at` 등)을 쓴다.

### 7-2. Beat 필수 필드

`beatId · status · purpose · trigger · scope · replayPolicy · dedupeToken · worldPause · playerControl · camera · tracks · completion · validation`

- `scope`: `local-player | party | world`
- `replayPolicy`: `once-per-run | once-per-life | once-per-sector-attempt | repeatable`
- `playerControl`: `movement/aim/rope/action/interaction` 각 boolean. 하나라도 `false`면 `purpose` 또는 별도 필드에 이유와 최대 duration을 명시한다(스키마는 강제하지 않으므로 리뷰에서 확인한다).
- `camera.mode`: `authored-zone | composition-contract | temporary-shot | default` — 가능하면 `authored-zone` 또는 `composition-contract`를 쓴다.
- `tracks`: `systemText/dialogue/character/object/camera/audio/vfx/lighting/gameplayEvent` 배열만 허용(그 외 키 금지).

### 7-3. Asset Rule

모든 asset reference는 `VERIFIED existing | REQUIRED new | OPTIONAL`로 표시하고 PLACEHOLDER 허용 여부를 명시한다.

### 7-4. No-Guess Rule

Claude Code/Codex는 `DIRECTION-SPEC.json`에 없는 Story·Dialogue·Camera·Enemy·VFX·Audio·Augment requirement를 임의로 추가하지 않는다. Runtime이 track을 지원하지 않으면 `NOT IMPLEMENTED`로 보고하고 최소 adapter를 제안하되, 다른 시스템으로 몰래 우회 구현하지 않는다.

## 8. Runtime-Handoff 매핑 원칙

AREA-SPEC/DIRECTION-SPEC을 개발자가 현재 코드 어디에 연결할지 추측하지 않게 하는 것이 목적이다. Stage별 `RUNTIME-HANDOFF.md`는 다음 표를 채운다(예시):

| Planning ID | Runtime Target | File | Trigger/Event | Test |
|---|---|---|---|---|
| Beat S0 | `ENTRY_PRESENTATIONS["sector-01-01"]` | `src/game/presentation/AuthoredStoryPresentation.js` | `area-enter` | `tests/authoredStoryPresentation.mjs` |

Current Runtime Boundaries: Geometry `src/game/world/areas/AreaDefinition.js`(+`sectorNN/SectorNNAreaCatalog.js`) · Story `src/game/presentation/AuthoredStoryPresentation.js` · Camera `src/game/camera/AuthoredCameraDirector.js` · Audio `src/audio/AudioEventBindings.js` · Tests `tests/authoredStoryPresentation.mjs`, `tests/authoredCameraDirector.mjs` + 관련 gameplay test.

Direction track에 대응하는 Runtime abstraction이 없으면: (1) `NOT IMPLEMENTED` 표시, (2) 최소 adapter/change 제안, (3) 다른 시스템으로 몰래 우회 구현 금지, (4) architecture boundary 유지.

Change Discipline: latest main 확인 → existing abstraction 우선 → duplicate presentation system 금지 → implementation + tests 같이 변경 → `PRODUCTION-ALIGNMENT.md` 갱신.

## 9. Stage Package 구조

```text
<sector>/<stage>/
├─ README.md              WHY / EXPERIENCE
├─ AREA-SPEC.json          WHERE / WHAT (docs/bsh/scenario/AREA-SPEC-AUTHORING-STANDARD.md)
├─ DIRECTION-SPEC.json     WHEN / HOW (이 문서)
├─ PRODUCTION-ALIGNMENT.md Planned / Current Runtime / Match-Gap / Required Change / Status
├─ RUNTIME-HANDOFF.md      기획 ID ↔ 실제 Runtime 파일/함수 1:1 매핑 (§8)
├─ VALIDATION.md           Automated + Visual Acceptance
└─ ASSET-REQUIREMENTS.md   stable asset ID / category / purpose / required status / fallback
```

`MAP-PREVIEW.html`과 `MANIFEST.md`는 이 REV에서 아직 이 repo 관례에 없다 — §11 참고. 빈 template은 [`stage-package-template/`](./stage-package-template/)에 있다.

Story Beat 클릭 시 표시해야 하는 정보 계약(향후 `MAP-PREVIEW.html`이 구현할 때 따를 것): `beatId / trigger / purpose / scope / camera / tracks / runtime mapping / validation`.

### 9-1. MAP-PREVIEW Layer Contract

실제 `MAP-PREVIEW.html` 구현은 이 REV의 범위가 아니다(§13). 향후 구현 시 다음 Layer Toggle을 반드시 지원해야 한다:

```text
Geometry · Mandatory Route · Flow Route · Safe Route · Recovery · Hardpoints
Base Rope 400 · Long Rope 480 · Enemy · Enemy Activation · Key/Access · Augment Affordance
Camera Zones · Story Beats · Story Trigger Zones · Environmental Story · System Messages
Runtime-added Geometry · Current Runtime Ghost
```

## 10. Validation Standard

Two-layer validation — 둘 다 통과해야 최종 PASS: `AUTOMATED CONTRACT` + `VISUAL ACCEPTANCE`.

- **Automated — Schema**: `scripts/validateDirectionSpecs.mjs`(§12)가 검사하는 스키마/참조 무결성.
- **Automated — Runtime Capability**: 같은 스크립트가 [`DIRECTION-RUNTIME-CAPABILITY-MATRIX.md`](./DIRECTION-RUNTIME-CAPABILITY-MATRIX.md) 기준으로 각 Beat의 `trigger.type`/`camera.mode`/`tracks` 키를 KNOWN(=VERIFIED/PARTIAL) 또는 명시적 `NOT IMPLEMENTED`로 구분한다. **Schema Valid가 곧 "구현됨"을 의미하지 않는다** — 예: `SCHEMA VALID but lighting track runtime adapter = NOT IMPLEMENTED`처럼 별도로 보고한다.
- **Automated — Geometry(AREA-SPEC 몫)**: ID uniqueness, bounds, mandatory route, recovery, swingImpulse=0 clear 등은 `AREA-SPEC-AUTHORING-STANDARD.md`/`scripts/validateAreaSpecs.mjs`가 이미 담당한다.
- **Automated — Cross-file**: AREA-SPEC↔DIRECTION-SPEC 참조 무결성은 `scripts/validateStagePackageCrossReferences.mjs`(§12-1)가 담당한다.
- **Visual Acceptance**(사람): Beat마다 Player visible? next action visible? Story object visible? Toast가 조준을 가리는가? Hazard/Enemy readable? Object staging 정확한가? Lighting이 시선을 이끄는가? Camera 너무 좁거나 넓은가? Multiplayer 충돌?
- **Gameplay Acceptance**: no-Augment mandatory clear, no frame-perfect 필수 reach, 의도된 실패 비용, recovery 동작, Story가 critical Rope input을 막지 않음.
- **Story Acceptance**: text OFF에서도 사건 일부 이해 가능, system text가 설명보다 확인 먼저, next-stage question 존재, 승인 안 된 미래 reveal 없음.
- **Result**: `PASS / PASS WITH NOTES / REVIEW / FAIL·REDESIGN`. `HYPOTHESIS`를 자동으로 `VERIFIED`로 승격하지 않는다.

## 11. 이 문서를 만들며 원본 패키지와 다르게 배치한 것과 이유

전달받은 `ONE-ROPE-PLANNING-DIRECTION-STANDARD-v1.0`(README, 01~11, MANIFEST 12개 파일)을 그대로 새 폴더(예: `docs/bsh/standards/one-rope-planning-direction-v1/`)에 복사하지 않았다. 대신:

1. **한 문서로 통합**했다(01/02/03/04/06/07/08/10 → 이 파일 하나). 근거: `docs/documentation-rules.md` §1 "한 주제에는 현재 기준 문서를 하나만 둔다" — 기존 관례([`AREA-SPEC-AUTHORING-STANDARD.md`](./AREA-SPEC-AUTHORING-STANDARD.md), [`SCENARIO-ART-GENERATION-STANDARD.md`](./SCENARIO-ART-GENERATION-STANDARD.md))도 "Stage 저작 표준"이라는 한 주제를 파일 하나로 관리한다. 번호가 매겨진 8개 파일로 쪼개는 것은 "ONE ROPE Stage Direction 저작"이라는 한 주제에 여러 개의 현재 기준 문서를 두는 셈이 되어 규칙과 충돌한다.
2. **`docs/bsh/scenario/` 바로 아래**에 배치했다(중첩된 `standards/` 폴더 대신). 근거: 기존 두 표준 문서가 이미 이 위치에 있고, `docs/README.md`의 "작업자별 문서" 표도 이 경로 기준으로 색인되어 있다. 새 최상위 폴더를 만들면 색인 규칙을 하나 더 만들어야 한다.
3. `05`(TEMPLATE)와 `11`(JSON Schema)은 JSON이라 문서에 흡수하지 않고 [`DIRECTION-SPEC-TEMPLATE.json`](./DIRECTION-SPEC-TEMPLATE.json)으로 유지했다. `11`의 스키마 정의는 `scripts/validateDirectionSpecs.mjs`의 검증 코드로 옮겼다 — `AREA-SPEC-AUTHORING-STANDARD.md`/`validateAreaSpecs.mjs`도 별도 JSON Schema 라이브러리 없이 손으로 짠 검증기를 쓰는 관례이고, 이 repo `package.json`에는 JSON Schema 라이브러리(`ajv` 등) 의존성이 없다 — 새 의존성을 추가하지 않기 위해 같은 관례를 따랐다.
4. `MANIFEST.md`는 별도로 만들지 않았다. `docs/README.md`(문서 인덱스)가 이미 그 역할을 한다 — 이 문서를 추가하며 `docs/README.md`도 같은 작업에서 갱신했다(`documentation-rules.md` §1).
5. `MAP-PREVIEW.html` 실제 구현체는 만들지 않았다 — §9-1이 Layer contract만 문서로 확정한다(요청 §8, §13 범위 제한과 일치).
