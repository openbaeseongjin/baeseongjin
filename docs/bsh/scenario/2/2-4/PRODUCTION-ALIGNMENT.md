# SECTOR 02-4 — PRODUCTION ALIGNMENT

*IMPLEMENTATION · CAMERA · MULTI-ROUTE HANDOFF · REV 1.0*

본 문서는 [2-4 시나리오](./README.md)를 현재 Runtime과 연결하는 제작 계약이다. 2-4는 Sector 02의 첫 본격 Multi-Route Stage로, Safe Perimeter / Central Flow / Pressure Line 세 경로 좌표가 README와 전부 일치한다. Drone 배치만 크게 다르다.

## 1. 현재 판정

| 항목 | 상태 | 판정 |
| --- | --- | --- |
| 1408×1280 Geometry(23개 Surface) | `IMPLEMENTED — README와 완전 일치` | P0/P1, S1~S4, C1, R2/R3, P4, M3, P7, Exit Deck, G1~G9/G8A 전부 좌표 일치(21개 전수 대조) |
| Patrol Drone T1 이동/전투 AI | `IMPLEMENTED` | [2-2 판정](../2-2/PRODUCTION-ALIGNMENT.md)과 동일 — `EnemyObject`+`EnemyPatrol.js` 합성 기능으로 실제 구현됨. README §19-1·OPEN QUESTIONS #2의 "Generic Enemy에는 Patrol 이동이 없다"는 REV 1.0 시점 서술이었으며 REV 1.1에서 갱신됐다 |
| Drone 1 Patrol 범위 | `IMPLEMENTED — README와 불일치` | 코드: `(-416,-768)~(416,-768)`. README §8: `(+64,-624)~(+480,-624)`. X 범위·Y 모두 다름 |
| Safe Outer Climb(S2→S3) | `README가 스스로 HYPOTHESIS로 명시` | README §8 "별도 전용 Anchor Object를 추가하지 않는다"와 일치 — 코드에도 S2/S3 사이 전용 Anchor 없음 |
| Camera Zones | `NOT IMPLEMENTED` | 필드 없음 |
| Story Trigger Presentation | `NOT IMPLEMENTED` | `storyTriggers: ["housing-density","route-choice","residential-scale"]` 모두 미연결 |
| Approved Blockout / Art Reference | `NEEDED` | `images/` 폴더 없음 |

## 2. 자료 우선순위

1. Multi-Route 설계 원칙(Build Lock 금지, 세 경로 모두 상호 연결)은 [시나리오 README](./README.md)가 결정한다.
2. 좌표는 [`Sector02AreaCatalog.js`](../../../../../src/game/world/areas/sector02/Sector02AreaCatalog.js)의 `sector-02-04`가 기준이며, 전수 대조 결과 완전히 일치했다.
3. Drone 범위는 README를 `HYPOTHESIS`로 취급하고 Runtime 값을 우선한다.

## 3. Runtime Geometry

### Collision Surface — 전수 대조 결과

| Safe Perimeter | Central Flow | Pressure Line |
| --- | --- | --- |
| S1(-640~-352,-384,288) | C1(-128~160,-416,288) | P4(160~512,-704,352) |
| S2(-640~-320,-608,320) | R2(-64~352,-640,416) | R3(288~576,-864,288) |
| S3(-608~-288,-832,320) | M3(0~352,-1088,352) | |
| S4(-512~-192,-1056,320) | | |

P0(-576~-320,0,256), P1(-448~-64,-192,384), P7(288~608,-1216,320), Exit(352~640,-1248,288) 포함 21개 Surface 전부 README §8과 정확히 일치. G1~G9·G8A landmark 중심 좌표도 전부 일치.

### Patrol Drone T1

| 항목 | Runtime | README |
| --- | --- | --- |
| Patrol Start | `(-416,-768)` | `(+64,-624)` |
| Patrol End | `(+416,-768)` | `(+480,-624)` |
| Activation | `x:-640~640, y:-1120~-320` | 명시 없음 |
| rules | `["kill-optional","no-rope-cut","target-lock-cycle","activation-band-only"]` | 요구사항과 일치 |

Runtime Patrol Y(-768)가 README(-624)보다 144px 낮다(더 위쪽 Zone에 위치) — README의 "Patrol Crossing"(Zone C, Y -544~-800) 범위 안에는 들지만, G4(Y-512)·G5/G6(Y-672)보다 훨씬 아래에서 순찰한다는 뜻이라 실제 Encounter 체감이 설계와 다를 수 있다.

## 4. Camera·Story — 미구현

Camera Zone 없음. Story Trigger 3개 모두 미연결. README §15 제안 문구(`WORKER DISTRICT BLOCK 12–14 RESIDENTIAL STACK`, `LEVEL 18/19/20`)는 방향성 참고용.

## 5. Acceptance

- "모든 Build가 모든 Route 사용 가능" PASS는 좌표상 세 Route가 R2/M3 등에서 실제로 교차하므로 구조적으로 뒷받침된다.
- Drone Y 위치가 README보다 낮으므로 "Route 중간 전환 가능" 검증 시 Drone 실제 위치 기준으로 재확인 필요.

## 6. 현재 구현과 다음 작업

| 범위 | 현재 | 다음 작업 |
| --- | --- | --- |
| 지형(21개 Surface) | Runtime Mock 연결 완료, README와 완전 일치 | 없음 |
| Patrol Drone AI | 구현 완료, README REV 1.1에서 갱신 완료 | 없음 |
| Drone 배치 | 구현됨, README와 위치 다름 | 실제 Y(-768) 기준으로 세 Route Exposure 밸런스 재검토 |
| `surface.grappleable` | 미구현(README §19-3이 이미 조건부 도입 원칙 명시) | Wrong Attach 데이터 확보 후 결정 — 이 문서 범위 밖 |
| Camera / Story | 없음 | Zone·Trigger 연결 |

## 7. 증강·Story 연결

Specialization 실제 효과 확정 전이므로 Route Efficiency 검증은 보류 상태 — [2-3 판정](../2-3/PRODUCTION-ALIGNMENT.md)의 `interact-choice` BLOCKED 상태와 연동된다. Story 관련 cueId는 코드에 없으며(순수 환경 밀도로만 전달) README의 "2-5 Evacuation Text 선행 금지" 원칙과 일치한다.

---

SECTOR 02-4 / RESIDENTIAL STACK — PRODUCTION ALIGNMENT · REV 1.0
