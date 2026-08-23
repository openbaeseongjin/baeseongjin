# Built-in ImageGen edit prompts

## Shared input roles

- Image 1 (or Images 1-2 for Shield): edit target — approved Sector 01 transparent pixel atlas.
- Final image: material and mood reference only — Sector 03 Central Exchange background reference.
- Use case: `precise-object-edit`.

## Shared edit contract

Change only neutral outer-shell secondary colors and neutral metal material toward the Sector 03 Central Exchange reference: cool blue-silver, refined graphite, clean dark-navy paneling, subtle polished highlights, extremely restrained champagne-brass hardware and only a trace of settled dust. Preserve the source sprite identity, exact silhouette, proportions, equipment, facing, pose, frame layout, frame count, spacing, transparent padding and hard pixel edge language. Preserve role and behavior colors exactly: Shield blue, Support green, Swarm purple, Patrol red/orange, Artillery orange/red warning colors, and Sentry/Pursuit sensor and exhaust highlights. Do not add weapons, equipment, limbs, symbols, micro-detail, glow, antialiasing, blur, semitransparent edge pixels, background, text or watermark.

The built-in outputs are retained only as material-treatment references. Final atlases are rebuilt deterministically from the approved source pixels so the atlas geometry and binary alpha cannot drift.
