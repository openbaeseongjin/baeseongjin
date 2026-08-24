# Continuity Warden Phase 1 runtime package

상태: `LOCAL RUNTIME INTEGRATED / BOSS-SPECIFIC VALIDATOR NOT AVAILABLE / FULL PLAYTEST PENDING`

Boss06 `CONTINUITY WARDEN`의 사용자 승인 64×96 logical pixel motion을 정확한 2× PNG atlas로 정규화한 로컬 런타임 package다. 원본과 제작 기록은 [`../../../artwork/characters/continuity-warden-animation-set-v1/`](../../../artwork/characters/continuity-warden-animation-set-v1/)이 소유한다.

- Asset ID: `continuity-warden-phase-1`
- Source: 수작업 direct-pixel RGBA PNG
- Runtime atlas cell: `128×192`
- World output: `128×192`
- Anchor: `(0.5, 113/192)`; 기존 96×150 Boss collider의 발 접점과 분리
- Facing: 원본 우향, 좌향은 renderer `flipX`
- License: 저장소 내부 직접 제작물; 외부 reference provenance는 authoring README 상태를 따른다.

## Runtime 연결

- Definition: `src/render/boss/ContinuityWardenSpriteCatalog.js`
- Presentation FSM: `src/render/boss/ContinuityWardenAnimationController.js`
- Renderer/fallback: `src/render/boss/ContinuityWardenSpriteObjectRenderer.js`
- Resource owner: `SpriteSceneResourceBundle`; 일반 gameplay은 시작 Area 이후 background prepare, Boss06 Gameplay View는 첫 프레임 전 prepare

지원 상태는 `neutral`, `baton-1`, `baton-2`, `overhead-slam`, `back-swing`, `guard`, `counter-ready`, `counter-bash`, `ground-thruster-dash`, `diagonal-thruster-dash`, `charge`, `security-command`, `security-active`, `defeated`다. Guard 종료는 renderer-local `guard-exit`, Charge 종료는 `charge-exit`, 나머지 공격 종료는 `neutral-recovery`로 재생한다.

`boss-damaged`와 `boss-guard-blocked`를 presentation event로 전달해 `hit-front`/`hit-back`과 `guard-block`을 재생하고, 방향 label 변화는 `turn`을 재생한다. `defeated`는 표시 전용 `defeatStage`로 `defeated-baton-drop` → `defeated-shield-fall` → `defeated-unconscious`를 선택하고 후속 Gate/Shuttle 단계에서는 마지막 unconscious frame을 유지한다. animation state와 frame index는 gameplay/network snapshot에 추가하지 않는다.

짧은 `ground-thruster-dash`는 기존 6프레임을 한 번 재생한다. 긴 `charge`는 같은 8프레임 atlas를 `charge-telegraph(0~1)`, `charge-sustain(2~5)`, `charge-exit(6~7)`로 나누고 gameplay `actionState`가 `active`인 동안 sustain 구간만 반복한다. 따라서 실제 이동 시간이 clip 길이보다 길어도 skid·회복 자세를 선행 재생하지 않는다.

## VFX 경계

전용 effects manifest·loader·validator가 없으므로 VFX PNG를 이 character package에 합치지 않는다. `continuity-warden-combat-vfx-v2`는 Boss hazard renderer가 판정 bounds 안에 고정 pixel range image를 먼저 그리고 기존 procedural Canvas particle을 추가 효과로 합성한다. 근접 active는 큰 계단형 amber/pink/white 충격봉 궤적, Security Beam active는 전 폭을 잇는 pink band와 white core를 사용한다. 실제 `boss-player-hit`에서는 근접 shard 또는 beam streak impact를 한 번 생성한다. 판정 bounds·피해·수명·Boss FSM·network payload는 기존 gameplay가 계속 소유하고 고정 range image와 telegraph 경계는 particle cap과 관계없이 유지한다.

- Runtime feedback: `src/game/combat/ContinuityWardenCombatFeedback*.js`
- Preset owner: `src/game/combat/ParticlePresentation.js`
- Tool/source: `continuity-warden-phase-1-vfx` direct-pixel authoring 후보를 기준으로 한 procedural Canvas pixel image + particle preset; 별도 Runtime PNG·외부 원본 없음
- License: 저장소 내부 직접 제작물

## 검증

- 모든 atlas는 투명 PNG이며 셀 높이 `192px`, 셀 너비 `128px × frame count`다.
- 로딩 실패와 미지원 상태는 Boss Polygon renderer로 독립 복구한다.
- 2026-08-24 `ContinuityWardenSpriteDefinition`의 22 atlas 실제 PNG header와 선언 크기, charge phase 분할을 포함한 24 clip frame coverage를 대조해 통과했다.
- 신규 7 clip 31개 logical frame은 64×96 RGBA·binary alpha·승인 palette subset이며, 128×192 개별 frame과 atlas는 exact nearest-neighbor 2×, authoring/runtime atlas는 byte-identical임을 확인했다.
- 사건 반응과 패배 단계의 presentation FSM 선택을 독립 실행해 `hit-front`·`hit-back`·`guard-block`과 3단계 defeated atlas 선택을 확인했다.
- `npm run check`, `npm run format:check`, `git diff --check`, 종료 시 `npm run check:scenario-integration`을 통과했다.
- Map Editor `boss-06` production Gameplay View는 Sector06 환경과 Warden atlas를 첫 프레임 전에 준비한 뒤 active encounter를 시작한다. 2026-08-24 실제 브라우저에서 Player·Boss HUD·Arena 지형·Warden pixel sprite가 함께 표시되고 console error/warning이 없음을 확인했다.
- Boss 전용 공개 manifest·schema·validator가 없으므로 이 package를 `runtime-ready`로 부르지 않는다.
