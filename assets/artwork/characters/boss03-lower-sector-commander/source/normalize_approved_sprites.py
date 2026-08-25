from __future__ import annotations

from collections import deque
from dataclasses import dataclass
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "source"
EXPORT = ROOT / "export"
TARGET_SIZE = (128, 192)
SOURCE_SIZE = (1024, 1536)
FOOT_Y = 152


@dataclass(frozen=True)
class SpriteSpec:
    source_name: str
    export_name: str


@dataclass(frozen=True)
class ComponentSpec:
    source_name: str
    export_name: str
    target_size: tuple[int, int]
    margin: int


SPRITES = (
    SpriteSpec(
        "commander-walk-contact-approved-source.png",
        "commander-walk-contact-approved-128x192.png",
    ),
    SpriteSpec(
        "commander-grab-telegraph-body-approved-source.png",
        "commander-grab-telegraph-body-approved-128x192.png",
    ),
    SpriteSpec(
        "commander-grab-pull-body-approved-source.png",
        "commander-grab-pull-body-approved-128x192.png",
    ),
    SpriteSpec(
        "commander-grab-held-body-approved-source.png",
        "commander-grab-held-body-approved-128x192.png",
    ),
)

COMPONENTS = (
    ComponentSpec(
        "commander-grab-hook-head-approved-source.png",
        "commander-grab-hook-head-approved-48x48.png",
        (48, 48),
        2,
    ),
    ComponentSpec(
        "commander-grab-chain-link-approved-source.png",
        "commander-grab-chain-link-approved-16x16.png",
        (16, 16),
        1,
    ),
    ComponentSpec(
        "commander-grab-held-hook-head-approved-source.png",
        "commander-grab-held-hook-head-approved-48x48.png",
        (48, 48),
        2,
    ),
    ComponentSpec(
        "commander-grab-held-chain-link-approved-source.png",
        "commander-grab-held-chain-link-approved-16x16.png",
        (16, 16),
        1,
    ),
)


def is_background_candidate(pixel: tuple[int, int, int]) -> bool:
    low = min(pixel)
    high = max(pixel)
    return low >= 225 and high - low <= 18


def edge_connected_background(image: Image.Image) -> Image.Image:
    rgb = image.convert("RGB")
    width, height = rgb.size
    pixels = rgb.load()
    background = Image.new("L", rgb.size, 0)
    mask = background.load()
    queue: deque[tuple[int, int]] = deque()

    def enqueue(x: int, y: int) -> None:
        if mask[x, y] or not is_background_candidate(pixels[x, y]):
            return
        mask[x, y] = 255
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
    return background


def source_rgba(image: Image.Image) -> Image.Image:
    if "A" in image.getbands():
        return image.convert("RGBA")
    rgb = image.convert("RGB")
    background = edge_connected_background(rgb)
    alpha = background.point(lambda value: 0 if value else 255)
    rgba = rgb.convert("RGBA")
    rgba.putalpha(alpha)
    return rgba


def normalize(spec: SpriteSpec) -> None:
    source_path = SOURCE / spec.source_name
    export_path = EXPORT / spec.export_name
    source = Image.open(source_path).convert("RGB")
    if source.size != SOURCE_SIZE:
        raise ValueError(f"{spec.source_name} must be {SOURCE_SIZE}, got {source.size}")

    rgba = source_rgba(source)
    output = rgba.resize(TARGET_SIZE, Image.Resampling.NEAREST)
    output_alpha = output.getchannel("A").point(lambda value: 255 if value else 0)
    output.putalpha(output_alpha)

    bounds = output.getchannel("A").getbbox()
    if bounds is None:
        raise ValueError(f"{spec.export_name} contains no opaque sprite pixels")
    current_foot_y = bounds[3] - 1
    y_offset = FOOT_Y - current_foot_y
    aligned = Image.new("RGBA", TARGET_SIZE, (0, 0, 0, 0))
    aligned.alpha_composite(output, (0, y_offset))
    output = aligned

    if output.size != TARGET_SIZE:
        raise ValueError(f"{spec.export_name} has unexpected size {output.size}")
    if set(output.getchannel("A").getdata()) - {0, 255}:
        raise ValueError(f"{spec.export_name} contains partial alpha")
    final_bounds = output.getchannel("A").getbbox()
    if final_bounds is None or final_bounds[3] - 1 != FOOT_Y:
        raise ValueError(f"{spec.export_name} foot anchor alignment failed")

    EXPORT.mkdir(parents=True, exist_ok=True)
    output.save(export_path)
    print(f"Wrote {export_path}")


def normalize_component(spec: ComponentSpec) -> None:
    source_path = SOURCE / spec.source_name
    export_path = EXPORT / spec.export_name
    rgba = source_rgba(Image.open(source_path))
    alpha = rgba.getchannel("A").point(lambda value: 255 if value >= 128 else 0)
    rgba.putalpha(alpha)
    bounds = alpha.getbbox()
    if bounds is None:
        raise ValueError(f"{spec.source_name} contains no opaque component pixels")
    cropped = rgba.crop(bounds)
    available_width = spec.target_size[0] - spec.margin * 2
    available_height = spec.target_size[1] - spec.margin * 2
    scale = min(available_width / cropped.width, available_height / cropped.height)
    output_size = (
        max(1, round(cropped.width * scale)),
        max(1, round(cropped.height * scale)),
    )
    resized = cropped.resize(output_size, Image.Resampling.NEAREST)
    resized_alpha = resized.getchannel("A").point(lambda value: 255 if value else 0)
    resized.putalpha(resized_alpha)

    output = Image.new("RGBA", spec.target_size, (0, 0, 0, 0))
    x = round((spec.target_size[0] - output_size[0]) / 2)
    y = round((spec.target_size[1] - output_size[1]) / 2)
    output.alpha_composite(resized, (x, y))
    if set(output.getchannel("A").getdata()) - {0, 255}:
        raise ValueError(f"{spec.export_name} contains partial alpha")

    EXPORT.mkdir(parents=True, exist_ok=True)
    output.save(export_path)
    print(f"Wrote {export_path}")


def main() -> None:
    for spec in SPRITES:
        normalize(spec)
    for spec in COMPONENTS:
        normalize_component(spec)


if __name__ == "__main__":
    main()
