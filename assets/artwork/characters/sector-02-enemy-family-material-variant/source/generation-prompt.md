# Sector 02 user-selected material normalization

## Shared input roles

- Identity authority: approved Sector 01 transparent pixel atlases.
- Current material authority: `user-reference/sector-02-rugged-cast-iron-user-reference.png` supplied by the user on 2026-08-23.
- Environment check: Sector 02 Worker District background reference.
- Earlier ImageGen studies remain historical source records and are not current atlas inputs.

## Shared edit contract

Change only neutral outer-shell secondary colors and neutral metal material toward the user-selected reference: near-black cast-iron recesses, mottled graphite-brown midtones, dry gray-beige worn edges and restrained worker-district dust. Preserve the source sprite identity, exact silhouette, proportions, equipment, facing, pose, frame layout, frame count, spacing, transparent padding and hard pixel edge language. Preserve role and behavior colors exactly: Shield blue, Support green, Swarm purple, Patrol red/orange, Artillery orange/red warning colors, and Sentry/Pursuit sensor and exhaust highlights. Do not add weapons, equipment, limbs, symbols, glow, antialiasing, blur, semitransparent edge pixels, background, text or watermark.

Final atlases are rebuilt deterministically from the approved source pixels. A fixed RGB transform establishes the cast-iron base, then body-relative clustered masks place blocky pits, brown oxidation clusters, dry dust bands and bright worn edges on neutral metal only. The pattern follows each frame's neutral-metal bounds instead of repeating as screen-space noise, so animation does not produce texture swimming. Atlas geometry, binary alpha and protected role-color pixels remain unchanged.
