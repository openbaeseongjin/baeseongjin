# 구현 순서 — 이 순서를 권장

## Step 0 — Baseline 확인
구현 시작 직전에 main HEAD를 다시 확인한다.
이 패키지 기준 SHA와 달라졌다면 아래 파일을 먼저 재검토:
- Boss01Definition.js
- BossEncounterRuntime.js
- GameSimulation.js
- Sector01 1-8 Runtime owner
- Sector transition owner

## Step 1 — Arena Definition
새 파일 권장:
`src/game/boss/Boss01ArenaDefinition.js`

먼저 geometry/target/breaker/threat 데이터만 만든다.
아직 GameSimulation에 연결하지 않는다.

완료 조건:
- JSON/spec와 좌표 동일
- 400px all-pairs 검증 통과

## Step 2 — Boss Phase Target Resolver
새 파일 권장:
`src/game/boss/BossPhaseTargetResolver.js`

책임:
- 현재 Phase target 선택
- Shield exposed 여부 확인
- Core/Assembly overlap 확인
- WeakPoint overlap 확인
- ×1.0 / ×1.5 계산

## Step 3 — Contact Edge State
같은 overlap에서 매 tick 피해가 들어가지 않도록 Player별 contact state를 추가한다.

필수 의미:
`outside → inside = HIT`
`inside → inside = NO HIT`
`inside → outside = reset`

## Step 4 — GameSimulation 연결
Rope Impact 처리 인접 단계에서 Boss target impact를 해석한다.

Boss가 inactive/completed면 아무 일도 하지 않는다.

## Step 5 — Breaker World Interact
Breaker 실제 World Object를 만들고:
- interactionRadius 72
- current phase breaker만 enabled
- 기존 Interact로 `interactBossBreaker(playerId, breakerId)` 호출

## Step 6 — Phase Threat Controller
Phase 1/2/3별 Enemy/Wind 활성화를 연결한다.

중요:
기존 `phases[].threats` 문자열만으로 자동 Spawn되지 않으므로 Controller가 실제 Runtime 상태를 소유해야 한다.

## Step 7 — Collapse 연결
Timer 0 뒤 `bossRuntime.snapshot().collapseDistance`를 HeadHouse 상부 폐쇄 구조 시각/충돌 transform과 연결한다.

## Step 8 — 1-8 / Sector transition 연결
1-8 Override 후 즉시 Worker District를 열지 않는다.

`maintenance-override complete → Boss trigger`
`boss victory → Worker District unlock`

## Step 9 — Presentation
- Phase target exposed
- Weak hit
- normal hit
- C-01 shutdown
- Gate open
를 구분.

## Step 10 — Tests
`qa/TEST-PLAN.md` 순서로 검증한다.
