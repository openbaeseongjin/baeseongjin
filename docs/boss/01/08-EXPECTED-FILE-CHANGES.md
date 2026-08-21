# 예상 변경 파일

## 수정 가능성이 높은 기존 파일
- `src/game/boss/Boss01Definition.js`
- `src/game/simulation/GameSimulation.js`
- Sector01→Sector02 transition owner
- Boss presentation/event consumer

## 신규 권장 파일
- `src/game/boss/Boss01ArenaDefinition.js`
- `src/game/boss/BossPhaseTargetResolver.js`
- `src/game/boss/BossTargetContactState.js`
- 필요 시 `src/game/boss/Boss01ArenaController.js`

## 테스트
현재 저장소 테스트 구조에 맞춰 다음 성격의 테스트 추가:
- Boss definition validation
- weak point multiplier
- contact edge single-hit
- phase target switching
- breaker current-phase enforcement
- collapse transform mapping
- boss victory route unlock
- snapshot/restore
- multiplayer two-player independent contact state

## 건드리지 않는 편이 좋은 파일
- 일반 Enemy damage resolver를 Boss용으로 과도하게 확장
- RopeImpactAttack의 일반 Enemy semantics
- Player input schema
