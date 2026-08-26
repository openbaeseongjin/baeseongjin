# 섹터 타이머·Containment Purge Field·보스 전환 기획

이 문서는 연속 Sector에서 플레이어가 하층에 무기한 머물지 않고 계속 상승하도록 만드는 공용 Timer와 `CONTAINMENT PURGE FIELD`, 전멸 재시작과 별도 Boss 전환의 현재 제품 계약을 정의한다.

## 현재 상태

| 구분 | 상태 | 계약 |
| --- | --- | --- |
| 일반 Timer 수치 | 확정 | Sector 시작 `60초`, 진행 보상 `+10초`, cap `60초` |
| Purge 동작 | 확정 | Timer 0초부터 `240px/s`, 보상 중 정지, 다음 0초 재상승, 후퇴 없음 |
| Purge 접촉 | 확정 | lethal |
| 전멸 | 확정 | current Sector reset, 보유 성장과 이전 Sector 진행 보존 |
| Boss 경계 | 확정 | Boss06 진입에서 일반 Timer·Purge·잔여 시간 종료, 현재 Boss 전투는 시간 제한 없이 시작 |
| Boss Timer·Arena collapse | **DEFERRED** | Boss06 Runtime·snapshot·HUD·위험 판정에 연결 금지 |
| `+10초` trigger | **HOLD** | seamless landmark/objective 중 어떤 physical transition인지 후속 결정 |
| 최초 Field origin | **HOLD** | 연속 Sector geometry 안의 시작 위치 후속 결정 |
| 개인 Purge 사망 복귀 | **HOLD** | Sector-entry 즉시 복귀와 관전·후속 전이 합류 중 후속 결정 |

HOLD 세 항목은 Runtime 구현 금지다. 과거 Stage 번호, Gate portal과 Area 하단을 자동 대응시키지 않는다.

## 설계 의도와 세계관

Timer는 speedrun 점수가 아니라 안전한 하층 정체를 막는 상승 압박이다. `CONTAINMENT PURGE FIELD`는 붕괴 확산을 막기 위해 도시 하층을 아래부터 폐쇄·소거하는 자동 격리 절차다. Battle Royale식 원형 안전지대가 아니라 하나의 수평 전선이 아래에서 위로 올라온다.

## 확정 수치와 상태 흐름

1. Sector 일반 구간은 60초로 시작한다.
2. 같은 Sector 안의 landmark를 이동해도 Timer를 초기화하지 않는다.
3. 확정될 physical progress trigger가 발생하면 한 번 `min(현재 시간 + 10초, 60초)`를 적용한다.
4. 처음 또는 다시 0초가 되면 Field가 240px/s로 상승한다.
5. 상승 중 시간을 보충하면 Field는 현재 높이에서 정지한다.
6. 시간이 다시 0초가 되면 같은 위치에서 상승을 재개한다.
7. Field는 후퇴하거나 Player를 추적·순간이동하지 않는다.

120Hz simulation에서 240px/s는 tick당 2px다. 수치는 첫 구현 기준이며 실제 P50/P80 성공률과 실패 원인으로 검증하되 사용자 결정 없이 과거 baseline으로 되돌리지 않는다.

## 경고와 표현

| 남은 시간 | UI | 월드·오디오 |
| --- | --- | --- |
| 10초 | Amber 점멸 | 하단 방향의 희미한 수평 예고와 낮은 기계음 |
| 3초 | Red/White 빠른 점멸, `PURGE FIELD IMMINENT` | 초 단위 경고음과 위험 방향 강화 |
| 0초 | Field 활성 표시 | 활성 stinger와 하단 방향 화면 반응 |

경고와 Field는 색만으로 구분하지 않고 형태·속도·문구·음향을 함께 사용한다. Rope·Anchor·Enemy Telegraph를 가리거나 전체 화면을 불투명하게 덮지 않는다.

## 사망과 Sector 재시작

- Purge 접촉은 일반 HP 피격이나 낙사와 구분되는 lethal 사건이다.
- 개인 Purge 사망 뒤 정확한 복귀 위치와 관전 여부는 HOLD다.
- 활성 Player 전원이 사망하면 current Sector 실패다.
- current Sector의 objective·route·enemy·Timer·Field baseline을 초기화하고 Sector entry에서 재시작한다.
- Player별 증강과 이전 Sector 완료 진행은 유지한다.
- 일반 피격·낙사 한 건만으로 공용 Sector reset을 시작하지 않는다.

## Boss 전환

- 기획자가 확정할 Sector transition slot의 Boss 진입에서 일반 Timer와 Purge를 종료한다.
- 남은 일반 시간은 Boss 시간에 더하지 않고 폐기한다.
- 초기 Boss 전투는 별도 Timer나 시간 만료 Arena 위험 없이 진행한다.
- 일반 `60초 / +10초 / Purge Field`를 Boss에 이어 붙이지 않는다.
- 대체된 Boss timer prototype 값은 후속 Timer 작업의 구현 입력으로 사용하지 않는다.
- Boss 전원 탈락은 해당 Boss 시도만 재시작한다. Boss06 처치 뒤에는 Boarding·run completion으로 진행한다.

`1-8` 같은 legacy Stage alias는 migration 주소다. Boss room은 Sector transition slot에 삽입하며 downstream Sector local 좌표와 콘텐츠 ID를 다시 쓰지 않는다.

## 멀티플레이 권한 경계

- Timer와 Field 위치는 특정 Player에게 귀속되지 않는 중립 월드 상태이므로 서버가 진행한다.
- Field 접촉은 피해 Player 클라이언트가 자기 최신 위치에서 먼저 lethal 반응을 적용하고 claim한다.
- 서버는 Field 상태·tick·중복을 검증해 공용 사건을 공유한다.
- 정상 승인 receipt가 이미 시작한 로컬 사망 표현을 되감거나 중복 재생하지 않는다.
- 전멸 reset과 향후 개인 복귀 사건은 결정적 event ID로 멱등 처리한다.
- 재접속 복원 schema는 Runtime 구현 설계에서 별도로 확정한다.

## 비목표

- Area·landmark 진입마다 Timer 초기화
- 60초 초과 비축
- 원형 안전지대
- Player 추적·순간이동·시간 보충 시 Field 후퇴
- Stage ID 또는 legacy Gate portal을 새 Runtime trigger 권위로 사용
- 개인 Purge 사망 복귀 규칙을 후속 결정 전에 추정
- 전멸 시 전체 Run·증강·이전 Sector 진행 초기화
- 일반 Purge를 Boss 전투에 재사용
- Field가 collision surface나 authored geometry를 실제 삭제

## 테스트 가능한 완료 기준

1. 일반 Timer는 60초로 시작하고 같은 Sector 안에서 유지된다.
2. 확정 progress trigger는 한 번만 +10초를 적용하고 cap 60초를 넘지 않는다.
3. 첫 0초부터 Field가 240px/s로 상승한다.
4. 시간 보충은 Field를 현재 높이에서 정지시키고 다음 0초부터 같은 위치에서 재개한다.
5. Field는 후퇴·추적·순간이동하지 않는다.
6. 10초·3초·0초 경고가 시각·문구·음향으로 구분된다.
7. Purge 접촉은 피해 클라이언트에서 서버 receipt보다 먼저 lethal 반응을 만든다.
8. 전멸은 current Sector만 reset하고 증강과 이전 Sector 진행을 보존한다.
9. Boss 진입은 일반 Timer·Purge·잔여 시간을 종료하고 시간 제한 없는 초기 Boss 계약을 시작한다.
10. HOLD 세 항목은 별도 제품 결정 전 Runtime·validator·snapshot에 들어가지 않는다.

## 대체된 계약

과거 `960초 / 내부 Gate +45초 / cap 960초 / 상승 붕괴 80px/s / 다음 Gate 자동 합류`는 폐기됐다. 대체 이유와 당시 맥락은 [`decision-history.md`](./decision-history.md)에 보존한다.

전체 제품 방향과 우선순위는 [`game-hackathon-planning.md`](./game-hackathon-planning.md), 확정된 Boss·Timer·NPC·Ending 계약은 [`design-decision-resolution-package.md`](./design-decision-resolution-package.md), seamless topology는 [`architecture.md`](./architecture.md)를 함께 따른다.
