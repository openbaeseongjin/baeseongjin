# Sentry T1 Rotating Turret

- Status: `RUNTIME-INTEGRATED / USER-APPROVED / FINAL VERIFIED`
- Target enemy: `sentry-t1`
- Logical cell: `32x32`
- Shared rotation pivot: `(16, 16)`
- Runtime display target: approximately `56x56 px`
- Source identity: selected Sentry candidate `06`
- Tool chain: Codex built-in ImageGen references plus deterministic Pillow normalization
- Source/license: user-approved project reference and repository-authored normalization; no external image asset included

2026-08-20 사용자 최종 검수에서 경계 포탑의 이미지와 고정 베이스·upright 회전 머리/포신 애니메이션이 승인됐다. 이후 명시적인 새 결정 없이 후보 재생성이나 다른 실루엣으로 교체하지 않는다.

## Purpose

This revision prepares the selected Sector 01 sentry for a barrel that can aim through a full 360 degrees. It replaces the direction-baked silhouette with two presentation layers that share the same canvas and pivot:

- `export/sentry-base.png`: fixed, direction-neutral chassis, puck base, and centered bearing
- `export/sentry-turret.png`: rotating gimbal, centered sensor, and one short broad barrel facing right at zero degrees

`export/sentry-composite-right.png` is a review composite only. Runtime integration must draw the fixed base first and rotate the turret layer around `(16, 16)` using the gameplay-owned firing angle. Collider, hitbox, damage, firing logic, and aim authority do not belong to these PNGs.

## Selected option: fixed floor base + upright rotating head and barrel

The user-requested comparison keeps only the low floor mount fixed and rotates the complete upper silhouette as one rigid layer:

- `export/sentry-floor-base.png`: fixed low puck mount and centered bearing only
- `export/sentry-head-barrel.png`: compact head, sensor, rear counterweight, and one barrel
- `export/sentry-head-composite-right.png`: zero-degree review composite
- `export/sentry-upright-aim-atlas.png`: normalized `64x32` RGBA runtime handoff atlas; base at column 0, rotating head at column 1

This option reads the firing direction more clearly because the whole upper silhouette follows the aim. The head is kept compact around the same `(16, 16)` pivot to prevent diagonal angles from clipping or becoming a large noisy mass.

The head does not perform a literal 360-degree roll. The presentation folds the gameplay aim into an upright local pose:

- Right half-plane: use the authored right-facing head and local rotation `-90°..90°`.
- Left half-plane: horizontally mirror the head around the same pivot, then use local rotation `-90°..90°`.
- The barrel still points through the full 360-degree gameplay direction, but the top armor never becomes upside down.

This selected rule supersedes the barrel-only rotation as the current authoring direction. The earlier `sentry-base.png` and `sentry-turret.png` exports remain available only for comparison.

## Pixel constraints

- The existing five-color Sector 01 Sentry palette is reused exactly.
- Alpha is binary and all scaling uses nearest-neighbor sampling.
- The barrel is six logical pixels tall including its outline, so arbitrary-angle rotation remains readable at the target output size.
- The fixed chassis has no left/right silhouette cue.
- The rotating layer contains only the centered gimbal and one barrel, with no cables, legs, antennae, vents, or secondary lamps.

## Review files

- `preview/components-8x.png`: fixed and rotating layers separately
- `preview/rotation-8-directions-8x.png`: eight representative aim angles
- `preview/rotation-8-directions-56px.png`: the same eight angles at the intended world output size
- `preview/rotation-360.gif`: 15-degree nearest-neighbor rotation preview
- `preview/head-rotation-components-8x.png`: Option B layers separately
- `preview/head-rotation-8-directions-8x.png`: Option B at eight representative angles
- `preview/head-rotation-8-directions-56px.png`: Option B at intended world output size
- `preview/head-rotation-360.gif`: Option B rotating at 15-degree steps

## Rebuild and validation

```sh
python assets/artwork/characters/sentry-t1-rotating-turret/source/build_rotating_sentry.py
```

Expected output:

```text
PASS sentry rotating turret authoring exports
options=barrel-only,head-plus-barrel-upright pivot=16,16 cell=32x32 palette=5 alpha=binary
headFacing=horizontal-flip-on-left-half localRotation=-90..90
```

The normalized `export/sentry-upright-aim-atlas.png` is promoted to `assets/runtime/characters/sector-01-enemies/sentry-upright-aim.png`. Enemy manifest v3 and `SpriteEnemyRenderer` consume it through the tool-neutral optional `upright-aim` layer contract. The enemy asset validator passes. Stage 1-5 `?seed=15` browser review at desktop `1280x720` and mobile landscape `844x390` confirmed the fixed base, upright left-half head rotation, `56x56` readability, and an empty warning/error console.
