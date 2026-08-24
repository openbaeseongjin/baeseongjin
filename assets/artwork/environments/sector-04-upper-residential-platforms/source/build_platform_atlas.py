from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
EXPORT = ROOT / "export"
PREVIEW = ROOT / "preview"
RAW_SOURCE = ROOT / "source" / "sector-04-upper-residential-platforms-imagegen-v2-raw.png"
NORMALIZED_SOURCE = EXPORT / "sector-04-upper-residential-platforms-module-sheet.png"

TILE_SIZE = 32
EDGE_HEIGHT = 8

COLOR = {
    "outline": (27, 31, 32, 255),
    "shadow": (48, 53, 53, 255),
    "support": (76, 82, 80, 255),
    "stone": (145, 148, 139, 255),
    "stone_shadow": (112, 118, 113, 255),
    "residential_ivory": (208, 204, 185, 255),
    "ivory_light": (226, 221, 200, 255),
    "garden_green": (91, 108, 86, 255),
    "green_shadow": (63, 79, 66, 255),
}


def normalize_imagegen_source():
    """Remove ImageGen's baked neutral checker and reduce it to a hard RGBA reference palette."""
    source = Image.open(RAW_SOURCE).convert("RGB")
    rgba = Image.new("RGBA", source.size, (0, 0, 0, 0))
    source_pixels = source.load()
    pixels = []
    for y in range(source.height):
        for x in range(source.width):
            red, green, blue = source_pixels[x, y]
            is_neutral_background = (
                min(red, green, blue) >= 238 and max(red, green, blue) - min(red, green, blue) <= 7
            )
            pixels.append((red, green, blue, 0 if is_neutral_background else 255))
    rgba.putdata(pixels)
    normalized = rgba.quantize(
        colors=20,
        method=Image.Quantize.FASTOCTREE,
        dither=Image.Dither.NONE,
    ).convert("RGBA")
    normalized.save(NORMALIZED_SOURCE, optimize=True)
    return normalized


def build_fill_tile():
    image = Image.new("RGBA", (TILE_SIZE, TILE_SIZE), COLOR["stone"])
    draw = ImageDraw.Draw(image)

    # Broad sealed amenity-deck panels stay quieter than exposed frames. Only
    # the repeat boundary and lower enclosure seam remain visible at 1x.
    draw.line((0, 0, 0, TILE_SIZE - 1), fill=COLOR["shadow"], width=1)
    draw.line((1, 0, 1, TILE_SIZE - 1), fill=COLOR["support"], width=1)
    draw.line((2, 2, TILE_SIZE - 1, 2), fill=COLOR["residential_ivory"], width=1)
    draw.line((2, 28, TILE_SIZE - 1, 28), fill=COLOR["stone_shadow"], width=1)
    draw.rectangle((2, 29, TILE_SIZE - 1, TILE_SIZE - 1), fill=COLOR["support"])
    draw.line((2, TILE_SIZE - 1, TILE_SIZE - 1, TILE_SIZE - 1), fill=COLOR["shadow"], width=1)

    return image


def build_edge_tile():
    image = Image.new("RGBA", (TILE_SIZE, EDGE_HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)

    # A bright maintained curb owns the walking boundary, followed by a
    # continuous recessed garden reveal and a sealed underside.
    draw.line((0, 0, TILE_SIZE - 1, 0), fill=COLOR["outline"], width=1)
    draw.line((0, 1, TILE_SIZE - 1, 1), fill=COLOR["ivory_light"], width=1)
    draw.line((0, 2, TILE_SIZE - 1, 2), fill=COLOR["residential_ivory"], width=1)
    draw.line((0, 3, TILE_SIZE - 1, 3), fill=COLOR["stone"], width=1)
    draw.line((0, 4, TILE_SIZE - 1, 4), fill=COLOR["garden_green"], width=1)
    draw.line((0, 5, TILE_SIZE - 1, 5), fill=COLOR["green_shadow"], width=1)
    draw.line((0, 6, TILE_SIZE - 1, 6), fill=COLOR["support"], width=1)
    draw.line((0, 7, TILE_SIZE - 1, 7), fill=COLOR["shadow"], width=1)

    return image


def tile_region(tile, width, height):
    image = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    for x in range(0, width, tile.width):
        for y in range(0, height, tile.height):
            image.alpha_composite(tile, (x, y))
    return image


def build_preview(fill, edge):
    scale = 4
    canvas = Image.new("RGBA", (768, 384), (9, 14, 23, 255))

    solid = tile_region(fill, 640, 96)
    solid.alpha_composite(tile_region(edge, 640, EDGE_HEIGHT), (0, 0))
    canvas.alpha_composite(solid, (64, 48))

    # 16px authored polygon sample: visibly thinner than the solid body.
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
    build_preview(fill, edge).save(PREVIEW / "sector-04-upper-residential-platforms-review.png", optimize=True)


if __name__ == "__main__":
    main()
