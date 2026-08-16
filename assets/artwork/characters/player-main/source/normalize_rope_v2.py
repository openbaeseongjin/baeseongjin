from __future__ import annotations

from pathlib import Path
import sys

from PIL import Image

from normalize_generated_sheet import make_animation_preview
from normalize_idle_run_v2 import apply_existing_palette, remove_chroma_background
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


FRAME_SIZE = 24


def crop_generated_cells(image: Image.Image) -> list[Image.Image]:
    cells = []
    for column in range(2):
        left = round(column * image.width / 2)
        right = round((column + 1) * image.width / 2)
        cell = image.crop((left, 0, right, image.height))
        bounds = cell.getchannel("A").getbbox()
        if bounds is None:
            raise ValueError(f"Generated frame rope-{column} is empty")
        cells.append(cell.crop(bounds))
    return cells


def normalize_rope_frames(cells: list[Image.Image]) -> list[Image.Image]:
    scale = min(21 / cell.height for cell in cells)
    frames = []
    for cell in cells:
        width = min(22, max(1, round(cell.width * scale * 1.25)))
        height = max(1, round(cell.height * scale))
        subject = cell.resize((width, height), Image.Resampling.NEAREST)
        frame = Image.new("RGBA", (FRAME_SIZE, FRAME_SIZE))
        frame.alpha_composite(subject, ((FRAME_SIZE - width) // 2, 1))
        frames.append(frame)
    return frames


def main() -> None:
    if len(sys.argv) != 4:
        raise SystemExit("usage: normalize_rope_v2.py GENERATED_ROPE_SHEET CURRENT_MASTER PLAYER_MAIN_DIRECTORY")
    generated_path = Path(sys.argv[1])
    current_master_path = Path(sys.argv[2])
    player_directory = Path(sys.argv[3])
    export_directory = player_directory / "export"
    preview_directory = player_directory / "preview"

    transparent = remove_chroma_background(Image.open(generated_path))
    transparent.save(player_directory / "source" / "rope-v2-transparent.png")
    current_master = Image.open(current_master_path).convert("RGBA")
    rope_frames = normalize_rope_frames(crop_generated_cells(transparent))
    rope_frames = apply_existing_palette(rope_frames, current_master)
    frames = [frame_at(current_master, index, 8) for index in range(len(FRAME_LABELS))]
    frames[12:14] = rope_frames

    make_master(frames).save(export_directory / "player-main-sprite-sheet.png")
    make_locomotion(frames).save(export_directory / "locomotion.png")
    make_run(frames).save(export_directory / "run.png")
    make_actions(frames).save(export_directory / "actions.png")
    make_preview(frames).save(preview_directory / "final-motion-review.png")
    make_run_preview(frames).save(preview_directory / "run-preview.png")
    make_animation_preview(frames[12:14], list(FRAME_LABELS[12:14]), [180, 180], preview_directory / "rope.gif")
    print(f"Normalized compact rope v2 into {export_directory}: {len(frames)} total frames")


if __name__ == "__main__":
    main()
