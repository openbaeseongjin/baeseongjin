# Sentry T1 360-degree turret ImageGen prompt

- Tool: Codex built-in ImageGen
- Date: 2026-08-20
- Input: user-provided selected Sentry candidate 06 image
- Output: `imagegen-component-reference.png`

The generated image is an authoring reference, not a runtime sprite. The prompt requested the selected Sector 01 sentry identity and palette while separating a direction-neutral fixed puck base from a compact rotating head with one short, broad barrel, a centered hub, and a rear counterweight. It constrained the design to large pixel clusters, at most six flat colors, no anti-aliasing, no extra attachments, and readability after normalization to a `32x32` logical cell.

The generated reference still used a preview checker and oversized components, so `build_rotating_sentry.py` mechanically re-authors the approved shape language at the target logical resolution instead of treating ImageGen output pixels as a runtime contract.

## Fixed base + rotating head alternative

- Tool: Codex built-in ImageGen
- Date: 2026-08-20
- Inputs: the user-provided selected Sentry candidate 06 and the barrel-only rotation preview
- Output: `imagegen-fixed-base-rotating-head-reference.png`

The second prompt requested a comparison construction with only the low floor mount fixed and the complete compact head, sensor, rear counterweight, and one broad barrel rotating as one rigid layer. It retained the same palette and low-information constraints, required a centered shared pivot, and limited the radial envelope so every angle remains inside a `32x32` cell. The generated reference is preserved as source evidence; its checker and oversized preview geometry are not runtime inputs.
