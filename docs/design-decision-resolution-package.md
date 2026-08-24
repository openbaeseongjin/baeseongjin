# DESIGN DECISION RESOLUTION PACKAGE

상태: **CURRENT BOSS / TIMER / NPC / ENDING CONTRACT**

## 1. 성장

성장 계약은 [augment-v1.md](./augment-v1.md), 획득 source는 1-4 → 2-3 → 3-5 explicit Node가 소유한다. 고정 Foundation/Specialization tier는 사용하지 않는다.

## 2. Boss

제품 Boss는 Sector 06 끝의 Boss06 하나다.

| 경계 | 계약 |
| --- | --- |
| 1-8 → 2-1 | 일반 Stage objective·Access 조건 뒤 직접 Gate portal |
| 2-8 → 3-1 | 일반 Stage objective·Access 조건 뒤 직접 Gate portal |
| 3-8 → 4-1 | Sector03 objective·Access 조건 뒤 직접 Gate portal |
| 4-8 → 5-1 | 2-of-3 quorum과 objective 뒤 직접 Gate portal |
| 5-8 → 6-1 | objective 뒤 직접 Gate portal |
| 6-8 → Boss06 → Boarding → Escape | CONTINUITY WARDEN과 terminal completion 유지 |

Boss06의 단일 body·Guard/Counter·Security·개별 Boarding 계약은 [boss/06/README.md](./boss/06/README.md)가 소유한다.

## 3. 일반 Timer / Purge

~~~text
SECTOR GENERAL TIMER: 60 sec
PROGRESS REWARD: +10 sec
TIMER CAP: 60 sec
CONTAINMENT PURGE FIELD: 240 world px/sec
PURGE CONTACT: lethal
BOSS06 ENTRY: general Timer/Purge 종료, 잔여 시간 폐기
~~~

Field는 보상 중 현재 높이에서 멈추고 다음 0초부터 같은 위치에서 재상승한다. 전멸은 current Sector만 reset하고 Player별 증강과 이전 Sector 진행은 보존한다. 정확한 reward trigger·최초 Field origin·개인 Purge 사망 복귀는 HOLD이며 [sector-timer-and-boss-flow.md](./sector-timer-and-boss-flow.md)가 소유한다.

Boss Timer와 시간 만료 Arena collapse는 후속 범위다. 현재 Boss06은 시간 제한 없이 진행하고 전원 탈락 시 해당 Boss 시도만 재시작한다.

## 4. NPC

예선 핵심 범위에는 live NPC·분기 대화·escort를 넣지 않는다. 48개 Stage environmental story와 현재 gameplay loop를 우선한다. core 안정화 뒤 여유가 있을 때만 2-6의 stationary 3-line NPC를 별도 결정한다.

## 5. Ending / Boarding

~~~text
6-8 ACCESS DENIED
→ Boss06 CONTINUITY WARDEN
→ Gate open / Threshold Bridge / Shuttle reveal
→ 각 active Player가 직접 Boarding zone 도달
→ ALL ACTIVE PLAYERS READY
→ Escape completion
~~~

첫 Boarding Player가 동료를 순간이동시키지 않는다. 승리 시 spectator는 final safe Pad deck으로 복귀한 뒤 직접 탑승한다. completion은 모든 active Player readiness가 소유하며 run state가 completed가 된 뒤 자동으로 다음 Stage를 시작하지 않는다.

## 6. 실행 우선순위

~~~text
Boss06 실제 플레이·멀티 검증
→ Timer/Purge topology mapping
→ NPC는 여유가 있을 때만
~~~

대체된 여섯 Boss 구조와 초기 Final Security 초안은 [decision-history.md](./decision-history.md)가 보존한다.
