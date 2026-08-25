from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


MOTION_ROOT = Path(__file__).resolve().parent
CHARACTER_ROOT = MOTION_ROOT.parents[1]
REPOSITORY_ROOT = CHARACTER_ROOT.parents[3]
EFFECT_ROOT = REPOSITORY_ROOT / "assets" / "artwork" / "effects" / "boss03-chain-hook-pull"
RUNTIME_ROOT = REPOSITORY_ROOT / "assets" / "runtime" / "characters" / "lower-sector-commander-v1"
MOTION_EXPORT = CHARACTER_ROOT / "export" / "runtime-v1"
EFFECT_EXPORT = EFFECT_ROOT / "export" / "runtime-v1"
MOTION_PREVIEW = CHARACTER_ROOT / "preview" / "runtime-v1"
EFFECT_PREVIEW = EFFECT_ROOT / "preview" / "runtime-v1"

LOGICAL_MOTION_SIZE = (128, 128)
MOTION_OUTPUT_SIZE = (256, 256)
MOTION_FOOT_Y = 123
TARGET_STANDING_HEIGHT = 92

PALETTE = (
    (0, 0, 0),
    (8, 8, 8),
    (15, 14, 13),
    (24, 22, 20),
    (34, 31, 28),
    (48, 44, 39),
    (63, 58, 51),
    (82, 75, 65),
    (104, 94, 80),
    (132, 118, 98),
    (165, 146, 116),
    (90, 40, 16),
    (137, 59, 20),
    (190, 78, 23),
    (249, 92, 20),
    (230, 205, 165),
)


@dataclass(frozen=True)
class MotionSpec:
    clip_id: str
    filename: str
    columns: int
    rows: int
    durations_ms: tuple[int, ...]
    loop: bool = False


MOTIONS = (
    MotionSpec("idle", "idle-4-imagegen.png", 4, 1, (320, 320, 320, 320), True),
    MotionSpec("walk", "walk-8-imagegen.png", 4, 2, (120, 120, 120, 120, 120, 120, 120, 120), True),
    MotionSpec("grab-lock", "grab-lock-4-imagegen.png", 4, 1, (200, 300, 400, 600)),
    MotionSpec("grab-pull", "grab-pull-6-imagegen.png", 3, 2, (120, 160, 220, 140, 180, 240)),
    MotionSpec("hammer-slam", "hammer-slam-8-imagegen.png", 4, 2, (180, 180, 200, 240, 70, 70, 120, 220)),
    MotionSpec("body-charge", "body-charge-6-imagegen.png", 3, 2, (300, 500, 120, 120, 120, 260)),
    MotionSpec("hit", "hit-3-imagegen.png", 3, 1, (80, 80, 120)),
    MotionSpec("defeated", "defeated-8-imagegen.png", 4, 2, (180, 180, 220, 260, 300, 360, 420, 600)),
)


def grid_box(image: Image.Image, column: int, row: int, columns: int, rows: int) -> tuple[int, int, int, int]:
    return (
        round(column * image.width / columns),
        round(row * image.height / rows),
        round((column + 1) * image.width / columns),
        round((row + 1) * image.height / rows),
    )


def checker_background(pixel: tuple[int, int, int]) -> bool:
    low = min(pixel)
    high = max(pixel)
    return low >= 185 and high - low <= 38


def transparent_cell(source: Image.Image, box: tuple[int, int, int, int]) -> Image.Image:
    cell = source.crop(box).convert("RGBA")
    source_alpha = cell.getchannel("A")
    if source.mode == "RGBA" and source_alpha.getextrema()[0] < 32:
        alpha = source_alpha.point(lambda value: 255 if value >= 40 else 0)
    else:
        rgb = cell.convert("RGB")
        alpha = Image.new("L", rgb.size)
        alpha.putdata([0 if checker_background(pixel) else 255 for pixel in rgb.get_flattened_data()])
    cell.putalpha(alpha)
    return cell


def nearest_palette(pixel: tuple[int, int, int]) -> tuple[int, int, int]:
    return min(PALETTE, key=lambda color: sum((left - right) ** 2 for left, right in zip(pixel, color)))


def remap_pixels(image: Image.Image) -> Image.Image:
    pixels = []
    for red, green, blue, alpha in image.get_flattened_data():
        if alpha < 128:
            pixels.append((0, 0, 0, 0))
        else:
            pixels.append((*nearest_palette((red, green, blue)), 255))
    image.putdata(pixels)
    return image


def normalized_frame(
    cell: Image.Image,
    logical_size: tuple[int, int],
    scale: float,
    *,
    bottom_y: int | None = None,
) -> Image.Image:
    bounds = cell.getbbox()
    if bounds is None:
        raise ValueError("ImageGen cell contains no foreground")
    cropped = cell.crop(bounds)
    width = max(1, round(cropped.width * scale))
    height = max(1, round(cropped.height * scale))
    if width > logical_size[0] or height > logical_size[1]:
        raise ValueError(
            f"Normalized content {width}x{height} exceeds logical canvas "
            f"{logical_size[0]}x{logical_size[1]}"
        )
    resized = remap_pixels(cropped.resize((width, height), Image.Resampling.NEAREST))
    frame = Image.new("RGBA", logical_size, (0, 0, 0, 0))
    x = round((logical_size[0] - width) / 2)
    y = round((logical_size[1] - height) / 2) if bottom_y is None else bottom_y - height + 1
    if x < 0 or y < 0 or x + width > logical_size[0] or y + height > logical_size[1]:
        raise ValueError("Normalized content would be clipped by its logical canvas")
    frame.alpha_composite(resized, (x, y))
    return frame


def checker(size: tuple[int, int], step: int = 16) -> Image.Image:
    image = Image.new("RGB", size, (40, 45, 50))
    draw = ImageDraw.Draw(image)
    colors = ((40, 45, 50), (48, 54, 60))
    for y in range(0, size[1], step):
        for x in range(0, size[0], step):
            draw.rectangle((x, y, x + step - 1, y + step - 1), fill=colors[(x // step + y // step) % 2])
    return image


def save_atlas(frames: list[Image.Image], path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    atlas = Image.new("RGBA", (frames[0].width * len(frames), frames[0].height), (0, 0, 0, 0))
    for index, frame in enumerate(frames):
        atlas.alpha_composite(frame, (index * frame.width, 0))
    atlas.save(path)


def motion_cells(spec: MotionSpec) -> list[Image.Image]:
    source = Image.open(MOTION_ROOT / spec.filename)
    cells = []
    for row in range(spec.rows):
        for column in range(spec.columns):
            cells.append(transparent_cell(source, grid_box(source, column, row, spec.columns, spec.rows)))
    if len(cells) != len(spec.durations_ms):
        raise ValueError(f"{spec.clip_id} frame and duration counts differ")
    return cells


def normalize_motion(spec: MotionSpec) -> list[Image.Image]:
    cells = motion_cells(spec)
    bounds = [cell.getbbox() for cell in cells]
    if any(bound is None for bound in bounds):
        raise ValueError(f"{spec.clip_id} contains an empty cell")
    first = bounds[0]
    assert first is not None
    first_height = first[3] - first[1]
    scale = TARGET_STANDING_HEIGHT / first_height
    logical_frames = [
        normalized_frame(cell, LOGICAL_MOTION_SIZE, scale, bottom_y=MOTION_FOOT_Y) for cell in cells
    ]
    output_frames = [frame.resize(MOTION_OUTPUT_SIZE, Image.Resampling.NEAREST) for frame in logical_frames]
    save_atlas(output_frames, MOTION_EXPORT / f"{spec.clip_id}.png")
    save_atlas(output_frames, RUNTIME_ROOT / f"{spec.clip_id}.png")
    return output_frames


def normalize_effect_sheet(
    source_path: Path,
    columns: int,
    rows: int,
    logical_size: tuple[int, int],
    output_size: tuple[int, int],
    maximum_content: tuple[int, int],
) -> list[Image.Image]:
    source = Image.open(source_path)
    cells = [
        transparent_cell(source, grid_box(source, column, row, columns, rows))
        for row in range(rows)
        for column in range(columns)
    ]
    bounds = [cell.getbbox() for cell in cells]
    if any(bound is None for bound in bounds):
        raise ValueError(f"{source_path.name} contains an empty cell")
    maximum_width = max(bound[2] - bound[0] for bound in bounds if bound is not None)
    maximum_height = max(bound[3] - bound[1] for bound in bounds if bound is not None)
    scale = min(maximum_content[0] / maximum_width, maximum_content[1] / maximum_height)
    logical = [normalized_frame(cell, logical_size, scale) for cell in cells]
    return [frame.resize(output_size, Image.Resampling.NEAREST) for frame in logical]


def chain_link_frame() -> Image.Image:
    source = Image.open(EFFECT_ROOT / "source" / "chain-extension-6-imagegen.png")
    cell = transparent_cell(source, grid_box(source, 2, 1, 3, 2))
    bounds = cell.getbbox()
    if bounds is None:
        raise ValueError("chain extension taut frame contains no foreground")
    left, top, right, bottom = bounds
    link_width = max(8, round((right - left) / 12))
    center_x = round(left + (right - left) * 0.55)
    crop = cell.crop((center_x - link_width, top, center_x + link_width, bottom))
    crop_bounds = crop.getbbox()
    if crop_bounds is None:
        raise ValueError("chain link crop contains no foreground")
    crop = crop.crop(crop_bounds)
    scale = min(14 / crop.width, 10 / crop.height)
    logical = normalized_frame(crop, (16, 12), scale)
    return logical.resize((32, 24), Image.Resampling.NEAREST)


def normalize_effects() -> dict[str, list[Image.Image]]:
    hook_frames = normalize_effect_sheet(
        EFFECT_ROOT / "source" / "hook-flight-4-imagegen.png",
        4,
        1,
        (32, 32),
        (64, 64),
        (29, 29),
    )
    tension_frames = normalize_effect_sheet(
        EFFECT_ROOT / "source" / "pull-tension-4-imagegen.png",
        4,
        1,
        (64, 32),
        (128, 64),
        (62, 28),
    )
    chain_link = chain_link_frame()
    for directory in (EFFECT_EXPORT, RUNTIME_ROOT):
        save_atlas(hook_frames, directory / "hook-flight.png")
        save_atlas(tension_frames, directory / "pull-tension.png")
        chain_link.save(directory / "chain-link.png")
    return {"hook-flight": hook_frames, "pull-tension": tension_frames, "chain-link": [chain_link]}


def save_review(rows: list[tuple[str, list[Image.Image]]], path: Path, cell_size: tuple[int, int]) -> None:
    label_height = 24
    columns = max(len(frames) for _, frames in rows)
    review = Image.new("RGB", (cell_size[0] * columns, (cell_size[1] + label_height) * len(rows)), (18, 21, 24))
    draw = ImageDraw.Draw(review)
    font = ImageFont.load_default()
    for row, (label, frames) in enumerate(rows):
        top = row * (cell_size[1] + label_height)
        draw.text((6, top + 6), label, fill=(230, 222, 205), font=font)
        for column, frame in enumerate(frames):
            tile = checker(cell_size)
            x = round((cell_size[0] - frame.width) / 2)
            y = round((cell_size[1] - frame.height) / 2)
            tile.paste(frame, (x, y), frame)
            review.paste(tile, (column * cell_size[0], top + label_height))
    path.parent.mkdir(parents=True, exist_ok=True)
    review.save(path)


def main() -> None:
    for directory in (MOTION_EXPORT, EFFECT_EXPORT, MOTION_PREVIEW, EFFECT_PREVIEW, RUNTIME_ROOT):
        directory.mkdir(parents=True, exist_ok=True)
    motion_rows = [(spec.clip_id, normalize_motion(spec)) for spec in MOTIONS]
    effects = normalize_effects()
    save_review(motion_rows, MOTION_PREVIEW / "boss03-motion-runtime-review.png", MOTION_OUTPUT_SIZE)
    save_review(list(effects.items()), EFFECT_PREVIEW / "boss03-chain-hook-runtime-review.png", (128, 64))


if __name__ == "__main__":
    main()
