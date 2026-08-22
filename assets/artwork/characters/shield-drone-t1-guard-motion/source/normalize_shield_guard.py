from pathlib import Path
from math import cos, pi, sin

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "source" / "shield-guard-imagegen.png"
EXPORT = ROOT / "export"
PREVIEW = ROOT / "preview"
FRAME_COUNT = 4
CELL_SIZE = 32
OPAQUE_LIMIT = (30, 28)
DURATIONS_MS = (140, 140, 180, 140)
BODY_SHIFT_X = 6
BODY_MAX_SOURCE_X = 14
GUARD_DIRECTION_COUNT = 8

PALETTE = (
    (9, 15, 26, 255),
    (25, 37, 56, 255),
    (99, 91, 83, 255),
    (177, 166, 154, 255),
    (239, 68, 39, 255),
    (244, 171, 43, 255),
)


def nearest_palette_color(pixel):
    red, green, blue, _alpha = pixel
    return min(
        PALETTE,
        key=lambda color: (
            (red - color[0]) ** 2
            + (green - color[1]) ** 2
            + (blue - color[2]) ** 2
        ),
    )


def binary_alpha(image):
    alpha = image.getchannel("A").point(lambda value: 255 if value >= 128 else 0)
    result = image.copy()
    result.putalpha(alpha)
    return result


def source_frames():
    sheet = Image.open(SOURCE).convert("RGBA")
    if sheet.width % FRAME_COUNT:
        raise ValueError(f"source width {sheet.width} is not divisible by {FRAME_COUNT}")
    frame_width = sheet.width // FRAME_COUNT
    return [
        binary_alpha(sheet.crop((index * frame_width, 0, (index + 1) * frame_width, sheet.height)))
        for index in range(FRAME_COUNT)
    ]


def common_crop(frames):
    bounds = [frame.getchannel("A").getbbox() for frame in frames]
    if any(bounds_item is None for bounds_item in bounds):
        raise ValueError("every generated frame must contain opaque pixels")
    left = min(bounds_item[0] for bounds_item in bounds)
    top = min(bounds_item[1] for bounds_item in bounds)
    right = max(bounds_item[2] for bounds_item in bounds)
    bottom = max(bounds_item[3] for bounds_item in bounds)
    return left, top, right, bottom


def normalize_frames(frames):
    crop = common_crop(frames)
    crop_width = crop[2] - crop[0]
    crop_height = crop[3] - crop[1]
    scale = min(OPAQUE_LIMIT[0] / crop_width, OPAQUE_LIMIT[1] / crop_height)
    target_size = (
        max(1, round(crop_width * scale)),
        max(1, round(crop_height * scale)),
    )
    offset = ((CELL_SIZE - target_size[0]) // 2, CELL_SIZE - target_size[1] - 1)
    normalized = []
    for frame in frames:
        resized = frame.crop(crop).resize(target_size, Image.Resampling.NEAREST)
        pixels = [
            (0, 0, 0, 0) if pixel[3] < 128 else nearest_palette_color(pixel)
            for pixel in resized.get_flattened_data()
        ]
        resized.putdata(pixels)
        cell = Image.new("RGBA", (CELL_SIZE, CELL_SIZE), (0, 0, 0, 0))
        cell.alpha_composite(resized, offset)
        normalized.append(cell)
    return normalized


def body_frames(frames):
    body_colors = {PALETTE[index] for index in (0, 1, 4, 5)}
    result = []
    for frame in frames:
        body = Image.new("RGBA", (CELL_SIZE, CELL_SIZE), (0, 0, 0, 0))
        for y in range(CELL_SIZE):
            for x in range(BODY_MAX_SOURCE_X + 1):
                pixel = frame.getpixel((x, y))
                if pixel in body_colors and x + BODY_SHIFT_X < CELL_SIZE:
                    body.putpixel((x + BODY_SHIFT_X, y), pixel)
        result.append(body)
    return result


def polygon_points(center, direction, tangent, points):
    return [
        (
            round(center[0] + direction[0] * radial + tangent[0] * lateral),
            round(center[1] + direction[1] * radial + tangent[1] * lateral),
        )
        for radial, lateral in points
    ]


def guard_frames():
    frames = []
    for index in range(GUARD_DIRECTION_COUNT):
        angle = index * pi / 4
        direction = (cos(angle), sin(angle))
        tangent = (-direction[1], direction[0])
        center = (16 + direction[0] * 7, 17 + direction[1] * 7)
        frame = Image.new("RGBA", (CELL_SIZE, CELL_SIZE), (0, 0, 0, 0))
        draw = ImageDraw.Draw(frame)

        mount_start = (round(16 + direction[0] * 2), round(17 + direction[1] * 2))
        mount_end = (round(16 + direction[0] * 7), round(17 + direction[1] * 7))
        draw.line((mount_start, mount_end), fill=PALETTE[1], width=3)

        outer = polygon_points(
            center,
            direction,
            tangent,
            ((-4, -7), (-1, -10), (4, -8), (6, 0), (4, 8), (-1, 10), (-4, 7), (-5, 0)),
        )
        inner = polygon_points(
            center,
            direction,
            tangent,
            ((-2, -5), (0, -7), (3, -6), (4, 0), (3, 6), (0, 7), (-2, 5), (-3, 0)),
        )
        draw.polygon(outer, fill=PALETTE[1])
        draw.polygon(inner, fill=PALETTE[2])

        rim_start = polygon_points(center, direction, tangent, ((-1, -7),))[0]
        rim_end = polygon_points(center, direction, tangent, ((3, -5),))[0]
        draw.line((rim_start, rim_end), fill=PALETTE[3], width=2)
        frames.append(frame)
    return frames


def save_atlas(path, frames):
    atlas = Image.new("RGBA", (CELL_SIZE * len(frames), CELL_SIZE), (0, 0, 0, 0))
    for index, frame in enumerate(frames):
        atlas.alpha_composite(frame, (index * CELL_SIZE, 0))
    atlas.save(path)
    return atlas


def save_outputs(frames, bodies, guards):
    EXPORT.mkdir(parents=True, exist_ok=True)
    PREVIEW.mkdir(parents=True, exist_ok=True)

    for index, frame in enumerate(frames):
        frame.save(EXPORT / f"shield-guard-{index:02d}.png")
    atlas = save_atlas(EXPORT / "shield-guard.png", frames)
    body_atlas = save_atlas(EXPORT / "shield-body.png", bodies)
    guard_atlas = save_atlas(EXPORT / "shield-directions.png", guards)
    atlas.resize((atlas.width * 8, atlas.height * 8), Image.Resampling.NEAREST).save(
        PREVIEW / "shield-guard-review.png"
    )
    body_atlas.resize((body_atlas.width * 8, body_atlas.height * 8), Image.Resampling.NEAREST).save(
        PREVIEW / "shield-body-review.png"
    )
    guard_atlas.resize((guard_atlas.width * 6, guard_atlas.height * 6), Image.Resampling.NEAREST).save(
        PREVIEW / "shield-directions-review.png"
    )

    composite = []
    for body in bodies:
        cell = body.copy()
        cell.alpha_composite(guards[0])
        composite.append(cell)

    enlarged = [frame.resize((256, 256), Image.Resampling.NEAREST) for frame in composite]
    enlarged[0].save(
        PREVIEW / "shield-guard.gif",
        save_all=True,
        append_images=enlarged[1:],
        duration=DURATIONS_MS,
        loop=0,
        disposal=2,
        transparency=0,
    )

    directional = []
    for guard in guards:
        cell = bodies[0].copy()
        cell.alpha_composite(guard)
        directional.append(cell.resize((256, 256), Image.Resampling.NEAREST))
    directional[0].save(
        PREVIEW / "shield-direction-cycle.gif",
        save_all=True,
        append_images=directional[1:],
        duration=180,
        loop=0,
        disposal=2,
        transparency=0,
    )

    runtime_strip = Image.new("RGBA", (60 * FRAME_COUNT, 60), (0, 0, 0, 0))
    runtime_frames = []
    for index, frame in enumerate(composite):
        runtime = frame.resize((60, 60), Image.Resampling.NEAREST)
        runtime_strip.alpha_composite(runtime, (index * 60, 0))
        field = Image.new("RGBA", (240, 240), (7, 14, 26, 255))
        field.alpha_composite(runtime, ((field.width - 60) // 2, (field.height - 60) // 2))
        runtime_frames.append(field)
    runtime_strip.save(PREVIEW / "shield-guard-runtime-size-check.png")
    runtime_frames[0].save(
        PREVIEW / "shield-guard-game-size.gif",
        save_all=True,
        append_images=runtime_frames[1:],
        duration=DURATIONS_MS,
        loop=0,
        disposal=2,
    )


def validate(frames, label):
    for index, frame in enumerate(frames):
        if frame.mode != "RGBA" or frame.size != (CELL_SIZE, CELL_SIZE):
            raise ValueError(f"frame {index} has invalid mode or size: {frame.mode} {frame.size}")
        alpha_values = set(frame.getchannel("A").get_flattened_data())
        if not alpha_values.issubset({0, 255}):
            raise ValueError(f"frame {index} alpha is not binary: {sorted(alpha_values)}")
        visible = [pixel for pixel in frame.get_flattened_data() if pixel[3] > 0]
        colors = {pixel for pixel in visible}
        if not colors.issubset(set(PALETTE)):
            raise ValueError(f"frame {index} contains colors outside the Sector 01 palette")
        bounds = frame.getchannel("A").getbbox()
        print(f"{label} frame {index}: bounds={bounds}, colors={len(colors)}")


def main():
    frames = normalize_frames(source_frames())
    bodies = body_frames(frames)
    guards = guard_frames()
    validate(frames, "source")
    validate(bodies, "body")
    validate(guards, "guard")
    save_outputs(frames, bodies, guards)
    print(f"body atlas={EXPORT / 'shield-body.png'}")
    print(f"guard atlas={EXPORT / 'shield-directions.png'}")
    print(f"preview={PREVIEW / 'shield-guard.gif'}")


if __name__ == "__main__":
    main()
