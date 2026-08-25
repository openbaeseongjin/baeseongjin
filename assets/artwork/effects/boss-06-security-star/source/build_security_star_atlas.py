from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
LOGICAL_SIZE = (32, 32)
EXPORT_SCALE = 2
PREVIEW_SCALE = 4
CENTER = (16, 16)

PALETTE = {
    "idle": {"body": (214, 200, 149, 255), "core": (255, 247, 214, 255)},
    "telegraph": {"body": (245, 158, 11, 255), "core": (255, 247, 214, 255)},
    "active": {"body": (239, 68, 68, 255), "core": (255, 241, 242, 255)},
    "ending": {"body": (217, 170, 62, 255), "core": (255, 247, 214, 255)},
}

FRAME_SPEC = (
    ("idle", 3, 1, 2, 0, 160),
    ("idle", 4, 2, 2, 0, 160),
    ("idle", 3, 2, 2, 0, 160),
    ("telegraph", 5, 2, 2, 11, 110),
    ("telegraph", 7, 3, 2, 9, 110),
    ("telegraph", 9, 4, 3, 7, 110),
    ("telegraph", 11, 5, 4, 5, 110),
    ("active", 13, 5, 4, 4, 80),
    ("active", 14, 6, 5, 5, 80),
    ("ending", 10, 5, 4, 5, 110),
    ("ending", 8, 4, 3, 7, 110),
    ("ending", 6, 3, 2, 9, 110),
    ("ending", 3, 2, 2, 11, 110),
)


def pixel(draw: ImageDraw.ImageDraw, x: int, y: int, color, size: int = 1) -> None:
    draw.rectangle((x, y, x + size - 1, y + size - 1), fill=color)


def star_frame(state: str, ray: int, diagonal: int, core: int, mote: int) -> Image.Image:
    image = Image.new("RGBA", LOGICAL_SIZE, (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    colors = PALETTE[state]
    cx, cy = CENTER
    draw.rectangle((cx - ray, cy, cx + ray, cy), fill=colors["body"])
    draw.rectangle((cx, cy - ray, cx, cy + ray), fill=colors["body"])
    for direction_x in (-1, 1):
        for direction_y in (-1, 1):
            for step in range(1, diagonal + 1):
                pixel(draw, cx + direction_x * (step + 1), cy + direction_y * (step + 1), colors["body"])
    half_core = core // 2
    draw.rectangle((cx - half_core, cy - half_core, cx - half_core + core - 1, cy - half_core + core - 1), fill=colors["core"])
    if mote > 0:
        pixel(draw, cx + mote, cy, colors["core"])
        pixel(draw, cx + mote + 2, cy - 3, colors["body"])
        pixel(draw, cx + mote + 2, cy + 3, colors["body"])
    return image


def checker(size: tuple[int, int], cell: int = 8) -> Image.Image:
    image = Image.new("RGBA", size, (25, 34, 45, 255))
    draw = ImageDraw.Draw(image)
    for y in range(0, size[1], cell):
        for x in range(0, size[0], cell):
            if (x // cell + y // cell) % 2:
                draw.rectangle((x, y, x + cell - 1, y + cell - 1), fill=(38, 49, 63, 255))
    return image


def main() -> None:
    logical_directory = ROOT / "source" / "logical-32x32"
    export_frames_directory = ROOT / "export" / "frames"
    preview_directory = ROOT / "preview"
    logical_directory.mkdir(parents=True, exist_ok=True)
    export_frames_directory.mkdir(parents=True, exist_ok=True)
    preview_directory.mkdir(parents=True, exist_ok=True)

    logical_frames = []
    export_frames = []
    durations = []
    for index, (state, ray, diagonal, core, mote, duration) in enumerate(FRAME_SPEC):
        logical = star_frame(state, ray, diagonal, core, mote)
        exported = logical.resize(
            (LOGICAL_SIZE[0] * EXPORT_SCALE, LOGICAL_SIZE[1] * EXPORT_SCALE),
            Image.Resampling.NEAREST,
        )
        logical.save(logical_directory / f"frame-{index + 1:02d}.png")
        exported.save(export_frames_directory / f"frame-{index + 1:02d}.png")
        logical_frames.append(logical)
        export_frames.append(exported)
        durations.append(duration)

    atlas = Image.new(
        "RGBA",
        (export_frames[0].width * len(export_frames), export_frames[0].height),
        (0, 0, 0, 0),
    )
    for index, frame in enumerate(export_frames):
        atlas.alpha_composite(frame, (index * frame.width, 0))
    atlas.save(ROOT / "export" / "security-star.png")

    gif_frames = []
    for logical in logical_frames:
        scaled = logical.resize(
            (LOGICAL_SIZE[0] * PREVIEW_SCALE, LOGICAL_SIZE[1] * PREVIEW_SCALE),
            Image.Resampling.NEAREST,
        )
        background = checker(scaled.size)
        background.alpha_composite(scaled)
        gif_frames.append(background.convert("P", palette=Image.Palette.ADAPTIVE))
    gif_frames[0].save(
        preview_directory / "security-star.gif",
        save_all=True,
        append_images=gif_frames[1:],
        duration=durations,
        loop=0,
        disposal=2,
    )

    review = checker((len(logical_frames) * LOGICAL_SIZE[0] * PREVIEW_SCALE, LOGICAL_SIZE[1] * PREVIEW_SCALE))
    for index, logical in enumerate(logical_frames):
        scaled = logical.resize(
            (LOGICAL_SIZE[0] * PREVIEW_SCALE, LOGICAL_SIZE[1] * PREVIEW_SCALE),
            Image.Resampling.NEAREST,
        )
        review.alpha_composite(scaled, (index * scaled.width, 0))
    review.save(preview_directory / "security-star-review.png")


if __name__ == "__main__":
    main()
