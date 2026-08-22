# Sector 01→02 Runtime Seam

## Status

- Asset ID: `sector-01-02-runtime-seam`
- Category: environment background integration source
- Status: `RUNTIME INTEGRATED`
- Source format: aligned PNG far/mid/near layers from the current Sector 01 and Sector 02 Runtime packages
- Tool: deterministic PowerShell + `System.Drawing`; no generative repaint
- Transition band: `512px` at Sector 01 top and Sector 02 bottom
- Destination: `assets/runtime/environments/sector-01-maintenance/` and `assets/runtime/environments/sector-02-worker-district/`
- License: inherited project-generated Sector 01 assets and user-supplied/project-derived Sector 02 assets; Sector 02 external provenance remains unverified

## Purpose

At the seamless Runtime boundary, Sector 01 displays the top of its `1536px` layer set while Sector 02 displays the bottom of its `2176px` layer set. The previous endpoints changed immediately from a large maintenance machine to a residential cross-pipe. This package makes both endpoints converge on a shared open far shaft without changing either Sector away from the boundary.

## Method

- Runtime compositor: while the Player crosses `1024 world px` centered on the Sector 01 exit / Sector 02 entry, `PixelBackdropRenderer` applies smoothstep opacity `1 → 0` to the complete Sector 01 package and `0 → 1` to the complete Sector 02 package. Both packages and their sky gradients are at `0.5` on the exact boundary.
- The dynamic crossfade uses Player world Y only as presentation input. It does not add simulation state, a timer, a camera rule, or a network field, and it reverses naturally when the Player descends.
- Sector 01 `far`: unchanged.
- Sector 02 `far`: only the bottom `512px` is stepped-crossfaded toward the matching top `512px` of Sector 01 far. The exact boundary row therefore shares the same far image.
- Sector 01 `mid` and `near`: alpha fades to zero across the top `512px`.
- Sector 02 `mid` and `near`: alpha fades to zero across the bottom `512px`.
- Fade weights use 16 discrete levels to keep the pixel-art edge treatment deliberate.
- The builder references only installed `System.Drawing` assemblies and avoids newer C# compiler syntax so the checked-in result is reproducible from Windows PowerShell as well as current PowerShell.
- No resizing, geometry movement, collision, terrain, world object, camera, gameplay, or network change is included.

## Files

- `source/references/`: immutable copies of all six pre-change Runtime layers.
- `source/build-runtime-seam-layers.ps1`: deterministic layer builder and preview compositor.
- `export/sector-01-maintenance/`: revised Sector 01 far/mid/near layers.
- `export/sector-02-worker-district/`: revised Sector 02 far/mid/near layers.
- `preview/boundary-original.png`: pre-change composite boundary.
- `preview/boundary-faded-structure-v1.png`: revised composite boundary, Sector 02 above Sector 01.

## Validation

2026-08-22 verification:

- All six PNG dimensions and alpha contracts pass the environment validators.
- Sector 01 far is byte-equivalent to its reference; Sector 01 mid/near below the top `512px` and all Sector 02 layers above the bottom `512px` are pixel-equivalent to their references after decode.
- Sector 01 far top row and Sector 02 far bottom row are identical; Sector 01 mid/near top alpha and Sector 02 mid/near bottom alpha are zero.
- Both environment validators and renderer syntax checks pass.
- The live Canvas loads both packages without fallback at Sector 01-8 and Sector 02-1 in desktop `1428×817` and mobile landscape `844×390`; browser warning/error log is empty.

On 2026-08-22 the exact `sector-02-01` entry boundary was checked in the live Canvas at desktop `1280×720` and mobile landscape `844×390`: both packages remained legible at equal opacity, terrain/HUD stayed above the backdrop, and browser warning/error logs were empty. The debug start map was restored to its previous `sector-03-08` value after verification.

This source package is not collision geometry and must not be used to derive Stage structure.
