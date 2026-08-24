from collections import deque
from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
EXPORT = ROOT / "export"
PREVIEW = ROOT / "preview"
RAW_SOURCE = ROOT / "source" / "sector-05-continuity-control-platforms-imagegen-v2.png"
NORMALIZED_SOURCE = EXPORT / "sector-05-continuity-control-platforms-module-sheet-v2.png"

TILE_SIZE = 32
EDGE_HEIGHT = 8

COLOR = {
    "outline": (29, 33, 41, 255),
    "deep_shadow": (47, 52, 61, 255),
    "graphite": (66, 71, 79, 255),
    "precision_seam": (103, 107, 112, 255),
    "composite": (147, 149, 148, 255),
    "composite_light": (174, 175, 172, 255),
    "pale_metal": (210, 209, 203, 255),
    "frost_white": (235, 232, 222, 255),
    "violet_recess": (119, 109, 145, 255),
}


def is_checker_background(color):
    red, green, blue = color
    return min(red, green, blue) >= 240 and max(red, green, blue) - min(red, green, blue) <= 12


def normalize_imagegen_source():
    """Remove only border-connected neutral checker pixels and preserve enclosed pale-metal highlights."""
    source = Image.open(RAW_SOURCE).convert("RGB")
    source_pixels = source.load()
    width, height = source.size
    transparent = bytearray(width * height)
    queue = deque()

    def enqueue(x, y):
        index = y * width + x
        if transparent[index] or not is_checker_background(source_pixels[x, y]):
            return
        transparent[index] = 1
        queue.append((x, y))

    for x in range(width):
        enqueue(x, 0)
        enqueue(x, height - 1)
    for y in range(height):
        enqueue(0, y)
        enqueue(width - 1, y)

    while queue:
        x, y = queue.popleft()
        if x > 0:
            enqueue(x - 1, y)
        if x + 1 < width:
            enqueue(x + 1, y)
        if y > 0:
            enqueue(x, y - 1)
        if y + 1 < height:
            enqueue(x, y + 1)

    rgba = Image.new("RGBA", source.size, (0, 0, 0, 0))
    pixels = []
    for y in range(height):
        for x in range(width):
            red, green, blue = source_pixels[x, y]
            alpha = 0 if transparent[y * width + x] else 255
            pixels.append((red, green, blue, alpha))
    rgba.putdata(pixels)
    normalized = rgba.quantize(
        colors=24,
        method=Image.Quantize.FASTOCTREE,
        dither=Image.Dither.NONE,
    ).convert("RGBA")
    normalized.save(NORMALIZED_SOURCE, optimize=True)
    return normalized


def build_fill_tile():
    image = Image.new("RGBA", (TILE_SIZE, TILE_SIZE), COLOR["composite"])
    draw = ImageDraw.Draw(image)

    # A single module join and one broad face panel survive true 1x output
    # without turning the repeated terrain fill into a machine-detail grid.
    draw.line((0, 0, 0, TILE_SIZE - 1), fill=COLOR["deep_shadow"], width=1)
    draw.line((1, 1, 1, TILE_SIZE - 2), fill=COLOR["precision_seam"], width=1)
    draw.rectangle((3, 4, TILE_SIZE - 2, 21), fill=COLOR["composite_light"])
    draw.line((3, 4, TILE_SIZE - 2, 4), fill=COLOR["pale_metal"], width=1)
    draw.line((3, 21, TILE_SIZE - 2, 21), fill=COLOR["precision_seam"], width=1)

    # The violet service band is recessed inside a closed load shell. It never
    # grows a hook, socket, jaw, rail, or post that could imitate a hardpoint.
    draw.rectangle((2, 24, TILE_SIZE - 1, 30), fill=COLOR["deep_shadow"])
    draw.line((2, 24, TILE_SIZE - 1, 24), fill=COLOR["graphite"], width=1)
    draw.rectangle((5, 26, TILE_SIZE - 3, 27), fill=COLOR["violet_recess"])
    draw.line((5, 28, TILE_SIZE - 3, 28), fill=COLOR["graphite"], width=1)
    draw.line((2, 30, TILE_SIZE - 1, 30), fill=COLOR["outline"], width=1)
    draw.line((0, TILE_SIZE - 1, TILE_SIZE - 1, TILE_SIZE - 1), fill=COLOR["deep_shadow"], width=1)

    return image


def build_edge_tile():
    image = Image.new("RGBA", (TILE_SIZE, EDGE_HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)

    # The warm-neutral pale cap is the first-read walking line. All structure
    # beneath it stays flush so grappleable hardpoints remain the protrusions.
    draw.line((0, 0, TILE_SIZE - 1, 0), fill=COLOR["outline"], width=1)
    draw.line((0, 1, TILE_SIZE - 1, 1), fill=COLOR["frost_white"], width=1)
    draw.line((0, 2, TILE_SIZE - 1, 2), fill=COLOR["pale_metal"], width=1)
    draw.line((0, 3, TILE_SIZE - 1, 3), fill=COLOR["composite_light"], width=1)
    draw.line((0, 4, TILE_SIZE - 1, 4), fill=COLOR["precision_seam"], width=1)
    draw.line((0, 5, TILE_SIZE - 1, 5), fill=COLOR["graphite"], width=1)
    draw.line((0, 6, TILE_SIZE - 1, 6), fill=COLOR["deep_shadow"], width=1)
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
    canvas = Image.new("RGBA", (768, 384), (9, 14, 23, 255))

    solid = tile_region(fill, 640, 96)
    solid.alpha_composite(tile_region(edge, 640, EDGE_HEIGHT), (0, 0))
    canvas.alpha_composite(solid, (64, 48))

    # A 16px authored polygon remains visibly thinner than the solid body.
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
    build_preview(fill, edge).save(PREVIEW / "sector-05-continuity-control-platforms-review-v2.png", optimize=True)


if __name__ == "__main__":
    main()
