# 1-5~1-8 Camera Zone / Story Presentation 구현 Handoff

`docs/scenario-development-integration.md`의 열린 게이트 목록에 있던 항목 —
**1-5~1-8은 `CROSS-REVIEWED` 기획 문서가 있지만 Runtime `cameraZones`는
placeholder 문자열 배열이고, Story Trigger는 `AuthoredStoryPresentation.js`에
전혀 연결돼 있지 않다** — 를 구현 가능한 형태로 정리한 문서다.

이 문서는 코드가 아니다. `src/game/world/areas/sector01/Sector01AreaCatalog.js`와
`src/game/presentation/AuthoredStoryPresentation.js`를 실제로 수정하는 작업은
별도 구현 담당(코드 작업 프로세스)이 진행하고, 이 문서는 그대로 옮겨 붙일 수
있는 수준의 좌표·문구·연결 지점을 제공한다.

**작성 시점 기준 진행 중인 병렬 작업과의 관계 (중요)**: 이 문서 작성 중
오픈된 PR #507("환풍 팬·바람 시각과 스토리·드론·2-3 진행을 정비한다")이
`AuthoredStoryPresentation.js`에 `sector-01-05`~`sector-01-08`의
`ENTRY_PRESENTATIONS`·`OBJECTIVE_PRESENTATIONS`·`GATE_PRESENTATIONS`를 이미
구현하고 있는 것을 확인했다(문구는 이 문서 초안과 유사하지만 정확히 같지는
않음). **`cameraZones`는 #507도 건드리지 않는다.** 그래서 이 문서는:

- **Part 1 (Camera Zone)**: 여전히 완전히 열려 있는 gap. 이 문서가 유일한
  구현 준비 자료다.
- **Part 2 (Story Presentation)**: #507이 이미 다루는 ENTRY/OBJECTIVE/GATE는
  이 문서에서 제외했다(중복·충돌 방지). #507이 다루지 않는
  `POSITION_PRESENTATIONS`(Stage 중간 위치 기반 연출)만 남겼다. #507이 먼저
  머지되면 그 실제 문구를 기준으로 삼고, 이 문서의 POSITION 항목만 추가하면
  된다.

## 검증 방법

- Camera Zone: `cameraZoneForLocalY`(`src/game/camera/AuthoredCameraDirector.js:15`)는
  `area.cameraZones`를 객체로만 필터링하므로(`typeof zone === "object"`),
  지금처럼 문자열 배열이 들어있으면 **매치되는 zone이 항상 없고 항상
  `defaultZoom`으로 폴백한다.** 즉 현재 1-5~1-8은 이름은 있지만 카메라 연출이
  전혀 동작하지 않는 상태다. PR #507 diff에도 `cameraZones` 변경은 없다
  (직접 확인).
- Story Presentation: 이 문서 작성 시점 `main`(#500 병합 직후) 기준
  `ENTRY_PRESENTATIONS`/`POSITION_PRESENTATIONS`/`OBJECTIVE_PRESENTATIONS`/
  `GATE_PRESENTATIONS` 네 딕셔너리 모두 `sector-01-05`~`sector-01-08` 키가
  전혀 없었다. PR #507(오픈, 미병합)이 이 중 ENTRY/OBJECTIVE/GATE 세 개를
  구현 중이므로, 아래 Part 2는 `POSITION_PRESENTATIONS`만 남겼다.
- 좌표 근거: 각 Stage의 `routePoints`/`surfaces`/`objects` 실제 좌표
  (`Sector01AreaCatalog.js`)와 README의 `## Camera —` / `## Story` 절 서술을
  대조해서 도출했다. `localY`는 `AuthoredCameraDirector.js`의
  `localY = player.position.y - (area.bounds.y + area.bounds.height)` 정의를
  따르며, 기존 area01~04와 동일하게 **entry 근처가 0, exit 근처가
  `-bounds.height`** 인 이미 쓰이는 좌표계를 그대로 사용한다(area 자체의
  `surfaces`/`routePoints`에 쓰인 값과 동일 좌표계이므로 그대로 대입 가능).

---

## Part 1 — Camera Zone

기존 area01~04 관례(`cameraZone(id, minY, maxY, desktopZoom, mobileZoom, props)`,
zone은 0부터 `-bounds.height`까지 빈틈·중복 없이 이어짐, 전투/판단 구간은
zoom을 낮춰 넓게 보여주고 `verticalPlayerRatio`를 올려 위쪽 위협 가시성을
확보) 그대로 따랐다.

### 1-5 AUGMENT TEST BAY (`bounds.height = 1280`)

기존 placeholder: `["load-gap", "relay-spine", "live-security", "exit"]`

```js
cameraZones: [
    cameraZone("load-gap", -544, 0, 1, 0.72),
    cameraZone("relay-spine", -768, -544, 1.05, 0.74),
    cameraZone("live-security", -1216, -768, 0.85, 0.66, { verticalPlayerRatio: 0.64 }),
    cameraZone("exit", -1280, -1216, 1.15, 0.78)
]
```

근거: §54 "Zone A"(A Attach 시 Player·B·distant C·Large Gap, "혹시 C까지?")가
`load-gap`(entry~C, -544까지) → §55 "Zone B"(C/D Attach, 연속 Anchor
Rhythm)가 `relay-spine`(-544~-768) → §56 "Zone C"(F 접근 시 Player·F·G·
Turret·Safe Ledge 동시 확보, Rope+Turret+Anchor 삼각 판단)가
`live-security`(-768~-1216, Sentry `activation` Y범위 -1184~-736과 겹침) →
`exit`(final-deck~exit, -1216~-1280).

### 1-6 COOLING SHAFT (`bounds.height = 1408`)

기존 placeholder: `["airflow-preview", "fan-a", "neutral-deck", "fan-b", "exit"]`

```js
cameraZones: [
    cameraZone("airflow-preview", -320, 0, 1.15, 0.78),
    cameraZone("fan-a", -640, -320, 0.9, 0.68, { verticalPlayerRatio: 0.6 }),
    cameraZone("neutral-deck", -896, -640, 1.05, 0.74, { verticalPlayerRatio: 0.62 }),
    cameraZone("fan-b", -1344, -896, 0.85, 0.64, { verticalPlayerRatio: 0.62 }),
    cameraZone("exit", -1408, -1344, 1.15, 0.78)
]
```

근거: §51 Intro(Fan A가 Gameplay에 들어오기 전 미리보기)가 `airflow-preview`
(entry~fan-a wind 시작 -320) → §52 Fan A(바람 방향 판독 필요)가 `fan-a`
(fan-a wind zone -320~-640과 정합) → §53 Neutral Deck(안전하게 Fan B 관찰)이
`neutral-deck`(-640~-896) → §54 Fan B(D/E Attach 동시 정보, Final Deck 예고)가
`fan-b`(fan-b wind zone -896~-1280을 포함해 final-deck 진입부까지 -1344).

### 1-7 PRESSURE BYPASS (`bounds.height = 1536`)

기존 placeholder:
`["approach", "security-entry", "decision-frame", "pressure-crossing", "relief", "bypass"]`

```js
cameraZones: [
    cameraZone("approach", -416, 0, 1.1, 0.76),
    cameraZone("security-entry", -608, -416, 1, 0.74),
    cameraZone("decision-frame", -832, -608, 0.8, 0.62, { verticalPlayerRatio: 0.66 }),
    cameraZone("pressure-crossing", -1216, -832, 0.85, 0.64, { verticalPlayerRatio: 0.62 }),
    cameraZone("relief", -1376, -1216, 1.05, 0.74),
    cameraZone("bypass", -1536, -1376, 1.15, 0.78)
]
```

근거: §45 Zone A → `approach`(entry~C 진입 -416) → §46 Security Entry(C
도착, Turret 인지)가 `security-entry`(-416~-608) → §47 Main Decision
Frame(D 위치에서 Player·Turret·Anchor E·Main Vent·Safe Shadow 중 4개 이상
동시 확보 요구)가 가장 넓은 `decision-frame`(-608~-832) → §48 E/F(카메라가
위로 Lead, Upper Cover 예고)가 `pressure-crossing`(-832~-1216, main-vent
wind zone -1184~-800과 sentry activation 상단부를 포함) → §49 Bypass(Turret가
화면 아래로 사라진 뒤 G+Bypass Control+Exit 중심)를 `relief`(Turret 이탈
직후, -1216~-1376)와 `bypass`(최종 접근, -1376~-1536)로 분리.

### 1-8 CONTAINMENT GATE (`bounds.height = 1792`)

기존 placeholder:
`["intro", "chain-ascent", "turret-one", "mid-relief", "final-preview", "final-crossing", "gate", "shutdown", "worker-reveal"]`

```js
cameraZones: [
    cameraZone("intro", -288, 0, 1.15, 0.78),
    cameraZone("chain-ascent", -640, -288, 1.05, 0.75),
    cameraZone("turret-one", -1024, -640, 0.85, 0.64, { verticalPlayerRatio: 0.64 }),
    cameraZone("mid-relief", -1088, -1024, 1.1, 0.76),
    cameraZone("final-preview", -1344, -1088, 0.9, 0.66, { verticalPlayerRatio: 0.6 }),
    cameraZone("final-crossing", -1504, -1344, 0.8, 0.6, { verticalPlayerRatio: 0.68 }),
    cameraZone("gate", -1584, -1504, 1, 0.72),
    cameraZone("shutdown", -1696, -1584, 0.95, 0.7),
    cameraZone("worker-reveal", -1792, -1696, 1.15, 0.8)
]
```

근거: Phase 구조(§13 Lockdown Ascent, §20 Lower Security/Turret T1, §29 Mid
Safe Deck, §32 Final Crossing/Turret T2, §49 Containment Gate, §55 Lower
Grid Shutdown, §59 Worker District)를 `sentry-turret-lower` activation
(-1024~-640)과 `sentry-turret-upper` activation(-1504~-1088) 경계에 맞춰
9개 zone으로 그대로 분배했다. `final-crossing`은 두 Sentry 규칙
(`sequential-activation`·`no-crossfire`)상 Turret T2만 활성인 구간이라
zoom을 이 Stage에서 가장 낮게(`0.8`) 잡아 위협 가시성을 최우선했다.

---

## Part 2 — Story Presentation (PR #507 미커버 구간만)

PR #507이 이미 구현한 `ENTRY_PRESENTATIONS`/`OBJECTIVE_PRESENTATIONS`/
`GATE_PRESENTATIONS`(1-5~1-8, area 진입·목표 완료·Gate 해제 시점)는 이
문서에서 뺐다 — 그대로 옮기면 #507과 내용이 겹치거나 문구가 달라 중복
Toast가 뜬다. 아래는 #507이 다루지 않는 `POSITION_PRESENTATIONS`(Stage
중간 특정 위치 도달 시 1회, `token` 단위로 dedup)만 제안한다.

### 1-5 — `load-test-context`만 추가

```js
"sector-01-05": Object.freeze([
    Object.freeze({
        // D/E 구간(그래플 리듬 Rope 시험), localY -900~-600
        token: "load-test-context",
        minLocalY: -900, maxLocalY: -600,
        presentations: Object.freeze([
            Object.freeze({ id: "sector-01-05:vertical-load-test", title: "VERTICAL LOAD TEST", detail: "IN PROGRESS", durationSeconds: 1.1 }),
            Object.freeze({ id: "sector-01-05:security-response-test", title: "SECURITY RESPONSE TEST", detail: "IN PROGRESS", durationSeconds: 1.1 })
        ])
    })
])
```

§59 "중간 Story Detail"(VERTICAL LOAD TEST / SECURITY RESPONSE TEST /
EMERGENCY TRANSIT TEST)의 앞 두 항목만 반영했다. exit 근처 "COOLING
DISTRIBUTION" 문구는 이미 #507의 `sector-01-05:gate` GATE_PRESENTATIONS와
겹쳐서 뺐다.

### 1-6 — 추가 제안 없음

§59에 해당하는 1-6의 Exit Story 문구(COOLING PRESSURE CRITICAL → AUTOMATIC
BYPASS FAILED → MANUAL PRESSURE BYPASS REQUIRED)는 #507이
`sector-01-06:exit-panel-engaged` `OBJECTIVE_PRESENTATIONS`로 이미 동일한
순서로 구현했다. `POSITION_PRESENTATIONS`로 별도 추가할 실질적인 중간
비트가 없어 이 Stage는 제외한다.

### 1-7

```js
"sector-01-07": Object.freeze([
    Object.freeze({
        // 상승 중 압력 한계 초과 — decision-frame 진입부, localY -832~-608
        token: "pressure-limit",
        minLocalY: -832, maxLocalY: -608,
        presentations: Object.freeze([
            Object.freeze({ id: "sector-01-07:pressure-limit", title: "PRESSURE LIMIT", detail: "EXCEEDED", durationSeconds: 1.1 })
        ])
    }),
    Object.freeze({
        // Turret 감지 — Turret 위치(-864) 근접, localY -960~-736
        token: "containment-violation",
        minLocalY: -960, maxLocalY: -736,
        presentations: Object.freeze([
            Object.freeze({ id: "sector-01-07:containment-violation", title: "CONTAINMENT VIOLATION", detail: "ACTIVE", durationSeconds: 1.2 })
        ])
    })
])
```

§6 Story Sequence의 "상승 중 PRESSURE LIMIT EXCEEDED"와 "Security가 Player
감지: CONTAINMENT VIOLATION ACTIVE" 두 비트다. #507은 이 Stage에
`POSITION_PRESENTATIONS`를 추가하지 않았으므로 겹치지 않는다. §6의 "MANUAL
BYPASS READY"(최상단 도착)는 #507의 `sector-01-07:bypass-open`
`OBJECTIVE_PRESENTATIONS`(PRESSURE STABILIZING → SERVICE ROUTE AVAILABLE)로
사실상 흡수됐다고 보고 별도 제안하지 않았다.

### 1-8

```js
"sector-01-08": Object.freeze([
    Object.freeze({
        // C 근접(Lockdown Story Beat), localY -608~-384
        token: "lockdown-warning",
        minLocalY: -608, maxLocalY: -384,
        presentations: Object.freeze([
            Object.freeze({ id: "sector-01-08:final-warning", title: "FINAL WARNING", detail: "", durationSeconds: 1.0 }),
            Object.freeze({ id: "sector-01-08:return-to-lower-maintenance", title: "RETURN TO LOWER MAINTENANCE", detail: "", durationSeconds: 1.1 }),
            Object.freeze({ id: "sector-01-08:closure-in-progress", title: "CONTAINMENT GATE", detail: "CLOSURE IN PROGRESS", durationSeconds: 1.3 })
        ])
    }),
    Object.freeze({
        // Mid Safe Deck 도달, localY -1088~-960
        token: "mid-safe-story",
        minLocalY: -1088, maxLocalY: -960,
        presentations: Object.freeze([
            Object.freeze({ id: "sector-01-08:lockdown-87", title: "CONTAINMENT GATE", detail: "LOCKDOWN · 87%", durationSeconds: 1.1 })
        ])
    }),
    Object.freeze({
        // Checkpoint 접근, Worker District 첫 노출 — localY -1792~-1696
        token: "worker-district-preview",
        minLocalY: -1792, maxLocalY: -1696,
        presentations: Object.freeze([
            Object.freeze({ id: "sector-01-08:worker-district-sign", title: "WORKER DISTRICT", detail: "BLOCK 12", durationSeconds: 1.3 })
        ])
    })
])
```

§19 Lockdown Story Beat, §31 Mid Safe Story를 그대로 옮겼다. `mid-safe-story`
토큰의 두 번째 문구(LOWER GRID CONNECTION TERMINATING)는 #507의
`sector-01-08:maintenance-override` `OBJECTIVE_PRESENTATIONS`가 이미
"LOWER GRID CONNECTION TERMINATING"을 포함하고 있어 중복이라 뺐다 —
`lockdown-87`(LOCKDOWN 87%)만 남겼다. `worker-district-preview`는 #507의
`sector-01-08:gate` GATE_PRESENTATIONS("WORKER DISTRICT ACCESS OPEN", Gate
해제 시 1회)와 발생 시점이 다른 후속 비트다(Gate 통과 후 Checkpoint 접근 시
지역 표지판 노출). `storyTriggers` 10개 중 `access-denied` /
`violation-logged` / `evacuation-group-c` / `sector-checkpoint`는 §64
Evacuation Notice·§66 Checkpoint 등에서 더 세분화할 수 있으나 이 문서는
Camera Zone 경계와 맞물리는 핵심 비트만 우선 연결했다.

---

## 다음 단계

1. PR #507이 먼저 머지되면 그 실제 `ENTRY`/`OBJECTIVE`/`GATE`
   `_PRESENTATIONS` 문구를 기준으로 삼고, 이 문서 Part 2의
   `POSITION_PRESENTATIONS` 스니펫만 추가한다. #507이 머지되기 전이라면
   Part 2 전체(POSITION 포함)를 그대로 옮겨도 되지만 이후 #507과 병합 시
   문구 차이를 조율해야 한다.
2. Part 1(Camera Zone)은 #507과 무관하게 그대로 `cameraZones:` 필드에
   옮긴다.
3. `tests/authoredStoryPresentation.mjs`(기존 테스트, 1-1~1-4 대상으로 이미
   존재하며 #507이 1-5~1-8·2-x 일부를 추가하는 중)에 이 문서가 추가하는
   `POSITION_PRESENTATIONS` 케이스를 보강한다.
4. `docs/scenario-development-integration.md`의 "열린 기획·구현 게이트"
   3번 문항과 이번 항목은 별개(그건 Sector 03)이므로, 이 작업이 끝나면
   "최근 반영된 시나리오 변화"에 새 항목을 추가하고 `stage-coverage`/해시
   checkpoint를 재계산해야 한다.

## 범위에서 제외한 것 — Sector 02 (2-1~2-8)

이 문서 작성 시점 `main` 기준 `Sector02AreaCatalog.js`는 `cameraZones` 필드
자체가 8개 area 전부에 없고(placeholder 문자열조차 없음),
`AuthoredStoryPresentation.js`에도 `sector-02-*` 키가 전혀 없었다. **단,
오픈 PR #507이 `sector-02-01/02/03/04/05/07/08`의 Story Presentation 일부를
이미 추가하는 중이다(`cameraZones`는 여전히 미포함).** 즉 Story 쪽은 #507
머지 이후 상황을 다시 확인해야 하고, Camera Zone은 Sector 02 전체가 여전히
이름 목록조차 없는 상태라 1-5~1-8과 달리 "옮겨 붙이기"가 아니라 처음부터
zone 이름·수·경계를 새로 설계해야 한다. 작업량이 이 문서의 배 이상이라
별도 문서로 이어서 진행하는 것을 권장한다.
