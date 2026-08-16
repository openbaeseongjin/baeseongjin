from __future__ import annotations

from pathlib import Path
import sys

from PIL import Image, ImageDraw

from normalize_generated_sheet import checker_tile, font, make_animation_preview
from normalize_idle_run_v2 import apply_existing_palette, remove_chroma_background


FRAME_SIZE = 24
MASTER_COLUMNS = 8
FRAME_LABELS = (
    "idle-0",
    "idle-1",
    "run-0",
    "run-1",
    "run-2",
    "run-3",
    "run-4",
    "run-5",
    "run-6",
    "run-7",
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


def frame_at(sheet: Image.Image, index: int, columns: int) -> Image.Image:
    column = index % columns
    row = index // columns
    return sheet.crop(
        (
            column * FRAME_SIZE,
            row * FRAME_SIZE,
            (column + 1) * FRAME_SIZE,
            (row + 1) * FRAME_SIZE,
        )
    )


def crop_generated_cells(image: Image.Image) -> list[Image.Image]:
    cells = []
    for index in range(8):
        column = index % 4
        row = index // 4
        left = round(column * image.width / 4)
        right = round((column + 1) * image.width / 4)
        top = round(row * image.height / 2)
        bottom = round((row + 1) * image.height / 2)
        cell = image.crop((left, top, right, bottom))
        bounds = cell.getchannel("A").getbbox()
        if bounds is None:
            raise ValueError(f"Generated frame run-{index} is empty")
        cells.append(cell.crop(bounds))
    return cells


def normalize_run_frames(cells: list[Image.Image]) -> list[Image.Image]:
    scale = min(min(22 / cell.width for cell in cells), min(21 / cell.height for cell in cells))
    frames = []
    for cell in cells:
        width = max(1, round(cell.width * scale))
        height = max(1, round(cell.height * scale))
        subject = cell.resize((width, height), Image.Resampling.NEAREST)
        frame = Image.new("RGBA", (FRAME_SIZE, FRAME_SIZE))
        frame.alpha_composite(subject, ((FRAME_SIZE - width) // 2, FRAME_SIZE - height - 1))
        frames.append(frame)
    return frames


def make_master(frames: list[Image.Image]) -> Image.Image:
    sheet = Image.new("RGBA", (FRAME_SIZE * MASTER_COLUMNS, FRAME_SIZE * 3))
    for index, frame in enumerate(frames):
        sheet.alpha_composite(frame, ((index % MASTER_COLUMNS) * FRAME_SIZE, (index // MASTER_COLUMNS) * FRAME_SIZE))
    return sheet


def make_locomotion(frames: list[Image.Image]) -> Image.Image:
    sheet = Image.new("RGBA", (FRAME_SIZE * 4, FRAME_SIZE * 2))
    sheet.alpha_composite(frames[0], (0, 0))
    sheet.alpha_composite(frames[1], (FRAME_SIZE, 0))
    for column, frame in enumerate(frames[10:14]):
        sheet.alpha_composite(frame, (column * FRAME_SIZE, FRAME_SIZE))
    return sheet


def make_run(frames: list[Image.Image]) -> Image.Image:
    sheet = Image.new("RGBA", (FRAME_SIZE * 8, FRAME_SIZE))
    for column, frame in enumerate(frames[2:10]):
        sheet.alpha_composite(frame, (column * FRAME_SIZE, 0))
    return sheet


def make_actions(frames: list[Image.Image]) -> Image.Image:
    sheet = Image.new("RGBA", (FRAME_SIZE * 5, FRAME_SIZE))
    for column, frame in enumerate(frames[14:19]):
        sheet.alpha_composite(frame, (column * FRAME_SIZE, 0))
    return sheet


def make_preview(frames: list[Image.Image]) -> Image.Image:
    tile_size = 96
    gap = 14
    margin = 20
    header = 46
    row_height = 138
    width = margin * 2 + tile_size * MASTER_COLUMNS + gap * (MASTER_COLUMNS - 1)
    height = header + row_height * 3 + 16
    preview = Image.new("RGB", (width, height), (15, 23, 42))
    draw = ImageDraw.Draw(preview)
    draw.text((margin, 12), "PLAYER-MAIN · EIGHT-PHASE RUN REVIEW", font=font(19), fill=(165, 243, 252))
    checker = checker_tile(tile_size)
    for index, (label, frame) in enumerate(zip(FRAME_LABELS, frames, strict=True)):
        column = index % MASTER_COLUMNS
        row = index // MASTER_COLUMNS
        x = margin + column * (tile_size + gap)
        y = header + row * row_height
        preview.paste(checker, (x, y))
        enlarged = frame.resize((tile_size, tile_size), Image.Resampling.NEAREST)
        preview.paste(enlarged, (x, y), enlarged)
        draw.text((x, y + tile_size + 5), label.upper(), font=font(12), fill=(241, 245, 249))
        draw.text((x, y + tile_size + 21), "24×24 → 48×48", font=font(9), fill=(148, 163, 184))
    return preview


def make_run_preview(frames: list[Image.Image]) -> Image.Image:
    tile_size = 120
    gap = 16
    margin = 20
    width = margin * 2 + tile_size * 8 + gap * 7
    preview = Image.new("RGB", (width, 170), (15, 23, 42))
    draw = ImageDraw.Draw(preview)
    checker = checker_tile(tile_size)
    for index, frame in enumerate(frames[2:10]):
        x = margin + index * (tile_size + gap)
        preview.paste(checker, (x, 8))
        enlarged = frame.resize((tile_size, tile_size), Image.Resampling.NEAREST)
        preview.paste(enlarged, (x, 8), enlarged)
        draw.text((x, 133), f"RUN-{index}", font=font(12), fill=(241, 245, 249))
        draw.text((x, 149), "24×24 → 48×48", font=font(9), fill=(148, 163, 184))
    return preview


def main() -> None:
    if len(sys.argv) != 4:
        raise SystemExit("usage: normalize_run_v3.py GENERATED_RUN_SHEET V2_MASTER PLAYER_MAIN_DIRECTORY")
    generated_path = Path(sys.argv[1])
    v2_master_path = Path(sys.argv[2])
    player_directory = Path(sys.argv[3])
    export_directory = player_directory / "export"
    preview_directory = player_directory / "preview"

    transparent = remove_chroma_background(Image.open(generated_path))
    transparent.save(player_directory / "source" / "run-v3-transparent.png")
    v2_master = Image.open(v2_master_path).convert("RGBA")
    run_frames = normalize_run_frames(crop_generated_cells(transparent))
    run_frames = apply_existing_palette(run_frames, v2_master)
    frames = [frame_at(v2_master, index, 6) for index in range(2)]
    frames.extend(run_frames)
    frames.extend(frame_at(v2_master, index, 6) for index in range(6, 15))

    make_master(frames).save(export_directory / "player-main-sprite-sheet.png")
    make_locomotion(frames).save(export_directory / "locomotion.png")
    make_run(frames).save(export_directory / "run.png")
    make_actions(frames).save(export_directory / "actions.png")
    make_preview(frames).save(preview_directory / "final-motion-review.png")
    make_run_preview(frames).save(preview_directory / "run-preview.png")
    make_animation_preview(frames[2:10], list(FRAME_LABELS[2:10]), [90] * 8, preview_directory / "run.gif")
    print(f"Normalized run v3 into {export_directory}: {len(frames)} total frames")


if __name__ == "__main__":
    main()
