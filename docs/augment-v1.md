# 마법·증강·경험치 시스템

이 문서는 0.67.0부터 사용하는 마법 커맨드, 로프 패시브, 경험치 성장과 상태이상의 단일 기준이다.

## 입력과 슬롯

- 좌클릭 유지·해제는 기존 Rope를 조작한다.
- 우클릭은 부착 Rope를 해제하고 0.75초 입력 버퍼를 연다. 이후 입력마다 0.75초를 다시 부여하며 세 입력을 완성하지 못하면 시전·쿨다운 소비 없이 취소한다.
- 조준 방향은 세 번째 입력이 확정된 순간의 커서로 계산한다.
- PC 슬롯은 `우좌좌` 기본 공격, `우좌우` 유틸, `우우좌` 고위력 공격, `우우우` 이동이다.
- 모바일은 같은 네 슬롯을 직접 탭하는 계약이지만 1차 구현 범위에서는 제외한다.

## 시작 마법과 해금 마법

| 슬롯 | 마법 | 쿨다운 | 계약 |
| --- | --- | ---: | --- |
| 우좌좌 | 에너지 공 | 1초 | 사거리 240, 속도 900, 피해 50인 단발 투사체 |
| 우좌우 | 기동 증폭 | 15초 | 쿨다운 ×0.5 동안 지상·공중 가속도, 최대 수평속도, 점프 속도 ×1.5 |
| 우우좌 | 메테오 | 5초 | 속도 650, 사거리 900, 직접 피해 150, 반경 140의 100 피해 폭발과 점화 |
| 우우우 | 물리 대시 | 1초 | 조준 방향 impulse 500을 acceleration에 누적 |

시작 시 에너지 공과 물리 대시만 장착하며 나머지 두 슬롯은 잠긴다. 모든 마법은 독립 쿨다운을 사용하고 공용 쿨다운은 없다. 메테오·기동 증폭은 첫 번째·두 번째 레벨업에서 각각 한 장 선택으로 자동 장착한다.

## 로프 패시브와 자동 장착

현행 카탈로그는 로프 패시브 6장과 마법 2장뿐이다. 빠른 발사, 긴 로프, 빠른 회수, 해제 추진, 감전 로프, 충돌 폭발은 기존 효과를 유지한다. 비로프 증강은 고정 역할 슬롯의 현재 마법을 교체하며 부착 강화·Signature·Modifier 계층은 없다. 보상 선택 뒤 별도 장착 UI를 열지 않는다.

## 경험치

- 몹별 `experienceReward`는 Enemy definition이 소유한다. 군집 10, 추격 25, 방패·지원 30, 포격·재머 35이며 legacy 일반 적 기본값은 25다.
- 막타를 서버가 확정한 Player만 경험치를 한 번 받는다.
- 기본 필요 경험치 50, 레벨당 증가량 25, 5 단위 반올림을 `ExperienceProgressionDefinition`이 계산한다.
- 레벨 상한은 획득 가능한 카탈로그 카드 수에서 파생하며 레벨별 표와 수동 `maxLevel`을 두지 않는다.
- 한 처치가 여러 레벨을 넘으면 경험치를 보존하고 미해결 보상 선택을 순서대로 연다. 첫 두 보상 뒤에는 아직 획득하지 않은 로프 패시브를 최대 3장 제시한다.

## 상태이상

Player·Enemy·Boss는 같은 `CombatStatusEffectPool`을 Has-A로 소유한다. immutable spec const는 수치만 소유하고, `CombatStatusEffect` 하위 런타임 객체가 적용·재적용·진행·만료·snapshot·restore·파티클 생성을 override한다.

- 감전 기본 spec: 0.5초, 0.05초 pulse, 총 25 피해.
- 점화 기본 spec: 3초, 0.5초 pulse, 총 30 피해.
- 냉동 기본 spec: 1초 동안 `canAct() = false`; Player 입력과 Enemy·Boss 행동만 막고 공통 물리·Rope·중력·충돌·외부 impulse는 진행한다.
- 서로 다른 상태는 공존하고 같은 상태 재적용은 중첩 없이 지속시간만 갱신한다. 원소 조합 반응은 없다.

각 actor 상태 표시 경로는 위치·크기·속도·각도와 particle sink만 Pool에 넘긴다. 구체 상태 객체가 `draw(renderState)`에서 파티클을 생성하며 actor renderer는 상태 ID와 외형을 해석하지 않는다. 구현 구조와 불꽃·전기·냉기 외형은 `C:\projects\ball-fight-simulator\src\effects\rageEffects.js`와 elemental effect 구현을 기준으로 한다.

## 공통 전투 대상과 멀티 권한

투사체·범위 효과는 Player·Enemy·Boss를 같은 combat target 계약으로 조회한다. 시전자는 기본 제외하며 자기 피격 허용 여부는 마법 target policy가 소유한다. Player 피해는 피해 클라이언트, 중립 Enemy·Boss 피해와 막타 경험치는 서버가 확정한다. 상태 pulse를 네트워크 사건으로 매번 보내지 않고 상태 적용 원인과 snapshot으로 진행한다.

원격 Player 마법은 피해 클라이언트가 복제된 Spell projectile의 선분 충돌을 감지해 피해·상태이상·넉백을 즉시 적용한 뒤 Augment impact v5 claim을 보낸다. 서버는 인증된 피해 Player, source Player, 마법 수치와 event ID를 검증하고 중복 claim을 한 번만 확정한다.

Player command v7은 완성된 spell command sequence와 key만 전송한다. Owner motion v10은 Spell·Experience 상태를, player-impact v15는 공통 상태이상을 포함하되 피격 후 무적 타이머가 없는 recovery 검증을 사용한다. augment-impact v5는 시간 기반 무적에 의한 `duplicate` 성공 결과를 허용하지 않는다. 디버그 패널은 현행 8장만 선택하며 과거 Action·Signature·Modifier와 Node offer protocol은 존재하지 않는다.

`npm run simulate:multiplayer-combat`은 DOM 없이 실제 `PlayerCommandBatch` 직렬화, `GameSimulation.stepCommandBatch()`, WorldSnapshot v17 직렬화·복원과 보상 resolver를 사용한다. 두 Player를 명시 배치해 상대 피격·시전자 제외·피해자 선행 적용과 중복 claim·지형 충돌 메테오 범위 피해·점화·냉동 입력 차단과 물리 지속·대시 impulse 보존·막타 경험치·자동 장착·최종 snapshot 수렴을 검사한다.

## HUD

화면 하단 중앙의 고정 4칸은 마법 이름·커맨드·독립 쿨다운을 표시하고 잠긴 슬롯을 구분한다. 그 아래 XP bar와 레벨을 표시하며 입력 중에는 로컬 Player가 실제로 누른 L/R 토큰만 잠깐 보여 준다.
