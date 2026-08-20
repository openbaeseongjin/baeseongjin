# Sector 01 Enemy Sprites

- Asset ID: `sector-01-enemies`
- Runtime atlases: animated `pursuit-motion.png` (`128x160`) and layered Sentry `sentry-upright-aim.png` (`64x32`), both RGBA
- Cell size: transparent `32x32`
- World output: sentry/pursuit `56x56`
- Selected sources: sentry `06` and pursuit `09` from their `*-lowres-exploration/` authoring folders
- Tool: Codex built-in ImageGen sources, normalized with the package-local deterministic Pillow scripts

Enemy manifest v3 keeps every legal `EnemyPresentationState` explicit while representing direct states as Player-compatible `frames + duration + loop` clips. The runtime still uses an enemy-specific manifest, loader, state coverage, aliases, and validator. The legacy `sentry` runtime ID aliases `sentry-t1`. Its optional `upright-aim` layer adds a presentation-only frame over the normal state clip.

Sentry uses column 0 of `sentry-upright-aim.png` as its fixed floor base and column 1 as the complete rotating head, sensor, counterweight, and barrel. The renderer reads server-owned `presentationAimDirection` while idle/acquiring/cooling down and prioritizes gameplay `aimDirection` during track/lock/fire. Right-half aims use the authored frame and left-half aims mirror that frame around the common center before rotating. Local head rotation stays within `-90°..90°`, so the barrel covers 360 degrees without turning the top armor upside down. Missing directions display the neutral right-facing pose. Presentation tracking does not change target locking, projectile direction, collision, or damage; the compact enemy snapshot only replicates the server-derived display direction.

The selected pursuit drone has four frames each for `pursuit-seek`, `pursuit-windup`, `pursuit-dash`, `pursuit-recover`, and `knockback`. Seek loops; windup, dash, recovery, and knockback clamp on their final frame until gameplay selects another presentation state. Current visual frame sums for windup `0.25s`, dash `0.20s`, and recovery `0.50s` match the present gameplay references, but gameplay remains the only owner of state transition timing. Projectile attack states continue to fall back to the seek clip. Shield, Artillery, and other enemies are deliberately absent from this package and retain the built-in mock renderer.

This package contains presentation data only. Collider, hitbox, damage, health, physics, AI, and network authority stay in gameplay code. If this manifest or atlas cannot load, only enemies fall back to the built-in pixel mock.

The normalized atlas lifts shadow values and uses a warm gunmetal rim so the silhouettes stay separate from the blue-black Sector 01 environment. When this package is ready, the renderer does not draw the old mock sensor block or drone silhouette line over it; gameplay telegraphs and health bars remain independent.

Validation status (2026-08-20): manifest v3 validator PASS with two atlases, two enemies, and 18 presentation states. Direct Stage 1-5 `?seed=15` browser review at desktop `1280x720` and mobile-landscape `844x390` displayed the layered Sentry and animated Pursuit without warnings or errors. The base stayed fixed, the head/barrel followed left-half aim without turning the top armor upside down, and both `56x56` silhouettes remained readable.

## Final user approval

2026-08-20 사용자 최종 검수로 아래 두 Runtime 자산의 이미지와 애니메이션을 완료 처리한다.

- `sentry-t1`: 후보 `06` 기반 고정 베이스와 가장 가까운 Player/발사 방향을 따르는 upright 회전 머리·단일 포신
- `pursuit-drone-t1`: 후보 `09` 기반 기본 이미지와 `pursuit-seek`, `pursuit-windup`, `pursuit-dash`, `pursuit-recover`, `knockback` 각 4프레임

명시적인 새 사용자 결정 전에는 두 자산을 재생성·교체 대상으로 취급하지 않는다. Shield·Artillery 및 다른 몬스터의 이미지·애니메이션 완료 여부는 이번 승인 범위에 포함하지 않는다.

Validate with:

```sh
npm run validate:enemy-sprite-assets -- assets/runtime/characters/sector-01-enemies
```
