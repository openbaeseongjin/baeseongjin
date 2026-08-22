from __future__ import annotations

from pathlib import Path

import cv2
import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parent
EXPORT = ROOT.parent.parent / "export" / "depth-islands-v2"
PREVIEW = ROOT.parent.parent / "preview" / "depth-islands-v2"
SIZE = (1024, 2176)
THRESHOLD = 160
MIN_COMPONENT_PIXELS = 500


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

    master = nearest(Image.open(ROOT / "sector-02-worker-district-master.png"), "RGB")
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

    master.save(EXPORT / "sector-02-worker-district-background.png")
    depth.save(EXPORT / "sector-02-worker-district-depth-map.png")
    fixed.save(EXPORT / "backdrop-fixed.png")
    left = save_rgba_cutout(master, masks[0], EXPORT / "parallax-island-left.png")
    right = save_rgba_cutout(master, masks[1], EXPORT / "parallax-island-right.png")

    neutral = fixed.convert("RGBA")
    neutral.alpha_composite(left)
    neutral.alpha_composite(right)
    master_rgba = master.convert("RGBA")
    difference = np.abs(
        np.asarray(neutral, dtype=np.int16) - np.asarray(master_rgba, dtype=np.int16)
    )
    if int(difference.max()) != 0:
        raise RuntimeError(f"neutral composite differs from master: max={int(difference.max())}")
    neutral.save(PREVIEW / "neutral-composite.png")

    shifted = fixed.convert("RGBA")
    shifted.alpha_composite(left, dest=(-8, 0))
    shifted.alpha_composite(right, dest=(8, 0))
    shifted.save(PREVIEW / "shifted-islands.png")

    pair = Image.new("RGB", (SIZE[0] * 2, SIZE[1]))
    pair.paste(master, (0, 0))
    pair.paste(neutral.convert("RGB"), (SIZE[0], 0))
    pair.save(PREVIEW / "master-neutral-pair.png")

    print(
        "normalized",
        {
            "size": SIZE,
            "threshold": THRESHOLD,
            "componentAreas": [int(stats[index, cv2.CC_STAT_AREA]) for index in components],
            "componentCentroidsX": [round(float(centroids[index][0]), 2) for index in components],
            "neutralMaxDifference": int(difference.max()),
        },
    )


if __name__ == "__main__":
    main()
