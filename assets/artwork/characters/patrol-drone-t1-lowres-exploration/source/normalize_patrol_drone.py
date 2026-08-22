from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "source" / "imagegen-patrol-drone-sheet.png"
EXPORT = ROOT / "export" / "patrol-neutral.png"
SELECTED_PREVIEW = ROOT / "preview" / "patrol-neutral-8x.png"
DIRECTION_PREVIEW = ROOT / "preview" / "patrol-direction-review.png"
SCALE_PREVIEW = ROOT / "preview" / "patrol-runtime-size-check.png"
FAMILY_PREVIEW = ROOT / "preview" / "patrol-family-scale-review.png"
MOVE_RIGHT_EXPORT = ROOT / "export" / "patrol-move-right.png"
MOVE_LEFT_EXPORT = ROOT / "export" / "patrol-move-left.png"
ACQUIRE_EXPORT = ROOT / "export" / "patrol-acquire.png"
TRACK_EXPORT = ROOT / "export" / "patrol-track.png"
LOCK_FIRE_EXPORT = ROOT / "export" / "patrol-lock-fire.png"
COOLDOWN_EXPORT = ROOT / "export" / "patrol-cooldown.png"
MOTION_ATTACK_EXPORT = ROOT / "export" / "patrol-motion-attack.png"
MOVE_RIGHT_PREVIEW = ROOT / "preview" / "patrol-move-right.gif"
MOVE_LEFT_PREVIEW = ROOT / "preview" / "patrol-move-left.gif"
ATTACK_PREVIEW = ROOT / "preview" / "patrol-attack-cycle.gif"
STATE_PREVIEW = ROOT / "preview" / "patrol-animation-states.png"
ATLAS_PREVIEW = ROOT / "preview" / "patrol-motion-attack-atlas-4x.png"
REPOSITORY_ROOT = Path(__file__).resolve().parents[5]
RUNTIME_ENEMIES = REPOSITORY_ROOT / "assets" / "runtime" / "characters" / "sector-01-enemies"

CELL = 32
SELECTED_COLUMN = 0
SELECTED_ROW = 1
ALPHA_THRESHOLD = 128
PALETTE = (
    (5, 12, 24),
    (14, 30, 52),
    (38, 59, 86),
    (117, 111, 100),
    (255, 59, 28),
    (255, 174, 25),
)
PREVIEW_BACKGROUND = (5, 12, 24, 255)
TRANSPARENT = (0, 0, 0, 0)
OUTLINE = (5, 12, 24, 255)
SHADOW = (14, 30, 52, 255)
NAVY = (38, 59, 86, 255)
GUNMETAL = (117, 111, 100, 255)
RED = (255, 59, 28, 255)
AMBER = (255, 174, 25, 255)

MOVE_DURATIONS = (140, 140, 180, 140)
ACQUIRE_DURATIONS = (130, 120)
TRACK_DURATIONS = (200, 200, 200, 200)
LOCK_DURATIONS = (100, 100)
FIRE_DURATIONS = (40, 40)
COOLDOWN_DURATIONS = (200, 250, 250, 300)


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
    return source.crop(
        (
            x_edges[SELECTED_COLUMN],
            y_edges[SELECTED_ROW],
            x_edges[SELECTED_COLUMN + 1],
            y_edges[SELECTED_ROW + 1],
        )
    )


def normalize(concept):
    mask = concept.getchannel("A").point(lambda alpha: 255 if alpha >= ALPHA_THRESHOLD else 0)
    bounds = mask.getbbox()
    if bounds is None:
        raise ValueError("Selected Patrol Drone concept has no opaque pixels")

    cropped = concept.crop(bounds)
    scale = min(28 / cropped.width, 24 / cropped.height)
    target_size = (max(1, round(cropped.width * scale)), max(1, round(cropped.height * scale)))
    reduced = cropped.resize(target_size, Image.Resampling.NEAREST)
    reduced.putdata([nearest_palette_color(pixel) for pixel in reduced.get_flattened_data()])

    frame = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
    frame.alpha_composite(reduced, ((CELL - target_size[0]) // 2, (CELL - target_size[1]) // 2))
    return frame


def on_background(frame, size, position):
    canvas = Image.new("RGBA", size, PREVIEW_BACKGROUND)
    canvas.alpha_composite(frame, position)
    return canvas


def shifted(frame, delta_x=0, delta_y=0):
    shifted_frame = Image.new("RGBA", frame.size, TRANSPARENT)
    shifted_frame.alpha_composite(frame, (delta_x, delta_y))
    return shifted_frame


def movement_frame(base, phase):
    bob = (0, -1, 0, 1)[phase]
    frame = shifted(base, 0, bob)
    draw = ImageDraw.Draw(frame)
    pulse_y = 16 + bob
    if phase == 1:
        draw.point((1, pulse_y), fill=RED)
        draw.point((0, pulse_y), fill=AMBER)
    elif phase == 2:
        draw.rectangle((0, pulse_y - 1, 1, pulse_y + 1), fill=RED)
        draw.point((0, pulse_y), fill=AMBER)
    elif phase == 3:
        draw.point((1, pulse_y), fill=AMBER)
    return frame


def tuck_outer_pods(base):
    frame = base.copy()
    left = frame.crop((0, 0, 10, CELL))
    right = frame.crop((22, 0, CELL, CELL))
    draw = ImageDraw.Draw(frame)
    draw.rectangle((0, 0, 9, CELL - 1), fill=TRANSPARENT)
    draw.rectangle((22, 0, CELL - 1, CELL - 1), fill=TRANSPARENT)
    frame.alpha_composite(left, (1, 0))
    frame.alpha_composite(right, (21, 0))
    return frame


def draw_sensor(frame, mode, phase=0):
    draw = ImageDraw.Draw(frame)
    if mode == "acquire":
        draw.rectangle((12, 14, 19, 17), fill=OUTLINE)
        draw.rectangle((12, 14, 12, 17), fill=GUNMETAL)
        draw.rectangle((19, 14, 19, 17), fill=GUNMETAL)
        draw.rectangle((13, 15, 18, 16), fill=RED)
        if phase:
            draw.rectangle((15, 15, 16, 16), fill=AMBER)
        return
    if mode == "track":
        scan_positions = (13, 15, 17, 15)
        draw.rectangle((12, 14, 19, 17), fill=OUTLINE)
        draw.rectangle((13, 15, 18, 16), fill=RED)
        scan_x = scan_positions[phase]
        draw.rectangle((scan_x, 15, min(scan_x + 1, 18), 16), fill=AMBER)
        return
    if mode == "lock":
        draw.rectangle((11, 13, 20, 18), fill=OUTLINE)
        draw.rectangle((11, 14, 12, 17), fill=GUNMETAL)
        draw.rectangle((19, 14, 20, 17), fill=GUNMETAL)
        draw.rectangle((13, 14, 18, 17), fill=RED)
        core = (15, 15, 16, 16) if phase == 0 else (14, 15, 17, 16)
        draw.rectangle(core, fill=AMBER)


def fire_frame(base, phase):
    frame = tuck_outer_pods(base)
    draw_sensor(frame, "lock", 1)
    draw = ImageDraw.Draw(frame)
    draw.rectangle((13, 20, 18, 23), fill=OUTLINE)
    draw.rectangle((14, 21, 17, 22), fill=AMBER)
    if phase == 0:
        draw.rectangle((15, 23, 16, 24), fill=RED)
    else:
        draw.rectangle((14, 23, 17, 25), fill=RED)
        draw.rectangle((15, 23, 16, 25), fill=AMBER)
        draw.point((13, 24), fill=RED)
        draw.point((18, 24), fill=RED)
    return frame


def cooldown_frames(base, fire_frames):
    first = fire_frames[0].copy()
    second = tuck_outer_pods(base)
    draw_sensor(second, "lock", 0)
    draw = ImageDraw.Draw(second)
    draw.rectangle((14, 20, 17, 22), fill=OUTLINE)
    draw.rectangle((15, 21, 16, 22), fill=AMBER)

    third = base.copy()
    draw = ImageDraw.Draw(third)
    draw.rectangle((12, 14, 19, 17), fill=OUTLINE)
    draw.rectangle((13, 15, 18, 16), fill=SHADOW)
    draw.rectangle((15, 15, 16, 16), fill=RED)
    return [first, second, third, base.copy()]


def build_animation_frames(base):
    move_right = [movement_frame(base, phase) for phase in range(4)]
    move_left = [frame.transpose(Image.Transpose.FLIP_LEFT_RIGHT) for frame in move_right]

    acquire = []
    for phase in range(2):
        frame = base.copy()
        draw_sensor(frame, "acquire", phase)
        acquire.append(frame)

    track = []
    for phase in range(4):
        frame = base.copy()
        draw_sensor(frame, "track", phase)
        track.append(frame)

    lock = []
    for phase in range(2):
        frame = tuck_outer_pods(base)
        draw_sensor(frame, "lock", phase)
        lock.append(frame)

    fire = [fire_frame(base, phase) for phase in range(2)]
    cooldown = cooldown_frames(base, fire)
    return {
        "move_right": move_right,
        "move_left": move_left,
        "acquire": acquire,
        "track": track,
        "lock": lock,
        "fire": fire,
        "cooldown": cooldown,
    }


def horizontal_atlas(frames):
    atlas = Image.new("RGBA", (CELL * len(frames), CELL), TRANSPARENT)
    for index, frame in enumerate(frames):
        atlas.alpha_composite(frame, (index * CELL, 0))
    return atlas


def save_animation_exports(frames):
    horizontal_atlas(frames["move_right"]).save(MOVE_RIGHT_EXPORT)
    horizontal_atlas(frames["move_left"]).save(MOVE_LEFT_EXPORT)
    horizontal_atlas(frames["acquire"]).save(ACQUIRE_EXPORT)
    horizontal_atlas(frames["track"]).save(TRACK_EXPORT)
    horizontal_atlas(frames["lock"] + frames["fire"]).save(LOCK_FIRE_EXPORT)
    horizontal_atlas(frames["cooldown"]).save(COOLDOWN_EXPORT)

    rows = (
        frames["move_right"],
        frames["move_left"],
        frames["acquire"],
        frames["track"],
        frames["lock"] + frames["fire"],
        frames["cooldown"],
    )
    atlas = Image.new("RGBA", (CELL * 4, CELL * len(rows)), TRANSPARENT)
    for row, row_frames in enumerate(rows):
        for column, frame in enumerate(row_frames):
            atlas.alpha_composite(frame, (column * CELL, row * CELL))
    atlas.save(MOTION_ATTACK_EXPORT)
    return atlas


def preview_frame(frame, scale=8):
    enlarged = frame.resize((CELL * scale, CELL * scale), Image.Resampling.NEAREST)
    return on_background(enlarged, enlarged.size, (0, 0))


def save_gif(path, frames, durations, scale=8):
    rendered = [preview_frame(frame, scale) for frame in frames]
    rendered[0].save(
        path,
        save_all=True,
        append_images=rendered[1:],
        duration=durations,
        loop=0,
        disposal=2,
    )


def save_animation_previews(frames, atlas):
    save_gif(MOVE_RIGHT_PREVIEW, frames["move_right"], MOVE_DURATIONS)
    save_gif(MOVE_LEFT_PREVIEW, frames["move_left"], MOVE_DURATIONS)
    attack_frames = frames["acquire"] + frames["track"] + frames["lock"] + frames["fire"] + frames["cooldown"]
    attack_durations = ACQUIRE_DURATIONS + TRACK_DURATIONS + LOCK_DURATIONS + FIRE_DURATIONS + COOLDOWN_DURATIONS
    save_gif(ATTACK_PREVIEW, attack_frames, attack_durations)

    picks = (
        ("move R", frames["move_right"][2]),
        ("move L", frames["move_left"][2]),
        ("acquire", frames["acquire"][1]),
        ("track", frames["track"][1]),
        ("lock", frames["lock"][1]),
        ("fire", frames["fire"][1]),
        ("cooldown", frames["cooldown"][2]),
    )
    tile_width = 76
    canvas = Image.new("RGBA", (tile_width * len(picks), 90), PREVIEW_BACKGROUND)
    draw = ImageDraw.Draw(canvas)
    font = ImageFont.load_default()
    for index, (label, frame) in enumerate(picks):
        sprite = frame.resize((56, 56), Image.Resampling.NEAREST)
        x = index * tile_width + 10
        canvas.alpha_composite(sprite, (x, 8))
        label_left = index * tile_width + (tile_width - draw.textlength(label, font=font)) // 2
        draw.text((label_left, 70), label, font=font, fill=(210, 220, 226, 255))
    canvas.save(STATE_PREVIEW)

    atlas_scale = 4
    enlarged_atlas = atlas.resize(
        (atlas.width * atlas_scale, atlas.height * atlas_scale), Image.Resampling.NEAREST
    )
    on_background(enlarged_atlas, enlarged_atlas.size, (0, 0)).save(ATLAS_PREVIEW)


def save_previews(frame):
    enlarged = frame.resize((CELL * 8, CELL * 8), Image.Resampling.NEAREST)
    on_background(enlarged, enlarged.size, (0, 0)).save(SELECTED_PREVIEW)

    direction_canvas = Image.new("RGBA", (CELL * 16, CELL * 8), PREVIEW_BACKGROUND)
    direction_canvas.alpha_composite(enlarged, (0, 0))
    direction_canvas.alpha_composite(enlarged.transpose(Image.Transpose.FLIP_LEFT_RIGHT), (CELL * 8, 0))
    direction_canvas.save(DIRECTION_PREVIEW)

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
    family = (
        ("sentry", sentry, 56),
        ("pursuit", pursuit, 56),
        ("shield", shield, 60),
        ("artillery", artillery, 56),
        ("patrol", frame, 56),
    )
    tile_width = 88
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
    source = Image.open(SOURCE).convert("RGBA")
    frame = normalize(selected_concept(source))
    EXPORT.parent.mkdir(parents=True, exist_ok=True)
    SELECTED_PREVIEW.parent.mkdir(parents=True, exist_ok=True)
    frame.save(EXPORT)
    save_previews(frame)
    animation_frames = build_animation_frames(frame)
    atlas = save_animation_exports(animation_frames)
    save_animation_previews(animation_frames, atlas)
    print(
        f"saved Patrol Drone base and animation exports: frame={frame.size}, "
        f"opaque_bounds={frame.getchannel('A').getbbox()}, atlas={MOTION_ATTACK_EXPORT.name}"
    )


if __name__ == "__main__":
    main()
