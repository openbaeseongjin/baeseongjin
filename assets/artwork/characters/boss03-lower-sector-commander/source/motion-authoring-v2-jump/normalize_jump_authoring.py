from __future__ import annotations

from hashlib import sha256
from pathlib import Path
from collections import deque

from PIL import Image, ImageDraw, ImageFont


SOURCE_ROOT = Path(__file__).resolve().parent
CHARACTER_ROOT = SOURCE_ROOT.parents[1]
REPOSITORY_ROOT = CHARACTER_ROOT.parents[3]
EXPORT_ROOT = CHARACTER_ROOT / "export" / "motion-authoring-v2-jump"
PREVIEW_ROOT = CHARACTER_ROOT / "preview" / "motion-authoring-v2-jump"
RUNTIME_ROOT = REPOSITORY_ROOT / "assets" / "runtime" / "characters" / "lower-sector-commander-v1"
SOURCE_PATH = SOURCE_ROOT / "jump-6-imagegen.png"

GRID = (3, 2)
LOGICAL_SIZE = (128, 128)
OUTPUT_SIZE = (256, 256)
TARGET_REFERENCE_HEIGHT = 92
FRAME_BOTTOM_Y = (123, 117, 114, 118, 120, 123)
FRAME_DURATION_MS = (80, 80, 220, 180, 390, 300)

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


def grid_box(image: Image.Image, column: int, row: int) -> tuple[int, int, int, int]:
    columns, rows = GRID
    return (
        round(column * image.width / columns),
        round(row * image.height / rows),
        round((column + 1) * image.width / columns),
        round((row + 1) * image.height / rows),
    )


def is_checker(pixel: tuple[int, int, int]) -> bool:
    low = min(pixel)
    high = max(pixel)
    return low >= 185 and high - low <= 38


def transparent_cell(source: Image.Image, column: int, row: int) -> Image.Image:
    cell = source.crop(grid_box(source, column, row)).convert("RGBA")
    rgb = cell.convert("RGB")
    alpha = Image.new("L", cell.size)
    alpha.putdata([0 if is_checker(pixel) else 255 for pixel in rgb.get_flattened_data()])
    cell.putalpha(alpha)
    return cell


def nearest_palette(pixel: tuple[int, int, int]) -> tuple[int, int, int]:
    return min(PALETTE, key=lambda color: sum((left - right) ** 2 for left, right in zip(pixel, color)))


def remap(image: Image.Image) -> Image.Image:
    pixels = []
    for red, green, blue, alpha in image.get_flattened_data():
        pixels.append((0, 0, 0, 0) if alpha < 128 else (*nearest_palette((red, green, blue)), 255))
    image.putdata(pixels)
    return image


def retain_largest_component(image: Image.Image) -> Image.Image:
    alpha = image.getchannel("A")
    opaque = {(x, y) for y in range(image.height) for x in range(image.width) if alpha.getpixel((x, y)) >= 128}
    components: list[set[tuple[int, int]]] = []
    while opaque:
        start = opaque.pop()
        component = {start}
        queue = deque([start])
        while queue:
            x, y = queue.popleft()
            for offset_y in (-1, 0, 1):
                for offset_x in (-1, 0, 1):
                    if offset_x == 0 and offset_y == 0:
                        continue
                    neighbor = (x + offset_x, y + offset_y)
                    if neighbor in opaque:
                        opaque.remove(neighbor)
                        component.add(neighbor)
                        queue.append(neighbor)
        components.append(component)
    if not components:
        raise ValueError("Normalized jump frame has no opaque component")
    keep = max(components, key=len)
    cleaned = Image.new("RGBA", image.size, (0, 0, 0, 0))
    source_pixels = image.load()
    cleaned_pixels = cleaned.load()
    for x, y in keep:
        cleaned_pixels[x, y] = source_pixels[x, y]
    return cleaned


def normalize_frames(source: Image.Image) -> list[Image.Image]:
    cells = [transparent_cell(source, column, row) for row in range(GRID[1]) for column in range(GRID[0])]
    bounds = [cell.getbbox() for cell in cells]
    if any(bound is None for bound in bounds):
        raise ValueError("Jump source contains an empty frame")
    reference = bounds[0]
    assert reference is not None
    scale = TARGET_REFERENCE_HEIGHT / (reference[3] - reference[1])
    frames = []
    for index, (cell, bound, bottom_y) in enumerate(zip(cells, bounds, FRAME_BOTTOM_Y, strict=True)):
        assert bound is not None
        cropped = cell.crop(bound)
        width = max(1, round(cropped.width * scale))
        height = max(1, round(cropped.height * scale))
        if width > LOGICAL_SIZE[0] or height > LOGICAL_SIZE[1]:
            raise ValueError(f"Frame {index} exceeds the logical canvas after normalization: {width}x{height}")
        sprite = retain_largest_component(remap(cropped.resize((width, height), Image.Resampling.NEAREST)))
        frame = Image.new("RGBA", LOGICAL_SIZE, (0, 0, 0, 0))
        x = round((LOGICAL_SIZE[0] - width) / 2)
        y = bottom_y - height + 1
        if x < 0 or y < 0 or x + width > LOGICAL_SIZE[0] or y + height > LOGICAL_SIZE[1]:
            raise ValueError(f"Frame {index} would be clipped at ({x}, {y})")
        frame.alpha_composite(sprite, (x, y))
        frames.append(frame.resize(OUTPUT_SIZE, Image.Resampling.NEAREST))
    return frames


def save_atlas(frames: list[Image.Image], path: Path) -> None:
    atlas = Image.new("RGBA", (OUTPUT_SIZE[0] * len(frames), OUTPUT_SIZE[1]), (0, 0, 0, 0))
    for index, frame in enumerate(frames):
        atlas.alpha_composite(frame, (index * OUTPUT_SIZE[0], 0))
    path.parent.mkdir(parents=True, exist_ok=True)
    atlas.save(path)


def checker(size: tuple[int, int], step: int = 16) -> Image.Image:
    image = Image.new("RGB", size, (40, 45, 50))
    draw = ImageDraw.Draw(image)
    colors = ((40, 45, 50), (48, 54, 60))
    for y in range(0, size[1], step):
        for x in range(0, size[0], step):
            draw.rectangle((x, y, x + step - 1, y + step - 1), fill=colors[(x // step + y // step) % 2])
    return image


def save_review(frames: list[Image.Image], path: Path) -> None:
    label_height = 28
    review = Image.new("RGB", (OUTPUT_SIZE[0] * len(frames), OUTPUT_SIZE[1] + label_height), (18, 21, 24))
    draw = ImageDraw.Draw(review)
    font = ImageFont.load_default()
    labels = ("takeoff", "launch", "rise", "apex", "fall", "land")
    for index, (label, frame) in enumerate(zip(labels, frames, strict=True)):
        x = index * OUTPUT_SIZE[0]
        draw.text((x + 6, 8), label, fill=(230, 222, 205), font=font)
        tile = checker(OUTPUT_SIZE)
        tile.paste(frame, (0, 0), frame)
        review.paste(tile, (x, label_height))
    path.parent.mkdir(parents=True, exist_ok=True)
    review.save(path)


def save_gif(frames: list[Image.Image], path: Path) -> None:
    composed = []
    for frame in frames:
        tile = checker(OUTPUT_SIZE)
        tile.paste(frame, (0, 0), frame)
        composed.append(tile)
    path.parent.mkdir(parents=True, exist_ok=True)
    composed[0].save(
        path,
        save_all=True,
        append_images=composed[1:],
        duration=FRAME_DURATION_MS,
        loop=0,
        disposal=2,
    )


def digest(path: Path) -> str:
    return sha256(path.read_bytes()).hexdigest().upper()


def main() -> None:
    source = Image.open(SOURCE_PATH)
    frames = normalize_frames(source)
    atlas_path = EXPORT_ROOT / "jump.png"
    apex_path = EXPORT_ROOT / "jump-apex.png"
    review_path = PREVIEW_ROOT / "boss03-jump-motion-review.png"
    gif_path = PREVIEW_ROOT / "boss03-jump-motion.gif"
    save_atlas(frames, atlas_path)
    save_atlas(frames, RUNTIME_ROOT / "jump.png")
    frames[3].save(apex_path)
    save_review(frames, review_path)
    save_gif(frames, gif_path)
    print(f"source={source.mode} {source.width}x{source.height} sha256={digest(SOURCE_PATH)}")
    print(f"atlas=RGBA {OUTPUT_SIZE[0] * len(frames)}x{OUTPUT_SIZE[1]} sha256={digest(atlas_path)}")
    print(f"apex=RGBA {OUTPUT_SIZE[0]}x{OUTPUT_SIZE[1]} sha256={digest(apex_path)}")
    print(f"frames={len(frames)} durations_ms={FRAME_DURATION_MS}")


if __name__ == "__main__":
    main()
