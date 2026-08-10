import { closestPointOnPolygon, polygonBounds } from "./PolygonGeometry.js";

export const WORLD_GENERATION_REVISION = "procedural-rocks-v1";

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

export function closestPointOnSurface(point, surface) {
    return closestPointOnPolygon(point, surface.vertices);
}

export class WorldGenerator {
    constructor({
        seed,
        levelCount,
        verticalStep,
        laneWidth,
        enemySpawnInterval,
        checkpointInterval,
        checkpointRadius,
        summitRadius,
        floorY
    }) {
        this.seed = seed;
        this.levelCount = levelCount;
        this.verticalStep = verticalStep;
        this.laneWidth = laneWidth;
        this.enemySpawnInterval = enemySpawnInterval;
        this.checkpointInterval = checkpointInterval;
        this.checkpointRadius = checkpointRadius;
        this.summitRadius = summitRadius;
        this.floorY = floorY;
    }

    generate() {
        const random = createRandom(this.seed);
        const start = createOutcrop(-320, this.floorY, 640, 150, { kind: "start", level: 0 });
        const surfaces = [start];
        const route = [start];
        const enemySpawns = [];
        const lanes = [-this.laneWidth, 0, this.laneWidth];
        let laneIndex = 1;

        for (let level = 1; level <= this.levelCount; level += 1) {
            const direction = level % 4 < 2 ? 1 : -1;
            laneIndex = Math.max(0, Math.min(lanes.length - 1, laneIndex + direction));
            const width = 140 + random() * 55;
            const x = lanes[laneIndex] - width * 0.5 + (random() - 0.5) * 50;
            const y = this.floorY - level * this.verticalStep - random() * 12;
            const platform = createOutcrop(x, y, width, 70 + random() * 45, { kind: "route-rock", level });
            surfaces.push(platform);
            route.push(platform);

            if (level % this.enemySpawnInterval === 0) {
                enemySpawns.push(
                    Object.freeze({
                        x: x + width * (0.35 + random() * 0.3),
                        y: y - 24,
                        level
                    })
                );
            }
        }

        const summitPlatform = route.at(-1);
        const checkpoints = route
            .filter((platform) => platform.level % this.checkpointInterval === 0 && platform.level < this.levelCount)
            .map((platform) =>
                Object.freeze({
                    id: `checkpoint-${platform.level}`,
                    level: platform.level,
                    x: platform.x + platform.width * 0.5,
                    y: platform.topY - 24,
                    radius: this.checkpointRadius
                })
            );
        const summit = Object.freeze({
            x: summitPlatform.x + summitPlatform.width * 0.5,
            y: summitPlatform.topY - this.summitRadius,
            radius: this.summitRadius
        });

        return Object.freeze({
            seed: this.seed,
            surfaces: Object.freeze(surfaces),
            route: Object.freeze(route),
            enemySpawns: Object.freeze(enemySpawns),
            checkpoints: Object.freeze(checkpoints),
            summit,
            topY: route.at(-1).y
        });
    }
}
