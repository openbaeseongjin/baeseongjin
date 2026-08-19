# SECTOR 02-7 — PRODUCTION ALIGNMENT

*IMPLEMENTATION · CAMERA · SEQUENTIAL DRONE HANDOFF · REV 1.0*

본 문서는 [2-7 시나리오](./README.md)를 현재 Runtime과 연결하는 제작 계약이다. 2-7은 Sector 02 Final Build-up Stage로 두 Patrol Drone이 순차 등장한다. 지형 좌표는 README와 완전히 일치하며, 두 Drone 모두 배치가 다르다.

## 0. CURRENT RUNTIME OVERRIDE — 2026-08-17

- Custom Camera Zone 없음은 의도된 기본 Camera 계약이다.
- Shelter Access entry와 Capacity/Transfer/Designated Area 위치 Story가 구현됐다.
- `storyTriggers`는 시나리오 기획 인벤토리다.
- 0.41.0부터 기존 `shelter-centre-guard(64,-640)` slot이 `sector-02:access-module:c` Carrier다. 두 Patrol band와 적 수·위치·activation은 바꾸지 않으며 Sector 02의 세 번째 3-of-3 source를 맡는다.
- 0.42.0부터 Carrier 위치 문자열은 제거하고 화면 밖 edge arrow와 화면 안 diamond marker를 같은 module world position에서 전환한다.

> **AUTHORING SNAPSHOT — STATUS SUPERSEDED:** 아래 Camera/Story 미구현 서술은 위 Current Runtime Override로 대체됐다.

## 1. 현재 판정

| 항목 | 상태 | 판정 |
| --- | --- | --- |
| 1408×1440 Geometry(전체) | `IMPLEMENTED — README와 완전 일치` | P0~P8, S2, S4, R2, R4, Exit Deck, G1~G10/G8S 전부 좌표 일치(23개 전수 대조) |
| Drone 1/2 순차·구역 분리 | `IMPLEMENTED(구조)` | 두 `patrolDrone` 호출이 서로 다른 activation bounds를 가져 README의 "동시 Crossfire 금지" 구조 요구를 충족한다 |
| Drone 1 Patrol 범위 | `IMPLEMENTED — README와 불일치` | 코드 `(-416,-400)~(256,-400)`. README `(-224,-416)~(288,-416)` |
| Drone 2 Patrol 범위 | `IMPLEMENTED — README와 불일치` | 코드 `(-320,-1080)~(480,-1080)`. README `(-96,-1088)~(416,-1088)` |
| Drone 1/2 activation 겹침 여부 | `NOT OVERLAPPING(Y축)` | Drone 1 activation `y:-640~-160`, Drone 2 activation `y:-1320~-832` — Y축으로 완전히 분리되어 README §19-3 "Crossfire Invariant"를 좌표 구조로 충족 |
| `shelter-status` Story Display | `IMPLEMENTED(오브젝트) / NOT IMPLEMENTED(문구)` | `worldObject(..., "story-display", 0, -824, {cueIds:["shelter-capacity-full","evacuation-transfer-suspended","remain-designated-area"]})` — README §15 TRIGGER C 문구와 cueId가 정확히 대응 |
| Camera Zones | `NOT IMPLEMENTED` | 필드 없음 |
| Story Trigger Presentation | `NOT IMPLEMENTED` | `storyTriggers: ["shelter-capacity-full","transfer-suspended","evacuation-platform-preview"]` 모두 미연결 |
| Approved Blockout / Art Reference | `NEEDED` | `images/` 폴더 없음 |

## 2. 자료 우선순위

1. Story Reveal(`EVACUATION TRANSFER SUSPENDED`를 여기서 최초 명시, Group A/B·Priority Access 금지)는 [시나리오 README](./README.md)가 결정한다.
2. 좌표는 [`Sector02AreaCatalog.js`](../../../../../src/game/world/areas/sector02/Sector02AreaCatalog.js)의 `sector-02-07`이 기준이며, 지형은 전부 일치했다.
3. 두 Drone 범위는 README를 `HYPOTHESIS`로 취급하고 Runtime 값을 우선한다.

## 3. Runtime Geometry

### Collision Surface — 전수 일치

P0(-608~-352,0,256), P1(-512~-160,-160,352), S2(-608~-320,-448,288), P3(-160~160,-480,320), R2(288~544,-480,256), P4(-96~224,-640,320), P5(-320~320,-800,640), S4(-576~-288,-1024,288), R4(288~544,-1024,256), P7(-32~320,-1216,352), P8(320~608,-1376,288), Exit Deck(416~672,-1376,256) — 12개 Surface + G1~G10·G8S landmark 중심 전부 README §8과 정확히 일치(Exit Deck은 출구 표준화로 -1408→-1376, 32px 하강).

### Patrol Drone 1 / 2

| 항목 | Drone 1 Runtime | Drone 1 README | Drone 2 Runtime | Drone 2 README |
| --- | --- | --- | --- | --- |
| Start | `(-416,-400)` | `(-224,-416)` | `(-320,-1080)` | `(-96,-1088)` |
| End | `(256,-400)` | `(288,-416)` | `(480,-1080)` | `(416,-1088)` |
| Activation | `x:-640~640, y:-640~-160` | 명시 없음 | `x:-640~640, y:-1320~-832` | 명시 없음 |

Mid Safe Shelter Deck(P5, Y-800)이 Drone 1 activation(하한 -160, 상한 -640)과 Drone 2 activation(하한 -832)의 정확히 사이에 위치해, README §19-2 "P5에서는 두 Drone 모두 새 Acquire 금지"가 activation bounds만으로 이미 구조적으로 성립한다.

## 4. Camera·Story — 미구현

Camera Zone 없음. Story Trigger 3개 모두 미연결이지만 `shelter-status` 오브젝트의 cueId가 README TRIGGER C와 이미 정확히 대응.

## 5. Acceptance

- "Crossfire 0" PASS는 activation Y범위 비겹침으로 구조적으로 충족.
- "Mid Safe Deck이 실제 완전 Safe"는 위 activation 분석으로 뒷받침되나, 기발사 Projectile 잔존 가능성(README §19-3 자체가 인정)은 Blockout 검증 대상으로 남는다.

## 6. 현재 구현과 다음 작업

| 범위 | 현재 | 다음 작업 |
| --- | --- | --- |
| 지형 | Runtime Mock 연결 완료, README와 완전 일치 | 없음 |
| 두 Drone 배치 | 구현됨, README와 위치 다름(둘 다) | 실제 좌표 기준 Lower/Upper Encounter 난이도 재검토 |
| Story Display 문구 | 오브젝트만 존재 | `AuthoredStoryPresentation.js`에 3개 트리거 연결 |
| Camera | 없음 | Zone 객체 추가 |

## 7. 증강·Story 연결

`shelter-status`의 cueId(`shelter-capacity-full`, `evacuation-transfer-suspended`, `remain-designated-area`)는 2-5의 `assembly-complete`/`upper-transit-restricted`를 잇고 2-8의 `group-a/b/c-*`/`priority-access-active`로 이어지는 정확한 다음 단계 — Story Reveal 순서가 코드 cueId 구성상 어긋나지 않는다. Foundation + Specialization을 활용할 기회는 제공하되 필수 Key는 아님 — 코드에 Build 종속 로직 없음.

---

SECTOR 02-7 / SHELTER ACCESS — PRODUCTION ALIGNMENT · REV 1.0
