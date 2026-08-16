# 시나리오 기획·개발 통합 현황

이 문서는 [`bsh/scenario/`](./bsh/scenario/)의 기획 범위와 현재 Runtime 연결 상태를 한 체크포인트에서 비교하는 기준 문서다. Stage 문서가 존재한다는 사실을 구현 완료로 해석하지 않으며, 마지막으로 어디까지 확인했는지와 다음 구현을 막는 결정을 함께 남긴다.

<!-- scenario-integration-checkpoint:v1
scenario-source-sha256: f8a677dc3fda216d0aa88bc0680578b6cdc403946357e5b1e7b85dce7dd9887d
authored-area-sha256: 91d877421c2be171b28b8b3f1b0f322294ad1be92edd734b11806a071fa2d1eb
stage-count: 47
stage-coverage: 1-1,1-2,1-3,1-4,1-5,1-6,1-7,1-8,2-1,2-2,2-3,2-4,2-5,2-6,2-7,2-8,3-1,3-2,3-3,3-4,3-5,3-6,3-7,3-8,4-1,4-2,4-3,4-4,4-5,4-6,4-7,4-8,5-1,5-2,5-3,5-4,5-5,5-6,5-7,5-8,6-1,6-2,6-3,6-4,6-5,6-6,6-7
reviewed-upstream: 4ebe0d4b5c80faaa6bc2c24385c77ffea9d5831a
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

## 2026-08-16 확인 체크포인트

- 확인 기준 upstream: `4ebe0d4b5c80faaa6bc2c24385c77ffea9d5831a` (`origin/main`, Sector 06 6-4 추가(#582) 병합까지 포함한 clean base)
- 상세 Stage 문서: **47개**, `1-1`부터 `5-8` + Sector 06 `6-1`~`6-7`
- 현재 authored Runtime: **24개**, `1-1 → 3-8` (+ Sector 04 `4-1 → 4-8` standalone; Sector 05는 Runtime 미저작)
- 직접 대조한 기준: Sector 03 Master REV 1.2와 3-1~3-8, Sector 04 Master REV 1.1과 4-1~4-8(Gate 좌표·Cutter Fire 모델·Wind Strength 재분류 정렬, #29), Sector 05 Master와 5-1~5-8(Cutter Fire opt-in 모델 정합, Safe/Flow Route 산술 전량 재검산, #30), Sector 06 Master와 6-1~6-7(Scanner phase·Patrol speed/wait·Cutter opt-in 및 Safe/Flow 산술 대조), `CurrentAuthoredAreaCatalog.js`, `Sector03AreaCatalog.js`, `Sector04AreaCatalog.js`, `AccessScanField.js`, #507 Wind·Story·2-3 Runtime 변경, Sector 01 그래플 표면·랜드마크 1:1 계약, 1-1 C04·1-2 C02·1-3 Route Choice·1-4 Node Approved Blockout·Area Catalog·Scenario Art 구조 관계, Sector 01·02 Camera/Story 구현 인계 문서, 구현 로드맵과 세션 핸드오프
- 자동 확인 범위: `docs/bsh/scenario/**/*.md`, `src/game/world/areas/**/*.js`, 상세 Stage README 목록
- 확인하지 못한 항목: Sector 03/04 전체 등반의 실제 브라우저·기기 플레이테스트. 이번 #557 검토에서는 디버그 패널로 `sector-03-02` 직접 시작과 화면 렌더까지만 확인했으며, 모든 영역의 판정은 계속 `MOCK INTEGRATED`이고 `PLAYTEST VERIFIED`는 아직 없다.

| 범위 | 기획 현황 | Runtime 현황 | 다음 경계 |
| --- | --- | --- | --- |
| Sector 01 / 1-1~1-8 | 8개 상세 Stage, `CROSS-REVIEWED` | 8개 `MOCK INTEGRATED`; 1-4 Foundation 선택·효과·개인별 멀티는 #480에서 검증; 102개 그래플 표면·랜드마크 1:1 가시성은 #487에서 검증; #507이 Wind·Story·2-3 진행을 보강; 1-5~1-8 Camera Zone과 남은 Position Story Trigger 코드 반영 완료 | 1-1 C04·1-2 C02·1-3 Route Choice·1-4 Node Scenario Art 구조 정합 완료; 실제 Build 플레이 수치 검증과 1-5~1-8 Approved Blockout 필요 |
| Sector 02 / 2-1~2-8 | 8개 상세 Stage, `CROSS-REVIEWED` | 8개 `MOCK INTEGRATED`; #507이 2-3 진행 차단을 placeholder objective로 해소하고 일부 Story를 보강; Story Presentation 공백 3건(2-2·2-3 POSITION, 2-6 최소 위치 표지) 코드 반영 완료 | Camera Zone은 8개 Stage가 Custom Camera 불필요를 명시해 gap이 아님을 확인; 2-3 Specialization 실제 이름·효과·수치·pool과 Sector 02 Boss→3-1 전환 미정 |
| Sector 03 / 3-1~3-8 | 8개 상세 Stage와 Master REV 1.2, `CROSS-REVIEWED` | 8개 `MOCK INTEGRATED`; Access Scan Field 런타임 구현(#523) + standalone catalog로 2-8→3-1→…→3-8 연결(#525); Camera는 8개 Stage 의도적 기본 카메라 확인, Story signage 28개 코드 반영 | Post-Sector 03 Boss→3-8/4-1 전환 미정 |
| Sector 04 / 4-1~4-8 | Master REV 1.1과 8개 상세 Stage, `CROSS-REVIEWED` | 4-1~4-8 standalone catalog로 `GRAYBOX READY`(#513·#514·#516·#519 + 4-5~4-8 추가); 메인 월드에는 미연결; Camera Zone 8개 Stage 구현 확인, Story 바인딩 반영 완료; Gate 좌표·Cutter Fire opt-in 모델·Wind Strength 문서 정합 완료(#29) | Post-Sector 03 Boss→4-1 전환이 먼저이며 Cutter·Wake·Rope Line Combat·Recovery Finale는 Runtime prototype 뒤 검증 |
| Sector 05 / 5-1~5-8 | Master와 8개 상세 Stage, `CROSS-REVIEWED` | `NOT AUTHORED` / `NOT CONNECTED`; Runtime graybox는 Sector 06 Scenario 완료 후 HOLD(사용자 결정: Scenario-first) | Post-Sector 04 Boss→5-1 전환 미정; Sealed Surface/Service Hardpoint 정적 grappleable 규칙은 실제 코드 계약(`surface.grappleable === false`)과 대조 완료, 실제 Runtime 저작 필요 |
| Sector 06 / 6-1~6-7 | Master와 상세 Stage 7/8(6-8은 아직 없음), `CROSS-REVIEWED` | `NOT CONNECTED` | 6-5 Scanner는 현재 1.5/0.6/1.1/0.3 phase와 controlled surface attach 계약, 6-6 Patrol은 speed 48·wait 0.45와 acquire 시 정지 사격, 6-7 Cutter는 `cutter-fire` opt-in 및 Rope Cut recovery 계약과 일치; 6-5 산술 오타 1건(275.3→288.4) 정정; 6-8 상세 저작, Post-Sector 05 Boss→6-1 전환, Final Security Encounter 상세 Boss 계약, NPC 역할·대화 계약과 엔딩·최종 전환 계약 필요 |

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
20. Sector 04 catalog(4-1~4-4)를 메인 월드에 잇기 전에 먼저 Sector 03(Access Scan Field → 3-1~3-8)을 구현하기로 했다. 이 과정에서 4-2·4-3 Gate/패널의 문서 좌표가 최종 데크를 벗어나던 것을 데크 위(`bottom-center`가 visible floor top에 닿도록)로 보정했다. 개발용 디버그 진입은 이후 설정 버튼 1초 길게 누르기로 여는 디버그 패널(수치 표시 토글 + 시작 맵 select, localStorage 저장)로 대체했고 `?metrics=1`·`?start=` URL 파라미터는 제거했다.
21. Access Scan Field 런타임 Prototype을 구현했다. `src/game/world/AccessScanField.js`에 AVAILABLE 1.5/WARNING 0.6/LOCKED 1.1/RESET 0.3의 결정적 phase evaluator를 두고, `AreaDefinition.scannerGroups` authoring과 `AuthoredWorldAssembler`의 controlled surface `grappleAccessGroup` stamping·검증을 추가했다. `RopePointerInput.findRopeAttachment()`에 optional dynamic `canAttachToSurface` predicate를 추가하고 `GameSimulation`이 같은 tick의 scanner state를 live-input·prediction-restore 양쪽에 전달한다. LOCKED/RESET은 새 attach만 차단하며 이미 붙은 Rope는 끊지 않는다. delayed owner-motion에서 `worldElapsedSeconds` clock이 서버 시계와 어긋나던 문제를 `rebaseElapsedSeconds`로 수정했다. Phase는 network event로 복제하지 않는다.
22. Sector 03 authored catalog(3-1~3-8)를 standalone으로 구현하고 메인 월드에 `2-8 → 3-1 → … → 3-8`로 연결했다. 3-1 `POWERED PROMENADE`(무적), 3-2 `SCANNER GALLERY`(첫 scanner), 3-3·3-4·3-6·3-7 `scanner+Patrol Drone`, 3-5 `SERVICE NODE`(rest), 3-8 `UPPER MARKET GATE`(2 Drone + 4 controlled surface, content-boundary)를 저작했다. 3-8은 Post-Sector 03 Boss/전환(TBD)까지 content-boundary며 3-8→4-1 직접 연결은 확정하지 않는다. Camera Zone·Story trigger 코드 반영은 후속이다.
23. Sector 01·02 Camera/Story 구현 인계 문서를 코드에 반영했다. 1-5~1-8 `cameraZones` placeholder 문자열 배열을 실제 `cameraZone` 객체로 교체(`CAMERA-STORY-IMPLEMENTATION-HANDOFF.md` Part 1)하고, #507이 다루지 않은 `POSITION_PRESENTATIONS`(1-5 `load-test-context`, 1-7 `pressure-limit`·`containment-violation`, 1-8 `lockdown-warning`·`mid-safe-story`·`worker-district-preview`)와 Sector 02 공백(`2-2 security-status`, `2-3 node-detection`, 2-6 ENTRY는 README의 Optional Minimal Sign 허용 범위에서 위치 정보만)을 추가했다. Sector 02 Camera Zone은 8개 Stage가 의도적 미설계임을 확인한 상태라 변경하지 않았다.
24. Sector 04 standalone catalog에 4-5 `EXPRESS SHAFT`(적 없음·상승 Wake), 4-6 `POWER RELAY SPAN`(Cutter Sentry+Patrol Drone 분리 band), 4-7 `ISOLATION JUNCTION`(Cutter+Wake 합성, `LOWER ASCENT FEEDER ISOLATED` 상태 디스플레이), 4-8 `TRANSIT CONTROL TRUNK`(Cutter+Drone+Wake 연속, Upper Trunk/Lower Feeder 병치, Post-Sector Visual Hold)를 추가하고 4-4 Gate를 4-5로 재배선했다. 4-8은 Sector 05 미배선(content-boundary)이다. 문서 대비 정렬 1건: 4-8 D1 activation X폭을 문서 patrol corridor(±208)를 포함하도록 ±192→±208로 넓혔다(문서 자체가 patrol corridor 폭을 open question으로 남김). 메인 월드에는 연결하지 않는다.
25. Sector 03 Camera·Story를 정리했다. 8개 Stage README의 `## 14. Camera` 절을 전수 대조한 결과 전부 `Custom Pan 없음`(기본 Camera로 Geometry·Lighting 해결)을 명시해 `cameraZones` 미저작이 의도된 상태임을 확인했고([인계 문서](./bsh/scenario/3/CAMERA-STORY-IMPLEMENTATION-HANDOFF.md)), Story는 위치 기반 Signage 계약대로 데크별 `story-display` 28개와 `TRIGGER_CUE_PRESENTATIONS` 바인딩으로 구현했다. 3-7 M2 Access Directory와 3-8 A1 Evacuation/Access Archive 병치는 문서의 금지 해석(Group↔Tier 대응, 원인 확정, 연결 화살표)을 포함하지 않는다.
26. Sector 04 Master의 stale 상태 문구를 정리했다. `4-2 ~ 4-8 Master outline only`를 8개 상세 Stage README 목록으로 바꾸고, Current Runtime Boundary를 `1-1 → 3-8 연결 + Sector 04 4-1~4-8 standalone` 현실에 맞췄다.
27. Sector 04 Camera·Story를 정리했다. 8개 Stage README의 Camera 절을 전수 대조해 Sector 04는 문서가 per-zone zoom을 제안하는 유일한 Sector이며 8개 Stage 전부 Runtime `cameraZones`로 이미 구현돼 있음을 확인했고(4-2~4-4는 문서가 band를 주지 않아 Geometry에서 파생), Story는 문서의 "짧은 infrastructure status" 원칙대로 ENTRY 8개·POSITION 15개·기존 `story-display` 8개 cue 바인딩을 코드에 반영했다([인계 문서](./bsh/scenario/4/CAMERA-STORY-IMPLEMENTATION-HANDOFF.md)). `LOWER ASCENT FEEDER ISOLATED`는 4-7에서만 노출되며 4-4는 `SEGMENTED / PARTIAL`까지만 표시한다.
28. #557 검토에서 Sector 03/04 구현에 Stage별 `PRODUCTION-ALIGNMENT.md` 16개가 없고 `story-display`가 실제 앱 trigger 목록에서 빠지는 문제를 확인했다. 각 Stage의 현재 catalog 좌표·Stable ID·Camera·Story·검증·blocker를 제작 정렬 문서로 승격하고, 카탈로그에서 조립한 `story-display` 위치를 `192×64` 로컬 trigger bounds로 전달하는 회귀 테스트를 추가했다. 잠긴 Gate barrier 너머 다음 Area grapple target도 후보에서 제외해 authored 진행 경계를 복구했다. 브라우저에서 `sector-03-02` 직접 시작과 화면 렌더는 확인했지만 Sector 03/04 전체 등반·실기기 증거는 없으므로 Sector 03은 `MOCK INTEGRATED`, Sector 04는 standalone `GRAYBOX READY` 판정을 유지한다.
29. Sector 04 4-1~4-8 문서 전체를 shipped `Sector04AreaCatalog.js`와 재대조했다. 핵심 발견: 여러 문서(4-1 §10, 그리고 그걸 인용한 4-2/4-3/4-5/4-6/4-7)가 "4-1 Flow Route `A3→A4` 408.9px가 새 400px Hook Reach를 초과해 좌표 수정이 필요하다"고 반복 기술했으나 이는 **FALSE ALARM**이었다 — 4-1의 Mandatory Safe Route는 같은 구간을 `A3→M1→A4`로 우회해(§9) 이미 400px 이내(max 374.5px)이고, Flow Route는 4-1 문서 자체가 `OPTIONAL EXPRESSION`으로 명시한 skilled-only 지름길이라 Mandatory 진행에 영향이 없다. Shipped catalog도 원래 좌표(A4 `(-64,-800)`) 그대로이며 좌표 변경은 하지 않았다. 이 오분석이 반복 인용된 5개 파일의 관련 서술을 RESOLVED로 정정했다. 추가로: (a) 4-1 §9/§10 자체의 산술 오류(Safe Route margin `65.5px`→`25.5px`, `400−374.5`)와 자기모순("408.9px" 표 바로 아래 "400px보다 작다")을 고쳤다. (b) Master `§6/§8`과 `OPEN QUESTION #1`이 Cutter Fire를 여전히 "opt-out, harden 검토 중"으로 기술했으나 실제로는 `#513`에서 이미 `canCutRope = rules.includes("cutter-fire")` opt-in으로 구현됐음을 확인해 RESOLVED로 정리했다. (c) 4-3/4-5/4-8의 Wind Strength 360을 "Sector01 baseline 재사용"이라 기술한 서술을 정정 — 실제 Sector01 pulsed tuning은 500~800이며 360은 Sector04 고유 hypothesis였다(Cycle 1.75/0.70/1.40/0.30만 Sector01과 일치하는 precedent). 다만 360은 실제 shipped catalog가 그대로 사용하는 CURRENT RUNTIME 값이므로 "아직 미구현" 취급은 하지 않는다. (d) 4-2/4-3/4-4/4-5/4-6/4-7 6개 문서의 Gate/Panel worldObject 좌표가 실제 catalog와 어긋나 있어(주로 Y 32px, 일부 X도) 전부 실제 좌표로 정정했고, 4-8 D1 activation X 범위(`±192`→`±208`)도 정정했다. (e) 4-1 metadata 표의 Design Carry Build·Runtime Status·Art Status 문구를 현재 상태(Foundation CURRENT RUNTIME / First Specialization CONTENT BLOCKED, standalone catalog AUTHORED & VALIDATED)에 맞췄고 이 Runtime Status 표준 문구를 8개 문서 전체에 동일 적용했다. (f) 4-1 NEXT·4-3 NEXT nav 링크가 plain text였던 것을 실제 markdown 링크로 고쳤다. Runtime 코드는 변경하지 않았다.
30. Sector 05 `CORPORATE ZONE` Master와 5-1~5-8 상세 Stage 8개를 신규 추가했다(`docs/bsh/scenario/5/`). Primary Spatial Rule은 `SEALED SURFACE`(`grappleable:false`) / `SERVICE HARDPOINT`(`grappleable:true`) 정적 규칙이며, 실제 Rope Targeting 코드(`RopePointerInput.js`의 `surface.grappleable === false` 제외 조건)와 대조해 새 Physics 없이도 성립함을 확인했다. Story는 Capacity(5-4) → Priority(5-5) → Authorization(5-6) → Consequence(5-7) → Responsibility/WHY + Rooftop Pad 03 탈출 목표(5-8) 순으로 disclosure ladder를 완성한다. 문서 자체 품질이 높아 Safe/Flow Route 산술·activation membership·collinearity 검증에서 9개 파일 전량 오류 0건이었다. 정정한 것은 Cutter Fire 모델 문구뿐이다: Master `§9`, 5-3 `§0-1`/`§8-3`(S1), 5-6 `§0-1`/`§8-7`(S2)이 여전히 옛 opt-out 모델(`!rules.includes("no-rope-cut")`)을 기술하고 있었고 5-3/5-6의 실제 Cutter Sentry rule list에도 `cutter-fire` 태그가 빠져 있어, 현재 opt-in 모델(`canCutRope = rules.includes("cutter-fire")`)에 맞춰 프로즈와 rule list를 모두 정정했다. 이 alignment 필요성은 5-7/5-8 문서가 스스로 "Later Alignment Queue"로 이미 정확히 짚어뒀던 항목이라 이번에 함께 반영했다. 5-7이 남겨둔 "Sector04 4-1 A4 known issue" 참조도 실제로는 FALSE ALARM(#29)이었음을 반영해 RESOLVED로 정정했다. Sector 05 Runtime authoring은 사용자 결정(`SECTOR 01~06 SCENARIO FIRST`)에 따라 Sector 06 Scenario 완료 후로 HOLD한다. Runtime 코드는 변경하지 않았다.
31. Sector 06 `ROOFTOP / EVACUATION` Master Plan을 신규 추가했다(`docs/bsh/scenario/6/README.md`, 상세 6-1~6-8은 아직 없음). Sector06은 새 시스템 없이 기존 Wind·Standard Sentry·Access Scan Field·Patrol·Cutter를 Open Sky / Structural Island topology에서 한 번씩 총복습하는 최종 일반 구간이며, 6-8에서 Rooftop Pad 03 Shuttle에 도달하지만 `ACCESS DENIED`로 막혀 별도 Final Security Encounter(상세 Boss 계약 TBD)로 진입한다. Cutter Fire는 처음부터 opt-in(`cutter-fire ABSENT/PRESENT`) 모델로만 서술돼 정정할 opt-out 문구가 없었다. Master 자체의 `§0` snapshot과 `OPEN QUESTION #11`이 여전히 "Sector05는 문서 없음"·"5-3/5-6 Cutter wording 미정리"·"Sector04 A4 known issue"를 대기 항목으로 남겨뒀길래, 이번 통합에서 실제로는 전부 #576/#577로 이미 해소됐음을 반영해 RESOLVED로 정정했다. Sector06 Runtime authoring은 6-1~6-8 상세 작성 및 Full Game Audit 이후로 HOLD한다. Runtime 코드는 변경하지 않았다.
32. Sector 06 첫 상세 Stage 2개(6-1 `SKYBREAK ACCESS`, 6-2 `CROSSWIND MASTS`)를 추가했다(`docs/bsh/scenario/6/6-1/`, `6-2/`). 6-1은 Enemy·Wind 없이 Open Sky 공간 문법만 도입하는 순수 geometry Stage다. 6-2는 1-6 Fan A Wind를 재사용하며, 문서가 주장한 수치(`direction (-1,0)`, `continuous`, `strength 500`, `falloff 80`)를 실제 `Sector01AreaCatalog.js`의 `sector-01-06:fan-a-wind`와 대조해 정확히 일치함을 확인했다. 6-2가 인용한 `windOccludingSurfaces()` 판정식(`windOcclusion === true || (collision !== false && oneWay !== true)`)과 `WIND_CONFIG`(`groundedFactor 0.35`, `shadowFactor 0.15`, `defaultFalloff 0`)도 `WorldForceField.js`/`config.js`와 정확히 일치했다. 두 문서 모두 Safe/Flow Route 거리·마진 계산을 재검산했고, 표에 기재된 값 자체는 오류가 없었다. 다만 6-2 `§12` Recovery 서술의 R1 좌표가 `(-544,-560)`으로 적혀 있어 `§8-1` 표·`§6` 지도의 `(-560,-560)`과 어긋났다(6-1의 R1 좌표를 복사한 흔적으로 보임 — 실제 6-1 R1도 `(-544,-560)`). 거리 표는 `(-560,-560)` 기준으로 정확히 맞았으므로 `§12`를 정정했다. 추가로 6-2의 NEXT nav 링크가 아직 존재하지 않는 6-3을 실제 markdown 링크로 가리키고 있던 것을, 다른 Sector들의 확립된 컨벤션(존재하지 않는 Stage는 plain text)에 맞춰 정정했다. Runtime 코드는 변경하지 않았다.
33. Sector 06 세 번째 상세 Stage 6-3 `PERIMETER SIGNAL DECK`을 추가했다(`docs/bsh/scenario/6/6-3/`). 1-3의 Standard Sentry를 Cover 없는 Open Sky body-path mastery로 재시험하는 Stage다. 문서가 인용한 `hasLineOfSight()`(`cover-ends-los` 부재 시 항상 true, 존재 시 `kind:"cover"` collision만 차단)와 `playerHitInvulnerability`(0.45s)·`playerHitKnockback`(260) 상수를 각각 `EnemyObject.js`·`config.js`와 대조해 정확히 일치함을 확인했다. 문서가 정밀 인용한 실제 1-3 Sentry 데이터(`Sector01AreaCatalog.js`의 `sector-01-03:sentry-turret-01`: position `(416,-640)`, activation `triggerBounds(-480,-928,960,544)`, rules `["standard-projectile","no-rope-cut","cover-ends-los"]`, cover surface `safe-cover`/`upper-cover`)도 전부 정확히 일치했다. Safe/Flow Route 거리·마진, activation membership, Attack Range 760px pre-check, 문서 내 모든 좌표 상호 참조(§6/§8/§11/§24/§26)를 전량 재검산해 오류 0건이었다 — 이 문서는 완전히 정확했다. Runtime 코드는 변경하지 않았다.

34. Sector 06 네 번째 상세 Stage 6-4 `ROOFTOP SERVICE SHELTER`를 추가했다(`docs/bsh/scenario/6/6-4/`). 6-2 Wind와 6-3 Sentry 뒤 Enemy·Wind·Scanner·Damage Hazard를 모두 끄고, 수평 Shelter 이동 중 Pad 03과 Maintenance Shuttle을 처음 직접 확인하는 Rest/Goal Confirmation Stage다. Safe Route 8개 link와 Flow Route 6개 link를 독립 재계산해 문서값과 모두 일치했으며 Safe max `258.0px`, optional Flow max `369.4px`로 현재 400px Hook Reach 안에 있다. R1→H3도 `385.3px`로 Reach 안이지만 실제 복귀 감각은 Graybox 검증 대상으로 유지한다. Sector 06 Runtime·Camera·Stable ID·Approved Art는 계속 HOLD다.

35. Sector 06 상세 Stage 6-5 `PAD ACCESS ARRAY`, 6-6 `BEACON SPAN`, 6-7 `CONTAINMENT LATTICE`를 추가했다(`docs/bsh/scenario/6/6-5/`~`6-7/`). 6-5는 Enemy 없이 controlled Hardpoint C1/C2/C3만 하나의 Scanner group으로 묶어 현재 `AVAILABLE 1.5 / WARNING 0.6 / LOCKED 1.1 / RESET 0.3` 및 AVAILABLE/WARNING attach 허용·기존 Rope 유지 계약을 재시험한다. 좌표 재계산에서 Safe/Flow max `344.7px`는 맞았지만 `Controlled Mandatory Max` 한 곳이 `275.3px`로 잘못 적혀 있어 실제 C2→C3 거리 `288.4px`로 정정했다. 6-6은 speed `48`·wait `0.45`의 Patrol Drone이 acquire 위치에서 정지 사격하는 현재 계약을 대각선 Open-Sky span에서 재시험하며 Safe max `307.8px`, Flow max `340.2px`를 확인했다. 6-7은 `cutter-fire` opt-in Sentry와 Rope Cut 뒤 R0→E1→P2 하부 recovery를 재시험하며 Safe max `297.6px`, Flow max `357.8px`, R0→E1 `233.0px`, E1→P2 `178.9px`를 확인했다. 세 Stage 모두 Runtime·Camera·Stable ID·Approved Art는 계속 HOLD다.

## 열린 기획·구현 게이트

1. Sector 02 Boss 위치·전투 시나리오와 `2-8 → 3-1` 전환 흐름
2. Post-Sector 03 Boss와 `3-8 → 4-1` 전환
3. 2-3 Specialization의 실제 이름·효과·수치·선택 pool
4. NPC 역할·배치·대화 흐름과 Sector 06 엔딩·최종 완료 계약
5. 미래 authored Stage 공간 계획은 Hook 비행·빗맞음·재발사 telegraph와 원격 가시성을 반영해야 한다. 400px 도달은 속도×수명 파생 하나만 쓰고 별도 사거리 상수를 두지 않는다.
6. authored Sentry activation band와 Cover LOS는 인식 거리 760과 무관하게 encounter 제약으로 유지한다. 긴 인식 거리가 activation·LOS를 우회하지 않는다.
7. Post-Sector 04 Boss와 `4-8 → 5-1` 전환, Post-Sector 05 Boss와 `5-8 → 6-1` 전환. Sector 05 Runtime authoring 자체도 사용자 결정(Scenario-first)에 따라 Sector 06 Scenario 완료 후로 HOLD.

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
