from __future__ import annotations

from pathlib import Path
import sys

from PIL import Image

from normalize_generated_sheet import make_animation_preview
from normalize_idle_run_v2 import remove_chroma_background
from normalize_run_v3 import (
    FRAME_LABELS,
    frame_at,
    make_actions,
    make_locomotion,
    make_master,
    make_preview,
    make_run,
    make_run_preview,
)


BRIGHT_RED = (221, 39, 38, 255)
DARK_RED = (156, 19, 21, 255)
HAIR_DARK = (18, 15, 17, 255)
TRANSPARENT = (0, 0, 0, 0)
HAIR_ZONE = {(x, y) for y in range(4, 11) for x in range(3, 6)}

HAIR_PHASES = (
    {(4, 4), (5, 4), (3, 5), (4, 5), (5, 5), (4, 6), (5, 6)},
    {(5, 6), (4, 7), (5, 7), (3, 8), (4, 8), (5, 8), (4, 9), (5, 9)},
)

SCARF_PHASES = (
    {
        "bright": {(2, 10), (3, 10), (4, 10), (1, 11), (2, 11), (3, 11), (2, 12), (3, 12), (4, 12)},
        "dark": {(4, 11), (5, 11), (5, 12), (6, 12), (7, 12), (4, 13), (5, 13), (6, 13), (7, 13), (6, 14), (7, 14)},
    },
    {
        "bright": {(6, 12), (7, 12), (5, 13), (6, 13), (7, 13), (4, 14), (5, 14), (6, 14), (3, 15), (4, 15), (5, 15), (2, 16), (3, 16), (4, 16), (1, 17), (2, 17)},
        "dark": {(7, 14), (6, 15), (7, 15), (5, 16), (6, 16), (3, 17), (4, 17)},
    },
)


def is_red(pixel: tuple[int, int, int, int]) -> bool:
    return pixel[3] > 0 and pixel[0] > 100 and pixel[0] > pixel[1] * 1.5 and pixel[0] > pixel[2] * 1.25


def make_wind_frame(base: Image.Image, phase: int) -> Image.Image:
    frame = base.copy()
    for point in HAIR_ZONE:
        frame.putpixel(point, TRANSPARENT)
    for y in range(11, 19):
        for x in range(9):
            if is_red(frame.getpixel((x, y))):
                frame.putpixel((x, y), TRANSPARENT)
    for point in HAIR_PHASES[phase]:
        frame.putpixel(point, HAIR_DARK)
    for point in SCARF_PHASES[phase]["bright"]:
        frame.putpixel(point, BRIGHT_RED)
    for point in SCARF_PHASES[phase]["dark"]:
        frame.putpixel(point, DARK_RED)
    return frame


def main() -> None:
    if len(sys.argv) != 4:
        raise SystemExit("usage: normalize_rope_v4.py GENERATED_WIND_SHEET CURRENT_MASTER PLAYER_MAIN_DIRECTORY")
    generated_path = Path(sys.argv[1])
    current_master_path = Path(sys.argv[2])
    player_directory = Path(sys.argv[3])
    export_directory = player_directory / "export"
    preview_directory = player_directory / "preview"

    transparent = remove_chroma_background(Image.open(generated_path))
    transparent.save(player_directory / "source" / "rope-v4-wind-transparent.png")
    current_master = Image.open(current_master_path).convert("RGBA")
    frames = [frame_at(current_master, index, 8) for index in range(len(FRAME_LABELS))]
    base_rope = frames[12]
    frames[12:14] = [make_wind_frame(base_rope, phase) for phase in range(2)]

    make_master(frames).save(export_directory / "player-main-sprite-sheet.png")
    make_locomotion(frames).save(export_directory / "locomotion.png")
    make_run(frames).save(export_directory / "run.png")
    make_actions(frames).save(export_directory / "actions.png")
    make_preview(frames).save(preview_directory / "final-motion-review.png")
    make_run_preview(frames).save(preview_directory / "run-preview.png")
    make_animation_preview(frames[12:14], list(FRAME_LABELS[12:14]), [180, 180], preview_directory / "rope.gif")
    print(f"Normalized fixed-body rope wind v4 into {export_directory}: {len(frames)} total frames")


if __name__ == "__main__":
    main()
