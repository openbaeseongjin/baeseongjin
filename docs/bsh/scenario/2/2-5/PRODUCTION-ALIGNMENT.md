# SECTOR 02-5 — PRODUCTION ALIGNMENT

*IMPLEMENTATION · CAMERA · STORY PRESSURE HANDOFF · REV 1.0*

본 문서는 [2-5 시나리오](./README.md)를 현재 Runtime과 연결하는 제작 계약이다. 2-5는 Sector 02의 첫 명시적 Evacuation Story Pressure Stage다. 지형·Gate 좌표는 README와 완전히 일치하며, Upper Transit Gate의 `grappleable:false` 봉쇄까지 정확히 구현되어 있다.

## 0. CURRENT RUNTIME OVERRIDE — 2026-08-17

- Custom Camera Zone 없음은 의도된 기본 Camera 계약이다.
- Evacuation Walkway entry와 Assembly/Upper Transit 위치 Story가 구현됐다.
- `storyTriggers`는 시나리오 기획 인벤토리다.

> **AUTHORING SNAPSHOT — STATUS SUPERSEDED:** 아래 Camera/Story 미구현 서술은 위 Current Runtime Override로 대체됐다.

## 1. 현재 판정

| 항목 | 상태 | 판정 |
| --- | --- | --- |
| 1280×1152 Geometry(전체) | `IMPLEMENTED — README와 완전 일치` | P0~P4, S1, R1, Exit Deck, G1~G7, Upper Transit Gate 전부 좌표 일치(15개 전수 대조) |
| Upper Transit Gate 봉쇄 | `IMPLEMENTED — 정확히 일치` | `rectangle("upper-transit-blockade", 544, -416, 64, 320, {kind:"sealed-door", oneWay:false, grappleable:false, coordinateAnchor:"bottom-center"})` → bounds `x:512~576, y:-736~-416`. README §8의 `Gate +512~+576, Y-416~-736, W64`와 정확히 일치. `grappleable:false`는 README §19-4("일반 대피 경로가 아니다")를 물리적으로 뒷받침 |
| `upper-transit-gate`(narrativeLock) | `IMPLEMENTED` | `worldObject(..., "gate", 544, -576, {coordinateAnchor:"center", narrativeLock:true, cueIds:["upper-transit-restricted","transfer-authorization-pending"]})` — README §19-4의 "Gate는 Puzzle이 아니다" 요구와 일치하는 별도 Story 전용 오브젝트 |
| Patrol Drone T1 | `IMPLEMENTED` | [2-2](../2-2/PRODUCTION-ALIGNMENT.md)와 동일 범용 구현 |
| Drone Patrol 범위 | `IMPLEMENTED — README와 불일치` | 코드 `(-320,-512)~(352,-512)`. README `(-128,-544)~(320,-544)` |
| `evacuation-status` Story Display | `IMPLEMENTED(오브젝트) / NOT IMPLEMENTED(문구)` | `worldObject(..., "story-display", 352, -704, {cueIds:["assembly-complete","transfer-authorization-pending","upper-transit-restricted"]})` — README §15 TRIGGER C의 정확한 문구 요소가 cueId로 이미 존재하지만 실제 Presentation 문구는 없음 |
| Camera Zones | `NOT IMPLEMENTED` | 필드 없음 |
| Story Trigger Presentation | `NOT IMPLEMENTED` | `storyTriggers: ["assembly-complete","upper-transit-restricted","maintenance-bypass"]` 모두 미연결 |
| Approved Blockout / Art Reference | `NEEDED` | `images/` 폴더 없음 |

## 2. 자료 우선순위

1. Story Reveal 순서(`ASSEMBLY COMPLETE`/`TRANSFER AUTHORIZATION PENDING`/`UPPER TRANSIT ACCESS RESTRICTED` — 2-5가 최초 공개, Group A/B·`SUSPENDED` 금지)는 [시나리오 README](./README.md)가 결정한다.
2. 좌표는 [`Sector02AreaCatalog.js`](../../../../../src/game/world/areas/sector02/Sector02AreaCatalog.js)의 `sector-02-05`가 기준이며, Gate 봉쇄를 포함해 전부 일치했다.
3. Drone 범위는 README를 `HYPOTHESIS`로 취급하고 Runtime 값을 우선한다.

## 3. Runtime Geometry

### Collision Surface — 전수 일치

P0(-608~-352,0,256), P1(-512~-192,-160,320), S1(-512~-192,-352,320), P2(-256~448,-448,704), P3(224~512,-672,288), R1(64~320,-832,256), P4(32~320,-1024,288), Exit Deck(320~608,-1088,288) — 8개 Surface + Upper Transit Gate Blockade(§1 참고) + G1~G7 landmark 중심 전부 README §8과 정확히 일치(Exit Deck은 출구 표준화로 -1120→-1088, 32px 하강).

### Patrol Drone T1

| 항목 | Runtime | README |
| --- | --- | --- |
| Patrol Start | `(-320,-512)` | `(-128,-544)` |
| Patrol End | `(352,-512)` | `(320,-544)` |
| Activation | `x:-576~480, y:-720~-240` | 명시 없음 |

## 4. Camera·Story — 미구현

Camera Zone 없음. Story Trigger 3개 모두 미연결이지만, `evacuation-status`·`upper-transit-gate` 두 오브젝트의 cueId가 README §15 TRIGGER C 문구와 이미 정확히 대응되어 있어 구현 시 매핑이 명확하다.

## 5. Acceptance

- "Public Upper Transit Gate는 열리지 않는다" PASS는 `grappleable:false` + `narrativeLock:true`로 이미 물리적으로 보장됨.
- "Story 읽는 동안 공격받지 않음"은 Drone activation(`y:-720~-240`)이 Story Display(Y-704) 및 Gate(Y-416~-736) 구간과 상당 부분 겹쳐, README §19-3이 요구하는 "P3 이후 새 Attack Cycle 금지" 로직이 실제로 필요함을 시사한다 — 활성화 범위만으로는 자동 보장되지 않으므로 Blockout 검증 필수.

## 6. 현재 구현과 다음 작업

| 범위 | 현재 | 다음 작업 |
| --- | --- | --- |
| 지형·Gate 봉쇄 | Runtime Mock 연결 완료, README와 완전 일치 | 없음 |
| Drone 배치 | 구현됨, README와 위치 다름 | 실제 좌표 기준 Encounter Bounds(§19-3) 재검토 — Drone activation이 Story Zone과 겹치는지 우선 확인 |
| Story Display 문구 | 오브젝트만 존재 | `AuthoredStoryPresentation.js`에 3개 트리거 연결 |
| Camera | 없음 | Zone 객체 추가 |

## 7. 증강·Story 연결

Foundation + Specialization 유지, 새 Augment 없음 — 코드에 `augment-node` 없어 일치. `evacuation-status`의 cueId(`assembly-complete`, `transfer-authorization-pending`, `upper-transit-restricted`)는 2-1의 `evacuation-group-c`를 잇고 2-7의 `evacuation-transfer-suspended`·2-8의 `group-a/b/c-*`로 이어지는 정확한 다음 단계다 — Story Reveal 순서가 코드 cueId 구성상으로도 어긋나지 않는다.

---

SECTOR 02-5 / EVACUATION WALKWAY — PRODUCTION ALIGNMENT · REV 1.0
