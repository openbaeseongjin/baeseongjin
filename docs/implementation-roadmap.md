# 초기 컨셉 기준 구현 로드맵

실제 두 기기 검증의 실행 순서와 증거 형식은 `two-device-playtest-protocol.md`를 기준으로 한다. 절차 문서 작성과 플레이테스트 통과는 별도 상태로 관리한다.

## 제품 기준

> 아크샨식 고정 길이 로프 액션 × 아이작식 로그라이크 구조

순간 플레이의 중심은 로프 숙련이다. 0.26.0 generic 증강 22장은 전투 방식과 성장 폭을 만들지만 이동과 생존을 대신하지 않는다. 상세 계약은 [`augment-v1.md`](./augment-v1.md)를 따른다.

## 현재 구현 상태

### 완료

- PC·모바일 이동, 점프, 로프 부착·접선 스윙·해제
- 손에서 실제 비행하는 Hook과 `1200px/s × 1/3초 = 400px`, 기본 0.5초 재발사 대기
- 모든 암석 표면 부착과 수평 발판의 아래→위 통과
- 시드 기반 48단계 수직 월드와 카메라 추적 프로토타입
- 기본 자동 공격은 비활성화하고 로프 부착 중 고속 몸체 충돌을 기본 공격으로 사용한다. `AutomaticWeaponObject`는 후속 기능용으로 보존한다.
- authored activation·Cover LOS를 유지한 체력 100·인식 760px·탄속 520px/s·재사격 1.0초 Sentry
- 적 투사체의 본체 피해·무적 시간과 `cutter-fire` opt-in 로프 절단. 적 위치 넉백은 직접 추격·돌진형만 허용하고 Turret·고정 Patrol 경로형은 피해만 받는다.
- 체력, 사망·낙사와 플레이어별 활성 체크포인트 즉시 부활
- 전투 HUD, 피해 숫자, 충격파, 파편과 화면 흔들림
- 공용 명령·시뮬레이션 경계, PWA 설치와 자동 최신 배포 적용
- [과거 절차 프로토타입] 마지막 암석의 정상 목표와 최종 완료 상태
- [과거 절차 프로토타입] 8레벨 간격 체크포인트 생성·활성화·시각 표시. 현재 기본 Runtime은 24개 Stage마다 진입 세이브 포인트를 사용한다.
- [0.26.0] Rope 6·Action 6·Signature 6·범용 modifier 4의 22장, 결정적 3장 offer, Player별 최대 6장, owner-first damage/movement claim
- 초반 난이도 판단용 활성 시간·처치·피해·로프 절단·첫 generic Augment 선택 지표 수집
- 원격 배포에서 설정 버튼 길게 누르기로 여는 옵트인 런 지표 패널
- 첫 화면의 싱글·멀티 선택, 고정 게임 서버 연결과 모바일 4자리 채널 생성·참가
- 2인 권위 서버의 명령 receipt, 20Hz 스냅샷, 자기 예측과 동료 보간
- 1인·2인 멀티 공통 Enemy stable-ID in-place prediction restore, indexed history sampling과 fixed-step 단일 remote sample
- 1-1/1-2 local Player Bark data catalog·queue·causal dedupe·speaker 머리 위 타이핑 말풍선과 future party-chat audience 확장 seam
- 0.45.0 Stage Direction v1 schema·compiler·coverage/review release gate·timeline runtime·authority adapter와 1-1/1-2 Camera/Story/Bark/Audio/Lighting/비언어 migration
- 0.46.0 전투 밸런스: 낙하 피해 50% 완화, 로프 몸체 충돌 `1000px/s → 100 피해` 속력 비례화, 감전 로프 100 DPS와 속력 기반 충돌 폭발의 augment-impact v2 검증
- Sector 01 `1-1`·`1-7` AREA-SPEC v2 Map Editor와 manifest 기반 generated/legacy 합성 facade live cutover. Route·Enemy activation 편집, Runtime semantic Validate, read-only 보호, Drag 단일 Undo와 Apply 직전 현재 Stage source hash 확인을 포함한다. 해커톤 중 에디터는 한 번에 한 명만 사용하며 다중 사용자 mutex·crash-safe 원자 저장은 후속 범위다.
- 채널별로 한 명이라도 남아 있으면 유지되고 0명이 된 뒤 삭제되는 독립 오픈월드 세션
- 생성·해결 이벤트만 공유하고 클라이언트에서 재생하는 플레이어·적 투사체
- 네트워크 설정을 변경하지 않는 Cloudflare Quick Tunnel 임시 공유 명령

### 아직 없음

- 실제 플레이에서 새로 발견된 실패 사례와 초반 2분 지표 표본
- 실제 조작 기반 전체 등반 검증
- 실제 두 사람이 서로 다른 기기에서 장시간 등반하며 수행하는 개별 사망·부활·고지연 플레이테스트
- Sector 03 REV8 topology·Direction migration, Sector 04~06 Runtime 연결과 각 Post-Sector Boss transition
- 일반 Timer `60초 / +10초 / cap 60초 / Purge 240px/s`의 topology trigger·origin·개인 복귀 확정과 구현
- Boss01 physical Arena·Breaker/Core/Emitter/Wind·일반 전투 피해/전멸 재시도·`2-1` 전환과 Sector 02~05 보스 상세 계약·구현. Boss Timer·시간 만료 Arena collapse는 후속 범위다.
- 영구 성장, 자동 자원 생산, 도감과 다중 바이옴

## 구현 순서

### 연속 Sector 전환 선행 트랙

1. **Phase 1~2 · #622:** `SectorDefinition`, canonical encounter container, Sector validator, `1-1`~~`6-8` deterministic alias와 build/startup-only preview adapter를 먼저 병합한다. Sector 01~~03 preview는 현재 Area 좌표·activation·고정 적 선택을 보존하지만 기본 Runtime에 주입하지 않는다. Sector 04~06은 migration alias input만 제공한다.
2. **Enemy Phase 6:** #622 merge SHA 위로 topology-independent enemy branch를 rebase하고 `enemySelection.fixedEnemyType | enemySelection.allowedEnemyTypes`를 canonical `encounterSlot`에 연결한다. Runtime encounter 권위에 `areaId`를 다시 넣지 않는다.
3. **Phase 3 · #625 / #637 / savepoint-only progression:** Sector 01~03을 4,800px seamless world와 Player별 active Stage checkpoint로 전환했다. 현재 Runtime은 Stage cursor와 물리 route lock 없이 정적 geometry를 사용하고 objective는 자기 trigger/prerequisite로 판정한다. Boss01 위치·전투 core는 확정됐고 physical transition wiring이 남았으며, Timer·Purge의 topology mapping은 HOLD다.
4. [완료 #628, #633] topology-independent 증강 v1 core와 현재 Runtime Sector 01~~03의 explicit `augment-node` adapter를 연결했다. Player별 획득 순서는 `1-4 Maintenance Node → 2-3 Residential Service Node → 3-5 Commercial Service Node`이며 legacy alias 순서로 자동 생성하지 않는다. Timer +10 trigger, Purge origin/rejoin과 Sector 04~~06 획득 Node는 별도 결정한다.
5. **Sector Access 3-of-3 · 0.43.2:** Sector 01의 1-3·1-6·1-7, Sector 02의 2-2·2-5·2-7, Sector 03의 3-2·3-5·3-7 기존 경비 slot을 공용 Module source로 연결했다. 각 Sector는 세 개 전부를 요구하며 outgoing 경계의 transit device가 중앙과 Grapple budget 내 좌우 우회 crossing을 같은 visual/collision segments로 막고, unlock 시 blocker만 제거하며 모든 Player에게 camera scene을 재생한다. 같은 Sector 안의 Stage surface는 잠그지 않고 개인·전원 사망 뒤 module·route 상태를 보존한다. 위치 문자열은 제거하고 거리순 최대 3개 미수집 Carrier를 viewport 밖 edge arrow와 화면 안 diamond marker로 동시에 안내하며 가까운 대상일수록 크게 표시한다.
6. **Sector 01~03 combat density:** authored safe slot을 `16 → 18 → 22`로 늘리고, 기존 selector가 pool type만 결정하게 한다. runtime director·생성 좌표·slot enablement state는 추가하지 않는다.
7. **Traversal·선택 입력 일관성 · 0.42.1:** intra-Sector Stage 경계의 core와 city wing 사이에 Player 폭 이상의 하강 개구부를 보장해 놓친 Access Carrier로 되돌아갈 수 있게 했다. W/점프 선택 확정은 실제 새 누름 sequence만 소비하고, 렌더되는 solid horizontal platform은 별도 봉쇄 장치가 아닌 한 Rope 부착 가능하다는 validator 계약을 둔다.

### 제출 전 시나리오 구현 트랙

48개 Stage 문서는 migration source이자 제작 계약이며 별도 Runtime 진행 단위가 아니다. 현재 기본 Runtime은 위 연속 Sector 계약을 사용한다. 메인 개발자는 [`docs/bsh/scenario/`](./bsh/scenario/)의 콘텐츠를 섹터·번호 순서로 흡수하되 정식 그래픽·오디오를 기다리지 않고 `영역 흐름 확정 → 등장 오브젝트·상태·완료 조건·출구·표현 cue 목록화 → gameplay 구현 → mock 표현 연결 → 플레이 가능한 인계 빌드`까지 완료한다. 그래픽·오디오 담당자는 공개된 stable ID와 mock 배치를 기준으로 병행 제작하며, validator와 실제 화면·청취 검증을 통과한 결과만 나중에 교체한다.

상세 Stage 목록과 현재 Runtime 연결 상태의 기준은 [`scenario-development-integration.md`](./scenario-development-integration.md)다. `SECTOR 01`~~`06`의 `1-1`~~`6-8` 상세 Stage 문서는 48/48 작성됐다. 현재 `seamless-sector-runtime-v9`은 `1-1 → 3-8` 24개 alias를 3개 4,800px seamless Sector의 local vertical landmark stack으로 compile하고, 실제 lateral city wing을 더한다. Sector 04 `4-1 → 4-8`은 standalone migration catalog, Sector 05·06은 문서/alias input으로 남는다. 문서 수와 Runtime 연결 수를 같은 완료 수치로 취급하지 않는다.

Sector 03은 Access Scan Field Runtime(#523)과 3-1~~3-8 authored catalog(#525)를 구현해 메인 월드에 `2-8 → 3-1 → … → 3-8`로 연결했다. 이후 병합된 REV8/REV8.1 package의 대형 topology와 Direction track은 아직 future migration이며 현재 mock geometry를 바꾸지 않았다. 남은 것은 REV8 Runtime migration과 Post-Sector 03 Boss→`4-1` 전환 사용자 검토다. Sector 04는 4-1~~4-8 standalone catalog와 Camera·Story 인계 범위를 저작했으며 메인 월드 연결은 Boss 전환 결정을 기다린다.

`2-3`의 과거 Foundation별 Specialization은 0.26.0 generic 증강 v1로 대체됐다. 2-3 stable Node ID는 0.28.0 두 번째 generic offer source로 재사용하며, 고정 Specialization tier를 복구하지 않는다.

Patrol Drone은 기존 Enemy 전투 FSM에 선택적 Patrol capability를 조합한다. 맵은 결정적인 corridor/route·activation band만 제공하고 공격 acquire·track·lock·fire·cooldown과 투사체 규칙은 재사용한다. Patrol 자료가 없는 Sentry는 정지 동작을 유지한다. 각 Drone은 자기 band 안에서만 이동·획득하고 공격 cycle 중 target을 유지해 다른 band 플레이어 때문에 재조준하거나 지속 crossfire를 만들지 않는다.

월드 선택도 실행 방식별로 나누지 않는다. 로컬 실행과 네트워크 서버·예측은 하나의 `GameSimulationFactory`와 현재 authored catalog를 공유한다. 네트워크는 같은 world revision과 진행 상태를 복제할 뿐 별도 맵을 생성하지 않는다. 맵 definition은 stable object/state/event/presentation/cue ID만 소유하고 이미지·atlas·음원 경로는 소유하지 않는다. 현재 표현은 environment/audio runtime catalog와 world-object mock presentation catalog를 통해 연결하며 정식 package가 준비되면 같은 ID의 표현만 교체한다.

P1~~P5 기획 게이트의 Boss01·Final Security·Timer/Purge core·예선 NPC 제외·개별 Boarding·Ending 계약은 [`design-decision-requests.md`](./design-decision-requests.md)에 유지한다. 과거 Specialization 6종은 generic 증강 v1로 대체됐다. 구현은 `P0 Alignment → Boss primitive/Boss01 → Timer/Purge topology mapping → Sector04/05/06 Runtime 확장 → Final Security/Ending → Playtest` 순서이며, Sector02~~05 개별 Boss 상세와 Timer/Purge HOLD 세 항목은 후속 기획으로 남긴다. NPC는 핵심 범위 완료 뒤 여유가 있을 때만 2-6 최소안으로 검토한다.

### P0. 로그라이크 한 판의 순환 완성

1. [완료] 하나의 큰 월드 정상에 최종 목표와 `completed` 상태를 추가한다. 완료 후 자동으로 다음 스테이지를 시작하지 않는다.
2. [완료 #628, #633] 1-4·2-3·3-5 explicit Node에서 generic Augment 3장 offer를 Player별 한 번씩 제공한다.
    - [실시간 선택 완료] 선택은 월드 시간을 멈추지 않고 해당 플레이어의 메뉴 입력만 이동·점프·로프 조작과 분리한다.
3. [완료] Player별 generic Augment loadout과 런 한정 효과 적용 경계를 만든다. `FoundationAugmentState`는 호환 클래스명으로만 유지한다.
4. [완료] 사망 시 Player별 active Stage checkpoint 복귀를 적용한다. Timer·Purge가 미정인 현재는 같은 tick 전원 사망도 current Sector를 reset하지 않는다.

완료 기준: 시작 → 등반·전투 → generic Augment 선택 → 빌드 변화 체감 → 사망 시 최근 Stage checkpoint 부활 → content boundary 도달을 한 흐름으로 플레이할 수 있다.

과거 Foundation 3종(`Impulse Coil`, `Relay Link`, `Shear Current`)은 0.26.0 generic Augment v1으로 대체됐다. 현재 Catalog는 Rope 6·기본 Action 6·Signature 6·범용 modifier 4의 22장이며, legacy ID는 이전 snapshot을 읽는 migration 입력으로만 정규화한다. 어떤 Augment도 로프 숙련이나 기본 Safe Route를 대체하지 않는다.

### P1. 초기 절차 프로토타입과 초반 난이도 검증

이 절의 시드 경로 검사는 초기 로프 프로토타입 완료 이력이다. 현재 검증 기준은 정적 authored geometry·독립 objective·Player별 Stage save·전원 사망 진행 보존·content boundary다.

1. [완료] 생성된 핵심 경로의 연속 구간이 로프 사거리 안에 있는지 1,000개 시드에서 자동 검사한다.
2. [완료] 고정 시드 회귀 목록을 두고 실패 시드를 이유와 함께 재현한다.
    - [런별 시드 완료] 새 싱글 실행과 새 멀티 채널은 새 시드를 사용하고, 싱글 `?seed=`로 기록된 실패 지형을 다시 연다.
3. [수집 구현 완료] 시작 2분의 적 수, 피해량, 로프 절단 빈도와 첫 generic Augment 선택 시간을 플레이테스트에서 측정한다.
4. 설명 없이 부착·스윙·해제를 이해하는지 플레이테스트한다.

완료 기준: 검사 대상 시드가 모두 통과 가능 계약을 만족하고, 초반 실패가 조작 오해보다 플레이어 선택에서 발생한다.

### P2. 협동 의미 검증

- [동기화 설계 완료] 싱글은 인프로세스 권위, 협동은 서버 권위를 사용하며 두 방식 모두 같은 `GameSimulation` 규칙을 실행한다. 클라이언트는 입력만 제출하고 자기 플레이어만 예측한다.

1. [순수 규칙 완료] 플레이어 배열과 개별 체크포인트 부활을 2인 기준으로 시뮬레이션 테스트한다.
    - [생성 경계 완료] 싱글과 협동이 같은 PlayerRuntimeFactory를 사용한다.
    - [등록 경계 완료] 공용 GameSimulation이 같은 월드에 여러 플레이어 런타임을 등록한다.
2. [기반 완료] 로컬 명령 기록·재생과 상태 다이제스트로 시뮬레이션 결정성을 검증한다.
3. [전송 계약 완료] 프로토콜 버전·목표 틱·플레이어 ID·입력 순서 번호를 가진 명령 배치를 `PlayerCommand`와 스냅샷 경계에 연결한다.
    - [시뮬레이션 연결 완료] 다음 틱 명령 배치가 공용 GameSimulation의 등록 플레이어를 독립 갱신한다.
    - [다중 대상 전투 완료] 적과 투사체가 공용 players 배열의 로프·몸체를 권위 판정한다.
    - [생명 주기 단순화 완료] 체력 소진과 낙사는 같은 공용 메서드로 해당 플레이어만 최대 체력 부활시킨다.
    - [개별 부활 완료] 체크포인트 부활 시 사망한 플레이어만 활성 지점으로 복귀한다.
    - [협동 낙사 완료] 추락한 플레이어만 활성 체크포인트로 즉시 복귀하며 동료와 공용 월드는 중단하지 않는다.
    - [서버 세션 경계 완료] 인증 플레이어별 명령 수집, 120Hz 권위 틱과 20Hz 스냅샷 생성을 공용 GameSimulation에 연결한다.
    - [클라이언트 명령 흐름 완료] 원격 플레이어의 목표 틱·sequence·미승인 명령과 스냅샷 순서 검사를 전송 계층과 분리한다.
    - [원격 상태 버퍼 완료] 원격 플레이어·적 위치만 스냅샷 사이에서 보간하고 생명·전투·로프 판정은 최신 권위 상태를 즉시 적용한다.
    - [자기 예측 완료] 자기 플레이어를 승인된 물리·로프·제어 상태로 복원하고 미승인 입력을 같은 GameSimulation 로직에 재적용한다.
    - [명령 결과 계약 완료] 서버의 승인·거부 sequence를 receipt로 전달하고 거부 입력이 클라이언트 큐에 잔류하지 않게 한다.
    - [문자열 전송 경계 완료] command JSON 수신·receipt 응답·예정 snapshot 송신을 권위 세션 앞의 단일 어댑터로 조립한다.
    - [WebSocket 서버 완료] 정적 게임과 2인 임시 권위 방을 한 로컬 서버에서 열고 실제 소켓으로 명령·receipt·snapshot을 전달한다.
    - [브라우저 클라이언트 완료] 첫 화면에서 싱글·멀티를 선택하고 설정된 고정 WebSocket 서버에 연결해 자기 예측과 동료 보간을 Canvas에 표시한다.
    - [채널 로비 완료] 방장은 새 4자리 채널 번호를 만들고 모바일 참가자는 서버 URL 대신 공유받은 번호만 입력한다.
    - [오픈월드 세션 수명 완료] 채널별로 한 명이라도 남아 있으면 월드를 유지하고 마지막 유저가 나가면 해당 채널과 월드를 삭제한다.
    - [예측 투사체 완료] 생성·해결 이벤트와 서버 틱으로 플레이어·적 투사체를 클라이언트에서 재생한다.
    - [임시 원격 공유 완료] DNS·WARP·프록시·어댑터·방화벽을 바꾸지 않는 Quick Tunnel 명령으로 HTTPS와 WSS 접속을 연다.
    - [지속 소유자 예측 완료] 자기 캐릭터는 120Hz 클라이언트 틱마다 로컬 입력을 즉시 적용하고, 60Hz 명령 전송과 독립적으로 현재 predicted tick까지 진행한다.
    - [소유자 표시 보정 완료] 작은 권위 오차는 물리 예측과 분리된 표시 offset으로 100ms 안에 수렴하고, 160px 초과·로프·생명 불일치는 즉시 스냅한다.
    - [원격 스냅샷 보간 완료] 동료와 적은 100ms 지연된 서버 tick의 두 권위 표본 사이에서 표시하고, 미래 표본이 없을 때만 최대 120ms 외삽한다.

4. [플레이테스트 필요] 서로 다른 실제 기기 두 대에서 로프 절단, 사망·낙사·개별 Stage 세이브 포인트 부활, 전원 사망 공용 진행 보존, generic Augment loadout 유지와 content boundary를 검증한다.
5. [네트워크 검증 필요] 모바일망 지연과 장시간 세션에서 예측 오차, 보정 체감, 재접속 정책을 측정한다.
    - [진단 계측 완료] 설정 버튼을 1초 길게 눌러 디버그 수치 표시를 켠 뒤 서버 권위 런 지표와 RTT·스냅샷 간격·대기 명령·명령 거부율·보정 거리 p50/p95·하드 스냅·외삽 시간·탄환 예측 취소를 확인하고 **진단 복사**로 기기별 기록을 남긴다.
    - [네트워크 행렬 완료] 실제 WebSocket 경계에서 0/50/100/200ms 왕복 지연과 0/2/5% 송신 명령 손실의 12개 조합을 한 메인 시나리오로 검증한다.
    - [장시간 계측 경계 완료] 손실된 RTT 추적 기록은 snapshot ACK로 정리하고 ACK가 없어도 최근 2,048개만 유지한다.
    - [공개 경로 smoke 완료] `npm run smoke:multiplayer`로 Pages 설정부터 실제 WSS 채널의 2인 합류·퇴장·빈 방 제거·권위 RunMetrics 수신까지 검증한다.
    - [재참가 정책 완료] 연결 종료 시 마지막 채널 번호를 보존하되 자동 오프라인 진행은 하지 않고, 동료가 남은 월드에 사용자가 새 연결로 명시적 재참가한다.

완료 기준: 싱글과 협동이 같은 월드·전투·생명 로직을 사용하며, 한 플레이어의 사망·부활이 동료 조작과 공용 월드 진행을 멈추지 않는다.

### P3. 코어 검증 이후 확장

- 영구 성장과 자동 자원 생산
- 적·무기·generic Augment 확장
- 수집 도감, 섹터별 보스 전투, 바이옴과 완성형 아트

적 roster 확장 순서:

1. [완료] Stage ID에 의존하지 않는 stable enemy slot의 `고정 계열/type` 또는 `허용 pool` 선택과 `slotId + run seed + world revision` 결정성을 pure resolver로 구현한다.
2. [완료] 기존 `경계 포탑`·`순찰 드론`과 분리된 신규 기본형 `추격 드론`·`방패 드론`·`포격 드론`·`지원 드론`·`군집 드론`을 Has-A behavior와 공용 `enemy-behavior` capability로 조립한다.
3. [완료] 신규 행동을 서버 fixed step·snapshot/prediction 복원에 연결하고 포격은 기존 중립 적 투사체, 방패는 #611 Rope 충돌 claim 경계를 재사용한다.
4. [완료] #623 `SectorDefinition`의 `encounterId/slotId/position/activation/enemySelection/legacyStageAlias` 계약과 build/startup preview adapter를 selector에 연결하고, `areaId` 없이 Sector 01~03 preview encounter 전체를 결정적으로 resolve한다.
5. [완료 #625] City Phase 3 wide Runtime compiler가 canonical encounter를 실제 world spawn 입력으로 공급하고 legacy Patrol route·Cutter rules를 새 schema에 보존한다.
6. [후속] 신규 기본형 단독 조정 뒤 계열별 확장형과 Sector 누적 해금·허용/금지 조합을 추가한다. 현재 roster 목록·가중치·수치·배치·표시 색은 테스트에 고정하지 않는다.

P0~P2에서 로프 손맛과 한 판의 순환이 검증되기 전에는 착수하지 않는다.
