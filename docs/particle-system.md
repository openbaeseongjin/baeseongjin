# 파티클 시스템

`src/game/combat/ParticlePresentation.js`는 Canvas 로컬 표현용 재사용 파티클 계약을 소유한다. 파티클은 gameplay·충돌·네트워크 객체가 아니며, `ClientCombatFeedback` facade와 factory가 조합한 구체 feedback 객체가 기존 사건과 복제 상태를 DTO로 바꿔 Polygon/Sprite 공통 `CombatEffectRenderer`에 전달한다.

## 조합 계약

- emission: `burst`, `stream`, `attached`, `area`
- motion: `ballistic`, `directional`, `converge`, `orbit`, `drift`
- shape: `dot`, `shard`, `streak`
- preset과 nested palette는 모두 immutable이며 count/density, size, speed/spread, gravity/drag, lifetime/fade, opacity와 glow만 정의한다.

Renderer는 effect/enemy ID를 해석하지 않고 particle DTO의 `shape`와 `material`만 그린다. 새 효과는 먼저 preset 조합으로 추가하며, 둘 이상의 효과가 필요로 하는 kernel이 없을 때만 core를 확장한다.

## Trigger matrix와 멀티플레이

| 표현                                                          | 기존 입력                                                                                                          | local preset 의미                                                                 |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| 에너지 공·물리 대시·메테오·기동 증폭                          | predicted/shared `spell-cast-started`와 `spellId`                                                                  | shot stream, dash streak, meteor impact, mobility orbit                           |
| 피해 반사·Rope impact/cut·증강 impact·Player hit·Enemy defeat | 기존 resolve/impact의 effect·source·resolution                                                                     | reflect stream, cut streak, danger/defeat shard                                   |
| Sentry·Patrol                                                 | `track/lock`, aim direction, enemy projectile DTO                                                                  | 낮은 밀도 aim 축적, muzzle, flight trail, impact                                  |
| Pursuit·Shield·Artillery·Support·Swarm                        | behavior state의 `dashDirection`, `guardDirection`, `targetPosition + strikeRadius`, `targetId`, `recoilDirection` | converge/dash, guard flow/block, warning/strike impact, link stream, chase/recoil |
| Boss06 Warden 근접·Security Beam                              | 복제 `bossStage.presentation.objects`의 active hazard bounds와 `boss-player-hit` 사건                              | 고정 pixel range image + amber/pink area streak + 종류별 hit burst                |
| Wind source                                                   | 복제 `multiplier + phase`, zone bounds/direction                                                                   | warning/active/decay 밀도의 area drift                                            |
| Rope launch/flight/attach/tension/swing/release/miss          | Player `launcher`, `rope`, `control.swingDrag`의 이전/현재 detached sample                                         | launch burst, sparse tip trail, anchor pulse, tension flow, release/dissipate     |
| Player high-speed/positive impulse                            | Player velocity와 새 `ownerMotionTick` 또는 presentation sample                                                    | low-priority rear streak, one-shot impulse burst                                  |

Player가 실제 피해를 받은 `resolve`·낙하·Boss hazard·Enemy behavior 사건은 viewer 개인 hit shake를 최대 duration/strength로 합성한다. Artillery의 직접 영역 피격은 같은 사건에서 `artillery-strike` impact particle과 기존 `gameplay-player-hit` cue를 생성하며 particle·shake 상태를 network snapshot에 추가하지 않는다.

마법 one-shot은 완성된 spell command가 만든 predicted/shared `spell-cast-started`를 stable activation ID로 한 번만 재생한다. 클릭 토큰과 파티클 상태는 네트워크 snapshot에 넣지 않는다.

- Sentry/Patrol을 포함한 Enemy 상태는 상위 `EnemyFeedbackState.project()`가 definition predicate와 request 생성을 공통 처리하고 구체 상태 class는 `EnemyFeedbackDefinition`을 생성자로 받는다. Wind와 Projectile도 `ClientFeedbackObjectDefinition`을 사용하며 Wind phase별 density는 frozen object의 `WIND_PHASE → resolver` key-value로 선택한다. type·state·preset·emitter key raw 문자열과 재사용 수치는 definition에만 두고 기본 수치는 default parameter가 소유한다. `CombatEffectBuffer`는 effect collection, `ContinuousFeedbackEmitter`는 emitter cadence의 단일 쓰기 주체다. 실행 class에서 문자열을 조립하거나 `startsWith()`로 type을 추론하거나 raw 수치를 전달하지 않는다. `EnemyCombatFeedback`은 상태 class 순회만, `ClientCombatFeedback`은 factory가 만든 객체의 공통 호출 순서만 조정하며 renderer는 enemy/action/effect ID를 알지 않는다.
- one-shot은 `ClientFeedbackEventInterpreter`가 enum/definition predicate로 spell, spawn, resolve와 impact 사건을 해석하고 stable causal ID를 소비한다. facade는 event type을 분기하지 않으며 소유자의 predicted ID와 공유 receipt/event ID는 기존 authority dedupe가 한 번만 전달한다. tick별 particle event를 보내지 않는다.
- shared particle은 모든 viewer가 보며, player-hit/rope-cut 같은 개인 강조는 event definition의 `personalViewerId` predicate가 현재 viewer와 일치할 때만 생성한다. ephemeral event용 `SimulationDrivenObject`나 one-use capability는 두지 않는다.
- snapshot envelope, claim, projectile snapshot에는 particle 배열·위치·난수·수명을 넣지 않는다.
- Boss06 danger rectangle 위에는 particle cap과 무관한 고정 pixel range image를 먼저 그린다. 근접 active는 판정 bounds 안의 큰 계단형 amber/pink/white 충격봉 궤적, Security Beam active는 전 폭을 잇는 pink band·white core image를 사용한다. `ContinuityWardenCombatFeedback`의 구체 melee/beam 상태는 같은 `active + damaging` bounds에서 low-priority area particle을 추가하고, 실제 `boss-player-hit` causal event가 피격 위치의 one-shot impact를 소유한다. telegraph·hitbox·피해·지속시간·Boss FSM·network payload는 VFX가 변경하지 않는다.
- Rope와 Player motion은 별도 구체 객체 `RopeCombatFeedback`·`PlayerCombatFeedback`의 상태 class를 `PlayerRopeCombatFeedback`이 순서 조합하고, Has-A `PlayerRopeFeedbackLifecycle`의 Player ID별 bounded previous-state를 공용으로 사용한다. lifecycle은 previous/suppression Map의 단일 쓰기 주체다. 첫 sample은 baseline만 기록하며 같은 remote `ownerMotionTick`을 반복 수신해도 acceleration one-shot을 다시 만들지 않는다.
- Rope launch/attach/swing/release/miss는 state edge에서 한 번만, tension/flight/body streak는 low-priority continuous emitter에서만 만든다. rope-cut·impact·respawn처럼 stable causal event가 이미 있는 detach는 generic release/dissipate를 억제한다. `attachmentCandidate`, idle·저속 이동, ordinary jump와 ordinary deceleration은 particle source가 아니다.
- `release-propulsion`은 release/body impulse의 strength만 높이고, `electrified-rope`는 tension material을 override하며 실제 contact event에만 pulse를 더한다. `fast-launch`/`long-rope`/`fast-recover`는 실제 launcher timing·distance·cooldown을 그대로 소비한다. base와 Augment full-density emitter를 중복하지 않는다.

상태이상 파티클은 actor가 자기 공통 render state로 `CombatStatusEffectPool.draw()`를 호출하고, 활성 `ElectrifiedStatusEffect`·`IgnitedStatusEffect`·`FrozenStatusEffect`가 자기 spec으로 particle 객체를 생성한다. Player·Enemy·Boss renderer는 상태 종류를 분기하지 않는다.

## 예산과 시각 기준

active particle 상한은 192개, emitter별 신규 예산은 24개다. cap은 `particle` DTO만 세며 48개 high-priority headroom을 남겨 continuous 저우선 밀도를 먼저 줄인다. ring/text, actor, Rope, Anchor와 danger line/arc/area는 어떤 cap에서도 삭제하지 않는다. fixed update가 현재 `visibleWorldBounds`를 사건과 continuous emitter 모두에 전달한다. area source는 zone bounds가 viewport와 교차할 때만, 다른 source는 위치가 visible일 때만 방출한다. `burst`는 source, `stream`은 source-target 구간, `attached`는 source 반경, `area`는 bounds에서 생성하며 motion도 각각 방향·탄도·수렴·궤도·drift로 진행한다.

새 효과는 기존 preset의 숫자·palette·emission/motion/shape 조합부터 추가한다. 이것으로 표현할 수 없고 둘 이상의 효과가 필요할 때만 kernel과 이 문서의 trigger matrix를 함께 확장한다. 연기·안개·terrain bounce·settle·조명·후처리는 범위 밖이다. 기본 언어는 짧은 shard/streak와 투명한 fade이며 enemy danger는 red/orange, Shield blue, Support green, Swarm purple, Player/Rope cyan/yellow를 유지한다.

이 기반은 procedural Canvas DTO이므로 PNG·atlas·sprite manifest를 추가하거나 기존 asset schema를 바꾸지 않는다. 정식 VFX 자산이 생기더라도 gameplay trigger와 network authority는 이 문서의 local preset 경계를 유지하고, 자산 교환 규격은 별도 effects runtime 계약이 생긴 뒤 `graphics-asset-guide.md`에서 정의한다.
