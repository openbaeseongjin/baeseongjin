# BOSS 01 REV2.1 테스트 계획

## A. 정적 데이터

### A1. Route
- 모든 adjacent <400
- max = 366.19
- 모든 non-adjacent >400
- expected skip count = 0

### A2. Breakers
- 3개
- ID가 기존 BOSS_01_DEFINITION breakerIds와 정확히 동일
- interactionRadius 72
- current phase breaker만 accepted

### A3. Target
- Phase당 하나
- assembly radius 64
- weak radius 24 → 22 → 20
- multiplier 1.5

## B. Boss Damage

### B1. Shield closed
결과: damage 0

### B2. Exposed + normal assembly
결과: ×1.0

### B3. Exposed + weak point
결과: ×1.5

### B4. 800px/s weak
기대: 약 120 → Phase HP 120 clear

### B5. phase floor
150 이상 damage가 들어와도 다음 Phase HP까지 깎이지 않음

## C. Contact edge
- outside→inside: 1 hit
- inside→inside: 0 additional
- inside→outside→inside: next hit
- Player A inside 상태가 Player B 진입을 막지 않음

## D. Breaker/Exposure
- 잘못된 breaker reject
- current breaker accept
- exposed 8초
- timeout 후 closed
- phase 미완료면 같은 breaker 재사용 가능
- phase 완료 후 next breaker로 변경

## E. Threat
Phase 1:
- Sentry 1
- Wind 0

Phase 2:
- Sentry 1
- Pulse Wind 1

Phase 3:
- Emitter 2
- alternating only
- simultaneous crossfire = FAIL
- Pulse Wind 1

## F. Collapse
- timer 210→0
- collapseActive true
- collapseDistance increases at 80px/s
- World Gate Crown transform matches snapshot

## G. Progress
- 1-8 Override alone does NOT unlock Worker District
- Boss completion creates/completes victory progress
- victory unlocks Sector 02 route
- snapshot/restore after phase 2 restores correct target/breaker/exposure state

## H. Playtest
- First 2:40–3:40
- Skilled 1:25–2:05
- normal miss recovery 4–6s
- weak point readable at gameplay camera scale
- Wind-assisted phase 2 feels useful, not mandatory RNG
