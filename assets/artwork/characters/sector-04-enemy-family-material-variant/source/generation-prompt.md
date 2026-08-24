# Sector 04 overgrown enemy reference contract

## Input roles

- Latest user authority: `source/user-reference/sector-04-overgrown-enemies-user-reference-v2.png`
- Earlier user reference: `source/user-reference/sector-04-overgrown-enemies-user-reference.jpg`
- Approved animation source: `source/approved-sector-01/*.png`
- Sector mood reference: the approved Sector 04 Upper Residential master
- Use case: `precise identity-preserving pixel-art material edit`

## Visual target

Apply the latest user's oxidized gray metal, rust, moss and long hanging-vine treatment to all seven approved enemies. Match the reference's distribution: moss accumulates on upward-facing plates, thin olive strands descend from side housings and lower edges, and every monster has visible growth at its real game output size.

Preserve exact proportions, equipment, facing, pose, role identity and role/behavior colors: Shield blue, Support green, Swarm purple, Patrol red/orange, Artillery orange/red warnings, and Sentry/Pursuit sensors and exhaust. Do not add weapons, limbs, flowers, thick bushes, antialiasing, blur, glow, translucent edges, text or watermarks.

## Runtime normalization

Built-in ImageGen is used only to review material and vine placement. The final eight atlases are rebuilt deterministically from the approved Sector 01 pixels.

- Keep every atlas dimension, `32x32` cell, frame count, order, timing and anchor unchanged.
- Preserve every approved opaque pixel and every protected role-color count.
- Use hard binary alpha and integer pixels only.
- Moss and rust may replace eligible neutral-metal pixels.
- Hanging vines may add binary-alpha pixels only inside existing transparent cell padding; they may not touch a cell boundary.
- Resolve fixed strand shapes from each frame's body-relative lower edge so animation does not swim in atlas coordinates.
- Sentry base and Shield body own hanging vines; their rotating aim and direction overlay layers do not.
- Verify that vine pixels survive nearest-neighbor conversion to `56x56`, `60x60` and Swarm's `18x18` world output.

The attached contact sheet is a visual authority, not a runtime atlas or layout input.
