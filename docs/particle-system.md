# 파티클 시스템

`src/game/combat/ParticlePresentation.js`는 Canvas 로컬 표현용 재사용 파티클 계약을 소유한다. 파티클은 gameplay·충돌·네트워크 객체가 아니며, `ClientCombatFeedback`이 기존 사건과 복제 상태를 DTO로 바꿔 Polygon/Sprite 공통 `CombatEffectRenderer`에 전달한다.

## 조합 계약

- emission: `burst`, `stream`, `attached`, `area`
- motion: `ballistic`, `directional`, `converge`, `orbit`, `drift`
- shape: `dot`, `shard`, `streak`
- preset과 nested palette는 모두 immutable이며 count/density, size, speed/spread, gravity/drag, lifetime/fade, opacity와 glow만 정의한다.

Renderer는 effect/enemy ID를 해석하지 않고 particle DTO의 `shape`와 `material`만 그린다. 새 효과는 먼저 preset 조합으로 추가하며, 둘 이상의 효과가 필요로 하는 kernel이 없을 때만 core를 확장한다.

## Trigger matrix와 멀티플레이

| 표현                                                          | 기존 입력                                                                                                        | local preset 의미                                                        |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 기본 주먹·방향 대시·돌진 타격·순간 방어                       | predicted/shared action과 `actionId`                                                                             | punch shard, dash streak, guard orbit                                    |
| 직선 사격                                                     | action start, action projectile DTO, `augment-shot-ended`                                                        | muzzle, flight trail, end impact                                         |
| 피해 반사·Rope impact/cut·증강 impact·Player hit·Enemy defeat | 기존 resolve/impact의 effect·source·resolution                                                                   | reflect stream, cut streak, danger/defeat shard                          |
| Sentry·Patrol                                                 | `track/lock`, aim direction, enemy projectile DTO                                                                | 낮은 밀도 aim 축적, muzzle, flight trail, impact                         |
| Pursuit·Shield·Artillery·Support·Swarm                        | behavior state의 `dashDirection`, `guardDirection`, `targetPosition + strikeRadius`, `targetId`, `diveDirection` | converge/dash, guard flow/block, warning/strike, link stream, orbit/dive |
| Wind source                                                   | 복제 `multiplier + phase`, zone bounds/direction                                                                 | warning/active/decay 밀도의 area drift                                   |

원격 Player의 별도 action event가 없는 경우에는 `playerId + actionSequence`와 `control.aimWorld`를 관찰한다. 첫 sequence는 baseline으로 기록만 하고 증가한 sequence만 한 번 재생한다. owner는 predicted action event가 우선이므로 자기 snapshot action one-shot을 만들지 않으며, duration이 있는 action의 trail/guard flow만 `activeAction.activationId` emitter로 유지한다.

- Sentry/Patrol을 포함한 공통 발사 상태와 모든 projectile trail은 구체 renderer가 아니라 `ClientCombatFeedback`의 상태→preset projection에서 결정한다. renderer는 enemy/action/effect ID를 알지 않는다.
- one-shot은 기존 action, `spawn`, `predicted-spawn`, `resolve`, `predicted-resolve`와 impact 사건의 stable causal ID를 소비한다. 소유자의 predicted ID와 공유 receipt/event ID는 기존 authority dedupe가 한 번만 전달한다. tick별 particle event를 보내지 않는다.
- shared particle은 모든 viewer가 보며, player-hit/rope-cut 같은 개인 강조는 기존 `ClientFeedbackEventObject` personal capability를 유지한다.
- snapshot envelope, claim, projectile snapshot에는 particle 배열·위치·난수·수명을 넣지 않는다.

## 예산과 시각 기준

active particle 상한은 192개, emitter별 신규 예산은 24개다. cap은 `particle` DTO만 세며 48개 high-priority headroom을 남겨 continuous 저우선 밀도를 먼저 줄인다. ring/text, actor, Rope, Anchor와 danger line/arc/area는 어떤 cap에서도 삭제하지 않는다. fixed update가 현재 `visibleWorldBounds`를 사건과 continuous emitter 모두에 전달한다. area source는 zone bounds가 viewport와 교차할 때만, 다른 source는 위치가 visible일 때만 방출한다. `burst`는 source, `stream`은 source-target 구간, `attached`는 source 반경, `area`는 bounds에서 생성하며 motion도 각각 방향·탄도·수렴·궤도·drift로 진행한다.

새 효과는 기존 preset의 숫자·palette·emission/motion/shape 조합부터 추가한다. 이것으로 표현할 수 없고 둘 이상의 효과가 필요할 때만 kernel과 이 문서의 trigger matrix를 함께 확장한다. 연기·안개·terrain bounce·settle·조명·후처리는 범위 밖이다. 기본 언어는 짧은 shard/streak와 투명한 fade이며 enemy danger는 red/orange, Shield blue, Support green, Swarm purple, Player/Rope cyan/yellow를 유지한다.

이 기반은 procedural Canvas DTO이므로 PNG·atlas·sprite manifest를 추가하거나 기존 asset schema를 바꾸지 않는다. 정식 VFX 자산이 생기더라도 gameplay trigger와 network authority는 이 문서의 local preset 경계를 유지하고, 자산 교환 규격은 별도 effects runtime 계약이 생긴 뒤 `graphics-asset-guide.md`에서 정의한다.
