import { closestPointOnPolygon, polygonBounds } from "./PolygonGeometry.js";

function createRandom(seed) {
    let state = seed >>> 0 || 1;
    return () => {
        state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
        return state / 4294967296;
    };
}

function createSurface(vertices, properties) {
    return Object.freeze({ ...polygonBounds(vertices), ...properties, vertices: Object.freeze(vertices) });
}

function createOutcrop(x, y, width, depth, properties) {
    const vertices = [
        { x: x - width * 0.04, y: y + 5 },
        { x: x + width * 0.18, y },
        { x: x + width * 0.47, y: y + 3 },
        { x: x + width * 0.76, y: y + 1 },
        { x: x + width * 1.04, y: y + 5 },
        { x: x + width * 0.9, y: y + depth * 0.55 },
        { x: x + width * 0.58, y: y + depth },
        { x: x + width * 0.24, y: y + depth * 0.82 },
        { x, y: y + depth * 0.42 }
    ];
    return createSurface(vertices, { ...properties, oneWay: true, oneWayEdgeEnd: 4, topY: y });
}

function createPillar(x, y, width, height, properties) {
    const vertices = [
        { x: x + width * 0.12, y },
        { x: x + width * 0.88, y: y + 4 },
        { x: x + width, y: y + height * 0.28 },
        { x: x + width * 0.86, y: y + height * 0.7 },
        { x: x + width * 0.95, y: y + height },
        { x: x + width * 0.08, y: y + height * 0.94 },
        { x, y: y + height * 0.58 }
    ];
    return createSurface(vertices, { ...properties, oneWay: false, topY: y });
}

export function closestPointOnSurface(point, surface) {
    return closestPointOnPolygon(point, surface.vertices);
}

export class WorldGenerator {
    constructor({ seed, levelCount, verticalStep, laneWidth, floorY }) {
        this.seed = seed;
        this.levelCount = levelCount;
        this.verticalStep = verticalStep;
        this.laneWidth = laneWidth;
        this.floorY = floorY;
    }

    generate() {
        const random = createRandom(this.seed);
        const start = createOutcrop(-320, this.floorY, 640, 150, { kind: "start", level: 0 });
        const surfaces = [start];
        const route = [start];
        const lanes = [-this.laneWidth, 0, this.laneWidth];
        let laneIndex = 1;

        for (let level = 1; level <= this.levelCount; level += 1) {
            const direction = level % 4 < 2 ? 1 : -1;
            laneIndex = Math.max(0, Math.min(lanes.length - 1, laneIndex + direction));
            const width = 175 + random() * 65;
            const x = lanes[laneIndex] - width * 0.5 + (random() - 0.5) * 34;
            const y = this.floorY - level * this.verticalStep - random() * 12;
            const platform = createOutcrop(x, y, width, 70 + random() * 45, { kind: "route-rock", level });
            surfaces.push(platform);
            route.push(platform);

            const wallOnRight = laneIndex < 2;
            surfaces.push(
                createPillar(wallOnRight ? x + width + 105 : x - 133, y + 34, 28, 145 + random() * 80, {
                    kind: "swing-wall",
                    level
                })
            );

            if (level % 3 === 0) {
                surfaces.push(createOutcrop(x + width * 0.5 - 72, y - 112, 144, 54, { kind: "ceiling-rock", level }));
            }
        }

        return Object.freeze({
            seed: this.seed,
            surfaces: Object.freeze(surfaces),
            route: Object.freeze(route),
            topY: route.at(-1).y
        });
    }
}
