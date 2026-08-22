from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "source" / "imagegen-polygon-direction-sheet.png"
EXPORT = ROOT / "export" / "polygon-design-sheet-32.png"
BODY_EXPORT = ROOT / "export" / "shield-body.png"
SHIELD_EXPORT = ROOT / "export" / "shield-directions.png"
REVIEW = ROOT / "preview" / "polygon-design-sheet-8x.png"
SELECTED = ROOT / "preview" / "polygon-guard-east-12x.png"
SCALE_CHECK = ROOT / "preview" / "polygon-neutral-scale-check.png"
BODY_REVIEW = ROOT / "preview" / "shield-body-layer-review.png"
SHIELD_REVIEW = ROOT / "preview" / "shield-direction-layer-review.png"
COMPOSITE_REVIEW = ROOT / "preview" / "shield-separated-composite-review.png"

PALETTE = (
    (5, 12, 24),
    (14, 30, 52),
    (38, 59, 86),
    (117, 111, 100),
    (255, 59, 28),
    (255, 174, 25),
)
SHIELD_COLOR = (117, 111, 100)
AMBER_COLOR = (255, 174, 25)
RED_ORANGE_COLOR = (255, 59, 28)


def nearest_color(pixel):
    red, green, blue, alpha = pixel
    if alpha < 96:
        return (0, 0, 0, 0)
    color = min(
        PALETTE,
        key=lambda candidate: (candidate[0] - red) ** 2
        + (candidate[1] - green) ** 2
        + (candidate[2] - blue) ** 2,
    )
    return (*color, 255)


def normalize_sheet(source):
    if source.width != source.height or source.width % 3:
        raise ValueError("Expected a square 3x3 ImageGen source")
    cell_size = source.width // 3
    cells = []
    extents = []
    for row in range(3):
        for column in range(3):
            cell = source.crop(
                (
                    column * cell_size,
                    row * cell_size,
                    (column + 1) * cell_size,
                    (row + 1) * cell_size,
                )
            )
            bounds = cell.getchannel("A").point(lambda alpha: 255 if alpha >= 96 else 0).getbbox()
            if bounds is None:
                raise ValueError("Every concept cell must contain an opaque sprite")
            center = cell_size // 2
            extents.append((center - bounds[0], center - bounds[1], bounds[2] - center, bounds[3] - center))
            cells.append(cell)

    left = max(extent[0] for extent in extents)
    top = max(extent[1] for extent in extents)
    right = max(extent[2] for extent in extents)
    bottom = max(extent[3] for extent in extents)
    envelope = (cell_size // 2 - left, cell_size // 2 - top, cell_size // 2 + right, cell_size // 2 + bottom)
    envelope_width = envelope[2] - envelope[0]
    envelope_height = envelope[3] - envelope[1]
    scale = min(28 / envelope_width, 28 / envelope_height)
    target_size = (max(1, round(envelope_width * scale)), max(1, round(envelope_height * scale)))

    logical = Image.new("RGBA", (96, 96), (0, 0, 0, 0))
    for index, cell in enumerate(cells):
        normalized = cell.crop(envelope).resize(target_size, Image.Resampling.NEAREST)
        column = index % 3
        row = index // 3
        logical.alpha_composite(
            normalized,
            (column * 32 + (32 - target_size[0]) // 2, row * 32 + (32 - target_size[1]) // 2),
        )

    logical.putdata([nearest_color(pixel) for pixel in logical.get_flattened_data()])
    return logical


def crop_cell(sheet, column, row):
    return sheet.crop((column * 32, row * 32, (column + 1) * 32, (row + 1) * 32))


def shield_layer(frame):
    shield_pixels = {
        (x, y)
        for y in range(32)
        for x in range(32)
        if frame.getpixel((x, y))[:3] == SHIELD_COLOR and frame.getpixel((x, y))[3] == 255
    }
    outline = {
        (x + delta_x, y + delta_y)
        for x, y in shield_pixels
        for delta_y in (-1, 0, 1)
        for delta_x in (-1, 0, 1)
        if 0 <= x + delta_x < 32 and 0 <= y + delta_y < 32
    }
    layer = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
    for point in outline:
        pixel = frame.getpixel(point)
        if pixel[3] == 255 and pixel[:3] not in (AMBER_COLOR, RED_ORANGE_COLOR):
            layer.putpixel(point, pixel)
    return layer


def body_frames(neutral):
    frames = []
    for phase in range(4):
        frame = neutral.copy()
        hover_pixels = [
            (x, y)
            for y in range(18, 31)
            for x in range(32)
            if frame.getpixel((x, y))[:3] == AMBER_COLOR and frame.getpixel((x, y))[3] == 255
        ]
        if hover_pixels and phase in (1, 2):
            bottom_x, bottom_y = max(hover_pixels, key=lambda point: point[1])
            if bottom_y + 1 < 32:
                frame.putpixel(
                    (bottom_x, bottom_y + 1),
                    (*((RED_ORANGE_COLOR if phase == 2 else AMBER_COLOR)), 255),
                )
        frames.append(frame)
    return frames


def horizontal_atlas(frames):
    atlas = Image.new("RGBA", (32 * len(frames), 32), (0, 0, 0, 0))
    for index, frame in enumerate(frames):
        atlas.alpha_composite(frame, (index * 32, 0))
    return atlas


def main():
    source = Image.open(SOURCE).convert("RGBA")
    logical = normalize_sheet(source)
    EXPORT.parent.mkdir(parents=True, exist_ok=True)
    REVIEW.parent.mkdir(parents=True, exist_ok=True)
    logical.save(EXPORT)
    logical.resize((768, 768), Image.Resampling.NEAREST).save(REVIEW)

    neutral = crop_cell(logical, 1, 1)
    body_atlas = horizontal_atlas(body_frames(neutral))
    direction_cells = (
        (2, 1),
        (2, 2),
        (1, 2),
        (0, 2),
        (0, 1),
        (0, 0),
        (1, 0),
        (2, 0),
    )
    shield_frames = [shield_layer(crop_cell(logical, column, row)) for column, row in direction_cells]
    shield_atlas = horizontal_atlas(shield_frames)
    body_atlas.save(BODY_EXPORT)
    shield_atlas.save(SHIELD_EXPORT)
    body_atlas.resize((1024, 256), Image.Resampling.NEAREST).save(BODY_REVIEW)
    shield_atlas.resize((1024, 128), Image.Resampling.NEAREST).save(SHIELD_REVIEW)

    combined = Image.new("RGBA", (256, 32), (0, 0, 0, 0))
    for index, shield in enumerate(shield_frames):
        combined.alpha_composite(neutral, (index * 32, 0))
        combined.alpha_composite(shield, (index * 32, 0))
    combined.resize((1024, 128), Image.Resampling.NEAREST).save(COMPOSITE_REVIEW)

    east_guard = logical.crop((64, 32, 96, 64))
    selected = Image.new("RGBA", (512, 512), (5, 12, 24, 255))
    selected.alpha_composite(east_guard.resize((384, 384), Image.Resampling.NEAREST), (64, 64))
    selected.save(SELECTED)

    scale_check = Image.new("RGBA", (256, 128), (5, 12, 24, 255))
    scale_check.alpha_composite(neutral, (40, 48))
    scale_check.alpha_composite(neutral.resize((64, 64), Image.Resampling.NEAREST), (144, 32))
    scale_check.save(SCALE_CHECK)


if __name__ == "__main__":
    main()
