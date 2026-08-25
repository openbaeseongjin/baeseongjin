# Boss06 Departure Gate generation prompt

Use case: `stylized-concept`

Asset type: 2D pixel-art game object sprite, Boss06 departure gate, closed state.

Create one original massive locked departure security gate for the final rooftop evacuation encounter in ONE ROPE. The gate is a corporate continuity facility bulkhead blocking access to the maintenance shuttle. Use a genuinely transparent background and isolate the object. Design for the Runtime footprint `480×760px` (`12:19`): a tall narrow frame grounded on a flat threshold, two heavy interlocking vertical leaves, a central mechanical locking spine, recessed actuators and a compact top housing. Use polished orthographic pixel art with crisp clusters and a restrained 32px construction rhythm. Keep the palette near-black navy, graphite steel and desaturated blue-gray, with limited cyan status strips and tiny muted amber maintenance accents. The closed state must read from geometry, not color.

Do not add text, letters, numbers, logos, lock icons, UI, characters, Shuttle, scenery, external floor, external shadow, fantasy portal elements, circular vault geometry, perspective, photorealistic rendering, excess greebles, neon overload, cropped edges or watermarks.

The second pass preserved the design while correcting the silhouette toward `12:19`. The third pass requested background extraction only; because ImageGen returned a baked checkerboard, `normalize_gate_asset.py` performs the final connected-background extraction and exact-size normalization.

## `light` state edit

Keep the gate completely closed and preserve its identity and geometry. Activate the security-release lighting: make the central cyan strips and top status bar brighter, illuminate small release cores on the lock clamps, activate restrained amber maintenance indicators and add a subtle cyan seam rim. Do not move the door leaves. Change only lighting and release-state cues. Preserve the transparent background, exact silhouette and bottom-center anchor; add no text, UI, scenery or external glow cloud.

## `open` state edit

Preserve the complete outer frame, top housing, side rails, bottom threshold, palette and anchor. Retract the left and right door leaves fully into their side housings and retract the central locking spine into the upper and lower housings, leaving a large unmistakable rectangular passage. The passage must be genuine transparency, not a corridor or painted darkness. Keep narrow folded panel edges inside the side housings to explain the mechanism and retain steady cyan boarding-access lights. Add no text, character, Shuttle, scenery or external shadow.
