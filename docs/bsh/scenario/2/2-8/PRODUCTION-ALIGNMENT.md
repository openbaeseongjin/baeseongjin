# SECTOR 02-8 — PRODUCTION ALIGNMENT

*IMPLEMENTATION · CAMERA · SECTOR FINALE HANDOFF · REV 1.0*

본 문서는 [2-8 시나리오](./README.md)를 현재 Runtime과 연결하는 제작 계약이다. 2-8은 Sector 02 일반 진행 Finale로, Group A/B/C Transfer 결과와 Priority Access를 최초 공개하는 Story Climax이자 Sector-end Checkpoint 지점이다.

## 0. CURRENT RUNTIME OVERRIDE — 2026-08-17

- Custom Camera Zone 없음은 의도된 기본 Camera 계약이다.
- Transfer Control objective 완료 시 Group A/B Complete → Group C Suspended → `PRIORITY ACCESS: ACTIVE`를 순서대로 표시한다.
- Exit panel의 미사용 `cueIds` 경로는 제거했고 objective presentation을 단일 Runtime 소유자로 사용한다.
- `storyTriggers`는 시나리오 기획 인벤토리다.

> **AUTHORING SNAPSHOT — STATUS SUPERSEDED:** 아래 Camera/Story 미구현 및 panel `cueIds`가 구현을 보장한다는 서술은 위 Current Runtime Override로 대체됐다. Geometry·Drone 비교 기록은 유지한다.

## 1. 현재 판정

| 항목 | 상태 | 판정 |
| --- | --- | --- |
| 1536×1536 Geometry(전체) | `IMPLEMENTED — README와 완전 일치` | P0~P2, P9, P10, S2/S5, B2/B5, M2, G1~G11/G2A/G8S 전부 좌표 일치(11개 Surface + 13개 Landmark 전수 대조) |
| Transfer Control | `IMPLEMENTED — 정확히 일치` | `worldObject(..., "gate-panel", 448, -1472, {bottom-center, interactionRadius, objectiveId, gateId, cueIds:["group-a-complete","group-b-complete","group-c-suspended","priority-access-active"]})` — 출구 표준화(offset 64)로 데크가 -1440→-1472가 되면서 README의 `Y-1472` 표기와 정확히 일치하게 됐다(기존 32px anchor 표기 차이 해소) |
| `transfer-control-read` Objective | `IMPLEMENTED` | type `interact`, sourceObjectId `transfer-control` — 별도 `reach` 없이 단일 interact로 완료(1-7/1-8과 같은 패턴) |
| Sector-end Checkpoint | `IMPLEMENTED — 출구 표준화로 32px 이동` | `(576,-1472)`, README의 `+544~+608, Y-1440`(중심 576)에서 데크와 함께 Y-1472로 이동. `sourceObjectId: sector-end-checkpoint-object` |
| Content Boundary Gate | `IMPLEMENTED` | `gate(area08Id:gate, 576, -1472, null, [transfer-control-read.id], {completionMode:"content-boundary"})` — `nextAreaId: null`로 Sector 03 미연결을 코드 레벨에서도 확정. README §19-8 "Post-Sector Transition 미확정"과 정확히 일치 |
| Drone 1 Patrol 범위 | `IMPLEMENTED — Y 일치, X 불일치` | 코드 `(-448,-544)~(448,-544)`. README `(-160,-544)~(352,-544)` — Y는 정확히 일치, X 폭은 코드가 훨씬 넓다(896 vs 512) |
| Drone 2 Patrol 범위 | `IMPLEMENTED — README와 불일치` | 코드 `(-384,-1088)~(480,-1088)`. README `(-96,-1024)~(416,-1024)` — Y 64px 차이, X도 다름 |
| Drone 1/2 activation 겹침 | `NOT OVERLAPPING(Y축)` | Drone 1 `y:-768~-160`, Drone 2 `y:-1376~-800` — 거의 접하지만 겹치지 않아 README의 Crossfire 금지 요구를 구조적으로 충족 |
| Camera Zones | `NOT IMPLEMENTED` | 필드 없음 |
| Story Trigger Presentation | `NOT IMPLEMENTED` | `storyTriggers: ["evacuation-platform","transfer-control","priority-access-active"]` 모두 미연결. Sector 02 전체(2-1~2-8) 24개 Story Trigger 중 구현된 것은 0개 |
| Approved Blockout / Art Reference | `NEEDED` | `images/` 폴더 없음 |

## 2. 자료 우선순위

1. Story Climax 공개 범위(A/B Complete, C Suspended, Priority Access Active — 단 계급적 의미·인과관계는 비공개)는 [시나리오 README](./README.md)가 결정한다.
2. 좌표는 [`Sector02AreaCatalog.js`](../../../../../src/game/world/areas/sector02/Sector02AreaCatalog.js)의 `sector-02-08`이 기준이며, 지형·Checkpoint는 전부 일치했다.
3. Post-Sector 03 전환은 이 문서도, README도 확정하지 않는다 — `gate.nextAreaId: null`이 그 유보 상태를 코드로 이미 반영하고 있다.
4. 두 Drone의 정확한 범위는 README를 `HYPOTHESIS`로 취급하고 Runtime 값을 우선한다.

## 3. Runtime Geometry

### Collision Surface — 전수 일치

P0(-640~-384,0,256), P1(-512~-128,-160,384), P2(-160~160,-320,320), S2(-672~-352,-448,320), B2(288~608,-448,320), M2(-224~224,-736,448), S5(-576~-288,-1088,288), B5(288~576,-1088,288), P9(-160~224,-1280,384), P10(256~608,-1472,352) — 10개 Surface + G1~G11·G2A·G8S landmark 중심 전부 README §8과 정확히 일치(P10만 출구 표준화로 -1440→-1472, 32px 상승).

### Patrol Drone 1 / 2

| 항목 | Drone 1 Runtime | Drone 1 README | Drone 2 Runtime | Drone 2 README |
| --- | --- | --- | --- | --- |
| Start | `(-448,-544)` | `(-160,-544)` | `(-384,-1088)` | `(-96,-1024)` |
| End | `(448,-544)` | `(352,-544)` | `(480,-1088)` | `(416,-1024)` |
| Y 일치 여부 | 일치 | — | 64px 차이 | — |
| Activation | `x:-704~704, y:-768~-160` | 명시 없음 | `x:-704~704, y:-1376~-800` | 명시 없음 |

### Transfer Control · Checkpoint

| 항목 | 값 |
| --- | --- |
| Transfer Control(exitBlock panel) | `(464,-1472)` bottom-center, objective `transfer-control-read`(type `interact`) |
| Sector-end Checkpoint | `(576,-1472)`, `sourceObjectId: sector-end-checkpoint-object` |
| Content Boundary Gate | `(576,-1472)`, `nextAreaId: null`, `completionMode: "content-boundary"`(exitBlock 표준) |

## 4. Camera·Story — 미구현

Camera Zone 없음. Story Trigger 3개 모두 미연결이지만 `transfer-control`의 cueId(`group-a-complete`, `group-b-complete`, `group-c-suspended`, `priority-access-active`)가 README §15 TRIGGER C 문구와 정확히 대응되어 있어 구현 매핑이 명확하다.

## 5. Acceptance

- "Final Story 이전에 Checkpoint 활성 0건" PASS는 좌표 배치(Transfer Control X448 < Checkpoint X576, 둘 다 Y-1472)로 Player가 Transfer Control을 먼저 지나야 Checkpoint에 닿는 구조가 자연스럽게 뒷받침한다.
- "지속 Crossfire 없음"은 activation Y범위 비겹침(격차 32px, `-800`~`-768`)으로 구조적으로 충족되나 여유가 크지 않아 기발사 Projectile 잔존 여부를 Blockout에서 반드시 확인해야 한다(README §19-7도 동일하게 경고).
- Checkpoint radius는 `WORLD_CONFIG.checkpointRadius = 38`(Sector 01에서 검증된 값)과 동일 시스템을 사용할 것으로 예상되며, README §OPEN QUESTIONS 4가 요구한 "Final Story Display와 동선이 겹치지 않는지" 확인은 아직 미착수.

## 6. 현재 구현과 다음 작업

| 범위 | 현재 | 다음 작업 |
| --- | --- | --- |
| 지형·Checkpoint·Gate | Runtime Mock 연결 완료, README와 거의 완전 일치(P10·Transfer Control·Checkpoint는 출구 표준화로 32px 상승) | 없음 |
| 두 Drone 배치 | 구현됨, README와 범위 다름 | 실제 좌표 기준 Lower/Upper Band 난이도 재검토, activation 32px 간격 재확인 |
| Story Display 문구 | 오브젝트만 존재 | `AuthoredStoryPresentation.js`에 3개 트리거 연결 — Sector 02 전체 24개 트리거 연결 작업의 마지막 조각 |
| Camera | 없음 | Zone 객체 추가 |
| Post-Sector 03 전환 | `nextAreaId: null`로 유보 | [`sector-timer-and-boss-flow.md`](../../../../sector-timer-and-boss-flow.md) 확정 대기 |

## 7. 증강·Story 연결

`transfer-control`의 cueId 4개가 Sector 02 전체 Story Reveal의 최종 단계를 정확히 구현한다 — 2-1의 `evacuation-group-c`, 2-5의 `assembly-complete`/`transfer-authorization-pending`, 2-7의 `evacuation-transfer-suspended`를 거쳐 2-8에서 처음 `group-a-complete`/`group-b-complete`/`group-c-suspended`/`priority-access-active`가 공개되는 순서가 코드 cueId 구성상으로도 정확히 유지된다. Group A/B 정체·Priority 대상·인과관계를 암시하는 cueId는 어디에도 없다. Foundation·Specialization은 Checkpoint 이후에도 유지되어야 한다는 README 요구는 코드가 별도의 초기화 로직을 갖고 있지 않으므로(Area 진입 시 Player 상태를 리셋하는 코드 없음) 자연스럽게 충족된다.

---

SECTOR 02-8 / EVACUATION PLATFORM — PRODUCTION ALIGNMENT · REV 1.0
