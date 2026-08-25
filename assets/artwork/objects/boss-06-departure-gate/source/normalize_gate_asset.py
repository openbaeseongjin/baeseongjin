from collections import deque
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIRECTORY = ROOT / "source"
EXPORT_DIRECTORY = ROOT / "export"
MOTION_DIRECTORY = EXPORT_DIRECTORY / "opening"
PREVIEW_DIRECTORY = ROOT / "preview"

STATE_SOURCE = {
    "locked": SOURCE_DIRECTORY / "departure-gate-locked-imagegen.png",
    "light": SOURCE_DIRECTORY / "departure-gate-light-imagegen.png",
    "open": SOURCE_DIRECTORY / "departure-gate-open-imagegen.png",
}
WORKING_SIZE = (240, 380)
EXPORT_SIZE = (480, 760)
PREVIEW_SIZE = (640, 900)
PREVIEW_OFFSET = (80, 70)
OPENING_FRAME_COUNT = 8
OPENING_PASSAGE_BOUNDS = (80, 88, 400, 716)
LARGE_BACKGROUND_COMPONENT_PIXELS = 2048


def is_background(pixel):
    red, green, blue = pixel[:3]
    return min(red, green, blue) >= 205 and max(red, green, blue) - min(red, green, blue) <= 24


def background_mask(image):
    width, height = image.size
    source = image.convert("RGB")
    pixels = source.load()
    visited = bytearray(width * height)
    background = bytearray(width * height)

    for start_y in range(height):
        for start_x in range(width):
            start_index = start_y * width + start_x
            if visited[start_index] or not is_background(pixels[start_x, start_y]):
                continue
            visited[start_index] = 1
            queue = deque([(start_x, start_y)])
            component = []
            touches_border = False
            while queue:
                x, y = queue.popleft()
                component.append((x, y))
                touches_border = touches_border or x == 0 or y == 0 or x == width - 1 or y == height - 1
                for next_x, next_y in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                    if next_x < 0 or next_y < 0 or next_x >= width or next_y >= height:
                        continue
                    index = next_y * width + next_x
                    if visited[index] or not is_background(pixels[next_x, next_y]):
                        continue
                    visited[index] = 1
                    queue.append((next_x, next_y))
            if touches_border or len(component) >= LARGE_BACKGROUND_COMPONENT_PIXELS:
                for x, y in component:
                    background[y * width + x] = 1
    return background


def extract_transparency(image):
    rgba = image.convert("RGBA")
    width, height = rgba.size
    background = background_mask(rgba)
    pixels = rgba.load()
    for y in range(height):
        row = y * width
        for x in range(width):
            if background[row + x]:
                red, green, blue, _ = pixels[x, y]
                pixels[x, y] = (red, green, blue, 0)
    return rgba


def normalize_sprite(image):
    bounds = image.getchannel("A").getbbox()
    if bounds is None:
        raise RuntimeError("background extraction removed the entire image")
    cropped = image.crop(bounds)
    working = cropped.resize(WORKING_SIZE, Image.Resampling.LANCZOS)
    return working.resize(EXPORT_SIZE, Image.Resampling.NEAREST)


def smoothstep(value):
    return value * value * (3 - 2 * value)


def opening_frames(light, opened):
    left, top, right, bottom = OPENING_PASSAGE_BOUNDS
    center_x = (left + right) // 2
    maximum_half_width = (right - left) // 2
    frames = []
    for index in range(OPENING_FRAME_COUNT):
        progress = index / (OPENING_FRAME_COUNT - 1)
        if index == 0:
            frame = light.copy()
        elif index == OPENING_FRAME_COUNT - 1:
            frame = opened.copy()
        else:
            frame = light.copy()
            half_width = max(2, round(maximum_half_width * smoothstep(progress)))
            reveal = (center_x - half_width, top, center_x + half_width, bottom)
            frame.paste(opened.crop(reveal), reveal)
        frames.append(frame)
    return frames


def dark_plate(sprite):
    plate = Image.new("RGB", PREVIEW_SIZE, "#07111f")
    plate.paste(sprite, PREVIEW_OFFSET, sprite)
    return plate


def state_sheet(states):
    sheet = Image.new("RGBA", (EXPORT_SIZE[0] * 3, EXPORT_SIZE[1]), (0, 0, 0, 0))
    for index, state in enumerate(("locked", "light", "open")):
        sheet.paste(states[state], (EXPORT_SIZE[0] * index, 0), states[state])
    return sheet


def transition_preview(states, opening):
    power_frames = [
        Image.blend(states["locked"], states["light"], progress)
        for progress in (0.0, 0.34, 0.67, 1.0)
    ]
    frames = [dark_plate(frame) for frame in [*power_frames, *opening[1:]]]
    durations = [350, 100, 100, 100, *([50] * (len(opening) - 2)), 800]
    frames[0].save(
        PREVIEW_DIRECTORY / "departure-gate-transition.gif",
        save_all=True,
        append_images=frames[1:],
        duration=durations,
        loop=0,
        disposal=2,
    )


def main():
    MOTION_DIRECTORY.mkdir(parents=True, exist_ok=True)
    states = {}
    for state, source_path in STATE_SOURCE.items():
        extracted = extract_transparency(Image.open(source_path))
        extracted.save(SOURCE_DIRECTORY / f"departure-gate-{state}-transparent.png")
        states[state] = normalize_sprite(extracted)
        states[state].save(EXPORT_DIRECTORY / f"departure-gate-{state}.png")
        dark_plate(states[state]).save(PREVIEW_DIRECTORY / f"departure-gate-{state}-review.png")

    opening = opening_frames(states["light"], states["open"])
    for index, frame in enumerate(opening):
        frame.save(MOTION_DIRECTORY / f"opening-{index:02d}.png")
    state_sheet(states).save(EXPORT_DIRECTORY / "departure-gate-state-sheet.png")
    transition_preview(states, opening)


if __name__ == "__main__":
    main()
