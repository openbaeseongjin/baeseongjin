from __future__ import annotations

from pathlib import Path
import sys

from PIL import Image, ImageDraw

from normalize_generated_sheet import (
    checker_tile,
    font,
    make_animation_preview,
    remove_edge_connected_checkerboard,
)
from normalize_idle_run_v2 import apply_existing_palette


FRAME_SIZE = 24
FRAME_COUNT = 8
GRID_COLUMNS = 4
GRID_ROWS = 2
FRAME_LABELS = tuple(f"release-spin-{index}" for index in range(FRAME_COUNT))


def crop_generated_cells(image: Image.Image) -> list[Image.Image]:
    cells = []
    for index in range(FRAME_COUNT):
        column = index % GRID_COLUMNS
        row = index // GRID_COLUMNS
        left = round(column * image.width / GRID_COLUMNS)
        right = round((column + 1) * image.width / GRID_COLUMNS)
        top = round(row * image.height / GRID_ROWS)
        bottom = round((row + 1) * image.height / GRID_ROWS)
        cell = image.crop((left, top, right, bottom))
        bounds = cell.getchannel("A").getbbox()
        if bounds is None:
            raise ValueError(f"Generated frame {FRAME_LABELS[index]} is empty")
        cells.append(cell.crop(bounds))
    return cells


def normalize_frames(cells: list[Image.Image]) -> list[Image.Image]:
    scale = min(min(22 / cell.width for cell in cells), min(22 / cell.height for cell in cells))
    frames = []
    for cell in cells:
        width = max(1, round(cell.width * scale))
        height = max(1, round(cell.height * scale))
        subject = cell.resize((width, height), Image.Resampling.NEAREST)
        frame = Image.new("RGBA", (FRAME_SIZE, FRAME_SIZE))
        frame.alpha_composite(subject, ((FRAME_SIZE - width) // 2, (FRAME_SIZE - height) // 2))
        frames.append(frame)
    return frames


def make_atlas(frames: list[Image.Image]) -> Image.Image:
    atlas = Image.new("RGBA", (FRAME_SIZE * FRAME_COUNT, FRAME_SIZE))
    for index, frame in enumerate(frames):
        atlas.alpha_composite(frame, (index * FRAME_SIZE, 0))
    return atlas


def make_review(frames: list[Image.Image]) -> Image.Image:
    tile_size = 120
    gap = 20
    margin = 24
    row_height = 164
    width = margin * 2 + tile_size * GRID_COLUMNS + gap * (GRID_COLUMNS - 1)
    review = Image.new("RGB", (width, row_height * GRID_ROWS + 8), (15, 23, 42))
    draw = ImageDraw.Draw(review)
    checker = checker_tile(tile_size)
    for index, frame in enumerate(frames):
        column = index % GRID_COLUMNS
        row = index // GRID_COLUMNS
        x = margin + column * (tile_size + gap)
        y = 8 + row * row_height
        review.paste(checker, (x, y))
        enlarged = frame.resize((tile_size, tile_size), Image.Resampling.NEAREST)
        review.paste(enlarged, (x, y), enlarged)
        draw.text((x, y + 124), FRAME_LABELS[index].upper(), font=font(12), fill=(241, 245, 249))
        draw.text((x, y + 143), "24×24 → 48×48", font=font(10), fill=(148, 163, 184))
    return review


def main() -> None:
    if len(sys.argv) != 4:
        raise SystemExit("usage: normalize_release_spin.py GENERATED_SHEET PALETTE_MASTER PLAYER_MAIN_DIRECTORY")
    generated_path = Path(sys.argv[1])
    palette_master_path = Path(sys.argv[2])
    player_directory = Path(sys.argv[3])
    export_directory = player_directory / "export"
    preview_directory = player_directory / "preview"

    generated = remove_edge_connected_checkerboard(Image.open(generated_path))
    generated.save(player_directory / "source" / "release-spin-v2-8phase-transparent.png")
    palette_master = Image.open(palette_master_path).convert("RGBA")
    frames = normalize_frames(crop_generated_cells(generated))
    frames = apply_existing_palette(frames, palette_master)

    make_atlas(frames).save(export_directory / "release-spin.png")
    make_review(frames).save(preview_directory / "release-spin-review.png")
    make_animation_preview(
        frames,
        list(FRAME_LABELS),
        [65] * FRAME_COUNT,
        preview_directory / "release-spin.gif",
    )
    print(
        f"Normalized {FRAME_COUNT} release-spin phases into {export_directory / 'release-spin.png'}"
    )


if __name__ == "__main__":
    main()
