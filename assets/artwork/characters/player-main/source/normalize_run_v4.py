from __future__ import annotations

from pathlib import Path
import sys

from PIL import Image

from normalize_idle_run_v2 import apply_existing_palette, remove_chroma_background
from normalize_run_v3 import (
    FRAME_LABELS,
    crop_generated_cells,
    frame_at,
    make_actions,
    make_locomotion,
    make_master,
    make_preview,
    make_run,
    make_run_preview,
    normalize_run_frames,
)
from normalize_generated_sheet import make_animation_preview


def main() -> None:
    if len(sys.argv) != 4:
        raise SystemExit("usage: normalize_run_v4.py GENERATED_RUN_SHEET V2_MASTER PLAYER_MAIN_DIRECTORY")
    generated_path = Path(sys.argv[1])
    v2_master_path = Path(sys.argv[2])
    player_directory = Path(sys.argv[3])
    export_directory = player_directory / "export"
    preview_directory = player_directory / "preview"

    transparent = remove_chroma_background(Image.open(generated_path))
    transparent.save(player_directory / "source" / "run-v4-transparent.png")
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
    print(f"Normalized compact run v4 into {export_directory}: {len(frames)} total frames")


if __name__ == "__main__":
    main()
