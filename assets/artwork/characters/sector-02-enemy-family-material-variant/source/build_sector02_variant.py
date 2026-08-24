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
SECTOR_REFERENCE = REPO_ROOT / "docs" / "bsh" / "scenario" / "2" / "images" / "sector-02-background-reference.png"
USER_MATERIAL_REFERENCE = PACKAGE_ROOT / "source" / "user-reference" / "sector-02-rugged-cast-iron-user-reference.png"

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
COMMON_WORN_METAL = {
    (9, 15, 26): (12, 12, 13),
    (25, 37, 56): (43, 40, 38),
    (99, 91, 83): (91, 82, 73),
    (177, 166, 154): (148, 136, 122),
}

WORKER_DISTRICT_METAL = {
    (5, 12, 24): (12, 12, 13),
    (14, 30, 52): (33, 31, 30),
    (38, 59, 86): (59, 54, 49),
    (117, 111, 100): (135, 123, 109),
}

PALETTE_MAPS = {
    "pursuit-motion.png": COMMON_WORN_METAL,
    "sentry-upright-aim.png": COMMON_WORN_METAL,
    "artillery-acquisition-motion.png": {
        (5, 13, 23): (12, 12, 13),
        (8, 20, 35): (28, 27, 27),
        (14, 35, 57): (47, 44, 42),
        (28, 57, 83): (73, 67, 61),
        (82, 81, 75): (101, 91, 80),
        (122, 116, 103): (151, 138, 122),
    },
    # Blue is the Shield role color, so only its neutral physical plate changes.
    "shield-body.png": {},
    "shield-directions.png": {(117, 111, 100): (135, 123, 109)},
    "patrol-motion-attack.png": WORKER_DISTRICT_METAL,
    "support-motion.png": WORKER_DISTRICT_METAL,
    "swarm-motion.png": {
        (11, 13, 19): (13, 12, 13),
        (21, 25, 37): (30, 28, 28),
        (35, 41, 55): (47, 43, 41),
        (55, 61, 72): (65, 59, 54),
        (78, 74, 69): (88, 78, 69),
        (116, 109, 100): (132, 119, 105),
        (164, 158, 146): (158, 144, 128),
    },
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


SURFACE_ANCHORS = (
    (0.16, 0.24, "pit"),
    (0.22, 0.27, "pit"),
    (0.43, 0.18, "dust"),
    (0.50, 0.20, "wear"),
    (0.69, 0.24, "rust"),
    (0.75, 0.28, "rust"),
    (0.33, 0.41, "pit"),
    (0.39, 0.45, "pit"),
    (0.57, 0.46, "dust"),
    (0.63, 0.49, "dust"),
    (0.18, 0.60, "rust"),
    (0.23, 0.64, "rust"),
    (0.28, 0.66, "pit"),
    (0.44, 0.69, "wear"),
    (0.51, 0.72, "wear"),
    (0.58, 0.70, "dust"),
    (0.73, 0.68, "pit"),
    (0.79, 0.63, "pit"),
    (0.34, 0.82, "dust"),
    (0.40, 0.79, "dust"),
    (0.64, 0.83, "rust"),
    (0.70, 0.80, "rust"),
)

SURFACE_MIN_BRIGHTNESS = {
    "pit": 95,
    "rust": 115,
    "dust": 165,
    "wear": 190,
}


def clamp_channel(value: int) -> int:
    return max(0, min(255, value))


def surface_color(color: tuple[int, int, int], mode: str) -> tuple[int, int, int]:
    red, green, blue = color
    if mode == "pit":
        return (clamp_channel(red - 42), clamp_channel(green - 38), clamp_channel(blue - 32))
    if mode == "rust":
        return (clamp_channel(red + 46), clamp_channel(green - 15), clamp_channel(blue - 29))
    if mode == "dust":
        return (clamp_channel(red + 32), clamp_channel(green + 24), clamp_channel(blue + 13))
    if mode == "wear":
        return (clamp_channel(red + 47), clamp_channel(green + 43), clamp_channel(blue + 37))
    raise AssertionError(f"unsupported cast-iron surface mode: {mode}")


def apply_palette(source: Image.Image, palette: dict[tuple[int, int, int], tuple[int, int, int]]) -> Image.Image:
    pixels = []
    for red, green, blue, alpha in source.convert("RGBA").get_flattened_data():
        mapped = palette.get((red, green, blue), (red, green, blue))
        pixels.append((*mapped, alpha))
    result = Image.new("RGBA", source.size)
    result.putdata(pixels)
    return result


def apply_cast_iron_surface(
    name: str,
    source: Image.Image,
    palette_result: Image.Image,
) -> Image.Image:
    palette = PALETTE_MAPS[name]
    if not palette:
        return palette_result

    output = palette_result.copy()
    source_pixels = source.load()
    output_pixels = output.load()
    columns = source.width // 32
    rows = source.height // 32
    for cell_row in range(rows):
        for cell_column in range(columns):
            eligible = []
            for local_y in range(32):
                for local_x in range(32):
                    x = cell_column * 32 + local_x
                    y = cell_row * 32 + local_y
                    red, green, blue, alpha = source_pixels[x, y]
                    if alpha == 255 and (red, green, blue) in palette:
                        mapped = output_pixels[x, y][:3]
                        if sum(mapped) >= min(SURFACE_MIN_BRIGHTNESS.values()):
                            eligible.append((local_x, local_y))
            if not eligible:
                continue

            min_x = min(point[0] for point in eligible)
            max_x = max(point[0] for point in eligible)
            min_y = min(point[1] for point in eligible)
            max_y = max(point[1] for point in eligible)
            target_count = min(len(SURFACE_ANCHORS), max(2, len(eligible) // 7))
            anchor_indexes = {
                round(index * (len(SURFACE_ANCHORS) - 1) / (target_count - 1))
                for index in range(target_count)
            }
            selected_anchors = tuple(SURFACE_ANCHORS[index] for index in sorted(anchor_indexes))
            remaining = set(eligible)
            for normalized_x, normalized_y, mode in selected_anchors:
                anchor_x = min_x + round((max_x - min_x) * normalized_x)
                anchor_y = min_y + round((max_y - min_y) * normalized_y)
                bright_enough = [
                    point
                    for point in remaining
                    if sum(
                        output_pixels[
                            cell_column * 32 + point[0],
                            cell_row * 32 + point[1],
                        ][:3]
                    )
                    >= SURFACE_MIN_BRIGHTNESS[mode]
                ]
                candidates = bright_enough or list(remaining)
                local_x, local_y = min(
                    candidates,
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
                red, green, blue = surface_color(output_pixels[x, y][:3], mode)
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
    draw.text((32, 24), "SECTOR 02 · RUGGED CAST-IRON ENEMIES", font=title_font, fill=(232, 237, 244))
    draw.text((32, 66), "Approved Sector 01 geometry · user-selected Worker District material", font=sub_font, fill=(142, 158, 178))
    draw.text((272, 92), "CURRENT APPROVED", font=header_font, fill=(177, 166, 154), anchor="mm")
    draw.text((748, 92), "SECTOR 02 CANDIDATE", font=header_font, fill=(174, 151, 125), anchor="mm")

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

    canvas.save(PREVIEW_ROOT / "sector-01-vs-sector-02-comparison.png", optimize=True)


def make_runtime_size_preview() -> None:
    reference = Image.open(SECTOR_REFERENCE).convert("RGB")
    width = 1100
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
    draw.text((520, 54), "CURRENT", font=header_font, fill=(177, 166, 154), anchor="mm")
    draw.text((830, 54), "SECTOR 02", font=header_font, fill=(174, 151, 125), anchor="mm")

    row_height = 98
    for index, (label, atlas_name, cell_index, output_size) in enumerate(ENEMIES):
        y = 82 + index * row_height
        draw.rounded_rectangle((18, y + 4, width - 18, y + row_height - 6), radius=8, fill=(5, 12, 22, 176), outline=(61, 75, 94, 210))
        draw.text((42, y + 28), label, font=label_font, fill=(236, 239, 244))
        draw.text((42, y + 56), f"{output_size}×{output_size}px", font=sub_font, fill=(157, 170, 186))
        for center_x, root in ((520, SOURCE_ROOT), (830, EXPORT_ROOT)):
            sprite = composite_enemy(root, atlas_name, cell_index).resize((output_size, output_size), Image.Resampling.NEAREST)
            canvas.alpha_composite(sprite, (center_x - output_size // 2, y + 47 - output_size // 2))

    canvas.convert("RGB").save(PREVIEW_ROOT / "sector-02-runtime-size-comparison.png", optimize=True)


def validate_pair(
    name: str,
    source: Image.Image,
    palette_result: Image.Image,
    result: Image.Image,
) -> dict[str, object]:
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
    palette_pixels = list(palette_result.convert("RGBA").get_flattened_data())
    surface_pixels = sum(1 for palette_pixel, result_pixel in zip(palette_pixels, result_pixels) if palette_pixel != result_pixel)
    frame_surface_pixel_counts = []
    frame_eligible_pixel_counts = []
    columns = result.width // 32
    rows = result.height // 32
    for cell_row in range(rows):
        for cell_column in range(columns):
            bounds = (cell_column * 32, cell_row * 32, cell_column * 32 + 32, cell_row * 32 + 32)
            palette_cell = palette_result.crop(bounds)
            result_cell = result.crop(bounds)
            source_cell = source.crop(bounds)
            frame_eligible_pixel_counts.append(
                sum(
                    1
                    for source_pixel, palette_pixel in zip(
                        source_cell.get_flattened_data(), palette_cell.get_flattened_data()
                    )
                    if source_pixel[3] == 255
                    and source_pixel[:3] in PALETTE_MAPS[name]
                    and sum(palette_pixel[:3]) >= min(SURFACE_MIN_BRIGHTNESS.values())
                )
            )
            frame_surface_pixel_counts.append(
                sum(
                    1
                    for palette_pixel, result_pixel in zip(
                        palette_cell.get_flattened_data(), result_cell.get_flattened_data()
                    )
                    if palette_pixel != result_pixel
                )
            )
    if name == "shield-body.png":
        if surface_pixels:
            raise AssertionError(f"{name}: protected Shield body received cast-iron surface pixels")
    elif not surface_pixels or any(
        eligible_count > 0 and surface_count < 2
        for eligible_count, surface_count in zip(frame_eligible_pixel_counts, frame_surface_pixel_counts)
    ):
        raise AssertionError(f"{name}: cast-iron surface pattern is missing or too weak in one or more cells")
    return {
        "size": list(source.size),
        "alphaValues": sorted(set(result_alpha)),
        "opaquePixels": opaque,
        "changedPixels": changed,
        "changedOpaqueRatio": round(changed / opaque, 6) if opaque else 0,
        "surfacePixels": surface_pixels,
        "frameSurfacePixelCounts": frame_surface_pixel_counts,
        "frameEligiblePixelCounts": frame_eligible_pixel_counts,
        "sourceSha256": sha256(SOURCE_ROOT / name),
        "exportSha256": sha256(EXPORT_ROOT / name),
        "materialReferenceSha256": sha256(USER_MATERIAL_REFERENCE),
    }


def main() -> None:
    EXPORT_ROOT.mkdir(parents=True, exist_ok=True)
    ATLAS_REVIEW_ROOT.mkdir(parents=True, exist_ok=True)
    report = {}
    for name in ATLAS_NAMES:
        source = Image.open(SOURCE_ROOT / name).convert("RGBA")
        palette_result = apply_palette(source, PALETTE_MAPS[name])
        result = apply_cast_iron_surface(name, source, palette_result)
        result.save(EXPORT_ROOT / name, optimize=True)
        report[name] = validate_pair(name, source, palette_result, result)

    make_atlas_reviews()
    make_side_by_side()
    make_runtime_size_preview()
    (PACKAGE_ROOT / "verification.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print("PASS sector-02 enemy material authoring variant")
    print("atlases=8 enemies=7 cell=32x32 alpha=binary geometry=unchanged roleColors=preserved castIron=clustered")
    for name, values in report.items():
        print(
            f"{name}: size={tuple(values['size'])} changed={values['changedPixels']} "
            f"ratio={values['changedOpaqueRatio']} surface={values['surfacePixels']}"
        )


if __name__ == "__main__":
    main()
