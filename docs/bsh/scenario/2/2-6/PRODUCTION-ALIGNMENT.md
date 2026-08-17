# SECTOR 02-6 — PRODUCTION ALIGNMENT

*IMPLEMENTATION · CAMERA · RELIEF HANDOFF · REV 1.0*

본 문서는 [2-6 시나리오](./README.md)를 현재 Runtime과 연결하는 제작 계약이다. 2-6은 Enemy 없는 Relief Stage로, 좌표가 README와 완전히 일치하며 Enemy 부재 결정도 코드와 일치한다.

## 0. CURRENT RUNTIME OVERRIDE — 2026-08-17

- Custom Camera Zone 없음은 의도된 기본 Camera 계약이다.
- README가 허용한 최소 위치 표지 `RESIDENTIAL BLOCKS 12–18` entry만 구현한다. 추가 해석 문구는 의도적으로 넣지 않았다.
- `storyTriggers`는 시나리오 기획 인벤토리다.

> **AUTHORING SNAPSHOT — STATUS SUPERSEDED:** 아래 Camera 전면 미구현과 Story 전면 미연결 서술은 위 Current Runtime Override로 대체됐다. Story 상태는 `MINIMAL ENTRY ONLY`다.

## 1. 현재 판정

| 항목 | 상태 | 판정 |
| --- | --- | --- |
| 1472×1216 Geometry(전체) | `IMPLEMENTED — README와 완전 일치` | P0~P6, R1, R3, Exit Deck, G1~G7 전부 좌표 일치(16개 전수 대조) |
| Enemy 없음 | `IMPLEMENTED — README와 일치` | `objects`에 `patrolDrone` 호출 없음. README §0의 "Enemy 없음"(Sector Master Plan의 `NONE or 0~1 distant non-engaging Drone` 중 `NONE` 선택)과 정확히 일치 |
| `courtyard-void` background-prop | `IMPLEMENTED` | `worldObject(..., "background-prop", 0, -608, {cueIds:["residential-scale","quiet-void"]})` — README §15 TRIGGER A/B(Window Field, Community Scale)의 환경 오브젝트 기반 |
| Camera Zones | `NOT IMPLEMENTED` | 필드 없음 |
| Story Trigger Presentation | `NOT IMPLEMENTED` | `storyTriggers: ["quiet-courtyard","residential-scale","upper-route-preview"]` 모두 미연결 |
| Approved Blockout / Art Reference | `NEEDED` | `images/` 폴더 없음 |

## 2. 자료 우선순위

1. Relief 리듬(Threat Density 하락, Negative Space 확대)은 [시나리오 README](./README.md)가 결정한다.
2. 좌표는 [`Sector02AreaCatalog.js`](../../../../../src/game/world/areas/sector02/Sector02AreaCatalog.js)의 `sector-02-06`이 기준이며, 이번 검증에서 전부 일치했다.

## 3. Runtime Geometry

### Collision Surface — 전수 일치

P0(-640~-384,0,256), P1(-576~-224,-160,352), P2(-256~+96,-384,352), R1(-96~+192,-640,288), P4(-448~-160,-832,288), R3(+224~+512,-832,288), P5(-64~+320,-992,384), P6(+320~+608,-1152,288), Exit Deck(+416~+672,-1152,256) — 9개 Surface + G1~G7 landmark 중심 전부 README §8과 정확히 일치(Exit Deck은 출구 표준화로 -1184→-1152, 32px 하강).

## 4. Camera·Story — 미구현

Camera Zone 없음. Story Trigger 3개 모두 미연결. README §14가 요구하는 "P5에서 아래 Courtyard + 수십 층 Housing + 2-7 Shelter 일부"는 검증 불가.

## 5. Acceptance

- "적이 없어도 Rope Movement 자체가 재미있는가"는 Gameplay Metric이며 코드로 검증 불가 — Blockout Playtest 대상.
- 좌표 관련 PASS는 이미 전부 충족.

## 6. 현재 구현과 다음 작업

| 범위 | 현재 | 다음 작업 |
| --- | --- | --- |
| 지형 | Runtime Mock 연결 완료, README와 완전 일치 | 없음 |
| Camera / Story | 없음 | Zone·Trigger 연결 |
| Far/Mid Background Scale | README §OPEN QUESTIONS 2가 "기존 배경이 부족하면 우선순위 최고" | Sector 02 공용 배경 재확인 후 결정(이미지 작업 범위) |

## 7. 증강·Story 연결

Foundation + Specialization 유지, 새 정보 없음 — 코드에도 Enemy·Augment·신규 cueId가 전혀 없어 README의 "새 Evacuation Evidence 없음" 원칙과 정확히 일치한다.

---

SECTOR 02-6 / QUIET RESIDENTIAL VOID — PRODUCTION ALIGNMENT · REV 1.0
