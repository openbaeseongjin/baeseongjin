from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
EXPORT = ROOT / "export"
PREVIEW = ROOT / "preview"
CELL = 32
SCALE = 10

TRANSPARENT = (0, 0, 0, 0)
OUTLINE = (5, 13, 23, 255)
SHADOW = (8, 20, 35, 255)
BODY = (14, 35, 57, 255)
BODY_LIGHT = (28, 57, 83, 255)
METAL = (82, 81, 75, 255)
METAL_LIGHT = (122, 116, 103, 255)
RED_DARK = (91, 16, 15, 255)
RED = (236, 48, 34, 255)
ORANGE = (255, 116, 25, 255)
AMBER = (255, 184, 24, 255)
WHITE_HOT = (255, 243, 196, 255)
PREVIEW_BG = (5, 13, 23, 255)
PREVIEW_PANEL = (12, 27, 43, 255)
PREVIEW_TEXT = (210, 220, 226, 255)


FRAMES = (
    {"name": "idle-00", "state": "idle", "shutter": 0, "eye": 0, "projector": 0},
    {"name": "idle-01", "state": "idle", "shutter": 0, "eye": 0, "projector": 1},
    {"name": "idle-02", "state": "idle", "shutter": 0, "eye": 0, "projector": 0},
    {"name": "acquire-00", "state": "telegraph", "shutter": 0, "eye": 1, "projector": 1},
    {"name": "acquire-01", "state": "telegraph", "shutter": 1, "eye": 2, "projector": 1},
    {"name": "acquire-02", "state": "telegraph", "shutter": 2, "eye": 3, "projector": 2},
    {"name": "acquire-03", "state": "telegraph", "shutter": 2, "eye": 2, "projector": 2},
    {"name": "acquire-04", "state": "telegraph", "shutter": 1, "eye": 1, "projector": 1},
    {"name": "cooldown-00", "state": "cooldown", "shutter": 1, "eye": 1, "projector": 1},
    {"name": "cooldown-01", "state": "cooldown", "shutter": 0, "eye": 1, "projector": 0},
    {"name": "cooldown-02", "state": "cooldown", "shutter": 0, "eye": 0, "projector": 0, "dim": True},
    {"name": "cooldown-03", "state": "cooldown", "shutter": 0, "eye": 0, "projector": 0},
)

IDLE_DURATIONS = (220, 220, 220)
TELEGRAPH_DURATIONS = (80, 100, 120, 150, 200)
COOLDOWN_DURATIONS = (180, 220, 400, 600)


def draw_sensor(draw: ImageDraw.ImageDraw, shutter: int, eye: int) -> None:
    if shutter == 0:
        draw.rectangle((11, 4, 20, 12), fill=OUTLINE)
        draw.rectangle((13, 3, 18, 4), fill=OUTLINE)
        draw.rectangle((12, 5, 19, 11), fill=BODY)
        draw.rectangle((13, 6, 14, 10), fill=BODY_LIGHT)
        draw.rectangle((17, 6, 18, 10), fill=BODY_LIGHT)
        draw.line((15, 6, 15, 10), fill=OUTLINE)
        draw.line((16, 6, 16, 10), fill=OUTLINE)
    elif shutter == 1:
        draw.polygon(((9, 5), (13, 5), (14, 7), (14, 12), (9, 12), (8, 9)), fill=OUTLINE)
        draw.polygon(((10, 6), (12, 6), (13, 8), (13, 11), (10, 11), (9, 9)), fill=BODY_LIGHT)
        draw.polygon(((22, 5), (18, 5), (17, 7), (17, 12), (22, 12), (23, 9)), fill=OUTLINE)
        draw.polygon(((21, 6), (19, 6), (18, 8), (18, 11), (21, 11), (22, 9)), fill=BODY_LIGHT)
        draw.rectangle((13, 5, 18, 12), fill=OUTLINE)
        draw.rectangle((14, 6, 17, 11), fill=SHADOW)
    else:
        draw.polygon(((8, 4), (12, 6), (13, 8), (13, 12), (7, 12), (7, 7)), fill=OUTLINE)
        draw.polygon(((9, 6), (11, 7), (12, 9), (12, 11), (8, 11), (8, 7)), fill=BODY_LIGHT)
        draw.polygon(((23, 4), (19, 6), (18, 8), (18, 12), (24, 12), (24, 7)), fill=OUTLINE)
        draw.polygon(((22, 6), (20, 7), (19, 9), (19, 11), (23, 11), (23, 7)), fill=BODY_LIGHT)
        draw.rectangle((12, 4, 19, 12), fill=OUTLINE)
        draw.rectangle((13, 5, 18, 11), fill=SHADOW)

    if eye == 0:
        draw.rectangle((15, 8, 16, 9), fill=RED_DARK)
    elif eye == 1:
        draw.rectangle((14, 7, 17, 10), fill=RED_DARK)
        draw.rectangle((15, 8, 16, 9), fill=RED)
    elif eye == 2:
        draw.rectangle((13, 6, 18, 11), fill=RED_DARK)
        draw.rectangle((14, 7, 17, 10), fill=RED)
        draw.rectangle((15, 8, 16, 9), fill=ORANGE)
    else:
        draw.rectangle((13, 6, 18, 11), fill=RED)
        draw.rectangle((14, 7, 17, 10), fill=ORANGE)
        draw.rectangle((15, 8, 16, 9), fill=WHITE_HOT)


def build_frame(spec: dict) -> Image.Image:
    image = Image.new("RGBA", (CELL, CELL), TRANSPARENT)
    draw = ImageDraw.Draw(image)

    draw.polygon(
        ((9, 8), (22, 8), (25, 11), (27, 13), (29, 14), (29, 18), (26, 18), (24, 22),
         (21, 26), (19, 28), (12, 28), (10, 26), (7, 22), (5, 18), (2, 18), (2, 14),
         (5, 13), (7, 10)),
        fill=OUTLINE,
    )
    draw.polygon(
        ((10, 9), (21, 9), (24, 12), (26, 15), (24, 20), (21, 24), (18, 26), (13, 26),
         (10, 24), (7, 20), (5, 15), (8, 11)),
        fill=BODY,
    )
    draw.polygon(((8, 11), (23, 11), (26, 14), (25, 16), (6, 16), (5, 14)), fill=BODY_LIGHT)
    draw.rectangle((5, 15, 26, 18), fill=OUTLINE)
    draw.rectangle((6, 15, 25, 16), fill=BODY_LIGHT)
    draw.rectangle((6, 17, 25, 18), fill=SHADOW)
    draw.rectangle((2, 14, 5, 18), fill=METAL)
    draw.rectangle((26, 14, 29, 18), fill=METAL)
    draw.rectangle((3, 14, 5, 15), fill=METAL_LIGHT)
    draw.rectangle((26, 14, 28, 15), fill=METAL_LIGHT)

    draw_sensor(draw, spec["shutter"], spec["eye"])

    panel_color = RED_DARK if spec.get("dim") else RED
    draw.rectangle((11, 22, 20, 25), fill=OUTLINE)
    draw.rectangle((12, 22, 19, 24), fill=panel_color)
    if spec["eye"] >= 2:
        draw.rectangle((14, 22, 17, 24), fill=ORANGE)
    if spec["eye"] == 3:
        draw.rectangle((15, 22, 16, 23), fill=WHITE_HOT)

    extension = spec["projector"]
    nozzle_color = METAL if spec.get("dim") else AMBER
    draw.rectangle((14, 26, 17, 27 + extension), fill=OUTLINE)
    draw.rectangle((15, 26, 16, 27 + extension), fill=nozzle_color)
    if extension == 2:
        draw.rectangle((14, 29, 17, 29), fill=AMBER)

    return image


def save_frame_exports(frames: list[Image.Image]) -> None:
    for spec, frame in zip(FRAMES, frames, strict=True):
        frame.save(EXPORT / f"{spec['name']}.png")
    atlas = Image.new("RGBA", (CELL * len(frames), CELL), TRANSPARENT)
    for index, frame in enumerate(frames):
        atlas.alpha_composite(frame, (index * CELL, 0))
    atlas.save(EXPORT / "artillery-acquisition-motion.png")


def preview_frame(frame: Image.Image, scale: int = SCALE) -> Image.Image:
    sprite = frame.resize((CELL * scale, CELL * scale), Image.Resampling.NEAREST)
    canvas = Image.new("RGBA", sprite.size, PREVIEW_BG)
    canvas.alpha_composite(sprite)
    return canvas


def save_cycle_preview(frames: list[Image.Image]) -> None:
    order = [0, 1, 2, 1, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    durations = [220, 220, 220, 400, *TELEGRAPH_DURATIONS, *COOLDOWN_DURATIONS]
    rendered = [preview_frame(frames[index]) for index in order]
    rendered[0].save(
        PREVIEW / "artillery-acquisition-cycle.gif",
        save_all=True,
        append_images=rendered[1:],
        duration=durations,
        loop=0,
        disposal=2,
    )


def save_state_review(frames: list[Image.Image]) -> None:
    font = ImageFont.load_default()
    picks = ((0, "IDLE"), (4, "DETECTED"), (5, "ACQUIRED"), (9, "COOLDOWN"))
    tile = CELL * SCALE
    gap = 20
    label_height = 24
    canvas = Image.new("RGBA", (tile * 2 + gap * 3, (tile + label_height) * 2 + gap * 3), PREVIEW_BG)
    draw = ImageDraw.Draw(canvas)
    for index, (frame_index, label) in enumerate(picks):
        column = index % 2
        row = index // 2
        x = gap + column * (tile + gap)
        y = gap + row * (tile + label_height + gap)
        draw.rectangle((x, y, x + tile - 1, y + tile - 1), fill=PREVIEW_PANEL)
        canvas.alpha_composite(frames[frame_index].resize((tile, tile), Image.Resampling.NEAREST), (x, y))
        draw.text((x + 6, y + tile + 5), label, font=font, fill=PREVIEW_TEXT)
    canvas.save(PREVIEW / "artillery-acquisition-states.png")


def save_runtime_size_review(frames: list[Image.Image]) -> None:
    font = ImageFont.load_default()
    picks = ((0, "idle"), (4, "detected"), (5, "acquired"), (9, "cooldown"))
    canvas = Image.new("RGBA", (392, 104), PREVIEW_BG)
    draw = ImageDraw.Draw(canvas)
    for index, (frame_index, label) in enumerate(picks):
        x = 22 + index * 94
        y = 14
        sprite = frames[frame_index].resize((56, 56), Image.Resampling.NEAREST)
        canvas.alpha_composite(sprite, (x, y))
        draw.text((x, 78), label, font=font, fill=PREVIEW_TEXT)
    canvas.save(PREVIEW / "artillery-acquisition-runtime-size.png")


def main() -> None:
    EXPORT.mkdir(parents=True, exist_ok=True)
    PREVIEW.mkdir(parents=True, exist_ok=True)
    frames = [build_frame(spec) for spec in FRAMES]
    save_frame_exports(frames)
    save_cycle_preview(frames)
    save_state_review(frames)
    save_runtime_size_review(frames)


if __name__ == "__main__":
    main()
