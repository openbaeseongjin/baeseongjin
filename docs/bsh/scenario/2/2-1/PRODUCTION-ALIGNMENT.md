# SECTOR 02-1 — PRODUCTION ALIGNMENT

*IMPLEMENTATION · CAMERA · STORY HANDOFF · REV 1.0*

본 문서는 [2-1 시나리오](./README.md)를 현재 Runtime과 연결하는 제작 계약이다. Sector 02는 Sector 01과 함께 이미 `CurrentAuthoredAreaCatalog`에 연결되어 실제 플레이 가능한 16개 Area 중 하나다 — Sector 03과 달리 "미연결" 상태가 아니다. 그럼에도 Camera Zone과 Story Trigger Presentation은 Sector 02 전체(2-1~2-8)에서 단 하나도 구현되어 있지 않다.

## 1. 현재 판정

| 항목 | 상태 | 판정 |
| --- | --- | --- |
| 1152×1024 Geometry | `IMPLEMENTED` | P0~P4, Exit Deck, R1~R4, G1~G4가 `Sector02AreaCatalog.js`의 `sector-02-01`에 존재 |
| Platform/Recovery 좌표 | `IMPLEMENTED — README와 일치` | P0~P4·R1~R4·Exit Deck 10개 전부 README §8 표와 정확히 일치 |
| G1~G4 Anchor 중심 좌표 | `IMPLEMENTED — README와 일치` | 4개 Landmark의 중심 X(=README의 left/right 중간값)·Y 전부 일치 |
| "G1–G4는 전용 Anchor Object가 아니다"(README §8) | `README와 불일치` | 실제로는 `landmark()` 헬퍼가 24×24 `grappleTarget` Surface **와** `worldObject(kind:"grapple-landmark")`를 매 Landmark마다 만든다 — Sector 01의 A/B/C/D Anchor와 동일한 메커니즘이다. 아래 §3 참고 |
| Community Notice Story Display | `IMPLEMENTED(오브젝트) / NOT IMPLEMENTED(문구)` | `worldObject(..., "story-display", 160, -952, {cueIds:["evacuation-group-c","wait-for-further-instruction"]})`는 존재하지만 `AuthoredStoryPresentation.js`에 실제 표시 문구가 연결되어 있지 않다 |
| Camera Zones | `NOT IMPLEMENTED` | `cameraZones` 필드 자체가 정의에 없다(1-5~1-8의 문자열 placeholder보다도 이전 단계 — 완전히 비어 있음). `AuthoredCameraDirector`는 이 Stage 전체에서 기본 zoom(1)·기본 화면비(0.38/0.58)만 사용 |
| Story Trigger Presentation | `NOT IMPLEMENTED` | `storyTriggers: ["block-12-entry","lived-in-trace","community-notice"]` 3개 모두 `AuthoredStoryPresentation.js`에 연결된 문구 없음 |
| Approved Blockout / Art Reference | `NEEDED` | `images/` 폴더 없음 |

## 2. 자료 우선순위

1. Story Reveal 순서(§3의 "아직 알아서는 안 되는 것" 목록), 톤 규칙은 [시나리오 README](./README.md)가 결정한다.
2. 실제 좌표는 [`Sector02AreaCatalog.js`](../../../../../src/game/world/areas/sector02/Sector02AreaCatalog.js)의 `sector-02-01` 정의(및 상단 공용 헬퍼 `platform()`/`landmark()`)가 기준이다.
3. `platform(areaId, id, left, right, y, kind)` 헬퍼는 `coordinateAnchor: "top-center"`를 쓰므로 `bounds.x`가 정확히 `left` 인자와 같다 — 즉 README의 "X: left~right" 표기가 코드 인자와 1:1 대응한다. 반면 `landmark(areaId, id, left, right, y)`의 `left`/`right`는 **중심 X를 계산하는 용도**일 뿐이며 실제 Surface는 그 중심에서 24×24 크기로만 생성된다.
4. Camera Zone과 Story Trigger는 아직 Runtime에 없으므로 README §14·§15는 방향성 참고용이다.
5. 재생성은 [Scenario Art 생성 규격](../../SCENARIO-ART-GENERATION-STANDARD.md)을 따른다.

## 3. Runtime Geometry

좌표는 Stage Local World Unit. `platform()`의 top-center 특성상 표의 X는 좌측 끝, Width는 `right - left`.

### Collision Surface

| ID | X(left~right) | Y | Width | 속성 | README 대비 |
| --- | --- | --- | --- | --- | --- |
| P0 | -416~-192 | 0 | 224 | Entry | 일치 |
| R1 | -352~-128 | -144 | 224 | recovery | 일치 |
| P1 | -192~+128 | -288 | 320 | platform | 일치 |
| R2 | 0~+224 | -400 | 224 | recovery | 일치 |
| P2 | +192~+480 | -544 | 288 | platform | 일치 |
| R3 | -128~+96 | -592 | 224 | recovery | 일치 |
| P3 | -448~-160 | -736 | 288 | platform | 일치 |
| R4 | -96~+128 | -784 | 224 | recovery | 일치 |
| P4 | +32~+352 | -928 | 320 | safe-deck | 일치 |
| Exit Deck | +288~+544 | -992 | 256 | safe-deck | 일치 |

10개 Surface 전부 README §8과 정확히 일치한다 — Sector 01에서 발견됐던 것과 같은 종류의 드리프트가 2-1에는 없다.

### Landmark(G1~G4) — 실제 Anchor 중심

| ID | 중심 X | Y | 실제 Surface 크기 |
| --- | --- | --- | --- |
| G1 | -224 | -192 | 24×24 `grappleTarget` |
| G2 | +192 | -448 | 24×24 `grappleTarget` |
| G3 | +64 | -640 | 24×24 `grappleTarget` |
| G4 | -96 | -832 | 24×24 `grappleTarget` |

각 중심은 README §8 표의 `(left+right)/2`와 정확히 일치한다. 단 README §8 자체가 "G1–G4는 전용 Anchor Object가 아니라 Level Design Landmark일 뿐"이라고 명시하는데, `landmark()` 헬퍼는 실제로 `grappleTarget(24×24)` Surface **+** `worldObject(kind:"grapple-landmark")`를 함께 생성한다 — Sector 01 1-1의 A/B/C/D와 완전히 같은 구조다. 즉 "전용 Anchor Object가 없다"는 설계 의도는 현재 구현과 다르다.

### Gate·Objective·Story Object

| 항목 | 값 |
| --- | --- |
| Exit Panel | `(304,-928)` bottom-center, `interactionRadius=72`, objective `exit-panel-engaged` |
| Exit Frame(Gate) | `(416,-992)` bottom-center |
| `exit-reached` | type `reach`, bounds `(352,-1024)`~`128×96` |
| Community Notice | `(160,-952)`, kind `story-display`, cueIds `["evacuation-group-c","wait-for-further-instruction"]` |
| Gate 판정 좌표 | `(416,-992)` → `sector-02-02` |

## 4. Camera — 완전 미구현

`cameraZones` 필드가 area 정의에 아예 없다(빈 배열 기본값). README §14가 제안하는 Opening Composition·Central Courtyard 구도는 아직 어떤 형태로도 구현되지 않았다.

## 5. Story Trigger — 미구현

| EVENT | README 제안 문구 |
| --- | --- |
| `block-12-entry` | `WORKER DISTRICT` / `BLOCK 12` |
| `lived-in-trace` | 환경 오브젝트로만 전달(Laundry, Locker 등) — 별도 텍스트 트리거 아님 |
| `community-notice` | `COMMUNITY NOTICE` / `EVACUATION GROUP C` / `ASSEMBLY: BLOCK 12 CENTRAL WALKWAY` / `STATUS: WAIT FOR FURTHER INSTRUCTION` |

`community-notice` cueId는 실제 오브젝트(`community-notice` story-display)에 이미 연결되어 있으므로, 나머지 두 트리거보다 구현 우선순위가 명확하다.

## 6. Enemy / Hazard

README와 코드 모두 Enemy 없음으로 일치(`objects`에 Enemy/Drone 계열 없음).

## 7. 저비용 Art Package

README §16·17의 Near Residential Layer(Balcony, Laundry, Housing Door 등) 우선 제작, Far/Mid는 기존 Sector 02 공용 배경 재사용 — 이 방향은 코드 검증 대상이 아니라 순수 아트 결정이므로 [Scenario Art 생성 규격](../../SCENARIO-ART-GENERATION-STANDARD.md)을 따른다.

## 8. Acceptance

- README §21 PASS 중 "Enemy 없음"·"New Mechanic 없음"은 이미 코드로 충족.
- "실패 후 5초 안에 재시도 가능"은 좌표상 R1~R4가 각 Landmark 바로 아래(예: R1 Y-144 vs G1 Y-192)에 위치해 구조적으로 뒷받침된다.
- Camera·Story 관련 PASS 항목은 현재 검증 불가(미구현).

## 9. 현재 구현과 다음 작업

| 범위 | 현재 | 다음 작업 |
| --- | --- | --- |
| 지형·Landmark·Gate | Runtime Mock 연결 완료, README와 좌표 정합성 높음 | 없음(이미 일치) |
| Anchor 설계 문서(§8) | README가 "전용 Anchor 아님"이라 서술 | 실제 구현(전용 24×24 grappleTarget)과 일치하도록 §8 서술을 재검토하거나, 반대로 향후 구현을 "비전용" 방식으로 바꿀지 결정 필요 — 문서와 코드 중 하나를 맞추는 결정이 필요하다 |
| Camera | 없음 | `cameraZone()` 객체 추가 |
| Story | Community Notice 오브젝트만 존재 | 3개 트리거 전부 `AuthoredStoryPresentation.js` 연결 |
| 오브젝트 그래픽 | Mock Shape(`grapple-landmark`, `gate-panel`, `gate`, `story-display`) | 공용 Sector 02 Atlas로 교체 |

## 10. 증강·Story 연결

2-1은 Foundation Augment를 유지만 하고 새로 부여하지 않는다(README §0). 코드 확인 결과 이 Area에는 `augment-node`나 관련 objective가 없어 README의 "새 Augment 없음" 원칙과 일치한다.

Group C 관련 Story Reveal 순서: 2-1은 `evacuation-group-c`/`wait-for-further-instruction` cueId만 소유하며, `ASSEMBLY COMPLETE`(2-5)·`TRANSFER SUSPENDED`(2-7)·`GROUP A/B COMPLETE + PRIORITY ACCESS`(2-8)로 이어지는 순서를 앞지르지 않는다 — 이는 실제 각 Area의 cueId 구성으로도 확인된다(2-1은 `evacuation-group-c`만, 2-5는 `assembly-complete`, 2-7은 `evacuation-transfer-suspended`(cueId 상)/`transfer-suspended`(storyTrigger 상), 2-8은 `group-a-complete`/`group-b-complete`/`group-c-suspended`/`priority-access-active`).

---

SECTOR 02-1 / WORKER BLOCK 12 — PRODUCTION ALIGNMENT · REV 1.0
