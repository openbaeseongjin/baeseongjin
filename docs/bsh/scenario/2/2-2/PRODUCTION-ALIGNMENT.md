# SECTOR 02-2 — PRODUCTION ALIGNMENT

*IMPLEMENTATION · CAMERA · PATROL DRONE HANDOFF · REV 1.0*

본 문서는 [2-2 시나리오](./README.md)를 현재 Runtime과 연결하는 제작 계약이다. 2-2는 Sector 02에서 Patrol Drone T1이 처음 등장하는 Stage다. README는 "PatrolDrone 전용 구현이 확인되지 않는다"(§19-1, OPEN QUESTIONS #4)고 적었지만, 이는 이제 사실이 아니다 — Patrol 이동은 `EnemyObject`에 통합된 범용 기능으로 실제 구현되어 있다.

## 1. 현재 판정

| 항목 | 상태 | 판정 |
| --- | --- | --- |
| 1280×1088 Geometry(대부분) | `IMPLEMENTED` | P0~P3, Cover A/B, Exit Deck, G1~G5가 존재 |
| **P4(Relief Deck)** | `NOT IMPLEMENTED` | README §8이 명시한 `P4 (-320~+32, -864, 352px, "Relief Deck")`가 Runtime Catalog에 **존재하지 않는다** — `p0,p1,cover-a,p2,cover-b,p3,exit-deck` + landmark 5개뿐이며 `p4`라는 이름의 Surface도, 그 위치의 어떤 Surface도 없다 |
| Patrol Drone T1 이동/전투 AI | `IMPLEMENTED` | README의 서술과 달리 실제로 구현되어 있다. `EnemyObject.js`가 `EnemyPatrol.js`의 `advanceEnemyPatrol/createEnemyPatrolState`를 직접 사용하며, 타겟이 없을 때 patrol, 있을 때 기존 `idle→acquire→track→lock→fire→cooldown` FSM으로 전환한다. 새 Enemy 클래스가 아니라 기존 `EnemyObject`의 합성 기능이다 |
| Drone 1 Patrol 범위 | `IMPLEMENTED — README와 불일치` | 코드: `X -320~+320, Y -416`. README §8/§24: `X -32~+416, Y -416`. 폭·중심 모두 다르다. 아래 §3 참고 |
| Drone rules | `IMPLEMENTED` | `["kill-optional","no-rope-cut","target-lock-cycle","activation-band-only"]` — README의 Kill Optional/No Rope Cut/No Unlimited Chase 요구와 일치 |
| G1~G5 Anchor | `IMPLEMENTED — 중심 좌표 일치` | 단 2-1과 동일하게 실제로는 전용 24×24 `grappleTarget` + `worldObject`가 존재한다 |
| Camera Zones | `NOT IMPLEMENTED` | 필드 자체 없음 |
| Story Trigger Presentation | `NOT IMPLEMENTED` | `storyTriggers: ["patrol-cycle-reveal","security-still-active"]` 둘 다 미연결 |
| Approved Blockout / Art Reference | `NEEDED` | `images/` 폴더 없음 |

## 2. 자료 우선순위

1. Drone 학습 목표(위협을 보고 나서 대응, 무한 추격 금지 등)는 [시나리오 README](./README.md)가 결정한다.
2. 실제 좌표·Drone 범위는 [`Sector02AreaCatalog.js`](../../../../../src/game/world/areas/sector02/Sector02AreaCatalog.js)가 기준이다.
3. Drone 구현 상태에 대한 README의 "미구현" 서술은 **더 이상 사실이 아니다** — `EnemyObject.js` + `EnemyPatrol.js`를 확인하고 진행한다.
4. P4 누락은 README(설계) 쪽이 Runtime(구현)보다 앞서 있는 사례로 취급하고, Runtime 값을 기준으로 진행하되 P4가 의도적으로 제거된 것인지 확인이 필요한 항목으로 별도 표기한다.

## 3. Runtime Geometry

### Collision Surface

| ID | X(left~right) | Y | Width | 속성 | README 대비 |
| --- | --- | --- | --- | --- | --- |
| P0 | -544~-288 | 0 | 256 | Entry | 일치 |
| P1 | -320~+32 | -256 | 352 | platform | 일치 |
| Cover A | -32~+96 | -320 | 128 | cover | 일치 |
| P2 | -64~+480 | -480 | 544 | platform | 일치 |
| Cover B | +160~+288 | -608 | 128 | cover | 일치 |
| P3 | +32~+320 | -704 | 288 | recovery | 일치(README는 "Upper Landing"으로 서술, kind는 recovery) |
| P4 | — | — | — | **없음** | README는 `(-320~+32, -864, 352)`를 명시하지만 Runtime에 대응 Surface 없음 |
| Exit Deck | +64~+384 | -1024 | 320 | safe-deck | 일치 |

### Landmark(G1~G5)

| ID | 중심 X | Y |
| --- | --- | --- |
| G1 | -352 | -176 |
| G2 | +128 | -384 |
| G3 | +384 | -544 |
| G4 | -32 | -768 |
| G5 | -64 | -928 |

전부 README §8과 중심 좌표 일치(2-1과 같은 24×24 실제 Anchor 구조).

### Patrol Drone T1

| 항목 | Runtime | README(§8, §24) |
| --- | --- | --- |
| Patrol Start | `(-320,-416)` | `(-32,-416)` |
| Patrol End | `(320,-416)` | `(416,-416)` |
| Activation | `x:-576~576, y:-672~-160`(`triggerBounds(-576,-672,1152,512)`) | 명시 없음 |
| speed / wait / mode | `48px/s`, `0.45s`, `pingpong` | README는 구체적 속도를 OPEN QUESTION으로 남김(§OPEN QUESTIONS 1) — 이제 Runtime 값이 확정값 |

Patrol 범위가 README 설계(폭 448, 중심 +192)보다 Runtime(폭 640, 중심 0)이 상당히 넓고 왼쪽으로 치우쳐 있다. G2(+128)·G3(+384)이 Patrol Y(-416)와 가까운 X대에 있어, 실제 Encounter 난이도가 README가 상정한 것과 다를 수 있다.

## 4. Camera — 완전 미구현

README §14가 요구하는 "P1에서 Player+Cover A+Drone+Patrol 목적지 중 최소 3개가 한 화면"은 아직 Camera Zone 데이터가 없어 검증 불가.

## 5. Story Trigger — 미구현

| EVENT | README 제안 문구 |
| --- | --- |
| `patrol-cycle-reveal` | `BLOCK 12` / `RESIDENTIAL TRANSIT`(진입 Sign) |
| `security-still-active` | `SECURITY PATROL ACTIVE` / `RESIDENTIAL TRANSIT RESTRICTED` |

## 6. Enemy / Hazard 요약

Patrol Drone T1 1대, Kill Optional, Rope Cut 없음 — 코드와 README 규칙 완전 일치. Chase 관련: 코드의 patrol/activation 구조상 activation 밖으로 벗어나면 `resetAttack` 후 patrol로 복귀하는 로직(`EnemyObject.js` 상단 확인)이 README의 "무한 Chase 없음" 요구와 부합한다.

## 7. Acceptance

- PASS "Drone Kill 없이 통과 가능" / "Kill로도 통과 가능"은 `kill-optional` rule로 이미 충족.
- P4 부재로 인해 README가 그린 Safe Route(`...→G4→P4→G5→EXIT`)가 실제로는 `G4→G5→EXIT`로 한 단계 짧아진다 — Recovery 여유가 설계보다 줄었을 수 있으므로 Blockout 단계에서 재확인 필요.

## 8. 현재 구현과 다음 작업

| 범위 | 현재 | 다음 작업 |
| --- | --- | --- |
| 지형 | P4만 누락, 나머지 일치 | P4를 추가할지, README에서 제거할지 결정 |
| Patrol Drone AI | 구현 완료(README 서술은 구식) | README §19-1·OPEN QUESTIONS #4를 현재 구현 기준으로 갱신 필요(이 PRODUCTION-ALIGNMENT 문서가 그 역할 대신 수행) |
| Drone 범위 | 구현됨, README와 수치 다름 | 실제 값(-320~320) 기준으로 Encounter 밸런스 재검토 |
| Camera / Story | 없음 | Zone 객체·Trigger 연결 |

## 9. 증강·Story 연결

Foundation 유지만 하고 새 Augment 없음 — 코드에 `augment-node` 없어 일치. Story는 `patrol-cycle-reveal`/`security-still-active` 두 트리거로 "사람은 없지만 경비는 작동한다"만 전달하며, Group A/B/C 관련 정보를 노출하지 않는다(코드에도 관련 cueId 없음 — 일치).

---

SECTOR 02-2 / PATROL WALKWAY — PRODUCTION ALIGNMENT · REV 1.0
