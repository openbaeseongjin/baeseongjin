# Far/Mid/Near v3 generation record

## Authority

- Sole master: `sector-04-upper-residential-master.png`
- User attachment SHA-256: `6D2233BE0473CE03F3CD0A64AA2D8618FF5E77A32C69C967DFCBF211A663D827`
- Canvas: `1024×1536`, opaque RGB PNG
- Earlier Sector 04 masters, masks, thresholds and layer exports are not inputs to this extraction.

## Depth-map prompt

OpenAI built-in ImageGen received the user attachment as the sole geometry reference and was instructed to create an opaque, posterized grayscale segmentation map with these ownership rules:

- Far: open vertical ascent, all central/distant city architecture, central residence, garden/water axis and bottom central Sector 03 transition.
- Mid: the complete left/right edge-attached side-building masses except the separate closest Near structures.
- Near: exactly two closest dark structures attached to the extreme left/right edges.
- Windows, foliage speckles and facade holes inherit their parent structure's depth; no small independent islands or center connection.

The generated map was `1023×1537`; the offline normalizer preserves it as `depth-map-imagegen.png` and creates `depth-map-normalized.png` at the master's exact `1024×1536` canvas with nearest-neighbor resampling. Thresholds were selected from this attachment only: building union `128`, Near `224`, minimum component `500px`.

## Fixed-background prompt

OpenAI built-in ImageGen received the user attachment as the sole edit target and was instructed to remove only the two complete edge-attached side-building masses. It reconstructed their occluded areas with recessed Sector 04 vertical-city architecture and the existing lower Sector 03 atmosphere while preserving the central ascent, residence, garden and water composition. The generated plate is an opaque authoring input and is consumed only beneath the extracted masks.

## Offline normalization

`extract_far_mid_near.py` requires exactly two left/right building components and two left/right Near components. It fills each component continuously from the canvas edge to the inner silhouette, preventing windows and texture from becoming alpha holes. Near core is removed from exclusive Mid ownership. Mid receives a `32px` hidden background apron, Near receives an invisible `8px` overlap into the adjacent moving building, and Far blends the inpaint plate back to the exact master across the Mid apron.

Neutral `Far + Mid + Near` must equal the user attachment pixel-for-pixel. The shifted review uses Mid `(+4,+2)px` and Near `(+8,+4)px` to expose the reconstructed Far plate and check holes, building splits and hard seams.
