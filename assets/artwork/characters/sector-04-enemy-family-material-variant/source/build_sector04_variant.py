from __future__ import annotations

import hashlib
import json
from collections import Counter
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


PACKAGE_ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = Path(__file__).resolve().parents[5]
SOURCE_ROOT = PACKAGE_ROOT / "source" / "approved-sector-01"
EXPORT_ROOT = PACKAGE_ROOT / "export"
PREVIEW_ROOT = PACKAGE_ROOT / "preview"
ATLAS_REVIEW_ROOT = PREVIEW_ROOT / "atlas-review"
SECTOR_REFERENCE = (
    REPO_ROOT
    / "assets"
    / "artwork"
    / "environments"
    / "sector-04-upper-residential-background"
    / "source"
    / "far-mid-near-v3-open-ascent-attached-master"
    / "sector-04-upper-residential-master.png"
)

ATLAS_NAMES = (
    "pursuit-motion.png",
    "sentry-upright-aim.png",
    "artillery-acquisition-motion.png",
    "shield-body.png",
    "shield-directions.png",
    "patrol-motion-attack.png",
    "support-motion.png",
    "swarm-motion.png",
)

# Only source RGB values in these fixed tables can change. The mappings are
# intentionally shared across every frame of an atlas to prevent color jitter.
COMMON_RESIDENTIAL_METAL = {
    (9, 15, 26): (8, 16, 19),
    (25, 37, 56): (31, 48, 48),
    (99, 91, 83): (105, 110, 82),
    (177, 166, 154): (177, 181, 159),
}

RESIDENTIAL_DRONE_METAL = {
    (5, 12, 24): (7, 16, 18),
    (14, 30, 52): (23, 42, 41),
    (38, 59, 86): (48, 70, 65),
    (117, 111, 100): (121, 124, 96),
}

PALETTE_MAPS = {
    "pursuit-motion.png": COMMON_RESIDENTIAL_METAL,
    "sentry-upright-aim.png": COMMON_RESIDENTIAL_METAL,
    "artillery-acquisition-motion.png": {
        (5, 13, 23): (7, 16, 18),
        (8, 20, 35): (15, 29, 29),
        (14, 35, 57): (27, 45, 43),
        (28, 57, 83): (50, 70, 63),
        (82, 81, 75): (91, 98, 76),
        (122, 116, 103): (132, 135, 106),
    },
    # Blue is the Shield role color, so only its neutral physical plate changes.
    "shield-body.png": {},
    "shield-directions.png": {(117, 111, 100): (121, 124, 96)},
    "patrol-motion-attack.png": RESIDENTIAL_DRONE_METAL,
    "support-motion.png": RESIDENTIAL_DRONE_METAL,
    "swarm-motion.png": {
        (11, 13, 19): (10, 16, 17),
        (21, 25, 37): (26, 37, 36),
        (35, 41, 55): (42, 54, 49),
        (55, 61, 72): (61, 70, 58),
        (78, 74, 69): (84, 88, 68),
        (116, 109, 100): (122, 124, 98),
        (164, 158, 146): (170, 174, 151),
    },
}

VINE_DARK = (51, 96, 36)
VINE_LIGHT = (122, 158, 50)
VINE_COLORS = (VINE_DARK, VINE_LIGHT)

# Vines replace existing neutral metal pixels only. Cell-local anchors are
# shared by every animation frame, then snapped to the closest eligible plate
# pixel so the decoration follows motion without changing alpha or silhouette.
VINE_ELIGIBLE_SOURCE_COLORS = {
    "pursuit-motion.png": {(25, 37, 56), (99, 91, 83), (177, 166, 154)},
    "sentry-upright-aim.png": {(25, 37, 56), (99, 91, 83), (177, 166, 154)},
    "artillery-acquisition-motion.png": {
        (8, 20, 35),
        (14, 35, 57),
        (28, 57, 83),
        (82, 81, 75),
        (122, 116, 103),
    },
    "shield-body.png": set(),
    "shield-directions.png": {(117, 111, 100)},
    "patrol-motion-attack.png": {(14, 30, 52), (38, 59, 86), (117, 111, 100)},
    "support-motion.png": {(14, 30, 52), (38, 59, 86), (117, 111, 100)},
    "swarm-motion.png": {
        (35, 41, 55),
        (55, 61, 72),
        (78, 74, 69),
        (116, 109, 100),
        (164, 158, 146),
    },
}

VINE_ANCHORS = {
    "pursuit-motion.png": ((16, 8), (17, 9), (18, 10), (18, 11), (19, 12), (20, 12), (20, 13)),
    "artillery-acquisition-motion.png": (
        (10, 13),
        (11, 14),
        (12, 15),
        (13, 16),
        (14, 17),
        (20, 18),
        (21, 18),
        (22, 17),
    ),
    "shield-directions.png": ((14, 8), (15, 9), (16, 10), (17, 11), (18, 11)),
    "patrol-motion-attack.png": ((14, 9), (15, 9), (16, 10), (17, 11), (18, 12), (19, 12), (20, 11)),
    "support-motion.png": ((18, 9), (19, 10), (20, 11), (20, 12), (19, 13), (18, 14), (17, 14)),
    "swarm-motion.png": ((16, 8), (17, 9), (18, 10), (19, 11)),
}

SENTRY_VINE_ANCHORS = {
    0: ((9, 15), (10, 16), (11, 17), (12, 18), (13, 18), (14, 18), (15, 17)),
    1: ((12, 7), (13, 8), (14, 9), (15, 10), (16, 10), (17, 11), (18, 12)),
}

PROTECTED_ROLE_COLORS = {
    "pursuit-motion.png": {(244, 171, 43), (239, 68, 39)},
    "sentry-upright-aim.png": {(239, 68, 39)},
    "artillery-acquisition-motion.png": {
        (236, 48, 34),
        (91, 16, 15),
        (255, 184, 24),
        (255, 116, 25),
        (255, 243, 196),
    },
    "shield-body.png": {
        (5, 12, 24),
        (14, 30, 52),
        (38, 59, 86),
        (255, 59, 28),
        (255, 174, 25),
    },
    "shield-directions.png": {(5, 12, 24), (14, 30, 52), (38, 59, 86)},
    "patrol-motion-attack.png": {(255, 59, 28), (255, 174, 25)},
    "support-motion.png": {(74, 222, 128), (187, 247, 208)},
    "swarm-motion.png": {
        (105, 18, 202),
        (151, 46, 244),
        (67, 8, 145),
        (245, 232, 255),
        (207, 151, 255),
        (255, 105, 0),
        (151, 43, 0),
    },
}

EXPECTED_SIZES = {
    "pursuit-motion.png": (128, 160),
    "sentry-upright-aim.png": (64, 32),
    "artillery-acquisition-motion.png": (384, 32),
    "shield-body.png": (128, 32),
    "shield-directions.png": (256, 32),
    "patrol-motion-attack.png": (128, 192),
    "support-motion.png": (128, 64),
    "swarm-motion.png": (128, 96),
}

ENEMIES = (
    ("SENTRY", "sentry-upright-aim.png", 0, 56),
    ("PURSUIT", "pursuit-motion.png", 0, 56),
    ("SHIELD", "shield-body.png", 0, 60),
    ("ARTILLERY", "artillery-acquisition-motion.png", 7, 56),
    ("PATROL", "patrol-motion-attack.png", 0, 56),
    ("SUPPORT", "support-motion.png", 0, 56),
    ("SWARM", "swarm-motion.png", 0, 18),
)


def load_font(size: int, bold: bool = False) -> ImageFont.ImageFont:
    windows_font = Path("C:/Windows/Fonts") / ("malgunbd.ttf" if bold else "malgun.ttf")
    if windows_font.exists():
        return ImageFont.truetype(str(windows_font), size=size)
    return ImageFont.load_default(size=size)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(65536), b""):
            digest.update(chunk)
    return digest.hexdigest()


def apply_palette(source: Image.Image, palette: dict[tuple[int, int, int], tuple[int, int, int]]) -> Image.Image:
    pixels = []
    for red, green, blue, alpha in source.convert("RGBA").get_flattened_data():
        mapped = palette.get((red, green, blue), (red, green, blue))
        pixels.append((*mapped, alpha))
    result = Image.new("RGBA", source.size)
    result.putdata(pixels)
    return result


def anchors_for(name: str, cell_index: int) -> tuple[tuple[int, int], ...]:
    if name == "sentry-upright-aim.png":
        return SENTRY_VINE_ANCHORS[cell_index]
    return VINE_ANCHORS.get(name, ())


def add_vines(name: str, source: Image.Image, result: Image.Image) -> Image.Image:
    eligible_colors = VINE_ELIGIBLE_SOURCE_COLORS[name]
    if not eligible_colors:
        return result

    output = result.copy()
    source_pixels = source.load()
    output_pixels = output.load()
    columns = source.width // 32
    rows = source.height // 32
    for cell_row in range(rows):
        for cell_column in range(columns):
            cell_index = cell_row * columns + cell_column
            anchors = anchors_for(name, cell_index)
            eligible = []
            for local_y in range(32):
                for local_x in range(32):
                    x = cell_column * 32 + local_x
                    y = cell_row * 32 + local_y
                    red, green, blue, alpha = source_pixels[x, y]
                    if alpha == 255 and (red, green, blue) in eligible_colors:
                        eligible.append((local_x, local_y))
            if not eligible:
                continue
            if len(eligible) < len(anchors):
                raise AssertionError(f"{name} cell {cell_index}: insufficient neutral plate pixels for vines")

            remaining = set(eligible)
            for anchor_index, (anchor_x, anchor_y) in enumerate(anchors):
                local_x, local_y = min(
                    remaining,
                    key=lambda point: (
                        abs(point[0] - anchor_x) + abs(point[1] - anchor_y),
                        (point[0] - anchor_x) ** 2 + (point[1] - anchor_y) ** 2,
                        point[1],
                        point[0],
                    ),
                )
                remaining.remove((local_x, local_y))
                x = cell_column * 32 + local_x
                y = cell_row * 32 + local_y
                red, green, blue = VINE_COLORS[anchor_index % len(VINE_COLORS)]
                output_pixels[x, y] = (red, green, blue, 255)
    return output


def frame(atlas: Image.Image, cell_index: int) -> Image.Image:
    columns = atlas.width // 32
    column = cell_index % columns
    row = cell_index // columns
    return atlas.crop((column * 32, row * 32, column * 32 + 32, row * 32 + 32))


def composite_enemy(root: Path, atlas_name: str, cell_index: int) -> Image.Image:
    image = frame(Image.open(root / atlas_name).convert("RGBA"), cell_index)
    if atlas_name == "sentry-upright-aim.png":
        head = frame(Image.open(root / atlas_name).convert("RGBA"), 1)
        image = Image.alpha_composite(image, head)
    elif atlas_name == "shield-body.png":
        shield = frame(Image.open(root / "shield-directions.png").convert("RGBA"), 0)
        image = Image.alpha_composite(image, shield)
    return image


def checkerboard(size: tuple[int, int], cell: int = 12) -> Image.Image:
    canvas = Image.new("RGBA", size, (15, 22, 33, 255))
    draw = ImageDraw.Draw(canvas)
    for y in range(0, size[1], cell):
        for x in range(0, size[0], cell):
            if (x // cell + y // cell) % 2:
                draw.rectangle((x, y, x + cell - 1, y + cell - 1), fill=(22, 31, 44, 255))
    return canvas


def make_atlas_reviews() -> None:
    for name in ATLAS_NAMES:
        atlas = Image.open(EXPORT_ROOT / name).convert("RGBA")
        scaled = atlas.resize((atlas.width * 4, atlas.height * 4), Image.Resampling.NEAREST)
        review = checkerboard(scaled.size, cell=16)
        review.alpha_composite(scaled)
        review.convert("RGB").save(ATLAS_REVIEW_ROOT / name, optimize=True)


def make_side_by_side() -> None:
    width = 1040
    header = 122
    row_height = 170
    canvas = Image.new("RGB", (width, header + len(ENEMIES) * row_height), (6, 13, 23))
    draw = ImageDraw.Draw(canvas)
    title_font = load_font(30, bold=True)
    header_font = load_font(20, bold=True)
    label_font = load_font(18, bold=True)
    sub_font = load_font(13)
    draw.text((32, 24), "SECTOR 04 · ENEMY MATERIAL VARIANT", font=title_font, fill=(232, 237, 244))
    draw.text((32, 66), "Approved identity preserved · maintained residential metal, lichen and short vines", font=sub_font, fill=(142, 158, 178))
    draw.text((272, 92), "CURRENT APPROVED", font=header_font, fill=(177, 166, 154), anchor="mm")
    draw.text((748, 92), "SECTOR 04 CANDIDATE", font=header_font, fill=(166, 184, 153), anchor="mm")

    for index, (label, atlas_name, cell_index, output_size) in enumerate(ENEMIES):
        top = header + index * row_height
        fill = (10, 21, 34) if index % 2 == 0 else (8, 18, 30)
        draw.rectangle((20, top + 6, width - 20, top + row_height - 6), fill=fill, outline=(42, 62, 82))
        draw.line((520, top + 20, 520, top + row_height - 20), fill=(42, 62, 82), width=1)
        draw.text((44, top + 43), label, font=label_font, fill=(232, 237, 244))
        draw.text((44, top + 76), f"32px cell → {output_size}px world", font=sub_font, fill=(125, 144, 165))

        for center_x, root in ((330, SOURCE_ROOT), (794, EXPORT_ROOT)):
            sprite = composite_enemy(root, atlas_name, cell_index).resize((160, 160), Image.Resampling.NEAREST)
            canvas.paste(sprite, (center_x - 80, top + 5), sprite)

    canvas.save(PREVIEW_ROOT / "sector-01-vs-sector-04-comparison.png", optimize=True)


def make_runtime_size_preview() -> None:
    reference = Image.open(SECTOR_REFERENCE).convert("RGB")
    width = 1024
    height = 790
    left = max(0, (reference.width - width) // 2)
    top = max(0, (reference.height - height) // 2)
    canvas = reference.crop((left, top, left + width, top + height))
    shade = Image.new("RGBA", canvas.size, (2, 8, 16, 112))
    canvas = Image.alpha_composite(canvas.convert("RGBA"), shade)
    draw = ImageDraw.Draw(canvas)
    title_font = load_font(28, bold=True)
    header_font = load_font(18, bold=True)
    label_font = load_font(16, bold=True)
    sub_font = load_font(12)
    draw.rectangle((0, 0, width, 76), fill=(4, 10, 18, 228))
    draw.text((26, 18), "ACTUAL WORLD OUTPUT SIZE", font=title_font, fill=(237, 240, 245))
    draw.text((470, 54), "CURRENT", font=header_font, fill=(177, 166, 154), anchor="mm")
    draw.text((780, 54), "SECTOR 04", font=header_font, fill=(166, 184, 153), anchor="mm")

    row_height = 98
    for index, (label, atlas_name, cell_index, output_size) in enumerate(ENEMIES):
        y = 82 + index * row_height
        draw.rounded_rectangle((18, y + 4, width - 18, y + row_height - 6), radius=8, fill=(5, 12, 22, 176), outline=(61, 75, 94, 210))
        draw.text((42, y + 28), label, font=label_font, fill=(236, 239, 244))
        draw.text((42, y + 56), f"{output_size}×{output_size}px", font=sub_font, fill=(157, 170, 186))
        for center_x, root in ((470, SOURCE_ROOT), (780, EXPORT_ROOT)):
            sprite = composite_enemy(root, atlas_name, cell_index).resize((output_size, output_size), Image.Resampling.NEAREST)
            canvas.alpha_composite(sprite, (center_x - output_size // 2, y + 47 - output_size // 2))

    canvas.convert("RGB").save(PREVIEW_ROOT / "sector-04-runtime-size-comparison.png", optimize=True)


def validate_pair(name: str, source: Image.Image, result: Image.Image) -> dict[str, object]:
    if source.size != EXPECTED_SIZES[name] or result.size != source.size:
        raise AssertionError(f"{name}: size changed")
    source_pixels = list(source.convert("RGBA").get_flattened_data())
    result_pixels = list(result.convert("RGBA").get_flattened_data())
    source_alpha = [pixel[3] for pixel in source_pixels]
    result_alpha = [pixel[3] for pixel in result_pixels]
    if source_alpha != result_alpha:
        raise AssertionError(f"{name}: alpha or transparent padding changed")
    if set(result_alpha) - {0, 255}:
        raise AssertionError(f"{name}: alpha is not binary")

    source_counts = Counter(pixel[:3] for pixel in source_pixels if pixel[3] == 255)
    result_counts = Counter(pixel[:3] for pixel in result_pixels if pixel[3] == 255)
    for color in PROTECTED_ROLE_COLORS[name]:
        if source_counts[color] != result_counts[color]:
            raise AssertionError(f"{name}: protected role color {color} changed")

    changed = sum(1 for source_pixel, result_pixel in zip(source_pixels, result_pixels) if source_pixel != result_pixel)
    opaque = sum(1 for alpha in source_alpha if alpha == 255)
    if name != "shield-body.png" and changed == 0:
        raise AssertionError(f"{name}: no material pixels changed")
    vine_pixels = sum(result_counts[color] for color in VINE_COLORS)
    frame_vine_counts = []
    source_frame_eligible_counts = []
    eligible_source_colors = VINE_ELIGIBLE_SOURCE_COLORS[name]
    columns = result.width // 32
    rows = result.height // 32
    for cell_row in range(rows):
        for cell_column in range(columns):
            cell = result.crop((cell_column * 32, cell_row * 32, cell_column * 32 + 32, cell_row * 32 + 32))
            cell_counts = Counter(pixel[:3] for pixel in cell.get_flattened_data() if pixel[3] == 255)
            frame_vine_counts.append(sum(cell_counts[color] for color in VINE_COLORS))
            source_cell = source.crop(
                (cell_column * 32, cell_row * 32, cell_column * 32 + 32, cell_row * 32 + 32)
            )
            source_frame_eligible_counts.append(
                sum(
                    1
                    for pixel in source_cell.get_flattened_data()
                    if pixel[3] == 255 and pixel[:3] in eligible_source_colors
                )
            )
    if name == "shield-body.png":
        if vine_pixels != 0:
            raise AssertionError(f"{name}: protected Shield body received vine pixels")
    elif not vine_pixels or any(
        eligible_count > 0 and vine_count <= 0
        for eligible_count, vine_count in zip(source_frame_eligible_counts, frame_vine_counts)
    ):
        raise AssertionError(f"{name}: one or more populated cells are missing the approved vine treatment")
    return {
        "size": list(source.size),
        "alphaValues": sorted(set(result_alpha)),
        "opaquePixels": opaque,
        "changedPixels": changed,
        "changedOpaqueRatio": round(changed / opaque, 6) if opaque else 0,
        "vinePixels": vine_pixels,
        "frameVinePixelCounts": frame_vine_counts,
        "sourceSha256": sha256(SOURCE_ROOT / name),
        "exportSha256": sha256(EXPORT_ROOT / name),
    }


def main() -> None:
    EXPORT_ROOT.mkdir(parents=True, exist_ok=True)
    ATLAS_REVIEW_ROOT.mkdir(parents=True, exist_ok=True)
    report = {}
    for name in ATLAS_NAMES:
        source = Image.open(SOURCE_ROOT / name).convert("RGBA")
        result = add_vines(name, source, apply_palette(source, PALETTE_MAPS[name]))
        result.save(EXPORT_ROOT / name, optimize=True)
        report[name] = validate_pair(name, source, result)

    make_atlas_reviews()
    make_side_by_side()
    make_runtime_size_preview()
    (PACKAGE_ROOT / "verification.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print("PASS sector-04 enemy material authoring variant")
    print("atlases=8 enemies=7 cell=32x32 alpha=binary geometry=unchanged roleColors=preserved vines=approved")
    for name, values in report.items():
        print(
            f"{name}: size={tuple(values['size'])} changed={values['changedPixels']} "
            f"ratio={values['changedOpaqueRatio']} vines={values['vinePixels']}"
        )


if __name__ == "__main__":
    main()
