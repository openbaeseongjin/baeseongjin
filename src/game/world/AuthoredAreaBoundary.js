const DIVIDER_HEIGHT = 48;
const SIDE_WALL_WIDTH = 32;

function freezePoint(x, y) {
    return Object.freeze({ x, y });
}

function dividerSurface(area, side, x, y, width, height) {
    return Object.freeze({
        id: `${area.id}:inter-floor-divider-${side}`,
        areaId: area.id,
        kind: "inter-floor-divider",
        collision: true,
        grappleable: false,
        renderable: false,
        oneWay: false,
        x,
        y,
        width,
        height,
        topY: y,
        vertices: Object.freeze([
            freezePoint(x, y),
            freezePoint(x + width, y),
            freezePoint(x + width, y + height),
            freezePoint(x, y + height)
        ])
    });
}

function sideWallSurface(area, side, x, y, width, height) {
    return Object.freeze({
        id: `${area.id}:area-boundary-wall-${side}`,
        areaId: area.id,
        kind: "area-boundary-wall",
        collision: true,
        grappleable: false,
        renderable: false,
        oneWay: false,
        x,
        y,
        width,
        height,
        topY: y,
        vertices: Object.freeze([
            freezePoint(x, y),
            freezePoint(x + width, y),
            freezePoint(x + width, y + height),
            freezePoint(x, y + height)
        ])
    });
}

export function interFloorDividerSurfaces(area, gate, height = DIVIDER_HEIGHT) {
    const { x, y, width } = area.bounds;
    const dividerY = y - height * 0.5;
    return Object.freeze([dividerSurface(area, "full", x, dividerY, width, height)]);
}

export function authoredAreaBoundarySurfaces(area, gate) {
    const { x, y, width, height } = area.bounds;
    return Object.freeze([
        sideWallSurface(area, "left", x, y, SIDE_WALL_WIDTH, height),
        sideWallSurface(area, "right", x + width - SIDE_WALL_WIDTH, y, SIDE_WALL_WIDTH, height),
        ...interFloorDividerSurfaces(area, gate)
    ]);
}
