# SECTOR 01-6 — PRODUCTION ALIGNMENT

*IMPLEMENTATION · CAMERA · WIND HANDOFF · REV 1.0*

본 문서는 [1-6 시나리오](./README.md)를 현재 Runtime과 연결하는 제작 계약이다. 1-6은 Sector 01에서 Wind가 처음 등장하는 Stage이며, Wind 물리 자체는 실제로 구현되어 있다 — 이는 1-1~1-5와 구분되는 1-6 고유의 좋은 소식이다. 단 Approved Blockout, Art Reference, Camera Zone, Story Trigger는 1-5와 마찬가지로 아직 없다.

## 1. 현재 판정

| 항목 | 상태 | 판정 |
| --- | --- | --- |
| 960×1408 Geometry | `IMPLEMENTED` | P0, A~F Anchor, R1~R4, Neutral Deck, Final Deck이 Area Catalog에 존재 |
| A~F Anchor 좌표 | `IMPLEMENTED — README와 일치` | 6개 Anchor 전부 README와 Runtime 좌표 일치 |
| P0/R1/R4/Final Deck 좌표 | `IMPLEMENTED — README와 일치` | |
| R2 좌표 | `IMPLEMENTED — README와 불일치` | 위치·크기 모두 다름. 아래 §3 참고 |
| Neutral Deck Y좌표 | `IMPLEMENTED — README와 64px 오차` | X·너비는 일치, Y만 다름 |
| Wind 물리(가속도 기반) | `IMPLEMENTED` | `WorldForceField.js`의 `sampleWorldForce()`가 `player.physics.velocity`에 직접 가속도를 더함. README §57이 요구한 velocity-integration 방식과 일치 |
| Fan A(continuous) / Fan B(pulsed) 수치 | `IMPLEMENTED — README Hypothesis 범위 안에서 확정` | Fan A strength 220(README 후보 180~240), Fan B strength 360 · cycle `{lull 1.75, warning 0.7, active 1.4, decay 0.3}`(README 후보 범위 안) |
| Wind Shadow(구조물 차폐) | `NOT IMPLEMENTED` | Wind Zone은 순수 사각형이며 Cover/Core 뒤에서 감쇠하는 로직 없음 |
| Grounded Wind 감쇠(README 25~40%) | `NOT IMPLEMENTED` | `#applyWorldForce`는 grounded/airborne 구분 없이 동일하게 적용 |
| Wind Zone Falloff(경계 64~96px) | `NOT IMPLEMENTED` | Hard Rect Zone만 존재. README §58 스스로도 "첫 구현은 Hard Rect로 재미 검증 가능"이라 허용한 범위이므로 FAIL은 아님 |
| Camera Zones | `NOT IMPLEMENTED` | 문자열 5개(`airflow-preview, fan-a, neutral-deck, fan-b, exit`)만 존재, 실제 zone 객체 없음 |
| Story Trigger Presentation | `NOT IMPLEMENTED` | `storyTriggers` 3개 모두 `AuthoredStoryPresentation.js`에 연결 안 됨 |
| Approved Blockout / Art Reference | `NEEDED` | `images/` 폴더 없음 |

## 2. 자료 우선순위

1. 핵심 학습(Wind는 방해가 아니라 이용할 힘), 금지 요소는 [시나리오 README](./README.md)가 결정한다.
2. 실제 좌표·Wind 수치는 [`Sector01AreaCatalog.js`](../../../../../src/game/world/areas/sector01/Sector01AreaCatalog.js)의 `sector-01-06` 정의가 유일한 현재 기준이다.
3. Wind 물리 로직은 [`WorldForceField.js`](../../../../../src/game/world/WorldForceField.js)와 [`GameSimulation.js`](../../../../../src/game/simulation/GameSimulation.js)의 `#applyWorldForce`가 기준이며, README §17~19·57~62의 설계 의도(Anchor 불변, velocity 가산, Rope Constraint 이후 결과 반영)와 일치한다.
4. R2와 Neutral Deck Y는 README와 다르므로 `HYPOTHESIS`로 취급하고 Runtime 값을 우선한다.
5. Camera Zone과 Story Trigger는 아직 없으므로 README 서술은 구현 방향 참고용일 뿐 확정 수치가 아니다.
6. 재생성은 [Scenario Art 생성 규격](../../SCENARIO-ART-GENERATION-STANDARD.md)을 따른다.

## 3. Runtime Geometry

좌표는 `X=-480~480`, `Y=0~-1408`.

### Collision Surface

| ID | 중심/기준점 | 크기 | 속성 | README와 비교 |
| --- | --- | --- | --- | --- |
| P0 | `(-256,0)` | 320×32 | 시작 발판 | 일치 |
| R1 | `(-144,-192)` | 224×16, recovery | A 실패 Catch | 일치 |
| R2 | `(144,-544)` | 224×16, recovery | B→C 실패 Catch | **불일치** — README는 `(-128~128, -512)`, 256×16 |
| R3 | `(0,-800)` | 256×16, recovery | C/D 전환 Catch | README에 명시적 좌표 없음("Central Cooling Core 아래") — 크기(256×16)만 일치 |
| Neutral Deck | `(-112,-832)` | 352×32, safe-deck | Fan A 종료·Fan B Preview | X·너비 일치, **Y 64px 오차**(README `-768`) |
| R4 | `(160,-1120)` | 256×16, recovery | D→E 실패 Catch | 일치 |
| Final Deck(P6) | `(112,-1344)` | 416×32, safe-deck | Wind Challenge 종료 | 일치 |

### Anchor A~F

전부 README §13,20,22,37~39와 정확히 일치: A `(-128,-224)`, B `(96,-416)`, C `(-224,-640)`, D `(-160,-896)`, E `(192,-1088)`, F `(-32,-1280)`.

### Wind Zone

| ID | bounds(x,y,w×h) | 방향 | mode | strength | cycle |
| --- | --- | --- | --- | --- | --- |
| `fan-a-wind` | `(-320,-640,672×320)` | `{-1,0}` LEFT | continuous | 220 | — |
| `fan-b-wind` | `(-352,-1280,704×384)` | `{1,0}` RIGHT | pulsed | 360 | lull 1.75 / warning 0.7 / active 1.4 / decay 0.3 |

Fan A 방향(README: RIGHT→LEFT, `<<<`)과 Fan B 방향(README: LEFT→RIGHT, `>>>`)이 코드와 일치한다. Fan B의 State Machine(`LULL→WARNING→ACTIVE→DECAY`)은 [`WorldForceField.js`](../../../../../src/game/world/WorldForceField.js)의 `pulsedWindState()`가 정확히 같은 4단계로 구현했다: `multiplier`가 lull/warning 구간 0, active 구간 1, decay 구간 `1 - phaseTime/decay`로 선형 감소한다.

### Gate·Objective

| 항목 | 값 |
| --- | --- |
| Exit Panel | `(176,-1344)` bottom-center, `interactionRadius=72`, 필요조건 `final-deck-reached` |
| Pressure Bypass Gate | `(288,-1344)` bottom-center |
| `final-deck-reached` | type `reach`, bounds `(-96,-1408)`~`416×96` |
| Gate 판정 좌표 | `(288,-1376)`, `portalBottomY=-1344` |

## 4. Camera Shot — 미구현, README 설계값만 존재

문자열 placeholder 5개(`airflow-preview, fan-a, neutral-deck, fan-b, exit`)는 `cameraZoneForLocalY()`가 `typeof === "object"` 필터에서 걸러내므로 Stage 전체가 기본 zoom(1)·기본 화면비(0.38/0.58)로만 렌더링된다. README §51~54가 제안한 방향은 다음과 같다.

| 제안 SHOT | Player Y 구간(README 기준) | 반드시 보일 것 |
| --- | --- | --- |
| Airflow Preview | `0~-256` | Player, A, 멀리 Fan A |
| Fan A | `-256~-704` | Player, B, C, Steam 방향, Fan A 일부 |
| Neutral Deck | `-704~-864` | Fan B, D, Wind particle(Preview) |
| Fan B | `-864~-1248` | D, E, Fan B, Wind 방향, R4 |
| Exit | `-1248~-1408` | F, Final Deck |

## 5. Story Trigger — 미구현

`storyTriggers` 3개 모두 미연결. README §12,48,49가 제안하는 문구:

| EVENT | README 제안 문구 |
| --- | --- |
| `airflow-unstable` | `COOLING DISTRIBUTION` / `AIRFLOW: UNSTABLE`(진입 연출) |
| `cooling-pressure-critical` | `COOLING PRESSURE: CRITICAL` → `AUTOMATIC BYPASS: FAILED` |
| `bypass-required` | `MANUAL PRESSURE BYPASS REQUIRED` (1-7과 연결되는 문구이므로 1-7 Story와 함께 검토 필요) |

## 6. Wind Shadow·Grounded 감쇠 구현 메모

README는 Wind Shadow(§28)와 Grounded 감쇠(§59)를 명시적으로 요구하지만 현재 `sampleWorldForce()`는 두 개념 모두 없다. 두 기능을 추가할 때는 `WorldForceField.js`에 지역적 변경(zone falloff 또는 zone-cover 상호작용)이 아니라 새 물리 시스템을 만들지 않도록 주의한다. 우선순위는 README §58 자체가 명시한 대로 `Gameplay 확인 → Falloff/Shadow polish` 순서를 따른다.

## 7. 저비용 Art Package

| LAYER | 최소 자산 | 배치 규칙 |
| --- | --- | --- |
| Far | Giant Ventilation Void Silhouette, 거대 Fan 실루엣 | 낮은 Contrast·채도 |
| Mid | Fan A(192~256px), Fan B(256px), Central Cooling Core | 각 Fan은 LULL/WARNING/ACTIVE/DECAY를 Animation만으로 구분 |
| Near | Pressure Gauge, Drain Pipe, Condensation | Anchor 주변 Clean Zone 유지 |
| Wind 표현 | Steam/Dust/Cable/Scarf 움직임 | Cyan 사용 금지, Rope/Anchor 언어와 분리 |

## 8. Acceptance

- Fan A/B의 Animation state와 실제 Wind force state가 항상 동일한 source를 사용해야 한다(README §56). 현재 `evaluateWindZone()`이 단일 source이므로 이 조건은 물리적으로 이미 충족되며, 렌더러가 같은 값을 읽기만 하면 된다.
- Fan B ACTIVE 중에도 통과 가능해야 한다(README §41) — LULL 대기가 유일한 정답이 되면 FAIL.
- Recovery Platform에서 Wind 때문에 계속 미끄러지지 않아야 한다(README §46) — 현재 Grounded 감쇠가 없으므로 R2/R4가 Wind Zone과 겹치는지 먼저 확인 필요.

## 9. 현재 구현과 다음 작업

| 범위 | 현재 | 다음 작업 |
| --- | --- | --- |
| 지형·Anchor·Gate | Runtime Mock 연결 완료 | R2·Neutral Deck 좌표를 README와 같은 변경에서 정리 |
| Wind 핵심 물리 | 구현 완료, 설계 범위 안 수치로 확정 | Wind Shadow·Grounded 감쇠 추가 여부 결정 |
| Approved Blockout | 없음 | 이 문서 §3 기준 SVG 제작 필요 |
| Camera | 문자열 placeholder만 존재 | `cameraZone()` 객체로 교체(§4 제안값 기준) |
| Story | 문자열 placeholder만 존재 | `AuthoredStoryPresentation.js`에 3개 트리거 연결. `bypass-required`는 1-7 Entry 문구와 함께 검토 |
| 오브젝트 그래픽 | Mock Shape(Fan은 `background-prop`/`wind-source` kind) | 공용 Sector 01 Atlas로 교체 |

## 10. 증강·Story 연결

[Sector 01 증강·스토리 통합 기준](../AUGMENT-STORY-INTEGRATION.md)에 따라 1-6은 Enemy 없이 진행되는 Stage이며 Foundation Augment는 등장하되 특별한 우열을 주지 않는다(README §26,42~44).

- Foundation 저장·효과가 아직 없으므로(1-4 판정 참고) Build별 Wind 상호작용 차이는 현재 재현되지 않는다.
- 1-6의 Wind는 1-7·1-8에서 동일 튜닝값으로 재사용될 예정이므로(README §24,34) 이 문서의 §3 Wind Zone 수치가 1-7·1-8 PRODUCTION-ALIGNMENT.md의 참조 기준이 된다.

---

SECTOR 01-6 / COOLING SHAFT — PRODUCTION ALIGNMENT · REV 1.0
