from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
LOGICAL_ROOT = ROOT / "source" / "logical"
EXPORT = ROOT / "export"
FRAME_EXPORT = EXPORT / "frames"
PREVIEW = ROOT / "preview"
CHARACTER_ROOT = ROOT.parents[1] / "characters" / "continuity-warden-animation-set-v1"

CHARACTER_SIZE = (64, 96)
CHARACTER_OUTPUT = (128, 192)
BEAM_SIZE = (64, 16)
TELEGRAPH_SIZE = (64, 32)

CYAN_DARK = (0, 45, 58, 255)
CYAN = (0, 157, 185, 255)
CYAN_LIGHT = (103, 232, 249, 255)
DASH = (56, 189, 248, 255)
WARNING_DARK = (112, 72, 12, 255)
WARNING = (251, 191, 36, 255)
WARNING_LIGHT = (255, 224, 132, 255)
HAZARD_DARK = (116, 31, 51, 255)
HAZARD = (251, 113, 133, 255)
HAZARD_LIGHT = (255, 241, 242, 255)
STEEL = (164, 176, 185, 255)


@dataclass(frozen=True)
class EffectClip:
    effect_id: str
    frames: tuple[Image.Image, ...]
    durations_ms: tuple[int, ...]
    loop: bool = False


def blank(size: tuple[int, int] = CHARACTER_SIZE) -> Image.Image:
    return Image.new("RGBA", size, (0, 0, 0, 0))


def draw_star(draw: ImageDraw.ImageDraw, center: tuple[int, int], radius: int, color: tuple[int, int, int, int]) -> None:
    x, y = center
    draw.line((x - radius, y, x + radius, y), fill=color, width=1)
    draw.line((x, y - radius, x, y + radius), fill=color, width=1)
    draw.line((x - radius + 1, y - radius + 1, x + radius - 1, y + radius - 1), fill=color, width=1)
    draw.line((x - radius + 1, y + radius - 1, x + radius - 1, y - radius + 1), fill=color, width=1)


def baton_frames() -> tuple[Image.Image, ...]:
    frames = [blank() for _ in range(9)]
    draw = ImageDraw.Draw(frames[0])
    draw.rectangle((12, 27, 14, 29), fill=WARNING)
    draw.point((16, 25), fill=WARNING_LIGHT)

    draw = ImageDraw.Draw(frames[1])
    draw.arc((18, 25, 58, 61), 208, 328, fill=WARNING_LIGHT, width=2)
    draw.arc((20, 28, 56, 58), 212, 325, fill=WARNING, width=1)
    draw_star(draw, (52, 42), 3, HAZARD_LIGHT)

    draw = ImageDraw.Draw(frames[2])
    draw.line((48, 39, 55, 36), fill=WARNING, width=1)
    draw.line((50, 44, 58, 45), fill=HAZARD, width=1)

    draw = ImageDraw.Draw(frames[3])
    draw.rectangle((10, 47, 12, 49), fill=WARNING)

    draw = ImageDraw.Draw(frames[4])
    draw.arc((5, 31, 48, 70), 25, 145, fill=WARNING_LIGHT, width=2)
    draw.arc((8, 34, 45, 67), 28, 142, fill=WARNING, width=1)
    draw_star(draw, (10, 50), 3, HAZARD_LIGHT)

    draw = ImageDraw.Draw(frames[5])
    draw.line((6, 47, 1, 43), fill=HAZARD, width=1)
    draw.line((8, 52, 2, 55), fill=WARNING, width=1)

    draw = ImageDraw.Draw(frames[6])
    draw.arc((12, 8, 48, 49), 195, 335, fill=WARNING, width=2)
    draw.rectangle((28, 8, 30, 10), fill=WARNING_LIGHT)

    draw = ImageDraw.Draw(frames[7])
    draw.line((31, 18, 31, 73), fill=WARNING_LIGHT, width=2)
    draw.line((28, 30, 28, 68), fill=WARNING, width=1)
    draw_star(draw, (31, 78), 4, HAZARD_LIGHT)

    draw = ImageDraw.Draw(frames[8])
    draw.line((18, 88, 29, 84, 38, 88, 49, 85), fill=HAZARD, width=1)
    draw.line((25, 91, 31, 86, 35, 91), fill=WARNING_DARK, width=1)
    return tuple(frames)


def guard_frames() -> tuple[Image.Image, ...]:
    frames = [blank() for _ in range(6)]
    draw = ImageDraw.Draw(frames[3])
    draw_star(draw, (51, 43), 6, HAZARD_LIGHT)
    draw.arc((40, 31, 63, 57), 90, 270, fill=WARNING_LIGHT, width=2)
    for end in ((61, 33), (63, 43), (60, 55)):
        draw.line((54, 43, *end), fill=HAZARD, width=1)
    draw = ImageDraw.Draw(frames[4])
    draw.arc((44, 35, 63, 53), 100, 260, fill=WARNING, width=1)
    draw.point((60, 37), fill=HAZARD)
    draw.point((62, 49), fill=HAZARD)
    return tuple(frames)


def dash_frames() -> tuple[Image.Image, ...]:
    frames = [blank() for _ in range(6)]
    draw = ImageDraw.Draw(frames[1])
    draw.rectangle((8, 45, 13, 50), fill=CYAN_DARK)
    draw.rectangle((5, 47, 9, 48), fill=CYAN)
    draw = ImageDraw.Draw(frames[2])
    draw.polygon(((14, 43), (2, 47), (14, 52)), fill=CYAN_DARK)
    draw.polygon(((14, 45), (5, 48), (14, 50)), fill=CYAN_LIGHT)
    draw = ImageDraw.Draw(frames[3])
    draw.polygon(((15, 43), (0, 47), (15, 53)), fill=CYAN)
    draw.line((0, 40, 15, 40), fill=DASH, width=1)
    draw.line((3, 57, 17, 57), fill=CYAN_DARK, width=1)
    draw = ImageDraw.Draw(frames[4])
    draw.line((8, 88, 19, 85), fill=STEEL, width=1)
    draw.line((34, 91, 46, 88), fill=WARNING_DARK, width=1)
    draw.point((13, 82), fill=CYAN)
    draw = ImageDraw.Draw(frames[5])
    draw.point((17, 87), fill=STEEL)
    draw.point((39, 89), fill=WARNING_DARK)
    return tuple(frames)


def charge_frames() -> tuple[Image.Image, ...]:
    frames = [blank() for _ in range(8)]
    draw = ImageDraw.Draw(frames[1])
    draw.ellipse((5, 40, 17, 52), outline=DASH, width=1)
    draw.rectangle((10, 44, 15, 48), fill=CYAN_LIGHT)
    draw = ImageDraw.Draw(frames[2])
    draw.polygon(((16, 40), (0, 46), (16, 54)), fill=CYAN)
    draw.polygon(((16, 43), (3, 47), (16, 51)), fill=CYAN_LIGHT)
    draw = ImageDraw.Draw(frames[3])
    draw.polygon(((17, 39), (0, 45), (17, 55)), fill=DASH)
    draw.polygon(((17, 43), (2, 47), (17, 51)), fill=HAZARD_LIGHT)
    draw.line((0, 35, 19, 35), fill=CYAN, width=1)
    draw.line((0, 60, 22, 60), fill=CYAN_DARK, width=1)
    draw = ImageDraw.Draw(frames[4])
    draw.polygon(((17, 40), (0, 44), (17, 55)), fill=CYAN)
    draw.line((0, 32, 21, 32), fill=DASH, width=1)
    draw.line((0, 63, 24, 63), fill=CYAN_DARK, width=1)
    draw = ImageDraw.Draw(frames[5])
    draw.line((7, 90, 26, 85), fill=STEEL, width=1)
    draw.line((30, 91, 51, 86), fill=WARNING, width=1)
    draw_star(draw, (47, 86), 2, HAZARD_LIGHT)
    draw = ImageDraw.Draw(frames[6])
    draw.arc((10, 61, 31, 86), 180, 340, fill=STEEL, width=1)
    draw.point((17, 67), fill=CYAN_DARK)
    return tuple(frames)


def security_command_frames() -> tuple[Image.Image, ...]:
    frames = [blank() for _ in range(6)]
    for index in (1, 2, 3, 4):
        draw = ImageDraw.Draw(frames[index])
        radius = 3 + (index % 3)
        draw.arc((53 - radius, 37 - radius, 53 + radius, 37 + radius), 210, 510, fill=CYAN_LIGHT, width=1)
        draw.rectangle((49, 34, 50, 36), fill=CYAN)
        draw.rectangle((56, 39, 58, 40), fill=CYAN_DARK)
        if index in (2, 3):
            draw.line((53, 29, 53, 33), fill=DASH, width=1)
            draw.line((59, 37, 62, 37), fill=DASH, width=1)
    return tuple(frames)


def beam_telegraph_frames() -> tuple[Image.Image, ...]:
    frames = []
    for phase in range(4):
        image = blank(BEAM_SIZE)
        draw = ImageDraw.Draw(image)
        draw.rectangle((0, 2, 63, 13), fill=(112, 72, 12, 255))
        for x in range(-phase * 4, 64, 12):
            draw.rectangle((x, 1, x + 6, 3), fill=WARNING_LIGHT)
            draw.rectangle((x + 4, 12, x + 10, 14), fill=WARNING)
        for x in range(4 + phase * 3, 64, 16):
            draw.point((x, 8), fill=WARNING_LIGHT)
        frames.append(image)
    return tuple(frames)


def beam_active_frames() -> tuple[Image.Image, ...]:
    widths = (2, 4, 6, 4)
    frames = []
    for width in widths:
        image = blank(BEAM_SIZE)
        draw = ImageDraw.Draw(image)
        draw.rectangle((0, 2, 63, 13), fill=HAZARD_DARK)
        center = 8
        draw.rectangle((0, center - width // 2, 63, center + width // 2), fill=HAZARD)
        draw.line((0, center, 63, center), fill=HAZARD_LIGHT, width=1)
        frames.append(image)
    return tuple(frames)


def telegraph_frames(charge: bool) -> tuple[Image.Image, ...]:
    frames = []
    color = WARNING if charge else DASH
    for phase in range(4):
        image = blank(TELEGRAPH_SIZE)
        draw = ImageDraw.Draw(image)
        y = 16
        for x in range(phase * 3, 64, 12):
            draw.line((x, y, min(x + 6, 63), y), fill=color, width=1)
        offset = phase % 2
        for x in (28 + offset, 42 + offset, 56 + offset):
            draw.line((x - 4, y - 4, x, y, x - 4, y + 4), fill=color, width=1)
        if charge:
            draw.line((2, 10, 2, 22), fill=WARNING_LIGHT, width=2)
        frames.append(image)
    return tuple(frames)


def clips() -> tuple[EffectClip, ...]:
    return (
        EffectClip("baton-electric-arc", baton_frames(), (170, 90, 130, 150, 90, 140, 220, 100, 300)),
        EffectClip("guard-block-impact", guard_frames(), (160, 140, 360, 90, 220, 180)),
        EffectClip("ground-dash-thruster", dash_frames(), (150, 110, 80, 90, 150, 220)),
        EffectClip("charge-thruster", charge_frames(), (180, 260, 160, 90, 90, 180, 420, 240)),
        EffectClip("security-command-glyph", security_command_frames(), (180, 160, 240, 240, 220, 200)),
        EffectClip("security-beam-telegraph", beam_telegraph_frames(), (160, 160, 160, 160), True),
        EffectClip("security-beam-active", beam_active_frames(), (100, 100, 100, 100), True),
        EffectClip("ground-dash-telegraph", telegraph_frames(False), (120, 120, 120, 120), True),
        EffectClip("charge-telegraph", telegraph_frames(True), (150, 150, 150, 150), True),
    )


def checker(size: tuple[int, int], step: int = 8) -> Image.Image:
    image = Image.new("RGB", size, (45, 52, 59))
    draw = ImageDraw.Draw(image)
    for y in range(0, size[1], step):
        for x in range(0, size[0], step):
            fill = (45, 52, 59) if (x // step + y // step) % 2 == 0 else (53, 61, 69)
            draw.rectangle((x, y, x + step - 1, y + step - 1), fill=fill)
    return image


def save_clip(clip: EffectClip) -> None:
    size = clip.frames[0].size
    if any(frame.size != size for frame in clip.frames):
        raise ValueError(f"{clip.effect_id} has mixed frame sizes")
    logical_dir = LOGICAL_ROOT / clip.effect_id
    frame_dir = FRAME_EXPORT / clip.effect_id
    logical_dir.mkdir(parents=True, exist_ok=True)
    frame_dir.mkdir(parents=True, exist_ok=True)
    scale = 2
    output_size = (size[0] * scale, size[1] * scale)
    outputs = []
    for index, frame in enumerate(clip.frames, start=1):
        frame.save(logical_dir / f"frame-{index:02d}.png")
        output = frame.resize(output_size, Image.Resampling.NEAREST)
        output.save(frame_dir / f"frame-{index:02d}.png")
        outputs.append(output)
    atlas = Image.new("RGBA", (output_size[0] * len(outputs), output_size[1]), (0, 0, 0, 0))
    for index, output in enumerate(outputs):
        atlas.alpha_composite(output, (index * output_size[0], 0))
    atlas.save(EXPORT / f"{clip.effect_id}.png")
    gifs = []
    for index, output in enumerate(outputs):
        base = checker(output_size, 16)
        base.paste(output, (0, 0), output)
        base.putpixel((0, 0), (45 + index % 2, 52, 59))
        gifs.append(base)
    durations = list(clip.durations_ms)
    if not clip.loop:
        durations[-1] += 420
    gifs[0].save(
        PREVIEW / f"{clip.effect_id}.gif",
        save_all=True,
        append_images=gifs[1:],
        duration=durations,
        loop=0,
        disposal=2,
        optimize=False,
    )


def character_frames(animation_id: str, count: int) -> tuple[Image.Image, ...]:
    return tuple(
        Image.open(CHARACTER_ROOT / "source" / "logical-64x96" / animation_id / f"frame-{index:02d}.png").convert(
            "RGBA"
        )
        for index in range(1, count + 1)
    )


def composite_preview(effect: EffectClip, animation_id: str) -> list[Image.Image]:
    characters = character_frames(animation_id, len(effect.frames))
    frames = []
    for character, overlay in zip(characters, effect.frames):
        combined = character.copy()
        combined.alpha_composite(overlay)
        output = combined.resize(CHARACTER_OUTPUT, Image.Resampling.NEAREST)
        base = checker(CHARACTER_OUTPUT, 16)
        base.paste(output, (0, 0), output)
        frames.append(base)
    frames[0].save(
        PREVIEW / f"composite-{animation_id}.gif",
        save_all=True,
        append_images=frames[1:],
        duration=list(effect.durations_ms),
        loop=0,
        disposal=2,
        optimize=False,
    )
    return frames


def save_review(effect_clips: tuple[EffectClip, ...]) -> None:
    mapping = {
        "baton-electric-arc": "baton-combo",
        "guard-block-impact": "guard",
        "ground-dash-thruster": "ground-dash",
        "charge-thruster": "charge",
        "security-command-glyph": "security-command",
    }
    rows: list[tuple[str, list[Image.Image]]] = []
    for effect in effect_clips:
        animation_id = mapping.get(effect.effect_id)
        if animation_id:
            rows.append((effect.effect_id, composite_preview(effect, animation_id)))
            continue
        output_size = (effect.frames[0].width * 2, effect.frames[0].height * 2)
        previews = []
        for frame in effect.frames:
            output = frame.resize(output_size, Image.Resampling.NEAREST)
            base = checker(output_size, 16)
            base.paste(output, (0, 0), output)
            previews.append(base)
        rows.append((effect.effect_id, previews))

    columns = max(len(frames) for _, frames in rows)
    column_width = CHARACTER_OUTPUT[0]
    label_height = 26
    row_heights = [max(frame.height for frame in frames) + label_height for _, frames in rows]
    review = Image.new("RGB", (column_width * columns, sum(row_heights)), (22, 27, 32))
    draw = ImageDraw.Draw(review)
    font = ImageFont.load_default()
    top = 0
    for (label, frames), row_height in zip(rows, row_heights):
        draw.text((8, top + 7), label, fill=(224, 231, 237), font=font)
        for index, frame in enumerate(frames):
            review.paste(frame, (index * column_width, top + label_height))
        top += row_height
    review.save(PREVIEW / "phase-1-vfx-review.png")


def main() -> None:
    LOGICAL_ROOT.mkdir(parents=True, exist_ok=True)
    EXPORT.mkdir(parents=True, exist_ok=True)
    FRAME_EXPORT.mkdir(parents=True, exist_ok=True)
    PREVIEW.mkdir(parents=True, exist_ok=True)
    effect_clips = clips()
    for clip in effect_clips:
        save_clip(clip)
    save_review(effect_clips)


if __name__ == "__main__":
    main()
