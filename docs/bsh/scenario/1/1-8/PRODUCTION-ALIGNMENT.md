# SECTOR 01-8 — PRODUCTION ALIGNMENT

*IMPLEMENTATION · CAMERA · FINAL SYNTHESIS HANDOFF · REV 1.0*

본 문서는 [1-8 시나리오](./README.md)를 현재 Runtime과 연결하는 제작 계약이다. 1-8은 Sector 01 일반 구간의 최종 Stage로, 두 Turret의 Crossfire 금지·Checkpoint·Wind 재사용이 실제로 좌표 수준까지 구현되어 있다. Camera·Story·Art는 1-5~1-7과 마찬가지로 아직 없다.

## 1. 현재 판정

| 항목 | 상태 | 판정 |
| --- | --- | --- |
| 1024×1792 Geometry | `IMPLEMENTED` | P0, A~H Anchor, R1~R4, Mid Safe Deck, Upper Catch, P8, Worker Transition Floor가 Area Catalog에 존재 |
| A~H Anchor, P0, P8 좌표 | `IMPLEMENTED — README와 일치` | |
| R3 좌표 | `IMPLEMENTED — README와 불일치` | X·너비 모두 다름. 아래 §3 참고 |
| Mid Safe Deck 좌표 | `IMPLEMENTED — README와 불일치` | 오른쪽 끝은 일치하지만 너비가 64px 작음(576 vs 512) |
| R4 Y좌표 | `IMPLEMENTED — README와 96px 오차` | X·너비는 일치 |
| Sentry T1/T2 위치 | `IMPLEMENTED — README와 일치` | `(384,-768)`, `(384,-1280)` 모두 정확히 일치 |
| T1·T2 Crossfire 금지 | `IMPLEMENTED (데이터 레벨)` | 두 Turret 모두 `rules: ["sequential-activation","no-crossfire", ...]` — README §35 요구를 데이터로 명시. 실제 activation bounds도 겹치지 않음(`y=-1024~-1024`에서 서로 인접만 하고 겹치지 않음) |
| Final Vent | `IMPLEMENTED` | 위치 `(-448,-1248)`가 README §34와 정확히 일치, Wind 수치는 1-6/1-7과 완전히 동일 재사용 |
| Sector Checkpoint | `IMPLEMENTED` | `(0,-1696)`, `radius=38`(`WORLD_CONFIG.checkpointRadius`와 일치), `reward:true` |
| Build 분기(Impulse/Relay/Shear Route) | `NOT IMPLEMENTED` | [1-4 판정](../1-4/PRODUCTION-ALIGNMENT.md)의 Foundation 저장·효과가 없으므로 재현 불가 |
| Camera Zones | `NOT IMPLEMENTED` | 문자열 9개(`intro, chain-ascent, turret-one, mid-relief, final-preview, final-crossing, gate, shutdown, worker-reveal`)만 존재 |
| Story Trigger Presentation | `NOT IMPLEMENTED` | `storyTriggers` 10개 모두 미연결. `WAIT FOR FURTHER INSTRUCTION` Evacuation Notice 문구도 아직 화면에 표시되지 않음 |
| Lower Grid Shutdown 연출 | `NOT IMPLEMENTED` | README §55~56이 요구하는 순차 조명 Off는 Story Presentation과 별개의 World State 연출이며 현재 코드 없음 |
| Worker District Preview 공간 | `IMPLEMENTED(지형만)` | `worker-transition-floor` 발판은 존재하나 Apartment/Locker/Canteen 등 생활 Prop과 Evacuation Notice는 미구현 |
| Approved Blockout / Art Reference | `NEEDED` | `images/` 폴더 없음 |

## 2. 자료 우선순위

1. Phase 구조(Lockdown Ascent → Lower Security → Mid Safe Deck → Final Crossing → Override → Worker Reveal), Story Tone 제약(§57 "System은 악당처럼 말하지 않는다")은 [시나리오 README](./README.md)가 결정한다.
2. 실제 좌표·Turret·Wind 수치는 [`Sector01AreaCatalog.js`](../../../../../src/game/world/areas/sector01/Sector01AreaCatalog.js)의 `sector-01-08` 정의가 기준이다.
3. Final Vent 수치는 1-6·1-7과 동일 튜닝이므로 [1-6 판정](../1-6/PRODUCTION-ALIGNMENT.md)·[1-7 판정](../1-7/PRODUCTION-ALIGNMENT.md)과 반드시 함께 확인한다.
4. R3·Mid Safe Deck·R4의 README 대비 오차는 `HYPOTHESIS`로 취급하고 Runtime 값을 우선한다.
5. Sector 01 Boss 위치·전환 순서는 이 문서가 정하지 않는다. [`sector-timer-and-boss-flow.md`](../../../../sector-timer-and-boss-flow.md)를 따른다.
6. 재생성은 [Scenario Art 생성 규격](../../SCENARIO-ART-GENERATION-STANDARD.md)을 따른다.

## 3. Runtime Geometry

좌표는 `X=-512~512`, `Y=0~-1792`(Sector 01에서 가장 긴 Stage).

### Collision Surface

| ID | 중심/기준점 | 크기 | 속성 | README와 비교 |
| --- | --- | --- | --- | --- |
| P0 | `(-288,0)` | 320×32 | 시작 발판 | 일치 |
| R1 | `(-176,-288)` | 224×16, recovery | A/B 실패 Catch | 크기 일치(README는 위치 미명시) |
| R2 | `(144,-544)` | 224×16, recovery | B/C 실패 Catch | 크기 일치(README는 위치 미명시) |
| R3 | `(-176,-832)` | 224×16, recovery | D/E 실패 Catch(T1 구간) | **불일치** — README는 `(-64~192, -832)`, 256×16. Y는 일치 |
| Mid Safe Deck | `(0,-1024)` | 512×32, safe-deck | 완전 안전 구간 | 오른쪽 끝(+256) 일치, **너비 64px 작음**(README 576) |
| R4 | `(160,-1376)` | 256×16, recovery | F/G 실패 Catch(T2 구간) | X·너비 일치, **Y 96px 오차**(README `-1280`) |
| Upper Catch | `(-112,-1504)` | 224×16, recovery | Final Crossing 이후 Catch | README에 명시적 좌표 없음 |
| P8 Final Safe Deck | `(48,-1584)` | 608×32, safe-deck | Gate Interaction | 일치 |
| Worker Transition Floor | `(0,-1728)` | 640×32, safe-deck | Worker District Preview | README에 명시적 좌표 없음 |

### Anchor A~H

전부 README §14~38과 정확히 일치: A `(-160,-224)`, B `(192,-416)`, C `(-192,-608)`, D `(-96,-768)`, E `(128,-944)`, F `(-160,-1152)`, G `(224,-1344)`, H `(-32,-1504)`.

### Sentry T1 / T2

| 항목 | T1(Lower) | T2(Upper) |
| --- | --- | --- |
| 위치 | `(384,-768)` — README 일치 | `(384,-1280)` — README 일치 |
| activation | `x=-256~384, y=-1024~-640` | `x=-256~384, y=-1504~-1088` |
| rules | `["sequential-activation","no-crossfire","standard-projectile","no-rope-cut"]` | 동일 |

두 activation bounds의 Y 범위(`-1024~-640`과 `-1504~-1088`)가 겹치지 않으므로 README §35("T1+T2 동시 Crossfire 없음")가 좌표 구조로도 성립한다.

### Wind Zone

| ID | bounds(x,y,w×h) | 방향 | mode | strength | cycle |
| --- | --- | --- | --- | --- | --- |
| `final-pulsed-vent` | `(-384,-1504,768×448)` | `{1,0}` RIGHT | pulsed | 360 | lull 1.75 / warning 0.7 / active 1.4 / decay 0.3 |

[1-6](../1-6/PRODUCTION-ALIGNMENT.md)·[1-7](../1-7/PRODUCTION-ALIGNMENT.md)의 Pulsed Wind와 강도·주기가 완전히 동일 — README §34("1-6/1-7의 이미 튜닝된 동일 언어 재사용")를 그대로 만족한다.

### Gate·Objective·Checkpoint

| 항목 | 값 |
| --- | --- |
| Maintenance Override Panel | `(208,-1584)` bottom-center, `interactionRadius=72`, objective `maintenance-override` |
| Containment Gate | `(256,-1584)` bottom-center |
| `maintenance-override` | type `interact`, sourceObjectId `maintenance-override-panel`(별도 `reach` Objective 없음) |
| Gate 판정 좌표 | `(320,-1760)`, `nextAreaId` 없음(`null`) — Sector 02 연결은 이 Area 정의 안에 없다 |
| Sector Checkpoint | `(0,-1696)`, `radius=38`, `reward=true`, `sourceObjectId: sector-checkpoint` |

## 4. Camera Shot — 미구현, README 설계값만 존재

문자열 placeholder 9개는 전부 필터링되어 Stage 전체가 기본값(zoom 1, 0.38/0.58)만 사용한다. README §10 Phase 구조를 기준으로 한 대응은 다음과 같다.

| 제안 SHOT | 대응 Phase(README 기준) |
| --- | --- |
| Intro | Phase 1 진입(`0~-512`) |
| Chain Ascent | Phase 1 Rope Flow |
| Turret One | Phase 2 T1(`-512~-960`) |
| Mid Relief | Phase 3 Mid Safe Deck(`-960~-1088`) |
| Final Preview | Mid Deck에서 F/G/T2/Vent Preview |
| Final Crossing | Phase 4 T2+Wind(`-1088~-1504`) |
| Gate | Phase 5 Override(`-1504~-1664`) |
| Shutdown | Lower Grid Shutdown 연출 |
| Worker Reveal | Phase 6(`-1664~-1792`) |

## 5. Story Trigger — 미구현

`storyTriggers` 10개 모두 미연결. README §19,31,50,53,55~56,63~65가 제안하는 순서:

| EVENT | README 제안 문구 |
| --- | --- |
| `final-warning` | `FINAL WARNING` → `RETURN TO LOWER MAINTENANCE`(C 근처) |
| `closure-in-progress` | `CONTAINMENT GATE CLOSURE IN PROGRESS` |
| `lower-grid-terminating` | `LOWER GRID CONNECTION: TERMINATING`(Mid Deck) |
| `access-denied` | `ACCESS DENIED`(Gate 접근 시) |
| `maintenance-override` | `MAINTENANCE OVERRIDE` → `LOCK BOLTS RELEASE` |
| `violation-logged` | `VIOLATION LOGGED` + `CONTAINMENT INTEGRITY: COMPROMISED` |
| `lower-grid-suspension` | `LOWER GRID SUSPENSION` → `EXECUTING` → `POWER ROUTING: DISCONNECTED` |
| `worker-district-reveal` | `WORKER DISTRICT — BLOCK 12` |
| `evacuation-group-c` | `EVACUATION GROUP C` → `WAIT FOR FURTHER INSTRUCTION` |
| `sector-checkpoint` | Checkpoint 활성 문구 |

**주의**: README §57은 이 Stage의 System 문구가 "악당처럼 말하지 않는다"는 Tone 제약을 명시한다(`LOWER CITIZENS SACRIFICED` 같은 노골적 표현 금지). Story Presentation을 실제로 작성할 때 이 제약을 준수해야 한다. `evacuation-group-c`는 [2/README.md](../../2/README.md)·[2-5](../../2/2-5/README.md)·[2-7](../../2/2-7/README.md)·[2-8](../../2/2-8/README.md)의 Group A/B/C 공개 순서와 충돌하지 않는지 반드시 대조한다: 1-8은 "대피 대상이 있었다"까지만 공개하고 Group A/B 정체·중단 이유는 아직 드러내면 안 된다.

## 6. 저비용 Art Package

| LAYER | 최소 자산 | 배치 규칙 |
| --- | --- | --- |
| Far(Maintenance) | Deep Maintenance Void, Dying Machinery | Shutdown 시 Light Layer만 순차 OFF |
| Mid(Final Security) | Containment Lock Machinery, Blast Shutter | 128~256px 단위 |
| Gate | Containment Gate(128×160~192×192) | Sector 01 일반 구간 최대 Foreground Object. Red Neon 남발 금지 |
| Worker Preview | Apartment Door(64×96~128), Locker(32×64), Canteen(64×96), Evacuation Display(64×64), Child Drawing(16×16~32×16) | Maintenance와 확실히 다른 Warm/Muted Palette |

## 7. Acceptance

- README §88 PASS 15개(Gameplay) 중 Build 분기 관련(PASS 11)은 Foundation Runtime 없이 확인 불가.
- PASS 07(T1+T2 Crossfire 없음)은 activation bounds 비겹침으로 데이터상 이미 충족 — Acceptance Capture로 시각 확인만 남음.
- README §89 Story PASS(PASS 16~25)는 전부 Story Trigger·Lower Grid Shutdown·Worker Preview 구현 이후에만 검증 가능하며 현재는 전부 미착수.
- FAIL 조건 "Checkpoint 직후 또 전투"는 Checkpoint(`0,-1696`)가 Worker Transition Floor(`0,-1728`) 및 Gate(`320,-1760`) 이후에 위치해 Enemy activation bounds와 겹치지 않으므로 구조적으로 충족.

## 8. 현재 구현과 다음 작업

| 범위 | 현재 | 다음 작업 |
| --- | --- | --- |
| 지형·Anchor·Sentry·Wind | Runtime Mock 연결 완료 | R3·Mid Safe Deck·R4 좌표를 README와 같은 변경에서 정리 |
| Approved Blockout | 없음 | 이 문서 §3 기준 SVG 제작 필요 |
| Camera | 문자열 placeholder만 존재 | `cameraZone()` 객체로 교체(§4 제안값 기준) |
| Story | 문자열 placeholder만 존재 | 10개 트리거 연결. Tone 제약(§57)과 Group A/B/C reveal 순서 준수 필수 |
| Lower Grid Shutdown 연출 | 미구현 | Story Presentation과 별개의 World State/조명 시스템 필요 |
| Worker District Preview | 지형만 존재 | Apartment/Locker/Canteen 등 생활 Prop, Evacuation Notice 오브젝트 추가 |
| Build 분기 | 미구현 | [1-4 §1](../1-4/PRODUCTION-ALIGNMENT.md) Foundation Runtime 선행 필요 |
| Sector 01 Boss 연결 | 이 문서 범위 밖 | [`sector-timer-and-boss-flow.md`](../../../../sector-timer-and-boss-flow.md) 확정 대기 |

## 9. 증강·Story 연결

[Sector 01 증강·스토리 통합 기준](../AUGMENT-STORY-INTEGRATION.md)에 따라 1-8은 Foundation Check가 아니라 Skill/Synthesis Check다(README §81).

- Foundation 저장·효과가 없으므로 Build별 Final Stage 경험(README §80)은 현재 재현되지 않는다.
- 모든 Build가 Safe Route로 클리어 가능해야 한다는 제약은 Foundation Runtime 여부와 무관하게 기본 Rope만으로 이미 성립해야 하며, Greybox 단계(README §91 PRIORITY 1)에서 우선 검증한다.
- 1-8 Checkpoint 통과는 Sector 01 완료를 단독으로 확정하지 않는다(README §66) — Boss 처치까지 별도로 필요하다는 점을 Story/Progress 로직에 반영할 때 유의한다.

---

SECTOR 01-8 / CONTAINMENT GATE — PRODUCTION ALIGNMENT · REV 1.0
