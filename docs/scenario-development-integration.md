# 시나리오 기획·개발 통합 현황

이 문서는 [`bsh/scenario/`](./bsh/scenario/)의 기획 범위와 현재 Runtime 연결 상태를 한 체크포인트에서 비교하는 기준 문서다. Stage 문서가 존재한다는 사실을 구현 완료로 해석하지 않으며, 마지막으로 어디까지 확인했는지와 다음 구현을 막는 결정을 함께 남긴다.

<!-- scenario-integration-checkpoint:v1
scenario-source-sha256: 2bfaadcfe2e9be1e22a2b363fd52e7aea7928bfb5d3dda26a7e4dadbdb1cba8e
authored-area-sha256: 63a43aeca5a5abe1ec6ca7806f46e447cd4f7bcc9d0c735bb1ba465b081d5fb0
stage-count: 32
stage-coverage: 1-1,1-2,1-3,1-4,1-5,1-6,1-7,1-8,2-1,2-2,2-3,2-4,2-5,2-6,2-7,2-8,3-1,3-2,3-3,3-4,3-5,3-6,3-7,3-8,4-1,4-2,4-3,4-4,4-5,4-6,4-7,4-8
reviewed-upstream: 6af1a4306012c2646327bc87247dd996e8df2362
-->

## 상태를 읽는 법

기획과 Runtime은 서로 다른 축으로 기록한다.

| 축 | 상태 | 의미 |
| --- | --- | --- |
| 기획 | `OUTLINE` | Sector Master에 개요만 있고 상세 Stage 계약은 없음 |
| 기획 | `AUTHORED` | 상세 Stage README가 존재함 |
| 기획 | `CROSS-REVIEWED` | Master·Stage·현재 Runtime 경계를 함께 비교함 |
| Runtime | `NOT CONNECTED` | 현재 authored area catalog에 없음 |
| Runtime | `GRAYBOX READY` | 새 시스템 없이 geometry부터 만들 수 있으나 catalog에는 아직 없음 |
| Runtime | `MOCK INTEGRATED` | 현재 authored catalog와 공용 진행 흐름에 연결됨 |
| Runtime | `PLAYTEST VERIFIED` | 요구된 실제 브라우저·기기 플레이 증거까지 확보됨 |

`BLOCKED`는 위 상태와 별개다. 예를 들어 Stage가 `AUTHORED`여도 선행 Boss 전환이나 새 시스템 결정이 없으면 연결은 차단된다.

## 2026-08-15 확인 체크포인트

- 확인 기준 upstream: `6af1a4306012c2646327bc87247dd996e8df2362` (`origin/main`, Sector 04 Wind 정렬과 Sector 02 Story 구현 인계 문서 병합 뒤 clean base)
- 상세 Stage 문서: **32개**, `1-1`부터 `4-8`까지
- 현재 authored Runtime: **24개**, `1-1 → 3-8` (+ Sector 04 `4-1 → 4-4` standalone)
- 직접 대조한 기준: Sector 03 Master REV 1.2와 3-1~3-8, Sector 04 Master REV 1.0과 4-1~4-8·#510 Wind 문구 정렬, `CurrentAuthoredAreaCatalog.js`, #507 Wind·Story·2-3 Runtime 변경, Sector 01 그래플 표면·랜드마크 1:1 계약, 1-1 C04·1-2 C02·1-3 Route Choice·1-4 Node Approved Blockout·Area Catalog·Scenario Art 구조 관계, Sector 01·02 Camera/Story 구현 인계 문서, 구현 로드맵과 세션 핸드오프
- 자동 확인 범위: `docs/bsh/scenario/**/*.md`, `src/game/world/areas/**/*.js`, 상세 Stage README 목록
- 확인하지 못한 항목: 실제 브라우저·기기 플레이테스트. 모든 영역은 `MOCK INTEGRATED`이며 `PLAYTEST VERIFIED`는 아직 없다.

| 범위 | 기획 현황 | Runtime 현황 | 다음 경계 |
| --- | --- | --- | --- |
| Sector 01 / 1-1~1-8 | 8개 상세 Stage, `CROSS-REVIEWED` | 8개 `MOCK INTEGRATED`; 1-4 Foundation 선택·효과·개인별 멀티는 #480에서 검증; 102개 그래플 표면·랜드마크 1:1 가시성은 #487에서 검증; #507이 Wind·Story·2-3 진행을 보강 | 1-1 C04·1-2 C02·1-3 Route Choice·1-4 Node Scenario Art 구조 정합 완료; 실제 Build 플레이 수치 검증과 1-5~1-8 Approved Blockout 필요; Camera Zone·남은 Position Story Trigger는 [구현 준비 문서](./bsh/scenario/1/CAMERA-STORY-IMPLEMENTATION-HANDOFF.md) 작성 완료, 코드 반영 대기 |
| Sector 02 / 2-1~2-8 | 8개 상세 Stage, `CROSS-REVIEWED` | 8개 `MOCK INTEGRATED`; #507이 2-3 진행 차단을 placeholder objective로 해소하고 일부 Story를 보강 | Camera Zone은 8개 Stage가 Custom Camera 불필요를 명시해 gap이 아님을 확인; 남은 Story Presentation 공백 3건은 [구현 준비 문서](./bsh/scenario/2/STORY-IMPLEMENTATION-HANDOFF.md) 작성 완료, 코드 반영 대기; 2-3 Specialization 실제 이름·효과·수치·pool과 Sector 02 Boss→3-1 전환 미정 |
| Sector 03 / 3-1~3-8 | 8개 상세 Stage와 Master REV 1.2, `CROSS-REVIEWED` | 8개 `MOCK INTEGRATED`; Access Scan Field 런타임 구현(#523) + standalone catalog로 2-8→3-1→…→3-8 연결(#525) | Camera Zone·Story trigger는 코드 반영 대기, Post-Sector 03 Boss→3-8/4-1 전환 미정 |
| Sector 04 / 4-1~4-8 | Master와 8개 상세 Stage, `CROSS-REVIEWED` | 4-1~4-4는 standalone catalog로 `GRAYBOX READY`(#513·#514·#516·#519); 4-5~4-8은 `NOT CONNECTED` | Post-Sector 03 Boss→4-1 전환, Sector 04 catalog·Camera·Stable ID가 먼저이며 Cutter·Wake·Rope Line Combat·Recovery Finale는 Runtime prototype 뒤 검증; Master의 상세 문서 범위 문구 재정렬 필요 |
| Sector 05~06 | 상세 Stage 없음 | `NOT CONNECTED` | NPC 역할·대화 계약과 엔딩·최종 전환 계약 필요 |

## 최근 반영된 시나리오 변화

1. Sector 03은 3-1~3-8 상세 문서와 통합 Master까지 확장됐다. 3-2 이후 핵심은 Access Scan Field에 의존하지만 Runtime prototype과 Sector 03 authored catalog는 아직 없다.
2. Sector 04는 Transit / Infrastructure Master와 4-1 `TRANSIT INTAKE`부터 4-8 `TRANSIT CONTROL TRUNK`까지 8개 상세 Stage로 확장됐다. 4-1 순수 geometry 후보는 준비됐지만 Sector 03 종료 전환은 미정이며, 4-2~4-8은 Runtime Area·Camera·Stable ID가 없어 `NOT CONNECTED`다. Master의 `4-2~4-8 outline only` 상태 문구는 현재 상세 문서 범위와 별도 정렬이 필요하다.
3. #480은 1-4 Foundation 선택·세 효과·개인별 멀티·Story/UI·프로토콜을 구현했다. Foundation ID와 Specialization ID의 의미 체계는 계속 분리한다.
4. #478은 1-1 C04와 1-2 C02에서 보이는 발판·Anchor의 좌우·상하 관계와 상대 폭을 Approved Blockout·Area Catalog에 맞춘 구조 가이드로 다시 생성했다. 이전 구조 불일치 이미지는 `RETIRED / STRUCTURE MISMATCH`로 보존하고 새 이미지를 현재 승인 기준으로 전환했다. Runtime Geometry와 Collision은 변경하지 않았다.
5. #506은 1-3 Route Choice Camera에서 D 위·C 왼쪽 중단·B 아래, Safe Ledge·R1·Safe Cover·Upper Cover·오른쪽 벽 Sentry 구조를 고정하고, 약 48px Player와 C live Rope·Red TRACK Telegraph 각 한 줄만 보이는 승인 Art Reference로 교체했다. 이전 `03`은 Rope와 경로 선의 의미가 겹쳐 `RETIRED / ROPE-ROUTE MISMATCH`로 보존했으며 Runtime Geometry·Camera·Sentry 수치는 변경하지 않았다. 이로써 Sector 01 1-1~1-4의 구조 정합 재생성이 완료됐다.
6. #496은 1-4 Node Camera에서 긴 Node Deck 아래·Maintenance Node N1 중앙·Anchor A 오른쪽 위 구조를 고정하고, 약 48px Player와 A live Rope 한 줄만 보이는 현재 승인 Art Reference로 교체했다. 선택 UI·P1/P2·Dummy·B/C·Panel·Gate는 Camera 밖으로 제외했으며 Runtime Geometry와 Foundation 수치는 변경하지 않았다.
7. #487은 1-3·1-4·1-6·1-7·1-8에서 누락된 그래플 랜드마크 28개를 기존 target 좌표에 연결했다. 현재 102개 비렌더 그래플 표면은 모두 같은 ID·좌표 anchor의 보이는 object와 1:1이며, 누락·고아·좌표 불일치는 catalog validator와 authored world 회귀가 거부한다. Rope 후보 사거리·점수 계약은 변경하지 않았다.
8. #489는 기존 글로벌 Artifact 시스템을 은퇴하고 authored Foundation 선택을 유일한 특화 방향으로 확정했다. Rope 부착은 속도 1400px/s × 수명 2/7초에서 파생한 400px 도달의 보이는 Hook 투사체이며 `swingImpulse = 780`은 유지한다. Sentry 첫 수치는 체력 100·인식 거리 760·적 탄속 520·재사격 1.0초이고 authored activation/LOS가 인식을 계속 가린다.
9. #500은 `2/2-2`~`3/3-8`의 남은 Sentry 수치 인용을 현재 `COMBAT_CONFIG`에 맞추고, 1-3만 `cover-ends-los`를 opt-in으로 사용하는 것이 실제 `hasLineOfSight` 계약과 일치함을 대조했다.
10. #507은 1-6·1-7·1-8 Wind Zone에 falloff와 체감 가능한 강도를 적용하고 1-6에 `cooling-core-column` Wind Shadow를 연결했다. 지형·완료 조건·Gate·Anchor 좌표는 유지했다.
11. #507은 2-3 `specialization-node`의 TBD pool이 진행을 막지 않도록 objective를 `interact` placeholder로 바꿔 `specialization-selected` 진행을 열었다. 실제 Specialization 성장 규칙은 확정하지 않았다.
12. #507은 1-5~1-8과 Sector 02의 Entry·Objective·Gate Story Presentation, Patrol Drone 시각 구분과 trigger bounds 일반화를 구현했다. 모든 authored Camera Zone과 Position Story Trigger를 완료한 것은 아니다.
13. #509는 1-5~1-8의 문자열 Camera Zone placeholder와 #507이 다루지 않은 Position Story Trigger를 실제 좌표·문구로 구현하기 위한 [인계 문서](./bsh/scenario/1/CAMERA-STORY-IMPLEMENTATION-HANDOFF.md)를 추가했다. 코드 반영은 별도 작업이며 Sector 02 Camera는 이름 목록도 없어 범위에서 제외했다.
14. #510은 4-3·4-5·4-7·4-8의 Transit Wake 설명을 현재 Wind Shadow·Grounded Attenuation 기준에 맞췄다. Sector 04 Runtime은 아직 연결되지 않았으므로 문서 계약 정렬로만 기록한다.
15. #511은 Sector 02의 빈 Camera Zone이 의도된 Geometry 해결임을 확인하고, 실제 Story Presentation 공백 3건을 [구현 준비 문서](./bsh/scenario/2/STORY-IMPLEMENTATION-HANDOFF.md)에 정리했다. 코드 반영은 별도 작업이다.
16. #513은 Sector 04 Runtime을 시작했다. Cutter Fire를 `cutter-fire` opt-in 규칙으로 강화(기본은 rope-cut 없음)하고 조준선·투사체를 일반 Sentry와 구분했으며, 4-1 `TRANSIT INTAKE`를 standalone `Sector04AreaCatalog`(A1~A6·P0/R1/R2/M1/R3/P4/P5·camera zone·content-boundary gate)로 구현해 validator·조립 테스트를 통과시켰다. 현재 1-1→2-8 월드에는 연결하지 않는다.
17. #514는 4-2 `CUTTER LINE`을 같은 standalone catalog에 추가했다. A0/C1/C2/A3/A4 grapple target, P0/P1/R1/P2/P3/P4 발판, `cutter-fire` 규칙의 정지 Sentry S1(activation band), camera zone과 content-boundary gate를 저작했다. 4-1 Gate는 4-2로 연결되도록 재배선했다.
18. #516은 4-3 `FREIGHT BYPASS`를 추가했다. A0/W1/W2/W3/A4/A5/A6 grapple target과 P0/P1/R1/P2/R2/P4 발판, `cutter-fire` Sentry S1과 첫 Pulsed Transit Wake(`sector-04-03:freight-wake`, strength 360, falloff 미지정=default 0)를 저작했다. 4-2 Gate는 4-3으로 재배선했고 4-3은 content-boundary다.
19. #519는 4-4 `INFRASTRUCTURE SERVICE NODE`(REST)를 추가했다. A1~A5 grapple target과 P0/P1/P2/R1/P3/P4 발판, `routing-status-display`(story-display, 상호작용 없음)를 저작했다. Enemy·Wind·Cutter 없음. 4-3 Gate는 4-4로 재배선했고 4-4는 content-boundary다.
20. Sector 04 catalog(4-1~4-4)를 메인 월드에 잇기 전에 먼저 Sector 03(Access Scan Field → 3-1~3-8)을 구현하기로 했다. 이 과정에서 4-2·4-3 Gate/패널의 문서 좌표가 최종 데크를 벗어나던 것을 데크 위(`bottom-center`가 visible floor top에 닿도록)로 보정했다. 개발용 디버그 모드(`?start=<areaId>` 맵 선택 + 기존 `?metrics=1`)를 추가했다.
21. Access Scan Field 런타임 Prototype을 구현했다. `src/game/world/AccessScanField.js`에 AVAILABLE 1.5/WARNING 0.6/LOCKED 1.1/RESET 0.3의 결정적 phase evaluator를 두고, `AreaDefinition.scannerGroups` authoring과 `AuthoredWorldAssembler`의 controlled surface `grappleAccessGroup` stamping·검증을 추가했다. `RopePointerInput.findRopeAttachment()`에 optional dynamic `canAttachToSurface` predicate를 추가하고 `GameSimulation`이 같은 tick의 scanner state를 live-input·prediction-restore 양쪽에 전달한다. LOCKED/RESET은 새 attach만 차단하며 이미 붙은 Rope는 끊지 않는다. delayed owner-motion에서 `worldElapsedSeconds` clock이 서버 시계와 어긋나던 문제를 `rebaseElapsedSeconds`로 수정했다. Phase는 network event로 복제하지 않는다.
22. Sector 03 authored catalog(3-1~3-8)를 standalone으로 구현하고 메인 월드에 `2-8 → 3-1 → … → 3-8`로 연결했다. 3-1 `POWERED PROMENADE`(무적), 3-2 `SCANNER GALLERY`(첫 scanner), 3-3·3-4·3-6·3-7 `scanner+Patrol Drone`, 3-5 `SERVICE NODE`(rest), 3-8 `UPPER MARKET GATE`(2 Drone + 4 controlled surface, content-boundary)를 저작했다. 3-8은 Post-Sector 03 Boss/전환(TBD)까지 content-boundary며 3-8→4-1 직접 연결은 확정하지 않는다. Camera Zone·Story trigger 코드 반영은 후속이다.

## 열린 기획·구현 게이트

1. Sector 02 Boss 위치·전투 시나리오와 `2-8 → 3-1` 전환 흐름
2. Post-Sector 03 Boss와 `3-8 → 4-1` 전환
3. Sector 03·04 Camera Zone과 Story trigger 코드 반영
4. 2-3 Specialization의 실제 이름·효과·수치·선택 pool
5. Sector 04 Master의 `4-2~4-8 outline only` 상태 문구를 현재 4-1~4-8 상세 문서 범위와 재정렬
6. NPC 역할·배치·대화 흐름과 Sector 06 엔딩·최종 완료 계약
7. 미래 authored Stage 공간 계획은 Hook 비행·빗맞음·재발사 telegraph와 원격 가시성을 반영해야 한다. 400px 도달은 속도×수명 파생 하나만 쓰고 별도 사거리 상수를 두지 않는다.
8. authored Sentry activation band와 Cover LOS는 인식 거리 760과 무관하게 encounter 제약으로 유지한다. 긴 인식 거리가 activation·LOS를 우회하지 않는다.

개발이 준비됐고 기획 결정만 기다리는 항목의 우선순위 요청과 답변 작성란은 [`design-decision-requests.md`](./design-decision-requests.md)에 유지한다.

이 항목은 문서가 추가됐다는 이유만으로 닫지 않는다. 사용자 결정, 구현 diff와 검증 증거 중 해당 게이트를 실제로 해소한 근거가 있어야 한다.

## 지속 통합 절차

1. 작업 시작 시 이 문서와 관련 Sector·Stage README, 구현을 시작한 Stage의 `PRODUCTION-ALIGNMENT.md`를 읽는다.
2. `npm run check:scenario-integration`으로 기록한 source와 현재 source가 같은지 확인한다. 불일치하면 `npm run check:scenario-integration -- --print`로 실제 값을 확인한다.
3. 시나리오 변경을 현재 Runtime과 대조해 최근 변경, 영향을 받는 영역, 열린 게이트와 검증 증거를 이 문서에 갱신한다. hash만 새 값으로 바꿔 검사를 우회하지 않는다.
4. 좌표·문구·cue처럼 기존 계약 안에서 흡수할 변경과, 맵 순서·핵심 기믹·완료 조건·Gate 연결·asset 경계처럼 사용자 검토가 필요한 변경을 분리한다.
5. 구현을 시작하면 Stage `PRODUCTION-ALIGNMENT.md`에 정확한 좌표·Camera·Stable ID·상태·사건·asset 인계 차이를 기록하고 gameplay→mock 표현→검증 순서로 연결한다.
6. `MOCK INTEGRATED`는 catalog·진행·테스트가 연결된 증거가 있을 때만, `PLAYTEST VERIFIED`는 요구된 실제 브라우저·기기 결과를 남겼을 때만 사용한다.
7. 같은 작업에서 이 문서, [`implementation-roadmap.md`](./implementation-roadmap.md)와 [`../SESSION-HANDOFF.md`](../SESSION-HANDOFF.md)의 현재 요약을 맞춘 뒤 전체 검사를 통과시킨다.

fingerprint는 의미 검토를 대신하지 않는다. 변경 누락을 발견하는 경보다. `reviewed-upstream`은 마지막 대조 기준 SHA를 보존하는 사람이 읽는 증거이며, 검사기는 source fingerprint와 Stage 목록의 일치 여부를 자동 검증한다.
