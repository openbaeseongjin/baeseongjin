from pathlib import Path

from PIL import Image


ASSET_DIRECTORY = Path(__file__).resolve().parents[1]
AUTHORING_ATLAS = ASSET_DIRECTORY / "export" / "swarm-drone-contact-animation-atlas-v3.png"
STILL_EXPORT = ASSET_DIRECTORY / "export" / "swarm-drone-approved-still.png"
ANIMATION_PREVIEW = ASSET_DIRECTORY / "preview" / "swarm-drone-contact-animation.webp"
RUNTIME_ATLAS = (
    ASSET_DIRECTORY.parents[2] / "runtime" / "characters" / "sector-01-enemies" / "swarm-motion.png"
)

AUTHORING_CELL_SIZE = 362
RUNTIME_CELL_SIZE = 32
RUNTIME_SOURCE_CROP = (73, 47, 341, 315)
FRAME_DURATIONS_MS = (90, 90, 90, 90, 45, 55, 70, 90, 100, 110, 120, 120)
ALPHA_THRESHOLD = 96
RUNTIME_PALETTE = (
    (11, 13, 19),
    (21, 25, 37),
    (35, 41, 55),
    (55, 61, 72),
    (78, 74, 69),
    (116, 109, 100),
    (164, 158, 146),
    (211, 207, 194),
    (246, 242, 232),
    (67, 8, 145),
    (105, 18, 202),
    (151, 46, 244),
    (207, 151, 255),
    (245, 232, 255),
    (151, 43, 0),
    (255, 105, 0),
)


def frame_at(atlas, index):
    column = index % 4
    row = index // 4
    return atlas.crop(
        (
            column * AUTHORING_CELL_SIZE,
            row * AUTHORING_CELL_SIZE,
            (column + 1) * AUTHORING_CELL_SIZE,
            (row + 1) * AUTHORING_CELL_SIZE,
        )
    )


def nearest_palette_color(red, green, blue):
    return min(
        RUNTIME_PALETTE,
        key=lambda color: (red - color[0]) ** 2 + (green - color[1]) ** 2 + (blue - color[2]) ** 2,
    )


def runtime_frame(authoring_frame):
    resized = authoring_frame.crop(RUNTIME_SOURCE_CROP).resize(
        (RUNTIME_CELL_SIZE, RUNTIME_CELL_SIZE),
        Image.Resampling.NEAREST,
    )
    normalized = Image.new("RGBA", resized.size, (0, 0, 0, 0))
    source_pixels = resized.load()
    target_pixels = normalized.load()
    for y in range(RUNTIME_CELL_SIZE):
        for x in range(RUNTIME_CELL_SIZE):
            red, green, blue, alpha = source_pixels[x, y]
            if alpha < ALPHA_THRESHOLD:
                continue
            target_pixels[x, y] = (*nearest_palette_color(red, green, blue), 255)
    return normalized


def main():
    atlas = Image.open(AUTHORING_ATLAS).convert("RGBA")
    if atlas.size != (1448, 1086):
        raise ValueError(f"unexpected authoring atlas size: {atlas.size}")

    frames = [frame_at(atlas, index) for index in range(12)]
    frames[0].save(STILL_EXPORT)
    frames[0].save(
        ANIMATION_PREVIEW,
        save_all=True,
        append_images=frames[1:],
        duration=FRAME_DURATIONS_MS,
        loop=0,
        lossless=True,
        method=6,
    )

    runtime_atlas = Image.new("RGBA", (128, 96), (0, 0, 0, 0))
    for index, frame in enumerate(frames):
        runtime_atlas.alpha_composite(
            runtime_frame(frame),
            ((index % 4) * RUNTIME_CELL_SIZE, (index // 4) * RUNTIME_CELL_SIZE),
        )
    runtime_atlas.save(RUNTIME_ATLAS, optimize=True)


if __name__ == "__main__":
    main()
