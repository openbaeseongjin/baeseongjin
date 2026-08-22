# Sector 01 Enemy Sprites

- Asset ID: `sector-01-enemies`
- Runtime atlases: animated `pursuit-motion.png` (`128x160`), layered Sentry `sentry-upright-aim.png` (`64x32`), Shield body `shield-body.png` (`128x32`), Shield direction layer `shield-directions.png` (`256x32`), and Artillery acquisition motion `artillery-acquisition-motion.png` (`384x32`), all RGBA
- Cell size: transparent `32x32`
- World output: sentry/pursuit/artillery `56x56`, shield `60x60`
- Selected sources: sentry `06`, pursuit `09`, the polygon Shield redesign, and the symmetric acquisition Artillery redesign from their authoring folders
- Tool: Codex built-in ImageGen sources, normalized with the package-local deterministic Pillow scripts

Enemy manifest v4 keeps every legal `EnemyPresentationState` explicit while representing direct states as Player-compatible `frames + duration + loop` clips. The runtime still uses an enemy-specific manifest, loader, state coverage, aliases, and validator. The legacy `sentry` runtime ID aliases `sentry-t1`. Its optional `upright-aim` layer adds a presentation-only frame over the normal state clip.

Sentry uses column 0 of `sentry-upright-aim.png` as its fixed floor base and column 1 as the complete rotating head, sensor, counterweight, and barrel. The renderer reads server-owned `presentationAimDirection` while idle/acquiring/cooling down and prioritizes gameplay `aimDirection` during track/lock/fire. Right-half aims use the authored frame and left-half aims mirror that frame around the common center before rotating. Local head rotation stays within `-90°..90°`, so the barrel covers 360 degrees without turning the top armor upside down. Missing directions display the neutral right-facing pose. Presentation tracking does not change target locking, projectile direction, collision, or damage; the compact enemy snapshot only replicates the server-derived display direction.

The selected pursuit drone has four frames each for `pursuit-seek`, `pursuit-windup`, `pursuit-dash`, `pursuit-recover`, and `knockback`. Seek loops; windup, dash, recovery, and knockback clamp on their final frame until gameplay selects another presentation state. During windup and dash, the renderer rotates and, for left-half directions, mirrors the existing full frame so its authored front head and sensor point along gameplay `behaviorState.dashDirection`; no replacement image or extra layer is used. Current visual frame sums for windup `0.25s`, dash `0.20s`, and recovery `0.50s` match the present gameplay references, but gameplay remains the only owner of state transition timing. Projectile attack states continue to fall back to the seek clip.

The polygon shield drone uses a four-frame upright `shield-guard` body loop at `140/140/180/140 ms` plus a separate eight-frame physical shield layer ordered `E, SE, S, SW, W, NW, N, NE`. The compact clipped-octagonal body stays upright while only its lower hover cue pulses. The renderer selects the shield-only frame from the existing gameplay `behaviorState.guardDirection`, so the plate follows the same player-facing defense direction without rotating or mirroring the body. `idle`, `knockback`, and projectile attack presentation states explicitly fall back to this guard clip. Frame timing and direction quantization are presentation-only and do not change shield direction authority, blocking, attack timing, collision, or damage.

The Artillery Drone uses one twelve-frame atlas and remains fixed upright without an `aimLayer`. Its three-frame idle pulse gives way to a five-frame symmetric shutter and belly-projector acquisition cue whose `650 ms` total matches the current gameplay telegraph reference. A four-frame `1400 ms` cooldown dims the sensor, retracts the projector and closes the shutters. The cue only communicates that one Player position was captured; the existing circular ground telegraph remains the sole strike-position indicator. Strike timing, damage, collision, AI and network authority remain unchanged. Other unsupported enemies retain the built-in mock renderer.

This package contains presentation data only. Collider, hitbox, damage, health, physics, AI, and network authority stay in gameplay code. If this manifest or atlas cannot load, only enemies fall back to the built-in pixel mock.

The normalized atlas lifts shadow values and uses a warm gunmetal rim so the silhouettes stay separate from the blue-black Sector 01 environment. When this package is ready, the renderer does not draw the old mock sensor block or drone silhouette line over it; gameplay telegraphs and health bars remain independent.

Validation status (2026-08-22): manifest v4 validator PASS with five atlases, four enemies and 31 presentation states after the Artillery acquisition replacement. Direct `seed=1` Stage 1-8 review at desktop `1280x720` displayed the production Artillery frame without the removed rotating optic or fallback mock; mobile-landscape `844x390` startup and package loading also completed without browser warnings or errors. Direct mobile traversal to the Artillery encounter and final user play approval remain pending, so Shield and Artillery stay local Runtime review candidates.

## Final user approval

2026-08-20 사용자 최종 검수로 아래 두 Runtime 자산의 이미지와 애니메이션을 완료 처리한다.

- `sentry-t1`: 후보 `06` 기반 고정 베이스와 가장 가까운 Player/발사 방향을 따르는 upright 회전 머리·단일 포신
- `pursuit-drone-t1`: 후보 `09` 기반 기본 이미지와 `pursuit-seek`, `pursuit-windup`, `pursuit-dash`, `pursuit-recover`, `knockback` 각 4프레임

명시적인 새 사용자 결정 전에는 두 자산을 재생성·교체 대상으로 취급하지 않는다. Shield와 Artillery는 현재 로컬 Runtime 검수 후보이며 아직 최종 완료 승인 범위에 포함하지 않는다. 다른 몬스터의 이미지·애니메이션 완료 여부도 이번 승인 범위에 포함하지 않는다.

Validate with:

```sh
npm run validate:enemy-sprite-assets -- assets/runtime/characters/sector-01-enemies
```
