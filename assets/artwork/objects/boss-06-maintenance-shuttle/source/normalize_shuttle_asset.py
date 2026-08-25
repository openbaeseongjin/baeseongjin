from pathlib import Path
from collections import deque

from PIL import Image, ImageDraw


ASSET_ROOT = Path(__file__).resolve().parents[1]
SOURCE = ASSET_ROOT / "source" / "maintenance-shuttle-boarding-imagegen.png"
EXPORT = ASSET_ROOT / "export" / "maintenance-shuttle-boarding.png"
TRANSPARENCY_REVIEW = ASSET_ROOT / "preview" / "maintenance-shuttle-boarding-review.png"
SCALE_REVIEW = ASSET_ROOT / "preview" / "maintenance-shuttle-runtime-scale-review.png"
ENDING_ALIGNED_SOURCE = ASSET_ROOT / "source" / "maintenance-shuttle-boarding-ending-aligned-imagegen.png"
ENDING_ALIGNED_EXPORT = ASSET_ROOT / "export" / "maintenance-shuttle-boarding-ending-aligned.png"
ENDING_ALIGNED_TRANSPARENCY_REVIEW = (
    ASSET_ROOT / "preview" / "maintenance-shuttle-boarding-ending-aligned-review.png"
)
ENDING_ALIGNED_SCALE_REVIEW = (
    ASSET_ROOT / "preview" / "maintenance-shuttle-ending-aligned-runtime-scale-review.png"
)

LOGICAL_SIZE = (250, 195)
EXPORT_SIZE = (500, 390)
LOGICAL_PADDING = (4, 4, 4, 3)
SCALE_REVIEW_SIZE = (720, 500)
PLAYER_VISUAL_HEIGHT = 48
ENDING_ALIGNED_PALETTE_COLORS = 32
BACKGROUND_MIN_CHANNEL = 220
BACKGROUND_MAX_SPREAD = 16


def connected_neutral_background_alpha(image):
    width, height = image.size
    pixels = list(image.convert("RGB").getdata())
    candidates = bytearray(
        1
        if min(pixel) >= BACKGROUND_MIN_CHANNEL and max(pixel) - min(pixel) <= BACKGROUND_MAX_SPREAD
        else 0
        for pixel in pixels
    )
    background = bytearray(width * height)
    queue = deque()

    def seed(index):
        if candidates[index] and not background[index]:
            background[index] = 1
            queue.append(index)

    for x in range(width):
        seed(x)
        seed((height - 1) * width + x)
    for y in range(height):
        seed(y * width)
        seed(y * width + width - 1)

    while queue:
        index = queue.popleft()
        x = index % width
        if x > 0:
            seed(index - 1)
        if x + 1 < width:
            seed(index + 1)
        if index >= width:
            seed(index - width)
        if index + width < width * height:
            seed(index + width)

    return Image.frombytes("L", image.size, bytes(0 if value else 255 for value in background))


def remove_generated_background(image):
    isolated = image.copy()
    isolated.putalpha(connected_neutral_background_alpha(image))
    return isolated


def fit_with_bottom_anchor(image, *, resample=Image.Resampling.LANCZOS, palette_colors=None):
    alpha = image.getchannel("A")
    bounds = alpha.getbbox()
    if bounds is None:
        raise ValueError("source image has no visible pixels")

    cropped = image.crop(bounds)
    left, top, right, bottom = LOGICAL_PADDING
    available_width = LOGICAL_SIZE[0] - left - right
    available_height = LOGICAL_SIZE[1] - top - bottom
    scale = min(available_width / cropped.width, available_height / cropped.height)
    fitted_size = (
        max(1, round(cropped.width * scale)),
        max(1, round(cropped.height * scale)),
    )
    fitted = cropped.resize(fitted_size, resample)

    fitted_alpha = fitted.getchannel("A").point(lambda value: 255 if value >= 64 else 0)
    fitted.putalpha(fitted_alpha)
    visible_bounds = fitted_alpha.getbbox()
    if visible_bounds is None:
        raise ValueError("normalized image has no visible pixels")
    fitted = fitted.crop(visible_bounds)

    logical = Image.new("RGBA", LOGICAL_SIZE, (0, 0, 0, 0))
    x = (LOGICAL_SIZE[0] - fitted.width) // 2
    y = LOGICAL_SIZE[1] - bottom - fitted.height
    logical.alpha_composite(fitted, (x, y))
    if palette_colors is not None:
        alpha = logical.getchannel("A")
        logical = logical.quantize(
            colors=palette_colors,
            method=Image.Quantize.FASTOCTREE,
            dither=Image.Dither.NONE,
        ).convert("RGBA")
        logical.putalpha(alpha)
    return logical


def draw_player_reference(canvas, x, baseline_y):
    draw = ImageDraw.Draw(canvas)
    color = "#dce8ec"
    accent = "#67e8f9"
    head = 12
    body_width = 18
    body_height = PLAYER_VISUAL_HEIGHT - head - 8
    draw.rectangle((x + 6, baseline_y - PLAYER_VISUAL_HEIGHT, x + 6 + head, baseline_y - PLAYER_VISUAL_HEIGHT + head), fill=color)
    draw.rectangle((x + 3, baseline_y - body_height - 8, x + 3 + body_width, baseline_y - 8), fill=color)
    draw.rectangle((x, baseline_y - 8, x + 8, baseline_y), fill=accent)
    draw.rectangle((x + 16, baseline_y - 8, x + 24, baseline_y), fill=accent)


def build_scale_review(export):
    review = Image.new("RGBA", SCALE_REVIEW_SIZE, "#07131fff")
    draw = ImageDraw.Draw(review)
    deck_y = 452
    draw.rectangle((0, deck_y, SCALE_REVIEW_SIZE[0], SCALE_REVIEW_SIZE[1]), fill="#101e29")
    draw.rectangle((0, deck_y, SCALE_REVIEW_SIZE[0], deck_y + 5), fill="#415b68")
    review.alpha_composite(export, (42, deck_y - export.height))
    draw_player_reference(review, 625, deck_y)
    return review


def main():
    source = Image.open(SOURCE).convert("RGBA")
    logical = fit_with_bottom_anchor(source)
    export = logical.resize(EXPORT_SIZE, Image.Resampling.NEAREST)

    EXPORT.parent.mkdir(parents=True, exist_ok=True)
    TRANSPARENCY_REVIEW.parent.mkdir(parents=True, exist_ok=True)
    export.save(EXPORT)
    export.resize((1000, 780), Image.Resampling.NEAREST).save(TRANSPARENCY_REVIEW)
    build_scale_review(export).save(SCALE_REVIEW)

    ending_aligned_source = remove_generated_background(Image.open(ENDING_ALIGNED_SOURCE).convert("RGBA"))
    ending_aligned_logical = fit_with_bottom_anchor(
        ending_aligned_source,
        resample=Image.Resampling.NEAREST,
        palette_colors=ENDING_ALIGNED_PALETTE_COLORS,
    )
    ending_aligned_export = ending_aligned_logical.resize(EXPORT_SIZE, Image.Resampling.NEAREST)
    ending_aligned_export.save(ENDING_ALIGNED_EXPORT)
    ending_aligned_export.resize((1000, 780), Image.Resampling.NEAREST).save(
        ENDING_ALIGNED_TRANSPARENCY_REVIEW
    )
    build_scale_review(ending_aligned_export).save(ENDING_ALIGNED_SCALE_REVIEW)


if __name__ == "__main__":
    main()
