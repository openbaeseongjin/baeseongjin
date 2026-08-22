from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parent.parent
REFERENCES = ROOT / "source" / "references"
EXPORT_02 = ROOT / "export" / "sector-02-worker-district"
EXPORT_03 = ROOT / "export" / "sector-03-central-exchange"
PREVIEW = ROOT / "preview"
BAND = 512
STEPS = 16


def stepped_smooth(value: float) -> float:
    value = min(1.0, max(0.0, value))
    smooth = value * value * (3.0 - 2.0 * value)
    return round(smooth * (STEPS - 1)) / (STEPS - 1)


def blend_fixed_bottom(source: Image.Image, bottom_target: Image.Image) -> Image.Image:
    pixels = np.asarray(source.convert("RGB"), dtype=np.float32).copy()
    bottom = np.asarray(bottom_target.convert("RGB"), dtype=np.float32)
    height = pixels.shape[0]

    for distance in range(BAND):
        target_weight = stepped_smooth(1.0 - distance / (BAND - 1))
        bottom_y = height - 1 - distance
        pixels[bottom_y] = (
            pixels[bottom_y] * (1.0 - target_weight) + bottom[distance] * target_weight
        )

    return Image.fromarray(np.rint(pixels).astype(np.uint8), mode="RGB")


def fade_island_edges(image: Image.Image, fade_bottom: bool, fade_top: bool) -> Image.Image:
    pixels = np.asarray(image.convert("RGBA"), dtype=np.uint8).copy()
    height = pixels.shape[0]
    alpha = pixels[:, :, 3].astype(np.float32)

    for distance in range(BAND):
        visibility = stepped_smooth(distance / (BAND - 1))
        if fade_bottom:
            y = height - 1 - distance
            alpha[y] *= visibility
        if fade_top:
            y = distance
            alpha[y] *= visibility

    pixels[:, :, 3] = np.rint(alpha).astype(np.uint8)
    return Image.fromarray(pixels, mode="RGBA")


def composite(fixed: Image.Image, left: Image.Image, right: Image.Image) -> Image.Image:
    result = fixed.convert("RGBA")
    result.alpha_composite(left)
    result.alpha_composite(right)
    return result


def main() -> None:
    EXPORT_02.mkdir(parents=True, exist_ok=True)
    EXPORT_03.mkdir(parents=True, exist_ok=True)
    PREVIEW.mkdir(parents=True, exist_ok=True)

    sector01_far = Image.open(REFERENCES / "sector-01-backdrop-far.png")
    sector02_fixed = Image.open(EXPORT_02 / "backdrop-fixed.png").convert("RGB")
    sector02_left = Image.open(EXPORT_02 / "parallax-island-left.png").convert("RGBA")
    sector02_right = Image.open(EXPORT_02 / "parallax-island-right.png").convert("RGBA")
    sector03_fixed_source = Image.open(REFERENCES / "sector-03-backdrop-fixed.png")

    if sector01_far.width != sector02_fixed.width or sector03_fixed_source.width != sector02_fixed.width:
        raise RuntimeError("all seam plates must share one pixel width")
    if min(sector01_far.height, sector02_fixed.height, sector03_fixed_source.height) < BAND:
        raise RuntimeError("all seam plates must contain the full transition band")

    # Sector 02 is an immutable approved Runtime endpoint. Only the new Sector
    # 03 package converges toward its existing top band.
    sector03_fixed = blend_fixed_bottom(sector03_fixed_source, sector02_fixed)
    sector03_left = fade_island_edges(
        Image.open(REFERENCES / "sector-03-parallax-island-left.png"), True, False
    )
    sector03_right = fade_island_edges(
        Image.open(REFERENCES / "sector-03-parallax-island-right.png"), True, False
    )

    sector03_fixed.save(EXPORT_03 / "backdrop-fixed.png")
    sector03_left.save(EXPORT_03 / "parallax-island-left.png")
    sector03_right.save(EXPORT_03 / "parallax-island-right.png")

    sector02 = composite(sector02_fixed, sector02_left, sector02_right)
    sector03 = composite(sector03_fixed, sector03_left, sector03_right)
    boundary = Image.new("RGB", (sector02.width, BAND * 2))
    boundary.paste(sector03.crop((0, sector03.height - BAND, sector03.width, sector03.height)).convert("RGB"), (0, 0))
    boundary.paste(sector02.crop((0, 0, sector02.width, BAND)).convert("RGB"), (0, BAND))
    boundary.save(PREVIEW / "sector-02-03-boundary.png")

    s01 = np.asarray(sector01_far.convert("RGB"))
    s02 = np.asarray(sector02_fixed)
    s03 = np.asarray(sector03_fixed)
    s03_source = np.asarray(sector03_fixed_source.convert("RGB"))
    assertions = {
        "sector02BottomMatchesSector01Top": bool(np.array_equal(s02[-1], s01[0])),
        "sector02TopMatchesSector03Bottom": bool(np.array_equal(s02[0], s03[-1])),
        "sector02IslandTopAlpha": [
            int(np.asarray(sector02_left)[:, :, 3][0].max()),
            int(np.asarray(sector02_right)[:, :, 3][0].max()),
        ],
        "sector03IslandBottomAlpha": [
            int(np.asarray(sector03_left)[:, :, 3][-1].max()),
            int(np.asarray(sector03_right)[:, :, 3][-1].max()),
        ],
        "sector03OutsideBandUnchanged": bool(np.array_equal(s03[:-BAND], s03_source[:-BAND])),
    }
    if not assertions["sector02BottomMatchesSector01Top"] or not assertions["sector02TopMatchesSector03Bottom"]:
        raise RuntimeError(f"fixed plates do not meet at seam: {assertions}")
    if any(assertions["sector02IslandTopAlpha"] + assertions["sector03IslandBottomAlpha"]):
        raise RuntimeError(f"island alpha does not clear at seam: {assertions}")
    if not assertions["sector03OutsideBandUnchanged"]:
        raise RuntimeError(f"sector 03 changed outside the seam band: {assertions}")
    print("built", assertions)


if __name__ == "__main__":
    main()
