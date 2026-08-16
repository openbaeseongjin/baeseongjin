from __future__ import annotations

from pathlib import Path
import sys

from PIL import Image, ImageDraw

from normalize_generated_sheet import checker_tile, font, make_animation_preview
from normalize_idle_run_v2 import remove_chroma_background
from normalize_run_v3 import frame_at, make_run, make_run_preview


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
    "rope-2",
    "rope-3",
    "hit-0",
    "hit-1",
    "respawn-0",
    "respawn-1",
    "respawn-2",
)

BRIGHT_RED = (221, 39, 38, 255)
DARK_RED = (156, 19, 21, 255)
HAIR_DARK = (18, 15, 17, 255)
TRANSPARENT = (0, 0, 0, 0)
HAIR_ZONE = {(x, y) for y in range(4, 11) for x in range(3, 6)}
SCARF_ZONE = {(x, y) for y in range(10, 16) for x in range(1, 8)}

# The y coordinate for the ribbon center from trailing tip x=1 to neck-side x=7.
# Every phase stays horizontally extended; only a shallow one-pixel crest travels
# toward the tip instead of making the whole scarf alternate vertically.
SCARF_CENTERLINES = (
    (13, 12, 12, 12, 12, 13, 13),
    (13, 13, 12, 11, 11, 12, 13),
    (12, 13, 13, 13, 12, 12, 13),
    (11, 11, 12, 13, 13, 12, 12),
)

HAIR_PHASES = (
    {(3, 6), (4, 5), (5, 5), (4, 6), (5, 6), (4, 7), (5, 7)},
    {(3, 6), (4, 6), (5, 5), (5, 6), (3, 7), (4, 7), (5, 7)},
    {(3, 7), (4, 6), (5, 6), (4, 7), (5, 7), (4, 8), (5, 8)},
    {(3, 6), (4, 5), (5, 6), (3, 7), (4, 7), (5, 7), (5, 8)},
)


def is_red(pixel: tuple[int, int, int, int]) -> bool:
    return pixel[3] > 0 and pixel[0] > 100 and pixel[0] > pixel[1] * 1.5 and pixel[0] > pixel[2] * 1.25


def make_backward_flow_frame(base: Image.Image, phase: int) -> Image.Image:
    frame = base.copy()
    for point in HAIR_ZONE:
        frame.putpixel(point, TRANSPARENT)
    for y in range(10, 19):
        for x in range(9):
            if is_red(frame.getpixel((x, y))):
                frame.putpixel((x, y), TRANSPARENT)

    for point in HAIR_PHASES[phase]:
        frame.putpixel(point, HAIR_DARK)

    for x, center_y in enumerate(SCARF_CENTERLINES[phase], start=1):
        frame.putpixel((x, center_y - 1), BRIGHT_RED)
        frame.putpixel((x, center_y), BRIGHT_RED)
        frame.putpixel((x, center_y + 1), DARK_RED)
    return frame


def make_master(frames: list[Image.Image]) -> Image.Image:
    sheet = Image.new("RGBA", (FRAME_SIZE * MASTER_COLUMNS, FRAME_SIZE * 3))
    for index, frame in enumerate(frames):
        sheet.alpha_composite(frame, ((index % MASTER_COLUMNS) * FRAME_SIZE, (index // MASTER_COLUMNS) * FRAME_SIZE))
    return sheet


def make_locomotion(frames: list[Image.Image]) -> Image.Image:
    sheet = Image.new("RGBA", (FRAME_SIZE * 6, FRAME_SIZE * 2))
    sheet.alpha_composite(frames[0], (0, 0))
    sheet.alpha_composite(frames[1], (FRAME_SIZE, 0))
    for column, frame in enumerate(frames[10:16]):
        sheet.alpha_composite(frame, (column * FRAME_SIZE, FRAME_SIZE))
    return sheet


def make_actions(frames: list[Image.Image]) -> Image.Image:
    sheet = Image.new("RGBA", (FRAME_SIZE * 5, FRAME_SIZE))
    for column, frame in enumerate(frames[16:21]):
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
    draw.text((margin, 12), "PLAYER-MAIN · FOUR-PHASE ROPE FLOW REVIEW", font=font(19), fill=(165, 243, 252))
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


def main() -> None:
    if len(sys.argv) != 4:
        raise SystemExit("usage: normalize_rope_v5.py GENERATED_FLOW_SHEET V4_MASTER PLAYER_MAIN_DIRECTORY")
    generated_path = Path(sys.argv[1])
    v4_master_path = Path(sys.argv[2])
    player_directory = Path(sys.argv[3])
    export_directory = player_directory / "export"
    preview_directory = player_directory / "preview"

    transparent = remove_chroma_background(Image.open(generated_path))
    transparent.save(player_directory / "source" / "rope-v5-backward-flow-transparent.png")
    v4_master = Image.open(v4_master_path).convert("RGBA")
    old_frames = [frame_at(v4_master, index, MASTER_COLUMNS) for index in range(19)]
    base_rope = old_frames[12]
    rope_frames = [make_backward_flow_frame(base_rope, phase) for phase in range(4)]
    frames = old_frames[:12] + rope_frames + old_frames[14:19]

    make_master(frames).save(export_directory / "player-main-sprite-sheet.png")
    make_locomotion(frames).save(export_directory / "locomotion.png")
    make_run(frames).save(export_directory / "run.png")
    make_actions(frames).save(export_directory / "actions.png")
    make_preview(frames).save(preview_directory / "final-motion-review.png")
    make_run_preview(frames).save(preview_directory / "run-preview.png")
    make_animation_preview(rope_frames, list(FRAME_LABELS[12:16]), [90] * 4, preview_directory / "rope.gif")
    print(f"Normalized four-phase backward rope flow v5 into {export_directory}: {len(frames)} total frames")


if __name__ == "__main__":
    main()
