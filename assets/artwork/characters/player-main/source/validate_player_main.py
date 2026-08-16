from __future__ import annotations

import json
from pathlib import Path
import sys

from PIL import Image


FRAME_SIZE = 24
FRAME_COLUMNS = 8
FRAME_LABELS = (
    "idle-0",
    "idle-1",
    "run-0",
    "run-1",
    "run-2",
    "run-3",
    "run-4",
    "run-5",
    "run-6",
    "run-7",
    "jump",
    "fall",
    "rope-0",
    "rope-1",
    "rope-2",
    "rope-3",
    "hit-0",
    "hit-1",
    "respawn-0",
    "respawn-1",
    "respawn-2",
)
EXPECTED_ANIMATIONS = {
    "idle": 2,
    "run": 8,
    "jump": 1,
    "fall": 1,
    "rope": 4,
    "hit": 2,
    "respawn": 3,
}
SILHOUETTE_CHECKS = {
    "idle 호흡 변화": (0, 1, 0.02),
    "run 반대 접지": (2, 6, 0.05),
    "run 반대 통과": (4, 8, 0.05),
    "jump/fall 구분": (10, 11, 0.25),
    "hit 반동/회복": (16, 17, 0.35),
    "hit/respawn 구분": (16, 18, 0.40),
}


def frame_at(sheet: Image.Image, index: int) -> Image.Image:
    column = index % FRAME_COLUMNS
    row = index // FRAME_COLUMNS
    return sheet.crop(
        (
            column * FRAME_SIZE,
            row * FRAME_SIZE,
            (column + 1) * FRAME_SIZE,
            (row + 1) * FRAME_SIZE,
        )
    )


def mask(frame: Image.Image) -> set[tuple[int, int]]:
    alpha = frame.getchannel("A")
    return {
        (x, y)
        for y in range(FRAME_SIZE)
        for x in range(FRAME_SIZE)
        if alpha.getpixel((x, y)) > 0
    }


def difference_ratio(first: set[tuple[int, int]], second: set[tuple[int, int]]) -> float:
    union = first | second
    return len(first ^ second) / len(union)


def pixel_difference_ratio(first: Image.Image, second: Image.Image, minimum_y: int) -> float:
    compared = 0
    different = 0
    for y in range(minimum_y, FRAME_SIZE):
        for x in range(FRAME_SIZE):
            first_pixel = first.getpixel((x, y))
            second_pixel = second.getpixel((x, y))
            if first_pixel[3] == 0 and second_pixel[3] == 0:
                continue
            compared += 1
            if first_pixel != second_pixel:
                different += 1
    return different / compared


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: validate_player_main.py PLAYER_ARTWORK_DIRECTORY RUNTIME_DIRECTORY")
    artwork = Path(sys.argv[1])
    runtime = Path(sys.argv[2])
    master = Image.open(artwork / "export" / "player-main-sprite-sheet.png").convert("RGBA")
    locomotion = Image.open(runtime / "locomotion.png").convert("RGBA")
    run = Image.open(runtime / "run.png").convert("RGBA")
    actions = Image.open(runtime / "actions.png").convert("RGBA")
    manifest = json.loads((runtime / "sprite-manifest.json").read_text(encoding="utf-8"))

    assert master.size == (192, 72)
    assert locomotion.size == (144, 48)
    assert run.size == (192, 24)
    assert actions.size == (120, 24)
    assert master.getchannel("A").getextrema() == (0, 255)
    assert set(manifest["animations"]) == set(EXPECTED_ANIMATIONS)
    for state, count in EXPECTED_ANIMATIONS.items():
        assert len(manifest["animations"][state]["frames"]) == count

    frames = [frame_at(master, index) for index in range(len(FRAME_LABELS))]
    masks = [mask(frame) for frame in frames]
    bounds = []
    for label, frame_mask, frame in zip(FRAME_LABELS, masks, frames, strict=True):
        assert frame_mask, f"{label} is empty"
        box = frame.getchannel("A").getbbox()
        assert box is not None
        left, top, right, bottom = box
        assert left >= 1 and top >= 1 and right <= 23 and bottom <= 23, f"{label} clips its cell: {box}"
        bounds.append((label, box, len(frame_mask)))

    for index in range(21, 24):
        assert not mask(frame_at(master, index)), f"master cell {index} must be transparent"

    idle_boxes = [bounds[index][1] for index in range(2)]
    idle_heights = [box[3] - box[1] for box in idle_boxes]
    idle_width = max(box[2] - box[0] for box in idle_boxes)
    assert idle_boxes[0][3] == idle_boxes[1][3], "idle frames must share one ground line"
    assert abs(idle_heights[0] - idle_heights[1]) <= 1, "idle breathing must not squash the whole body"

    run_boxes = [bounds[index][1] for index in range(2, 10)]
    run_widths = [box[2] - box[0] for box in run_boxes]
    assert max(run_widths) <= idle_width, f"run stride breaks the compact chibi width: {run_widths} > {idle_width}"
    run_head_lower_widths = []
    for index in range(2, 10):
        head_x = [x for x, y in masks[index] if y <= 10]
        lower_x = [x for x, y in masks[index] if y >= 14]
        head_width = max(head_x) - min(head_x) + 1
        lower_width = max(lower_x) - min(lower_x) + 1
        assert lower_width <= head_width + 4, (
            f"{FRAME_LABELS[index]} legs extend too far for the two-head-tall design: "
            f"head={head_width}, lower={lower_width}"
        )
        run_head_lower_widths.append((head_width, lower_width))

    run_lower_masks = [
        {(x, y) for x, y in masks[index] if y >= 15}
        for index in range(2, 10)
    ]
    run_step_ratios = [
        difference_ratio(run_lower_masks[index], run_lower_masks[(index + 1) % 8])
        for index in range(8)
    ]
    run_color_ratios = [
        pixel_difference_ratio(frames[index + 2], frames[((index + 1) % 8) + 2], 15)
        for index in range(8)
    ]
    assert min(run_step_ratios) >= 0.07, f"run feet do not change enough between phases: {run_step_ratios}"
    assert min(run_color_ratios) >= 0.25, f"run leg values do not switch clearly enough: {run_color_ratios}"

    rope_frames = frames[12:16]
    rope_boxes = [bounds[index][1] for index in range(12, 16)]
    rope_widths = [box[2] - box[0] for box in rope_boxes]
    rope_heights = [box[3] - box[1] for box in rope_boxes]
    rope_pixel_counts = [bounds[index][2] for index in range(12, 16)]
    idle_pixel_floor = min(bounds[index][2] for index in range(2))
    rope_scale = manifest["animations"]["rope"].get("cue", {}).get("scale", {"x": 1, "y": 1})
    rope_hair_zone = {(x, y) for y in range(4, 11) for x in range(3, 6)}
    rope_scarf_zone = {(x, y) for y in range(10, 16) for x in range(1, 8)}
    rope_dynamic_zone = rope_hair_zone | rope_scarf_zone
    rope_fixed_differences = [
        sum(
            rope_frames[0].getpixel((x, y)) != frame.getpixel((x, y))
            for y in range(FRAME_SIZE)
            for x in range(FRAME_SIZE)
            if (x, y) not in rope_dynamic_zone
        )
        for frame in rope_frames[1:]
    ]
    rope_dynamic_differences = [
        sum(
            rope_frames[index].getpixel(point) != rope_frames[(index + 1) % 4].getpixel(point)
            for point in rope_dynamic_zone
        )
        / len(rope_dynamic_zone)
        for index in range(4)
    ]
    rope_hair_differences = [
        sum(
            rope_frames[index].getpixel(point) != rope_frames[(index + 1) % 4].getpixel(point)
            for point in rope_hair_zone
        )
        for index in range(4)
    ]

    def rope_scarf_tail(frame: Image.Image) -> set[tuple[int, int]]:
        return {
            (x, y)
            for y in range(10, 16)
            for x in range(1, 8)
            if (
                (pixel := frame.getpixel((x, y)))[3] > 0
                and pixel[0] > 100
                and pixel[0] > pixel[1] * 1.5
                and pixel[0] > pixel[2] * 1.25
            )
        }

    rope_scarf_tails = [rope_scarf_tail(frame) for frame in rope_frames]
    rope_scarf_counts = [len(tail) for tail in rope_scarf_tails]
    rope_scarf_min_x = [min(x for x, _ in tail) for tail in rope_scarf_tails]
    rope_scarf_max_x = [max(x for x, _ in tail) for tail in rope_scarf_tails]
    rope_scarf_widths = [maximum - minimum + 1 for minimum, maximum in zip(rope_scarf_min_x, rope_scarf_max_x, strict=True)]
    rope_scarf_heights = [max(y for _, y in tail) - min(y for _, y in tail) + 1 for tail in rope_scarf_tails]
    assert min(rope_widths) >= idle_width - 1, f"rope body is too thin: {rope_widths} vs idle {idle_width}"
    assert max(rope_widths) <= idle_width + 1, f"rope body is too wide: {rope_widths} vs idle {idle_width}"
    assert max(rope_heights) <= max(idle_heights) + 1, f"rope body is vertically stretched: {rope_heights}"
    assert min(rope_pixel_counts) >= idle_pixel_floor * 0.9, (
        f"rope body lost too much visual mass: {rope_pixel_counts} vs idle floor {idle_pixel_floor}"
    )
    assert rope_scale == {"x": 1, "y": 1}, f"rope presentation must not stretch the character: {rope_scale}"
    assert max(rope_fixed_differences) == 0, f"rope body or hands moved outside accessory zones: {rope_fixed_differences}"
    assert min(rope_dynamic_differences) >= 0.20, f"rope four-phase flow is too subtle: {rope_dynamic_differences}"
    assert max(rope_dynamic_differences) >= 0.35, f"rope traveling wave has no clear phase: {rope_dynamic_differences}"
    assert min(rope_hair_differences) >= 4, f"rope loose hair tips do not trail across every phase: {rope_hair_differences}"
    assert min(rope_scarf_counts) >= 18, f"rope scarf tail is too short: {rope_scarf_counts} pixels"
    assert max(rope_scarf_min_x) <= 1, f"rope scarf does not extend far enough backward: {rope_scarf_min_x}"
    assert min(rope_scarf_widths) >= 7, f"rope scarf loses backward extension: {rope_scarf_widths}"
    assert max(rope_scarf_heights) <= 5, f"rope scarf flaps too far vertically: {rope_scarf_heights}"
    assert all(width >= height + 2 for width, height in zip(rope_scarf_widths, rope_scarf_heights, strict=True)), (
        f"rope scarf must read as horizontal drag, not vertical flapping: widths={rope_scarf_widths}, heights={rope_scarf_heights}"
    )

    silhouette_results = []
    for label, (first, second, minimum) in SILHOUETTE_CHECKS.items():
        ratio = difference_ratio(masks[first], masks[second])
        assert ratio >= minimum, f"{label} is too similar: {ratio:.3f} < {minimum:.3f}"
        silhouette_results.append((label, ratio, minimum))

    for index, label in enumerate(FRAME_LABELS):
        pixels = [pixel for pixel in frames[index].get_flattened_data() if pixel[3] > 0]
        dark = sum(max(pixel[:3]) < 80 for pixel in pixels)
        red = sum(pixel[0] > 100 and pixel[0] > pixel[1] * 1.5 and pixel[0] > pixel[2] * 1.25 for pixel in pixels)
        cyan = sum(pixel[1] > 130 and pixel[2] > 130 and pixel[0] < 150 for pixel in pixels)
        if label == "respawn-0":
            assert cyan >= 20, "respawn-0 must read as a cyan reconstruction silhouette"
        else:
            assert dark >= 50, f"{label} lost the dark character body"
            assert red >= 15, f"{label} lost the red scarf cue"

    gif_results = []
    for state, expected_frames in EXPECTED_ANIMATIONS.items():
        animation = Image.open(artwork / "preview" / f"{state}.gif")
        assert animation.n_frames == expected_frames
        durations = []
        for frame_index in range(animation.n_frames):
            animation.seek(frame_index)
            durations.append(animation.info.get("duration"))
        gif_results.append((state, animation.n_frames, durations))

    report = artwork / "preview" / "test-results.md"
    lines = [
        "# player-main test results",
        "",
        "- Result: **PASS**",
        "- Master sheet: 192×72 RGBA, 24×24 cell 8×3",
        "- Runtime atlases: locomotion 144×48, run 192×24, actions 120×24",
        "- Required animations: 7/7",
        "- Occupied frames: 21/21; trailing transparent cells: 3/3",
        "- Cell clipping: 0 frames",
        "- Idle ground line: stable; whole-body height delta <= 1px",
        f"- Compact run width: {', '.join(str(width) for width in run_widths)}px; idle maximum {idle_width}px",
        "- Run head/lower-body widths: "
        + ", ".join(f"{head}/{lower}px" for head, lower in run_head_lower_widths)
        + "; lower body may exceed head by at most 4px",
        f"- Compact rope width/height: {', '.join(f'{width}×{height}px' for width, height in zip(rope_widths, rope_heights, strict=True))}; idle maximum {idle_width}×{max(idle_heights)}px",
        f"- Rope visual mass: {', '.join(str(count) for count in rope_pixel_counts)} pixels; idle floor {idle_pixel_floor}px, minimum 90%",
        "- Rope presentation scale: neutral 1×1",
        f"- Rope fixed body/hand differences outside hair/scarf zones: {', '.join(str(value) for value in rope_fixed_differences)}; required 0",
        f"- Rope adjacent hair/scarf differences: {', '.join(f'{value:.3f}' for value in rope_dynamic_differences)}; each >=0.200 and one >=0.350",
        f"- Rope adjacent loose-hair changed pixels: {', '.join(str(value) for value in rope_hair_differences)}; minimum 4",
        f"- Rope scarf tail: {', '.join(str(count) for count in rope_scarf_counts)} pixels, width {', '.join(str(value) for value in rope_scarf_widths)}px, height {', '.join(str(value) for value in rope_scarf_heights)}px, left edge x={', '.join(str(value) for value in rope_scarf_min_x)}",
        f"- Run lower-body adjacent differences: {', '.join(f'{ratio:.3f}' for ratio in run_step_ratios)}",
        f"- Run lower-body color differences: {', '.join(f'{ratio:.3f}' for ratio in run_color_ratios)}",
        "",
        "## Silhouette difference",
        "",
        "| Check | Measured | Minimum | Result |",
        "| --- | ---: | ---: | --- |",
    ]
    lines.extend(
        f"| {label} | {ratio:.3f} | {minimum:.3f} | PASS |"
        for label, ratio, minimum in silhouette_results
    )
    lines.extend(
        [
            "",
            "## Animation previews",
            "",
            "| State | Frames | GIF durations (ms) | Result |",
            "| --- | ---: | --- | --- |",
        ]
    )
    lines.extend(
        f"| `{state}` | {count} | {', '.join(str(value) for value in durations)} | PASS |"
        for state, count, durations in gif_results
    )
    lines.extend(
        [
            "",
            "## Manual visual review",
            "",
            "- `idle`: 접지선과 전체 높이를 유지하며 어깨·가슴·스카프만 작게 호흡한다.",
            "- `run`: 2등신의 큰 머리와 짧은 몸통·다리를 유지한 채 좌우 접지·하강·통과·상승 자세가 교차한다.",
            "- `jump`/`fall`: 다리를 접은 상승 자세와 팔다리를 편 하강 자세가 구분된다.",
            "- `rope`: 그립 손·빈 앞손·머리 중심·몸통·골반·다리를 고정하고, 스카프는 네 프레임 내내 뒤쪽으로 뻗은 채 얕은 파동만 목에서 꼬리 끝으로 전달된다.",
            "- `hit`: 수평 반동 뒤 웅크린 회복 자세로 이어진다.",
            "- `respawn`: 청록 실루엣에서 완전한 캐릭터와 외곽광으로 진행한다.",
            "- 48×48 실제 출력에서도 검은 몸, 흰 눈, 빨간 스카프와 상태 실루엣이 판독된다.",
            "",
            "자동 validator와 저장소 전체 검사는 아래 명령의 실제 실행 결과로 별도 확인한다.",
        ]
    )
    report.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"PASS: {len(frames)} frames, {len(EXPECTED_ANIMATIONS)} animations, report={report}")


if __name__ == "__main__":
    main()
