# SECTOR 01-5 — PRODUCTION ALIGNMENT

*IMPLEMENTATION · CAMERA · BUILD EXPRESSION HANDOFF · REV 1.0*

본 문서는 [1-5 시나리오](./README.md)를 현재 Runtime과 연결하는 제작 계약이다. 1-5는 1-1~1-4와 달리 `Approved Blockout`, `Scenario Art Reference`, Camera Zone 수치, Story Trigger 문구가 아직 하나도 존재하지 않는다. 이 문서는 새로 만드는 것이 아니라 이미 구현된 `Sector01AreaCatalog.js`의 `sector-01-05` 정의를 기준으로 처음 정리한다.

## 0. CURRENT RUNTIME OVERRIDE — 2026-08-17

- Foundation 선택·세 효과와 플레이어별 유지가 구현되어 Build 표현을 Runtime에서 검증할 수 있다.
- `cameraZones`는 실제 `cameraZone()` 객체로 구현됐고 `load-gap → relay-spine → live-security → exit` 구간을 사용한다.
- Story는 `AUGMENT TEST BAY / LIVE CALIBRATION` entry와 `VERTICAL LOAD TEST`, `SECURITY RESPONSE TEST` position binding이 구현됐다. 선택 Foundation 이름을 포함한 전체 진단 문구는 후속 표현 범위다.
- `storyTriggers`는 시나리오 기획 인벤토리이며 Runtime binding이나 완료 증거가 아니다.

> **AUTHORING SNAPSHOT — STATUS SUPERSEDED:** 아래 §1·§4·§5·§7~§9의 `NOT IMPLEMENTED`, 문자열 placeholder, Foundation 미구현 서술은 위 Current Runtime Override로 대체됐다. Geometry·좌표와 Approved Blockout 필요성 기록은 유지한다.

## 1. 현재 판정

| 항목 | 상태 | 판정 |
| --- | --- | --- |
| 960×1280 Geometry | `IMPLEMENTED` | P0, A~H Anchor, R1~R3, Safe Ledge, Final Deck이 Area Catalog에 존재 |
| A~H Anchor 좌표 | `IMPLEMENTED — README와 일치` | 8개 Anchor 전부 README 좌표와 Runtime 좌표가 정확히 일치 |
| P0/R1/R2/R3/Safe Ledge 좌표 | `IMPLEMENTED — README와 불일치` | Anchor와 달리 Platform 4개 중 3개(R1/R2/R3)의 위치가 README 초안과 다름. 아래 §3 참고 |
| Sentry T1 | `IMPLEMENTED` | 1-3 FSM 재사용, `activation` bounds 존재. 단 1-3에 있던 `cover-ends-los` rule 없음 |
| Impulse/Relay/Shear Route 분기 | `NOT IMPLEMENTED` | Foundation 저장·효과 자체가 [1-4 판정](../1-4/PRODUCTION-ALIGNMENT.md)에서 `PENDING`이므로 Build별 Shortcut·Route 차이는 현재 재현 불가 |
| Camera Zones | `NOT IMPLEMENTED` | `cameraZones: ["load-gap","relay-spine","live-security","exit"]`는 문자열 4개일 뿐 `{id,minY,maxY,desktopZoom,mobileZoom}` 객체가 아니다. `AuthoredCameraDirector`의 zone 판정 함수가 문자열을 걸러내므로 전체 Stage가 `defaultZoom`(1)과 기본 화면비(0.38/0.58)로만 렌더링된다 |
| Story Trigger Presentation | `NOT IMPLEMENTED` | `storyTriggers: ["active-augment-display","live-calibration","cooling-access-preview"]` 3개 모두 `AuthoredStoryPresentation.js`에 연결된 화면 문구가 없다 |
| Approved Blockout / Art Reference | `NEEDED` | `images/` 폴더 자체가 없음. 1-1~1-4와 달리 아직 아무 이미지도 존재하지 않는다 |

## 2. 자료 우선순위

1. 핵심 학습, Build별 공정성 규칙, 금지 요소는 [시나리오 README](./README.md)가 결정한다.
2. 실제 좌표와 충돌은 [`Sector01AreaCatalog.js`](../../../../../src/game/world/areas/sector01/Sector01AreaCatalog.js)의 `sector-01-05` 정의가 유일한 현재 기준이다. Approved Blockout이 아직 없으므로 이 문서의 §3 표가 그 역할을 임시로 대신한다.
3. README의 Platform 좌표(P0/R1/R2/R3/Safe Ledge)는 `HYPOTHESIS`로 취급한다. Anchor A~H는 README와 Runtime이 일치하므로 `DECIDED`로 취급한다.
4. Camera Zone과 Story Trigger 문구는 아직 Runtime에 없으므로 README의 서술(§54~60, §9)을 `PROTOTYPE HYPOTHESIS`로만 참고하고, 구현 전까지 이 문서의 표를 확정값처럼 인용하지 않는다.
5. Approved Blockout SVG와 Scenario Art Reference를 새로 만들 때는 [Scenario Art 생성 규격](../../SCENARIO-ART-GENERATION-STANDARD.md)을 따른다.

## 3. Runtime Geometry

좌표는 Stage Local World Unit이며 `X=-480~480`, `Y=0~-1280`. Platform은 `top-center`, Gate/Panel은 `bottom-center` 기준.

### Collision Surface

| ID | 중심/기준점 | 크기 | 속성 | README와 비교 |
| --- | --- | --- | --- | --- |
| P0 | `(-272,0)` | 288×32 | 시작 발판 | 일치 |
| R1 | `(-176,-448)` | 224×16, recovery | A 실패 Catch | **불일치** — README는 `(-96~128, -192)` |
| R2 | `(48,-768)` | 224×16, recovery | C/D Miss Catch | **불일치** — README는 `(-96~192, -608)`, 288×16 |
| Safe Ledge | `(-256,-928)` | 192×16, safe-deck | Turret Cycle 확인 | **불일치** — README는 `(-288~-96, -960)` |
| Safe Cover | `(-144,-928)` bottom-center | 32×96, cover | Turret LOS 차단 | 크기 일치, 위치는 Safe Ledge와 연동 재확인 필요 |
| R3 | `(176,-1088)` | 224×16, recovery | D/E Miss Catch | **불일치** — README는 `(32~256, -800)` |
| Final Deck | `(128,-1216)` | 320×32, safe-deck | Exit 진입 | README에 명시적 좌표 없음(Zone D 서술만 존재) |

### Anchor A~H

| ID | 위치 | README 대비 |
| --- | --- | --- |
| A | `(-160,-224)` | 일치 |
| B | `(224,-384)` | 일치 |
| C | `(-160,-544)` | 일치 |
| D | `(64,-640)` | 일치 |
| E | `(224,-752)` | 일치 |
| F | `(-128,-896)` | 일치 |
| G | `(32,-1040)` | 일치 |
| H | `(-128,-1168)` | 일치 |

8개 Anchor 전부 README §13~36과 Runtime 좌표가 정확히 일치한다. Platform류만 구현 중 재배치된 것으로 보이며, 이 문서 병합 시점 기준 원인은 확인되지 않았다.

### Gate·Objective

| 항목 | 값 |
| --- | --- |
| Exit Panel(exitBlock) | `(144,-1216)` bottom-center, `interactionRadius=72`, `exit-panel-engaged` 필요조건 `final-deck-reached` |
| Exit Gate(exitBlock) | `(256,-1216)` bottom-center |
| `final-deck-reached` | type `reach`, bounds `(-32,-1280)`~`288×96` |
| Gate 판정 좌표 | `(256,-1248)`, `portalBottomY=-1216`(exitBlock 표준) |

### Sentry T1

| 항목 | 값 |
| --- | --- |
| 위치 | `(384,-960)`, RIGHT WALL |
| activation | `x=-192~384`, `y=-1184~-736` |
| rules | `["standard-projectile","no-rope-cut"]` |

1-3 Sentry FSM(`idle→acquire→track→lock→fire→cooldown`)을 그대로 재사용한다. 단 1-3의 Turret에 있던 `cover-ends-los` rule이 1-5 Turret에는 없다. README §45가 우려한 "Auto-Fire가 Safe Ledge에 서 있기만 해도 Turret을 죽이는가"와는 별개로, Cover가 LOS를 차단하는지 자체를 먼저 확인해야 한다.

## 4. Camera Shot — 미구현, README 설계값만 존재

`cameraZones`가 문자열 배열이라 `AuthoredCameraDirector`는 이 Stage 전체에서 `zoom=1`, `horizontalPlayerRatio=0.38`, `verticalPlayerRatio=0.58` 고정값만 사용한다. 아래는 README §54~57이 제안한 값이며 구현 전까지 수치가 아니라 방향성으로만 참고한다.

| 제안 SHOT | Player Y 구간(README 기준) | 반드시 보일 것 |
| --- | --- | --- |
| Load Gap | `0~-416` | Player, B, 멀리 C 일부 |
| Relay Spine | `-416~-832` | 다음 Anchor(C→D→E) 연속 |
| Live Security | `-832~-1152` | Player, F, G, Turret, Safe Ledge |
| Exit | `-1152~-1280` | Build 체감 종료, 1-6 연결부 |

## 5. Story Trigger — 미구현

`storyTriggers` 3개 모두 `AuthoredStoryPresentation.js`에 대응 항목이 없다. README §58이 제안하는 문구는 다음과 같으며 `HYPOTHESIS`다.

| EVENT | README 제안 문구 |
| --- | --- |
| `active-augment-display` | `LIVE CALIBRATION` / `ACTIVE AUGMENT: [AUGMENT NAME]` |
| `live-calibration` | `VERTICAL LOAD TEST`, `SECURITY RESPONSE TEST`, `EMERGENCY TRANSIT TEST` (Background Monitor) |
| `cooling-access-preview` | `COOLING DISTRIBUTION`, `SERVICE ACCESS` (Exit 근처) |

`active-augment-display`는 선택한 Foundation 이름을 표시해야 하는데, [1-4 판정](../1-4/PRODUCTION-ALIGNMENT.md)에 따르면 Foundation 저장 자체가 아직 없으므로 이 트리거는 Foundation Runtime이 붙기 전까지 구현할 수 없다.

## 6. 저비용 Art Package

| LAYER | 최소 자산 | 배치 규칙 |
| --- | --- | --- |
| Far | Deep Shaft Silhouette, 대형 Corporate 구조물 | 낮은 Contrast·채도 |
| Mid | Load Test Frame 모듈(256×256), Crane, Cable Drum | 스테이지 중앙 랜드마크로 반복 조합 |
| Near | Load Gauge, Diagnostic Panel, Service Marking | Anchor 주변은 Clean Zone 유지, 특히 C/D/E |
| Gameplay | Platform Edge, Recovery Edge, Anchor, Turret | Mock Shape를 상태만 유지하며 교체 |

1-1~1-4와 같은 `1024×1024` 이하 Tile Atlas, `512×512` 이하 배경 모듈 Atlas를 재사용한다. Approved Blockout SVG가 없는 상태이므로 Art Reference보다 Blockout 제작이 우선이다.

## 7. Acceptance

- 세 Foundation 모두 Base Route로 클리어 가능해야 한다(현재 Foundation 자체가 미구현이므로 검증 불가 — Foundation Runtime 완료 후 재확인).
- Turret Auto-Fire만으로 Encounter가 종료되지 않아야 한다.
- README §75의 PASS 14개 항목 중 Route 분기 관련(PASS 02~04, 06)은 Foundation Runtime 없이는 확인 불가능하며, 나머지(PASS 01, 05, 07~13)는 기본 Rope만으로 검증 가능하다.

## 8. 현재 구현과 다음 작업

| 범위 | 현재 | 다음 작업 |
| --- | --- | --- |
| 지형·Anchor·Gate | Runtime Mock 연결 완료 | R1/R2/R3/Safe Ledge 좌표를 README와 같은 변경에서 정리하거나, README를 Runtime에 맞춰 갱신 |
| Approved Blockout | 없음 | 이 문서 §3을 기준으로 SVG 제작 필요 |
| Camera | 문자열 placeholder만 존재 | `cameraZone()` 객체로 교체 — 붙여넣기 가능한 값은 [Camera/Story Implementation Handoff](../CAMERA-STORY-IMPLEMENTATION-HANDOFF.md) Part 1 참고(§4 제안값은 그 문서로 대체됨) |
| Story | 문자열 placeholder만 존재 | `AuthoredStoryPresentation.js`에 3개 트리거 연결 — 붙여넣기 가능한 값은 [Camera/Story Implementation Handoff](../CAMERA-STORY-IMPLEMENTATION-HANDOFF.md) Part 2 참고. `active-augment-display`는 Foundation Runtime 선행 필요 |
| Build 분기(Impulse/Relay/Shear Route) | 미구현 | [1-4 §1](../1-4/PRODUCTION-ALIGNMENT.md)의 Foundation 저장·효과 구현 이후에만 의미 있음 |
| 오브젝트 그래픽 | Mock Shape | 공용 Sector 01 Atlas로 교체 |

## 9. 증강·Story 연결

[Sector 01 증강·스토리 통합 기준](../AUGMENT-STORY-INTEGRATION.md)에 따라 1-5는 1-4에서 선택한 Foundation을 처음 체감하는 Stage다.

- 현재 Foundation 저장·효과가 없으므로 이 Stage의 핵심 설계 의도(Build별 다른 최적 경로)는 Foundation Runtime이 붙기 전까지 재현되지 않는다.
- Sentry T1은 1-3과 동일한 Enemy를 재사용하며 새 Attack을 추가하지 않는다.
- Turret 파괴는 Gate 요구 조건이 아니다.

---

SECTOR 01-5 / AUGMENT TEST BAY — PRODUCTION ALIGNMENT · REV 1.0
