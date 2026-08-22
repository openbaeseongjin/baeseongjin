# Sector 01 Enemy Sprites

- Asset ID: `sector-01-enemies`
- Runtime atlases: animated `pursuit-motion.png` (`128x160`), layered Sentry `sentry-upright-aim.png` (`64x32`), Shield body `shield-body.png` (`128x32`), Shield direction layer `shield-directions.png` (`256x32`), Artillery acquisition motion `artillery-acquisition-motion.png` (`384x32`), Patrol motion/attack `patrol-motion-attack.png` (`128x192`), Support motion `support-motion.png` (`128x64`), and Swarm motion `swarm-motion.png` (`128x96`), all RGBA
- Cell size: transparent `32x32`
- World output: sentry/pursuit/artillery/patrol/support `56x56`, shield `60x60`, swarm member `18x18`
- Selected sources: sentry `06`, pursuit `09`, the polygon Shield redesign, the symmetric acquisition Artillery redesign, the user-selected Patrol, the green-core Support, and Swarm candidate `06` from their authoring folders
- Tool: Codex built-in ImageGen sources, normalized with deterministic Pillow scripts stored in the authoring folders

Enemy manifest v4 keeps every legal `EnemyPresentationState` explicit while representing direct states as Player-compatible `frames + duration + loop` clips. The runtime still uses an enemy-specific manifest, loader, state coverage, aliases, and validator. The legacy `sentry` runtime ID aliases `sentry-t1`. Its optional `upright-aim` layer adds a presentation-only frame over the normal state clip.

Sentry uses column 0 of `sentry-upright-aim.png` as its fixed floor base and column 1 as the complete rotating head, sensor, counterweight, and barrel. The renderer reads server-owned `presentationAimDirection` while idle/acquiring/cooling down and prioritizes gameplay `aimDirection` during track/lock/fire. Right-half aims use the authored frame and left-half aims mirror that frame around the common center before rotating. Local head rotation stays within `-90°..90°`, so the barrel covers 360 degrees without turning the top armor upside down. Missing directions display the neutral right-facing pose. Presentation tracking does not change target locking, projectile direction, collision, or damage; the compact enemy snapshot only replicates the server-derived display direction.

The selected pursuit drone has four frames each for `pursuit-seek`, `pursuit-windup`, `pursuit-dash`, `pursuit-recover`, and `knockback`. Seek loops; windup, dash, recovery, and knockback clamp on their final frame until gameplay selects another presentation state. During windup and dash, the renderer rotates and, for left-half directions, mirrors the existing full frame so its authored front head and sensor point along gameplay `behaviorState.dashDirection`; no replacement image or extra layer is used. Current visual frame sums for windup `0.25s`, dash `0.20s`, and recovery `0.50s` match the present gameplay references, but gameplay remains the only owner of state transition timing. Projectile attack states continue to fall back to the seek clip.

The polygon shield drone uses a four-frame upright `shield-guard` body loop at `140/140/180/140 ms` plus a separate eight-frame physical shield layer ordered `E, SE, S, SW, W, NW, N, NE`. The compact clipped-octagonal body stays upright while only its lower hover cue pulses. The renderer selects the shield-only frame from the existing gameplay `behaviorState.guardDirection`, so the plate follows the same player-facing defense direction without rotating or mirroring the body. `idle`, `knockback`, and projectile attack presentation states explicitly fall back to this guard clip. Frame timing and direction quantization are presentation-only and do not change shield direction authority, blocking, attack timing, collision, or damage.

The Artillery Drone uses one twelve-frame atlas and remains fixed upright without an `aimLayer`. Its three-frame idle pulse gives way to a five-frame symmetric shutter and belly-projector acquisition cue whose `650 ms` total matches the current gameplay telegraph reference. A four-frame `1400 ms` cooldown dims the sensor, retracts the projector and closes the shutters. The cue only communicates that one Player position was captured; the existing circular ground telegraph remains the sole strike-position indicator. Strike timing, damage, collision, AI and network authority remain unchanged.

The Patrol Drone uses a four-frame `patrol-move` loop and authored `acquire`, `track`, `lock`, `fire`, and `cooldown` clips. The renderer derives horizontal facing from the current authored patrol target whenever gameplay aim is absent, so the upright right-facing frames mirror naturally on leftward route segments. `patrol-wait` and `knockback` explicitly fall back to the movement silhouette. The legacy `patrol-drone` ID aliases `patrol-drone-t1`; route, projectile trajectory, attack timing, damage, collision and network authority remain unchanged.

The Support Drone uses four-frame `support-idle` and `support-link` loops. It has no projectile attack presentation states; common `idle` and `knockback` explicitly fall back to `support-idle`. The existing gameplay-owned green link still communicates the selected target. Healing cadence, amount, selection and network state remain unchanged. Other unsupported enemies retain the built-in mock renderer.

The Swarm Drone uses a four-frame `swarm-chase` loop and an eight-frame non-loop `swarm-recoil` clip. The recoil clip starts with the contact compression/body-check cue and continues through the braking recoil within the existing `450 ms` gameplay state. Common `idle` falls back to chase and public `knockback` falls back to the recoil silhouette. Each member renders at `18x18`; the `32x32` cell keeps the violet core at `(13,16)` and the manifest anchor aligns that core with the gameplay position. The single-player monster motion dummy resolves `swarm-drone-t1` through this package, so fixed and automatic state inspection use the production atlas instead of the built-in mock. Contact damage, member count, HP, collision, movement, behavior timing and network authority remain unchanged.

This package contains presentation data only. Collider, hitbox, damage, health, physics, AI, and network authority stay in gameplay code. If this manifest or atlas cannot load, only enemies fall back to the built-in pixel mock.

The normalized atlas lifts shadow values and uses a warm gunmetal rim so the silhouettes stay separate from the blue-black Sector 01 environment. When this package is ready, the renderer does not draw the old mock sensor block or drone silhouette line over it; gameplay telegraphs and health bars remain independent.

Validation status (2026-08-22): manifest v4 validator PASS with eight atlases, seven enemies and 48 presentation states after Swarm integration. The single-player monster motion dummy loaded `swarm-drone-t1` from `sector-01-enemies` without a built-in fallback label and displayed fixed `swarm-chase`, fixed `swarm-recoil`, and automatic state cycling at desktop `1280x720` and mobile landscape `844x390`. The browser reported no warnings or errors.

## Final user approval

사용자 최종 검수로 아래 다섯 Runtime 자산의 이미지와 애니메이션을 완료 처리한다.

- `sentry-t1`: 후보 `06` 기반 고정 베이스와 가장 가까운 Player/발사 방향을 따르는 upright 회전 머리·단일 포신
- `pursuit-drone-t1`: 후보 `09` 기반 기본 이미지와 `pursuit-seek`, `pursuit-windup`, `pursuit-dash`, `pursuit-recover`, `knockback` 각 4프레임
- `patrol-drone-t1`: 좌우 순찰 이동과 `acquire → track → lock → fire → cooldown` 공격 animation
- `support-drone-t1`: upright `support-idle`과 relay가 열리는 `support-link` animation
- `swarm-drone-t1`: 후보 `06` 기반 단독 이미지와 contact cue를 포함한 `swarm-chase`·`swarm-recoil` animation, 몬스터 모션 더미의 정식 package 표시

명시적인 새 사용자 결정 전에는 다섯 자산을 재생성·교체 대상으로 취급하지 않는다. Shield와 Artillery는 현재 로컬 Runtime 검수 후보이며 아직 최종 완료 승인 범위에 포함하지 않는다. 다른 몬스터의 이미지·애니메이션 완료 여부도 이번 승인 범위에 포함하지 않는다.

Validate with:

```sh
npm run validate:enemy-sprite-assets -- assets/runtime/characters/sector-01-enemies
```
