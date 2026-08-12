import { BackdropRenderer, WorldGeometryRenderer } from "../src/render/layers/SharedSceneRenderers.js";
import { EnvironmentAssetSet } from "../src/render/environment/EnvironmentAssetSet.js";
import { DEFAULT_ENVIRONMENT_DEFINITION } from "../src/render/environment/EnvironmentCatalog.js";
import { ENVIRONMENT_MAX_ALTITUDE } from "../src/render/environment/EnvironmentAltitude.js";
import { EnvironmentRendererComposer } from "../src/render/environment/EnvironmentRendererComposer.js";

const params = new URLSearchParams(globalThis.location.search);
const width = Math.max(320, Math.min(1600, Number(params.get("width")) || 1280));
const height = Math.max(320, Math.min(1200, Number(params.get("height")) || 720));
const altitude = Math.max(0, Math.min(ENVIRONMENT_MAX_ALTITUDE, Number(params.get("altitude")) || 0));
const canvas = document.getElementById("environment-preview");
canvas.width = width;
canvas.height = height;
canvas.style.width = `${width}px`;
canvas.style.height = `${height}px`;

const context = canvas.getContext("2d");
context.imageSmoothingEnabled = false;
const assets = new EnvironmentAssetSet({ atlases: DEFAULT_ENVIRONMENT_DEFINITION.atlases });
const composer = new EnvironmentRendererComposer({
    definition: DEFAULT_ENVIRONMENT_DEFINITION,
    assets,
    polygonBackdrop: new BackdropRenderer(),
    polygonTerrain: new WorldGeometryRenderer()
});

await waitForAssets(assets);
const playerY = -altitude;
const camera = { x: 0, y: playerY - height * 0.5, zoom: 1 };
const scene = {
    camera,
    player: { position: { x: width * 0.45, y: playerY } },
    world: {
        seed: 366,
        surfaces: [
            surface(18, width - 18, playerY + 64, playerY + 260, 0),
            surface(width * 0.58, width * 0.9, playerY - 170, playerY - 70, 1),
            surface(width * 0.08, width * 0.36, playerY - 340, playerY - 230, 2)
        ],
        checkpoints: [],
        summit: null
    },
    activeCheckpoint: null,
    runState: "running",
    impact: null
};
composer.draw({ context, scene, viewport: { cssWidth: width, cssHeight: height } });

function surface(left, right, top, bottom, level) {
    const inset = Math.min(90, (right - left) * 0.16);
    return {
        level,
        oneWay: level === 1,
        oneWayEdgeEnd: 1,
        vertices: [
            { x: left, y: top },
            { x: right, y: top },
            { x: right - inset, y: bottom },
            { x: left + inset, y: bottom }
        ]
    };
}

async function waitForAssets(assetSet) {
    const startedAt = performance.now();
    while (assetSet.status === "pending") {
        if (performance.now() - startedAt > 5000) throw new Error("Environment assets did not finish loading");
        await new Promise((resolve) => setTimeout(resolve, 16));
    }
    if (assetSet.status !== "ready") throw assetSet.error ?? new Error("Environment assets failed");
}
