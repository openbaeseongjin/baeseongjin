# 현재 Runtime 대비 필요한 변경

기준:
`e1c558ef9e09ecbc09254cb3fc45306186755570`

## 기존 코드에서 이미 존재 — 재작성 금지

### BossEncounterRuntime
이미 소유:
- encounter status
- attempt
- phase
- health
- shield closed/exposed
- exposure timer
- current breaker id
- encounter timer
- collapse state/distance
- participant active/spectating
- retry
- snapshot/restore

따라서 Boss01 전용 class로 복제하지 않는다.

## Boss01Definition.js

기존:
- id
- name
- maxHealth
- phaseCount
- phaseHealth
- exposureSeconds
- timerSeconds
- collapseSpeed
- breakerIds
- phases[].threats

추가 권장:
- `phaseTargets`
- 필요하면 `arenaId`

## 새 코드

### 1. Boss01ArenaDefinition.js
순수 데이터.

### 2. BossPhaseTargetResolver.js
Boss HP/Phase를 직접 소유하지 않는다.
현재 Runtime snapshot을 읽어 충돌 결과만 계산한다.

### 3. BossTargetContactState.js
Player별 entry-edge contact 관리.

### 4. Boss01ArenaController.js 또는 기존 world controller 확장
- phase threat enable/disable
- breaker presentation
- target exposure presentation
- collapse transform

## GameSimulation.js

필요한 연결:
- Boss impact detection
- Boss breaker world interaction
- Boss event → presentation/world state
- Boss victory → progress event

## 구현하지 말 것

- Boss target을 일반 `EnemyObject`에 억지로 넣기
- Boss HP와 일반 Enemy HP를 이중으로 관리
- Boss마다 별도의 Snapshot 체계 만들기
