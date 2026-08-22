# Boss 01 — 게이트 잠금 운반기

상태: **DESIGN LOCKED / RUNTIME ALIGNED IN #858 / BROWSER·OWNER/SERVER VERIFIED**

이 문서는 Boss01의 유일한 현행 기획 기준이다. `legacy/`의 문서는 결정 과정과 이전 인계 원문을 보존할 뿐 구현·검수·Map Editor 비교의 권위가 아니다.

## 1. 역할

- Sector 01의 `1-8` checkpoint와 Worker District 첫 Reveal 뒤에 등장하는 별도 Post-Sector Boss Stage다.
- 열린 Gate를 다시 잠그지 않고, 분리된 Locking Assembly가 단일 수평 Rail에서 통행을 방해한다.
- 핵심 전투 문장은 **공격을 보고 피한 뒤, 열린 약점을 Rope로 반격한다**다.
- Boss Timer와 시간 만료 Arena collapse는 사용하지 않는다.

## 2. 전투 판독 규칙

Player는 별도 설명 없이 다음 상태를 구분할 수 있어야 한다.

```text
안전 대기
→ 공격 예고: 범위 표시, 무피해
→ 실제 공격: 보이는 공격과 같은 위치에서 피해·물리 충돌
→ 반격 시간: 공격 위험 제거, 약점 강조
```

화면의 공격 위치·진행 방향·진행률과 실제 collider는 항상 같은 Runtime 상태에서 파생한다.

## 3. 공통 Beam 반복

```text
현재 Rail 끝점에서 안전 대기
→ 반대편 진행 방향 표시
→ Beam 전개와 전체 이동 구간 예고
→ Carriage와 Beam이 반대편 끝점까지 함께 Sweep
→ 최대 지점 도달과 동시에 Beam 위험 종료
→ 약점 노출
→ 약점 종료 뒤 방향 반전
→ 다음 예고
```

- 안전 대기·예고·약점 노출에는 공격 피해가 없다.
- Sweep 중에는 Beam의 실제 위치에만 피해가 있다.
- 안전 상태에서 Rail 전체를 별도로 왕복하지 않는다.

## 4. Phase

| Phase   | 공격                          | 방향 규칙                             | 약점                          |
| ------- | ----------------------------- | ------------------------------------- | ----------------------------- |
| P1      | 양쪽으로 뻗은 Full Beam Sweep | Carriage와 전폭 Beam이 함께 횡단      | 반대편 Rear Drive             |
| P2      | Directional Broken Beam Sweep | 진행 방향 쪽 Beam만 표시·충돌         | 공격 방향 반대편 Side Gearbox |
| P3 진입 | Full-Speed Full Beam Sweep    | 실제 공격 중 Rail 진행률 50%에서 파손 | 파손 뒤 Central Lock Core     |
| P3 반복 | Rail Ram only                 | 예고 뒤 반대편 끝점까지 돌진          | Central Lock Core 상시 노출   |

P3의 Beam 파손 진행률은 Boss Stage Spec의 저작값이며 초기값은 `0.5`다. Map Editor에서 조정할 수 있지만 같은 Spec과 시도에서는 결정적으로 같은 위치에서 파손한다.

P3 파손 프레임에는 다음 전이가 동시에 일어난다.

```text
Beam 흔들림·균열·스파크
→ Beam 파손
→ Beam collider와 피해 즉시 제거
→ 물리 기능이 없는 시각 파편 낙하
→ 중앙 장갑 개방
→ Central Lock Core 상시 노출
```

## 5. HP와 피해

- Phase base HP는 각각 `120`이다.
- Boss Stage 시작 인원 `N=1..4`를 한 번 고정하고 `roundTo5(120 × (1 + 0.5 × (N - 1)))`로 Phase HP를 결정한다.
- retry·disconnect·rejoin·late join은 시작 시점의 scaling roster와 HP를 다시 계산하지 않는다.
- 닫힌 일반 몸체는 모든 유효 일반 피해의 `25%`를 받는다.
- 열린 현재 약점은 일반 피해 `100%`와 현재 scaled Phase HP의 `25%` 고정 보너스를 함께 받는다.
- 서로 다른 유효 causal impact마다 약점 고정 보너스를 반복 적용한다. 노출당 사용 횟수 제한은 없다.
- 동일 impact ID만 중복 제거한다.
- Phase floor에서 초과 피해를 버리며 한 impact로 여러 Phase를 건너뛰지 않는다.
- 기본 Rope 충돌 공격만으로 클리어할 수 있어야 한다.
- 주먹·Rope·접촉·강화·투사체도 같은 몸체/약점 피해 규칙을 사용한다.

## 6. 물리와 피격

- Carriage는 공통 Physics·Collider 계약에 참여하는 **Rail 구속 kinematic body**다.
- Player와 Carriage는 actor-to-actor collision manifold로 충돌한다.
- Player 공격과 접촉은 Carriage의 위치·속도·Rail 궤적을 바꾸지 않는다.
- Carriage를 Surface 또는 안전 발판으로 취급하지 않으며 보스 위 체류를 감지하는 전용 조건문도 만들지 않는다.
- 충돌 반응은 상대 속도·충돌 법선·질량·반발 계수에서 계산한다. Beam·Ram 전용 고정 knockback 수치를 두지 않는다.
- Beam은 Carriage와 이동 상태를 공유하는 공격 collider다.
- Ram 중에는 Carriage 본체 collider가 실제 공격 collider이며 더 빠른 상대 속도 때문에 자연스럽게 더 큰 충돌 impulse가 발생한다.
- 안전 대기·예고·약점 노출·Ram recovery의 본체 접촉은 물리 충돌만 처리하고 HP 피해를 주지 않는다.
- 방어 강화는 Boss 공격 피해에서도 기존과 동일하게 적용한다.

## 7. 화면과 오디오

- Polygon mock은 최종 art가 아니라 상태·collider 정합성 검증용이다.
- P1 Full Beam, P2 한쪽 Beam, P3 Beam failure와 Ram 경로, secured/exposed 약점은 색만이 아니라 도형과 선으로 구분한다.
- 파손 연출은 흔들림·균열·스파크·시각 파편·장갑 개방까지만 포함하며 파편 물리는 만들지 않는다.
- 기존 Audio 시스템에 Beam 예고·Sweep·파손·Ram 예고·Ram 충돌을 구분하는 mock cue를 제공한다.
- 최종 음원 asset은 stable cue ID를 유지한 채 후속 교체한다.

## 8. Map Editor 권위

Map Editor에서 다음 값을 조정할 수 있어야 한다.

- Arena·Rail·Carriage·Beam·Ram·약점 위치와 크기
- Phase 순서와 base HP
- Sweep·예고·노출·Ram 속도와 시간
- P3 `failureProgress`
- 인원 HP multiplier와 약점 고정 비율
- HUD와 Stage 전환

새 mechanic 의미나 새 물리 객체 종류는 코드 확장이 필요하며 기존 Spec 필드의 위치·수치 조정과 구분한다.

## 9. 완료 기준

처음 플레이하는 사람이 다음을 이해하고 실제 판정이 화면과 일치해야 한다.

```text
지금은 안전하다.
곧 공격이 온다.
지금은 실제 공격 중이다.
지금은 약점을 공격할 시간이다.
Carriage는 안전한 발판이 아니다.
```

싱글과 멀티에서 같은 Carriage 위치·방향·공격 진행률·약점 상태·HP 결과로 수렴해야 한다.
