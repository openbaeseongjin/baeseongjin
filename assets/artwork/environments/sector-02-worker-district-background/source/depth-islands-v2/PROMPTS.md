# Sector 02 depth-islands ImageGen prompts

## Depth map

Using the attached Sector 02 game background as the exact composition reference, generate a single-channel grayscale depth map for offline parallax extraction. Keep the canvas and every silhouette aligned to the source. White must represent the closest foreground and black the farthest background. Produce exactly two large connected near-depth islands: one contiguous left edge building mass and one contiguous right edge building mass. Keep the central vertical canyon, distant city, haze, bridges in the distance, and the large horizontal pipe near the bottom center in darker fixed/background depth so they are not cut out. Use hard, clean, non-feathered region boundaries suitable for thresholding; no text, legend, color, lighting, added objects, or checkerboard.

## Fixed background inpaint

Edit the attached Sector 02 game background into the fixed parallax background plate. Remove only the two closest connected foreground building masses along the left and right edges, and reconstruct the occluded area as a coherent distant Worker District canyon with blue-black haze, tiny distant windows, vertical industrial architecture, and matching pixel-art texture. Preserve the exact 1024×2176 composition, central vanishing axis, palette, distant bridges, and especially the large horizontal pipe near the bottom center as part of the fixed plate. Do not add characters, ropes, anchors, UI, readable text, gameplay platforms, or new focal objects. Return a fully opaque image with no transparency or checkerboard.
