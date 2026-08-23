# Sector 06 depth-island generation prompts

## Evidence applied

- Discord `코딩` channel proposal reviewed on 2026-08-23: keep `master + depth map` as authoring input, extract at most two large connected near islands offline, inpaint their hidden regions in the fixed background, and keep runtime work to cached PNG drawing.
- Repository authority: `docs/graphics-asset-guide.md`, `docs/pixel-graphics-design-guide.md`, and `docs/environment-asset-format.md`.
- Discord material was treated as proposal evidence; the repository contract remained authoritative.

## Fixed background ImageGen edit

Create an opaque fixed-background plate from the approved Sector 06 master. Remove only the closest connected left-edge and right-edge foreground building masses. Inpaint their hidden regions with plausible distant vertical-megacity architecture. Preserve the 1024x1536 framing, central canyon, top 20-25% sky, landing pad and one shuttle, lower Sector 05 transition under 15%, hard pixel clusters, and all middle/far structures. No transparent holes, stretched pixels, duplicate seams, characters, Rope, Anchor, Enemy, UI, text, logos, or new gameplay-readable platforms.

## Depth map ImageGen edit

Create a full-canvas grayscale depth map aligned to the Sector 06 master. White means nearest and black means farthest. Only the closest connected left-edge and right-edge building masses may occupy the brightest band; keep them separated by the central canyon. Group middle and far structures into broad darker silhouettes. Exclude isolated bright windows, lamps, cables, signs, and fragments from the near band. No color, transparency, crop, rescale, text, or watermark.

## Offline normalization

Run `python normalize_depth_islands.py`. Threshold `224` must produce exactly two connected components of at least `500` pixels. The script extracts both RGBA islands from the approved master, replaces their covered regions with the ImageGen inpaint for the fixed background, and requires the neutral recomposition to match the master with maximum channel difference `0`.
