from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
EXPORT = ROOT / "export"
PREVIEW = ROOT / "preview"

TILE_SIZE = 32
EDGE_HEIGHT = 8

COLOR = {
    "outline": (20, 25, 31, 255),
    "deep_graphite": (34, 41, 48, 255),
    "graphite": (52, 59, 65, 255),
    "cool_concrete": (92, 99, 101, 255),
    "concrete_light": (137, 145, 145, 255),
    "service_recess": (42, 49, 56, 255),
    "muted_gold": (129, 112, 73, 255),
    "gold_shadow": (88, 78, 55, 255),
}


def build_fill_tile():
    image = Image.new("RGBA", (TILE_SIZE, TILE_SIZE), COLOR["graphite"])
    draw = ImageDraw.Draw(image)

    # Quiet, broad concrete slabs establish the large Central Exchange deck
    # rhythm. The left/right boundaries share the base color, avoiding seams.
    draw.rectangle((2, 2, 29, 16), fill=COLOR["deep_graphite"])
    draw.rectangle((3, 2, 28, 14), fill=COLOR["cool_concrete"])
    draw.line((3, 2, 28, 2), fill=COLOR["concrete_light"], width=1)
    draw.line((3, 14, 28, 14), fill=COLOR["outline"], width=1)
    draw.line((15, 3, 15, 13), fill=COLOR["graphite"], width=1)

    # A recessed service bay and a restrained gold spine keep the platform
    # civic/technical rather than decorative or luxury-coded.
    draw.rectangle((4, 19, 27, 29), fill=COLOR["deep_graphite"])
    draw.rectangle((5, 20, 26, 27), fill=COLOR["service_recess"])
    draw.line((6, 21, 25, 21), fill=COLOR["muted_gold"], width=1)
    draw.line((6, 22, 25, 22), fill=COLOR["gold_shadow"], width=1)
    draw.rectangle((7, 24, 12, 26), fill=COLOR["outline"])
    draw.rectangle((19, 24, 24, 26), fill=COLOR["outline"])
    draw.line((13, 25, 18, 25), fill=COLOR["graphite"], width=1)

    # Sparse fasteners survive 1x rendering without making a noisy grate.
    for x, y in ((5, 5), (26, 5), (7, 28), (24, 28)):
        draw.point((x, y), fill=COLOR["outline"])

    return image


def build_edge_tile():
    image = Image.new("RGBA", (TILE_SIZE, EDGE_HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)

    # Heavy composite nose for solid collision surfaces.
    draw.line((0, 0, TILE_SIZE - 1, 0), fill=COLOR["outline"], width=1)
    draw.line((0, 1, TILE_SIZE - 1, 1), fill=COLOR["concrete_light"], width=1)
    draw.line((0, 2, TILE_SIZE - 1, 2), fill=COLOR["cool_concrete"], width=1)
    draw.line((0, 3, TILE_SIZE - 1, 3), fill=COLOR["outline"], width=1)
    draw.rectangle((0, 4, TILE_SIZE - 1, 5), fill=COLOR["deep_graphite"])

    # Long service-frame rhythm. Gold remains below the walkable boundary and
    # does not compete with cyan grapple or red/orange telegraphs.
    draw.line((5, 5, 26, 5), fill=COLOR["muted_gold"], width=1)
    draw.line((5, 6, 26, 6), fill=COLOR["gold_shadow"], width=1)
    draw.rectangle((4, 5, 6, 7), fill=COLOR["outline"])
    draw.rectangle((25, 5, 27, 7), fill=COLOR["outline"])
    draw.point((5, 6), fill=COLOR["muted_gold"])
    draw.point((26, 6), fill=COLOR["muted_gold"])

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

    fill = build_fill_tile()
    edge = build_edge_tile()
    fill.save(EXPORT / "terrain-fill.png", optimize=True)
    edge.save(EXPORT / "terrain-edge.png", optimize=True)
    build_preview(fill, edge).save(PREVIEW / "sector-03-central-exchange-platforms-review.png", optimize=True)


if __name__ == "__main__":
    main()
