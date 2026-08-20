from pathlib import Path

from PIL import Image, ImageDraw, ImageOps


ROOT = Path(__file__).resolve().parents[1]
EXPORT = ROOT / "export"
PREVIEW = ROOT / "preview"

CELL = 32
PIVOT = (16, 16)
SCALE = 8

TRANSPARENT = (0, 0, 0, 0)
OUTLINE = (9, 15, 26, 255)
NAVY = (25, 37, 56, 255)
WARM_GRAY = (99, 91, 83, 255)
METAL = (177, 166, 154, 255)
SENSOR = (239, 68, 39, 255)


def new_cell():
    return Image.new("RGBA", (CELL, CELL), TRANSPARENT)


def build_base():
    image = new_cell()
    draw = ImageDraw.Draw(image)

    # Symmetric upper chassis preserves candidate 06 without baking in aim.
    draw.rectangle((11, 7, 20, 9), fill=OUTLINE)
    draw.rectangle((12, 7, 19, 8), fill=METAL)
    draw.rectangle((8, 9, 23, 20), fill=OUTLINE)
    draw.rectangle((9, 10, 22, 19), fill=NAVY)
    draw.rectangle((9, 10, 10, 17), fill=WARM_GRAY)
    draw.rectangle((21, 10, 22, 17), fill=WARM_GRAY)
    draw.rectangle((11, 18, 20, 20), fill=OUTLINE)

    # Low symmetric puck base: one silhouette mass, one rim, one shadow mass.
    draw.polygon(
        [(6, 19), (10, 19), (10, 18), (21, 18), (21, 19), (26, 19),
         (26, 21), (28, 21), (28, 27), (26, 27), (26, 29), (6, 29),
         (6, 28), (4, 28), (4, 21), (6, 21)],
        fill=OUTLINE,
    )
    draw.rectangle((6, 21, 25, 23), fill=NAVY)
    draw.rectangle((7, 20, 11, 21), fill=METAL)
    draw.rectangle((20, 20, 24, 21), fill=METAL)
    draw.rectangle((12, 20, 19, 21), fill=WARM_GRAY)
    draw.rectangle((7, 24, 24, 27), fill=NAVY)
    draw.rectangle((8, 26, 23, 28), fill=OUTLINE)
    return image


def build_turret():
    image = new_cell()
    draw = ImageDraw.Draw(image)

    # Only the gimbal and single barrel rotate. The broad tube remains 6 px high.
    draw.rectangle((12, 13, 19, 18), fill=OUTLINE)
    draw.rectangle((13, 14, 18, 17), fill=WARM_GRAY)
    draw.rectangle((15, 14, 17, 17), fill=SENSOR)

    draw.rectangle((19, 13, 27, 18), fill=OUTLINE)
    draw.rectangle((19, 14, 26, 17), fill=NAVY)
    draw.rectangle((24, 14, 26, 15), fill=WARM_GRAY)
    draw.rectangle((27, 13, 28, 18), fill=OUTLINE)
    draw.rectangle((27, 14, 27, 17), fill=METAL)
    return image


def build_floor_base():
    image = new_cell()
    draw = ImageDraw.Draw(image)

    # Option B keeps only the low floor mount fixed.
    draw.rectangle((12, 17, 19, 21), fill=OUTLINE)
    draw.rectangle((13, 18, 18, 20), fill=METAL)
    draw.rectangle((15, 18, 16, 20), fill=WARM_GRAY)
    draw.polygon(
        [(6, 20), (10, 20), (10, 19), (21, 19), (21, 20), (26, 20),
         (26, 22), (28, 22), (28, 27), (26, 27), (26, 29), (6, 29),
         (6, 28), (4, 28), (4, 22), (6, 22)],
        fill=OUTLINE,
    )
    draw.rectangle((6, 22, 25, 24), fill=NAVY)
    draw.rectangle((7, 21, 11, 22), fill=METAL)
    draw.rectangle((20, 21, 24, 22), fill=METAL)
    draw.rectangle((12, 21, 19, 22), fill=WARM_GRAY)
    draw.rectangle((7, 25, 24, 27), fill=NAVY)
    draw.rectangle((8, 27, 23, 28), fill=OUTLINE)
    return image


def build_head_barrel():
    image = new_cell()
    draw = ImageDraw.Draw(image)

    # The complete compact head, counterweight, sensor, and barrel rotate together.
    draw.rectangle((7, 13, 11, 18), fill=OUTLINE)
    draw.rectangle((8, 14, 10, 17), fill=WARM_GRAY)
    draw.rectangle((10, 10, 21, 21), fill=OUTLINE)
    draw.rectangle((11, 11, 20, 20), fill=NAVY)
    draw.rectangle((13, 9, 19, 11), fill=OUTLINE)
    draw.rectangle((14, 9, 18, 10), fill=METAL)
    draw.rectangle((12, 19, 19, 20), fill=WARM_GRAY)

    # The centered warm hub and one red sensor keep the aim direction readable.
    draw.rectangle((14, 14, 17, 17), fill=WARM_GRAY)
    draw.rectangle((18, 14, 20, 17), fill=SENSOR)

    draw.rectangle((21, 13, 27, 18), fill=OUTLINE)
    draw.rectangle((21, 14, 26, 17), fill=NAVY)
    draw.rectangle((24, 14, 26, 15), fill=WARM_GRAY)
    draw.rectangle((27, 13, 28, 18), fill=OUTLINE)
    draw.rectangle((27, 14, 27, 17), fill=METAL)
    return image


def rotate_layer(layer, angle):
    return layer.rotate(
        angle,
        resample=Image.Resampling.NEAREST,
        center=PIVOT,
        expand=False,
        fillcolor=TRANSPARENT,
    )


def mirror_around_pivot(layer):
    # A 32 px canvas mirrors around x=15.5 by default. Shift one pixel so the
    # authored x=16 pivot remains fixed after the horizontal facing swap.
    mirrored = ImageOps.mirror(layer)
    result = new_cell()
    result.alpha_composite(mirrored, (1, 0))
    return result


def upright_head_orientation(angle):
    normalized = angle % 360
    if 90 < normalized < 270:
        return True, normalized - 180
    return False, normalized if normalized <= 90 else normalized - 360


def orient_head_upright(layer, angle):
    flip_x, local_angle = upright_head_orientation(angle)
    source = mirror_around_pivot(layer) if flip_x else layer
    return rotate_layer(source, local_angle)


def composite(base, turret, angle=0, orient=rotate_layer):
    image = new_cell()
    image.alpha_composite(base)
    image.alpha_composite(orient(turret, angle))
    return image


def scaled(image, factor=SCALE):
    return image.resize((image.width * factor, image.height * factor), Image.Resampling.NEAREST)


def build_rotation_sheet(base, turret, orient=rotate_layer):
    logical = Image.new("RGBA", (CELL * 4, CELL * 2), OUTLINE)
    angles = (0, 45, 90, 135, 180, 225, 270, 315)
    for index, angle in enumerate(angles):
        tile = composite(base, turret, angle, orient)
        x = (index % 4) * CELL
        y = (index // 4) * CELL
        logical.alpha_composite(tile, (x, y))
    return scaled(logical)


def build_runtime_size_sheet(base, turret, orient=rotate_layer):
    output_size = 56
    sheet = Image.new("RGBA", (output_size * 8, output_size), OUTLINE)
    for index, angle in enumerate((0, 45, 90, 135, 180, 225, 270, 315)):
        tile = composite(base, turret, angle, orient).resize(
            (output_size, output_size), Image.Resampling.NEAREST
        )
        sheet.alpha_composite(tile, (index * output_size, 0))
    return sheet


def build_component_sheet(base, turret):
    logical = Image.new("RGBA", (CELL * 2, CELL), OUTLINE)
    logical.alpha_composite(base, (0, 0))
    logical.alpha_composite(turret, (CELL, 0))
    return scaled(logical)


def validate(image, name):
    assert image.size == (CELL, CELL), f"{name}: unexpected dimensions {image.size}"
    assert image.mode == "RGBA", f"{name}: expected RGBA"
    alpha = {pixel[3] for pixel in image.get_flattened_data()}
    assert alpha <= {0, 255}, f"{name}: alpha must be binary, got {sorted(alpha)}"
    palette = {pixel for pixel in image.get_flattened_data() if pixel[3]}
    assert palette <= {OUTLINE, NAVY, WARM_GRAY, METAL, SENSOR}, (
        f"{name}: unexpected palette entries {palette}"
    )


def main():
    EXPORT.mkdir(parents=True, exist_ok=True)
    PREVIEW.mkdir(parents=True, exist_ok=True)

    base = build_base()
    turret = build_turret()
    right = composite(base, turret)
    validate(base, "base")
    validate(turret, "turret")
    validate(right, "composite-right")

    base.save(EXPORT / "sentry-base.png")
    turret.save(EXPORT / "sentry-turret.png")
    right.save(EXPORT / "sentry-composite-right.png")
    build_component_sheet(base, turret).save(PREVIEW / "components-8x.png")
    build_rotation_sheet(base, turret).save(PREVIEW / "rotation-8-directions-8x.png")
    build_runtime_size_sheet(base, turret).save(PREVIEW / "rotation-8-directions-56px.png")

    frames = [scaled(composite(base, turret, angle), 4) for angle in range(0, 360, 15)]
    frames[0].save(
        PREVIEW / "rotation-360.gif",
        save_all=True,
        append_images=frames[1:],
        duration=80,
        loop=0,
        disposal=2,
    )

    floor_base = build_floor_base()
    head_barrel = build_head_barrel()
    head_right = composite(floor_base, head_barrel, orient=orient_head_upright)
    validate(floor_base, "floor-base")
    validate(head_barrel, "head-barrel")
    validate(head_right, "head-composite-right")

    floor_base.save(EXPORT / "sentry-floor-base.png")
    head_barrel.save(EXPORT / "sentry-head-barrel.png")
    head_right.save(EXPORT / "sentry-head-composite-right.png")
    runtime_atlas = Image.new("RGBA", (CELL * 2, CELL), TRANSPARENT)
    runtime_atlas.alpha_composite(floor_base, (0, 0))
    runtime_atlas.alpha_composite(head_barrel, (CELL, 0))
    runtime_atlas.save(EXPORT / "sentry-upright-aim-atlas.png")
    build_component_sheet(floor_base, head_barrel).save(
        PREVIEW / "head-rotation-components-8x.png"
    )
    build_rotation_sheet(floor_base, head_barrel, orient_head_upright).save(
        PREVIEW / "head-rotation-8-directions-8x.png"
    )
    build_runtime_size_sheet(floor_base, head_barrel, orient_head_upright).save(
        PREVIEW / "head-rotation-8-directions-56px.png"
    )

    head_frames = [
        scaled(composite(floor_base, head_barrel, angle, orient_head_upright), 4)
        for angle in range(0, 360, 15)
    ]
    head_frames[0].save(
        PREVIEW / "head-rotation-360.gif",
        save_all=True,
        append_images=head_frames[1:],
        duration=80,
        loop=0,
        disposal=2,
    )

    print("PASS sentry rotating turret authoring exports")
    orientations = [upright_head_orientation(angle) for angle in range(0, 360, 15)]
    assert all(-90 <= local_angle <= 90 for _, local_angle in orientations)
    print("options=barrel-only,head-plus-barrel-upright pivot=16,16 cell=32x32 palette=5 alpha=binary")
    print("headFacing=horizontal-flip-on-left-half localRotation=-90..90")


if __name__ == "__main__":
    main()
