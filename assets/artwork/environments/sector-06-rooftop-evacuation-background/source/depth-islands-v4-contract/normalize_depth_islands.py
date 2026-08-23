from __future__ import annotations

from pathlib import Path

import cv2
import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parent
ASSET_ROOT = ROOT.parent.parent
EXPORT = ASSET_ROOT / "export" / "depth-islands-v4-contract"
PREVIEW = ASSET_ROOT / "preview" / "depth-islands-v4-contract"
SIZE = (1024, 1536)
THRESHOLD = 224
MIN_COMPONENT_PIXELS = 500
SHIFT_PIXELS = 8


def nearest(image: Image.Image, mode: str) -> Image.Image:
    return image.convert(mode).resize(SIZE, Image.Resampling.NEAREST)


def save_rgba_cutout(master: Image.Image, mask: np.ndarray, path: Path) -> Image.Image:
    rgba = master.convert("RGBA")
    rgba.putalpha(Image.fromarray(mask.astype(np.uint8), mode="L"))
    rgba.save(path)
    return rgba


def main() -> None:
    EXPORT.mkdir(parents=True, exist_ok=True)
    PREVIEW.mkdir(parents=True, exist_ok=True)

    master = nearest(Image.open(ROOT / "sector-06-master.png"), "RGB")
    depth = nearest(Image.open(ROOT / "depth-map-imagegen.png"), "L")
    inpaint = nearest(Image.open(ROOT / "fixed-background-inpaint-imagegen.png"), "RGB")

    binary = (np.asarray(depth) >= THRESHOLD).astype(np.uint8)
    count, labels, stats, centroids = cv2.connectedComponentsWithStats(binary, connectivity=8)
    components = [
        index
        for index in range(1, count)
        if int(stats[index, cv2.CC_STAT_AREA]) >= MIN_COMPONENT_PIXELS
    ]
    if len(components) != 2:
        areas = sorted(
            (int(stats[index, cv2.CC_STAT_AREA]) for index in range(1, count)), reverse=True
        )
        raise RuntimeError(f"expected 2 connected islands, got {len(components)}; areas={areas[:8]}")
    components.sort(key=lambda index: float(centroids[index][0]))

    masks = [(labels == index).astype(np.uint8) * 255 for index in components]
    union = np.maximum(masks[0], masks[1])
    fixed = Image.composite(inpaint, master, Image.fromarray(union, mode="L"))

    master.save(EXPORT / "sector-06-master.png")
    depth.save(EXPORT / "sector-06-depth-map.png")
    fixed.save(EXPORT / "sector-06-fixed-background.png")
    left = save_rgba_cutout(master, masks[0], EXPORT / "sector-06-parallax-island-left.png")
    right = save_rgba_cutout(master, masks[1], EXPORT / "sector-06-parallax-island-right.png")

    neutral = fixed.convert("RGBA")
    neutral.alpha_composite(left)
    neutral.alpha_composite(right)
    master_rgba = master.convert("RGBA")
    difference = np.abs(np.asarray(neutral, dtype=np.int16) - np.asarray(master_rgba, dtype=np.int16))
    neutral_max_difference = int(difference.max())
    if neutral_max_difference != 0:
        raise RuntimeError(f"neutral composite differs from master: max={neutral_max_difference}")
    neutral.save(PREVIEW / "sector-06-depth-islands-neutral-composite.png")

    shifted = fixed.convert("RGBA")
    shifted.alpha_composite(left, dest=(SHIFT_PIXELS, 0))
    shifted.alpha_composite(right, dest=(-SHIFT_PIXELS, 0))
    shifted.save(PREVIEW / "sector-06-depth-islands-small-offset-preview.png")

    print(
        "normalized",
        {
            "size": SIZE,
            "threshold": THRESHOLD,
            "componentAreas": [int(stats[index, cv2.CC_STAT_AREA]) for index in components],
            "componentCentroidsX": [round(float(centroids[index][0]), 2) for index in components],
            "neutralMaxDifference": neutral_max_difference,
            "shiftPixels": SHIFT_PIXELS,
        },
    )


if __name__ == "__main__":
    main()
