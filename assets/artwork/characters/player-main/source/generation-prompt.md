# ImageGen prompt record

## Mode

- Tool: OpenAI built-in ImageGen
- Workflow: identity-preserving generation from the user-provided final character reference
- Reference: `pixellab-ready-character.png`

## Primary prompt

```text
Use case: identity-preserve
Asset type: 2D pixel-art game character animation master sprite sheet
Input images: Image 1 is the final character identity and design reference.
Primary request: Derive a complete 13-frame animation sprite sheet from Image 1 while preserving the exact character identity, silhouette, proportions, black spiky head/hair, white eyes, red scarf, charcoal-black outfit, dark gray limbs and limited palette.
Scene/backdrop: genuinely transparent background.
Style/medium: crisp low-resolution pixel art, hard pixel edges, no antialiasing, consistent limited palette, consistent lighting.
Composition/framing: exact 4-column by 4-row uniform grid with equal square cells and the character centered consistently in every occupied cell, same ground line and scale. No visible grid lines.
Frame order:
row 1: idle-0 neutral stance, idle-1 subtle breathing rise, run-0 clear forward stride, run-1 opposite clear stride.
row 2: jump compact upward pose, fall arms and legs spread downward pose, rope-0 both hands reaching straight overhead with legs swinging left, rope-1 both hands overhead with legs swinging right.
row 3: hit-0 body recoiling backward, hit-1 compressed recovery pose, respawn-0 small glowing partial silhouette, respawn-1 half-formed character, full restored character.
row 4: respawn-2 fully restored character with a brief bright rim, then three completely empty transparent cells.
Constraints: preserve the character design exactly; right-facing default; every pose must be distinct by silhouette; keep red scarf present and attached in all fully formed frames; no weapons, no extra accessories, no text, no labels, no numbers, no borders, no checkerboard, no colored background, no shadow outside the character, no watermark.
```

## Targeted transparency edit

```text
Remove only the white and light-gray checkerboard background and replace it with genuine alpha transparency. Preserve every character pixel, all 13 poses, exact 4-by-4 placement, scale, palette, red scarf, cyan respawn effects, hard pixel edges and empty final three cells unchanged.
```

The built-in edit still returned RGB checkerboard pixels, so deterministic connected-background removal and matte cleanup were applied by `normalize_generated_sheet.py`.

## Idle/run v2 prompt

```text
Use case: identity-preserve
Asset type: 2D pixel-art game character idle/run animation pose sheet
Input images: Image 1 is the immutable final character identity reference. Image 2 is the current idle/run sheet to improve; preserve its character design but replace the flawed body motion.
Primary request: Create exactly six distinct full-body poses in a clean 3-column by 2-row grid: two planted idle breathing poses followed by four right-facing run-cycle poses covering alternating contact and passing phases.
Motion constraints: idle feet, hips, overall height and width stay fixed while only shoulders, chest and scarf shift subtly; run uses alternating planted feet, bent knees, heel lift, arm counter-swing, a stable torso and smooth scarf follow-through.
Style/medium: crisp low-resolution pixel art, hard pixel edges, consistent limited palette.
Scene/backdrop: flat solid bright green chroma background.
Constraints: preserve the final black spiky head, white eyes, red scarf, charcoal outfit, cyan wrist detail, proportions and scale; no squash/stretch, weapons, accessories, text, labels, borders, shadows or watermark.
```

- Built-in ImageGen output: `source/idle-run-v2-imagegen.png`
- Chroma-removed intermediate: `source/idle-run-v2-transparent.png`
- Deterministic normalizer: `source/normalize_idle_run_v2.py`

## Eight-phase run v3 prompt

```text
Use case: identity-preserve
Asset type: eight-frame pixel-art run-cycle pose sheet
Primary request: create a right-facing contact, down, passing and extension sequence for the left leg, followed by the corresponding four opposite-leg phases.
Motion legibility: separate both legs by silhouette and value; use dark gray for the near leg and near-black for the far leg; move knees and entire lower legs instead of only toes; use long contact strides and clearly raised passing knees.
Invariants: preserve the final black spiky head, white eyes, red scarf, charcoal outfit, cyan wrist detail, scale, hip height and hard pixel edges.
Scene/backdrop: solid bright green chroma background in an exact 4×2 grid.
Avoid: duplicate leg values, merged leg blobs, toe-only movement, squash/stretch, text, borders and extra objects.
```

- Selected built-in ImageGen output: `source/run-v3-imagegen.png`
- Chroma-removed intermediate: `source/run-v3-transparent.png`
- Deterministic normalizer: `source/normalize_run_v3.py`

## Compact two-head run v4 prompt

```text
Use case: precise-object-edit
Asset type: production source sheet for an 8-frame low-resolution pixel-art run animation
Input images: Image 1 is the current eight-pose run sheet; Image 2 is the definitive character-proportion reference.
Primary request: redraw only the running poses so the leg changes remain readable while every pose preserves the reference's strict two-head-tall chibi proportion.
Composition: exact 4×2 grid ordered contact, down, passing and up for each leg.
Motion constraints: keep the head at about half the character height, compact the torso, shorten thighs and shins, and show gait through bent knees, overlap, small vertical offsets and near/far leg values rather than long strides.
Invariants: identical head size, stable scale and ground line, black spiky head, white eyes, red scarf, charcoal body, cyan wrist detail and hard square pixels.
Scene/backdrop: solid chroma green.
Avoid: realistic proportions, long limbs, split poses, wide lunges, stretched anatomy, squash/stretch, rotation, antialiasing, text and extra objects.
```

- Selected built-in ImageGen output: `source/run-v4-imagegen.png`
- Chroma-removed intermediate: `source/run-v4-transparent.png`
- Deterministic normalizer: `source/normalize_run_v4.py`

## Compact rope v2 prompt

```text
Use case: precise-object-edit
Asset type: two-frame low-resolution pixel-art rope-hang animation
Input images: Image 1 is the flawed rope animation; Image 2 is the definitive two-head-tall character reference.
Primary request: replace both rope poses so the character hangs from one overhead grip while preserving the strict two-head-tall chibi proportion.
Arm construction: short thick bent arms, elbows at ear height, hands together immediately above the crown; never use long vertical arms or a tall loop.
Body construction: large head, broad compact torso, thick waist and short legs with the same visual mass as idle.
Motion: upright non-rotating head and torso; only a modest left/right hip, knee and scarf follow-through.
Layout: exact 2×1 grid on solid chroma green; hard square pixels; no text, rope line, weapons or extra objects.
```

- Selected built-in ImageGen output: `source/rope-v2-imagegen.png`
- Chroma-removed intermediate: `source/rope-v2-transparent.png`
- Deterministic normalizer: `source/normalize_rope_v2.py`

## One-handed rope v3 prompt

```text
Use case: precise-object-edit
Asset type: two-frame low-resolution pixel-art one-handed rope-riding animation
Input images: Image 1 is the current two-handed rope pose; Image 2 is the definitive two-head-tall character reference.
Primary request: replace the two-handed pose with a clear one-handed rope-riding pose.
Pose: the rear hand alone grips immediately above and behind the crown with a short thick bent arm; the front hand stays separate at chest height in an attack-ready pose with the cyan wrist visible.
Motion: keep the gripping hand fixed while the lower body sways modestly left and right; head and torso remain upright and do not rotate.
Invariants: large unobstructed head, broad short torso, short legs, idle-like visual mass, right-facing, hard square pixels and solid chroma green.
Avoid: both hands overhead, a two-arm arch, monkey-like hanging, long limbs, thin body, spinning, rope line, weapon, attack effect, text and extra objects.
```

The selected revision kept the grip, head, torso and free attack-ready hand fixed, then made the two short-leg silhouettes trail in clearly opposite directions so the change survives 24×24 normalization.

- Selected built-in ImageGen output: `source/rope-v3-one-hand-imagegen.png`
- Chroma-removed intermediate: `source/rope-v3-one-hand-transparent.png`
- Deterministic normalizer: `source/normalize_rope_v3.py`

## Fixed-body rope wind v4 prompt

```text
Use case: precise-object-edit
Asset type: production source sheet for a two-frame low-resolution pixel-art one-handed rope-riding wind loop
Input images: Image 1 is the current one-handed rope pose edit target; Image 2 is the definitive character identity reference.
Primary request: Make both frames use one absolutely identical frozen character pose. Animate only the loose hair tips and the red scarf fabric.
Locked pixels and pose: the overhead gripping hand, raised arm, large head position, face and eyes, free cyan-wrist attack-ready hand, torso, hips, knees, legs and feet must stay at exactly the same position, silhouette, scale and orientation in both frames. No body part may sway, rotate, lean, stretch or change pose.
Hair motion: only two or three small spiky hair tips at the rear/top edge flutter backward; frame 1 lifts those tips slightly, frame 2 lowers them slightly. The head mass and face remain fixed.
Scarf motion: lengthen the red scarf tail to about 1.5 times its current visible length while keeping the neck wrap fixed. Frame 1 forms a longer upward/backward wave to the left; frame 2 forms a longer downward/backward wave to the left. The scarf must read as lightweight wind-blown fabric.
Composition: exactly two full-body frames in a 2-column by 1-row grid with identical placement.
Style/medium: crisp low-resolution pixel art, hard square pixels, limited palette.
Scene/backdrop: flat solid bright chroma green.
Invariants: clear one-handed rope grip, front hand free for attacks, strict two-head-tall chibi proportion, broad short torso, right-facing.
Avoid: any body motion, leg motion, hand motion, grip movement, head translation, full-head deformation, both hands overhead, monkey-like pose, short scarf, thick rigid scarf, body rotation, anisotropic scaling, rope line, weapon, attack effect, text, border, shadow, watermark, antialiasing or gradients.
```

ImageGen provided the longer scarf and wind direction reference, but its body pose changed between frames. The deterministic normalizer therefore starts both runtime rope frames from the same approved v3 body and transfers the requested motion only through explicit loose-hair and scarf-tail pixel regions.

- Selected built-in ImageGen output: `source/rope-v4-wind-imagegen.png`
- Chroma-removed intermediate: `source/rope-v4-wind-transparent.png`
- Deterministic normalizer: `source/normalize_rope_v4.py`

## Four-phase backward rope flow v5 prompt

```text
Use case: precise-object-edit
Asset type: production source/reference sheet for a four-frame low-resolution pixel-art one-handed rope-riding scarf-drag loop
Input images: Image 1 is the current one-handed rope wind attempt; Image 2 is the definitive character identity and two-head-tall proportion reference.
Primary request: Create exactly four sequential animation frames in which the scarf behaves like lightweight fabric pulled backward by the character's forward rope motion. The scarf must remain extended backward to the left in every frame. Do not make it alternate as a large up/down flap.
Physical motion: show a small traveling wave moving from the fixed neck knot toward the trailing tip across four phases: phase 1 nearly straight backward with a shallow crest near the base; phase 2 the crest travels through the middle; phase 3 the crest reaches the tip while the base straightens; phase 4 returns toward the nearly straight shape. Vertical deviation is subtle, no more than about one or two logical pixels; horizontal backward extension dominates every silhouette.
Scarf length: keep the longer tail, about 1.5 times the original reference length, thin and tapered rather than thick or rigid.
Locked pose: overhead rear gripping hand, grip point, bent arm, large head and face, free cyan-wrist front hand, torso, hips, knees, legs and feet must be pixel-identical in placement, silhouette, scale and orientation across all four frames. Animate only the loose rear hair tips and scarf tail outside the fixed neck wrap.
Hair motion: small rear hair tips trail backward in the same direction as the scarf with a restrained four-phase ripple; do not deform or translate the head mass.
Composition: exact 4-column by 1-row grid, all four full-body frames identically aligned and grounded, generous equal cell spacing.
Style/medium: crisp 24x24-oriented low-resolution pixel art, hard square pixels, limited palette, right-facing, strict two-head-tall chibi proportions, broad short torso.
Scene/backdrop: flat solid bright chroma green.
Avoid: vertical flag-like flapping, alternating high/low whole scarf, forward-pointing scarf, body sway, leg motion, hand motion, grip movement, head movement, full-hair deformation, long limbs, thin body, two-hand hang, monkey-like pose, anisotropic scaling, rope line, weapon, attack effect, text, border, shadow, watermark, antialiasing, gradients.
```

ImageGen established the four-phase horizontal fabric flow, but its body and legs were not identical between frames. The deterministic normalizer therefore reuses one v4 rope body for all four runtime frames and rebuilds only the shallow scarf centerline and rear hair-tip phases inside explicit pixel regions.

- Selected built-in ImageGen output: `source/rope-v5-backward-flow-imagegen.png`
- Chroma-removed intermediate: `source/rope-v5-backward-flow-transparent.png`
- Deterministic normalizer: `source/normalize_rope_v5.py`
