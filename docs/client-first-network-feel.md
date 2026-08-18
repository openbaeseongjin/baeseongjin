# 클라이언트 우선 멀티플레이 검증 가이드

이 문서는 클라이언트 우선 구조로 전환한 배경과 검증 관점을 짧게 보존한다. 현재 권한, protocol, claim, snapshot과 복구 계약의 단일 기준은 [`multiplayer-synchronization.md`](./multiplayer-synchronization.md)다. 두 문서가 다르면 해당 기준 문서와 코드가 우선하며 이 문서에 별도 규칙을 추가하지 않는다.

## 현재 결론

서버는 소유 플레이어 물리를 독립 재실행하지 않는다. 자기 이동·로프·피격 결과는 소유자 또는 피해자 클라이언트가 먼저 적용하고, 최신 `owner-motion`과 claim 결과를 서버와 동료가 따라간다. 정상 snapshot이나 receipt는 소유 플레이어의 위치·HP·생명·로프를 서버의 지연된 복제값으로 되감지 않는다.

중립 월드는 별도 권위를 사용한다. 몹·적 투사체 생성과 궤적, 공용 진행과 세션 수명주기는 서버가 진행하며 다른 클라이언트는 서버 표본을 따른다. 원격 플레이어는 해당 소유자가 만든 `ownerMotionTick`, 적은 `serverTick`을 시간축으로 사용한다.

## 적용된 우선순위

| 순서 | 현재 적용 |
| --- | --- |
| 오차 무시 | 정상 owner snapshot 전체를 무보정 구간으로 취급한다. 서버에는 소유자를 보정할 별도 물리 진실값이 없다. |
| 비대칭 표현 보정 | 정상 owner 경로에는 적용하지 않는다. legacy Area checkpoint rollback처럼 명시적 compatibility 전이에만 짧은 표시 offset이 남아 있다. |
| 소유권 분리 | 자기 이동·시야·로프·피격은 당사자 클라이언트, 중립 월드와 공용 진행은 서버가 원점이다. |
| 원격 grace | 동료와 적은 100ms 과거 표본을 보간하고 표본 공백에서만 최대 120ms 외삽한다. |
| 공격자 관측 존중 | 로프·증강·승인된 플레이어 탄환 적중은 서버 현재 위치·궤적·접촉 재구성 차이만으로 거부하지 않는다. |

## 복구와 마지막 안전장치

피해 결과 지문이 서버의 임시 전이와 다르면 서버는 `impact-claim-receipt`에 `accepted: true`, `resolution: recovery-required`, 일회용 `recoveryId`를 보낸다. 피해 클라이언트는 그 시점의 최신 전체 소유자 상태를 한 번 응답하고 서버와 동료가 이를 흡수한다. 이것은 gameplay 거부나 서버→소유자 rollback이 아니다.

장시간 적체, protocol·world revision 불일치, 역직렬화 실패처럼 더 이상 수렴을 보장할 수 없을 때도 소유자를 과거 서버 복제값으로 hard sync하지 않는다. 연결을 종료하고 사용자가 재접속하면 welcome snapshot에서 새 소유자 시뮬레이션을 초기화한다. 연결이 유지되는 동안 동료와 적은 제한 외삽 뒤 새 표본으로 다시 수렴한다.

## 제거한 이전 전제

- `owner-motion`을 속도·거리·회전·로프 offset 봉투로 거부하지 않는다.
- 정상 owner snapshot에서 작은 오차를 blend하거나 큰 오차를 hard snap하지 않는다.
- 공격 claim을 서버 현재 위치·궤적·접촉 상태로 재판정하지 않는다.
- 피해 클라이언트가 이미 적용한 HP·부활·로프 결과를 receipt로 취소하지 않는다.
- 폐기된 Foundation Shear 전용 claim을 보내지 않는다. 필요 시 generic `augment-impact` 계약을 사용한다.

## 검증 기준

- 로컬 입력과 피격 반응이 서버 receipt보다 먼저 발생한다.
- 정상 owner snapshot의 위치 차이가 커도 owner 상태와 `hardSnaps`가 바뀌지 않는다.
- 0/50/100/200ms RTT와 0/2/5% 명령 손실에서도 소유자 반응이 지속되고 서버·동료가 최신 owner 상태로 수렴한다.
- 공격 claim은 승인 ID·소유권·tick·중복·공식 효과를 검증하되 서버 시차만으로 정상 적중을 버리지 않는다.
- `recovery-required`에서만 전체 피해자 상태를 보내고 정상 impact에는 작은 사건 자료와 지문만 보낸다.
- 원격 표본은 100ms 보간·120ms 제한 외삽을 사용하며 소유 플레이어에는 이 버퍼를 적용하지 않는다.

자동 회귀는 위 계약을 검증한다. 아직 남은 필수 수동 검증은 [`two-device-playtest-protocol.md`](./two-device-playtest-protocol.md)에 따른 서로 다른 실제 기기 2대의 장시간 플레이테스트다.
