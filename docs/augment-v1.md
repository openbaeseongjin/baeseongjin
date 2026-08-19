# 증강 v1

이 문서는 0.26.0 증강 Runtime과 0.28.0 획득 topology의 제품·수치·멀티플레이 기준이다. 과거 Foundation 3종과 Foundation별 Specialization은 이 계약으로 대체되며, 호환 ID는 이전 snapshot을 한 번 읽는 migration 입력으로만 사용한다.

`impulse-coil`, `relay-link`, `shear-current`는 각각 현재 카드로 정규화하는 legacy ID다. Foundation Shear 전용 network claim과 `foundation-shear-hit` 판정은 현행 계약이 아니며, 감전 로프를 포함한 Rope·Action 피해는 모두 generic `augment-impact` 경계를 사용한다. Stage 문서의 옛 Profile·Shear 문구는 authored history이지 현재 Runtime 구현 지시가 아니다.

## 제품 의도

- 증강은 Rope 중심 플레이스타일을 Run마다 다르게 조합해 반복 플레이 폭을 만든다.
- 기본 Rope와 기본 펀치만으로도 필수 진행과 Boss를 완주할 수 있어야 한다.
- 특정 카드나 파티 조합을 필수 geometry·Boss 해법으로 요구하지 않는다.
- Player별 최대 6장, Runtime에 연결된 각 Sector의 명시적 장비 Node에서 한 번의 logical entitlement를 사용한다.
- Sector 01~~03의 획득 위치는 아래 명시적 source로 고정한다. Sector 04~~06 source, Timer `+10` trigger와 Purge origin/rejoin은 별도 topology 결정 전까지 HOLD다.

## 선택 계약

- offer는 `runSeed + stablePlayerId + selectionIndex(0..5)`로 결정한다.
- 현재 선택과 호환되는 서로 다른 카드 3장을 제시한다.
- reroll, rarity, category quota는 없다.
- 선택한 카드만 개인 Pool에서 제거되고, 선택하지 않은 카드는 다음 offer에 다시 나올 수 있다.
- 다른 Player가 같은 카드를 고르는 것은 허용한다.
- 기본 Action을 고르면 다른 기본 Action 5장은 제거한다.
- Signature는 현재 기본 Action과 호환되는 한 장만 허용한다.
- 선택 중인 Player의 gameplay 입력만 chooser가 가져가고 월드·적·투사체·동료는 계속 진행한다. 별도 무적은 없다.
- chooser를 연 프레임의 입력은 선택이나 확정에 재사용하지 않는다. 이후 좌우와 확정은 각자 자기 입력이 한 번 중립으로 돌아온 뒤 독립적으로 edge를 받으므로, 점프/위 확정을 계속 누르고 있어도 좌우는 해제 후 이동하고 좌우를 계속 누르고 있어도 확정은 해제 후 선택할 수 있다. hold는 매 frame 반복 이동·확정을 만들지 않는다.
- pending offer, 선택 index, 획득 카드와 source 소비 상태는 사망·부활·재접속 뒤에도 보존한다.
- authored `augment-node`만 명시적 source adapter다. `legacyStageAlias`, landmark 순서나 추정 좌표로 새 획득 지점을 자동 생성하지 않는다.

### 디버그 테스트 loadout

- 설정 버튼을 1초 길게 눌러 여는 디버그 탭은 카드 grid 대신 기존 시작 맵과 같은 리스트형 select 6개를 사용한다. 각 항목은 Catalog의 한국어 이름과 family를 표시하며 선택 순서를 그대로 저장한다.
- 저장·적용은 정식 Catalog ID와 호환성 함수를 사용한다. 최대 6장, 중복 금지, 기본 Action 한 장, 선택 Action과 일치하는 Signature, Action 뒤 modifier 순서를 만족하지 않으면 문구와 disabled 상태로 차단한다. 이전 `baeseongjin.debug-settings.v1` 값에 loadout이 없으면 빈 목록으로 읽는다.
- 싱글의 `적용`은 현재 Run을 hot-swap하지 않고 저장된 시작 맵·Rope tuning·debug loadout으로 새 Run을 만든다. 선택한 Rope·Action·Signature·modifier는 Player snapshot과 실제 Runtime에 즉시 반영된다.
- debug loadout은 authored 획득을 미리 완료하지 않는다. 해당 Run에서 Player가 실제 `augment-node`에 상호작용하면 두 번째 offer를 열지 않고 그 source만 개인 소비한 뒤 기존 roster 기반 objective/route 완료 경로를 사용한다. 아직 만나지 않은 Node를 미리 열거나 다른 source를 소비하지 않는다.
- 멀티는 공유 설정·서버 검증 protocol이 없으므로 loadout select와 적용을 비활성화한다. 새 network message나 snapshot field를 추가하지 않으며 기본 Run의 결정적 offer 공식은 바꾸지 않는다.

## Runtime 획득 topology

| 순서 | Sector / Landmark       | Stable source ID                         | 역할                                                                |
| ---: | ----------------------- | ---------------------------------------- | ------------------------------------------------------------------- |
|    1 | Sector 01 / landmark 04 | `sector-01-04:maintenance-node`          | 첫 generic 3장 offer                                                |
|    2 | Sector 02 / landmark 03 | `sector-02-03:specialization-node`       | 두 번째 generic 3장 offer. snapshot 호환을 위해 과거 object ID 유지 |
|    3 | Sector 03 / landmark 05 | `sector-03-05:service-calibration-frame` | 세 번째 generic 3장 offer                                           |

- 세 source는 모두 `interact-choice` objective이며 선택이 해당 outbound panel 진행의 선행 조건이다.
- 선택 종류는 고정 Foundation/Specialization tier가 아니라 현재 loadout과 호환되는 동일한 22장 Catalog offer다.
- source 소비와 pending offer는 Player별 상태다. 개인 사망·부활·재접속·party wipe가 획득 카드나 소비 source를 초기화하지 않는다. party wipe로 current Sector objective가 reset되면 이미 전원이 소비한 Node를 다시 방문하는 순간 두 번째 offer 없이 shared objective만 복구한다.
- Node 외형도 로컬 Player의 `augmentRuntimeState.consumedSourceIds`를 사용한다. 현재 Node ID를 소비한 Player 화면에서는 조명·선택 슬롯·상태 램프가 꺼지고 `CONSUMED / NODE OFFLINE`으로 보이지만, 아직 소비하지 않은 Player 화면에서는 공용 objective 완료 여부와 무관하게 `AUGMENT READY / 3 OPTIONS AVAILABLE` 상태를 유지한다.
- 공용 objective는 현재 채널 Player 전원이 해당 source를 소비한 뒤 한 번 완료해 route를 연다. 완료 전 퇴장한 Player는 요구 집합에서 제거해 교착을 막고, objective 완료 뒤 합류한 Player에게도 같은 Node의 개인 offer를 제공하되 이미 열린 route를 다시 잠그지 않는다.
- Sector 04~06은 Runtime 연결과 명시적 장비 Node 결정 전까지 source를 만들지 않는다.

## 22장 Catalog

| 분류            | 카드                                                           |
| --------------- | -------------------------------------------------------------- |
| 공통 Rope 6     | 빠른 발사, 긴 로프, 빠른 회수, 해제 추진, 감전 로프, 충돌 폭발 |
| 기본 Action 6   | 점멸, 돌진 타격, 순간 방어, 밀쳐내기, 직선 사격, 느린 낙하     |
| Signature 6     | 폭발 흔적, 충돌 반동, 피해 반사, 벽 충돌, 관통 사격, 종료 파동 |
| 범용 modifier 4 | 빠른 재사용, 추가 충전, 로프 연동, 사용 후 보호막              |

Quest, 순수 기본 이동 modifier, rarity와 Specialization은 v1 범위가 아니다.

## 기본 Rope와 펀치

| 항목          |   0.25.0 | 0.26.0 기본 |                   카드 적용 |
| ------------- | -------: | ----------: | --------------------------: |
| Hook speed    | 1400px/s |    1200px/s | 빠른 발사 `+50%` → 1800px/s |
| Hook lifetime |    2/7초 |       1/3초 |        빠른 발사 파생 2/9초 |
| Hook reach    |    400px |       400px |      긴 로프 `+20%` → 480px |
| Reload        |   0.20초 |      0.50초 |   빠른 회수 `-50%` → 0.25초 |

Reload는 정상 해제·비행 만료·입력 취소에 공통 적용한다. 해제 추진은 정상 Rope 해제 계산 뒤 전체 속도 벡터를 한 번 `×1.25` 한다.

기본 우클릭 펀치는 조준 반구 안의 가장 가까운 적 하나를 사거리 55px에서 공격한다. 피해는 Rope impact의 40%(현재 10), 직접 플레이어를 추격하는 적에만 넉백 50px, cooldown 0.50초이며 이동·무적·다중 타격은 없다. 고정 Turret·고정 Patrol 경로·제자리 지원형은 피해만 받고 authored 위치를 유지한다.

## Rope 전투 카드

### 감전 로프

- 부착 중 Anchor–Player 선분과 `enemy radius + 10px` 이내로 닿은 모든 damageable 적이 대상이다.
- DPS는 기본 Rope impact의 80%/초다.
- 0.10초 pulse는 정산·표시 cadence이며 현재 pulse 피해는 2다.
- 진입·재진입 burst가 없고 짧은 접촉의 미정산 시간은 보존한다.
- VFX는 로컬 `C:\projects\ball-fight-simulator`의 전기 표현 문법을 의존성 없이 이식한다. endpoint 고정 wavering polyline에 반투명 청록 glow, 청색 본선, 백색 core를 additive로 겹친다.

### 충돌 폭발

- 기존 유효 고속 Rope 몸체 충돌을 trigger로 사용한다.
- 반경 120px, 직접 대상 100%, 주변 대상 50% 피해다. 직접 대상은 splash를 중복 적용하지 않는다.
- 일반·Elite는 0.25초 동안 100px 이동한다. 직접 대상은 Player 진행 방향, 주변 대상은 충돌점 바깥 방향이다.
- Boss는 피해만 받고 이동하지 않는다.
- 분리 뒤 다시 최소 속도 이상으로 접촉해야 재발동한다. falloff·stun은 없다.

## Action과 Signature

PC는 기존 우클릭 위치를 Action 방향으로 사용한다. 모바일은 `로프 조준 ↔ 액션 조준` 토글 뒤 액션 조준 상태에서 월드를 누른 실제 지점을 방향으로 사용하며, 그 터치는 Rope 발사 입력을 만들지 않는다. `default-punch`는 증강 카드가 없는 별도 공격 예외가 아니라 모든 Player가 시작부터 가진 built-in 기본 Action이다. 주먹과 여섯 교체 Action은 같은 `ActionAugmentState`의 입력 edge·activation sequence·charge·recharge queue·snapshot/restore를 사용하고 유효 시작에서 `augment-action-started` presentation event를 만든다. 주먹/방향 잔상과 교체 가능한 `gameplay-action-swing` cue는 즉시 재생하며 predicted/confirmed 표현은 같은 `activationId`로 한 번만 보인다. 기본 주먹은 사거리 안 적이 없어도 charge를 소비하고 입력 피드백을 만들지만 피해와 넉백은 기존 유효 대상에게만 적용한다.

| Action                           | 기본 계약                                                                                                                             | Signature                                                                   |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 주먹 (`default-punch`, built-in) | 사거리 55px, 40% 피해, 50px 넉백, cooldown 0.5초, 1 charge. 증강 offer에는 나오지 않고 다른 기본 Action 획득 전 기본 loadout으로 사용 | 없음                                                                        |
| 점멸 (`direction-dash`)          | 조준 방향 최대 150px 즉시 위치 전환, collider sweep으로 가장 먼 안전 위치에 정지, cooldown 5초, 속도·Rope 보존, damage·무적 없음      | 폭발 흔적: 실제 시작점→도착점의 폭 60px 경로가 0.50초 뒤 80% 피해           |
| 돌진 타격                        | 조준 방향 `velocity += 500`, 0.50초 창, 100% 피해, 75px 넉백, cooldown 5초                                                            | 충돌 반동: 적·solid 법선 반사, 속력 100% 보존, 적별 피해 1회                |
| 순간 방어                        | 0.50초 동안 첫 combat HP 피해만 0, cooldown 5초                                                                                       | 피해 반사: 막은 HP 피해를 공격자에게 1회 반환하고 projectile은 인과 선 표시 |
| 밀쳐내기                         | 반경 140px, 모든 적 20% 피해, 175px 넉백, cooldown 5초, Boss 이동 없음                                                                | 벽 충돌: 밀리는 중 solid 접촉 시 80% 피해 1회                               |
| 직선 사격                        | 2000px/s, 3000px, 1.50초, 80% 피해, cooldown 2.5초, 기본 관통·유도·넉백 없음                                                          | 관통 사격: 적별 1회 관통, 속도·피해 손실 없음                               |
| 느린 낙하                        | 공중 hold 최대 2초, gravity ×0.25, release·timeout·landing 종료, cooldown 5초                                                         | 종료 파동: 모든 종료에서 반경 120px, 80% 피해 1회                           |

범용 modifier:

- 빠른 재사용: Action cooldown `×0.60`.
- 추가 충전: 최대 2 charge, 획득 즉시 full, cooldown마다 한 charge씩 순차 회복.
- 로프 연동: Rope 해제 뒤 1초 안의 다음 Action cooldown `×0.50`; 빠른 재사용과 곱연산.
- 사용 후 보호막: 유효 Action 종료 시 최대 HP 15%, 2초. 중첩하지 않고 양·시간을 갱신하며 HP 피해만 흡수한다.

주먹의 수치 정의는 내부 Action Catalog가 소유하고 target resolver·owner prediction·서버 `augment-impact` formula가 같은 activation 값을 소비한다. 과거 `punchCooldownRemaining` snapshot은 restore 시 default-punch의 `chargesRemaining=0`과 recharge 상태로 한 번 migration하며 새 snapshot에는 별도 punch 필드를 쓰지 않는다. 점멸은 0.25초 분할 이동이나 impulse를 사용하지 않는다. Action 입력 상승 edge에서 한 번만 실행하며 hold 중 반복되지 않는다. Solid는 Player circle collider를 포함한 연속 경로로 검사하고, one-way는 위→아래 이동만 기존 PlayerPhysics 의미대로 차단한다. 내부 ID `direction-dash`와 `explosive-trail` 호환 관계는 저장·snapshot 호환을 위해 유지한다. `dash-strike`는 별도 속도 impulse와 0.50초 접촉 공격 창을 가진다.

## 피해·이동 권위

- Player Rope·Action trigger는 공격 Player의 owner client가 먼저 시뮬레이션하고 즉시 feedback을 시작한다.
- claim은 unique event ID, tick, source/target/effect, 공식 피해와 최소 접촉 자료를 보낸다. 넉백은 direction·distance·duration intent를 같은 사건에 넣는다.
- 서버는 지연된 Player state로 충돌을 다시 만들지 않는다. 소유권, tick, finite payload, formula, card 보유, event 중복과 target 상태를 검증한다.
- live target은 `EnemyObject.blocksImpactFrom(sourcePosition)` → damage → lethal이면 defeat 1회·own knockback 생략 → 생존자 public knockback 순서다. 마지막 knockback은 `EnemyMobility`가 `direct-player-pursuit`로 분류한 Pursuit/Swarm에만 적용한다.
- 알려진 tombstone target의 늦은 사건은 `target-already-dead` 성공 no-op이다. damage, movement, defeat, loot, metric, feedback, VFX와 부활을 만들지 않는다.
- 한 번도 알려지지 않은 target ID는 `target-missing`으로 거부한다.
- 중립 적 위치·행동은 서버가 소유한다. owner client의 즉시 예측은 receipt 뒤 되감지 않고 snapshot으로 수렴한다.

## Protocol

- Player command v5: Action intent와 물리 입력 장치의 단조 증가 `interactSequence`를 전송한다. 증강 선택 Confirm은 sampled W 상태 변화가 아니라 선택창이 열린 뒤 발생한 새 W/점프 누름 sequence만 소비한다.
- Owner motion v4: owner-owned augment/action runtime mirror 추가.
- Player impact v8: generic selected Augment state와 guard/shield 결과 수렴.
- World snapshot v11: 모든 Player의 non-null Action state를 전송하며 기본 주먹도 charge/recharge snapshot으로 수렴한다.
- Augment impact v1, Augment offer v1을 사용한다.

## 반복 수치 규칙

새 기본값·강화값을 제안할 때 정수는 5, 소수 첫째는 0.5, 소수 둘째는 0.05 단위를 기본으로 한다. 계산 파생값은 정확한 식을 유지한다. 기존 기본 수치를 강화하는 카드는 고정 결과값보다 percentage multiplier/reduction으로 정의해 기본값 조정에 따라가게 한다.
