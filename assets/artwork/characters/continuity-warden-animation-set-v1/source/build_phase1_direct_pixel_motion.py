from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
LOGICAL_ROOT = ROOT / "source" / "logical-64x96"
PHASE_ROOT = ROOT.parent / "continuity-warden-phase-concepts" / "source" / "pixel-normalized-v3-player-style"
EXPORT = ROOT / "export"
FRAME_EXPORT = EXPORT / "frames"
PREVIEW = ROOT / "preview"

LOGICAL_SIZE = (64, 96)
OUTPUT_SIZE = (128, 192)
BACKGROUND = (45, 52, 59)
BACKGROUND_ALT = (53, 61, 69)
PALETTE = {
    "outline": (0, 0, 0, 255),
    "deep": (14, 13, 15, 255),
    "graphite": (36, 40, 44, 255),
    "steel": (72, 82, 91, 255),
    "highlight": (126, 139, 149, 255),
    "cyan": (0, 157, 185, 255),
}


@dataclass(frozen=True)
class Clip:
    animation_id: str
    frames: tuple[Image.Image, ...]
    durations_ms: tuple[int, ...]
    loop: bool = False


def load_frame(animation_id: str, number: int) -> Image.Image:
    return Image.open(LOGICAL_ROOT / animation_id / f"frame-{number:02d}.png").convert("RGBA")


def shift(image: Image.Image, dx: int, dy: int = 0) -> Image.Image:
    result = Image.new("RGBA", LOGICAL_SIZE, (0, 0, 0, 0))
    result.alpha_composite(image, (dx, dy))
    return result


def shift_region(image: Image.Image, box: tuple[int, int, int, int], dx: int, dy: int) -> Image.Image:
    result = image.copy()
    region = result.crop(box)
    transparent = Image.new("RGBA", region.size, (0, 0, 0, 0))
    result.paste(transparent, box)
    result.alpha_composite(region, (box[0] + dx, box[1] + dy))
    return result


def shift_regions(
    image: Image.Image,
    moves: tuple[tuple[tuple[int, int, int, int], int, int], ...],
) -> Image.Image:
    result = image.copy()
    pieces = tuple((image.crop(box), box, dx, dy) for box, dx, dy in moves)
    for piece, box, _, _ in pieces:
        result.paste(Image.new("RGBA", piece.size, (0, 0, 0, 0)), box)
    for piece, box, dx, dy in pieces:
        result.alpha_composite(piece, (box[0] + dx, box[1] + dy))
    return result


def upper_recoil(image: Image.Image, dx: int, dy: int = 0) -> Image.Image:
    result = image.copy()
    upper_box = (0, 22, 64, 68)
    upper = image.crop(upper_box)
    result.paste(Image.new("RGBA", upper.size, (0, 0, 0, 0)), upper_box)
    result.alpha_composite(upper, (dx, upper_box[1] + dy))
    return result


def clear_region(image: Image.Image, box: tuple[int, int, int, int]) -> Image.Image:
    result = image.copy()
    result.paste(Image.new("RGBA", (box[2] - box[0], box[3] - box[1]), (0, 0, 0, 0)), box)
    return result


def draw_baton(image: Image.Image, points: tuple[tuple[int, int], tuple[int, int]]) -> Image.Image:
    result = image.copy()
    draw = ImageDraw.Draw(result)
    draw.line(points, fill=PALETTE["outline"], width=5)
    draw.line(points, fill=PALETTE["steel"], width=3)
    draw.line(points, fill=PALETTE["cyan"], width=1)
    return result


def paste_piece(image: Image.Image, piece: Image.Image, position: tuple[int, int]) -> Image.Image:
    result = image.copy()
    result.alpha_composite(piece, position)
    return result


def without_baton(image: Image.Image) -> Image.Image:
    return clear_region(image, (3, 46, 15, 75))


def without_shield(image: Image.Image) -> Image.Image:
    return clear_region(image, (45, 43, 64, 82))


def dropped_baton(image: Image.Image) -> Image.Image:
    return draw_baton(image, ((5, 91), (22, 88)))


def flip(image: Image.Image) -> Image.Image:
    return image.transpose(Image.Transpose.FLIP_LEFT_RIGHT)


def checker(size: tuple[int, int], step: int = 16) -> Image.Image:
    result = Image.new("RGB", size, BACKGROUND)
    draw = ImageDraw.Draw(result)
    for y in range(0, size[1], step):
        for x in range(0, size[0], step):
            color = BACKGROUND if (x // step + y // step) % 2 == 0 else BACKGROUND_ALT
            draw.rectangle((x, y, x + step - 1, y + step - 1), fill=color)
    return result


def output_frame(frame: Image.Image) -> Image.Image:
    return frame.resize(OUTPUT_SIZE, Image.Resampling.NEAREST)


def preview_frame(frame: Image.Image) -> Image.Image:
    output = output_frame(frame)
    background = checker(OUTPUT_SIZE)
    background.paste(output, (0, 0), output)
    return background


def save_clip(clip: Clip, save_logical: bool = True) -> None:
    if len(clip.frames) != len(clip.durations_ms):
        raise ValueError(f"{clip.animation_id}: frame and timing counts differ")
    logical_dir = LOGICAL_ROOT / clip.animation_id
    frame_dir = FRAME_EXPORT / clip.animation_id
    if save_logical:
        logical_dir.mkdir(parents=True, exist_ok=True)
    frame_dir.mkdir(parents=True, exist_ok=True)
    outputs = []
    for index, frame in enumerate(clip.frames, start=1):
        if frame.size != LOGICAL_SIZE:
            raise ValueError(f"{clip.animation_id} frame {index} is not 64x96")
        if save_logical:
            frame.save(logical_dir / f"frame-{index:02d}.png")
        output = output_frame(frame)
        output.save(frame_dir / f"frame-{index:02d}.png")
        outputs.append(output)

    atlas = Image.new("RGBA", (OUTPUT_SIZE[0] * len(outputs), OUTPUT_SIZE[1]), (0, 0, 0, 0))
    for index, frame in enumerate(outputs):
        atlas.alpha_composite(frame, (OUTPUT_SIZE[0] * index, 0))
    atlas.save(EXPORT / f"{clip.animation_id}.png")

    gif_frames = [preview_frame(frame) for frame in clip.frames]
    durations = list(clip.durations_ms)
    if not clip.loop:
        durations[-1] += 420
    gif_frames[0].save(
        PREVIEW / f"{clip.animation_id}.gif",
        save_all=True,
        append_images=gif_frames[1:],
        duration=durations,
        loop=0,
        disposal=2,
        optimize=False,
    )


def main_clips() -> tuple[Clip, ...]:
    idle = tuple(load_frame("combat-idle", index) for index in range(1, 7))
    dash = tuple(load_frame("ground-dash", index) for index in range(1, 7))
    baton = tuple(load_frame("baton-combo", index) for index in range(1, 10))
    guard = tuple(load_frame("guard", index) for index in range(1, 7))
    security = Image.open(PHASE_ROOT / "phase-mid-security-chain-logical-64x96.png").convert("RGBA")
    counter_pose = Image.open(PHASE_ROOT / "phase-late-control-pressure-logical-64x96.png").convert("RGBA")
    shield_piece = idle[0].crop((44, 42, 64, 82))
    shield_floor_piece = shield_piece.transpose(Image.Transpose.ROTATE_90)
    rear_leg = (15, 68, 32, 96)
    lead_leg = (32, 68, 52, 96)

    walk = Clip(
        "walk",
        (
            shift_regions(idle[0], ((rear_leg, -2, 0), (lead_leg, 2, 0))),
            shift_regions(idle[1], ((rear_leg, -1, 0), (lead_leg, 1, 0))),
            shift_regions(idle[2], ((rear_leg, 1, -1), (lead_leg, -1, 0))),
            shift_regions(idle[3], ((rear_leg, 2, 0), (lead_leg, -2, 0))),
            shift_regions(idle[4], ((rear_leg, 1, 0), (lead_leg, -1, 0))),
            shift_regions(idle[5], ((rear_leg, -1, 0), (lead_leg, 1, -1))),
        ),
        (110, 110, 110, 110, 110, 110),
        True,
    )

    security_low_hand = shift_region(security, (41, 25, 64, 61), 0, 2)
    security_high_hand = shift_region(security, (41, 25, 64, 61), 0, -1)
    security_command = Clip(
        "security-command",
        (idle[0], security_low_hand, security, security_high_hand, security, idle[5]),
        (180, 160, 240, 240, 220, 200),
    )

    charge_travel = shift(dash[3], 1, 0)
    charge = Clip(
        "charge",
        (idle[0], dash[1], dash[2], dash[3], charge_travel, dash[4], baton[8], idle[5]),
        (180, 260, 160, 90, 90, 180, 420, 240),
    )

    hit_front = Clip(
        "hit-front",
        (idle[0], upper_recoil(idle[1], -2, 1), upper_recoil(idle[2], -4, 2), upper_recoil(idle[3], -1, 0)),
        (80, 90, 120, 160),
    )
    hit_back = Clip(
        "hit-back",
        (idle[0], upper_recoil(idle[1], 2, 1), upper_recoil(idle[2], 4, 2), upper_recoil(idle[3], 1, 0)),
        (80, 90, 120, 160),
    )
    turn = Clip(
        "turn",
        (idle[0], idle[1], flip(idle[1]), flip(idle[0])),
        (100, 80, 80, 120),
    )
    neutral_recovery = Clip(
        "neutral-recovery",
        (baton[8], dash[4], idle[3], idle[0]),
        (180, 180, 180, 220),
    )

    counter_ready = Clip(
        "counter-ready",
        (idle[0], guard[1], counter_pose, shift_region(counter_pose, (20, 27, 58, 66), -1, 1)),
        (140, 140, 220, 220),
        True,
    )
    counter_bash = Clip(
        "counter-bash",
        (counter_pose, guard[3], shift_region(guard[3], (18, 28, 64, 73), 3, 1), guard[4]),
        (80, 80, 100, 120),
    )
    back_swing = Clip(
        "back-swing",
        (baton[5], baton[4], baton[3], baton[8]),
        (180, 90, 110, 180),
    )
    diagonal_dash = Clip(
        "diagonal-dash",
        (
            idle[0],
            dash[1],
            shift(dash[2], 0, -1),
            shift(dash[3], 1, -4),
            shift(dash[4], 0, -3),
            shift(dash[5], 0, -1),
        ),
        (180, 150, 100, 100, 120, 160),
    )

    baton_free_1 = without_baton(upper_recoil(idle[1], 0, 1))
    baton_free_2 = without_baton(upper_recoil(idle[2], -1, 2))
    baton_drop = Clip(
        "defeated-baton-drop",
        (
            idle[0],
            draw_baton(baton_free_1, ((8, 61), (14, 75))),
            draw_baton(baton_free_2, ((10, 75), (20, 85))),
            dropped_baton(baton_free_2),
        ),
        (120, 120, 140, 220),
    )
    unarmed = without_baton(idle[2])
    shield_free = without_shield(unarmed)
    shield_fall = Clip(
        "defeated-shield-fall",
        (
            dropped_baton(unarmed),
            paste_piece(dropped_baton(shield_free), shield_piece, (42, 50)),
            paste_piece(dropped_baton(shield_free), shield_floor_piece, (34, 70)),
            paste_piece(dropped_baton(shield_free), shield_floor_piece, (34, 75)),
        ),
        (120, 120, 140, 220),
    )
    collapsed = without_shield(without_baton(baton[8]))
    unconscious = Clip(
        "defeated-unconscious",
        (
            paste_piece(dropped_baton(shield_free), shield_floor_piece, (34, 75)),
            paste_piece(dropped_baton(without_shield(without_baton(dash[5]))), shield_floor_piece, (34, 75)),
            paste_piece(dropped_baton(collapsed), shield_floor_piece, (34, 75)),
            paste_piece(dropped_baton(upper_recoil(collapsed, -1, 4)), shield_floor_piece, (34, 75)),
            paste_piece(dropped_baton(upper_recoil(collapsed, -2, 7)), shield_floor_piece, (34, 75)),
        ),
        (120, 120, 140, 180, 260),
    )

    return (
        walk,
        charge,
        security_command,
        hit_front,
        hit_back,
        turn,
        neutral_recovery,
        counter_ready,
        counter_bash,
        back_swing,
        diagonal_dash,
        baton_drop,
        shield_fall,
        unconscious,
    )


def derived_clips() -> tuple[Clip, ...]:
    baton = tuple(load_frame("baton-combo", index) for index in range(1, 10))
    guard = tuple(load_frame("guard", index) for index in range(1, 7))
    return (
        Clip("baton-1", baton[0:3], (170, 90, 130)),
        Clip("baton-2", baton[3:6], (150, 90, 140)),
        Clip("overhead-slam", baton[6:9], (220, 100, 300)),
        Clip("guard-enter", guard[0:3], (160, 140, 360)),
        Clip("guard-loop", (guard[2], guard[4]), (300, 300), True),
        Clip("guard-block", guard[2:5], (80, 90, 220)),
        Clip("guard-exit", guard[4:6], (160, 180)),
    )


def review_rows(clips: tuple[Clip, ...]) -> None:
    existing = (
        Clip("combat-idle", tuple(load_frame("combat-idle", i) for i in range(1, 7)), (1,) * 6, True),
        Clip("baton-combo", tuple(load_frame("baton-combo", i) for i in range(1, 10)), (1,) * 9),
        Clip("guard", tuple(load_frame("guard", i) for i in range(1, 7)), (1,) * 6),
        Clip("ground-dash", tuple(load_frame("ground-dash", i) for i in range(1, 7)), (1,) * 6),
    )
    rows = existing + clips
    columns = max(len(clip.frames) for clip in rows)
    label_height = 26
    row_height = OUTPUT_SIZE[1] + label_height
    review = Image.new("RGB", (OUTPUT_SIZE[0] * columns, row_height * len(rows)), (22, 27, 32))
    draw = ImageDraw.Draw(review)
    font = ImageFont.load_default()
    for row, clip in enumerate(rows):
        top = row * row_height
        draw.text((8, top + 7), clip.animation_id, fill=(224, 231, 237), font=font)
        for column, frame in enumerate(clip.frames):
            review.paste(preview_frame(frame), (column * OUTPUT_SIZE[0], top + label_height))
    review.save(PREVIEW / "phase-1-motion-review.png")


def main() -> None:
    clips = main_clips()
    for clip in clips:
        save_clip(clip)
    for clip in derived_clips():
        save_clip(clip, save_logical=False)
    review_rows(clips)


if __name__ == "__main__":
    main()
