from __future__ import annotations

from pathlib import Path

import cv2
import numpy as np
from PIL import Image


ASSET_ROOT = Path(__file__).resolve().parents[2]
SOURCE = Path(__file__).resolve().parent
EXPORT = ASSET_ROOT / "export" / "seam-match-v4-depth-islands-v1"
PREVIEW = ASSET_ROOT / "preview" / "seam-match-v4-depth-islands-v1"

MASTER_NAME = "sector-03-central-exchange-master.png"
DEPTH_SOURCE_NAME = "depth-map-imagegen.png"
INPAINT_NAME = "fixed-background-inpaint-imagegen.png"
THRESHOLD = 227
MIN_COMPONENT_AREA = 500
SHIFT_PIXELS = 8


def save_rgba_cutout(master: Image.Image, mask: np.ndarray, path: Path) -> Image.Image:
    pixels = np.asarray(master.convert("RGBA")).copy()
    pixels[:, :, 3] = mask
    image = Image.fromarray(pixels, "RGBA")
    image.save(path, format="PNG", optimize=True)
    return image


def alpha_over(base: Image.Image, overlays: list[tuple[Image.Image, tuple[int, int]]]) -> Image.Image:
    result = base.convert("RGBA")
    for overlay, offset in overlays:
        result.alpha_composite(overlay, dest=offset)
    return result


def preview_cutout(cutout: Image.Image) -> Image.Image:
    checker = Image.new("RGB", cutout.size, (28, 30, 42)).convert("RGBA")
    return alpha_over(checker, [(cutout, (0, 0))]).convert("RGB")


def main() -> None:
    EXPORT.mkdir(parents=True, exist_ok=True)
    PREVIEW.mkdir(parents=True, exist_ok=True)

    master = Image.open(SOURCE / MASTER_NAME).convert("RGB")
    depth = Image.open(SOURCE / DEPTH_SOURCE_NAME).convert("L")
    inpaint = Image.open(SOURCE / INPAINT_NAME).convert("RGB")
    if depth.size != master.size or inpaint.size != master.size:
        raise ValueError(
            f"All inputs must share one canvas: master={master.size}, "
            f"depth={depth.size}, inpaint={inpaint.size}"
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
    width, height = master.size
    left_box = stats[left_index, :4]
    right_box = stats[right_index, :4]
    if int(left_box[cv2.CC_STAT_LEFT]) != 0:
        raise ValueError("Left near island does not touch the left canvas edge")
    if int(right_box[cv2.CC_STAT_LEFT] + right_box[cv2.CC_STAT_WIDTH]) != width:
        raise ValueError("Right near island does not touch the right canvas edge")
    if centroids[left_index][0] >= width / 2 or centroids[right_index][0] <= width / 2:
        raise ValueError("Near islands do not resolve to distinct left/right components")

    left_mask = np.where(labels == left_index, 255, 0).astype(np.uint8)
    right_mask = np.where(labels == right_index, 255, 0).astype(np.uint8)
    union_mask = np.maximum(left_mask, right_mask)

    # Only the pixels hidden by the extracted islands consume the generated
    # inpaint. Every unmasked master pixel stays byte-identical.
    fixed = Image.composite(inpaint, master, Image.fromarray(union_mask, "L"))

    master.save(EXPORT / "sector-03-central-exchange-background.png", format="PNG", optimize=True)
    depth.save(EXPORT / "sector-03-central-exchange-depth-map.png", format="PNG", optimize=True)
    fixed.save(EXPORT / "backdrop-fixed.png", format="PNG", optimize=True)
    left = save_rgba_cutout(master, left_mask, EXPORT / "parallax-island-left.png")
    right = save_rgba_cutout(master, right_mask, EXPORT / "parallax-island-right.png")

    neutral = alpha_over(fixed, [(left, (0, 0)), (right, (0, 0))]).convert("RGB")
    neutral.save(PREVIEW / "sector-03-central-exchange-neutral.png", format="PNG", optimize=True)
    shifted = alpha_over(
        fixed,
        [(left, (SHIFT_PIXELS, 0)), (right, (-SHIFT_PIXELS, 0))],
    ).convert("RGB")
    shifted.save(PREVIEW / "sector-03-central-exchange-shifted.png", format="PNG", optimize=True)

    half = (width // 2, height // 2)
    pair = Image.new("RGB", (width, half[1]), "black")
    pair.paste(master.resize(half, Image.Resampling.NEAREST), (0, 0))
    pair.paste(depth.convert("RGB").resize(half, Image.Resampling.NEAREST), (half[0], 0))
    pair.save(PREVIEW / "sector-03-central-exchange-master-depth-pair.png", format="PNG", optimize=True)

    contact = Image.new("RGB", (width, height), (12, 14, 22))
    contact.paste(fixed.resize(half, Image.Resampling.NEAREST), (0, 0))
    contact.paste(preview_cutout(left).resize(half, Image.Resampling.NEAREST), (half[0], 0))
    contact.paste(preview_cutout(right).resize(half, Image.Resampling.NEAREST), (0, half[1]))
    contact.paste(shifted.resize(half, Image.Resampling.NEAREST), (half[0], half[1]))
    contact.save(PREVIEW / "sector-03-central-exchange-layer-contact-sheet.png", format="PNG", optimize=True)

    neutral_difference = np.abs(
        np.asarray(master, dtype=np.int16) - np.asarray(neutral, dtype=np.int16)
    )
    outside_difference = np.abs(
        np.asarray(master, dtype=np.int16) - np.asarray(fixed, dtype=np.int16)
    )[union_mask == 0]
    left_area = int(stats[left_index, cv2.CC_STAT_AREA])
    right_area = int(stats[right_index, cv2.CC_STAT_AREA])
    print(
        "seam-match-v4-depth-islands-v1:",
        f"canvas={width}x{height}",
        f"threshold={THRESHOLD}",
        f"components={len(candidates)}",
        f"left_area={left_area}",
        f"right_area={right_area}",
        f"left_bbox={tuple(int(value) for value in left_box)}",
        f"right_bbox={tuple(int(value) for value in right_box)}",
        f"neutral_max_diff={int(neutral_difference.max())}",
        f"outside_mask_max_diff={int(outside_difference.max())}",
    )


if __name__ == "__main__":
    main()
