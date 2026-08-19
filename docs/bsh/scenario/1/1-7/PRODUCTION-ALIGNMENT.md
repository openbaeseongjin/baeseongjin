# SECTOR 01-7 — PRODUCTION ALIGNMENT

*IMPLEMENTATION · CAMERA · SYSTEM COMBINATION HANDOFF · REV 1.0*

본 문서는 [1-7 시나리오](./README.md)를 현재 Runtime과 연결하는 제작 계약이다. 1-7은 새 Mechanic 없이 Rope·Augment·Sentry·Wind를 처음 한 공간에서 겹치는 Stage다. 좌표 정확도는 1-1~1-4 수준으로 높지만, Camera·Story·Art는 1-5·1-6과 마찬가지로 아직 없다.

## 0. CURRENT RUNTIME OVERRIDE — 2026-08-17

- Foundation 선택·세 효과가 구현되어 Safe/Flow/Build Route 차이를 Runtime에서 검증할 수 있다.
- `cameraZones`는 실제 객체로 구현되어 Approach·Security·Decision·Pressure·Relief·Bypass 구도를 사용한다.
- Story는 entry, `PRESSURE LIMIT EXCEEDED`, `CONTAINMENT VIOLATION ACTIVE`, bypass objective/gate binding으로 핵심 흐름이 구현됐다.
- `storyTriggers`는 시나리오 기획 인벤토리이며 Bypass 이후 환경 상태 변화는 별도 World presentation 범위다.
- 2026-08-18부터 Stage 폭은 3840px이며 기존 Sentry T1 stable ID와 행동을 오른쪽 Annex Arena `(1320,-944)`에서 Access Carrier C로 사용한다. Bridge `(560,-944, 736×16)`, Arena `(1320,-944, 800×32)`, Access Anchor `(480,-800)`, `(928,-864)`는 Stage-local 좌표다. 0.41.0의 3-of-3 계약에서 세 Carrier를 모두 요구한다.

> **AUTHORING SNAPSHOT — STATUS SUPERSEDED:** 아래 §1·§4·§5·§7~§9의 Foundation/Camera/Story 미구현 서술은 위 Current Runtime Override로 대체됐다. 좌표와 미검증 Knockback+Wind 기록은 유지한다.

## 1. 현재 판정

| 항목 | 상태 | 판정 |
| --- | --- | --- |
| 3840×1536 Geometry | `IMPLEMENTED` | 기존 960px Pressure spine과 오른쪽 Access Annex가 Area Catalog에 존재 |
| A~G Anchor, P0, Safe Shadow, R3 좌표 | `IMPLEMENTED — README와 일치` | README §12,13~39와 정확히 일치(1-5/1-6보다 드리프트가 적음) |
| Manual Bypass Control Y | `IMPLEMENTED — README와 32px 오차` | README `-1440`, Runtime `-1472` |
| Access Carrier C | `IMPLEMENTED` | 위치 `(1320,-944)`, 기존 Sentry T1 stable ID와 `rules: ["standard-projectile","no-rope-cut"]` 행동 재사용 |
| Residual Airflow + Main Pressure Vent | `IMPLEMENTED` | Main Pressure Vent는 1-6 Fan B와 **완전히 동일한 수치**(strength 360, cycle 1.75/0.7/1.4/0.3) 재사용 — README §24("1-6에서 튜닝된 값을 우선 재사용")를 그대로 만족 |
| Turret + Wind 중첩(D→E 구간) | `IMPLEMENTED(물리) / NOT VERIFIED(체감 밸런스)` | 두 Zone이 좌표상 겹치는 것은 확인됨. 실제 플레이 밸런스(README §63 "Knockback+Wind로 바닥까지 추락 금지")는 미검증 |
| Build 분기(Impulse/Relay/Shear Route) | `NOT IMPLEMENTED` | [1-4 판정](../1-4/PRODUCTION-ALIGNMENT.md)의 Foundation 저장·효과가 없으므로 재현 불가 |
| Camera Zones | `NOT IMPLEMENTED` | 문자열 6개(`approach, security-entry, decision-frame, pressure-crossing, relief, bypass`)만 존재 |
| Story Trigger Presentation | `NOT IMPLEMENTED` | `storyTriggers` 6개 모두 미연결 |
| Approved Blockout / Art Reference | `NEEDED` | `images/` 폴더 없음 |

## 2. 자료 우선순위

1. Beat 구조(A 접근 → B 보안 복습 → C 복합 교차 → D 수동 Bypass), 금지 요소는 [시나리오 README](./README.md)가 결정한다.
2. 실제 좌표·Wind·Sentry 수치는 [`Sector01AreaCatalog.js`](../../../../../src/game/world/areas/sector01/Sector01AreaCatalog.js)의 `sector-01-07` 정의가 기준이다.
3. Wind 수치는 1-6과 동일 튜닝을 재사용하므로 [1-6 판정](../1-6/PRODUCTION-ALIGNMENT.md) §3 Wind Zone 표와 반드시 함께 확인한다. 두 문서 중 하나만 고치면 어긋난다.
4. Manual Bypass Control의 32px Y 오차는 `HYPOTHESIS`로 취급하고 Runtime 값을 우선한다.
5. 재생성은 [Scenario Art 생성 규격](../../SCENARIO-ART-GENERATION-STANDARD.md)을 따른다.

## 3. Runtime Geometry

좌표는 `X=-480~480`, `Y=0~-1536`.

### Collision Surface

| ID | 중심/기준점 | 크기 | 속성 | README와 비교 |
| --- | --- | --- | --- | --- |
| P0 | `(-256,0)` | 320×32 | 시작 발판 | 일치 |
| R1 | `(-144,-192)` | 224×16, recovery | A 실패 Catch | 크기 일치(README는 위치 미명시) |
| R2 | `(144,-512)` | 224×16, recovery | A→B 실패 Catch | 크기 일치(README는 위치 미명시) |
| Safe Shadow | `(-256,-864)` bottom-center Cover 포함 | 192×16 + Cover 64×96 | Turret LOS·Main Vent 차단 | 일치(플랫폼·Cover 폭 모두) |
| R3 | `(64,-944)` | 256×16, recovery | D/E 실패 Catch | 일치 |
| Upper Catch | `(-64,-1264)` | 256×16, recovery | F 이후 실패 Catch | README에 명시적 좌표 없음 |
| Final Deck | `(224,-1472)` | 320×32, safe-deck | Bypass Control 진입 | README에 명시적 좌표 없음 |

### Anchor A~G

전부 README §13~39와 정확히 일치: A `(-128,-224)`, B `(160,-416)`, C `(224,-608)`, D `(-192,-832)`, E `(224,-1056)`, F `(-32,-1216)`, G `(128,-1376)`.

### Sentry T1

| 항목 | 값 | README 대비 |
| --- | --- | --- |
| 위치 | `(1320,-944)`, 오른쪽 Access Annex Arena | 2026-08-18 Current Runtime Override |
| activation | `x=-320~320`, `y=-1184~-544` | — |
| rules | `["standard-projectile","no-rope-cut"]` | README §56·57 요구사항 충족 |

1-3 Sentry FSM 재사용. Turret 하나만 존재(README §58 "두 번째 Turret 금지" 충족).

### Wind Zone

| ID | bounds(x,y,w×h) | 방향 | mode | strength | cycle |
| --- | --- | --- | --- | --- | --- |
| `residual-airflow` | `(-320,-640,672×384)` | `{1,0}` RIGHT | continuous | 90 | — |
| `main-pressure-vent-wind` | `(-352,-1184,704×384)` | `{1,0}` RIGHT | pulsed | 360 | lull 1.75 / warning 0.7 / active 1.4 / decay 0.3 |

`main-pressure-vent-wind`는 [1-6 판정](../1-6/PRODUCTION-ALIGNMENT.md)의 `fan-b-wind`와 강도·주기가 완전히 동일하다. Residual Airflow는 README가 정확한 수치를 지정하지 않았고(§14 "strength: LOW"만 명시) 코드가 90으로 확정했다.

### Gate·Objective

| 항목 | 값 |
| --- | --- |
| Manual Bypass Control | `(256,-1472)` bottom-center, `interactionRadius=72`, objective `bypass-open` | 
| Containment Route Gate | `(320,-1472)` bottom-center |
| `bypass-open` | type `interact`, sourceObjectId `manual-bypass-control` (별도 `reach` Objective 없음 — 1-5/1-6과 구조가 다름) |
| Gate 판정 좌표 | `(352,-1504)`, `portalBottomY=-1472`(exitBlock 표준) |

## 4. Camera Shot — 미구현, README 설계값만 존재

문자열 placeholder 6개는 전부 필터링되어 Stage 전체가 기본값(zoom 1, 0.38/0.58)만 사용한다. README §45~49가 제안한 방향:

| 제안 SHOT | 반드시 보일 것(README 기준) |
| --- | --- |
| Approach | Player, A, B, Pressure Core 일부 |
| Security Entry | D, Turret T1, Safe Shadow, Vent 일부 |
| Decision Frame | Player·Turret·Anchor E·Main Vent·Safe Shadow 중 최소 4개 동시(D 위치) |
| Pressure Crossing | E→F 진행, 다음 안전지대 예고 |
| Relief | F 이후 Turret 화면 밖, G·Bypass Control·Exit 중심 |
| Bypass | Story/Relief 전환 |

## 5. Story Trigger — 미구현

`storyTriggers` 6개 모두 미연결. README §6이 제안하는 순서와 문구:

| EVENT | README 제안 문구 |
| --- | --- |
| `pressure-unstable` | `PRESSURE NETWORK UNSTABLE`(진입) |
| `containment-violation` | `CONTAINMENT VIOLATION ACTIVE`(Turret 활성) |
| `pressure-limit` | `PRESSURE LIMIT EXCEEDED`(상승 중) |
| `bypass-ready` | `MANUAL BYPASS READY`(최상단 도달) |
| `bypass-open` | `OPEN BYPASS` → 밸브 작동 → `PRESSURE: STABILIZING` → `SERVICE ROUTE: AVAILABLE` |
| `service-route-available` | Gate 개방과 동기화 |

`bypass-open` 완료 뒤 README §43은 Fan/Steam/Alarm 상태 변화(Bypass 이후 환경 변화)를 요구하지만 이는 별도 Story Presentation 이상의 World State 변경이 필요해 Story Trigger 구현과 분리해 검토해야 한다.

## 6. 저비용 Art Package

| LAYER | 최소 자산 | 배치 규칙 |
| --- | --- | --- |
| Far | Vertical Cooling Network, 거대 Pipe 실루엣 | 낮은 Contrast |
| Mid | Central Pressure Valve Core(256×384 이상), Vent Housing(192~256px) | Stage 시각 중심. D 위치에서 Gameplay를 가리지 않게 밀도 조절 |
| Near | Pressure Gauge, Conduit, Warning Sign | Turret/Anchor 주변 Clean Zone |
| Gameplay | Platform Edge, Recovery Edge, Anchor, Sentry, Panel | Mock Shape 상태만 유지하며 교체 |

## 7. Acceptance

- README §66 PASS 15개 중 Build 분기 관련(PASS 06,07)은 Foundation Runtime 없이는 확인 불가.
- PASS 08(Standard projectile이 Rope를 끊지 않음)은 이미 `rules`에 `no-rope-cut`으로 구현됨 — Acceptance Capture로 시각 확인만 남음.
- PASS 11(한 번 피격으로 Stage 바닥까지 추락 금지)은 Knockback+Wind 상호작용 테스트가 필요하며 현재 미검증.
- FAIL 조건 중 "Wind와 Turret가 동시에 처음 등장"은 Zone B(C→D 구간, Wind 없음)와 Zone C(D→E, Wind+Turret)의 좌표 분리로 이미 구조적으로 충족되어 있다: Turret activation은 `y=-1184~-544`, `main-pressure-vent-wind`는 `y=-1184~-800`으로 겹치는 구간이 D~E 부근에 한정된다.

## 8. 현재 구현과 다음 작업

| 범위 | 현재 | 다음 작업 |
| --- | --- | --- |
| 지형·Anchor·Sentry·Wind | Runtime Mock 연결 완료, README와 좌표 정합성 높음 | Manual Bypass Control Y 32px 오차만 정리 |
| Approved Blockout | 없음 | 이 문서 §3 기준 SVG 제작 필요 |
| Camera | 문자열 placeholder만 존재 | `cameraZone()` 객체로 교체 — 붙여넣기 가능한 값은 [Camera/Story Implementation Handoff](../CAMERA-STORY-IMPLEMENTATION-HANDOFF.md) Part 1 참고(§4 제안값은 그 문서로 대체됨), 특히 Decision Frame(D 위치) 구도 우선 |
| Story | 문자열 placeholder만 존재 | 6개 트리거 연결 — 붙여넣기 가능한 값은 [Camera/Story Implementation Handoff](../CAMERA-STORY-IMPLEMENTATION-HANDOFF.md) Part 2 참고. Bypass 이후 환경 상태 변화는 별도 검토 |
| Build 분기 | 미구현 | [1-4 §1](../1-4/PRODUCTION-ALIGNMENT.md) Foundation Runtime 선행 필요 |
| Knockback+Wind 상호작용 | 미검증 | Acceptance Capture 전 필수 테스트 항목 |

## 9. 증강·Story 연결

[Sector 01 증강·스토리 통합 기준](../AUGMENT-STORY-INTEGRATION.md)에 따라 1-7은 세 Foundation이 처음 실전 조합으로 검증되는 Stage다.

- Foundation 저장·효과가 없으므로 IMPULSE/RELAY/SHEAR별 Route 차이(README §32~36)는 현재 재현되지 않는다.
- README §72(LOCKED DECISIONS)에 따라 Manual Pressure Bypass는 도시 복구가 아니라 위쪽 탈출 경로 개방이 목적이며, 일반 Sentry Projectile은 Rope를 끊지 않는다 — 두 결정 모두 이미 Runtime `rules: ["standard-projectile","no-rope-cut"]`와 objective 구조(별도 reach 없이 interact 하나로 Gate 개방)로 일치한다.
- Bypass 이후 "잠깐 안정화 → 1-8 Containment로 다시 악화"라는 Story Logic(README §72 Q3)은 1-8 PRODUCTION-ALIGNMENT.md와 함께 확인해야 한다.

---

SECTOR 01-7 / PRESSURE BYPASS — PRODUCTION ALIGNMENT · REV 1.0
