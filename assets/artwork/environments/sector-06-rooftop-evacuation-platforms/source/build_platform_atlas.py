from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
EXPORT = ROOT / "export"
PREVIEW = ROOT / "preview"
RAW_SOURCE = ROOT / "source" / "sector-06-rooftop-evacuation-platforms-imagegen-v1.png"
NORMALIZED_SOURCE = EXPORT / "sector-06-rooftop-evacuation-platforms-module-sheet-v1.png"

TILE_SIZE = 32
EDGE_HEIGHT = 8

COLOR = {
    "outline": (20, 31, 45, 255),
    "deep_navy": (30, 47, 66, 255),
    "gantry_shadow": (43, 62, 82, 255),
    "structural_blue": (68, 90, 111, 255),
    "weathered_metal": (112, 132, 147, 255),
    "pale_metal": (183, 192, 193, 255),
    "flight_deck": (218, 217, 207, 255),
    "wind_white": (237, 233, 218, 255),
}


def normalize_imagegen_source():
    """Keep opaque modules and remove only transparent glow/shadow from the built-in source."""
    source = Image.open(RAW_SOURCE).convert("RGBA")
    alpha = source.getchannel("A").point(lambda value: 255 if value >= 128 else 0)
    source.putalpha(alpha)
    normalized = source.quantize(
        colors=24,
        method=Image.Quantize.FASTOCTREE,
        dither=Image.Dither.NONE,
    ).convert("RGBA")
    normalized.save(NORMALIZED_SOURCE, optimize=True)
    return normalized


def build_fill_tile():
    image = Image.new("RGBA", (TILE_SIZE, TILE_SIZE), COLOR["deep_navy"])
    draw = ImageDraw.Draw(image)

    # Each 32px module is one wind-open service bay. Boundary posts and a
    # single diagonal brace establish a gantry silhouette without micro-noise.
    draw.rectangle((0, 0, TILE_SIZE - 1, 4), fill=COLOR["structural_blue"])
    draw.line((0, 0, TILE_SIZE - 1, 0), fill=COLOR["weathered_metal"], width=1)
    draw.line((0, 4, TILE_SIZE - 1, 4), fill=COLOR["outline"], width=1)
    draw.rectangle((0, 5, 3, TILE_SIZE - 1), fill=COLOR["gantry_shadow"])
    draw.rectangle((TILE_SIZE - 4, 5, TILE_SIZE - 1, TILE_SIZE - 1), fill=COLOR["gantry_shadow"])
    draw.line((1, 6, 1, TILE_SIZE - 3), fill=COLOR["structural_blue"], width=1)
    draw.line((TILE_SIZE - 2, 6, TILE_SIZE - 2, TILE_SIZE - 3), fill=COLOR["structural_blue"], width=1)

    draw.line((4, TILE_SIZE - 5, TILE_SIZE - 5, 7), fill=COLOR["gantry_shadow"], width=4)
    draw.line((5, TILE_SIZE - 6, TILE_SIZE - 6, 8), fill=COLOR["structural_blue"], width=1)
    draw.rectangle((0, TILE_SIZE - 4, TILE_SIZE - 1, TILE_SIZE - 1), fill=COLOR["gantry_shadow"])
    draw.line((0, TILE_SIZE - 4, TILE_SIZE - 1, TILE_SIZE - 4), fill=COLOR["weathered_metal"], width=1)
    draw.line((0, TILE_SIZE - 1, TILE_SIZE - 1, TILE_SIZE - 1), fill=COLOR["outline"], width=1)

    return image


def build_edge_tile():
    image = Image.new("RGBA", (TILE_SIZE, EDGE_HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)

    # A pale chamfered cap reads first; the recessed drainage seam and dark
    # flange below it keep the exterior aviation deck distinct from Sector 05.
    draw.line((0, 0, TILE_SIZE - 1, 0), fill=COLOR["outline"], width=1)
    draw.line((0, 1, TILE_SIZE - 1, 1), fill=COLOR["wind_white"], width=1)
    draw.line((0, 2, TILE_SIZE - 1, 2), fill=COLOR["flight_deck"], width=1)
    draw.line((0, 3, TILE_SIZE - 1, 3), fill=COLOR["pale_metal"], width=1)
    draw.line((0, 4, TILE_SIZE - 1, 4), fill=COLOR["weathered_metal"], width=1)
    draw.line((0, 5, TILE_SIZE - 1, 5), fill=COLOR["structural_blue"], width=1)
    draw.line((0, 6, TILE_SIZE - 1, 6), fill=COLOR["gantry_shadow"], width=1)
    draw.line((0, 7, TILE_SIZE - 1, 7), fill=COLOR["outline"], width=1)

    return image


def tile_region(tile, width, height):
    image = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    for x in range(0, width, tile.width):
        for y in range(0, height, tile.height):
            image.alpha_composite(tile, (x, y))
    return image


def build_preview(fill, edge):
    scale = 4
    canvas = Image.new("RGBA", (768, 384), (10, 24, 41, 255))

    solid = tile_region(fill, 640, 96)
    solid.alpha_composite(tile_region(edge, 640, EDGE_HEIGHT), (0, 0))
    canvas.alpha_composite(solid, (64, 48))

    thin = tile_region(fill, 512, 16)
    thin.alpha_composite(tile_region(edge, 512, EDGE_HEIGHT), (0, 0))
    canvas.alpha_composite(thin, (128, 192))

    fill_large = fill.resize((TILE_SIZE * scale, TILE_SIZE * scale), Image.Resampling.NEAREST)
    edge_large = edge.resize((TILE_SIZE * scale, EDGE_HEIGHT * scale), Image.Resampling.NEAREST)
    canvas.alpha_composite(fill_large, (160, 240))
    canvas.alpha_composite(edge_large, (416, 288))
    return canvas


def main():
    EXPORT.mkdir(parents=True, exist_ok=True)
    PREVIEW.mkdir(parents=True, exist_ok=True)

    normalize_imagegen_source()
    fill = build_fill_tile()
    edge = build_edge_tile()
    fill.save(EXPORT / "terrain-fill.png", optimize=True)
    edge.save(EXPORT / "terrain-edge.png", optimize=True)
    build_preview(fill, edge).save(
        PREVIEW / "sector-06-rooftop-evacuation-platforms-review-v1.png",
        optimize=True,
    )


if __name__ == "__main__":
    main()
