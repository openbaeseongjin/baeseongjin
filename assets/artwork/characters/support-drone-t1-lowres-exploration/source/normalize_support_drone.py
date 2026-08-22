from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "source" / "imagegen-support-drone-sheet.png"
EXPORT = ROOT / "export" / "support-neutral.png"
IDLE_EXPORT = ROOT / "export" / "support-idle.png"
LINK_EXPORT = ROOT / "export" / "support-link.png"
MOTION_EXPORT = ROOT / "export" / "support-motion.png"
NEUTRAL_PREVIEW = ROOT / "preview" / "support-neutral-8x.png"
SCALE_PREVIEW = ROOT / "preview" / "support-runtime-size-check.png"
FAMILY_PREVIEW = ROOT / "preview" / "support-family-scale-review.png"
IDLE_PREVIEW = ROOT / "preview" / "support-idle.gif"
LINK_PREVIEW = ROOT / "preview" / "support-link.gif"
MOTION_PREVIEW = ROOT / "preview" / "support-motion-atlas-4x.png"
STATE_PREVIEW = ROOT / "preview" / "support-animation-states.png"
REPOSITORY_ROOT = Path(__file__).resolve().parents[5]
RUNTIME_ENEMIES = REPOSITORY_ROOT / "assets" / "runtime" / "characters" / "sector-01-enemies"
PATROL_EXPORT = (
    REPOSITORY_ROOT
    / "assets"
    / "artwork"
    / "characters"
    / "patrol-drone-t1-lowres-exploration"
    / "export"
    / "patrol-neutral.png"
)

CELL = 32
SELECTED_COLUMN = 1
SELECTED_ROW = 1
BACKGROUND_FLOOR = 220
ALPHA_THRESHOLD = 128
PALETTE = (
    (5, 12, 24),
    (14, 30, 52),
    (38, 59, 86),
    (117, 111, 100),
    (74, 222, 128),
    (187, 247, 208),
)
PREVIEW_BACKGROUND = (5, 12, 24, 255)
TRANSPARENT = (0, 0, 0, 0)
DARK = (5, 12, 24, 255)
NAVY = (14, 30, 52, 255)
BLUE = (38, 59, 86, 255)
GUNMETAL = (117, 111, 100, 255)
SUPPORT_GREEN = (74, 222, 128, 255)
SUPPORT_PALE = (187, 247, 208, 255)
IDLE_DURATIONS_MS = (200, 200, 200, 200)
LINK_DURATIONS_MS = (160, 160, 160, 160)


def foreground_alpha(pixel):
    red, green, blue = pixel[:3]
    return 255 if min(red, green, blue) < BACKGROUND_FLOOR else 0


def nearest_palette_color(pixel):
    red, green, blue, alpha = pixel
    if alpha < ALPHA_THRESHOLD:
        return (0, 0, 0, 0)
    color = min(
        PALETTE,
        key=lambda candidate: (candidate[0] - red) ** 2
        + (candidate[1] - green) ** 2
        + (candidate[2] - blue) ** 2,
    )
    return (*color, 255)


def selected_concept(source):
    x_edges = [round(source.width * index / 3) for index in range(4)]
    y_edges = [round(source.height * index / 3) for index in range(4)]
    concept = source.crop(
        (
            x_edges[SELECTED_COLUMN],
            y_edges[SELECTED_ROW],
            x_edges[SELECTED_COLUMN + 1],
            y_edges[SELECTED_ROW + 1],
        )
    ).convert("RGBA")
    concept.putalpha(Image.new("L", concept.size).point(lambda _: 0))
    alpha = Image.new("L", concept.size)
    alpha.putdata([foreground_alpha(pixel) for pixel in concept.get_flattened_data()])
    concept.putalpha(alpha)
    return concept


def normalize(concept):
    bounds = concept.getchannel("A").getbbox()
    if bounds is None:
        raise ValueError("Selected Support Drone concept has no opaque pixels")

    cropped = concept.crop(bounds)
    scale = min(24 / cropped.width, 24 / cropped.height)
    target_size = (max(1, round(cropped.width * scale)), max(1, round(cropped.height * scale)))
    reduced = cropped.resize(target_size, Image.Resampling.NEAREST)
    reduced.putdata([nearest_palette_color(pixel) for pixel in reduced.get_flattened_data()])

    frame = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
    frame.alpha_composite(reduced, ((CELL - target_size[0]) // 2, (CELL - target_size[1]) // 2))
    reinforce_role_cues(frame)
    return frame


def reinforce_role_cues(frame):
    draw = ImageDraw.Draw(frame)
    for relay_x in (5, 26):
        draw.point((relay_x, 14), fill=SUPPORT_PALE)
        draw.line((relay_x, 15, relay_x, 16), fill=SUPPORT_GREEN)
    draw.point((11, 25), fill=GUNMETAL)


def on_background(frame, size, position):
    canvas = Image.new("RGBA", size, PREVIEW_BACKGROUND)
    canvas.alpha_composite(frame, position)
    return canvas


def shifted(frame, offset_y):
    shifted_frame = Image.new("RGBA", frame.size, TRANSPARENT)
    shifted_frame.alpha_composite(frame, (0, offset_y))
    return shifted_frame


def set_core(frame, phase, offset_y=0):
    draw = ImageDraw.Draw(frame)
    top = 14 + offset_y
    bottom = 16 + offset_y
    if phase == 0:
        draw.rectangle((14, top, 17, bottom), fill=SUPPORT_GREEN)
    elif phase == 1:
        draw.rectangle((14, top, 17, bottom), fill=SUPPORT_GREEN)
        draw.line((15, top, 16, top), fill=SUPPORT_PALE)
    elif phase == 2:
        draw.rectangle((13, top, 18, bottom), fill=SUPPORT_GREEN)
        draw.rectangle((15, top, 16, top + 1), fill=SUPPORT_PALE)
    else:
        draw.rectangle((14, top, 17, bottom), fill=SUPPORT_GREEN)
        draw.point((16, top + 1), fill=SUPPORT_PALE)


def idle_frames(neutral):
    frames = []
    for offset_y, core_phase in ((0, 0), (-1, 1), (0, 2), (1, 1)):
        frame = shifted(neutral, offset_y)
        set_core(frame, core_phase, offset_y)
        frames.append(frame)
    return frames


def clear_folded_relays(frame):
    draw = ImageDraw.Draw(frame)
    draw.rectangle((3, 10, 7, 20), fill=TRANSPARENT)
    draw.rectangle((24, 10, 28, 20), fill=TRANSPARENT)


def draw_open_relays(frame, openness, phase):
    draw = ImageDraw.Draw(frame)
    left_outer = 4 - openness
    right_outer = 27 + openness
    top = 11 if phase % 2 == 0 else 10
    bottom = 19 if phase % 2 == 0 else 20

    for x, direction in ((left_outer, 1), (right_outer, -1)):
        draw.line((x, top, x, bottom), fill=DARK)
        draw.line((x + direction, top + 1, x + direction, bottom - 1), fill=GUNMETAL)
        draw.point((x + direction, top + 1), fill=SUPPORT_PALE)
        draw.line(
            (x + direction, top + 2, x + direction, top + 4),
            fill=SUPPORT_GREEN,
        )
        draw.line((x, top, x + direction, top), fill=NAVY)
        draw.line((x, bottom, x + direction, bottom), fill=NAVY)


def set_link_core(frame, phase):
    draw = ImageDraw.Draw(frame)
    draw.rectangle((12, 13, 19, 17), fill=DARK)
    if phase == 0:
        draw.rectangle((13, 14, 18, 16), fill=SUPPORT_GREEN)
        draw.line((15, 14, 16, 14), fill=SUPPORT_PALE)
    elif phase == 1:
        draw.rectangle((13, 13, 18, 17), fill=SUPPORT_GREEN)
        draw.rectangle((15, 14, 16, 16), fill=SUPPORT_PALE)
    elif phase == 2:
        draw.rectangle((12, 13, 19, 17), fill=SUPPORT_GREEN)
        draw.rectangle((14, 14, 17, 16), fill=SUPPORT_PALE)
    else:
        draw.rectangle((13, 13, 18, 17), fill=SUPPORT_GREEN)
        draw.line((14, 14, 17, 14), fill=SUPPORT_PALE)


def link_frames(neutral):
    frames = []
    for openness, phase in ((1, 0), (2, 1), (2, 2), (1, 3)):
        frame = neutral.copy()
        clear_folded_relays(frame)
        draw_open_relays(frame, openness, phase)
        set_link_core(frame, phase)
        frames.append(frame)
    return frames


def make_atlas(rows):
    atlas = Image.new("RGBA", (CELL * max(len(row) for row in rows), CELL * len(rows)), TRANSPARENT)
    for row_index, row in enumerate(rows):
        for column_index, frame in enumerate(row):
            atlas.alpha_composite(frame, (column_index * CELL, row_index * CELL))
    return atlas


def save_gif(frames, durations, output):
    preview_frames = []
    for frame in frames:
        enlarged = frame.resize((CELL * 8, CELL * 8), Image.Resampling.NEAREST)
        preview_frames.append(on_background(enlarged, enlarged.size, (0, 0)).convert("P"))
    preview_frames[0].save(
        output,
        save_all=True,
        append_images=preview_frames[1:],
        duration=durations,
        loop=0,
        disposal=2,
    )


def save_motion_previews(idle, link, motion):
    enlarged = motion.resize((motion.width * 4, motion.height * 4), Image.Resampling.NEAREST)
    on_background(enlarged, enlarged.size, (0, 0)).save(MOTION_PREVIEW)
    save_gif(idle, IDLE_DURATIONS_MS, IDLE_PREVIEW)
    save_gif(link, LINK_DURATIONS_MS, LINK_PREVIEW)

    canvas = Image.new("RGBA", (192, 108), PREVIEW_BACKGROUND)
    draw = ImageDraw.Draw(canvas)
    font = ImageFont.load_default()
    idle_pose = idle[2].resize((64, 64), Image.Resampling.NEAREST)
    link_pose = link[2].resize((64, 64), Image.Resampling.NEAREST)
    canvas.alpha_composite(idle_pose, (16, 12))
    canvas.alpha_composite(link_pose, (112, 12))
    draw.text((34, 84), "idle", font=font, fill=(210, 220, 226, 255))
    draw.text((132, 84), "link", font=font, fill=(210, 220, 226, 255))
    canvas.save(STATE_PREVIEW)


def save_previews(frame):
    enlarged = frame.resize((CELL * 8, CELL * 8), Image.Resampling.NEAREST)
    on_background(enlarged, enlarged.size, (0, 0)).save(NEUTRAL_PREVIEW)

    scale_canvas = Image.new("RGBA", (224, 96), PREVIEW_BACKGROUND)
    scale_canvas.alpha_composite(frame, (24, 32))
    runtime = frame.resize((56, 56), Image.Resampling.NEAREST)
    scale_canvas.alpha_composite(runtime, (96, 20))
    scale_canvas.save(SCALE_PREVIEW)

    sentry_atlas = Image.open(RUNTIME_ENEMIES / "sentry-upright-aim.png").convert("RGBA")
    sentry = sentry_atlas.crop((0, 0, 32, 32))
    sentry.alpha_composite(sentry_atlas.crop((32, 0, 64, 32)))
    pursuit = Image.open(RUNTIME_ENEMIES / "pursuit-motion.png").convert("RGBA").crop((0, 0, 32, 32))
    shield = Image.open(RUNTIME_ENEMIES / "shield-body.png").convert("RGBA").crop((0, 0, 32, 32))
    shield.alpha_composite(
        Image.open(RUNTIME_ENEMIES / "shield-directions.png").convert("RGBA").crop((0, 0, 32, 32))
    )
    artillery = Image.open(RUNTIME_ENEMIES / "artillery-acquisition-motion.png").convert("RGBA").crop(
        (0, 0, 32, 32)
    )
    patrol = Image.open(PATROL_EXPORT).convert("RGBA")
    family = (
        ("sentry", sentry, 56),
        ("pursuit", pursuit, 56),
        ("shield", shield, 60),
        ("artillery", artillery, 56),
        ("patrol", patrol, 56),
        ("support", frame, 56),
    )
    tile_width = 80
    family_canvas = Image.new("RGBA", (tile_width * len(family), 92), PREVIEW_BACKGROUND)
    draw = ImageDraw.Draw(family_canvas)
    font = ImageFont.load_default()
    for index, (label, sprite, output_size) in enumerate(family):
        enlarged_sprite = sprite.resize((output_size, output_size), Image.Resampling.NEAREST)
        x = index * tile_width + (tile_width - output_size) // 2
        family_canvas.alpha_composite(enlarged_sprite, (x, 10))
        label_left = index * tile_width + (tile_width - draw.textlength(label, font=font)) // 2
        draw.text((label_left, 72), label, font=font, fill=(210, 220, 226, 255))
    family_canvas.save(FAMILY_PREVIEW)


def main():
    source = Image.open(SOURCE).convert("RGB")
    frame = normalize(selected_concept(source))
    idle = idle_frames(frame)
    link = link_frames(frame)
    idle_atlas = make_atlas((idle,))
    link_atlas = make_atlas((link,))
    motion_atlas = make_atlas((idle, link))
    EXPORT.parent.mkdir(parents=True, exist_ok=True)
    NEUTRAL_PREVIEW.parent.mkdir(parents=True, exist_ok=True)
    frame.save(EXPORT)
    idle_atlas.save(IDLE_EXPORT)
    link_atlas.save(LINK_EXPORT)
    motion_atlas.save(MOTION_EXPORT)
    save_previews(frame)
    save_motion_previews(idle, link, motion_atlas)
    print(
        f"saved Support Drone exports: neutral={frame.size}, idle={idle_atlas.size}, "
        f"link={link_atlas.size}, motion={motion_atlas.size}, "
        f"opaque_bounds={frame.getchannel('A').getbbox()}"
    )


if __name__ == "__main__":
    main()
