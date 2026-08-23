from __future__ import annotations

from pathlib import Path

import cv2
import numpy as np
from PIL import Image


ASSET_ROOT = Path(__file__).resolve().parents[2]
SOURCE = Path(__file__).resolve().parent
EXPORT = ASSET_ROOT / "export" / "far-mid-near-v3-open-ascent-attached-master"
PREVIEW = ASSET_ROOT / "preview" / "far-mid-near-v3-open-ascent-attached-master"

MASTER_NAME = "sector-04-upper-residential-master.png"
DEPTH_RAW_NAME = "depth-map-imagegen.png"
DEPTH_NORMALIZED_NAME = "depth-map-normalized.png"
INPAINT_NAME = "fixed-background-inpaint-imagegen.png"
BUILDING_THRESHOLD = 128
NEAR_THRESHOLD = 224
MIN_COMPONENT_AREA = 500
BACKGROUND_APRON = 32
NEAR_HIDDEN_APRON = 8
MID_SHIFT = (4, 2)
NEAR_SHIFT = (8, 4)
REVERSE_MID_SHIFT = (-4, -2)
REVERSE_NEAR_SHIFT = (-8, -4)


def save_rgba_cutout(master: Image.Image, mask: np.ndarray, path: Path) -> Image.Image:
    pixels = np.asarray(master.convert("RGBA")).copy()
    pixels[:, :, 3] = mask
    image = Image.fromarray(pixels, "RGBA")
    image.save(path, format="PNG", optimize=True)
    return image


def alpha_over(
    base: Image.Image,
    overlays: list[tuple[Image.Image, tuple[int, int]]],
) -> Image.Image:
    result = base.convert("RGBA")
    for overlay, offset in overlays:
        result.alpha_composite(overlay, dest=offset)
    return result


def preview_cutout(cutout: Image.Image) -> Image.Image:
    checker = Image.new("RGB", cutout.size, (28, 30, 42)).convert("RGBA")
    return alpha_over(checker, [(cutout, (0, 0))]).convert("RGB")


def two_edge_components(
    binary: np.ndarray,
    width: int,
    label: str,
) -> tuple[np.ndarray, list[tuple[int, int, int, int, int]]]:
    count, labels, stats, centroids = cv2.connectedComponentsWithStats(
        binary.astype(np.uint8),
        8,
    )
    candidates = [
        index
        for index in range(1, count)
        if int(stats[index, cv2.CC_STAT_AREA]) >= MIN_COMPONENT_AREA
    ]
    if len(candidates) != 2:
        raise ValueError(
            f"Expected exactly 2 {label} edge components, found {len(candidates)}"
        )

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

    selected = np.zeros_like(binary, dtype=bool)
    boxes = []
    for position, index in enumerate(candidates):
        component = labels == index
        filled = np.zeros_like(component)
        for row in range(component.shape[0]):
            columns = np.flatnonzero(component[row])
            if columns.size == 0:
                continue
            if position == 0:
                filled[row, : int(columns.max()) + 1] = True
            else:
                filled[row, int(columns.min()) :] = True
        selected |= filled
        ys, xs = np.nonzero(filled)
        boxes.append(
            (
                int(xs.min()),
                int(ys.min()),
                int(xs.max() - xs.min() + 1),
                int(ys.max() - ys.min() + 1),
                int(filled.sum()),
            )
        )
    return selected, boxes


def add_background_apron(
    building_union: np.ndarray,
    width: int,
) -> tuple[np.ndarray, np.ndarray, list[tuple[int, int, int, int, int]]]:
    moving_union = np.zeros_like(building_union)
    patch_alpha = np.zeros_like(building_union, dtype=np.uint8)
    for row in range(building_union.shape[0]):
        columns = np.flatnonzero(building_union[row])
        left_columns = columns[columns < width // 2]
        right_columns = columns[columns >= width // 2]
        if left_columns.size:
            inner_edge = int(left_columns.max())
            apron_end = min(width - 1, inner_edge + BACKGROUND_APRON)
            moving_union[row, : apron_end + 1] = True
            patch_alpha[row, : inner_edge + 1] = 255
            for column in range(inner_edge + 1, apron_end + 1):
                distance = column - inner_edge
                patch_alpha[row, column] = round(
                    255 * (1 - distance / (BACKGROUND_APRON + 1))
                )
        if right_columns.size:
            inner_edge = int(right_columns.min())
            apron_start = max(0, inner_edge - BACKGROUND_APRON)
            moving_union[row, apron_start:] = True
            patch_alpha[row, inner_edge:] = 255
            for column in range(apron_start, inner_edge):
                distance = inner_edge - column
                patch_alpha[row, column] = round(
                    255 * (1 - distance / (BACKGROUND_APRON + 1))
                )

    boxes = []
    x_coordinates = np.arange(width)[None, :]
    for side_mask in (
        moving_union & (x_coordinates < width // 2),
        moving_union & (x_coordinates >= width // 2),
    ):
        ys, xs = np.nonzero(side_mask)
        boxes.append(
            (
                int(xs.min()),
                int(ys.min()),
                int(xs.max() - xs.min() + 1),
                int(ys.max() - ys.min() + 1),
                int(side_mask.sum()),
            )
        )
    return moving_union, patch_alpha, boxes


def add_near_hidden_apron(
    near_core: np.ndarray,
    moving_union: np.ndarray,
) -> np.ndarray:
    kernel_size = NEAR_HIDDEN_APRON * 2 + 1
    expanded = cv2.dilate(
        near_core.astype(np.uint8),
        np.ones((kernel_size, kernel_size), dtype=np.uint8),
        iterations=1,
    ).astype(bool)
    return expanded & moving_union


def main() -> None:
    EXPORT.mkdir(parents=True, exist_ok=True)
    PREVIEW.mkdir(parents=True, exist_ok=True)

    master = Image.open(SOURCE / MASTER_NAME).convert("RGB")
    raw_depth = Image.open(SOURCE / DEPTH_RAW_NAME).convert("L")
    inpaint = Image.open(SOURCE / INPAINT_NAME).convert("RGB")
    if inpaint.size != master.size:
        raise ValueError(
            f"Master and inpaint must share one canvas: "
            f"master={master.size}, inpaint={inpaint.size}"
        )

    depth = raw_depth.resize(master.size, Image.Resampling.NEAREST)
    depth.save(SOURCE / DEPTH_NORMALIZED_NAME, format="PNG", optimize=True)

    width, height = master.size
    depth_pixels = np.asarray(depth)
    building_union, building_boxes = two_edge_components(
        depth_pixels >= BUILDING_THRESHOLD,
        width,
        "building-union",
    )
    near_core, near_boxes = two_edge_components(
        (depth_pixels >= NEAR_THRESHOLD) & building_union,
        width,
        "near",
    )
    moving_union, far_patch_alpha, moving_boxes = add_background_apron(
        building_union,
        width,
    )
    near_selected = add_near_hidden_apron(near_core, moving_union)
    mid_selected = moving_union & ~near_core

    mid_mask = np.where(mid_selected, 255, 0).astype(np.uint8)
    near_mask = np.where(near_selected, 255, 0).astype(np.uint8)

    far = Image.composite(inpaint, master, Image.fromarray(far_patch_alpha, "L"))
    mid = save_rgba_cutout(master, mid_mask, EXPORT / "backdrop-mid.png")
    near = save_rgba_cutout(master, near_mask, EXPORT / "backdrop-near.png")

    master.save(
        EXPORT / "sector-04-upper-residential-background.png",
        format="PNG",
        optimize=True,
    )
    depth.save(
        EXPORT / "sector-04-upper-residential-depth-map.png",
        format="PNG",
        optimize=True,
    )
    far.save(EXPORT / "backdrop-far.png", format="PNG", optimize=True)

    neutral = alpha_over(far, [(mid, (0, 0)), (near, (0, 0))]).convert("RGB")
    neutral.save(
        PREVIEW / "sector-04-upper-residential-neutral.png",
        format="PNG",
        optimize=True,
    )
    shifted = alpha_over(far, [(mid, MID_SHIFT), (near, NEAR_SHIFT)]).convert("RGB")
    shifted.save(
        PREVIEW / "sector-04-upper-residential-shifted.png",
        format="PNG",
        optimize=True,
    )
    shifted_reverse = alpha_over(
        far,
        [(mid, REVERSE_MID_SHIFT), (near, REVERSE_NEAR_SHIFT)],
    ).convert("RGB")
    shifted_reverse.save(
        PREVIEW / "sector-04-upper-residential-shifted-reverse.png",
        format="PNG",
        optimize=True,
    )

    half = (width // 2, height // 2)
    pair = Image.new("RGB", (width, half[1]), "black")
    pair.paste(master.resize(half, Image.Resampling.NEAREST), (0, 0))
    pair.paste(depth.convert("RGB").resize(half, Image.Resampling.NEAREST), (half[0], 0))
    pair.save(
        PREVIEW / "sector-04-upper-residential-master-depth-pair.png",
        format="PNG",
        optimize=True,
    )

    contact = Image.new("RGB", (width, height), (12, 14, 22))
    contact.paste(far.resize(half, Image.Resampling.NEAREST), (0, 0))
    contact.paste(preview_cutout(mid).resize(half, Image.Resampling.NEAREST), (half[0], 0))
    contact.paste(preview_cutout(near).resize(half, Image.Resampling.NEAREST), (0, half[1]))
    contact.paste(shifted.resize(half, Image.Resampling.NEAREST), (half[0], half[1]))
    contact.save(
        PREVIEW / "sector-04-upper-residential-layer-contact-sheet.png",
        format="PNG",
        optimize=True,
    )

    neutral_difference = np.abs(
        np.asarray(master, dtype=np.int16) - np.asarray(neutral, dtype=np.int16)
    )
    outside_difference = np.abs(
        np.asarray(master, dtype=np.int16) - np.asarray(far, dtype=np.int16)
    )[~moving_union]
    print(
        "sector-04-far-mid-near-v3-open-ascent-attached-master:",
        f"canvas={width}x{height}",
        f"raw_depth_canvas={raw_depth.width}x{raw_depth.height}",
        f"building_threshold={BUILDING_THRESHOLD}",
        f"near_threshold={NEAR_THRESHOLD}",
        f"background_apron={BACKGROUND_APRON}",
        f"near_hidden_apron={NEAR_HIDDEN_APRON}",
        f"building_boxes={building_boxes}",
        f"moving_boxes={moving_boxes}",
        f"near_boxes={near_boxes}",
        f"mid_pixels={int(mid_selected.sum())}",
        f"near_core_pixels={int(near_core.sum())}",
        f"near_export_pixels={int(near_selected.sum())}",
        f"neutral_max_diff={int(neutral_difference.max())}",
        f"outside_mask_max_diff={int(outside_difference.max())}",
    )


if __name__ == "__main__":
    main()
