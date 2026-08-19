import { createPlayerCommand } from "../src/game/commands/PlayerCommand.js";
import { createCurrentGameSimulation } from "../src/game/simulation/GameSimulationFactory.js";
import { CanvasRenderer } from "../src/render/CanvasRenderer.js";
import { PolygonSceneRenderer } from "../src/render/PolygonSceneRenderer.js";

const canvas = document.getElementById("preview");
const unlockButton = document.getElementById("unlock");
const focusButton = document.getElementById("focus-carrier");
const backtrackButton = document.getElementById("focus-backtrack");
const simulation = createCurrentGameSimulation({
    worldSeed: 9182,
    playerId: "visual-player"
});
const renderer = new CanvasRenderer(canvas, new PolygonSceneRenderer(), { pixelRatio: () => 1 });
const route = simulation.world.routeLocks.find(({ sourceLandmarkId }) => sourceLandmarkId === "sector-01:landmark:08");
const device = simulation.world.objects.find(
    ({ kind, routeLockId }) => kind === "access-transit-lock" && routeLockId === route.id
);
const firstModule = simulation.world.accessModules.find(
    ({ id }) => id === simulation.world.sectors[0].accessModuleIds[0]
);
const backtrackConnector = simulation.world.connectors.find(
    ({ sourceLandmarkId }) => sourceLandmarkId === "sector-01:landmark:03"
);
const backtrackFocus = Object.freeze({ x: 400, y: backtrackConnector.start.y + 32 });
let cameraFocus = device.position;
simulation.players[0].physics.position.set(device.position.x + 180, device.position.y);

function completeObjective(objectiveId) {
    const objective = simulation.world.objectives.find(({ id }) => id === objectiveId);
    for (const requiredId of objective.requiredObjectiveIds ?? []) {
        if (!simulation.worldProgress.isObjectiveComplete(requiredId)) completeObjective(requiredId);
    }
    simulation.worldProgress.completeObjective(objectiveId);
}

function render() {
    const zoom = 0.72;
    const camera = {
        x: cameraFocus.x - innerWidth / zoom / 2,
        y: cameraFocus.y - innerHeight / zoom / 2,
        zoom,
        initialized: true
    };
    renderer.draw({
        ...simulation.snapshot(),
        camera,
        mobileView: innerWidth <= 900 && innerHeight <= 500,
        hudVisible: true,
        mobileControls: { visible: false }
    });
}

unlockButton.addEventListener("click", () => {
    for (const objectiveId of route.requiredObjectiveIds) completeObjective(objectiveId);
    for (const moduleId of simulation.world.sectors[0].accessModuleIds) {
        simulation.worldProgress.collectAccessModule(moduleId);
    }
    simulation.restoreWorldProgress(simulation.worldProgress.snapshot());
    unlockButton.textContent = "ACCESS READY";
    render();
});

focusButton.addEventListener("click", () => {
    cameraFocus = cameraFocus === device.position ? firstModule.position : device.position;
    focusButton.textContent = cameraFocus === device.position ? "Carrier 보기" : "경계 보기";
    render();
});

backtrackButton.addEventListener("click", () => {
    cameraFocus = backtrackFocus;
    simulation.players[0].physics.position.set(backtrackFocus.x, backtrackFocus.y - 48);
    focusButton.textContent = "경계 보기";
    render();
});

addEventListener("resize", render);
simulation.step(
    0,
    createPlayerCommand(
        {
            horizontal: 0,
            vertical: 0,
            pointer: { x: 0, y: 0, down: false },
            viewport: { width: innerWidth, height: innerHeight }
        },
        device.position
    )
);
render();
