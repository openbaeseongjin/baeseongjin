# ImageGen acquisition redesign prompt

- Tool: OpenAI built-in ImageGen
- Generated: 2026-08-22
- Use case: `stylized-concept`
- Input 1: previous fresh-kite Artillery composite, used only for the clipped-kite identity
- Input 2: current Player game-size review, used for scale and pixel density
- Input 3: selected Pursuit runtime-size review, used for Sector 01 palette and readability
- Output: `imagegen-acquisition-concept.png`

## Final prompt

Create one clean pixel-art concept sheet for the Sector 01 Artillery Drone. Use the supplied clipped-kite Artillery silhouette only as an identity reference, the Player image for scale and pixel density, and the Pursuit Drone review for the dark navy, gunmetal, warm-gray, orange-red and amber palette. The drone is a wide-area strike marker, not a projectile launcher. Keep it upright, compact and perfectly left-right symmetric. Do not add a barrel, muzzle, rotating head, directional lens, antenna, cable, projectile, exhaust trail or tiny panel noise.

Show three readable states on a transparent background: idle, acquisition and cooldown. In idle, a top-center armored sensor is closed and the small belly range projector is retracted. During acquisition, both shutter plates open symmetrically, exposing one large square orange-red eye that peaks with a warm white center, while the belly projector extends downward by only one or two pixels. The change must communicate “your position was captured once” without pointing toward the Player. In cooldown, the eye dims, the projector retracts and the shutters close. Preserve hard square pixels, no antialiasing, no blur, no gradients, no shadows, no text and no environment. Keep every pose compatible with a `32x32` authoring cell and legible at a `56x56` nearest-neighbor display size.

The ImageGen result was used as a visual concept only; exact `32x32` frames were redrawn with the deterministic Pillow source in this directory.
