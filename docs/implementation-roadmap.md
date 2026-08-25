# ONE ROPE 구현 로드맵

> 로프로 붕괴 도시를 올라가는 액션 로그라이크.

실제 두 기기 검증의 실행 순서와 증거 형식은 `two-device-playtest-protocol.md`를 기준으로 한다. 절차 문서 작성과 플레이테스트 통과는 별도 상태로 관리한다.

## 제품 기준

> 아크샨식 고정 길이 로프 액션 × 아이작식 로그라이크 구조

순간 플레이의 중심은 로프 숙련이다. 0.26.0 generic 증강 22장은 전투 방식과 성장 폭을 만들지만 이동과 생존을 대신하지 않는다. 상세 계약은 [`augment-v1.md`](./augment-v1.md)를 따른다.

## 현재 구현 상태

### 완료

- PC·모바일 이동, 점프, 로프 부착·접선 스윙·해제
- 손에서 실제 비행하는 Hook과 `1200px/s × 1/3초 = 400px`, 발사 실패·취소 뒤 1초 재발사 대기와 부착 로프 해제 뒤 별도 0.1초 대기
- 모든 정적 collision 플랫폼·벽 표면 부착과 수평 발판의 아래→위 통과
- 시드 기반 48단계 수직 월드와 고속 낙하에서도 로컬 Player를 viewport 안에 유지하는 authored 카메라 추적
- 기본 자동 공격은 비활성화하고 성공한 로프 스윙 뒤 부착 또는 해제 carry 안의 고속 몸체 충돌을 기본 공격으로 사용한다. `AutomaticWeaponObject`는 후속 기능용으로 보존한다.
- authored activation·Cover LOS를 유지한 체력 100·인식 760px·탄속 520px/s·재사격 1.0초 Sentry
- 적 투사체의 본체 피해와 `cutter-fire` opt-in 로프 절단. Player는 피격 후 시간 기반 무적 없이 서로 다른 유효 impact를 각각 받는다. Cutter는 별도 몹이 아니라 일반 발사형 Enemy에 붙는 투사체 capability다. 적 위치 넉백은 직접 추격·돌진형만 허용하고 자기 이동 경로를 가진 다른 Enemy는 피해만 받는다.
- 고정 `sentry` Turret만 정지하고 Patrol·Pursuit·Shield·Artillery·Hardpoint Jammer·Support·Swarm은 authored Patrol, 직접 추격 또는 공용 Roaming 상태를 각 Behavior에서 조합해 이동한다.
- [0.66.0] Hardpoint Jammer는 맵별 전용 후보 Anchor 없이 일반 ropeable surface를 Hook reach 공간 질의로 자동 선택한다. Active Jam 표면 부착은 owner-first `jammer-shock` 하나로 Rope를 즉시 절단하고, 공용 감전 상태가 0.05초마다 2.5씩 0.5초 동안 총 25 피해를 적용한다. 재적용은 stack 없이 남은 시간만 초기화하며 pulse별 네트워크 사건은 보내지 않는다.
- 체력, 사망·낙사와 플레이어별 활성 체크포인트 즉시 부활
- 전투 HUD, 피해 숫자, 충격파, 파편과 화면 흔들림
- 공용 명령·시뮬레이션 경계, PWA 설치와 자동 최신 배포 적용
- [과거 절차 프로토타입] 마지막 암석의 정상 목표와 최종 완료 상태
- [과거 절차 프로토타입] 8레벨 간격 체크포인트 생성·활성화·시각 표시. 현재 기본 Runtime은 48개 Stage마다 진입 세이브 포인트를 사용한다.
- [0.67.0] Rope 6장과 마법 2장, XP 기반 자동 레벨 곡선, 네 마법 슬롯, 하단 쿨다운·XP HUD와 공통 상태이상 Pool
- [0.68.0] 보상 가능 Augment 24장, projectile·area·charge·지속 이동 Spell, Rope 회복·2단 점프, 등비 XP와 사망 손실, 동적 Enemy 공통 외부 Impulse
- 초반 난이도 판단용 활성 시간·처치·피해·로프 절단·첫 generic Augment 선택 지표 수집
- 원격 배포에서 설정 버튼 길게 누르기로 여는 옵트인 런 지표 패널
- 첫 화면의 싱글·멀티 선택, 고정 게임 서버 연결과 모바일 4자리 채널 생성·참가
- 시작 화면·설정의 통합 Help는 PC `Q/E/R/Shift` 직접 Spell 슬롯과 Rope 동시 사용, 모바일 Rope 기본 선택과 `슬롯 선택 → 월드 터치 1회 시전`, 네 슬롯 쿨다운, 몹 처치 경험치와 자동 장착 증강을 현재 Runtime과 동일하게 설명한다.
- 2인 권위 서버의 명령 receipt, 20Hz 스냅샷, 자기 예측과 동료 보간
- 1인·2인 멀티 공통 Enemy stable-ID in-place prediction restore, indexed history sampling과 fixed-step 단일 remote sample
- 1-1/1-2 local Player Bark와 인증 Party Chat이 공용 queue·causal dedupe·speaker 머리 위/화면 경계 타이핑 말풍선을 사용
- 0.45.0 Stage Direction v1 schema·compiler·coverage/review release gate·timeline runtime·authority adapter와 1-1/1-2 Camera/Story/Bark/Audio/Lighting/비언어 migration
- 0.72.2 플랫폼 충돌 피해: 공중→접지 전이 대신 authored surface와 새 충돌이 시작된 tick의 보정 전 2D 속력으로 기존 `800~1400px/s → 최대 체력 0~50%` 곡선을 한 번 적용한다.
- 0.73.1 멀티 Player 피격 표현: Enemy Behavior·Boss·Player Spell·적 투사체가 공통 `player-hit + target ID + impact ID` 사건을 사용하고 피해자의 즉시 예측과 동료의 서버 확정을 actor별 FSM에서 한 번씩 재생한다.
- 충돌 broad phase Quadtree와 Player별 world-space 관심 영역: 정적 surface는 전역 index에 유지하고, 멀티는 모든 active Player 영역의 합집합을 사용하며, 화면 밖 Enemy는 전체 시뮬레이션을 동결한다. active Player 주변에서는 swept collider bounds로 surface·actor 후보만 narrow phase에 전달한다.
- [0.62.0 / #934] 움직이는 Boss Polygon Rope는 손→조준 ray의 앞면 교점, body-local anchor, 선속도+회전 접선속도 joint와 owner/server/remote 동일 transform 복원을 사용한다. Boss06의 정적 Main/Ledge/Gate는 collision platform으로서 Ropeable이며, Warden body는 플랫폼이 아닌 actor라 부착 대상이 아니다.
- [0.65.0 / #936] Boss06은 표현 경고와 실제 hazard geometry, ID 순서의 wipe·승리 복귀, local Player 우선 camera, 검증된 participant restore와 단일 authority Boss DTO 계약을 사용한다.
- [V4 candidate] Boss06은 3200px Main·단방향 Ledge 3개·U1~~U10의 open-edge Arena, 좌표 기반 전체 locomotion 상태 카탈로그, 사용 이력 회복형 결정적 가중 공격 풀, 정점 5발 fan 유도미사일과 `2마리 / 15초 / live 6 skip` 공격형 몹 소환을 사용한다. Browser Gameplay View와 실제 1~~4인 full combat은 완료 전 검증 게이트다.
- Boss03·06은 공용 소환 컴포넌트의 `2마리 / 15초 / live 6 skip` 공격형 몹 패턴을 사용하며 서버만 해당 Boss ID의 소환몹을 생성·정리한다. Boss06 유도미사일 fan의 서로 다른 projectile contact는 각 객체별로 소비해 같은 frame과 지연 catch-up에서도 피격을 누락하지 않는다.
- Sector 01~~06의 48개 canonical AREA-SPEC v2를 여는 Map Editor. Gameplay View와 production Runtime은 authored bounds·surface·world object만 사용하며 Runtime 자동 geometry는 0개다. Entry·Save 표현, Exit portal 복합 객체, Story display, Enemy·Wind·Boss, Route·activation, 메모리 초안과 read-only 보호를 지원한다.
- `npm run check`의 production map parity gate는 48개 Stage별 authored surface와 Runtime landmark surface의 정확한 일치, derived surface 0개, Editor entity 전수 노출, 47개 동일 X·2160px 화면 밖 Gate→Entry 배치, 전체 authored world bottom 낙사 경계, Access/Jammer/proof 권위를 검증한다.
- 채널별로 한 명이라도 남아 있으면 유지되고 0명이 된 뒤 삭제되는 독립 오픈월드 세션
- 생성·해결 이벤트만 공유하고 클라이언트에서 재생하는 플레이어·적 투사체
- 네트워크 설정을 변경하지 않는 Cloudflare Quick Tunnel 임시 공유 명령

### 아직 없음

- 지상 보행형 Enemy와 Enemy 낙하·착지 피해 발생 규칙. 현재 `EnemyDamageAttribution`은 후속 환경 피해가 추가될 때 Player XP 귀속을 이어받는 기반까지만 소유한다.
- 실제 플레이에서 새로 발견된 실패 사례와 초반 2분 지표 표본
- 실제 조작 기반 전체 등반 검증
- 실제 두 사람이 서로 다른 기기에서 장시간 등반하며 수행하는 개별 사망·부활·고지연 플레이테스트
- Sector 03 3-3~~3-8 Direction migration과 Boss06의 실제 desktop/mobile·1~4인 멀티플레이 검증
- 일반 Timer `60초 / +10초 / cap 60초 / Purge 240px/s`의 topology trigger·origin·개인 복귀 확정과 구현
- 영구 성장, 자동 자원 생산, 도감과 다중 바이옴

## 구현 순서

### 연속 Sector 전환 선행 트랙

1. **Phase 1~2 · #622:** `SectorDefinition`, canonical encounter container, Sector validator, `1-1`~~`6-8` deterministic alias와 build/startup-only preview adapter를 먼저 병합한다. Sector 01~~03 preview는 현재 Area 좌표·activation·고정 적 선택을 보존하지만 기본 Runtime에 주입하지 않는다. Sector 04~06은 migration alias input만 제공한다.
2. **Enemy Phase 6:** #622 merge SHA 위로 topology-independent enemy branch를 rebase하고 `enemySelection.fixedEnemyType | enemySelection.allowedEnemyTypes`를 canonical `encounterSlot`에 연결한다. Runtime encounter 권위에 `areaId`를 다시 넣지 않는다.
3. **Phase 3 · #625 / #637 / #816 / #922, 0.60.0 이력:** Player별 checkpoint와 독립 Boss Stage를 유지하고 city wing·connector collision을 제거했지만, gap-0 Bounds seam은 0.74.0 Gate 분리 배치로 대체됐다.
4. [0.67.0 전환] authored `augment-node` 획득과 출구 선행조건을 제거하고, 서버가 확정한 마지막 양수 Player 피해 귀속 XP로 개인 레벨업 선택을 연다.
5. **Sector Access 3-of-3 · 0.43.2 / portal 정렬 0.60.0:** Sector 01·02·03의 기존 Carrier와 공용 Module 진행은 유지한다. outgoing route가 잠긴 동안 authored Gate portal만 사용할 수 없으며 자동 transit barrier collision·visual은 생성하지 않는다. 수집 진행과 Player별 checkpoint는 보존한다.
6. **Sector 01~06 combat density · 0.68.0:** `1-1·1-2`를 제외한 Stage를 Sector별 최소 `3 → 3 → 4 → 4 → 5 → 5` slot로 늘려 총 189개를 사용한다. 기존 selector와 Stage-local activation을 유지하고 runtime director·동적 생성 좌표는 추가하지 않는다.
7. **Stage 공간 권위 · 0.74.1:** AS IS → Gate 분리 배치가 현재 checkpoint Stage 하단을 낙사 경계로도 사용해 여러 Stage 낙하를 중간에서 끊었다. TO BE → target Entry의 동일 X·2160px 화면 밖 배치와 개별 Player Gate 이동은 유지하되, 낙사는 전체 authored world `bottomY + recoveryMargin`에서만 판정하고 복구 위치만 최근 checkpoint를 사용한다.

### 제출 전 시나리오 구현 트랙

AS IS → Sector 01~~06의 48개 Stage는 canonical v2/generated catalog로 production Runtime에 연결됐고 scenario-only Stage는 없다.

TO BE → Sector 01~05는 마지막 일반 Stage에서 다음 Sector로 직접 전환하고, Sector 06 뒤에만 독립 Boss Stage를 유지한다. Boss06 terminal Boarding을 포함한 실제 desktop/mobile 및 멀티플레이 전체 등반을 검증한다. 상세 상태는 [`scenario-development-integration.md`](./scenario-development-integration.md)가 소유한다.

진행은 `1-8→2-1`, `2-8→3-1`, `3-8→Boss03→4-1`, `4-8→5-1`, `5-8→6-1`, `6-8→Boss06→Gate/Bridge/Shuttle→전원 Boarding→Escape`다. Boss03 catalog 항목을 제거하면 3-8→4-1 직결로 복구되며 Timer/Purge와 Boss Timer/Arena collapse는 계속 HOLD다.

`2-3`의 과거 Specialization과 Node offer는 제거됐다. 공간은 유지하지만 증강 획득·출구 진행과 연결하지 않는다.

Patrol Drone은 기존 Enemy 전투 FSM에 선택적 Patrol capability를 조합한다. 맵은 결정적인 corridor/route·activation band를 제공하며, 디버그 더미처럼 authored Patrol이 없으면 짧은 기본 왕복 경로를 사용한다. acquire·track·cooldown 중에는 이동하고 lock·fire 동안만 정지한다. Patrol 자료가 없는 Sentry는 정지 동작을 유지한다. 각 Drone은 자기 band 안에서 target을 유지해 다른 band 플레이어 때문에 재조준하거나 지속 crossfire를 만들지 않는다.

월드 선택도 실행 방식별로 나누지 않는다. 로컬 실행과 네트워크 서버·예측은 하나의 `GameSimulationFactory`와 현재 authored catalog를 공유한다. 네트워크는 같은 world revision과 진행 상태를 복제할 뿐 별도 맵을 생성하지 않는다. 맵 definition은 stable object/state/event/presentation/cue ID만 소유하고 이미지·atlas·음원 경로는 소유하지 않는다. 현재 표현은 environment/audio runtime catalog와 world-object mock presentation catalog를 통해 연결하며 정식 package가 준비되면 같은 ID의 표현만 교체한다.

재사용 Canvas particle/VFX 기반은 완료됐다. Player Spell/shot/impact와 Enemy one-shot, Rope launch·flight·attach·tension·swing·release·miss 표현은 동일 preset DTO와 Polygon/Sprite 공통 renderer를 사용한다. 상태이상은 각 구체 runtime effect의 공통 draw 계약으로 particle을 만들고 actor renderer는 상태 ID를 해석하지 않는다. 기준은 [`particle-system.md`](./particle-system.md)다.

현재 순서는 `Boss06 Playtest → Timer/Purge mapping`이다. Boss06은 단일 base HP 1000·0.5 인원 multiplier·별도 weakpoint 0을 유지한다. Map Editor 공개 계약 안의 위치·수치·Phase·mechanic·HUD·전환은 사람이 편집하고 새 mechanic만 코드 Registry로 확장한다. Timer/Purge HOLD와 NPC 우선순위는 유지한다.

### P0. 로그라이크 한 판의 순환 완성

1. [완료] 하나의 큰 월드 정상에 최종 목표와 `completed` 상태를 추가한다. 완료 후 자동으로 다음 스테이지를 시작하지 않는다.
2. [0.67.0 이후 현행] 몹 처치 XP가 첫 레벨의 미획득 고위력 Spell 풀, 두 번째 레벨의 미획득 유틸 Spell 풀과 이후 전체 미획득 증강 offer를 Player별로 제공한다.
    - [실시간 선택 완료] 선택은 월드 시간을 멈추지 않고 해당 플레이어의 메뉴 입력만 이동·점프·로프 조작과 분리한다.
3. [0.67.0] Player별 `AugmentLoadoutState`, `SpellRuntimeState`, `PlayerExperienceState`가 선택·슬롯·쿨다운·성장을 각각 소유한다.
4. [완료] 사망 시 Player별 active Stage checkpoint 복귀를 적용한다. Timer·Purge가 미정인 현재는 같은 tick 전원 사망도 current Sector를 reset하지 않는다.

완료 기준: 시작 → 등반·전투 → generic Augment 선택 → 빌드 변화 체감 → 사망 시 최근 Stage checkpoint 부활 → content boundary 도달을 한 흐름으로 플레이할 수 있다.

현재 Catalog는 Rope 7장·이동 Passive 1장·Spell 16장의 총 24장을 소유한다. 과거 Action·Signature·Modifier와 Foundation 호환 경계는 제거됐다.

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
- 수집 도감, Boss06 전투, 바이옴과 완성형 아트

적 roster 확장 순서:

1. [완료] Stage ID에 의존하지 않는 stable enemy slot의 `고정 계열/type` 또는 `허용 pool` 선택과 `slotId + run seed + world revision` 결정성을 pure resolver로 구현한다.
2. [완료] 기존 `경계 포탑`·`순찰 드론`과 분리된 신규 기본형 `추격 드론`·`방패 드론`·`포격 드론`·`지원 드론`·`군집 드론`을 Has-A behavior와 공용 `enemy-behavior` capability로 조립한다.
3. [완료 #829, #844, 현행 Enemy 이동 정렬] 순찰·포격·지원·군집을 확정 TO-BE로 정렬했다. Shield·Artillery·Support·Jammer는 snapshot 가능한 공용 Roaming 상태를 각 구체 Behavior가 조합하고, 발사형 Enemy·Shield·Artillery의 교전 획득 거리는 화면 밖 장거리 선제 공격을 줄이기 위해 760px 기준을 공유한다. Swarm은 HP 10 기본 10기·Editor 추가 정보 2~20 계약을 유지한다.
4. [완료 #623] `SectorDefinition`의 `encounterId/slotId/position/activation/enemySelection/stageId` 계약을 selector에 연결하고, Area 별칭이나 `areaId` 없이 Sector 01~03 encounter 전체를 결정적으로 resolve한다.
5. [완료 #625] City Phase 3 wide Runtime compiler가 canonical encounter를 실제 world spawn 입력으로 공급하고 기존 Patrol route·Cutter rules를 새 schema에 보존한다.
6. [후속] 신규 기본형 단독 조정 뒤 계열별 확장형과 Sector 누적 해금·허용/금지 조합을 추가한다. 현재 roster 목록·가중치·수치·배치·표시 색은 테스트에 고정하지 않는다.

P0~P2에서 로프 손맛과 한 판의 순환이 검증되기 전에는 착수하지 않는다.
