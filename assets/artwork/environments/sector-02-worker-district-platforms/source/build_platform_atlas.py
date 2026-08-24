from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
EXPORT = ROOT / "export"
PREVIEW = ROOT / "preview"

TILE_SIZE = 32
EDGE_HEIGHT = 8

COLOR = {
    "outline": (17, 21, 28, 255),
    "shadow": (27, 32, 41, 255),
    "base": (45, 48, 55, 255),
    "concrete": (66, 66, 65, 255),
    "patch": (48, 58, 59, 255),
    "edge": (117, 113, 101, 255),
    "grime": (35, 36, 38, 255),
    "old_fluorescent": (101, 108, 82, 255),
    "wear": (139, 130, 96, 255),
}


def build_fill_tile():
    image = Image.new("RGBA", (TILE_SIZE, TILE_SIZE), COLOR["base"])
    draw = ImageDraw.Draw(image)

    # Keep the repeat boundary quiet. Stable-ID Block Pool overlays own the
    # larger panel rhythm, while this tile supplies worn residential material.
    draw.rectangle((2, 3, 17, 17), fill=COLOR["concrete"])
    draw.rectangle((3, 4, 17, 16), fill=(62, 62, 61, 255))
    draw.line((4, 16, 17, 16), fill=COLOR["shadow"], width=1)

    # A restrained repair plate and repaint scar distinguish Worker District
    # from the clean or industrial sector families without reading as signage.
    draw.rectangle((19, 5, 29, 15), fill=COLOR["shadow"])
    draw.rectangle((20, 5, 29, 14), fill=COLOR["patch"])
    draw.line((20, 5, 29, 5), fill=(73, 79, 76, 255), width=1)
    draw.rectangle((5, 21, 25, 28), fill=COLOR["shadow"])
    draw.rectangle((6, 21, 25, 27), fill=(42, 46, 51, 255))
    draw.line((6, 21, 25, 21), fill=COLOR["old_fluorescent"], width=1)

    # Sparse chips and fasteners survive 1x nearest-neighbor rendering.
    for x, y in ((5, 5), (16, 7), (22, 8), (28, 13), (8, 24), (23, 26)):
        draw.point((x, y), fill=COLOR["outline"])
    for x, y in ((10, 9), (13, 14), (26, 7), (9, 29), (29, 20)):
        draw.point((x, y), fill=COLOR["grime"])
    draw.line((10, 11, 13, 12), fill=COLOR["grime"], width=1)
    draw.point((14, 13), fill=COLOR["grime"])

    return image


def build_edge_tile():
    image = Image.new("RGBA", (TILE_SIZE, EDGE_HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)

    # A heavy worn lip for solid surfaces; the authored one-way polygon remains
    # visibly thinner and receives the runtime's subdued one-way chain stroke.
    draw.line((0, 0, TILE_SIZE - 1, 0), fill=COLOR["outline"], width=1)
    draw.line((0, 1, TILE_SIZE - 1, 1), fill=COLOR["edge"], width=1)
    draw.line((0, 2, TILE_SIZE - 1, 2), fill=COLOR["concrete"], width=1)
    draw.line((0, 3, TILE_SIZE - 1, 3), fill=COLOR["outline"], width=1)
    draw.rectangle((0, 4, TILE_SIZE - 1, 5), fill=COLOR["shadow"])
    for x in (4, 15, 27):
        draw.rectangle((x, 6, x + 2, 7), fill=COLOR["outline"])
    draw.line((20, 1, 23, 1), fill=COLOR["wear"], width=1)

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
    solid = solid.resize((640, 96), Image.Resampling.NEAREST)
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

    fill = build_fill_tile()
    edge = build_edge_tile()
    fill.save(EXPORT / "terrain-fill.png", optimize=True)
    edge.save(EXPORT / "terrain-edge.png", optimize=True)
    build_preview(fill, edge).save(PREVIEW / "sector-02-worker-district-platforms-review.png", optimize=True)


if __name__ == "__main__":
    main()
