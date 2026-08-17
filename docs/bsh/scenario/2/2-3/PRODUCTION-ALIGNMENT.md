# SECTOR 02-3 — PRODUCTION ALIGNMENT

*IMPLEMENTATION · CAMERA · SPECIALIZATION HANDOFF · REV 1.1*

본 문서는 [2-3 시나리오](./README.md)를 현재 Runtime과 연결하는 제작 계약이다. 2-3은 Sector 02의 첫 Specialization Rest Stage이며, 좌표 정합성이 이번에 검증한 8개 Stage 중 가장 높다 — 모든 Surface·Node 위치가 README와 정확히 일치한다.

## 1. 현재 판정

| 항목 | 상태 | 판정 |
| --- | --- | --- |
| 960×768 Geometry | `IMPLEMENTED — README와 완전 일치` | P0~P3, R1, Exit Deck, G1/G2, Specialization Node 전부 좌표 일치 |
| Specialization Node | `IMPLEMENTED(뼈대) / PENDING(실제 효과)` | `worldObject(..., "augment-node", 0, -416, {interactionRadius, objectiveId, selectionPool:"TBD", requiresFoundation:true, perPlayerSelection:true, cueIds:["foundation-detected","specialization-available"]})`. `selectionPool:"TBD"`가 README §0 "SYSTEM GATE — 아직 LOCKED가 아니다"와 정확히 일치 |
| Objective 타입 | `IMPLEMENTED / CONTENT BLOCKED` | 공용 `interact-choice` 요청은 구현됐지만 `selectionPool:"TBD"`라 Specialization chooser와 결과 적용은 아직 열 수 없음 |
| Selection Input 재사용(`FoundationRewardSelection`) | `README 서술만 존재, 직접 확인 필요` | README §19-1이 "VERIFIED"로 표기하지만 이 Area 정의 자체는 Selection UI 로직을 포함하지 않는다(UI는 별도 시스템) |
| Camera Zones | `NOT IMPLEMENTED` | 필드 없음 |
| Story Trigger Presentation | `NOT IMPLEMENTED` | `storyTriggers: ["residential-service","foundation-detected","specialization-available"]` 3개 모두 미연결 |
| Approved Blockout / Art Reference | `NEEDED` | `images/` 폴더 없음 |

## 2. 자료 우선순위

1. Specialization의 설계 원칙(Foundation 방향 심화, 새 버튼 금지)은 [시나리오 README](./README.md)가 결정한다.
2. 좌표는 [`Sector02AreaCatalog.js`](../../../../../src/game/world/areas/sector02/Sector02AreaCatalog.js)의 `sector-02-03`이 기준이며, 이번 검증에서 전부 일치했다.
3. 공용 `interact-choice` 요청·개인 입력 중립화·멀티 claim 패턴은 [1-4 판정](../../1/1-4/PRODUCTION-ALIGNMENT.md)에서 구현됐다. 2-3의 남은 blocker는 Specialization Catalog·효과·결과 저장 계약이며 Foundation 세 선택지를 그대로 재사용하지 않는다.

## 3. Runtime Geometry

### Collision Surface

| ID | X(left~right) | Y | Width | 속성 | README 대비 |
| --- | --- | --- | --- | --- | --- |
| P0 | -416~-160 | 0 | 256 | Entry | 일치 |
| P1 | -352~+32 | -160 | 384 | safe-deck | 일치 |
| P2 | -224~+224 | -384 | 448 | safe-deck | 일치 |
| R1 | -32~+224 | -576 | 256 | recovery | 일치 |
| P3 | +96~+384 | -672 | 288 | platform | 일치 |
| Exit Deck | +160~+448 | -704 | 288 | safe-deck | 표준화(offset 64)로 32px 하강 |

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
| `specialization-selected` | type `interact-choice`, sourceObjectId `specialization-node` — 공용 요청은 가능하지만 `selectionPool:"TBD"`라 chooser 개방 불가 |
| Exit Panel(exitBlock) | `(304,-704)`, exit.x-112 |
| Gate | `(416,-704)` → `sector-02-04`(exitBlock 표준) |

## 4. Camera·Story — 미구현

Camera Zone 없음. Story Trigger 3개 모두 미연결. README §15가 제안하는 문구(`RESIDENTIAL SERVICE / BLOCK 12–14`, `GRAPPLE DEVICE DETECTED`, `FOUNDATION AUGMENT DETECTED / SPECIALIZATION AVAILABLE`)는 방향성 참고용.

## 5. Enemy / Hazard

Enemy 없음 — 코드·README 일치.

## 6. Acceptance

- 좌표 관련 PASS 항목은 이미 충족.
- "Specialization이 새 Rope Mode가 아님"은 Specialization Catalog·효과가 미확정이므로 아직 실질 검증 불가 — 구현 시 Foundation Runtime([1-4](../../1/1-4/PRODUCTION-ALIGNMENT.md)) 위에 별도 성장 계층으로 재확인한다.

## 7. 현재 구현과 다음 작업

| 범위 | 현재 | 다음 작업 |
| --- | --- | --- |
| 지형·Node 위치 | Runtime Mock 연결 완료, README와 완전 일치 | 없음 |
| `interact-choice` 완료 | 공용 요청 구현 / 콘텐츠 미완료 | Specialization Catalog·효과·저장 계약 확정 뒤 전용 chooser 결과 적용 연결 |
| Specialization Catalog | `selectionPool: "TBD"` | 카탈로그 확정 후 Node에 연결 |
| Camera / Story | 없음 | Zone·Trigger 연결 |

## 8. 증강·Story 연결

2-3은 Sector 02의 첫 Specialization 선택 지점이다. `requiresFoundation:true`가 README의 "1-4 Foundation이 유지되어야 함" 요구와 일치한다. `perPlayerSelection:true`는 README §19-4의 멀티플레이 독립 선택 요구와 일치.

---

SECTOR 02-3 / RESIDENTIAL SERVICE NODE — PRODUCTION ALIGNMENT · REV 1.1
