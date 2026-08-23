# 싱글·협동 동기화 설계

이 문서는 현재 적용된 멀티플레이 동기화 방식의 요약과 상세 규약을 함께 관리하는 유일한 기준 문서다. 별도 문서에 같은 규칙을 복제하지 않는다.

## 요약

플레이어가 직접 체감하는 결과는 당사자 클라이언트가 즉시 적용하고, 서버는 중립 월드를 진행하면서 검증된 상태와 사건을 다른 참가자에게 공유해 모든 복제본을 수렴시킨다. 조작 감각은 P2P 게임에 가깝지만 모든 통신은 서버를 거치며, 순수 P2P 구조는 아니다.

| 범위                                | 최초 판정 주체                     | 동기화 방식                                                                                |
| ----------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------ |
| 자기 이동·점프·로프·낙사            | 소유 클라이언트                    | 즉시 로컬 시뮬레이션 후 `owner-motion` 공유, 동료 화면에서 보간                            |
| 자기 자동 발사와 플레이어 탄환 적중 | 공격자 클라이언트                  | 생성·적중 claim을 서버가 검증하고 고유 사건으로 공유                                       |
| 적 탄환의 본체 피격·로프 절단       | 피해자 클라이언트                  | HP·넉백·절단·부활을 즉시 적용한 뒤 impact claim으로 공유                                   |
| 고속 착지 피해                      | 착지한 소유 클라이언트             | 충돌 직전 하강 속도로 HP·치명 부활을 즉시 적용한 뒤 impact claim으로 공유                  |
| 로프 몸체 충돌의 적 피해            | 공격자 클라이언트                  | 로프 부착·최소 속도·새 접촉을 즉시 예측하고 `rope-impact` claim으로 서버 적 HP를 확정      |
| 몹·적 투사체·공용 월드              | 서버                               | 서버 고정 틱에서 진행하고 스냅샷 또는 생성·해결 사건으로 공유                              |
| Sector 개인 부활                    | 피해·낙사 플레이어 소유 클라이언트 | receipt 전 Sector entry로 즉시 부활하고 공용 진행은 유지                                   |
| Sector 전원 사망                    | 각 피해·소유 클라이언트            | 각자 자기 checkpoint에서 부활하고 Timer·Purge 결정 전에는 공용 reset을 만들지 않음         |
| 저작 objective                      | 서버                               | 각 objective trigger/source/prerequisite 결과를 `worldProgress` snapshot으로 수렴          |
| generic Augment 선택·효과           | 행동 클라이언트                    | 개인 chooser와 효과를 즉시 적용하고 서버가 호환 `foundation-selection` claim으로 검증·공유 |
| 파티클·화면 흔들림·경고             | 각 클라이언트                      | 서버는 의미 사건만 공유하고 각 화면이 audience에 맞춰 재생                                 |

핵심 원칙은 다음과 같다.

- 소유 클라이언트는 정상 승인 중 서버 스냅샷으로 위치·HP·로프·생명 상태를 되감지 않는다.
- 열린 Gate 포탈은 서버 소유 공용 진행이 소유자 위치를 의도적으로 불연속 전이하는 예외다. 클라이언트는 사건에 포함된 자기 도착 좌표를 한 번 적용하며, 이는 지연된 서버 위치 보정이나 일반 스냅샷 되감기가 아니다.
- 다른 플레이어와 적의 연속 위치는 보간하고, HP·로프 절단 같은 불연속 상태는 즉시 반영한다.
- 투사체는 매 틱 위치를 보내지 않고 생성 tick과 초기 상태를 공유해 각 클라이언트가 재생한다.
- 서버는 소유권·tick·중복과 서버가 소유한 중립 객체를 검증하며, 중립 시뮬레이션을 특정 참가자에게 맡기지 않는다.
- 로컬 반응만 빠른 것으로 끝내지 않고 서버와 동료 복제본이 같은 결과로 수렴해야 한다.
- 게임 규칙과 물리는 120Hz, 입력 제출은 60Hz, 공유 스냅샷은 20Hz를 사용한다.

### 클라이언트 우선 수렴 우선순위

1. **오차 무시:** 정상 연결 중 소유 플레이어의 서버 복제 위치·HP·로프 차이는 크기와 무관하게 화면 보정 입력으로 사용하지 않는다. 현재 서버는 소유자 물리를 독립 재실행하지 않아 별도의 권위 위치가 없으므로, 유한한 dead zone 대신 정상 snapshot 전체가 무보정 구간이다.
2. **비대칭 표현 보정:** 정상 소유자 snapshot에는 보정을 적용하지 않는다. 이전 Area compatibility의 체크포인트 rollback처럼 명시적 전이가 있는 경우에만 예측 상태를 다시 만들고 표현 offset을 짧게 감쇠한다. 이 경로는 기본 Sector Runtime에서 호출하지 않는다.
3. **소유권 분리:** 자기 이동·시야·로프·피격은 소유자 또는 피해자 클라이언트가 최종 원점이다. 서버는 동료 표시와 중립 월드·공용 진행을 배포하며 정상 snapshot으로 당사자 체감을 다시 쓰지 않는다.
4. **원격 grace:** 동료와 적은 100ms 과거 표본을 보간하고 표본 공백에서만 최대 120ms 외삽한다. grace는 로컬 입력 결과를 지연시키는 용도가 아니라 다른 복제본의 지터를 숨기는 용도다.
5. **공격자 관측 존중:** 로프·증강·명시적 자동 무기 적중은 공격 클라이언트가 본 표본의 사건을 사용한다. 서버 현재 위치·궤적·접촉 재구성 차이는 거부 조건이 아니며 소유권·승인된 prediction ID·tick·중복·공식 효과와 대상 생존/tombstone만 검증한다.

발산 방지의 마지막 보루도 소유자를 지연된 서버 복제값으로 hard sync하지 않는다. WebSocket backlog, protocol/world revision 불일치 또는 역직렬화 실패처럼 수렴을 보장할 수 없으면 세션을 종료하고, 사용자가 재접속할 때 welcome snapshot으로 새 소유자 시뮬레이션을 초기화한다. 동료·적 복제본은 서버/소유자 표본을 계속 보간하며, 장시간 공백 뒤 새 표본이 오면 제한 외삽 상태에서 최신 표본으로 다시 수렴한다.

### 다른 게임 엔진 기준 충족 점검

현재 구조는 2인 협동 브라우저 프로토타입에 필요한 멀티플레이 핵심 축을 충족한다. 아래 표는 기능을 더 만들기 위한 목록이 아니라, 다른 엔진의 공식 네트워크 모델과 비교해 현재 구조에 핵심 공백이 없는지 바로 판단하기 위한 기준이다.

| 엔진 기준                                                                                                                                                                                                                                                                                                                                                    | 현재 구현                                                                                                                                                                                                                                                     | 판정                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| 소유자는 예측하고 다른 참가자는 보간한다. Unity Netcode for Entities는 `Owner Predicted` ghost를 소유자에게 예측하고 다른 클라이언트에는 보간한다. ([Unity Ghost snapshots](https://docs.unity.cn/Packages/com.unity.netcode%401.0/manual/ghost-snapshots.html))                                                                                             | `OwnerPredictionRuntime`이 자기 `GameSimulation`을 즉시 진행하고 `RemoteWorldStateBuffer`가 동료를 보간·제한 외삽한다.                                                                                                                                        | 충족                                  |
| 일회성 사건과 지속 상태를 분리한다. Unity는 RPC를 일회성 사건, ghost snapshot을 지속 상태와 eventual consistency 용도로 구분한다. ([Unity Ghost snapshots](https://docs.unity.cn/Packages/com.unity.netcode%401.0/manual/ghost-snapshots.html))                                                                                                              | 생성·해결·피격은 고유 ID 사건으로 보내고 플레이어·적·공용 진행은 snapshot으로 수렴한다. late join은 현재 지속 상태와 활성 객체의 원래 spawn 사건을 받는다.                                                                                                    | 충족                                  |
| 예측 현재·보간 과거·서버 현재의 시간축을 구분하고 외삽을 제한한다. ([Unity Interpolation](https://docs.unity.cn/Packages/com.unity.netcode%401.5/manual/interpolation.html))                                                                                                                                                                                 | `serverTick`, 플레이어별 `ownerMotionTick`, 단조 `snapshotSequence`를 구분하고 100ms 보간·최대 120ms 외삽을 사용한다.                                                                                                                                         | 충족                                  |
| 입력/이동 표본은 tick 또는 timestamp, ACK, 보존된 입력과 결합한다. Unreal Character Movement는 saved move, timestamp, ACK와 correction을 같은 이동 계약으로 관리한다. ([Unreal Networked Movement](https://dev.epicgames.com/documentation/unreal-engine/understanding-networked-movement-in-the-character-movement-component-for-unreal-engine?lang=en-US)) | 명령 sequence·목표 tick·snapshot ACK를 보존하고 `owner-motion`은 최신 tick만 적용한다. 소유 클라이언트 최종 수렴 정책상 운동 correction은 하지 않으며, 체크포인트 같은 별도 사건 rollback과 impact 예외 복구만 상태 tick을 사용한다.                          | 협동·클라이언트 우선 정책 안에서 충족 |
| 메시지 순서를 암묵적으로 가정하지 않고 상태 묶음과 사건 ID로 인과관계를 보존한다. Unreal도 actor·RPC 종류를 넘는 실행 순서가 항상 보장되지 않음을 명시한다. ([Unreal Replicated Object Execution Order](https://dev.epicgames.com/documentation/unreal-engine/replicated-object-execution-order-in-unreal-engine?lang=en-US))                                | snapshot envelope, 사건 ID 중복 제거, projectile/prediction ID와 impact 복구 challenge로 순서·중복을 명시한다. 현재 WebSocket의 FIFO는 보조 조건이지 게임 객체 식별자를 대신하지 않는다.                                                                      | 충족                                  |
| 원격 입력은 소유권·형식·범위와 호출 빈도를 검증한다. Godot도 RPC 인자를 적용 전에 검증하고 위치·타이머·쿨다운을 무검증 신뢰하지 말 것을 권고한다. ([Godot High-level multiplayer](https://docs.godotengine.org/en/stable/tutorials/networking/high_level_multiplayer.html))                                                                                  | 인증된 player ID, 프로토콜 버전, 유한값·tick 순서와 사건 claim별 tick·쿨다운·대상·중복 ID를 검증한다. `owner-motion`은 협동 최종 수렴 정책상 물리량 봉투로 거부하지 않고, 예외 전체 상태는 서버가 발급한 일회용 challenge와 전체 복구 스키마를 통과해야 한다. | 협동·클라이언트 우선 정책 안에서 충족 |
| 상태 snapshot은 필요에 따라 unreliable/delta/relevancy를 사용한다. 브라우저 HTML5는 raw UDP를 사용할 수 없고 WebSocket 또는 WebRTC 경계를 사용한다. ([Godot High-level multiplayer](https://docs.godotengine.org/en/stable/tutorials/networking/high_level_multiplayer.html))                                                                                | 현재는 2인·20Hz의 단일 reliable WebSocket을 유지하되 v9에서 authored enemy 정적 정의를 제외하고 동적 상태만 보낸다. 동적 delta·관심 영역·WebRTC는 실제 계측에서 head-of-line 지연이나 대역폭 문제가 다시 확인될 때 검토한다.                                  | 현재 규모에서는 핵심 누락 아님        |

서버 rewind·공격자 lag compensation은 움직이는 서버 소유 표적이나 경쟁 PvP가 추가될 때 필요한 조건부 항목이다. 현재처럼 피해자가 자기 피격을 판정하고 적중 대상 수가 작은 2인 PvE에서는 선행 구현하지 않는다. 상태 지문은 우연한 시뮬레이션 불일치를 찾는 도구이지 신뢰 증명이나 치트 방지 수단이 아니므로 암호학적 해시로 바꾸는 것도 현재 핵심 요구가 아니다.

### impact claim과 최종 수렴

사용자 체감의 핵심은 **본체 피격·로프 절단·착지 피해의 최종 판정 주체가 피해 또는 소유 클라이언트**라는 점이다. 피해 클라이언트는 서버 응답 전에 HP·넉백·로프 절단·착지 피해·치명 시 부활을 적용한다. 정상 impact claim은 사건 자료와 적용 결과의 작은 상태 지문만 보내며 전체 소유자 상태를 반복 전송하지 않는다. 서버 receipt나 이후 snapshot은 이 결과를 복구하거나 소비한 탄환을 되살리지 않는다.

서버의 impact 검증은 피해 결과를 다시 판정하기 위한 권위 판정이 아니다. 인증된 연결, 메시지 형식과 impact ID 중복 여부를 확인한 뒤 공용 `GameSimulation`으로 같은 피해 전이를 적용하고 상태 지문을 비교한다. 적 탄환 impact는 서버 projectile, 착지 impact는 보고된 충돌 전 하강 속도와 공용 `FallDamage` 규칙을 사용한다. 지문이 같으면 전체 상태 없이 사건을 확정한다. 지문이 다르면 서버의 임시 전이를 되돌리고 같은 `impact-claim-receipt`에 `accepted: true`, `resolution: recovery-required`, 해당 impact·피해자 연결에 묶인 일회용 `recoveryId`를 보낸다. 피해 클라이언트는 응답 시점의 최신 소유자 상태, 그 상태를 만든 `stateTick`, 새 지문과 `recoveryId`를 한 번 전송한다. 서버는 실제로 발급해 보관 중인 challenge와 일치할 때만 전체 상태를 흡수하고, 상태와 플레이어별 `ownerMotionTick`·로프 tick을 같은 처리에서 갱신한다. challenge 없는 첫 claim이나 다른 impact ID로 전체 상태를 보내면 `recovery-not-requested`로 거부한다. 복구 요청은 피해 클라이언트를 서버 상태로 되감지 않는다.

상태가 크게 벌어졌을 때 수렴 기준은 상태 소유권에 따라 다르다.

| 불일치 범위                    | 최종 기준                                   | 수렴 방식                                                                                                                                         |
| ------------------------------ | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 소유 플레이어의 연속 이동·속도 | 인증·형식 검사를 통과한 최신 `owner-motion` | 서버와 동료가 최신 tick 상태를 그대로 적용하며, 값의 크기나 receipt를 이유로 소유자를 복원·재실행하지 않음                                        |
| 피해자의 HP·로프·부활          | 피해 클라이언트의 impact 결과               | 정상은 사건과 상태 지문으로 확정하고, 지문 불일치 때만 피해자의 최신 상태를 한 번 받아 따라감. 서버 상태를 피해 클라이언트에 덮어써서 맞추지 않음 |
| 몹·적 투사체·공용 월드         | 서버 상태                                   | 서버 스냅샷과 생성·해결 사건을 적용하고 연속 위치만 보간·제한 외삽                                                                                |
| 최초 입장·재접속               | 서버가 보존한 최신 공유 상태                | 전체 소유자 상태를 한 번 복원한 뒤 다시 클라이언트 우선 시뮬레이션 시작                                                                           |

현재 player-impact 프로토콜 v8의 정상 메시지는 일반화한 impact ID(기존 projectile 소비자는 같은 값을 `projectileId` 호환 별칭으로도 받음), client tick, impact 종류, 충돌 위치·속도, 관측 대미지, 부활 여부와 64비트 상태 지문을 운반한다. 서버에 탄환이 있으면 서버 대미지로 같은 전이를 시도하고, 이미 만료됐으면 피해 클라이언트가 관측한 대미지로 시도한다. `fall-damage`는 공용 안전·최대 피해 속도와 50% 배율로 대미지를 다시 계산해 다른 값의 claim을 거부한다. 결과 지문이 다를 때만 두 번째 메시지에 `recoveryId`, 최신 소유자 상태와 `stateTick`을 함께 싣는다. 복구 상태는 서버가 실제로 복원하는 ID·위치·속도·각도·각속도·접지·HP·타이머·생명·로프 손 offset·로프 발사 shot/cooldown·입력 제어·무기와 generic Augment 호환 필드 전체의 타입·유한값·기본 범위·내부 관계를 검증한다. 인증된 피해자 ID와 상태 ID가 다르거나, `stateTick`이 이전 승인 owner tick보다 오래됐거나 서버 허용 미래 tick을 넘으면 복구를 적용하지 않는다. 형식이 깨졌거나 인증된 플레이어가 없는 메시지는 정상 gameplay 거부 receipt가 아니라 프로토콜 오류로 연결을 종료한다.

상태 지문은 raw 플레이어 객체 전체의 정확 일치 해시가 아니다. impact가 소유하는 지속 결과만 결정적 순서로 투영하고, 위치·속도·로프 기하는 0.1 단위, 타이머는 1/120초 tick, 체력·무기 수치는 0.001 단위로 양자화한 뒤 비암호학적 64비트 FNV-1a를 계산한다. 일반 본체 피격은 HP·속도·피격 무적, 로프 절단은 부착 여부·재부착 제한, 치명 피격은 여기에 체크포인트 위치·생명·로프·무기·generic Augment 순간 상태를 포함한다. 입력 포인터·렌더 상태와 다른 동기화 경계가 소유한 값은 제외한다. 이 지문은 불일치 감지용이며 인증이나 치트 방지 증거가 아니다.

이하 절은 위 요약의 메시지 계약, 거부·복구 정책, 보간, 클래스 책임과 검증 기준을 정의한다.

## 결정

플레이어·로프처럼 특정 소유자가 있는 입력 주도 사건은 소유 클라이언트가, 충돌·피격은 피해 클라이언트가 최초 트리거한다. 서버는 이 사건을 플레이어 체감 경로에서 먼저 시작하지 않는다. 일반 claim은 계약별 소유권·tick·중립 객체 상태·중복을 검증한다. impact claim은 인증·형식·중복을 확인하고 같은 전이의 상태 지문을 비교하며, 불일치 때만 피해 클라이언트 상태를 요청해 복제·배포한다. 서버 왕복을 기다린 뒤 모바일 반응을 시작하는 구현은 허용하지 않는다.

서버의 주역할은 소유 클라이언트가 만든 상태와 사건을 검증해 다른 클라이언트에 공유하고 전체 복제본을 수렴시키는 것이다. 소유 클라이언트의 직접 체감 상태를 서버 스냅샷으로 다시 작성하지 않는다. 검증된 무기 파라미터 같은 협동 진행 정보만 별도 공유 진행 경계에서 흡수한다. `owner-motion`은 인증·프로토콜 형식·유한값을 통과한 최신 tick을 서버 복제본과 동료의 수렴 원점으로 적용하며 속도·각속도·이동 거리·로프 offset 봉투로 거부하지 않는다. 소유자 전체 상태 복원은 최초 입장·재접속과 체크포인트처럼 별도 복구 계약이 있는 사건 전이에만 사용한다. impact는 반대 방향이며 상태 지문이 어긋난 경우에만 피해 클라이언트의 최신 적용 결과를 서버가 흡수한다. 서버가 스스로 진행하고 최종 상태를 작성하는 범위는 몹·중립 투사체·공용 월드와 세션 수명주기다.

몹·적 투사체 생성과 궤적처럼 특정 클라이언트에 귀속할 수 없는 중립 시뮬레이션 사건은 서버가 진행한다. 중립 사건을 안정적인 플레이어 ID의 대표 클라이언트에게 위임하지 않으며, 참가자 퇴장과 무관하게 같은 월드 상태를 유지한다.

현재 플레이어 당사자 경로의 전환이 끝난 범위는 자기 이동·로프·로프 몸체 공격 충돌·자기 피격·로프 절단·착지 피해·낙사·체크포인트 도달·generic Augment 선택·정상 도달이다. 적 발사 생성과 적 투사체 궤적은 중립 서버 소유 경로로 확정한다.

싱글과 협동은 모두 하나의 **권위 시뮬레이션**을 사용한다.

- 싱글에서는 `LocalAuthority`가 브라우저 안에서 `GameSimulation`을 직접 실행한다.
- 협동에서는 각 클라이언트가 같은 `GameSimulation` 규칙으로 담당 사건을 트리거하고 별도 서버 프로세스가 claim을 검증·공유한다.
- 클라이언트는 `PlayerCommand`, 사건 claim과 소유자 운동 상태를 제출하고 검증된 공유 스냅샷을 받는다.
- 로컬 플레이어는 즉시 시뮬레이션하며 일반 서버 스냅샷으로 위치·속도·로프를 보정하지 않는다. 사건 claim은 각 계약의 허용 범위를 검증하지만 `owner-motion` 연속 상태는 물리량 봉투로 거부하지 않는다.
- 다른 플레이어와 적의 연속 위치는 수신한 스냅샷 사이를 보간한다. 원격 플레이어는 `ownerMotionTick`, 적은 `serverTick`을 위치 표본 시각으로 사용하며 플레이어 표시 목표 tick에는 공용 입력 선행값을 더해 두 시계를 정렬한다. 투사체는 위치 스냅샷이 아니라 생성·해결 이벤트로 각 클라이언트에서 재생한다.

게임 규칙을 싱글용과 멀티용으로 나누지 않는다. 권한의 위치와 전송 방식만 바꾼다.

권한 감각은 P2P 게임에 가깝지만 전송 구조가 순수 P2P인 것은 아니다. 특정 플레이어에게 귀속되는 이동·로프·피격 결과는 소유자 또는 피해자 클라이언트가 먼저 판정한다. 반대로 몹·적 투사체 생성과 궤적처럼 어느 한 클라이언트에 맡길 수 없는 중립 월드 상태는 서버가 진행한다. 두 영역의 충돌은 피해 클라이언트가 impact 사건과 결과 지문을 claim하고 서버가 같은 전이를 적용해 중복 제거·수렴 여부를 확인한다. 서버의 지연된 플레이어 위치만으로 피격을 먼저 발생시키는 경로는 두지 않는다.

## 객체 권한 모델

- 플레이어·로프처럼 사용자가 직접 조작하는 객체는 `InputDrivenObject`다. 입력은 소유 클라이언트의 `InputDispatcher`를 거쳐 capability 믹스인에 즉시 적용되고 같은 입력 프레임·tick·sequence가 서버 검증 경계로 전달된다.
- 적·자동 행동 객체·직접 조작하지 않는 투사체는 `SimulationDrivenObject`다. 서버 고정 스텝이 최종 상태를 진행하고 클라이언트는 스냅샷 또는 생성·해결 사건으로 재생한다.
- 객체 분류는 프로세스 배치가 아니다. 서버는 입력 주도 객체의 최신 연속 상태와 사건 claim을 검사할 상태를 유지하고, 클라이언트는 시뮬레이션 주도 객체의 표시·충돌 예측용 복제본을 유지할 수 있다.
- 두 객체 종류가 만나는 피격·절단·충돌은 피해 `InputDrivenObject`가 체감 결과를 먼저 적용하고 사건 결과 지문을 claim한다. 서버는 인증·형식·중복을 확인하고 같은 전이의 지문을 비교하며, 다를 때만 피해자의 최신 상태를 요청해 자기 복제 상태를 맞춘다.
- `OwnerPredictionRuntime`은 소유 `InputDrivenObject` 집합 전체의 입력 이력, 예측 tick, claim 수명, 별도 복구 계약이 있는 사건 전이와 표시 보정만 담당한다. `owner-motion` receipt와 impact receipt는 로컬 상태를 복구하지 않는다. 플레이어·로프 종류별 게임 로직은 capability 믹스인에 둔다.

## 선택 이유

고정 길이 로프, 중력, 폴리곤 충돌과 투사체는 작은 상태 차이가 이후 움직임을 크게 바꿀 수 있다. 모든 참가자가 입력만 교환하는 완전 락스텝은 브라우저별 부동소수점 차이와 한 명의 지연에 취약하다. 한 플레이어를 호스트로 삼는 방식은 구현은 빠르지만 호스트 이탈, 부정 입력과 진행 상태 소유권 문제가 생긴다.

따라서 플레이어 사건과 지속 상태는 소유·피해 클라이언트가 작성하고, 서버는 검증된 복제 상태와 공유 사건의 배포를 소유한다. 조작감에 민감한 반응은 임시 연출이 아니라 클라이언트의 즉시 결과이며, 서버 승인이 이를 일상적으로 되감지 않는다.

이 구조는 일회성 사건과 지속 상태를 분리하고, 정상 명령·사건 전송 중에는 전체 상태를 반복하지 않으며 불일치 때만 상태 복구를 보내는 일반적인 예측·수렴 원칙을 따른다. Unity Netcode도 일회성 RPC와 지속 Ghost 상태를 구분하고 스냅샷으로 예측 오차를 교정하며, 결정적 락스텝 연구도 평상시 명령 전송과 비동기화 시 스냅샷 복구를 분리한다. 브라우저 물리의 부동소수점 차이로 raw 값이 완전히 같지 않을 수 있으므로 지문 입력은 도메인 단위로 양자화한다.

- [Unity Netcode for Entities: Ghost snapshots](https://docs.unity.cn/Packages/com.unity.netcode%401.0/manual/ghost-snapshots.html)
- [Unity Netcode for Entities: Prediction](https://docs.unity.cn/Packages/com.unity.netcode%401.0/manual/prediction.html)
- [Deterministic Lockstep in Networked Games](https://d-nb.info/132650245X/34)
- [Exploring the Effects of Non-Determinism on Networked Physics Simulation](https://arxiv.org/abs/2104.06262)

## 시간 모델

- 권위 시뮬레이션: 현재와 같은 고정 스텝 `1/120초`
- 입력 전송 단위: 시뮬레이션 2틱을 묶은 `60Hz` 명령 배치
- 권위 스냅샷: 초기값 `20Hz`
- 모든 명령과 스냅샷은 단조 증가하는 정수 `tick`을 가진다.
- 모든 권위 스냅샷은 시뮬레이션 tick과 별도로 단조 증가하는 `snapshotSequence`를 가진다.
- 클라이언트는 입력마다 증가하는 `sequence`를 붙인다.
- 서버 스냅샷은 처리 완료한 플레이어별 `ackSequence`를 포함한다.
- 새 클라이언트는 `snapshotAck=1` 연결 옵션으로 수신 확인을 요청하고, 서버가 welcome의 `snapshotFlowControl: true`로 확인한 뒤에만 ACK를 보낸다. 클라이언트는 새 `snapshotSequence`를 역직렬화해 버퍼와 수렴 계층에 적용한 다음 그 sequence를 누적 `snapshot-ack`으로 보낸다. 확인 필드가 없거나 false인 이전 서버에는 ACK를 보내지 않고, 옵션을 요청하지 않은 이전 클라이언트에는 서버가 기존 전송을 유지해 단계적으로 배포할 수 있게 한다.
- 협상이 끝나면 서버는 welcome을 포함해 클라이언트별 미확인 snapshot을 최대 4개만 전송하고 창이 찬 동안의 지속 상태는 가장 최신 snapshot으로 합친다. 합쳐지는 중간 snapshot의 spawn·resolve·피격 같은 의미 사건은 최신 봉투에 모두 보존한다.
- 누적 ACK는 받은 `snapshotSequence` 이하의 미확인 항목을 해제한다. ACK 하나라도 창에 빈자리를 만들면 서버는 창 전체가 빌 때까지 기다리지 않고, 중간 지속 상태를 차례로 재생하는 대신 보존한 사건과 최신 상태를 즉시 전송한다. 합쳐진 대기 봉투가 256KiB를 넘으면 오래된 상태를 계속 재생하는 대신 세션 수렴 불가로 연결을 종료한다.

120Hz 물리 계산은 로프 운동의 기존 감각을 유지하고, 60Hz 입력과 20Hz 스냅샷은 초기 협동 프로토타입의 전송량을 제한한다. 수치는 플레이테스트와 측정 후 조정할 수 있지만 틱 기반 계약은 유지한다.

## 명령 흐름

```text
입력 장치
  → 정규화된 입력 프레임 생성
  → InputDispatcher가 소유 InputDrivenObject capability에 적용
  → sequence와 targetTick 부여
  → PlayerCommandBatch와 owner-motion 전송
  → 권위 서버가 명령 소유권·순서와 owner-motion 형식·최신 tick을 확인
  → 최신 owner-motion을 공용 InputDrivenObject 연속 상태에 적용
  → WorldSnapshot + ackSequence + ownerMotionTick 전송
```

서버는 다음 명령을 거부한다.

- 인증된 연결의 플레이어 ID와 다른 명령
- 이미 승인한 `sequence` 이하의 중복 명령
- 허용 범위보다 먼 미래 또는 오래된 `targetTick`
- 지원하지 않는 프로토콜 버전
- 유한수가 아니거나 축 범위를 벗어난 입력

`AuthorityCommandInbox`가 플레이어별 마지막 승인 `sequence`와 허용 틱 범위를 소유한다. 승인된 입력은 목표 틱별로 보관하고 한 번만 소비하며, 같은 플레이어가 같은 틱에 더 높은 순서 번호를 보내면 최신 입력으로 교체한다. 최대 200ms 왕복 지연에 지터 여유를 두어 클라이언트는 명령을 30틱(250ms) 앞에 예약하고 서버는 최대 36틱(300ms) 미래 입력을 허용한다. 이 배치는 소유 클라이언트의 재적용 원본과 순서·지연 진단 계약이며 멀티 서버가 플레이어 물리를 다시 실행하는 명령이 아니다. 수치는 실제 왕복 지연 측정 후 같은 `MULTIPLAYER_TIMING` 계약에서 조정한다.

소유 클라이언트 예측에서 명령이 비는 120Hz 틱은 마지막 입력을 최대 30틱만 유지한 뒤 이동 축을 중립화한다. 로프 해제처럼 상태 전이가 필요한 입력은 추측하지 않는다. 멀티 서버는 입력 공백을 보간하지 않고 마지막 적용 `owner-motion` 상태를 유지한다.

`GameSimulation.stepCommandBatch()`는 싱글과 소유 클라이언트 예측에서 배치 틱이 정확히 다음 시뮬레이션 틱인지 확인하고 플레이어 ID로 명령을 연결한다. 멀티 서버는 같은 월드 스케줄러를 사용하되 `advanceInputDrivenObjects: false`로 실행해 플레이어·로프 capability를 중복 호출하지 않는다. 플레이어 타이머와 무기 쿨다운, 적·투사체 같은 `SimulationDrivenObject` 단계는 계속 진행한다.

`PlayerCommand.interact` boolean은 route terminal 같은 근접 문맥 상호작용 의도다. PC `W/↑`와 모바일 점프 버튼은 점프 축과 이 의도를 함께 보내며, 권위 simulation은 준비된 terminal의 반경 안에서만 objective 완료에 사용한다. 사망·부활 규칙은 여전히 동료 상호작용을 요구하지 않고 이 입력을 부활 입력으로 소비하지 않는다.

## 상태 소유권

| 상태                                   | 최종 소유자                                       | 클라이언트 처리                                                                                                               |
| -------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 자기 이동·속도·로프                    | 입력한 클라이언트                                 | 로컬 시뮬레이션 후 최신 상태 전송                                                                                             |
| 동적 actor 바디 충돌                   | Player는 각 소유 클라이언트, Enemy는 서버         | inverse-mass 겹침 보정과 질량·상대 속도 impulse를 자기 권위 body에 즉시 적용 후 최신 상태 전송                                |
| 플레이어 위치·속도                     | 소유 클라이언트, 서버 공유                        | 즉시 적용 후 최신 상태 전송                                                                                                   |
| 로프 부착점·길이·절단                  | 소유·피해 클라이언트, 서버 검증                   | 즉시 적용 후 claim 전송                                                                                                       |
| 적 상태·HP 최종값                      | 서버                                              | 권위 스냅샷 적용                                                                                                              |
| 자기 피격·로프 절단                    | 피해 클라이언트, 서버 검증·공유                   | 즉시 로컬 적용 후 검증 claim                                                                                                  |
| Boss kinematic body·Beam/Ram/Charge/Slam/Dive 피격 | Boss motion은 서버, Player 반응은 피해 클라이언트 | 활성 Boss Stage ID와 mechanism snapshot을 결정적으로 진행해 공통 actor collision·피해를 즉시 적용하고 `boss-hazard` state digest claim으로 수렴 |
| 예측 가능한 투사체·낙하물              | 플레이어 소유는 담당 클라이언트, 중립 객체는 서버 | 생성 tick·초기 상태 공유 후 로컬 재생                                                                                         |
| 자기 사망·active Stage checkpoint 부활 | 피해·소유 클라이언트, 서버 검증·공유              | 즉시 로컬 복귀 후 검증 claim                                                                                                  |
| 월드 시드·지형·Sector entry            | 서버                                              | 시드로 생성 후 `worldRevision`과 WorldSnapshot protocol v12 검증                                                              |
| Sector objective                       | 서버                                              | 독립 trigger/source/prerequisite 결과와 `foundationRewards`를 공유하며 마지막 objective는 content boundary 유지               |
| 플레이어별 generic Augment 선택·효과   | 행동 클라이언트 선행, 서버 검증·공유              | 개인 chooser와 효과를 즉시 적용하고 호환 `foundation-selection`·generic `augment-impact` 뒤 개인 상태와 공용 objective를 수렴 |
| 카메라·HUD·파티클                      | 클라이언트                                        | 자기 상태는 로컬, 원격·중립 상태는 검증된 공유값 사용                                                                         |

충돌 broad phase와 화면 기반 Enemy 활성화도 권위별로 같은 결정적 world-space 규칙을 사용한다. 소유 클라이언트는 자기 Player 주변 관심 영역에서 즉시 Player↔Enemy 후보를 조회하고, 서버는 채널의 모든 active Player 관심 영역을 합쳐 중립 Enemy 활성 집합을 정한다. 실제 viewport 크기·카메라 zoom을 전송하거나 한 대표 Player에게 중립 활성 판단을 맡기지 않는다. 관심 영역 밖 Enemy는 서버에서 전체 fixed-step을 동결하고 snapshot 위치를 유지하되 공개 velocity와 충돌 잔류 속도는 0으로 보내 원격 외삽이 잠든 Enemy를 이동시키지 않게 한다. 행동·Patrol·knockback 잔여 상태는 소비하지 않으며 영역 안으로 다시 들어오면 전역 surface Quadtree와 동적 actor Quadtree에서 swept bounds 후보를 조회해 재개한다.

클라이언트가 만드는 owner motion·impact·progress claim은 로컬 사건 순서인 `clientTick`과 서버 시간창 판정용 `authorityTick`을 분리한다. `authorityTick`은 최신 snapshot의 `serverTick`과 확정된 자기 `ownerMotionTick`에 로컬 경과분만 투영하며 snapshot마다 다시 고정한다. 서버는 `clientTick`으로 prediction ID·동일 소유자 사건 순서를 검증하고 `authorityTick`으로 과거·미래 허용 범위만 검증한다. command target tick은 로컬 예측 tick이 아니라 최신 서버 tick에서 input lead를 더해 만들고, 거절된 pending command가 제거되면 남은 pending과 최신 서버 tick으로 다음 target을 다시 계산한다. 시간창 거절은 성공으로 집계하지 않으며 owner motion은 한 번 재고정해 다시 보내고, augment impact와 checkpoint claim은 동일 사건 ID로 한 번만 재전송한다. 서버는 시간창에서 거절한 augment impact를 중복 완료 기록에 넣지 않아 그 한 번의 복구를 허용하고, 승인된 impact만 HP 전이와 공용 `resolve` 사건을 함께 확정한다.

`rope-impact`의 `position`은 표적 중심이 아니라 접촉 순간 공격 Player collider의 world 위치다. 표적 collider와의 실제 overlap 검증과 Boss06 Guard/Counter의 facing 기준 정면·후면 분류가 이 한 값을 공유한다. 화면의 impact VFX 위치는 별도 표적 position을 사용해 claim geometry와 표현 좌표를 섞지 않는다.

Boss06 승리 뒤 Boarding은 Player별 위치 주도 사건과 공용 완료 상태를 분리한다. 각 소유 Player는 Gate/Bridge를 직접 건너 boarding zone에 들어가고 서버는 Player별 ready ID를 공유한다. 연결된 모든 참가자가 ready일 때만 run completion을 확정하며 첫 ready Player가 동료를 순간이동시키지 않는다. Boss spectator는 승리 시 final safe Pad deck으로 복귀한 뒤 같은 Boarding 경로를 사용한다.

generic Augment loadout은 `PlayerRuntimeFactory`가 만드는 플레이어별 상태로 두어 각자의 선택을 보존한다. `FoundationAugmentState`, `foundation-selection`, `foundationRewards`는 이전 snapshot과 wire 호환을 위한 이름이며 과거 Foundation 3종 gameplay를 뜻하지 않는다. 선택 UI는 행동 클라이언트가 즉시 진행하고 서버가 호환 `foundation-selection` claim을 검증한 뒤 공유한다. 사망·낙사는 대상 Player state의 `respawnAnchorId`가 가리키는 최근 직접 접촉 Stage checkpoint로 되돌리며 선택 카드와 효과는 유지한다. 치명 impact는 부활 결과까지 상태 지문에 포함하고, 서버의 같은 결정적 전이와 다르면 피해자의 최신 상태를 한 번 흡수해 서버 복제본·동료와 수렴한다. impact pending 동안 이전 스냅샷은 로컬 결과를 되돌리지 않는다. 동료 선택 상태는 수정하지 않는다.

기본 Sector Runtime의 공용 landmark 진행과 Player별 checkpoint는 분리한다. 소유 클라이언트가 자기 collider와 save trigger의 겹침을 먼저 적용해 개인 `respawnAnchorId`를 갱신하고 서버가 owner motion·anchor ID·접촉 bounds를 검증해 동료에게 공유한다. 피해·낙사 소유 클라이언트는 치명 결과 전이에서 자기 anchor로 즉시 부활하고 서버·동료가 player-impact 결과를 따른다. WorldSnapshot v12는 top-level 공용 `respawnAnchorId`와 `partyWipeBaseline`을 두지 않고 각 `players[]` state에 개인 anchor와 non-null Action state를 포함하며, 활성 Boss Stage와 content boundary 이력·Hardpoint Jammer target/phase를 공용 상태로 복제한다. 기본 주먹은 별도 cooldown mirror가 아니라 `default-punch` charge/recharge로 수렴하며 enemy 정적 정의는 같은 `worldRevision + objectId`로 복원한다.

이전 Area revision의 체크포인트 도달은 소유 클라이언트가 자기 120Hz 예측 위치에서 먼저 감지한다. 클라이언트는 전이 직전 최신 `owner-motion`을 먼저 보낸 뒤 같은 로컬 `GameSimulation`의 활성 체크포인트·로프 해제와 피드백을 즉시 적용하고, 체크포인트 ID·clientTick·authorityTick·현재 위치만 `checkpoint-claim`으로 보낸다. 이 계약은 compatibility test와 이전 world revision에만 남는다.

현재 저작 시나리오는 영구 Stage cursor나 summit claim을 사용하지 않는다. 서버와 owner prediction의 같은 `GameSimulation`은 authored Gate objective·trigger를 통과한 Player 한 명에게 `gate-portal-entered`를 만들고 다음 authored Entry로 즉시 이동한다. Player별 savepoint 충돌은 owner-first claim으로 수렴하며 마지막 landmark objective 완료는 portal 없는 content boundary를 만든다.

1-4·2-3·3-5 explicit Augment Node 선택은 개인 입력 중립화와 공용 시계 지속 원칙을 사용한다. owner client는 Node 근처에서 공식 `runSeed + stablePlayerId + selectionIndex` offer를 즉시 열고 `augment-offer` claim으로 pending entitlement를 서버에 보존한다. 확정은 호환 `foundation-selection` claim을 사용하지만 의미는 generic Augment다. 서버는 연결 소유권·tick·stable source ID·반경·공식 offer membership·Player별 source 소비를 검증하고 멱등 확정한다. 현재 채널 Player 전원이 source를 소비한 뒤 공유 objective를 한 번 완료하며, 완료 전 퇴장한 Player는 요구 집합에서 제거해 route 교착을 막는다. 완료 뒤 합류 Player도 Node에서 자기 offer를 독립 확정할 수 있지만 열린 route를 다시 잠그지 않는다. 사망·Stage 세이브 포인트 부활·landmark 이동과 전원 사망은 선택·consumed source·공용 objective를 보존하고 순간 Action/Rope window만 초기화한다.

해제 추진·로프 연동·감전 로프 같은 generic Augment 효과는 소유 클라이언트가 Rope/Action 사건에 즉시 적용하고 `owner-motion`, `augment-impact`와 snapshot으로 공유한다. 과거 `Impulse Coil`·`Relay Link`·`Shear Current` ID는 migration 때 현재 카드로 정규화하며 Foundation Shear 전용 claim은 전송하지 않는다.

멀티 서버 fixed tick은 원시 게임 명령에 선택 입력이 포함돼도 보상 선택을 처리하지 않는다. generic Augment 선택의 유일한 서버 전이는 이름을 호환 유지한 `foundation-selection` claim이며, 체력 0을 스캔해 사망·부활을 보조 발생시키지도 않는다. 피해와 사망·부활은 피해 클라이언트의 `player-impact` claim 안에서 함께 확정한다. 싱글은 네트워크 claim 왕복이 없으므로 같은 `GameSimulation` 옵션의 기본값으로 로컬 보상 입력과 체력 복구를 직접 수행한다.

현재 권위 복귀 구현은 사망한 플레이어 한 명의 물리·로프·입력·체력·무기 상태만 자기 active Stage checkpoint에서 초기화한다. 해당 플레이어의 `player-respawned` 사건을 남기며 다른 플레이어와 공용 진행·적·투사체 상태는 유지한다. 같은 tick에 모든 플레이어가 부활해도 공용 상태를 reset하지 않는다.

낙사 경계는 소유 클라이언트가 자기 120Hz 예측 위치에서 먼저 판정한다. 한 플레이어가 경계를 통과하면 fallen `owner-motion`을 즉시 보내고 같은 프레임에 로컬 active Stage checkpoint 부활을 예측한다. 멀티 서버 fixed tick은 지연된 복제 위치만으로 낙사를 시작하지 않으며 claim을 받은 뒤 체력 소진과 같은 `respawnPlayerAtCheckpoint` 호환 메서드로 현재 `respawnAnchorId` 복구와 공유 사건을 한 번 확정한다. 소유자 운동 receipt는 `player-fell`, 공유 사건은 원인 `fall`이 포함된 `player-respawned`를 사용한다. 싱글은 같은 프로세스의 `GameSimulation`이 자동 경계 판정과 복구를 계속 수행한다.

`owner-motion`은 위치·속도 같은 연속 운동과 로프 상태·낙사 경계 보고를 하나의 최신 소유자 상태로 운반한다. 서버는 최신 tick의 물리·로프 상태를 원자적으로 적용하므로 과거 부착 상태가 최신 해제를 되돌리지 못한다. 낙사 경계를 넘은 최신 상태는 위치를 그대로 복제하는 대신 `GameSimulation`의 공용 낙사 복구 전이로 처리하고 `player-fell` receipt를 보낸다. 중복·역순 tick은 성공한 no-op으로 끝나며 별도 rope tick이나 부분 승인 경로를 두지 않는다.

로프 드래그 중 포인터가 브라우저 상단 UI로 나가거나 `pointercancel`, 창 `blur`, 문서 숨김이 발생하면 소유 클라이언트는 이를 해제 의도로 확정한다. `requestAnimationFrame` 재개를 기다리지 않고 해제 snapshot을 로컬 예측에 적용한 뒤, 60Hz 일반 명령 전송 제한을 우회해 해당 명령과 `owner-motion`을 즉시 보낸다. 서버 receipt나 다음 권위 스냅샷을 기다려 로프를 유지해서는 안 된다.

## 플레이어 강체 회전과 손 관절 동기화

각도·각속도와 부착 손 local offset은 입력 주도 플레이어의 소유 상태다. 소유 클라이언트가 로프 joint와 지면 복원 토크를 120Hz 예측에 먼저 적용하며 서버 receipt를 기다려 몸체 회전이나 로프 해제를 시작하지 않는다.

- `owner-motion` protocol v5는 `angle`, `angularVelocity`, 부착 중인 `rope.attachmentOffset`, launcher, owner Action runtime과 개인 `respawnAnchorId`를 위치·속도·anchor와 함께 보낸다. 서버는 인증·프로토콜 형식·유한값·최신 tick을 확인하고, checkpoint 변경은 방문 가능한 Stage의 실제 trigger 겹침일 때만 수용한다.
- `WorldSnapshot` protocol v12의 각 player는 `angle`, `angularVelocity`, `rope.attachmentOffset`, `launcher`(발사 shot/cooldown), `foundationAugment`, non-null `actionState`, `augmentRuntimeState`, `respawnAnchorId`를 포함한다. authored enemy는 `worldRevision + objectId`로 정적 정의를 복원하고 20Hz에는 위치·선속도·collider snapshot·행동·전투 같은 동적 상태만 보낸다. collider snapshot은 circle radius 또는 중심 기준 convex polygon local vertices이며 owner prediction과 서버가 같은 shape를 복원한다. 원격 플레이어 위치와 같은 `ownerMotionTick` 시간축에서 각도는 ±π 경계를 가로지르는 최단 방향으로 보간하고, 스냅샷이 잠시 없을 때는 승인된 각속도로 제한 외삽한다.
- 로프 부착 순간 선택한 손 local offset은 부착이 유지되는 동안 바뀌지 않는다. 공용 rope renderer와 투사체-로프 충돌은 복제된 angle·offset으로 같은 world-space 손 관절점을 계산한다.
- 로컬 수동 해제와 피해 클라이언트의 로프 절단은 각속도를 보존하고 설정된 접선 속도 전달을 즉시 적용한다. 서버에 도착한 최신 detached `owner-motion`은 같은 tick의 위치·속도·각도와 함께 해제를 원자적으로 확정하며, 이후 도착한 과거 tick은 성공한 no-op으로 무시한다.
- `player-impact` protocol v10의 `recovery-required` 전체 상태에는 angle·angularVelocity·attachmentOffset·로프 발사 shot/cooldown·개인 `respawnAnchorId`·`lifeState`와 generic Augment 선택·순간 상태가 포함된다. Boss hazard claim은 Stage·hazard kind·sequence를 추가해 서버의 중립 Boss 상태와 대조한다. 부활 결과 지문에도 회전·부착 손·Augment·checkpoint 상태를 포함하지만, 정상 비치명 impact마다 전체 상태를 별도 전송하지 않는다.
- 실제 두 WebSocket 클라이언트 검증은 0이 아닌 각도·각속도를 소유자에서 서버와 동료 raw snapshot까지 각각 0.001rad·0.001rad/s 이내로 비교하고, 회전된 손 관절점은 0.05px 이내로 비교한다. 지연 표현 계층은 별도 연속 표본에서 각도 보간과 120ms 제한 외삽을 검증하며, 순간적으로 만든 불연속 각도를 최신 raw snapshot과 직접 비교하지 않는다.

## 스냅샷 계약

최소 `WorldSnapshot`은 다음 정보를 가진다.

```text
protocolVersion
snapshotSequence
serverTick
worldSeed
worldRevision
players[]
  id, ownerMotionTick, position, velocity, angle, angularVelocity, isGrounded, health, lifeState
  rope(anchor, attachmentOffset, length, currentLength, tension), weaponCooldown
  control(aimWorld, lastPointer, lastViewport, wasPointerDown, attachBufferRemaining, swingDrag)
  launcher(shot, cooldownRemaining), foundationAugment, augmentRuntimeState
enemies[]
progressKind: sector
players[].respawnAnchorId
worldProgress(objective/route-prerequisite/encounter sets)
foundationRewards
completed
ackSequenceByPlayer
events[]
```

`events`에는 피격, 로프 절단, Augment 선택처럼 한 번만 보여야 하는 사건의 고유 ID가 포함된다. 연결 재전송이나 스냅샷 중복 수신이 같은 효과를 두 번 재생하지 않도록 클라이언트가 최근 이벤트 ID를 기억한다.

서버는 파티클, 타격 VFX, 피해 숫자, 화면 흔들림의 위치 변화나 남은 수명을 계산·전송하지 않는다. 권위 판정 이벤트는 결과·위치·피해량과 `sourcePlayerId`·`targetId`만 제공한다. 각 클라이언트는 같은 피드백 사건 객체의 공용 capability로 월드 링·파티클을 한 번 생성하고, 개인 capability로 현재 viewer가 공격자 또는 피해자인 경우에만 화면 흔들림·피해 강조·로프 절단 경고를 생성한다. owner-predicted one-shot은 prediction/event causal ID로 receipt와 중복되지 않으며, Enemy/Wind의 지속 파티클은 이미 복제되는 attack/behavior/wind state만 관찰한다. Rope lifecycle과 Player motion도 owner의 즉시 predicted Player state와 peer의 owner-motion Player snapshot을 같은 이전→현재 projection으로 관찰한다. 첫 sample은 baseline이고 repeated `ownerMotionTick`은 acceleration burst를 재발화하지 않으며, cut/impact/respawn causal event는 generic detach 효과보다 우선한다. 효과는 로컬 렌더 시간으로 진행·소멸하며 싱글도 같은 사건 객체와 capability 경계를 사용한다. 상세 preset·cap 계약은 [`particle-system.md`](./particle-system.md)다.

투사체처럼 시작 틱, 초기 위치·속도와 결정적 파라미터로 이후 움직임을 계산할 수 있는 객체는 전체 상태를 스냅샷마다 반복하지 않는다. 서버가 고유 이벤트 ID, 객체 ID·종류, 생성 틱, 초기 위치·속도와 반경·피해·소유자 같은 파라미터를 `spawn` 이벤트로 한 번 보낸다. 각 클라이언트는 같은 고정 틱으로 객체를 진행시킨다. 서버 권위 궤적과 클라이언트 예측 궤적은 모두 구체 투사체의 motion capability를 통해 공용 `ProjectileMotion` 적분식을 사용하며, 전송 계층에 별도 이동 공식을 복제하지 않는다. capability 디스패치는 이 공유 운동 구현을 선택할 뿐 생성·피격·claim의 분할 권한을 바꾸지 않는다. 파편, 낙하물 등 같은 성질의 객체도 이 계약을 재사용한다.

플레이어 자동 무기 시스템은 현재 기본 비활성이고 명시적으로 켠 후속 기능·회귀에서만 아래 계약을 사용한다. 활성 상태의 발사는 소유 클라이언트가 같은 `GameSimulation`에서 먼저 생성하고 즉시 표시한다. 발사 위치는 몸 중심이 아니라 조합된 collider가 대상 방향으로 계산한 형상 바깥 점이며, 발사체 반경과 설정된 여유까지 더해 첫 프레임부터 소유자 몸체와 겹치지 않는다. 클라이언트는 소유자와 clientTick으로 만든 `predictionId`, 대상 ID와 이 발사 위치만 `projectile-spawn-claim`으로 보내되, 같은 소켓의 최신 `owner-motion`을 먼저 보낸다. 서버는 비활성 플레이어 claim을 `weapon-disabled`로 거부한다. 활성 플레이어는 연결 소유권, `predictionId` 형식, tick 범위를 검증하고 발사 간격은 소유자의 clientTick 간격(설정 발사 주기 - 2틱 유예)으로 확인한다. 서버 시계의 무기 쿨다운, 서버 상태에서 다시 고른 최근접 대상, 재계산한 발사 위치 오차는 거부 조건이 아니다. 발사 결정은 소유 클라이언트의 예측 시뮬레이션이 만들고 서버는 claim의 사건 자료를 그대로 탄환과 고유 `spawn` 사건의 초기 상태로 적용한다. 같은 claim은 같은 projectile ID가 든 receipt를 반환하고 다시 생성하지 않는다. 클라이언트는 prediction ID에 발사 직전·직후 무기 쿨다운과 tick을 보존한다. 여러 발사가 pending이면 앞 거절은 후속 발사의 현재 쿨다운을 지우지 않고 후속 rollback 기준만 갱신하며, 마지막 거절은 경과 tick을 뺀 최초 준비 상태로 복구한다. 승인 receipt와 정상 스냅샷은 소유자의 로컬 쿨다운을 다시 쓰지 않는다. 멀티 서버 fixed tick은 플레이어 발사를 독립적으로 시작하지 않는다.

자기 탄환 충돌은 공격 클라이언트가 먼저 예측해 타격 VFX를 재생한다. 클라이언트는 `predictionId`, 대상 ID, clientTick과 적중 위치만 hit claim으로 보내며 서버 소유 적 HP나 대미지를 결정하지 않는다. 멀티 서버 fixed tick은 플레이어 투사체의 복제 궤적·대상 소실·8초 수명만 진행하고 적 충돌이나 HP 감소를 자동 시작하지 않는다. 공격 클라이언트에서는 `EnemyHitPrediction` capability가 첫 충돌에서 탄환을 소비하고 화면과 추가 충돌에서 제거한다. 서버는 같은 세션에서 승인한 spawn prediction ID·소유권·대상·tick·중복을 확인하되 서버 복제 탄환이 먼저 만료됐거나 현재 궤적·대상 위치가 다르다는 이유로 적중을 거부하지 않는다. hit claim이 거부돼도 같은 탄환을 겹친 위치에 복구하지 않으며 서버의 대상 소실·수명 종료 resolve가 오면 남은 식별자 대응만 정리한다. 승인 뒤에는 서버 적 HP 스냅샷과 resolve 사건으로 수렴한다.

기본 로프 몸체 공격은 소유 클라이언트가 로프 부착, `620px/s` 이상 속도와 적 겹침의 새 진입을 같은 120Hz 스텝에서 감지해 즉시 `predicted-resolve` 피드백을 만든다. 정상 `rope-impact` claim은 `predictionId`, target ID, client tick, 충돌 위치와 플레이어 속도만 보낸다. 서버는 연결 소유권·tick·prediction ID 중복을 확인하고 claim 속력에 `피해 = 속력 × 0.1`을 적용해 공식 피해를 다시 계산한 뒤 대상 생존/tombstone과 서버 소유 적 HP의 resolve 사건을 한 번 확정한다. 로프 부착·적 위치·접촉 집합은 지연된 서버 복제본으로 재판정하지 않는다. 같은 겹침은 소유 클라이언트 접촉 집합에서 재무장되지 않으며, 같은 prediction ID 재전송도 서버에서 같은 receipt를 반환한다. `충돌 폭발`의 augment-impact v2 claim은 같은 `impactSpeed`로 직접 100%·주변 50% 피해를 검증한다.

자신과 교차한 적 탄환은 피해 클라이언트가 `PlayerImpactPrediction` capability로 로컬 몸체·로프에 먼저 충돌시켜 즉시 피드백과 이동 반응을 적용한다. 본체 피격은 복제 탄환 대미지로 로컬 HP와 치명 시 활성 Stage 세이브 포인트 부활까지 공용 `GameSimulation`에서 실행하고, 멀티 HUD는 이 소유 클라이언트 상태를 표시한다. 정상 impact claim은 `projectileId`, clientTick, `player-hit` 또는 `rope-cut`, 충돌 위치·속도, 관측 대미지, 부활 여부와 결과 상태 지문만 보낸다. 피격 직전 `owner-motion`을 캡처하고 로컬 반응을 적용한 뒤 전송선에서는 캡처한 motion 다음 impact claim 순서를 지킨다.

서버는 인증된 연결과 결정적 projectile ID 중복을 검사하고 같은 `GameSimulation` impact 전이를 임시 적용한다. 결과 지문이 같으면 resolve 사건을 한 번 확정하고 동료에게 공유한다. 다르면 임시 전이를 되돌린 뒤 `accepted: true`, `resolution: recovery-required`와 일회용 `recoveryId`를 보내며, 클라이언트는 그 응답을 받은 시점의 최신 소유자 상태·`stateTick`·새 지문을 한 번 보낸다. 서버는 발급 대기 중인 challenge, 피해자 ID, 단조 tick과 전체 복구 스키마가 모두 맞을 때만 이 상태를 흡수하고 challenge를 소비한 뒤 사건을 확정한다. 복구 대기는 유실된 응답이 세션 메모리에 무한히 남지 않도록 10초 뒤 정리한다. 탄환이 아직 서버에 있으면 서버 탄환 대미지를 사건 기록에 사용하고 제거하며, 이미 만료됐으면 claim의 관측 대미지를 사용한다. 서버 위치·피격 무적·server tick·기존 target ID 차이는 피해자 결과를 취소하는 gameplay 거부 조건이 아니다. 소비한 적 탄환을 다시 표시하거나 같은 충돌을 반복하지 않는다. 중간 입장과 재연결 welcome에는 아직 살아 있는 예측 객체의 원래 생성 이벤트를 같은 이벤트 ID로 다시 제공해 생성 tick부터 복원한다.

착지 피해는 소유 클라이언트의 `PlayerPhysics`가 공중→접지 전이에서 충돌 보정 전 하강 속도를 보존하고 같은 스텝의 `GameSimulation`이 HP·치명 부활·피드백을 먼저 적용한다. 최신 착지 후 `owner-motion` 다음 `fall-damage` impact claim은 impact ID, client tick, 착지 위치·충돌 전 속도, 계산 피해, 부활 여부와 결과 지문만 보낸다. 서버는 같은 `FallDamage` 규칙으로 피해를 다시 계산하고 다른 피해량을 거부하며, 정상 지문이 다를 때만 기존 impact recovery challenge를 사용한다. 승인 receipt와 snapshot은 소유자의 착지 HP나 부활을 되감지 않는다.

v9는 측정된 대역폭의 대부분을 차지하던 authored enemy의 정적 필드를 제거하고 `worldRevision + objectId`로 복원한다. 플레이어·enemy 동적 상태는 아직 20Hz 전체 목록으로 보내며 delta나 관심 영역은 사용하지 않는다. 이후 메시지 크기나 head-of-line 지연이 다시 문제가 되면 동일한 논리 계약을 유지한 채 동적 delta·관심 영역 또는 채널 전환을 검토한다.

0.43.4부터 클라이언트 예측은 같은 stable Enemy ID의 snapshot을 받을 때 runtime·collider·behavior/FSM을 다시 만들지 않고 기존 객체에 동적 상태를 restore한다. 누락 ID는 despawn하고 새 ID 또는 `objectId/enemyType` 변경만 새 runtime을 만든다. history snapshot은 push 시 collection별 ID index를 가지므로 Enemy 위치 보간이 history마다 배열 `find()`를 반복하지 않는다. 한 120Hz client fixed update는 remote sample을 한 번만 계산하고 그 step의 chooser·collision·audio·camera에 재사용하며 render는 자기 시점의 sample을 별도로 계산한다. 이 변경은 20Hz wire 목록, server tick/ownerMotionTick 시간축, 100ms interpolation, 120ms 제한 외삽과 owner-first 권위를 유지한다.

`WorldSnapshotEnvelope`가 스냅샷 순서, 서버 틱, 월드 식별자, 플레이어별 승인 번호, 비예측 상태와 권위 이벤트를 하나의 전송 단위로 묶는다. `serverTick`은 중립 월드 시뮬레이션 시간을 뜻하고 각 플레이어의 `ownerMotionTick`은 그 물리·로프 상태를 만든 마지막 승인 소유자 tick을 뜻한다. `snapshotSequence`는 같은 server tick에 참가·퇴장·claim 확정으로 다시 만들어진 봉투까지 구분한다. 클라이언트는 sequence가 새롭고 serverTick이 같거나 증가한 봉투를 수용해야 한다. 투사체·낙하물처럼 예측 가능한 객체 배열을 `state`에 넣으면 계약 검증이 실패하며 반드시 생성·종료 이벤트를 사용해야 한다. 이벤트는 틱과 ID 순으로 정규화하고 한 봉투 안의 중복 ID를 거부한다.

Player Bark는 gameplay/network 사건이 아니라 각 클라이언트의 local presentation이다. 1-1/1-2의 Bark는 local `DirectionRuntime`이 같은 Beat의 System Text duration 뒤 message command로 queue에 넣고 local Player 머리 위에서 타이핑하며 WorldSnapshot·owner-motion·claim·동료 UI에 포함하지 않는다. 공용 message envelope는 글자 표시 속도와 future `party-chat/party` audience를 표현할 수 있지만, 실제 party message는 별도 인증 transport와 protocol 결정 전에는 활성화하지 않는다. 향후 transport도 완성된 text·speaker·속도만 전달하고 애니메이션 프레임은 수신 클라이언트가 계산한다. local Bark를 미리 server event로 승격하거나 System Story로 위장하지 않는다.

0.45.0부터 1-1/1-2 Direction command는 `scope/authority`를 compile 때 검증한다. Camera·Story·Bark·Audio·Lighting·Character는 각 클라이언트의 local `DirectionRuntime`이 즉시 실행하며 wire에 animation frame을 넣지 않는다. Player command는 `owner-player/owner`, Enemy·Collision·Objective·Gate command는 `shared-world/server` 계약만 허용한다. 첫 migration에는 gameplay mutation command를 실제 Stage에 넣지 않았으며 향후 구현도 기존 owner-first/server-neutral 사건 규칙을 우회하지 않고 해당 domain adapter로 전달한다.

`GameSimulation`은 처리한 스텝마다 단조 증가하는 `tick`을 기록한다. 명시적으로 활성화한 싱글 자동 무기 발사, 멀티에서 승인된 플레이어 발사 claim, 서버 중립 발사와 투사체 종료는 이 틱의 `PredictableObjectEvent`를 발행하며, 권위 전송 계층은 `drainReplicationEvents()`로 각 사건을 한 번만 가져간다. 플레이어·적 투사체는 8초의 서버 수명이 끝나면 `expired` resolve로 제거한다. 활성 투사체는 원래 spawn 이벤트를 내부에 보존해 welcome 복원에만 재사용하며 일반 스냅샷마다 반복하지 않는다. 로컬 렌더링은 기존 투사체 배열을 계속 사용하지만 네트워크 상태에는 그 배열을 넣지 않는다.

`AuthoritySnapshotBuilder`는 `GameSimulation`의 로컬 렌더 상태를 그대로 복제하지 않는다. 플레이어별 물리·로프·생명·무기·generic Augment, enemy 동적 상태와 월드 진행만 뽑고, 정적 지형과 authored enemy 정적 정의 대신 `worldSeed`, `worldRevision`과 stable `objectId`를 보낸다. 클라이언트는 이 값으로 월드와 enemy 정의를 재생성하며 revision이 다르면 세션 참가를 중단한다.

## 예측과 보정

이벤트의 즉시 체감과 지속 상태 수렴은 서로 다른 전송 계약이다. `spawn`·`resolve`·피격 claim 같은 사건은 한 번 발생한 사실을 공유하고, 플레이어·로프·적·월드 진행 같은 지속 상태는 객체의 권한 원점으로 계속 수렴한다.

| 상태군                              | 지속 상태 수렴 원점                                 | 소유 클라이언트                                                          | 다른 클라이언트 표시                                                  | 복구 정책                                                              |
| ----------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 위치·속도·접지·로프                 | 인증·형식 검사를 통과한 최신 `owner-motion`         | 즉시 예측하며 snapshot·receipt로 되감지 않음                             | 위치는 보간·제한 외삽, 로프는 최신값                                  | 운동 상태 복원 없음; 중복·역순 tick은 성공한 no-op                     |
| HP·생명·부활·로프 절단              | 피해 클라이언트의 impact 결과                       | 피해 HP·치명 부활·절단을 즉시 적용하고 snapshot·receipt로 다시 쓰지 않음 | 정상은 사건을 적용하고, 지문 불일치 때만 받은 피해자 상태를 즉시 적용 | `recovery-required` 뒤 피해자의 최신 상태를 서버가 흡수                |
| 무기 파라미터·Augment 선택          | 검증된 협동 공유 진행                               | 선택 UI는 즉시 반영하고 pending 동안 이전 진행으로 덮지 않음             | 최신 검증 공유값 즉시 적용                                            | 거부 claim의 로컬 전이만 복구                                          |
| 로프 발사 shot/cooldown             | 행동 클라이언트의 로컬 결과와 owner-motion          | 발사·비행·부착을 즉시 진행하고 정상 snapshot으로 되감지 않음             | 검증된 최신 공유값 즉시 적용                                          | 포탈·사망·절단 리셋은 shot을 결정적으로 clear                          |
| 자동 무기 쿨다운                    | 소유 클라이언트의 발사 시뮬레이션                   | 발사와 동시에 진행하고 정상 snapshot으로 쿨다운을 다시 쓰지 않음         | 검증된 발사 사건을 각 클라이언트에서 재생                             | 후속 pending 쿨다운 유지·baseline 교정, 마지막 거절은 최초 준비값 복구 |
| authored Stage Gate 포탈의 소유자 운동 | 행동 Player의 `gate-portal-entered` 사건 | authored trigger 통과 즉시 target Entry 적용 | 포탈 전후 표본을 보간하지 않음 | 같은 gate/tick 중복만 제거하고 다른 Player는 이동시키지 않음 |
| 적·적 HP·공용 진행                  | 서버 fixed tick·claim 확정 snapshot                 | 권위 결과 사용                                                           | 위치 보간·제한 외삽, 비위치 상태 최신값                               | 클라이언트 예측을 권위 결과로 취소·복구                                |

- 플레이어·로프 같은 `InputDrivenObject`는 소유 클라이언트의 즉시 시뮬레이션이 원점이다. 클라이언트가 `owner-motion`으로 현재 tick·위치·속도·각도·접지·로프 상태를 보내면 서버는 인증·프로토콜 형식·유한값과 세션 tick 범위를 통과한 최신 상태를 공용 `GameSimulation` 명령에 적용하고 receipt를 돌려준다. 속도·각속도·이동 거리·로프 offset의 크기나 authored alias는 네트워크 거부 조건이 아니다. 양쪽이 같은 공용 규칙으로 수행하는 각도 정규화·각속도 clamp 같은 도메인 물리 처리는 유지한다. 중복·역순·세션 범위 밖 tick과 완료된 런의 후속 상태는 성공한 no-op이며 `ownerMotionTick`이나 새 위치 표본을 만들지 않는다. 서버와 다른 클라이언트는 이 최신 소유자 상태를 따라간다.
- 정상 승인 중인 소유 클라이언트는 20Hz 서버 지연 위치뿐 아니라 HP·피격 무적·생명 상태·로프 절단·무기 쿨다운·시간 제한 강화도 서버 스냅샷 값으로 다시 쓰지 않는다. generic Augment 선택처럼 협동 전체가 알아야 하는 공유 진행 결과만 흡수하며, 소유자의 직접 체감 상태와 authored Gate portal은 로컬 `GameSimulation`이 먼저 작성한다.
- `owner-motion` receipt는 소유자의 물리·로프·제어 상태를 복원하거나 미확정 입력 재실행을 시작하지 않는다. 최신 상태는 서버 복제본과 동료가 흡수하고, 중복·역순 또는 런 완료 뒤 상태는 성공한 no-op으로 끝낸다. authored Gate portal은 별도 `gate-portal-entered` causal event와 portal tick으로 수렴하며 일반 owner-motion이 포탈 이전 위치를 되살리지 않는다. impact `recovery-required`는 반대 방향 복구로 피해 클라이언트의 최신 상태를 서버가 흡수한다.
- 적과 공용 월드 같은 `SimulationDrivenObject`는 서버 스냅샷이 원점이다. 동료와 적은 두 표본 사이를 보간하고 표본 공백만 최대 120ms 외삽한 뒤 다음 스냅샷에서 서버 궤도로 돌아온다.

`OwnerPredictionRuntime`은 별도 간이 물리를 만들지 않는다. 최초 입장 때 최신 공유 스냅샷을 로컬 예측용 `GameSimulation`의 공개 소유자 복원 명령에 전달하고 남은 입력을 고정 1/120초로 재실행한다. 이후 정상 스냅샷과 `owner-motion` receipt는 서버 상태를 소유자 복구 명령으로 사용하지 않고, 검증된 공유 진행만 `applySharedOwnerProgress()`로 흡수한다. authored Gate를 통과하면 같은 `GameSimulation`이 target Entry portal을 즉시 적용하고 `confirmPortalTransition()`이 같은 gate event만 멱등 확인한다. 런타임은 Player 객체·배열·tick을 직접 수정하지 않는다.

멀티 조작감은 **로컬 입력 시뮬레이션 + 원격 데드 레코닝**을 사용한다. 입력 시뮬레이션은 자기 캐릭터가 네트워크 프레임 사이에서 멈추지 않게 하며, 데드 레코닝은 동료 캐릭터를 최신 위치·속도로 짧게 외삽한 뒤 새 검증 공유 상태와 오차를 보정한다. 두 기능 모두 별도 간이 게임 규칙을 만들지 않고 공용 `GameSimulation`과 스냅샷 물리 상태를 사용한다.

HP 감소, 로프 절단, 사망·Stage 세이브 포인트 부활, Sector reset, Augment 선택과 런 완료는 시각적 보간 대상이 아니다. 당사자 클라이언트는 로컬 결과를 즉시 확정해 계속 사용하고, 서버는 claim을 검증·중복 제거해 다른 클라이언트에 공유한다. impact의 `recovery-required`는 전체 상태를 항상 보내라는 신호가 아니라 해당 사건의 서버 복제 결과가 어긋난 경우에만 최신 피해자 상태를 요청하는 성공 receipt다. 승인 receipt와 resolve 사건은 소유자의 로컬 결과를 서버 값으로 교체하는 신호가 아니라 복제본이 같은 사건을 받아들였다는 확인이다.

## 연결과 복구

- 입장 시 서버가 `playerId`, `worldSeed`, 현재 전체 스냅샷과 시작 틱을 제공한다.
- 연결이 끊기면 클라이언트는 오프라인 진행을 확정하지 않고 게임을 멈춘 뒤 모드 메뉴로 돌아간다. 마지막 4자리 채널 번호를 참가 입력란에 보존해 사용자가 명시적으로 다시 참가할 수 있게 한다.
- 동료가 남아 채널 월드가 유지된 경우 재참가는 새 플레이어 연결로 처리하며 현재 전체 스냅샷부터 시작하고 이전 연결의 미승인 입력은 폐기한다. 플레이어별 런타임을 이어받는 자동 세션 복원은 초기 프로토타입 범위가 아니다.
- 마지막 접속자가 나가 0명이 되면 기존 결정대로 채널 월드를 즉시 삭제하므로 해당 번호로 재참가할 수 없다. 새 채널을 만들어 새 월드에서 시작한다.
- 서버 프로세스 종료 시 해당 협동 세션은 종료한다. 초기 프로토타입에서는 호스트 이전을 지원하지 않는다.
- 싱글 저장과 영구 성장 정책은 런타임 동기화와 별도 결정으로 남긴다.

## 구현 경계

```text
GameApp
  └─ Authority 인터페이스
      ├─ LocalAuthority ────────── GameSimulation
      └─ RemoteGameAuthority ──── WebSocket ── MultiplayerGameServer ── AuthorityServerSession ── GameSimulation
```

두 권한 구현은 다음 의미를 공유한다.

- 로컬 권한은 `step(dt, command)`으로 입력 제출과 인프로세스 시간 진행을 함께 수행한다.
- 원격 권한은 `submit(command)`으로 입력 의도만 보내고 서버 시계를 직접 진행하지 않는다.
- 두 권한의 `snapshot()`은 Canvas 실행 경로가 읽을 현재 상태를 제공한다.

`AuthorityServerSession`은 실제 소켓과 분리된 서버 실행 경계다. 인증된 연결의 플레이어 ID와 제출 명령의 ID가 다르면 배치 전체를 거부하고, `AuthorityCommandInbox`에서 다음 틱 명령을 소비해 승인 번호를 전진시킨다. 같은 `GameSimulation.stepCommandBatch()`를 120Hz로 실행하되 입력 주도 객체 단계는 끄고 중립 월드와 플레이어 타이머만 진행한다. 플레이어 물리·로프는 별도 `owner-motion` 복제 경계에서 최신 소유자 상태로만 바뀐다. 6틱마다 `AuthoritySnapshotBuilder`를 호출해 20Hz 스냅샷, 플레이어별 명령 승인 번호와 `ownerMotionTick`을 만들며, 소켓 구현은 이 세션의 공개 경계만 호출한다.

서버는 현재 `serverTick` 이하를 목표로 한 늦은 명령을 `elapsed-tick`으로 거부하고 승인 sequence를 갱신하지 않는다. 초기 프로토타입은 서버 롤백을 하지 않으므로, 실행할 수 없는 입력을 ACK해 클라이언트가 재적용 목록에서 제거하는 거짓 수렴을 허용하지 않는다.

각 명령 제출 응답은 `CommandReceipt`로 serverTick·targetTick과 승인·거부된 playerId·sequence만 돌려준다. 명령 본문은 반사하지 않는다. 승인된 입력은 권위 스냅샷 ACK까지 예측 큐에 남고, 명시적으로 거부된 자기 입력만 receipt 수신 즉시 제거한다. 같은 receipt를 다시 받아도 이미 제거된 sequence에는 영향이 없다.

원격 클라이언트는 명령 sequence별 전송 시각과 receipt 수신 시각으로 왕복 시간을 측정하고, 연속 스냅샷의 수신 간격과 명령·`owner-motion` 승인 누계를 함께 보관한다. 구버전·프로토콜 이상 진단을 위한 `owner-motion` 거부 누계는 호환 지표로 남기되 receipt가 소유자 복원이나 재시뮬레이션을 시작하지 않는다. 보정 거리와 hard-snap 누계는 legacy Area checkpoint rollback 진단을 위해 남아 있으며 정상 Sector owner snapshot에서는 증가하지 않아야 한다. 원격 상태 버퍼는 현재·최대 외삽 시간을, 예측 투사체 저장소는 권위 해결 선행이나 claim 거부로 로컬 예측을 취소하거나 재무장한 횟수를 제공한다. 활성 시간·체크포인트·처치·피해·로프 절단·패배·첫 Augment 선택 같은 런 지표는 예측 시뮬레이션에서 추정하지 않고 권위 서버의 `RunMetrics`를 전체 스냅샷에 포함한다. 기존 지표 필드명이 Foundation을 포함해도 의미는 generic Augment 최초 선택이다. 이 값은 게임 규칙이나 물리 보정값을 자동 변경하지 않으며 설정 버튼 길게 누르기로 여는 디버그 수치 패널에서만 확인한다.

RTT 표본을 만들기 위한 sequence별 송신 시각은 receipt 수신 시 제거하고, receipt가 손실된 기록은 이후 권위 snapshot의 승인 sequence 이하를 정리한다. ACK도 장시간 도착하지 않는 경우를 위해 송신 순서 기준 최근 2,048개만 유지한다. 이 상한은 계측 메모리만 제한하며 명령 재적용 큐나 서버 승인 규칙을 바꾸지 않는다.

멀티 메인 회귀 시나리오는 실제 WebSocket 연결을 감싼 테스트 전용 경계에서 왕복 지연을 양방향에 절반씩 적용하고 송신 명령 손실을 결정적으로 재현한다. 왕복 지연 0/50/100/200ms와 손실 0/2/5%의 12개 조합마다 클라이언트 두 개를 같은 방에 연결한다. 로컬 입력이 서버 왕복 전에 반응하고 일부 명령이 사라져도 소유 플레이어가 계속 전진하는지 먼저 확인한 뒤, 양쪽이 중립 입력을 계속 제출해 서버 복제본·동료 표시 위치가 소유 클라이언트 상태에 4px, 속도 20px/s 이내로 수렴하고 로프 부착 상태가 일치하는지 확인한다. HP·생명·무기·generic Augment 같은 플레이어 상태는 서버 복제본과 동료가 소유자의 승인 상태를 따르고, 체크포인트·런·중립 월드는 모든 클라이언트가 서버 공유 상태를 따라야 한다. 운영체제의 DNS·프록시·방화벽·네트워크 어댑터는 변경하지 않는다.

`AuthorityWireAdapter`는 실제 WebSocket 앞의 유일한 게임 전송 경계다. 인증된 playerId와 직렬화된 command batch 문자열을 받아 receipt 문자열을 반환하고, 권위 세션의 120Hz 틱을 진행해 20Hz 예정 시점에만 snapshot 문자열을 반환한다. 소켓 런타임은 JSON 내부 게임 객체를 직접 읽거나 변경하지 않는다.

`npm run start:multiplayer`는 개발 환경에서 정적 게임과 `/multiplayer` WebSocket을 같은 localhost 포트에서 연다. 서버 프로세스는 여러 4자리 채널을 동시에 소유하고 각 채널마다 새 32비트 시드의 독립된 `GameSimulation`, 명령 큐, 120Hz 시계와 최대 2명의 연결을 둔다. 클라이언트 예측은 welcome snapshot의 서버 시드로 동일한 지형을 생성한다. 한 명이 나가면 해당 플레이어만 제거하고 남은 유저는 같은 채널 월드의 적·체크포인트·진행 틱을 이어간다. 접속자가 0명이 되는 순간 해당 채널과 월드를 폐기하며, 다음 새 채널은 새 시드의 절차 생성 월드를 만든다.

브라우저 첫 화면은 싱글과 멀티를 선택한다. GitHub Pages의 `index.html`에 있는 `meta[name="multiplayer-server"]`가 항상 실행 중인 게임 서버의 HTTPS/WSS 주소를 제공하고, 클라이언트는 이를 `/multiplayer?channel=...`로 정규화한다. 서버 주소는 배포 설정이며 플레이어가 입력하지 않는다. 방장은 **새 채널 만들기**로 4자리 번호를 받고, 참가자는 모바일 숫자 키패드로 그 번호만 입력한다.

모드 메뉴는 같은 서버의 공개 `/health`를 시작 시점과 메뉴 대기 중 5초 간격으로 확인한다. 응답이 없거나 `status: "ok"`가 아니면 **멀티 플레이** 버튼과 채널 입력 경로만 비활성화하고 이유를 표시하며, 싱글 플레이는 계속 사용할 수 있다. 서버가 다시 정상 응답하면 페이지를 새로고침하지 않아도 버튼을 다시 활성화한다. 개발 통합 서버와 운영 game-only 서버는 같은 health 계약을 제공하고, health 응답은 연결 복구나 세션 권위 판정에 사용하지 않는다.

`npm run share:multiplayer`는 상시 서버를 대신하는 운영 경로가 아니라 개발 중 외부 연결을 확인하는 임시 도구다. 운영 Pages는 고정 게임 서버를 사용하며 Quick Tunnel 주소를 플레이어에게 입력시키지 않는다. 상세 실행 경계는 `multiplayer-sharing.md`를 따른다.

`RemoteCommandStream`은 로컬 플레이어 한 명의 목표 틱과 단조 증가 sequence를 만들고, 서버가 승인하기 전의 명령 배치를 보존한다. 새 스냅샷의 플레이어별 ACK까지만 대기열에서 제거하며, 이미 적용한 `snapshotSequence` 이하의 중복 봉투와 `serverTick`이 후퇴한 봉투를 무시한다. 같은 serverTick이라도 sequence가 새로우면 참가·퇴장·claim 공유 상태와 사건을 반영한다. 이 대기열은 최초 입장·재접속과 impact recovery에서 미확정 입력을 재실행하는 원본이며, `owner-motion` receipt나 정상 스냅샷으로 소유자 예측을 다시 시작하지 않는다. 소켓과 물리 구현도 직접 소유하지 않는다.

`MultiplayerGameServer`의 snapshot 전송 창은 위 수렴 규칙 앞단의 흐름 제어다. 몹 HP처럼 서버가 소유하는 최신 지속 상태는 ACK 창이 열릴 때 가장 최근 값으로 건너뛰고, 탄환 생성·적중·해결 사건은 합쳐진 봉투에서도 빠지지 않는다. 따라서 느린 수신자가 과거 위치와 HP snapshot을 계속 재생해 겉보기 되감김을 만들지 않으며, 기존 `RemoteWorldStateBuffer`와 `OwnerPredictionRuntime`의 권한별 수렴 원점은 바꾸지 않는다.

`RemoteWorldStateBuffer`는 최대 8개 공유 스냅샷을 보관하고 추정 서버 현재보다 100ms 과거의 목표 tick을 계산한다. 같은 serverTick의 새 sequence는 시간 표본을 중복 추가하지 않고 해당 tick의 최신 표본으로 교체하며 새 사건은 별도 대기열에 추가한다. 추정 서버 시계는 첫 표본에 고정하지 않고 serverTick이 전진한 스냅샷마다 최신 오차의 12.5%를 흡수하되 한 번의 지연 스파이크가 시간축을 크게 꺾지 않도록 보정량을 50ms로 제한한다. 동료와 적 위치는 목표 tick 앞뒤의 두 표본 사이에서 보간하고, 패킷 공백으로 목표가 최신 표본을 넘을 때만 최대 120ms 외삽한다. Enemy snapshot은 actor collision 직후 선속도를 함께 보내 외삽과 Player 소유 충돌 응답이 같은 중립 운동 표본을 사용한다. 원격 플레이어 HP·`lifeState`·로프 부착과 중립 Sector 진행·런 상태는 최신 검증 공유값을 사용한다. 자기 소유 객체는 `OwnerPredictionRuntime`이 담당하며 이 버퍼의 일반 위치·HP·생명·로프 값을 적용하지 않는다. 새로 생성되거나 제거된 엔티티는 최신 목록을 따르고 스냅샷 사건은 별도 대기열에서 정확히 한 번만 drain한다.

연결 완료 뒤 받은 권위 메시지를 역직렬화하거나 적용하지 못하면 그 세션은 더 이상 수렴할 수 없는 상태다. `RemoteGameAuthority`는 마지막 정상 스냅샷을 계속 렌더링하지 않고 구체적인 처리 오류를 `closeReason`에 보존한 뒤 소켓을 프로토콜 오류로 닫는다. 앱은 기존 연결 종료 경계로 메뉴에 돌아가며 자동 오프라인 진행이나 묵시적 재접속을 시작하지 않는다.

사건 중복 제거는 한 스냅샷 안에만 한정하지 않는다. 클라이언트 버퍼가 최근 2,048개 `eventId`를 수신 순서로 기억하고, 재전송 스냅샷에 같은 ID가 포함되어도 효과 대기열에 다시 넣지 않는다. 한도를 넘긴 가장 오래된 ID부터 퇴출해 장기 세션의 메모리 사용을 제한한다.

최초 입장·재접속에서 자기 플레이어를 공유 상태로 다시 시작할 때 점프 가능 여부와 로프 제약을 추측하지 않도록 플레이어별 `isGrounded`와 로프의 `length`, `currentLength`를 스냅샷에 포함한다. 정상 스냅샷과 `owner-motion` receipt는 이 값으로 소유자 물리를 다시 쓰지 않는다.

로프 입력은 누르는 순간과 해제 전이, 짧은 부착 버퍼, 부착당 한 번인 스윙 드래그 진행에 상태가 있다. 자기 플레이어 재적용은 승인 틱의 `aimWorld`, 마지막 pointer·viewport, `wasPointerDown`, `attachBufferRemaining`, `swingDrag`에서 시작한다. `attachmentCandidate`는 정적 월드와 aim으로 다시 계산하며 전송하지 않는다.

`PredictableProjectileStore`는 최근 이벤트를 명시적으로 drain해 `spawn`을 투사체 팩토리에 전달하고 `resolve`에서 제거한다. 저장소는 객체 등록·prediction ID와 authority ID 대응·사건 전달만 소유하며 투사체 종류를 보고 운동·충돌 정책을 분기하지 않는다. 늦게 받은 생성 이벤트는 현재 serverTick과 생성 tick의 차이만큼 먼저 진행한다. 적·플레이어 투사체는 Player·Enemy와 같은 공통 `PhysicsMixin` 및 단일 `projectile-motion` capability를 사용하고 lifetime과 Homing steering만 선택 mixin으로 조합한다. 클라이언트 충돌은 같은 `client-projectile-collision` ID의 서로 다른 믹스인을 사용한다. 서버와 클라이언트는 동일 초기 상태·tick의 위치와 속도가 정확히 일치하는 진단으로 잠근다. claim 대기 객체의 표시와 재충돌 가능 여부도 객체 수명주기가 결정한다. 자기 탄환과 피해 클라이언트가 충돌 처리한 적 탄환은 첫 적중으로 소비되며 receipt 거절로 되살리지 않는다. 투사체 매 틱 좌표 배열은 스냅샷에 추가하지 않는다.

- `snapshot()`은 화면이 읽을 소유자 로컬 상태와 원격·중립 공유 상태를 구분해 반환한다.
- 연결 상태와 네트워크 지표는 게임 규칙 스냅샷과 분리한다.

실제 소켓은 `ws` 기반 Node 권위 서버와 브라우저 WebSocket 클라이언트로 연결됐다. GitHub Pages는 정적 화면만 제공하고 별도로 항상 실행되는 게임 서버에 연결한다. 운영 서버는 `BAESEONGJIN_ALLOWED_ORIGINS=https://openbaeseongjin.github.io`처럼 허용 Origin을 제한하며, 4자리 채널 번호는 접속 편의 수단이지 인증 정보로 취급하지 않는다.

## 증강 선택·피해 동기화

- offer는 owner와 서버가 `runSeed + stablePlayerId + selectionIndex`로 독립 재계산한다. `augment-offer`는 pending source와 같은 세 장을 재접속 snapshot에 남기고, 확정 claim은 membership과 source 1회 소비를 검증한다.
- Rope·Action 피해와 넉백은 공격 owner가 먼저 시뮬레이션한다. 서버 fixed tick은 지연된 owner 위치로 같은 충돌을 다시 만들지 않는다.
- `augment-impact`는 event ID, tick, source/target/effect, 접촉 위치, 공식 damage와 선택적 movement intent만 보낸다. 서버는 source card 보유와 수치 공식을 다시 계산한다.
- live enemy는 `blocksImpactFrom`을 먼저 호출하고, lethal event의 own knockback을 적용하지 않는다. Boss displacement 면역은 public reaction에서 처리한다.
- 같은 event ID는 같은 receipt를 반환한다. known tombstone은 accepted `target-already-dead` silent no-op, never-known ID는 rejected `target-missing`이다.
- owner가 이미 시작한 Action·피해·전기·반사 VFX는 정상 receipt와 resolve 사건 때문에 다시 재생하거나 되감지 않는다.

## 구현 순서와 검증 기준

1. [완료] `GameSimulation`이 플레이어별 명령 배치를 같은 권위 틱에 적용한다.
2. [완료] `WorldSnapshot`과 승인 번호의 직렬화·역직렬화 계약을 검증한다.
3. [완료] 지연·중복·순서 뒤바뀜을 흉내 내는 전송 테스트를 유지한다.
4. [완료] 원격 클라이언트의 예측·재적용·보정과 투사체 이벤트 재생을 테스트한다.
5. [완료] 실제 2인 WebSocket에서 입력 종료 뒤 소유자·서버·동료의 위치·속도·로프 상태 수렴을 테스트한다.
6. [완료] 장시간 로컬 수신 시계 드리프트에서도 최신 표본이 계속 오면 원격 시간축이 지속 외삽으로 밀리지 않는지 테스트한다.
7. [완료] Node 권위 서버와 실제 WebSocket 클라이언트 두 개를 같은 오픈월드에 연결한다.
8. [완료] impact 전체 상태는 서버가 먼저 발급한 일회용 challenge 뒤에만 받고, 복구 상태와 `stateTick`을 원자적으로 수용하며 실제 복원 필드 전체의 wire schema를 검증한다.
9. [필요] 서로 다른 실제 기기 두 대에서 로프 절단, 사망·낙사·개별 Stage 세이브 포인트 부활과 전원 사망 공용 진행 보존을 장시간 검증한다.

완료 증거는 단순 접속 성공이 아니다. 플레이어 상태는 소유 클라이언트가 만든 승인 상태로 서버 복제본과 동료 클라이언트가 수렴하고, 중립 월드 상태는 서버가 만든 상태로 모든 클라이언트가 수렴해야 한다. 지연과 패킷 순서 변경 뒤에도 이 두 권한 원점이 뒤바뀌지 않아야 한다.
