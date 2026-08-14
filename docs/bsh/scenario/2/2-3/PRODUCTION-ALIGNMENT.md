# SECTOR 02-3 — PRODUCTION ALIGNMENT

*IMPLEMENTATION · CAMERA · SPECIALIZATION HANDOFF · REV 1.0*

본 문서는 [2-3 시나리오](./README.md)를 현재 Runtime과 연결하는 제작 계약이다. 2-3은 Sector 02의 첫 Specialization Rest Stage이며, 좌표 정합성이 이번에 검증한 8개 Stage 중 가장 높다 — 모든 Surface·Node 위치가 README와 정확히 일치한다.

## 1. 현재 판정

| 항목 | 상태 | 판정 |
| --- | --- | --- |
| 960×768 Geometry | `IMPLEMENTED — README와 완전 일치` | P0~P3, R1, Exit Deck, G1/G2, Specialization Node 전부 좌표 일치 |
| Specialization Node | `IMPLEMENTED(뼈대) / PENDING(실제 효과)` | `worldObject(..., "augment-node", 0, -416, {interactionRadius, objectiveId, selectionPool:"TBD", requiresFoundation:true, perPlayerSelection:true, cueIds:["foundation-detected","specialization-available"]})`. `selectionPool:"TBD"`가 README §0 "SYSTEM GATE — 아직 LOCKED가 아니다"와 정확히 일치 |
| Objective 타입 | `IMPLEMENTED` | `type:"interact-choice"` — [1-4](../../1/1-4/PRODUCTION-ALIGNMENT.md)의 `augment-selected`와 동일 타입. 단 1-4 판정에서 확인했듯 `WorldProgressController`는 현재 `reach`/`interact`만 처리하고 `interact-choice`는 처리하지 않는다 — 즉 이 Objective는 **Sector 02에서도 아직 완료될 수 없다** |
| Selection Input 재사용(`ArtifactRewardSelection`) | `README 서술만 존재, 직접 확인 필요` | README §19-1이 "VERIFIED"로 표기하지만 이 Area 정의 자체는 Selection UI 로직을 포함하지 않는다(UI는 별도 시스템) |
| Camera Zones | `NOT IMPLEMENTED` | 필드 없음 |
| Story Trigger Presentation | `NOT IMPLEMENTED` | `storyTriggers: ["residential-service","foundation-detected","specialization-available"]` 3개 모두 미연결 |
| Approved Blockout / Art Reference | `NEEDED` | `images/` 폴더 없음 |

## 2. 자료 우선순위

1. Specialization의 설계 원칙(Foundation 방향 심화, 새 버튼 금지)은 [시나리오 README](./README.md)가 결정한다.
2. 좌표는 [`Sector02AreaCatalog.js`](../../../../../src/game/world/areas/sector02/Sector02AreaCatalog.js)의 `sector-02-03`이 기준이며, 이번 검증에서 전부 일치했다.
3. `interact-choice` 완료 로직이 없다는 사실은 [1-4 판정](../../1/1-4/PRODUCTION-ALIGNMENT.md)과 동일한 `BLOCKED` 상태로 취급한다 — 별도 재구현이 아니라 공통 `WorldProgressController` 확장이 선행되어야 한다.

## 3. Runtime Geometry

### Collision Surface

| ID | X(left~right) | Y | Width | 속성 | README 대비 |
| --- | --- | --- | --- | --- | --- |
| P0 | -416~-160 | 0 | 256 | Entry | 일치 |
| P1 | -352~+32 | -160 | 384 | safe-deck | 일치 |
| P2 | -224~+224 | -384 | 448 | safe-deck | 일치 |
| R1 | -32~+224 | -576 | 256 | recovery | 일치 |
| P3 | +96~+384 | -672 | 288 | platform | 일치 |
| Exit Deck | +160~+448 | -736 | 288 | safe-deck | 일치 |

### Node·Landmark

| ID | 중심 X | Y |
| --- | --- | --- |
| Specialization Node | 0 | -416 |
| G1 | +192 | -512 |
| G2 | -32 | -608 |

전부 README §8과 일치.

### Gate·Objective

| 항목 | 값 |
| --- | --- |
| `specialization-selected` | type `interact-choice`, sourceObjectId `specialization-node` — **완료 불가**(§1 참고) |
| Exit Panel | 좌표는 exitPanel 헬퍼로 계산(exit.x-112, floorY=-672) |
| Gate | `(304,-736)` → `sector-02-04` |

## 4. Camera·Story — 미구현

Camera Zone 없음. Story Trigger 3개 모두 미연결. README §15가 제안하는 문구(`RESIDENTIAL SERVICE / BLOCK 12–14`, `GRAPPLE DEVICE DETECTED`, `FOUNDATION AUGMENT DETECTED / SPECIALIZATION AVAILABLE`)는 방향성 참고용.

## 5. Enemy / Hazard

Enemy 없음 — 코드·README 일치.

## 6. Acceptance

- 좌표 관련 PASS 항목은 이미 충족.
- "Specialization이 새 Rope Mode가 아님"은 `interact-choice` 자체가 아직 완료되지 않으므로 실질적으로 검증 불가 상태 — Foundation Runtime([1-4](../../1/1-4/PRODUCTION-ALIGNMENT.md))과 함께 재확인 필요.

## 7. 현재 구현과 다음 작업

| 범위 | 현재 | 다음 작업 |
| --- | --- | --- |
| 지형·Node 위치 | Runtime Mock 연결 완료, README와 완전 일치 | 없음 |
| `interact-choice` 완료 | BLOCKED(공통 문제) | `WorldProgressController`에 `interact-choice` 처리 추가 — [1-4](../../1/1-4/PRODUCTION-ALIGNMENT.md)와 공동 해결 대상 |
| Specialization Catalog | `selectionPool: "TBD"` | 카탈로그 확정 후 Node에 연결 |
| Camera / Story | 없음 | Zone·Trigger 연결 |

## 8. 증강·Story 연결

2-3은 Sector 02의 첫 Specialization 선택 지점이다. `requiresFoundation:true`가 README의 "1-4 Foundation이 유지되어야 함" 요구와 일치한다. `perPlayerSelection:true`는 README §19-4의 멀티플레이 독립 선택 요구와 일치.

---

SECTOR 02-3 / RESIDENTIAL SERVICE NODE — PRODUCTION ALIGNMENT · REV 1.0
