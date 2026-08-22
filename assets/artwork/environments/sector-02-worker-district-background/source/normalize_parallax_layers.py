from __future__ import annotations

import argparse
import hashlib
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw


TARGET_SIZE = (1024, 2176)


def load_nearest(path: Path) -> Image.Image:
    image = Image.open(path).convert("RGB")
    return image.resize(TARGET_SIZE, Image.Resampling.NEAREST)


def remove_baked_checkerboard(image: Image.Image) -> Image.Image:
    pixels = np.asarray(image, dtype=np.uint8)
    high = pixels.max(axis=2).astype(np.int16)
    low = pixels.min(axis=2).astype(np.int16)
    luminance = pixels.mean(axis=2)
    chroma = high - low

    # ImageGen previewed transparency as a near-white neutral checkerboard.
    # Sector 02 architecture is dark and its retained highlights are warm/cyan,
    # so neutral light pixels can be converted back into alpha. A short feather
    # band removes the white antialias fringe without softening colored lights.
    neutral = chroma <= 20
    neutral_alpha = np.clip((200.0 - luminance) / 80.0, 0.0, 1.0)
    alpha_float = np.where(neutral, neutral_alpha, 1.0)
    alpha = np.rint(alpha_float * 255.0).astype(np.uint8)

    # Remove the near-white matte from the feathered edge before compositing.
    matte = 245.0
    safe_alpha = np.maximum(alpha_float[..., None], 1.0 / 255.0)
    foreground = (
        pixels.astype(np.float32) - matte * (1.0 - safe_alpha)
    ) / safe_alpha
    foreground = np.clip(foreground, 0.0, 255.0).astype(np.uint8)

    rgba = np.dstack((foreground, alpha))
    rgba[alpha == 0, :3] = 0
    return Image.fromarray(rgba, mode="RGBA")


def checkerboard(size: tuple[int, int], cell: int = 24) -> Image.Image:
    width, height = size
    board = Image.new("RGB", size, (42, 46, 54))
    draw = ImageDraw.Draw(board)
    colors = ((42, 46, 54), (57, 62, 72))
    for y in range(0, height, cell):
        for x in range(0, width, cell):
            draw.rectangle(
                (x, y, min(x + cell - 1, width - 1), min(y + cell - 1, height - 1)),
                fill=colors[((x // cell) + (y // cell)) % 2],
            )
    return board


def make_review(far: Image.Image, mid: Image.Image, near: Image.Image, output: Path) -> None:
    composite = far.convert("RGBA")
    composite.alpha_composite(mid)
    composite.alpha_composite(near)

    thumb_size = (256, 544)
    panels = []
    for layer in (far.convert("RGBA"), mid, near, composite):
        preview = checkerboard(TARGET_SIZE).convert("RGBA")
        preview.alpha_composite(layer)
        panels.append(preview.resize(thumb_size, Image.Resampling.NEAREST).convert("RGB"))

    sheet = Image.new("RGB", (thumb_size[0] * 4, thumb_size[1]), (12, 14, 18))
    for index, panel in enumerate(panels):
        sheet.paste(panel, (thumb_size[0] * index, 0))
    sheet.save(output, format="PNG", optimize=True)


def report(path: Path) -> None:
    image = Image.open(path)
    alpha = image.getchannel("A") if "A" in image.getbands() else None
    histogram = alpha.histogram() if alpha else None
    alpha_summary = (
        f"alpha={alpha.getextrema()},transparent={histogram[0]},partial={sum(histogram[1:255])}"
        if alpha
        else "alpha=none"
    )
    digest = hashlib.sha256(path.read_bytes()).hexdigest().upper()
    print(
        f"{path.as_posix()} | {image.mode} | {image.width}x{image.height} | "
        f"{alpha_summary} | sha256={digest}"
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--far-source", type=Path, required=True)
    parser.add_argument("--mid-source", type=Path, required=True)
    parser.add_argument("--near-source", type=Path, required=True)
    parser.add_argument("--export-dir", type=Path, required=True)
    parser.add_argument("--preview-dir", type=Path, required=True)
    args = parser.parse_args()

    args.export_dir.mkdir(parents=True, exist_ok=True)
    args.preview_dir.mkdir(parents=True, exist_ok=True)

    far = load_nearest(args.far_source)
    mid = remove_baked_checkerboard(load_nearest(args.mid_source))
    near = remove_baked_checkerboard(load_nearest(args.near_source))

    far_path = args.export_dir / "backdrop-far-parallax-v1.png"
    mid_path = args.export_dir / "backdrop-mid-parallax-v1.png"
    near_path = args.export_dir / "backdrop-near-parallax-v1.png"
    composite_path = args.preview_dir / "sector-02-worker-district-parallax-composite-v1.png"
    sheet_path = args.preview_dir / "sector-02-worker-district-parallax-layers-v1.png"

    far.save(far_path, format="PNG", optimize=True)
    mid.save(mid_path, format="PNG", optimize=True)
    near.save(near_path, format="PNG", optimize=True)

    composite = far.convert("RGBA")
    composite.alpha_composite(mid)
    composite.alpha_composite(near)
    composite.convert("RGB").save(composite_path, format="PNG", optimize=True)
    make_review(far, mid, near, sheet_path)

    for path in (far_path, mid_path, near_path, composite_path, sheet_path):
        report(path)


if __name__ == "__main__":
    main()
