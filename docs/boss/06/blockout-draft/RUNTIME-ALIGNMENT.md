# BOSS 06 RUNTIME ALIGNMENT — DRAFT 02

> 기준: GitHub main `20e6c22deb6e95d9a5a7e351a95874d931a0a845`
> 상태: **DESIGN ALIGNED / RUNTIME EXTENSIONS REQUIRED**

## 1. 기존 기능 그대로 사용

### Boss Encounter infrastructure

최신 main은 `BossEncounterRuntimeFactory`와 `CompositeBossEncounterRuntime`을 이미 갖는다.

Boss06는 아래 공용 계약을 재사용한다.

- participant 1..4 snapshot
- late join without rescale
- wipe/retry
- spectator state / victory recovery
- processed impact / hazard-contact de-duplication
- snapshot/restore
- event emission

### Custom Runtime hooks

Boss04/05가 이미 사용 중인 다음 hook을 그대로 사용한다.

- `impactTargetSnapshot(targetId, worldOffset)`
- `presentationObjects(worldOffset)`
- `activeHazards(worldOffset)`
- `dynamicCollisionSurfaces(worldOffset)` — 필요 시
- `recoverPlayer(playerId, worldOffset)`
- `respawnPosition(worldOffset)`

Boss06 Baton/Shield/Thruster/Beam은 legacy 단일 hazard kind를 억지로 확장하기보다 `activeHazards()` 기반 custom encounter path를 우선한다.

### Boss Rope anchors

최신 main은 `role: "swing-attack"` Boss anchor를 자동으로 24×24 `grapple-target` surface로 materialize한다.

따라서 U1~U8은 새 grapple 시스템을 만들지 않고 이 계약을 사용한다.

## 2. 기존 기능 확장

### A. Boss Stage Spec

Player에게는 Phase가 없는 한 개 HP Bar를 유지한다.

Boss06는 별도 weakpoint object를 만들지 않는다.
`boss-06:continuity-warden:body` 하나만 ImpactTarget으로 등록하고, validator의 vulnerability 계약은 `always-active` body semantic으로 확장한다.
dummy weakpoint를 Warden 내부에 만들어 validator만 통과시키는 방식은 금지한다.

권장 최소 확장:
- authoring 내부는 **1 combat segment**
- 새 target: `boss-06:continuity-warden:body`
- 새 vulnerability semantic: `always-active`
- `hud.phaseLabel: ""`
- `healthBar.showPhaseBreaks: false`
- `phaseMarkerCount: 0`
- `showVulnerabilityCountdown: false`
- `vulnerabilityLabel: ""`

기존 Boss01/02 weakpoint를 가짜로 재사용하지 않는다.

### B. Boss Impact Adapter

공통 `ImpactTarget.resolve()`에는 impact position이 존재하지만 현재 `GameSimulation.#applyRegisteredBossImpact()`가 custom Boss `applyImpact()`으로 넘길 때 position을 보존하지 않는다.

Boss06 Guard/Counter에는 다음이 필요하다.

```text
Warden facing
+ impact/source position
→ FRONT / REAR classification
```

따라서 common Boss impact call에 `impactPosition` 또는 equivalent source geometry를 전달하도록 확장한다.

### C. Terminal Boss Stage

최신 main은 route-lock 없는 Boss stage도 source+target landmark가 모두 존재하면 assembly 가능하다.

Boss06는 `6-8` 이후 target regular landmark가 없으므로 여전히 terminal 전용 계약이 필요하다.

```text
6-8 content boundary
→ Boss06 arena
→ Boss06 completed
→ arena 유지
→ victory presentation
→ boarding
→ beginCompletion()
```

Regular `6-9`를 만들지 않는다.

### D. Camera / Presentation

현재 generic화가 일부 진행되었지만 Warden kind는 focus 대상이 아니다.

필요:
- Warden을 Boss camera focus 대상으로 추가하거나 generic `bossFocus` contract 도입
- Victory authored shot:
  `Gate lights → Gate open → bridge → camera pan → Shuttle`
- 이후 player-control restore

## 3. 보스 전용 신규 기능

### `ContinuityWardenRuntime`

Physics hard guard:
- solid collider <= `96×150`
- `canGroundActors:false`
- `ropeAttachment:false`
- Shield/Baton/Beam은 hazard/presentation이며 solid body geometry가 아님

권장:
`ContinuityWardenRuntime extends CompositeBossEncounterRuntime`

Pattern state family:

```text
neutral
baton-1
baton-2
overhead-slam
back-swing
ground-thruster-dash
diagonal-thruster-dash
charge-telegraph
charge-active
charge-recovery
guard
counter-ready
counter-bash
security-command
security-active
defeated
```

Rope AI, Grapple pathfinding, teleport는 구현하지 않는다.

### Pattern selection

명시적 Phase 대신 HP ratio/최근 행동/Player relative position으로 pattern weight만 바뀐다.

- early: direct-human combat weight 높음
- mid: Security + 2-chain 증가
- late: Security 빈도 + 제한적 3-chain 증가
- new move 없음

### Direct target

multiplayer 초안:
- Main combat zone nearest active player
- Charge는 telegraph 시 target/direction lock
- commit 후 retarget 금지
- recovery lane player는 direct target 후보에서 제외

## 4. Defense contract

### Normal

- Warden body target active
- normal hit accepted

### GUARD

- frontal hit = damage 0
- rear hit = normal damage
- Shield auto-rotate 없음

### COUNTER READY

- frontal impact = damage negate + `counter-bash`
- no valid hit = timeout → neutral

Guard/Counter는 weakpoint open/close가 아니라 **impact direction response**다.

## 5. Hazard contract

`activeHazards()`를 사용해 상태별 한 개 이상의 bounds/collider를 반환한다.

Boss06 디자인상:
- direct attack 중 Security Beam OFF
- Security active 중 Warden direct attack OFF
- Beam sequence도 한 순간에는 한 height band만 damaging

따라서 multi-hazard 동시 난사 기능이 필요하지 않다. 최신 main의 composite hazard infrastructure는 그대로 재사용 가능하다.

Hazard family 예:
- `warden-baton`
- `warden-overhead`
- `warden-back-swing`
- `warden-thruster`
- `warden-charge`
- `warden-counter-bash`
- `security-beam-low`
- `security-beam-high`

정확한 ID는 구현 naming convention에 맞춰 lock한다.

## 6. Recovery contract

- R1/R3 실제 catch deck
- R1/R3 miss 시 Runtime recovery fallback
- RR1/RR3 actual swing-attack anchor를 사용하고, 더 아래 추락은 recoverPlayer()로 복구
- Arena bounds 아래까지 추가 추락 시 기존 custom `recoverPlayer()` hook을 최후 fallback으로 사용

Recovery에서 Warden direct target 제외.

## 7. Victory / Ending

Boss HP 0:
- state `defeated`
- Warden unconscious
- hazards OFF
- Gate lights ON
- Gate OPEN
- 180px Threshold Bridge active
- camera pan
- Shuttle spawn/reveal presentation
- control restore
- boarding interaction
- `beginCompletion()`

Boss defeat 순간 자동 completion으로 넘어가지 않는다.

## 8. 구현 분류

### 기존 기능 그대로 사용
- Composite Boss participant/retry/snapshot
- ImpactTarget registry
- custom activeHazards
- custom recoverPlayer
- swing-attack anchor materialization
- Kinematic physics primitives
- beginCompletion

### 기존 기능 확장
- impact position 전달
- Boss06 body vulnerability semantic
- Warden camera focus
- terminal Boss transition/boarding completion
- victory presentation

### 보스 전용 신규 기능
- ContinuityWardenRuntime
- Warden pattern selector
- Shield/Counter response
- Baton/Thruster/Charge state logic
- Security Beam sequence
- Warden renderer states

### 신규 범용 시스템
- **현재 필수 없음**

## 9. 구현 순서

### 최우선
1. terminal Boss stage construction / completion path
2. Boss06 spec target + one-segment HUD semantic
3. `ContinuityWardenRuntime` skeleton
4. body hit + Guard/Counter impact direction
5. Baton / Thruster / Charge
6. LOW/HIGH Beam sequence

### 중요
7. multiplayer deterministic targeting
8. Warden renderer/readability
9. camera + Gate/Bridge/Shuttle victory presentation
10. Recovery live playtest

### 후순위
11. exact HP/damage/timing tuning
12. VFX/audio
13. dialogue localization polish


## 10. Map Collision Hard Contract

- Main: one flat rectangle, grappleable false
- Ledge L/R: collision true, grappleable false
- U1~U8: swing-attack anchors
- RR1/RR3: swing-attack recovery anchors
- Emitter: collision false, grappleable false, ropeOccluder false
- Beam: `activeHazards()` only
- Gate: Main lane 밖 combat-time blocker
- Warden: dynamic body, not grapple target, not ground surface

Map Editor Gameplay View를 저장 적용 전 필수 Gate로 사용한다.
