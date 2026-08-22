# Shield Drone T1 Guard Motion

- Status: `LOCAL RUNTIME CANDIDATE / VALIDATOR + MOBILE + DESKTOP IN-GAME REVIEW PASS / USER APPROVAL PENDING`
- Asset ID: `shield-drone-t1-guard-motion`
- Target enemy: `shield-drone-t1` (방패 드론)
- Authored state: `shield-guard`
- Frame contract: transparent `32x32` cells, 4 upright body frames plus 8 directional shield frames
- Intended game output: approximately `60x60 px`
- Source/tool: Codex built-in ImageGen, normalized with Pillow nearest-neighbor
- License/source: derived only from the repository's selected Shield Drone candidate `03`; no external asset used

## Motion

The four-frame loop keeps the rear body upright while it compresses, braces, and settles. A separate eight-frame physical shield layer follows the Runtime guard direction in `E, SE, S, SW, W, NW, N, NE` order. The animation does not add an energy shield, projectile, weapon, cable, limb, or gameplay telegraph.

| Frame | Pose | Duration |
| --- | --- | ---: |
| `shield-guard-00.png` | neutral guarded hover | 140 ms |
| `shield-guard-01.png` | rear body compresses down/back | 140 ms |
| `shield-guard-02.png` | strongest forward brace and sensor peak | 180 ms |
| `shield-guard-03.png` | upward settle toward neutral | 140 ms |

## Files

- `source/shield-guard-imagegen.png`: four-panel ImageGen authoring source
- `source/generation-prompt.md`: final built-in ImageGen prompt
- `source/normalize_shield_guard.py`: deterministic frame extraction and pixel normalization
- `export/shield-guard.png`: `128x32` four-frame authoring atlas
- `export/shield-body.png`: `128x32` four-frame upright Runtime body atlas
- `export/shield-directions.png`: `256x32` eight-direction Runtime shield layer atlas
- `export/shield-guard-00.png` through `shield-guard-03.png`: individual transparent frames
- `preview/shield-guard.gif`: enlarged transparent loop for pose review
- `preview/shield-guard-game-size.gif`: approximately `60x60` game-output sprite centered on a Sector 01 dark field
- `preview/shield-guard-review.png`: enlarged frame strip
- `preview/shield-body-review.png`: enlarged body-only frame strip
- `preview/shield-directions-review.png`: enlarged `E..NE` shield layer strip
- `preview/shield-direction-cycle.gif`: body with all eight shield positions
- `preview/shield-guard-runtime-size-check.png`: four frames at intended game output size
- `preview/shield-drone-ingame-mobile.mp4`: previous four-frame body-loop gameplay capture retained for candidate history; it predates the directional shield layer and is not guard-direction verification

## Runtime review

- Review environment: local single-player Runtime, Sector 01-08, deterministic `seed=4`, mobile `844x390` and desktop `1280x720` viewports
- Review tool: direct browser playthrough and screenshots; the deterministic `shield-direction-cycle.gif` remains the current eight-direction motion preview
- Visual result: the upright body keeps its four-frame brace loop while the physical shield selects the gameplay-facing `E..NE` pixel position; the downward frame aligned with the existing blue guard telegraph when the Player stood below the drone, and Player, platform, Anchor, health bar, and Sector 01 background remained readable at mobile and desktop output sizes
- Validation: `npm run validate:enemy-sprite-assets -- assets/runtime/characters/sector-01-enemies` passed on 2026-08-21 (`4 atlas, 3 enemies, 26 states`)

The transparent body and direction atlases are locally connected to `assets/runtime/characters/sector-01-enemies/shield-body.png`, `shield-directions.png`, and the enemy manifest's `shield-guard`/`guardLayer` presentation contract. The renderer only quantizes the existing snapshot `behaviorState.guardDirection`; gameplay, collider, hitbox, damage, physics, AI, and network state remain unchanged. Final user approval remains pending.
