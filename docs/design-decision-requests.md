# 기획 결정 요청·답변 추적

이 문서는 아직 열린 제품 결정을 추적한다. 확정된 구현 계약은 [design-decision-resolution-package.md](./design-decision-resolution-package.md), 현재 Runtime 상태는 [scenario-development-integration.md](./scenario-development-integration.md)가 소유한다.

## 현재 상태

| 항목 | 상태 | 다음 결정 |
| --- | --- | --- |
| P1 성장 | 완료 | generic Augment v1 유지 |
| P2 Boss | 구현 | Boss06 실제 전투 검증 |
| P3 Timer/Purge | HOLD | reward trigger·Field origin·개인 사망 복귀 |
| P4 NPC | 예선 제외 | core 완료 뒤 선택 검토 |
| P5 Ending | 구현 | Boss06·개별 Boarding 실제 멀티 검증 |

## P1. 성장

Rope 6·Action 6·Signature 6·범용 modifier 4의 22장, explicit Node 1-4·2-3·3-5, Player별 결정적 3장 offer와 최대 6장 loadout을 유지한다. 고정 Foundation/Specialization tier는 복구하지 않는다.

## P2. Boss

제품 Boss는 Sector 06 마지막의 Boss06 하나다.

- 1-8→2-1, 2-8→3-1, 3-8→4-1, 4-8→5-1, 5-8→6-1은 직접 Gate portal이다.
- 6-8→Boss06→Boarding→Escape는 terminal Boss 흐름이다.

## P3. 일반 Timer / Purge

확정값은 60초, progress +10초, cap 60초, Purge 240px/s, lethal contact다. Boss06 진입에서 일반 Timer·Purge와 잔여 시간을 종료한다. 정확한 topology mapping 세 항목은 HOLD다.

## P4. NPC

예선 핵심 범위에는 live NPC·분기 대화·escort를 넣지 않는다. core 완료 뒤 여유가 있을 때만 2-6 stationary micro-NPC를 별도 결정한다.

## P5. Ending

Boss06 승리 뒤 Gate open→Threshold Bridge→Shuttle reveal→Player별 Boarding→전원 ready→Escape를 유지한다. 첫 탑승자가 동료를 순간이동시키지 않는다.

## 현재 우선순위

1. Boss06 desktop/mobile·multiplayer playtest
2. Timer/Purge topology mapping
3. NPC는 여유가 있을 때만
