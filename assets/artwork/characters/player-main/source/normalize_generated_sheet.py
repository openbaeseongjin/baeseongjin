from __future__ import annotations

from collections import deque
from pathlib import Path
import sys

from PIL import Image, ImageDraw, ImageFont


FRAME_SIZE = 24
FRAME_LABELS = (
    "idle-0",
    "idle-1",
    "run-0",
    "run-1",
    "jump",
    "fall",
    "rope-0",
    "rope-1",
    "hit-0",
    "hit-1",
    "respawn-0",
    "respawn-1",
    "respawn-2",
)
GROUNDED_FRAMES = frozenset({"idle-0", "idle-1", "run-0", "run-1", "hit-0", "hit-1"})


def is_checkerboard_pixel(pixel: tuple[int, int, int]) -> bool:
    return min(pixel) >= 225 and max(pixel) - min(pixel) <= 6


def remove_edge_connected_checkerboard(image: Image.Image) -> Image.Image:
    rgb = image.convert("RGB")
    width, height = rgb.size
    queue: deque[tuple[int, int]] = deque()
    for x in range(width):
        queue.append((x, 0))
        queue.append((x, height - 1))
    for y in range(height):
        queue.append((0, y))
        queue.append((width - 1, y))

    background: set[tuple[int, int]] = set()
    while queue:
        x, y = queue.popleft()
        if (x, y) in background or not is_checkerboard_pixel(rgb.getpixel((x, y))):
            continue
        background.add((x, y))
        if x > 0:
            queue.append((x - 1, y))
        if x + 1 < width:
            queue.append((x + 1, y))
        if y > 0:
            queue.append((x, y - 1))
        if y + 1 < height:
            queue.append((x, y + 1))

    rgba = rgb.convert("RGBA")
    alpha = Image.new("L", rgba.size, 255)
    alpha_pixels = alpha.load()
    for x, y in background:
        alpha_pixels[x, y] = 0

    # The generated RGB sheet antialiases dark sprite edges against its baked
    # checkerboard. Peel only neutral matte pixels connected to transparency;
    # enclosed bright details such as the eyes remain untouched.
    pixels = rgb.load()
    fringe: deque[tuple[int, int]] = deque()
    queued: set[tuple[int, int]] = set()

    def is_neutral_matte(x: int, y: int) -> bool:
        pixel = pixels[x, y]
        return min(pixel) >= 145 and max(pixel) - min(pixel) <= 10

    def touches_transparency(x: int, y: int) -> bool:
        return any(
            0 <= nx < width and 0 <= ny < height and alpha_pixels[nx, ny] == 0
            for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1))
        )

    for y in range(height):
        for x in range(width):
            if alpha_pixels[x, y] and is_neutral_matte(x, y) and touches_transparency(x, y):
                fringe.append((x, y))
                queued.add((x, y))

    while fringe:
        x, y = fringe.popleft()
        if alpha_pixels[x, y] == 0 or not is_neutral_matte(x, y) or not touches_transparency(x, y):
            continue
        alpha_pixels[x, y] = 0
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if (
                0 <= nx < width
                and 0 <= ny < height
                and (nx, ny) not in queued
                and alpha_pixels[nx, ny]
                and is_neutral_matte(nx, ny)
            ):
                fringe.append((nx, ny))
                queued.add((nx, ny))
    rgba.putalpha(alpha)
    return rgba


def crop_grid_cell(image: Image.Image, index: int) -> Image.Image:
    column = index % 4
    row = index // 4
    width, height = image.size
    left = round(column * width / 4)
    right = round((column + 1) * width / 4)
    top = round(row * height / 4)
    bottom = round((row + 1) * height / 4)
    return image.crop((left, top, right, bottom))


def normalize_frame(cell: Image.Image, label: str) -> Image.Image:
    alpha = cell.getchannel("A")
    bounds = alpha.getbbox()
    if bounds is None:
        raise ValueError(f"Frame {label} is empty")
    subject = cell.crop(bounds)
    max_extent = 22
    scale = min(max_extent / subject.width, max_extent / subject.height)
    width = max(1, round(subject.width * scale))
    height = max(1, round(subject.height * scale))
    subject = subject.resize((width, height), Image.Resampling.NEAREST)

    frame = Image.new("RGBA", (FRAME_SIZE, FRAME_SIZE))
    x = (FRAME_SIZE - width) // 2
    if label in GROUNDED_FRAMES:
        y = FRAME_SIZE - height - 1
    else:
        y = (FRAME_SIZE - height) // 2
    frame.alpha_composite(subject, (x, y))
    return frame


def quantize_consistently(sheet: Image.Image) -> Image.Image:
    alpha = sheet.getchannel("A")
    rgb = Image.new("RGB", sheet.size, (8, 10, 14))
    rgb.paste(sheet.convert("RGB"), mask=alpha)
    quantized = rgb.quantize(colors=24, method=Image.Quantize.MEDIANCUT).convert("RGB").convert("RGBA")
    quantized.putalpha(alpha)
    return quantized


def split_master_frames(master: Image.Image) -> list[Image.Image]:
    frames = []
    for index in range(len(FRAME_LABELS)):
        column = index % 4
        row = index // 4
        frames.append(
            master.crop(
                (
                    column * FRAME_SIZE,
                    row * FRAME_SIZE,
                    (column + 1) * FRAME_SIZE,
                    (row + 1) * FRAME_SIZE,
                )
            )
        )
    return frames


def make_master(frames: list[Image.Image]) -> Image.Image:
    sheet = Image.new("RGBA", (FRAME_SIZE * 4, FRAME_SIZE * 4))
    for index, frame in enumerate(frames):
        sheet.alpha_composite(frame, ((index % 4) * FRAME_SIZE, (index // 4) * FRAME_SIZE))
    return quantize_consistently(sheet)


def make_locomotion(frames: list[Image.Image]) -> Image.Image:
    sheet = Image.new("RGBA", (FRAME_SIZE * 4, FRAME_SIZE * 2))
    for index, frame in enumerate(frames[:8]):
        sheet.alpha_composite(frame, ((index % 4) * FRAME_SIZE, (index // 4) * FRAME_SIZE))
    return sheet


def make_actions(frames: list[Image.Image]) -> Image.Image:
    sheet = Image.new("RGBA", (FRAME_SIZE * 5, FRAME_SIZE))
    for index, frame in enumerate(frames[8:13]):
        sheet.alpha_composite(frame, (index * FRAME_SIZE, 0))
    return sheet


def font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    path = Path("C:/Windows/Fonts/malgun.ttf")
    if path.exists():
        return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()


def checker_tile(size: int) -> Image.Image:
    image = Image.new("RGB", (size, size), (54, 65, 82))
    draw = ImageDraw.Draw(image)
    step = 12
    colors = ((54, 65, 82), (78, 92, 112))
    for y in range(0, size, step):
        for x in range(0, size, step):
            draw.rectangle((x, y, x + step - 1, y + step - 1), fill=colors[(x // step + y // step) % 2])
    return image


def make_preview(frames: list[Image.Image]) -> Image.Image:
    tile_size = 144
    gap = 24
    margin = 24
    header = 50
    row_height = 188
    width = margin * 2 + tile_size * 4 + gap * 3
    height = header + row_height * 4 + 20
    preview = Image.new("RGB", (width, height), (15, 23, 42))
    draw = ImageDraw.Draw(preview)
    draw.text((margin, 14), "PLAYER-MAIN · FINAL MOTION REVIEW", font=font(20), fill=(165, 243, 252))
    checker = checker_tile(tile_size)
    for index, label in enumerate(FRAME_LABELS):
        column = index % 4
        row = index // 4
        x = margin + column * (tile_size + gap)
        y = header + row * row_height
        preview.paste(checker, (x, y))
        enlarged = frames[index].resize((tile_size, tile_size), Image.Resampling.NEAREST)
        preview.paste(enlarged, (x, y), enlarged)
        draw.text((x, y + tile_size + 7), label.upper(), font=font(15), fill=(241, 245, 249))
        draw.text((x, y + tile_size + 28), "24×24 → 48×48", font=font(12), fill=(148, 163, 184))
    return preview


def make_game_size_preview(frames: list[Image.Image]) -> Image.Image:
    cell = 64
    image = Image.new("RGB", (cell * 4, cell * 4), (15, 23, 42))
    checker = checker_tile(48)
    for index, frame in enumerate(frames):
        x = (index % 4) * cell + 8
        y = (index // 4) * cell + 8
        image.paste(checker, (x, y))
        doubled = frame.resize((48, 48), Image.Resampling.NEAREST)
        image.paste(doubled, (x, y), doubled)
    return image


def make_animation_preview(
    frames: list[Image.Image], labels: list[str], durations: list[int], output_path: Path
) -> None:
    rendered = []
    for frame, label in zip(frames, labels, strict=True):
        canvas = Image.new("RGB", (192, 224), (15, 23, 42))
        checker = checker_tile(168)
        canvas.paste(checker, (12, 12))
        enlarged = frame.resize((168, 168), Image.Resampling.NEAREST)
        canvas.paste(enlarged, (12, 12), enlarged)
        draw = ImageDraw.Draw(canvas)
        draw.text((14, 190), label.upper(), font=font(16), fill=(241, 245, 249))
        rendered.append(canvas)
    rendered[0].save(
        output_path,
        save_all=True,
        append_images=rendered[1:],
        duration=durations,
        loop=0,
        disposal=2,
    )


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: normalize_generated_sheet.py INPUT_RGB_SHEET PLAYER_MAIN_DIRECTORY")
    source_path = Path(sys.argv[1])
    player_directory = Path(sys.argv[2])
    export_directory = player_directory / "export"
    preview_directory = player_directory / "preview"
    export_directory.mkdir(parents=True, exist_ok=True)
    preview_directory.mkdir(parents=True, exist_ok=True)

    transparent = remove_edge_connected_checkerboard(Image.open(source_path))
    transparent.save(player_directory / "source" / "imagegen-master-sheet-transparent.png")

    normalized = [
        normalize_frame(crop_grid_cell(transparent, index), label)
        for index, label in enumerate(FRAME_LABELS)
    ]
    master = make_master(normalized)
    normalized = split_master_frames(master)

    master.save(export_directory / "player-main-sprite-sheet.png")
    locomotion = make_locomotion(normalized)
    locomotion.save(export_directory / "locomotion.png")
    locomotion.crop((0, 0, FRAME_SIZE * 4, FRAME_SIZE)).save(
        export_directory / "idle-run-blockout.png"
    )
    make_actions(normalized).save(export_directory / "actions.png")
    final_preview = make_preview(normalized)
    final_preview.save(preview_directory / "final-motion-review.png")
    final_preview.crop((0, 0, final_preview.width, 238)).save(
        preview_directory / "idle-run-preview.png"
    )
    make_game_size_preview(normalized).save(preview_directory / "game-size-review.png")

    animations = {
        "idle": ([0, 1], [360, 360]),
        "run": ([2, 3], [100, 100]),
        "jump": ([4], [1000]),
        "fall": ([5], [1000]),
        "rope": ([6, 7], [180, 180]),
        "hit": ([8, 9], [80, 160]),
        "respawn": ([10, 11, 12], [150, 150, 150]),
    }
    for state, (indices, durations) in animations.items():
        make_animation_preview(
            [normalized[index] for index in indices],
            [FRAME_LABELS[index] for index in indices],
            durations,
            preview_directory / f"{state}.gif",
        )

    print(f"Normalized {len(normalized)} frames into {export_directory}")


if __name__ == "__main__":
    main()
