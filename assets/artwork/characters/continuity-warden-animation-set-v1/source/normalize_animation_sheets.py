from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "source" / "imagegen"
LOGICAL = ROOT / "source" / "logical-64x96"
EXPORT = ROOT / "export"
FRAME_EXPORT = EXPORT / "frames"
PREVIEW = ROOT / "preview"

LOGICAL_SIZE = (64, 96)
OUTPUT_SIZE = (128, 192)
FOOT_Y = 93
TARGET_BODY_HEIGHT = 67
MAX_FRAME_WIDTH = 60

PALETTE = (
    (0, 0, 0),
    (8, 8, 10),
    (14, 13, 15),
    (20, 20, 22),
    (30, 29, 31),
    (36, 40, 44),
    (52, 59, 65),
    (72, 82, 91),
    (96, 108, 118),
    (126, 139, 149),
    (164, 176, 185),
    (0, 45, 58),
    (0, 91, 112),
    (0, 157, 185),
)


@dataclass(frozen=True)
class AnimationSpec:
    animation_id: str
    filename: str
    columns: int
    rows: int
    durations_ms: tuple[int, ...]
    loop: bool


ANIMATIONS = (
    AnimationSpec(
        "combat-idle",
        "combat-idle-sheet-imagegen.png",
        3,
        2,
        (240, 220, 220, 220, 220, 240),
        True,
    ),
    AnimationSpec(
        "baton-combo",
        "baton-combo-sheet-imagegen.png",
        3,
        3,
        (170, 90, 130, 150, 90, 140, 220, 100, 300),
        False,
    ),
    AnimationSpec(
        "guard",
        "guard-sheet-imagegen.png",
        3,
        2,
        (160, 140, 360, 90, 220, 180),
        False,
    ),
    AnimationSpec(
        "ground-dash",
        "ground-dash-sheet-imagegen.png",
        3,
        2,
        (150, 110, 80, 90, 150, 220),
        False,
    ),
)


def is_background(rgb: tuple[int, int, int]) -> bool:
    low = min(rgb)
    high = max(rgb)
    return low >= 205 and high - low <= 28


def transparent_cell(source: Image.Image, box: tuple[int, int, int, int]) -> Image.Image:
    cell = source.crop(box).convert("RGB")
    alpha = Image.new("L", cell.size)
    alpha.putdata([0 if is_background(pixel) else 255 for pixel in cell.get_flattened_data()])
    rgba = cell.convert("RGBA")
    rgba.putalpha(alpha)
    return rgba


def nearest_palette(rgb: tuple[int, int, int]) -> tuple[int, int, int]:
    return min(PALETTE, key=lambda color: sum((a - b) ** 2 for a, b in zip(rgb, color)))


def normalize_frame(cell: Image.Image, scale: float) -> Image.Image:
    bounds = cell.getbbox()
    if bounds is None:
        raise ValueError("ImageGen cell contains no foreground pixels")
    cropped = cell.crop(bounds)
    width = max(1, round(cropped.width * scale))
    height = max(1, round(cropped.height * scale))
    if width > LOGICAL_SIZE[0] or height > LOGICAL_SIZE[1]:
        raise ValueError(f"normalized frame exceeds logical canvas: {width}x{height}")
    resized = cropped.resize((width, height), Image.Resampling.NEAREST)
    pixels = []
    for red, green, blue, alpha in resized.get_flattened_data():
        if alpha == 0:
            pixels.append((0, 0, 0, 0))
            continue
        mapped = nearest_palette((red, green, blue))
        pixels.append((*mapped, 255))
    resized.putdata(pixels)

    frame = Image.new("RGBA", LOGICAL_SIZE, (0, 0, 0, 0))
    x = round((LOGICAL_SIZE[0] - width) / 2)
    y = FOOT_Y - height + 1
    frame.alpha_composite(resized, (x, y))
    return frame


def checker(size: tuple[int, int], step: int = 16) -> Image.Image:
    result = Image.new("RGB", size, (45, 52, 59))
    draw = ImageDraw.Draw(result)
    colors = ((45, 52, 59), (53, 61, 69))
    for y in range(0, size[1], step):
        for x in range(0, size[0], step):
            draw.rectangle((x, y, x + step - 1, y + step - 1), fill=colors[(x // step + y // step) % 2])
    return result


def preview_frame(frame: Image.Image) -> Image.Image:
    background = checker(OUTPUT_SIZE)
    background.paste(frame, (0, 0), frame)
    return background


def save_animation(spec: AnimationSpec) -> list[Image.Image]:
    source = Image.open(SOURCE / spec.filename).convert("RGB")
    if source.width % spec.columns or source.height % spec.rows:
        raise ValueError(f"{spec.filename} does not divide into {spec.columns}x{spec.rows}")
    cell_width = source.width // spec.columns
    cell_height = source.height // spec.rows
    cells = []
    for row in range(spec.rows):
        for column in range(spec.columns):
            cells.append(
                transparent_cell(
                    source,
                    (
                        column * cell_width,
                        row * cell_height,
                        (column + 1) * cell_width,
                        (row + 1) * cell_height,
                    ),
                )
            )
    if len(cells) != len(spec.durations_ms):
        raise ValueError(f"{spec.animation_id} frame count and timing count differ")

    bounds = [cell.getbbox() for cell in cells]
    if any(value is None for value in bounds):
        raise ValueError(f"{spec.animation_id} contains an empty cell")
    assert bounds[0] is not None
    first_height = bounds[0][3] - bounds[0][1]
    maximum_width = max(value[2] - value[0] for value in bounds if value is not None)
    scale = min(TARGET_BODY_HEIGHT / first_height, MAX_FRAME_WIDTH / maximum_width)
    logical_frames = [normalize_frame(cell, scale) for cell in cells]
    output_frames = [frame.resize(OUTPUT_SIZE, Image.Resampling.NEAREST) for frame in logical_frames]

    logical_dir = LOGICAL / spec.animation_id
    output_dir = FRAME_EXPORT / spec.animation_id
    logical_dir.mkdir(parents=True, exist_ok=True)
    output_dir.mkdir(parents=True, exist_ok=True)
    for index, (logical, output) in enumerate(zip(logical_frames, output_frames), start=1):
        logical.save(logical_dir / f"frame-{index:02d}.png")
        output.save(output_dir / f"frame-{index:02d}.png")

    atlas = Image.new("RGBA", (OUTPUT_SIZE[0] * len(output_frames), OUTPUT_SIZE[1]), (0, 0, 0, 0))
    for index, frame in enumerate(output_frames):
        atlas.alpha_composite(frame, (OUTPUT_SIZE[0] * index, 0))
    atlas.save(EXPORT / f"{spec.animation_id}.png")

    gif_frames = [preview_frame(frame) for frame in output_frames]
    gif_durations = list(spec.durations_ms)
    if not spec.loop:
        gif_durations[-1] += 500
    gif_frames[0].save(
        PREVIEW / f"{spec.animation_id}.gif",
        save_all=True,
        append_images=gif_frames[1:],
        duration=gif_durations,
        loop=0,
        disposal=2,
        optimize=False,
    )
    return output_frames


def save_review(all_frames: dict[str, list[Image.Image]]) -> None:
    label_height = 26
    row_height = OUTPUT_SIZE[1] + label_height
    review = Image.new("RGB", (OUTPUT_SIZE[0] * 9, row_height * len(ANIMATIONS)), (22, 27, 32))
    draw = ImageDraw.Draw(review)
    font = ImageFont.load_default()
    for row, spec in enumerate(ANIMATIONS):
        top = row * row_height
        draw.text((8, top + 7), spec.animation_id, fill=(224, 231, 237), font=font)
        for column, frame in enumerate(all_frames[spec.animation_id]):
            tile = checker(OUTPUT_SIZE)
            tile.paste(frame, (0, 0), frame)
            review.paste(tile, (column * OUTPUT_SIZE[0], top + label_height))
    review.save(PREVIEW / "animation-set-review.png")


def main() -> None:
    LOGICAL.mkdir(parents=True, exist_ok=True)
    EXPORT.mkdir(parents=True, exist_ok=True)
    FRAME_EXPORT.mkdir(parents=True, exist_ok=True)
    PREVIEW.mkdir(parents=True, exist_ok=True)
    all_frames = {spec.animation_id: save_animation(spec) for spec in ANIMATIONS}
    save_review(all_frames)


if __name__ == "__main__":
    main()
