# Depth Islands V2 ImageGen prompts

## 1. Full-color authoring master

```text
Use case: stylized-concept
Asset type: original 2D pixel-art game environment authoring master designed for offline depth-map extraction; Sector 03 CENTRAL EXCHANGE COMPLEX in a side-view rope-action game.

Input image: Image 1 is a style and mood reference only. Preserve only its deep navy/violet commercial atmosphere, sparse warm showcase light, crisp pixel clusters, vertical scale, and strong dark edge framing. Do not copy its exact buildings, rooms, signs, bridges, stairs, or object placement.

Primary request: generate a completely new tall 2:3 portrait background of one continuous colossal premium mega mall and vertical transfer complex. It must read as a gigantic upper-city commercial facility from the bottom onward, never as apartments, a hotel, offices, a street market, or small shops that grow upward. The image is intentionally authored as one full-color master plus a future grayscale depth map.

Depth-map/import structure — critical:
- Design exactly two dominant near-depth parallax islands, no more: Island A is one continuous foreground structure attached to and overscanning the extreme left edge; Island B is one continuous foreground structure attached to and overscanning the extreme right edge.
- Each near island must be a clean, contiguous silhouette built from a few large connected masses: dark structural ribs, connected pipes, premium storefront framing, and one or two broad projecting showcase housings. Avoid many detached fragments, thin floating rails, loose cables, isolated signs, tiny disconnected balconies, or speckled foreground detail.
- Keep the two islands physically separate from each other. They must never cross or bridge the central void, and must not connect across the top or bottom.
- Leave at least 55% of the central width as distant, low-contrast open atrium and city-depth background.
- Keep every other architectural element clearly farther away and visually merged into the fixed background through lower contrast, cooler value, softer pixel density, and atmospheric violet-blue haze.
- Make depth discontinuities around the two near islands crisp and unambiguous so an offline grayscale depth map can select them as two connected components.
- Give the two near islands 24–32 px of visual overscan beyond the left/right crop logic, with no important isolated tips at the canvas boundary.
- Neutral camera composite only; no visible parallax displacement and no cutout holes.

World/social identity: this is an upper-city premium mall adjacent to the worker district. Workers are not blocked by gates or identity checks; the exclusion is economic and cultural. Express it through monumental flagship bays, huge glass showcases holding very few abstract luxury objects, excessively generous empty circulation, sparse concierge and lounge silhouettes, cold selective service frontage, and hidden back-of-house machinery. Do not use membership gates, turnstiles, citizen scanners, guards, queues, or readable prices.

Vertical program: one shared atrium and structural spine connects premium lower arcade, facade/media service gallery, central retail walk, public-versus-back-of-house service band, building services, a monumental grand atrium, refined transfer mezzanine, and static upper exchange framing. These are rhythms inside one building, not labelled floors or eight boxed panels. Keep the overall mall scale equally monumental from bottom to top.

Composition: strict side-on orthographic 2D game view, no perspective tilt, no isometric angle, no collage. Largest masses remain at extreme left and right. Central void is deep, sparse, and safe for future rope traversal overlays. Distant recessed cross-connections may appear only faintly and must clearly sit behind gameplay depth. No obvious landable foreground platforms crossing the central space.

Condition and mood: damaged, abandoned, powered-but-empty after a citywide cascade. Cracked dark glass, stopped escalator silhouettes, dust, a few fallen abstract display panels, intermittent systems and partially dark flagship bays. Premium and polished but cold, quiet, and uneasy. No people, bodies, silhouettes, crowds, or human-shaped mannequins.

Style: high-quality crisp 2D pixel art; deliberate square pixel clusters; hard stair-stepped edges; limited clustered shading; strong large silhouettes; authored low-resolution texture. No painterly brushwork, blur, photorealism, 3D render, smooth vector gradients, or soft anti-aliased concept painting. Background contrast, saturation, and detail remain below future player, rope, anchor, enemy, telegraph, terrain, and UI.

Palette: deep navy, graphite, polished dark gray, cool concrete, desaturated steel blue, muted violet. Sparse warm white and muted gold inside flagship showcases. Restrained muted magenta and desaturated teal only in abstract commercial displays. Cyan sparse and dim; amber/red-orange extremely rare.

Constraints: entirely original. No readable text, letters, numbers, prices, brands, logos, watermark, player, rope, hook, anchor, enemy, drone, turret, projectile, scanner beam, force field, route line, arrow, UI, collision outline, foreground gameplay terrain, train, railway gameplay, moving platform, conveyor, or giant moving machinery. This is non-collision authoring only and must not define exact Stage geometry.
```

## 2. Grayscale depth map

```text
Use case: precise-object-edit
Asset type: production grayscale depth map paired with a 2D pixel-art game background.

Image 1 is the exact geometry, registration, crop, and silhouette reference. Convert it into a clean single-channel grayscale monocular depth map without changing the composition or moving, adding, removing, resizing, or redrawing any structure.

Depth convention: pure white is nearest; pure black is farthest.

Extraction contract — critical:
- The final import must yield exactly two dominant near-depth connected components.
- Paint the entire continuous foreground architectural mass touching the extreme left edge as one near island in uniform very light gray to white.
- Paint the entire continuous foreground architectural mass touching the extreme right edge as one near island in uniform very light gray to white.
- Preserve the precise outer and inner occlusion boundaries of those two islands, including their storefront housings, connected ribs, and edge-attached pipes, but do not split them into small brightness fragments.
- The two bright islands must remain completely separate. Do not connect them across the top, center, or bottom.
- Paint all recessed atrium architecture, distant galleries, cross-connections, haze, and the central vertical city depth in dark values from black through dark gray only.
- Central deepest haze is black; remote structures are dark gray; intermediate fixed background architecture is medium-dark gray.
- No third bright component anywhere. No bright isolated signs, windows, showcase objects, cables, rails, or speckles outside the two edge islands.
- Use hard, crisp occlusion boundaries suitable for nearest-neighbor thresholding. Inside each major region, use broad flat value groups with minimal noise rather than texture.

Output constraints: exact same 2:3 portrait framing and pixel registration as Image 1; grayscale only; no color tint; no text, legend, labels, gradients that obscure boundaries, checkerboard, transparency, border, watermark, or new geometry.
```

## 3. Fixed background inpaint

```text
Use case: precise-object-edit
Asset type: fixed, opaque background plate for offline two-island parallax extraction.

Image 1 is the exact 1024×1536 edit target and composition reference.

Change only this: completely remove the two nearest continuous foreground architectural islands attached to the extreme left and extreme right canvas edges, including their closest dark ribs, edge pipes, projecting flagship showcase housings, balconies, and near-depth framing. Reconstruct every newly exposed area as plausible distant and mid-distant interior architecture of the same colossal premium mega mall: recessed low-contrast retail galleries, far structural bays, atmospheric violet-blue atrium walls, faint vertical services, and deep haze.

Critical invariants:
- Keep the central atrium, distant architecture, cross-connections, lighting, palette, vertical program, camera, crop, perspective, and all pixels outside the removed near-island regions as visually unchanged as possible.
- Fill the full canvas opaquely. No holes, transparency, checkerboard, stretched edges, repeated smear, blank flat wedges, or visible cloning seams.
- All reconstructed side content must remain clearly farther away than the removed islands: cooler, darker, lower contrast, lower detail, and embedded in haze.
- Do not create any replacement foreground island, close border frame, large projecting balcony, or object crossing the central void.
- Preserve a broad low-detail central gameplay void.
- Preserve crisp 2D pixel-art cluster language; no blur, photorealism, painterly texture, 3D rendering, or anti-aliased vector style.

Constraints: no text, letters, numbers, prices, logos, watermark, player, rope, hook, anchor, enemy, drone, turret, projectile, scanner beam, force field, route line, arrow, UI, collision outline, gameplay terrain, train, rail, moving platform, conveyor, or new gameplay geometry.
```
