from __future__ import annotations

from collections import deque
from pathlib import Path
import math
import sys

from PIL import Image, ImageDraw

from normalize_generated_sheet import checker_tile, font, make_animation_preview


SOURCE_FRAME_SIZE = 24
FRAME_SIZE = 48
MASTER_COLUMNS = 8
FRAME_COUNT = 8
DURATIONS = (120, 80, 80, 80, 80, 80, 80, 100)
RESPAWN_BLUE_DARK = (75, 170, 199, 255)
RESPAWN_BLUE = (107, 229, 253, 255)
RESPAWN_BLUE_LIGHT = (210, 241, 247, 255)
RESPAWN_COLORS = {RESPAWN_BLUE_DARK, RESPAWN_BLUE, RESPAWN_BLUE_LIGHT}
CENTER = (24, 24)


def frame_at(sheet: Image.Image, index: int) -> Image.Image:
    column = index % MASTER_COLUMNS
    row = index // MASTER_COLUMNS
    return sheet.crop(
        (
            column * SOURCE_FRAME_SIZE,
            row * SOURCE_FRAME_SIZE,
            (column + 1) * SOURCE_FRAME_SIZE,
            (row + 1) * SOURCE_FRAME_SIZE,
        )
    )


def centered_character(base: Image.Image) -> Image.Image:
    frame = Image.new("RGBA", (FRAME_SIZE, FRAME_SIZE))
    frame.alpha_composite(base, ((FRAME_SIZE - SOURCE_FRAME_SIZE) // 2,) * 2)
    return frame


def paint_if_character(frame: Image.Image, base_alpha: Image.Image, x: int, y: int, color: tuple[int, int, int, int]) -> None:
    local_x = x - (FRAME_SIZE - SOURCE_FRAME_SIZE) // 2
    local_y = y - (FRAME_SIZE - SOURCE_FRAME_SIZE) // 2
    if 0 <= local_x < SOURCE_FRAME_SIZE and 0 <= local_y < SOURCE_FRAME_SIZE:
        if base_alpha.getpixel((local_x, local_y)) > 0:
            frame.putpixel((x, y), color)


def make_intact_frames(base: Image.Image) -> list[Image.Image]:
    base_alpha = base.getchannel("A")
    first = centered_character(base)

    second = centered_character(base)
    for x, y, color in (
        (24, 25, RESPAWN_BLUE_LIGHT),
        (23, 25, RESPAWN_BLUE),
        (25, 25, RESPAWN_BLUE),
        (24, 24, RESPAWN_BLUE),
        (24, 26, RESPAWN_BLUE_DARK),
    ):
        paint_if_character(second, base_alpha, x, y, color)

    third = centered_character(base)
    cracks = (
        (24, 25, RESPAWN_BLUE_LIGHT),
        (23, 24, RESPAWN_BLUE),
        (22, 23, RESPAWN_BLUE_DARK),
        (25, 24, RESPAWN_BLUE),
        (26, 23, RESPAWN_BLUE_DARK),
        (24, 26, RESPAWN_BLUE),
        (23, 27, RESPAWN_BLUE_DARK),
        (25, 27, RESPAWN_BLUE),
        (26, 28, RESPAWN_BLUE_DARK),
        (22, 26, RESPAWN_BLUE_DARK),
    )
    for x, y, color in cracks:
        paint_if_character(third, base_alpha, x, y, color)

    fourth = centered_character(base)
    for x, y, color in cracks:
        paint_if_character(fourth, base_alpha, x, y, color)
    for distance in range(-3, 4):
        color = RESPAWN_BLUE_LIGHT if abs(distance) <= 1 else RESPAWN_BLUE
        fourth.putpixel((CENTER[0] + distance, CENTER[1] + 1), color)
        fourth.putpixel((CENTER[0], CENTER[1] + 1 + distance), color)
    for x, y in ((22, 23), (26, 23), (22, 27), (26, 27)):
        fourth.putpixel((x, y), RESPAWN_BLUE)
    return [first, second, third, fourth]


def radial_point(direction: tuple[int, int], radius: float) -> tuple[int, int]:
    dx, dy = direction
    length = math.hypot(dx, dy)
    return round(CENTER[0] + dx / length * radius), round(CENTER[1] + dy / length * radius)


def draw_shard(frame: Image.Image, center: tuple[int, int], direction: tuple[int, int], scale: int) -> None:
    draw = ImageDraw.Draw(frame)
    x, y = center
    dx, dy = direction
    if abs(dx) > abs(dy) * 1.4:
        step = 1 if dx > 0 else -1
        points = [(x + step * offset, y) for offset in range(scale + 1)]
        if scale > 1:
            points.append((x, y - 1))
    elif abs(dy) > abs(dx) * 1.4:
        step = 1 if dy > 0 else -1
        points = [(x, y + step * offset) for offset in range(scale + 1)]
        if scale > 1:
            points.append((x - 1, y))
    else:
        step_x = 1 if dx > 0 else -1
        step_y = 1 if dy > 0 else -1
        points = [(x + step_x * offset, y + step_y * offset) for offset in range(scale + 1)]
    for index, point in enumerate(points):
        px, py = point
        if 1 <= px < FRAME_SIZE - 1 and 1 <= py < FRAME_SIZE - 1:
            draw.point(point, fill=RESPAWN_BLUE if index % 3 else RESPAWN_BLUE_LIGHT)
    # A dark origin pixel keeps each tiny shard angular without growing it past 3px.
    draw.point((x, y), fill=RESPAWN_BLUE_DARK)


def make_burst_frame(
    directions: tuple[tuple[int, int], ...], radius: float, shard_scale: int, dots: tuple[tuple[int, int], ...]
) -> Image.Image:
    frame = Image.new("RGBA", (FRAME_SIZE, FRAME_SIZE))
    for direction in directions:
        draw_shard(frame, radial_point(direction, radius), direction, shard_scale)
    for direction in dots:
        x, y = radial_point(direction, radius + 3)
        if 1 <= x < FRAME_SIZE - 1 and 1 <= y < FRAME_SIZE - 1:
            frame.putpixel((x, y), RESPAWN_BLUE)
    return frame


def make_burst_frames() -> list[Image.Image]:
    twelve = (
        (1, 0),
        (2, 1),
        (1, 1),
        (1, 2),
        (0, 1),
        (-1, 2),
        (-1, 1),
        (-2, 1),
        (-1, 0),
        (-1, -1),
        (0, -1),
        (1, -1),
    )
    eight = ((1, 0), (1, 1), (0, 1), (-1, 1), (-1, 0), (-1, -1), (0, -1), (1, -1))
    fifth = make_burst_frame(twelve, 8, 1, ((3, 1), (-3, 1), (1, -3), (-1, -3)))
    # A tiny flash marks the exact former chest center without forming a blue body mass.
    fifth.putpixel(CENTER, RESPAWN_BLUE_LIGHT)
    fifth.putpixel((23, 24), RESPAWN_BLUE)
    fifth.putpixel((25, 24), RESPAWN_BLUE)

    sixth = make_burst_frame(twelve, 15, 1, ((3, 2), (-3, 2), (2, -3), (-2, -3)))
    seventh = make_burst_frame(eight, 20, 1, ((2, 1), (-2, 1), (1, -2), (-1, -2)))
    eighth = Image.new("RGBA", (FRAME_SIZE, FRAME_SIZE))
    for direction in ((1, 0), (1, 1), (-1, 1), (-1, 0), (-1, -1), (1, -1)):
        x, y = radial_point(direction, 21)
        eighth.putpixel((x, y), RESPAWN_BLUE_DARK)
    return [fifth, sixth, seventh, eighth]


def make_atlas(frames: list[Image.Image]) -> Image.Image:
    atlas = Image.new("RGBA", (FRAME_SIZE * len(frames), FRAME_SIZE))
    for index, frame in enumerate(frames):
        atlas.alpha_composite(frame, (index * FRAME_SIZE, 0))
    return atlas


def make_review(frames: list[Image.Image]) -> Image.Image:
    tile = 120
    gap = 14
    margin = 20
    header = 48
    footer = 30
    width = margin * 2 + tile * len(frames) + gap * (len(frames) - 1)
    image = Image.new("RGB", (width, header + tile + footer), (15, 23, 42))
    draw = ImageDraw.Draw(image)
    draw.text((margin, 12), "DEATH · RADIAL BURST · 8 FRAMES · 0.70 S", font=font(18), fill=(165, 243, 252))
    checker = checker_tile(tile)
    for index, frame in enumerate(frames):
        x = margin + index * (tile + gap)
        image.paste(checker, (x, header))
        enlarged = frame.resize((tile, tile), Image.Resampling.NEAREST)
        image.paste(enlarged, (x, header), enlarged)
        draw.text((x + 3, header + tile + 6), f"F{index + 1}", font=font(12), fill=(241, 245, 249))
    return image


def component_sizes(frame: Image.Image) -> list[int]:
    occupied = {(x, y) for y in range(FRAME_SIZE) for x in range(FRAME_SIZE) if frame.getpixel((x, y))[3]}
    sizes: list[int] = []
    while occupied:
        queue = deque([occupied.pop()])
        size = 0
        while queue:
            x, y = queue.popleft()
            size += 1
            for neighbor in (
                (x - 1, y - 1),
                (x, y - 1),
                (x + 1, y - 1),
                (x - 1, y),
                (x + 1, y),
                (x - 1, y + 1),
                (x, y + 1),
                (x + 1, y + 1),
            ):
                if neighbor in occupied:
                    occupied.remove(neighbor)
                    queue.append(neighbor)
        sizes.append(size)
    return sizes


def mean_radius(frame: Image.Image) -> float:
    distances = [
        math.hypot(x - CENTER[0], y - CENTER[1])
        for y in range(FRAME_SIZE)
        for x in range(FRAME_SIZE)
        if frame.getpixel((x, y))[3]
    ]
    return sum(distances) / len(distances)


def validate(frames: list[Image.Image], base: Image.Image) -> None:
    if len(frames) != FRAME_COUNT or sum(DURATIONS) != 700:
        raise AssertionError("Death burst must be 8 frames and 700 ms")
    expected_first = centered_character(base)
    if frames[0].tobytes() != expected_first.tobytes():
        raise AssertionError("F1 must preserve the canonical player pixels exactly")
    base_colors = set(base.get_flattened_data())
    signatures: set[bytes] = set()
    for index, frame in enumerate(frames):
        if frame.size != (FRAME_SIZE, FRAME_SIZE):
            raise AssertionError(f"F{index + 1}: invalid size")
        bounds = frame.getchannel("A").getbbox()
        if bounds is None or bounds[0] < 1 or bounds[1] < 1 or bounds[2] > 47 or bounds[3] > 47:
            raise AssertionError(f"F{index + 1}: invalid safety padding {bounds}")
        signatures.add(frame.tobytes())
        if index >= 4:
            colors = {pixel for pixel in frame.get_flattened_data() if pixel[3]}
            if not colors <= RESPAWN_COLORS:
                raise AssertionError(f"F{index + 1}: burst uses non-respawn colors {colors - RESPAWN_COLORS}")
            sizes = component_sizes(frame)
            if len(sizes) < 6:
                raise AssertionError(f"F{index + 1}: burst does not read as separated shards")
            if max(sizes) > 3:
                raise AssertionError(f"F{index + 1}: blue particle exceeds 3px: {max(sizes)}")
        else:
            colors = {
                pixel
                for pixel in frame.get_flattened_data()
                if pixel[3] and pixel not in RESPAWN_COLORS
            }
            if not colors <= base_colors:
                raise AssertionError(f"F{index + 1}: intact player was repainted")
    if len(signatures) != FRAME_COUNT:
        raise AssertionError("Every death frame must be visually distinct")
    radii = [mean_radius(frame) for frame in frames[4:]]
    if not all(left < right for left, right in zip(radii, radii[1:])):
        raise AssertionError(f"Burst radius must expand every frame: {radii}")
    print(
        "PASS death-radial-burst-8: exact F1 identity, 8 frames, 700 ms, "
        "48x48 cells, particles<=3px, separated components, "
        f"expanding radii={[round(value, 2) for value in radii]}"
    )


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("usage: build_death_radial_burst.py PLAYER_MAIN_DIRECTORY")
    player_directory = Path(sys.argv[1])
    export_directory = player_directory / "export"
    preview_directory = player_directory / "preview"
    preview_directory.mkdir(parents=True, exist_ok=True)

    master = Image.open(export_directory / "player-main-sprite-sheet.png").convert("RGBA")
    base = frame_at(master, 0)
    frames = make_intact_frames(base) + make_burst_frames()
    validate(frames, base)

    make_atlas(frames).save(export_directory / "death-radial-burst-8.png")
    make_review(frames).save(preview_directory / "death-radial-burst-8-review.png")
    make_animation_preview(
        frames,
        [f"death-radial-f{index + 1}" for index in range(FRAME_COUNT)],
        list(DURATIONS),
        preview_directory / "death-radial-burst-8.gif",
    )


if __name__ == "__main__":
    main()
