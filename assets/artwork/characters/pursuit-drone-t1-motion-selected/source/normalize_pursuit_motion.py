from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "source" / "pursuit-motion-imagegen.png"
EXPORT = ROOT / "export"
PREVIEW = ROOT / "preview"
SECTOR_01_BACKGROUND = (
    ROOT.parents[2]
    / "artwork"
    / "environments"
    / "sector-01-maintenance-vertical-backdrop"
    / "export"
    / "layers-v2"
    / "sector-01-maintenance-v2-layers-connected-v3-composite-preview.png"
)

FRAME_SIZE = 32
ROWS = 5
COLUMNS = 4
PREVIEW_SCALE = 6

STATES = (
    ("pursuit-seek", (27, 22), ((0, 0), (0, -1), (0, 0), (0, 1)), (160, 160, 160, 160)),
    ("pursuit-windup", (25, 23), ((0, 0), (-1, 0), (-2, 0), (-2, 1)), (70, 60, 60, 60)),
    ("pursuit-dash", (30, 18), ((0, 1), (1, 0), (2, 0), (1, 0)), (50, 50, 50, 50)),
    ("pursuit-recover", (27, 22), ((1, 0), (0, 1), (-1, 0), (0, -1)), (100, 120, 140, 140)),
    ("knockback", (26, 22), ((0, 0), (-2, -1), (-3, -2), (-1, -1)), (90, 90, 110, 140)),
)

# Transparent plus the six visible colors used by the selected Sector 01 family.
PALETTE = (
    (9, 15, 26, 255),
    (25, 37, 56, 255),
    (99, 91, 83, 255),
    (177, 166, 154, 255),
    (239, 68, 39, 255),
    (244, 171, 43, 255),
)


def nearest_palette_color(pixel: tuple[int, int, int, int]) -> tuple[int, int, int, int]:
    red, green, blue, _alpha = pixel
    return min(
        PALETTE,
        key=lambda color: (red - color[0]) ** 2 + (green - color[1]) ** 2 + (blue - color[2]) ** 2,
    )


def significant_mask(panel: Image.Image) -> Image.Image:
    rgba = panel.convert("RGBA")
    alpha = rgba.getchannel("A")
    if alpha.getextrema() == (255, 255):
        alpha = Image.new("L", rgba.size, 0)
        source = rgba.load()
        target = alpha.load()
        for y in range(rgba.height):
            for x in range(rgba.width):
                red, green, blue, _ = source[x, y]
                target[x, y] = 255 if max(red, green, blue) >= 16 else 0
    else:
        alpha = alpha.point(lambda value: 255 if value >= 96 else 0)

    pixels = alpha.load()
    visited: set[tuple[int, int]] = set()
    components: list[list[tuple[int, int]]] = []
    for y in range(alpha.height):
        for x in range(alpha.width):
            if pixels[x, y] == 0 or (x, y) in visited:
                continue
            component: list[tuple[int, int]] = []
            pending = deque([(x, y)])
            visited.add((x, y))
            while pending:
                current_x, current_y = pending.popleft()
                component.append((current_x, current_y))
                for next_y in range(max(0, current_y - 1), min(alpha.height, current_y + 2)):
                    for next_x in range(max(0, current_x - 1), min(alpha.width, current_x + 2)):
                        point = (next_x, next_y)
                        if pixels[next_x, next_y] == 0 or point in visited:
                            continue
                        visited.add(point)
                        pending.append(point)
            components.append(component)

    if not components:
        raise ValueError("generated panel contains no foreground pixels")
    largest_component = max(components, key=len)
    largest = len(largest_component)
    minimum = max(12, round(largest * 0.0125))
    largest_left = min(x for x, _y in largest_component)
    largest_top = min(y for _x, y in largest_component)
    largest_right = max(x for x, _y in largest_component)
    largest_bottom = max(y for _x, y in largest_component)
    proximity = round(max(alpha.size) * 0.16)
    cleaned = Image.new("L", alpha.size, 0)
    cleaned_pixels = cleaned.load()
    for component in components:
        if len(component) < minimum:
            continue
        component_left = min(x for x, _y in component)
        component_top = min(y for _x, y in component)
        component_right = max(x for x, _y in component)
        component_bottom = max(y for _x, y in component)
        if (
            component_right < largest_left - proximity
            or component_left > largest_right + proximity
            or component_bottom < largest_top - proximity
            or component_top > largest_bottom + proximity
        ):
            continue
        for x, y in component:
            cleaned_pixels[x, y] = 255
    return cleaned


def panel_bounds(source: Image.Image, column: int, row: int) -> tuple[int, int, int, int]:
    return (
        round(source.width * column / COLUMNS),
        round(source.height * row / ROWS),
        round(source.width * (column + 1) / COLUMNS),
        round(source.height * (row + 1) / ROWS),
    )


def normalize_frame(
    source: Image.Image,
    row: int,
    column: int,
    extent: tuple[int, int],
    offset: tuple[int, int],
) -> Image.Image:
    panel = source.crop(panel_bounds(source, column, row)).convert("RGBA")
    mask = significant_mask(panel)
    bounds = mask.getbbox()
    if bounds is None:
        raise ValueError(f"state row {row}, frame {column} contains no subject")
    panel.putalpha(mask)
    subject = panel.crop(bounds)
    scale = min(extent[0] / subject.width, extent[1] / subject.height)
    size = (max(1, round(subject.width * scale)), max(1, round(subject.height * scale)))
    subject = subject.resize(size, Image.Resampling.NEAREST)
    pixels = [
        (0, 0, 0, 0) if pixel[3] < 128 else nearest_palette_color(pixel)
        for pixel in subject.get_flattened_data()
    ]
    subject.putdata(pixels)

    frame = Image.new("RGBA", (FRAME_SIZE, FRAME_SIZE), (0, 0, 0, 0))
    x = (FRAME_SIZE - subject.width) // 2 + offset[0]
    y = (FRAME_SIZE - subject.height) // 2 + offset[1]
    frame.alpha_composite(subject, (x, y))
    return frame


def checkerboard(size: tuple[int, int], tile: int = 8) -> Image.Image:
    image = Image.new("RGBA", size, (26, 30, 37, 255))
    draw = ImageDraw.Draw(image)
    for y in range(0, size[1], tile):
        for x in range(0, size[0], tile):
            if (x // tile + y // tile) % 2 == 0:
                draw.rectangle((x, y, x + tile - 1, y + tile - 1), fill=(38, 43, 52, 255))
    return image


def build_review(frames_by_state: list[tuple[str, list[Image.Image]]]) -> None:
    label_width = 136
    label_height = 18
    cell = FRAME_SIZE * PREVIEW_SCALE
    width = label_width + COLUMNS * cell
    height = len(frames_by_state) * (cell + label_height)
    review = checkerboard((width, height), tile=12)
    draw = ImageDraw.Draw(review)
    font = ImageFont.load_default()
    for row, (state_id, frames) in enumerate(frames_by_state):
        top = row * (cell + label_height)
        draw.rectangle((0, top, label_width - 1, top + cell + label_height - 1), fill=(10, 15, 24, 255))
        draw.text((8, top + 8), state_id, fill=(235, 228, 211, 255), font=font)
        for column, frame in enumerate(frames):
            x = label_width + column * cell
            review.alpha_composite(frame.resize((cell, cell), Image.Resampling.NEAREST), (x, top + label_height))
            draw.text((x + 6, top + 4), f"f{column}", fill=(203, 213, 225, 255), font=font)
    review.convert("RGB").save(PREVIEW / "pursuit-motion-review.png", optimize=True)


def build_gif(state_id: str, frames: list[Image.Image], durations: tuple[int, ...]) -> None:
    gif_frames = []
    for frame in frames:
        canvas = checkerboard((FRAME_SIZE * 6, FRAME_SIZE * 6), tile=12)
        canvas.alpha_composite(frame.resize(canvas.size, Image.Resampling.NEAREST))
        gif_frames.append(canvas.convert("P", palette=Image.Palette.ADAPTIVE, colors=64))
    gif_frames[0].save(
        PREVIEW / f"{state_id}.gif",
        save_all=True,
        append_images=gif_frames[1:],
        duration=list(durations),
        loop=0,
        disposal=2,
        optimize=False,
    )


def build_behavior_cycle(frames_by_state: list[tuple[str, list[Image.Image]]]) -> None:
    gif_frames = []
    durations = []
    for (_state_id, frames), (_catalog_id, _extent, _offsets, state_durations) in zip(
        frames_by_state[:4], STATES[:4]
    ):
        for frame, duration in zip(frames, state_durations):
            canvas = checkerboard((FRAME_SIZE * 6, FRAME_SIZE * 6), tile=12)
            canvas.alpha_composite(frame.resize(canvas.size, Image.Resampling.NEAREST))
            gif_frames.append(canvas.convert("P", palette=Image.Palette.ADAPTIVE, colors=64))
            durations.append(duration)
    gif_frames[0].save(
        PREVIEW / "pursuit-behavior-cycle.gif",
        save_all=True,
        append_images=gif_frames[1:],
        duration=durations,
        loop=0,
        disposal=2,
        optimize=False,
    )


def build_gameplay_size_preview(frames_by_state: list[tuple[str, list[Image.Image]]]) -> None:
    size = (844, 390)
    if SECTOR_01_BACKGROUND.exists():
        background = Image.open(SECTOR_01_BACKGROUND).convert("RGBA")
        preview = ImageOps.fit(background, size, method=Image.Resampling.LANCZOS)
        preview = ImageEnhance.Brightness(preview).enhance(0.58)
    else:
        preview = Image.new("RGBA", size, (10, 15, 24, 255))

    draw = ImageDraw.Draw(preview)
    font = ImageFont.load_default()
    draw.rectangle((0, 0, size[0], 42), fill=(6, 10, 17, 220))
    draw.text(
        (16, 15),
        "Pursuit drone motion readability / exact 56 x 56 display size",
        fill=(235, 228, 211, 255),
        font=font,
    )

    positions = (92, 258, 424, 590, 756)
    frame_indices = (1, 3, 2, 0, 1)
    for x, frame_index, (state_id, frames) in zip(positions, frame_indices, frames_by_state):
        sprite = frames[frame_index].resize((56, 56), Image.Resampling.NEAREST)
        preview.alpha_composite(sprite, (x - 28, 184))
        label_box = draw.textbbox((0, 0), state_id, font=font)
        label_width = label_box[2] - label_box[0]
        draw.rectangle((x - label_width // 2 - 5, 250, x + label_width // 2 + 5, 270), fill=(6, 10, 17, 210))
        draw.text((x - label_width // 2, 256), state_id, fill=(235, 228, 211, 255), font=font)

    preview.convert("RGB").save(PREVIEW / "pursuit-motion-runtime-size-check.png", optimize=True)


def main() -> None:
    source = Image.open(SOURCE).convert("RGBA")
    EXPORT.mkdir(parents=True, exist_ok=True)
    PREVIEW.mkdir(parents=True, exist_ok=True)

    frames_by_state: list[tuple[str, list[Image.Image]]] = []
    atlas = Image.new("RGBA", (FRAME_SIZE * COLUMNS, FRAME_SIZE * ROWS), (0, 0, 0, 0))
    for row, (state_id, extent, offsets, durations) in enumerate(STATES):
        frames = [
            normalize_frame(source, row, column, extent, offsets[column]) for column in range(COLUMNS)
        ]
        frames_by_state.append((state_id, frames))
        for column, frame in enumerate(frames):
            path = EXPORT / f"{state_id}-{column:02d}.png"
            frame.save(path, optimize=True)
            atlas.alpha_composite(frame, (column * FRAME_SIZE, row * FRAME_SIZE))
        build_gif(state_id, frames, durations)

    atlas.save(EXPORT / "pursuit-motion.png", optimize=True)
    build_review(frames_by_state)
    build_behavior_cycle(frames_by_state)
    build_gameplay_size_preview(frames_by_state)

    print(f"source={source.size} mode={source.mode}")
    print(f"atlas={atlas.size} mode={atlas.mode}")
    for state_id, frames in frames_by_state:
        bounds = [frame.getchannel("A").getbbox() for frame in frames]
        colors = [
            len({pixel for pixel in frame.get_flattened_data() if pixel[3] > 0})
            for frame in frames
        ]
        print(f"{state_id}: frames={len(frames)} bounds={bounds} visible-colors={colors}")


if __name__ == "__main__":
    main()
