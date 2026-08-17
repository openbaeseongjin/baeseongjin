from __future__ import annotations

import argparse
import shutil
from pathlib import Path

from PIL import Image


def normalize_bright_neutral_matte(image: Image.Image) -> tuple[Image.Image, int]:
    rgba = image.convert("RGBA")
    pixels = list(rgba.get_flattened_data())
    normalized = []
    transparent_pixels = 0

    for red, green, blue, _alpha in pixels:
        is_matte = min(red, green, blue) >= 140 and max(red, green, blue) - min(red, green, blue) <= 60
        alpha = 0 if is_matte else 255
        transparent_pixels += int(alpha == 0)
        normalized.append((red, green, blue, alpha))

    rgba.putdata(normalized)
    return rgba, transparent_pixels


def main() -> None:
    parser = argparse.ArgumentParser(description="Normalize an ImageGen neutral matte into a binary alpha layer.")
    parser.add_argument("input", type=Path)
    parser.add_argument("source_copy", type=Path)
    parser.add_argument("export", type=Path)
    parser.add_argument("far", type=Path)
    parser.add_argument("near", type=Path)
    parser.add_argument("preview", type=Path)
    args = parser.parse_args()

    for path in (args.source_copy, args.export, args.preview):
        path.parent.mkdir(parents=True, exist_ok=True)

    shutil.copy2(args.input, args.source_copy)
    with Image.open(args.input) as source:
        normalized, transparent_pixels = normalize_bright_neutral_matte(source)
    normalized.save(args.export)

    with Image.open(args.far) as far_source, Image.open(args.near) as near_source:
        composite = far_source.convert("RGBA")
        composite.alpha_composite(normalized)
        composite.alpha_composite(near_source.convert("RGBA"))
        composite.convert("RGB").save(args.preview)

    pixel_count = normalized.width * normalized.height
    print(
        f"normalized={args.export} size={normalized.width}x{normalized.height} "
        f"transparent={transparent_pixels} opaque={pixel_count - transparent_pixels} preview={args.preview}"
    )


if __name__ == "__main__":
    main()
