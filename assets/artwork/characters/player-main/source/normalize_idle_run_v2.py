from __future__ import annotations

from pathlib import Path
import sys

from PIL import Image, ImageDraw

from normalize_generated_sheet import checker_tile, font, make_animation_preview


FRAME_SIZE = 24
GRID_COLUMNS = 6
FRAME_LABELS = (
    "idle-0",
    "idle-1",
    "run-0",
    "run-1",
    "run-2",
    "run-3",
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


def remove_chroma_background(image: Image.Image) -> Image.Image:
    rgb = image.convert("RGB")
    rgba = rgb.convert("RGBA")
    pixels = rgba.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            red, green, blue, _ = pixels[x, y]
            if green >= 100 and green - max(red, blue) >= 24 and green >= red * 1.3 and green >= blue * 1.12:
                pixels[x, y] = (red, green, blue, 0)
    return rgba


def crop_generated_cells(image: Image.Image) -> list[Image.Image]:
    cells = []
    for index in range(6):
        column = index % 3
        row = index // 3
        left = round(column * image.width / 3)
        right = round((column + 1) * image.width / 3)
        top = round(row * image.height / 2)
        bottom = round((row + 1) * image.height / 2)
        cell = image.crop((left, top, right, bottom))
        bounds = cell.getchannel("A").getbbox()
        if bounds is None:
            raise ValueError(f"Generated frame {FRAME_LABELS[index]} is empty")
        cells.append(cell.crop(bounds))
    return cells


def normalize_generated_frames(cells: list[Image.Image]) -> list[Image.Image]:
    idle_height = round(sum(cell.height for cell in cells[:2]) / 2)
    scale = min(21 / idle_height, min(22 / cell.width for cell in cells), min(22 / cell.height for cell in cells))
    frames = []
    for cell in cells:
        width = max(1, round(cell.width * scale))
        height = max(1, round(cell.height * scale))
        subject = cell.resize((width, height), Image.Resampling.NEAREST)
        frame = Image.new("RGBA", (FRAME_SIZE, FRAME_SIZE))
        frame.alpha_composite(subject, ((FRAME_SIZE - width) // 2, FRAME_SIZE - height - 1))
        frames.append(frame)
    for frame in frames[2:6]:
        pixels = frame.load()
        for y in range(FRAME_SIZE):
            for x in range(FRAME_SIZE // 2):
                red, green, blue, alpha = pixels[x, y]
                if alpha and min(red, green, blue) >= 180 and max(red, green, blue) - min(red, green, blue) <= 24:
                    pixels[x, y] = (220, 20, 35, alpha)
    return frames


def old_frame(sheet: Image.Image, index: int) -> Image.Image:
    column = index % 4
    row = index // 4
    return sheet.crop(
        (
            column * FRAME_SIZE,
            row * FRAME_SIZE,
            (column + 1) * FRAME_SIZE,
            (row + 1) * FRAME_SIZE,
        )
    )


def apply_existing_palette(frames: list[Image.Image], palette_source: Image.Image) -> list[Image.Image]:
    palette = palette_source.convert("RGB").quantize(colors=24, method=Image.Quantize.MEDIANCUT)
    normalized = []
    for frame in frames:
        alpha = frame.getchannel("A")
        rgb = Image.new("RGB", frame.size, (8, 10, 14))
        rgb.paste(frame.convert("RGB"), mask=alpha)
        indexed = rgb.quantize(palette=palette, dither=Image.Dither.NONE).convert("RGBA")
        indexed.putalpha(alpha)
        normalized.append(indexed)
    return normalized


def make_master(frames: list[Image.Image]) -> Image.Image:
    sheet = Image.new("RGBA", (FRAME_SIZE * GRID_COLUMNS, FRAME_SIZE * 3))
    for index, frame in enumerate(frames):
        sheet.alpha_composite(frame, ((index % GRID_COLUMNS) * FRAME_SIZE, (index // GRID_COLUMNS) * FRAME_SIZE))
    return sheet


def make_locomotion(frames: list[Image.Image]) -> Image.Image:
    sheet = Image.new("RGBA", (FRAME_SIZE * GRID_COLUMNS, FRAME_SIZE * 2))
    for index, frame in enumerate(frames[:6]):
        sheet.alpha_composite(frame, (index * FRAME_SIZE, 0))
    for column, frame in enumerate(frames[6:10]):
        sheet.alpha_composite(frame, (column * FRAME_SIZE, FRAME_SIZE))
    return sheet


def make_actions(frames: list[Image.Image]) -> Image.Image:
    sheet = Image.new("RGBA", (FRAME_SIZE * 5, FRAME_SIZE))
    for column, frame in enumerate(frames[10:15]):
        sheet.alpha_composite(frame, (column * FRAME_SIZE, 0))
    return sheet


def make_preview(frames: list[Image.Image]) -> Image.Image:
    tile_size = 120
    gap = 18
    margin = 24
    header = 50
    row_height = 164
    width = margin * 2 + tile_size * GRID_COLUMNS + gap * (GRID_COLUMNS - 1)
    height = header + row_height * 3 + 20
    preview = Image.new("RGB", (width, height), (15, 23, 42))
    draw = ImageDraw.Draw(preview)
    draw.text((margin, 14), "PLAYER-MAIN · IDLE/RUN V2 MOTION REVIEW", font=font(20), fill=(165, 243, 252))
    checker = checker_tile(tile_size)
    for index, (label, frame) in enumerate(zip(FRAME_LABELS, frames, strict=True)):
        column = index % GRID_COLUMNS
        row = index // GRID_COLUMNS
        x = margin + column * (tile_size + gap)
        y = header + row * row_height
        preview.paste(checker, (x, y))
        enlarged = frame.resize((tile_size, tile_size), Image.Resampling.NEAREST)
        preview.paste(enlarged, (x, y), enlarged)
        draw.text((x, y + tile_size + 6), label.upper(), font=font(14), fill=(241, 245, 249))
        draw.text((x, y + tile_size + 24), "24×24 → 48×48", font=font(11), fill=(148, 163, 184))
    return preview


def make_idle_run_preview(frames: list[Image.Image]) -> Image.Image:
    tile_size = 144
    gap = 24
    margin = 24
    width = margin * 2 + tile_size * 6 + gap * 5
    preview = Image.new("RGB", (width, 212), (15, 23, 42))
    draw = ImageDraw.Draw(preview)
    checker = checker_tile(tile_size)
    for index, frame in enumerate(frames[:6]):
        x = margin + index * (tile_size + gap)
        preview.paste(checker, (x, 12))
        enlarged = frame.resize((tile_size, tile_size), Image.Resampling.NEAREST)
        preview.paste(enlarged, (x, 12), enlarged)
        draw.text((x, 162), FRAME_LABELS[index].upper(), font=font(14), fill=(241, 245, 249))
        draw.text((x, 182), "24×24 → 48×48", font=font(11), fill=(148, 163, 184))
    return preview


def main() -> None:
    if len(sys.argv) != 4:
        raise SystemExit("usage: normalize_idle_run_v2.py GENERATED_SHEET V1_MASTER PLAYER_MAIN_DIRECTORY")
    generated_path = Path(sys.argv[1])
    v1_master_path = Path(sys.argv[2])
    player_directory = Path(sys.argv[3])
    export_directory = player_directory / "export"
    preview_directory = player_directory / "preview"

    transparent = remove_chroma_background(Image.open(generated_path))
    transparent.save(player_directory / "source" / "idle-run-v2-transparent.png")
    generated_frames = normalize_generated_frames(crop_generated_cells(transparent))
    v1_master = Image.open(v1_master_path).convert("RGBA")
    generated_frames = apply_existing_palette(generated_frames, v1_master)
    frames = generated_frames + [old_frame(v1_master, index) for index in range(4, 13)]

    make_master(frames).save(export_directory / "player-main-sprite-sheet.png")
    locomotion = make_locomotion(frames)
    locomotion.save(export_directory / "locomotion.png")
    locomotion.crop((0, 0, FRAME_SIZE * GRID_COLUMNS, FRAME_SIZE)).save(
        export_directory / "idle-run-blockout.png"
    )
    make_actions(frames).save(export_directory / "actions.png")
    make_preview(frames).save(preview_directory / "final-motion-review.png")
    make_idle_run_preview(frames).save(preview_directory / "idle-run-preview.png")

    make_animation_preview(frames[:2], list(FRAME_LABELS[:2]), [520, 520], preview_directory / "idle.gif")
    make_animation_preview(frames[2:6], list(FRAME_LABELS[2:6]), [90] * 4, preview_directory / "run.gif")
    print(f"Normalized idle/run v2 into {export_directory}: {len(frames)} total frames")


if __name__ == "__main__":
    main()
