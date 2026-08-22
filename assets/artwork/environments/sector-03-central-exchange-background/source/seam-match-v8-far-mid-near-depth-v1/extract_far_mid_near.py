from __future__ import annotations

from pathlib import Path

import cv2
import numpy as np
from PIL import Image


ASSET_ROOT = Path(__file__).resolve().parents[2]
SOURCE = Path(__file__).resolve().parent
EXPORT = ASSET_ROOT / "export" / "seam-match-v8-far-mid-near-depth-v1"
PREVIEW = ASSET_ROOT / "preview" / "seam-match-v8-far-mid-near-depth-v1"

MASTER_NAME = "sector-03-central-exchange-master.png"
DEPTH_SOURCE_NAME = "depth-map-imagegen.png"
INPAINT_NAME = "fixed-background-inpaint-imagegen.png"
MID_THRESHOLD = 190
NEAR_THRESHOLD = 220
MIN_COMPONENT_AREA = 500
MID_SHIFT = (4, 2)
NEAR_SHIFT = (8, 4)


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


def two_edge_components(binary: np.ndarray, width: int, label: str) -> tuple[np.ndarray, list[tuple[int, int, int, int, int]]]:
    count, labels, stats, centroids = cv2.connectedComponentsWithStats(binary.astype(np.uint8), 8)
    candidates = [
        index
        for index in range(1, count)
        if int(stats[index, cv2.CC_STAT_AREA]) >= MIN_COMPONENT_AREA
    ]
    if len(candidates) != 2:
        raise ValueError(f"Expected exactly 2 {label} edge components, found {len(candidates)}")

    candidates.sort(key=lambda index: float(centroids[index][0]))
    left_index, right_index = candidates
    left_box = stats[left_index, :4]
    right_box = stats[right_index, :4]
    if int(left_box[cv2.CC_STAT_LEFT]) != 0:
        raise ValueError(f"Left {label} component does not touch the left canvas edge")
    if int(right_box[cv2.CC_STAT_LEFT] + right_box[cv2.CC_STAT_WIDTH]) != width:
        raise ValueError(f"Right {label} component does not touch the right canvas edge")
    if centroids[left_index][0] >= width / 2 or centroids[right_index][0] <= width / 2:
        raise ValueError(f"{label} components do not resolve to distinct left/right masses")

    selected = np.isin(labels, candidates)
    boxes = [
        (
            int(stats[index, cv2.CC_STAT_LEFT]),
            int(stats[index, cv2.CC_STAT_TOP]),
            int(stats[index, cv2.CC_STAT_WIDTH]),
            int(stats[index, cv2.CC_STAT_HEIGHT]),
            int(stats[index, cv2.CC_STAT_AREA]),
        )
        for index in candidates
    ]
    return selected, boxes


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

    width, height = master.size
    depth_pixels = np.asarray(depth)
    moving_union, moving_boxes = two_edge_components(
        depth_pixels >= MID_THRESHOLD, width, "moving-union"
    )
    near_selected, near_boxes = two_edge_components(
        (depth_pixels >= NEAR_THRESHOLD) & moving_union, width, "near"
    )
    mid_selected = moving_union & ~near_selected

    moving_mask = np.where(moving_union, 255, 0).astype(np.uint8)
    mid_mask = np.where(mid_selected, 255, 0).astype(np.uint8)
    near_mask = np.where(near_selected, 255, 0).astype(np.uint8)

    # Generated inpaint is consumed only under the complete two-island union.
    # Every unmasked master pixel remains byte-identical in the fixed far plate.
    far = Image.composite(inpaint, master, Image.fromarray(moving_mask, "L"))
    mid = save_rgba_cutout(master, mid_mask, EXPORT / "backdrop-mid.png")
    near = save_rgba_cutout(master, near_mask, EXPORT / "backdrop-near.png")

    master.save(EXPORT / "sector-03-central-exchange-background.png", format="PNG", optimize=True)
    depth.save(EXPORT / "sector-03-central-exchange-depth-map.png", format="PNG", optimize=True)
    far.save(EXPORT / "backdrop-far.png", format="PNG", optimize=True)

    neutral = alpha_over(far, [(mid, (0, 0)), (near, (0, 0))]).convert("RGB")
    neutral.save(PREVIEW / "sector-03-central-exchange-neutral.png", format="PNG", optimize=True)
    shifted = alpha_over(far, [(mid, MID_SHIFT), (near, NEAR_SHIFT)]).convert("RGB")
    shifted.save(PREVIEW / "sector-03-central-exchange-shifted.png", format="PNG", optimize=True)

    half = (width // 2, height // 2)
    pair = Image.new("RGB", (width, half[1]), "black")
    pair.paste(master.resize(half, Image.Resampling.NEAREST), (0, 0))
    pair.paste(depth.convert("RGB").resize(half, Image.Resampling.NEAREST), (half[0], 0))
    pair.save(PREVIEW / "sector-03-central-exchange-master-depth-pair.png", format="PNG", optimize=True)

    contact = Image.new("RGB", (width, height), (12, 14, 22))
    contact.paste(far.resize(half, Image.Resampling.NEAREST), (0, 0))
    contact.paste(preview_cutout(mid).resize(half, Image.Resampling.NEAREST), (half[0], 0))
    contact.paste(preview_cutout(near).resize(half, Image.Resampling.NEAREST), (0, half[1]))
    contact.paste(shifted.resize(half, Image.Resampling.NEAREST), (half[0], half[1]))
    contact.save(PREVIEW / "sector-03-central-exchange-layer-contact-sheet.png", format="PNG", optimize=True)

    neutral_difference = np.abs(
        np.asarray(master, dtype=np.int16) - np.asarray(neutral, dtype=np.int16)
    )
    outside_difference = np.abs(
        np.asarray(master, dtype=np.int16) - np.asarray(far, dtype=np.int16)
    )[~moving_union]
    print(
        "seam-match-v8-far-mid-near-depth-v1:",
        f"canvas={width}x{height}",
        f"mid_threshold={MID_THRESHOLD}",
        f"near_threshold={NEAR_THRESHOLD}",
        f"moving_boxes={moving_boxes}",
        f"near_boxes={near_boxes}",
        f"mid_pixels={int(mid_selected.sum())}",
        f"near_pixels={int(near_selected.sum())}",
        f"neutral_max_diff={int(neutral_difference.max())}",
        f"outside_mask_max_diff={int(outside_difference.max())}",
    )


if __name__ == "__main__":
    main()
