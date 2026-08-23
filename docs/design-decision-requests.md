# 기획 결정 요청·답변 추적

이 문서는 아직 열린 제품 결정을 추적한다. 확정된 구현 계약은 [design-decision-resolution-package.md](./design-decision-resolution-package.md), 현재 Runtime 상태는 [scenario-development-integration.md](./scenario-development-integration.md)가 소유한다.

## 현재 상태

| 항목 | 상태 | 다음 결정 |
| --- | --- | --- |
| P1 성장 | 완료 | generic Augment v1 유지 |
| P2 Boss | 부분 완료 | Boss03 이동형 보스몹 상세 기획 |
| P3 Timer/Purge | HOLD | reward trigger·Field origin·개인 사망 복귀 |
| P4 NPC | 예선 제외 | core 완료 뒤 선택 검토 |
| P5 Ending | 구현 | Boss06·개별 Boarding 실제 멀티 검증 |

## P1. 성장

Rope 6·Action 6·Signature 6·범용 modifier 4의 22장, explicit Node 1-4·2-3·3-5, Player별 결정적 3장 offer와 최대 6장 loadout을 유지한다. 고정 Foundation/Specialization tier는 복구하지 않는다.

## P2. Boss

제품 Boss는 Sector 03·06 마지막의 두 개다.

- 1-8→2-1, 2-8→3-1, 4-8→5-1, 5-8→6-1은 직접 Gate portal이다.
- 3-8→Boss03→4-1은 독립 Boss Stage다.
- 6-8→Boss06→Boarding→Escape는 terminal Boss 흐름이다.
- Boss03은 일반몹이 아니라 공간을 이동하며 싸우는 보스몹이다.
- 현재 Scanner·Arm Runtime은 새 Boss03 기획 전까지만 임시 유지한다.

열린 답변은 Boss03의 정체성·Arena·운동·공격·Phase·수치·Rope 상호작용이다. 기획자가 작성 중이므로 개발자가 추정하지 않는다.

## P3. 일반 Timer / Purge

확정값은 60초, progress +10초, cap 60초, Purge 240px/s, lethal contact다. Boss03·06 진입에서 일반 Timer·Purge와 잔여 시간을 종료한다. 정확한 topology mapping 세 항목은 HOLD다.

## P4. NPC

예선 핵심 범위에는 live NPC·분기 대화·escort를 넣지 않는다. core 완료 뒤 여유가 있을 때만 2-6 stationary micro-NPC를 별도 결정한다.

## P5. Ending

Boss06 승리 뒤 Gate open→Threshold Bridge→Shuttle reveal→Player별 Boarding→전원 ready→Escape를 유지한다. 첫 탑승자가 동료를 순간이동시키지 않는다.

## 현재 우선순위

1. 두 Boss catalog와 네 직접 Sector 전환 정합
2. 신규 Boss03 기획·구현
3. Boss03·06 desktop/mobile·multiplayer playtest
4. Timer/Purge topology mapping
5. NPC는 여유가 있을 때만
