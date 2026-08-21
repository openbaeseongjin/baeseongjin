# Sector 01-8 → Boss 01 → Sector 02 연결

## 현재 기획에서 수정해야 하는 ownership

기존 1-8:
`Maintenance Override → Worker District Access Open`

Boss 삽입 후:
`Maintenance Override → C-01 Emergency Lockdown → Boss 01 → Worker District Access Open`

## 권장 진행 상태

### 1. 1-8 Objective 완료
기존:
`sector-01-08:maintenance-override`

완료 직후:
- Gate가 열리기 시작하는 presentation은 허용
- Sector02 route unlock은 아직 금지
- Boss encounter trigger 활성

### 2. Boss Encounter 시작
참가 Player IDs로 기존:
`startBossEncounter(...)`

### 3. Boss Victory Objective
신규 progress id 권장:
`boss-01:victory`

`boss-encounter-completed` event를 받으면 이 Objective를 one-way complete.

### 4. Sector transition
Sector01 → Sector02 route lock의 requiredObjectiveIds에
`boss-01:victory`가 포함되도록 owner를 수정.

## 주의
현재 실제 route transition owner가 1-8 Area의 `nextAreaId`인지,
seamless sector route lock인지 구현 직전 latest main에서 다시 확인한다.

문서만 보고 `nextAreaId`를 임의 변경하지 않는다.
