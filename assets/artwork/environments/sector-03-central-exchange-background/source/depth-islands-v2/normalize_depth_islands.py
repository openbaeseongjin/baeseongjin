from pathlib import Path

import cv2
import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "source" / "depth-islands-v2"
EXPORT = ROOT / "export" / "depth-islands-v2"
PREVIEW = ROOT / "preview"
THRESHOLD = 192
MIN_COMPONENT_AREA = 500


def save_rgba_cutout(master: Image.Image, mask: np.ndarray, path: Path) -> None:
    pixels = np.asarray(master.convert("RGBA")).copy()
    pixels[:, :, 3] = mask
    Image.fromarray(pixels, "RGBA").save(path)


def main() -> None:
    EXPORT.mkdir(parents=True, exist_ok=True)
    PREVIEW.mkdir(parents=True, exist_ok=True)

    master = Image.open(SOURCE / "sector-03-central-exchange-imagegen.png").convert("RGB")
    depth = Image.open(SOURCE / "depth-map-imagegen.png").convert("L")
    inpaint = Image.open(SOURCE / "fixed-background-inpaint-imagegen.png").convert("RGB")

    if depth.size != master.size or inpaint.size != master.size:
        raise ValueError(
            f"All inputs must share one canvas: master={master.size}, depth={depth.size}, inpaint={inpaint.size}"
        )

    depth_pixels = np.asarray(depth)
    binary = (depth_pixels >= THRESHOLD).astype(np.uint8)
    count, labels, stats, centroids = cv2.connectedComponentsWithStats(binary, 8)

    candidates = [
        index
        for index in range(1, count)
        if int(stats[index, cv2.CC_STAT_AREA]) >= MIN_COMPONENT_AREA
    ]
    if len(candidates) != 2:
        raise ValueError(f"Expected exactly 2 near islands, found {len(candidates)}")

    candidates.sort(key=lambda index: float(centroids[index][0]))
    left_index, right_index = candidates
    width, _ = master.size
    if centroids[left_index][0] >= width / 2 or centroids[right_index][0] <= width / 2:
        raise ValueError("Near islands do not resolve to distinct left/right components")

    left_mask = np.where(labels == left_index, 255, 0).astype(np.uint8)
    right_mask = np.where(labels == right_index, 255, 0).astype(np.uint8)
    union_mask = np.maximum(left_mask, right_mask)

    # Preserve every original pixel outside the removed islands. The ImageGen
    # inpaint is used only where camera displacement can reveal occluded space.
    fixed_background = Image.composite(
        inpaint,
        master,
        Image.fromarray(union_mask, "L"),
    )

    master.save(EXPORT / "sector-03-central-exchange-background.png")
    depth.save(EXPORT / "sector-03-central-exchange-depth-map.png")
    fixed_background.save(EXPORT / "backdrop-fixed.png")
    save_rgba_cutout(master, left_mask, EXPORT / "parallax-island-left.png")
    save_rgba_cutout(master, right_mask, EXPORT / "parallax-island-right.png")

    neutral = fixed_background.convert("RGBA")
    left = Image.open(EXPORT / "parallax-island-left.png").convert("RGBA")
    right = Image.open(EXPORT / "parallax-island-right.png").convert("RGBA")
    neutral.alpha_composite(left)
    neutral.alpha_composite(right)
    neutral.convert("RGB").save(
        PREVIEW / "sector-03-central-exchange-depth-islands-v2-neutral.png"
    )

    shifted = fixed_background.convert("RGBA")
    shifted.alpha_composite(left, dest=(8, 0))
    shifted.alpha_composite(right, dest=(-8, 0))
    shifted.convert("RGB").save(
        PREVIEW / "sector-03-central-exchange-depth-islands-v2-shifted.png"
    )

    half = (master.width // 2, master.height // 2)
    master_preview = master.resize(half, Image.Resampling.NEAREST)
    depth_preview = depth.convert("RGB").resize(half, Image.Resampling.NEAREST)
    pair = Image.new("RGB", (master.width, half[1]), "black")
    pair.paste(master_preview, (0, 0))
    pair.paste(depth_preview, (half[0], 0))
    pair.save(PREVIEW / "sector-03-central-exchange-depth-islands-v2-pair.png")

    print(
        "depth-islands-v2:",
        f"canvas={master.width}x{master.height}",
        f"threshold={THRESHOLD}",
        f"left_area={int(stats[left_index, cv2.CC_STAT_AREA])}",
        f"right_area={int(stats[right_index, cv2.CC_STAT_AREA])}",
    )


if __name__ == "__main__":
    main()
